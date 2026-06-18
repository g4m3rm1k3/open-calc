import { useState, useCallback, useEffect, useRef } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { buildProgramModel } from './parser/jsParser.js'
import { run as runInterpreter } from './interpreter/interpreter.js'
import { runPython } from './interpreter/pythonTracer.js'
import { runNative } from './interpreter/nativeTracer.js'
import { EXPLAIN, CONCEPT_GLOSSARY } from './eventStream.js'
import { buildHeapSnapshot } from './renderer/heapSnapshot.js'
import HeapGraph from './renderer/HeapGraph.jsx'
import CallGraphView from './renderer/CallGraphView.jsx'
import VariableWatch from './renderer/VariableWatch.jsx'
import CallTreeView from './renderer/CallTreeView.jsx'
import StackDepthMeter from './renderer/StackDepthMeter.jsx'
import WatchWindow from './renderer/WatchWindow.jsx'
import { SNIPPET_CATEGORIES } from './snippets.js'
import { setupOpenCalcMonaco } from '../../../utils/monacoThemes.js'
import {
  ChevronRight, ChevronDown, Code2, Boxes, Braces, ArrowLeft,
  Zap, Play, Pause, StepForward, StepBack, SkipForward, Terminal,
  Palette, Info, Network, Layers, GitBranch, Maximize2, X, Eye,
} from 'lucide-react'

// ── TypeScript → JS type stripper ─────────────────────────────────────────────
// Best-effort for educational code: removes type annotations so the JS
// interpreter can run the logic. Not a full transpiler.
function stripTypeScript(src) {
  let s = src

  // interface Foo { ... } (handles nested braces via iteration)
  s = s.replace(/(?:export\s+)?interface\s+\w+(?:\s+extends\s+[^{]+)?\s*\{[^}]*\}/g, '')

  // type Foo = ...; or type Foo = { ... } (with or without trailing semicolon)
  s = s.replace(/(?:export\s+)?type\s+[\w<>, ]+\s*=\s*(?:\{[^}]*\}|[^\n;]+)[;\n]?/g, '')

  // enum Foo { A, B, C } → const Foo = { A: 0, B: 1, ... }
  s = s.replace(/(?:export\s+)?enum\s+(\w+)\s*\{([^}]*)\}/g, (_, name, body) => {
    const members = body.split(',').map(m => m.trim().split('=')[0].trim()).filter(Boolean)
    return `const ${name} = {\n${members.map((m, i) => `  ${m}: ${i}`).join(',\n')}\n}`
  })

  // Access modifiers in class constructors/fields
  s = s.replace(/\b(public|private|protected|readonly|abstract|override)\s+/g, '')

  // implements clause
  s = s.replace(/\s+implements\s+[\w, .]+(?=\s*\{)/g, '')

  // Generic type parameters on functions/classes: <T>, <T extends X>, <K, V>
  s = s.replace(/<[A-Z][A-Za-z0-9_$,\s extends=|&\[\]]*>/g, '')

  // Return type annotations: ): Type {  or  ): Type;
  s = s.replace(/\)\s*:\s*[\w.<>|&\[\] ]+(?=\s*[\{;,])/g, ')')

  // Variable/param type annotations: x: Type — only when annotation looks like a TS type
  // (uppercase class name or known primitive keyword), to avoid stripping object property values like x: 3
  s = s.replace(
    /(\w)\s*\??\s*:\s*(?=[A-Z]|string\b|number\b|boolean\b|void\b|any\b|never\b|unknown\b|null\b|undefined\b|object\b)[\w.<>|&\[\] ]+(?=\s*[,)=;!?\n])/g,
    '$1'
  )

  // `as Type` casts
  s = s.replace(/\s+as\s+[\w.<>|&\[\] ]+/g, '')

  // Leftover stray colons from partial stripping (e.g. `: {`)  — leave alone
  return s
}

const SPEED_CONFIG = {
  '0.5x': { interval: 1200, steps: 1 },
  '1x':   { interval: 600,  steps: 1 },
  '2x':   { interval: 250,  steps: 1 },
  '5x':   { interval: 100,  steps: 1 },
  '10x':  { interval: 60,   steps: 2 },
}

// ── Theme config ──────────────────────────────────────────────────────────────

const THEMES = [
  { id: 'monokai',        label: 'Monokai',      monaco: 'monokai' },
  { id: 'open-calc-dark', label: 'UpSkillOS',    monaco: 'open-calc-dark' },
  { id: 'dracula',        label: 'Dracula',      monaco: 'dracula' },
  { id: 'nord-dark',      label: 'Nord',         monaco: 'nord-dark' },
  { id: 'tokyo-night',    label: 'Tokyo Night',  monaco: 'tokyo-night' },
  { id: 'one-dark',       label: 'One Dark',     monaco: 'one-dark' },
]

const STARTER_TS = `interface Animal {
  name: string
  sound(): string
}

type Point = { x: number; y: number }

enum Direction { Up, Down, Left, Right }

class Dog implements Animal {
  constructor(public name: string) {}

  sound(): string {
    return 'woof'
  }

  fetch(item: string): string {
    return \`\${this.name} fetches \${item}!\`
  }
}

function greet(animal: Animal): string {
  return \`\${animal.name} says \${animal.sound()}\`
}

const dog = new Dog('Rex')
console.log(greet(dog))
console.log(dog.fetch('ball'))

const pos: Point = { x: 3, y: 4 }
const dir: Direction = Direction.Up
console.log('Position:', pos.x, pos.y)
console.log('Direction:', dir)
`

const STARTER_PY = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop()

    def size(self):
        return len(self.items)


print('fib(6):', fibonacci(6))

s = Stack()
s.push(10)
s.push(20)
s.push(30)
print('Stack size:', s.size())
print('Popped:', s.pop())
`

const STARTER_GO = `package main

import "fmt"

func fibonacci(n int) int {
\tif n <= 1 {
\t\treturn n
\t}
\treturn fibonacci(n-1) + fibonacci(n-2)
}

func main() {
\tnums := []int{1, 2, 3, 4, 5}
\tsum := 0
\tfor _, n := range nums {
\t\tsum += n
\t}
\tfmt.Println("Sum:", sum)
\tfmt.Println("fib(6):", fibonacci(6))
}
`

const STARTER = `function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  push(value) {
    const node = new Node(value)
    node.next = this.head
    this.head = node
    this.size++
  }
}

console.log('fib(10):', fibonacci(10))

const list = new LinkedList()
list.push(1)
list.push(2)
list.push(3)
console.log('List size:', list.size)

const nums = [3, 1, 4, 1, 5, 9, 2, 6]
const result = nums.filter(x => x > 3).map(x => x * 2)
console.log('Result:', result)
`

// ── Helpers ───────────────────────────────────────────────────────────────────

function Panel({ title, icon: Icon, children, badge, style, accent = '#1e293b' }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0,
      borderTop: `2px solid ${accent}`,
      ...style,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderBottom: '1px solid #1e293b',
        background: '#0a0f1e', flexShrink: 0,
      }}>
        {Icon && <Icon size={13} color="#818cf8" />}
        <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', letterSpacing: '.02em' }}>{title}</span>
        {badge != null && (
          <span style={{
            marginLeft: 'auto', fontSize: 10,
            background: '#1e293b', color: '#7dd3fc',
            padding: '1px 6px', borderRadius: 99,
          }}>{badge}</span>
        )}
      </div>
      <div style={{ overflow: 'auto', flex: 1, padding: 10 }}>
        {children}
      </div>
    </div>
  )
}

function Btn({ onClick, disabled, title, children, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: active ? '#312e81' : '#1e293b',
        border: `1px solid ${active ? '#6366f1' : '#334155'}`,
        color: disabled ? '#475569' : active ? '#a5b4fc' : '#cbd5e1',
        borderRadius: 6, padding: '4px 10px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 12, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}

function PrimaryRunBtn({ onClick, disabled, children }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      disabled={disabled}
      title="Run code (⌘↵)"
      style={{
        background: disabled ? '#1e293b' : 'linear-gradient(135deg, #4f46e5, #9333ea)',
        border: `1px solid ${disabled ? '#334155' : 'transparent'}`,
        color: disabled ? '#475569' : '#ffffff',
        boxShadow: disabled ? 'none' : (hover ? '0 0 15px rgba(147, 51, 234, 0.6)' : '0 0 8px rgba(79, 70, 229, 0.4)'),
        borderRadius: 6, padding: '5px 14px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 6,
        transform: hover && !disabled ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.15s ease-out',
        textShadow: disabled ? 'none' : '0 1px 2px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </button>
  )
}

function ComplexityBadge({ complexity }) {
  const color =
    complexity === 'O(1)'           ? '#86efac' :
    complexity?.includes('log')     ? '#7dd3fc' :
    complexity === 'O(n)'           ? '#fbbf24' :
    complexity?.includes('recursive') ? '#fb923c' :
    '#f87171'
  return (
    <span style={{
      fontSize: 10, padding: '1px 7px', borderRadius: 99,
      background: `${color}18`, color, border: `1px solid ${color}44`,
      fontFamily: 'JetBrains Mono, monospace',
    }}>{complexity}</span>
  )
}

const TOKEN_COLORS = {
  keyword: '#818cf8', name: '#7dd3fc', num: '#86efac',
  string: '#fbbf24', punctuation: '#94a3b8',
}
function tokenColor(type) {
  for (const [k, v] of Object.entries(TOKEN_COLORS)) if (type.includes(k)) return v
  return '#cbd5e1'
}

// ── Concept badge with glossary popover ───────────────────────────────────────

function ConceptBadge({ concept, style: extraStyle }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const entry = CONCEPT_GLOSSARY[concept]

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!concept) return null

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onClick={() => setOpen(o => !o)}
        title={entry ? 'Click to learn more' : undefined}
        style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 99,
          background: '#1e1b4b', color: open ? '#a5b4fc' : '#6366f1',
          border: `1px solid ${open ? '#6366f1' : '#6366f133'}`,
          fontFamily: 'JetBrains Mono, monospace',
          cursor: entry ? 'pointer' : 'default',
          userSelect: 'none',
          transition: 'all 0.1s',
          ...extraStyle,
        }}
      >
        {entry ? '✦ ' : ''}{concept}
      </span>

      {open && entry && (
        <div style={{
          position: 'fixed',
          zIndex: 9999,
          transform: 'translateX(-50%)',
          left: ref.current ? ref.current.getBoundingClientRect().left + ref.current.offsetWidth / 2 : 0,
          top: ref.current ? ref.current.getBoundingClientRect().bottom + 8 : 0,
          background: '#0d1526',
          border: '1px solid #6366f144',
          borderRadius: 12,
          padding: '14px 16px',
          maxWidth: 320,
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          pointerEvents: 'auto',
        }}>
          {/* Glow strip */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, #6366f1, #818cf8, transparent)',
            borderRadius: '12px 12px 0 0',
          }} />

          <div style={{ fontSize: 10, color: '#6366f1', fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700, letterSpacing: '.06em', marginBottom: 6 }}>
            {concept.toUpperCase()}
          </div>

          {/* TL;DR */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.5, marginBottom: 8 }}>
            {entry.tldr}
          </div>

          {/* Detail */}
          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.65, marginBottom: entry.analogy ? 8 : 0 }}>
            {entry.detail}
          </div>

          {/* Analogy */}
          {entry.analogy && (
            <div style={{
              borderLeft: '2px solid #f59e0b', paddingLeft: 8,
              fontSize: 11, color: '#78716c', lineHeight: 1.6, marginBottom: 6,
              fontStyle: 'italic',
            }}>
              {entry.analogy}
            </div>
          )}

          {/* SICP ref */}
          {entry.sicp && (
            <div style={{ fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
              ↗ {entry.sicp}
            </div>
          )}
        </div>
      )}
    </span>
  )
}

// ── Narration bar ─────────────────────────────────────────────────────────────
// Synthesises the current event into a plain-English tutor sentence.

function buildNarration(event, prevEvent) {
  if (!event) return null
  const t  = event.type
  const pt = prevEvent?.type

  if (t === 'function_call') {
    const argc = event.args?.length ?? 0
    const argPart = argc === 0 ? '' : ` with ${event.args?.map(a => JSON.stringify(a)).join(', ')}`
    const wasReturn = pt === 'function_return'
    return wasReturn
      ? `\`${prevEvent.functionName}\` just returned — now calling \`${event.functionName}\`${argPart}. A new stack frame is being pushed.`
      : `Calling \`${event.functionName}\`${argPart}. The engine pushes a new frame onto the call stack — watch the stack depth increase.`
  }

  if (t === 'function_return') {
    const retStr = JSON.stringify(event.returnValue)
    const isBase = event.args?.length === 1 && (event.returnValue === event.args?.[0])
    return isBase
      ? `\`${event.functionName}\` hits its base case and returns ${retStr}. This frame is popped — the result travels back up the call stack.`
      : `\`${event.functionName}\` is done and returns ${retStr}. Its frame is destroyed and execution resumes at the call site.`
  }

  if (t === 'variable_declare') {
    return `\`${event.name}\` is declared and set to ${JSON.stringify(event.value)}. This binding lives in the current scope frame until the block closes.`
  }

  if (t === 'variable_assign') {
    return `\`${event.name}\` just changed: ${JSON.stringify(event.oldValue)} → ${JSON.stringify(event.newValue)}. JavaScript found the binding in the scope chain and updated it there.`
  }

  if (t === 'conditional_branch') {
    const taken = event.branch === 'then' ? 'if' : 'else'
    return `The condition \`${event.condition}\` evaluated to ${event.result}. The ${taken} branch runs — the other branch is skipped entirely.`
  }

  if (t === 'loop_iteration') {
    return `Iteration ${event.iteration} of the ${event.loopType} loop. The condition was re-evaluated and was truthy. Each iteration here adds to the total work done.`
  }

  if (t === 'object_create') {
    return `A new ${event.objectType} was created on the heap (id #${event.objectId}). Variables that reference it hold an arrow to this object — not a copy.`
  }

  if (t === 'object_mutate') {
    return `Heap object #${event.objectId} was mutated: \`.${event.property}\` changed. Every variable pointing to this object sees the update immediately.`
  }

  if (t === 'program_start') {
    return 'The program starts. The global scope is set up and `var` declarations are hoisted. Step forward to trace execution line by line.'
  }

  if (t === 'program_end') {
    return event.error
      ? `Program ended with an uncaught ${event.error.type}. The error propagated all the way up the call stack without being caught.`
      : 'All code has finished executing. Step back to review any moment in the trace.'
  }

  return null
}

