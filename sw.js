/* Soleil Couchant : service worker.
   - L'appli (index, icônes, manifest) est gardée en cache : elle s'ouvre sans réseau.
   - sermons.json : réseau d'abord, sinon la dernière copie.
   - Audio et transcriptions : gérés par l'appli elle-même (téléchargement volontaire). */
const V = 'sc-shell-v3';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'sermons.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('sc-shell-') && k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req) {
  const c = await caches.open(V);
  try {
    const r = await fetch(req, { cache: 'no-cache' });
    if (r.ok) c.put(req, r.clone());
    return r;
  } catch {
    return (await c.match(req, { ignoreSearch: true })) || Response.error();
  }
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(V);
  const hit = await c.match(req, { ignoreSearch: true });
  const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // polices Google : copie locale après la première visite
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }
  if (url.origin !== location.origin) return;                 // YouTube, miniatures, etc. : on ne touche à rien
  if (/\/(audio|transcripts)\//.test(url.pathname)) return;   // gérés par l'appli

  if (url.pathname.endsWith('/sermons.json')) { e.respondWith(networkFirst(req)); return; }
  if (req.mode === 'navigate') {
    e.respondWith(staleWhileRevalidate(new Request('./')).then(r => r.ok ? r : fetch(req)));
    return;
  }
  e.respondWith(staleWhileRevalidate(req));
});
