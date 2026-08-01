import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-3xl shadow-lg">
        404
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Không tìm thấy trang hoặc di sản
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Nội dung di sản văn hóa bạn đang tìm kiếm không tồn tại, chưa được công bố hoặc đã bị thay đổi đường dẫn.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Về Trang chủ
        </Link>
        <Link
          href="/kham-pha"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
        >
          <Compass className="w-4 h-4" />
          Khám phá di sản khác
        </Link>
      </div>
    </div>
  );
}
