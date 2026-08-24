import { FestivalDetailView } from "./FestivalDetailView";

/** Server Component shell — xem giai thich tuong tu apps/web/src/app/places/[entityId]/page.tsx. */
export default async function FestivalDetailPage({ params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = await params;
  return <FestivalDetailView entityId={entityId} />;
}
