export function initTestimonials() {
  const track = document.getElementById('testimonialTrack')
  const dots = Array.from(document.querySelectorAll('.dot'))
  if (!track || !dots.length) return () => {}

  let currentSlide = 0
  let interval = null

  function goToSlide(index) {
    const total = dots.length
    currentSlide = ((index % total) + total) % total
    track.style.transform = `translateX(-${currentSlide * 100}%)`
    dots.forEach((d) => d.classList.remove('active'))
    dots[currentSlide]?.classList.add('active')
  }

  function start() {
    clearInterval(interval)
    interval = setInterval(() => goToSlide(currentSlide + 1), 5000)
  }

  const handlers = dots.map((dot) => {
    const handler = () => {
      goToSlide(parseInt(dot.getAttribute('data-index'), 10) || 0)
      start()
    }
    dot.addEventListener('click', handler)
    return { dot, handler }
  })

  goToSlide(0)
  start()

  return () => {
    clearInterval(interval)
    handlers.forEach(({ dot, handler }) => dot.removeEventListener('click', handler))
  }
}