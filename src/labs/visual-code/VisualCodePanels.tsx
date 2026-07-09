import { RefObject } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { BLOCK_GROUPS, BLOCK_LIBRARY, blockDefinition, canContainChildren, childOptionsFor, summarizeBlock } from './blocks.ts'
import { serializeProject } from './transpiler.ts'
import styles from './VisualCodeStudio.module.css'
import type { Block, BlockType, FieldSpec, GeneratedOutput, Project } from './types.ts'

// ── Block Palette ─────────────────────────────────────────────────────────────

interface BlockPaletteProps {
  query: string
  onQueryChange: (q: string) => void
  onAddBlock: (type: BlockType) => void
  targetId: string
}

export function BlockPalette({ query, onQueryChange, onAddBlock, targetId }: BlockPaletteProps) {
  const isTs = targetId === 'typescript'
  const filtered = BLOCK_LIBRARY.filter(item => {
    if (item.tsOnly && !isTs) return false
    const text = `${item.label} ${item.category} ${item.description}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLine}>
          <h2 className={styles.panelTitle}>Blocks</h2>
        </div>
        <input
          className={styles.input}
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search class, getter, event…"
        />
      </div>
      <div className={styles.scroll}>
        {BLOCK_GROUPS.map(group => {
          const groupBlocks = filtered.filter(item => item.category === group.id)
          if (!groupBlocks.length) return null
          return (
            <section className={styles.paletteGroup} key={group.id}>
              <h3 className={styles.groupTitle}>{group.label}</h3>
              <div className={styles.blockList}>
                {groupBlocks.map(item => (
                  <button
                    key={item.type}
                    type="button"
                    className={styles.paletteBlock}
                    data-category={item.category}
                    onClick={() => onAddBlock(item.type as BlockType)}
                  >
                    <span className={styles.blockName}>{item.label}</span>
                    <span className={styles.blockDescription}>{item.description}</span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </div>
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
  onUpdateField: (name: string, value: string) => void
  project: Project
}

export function ProgramPanel({ blocks, selectedBlockId, onSelect, onAddBlock, onDeleteBlock, onMoveBlock, onUpdateField, project }: ProgramPanelProps) {
  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLine}>
          <h2 className={styles.panelTitle}>Program</h2>
          <button type="button" className={styles.button} onClick={() => onAddBlock('class')}>
            <Plus size={16} /> Class
          </button>
        </div>
      </div>
      <div className={styles.scroll}>
        {blocks.length ? (
          <div className={styles.stack}>
            {blocks.map(item => (
              <BlockNode
                key={item.id}
                block={item}
                selectedBlockId={selectedBlockId}
                onSelect={onSelect}
                onAddBlock={onAddBlock}
                onDeleteBlock={onDeleteBlock}
                onMoveBlock={onMoveBlock}
                onUpdateField={onUpdateField}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Add blocks from the palette to build a program.</div>
        )}
      </div>
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
  onFieldChange: (name: string, value: string) => void
  onHtmlChange: (html: string) => void
  previewHtml: string
}

export function OutputPanel({ activeTab, generated, selectedBlock, project, messages, previewRef, onRun, onFieldChange, onHtmlChange, previewHtml }: OutputPanelProps) {
  return (
    <>
      {activeTab === 'code' && (
        <div className={styles.editor}>
          {generated.diagnostics.map((item, i) => (
            <div className={styles.diagnostic} key={`${item.message}-${i}`}>{item.message}</div>
          ))}
          <pre className={styles.code}>{generated.code}</pre>
        </div>
      )}

      {activeTab === 'run' && (
        <div className={styles.editor}>
          <button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={onRun}>Run code</button>
          <div className={styles.output}>
            {messages.length ? messages.map((msg, i) => (
              <p key={`${msg.type}-${i}`} className={`${styles.outputLine} ${msg.type === 'error' ? styles.error : ''}`}>
                [{msg.type}] {msg.value}
              </p>
            )) : <p className={styles.outputLine}>Run the project to see console output.</p>}
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

// ── Block Node ────────────────────────────────────────────────────────────────

interface BlockNodeProps {
  block: Block
  selectedBlockId: string | null
  onSelect: (id: string) => void
  onAddBlock: (type: BlockType, parentId?: string | null) => void
  onDeleteBlock: (id: string) => void
  onMoveBlock: (id: string, dir: 'up' | 'down') => void
  onUpdateField: (name: string, value: string) => void
}

function BlockNode({ block, selectedBlockId, onSelect, onAddBlock, onDeleteBlock, onMoveBlock, onUpdateField }: BlockNodeProps) {
  const def = blockDefinition(block.type)
  const childOptions = childOptionsFor(block.type)
  const isSelected = selectedBlockId === block.id

  return (
    <article
      className={`${styles.stackBlock} ${isSelected ? styles.stackBlockActive : ''}`}
      data-category={block.category}
      onClick={() => onSelect(block.id)}
    >
      <div className={styles.blockTopline}>
        <span className={styles.blockName}>{def?.label ?? block.type}</span>
        <div className={styles.blockActions}>
          <button type="button" className={styles.iconButton} title="Move up" onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'up') }}>
            <ArrowUp size={14} />
          </button>
          <button type="button" className={styles.iconButton} title="Move down" onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'down') }}>
            <ArrowDown size={14} />
          </button>
          <button type="button" className={styles.iconButton} title="Delete" onClick={e => { e.stopPropagation(); onDeleteBlock(block.id) }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <span className={styles.blockDescription}>{summarizeBlock(block)}</span>

      {/* Inline field editor when selected */}
      {isSelected && def?.fields?.length ? (
        <div className={styles.inlineEditor} onClick={e => e.stopPropagation()}>
          {def.fields.map(field => <FieldInput key={field.name} field={field} block={block} onChange={onUpdateField} />)}
        </div>
      ) : null}

      {canContainChildren(block.type) && (
        <div className={styles.childSlot}>
          {(block.children ?? []).map(child => (
            <BlockNode
              key={child.id}
              block={child}
              selectedBlockId={selectedBlockId}
              onSelect={onSelect}
              onDeleteBlock={onDeleteBlock}
              onMoveBlock={onMoveBlock}
              onAddBlock={onAddBlock}
              onUpdateField={onUpdateField}
            />
          ))}
          <div className={styles.childActions}>
            {childOptions.map(option => (
              <button
                key={option.type}
                type="button"
                className={styles.button}
                onClick={e => { e.stopPropagation(); onAddBlock(option.type as BlockType, block.id) }}
              >
                <Plus size={16} /> {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

// ── Field Input ───────────────────────────────────────────────────────────────

function FieldInput({ field, block, onChange }: { field: FieldSpec; block: Block; onChange: (name: string, value: string) => void }) {
  const value = block.fields?.[field.name] ?? ''
  return (
    <label className={styles.field}>
      <span>{field.label}</span>
      {field.kind === 'select' ? (
        <select className={styles.select} value={value} onChange={e => onChange(field.name, e.target.value)}>
          {(field.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : field.kind === 'code' ? (
        <textarea className={styles.textarea} value={value} onChange={e => onChange(field.name, e.target.value)} />
      ) : (
        <input className={styles.input} value={value} onChange={e => onChange(field.name, e.target.value)} />
      )}
    </label>
  )
}
