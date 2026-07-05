import { buildProgramModel } from '../../engines/js/parser/jsParser.js'
import { run } from '../../engines/js/interpreter/interpreter.js'
import { EventType } from '../../engines/js/eventStream.js'

const CALL_COLORS = ['emerald', 'violet', 'indigo', 'pink']
const MAX_STEPS   = 48

const BUILTIN_NAMES = new Set([
  'undefined', 'null', 'true', 'false', 'Infinity', 'NaN',
  'console', 'Math', 'Number', 'String', 'Array', 'Object',
  'Map', 'Set', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'typeof',
  '__console_log__',
])

function charToLine(source, charOffset) {
  return source.slice(0, Math.min(charOffset, source.length)).split('\n').length
}

function displayVal(v) {
  if (v === undefined) return 'undefined'
  if (v === null) return 'null'
  if (typeof v === 'object' && '$ref' in v) return '[Object]'
  if (typeof v === 'string') {
    // already a display string from _snapshotValue (array/object/function repr)
    if (v.startsWith('[') || v.startsWith('{')) return v
    return `"${v}"`
  }
  try { return JSON.stringify(v) } catch { return String(v) }
}

export function generateSteps(source) {
  if (!source?.trim()) return { steps: null, error: 'Paste some code first.' }

  const model = buildProgramModel(source)
  if (model.error) {
    return {
      steps: null,
      error: `Parse error${model.error.line ? ` on line ${model.error.line}` : ''}: ${model.error.message}`,
    }
  }

  // Function name → { startLine, endLine }
  const fnRanges = {}
  for (const node of model.callGraph?.nodes ?? []) {
    if (node.name && node.name !== '(anonymous)') {
      fnRanges[node.name] = {
        startLine: node.line,
        endLine:   charToLine(source, node.end),
      }
    }
  }

  const { events, output, error: runError } = run(source)
  const allOutput = output ?? []
  let logCount = 0
  const snap = () => allOutput.slice(0, logCount)

  const steps = [{
    title:         'Overview',
    code:          source,
    explanation:   'Your code is loaded. Step through to trace every function call, variable declaration, and return value.',
    active:        [],
    connections:   [],
    outputSoFar:   [],
    stackSnapshot: [],
  }]

  let colorIdx = 0

  for (const event of events) {
    // Track console output cursor — advance BEFORE snap() so this step shows the new line
    const isConsoleReturn = event.type === EventType.FUNCTION_RETURN && event.native &&
      typeof event.functionName === 'string' && event.functionName.startsWith('console.')
    if (isConsoleReturn) {
      logCount++
      if (steps.length <= MAX_STEPS && event.sourceLocation?.line) {
        const callLine = event.sourceLocation.line
        const logLine  = allOutput[logCount - 1] ?? ''
        steps.push({
          title:       `↪ ${event.functionName}`,
          code:        source,
          explanation: `Line ${callLine} logs: ${logLine}`,
          active:      [{ startLine: callLine, endLine: callLine, color: 'emerald', label: logLine.slice(0, 24) }],
          connections: [],
          outputSoFar:   snap(),
          stackSnapshot: event.stackSnapshot ?? [],
        })
      }
      continue
    }

    if (steps.length > MAX_STEPS) continue

    // ── Function call ──────────────────────────────────────────────────────────
    if (event.type === EventType.FUNCTION_CALL && !event.native) {
      const callLine = event.sourceLocation?.line
      if (!callLine) continue

      const range  = fnRanges[event.functionName]
      const color  = CALL_COLORS[colorIdx % CALL_COLORS.length]
      colorIdx++

      const active = [
        { startLine: callLine, endLine: callLine, color: 'emerald', label: 'call site' },
      ]
      const connections = []

      if (range) {
        active.push({ startLine: range.startLine, endLine: range.endLine, color, label: event.functionName })
        connections.push({ fromLine: callLine, toLine: range.startLine, color: 'emerald', label: 'enters' })
      }

      const argStr = (event.args ?? []).slice(0, 4).map(displayVal).join(', ')
      const whereStr = range ? ` Enters body at line ${range.startLine}.` : ''

      steps.push({
        title:       `${event.functionName}(${argStr})`,
        code:        source,
        explanation: `Line ${callLine} calls ${event.functionName}(${argStr}).${whereStr}`,
        active,
        connections,
        outputSoFar:   snap(),
        stackSnapshot: event.stackSnapshot ?? [],
      })
    }

    // ── Variable declaration (top-level only) ─────────────────────────────────
    if (event.type === EventType.VARIABLE_DECLARE) {
      const snapshot   = event.stackSnapshot ?? []
      const isTopLevel = snapshot.length === 1 && snapshot[0]?.name === '__global__'
      if (!isTopLevel) continue

      const name = event.name
      if (!name || BUILTIN_NAMES.has(name)) continue

      // Use the snapshot's global locals for the richer display (uses _snapshotValue)
      const globalLocals = snapshot[0]?.locals ?? {}
      const snapVal      = globalLocals[name]
      if (snapVal === undefined) continue

      // Skip bare function / class definitions — those are covered by FUNCTION_CALL steps
      if (typeof snapVal === 'string' &&
          (snapVal.startsWith('[Function') || snapVal.startsWith('[Class'))) continue

      const declLine = event.sourceLocation?.line
      if (!declLine) continue

      const valStr = displayVal(snapVal)

      steps.push({
        title:       `${name} = ${valStr}`,
        code:        source,
        explanation: `Line ${declLine}: ${name} is set to ${valStr}.`,
        active:      [{ startLine: declLine, endLine: declLine, color: 'emerald', label: `${name} = ${valStr}` }],
        connections: [],
        outputSoFar:   snap(),
        stackSnapshot: snapshot,
      })
    }

    // ── Function return ────────────────────────────────────────────────────────
    if (event.type === EventType.FUNCTION_RETURN && !event.native) {
      const callLine = event.sourceLocation?.line
      if (!callLine) continue

      const retStr  = displayVal(event.returnValue)
      const retLine = event.sourceLocation?.line

      steps.push({
        title:       `↩ ${event.functionName} → ${retStr}`,
        code:        source,
        explanation: `${event.functionName} returns ${retStr}${retLine ? `. Control returns to line ${retLine}` : ''}.`,
        active:      [{ startLine: callLine, endLine: callLine, color: 'pink', label: `← ${retStr}` }],
        connections: [],
        outputSoFar:   snap(),
        stackSnapshot: event.stackSnapshot ?? [],
      })
    }
  }

  return {
    steps,
    error: runError ? `Runtime error: ${runError.message}` : null,
  }
}

