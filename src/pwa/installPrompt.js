/**
 * Tracks whether the dashboard can be installed as a PWA and triggers the
 * native prompt on demand.
 *
 * Chrome fires `beforeinstallprompt` only after the page has loaded, so the
 * event is captured by a small inline script in dashboard/index.html and stashed
 * on `window`. Reading it from there means the button cannot miss the event
 * because the app bundle was slow to evaluate.
 *
 * The public portfolio never links a manifest and never mounts this, so no
 * install UI can appear there.
 */

const state = {
  prompt: null,
  installed: false,
  dismissed: false
}

const listeners = new Set()

// True once the app is running as an installed PWA.
function isStandalone() {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true
    )
  } catch {
    return false
  }
}

function notify() {
  const snapshot = getInstallState()
  for (const listener of listeners) listener(snapshot)
}

export function getInstallState() {
  const installed = state.installed || isStandalone()
  return {
    // Only ever offer the button once the browser has actually said the app is
    // installable, and never after it has been installed or dismissed.
    canInstall: Boolean(state.prompt) && !installed && !state.dismissed,
    installed,
    dismissed: state.dismissed
  }
}

export function onInstallStateChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Fires the browser's own install prompt.
 * Resolves to 'accepted', 'dismissed', 'unavailable' or 'error'.
 */
export async function promptInstall() {
  const promptEvent = state.prompt

  // Nothing to show, or already handled in this session.
  if (!promptEvent || state.installed || state.dismissed) return 'unavailable'

  // A prompt can only be used once; clear it before awaiting so a second
  // click cannot race the first.
  state.prompt = null
  notify()

  try {
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice

    if (choice?.outcome === 'accepted') state.installed = true
    else state.dismissed = true

    notify()
    return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed'
  } catch (err) {
    console.warn('[pwa] install prompt failed', err)
    state.dismissed = true
    notify()
    return 'error'
  }
}

/**
 * Wires up the listeners. Safe to call more than once.
 */
export function initInstallPrompt() {
  if (typeof window === 'undefined') return

  state.installed = isStandalone()

  // The inline script in dashboard/index.html normally gets here first; these
  // listeners are the fallback for dev servers and any document that lacks it.
  window.addEventListener('beforeinstallprompt', (event) => {
    // Without preventDefault the browser shows its own mini-infobar, which is
    // exactly the install UI we do not want.
    event.preventDefault()
    state.prompt = event
    notify()
  })

  window.addEventListener('appinstalled', () => {
    state.prompt = null
    state.installed = true
    notify()
  })

  // Pick up an event that fired before this module ran.
  if (window.__pwaInstallPrompt) {
    state.prompt = window.__pwaInstallPrompt
    window.__pwaInstallPrompt = null
  }

  notify()
}