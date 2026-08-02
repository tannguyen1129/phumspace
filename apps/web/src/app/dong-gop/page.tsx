"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ContributionSummaryContract } from '@phumspace/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
import { ContributionCard } from '@/components/contribution/contribution-card';
import { Plus, ShieldCheck, Loader2, RefreshCw, FolderPlus } from 'lucide-react';

export default function ContributionsPage() {
  const [items, setItems] = useState<ContributionSummaryContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadContributions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await apiClient.ensurePassportSession();
      const res = await apiClient.getMyContributions(1, 20);
      setItems(res.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Không thể tải danh sách đóng góp. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-xs text-slate-400">Đang truy vấn danh sách đóng góp của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            Hàng đợi Kiểm duyệt PhumSpace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Đóng góp Tri thức Văn hóa
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chung tay đóng góp câu chuyện, phát âm, từ ngữ Khmer hoặc đính chính thông tin di sản. Mọi thông tin đóng góp đều được kiểm duyệt chặt chẽ bởi các chuyên gia trước khi xuất bản.
          </p>
        </div>

        <Link
          href="/dong-gop/moi"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 hover:opacity-95 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo đóng góp mới
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadContributions} className="text-amber-400 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      {/* Contributions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Lịch sử Đóng góp của bạn</h2>

        {items.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
            <FolderPlus className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Chưa có đóng góp nào</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy là người tiếp theo gửi tư liệu hình ảnh, ghi âm câu chuyện dân gian hoặc đính chính tên gọi di sản cho PhumSpace.
              </p>
            </div>
            <Link
              href="/dong-gop/moi"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo đóng góp đầu tiên
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <ContributionCard key={item.publicId} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
