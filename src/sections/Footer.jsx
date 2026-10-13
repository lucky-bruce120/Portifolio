import { getState } from '../store/contentStore.js'

const BUTTON_CLASS = {
  primary: 'btn btn-primary',
  outline: 'btn btn-outline'
}

export function Footer() {
  const { footer, site } = getState()
  const year = new Date().getFullYear()
  const linkColumns = footer.columns.filter((col) => col.type === 'links')
  const contactColumns = footer.columns.filter((col) => col.type === 'contact')

  return (
    <>
      <footer class="footer">
        <div class="container">
          {footer.cta.title && (
            <div class="footer-cta reveal">
              <div class="footer-cta-text">
                <span class="footer-cta-badge">
                  <span class="badge-dot"></span>
                  {footer.cta.badge}
                </span>
                <h2 class="footer-cta-title">
                  {footer.cta.title} <span class="text-gradient">{footer.cta.titleAccent}</span>
                </h2>
                <p>{footer.cta.text}</p>
              </div>
              <div class="footer-cta-actions">
                {footer.cta.buttons.map((btn) => (
                  <a href={btn.href} class={BUTTON_CLASS[btn.variant] || BUTTON_CLASS.primary}>
                    {btn.icon && <i class={btn.icon}></i>}
                    {btn.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div class="footer-grid">
            <div class="footer-brand">
              <a href="#hero" class="nav-logo">
                {site.initials}
                <span class="text-gradient">.</span>
              </a>
              <p>{footer.brandText}</p>
            </div>

            {linkColumns.map((col) => (
              <div class="footer-col">
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li><a href={link.href}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}

            {contactColumns.map((col) => (
              <div class="footer-col footer-contact">
                <h4>{col.title}</h4>
                <ul class="footer-contact-list">
                  {col.links.map((link) => {
                    const body = (
                      <>
                        <i class={link.icon}></i>
                        <span>{link.label}</span>
                      </>
                    )
                    return link.href ? (
                      <li>
                        <a href={link.href} target={link.href.startsWith('http') ? '_blank' : null} rel="noopener noreferrer">
                          {body}
                        </a>
                      </li>
                    ) : (
                      <li>
                        <span class="footer-contact-static">{body}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div class="footer-bottom">
            <p>&copy; {year} {site.name}. All rights reserved.</p>
            <p class="footer-credit">
              {footer.credit} <i class="fas fa-heart"></i>
            </p>
          </div>
        </div>
      </footer>
      <button class="back-to-top" id="backToTop" aria-label="Back to top">
        <i class="fas fa-arrow-up"></i>
      </button>
    </>
  )
}