"use client";

import { useEffect, useState } from "react";

/**
 * FR-PWA-003: nguoi dung phai thay ro trang thai online/offline va tinh nang nao bi han che —
 * khong hien spinner vo han khi mat mang.
 */
export function OnlineStatusBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "8px 16px",
        textAlign: "center",
        fontSize: 13,
        background: "var(--color-saffron-accent)",
        color: "var(--color-ivory-surface)",
      }}
    >
      Bạn đang ngoại tuyến — chỉ xem được nội dung đã tải trước đó. Quét AI và phòng thi trực
      tuyến tạm thời không khả dụng.
    </div>
  );
}
