// End-to-end check for contact messages: submitting the public form persists a
// message, and the dashboard's Messages tab can list, read and delete it.
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
  globalThis.location = { hash: '#/admin', pathname: '/', href: 'http://localhost/#/admin' }
  Object.defineProperty(globalThis, 'scrollY', { value: 0, writable: true })
  globalThis.scrollTo = () => {}
  globalThis.innerWidth = 1400
  globalThis.innerHeight = 900

  const rootEl = new El('div')
  rootEl.setAttribute('id', 'root')
  attach(rootEl, body)
  globalThis.sessionStorage.setItem('portfolio:admin-unlocked', 'true')

  const store = await import('../src/store/contentStore.js')
  const messages = await import('../src/store/messagesStore.js')
  const { initForm } = await import('../js/form.js')
  const { MessagesPanel } = await import('../src/admin/panels/MessagesPanel.jsx')

  const all = (root, sel) => Array.from(root.querySelectorAll(sel))

  console.log('\n1. Messages store starts empty')
  messages.clearAll()
  check('no messages initially', messages.getMessages().length === 0)
  check('unread count is zero', messages.unreadCount() === 0)

  console.log('\n2. Adding a message')
  const msg = messages.addMessage({
    name: 'Sarah Kim',
    email: 'sarah@example.com',
    subject: 'Freelance project',
    body: 'Hi Bruce, I have a dashboard project.'
  })
  check('one message stored', messages.getMessages().length === 1)
  check('message has an id', !!msg.id)
  check('unread by default', msg.read === false)
  check('unread count is one', messages.unreadCount() === 1)
  check('timestamp recorded', !Number.isNaN(new Date(msg.createdAt).getTime()))
  check('values trimmed', messages.getMessages()[0].name === 'Sarah Kim')

  console.log('\n3. Newest message first')
  messages.addMessage({
    name: 'Marcus Johnson', email: 'm@example.com', subject: 'Hello', body: 'Second'
  })
  check('two messages', messages.getMessages().length === 2)
  check('newest is first', messages.getMessages()[0].name === 'Marcus Johnson')

  console.log('\n4. Read state')
  messages.markRead(messages.getMessages()[0].id)
  check('marked read', messages.getMessages()[0].read === true)
  check('unread count drops', messages.unreadCount() === 1)
  messages.markAllRead()
  check('mark all read', messages.unreadCount() === 0)
  messages.markRead(messages.getMessages()[0].id, false)
  check('can mark unread again', messages.unreadCount() === 1)

  console.log('\n5. Deleting')
  messages.removeMessage(messages.getMessages()[0].id)
  check('message removed', messages.getMessages().length === 1)
  check('remaining is the older one', messages.getMessages()[0].name === 'Sarah Kim')

  console.log('\n6. Persistence')
  check('written to localStorage', localStorage.getItem('portfolio:messages:v1') !== null)

  console.log('\n7. Contact form submits and saves')
  messages.clearAll()

  // Build a stand-in for the public contact form.
  const form = new El('form')
  form.setAttribute('id', 'contactForm')
  for (const [id, tag] of [['formName', 'input'], ['formEmail', 'input'], ['formSubject', 'input'], ['formMessage', 'textarea']]) {
    const group = new El('div')
    group.setAttribute('class', 'form-group')
    const input = new El(tag)
    input.setAttribute('id', id)
    group.appendChild(input)
    form.appendChild(group)
  }
  const btn = new El('button')
  btn.setAttribute('class', 'btn btn-primary btn-submit')
  form.appendChild(btn)
  attach(form, rootEl)

  // The runtime's closest() is not implemented in the shim, so wire the parent
  // lookup initForm relies on.
  for (const id of ['formName', 'formEmail', 'formSubject', 'formMessage']) {
    const input = form.querySelector(`#${id}`)
    input.closest = (sel) => (sel === '.form-group' ? input.parent : null)
  }

  initForm()

  const fire = () => form.listeners.submit.forEach((fn) => fn({ preventDefault() {}, target: form }))

  // Empty submit must be rejected, not stored.
  fire()
  check('empty form saves nothing', messages.getMessages().length === 0)
  check('error shown on name field', !!form.querySelector('.field-error'))
  check('submit stayed enabled', btn.disabled !== true)

  // Bad email must be rejected.
  form.querySelector('#formName').value = 'Sarah Kim'
  form.querySelector('#formEmail').value = 'not-an-email'
  form.querySelector('#formSubject').value = 'Project'
  form.querySelector('#formMessage').value = 'Hello there'
  fire()
  check('invalid email rejected', messages.getMessages().length === 0)
  check('email error shown', form.querySelectorAll('.field-error').length === 1)

  // Typing clears the error.
  form.querySelector('#formEmail').value = 'sarah@example.com'
  form.querySelector('#formEmail').listeners.input.forEach((fn) => fn({}))
  check('error cleared on input', form.querySelectorAll('.field-error').length === 0)

  // Valid submit stores the message after the short loading delay.
  fire()
  check('button disabled while sending', btn.disabled === true)
  check('loading class applied', btn.classList.contains('loading'))

  await new Promise((r) => setTimeout(r, 600))

  check('message saved', messages.getMessages().length === 1)
  const saved = messages.getMessages()[0]
  check('name stored', saved.name === 'Sarah Kim')
  check('email stored', saved.email === 'sarah@example.com')
  check('subject stored', saved.subject === 'Project')
  check('body stored', saved.body === 'Hello there')
  check('success state shown', btn.classList.contains('success'))

  console.log('\n8. Messages panel renders email-only rows')
  const panel = MessagesPanel()
  attach(panel, rootEl)

  check('panel renders', !!panel)
  check('summary shows unread', panel.textContent.includes('unread'))
  const rows = all(panel, '.adm-msg')
  check('one row per message', rows.length === 1)
  check('row is unread', rows[0].classList.contains('adm-msg-unread'))

  // The row must show the email and nothing else.
  check('row shows the email', rows[0].textContent.includes('sarah@example.com'))
  check('row hides the name', !rows[0].textContent.includes('Sarah Kim'))
  check('row hides the subject', !rows[0].textContent.includes('Project'))
  check('row hides the body', !rows[0].textContent.includes('Hello there'))
  check('row has an unread dot', !!rows[0].querySelector('.adm-msg-dot'))

  console.log('\n9. Clicking a row opens the dialog')
  check('no dialog before clicking', !document.querySelector('.adm-modal-backdrop'))
  rows[0].dispatch('click')

  const backdrop = document.querySelector('.adm-modal-backdrop')
  check('dialog opened', !!backdrop)

  const dialog = backdrop.querySelector('.adm-modal')
  check('dialog marked up as a dialog', dialog.getAttribute('role') === 'dialog')
  check('dialog shows the email', dialog.textContent.includes('sarah@example.com'))
  check('dialog shows the name', dialog.textContent.includes('Sarah Kim'))
  check('dialog shows the subject', dialog.textContent.includes('Project'))
  check('dialog shows the body', dialog.textContent.includes('Hello there'))

  check('opening marked it read', messages.getMessages()[0].read === true)
  check('row no longer unread',
    !all(panel, '.adm-msg')[0].classList.contains('adm-msg-unread'))
  check('row marked as the open one',
    all(panel, '.adm-msg')[0].classList.contains('adm-msg-open'))

  console.log('\n10. Gmail reply link')
  const gmail = dialog.querySelector('.adm-btn-gmail')
  check('Gmail button present', !!gmail)
  const href = decodeURIComponent(gmail.getAttribute('href'))
  check('opens mail.google.com', gmail.getAttribute('href').startsWith('https://mail.google.com/'))
  check('opens in a new tab', gmail.getAttribute('target') === '_blank')
  check('addresses the sender', href.includes('to=sarah@example.com'))
  check('prefills a Re: subject', href.includes('su=Re: Project'))
  check('quotes the original body', href.includes('Hello there'))
  check('includes a mailto fallback', !!dialog.querySelector('a[href^="mailto:"]'))

  console.log('\n11. Closing the dialog')
  dialog.querySelector('.adm-modal-close').dispatch('click')
  check('dialog cleared', backdrop.querySelector('.adm-modal') === null)
  check('row no longer marked open',
    !all(panel, '.adm-msg')[0].classList.contains('adm-msg-open'))

  console.log('\n12. Panel live-updates when a message arrives')
  messages.addMessage({
    name: 'Amy Liu', email: 'amy@example.com', subject: 'Hello', body: 'New one'
  })
  const updated = all(panel, '.adm-msg')
  check('two rows now', updated.length === 2)
  check('new message listed first', updated[0].textContent.includes('amy@example.com'))

  console.log('\n13. Deleting from an open dialog closes it')
  all(panel, '.adm-msg')[0].dispatch('click')
  check('dialog reopened', !!document.querySelector('.adm-modal'))
  const delBtn = document.querySelector('.adm-modal .adm-icon-danger')
  delBtn.dispatch('click')
  check('message deleted', messages.getMessages().length === 1)
  check('dialog closed after delete', document.querySelector('.adm-modal') === null)

  console.log('\n14. Empty state')
  messages.clearAll()
  check('empty state shown', !!panel.querySelector('.adm-msg-empty'))
  check('no rows left', all(panel, '.adm-msg').length === 0)

  console.log('\n12. Unread badge maths')
  messages.clearAll()
  messages.addMessage({ name: 'A', email: 'a@b.com', subject: 's', body: 'b' })
  messages.addMessage({ name: 'B', email: 'b@b.com', subject: 's', body: 'b' })
  check('two unread', messages.unreadCount() === 2)
  messages.markRead(messages.getMessages()[0].id)
  check('one unread left', messages.unreadCount() === 1)
  messages.markAllRead()
  check('none unread', messages.unreadCount() === 0)

  console.log('\n13. Relative timestamps')
  check('recent message reads as just now',
    messages.formatWhen(new Date().toISOString()) === 'just now')
  const minutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  check('five minutes ago', messages.formatWhen(minutesAgo) === '5 min ago')
  const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  check('three hours ago', messages.formatWhen(hoursAgo) === '3 hours ago')
  check('invalid date handled', messages.formatWhen('nonsense') === '')

  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed
}