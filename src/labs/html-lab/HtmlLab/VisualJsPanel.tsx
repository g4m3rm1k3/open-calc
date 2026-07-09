import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  BLOCK_GROUPS, BLOCK_LIBRARY, blockDefinition, canContainChildren, childOptionsFor, summarizeBlock, createBlock
} from '../../visual-code/blocks.ts'
import {
  normalizeProject, insertBlock, removeBlock, moveBlock, updateBlock, transpileProject
} from '../../visual-code/transpiler.ts'
import { parseJsToBlocks } from '../../visual-code/jsToBlocks.ts'
import type { Block, BlockType, FieldSpec, Project } from '../../visual-code/types.ts'
import type { LabElement, JsFile } from './types'
import { EXPRESSION_GROUPS, EXPRESSION_LIBRARY, detectTemplate, type ExpressionParam } from './jsExpressionLibrary.ts'
import styles from './VisualJsPanel.module.css'

interface Props {
  elements: LabElement[]
  html: string
  css?: string
  jsFiles: JsFile[]
  activeJsFileId: string
  tabVisitCount?: number
  onCodeChange: (fileId: string, code: string) => void
}

export default function VisualJsPanel({ elements, html, css = '', jsFiles, activeJsFileId, tabVisitCount, onCodeChange }: Props) {
  // One block-project file per HTML Lab JS file (same ids), so switching
  // which .js file is active — even without leaving this tab — shows that
  // file's own blocks instead of one shared canvas for the whole JS tab.
  const [project, setProject] = useState<Project>(() => normalizeProject({
    schemaVersion: 2,
    id: 'visual-js',
    name: 'Visual JS',
    target: 'javascript',
    files: jsFiles.map(f => ({ id: f.id, name: f.name, blocks: [] })),
    activeFileId: activeJsFileId,
    html: '',
  }))
  const [query, setQuery] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [importFlash, setImportFlash] = useState(false)
  // Per file: the JS text last imported into (or generated for) it, so each
  // file independently knows whether its code has changed since it was last
  // in sync with its blocks.
  const lastImportedCodeRef = useRef<Map<string, string>>(new Map())
  const importingRef = useRef(false)

  const file = project.files.find(f => f.id === project.activeFileId) ?? project.files[0]
  const blocks = file?.blocks ?? []
  const generated = useMemo(() => transpileProject(project, project.activeFileId), [project])
  const activeJsCode = jsFiles.find(f => f.id === activeJsFileId)?.code ?? ''

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

  // Variable names declared anywhere in this file's own blocks (Variable /
  // Read Value) — offered as an explicit alternative to a raw CSS selector
  // wherever a block needs a target element, e.g. an event listener attached
  // to `btn` after `const btn = document.querySelector('#btn')` earlier.
  // Not real scope analysis — just "names declared somewhere in this file,"
  // same approximation domHints/classHints already make.
  const variableHints = useMemo(() => {
    const names: string[] = []
    const walk = (bs: Block[]) => {
      for (const b of bs) {
        if ((b.type === 'variable' || b.type === 'readValue') && b.fields?.name) names.push(b.fields.name)
        walk(b.children ?? [])
      }
    }
    walk(blocks)
    return [...new Set(names)]
  }, [blocks])

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
    const fileId = project.activeFileId
    onCodeChangeRef.current(fileId, generated.code)
    // Track the outgoing code so the jsFiles-driven sync effect below sees
    // this file as already in sync and doesn't parse the code we just
    // generated back into blocks (which would be a lossy round-trip and
    // could visibly mutate what the user just built).
    lastImportedCodeRef.current.set(fileId, generated.code)
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

  // For controls that set several fields atomically — e.g. picking a target
  // from the combined element/variable dropdown sets targetKind + selector +
  // variableName together, so the block is never left in a state where the
  // kind and the value it's paired with disagree.
  function updateFields(blockId: string, patch: Record<string, string>) {
    commit(bs => updateBlock(bs, blockId, b => ({ ...b, fields: { ...b.fields, ...patch } })))
  }

  const importFromJs = useCallback((code: string, fileId: string) => {
    const imported = parseJsToBlocks(code)
    if (!imported.length) return
    // Flag the generated effect to skip onCodeChange for this render cycle.
    // The original code is already stored in lastImportedCodeRef so the next
    // sync can correctly detect whether the JS changed externally.
    importingRef.current = true
    lastImportedCodeRef.current.set(fileId, code)
    setProject(p => normalizeProject({
      ...p,
      files: p.files.map(f => f.id === fileId ? { ...f, blocks: imported } : f),
    }))
    setSelectedBlockId(null)
    setImportFlash(true)
    setTimeout(() => setImportFlash(false), 1200)
  }, [])

  // Keeps project.files structurally in sync with HTML Lab's own jsFiles
  // (add/rename/drop — a file removed from jsFiles is simply not in the
  // next mapped list), and re-imports whichever file is now active if its
  // code has changed since it was last synced. Runs whenever a new file is
  // added, the active file is switched (even without leaving this tab), or
  // this tab is first visited — not just on tab-visit like before.
  useEffect(() => {
    if (!tabVisitCount) return

    setProject(p => {
      const files = jsFiles.map(jf => {
        const existing = p.files.find(pf => pf.id === jf.id)
        return existing && existing.name === jf.name ? existing : { id: jf.id, name: jf.name, blocks: existing?.blocks ?? [] }
      })
      const sameFiles = files.length === p.files.length && files.every((f, i) => f === p.files[i])
      if (sameFiles && p.activeFileId === activeJsFileId) return p
      return normalizeProject({ ...p, files, activeFileId: activeJsFileId })
    })

    const activeCode = (jsFiles.find(jf => jf.id === activeJsFileId)?.code ?? '').trim()
    const lastCode = (lastImportedCodeRef.current.get(activeJsFileId) ?? '').trim()
    if (activeCode === lastCode) return

    if (!activeCode) {
      // JS was cleared — wipe this file's canvas so it doesn't show stale blocks
      lastImportedCodeRef.current.delete(activeJsFileId)
      setProject(p => normalizeProject({
        ...p,
        files: p.files.map(f => f.id === activeJsFileId ? { ...f, blocks: [] } : f),
      }))
      setSelectedBlockId(null)
      return
    }
    importFromJs(activeCode, activeJsFileId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabVisitCount, activeJsFileId, jsFiles])

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
                      style={{ '--block-color': CATEGORY_COLORS[item.category] || 'var(--hl-text)' } as React.CSSProperties}
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
            {activeJsCode.trim() && (
              <button
                type="button"
                className={`${styles.importBtn} ${importFlash ? styles.importBtnFlash : ''}`}
                title="Convert the JavaScript file to visual blocks (replaces current blocks)"
                onClick={() => importFromJs(activeJsCode, activeJsFileId)}
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
                  onUpdateFields={updateFields}
                  domHints={domHints}
                  classHints={classHints}
                  variableHints={variableHints}
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
  onUpdateFields: (blockId: string, patch: Record<string, string>) => void
  domHints: string[]
  classHints: string[]
  variableHints: string[]
  depth?: number
}

function BlockRow({ block, selectedBlockId, onSelect, onDelete, onMove, onAddChild, onUpdateField, onUpdateFields, domHints, classHints, variableHints, depth = 0 }: BlockRowProps) {
  const def = blockDefinition(block.type)
  const childOptions = childOptionsFor(block.type)
  const isSelected = selectedBlockId === block.id

  return (
    <div className={styles.blockRowWrapper}>
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
                onChangeMulti={(patch) => onUpdateFields(block.id, patch)}
                domHints={domHints}
                classHints={classHints}
                variableHints={variableHints}
              />
            ))}
          </div>
        ) : null}
        {!isSelected && def?.concept?.summary && (
          <span className={styles.conceptHint}>{def.concept.summary}</span>
        )}
      </div>
      {canContainChildren(block.type) && (
        <div className={`${styles.childSlot} ${styles[`depth-${depth % 6}`] || ''}`}>
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
              onUpdateFields={onUpdateFields}
              domHints={domHints}
              classHints={classHints}
              variableHints={variableHints}
              depth={depth + 1}
            />
          ))}
          <div className={styles.childActions}>
            {childOptions.map(opt => {
              const color = CATEGORY_COLORS[opt.category] || '#94a3b8';
              return (
                <button
                  key={opt.type}
                  type="button"
                  className={styles.addChildBtn}
                  style={{ 
                    '--block-color': color,
                    '--block-bg': color + '1a',
                    '--block-border': color + '4d'
                  } as React.CSSProperties}
                  onClick={e => { e.stopPropagation(); onAddChild(opt.type as BlockType, block.id) }}
                >
                  <span className={styles.addChildIcon}>+</span>
                  <span className={styles.addChildLabel}>{opt.label}</span>
                </button>
              )
            })}
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

