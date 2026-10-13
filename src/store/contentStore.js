// Content store: a tiny observable state container backed by localStorage.
// The portfolio renders from `getState()`, the admin dashboard writes to it
// via `update()`, and subscribers re-render on change.

import { createDefaultContent } from '../data/defaultContent.js'

const STORAGE_KEY = 'portfolio:content:v1'

let state = load()
const listeners = new Set()

function load() {
  const base = createDefaultContent()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw)
    return migrate(mergeDefaults(parsed, base))
  } catch (err) {
    console.warn('[contentStore] could not read saved content, using defaults', err)
    return base
  }
}

// Deep-merges saved content over the defaults so a schema addition in a future
// release still shows up for users who already have saved content.
function mergeDefaults(saved, defaults) {
  if (Array.isArray(defaults)) {
    return Array.isArray(saved) ? saved : defaults
  }
  if (defaults === null || typeof defaults !== 'object') {
    return saved === undefined ? defaults : saved
  }
  if (saved === null || typeof saved !== 'object') return defaults

  const out = { ...saved }
  for (const key of Object.keys(defaults)) {
    out[key] = key in saved ? mergeDefaults(saved[key], defaults[key]) : defaults[key]
  }
  return out
}

// Upgrades content saved by an older schema. Lists that used to be plain arrays
// of strings (hero roles, floating tech badges) are now repeater items, so they
// need objects with an id and a label before the dashboard can edit them.
function migrate(content) {
  const out = { ...content }

  const lift = (list, prefix, labelKey) =>
    (Array.isArray(list) ? list : []).map((entry, i) => {
      // Already an object: keep it, just guarantee an id.
      if (entry && typeof entry === 'object') {
        return { id: entry.id || `${prefix}-${i}`, ...entry }
      }
      // Legacy string: promote it to a repeater item.
      return { id: `${prefix}-${i}`, [labelKey]: String(entry) }
    })

  if (out.hero) {
    out.hero = {
      ...out.hero,
      roles: lift(out.hero.roles, 'role', 'text'),
      techs: lift(out.hero.techs, 'herotech', 'label')
    }
  }

  // Paragraphs were repeaters from the start but shipped without ids.
  if (out.about && Array.isArray(out.about.paragraphs)) {
    out.about = {
      ...out.about,
      paragraphs: out.about.paragraphs.map((p, i) => ({
        id: `para-${i}`,
        ...(p && typeof p === 'object' ? p : { text: String(p) })
      }))
    }
  }

  return out
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('[contentStore] could not save content', err)
  }
}

function emit() {
  for (const listener of listeners) listener(state)
}

export function getState() {
  return state
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Applies an updater to the current state and notifies subscribers.
 * The updater receives the state and must return the next state.
 */
export function update(updater) {
  const next = updater(state)
  if (next === state) return state
  state = next
  persist()
  emit()
  return state
}

// ---------------------------------------------------------------------------
// Path helpers - the admin dashboard addresses fields by string path so generic
// form controls don't need to know the shape of the content tree.
// e.g. set('hero.name', 'Bruce Lucky') / getIn('footer.columns')
// ---------------------------------------------------------------------------

export function getIn(path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), state)
}

export function setIn(path, value) {
  update((current) => {
    const next = structuredClone(current)
    const keys = path.split('.')
    const last = keys.pop()
    let cursor = next
    for (const key of keys) {
      if (cursor[key] == null || typeof cursor[key] !== 'object') cursor[key] = {}
      cursor = cursor[key]
    }
    cursor[last] = value
    return next
  })
}

export function pushTo(path, item) {
  update((current) => {
    const next = structuredClone(current)
    const list = getInFrom(next, path)
    if (Array.isArray(list)) list.push(item)
    return next
  })
}

export function removeAt(path, index) {
  update((current) => {
    const next = structuredClone(current)
    const list = getInFrom(next, path)
    if (Array.isArray(list)) list.splice(index, 1)
    return next
  })
}

export function moveIn(path, from, to) {
  update((current) => {
    const next = structuredClone(current)
    const list = getInFrom(next, path)
    if (!Array.isArray(list)) return next
    if (from < 0 || from >= list.length) return next
    const clamped = Math.max(0, Math.min(to, list.length - 1))
    const [moved] = list.splice(from, 1)
    list.splice(clamped, 0, moved)
    return next
  })
}

function getInFrom(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

// ---------------------------------------------------------------------------
// Import / export / reset
// ---------------------------------------------------------------------------

export function exportJson() {
  return JSON.stringify(state, null, 2)
}

export function importJson(text) {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Content must be a JSON object.')
  }
  update(() => migrate(mergeDefaults(parsed, createDefaultContent())))
}

export function resetToDefaults() {
  update(() => createDefaultContent())
}

export function isDirty() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

// Stable-ish id generator for newly created list items.
let idCounter = 0
export function makeId(prefix = 'item') {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}${idCounter}`
}

/**
 * Re-reads content written by another tab. The `storage` event only fires in
 * other tabs, so this keeps an open portfolio window in sync with edits made
 * in the dashboard without anyone hitting refresh.
 */
export function syncFromStorage() {
  state = load()
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) syncFromStorage()
  })
}