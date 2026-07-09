import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useDesktop } from '../../components/desktop/DesktopProvider.jsx'
import { ArrowLeft, BookOpen, Copy, Download, FileCode, FilePlus, FolderOpen, MoreHorizontal, Play, RotateCcw, Save, Trash2, X } from 'lucide-react'
import { createBlock } from './blocks.ts'
import {
  TARGETS,
  activeFile,
  cloneProject,
  findBlock,
  insertBlock,
  moveBlock,
  normalizeProject,
  parseProject,
  removeBlock,
  serializeProject,
  transpileProject,
  updateBlock,
} from './transpiler.ts'
import { EMPTY_PROJECT, EXAMPLES } from './examples.ts'
import { buildRunnableHtml } from './runJavaScript.ts'
import { BlockPalette, ProgramPanel, OutputPanel } from './VisualCodePanels.tsx'
import ConceptPanel from './ConceptPanel.tsx'
import styles from './VisualCodeStudio.module.css'
import type { Block, BlockType, Project, ProjectFile } from './types'

const CodeLensLazy = lazy(() => import('../codelens/codelens/CodeLens.tsx'))

function CodeLensWindow({ onBack }: { onBack?: () => void }) {
  const [handoff] = useState<{ code?: string; lang?: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem('codelens-handoff') || 'null') } catch { return null }
  })
  useEffect(() => { localStorage.removeItem('codelens-handoff') }, [])
  return (
    <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>Loading CodeLens…</div>}>
      <CodeLensLazy onBack={onBack ?? (() => {})} initialCode={handoff?.code} initialLang={handoff?.lang} backLabel="Visual Code Studio" />
    </Suspense>
  )
}

interface Props {
  initialProject?: Project
  onProjectChange?: (p: Project) => void
  onCodeChange?: (code: string, output: ReturnType<typeof transpileProject>) => void
  onBack?: () => void
}

type RightTab = 'concept' | 'code' | 'run' | 'preview' | 'data'

