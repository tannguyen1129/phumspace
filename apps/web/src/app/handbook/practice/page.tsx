"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { ApiError, getPracticeDeck, recordPractice, type HandbookTerm } from "../../../lib/api-client";
import { Button, Card, CardSkeleton, FeedbackState, PageHeader } from "../../../components/ui";
export default function HandbookPracticePage() {
  const [terms,setTerms]=useState<HandbookTerm[]>([]),[index,setIndex]=useState(0),[revealed,setRevealed]=useState(false),[loading,setLoading]=useState(true); const [error,setError]=useState<string>();
  useEffect(()=>{getPracticeDeck().then(setTerms).catch(e=>setError(e instanceof ApiError?e.message:"Không tải được thẻ học.")).finally(()=>setLoading(false));},[]);
  const current=terms[index]; async function rate(result:"AGAIN"|"HARD"|"GOOD"){if(!current)return;try{await recordPractice(current.id,result);setRevealed(false);setIndex(v=>v+1);}catch(e){setError(e instanceof ApiError?e.message:"Không lưu được kết quả.");}}
  if(loading)return <main><PageHeader backHref="/handbook" title="Luyện flashcard"/><div className="quiz-shell"><CardSkeleton lines={4}/></div></main>;
  if(!current)return <main><PageHeader backHref="/handbook" title="Luyện flashcard"/><div className="quiz-shell"><FeedbackState title={terms.length?"Hoàn thành lượt ôn!":"Chưa có thẻ để học"} description={terms.length?`Bạn đã ôn ${terms.length} từ. Lịch ôn tiếp theo đã được cập nhật.`:(error??"Kho từ vựng hiện chưa có dữ liệu.")} action={<Link href="/handbook" className="ps-btn ps-btn--secondary"><CheckCircle2 size={16}/> Về cẩm nang</Link>}/></div></main>;
  return <main><PageHeader backHref="/handbook" eyebrow={`THẺ ${index+1} / ${terms.length}`} title="Luyện flashcard"/><section className="quiz-shell"><div className="quiz-progress" role="progressbar" aria-valuemin={0} aria-valuemax={terms.length} aria-valuenow={index+1}><span style={{width:`${((index+1)/terms.length)*100}%`}}/></div><Card className="flashcard" aria-live="polite"><small>TIẾNG KHMER</small><strong lang="km">{current.khmerText}</strong>{current.latinTransliteration&&<span>{current.latinTransliteration}</span>}{revealed?<div className="flashcard__answer"><small>NGHĨA</small><h2>{current.meaningVi}</h2>{current.meaningEn&&<p>{current.meaningEn}</p>}</div>:<Button onClick={()=>setRevealed(true)}>Lật thẻ xem nghĩa</Button>}</Card>{revealed&&<div className="flashcard__ratings" aria-label="Mức độ ghi nhớ"><Button variant="secondary" onClick={()=>rate("AGAIN")}><RotateCcw size={16}/> Học lại</Button><Button variant="secondary" onClick={()=>rate("HARD")}>Còn khó</Button><Button onClick={()=>rate("GOOD")}><CheckCircle2 size={16}/> Đã nhớ</Button></div>}{error&&<FeedbackState title="Có sự cố" description={error}/>}</section></main>;
}
