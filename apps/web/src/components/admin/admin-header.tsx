"use client";

import { LogOut, ShieldCheck, User } from 'lucide-react';
import type { StaffProfileContract } from '@phumspace/contracts';

interface AdminHeaderProps {
  profile: StaffProfileContract;
  onLogout: () => void;
}

export function AdminHeader({ profile, onLogout }: AdminHeaderProps) {
  const rolesBadge = profile.roles.join(', ');

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
          ADM
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-100">Bảng Quản trị PhumSpace</h2>
          <span className="text-[10px] text-amber-400 font-mono font-semibold">
            {rolesBadge} Mode
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-200">{profile.displayName || profile.email}</p>
          <p className="text-[10px] text-slate-400 font-mono">{profile.email}</p>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Đăng xuất khỏi Admin Session"
          type="button"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
