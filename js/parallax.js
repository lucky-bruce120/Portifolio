export function initParallax() {
  const orbs = document.querySelectorAll('.orb')
  if (!orbs.length) return () => {}

  const onMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30
    const y = (e.clientY / window.innerHeight - 0.5) * 30
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 0.5
      orb.style.setProperty('--parallax-x', `${x * factor}px`)
      orb.style.setProperty('--parallax-y', `${y * factor}px`)
    })
  }

  document.addEventListener('mousemove', onMouseMove)
  return () => document.removeEventListener('mousemove', onMouseMove)
}