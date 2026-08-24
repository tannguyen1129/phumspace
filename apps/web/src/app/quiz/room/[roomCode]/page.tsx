import { RoomQuizView } from "./RoomQuizView";

/** Server Component shell — xem giai thich tuong tu apps/web/src/app/places/[entityId]/page.tsx. */
export default async function RoomQuizPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = await params;
  return <RoomQuizView roomCode={roomCode} />;
}
