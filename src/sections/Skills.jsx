import { getState } from '../store/contentStore.js'

export function Skills() {
  const { skills } = getState()

  return (
    <section id="skills" class="section skills-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">{skills.label}</span>
          <h2 class="section-title">
            {skills.title} <span class="text-gradient">{skills.titleAccent}</span>
          </h2>
          <div class="section-divider"></div>
        </div>
        <div class="skills-grid">
          {skills.categories.map((cat) => (
            <div class="skill-category reveal">
              <h3 class="skill-category-title">
                <i class={cat.icon}></i> {cat.title}
              </h3>
              <div class="skill-bars">
                {cat.items.map((item) => (
                  <div class="skill-bar-item">
                    <div class="skill-bar-header">
                      <span>{item.name}</span>
                      <span class="skill-percent">{item.percent}%</span>
                    </div>
                    <div class="skill-bar-track">
                      <div class="skill-bar-fill" data-width={String(item.percent)}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div class="tech-cloud reveal">
          <h3 class="tech-cloud-title">Tech Stack</h3>
          <div class="tech-cloud-items">
            {skills.tech.map((tech) => (
              <span class="tech-cloud-item" style={{ '--c': tech.color }}>
                <i class={tech.icon}></i> {tech.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}