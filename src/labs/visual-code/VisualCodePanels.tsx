import { RefObject } from 'react'
import { ExternalLink, Plus } from 'lucide-react'
import { serializeProject } from './transpiler.ts'
import {
  BlockPalette as SharedBlockPalette, BlockProgram as SharedBlockProgram, filterPaletteBlocks,
  type BlockEditorClassNames, type BlockProgramProps, type BlockPaletteProps as SharedBlockPaletteProps,
} from './BlockEditor.tsx'
import styles from './VisualCodeStudio.module.css'
import type { Block, BlockType, GeneratedOutput, Project } from './types.ts'

// Maps Visual Code Studio's own CSS classes onto the shared block-editor
// widget's generic slots — see BlockEditor.tsx's own comment for why this is
// a per-host classNames bundle rather than a shared stylesheet (this app and
// HTML Lab's Visual JS use genuinely different, independent theming systems:
// this one themes via Tailwind custom properties directly in CSS, HTML Lab's
// via a JS hook injecting `--hl-*` variables — reconciling them would mean
// merging two different dark-mode mechanisms, out of scope here).
const BLOCK_EDITOR_CLASSNAMES: BlockEditorClassNames = {
  paletteSearchWrap: undefined,
  searchInput: styles.input,
  paletteScroll: styles.scroll,
  emptyState: styles.emptyProgram,
  paletteGroup: styles.paletteGroup,
  groupLabel: styles.groupTitle,
  paletteBtn: styles.paletteBlock,
  programHeader: undefined,
  importBtn: styles.button,
  importBtnFlash: undefined,
  programScroll: styles.scroll,
  blockRowWrapper: undefined,
  blockRow: styles.stackBlock,
  blockRowActive: styles.stackBlockActive,
  blockTopLine: styles.blockTopline,
  blockDot: styles.blockCategoryDot,
  blockName: styles.blockName,
  blockActions: styles.blockActions,
  iconBtn: styles.iconButton,
  blockSummary: styles.blockSummary,
  fieldEditor: styles.inlineEditor,
  conceptHint: styles.blockConceptHint,
  childSlot: styles.childSlot,
  depthClass: () => '', // no depth-based rainbow bracket colors in this app's design language
  childActions: styles.childActions,
  addChildBtn: styles.button,
  addChildIcon: undefined,
  addChildLabel: undefined,
  propRow: styles.field,
  propLabel: undefined, // styled via `.field span`, not its own class
  propInput: styles.input,
  fieldCode: styles.textarea,
  nestedExprSlot: styles.nestedExprSlot,
}

// ── Block Palette ─────────────────────────────────────────────────────────────

interface BlockPaletteProps {
  query: string
  onQueryChange: (q: string) => void
  onAddBlock: (type: BlockType) => void
  targetId: string
  filterBlock?: SharedBlockPaletteProps['filterBlock']
}

export function BlockPalette({ query, onQueryChange, onAddBlock, targetId, filterBlock }: BlockPaletteProps) {
  const isTs = targetId === 'typescript'
  const count = filterPaletteBlocks(query, isTs, filterBlock).length

  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLine}>
          <h2 className={styles.panelTitle}>Blocks</h2>
          <span className={styles.blockCount}>{count}</span>
        </div>
      </div>
      <SharedBlockPalette
        query={query}
        onQueryChange={onQueryChange}
        onAddBlock={onAddBlock}
        allowTsOnly={isTs}
        filterBlock={filterBlock}
        classNames={BLOCK_EDITOR_CLASSNAMES}
      />
    </>
  )
}

// ── Program Panel ─────────────────────────────────────────────────────────────

interface ProgramPanelProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelect: (id: string) => void
  onAddBlock: (type: BlockType, parentId?: string | null) => void
  onDeleteBlock: (id: string) => void
  onMoveBlock: (id: string, dir: 'up' | 'down') => void
  onUpdateField: (blockId: string, name: string, value: string) => void
  onUpdateFields: (blockId: string, patch: Record<string, string>) => void
  domHints: string[]
  classHints: string[]
  variableHints: string[]
  project: Project
  filterField?: BlockProgramProps['filterField']
}

