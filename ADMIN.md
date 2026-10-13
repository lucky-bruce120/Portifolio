# Content Manager (Admin Dashboard)

An admin dashboard for editing every part of the portfolio without touching code.

## Access

Open **`/#/admin`** in your browser.

**Password: `bruce2026`**

To change it:

1. Run `node -e "console.log(require('crypto').createHash('sha256').update('YOUR-NEW-PASSWORD').digest('hex'))"`
2. Paste the hash into `PASSWORD_HASH` in `src/admin/auth.js`.

> The unlock state lives in `sessionStorage`, so closing the tab locks the dashboard again.

## What you can edit

| Tab | Covers |
| --- | --- |
| Site | Name, initials, tagline, meta description |
| Hero | Badge, greeting, name, description, rotating roles, floating tech badges, CTA buttons, social icons |
| About | Headings, bio paragraphs, stats, quick facts, CV link, experience badge |
| Skills | Headings, skill categories (each with its own nested skill list + percentages), tech stack badges |
| Projects | Headings, project cards: title, description, category, tags, cover gradient, GitHub + live URLs |
| Experience | Headings, timeline entries: date, role, company, description, tech tags |
| Testimonials | Headings, entries: quote, name, role, initials, star rating, avatar gradient |
| Contact | Headings, intro text, submit label, contact cards, social icons |
| Messages | Contact form submissions: read/unread, reply, delete |
| Footer | CTA banner, brand text, link columns, contact line, credit |
| Data | Export, import, reset |

Every list supports **add, edit, reorder (up/down), and delete**, and changes
appear immediately — there is no save button and no page refresh.

Icons are free text. Type any Font Awesome class (`fab fa-github`,
`fas fa-star`, ...) with a live preview, rather than being limited to a
dropdown.

## Live preview

The **Live preview** button in the top bar opens a side-by-side panel showing
the real portfolio. It rebuilds from the same in-memory store as you type, so a
new project or an edited heading shows up straight away.

The preview renders the actual section components, so it can never drift from
what visitors see. Scroll-reveal animations, skill bars, stat counters and the
testimonial slider are flattened to their final state, and the single-instance
behaviours (particles, cursor orbs, typing animation) are left out so they
don't fight with the real page.

## Multiple tabs

If you keep the site open in one tab and the dashboard in another, edits made in
the dashboard are picked up by the site tab automatically, via the browser's
`storage` event. Neither tab needs reloading.

## Adding new features later

Anything I add to the portfolio gets wired into the dashboard as an editable
repeater from the start, so you can add, edit, reorder and delete it yourself.

The pattern to follow for new lists is one object per entry:

```js
// src/data/defaultContent.js
services: [
  { id: 'svc-1', title: 'Web Development', icon: 'fas fa-code', description: '...' }
]
```

```jsx
// src/admin/panels/MyNewPanel.jsx
<Repeater
  label="Services"
  path="services"
  fields={[
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'icon', label: 'Icon', type: 'icon' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 }
  ]}
  itemDefaults={{ title: 'New service', icon: 'fas fa-code', description: '' }}
  addLabel="Add service"
/>
```

Then register the panel in the `TABS` array in `src/admin/AdminApp.jsx`. Field
types available: `text`, `textarea`, `number`, `tags`, `select`, `color`,
`icon`, and `repeater` (for nested lists).

If a list's shape changes in a future release, add a `migrate()` case in
`src/store/contentStore.js` so previously saved content keeps working.

## Messages

The contact form saves submissions. The **Messages** tab lists them as one row
per message showing **only the sender's email address**, with a dot for unread
ones.

Clicking a row opens a dialog with the full details: sender name, email, the
subject, the complete message, and when it arrived. From there:

- **Reply in Gmail** - opens Gmail's own compose window with the recipient, a
  `Re:` subject and the original message quoted, so you never leave Gmail
- **Other mail app** - a plain `mailto:` fallback for non-Gmail addresses
- Mark read / unread, or delete the message
- Close with the ✕, by clicking outside, or with `Escape`

Messages are ordered newest first and appear without refreshing. There's also a
per-message unread count badge on the Messages tab.

### Important limitation

