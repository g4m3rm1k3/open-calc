import { blockDefinition } from './blocks'
import type { Block, Diagnostic, GeneratedOutput, Project } from './types'

const INDENT = '    '  // 4 spaces — PEP 8

export function transpilePython(project: Project, fileId: string): GeneratedOutput {
  const file = project.files.find(f => f.id === fileId) ?? project.files[0]
  if (!file) return { targetId: 'python', code: '# No file selected', diagnostics: [], sourceMap: {} }

  const diagnostics: Diagnostic[] = []
  const sourceMap: Record<string, [number, number]> = {}
  let lineCounter = 0

  const parts = file.blocks.map(block => {
    const startLine = lineCounter
    const code = renderPyBlock(block, 0, diagnostics)
    const lines = code.split('\n').length
    lineCounter += lines + 1
    if (block.id) sourceMap[block.id] = [startLine, startLine + lines - 1]
    return code
  }).filter(Boolean)

  return { targetId: 'python', code: parts.join('\n\n'), diagnostics, sourceMap }
}

function renderPyBlock(item: Block, depth: number, diags: Diagnostic[]): string {
  const pad = INDENT.repeat(depth)
  const f = item.fields ?? {}

  switch (item.type) {
    case 'class': {
      const name = safeId(f.name, 'UnnamedClass', diags, item)
      const parent = f.extendsName?.trim() ? `(${f.extendsName.trim()})` : ''
      const members = renderPyChildren(item, depth + 1, diags, renderPyClassMember)
      const body = members || `${INDENT.repeat(depth + 1)}pass`
      return `${pad}class ${name}${parent}:\n${body}`
    }
    case 'function': {
      const name = safeId(f.name, 'fn', diags, item)
      const params = f.params || ''
      const body = renderPyChildren(item, depth + 1, diags) || `${INDENT.repeat(depth + 1)}pass`
      return `${pad}def ${name}(${params}):\n${body}`
    }
    case 'variable':
      return `${pad}${safeId(f.name, 'value', diags, item)} = ${val(f.value, 'None')}`
    case 'assign':
      return `${pad}${f.target || 'value'} = ${val(f.value, 'None')}`
    case 'call':
      return `${pad}${val(f.expression, 'None')}`
    case 'return':
      return `${pad}return ${val(f.expression, 'None')}`
    case 'log':
      return `${pad}print(${val(f.expression, '""')})`
    case 'if': {
      const children = renderPyChildren(item, depth + 1, diags)
      const body = children || (f.body ? pyIndent(f.body, depth + 1) : `${INDENT.repeat(depth + 1)}pass`)
      return `${pad}if ${val(f.condition, 'True')}:\n${body}`
    }
    case 'loop': {
      const it = safeId(f.iterator, 'i', diags, item)
      const children = renderPyChildren(item, depth + 1, diags)
      const body = children || (f.body ? pyIndent(f.body, depth + 1) : `${INDENT.repeat(depth + 1)}pass`)
      return `${pad}for ${it} in range(${val(f.count, '0')}):\n${body}`
    }
    case 'forEachItem': {
      const list = safeId(f.list, 'items', diags, item)
      const itemParam = safeId(f.itemParam, 'item', diags, item)
      const body = renderPyChildren(item, depth + 1, diags) || `${INDENT.repeat(depth + 1)}pass`
      return `${pad}for ${itemParam} in ${list}:\n${body}`
    }
    case 'transformList': {
      const list = safeId(f.list, 'items', diags, item)
      const itemParam = safeId(f.itemParam, 'item', diags, item)
      const outputName = safeId(f.outputName, 'result', diags, item)
      const retBlock = (item.children ?? []).find(c => c.type === 'return')
      const expr = retBlock ? val(retBlock.fields?.expression, itemParam) : itemParam
      return `${pad}${outputName} = [${expr} for ${itemParam} in ${list}]`
    }
    case 'filterList': {
      const list = safeId(f.list, 'items', diags, item)
      const itemParam = safeId(f.itemParam, 'item', diags, item)
      const outputName = safeId(f.outputName, 'filtered', diags, item)
      const retBlock = (item.children ?? []).find(c => c.type === 'return')
      const cond = retBlock ? val(retBlock.fields?.expression, 'True') : 'True'
      return `${pad}${outputName} = [${itemParam} for ${itemParam} in ${list} if ${cond}]`
    }
    // Async/promise chains — not supported in basic Python mode
    case 'whenReady':
    case 'chainStep':
    case 'callWithCallback': {
      diags.push({ level: 'warning', message: `Async/promise blocks are not available in Python mode.`, blockId: item.id })
      return `${pad}# async block not supported in Python`
    }
    // HTML/DOM blocks don't apply to Python
    case 'event':
    case 'htmlText':
    case 'readValue':
    case 'addClass':
    case 'removeClass':
    case 'toggleClass':
    case 'setStyle': {
      diags.push({ level: 'warning', message: `HTML/DOM blocks are not available in Python mode.`, blockId: item.id })
      return `${pad}# DOM block not supported in Python`
    }
    // TypeScript-only blocks
    case 'interface':
    case 'typeAlias':
    case 'enum':
    case 'interfaceField':
    case 'enumMember': {
      diags.push({ level: 'info', message: `TypeScript-only block skipped in Python.`, blockId: item.id })
      return ''
    }
    default: {
      const def = blockDefinition(item.type)
      diags.push({ level: 'warning', message: def ? `No Python renderer for ${def.label}.` : `Unknown block type: ${item.type}.`, blockId: item.id })
      return ''
    }
  }
}

