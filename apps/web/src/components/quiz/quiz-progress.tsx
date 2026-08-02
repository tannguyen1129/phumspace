interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
  currentScore: number;
}

export function QuizProgress({ currentIndex, totalQuestions, currentScore }: QuizProgressProps) {
  const percentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-amber-400">
          Câu hỏi {currentIndex + 1} / {totalQuestions}
        </span>
        <span className="text-slate-400 font-mono">
          Điểm tích lũy: <strong className="text-slate-100">{currentScore}</strong> pt
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
