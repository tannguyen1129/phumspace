"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileCheck2, Users, ShieldAlert, Settings } from 'lucide-react';
import type { StaffProfileContract } from '@phumspace/contracts';

interface AdminSidebarProps {
  profile: StaffProfileContract;
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile.roles.includes('ADMIN');

  const navItems = [
    {
      label: 'Tổng quan Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Hàng đợi Kiểm duyệt',
      href: '/admin/dong-gop',
      icon: FileCheck2,
    },
    ...(isAdmin
      ? [
          {
            label: 'Security Sessions',
            href: '/admin/security',
            icon: ShieldAlert,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Quản trị Nhân sự
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <p className="font-bold text-slate-200">PhumSpace RBAC Mode</p>
        <p>Phiên xác thực HttpOnly Session độc lập.</p>
      </div>
    </aside>
  );
}
