import { BoatTeamDetailView } from "./BoatTeamDetailView";

/** Server Component shell — xem giai thich tuong tu apps/web/src/app/places/[entityId]/page.tsx. */
export default async function BoatTeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BoatTeamDetailView teamId={id} />;
}