function NarrationBar({ event, prevEvent }) {
  const text = buildNarration(event, prevEvent)

  // Always render the bar so it occupies space at the bottom.
  // When there is no text, show a dim placeholder so the layout is stable.
  return (
    <div style={{
      padding: '8px 14px',
      background: 'linear-gradient(90deg, #080c14, #060a12)',
      borderTop: '1px solid #1e293b',
      fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
      flexShrink: 0, minHeight: 36,
      display: 'flex', alignItems: 'flex-start', gap: 8,
    }}>
      <span style={{
        fontSize: 10, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
        background: text ? '#1e1b4b' : '#0f172a',
        color: text ? '#818cf8' : '#334155',
        fontFamily: 'JetBrains Mono, monospace', marginTop: 1,
        transition: 'background 0.2s, color 0.2s',
      }}>tutor</span>
      <span style={{ flex: 1, color: text ? '#94a3b8' : '#334155',
        transition: 'color 0.2s', fontStyle: text ? 'normal' : 'italic' }}>
        {text
          ? text.split(/(`[^`\n]+`)/g).map((part, i) =>
              part.startsWith('`') && part.endsWith('`') ? (
                <code key={i} style={{
                  background: '#1e293b', color: '#7dd3fc',
                  padding: '1px 5px', borderRadius: 3,
                  fontSize: '0.9em', fontFamily: 'JetBrains Mono, monospace',
                }}>{part.slice(1, -1)}</code>
              ) : part
            )
          : 'Step through your code to see explanations here.'
        }
      </span>
    </div>
  )
}



// ── AST viewer ────────────────────────────────────────────────────────────────

function ASTNode({ node, depth = 0, startOpen = false, interactive = false }) {
  const [open, setOpen] = useState(startOpen || depth < 2)
  const [hover, setHover] = useState(false)
  if (!node || typeof node !== 'object') return null
  
  const children = Object.entries(node).filter(([k, v]) => {
    if (['type','start','end','loc','sourceType'].includes(k)) return false
    if (Array.isArray(v)) return v.some(c => c && typeof c.type === 'string')
    return v && typeof v.type === 'string'
  })
  
  const label = [
    node.type,
    node.name ? ` ${node.name}` : '',
    node.id?.name ? ` ${node.id.name}` : '',
    node.operator ? ` ${node.operator}` : '',
    node.kind ? ` (${node.kind})` : '',
    node.raw != null ? ` = ${node.raw}` : '',
  ].join('')
  
  const hasChildren = children.length > 0
  
  // A tiny glossary mapping common node types to plain English for the hover tooltip
  const NODE_GLOSSARY = {
    Identifier: "A named reference (variable, property, or function name).",
    CallExpression: "A function being invoked.",
    BinaryExpression: "Two values combined with an operator (like + or ===).",
    Literal: "A hardcoded value (string, number, boolean).",
    BlockStatement: "A block of code wrapped in { } braces.",
    FunctionDeclaration: "Defining a new named function.",
    VariableDeclaration: "Declaring one or more variables using let, const, or var.",
    ExpressionStatement: "A statement consisting of a single expression (like a function call on its own line).",
    ReturnStatement: "Exiting a function and returning a value to the caller.",
    IfStatement: "Conditional branch control flow.",
    MemberExpression: "Accessing a property on an object (like console.log)."
  }

  return (
    <div style={{ marginLeft: depth * 14, fontFamily: 'JetBrains Mono, monospace', fontSize: interactive ? 12 : 11 }}>
      <div
        onClick={() => hasChildren && setOpen(o => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          cursor: hasChildren ? 'pointer' : 'default',
          padding: '2px 4px', borderRadius: 4,
          background: hover && interactive ? 'rgba(255,255,255,0.05)' : 'transparent',
          color: depth === 0 ? '#818cf8' : depth === 1 ? '#7dd3fc' : depth === 2 ? '#86efac' : '#e2e8f0',
          position: 'relative',
        }}
      >
        {hasChildren ? (open ? <ChevronDown size={10} /> : <ChevronRight size={10} />) : <span style={{ width: 10 }} />}
        <span>{label}</span>

        {/* Hover Tooltip (only when interactive) */}
        {hover && interactive && NODE_GLOSSARY[node.type] && (
          <div style={{
            position: 'absolute', left: '100%', top: '50%', transform: 'translate(10px, -50%)',
            background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0',
            padding: '4px 8px', borderRadius: 4, fontSize: 10, whiteSpace: 'nowrap',
            zIndex: 10, pointerEvents: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: '4px solid #1e293b', position: 'absolute', left: -4 }} />
            <span style={{ color: '#818cf8', fontWeight: 600 }}>{node.type}</span>
            <span style={{ color: '#94a3b8' }}>{NODE_GLOSSARY[node.type]}</span>
          </div>
        )}
      </div>

      {open && hasChildren && children.map(([key, val]) => {
        const items = Array.isArray(val) ? val.filter(c => c?.type) : [val]
        return (
          <div key={key}>
            <div style={{ marginLeft: (depth+1)*14+13, fontSize: interactive ? 11 : 10, color: '#475569', padding: '2px 0' }}>{key}</div>
            {items.map((child, i) => <ASTNode key={i} node={child} depth={depth + 2} startOpen={startOpen} interactive={interactive} />)}
          </div>
        )
      })}
    </div>
  )
}

// ── Event explanation card ────────────────────────────────────────────────────

function EventCard({ event, active }) {
  const explain = EXPLAIN[event.type]?.(event) ?? { summary: event.type, why: '', concept: '' }
  return (
    <div style={{
      padding: '7px 10px', borderRadius: 7, marginBottom: 4,
      background: active ? '#1e1b4b' : '#0f172a',
      border: `1px solid ${active ? '#4338ca' : '#1e293b'}`,
      cursor: 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: explain.why ? 4 : 0 }}>
        <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 99,
          background: '#1e293b', color: '#818cf8',
          fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
        }}>{event.type}</span>
        {event.sourceLocation?.line && (
          <span style={{ fontSize: 10, color: '#475569' }}>L{event.sourceLocation.line}</span>
        )}
        {explain.concept && (
          <span style={{ marginLeft: 'auto' }}>
            <ConceptBadge concept={explain.concept} />
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', marginBottom: explain.why ? 3 : 0 }}>
        {explain.summary}
      </div>
      {explain.why && (
        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
          {explain.why}
        </div>
      )}
    </div>
  )
}

// ── Stack frame display ───────────────────────────────────────────────────────

function StackFrame({ frame, depth }) {
  const [open, setOpen] = useState(depth === 0)
  const locals = Object.entries(frame.locals ?? {})
  return (
    <div style={{
      marginBottom: 4, borderRadius: 6, overflow: 'hidden',
      border: `1px solid ${depth === 0 ? '#4338ca' : '#1e293b'}`,
    }}>
      <div
        onClick={() => locals.length > 0 && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 8px',
          background: depth === 0 ? '#1e1b4b' : '#0f172a',
          cursor: locals.length > 0 ? 'pointer' : 'default',
        }}
      >
        {locals.length > 0 ? (open ? <ChevronDown size={11} /> : <ChevronRight size={11} />) : <span style={{ width: 11 }} />}
        <span style={{ fontSize: 12, color: '#a5b4fc', fontFamily: 'JetBrains Mono, monospace' }}>
          {frame.name}
        </span>
        {frame.line && <span style={{ fontSize: 10, color: '#475569' }}>L{frame.line}</span>}
        {depth === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6366f1' }}>← current</span>}
      </div>
      {open && locals.length > 0 && (
        <div style={{ padding: '5px 8px', background: '#080c14' }}>
          {locals.map(([name, value]) => (
            <div key={name} style={{
              display: 'flex', gap: 8, fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace', marginBottom: 2,
            }}>
              <span style={{ color: '#7dd3fc', minWidth: 80 }}>{name}</span>
              <span style={{ color: '#86efac' }}>{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CodeLens({ onBack, initialCode, initialLang, backLabel }) {
  const [lang, setLang]             = useState(() => {
    if (initialLang === 'ts') return 'ts'
    if (initialLang === 'py') return 'py'
    if (initialLang === 'go') return 'go'
    return 'js'
  })
  const [source, setSource]         = useState(() => {
    if (initialCode) return initialCode
    if (initialLang === 'ts') return STARTER_TS
    if (initialLang === 'py') return STARTER_PY
    if (initialLang === 'go') return STARTER_GO
    return STARTER
  })
  const [model, setModel]           = useState(null)
  const [execution, setExecution]   = useState(null)
  const [step, setStep]             = useState(0)
  const [running, setRunning]       = useState(false)
  const [tab, setTab]               = useState('structure')
  const [rightTab, setRightTab]     = useState('execution')
  const [theme, setTheme]           = useState('open-calc-dark')
  const [showThemes, setShowThemes] = useState(false)
  const [rightMode, setRightMode]   = useState('explain')  // 'explain' | 'analyse'
  const [showWatch, setShowWatch]   = useState(false)
  const [playing, setPlaying]       = useState(false)
  const [playSpeed, setPlaySpeed]   = useState('1x')
  const [fnModal, setFnModal]       = useState(null)
  const [editorW, setEditorW]       = useState(null)  // null = auto flex-grow
  const [breakpoints, setBreakpoints] = useState(() => new Set())
  const eventListRef                = useRef(null)
  const editorRef                   = useRef(null)
  const decorRef                    = useRef([])
  const bpDecorRef                  = useRef([])
  const shadowDecorRef              = useRef([])
  const editorColRef                = useRef(null)
  const monaco                      = useMonaco()

  const totalSteps   = execution?.events?.length ?? 0
  const currentEvent = execution?.events?.[step]      ?? null
  const prevEvent    = execution?.events?.[step - 1]  ?? null

  // Parse live as we type (JS + TS; not Python)
  useEffect(() => { if (lang !== 'py') setModel(buildProgramModel(source)) }, [])
  useEffect(() => {
    if (lang === 'py') { setModel(null); return }
    const id = setTimeout(() => setModel(buildProgramModel(source)), 400)
    return () => clearTimeout(id)
  }, [source, lang])

  // Source line highlighting — update Monaco decoration on every step
  useEffect(() => {
    const ed = editorRef.current
    if (!ed || !monaco) return
    const line = currentEvent?.sourceLocation?.line
    if (!line) {
      decorRef.current = ed.deltaDecorations(decorRef.current, [])
      return
    }
    const explain = EXPLAIN[currentEvent?.type]?.(currentEvent)
    const hintText = explain?.summary ? '   ⟵ ' + explain.summary.slice(0, 72) : ''
    decorRef.current = ed.deltaDecorations(decorRef.current, [{
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'cl-exec-line',
        overviewRulerColor: '#6366f1',
        ...(hintText ? {
          after: {
            content: hintText,
            inlineClassName: 'cl-inline-hint',
          }
        } : {}),
      }
    }])
    ed.revealLineInCenterIfOutsideViewport(line)
  })

  // Auto-play
  useEffect(() => {
    if (!playing || !execution) return
    const { interval, steps } = SPEED_CONFIG[playSpeed] ?? SPEED_CONFIG['1x']
    const id = setInterval(() => {
      setStep(s => {
        const next = s + steps
        if (next >= totalSteps - 1) { setPlaying(false); return totalSteps - 1 }
        return next
      })
    }, interval)
    return () => clearInterval(id)
  }, [playing, playSpeed, execution, totalSteps])

  // Breakpoint gutter decorations
  useEffect(() => {
    const ed = editorRef.current
    if (!ed || !monaco) return
    bpDecorRef.current = ed.deltaDecorations(bpDecorRef.current,
      [...breakpoints].map(line => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'cl-bp-line',
          glyphMarginClassName: 'cl-bp-glyph',
          overviewRulerColor: '#ef4444cc',
          overviewRulerLane: 4,
        }
      }))
    )
  }, [breakpoints, monaco])

  // Code shadow — faint tint on previously-visited lines
  useEffect(() => {
    const ed = editorRef.current
    if (!ed || !monaco || !execution) {
      if (ed && monaco) shadowDecorRef.current = ed.deltaDecorations(shadowDecorRef.current, [])
      return
    }
    const visited = new Set()
    for (let i = 0; i <= step; i++) {
      const ln = execution.events[i]?.sourceLocation?.line
      if (ln) visited.add(ln)
    }
    const currentLine = execution.events[step]?.sourceLocation?.line
    if (currentLine) visited.delete(currentLine)
    shadowDecorRef.current = ed.deltaDecorations(shadowDecorRef.current,
      [...visited].map(line => ({
        range: new monaco.Range(line, 1, line, 1),
        options: { isWholeLine: true, className: 'cl-shadow-line' }
      }))
    )
  }, [step, execution, monaco])

  // Auto-scroll event list to current step
  useEffect(() => {
    if (!eventListRef.current) return
    const active = eventListRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [step])

  const startEditorResize = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = editorColRef.current?.getBoundingClientRect().width ?? 400
    const onMove = (ev) => {
      const w = Math.max(160, Math.min(startW + (ev.clientX - startX), window.innerWidth - 700))
      setEditorW(w)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const handleRun = useCallback(async () => {
    setRunning(true)
    try {
      let result
      if (lang === 'py') {
        result = await runPython(source)
      } else if (lang === 'go') {
        result = await runNative(source, 'go')
      } else {
        const jsSource = lang === 'ts' ? stripTypeScript(source) : source
        result = await new Promise((resolve) => {
          setTimeout(() => resolve(runInterpreter(jsSource)), 0)
        })
      }
      setExecution(result)
      setStep(0)
      setPlaying(false)
      setRightTab('execution')
      setRightMode('explain')
    } finally {
      setRunning(false)
    }
  }, [source, lang])

  const handleContinue = useCallback(() => {
    if (!execution) return
    setPlaying(false)
    const events = execution.events
    for (let i = step + 1; i < events.length; i++) {
      const line = events[i]?.sourceLocation?.line
      if (line && breakpoints.has(line)) { setStep(i); return }
    }
    setStep(events.length - 1)
  }, [step, execution, breakpoints])

  const TABS = (lang === 'py' || lang === 'go')
    ? [{ id: 'structure', label: 'Structure', icon: Boxes }]
    : [
        { id: 'structure', label: 'Structure', icon: Boxes },
        { id: 'tokens',    label: 'Tokens',    icon: Zap },
        { id: 'ast',       label: 'AST',       icon: Braces },
      ]


  const heapSnapshot = (lang === 'js' && execution)
    ? buildHeapSnapshot(execution.events, step)
    : null

  const RTABS = [
    { id: 'execution', label: 'Events',    icon: Play },
    { id: 'variables', label: 'Variables', icon: Layers },
    { id: 'calltree',  label: 'Tree',      icon: GitBranch },
    ...(lang === 'js' ? [{ id: 'heap', label: 'Heap', icon: Network }] : []),
    { id: 'output',    label: 'Output',    icon: Terminal },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#080c14', color: '#e2e8f0',
    }}>
      <style>{`
        .cl-exec-line {
          background: rgba(99,102,241,0.14) !important;
          border-left: 3px solid #6366f1 !important;
        }
        .cl-inline-hint {
          color: #fbbf24 !important;
          opacity: 0.9 !important;
          font-style: italic !important;
          font-size: 11.5px !important;
          font-family: JetBrains Mono, monospace !important;
          letter-spacing: 0 !important;
          user-select: none !important;
          pointer-events: none !important;
        }
        .cl-shadow-line {
          background: rgba(99,102,241,0.05) !important;
        }
        .cl-bp-line {
          background: rgba(239,68,68,0.08) !important;
        }
        .cl-bp-glyph::after {
          content: '' !important;
          display: block !important;
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          background: radial-gradient(circle at 38% 38%, #f87171, #dc2626) !important;
          box-shadow: 0 0 5px #ef4444aa !important;
          margin: 3px auto !important;
        }
      `}</style>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', borderBottom: '1px solid #1e293b',
        background: '#0a0f1e', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#475569', display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 500,
        }}>
          <ArrowLeft size={14} />
          {backLabel || 'UpSkillOS'}
        </button>
        <Code2 size={17} color="#818cf8" />
        <span style={{ fontWeight: 700, fontSize: 14 }}>CodeLens</span>
        <span style={{ fontSize: 12, color: '#475569' }}>· Execution Visualizer</span>

        {/* Language toggle */}
        <div style={{ display: 'flex', gap: 2, background: '#0f172a',
          borderRadius: 6, padding: 2, border: '1px solid #1e293b' }}>
          {[
            { id: 'js',  label: 'JS' },
            { id: 'ts',  label: 'TS' },
            { id: 'py',  label: 'Python' },
            { id: 'go',  label: 'Go' },
          ].map(l => (
            <button key={l.id} onClick={() => {
              if (l.id === lang) return
              setLang(l.id)
              const starters = { py: STARTER_PY, ts: STARTER_TS, go: STARTER_GO }
              setSource(starters[l.id] ?? STARTER)
              setExecution(null)
              setStep(0)
              setModel(null)
              setBreakpoints(new Set())
            }} style={{
              padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
              fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
              background: lang === l.id ? '#312e81' : 'transparent',
              color:      lang === l.id ? '#a5b4fc'  : '#475569',
            }}>{l.label}</button>
          ))}
        </div>

        {/* Teaching Snippets */}
        <select
          style={{
            marginLeft: 12,
            background: '#0f172a',
            border: '1px solid #1e293b',
            color: '#cbd5e1',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer',
            outline: 'none',
          }}
          onChange={(e) => {
            if (!e.target.value) return
            const [catIdx, itemIdx] = e.target.value.split('-')
            const snippet = SNIPPET_CATEGORIES[catIdx].items[itemIdx]
            setLang('js')
            setSource(snippet.code)
            setExecution(null)
            setStep(0)
            setModel(null)
            e.target.value = ""
          }}
        >
          <option value="">📚 Load Example...</option>
          {SNIPPET_CATEGORIES.map((cat, i) => (
            <optgroup key={i} label={cat.group} style={{ color: '#818cf8', fontStyle: 'italic', background: '#0a0f1e' }}>
              {cat.items.map((s, j) => (
                <option key={j} value={`${i}-${j}`} style={{ color: '#cbd5e1', fontStyle: 'normal' }}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Watch window toggle */}
          <Btn
            onClick={() => setShowWatch(v => !v)}
            active={showWatch}
            title="Open floating watch window"
          >
            <Eye size={12} />
            Watch
          </Btn>

          {/* Theme picker */}
          <div style={{ position: 'relative' }}>
            <Btn onClick={() => setShowThemes(v => !v)} active={showThemes} title="Editor theme">
              <Palette size={12} />
              {THEMES.find(t => t.id === theme)?.label ?? 'Theme'}
            </Btn>
            {showThemes && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 100,
                background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                padding: 4, minWidth: 140,
              }}>
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => { setTheme(t.id); setShowThemes(false) }}
                    style={{
                      padding: '6px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12,
                      background: theme === t.id ? '#1e293b' : 'transparent',
                      color: theme === t.id ? '#a5b4fc' : '#cbd5e1',
                    }}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Run button */}
          <PrimaryRunBtn onClick={handleRun} disabled={running}>
            <Play size={14} fill="currentColor" />
            {running ? (lang === 'py' ? 'Loading Python…' : lang === 'go' ? 'Building Go…' : 'Running…') : 'Run'}
          </PrimaryRunBtn>
        </div>

        {model?.error && (
          <span style={{
            fontSize: 11, background: '#7f1d1d', color: '#fca5a5',
            padding: '2px 8px', borderRadius: 5,
          }}>
            L{model.error.line}: {model.error.message}
          </span>
        )}
      </div>

      {/* ── Video-style playback controls ── */}
      {execution && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderBottom: '1px solid #1e293b',
          background: '#080c14', flexShrink: 0, flexWrap: 'wrap',
        }}>
          {/* Step controls */}
          <Btn onClick={() => { setPlaying(false); setStep(0) }} disabled={step === 0} title="Jump to start">
            <SkipForward size={11} style={{ transform: 'scaleX(-1)' }} />
          </Btn>
          <Btn onClick={() => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }} disabled={step === 0} title="Step back">
            <StepBack size={11} /> Back
          </Btn>
          <Btn onClick={() => { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)) }} disabled={step >= totalSteps - 1} title="Step forward">
            <StepForward size={11} /> Step
          </Btn>
          <Btn onClick={() => { setPlaying(false); setStep(totalSteps - 1) }} disabled={step >= totalSteps - 1} title="Jump to end">
            <SkipForward size={11} />
          </Btn>

          {/* Continue to breakpoint */}
          {breakpoints.size > 0 && (
            <>
              <div style={{ width: 1, height: 16, background: '#1e293b', margin: '0 2px' }} />
              <Btn
                onClick={handleContinue}
                disabled={!execution || step >= totalSteps - 1}
                title="Continue to next breakpoint (F8)"
              >
                <span style={{ fontSize: 10 }}>⬤</span> Continue
              </Btn>
            </>
          )}

          {/* Play / pause */}
          <div style={{ width: 1, height: 16, background: '#1e293b', margin: '0 2px' }} />
          <Btn
            onClick={() => setPlaying(p => !p)}
            disabled={step >= totalSteps - 1 && !playing}
            active={playing}
            title={playing ? 'Pause' : 'Play through'}
          >
            {playing ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Play</>}
          </Btn>

          {/* Scrubber */}
          <input
            type="range" min={0} max={totalSteps - 1} value={step}
            onChange={e => { setPlaying(false); setStep(Number(e.target.value)) }}
            style={{ flex: 1, minWidth: 80, accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>
            {step + 1}/{totalSteps}
          </span>

          {/* Speed */}
          <div style={{ display: 'flex', gap: 2, borderLeft: '1px solid #1e293b', paddingLeft: 6 }}>
            {Object.keys(SPEED_CONFIG).map(sp => (
              <button key={sp} onClick={() => setPlaySpeed(sp)} style={{
                background: playSpeed === sp ? '#312e81' : 'transparent',
                border: `1px solid ${playSpeed === sp ? '#6366f1' : '#1e293b'}`,
                color: playSpeed === sp ? '#a5b4fc' : '#475569',
                borderRadius: 4, padding: '2px 5px', cursor: 'pointer',
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
              }}>{sp}</button>
            ))}
          </div>

          {execution.error && (
            <span style={{ fontSize: 10, color: '#f87171' }}>
              {execution.error.type}: {execution.error.message}
            </span>
          )}
        </div>
      )}

      {/* ── Stack depth meter ── */}
      {execution && (
        <StackDepthMeter
          events={execution.events}
          step={step}
          onSeek={(s) => { setPlaying(false); setStep(s) }}
        />
      )}

      {/* ── Body ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'stretch',
        gap: 0, padding: 10, minHeight: 0, overflow: 'hidden',
      }}>
        {/* Left: editor — flex-grow unless manually resized */}
        <div
          ref={editorColRef}
          style={{
            flex: editorW ? `0 0 ${editorW}px` : '1 1 0',
            minWidth: 160, display: 'flex', flexDirection: 'column', minHeight: 0,
          }}
        >
          <div style={{
            flex: 1, background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 10, overflow: 'hidden', minHeight: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderBottom: '1px solid #1e293b',
              background: '#0a0f1e',
            }}>
              <Code2 size={13} color="#818cf8" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>Source</span>
              <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>JavaScript</span>
            </div>
            <div style={{ height: 'calc(100% - 33px)' }}>
              <Editor
                height="100%"
                language={lang === 'py' ? 'python' : lang === 'ts' ? 'typescript' : lang === 'go' ? 'go' : 'javascript'}
                value={source}
                onChange={v => setSource(v ?? '')}
                theme={THEMES.find(t => t.id === theme)?.monaco ?? 'monokai'}
                beforeMount={setupOpenCalcMonaco}
                onMount={(ed, mo) => {
                  editorRef.current = ed
                  ed.onMouseDown((e) => {
                    const T = mo.editor.MouseTargetType
                    if (
                      e.target.type === T.GUTTER_LINE_NUMBERS ||
                      e.target.type === T.GUTTER_GLYPH_MARGIN
                    ) {
                      const line = e.target.position?.lineNumber
                      if (!line) return
                      setBreakpoints(prev => {
                        const next = new Set(prev)
                        if (next.has(line)) next.delete(line)
                        else next.add(line)
                        return next
                      })
                    }
                  })
                }}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  glyphMargin: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 10 },
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Drag handle ── */}
        <div
          onMouseDown={startEditorResize}
          title="Drag to resize editor"
          style={{
            width: 9, flexShrink: 0, cursor: 'col-resize', alignSelf: 'stretch',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 2px',
          }}
        >
          <div style={{
            width: 2, height: 36, borderRadius: 1,
            background: '#1e293b', pointerEvents: 'none',
          }} />
        </div>

        {/* Middle: event stream */}
        <div style={{ flex: editorW ? '1 1 320px' : '0 0 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
          <div style={{
            display: 'flex', gap: 4, background: '#0f172a',
            borderRadius: 7, padding: 3, border: '1px solid #1e293b', flexShrink: 0,
          }}>
            {RTABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setRightTab(id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '4px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                background: rightTab === id ? '#1e293b' : 'transparent',
                color: rightTab === id ? '#818cf8' : '#64748b',
              }}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: (rightTab === 'heap' || rightTab === 'variables' || rightTab === 'scope' || rightTab === 'calltree') ? 'hidden' : 'auto' }} ref={eventListRef}>
            {rightTab === 'execution' && (
              execution ? (
                execution.events.length === 0
                  ? <span style={{ color: '#475569', fontSize: 12 }}>No events.</span>
                  : execution.events.map((evt, i) => (
                      <div
                        key={i}
                        data-active={i === step ? 'true' : 'false'}
                        onClick={() => setStep(i)}
                        style={{ opacity: i > step ? 0.35 : 1, cursor: 'pointer' }}
                      >
                        <EventCard event={evt} active={i === step} />
                      </div>
                    ))
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100%', gap: 10,
                }}>
                  <Play size={28} color="#4338ca" />
                  <span style={{ fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                    Press Run to execute the code<br />and see the event stream here.
                  </span>
                </div>
              )
            )}
            {rightTab === 'variables' && (
              <VariableWatch
                currentEvent={currentEvent}
                prevEvent={prevEvent}
                heapSnapshot={heapSnapshot}
                heapDelta={currentEvent?.heapDelta}
                events={execution?.events}
                step={step}
                onSeek={(s) => { setPlaying(false); setStep(s) }}
                onShowEnvModel={() => setRightTab('scope')}
              />
            )}
            {rightTab === 'scope' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <button
                  onClick={() => setRightTab('variables')}
                  style={{ background: 'none', border: 'none', borderBottom: '1px solid #1e293b',
                    cursor: 'pointer', padding: '6px 10px', textAlign: 'left',
                    color: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0 }}
                >
                  ← Back to Variables
                </button>
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <ScopeChainView event={currentEvent} />
                </div>
              </div>
            )}
            {rightTab === 'calltree' && (
              <CallTreeView
                events={execution?.events ?? []}
                step={step}
                onSeek={(s) => { setPlaying(false); setStep(s) }}
              />
            )}
            {rightTab === 'heap' && (
              <HeapPanel snapshot={heapSnapshot} heapDelta={currentEvent?.heapDelta} />
            )}
            {rightTab === 'output' && (
              execution?.output?.length > 0 ? (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                  {execution.output.map((line, i) => (
                    <div key={i} style={{
                      padding: '3px 8px', borderRadius: 4, marginBottom: 2,
                      background: line.startsWith('[error]') ? '#7f1d1d22'
                        : line.startsWith('[warn]') ? '#78350f22' : '#0f172a',
                      color: line.startsWith('[error]') ? '#fca5a5'
                        : line.startsWith('[warn]') ? '#fcd34d' : '#86efac',
                    }}>
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#475569', fontSize: 12 }}>
                  {execution ? 'No output.' : 'Run code first.'}
                </span>
              )
            )}
          </div>
        </div>

        {/* Right: Analyse / Explain toggle */}
        <div style={{ width: 320, flexShrink: 0, marginLeft: 10, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', gap: 4, background: '#0f172a',
            borderRadius: 7, padding: 3, border: '1px solid #1e293b', flexShrink: 0,
          }}>
            {[
              { id: 'analyse', label: 'Analyse', icon: Boxes },
              { id: 'explain', label: 'Explain', icon: Info },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setRightMode(id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '5px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                background: rightMode === id ? '#1e293b' : 'transparent',
                color: rightMode === id ? '#818cf8' : '#64748b',
              }}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          {/* Analyse mode: Structure / Tokens / AST */}
          {rightMode === 'analyse' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
              <div style={{
                display: 'flex', gap: 3, background: '#0f172a',
                borderRadius: 6, padding: 3, border: '1px solid #1e293b', flexShrink: 0,
              }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontSize: 10, fontWeight: 600,
                    background: tab === id ? '#1e293b' : 'transparent',
                    color: tab === id ? '#818cf8' : '#64748b',
                  }}>
                    <Icon size={11} />{label}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {tab === 'structure' && (lang === 'py'
                  ? <PyStructureView source={source} execution={execution} />
                  : <StructureView model={model} currentEvent={currentEvent} onNodeClick={node => setFnModal({ node, callGraph: model.callGraph })} />
                )}
                {tab === 'tokens'    && <TokensView model={model} source={source} />}
                {tab === 'ast'       && <AstView model={model} />}
              </div>
            </div>
          )}

          {/* Explain mode: hero + heap changes + call stack */}
          {rightMode === 'explain' && (
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentEvent
                ? <ExplainHero event={currentEvent} step={step} total={totalSteps} />
                : <IdleHero />
              }
              {currentEvent?.heapDelta?.length > 0 && (
                <Panel title="Heap Changes" icon={Boxes} badge={currentEvent.heapDelta.length}>
                  {currentEvent.heapDelta.map((d, i) => (
                    <div key={i} style={{
                      padding: '5px 8px', borderRadius: 6, marginBottom: 4,
                      background: d.op === 'create' ? '#14532d22' : '#78350f22',
                      border: `1px solid ${d.op === 'create' ? '#14532d' : '#78350f'}`,
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                    }}>
                      <span style={{ color: d.op === 'create' ? '#86efac' : '#fcd34d' }}>
                        {d.op === 'create' ? `+ ${d.objectType} #${d.objectId}` : `~ #${d.objectId}.${d.property}`}
                      </span>
                      {d.op === 'mutate' && (
                        <span style={{ color: '#94a3b8' }}>
                          {' '}{JSON.stringify(d.oldValue)} → {JSON.stringify(d.newValue)}
                        </span>
                      )}
                    </div>
                  ))}
                </Panel>
              )}
              {currentEvent && (
                <Panel title="Call Stack" icon={Code2} badge={currentEvent.stackSnapshot?.length ?? 0}>
                  {currentEvent.stackSnapshot?.length > 0 ? (
                    [...currentEvent.stackSnapshot].reverse().map((frame, i) => (
                      <StackFrame key={i} frame={frame} depth={currentEvent.stackSnapshot.length - 1 - i} />
                    ))
                  ) : (
                    <span style={{ color: '#475569', fontSize: 12 }}>Global scope</span>
                  )}
                </Panel>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Function detail modal ── */}
      {fnModal && (
        <FunctionModal
          node={fnModal.node}
          callGraph={fnModal.callGraph}
          onClose={() => setFnModal(null)}
        />
      )}

      {/* ── Tutor narration bar — pinned at bottom ── */}
      {execution && (
        <NarrationBar event={currentEvent} prevEvent={prevEvent} />
      )}

      {/* ── Floating watch window ── */}
      {showWatch && (
        <WatchWindow
          snapshot={heapSnapshot}
          currentEvent={currentEvent}
          onClose={() => setShowWatch(false)}
        />
      )}
    </div>
  )
}

