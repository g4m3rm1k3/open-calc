const SUCRASE_URL = 'https://esm.sh/sucrase@3?bundle'

export const SANDBOX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#0f172a;line-height:1.5}
  #app{padding:20px;min-height:100vh}
  h1,h2,h3{margin:0 0 12px;font-weight:700}
  ul,ol{padding-left:20px;margin:8px 0}
  li{margin:4px 0}
  a{color:#2563eb;text-decoration:none}
  a:hover{text-decoration:underline}
  button{cursor:pointer;padding:8px 16px;border-radius:6px;border:none;background:#2563eb;color:#fff;font-size:14px;font-weight:600}
  button:hover{background:#1d4ed8}
  input,textarea{width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;outline:none}
  input:focus,textarea:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.1)}
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
