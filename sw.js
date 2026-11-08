// Newcastle Sipariş: iPhone / web uygulamasının internetsiz çalışması.
// Dosyalar önce telefondaki önbellekten açılır, arkada yenisi indirilir; yeni sürüm bir sonraki açılışta görünür.
// (Android APK bunu kullanmaz; dosyaları zaten APK'nın içinden alır.)
const CACHE = 'nc-v1';
const FILES = ['./', 'index.html', 'app.js', 'menu.js', 'icerik.js', 'style.css', 'logo.jpg',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  // Sadece uygulamanın kendi dosyaları (APK indirmesi vb. dokunulmadan geçer)
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode !== 'navigate' && !/\.(html|js|css|jpg|png|webmanifest)$/.test(url.pathname)) return;

  const fresh = fetch(req).then(r => {
    if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  }).catch(() => null);
  e.waitUntil(fresh);

  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit =>
    hit || fresh.then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
