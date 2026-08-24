import Link from "next/link";
import { ArrowRight, BookOpen, MapPin, ScanLine, ShieldCheck } from "lucide-react";

const features = [
  { icon: MapPin, title: "Khám phá đúng nơi", copy: "Địa điểm và thông tin tham quan tại Trà Vinh." },
  { icon: ScanLine, title: "Hiểu điều bạn thấy", copy: "Quét hình ảnh với kết quả dựa trên PhumData." },
  { icon: BookOpen, title: "Nghe và học", copy: "Tiếng Khmer, câu chuyện và nguồn kiểm chứng." },
];

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <span className="auth-logo"><span className="auth-logo-mark" aria-hidden="true">ភ</span>PhumSpace</span>
        <Link href="/login" className="ps-btn ps-btn--ghost">Đăng nhập</Link>
      </header>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="ps-badge ps-badge--verified"><ShieldCheck size={13} /> Tri thức có nguồn, trải nghiệm có trách nhiệm</span>
          <h1>Khám phá văn hóa Khmer Nam Bộ theo một cách sâu sắc hơn.</h1>
          <p>Đi từ địa điểm đến câu chuyện, từ một bức ảnh đến nguồn tư liệu — với cộng đồng luôn ở trung tâm.</p>
          <div className="welcome-actions">
            <Link href="/register" className="ps-btn ps-btn--primary">Tạo tài khoản <ArrowRight size={17} /></Link>
            <Link href="/login" className="ps-btn ps-btn--secondary">Tôi đã có tài khoản</Link>
          </div>
        </div>
        <div className="welcome-art" aria-hidden="true"><span>ភ</span><small>Trà Vinh<br />Khmer Nam Bộ</small></div>
      </section>
      <section className="welcome-features">
        {features.map(({ icon: Icon, title, copy }) => <article key={title}><Icon size={22} /><div><h2>{title}</h2><p>{copy}</p></div></article>)}
      </section>
    </main>
  );
}
