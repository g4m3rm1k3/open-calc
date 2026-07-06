// The iframe srcdoc for the Vue Studio runtime.
// Receives: postMessage({ type:'run', files: { 'src/App.vue': '...', 'src/main.ts': '...' } })
// Compiles each .vue file via @vue/compiler-sfc (loaded from CDN), resolves imports,
// mounts the app, and sends component tree + console output back to the parent.

const VUE_URL = 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
const SFC_COMPILER_URL = 'https://cdn.jsdelivr.net/npm/@vue/compiler-sfc@3/dist/compiler-sfc.esm-browser.js'
const SUCRASE_URL = 'https://esm.sh/sucrase@3?bundle'

// Resolve a relative import path against the importer's directory.
// e.g. resolve('./Counter.vue', 'src/components/') → 'src/components/Counter.vue'
function resolvePath(importee, importer) {
  if (!importee.startsWith('.')) return importee
  const dir = importer.includes('/') ? importer.slice(0, importer.lastIndexOf('/') + 1) : ''
  const parts = (dir + importee).split('/')
  const resolved = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return resolved.join('/')
}

// Rewrite `import ... from 'vue'` and `import ... from './Foo.vue'` in compiled JS.
function rewriteImports(code, importer, moduleMap) {
  return code
    .replace(/from\s+['"]vue['"]/g, `from '${VUE_URL}'`)
    .replace(/from\s+['"]([^'"]+\.vue)['"]/g, (_, specifier) => {
      const resolved = resolvePath(specifier, importer)
      const blobUrl = moduleMap[resolved] ?? moduleMap[specifier]
      return blobUrl ? `from '${blobUrl}'` : `from '${specifier}'`
    })
}

export const SANDBOX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style id="__vue_styles__"></style>
</head>
<body>
<div id="app"></div>
<div id="__err__" style="position:fixed;bottom:0;left:0;right:0;background:#fee2e2;color:#991b1b;font:13px/1.5 monospace;padding:8px 12px;display:none;white-space:pre-wrap;z-index:9999;max-height:40%;overflow:auto"></div>
<script type="module">
// ── Console intercept ─────────────────────────────────────────────────────────
const _origLog   = console.log
const _origWarn  = console.warn
const _origError = console.error
const _send = (level, args) =>
  parent.postMessage({ type: 'log', level, args: args.map(a => {
    try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a) } catch { return String(a) }
  })}, '*')
console.log   = (...a) => { _origLog(...a);   _send('log',   a) }
console.warn  = (...a) => { _origWarn(...a);  _send('warn',  a) }
console.error = (...a) => { _origError(...a); _send('error', a) }

