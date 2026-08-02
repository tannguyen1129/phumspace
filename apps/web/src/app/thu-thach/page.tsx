import { Metadata } from 'next';
import type { QuizSummaryContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { QuizCard } from '@/components/quiz/quiz-card';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Thử thách Tri thức Di sản — PhumSpace',
  description: 'Thử thách kiến thức văn hóa Khmer Nam Bộ thông qua bộ câu hỏi liên kết trực tiếp với dữ liệu PhumData công bố.',
};

export default async function QuizListPage() {
  let quizzes: QuizSummaryContract[] = [];
  let errorMsg = '';

  try {
    quizzes = await apiClient.getQuizzes();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ PhumSpace API.';
  }

  return (
    <div className="space-y-8 py-8">
      {/* Header Banner */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Cultural Quiz System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Thử thách Tri thức Di sản
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Ôn tập và kiểm tra hiểu biết văn hóa Khmer Nam Bộ thông qua các câu hỏi minh bạch, giải thích bằng nguồn dữ liệu PhumData đã công bố.
        </p>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-center space-y-2 max-w-md mx-auto">
          <p className="text-xs text-rose-300 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Empty state */}
      {!errorMsg && quizzes.length === 0 && (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3 max-w-md mx-auto">
          <p className="text-sm font-semibold text-slate-300">Chưa có bài thử thách quiz nào được công bố.</p>
          <p className="text-xs text-slate-500">Vui lòng quay lại sau để cập nhật các bộ câu hỏi mới.</p>
        </div>
      )}

      {/* Quiz List Grid */}
      {quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
