import { prisma } from "@/lib/prisma";
import { countUnread, quoteProductLine, quoteProductSummary, type UnreadCounts } from "./data";
import type { AdminLang } from "./i18n";

// Live dashboard updates: contact messages and quote requests saved after a
// point in time, plus the unread counts. Read by the event stream and the
// polling fallback (app/api/admin/events), which check the session first.

export type LiveItem =
  | { kind: "quote"; id: string; name: string; product: string; image: string | null; createdAt: string }
  | { kind: "message"; id: string; name: string; subject: string | null; createdAt: string };

export interface LiveUpdate {
  /** Pass back as `since` next time. */
  cursor: string;
  counts: UnreadCounts;
  /** Oldest first. */
  items: LiveItem[];
}

/**
 * How far before `since` each check looks again. A row's createdAt is set
 * before its insert commits, so a row can become visible slightly after a
 * newer one; the client drops ids it has already seen.
 */
const OVERLAP_MS = 5_000;
/** Reconnecting after a long gap doesn't replay more than this. */
const MAX_LOOKBACK_MS = 10 * 60_000;
const MAX_ITEMS = 20;

/** Parses a client cursor, clamped to [now - MAX_LOOKBACK_MS, now]. */
export function parseCursor(value: string | null | undefined, now = new Date()): Date {
  const time = value ? Date.parse(value) : NaN;
  if (!Number.isFinite(time)) return now;
  return new Date(Math.min(now.getTime(), Math.max(time, now.getTime() - MAX_LOOKBACK_MS)));
}

/**
 * Items created after `since` (with a short overlap), never older than `floor`:
 * the moment the page was loaded, whose list already showed anything older.
 */
export async function getInboxUpdates(since: Date, floor: Date, lang: AdminLang): Promise<LiveUpdate> {
  const now = new Date();
  const after = new Date(Math.max(since.getTime() - OVERLAP_MS, floor.getTime()));
  const createdAt = { gt: after };
  const [quotes, messages, counts] = await Promise.all([
    prisma.quoteRequest.findMany({
      where: { createdAt },
      orderBy: { createdAt: "desc" },
      take: MAX_ITEMS,
      include: { product: quoteProductSummary },
    }),
    prisma.contactMessage.findMany({
      where: { createdAt },
      orderBy: { createdAt: "desc" },
      take: MAX_ITEMS,
      select: { id: true, name: true, subject: true, createdAt: true },
    }),
    countUnread(),
  ]);

  const items: LiveItem[] = [
    ...quotes.map((q): LiveItem => {
      const product = quoteProductLine(q, lang);
      return {
        kind: "quote",
        id: q.id,
        name: q.name,
        product: product.name,
        image: product.image,
        createdAt: q.createdAt.toISOString(),
      };
    }),
    ...messages.map(
      (m): LiveItem => ({
        kind: "message",
        id: m.id,
        name: m.name,
        subject: m.subject,
        createdAt: m.createdAt.toISOString(),
      }),
    ),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return { cursor: now.toISOString(), counts, items };
}
