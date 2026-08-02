"use client";

import { useRef, ChangeEvent } from 'react';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';

interface ImagePickerProps {
  onSelectFile: (file: File) => void;
  onError: (msg: string) => void;
}

export function ImagePicker({ onSelectFile, onError }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp ảnh JPEG, PNG hoặc WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('Dung lượng tệp ảnh vượt quá giới hạn 5 MB. Vui lòng chọn tấm ảnh nhỏ hơn.');
      return;
    }

    onSelectFile(file);
  };

  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-amber-500/50 transition-colors text-center space-y-6">
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
        <Camera className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-100">
          Chụp ảnh hoặc chọn hình ảnh di sản
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tải lên hình ảnh chùa chiền, kiến trúc, trang phục hoặc hoa văn truyền thống Khmer Nam Bộ để AI phân tích và đối chiếu PhumData.
        </p>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Chọn ảnh di sản từ thiết bị"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Chụp ảnh di sản từ camera"
      />

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Camera className="w-4 h-4" />
          Chụp ảnh bằng Camera
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition-colors"
        >
          <Upload className="w-4 h-4 text-amber-400" />
          Chọn ảnh từ thư viện
        </button>
      </div>

      <div className="text-[11px] text-slate-500 pt-2">
        Hỗ trợ: JPEG, PNG, WebP (Tối đa 5 MB)
      </div>
    </div>
  );
}
