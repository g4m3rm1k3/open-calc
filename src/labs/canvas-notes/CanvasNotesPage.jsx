import { useCallback, useEffect, useRef, useState } from 'react'
import SectionTabs from './SectionTabs.jsx'
import PageTabs from './PageTabs.jsx'
import PageCanvas from './PageCanvas.jsx'
import DrawToolbar from './DrawToolbar.jsx'
import {
  listSections,
  putSection,
  deleteSection,
  deletePage,
  exportAll,
  importAll,
} from './db.js'
import { useThemeColors } from '../../hooks/useThemeColors.js'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// Seed data proves the two levels are genuinely independent: two sections,
// each with its own two-page list, no overlap. Also doubles as the
// first-ever-run default, written into IndexedDB the first time this lab
// opens on a fresh browser profile (see the load effect below).
const INITIAL_SECTIONS = [
  {
    id: 'section-1',
    title: 'Getting Started',
    order: 0,
    pages: [
      { id: 'page-1', title: 'Welcome' },
      { id: 'page-2', title: 'Tips' },
    ],
  },
  {
    id: 'section-2',
    title: 'Project Ideas',
    order: 1,
    pages: [
      { id: 'page-3', title: 'Brainstorm' },
    ],
  },
]

// Background style preference is stored in localStorage rather than IndexedDB
// because it's a notebook-wide UX preference, not per-page content.
const BG_KEY = 'canvas-notes-bg'
const BG_CYCLE = ['blank', 'ruled', 'grid']

