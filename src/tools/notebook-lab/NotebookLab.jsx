import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, Download, Upload, Link, FileText, ChevronLeft, Pencil, Check } from 'lucide-react'
import PythonNotebook from '../../courses/python/viz/PythonNotebook.jsx'
import {
  listNotebooks, getNotebook, saveNotebook, deleteNotebook, createNotebook,
} from './notebookStorage.js'
import { downloadIpynb, fromIpynb, fetchColabNotebook } from './ipynbConverter.js'

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function NotebookLab() {
  const [notebooks, setNotebooks] = useState(() => listNotebooks())
  const [activeId, setActiveId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [colabUrl, setColabUrl] = useState('')
  const [colabOpen, setColabOpen] = useState(false)
  const [colabError, setColabError] = useState('')
  const [colabLoading, setColabLoading] = useState(false)
  const fileInputRef = useRef(null)
  const nameInputRef = useRef(null)
  const saveTimer = useRef(null)

  const active = notebooks.find(n => n.id === activeId) ?? null

  const refresh = () => setNotebooks(listNotebooks())

  const openNotebook = (id) => {
    setActiveId(id)
    setEditingName(false)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const newNotebook = () => {
    const nb = createNotebook()
    refresh()
    openNotebook(nb.id)
  }

  const handleCellsChange = useCallback((cells) => {
    if (!activeId) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const nb = getNotebook(activeId)
      if (nb) { saveNotebook({ ...nb, cells }); refresh() }
    }, 800)
  }, [activeId])

  const handleDelete = (id) => {
    if (!confirm('Delete this notebook?')) return
    deleteNotebook(id)
    if (activeId === id) setActiveId(null)
    refresh()
  }

  const handleRename = () => {
    const nb = getNotebook(activeId)
    if (!nb) return
    saveNotebook({ ...nb, name: nameInput.trim() || nb.name })
    setEditingName(false)
    refresh()
  }

  const startEdit = () => {
    setNameInput(active?.name ?? '')
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const ipynb = JSON.parse(ev.target.result)
        const nb = fromIpynb(ipynb, file.name.replace(/\.ipynb$/, ''))
        saveNotebook(nb)
        refresh()
        openNotebook(nb.id)
      } catch {
        alert('Could not parse .ipynb file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleColabImport = async () => {
    if (!colabUrl.trim()) return
    setColabError('')
    setColabLoading(true)
    try {
      const ipynb = await fetchColabNotebook(colabUrl)
      const name = colabUrl.split('/').pop()?.replace(/\.ipynb$/, '') ?? 'Imported'
      const nb = fromIpynb(ipynb, name)
      saveNotebook(nb)
      refresh()
      openNotebook(nb.id)
      setColabOpen(false)
      setColabUrl('')
    } catch (e) {
      setColabError(e.message)
    } finally {
      setColabLoading(false)
    }
  }

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col shrink-0 border-r border-slate-800 transition-all duration-200 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
        style={{ background: '#111827' }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Notebooks</span>
          <button
            onClick={newNotebook}
            title="New notebook"
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Notebook list */}
        <div className="flex-1 overflow-y-auto py-1">
          {notebooks.length === 0 && (
            <p className="px-4 py-6 text-xs text-slate-500 text-center">No notebooks yet.<br />Click + to create one.</p>
          )}
          {notebooks.map(nb => (
            <div
              key={nb.id}
              onClick={() => openNotebook(nb.id)}
              className={`group flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                nb.id === activeId
                  ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                  : 'hover:bg-slate-800 border-l-2 border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate text-slate-200">{nb.name}</p>
                <p className="text-[10px] text-slate-500">{nb.cells.length} cell{nb.cells.length !== 1 ? 's' : ''} · {timeAgo(nb.updatedAt)}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(nb.id) }}
                className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-900/40 hover:text-red-400 text-slate-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar footer: import buttons */}
        <div className="shrink-0 border-t border-slate-800 p-3 space-y-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload .ipynb
          </button>
          <button
            onClick={() => setColabOpen(o => !o)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Link className="w-3.5 h-3.5" /> Import from URL
          </button>
          <input ref={fileInputRef} type="file" accept=".ipynb" className="hidden" onChange={handleUpload} />
        </div>

        {/* Colab/URL import panel */}
        {colabOpen && (
          <div className="shrink-0 border-t border-slate-800 p-3 space-y-2">
            <p className="text-[10px] text-slate-400">Paste a GitHub .ipynb URL or download from Colab and upload:</p>
            <input
              value={colabUrl}
              onChange={e => setColabUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleColabImport()}
              placeholder="https://github.com/…/file.ipynb"
              className="w-full text-xs px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
            />
            {colabError && <p className="text-[10px] text-red-400">{colabError}</p>}
            <button
              onClick={handleColabImport}
              disabled={colabLoading}
              className="w-full py-1.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {colabLoading ? 'Importing…' : 'Import'}
            </button>
          </div>
        )}
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 shrink-0" style={{ background: '#111827' }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Toggle sidebar"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>

          {active && (
            <>
              {editingName ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    ref={nameInputRef}
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false) }}
                    className="flex-1 text-sm font-semibold bg-slate-800 border border-indigo-500 rounded px-2 py-0.5 text-white outline-none"
                  />
                  <button onClick={handleRename} className="p-1 text-indigo-400 hover:text-indigo-300">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-white group"
                >
                  {active.name}
                  <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              )}

              <div className="flex-1" />

              <button
                onClick={() => downloadIpynb(active)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download .ipynb
              </button>
            </>
          )}

          {!active && (
            <>
              <span className="text-sm text-slate-500 flex-1">Select or create a notebook</span>
              <button
                onClick={newNotebook}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Notebook
              </button>
            </>
          )}
        </div>

        {/* Notebook content */}
        <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-slate-950">
          {active ? (
            <PythonNotebook
              key={active.id}
              params={{ initialCells: active.cells.length ? active.cells : undefined }}
              onCellsChange={handleCellsChange}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center p-8">
              <span className="text-5xl">📓</span>
              <div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">Notebook Lab</p>
                <p className="text-sm text-slate-400 max-w-sm">
                  Create notebooks, run Python, download as .ipynb, upload from Jupyter or Colab.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={newNotebook}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Notebook
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
                >
                  <Upload className="w-4 h-4" /> Upload .ipynb
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
