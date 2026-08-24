"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ApiError, resetPassword } from "../../lib/api-client";
import { AuthShell } from "../../components/AuthShell";
import { Button, Card, FeedbackState, PageHeader } from "../../components/ui";

export default function ResetPasswordPage() {
  const [token,setToken]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false); const [done,setDone]=useState(false); const [error,setError]=useState<string>();
  useEffect(()=>setToken(new URLSearchParams(window.location.search).get("token")??""),[]);
  async function submit(event:FormEvent){event.preventDefault();setError(undefined);if(password!==confirm){setError("Hai mật khẩu chưa khớp.");return;}setBusy(true);try{await resetPassword(token,password);setDone(true);}catch(reason){setError(reason instanceof ApiError?reason.message:"Chưa thể đặt lại mật khẩu.");}finally{setBusy(false)}}
  return <AuthShell><PageHeader eyebrow="Bảo mật tài khoản" title="Đặt mật khẩu mới" subtitle="Liên kết chỉ sử dụng được một lần và sẽ hết hạn sau một giờ."/><Card>{done?<FeedbackState kind="success" title="Đã đổi mật khẩu" description="Tất cả phiên đăng nhập cũ đã được thu hồi." action={<Link href="/login" className="ps-btn ps-btn--primary">Đăng nhập lại</Link>}/>:<form onSubmit={submit}>{!token&&<FeedbackState title="Thiếu mã khôi phục" description="Hãy mở đúng liên kết trong email đặt lại mật khẩu."/>}<label className="ps-field"><span className="ps-field-label">Mật khẩu mới</span><input className="ps-input" type="password" minLength={8} maxLength={72} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="ps-field"><span className="ps-field-label">Nhập lại mật khẩu</span><input className="ps-input" type="password" minLength={8} autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error&&<FeedbackState title="Chưa thể đổi mật khẩu" description={error}/>}<Button type="submit" disabled={busy||!token} style={{width:"100%"}}><KeyRound size={17}/>{busy?"Đang cập nhật…":"Đổi mật khẩu"}</Button></form>}</Card></AuthShell>;
}
