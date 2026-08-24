"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Headphones, Loader2, Volume2 } from "lucide-react";
import { ApiError, getTermDetail, updateTermProgress, type TermDetail } from "../../../lib/api-client";
import { SaveButton } from "../../../components/SaveButton";
import { OfflineDownloadButton } from "../../../components/OfflineDownloadButton";
import { Button, Card, CardSkeleton, FeedbackState, PageHeader } from "../../../components/ui";
const LABELS: Record<string, string> = { NEW: "Chưa học", LEARNING: "Đang học", LEARNED: "Đã học" };
export function TermDetailView({ termId }: { termId: string }) {
  const [term, setTerm] = useState<TermDetail | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { getTermDetail(termId).then(setTerm).catch((err) => setError(err instanceof ApiError ? err.message : "Không tải được từ vựng.")).finally(() => setLoading(false)); }, [termId]);
  async function mark(status: "LEARNING" | "LEARNED") {
    setSaving(true);
    try { await updateTermProgress(termId, status); setTerm((old) => old ? { ...old, progress: status } : old); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Không lưu được tiến độ."); }
    finally { setSaving(false); }
  }
  if (loading) return <main className="term-detail-page"><PageHeader backHref="/handbook" title="Đang mở từ vựng" /><div className="term-detail-layout"><CardSkeleton lines={5} /></div></main>;
  if (!term) return <main><PageHeader backHref="/handbook" title="Không tìm thấy từ vựng" /><div className="term-detail-layout"><FeedbackState title="Không mở được nội dung" description={error ?? "Từ vựng không tồn tại hoặc đã được ẩn."} /></div></main>;
  return <main className="app-page term-detail-page"><PageHeader backHref="/handbook" eyebrow="Cẩm nang tiếng Khmer" title="Chi tiết từ vựng" /><section className="term-detail-layout"><article className="term-learning-card">
    <div className="term-hero"><span lang="km">{term.khmerText}</span>{term.latinTransliteration && <small>{term.latinTransliteration}</small>}<h1>{term.meaningVi}</h1>{term.meaningEn && <p lang="en">{term.meaningEn}</p>}<div><SaveButton termId={termId} /><OfflineDownloadButton id={termId} kind="term" title={term.khmerText} apiPaths={[`/v1/handbook/terms/${termId}`]} mediaUrls={term.audio.map((item) => item.audioUrl)} /></div></div>
    {term.audio.length > 0 && <section className="term-section"><h2><Volume2 size={20} /> Phát âm người bản địa</h2><div className="audio-list">{term.audio.map((audio) => <Card key={audio.id} className="audio-card"><Headphones size={19} /><div><strong>{audio.speakerName ?? "Người bản địa"}</strong>{audio.region && <span>{audio.region}</span>}<audio controls preload="none" src={audio.audioUrl}><track kind="captions" /></audio>{audio.transcript && <p className="audio-transcript"><strong>Bản chép lời:</strong> <span lang="km">{audio.transcript}</span></p>}{audio.rightsNote && <small className="audio-rights">Nguồn/quyền sử dụng: {audio.rightsNote}</small>}</div></Card>)}</div></section>}
    {term.examples.length > 0 && <section className="term-section"><h2><BookOpen size={20} /> Ví dụ trong ngữ cảnh</h2>{term.examples.map((example) => <blockquote key={example.id}><strong lang="km">{example.exampleKhmer}</strong><p>{example.exampleVi}</p></blockquote>)}</section>}
  </article><aside className="term-sidebar"><Card><small>TIẾN ĐỘ CỦA BẠN</small><h2>{LABELS[term.progress ?? "NEW"]}</h2><p>Đánh dấu để dễ tiếp tục học trong lần sau.</p><div><Button variant={term.progress === "LEARNING" ? "primary" : "secondary"} disabled={saving} onClick={() => mark("LEARNING")}>{saving && <Loader2 className="ps-spin" size={15} />} Đang học</Button><Button variant={term.progress === "LEARNED" ? "primary" : "secondary"} disabled={saving} onClick={() => mark("LEARNED")}><CheckCircle2 size={16} /> Đã học</Button></div></Card>{term.entityId && <Link href={`/places/${term.entityId}`} className="term-place-link">Khám phá địa điểm liên quan <ArrowRight size={16} /></Link>}{error && <FeedbackState title="Chưa lưu được thay đổi" description={error} />}</aside></section></main>;
}
