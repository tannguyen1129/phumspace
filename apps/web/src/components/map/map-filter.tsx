"use client";

import { Filter, X } from 'lucide-react';

const PLACE_TYPES = [
  { value: 'TEMPLE', label: '🛕 Chùa chiền & Đền tháp' },
  { value: 'MUSEUM', label: '🏛️ Bảo tàng & Nhà trưng bày' },
  { value: 'CULTURAL_SITE', label: '📍 Di tích văn hóa lịch sử' },
  { value: 'FESTIVAL_VENUE', label: '🎉 Địa điểm lễ hội' },
  { value: 'CRAFT_VILLAGE', label: '🎨 Làng nghề truyền thống' },
  { value: 'FOOD_LOCATION', label: '🍲 Ẩm thực văn hóa' },
  { value: 'OTHER', label: '📌 Khác' },
];

interface MapFilterProps {
  selectedType: string;
  onChange: (type: string) => void;
}

export function MapFilter({ selectedType, onChange }: MapFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex-shrink-0">
        <Filter className="w-3.5 h-3.5 text-amber-400" />
        <span>Loại hình:</span>
      </div>

      <button
        onClick={() => onChange('')}
        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-colors ${
          !selectedType
            ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
        }`}
      >
        Tất cả địa điểm
      </button>

      {PLACE_TYPES.map((pt) => (
        <button
          key={pt.value}
          onClick={() => onChange(pt.value)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-colors ${
            selectedType === pt.value
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {pt.label}
        </button>
      ))}

      {selectedType && (
        <button
          onClick={() => onChange('')}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
          title="Xóa lọc"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
