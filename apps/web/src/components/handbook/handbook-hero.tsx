import { BookOpen, Sparkles } from 'lucide-react';

export function HandbookHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white p-8 md:p-12 mb-10 shadow-xl shadow-amber-600/10">
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4 text-amber-100">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Trải nghiệm Ngôn ngữ & Văn hóa</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          Sổ tay Tiếng Khmer Nam Bộ
        </h1>
        <p className="text-amber-100 text-base md:text-lg leading-relaxed mb-6 max-w-2xl font-medium">
          Khám phá từ vựng, chữ viết Khmer nguyên bản, phiên âm chuẩn xác, phát âm bản địa và tiến trình học tập tương tác cùng PhumSpace.
        </p>
      </div>

      <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10 pointer-events-none">
        <BookOpen className="w-96 h-96" />
      </div>
    </div>
  );
}
