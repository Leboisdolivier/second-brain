const CACHE = 'sb-share-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Tout POST dans le scope = partage depuis la galerie
self.addEventListener('fetch', event => {
  if (event.request.method === 'POST') {
    event.respondWith(handleShare(event.request));
  }
});

async function handleShare(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('image');
    if (!files.length) return Response.redirect('/second-brain/', 303);
    const cache = await caches.open(CACHE);
    const keys = await cache.keys();
    for (const k of keys) await cache.delete(k);
    for (let i = 0; i < files.length; i++) {
      await cache.put(`/sb-shared-${i}`, new Response(files[i], {
        headers: { 'Content-Type': files[i].type || 'image/jpeg' }
      }));
    }
    await cache.put('/sb-shared-meta', new Response(JSON.stringify({ count: files.length })));
  } catch (e) { console.error('SW share error:', e); }
  return Response.redirect('/second-brain/?shared=1', 303);
}
