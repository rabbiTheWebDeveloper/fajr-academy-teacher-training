import { randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing with Node's built-in scrypt (no extra dependency).
 * Stored format: "scrypt$<salt b64>$<key b64>".
 *
 * Accounts created before hashing existed still hold plain-text passwords;
 * verifyPassword() accepts those once and the login flow re-saves them hashed.
 */
const scrypt = promisify(scryptCb);
const PREFIX = "scrypt$";
const KEY_LEN = 64;

export function isHashedPassword(value) {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export async function hashPassword(plain) {
  const salt = randomBytes(16);
  const key = await scrypt(String(plain), salt, KEY_LEN);
  return `${PREFIX}${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(plain, stored) {
  if (!plain || !stored) return false;

  if (!isHashedPassword(stored)) {
    // Legacy plain-text record: constant-time compare.
    const a = Buffer.from(String(plain));
    const b = Buffer.from(String(stored));
    return a.length === b.length && timingSafeEqual(a, b);
  }

  const [, saltB64, keyB64] = stored.split("$");
  if (!saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const derived = await scrypt(String(plain), Buffer.from(saltB64, "base64"), expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Readable random password for accounts an admin creates (shown to the admin once). */
export function generatePassword(length = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[randomInt(alphabet.length)];
  return `${out}@${randomInt(10, 99)}`;
}

export const MIN_PASSWORD_LENGTH = 6;
