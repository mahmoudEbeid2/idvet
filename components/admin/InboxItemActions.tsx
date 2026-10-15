"use client";

import { useEffect } from "react";
import { deleteMessage, deleteQuote, markMessageRead, markQuoteRead } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";

type Kind = "message" | "quote";

/**
 * Marks the item read once its page has opened. Done from the client, through a
 * Server Action, so the sidebar's unread badge (in the layout) refreshes too.
 */
export function MarkRead({ kind, id, unread }: { kind: Kind; id: string; unread: boolean }) {
  useEffect(() => {
    if (unread) void (kind === "quote" ? markQuoteRead(id) : markMessageRead(id));
  }, [kind, id, unread]);
  return null;
}

export function InboxDelete({ kind, id, label }: { kind: Kind; id: string; label: string }) {
  return <ConfirmDeleteButton label={label} onConfirm={() => (kind === "quote" ? deleteQuote(id) : deleteMessage(id))} />;
}
