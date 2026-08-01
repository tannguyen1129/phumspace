import Link from 'next/link';
import type { PlacePublicContract } from '@phumspace/contracts';
import { ArrowRight, MapPin } from 'lucide-react';

export function PlaceCard({ place }: { place: PlacePublicContract }) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-slate-800 p-6 shadow-md hover:border-amber-500/40 hover:bg-slate-900 transition-all">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <MapPin className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Địa điểm di sản</span>
        </div>

        <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
          {place.name}
        </h3>

        {place.address && (
          <p className="text-xs text-slate-400 font-medium">
            📍 {place.address}
          </p>
        )}

        {place.summary && (
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {place.summary}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        {place.latitude && place.longitude ? (
          <span className="text-[11px] font-mono text-slate-500">
            {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">Trà Vinh</span>
        )}

        <Link
          href={`/dia-diem/${place.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors"
        >
          Xem chi tiết
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
