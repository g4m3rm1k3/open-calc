import { blockDefinition } from './blocks'
import type { Block, Diagnostic, GeneratedOutput, Project, ProjectFile, TargetDefinition } from './types'

const INDENT = '  '

// ─── Project helpers ──────────────────────────────────────────────────────────

export function normalizeFile(file: Partial<ProjectFile>): ProjectFile {
  return {
    id: file.id || `file_${Date.now().toString(36)}`,
    name: file.name || 'main.ts',
    blocks: normalizeBlocks(file.blocks ?? []),
  }
}

export function normalizeProject(raw: Partial<Project>): Project {
  const files = (raw.files ?? []).map(normalizeFile)
  const activeFileId = files.find(f => f.id === raw.activeFileId)?.id ?? files[0]?.id ?? ''
  return {
    schemaVersion: 2,
    id: raw.id || `proj_${Date.now().toString(36)}`,
    name: raw.name || 'Visual Code Project',
    target: raw.target === 'javascript' ? 'javascript' : 'typescript',
    files,
    activeFileId,
    html: raw.html ?? '<main id="app"><button id="scoreButton">Add score</button><p id="message"></p></main>',
  }
}

export function cloneProject(p: Project): Project {
  return JSON.parse(JSON.stringify(p))
}

export function serializeProject(p: Project): string {
  return JSON.stringify(normalizeProject(p), null, 2)
}

export function parseProject(json: string): Project {
  return normalizeProject(JSON.parse(json))
}

export function activeFile(p: Project): ProjectFile | null {
  return p.files.find(f => f.id === p.activeFileId) ?? p.files[0] ?? null
}

// ─── Block tree helpers ───────────────────────────────────────────────────────

export function findBlock(blocks: Block[], id: string | null): Block | null {
  if (!id) return null
  for (const b of blocks) {
    if (b.id === id) return b
    const child = findBlock(b.children ?? [], id)
    if (child) return child
  }
  return null
}

export function findBlockInProject(p: Project, id: string | null): Block | null {
  for (const file of p.files) {
    const found = findBlock(file.blocks, id)
    if (found) return found
  }
  return null
}

export function updateBlock(blocks: Block[], id: string, updater: (b: Block) => Block): Block[] {
  return blocks.map(b => {
    if (b.id === id) return updater(b)
    return { ...b, children: updateBlock(b.children ?? [], id, updater) }
  })
}

export function removeBlock(blocks: Block[], id: string): Block[] {
  return blocks
    .filter(b => b.id !== id)
    .map(b => ({ ...b, children: removeBlock(b.children ?? [], id) }))
}

export function insertBlock(blocks: Block[], parentId: string | null, newBlock: Block): Block[] {
  if (!parentId) return [...blocks, newBlock]
  return updateBlock(blocks, parentId, parent => ({ ...parent, children: [...(parent.children ?? []), newBlock] }))
}

export function moveBlock(blocks: Block[], id: string, direction: 'up' | 'down'): Block[] {
  const index = blocks.findIndex(b => b.id === id)
  if (index >= 0) {
    const next = direction === 'up' ? index - 1 : index + 1
    if (next < 0 || next >= blocks.length) return blocks
    const arr = [...blocks];
    [arr[index], arr[next]] = [arr[next], arr[index]]
    return arr
  }
  return blocks.map(b => ({ ...b, children: moveBlock(b.children ?? [], id, direction) }))
}

