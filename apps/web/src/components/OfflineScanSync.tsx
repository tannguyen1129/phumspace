"use client";

import { useEffect } from "react";
import { createScan } from "../lib/api-client";
import { listPendingScans, removePendingScan } from "../lib/offline-scan-queue";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Dong bo hang doi quet offline (FR-PWA-004) — mount o root layout de chay bat ke user dang o
 * trang nao khi mang co lai, khong chi khi ho quay lai /scan.
 */
export function OfflineScanSync() {
  useEffect(() => {
    async function flush() {
      const pending = await listPendingScans().catch(() => []);
      for (const scan of pending) {
        try {
          const extension = EXTENSION_BY_MIME[scan.mimeType] ?? "jpg";
          const file = new File([scan.blob], `offline-scan.${extension}`, { type: scan.mimeType });
          await createScan(file, scan.placeId);
          await removePendingScan(scan.id);
        } catch {
          // Con loi (vd het phien dang nhap) — giu lai trong hang doi, thu lai lan sau.
        }
      }
    }

    if (navigator.onLine) void flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, []);

  return null;
}
