const cursorDot = document.querySelector('[data-cursor].cursor-dot');
const cursorOutline = document.querySelector('[data-cursor].cursor-outline');

if (window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    cursorOutline.style.left = `${e.clientX}px`;
    cursorOutline.style.top = `${e.clientY}px`;
  });

  document.addEventListener('mousedown', () => {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(0.75)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.25)';
  });

  document.addEventListener('mouseup', () => {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  document.querySelectorAll('a, button, .filter-btn, .dot, .project-card, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.classList.add('hover');
      cursorOutline.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('hover');
      cursorOutline.classList.remove('hover');
    });
  });
} else {
  cursorDot.style.display = 'none';
  cursorOutline.style.display = 'none';
}
