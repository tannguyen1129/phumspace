"use client";

import { useState } from 'react';
import type { MapMarkerContract } from '@phumspace/contracts';
import { HeritageMap } from './heritage-map';
import { MapFilter } from './map-filter';
import { MapMarkerCard } from './map-marker-card';
import { MapPlaceList } from './map-place-list';
import { MapPin, List } from 'lucide-react';

interface MapClientWrapperProps {
  initialMarkers: MapMarkerContract[];
}

export function MapClientWrapper({ initialMarkers }: MapClientWrapperProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerContract | null>(null);
  const [isMobileListView, setIsMobileListView] = useState<boolean>(false);

  const filteredMarkers = selectedType
    ? initialMarkers.filter((m) => m.placeType === selectedType)
    : initialMarkers;

  return (
    <div className="space-y-6">
      {/* Filter Bar & Mobile View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <MapFilter selectedType={selectedType} onChange={setSelectedType} />

        {/* Mobile View Toggle Button */}
        <div className="sm:hidden flex items-center justify-end">
          <button
            onClick={() => setIsMobileListView(!isMobileListView)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            {isMobileListView ? (
              <>
                <MapPin className="w-4 h-4 text-amber-400" />
                Xem Bản đồ
              </>
            ) : (
              <>
                <List className="w-4 h-4 text-amber-400" />
                Xem Danh sách ({filteredMarkers.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Map & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative min-h-[500px]">
        {/* Left/Main Map Canvas */}
        <div
          className={`lg:col-span-2 relative min-h-[450px] sm:min-h-[550px] ${
            isMobileListView ? 'hidden sm:block' : 'block'
          }`}
        >
          <HeritageMap
            markers={filteredMarkers}
            selectedMarker={selectedMarker}
            onSelectMarker={setSelectedMarker}
          />

          {/* Selected Marker Details Popover */}
          {selectedMarker && (
            <MapMarkerCard
              marker={selectedMarker}
              onClose={() => setSelectedMarker(null)}
            />
          )}
        </div>

        {/* Right Sidebar Accessible HTML Place List */}
        <div className={`${!isMobileListView ? 'hidden sm:block' : 'block'}`}>
          <MapPlaceList
            markers={filteredMarkers}
            selectedId={selectedMarker?.id || null}
            onSelect={(m) => {
              setSelectedMarker(m);
              setIsMobileListView(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
