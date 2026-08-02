import Link from 'next/link';
import { Clock, FileText, ChevronRight, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ContributionSummaryContract } from '@phumspace/contracts';

interface ContributionCardProps {
  item: ContributionSummaryContract;
}

export function ContributionCard({ item }: ContributionCardProps) {
  const dateStr = new Date(item.createdAt).toLocaleDateString('vi-VN');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Đã gửi (Chờ duyệt)
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin" />
            Đang thẩm định
          </span>
        );
      case 'NEEDS_MORE_INFORMATION':
        return (
          <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Cần bổ sung
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Đã phê duyệt
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
            Đã rút
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
            Bản thảo
          </span>
        );
    }
  };

  return (
    <Link
      href={`/dong-gop/${item.publicId}`}
      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 group"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {getStatusBadge(item.status)}
          <span className="text-[11px] text-slate-500 font-mono">{dateStr}</span>
        </div>

        <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
          {item.title}
        </h3>

        {item.mediaCount > 0 && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            {item.mediaCount} tệp phương tiện đính kèm
          </span>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
