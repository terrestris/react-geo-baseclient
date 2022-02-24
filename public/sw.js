var doCaching = true;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STOP_CACHING') {
    doCaching = false;
  }
  if (event.data && event.data.type === 'START_CACHING') {
    doCaching = true;
  }
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open('react-geo-baseclient').then(function (cache) {
      if (!doCaching) {
        return fetch(event.request);
      }
      return cache.match(event.request).then(function (response) {
        return (
          response ||
          fetch(event.request).then(function (netResponse) {
            if (!event.request.url.startsWith('chrome')) {
              cache.put(event.request, netResponse.clone());
            }
            return netResponse;
          })
        );
      });
    }),
  );
});