Messages are stored in **your browser's localStorage**, exactly like content.
This means:

- Only you can see them, and only in the browser you submitted from.
- A visitor who fills in the form on their own machine saves the message to
  **their** browser, not yours. **You will not receive their message.**

So this is genuinely useful for testing the flow and for messages submitted in
your own browser, but it is **not** a real inbox for real enquiries.

For that you need one of:

| Option | What you do | Cost |
| --- | --- | --- |
| **Formspree / Web3Forms / Basin** | Paste an endpoint URL, no backend | Free tier available |
| **Email via SMTP service** | Serverless function that sends mail | Free tier |
| **Supabase / Firebase** | Store messages in a real database, read them anywhere | Free tier |

Any of these is a small change on top of what is already here - the form
already collects and validates the data. Say the word and I'll wire one up.

## How saving works

Edits save instantly to this browser's `localStorage` under `portfolio:content:v1`.

**Content is not shared between browsers or devices**, and visitors see the
defaults from `src/data/defaultContent.js` — not your local edits.

### Making edits live for everyone

This is the important part. Since there is no backend, the published site reads
the defaults baked into the bundle:

1. In the dashboard, go to the **Data** tab and click **Download JSON**.
2. Overwrite `src/data/defaultContent.js` with the exported content, keeping the
   `export const defaultContent = ...` shape.
3. Rebuild and redeploy.

That makes your edits permanent for all visitors.

## Security note

The password check runs entirely in the browser and the hash is embedded in the
JavaScript bundle. This deters casual visitors but is **not real security** —
someone determined could read the hash from the source and brute-force it. It is
the right trade-off for a static personal site with no server; real protection
needs a backend.

## Architecture

```
src/
  data/defaultContent.js   All default content (single source of truth)
  store/contentStore.js    Observable store + localStorage + import/export
  main.jsx                 Router + render loop + behaviour init
  sections/*.jsx           Public portfolio, reads from the store
  admin/
    auth.js                Password gate (SHA-256 + sessionStorage)
    AdminApp.jsx           Dashboard shell, sidebar, tab routing
    components/Fields.jsx  Generic field controls + self-refreshing Repeater
    components/LivePreview.jsx  Side-by-side preview of the real markup
    panels/*.jsx           One panel per content area
js/*.js                    Behaviour modules, each exports init() -> cleanup()
```

### How updates stay instant without losing your place

The dashboard is never re-rendered wholesale, because that would drop input
focus and reset the open tab. Instead:

- Each `Repeater` owns its DOM and subscribes to the store. It repaints only when
  the **shape** of its list changes (add / delete / move / import / reset).
  Typing in a field is a value change, so the inputs are left untouched and only
  the heading text is refreshed.
- Newly added entries open automatically; existing ones keep the open/collapsed
  state you left them in.
- Components unsubscribe themselves once detached, so switching tabs doesn't
  leak listeners.
- `LivePreview` repaints on every change, coalesced to one repaint per frame.

The behaviour modules in `js/` were converted from top-level side effects into
`initX() -> cleanup()` functions so they can be re-run after each re-render
without stacking listeners or animation loops.

## Tests

```bash
npm test
```

- `test/contentStore.test.js` — content schema, CRUD, persistence, migrations
- `test/responsive.test.js` — static analysis of the public stylesheet:
  breakpoints, fluid sizing, viewport meta, touch targets, landscape and
  reduced-motion rules
- `test/admin-responsive.test.js` — the same checks for the dashboard: the
  breakpoint ladder, `dvh` chrome, dialog scroll behaviour, touch target sizes,
  the dropdown and the tablet/phone/landscape layouts
- `test/section-menu.test.js` — the dropdown: opening, selecting, keyboard
  navigation, outside clicks and the unread badge
- `test/testimonials.test.js` — the slider: dots, swipe, wrapping, hover pause
  and cleanup
- `test/render.test.js` — every section renders and reflects store edits
- `test/admin.test.js` — repeaters repaint on add/delete/reorder, keep inputs
  alive while typing, preserve open state, and the preview updates live
- `test/admin-shell.test.js` — the dashboard shell, tab switching, live preview
- `test/messages.test.js` — contact form validation, storage, and the message
  dialog including the Gmail reply link

