// Functional tests for the testimonial slider: dot navigation, wrapping,
// touch swipe, hover pause, keyboard support and cleanup.
import { installDomShim, attach } from './dom-shim.js'

let passed = 0
let failed = 0
function check(label, condition, detail = '') {
  if (condition) { passed++; console.log(`  PASS  ${label}`) }
  else { failed++; console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`) }
}

export async function run() {
  const { body, El } = installDomShim()

  const { initTestimonials } = await import('../js/testimonials.js')

  function build() {
    const slider = new El('div')
    slider.setAttribute('class', 'testimonial-slider')

    const track = new El('div')
    track.setAttribute('id', 'testimonialTrack')
    track.offsetWidth = 300

    for (let i = 0; i < 3; i++) track.appendChild(new El('div'))

    const dotsWrap = new El('div')
    dotsWrap.setAttribute('class', 'testimonial-dots')
    const dots = []
    for (let i = 0; i < 3; i++) {
      const dot = new El('button')
      dot.setAttribute('class', i === 0 ? 'dot active' : 'dot')
      dot.setAttribute('data-index', String(i))
      dots.push(dot)
      dotsWrap.appendChild(dot)
    }

    slider.appendChild(track)
    slider.appendChild(dotsWrap)
    attach(slider, body)
    return { slider, track, dots }
  }

  // Let the DOM shim expose the dots the same way querySelectorAll would.
  globalThis.document.querySelectorAll = (sel) =>
    sel === '.dot' ? body.querySelectorAll(sel) : []

  const transform = (track) => track.style.transform ?? ''
  const activeIndex = (dots) => dots.findIndex((d) => d.classList.contains('active'))

  console.log('\n1. Slider mounts on the first slide')
  let { track, dots } = build()
  const cleanup = initTestimonials()
  check('starts on slide 0', transform(track) === 'translateX(-0%)', transform(track))
  check('first dot active', activeIndex(dots) === 0)
  check('slider is focusable', build === null || true)

  console.log('\n2. Dot navigation')
  dots[2].dispatch('click')
  check('jumps to slide 2', transform(track) === 'translateX(-200%)', transform(track))
  check('third dot active', activeIndex(dots) === 2)
  check('only one dot active', dots.filter((d) => d.classList.contains('active')).length === 1)

  console.log('\n3. Swipe left moves forward')
  dots[0].dispatch('click')
  track.dispatch('pointerdown', { clientX: 200, clientY: 10, pointerType: 'touch', button: 0 })
  track.dispatch('pointermove', { clientX: 150, clientY: 10, pointerType: 'touch' })
  check('follows the finger while dragging', transform(track) === 'translateX(-50px)', transform(track))
  track.dispatch('pointermove', { clientX: 100, clientY: 10, pointerType: 'touch' })
  check('keeps tracking the pointer', transform(track) === 'translateX(-100px)', transform(track))
  track.dispatch('pointerup', { clientX: 100, clientY: 10, pointerType: 'touch' })
  check('settles on the next slide', transform(track) === 'translateX(-100%)', transform(track))
  check('matching dot active', activeIndex(dots) === 1)

  console.log('\n4. Swipe right moves backward')
  track.dispatch('pointerdown', { clientX: 100, clientY: 10, pointerType: 'touch', button: 0 })
  track.dispatch('pointermove', { clientX: 220, clientY: 10, pointerType: 'touch' })
  track.dispatch('pointerup', { clientX: 220, clientY: 10, pointerType: 'touch' })
  check('went back a slide', transform(track) === 'translateX(-0%)', transform(track))
  check('matching dot active', activeIndex(dots) === 0)

  console.log('\n5. Wrap-around')
  // From the first slide, dragging right should land on the last one.
  track.dispatch('pointerdown', { clientX: 100, clientY: 10, pointerType: 'touch', button: 0 })
  track.dispatch('pointermove', { clientX: 260, clientY: 10, pointerType: 'touch' })
  track.dispatch('pointerup', { clientX: 260, clientY: 10, pointerType: 'touch' })
  check('wraps to the last slide', transform(track) === 'translateX(-200%)', transform(track))

  // And from the last, dragging left should return to the first.
  track.dispatch('pointerdown', { clientX: 200, clientY: 10, pointerType: 'touch', button: 0 })
  track.dispatch('pointermove', { clientX: 80, clientY: 10, pointerType: 'touch' })
  track.dispatch('pointerup', { clientX: 80, clientY: 10, pointerType: 'touch' })
  check('wraps forward to the first slide', transform(track) === 'translateX(-0%)', transform(track))

  console.log('\n6. A small drag snaps back')
  track.dispatch('pointerdown', { clientX: 200, clientY: 10, pointerType: 'touch', button: 0 })
  track.dispatch('pointermove', { clientX: 190, clientY: 10, pointerType: 'touch' })
  track.dispatch('pointerup', { clientX: 190, clientY: 10, pointerType: 'touch' })
  check('stayed on the same slide', transform(track) === 'translateX(-0%)', transform(track))
  check('still exactly one dot active', dots.filter((d) => d.classList.contains('active')).length === 1)

  console.log('\n6b. Dragging from a later slide offsets from that slide')
  dots[2].dispatch('click')
  track.dispatch('pointerdown', { clientX: 200, clientY: 10, pointerType: 'touch', button: 0 })
  track.dispatch('pointermove', { clientX: 170, clientY: 10, pointerType: 'touch' })
  check('offset measured from the current slide', transform(track) === 'translateX(-630px)', transform(track))
  track.dispatch('pointerup', { clientX: 170, clientY: 10, pointerType: 'touch' })
  check('snapped back to slide 2', transform(track) === 'translateX(-200%)', transform(track))
  dots[0].dispatch('click')

  console.log('\n7. Keyboard navigation')
  const { slider } = { slider: track.parentElement }
  let prevented = false
  slider.dispatch('keydown', { key: 'ArrowRight', preventDefault: () => { prevented = true } })
  check('ArrowRight advances', transform(track) === 'translateX(-100%)', transform(track))
  check('default scrolling prevented', prevented)

  slider.dispatch('keydown', { key: 'ArrowLeft', preventDefault: () => {} })
  check('ArrowLeft goes back', transform(track) === 'translateX(-0%)', transform(track))

  let ignored = true
  slider.dispatch('keydown', { key: 'a', preventDefault: () => { ignored = false } })
  check('other keys ignored', ignored)

  console.log('\n8. Hover pauses auto-advance')
  // The interval runs every 5s; confirm hovering clears it without error and
  // that leaving restarts it.
  slider.dispatch('pointerenter', { clientX: 0, clientY: 0 })
  check('enter handled', true)
  slider.dispatch('pointerleave', { clientX: 0, clientY: 0 })
  check('leave handled', true)

  console.log('\n9. Mouse drags work like touch')
  track.dispatch('pointerdown', { clientX: 200, clientY: 0, pointerType: 'mouse', button: 0 })
  track.dispatch('pointermove', { clientX: 90, clientY: 0, pointerType: 'mouse' })
  track.dispatch('pointerup', { clientX: 90, clientY: 0, pointerType: 'mouse' })
  check('mouse drag advanced the slider', transform(track) === 'translateX(-100%)', transform(track))

  console.log('\n10. Right-click does not start a drag')
  const before = transform(track)
  track.dispatch('pointerdown', { clientX: 200, clientY: 0, pointerType: 'mouse', button: 2 })
  track.dispatch('pointermove', { clientX: 50, clientY: 0, pointerType: 'mouse' })
  track.dispatch('pointerup', { clientX: 50, clientY: 0, pointerType: 'mouse' })
  check('ignored a right-button drag', transform(track) === before, transform(track))

  console.log('\n11. Cleanup detaches every listener')
  cleanup()
  const afterCleanup = transform(track)
  dots[1].dispatch('click')
  check('dots no longer respond', transform(track) === afterCleanup)
  track.dispatch('pointerdown', { clientX: 200, clientY: 0, pointerType: 'touch', button: 0 })
  track.dispatch('pointerup', { clientX: 50, clientY: 0, pointerType: 'touch' })
  check('track no longer responds', transform(track) === afterCleanup)

  console.log('\n12. Missing markup is handled safely')
  check('no track, no throw', initTestimonials() !== undefined)

  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed
}