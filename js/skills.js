export function initSkills() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const width = entry.target.getAttribute('data-width')
        entry.target.style.width = `${width}%`
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.5 }
  )

  document.querySelectorAll('.skill-bar-fill').forEach((el) => observer.observe(el))
  return () => observer.disconnect()
}