import Link from "next/link";
import { BookOpen, HeartHandshake, MapPin, ScanLine } from "lucide-react";
export function SiteFooter() {
  return <footer className="site-footer"><div className="site-footer__inner">
    <div className="site-footer__about"><Link href="/" className="site-brand site-brand--footer"><span className="site-brand__mark" aria-hidden="true">ភ</span><span><strong>PhumSpace</strong><small>Khmer Nam Bộ</small></span></Link><p>Tri thức có nguồn, trải nghiệm có trách nhiệm và tôn trọng cộng đồng Khmer Nam Bộ.</p></div>
    <div><strong>Khám phá</strong><Link href="/map"><MapPin size={15} /> Bản đồ</Link><Link href="/festivals">Lễ hội</Link><Link href="/handbook"><BookOpen size={15} /> Cẩm nang</Link></div>
    <div><strong>Cộng đồng</strong><Link href="/scan"><ScanLine size={15} /> AI Scanner</Link><Link href="/contribute"><HeartHandshake size={15} /> Đóng góp</Link><Link href="/support">Hỗ trợ</Link></div>
    <div><strong>Thông tin</strong><Link href="/legal">Quyền riêng tư & pháp lý</Link><Link href="/me">Tài khoản của tôi</Link></div>
  </div><div className="site-footer__bottom"><span>© {new Date().getFullYear()} PhumSpace</span><span>Khởi tạo tại Trà Vinh, Việt Nam</span></div></footer>;
}
