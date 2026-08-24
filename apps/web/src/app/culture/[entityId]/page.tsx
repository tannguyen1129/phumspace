import { CultureDetailView } from "./CultureDetailView";
export default async function CultureDetailPage({
  params,
}: {
  params: Promise<{ entityId: string }>;
}) {
  const { entityId } = await params;
  return <CultureDetailView entityId={entityId} />;
}
