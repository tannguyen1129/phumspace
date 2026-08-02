'use client';

import { useState } from 'react';
import { Flashcard } from './flashcard';
import { Trophy, CheckCircle, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import type { KhmerTermSummaryContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';

interface FlashcardDeckProps {
  collectionId: string;
  collectionTitle: string;
  terms: KhmerTermSummaryContract[];
  onCompleteCollection?: (pointsAwarded: number) => void;
}

export function FlashcardDeck({
  collectionId,
  collectionTitle,
  terms,
  onCompleteCollection,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [learnedTerms, setLearnedTerms] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  if (!terms || terms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Bộ sưu tập này chưa có từ vựng nào.</p>
      </div>
    );
  }

  const currentTerm = terms[currentIndex];

  const handleMarkStatus = async (status: 'LEARNING' | 'LEARNED') => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await apiClient.updateHandbookTermProgress(currentTerm.id, status);

      if (status === 'LEARNED') {
        const nextSet = new Set(learnedTerms);
        nextSet.add(currentTerm.id);
        setLearnedTerms(nextSet);
      }

      // Check if deck has reached end
      if (currentIndex + 1 < terms.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Complete collection if all learned
        try {
          const res = await apiClient.completeHandbookCollection(collectionId);
          setPointsEarned(res.pointsAwarded);
          if (onCompleteCollection) {
            onCompleteCollection(res.pointsAwarded);
          }
        } catch {
          // Keep finished state even if API complete threshold wasn't met
        }
        setIsFinished(true);
      }
    } catch {
      // Error handled gracefully
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    setPointsEarned(null);
  };

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-neutral-900 dark:to-neutral-950 border border-amber-200 dark:border-neutral-800 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mb-2">
          Hoàn thành Bài học!
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Bạn đã hoàn thành bộ sưu tập <strong className="text-amber-600">{collectionTitle}</strong>.
        </p>

        {pointsEarned !== null && pointsEarned > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-6">
            <CheckCircle className="w-4 h-4" />
            <span>Thưởng +{pointsEarned} Điểm Passport!</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleRestart}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-2 shadow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Học lại từ đầu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar Header */}
      <div className="max-w-xl mx-auto flex items-center justify-between text-xs font-bold text-neutral-600 dark:text-neutral-400">
        <span>Thẻ {currentIndex + 1} / {terms.length}</span>
        <div className="w-48 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / terms.length) * 100}%` }}
          />
        </div>
        <span>{Math.round(((currentIndex + 1) / terms.length) * 100)}%</span>
      </div>

      {/* Active Flashcard */}
      <Flashcard
        term={currentTerm}
        onMarkStatus={handleMarkStatus}
        isSaving={isSaving}
      />

      {/* Deck Controls */}
      <div className="max-w-xl mx-auto flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:hover:text-neutral-500 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs text-neutral-600 dark:text-neutral-400">
          Chuyển sang thẻ tiếp theo sau khi lưu đánh giá
        </span>

        <button
          type="button"
          onClick={() => setCurrentIndex(Math.min(terms.length - 1, currentIndex + 1))}
          disabled={currentIndex === terms.length - 1}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:hover:text-neutral-500 transition"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
