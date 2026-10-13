import { getState } from '../store/contentStore.js'

export function Testimonials() {
  const { testimonials } = getState()
  const items = testimonials.items

  return (
    <section id="testimonials" class="section testimonials-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">{testimonials.label}</span>
          <h2 class="section-title">
            {testimonials.title} <span class="text-gradient">{testimonials.titleAccent}</span>
          </h2>
          <div class="section-divider"></div>
        </div>
        {items.length > 0 && (
          <div class="testimonial-slider reveal">
            <div class="testimonial-track" id="testimonialTrack">
              {items.map((item) => (
                <div class="testimonial-card">
                  <div class="testimonial-stars">
                    {Array.from({ length: item.rating }, () => (
                      <i class="fas fa-star"></i>
                    ))}
                  </div>
                  <p class="testimonial-text">{item.quote}</p>
                  <div class="testimonial-author">
                    <div class="testimonial-avatar" style={{ background: item.gradient }}>
                      {item.initials}
                    </div>
                    <div class="testimonial-author-info">
                      <h4>{item.name}</h4>
                      <span>{item.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div class="testimonial-dots" id="testimonialDots">
              {items.map((_, i) => (
                <button class={`dot${i === 0 ? ' active' : ''}`} data-index={String(i)}></button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}