export default function VisualCodeStudio({ initialProject = EMPTY_PROJECT, onProjectChange, onCodeChange, onBack }: Props) {
  const { openWindow } = useDesktop()
  const [project, setProject] = useState<Project>(() => normalizeProject(cloneProject(initialProject)))
  const [query, setQuery] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [rightTab, setRightTab] = useState<RightTab>('concept')
  const [messages, setMessages] = useState<{ type: string; value: string }[]>([])
  const [saveState, setSaveState] = useState<'idle' | 'dirty' | 'saved'>('idle')
  const [editingFileName, setEditingFileName] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)

  const file = activeFile(project)
  const generated = useMemo(() => transpileProject(project, project.activeFileId), [project])
  const previewHtml = useMemo(() => buildRunnableHtml({ html: project.html, code: generated.code }), [project.html, generated.code])
  const selectedBlock = useMemo(() => findBlock(file?.blocks ?? [], selectedBlockId), [file, selectedBlockId])
  const targetList = Object.values(TARGETS)

  useEffect(() => { onProjectChange?.(project) }, [project, onProjectChange])
  useEffect(() => { onCodeChange?.(generated.code, generated) }, [generated, onCodeChange])
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.source !== 'visual-code-runner') return
      setMessages(prev => [...prev, { type: e.data.type, value: e.data.value }])
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  function commit(updater: (current: Project) => Project | Partial<Project>) {
    setProject(current => normalizeProject(typeof updater === 'function' ? updater(current) as Project : updater as Project))
    setSaveState('dirty')
  }

  // ── File management ──────────────────────────────────────────────────────
  function addFile() {
    const name = `module_${Date.now().toString(36)}.${project.target === 'typescript' ? 'ts' : 'js'}`
    const newFile: ProjectFile = { id: `file_${Date.now().toString(36)}`, name, blocks: [] }
    commit(p => ({ ...p, files: [...p.files, newFile], activeFileId: newFile.id }))
    setSelectedBlockId(null)
  }

  function deleteFile(fileId: string) {
    if (project.files.length <= 1) return
    const remaining = project.files.filter(f => f.id !== fileId)
    const nextActive = remaining[0]?.id ?? ''
    commit(p => ({ ...p, files: remaining, activeFileId: nextActive }))
    setSelectedBlockId(null)
  }

  function renameFile(fileId: string, name: string) {
    commit(p => ({ ...p, files: p.files.map(f => f.id === fileId ? { ...f, name } : f) }))
    setEditingFileName(null)
  }

  function switchFile(fileId: string) {
    commit(p => ({ ...p, activeFileId: fileId }))
    setSelectedBlockId(null)
  }

  // ── Block management ─────────────────────────────────────────────────────
  function commitBlocks(updater: (blocks: Block[]) => Block[]) {
    commit(p => ({
      ...p,
      files: p.files.map(f => f.id === p.activeFileId ? { ...f, blocks: updater(f.blocks) } : f),
    }))
  }

  function addBlock(type: BlockType, parentId: string | null = null) {
    const block = createBlock(type)
    commitBlocks(blocks => insertBlock(blocks, parentId, block))
    setSelectedBlockId(block.id)
    setRightTab('concept')
  }

  function deleteBlock(id: string) {
    commitBlocks(blocks => removeBlock(blocks, id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  function updateField(name: string, value: string) {
    if (!selectedBlock) return
    commitBlocks(blocks => updateBlock(blocks, selectedBlock.id, b => ({ ...b, fields: { ...b.fields, [name]: value } })))
  }

  function runProject() {
    setMessages([])
    setRightTab('run')
    if (previewRef.current) previewRef.current.srcdoc = previewHtml
  }

  function openInCodeLens() {
    const lang = project.target === 'typescript' ? 'ts' : 'js'
    try {
      localStorage.setItem('codelens-handoff', JSON.stringify({ code: generated.code, lang }))
    } catch {}
    openWindow({ id: 'codelens', label: 'CodeLens', emoji: '🔍', Component: CodeLensWindow })
  }

  function loadExample(id: string) {
    const ex = EXAMPLES.find(e => e.id === id)
    if (!ex) return
    setProject(normalizeProject(cloneProject(ex.project)))
    setSelectedBlockId(null)
    setSaveState('idle')
    setShowExamples(false)
  }

  function clearProject() {
    setProject(normalizeProject(cloneProject(EMPTY_PROJECT)))
    setSelectedBlockId(null)
    setSaveState('idle')
    setShowExamples(false)
  }

  function importProject(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = parseProject(String(reader.result ?? ''))
        setProject(next)
        setSelectedBlockId(null)
        setSaveState('idle')
      } catch (err) {
        window.alert(`Could not import: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)
  }

  function exportProject() {
    download(serializeProject(project), `${slug(project.name)}.vcproject.json`, 'application/json')
    setSaveState('saved')
  }

  const ext = TARGETS[project.target]?.fileExtension ?? 'ts'

  const [showMore, setShowMore] = useState(false)

  return (
    <section className={styles.studio}>
      <input ref={importRef} type="file" accept=".json,.vcproject.json" className={styles.hiddenInput} onChange={importProject} />

      {/* ── Single-row topbar ── */}
      <header className={styles.topbar}>
        <div className={styles.titleGroup}>
          {onBack && (
            <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Back">
              <ArrowLeft size={16} />
            </button>
          )}
          <input
            className={styles.projectName}
            value={project.name}
            aria-label="Project name"
            onChange={e => commit(p => ({ ...p, name: e.target.value }))}
          />
          {/* Language pill toggle */}
          <div className={styles.langToggle} role="group" aria-label="Target language">
            {targetList.map(t => (
              <button
                key={t.id}
                type="button"
                className={`${styles.langPill} ${project.target === t.id ? styles.langActive : ''}`}
                onClick={() => commit(p => ({ ...p, target: t.id as Project['target'] }))}
              >
                {t.id === 'typescript' ? 'TS' : 'JS'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.topActions}>
          <span className={styles.saveState} aria-live="polite">
            {saveState === 'dirty' ? '● Unsaved' : saveState === 'saved' ? '✓ Saved' : ''}
          </span>

          {/* Examples picker */}
          <div className={styles.moreWrap}>
            <button
              type="button"
              className={`${styles.actionBtn} ${showExamples ? styles.actionBtnActive : ''}`}
              onClick={() => { setShowExamples(v => !v); setShowMore(false) }}
            >
              <BookOpen size={14} /> Examples
            </button>
            {showExamples && (
              <div className={`${styles.moreMenu} ${styles.examplesMenu}`} onMouseLeave={() => setShowExamples(false)}>
                <div className={styles.examplesHeader}>Load an example project</div>
                {EXAMPLES.map(ex => (
                  <button key={ex.id} type="button" className={styles.exampleItem} onClick={() => loadExample(ex.id)}>
                    <span className={styles.exampleEmoji}>{ex.emoji}</span>
                    <span className={styles.exampleInfo}>
                      <span className={styles.exampleName}>{ex.name}</span>
                      <span className={styles.exampleDesc}>{ex.description}</span>
                    </span>
                  </button>
                ))}
                <div className={styles.menuDivider} />
                <button type="button" className={styles.moreItem} onClick={clearProject}>
                  <Trash2 size={13} /> Clear everything
                </button>
              </div>
            )}
          </div>

          <button type="button" className={`${styles.actionBtn} ${styles.primaryButton}`} onClick={runProject}>
            <Play size={14} /> Run
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => navigator.clipboard?.writeText(generated.code)} title="Copy generated code">
            <Copy size={14} />
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => download(generated.code, `${slug(project.name)}.${ext}`, 'text/plain')} title="Download code">
            <Download size={14} />
          </button>
          <button type="button" className={styles.actionBtn} onClick={exportProject} title="Save project">
            <Save size={14} />
          </button>
          {/* More menu */}
          <div className={styles.moreWrap}>
            <button type="button" className={styles.actionBtn} onClick={() => { setShowMore(v => !v); setShowExamples(false) }} title="More options">
              <MoreHorizontal size={14} />
            </button>
            {showMore && (
              <div className={styles.moreMenu} onMouseLeave={() => setShowMore(false)}>
                <button type="button" className={styles.moreItem} onClick={() => { importRef.current?.click(); setShowMore(false) }}>
                  <FolderOpen size={14} /> Import project
                </button>
                <button type="button" className={styles.moreItem} onClick={() => { clearProject(); setShowMore(false) }}>
                  <Trash2 size={14} /> Clear project
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── File tabs + new file button ── */}
      <div className={styles.fileTabs}>
        {project.files.map(f => (
          <div
            key={f.id}
            className={`${styles.fileTab} ${f.id === project.activeFileId ? styles.fileTabActive : ''}`}
            onClick={() => switchFile(f.id)}
          >
            <FileCode size={11} />
            {editingFileName === f.id ? (
              <input
                className={styles.fileNameInput}
                defaultValue={f.name}
                autoFocus
                onClick={e => e.stopPropagation()}
                onBlur={e => renameFile(f.id, e.target.value || f.name)}
                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingFileName(null) }}
              />
            ) : (
              <span onDoubleClick={e => { e.stopPropagation(); setEditingFileName(f.id) }}>{f.name}</span>
            )}
            {project.files.length > 1 && (
              <button
                type="button"
                className={styles.fileTabClose}
                onClick={e => { e.stopPropagation(); deleteFile(f.id) }}
                aria-label={`Delete ${f.name}`}
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button type="button" className={styles.fileTabAdd} onClick={addFile} aria-label="Add file">
          <FilePlus size={13} />
        </button>
      </div>

      {/* ── 3-panel body ── */}
      <div className={styles.main}>

        {/* Left: Block palette */}
        <aside className={styles.panel}>
          <BlockPalette
            query={query}
            onQueryChange={setQuery}
            onAddBlock={addBlock}
            targetId={project.target}
          />
        </aside>

        {/* Center: Program tree */}
        <main className={`${styles.panel} ${styles.workspace}`}>
          <ProgramPanel
            blocks={file?.blocks ?? []}
            selectedBlockId={selectedBlockId}
            onSelect={id => { setSelectedBlockId(id); setRightTab('concept') }}
            onAddBlock={addBlock}
            onDeleteBlock={deleteBlock}
            onMoveBlock={(id, dir) => commitBlocks(blocks => moveBlock(blocks, id, dir))}
            onUpdateField={updateField}
            project={project}
          />
        </main>

        {/* Right: Learn / Code / Run / Preview */}
        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.tabs}>
              {(['learn', 'code', 'run', 'preview'] as const).map(id => {
                const active = id === 'learn' ? rightTab === 'concept' : rightTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                    onClick={() => setRightTab(id === 'learn' ? 'concept' : id as RightTab)}
                  >
                    {id === 'learn' ? '✦ Learn' : id === 'code' ? 'Code' : id === 'run' ? 'Run' : 'Preview'}
                  </button>
                )
              })}
            </div>
          </div>
          <div className={styles.scroll}>
            {rightTab === 'concept' && (
              <ConceptPanel
                project={project}
                selectedBlockId={selectedBlockId}
                generated={generated}
              />
            )}
            {rightTab !== 'concept' && (
              <OutputPanel
                activeTab={rightTab}
                onTabChange={tab => setRightTab(tab as RightTab)}
                generated={generated}
                selectedBlock={selectedBlock}
                project={project}
                messages={messages}
                previewRef={previewRef}
                onRun={runProject}
                onOpenCodeLens={openInCodeLens}
                onFieldChange={updateField}
                onHtmlChange={html => commit(p => ({ ...p, html }))}
                previewHtml={previewHtml}
              />
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

function download(text: string, filename: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function slug(value: string) {
  return String(value || 'project').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'project'
}

// Re-export so HTML lab can use it without touching the old file
export type { Project, ProjectFile, Block }
