import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { X, ChevronDown, ChevronRight, File, Folder, FilePenLine, FilePlus, Download, Edit2, Eye } from 'lucide-react'

// ─── AUTO-DISCOVER all .md files in src/docs/ ────────────────────────────────
// Add a .md file to any folder inside src/docs/ and it appears automatically.
// Prefix filenames with numbers to control order: 01-intro.md, 02-next.md
const DOCS_MODULES = import.meta.glob('/src/docs/**/*.md', {
  query: '?raw',
  import: 'default',
})

// ─── TREE BUILDER ─────────────────────────────────────────────────────────────
const PREFIX = '/src/docs/'

function buildTree(modulePaths) {
  const root = []
  ;[...modulePaths].sort().forEach(path => {
    const rel   = path.slice(PREFIX.length)
    const parts = rel.split('/')
    let   nodes = root

    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1
      if (isFile) {
        nodes.push({ type: 'file', name: part, path })
      } else {
        let dir = nodes.find(n => n.type === 'dir' && n.name === part)
        if (!dir) { dir = { type: 'dir', name: part, children: [], open: true }; nodes.push(dir) }
        nodes = dir.children
      }
    })
  })
  return root
}

function displayName(str) {
  return str
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// ─── STORAGE KEY ──────────────────────────────────────────────────────────────
const LS_KEY = 'markdownhub_personal'

function loadPersonal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function savePersonal(files) {
  localStorage.setItem(LS_KEY, JSON.stringify(files))
}

// ─── MARKDOWN STYLES ──────────────────────────────────────────────────────────
const MD_CSS = `
.md-body { line-height: 1.75; font-size: 15px; max-width: 860px; color: #334155; }
.dark .md-body { color: #e2e8f0; }

.md-body h1 { font-size: 2em; font-weight: 700; margin: 0 0 0.5em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
.dark .md-body h1 { color: #f8fafc; border-bottom-color: #334155; }

.md-body h2 { font-size: 1.4em; font-weight: 700; margin: 1.8em 0 0.5em; color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2em; }
.dark .md-body h2 { color: #60a5fa; border-bottom-color: #1e293b; }

.md-body h3 { font-size: 1.15em; font-weight: 600; margin: 1.4em 0 0.4em; color: #059669; }
.dark .md-body h3 { color: #34d399; }

.md-body h4 { font-size: 1em; font-weight: 600; margin: 1.2em 0 0.3em; color: #d97706; }
.dark .md-body h4 { color: #fbbf24; }

.md-body p  { margin: 0 0 1em; }
.md-body a  { color: #2563eb; text-decoration: underline; }
.dark .md-body a { color: #60a5fa; }
.md-body a:hover { color: #1d4ed8; }
.dark .md-body a:hover { color: #93c5fd; }

.md-body code { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 6px; font-size: 0.85em; font-family: 'JetBrains Mono', monospace; color: #7c3aed; }
.dark .md-body code { background: #1e293b; border-color: #334155; color: #c084fc; }

.md-body pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; overflow-x: auto; margin: 0 0 1.2em; }
.dark .md-body pre { background: #0f172a; border-color: #1e293b; }
.md-body pre code { background: none; border: none; padding: 0; color: #334155; }
.dark .md-body pre code { color: #e2e8f0; }

.md-body blockquote { border-left: 3px solid #3b82f6; margin: 0 0 1em; padding: 8px 16px; background: rgba(59,130,246,0.05); border-radius: 0 4px 4px 0; color: #64748b; }
.dark .md-body blockquote { border-left-color: #60a5fa; background: rgba(96,165,250,0.05); color: #94a3b8; }

.md-body ul, .md-body ol { margin: 0 0 1em 1.4em; }
.md-body li  { margin-bottom: 0.3em; }

.md-body table { border-collapse: collapse; width: 100%; margin: 0 0 1.2em; font-size: 0.9em; }
.md-body th  { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; color: #475569; font-weight: 600; }
.dark .md-body th  { background: #1e293b; border-color: #334155; color: #cbd5e1; }
.md-body td  { border: 1px solid #e2e8f0; padding: 7px 12px; }
.dark .md-body td  { border-color: #334155; }
.md-body tr:nth-child(even) td { background: #f8fafc; }
.dark .md-body tr:nth-child(even) td { background: #0f172a; }

.md-body hr  { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
.dark .md-body hr  { border-top-color: #334155; }
.md-body img { max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; }
.dark .md-body img { border-color: #334155; }
.md-body .katex-display { overflow-x: auto; overflow-y: hidden; }
`

// ─── TREE NODE ────────────────────────────────────────────────────────────────
function TreeNode({ node, activeFile, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(node.open !== false)
  const indent = depth * 14

  if (node.type === 'dir') {
    return (
      <div>
        <div
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 px-2 py-1 cursor-pointer text-amber-600 dark:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors select-none group"
          style={{ paddingLeft: 8 + indent }}
        >
          {open ? <ChevronDown className="w-3 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" /> : <ChevronRight className="w-3 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />}
          <Folder className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold tracking-wide uppercase mt-0.5">{displayName(node.name)}</span>
        </div>
        {open && node.children.map((child, i) => (
          <TreeNode key={i} node={child} activeFile={activeFile} onSelect={onSelect} depth={depth + 1} />
        ))}
      </div>
    )
  }

  const isActive = activeFile === node.path
  return (
    <div
      onClick={() => onSelect(node.path)}
      className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs transition-colors border-l-2 ${
        isActive 
          ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10 border-brand-500' 
          : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
      style={{ paddingLeft: 12 + indent }}
    >
      <File className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
      <span className="truncate">{displayName(node.name)}</span>
    </div>
  )
}

// ─── PERSONAL FILE ITEM ───────────────────────────────────────────────────────
function PersonalFileItem({ file, isActive, onSelect, onDelete }) {
  return (
    <div className="flex items-center group">
      <div
        onClick={() => onSelect(file.id)}
        className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs transition-colors border-l-2 ml-2 ${
          isActive 
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500' 
            : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <FilePenLine className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
        <span className="truncate flex-1">{file.name || 'Untitled'}</span>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(file.id) }}
        className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Delete Note"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MarkdownHub() {
  const navigate = useNavigate()
  const [tab, setTab]           = useState('tutorials')   // 'tutorials' | 'editor'
  const [activeFile, setActiveFile] = useState(null)      // tutorial path
  const [content, setContent]   = useState('')            // loaded tutorial markdown
  const [loading, setLoading]   = useState(false)

  // Personal editor
  const [personalFiles, setPersonalFiles] = useState(loadPersonal)
  const [activePersonalId, setActivePersonalId] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [editorName, setEditorName] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  // Build tree once
  const tree = useMemo(() => buildTree(Object.keys(DOCS_MODULES)), [])

  // Load tutorial file
  const selectTutorial = useCallback(async path => {
    setActiveFile(path)
    setLoading(true)
    try {
      const text = await DOCS_MODULES[path]()
      setContent(text)
    } catch (e) {
      setContent(`*Could not load file: ${path}*`)
    }
    setLoading(false)
  }, [])

  // Load README on first render
  useEffect(() => {
    const readme = Object.keys(DOCS_MODULES).find(p => p.endsWith('README.md'))
    if (readme) selectTutorial(readme)
  }, [selectTutorial])

  // Personal file ops
  const newPersonalFile = () => {
    const id = Date.now().toString()
    const file = { id, name: 'Untitled', content: '# New Document\\n\\nStart writing here...' }
    const updated = [...personalFiles, file]
    setPersonalFiles(updated)
    savePersonal(updated)
    setActivePersonalId(id)
    setEditorContent(file.content)
    setEditorName(file.name)
  }

  const selectPersonalFile = id => {
    const file = personalFiles.find(f => f.id === id)
    if (!file) return
    setActivePersonalId(id)
    setEditorContent(file.content)
    setEditorName(file.name)
  }

  const savePersonalFile = useCallback(() => {
    if (!activePersonalId) return
    const updated = personalFiles.map(f =>
      f.id === activePersonalId ? { ...f, content: editorContent, name: editorName } : f
    )
    setPersonalFiles(updated)
    savePersonal(updated)
  }, [activePersonalId, personalFiles, editorContent, editorName])

  // Auto-save on content change
  useEffect(() => {
    if (!activePersonalId) return
    const t = setTimeout(savePersonalFile, 800)
    return () => clearTimeout(t)
  }, [editorContent, editorName, savePersonalFile, activePersonalId])

  const deletePersonalFile = id => {
    const updated = personalFiles.filter(f => f.id !== id)
    setPersonalFiles(updated)
    savePersonal(updated)
    if (activePersonalId === id) {
      setActivePersonalId(null)
      setEditorContent('')
      setEditorName('')
    }
  }

  const downloadFile = () => {
    const name = (editorName || 'document').replace(/[^a-z0-9-_ ]/gi, '') + '.md'
    const blob = new Blob([editorContent], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
  }

  const downloadTutorial = () => {
    if (!content || !activeFile) return
    const name = activeFile.split('/').pop()
    const blob = new Blob([content], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{MD_CSS}</style>
      <div className="flex flex-col h-[100vh] w-full bg-white dark:bg-[#07111e] text-slate-900 dark:text-slate-100 font-sans overflow-hidden inset-0 fixed z-[100]">

        {/* TOP BAR */}
        <div className="h-12 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4 shrink-0 shadow-sm z-10 w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 -ml-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Exit Docs"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-[17px] font-bold text-slate-800 dark:text-slate-100 mr-2 tracking-tight">
            📚 Docs
          </span>

          <div className="flex flex-wrap bg-slate-200/50 dark:bg-slate-950/50 p-1 rounded-lg gap-1 border border-slate-200/50 dark:border-slate-800/50">
            {['tutorials', 'editor'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`
                px-3 py-1 text-xs font-bold capitalize rounded-md transition-all
                ${tab === t 
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50'}
              `}>
                {t === 'tutorials' ? '📖 Tutorials' : '✏️ My Notes'}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {tab === 'tutorials' && activeFile && (
            <button onClick={downloadTutorial} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}

          {tab === 'editor' && activePersonalId && (<>
            {previewMode
              ? <button onClick={() => setPreviewMode(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit mode
                </button>
              : <button onClick={() => setPreviewMode(true)}  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Preview mode
                </button>
            }
            <button onClick={downloadFile} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </>)}
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden w-full relative">

          {/* SIDEBAR */}
          <div className="w-[260px] bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden hidden sm:flex">
            <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">

              {tab === 'tutorials' && (
                tree.length === 0
                  ? <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
                      No docs found.<br/>Add .md files to <code className="text-slate-700 dark:text-slate-300">src/docs/</code>
                    </div>
                  : tree.map((node, i) => (
                      <TreeNode key={i} node={node} activeFile={activeFile} onSelect={selectTutorial} />
                    ))
              )}

              {tab === 'editor' && (<>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                  My Documents
                </div>
                {personalFiles.map(f => (
                  <PersonalFileItem
                    key={f.id} file={f}
                    isActive={activePersonalId === f.id}
                    onSelect={selectPersonalFile}
                    onDelete={deletePersonalFile}
                  />
                ))}
                {personalFiles.length === 0 && (
                  <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
                    No notes yet. Click + New Note below.
                  </div>
                )}
              </>)}
            </div>

            {tab === 'editor' && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                <button onClick={newPersonalFile} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shadow-sm">
                  <FilePlus className="w-4 h-4" /> New Note
                </button>
              </div>
            )}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0b1322]">

            {/* TUTORIALS TEXT CONTENT */}
            {tab === 'tutorials' && (
              <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-8 custom-scrollbar">
                {loading
                  ? <div className="text-slate-500 text-sm animate-pulse">Loading Document...</div>
                  : <div className="md-body mx-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                }
              </div>
            )}

            {/* EMPTY EDITOR STATE */}
            {tab === 'editor' && !activePersonalId && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
                <FilePenLine className="w-16 h-16 opacity-30" />
                <p className="text-sm">Select a note or create a new one to begin</p>
                <button onClick={newPersonalFile} className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-indigo-500/20">
                  <FilePlus className="w-4 h-4" /> Create New Note
                </button>
              </div>
            )}

            {/* EDITOR PREVIEW OVERLAY */}
            {tab === 'editor' && activePersonalId && previewMode && (
              <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-8 bg-slate-50/50 dark:bg-[#07111e]/50 custom-scrollbar">
                <div className="md-body mx-auto bg-white dark:bg-[#0b1322] p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {editorContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* EDITOR MODE */}
            {tab === 'editor' && activePersonalId && !previewMode && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">File</span>
                  <input
                    value={editorName}
                    onChange={e => setEditorName(e.target.value)}
                    placeholder="Document name..."
                    className="flex-1 bg-transparent border-none text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-0"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Saved
                  </span>
                </div>
                <textarea
                  value={editorContent}
                  onChange={e => setEditorContent(e.target.value)}
                  spellCheck={false}
                  className="flex-1 w-full p-6 sm:p-8 bg-slate-50 dark:bg-[#07111e] text-slate-700 dark:text-slate-300 border-none outline-none resize-none font-mono text-[13px] leading-relaxed custom-scrollbar placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="# Begin your markdown here..."
                  style={{ tabSize: 2 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
