import { getState } from '../store/contentStore.js'

export function Contact() {
  const { contact } = getState()

  return (
    <section id="contact" class="section contact-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">{contact.label}</span>
          <h2 class="section-title">
            {contact.title} <span class="text-gradient">{contact.titleAccent}</span>
          </h2>
          <div class="section-divider"></div>
        </div>
        <div class="contact-grid">
          <div class="contact-form-wrapper reveal">
            <form class="contact-form" id="contactForm">
              <div class="form-group">
                <input type="text" id="formName" placeholder="Your Real Name" required />
              </div>
              <div class="form-group">
                <input type="email" id="formEmail" placeholder="Your Real Email" required />
              </div>
              <div class="form-group">
                <input type="text" id="formSubject" placeholder="Subject" required />
              </div>
              <div class="form-group">
                <textarea id="formMessage" rows="5" placeholder="Your Message" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-submit">
                <span class="btn-text">{contact.submitLabel}</span>
                <span class="btn-loading"><i class="fas fa-spinner fa-spin"></i> Sending...</span>
                <span class="btn-success"><i class="fas fa-check"></i> Sent Successfully!</span>
              </button>
            </form>
          </div>
          <div class="contact-info reveal">
            {contact.intro && <p class="contact-intro">{contact.intro}</p>}
            {contact.details.map((detail) => {
              const inner = (
                <>
                  <div class="contact-card-icon"><i class={detail.icon}></i></div>
                  <h4>{detail.label}</h4>
                  <p>{detail.value}</p>
                </>
              )

              return detail.href ? (
                <a class="contact-card" href={detail.href}>
                  {inner}
                </a>
              ) : (
                <div class="contact-card">{inner}</div>
              )
            })}
            <div class="contact-socials">
              {contact.socials.map((soc) => (
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
        </div>
      </div>
    </section>
  )
}