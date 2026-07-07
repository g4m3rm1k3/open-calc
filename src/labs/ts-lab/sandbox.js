const SUCRASE_URL = 'https://esm.sh/sucrase@3?bundle'

export const SANDBOX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{
    --primary:#2563eb;--primary-dark:#1d4ed8;--primary-light:#eff6ff;
    --success:#10b981;--danger:#ef4444;--warning:#f59e0b;
    --bg:#f8fafc;--surface:#ffffff;--surface2:#f1f5f9;
    --border:#e2e8f0;--border-strong:#cbd5e1;
    --text:#0f172a;--text-muted:#64748b;--text-subtle:#94a3b8;
    --radius:10px;--radius-sm:6px;--radius-lg:16px;
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);
    --shadow-md:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);
    --shadow-lg:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;font-size:15px;-webkit-font-smoothing:antialiased}
  #app{min-height:100vh}

  /* Layout */
  .nav{background:var(--surface);border-bottom:1px solid var(--border);padding:0 20px;display:flex;align-items:center;height:56px;gap:12px;position:sticky;top:0;z-index:100;box-shadow:var(--shadow)}
  .nav-brand{font-size:18px;font-weight:800;color:var(--primary);letter-spacing:-0.03em;flex:1}
  .nav-actions{display:flex;align-items:center;gap:8px}
  .container{max-width:600px;margin:0 auto;padding:20px}
  .page{padding:24px 20px;max-width:600px;margin:0 auto}

  /* Cards */
  .card{background:var(--surface);border-radius:var(--radius);padding:18px 20px;box-shadow:var(--shadow);margin-bottom:12px;transition:box-shadow 0.15s,transform 0.15s;border:1px solid transparent}
  .card:hover{box-shadow:var(--shadow-md)}
  .card-clickable{cursor:pointer}
  .card-clickable:hover{border-color:var(--primary);transform:translateY(-1px)}

  /* Buttons */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 18px;border-radius:var(--radius-sm);border:none;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;font-family:inherit}
  .btn-primary{background:var(--primary);color:#fff}
  .btn-primary:hover{background:var(--primary-dark)}
  .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text)}
  .btn-ghost:hover{background:var(--surface2);border-color:var(--border-strong)}
  .btn-danger{background:transparent;border:1px solid #fca5a5;color:var(--danger)}
  .btn-sm{padding:5px 12px;font-size:13px}
  .btn-icon{padding:8px;border-radius:var(--radius-sm)}

  /* Forms */
  .form-group{margin-bottom:18px}
  label{display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px}
  .input{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;font-family:inherit;outline:none;background:var(--surface);color:var(--text);transition:border-color 0.15s,box-shadow 0.15s}
  .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(37,99,235,0.1)}
  textarea.input{resize:vertical;min-height:100px}

  /* Typography */
  .title-lg{font-size:26px;font-weight:800;letter-spacing:-0.03em;line-height:1.2}
  .title-md{font-size:18px;font-weight:700;line-height:1.3}
  .title-sm{font-size:15px;font-weight:600;line-height:1.4}
  .body-text{color:var(--text-muted);font-size:14px;line-height:1.65}
  .caption{font-size:12px;color:var(--text-subtle)}

  /* Badges and tags */
  .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.02em}
  .badge-blue{background:var(--primary-light);color:var(--primary)}
  .badge-green{background:#dcfce7;color:#166534}
  .badge-gray{background:var(--surface2);color:var(--text-muted)}
  .tag{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;background:var(--surface2);color:var(--text-muted);border:1px solid var(--border)}

  /* Avatar */
  .avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700;color:#fff;flex-shrink:0}
  .avatar-sm{width:28px;height:28px;font-size:11px}
  .avatar-md{width:36px;height:36px;font-size:14px}
  .avatar-lg{width:48px;height:48px;font-size:18px}

  /* Skeleton loading */
  .skeleton{background:linear-gradient(90deg,var(--surface2) 25%,var(--border) 50%,var(--surface2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:var(--radius-sm)}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* Empty and loading states */
  .empty-state{text-align:center;padding:60px 20px;color:var(--text-muted)}
  .empty-icon{font-size:44px;margin-bottom:12px}
  .empty-title{font-size:17px;font-weight:600;color:var(--text);margin-bottom:6px}
  .empty-body{font-size:14px;color:var(--text-muted)}

  /* Divider */
  hr{border:none;border-top:1px solid var(--border);margin:16px 0}

  /* Alert */
  .alert{padding:12px 16px;border-radius:var(--radius-sm);font-size:14px;margin-bottom:16px}
  .alert-error{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5}
  .alert-success{background:#dcfce7;color:#166534;border:1px solid #bbf7d0}
  .alert-info{background:var(--primary-light);color:#1e40af;border:1px solid #bfdbfe}

  /* Utilities */
  .flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:space-between}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}
  .mt-1{margin-top:4px}.mt-2{margin-top:8px}.mt-3{margin-top:12px}.mt-4{margin-top:16px}.mt-6{margin-top:24px}
  .mb-1{margin-bottom:4px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-6{margin-bottom:24px}
  a{color:var(--primary);text-decoration:none}a:hover{text-decoration:underline}
</style>
</head>
<body>
<div id="app"></div>
<div id="__err__" style="position:fixed;bottom:0;left:0;right:0;background:#fee2e2;color:#991b1b;font:13px/1.5 monospace;padding:8px 12px;display:none;white-space:pre-wrap;z-index:9999;max-height:40%;overflow:auto"></div>
<script type="module">
const _sendMsg = (msg) => parent.postMessage(msg, '*')

// ── Console intercept ─────────────────────────────────────────────────────────
const _log = console.log
const _warn = console.warn
const _err = console.error
const _fmtArgs = args => args.map(a => { try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a) } catch { return String(a) } })
console.log   = (...a) => { _log(...a);  _sendMsg({ type: 'console', level: 'log',   args: _fmtArgs(a) }) }
console.warn  = (...a) => { _warn(...a); _sendMsg({ type: 'console', level: 'warn',  args: _fmtArgs(a) }) }
console.error = (...a) => { _err(...a);  _sendMsg({ type: 'console', level: 'error', args: _fmtArgs(a) }) }

// ── Fetch intercept ───────────────────────────────────────────────────────────
const _origFetch = window.fetch.bind(window)
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input?.url ?? String(input))
  const method = (init?.method ?? (typeof input !== 'string' ? input?.method : null) ?? 'GET').toUpperCase()
  _sendMsg({ type: 'event', kind: 'fetch-start', url, method, ts: Date.now() })
  const t0 = Date.now()
  try {
    const res = await _origFetch(input, init)
    _sendMsg({ type: 'event', kind: 'fetch-done', url, method, status: res.status, ms: Date.now() - t0, ts: Date.now() })
    return res
  } catch(e) {
    _sendMsg({ type: 'event', kind: 'fetch-error', url, method, error: e.message, ts: Date.now() })
    throw e
  }
}

