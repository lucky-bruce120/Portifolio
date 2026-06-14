const track = document.getElementById('testimonialTrack');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let slideInterval;

function goToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach(d => d.classList.remove('active'));
  dots[index].classList.add('active');
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.getAttribute('data-index')));
    resetSlideInterval();
  });
});

function startSlideInterval() {
  slideInterval = setInterval(() => {
    goToSlide((currentSlide + 1) % dots.length);
  }, 5000);
}

function resetSlideInterval() {
  clearInterval(slideInterval);
  startSlideInterval();
}

startSlideInterval();
