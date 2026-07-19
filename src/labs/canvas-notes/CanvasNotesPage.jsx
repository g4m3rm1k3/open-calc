import { useEffect, useState } from 'react'
import SectionTabs from './SectionTabs.jsx'
import PageTabs from './PageTabs.jsx'
import PageCanvas from './PageCanvas.jsx'
import DrawToolbar from './DrawToolbar.jsx'
import { listSections, putSection, deleteSection, deletePage } from './db.js'

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

export default function CanvasNotesPage() {
  const [sections, setSections] = useState(null) // null = still loading from IndexedDB
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [activePageId, setActivePageId] = useState(null)
  const [tool, setTool] = useState('select')
  const [strokeColor, setStrokeColor] = useState('#1e1e1e')
  const [strokeWidth, setStrokeWidth] = useState(3)

  // Load the notebook's structure once, on mount. An empty store means this
  // is the very first time canvas-notes has opened in this browser profile
  // — seed it with INITIAL_SECTIONS so there's something to show, and
  // persist that seed immediately so it's still there next time.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = await listSections()
      const loaded = stored.length ? stored : INITIAL_SECTIONS
      if (!stored.length) {
        await Promise.all(INITIAL_SECTIONS.map((s) => putSection(s)))
      }
      if (cancelled) return
      setSections(loaded)
      setActiveSectionId(loaded[0]?.id ?? null)
      setActivePageId(loaded[0]?.pages[0]?.id ?? null)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const activeSection = sections?.find((s) => s.id === activeSectionId)
  const activePage = activeSection?.pages.find((p) => p.id === activePageId)

  const handleSelectSection = (sectionId) => {
    setActiveSectionId(sectionId)
    const newSection = sections.find((s) => s.id === sectionId)
    setActivePageId(newSection?.pages[0]?.id ?? null)
  }

  // Every section always has at least one page, and the notebook always has
  // at least one section — every other component in this lab (PageTabs,
  // PageCanvas, the content area) was built assuming that invariant holds,
  // so both delete handlers refuse to break it rather than pushing a
  // "what if there's nothing to show" check into every reader of `sections`.

  const handleAddSection = async () => {
    const newPage = { id: uid(), title: 'Untitled Page' }
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
    if (activePageId === id) {
      setActivePageId(updated.pages[0]?.id ?? null)
    }
  }

  if (!sections) {
    return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading notebook…</div>
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <SectionTabs
        sections={sections}
        activeSectionId={activeSectionId}
        onSelect={handleSelectSection}
        onAdd={handleAddSection}
        onRename={handleRenameSection}
        onDelete={handleDeleteSection}
      />
      <DrawToolbar
        tool={tool}
        onSelectTool={setTool}
        strokeColor={strokeColor}
        onSelectColor={setStrokeColor}
        strokeWidth={strokeWidth}
        onChangeStrokeWidth={setStrokeWidth}
      />
      <div className="flex flex-1 min-h-0">
        <PageTabs
          pages={activeSection?.pages ?? []}
          activePageId={activePageId}
          onSelect={setActivePageId}
          onAdd={handleAddPage}
          onRename={handleRenamePage}
          onDelete={handleDeletePage}
        />
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <h2 className="shrink-0 px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-900">
            {activePage?.title ?? 'No page selected'}
          </h2>
          {activePageId && (
            <PageCanvas
              pageId={activePageId}
              tool={tool}
              onPlacementDone={() => setTool('select')}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
            />
          )}
        </div>
      </div>
    </div>
  )
}
