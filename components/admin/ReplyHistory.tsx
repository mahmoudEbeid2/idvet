import type { Reply } from "@prisma/client";
import { formatAdminDate, type AdminLang, type AdminMessages } from "@/lib/admin/i18n";
import { textDir } from "@/lib/admin/replyKit";
import s from "./admin.module.css";

/** An item's replies, oldest first: emails with their status, and logged WhatsApp chats. */
export function ReplyHistory({ replies, lang, t }: { replies: Reply[]; lang: AdminLang; t: AdminMessages }) {
  if (!replies.length) return <p className={s.rowSub}>{t.reply.historyEmpty}</p>;
  return (
    <ol className={s.replies}>
      {replies.map((r) => (
        <li key={r.id} className={s.reply}>
          <div className={s.replyHead}>
            <b>{r.channel === "email" ? t.reply.viaEmail : t.reply.viaWhatsapp}</b>
            {r.channel === "email" &&
              (r.mailSent ? (
                <span className={`${s.badge} ${s.bGreen}`}>{t.reply.mailSent}</span>
              ) : (
                <span className={`${s.badge} ${s.bRed}`}>{t.reply.mailFailed}</span>
              ))}
            <span className={s.rowSub}>
              <span className={s.latin} dir="ltr">
                {r.channel === "whatsapp" ? `+${r.recipient}` : r.recipient}
              </span>{" "}
              · {t.reply.by} <span className={s.latin}>{r.sentBy}</span> ·{" "}
              <time dateTime={r.sentAt.toISOString()}>{formatAdminDate(r.sentAt, lang)}</time>
            </span>
          </div>
          {r.subject && (
            <p className={s.replySubject}>
              <bdi>{r.subject}</bdi>
            </p>
          )}
          <p className={s.msgBody} dir={textDir(r.body)}>
            {r.body}
          </p>
          {r.mailError && <p className={`${s.error} ${s.latin}`}>{r.mailError}</p>}
        </li>
      ))}
    </ol>
  );
}
