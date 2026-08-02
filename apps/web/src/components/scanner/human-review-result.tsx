import { AlertOctagon, Camera } from 'lucide-react';
import type { ScanResponseContract } from '@phumspace/contracts';

interface HumanReviewResultProps {
  scanResponse: ScanResponseContract;
  onReset: () => void;
}

export function HumanReviewResult({ scanResponse, onReset }: HumanReviewResultProps) {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-amber-500/40 text-center space-y-6 shadow-xl animate-in fade-in duration-300">
      <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-100">
          Nội dung cần kiểm chứng của chuyên gia văn hóa
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Hình ảnh chứa các yếu tố di sản phức tạp hoặc có thông tin bất đồng giữa các tư liệu. Để đảm bảo độ chính xác tri thức, hệ thống không đưa ra kết luận tự động.
        </p>
      </div>

      {scanResponse.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 max-w-md mx-auto text-left">
          <p className="font-semibold mb-1">Ghi chú kiểm duyệt:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {scanResponse.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg"
        >
          <Camera className="w-4 h-4" />
          Thử tấm ảnh khác
        </button>
      </div>
    </div>
  );
}
