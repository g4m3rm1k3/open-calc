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

// ── Lesson enrichment ──────────────────────────────────────────────────────────
// Runs each lesson step's code through the interpreter and attaches the most
// relevant stackSnapshot so the variables panel populates in lesson mode.

export function enrichLessonWithSnapshots(lesson) {
  return {
    ...lesson,
    steps: lesson.steps.map(step => {
      if (step.stackSnapshot?.length) return step  // already has data

      const { events } = run(step.code)
      if (!events.length) return { ...step, stackSnapshot: [] }

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

      return { ...step, stackSnapshot: best ?? [] }
    }),
  }
}
