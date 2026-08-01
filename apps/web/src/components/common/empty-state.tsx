import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'Chưa có nội dung công bố',
  description = 'Hiện tại chưa có dữ liệu di sản văn hóa nào phù hợp với bộ lọc hiện tại.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-slate-900/40 border border-slate-800 my-8 space-y-4">
      <div className="h-16 w-16 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
        <FolderOpen className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
