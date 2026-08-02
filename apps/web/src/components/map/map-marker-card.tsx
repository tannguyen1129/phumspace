import Link from 'next/link';
import type { MapMarkerContract } from '@phumspace/contracts';
import { ArrowRight, MapPin, X } from 'lucide-react';

interface MapMarkerCardProps {
  marker: MapMarkerContract;
  onClose: () => void;
}

export function MapMarkerCard({ marker, onClose }: MapMarkerCardProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-30 p-5 rounded-2xl bg-slate-950/95 border border-amber-500/40 backdrop-blur-xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-400">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {marker.placeType}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-100">{marker.name}</h3>
        {marker.address && <p className="text-xs text-slate-400">📍 {marker.address}</p>}
      </div>

      {marker.shortDescription && (
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
          {marker.shortDescription}
        </p>
      )}

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-amber-400/90 font-medium">
          {marker.relatedHeritageCount > 0
            ? `🏛️ ${marker.relatedHeritageCount} di sản gắn liền`
            : 'Địa điểm di sản công bố'}
        </span>

        <Link
          href={`/dia-diem/${marker.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
        >
          Chi tiết
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
