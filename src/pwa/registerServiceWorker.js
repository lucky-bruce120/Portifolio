import { isDashboardRoute } from '../main.jsx'

/**
 * Registers the dashboard service worker.
 *
 * Guarded on every axis where this could go wrong:
 *  - production only, so it never fights Vite's dev server or HMR
 *  - only when actually on the dashboard, so the public portfolio is untouched
 *  - only when the browser supports service workers (not Safari private mode,
 *    where `navigator.serviceWorker` is absent)
 *  - errors are logged, never thrown, so a failed registration cannot break
 *    the dashboard
 */
export function registerDashboardServiceWorker() {
  if (!import.meta.env?.PROD) return
  if (!isDashboardRoute()) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  const register = () => {
    navigator.serviceWorker
      // Scope is '/' because the hashed JS and CSS live in /assets, outside
      // /dashboard. The worker itself still only serves dashboard files.
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Pick up a newly deployed worker without needing a second visit.
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage('skip-waiting')
            }
          })
        })
      })
      .catch((err) => {
        console.warn('[pwa] service worker registration failed', err)
      })
  }

  // Registering before load competes with the first paint for bandwidth.
  if (document.readyState === 'complete') {
    register()
  } else {
    window.addEventListener('load', register, { once: true })
  }
}