import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Emits the dashboard service worker with a precache list of the real build
 * output.
 *
 * Vite content-hashes the bundle, so the filenames only exist once the files
 * are written. Reading them back off disk is deliberate: rollup's in-memory
 * bundle still holds intermediate chunk names at generateBundle time, which
 * Vite rewrites before writing, so trusting that list yields precache entries
 * pointing at files that were never emitted.
 */
function dashboardPwa() {
  return {
    name: 'dashboard-pwa',
    apply: 'build',

    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')

      // Walk dist for the hashed JS/CSS the dashboard shell needs.
      const assets = []
      const walk = (dir, prefix) => {
        if (!fs.existsSync(dir)) return
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name)
          if (entry.isDirectory()) walk(full, `${prefix}${entry.name}/`)
          else if (/\.(js|css|woff2?)$/.test(entry.name)) assets.push(`/${prefix}${entry.name}`)
        }
      }
      walk(path.join(distDir, 'assets'), 'assets/')

      // Shell routes and PWA assets live in public/ and are copied verbatim, so
      // they are not in the rollup bundle and must be listed by hand.
      const staticAssets = [
        '/dashboard',
        '/dashboard/index.html',
        '/manifest.webmanifest',
        '/dashboard/icons/icon-192.png',
        '/dashboard/icons/icon-512.png',
        '/dashboard/icons/icon-maskable-192.png',
        '/dashboard/icons/icon-maskable-512.png'
      ]

      const precache = [...staticAssets, ...assets]
      const template = fs.readFileSync(
        path.resolve(__dirname, 'src/pwa/service-worker.js'),
        'utf8'
      )

      const sw = template.replace(
        '__PRECACHE_MANIFEST__',
        JSON.stringify([...new Set(precache)], null, 2)
      )

      fs.writeFileSync(path.join(distDir, 'sw.js'), sw)
      this.info?.(`dashboard-pwa: wrote dist/sw.js (${precache.length} precached files)`)
    }
  }
}

/**
 * Serves /dashboard its own document in the dev and preview servers.
 *
 * Without this, Vite's SPA fallback hands /dashboard the portfolio's
 * index.html, so the PWA tags are missing locally and the behaviour cannot be
 * checked before deploying. Production gets the same mapping from vercel.json.
 */
function dashboardRoute() {
  const rewrite = (req, _res, next) => {
    const pathname = (req.url || '').split('?')[0]
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      req.url = '/dashboard/index.html'
    }
    next()
  }

  return {
    name: 'dashboard-route',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    }
  }
}

export default defineConfig({
  plugins: [dashboardRoute(), dashboardPwa()],
  resolve: {
    alias: {
      'react/jsx-runtime': path.resolve(__dirname, 'src/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'src/jsx-runtime.js')
    }
  },
  build: {
    rollupOptions: {
      input: {
        // The public portfolio.
        main: path.resolve(__dirname, 'index.html'),
        // The dashboard. A separate document so the manifest link - and with
        // it Chrome's install button - only exists there.
        dashboard: path.resolve(__dirname, 'dashboard/index.html')
      }
    }
  }
})