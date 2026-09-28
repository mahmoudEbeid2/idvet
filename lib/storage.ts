import path from "node:path";
import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

// Uploaded files live outside public/ (so they survive rebuilds and a Docker
// volume can hold them) and are served by app/uploads/[...path]/route.ts.
// The turbopackIgnore comments stop the build from tracing these dynamic paths
// and pulling the whole project into the standalone output.

export function uploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return configured
    ? path.resolve(/*turbopackIgnore: true*/ configured)
    : path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads");
}

/**
 * Absolute path for a stored relative path, or null when it would escape the
 * upload root (path traversal, absolute paths, drive letters, NUL bytes).
 */
export function resolveUpload(relative: string): string | null {
  if (!relative || relative.includes("\0") || path.isAbsolute(relative)) return null;
  const root = uploadRoot();
  const full = path.resolve(/*turbopackIgnore: true*/ root, relative);
  if (!full.startsWith(root + path.sep)) return null;
  return full;
}

/** Public URL of a stored file. */
export function uploadUrl(relative: string): string {
  return `/uploads/${relative}`;
}

/** Writes `data` under `folder` with a fresh random name and returns its relative path. */
export async function saveUpload(folder: string, extension: string, data: Buffer): Promise<string> {
  const relative = `${folder}/${randomUUID()}.${extension}`;
  const full = resolveUpload(relative);
  if (!full) throw new Error("Invalid upload path");
  await mkdir(path.dirname(/*turbopackIgnore: true*/ full), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ full, data);
  return relative;
}

/** Deletes a stored file; a file that is already gone is not an error. */
export async function deleteUpload(relative: string | null | undefined): Promise<void> {
  if (!relative) return;
  const full = resolveUpload(relative);
  if (!full) return;
  await unlink(/*turbopackIgnore: true*/ full).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

/** Deletes a whole folder (e.g. every file of one product). */
export async function deleteUploadFolder(relative: string): Promise<void> {
  const full = resolveUpload(relative);
  if (!full) return;
  await rm(/*turbopackIgnore: true*/ full, { recursive: true, force: true });
}

/** Stored relative path of an uploaded category icon URL, if it is one. */
export function uploadPathFromUrl(url: string): string | null {
  return url.startsWith("/uploads/") ? url.slice("/uploads/".length) : null;
}
