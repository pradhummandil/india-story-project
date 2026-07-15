const CACHE_NAME = "isp-v1";
const OFFLINE_FALLBACK = "/offline.html";

const STATIC_ASSETS = [
  "/",
  OFFLINE_FALLBACK,
  "/manifest.json",
];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  (self as any).skipWaiting();
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  (self as any).clients.claim();
});

self.addEventListener("fetch", (event: any) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_FALLBACK) || new Response("Offline");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
