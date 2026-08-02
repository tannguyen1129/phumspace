"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { MapMarkerContract } from '@phumspace/contracts';
import { MapUnavailableState } from './map-unavailable-state';

interface HeritageMapProps {
  markers: MapMarkerContract[];
  selectedMarker: MapMarkerContract | null;
  onSelectMarker: (marker: MapMarkerContract | null) => void;
}

export function HeritageMap({ markers, selectedMarker, onSelectMarker }: HeritageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [loadError, setLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

  useEffect(() => {
    if (!apiKey) {
      setLoadError(true);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['maps', 'marker'],
    });

    let isMounted = true;

    async function initMap() {
      try {
        const loaderAny: any = loader;
        const mapsLib = await loaderAny.importLibrary('maps');
        const markerLib = await loaderAny.importLibrary('marker');

        if (!isMounted || !mapRef.current) return;

        const Map = mapsLib.Map;
        const AdvancedMarkerElement = markerLib.AdvancedMarkerElement;

        // Default center around Trà Vinh (Lat: 9.9325, Lng: 106.3458)
        const mapOptions = {
          center: { lat: 9.9325, lng: 106.3458 },
          zoom: 11,
          mapId,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
        };

        const mapInstance = new Map(mapRef.current, mapOptions);
        googleMapRef.current = mapInstance;

        // Render markers
        markersRef.current.clear();
        markers.forEach((markerData) => {
          const pinElement = document.createElement('div');
          pinElement.className =
            'px-2.5 py-1.5 rounded-full bg-slate-950 border-2 border-amber-400 text-amber-400 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-110 transition-transform';
          pinElement.innerText = markerData.name;

          const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: markerData.latitude, lng: markerData.longitude },
            title: markerData.name,
            content: pinElement,
          });

          marker.addListener('click', () => {
            onSelectMarker(markerData);
          });

          markersRef.current.set(markerData.id, marker);
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('Google Maps Loader error:', err);
        if (isMounted) setLoadError(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => {
        if (marker.map) marker.map = null;
      });
      markersRef.current.clear();
    };
  }, [apiKey, mapId, markers]);

  // Pan to selected marker
  useEffect(() => {
    if (selectedMarker && googleMapRef.current) {
      googleMapRef.current.panTo({
        lat: selectedMarker.latitude,
        lng: selectedMarker.longitude,
      });
      googleMapRef.current.setZoom(14);
    }
  }, [selectedMarker]);

  if (loadError || !apiKey) {
    return <MapUnavailableState />;
  }

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-xs text-amber-400 font-medium">
          Đang tải Google Maps...
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
}
