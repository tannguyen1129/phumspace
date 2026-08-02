'use client';

import Link from 'next/link';
import { Layers, PlayCircle, Trophy } from 'lucide-react';
import type { HandbookCollectionSummaryContract } from '@phumspace/contracts';

interface HandbookCollectionCardProps {
  collection: HandbookCollectionSummaryContract;
}

export function HandbookCollectionCard({ collection }: HandbookCollectionCardProps) {
  return (
    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white to-amber-50/30 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
          <Layers className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          {collection.difficulty && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {collection.difficulty === 'EASY' ? 'Cơ bản' : collection.difficulty}
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            {collection.itemCount} từ
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        {collection.title}
      </h3>

      {collection.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-6">
          {collection.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold">
          <Trophy className="w-4 h-4" />
          <span>+20 Điểm Passport</span>
        </div>

        <Link
          href={`/so-tay/bo-suu-tap/${collection.slug}/hoc`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Học Flashcard</span>
        </Link>
      </div>
    </div>
  );
}
