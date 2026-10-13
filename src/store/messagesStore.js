// Store for contact form submissions.
//
// Deliberately separate from contentStore: messages are runtime data (they
// arrive, get read, get deleted) rather than published site content, and they
// are personal data that should not end up in the content JSON export.

const STORAGE_KEY = 'portfolio:messages:v1'

let messages = load()
const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('[messagesStore] could not read messages', err)
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch (err) {
    // Quota is the realistic failure here; a lost message beats a broken page.
    console.warn('[messagesStore] could not save messages', err)
  }
}

function emit() {
  for (const listener of listeners) listener(messages)
}

export function getMessages() {
  return messages
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function addMessage({ name, email, subject, body }) {
  const message = {
    id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: String(name ?? '').trim(),
    email: String(email ?? '').trim(),
    subject: String(subject ?? '').trim(),
    body: String(body ?? '').trim(),
    createdAt: new Date().toISOString(),
    read: false
  }

  messages = [message, ...messages]
  persist()
  emit()
  return message
}

export function markRead(id, read = true) {
  messages = messages.map((m) => (m.id === id ? { ...m, read } : m))
  persist()
  emit()
}

export function markAllRead() {
  messages = messages.map((m) => ({ ...m, read: true }))
  persist()
  emit()
}

export function removeMessage(id) {
  messages = messages.filter((m) => m.id !== id)
  persist()
  emit()
}

export function clearAll() {
  messages = []
  persist()
  emit()
}

export function unreadCount() {
  return messages.filter((m) => !m.read).length
}

// Keeps an open dashboard in step with submissions that arrive in another tab.
export function syncFromStorage() {
  messages = load()
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) syncFromStorage()
  })
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export function formatWhen(iso) {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  const seconds = Math.floor((Date.now() - then.getTime()) / 1000)
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}