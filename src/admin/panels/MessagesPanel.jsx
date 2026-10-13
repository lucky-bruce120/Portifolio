import {
  getMessages,
  subscribe,
  markRead,
  markAllRead,
  removeMessage,
  clearAll,
  unreadCount,
  formatWhen
} from '../../store/messagesStore.js'
import { PanelHeader } from '../components/Panel.jsx'

// Opens Gmail's own compose window with the recipient, subject and a quoted
// reply already filled in - so the message never leaves Gmail.
function gmailComposeUrl(email, subject, body, createdAt) {
  const when = new Date(createdAt)
  const stamp = Number.isNaN(when.getTime()) ? '' : when.toLocaleString()

  const quoted = stamp
    ? `\n\nOn ${stamp}, ${email} wrote:\n${body
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')}`
    : `\n\n${body}`

  // encodeURIComponent rather than URLSearchParams: the latter encodes spaces
  // as "+", which is not reliably decoded in a query string.
  const qs = [
    `view=cm`,
    `fs=1`,
    `to=${encodeURIComponent(email)}`,
    `su=${encodeURIComponent(`Re: ${subject}`)}`,
    `body=${encodeURIComponent(quoted)}`
  ].join('&')

  return `https://mail.google.com/mail/u/0/?${qs}`
}

export function MessagesPanel() {
  // Like Repeater, this owns its DOM and repaints itself, so a message arriving
  // in another tab shows up here without disturbing whatever you're editing.
  const host = document.createElement('div')

  // The dialog lives outside the list so repainting the list cannot close it.
  // It is attached to <body> on first use and removed when the panel goes away.
  let overlay = null
  let openId = null

  const closeModal = () => {
    openId = null
    if (overlay) overlay.textContent = ''
    document.removeEventListener('keydown', onKeydown)
    // Repaint so the open row loses its highlight.
    if (host.isConnected) paint()
  }

  const onKeydown = (e) => {
    if (e.key === 'Escape') closeModal()
  }

  const ensureOverlay = () => {
    if (overlay && overlay.isConnected) return overlay

    overlay = document.createElement('div')
    overlay.className = 'adm-modal-backdrop'
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal()
    })
    document.body.appendChild(overlay)
    return overlay
  }

  const openModal = (message) => {
    openId = message.id
    if (!message.read) markRead(message.id, true)

    const layer = ensureOverlay()
    layer.textContent = ''
    layer.appendChild(messageModal(message, closeModal))
    document.addEventListener('keydown', onKeydown)
  }

  const renderModal = () => {
    if (!openId || !overlay) return
    const message = getMessages().find((m) => m.id === openId)
    // The message was deleted while the dialog was open.
    if (!message) return closeModal()

    overlay.textContent = ''
    overlay.appendChild(messageModal(message, closeModal))
  }

  const paint = () => {
    const messages = getMessages()
    host.textContent = ''

    host.appendChild(
      <PanelHeader
        title="Messages"
        subtitle="Submissions from the contact form on your portfolio."
      />
    )

    const unread = unreadCount()
    const bar = document.createElement('div')
    bar.className = 'adm-msg-bar'

    const status = document.createElement('p')
    status.className = 'adm-msg-status'
    status.textContent = messages.length
      ? `${messages.length} message${messages.length === 1 ? '' : 's'}` +
        (unread ? `, ${unread} unread` : '')
      : ''
    bar.appendChild(status)

    if (messages.length > 0) {
      const actions = document.createElement('div')
      actions.className = 'adm-msg-actions'

      if (unread > 0) {
        const readAll = document.createElement('button')
        readAll.className = 'adm-btn adm-btn-ghost'
        readAll.appendChild(<i class="fas fa-envelope-open"></i>)
        readAll.appendChild(document.createTextNode(' Mark all read'))
        readAll.addEventListener('click', markAllRead)
        actions.appendChild(readAll)
      }

      const wipe = document.createElement('button')
      wipe.className = 'adm-btn adm-btn-danger'
      wipe.appendChild(<i class="fas fa-trash"></i>)
      wipe.appendChild(document.createTextNode(' Delete all'))
      wipe.addEventListener('click', () => {
        if (confirm(`Delete all ${messages.length} messages? This cannot be undone.`)) {
          closeModal()
          clearAll()
        }
      })
      actions.appendChild(wipe)

      bar.appendChild(actions)
    }

    host.appendChild(bar)

    if (messages.length === 0) {
      host.appendChild(
        <div class="adm-msg-empty">
          <i class="fas fa-inbox"></i>
          <p>No messages yet.</p>
          <span>Submissions from the contact form will land here.</span>
        </div>
      )
      return
    }

    const list = document.createElement('div')
    list.className = 'adm-msg-list'

    for (const message of messages) {
      list.appendChild(messageRow(message, openId, openModal))
    }

    host.appendChild(list)
  }

  const unsubscribe = subscribe(() => {
    if (!host.isConnected) {
      unsubscribe()
      document.removeEventListener('keydown', onKeydown)
      overlay?.remove()
      return
    }
    paint()
    renderModal()
  })

  paint()

  return host
}

