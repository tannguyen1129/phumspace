export function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 shadow-sm"
        >
          <div className="h-5 w-24 bg-slate-800 rounded-md"></div>
          <div className="h-7 w-3/4 bg-slate-800 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-800/70 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-800/70 rounded"></div>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-slate-800/60">
            <div className="h-4 w-20 bg-slate-800 rounded"></div>
            <div className="h-4 w-16 bg-slate-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
