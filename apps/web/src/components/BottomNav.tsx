"use client";

import { usePathname } from "next/navigation";
import { useEffect,useState } from "react";
import { Compass, Map as MapIcon, ScanLine, Sparkles, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { BOTTOM_NAV_TABS, type BottomNavTab } from "@phumspace/ui";
import { getBottomNavHref, getBottomNavLabel, isBottomNavTabActive } from "../lib/navigation";

const TAB_ICONS: Record<BottomNavTab, LucideIcon> = {
  explore: Compass,
  map: MapIcon,
  scan: ScanLine,
  me: User,
};

/**
 * Bottom navigation toi da 4 tab (UX-V11-07): Kham pha / Ban do / Quet / Toi.
 * Festival/Su kien nam trong Kham pha va Map layer thay vi co tab rieng (UX Flow).
 */
export function BottomNav() {
  const pathname = usePathname();
  const [locale,setLocale]=useState("vi");
  useEffect(()=>{setLocale(localStorage.getItem("ps_locale")??"vi");const update=(event:Event)=>setLocale((event as CustomEvent<string>).detail);window.addEventListener("phumspace:locale",update);return()=>window.removeEventListener("phumspace:locale",update)},[]);
  const enLabels:Record<BottomNavTab,string>={explore:"Explore",map:"Map",scan:"Scan",me:"Me"};

  return (
    <nav className="ps-nav" aria-label={locale==="en"?"Main navigation":"Điều hướng chính"}>
      <Link href="/" className="ps-nav__brand" aria-label={locale==="en"?"PhumSpace — Explore home":"PhumSpace — về trang Khám phá"}>
        <span className="ps-nav__mark" aria-hidden="true">ភ</span>
        <span className="ps-nav__brand-copy">
          <strong>PhumSpace</strong>
          <span>Khmer Nam Bộ</span>
        </span>
      </Link>
      {BOTTOM_NAV_TABS.map((tab) => {
        const href = getBottomNavHref(tab);
        const active = isBottomNavTabActive(tab, pathname ?? "/");
        const Icon = TAB_ICONS[tab];
        return (
          <Link
            key={tab}
            href={href}
            aria-current={active ? "page" : undefined}
            className="ps-nav__link"
          >
            <Icon size={22} aria-hidden="true" />
            {locale==="en"?enLabels[tab]:getBottomNavLabel(tab)}
          </Link>
        );
      })}
      <div className="ps-nav__footer">
        <Sparkles size={14} aria-hidden="true" style={{ marginBottom: 6, color: "var(--color-heritage-gold)" }} />
        {locale==="en"?"Sourced knowledge, responsible experiences.":"Tri thức có nguồn, trải nghiệm có trách nhiệm."}
      </div>
    </nav>
  );
}
