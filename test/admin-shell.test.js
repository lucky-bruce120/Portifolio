// Tests the dashboard shell itself: that the tabs render, switching tabs works,
// and the live preview toggle mounts. This covers the unlocked path, which the
// bootstrap test only ever saw in its locked/login state.
import { installDomShim, attach } from './dom-shim.js'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

export async function run() {
  const { body, El } = installDomShim()

  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.location = { hash: '#/admin', href: 'http://localhost/#/admin' }
  Object.defineProperty(globalThis, 'scrollY', { value: 0, writable: true })
  globalThis.scrollTo = () => {}
  globalThis.innerWidth = 1400
  globalThis.innerHeight = 900

  const rootEl = new El('div')
  rootEl.setAttribute('id', 'root')
  attach(rootEl, body)

  // Mark the session unlocked so AdminApp renders the Dashboard, not the login.
  globalThis.sessionStorage.setItem('portfolio:admin-unlocked', 'true')

  const errors = []
  const realError = console.error
  const realWarn = console.warn
  console.error = (...a) => { errors.push(a.map(String).join(' ')); realError(...a) }
  console.warn = (...a) => { errors.push(a.map(String).join(' ')); realWarn(...a) }

  const { AdminApp } = await import('../src/admin/AdminApp.jsx')

  console.log('\n1. Unlocked dashboard mounts')
  let shell = null
  try {
    shell = AdminApp()
    attach(shell, rootEl)
  } catch (err) {
    realError('mount error:', err)
  }
  check('AdminApp returned a node', shell instanceof El)
  check('no errors while mounting', errors.length === 0, errors.join(' | '))

  // renderTab runs in a microtask, so let it settle.
  await Promise.resolve()
  await Promise.resolve()

  const all = (node, sel) => Array.from(node.querySelectorAll(sel))

  console.log('\n2. Tabs render into the sidebar')
  const tabs = all(shell, '.adm-tab')
  check('a tab per section (11, incl. Messages)', tabs.length === 11, `${tabs.length} tabs`)
  check('Messages tab present', tabs.some((t) => t.textContent.includes('Messages')))
  check('first tab is active', tabs[0].classList.contains('active'))
  check('tab labels present', tabs.map((t) => t.textContent).includes('Projects'))

  console.log('\n3. First panel renders content')
  const panel = shell.querySelector('.adm-panel')
  check('panel populated', panel.children.length > 0)
  check('panel shows the Site panel', panel.textContent.includes('Site Identity'))
  check('panel has editable inputs', all(panel, 'input').length > 0)

  console.log('\n4. Switching tabs swaps the panel')
  tabs.find((t) => t.textContent === 'Projects').dispatch('click')
  check('Projects panel shown', panel.textContent.includes('Project cards'))
  check('previous panel gone', !panel.textContent.includes('Site Identity'))
  check('Projects tab is now active',
    all(shell, '.adm-tab').find((t) => t.textContent === 'Projects').classList.contains('active'))
  check('tab count unchanged', all(shell, '.adm-tab').length === 11)

  console.log('\n5. Switching to a nested repeater tab')
  tabs.find((t) => t.textContent === 'Skills').dispatch('click')
  check('Skills panel shown', panel.textContent.includes('Skill categories'))
  check('repeaters rendered', all(panel, 'details.adm-item').length > 0)
  check('add buttons present',
    all(panel, 'button').some((b) => b.textContent.includes('Add')))

  console.log('\n6. Live preview toggle')
  const slot = shell.querySelector('.adm-preview-slot')
  check('preview slot starts empty', slot.children.length === 0)

  const toggle = all(shell, 'button').find((b) => b.textContent.includes('Live preview'))
  check('toggle button found', !!toggle)

  toggle.dispatch('click')
  check('preview mounted into slot', slot.children.length === 1)
  check('preview pane rendered', !!slot.querySelector('.adm-preview'))
  check('shell switched to preview layout',
    shell.querySelector('.adm-dash').classList.contains('adm-dash-preview'),
    `dash class=${shell.querySelector('.adm-dash').getAttribute('class')}`)
  check('toggle marked active', toggle.classList.contains('active'))
  check('preview shows the portfolio', !!slot.querySelector('#hero'))

  console.log('\n7. Toggling preview off')
  toggle.dispatch('click')
  check('preview removed', slot.children.length === 0)
  check('layout reverted', !shell.querySelector('.adm-dash').classList.contains('adm-dash-preview'))
  check('panel survives the toggle', panel.children.length > 0)

  console.log('\n8. Editing still works after toggling')
  tabs.find((t) => t.textContent === 'Projects').dispatch('click')
  const store = await import('../src/store/contentStore.js')
  const addBtn = all(panel, 'button').find((b) => b.textContent.includes('Add project'))
  check('add button available', !!addBtn)
  const before = store.getIn('projects.items').length
  addBtn.dispatch('click')
  check('project added instantly', store.getIn('projects.items').length === before + 1)

  console.log('\n9. Every tab renders without throwing')
  for (const tab of all(shell, '.adm-tab')) {
    tab.dispatch('click')
    check(`tab "${tab.textContent}" renders`, panel.children.length > 0)
  }

  console.log('\n10. No errors accumulated across the whole session')
  check('zero errors', errors.length === 0, errors.join(' | '))

  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed
}
