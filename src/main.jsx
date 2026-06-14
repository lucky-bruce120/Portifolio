import { Cursor } from './sections/Cursor.jsx'
import { Navbar } from './sections/Navbar.jsx'
import { Hero } from './sections/Hero.jsx'
import { About } from './sections/About.jsx'
import { Skills } from './sections/Skills.jsx'
import { Projects } from './sections/Projects.jsx'
import { Experience } from './sections/Experience.jsx'
import { Testimonials } from './sections/Testimonials.jsx'
import { Contact } from './sections/Contact.jsx'
import { Footer } from './sections/Footer.jsx'

const root = document.createDocumentFragment()

root.append(
  <Cursor />,
  <Navbar />,
  <main>
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Experience />
    <Testimonials />
    <Contact />
  </main>,
  <Footer />
)

document.body.append(root)

import('../main.js')
