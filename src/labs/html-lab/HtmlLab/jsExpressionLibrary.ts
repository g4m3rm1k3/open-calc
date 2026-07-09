// A curated library of common JS expressions, grouped and parameterized —
// the same idea as CSS_PROP_GROUPS/CSS_PROP_VALUES in VisualJsPanel.tsx, just
// for JS instead of CSS. Doesn't try to cover the whole language (that's
// infinite); covers the patterns a beginner actually needs constantly
// (find an element, fetch some JSON, round a number, uppercase text...) so
// they're a dropdown pick instead of memorized syntax. Anything not covered
// still falls back to typing it by hand — every field this powers stays a
// normal, always-editable text input.
//
// Params of kind 'expression' are genuinely recursive: VisualJsPanel renders
// them as another full nested pattern-picker, not a plain text box — so
// "call a method with an argument that's itself a comparison that's itself
// a property lookup" can be built (or, via detectTemplate below, decomposed
// back out of already-written code) one explicit piece at a time, instead
// of bottoming out at "type the rest by hand" the moment there's more than
// one operator in play.

export type ExpressionParamKind = 'selector' | 'variable' | 'expression' | 'text'

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
  { id: 'calls', label: 'Calls & properties' },
  { id: 'logic', label: 'Logic (and / or / not)' },
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

  // ── Calls & properties ──────────────────────────────────────────────────
  // The general-purpose building blocks: "call this with these arguments"
  // and "get this property off that." Every argument is itself a nested
  // expression picker, so e.g. btn.addEventListener('click', load) breaks
  // down into: call → fn: btn.addEventListener, arg1: a text literal,
  // arg2: a bare identifier — instead of one opaque string.
  {
    id: 'callFn', group: 'calls', label: 'Call a function or method',
    description: "name(arg1, arg2, arg3) — e.g. btn.addEventListener. Leave argument boxes blank if not needed.",
    params: [
      p('fn', 'Function / method (e.g. btn.addEventListener)', 'text'),
      p('arg1', 'Argument 1 (optional)', 'expression'),
      p('arg2', 'Argument 2 (optional)', 'expression'),
      p('arg3', 'Argument 3 (optional)', 'expression'),
    ],
    build: v => {
      const args = [v.arg1, v.arg2, v.arg3].map(a => (a ?? '').trim()).filter(Boolean)
      return `${v.fn || 'fn'}(${args.join(', ')})`
    },
  },
  {
    id: 'getProperty', group: 'calls', label: 'Get a property',
    description: 'object.property',
    params: [p('object', 'Object', 'expression'), p('property', 'Property name', 'text')],
    build: v => `${v.object || 'object'}.${v.property || 'property'}`,
  },

  // ── Logic (boolean combinators) ─────────────────────────────────────────
  // These read as sentences on purpose — a learner should never have to
  // wonder what && does at a given point; the label says it.
  {
    id: 'logicAnd', group: 'logic', label: 'Both must be true (AND)',
    description: 'a && b',
    params: [p('a', 'First', 'expression'), p('b', 'Second', 'expression')],
    build: v => `${v.a || 'a'} && ${v.b || 'b'}`,
  },
  {
    id: 'logicOr', group: 'logic', label: 'Either can be true (OR)',
    description: 'a || b',
    params: [p('a', 'First', 'expression'), p('b', 'Second', 'expression')],
    build: v => `${v.a || 'a'} || ${v.b || 'b'}`,
  },
  {
    id: 'logicNot', group: 'logic', label: 'Is not true (NOT)',
    description: '!value',
    params: [p('value', 'Value', 'expression')],
    build: v => `!${v.value || 'value'}`,
  },
  {
    id: 'guardThen', group: 'logic', label: 'Only if it exists, then...',
    description: "value && action — a common safety check: don't run action unless value is real (not null/undefined). Same as AND, worded for this specific, very common use.",
    params: [p('check', 'Only if this exists', 'expression'), p('then', 'Then do this', 'expression')],
    build: v => `${v.check || 'value'} && ${v.then || 'action'}`,
  },

  // ── Network / JSON ───────────────────────────────────────────────────────
  {
    id: 'fetchJson', group: 'network', label: 'Fetch JSON from a URL',
    description: 'fetch(url).then(response => response.json()) — just the promise, e.g. to return or assign it',
    params: [p('url', 'URL', 'text', 'https://api.example.com')],
    build: v => `fetch(${JSON.stringify(v.url || '')}).then(response => response.json())`,
  },
  {
    id: 'fetchJsonHandle', group: 'network', label: 'Fetch JSON, then use it',
    description: 'fetch(url).then(r => r.json()).then(data => { ... }) — the whole chain, explicit: fill in what happens with the data, and (optionally) what happens if it fails',
    params: [
      p('url', 'URL', 'text', 'https://api.example.com'),
      p('body', 'What to do with the data (data is available)', 'text', 'console.log(data)'),
      p('errorBody', 'What to do if it fails (optional)', 'text', ''),
    ],
    build: v => {
      const url = JSON.stringify(v.url || '')
      const body = v.body?.trim() || 'console.log(data)'
      const base = `fetch(${url}).then(response => response.json()).then(data => { ${body} })`
      const errorBody = v.errorBody?.trim()
      return errorBody ? `${base}.catch(error => { ${errorBody} })` : base
    },
  },
  {
    id: 'fetchText', group: 'network', label: 'Fetch plain text from a URL',
    description: 'fetch(url).then(response => response.text())',
    params: [p('url', 'URL', 'text', 'https://api.example.com')],
    build: v => `fetch(${JSON.stringify(v.url || '')}).then(response => response.text())`,
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
    params: [p('a', 'First', 'expression'), p('b', 'Second', 'expression')],
    build: v => `${v.a || 'a'} === ${v.b || 'b'}`,
  },
  {
    id: 'cmpNotEquals', group: 'compare', label: 'Are not equal',
    description: 'a !== b',
    params: [p('a', 'First', 'expression'), p('b', 'Second', 'expression')],
    build: v => `${v.a || 'a'} !== ${v.b || 'b'}`,
  },
  {
    id: 'cmpGreater', group: 'compare', label: 'Greater than',
    description: 'a > b',
    params: [p('a', 'First', 'expression'), p('b', 'Second', 'expression')],
    build: v => `${v.a || 'a'} > ${v.b || 'b'}`,
  },
  {
    id: 'cmpLess', group: 'compare', label: 'Less than',
    description: 'a < b',
    params: [p('a', 'First', 'expression'), p('b', 'Second', 'expression')],
    build: v => `${v.a || 'a'} < ${v.b || 'b'}`,
  },
]

