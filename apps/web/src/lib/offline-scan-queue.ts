"use client";

/**
 * Hang doi quet AI khi offline (FR-PWA-004, UX "Offline behavior matrix" — Scanner AI: luu
 * pending upload, phan tich khi online). Dung IndexedDB truc tiep (khong qua thu vien) vi chi
 * can 1 object store don gian va can luu Blob anh — localStorage khong phu hop cho binary lon.
 */
const DB_NAME = "phumspace-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-scans";

export interface PendingScan {
  id: string;
  blob: Blob;
  mimeType: string;
  placeId?: string;
  queuedAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queuePendingScan(input: { blob: Blob; mimeType: string; placeId?: string }): Promise<void> {
  const db = await openDb();
  const entry: PendingScan = {
    id: crypto.randomUUID(),
    blob: input.blob,
    mimeType: input.mimeType,
    placeId: input.placeId,
    queuedAt: new Date().toISOString(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listPendingScans(): Promise<PendingScan[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as PendingScan[]);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingScan(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
