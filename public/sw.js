// WizMedik service worker cleanup shim.
// PWA caching is disabled, so any previously installed service worker must
// unregister itself and clear old caches as soon as the browser updates it.

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

    await self.registration.unregister();

    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    await Promise.all(
      clients.map((client) => {
        if ('navigate' in client) {
          return client.navigate(client.url);
        }

        return Promise.resolve();
      })
    );
  })());
});
