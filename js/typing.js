export function initTyping(roles = []) {
  const el = document.getElementById('typingText')
  const valid = roles.filter(Boolean)
  if (!el || !valid.length) return () => {}

  let roleIndex = 0
  let charIndex = 0
  let isDeleting = false
  let timer = null
  let stopped = false

  function tick() {
    if (stopped) return
    const currentRole = valid[roleIndex % valid.length]

    if (!isDeleting) {
      el.textContent = currentRole.substring(0, charIndex + 1)
      charIndex += 1
      if (charIndex === currentRole.length) {
        isDeleting = true
        timer = setTimeout(tick, 2000)
        return
      }
    } else {
      el.textContent = currentRole.substring(0, Math.max(0, charIndex - 1))
      charIndex -= 1
      if (charIndex <= 0) {
        isDeleting = false
        roleIndex = (roleIndex + 1) % valid.length
        timer = setTimeout(tick, 500)
        return
      }
    }

    timer = setTimeout(tick, isDeleting ? 50 : 100)
  }

  tick()

  return () => {
    stopped = true
    clearTimeout(timer)
  }
}