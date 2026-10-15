import { NextResponse } from "next/server";
import { getAdminLang } from "@/lib/admin/lang";
import { getInboxUpdates, parseCursor } from "@/lib/admin/live";
import { isAdminRequest } from "@/lib/admin/session";

// Polling fallback for the event stream next door, used while it is down:
// the same update, as one JSON response.

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const now = new Date();
  const update = await getInboxUpdates(
    parseCursor(url.searchParams.get("since"), now),
    parseCursor(url.searchParams.get("floor"), now),
    await getAdminLang(),
  );
  return NextResponse.json(update, { headers: { "Cache-Control": "no-store" } });
}