export default function CanvasNotesPage() {
  const [sections, setSections] = useState(null) // null = still loading
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [activePageId, setActivePageId]   = useState(null)
  const [tool, setTool] = useState('select')
  const C = useThemeColors()

  // Stroke color — auto-updates to canvasText when the theme changes unless
  // the user has explicitly chosen a different non-text colour.
  const [strokeColor, setStrokeColor] = useState(C.canvasText)
  useEffect(() => {
    setStrokeColor((current) => {
      if (current === '#1e1e1e' || current === '#1e293b' || current === '#cbd5e1') return C.canvasText
      return current
    })
  }, [C.canvasText])

  const [strokeWidth, setStrokeWidth] = useState(3)

  // Background style ─────────────────────────────────────────────────────────
  const [bgStyle, setBgStyle] = useState(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(BG_KEY) : null
    return BG_CYCLE.includes(stored) ? stored : 'blank'
  })
  const handleCycleBg = () => {
    setBgStyle((prev) => {
      const next = BG_CYCLE[(BG_CYCLE.indexOf(prev) + 1) % BG_CYCLE.length]
      localStorage.setItem(BG_KEY, next)
      return next
    })
  }

  // Undo / Redo state (reported back by PageCanvas via onHistoryChange) ───────
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Zoom state (reported back by PageCanvas via onZoomChange) ─────────────────
  const [zoom, setZoom] = useState(100)

  // Imperative handle to PageCanvas — lets us call undo/redo/zoom/exportPNG
  // directly without threading callbacks all the way down as props.
  const canvasApiRef = useRef({})

  // These two callbacks MUST be memoized. onPlacementDone is in the tool
  // effect's dep array in PageCanvas; without useCallback it would be a new
  // reference on every render, causing the tool effect to re-run and reset
  // canvas.isDrawingMode every time history pushes or zoom changes.
  const handlePlacementDone  = useCallback(() => setTool('select'), [])
  const handleHistoryChange  = useCallback((canU, canR) => { setCanUndo(canU); setCanRedo(canR) }, [])

  // ── Load notebook structure ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = await listSections()
      const loaded = stored.length ? stored : INITIAL_SECTIONS
      if (!stored.length) await Promise.all(INITIAL_SECTIONS.map((s) => putSection(s)))
      if (cancelled) return
      setSections(loaded)
      setActiveSectionId(loaded[0]?.id ?? null)
      setActivePageId(loaded[0]?.pages[0]?.id ?? null)
    })()
    return () => { cancelled = true }
  }, [])

  const activeSection = sections?.find((s) => s.id === activeSectionId)
  const activePage    = activeSection?.pages.find((p) => p.id === activePageId)

  // ── Section handlers ──────────────────────────────────────────────────────
  const handleSelectSection = (sectionId) => {
    setActiveSectionId(sectionId)
    const newSection = sections.find((s) => s.id === sectionId)
    setActivePageId(newSection?.pages[0]?.id ?? null)
  }

  const handleAddSection = async () => {
    const newPage    = { id: uid(), title: 'Untitled Page' }
    const newSection = { id: uid(), title: 'Untitled Section', order: sections.length, pages: [newPage] }
    await putSection(newSection)
    setSections((prev) => [...prev, newSection])
    setActiveSectionId(newSection.id)
    setActivePageId(newPage.id)
  }

  const handleRenameSection = async (id, title) => {
    const updated = { ...sections.find((s) => s.id === id), title }
    await putSection(updated)
    setSections((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }

  const handleDeleteSection = async (id) => {
    if (sections.length <= 1) return
    const section = sections.find((s) => s.id === id)
    await deleteSection(id)
    await Promise.all(section.pages.map((p) => deletePage(p.id)))
    const remaining = sections.filter((s) => s.id !== id)
    setSections(remaining)
    if (activeSectionId === id) {
      setActiveSectionId(remaining[0].id)
      setActivePageId(remaining[0].pages[0]?.id ?? null)
    }
  }

  // Drag-to-reorder sections: swap positions and persist new order values.
  const handleReorderSections = async (fromIdx, toIdx) => {
    const updated = [...sections]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(toIdx, 0, moved)
    const withOrder = updated.map((s, i) => ({ ...s, order: i }))
    setSections(withOrder)
    await Promise.all(withOrder.map((s) => putSection(s)))
  }

  // Section accent colour
  const handleSetSectionColor = async (id, color) => {
    const updated = { ...sections.find((s) => s.id === id), color }
    await putSection(updated)
    setSections((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }

  // ── Page handlers ─────────────────────────────────────────────────────────
  const handleAddPage = async () => {
    const section = sections.find((s) => s.id === activeSectionId)
    if (!section) return
    const newPage = { id: uid(), title: 'Untitled Page' }
    const updated = { ...section, pages: [...section.pages, newPage] }
    await putSection(updated)
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)))
    setActivePageId(newPage.id)
  }

  const handleRenamePage = async (id, title) => {
    const section = sections.find((s) => s.id === activeSectionId)
    if (!section) return
    const updated = { ...section, pages: section.pages.map((p) => (p.id === id ? { ...p, title } : p)) }
    await putSection(updated)
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)))
  }

  const handleDeletePage = async (id) => {
    const section = sections.find((s) => s.id === activeSectionId)
    if (!section || section.pages.length <= 1) return
    await deletePage(id)
    const updated = { ...section, pages: section.pages.filter((p) => p.id !== id) }
    await putSection(updated)
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)))
    if (activePageId === id) setActivePageId(updated.pages[0]?.id ?? null)
  }

  // Drag-to-reorder pages within the active section.
  const handleReorderPages = async (fromIdx, toIdx) => {
    const section = sections.find((s) => s.id === activeSectionId)
    if (!section) return
    const pages = [...section.pages]
    const [moved] = pages.splice(fromIdx, 1)
    pages.splice(toIdx, 0, moved)
    const updated = { ...section, pages }
    await putSection(updated)
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)))
  }

  // ── Export / Import ───────────────────────────────────────────────────────
  const handleExportNotebook = async () => {
    try {
      const data = await exportAll()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `notebook-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleImportNotebook = async (file) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importAll(data)
      // Reload the notebook structure from the database.
      const stored = await listSections()
      setSections(stored)
      setActiveSectionId(stored[0]?.id ?? null)
      setActivePageId(stored[0]?.pages[0]?.id ?? null)
    } catch (err) {
      console.error('Import failed:', err)
      alert('Import failed — make sure the file is a valid notebook JSON backup.')
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!sections) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading notebook…
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* ── Section tab bar (top) ── */}
      <SectionTabs
        sections={sections}
        activeSectionId={activeSectionId}
        onSelect={handleSelectSection}
        onAdd={handleAddSection}
        onRename={handleRenameSection}
        onDelete={handleDeleteSection}
        onReorder={handleReorderSections}
        onSetColor={handleSetSectionColor}
      />

      {/* ── Drawing / tool toolbar ── */}
      <DrawToolbar
        tool={tool}
        onSelectTool={setTool}
        strokeColor={strokeColor}
        onSelectColor={setStrokeColor}
        strokeWidth={strokeWidth}
        onChangeStrokeWidth={setStrokeWidth}
        // undo / redo
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => canvasApiRef.current?.undo?.()}
        onRedo={() => canvasApiRef.current?.redo?.()}
        // zoom
        zoom={zoom}
        onZoomIn={() => canvasApiRef.current?.zoomIn?.()}
        onZoomOut={() => canvasApiRef.current?.zoomOut?.()}
        onZoomReset={() => canvasApiRef.current?.zoomReset?.()}
        // background
        bgStyle={bgStyle}
        onCycleBg={handleCycleBg}
        // export
        onExportPNG={() => canvasApiRef.current?.exportPNG?.()}
        onExportNotebook={handleExportNotebook}
        onImportNotebook={handleImportNotebook}
      />

      {/* ── Main content area ── */}
      <div className="flex flex-1 min-h-0">
        {/* Page sidebar */}
        <PageTabs
          pages={activeSection?.pages ?? []}
          activePageId={activePageId}
          onSelect={setActivePageId}
          onAdd={handleAddPage}
          onRename={handleRenamePage}
          onDelete={handleDeletePage}
          onReorder={handleReorderPages}
        />

        {/* Canvas column */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Page title header */}
          <h2 className="shrink-0 px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-900">
            {activePage?.title ?? 'No page selected'}
          </h2>

          {activePageId && (
            <PageCanvas
              pageId={activePageId}
              tool={tool}
              onPlacementDone={handlePlacementDone}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              bgStyle={bgStyle}
              apiRef={canvasApiRef}
              onZoomChange={setZoom}
              onHistoryChange={handleHistoryChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
