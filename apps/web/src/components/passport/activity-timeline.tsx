import { Activity, HelpCircle, Scan, Sparkles } from 'lucide-react';
import type { PassportActivityContract } from '@phumspace/contracts';

interface ActivityTimelineProps {
  activities: PassportActivityContract[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'QUIZ_COMPLETED':
        return 'Hoàn thành bài thử thách Quiz';
      case 'QUIZ_PASSED':
        return 'Đạt điểm chuẩn thử thách Quiz';
      case 'PERFECT_QUIZ':
        return 'Đạt 100% điểm tuyệt đối Quiz';
      case 'SCAN_MATCHED':
        return 'Nhận diện di sản MATCH thành công';
      default:
        return 'Hoạt động tích điểm';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'SCAN_MATCHED':
        return <Scan className="w-4 h-4 text-amber-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
        <Activity className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-xs text-slate-400">Chưa có lịch sử hoạt động tích điểm.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Activity className="w-5 h-5 text-amber-400" />
        Lịch sử Hoạt động Gần đây
      </h2>

      <div className="space-y-3">
        {activities.map((act) => {
          const dateStr = new Date(act.occurredAt).toLocaleString('vi-VN');

          return (
            <div
              key={act.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {getActivityIcon(act.activityType)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {getActivityLabel(act.activityType)}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">{dateStr}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
                <Sparkles className="w-3.5 h-3.5" />+{act.pointsAwarded} pt
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
