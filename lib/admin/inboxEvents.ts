import { EventEmitter } from "node:events";

// In-process signal that a contact message or quote request was just saved, so
// open dashboard streams (app/api/admin/events) look for it right away instead
// of at their next periodic check. It carries no data: the streams read the
// new rows from the database themselves, which also covers rows saved by
// another process. On globalThis so every route bundle shares one emitter.

const globalForInbox = globalThis as unknown as { inboxEvents?: EventEmitter };
const emitter = (globalForInbox.inboxEvents ??= new EventEmitter().setMaxListeners(0));

export function notifyInbox(): void {
  emitter.emit("change");
}

/** Calls `listener` on every notifyInbox(); returns the unsubscribe function. */
export function onInboxChange(listener: () => void): () => void {
  emitter.on("change", listener);
  return () => emitter.off("change", listener);
}
