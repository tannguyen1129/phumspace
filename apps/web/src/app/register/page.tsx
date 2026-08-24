"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { ApiError, register, saveTokens } from "../../lib/api-client";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FeedbackState } from "../../components/ui/FeedbackState";
import { AuthShell } from "../../components/AuthShell";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await register({ email, password, displayName });
      saveTokens(result.tokens);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng ký không thành công.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
        <PageHeader eyebrow="Bắt đầu miễn phí" title="Tạo tài khoản" subtitle="Chỉ mất một phút để bắt đầu." />
        <Card>
          <form onSubmit={handleSubmit}>
            <label className="ps-field">
              <span className="ps-field-label">Tên hiển thị</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                minLength={1}
                maxLength={120}
                className="ps-input"
              />
            </label>
            <label className="ps-field">
              <span className="ps-field-label">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="ps-input" />
            </label>
            <label className="ps-field">
              <span className="ps-field-label">Mật khẩu (tối thiểu 8 ký tự)</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="ps-input"
              />
            </label>
            {error && <FeedbackState title="Không thể tạo tài khoản" description={error} />}
            <Button type="submit" variant="primary" disabled={loading} style={{ width: "100%" }}>
              <UserPlus size={18} aria-hidden="true" /> {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
            <p style={{ margin: "12px 0 0", color: "var(--ink-500)", fontSize: 12, lineHeight: 1.6 }}>Khi tiếp tục, bạn đồng ý sử dụng PhumSpace có trách nhiệm và tôn trọng quyền của cộng đồng.</p>
            <p style={{ textAlign: "center", margin: "16px 0 0", color: "var(--ink-500)", fontSize: 14 }}>Đã có tài khoản? <Link href="/login" style={{ fontWeight: 700 }}>Đăng nhập</Link></p>
          </form>
        </Card>
    </AuthShell>
  );
}
