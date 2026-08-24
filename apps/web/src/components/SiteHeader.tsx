"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, Map, Menu, ScanLine, User, X } from "lucide-react";

const links = [
  { href: "/", label: "Khám phá", icon: Map, exact: true },
  { href: "/festivals", label: "Lễ hội", icon: CalendarDays },
  { href: "/handbook", label: "Cẩm nang", icon: BookOpen },
  { href: "/scan", label: "AI Scanner", icon: ScanLine },
];
export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return <header className="site-header"><div className="site-header__inner">
    <Link href="/" className="site-brand" aria-label="PhumSpace — trang chủ"><span className="site-brand__mark" aria-hidden="true">ភ</span><span><strong>PhumSpace</strong><small>Khmer Nam Bộ</small></span></Link>
    <button className="site-menu-button" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X size={22} /> : <Menu size={22} />}<span className="visually-hidden">{open ? "Đóng menu" : "Mở menu"}</span></button>
    <nav id="site-navigation" className="site-navigation" data-open={open} aria-label="Điều hướng chính">{links.map(({ href, label, icon: Icon, exact }) => { const active = exact ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={17} />{label}</Link>; })}</nav>
    <Link href="/me" className="site-account" aria-label="Tài khoản của tôi" aria-current={pathname.startsWith("/me") ? "page" : undefined}><User size={18} /><span>Tài khoản</span></Link>
  </div></header>;
}
