// A small DOM shim, just capable enough to exercise the dashboard's
// self-refreshing components outside a browser. Supports the selector forms the
// app actually uses: tag, .class, #id, [attr], [attr^="value"] and the
// descendant combinator.

class DomNode {}

class TextNode extends DomNode {
  constructor(text) {
    super()
    this.textContent = String(text)
    this.nodeType = 3
  }
}

class ClassList {
  constructor(el) { this.el = el }
  get _list() {
    return (this.el.getAttribute('class') || '').split(/\s+/).filter(Boolean)
  }
  _write(list) { this.el.setAttribute('class', list.join(' ')) }
  add(...names) {
    const list = this._list
    for (const n of names) if (!list.includes(n)) list.push(n)
    this._write(list)
  }
  remove(...names) {
    this._write(this._list.filter((n) => !names.includes(n)))
  }
  contains(name) { return this._list.includes(name) }
  toggle(name, force) {
    const has = this.contains(name)
    const want = force === undefined ? !has : Boolean(force)
    if (want) this.add(name)
    else this.remove(name)
    return want
  }
}

const selectorCache = new Map()

// A real querySelectorAll returns a NodeList: array-like (indexed, iterable,
// has length) but NOT an Array. It deliberately has no .map/.filter/.find, so
// code that forgets Array.from(...) fails here instead of only in the browser.
class NodeList {
  constructor(items) {
    this.length = items.length
    for (let i = 0; i < items.length; i++) this[i] = items[i]
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) yield this[i]
  }
  forEach(fn) {
    let i = 0
    for (const item of this) fn(item, i++, this)
  }
  item(i) { return this[i] ?? null }
}

// Parses "details.adm-item[open]" style simple selectors into a matcher.
function parseSimple(simple) {
  if (selectorCache.has(simple)) return selectorCache.get(simple)

  const parts = { tag: null, classes: [], id: null, attrs: [] }
  const re = /(^[a-zA-Z][\w-]*)|\.([\w-]+)|#([\w-]+)|\[([\w-]+)(?:(\^?=)"([^"]*)")?\]/g
  let m
  while ((m = re.exec(simple))) {
    if (m[1]) parts.tag = m[1].toUpperCase()
    else if (m[2]) parts.classes.push(m[2])
    else if (m[3]) parts.id = m[3]
    else if (m[4]) parts.attrs.push({ name: m[4], op: m[5], value: m[6] })
  }

  const match = (el) => {
    if (parts.tag && el.tagName !== parts.tag) return false
    if (parts.id && el.getAttribute('id') !== parts.id) return false
    for (const cls of parts.classes) if (!el.classList.contains(cls)) return false
    for (const attr of parts.attrs) {
      const actual = el.getAttribute(attr.name)
      if (actual === null) return false
      if (attr.op === '^=' && !String(actual).startsWith(attr.value)) return false
    }
    return true
  }

  selectorCache.set(simple, match)
  return match
}

class El extends DomNode {
  constructor(tag) {
    super()
    this.isRoot = false
    this.tagName = String(tag).toUpperCase()
    this.children = []
    this.attributes = {}
    this.parent = null
    this.listeners = {}
    this.nodeType = 1
    // Inputs, textareas and selects carry a value in the browser.
    this.value = ''
    this.focus = () => {}
    this.blur = () => {}
    if (this.tagName === 'CANVAS') {
      this.width = 0
      this.height = 0
      this.getContext = () => null
    }
    this.dataset = new Proxy({}, {
      get: (_, key) => this.getAttribute(`data-${camelToDash(key)}`),
      set: (_, key, value) => { this.setAttribute(`data-${camelToDash(key)}`, value); return true }
    })
    this.style = { setProperty(k, v) { this[k] = v } }
  }

  // Faithful to the browser: a node is connected when there is an unbroken
  // parent chain up to the document root. Appending to <body> connects it.
  get isConnected() {
    let node = this
    while (node.parent) node = node.parent
    return node.isRoot === true
  }

  set isConnected(_value) {
    /* derived from the parent chain, as in a browser */
  }

  get classList() { return new ClassList(this) }

  set className(v) { this.setAttribute('class', v) }
  get className() { return this.getAttribute('class') || '' }