export function ProgramPanel({
  blocks, selectedBlockId, onSelect, onAddBlock, onDeleteBlock, onMoveBlock, onUpdateField, onUpdateFields,
  domHints, classHints, variableHints, filterField,
}: ProgramPanelProps) {
  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLine}>
          <h2 className={styles.panelTitle}>Program</h2>
          <button type="button" className={styles.button} onClick={() => onAddBlock('class')}>
            <Plus size={14} /> Class
          </button>
        </div>
      </div>
      <SharedBlockProgram
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        onSelect={onSelect}
        onDelete={onDeleteBlock}
        onMove={onMoveBlock}
        onAddChild={(type, parentId) => onAddBlock(type, parentId)}
        onUpdateField={onUpdateField}
        onUpdateFields={onUpdateFields}
        domHints={domHints}
        classHints={classHints}
        variableHints={variableHints}
        classNames={BLOCK_EDITOR_CLASSNAMES}
        filterField={filterField}
        emptyMessage={
          <div className={styles.emptyProgram}>
            <strong>Your program is empty</strong>
            <span>Click any block in the palette to add it here, then select it to learn how it works.</span>
          </div>
        }
      />
    </>
  )
}

// ── Output Panel ──────────────────────────────────────────────────────────────

interface OutputPanelProps {
  activeTab: string
  onTabChange: (tab: string) => void
  generated: GeneratedOutput
  selectedBlock: Block | null
  project: Project
  messages: { type: string; value: string }[]
  previewRef: RefObject<HTMLIFrameElement>
  onRun: () => void
  onOpenCodeLens: () => void
  onMakeBlocks: (code: string) => void
  onFieldChange: (blockId: string, name: string, value: string) => void
  onHtmlChange: (html: string) => void
  previewHtml: string
}

export function OutputPanel({ activeTab, generated, project, messages, previewRef, onRun, onOpenCodeLens, onMakeBlocks, onHtmlChange, previewHtml }: OutputPanelProps) {
  const openInCodeLens = onOpenCodeLens

  return (
    <>
      {activeTab === 'code' && (
        <div className={styles.editor}>
          {generated.diagnostics.map((item, i) => (
            <div className={styles.diagnostic} key={`${item.message}-${i}`}>{item.message}</div>
          ))}
          <div className={styles.codeHeader}>
            <span className={styles.codeLabel}>{project.target === 'typescript' ? 'TypeScript' : 'JavaScript'} · {generated.code.split('\n').length} lines</span>
            <div className={styles.codeHeaderActions}>
              <button type="button" className={styles.codeLensBtn} onClick={() => onMakeBlocks(generated.code)} title="Convert this code back into visual blocks">
                ← Make blocks
              </button>
              <button type="button" className={styles.codeLensBtn} onClick={openInCodeLens} title="Open in CodeLens to visualize execution">
                <ExternalLink size={12} /> Open in CodeLens
              </button>
            </div>
          </div>
          <pre className={styles.code}>{generated.code || '// Add blocks to generate code'}</pre>
        </div>
      )}

      {activeTab === 'run' && (
        <div className={styles.editor}>
          <div className={styles.runHeader}>
            <button type="button" className={styles.codeLensBtn} onClick={openInCodeLens} title="Visualize in CodeLens">
              <ExternalLink size={12} /> Visualize in CodeLens
            </button>
          </div>
          <div className={styles.output}>
            {messages.length ? (
              <>
                {messages.map((msg, i) => (
                  <p key={`${msg.type}-${i}`} className={`${styles.outputLine} ${msg.type === 'error' ? styles.error : msg.type === 'warn' ? styles.warn : ''}`}>
                    <span className={styles.outputType}>{msg.type}</span> {msg.value}
                  </p>
                ))}
              </>
            ) : <p className={styles.outputPlaceholder}>Click Run to execute your program and see output here.</p>}
          </div>
          <iframe ref={previewRef} className={styles.preview} title="Run output" sandbox="allow-scripts" />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className={styles.editor}>
          <label className={styles.field}>
            <span>Preview HTML</span>
            <textarea className={styles.textarea} value={project.html} onChange={e => onHtmlChange(e.target.value)} />
          </label>
          <iframe className={styles.preview} title="HTML preview" sandbox="allow-scripts" srcDoc={previewHtml} />
        </div>
      )}

      {activeTab === 'data' && (
        <pre className={styles.code}>{serializeProject(project)}</pre>
      )}
    </>
  )
}

