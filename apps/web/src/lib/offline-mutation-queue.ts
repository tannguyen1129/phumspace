const DB_NAME = "phumspace-offline-mutations";
const STORE_NAME = "requests";
const DB_VERSION = 1;

export interface OfflineMutation {
  id: string;
  path: string;
  method: "POST" | "PATCH";
  body: string;
  createdAt: string;
  label: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueOfflineMutation(mutation: Omit<OfflineMutation, "id" | "createdAt">): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ ...mutation, id: crypto.randomUUID(), createdAt: new Date().toISOString() } satisfies OfflineMutation);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  window.dispatchEvent(new Event("phumspace:offline-queue"));
}

export async function listOfflineMutations(): Promise<OfflineMutation[]> {
  const database = await openDatabase();
  const result = await new Promise<OfflineMutation[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as OfflineMutation[]);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeOfflineMutation(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