  // `open` mirrors the real attribute-backed property, so tests that toggle it
  // behave the way a browser would.
  get open() { return this.hasAttribute('open') }
  set open(v) {
    if (v) this.setAttribute('open', '')
    else this.removeAttribute('open')
  }

  hasAttribute(k) {
    return Object.prototype.hasOwnProperty.call(this.attributes, k)
  }

  get innerHTML() { return this._html || '' }
  set innerHTML(v) {
    this._html = v
    this.children = []
  }

  appendChild(child) {
    if (child instanceof El || child instanceof TextNode) {
      this.children.push(child)
      child.parent = this
    }
    return child
  }

  remove() {
    if (!this.parent) return
    this.parent.children = this.parent.children.filter((c) => c !== this)
    this.parent = null
  }

  setAttribute(k, v) {
    this.attributes[k] = String(v)
    if (k === 'id') this.id = String(v)
  }
  getAttribute(k) {
    return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null
  }
  removeAttribute(k) { delete this.attributes[k] }

  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn) }
  removeEventListener(type, fn) {
    this.listeners[type] = (this.listeners[type] || []).filter((f) => f !== fn)
  }
  dispatch(type) {
    for (const fn of this.listeners[type] || []) fn({ currentTarget: this, target: this })
  }

  get textContent() {
    return this.children.map((c) => c.textContent ?? '').join('')
  }
  set textContent(v) {
    this.children = []
    if (v !== '') this.appendChild(new TextNode(v))
  }

  * walk() {
    yield this
    for (const child of this.children) {
      if (child instanceof El) yield* child.walk()
    }
  }

  // Descendant combinator support: ".testimonial-dots .dot" must match a .dot
  // that has a .testimonial-dots ancestor, not a single element matching both.
  querySelectorAll(selector) {
    const parts = selector.trim().split(/\s+/)
    const matches = parts.map(parseSimple)
    const found = []

    for (const el of this.walk()) {
      if (el === this) continue
      if (!matches[matches.length - 1](el)) continue

      // Walk up the ancestors requiring the earlier parts in order.
      let node = el.parent
      let idx = matches.length - 2
      while (node && idx >= 0) {
        if (matches[idx](node)) idx -= 1
        node = node.parent
      }
      if (idx < 0) found.push(el)
    }
    return new NodeList(found)
  }

  querySelector(selector) {
    return this.querySelectorAll(selector).item(0)
  }
}

// Browsers reflect href/src between property and attribute; mirror that so
// tests catch code that relies on it.
for (const attr of ['href', 'src']) {
  Object.defineProperty(El.prototype, attr, {
    get() { return this.getAttribute(attr) ?? '' },
    set(v) { this.setAttribute(attr, v) },
    configurable: true
  })
}

function camelToDash(str) {
  return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
}

export function installDomShim() {
  globalThis.Node = DomNode

  // Window-level stubs. contentStore registers a `storage` listener and the
  // live preview schedules repaints, so both need to exist.
  globalThis.addEventListener ??= () => {}
  globalThis.removeEventListener ??= () => {}
  globalThis.requestAnimationFrame ??= (cb) => setTimeout(() => cb(Date.now()), 0)
  globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id)
  globalThis.window ??= globalThis
  globalThis.confirm ??= () => true

  const body = new El('body')
  body.isRoot = true

  const documentShim = {
    createElement: (t) => new El(t),
    createTextNode: (t) => new TextNode(t),
    createDocumentFragment: () => new El('fragment'),
    getElementById: (id) => body.querySelector(`#${id}`),
    querySelector: (s) => body.querySelector(s),
    querySelectorAll: (s) => body.querySelectorAll(s),
    addEventListener() {},
    removeEventListener() {},
    documentElement: new El('html')
  }
  documentShim.body = body
  globalThis.document = documentShim

  const storage = new Map()
  const shim = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear()
  }
  globalThis.localStorage = shim
  globalThis.sessionStorage = shim

  return { storage, body, El, TextNode }
}

// Marks a node (and its descendants) as attached, mirroring what the browser
// does when a node is inserted into the document.
export function attach(node, parent) {
  parent.appendChild(node)
  return node
}