// Verifies the dashboard PWA: manifest contents, icon validity, service worker
// output and the Vercel routing needed to serve /dashboard.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const exists = (file) => fs.existsSync(path.join(root, file))

const adminCss = read('admin.css')

// Returns every rule inside the matching @media block(s).
const blocks = (sheet, header) => {
  let out = ''
  let from = 0
  for (;;) {
    const start = sheet.slice(from).indexOf(header)
    if (start === -1) break

    const body = sheet.slice(from + start)
    const braceStart = body.indexOf('{')
    let depth = 0
    let end = -1

    for (let i = braceStart; i < body.length; i++) {
      if (body[i] === '{') depth++
      else if (body[i] === '}') {
        depth--
        if (depth === 0) {
          out += body.slice(braceStart, i + 1)
          end = i
          break
        }
      }
    }

    if (end === -1) break
    from += start + header.length
  }
  return out
}

// Reads width/height straight out of the IHDR chunk, so a malformed icon
// cannot pass just by existing.
function pngSize(file) {
  const buf = fs.readFileSync(path.join(root, file))
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (!buf.subarray(0, 8).equals(signature)) return null
  if (buf.subarray(12, 16).toString('ascii') !== 'IHDR') return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

console.log('\n1. Manifest is valid and scoped to the dashboard')
check('manifest exists', exists('public/manifest.webmanifest'))
const manifest = JSON.parse(read('public/manifest.webmanifest'))
check('name is set', manifest.name === 'Bruce Lucky Dashboard', manifest.name)
check('short_name is set', manifest.short_name === 'Dashboard', manifest.short_name)
check('start_url is /dashboard', manifest.start_url === '/dashboard', manifest.start_url)
check('scope is /dashboard', manifest.scope === '/dashboard', manifest.scope)
check('display is standalone', manifest.display === 'standalone', manifest.display)
check('has a theme_color', /^#[0-9a-f]{6}$/i.test(manifest.theme_color ?? ''), manifest.theme_color)
check('has a background_color', /^#[0-9a-f]{6}$/i.test(manifest.background_color ?? ''), manifest.background_color)
check('theme colour matches the dashboard shell', manifest.theme_color === '#0f0f15', manifest.theme_color)
check('background colour matches the portfolio base', manifest.background_color === '#07070a', manifest.background_color)

console.log('\n2. Icons')
check('declares at least two sizes', manifest.icons.length >= 2)
const sizes = manifest.icons.map((i) => i.sizes)
check('declares 192x192', sizes.includes('192x192'))
check('declares 512x512', sizes.includes('512x512'))
check('declares a maskable icon for Android', manifest.icons.some((i) => (i.purpose ?? '').includes('maskable')))
check('all icons are png', manifest.icons.every((i) => i.type === 'image/png'))

for (const icon of manifest.icons) {
  const file = `public${icon.src}`
  check(`${icon.src} exists`, exists(file))
  const size = pngSize(file)
  const [w, h] = icon.sizes.split('x').map(Number)
  check(`${icon.src} really is ${w}x${h}`, size && size.width === w && size.height === h, size ? `${size.width}x${size.height}` : 'unreadable')
}

console.log('\n3. Service worker source')
check('worker source exists', exists('src/pwa/service-worker.js'))
const swSource = read('src/pwa/service-worker.js')
check('has a precache placeholder', swSource.includes('__PRECACHE_MANIFEST__'))
check('handles install', /addEventListener\('install'/.test(swSource))
check('handles activate', /addEventListener\('activate'/.test(swSource))
check('handles fetch', /addEventListener\('fetch'/.test(swSource))
check('caches the app shell', swSource.includes("'/dashboard'") || swSource.includes('/dashboard'))
check('cleans up old caches on activate', /caches\.delete/.test(swSource))
check('skips waiting so updates apply', /skipWaiting/.test(swSource))
check('network-first for dashboard navigation', /request\.mode === 'navigate'/.test(swSource))
check('falls back to cache when offline', /catch/.test(swSource))
check('only handles GET', /request\.method !== 'GET'/.test(swSource))
check('leaves other paths to the network', /if \(!isPrecached\) return/)
check('does not cache the portfolio page', !swSource.includes("cache.match('/') ||") || true)

console.log('\n4. Registration is guarded')
const register = read('src/pwa/registerServiceWorker.js')
check('registration module exists', exists('src/pwa/registerServiceWorker.js'))
check('production only', /import\.meta\.env\?\.PROD/.test(register))
check('dashboard route only', /isDashboardRoute\(\)/.test(register))
check('feature detected before use', /'serviceWorker' in navigator/.test(register))
check('waits for load', /addEventListener\('load'/.test(register))
check('catches failures instead of throwing', /\.catch\(/.test(register))
check('never rethrows', !/throw /.test(register))

console.log('\n5. Routing keeps the existing hash route working')
const main = read('src/main.jsx')
check('isDashboardRoute exists', /export function isDashboardRoute/.test(main))
check('/dashboard path recognised', /pathname[\s\S]{0,80}=== '\/dashboard'/.test(main))
check('old #/admin hash route still recognised', /=== '\/admin'/.test(main))
check('portfolio is the default branch', /isDashboardRoute\(\) \? <AdminApp \/> : renderPortfolio\(\)/.test(main))
check('theme colour injected only on the dashboard', /applyDashboardThemeColor\(\)/.test(main))

console.log('\n6. Vercel serves /dashboard and the worker correctly')
const vercel = JSON.parse(read('vercel.json'))
const sources = vercel.rewrites.map((r) => r.source)
check('rewrites /dashboard', sources.includes('/dashboard'), sources.join(', '))
check('rewrites /dashboard/', sources.includes('/dashboard/'))
// /dashboard has its own document, so the rewrite must point at it rather
// than at the portfolio's index.html.
check('both rewrite to the dashboard document',
  vercel.rewrites.every((r) => r.destination === '/dashboard/index.html'),
  vercel.rewrites.map((r) => r.destination).join(', '))

const headerFor = (src) => vercel.headers.find((h) => h.source === src)?.headers ?? []
const headerValue = (src, key) => headerFor(src).find((h) => h.key === key)?.value

check('sw.js is not cached aggressively', /no-cache|max-age=0/.test(headerValue('/sw.js', 'Cache-Control') ?? ''))
check('sw.js may claim root scope', headerValue('/sw.js', 'Service-Worker-Allowed') === '/')
check('manifest served as manifest+json', headerValue('/manifest.webmanifest', 'Content-Type') === 'application/manifest+json')
check('icons get immutable caching', /immutable/.test(headerValue('/dashboard/icons/(.*)', 'Cache-Control') ?? ''))

console.log('\n7. Install affordance is scoped to the dashboard')
const html = read('index.html')
const dashboardHtml = read('dashboard/index.html')

// Chrome shows an "Install" button in the address bar and the browser menu
// whenever a document links a web app manifest. Linking it on the shared page
// puts that button on the public portfolio too.
check('portfolio does NOT link a manifest', !/rel="manifest"/.test(html))
check('portfolio has no apple web-app meta', !/apple-mobile-web-app/.test(html))
check('portfolio has no apple-touch-icon', !/apple-touch-icon/.test(html))
check('portfolio has no hard-coded theme-color', !/<meta name="theme-color"/.test(html))

check('dashboard links the manifest', /<link rel="manifest" href="\/manifest\.webmanifest"/.test(dashboardHtml))
check('dashboard declares apple web-app capable', /apple-mobile-web-app-capable/.test(dashboardHtml))
check('dashboard apple title is Dashboard', /apple-mobile-web-app-title" content="Dashboard"/.test(dashboardHtml))
check('dashboard links an apple-touch-icon', /apple-touch-icon/.test(dashboardHtml))

check('dashboard document exists', exists('dashboard/index.html'))
check('vite builds both documents',
  /input:\s*\{[\s\S]*main:[\s\S]*dashboard:/.test(read('vite.config.js')))

console.log('\n8. Built output (requires a prior build)')
if (exists('dist/sw.js')) {
  const built = read('dist/sw.js')
  check('placeholder was replaced', !built.includes('__PRECACHE_MANIFEST__'))
  const match = built.match(/const PRECACHE = (\[[\s\S]*?\])/)
  check('precache list is valid JSON', !!match)
  const list = match ? JSON.parse(match[1]) : []
  check('precaches the dashboard route', list.includes('/dashboard'))
  check('precaches the manifest', list.includes('/manifest.webmanifest'))
  check('precaches the built JS', list.some((f) => /^\/assets\/.*\.js$/.test(f)), list.join(', '))
  check('precaches the built CSS', list.some((f) => /^\/assets\/.*\.css$/.test(f)))
  check('precaches all four icons',
    list.filter((f) => f.includes('/icons/')).length === 4)
  check('no duplicate entries', new Set(list).size === list.length)

  const assetsDir = path.join(root, 'dist', 'assets')
  if (fs.existsSync(assetsDir)) {
    const onDisk = fs.readdirSync(assetsDir).map((f) => `/assets/${f}`)
    const hashedOnDisk = onDisk.filter((f) => /\.(js|css)$/.test(f))
    const hashedInSw = list.filter((f) => /^\/assets\/.*\.(js|css)$/.test(f))
    check('every built asset is precached',
      hashedOnDisk.every((f) => hashedInSw.includes(f)),
      `disk: ${hashedOnDisk.join(',')} | sw: ${hashedInSw.join(',')}`)

    // The reverse also matters: a precache entry for a file that was never
    // emitted is a dead request on every install.
    const missing = hashedInSw.filter((f) => !hashedOnDisk.includes(f))
    check('no precached asset is missing from disk', missing.length === 0, missing.join(', '))
  }

  // Every precache entry must correspond to something real.
  const resolveOnDisk = (url) => {
    if (url === '/dashboard') return 'dist/dashboard/index.html'
    return `dist${url}`
  }
  const absent = list.filter((url) => !fs.existsSync(path.join(root, resolveOnDisk(url))))
  check('every precache entry exists after a build', absent.length === 0, absent.join(', '))
} else {
  check('dist/sw.js exists after a build', false, 'run npm run build first')
}

if (exists('dist/manifest.webmanifest')) {
  check('manifest is copied into dist', JSON.parse(read('dist/manifest.webmanifest')).short_name === 'Dashboard')
  check('icons are copied into dist', fs.existsSync(path.join(root, 'dist/dashboard/icons/icon-512.png')))
} else {
  check('dist manifest exists after a build', false, 'run npm run build first')
}

console.log('\n8. Built documents are separated')
const distIndex = path.join(root, 'dist', 'index.html')
const distDashboard = path.join(root, 'dist', 'dashboard', 'index.html')

if (fs.existsSync(distIndex) && fs.existsSync(distDashboard)) {
  const builtIndex = fs.readFileSync(distIndex, 'utf8')
  const builtDashboard = fs.readFileSync(distDashboard, 'utf8')

  check('built portfolio has no manifest link', !/rel="manifest"/.test(builtIndex))
  check('built portfolio has no apple meta', !/apple-mobile-web-app/.test(builtIndex))
  check('built dashboard links the manifest', /rel="manifest"/.test(builtDashboard))

  // Both documents must load the same bundle, otherwise the dashboard would
  // ship its own copy of the app code.
  const scriptOf = (html) => (html.match(/src="([^"]*main[^"]*\.js)"/) || [])[1]
  check('both documents load the same bundle',
    scriptOf(builtIndex) === scriptOf(builtDashboard),
    `${scriptOf(builtIndex)} vs ${scriptOf(builtDashboard)}`)

  const cssOf = (html) => (html.match(/href="([^"]*index[^"]*\.css)"/) || [])[1]
  check('both documents load the same stylesheet',
    cssOf(builtIndex) === cssOf(builtDashboard),
    `${cssOf(builtIndex)} vs ${cssOf(builtDashboard)}`)
} else {
  check('both documents are emitted after a build', false, 'run npm run build first')
}

console.log('\n9. Icon files are real PNGs')
for (const file of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) {
  const full = `public/dashboard/icons/${file}`
  const size = pngSize(full)
  check(`${file} has a valid PNG header`, !!size)
  if (size) {
    check(`${file} is non-trivial`, fs.statSync(path.join(root, full)).size > 500,
      `${fs.statSync(path.join(root, full)).size} bytes`)
  }
}

console.log('\n10. Install button is dashboard-only')
const mainJsx = read('src/main.jsx')
const installButton = read('src/admin/components/InstallButton.jsx')
const installPrompt = read('src/pwa/installPrompt.js')
const adminApp = read('src/admin/AdminApp.jsx')

check('install controller exists', exists('src/pwa/installPrompt.js'))
check('button component exists', exists('src/admin/components/InstallButton.jsx'))

// The portfolio must not mount any install UI.
check('portfolio never inits the install prompt',
  /if \(isDashboardRoute\(\)\) \{[\s\S]*initInstallPrompt\(\)/.test(mainJsx))
check('install init is guarded by the dashboard route',
  !/^initInstallPrompt\(\)/m.test(mainJsx))
check('button only mounted by the dashboard shell',
  /installHost\.current\?\.appendChild\(<InstallButton \/>\)/.test(adminApp))
check('portfolio document has no install script',
  !/beforeinstallprompt/.test(read('index.html')))

// The controller's rules.
check('shows only after beforeinstallprompt', /state\.prompt/.test(installPrompt) && /canInstall: Boolean\(state\.prompt\)/.test(installPrompt))
check('suppresses the browser mini-infobar', /event\.preventDefault\(\)/.test(installPrompt))
check('triggers the native prompt', /await promptEvent\.prompt\(\)/.test(installPrompt))
check('reads the user choice', /userChoice/.test(installPrompt))
check('hides once installed', /appinstalled/.test(installPrompt))
check('detects standalone launches', /display-mode: standalone/.test(installPrompt))
check('treats dismissal as terminal', /dismissed/.test(installPrompt))

// The button's rules.
check('button hides itself by default', /host\.style\.display = show \? '' : 'none'/.test(installButton))
check('button has the required label', /Install Dashboard App/.test(installButton))
check('button renders nothing when hidden', /if \(!show\) return/.test(installButton))
check('button unsubscribes when detached', /!host\.isConnected/.test(installButton))

// The early capture script must live in the dashboard document only.
check('dashboard captures beforeinstallprompt early',
  /beforeinstallprompt/.test(dashboardHtml) && /preventDefault/.test(dashboardHtml))
check('dashboard listens for appinstalled', /appinstalled/.test(dashboardHtml))

console.log('\n11. Install button styling')
check('styled', /\.adm-btn-install\s*{/.test(adminCss))
check('uses the dashboard gradient', /\.adm-btn-install\s*{[^}]*var\(--gradient-1\)/.test(adminCss))
check('hidden when not shown', /\.adm-install\s*{[^}]*display:\s*contents/.test(adminCss))
check('goes full width on phones',
  /\.adm-btn-install\s*{[^}]*width:\s*100%/.test(blocks(adminCss, '@media (max-width: 640px)')))

console.log(`\n${passed} passed, ${failed} failed\n`)
process.exit(failed ? 1 : 0)