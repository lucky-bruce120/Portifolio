import {
  getInstallState,
  onInstallStateChange,
  promptInstall
} from '../../pwa/installPrompt.js'

/**
 * The dashboard's "Install Dashboard App" button.
 *
 * Renders nothing at all until the browser fires `beforeinstallprompt`, so a
 * browser that cannot install - or a visitor who has already installed, or who
 * dismissed the prompt - never sees any installation UI.
 *
 * This component is only ever mounted inside AdminApp, which only renders on
 * the dashboard route, so it cannot appear on the public portfolio.
 */
export function InstallButton() {
  const host = document.createElement('div')
  host.className = 'adm-install'

  let busy = false

  const paint = (state) => {
    const show = state.canInstall

    host.textContent = ''
    host.style.display = show ? '' : 'none'
    if (!show) return

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'adm-btn adm-btn-install'
    btn.disabled = busy
    btn.textContent = busy ? 'Installing…' : 'Install Dashboard App'

    const icon = document.createElement('i')
    icon.className = 'fas fa-download'
    btn.prepend(icon)

    btn.addEventListener('click', async () => {
      if (busy) return
      busy = true
      paint(getInstallState())

      await promptInstall()

      busy = false
      // promptInstall notifies subscribers when the state changes, but returns
      // 'unavailable' without notifying - repaint so the button cannot be left
      // stuck on "Installing…".
      if (host.isConnected) paint(getInstallState())
    })

    host.appendChild(btn)
  }

  const unsubscribe = onInstallStateChange((state) => {
    if (!host.isConnected) {
      unsubscribe()
      return
    }
    paint(state)
  })

  paint(getInstallState())

  return host
}