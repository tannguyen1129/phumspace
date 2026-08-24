"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { downloadForOffline, isDownloaded, removeDownload } from "../lib/offline-downloads";

/** Nut "Tai xuong offline" (FR-PWA-005) — dung tren Place Detail va Handbook term. */
export function OfflineDownloadButton({
  id,
  kind,
  title,
  apiPaths,
  mediaUrls,
}: {
  id: string;
  kind: "place" | "term";
  title: string;
  apiPaths: string[];
  mediaUrls?: string[];
}) {
  const [downloaded, setDownloaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDownloaded(isDownloaded(id));
  }, [id]);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      if (downloaded) {
        await removeDownload(id);
        setDownloaded(false);
      } else {
        await downloadForOffline({ id, kind, title, apiPaths, mediaUrls });
        setDownloaded(true);
      }
    } catch {
      setError("Khong the luu offline luc nay — vui long thu lai.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={busy} style={buttonStyle}>
        {downloaded ? "✓ Đã tải offline — Xoá" : "⭳ Tải xuống offline"}
      </button>
      {error && (
        <p role="alert" style={{ color: "crimson", fontSize: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}

const buttonStyle: CSSProperties = {
  minHeight: "var(--min-touch-target)",
  padding: "0 16px",
  borderRadius: "var(--card-radius)",
  border: "1px solid var(--color-palm-green)",
  background: "transparent",
  color: "var(--color-palm-green)",
  fontWeight: 600,
};
