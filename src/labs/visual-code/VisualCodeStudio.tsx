import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Copy, Download, FileCode, FilePlus, FolderOpen, Play, RotateCcw, Save, Trash2, X } from 'lucide-react'
import { createBlock } from './blocks.ts'
import {
  DEFAULT_PROJECT,
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
import { buildRunnableHtml } from './runJavaScript.ts'
import { BlockPalette, ProgramPanel, OutputPanel } from './VisualCodePanels.tsx'
import ConceptPanel from './ConceptPanel.tsx'
import styles from './VisualCodeStudio.module.css'
import type { Block, BlockType, Project, ProjectFile } from './types'

interface Props {
  initialProject?: Project
  onProjectChange?: (p: Project) => void
  onCodeChange?: (code: string, output: ReturnType<typeof transpileProject>) => void
  onBack?: () => void
}

type RightTab = 'concept' | 'code' | 'run' | 'preview' | 'data'

export default function VisualCodeStudio({ initialProject = DEFAULT_PROJECT, onProjectChange, onCodeChange, onBack }: Props) {
  const [project, setProject] = useState<Project>(() => normalizeProject(cloneProject(initialProject)))
  const [query, setQuery] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(project.files[0]?.blocks[0]?.id ?? null)
  const [rightTab, setRightTab] = useState<RightTab>('concept')
  const [messages, setMessages] = useState<{ type: string; value: string }[]>([])
  const [saveState, setSaveState] = useState<'idle' | 'dirty' | 'saved'>('idle')
  const [editingFileName, setEditingFileName] = useState<string | null>(null)
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

  function importProject(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = parseProject(String(reader.result ?? ''))
        setProject(next)
        setSelectedBlockId(next.files[0]?.blocks[0]?.id ?? null)
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

  return (
    <section className={styles.studio}>
      <input ref={importRef} type="file" accept=".json,.vcproject.json" className={styles.hiddenInput} onChange={importProject} />

      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div className={styles.titleGroup}>
          {onBack && (
            <button className={styles.button} onClick={onBack} aria-label="Back">
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <input
              className={styles.projectName}
              value={project.name}
              aria-label="Project name"
              onChange={e => commit(p => ({ ...p, name: e.target.value }))}
            />
            <p className={styles.subtitle}>
              {project.files.length} file{project.files.length !== 1 ? 's' : ''} · {project.target === 'typescript' ? 'TypeScript' : 'JavaScript'}
            </p>
          </div>
        </div>
        <div className={styles.topActions}>
          <select
            className={styles.select}
            value={project.target}
            onChange={e => commit(p => ({ ...p, target: e.target.value as Project['target'] }))}
            aria-label="Target language"
          >
            {targetList.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <button className={`${styles.button} ${styles.primaryButton}`} onClick={runProject}>
            <Play size={15} /> Run
          </button>
          <button className={styles.button} onClick={() => navigator.clipboard?.writeText(generated.code)}>
            <Copy size={15} /> Copy
          </button>
          <button className={styles.button} onClick={() => download(generated.code, `${slug(project.name)}.${ext}`, 'text/plain')}>
            <Download size={15} /> Code
          </button>
          <button className={styles.button} onClick={() => importRef.current?.click()}>
            <FolderOpen size={15} /> Import
          </button>
          <button className={styles.button} onClick={exportProject}>
            <Save size={15} /> Save
          </button>
          <button className={styles.button} onClick={() => { setProject(normalizeProject(cloneProject(DEFAULT_PROJECT))); setSelectedBlockId(null) }}>
            <RotateCcw size={15} /> Reset
          </button>
          <span className={styles.saveState}>
            {saveState === 'dirty' ? 'Unsaved' : saveState === 'saved' ? 'Saved' : 'Ready'}
          </span>
        </div>
      </header>

      {/* ── File tabs ── */}
      <div className={styles.fileTabs}>
        {project.files.map(f => (
          <div
            key={f.id}
            className={`${styles.fileTab} ${f.id === project.activeFileId ? styles.fileTabActive : ''}`}
            onClick={() => switchFile(f.id)}
          >
            <FileCode size={12} />
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
                className={styles.fileTabClose}
                onClick={e => { e.stopPropagation(); deleteFile(f.id) }}
                aria-label={`Delete ${f.name}`}
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button className={styles.fileTabAdd} onClick={addFile} aria-label="Add file">
          <FilePlus size={14} />
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

        {/* Right: Concept / Code / Run / Preview / Data */}
        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.tabs}>
              {([
                ['concept', 'Concept'],
                ['code', 'Code'],
                ['run', 'Run'],
                ['preview', 'Preview'],
                ['data', 'Data'],
              ] as [RightTab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  className={`${styles.tab} ${rightTab === id ? styles.tabActive : ''}`}
                  onClick={() => setRightTab(id)}
                >
                  {label}
                </button>
              ))}
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
