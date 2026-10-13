export function jsx(type, props, ...children) {
  if (typeof type === 'function') {
    return type(props)
  }

  if (type === 'fragment' || type === '') {
    const fragment = document.createDocumentFragment()
    const allChildren = children.length ? children.flat() : props?.children
    if (allChildren != null) {
      const arr = Array.isArray(allChildren) ? allChildren : [allChildren]
      for (const child of arr) {
        appendChild(fragment, child)
      }
    }
    return fragment
  }

  const el = document.createElement(type)

  // `ref` is handled separately so it works with both callback refs and
  // ref objects ({ current }). The runtime applies refs after the element has
  // its attributes and children, which is what the admin dashboard relies on.
  const ref = props?.ref

  for (const [attr, val] of Object.entries(props || {})) {
    if (attr === 'key' || attr === 'ref') continue
    if (attr === 'children') continue

    if (attr === 'className') {
      el.className = val
    } else if (attr === 'htmlFor') {
      el.htmlFor = val
    } else if (attr.startsWith('on') && typeof val === 'function') {
      el.addEventListener(attr.slice(2).toLowerCase(), val)
    } else if (attr === 'style' && typeof val === 'object') {
      for (const [prop, value] of Object.entries(val)) {
        el.style.setProperty(prop, value)
      }
    } else if (attr === 'dangerouslySetInnerHTML') {
      el.innerHTML = val.__html
    } else if (val === true) {
      el.setAttribute(attr, '')
    } else if (val !== false && val != null) {
      el.setAttribute(attr, String(val))
    }
  }

  const allChildren = children.length ? children.flat() : props?.children
  if (allChildren != null) {
    const arr = Array.isArray(allChildren) ? allChildren : [allChildren]
    for (const child of arr) {
      appendChild(el, child)
    }
  }

  applyRef(ref, el)

  return el
}

function applyRef(ref, el) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(el)
  } else if (typeof ref === 'object') {
    ref.current = el
  }
}

function appendChild(parent, child) {
  if (child == null || child === false || child === true) return
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)))
  } else if (child instanceof Node) {
    parent.appendChild(child)
  } else if (Array.isArray(child)) {
    for (const c of child) {
      appendChild(parent, c)
    }
  }
}

export function jsxs(type, props, ...children) {
  return jsx(type, props, ...children)
}

export const Fragment = 'fragment'

export function jsxDEV(type, props, key, isStatic, source, self) {
  return jsx(type, props)
}
