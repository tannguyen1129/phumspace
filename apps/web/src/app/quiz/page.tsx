"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck, DoorOpen, Sparkles, Trophy } from "lucide-react";
import { BottomNav } from "../../components/BottomNav";
import { Button, Card, PageHeader } from "../../components/ui";
export default function QuizMenuPage() {
  const router = useRouter(); const [roomCode, setRoomCode] = useState("");
  function join(event: FormEvent) { event.preventDefault(); const code = roomCode.trim(); if (code) router.push(`/quiz/room/${encodeURIComponent(code)}`); }
  return <main className="app-page quiz-hub" style={{ paddingBottom: 88 }}><PageHeader eyebrow="Học qua thử thách" title="Đố vui văn hóa" subtitle="Câu hỏi được liên kết với địa điểm và tư liệu đã kiểm chứng trong PhumData." /><section className="quiz-hub__layout"><button type="button" className="quiz-mode-card quiz-mode-card--solo" onClick={() => router.push("/quiz/solo")}><span><Sparkles size={25} /></span><div><small>TỰ LUYỆN · 5 CÂU</small><h2>Quiz cá nhân</h2><p>Học theo nhịp của bạn, xem giải thích ngay sau mỗi đáp án và làm lại không giới hạn.</p><strong>Bắt đầu luyện tập <ArrowRight size={16} /></strong></div></button><Card className="quiz-room-card"><span className="quiz-room-card__icon"><DoorOpen size={24} /></span><small>PHÒNG THI TRỰC TUYẾN</small><h2>Tham gia cùng mọi người</h2><p>Nhập mã do người tổ chức cung cấp. Điểm của bạn sẽ xuất hiện trên bảng xếp hạng phòng.</p><form onSubmit={join}><label htmlFor="room-code">Mã phòng</label><div><input id="room-code" value={roomCode} maxLength={12} autoComplete="off" onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="VD: PHUM2026" /><Button type="submit" disabled={!roomCode.trim()}>Vào phòng</Button></div></form></Card><div className="quiz-principles"><article><BookOpenCheck size={20} /><div><strong>Học từ lời giải</strong><span>Hiểu lý do sau từng câu, không chỉ ghi nhớ đáp án.</span></div></article><article><Trophy size={20} /><div><strong>Thi đua minh bạch</strong><span>Xếp hạng theo số câu đúng và số câu đã trả lời.</span></div></article></div></section><BottomNav /></main>;
}
