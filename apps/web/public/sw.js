// Service worker M6 — chien luoc offline theo lop (System Design muc 17.1, UX Flow muc 14.2
// "Offline behavior matrix"):
//   - App shell (JS/CSS/manifest/offline fallback): precache + versioned, invalidate khi deploy.
//   - Published content (GET /v1/discovery, /v1/phumdata, /v1/handbook): stale-while-revalidate,
//     tra ve cache ngay roi lam moi ngam — dung cho Map/Handbook "co chon loc" trong ma tran.
//   - Goi noi dung nguoi dung chu dong tai xuong: cache rieng "phumspace-downloads-v1"
//     (apps/web/src/lib/offline-downloads.ts ghi truc tiep), KHONG bi don don o buoc activate
//     vi khong doi ten theo VERSION — nguoi dung tu quan ly (xoa qua UI /me).
//   - Scanner/Olympiad: khong cache — hang doi pending scan xu ly rieng o IndexedDB
//     (apps/web/src/lib/offline-scan-queue.ts), khong qua service worker.
const VERSION = "v4";
const SHELL_CACHE = `phumspace-shell-${VERSION}`;
const RUNTIME_CACHE = `phumspace-runtime-${VERSION}`;
const DOWNLOAD_CACHE = "phumspace-downloads-v1";

const APP_SHELL = ["/welcome", "/manifest.json", "/offline", "/icons/icon.svg"];

const RUNTIME_CACHEABLE_PATH_PREFIXES = ["/v1/discovery", "/v1/phumdata", "/v1/handbook"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE && key !== DOWNLOAD_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
self.addEventListener("message",(event)=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting();});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Khong can thiep tai nguyen cross-origin va khong bao gio cache chunk Next theo kieu
  // cache-first. Moi deploy tao chunk id moi; giu runtime/chunk lech phien ban se lam app crash.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Dieu huong trang (hard navigation) — offline fallback ro rang thay vi loi trinh duyet mac dinh.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match("/offline")) ?? (await caches.match("/")))
    );
    return;
  }

  if (
    !request.headers.has("Authorization") &&
    RUNTIME_CACHEABLE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // App shell asset hoac goi da tai offline: cache-first (tim o moi cache cua origin), roi moi ve mang.
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).catch(() => undefined))
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;

  const network = await networkFetch;
  if (network) return network;

  // Khong co trong runtime cache — thu goi nguoi dung da chu dong tai xuong (Place/Term detail).
  const downloaded = await caches.match(request);
  if (downloaded) return downloaded;

  return new Response(JSON.stringify({ message: "Khong co du lieu offline cho noi dung nay." }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}
