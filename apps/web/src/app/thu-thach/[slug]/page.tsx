"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import type {
  StartQuizAttemptResponseContract,
  SubmitQuizAnswerResponseContract,
} from '@phumspace/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { QuizQuestionCard } from '@/components/quiz/quiz-question-card';
import { QuizFeedback } from '@/components/quiz/quiz-feedback';
import { ArrowRight, Loader2, Send } from 'lucide-react';

interface QuizPlayPageProps {
  params: Promise<{ slug: string }>;
}

export default function QuizPlayPage({ params }: QuizPlayPageProps) {
  const { slug } = use(params);
  const router = useRouter();

  const [attemptData, setAttemptData] = useState<StartQuizAttemptResponseContract | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, SubmitQuizAnswerResponseContract>>({});
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  useEffect(() => {
    async function initQuiz() {
      try {
        const res = await apiClient.startQuizAttempt(slug);
        setAttemptData(res);
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Không thể bắt đầu lượt làm quiz. Vui lòng thử lại.');
        }
      }
    }
    initQuiz();
  }, [slug]);

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

  if (!attemptData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-xs text-slate-400">Đang khởi tạo bài thử thách...</p>
      </div>
    );
  }

  const questions = attemptData.quiz.questions;
  const currentQuestion = questions[currentIndex];
  const currentFeedback = feedbackMap[currentQuestion.id];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSubmitAnswer = async () => {
    setIsSubmitting(true);
    try {
      const fb = await apiClient.submitQuizAnswer(
        attemptData.attemptId,
        currentQuestion.id,
        selectedOptionId,
      );

      setFeedbackMap((prev) => ({ ...prev, [currentQuestion.id]: fb }));
      if (fb.isCorrect) {
        setCurrentScore((prev) => prev + fb.awardedPoints);
      }
    } catch (err) {
      console.error('Submit answer error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextOrComplete = async () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(undefined);
    } else {
      setIsCompleting(true);
      try {
        await apiClient.completeQuizAttempt(attemptData.attemptId);
        router.push(`/thu-thach/${slug}/ket-qua?attemptId=${attemptData.attemptId}`);
      } catch (err) {
        console.error('Complete quiz error:', err);
        router.push(`/thu-thach/${slug}/ket-qua?attemptId=${attemptData.attemptId}`);
      }
    }
  };

  return (
    <div className="space-y-8 py-8 max-w-2xl mx-auto">
      {/* Title & Progress Bar */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-100">{attemptData.quiz.title}</h1>
        <QuizProgress
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          currentScore={currentScore}
        />
      </div>

      {/* Question Card */}
      <QuizQuestionCard
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        onSelectOption={(optId) => !currentFeedback && setSelectedOptionId(optId)}
        isSubmitted={!!currentFeedback}
      />

      {/* Feedback Section */}
      {currentFeedback && <QuizFeedback feedback={currentFeedback} />}

      {/* Action Navigation */}
      <div className="flex justify-end pt-2">
        {!currentFeedback ? (
          <button
            disabled={!selectedOptionId || isSubmitting}
            onClick={handleSubmitAnswer}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs transition-all ${
              selectedOptionId && !isSubmitting
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang chấm điểm...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi câu trả lời
              </>
            )}
          </button>
        ) : (
          <button
            disabled={isCompleting}
            onClick={handleNextOrComplete}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tổng kết...
              </>
            ) : isLastQuestion ? (
              <>
                Hoàn thành & Xem kết quả
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Câu tiếp theo
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
