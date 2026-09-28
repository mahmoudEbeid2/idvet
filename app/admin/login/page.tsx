import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/session";
import { missingEnv } from "@/lib/admin/token";
import { getAdminT } from "@/lib/admin/lang";
import { AdminLangSwitch } from "@/components/admin/AdminLang";
import { LoginForm } from "@/components/admin/LoginForm";
import s from "@/components/admin/admin.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getAdminT()).login.pageTitle };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  const missing = missingEnv();
  const t = await getAdminT();

  return (
    <div className={s.login}>
      <div className={s.loginBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/idvet-logo.svg" alt="IDVET" width={84} height={48} />
        <div>
          <h1>{t.login.title}</h1>
          <p className={s.sub}>{t.login.sub}</p>
        </div>
        {missing.length > 0 ? (
          <div className={`${s.notice} ${s.info} ${s.setup}`} role="status">
            <b>{t.login.notConfigured}</b>
            <span>{t.login.addVars}</span>
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
              {t.login.genSecret} <code>openssl rand -base64 48</code>
            </span>
          </div>
        ) : (
          <LoginForm next={typeof next === "string" ? next : ""} />
        )}
        <div className={s.loginLang}>
          <AdminLangSwitch />
        </div>
      </div>
    </div>
  );
}
