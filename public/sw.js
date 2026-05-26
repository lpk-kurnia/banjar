const CACHE_NAME = 'lpk-kurnia-v2.0.1'

// hanya asset statis, BUKAN halaman dinamis
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico'
]

// INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

// FETCH
self.addEventListener('fetch', (event) => {
  const { request } = event

  // ❌ jangan cache halaman HTML dinamis (forum, admin, dll)
  if (request.destination === 'document') {
    event.respondWith(fetch(request))
    return
  }

  // ❌ jangan ganggu API (Supabase, auth, dll)
  if (request.url.includes('/api/') || request.url.includes('supabase')) {
    event.respondWith(fetch(request))
    return
  }

  // ✔ cache only static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (
          !response ||
          response.status !== 200 ||
          response.type !== 'basic'
        ) {
          return response
        }

        const clone = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone)
        })

        return response
      })
    })
  )
})

// ACTIVATE
self.addEventListener('activate', (event) => {
  const whitelist = [CACHE_NAME]

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!whitelist.includes(key)) {
            return caches.delete(key)
          }
        })
      )
    )
  )

  self.clients.claim()
})