const CACHE = 'sb-share-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.searchParams.has('share-target')) {
    event.respondWith(handleShare(event.request));
    return;
  }
});

async function handleShare(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('image');
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
