"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import type { ContributionDetailContract } from '@phumspace/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  History,
} from 'lucide-react';

export default function ContributionDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const [detail, setDetail] = useState<ContributionDetailContract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadDetail = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await apiClient.ensurePassportSession();
      const data = await apiClient.getContributionDetail(publicId);
      setDetail(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Không thể tải thông tin đóng góp. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [publicId]);

  const handleWithdraw = async () => {
    if (!confirm('Bạn có chắc chắn muốn rút đóng góp này khỏi hàng đợi kiểm duyệt?')) return;
    setActionLoading(true);
    try {
      const updated = await apiClient.withdrawContribution(publicId);
      setDetail(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert('Không thể rút đóng góp. Vui lòng thử lại.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-xs text-slate-400">Đang truy vấn bản đóng góp...</p>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs">
          {errorMsg || 'Không tìm thấy đóng góp.'}
        </div>
        <Link
          href="/dong-gop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const isWithdrawAllowed = ['DRAFT', 'SUBMITTED', 'NEEDS_MORE_INFORMATION'].includes(detail.status);

  return (
    <div className="py-8 space-y-8 max-w-3xl mx-auto">
      <Link
        href="/dong-gop"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách đóng góp
      </Link>

      {/* Header Info */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
            {detail.status}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Ngày tạo: {new Date(detail.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-100">{detail.title}</h1>
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{detail.description}</p>

        {isWithdrawAllowed && (
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleWithdraw}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              type="button"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Rút đóng góp
            </button>
          </div>
        )}
      </div>

      {/* Media Attachments */}
      {detail.media && detail.media.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Tệp Phương tiện Đính kèm ({detail.media.length})
          </h3>
          <div className="space-y-2">
            {detail.media.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-200">{m.originalFileName}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(m.sizeBytes / 1024 / 1024).toFixed(2)} MB ({m.mediaType})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status History Timeline */}
      {detail.statusHistory && detail.statusHistory.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            Nhật ký Tiến trình Kiểm duyệt
          </h3>
          <div className="space-y-3">
            {detail.statusHistory.map((h, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{h.toStatus}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (từ {h.fromStatus})
                    </span>
                  </div>
                  {h.publicMessage && (
                    <p className="text-slate-300 text-[11px]">{h.publicMessage}</p>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                  {new Date(h.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
