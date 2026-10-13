// Headless smoke test: stubs just enough DOM to exercise the content store and
// the JSX runtime, then checks that content flows defaults -> edits -> render.
import { createDefaultContent } from '../src/data/defaultContent.js'

// --- Minimal DOM shim -------------------------------------------------------
class Node2 {}
class TextNode2 {
  constructor(text) { this.textContent = text; this.nodeType = 3 }
}
class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase()
    this.children = []
    this.attributes = {}
    this.style = { setProperty(k, v) { this[k] = v } }
    this.listeners = {}
    this.nodeType = 1
    this._text = ''
  }
  set className(v) { this.attributes.class = v }
  get className() { return this.attributes.class || '' }
  set innerHTML(v) { this._html = v }
  get innerHTML() { return this._html || '' }
  appendChild(child) {
    if (child instanceof El || child instanceof TextNode2) this.children.push(child)
    return child
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn) }
  removeEventListener() {}
  setAttribute(k, v) { this.attributes[k] = v }
  getAttribute(k) { return this.attributes[k] ?? null }
  querySelector() { return null }
  querySelectorAll() { return [] }
  get textContent() { return this._text }
  set textContent(v) { this._text = v }
}

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
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k)
}
globalThis.sessionStorage = globalThis.localStorage

// --- Assertions -------------------------------------------------------------
let passed = 0
let failed = 0
function check(label, condition) {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}`) }
}

console.log('\n1. Default content shape')
const base = createDefaultContent()
check('site.name is Bruce Lucky', base.site.name === 'Bruce Lucky')
check('projects has 4 items', base.projects.items.length === 4)
check('experience has 4 items', base.experience.items.length === 4)
check('every project has an id', base.projects.items.every((p) => !!p.id))
check('every skill item has an id', base.skills.categories.every((c) => c.items.every((i) => !!i.id)))
check('footer columns split into links + contact',
  base.footer.columns.some((c) => c.type === 'links') &&
  base.footer.columns.some((c) => c.type === 'contact'))
check('deep clone is independent',
  createDefaultContent().projects.items !== base.projects.items)

console.log('\n2. Store mutations')
const store = await import('../src/store/contentStore.js')

store.resetToDefaults()
check('reset produces 4 projects', store.getIn('projects.items').length === 4)

store.setIn('hero.name', 'Bruce L.')
check('setIn writes a nested scalar', store.getIn('hero.name') === 'Bruce L.')

store.pushTo('projects.items', { id: 'proj-x', title: 'New', tags: [], gradient: '', github: '', live: '' })
check('pushTo appends', store.getIn('projects.items').length === 5)

store.moveIn('projects.items', 4, 0)
check('moveIn reorders to the front', store.getIn('projects.items.0.title') === 'New')

store.removeAt('projects.items', 0)
check('removeAt deletes', store.getIn('projects.items').length === 4)
check('remaining order preserved', store.getIn('projects.items.0.title') === 'SkillMatch')

console.log('\n3. Subscriptions fire on change')
let notifications = 0
const unsubscribe = store.subscribe(() => { notifications++ })
store.setIn('hero.greeting', 'Hey,')
check('subscriber notified', notifications === 1)
unsubscribe()
store.setIn('hero.greeting', "Hi, I'm")
check('unsubscribe stops notifications', notifications === 1)

console.log('\n4. Persistence across reload')
check('content written to localStorage', storage.has('portfolio:content:v1'))
const reloaded = await import(`../src/store/contentStore.js?reload=${Date.now()}`)
check('reloaded store reads saved hero name', reloaded.getIn('hero.name') === 'Bruce L.')

console.log('\n5. Export / import round trip')
const snapshot = store.exportJson()
check('export produces JSON', snapshot.startsWith('{'))
store.resetToDefaults()
check('reset back to defaults', store.getIn('hero.name') === 'Bruce Lucky')
store.importJson(snapshot)
check('import restores the edited value', store.getIn('hero.name') === 'Bruce L.')

console.log('\n6. Merge keeps new schema fields')
const partial = { hero: { name: 'Partial' } }
storage.set('portfolio:content:v1', JSON.stringify(partial))
const merged = await import(`../src/store/contentStore.js?merge=${Date.now()}`)
check('saved field wins', merged.getIn('hero.name') === 'Partial')
check('missing field falls back to default', Array.isArray(merged.getIn('hero.roles')) && merged.getIn('hero.roles').length === 4)

console.log('\n7. Bad import is rejected')
let threw = false
try {
  store.importJson('"not an object"')
} catch {
  threw = true
}
check('importJson throws on a non-object', threw)

console.log('\n8. Repeater-shaped lists carry ids and labels')
const hero = store.getIn('hero')
check('hero.roles are objects', hero.roles.every((r) => typeof r === 'object'))
check('hero.roles all have an id', hero.roles.every((r) => !!r.id))
check('hero.roles carry text', hero.roles[0].text === 'Frontend Developer')
check('hero.techs are objects', hero.techs.every((t) => typeof t === 'object'))
check('hero.techs carry label', hero.techs[0].label === 'React')
check('about.paragraphs have ids', store.getIn('about.paragraphs').every((p) => !!p.id))

console.log('\n9. Legacy string lists are migrated')
const legacy = {
  hero: { roles: ['Old Role', 'Second Role'], techs: ['Vue', 'Svelte'] },
  about: { paragraphs: [{ text: 'no id here' }] }
}
storage.set('portfolio:content:v1', JSON.stringify(legacy))
const migrated = await import(`../src/store/contentStore.js?migrate=${Date.now()}`)
check('legacy role became an object', typeof migrated.getIn('hero.roles.0') === 'object')
check('legacy role text preserved', migrated.getIn('hero.roles.0.text') === 'Old Role')
check('legacy roles got ids', migrated.getIn('hero.roles').every((r) => !!r.id))
check('legacy tech label mapped from string', migrated.getIn('hero.techs.0.label') === 'Vue')
check('paragraph without id gains one', !!migrated.getIn('about.paragraphs.0.id'))
check('untouched fields still fall back to defaults', migrated.getIn('hero.name') === 'Bruce Lucky')

console.log(`\n${passed} passed, ${failed} failed\n`)
process.exit(failed ? 1 : 0)