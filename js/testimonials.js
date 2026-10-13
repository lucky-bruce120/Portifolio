export function initTestimonials() {
  const track = document.getElementById('testimonialTrack')
  const dots = Array.from(document.querySelectorAll('.dot'))
  if (!track || !dots.length) return () => {}

  let currentSlide = 0
  let interval = null
  let startX = 0
  let deltaX = 0
  let dragging = false

  function goToSlide(index, animate = true) {
    const total = dots.length
    currentSlide = ((index % total) + total) % total
    track.style.transition = animate ? 'transform 0.5s ease' : 'none'
    track.style.transform = `translateX(-${currentSlide * 100}%)`
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide))
  }

  function start() {
    clearInterval(interval)
    interval = setInterval(() => goToSlide(currentSlide + 1), 5000)
  }

  function resetAndAdvance(index = currentSlide) {
    goToSlide(index)
    start()
  }

  // --- Swipe -------------------------------------------------------------
  // Auto-advance alone is awkward on a phone, where a horizontal drag is the
  // natural gesture. Follow the finger, then settle on the nearest slide.
  const SWIPE_THRESHOLD = 40

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragging = true
    startX = e.clientX
    deltaX = 0
    clearInterval(interval)
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    deltaX = e.clientX - startX
    // Pixels rather than a calc() percentage: simpler and avoids emitting
    // expressions like calc(-0% + -16%) that browsers can reject.
    const offset = -currentSlide * (track.offsetWidth || 1) + deltaX
    track.style.transition = 'none'
    track.style.transform = `translateX(${offset}px)`
  }

  const endDrag = () => {
    if (!dragging) return
    dragging = false

    const width = track.offsetWidth || 1
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      // Dragging left moves forward, dragging right moves back.
      goToSlide(currentSlide + (deltaX < 0 ? 1 : -1))
    } else {
      goToSlide(currentSlide)
    }
    start()
  }

  // --- Dots and hover ----------------------------------------------------
  const handlers = dots.map((dot) => {
    const handler = () => {
      const index = parseInt(dot.getAttribute('data-index'), 10)
      resetAndAdvance(Number.isNaN(index) ? 0 : index)
    }
    dot.addEventListener('click', handler)
    return { dot, handler }
  })

  // Pause while the pointer is over the slider so it does not slide away
  // mid-read.
  const slider = track.parentElement
  const onEnter = () => clearInterval(interval)
  const onLeave = () => start()
  slider?.addEventListener('pointerenter', onEnter)
  slider?.addEventListener('pointerleave', onLeave)

  track.addEventListener('pointerdown', onPointerDown)
  track.addEventListener('pointermove', onPointerMove)
  track.addEventListener('pointerup', endDrag)
  track.addEventListener('pointercancel', endDrag)
  track.addEventListener('pointerleave', endDrag)

  // Keyboard support for the arrow keys.
  const onKeydown = (e) => {
    if (e.key === 'ArrowRight') resetAndAdvance(currentSlide + 1)
    else if (e.key === 'ArrowLeft') resetAndAdvance(currentSlide - 1)
    else return
    e.preventDefault()
  }
  slider?.addEventListener('keydown', onKeydown)
  slider?.setAttribute('tabindex', '0')
  slider?.setAttribute('role', 'region')
  slider?.setAttribute('aria-label', 'Testimonials')

  goToSlide(0, false)
  start()

  return () => {
    clearInterval(interval)
    handlers.forEach(({ dot, handler }) => dot.removeEventListener('click', handler))
    slider?.removeEventListener('pointerenter', onEnter)
    slider?.removeEventListener('pointerleave', onLeave)
    slider?.removeEventListener('keydown', onKeydown)
    track.removeEventListener('pointerdown', onPointerDown)
    track.removeEventListener('pointermove', onPointerMove)
    track.removeEventListener('pointerup', endDrag)
    track.removeEventListener('pointercancel', endDrag)
    track.removeEventListener('pointerleave', endDrag)
  }
}