// ── Reverse detection ─────────────────────────────────────────────────────
// Run once, at mount, against whatever text a field already holds (e.g. code
// just parsed in from the JS file) — so already-written a && b / a || b /
// !a / name(args) shows up pre-decomposed into real, explicit blocks instead
// of always defaulting to "type manually" just because it wasn't built
// through this UI in the first place. Deliberately narrow: these are the
// few shapes with syntax simple and unambiguous enough to detect reliably
// without a real JS parser. Anything else still falls back to manual entry,
// same as always.

function findTopLevel(s: string, op: string): number {
  let depth = 0
  let inStr = false
  let strCh = ''
  for (let i = 0; i <= s.length - op.length; i++) {
    const ch = s[i]
    if (inStr) { if (ch === strCh && s[i - 1] !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) depth--
    if (depth === 0 && s.slice(i, i + op.length) === op) return i
  }
  return -1
}

function splitArgs(s: string): string[] {
  const args: string[] = []
  let depth = 0, inStr = false, strCh = '', start = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inStr) { if (ch === strCh && s[i - 1] !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) depth--
    if (depth === 0 && ch === ',') { args.push(s.slice(start, i).trim()); start = i + 1 }
  }
  const last = s.slice(start).trim()
  if (last) args.push(last)
  return args
}

export interface DetectedTemplate {
  id: string
  params: Record<string, string>
}

export function detectTemplate(value: string): DetectedTemplate | null {
  const v = value.trim()
  if (!v) return null

  const andAt = findTopLevel(v, '&&')
  if (andAt !== -1) return { id: 'logicAnd', params: { a: v.slice(0, andAt).trim(), b: v.slice(andAt + 2).trim() } }

  const orAt = findTopLevel(v, '||')
  if (orAt !== -1) return { id: 'logicOr', params: { a: v.slice(0, orAt).trim(), b: v.slice(orAt + 2).trim() } }

  if (v.startsWith('!') && v[1] !== '=') return { id: 'logicNot', params: { value: v.slice(1).trim() } }

  // name(args) or a.b.c(args) — the whole string, not just a piece of it
  const callM = v.match(/^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\((.*)\)$/)
  if (callM) {
    const args = splitArgs(callM[2])
    if (args.length <= 3) {
      const params: Record<string, string> = { fn: callM[1] }
      args.forEach((a, i) => { params[`arg${i + 1}`] = a })
      return { id: 'callFn', params }
    }
  }

  return null
}
