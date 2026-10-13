/* eslint-env serviceworker */
/*
 * Dashboard service worker.
 *
 * Scoped deliberately: it caches only the files the dashboard needs so it can
 * reopen offline, and passes everything else straight through to the network.
 * The public portfolio is never served from this cache.
 *
 * The precache list is injected at build time by the `dashboard-pwa` plugin in
 * vite.config.js, because Vite emits content-hashed filenames that cannot be
 * known ahead of time.
 */

const CACHE = 'bruce-dashboard-v1'
const PRECACHE = __PRECACHE_MANIFEST__

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // Add individually so one missing file cannot fail the whole install.
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' })
            if (response.ok) await cache.put(url, response)
          } catch (err) {
            console.warn('[sw] could not precache', url, err)
          }
        })
      )
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  // Lets the page force a cache refresh after new content is deployed.
  if (event.data === 'skip-waiting') self.skipWaiting()
})

const isDashboardRequest = (url) =>
  url.origin === self.location.origin &&
  (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/'))

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Anything that is not a same-origin GET is left entirely alone.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Navigations to the dashboard: network first so a fresh deploy is picked up
  // promptly, falling back to the cached shell when offline.
  if (request.mode === 'navigate' && isDashboardRequest(url)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          const cache = await caches.open(CACHE)
          cache.put('/dashboard', fresh.clone())
          return fresh
        } catch {
          const cache = await caches.open(CACHE)
          return (
            (await cache.match('/dashboard')) ||
            (await cache.match('/')) ||
            new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
          )
        }
      })()
    )
    return
  }

  // The hashed JS/CSS the dashboard shell needs. Served cache-first because the
  // filenames change whenever the content does.
  const isPrecached = PRECACHE.includes(url.pathname)
  if (!isPrecached) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const hit = await cache.match(url.pathname)
      if (hit) return hit

      const response = await fetch(request)
      if (response.ok) cache.put(url.pathname, response.clone())
      return response
    })()
  )
})