export function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = parseInt(entry.target.getAttribute('data-target'), 10) || 0
        animateCounter(entry.target, target)
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.5 }
  )

  document.querySelectorAll('.stat-number').forEach((el) => observer.observe(el))
  return () => observer.disconnect()
}

function animateCounter(element, target) {
  let current = 0
  const increment = Math.max(1, Math.ceil(target / 60))
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = current
  }, 30)
}