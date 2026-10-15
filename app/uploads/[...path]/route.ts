import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { Readable } from "node:stream";
import sharp from "sharp";
import { resolveUpload } from "@/lib/storage";
import { safeDecode } from "@/lib/catalog/format";

// Serves files from UPLOAD_DIR. Stored names are random UUIDs that are never
// reused, so responses can be cached forever.
// `?format=jpg` returns an image as a 600px-wide JPEG, for notification emails
// (Outlook doesn't display the WebP files the uploads are stored as).

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

  const url = new URL(request.url);
  if (url.searchParams.get("format") === "jpg" && type.startsWith("image/")) {
    const jpeg = await sharp(await readFile(/*turbopackIgnore: true*/ file))
      .resize({ width: 600, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
      .catch(() => null);
    if (!jpeg) return notFound();
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(jpeg.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const headers = new Headers({
    "Content-Type": type,
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  if (type === "application/pdf") {
    const download = url.searchParams.has("download");
    headers.set("Content-Disposition", download ? "attachment" : "inline");
  }

  const stream = Readable.toWeb(createReadStream(/*turbopackIgnore: true*/ file)) as ReadableStream;
  return new Response(stream, { headers });
}
