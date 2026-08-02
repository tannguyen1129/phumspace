import { Trophy, XCircle, Award } from 'lucide-react';
import type { QuizResultContract } from '@phumspace/contracts';

interface QuizResultSummaryProps {
  result: QuizResultContract;
}

export function QuizResultSummary({ result }: QuizResultSummaryProps) {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-2xl">
      <div
        className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto border-2 ${
          result.isPassed
            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500 text-rose-400'
        }`}
      >
        {result.isPassed ? <Trophy className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            result.isPassed
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          {result.isPassed ? 'ĐẠT THỬ THÁCH' : 'CHƯA ĐẠT THỬ THÁCH'}
        </span>

        <h2 className="text-3xl font-extrabold text-slate-100">{result.quizTitle}</h2>

        <div className="text-4xl font-extrabold text-amber-400 font-mono pt-2">
          {result.percentageScore}%
        </div>
        <p className="text-xs text-slate-400">
          Tổng điểm đạt được: <strong>{result.score}</strong> / {result.maxPossibleScore} điểm
          (Yêu cầu đạt: {result.passingScore}%)
        </p>
      </div>
    </div>
  );
}
