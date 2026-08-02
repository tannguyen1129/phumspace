"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PassportSummaryContract } from '@phumspace/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
import { PassportSummaryHeader } from '@/components/passport/passport-summary';
import { AchievementGrid } from '@/components/passport/achievement-grid';
import { ActivityTimeline } from '@/components/passport/activity-timeline';
import { Compass, HelpCircle, Loader2, RefreshCw, Scan } from 'lucide-react';

export default function PassportPage() {
  const [summary, setSummary] = useState<PassportSummaryContract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadPassport = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Ensure guest session cookie exists
      await apiClient.ensurePassportSession();
      // 2. Fetch passport summary
      const data = await apiClient.getPassport();
      setSummary(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Không thể tải thông tin Phum Passport. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassport();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-xs text-slate-400">Đang đồng bộ Phum Passport Guest Session...</p>
      </div>
    );
  }

  if (errorMsg || !summary) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs">
          {errorMsg || 'Không thể tải thông tin Passport.'}
        </div>
        <button
          onClick={loadPassport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-8 max-w-4xl mx-auto">
      {/* Header Summary */}
      <PassportSummaryHeader summary={summary} />

      {/* Quick Action CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/quet-di-san"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400">Quét di sản AI</h4>
            <p className="text-[11px] text-slate-400">Scan MATCH (+15 pt)</p>
          </div>
        </Link>

        <Link
          href="/thu-thach"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400">Thử thách Quiz</h4>
            <p className="text-[11px] text-slate-400">Hoàn thành (+10 pt)</p>
          </div>
        </Link>

        <Link
          href="/kham-pha"
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400">Khám phá tri thức</h4>
            <p className="text-[11px] text-slate-400">Tìm hiểu PhumData</p>
          </div>
        </Link>
      </div>

      {/* Achievement Grid */}
      <AchievementGrid achievements={summary.earnedAchievements} />

      {/* Activity Timeline */}
      <ActivityTimeline activities={summary.recentActivities} />
    </div>
  );
}
