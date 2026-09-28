import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { resolveUpload } from "@/lib/storage";
import { safeDecode } from "@/lib/catalog/format";

// Serves files from UPLOAD_DIR. Stored names are random UUIDs that are never
// reused, so responses can be cached forever.

const TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
};

function notFound() {
  return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path.map(safeDecode);
  if (segments.some((s) => !s || s === "." || s === ".." || /[\\/\0]/.test(s))) return notFound();

  const type = TYPES[segments.at(-1)!.split(".").pop()!.toLowerCase()];
  const file = resolveUpload(segments.join("/"));
  if (!type || !file) return notFound();

  const info = await stat(/*turbopackIgnore: true*/ file).catch(() => null);
  if (!info?.isFile()) return notFound();

  const headers = new Headers({
    "Content-Type": type,
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  if (type === "application/pdf") {
    const download = new URL(request.url).searchParams.has("download");
    headers.set("Content-Disposition", download ? "attachment" : "inline");
  }

  const stream = Readable.toWeb(createReadStream(/*turbopackIgnore: true*/ file)) as ReadableStream;
  return new Response(stream, { headers });
}