// ── Inline code renderer ─────────────────────────────────────────────────────
// Converts `backtick-wrapped` segments in explanation strings to styled <code>.

function InlineText({ text }) {
  if (!text) return null
  const parts = String(text).split(/(`[^`\n]+`)/)
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i} style={{
        background: '#1e293b', color: '#7dd3fc',
        padding: '1px 5px', borderRadius: 3,
        fontSize: '0.88em', fontFamily: 'JetBrains Mono, monospace',
      }}>{part.slice(1, -1)}</code>
    ) : part
  )
}

// ── Explain hero ─────────────────────────────────────────────────────────────

const EVENT_COLOR = {
  CALL:        '#818cf8',
  RETURN:      '#86efac',
  DECLARE:     '#7dd3fc',
  ASSIGN:      '#fbbf24',
  BRANCH:      '#f472b6',
  LOOP:        '#fb923c',
  OBJECT_CREATE: '#a78bfa',
  OBJECT_MUTATE: '#f59e0b',
  THROW:       '#f87171',
  CATCH:       '#34d399',
  BUILTIN:     '#94a3b8',
}
function eventColor(type) {
  for (const [k, v] of Object.entries(EVENT_COLOR)) {
    if (type.startsWith(k)) return v
  }
  return '#94a3b8'
}

function ExplainHero({ event, step, total }) {
  const explain = EXPLAIN[event.type]?.(event) ?? { summary: event.type, why: '', concept: '' }
  const color   = eventColor(event.type)
  const loc     = event.sourceLocation

  return (
    <div style={{
      background: '#0a0f1e',
      border: `1px solid ${color}33`,
      borderRadius: 12,
      padding: '16px 16px 14px',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow band at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}88, ${color}22)`,
        borderRadius: '12px 12px 0 0',
      }} />

      {/* Type + concept row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 99,
          background: `${color}22`, color, border: `1px solid ${color}55`,
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '.04em',
        }}>{event.type}</span>
        {explain.concept && <ConceptBadge concept={explain.concept} />}
        {loc && (
          <span style={{
            marginLeft: 'auto', fontSize: 10,
            color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          }}>L{loc.line}</span>
        )}
      </div>

      {/* Summary — the hero text */}
      <div style={{
        fontSize: 14, fontWeight: 600, color: '#f1f5f9',
        lineHeight: 1.5, marginBottom: explain.why ? 12 : 0,
      }}>
        <InlineText text={explain.summary} />
      </div>

      {/* Why — the explanation */}
      {explain.why && (
        <div style={{
          fontSize: 12, color: '#64748b', lineHeight: 1.7,
          borderTop: '1px solid #1e293b', paddingTop: 10,
        }}>
          <InlineText text={explain.why} />
        </div>
      )}

      {/* Step counter */}
      <div style={{
        marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          flex: 1, height: 2, background: '#1e293b', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${((step + 1) / total) * 100}%`,
            background: color, borderRadius: 2,
            transition: 'width 0.15s',
          }} />
        </div>
        <span style={{
          fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
        }}>{step + 1} / {total}</span>
      </div>
    </div>
  )
}

const IDLE_CARDS = [
  {
    icon: '📚',
    color: '#818cf8',
    title: 'Call Stack',
    desc: 'See every function call open and close in real time. Understand how recursion builds frames — and how they unwind.',
  },
  {
    icon: '🔍',
    color: '#fbbf24',
    title: 'Variable Watch',
    desc: 'Track how variables change as each line runs. Spot mutations, scope boundaries, and value flow instantly.',
  },
  {
    icon: '🧠',
    color: '#86efac',
    title: 'Heap & Objects',
    desc: 'Watch objects get created and linked. Learn why two variables can point to the same object — and what that means.',
  },
]

function IdleHero() {
  const [card, setCard] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCard(c => (c + 1) % IDLE_CARDS.length), 3000)
    return () => clearInterval(id)
  }, [])

  const c = IDLE_CARDS[card]

  return (
    <div style={{
      background: '#0a0f1e', border: `1px solid ${c.color}33`, borderRadius: 12,
      padding: '20px 16px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 10, flexShrink: 0,
      transition: 'border-color 0.4s',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top glow accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${c.color}99, ${c.color}22)`,
        borderRadius: '12px 12px 0 0',
        transition: 'background 0.4s',
      }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', fontSize: 22,
        background: `${c.color}18`, border: `1px solid ${c.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {c.icon}
      </div>

      {/* Content */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: c.color, marginBottom: 5, transition: 'color 0.3s' }}>
          {c.title}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.65, maxWidth: 220 }}>
          {c.desc}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
        {IDLE_CARDS.map((_, i) => (
          <div
            key={i}
            onClick={() => setCard(i)}
            style={{
              width: i === card ? 16 : 5, height: 5, borderRadius: 99,
              background: i === card ? c.color : '#1e293b',
              cursor: 'pointer', transition: 'all 0.25s',
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>
        Press <span style={{ color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>Run</span> to begin
      </div>
    </div>
  )
}


// ── Heap panel ────────────────────────────────────────────────────────────────

function HeapPanel({ snapshot, heapDelta }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Legend bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
        borderBottom: '1px solid #1e293b', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 9, color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '.08em' }}>HEAP</span>
        <HeapDot color="#22c55e" label="new object" />
        <HeapDot color="#f59e0b" label="mutated" />
        <HeapDot color="#818cf8" label="existing" />
        <button onClick={() => setOpen(v => !v)} style={{
          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
          color: open ? '#818cf8' : '#334155', fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace', padding: 0,
        }}>
          {open ? '▲ hide' : '? what is this'}
        </button>
      </div>

      {/* Collapsible explanation */}
      {open && (
        <div style={{
          padding: '12px 14px', background: '#080c14', borderBottom: '1px solid #1e293b',
          fontSize: 12, color: '#64748b', lineHeight: 1.7, flexShrink: 0,
        }}>
          <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>The Heap — long-term memory</div>
          When you write <code style={IC}>new Node()</code>, <code style={IC}>[]</code>, or <code style={IC}>{'{}'}</code>,
          JavaScript allocates memory on the <em>heap</em> and gives your variable a <strong style={{ color: '#f1f5f9' }}>reference</strong> — an arrow pointing to that memory, not a copy of the value.
          <br /><br />
          Unlike the <strong style={{ color: '#f1f5f9' }}>call stack</strong> — which is destroyed when a function returns — heap objects
          persist until nothing holds a reference to them. At that point the garbage collector reclaims the memory.
          <br /><br />
          <strong>This is why mutation is powerful and dangerous.</strong> Multiple variables can hold references to the same object.
          Changing the object through any one of them changes it for all — there is only one copy.
          <br /><br />
          <em style={{ color: '#475569' }}>SICP Chapter 3.3: "Modeling with Mutable Data" — the environment model depends on understanding this distinction.</em>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <HeapGraph snapshot={snapshot} heapDelta={heapDelta} />
      </div>
    </div>
  )
}

const IC = {
  background: '#1e293b', color: '#7dd3fc',
  padding: '1px 5px', borderRadius: 3,
  fontSize: '0.9em', fontFamily: 'JetBrains Mono, monospace',
}

function HeapDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9,
      color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, border: `2px solid ${color}`,
        display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}

// ── Function detail modal ─────────────────────────────────────────────────────

const KIND_COLOR_MAP = {
  function:    '#7dd3fc',
  arrow:       '#86efac',
  method:      '#818cf8',
  constructor: '#a78bfa',
}
const kColor = k => KIND_COLOR_MAP[k] ?? '#94a3b8'

function FunctionModal({ node, callGraph, onClose }) {
  const { nodes, edges } = callGraph ?? { nodes: [], edges: [] }

  const callsEdges   = edges.filter(e => e.from === node.id && !e.recursive)
  const calledByEdges = edges.filter(e => e.to === node.id && !e.recursive)
  const isRecursive  = edges.some(e => e.recursive && e.from === node.id)

  const callsNames    = callsEdges.map(e => nodes.find(n => n.id === e.to)?.name).filter(Boolean)
  const calledByNames = calledByEdges.map(e => nodes.find(n => n.id === e.from)?.name).filter(Boolean)
  const isEntryPoint  = calledByNames.length === 0
  const isLeaf        = callsNames.length === 0 && !isRecursive
  const color         = kColor(node.kind)

  const sicp = getSICPNote(node, isRecursive, callsNames, isLeaf, calledByNames)

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: 14,
          padding: '24px 26px', maxWidth: 500, width: '100%', maxHeight: '82vh',
          overflow: 'auto', boxShadow: '0 30px 70px rgba(0,0,0,.7)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99,
                background: color + '22', color, border: `1px solid ${color}44`,
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                {node.kind}
              </span>
              {isRecursive && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99,
                  background: '#78350f22', color: '#f59e0b', border: '1px solid #78350f44',
                  fontFamily: 'JetBrains Mono, monospace' }}>
                  ↺ recursive
                </span>
              )}
              {isEntryPoint && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99,
                  background: '#1e3a5f', color: '#7dd3fc', border: '1px solid #1e3a5f',
                  fontFamily: 'JetBrains Mono, monospace' }}>
                  entry point
                </span>
              )}
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color }}>
              {node.name}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: 3 }}>
              ({node.params.join(', ')})
              {node.line && <span style={{ marginLeft: 10, color: '#334155' }}>line {node.line}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#475569', fontSize: 22, lineHeight: 1, padding: 0,
          }}>×</button>
        </div>

        {/* ── What it does ── */}
        <ModalSection title="What this does">
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            <InlineText text={describeFn(node, callsNames, calledByNames, isRecursive, isLeaf, isEntryPoint)} />
          </p>
        </ModalSection>

        {/* ── Complexity ── */}
        {node.complexity && (
          <ModalSection title="Complexity">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ComplexityBadge complexity={node.complexity} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
              <InlineText text={explainComplexity(node.complexity)} />
            </p>
          </ModalSection>
        )}

        {/* ── Relationships ── */}
        <ModalSection title="Relationships">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace' }}>
            {callsNames.length > 0 && (
              <RelRow icon="→" label="Calls" names={callsNames} color="#7dd3fc" />
            )}
            {calledByNames.length > 0 && (
              <RelRow icon="←" label="Called by" names={calledByNames} color="#a78bfa" />
            )}
            {isRecursive && (
              <RelRow icon="↺" label="Recursive" names={[node.name]} color="#f59e0b" />
            )}
            {isLeaf && (
              <div style={{ color: '#475569' }}>Leaf function — calls nothing in this program.</div>
            )}
            {isEntryPoint && !isRecursive && (
              <div style={{ color: '#475569' }}>Not called by any other function — this is an entry point.</div>
            )}
          </div>
        </ModalSection>

        {/* ── Concepts ── */}
        {sicp && (
          <ModalSection title="Concepts">
            {sicp.pattern && (
              <span style={{
                display: 'inline-block', marginBottom: 10,
                fontSize: 10, padding: '2px 9px', borderRadius: 99,
                background: '#1e293b', color: '#a5b4fc',
                border: '1px solid #6366f155',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {sicp.pattern}
              </span>
            )}
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
              <InlineText text={sicp.body} />
            </p>
            {sicp.practice && (
              <div style={{
                borderLeft: '2px solid #f59e0b', paddingLeft: 10,
                fontSize: 12, color: '#78716c', lineHeight: 1.65, marginBottom: 10,
              }}>
                <span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10 }}>IN PRACTICE  </span>
                <InlineText text={sicp.practice} />
              </div>
            )}
            {sicp.sicp && (
              <div style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
                ↗ <InlineText text={sicp.sicp} />
              </div>
            )}
          </ModalSection>
        )}
      </div>
    </div>
  )
}

function ModalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 9, letterSpacing: '.1em', color: '#334155',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, textTransform: 'uppercase' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function RelRow({ icon, label, names, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#475569', minWidth: 16 }}>{icon}</span>
      <span style={{ color: '#475569', minWidth: 60 }}>{label}</span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {names.map(n => (
          <span key={n} style={{ color, background: color + '18',
            padding: '1px 7px', borderRadius: 4, border: `1px solid ${color}33` }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}

function describeFn(node, callsNames, calledByNames, isRecursive, isLeaf, isEntryPoint) {
  const name = node.name
  if (isRecursive) {
    const others = callsNames.filter(n => n !== name)
    const also   = others.length ? ` It also calls ${others.join(', ')}.` : ''
    return `\`${name}\` is a recursive function — it calls itself with a smaller input until it reaches a base case. Each call creates a new frame on the call stack.${also} Once the base case is reached, the frames unwind and results are assembled on the way back up.`
  }
  if (isLeaf) {
    return `\`${name}\` is a leaf function — it performs a focused task without calling other named functions in this program. Leaf functions are the atomic units that everything else is built from.`
  }
  if (isEntryPoint && callsNames.length > 0) {
    return `\`${name}\` is an entry point that orchestrates the overall flow. It delegates to: ${callsNames.map(n => `\`${n}\``).join(', ')}.`
  }
  if (calledByNames.length > 0 && callsNames.length > 0) {
    return `\`${name}\` sits in the middle of the call graph — called by ${calledByNames.map(n => `\`${n}\``).join(', ')} and in turn calls ${callsNames.map(n => `\`${n}\``).join(', ')}.`
  }
  return `\`${name}\` — a ${node.kind} function${node.params.length > 0 ? ` taking ${node.params.join(', ')}` : ' with no parameters'}.`
}

