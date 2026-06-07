import { useCallback, useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { ChevronDown, ChevronLeft, ChevronRight, Columns2, Download, FilePlus, FolderPlus, Maximize2, Minimize2, Play, RotateCcw, Upload, X } from 'lucide-react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { executeScript } from '../../utils/openmatEngine.js'
import WorkspaceTerminal from './WorkspaceTerminal.jsx'
import { useIsDark } from '../../utils/useIsDark.js'

// ── Tree item helpers ─────────────────────────────────────────────────────────
const EXT_LANG = {
  html: 'html', css: 'css', js: 'javascript', ts: 'typescript',
  py: 'python', json: 'json', sh: 'shell', cpp: 'cpp', c: 'c',
  txt: 'plaintext', md: 'markdown',
}
const LANG_DEFAULT_NAME = {
  html: 'index.html', css: 'style.css', javascript: 'script.js',
  typescript: 'main.ts', python: 'main.py', shell: 'script.sh',
  cpp: 'main.cpp', plaintext: 'notes.txt',
}
const LANG_DOT = {
  html: '#e34c26', css: '#264de4', javascript: '#f0c000',
  typescript: '#3178c6', python: '#4B8BBE', json: '#6b7280',
  shell: '#4ade80', cpp: '#9ca3af', c: '#9ca3af',
  plaintext: '#475569', markdown: '#60a5fa',
}

function extLang(name) {
  return EXT_LANG[name.split('.').pop().toLowerCase()] || 'plaintext'
}

let _uid = 10
function makeFile(name, content = '', parentId = null) {
  return { id: `f${++_uid}`, type: 'file', name, content, language: extLang(name), parentId }
}
function makeFolder(name, parentId = null) {
  return { id: `f${++_uid}`, type: 'folder', name, open: true, parentId }
}

// ── Bundle ────────────────────────────────────────────────────────────────────
function buildHtmlBundle(files) {
  const html = files.find(f => extLang(f.name) === 'html')
  const css = files.filter(f => extLang(f.name) === 'css').map(f => f.content).join('\n')
  const js = files.filter(f => ['javascript', 'typescript'].includes(extLang(f.name))).map(f => f.content).join('\n\n')

  let doc = html?.content || '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>'
  if (css && !doc.includes('<style>'))
    doc = doc.includes('</head>') ? doc.replace('</head>', `<style>\n${css}\n</style>\n</head>`) : `<style>\n${css}\n</style>\n` + doc
  if (js)
    doc = doc.includes('</body>') ? doc.replace('</body>', `<script>\n${js}\n</script>\n</body>`) : doc + `\n<script>\n${js}\n</script>`
  return doc
}

// ── Colored dot for file language ─────────────────────────────────────────────
function LangDot({ name, size = 8 }) {
  return <span style={{ display: 'inline-block', flexShrink: 0, width: size, height: size, borderRadius: '50%', background: LANG_DOT[extLang(name)] || '#475569' }} />
}

// ── LocalStorage persistence ──────────────────────────────────────────────────
const LS_WS = 'studio_workspace_v1'

function loadSavedWorkspace() {
  try {
    const raw = localStorage.getItem(LS_WS)
    if (!raw) return null
    const { items, activeId } = JSON.parse(raw)
    if (!Array.isArray(items) || !items.length) return null
    // Advance _uid past any saved IDs to prevent collisions
    items.forEach(i => {
      const n = parseInt(i.id.replace(/\D/g, ''), 10)
      if (!isNaN(n) && n > _uid) _uid = n
    })
    return { items, activeId }
  } catch { return null }
}

const _DEFAULT_FILE = makeFile('script.js', '// Welcome to Code Along!\nconsole.log("Hello!");\n')
const _SAVED = loadSavedWorkspace()

// ── Component ─────────────────────────────────────────────────────────────────
export default function DocsCodeWorkspace({ activeTitle = 'Docs', pendingRun = null }) {
  const [items, setItems] = useState(() => _SAVED?.items ?? [_DEFAULT_FILE])
  const [activeId, setActiveId] = useState(() => _SAVED?.activeId ?? _DEFAULT_FILE.id)
  const [treeOpen, setTreeOpen] = useState(true)
  const [adding, setAdding] = useState(null)   // { type: 'file'|'folder', parentId }
  const [addingName, setAddingName] = useState('')
  const [pendingReplace, setPendingReplace] = useState(null)
  const [previewDoc, setPreviewDoc] = useState('')
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [bottomTab, setBottomTab] = useState('terminal')  // 'terminal' | 'preview'
  const [outputMode, setOutputMode] = useState('split')
  const addInputRef = useRef(null)
  const terminalRef = useRef(null)
  const importFileRef = useRef(null)
  const isDark = useIsDark()

  // Stable refs so effects never go stale
  const itemsRef = useRef(items)
  const activeIdRef = useRef(activeId)
  useEffect(() => { itemsRef.current = items }, [items])
  useEffect(() => { activeIdRef.current = activeId }, [activeId])

  const files = items.filter(i => i.type === 'file')
  const activeFile = files.find(f => f.id === activeId) ?? files[0]

  // ── Auto-save workspace to localStorage ───────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_WS, JSON.stringify({ items, activeId })) } catch {}
  }, [items, activeId])

  // ── Focus add-name input ───────────────────────────────────────────────────
  useEffect(() => { if (adding) addInputRef.current?.focus() }, [adding])

  // ── Inject code from docs ──────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingRun) return
    const { code, language: lang } = pendingRun
    const currentItems = itemsRef.current
    const currentActiveId = activeIdRef.current

    const allFiles = currentItems.filter(i => i.type === 'file')
    const active = allFiles.find(f => f.id === currentActiveId)

    // Priority: active file if language matches, else first matching file, else create
    const target = active?.language === lang
      ? active
      : allFiles.find(f => f.language === lang) ?? null

    if (!target) {
      const newFile = makeFile(LANG_DEFAULT_NAME[lang] || 'file.txt', code)
      setItems(prev => [...prev, newFile])
      setActiveId(newFile.id)
      terminalRef.current?.print('Code loaded — press ▶ Run to execute.', 'info')
      setPreviewDoc('')
      return
    }

    setActiveId(target.id)
    setPreviewDoc('')

    if (!target.content?.trim()) {
      setItems(prev => prev.map(i => i.id === target.id ? { ...i, content: code } : i))
      terminalRef.current?.print('Code loaded — press ▶ Run to execute.', 'info')
    } else {
      setPendingReplace({ code, fileId: target.id, fileName: target.name })
    }
  }, [pendingRun])

  // ── Replace confirm / cancel ───────────────────────────────────────────────
  const confirmReplace = useCallback(() => {
    if (!pendingReplace) return
    setItems(prev => prev.map(i => i.id === pendingReplace.fileId ? { ...i, content: pendingReplace.code } : i))
    terminalRef.current?.print('Code loaded — press ▶ Run to execute.', 'info')
    setPendingReplace(null)
  }, [pendingReplace])

  const cancelReplace = useCallback(() => setPendingReplace(null), [])

  // ── Tree mutations ─────────────────────────────────────────────────────────
  const commitAdd = useCallback(() => {
    const name = addingName.trim()
    if (!name || !adding) { setAdding(null); setAddingName(''); return }
    const newItem = adding.type === 'folder'
      ? makeFolder(name, adding.parentId)
      : makeFile(name, '', adding.parentId)
    setItems(prev => [...prev, newItem])
    if (adding.type === 'file') setActiveId(newItem.id)
    setAdding(null)
    setAddingName('')
  }, [adding, addingName])

  const deleteItem = useCallback((id) => {
    setItems(prev => {
      // Remove item and all descendants
      const toRemove = new Set()
      const queue = [id]
      while (queue.length) {
        const cur = queue.shift()
        toRemove.add(cur)
        prev.filter(i => i.parentId === cur).forEach(i => queue.push(i.id))
      }
      const next = prev.filter(i => !toRemove.has(i.id))
      const remaining = next.filter(i => i.type === 'file')
      if (remaining.length > 0 && toRemove.has(activeIdRef.current))
        setActiveId(remaining[0].id)
      return next.length ? next : INIT
    })
  }, [])

  const toggleFolder = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id && i.type === 'folder' ? { ...i, open: !i.open } : i))
  }, [])

  const updateContent = useCallback((value) => {
    setItems(prev => prev.map(i => i.id === activeId ? { ...i, content: value ?? '' } : i))
  }, [activeId])

  // ── Run — delegates to terminal ───────────────────────────────────────────
  const run = useCallback(() => {
    const af = files.find(f => f.id === activeId) ?? files[0]
    if (!af) return
    setBottomTab('terminal')
    terminalRef.current?.run(af, files)
  }, [files, activeId])

  // ── Preview callback from terminal ────────────────────────────────────────
  const handlePreview = useCallback((doc) => {
    setPreviewDoc(doc)
    setBottomTab('preview')
  }, [])

  const clearOutput = useCallback(() => {
    terminalRef.current?.clear()
    setPreviewDoc('')
  }, [])

  // ── Import files from disk ─────────────────────────────────────────────────
  const onImportFiles = useCallback(async (e) => {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!picked.length) return
    const newFiles = await Promise.all(picked.map(async (f) => {
      const content = await f.text()
      return makeFile(f.name, content)
    }))
    setItems(prev => [...prev, ...newFiles])
    setActiveId(newFiles[newFiles.length - 1].id)
    terminalRef.current?.print(`Imported ${newFiles.map(f => f.name).join(', ')}`, 'success')
  }, [])

  // ── Download all files as ZIP ─────────────────────────────────────────────
  const downloadZip = useCallback(async () => {
    // Dynamically load JSZip from CDN if not already loaded
    if (!window.JSZip) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
    }
    const zip = new window.JSZip()
    files.forEach(f => zip.file(f.name, f.content))
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workspace.zip'
    a.click()
    URL.revokeObjectURL(url)
  }, [files])

  const outputIsFull = outputMode === 'full'

  // ── Recursive tree renderer ────────────────────────────────────────────────
  function renderTree(parentId = null, depth = 0) {
    return items
      .filter(i => (i.parentId ?? null) === (parentId ?? null))
      .map(item => {
        if (item.type === 'folder') {
          return (
            <div key={item.id}>
              <div
                className={`group flex items-center gap-1 px-1 py-1 cursor-pointer select-none transition-colors ${D ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'}`}
                style={{ paddingLeft: 6 + depth * 12 }}
                onClick={() => toggleFolder(item.id)}
              >
                {item.open
                  ? <ChevronDown className={`w-3 h-3 shrink-0 ${txt2}`} />
                  : <ChevronRight className={`w-3 h-3 shrink-0 ${txt2}`} />}
                <span className="text-amber-500 text-[10px]">📁</span>
                <span className="flex-1 truncate text-[11px] font-semibold">{item.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteItem(item.id) }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 rounded p-0.5 transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              {item.open && renderTree(item.id, depth + 1)}
            </div>
          )
        }

        const isActive = item.id === activeId
        return (
          <div
            key={item.id}
            onClick={() => setActiveId(item.id)}
            className={`group flex items-center gap-1.5 py-1 cursor-pointer text-xs transition-colors select-none ${
              isActive
                ? D ? 'bg-slate-700/60 text-white' : 'bg-sky-100 text-sky-800'
                : D ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
            style={{ paddingLeft: 10 + depth * 12, paddingRight: 6 }}
          >
            <LangDot name={item.name} />
            <span className="flex-1 truncate font-mono text-[11px]">{item.name}</span>
            {files.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); deleteItem(item.id) }}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 rounded p-0.5 transition-all"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )
      })
  }

  // ── Inline add input (shown at bottom of tree while typing) ───────────────
  function renderAddInput() {
    if (!adding) return null
    const indent = adding.parentId
      ? items.find(i => i.id === adding.parentId) ? 22 : 10
      : 10
    return (
      <div className="flex items-center gap-1.5 px-1 py-0.5" style={{ paddingLeft: indent }}>
        {adding.type === 'folder'
          ? <span className="text-[10px]">📁</span>
          : <LangDot name={addingName || 'file.txt'} size={7} />}
        <input
          ref={addInputRef}
          value={addingName}
          onChange={e => setAddingName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitAdd()
            if (e.key === 'Escape') { setAdding(null); setAddingName('') }
          }}
          onBlur={commitAdd}
          placeholder={adding.type === 'folder' ? 'folder name' : 'file.py'}
          className={`flex-1 min-w-0 border border-sky-500 rounded text-[11px] px-1.5 py-0.5 outline-none font-mono ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}`}
        />
      </div>
    )
  }

  const D = isDark
  const border  = D ? 'border-slate-800'   : 'border-slate-200'
  const bg0     = D ? 'bg-slate-950'       : 'bg-white'
  const bg1     = D ? 'bg-slate-900'       : 'bg-slate-100'
  const bg2     = D ? 'bg-[#0c1520]'       : 'bg-slate-50'
  const txt1    = D ? 'text-slate-200'     : 'text-slate-800'
  const txt2    = D ? 'text-slate-400'     : 'text-slate-500'
  const hoverBg = D ? 'hover:bg-slate-800' : 'hover:bg-slate-200'
  const hoverTx = D ? 'hover:text-slate-200' : 'hover:text-slate-900'
  const btnBorder = D ? 'border-slate-700' : 'border-slate-300'

  return (
    <section className={`flex-1 min-h-0 flex flex-col ${bg0} ${D ? 'text-slate-100' : 'text-slate-900'} border-l ${border}`}>
      <input
        ref={importFileRef}
        type="file"
        multiple
        accept=".js,.ts,.jsx,.tsx,.py,.html,.css,.json,.md,.txt,.sh,.cpp,.c"
        className="hidden"
        onChange={onImportFiles}
      />

      {/* ── Header ── */}
      <header className={`h-12 shrink-0 flex items-center gap-1.5 px-3 border-b ${border} ${bg1}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {activeFile && <LangDot name={activeFile.name} size={7} />}
            <span className={`text-xs font-bold font-mono truncate ${txt1}`}>
              {activeFile?.name ?? 'Code Along'}
            </span>
          </div>
          <div className={`text-[10px] truncate ${txt2}`}>{activeTitle}</div>
        </div>
        <button onClick={run} className="h-7 inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-500 px-2.5 text-xs font-bold text-white transition-colors">
          <Play className="w-3 h-3" /> Run
        </button>
        <button onClick={downloadZip} className={`h-7 w-7 flex items-center justify-center rounded border ${btnBorder} ${txt2} ${hoverBg} ${hoverTx} transition-colors`} title="Download all files as ZIP">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button onClick={clearOutput} className={`h-7 w-7 flex items-center justify-center rounded border ${btnBorder} ${txt2} ${hoverBg} ${hoverTx} transition-colors`} title="Clear terminal">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setOutputMode(m => m === 'split' ? 'full' : 'split')} className={`h-7 w-7 flex items-center justify-center rounded border ${btnBorder} ${txt2} ${hoverBg} ${hoverTx} transition-colors`} title={outputIsFull ? 'Restore editor' : 'Expand output'}>
          {outputIsFull ? <Columns2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </header>

      {/* ── Replace confirmation banner ── */}
      {pendingReplace && (
        <div className={`shrink-0 flex items-center gap-2 px-3 py-2 border-b text-xs ${D ? 'bg-amber-950/70 border-amber-800/50' : 'bg-amber-50 border-amber-200'}`}>
          <span className={`flex-1 truncate min-w-0 ${D ? 'text-amber-300' : 'text-amber-800'}`}>
            <span className="font-bold font-mono">{pendingReplace.fileName}</span> already has code — replace it?
          </span>
          <button onClick={confirmReplace} className="shrink-0 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors">Replace</button>
          <button onClick={cancelReplace} className={`shrink-0 px-2.5 py-1 rounded border ${btnBorder} ${txt2} ${hoverBg} transition-colors`}>Keep mine</button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── File tree ── */}
        {treeOpen && (
          <div className={`w-44 shrink-0 border-r ${border} ${bg2} flex flex-col overflow-hidden`}>

            {/* VS Code-style explorer header */}
            <div className={`flex items-center px-2 py-1.5 border-b ${border} shrink-0`}>
              <span className={`flex-1 text-[9px] font-bold uppercase tracking-widest ${txt2}`}>Explorer</span>
              <button
                onClick={() => { setAdding({ type: 'file', parentId: null }); setAddingName('') }}
                className={`w-5 h-5 flex items-center justify-center rounded ${txt2} ${hoverTx} ${hoverBg} transition-colors`}
                title="New File"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setAdding({ type: 'folder', parentId: null }); setAddingName('') }}
                className={`w-5 h-5 flex items-center justify-center rounded ${txt2} ${hoverTx} ${hoverBg} transition-colors`}
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => importFileRef.current?.click()}
                className={`w-5 h-5 flex items-center justify-center rounded ${txt2} ${hoverTx} ${hoverBg} transition-colors`}
                title="Import files (.js .ts .py .md .html …)"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
              {renderTree()}
              {renderAddInput()}
            </div>
          </div>
        )}

        {/* ── Editor + output ── */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">

          {/* Tab strip */}
          <div className={`flex items-center shrink-0 ${bg2} border-b ${border} overflow-x-auto`}>
            <button
              onClick={() => setTreeOpen(v => !v)}
              className={`shrink-0 h-8 w-8 flex items-center justify-center border-r ${border} ${txt2} ${hoverTx} ${hoverBg} transition-colors`}
              title={treeOpen ? 'Hide explorer' : 'Show explorer'}
            >
              {treeOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {files.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className={`flex items-center gap-1.5 px-3 h-8 text-[11px] font-mono shrink-0 border-r ${border} transition-colors ${
                  f.id === activeId
                    ? D
                      ? 'bg-slate-800 text-white border-t-2 border-t-sky-500'
                      : 'bg-white text-slate-900 border-t-2 border-t-sky-500 shadow-sm'
                    : D
                      ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                      : 'text-slate-500 hover:bg-white/80 hover:text-slate-700'
                }`}
              >
                <LangDot name={f.name} size={6} />
                {f.name}
              </button>
            ))}
          </div>

          <div className={`${outputIsFull ? 'hidden' : 'flex-[3]'} min-h-0`}>
            <Editor
              key={activeId}
              defaultValue={activeFile?.content ?? ''}
              language={activeFile?.language ?? 'plaintext'}
              theme={isDark ? 'open-calc-dark' : 'open-calc-light'}
              beforeMount={setupOpenCalcMonaco}
              onChange={updateContent}
              onMount={(editor) => {
                // Force Monaco to re-measure after the flex layout settles
                requestAnimationFrame(() => requestAnimationFrame(() => editor.layout()))
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                wordWrap: 'off',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
                padding: { top: 8, bottom: 8 },
              }}
            />
          </div>

          {/* ── Bottom pane: Terminal | Preview ── */}
          <div className={`${outputIsFull ? 'flex-1' : 'flex-[2]'} min-h-0 border-t ${border} flex flex-col`}>
            {/* Tab bar */}
            <div className={`h-7 shrink-0 flex items-center border-b ${border} ${bg2} px-1 gap-0.5`}>
              {['terminal', 'preview'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={`px-3 h-6 text-[10px] font-bold rounded transition-colors capitalize ${
                    bottomTab === tab
                      ? D ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900'
                      : D ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  {tab === 'terminal' ? '⌨ Terminal' : '🖼 Preview'}
                </button>
              ))}
              <button
                onClick={() => setOutputMode(m => m === 'split' ? 'full' : 'split')}
                className={`ml-auto w-5 h-5 flex items-center justify-center rounded ${txt2} ${hoverTx} ${hoverBg}`}
              >
                {outputIsFull ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
            </div>

            {/* Terminal */}
            <div className={`flex-1 min-h-0 ${bottomTab === 'terminal' ? 'flex flex-col' : 'hidden'}`}>
              <WorkspaceTerminal
                ref={terminalRef}
                files={files}
                isDark={isDark}
                onPreview={handlePreview}
              />
            </div>

            {/* Preview */}
            <div className={`flex-1 min-h-0 ${bottomTab === 'preview' ? 'flex flex-col' : 'hidden'}`}>
              {previewDoc
                ? <iframe title="preview" srcDoc={previewDoc} sandbox="allow-scripts allow-same-origin" className="flex-1 w-full bg-white" />
                : <div className={`flex-1 flex items-center justify-center text-xs ${txt2}`}>
                    Run an HTML or React file to see the preview here.
                  </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
