const SOCIALS = [
  { icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/lucky-bruce120' },
  { icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucky-bruce-1303782a7/?isSelfProfile=true' },
  { icon: 'fab fa-x-twitter', label: 'X (Twitter)', href: 'https://x.com/Cha_pter120' },
  { icon: 'fab fa-dribbble', label: 'Dribbble', href: 'https://dribbble.com/lucky-bruce' },
  { icon: 'fab fa-codepen', label: 'CodePen', href: 'https://codepen.io/Lucky-Bruce' }
]

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' }
]

const SERVICES = [
  'Web Development',
  'UI/UX Design',
  'Frontend Consulting',
  'Code Review'
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <>
      <footer class="footer">
        <div class="container">
          <div class="footer-cta reveal">
            <div class="footer-cta-text">
              <span class="footer-cta-badge">
                <span class="badge-dot"></span>
                Available for new projects
              </span>
              <h2 class="footer-cta-title">
                Let&rsquo;s build something <span class="text-gradient">amazing</span>
              </h2>
              <p>
                Have an idea, a redesign, or a frontend role in mind? I&rsquo;m just a
                message away.
              </p>
            </div>
            <div class="footer-cta-actions">
              <a href="#contact" class="btn btn-primary">Hire Me</a>
              <a href="#contact" class="btn btn-outline">
                <i class="fas fa-paper-plane"></i> Email Me 
              </a>
              
            </div>
          </div>

          <div class="footer-grid">
            <div class="footer-brand">
              <a href="#hero" class="nav-logo">BL<span class="text-gradient">.</span></a>
              <p>
                Frontend developer based in Kigali, Rwanda &mdash; crafting
                pixel-perfect, accessible and performant web experiences with
                modern frontend technologies.
              </p>
              <div class="footer-socials">
                {SOCIALS.map(({ icon, label, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    <i class={icon}></i>
                  </a>
                ))}
              </div>
            </div>

            <div class="footer-col">
              <h4>Explore</h4>
              <ul>
                {NAV_LINKS.map(({ label, href }) => (
                  <li><a href={href}>{label}</a></li>
                ))}
              </ul>
            </div>

            <div class="footer-col">
              <h4>Services</h4>
              <ul>
                {SERVICES.map((service) => (
                  <li><a href="#contact">{service}</a></li>
                ))}
              </ul>
            </div>

            <div class="footer-col footer-contact">
              <h4>Get in Touch</h4>
              <ul class="footer-contact-list">
                <li>
                  <a href="mailto:brucelucky012@gmail.com">
                    <i class="fas fa-envelope"></i>
                    <span>brucelucky012@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+250795482652">
                    <i class="fas fa-phone"></i>
                    <span>(+250) 795 482 652</span>
                  </a>
                </li>
                <li>
                  <span class="footer-contact-static">
                    <i class="fas fa-location-dot"></i>
                    <span>Kigali, Rwanda</span>
                  </span>
                </li>
                <li>
                  <a
                    href="https://github.com/lucky-bruce120"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="fab fa-github"></i>
                    <span>@lucky-bruce120</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; {year} Bruce Lucky. All rights reserved.</p>
            <p class="footer-credit">
              Designed &amp; Built with <i class="fas fa-heart"></i> using React
            </p>
          </div>
        </div>
      </footer>
      <button class="back-to-top" id="backToTop" aria-label="Back to top">
        <i class="fas fa-arrow-up"></i>
      </button>
    </>
  )
}