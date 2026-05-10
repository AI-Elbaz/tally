const CACHE = "reboot-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/src/main.jsx", // Note: Vite often bundles this as assets, see below
  "/src/App.jsx",
  "/src/store.js",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Return cached version if found, otherwise fetch from network
      return cached || fetch(e.request).catch(() => cached);
    }),
  );
});