// ── Click intercept ───────────────────────────────────────────────────────────
document.addEventListener('click', e => {
  const el = e.target
  const tag = el.tagName?.toLowerCase() ?? 'unknown'
  const text = el.textContent?.trim().slice(0, 40) ?? ''
  _sendMsg({ type: 'event', kind: 'click', tag, text, ts: Date.now() })
}, true)

// ── DOM mutation tracking ─────────────────────────────────────────────────────
let _domTimer = null
const _obs = new MutationObserver(muts => {
  let added = 0; let removed = 0
  for (const m of muts) { added += m.addedNodes.length; removed += m.removedNodes.length }
  if (added + removed === 0) return
  clearTimeout(_domTimer)
  _domTimer = setTimeout(() => {
    _sendMsg({ type: 'event', kind: 'dom-update', added, removed, ts: Date.now() })
  }, 16)
})

// ── Error handling ────────────────────────────────────────────────────────────
const errBox = document.getElementById('__err__')
window.onerror = (msg, _src, line, col) => {
  const text = line ? \`\${msg}\\n  line \${line}:\${col}\` : msg
  errBox.textContent = text; errBox.style.display = 'block'
  _sendMsg({ type: 'error', message: text })
  return true
}
window.onunhandledrejection = e => {
  const msg = e.reason?.message ?? String(e.reason)
  errBox.textContent = msg; errBox.style.display = 'block'
  _sendMsg({ type: 'error', message: msg })
}

// ── TypeScript stripper (sucrase) ─────────────────────────────────────────────
let _stripTS = null
async function getStripTS() {
  if (_stripTS) return _stripTS
  try {
    const { transform } = await import('${SUCRASE_URL}')
    _stripTS = code => transform(code, { transforms: ['typescript'] }).code
  } catch(_) {
    _stripTS = code => {
      let s = code.replace(/^\\s*import\\s+type\\s+[^\\n]+/gm, '')
      s = s.replace(/^\\s*(interface|type)\\s+\\w[\\s\\S]*?^}/gm, '')
      s = s.replace(/!(?=[;,\\)\\]\\s\\n])/g, '')
      return s
    }
  }
  return _stripTS
}

// ── Run ───────────────────────────────────────────────────────────────────────
let _prevUrl = null

async function run(code) {
  _obs.disconnect()
  errBox.style.display = 'none'; errBox.textContent = ''
  document.getElementById('app').innerHTML = ''
  if (_prevUrl) { URL.revokeObjectURL(_prevUrl); _prevUrl = null }

  const stripTS = await getStripTS()
  let js
  try { js = stripTS(code) }
  catch(e) { _sendMsg({ type: 'error', message: 'TypeScript parse error: ' + e.message }); return }

  const wrapped = \`(async () => {\\n\${js}\\n})()\`
  const url = URL.createObjectURL(new Blob([wrapped], { type: 'text/javascript' }))
  _prevUrl = url
  _obs.observe(document.body, { childList: true, subtree: true })
  try {
    await import(url)
    _sendMsg({ type: 'ready' })
  } catch(e) {
    _sendMsg({ type: 'error', message: e.message ?? String(e) })
  }
}

window.addEventListener('message', ({ data }) => {
  if (data?.type === 'run') run(data.code).catch(e => _sendMsg({ type: 'error', message: String(e) }))
})
_sendMsg({ type: 'sandbox-ready' })
</script>
</body>
</html>`
