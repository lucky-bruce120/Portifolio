export function PanelHeader({ title, subtitle }) {
  return (
    <div class="adm-panel-head">
      <h2 class="adm-panel-title">{title}</h2>
      {subtitle && <p class="adm-panel-sub">{subtitle}</p>}
    </div>
  )
}

export function PanelSection({ title, hint, children }) {
  return (
    <section class="adm-section">
      {title && <h3 class="adm-section-title">{title}</h3>}
      {hint && <p class="adm-section-hint">{hint}</p>}
      {children}
    </section>
  )
}