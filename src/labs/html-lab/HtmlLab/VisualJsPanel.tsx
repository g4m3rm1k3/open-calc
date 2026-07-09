import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  BLOCK_GROUPS, BLOCK_LIBRARY, blockDefinition, canContainChildren, childOptionsFor, summarizeBlock, createBlock
} from '../../visual-code/blocks.ts'
import {
  normalizeProject, cloneProject, insertBlock, removeBlock, moveBlock, updateBlock, transpileProject
} from '../../visual-code/transpiler.ts'
import { parseJsToBlocks } from '../../visual-code/jsToBlocks.ts'
import type { Block, BlockType, FieldSpec, Project } from '../../visual-code/types.ts'
import type { LabElement } from './types'
import styles from './VisualJsPanel.module.css'

const JS_PROJECT: Project = normalizeProject({
  schemaVersion: 2,
  id: 'visual-js',
  name: 'Visual JS',
  target: 'javascript',
  files: [{ id: 'file_main', name: 'main.js', blocks: [] }],
  activeFileId: 'file_main',
  html: '',
})

interface Props {
  elements: LabElement[]
  html: string
  css?: string
  activeJsCode?: string
  tabVisitCount?: number
  onCodeChange: (code: string) => void
}

export default function VisualJsPanel({ elements, html, css = '', activeJsCode, tabVisitCount, onCodeChange }: Props) {
  const [project, setProject] = useState<Project>(() => normalizeProject(cloneProject(JS_PROJECT)))
  const [query, setQuery] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [importFlash, setImportFlash] = useState(false)
  const lastImportedCodeRef = useRef<string | null>(null)
  const importingRef = useRef(false)
  const blocksRef = useRef<Block[]>([])

  const file = project.files.find(f => f.id === project.activeFileId) ?? project.files[0]
  const blocks = file?.blocks ?? []
  blocksRef.current = blocks
  const generated = useMemo(() => transpileProject(project, project.activeFileId), [project])

  // Hints from canvas elements AND from raw HTML (covers elements typed in the HTML editor)
  const domHints = useMemo(() => {
    const hints: string[] = []
    for (const el of elements) {
      if (el.attrs.id) hints.push(`#${el.attrs.id}`)
      if (el.attrs.class) el.attrs.class.split(/\s+/).filter(Boolean).forEach(c => hints.push(`.${c}`))
      hints.push(el.tag)
    }
    for (const m of html.matchAll(/\bid="([^"]+)"/g)) hints.push(`#${m[1]}`)
    for (const m of html.matchAll(/\bclass="([^"]+)"/g)) m[1].split(/\s+/).filter(Boolean).forEach(c => hints.push(`.${c}`))
    return [...new Set(hints)]
  }, [elements, html])

  // CSS class names from page elements + the CSS editor (for classList dropdowns)
  const classHints = useMemo(() => {
    const names = new Set<string>()
    // From domHints (already extracted)
    for (const h of domHints) if (h.startsWith('.')) names.add(h.slice(1))
    // From the CSS editor — any .className selector
    for (const m of css.matchAll(/\.([a-zA-Z][\w-]*)\s*[{,]/g)) names.add(m[1])
    return [...names]
  }, [domHints, css])

  const onCodeChangeRef = useRef(onCodeChange)
  useEffect(() => { onCodeChangeRef.current = onCodeChange })
  useEffect(() => {
    // Guard 1: import is read-only (JS → blocks). When the import sets blocks,
    // skip the write-back so the original JS file is never overwritten by the
    // transpiler's partial reconstruction.
    if (importingRef.current) {
      importingRef.current = false
      return
    }
    // Guard 2: never write empty code. The project starts with no blocks and
    // generated.code = "" on mount — writing that would wipe the active JS file.
    if (!generated.code) return
    onCodeChangeRef.current(generated.code)
    // Track the outgoing code so we don't re-import it on the next tab visit
    // (block edits → transpiler → same code as activeJsCode → no re-import needed)
    lastImportedCodeRef.current = generated.code
  }, [generated])

  function commit(updater: (bs: Block[]) => Block[]) {
    setProject(p => normalizeProject({
      ...p,
      files: p.files.map(f => f.id === p.activeFileId ? { ...f, blocks: updater(f.blocks) } : f),
    }))
  }

  function addBlock(type: BlockType, parentId: string | null = null) {
    const raw = createBlock(type)
    // Clear VCS-specific selector defaults — learner picks from their own page elements
    const block = raw.fields && 'selector' in raw.fields
      ? { ...raw, fields: { ...raw.fields, selector: '' } }
      : raw
    commit(bs => insertBlock(bs, parentId, block))
    setSelectedBlockId(block.id)
  }

  function deleteBlock(id: string) {
    commit(bs => removeBlock(bs, id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  function updateField(blockId: string, name: string, value: string) {
    commit(bs => updateBlock(bs, blockId, b => ({ ...b, fields: { ...b.fields, [name]: value } })))
  }

  const importFromJs = useCallback((code: string) => {
    const imported = parseJsToBlocks(code)
    if (!imported.length) return
    // Flag the generated effect to skip onCodeChange for this render cycle.
    // The original code is already stored in lastImportedCodeRef so the next
    // tab visit can correctly detect whether the JS changed externally.
    importingRef.current = true
    lastImportedCodeRef.current = code
    commit(() => imported)
    setSelectedBlockId(null)
    setImportFlash(true)
    setTimeout(() => setImportFlash(false), 1200)
  }, [])

  // Each time the user switches to this tab, sync blocks with the current JS file.
  // - If JS was cleared → clear the canvas.
  // - If JS changed since we last synced it (external edit or new example) → re-import.
  // - If code hasn't changed (only block edits happened) → do nothing.
  useEffect(() => {
    if (!tabVisitCount) return
    const code = activeJsCode?.trim() ?? ''
    if (!code) {
      // JS was cleared — wipe the canvas so it doesn't show stale blocks
      if (blocksRef.current.length > 0) {
        commit(() => [])
        setSelectedBlockId(null)
        lastImportedCodeRef.current = null
      }
      return
    }
    // Only re-import when JS differs from what was last synced
    // (block edits keep lastImportedCodeRef in sync via the generated-code effect above)
    if (code.trim() !== (lastImportedCodeRef.current ?? '').trim()) {
      importFromJs(code)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabVisitCount])

  const visibleInPalette = BLOCK_LIBRARY.filter(b => {
    if (b.tsOnly) return false
    if (!query) return true
    return `${b.label} ${b.category} ${b.description}`.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className={styles.root}>
      <div className={styles.twoPane}>

        {/* ── Left: Block palette ── */}
        <div className={styles.palette}>
          <div className={styles.paletteSearch}>
            <input
              className={styles.searchInput}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search blocks…"
            />
          </div>
          <div className={styles.paletteScroll}>
            {BLOCK_GROUPS.map(group => {
              const groupBlocks = visibleInPalette.filter(b => b.category === group.id)
              if (!groupBlocks.length) return null
              return (
                <div key={group.id}>
                  <div className={styles.groupLabel}>{group.label}</div>
                  {groupBlocks.map(item => (
                    <button
                      key={item.type}
                      type="button"
                      className={styles.paletteBtn}
                      onClick={() => addBlock(item.type as BlockType)}
                      title={item.description}
                    >
                      <span className={styles.paletteBtnName}>{item.label}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: Program ── */}
        <div className={styles.program}>
          <div className={styles.programHeader}>
            Program
            {activeJsCode?.trim() && (
              <button
                type="button"
                className={`${styles.importBtn} ${importFlash ? styles.importBtnFlash : ''}`}
                title="Convert the JavaScript file to visual blocks (replaces current blocks)"
                onClick={() => importFromJs(activeJsCode)}
              >
                ← Import from JS
              </button>
            )}
          </div>
          <div className={styles.programScroll}>
            {blocks.length === 0 ? (
              <div className={styles.emptyState}>Click a block on the left to add it here</div>
            ) : (
              blocks.map(block => (
                <BlockRow
                  key={block.id}
                  block={block}
                  selectedBlockId={selectedBlockId}
                  onSelect={id => setSelectedBlockId(prev => prev === id ? null : id)}
                  onDelete={deleteBlock}
                  onMove={(id, dir) => commit(bs => moveBlock(bs, id, dir))}
                  onAddChild={addBlock}
                  onUpdateField={updateField}
                  domHints={domHints}
                  classHints={classHints}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Block Row ─────────────────────────────────────────────────────────────────

interface BlockRowProps {
  block: Block
  selectedBlockId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
  onAddChild: (type: BlockType, parentId: string) => void
  onUpdateField: (blockId: string, name: string, value: string) => void
  domHints: string[]
  classHints: string[]
  depth?: number
}

function BlockRow({ block, selectedBlockId, onSelect, onDelete, onMove, onAddChild, onUpdateField, domHints, classHints, depth = 0 }: BlockRowProps) {
  const def = blockDefinition(block.type)
  const childOptions = childOptionsFor(block.type)
  const isSelected = selectedBlockId === block.id

  return (
    <div style={{ marginLeft: depth * 10 }}>
      <div
        className={`${styles.blockRow} ${isSelected ? styles.blockRowActive : ''}`}
        onClick={e => { e.stopPropagation(); onSelect(block.id) }}
      >
        <div className={styles.blockTopLine}>
          <span className={styles.blockDot} style={{ background: CATEGORY_COLORS[block.category] ?? '#94a3b8' }} />
          <span className={styles.blockName} style={{ color: CATEGORY_COLORS[block.category] ?? 'inherit' }}>{def?.label ?? block.type}</span>
          <div className={styles.blockActions}>
            <button type="button" className={styles.iconBtn} title="Move up" onClick={e => { e.stopPropagation(); onMove(block.id, 'up') }}>▲</button>
            <button type="button" className={styles.iconBtn} title="Move down" onClick={e => { e.stopPropagation(); onMove(block.id, 'down') }}>▼</button>
            <button type="button" className={styles.iconBtn} title="Delete" onClick={e => { e.stopPropagation(); onDelete(block.id) }}>✕</button>
          </div>
        </div>
        <code className={styles.blockSummary}>{summarizeBlock(block)}</code>
        {isSelected && def?.fields?.length ? (
          <div className={styles.fieldEditor} onClick={e => e.stopPropagation()}>
            {def.fields.map(field => (
              <FieldInput
                key={field.name}
                field={field}
                block={block}
                onChange={(name, value) => onUpdateField(block.id, name, value)}
                domHints={domHints}
                classHints={classHints}
              />
            ))}
          </div>
        ) : null}
        {!isSelected && def?.concept?.summary && (
          <span className={styles.conceptHint}>{def.concept.summary}</span>
        )}
      </div>
      {canContainChildren(block.type) && (
        <div className={styles.childSlot}>
          {(block.children ?? []).map(child => (
            <BlockRow
              key={child.id}
              block={child}
              selectedBlockId={selectedBlockId}
              onSelect={onSelect}
              onDelete={onDelete}
              onMove={onMove}
              onAddChild={onAddChild}
              onUpdateField={onUpdateField}
              domHints={domHints}
              classHints={classHints}
              depth={depth + 1}
            />
          ))}
          <div className={styles.childActions}>
            {childOptions.map(opt => (
              <button
                key={opt.type}
                type="button"
                className={styles.addChildBtn}
                onClick={e => { e.stopPropagation(); onAddChild(opt.type as BlockType, block.id) }}
              >
                + {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── CSS property / value knowledge ────────────────────────────────────────────

const CSS_PROP_GROUPS = [
  { label: 'Layout',     props: ['display','flexDirection','alignItems','justifyContent','flexWrap','gap','gridTemplateColumns','gridTemplateRows','gridColumn','gridRow'] },
  { label: 'Size',       props: ['width','height','minWidth','minHeight','maxWidth','maxHeight'] },
  { label: 'Spacing',    props: ['margin','marginTop','marginRight','marginBottom','marginLeft','padding','paddingTop','paddingRight','paddingBottom','paddingLeft'] },
  { label: 'Text',       props: ['fontSize','fontWeight','lineHeight','letterSpacing','textAlign','color'] },
  { label: 'Background', props: ['backgroundColor','backgroundImage','backgroundSize'] },
  { label: 'Border',     props: ['border','borderTop','borderRight','borderBottom','borderLeft','borderRadius','boxShadow','outline'] },
  { label: 'Position',   props: ['position','top','right','bottom','left','zIndex'] },
  { label: 'Effects',    props: ['overflow','opacity','transform','transition','cursor','visibility','pointerEvents','objectFit'] },
]

const CSS_PROP_VALUES: Record<string, string[]> = {
  display:        ['block','flex','grid','inline','inline-block','inline-flex','none'],
  flexDirection:  ['row','column','row-reverse','column-reverse'],
  alignItems:     ['flex-start','center','flex-end','stretch','baseline'],
  justifyContent: ['flex-start','center','flex-end','space-between','space-around','space-evenly'],
  flexWrap:       ['nowrap','wrap','wrap-reverse'],
  textAlign:      ['left','center','right','justify','start','end'],
  fontWeight:     ['normal','bold','100','200','300','400','500','600','700','800','900'],
  overflow:       ['visible','hidden','scroll','auto'],
  position:       ['static','relative','absolute','fixed','sticky'],
  cursor:         ['pointer','default','text','crosshair','move','not-allowed','none','grab'],
  visibility:     ['visible','hidden','collapse'],
  objectFit:      ['fill','contain','cover','none','scale-down'],
  pointerEvents:  ['auto','none'],
  backgroundSize: ['auto','cover','contain'],
}

// ── Field Input ───────────────────────────────────────────────────────────────

function FieldInput({ field, block, onChange, domHints, classHints }: {
  field: FieldSpec
  block: Block
  onChange: (name: string, value: string) => void
  domHints: string[]
  classHints: string[]
}) {
  const value = block.fields?.[field.name] ?? ''

  if (field.name === 'selector') {
    return <SelectorField value={value} domHints={domHints} onChange={v => onChange(field.name, v)} />
  }
  if (field.name === 'event') {
    return <EventTypeField value={value} onChange={v => onChange(field.name, v)} />
  }
  if (field.name === 'className') {
    return <ClassNameField value={value} classHints={classHints} onChange={v => onChange(field.name, v)} />
  }
  if (field.name === 'property') {
    return <CssPropertyField value={value} onChange={v => onChange(field.name, v)} />
  }
  if (field.name === 'value' && block.type === 'setStyle') {
    return <CssValueField value={value} property={block.fields?.property ?? ''} onChange={v => onChange(field.name, v)} />
  }

  return (
    <label className={styles.propRow}>
      <span className={styles.propLabel}>{field.label}</span>
      {field.kind === 'select' ? (
        <select className={styles.propInput} value={value} onChange={e => onChange(field.name, e.target.value)}>
          {(field.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : field.kind === 'code' ? (
        <textarea className={styles.fieldCode} value={value} onChange={e => onChange(field.name, e.target.value)} />
      ) : (
        <input className={styles.propInput} value={value} onChange={e => onChange(field.name, e.target.value)} />
      )}
    </label>
  )
}

// ── Selector Field ────────────────────────────────────────────────────────────

function SelectorField({ value, domHints, onChange }: { value: string; domHints: string[]; onChange: (v: string) => void }) {
  const ids     = domHints.filter(h => h.startsWith('#'))
  const classes = domHints.filter(h => h.startsWith('.'))
  const tags    = domHints.filter(h => !h.startsWith('#') && !h.startsWith('.'))
  const inList  = domHints.includes(value)
  const [custom, setCustom] = useState(!inList && value !== '')

  const handleSelect = (v: string) => {
    if (v === '__custom__') { setCustom(true); return }
    setCustom(false); onChange(v)
  }

  return (
    <div className={styles.propRow}>
      <span className={styles.propLabel}>Element</span>
      {domHints.length > 0 && (
        <select
          className={styles.propInput}
          aria-label="Target element"
          value={custom ? '__custom__' : (value || '__empty__')}
          onChange={e => handleSelect(e.target.value)}
        >
          <option value="__empty__" disabled>— pick an element —</option>
          {ids.length > 0 && <optgroup label="By ID">{ids.map(h => <option key={h} value={h}>{h}</option>)}</optgroup>}
          {classes.length > 0 && <optgroup label="By class">{classes.map(h => <option key={h} value={h}>{h}</option>)}</optgroup>}
          {tags.length > 0 && <optgroup label="By tag">{tags.map(h => <option key={h} value={h}>{h}</option>)}</optgroup>}
          <option value="__custom__">✏ type manually…</option>
        </select>
      )}
      {(custom || domHints.length === 0) && (
        <input
          className={styles.propInput}
          aria-label="CSS selector"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#id or .class or tag"
          autoFocus
        />
      )}
    </div>
  )
}

// ── Event Type Field ──────────────────────────────────────────────────────────

const DOM_EVENTS = [
  { value: 'click',       label: 'click — button press / tap' },
  { value: 'input',       label: 'input — text field changing' },
  { value: 'change',      label: 'change — dropdown / checkbox changed' },
  { value: 'submit',      label: 'submit — form submitted' },
  { value: 'keydown',     label: 'keydown — key pressed' },
  { value: 'keyup',       label: 'keyup — key released' },
  { value: 'focus',       label: 'focus — element receives focus' },
  { value: 'blur',        label: 'blur — element loses focus' },
  { value: 'mouseover',   label: 'mouseover — cursor enters element' },
  { value: 'mouseout',    label: 'mouseout — cursor leaves element' },
  { value: 'dblclick',    label: 'dblclick — double click' },
  { value: 'contextmenu', label: 'contextmenu — right-click menu' },
]

function EventTypeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const known = DOM_EVENTS.some(e => e.value === value)
  return (
    <label className={styles.propRow}>
      <span className={styles.propLabel}>Event</span>
      <select
        className={styles.propInput}
        value={known ? value : (value || 'click')}
        onChange={e => onChange(e.target.value)}
      >
        {DOM_EVENTS.map(ev => <option key={ev.value} value={ev.value}>{ev.label}</option>)}
        {!known && value && <option value={value}>{value}</option>}
      </select>
    </label>
  )
}

// ── Class Name Field ──────────────────────────────────────────────────────────

function ClassNameField({ value, classHints, onChange }: { value: string; classHints: string[]; onChange: (v: string) => void }) {
  const inList = classHints.includes(value)
  const [custom, setCustom] = useState(!inList && value !== '')

  const handleSelect = (v: string) => {
    if (v === '__custom__') { setCustom(true); return }
    setCustom(false); onChange(v)
  }

  return (
    <div className={styles.propRow}>
      <span className={styles.propLabel}>Class name</span>
      {classHints.length > 0 && (
        <select
          className={styles.propInput}
          aria-label="CSS class name"
          value={custom ? '__custom__' : (value || '__empty__')}
          onChange={e => handleSelect(e.target.value)}
        >
          <option value="__empty__" disabled>— pick a class —</option>
          {classHints.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="__custom__">✏ type manually…</option>
        </select>
      )}
      {(custom || classHints.length === 0) && (
        <input
          className={styles.propInput}
          aria-label="CSS class name"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="active"
          autoFocus
        />
      )}
    </div>
  )
}

// ── CSS Property Field ────────────────────────────────────────────────────────

function CssPropertyField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inGroups = CSS_PROP_GROUPS.some(g => g.props.includes(value))
  const [custom, setCustom] = useState(!inGroups && value !== '')

  const handleSelect = (v: string) => {
    if (v === '__custom__') { setCustom(true); return }
    setCustom(false); onChange(v)
  }

  return (
    <div className={styles.propRow}>
      <span className={styles.propLabel}>Property</span>
      <select
        className={styles.propInput}
        aria-label="CSS property"
        value={custom ? '__custom__' : (value || '__empty__')}
        onChange={e => handleSelect(e.target.value)}
      >
        <option value="__empty__" disabled>— pick a property —</option>
        {CSS_PROP_GROUPS.map(group => (
          <optgroup key={group.label} label={group.label}>
            {group.props.map(p => <option key={p} value={p}>{p}</option>)}
          </optgroup>
        ))}
        {!inGroups && value && <option value={value}>{value}</option>}
        <option value="__custom__">✏ type manually…</option>
      </select>
      {custom && (
        <input
          className={styles.propInput}
          aria-label="CSS property"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. border-color"
          autoFocus
        />
      )}
    </div>
  )
}

// ── CSS Value Field ───────────────────────────────────────────────────────────

function CssValueField({ value, property, onChange }: { value: string; property: string; onChange: (v: string) => void }) {
  const knownValues = CSS_PROP_VALUES[property]
  const inList = (knownValues ?? []).includes(value)
  const [custom, setCustom] = useState(!inList && value !== '')

  const handleSelect = (v: string) => {
    if (v === '__custom__') { setCustom(true); return }
    setCustom(false); onChange(v)
  }

  if (!knownValues) {
    return (
      <label className={styles.propRow}>
        <span className={styles.propLabel}>Value</span>
        <input
          className={styles.propInput}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. #ff0000 or 16px"
        />
      </label>
    )
  }

  return (
    <div className={styles.propRow}>
      <span className={styles.propLabel}>Value</span>
      <select
        className={styles.propInput}
        aria-label="CSS value"
        value={custom ? '__custom__' : (value || knownValues[0])}
        onChange={e => handleSelect(e.target.value)}
      >
        {knownValues.map(v => <option key={v} value={v}>{v}</option>)}
        {!inList && value && <option value={value}>{value}</option>}
        <option value="__custom__">✏ type manually…</option>
      </select>
      {custom && (
        <input
          className={styles.propInput}
          aria-label="CSS value"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="custom value"
          autoFocus
        />
      )}
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  oop: '#6366f1', state: '#0ea5e9', flow: '#f59e0b',
  output: '#10b981', html: '#ec4899', types: '#8b5cf6',
}
