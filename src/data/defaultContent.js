// Default content for the portfolio. This is the single source of truth the
// public site renders from, and the baseline the admin dashboard resets to.

export const defaultContent = {
  site: {
    name: 'Bruce Lucky',
    initials: 'BL',
    tagline: 'Frontend Developer',
    description: 'Frontend Developer Portfolio',
    avatarText: 'BL'
  },

  nav: {
    links: [
      { id: 'nav-1', label: 'Home', href: '#hero' },
      { id: 'nav-2', label: 'About', href: '#about' },
      { id: 'nav-3', label: 'Skills', href: '#skills' },
      { id: 'nav-4', label: 'Projects', href: '#projects' },
      { id: 'nav-5', label: 'Experience', href: '#experience' },
      { id: 'nav-6', label: 'Testimonials', href: '#testimonials' },
      { id: 'nav-7', label: 'Contact', href: '#contact' }
    ]
  },

  hero: {
    badge: 'Available for work',
    greeting: "Hi, I'm",
    name: 'Bruce Lucky',
    roles: [
      { id: 'role-1', text: 'Frontend Developer' },
      { id: 'role-2', text: 'UI Engineer' },
      { id: 'role-3', text: 'React Architect' },
      { id: 'role-4', text: 'Creative Coder' }
    ],
    description:
      'Crafting pixel-perfect, performant web experiences with modern frontend technologies. Passionate about UI engineering, accessible design, and building products that users love.',
    buttons: [
      { id: 'hero-btn-1', label: 'View My Work', href: '#projects', variant: 'primary', icon: '' },
      { id: 'hero-btn-2', label: 'Get In Touch', href: '#contact', variant: 'outline', icon: '' }
    ],
    techs: [
      { id: 'herotech-1', label: 'React' },
      { id: 'herotech-2', label: 'TypeScript' },
      { id: 'herotech-3', label: 'Node.js' },
      { id: 'herotech-4', label: 'Tailwind' },
      { id: 'herotech-5', label: 'Next.js' }
    ],
    socials: [
      { id: 'hero-soc-1', icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/lucky-bruce120' },
      { id: 'hero-soc-2', icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucky-bruce-1303782a7/?isSelfProfile=true' },
      { id: 'hero-soc-3', icon: 'fab fa-x-twitter', label: 'X (Twitter)', href: 'https://x.com/Cha_pter120' },
      { id: 'hero-soc-4', icon: 'fab fa-dribbble', label: 'Dribbble', href: 'https://dribbble.com/lucky-bruce' }
    ]
  },

  about: {
    label: 'About Me',
    title: 'Turning Ideas Into',
    titleAccent: 'Digital Reality',
    paragraphs: [
      "I'm a frontend developer based in Kigali with 2+ years of experience building modern web applications. I specialize in React, TypeScript, and the ever-evolving JavaScript ecosystem.",
      "From startups to enterprise-level projects, I've had the privilege of working with diverse teams to create intuitive, high-performance interfaces that make a real impact. I believe great code is both functional and beautiful.",
      "When I'm not coding, you'll find me exploring new design trends, contributing to open-source projects, or writing about frontend best practices."
    ],
    stats: [
      { id: 'stat-1', value: 1, label: 'Years Experience' },
      { id: 'stat-2', value: 4, label: 'Projects Done' },
      { id: 'stat-3', value: 30, label: 'Happy Clients' },
      { id: 'stat-4', value: 2, label: 'Awards Won' }
    ],
    info: [
      { id: 'info-1', label: 'Name', value: 'Bruce Lucky', highlight: false },
      { id: 'info-2', label: 'Email', value: 'brucelucky012@gmail.com', highlight: false },
      { id: 'info-3', label: 'Location', value: 'KIGALI, RWA', highlight: false },
      { id: 'info-4', label: 'Freelance', value: 'Available', highlight: true }
    ],
    cv: { label: 'Download CV', href: '/resume.pdf' },
    expBadge: { number: '1+', text: 'Years of Experience' }
  },

  skills: {
    label: 'My Skills',
    title: 'Technical',
    titleAccent: 'Expertise',
    categories: [
      {
        id: 'skillcat-1',
        title: 'Frontend',
        icon: 'fas fa-code',
        items: [
          { id: 'skill-1', name: 'HTML / CSS', percent: 95 },
          { id: 'skill-2', name: 'JavaScript / TypeScript', percent: 92 },
          { id: 'skill-3', name: 'React / Next.js', percent: 90 }
        ]
      },
      {
        id: 'skillcat-2',
        title: 'Design',
        icon: 'fas fa-paint-brush',
        items: [
          { id: 'skill-4', name: 'Figma', percent: 88 },
          { id: 'skill-5', name: 'UI / UX Design', percent: 85 },
          { id: 'skill-6', name: 'Responsive Design', percent: 93 },
          { id: 'skill-7', name: 'Animation', percent: 80 }
        ]
      },
      {
        id: 'skillcat-3',
        title: 'Backend & Tools',
        icon: 'fas fa-server',
        items: [
          { id: 'skill-8', name: 'Node.js / Express', percent: 82 },
          { id: 'skill-9', name: 'Git / GitHub', percent: 90 },
          { id: 'skill-10', name: 'Docker', percent: 70 },
          { id: 'skill-11', name: 'CI/CD', percent: 75 }
        ]
      }
    ],
    tech: [
      { id: 'tech-1', icon: 'fab fa-react', label: 'React', color: '#61dafb' },
      { id: 'tech-2', icon: 'fab fa-js', label: 'TypeScript', color: '#3178c6' },
      { id: 'tech-3', icon: 'fab fa-node-js', label: 'Node.js', color: '#339933' },
      { id: 'tech-4', icon: 'fas fa-wind', label: 'Tailwind', color: '#06b6d4' },
      { id: 'tech-5', icon: 'fab fa-github', label: 'Git', color: '#888888' },
      { id: 'tech-6', icon: 'fab fa-figma', label: 'Figma', color: '#f24e1e' },
      { id: 'tech-7', icon: 'fab fa-html5', label: 'HTML5', color: '#e34f26' },
      { id: 'tech-8', icon: 'fab fa-css3-alt', label: 'CSS3', color: '#1572b6' },
      { id: 'tech-9', icon: 'fab fa-js-square', label: 'JavaScript', color: '#f7df1e' },
      { id: 'tech-10', icon: 'fab fa-docker', label: 'Docker', color: '#2496ed' }
    ]
  },

  projects: {
    label: 'Portfolio',
    title: 'Featured',
    titleAccent: 'Projects',
    items: [
      {
        id: 'proj-1',
        title: 'SkillMatch',
        description:
          'SkillMatch is a modern web-based application designed to solve the problem of skill mismatch in the job market by intelligently connecting job seekers with relevant job opportunities based on their skills.',
        category: 'react',
        gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
        tags: ['HTML', 'TypeScript', 'Javascript', 'Tailwind'],
        github: 'https://github.com/lucky-bruce120/SkillMatch',
        live: ''
      },
      {
        id: 'proj-2',
        title: 'todo-App',
        description:
          'A simple Todo application for managing daily tasks with add, edit, complete, and delete functionality.',
        category: 'react',
        gradient: 'linear-gradient(135deg,#f093fb,#f5576c)',
        tags: ['HTML', 'CSS', 'Javascript', 'React.js', 'Node.js+Express', 'MongoDB'],
        github: 'https://github.com/lucky-bruce120/todo-App',
        live: ''
      },
      {
        id: 'proj-3',
        title: 'Brand Redesign',
        description: 'Complete brand identity and website redesign for a tech startup.',
        category: 'ui-ux',
        gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
        tags: ['Figma', 'Prototyping', 'Design System'],
        github: '',
        live: ''
      },
      {
        id: 'proj-4',
        title: 'finance-tracker',
        description:
          'Personal Finance Tracker with AI Budgeting is a comprehensive tool designed to help users manage their finances efficiently.',
        category: 'web',
        gradient: 'linear-gradient(135deg,#fa709a,#fee140)',
        tags: ['React', 'Nodejs', 'Express', 'MongoDB'],
        github: 'https://github.com/lucky-bruce120/finance-tracker',
        live: ''
      }
    ]
  },

  experience: {
    label: 'Experience',
    title: 'Professional',
    titleAccent: 'Journey',
    items: [
      {
        id: 'exp-1',
        date: '2024',
        role: 'Senior Frontend Engineer',
        company: '',
        description:
          'Leading frontend architecture for a SaaS platform serving 100k+ users. Migrated legacy codebase to React 18 with TypeScript, improving performance by 40%.',
        tags: ['React', 'TypeScript', 'Next.js', 'AWS']
      },
      {
        id: 'exp-2',
        date: '2024 - 2025',
        role: 'Frontend Developer',
        company: 'StartupXYZ',
        description:
          'Built and launched applications from scratch. Implemented component library used by 3 product teams.',
        tags: ['React.js', 'Express', 'Tailwind', 'HTML']
      },
      {
        id: 'exp-3',
        date: '2025 - 2026',
        role: 'Junior Developer',
        company: 'Rovynex Solution Ltd.',
        description:
          'Developed responsive websites and web applications for various clients. Specialized in WordPress and React-based solutions.',
        tags: ['React', 'JavaScript', 'WordPress', 'Tailwind']
      },
      {
        id: 'exp-4',
        date: '2026 - 2027',
        role: 'Freelance Web Developer',
        company: 'Self-Employed',
        description:
          'Designed and developed websites for small businesses and startups. Built a portfolio of 15+ client projects.',
        tags: ['HTML/CSS', 'JavaScript', 'PHP', 'MySQL']
      }
    ]
  },

  testimonials: {
    label: 'Testimonials',
    title: 'What People',
    titleAccent: 'Say',
    items: [
      {
        id: 'test-1',
        quote:
          'Bruce is an exceptional frontend developer. His attention to detail and ability to translate complex designs into pixel-perfect interfaces is remarkable. A true asset to any team.',
        name: 'Sarah Kim',
        role: 'CTO, TechCorp Inc.',
        initials: 'SK',
        gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
        rating: 5
      },
      {
        id: 'test-2',
        quote:
          'Working with Bruce was a pleasure. He delivered our dashboard project ahead of schedule and the code quality was outstanding.',
        name: 'Marcus Johnson',
        role: 'Product Lead, StartupXYZ',
        initials: 'MJ',
        gradient: 'linear-gradient(135deg,#f093fb,#f5576c)',
        rating: 5
      },
      {
        id: 'test-3',
        quote:
          'Bruce has an incredible eye for design and a deep understanding of frontend architecture. He consistently delivers clean, maintainable code.',
        name: 'Amy Liu',
        role: 'Design Director, CreativeCo',
        initials: 'AL',
        gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)',
        rating: 5
      }
    ]
  },

  contact: {
    label: 'Contact',
    title: "Let's Work",
    titleAccent: 'Together',
    intro:
      'Have a project in mind or just want to say hi? My inbox is always open.',
    submitLabel: 'Send Message',
    details: [
      {
        id: 'cdetail-1',
        icon: 'fas fa-envelope',
        label: 'Email',
        value: 'brucelucky012@gmail.com',
        href: 'mailto:brucelucky012@gmail.com'
      },
      {
        id: 'cdetail-2',
        icon: 'fas fa-phone',
        label: 'Phone',
        value: '(+250) 795 482 652',
        href: 'tel:+250795482652'
      },
      {
        id: 'cdetail-3',
        icon: 'fas fa-location-dot',
        label: 'Location',
        value: 'Kigali, RWA',
        href: ''
      }
    ],
    socials: [
      { id: 'contact-soc-1', icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/lucky-bruce120' },
      { id: 'contact-soc-2', icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucky-bruce-1303782a7/?isSelfProfile=true' },
      { id: 'contact-soc-3', icon: 'fab fa-x-twitter', label: 'X (Twitter)', href: 'https://x.com/Cha_pter120' },
      { id: 'contact-soc-4', icon: 'fab fa-dribbble', label: 'Dribbble', href: 'https://dribbble.com/lucky-bruce' },
      { id: 'contact-soc-5', icon: 'fab fa-codepen', label: 'CodePen', href: 'https://codepen.io/Lucky-Bruce' }
    ]
  },

  footer: {
    cta: {
      badge: 'Available for new projects',
      title: "Let's build something",
      titleAccent: 'amazing',
      text: "Have an idea, a redesign, or a frontend role in mind? I'm just a message away.",
      buttons: [
        { id: 'fcta-btn-1', label: 'Hire Me', href: '#contact', variant: 'primary', icon: '' },
        { id: 'fcta-btn-2', label: 'Email Me', href: 'mailto:brucelucky012@gmail.com', variant: 'outline', icon: 'fas fa-paper-plane' }
      ]
    },
    brandText:
      'Frontend developer based in Kigali, Rwanda — crafting pixel-perfect, accessible and performant web experiences with modern frontend technologies.',
    columns: [
      {
        id: 'footer-col-1',
        title: 'Explore',
        type: 'links',
        links: [
          { id: 'fl-1', label: 'Home', href: '#hero' },
          { id: 'fl-2', label: 'About', href: '#about' },
          { id: 'fl-3', label: 'Skills', href: '#skills' },
          { id: 'fl-4', label: 'Projects', href: '#projects' },
          { id: 'fl-5', label: 'Experience', href: '#experience' },
          { id: 'fl-6', label: 'Testimonials', href: '#testimonials' },
          { id: 'fl-7', label: 'Contact', href: '#contact' }
        ]
      },
      {
        id: 'footer-col-2',
        title: 'Services',
        type: 'links',
        links: [
          { id: 'fl-8', label: 'Web Development', href: '#contact' },
          { id: 'fl-9', label: 'UI/UX Design', href: '#contact' },
          { id: 'fl-10', label: 'Frontend Consulting', href: '#contact' },
          { id: 'fl-11', label: 'Code Review', href: '#contact' }
        ]
      },
      {
        id: 'footer-col-3',
        title: 'Get in Touch',
        type: 'contact',
        links: [
          { id: 'fl-12', label: 'brucelucky012@gmail.com', href: 'mailto:brucelucky012@gmail.com', icon: 'fas fa-envelope' },
          { id: 'fl-13', label: '(+250) 795 482 652', href: 'tel:+250795482652', icon: 'fas fa-phone' },
          { id: 'fl-14', label: 'Kigali, Rwanda', href: '', icon: 'fas fa-location-dot' },
          { id: 'fl-15', label: '@lucky-bruce120', href: 'https://github.com/lucky-bruce120', icon: 'fab fa-github' }
        ]
      }
    ],
    credit: "Designed & Built with love using React"
  }
}

export function createDefaultContent() {
  return structuredClone(defaultContent)
}