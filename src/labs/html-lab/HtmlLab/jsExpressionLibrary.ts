// A curated library of common JS expressions, grouped and parameterized —
// the same idea as CSS_PROP_GROUPS/CSS_PROP_VALUES in VisualJsPanel.tsx, just
// for JS instead of CSS. Doesn't try to cover the whole language (that's
// infinite); covers the patterns a beginner actually needs constantly
// (find an element, fetch some JSON, round a number, uppercase text...) so
// they're a dropdown pick instead of memorized syntax. Anything not covered
// still falls back to typing it by hand — every field this powers stays a
// normal, always-editable text input.

export type ExpressionParamKind = 'selector' | 'variable' | 'text'

export interface ExpressionParam {
  name: string
  label: string
  kind: ExpressionParamKind
  placeholder?: string
  default?: string
}

export interface ExpressionTemplate {
  id: string
  group: string
  label: string
  description: string
  params: ExpressionParam[]
  build: (v: Record<string, string>) => string
}

export const EXPRESSION_GROUPS: { id: string; label: string }[] = [
  { id: 'dom', label: 'Find on the page' },
  { id: 'network', label: 'Network / JSON' },
  { id: 'text', label: 'Text' },
  { id: 'array', label: 'Lists' },
  { id: 'math', label: 'Math' },
  { id: 'convert', label: 'Convert' },
  { id: 'time', label: 'Time' },
  { id: 'compare', label: 'Compare' },
]

const p = (name: string, label: string, kind: ExpressionParamKind = 'text', def?: string): ExpressionParam =>
  ({ name, label, kind, default: def })

