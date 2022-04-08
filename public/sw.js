let doCaching = true;

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'STOP_CACHING') {
    doCaching = false;
  }
  if (event.data && event.data.type === 'START_CACHING') {
    doCaching = true;
  }
});

const putInCache = async (request, response) => {
  const cache = await caches.open('v1');
  await cache.put(request, response);
};

const cacheFirst = async request => {
  const cache = await caches.open('v1');
  const responseFromCache = await cache.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  const responseFromNetwork = await fetch(request);
  if (doCaching) {
    putInCache(request, responseFromNetwork.clone());
  }
  return responseFromNetwork;
};

self.addEventListener('fetch', event => {
  event.respondWith(cacheFirst(event.request));
});
