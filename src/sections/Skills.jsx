
export function Skills() {
  return (
    <section id="skills" class="section skills-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-label">My Skills</span>
          <h2 class="section-title">Technical <span class="text-gradient">Expertise</span></h2>
          <div class="section-divider"></div>
        </div>
        <div class="skills-grid">
          <div class="skill-category reveal">
            <h3 class="skill-category-title"><i class="fas fa-code"></i> Frontend</h3>
            <div class="skill-bars">
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>HTML / CSS</span><span class="skill-percent">95%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="95"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>JavaScript / TypeScript</span><span class="skill-percent">92%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="92"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>React / Next.js</span><span class="skill-percent">90%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="90"></div></div>
              </div>
              
            </div>
          </div>
          <div class="skill-category reveal">
            <h3 class="skill-category-title"><i class="fas fa-paint-brush"></i> Design</h3>
            <div class="skill-bars">
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>Figma</span><span class="skill-percent">88%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="88"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>UI / UX Design</span><span class="skill-percent">85%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="85"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>Responsive Design</span><span class="skill-percent">93%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="93"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>Animation</span><span class="skill-percent">80%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="80"></div></div>
              </div>
            </div>
          </div>
          <div class="skill-category reveal">
            <h3 class="skill-category-title"><i class="fas fa-server"></i> Backend & Tools</h3>
            <div class="skill-bars">
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>Node.js / Express</span><span class="skill-percent">82%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="82"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>Git / GitHub</span><span class="skill-percent">90%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="90"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>Docker</span><span class="skill-percent">70%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="70"></div></div>
              </div>
              <div class="skill-bar-item">
                <div class="skill-bar-header"><span>CI/CD</span><span class="skill-percent">75%</span></div>
                <div class="skill-bar-track"><div class="skill-bar-fill" data-width="75"></div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tech-cloud reveal">
          <h3 class="tech-cloud-title">Tech Stack</h3>
          <div class="tech-cloud-items">
            <span class="tech-cloud-item" style={{ '--c': '#61dafb' }}><i class="fab fa-react"></i> React</span>
            <span class="tech-cloud-item" style={{ '--c': '#3178c6' }}><i class="fab fa-js"></i> TypeScript</span>            <span class="tech-cloud-item" style={{ '--c': '#339933' }}><i class="fab fa-node-js"></i> Node.js</span>
            <span class="tech-cloud-item" style={{ '--c': '#06b6d4' }}><i class="fas fa-wind"></i> Tailwind</span>
            <span class="tech-cloud-item" style={{ '--c': '#000000' }}><i class="fab fa-github"></i> Git</span>
            <span class="tech-cloud-item" style={{ '--c': '#f24e1e' }}><i class="fab fa-figma"></i> Figma</span>
            <span class="tech-cloud-item" style={{ '--c': '#e34f26' }}><i class="fab fa-html5"></i> HTML5</span>
            <span class="tech-cloud-item" style={{ '--c': '#1572b6' }}><i class="fab fa-css3-alt"></i> CSS3</span>
            <span class="tech-cloud-item" style={{ '--c': '#f7df1e' }}><i class="fab fa-js-square"></i> JavaScript</span>            <span class="tech-cloud-item" style={{ '--c': '#2496ed' }}><i class="fab fa-docker"></i> Docker</span>
          </div>
        </div>
      </div>
    </section>
  )
}
