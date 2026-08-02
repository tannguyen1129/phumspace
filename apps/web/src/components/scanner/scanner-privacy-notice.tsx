import { ShieldAlert, Info } from 'lucide-react';

export function ScannerPrivacyNotice() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2">
      <div className="flex items-center gap-2 text-amber-400 font-semibold">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>Bảo mật & Quy tắc Kiểm chứng Tri thức (PhumData Grounding)</span>
      </div>
      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
        <li>Ảnh tải lên chỉ được sử dụng để phân tích đặc điểm thị giác số và không được lưu giữ lâu dài.</li>
        <li>Không tải ảnh chứa khuôn mặt, thông tin cá nhân hoặc hình ảnh nhạy cảm.</li>
        <li>Gemini AI là công cụ quan sát thị giác; dữ liệu <strong>PhumData công bố chính thức</strong> mới là nguồn sự thật văn hóa.</li>
      </ul>
    </div>
  );
}