function explainComplexity(c) {
  const map = {
    'O(1)':           'Constant time — the same amount of work is done regardless of input size. This is the gold standard. Adding one more element changes nothing.',
    'O(n)':           'Linear time — work grows proportionally with n. Double the input, double the work. A single loop over n elements is typically O(n).',
    'O(n) recursive': 'Linear recursion — proportional to n but uses the call stack. Each recursive call adds a frame. For very large n this can cause a stack overflow. An iterative version with an explicit loop avoids this entirely.',
    'O(n²)':          'Quadratic time — double the input, 4× the work. Common in naive sorts (bubble, selection) and nested loops. Fine for small n, expensive for large n.',
    'O(n log n)?':    'Near-linear time — the sweet spot for comparison-based sorting (merge sort, quicksort on average). Much better than O(n²) for large inputs.',
  }
  return map[c] ?? `Work grows as ${c} with respect to input size.`
}

function getSICPNote(node, isRecursive, callsNames, isLeaf, calledByNames) {
  const isEntryPoint = calledByNames.length === 0
  const name = node.name
  const nameLower = name.toLowerCase()

  if (isRecursive) {
    const isBranching = callsNames.filter(n => n === name).length > 1
      || nameLower.includes('fib') || nameLower.includes('tree')
    return {
      pattern: isBranching ? 'Tree Recursion' : 'Divide & Conquer',
      body: `\`${name}\` breaks the problem into a smaller version of itself, solving the simplest case directly (the base case) and combining sub-results on the way back up. This pattern underlies merge sort, binary search, and tree traversal.`,
      practice: isBranching
        ? 'Tree recursion re-computes the same sub-problems exponentially — `fib(50)` makes billions of calls. The fix is memoization: cache results by input so each sub-problem is solved only once. This turns O(2ⁿ) → O(n).'
        : 'Deep recursion can hit the JS call stack limit (~10k frames). For large inputs, consider memoization to cache repeated sub-problems, or rewrite iteratively using an explicit stack.',
      sicp: 'SICP §1.2.1 (linear recursion) and §1.2.2 (tree recursion, fibonacci)',
    }
  }

  if (node.kind === 'constructor') {
    return {
      pattern: 'Encapsulation',
      body: `A constructor bundles state and behavior into a single unit. Callers interact through the public interface — they don't need to know how \`${name}\` stores or manages its data. This is the core OOP principle: hide what changes, expose what's stable.`,
      practice: 'Favor immutable objects when possible — it eliminates a whole class of bugs. When state must be mutable, minimize the surface area (Law of Demeter: only talk to your immediate neighbors). Consider factory functions over `new` when you need flexible initialization.',
      sicp: 'SICP §3.1 — local state, message-passing objects, and the environment model',
    }
  }

  if (node.kind === 'method') {
    return {
      pattern: 'Behavioral Abstraction',
      body: `A method defines how an object responds to a message. The caller doesn't know *how* it works — only *what* it does. This separation (interface vs implementation) lets you change the internals without breaking callers, as long as the contract is preserved.`,
      practice: 'Keep methods focused — a method that does multiple things is a signal to decompose (Single Responsibility Principle). Methods under ~10 lines are almost always easier to test and reason about than longer ones.',
      sicp: 'SICP §3.1.2 — objects as procedures with local state',
    }
  }

  if (node.kind === 'arrow') {
    return {
      pattern: 'First-Class Functions',
      body: 'Arrow functions are values — they can be passed as arguments, returned from other functions, and stored in variables. This enables higher-order patterns: `map`, `filter`, `reduce`, event handlers, and middleware chains.',
      practice: 'Arrow functions capture `this` lexically — unlike regular functions, they inherit the `this` of their surrounding scope. This makes them safe for callbacks but wrong for methods that need their own `this`.',
      sicp: 'SICP §1.3 — higher-order procedures; functions as first-class values',
    }
  }

  if (nameLower.includes('sort') || nameLower.includes('compare')) {
    return {
      pattern: 'Algorithmic Complexity',
      body: 'All comparison-based sorts have a theoretical lower bound of O(n log n) — a mathematical proof from information theory. Algorithms faster than this must avoid comparisons entirely (radix sort, counting sort). The practical choice between quicksort, merge sort, and timsort depends on memory constraints, stability requirements, and cache behavior.',
      practice: 'JavaScript\'s built-in `Array.sort()` uses timsort — O(n log n) worst-case, stable, and fast in practice for nearly-sorted arrays. Implementing your own sort is rarely necessary unless you need a custom comparator.',
      sicp: 'SICP §2.2.3 — sequences as conventional interfaces; §2.3.3 — sets and sorting',
    }
  }

  if (isLeaf) {
    return {
      pattern: 'Single Responsibility',
      body: `\`${name}\` does one thing and delegates nothing — the ideal unit of code. Small, focused functions are easy to test (no mocks needed), easy to name, and easy to compose into larger behavior.`,
      practice: node.params.length === 0
        ? 'A function with no parameters that changes behavior must depend on external state or closures. If this is intentional (a thunk or effect), make it explicit. If not, consider accepting the data it needs as a parameter.'
        : 'If this function can compute the same output from the same inputs with no side effects, it\'s a *pure function* — safe to memoize, safe to parallelize, and trivial to unit test.',
      sicp: 'SICP §1.1.4 — compound procedures as black-box abstractions',
    }
  }

  if (isEntryPoint && callsNames.length > 1) {
    return {
      pattern: 'Orchestration / Facade',
      body: `\`${name}\` coordinates the overall flow — it knows the steps but delegates the work to ${callsNames.map(n => `\`${n}\``).join(', ')}. This separation keeps the entry point readable and the helpers independently reusable and testable.`,
      practice: 'Keep orchestrators thin. If this function grows beyond ~20 lines, the steps should probably be named and extracted. The ideal orchestrator reads like a series of English sentences: "get the data, validate it, transform it, save it."',
      sicp: 'SICP §1.3 — abstraction with higher-order procedures',
    }
  }

  if (callsNames.length > 0 && calledByNames.length > 0) {
    return {
      pattern: 'Layered Architecture',
      body: `\`${name}\` sits in the middle of the call graph — it translates between levels of abstraction. Called by higher-level code (${calledByNames.map(n => `\`${n}\``).join(', ')}), it handles details that the caller shouldn't need to know about.`,
      practice: `Middle-layer functions are where abstraction leaks most often. If a caller has to know what \`${name}\` does internally to use it correctly, the interface needs work.`,
      sicp: null,
    }
  }

  return null
}

