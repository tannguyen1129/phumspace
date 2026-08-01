import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== 'page') {
        params.set(key, val);
      }
    });
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-4 mt-12 py-4">
      {hasPrev ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-amber-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Trang trước
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-600 cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Trang trước
        </button>
      )}

      <span className="text-xs font-medium text-slate-400">
        Trang <strong className="text-slate-200">{currentPage}</strong> / {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-amber-400 transition-colors"
        >
          Trang sau
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-600 cursor-not-allowed"
        >
          Trang sau
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
