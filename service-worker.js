const CACHE_NAME = 'no-complaints-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon 192x192.png',
  '/icon 512x512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of clients immediately
  );
  
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetching resource: ', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('[Service Worker] Using cached version of:', event.request.url);
          return response;
        }
        
        // Make network request and cache the response
        return fetch(event.request).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              console.log('[Service Worker] Caching new resource:', event.request.url);
              cache.put(event.request, responseToCache);
            });
            
          return response;
        }).catch(() => {
          // If fetch fails, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
