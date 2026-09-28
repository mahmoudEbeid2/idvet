"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import s from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "الأقسام" },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className={s.nav}>
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} onClick={onNavigate}>
            {link.label}
          </Link>
        );
      })}
      <a href="/ar/products" target="_blank" rel="noopener">
        عرض الموقع ↗
      </a>
      <form action={logout} className={s.navOut}>
        <button type="submit">تسجيل الخروج</button>
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
  return (
    <>
      <div className={s.mobileTop}>
        <Logo />
        <button type="button" aria-label="القائمة" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className={s.mobileNav} hidden={!open}>
        <Nav onNavigate={() => setOpen(false)} />
      </div>
      <div className={s.shell}>
        <aside className={s.side}>
          <div className={s.brand}>
            <Logo />
            <small>لوحة التحكم</small>
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
