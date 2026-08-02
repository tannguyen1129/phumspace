"use client";

import Link from 'next/link';
import type { AdminContributionSummaryContract } from '@phumspace/contracts';
import { Eye, FileCheck2, Clock, UserCheck, Paperclip } from 'lucide-react';

interface ModerationQueueTableProps {
  items: AdminContributionSummaryContract[];
  onAssign: (publicId: string) => void;
}

export function ModerationQueueTable({ items, onAssign }: ModerationQueueTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">Mới gửi (SUBMITTED)</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Đang kiểm duyệt (UNDER_REVIEW)</span>;
      case 'NEEDS_MORE_INFORMATION':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">Cần bổ sung (NEEDS_INFO)</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Đã phê duyệt (APPROVED)</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Từ chối (REJECTED)</span>;
      case 'PUBLISHED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Đã xuất bản (PUBLISHED)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
        <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-xs text-slate-400">Không có bài đóng góp nào trong hàng đợi kiểm duyệt.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold">
            <th className="py-3.5 px-4">Mã Đóng góp</th>
            <th className="py-3.5 px-4">Tiêu đề bài viết</th>
            <th className="py-3.5 px-4">Loại đóng góp</th>
            <th className="py-3.5 px-4">Trạng thái</th>
            <th className="py-3.5 px-4">Media</th>
            <th className="py-3.5 px-4">Gán Reviewer</th>
            <th className="py-3.5 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {items.map((item) => (
            <tr key={item.publicId} className="hover:bg-slate-900/80 transition-colors">
              <td className="py-3.5 px-4 font-mono text-[11px] text-amber-400">
                {item.publicId.slice(0, 8)}...
              </td>
              <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-xs truncate">
                {item.title}
              </td>
              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                {item.contributionType}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                {getStatusBadge(item.status)}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Paperclip className="w-3 h-3" />
                  {item.mediaCount}
                </span>
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap text-[11px] font-mono">
                {item.assignedStaffEmail ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    {item.assignedStaffEmail.split('@')[0]}
                  </span>
                ) : (
                  <button
                    onClick={() => onAssign(item.publicId)}
                    className="px-2 py-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 font-bold transition-colors"
                  >
                    + Nhận review
                  </button>
                )}
              </td>
              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <Link
                  href={`/admin/dong-gop/${item.publicId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Thẩm định
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
