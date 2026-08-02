import Link from 'next/link';
import type { ScanResponseContract } from '@phumspace/contracts';
import { VerificationBadge } from '../common/verification-badge';
import { ScanSourceList } from './scan-source-list';
import { ArrowRight, CheckCircle2, Compass, Tag, MapPin } from 'lucide-react';

interface MatchResultProps {
  scanResponse: ScanResponseContract;
  onReset: () => void;
}

export function MatchResult({ scanResponse, onReset }: MatchResultProps) {
  const entity = scanResponse.matchedEntity;

  if (!entity) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác minh thành công (MATCH)</span>
          </div>

          <VerificationBadge label="PhumData Published" status="PUBLISHED" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">{entity.preferredViName}</h2>
          {entity.preferredKmName && (
            <p className="text-lg font-khmer text-amber-400 font-semibold">{entity.preferredKmName}</p>
          )}
        </div>

        {/* Categories & Places */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
          {entity.categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>{entity.categories.join(', ')}</span>
            </div>
          )}
          {entity.places.length > 0 && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{entity.places.join(' • ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Observational Features */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          Đặc điểm thị giác quan sát được từ ảnh
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {scanResponse.observationSummary.visibleFeatures.map((feat, idx) => (
            <span key={idx} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
              ✨ {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Published Summary & Meaning */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Thông tin tri thức đã công bố</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">{entity.summary}</p>
        {entity.culturalMeaning && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-200 space-y-1">
            <h4 className="font-semibold text-amber-400">Ý nghĩa văn hóa:</h4>
            <p className="leading-relaxed">{entity.culturalMeaning}</p>
          </div>
        )}
      </div>

      {/* Sources */}
      <ScanSourceList sources={scanResponse.sources} />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={onReset}
          className="px-5 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          Quét tấm ảnh khác
        </button>

        <Link
          href={`/kham-pha/${entity.slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          Xem chi tiết di sản đầy đủ
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
