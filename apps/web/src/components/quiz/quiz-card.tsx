import Link from 'next/link';
import { ArrowRight, Clock, HelpCircle, Sparkles } from 'lucide-react';
import type { QuizSummaryContract } from '@phumspace/contracts';

interface QuizCardProps {
  quiz: QuizSummaryContract;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">Dễ</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">Trung bình</span>;
      case 'HARD':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold">Thử thách</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-5 group shadow-xl">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {getDifficultyBadge(quiz.difficulty)}
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {quiz.estimatedMinutes} phút
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
          {quiz.title}
        </h3>

        {quiz.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {quiz.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>{quiz.totalQuestions} câu hỏi PhumData</span>
        </div>

        <Link
          href={`/thu-thach/${quiz.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          Bắt đầu
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
