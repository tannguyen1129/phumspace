import { ModerationReviewView } from "./ModerationReviewView";

/** Server Component shell — xem giai thich tuong tu apps/web/src/app/places/[entityId]/page.tsx. */
export default async function ModerationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ModerationReviewView contributionId={id} />;
}
