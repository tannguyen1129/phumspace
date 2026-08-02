'use client';

import { useState } from 'react';
import { PronunciationPlayer } from './pronunciation-player';
import { RotateCw, CheckCircle2, BookOpen, CircleDot } from 'lucide-react';
import type { KhmerTermSummaryContract } from '@phumspace/contracts';

interface FlashcardProps {
  term: KhmerTermSummaryContract;
  onMarkStatus: (status: 'LEARNING' | 'LEARNED') => void;
  isSaving?: boolean;
}

export function Flashcard({ term, onMarkStatus, isSaving = false }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* 3D Card Container */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Mặt sau thẻ: Click để lật sang mặt trước' : 'Mặt trước thẻ: Click để lật xem nghĩa'}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        className="cursor-pointer min-h-[360px] md:min-h-[400px] p-8 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-amber-200/80 dark:border-amber-900/60 shadow-xl shadow-amber-500/5 flex flex-col justify-between transition-all duration-300 relative select-none hover:border-amber-400"
      >
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            {isFlipped ? 'Mặt sau — Ý nghĩa & Ví dụ' : 'Mặt trước — Chữ Khmer'}
          </span>
          <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 font-medium">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Bấm/Phím Space để lật</span>
          </span>
        </div>

        {/* Card Content */}
        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="my-auto text-center py-6">
            <span
              lang="km"
              className="block text-5xl md:text-6xl font-black text-neutral-900 dark:text-neutral-50 mb-4 leading-relaxed tracking-wide"
            >
              {term.scriptText}
            </span>
            {term.transliteration && (
              <span className="inline-block text-xl font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                /{term.transliteration}/
              </span>
            )}
          </div>
        ) : (
          /* BACK SIDE */
          <div className="my-auto py-4 space-y-4">
            <div className="text-center">
              <span lang="km" className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {term.scriptText}
              </span>
              {term.transliteration && (
                <span className="text-sm ml-2 font-medium text-amber-600 dark:text-amber-400">
                  /{term.transliteration}/
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <h4 className="text-xs uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Nghĩa tiếng Việt
              </h4>
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {term.shortDefinitionVi}
              </p>
              {term.shortDefinitionEn && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 italic">
                  {term.shortDefinitionEn}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Audio Player if Available */}
        {term.hasAudio && (
          <div className="mt-auto pt-4" onClick={(e) => e.stopPropagation()}>
            <PronunciationPlayer pronunciationId={term.id} />
          </div>
        )}
      </div>

      {/* Action Rating Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => onMarkStatus('LEARNING')}
          disabled={isSaving}
          className="flex-1 py-3 px-4 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all border border-amber-300/60 shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>Đang học / Chưa nhớ</span>
        </button>

        <button
          type="button"
          onClick={() => onMarkStatus('LEARNED')}
          disabled={isSaving}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Đã nhớ từ này</span>
        </button>
      </div>
    </div>
  );
}
