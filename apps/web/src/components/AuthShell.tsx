import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page"><div className="auth-shell">
      <aside className="auth-story">
        <Link href="/welcome" className="auth-logo" style={{ color: "white" }}><span className="auth-logo-mark" aria-hidden="true">ភ</span>PhumSpace</Link>
        <span className="ps-badge" style={{ background: "rgba(255,255,255,.12)", color: "white", marginBottom: 18 }}><ShieldCheck size={13} /> Tri thức được kiểm chứng</span>
        <h1>Chạm vào một vùng văn hóa đang sống.</h1>
        <p>Khám phá Trà Vinh qua địa điểm, câu chuyện, ngôn ngữ và tiếng nói của cộng đồng Khmer Nam Bộ.</p>
      </aside>
      <section className="auth-form">{children}</section>
    </div></main>
  );
}
