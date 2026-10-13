export function initScroll() {
  const indicator = document.querySelector('.scroll-indicator')

  const onScroll = () => {
    if (!indicator) return
    const opacity = Math.max(0, 1 - window.scrollY / 200)
    indicator.style.opacity = opacity
    indicator.style.pointerEvents = opacity > 0 ? 'auto' : 'none'
  }

  window.addEventListener('scroll', onScroll)
  onScroll()

  // Only intercept in-page anchors that actually resolve to an element, so
  // admin routes and external links keep their default behaviour.
  const onAnchorClick = (e) => {
    const anchor = e.target.closest?.('a[href^="#"]')
    if (!anchor) return
    const target = document.querySelector(anchor.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  document.addEventListener('click', onAnchorClick)

  return () => {
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('click', onAnchorClick)
  }
}