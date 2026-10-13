import { getState } from '../store/contentStore.js'

export function Projects() {
  const { projects } = getState()

  // Build the filter list from the categories actually in use, so adding or
  // editing a project in the dashboard keeps the filters in sync.
  const categories = []
  for (const project of projects.items) {
    if (project.category && !categories.includes(project.category)) {
      categories.push(project.category)
    }
  }

  return (
    <section id="projects" class="section projects-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">{projects.label}</span>
          <h2 class="section-title">
            {projects.title} <span class="text-gradient">{projects.titleAccent}</span>
          </h2>
          <div class="section-divider"></div>
        </div>
        {categories.length > 0 && (
          <div class="project-filters reveal">
            <button class="filter-btn active" data-filter="all">All</button>
            {categories.map((cat) => (
              <button class="filter-btn" data-filter={cat}>{cat}</button>
            ))}
          </div>
        )}
        <div class="projects-grid" id="projectsGrid">
          {projects.items.map((project) => (
            <div class="project-card" data-category={project.category}>
              <div class="project-thumb" style={{ '--thumb': project.gradient }}>
                <div class="project-overlay">
                  <div class="project-links">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" class="project-link" aria-label="Source code">
                        <i class="fab fa-github"></i>
                      </a>
                    )}
                    {project.live && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" class="project-link" aria-label="Live demo">
                        <i class="fas fa-external-link-alt"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div class="project-info">
                <h3 class="project-title">{project.title}</h3>
                <p class="project-desc">{project.description}</p>
                <div class="project-tags">
                  {project.tags.map((tag) => <span>{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}