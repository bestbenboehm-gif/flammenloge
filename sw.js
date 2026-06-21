// Service Worker für Flammenloge
const CACHE_NAME = 'flammenloge-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/gedichte.html',
  '/handbuch-flammenseele.html',
  '/goetter.html',
  '/impressum.html',
  '/css/main.css',
  '/js/nav.js',
  '/js/particles.js',
  '/js/sound.js',
  '/js/share.js',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap'
];

// Install - Cache aufbauen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('[ServiceWorker] Cache-Fehler:', err);
      })
  );
  self.skipWaiting();
});

// Activate - Alte Caches aufräumen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Alter Cache gelöscht:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Netzwerk-First mit Cache-Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Response klonen für Cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Offline: Cache verwenden
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // Fallback für Navigation
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
