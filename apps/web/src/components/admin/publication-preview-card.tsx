"use client";

import type { AdminPublicationPlanContract } from '@phumspace/contracts';
import { Eye, ShieldCheck, Tag, BookOpen } from 'lucide-react';

interface PublicationPreviewCardProps {
  plan: AdminPublicationPlanContract;
}

export function PublicationPreviewCard({ plan }: PublicationPreviewCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          Màn hình Xem trước Công bố PhumData (Live Preview)
        </h4>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">
          {plan.verificationOutcome}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Tên Di sản</span>
          <p className="text-base font-extrabold text-slate-100">{plan.preferredViName || 'Chưa nhập tên'}</p>
          {plan.preferredKmName && (
            <p className="text-xs text-amber-400 font-semibold">{plan.preferredKmName}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div>
            <span className="text-slate-500">Mã: </span>
            <span className="text-slate-200 font-bold">{plan.canonicalCode || 'canonical-code'}</span>
          </div>
          <div>
            <span className="text-slate-500">Loại: </span>
            <span className="text-slate-200 font-bold">{plan.entityType}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Mô tả Tóm tắt</span>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {plan.summary || 'Chưa có nội dung tóm tắt.'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Thao tác sẽ tự động tạo SourceResource, EvidenceAssertion &amp; PublicationEvent trong PhumData Core.
        </div>
      </div>
    </div>
  );
}
