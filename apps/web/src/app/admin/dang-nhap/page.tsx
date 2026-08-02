"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api-client';
import { ShieldCheck, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [testEmail, setTestEmail] = useState<string>('admin.test@phumspace.vn');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // In local dev/test, use mock ID token format
      const mockIdToken = `mock-google-id-token-${testEmail.trim().toLowerCase()}`;
      await apiClient.loginAdmin(mockIdToken);
      router.push('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-100">Đăng nhập Nhân sự PhumSpace</h1>
          <p className="text-xs text-slate-400">
            Hệ thống quản trị di sản dành riêng cho Ban Quản trị &amp; Kiểm duyệt viên
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Email Google Nhân sự (Allowlist)
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="nhansu@phumspace.vn"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-extrabold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xác thực OIDC...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Đăng nhập bằng Google OIDC
              </>
            )}
          </button>
        </form>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">Lưu ý phân quyền RBAC:</p>
          <p>Tài khoản chưa được khởi tạo (provision) trong DB sẽ bị từ chối truy cập.</p>
        </div>
      </div>
    </div>
  );
}
