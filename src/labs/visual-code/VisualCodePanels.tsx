import { RefObject } from 'react'
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from 'lucide-react'
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
    if (item.childOnly) return false
    const text = `${item.label} ${item.category} ${item.description}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLine}>
          <h2 className={styles.panelTitle}>Blocks</h2>
          <span className={styles.blockCount}>{filtered.length}</span>
        </div>
        <input
          className={styles.input}
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search blocks…"
        />
      </div>
      <div className={styles.scroll}>
        {BLOCK_GROUPS.map(group => {
          const groupBlocks = filtered.filter(item => item.category === group.id)
          if (!groupBlocks.length) return null
          return (
            <section className={styles.paletteGroup} key={group.id}>
              <h3 className={styles.groupTitle} data-category={group.id}>{group.label}</h3>
              <div className={styles.blockList}>
                {groupBlocks.map(item => {
                  const def = blockDefinition(item.type)
                  return (
                    <button
                      key={item.type}
                      type="button"
                      className={styles.paletteBlock}
                      data-category={item.category}
                      onClick={() => onAddBlock(item.type as BlockType)}
                    >
                      <div className={styles.paletteBlockMain}>
                        <span className={styles.blockName}>{item.label}</span>
                        {item.tsOnly && <span className={styles.tsBadge}>TS</span>}
                      </div>
                      <span className={styles.blockDescription}>{item.description}</span>
                      {def?.concept?.summary && (
                        <span className={styles.blockConcept}>{def.concept.summary}</span>
                      )}
                    </button>
                  )
                })}
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

export function ProgramPanel({ blocks, selectedBlockId, onSelect, onAddBlock, onDeleteBlock, onMoveBlock, onUpdateField }: ProgramPanelProps) {
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
          <div className={styles.emptyProgram}>
            <strong>Your program is empty</strong>
            <span>Click any block in the palette to add it here, then select it to learn how it works.</span>
          </div>
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
  onOpenCodeLens: () => void
  onMakeBlocks: (code: string) => void
  onFieldChange: (name: string, value: string) => void
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
      onClick={e => { e.stopPropagation(); onSelect(block.id) }}
    >
      <div className={styles.blockTopline}>
        <div className={styles.blockTopLeft}>
          <span className={styles.blockCategoryDot} data-category={block.category} />
          <span className={styles.blockName}>{def?.label ?? block.type}</span>
        </div>
        <div className={styles.blockActions}>
          <button type="button" className={styles.iconButton} title="Move up" onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'up') }}>
            <ArrowUp size={13} />
          </button>
          <button type="button" className={styles.iconButton} title="Move down" onClick={e => { e.stopPropagation(); onMoveBlock(block.id, 'down') }}>
            <ArrowDown size={13} />
          </button>
          <button type="button" className={styles.iconButton} title="Delete" onClick={e => { e.stopPropagation(); onDeleteBlock(block.id) }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <code className={styles.blockSummary}>{summarizeBlock(block)}</code>

      {/* Inline field editor when selected */}
      {isSelected && def?.fields?.length ? (
        <div className={styles.inlineEditor} onClick={e => e.stopPropagation()}>
          <div className={styles.inlineEditorLabel}>Edit</div>
          {def.fields.map(field => <FieldInput key={field.name} field={field} block={block} onChange={onUpdateField} />)}
        </div>
      ) : null}

      {/* Concept hint strip shown when not selected */}
      {!isSelected && def?.concept?.summary && (
        <span className={styles.blockConceptHint}>{def.concept.summary}</span>
      )}

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
                <Plus size={13} /> {option.label}
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
