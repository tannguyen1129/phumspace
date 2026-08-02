import Link from 'next/link';
import { CheckCircle2, XCircle, BookOpen, ExternalLink } from 'lucide-react';
import type { SubmitQuizAnswerResponseContract } from '@phumspace/contracts';

interface QuizFeedbackProps {
  feedback: SubmitQuizAnswerResponseContract;
}

export function QuizFeedback({ feedback }: QuizFeedbackProps) {
  return (
    <div
      aria-live="polite"
      className={`p-6 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${
        feedback.isCorrect
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
          : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm">
          {feedback.isCorrect ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Chính xác! (+{feedback.awardedPoints} điểm)</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Chưa chính xác (0 điểm)</span>
            </>
          )}
        </div>
      </div>

      {/* Explanation */}
      {feedback.explanation && (
        <div className="space-y-1 text-xs text-slate-200 leading-relaxed border-t border-slate-800/60 pt-3">
          <h4 className="font-semibold text-amber-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Giải thích từ dữ liệu công bố PhumData:
          </h4>
          <p>{feedback.explanation}</p>
        </div>
      )}

      {/* Related Entity Link */}
      {feedback.relatedHeritageEntity && (
        <div className="pt-2">
          <Link
            href={`/kham-pha/${feedback.relatedHeritageEntity.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
          >
            Khám phá di sản liên quan: {feedback.relatedHeritageEntity.name}
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
