import { isAdminRequest, isSameOrigin } from "./session";
import type { AdminMessages } from "./i18n";

export function jsonError(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Shared checks for the upload route handlers: a valid admin session, a
 * same-origin request, and a Content-Length under `maxBytes` (+1MB for the
 * multipart envelope and text fields) before the body is read.
 */
export function guardUpload(request: Request, maxBytes: number, t: AdminMessages): Response | null {
  if (!isAdminRequest(request)) return jsonError(t.errors.sessionExpired, 401);
  if (!isSameOrigin(request)) return jsonError(t.errors.forbidden, 403);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes + 1024 * 1024) return jsonError(t.errors.tooBig(maxBytes / (1024 * 1024)), 413);
  return null;
}