// The list row shows only the sender's email address; everything else is in
// the dialog.
function messageRow(message, openId, openModal) {
  const row = document.createElement('button')
  row.type = 'button'
  row.className = `adm-msg${message.read ? '' : ' adm-msg-unread'}${
    openId === message.id ? ' adm-msg-open' : ''
  }`
  row.setAttribute('aria-label', `Open message from ${message.email}`)

  const dot = document.createElement('span')
  dot.className = 'adm-msg-dot'
  row.appendChild(dot)

  const email = document.createElement('span')
  email.className = 'adm-msg-email'
  email.textContent = message.email
  row.appendChild(email)

  const chevron = document.createElement('i')
  chevron.className = 'fas fa-chevron-right adm-msg-chevron'
  row.appendChild(chevron)

  row.addEventListener('click', () => openModal(message))

  return row
}

function messageModal(message, onClose) {
  const dialog = document.createElement('div')
  dialog.className = 'adm-modal'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', `Message from ${message.email}`)

  const close = document.createElement('button')
  close.className = 'adm-modal-close'
  close.setAttribute('aria-label', 'Close')
  close.appendChild(<i class="fas fa-xmark"></i>)

  const head = document.createElement('header')
  head.className = 'adm-modal-head'

  const who = document.createElement('div')
  who.className = 'adm-modal-who'

  const from = document.createElement('a')
  from.className = 'adm-modal-from'
  from.setAttribute('href', `mailto:${message.email}`)
  from.textContent = message.email
  who.appendChild(from)

  const byline = document.createElement('span')
  byline.className = 'adm-modal-byline'
  const parts = []
  if (message.name) parts.push(message.name)
  parts.push(formatWhen(message.createdAt))
  byline.textContent = parts.join(' \u00b7 ')
  const exact = new Date(message.createdAt)
  if (!Number.isNaN(exact.getTime())) byline.title = exact.toLocaleString()
  who.appendChild(byline)

  head.appendChild(who)
  head.appendChild(close)
  dialog.appendChild(head)

  const subject = document.createElement('h2')
  subject.className = 'adm-modal-subject'
  subject.textContent = message.subject || '(no subject)'
  dialog.appendChild(subject)

  const body = document.createElement('p')
  body.className = 'adm-modal-body'
  // textContent, not innerHTML: the body is visitor-supplied.
  body.textContent = message.body
  dialog.appendChild(body)

  const actions = document.createElement('footer')
  actions.className = 'adm-modal-actions'

  const gmail = document.createElement('a')
  gmail.className = 'adm-btn adm-btn-gmail'
  gmail.setAttribute(
    'href',
    gmailComposeUrl(message.email, message.subject, message.body, message.createdAt)
  )
  gmail.setAttribute('target', '_blank')
  gmail.setAttribute('rel', 'noopener noreferrer')
  gmail.appendChild(<i class="fab fa-google"></i>)
  gmail.appendChild(document.createTextNode(' Reply in Gmail'))
  actions.appendChild(gmail)

  const mailto = document.createElement('a')
  mailto.className = 'adm-btn adm-btn-ghost'
  mailto.setAttribute(
    'href',
    `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`
  )
  mailto.appendChild(<i class="fas fa-envelope"></i>)
  mailto.appendChild(document.createTextNode(' Other mail app'))
  actions.appendChild(mailto)

  const spacer = document.createElement('div')
  spacer.className = 'adm-modal-spacer'
  actions.appendChild(spacer)

  const toggle = document.createElement('button')
  toggle.className = 'adm-icon-btn'
  toggle.title = message.read ? 'Mark as unread' : 'Mark as read'
  toggle.appendChild(<i class={message.read ? 'fas fa-envelope' : 'fas fa-envelope-open'}></i>)
  toggle.addEventListener('click', () => markRead(message.id, !message.read))
  actions.appendChild(toggle)

  const remove = document.createElement('button')
  remove.className = 'adm-icon-btn adm-icon-danger'
  remove.title = 'Delete message'
  remove.appendChild(<i class="fas fa-trash"></i>)
  remove.addEventListener('click', () => {
    if (confirm(`Delete the message from ${message.email}?`)) removeMessage(message.id)
  })
  actions.appendChild(remove)

  dialog.appendChild(actions)

  close.addEventListener('click', onClose)

  return dialog
}