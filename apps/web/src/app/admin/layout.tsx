"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { StaffProfileContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<StaffProfileContract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isLoginPage = pathname === '/admin/dang-nhap';

  const checkAdminAuth = async () => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.getAdminProfile();
      setProfile(data);
    } catch {
      router.push('/admin/dang-nhap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await apiClient.logoutAdmin();
    } catch {}
    router.push('/admin/dang-nhap');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-slate-400">Đang xác thực phiên nhân sự Admin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminHeader profile={profile} onLogout={handleLogout} />
      <div className="flex flex-1">
        <AdminSidebar profile={profile} />
        <main className="flex-1 p-6 sm:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
