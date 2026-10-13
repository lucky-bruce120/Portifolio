# Dashboard PWA

The dashboard can be installed to the home screen on Android and iOS, and it
reopens offline after the first successful visit.

## What it does and does not cover

| | |
| --- | --- |
| Applies at | `/dashboard` |
| Manifest scope | `/dashboard` |
| Public portfolio | Untouched — never installable, never served from cache |
| Password protection | Unchanged (`bruce2026`, same as before) |
| Content / styling | Unchanged |

## The two entry points

Both work, and neither was removed:

- `/#/admin` — the original hash route
- `/dashboard` — a real path, added so the manifest can use it as `start_url`

`isDashboardRoute()` in `src/main.jsx` returns true for either.

## Why the install button does not appear on the portfolio

Chrome shows an **Install** button in the address bar and in the ⋮ browser menu
whenever a page links a web app manifest. Linking it on a page shared by the
whole site puts that button on the public portfolio too.

So `/dashboard` has its **own HTML document** (`dashboard/index.html`) that
carries the manifest and Apple tags, while the portfolio's `index.html` carries
neither. Both load the same JS bundle, so nothing is duplicated.

Verified locally:

```
portfolio /         manifest=false  apple=false  title="Bruce Lucky | Frontend Developer"
dashboard           manifest=true   apple=true   title="Bruce Lucky Dashboard"
dashboard/          manifest=true   apple=true   title="Bruce Lucky Dashboard"
```

Vite's SPA fallback would otherwise hand `/dashboard` the portfolio document, so
a small plugin mirrors the production rewrite in the dev and preview servers.
`vercel.json` does the same on Vercel.

## How the pieces fit

```
public/manifest.webmanifest          the app manifest (scope /dashboard)
public/dashboard/icons/*.png         192, 512 and maskable variants
dashboard/index.html                 the dashboard's own document (holds the PWA tags)
src/pwa/service-worker.js            worker source; precache list injected at build
src/pwa/registerServiceWorker.js     guarded registration
src/pwa/installPrompt.js             beforeinstallprompt state + native prompt
src/admin/components/InstallButton.jsx  the dashboard's install button
scripts/generate-dashboard-icons.mjs draws the icons (no image dependency)
vite.config.js                       two HTML entries, /dashboard rewrite, sw.js emitter
vercel.json                          rewrites /dashboard + cache headers
```

### Why the worker is scoped to `/`

The dashboard's JS and CSS are content-hashed into `/assets`, which sits
outside `/dashboard`. A worker confined to `/dashboard` could not precache
them, so the dashboard would fail offline. It is therefore registered with
scope `/`, but its fetch handler only serves files on the precache list and
passes everything else straight to the network. The public portfolio is never
served from this cache.

`Service-Worker-Allowed: /` is set in `vercel.json` so the scope is accepted.

### Caching strategy

- **Navigations to `/dashboard`** — network first, falling back to the cached
  shell when offline, so a new deploy is picked up promptly.
- **Precached JS/CSS/icons** — cache first, because their filenames change
  whenever the content does.

## Icons

Regenerate any time with:

```bash
npm run icons
```

They are drawn programmatically from the dashboard's own palette
(`#6366f1` → `#a855f7`) as a white "BL" monogram. A hand-rolled PNG encoder
keeps the project free of an image dependency.

Maskable variants use a smaller glyph inside the full-bleed square, because
Android crops roughly the outer 20% when it applies an adaptive icon mask.

## Installing from the dashboard

The dashboard shows an **Install Dashboard App** button in its top bar. It is
hidden by default and only appears once the browser has actually reported the
app as installable, so you never see it in a browser that cannot install, on an
already-installed copy, or after dismissing the prompt.

Flow:

1. `beforeinstallprompt` fires → `preventDefault()` suppresses Chrome's own
   mini-infobar, and the button appears
2. Clicking it calls the browser's native prompt
3. On accept the app installs and the button disappears; on dismiss it also
   disappears, for the rest of the session

The event is captured by a small inline script in `dashboard/index.html` rather
than by the app bundle, because Chrome can fire it before the module has
evaluated.

`src/pwa/installPrompt.js` owns the state; `src/admin/components/InstallButton.jsx`
renders it. The controller is only initialised when the dashboard route is
active, so no install UI can exist on the portfolio.

### On iPhone

Safari does not fire `beforeinstallprompt`, so the button never appears there.
iOS installation is manual: Share → **Add to Home Screen**. That is a browser
limitation, not a bug in this setup.

## Installing after deploying to Vercel

Service workers only work over **HTTPS**, so test on your real Vercel domain,
not `http://localhost`.

**Prerequisite:** visit `https://your-domain.com/dashboard` and **log in** once.
iOS only offers install for pages it has already loaded.

### Android (Chrome)

1. Open `https://your-domain.com/dashboard` and sign in
2. Chrome shows an **Install app** banner, or tap the ⋮ menu
3. Choose **Install app** / **Add to Home screen**
4. Confirm — the icon appears in your app drawer

### iPhone (Safari)

Safari has no install banner; you have to do it by hand:

1. Open Safari (not Chrome) and go to `https://your-domain.com/dashboard`
2. Sign in
3. Tap the **Share** button — the square with an arrow pointing up
4. Scroll down and tap **Add to Home Screen**
5. Name it and tap **Add**

The icon is named **Dashboard**.

### Checking it worked

Open DevTools → **Application**:

- **Manifest** — name, icons and `start_url` should all resolve
- **Service Workers** — should show `sw.js` as activated and running

Then switch the device to aeroplane mode and reopen the app. It should load
from cache.

## Deploying an update

The precache list contains content-hashed filenames, so every deploy produces
a new `sw.js`. The worker calls `skipWaiting()` on a new version, meaning users
pick up changes on their next load without a manual refresh.

If you ever bump `CACHE` in `src/pwa/service-worker.js`, users get a clean
cache on their next visit.

## Tests

- `test/pwa.test.js` — manifest fields, real PNG header dimensions, the worker
  precache list against what is actually on disk, the Vercel rewrites, and that
  the install button and its controller are dashboard-only
- `test/install-button.test.js` — the button stays hidden until
  `beforeinstallprompt`, triggers the native prompt, and hides after accepting,
  dismissing or installing

Run `npm run build` before `npm test`, since some checks read `dist/`.