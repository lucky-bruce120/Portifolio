import { lock, unlock, isUnlocked } from './auth.js'
import { isDirty } from '../store/contentStore.js'

import { SitePanel, NavPanel, HeroPanel, AboutPanel } from './panels/CorePanels.jsx'
import {
  SkillsPanel,
  ProjectsPanel,
  ExperiencePanel,
  TestimonialsPanel,
  ContactPanel,
  FooterPanel
} from './panels/ContentPanels.jsx'
import { DataPanel } from './panels/DataPanel.jsx'
import { MessagesPanel } from './panels/MessagesPanel.jsx'
import { LivePreview } from './components/LivePreview.jsx'
import { subscribe as subscribeMessages, unreadCount } from '../store/messagesStore.js'

const TABS = [
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

export function AdminApp() {
  const unlocked = isUnlocked()

  return (
    <div class="adm-shell">
      {unlocked ? <Dashboard /> : <Login onSuccess={() => location.reload()} />}
    </div>
  )
}

function Login({ onSuccess }) {
  const input = { current: null }
  const error = { current: null }

  const submit = async (e) => {
    e.preventDefault()
    const ok = await unlock(input.current.value)
    if (ok) {
      onSuccess()
    } else {
      error.current.textContent = 'Incorrect password.'
      input.current.value = ''
      input.current.focus()
    }
  }

  return (
    <div class="adm-login">
      <form class="adm-login-card" onSubmit={submit}>
        <div class="adm-login-brand">
          <span class="adm-login-logo">BL<span class="text-gradient">.</span></span>
          <h1 class="adm-login-title">Admin Dashboard</h1>
          <p class="adm-login-sub">Enter your password to edit the portfolio.</p>
        </div>
        <input
          ref={input}
          class="adm-input"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
        />
        <p class="adm-login-error" ref={error}></p>
        <button type="submit" class="adm-btn adm-btn-primary adm-btn-block">
          <i class="fas fa-lock-open"></i> Unlock
        </button>
        <a class="adm-login-back" href="#home">
          <i class="fas fa-arrow-left"></i> Back to site
        </a>
      </form>
    </div>
  )
}

function Dashboard() {
  let currentTab = TABS[0].id
  let previewOn = false

  // Ref objects, not bare variables: the runtime assigns the element to
  // `ref.current`, so passing `ref={host}` (which is null at this point)
  // would silently leave the host empty.
  const contentHost = { current: null }
  const navHost = { current: null }
  const previewHost = { current: null }

  // Unread count badge on the Messages tab. Rebuilt on every renderTab, and
  // refreshed live if a message arrives while you are on another tab. The
  // listener drops itself once the dashboard is detached, like the repeaters.
  const paintBadge = (badge) => {
    const count = unreadCount()
    badge.textContent = count > 0 ? String(count) : ''
    badge.style.display = count > 0 ? 'inline-flex' : 'none'
  }

  const refreshBadges = () => {
    const host = navHost.current
    if (!host || !host.isConnected) {
      unsubscribeMessages()
      return
    }
    for (const badge of Array.from(host.querySelectorAll('.adm-tab-badge'))) {
      paintBadge(badge)
    }
  }

  const unsubscribeMessages = subscribeMessages(refreshBadges)

  const togglePreview = (e) => {
    previewOn = !previewOn
    e.currentTarget.classList.toggle('active', previewOn)
    shell.classList.toggle('adm-dash-preview', previewOn)
    previewHost.current.textContent = ''
    if (previewOn) previewHost.current.appendChild(<LivePreview />)
  }

  const renderTab = (tabId) => {
    currentTab = tabId
    const tab = TABS.find((t) => t.id === tabId)

    contentHost.current.textContent = ''
    contentHost.current.appendChild(<tab.Component />)

    navHost.current.textContent = ''
    for (const t of TABS) {
      const btn = document.createElement('button')
      btn.className = `adm-tab${t.id === currentTab ? ' active' : ''}`
      // addEventListener, not `onclick =`: matches how the JSX runtime binds
      // on* props, so tab switching and panel buttons behave identically.
      btn.addEventListener('click', () => renderTab(t.id))
      btn.appendChild(<i class={t.icon}></i>)
      btn.appendChild(document.createTextNode(t.label))

      if (t.id === 'messages') {
        const badge = document.createElement('span')
        badge.className = 'adm-tab-badge'
        btn.appendChild(badge)
        paintBadge(badge)
      }

      navHost.current.appendChild(btn)
    }

    contentHost.current.scrollTop = 0
  }

  // Both hosts must exist before the first paint. Elements are created during
  // the JSX call below and refs are applied then, so defer by one microtask.
  const mount = () => {
    if (!contentHost.current || !navHost.current) return
    renderTab(currentTab)
  }

  const shell = (
    <div class="adm-dash">
      <aside class="adm-sidebar">
        <div class="adm-sidebar-head">
          <span class="adm-logo">BL<span class="text-gradient">.</span></span>
          <span class="adm-logo-text">Content Manager</span>
        </div>
        <nav class="adm-tabs" ref={navHost}></nav>
        <div class="adm-sidebar-foot">
          <a class="adm-link" href="#home" target="_self">
            <i class="fas fa-eye"></i> View site
          </a>
          <button class="adm-link" onClick={() => lock()}>
            <i class="fas fa-lock"></i> Lock dashboard
          </button>
        </div>
      </aside>
      <main class="adm-content">
        <header class="adm-topbar">
          <div>
            <h1 class="adm-topbar-title">Content Manager</h1>
            <p class="adm-topbar-sub">
              {isDirty()
                ? 'Editing custom content stored in this browser.'
                : 'Showing default content. Your edits will be saved locally.'}
            </p>
          </div>
          <div class="adm-topbar-actions">
            <button class="adm-btn adm-btn-ghost" onClick={togglePreview}>
              <i class="fas fa-eye"></i> Live preview
            </button>
            <a class="adm-btn adm-btn-ghost" href="#home">
              <i class="fas fa-external-link-alt"></i> View site
            </a>
          </div>
        </header>
        <div class="adm-panel" ref={contentHost}></div>
      </main>
      <div class="adm-preview-slot" ref={previewHost}></div>
    </div>
  )

  queueMicrotask(mount)

  return shell
}