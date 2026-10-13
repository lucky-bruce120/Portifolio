import { getState } from '../store/contentStore.js'

export function Experience() {
  const { experience } = getState()

  return (
    <section id="experience" class="section experience-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">{experience.label}</span>
          <h2 class="section-title">
            {experience.title} <span class="text-gradient">{experience.titleAccent}</span>
          </h2>
          <div class="section-divider"></div>
        </div>
        <div class="timeline">
          {experience.items.map((item) => (
            <div class="timeline-item reveal">
              <div class="timeline-dot"></div>
              <div class="timeline-date">{item.date}</div>
              <div class="timeline-content">
                <h3 class="timeline-role">{item.role}</h3>
                {item.company && <h4 class="timeline-company">{item.company}</h4>}
                <p class="timeline-desc">{item.description}</p>
                <div class="timeline-tags">
                  {item.tags.map((tag) => <span>{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}