// ── Python structure view (regex-based, no Pyodide needed) ───────────────────

function parsePyStructure(source) {
  const lines   = source.split('\n')
  const fns     = []
  const classes = []
  const vars    = []

  let currentClass = null
  let classBodyIndent = null

  lines.forEach((raw, i) => {
    const line   = i + 1
    const indent = raw.length - raw.trimStart().length
    const t      = raw.trim()

    // Class declaration at column 0
    const clsM = t.match(/^class\s+(\w+)(?:\(([^)]*)\))?\s*:/)
    if (clsM && indent === 0) {
      currentClass     = clsM[1]
      classBodyIndent  = null          // reset — will be set by first body line
      classes.push({ name: clsM[1], superclass: clsM[2]?.trim() || null, line, methods: [] })
      return
    }

    // Track class body indent
    if (currentClass && classBodyIndent === null && t && !t.startsWith('#')) {
      classBodyIndent = indent
    }
    // Exited class body
    if (currentClass && t && !t.startsWith('#') && indent === 0 && !clsM) {
      currentClass    = null
      classBodyIndent = null
    }

    // def — could be top-level or method
    const fnM = t.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/)
    if (fnM) {
      const params = fnM[2]
        .split(',')
        .map(p => p.trim().replace(/=.*$/, '').replace(/^\*+/, '').trim())
        .filter(Boolean)
        .filter(p => p !== 'self' && p !== 'cls')
      if (currentClass && indent > 0) {
        const cls = classes.find(c => c.name === currentClass)
        if (cls) cls.methods.push({ name: fnM[1], params, line })
      } else {
        fns.push({ name: fnM[1], params, line })
      }
      return
    }

    // Top-level variable assignment
    const varM = t.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/)
    if (varM && indent === 0 && !t.startsWith('#')) {
      const initStr = varM[2].trim()
      let initType = null
      if (initStr.startsWith('['))  initType = 'list'
      else if (initStr.startsWith('{')) initType = initStr.includes(':') ? 'dict' : 'set'
      else if (initStr.startsWith('('))  initType = 'tuple'
      else if (/^\d/.test(initStr) || initStr.startsWith('-')) initType = 'number'
      else if (initStr.startsWith('"') || initStr.startsWith("'")) initType = 'string'
      else if (initStr.startsWith('True') || initStr.startsWith('False')) initType = 'bool'
      else { const nm = initStr.match(/^(\w+)\s*\(/); if (nm) initType = `${nm[1]}()` }
      vars.push({ name: varM[1], initType, line })
    }
  })

  return { fns, classes, vars }
}

