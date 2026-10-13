// Headless render smoke test. Loads the portfolio sections through Vite with a
// DOM shim, then asserts every section builds and reflects store edits.
import { createDefaultContent } from '../src/data/defaultContent.js'

// --- DOM shim (walks real child nodes so assertions can inspect the tree) ----
// The JSX runtime branches on `instanceof Node`, so the shim needs a real
// prototype chain rather than duck typing.
class DomNode {}
class TextNode2 extends DomNode {
  constructor(text) { super(); this.textContent = String(text); this.nodeType = 3 }
}
class El extends DomNode {
  constructor(tag) {
    super()
    this.tagName = String(tag).toUpperCase()
    this.children = []
    this.attributes = {}
    this.style = {
      setProperty(k, v) { this[k] = v }
    }
    this.listeners = {}
    this.nodeType = 1
  }
  set className(v) { this.attributes.class = v }
  get className() { return this.attributes.class || '' }
  appendChild(child) {
    if (child instanceof El || child instanceof TextNode2) this.children.push(child)
    return child
  }
  addEventListener() {}
  removeEventListener() {}
  setAttribute(k, v) { this.attributes[k] = v }
  getAttribute(k) { return this.attributes[k] ?? null }
  get textContent() {
    return this.children.map((c) => c.textContent ?? '').join('')
  }
  * walk() {
    yield this
    for (const child of this.children) {
      if (child instanceof El) yield* child.walk()
    }
  }
  hasClass(cls) {
    return (this.attributes.class || '').split(/\s+/).includes(cls)
  }
}

function installDomShim() {
  globalThis.Node = DomNode

  globalThis.document = {
    createElement: (t) => new El(t),
    createTextNode: (t) => new TextNode2(t),
    createDocumentFragment: () => new El('fragment'),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
    documentElement: { setAttribute() {}, getAttribute: () => 'dark' }
  }

  const storage = new Map()
  const shim = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k)
  }
  globalThis.localStorage = shim
  globalThis.sessionStorage = shim
}

