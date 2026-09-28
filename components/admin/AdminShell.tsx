"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { AdminLangSwitch, useAdminLang, useAdminT } from "./AdminLang";
import s from "./admin.module.css";

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useAdminT();
  const lang = useAdminLang();
  const links = [
    { href: "/admin", label: t.nav.home },
    { href: "/admin/products", label: t.nav.products },
    { href: "/admin/categories", label: t.nav.categories },
  ];
  return (
    <nav className={s.nav}>
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} onClick={onNavigate}>
            {link.label}
          </Link>
        );
      })}
      <a href={`/${lang}/products`} target="_blank" rel="noopener">
        {t.nav.viewSite}
      </a>
      <form action={logout} className={s.navOut}>
        <button type="submit">{t.nav.logout}</button>
      </form>
    </nav>
  );
}

function Logo() {
  return (
    <span className={s.logo}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/idvet-logo.svg" alt="IDVET" width={49} height={28} />
    </span>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useAdminT();
  return (
    <>
      <div className={s.mobileTop}>
        <Logo />
        <button type="button" aria-label={t.nav.menu} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className={s.mobileNav} hidden={!open}>
        <div className={s.sideLang}>
          <AdminLangSwitch />
        </div>
        <Nav onNavigate={() => setOpen(false)} />
      </div>
      <div className={s.shell}>
        <aside className={s.side}>
          <div className={s.brand}>
            <Logo />
            <small>{t.nav.panel}</small>
          </div>
          <div className={s.sideLang}>
            <AdminLangSwitch />
          </div>
          <Nav />
        </aside>
        <main className={s.main}>
          <div className={s.container}>{children}</div>
        </main>
      </div>
    </>
  );
}
