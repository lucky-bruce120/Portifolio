// Static analysis of the stylesheets and HTML shell. A real device test needs a
// browser, but most responsive regressions are catchable from the source: a
// missing breakpoint, a hard-coded width that overflows a 320px screen, a
// viewport meta that blocks zoom, or a missing touch/motion query.
import fs from 'node:fs'
import path from 'node:path'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const css = read('style.css')
const admin = read('admin.css')
const html = read('index.html')

// Extracts the body of a rule or @media block by brace matching, so assertions
// can target a specific breakpoint instead of the first textual match.
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

// A stylesheet may split one breakpoint across several blocks, so concatenate
// every block sharing the same header.
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

// ---------------------------------------------------------------------------

console.log('\n1. Document shell allows responsive layout and zoom')
const viewport = html.match(/<meta name="viewport" content="([^"]+)"/)
check('viewport meta present', !!viewport)
check('uses device-width', viewport && /width=device-width/.test(viewport[1]), viewport?.[1])
check('allows pinch zoom', viewport && !/user-scalable\s*=\s*no/.test(viewport[1]))
check('no maximum-scale lock', viewport && !/maximum-scale/.test(viewport[1]))
check('app mounts into #root', /<div id="root">/.test(html))

// ---------------------------------------------------------------------------

console.log('\n2. Stylesheets are structurally sound')
for (const [name, sheet] of [['style.css', css], ['admin.css', admin]]) {
  const open = (sheet.match(/{/g) || []).length
  const close = (sheet.match(/}/g) || []).length
  check(`${name} braces balanced`, open === close, `${open} open / ${close} close`)
}

// ---------------------------------------------------------------------------

console.log('\n3. Breakpoints cover small to large screens')
const breakpoints = [...css.matchAll(/@media \(max-width: (\d+)px\)/g)].map((m) => Number(m[1]))
check('has a 1024px tablet breakpoint', breakpoints.includes(1024))
check('has a 768px phone breakpoint', breakpoints.includes(768))
check('has a 480px small-phone breakpoint', breakpoints.includes(480))
check('has a 360px narrow-phone breakpoint', breakpoints.includes(360))
check(
  // Desktop-first cascade: later rules win, so the widest breakpoint must come
  // first in the source.
  'breakpoints descend so later rules win',
  breakpoints.every((bp, i) => i === 0 || bp <= breakpoints[i - 1]),
  breakpoints.join(', ')
)

const adminBreakpoints = [...admin.matchAll(/@media \(max-width: (\d+)px\)/g)].map((m) => Number(m[1]))
check('admin has a 1400px breakpoint', adminBreakpoints.includes(1400))
check('admin has a 1100px breakpoint', adminBreakpoints.includes(1100))
check('admin has a 900px breakpoint', adminBreakpoints.includes(900))
check('admin has a 640px phone breakpoint', adminBreakpoints.includes(640))
check('admin has a 400px narrow breakpoint', adminBreakpoints.includes(400))

// ---------------------------------------------------------------------------

