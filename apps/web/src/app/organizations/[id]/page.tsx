import { OrganizationProfileView } from "./OrganizationProfileView";

/** Server Component shell — xem giai thich tuong tu apps/web/src/app/places/[entityId]/page.tsx. */
export default async function OrganizationProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizationProfileView organizationId={id} />;
}
