import { getState } from '../store/contentStore.js'

export function About() {
  const { about } = getState()

  return (
    <section id="about" class="section about-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">{about.label}</span>
          <h2 class="section-title">
            {about.title} <span class="text-gradient">{about.titleAccent}</span>
          </h2>
          <div class="section-divider"></div>
        </div>
        <div class="about-grid">
          <div class="about-content reveal">
            {about.paragraphs.map((text) => (
              <p class="about-text">{text}</p>
            ))}
            <div class="about-stats">
              {about.stats.map((stat) => (
                <div class="stat-item">
                  <span class="stat-number" data-target={String(stat.value)}>0</span>
                  <span class="stat-plus">+</span>
                  <span class="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            <div class="about-info-grid">
              {about.info.map((item) => (
                <div class="info-item">
                  <span class="info-label">{item.label}:</span>
                  <span class={`info-value${item.highlight ? ' available' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>
            {about.cv.href && (
              <a href={about.cv.href} class="btn btn-primary">
                <i class="fas fa-download"></i> {about.cv.label}
              </a>
            )}
          </div>
          <div class="about-visual reveal">
            <div class="about-image-wrapper">
              <div class="about-image-placeholder"></div>
              <div class="about-exp-badge">
                <span class="exp-number">{about.expBadge.number}</span>
                <span class="exp-text">{about.expBadge.text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}