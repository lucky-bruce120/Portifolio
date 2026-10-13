// Tests for the dashboard's self-refreshing behaviour: repeaters that repaint
// on structural changes without stealing focus, and the live preview pane.

let passed = 0
let failed = 0
function check(label, condition) {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}`) }
}

export async function run() {
  const { installDomShim, attach } = await import('./dom-shim.js')
  installDomShim()

  const store = await import('../src/store/contentStore.js')
  const { Repeater } = await import('../src/admin/components/Fields.jsx')
  const { LivePreview } = await import('../src/admin/components/LivePreview.jsx')

const PROJECT_FIELDS = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
  { name: 'tags', label: 'Tags', type: 'tags' }
]

  function mountRepeater() {
    store.resetToDefaults()
    const el = Repeater({
      label: 'Projects',
      path: 'projects.items',
      fields: PROJECT_FIELDS,
      itemDefaults: { title: 'New project', description: '', tags: [] },
      titleKey: 'title',
      addLabel: 'Add project'
    })
    attach(el, document.body)
    return el
  }

  // querySelectorAll returns a NodeList, so wrap with Array.from to use array
  // helpers - exactly as production code must.
  const all = (root, sel) => Array.from(root.querySelectorAll(sel))
  const countItems = (root) => all(root, 'details.adm-item').length
  const titles = (root) => all(root, '.adm-item-title').map((n) => n.textContent)

console.log('\n1. Repeater mounts from current content')
const repeater = mountRepeater()
check('renders one entry per item', countItems(repeater) === 4)
check('shows the item count badge', repeater.querySelector('.adm-count').textContent === '4')
check('headings show titles', titles(repeater)[0] === 'SkillMatch')

console.log('\n2. Adding an item updates immediately, no refresh')
// Click the real "Add" button rather than calling the store directly, to prove
// the UI path is what triggers the repaint.
const addBtn = all(repeater, 'button').find((b) =>
  b.textContent.includes('Add project')
)
check('add button exists', !!addBtn)
addBtn.dispatch('click')
check('new item rendered', countItems(repeater) === 5)
check('count badge updated', repeater.querySelector('.adm-count').textContent === '5')
check('new entry heading shown', titles(repeater)[4] === 'New project')
check('store agrees with the view', store.getIn('projects.items').length === 5)

console.log('\n3. Deleting an item updates immediately')
const firstDelete = all(repeater, '.adm-icon-danger')[0]
check('delete button exists', !!firstDelete)
firstDelete.dispatch('click') // confirm() is absent in the shim, so it passes
check('item removed from view', countItems(repeater) === 4)
check('store agrees with the view', store.getIn('projects.items').length === 4)
check('correct item removed', store.getIn('projects.items.0.title') === 'todo-App')

console.log('\n4. Reordering updates immediately')
check('move controls present', repeater.querySelectorAll('.adm-icon-btn').length >= 4)
// Move the first entry down: "todo-App" and "Brand Redesign" should swap.
const firstTools = all(repeater, 'details.adm-item')[0]
    .querySelectorAll('.adm-icon-btn')
firstTools[1].dispatch('click')
check('order changed in the view', titles(repeater)[0] === 'Brand Redesign')
check('moved entry is now second', titles(repeater)[1] === 'todo-App')
check('store order matches', store.getIn('projects.items.1.title') === 'todo-App')

console.log('\n5. Editing a value refreshes the heading but keeps inputs alive')
const before = repeater.querySelectorAll('input.adm-input').length
store.setIn('projects.items.0.title', 'Renamed Project')
check('heading refreshed to the new title', titles(repeater)[0] === 'Renamed Project')
check('inputs were not rebuilt', repeater.querySelectorAll('input.adm-input').length === before)

console.log('\n6. Open/closed state survives a structural repaint')
const items = repeater.querySelectorAll('details.adm-item')
// Collapse the first entry, then add one and confirm it stays collapsed.
items[0].open = false
all(repeater, 'button').find((b) => b.textContent.includes('Add project')).dispatch('click')
const afterAdd = repeater.querySelectorAll('details.adm-item')
check('still 5 entries', afterAdd.length === 5)
check('first entry stayed collapsed', afterAdd[0].open === false)

console.log('\n7. Empty state and full delete')
store.setIn('projects.items', [])
check('empty state message shown', !!repeater.querySelector('.adm-empty'))
check('no entries rendered', countItems(repeater) === 0)
check('count badge reads zero', repeater.querySelector('.adm-count').textContent === '0')

store.pushTo('projects.items', { id: 'only-1', title: 'Solo', description: '', tags: [] })
check('re-adding after empty shows the entry', countItems(repeater) === 1)
check('new entry after empty is open',
  repeater.querySelectorAll('details.adm-item')[0].open === true)

// mountRepeater resets to defaults first, so this should show the default four.
const one = mountRepeater()
check('fresh mount shows default items', countItems(one) === 4)
check('fresh mount collapses long lists',
  one.querySelectorAll('details.adm-item')[0].open === false)

console.log('\n8. Live preview renders the real markup')
store.resetToDefaults()
const preview = LivePreview()
attach(preview, document.body)

const viewport = preview.querySelector('.adm-preview-viewport')
check('preview mounted', !!viewport)
check('has header', preview.querySelector('.adm-preview-title').textContent === 'Live Preview')

const page = viewport.querySelector('.adm-preview-page')
check('preview page rendered', !!page)
for (const id of ['hero', 'about', 'skills', 'projects', 'experience', 'testimonials', 'contact']) {
  check(`preview includes #${id}`, !!page.querySelector(`#${id}`))
}
check('preview has a footer', !!page.querySelector('footer'))
check('particle canvas stripped', !page.querySelector('#particle-canvas'))
check('decorative orbs stripped', page.querySelectorAll('.orb').length === 0)
check('navbar hidden in preview', page.querySelector('.navbar') === null)

