import Link from 'next/link';
import type { ScanResponseContract } from '@phumspace/contracts';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { ScanSourceList } from './scan-source-list';

interface SuggestResultProps {
  scanResponse: ScanResponseContract;
  onReset: () => void;
}

export function SuggestResult({ scanResponse, onReset }: SuggestResultProps) {
  const candidates = scanResponse.candidates || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
          <HelpCircle className="w-4 h-4" />
          <span>Gợi ý đối chiếu (SUGGEST)</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">
          Tìm thấy các di sản có đặc điểm tương đồng
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Hệ thống ghi nhận một số di sản trong PhumData có yếu tố thị giác tương đồng. Vui lòng chọn di sản phù hợp bên dưới để xem đối chiếu chi tiết.
        </p>
      </div>

      <div className="space-y-4">
        {candidates.map((cand, idx) => (
          <div
            key={cand.id}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Gợi ý #{idx + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-100">{cand.preferredViName}</h3>
                {cand.preferredKmName && (
                  <p className="text-sm font-khmer text-amber-400/90 font-medium">{cand.preferredKmName}</p>
                )}
              </div>

              <Link
                href={`/kham-pha/${cand.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex-shrink-0"
              >
                Chi tiết
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{cand.summary}</p>
          </div>
        ))}
      </div>

      <ScanSourceList sources={scanResponse.sources} />

      <div className="pt-4 border-t border-slate-800 text-center">
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          Quét tấm ảnh khác
        </button>
      </div>
    </div>
  );
}
