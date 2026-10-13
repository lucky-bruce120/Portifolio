import { exportJson, importJson, resetToDefaults } from '../../store/contentStore.js'
import { PanelHeader, PanelSection } from '../components/Panel.jsx'

export function DataPanel() {
  const handleDownload = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolio-content.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson())
      flash('Copied to clipboard.')
    } catch {
      flash('Clipboard blocked - use Download instead.')
    }
  }

  const handleImport = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importJson(String(reader.result))
        flash('Content imported successfully.')
      } catch (err) {
        flash(`Import failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (confirm('Reset all content back to the defaults? This cannot be undone.')) {
      resetToDefaults()
      flash('Content reset to defaults.')
    }
  }

  return (
    <>
      <PanelHeader
        title="Content Data"
        subtitle="Your edits live in this browser's local storage. Export regularly to keep a backup."
      />

      <PanelSection
        title="Export"
        hint="Download a JSON snapshot you can commit to git, back up, or import on another device."
      >
        <div class="adm-btn-row">
          <button class="adm-btn adm-btn-primary" onClick={handleDownload}>
            <i class="fas fa-download"></i> Download JSON
          </button>
          <button class="adm-btn adm-btn-ghost" onClick={handleCopy}>
            <i class="fas fa-copy"></i> Copy to clipboard
          </button>
        </div>
      </PanelSection>

      <PanelSection
        title="Import"
        hint="Replaces all current content with the contents of a previously exported file."
      >
        <label class="adm-btn adm-btn-ghost adm-file-btn">
          <i class="fas fa-upload"></i> Choose JSON file
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => handleImport(e.target.files[0])}
          />
        </label>
      </PanelSection>

      <PanelSection title="Reset">
        <button class="adm-btn adm-btn-danger" onClick={handleReset}>
          <i class="fas fa-rotate-left"></i> Reset to defaults
        </button>
      </PanelSection>

      <PanelSection title="How this works">
        <ul class="adm-notes">
          <li>Changes save instantly to this browser and apply to the live preview.</li>
          <li>Content is not shared between browsers or devices.</li>
          <li>
            To make edits permanent for every visitor, export the JSON and replace the
            contents of <code>src/data/defaultContent.js</code> with it.
          </li>
        </ul>
      </PanelSection>
    </>
  )
}

function flash(message) {
  const existing = document.querySelector('.adm-toast')
  existing?.remove()

  const el = document.createElement('div')
  el.className = 'adm-toast'
  el.textContent = message
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3200)
}