
export function Footer() {
  return (
    <>
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="#hero" class="nav-logo">BL<span class="text-gradient">.</span></a>
              <p>Crafting digital experiences with modern frontend technologies.</p>
              <div class="footer-socials">
                <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter"><i class="fab fa-x-twitter"></i></a>
                <a href="https://dribbble.com" target="_blank" rel="noopener" aria-label="Dribbble"><i class="fab fa-dribbble"></i></a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#hero">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Web Development</a></li>
                <li><a href="#">UI/UX Design</a></li>
                <li><a href="#">Consulting</a></li>
                <li><a href="#">Code Review</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Projects</a></li>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">Newsletter</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2026 Bruce Lucky. All rights reserved.</p>
            <p>Designed & Built with <i class="fas fa-heart" style={{ color: 'var(--accent)' }}></i></p>
          </div>
        </div>
      </footer>
      <button class="back-to-top" id="backToTop" aria-label="Back to top">
        <i class="fas fa-arrow-up"></i>
      </button>
    </>
  )
}
