import { Repeater, BoundText, BoundTextArea } from '../components/Fields.jsx'
import { PanelHeader, PanelSection } from '../components/Panel.jsx'

const SKILL_ITEM_FIELDS = [
  { name: 'name', label: 'Skill name', type: 'text' },
  { name: 'percent', label: 'Proficiency %', type: 'number', min: 0, max: 100 }
]

const SKILL_CATEGORY_FIELDS = [
  { name: 'title', label: 'Category title', type: 'text' },
  { name: 'icon', label: 'Icon', type: 'icon' },
  {
    name: 'items',
    label: 'Skills',
    type: 'repeater',
    titleKey: 'name',
    addLabel: 'Add skill',
    itemDefaults: { name: 'New skill', percent: 80 },
    fields: SKILL_ITEM_FIELDS
  }
]

const TECH_FIELDS = [
  { name: 'label', label: 'Label', type: 'text' },
  { name: 'icon', label: 'Icon', type: 'icon' },
  { name: 'color', label: 'Brand color', type: 'color' }
]

export function SkillsPanel() {
  return (
    <>
      <PanelHeader
        title="Skills"
        subtitle="Proficiency bars animate as they scroll into view."
      />

      <PanelSection title="Section headings">
        <div class="adm-grid-3">
          <BoundText label="Eyebrow label" path="skills.label" />
          <BoundText label="Title" path="skills.title" />
          <BoundText label="Title accent" path="skills.titleAccent" />
        </div>
      </PanelSection>

      <PanelSection title="Skill categories" hint="Each category becomes one card in the grid.">
        <Repeater
          label="Categories"
          path="skills.categories"
          fields={SKILL_CATEGORY_FIELDS}
          itemDefaults={{ title: 'New category', icon: 'fas fa-code', items: [] }}
          addLabel="Add category"
        />
      </PanelSection>

      <PanelSection title="Tech stack cloud">
        <Repeater
          label="Tech badges"
          path="skills.tech"
          fields={TECH_FIELDS}
          itemDefaults={{ label: 'Tech', icon: 'fab fa-react', color: '#6366f1' }}
          titleKey="label"
          addLabel="Add tech badge"
        />
      </PanelSection>
    </>
  )
}

const PROJECT_FIELDS = [
  { name: 'title', label: 'Project title', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  {
    name: 'category',
    label: 'Category / filter',
    type: 'text',
    hint: 'Filters are generated automatically from the categories you use.'
  },
  { name: 'tags', label: 'Tags', type: 'tags' },
  { name: 'gradient', label: 'Cover gradient', type: 'color' },
  { name: 'github', label: 'GitHub URL', type: 'text' },
  { name: 'live', label: 'Live demo URL', type: 'text' }
]

export function ProjectsPanel() {
  return (
    <>
      <PanelHeader
        title="Projects"
        subtitle="Cards appear in the order listed here. Filter buttons build themselves from the categories."
      />

      <PanelSection title="Section headings">
        <div class="adm-grid-3">
          <BoundText label="Eyebrow label" path="projects.label" />
          <BoundText label="Title" path="projects.title" />
          <BoundText label="Title accent" path="projects.titleAccent" />
        </div>
      </PanelSection>

      <PanelSection title="Projects">
        <Repeater
          label="Project cards"
          path="projects.items"
          fields={PROJECT_FIELDS}
          itemDefaults={{
            title: 'New project',
            description: 'Describe what this project does.',
            category: 'web',
            tags: ['React'],
            gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
            github: '',
            live: ''
          }}
          addLabel="Add project"
        />
      </PanelSection>
    </>
  )
}

const EXPERIENCE_FIELDS = [
  { name: 'date', label: 'Date range', type: 'text', placeholder: '2024 - 2025' },
  { name: 'role', label: 'Role / job title', type: 'text' },
  { name: 'company', label: 'Company', type: 'text', hint: 'Leave blank to hide the company line.' },
  { name: 'description', label: 'What you did', type: 'textarea', rows: 4 },
  { name: 'tags', label: 'Tech tags', type: 'tags' }
]

export function ExperiencePanel() {
  return (
    <>
      <PanelHeader
        title="Experience"
        subtitle="Your timeline, newest first is a good default."
      />

      <PanelSection title="Section headings">
        <div class="adm-grid-3">
          <BoundText label="Eyebrow label" path="experience.label" />
          <BoundText label="Title" path="experience.title" />
          <BoundText label="Title accent" path="experience.titleAccent" />
        </div>
      </PanelSection>

      <PanelSection title="Timeline">
        <Repeater
          label="Positions"
          path="experience.items"
          fields={EXPERIENCE_FIELDS}
          itemDefaults={{ date: '2026', role: 'New role', company: '', description: '', tags: [] }}
          addLabel="Add position"
        />
      </PanelSection>
    </>
  )
}

const TESTIMONIAL_FIELDS = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'role', label: 'Role & company', type: 'text' },
  { name: 'initials', label: 'Initials', type: 'text', hint: 'Shown in the avatar circle.' },
  { name: 'quote', label: 'Quote', type: 'textarea', rows: 4 },
  { name: 'rating', label: 'Stars (0-5)', type: 'number', min: 0, max: 5 },
  { name: 'gradient', label: 'Avatar gradient', type: 'color' }
]