The `.jsx` tests run through Vite (`test/run-vite-test.mjs`) so they are
transformed exactly the way the app builds them, against a small DOM shim
(`test/dom-shim.js`).

## Responsive design

Breakpoints: **1400, 1100, 1024, 900, 768, 640, 480, 400, 360px**, plus a
landscape-phone rule and coarse-pointer/reduced-motion queries.

Key ideas:

- **Fluid over breakpoints.** Headings, section padding and the avatar use
  `clamp()`, so they scale continuously instead of jumping between fixed sizes.
- **`dvh` everywhere `vh` was.** Mobile browsers shrink the viewport when the
  address bar hides; `100vh` sizes elements behind it. Every `100vh` has a
  `100dvh` override (a test enforces this).
- **Touch targets.** Icons, slider dots and filters grow on coarse pointers, and
  the dashboard's icon buttons are 40px on phones.
- **Nothing overflows.** Drawer width is `min(300px, 86vw)`, long emails wrap,
  and the editor grid uses `minmax(0, 1fr)` so long field values cannot force a
  horizontal scrollbar.
- **Landscape phones** get a shorter hero so content isn't cut off.

### Touch-specific behaviour

Three things behave differently on a real touch device, all under
`@media (pointer: coarse)`:

- **Project links stay visible.** They appear on `:hover`, which never fires on
  touch, so the GitHub and live-demo links would otherwise be unreachable on a
  phone. The overlay is shown permanently on coarse pointers instead.
- **No stuck hover.** Cards that lift on hover would stay lifted after a tap, so
  touch devices use `:active` press feedback rather than hover transforms.
- **Larger targets.** Slider dots, filter buttons and hamburger all grow on
  coarse pointers.

### Admin dashboard

Breakpoints: **1400, 1100, 900, 640, 400, 360px**, plus coarse-pointer and
landscape blocks.

- **Above 1400px** the live preview gets its own column beside the editor.
- **Below 1100px** it stacks underneath, because three columns stop being
  readable at that width.
- **Below 900px** the sidebar unsticks to the top and the tabs become a
  horizontal strip.
- **Below 640px** that strip is hidden and the **section dropdown** takes over,
  which frees the vertical space for the editor. The topbar stacks and its
  buttons go full width, and the message dialog becomes a bottom sheet.
- **Below 400px** tab padding tightens and tab icons drop out.
- **Below 360px** the topbar stacks fully, the dropdown goes full width, the
  subtitle hides and icon buttons shrink to 34px.

#### Section dropdown

A dropdown in the topbar showing the current section, with all eleven listed,
their icons, and the unread count on Messages. Use it when the sidebar is
cramped or you just want to jump.

- `aria-expanded` / `aria-haspopup` on the trigger, `role="listbox"` with
  `role="option"` children and `aria-selected` on the active one
- Opens with `Enter`, `Space` **or the arrow keys**, so it is reachable without
  a mouse
- `ArrowUp` / `ArrowDown` move between options, `Escape` closes and returns
  focus to the trigger
- Clicking outside closes it; the list caps its height and scrolls

#### Touch targets

The icon buttons in repeater rows and the message dialog are 28px on desktop,
workable with a mouse and painful with a thumb. On coarse pointers they grow to
38px and everything gets press feedback.

#### Landscape phones

Below 480px tall in landscape the padding tightens and the dropdown list caps
its height, since vertical space is the scarce resource.

**Live preview scaling.** The preview renders the portfolio at a fixed 1280px
design width and is scaled down with a transform to fit whatever space the pane
has, so the proportions stay recognisable on a phone instead of reflowing into
an unreadable narrow column. It re-fits on window resize.

### Testimonials on mobile

The slider is swipeable (pointer events, so mouse and touch both work), pauses
auto-advance while you hover or drag, and supports arrow-key navigation for
desktop. Dragging follows your finger and settles on the nearest slide, wrapping
at both ends.

### Contact badges on mobile

Below 768px the three contact cards become tap-friendly rows: icon on the left,
label and value stacked to its right, left-aligned, with a chevron on the ones
that actually link somewhere (email and phone). Tapping one opens the mail app
or dials the number.