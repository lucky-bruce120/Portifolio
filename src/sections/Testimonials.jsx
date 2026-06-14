
export function Testimonials() {
  return (
    <section id="testimonials" class="section testimonials-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">Testimonials</span>
          <h2 class="section-title">What People <span class="text-gradient">Say</span></h2>
          <div class="section-divider"></div>
        </div>
        <div class="testimonial-slider reveal">
          <div class="testimonial-track" id="testimonialTrack">
            <div class="testimonial-card">
              <div class="testimonial-stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
              </div>
              <p class="testimonial-text">"Bruce is an exceptional frontend developer. His attention to detail and ability to translate complex designs into pixel-perfect interfaces is remarkable. A true asset to any team."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>SK</div>
                <div class="testimonial-author-info">
                  <h4>Sarah Kim</h4>
                  <span>CTO, TechCorp Inc.</span>
                </div>
              </div>
            </div>
            <div class="testimonial-card">
              <div class="testimonial-stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
              </div>
              <p class="testimonial-text">"Working with Bruce was a pleasure. He delivered our dashboard project ahead of schedule and the code quality was outstanding. His Vue expertise really shines through."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>MJ</div>
                <div class="testimonial-author-info">
                  <h4>Marcus Johnson</h4>
                  <span>Product Lead, StartupXYZ</span>
                </div>
              </div>
            </div>
            <div class="testimonial-card">
              <div class="testimonial-stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
              </div>
              <p class="testimonial-text">"Bruce has an incredible eye for design and a deep understanding of frontend architecture. He consistently delivers clean, maintainable code and is a great collaborator."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar" style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)' }}>AL</div>
                <div class="testimonial-author-info">
                  <h4>Amy Liu</h4>
                  <span>Design Director, CreativeCo</span>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-dots" id="testimonialDots">
            <button class="dot active" data-index="0"></button>
            <button class="dot" data-index="1"></button>
            <button class="dot" data-index="2"></button>
          </div>
        </div>
      </div>
    </section>
  )
}