function normalizeBlocks(blocks: Partial<Block>[]): Block[] {
  return blocks.map(item => {
    const def = blockDefinition(item.type ?? '')
    return {
      id: item.id || `block_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      type: (item.type ?? 'variable') as Block['type'],
      category: item.category ?? def?.category ?? 'state',
      fields: { ...(def?.defaults ?? {}), ...(item.fields ?? {}) },
      children: normalizeBlocks(item.children ?? []),
    }
  })
}

// ─── Targets ──────────────────────────────────────────────────────────────────

export const TARGETS: Record<string, TargetDefinition> = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    fileExtension: 'js',
    transpile: (project, fileId) => transpileBlocks(project, fileId, 'javascript'),
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    fileExtension: 'ts',
    transpile: (project, fileId) => transpileBlocks(project, fileId, 'typescript'),
  },
}

export function registerTarget(target: TargetDefinition): void {
  TARGETS[target.id] = target
}

export function transpileProject(project: Project, fileId?: string): GeneratedOutput {
  const target = TARGETS[project.target]
  if (!target) {
    return { targetId: project.target, code: '', diagnostics: [diag('error', `No transpiler for ${project.target}`)], sourceMap: {} }
  }
  return target.transpile(normalizeProject(project), fileId ?? project.activeFileId)
}

// ─── Core transpiler ──────────────────────────────────────────────────────────

function transpileBlocks(project: Project, fileId: string, lang: 'javascript' | 'typescript'): GeneratedOutput {
  const file = project.files.find(f => f.id === fileId) ?? project.files[0]
  if (!file) return { targetId: lang, code: '// No file selected', diagnostics: [], sourceMap: {} }

  const diagnostics: Diagnostic[] = []
  const sourceMap: Record<string, [number, number]> = {}
  let lineCounter = 0

  const parts = file.blocks.map(block => {
    const startLine = lineCounter
    const code = renderBlock(block, 0, diagnostics, lang)
    const lines = code.split('\n').length
    lineCounter += lines + 1  // +1 for the blank line between blocks
    if (block.id) sourceMap[block.id] = [startLine, startLine + lines - 1]
    return code
  }).filter(Boolean)

  return { targetId: lang, code: parts.join('\n\n'), diagnostics, sourceMap }
}

// ─── Block renderers ─────────────────────────────────────────────────────────

function renderBlock(item: Block, depth: number, diags: Diagnostic[], lang: 'javascript' | 'typescript'): string {
  const pad = INDENT.repeat(depth)
  const f = item.fields ?? {}
  const ts = lang === 'typescript'

  switch (item.type) {
    case 'class': {
      const name = safeId(f.name, 'UnnamedClass', diags, item)
      const heritage = f.extendsName?.trim() ? ` extends ${f.extendsName.trim()}` : ''
      const exportKw = f.accessModifier && f.accessModifier !== 'none' ? `${f.accessModifier} ` : ''
      const members = renderChildren(item, depth + 1, diags, lang, renderClassMember)
      return `${pad}${exportKw}class ${name}${heritage} {\n${members || `${INDENT.repeat(depth + 1)}// Add constructor, fields, and methods here.`}\n${pad}}`
    }
    case 'function': {
      const kw = f.async === 'true' ? 'async function' : 'function'
      const returnSig = ts && f.returnType?.trim() ? `: ${f.returnType.trim()}` : ''
      const body = renderChildren(item, depth + 1, diags, lang) || indent('', depth + 1)
      return `${pad}${kw} ${safeId(f.name, 'fn', diags, item)}(${f.params || ''})${returnSig} {\n${body}\n${pad}}`
    }
    case 'variable': {
      const kind = ['const', 'let', 'var'].includes(f.kind) ? f.kind : 'const'
      const typeSig = ts && f.type?.trim() ? `: ${f.type.trim()}` : ''
      return `${pad}${kind} ${safeId(f.name, 'value', diags, item)}${typeSig} = ${val(f.value, 'undefined')};`
    }
    case 'assign':
      return `${pad}${f.target || 'value'} = ${val(f.value, 'undefined')};`
    case 'call':
      return `${pad}${val(f.expression, 'undefined')};`
    case 'return':
      return `${pad}return ${val(f.expression, 'undefined')};`
    case 'log':
      return `${pad}console.log(${val(f.expression, '""')});`
    case 'if': {
      const body = renderChildren(item, depth + 1, diags, lang) || indent(f.body || '', depth + 1)
      return `${pad}if (${val(f.condition, 'true')}) {\n${body}\n${pad}}`
    }
    case 'loop': {
      const it = safeId(f.iterator, 'i', diags, item)
      const body = renderChildren(item, depth + 1, diags, lang) || indent(f.body || '', depth + 1)
      return `${pad}for (let ${it} = 0; ${it} < ${val(f.count, '0')}; ${it}++) {\n${body}\n${pad}}`
    }
    case 'event': {
      const body = renderChildren(item, depth + 1, diags, lang)
      const target = targetExpr(f, diags, item, '#app')
      return `${pad}${target}?.addEventListener(${JSON.stringify(f.event || 'click')}, (event) => {\n${body || `${INDENT.repeat(depth + 1)}// Add event handler blocks here.`}\n${pad}});`
    }
    case 'htmlText':
      return `${pad}${targetExpr(f, diags, item, '#app')}.textContent = String(${val(f.text, '""')});`
    case 'readValue': {
      const isVar = f.targetKind === 'variable'
      const cast = !isVar && lang === 'typescript' ? ' as HTMLInputElement' : ''
      const target = targetExpr(f, diags, item, '#input')
      const wrapped = isVar ? target : `(${target}${cast})`
      return `${pad}const ${safeId(f.name, 'inputVal', diags, item)} = ${wrapped}.value;`
    }
    case 'addClass':
      return `${pad}${targetExpr(f, diags, item, '#app')}?.classList.add(${JSON.stringify(f.className || '')});`
    case 'removeClass':
      return `${pad}${targetExpr(f, diags, item, '#app')}?.classList.remove(${JSON.stringify(f.className || '')});`
    case 'toggleClass':
      return `${pad}${targetExpr(f, diags, item, '#app')}?.classList.toggle(${JSON.stringify(f.className || '')});`
    case 'setStyle': {
      const prop = (f.property || 'display').replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
      const isVar = f.targetKind === 'variable'
      const cast = !isVar && lang === 'typescript' ? ' as HTMLElement' : ''
      const target = targetExpr(f, diags, item, '#app')
      const wrapped = isVar ? target : `(${target}${cast})`
      return `${pad}${wrapped}.style.${prop} = ${JSON.stringify(f.value || '')};`
    }

    // ── Callbacks & chaining ─────────────────────────────────────────────────
    case 'forEachItem': {
      const list = safeId(f.list, 'list', diags, item)
      const itemParam = safeId(f.itemParam, 'item', diags, item)
      const body = renderChildren(item, depth + 1, diags, lang) || indent('', depth + 1)
      return `${pad}${list}.forEach((${itemParam}) => {\n${body}\n${pad}});`
    }
    case 'transformList': {
      const list = safeId(f.list, 'list', diags, item)
      const itemParam = safeId(f.itemParam, 'item', diags, item)
      const outputName = safeId(f.outputName, 'result', diags, item)
      const body = renderChildren(item, depth + 1, diags, lang) || indent(`return ${itemParam};`, depth + 1)
      return `${pad}const ${outputName} = ${list}.map((${itemParam}) => {\n${body}\n${pad}});`
    }
    case 'filterList': {
      const list = safeId(f.list, 'list', diags, item)
      const itemParam = safeId(f.itemParam, 'item', diags, item)
      const outputName = safeId(f.outputName, 'filtered', diags, item)
      const body = renderChildren(item, depth + 1, diags, lang) || indent('return true;', depth + 1)
      return `${pad}const ${outputName} = ${list}.filter((${itemParam}) => {\n${body}\n${pad}});`
    }
    case 'whenReady': {
      const source = val(f.value, 'Promise.resolve()')
      const steps = (item.children ?? []).filter((c) => c.type === 'chainStep')
      if (!steps.length) {
        diags.push(diag('warning', 'A "When It\'s Ready" block needs at least one Then/Catch step underneath it.', item.id))
        return `${pad}${source};`
      }
      const chainPad = INDENT.repeat(depth + 1)
      const chain = steps.map((step) => {
        const sf = step.fields ?? {}
        const kind = sf.kind === 'catch' ? 'catch' : 'then'
        const paramName = safeId(sf.paramName, kind === 'catch' ? 'error' : 'data', diags, step)
        const body = renderChildren(step, depth + 2, diags, lang) || indent('', depth + 2)
        return `\n${chainPad}.${kind}((${paramName}) => {\n${body}\n${chainPad}})`
      }).join('')
      return `${pad}${source}${chain};`
    }
    case 'callWithCallback': {
      const fn = val(f.fn, 'fn')
      const paramName = safeId(f.paramName, 'value', diags, item)
      const body = renderChildren(item, depth + 1, diags, lang) || indent('', depth + 1)
      return `${pad}${fn}((${paramName}) => {\n${body}\n${pad}});`
    }

    // TypeScript-only blocks
    case 'interface': {
      if (!ts) return ''
      const name = safeId(f.name, 'Unnamed', diags, item)
      const exportKw = f.accessModifier && f.accessModifier !== 'none' ? `${f.accessModifier} ` : ''
      const heritage = f.extendsName?.trim() ? ` extends ${f.extendsName.trim()}` : ''
      const members = renderChildren(item, depth + 1, diags, lang, renderInterfaceMember)
      return `${pad}${exportKw}interface ${name}${heritage} {\n${members || `${INDENT.repeat(depth + 1)}// Add interface fields here.`}\n${pad}}`
    }
    case 'typeAlias': {
      if (!ts) return ''
      const exportKw = f.accessModifier && f.accessModifier !== 'none' ? `${f.accessModifier} ` : ''
      return `${pad}${exportKw}type ${safeId(f.name, 'T', diags, item)} = ${val(f.value, 'unknown')};`
    }
    case 'enum': {
      if (!ts) return ''
      const exportKw = f.accessModifier && f.accessModifier !== 'none' ? `${f.accessModifier} ` : ''
      const members = renderChildren(item, depth + 1, diags, lang, renderEnumMember)
      return `${pad}${exportKw}enum ${safeId(f.name, 'Enum', diags, item)} {\n${members || `${INDENT.repeat(depth + 1)}// Add enum members here.`}\n${pad}}`
    }

    default: {
      const def = blockDefinition(item.type)
      diags.push(diag('warning', def ? `No ${lang} renderer for ${def.label}.` : `Unknown block type: ${item.type}.`, item.id))
      return ''
    }
  }
}

function renderClassMember(item: Block, depth: number, diags: Diagnostic[], lang: 'javascript' | 'typescript'): string {
  const pad = INDENT.repeat(depth)
  const f = item.fields ?? {}
  const ts = lang === 'typescript'

  switch (item.type) {
    case 'constructor':
      return `${pad}constructor(${f.params || ''}) {\n${indent(f.body || '', depth + 1)}\n${pad}}`
    case 'method': {
      const access = ts && f.access && f.access !== 'public' ? `${f.access} ` : ''
      const asyncKw = f.async === 'true' ? 'async ' : ''
      const ret = ts && f.returnType?.trim() ? `: ${f.returnType.trim()}` : ''
      return `${pad}${access}${asyncKw}${safeId(f.name, 'method', diags, item)}(${f.params || ''})${ret} {\n${indent(f.body || '', depth + 1)}\n${pad}}`
    }
    case 'staticMethod': {
      const asyncKw = f.async === 'true' ? 'async ' : ''
      const ret = ts && f.returnType?.trim() ? `: ${f.returnType.trim()}` : ''
      return `${pad}static ${asyncKw}${safeId(f.name, 'method', diags, item)}(${f.params || ''})${ret} {\n${indent(f.body || '', depth + 1)}\n${pad}}`
    }
    case 'getter': {
      const ret = ts && f.returnType?.trim() ? `: ${f.returnType.trim()}` : ''
      return `${pad}get ${safeId(f.name, 'property', diags, item)}()${ret} {\n${indent(f.body || '', depth + 1)}\n${pad}}`
    }
    case 'setter':
      return `${pad}set ${safeId(f.name, 'property', diags, item)}(${safeId(f.param, 'value', diags, item)}) {\n${indent(f.body || '', depth + 1)}\n${pad}}`
    case 'field': {
      const access = ts && f.access && f.access !== 'public' ? `${f.access} ` : ''
      const staticKw = f.static === 'true' ? 'static ' : ''
      const typeSig = ts && f.type?.trim() ? `: ${f.type.trim()}` : ''
      return `${pad}${access}${staticKw}${safeId(f.name, 'field', diags, item)}${typeSig} = ${val(f.value, 'undefined')};`
    }
    default:
      return renderBlock(item, depth, diags, lang)
  }
}

function renderInterfaceMember(item: Block, depth: number, _diags: Diagnostic[], _lang: 'javascript' | 'typescript'): string {
  const pad = INDENT.repeat(depth)
  const f = item.fields ?? {}
  if (item.type !== 'interfaceField') return ''
  const ro = f.readonly === 'true' ? 'readonly ' : ''
  const opt = f.optional === 'true' ? '?' : ''
  return `${pad}${ro}${f.name || 'field'}${opt}: ${f.type || 'unknown'};`
}

function renderEnumMember(item: Block, depth: number, _diags: Diagnostic[], _lang: 'javascript' | 'typescript'): string {
  const pad = INDENT.repeat(depth)
  const f = item.fields ?? {}
  if (item.type !== 'enumMember') return ''
  return `${pad}${f.name || 'Member'}${f.value?.trim() ? ` = ${f.value.trim()}` : ''},`
}

function renderChildren(
  item: Block,
  depth: number,
  diags: Diagnostic[],
  lang: 'javascript' | 'typescript',
  renderer = renderBlock,
): string {
  return (item.children ?? [])
    .map(child => renderer(child, depth, diags, lang))
    .filter(Boolean)
    .join('\n')
}

// Resolves the shared "target" concept every DOM-facing block (event,
// htmlText, readValue, addClass/removeClass/toggleClass, setStyle) points
// at — either a fresh `document.querySelector(sel)` lookup, or a bare
// reference to a variable the student already captured earlier in the file
// (e.g. `const btn = document.querySelector('#btn')` then later reusing
// `btn`). Explicit via targetKind, not inferred from the selector string.
function targetExpr(f: Record<string, string>, diags: Diagnostic[], item: Block, fallbackSelector: string): string {
  if (f.targetKind === 'variable') return safeId(f.variableName, 'el', diags, item)
  return `document.querySelector(${JSON.stringify(f.selector || fallbackSelector)})`
}

function safeId(value: string | undefined, fallback: string, diags: Diagnostic[], item: Block): string {
  const text = String(value || '').trim()
  if (/^[A-Za-z_$][\w$]*$/.test(text)) return text
  diags.push(diag('warning', `"${text || '(blank)'}" is not a valid identifier; using "${fallback}".`, item.id))
  return fallback
}

function indent(source: string, depth: number): string {
  const pad = INDENT.repeat(depth)
  const lines = String(source).split('\n')
  return lines.map(line => `${pad}${line}`).join('\n')
}

function val(value: string | undefined, fallback: string): string {
  const text = String(value ?? '').trim()
  return text || fallback
}

function diag(level: Diagnostic['level'], message: string, blockId?: string): Diagnostic {
  return { level, message, blockId }
}

// ─── Default project ──────────────────────────────────────────────────────────

const starterBlocks = (): import('./types').Block[] => [
  {
    id: 'starter_iface',
    type: 'interface',
    category: 'types',
    fields: { name: 'Scorable', extendsName: '', accessModifier: 'export' },
    children: [
      { id: 'si_name', type: 'interfaceField', category: 'types', fields: { name: 'name', type: 'string', optional: 'false', readonly: 'true' }, children: [] },
      { id: 'si_score', type: 'interfaceField', category: 'types', fields: { name: 'score', type: 'number', optional: 'false', readonly: 'false' }, children: [] },
    ],
  },
  {
    id: 'starter_class',
    type: 'class',
    category: 'oop',
    fields: { name: 'Player', extendsName: '', accessModifier: 'export' },
    children: [
      { id: 'sc_field_name', type: 'field', category: 'state', fields: { name: 'name', type: 'string', value: '"Unknown"', access: 'public', static: 'false' }, children: [] },
      { id: 'sc_field_score', type: 'field', category: 'state', fields: { name: 'score', type: 'number', value: '0', access: 'public', static: 'false' }, children: [] },
      { id: 'sc_ctor', type: 'constructor', category: 'oop', fields: { params: 'name: string', body: 'this.name = name\nthis.score = 0' }, children: [] },
      { id: 'sc_method', type: 'method', category: 'oop', fields: { name: 'addScore', params: 'points: number', returnType: 'string', access: 'public', async: 'false', body: "this.score += points\nreturn `${this.name}: ${this.score}`" }, children: [] },
      { id: 'sc_getter', type: 'getter', category: 'oop', fields: { name: 'label', returnType: 'string', body: "return `${this.name} (${this.score} pts)`" }, children: [] },
    ],
  },
  { id: 'starter_var', type: 'variable', category: 'state', fields: { kind: 'const', name: 'player', type: 'Player', value: 'new Player("Ada")' }, children: [] },
  { id: 'starter_log', type: 'log', category: 'output', fields: { expression: 'player.label' }, children: [] },
  {
    id: 'starter_event',
    type: 'event',
    category: 'html',
    fields: { selector: '#scoreButton', event: 'click' },
    children: [
      { id: 'se_text', type: 'htmlText', category: 'html', fields: { selector: '#message', text: 'player.addScore(1)' }, children: [] },
    ],
  },
]

export const DEFAULT_PROJECT: Project = normalizeProject({
  schemaVersion: 2,
  id: 'visual-code-starter',
  name: 'My First TypeScript Project',
  target: 'typescript',
  files: [
    { id: 'file_main', name: 'main.ts', blocks: starterBlocks() },
  ],
  activeFileId: 'file_main',
  html: '<main id="app"><button id="scoreButton">Add score</button><p id="message"></p></main>',
} as Partial<Project>)
