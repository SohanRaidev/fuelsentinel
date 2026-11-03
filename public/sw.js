// Divine Fuel Service Worker - Network-First for Instant Updates
const CACHE_NAME = 'divinefuel-v3.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // External APIs or WebSocket requests - network only
  if (url.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-First for ALL local assets (HTML, JS, CSS, JSON)
  // Ensures user ALWAYS gets the freshest code on refresh, falling back to cache only when offline
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Network offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Push notification hook for theft alert
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🚨 CRITICAL: Rapid Fuel Drop Detected!';
  const options = {
    body: data.body || 'Sudden fuel drain with ignition OFF! Immediate action required.',
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [400, 150, 400, 150, 800],
    tag: 'fuel-theft-alarm',
    renotify: true,
    data: {
      url: '/#alerts'
    }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/#alerts') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/#alerts');
      }
    })
  );
});
