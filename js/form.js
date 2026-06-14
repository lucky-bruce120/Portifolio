const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('.btn-submit');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.classList.remove('loading');
    submitBtn.classList.add('success');

    setTimeout(() => {
      submitBtn.classList.remove('success');
      submitBtn.disabled = false;
      contactForm.reset();
    }, 3000);
  }, 2000);
});
