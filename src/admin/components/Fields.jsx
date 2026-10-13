import { getIn, setIn, pushTo, removeAt, moveIn, makeId, subscribe } from '../../store/contentStore.js'

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export function Field({ label, hint, children, id }) {
  return (
    <div class="adm-field">
      {label && <label class="adm-label" for={id}>{label}</label>}
      {children}
      {hint && <p class="adm-hint">{hint}</p>}
    </div>
  )
}

export function TextInput({ path, value, placeholder, type = 'text', id }) {
  const handle = (e) => setIn(path, e.target.value)
  return (
    <input
      id={id}
      class="adm-input"
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onInput={handle}
    />
  )
}

export function TextArea({ path, value, rows = 4, placeholder, id }) {
  const handle = (e) => setIn(path, e.target.value)
  return (
    <textarea
      id={id}
      class="adm-input adm-textarea"
      rows={rows}
      value={value ?? ''}
      placeholder={placeholder}
      onInput={handle}
    ></textarea>
  )
}

export function NumberInput({ path, value, min = 0, max = 100, id }) {
  const handle = (e) => {
    let next = parseInt(e.target.value, 10)
    if (Number.isNaN(next)) next = 0
    next = Math.max(min, Math.min(max, next))
    setIn(path, next)
  }
  return (
    <input
      id={id}
      class="adm-input adm-number"
      type="number"
      min={min}
      max={max}
      value={value ?? 0}
      onInput={handle}
    />
  )
}

