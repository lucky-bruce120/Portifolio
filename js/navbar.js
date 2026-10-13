export function initNavbar() {
  const navbar = document.getElementById('navbar')
  const backToTop = document.getElementById('backToTop')
  const hamburger = document.getElementById('hamburger')
  const navLinksContainer = document.getElementById('navLinks')
  const navLinks = document.querySelectorAll('.nav-link')
  const sections = document.querySelectorAll('.section[id]')

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const onScroll = () => {
    const y = window.scrollY
    if (navbar) navbar.classList.toggle('scrolled', y > 50)
    if (backToTop) backToTop.classList.toggle('visible', y > 400)
  }

  window.addEventListener('scroll', onScroll)
  onScroll()

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const id = entry.target.getAttribute('id')
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
        })
      })
    },
    { rootMargin: '-50% 0px -50% 0px' }
  )
  sections.forEach((section) => sectionObserver.observe(section))

  const onHamburgerClick = () => {
    hamburger?.classList.toggle('active')
    navLinksContainer?.classList.toggle('open')
  }
  hamburger?.addEventListener('click', onHamburgerClick)

  const onNavLinkClick = () => {
    hamburger?.classList.remove('active')
    navLinksContainer?.classList.remove('open')
  }
  navLinks.forEach((link) => link.addEventListener('click', onNavLinkClick))

  return () => {
    window.removeEventListener('scroll', onScroll)
    hamburger?.removeEventListener('click', onHamburgerClick)
    navLinks.forEach((link) => link.removeEventListener('click', onNavLinkClick))
    sectionObserver.disconnect()
  }
}