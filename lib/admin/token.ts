import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Admin session token: "<expiresAt>.<signature>". The signature is an HMAC of
// the admin email, a hash of the password and the expiry, keyed with
// ADMIN_SESSION_SECRET — so changing the password or the secret signs
// everyone out. Only node:crypto here: proxy.ts imports this file.

export const SESSION_COOKIE = "idvet_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export const REQUIRED_ENV = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"] as const;

export interface AdminConfig {
  email: string;
  password: string;
  secret: string;
}

/** The admin credentials, or null when any env var is missing (or the secret is too short). */
export function adminConfig(): AdminConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!email || !password || !secret || secret.length < 32) return null;
  return { email, password, secret };
}

/** Env vars the login page tells the operator to add. */
export function missingEnv(): string[] {
  const missing: string[] = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length < 32 && !missing.includes("ADMIN_SESSION_SECRET")) {
    missing.push("ADMIN_SESSION_SECRET");
  }
  return missing;
}

function sign(config: AdminConfig, expiresAt: number): string {
  const passwordHash = createHash("sha256").update(config.password).digest("base64url");
  return createHmac("sha256", config.secret)
    .update(`${config.email.toLowerCase()}\n${passwordHash}\n${expiresAt}`)
    .digest("base64url");
}

export function createToken(config: AdminConfig, now = Date.now()): string {
  const expiresAt = Math.floor(now / 1000) + SESSION_MAX_AGE;
  return `${expiresAt}.${sign(config, expiresAt)}`;
}

export function verifyToken(token: string | undefined | null, now = Date.now()): boolean {
  const config = adminConfig();
  if (!config || !token) return false;
  const [expires, signature] = token.split(".");
  const expiresAt = Number(expires);
  if (!signature || !Number.isInteger(expiresAt) || expiresAt * 1000 < now) return false;
  return safeEqual(signature, sign(config, expiresAt));
}

/** Constant-time string comparison (hashes first so lengths never leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