export function TestimonialsPanel() {
  return (
    <>
      <PanelHeader
        title="Testimonials"
        subtitle="Auto-advancing slider. Dots are generated from the number of entries."
      />

      <PanelSection title="Section headings">
        <div class="adm-grid-3">
          <BoundText label="Eyebrow label" path="testimonials.label" />
          <BoundText label="Title" path="testimonials.title" />
          <BoundText label="Title accent" path="testimonials.titleAccent" />
        </div>
      </PanelSection>

      <PanelSection title="Testimonials">
        <Repeater
          label="Entries"
          path="testimonials.items"
          fields={TESTIMONIAL_FIELDS}
          itemDefaults={{
            name: 'Client name',
            role: 'Role, Company',
            initials: 'CN',
            quote: 'What they said about working with you.',
            rating: 5,
            gradient: 'linear-gradient(135deg,#667eea,#764ba2)'
          }}
          addLabel="Add testimonial"
        />
      </PanelSection>
    </>
  )
}

const CONTACT_DETAIL_FIELDS = [
  { name: 'label', label: 'Label', type: 'text' },
  { name: 'value', label: 'Value', type: 'text' },
  {
    name: 'icon',
    label: 'Icon',
    type: 'icon'
  },
  { name: 'href', label: 'Link (optional)', type: 'text', hint: 'mailto:..., tel:+250..., or blank for plain text.' }
]

const SOCIAL_FIELDS = [
  { name: 'label', label: 'Platform name', type: 'text' },
  { name: 'icon', label: 'Font Awesome icon', type: 'icon' },
  { name: 'href', label: 'URL', type: 'text' }
]

export function ContactPanel() {
  return (
    <>
      <PanelHeader
        title="Contact"
        subtitle="Contact cards, social icons and the submit button label."
      />

      <PanelSection title="Section headings">
        <div class="adm-grid-3">
          <BoundText label="Eyebrow label" path="contact.label" />
          <BoundText label="Title" path="contact.title" />
          <BoundText label="Title accent" path="contact.titleAccent" />
        </div>
      </PanelSection>

      <PanelSection title="Copy">
        <BoundTextArea label="Intro paragraph" path="contact.intro" rows={3} />
        <BoundText label="Submit button label" path="contact.submitLabel" />
      </PanelSection>

      <PanelSection title="Contact cards">
        <Repeater
          label="Cards"
          path="contact.details"
          fields={CONTACT_DETAIL_FIELDS}
          itemDefaults={{ label: 'Label', value: 'Value', icon: 'fas fa-envelope', href: '' }}
          titleKey="label"
          addLabel="Add contact card"
        />
      </PanelSection>

      <PanelSection title="Social icons">
        <Repeater
          label="Social links"
          path="contact.socials"
          fields={SOCIAL_FIELDS}
          itemDefaults={{ label: 'Platform', icon: 'fab fa-github', href: 'https://' }}
          addLabel="Add social link"
        />
      </PanelSection>
    </>
  )
}

const FOOTER_CTA_BUTTON_FIELDS = [
  { name: 'label', label: 'Label', type: 'text' },
  {
    name: 'variant',
    label: 'Style',
    type: 'select',
    options: [
      { value: 'primary', label: 'Primary (filled)' },
      { value: 'outline', label: 'Outline' }
    ]
  },
  { name: 'href', label: 'Link target', type: 'text' },
  { name: 'icon', label: 'Icon (optional)', type: 'icon' }
]

const FOOTER_LINK_FIELDS = [
  { name: 'label', label: 'Label', type: 'text' },
  { name: 'href', label: 'Link target', type: 'text' },
  { name: 'icon', label: 'Icon (contact columns only)', type: 'icon' }
]



export function FooterPanel() {
  return (
    <>
      <PanelHeader
        title="Footer"
        subtitle="Call-to-action banner, link columns and the bottom credit line."
      />

      <PanelSection title="CTA banner" hint="Set the title to an empty string to hide the whole banner.">
        <div class="adm-grid-2">
          <BoundText label="Badge" path="footer.cta.badge" />
          <BoundText label="Title" path="footer.cta.title" />
          <BoundText label="Title accent" path="footer.cta.titleAccent" />
          <BoundText label="Credit line" path="footer.credit" />
        </div>
        <BoundTextArea label="Supporting text" path="footer.cta.text" rows={3} />
        <BoundTextArea label="Brand text" path="footer.brandText" rows={3} />
        <Repeater
          label="CTA buttons"
          path="footer.cta.buttons"
          fields={FOOTER_CTA_BUTTON_FIELDS}
          itemDefaults={{ label: 'Button', href: '#contact', variant: 'outline', icon: '' }}
          addLabel="Add CTA button"
        />
      </PanelSection>

      <PanelSection title="Link columns">
        <Repeater
          label="Link columns"
          path="footer.columns"
          fields={[
            { name: 'title', label: 'Column title', type: 'text' },
            {
              name: 'type',
              label: 'Column type',
              type: 'select',
              options: [
                { value: 'links', label: 'Links list' },
                { value: 'contact', label: 'Contact list (with icons)' }
              ]
            },
            {
              name: 'links',
              label: 'Entries',
              type: 'repeater',
              titleKey: 'label',
              addLabel: 'Add entry',
              itemDefaults: { label: 'Entry', href: '', icon: '' },
              fields: FOOTER_LINK_FIELDS
            }
          ]}
          itemDefaults={{ title: 'New column', type: 'links', links: [] }}
          addLabel="Add column"
        />
      </PanelSection>
    </>
  )
}