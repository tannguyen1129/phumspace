"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { ApiError, login, saveTokens } from "../../lib/api-client";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FeedbackState } from "../../components/ui/FeedbackState";
import { AuthShell } from "../../components/AuthShell";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login({ email, password, mfaCode: mfaCode || undefined });
      saveTokens(result.tokens);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.message === "MFA_REQUIRED") { setMfaRequired(true); setError("Nhập mã 6 số từ ứng dụng xác thực."); }
      else setError(err instanceof ApiError ? err.message : "Đăng nhập không thành công.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
        <PageHeader eyebrow="Chào mừng trở lại" title="Đăng nhập" subtitle="Tiếp tục hành trình khám phá của bạn." />
        <Card>
          <form onSubmit={handleSubmit}>
            <label className="ps-field">
              <span className="ps-field-label">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="ps-input" />
            </label>
            {mfaRequired && <label className="ps-field"><span className="ps-field-label">Mã xác thực hai bước</span><input className="ps-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ""))} /></label>}
            <label className="ps-field">
              <span className="ps-field-label">Mật khẩu <Link href="/forgot-password" style={{ fontWeight: 600 }}>Quên mật khẩu?</Link></span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="ps-input"
              />
            </label>
            {error && <FeedbackState title="Không thể đăng nhập" description={error} />}
            <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%" }}>
              <LogIn size={18} aria-hidden="true" /> {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <p style={{ textAlign: "center", margin: "18px 0 0", color: "var(--ink-500)", fontSize: 14 }}>Chưa có tài khoản? <Link href="/register" style={{ fontWeight: 700 }}>Tạo tài khoản</Link></p>
          </form>
        </Card>
    </AuthShell>
  );
}
