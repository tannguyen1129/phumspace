"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, verifyEmail } from "../../lib/api-client";
import { AuthShell } from "../../components/AuthShell";
import { Card, FeedbackState, PageHeader } from "../../components/ui";

export default function VerifyEmailPage(){const[state,setState]=useState<"loading"|"success"|"error">("loading");const[error,setError]=useState("");useEffect(()=>{const token=new URLSearchParams(window.location.search).get("token");if(!token){setError("Liên kết không chứa mã xác minh.");setState("error");return;}verifyEmail(token).then(()=>setState("success")).catch(reason=>{setError(reason instanceof ApiError?reason.message:"Không thể xác minh email.");setState("error")});},[]);return <AuthShell><PageHeader eyebrow="Xác thực danh tính" title="Xác minh email" subtitle="Bảo vệ tài khoản và các đóng góp gắn với bạn."/><Card>{state==="loading"&&<FeedbackState kind="offline" title="Đang xác minh…" description="Quá trình chỉ mất vài giây."/>}{state==="success"&&<FeedbackState kind="success" title="Email đã được xác minh" description="Tài khoản của bạn đã sẵn sàng." action={<Link className="ps-btn ps-btn--primary" href="/">Tiếp tục khám phá</Link>}/>} {state==="error"&&<FeedbackState title="Liên kết không hợp lệ" description={error} action={<Link className="ps-btn ps-btn--secondary" href="/support">Nhận trợ giúp</Link>}/>}</Card></AuthShell>}
