// Guarda la app (no los datos) para que abra sin internet. Subir VERSION al publicar cambios.
const VERSION = 'consultorio-v1';
const APP = ['./', 'index.html', 'app.css', 'app.js', 'importar-word.js', 'manifest.webmanifest', 'icono.svg', 'icono-192.png'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero la red (para recibir cambios); si no hay internet, lo guardado. La planilla de Google no se toca.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || /script\.google/.test(e.request.url)) return;
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok || r.type === 'opaque') { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
