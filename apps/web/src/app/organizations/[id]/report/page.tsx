import { OrganizationReportView } from "./OrganizationReportView";

/** Server Component shell — xem giai thich tuong tu apps/web/src/app/places/[entityId]/page.tsx. */
export default async function OrganizationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizationReportView organizationId={id} />;
}
