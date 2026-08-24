import { WifiOff } from "lucide-react";

/**
 * Trang fallback offline (FR-PWA-001/002) — service worker tra ve trang nay khi navigate that
 * bai vi mat mang va URL dich khong nam trong cache nao (xem public/sw.js). La Server Component
 * tinh, khong goi API, de luon precache duoc luc install.
 */
export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-3)",
        textAlign: "center",
        padding: "var(--content-padding-mobile)",
      }}
    >
      <WifiOff size={40} aria-hidden="true" style={{ color: "var(--color-heritage-gold)" }} />
      <h1 style={{ margin: 0 }}>Bạn đang ngoại tuyến</h1>
      <p style={{ margin: 0, maxWidth: 320 }}>
        Trang này chưa được tải sẵn để xem offline. Hãy thử lại khi có kết nối mạng, hoặc mở lại nội dung bạn đã tải
        xuống trong mục &quot;Tôi&quot;.
      </p>
      <a href="/" className="ps-btn ps-btn--primary" style={{ marginTop: "var(--space-2)", textDecoration: "none" }}>
        Thử lại
      </a>
    </main>
  );
}
