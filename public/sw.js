// Service Worker for Knight Sudoku PWA
// Caches all assets for offline play.

const CACHE_NAME = "knight-sudoku-v1";

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/icon.svg",
        "/icon-192.png",
        "/icon-512.png",
      ]);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache first, fall back to network, cache new responses
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Don't cache non-ok responses or chrome-extension requests
        if (
          !response ||
          response.status !== 200 ||
          response.type === "opaque"
        ) {
          return response;
        }

        // Cache the new response
        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache);
        });

        return response;
      });
    })
  );
});