function FieldInput({ field, block, onChange, onChangeMulti, domHints, classHints, variableHints }: {
  field: FieldSpec
  block: Block
  onChange: (name: string, value: string) => void
  onChangeMulti: (patch: Record<string, string>) => void
  domHints: string[]
  classHints: string[]
  variableHints: string[]
}) {
  const value = block.fields?.[field.name] ?? ''

  if (field.name === 'selector') {
    return <TargetField block={block} domHints={domHints} variableHints={variableHints} onChange={onChangeMulti} />
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
  // Any general-purpose JS expression field — offers the curated pattern
  // library, but the raw text stays a normal, always-editable input either way.
  if (['value', 'expression', 'condition'].includes(field.name) || (field.name === 'text' && block.type === 'htmlText')) {
    return <ExpressionField label={field.label} value={value} domHints={domHints} variableHints={variableHints} onChange={v => onChange(field.name, v)} depth={1} />
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

// ── Target Field ──────────────────────────────────────────────────────────────
// One combined dropdown for the "which element does this act on" question
// every DOM-facing block asks. Explicit, not inferred: picking from "By ID" /
// "By class" / "By tag" sets targetKind: 'selector'; picking from "Variables"
// sets targetKind: 'variable' — the block always knows which kind of target
// it has, it's never guessed from the string's shape.

function TargetField({ block, domHints, variableHints, onChange }: {
  block: Block
  domHints: string[]
  variableHints: string[]
  onChange: (patch: Record<string, string>) => void
}) {
  const targetKind = block.fields?.targetKind === 'variable' ? 'variable' : 'selector'
  const selector = block.fields?.selector ?? ''
  const variableName = block.fields?.variableName ?? ''
  const currentValue = targetKind === 'variable' ? variableName : selector
  const knownValue = targetKind === 'variable' ? variableHints.includes(currentValue) : domHints.includes(currentValue)
  const [custom, setCustom] = useState(targetKind === 'selector' && currentValue !== '' && !knownValue)

  const ids     = domHints.filter(h => h.startsWith('#'))
  const classes = domHints.filter(h => h.startsWith('.'))
  const tags    = domHints.filter(h => !h.startsWith('#') && !h.startsWith('.'))
  const hasOptions = ids.length > 0 || classes.length > 0 || tags.length > 0 || variableHints.length > 0

  const handleSelect = (v: string) => {
    if (v === '__custom__') { setCustom(true); return }
    setCustom(false)
    if (v.startsWith('__var__:')) {
      onChange({ targetKind: 'variable', variableName: v.slice('__var__:'.length), selector: '' })
    } else {
      onChange({ targetKind: 'selector', selector: v, variableName: '' })
    }
  }

  const selectValue = custom
    ? '__custom__'
    : targetKind === 'variable'
      ? (variableName ? `__var__:${variableName}` : '__empty__')
      : (selector || '__empty__')

  return (
    <div className={styles.propRow}>
      <span className={styles.propLabel}>Target</span>
      {hasOptions && (
        <select
          className={styles.propInput}
          aria-label="Target element or variable"
          value={selectValue}
          onChange={e => handleSelect(e.target.value)}
        >
          <option value="__empty__" disabled>— pick an element or variable —</option>
          {ids.length > 0 && <optgroup label="By ID">{ids.map(h => <option key={h} value={h}>{h}</option>)}</optgroup>}
          {classes.length > 0 && <optgroup label="By class">{classes.map(h => <option key={h} value={h}>{h}</option>)}</optgroup>}
          {tags.length > 0 && <optgroup label="By tag">{tags.map(h => <option key={h} value={h}>{h}</option>)}</optgroup>}
          {variableHints.length > 0 && (
            <optgroup label="Variables">
              {variableHints.map(v => <option key={v} value={`__var__:${v}`}>{v}</option>)}
            </optgroup>
          )}
          <option value="__custom__">✏ type manually…</option>
        </select>
      )}
      {(custom || !hasOptions) && (
        <input
          className={styles.propInput}
          aria-label="CSS selector"
          value={selector}
          onChange={e => onChange({ targetKind: 'selector', selector: e.target.value, variableName: '' })}
          placeholder="#id or .class or tag"
          autoFocus
        />
      )}
    </div>
  )
}

// ── Expression Field ──────────────────────────────────────────────────────────
// Same idea as the CSS property/value dropdowns below, for JS instead of CSS:
// a curated, grouped library of common expressions (find an element, fetch
// JSON, round a number, uppercase text...) that fills in the real field —
// which stays a normal, always-editable text input either way. Picking a
// pattern with parameters (e.g. "Fetch JSON from a URL" needs a URL) shows
// small inputs for just those parameters and live-composes the final
// expression as you fill them in.

function ExpressionField({ label, value, domHints, variableHints, onChange, nested, depth }: {
  label: string
  value: string
  domHints: string[]
  variableHints: string[]
  onChange: (v: string) => void
  // True when this is a param of an *outer* expression (e.g. the "a" in
  // a && b) rather than the top-level field on the block itself — just
  // controls a visual indent so nesting depth reads clearly.
  nested?: boolean
  depth?: number
}) {
  // Runs once, at mount, against whatever this field already holds — e.g.
  // code that was just parsed in from the JS file. Lazy useState initializers
  // only ever run on the very first render, which is exactly the "only when
  // this is genuinely a fresh value, never fight the user mid-edit" timing
  // this needs (a fresh import always mounts a fresh block/field anyway).
  const [templateId, setTemplateId] = useState<string | null>(() => detectTemplate(value)?.id ?? null)
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => detectTemplate(value)?.params ?? {})
  const template = templateId ? EXPRESSION_LIBRARY.find(t => t.id === templateId) ?? null : null

  const handleSelectTemplate = (id: string) => {
    if (id === '__manual__') { setTemplateId(null); return }
    const t = EXPRESSION_LIBRARY.find(x => x.id === id)
    if (!t) return
    const initial: Record<string, string> = {}
    for (const param of t.params) initial[param.name] = param.default ?? ''
    setTemplateId(id)
    setParamValues(initial)
    onChange(t.build(initial))
  }

  const handleParamChange = (name: string, v: string) => {
    const next = { ...paramValues, [name]: v }
    setParamValues(next)
    if (template) onChange(template.build(next))
  }

  const body = (
    <>
      <label className={styles.propRow}>
        <span className={styles.propLabel}>Pattern</span>
        <select
          className={styles.propInput}
          aria-label="Expression pattern"
          value={templateId ?? '__manual__'}
          onChange={e => handleSelectTemplate(e.target.value)}
        >
          <option value="__manual__">✏ type manually</option>
          {EXPRESSION_GROUPS.map(group => {
            const items = EXPRESSION_LIBRARY.filter(t => t.group === group.id)
            if (!items.length) return null
            return (
              <optgroup key={group.id} label={group.label}>
                {items.map(t => <option key={t.id} value={t.id} title={t.description}>{t.label}</option>)}
              </optgroup>
            )
          })}
        </select>
      </label>
      {template?.params.map(param => (
        <ExpressionParamInput
          key={param.name}
          param={param}
          value={paramValues[param.name] ?? ''}
          domHints={domHints}
          variableHints={variableHints}
          onChange={v => handleParamChange(param.name, v)}
          depth={(depth || 0) + 1}
        />
      ))}
      <label className={styles.propRow}>
        <span className={styles.propLabel}>{label}</span>
        <input className={styles.propInput} value={value} onChange={e => onChange(e.target.value)} />
      </label>
    </>
  )

  return nested ? <div className={`${styles.nestedExprSlot} ${styles[`depth-${(depth || 0) % 6}`] || ''}`}>{body}</div> : <>{body}</>
}

function ExpressionParamInput({ param, value, domHints, variableHints, onChange, depth = 0 }: {
  param: ExpressionParam
  value: string
  domHints: string[]
  variableHints: string[]
  onChange: (v: string) => void
  depth?: number
}) {
  // Recursive case: a param that's itself a full sub-expression gets its
  // own nested pattern-picker, not a plain text box — this is what lets
  // "call a method whose argument is a comparison" build (or decompose)
  // one explicit piece at a time instead of bottoming out at raw text.
  if (param.kind === 'expression') {
    return (
      <ExpressionField
        label={param.label}
        value={value}
        domHints={domHints}
        variableHints={variableHints}
        onChange={onChange}
        nested
        depth={depth}
      />
    )
  }

  const hints = param.kind === 'selector' ? domHints : param.kind === 'variable' ? variableHints : []
  const known = hints.includes(value)
  const [custom, setCustom] = useState(hints.length > 0 ? (!known && value !== '') : true)

  if (hints.length === 0) {
    return (
      <label className={styles.propRow}>
        <span className={styles.propLabel}>{param.label}</span>
        <input className={styles.propInput} value={value} onChange={e => onChange(e.target.value)} placeholder={param.placeholder} />
      </label>
    )
  }

  const handleSelect = (v: string) => {
    if (v === '__custom__') { setCustom(true); return }
    setCustom(false)
    onChange(v)
  }

  return (
    <label className={styles.propRow}>
      <span className={styles.propLabel}>{param.label}</span>
      <select className={styles.propInput} value={custom ? '__custom__' : (value || '__empty__')} onChange={e => handleSelect(e.target.value)}>
        <option value="__empty__" disabled>— pick —</option>
        {hints.map(h => <option key={h} value={h}>{h}</option>)}
        <option value="__custom__">✏ type manually…</option>
      </select>
      {custom && (
        <input className={styles.propInput} value={value} onChange={e => onChange(e.target.value)} placeholder={param.placeholder} autoFocus />
      )}
    </label>
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