export const EXPRESSION_LIBRARY: ExpressionTemplate[] = [
  // ── DOM ──────────────────────────────────────────────────────────────────
  {
    id: 'querySelector', group: 'dom', label: 'Find one element',
    description: 'document.querySelector(selector)',
    params: [p('selector', 'Element', 'selector')],
    build: v => `document.querySelector(${JSON.stringify(v.selector || '')})`,
  },
  {
    id: 'querySelectorAll', group: 'dom', label: 'Find all matching elements',
    description: 'document.querySelectorAll(selector) — a list, not one element',
    params: [p('selector', 'Elements', 'selector')],
    build: v => `document.querySelectorAll(${JSON.stringify(v.selector || '')})`,
  },
  {
    id: 'createElement', group: 'dom', label: 'Create a new element',
    description: "document.createElement(tag) — not on the page until you add it",
    params: [p('tag', 'Tag name', 'text', 'div')],
    build: v => `document.createElement(${JSON.stringify(v.tag || 'div')})`,
  },
  {
    id: 'closest', group: 'dom', label: 'Nearest ancestor matching a selector',
    description: 'element.closest(selector)',
    params: [p('value', 'Element', 'variable'), p('selector', 'Ancestor', 'selector')],
    build: v => `${v.value || 'element'}.closest(${JSON.stringify(v.selector || '')})`,
  },

  // ── Network / JSON ───────────────────────────────────────────────────────
  {
    id: 'fetchJson', group: 'network', label: 'Fetch JSON from a URL',
    description: 'fetch(url).then(response => response.json())',
    params: [p('url', 'URL', 'text', 'https://api.example.com')],
    build: v => `fetch(${JSON.stringify(v.url || '')}).then(response => response.json())`,
  },
  {
    id: 'jsonStringify', group: 'network', label: 'Turn a value into JSON text',
    description: 'JSON.stringify(value)',
    params: [p('value', 'Value', 'variable')],
    build: v => `JSON.stringify(${v.value || 'value'})`,
  },
  {
    id: 'jsonParse', group: 'network', label: 'Turn JSON text into a value',
    description: 'JSON.parse(text)',
    params: [p('value', 'JSON text', 'variable')],
    build: v => `JSON.parse(${v.value || 'text'})`,
  },

  // ── Text ─────────────────────────────────────────────────────────────────
  {
    id: 'strUpper', group: 'text', label: 'Make uppercase',
    description: 'text.toUpperCase()',
    params: [p('value', 'Text', 'variable')],
    build: v => `${v.value || 'text'}.toUpperCase()`,
  },
  {
    id: 'strLower', group: 'text', label: 'Make lowercase',
    description: 'text.toLowerCase()',
    params: [p('value', 'Text', 'variable')],
    build: v => `${v.value || 'text'}.toLowerCase()`,
  },
  {
    id: 'strTrim', group: 'text', label: 'Remove leading/trailing spaces',
    description: 'text.trim()',
    params: [p('value', 'Text', 'variable')],
    build: v => `${v.value || 'text'}.trim()`,
  },
  {
    id: 'strIncludes', group: 'text', label: 'Contains a piece of text?',
    description: 'text.includes(search)',
    params: [p('value', 'Text', 'variable'), p('search', 'Looking for', 'text')],
    build: v => `${v.value || 'text'}.includes(${JSON.stringify(v.search || '')})`,
  },
  {
    id: 'strReplace', group: 'text', label: 'Replace a piece of text',
    description: 'text.replace(find, withThis)',
    params: [p('value', 'Text', 'variable'), p('search', 'Find', 'text'), p('replacement', 'Replace with', 'text')],
    build: v => `${v.value || 'text'}.replace(${JSON.stringify(v.search || '')}, ${JSON.stringify(v.replacement || '')})`,
  },
  {
    id: 'strSplit', group: 'text', label: 'Split into a list',
    description: "text.split(separator)",
    params: [p('value', 'Text', 'variable'), p('separator', 'Split on', 'text', ',')],
    build: v => `${v.value || 'text'}.split(${JSON.stringify(v.separator ?? ',')})`,
  },
  {
    id: 'strLength', group: 'text', label: 'How many characters?',
    description: 'text.length',
    params: [p('value', 'Text', 'variable')],
    build: v => `${v.value || 'text'}.length`,
  },
  {
    id: 'templateJoin', group: 'text', label: 'Combine text with a value',
    description: '`before${value}after` — a template string',
    params: [p('before', 'Text before', 'text'), p('value', 'Value', 'variable'), p('after', 'Text after', 'text')],
    build: v => `\`${v.before || ''}\${${v.value || 'value'}}${v.after || ''}\``,
  },

  // ── Lists (arrays) ───────────────────────────────────────────────────────
  {
    id: 'arrLength', group: 'array', label: 'How many items?',
    description: 'list.length',
    params: [p('value', 'List', 'variable')],
    build: v => `${v.value || 'list'}.length`,
  },
  {
    id: 'arrJoin', group: 'array', label: 'Join into one piece of text',
    description: 'list.join(separator)',
    params: [p('value', 'List', 'variable'), p('separator', 'Between items', 'text', ', ')],
    build: v => `${v.value || 'list'}.join(${JSON.stringify(v.separator ?? ', ')})`,
  },
  {
    id: 'arrIncludes', group: 'array', label: 'Contains an item?',
    description: 'list.includes(item)',
    params: [p('value', 'List', 'variable'), p('item', 'Item', 'text')],
    build: v => `${v.value || 'list'}.includes(${v.item || ''})`,
  },
  {
    id: 'arrPush', group: 'array', label: 'Add an item to the end',
    description: 'list.push(item)',
    params: [p('value', 'List', 'variable'), p('item', 'Item to add', 'text')],
    build: v => `${v.value || 'list'}.push(${v.item || ''})`,
  },
  {
    id: 'arrMap', group: 'array', label: 'Transform every item',
    description: 'list.map(item => ...)',
    params: [p('value', 'List', 'variable'), p('expr', 'New value for each item', 'text', 'item')],
    build: v => `${v.value || 'list'}.map(item => ${v.expr || 'item'})`,
  },
  {
    id: 'arrFilter', group: 'array', label: 'Keep only matching items',
    description: 'list.filter(item => ...)',
    params: [p('value', 'List', 'variable'), p('expr', 'Keep item when', 'text', 'true')],
    build: v => `${v.value || 'list'}.filter(item => ${v.expr || 'true'})`,
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  {
    id: 'mathRandom', group: 'math', label: 'Random number, 0 to 1',
    description: 'Math.random()',
    params: [],
    build: () => 'Math.random()',
  },
  {
    id: 'mathRandomInt', group: 'math', label: 'Random whole number',
    description: 'Math.floor(Math.random() * max)',
    params: [p('max', 'Up to (exclusive)', 'text', '10')],
    build: v => `Math.floor(Math.random() * ${v.max || '10'})`,
  },
  {
    id: 'mathRound', group: 'math', label: 'Round to nearest whole number',
    description: 'Math.round(value)',
    params: [p('value', 'Value', 'variable')],
    build: v => `Math.round(${v.value || '0'})`,
  },
  {
    id: 'mathFloor', group: 'math', label: 'Round down',
    description: 'Math.floor(value)',
    params: [p('value', 'Value', 'variable')],
    build: v => `Math.floor(${v.value || '0'})`,
  },
  {
    id: 'mathMax', group: 'math', label: 'Larger of two values',
    description: 'Math.max(a, b)',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'variable')],
    build: v => `Math.max(${v.a || '0'}, ${v.b || '0'})`,
  },
  {
    id: 'mathMin', group: 'math', label: 'Smaller of two values',
    description: 'Math.min(a, b)',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'variable')],
    build: v => `Math.min(${v.a || '0'}, ${v.b || '0'})`,
  },

  // ── Convert ──────────────────────────────────────────────────────────────
  {
    id: 'toNumber', group: 'convert', label: 'Turn into a number',
    description: 'Number(value)',
    params: [p('value', 'Value', 'variable')],
    build: v => `Number(${v.value || 'value'})`,
  },
  {
    id: 'toText', group: 'convert', label: 'Turn into text',
    description: 'String(value)',
    params: [p('value', 'Value', 'variable')],
    build: v => `String(${v.value || 'value'})`,
  },
  {
    id: 'parseWholeNumber', group: 'convert', label: 'Read a whole number from text',
    description: 'parseInt(text)',
    params: [p('value', 'Text', 'variable')],
    build: v => `parseInt(${v.value || 'text'})`,
  },
  {
    id: 'parseDecimal', group: 'convert', label: 'Read a decimal number from text',
    description: 'parseFloat(text)',
    params: [p('value', 'Text', 'variable')],
    build: v => `parseFloat(${v.value || 'text'})`,
  },

  // ── Time ─────────────────────────────────────────────────────────────────
  {
    id: 'dateNow', group: 'time', label: 'Current time (milliseconds)',
    description: 'Date.now()',
    params: [],
    build: () => 'Date.now()',
  },
  {
    id: 'newDate', group: 'time', label: "Today's date and time",
    description: 'new Date()',
    params: [],
    build: () => 'new Date()',
  },

  // ── Compare (mainly for If conditions) ──────────────────────────────────
  {
    id: 'cmpEquals', group: 'compare', label: 'Are equal',
    description: 'a === b',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'text')],
    build: v => `${v.a || 'a'} === ${v.b || 'b'}`,
  },
  {
    id: 'cmpNotEquals', group: 'compare', label: 'Are not equal',
    description: 'a !== b',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'text')],
    build: v => `${v.a || 'a'} !== ${v.b || 'b'}`,
  },
  {
    id: 'cmpGreater', group: 'compare', label: 'Greater than',
    description: 'a > b',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'text')],
    build: v => `${v.a || 'a'} > ${v.b || 'b'}`,
  },
  {
    id: 'cmpLess', group: 'compare', label: 'Less than',
    description: 'a < b',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'text')],
    build: v => `${v.a || 'a'} < ${v.b || 'b'}`,
  },
  {
    id: 'cmpAnd', group: 'compare', label: 'Both are true',
    description: 'a && b',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'variable')],
    build: v => `${v.a || 'a'} && ${v.b || 'b'}`,
  },
  {
    id: 'cmpOr', group: 'compare', label: 'Either is true',
    description: 'a || b',
    params: [p('a', 'First', 'variable'), p('b', 'Second', 'variable')],
    build: v => `${v.a || 'a'} || ${v.b || 'b'}`,
  },
  {
    id: 'cmpNot', group: 'compare', label: 'Is not true',
    description: '!value',
    params: [p('value', 'Value', 'variable')],
    build: v => `!${v.value || 'value'}`,
  },
]
