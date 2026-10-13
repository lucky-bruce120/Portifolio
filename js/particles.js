export function initParticles() {
  const canvas = document.getElementById('particle-canvas')
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return () => {}

  let particles = []
  let particleCount = 0
  let frame = 0
  const mouse = { x: null, y: null }

  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  function createParticles(count) {
    particles = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1
      })
    }
  }

  const onMouseMove = (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
  }

  const onResize = () => {
    resizeCanvas()
    createParticles(particleCount)
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1

      ctx.fillStyle = isDark
        ? `rgba(255, 255, 255, ${p.opacity})`
        : `rgba(99, 102, 241, ${p.opacity * 0.4})`

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 120) {
          const lineOpacity = isDark ? (1 - dist / 120) * 0.15 : (1 - dist / 120) * 0.1
          ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${lineOpacity})`
            : `rgba(99, 102, 241, ${lineOpacity})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }

      if (mouse.x !== null) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        if (Math.sqrt(dx * dx + dy * dy) < 200) {
          p.x += dx * 0.002
          p.y += dy * 0.002
        }
      }
    }

    frame = requestAnimationFrame(draw)
  }

  function start() {
    if (window.innerWidth < 768) particleCount = 40
    else if (window.innerWidth < 1024) particleCount = 60
    else particleCount = 90

    resizeCanvas()
    createParticles(particleCount)
    frame = requestAnimationFrame(draw)
  }

  document.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)
  start()

  return () => {
    cancelAnimationFrame(frame)
    document.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('resize', onResize)
  }
}