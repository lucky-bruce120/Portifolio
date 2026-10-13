// Admin gate. The password hash lives here rather than in localStorage so a
// visitor who opens devtools on their own machine still has to know the
// password. This is obfuscation, not real security: anyone with the source can
// read the hash. It stops casual access, which is the goal for a personal site.

const PASSWORD_HASH = '6f55feb0aa6eb7fd494bccde1234be4235696ad54a86aa018e6a445674641dfb'
const SESSION_KEY = 'portfolio:admin-unlocked'

async function sha256(value) {
  const data = new TextEncoder().encode(value)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

export function lock() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export async function unlock(password) {
  const hash = await sha256(password)
  if (hash !== PASSWORD_HASH) return false
  try {
    sessionStorage.setItem(SESSION_KEY, 'true')
  } catch {
    /* ignore */
  }
  return true
}