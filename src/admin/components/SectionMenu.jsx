import { subscribe as subscribeMessages, unreadCount } from '../../store/messagesStore.js'

/**
 * A dropdown for navigating the dashboard's sections.
 *
 * The sidebar does this job on a desktop. On a phone the sidebar has to either
 * stack above the editor or scroll sideways, both of which waste the little
 * vertical room there is, so this gives a compact way to reach every section
 * from the top bar.
 */
export function SectionMenu({ tabs, current: initial = tabs[0]?.id, onSelect }) {
  let current = initial
  const root = document.createElement('div')
  root.className = 'adm-menu'

  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'adm-menu-trigger'
  trigger.setAttribute('aria-haspopup', 'listbox')
  trigger.setAttribute('aria-expanded', 'false')

  const triggerIcon = document.createElement('i')
  const triggerLabel = document.createElement('span')
  triggerLabel.className = 'adm-menu-trigger-label'
  const triggerChevron = document.createElement('i')
  triggerChevron.className = 'fas fa-chevron-down adm-menu-chevron'

  trigger.appendChild(triggerIcon)
  trigger.appendChild(triggerLabel)
  trigger.appendChild(triggerChevron)

  const list = document.createElement('div')
  list.className = 'adm-menu-list'
  list.setAttribute('role', 'listbox')
  list.setAttribute('aria-label', 'Dashboard sections')

  root.appendChild(trigger)
  root.appendChild(list)

  const items = new Map()

  for (const tab of tabs) {
    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'adm-menu-item'
    item.setAttribute('role', 'option')
    item.dataset.id = tab.id

    item.appendChild(<i class={tab.icon}></i>)

    const label = document.createElement('span')
    label.className = 'adm-menu-item-label'
    label.textContent = tab.label
    item.appendChild(label)

    const badge = document.createElement('span')
    badge.className = 'adm-tab-badge'
    item.appendChild(badge)

    item.addEventListener('click', () => {
      close()
      onSelect(tab.id)
    })

    list.appendChild(item)
    items.set(tab.id, { item, badge })
  }

  function paintBadges() {
    const unread = unreadCount()
    for (const { badge } of items.values()) {
      const isMessages = badge.closest('.adm-menu-item')?.dataset.id === 'messages'
      badge.textContent = isMessages && unread > 0 ? String(unread) : ''
      badge.style.display = isMessages && unread > 0 ? 'inline-flex' : 'none'
    }
  }

  function paintSelection() {
    for (const tab of tabs) {
      const entry = items.get(tab.id)
      const active = tab.id === current
      entry.item.classList.toggle('active', active)
      entry.item.setAttribute('aria-selected', String(active))
    }

    const active = tabs.find((tab) => tab.id === current) ?? tabs[0]
    triggerIcon.className = active.icon
    triggerLabel.textContent = active.label
    root.dataset.current = active.id
  }

  let open = false

  function openMenu() {
    if (open) return
    open = true
    root.classList.add('is-open')
    trigger.setAttribute('aria-expanded', 'true')
    document.addEventListener('click', onOutsideClick, true)
    document.addEventListener('keydown', onKeydown, true)
    // Open with the current section in view rather than scrolled to the top.
    const activeItem = items.get(current)?.item
    activeItem?.scrollIntoView?.({ block: 'nearest' })
  }

  function close() {
    if (!open) return
    open = false
    root.classList.remove('is-open')
    trigger.setAttribute('aria-expanded', 'false')
    document.removeEventListener('click', onOutsideClick, true)
    document.removeEventListener('keydown', onKeydown, true)
  }

  const onOutsideClick = (e) => {
    if (!root.contains(e.target)) close()
  }

  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      close()
      trigger.focus()
      return
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return

    e.preventDefault()
    if (!open) {
      openMenu()
      return
    }

    // Move focus through the options.
    const order = tabs.map((tab) => tab.id)
    const focusables = order.map((id) => items.get(id).item)
    const at = focusables.indexOf(document.activeElement)
    const nextIndex =
      e.key === 'ArrowDown'
        ? (at + 1) % focusables.length
        : (at - 1 + focusables.length) % focusables.length
    focusables[nextIndex]?.focus()
  }

  trigger.addEventListener('click', () => {
    if (open) close()
    else openMenu()
  })

  // Enter and Space fire click natively, but the arrow keys do not. Without
  // this a keyboard user could not open the menu at all.
  trigger.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    openMenu()
    // Put focus on the current section so the next arrow press moves from there.
    items.get(current)?.item?.focus()
  })

  const unsubscribe = subscribeMessages(() => {
    if (!root.isConnected) {
      unsubscribe()
      return
    }
    paintBadges()
  })

  paintSelection()
  paintBadges()

  // The dashboard never re-renders itself, so it needs a way to tell the menu
  // the selection changed. Rebuilding the whole menu on every tab switch would
  // throw away an open menu and its listeners.
  root.update = (nextCurrent) => {
    current = nextCurrent
    paintSelection()
  }

  return root
}