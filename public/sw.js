const CACHE_NAME = 'reportwise-v1'
const PRECACHE_ASSETS = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful non-API requests
        if (response.status === 200 && !event.request.url.includes('/api/')) {
           const resClone = response.clone()
           caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
