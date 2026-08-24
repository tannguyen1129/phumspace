"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { ApiError, forgotPassword } from "../../lib/api-client";
import { AuthShell } from "../../components/AuthShell";
import { Button, Card, FeedbackState, PageHeader } from "../../components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [devToken, setDevToken] = useState<string>();
  const [error, setError] = useState<string>();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(undefined);
    try { const result = await forgotPassword(email); setMessage(result.message); setDevToken(result.devPasswordResetToken); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "Chưa thể gửi yêu cầu."); }
    finally { setBusy(false); }
  }
  return <AuthShell><PageHeader eyebrow="Khôi phục tài khoản" title="Quên mật khẩu" subtitle="Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu."/><Card>{message ? <FeedbackState kind="success" title="Kiểm tra hộp thư của bạn" description={message} action={devToken ? <Link className="ps-btn ps-btn--primary" href={`/reset-password?token=${encodeURIComponent(devToken)}`}>Mở liên kết thử nghiệm</Link> : undefined}/> : <form onSubmit={submit}><label className="ps-field"><span className="ps-field-label">Email</span><input className="ps-input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>{error&&<FeedbackState title="Chưa gửi được yêu cầu" description={error}/>}<Button type="submit" disabled={busy} style={{width:"100%"}}><Mail size={17}/>{busy?"Đang gửi…":"Gửi hướng dẫn"}</Button></form>}<p className="auth-back"><Link href="/login"><ArrowLeft size={15}/> Quay lại đăng nhập</Link></p></Card></AuthShell>;
}
