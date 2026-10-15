import { onInboxChange } from "@/lib/admin/inboxEvents";
import { getAdminLang } from "@/lib/admin/lang";
import { getInboxUpdates, parseCursor } from "@/lib/admin/live";
import { isAdminRequest } from "@/lib/admin/session";

// Server-Sent Events for the dashboard (components/admin/live): an "update"
// event with the unread counts and any new messages / quote requests, right
// after one is saved (lib/admin/inboxEvents.ts) and every CHECK_MS anyway —
// which also keeps the connection from idling out. Outside proxy.ts's matcher,
// so the session is checked here, and again on every check.

/** Periodic check; also the only path for rows saved by another process. */
const CHECK_MS = 10_000;

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return new Response("Unauthorized", { status: 401 });
  const lang = await getAdminLang();
  const url = new URL(request.url);
  const now = new Date();
  const floor = parseCursor(url.searchParams.get("floor"), now);
  // On an automatic reconnect the browser sends the last event's id: its cursor.
  let since = parseCursor(request.headers.get("last-event-id") ?? url.searchParams.get("since"), now);

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let running = false;
      let again = false;

      const send = (event: string, data: unknown, id?: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${id ? `id: ${id}\n` : ""}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          close();
        }
      };

      const check = async () => {
        if (closed) return;
        if (running) {
          again = true;
          return;
        }
        running = true;
        try {
          if (!isAdminRequest(request)) {
            // The session expired while the page was open.
            send("logout", {});
            close();
            return;
          }
          const update = await getInboxUpdates(since, floor, lang);
          since = new Date(update.cursor);
          send("update", update, update.cursor);
        } catch (error) {
          console.error("[admin events] check failed:", error);
        } finally {
          running = false;
          if (again) {
            again = false;
            void check();
          }
        }
      };

      const timer = setInterval(check, CHECK_MS);
      const unsubscribe = onInboxChange(() => void check());

      function close() {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        unsubscribe();
        request.signal.removeEventListener("abort", close);
        try {
          controller.close();
        } catch {
          // Already closed by the client.
        }
      }

      cleanup = close;
      request.signal.addEventListener("abort", close);
      // Reconnect delay the browser uses if the connection drops.
      controller.enqueue(encoder.encode("retry: 5000\n\n"));
      void check();
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      // no-transform: compression would buffer the events.
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
