"use client";

import { getAccessToken } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
/** Khong versioned nhu cache app shell — goi offline la du lieu nguoi dung tu chon tai, phai
 * song qua moi lan deploy/upgrade service worker (xem public/sw.js). */
const DOWNLOAD_CACHE_NAME = "phumspace-downloads-v1";
const MANIFEST_KEY = "ps_offline_downloads";

export interface OfflineDownloadEntry {
  id: string;
  kind: "place" | "term";
  title: string;
  urls: string[];
  downloadedAt: string;
  approxBytes: number;
}

export function listDownloads(): OfflineDownloadEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MANIFEST_KEY) ?? "[]") as OfflineDownloadEntry[];
  } catch {
    return [];
  }
}

function saveManifest(entries: OfflineDownloadEntry[]): void {
  localStorage.setItem(MANIFEST_KEY, JSON.stringify(entries));
}

export function isDownloaded(id: string): boolean {
  return listDownloads().some((entry) => entry.id === id);
}

/**
 * Tai 1 goi noi dung offline (FR-PWA-005, FR-PER-005): luu response API + media vao Cache
 * Storage rieng (khong dung chung cache runtime cua service worker de khong bi don don theo
 * chinh sach versioned cache — xem 14.2 "Offline behavior matrix"). Manifest luu localStorage
 * de UI /me hien thi dung luong/ngay tai ma khong can doc lai tung Cache entry.
 */
export async function downloadForOffline(input: {
  id: string;
  kind: "place" | "term";
  title: string;
  apiPaths: string[];
  mediaUrls?: string[];
}): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    throw new Error("Trinh duyet khong ho tro luu noi dung offline.");
  }
  const cache = await caches.open(DOWNLOAD_CACHE_NAME);
  const urls: string[] = [];
  let approxBytes = 0;

  for (const path of input.apiPaths) {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${getAccessToken()}` } });
    if (!response.ok) continue;
    const size = (await response.clone().blob()).size;
    await cache.put(url, response);
    urls.push(url);
    approxBytes += size;
  }

  for (const mediaUrl of input.mediaUrls ?? []) {
    const response = await fetch(mediaUrl);
    if (!response.ok) continue;
    const size = (await response.clone().blob()).size;
    await cache.put(mediaUrl, response);
    urls.push(mediaUrl);
    approxBytes += size;
  }

  const entries = listDownloads().filter((entry) => entry.id !== input.id);
  entries.push({
    id: input.id,
    kind: input.kind,
    title: input.title,
    urls,
    downloadedAt: new Date().toISOString(),
    approxBytes,
  });
  saveManifest(entries);
}

export async function removeDownload(id: string): Promise<void> {
  const entries = listDownloads();
  const entry = entries.find((item) => item.id === id);
  if (entry && "caches" in window) {
    const cache = await caches.open(DOWNLOAD_CACHE_NAME);
    await Promise.all(entry.urls.map((url) => cache.delete(url)));
  }
  saveManifest(entries.filter((item) => item.id !== id));
}

export async function getOfflineStorageEstimate(): Promise<{usage:number;quota:number;persisted:boolean}> { const estimate=await navigator.storage?.estimate?.(); const persisted=await navigator.storage?.persisted?.(); return {usage:estimate?.usage??0,quota:estimate?.quota??0,persisted:Boolean(persisted)}; }
export async function requestPersistentOfflineStorage():Promise<boolean>{return Boolean(await navigator.storage?.persist?.());}
