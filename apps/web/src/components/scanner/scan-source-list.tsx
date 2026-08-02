import { BookOpen } from 'lucide-react';
import type { ScanSourceCitationContract } from '@phumspace/contracts';

interface ScanSourceListProps {
  sources: ScanSourceCitationContract[];
}

export function ScanSourceList({ sources }: ScanSourceListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
        <BookOpen className="w-4 h-4 text-amber-400" />
        Nguồn trích dẫn công khai (PhumData Provenance)
      </h4>
      <ul className="space-y-2">
        {sources.map((src) => (
          <li key={src.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <p className="font-semibold text-slate-200">{src.title}</p>
            {src.creator && <p className="text-slate-400">Tác giả/Đơn vị: {src.creator}</p>}
            {src.locator && <p className="text-slate-500 font-mono text-[11px]">Trích dẫn: {src.locator}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
