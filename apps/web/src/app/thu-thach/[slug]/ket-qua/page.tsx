"use client";

import { useEffect, useState, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { QuizResultContract } from '@phumspace/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
import { QuizResultSummary } from '@/components/quiz/quiz-result-summary';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Compass,
  BookOpen,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface QuizResultPageProps {
  params: Promise<{ slug: string }>;
}

export default function QuizResultPage({ params }: QuizResultPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const router = useRouter();

  const [result, setResult] = useState<QuizResultContract | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!attemptId) {
      setErrorMsg('Không tìm thấy mã lượt làm quiz (attemptId).');
      return;
    }

    async function fetchResult() {
      try {
        const res = await apiClient.getQuizResult(attemptId!);
        setResult(res);
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Không thể tải bảng kết quả. Vui lòng thử lại.');
        }
      }
    }

    fetchResult();
  }, [attemptId]);

  if (errorMsg) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs">
          {errorMsg}
        </div>
        <button
          onClick={() => router.push('/thu-thach')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          Quay lại danh sách thử thách
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-xs text-slate-400">Đang tổng kết kết quả thử thách...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 max-w-3xl mx-auto">
      {/* Result Summary */}
      <QuizResultSummary result={result} />

      {/* Answer Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Xem lại câu trả lời & Chứng cứ PhumData
        </h3>

        <div className="space-y-4">
          {result.reviews.map((rev, idx) => (
            <div
              key={rev.questionId}
              className={`p-6 rounded-2xl border space-y-3 ${
                rev.isCorrect
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-rose-950/10 border-rose-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Câu #{idx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100">{rev.questionText}</h4>
                </div>

                <div className="flex-shrink-0">
                  {rev.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      +{rev.awardedPoints} pt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-semibold">
                      <XCircle className="w-4 h-4" />
                      0 pt
                    </span>
                  )}
                </div>
              </div>

              {rev.explanation && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  💡 <strong>Giải thích PhumData:</strong> {rev.explanation}
                </p>
              )}

              {rev.relatedHeritageEntity && (
                <div className="pt-1">
                  <Link
                    href={`/kham-pha/${rev.relatedHeritageEntity.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold hover:underline"
                  >
                    Khám phá di sản: {rev.relatedHeritageEntity.name}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <Link
          href={`/thu-thach/${slug}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          Thử thách lại bài này
        </Link>

        <Link
          href="/kham-pha"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Compass className="w-4 h-4" />
          Khám phá thêm các di sản
        </Link>
      </div>
    </div>
  );
}
