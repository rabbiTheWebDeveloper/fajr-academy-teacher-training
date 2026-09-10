import mongoose from "mongoose";
import dns from "node:dns";

// Fix Node.js DNS resolution on Windows / local ISPs
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {
  // Ignore
}

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;

if (!MONGODB_URI) {
  console.warn("⚠️ MONGODB_CONNECTION_STRING is not defined in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Resolves mongodb+srv URI to a direct replica-set connection string using explicit public DNS
 */
async function resolveDirectMongoUri(srvUri) {
  try {
    const parsed = new URL(srvUri.replace("mongodb+srv://", "http://"));
    const username = decodeURIComponent(parsed.username || "");
    const password = decodeURIComponent(parsed.password || "");
    const host = parsed.hostname;
    const pathname = parsed.pathname || "/fajrtraining";
    const searchParams = parsed.searchParams;

    const resolver = new dns.promises.Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

    const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
    if (!srvRecords || srvRecords.length === 0) {
      throw new Error("No SRV records found");
    }

    const hostList = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
    const authPart = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : "";

    searchParams.set("ssl", "true");
    searchParams.set("authSource", "admin");
    searchParams.set("retryWrites", "true");
    searchParams.set("w", "majority");

    return `mongodb://${authPart}${hostList}${pathname}?${searchParams.toString()}`;
  } catch (err) {
    console.warn("Failed to resolve direct Mongo URI fallback:", err.message);
    return null;
  }
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    try {
      dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    } catch {}

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    cached.promise = (async () => {
      try {
        const client = await mongoose.connect(MONGODB_URI, opts);
        console.log("✅ MongoDB connected");
        return client;
      } catch (err) {
        if (err.code === "ECONNREFUSED" || err.message?.includes("querySrv")) {
          console.warn("⚠️ DNS SRV query failed, attempting direct replica set fallback...");
          const directUri = await resolveDirectMongoUri(MONGODB_URI);
          if (directUri) {
            const client = await mongoose.connect(directUri, opts);
            console.log("✅ MongoDB connected via fallback resolver");
            return client;
          }
        }
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }

  return cached.conn;
}
