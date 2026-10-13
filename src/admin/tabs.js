import {
  SitePanel,
  NavPanel,
  HeroPanel,
  AboutPanel
} from './panels/CorePanels.jsx'
import {
  SkillsPanel,
  ProjectsPanel,
  ExperiencePanel,
  TestimonialsPanel,
  ContactPanel,
  FooterPanel
} from './panels/ContentPanels.jsx'
import { MessagesPanel } from './panels/MessagesPanel.jsx'
import { DataPanel } from './panels/DataPanel.jsx'

// Single source of truth for the dashboard's sections, shared by the sidebar
// and the dropdown menu so the two can never drift apart.
export const TABS = [
  { id: 'site', label: 'Site', icon: 'fas fa-sliders', Component: SitePanel },
  { id: 'hero', label: 'Hero', icon: 'fas fa-star', Component: HeroPanel },
  { id: 'about', label: 'About', icon: 'fas fa-user', Component: AboutPanel },
  { id: 'skills', label: 'Skills', icon: 'fas fa-code', Component: SkillsPanel },
  { id: 'projects', label: 'Projects', icon: 'fas fa-folder-open', Component: ProjectsPanel },
  { id: 'experience', label: 'Experience', icon: 'fas fa-briefcase', Component: ExperiencePanel },
  { id: 'testimonials', label: 'Testimonials', icon: 'fas fa-quote-left', Component: TestimonialsPanel },
  { id: 'contact', label: 'Contact', icon: 'fas fa-paper-plane', Component: ContactPanel },
  { id: 'messages', label: 'Messages', icon: 'fas fa-inbox', Component: MessagesPanel },
  { id: 'footer', label: 'Footer', icon: 'fas fa-shoe-prints', Component: FooterPanel },
  { id: 'data', label: 'Data', icon: 'fas fa-database', Component: DataPanel }
]

export function findTab(id) {
  return TABS.find((tab) => tab.id === id) ?? TABS[0]
}