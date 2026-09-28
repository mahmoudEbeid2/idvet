import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, createToken, verifyToken, type AdminConfig } from "./token";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Call first in every admin Server Action and page. proxy.ts guards /admin/*,
 * but a Server Action is reachable by anyone who can POST, so each one
 * re-checks the session itself.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** Session check for route handlers, from the raw request cookies. */
export function isAdminRequest(request: Request): boolean {
  const header = request.headers.get("cookie") ?? "";
  const match = header.split(/;\s*/).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return verifyToken(match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null);
}

export async function startSession(config: AdminConfig): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(config), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Upload route handlers are plain POST endpoints (no Server Action CSRF check),
 * so they compare Origin to the host the request was sent to.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim();
  return originHost === host;
}