export function SelectInput({ path, value, options, id }) {
  const handle = (e) => setIn(path, e.target.value)
  return (
    <select id={id} class="adm-input" value={value ?? ''} onInput={handle}>
      {options.map((opt) => (
        <option value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function ColorInput({ path, value }) {
  const handle = (e) => setIn(path, e.target.value)
  return (
    <div class="adm-color">
      <input type="color" class="adm-color-swatch" value={normalizeHex(value)} onInput={handle} />
      <input class="adm-input" type="text" value={value ?? ''} onInput={handle} />
    </div>
  )
}

function normalizeHex(value) {
  if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) return value
  return '#6366f1'
}

// ---------------------------------------------------------------------------
// Tags: comma separated string in, array out
// ---------------------------------------------------------------------------

export function TagsInput({ path, value }) {
  const handle = (e) => {
    const list = e.target.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    setIn(path, list)
  }

  return (
    <>
      <input
        class="adm-input"
        type="text"
        value={(value ?? []).join(', ')}
        placeholder="React, TypeScript, Tailwind"
        onInput={handle}
      />
      <p class="adm-hint">Separate tags with commas.</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// ListTextArea: one entry per line, stored as a real array.
// ---------------------------------------------------------------------------

export function ListTextArea({ path, value, rows = 5, placeholder, id }) {
  const handle = (e) => {
    const list = e.target.value.split('\n').map((line) => line.trim())
    setIn(path, e.target.value.includes('\n\n') ? list : list.filter(Boolean))
  }

  return (
    <>
      <textarea
        id={id}
        class="adm-input adm-textarea adm-textarea-mono"
        rows={rows}
        value={(value ?? []).join('\n')}
        placeholder={placeholder}
        onInput={handle}
      ></textarea>
      <p class="adm-hint">One entry per line. Empty lines are ignored.</p>
    </>
  )
}

// ---------------------------------------------------------------------------
// Bound field helpers - bind a control to a path inside the content store
// ---------------------------------------------------------------------------

export function BoundText({ label, path, placeholder, hint, type }) {
  return (
    <Field label={label} hint={hint} id={path}>
      <TextInput id={path} path={path} value={getIn(path)} placeholder={placeholder} type={type} />
    </Field>
  )
}

export function BoundTextArea({ label, path, rows, placeholder, hint }) {
  return (
    <Field label={label} hint={hint} id={path}>
      <TextArea id={path} path={path} value={getIn(path)} rows={rows} placeholder={placeholder} />
    </Field>
  )
}

export function BoundNumber({ label, path, min, max, hint }) {
  return (
    <Field label={label} hint={hint} id={path}>
      <NumberInput id={path} path={path} value={getIn(path)} min={min} max={max} />
    </Field>
  )
}

export function BoundSelect({ label, path, options, hint }) {
  return (
    <Field label={label} hint={hint} id={path}>
      <SelectInput id={path} path={path} value={getIn(path)} options={options} />
    </Field>
  )
}

export function BoundTags({ label, path, hint }) {
  return (
    <Field label={label} hint={hint} id={path}>
      <TagsInput path={path} value={getIn(path)} />
    </Field>
  )
}

export function BoundList({ label, path, rows, hint, placeholder }) {
  return (
    <Field label={label} hint={hint} id={path}>
      <ListTextArea id={path} path={path} value={getIn(path)} rows={rows} placeholder={placeholder} />
    </Field>
  )
}

export function BoundColor({ label, path, hint }) {
  return (
    <Field label={label} hint={hint} id={path}>
      <ColorInput path={path} value={getIn(path)} />
    </Field>
  )
}

// ---------------------------------------------------------------------------
// Repeater: the generic list editor used for projects, experience, stats, etc.
//
// `fields` describes the editor for a single item:
//   [{ name: 'title', label: 'Title', type: 'text' | 'textarea' | 'number' |
//     'tags' | 'select' | 'color' | 'icon', rows, options, min, max, hint }]
// ---------------------------------------------------------------------------

// Icon input: free text so any Font Awesome class works, with a datalist of
// common icons for convenience and a live preview.
const ICON_CHOICES = [
  'fab fa-github',
  'fab fa-linkedin-in',
  'fab fa-x-twitter',
  'fab fa-dribbble',
  'fab fa-codepen',
  'fab fa-facebook',
  'fab fa-instagram',
  'fab fa-xing',
  'fab fa-whatsapp',
  'fab fa-telegram',
  'fab fa-react',
  'fab fa-js',
  'fab fa-node-js',
  'fab fa-html5',
  'fab fa-css3-alt',
  'fab fa-figma',
  'fab fa-docker',
  'fas fa-envelope',
  'fas fa-phone',
  'fas fa-location-dot',
  'fas fa-code',
  'fas fa-paint-brush',
  'fas fa-server',
  'fas fa-star',
  'fas fa-link',
  'fas fa-arrow-right',
  'fas fa-circle'
]

export function IconInput({ path, value, id }) {
  const listId = `adm-icon-list-${String(path).replace(/[^a-z0-9]/gi, '-')}`

  return (
    <div class="adm-icon-row">
      <span class="adm-icon-preview">
        <i class={value || 'fas fa-question'}></i>
      </span>
      <input
        id={id}
        class="adm-input"
        type="text"
        list={listId}
        value={value ?? ''}
        placeholder="fab fa-github"
        onInput={(e) => setIn(path, e.target.value)}
      />
      <datalist id={listId}>
        {ICON_CHOICES.map((icon) => <option value={icon}>{icon}</option>)}
      </datalist>
    </div>
  )
}

export function Repeater({
  label,
  path,
  fields,
  itemDefaults = {},
  titleKey = 'title',
  addLabel = 'Add item',
  emptyText = 'No items yet.',
  collapsible = true
}) {
  // The repeater owns a stable container and repaints its own contents instead
  // of waiting for a full dashboard re-render. That is what makes add / delete
  // / reorder appear instantly, while typing inside a field never rebuilds the
  // node the user is focused on.
  const container = document.createElement('div')
  container.className = 'adm-repeater'

  let signature = null
  let painted = false
  let knownIds = new Set()
  let summaryNodes = []

  function paint() {
    // Array.from, not .map: querySelectorAll returns a NodeList.
const openIds = new Set(
      Array.from(container.querySelectorAll('details.adm-item[open]'))
        .map((node) => node.getAttribute('data-id'))
        .filter(Boolean)
    )
    const previousIds = knownIds

    const items = getIn(path) ?? []
    knownIds = new Set(items.map((item, i) => item?.id ?? `index-${i}`))

    container.textContent = ''
    summaryNodes = []

    if (label) {
      const head = document.createElement('div')
      head.className = 'adm-repeater-head'
      head.appendChild(<h4 class="adm-subhead">{label}</h4>)
      head.appendChild(<span class="adm-count">{String(items.length)}</span>)
      container.appendChild(head)
    }

    if (items.length === 0) {
      container.appendChild(<p class="adm-empty">{emptyText}</p>)
    }

    const list = document.createElement('div')
    list.className = 'adm-repeater-list'

    items.forEach((item, index) => {
      const id = item?.id ?? `index-${index}`

      let open
      if (!painted) {
        // First paint: short lists open for convenience, long ones collapsed.
        open = !collapsible || items.length <= 2
      } else if (previousIds.has(id)) {
        // Existing entry: keep whatever state the user left it in.
        open = openIds.has(id)
      } else {
        // Newly added entry: open, so it can be typed into straight away.
        open = true
      }

      const node = repeaterItem({ path, index, item, fields, titleKey, total: items.length, open })
      summaryNodes.push({ node, titleKey, index })
      list.appendChild(node)
    })

    container.appendChild(list)

    container.appendChild(
      <button
        class="adm-btn adm-btn-ghost adm-btn-block"
        onClick={() => pushTo(path, { id: makeId(path.split('.').pop()), ...itemDefaults })}
      >
        <i class="fas fa-plus"></i> {addLabel}
      </button>
    )

    painted = true
  }

  // A structural change (add, delete, move, import, reset) rebuilds the list.
  // A value change only refreshes the headings, so inputs keep focus.
  const unsubscribe = subscribe(() => {
    if (!container.isConnected) {
      unsubscribe()
      return
    }

    const items = getIn(path) ?? []
    const next = signatureOf(items)

    if (next !== signature) {
      signature = next
      paint()
      return
    }

    // Read the current item by index: the store hands back fresh objects on
    // every write, so anything captured earlier is already stale.
    for (const { node, titleKey, index } of summaryNodes) {
      const heading = headingFor(items[index], titleKey, index)
      const el = node.querySelector('.adm-item-title')
      if (el && el.textContent !== heading) el.textContent = heading
    }
  })

  signature = signatureOf(getIn(path) ?? [])
  paint()

  return container
}

// Identity of a list's shape: how many entries, and which ones in which order.
// Value-only edits leave this unchanged, which is how we tell a structural
// change (needs a repaint) from typing (must not repaint).
function signatureOf(items) {
  return items.map((item, i) => `${i}:${item?.id ?? ''}`).join('|')
}

function headingFor(item, titleKey, index) {
  return String(item?.[titleKey] ?? '').trim() || `Item ${index + 1}`
}

function repeaterItem({ path, index, item, fields, titleKey, total, open }) {
  const itemPath = `${path}.${index}`
  const heading = headingFor(item, titleKey, index)
  const id = item.id ?? `index-${index}`
  // Newly added entries open so you can type straight into them; existing
  // entries keep whatever state the user left them in.
  return (
    <details class="adm-item" open={open} data-id={id}>
      <summary class="adm-item-summary">
        <span class="adm-item-title">{heading}</span>
        <span class="adm-item-tools" onClick={(e) => e.preventDefault()}>
          <button
            class="adm-icon-btn"
            title="Move up"
            disabled={index === 0}
            onClick={() => moveIn(path, index, index - 1)}
          >
            <i class="fas fa-arrow-up"></i>
          </button>
          <button
            class="adm-icon-btn"
            title="Move down"
            disabled={index === total - 1}
            onClick={() => moveIn(path, index, index + 1)}
          >
            <i class="fas fa-arrow-down"></i>
          </button>
          <button
            class="adm-icon-btn adm-icon-danger"
            title="Delete"
            onClick={() => {
              if (confirm('Delete this item? This cannot be undone.')) removeAt(path, index)
            }}
          >
            <i class="fas fa-trash"></i>
          </button>
        </span>
      </summary>

      <div class="adm-item-body">
        {fields.map((field) => (
          <BoundField
            key={field.name}
            path={`${itemPath}.${field.name}`}
            {...field}
          />
        ))}
      </div>
    </details>
  )
}

function BoundField({ path, label, type, rows, options, min, max, hint, placeholder, fields, itemDefaults, titleKey, addLabel }) {
  switch (type) {
    case 'repeater':
      return (
        <div class="adm-nested">
          <Repeater
            label={label}
            path={path}
            fields={fields}
            itemDefaults={itemDefaults}
            titleKey={titleKey}
            addLabel={addLabel}
          />
        </div>
      )
    case 'textarea':
      return <BoundTextArea label={label} path={path} rows={rows ?? 4} hint={hint} placeholder={placeholder} />
    case 'number':
      return <BoundNumber label={label} path={path} min={min ?? 0} max={max ?? 100} hint={hint} />
    case 'tags':
      return <BoundTags label={label} path={path} hint={hint} />
    case 'color':
      return <BoundColor label={label} path={path} hint={hint} />
    case 'select':
      return <BoundSelect label={label} path={path} options={options} hint={hint} />
    case 'icon':
      return (
        <Field label={label} hint={hint} id={path}>
          <IconInput id={path} path={path} value={getIn(path)} />
        </Field>
      )
    default:
      return <BoundText label={label} path={path} placeholder={placeholder} hint={hint} />
  }
}