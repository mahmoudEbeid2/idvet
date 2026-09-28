import { isAdminRequest, isSameOrigin } from "./session";

export function jsonError(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Shared checks for the upload route handlers: a valid admin session, a
 * same-origin request, and a Content-Length under `maxBytes` (+1MB for the
 * multipart envelope and text fields) before the body is read.
 */
export function guardUpload(request: Request, maxBytes: number): Response | null {
  if (!isAdminRequest(request)) return jsonError("انتهت الجلسة. سجّل الدخول مرة أخرى.", 401);
  if (!isSameOrigin(request)) return jsonError("طلب غير مسموح.", 403);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes + 1024 * 1024) return jsonError(`الملف أكبر من ${maxBytes / (1024 * 1024)}MB.`, 413);
  return null;
}
