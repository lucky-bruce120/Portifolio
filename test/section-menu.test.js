// Tests for the dashboard's section dropdown: opening, selecting, keyboard
// handling, outside clicks and the unread badge.
import { installDomShim, attach } from './dom-shim.js'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

export async function run() {
  const { body, El } = installDomShim()

  globalThis.location = { hash: '#/admin', href: 'http://localhost/#/admin' }
  Object.defineProperty(globalThis, 'scrollY', { value: 0, writable: true })
  globalThis.scrollTo = () => {}
  globalThis.innerWidth = 1400
  globalThis.innerHeight = 900

  globalThis.sessionStorage.setItem('portfolio:admin-unlocked', 'true')

  const messages = await import('../src/store/messagesStore.js')
  const { SectionMenu } = await import('../src/admin/components/SectionMenu.jsx')
  const { TABS } = await import('../src/admin/tabs.js')

  const all = (root, sel) => Array.from(root.querySelectorAll(sel))

  messages.clearAll()

  let current = 'site'
  const selected = []

  const menu = SectionMenu({ tabs: TABS, current, onSelect: (id) => {
    current = id
    selected.push(id)
  }})
  attach(menu, body)

  const trigger = menu.querySelector('.adm-menu-trigger')
  const list = menu.querySelector('.adm-menu-list')

  console.log('\n1. Menu renders every section')
  const options = all(menu, '.adm-menu-item')
  check('one option per section', options.length === TABS.length, `${options.length} of ${TABS.length}`)
  check('options carry their id', options[0].dataset.id === 'site')
  check('options show a label', options[0].textContent.includes('Site'))
  check('options show an icon', !!options[0].querySelector('i'))

  console.log('\n2. Trigger reflects the current section')
  check('trigger label matches', trigger.querySelector('.adm-menu-trigger-label').textContent === 'Site')
  check('trigger marked as a popup', trigger.getAttribute('aria-haspopup') === 'listbox')
  check('starts collapsed', trigger.getAttribute('aria-expanded') === 'false')
  check('list is hidden by default', !menu.classList.contains('is-open'))
  check('current option marked', options[0].classList.contains('active'))
  check('current option is aria-selected', options[0].getAttribute('aria-selected') === 'true')

  console.log('\n3. Opening and closing')
  trigger.dispatch('click')
  check('opens on click', menu.classList.contains('is-open'))
  check('aria-expanded updates', trigger.getAttribute('aria-expanded') === 'true')

  trigger.dispatch('click')
  check('closes on second click', !menu.classList.contains('is-open'))
  check('aria-expanded resets', trigger.getAttribute('aria-expanded') === 'false')

  console.log('\n4. Selecting a section')
  trigger.dispatch('click')
  const projectsOption = options.find((o) => o.dataset.id === 'projects')
  projectsOption.dispatch('click')
  check('selection reported', selected[selected.length - 1] === 'projects')
  check('menu closes after selecting', !menu.classList.contains('is-open'))

  console.log('\n5. update() retargets without rebuilding')
  const sameNode = menu.querySelector('.adm-menu-trigger')
  menu.update('messages')
  check('same trigger node reused', menu.querySelector('.adm-menu-trigger') === sameNode)
  check('trigger label follows', trigger.querySelector('.adm-menu-trigger-label').textContent === 'Messages')
  check('data-current follows', menu.dataset.current === 'messages')
  const messagesOption = options.find((o) => o.dataset.id === 'messages')
  check('messages option now active', messagesOption.classList.contains('active'))
  check('only one option active', all(menu, '.adm-menu-item').filter((o) => o.classList.contains('active')).length === 1)

  console.log('\n6. Escape closes the menu')
  trigger.dispatch('click')
  check('open again', menu.classList.contains('is-open'))
  // The menu listens on document, not the trigger, so dispatch there.
  document.dispatchEvent({ type: 'keydown', key: 'Escape' })
  check('Escape closes it', !menu.classList.contains('is-open'))

  console.log('\n7. Clicking outside closes the menu')
  trigger.dispatch('click')
  check('open for outside test', menu.classList.contains('is-open'))
  document.dispatchEvent({ type: 'click', target: body })
  check('outside click closes', !menu.classList.contains('is-open'))

  console.log('\n8. Clicking inside does not close it')
  trigger.dispatch('click')
  const inside = options[0]
  document.dispatchEvent({ type: 'click', target: inside })
  check('stays open when clicking inside', menu.classList.contains('is-open'))
  trigger.dispatch('click')

  console.log('\n9. Keyboard navigation')
  // Arrow keys on the trigger must open the menu: Enter/Space fire click
  // natively, but arrows do not, so a keyboard-only user would be stuck.
  let prevented = false
  trigger.dispatch('keydown', { key: 'ArrowDown', preventDefault: () => { prevented = true } })
  check('ArrowDown on the trigger opens the menu', menu.classList.contains('is-open'))
  check('ArrowDown prevents default scrolling', prevented)
  check('focus moves into the menu',
    document.activeElement?.classList?.contains('adm-menu-item') === true)

  // Once open, the document handler moves focus between options.
  document.dispatchEvent({ type: 'keydown', key: 'ArrowDown' })
  check('ArrowDown moves to the next option',
    document.activeElement?.classList?.contains('adm-menu-item') === true)

  document.dispatchEvent({ type: 'keydown', key: 'Escape' })
  check('Escape closes it again', !menu.classList.contains('is-open'))

  trigger.dispatch('keydown', { key: 'ArrowUp', preventDefault: () => {} })
  check('ArrowUp also opens the menu', menu.classList.contains('is-open'))
  trigger.dispatch('click')

  console.log('\n10. Unread badge')
  messages.clearAll()
  trigger.dispatch('click')
  let messagesBadge = all(menu, '.adm-menu-item')
    .find((o) => o.dataset.id === 'messages')
    .querySelector('.adm-tab-badge')
  check('badge hidden with no messages', messagesBadge.textContent === '')

  messages.addMessage({ name: 'A', email: 'a@b.com', subject: 's', body: 'b' })
  check('badge appears when a message arrives', messagesBadge.textContent === '1', messagesBadge.textContent)
  check('badge is displayed', messagesBadge.style.display === 'inline-flex')

  messages.addMessage({ name: 'B', email: 'b@b.com', subject: 's', body: 'b' })
  check('badge counts up', messagesBadge.textContent === '2', messagesBadge.textContent)

  // Other sections must not grow a badge.
  const siteBadge = options[0].querySelector('.adm-tab-badge')
  check('other sections have no badge', siteBadge.textContent === '')

  messages.clearAll()
  check('badge clears again', messagesBadge.textContent === '')

  console.log('\n11. Detached menu stops listening')
  menu.remove()
  messages.addMessage({ name: 'C', email: 'c@b.com', subject: 's', body: 'b' })
  check('no throw after detach', true)

  messages.clearAll()

  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed
}