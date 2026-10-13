// Tests the install button: it must stay invisible until the browser says the
// app is installable, trigger the native prompt, and hide again afterwards.
import { installDomShim, attach } from './dom-shim.js'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

export async function run() {
  const { body, El } = installDomShim()

  globalThis.location = { hash: '', pathname: '/dashboard', href: 'http://localhost/dashboard' }
  Object.defineProperty(globalThis, 'scrollY', { value: 0, writable: true })
  globalThis.scrollTo = () => {}
  globalThis.innerWidth = 1400
  globalThis.innerHeight = 900

  // Standalone detection reads matchMedia; the shim reports a normal tab.
  globalThis.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {}
  })

  globalThis.sessionStorage.setItem('portfolio:admin-unlocked', 'true')

  const prompt = await import('../src/pwa/installPrompt.js')
  const { InstallButton } = await import('../src/admin/components/InstallButton.jsx')

  const all = (root, sel) => Array.from(root.querySelectorAll(sel))
  const visible = (host) => host.style.display !== 'none' && host.children.length > 0
  const button = (host) => host.querySelector('.adm-btn-install')

  // Chrome's event: preventDefault defers the prompt, prompt() shows it.
  function fireBeforeInstallPrompt({ preventDefault = true } = {}) {
    const event = {
      type: 'beforeinstallprompt',
      prevented: false,
      preventDefault() { this.prevented = preventDefault; event.prevented = preventDefault },
      called: 0,
      async prompt() { this.called += 1 },
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' })
    }
    window.dispatchEvent(event)
    return event
  }

  const fireAppInstalled = () => window.dispatchEvent({ type: 'appinstalled' })

  console.log('\n1. Nothing is offered before the browser says so')
  prompt.initInstallPrompt()
  check('cannot install yet', prompt.getInstallState().canInstall === false)

  const host = InstallButton()
  attach(host, body)
  check('button is hidden initially', visible(host) === false)
  check('no install button in the DOM', button(host) === null)

  console.log('\n2. beforeinstallprompt reveals the button')
  const event = fireBeforeInstallPrompt()
  check('the browser prompt was suppressed', event.prevented === true)
  check('can install now', prompt.getInstallState().canInstall === true)
  check('button is visible', visible(host) === true)
  check('button says Install Dashboard App',
    button(host)?.textContent.includes('Install Dashboard App'), button(host)?.textContent)
  check('button is enabled', button(host)?.disabled === false)

  console.log('\n3. Clicking triggers the native prompt')
  button(host).dispatch('click')
  await new Promise((resolve) => setTimeout(resolve, 10))
  check('prompt.prompt() was called', event.called === 1)
  check('button hidden after accepting', visible(host) === false)
  check('marked installed', prompt.getInstallState().installed === true)

  console.log('\n4. appinstalled hides the button')
  prompt.initInstallPrompt()
  const host4 = InstallButton()
  attach(host4, body)
  fireBeforeInstallPrompt()
  check('visible before install completes', visible(host4) === true)
  fireAppInstalled()
  check('hidden once installed', visible(host4) === false)
  check('installed flag set', prompt.getInstallState().installed === true)

  console.log('\n5. No prompt event means no button at all')
  prompt.initInstallPrompt()
  const host5 = InstallButton()
  attach(host5, body)
  check('hidden with no beforeinstallprompt', visible(host5) === false)
  check('cannot install', prompt.getInstallState().canInstall === false)

  console.log('\n6. Already-installed apps never show it')
  // Simulate launching the installed PWA.
  globalThis.matchMedia = (query) => ({
    matches: query.includes('standalone'),
    media: query,
    addEventListener() {},
    removeEventListener() {}
  })
  prompt.initInstallPrompt()
  fireBeforeInstallPrompt()
  check('standalone is detected', prompt.getInstallState().installed === true)
  check('cannot install while installed', prompt.getInstallState().canInstall === false)

  const host6 = InstallButton()
  attach(host6, body)
  check('no button for an installed app', visible(host6) === false)

  console.log('\n7. Button is removed from the layout when hidden')
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  // Clear the prompt left over from the previous section, then re-init so this
  // asserts the "nothing to install" case.
  fireAppInstalled()
  prompt.initInstallPrompt()
  const host7 = InstallButton()
  attach(host7, body)
  check('hidden host has display none', host7.style.display === 'none', host7.style.display)
  check('hidden host has no children', host7.children.length === 0)
  check('not left occupying space', !host7.querySelector('.adm-btn-install'))
  check('canInstall is false', prompt.getInstallState().canInstall === false)

  console.log('\n8. Detached button unsubscribes')
  const host8 = InstallButton()
  attach(host8, body)
  fireBeforeInstallPrompt()
  host8.remove()
  fireAppInstalled()
  check('no throw after detach', true)

  // Runs last: dismissal is terminal, so once it happens the controller must
  // never offer the button again in this session.
  console.log('\n9. Dismissal is terminal')
  prompt.initInstallPrompt()
  const host9 = InstallButton()
  attach(host9, body)
  const dismissEvent = fireBeforeInstallPrompt()
  check('button visible before dismissing', visible(host9) === true)

  dismissEvent.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
  button(host9).dispatch('click')
  await new Promise((resolve) => setTimeout(resolve, 10))
  check('button hidden after dismissing', visible(host9) === false)
  check('marked dismissed', prompt.getInstallState().dismissed === true)
  check('prompt was consumed', dismissEvent.called === 1)

  // Even if the browser offers another event later, we stay quiet.
  prompt.initInstallPrompt()
  fireBeforeInstallPrompt()
  check('stays hidden after a dismissal', prompt.getInstallState().canInstall === false)

  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed
}