function PyStructureView({ source, execution }) {
  const { fns, classes, vars } = parsePyStructure(source)

  // Build call set from execution events for live highlighting
  const activeFns = new Set(
    (execution?.events ?? [])
      .filter(e => e.type === 'function_call')
      .map(e => e.functionName)
  )

  const hasRun = !!execution

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Functions */}
      {fns.length > 0 && (
        <>
          <SectionLabel>FUNCTIONS</SectionLabel>
          {fns.map((fn, i) => {
            const wasCalled = hasRun && activeFns.has(fn.name)
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '4px 9px', background: '#0d1526',
                borderRadius: 6, border: `1px solid ${wasCalled ? '#6366f155' : '#1e293b'}`,
              }}>
                <span style={{ width: 3, height: 20, borderRadius: 2, flexShrink: 0,
                  background: wasCalled ? '#818cf8' : '#334155' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                  color: wasCalled ? '#818cf8' : '#7dd3fc', fontWeight: 700 }}>
                  {fn.name}
                </span>
                <span style={{ fontSize: 10, color: '#475569',
                  fontFamily: 'JetBrains Mono, monospace' }}>
                  ({fn.params.join(', ')})
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 8, color: '#334155',
                  fontFamily: 'JetBrains Mono, monospace' }}>L{fn.line}</span>
              </div>
            )
          })}
        </>
      )}

      {/* Classes */}
      {classes.length > 0 && (
        <>
          <SectionLabel>CLASSES</SectionLabel>
          {classes.map((cls, i) => (
            <div key={i} style={{ padding: '7px 9px', background: '#1e293b', borderRadius: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: cls.methods.length ? 5 : 0 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#818cf8' }}>
                  {cls.name}
                </span>
                {cls.superclass && (
                  <span style={{ fontSize: 10, color: '#64748b' }}>({cls.superclass})</span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 8, color: '#334155',
                  fontFamily: 'JetBrains Mono, monospace' }}>L{cls.line}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {cls.methods.map((m, j) => (
                  <span key={j} style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 99,
                    background: m.name === '__init__' ? '#312e81' : '#1e3a5f',
                    color: m.name === '__init__' ? '#a5b4fc' : '#7dd3fc',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{m.name}</span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Variables */}
      {vars.length > 0 && (
        <>
          <SectionLabel>VARIABLES</SectionLabel>
          {vars.map((v, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 8px', borderRadius: 5,
              background: '#0d1526', border: '1px solid #1e293b',
            }}>
              <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, flexShrink: 0,
                background: '#86efac18', color: '#86efac', border: '1px solid #86efac33',
                fontFamily: 'JetBrains Mono, monospace' }}>var</span>
              <span style={{ flex: 1, fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                color: '#e2e8f0' }}>{v.name}</span>
              {v.initType && (
                <span style={{ fontSize: 9, color: '#475569',
                  fontFamily: 'JetBrains Mono, monospace' }}>{v.initType}</span>
              )}
              <span style={{ fontSize: 8, color: '#334155',
                fontFamily: 'JetBrains Mono, monospace' }}>L{v.line}</span>
            </div>
          ))}
        </>
      )}

      {fns.length === 0 && classes.length === 0 && vars.length === 0 && (
        <span style={{ color: '#475569', fontSize: 12 }}>No definitions detected.</span>
      )}

      {!hasRun && (fns.length > 0 || classes.length > 0) && (
        <div style={{ fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          borderTop: '1px solid #1e293b', paddingTop: 6, marginTop: 2 }}>
          Run to see which functions are called (highlighted in indigo)
        </div>
      )}
    </div>
  )
}

// ── Static analysis views ─────────────────────────────────────────────────────

const VAR_KIND_COLOR = { const: '#86efac', let: '#fbbf24', var: '#f472b6' }
const INIT_TYPE_COLOR = {
  number: '#86efac', string: '#fbbf24', boolean: '#f472b6',
  array: '#7dd3fc', object: '#818cf8', function: '#a78bfa', expr: '#94a3b8',
}
function initColor(t) {
  if (!t) return '#334155'
  if (t.startsWith('new ')) return '#a78bfa'
  if (t.endsWith('()'))     return '#7dd3fc'
  return INIT_TYPE_COLOR[t] ?? '#475569'
}

function StructureView({ model, currentEvent, onNodeClick }) {
  if (model?.error) return <span style={{ color: '#ef4444', fontSize: 12 }}>Parse error: {model.error.message}</span>
  if (!model) return <span style={{ color: '#475569', fontSize: 12 }}>Parsing…</span>

  const hasGraph      = model.callGraph?.nodes?.length > 0
  const hasClasses    = model.classes?.length > 0
  const hasVars       = model.variables?.length > 0
  const hasImports    = model.imports?.length > 0
  const hasInterfaces = model.interfaces?.length > 0
  const hasTypes      = model.types?.length > 0
  const hasEnums      = model.enums?.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* ── Call graph ── */}
      {hasGraph
        ? <CallGraphView callGraph={model.callGraph} currentEvent={currentEvent} onNodeClick={onNodeClick} />
        : <span style={{ color: '#475569', fontSize: 12 }}>No functions detected.</span>
      }

      {/* ── Variables ── */}
      {hasVars && (
        <>
          <SectionLabel>VARIABLES</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {model.variables.map((v, i) => {
              const kindColor = VAR_KIND_COLOR[v.kind] ?? '#94a3b8'
              const iColor    = initColor(v.initType)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '3px 8px', borderRadius: 5, background: '#0d1526',
                  border: '1px solid #1e293b',
                }}>
                  {/* kind badge */}
                  <span style={{
                    fontSize: 8, padding: '1px 5px', borderRadius: 3, flexShrink: 0,
                    background: kindColor + '18', color: kindColor,
                    border: `1px solid ${kindColor}33`,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{v.kind}</span>

                  {/* name */}
                  <span style={{
                    flex: 1, fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{v.name}</span>

                  {/* init type */}
                  {v.initType && (
                    <span style={{
                      fontSize: 9, color: iColor, fontFamily: 'JetBrains Mono, monospace',
                      flexShrink: 0, opacity: 0.8,
                    }}>{v.initType}</span>
                  )}

                  {/* line */}
                  {v.line && (
                    <span style={{
                      fontSize: 8, color: '#334155', flexShrink: 0,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>L{v.line}</span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Classes ── */}
      {hasClasses && (
        <>
          <SectionLabel>CLASSES</SectionLabel>
          {model.classes.map((cls, i) => (
            <div key={i} style={{ padding: '7px 9px', background: '#1e293b', borderRadius: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#818cf8' }}>{cls.name}</span>
                {cls.superclass && <span style={{ fontSize: 10, color: '#64748b' }}>extends {cls.superclass}</span>}
                {cls.line && <span style={{ marginLeft: 'auto', fontSize: 8, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>L{cls.line}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {cls.methods.map((m, j) => (
                  <span key={j} style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 99,
                    background: m.kind === 'constructor' ? '#312e81' : '#1e3a5f',
                    color: m.kind === 'constructor' ? '#a5b4fc' : '#7dd3fc',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{m.static ? 'static ' : ''}{m.name}</span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Interfaces ── */}
      {hasInterfaces && (
        <>
          <SectionLabel>INTERFACES</SectionLabel>
          {model.interfaces.map((iface, i) => (
            <div key={i} style={{ padding: '7px 9px', background: '#0d1526', borderRadius: 6, border: '1px solid #6366f133' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: iface.members.length ? 5 : 0 }}>
                <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, flexShrink: 0,
                  background: '#6366f118', color: '#818cf8', border: '1px solid #6366f133',
                  fontFamily: 'JetBrains Mono, monospace' }}>interface</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a5b4fc' }}>{iface.name}</span>
                {iface.extends?.length > 0 && (
                  <span style={{ fontSize: 10, color: '#475569' }}>extends {iface.extends.join(', ')}</span>
                )}
                {iface.line && <span style={{ marginLeft: 'auto', fontSize: 8, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>L{iface.line}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {iface.members.map((m, j) => (
                  <span key={j} style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 99,
                    background: m.kind === 'method' ? '#1e3a5f' : '#1e293b',
                    color: m.kind === 'method' ? '#7dd3fc' : '#94a3b8',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{m.name}{m.optional ? '?' : ''}{m.kind === 'method' ? '()' : ''}</span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Types ── */}
      {hasTypes && (
        <>
          <SectionLabel>TYPES</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {model.types.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 8px', borderRadius: 5,
                background: '#0d1526', border: '1px solid #a78bfa33',
              }}>
                <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3,
                  background: '#a78bfa18', color: '#a78bfa', border: '1px solid #a78bfa33',
                  fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>type</span>
                <span style={{ flex: 1, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#c4b5fd' }}>{t.name}</span>
                {t.isUnion && <span style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>union</span>}
                {t.line && <span style={{ fontSize: 8, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>L{t.line}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Enums ── */}
      {hasEnums && (
        <>
          <SectionLabel>ENUMS</SectionLabel>
          {model.enums.map((e, i) => (
            <div key={i} style={{ padding: '7px 9px', background: '#0d1526', borderRadius: 6, border: '1px solid #34d39933' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: e.members.length ? 5 : 0 }}>
                <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3,
                  background: '#34d39918', color: '#34d399', border: '1px solid #34d39933',
                  fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>enum</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6ee7b7' }}>{e.name}</span>
                {e.line && <span style={{ marginLeft: 'auto', fontSize: 8, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>L{e.line}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {e.members.map((m, j) => (
                  <span key={j} style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 99,
                    background: '#0f2920', color: '#34d399',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{m}</span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Imports ── */}
      {hasImports && (
        <>
          <SectionLabel>IMPORTS</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {model.imports.map((imp, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 8px', borderRadius: 5,
                background: '#0d1526', border: '1px solid #1e293b',
              }}>
                <span style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                  from
                </span>
                <span style={{ flex: 1, fontSize: 10, color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {imp.source}
                </span>
                <span style={{ fontSize: 9, color: '#475569', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                  {imp.specifiers.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, letterSpacing: '.08em', color: '#334155',
      fontFamily: 'JetBrains Mono, monospace',
      paddingTop: 4, borderTop: '1px solid #1e293b',
    }}>
      {children}
    </div>
  )
}

function TokensView({ model, source }) {
  const [selected, setSelected] = useState(null)
  const tokens = model?.files?.[0]?.tokens ?? []
  
  // Lexer explanation mapping
  const TOKEN_GLOSSARY = {
    keyword: { desc: 'A reserved word built into the language (e.g., if, function, let).', bg: '#ec4899' },
    name: { desc: 'An identifier chosen by the programmer for a variable, function, or property.', bg: '#60a5fa' },
    number: { desc: 'A numeric literal value.', bg: '#f59e0b' },
    string: { desc: 'A text literal value enclosed in quotes.', bg: '#22c55e' },
    punctuation: { desc: 'Symbols that structure the code or represent operators (+, -, {, }, etc).', bg: '#94a3b8' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Educational intro */}
      <div style={{ padding: '8px 10px', background: '#0a0f1e', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#818cf8', marginBottom: 4 }}>
          Lexical Analysis (Tokenization)
        </div>
        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
          Before the computer can understand your code, the <strong>Lexer</strong> reads the raw text character-by-character and groups them into <strong>Tokens</strong> — the smallest meaningful words of a programming language.
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left: Annotated Source */}
        <div style={{ flex: 1, overflow: 'auto', padding: 10, borderRight: '1px solid #1e293b' }}>
          <div style={{ fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '.08em' }}>
            ANNOTATED SOURCE
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {source ? (
              <AnnotatedSource source={source} tokens={tokens} selected={selected} onSelect={setSelected} />
            ) : (
              <span style={{ color: '#475569' }}>No source available.</span>
            )}
          </div>
        </div>

        {/* Right: Inspector */}
        <div style={{ width: 180, background: '#0a0f1e', padding: 10, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12, letterSpacing: '.08em' }}>
            INSPECTOR
          </div>
          {selected ? (
            <div>
              <div style={{
                fontSize: 11, padding: '2px 6px', borderRadius: 4, display: 'inline-block',
                background: `${TOKEN_GLOSSARY[selected.type]?.bg || '#94a3b8'}22`,
                color: TOKEN_GLOSSARY[selected.type]?.bg || '#94a3b8',
                border: `1px solid ${TOKEN_GLOSSARY[selected.type]?.bg || '#94a3b8'}44`,
                fontFamily: 'JetBrains Mono, monospace', marginBottom: 10,
              }}>
                {selected.type}
              </div>
              <div style={{
                fontSize: 14, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace',
                background: '#0f172a', padding: '6px 8px', borderRadius: 4, border: '1px solid #1e293b',
                marginBottom: 12, wordBreak: 'break-all'
              }}>
                {selected.value ?? selected.type}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                {TOKEN_GLOSSARY[selected.type]?.desc ?? 'A grammatical token.'}
                <br /><br />
                <span style={{ color: '#475569' }}>Offsets: {selected.start} – {selected.end}</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
              Click any highlighted token in the source code to inspect it.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnnotatedSource({ source, tokens, selected, onSelect }) {
  if (!tokens || tokens.length === 0) return source

  const elements = []
  let lastPos = 0

  tokens.forEach((tok, i) => {
    // Add plain text before token
    if (tok.start > lastPos) {
      elements.push(<span key={`text-${i}`}>{source.slice(lastPos, tok.start)}</span>)
    }
    // Add token
    const isSel = selected === tok
    const color = tokenColor(tok.type)
    elements.push(
      <span
        key={`tok-${i}`}
        onClick={() => onSelect(tok)}
        style={{
          cursor: 'pointer',
          borderRadius: 3,
          padding: '0 1px',
          background: isSel ? `${color}33` : 'transparent',
          color: color,
          borderBottom: `1px solid ${isSel ? color : `${color}44`}`,
          transition: 'all 0.1s',
        }}
        onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = `${color}18` }}
        onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
      >
        {source.slice(tok.start, tok.end)}
      </span>
    )
    lastPos = tok.end
  })
  // Add remaining plain text
  if (lastPos < source.length) {
    elements.push(<span key="text-end">{source.slice(lastPos)}</span>)
  }
  return elements
}

function AstView({ model }) {
  const [openIntro, setOpenIntro] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const ast = model?.files?.[0]?.ast

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
      {/* Collapsible intro */}
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
          <span style={{ fontSize: 9, color: '#334155', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.08em' }}>AST</span>
          <button onClick={() => setOpenIntro(v => !v)} style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            color: openIntro ? '#818cf8' : '#334155', fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace', padding: 0,
          }}>
            {openIntro ? '▲ hide' : '? what is this'}
          </button>
        </div>
        {openIntro && (
          <div style={{ padding: '10px 0', fontSize: 11, color: '#64748b', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 5 }}>
              Abstract Syntax Tree — how the computer reads your code
            </div>
            The parser reads the token stream and converts it into a <strong style={{ color: '#f1f5f9' }}>tree of nodes</strong> — one node per grammatical unit (a function declaration, a variable, an expression).
            <br /><br />
            The interpreter then <strong style={{ color: '#f1f5f9' }}>walks this tree</strong>, executing what each node means. That walk produces the event stream you see in the Events tab.
          </div>
        )}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '6px', background: '#1e293b', color: '#818cf8', borderRadius: 4,
          border: '1px solid #334155', cursor: 'pointer', fontSize: 11, fontWeight: 600,
        }}
      >
        <Maximize2 size={12} /> View Full AST
      </button>

      {/* Tree Preview */}
      <div style={{ opacity: 0.6, pointerEvents: 'none', maxHeight: 300, overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
        {ast ? <ASTNode node={ast} depth={0} /> : <span style={{ color: '#475569', fontSize: 12 }}>No AST.</span>}
      </div>

      {/* Fullscreen Modal Overlay */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
            width: '100%', maxWidth: 1000, height: '100%', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid #1e293b', background: '#0a0f1e',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <Braces size={16} color="#818cf8" />
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Abstract Syntax Tree Explorer</span>
              <button onClick={() => setModalOpen(false)} style={{
                marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
              }}><X size={18} /></button>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#080c14' }}>
              <div style={{ 
                minWidth: 'max-content', // Forces container to be wide enough for deep nesting
                paddingRight: 40 
              }}>
                {ast && <ASTNode node={ast} depth={0} startOpen={true} interactive={true} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── Scope chain view ──────────────────────────────────────────────────────────

function ScopeChainView({ event }) {
  if (!event) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 12, color: '#475569' }}>Run code first.</div>
      </div>
    )
  }

  const frames   = event.stackSnapshot ?? []
  // Frames are ordered innermost-first; reverse so top = current
  const ordered  = [...frames].reverse()
  const hasFrames = ordered.length > 0

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Concept label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        padding: '6px 10px', borderRadius: 7,
        background: '#0f172a', border: '1px solid #1e293b',
      }}>
        <Layers size={12} color="#818cf8" />
        <span style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: '.04em' }}>
          SCOPE CHAIN
        </span>
        <span style={{ fontSize: 10, color: '#334155', marginLeft: 'auto' }}>
          {hasFrames ? `${ordered.length} frame${ordered.length > 1 ? 's' : ''}` : 'global only'}
        </span>
      </div>

      {/* Concept explanation */}
      <div style={{
        fontSize: 11, color: '#475569', lineHeight: 1.6,
        padding: '0 2px', marginBottom: 12,
      }}>
        Every time a function is called, JavaScript creates a new <span style={{ color: '#818cf8' }}>scope frame</span> to
        hold its variables. When the function returns, the frame is destroyed.
        Inner frames can read variables from outer frames — that's how <span style={{ color: '#a78bfa' }}>closures</span> work.
      </div>

      {/* Stack frames as scope levels */}
      {ordered.map((frame, i) => (
        <ScopeFrame key={i} frame={frame} isCurrent={i === 0} isGlobal={false} />
      ))}

      {/* Global scope always at the bottom */}
      <div style={{ position: 'relative', marginTop: ordered.length > 0 ? 0 : 4 }}>
        {ordered.length > 0 && (
          <div style={{
            width: 1, height: 12, background: '#1e293b',
            margin: '0 auto 0 19px',
          }} />
        )}
        <GlobalScope event={event} />
      </div>
    </div>
  )
}

function ScopeFrame({ frame, isCurrent }) {
  const [open, setOpen] = useState(isCurrent)
  const locals = Object.entries(frame.locals ?? {})

  return (
    <div style={{ position: 'relative', marginBottom: 0 }}>
      {/* Connector line */}
      <div style={{
        position: 'absolute', left: 19, top: 0, bottom: 0,
        width: 1, background: isCurrent ? '#4338ca' : '#1e293b',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 4 }}>
        {/* Frame header */}
        <div
          onClick={() => locals.length > 0 && setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px 6px 8px', borderRadius: 7,
            background: isCurrent ? '#1e1b4b' : '#0f172a',
            border: `1px solid ${isCurrent ? '#4338ca' : '#1e293b'}`,
            cursor: locals.length > 0 ? 'pointer' : 'default',
            marginLeft: 0,
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: isCurrent ? '#4338ca' : '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isCurrent
              ? <span style={{ fontSize: 8, color: '#a5b4fc', fontWeight: 700 }}>NOW</span>
              : <span style={{ fontSize: 9, color: '#475569' }}>fn</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
              color: isCurrent ? '#a5b4fc' : '#7dd3fc',
            }}>
              {frame.name ?? '(anonymous)'}
              {isCurrent && <span style={{ fontSize: 10, color: '#6366f1', marginLeft: 6 }}>← running</span>}
            </div>
            <div style={{ fontSize: 10, color: '#334155' }}>
              {locals.length} variable{locals.length !== 1 ? 's' : ''}
              {frame.line ? ` · L${frame.line}` : ''}
            </div>
          </div>
          {locals.length > 0 && (
            <span style={{ fontSize: 10, color: '#334155' }}>
              {open ? '▲' : '▼'}
            </span>
          )}
        </div>

        {/* Variables */}
        {open && locals.length > 0 && (
          <div style={{
            marginLeft: 30, marginTop: 2, marginBottom: 4,
            padding: '6px 8px', borderRadius: 6,
            background: '#080c14', border: '1px solid #1e293b',
          }}>
            {locals.map(([name, val]) => (
              <div key={name} style={{
                display: 'flex', gap: 8, fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                padding: '2px 0', alignItems: 'baseline',
              }}>
                <span style={{ color: '#7dd3fc', minWidth: 80, flexShrink: 0 }}>{name}</span>
                <span style={{ color: '#334155', flexShrink: 0 }}>=</span>
                <span style={{ color: valueColor(val), wordBreak: 'break-all' }}>
                  {formatValue(val)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GlobalScope({ event }) {
  const [open, setOpen] = useState(false)
  // Collect globals from the first (oldest) stack frame if available
  const frames  = event.stackSnapshot ?? []
  const globals = frames.length > 0 ? Object.entries(frames[0]?.locals ?? {}) : []

  return (
    <div style={{
      padding: '6px 10px 6px 8px', borderRadius: 7,
      background: '#080c14', border: '1px solid #1e293b',
      cursor: globals.length > 0 ? 'pointer' : 'default',
    }} onClick={() => globals.length > 0 && setOpen(o => !o)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: '#0f172a', border: '1px solid #334155',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, color: '#475569', fontWeight: 700,
        }}>GBL</div>
        <div>
          <div style={{ fontSize: 12, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
            global scope
          </div>
          <div style={{ fontSize: 10, color: '#334155' }}>
            top-level declarations · always visible
          </div>
        </div>
        {globals.length > 0 && (
          <span style={{ fontSize: 10, color: '#334155', marginLeft: 'auto' }}>
            {open ? '▲' : '▼'}
          </span>
        )}
      </div>
      {open && globals.length > 0 && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #1e293b' }}>
          {globals.map(([name, val]) => (
            <div key={name} style={{
              display: 'flex', gap: 8, fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace', padding: '2px 0',
            }}>
              <span style={{ color: '#64748b', minWidth: 80 }}>{name}</span>
              <span style={{ color: '#334155' }}>=</span>
              <span style={{ color: valueColor(val) }}>{formatValue(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function valueColor(v) {
  if (v === null || v === undefined) return '#475569'
  if (typeof v === 'number') return '#86efac'
  if (typeof v === 'string') return '#fbbf24'
  if (typeof v === 'boolean') return '#f472b6'
  if (typeof v === 'object' && v?.__kind === 'reference') return '#818cf8'
  if (typeof v === 'function' || (typeof v === 'object' && v?.type === 'function')) return '#a78bfa'
  return '#94a3b8'
}

function formatValue(v) {
  if (v === null)      return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'function') return '[Function]'
  if (typeof v === 'object' && v?.__kind === 'reference') return `[Object #${v.objectId}]`
  if (typeof v === 'object' && v?.type === 'function') return `[Function ${v.name ?? ''}]`
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 30)
  if (typeof v === 'string') return `"${v.length > 20 ? v.slice(0, 20) + '…' : v}"`
  return String(v)
}
