import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/session";
import { missingEnv } from "@/lib/admin/token";
import { LoginForm } from "@/components/admin/LoginForm";
import s from "@/components/admin/admin.module.css";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  const missing = missingEnv();

  return (
    <div className={s.login}>
      <div className={s.loginBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/idvet-logo.svg" alt="IDVET" width={84} height={48} />
        <div>
          <h1>لوحة التحكم</h1>
          <p className={s.sub}>سجّل الدخول لإدارة المنتجات والأقسام والشهادات.</p>
        </div>
        {missing.length > 0 ? (
          <div className={`${s.notice} ${s.info} ${s.setup}`} role="status">
            <b>لوحة التحكم غير مُعدّة بعد.</b>
            <span>أضف هذه المتغيرات إلى ملف ‎.env‎ (أو إلى بيئة الحاوية) ثم أعد تشغيل التطبيق:</span>
            <pre>
              {missing
                .map((name) =>
                  name === "ADMIN_SESSION_SECRET"
                    ? "ADMIN_SESSION_SECRET=<32+ random characters>"
                    : name === "ADMIN_EMAIL"
                      ? "ADMIN_EMAIL=admin@idvet.co"
                      : "ADMIN_PASSWORD=<a strong password>",
                )
                .join("\n")}
            </pre>
            <span>
              لتوليد سرّ عشوائي: <code>openssl rand -base64 48</code>
            </span>
          </div>
        ) : (
          <LoginForm next={typeof next === "string" ? next : ""} />
        )}
      </div>
    </div>
  );
}
