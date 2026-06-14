
export function Navbar() {
  return (
    <nav class="navbar" id="navbar">
      <div class="nav-container">
        <a href="#hero" class="nav-logo">BL<span class="text-gradient">.</span></a>
        <ul class="nav-links" id="navLinks">
          <li><a href="#hero" class="nav-link active">Home</a></li>
          <li><a href="#about" class="nav-link">About</a></li>
          <li><a href="#skills" class="nav-link">Skills</a></li>
          <li><a href="#projects" class="nav-link">Projects</a></li>
          <li><a href="#experience" class="nav-link">Experience</a></li>
          <li><a href="#testimonials" class="nav-link">Testimonials</a></li>
          <li><a href="#contact" class="nav-link">Contact</a></li>
        </ul>
        <div class="nav-actions">
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
            <i class="fas fa-sun"></i>
            <i class="fas fa-moon"></i>
          </button>
          <button class="hamburger" id="hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  )
}
