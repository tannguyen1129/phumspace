"use client";
import { MapPin } from "lucide-react";
import type { PlaceSummary } from "../../lib/api-client";

export function HeritageMap({ places, selectedId, onSelect }: { places: PlaceSummary[]; selectedId?: string; onSelect: (id: string) => void }) {
  const bounds = getBounds(places);
  return <div className="heritage-map" role="application" aria-label="Bản đồ địa điểm văn hóa Trà Vinh">
    <div className="heritage-map__water" aria-hidden="true" />
    <span className="heritage-map__label heritage-map__label--city">TRÀ VINH</span>
    <span className="heritage-map__label heritage-map__label--region">Không gian văn hóa Khmer Nam Bộ</span>
    {places.map((place, index) => {
      const position = project(place.latitude, place.longitude, bounds, index, places.length);
      const selected = selectedId === place.entityId;
      return <button key={place.entityId} type="button" className="heritage-map__marker" style={position} aria-pressed={selected} aria-label={`${place.preferredLabel}, ${place.administrativeArea}`} onClick={() => onSelect(place.entityId)}><MapPin size={selected ? 27 : 22} fill="currentColor" /><span>{place.preferredLabel}</span></button>;
    })}
    <div className="heritage-map__legend"><MapPin size={14} fill="currentColor" /> {places.length} địa điểm đã công bố</div>
  </div>;
}

function getBounds(places: PlaceSummary[]) {
  const lats = places.map((place) => place.latitude); const lngs = places.map((place) => place.longitude);
  return { minLat: Math.min(...lats, 9.88), maxLat: Math.max(...lats, 9.98), minLng: Math.min(...lngs, 106.25), maxLng: Math.max(...lngs, 106.40) };
}
function project(lat: number, lng: number, bounds: ReturnType<typeof getBounds>, index: number, count: number) {
  const lngRange = bounds.maxLng - bounds.minLng || 1; const latRange = bounds.maxLat - bounds.minLat || 1;
  const left = count === 1 ? 50 : 12 + ((lng - bounds.minLng) / lngRange) * 76;
  const top = count === 1 ? 48 : 12 + (1 - (lat - bounds.minLat) / latRange) * 70;
  return { left: `${Math.min(88, Math.max(12, left + (index % 2) * 2))}%`, top: `${Math.min(82, Math.max(12, top))}%` };
}
