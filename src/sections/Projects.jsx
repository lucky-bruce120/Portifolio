
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
        </div>
        <div class="projects-grid" id="projectsGrid">
          <div class="project-card" data-category="react">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="https://github.com/lucky-bruce120/SkillMatch" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">SkillMatch</h3>
              <p class="project-desc">SkillMatch is a modern web-based application designed to solve the problem of skill mismatch in the job market by intelligently connecting job seekers with relevant job opportunities based on their skills.</p>
              <div class="project-tags">
                <span>HTML</span><span>TypeScript</span><span>Javascript</span><span>Tailwind</span>
              </div>
            </div>
          </div>
          <div class="project-card" data-category="react">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#f093fb,#f5576c)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="https://github.com/lucky-bruce120/todo-App" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">todo-App</h3>
              <p class="project-desc">A simple Todo application for managing daily tasks with add, edit, complete, and delete functionality.</p>
              <div class="project-tags">
                <span>HTML</span><span>CSS</span><span>Javascript</span><span>React.js</span><span>Node.js+Express</span><span>MongoDB</span>
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
          <div class="project-card" data-category="vue">
            <div class="project-thumb" style={{ '--thumb': 'linear-gradient(135deg,#fa709a,#fee140)' }}>
              <div class="project-overlay">
                <div class="project-links">
                  <a href="https://github.com/lucky-bruce120/finance-tracker" class="project-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">finance-tracker</h3>
              <p class="project-desc">Personal Finance Tracker with AI Budgeting is a comprehensive tool designed to help users manage their finances efficiently.</p>
              <div class="project-tags">
                <span>React</span><span>Nodejs</span><span>Express</span><span>MongoDB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
