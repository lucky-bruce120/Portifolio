export function initTheme() {
  const html = document.documentElement
  const toggle = document.getElementById('themeToggle')
  if (!toggle) return

  const saved = localStorage.getItem('theme') || 'dark'
  html.setAttribute('data-theme', saved)

  const onClick = () => {
    const current = html.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    html.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  toggle.addEventListener('click', onClick)
  return () => toggle.removeEventListener('click', onClick)
}