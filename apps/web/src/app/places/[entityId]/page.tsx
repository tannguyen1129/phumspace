import { PlaceDetailView } from "./PlaceDetailView";

/**
 * Server Component shell — chi await params (Next.js 15 tra params dang Promise) roi giao
 * lai cho PlaceDetailView (client component) fetch du lieu qua api-client. Tach lop nay de
 * tranh phu thuoc React 19 use() hook trong khi apps/web dang ghim React 18.
 */
export default async function PlaceDetailPage({ params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = await params;
  return <PlaceDetailView entityId={entityId} />;
}
