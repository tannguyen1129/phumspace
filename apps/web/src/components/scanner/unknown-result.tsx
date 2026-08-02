import Link from 'next/link';
import { SearchX, Camera, Compass } from 'lucide-react';

interface UnknownResultProps {
  onReset: () => void;
}

export function UnknownResult({ onReset }: UnknownResultProps) {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-6 shadow-xl animate-in fade-in duration-300">
      <div className="h-16 w-16 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-100">
          Chưa tìm thấy dữ liệu di sản phù hợp trong PhumData
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Hệ thống AI không tìm thấy thực thể di sản văn hóa Khmer Nam Bộ nào được công bố chính thức khớp với đặc điểm hình ảnh này.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 text-left text-xs space-y-2 max-w-md mx-auto text-slate-300">
        <h4 className="font-semibold text-amber-400">💡 Gợi ý để có kết quả tốt hơn:</h4>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
          <li>Chụp cận cảnh các chi tiết hoa văn, mái chùa hoặc trang phục truyền thống.</li>
          <li>Đảm bảo đủ ánh sáng và tránh chụp quá mờ nhòe.</li>
          <li>Chụp chính diện công trình hoặc di vật văn hóa.</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Camera className="w-4 h-4" />
          Thử chụp / Chọn ảnh khác
        </button>

        <Link
          href="/kham-pha"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <Compass className="w-4 h-4" />
          Khám phá danh sách di sản
        </Link>
      </div>
    </div>
  );
}
