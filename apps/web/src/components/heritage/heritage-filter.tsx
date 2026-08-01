"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryPublicContract, PlacePublicContract } from '@phumspace/contracts';
import { Filter, X } from 'lucide-react';

interface HeritageFilterProps {
  categories: CategoryPublicContract[];
  places: PlacePublicContract[];
}

export function HeritageFilter({ categories, places }: HeritageFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('categorySlug') || '';
  const currentPlace = searchParams.get('placeSlug') || '';

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`/kham-pha?${params.toString()}`);
  };

  const handleReset = () => {
    router.push('/kham-pha');
  };

  const hasFilter = currentCategory || currentPlace;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>Bộ lọc di sản</span>
        </div>
        {hasFilter && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Danh mục di sản</label>
          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange('categorySlug', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Place Filter */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Địa điểm</label>
          <select
            value={currentPlace}
            onChange={(e) => handleFilterChange('placeSlug', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">Tất cả địa điểm</option>
            {places.map((pl) => (
              <option key={pl.id} value={pl.slug}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
