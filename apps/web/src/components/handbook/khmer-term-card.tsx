'use client';

import Link from 'next/link';
import { Volume2, ArrowRight } from 'lucide-react';
import type { KhmerTermSummaryContract } from '@phumspace/contracts';

interface KhmerTermCardProps {
  term: KhmerTermSummaryContract;
}

export function KhmerTermCard({ term }: KhmerTermCardProps) {
  return (
    <Link
      href={`/so-tay/tu/${term.slug}`}
      className="group block p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span
            lang="km"
            className="block text-2xl font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-relaxed"
          >
            {term.scriptText}
          </span>
          {term.transliteration && (
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              /{term.transliteration}/
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {term.hasAudio && (
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400" title="Có âm thanh phát âm">
              <Volume2 className="w-4 h-4" />
            </span>
          )}
          {term.partOfSpeech && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {term.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 mb-4 font-normal">
        {term.shortDefinitionVi}
      </p>

      <div className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
        <span>Xem chi tiết từ vựng</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </div>
    </Link>
  );
}