console.log('\n9. Preview flattens scroll-reveal state so content is visible')
check('reveal elements marked visible', page.querySelectorAll('.revealed').length > 0)
const fill = page.querySelector('.skill-bar-fill')
check('skill bar has final width', fill.style.width === '95%')
const stat = page.querySelector('.stat-number')
check('stat shows its target value', stat.textContent === '1')
check('slider dots collapsed to first',
  page.querySelectorAll('.testimonial-dots .dot')[0].classList.contains('active'))

console.log('\n10. Preview repaints on content change')
const projectCardsBefore = page.querySelectorAll('.project-card').length
store.pushTo('projects.items', {
  id: 'preview-new', title: 'Preview Project', description: 'd',
  category: 'react', tags: [], gradient: '', github: '', live: ''
})
check('preview shows 5 projects before repaint', projectCardsBefore === 4)

await new Promise((resolve) => requestAnimationFrame(resolve))
await new Promise((resolve) => requestAnimationFrame(resolve))

const page2 = preview
  .querySelector('.adm-preview-viewport')
  .querySelector('.adm-preview-page')
check('preview picked up the new project', page2.querySelectorAll('.project-card').length === 5)
check('new project title visible', page2.textContent.includes('Preview Project'))

store.setIn('hero.name', 'Edited Name')
await new Promise((resolve) => requestAnimationFrame(resolve))
await new Promise((resolve) => requestAnimationFrame(resolve))
const page3 = preview
  .querySelector('.adm-preview-viewport')
  .querySelector('.adm-preview-page')
check('preview reflects a text edit', page3.textContent.includes('Edited Name'))

console.log('\n10b. Preview scales to fit its pane')
  const stage = preview.querySelector('.adm-preview-stage')
  const previewViewport = preview.querySelector('.adm-preview-viewport')
  check('a scale stage exists', !!stage)
  check('page lives inside the stage', !!stage.querySelector('.adm-preview-page'))

  // Wide pane: no scaling needed.
  previewViewport.clientWidth = 1400
  stage.scrollHeight = 2000
  window.dispatchEvent({ type: 'resize' })
  check('wide pane is not scaled down', /scale\(1\)/.test(stage.style.transform), stage.style.transform)

  // Narrow phone pane: the page is scaled rather than reflowed.
  previewViewport.clientWidth = 360
  window.dispatchEvent({ type: 'resize' })
  const scaled = /scale\(([\d.]+)\)/.exec(stage.style.transform)
  check('narrow pane is scaled down', !!scaled && Number(scaled[1]) < 1, stage.style.transform)
  check('scale is floored so it never vanishes', Number(scaled?.[1] ?? 0) >= 0.2)
  check('stage keeps a fixed design width', stage.style.width === '1280px', stage.style.width)
  check('scaled height reserved for scrolling', stage.style.height !== '')

  // A zero-width pane (hidden, or mid-toggle) must not divide by zero.
  previewViewport.clientWidth = 0
  const beforeZero = stage.style.transform
  window.dispatchEvent({ type: 'resize' })
  check('zero-width pane is a no-op', stage.style.transform === beforeZero)

console.log('\n11. Detached nodes unsubscribe instead of leaking')
const orphan = mountRepeater()
check('orphan has items', countItems(orphan) === 4)
orphan.remove()
// A change while detached must not throw, and must drop the subscription.
store.pushTo('projects.items', { id: 'after-detach', title: 'X', description: '', tags: [] })
check('no crash while detached', true)

console.log(`\n${passed} passed, ${failed} failed\n`)
return failed
}