// ── TypeScript stripping ───────────────────────────────────────────────────────
// Converts TypeScript-annotated code to plain JS for the interpreter.
// Handles the subset of TS syntax used in the abstraction-viz lessons.

export function stripTypeScript(code) {
  let s = code

  // interface blocks (single-level braces, multi-line)
  s = s.replace(/^interface\s+\w+(?:<[^>]+>)?(?:\s+extends\s+[\w<>, .]+)?\s*\{[^}]*\}\n?/gm, '')

  // single-line type aliases
  s = s.replace(/^type\s+\w+(?:<[^>]+>)?\s*=.+$\n?/gm, '')

  // 'implements' clauses
  s = s.replace(/\s+implements\s+[\w<>, ]+(?=\s*[\n{])/g, '')

  // generic type params on class/function declarations: <T>, <T, U>, <T extends Foo>
  s = s.replace(/<(?:[A-Z]\w*(?:\s+extends\s+\w+(?:\.\w+)?)?,?\s*)+>(?=\s*[({,])/g, '')

  // TypeScript access modifiers and keywords
  s = s.replace(/\b(public|private|protected|readonly|abstract|override|declare)\s+/g, '')

  // class body property declarations — one or more "name: Type" per line, separated by ";"
  s = s.replace(/^(\s+)\w+\??:\s*\w+(?:\[\])?(?:\s*;\s*\w+\??:\s*\w+(?:\[\])?)*\s*(?:\/\/.*)?$/gm, '')

  // TypeScript type name pattern — only strips types that look like TS (not JS literal values like 30).
  // Matches: string, number, boolean, void, any, never, undefined, null, unknown, object,
  //          or any PascalCase name (User, Animal, Shape) — never matches numeric or string literals.
  const tsTypePat = '(?:string|number|boolean|void|any|never|undefined|null|unknown|object|[A-Z]\\w*)'
  const tsTypeSeq = `${tsTypePat}(?:\\[\\])?(?:\\s*\\|\\s*${tsTypePat}(?:\\[\\])?)*`

  // return type annotations: ): SomeType {  or  ): SomeType\n
  s = s.replace(new RegExp(`\\)\\s*:\\s*${tsTypeSeq}(?=\\s*[\\n{])`, 'g'), ')')

  // parameter type annotations: name: Type before , or )
  s = s.replace(new RegExp(`(\\b\\w+)\\s*\\??:\\s*${tsTypeSeq}(?=\\s*[,)])`, 'g'), '$1')

  // variable type annotations: const x: Type =
  s = s.replace(new RegExp(`((?:const|let|var)\\s+\\w+)\\s*:\\s*${tsTypeSeq}(?=\\s*=)`, 'g'), '$1')

  // 'as SomeType' casts
  s = s.replace(/\s+as\s+\w+(?:\[\])?/g, '')

  // generic type args in new expressions: new Box<number>() → new Box()
  s = s.replace(/\bnew\s+(\w+)<[^>]+>/g, 'new $1')

  // generic type args in function calls: foo<Number>() → foo()
  s = s.replace(/(\b\w+)<[A-Z]\w*>(?=\s*\()/g, '$1')

  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim()
}

// ── Live step runner ───────────────────────────────────────────────────────────
// Runs a single lesson step's code and returns { output, snapshot }.
// Called live when the user navigates to a step — no pre-computation.

const stepCache = new WeakMap()

export function runStep(step, lessonLang) {
  if (stepCache.has(step)) return stepCache.get(step)

  const code = step.runCode ?? (lessonLang === 'ts' ? stripTypeScript(step.code) : step.code)
  if (!code?.trim()) return { output: [], snapshot: [] }

  const { events, output } = run(code)

  const activeLines = new Set()
  for (const h of step.active ?? []) {
    for (let l = h.startLine; l <= h.endLine; l++) activeLines.add(l)
  }

  let best = null
  for (const ev of events) {
    if (ev.native) continue
    if (ev.type !== EventType.FUNCTION_CALL && ev.type !== EventType.FUNCTION_RETURN) continue
    const line = ev.sourceLocation?.line
    if (line && activeLines.has(line)) { best = ev.stackSnapshot ?? []; break }
  }
  if (!best) {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].stackSnapshot?.length) { best = events[i].stackSnapshot; break }
    }
  }

  const result = { output: output ?? [], snapshot: best ?? [] }
  stepCache.set(step, result)
  return result
}

