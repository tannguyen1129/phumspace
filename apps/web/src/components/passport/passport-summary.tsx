import Link from 'next/link';
import { Award, Sparkles, Activity, Clock, Plus } from 'lucide-react';
import type { PassportSummaryContract } from '@phumspace/contracts';

interface PassportSummaryProps {
  summary: PassportSummaryContract;
}

export function PassportSummaryHeader({ summary }: PassportSummaryProps) {
  const createdDate = new Date(summary.createdAt).toLocaleDateString('vi-VN');

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-amber-500/20">
            PS
          </div>
          <div>
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Phum Passport Guest Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Hành trình Di sản Văn hóa
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4 text-amber-400" />
            Tham gia: {createdDate}
          </div>

          <Link
            href="/dong-gop/moi"
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Đóng góp tư liệu
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-medium text-slate-400">Tổng điểm văn hóa</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 font-mono">{summary.totalPoints}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-medium text-slate-400">Huy hiệu thành tựu</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold text-slate-100 font-mono">{summary.achievementCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-medium text-slate-400">Lượt hoạt động</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold text-slate-100 font-mono">{summary.activityCount}</p>
        </div>
      </div>
    </div>
  );
}
