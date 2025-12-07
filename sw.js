const CACHE_NAME = 'taipei-journey-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Attempt to cache core files, but don't fail installation if one fails
        return cache.addAll(urlsToCache).catch(err => {
            console.warn('Failed to cache some assets during install', err);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // Network first strategy for API/Dynamic content, Cache fallback for static
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});