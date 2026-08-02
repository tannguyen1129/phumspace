"use client";

import { useEffect, useState } from 'react';
import { Sparkles, Trash2, RefreshCw } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  onClear: () => void;
  onAnalyze: () => void;
}

export function ImagePreview({ file, onClear, onAnalyze }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200">Ảnh đã chọn xem trước</h3>
        <span className="text-xs text-slate-400 font-mono">
          {file.name} ({sizeMb} MB)
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[350px]">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Ảnh di sản văn hóa xem trước"
            className="w-full h-full max-h-[350px] object-contain rounded-2xl"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Xóa / Chọn ảnh khác
        </button>

        <button
          onClick={onAnalyze}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          Phân tích hình ảnh
        </button>
      </div>
    </div>
  );
}
