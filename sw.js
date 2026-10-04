/* عمه‌جان — کشِ آفلاین. با هر انتشارِ جدید، VERSION را بالا ببر. */
const VERSION = 'ameh-v1';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'icon-180.png',
  'fonts/Vazirmatn-400.woff2', 'fonts/Vazirmatn-600.woff2', 'fonts/Vazirmatn-800.woff2', 'fonts/Lalezar.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // صفحه: اول شبکه (نسخه‌ی تازه)، اگر نبود کش
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('index.html', c)); return r; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  // بقیه (فونت، آیکون): اول کش
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r;
    }))
  );
});
