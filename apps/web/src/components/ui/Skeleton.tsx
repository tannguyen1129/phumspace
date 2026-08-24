export function Skeleton({ className, width, height = 16 }: { className?: string; width?: string | number; height?: string | number }) {
  return <span className={["ps-skeleton", className].filter(Boolean).join(" ")} style={{ width, height }} aria-hidden="true" />;
}
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return <div className="ps-card ps-card-skeleton" role="status" aria-label="Đang tải nội dung"><Skeleton height={22} width="55%" />{Array.from({ length: lines }, (_, index) => <Skeleton key={index} width={index === lines - 1 ? "72%" : "100%"} />)}</div>;
}
