import Link from 'next/link';
import type { HeritageEntityPublicContract } from '@phumspace/contracts';
import { ArrowRight, MapPin, Tag } from 'lucide-react';

export function HeritageCard({ entity }: { entity: HeritageEntityPublicContract }) {
  const preferredVi = entity.names.find((n) => n.language === 'vi' && n.nameType === 'PREFERRED')?.originalValue || entity.slug;
  const preferredKm = entity.names.find((n) => n.language === 'km')?.originalValue;

  return (
    <article className="group flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-md hover:border-amber-500/40 hover:bg-slate-900 transition-all">
      <div className="space-y-3">
        {/* Category & Type badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold tracking-wide uppercase">
            {entity.type}
          </span>
          {entity.categories.slice(0, 2).map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]"
            >
              <Tag className="w-3 h-3 text-slate-400" />
              {cat.name}
            </span>
          ))}
        </div>

        {/* Heritage Title */}
        <div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
            {preferredVi}
          </h3>
          {preferredKm && (
            <p className="text-sm font-khmer text-amber-400/90 font-medium mt-0.5">
              {preferredKm}
            </p>
          )}
        </div>

        {/* Summary Description */}
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
          {entity.summary}
        </p>
      </div>

      {/* Footer Info & Link */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        {entity.places && entity.places.length > 0 ? (
          <div className="flex items-center gap-1 text-xs text-slate-400 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">{entity.places[0].name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Trà Vinh</span>
        )}

        <Link
          href={`/kham-pha/${entity.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors"
        >
          Chi tiết
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
