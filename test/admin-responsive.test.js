// Responsive checks specific to the admin dashboard, kept apart from the
// public-site assertions so a failure points at the right stylesheet.
import fs from 'node:fs'
import path from 'node:path'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

const admin = fs.readFileSync(
  path.resolve(import.meta.dirname, '..', 'admin.css'),
  'utf8'
)

const block = (sheet, header) => {
  const start = sheet.indexOf(header)
  if (start === -1) return ''
  let depth = 0
  const from = sheet.indexOf('{', start)
  for (let i = from; i < sheet.length; i++) {
    if (sheet[i] === '{') depth++
    else if (sheet[i] === '}') {
      depth--
      if (depth === 0) return sheet.slice(from, i + 1)
    }
  }
  return ''
}

const blocks = (sheet, header) => {
  let out = ''
  let from = 0
  for (;;) {
    const chunk = block(sheet.slice(from), header)
    if (!chunk) break
    out += chunk
    from += sheet.slice(from).indexOf(header) + header.length
  }
  return out
}

console.log('\n1. Breakpoint ladder')
const points = [...admin.matchAll(/@media \((?:max-width|pointer): ?([a-z]+|\d+px|coarse)/g)]
  .map((m) => m[1])
check('has a desktop-to-laptop breakpoint', /1400px/.test(admin))
check('has a laptop breakpoint', /1100px/.test(admin))
check('has a tablet breakpoint', /900px/.test(admin))
check('has a large-phone breakpoint', /640px/.test(admin))
check('has a small-phone breakpoint', /400px/.test(admin))
check('has a coarse-pointer block', /@media \(pointer: coarse\)/.test(admin))

console.log('\n2. Full-height chrome respects mobile browser chrome')
check('shell uses dvh', /\.adm-dash\s*{[^}]*min-height:\s*100dvh/.test(admin))
check('sidebar uses dvh', /\.adm-sidebar\s*{[^}]*height:\s*100dvh/.test(admin))
check('preview pane uses dvh', /\.adm-preview-slot\s*{[^}]*height:\s*100dvh/.test(admin))
check('preview column uses dvh', /\.adm-preview\s*{[^}]*height:\s*100dvh/.test(admin))
check('modal caps with dvh', /\.adm-modal\s*{[^}]*max-height:\s*92dvh/.test(admin))

console.log('\n3. Layout can shrink instead of forcing a scrollbar')
check('editor column uses minmax(0, 1fr)', /\.adm-dash\s*{[^}]*minmax\(0, 1fr\)/.test(admin))
check('content column can shrink', /\.adm-content\s*{[^}]*min-width: 0/.test(admin))
check('preview pane can shrink', /\.adm-preview-slot\s*{[^}]*min-width: 0/.test(admin))
check('grid children can shrink', /\.adm-field\s*{[^}]*min-width: 0/.test(admin))

console.log('\n4. Message dialog scrolls its body instead of overflowing')
const modal = block(admin, '.adm-modal {')
check('dialog is a flex column', /flex-direction:\s*column/.test(modal))
const modalBody = block(admin, '.adm-modal-body {')
check('body grows to fill', /flex:\s*1/.test(modalBody))
check('body may shrink below content', /min-height:\s*0/.test(modalBody))
check('body scrolls', /overflow-y:\s*auto/.test(modalBody))
check('momentum scrolling enabled', /-webkit-overflow-scrolling:\s*touch/.test(modalBody))

console.log('\n5. Touch targets are large enough for a thumb')
const coarse = blocks(admin, '@media (pointer: coarse)')
check('icon buttons grow past 28px', /\.adm-icon-btn\s*{[^}]*width:\s*(3[6-9]|[4-9]\d)px/.test(coarse))
check('tabs get extra padding', /\.adm-tab\s*{[^}]*padding:\s*1[12]px/.test(coarse))
check('buttons get extra padding', /\.adm-btn\s*{[^}]*padding:\s*1[23]px/.test(coarse))
check('press feedback added', /:active/.test(coarse))

console.log('\n6. Phone layout')
const phone = blocks(admin, '@media (max-width: 640px)')
check('topbar stacks', /flex-direction:\s*column/.test(phone))
check('topbar buttons go full width', /\.adm-topbar-actions \.adm-btn\s*{[^}]*flex:\s*1/.test(phone))
check('modal becomes a bottom sheet', /align-items:\s*flex-end/.test(phone))
check('modal drops its max width', /max-width:\s*none/.test(phone))
check('modal actions fill the width', /\.adm-modal-actions \.adm-btn\s*{[^}]*flex:\s*1/.test(phone))
check('message rows lose the chevron', /\.adm-msg-chevron\s*{[^}]*display:\s*none/.test(phone))
check('message action row is right aligned', /\.adm-msg-actions\s*{[^}]*justify-content:\s*flex-end/.test(phone))

const narrow = blocks(admin, '@media (max-width: 400px)')
check('tab padding tightens', /padding:\s*9px 11px/.test(narrow))
check('tab icons drop out', /\.adm-tab i\s*{[^}]*display:\s*none/.test(narrow))

console.log('\n7. Tablet layout')
const tablet = blocks(admin, '@media (max-width: 900px)')
check('sidebar unsticks', /\.adm-sidebar\s*{[^}]*position:\s*static/.test(tablet))
check('sidebar loses its fixed height', /height:\s*auto/.test(tablet))
check('tabs become a horizontal strip', /\.adm-tabs\s*{[^}]*flex-direction:\s*row/.test(tablet))
check('tab strip can scroll sideways', /overflow-x:\s*auto/.test(tablet))
check('tab strip hides its scrollbar', /::-webkit-scrollbar\s*{[^}]*display:\s*none/.test(tablet))
check('tabs do not shrink', /flex-shrink:\s*0/.test(tablet))
check('badge stops being pushed right', /\.adm-tab-badge\s*{[^}]*margin-left:\s*0/.test(tablet))
check('topbar stops sticking', /\.adm-topbar\s*{[^}]*position:\s*static/.test(tablet))
check('two-column grids collapse', /adm-grid-2[\s\S]*grid-template-columns:\s*1fr/.test(tablet))

console.log('\n8. Live preview scales rather than reflowing')
check('a scale stage is styled', /\.adm-preview-stage\s*{[^}]*transform-origin:\s*top left/.test(admin))
check('preview page has a border and shadow', /\.adm-preview-page\s*{[^}]*border:/.test(admin))
check('preview is not interactive', /pointer-events:\s*none/.test(admin))

console.log('\n9. Section dropdown')
check('menu is positioned for the popup', /\.adm-menu\s*{[^}]*position:\s*relative/.test(admin))
check('list is hidden until opened', /\.adm-menu-list\s*{[^}]*display:\s*none/.test(admin))
check('opening reveals the list', /\.adm-menu\.is-open \.adm-menu-list\s*{[^}]*display:\s*block/.test(admin))
check('list is anchored below the trigger', /\.adm-menu-list\s*{[^}]*top:\s*calc\(100% \+ 8px\)/.test(admin))
check('list has its own scroll for many sections', /\.adm-menu-list\s*{[^}]*overflow-y:\s*auto/.test(admin))
check('list caps its height', /\.adm-menu-list\s*{[^}]*max-height:/.test(admin))
check('list floats above the editor', /\.adm-menu-list\s*{[^}]*z-index:\s*\d+/.test(admin))
check('trigger has a visible focus ring', /\.adm-menu-trigger:focus-visible\s*{/.test(admin))
check('options have a focus ring', /\.adm-menu-item:focus-visible\s*{/.test(admin))
check('active option is highlighted', /\.adm-menu-item\.active\s*{[^}]*background:\s*var\(--gradient-1\)/.test(admin))
check('chevron rotates when open', /\.adm-menu\.is-open \.adm-menu-chevron\s*{[^}]*rotate/.test(admin))
check('long labels are truncated', /\.adm-menu-item-label\s*{[^}]*text-overflow:\s*ellipsis/.test(admin))

console.log('\n10. Small phones')
const tiny = blocks(admin, '@media (max-width: 360px)')
check('360: topbar and panel tighten', /\.adm-panel\s*{[^}]*padding:\s*12px/.test(tiny))
check('360: topbar stacks', /flex-direction:\s*column/.test(tiny))
check('360: trigger goes full width', /\.adm-menu-trigger\s*{[^}]*width:\s*100%/.test(tiny))
check('360: list matches trigger width', /\.adm-menu-list\s*{[^}]*width:\s*100%/.test(tiny))
check('360: subtitle hidden to save room', /\.adm-topbar-sub\s*{[^}]*display:\s*none/.test(tiny))
check('360: icon buttons stay thumb sized', /\.adm-icon-btn\s*{[^}]*width:\s*34px/.test(tiny))
check('360: modal caps lower', /\.adm-modal\s*{[^}]*max-height:\s*94dvh/.test(tiny))
check('phone: tab strip hidden in favour of the dropdown',
  /\.adm-tabs\s*{[^}]*display:\s*none/.test(blocks(admin, '@media (max-width: 640px)')))

console.log('\n11. Landscape phones')
const adminLandscape = blocks(admin, '@media (max-height: 480px) and (orientation: landscape)')
check('landscape: dashboard uses dvh', /\.adm-dash\s*{[^}]*min-height:\s*100dvh/.test(adminLandscape))
check('landscape: padding tightens', /\.adm-panel\s*{[^}]*padding:\s*16px 20px/.test(adminLandscape))
check('landscape: menu list caps height', /\.adm-menu-list\s*{[^}]*max-height:\s*70vh/.test(adminLandscape))

console.log(`\n${passed} passed, ${failed} failed\n`)
process.exit(failed ? 1 : 0)