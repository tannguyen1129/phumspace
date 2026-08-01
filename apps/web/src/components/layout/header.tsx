import Link from 'next/link';
import { Compass, Home, MapPin, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 font-bold text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            PS
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              PhumSpace
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">
              DI SẢN KHMER NAM BỘ
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Link>
          <Link
            href="/kham-pha"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Khám phá Di sản
          </Link>
          <Link
            href="/dia-diem"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Địa điểm
          </Link>
        </nav>

        {/* Action Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            PhumData Core v1
          </span>
        </div>
      </div>
    </header>
  );
}
