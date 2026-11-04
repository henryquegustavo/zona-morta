// Service worker do Zona Morta: deixa o site instalável como aplicativo e guarda uma cópia para abrir mais rápido.
// A página é buscada primeiro na internet (para sempre pegar a versão nova); sem internet, usa a cópia guardada.
const CACHE = 'zm-v1';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return;
  if (u.hostname.endsWith('supabase.co')) return;               // a sala (tempo real) nunca passa pelo cache
  if (r.mode === 'navigate' || u.pathname === '/' || u.pathname.endsWith('.html')){
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('/index.html', cp)); return res; }).catch(() => caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque'){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })));
});