// ── Lesson enrichment (legacy — kept for reference) ───────────────────────────
export function enrichLessonWithSnapshots(lesson) {
  return {
    ...lesson,
    steps: lesson.steps.map(step => {
      if (step.stackSnapshot?.length) return step  // already has data

      // Use runCode override for steps that need hand-written JS equivalents (e.g. complex TS patterns)
      const sourceToRun = step.runCode ?? (lesson.lang === 'ts' ? stripTypeScript(step.code) : step.code)

      const { events, output } = run(sourceToRun)
      const outputSoFar = output ?? []
      if (!events.length) return { ...step, stackSnapshot: [], outputSoFar }

      // Build a set of "active" line numbers from the highlights
      const activeLines = new Set()
      for (const h of step.active ?? []) {
        for (let l = h.startLine; l <= h.endLine; l++) activeLines.add(l)
      }

      // Prefer a snapshot from a FUNCTION_CALL/RETURN event on an active line
      let best = null
      for (const ev of events) {
        if (ev.native) continue
        if (ev.type !== EventType.FUNCTION_CALL && ev.type !== EventType.FUNCTION_RETURN) continue
        const line = ev.sourceLocation?.line
        if (line && activeLines.has(line)) { best = ev.stackSnapshot ?? []; break }
      }

      // Fallback: use the last event's global state
      if (!best) {
        for (let i = events.length - 1; i >= 0; i--) {
          if (events[i].stackSnapshot?.length) { best = events[i].stackSnapshot; break }
        }
      }

      return { ...step, stackSnapshot: best ?? [], outputSoFar }
    }),
  }
}
