"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Sailboat, UsersRound } from "lucide-react";
import { ApiError, listBoatTeams, type BoatTeam } from "../../../lib/api-client";
import { BottomNav } from "../../../components/BottomNav";
import { Button, CardSkeleton, FeedbackState, PageHeader } from "../../../components/ui";
export default function BoatTeamsPage() {
  const [teams, setTeams] = useState<BoatTeam[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>();
  function load() { setLoading(true); setError(undefined); listBoatTeams().then(setTeams).catch((err) => setError(err instanceof ApiError ? err.message : "Không tải được danh sách đội ghe.")).finally(() => setLoading(false)); }
  useEffect(load, []);
  return <main className="app-page boat-index" style={{ paddingBottom: 88 }}><PageHeader backHref="/festivals" eyebrow="Di sản đua ghe Ngo" title="Những đội ghe của cộng đồng" subtitle="Hồ sơ chỉ hiển thị tên, địa phương, màu biểu trưng và câu chuyện đã được kiểm duyệt." /><section className="boat-index__layout"><div className="boat-index__banner"><Sailboat size={32} /><div><h2>Mỗi chiếc ghe là một câu chuyện tập thể</h2><p>Khám phá bản sắc đội ghe và theo dõi đội bạn quan tâm để nhận cập nhật.</p></div></div>{loading && <div className="boat-grid">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} lines={2} />)}</div>}{error && <FeedbackState title="Không tải được đội ghe" description={error} action={<Button onClick={load}><RefreshCw size={16} /> Thử lại</Button>} />}{!loading && !error && !teams.length && <FeedbackState title="Chưa có hồ sơ đội ghe" description="Hồ sơ sẽ xuất hiện sau khi được cộng đồng xác nhận và công bố." />}{!loading && !error && <div className="boat-grid">{teams.map((team) => <Link href={`/festivals/boat-teams/${team.id}`} className="boat-card" key={team.id} style={{ "--team-color": team.symbolColor ?? "#2F6653" } as React.CSSProperties}><span className="boat-card__mark"><Sailboat size={23} /></span><div><small><UsersRound size={12} /> HỒ SƠ ĐỘI GHE</small><h2>{team.displayName}</h2><p>{team.story ? `${team.story.slice(0, 105)}${team.story.length > 105 ? "…" : ""}` : "Câu chuyện đang được cộng đồng bổ sung."}</p></div><ArrowRight size={17} /></Link>)}</div>}</section><BottomNav /></main>;
}
