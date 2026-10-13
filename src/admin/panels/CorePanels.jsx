import { Repeater, BoundText, BoundTextArea } from '../components/Fields.jsx'
import { PanelHeader, PanelSection } from '../components/Panel.jsx'

const SOCIAL_FIELDS = [
  { name: 'label', label: 'Platform name', type: 'text' },
  { name: 'icon', label: 'Font Awesome icon', type: 'icon' },
  { name: 'href', label: 'URL', type: 'text' }
]

const HERO_BUTTON_FIELDS = [
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

const NAV_FIELDS = [
  { name: 'label', label: 'Label', type: 'text' },
  { name: 'href', label: 'Link target', type: 'text', hint: 'Use #section-id to scroll to a section.' }
]

const ABOUT_STAT_FIELDS = [
  { name: 'value', label: 'Value', type: 'number', max: 10000 },
  { name: 'label', label: 'Label', type: 'text' }
]

const ABOUT_INFO_FIELDS = [
  { name: 'label', label: 'Label', type: 'text' },
  { name: 'value', label: 'Value', type: 'text' },
  {
    name: 'highlight',
    label: 'Highlight (green)',
    type: 'select',
    options: [
      { value: false, label: 'No' },
      { value: true, label: 'Yes' }
    ]
  }
]

const ROLE_FIELDS = [
  { name: 'text', label: 'Role title', type: 'text', placeholder: 'Frontend Developer' }
]

const HERO_TECH_FIELDS = [
  { name: 'label', label: 'Badge label', type: 'text', placeholder: 'React' }
]

const ABOUT_PARAGRAPHS = [
  { name: 'text', label: 'Paragraph', type: 'textarea', rows: 4 }
]

export function SitePanel() {
  return (
    <>
      <PanelHeader
        title="Site Identity"
        subtitle="The basics used in the navbar logo, the page title and the footer."
      />
      <div class="adm-grid-2">
        <BoundText label="Full name" path="site.name" />
        <BoundText label="Tagline / role" path="site.tagline" />
        <BoundText label="Logo initials" path="site.initials" hint="Shown before the logo dot." />
        <BoundText label="Avatar initials" path="site.avatarText" hint="Rendered inside the hero avatar circle." />
        <BoundText label="Meta description" path="site.description" />
      </div>
    </>
  )
}

export function NavPanel() {
  return (
    <>
      <PanelHeader
        title="Navigation"
        subtitle="Links shown in the navbar. These also drive the scroll-spy highlight."
      />
      <Repeater
        label="Nav links"
        path="nav.links"
        fields={NAV_FIELDS}
        itemDefaults={{ label: 'New link', href: '#hero' }}
        addLabel="Add nav link"
      />
    </>
  )
}

export function HeroPanel() {
  return (
    <>
      <PanelHeader
        title="Hero"
        subtitle="The first thing visitors see. Rotating roles animate on their own."
      />

      <PanelSection title="Copy">
        <div class="adm-grid-2">
          <BoundText label="Availability badge" path="hero.badge" />
          <BoundText label="Greeting" path="hero.greeting" />
          <BoundText label="Name" path="hero.name" />
        </div>
        <BoundTextArea label="Description" path="hero.description" rows={3} />
      </PanelSection>

      <PanelSection
        title="Rotating roles"
        hint="Each entry is typed out one after another in the hero."
      >
        <Repeater
          label="Roles"
          path="hero.roles"
          fields={ROLE_FIELDS}
          itemDefaults={{ text: 'New role' }}
          titleKey="text"
          addLabel="Add role"
          emptyText="No roles yet, the typing animation is hidden."
        />
      </PanelSection>

      <PanelSection title="Floating tech badges">
        <Repeater
          label="Tech badges"
          path="hero.techs"
          fields={HERO_TECH_FIELDS}
          itemDefaults={{ label: 'New tech' }}
          titleKey="label"
          addLabel="Add badge"
          emptyText="No badges yet."
        />
      </PanelSection>

      <PanelSection title="Buttons">
        <Repeater
          label="Call to action"
          path="hero.buttons"
          fields={HERO_BUTTON_FIELDS}
          itemDefaults={{ label: 'Button', href: '#contact', variant: 'outline', icon: '' }}
          addLabel="Add button"
        />
      </PanelSection>

      <PanelSection title="Social icons">
        <Repeater
          label="Social links"
          path="hero.socials"
          fields={SOCIAL_FIELDS}
          itemDefaults={{ label: 'Platform', icon: 'fab fa-github', href: 'https://' }}
          addLabel="Add social link"
        />
      </PanelSection>
    </>
  )
}

export function AboutPanel() {
  return (
    <>
      <PanelHeader
        title="About"
        subtitle="Your story, key numbers and quick facts."
      />

      <PanelSection title="Section headings">
        <div class="adm-grid-3">
          <BoundText label="Eyebrow label" path="about.label" />
          <BoundText label="Title" path="about.title" />
          <BoundText label="Title accent" path="about.titleAccent" />
        </div>
      </PanelSection>

      <PanelSection title="Bio">
        <Repeater
          label="Paragraphs"
          path="about.paragraphs"
          fields={ABOUT_PARAGRAPHS}
          titleKey="text"
          itemDefaults={{ text: 'New paragraph.' }}
          addLabel="Add paragraph"
        />
      </PanelSection>

      <PanelSection title="Statistics" hint="Numbers count up when scrolled into view.">
        <Repeater
          label="Stats"
          path="about.stats"
          fields={ABOUT_STAT_FIELDS}
          itemDefaults={{ value: 0, label: 'New stat' }}
          titleKey="label"
          addLabel="Add stat"
        />
      </PanelSection>

      <PanelSection title="Quick facts">
        <Repeater
          label="Info rows"
          path="about.info"
          fields={ABOUT_INFO_FIELDS}
          itemDefaults={{ label: 'Label', value: 'Value', highlight: false }}
          titleKey="label"
          addLabel="Add info row"
        />
      </PanelSection>

      <PanelSection title="CV & badge">
        <div class="adm-grid-2">
          <BoundText label="CV button label" path="about.cv.label" />
          <BoundText label="CV file path" path="about.cv.href" hint="Put the file in /public and link like /resume.pdf" />
          <BoundText label="Badge number" path="about.expBadge.number" />
          <BoundText label="Badge text" path="about.expBadge.text" hint="Line breaks are preserved." />
        </div>
      </PanelSection>
    </>
  )
}