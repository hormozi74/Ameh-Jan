/* عمه‌جان — کشِ آفلاین. VERSION و نشانیِ data.js را build/inject.js با هشِ داده می‌نویسد؛
   داده که عوض شود کشِ قدیمی پاک می‌شود. صفحه همیشه اول از شبکه می‌آید. */
const VERSION = 'ameh-df2d1193ba1';
const DATA = 'data.js?v=f2d1193ba1';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', DATA,
  'icon-192.png', 'icon-512.png', 'icon-180.png', 'icon-maskable-512.png', 'icon.svg', 'favicon.ico', 'favicon-32.png',
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
