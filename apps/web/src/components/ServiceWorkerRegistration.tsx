"use client";

import { useEffect } from "react";

/** Dang ky public/sw.js phia client. Chien luoc cache day du se den o Milestone M6. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    // Service worker cache va HMR cua Next dev khong duoc chay cung nhau: chunk id thay doi
    // lien tuc co the lam runtime giu webpack-runtime cu va nem "Cannot find module ./xxx.js".
    // Dev tu don registration/cache cu de loi khong tai dien sau khi checkout/build lai.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      );
      if ("caches" in window) {
        void caches.keys().then((keys) =>
          Promise.all(keys.filter((key) => key.startsWith("phumspace-")).map((key) => caches.delete(key)))
        );
      }
      return;
    }
    navigator.serviceWorker.register("/sw.js").then((registration)=>{if(registration.waiting)registration.waiting.postMessage({type:"SKIP_WAITING"});registration.addEventListener("updatefound",()=>{const worker=registration.installing;worker?.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)worker.postMessage({type:"SKIP_WAITING"});});});}).catch((error: unknown) => { console.error("[pwa] khong the dang ky service worker:", error); });
  }, []);

  return null;
}
