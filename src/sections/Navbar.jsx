import { getState } from '../store/contentStore.js'

export function Navbar() {
  const { nav, site } = getState()

  return (
    <>
      <nav class="navbar" id="navbar">
        <div class="nav-container">
          <a href="#hero" class="nav-logo">
            {site.initials}
            <span class="text-gradient">.</span>
          </a>
          <ul class="nav-links" id="navLinks">
            {nav.links.map((link, i) => (
              <li>
                <a href={link.href} class={`nav-link${i === 0 ? ' active' : ''}`}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div class="nav-actions">
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
              <i class="fas fa-sun"></i>
              <i class="fas fa-moon"></i>
            </button>
            <button class="hamburger" id="hamburger" aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}