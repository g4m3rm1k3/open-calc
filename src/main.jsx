import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Apply saved theme before first paint (avoids flash)
const saved = localStorage.getItem('oc-theme')
if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

// Register service worker — keeps index.html fresh so deploys don't blank the page
if ('serviceWorker' in navigator) {
  function showUpdateBanner(reg) {
    if (document.getElementById('oc-update-banner')) return
    const banner = document.createElement('div')
    banner.id = 'oc-update-banner'
    banner.innerHTML = `
      <span style="flex:1">A new version of OpenCalc is available.</span>
      <button id="oc-reload-btn" style="background:#fff;color:#1d4ed8;border:none;border-radius:6px;padding:4px 12px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap">Reload</button>
      <button onclick="this.parentElement.remove()" style="background:transparent;color:#fff;border:none;font-size:18px;line-height:1;cursor:pointer;padding:0 4px">×</button>
    `
    Object.assign(banner.style, {
      position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: '12px',
      background: '#1d4ed8', color: '#fff',
      padding: '10px 16px', borderRadius: '10px',
      fontSize: '13px', fontFamily: 'sans-serif',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: '99999',
      maxWidth: 'calc(100vw - 32px)',
    })
    document.body.appendChild(banner)
    // Clicking Reload tells the waiting SW to activate, then controllerchange does the reload
    document.getElementById('oc-reload-btn').onclick = () => {
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      else window.location.reload()
    }
  }

  // Once the new SW takes control, reload to pick up fresh assets
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) { refreshing = true; window.location.reload() }
  })

  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').then(reg => {
    // A waiting SW means a new version downloaded while this page was open
    if (reg.waiting) showUpdateBanner(reg)
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing
      newWorker.addEventListener('statechange', () => {
        // installed = downloaded & ready; controller present = there was a previous SW
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner(reg)
        }
      })
    })
  }).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
