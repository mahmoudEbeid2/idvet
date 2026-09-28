// In-memory login throttle. Enough for one app container; it resets on
// restart, which only ever makes it more lenient.

const WINDOW_MS = 15 * 60 * 1000;
const PER_IP = 5;
const GLOBAL = 30; // caps guessing from many IPs at once

const buckets = new Map<string, { count: number; resetAt: number }>();

function bucket(key: string, now: number) {
  let entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, entry);
  }
  return entry;
}

/** Minutes until `ip` may try again, or 0 when a login attempt is allowed. */
export function loginBlockedFor(ip: string, now = Date.now()): number {
  const blocking = [bucket(`ip:${ip}`, now), bucket("global", now)].find(
    (entry, i) => entry.count >= (i === 0 ? PER_IP : GLOBAL),
  );
  return blocking ? Math.ceil((blocking.resetAt - now) / 60000) : 0;
}

export function recordLoginFailure(ip: string, now = Date.now()): void {
  bucket(`ip:${ip}`, now).count++;
  bucket("global", now).count++;
  if (buckets.size > 10_000) {
    for (const [key, entry] of buckets) if (entry.resetAt <= now) buckets.delete(key);
  }
}

export function clearLoginFailures(ip: string): void {
  buckets.delete(`ip:${ip}`);
}

/** Client IP: Traefik overwrites X-Forwarded-For, so its first entry is the client. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
