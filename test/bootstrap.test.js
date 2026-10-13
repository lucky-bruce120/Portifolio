// Boots src/main.jsx the way index.html does and asserts the page actually
// renders. This is the gap the section-level tests left: they proved each
// section builds, but not that the app mounts and wires up without throwing.
import { installDomShim, attach } from './dom-shim.js'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

export async function run() {
  const { body, El } = installDomShim()

  // Globals main.jsx touches at boot that the shim does not provide.
  globalThis.IntersectionObserver = class {
    constructor(cb) { this.cb = cb }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.location = { hash: '', pathname: '/', href: 'http://localhost/' }
  Object.defineProperty(globalThis, 'scrollY', { value: 0, writable: true })
  globalThis.scrollTo = () => {}
  globalThis.innerWidth = 1400
  globalThis.innerHeight = 900

  // Mirror index.html: <body><div id="root"></div></body>
  const rootEl = new El('div')
  rootEl.setAttribute('id', 'root')
  attach(rootEl, body)

  // Capture anything the app logs so a swallowed error still surfaces.
  const errors = []
  const realWarn = console.warn
  const realError = console.error
  console.warn = (...args) => { errors.push(args.map(String).join(' ')); realWarn(...args) }
  console.error = (...args) => { errors.push(args.map(String).join(' ')); realError(...args) }

  console.log('\n1. Module boots without throwing')
  let booted = true
  try {
    await import('../src/main.jsx')
  } catch (err) {
    booted = false
    realError('boot error:', err)
  }
  check('main.jsx imported cleanly', booted, errors.join(' | '))

  console.log('\n2. Portfolio rendered into #root')
  check('root has children', rootEl.children.length > 0, `${rootEl.children.length} children`)
  check('root is not blank', rootEl.textContent.length > 200, `${rootEl.textContent.length} chars`)

  const ids = [...rootEl.walk()].map((n) => n.getAttribute('id')).filter(Boolean)
  check('hero section present', ids.includes('hero'))
  check('navbar present', ids.includes('navbar'))
  check('projects section present', ids.includes('projects'))
  check('contact section present', ids.includes('contact'))
  check('footer present', [...rootEl.walk()].some((n) => n.tagName === 'FOOTER'))
  check('theme toggle present', ids.includes('themeToggle'))
  check('back-to-top present', ids.includes('backToTop'))

  console.log('\n3. Key content is actually rendered')
  check('hero name rendered', rootEl.textContent.includes('Bruce Lucky'))
  check('project titles rendered', rootEl.textContent.includes('SkillMatch'))
  check('experience rendered', rootEl.textContent.includes('Frontend Developer'))
  check('typing target present', ids.includes('typingText'))
  check('particles canvas present', ids.includes('particle-canvas'))

  console.log('\n4. Behaviour modules attached without error')
  check('no errors logged during boot', errors.length === 0, errors.join(' | '))

  console.log('\n5. Content edits re-render the page')
  const store = await import('../src/store/contentStore.js')
  const before = rootEl.children.length
  store.setIn('hero.name', 'Boot Test Name')
  check('page re-rendered on change', rootEl.textContent.includes('Boot Test Name'))
  check('root still populated', rootEl.children.length === before)

  console.log('\n6. Admin route mounts the dashboard instead')
  globalThis.location.hash = '#/admin'
  const { render } = await import('../src/main.jsx')
  render()
  check('admin shell rendered', [...rootEl.walk()].some((n) => n.classList?.contains('adm-shell')))
  check('login form shown when locked', [...rootEl.walk()].some((n) => n.tagName === 'INPUT'))
  check('body marked as admin', body.classList.contains('is-admin'))
  check('portfolio not mounted on admin route', ![...rootEl.walk()].some((n) => n.getAttribute('id') === 'hero'))

  console.log('\n7. Returning to the site restores the portfolio')
  globalThis.location.hash = '#home'
  render()
  check('portfolio back', [...rootEl.walk()].some((n) => n.getAttribute('id') === 'hero'))
  check('admin class cleared', !body.classList.contains('is-admin'))

  console.log('\n8. /dashboard path mounts the dashboard too')
  globalThis.location.hash = ''
  globalThis.location.pathname = '/dashboard'
  render()
  check('dashboard mounted at /dashboard',
    [...rootEl.walk()].some((n) => n.classList?.contains('adm-shell')))
  check('portfolio not mounted at /dashboard',
    ![...rootEl.walk()].some((n) => n.getAttribute('id') === 'hero'))
  check('theme colour injected for the dashboard',
    !!document.head?.querySelector?.('meta[name="theme-color"]'))

  globalThis.location.pathname = '/'
  render()
  check('portfolio returns at /', [...rootEl.walk()].some((n) => n.getAttribute('id') === 'hero'))

  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed
}