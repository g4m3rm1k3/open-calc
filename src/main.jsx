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
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {})
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'SW_UPDATED') {
      // Show a non-intrusive banner instead of forcibly reloading mid-session
      const banner = document.createElement('div')
      banner.id = 'oc-update-banner'
      banner.innerHTML = `
        <span style="flex:1">A new version of OpenCalc is available.</span>
        <button onclick="window.location.reload()" style="background:#fff;color:#1d4ed8;border:none;border-radius:6px;padding:4px 12px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap">Reload</button>
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
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
