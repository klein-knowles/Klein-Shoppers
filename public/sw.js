const CACHE_NAME = "klein-shoppers-uganda-v8";
const APP_SHELL = [
  "./",
  "./index.html",
  "./deals.html",
  "./departments.html",
  "./sell.html",
  "./customer-service.html",
  "./digital-services.html",
  "./device-support.html",
  "./account.html",
  "./orders.html",
  "./videos.html",
  "./styles.css",
  "./css/videos.css",
  "./script.js",
  "./js/videos.js",
  "./manifest.json",
  "./icons/icon.png",
  "./icons/klein-shoppers-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
