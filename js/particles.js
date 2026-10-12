const canvas = document.getElementById('particle-canvas');
const ctx = canvas?.getContext('2d');
let particles = [];
let particleCount;

// Guard the particle effect: if the canvas is ever missing from the DOM, skip
// rather than throw, since a throw here would take down every later import.
const enabled = Boolean(canvas && ctx);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
}

let mouseParticle = { x: null, y: null };
document.addEventListener('mousemove', (e) => {
  mouseParticle.x = e.clientX;
  mouseParticle.y = e.clientY;
});

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark
      ? `rgba(255, 255, 255, ${p.opacity})`
      : `rgba(99, 102, 241, ${p.opacity * 0.4})`;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        const lineOpacity = isDark
          ? (1 - dist / 120) * 0.15
          : (1 - dist / 120) * 0.1;
        ctx.strokeStyle = isDark
          ? `rgba(255, 255, 255, ${lineOpacity})`
          : `rgba(99, 102, 241, ${lineOpacity})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    if (mouseParticle.x !== null) {
      const dx = mouseParticle.x - p.x;
      const dy = mouseParticle.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        p.x += dx * 0.002;
        p.y += dy * 0.002;
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

function initParticles() {
  if (!enabled) return;
  if (window.innerWidth < 768) {
    particleCount = 40;
  } else if (window.innerWidth < 1024) {
    particleCount = 60;
  } else {
    particleCount = 90;
  }
  resizeCanvas();
  createParticles(particleCount);
  drawParticles();
}

window.addEventListener('resize', () => {
  if (!enabled) return;
  resizeCanvas();
  createParticles(particleCount);
});

initParticles();