let passed = 0
let failed = 0
function check(label, condition) {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}`) }
}

export async function run() {
  installDomShim()

  const store = await import('../src/store/contentStore.js')
  const { Navbar } = await import('../src/sections/Navbar.jsx')
  const { Hero } = await import('../src/sections/Hero.jsx')
  const { About } = await import('../src/sections/About.jsx')
  const { Skills } = await import('../src/sections/Skills.jsx')
  const { Projects } = await import('../src/sections/Projects.jsx')
  const { Experience } = await import('../src/sections/Experience.jsx')
  const { Testimonials } = await import('../src/sections/Testimonials.jsx')
  const { Contact } = await import('../src/sections/Contact.jsx')
  const { Footer } = await import('../src/sections/Footer.jsx')

  const SECTIONS = [
    ['Navbar', Navbar], ['Hero', Hero], ['About', About], ['Skills', Skills],
    ['Projects', Projects], ['Experience', Experience],
    ['Testimonials', Testimonials], ['Contact', Contact], ['Footer', Footer]
  ]

  console.log('\n1. Every section renders')
  const trees = {}
  for (const [name, Component] of SECTIONS) {
    try {
      trees[name] = Component()
      check(`${name} builds`, trees[name] instanceof El)
    } catch (err) {
      check(`${name} builds`, false)
      console.log(`        ${err.message}`)
    }
  }

  console.log('\n2. Structure and ids')
  check('hero section id', trees.Hero.getAttribute('id') === 'hero')
  check('projects section id', trees.Projects.getAttribute('id') === 'projects')
  check('contact section id', trees.Contact.getAttribute('id') === 'contact')

  const navLinks = [...trees.Navbar.walk()].filter((n) => n.hasClass('nav-link'))
  check('navbar renders 7 links', navLinks.length === 7)
  check('nav link label matches content', navLinks[0].textContent === 'Home')

  const stats = [...trees.About.walk()].filter((n) => n.hasClass('stat-number'))
  check('4 stat counters with data-target', stats.length === 4 && stats[0].getAttribute('data-target') === '1')

  console.log('\n3. Lists reflect store state')
  let projectCards = [...trees.Projects.walk()].filter((n) => n.hasClass('project-card'))
  check('4 project cards', projectCards.length === 4)

  const timelineItems = [...trees.Experience.walk()].filter((n) => n.hasClass('timeline-item'))
  check('4 timeline items', timelineItems.length === 4)

  const skillCategories = [...trees.Skills.walk()].filter((n) => n.hasClass('skill-category'))
  check('3 skill categories', skillCategories.length === 3)

  const skillFills = [...trees.Skills.walk()].filter((n) => n.hasClass('skill-bar-fill'))
  check('11 skill bars', skillFills.length === 11)
  check('skill bar carries data-width', skillFills[0].getAttribute('data-width') === '95')

  const testimonialCards = [...trees.Testimonials.walk()].filter((n) => n.hasClass('testimonial-card'))
  check('3 testimonial cards', testimonialCards.length === 3)
  check('dots generated from entries', [...trees.Testimonials.walk()].filter((n) => n.hasClass('dot')).length === 3)

  const techItems = [...trees.Skills.walk()].filter((n) => n.hasClass('tech-cloud-item'))
  check('10 tech stack badges', techItems.length === 10)

  const contactCards = [...trees.Contact.walk()].filter((n) => n.hasClass('contact-card'))
  check('3 contact cards', contactCards.length === 3)

  console.log('\n4. Content edits flow into the render')
  store.setIn('hero.name', 'Bruce Lucky Jr')
  check('hero shows edited name', Hero().textContent.includes('Bruce Lucky Jr'))

  store.pushTo('projects.items', {
    id: 'proj-new', title: 'Dashly', description: 'Analytics', category: 'react',
    tags: ['React'], gradient: 'linear-gradient(135deg,#111,#222)', github: '', live: ''
  })
  projectCards = [...Projects().walk()].filter((n) => n.hasClass('project-card'))
  check('added project appears', projectCards.length === 5)

  const filterBtns = [...Projects().walk()].filter((n) => n.hasClass('filter-btn'))
  check('filters built from categories (all + 3)', filterBtns.length === 4)
  check('category filter uses data-filter',
    filterBtns.some((b) => b.getAttribute('data-filter') === 'ui-ux'))

  store.moveIn('projects.items', 4, 0)
  projectCards = [...Projects().walk()].filter((n) => n.hasClass('project-card'))
  const info = projectCards[0].children.find((c) => c.hasClass('project-info'))
  check('reordering moves card to front', info.textContent.includes('Dashly'))

  store.removeAt('projects.items', 0)
  check('deleting removes the card',
    [...Projects().walk()].filter((n) => n.hasClass('project-card')).length === 4)

  console.log('\n5. Footer reads columns from content')
  const footerTree = Footer()
  check('footer renders 3 columns',
    [...footerTree.walk()].filter((n) => n.hasClass('footer-col')).length === 3)
  check('footer has contact column',
    [...footerTree.walk()].some((n) => n.hasClass('footer-contact')))
  check('footer CTA present', [...footerTree.walk()].some((n) => n.hasClass('footer-cta')))

  console.log('\n6. Empty collections degrade gracefully')
  store.setIn('projects.items', [])
  store.setIn('testimonials.items', [])
  store.setIn('experience.items', [])
  check('projects renders with zero items', Projects() instanceof El)
  check('testimonials renders with zero items', Testimonials() instanceof El)
  check('experience renders with zero items', Experience() instanceof El)

  console.log('\n7. Hero repeaters drive the render')
  store.resetToDefaults()
  let heroTree = Hero()
  let techCards = [...heroTree.walk()].filter((n) => n.hasClass('tech-card'))
  check('5 floating tech badges', techCards.length === 5)
  check('badge shows its label', techCards[0].textContent === 'React')

  store.pushTo('hero.techs', { id: 'herotech-9', label: 'GraphQL' })
  techCards = [...Hero().walk()].filter((n) => n.hasClass('tech-card'))
  check('added tech badge appears', techCards.length === 6)

  store.removeAt('hero.techs', 5)
  check('deleted tech badge disappears',
    [...Hero().walk()].filter((n) => n.hasClass('tech-card')).length === 5)

  store.setIn('hero.techs.0.label', 'React 19')
  techCards = [...Hero().walk()].filter((n) => n.hasClass('tech-card'))
  check('edited tech badge label shows', techCards[0].textContent === 'React 19')

  store.removeAt('hero.roles', 0)
  check('removing a role leaves the rest', store.getIn('hero.roles').length === 3)
  check('remaining roles intact', store.getIn('hero.roles.0.text') === 'UI Engineer')

  console.log('\n8. Hero buttons stay fully editable')
  const btnCount = () => [...Hero().walk()].filter((n) => n.hasClass('btn')).length
  const before = btnCount()
  store.pushTo('hero.buttons', { id: 'hero-btn-x', label: 'Resume', href: '/cv.pdf', variant: 'primary', icon: '' })
  check('added hero button renders', btnCount() === before + 1)
  store.setIn('hero.buttons.2.label', 'Download CV')
  check('renamed hero button renders', Hero().textContent.includes('Download CV'))
  store.removeAt('hero.buttons', 2)
  check('removed hero button is gone', !Hero().textContent.includes('Download CV'))

  store.resetToDefaults()

  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed
}