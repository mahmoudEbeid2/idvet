"use client";

import { useEffect } from "react";
import { deleteInboxItem, markInboxRead } from "@/app/admin/actions";
import type { InboxKind } from "@/lib/admin/data";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";

/**
 * Marks the item read once its page has opened. Done from the client, through a
 * Server Action, so the sidebar's unread badge (in the layout) refreshes too.
 */
export function MarkRead({ kind, id, isRead }: { kind: InboxKind; id: string; isRead: boolean }) {
  useEffect(() => {
    if (!isRead) void markInboxRead(kind, id);
  }, [kind, id, isRead]);
  return null;
}

export function InboxDelete({ kind, id, label }: { kind: InboxKind; id: string; label: string }) {
  return <ConfirmDeleteButton label={label} onConfirm={() => deleteInboxItem(kind, id)} />;
}