function renderPyClassMember(item: Block, depth: number, diags: Diagnostic[]): string {
  const pad = INDENT.repeat(depth)
  const f = item.fields ?? {}

  switch (item.type) {
    case 'constructor': {
      const params = f.params ? `, ${f.params}` : ''
      const body = f.body ? pyIndent(f.body, depth + 1) : `${INDENT.repeat(depth + 1)}pass`
      return `${pad}def __init__(self${params}):\n${body}`
    }
    case 'method': {
      const name = safeId(f.name, 'method', diags, item)
      const params = f.params ? `, ${f.params}` : ''
      const body = f.body ? pyIndent(f.body, depth + 1) : `${INDENT.repeat(depth + 1)}pass`
      return `${pad}def ${name}(self${params}):\n${body}`
    }
    case 'staticMethod': {
      const name = safeId(f.name, 'method', diags, item)
      const params = f.params || ''
      const body = f.body ? pyIndent(f.body, depth + 1) : `${INDENT.repeat(depth + 1)}pass`
      return `${pad}@staticmethod\n${pad}def ${name}(${params}):\n${body}`
    }
    case 'getter': {
      const name = safeId(f.name, 'property', diags, item)
      const body = f.body ? pyIndent(f.body, depth + 1) : `${INDENT.repeat(depth + 1)}pass`
      return `${pad}@property\n${pad}def ${name}(self):\n${body}`
    }
    case 'setter': {
      const name = safeId(f.name, 'property', diags, item)
      const param = safeId(f.param, 'value', diags, item)
      const body = f.body ? pyIndent(f.body, depth + 1) : `${INDENT.repeat(depth + 1)}pass`
      return `${pad}@${name}.setter\n${pad}def ${name}(self, ${param}):\n${body}`
    }
    case 'field': {
      // Class-level attribute in Python
      const name = safeId(f.name, 'field', diags, item)
      return `${pad}${name} = ${val(f.value, 'None')}`
    }
    default:
      return renderPyBlock(item, depth, diags)
  }
}

function renderPyChildren(
  item: Block,
  depth: number,
  diags: Diagnostic[],
  renderer: (b: Block, d: number, diags: Diagnostic[]) => string = renderPyBlock,
): string {
  return (item.children ?? [])
    .map(child => renderer(child, depth, diags))
    .filter(Boolean)
    .join('\n')
}

function safeId(value: string | undefined, fallback: string, diags: Diagnostic[], item: Block): string {
  const text = String(value || '').trim()
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(text)) return text
  diags.push({ level: 'warning', message: `"${text || '(blank)'}" is not a valid Python identifier; using "${fallback}".`, blockId: item.id })
  return fallback
}

function pyIndent(source: string, depth: number): string {
  const pad = INDENT.repeat(depth)
  return String(source).split('\n').map(line => `${pad}${line}`).join('\n')
}

function val(value: string | undefined, fallback: string): string {
  const text = String(value ?? '').trim()
  return text || fallback
}
