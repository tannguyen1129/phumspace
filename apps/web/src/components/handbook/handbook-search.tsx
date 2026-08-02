'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface HandbookSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function HandbookSearch({ onSearch, isLoading = false }: HandbookSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const trimmed = searchTerm.trim();
      onSearch(trimmed);

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }
      router.replace(`/so-tay?${params.toString()}`, { scroll: false });
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tra cứu bằng chữ Khmer (វត្ត), phiên âm (wat) hoặc nghĩa tiếng Việt..."
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-all text-base"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 w-5 h-5 text-amber-500 animate-spin" />
        ) : searchTerm ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
