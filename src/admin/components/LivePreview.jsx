import { subscribe } from '../../store/contentStore.js'

import { Hero } from '../../sections/Hero.jsx'
import { About } from '../../sections/About.jsx'
import { Skills } from '../../sections/Skills.jsx'
import { Projects } from '../../sections/Projects.jsx'
import { Experience } from '../../sections/Experience.jsx'
import { Testimonials } from '../../sections/Testimonials.jsx'
import { Contact } from '../../sections/Contact.jsx'
import { Footer } from '../../sections/Footer.jsx'

// A side-by-side preview of the real portfolio markup, rebuilt from the store
// on every change. It shares the in-memory state, so nothing is refetched and
// no page reload is involved - edits show up as you type.
//
// The heavy behaviour modules (particles, observers, typing animation) are
// deliberately not started here: they are single-instance and keyed to the real
// page, and a static snapshot is both accurate enough to edit against and cheap
// to repaint.

function previewMarkup() {
  return (
    <>
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

// Scroll-reveal animations, skill bars and stat counters only run once on the
// real page, so flatten them to their final state for an accurate snapshot.
function decorate(root) {
  for (const el of root.querySelectorAll('.reveal')) el.classList.add('revealed')

  for (const el of root.querySelectorAll('.skill-bar-fill')) {
    el.style.width = `${el.getAttribute('data-width') ?? 0}%`
  }

  for (const el of root.querySelectorAll('.stat-number')) {
    el.textContent = el.getAttribute('data-target') ?? '0'
  }

  // The first testimonial is the one an unopened slider would show.
  const dots = root.querySelectorAll('.testimonial-dots .dot')
  for (const dot of dots) {
    dot.classList.toggle('active', dot.getAttribute('data-index') === '0')
  }

  // Particle canvas and decorative orbs are position:fixed and would escape
  // the preview pane, so drop them.
  root.querySelector('#particle-canvas')?.remove()
  for (const orb of root.querySelectorAll('.orb')) orb.remove()

  for (const link of root.querySelectorAll('a[href^="#"]')) link.removeAttribute('href')
  for (const btn of root.querySelectorAll('button')) btn.disabled = true
}

export function LivePreview() {
  const viewport = document.createElement('div')
  viewport.className = 'adm-preview-viewport'

  let frame = 0
  const paint = () => {
    const host = document.createElement('div')
    host.className = 'adm-preview-page'
    try {
      host.appendChild(previewMarkup())
      decorate(host)
    } catch (err) {
      console.warn('[LivePreview] render failed', err)
      host.appendChild(<p class="adm-preview-error">Preview could not render this content.</p>)
    }
    viewport.textContent = ''
    viewport.appendChild(host)
  }

  // Coalesce rapid edits into one repaint per frame.
  const unsubscribe = subscribe(() => {
    if (!viewport.isConnected) {
      unsubscribe()
      cancelAnimationFrame(frame)
      return
    }
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(paint)
  })

  paint()

  return (
    <div class="adm-preview">
      <div class="adm-preview-head">
        <span class="adm-preview-dot"></span>
        <span class="adm-preview-title">Live Preview</span>
        <span class="adm-preview-note">updates as you type</span>
      </div>
      {viewport}
    </div>
  )
}