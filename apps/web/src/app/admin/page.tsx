"use client";

import { useEffect, useState } from 'react';
import type { StaffProfileContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { ShieldCheck, Users, FileCheck2, Lock, Clock, Sparkles } from 'lucide-react';

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState<StaffProfileContract | null>(null);

  useEffect(() => {
    apiClient.getAdminProfile().then(setProfile).catch(() => {});
  }, []);

  if (!profile) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          PhumSpace Admin Moderation Dashboard (Sprint 6B.1 Foundation)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Xin chào, {profile.displayName || profile.email}
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Hệ thống xác thực nhân sự OIDC &amp; phân quyền RBAC dựa trên vai trò (Reviewer / Editor / Admin) đã hoạt động. Trạng thái bảo mật được đồng bộ qua cookie HttpOnly <code className="text-amber-400">phum_admin_session</code>.
        </p>
      </div>

      {/* Staff Account Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Tài khoản Email</span>
          <p className="text-sm font-bold text-slate-100 font-mono truncate">{profile.email}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Vai trò RBAC được cấp</span>
          <p className="text-sm font-extrabold text-amber-400 font-mono">
            {profile.roles.join(', ')}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Hạn phiên Admin Session</span>
          <p className="text-xs font-bold text-emerald-400 font-mono">
            {new Date(profile.sessionExpiresAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Placeholder for Moderation Queue (Sprint 6B.2) */}
      <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed text-center space-y-4">
        <FileCheck2 className="w-12 h-12 text-amber-400/60 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-200">Hàng đợi Kiểm duyệt Đóng góp (Moderation Queue)</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Các tính năng duyệt bài đóng góp (Approve), yêu cầu bổ sung thông tin (Needs Info) và từ chối (Reject) sẽ được triển khai chính thức trong <span className="text-amber-400 font-semibold">Sprint 6B.2</span>.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          Nền móng RBAC Sprint 6B.1 đã sẵn sàng
        </div>
      </div>
    </div>
  );
}
