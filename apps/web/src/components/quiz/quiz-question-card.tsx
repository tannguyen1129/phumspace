"use client";

import type { QuizQuestionContract } from '@phumspace/contracts';
import { CheckCircle2, Circle } from 'lucide-react';

interface QuizQuestionCardProps {
  question: QuizQuestionContract;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  isSubmitted: boolean;
}

export function QuizQuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
  isSubmitted,
}: QuizQuestionCardProps) {
  return (
    <fieldset className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
      <legend className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
        Câu hỏi #{question.order} ({question.points} điểm)
      </legend>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
        {question.questionText}
      </h2>

      <div className="space-y-3 pt-2" role="radiogroup" aria-label={question.questionText}>
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const letter = String.fromCharCode(65 + idx); // A, B, C, D

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isSubmitted}
              onClick={() => onSelectOption(opt.id)}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold ring-2 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-950'
              } ${isSubmitted ? 'cursor-not-allowed opacity-90' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm">{opt.optionText}</span>
              </div>

              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