// ── Error display ─────────────────────────────────────────────────────────────
const errBox = document.getElementById('__err__')
window.onerror = (msg, _src, line, col) => {
  const text = line ? \`\${msg} (line \${line}:\${col})\` : msg
  errBox.textContent = text
  errBox.style.display = 'block'
  parent.postMessage({ type: 'error', message: text }, '*')
  return true
}
window.onunhandledrejection = e => {
  const msg = e.reason?.message ?? String(e.reason)
  errBox.textContent = msg
  errBox.style.display = 'block'
  parent.postMessage({ type: 'error', message: msg }, '*')
}

// ── Vue DevTools hook (must exist before Vue loads) ───────────────────────────
const _devHook = {
  _apps: [],
  _enabled: true,
  emit(event, ...args) {
    if (event === 'app:init') {
      _devHook._apps.push(args[0])
      // Snapshot the component tree once on mount
      setTimeout(() => {
        try { parent.postMessage({ type: 'tree', tree: snapshotTree(args[0]._instance) }, '*') } catch(_) {}
      }, 50)
    }
  },
  on() {}, off() {}, once() {},
}
window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = _devHook

function snapshotTree(instance) {
  if (!instance) return null
  const name = instance.type?.name ?? instance.type?.__name ?? (instance.type === Object ? 'Anonymous' : 'Component')
  const data = {}
  try {
    if (instance.setupState) {
      for (const [k, v] of Object.entries(instance.setupState)) {
        if (k.startsWith('__')) continue
        try { data[k] = JSON.parse(JSON.stringify(v?.value ?? v)) } catch { data[k] = String(v) }
      }
    }
  } catch(_) {}
  const children = (instance.subTree?.component
    ? [snapshotTree(instance.subTree.component)]
    : instance.subTree?.children?.flatMap(c => c?.component ? [snapshotTree(c.component)] : []) ?? []
  ).filter(Boolean)
  return { name, data, children }
}

// ── SFC compiler (loaded on first Run, cached thereafter) ─────────────────────
let compiler = null
async function getCompiler() {
  if (compiler) return compiler
  compiler = await import('${SFC_COMPILER_URL}')
  return compiler
}

// ── Module resolution helpers ─────────────────────────────────────────────────
function resolvePath(importee, importer) {
  if (!importee.startsWith('.')) return importee
  const dir = importer.includes('/') ? importer.slice(0, importer.lastIndexOf('/') + 1) : ''
  const parts = (dir + importee).split('/')
  const resolved = []
  for (const p of parts) {
    if (p === '..') resolved.pop()
    else if (p !== '.') resolved.push(p)
  }
  return resolved.join('/')
}

function rewriteImports(code, importer, moduleMap) {
  const VUE_URL = '${VUE_URL}'
  return code
    .replace(/from\\s+['"]vue['"]/g, \`from '\${VUE_URL}'\`)
    .replace(/from\\s+['"]([^'"]+\\.(vue|ts|js))['"]/g, (original, spec) => {
      const resolved = resolvePath(spec, importer)
      const url = moduleMap[resolved] ?? moduleMap[spec]
      // Return blob URL if found; keep original if not (so error messages are readable)
      return url ? \`from '\${url}'\` : original
    })
}

// Sucrase: proper TypeScript stripping (loaded lazily on first Run)
let _sucraseTransform = null
async function getStripTS() {
  if (_sucraseTransform) return _sucraseTransform
  try {
    const { transform } = await import('${SUCRASE_URL}')
    _sucraseTransform = (code) => transform(code, { transforms: ['typescript'] }).code
  } catch(_) {
    // Fallback regex stripper if sucrase fails to load
    _sucraseTransform = (code) => {
      let s = code.replace(/^\\s*import\\s+type\\s+[^\\n]+\\n/gm, '')
      s = s.replace(/^\\s*export\\s+type\\s+[^\\n]+\\n/gm, '')
      s = s.replace(/^\\s*(interface|type)\\s+\\w[\\s\\S]*?^}/gm, '')
      s = s.replace(/\\sas\\s+[A-Za-z][\\w<>|&\\[\\]]*(?=[^\\w])/g, '')
      s = s.replace(/:\\s*[A-Za-z][\\w<>\\[\\]|&?,\\s]*(?=\\s*[=,;)\\n{])/g, '')
      s = s.replace(/<[A-Za-z][\\w,\\s<>|&\\[\\]]*>(?=\\s*[(,;\\n])/g, '')
      return s
    }
  }
  return _sucraseTransform
}

// ── Compile + run ─────────────────────────────────────────────────────────────
const blobUrls = []

async function run(files) {
  // Clean up old blob URLs
  for (const url of blobUrls) URL.revokeObjectURL(url)
  blobUrls.length = 0

  // Reset error display and app mount point
  errBox.style.display = 'none'
  errBox.textContent = ''
  document.getElementById('app').innerHTML = ''
  document.getElementById('__vue_styles__').textContent = ''

  const [{ parse, compileScript, compileStyleAsync }, stripTS] = await Promise.all([getCompiler(), getStripTS()])

  // Phase 1a: compile all .vue files → { code, styles }
  const compiled = {} // filename → { code, styles }
  const entryKey = Object.keys(files).find(f => /\\/main\\.[jt]s$/.test(f))

  for (const [filename, source] of Object.entries(files)) {
    if (!filename.endsWith('.vue')) continue
    const id = filename.replace(/[^a-z0-9]/gi, '_')
    const { descriptor, errors } = parse(source, { filename })
    if (errors.length) {
      console.error('Parse error in ' + filename + ': ' + errors[0].message)
      return
    }

    let scriptCode = ''
    if (descriptor.scriptSetup || descriptor.script) {
      const isTS = (descriptor.scriptSetup?.lang ?? descriptor.script?.lang) === 'ts'
      try {
        const result = compileScript(descriptor, {
          id,
          inlineTemplate: true,
          isProd: false,
          sourceMap: false,
        })
        // compileScript preserves TypeScript in output when lang="ts"; strip it
        scriptCode = isTS ? stripTS(result.content) : result.content
      } catch(e) {
        console.error('Compile error in ' + filename + ': ' + e.message)
        return
      }
    }

    const styleTexts = []
    for (const style of descriptor.styles) {
      try {
        const r = await compileStyleAsync({ source: style.content, id, filename, scoped: style.scoped ?? false })
        if (r.errors.length) console.warn('Style warning in ' + filename + ': ' + r.errors[0])
        else styleTexts.push(r.code)
      } catch(_) {}
    }

    compiled[filename] = { code: scriptCode, styles: styleTexts }
  }

  // Phase 1b: compile non-entry .ts/.js helper files
  for (const [filename, source] of Object.entries(files)) {
    if (filename === entryKey) continue
    if (!filename.endsWith('.ts') && !filename.endsWith('.js')) continue
    compiled[filename] = { code: filename.endsWith('.ts') ? stripTS(source) : source, styles: [] }
  }

  // Phase 2: create blob URLs.
  // Sort deeper paths first (src/components/X.vue before src/App.vue) so that
  // leaf modules are in the map before their importers are rewritten.
  const moduleMap = {}
  const depthSorted = Object.keys(compiled).sort(
    (a, b) => b.split('/').length - a.split('/').length
  )

  for (const filename of depthSorted) {
    const { code, styles } = compiled[filename]
    document.getElementById('__vue_styles__').textContent += styles.join('\\n')
    const rewritten = rewriteImports(code, filename, moduleMap)
    const url = URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }))
    blobUrls.push(url)
    moduleMap[filename] = url
  }

  // Phase 3: run the entry file
  if (!entryKey) { console.error('No main.ts or main.js found'); return }
  let entryCode = files[entryKey]
  if (entryKey.endsWith('.ts')) entryCode = stripTS(entryCode)
  entryCode = rewriteImports(entryCode, entryKey, moduleMap)

  const entryUrl = URL.createObjectURL(new Blob([entryCode], { type: 'text/javascript' }))
  blobUrls.push(entryUrl)

  try {
    await import(entryUrl)
    parent.postMessage({ type: 'ready' }, '*')
  } catch(e) {
    console.error(e.message ?? String(e))
  }
}

// ── Message listener ──────────────────────────────────────────────────────────
window.addEventListener('message', ({ data }) => {
  if (data?.type === 'run') run(data.files).catch(e => console.error(String(e)))
})

parent.postMessage({ type: 'sandbox-ready' }, '*')
</script>
</body>
</html>`
