/**
 * Install-only service worker — satisfies PWA install criteria without offline caching.
 * No fetch handler: all requests use the network as usual.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
