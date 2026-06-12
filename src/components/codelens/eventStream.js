// Event Stream — the data contract between the Interpreter and everything that consumes execution.
// Append-only and immutable once generated. The Interpreter produces it; Renderer and Analyzer consume it.

export const EventType = {
  PROGRAM_START:      'program_start',
  STATEMENT_ENTER:    'statement_enter',
  STATEMENT_EXIT:     'statement_exit',
  FUNCTION_CALL:      'function_call',
  FUNCTION_RETURN:    'function_return',
  VARIABLE_DECLARE:   'variable_declare',
  VARIABLE_ASSIGN:    'variable_assign',
  OBJECT_CREATE:      'object_create',
  OBJECT_MUTATE:      'object_mutate',
  OBJECT_GC:          'object_gc',
  SCOPE_ENTER:        'scope_enter',
  SCOPE_EXIT:         'scope_exit',
  CONDITIONAL_BRANCH: 'conditional_branch',
  LOOP_ITERATION:     'loop_iteration',
  ERROR_THROWN:       'error_thrown',
  ERROR_CAUGHT:       'error_caught',
  PROGRAM_END:        'program_end',
}

// Every event has this envelope. Specific event types extend it via `payload`.
export function makeEvent(type, stepId, sourceLocation, stackSnapshot, heapDelta, payload = {}) {
  return {
    stepId,
    type,
    sourceLocation,   // { file, line, column, astNodeId }
    stackSnapshot,    // array of frame descriptors at this moment
    heapDelta,        // { created: [], mutated: [], freed: [] }
    timestamp: Date.now(),
    operationCount: stepId,
    ...payload,
  }
}

// Explanation templates keyed by event type.
// Each receives the event and returns { summary, why, concept }.
export const EXPLAIN = {
  [EventType.FUNCTION_CALL]: (e) => ({
    summary: `Calling \`${e.functionName}\` with ${e.args?.length ?? 0} argument${e.args?.length === 1 ? '' : 's'}`,
    why: 'A new frame is pushed onto the call stack. Local variables for this call live inside that frame and are destroyed when the function returns.',
    concept: 'Call Stack',
  }),
  [EventType.FUNCTION_RETURN]: (e) => ({
    summary: `\`${e.functionName}\` returns ${JSON.stringify(e.returnValue)}`,
    why: 'The frame is popped from the call stack. Execution resumes at the call site.',
    concept: 'Call Stack',
  }),
  [EventType.VARIABLE_DECLARE]: (e) => ({
    summary: `Declare \`${e.name}\` = ${JSON.stringify(e.value)}`,
    why: e.kind === 'var'
      ? '`var` is hoisted to the nearest function scope — it exists from the top of the function even before this line.'
      : `\`${e.kind}\` is block-scoped — it only exists inside the nearest { } block.`,
    concept: 'Scope',
  }),
  [EventType.VARIABLE_ASSIGN]: (e) => ({
    summary: `\`${e.name}\` changes from ${JSON.stringify(e.oldValue)} → ${JSON.stringify(e.newValue)}`,
    why: 'The binding in the current scope (or the nearest enclosing scope that owns it) is updated.',
    concept: 'Scope / Mutation',
  }),
  [EventType.OBJECT_CREATE]: (e) => ({
    summary: `New ${e.objectType} allocated on the heap (id: ${e.objectId})`,
    why: 'Objects live on the heap, not the stack. Variables hold references (arrows) to them, not copies.',
    concept: 'Heap / References',
  }),
  [EventType.OBJECT_MUTATE]: (e) => ({
    summary: `Heap object ${e.objectId}: \`${e.property}\` ${JSON.stringify(e.oldValue)} → ${JSON.stringify(e.newValue)}`,
    why: 'All variables holding a reference to this object see the change immediately — there is only one copy.',
    concept: 'Shared References',
  }),
  [EventType.OBJECT_GC]: (e) => ({
    summary: `Object ${e.objectId} collected (no more references)`,
    why: 'When nothing points to an object it becomes unreachable. Memory is reclaimed.',
    concept: 'Garbage Collection',
  }),
  [EventType.CONDITIONAL_BRANCH]: (e) => ({
    summary: `Condition \`${e.condition}\` is ${e.result} → ${e.branch} branch`,
    why: 'Only the matching branch executes. The other branch is skipped entirely.',
    concept: 'Control Flow',
  }),
  [EventType.LOOP_ITERATION]: (e) => ({
    summary: `Loop iteration ${e.iteration} (${e.loopType})`,
    why: `Each iteration re-evaluates the condition. This is iteration ${e.iteration}, so at least ${e.iteration} operation${e.iteration === 1 ? '' : 's'} have occurred here.`,
    concept: 'Iteration / Complexity',
  }),
  [EventType.ERROR_THROWN]: (e) => ({
    summary: `${e.errorType}: ${e.message}`,
    why: 'An exception unwinds the call stack until a matching catch block is found, or the program terminates.',
    concept: 'Error Propagation',
  }),
  [EventType.SCOPE_ENTER]: (e) => ({
    summary: `New scope opened (id: ${e.scopeId})`,
    why: 'Variables declared inside this block are only visible within it.',
    concept: 'Lexical Scope',
  }),
  [EventType.SCOPE_EXIT]: (e) => ({
    summary: `Scope ${e.scopeId} closed`,
    why: 'Block-scoped variables declared inside are now unreachable.',
    concept: 'Lexical Scope',
  }),
}
