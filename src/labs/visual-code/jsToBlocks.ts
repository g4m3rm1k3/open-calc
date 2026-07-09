// Reverse-transpiles a JavaScript string into a Block[] tree.
// Recognises patterns output by transpiler.ts plus common hand-written JS.

import { createBlock } from './blocks.ts'
import type { Block, BlockType } from './types.ts'

function mkBlock(type: BlockType, fields: Record<string, string>, children: Block[] = []): Block {
  const base = createBlock(type)
  return { ...base, fields: { ...base.fields, ...fields }, children }
}

// Find the closing '}' matching the opening '{' at openAt.
function matchBrace(s: string, openAt: number): number {
  let depth = 0
  let inStr = false
  let strCh = ''
  for (let i = openAt; i < s.length; i++) {
    const ch = s[i]
    if (inStr) { if (ch === strCh && s[i - 1] !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') depth++
    if (ch === '}') { depth--; if (depth === 0) return i }
  }
  return s.length - 1
}

// Find the closing ')' matching the opening '(' at openAt.
function matchParen(s: string, openAt: number): number {
  let depth = 0
  let inStr = false
  let strCh = ''
  for (let i = openAt; i < s.length; i++) {
    const ch = s[i]
    if (inStr) { if (ch === strCh && s[i - 1] !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '(') depth++
    if (ch === ')') { depth--; if (depth === 0) return i }
  }
  return s.length - 1
}

// Split code into top-level statements, respecting string/comment/brace/paren nesting.
function splitStatements(code: string): string[] {
  const result: string[] = []
  let buf = ''
  let braceDepth = 0
  let parenDepth = 0
  let inStr = false
  let strCh = ''
  let inLine = false
  let inBlock = false

  for (let i = 0; i < code.length; i++) {
    const ch = code[i]
    const next = i + 1 < code.length ? code[i + 1] : ''

    if (inLine)  { if (ch === '\n') inLine = false; continue }
    if (inBlock) { if (ch === '*' && next === '/') { i++; inBlock = false }; continue }
    if (!inStr && ch === '/' && next === '/') { inLine = true; continue }
    if (!inStr && ch === '/' && next === '*') { inBlock = true; i++; continue }

    if (inStr) {
      buf += ch
      if (ch === strCh && code[i - 1] !== '\\') inStr = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; buf += ch; continue }

    if (ch === '(') parenDepth++
    else if (ch === ')') parenDepth--
    else if (ch === '{') braceDepth++
    else if (ch === '}') braceDepth--

    buf += ch

    if (braceDepth === 0 && parenDepth === 0) {
      if (ch === ';' || ch === '}') {
        const s = buf.trim()
        if (s.length > 1 && s !== '}') result.push(s)
        buf = ''
      }
    }
  }

  const rem = buf.trim()
  if (rem.length > 1) result.push(rem)
  return result
}

// Detect (function() { ... })() IIFEs and return the body, or null if not an IIFE.
function tryUnwrapIife(s: string): string | null {
  if (!/^\(\s*(?:async\s+)?function\s*[\w$]*\s*\(/.test(s)) return null
  const firstBrace = s.indexOf('{')
  if (firstBrace === -1) return null
  const lastBrace = matchBrace(s, firstBrace)
  // After the closing } there must be a ) to close the wrapping ( — confirming it's an IIFE call.
  if (s.slice(lastBrace + 1).trimStart()[0] !== ')') return null
  return s.slice(firstBrace + 1, lastBrace)
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseJsToBlocks(code: string): Block[] {
  if (!code?.trim()) return []
  const blocks: Block[] = []
  for (const stmt of splitStatements(code)) {
    const iife = tryUnwrapIife(stmt)
    if (iife !== null) {
      // Unwrap: parse the IIFE body as if it were top-level statements
      blocks.push(...parseJsToBlocks(iife))
    } else {
      const b = parseStmt(stmt)
      if (b) blocks.push(b)
    }
  }
  return blocks
}

// ── Statement matcher ─────────────────────────────────────────────────────────

function parseStmt(raw: string): Block | null {
  // Strip trailing semicolon
  const s = raw.trim().replace(/;$/, '').trim()
  if (!s || s === '}') return null

  // ── Event listener ───────────────────────────────────────────────────────
  // document.querySelector('sel')?.addEventListener('evt', (event) => { ... });
  // or, just as commonly, a variable captured earlier:
  // varName?.addEventListener('evt', (event) => { ... });
  if (s.includes('addEventListener')) {
    const selM = s.match(/document\.querySelector\(['"`]([^'"`]+)['"`]\)/)
    const varM = !selM ? s.match(/^([A-Za-z_$][\w$]*)\??\.addEventListener\(/) : null
    const evtM = s.match(/\.addEventListener\(['"`]([^'"`]+)['"`]/)
    const addIdx = s.indexOf('addEventListener')
    const braceOpen = addIdx !== -1 ? s.indexOf('{', addIdx) : -1
    if ((selM || varM) && evtM && braceOpen !== -1) {
      const braceClose = matchBrace(s, braceOpen)
      const children = parseJsToBlocks(s.slice(braceOpen + 1, braceClose))
      const target = selM
        ? { targetKind: 'selector', selector: selM[1], variableName: '' }
        : { targetKind: 'variable', variableName: varM![1], selector: '' }
      return mkBlock('event', { ...target, event: evtM[1] }, children)
    }
  }

  // ── Function declaration ─────────────────────────────────────────────────
  if (/^(?:async\s+)?function\s+\w/.test(s)) {
    const fnM = s.match(/^(?:(async)\s+)?function\s+(\w+)\s*\(/)
    if (fnM) {
      const parenOpen = s.indexOf('(', fnM[0].length - 1)
      const parenClose = matchParen(s, parenOpen)
      const params = s.slice(parenOpen + 1, parenClose).trim()
      const braceOpen = s.indexOf('{', parenClose)
      if (braceOpen !== -1) {
        const braceClose = matchBrace(s, braceOpen)
        const children = parseJsToBlocks(s.slice(braceOpen + 1, braceClose))
        return mkBlock('function', { name: fnM[2], params, async: fnM[1] ? 'true' : 'false' }, children)
      }
    }
  }

  // ── classList ────────────────────────────────────────────────────────────
  const CLASS_MAP = { add: 'addClass', remove: 'removeClass', toggle: 'toggleClass' } as const
  const clsM = s.match(/document\.querySelector\(['"`]([^'"`]+)['"`]\)\??\.classList\.(add|remove|toggle)\(['"`]([^'"`]+)['"`]\)/)
  if (clsM) {
    return mkBlock(CLASS_MAP[clsM[2] as keyof typeof CLASS_MAP], { targetKind: 'selector', selector: clsM[1], className: clsM[3] })
  }
  const clsVarM = s.match(/^([A-Za-z_$][\w$]*)\??\.classList\.(add|remove|toggle)\(['"`]([^'"`]+)['"`]\)/)
  if (clsVarM) {
    return mkBlock(CLASS_MAP[clsVarM[2] as keyof typeof CLASS_MAP], { targetKind: 'variable', variableName: clsVarM[1], className: clsVarM[3] })
  }

  // ── setStyle ─────────────────────────────────────────────────────────────
  // (document.querySelector('sel') as HTMLElement).style.prop = value
  // or varName.style.prop = value
  if (s.includes('.style.')) {
    const styleM = s.match(/document\.querySelector\(['"`]([^'"`]+)['"`]\)(?:\s*as\s*\w+)?.*?\.style\.(\w+)\s*=\s*([\s\S]+)/)
    if (styleM) {
      const rawVal = styleM[3].trim()
      const val = rawVal.replace(/^['"`](.*)['"`]$/, '$1')
      return mkBlock('setStyle', { targetKind: 'selector', selector: styleM[1], property: styleM[2], value: val })
    }
    const styleVarM = s.match(/^([A-Za-z_$][\w$]*)\.style\.(\w+)\s*=\s*([\s\S]+)/)
    if (styleVarM) {
      const rawVal = styleVarM[3].trim()
      const val = rawVal.replace(/^['"`](.*)['"`]$/, '$1')
      return mkBlock('setStyle', { targetKind: 'variable', variableName: styleVarM[1], property: styleVarM[2], value: val })
    }
  }

  // ── htmlText ─────────────────────────────────────────────────────────────
  // document.querySelector('sel').textContent = String(val)
  // or varName.textContent = String(val)
  if (s.includes('textContent') || s.includes('innerText')) {
    const txtM = s.match(/document\.querySelector\(['"`]([^'"`]+)['"`]\)\??\.(?:textContent|innerText)\s*=\s*([\s\S]+)/)
    if (txtM) {
      let text = txtM[2].trim()
      const wrap = text.match(/^String\((.+)\)$/)
      if (wrap) text = wrap[1]
      return mkBlock('htmlText', { targetKind: 'selector', selector: txtM[1], text })
    }
    const txtVarM = s.match(/^([A-Za-z_$][\w$]*)\??\.(?:textContent|innerText)\s*=\s*([\s\S]+)/)
    if (txtVarM) {
      let text = txtVarM[2].trim()
      const wrap = text.match(/^String\((.+)\)$/)
      if (wrap) text = wrap[1]
      return mkBlock('htmlText', { targetKind: 'variable', variableName: txtVarM[1], text })
    }
  }

  // ── readValue ────────────────────────────────────────────────────────────
  // const name = (document.querySelector('sel') as HTMLInputElement).value
  // or const name = varName.value
  if (s.includes('.value') && /^(?:const|let|var)/.test(s)) {
    const readM = s.match(/^(?:const|let|var)\s+(\w+)\s*=\s*\(?document\.querySelector\(['"`]([^'"`]+)['"`]\)(?:\s*as\s*\w+)?\)?\.value/)
    if (readM) return mkBlock('readValue', { name: readM[1], targetKind: 'selector', selector: readM[2] })
    const readVarM = s.match(/^(?:const|let|var)\s+(\w+)\s*=\s*([A-Za-z_$][\w$]*)\.value/)
    if (readVarM) return mkBlock('readValue', { name: readVarM[1], targetKind: 'variable', variableName: readVarM[2] })
  }

  // ── Variable declaration ─────────────────────────────────────────────────
  const varM = s.match(/^(const|let|var)\s+(\w+)(?:\s*:\s*[\w<>[\]| ,]+)?\s*=\s*([\s\S]+)/)
  if (varM) return mkBlock('variable', { kind: varM[1], name: varM[2], value: varM[3].trim() })

  // ── console.log ──────────────────────────────────────────────────────────
  if (s.startsWith('console.log(')) {
    const parenOpen = s.indexOf('(')
    const parenClose = matchParen(s, parenOpen)
    return mkBlock('log', { expression: s.slice(parenOpen + 1, parenClose).trim() })
  }

  // ── if statement ─────────────────────────────────────────────────────────
  if (/^if\s*\(/.test(s)) {
    const parenOpen = s.indexOf('(')
    const parenClose = matchParen(s, parenOpen)
    const condition = s.slice(parenOpen + 1, parenClose).trim()
    const braceOpen = s.indexOf('{', parenClose)
    if (braceOpen !== -1) {
      const braceClose = matchBrace(s, braceOpen)
      const body = s.slice(braceOpen + 1, braceClose)
      const children = parseJsToBlocks(body)
      return children.length
        ? mkBlock('if', { condition }, children)
        : mkBlock('if', { condition, body: body.trim() })
    }
    return mkBlock('if', { condition })
  }

  // ── for loop (our pattern: for (let i = 0; i < N; i++)) ─────────────────
  if (/^for\s*\(/.test(s)) {
    const forM = s.match(/^for\s*\(\s*let\s+(\w+)\s*=\s*0;\s*\1\s*<\s*([^;]+);\s*\1\+\+\s*\)/)
    if (forM) {
      const parenOpen = s.indexOf('(')
      const parenClose = matchParen(s, parenOpen)
      const braceOpen = s.indexOf('{', parenClose)
      if (braceOpen !== -1) {
        const braceClose = matchBrace(s, braceOpen)
        const body = s.slice(braceOpen + 1, braceClose)
        const children = parseJsToBlocks(body)
        return children.length
          ? mkBlock('loop', { iterator: forM[1], count: forM[2].trim() }, children)
          : mkBlock('loop', { iterator: forM[1], count: forM[2].trim(), body: body.trim() })
      }
    }
  }

  // ── return ────────────────────────────────────────────────────────────────
  if (s.startsWith('return ') || s === 'return') {
    return mkBlock('return', { expression: s.slice(7).trim() })
  }

  // ── assignment ───────────────────────────────────────────────────────────
  if (!/^(?:const|let|var)\b/.test(s)) {
    const assignM = s.match(/^([\w$][\w$.[\]]*)\s*=\s*([\s\S]+)/)
    if (assignM && !assignM[1].includes('(')) {
      return mkBlock('assign', { target: assignM[1], value: assignM[2].trim() })
    }
  }

  // ── Fallback: expression/call ─────────────────────────────────────────────
  return mkBlock('call', { expression: s })
}
