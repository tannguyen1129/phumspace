"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { getAccessToken } from "../lib/api-client";
import { listOfflineMutations, removeOfflineMutation } from "../lib/offline-mutation-queue";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export function OfflineMutationSync() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const refresh = useCallback(async () => {
    if ("indexedDB" in window) setPending((await listOfflineMutations()).length);
  }, []);
  const sync = useCallback(async () => {
    if (!navigator.onLine || syncing || !("indexedDB" in window)) return;
    setSyncing(true);
    try {
      const token = getAccessToken();
      for (const item of await listOfflineMutations()) {
        const response = await fetch(`${API_BASE_URL}${item.path}`, {
          method: item.method,
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), "Idempotency-Key": item.id },
          body: item.body,
        }).catch(() => null);
        if (!response?.ok) break;
        await removeOfflineMutation(item.id);
      }
    } finally {
      setSyncing(false);
      await refresh();
    }
  }, [refresh, syncing]);
  useEffect(() => {
    void refresh().then(sync);
    const handleQueue = () => void refresh();
    const handleOnline = () => void sync();
    window.addEventListener("phumspace:offline-queue", handleQueue);
    window.addEventListener("online", handleOnline);
    return () => { window.removeEventListener("phumspace:offline-queue", handleQueue); window.removeEventListener("online", handleOnline); };
  }, [refresh, sync]);
  if (!pending) return null;
  return <button className="offline-sync-status" type="button" onClick={() => void sync()} disabled={syncing}>
    {syncing ? <RefreshCw className="ps-spin" size={17} /> : <CloudOff size={17} />}
    <span>{syncing ? "Đang đồng bộ…" : `${pending} thay đổi chờ đồng bộ`}</span>
  </button>;
}
