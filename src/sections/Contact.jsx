
export function Contact() {
  return (
    <section id="contact" class="section contact-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">Contact</span>
          <h2 class="section-title">Let's Work <span class="text-gradient">Together</span></h2>
          <div class="section-divider"></div>
        </div>
        <div class="contact-grid">
          <div class="contact-form-wrapper reveal">
            <form class="contact-form" id="contactForm">
              <div class="form-group">
                <input type="text" id="formName" placeholder="Your Name" required />
              </div>
              <div class="form-group">
                <input type="email" id="formEmail" placeholder="Your Email" required />
              </div>
              <div class="form-group">
                <input type="text" id="formSubject" placeholder="Subject" required />
              </div>
              <div class="form-group">
                <textarea id="formMessage" rows="5" placeholder="Your Message" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-submit">
                <span class="btn-text">Send Message</span>
                <span class="btn-loading"><i class="fas fa-spinner fa-spin"></i> Sending...</span>
                <span class="btn-success"><i class="fas fa-check"></i> Sent Successfully!</span>
              </button>
            </form>
          </div>
          <div class="contact-info reveal">
            <div class="contact-card">
              <div class="contact-card-icon"><i class="fas fa-envelope"></i></div>
              <h4>Email</h4>
              <p>brucelucky012@gmail.com</p>
            </div>
            <div class="contact-card">
              <div class="contact-card-icon"><i class="fas fa-phone"></i></div>
              <h4>Phone</h4>
              <p>(+250) 7**-***</p>
            </div>
            <div class="contact-card">
              <div class="contact-card-icon"><i class="fas fa-location-dot"></i></div>
              <h4>Location</h4>
              <p>Kigali, RWA</p>
            </div>
            <div class="contact-socials">
              <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
              <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter"><i class="fab fa-x-twitter"></i></a>
              <a href="https://dribbble.com" target="_blank" rel="noopener" aria-label="Dribbble"><i class="fab fa-dribbble"></i></a>
              <a href="https://codepen.io" target="_blank" rel="noopener" aria-label="CodePen"><i class="fab fa-codepen"></i></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
