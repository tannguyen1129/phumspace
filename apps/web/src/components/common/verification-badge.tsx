import { ShieldCheck } from 'lucide-react';

interface VerificationBadgeProps {
  label?: string;
  status?: 'PUBLISHED' | string;
}

export function VerificationBadge({ label = 'Đã công bố trên PhumData', status = 'PUBLISHED' }: VerificationBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
      <ShieldCheck className="w-4 h-4 text-emerald-400" />
      <span>{label}</span>
      {status && (
        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono uppercase">
          {status}
        </span>
      )}
    </div>
  );
}
