
export function About() {
  return (
    <section id="about" class="section about-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">About Me</span>
          <h2 class="section-title">Turning Ideas Into <span class="text-gradient">Digital Reality</span></h2>
          <div class="section-divider"></div>
        </div>
        <div class="about-grid">
          <div class="about-content reveal">
            <p class="about-text">
              I'm a frontend developer based in Kigali with 2+ years of
              experience building modern web applications. I specialize in
              React, TypeScript, and the ever-evolving JavaScript ecosystem.
            </p>
            <p class="about-text">
              From startups to enterprise-level projects, I've had the
              privilege of working with diverse teams to create intuitive,
              high-performance interfaces that make a real impact. I believe
              great code is both functional and beautiful.
            </p>
            <p class="about-text">
              When I'm not coding, you'll find me exploring new design trends,
              contributing to open-source projects, or writing about frontend
              best practices.
            </p>
            <div class="about-stats">
              <div class="stat-item">
                <span class="stat-number" data-target="2">0</span>
                <span class="stat-plus">+</span>
                <span class="stat-label">Years Experience</span>
              </div>
              <div class="stat-item">
                <span class="stat-number" data-target="10">0</span>
                <span class="stat-plus">+</span>
                <span class="stat-label">Projects Done</span>
              </div>
              <div class="stat-item">
                <span class="stat-number" data-target="30">0</span>
                <span class="stat-plus">+</span>
                <span class="stat-label">Happy Clients</span>
              </div>
              <div class="stat-item">
                <span class="stat-number" data-target="2">0</span>
                <span class="stat-plus">+</span>
                <span class="stat-label">Awards Won</span>
              </div>
            </div>
            <div class="about-info-grid">
              <div class="info-item"><span class="info-label">Name:</span><span class="info-value">Bruce Lucky</span></div>
              <div class="info-item"><span class="info-label">Email:</span><span class="info-value">brucelucky012@gmail.com</span></div>
              <div class="info-item"><span class="info-label">Location:</span><span class="info-value">KIGALI, RWA</span></div>
              <div class="info-item"><span class="info-label">Freelance:</span><span class="info-value available">Available</span></div>
            </div>
            <a href="#" class="btn btn-primary"><i class="fas fa-download"></i> Download CV</a>
          </div>
          <div class="about-visual reveal">
            <div class="about-image-wrapper">
              <div class="about-image-placeholder"></div>
              <div class="about-exp-badge">
                <span class="exp-number">2+</span>
                <span class="exp-text">Years of<br/>Experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
