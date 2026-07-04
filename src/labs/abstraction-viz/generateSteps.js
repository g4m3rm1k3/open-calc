import { buildProgramModel } from '../../engines/js/parser/jsParser.js'
import { run } from '../../engines/js/interpreter/interpreter.js'
import { EventType } from '../../engines/js/eventStream.js'

const CALL_COLORS = ['emerald', 'violet', 'indigo', 'pink']
const MAX_STEPS   = 32

function charToLine(source, charOffset) {
  return source.slice(0, Math.min(charOffset, source.length)).split('\n').length
}

function displayVal(v) {
  if (v === undefined) return 'undefined'
  if (v === null) return 'null'
  if (typeof v === 'object' && '$ref' in v) return '[Object]'
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

  // Function name → { startLine, endLine } from the call graph
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

  // Track how many console lines have been produced as we walk events.
  // FUNCTION_RETURN for native console.* means the log call completed.
  let logCount = 0

  const snap = () => allOutput.slice(0, logCount)

  // Step 0 — overview: code visible, nothing logged yet
  const steps = [{
    title:       'Overview',
    code:        source,
    explanation: 'Your code is loaded. Step forward to trace each function call — the call site and the body it enters will light up, with an arrow connecting them.',
    active:        [],
    connections:   [],
    outputSoFar:   [],
    stackSnapshot: [],
  }]

  let colorIdx = 0

  for (const event of events) {
    // Advance the log cursor whenever a native console call finishes
    if (event.type === EventType.FUNCTION_RETURN && event.native &&
        typeof event.functionName === 'string' && event.functionName.startsWith('console.')) {
      logCount++
    }

    if (steps.length > MAX_STEPS) continue  // keep advancing logCount but stop adding steps

    // ── Function call ────────────────────────────────────────────────────────
    if (event.type === EventType.FUNCTION_CALL && !event.native) {
      const callLine = event.sourceLocation?.line
      if (!callLine) continue

      const range = fnRanges[event.functionName]
      const color = CALL_COLORS[colorIdx % CALL_COLORS.length]
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

      steps.push({
        title:       `${event.functionName}(${argStr})`,
        code:        source,
        explanation: `Line ${callLine} calls ${event.functionName}(${argStr}).${
          range
            ? ` Execution enters the function body at line ${range.startLine}.`
            : ' (definition not found in this file)'
        }`,
        active,
        connections,
        outputSoFar:   snap(),
        stackSnapshot: event.stackSnapshot ?? [],
      })
    }

    // ── Function return ──────────────────────────────────────────────────────
    if (event.type === EventType.FUNCTION_RETURN && !event.native) {
      const callLine = event.sourceLocation?.line
      if (!callLine) continue

      const retStr = displayVal(event.returnValue)

      steps.push({
        title:       `↩ ${event.functionName} → ${retStr}`,
        code:        source,
        explanation: `${event.functionName} returns ${retStr}. Control hands back to line ${callLine}.`,
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
