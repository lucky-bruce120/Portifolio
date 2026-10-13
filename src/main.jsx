import { getState, subscribe } from './store/contentStore.js'

import { Cursor } from './sections/Cursor.jsx'
import { Navbar } from './sections/Navbar.jsx'
import { Hero } from './sections/Hero.jsx'
import { About } from './sections/About.jsx'
import { Skills } from './sections/Skills.jsx'
import { Projects } from './sections/Projects.jsx'
import { Experience } from './sections/Experience.jsx'
import { Testimonials } from './sections/Testimonials.jsx'
import { Contact } from './sections/Contact.jsx'
import { Footer } from './sections/Footer.jsx'
import { AdminApp } from './admin/AdminApp.jsx'

import { initTheme } from '../js/theme.js'
import { initParticles } from '../js/particles.js'
import { initParallax } from '../js/parallax.js'
import { initNavbar } from '../js/navbar.js'
import { initReveal } from '../js/reveal.js'
import { initTyping } from '../js/typing.js'
import { initCounters } from '../js/counters.js'
import { initSkills } from '../js/skills.js'
import { initProjects } from '../js/projects.js'
import { initTestimonials } from '../js/testimonials.js'
import { initForm } from '../js/form.js'
import { initScroll } from '../js/scroll.js'

import { registerDashboardServiceWorker } from './pwa/registerServiceWorker.js'

const root = document.getElementById('root') || document.body

// Teardowns from the previous render, so re-renders never double-bind
// listeners or stack animation loops.
let cleanups = []

function runCleanups() {
  for (const cleanup of cleanups) {
    try {
      cleanup()
    } catch (err) {
      console.warn('[app] cleanup failed', err)
    }
  }
  cleanups = []
}

/**
 * The dashboard has two entry points:
 *   /dashboard  a real path, so a PWA manifest can use it as `start_url`
 *   /#/admin    the original hash route, still supported and unchanged
 * The public portfolio is served from `/` and never matches either.
 */
export function isDashboardRoute() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '/dashboard' || isAdminRoute()
}

export function isAdminRoute() {
  return window.location.hash.replace(/^#/, '') === '/admin'
}

/**
 * On /dashboard the browser chrome would otherwise stay the portfolio's dark
 * background. Injected rather than hard-coded in index.html so the public site
 * keeps its own look.
 */
function applyDashboardThemeColor() {
  if (document.querySelector('meta[name="theme-color"]')) return

  const meta = document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('content', '#0f0f15')
  document.head.appendChild(meta)
}

function renderPortfolio() {
  const { hero } = getState()

  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

function initPortfolioBehavior() {
  const { hero } = getState()
  const roles = hero.roles
    .map((role) => (typeof role === 'string' ? role : role.text))
    .filter(Boolean)

  cleanups = [
    initTheme(),
    initParticles(),
    initParallax(),
    initNavbar(),
    initReveal(),
    initTyping(roles),
    initCounters(),
    initSkills(),
    initProjects(),
    initTestimonials(),
    initForm(),
    initScroll()
  ].filter(Boolean)
}

export function render() {
  runCleanups()

  // Preserve the scroll position across content-driven re-renders so typing in
  // the dashboard preview doesn't jump the visitor back to the top.
  const scrollY = window.scrollY
  const wasDashboard = document.body.classList.contains('is-admin')

  root.textContent = ''
  root.appendChild(isDashboardRoute() ? <AdminApp /> : renderPortfolio())

  if (isDashboardRoute()) {
    document.body.classList.add('is-admin')
    applyDashboardThemeColor()
  } else {
    document.body.classList.remove('is-admin')
    document.querySelector('meta[name="theme-color"]')?.remove()
    initPortfolioBehavior()
    if (!wasDashboard) window.scrollTo({ top: scrollY })
  }
}

// Content edits re-render the portfolio for the live preview, but never the
// dashboard itself: the admin inputs already read straight from the store, and
// re-rendering them mid-typing would drop focus and reset the open tab.
subscribe(() => {
  if (!isDashboardRoute()) render()
})

window.addEventListener('hashchange', render)

registerDashboardServiceWorker()

render()