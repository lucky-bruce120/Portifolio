
export function Hero() {
  return (
    <section id="hero" class="section hero-section">
      <div class="container hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            Available for work
          </div>
          <h1 class="hero-greeting">Hi, I'm</h1>
          <h2 class="hero-name">Bruce Lucky</h2>
          <div class="hero-typing-wrapper">
            <span class="hero-typing" id="typingText"></span>
            <span class="typing-cursor">|</span>
          </div>
          <p class="hero-description">
            Crafting pixel-perfect, performant web experiences with modern
            frontend technologies. Passionate about UI engineering, accessible
            design, and building products that users love.
          </p>
          <div class="hero-actions">
            <a href="#projects" class="btn btn-primary">View My Work</a>
            <a href="#contact" class="btn btn-outline">Get In Touch</a>
          </div>
          <div class="hero-socials">
            <a href="https://github.com/lucky-bruce120" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="https://www.linkedin.com/in/lucky-bruce-1303782a7/?isSelfProfile=true" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter"><i class="fab fa-x-twitter"></i></a>
            <a href="https://dribbble.com" target="_blank" rel="noopener" aria-label="Dribbble"><i class="fab fa-dribbble"></i></a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-avatar">
            <div class="avatar-placeholder"></div>
            <div class="avatar-ring"></div>
          </div>
          <div class="floating-techs">
            <span class="tech-card" style={{ '--i': '0' }}>React</span>
            <span class="tech-card" style={{ '--i': '1' }}>TypeScript</span>
            <span class="tech-card" style={{ '--i': '3' }}>Node.js</span>
            <span class="tech-card" style={{ '--i': '4' }}>Tailwind</span>
            <span class="tech-card" style={{ '--i': '5' }}>Next.js</span>
          </div>
        </div>
      </div>
      <div class="scroll-indicator">
        <span>Scroll</span>
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
      </div>
    </section>
  )
}
