
export function Projects() {
  return (
    <section id="projects" class="section projects-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">Portfolio</span>
          <h2 class="section-title">Featured <span class="text-gradient">Projects</span></h2>
          <div class="section-divider"></div>
        </div>
        <div class="project-filters reveal">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="react">React</button>
          <button class="filter-btn" data-filter="vue">Vue</button>
          <button class="filter-btn" data-filter="ui-ux">UI/UX</button>
        </div>
        <div class="projects-grid" id="projectsGrid">
          <div class="project-card" data-category="react">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="#" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">Dashboard Pro</h3>
              <p class="project-desc">Analytics dashboard with real-time data visualization and interactive charts.</p>
              <div class="project-tags">
                <span>React</span><span>TypeScript</span><span>D3.js</span><span>Tailwind</span>
              </div>
            </div>
          </div>
          <div class="project-card" data-category="react">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#f093fb,#f5576c)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="#" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">E-Commerce Platform</h3>
              <p class="project-desc">Full-featured online store with cart, checkout, and payment integration.</p>
              <div class="project-tags">
                <span>Next.js</span><span>Stripe</span><span>Prisma</span><span>PostgreSQL</span>
              </div>
            </div>
          </div>
          <div class="project-card" data-category="vue">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#4facfe,#00f2fe)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="#" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">Task Manager</h3>
              <p class="project-desc">Collaborative project management tool with real-time updates and drag & drop.</p>
              <div class="project-tags">
                <span>Vue 3</span><span>Pinia</span><span>Firebase</span><span>SCSS</span>
              </div>
            </div>
          </div>
          <div class="project-card" data-category="ui-ux">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#a18cd1,#fbc2eb)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="#" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">Brand Redesign</h3>
              <p class="project-desc">Complete brand identity and website redesign for a tech startup.</p>
              <div class="project-tags">
                <span>Figma</span><span>Prototyping</span><span>Design System</span>
              </div>
            </div>
          </div>
          <div class="project-card" data-category="react">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#5ee7df,#b490ca)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="#" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">Social Media App</h3>
              <p class="project-desc">Social platform with feeds, stories, messaging, and content sharing.</p>
              <div class="project-tags">
                <span>React</span><span>GraphQL</span><span>Socket.io</span><span>MongoDB</span>
              </div>
            </div>
          </div>
          <div class="project-card" data-category="vue">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#fa709a,#fee140)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="#" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">Weather Dashboard</h3>
              <p class="project-desc">Weather forecasting app with beautiful animations and location tracking.</p>
              <div class="project-tags">
                <span>Vue 3</span><span>Chart.js</span><span>OpenWeather</span><span>API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
