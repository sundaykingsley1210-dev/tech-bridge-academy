const CACHE_NAME = 'tba-demo-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/admission.html',
  '/admin-dashboard.html',
  '/student-dashboard.html',
  '/teacher-dashboard.html',
  '/internal-exam.html',
  '/student-card.html',
  '/style.css',
  '/script.js',
  '/api.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192.svg',
  '/icon-512.svg',
  '/logo.svg',
  '/ceo.png',
  '/hero-bg.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('api.web3forms.com') ||
      event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  const cache = await caches.open(CACHE_NAME);
  for (const url of ASSETS) {
    try {
      const response = await fetch(url);
      if (response.ok) await cache.put(url, response);
    } catch (e) {}
  }
}
