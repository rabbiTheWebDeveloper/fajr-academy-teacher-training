import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// The dev fallback is public (it's in the source), so a production deploy without
// JWT_SECRET would let anyone forge admin tokens — refuse to sign/verify in that case.
const JWT_SECRET = process.env.JWT_SECRET || "fajr_academy_dev_only_secret";
if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error("JWT_SECRET is not set — all logins will be rejected until it is configured.");
}
const secretKey = new TextEncoder().encode(JWT_SECRET);
const secretUsable = Boolean(process.env.JWT_SECRET) || process.env.NODE_ENV !== "production";

export async function signToken(payload) {
  if (!secretUsable) throw new Error("JWT_SECRET is not configured");
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifyToken(token) {
  if (!secretUsable || !token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}
