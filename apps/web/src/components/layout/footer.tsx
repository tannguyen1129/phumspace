import Link from 'next/link';
import { ApiStatus } from '../../app/api-status';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12 text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* About Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">
              PS
            </div>
            <span className="font-bold text-slate-200 text-base">PhumSpace</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nền tảng số hóa và bảo tồn di sản văn hóa Khmer Nam Bộ. Khởi tạo tại Trà Vinh với kho tri thức xác minh PhumData.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Liên kết nhanh</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/kham-pha" className="hover:text-amber-400 transition-colors">
                Danh sách thực thể di sản
              </Link>
            </li>
            <li>
              <Link href="/dia-diem" className="hover:text-amber-400 transition-colors">
                Danh sách địa điểm di sản
              </Link>
            </li>
          </ul>
        </div>

        {/* Discreet API Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Trạng thái hệ thống</h4>
          <div className="scale-95 origin-top-left">
            <ApiStatus />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-slate-800/60 pt-6 text-center text-xs text-slate-500">
        <p>© 2026 PhumSpace. Dự án số hóa di sản văn hóa Khmer Nam Bộ. Release 1 MVP (Sprint 2).</p>
      </div>
    </footer>
  );
}