console.log('\n4. Orientation, input and motion are handled')
check('landscape phones handled', /@media \(max-height: \d+px\) and \(orientation: landscape\)/.test(css))
check('coarse pointer targets handled', /@media \(pointer: coarse\)/.test(css))
check('reduced motion respected', /@media \(prefers-reduced-motion: reduce\)/.test(css))
check('text inflation disabled for iOS', /-webkit-text-size-adjust: 100%/.test(css))
check('horizontal overflow contained', /overflow-x: hidden/.test(css))
check('media never exceeds the screen', /img,\s*\n?\s*video,\s*\n?\s*canvas,\s*\n?\s*svg\s*{/.test(css))

// ---------------------------------------------------------------------------

console.log('\n5. Large type scales fluidly instead of snapping')
// These are the elements that previously jumped between fixed sizes and
// overflowed narrow screens.
for (const sel of ['.hero-name', '.section-title', '.footer-cta-title', '.hero-typing-wrapper']) {
  const rule = css.match(new RegExp(`\\${sel}\\s*{[^}]*}`))
  check(`${sel} uses clamp()`, rule && /font-size:\s*clamp\(/.test(rule[0]))
}

for (const sel of ['.hero-avatar', '.about-image-placeholder']) {
  const rule = css.match(new RegExp(`\\${sel}\\s*{[^}]*}`))
  check(`${sel} is fluid`, rule && (/clamp\(/.test(rule[0]) || /width:\s*100%/.test(rule[0])))
}

check('.section padding is fluid', /\.section\s*{[^}]*padding:\s*clamp\(/.test(css))
check('.container padding is fluid', /\.container\s*{[^}]*padding:\s*0 clamp\(/.test(css))
check('.nav-container padding is fluid', /\.nav-container\s*{[^}]*padding:\s*0 clamp\(/.test(css))
check('.avatar-placeholder is proportional', /\.avatar-placeholder\s*{[^}]*width:\s*87\.5%/.test(css))
check('.avatar initials scale with the circle', /\.avatar-placeholder\s*{[^}]*font-size:\s*clamp\(/.test(css))
check('.about image uses aspect-ratio', /\.about-image-placeholder\s*{[^}]*aspect-ratio/.test(css))

// ---------------------------------------------------------------------------

console.log('\n6. Full-height elements account for mobile browser chrome')
check('hero uses dvh', /\.hero-section\s*{[^}]*min-height:\s*100dvh/.test(css))
check('nav drawer uses dvh', /\.nav-links\s*{[^}]*height:\s*100dvh/.test(css))
check('admin shell uses dvh', /\.adm-dash\s*{[^}]*min-height:\s*100dvh/.test(admin))
check('admin modal uses dvh', /\.adm-modal\s*{[^}]*max-height:\s*92dvh/.test(admin))
// Every 100vh must be shadowed by a 100dvh override, or mobile browsers will
// mis-size the element behind their address bar.
const vhBlocks = [...css.matchAll(/([^{}]+){([^}]*)\bheight:\s*100vh\b([^}]*)}/g)]
const unshadowed = vhBlocks.filter((m) => !/100dvh/.test(m[0]))
check('every 100vh in style.css has a dvh override', unshadowed.length === 0, `${unshadowed.length} unshadowed`)

console.log('\n7. Drawer and grid never exceed the viewport')
const phoneBlock = blocks(css, '@media (max-width: 768px)')
check('nav drawer width is capped inside the phone block', /min\(\s*300px,\s*86vw\s*\)/.test(phoneBlock))
check('editor column can shrink', /\.adm-dash\s*{[^}]*minmax\(0, 1fr\)/.test(admin))

// ---------------------------------------------------------------------------

console.log('\n8. Content that can overflow is wrapped')
check('footer contact links wrap anywhere', /\.footer-contact-list li a,\s*\n?\.footer-contact-static\s*{[^}]*overflow-wrap/.test(css) || /overflow-wrap: anywhere/.test(css))
check('message emails wrap in admin', /\.adm-msg-from\s*{[^}]*word-break: break-all/.test(admin) || /\.adm-msg-email\s*{[^}]*text-overflow: ellipsis/.test(admin))

// ---------------------------------------------------------------------------

console.log('\n9. Small-screen overrides that were previously missing')
const phone = blocks(css, '@media (max-width: 768px)')
check('768: about stats go two-up', /about-stats/.test(phone))
check('768: skills collapse to one column', /skills-grid[\s\S]*grid-template-columns: 1fr/.test(phone))
check('768: projects collapse to one column', /projects-grid[\s\S]*grid-template-columns: 1fr/.test(phone))
check('768: footer collapses to one column', /footer-grid[\s\S]*grid-template-columns: 1fr/.test(phone))
check('768: drawer scrolls if it overflows', /overflow-y: auto/.test(phone))

const small = blocks(css, '@media (max-width: 480px)')
check('480: hero buttons stack full width', /hero-actions[\s\S]*width: 100%/.test(small))
check('480: tech badges shrink', /tech-cloud-item/.test(small))
check('480: filter buttons shrink', /filter-btn/.test(small))

const narrow = blocks(css, '@media (max-width: 360px)')
check('360: stats go single column', /about-stats[\s\S]*grid-template-columns: 1fr/.test(narrow))
check('360: social tap targets stay large', /width: 42px/.test(narrow))

const landscape = block(css, '@media (max-height: 520px) and (orientation: landscape)')
check('landscape: hero stops forcing a full screen', /min-height: auto/.test(landscape))
check('landscape: avatar shrinks to viewport height', /22vh/.test(landscape))

const adminPhone = block(admin, '@media (max-width: 640px)')
check('640: dialog fills the phone width', /max-width: none/.test(adminPhone))
check('640: dialog sits at the bottom', /align-items: flex-end/.test(adminPhone))
check('640: dialog icon buttons are touch sized', /width: 40px/.test(adminPhone))

// ---------------------------------------------------------------------------

console.log('\n10. Projects stay usable on touch')
const coarse = blocks(css, '@media (pointer: coarse)')
check('project links visible without hover', /\.project-overlay\s*{[^}]*opacity:\s*1/.test(coarse))
check('project links themselves stay visible', /\.project-link\s*{[^}]*opacity:\s*1/.test(coarse))
check('hover lift disabled on touch', /\.project-card:hover\s*{[^}]*transform:\s*none/.test(coarse))
check('tap feedback added', /\.project-card:active/.test(coarse))
check('long blurbs clamped on small screens', /project-desc[\s\S]*-webkit-line-clamp/.test(phone))
check('thumb height is fluid on phones', /project-thumb\s*{[^}]*clamp\(/.test(phone))

console.log('\n11. Testimonials read well on a phone')
check('quote glyph added', /\.testimonial-card::before\s*{[^}]*content: '\\201C'/.test(css))
check('quote glyph is decorative only', /\.testimonial-card::before\s*{[^}]*pointer-events: none/.test(css))
check('quote glyph uses a CSS escape', /content: '\\201C'/.test(css))
check('testimonial text is fluid', /\.testimonial-text\s*{[^}]*font-size:\s*clamp\(/.test(css))
check('testimonial padding reduced on phones', /testimonial-card\s*{[^}]*padding: 32px 20px/.test(phone))
check('author avatar shrinks on phones', /testimonial-avatar\s*{[^}]*width: 46px/.test(phone))

console.log('\n12. Contact badges become tap-friendly rows on a phone')
check('badge switches to a grid row layout', /\.contact-card\s*{[^}]*display: grid/.test(phone))
check('badge is left aligned', /\.contact-card\s*{[^}]*text-align: left/.test(phone))
check('icon spans both label rows', /grid-row: 1 \/ span 2/.test(phone))
check('label is de-emphasised', /contact-card h4\s*{[^}]*text-transform: uppercase/.test(phone))
check('value is emphasised', /contact-card p\s*{[^}]*font-weight: 500/.test(phone))
check('tappable rows get a chevron', /a\.contact-card::after/.test(phone))
check('badge press feedback', /a\.contact-card:active/.test(phone))

console.log('\n13. 320px tier exists')
const tiniest = blocks(css, '@media (max-width: 340px)')
check('340: section title steps down again', /section-title\s*{[^}]*font-size:\s*1\.5rem/.test(tiniest))
check('340: buttons tighten', /\.btn\s*{[^}]*padding:\s*12px 16px/.test(tiniest))
check('340: contact badges reflow', /contact-card\s*{[^}]*grid-template-columns:\s*40px/.test(tiniest))
check('340: back-to-top stays 40px', /\.back-to-top\s*{[^}]*width:\s*40px/.test(tiniest))
check('340: filter buttons shrink', /filter-btn\s*{[^}]*padding:\s*8px 13px/.test(tiniest))

console.log('\n14. Slider supports touch gestures')
const sliderJs = read('js/testimonials.js')
check('handles pointerdown', /pointerdown/.test(sliderJs))
check('tracks the drag distance', /deltaX/.test(sliderJs))
check('follows the finger while dragging', /onPointerMove/.test(sliderJs))
check('settles on the nearest slide', /SWIPE_THRESHOLD/.test(sliderJs))
check('pauses auto-advance while reading', /pointerenter/.test(sliderJs))
check('supports keyboard navigation', /ArrowRight/.test(sliderJs) && /ArrowLeft/.test(sliderJs))
check('removes its listeners on cleanup', (sliderJs.match(/removeEventListener/g) || []).length >= 6)

console.log(`\n${passed} passed, ${failed} failed\n`)
process.exit(failed ? 1 : 0)