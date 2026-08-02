"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, HelpCircle, Home, Map, MapPin, Scan } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/kham-pha', label: 'Khám phá', icon: Compass },
    { href: '/quet-di-san', label: 'Quét di sản', icon: Scan },
    { href: '/thu-thach', label: 'Thử thách', icon: HelpCircle },
    { href: '/ban-do', label: 'Bản đồ', icon: Map },
    { href: '/dia-diem', label: 'Địa điểm', icon: MapPin },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-1 py-2">
      <nav className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-lg transition-colors ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 scale-110' : ''}`} />
              <span className="text-[9px] truncate max-w-[54px]">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
