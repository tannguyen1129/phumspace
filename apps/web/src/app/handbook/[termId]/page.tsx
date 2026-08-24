import { TermDetailView } from "./TermDetailView";

/** Server Component shell — xem giai thich tuong tu apps/web/src/app/places/[entityId]/page.tsx. */
export default async function TermDetailPage({ params }: { params: Promise<{ termId: string }> }) {
  const { termId } = await params;
  return <TermDetailView termId={termId} />;
}
