import type { MapMarkerContract } from '@phumspace/contracts';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

interface MapPlaceListProps {
  markers: MapMarkerContract[];
  selectedId: string | null;
  onSelect: (marker: MapMarkerContract) => void;
}

export function MapPlaceList({ markers, selectedId, onSelect }: MapPlaceListProps) {
  if (markers.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
        Không có địa điểm di sản nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Danh sách Địa điểm ({markers.length})
      </h3>
      <div className="space-y-2.5">
        {markers.map((marker) => {
          const isSelected = selectedId === marker.id;
          return (
            <div
              key={marker.id}
              onClick={() => onSelect(marker)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/80 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {marker.placeType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{marker.name}</h4>
                  {marker.address && <p className="text-[11px] text-slate-400">📍 {marker.address}</p>}
                </div>

                <Link
                  href={`/dia-diem/${marker.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors flex-shrink-0"
                  title="Chi tiết địa điểm"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
