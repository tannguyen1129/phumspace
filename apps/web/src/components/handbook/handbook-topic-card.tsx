'use client';

import Link from 'next/link';
import { Tag, ChevronRight } from 'lucide-react';
import type { HandbookTopicContract } from '@phumspace/contracts';

interface HandbookTopicCardProps {
  topic: HandbookTopicContract;
}

export function HandbookTopicCard({ topic }: HandbookTopicCardProps) {
  return (
    <Link
      href={`/so-tay/chu-de/${topic.slug}`}
      className="group block p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
          <Tag className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
          {topic.termCount} từ vựng
        </span>
      </div>

      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">
        {topic.titleVi}
      </h3>

      {topic.titleKm && (
        <span lang="km" className="block text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
          {topic.titleKm}
        </span>
      )}

      {topic.description && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
          {topic.description}
        </p>
      )}

      <div className="flex items-center text-xs font-medium text-amber-600 dark:text-amber-400">
        <span>Xem từ vựng chủ đề</span>
        <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
