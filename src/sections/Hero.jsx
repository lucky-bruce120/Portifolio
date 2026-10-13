import { getState } from '../store/contentStore.js'

const BUTTON_CLASS = {
  primary: 'btn btn-primary',
  outline: 'btn btn-outline'
}

export function Hero() {
  const { hero, site } = getState()

  return (
    <section id="hero" class="section hero-section">
      <div class="container hero-container">
        <div class="hero-content">
          {hero.badge && (
            <div class="hero-badge">
              <span class="badge-dot"></span>
              {hero.badge}
            </div>
          )}
          <h1 class="hero-greeting">{hero.greeting}</h1>
          <h2 class="hero-name">{hero.name}</h2>
          <div class="hero-typing-wrapper">
            <span class="hero-typing" id="typingText"></span>
            <span class="typing-cursor">|</span>
          </div>
          <p class="hero-description">{hero.description}</p>
          <div class="hero-actions">
            {hero.buttons.map((btn) => (
              <a href={btn.href} class={BUTTON_CLASS[btn.variant] || BUTTON_CLASS.primary}>
                {btn.icon && <i class={btn.icon}></i>}
                {btn.label}
              </a>
            ))}
          </div>
          <div class="hero-socials">
            {hero.socials.map((soc) => (
              <a
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={soc.label}
                title={soc.label}
              >
                <i class={soc.icon}></i>
              </a>
            ))}
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-avatar">
            <div class="avatar-placeholder">{site.avatarText}</div>
            <div class="avatar-ring"></div>
          </div>
          <div class="floating-techs">
            {hero.techs.map((tech, i) => (
              <span class="tech-card" style={{ '--i': String(i) }}>{tech.label}</span>
            ))}
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