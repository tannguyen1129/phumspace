import { MapPin, Key, ExternalLink } from 'lucide-react';

export function MapUnavailableState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 max-w-2xl mx-auto shadow-2xl">
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
        <MapPin className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          Chưa cấu hình Google Maps API Key
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Tính năng bản đồ di sản tương tác yêu cầu cấu hình khóa API trong môi trường phát triển local.
        </p>
      </div>

      <div className="w-full text-left p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
        <div className="font-semibold text-amber-400 flex items-center gap-2">
          <Key className="w-4 h-4" />
          <span>Hướng dẫn thiết lập local (.env.local):</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px] text-slate-400">
          <li>Tạo hoặc mở tệp <code className="text-amber-300">apps/web/.env.local</code></li>
          <li>Thêm khóa: <code className="text-slate-200">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY</code></li>
          <li>Thêm Map ID: <code className="text-slate-200">NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID</code></li>
          <li>Khởi động lại frontend dev server (<code className="text-amber-300">pnpm dev:web</code>)</li>
        </ol>
      </div>

      <a
        href="https://console.cloud.google.com/google/maps-apis"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
      >
        Tạo Google Maps API Key
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
