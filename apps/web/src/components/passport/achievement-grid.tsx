import { Award, Sparkles, BookOpen, Trophy, Lock } from 'lucide-react';
import type { PassportAchievementContract } from '@phumspace/contracts';

interface AchievementGridProps {
  achievements: PassportAchievementContract[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const getIcon = (iconKey: string) => {
    switch (iconKey) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6" />;
      case 'Award':
        return <Award className="w-6 h-6" />;
      case 'Trophy':
        return <Trophy className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-400" />
        Bộ sưu tập Huy hiệu Văn hóa
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
              ach.isEarned
                ? 'bg-slate-900/90 border-amber-500/40 text-slate-100 shadow-lg shadow-amber-500/5'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                ach.isEarned
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-600'
              }`}
            >
              {ach.isEarned ? getIcon(ach.iconKey) : <Lock className="w-5 h-5" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-100">{ach.title}</h3>
                {ach.isEarned && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Đã mở khóa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
