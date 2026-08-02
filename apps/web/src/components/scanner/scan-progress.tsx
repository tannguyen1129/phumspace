import { Loader2, XCircle } from 'lucide-react';

interface ScanProgressProps {
  onCancel: () => void;
}

export function ScanProgress({ onCancel }: ScanProgressProps) {
  return (
    <div
      aria-live="polite"
      className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-amber-500/30 text-center space-y-6 shadow-2xl animate-pulse"
    >
      <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-slate-100">
          Hệ thống AI đang phân tích hình ảnh...
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Giai đoạn 1: Trích xuất đặc điểm thị giác quan sát được. <br />
          Giai đoạn 2: Khớp nối và đối chiếu bằng chứng với kho tri thức <strong>PhumData PUBLISHED</strong>.
        </p>
      </div>

      <div>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-rose-400 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Hủy phân tích
        </button>
      </div>
    </div>
  );
}
