import { BookOpen } from 'lucide-react';

interface SourceListProps {
  sources?: {
    id?: string;
    title: string;
    creator?: string;
    locator?: string;
  }[];
}

export function SourceList({ sources = [] }: SourceListProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 italic">
        Nguồn tài liệu tham khảo công khai đang được cập nhật.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-amber-400" />
        Nguồn tài liệu tham khảo (Provenance)
      </h3>
      <ul className="space-y-2">
        {sources.map((src, idx) => (
          <li
            key={src.id || idx}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1"
          >
            <p className="font-medium text-slate-200">{src.title}</p>
            {src.creator && <p className="text-slate-400">Tác giả/Đơn vị: {src.creator}</p>}
            {src.locator && <p className="text-slate-500 font-mono text-[11px]">Trích dẫn: {src.locator}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
