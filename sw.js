// Service worker: degraded offline mode for the learning path (plan.md §2).
// Caches the app shell and the read-only learning content so learners can
// keep reviewing modules and resources without a connection. Mutating API
// calls (auth, sync, scoring, submissions) are never cached and require a
// network, which is the documented degraded behaviour.

const CACHE_NAME = "learning-path-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./lib/engine.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./data/plan.en.json",
  "./data/plan.fr.json",
  "./data/academy.en.json",
  "./data/academy.fr.json",
  "./data/academy-settings.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Best-effort precache: in server mode ./data/ is intentionally not
      // served (content comes sanitized from /api/content/), so failures
      // for individual entries are tolerated.
      await Promise.allSettled(APP_SHELL.map((asset) => cache.add(asset)));
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isCacheableContent = (url) =>
  url.pathname.endsWith(".json") && (url.pathname.includes("/data/") || url.pathname.includes("/api/content/"));

const isApiCall = (url) => url.pathname.includes("/api/") && !url.pathname.includes("/api/content/");

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiCall(url)) return; // live API calls only, never cached

  if (isCacheableContent(url)) {
    // Stale-while-revalidate for learning content.
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || refresh;
      })
    );
    return;
  }

  // App shell: network first, fall back to cache when offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
