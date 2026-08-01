import type { HeritageEntityPublicContract } from '@phumspace/contracts';
import { VerificationBadge } from '../common/verification-badge';
import { MapPin, Tag } from 'lucide-react';

export function HeritageDetailHero({ entity }: { entity: HeritageEntityPublicContract }) {
  const preferredVi = entity.names.find((n) => n.language === 'vi' && n.nameType === 'PREFERRED')?.originalValue || entity.slug;
  const preferredKm = entity.names.find((n) => n.language === 'km')?.originalValue;
  const transliterationEn = entity.names.find((n) => n.nameType === 'TRANSLITERATION')?.originalValue;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-6 sm:p-10 space-y-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-amber-500 font-khmer text-8xl font-bold">
        {preferredKm || 'ភូមិ'}
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <VerificationBadge status="PUBLISHED" />
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            {entity.type}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
            {preferredVi}
          </h1>
          {preferredKm && (
            <p className="text-xl sm:text-2xl font-khmer text-amber-400 font-semibold">
              {preferredKm}
            </p>
          )}
          {transliterationEn && (
            <p className="text-sm text-slate-400 italic">
              Phiên âm / Transliteration: {transliterationEn}
            </p>
          )}
        </div>

        {/* Categories & Places info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
          {entity.categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>{entity.categories.map((c) => c.name).join(', ')}</span>
            </div>
          )}

          {entity.places.length > 0 && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{entity.places.map((p) => p.name).join(' • ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
