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

// ── Concept Glossary ──────────────────────────────────────────────────────────
// Central definitions for every concept badge. Render these in a popover when
// the user clicks a concept badge in EventCard or ExplainHero.

export const CONCEPT_GLOSSARY = {
  'Call Stack': {
    tldr: 'The list of functions currently being executed, stacked from oldest to newest.',
    detail: 'Every time you call a function, JavaScript pushes a new "frame" onto the call stack containing that function\'s local variables and the address to return to. When the function finishes, its frame is popped and execution resumes at the call site. The stack has a finite depth — deeply recursive programs can overflow it.',
    analogy: 'Think of it like a stack of plates: you add to the top, you remove from the top.',
    sicp: 'SICP §3.2 — The Environment Model of Evaluation',
  },
  'Scope': {
    tldr: 'The region of code where a variable exists and is accessible.',
    detail: '`let` and `const` are block-scoped — they live only inside the nearest `{ }` braces. `var` is function-scoped — it exists from the top of the enclosing function even before the declaration line. Inner scopes can read variables from outer scopes, but not the other way around.',
    analogy: 'Think of nested rooms: you can see out, but people outside can\'t see in.',
    sicp: 'SICP §1.3.2 — Constructing Procedures Using Lambda',
  },
  'Scope / Mutation': {
    tldr: 'A variable\'s value changed — the update happened in the scope that owns it.',
    detail: 'Assignment walks the scope chain outward to find the nearest enclosing scope that declared the variable, then updates it there. If the variable doesn\'t exist in any enclosing scope (and you\'re not in strict mode), a global variable is implicitly created — a common source of bugs.',
    analogy: 'Like editing a shared document — whoever owns the original copy gets the update.',
    sicp: 'SICP §3.1 — Local State Variables',
  },
  'Heap / References': {
    tldr: 'Objects live in heap memory. Variables hold references (pointers) to them, not copies.',
    detail: 'When you write `new Foo()`, `[]`, or `{}`, JavaScript allocates memory on the heap and gives your variable a reference — an arrow pointing to that memory. The variable doesn\'t contain the object itself. This is why `const a = []; a.push(1)` is legal: you\'re mutating the heap object, not rebinding `a`.',
    analogy: 'A variable holding an object is like a sticky note with an address on it. Copying the note doesn\'t copy the house.',
    sicp: 'SICP §3.3 — Modeling with Mutable Data',
  },
  'Shared References': {
    tldr: 'Multiple variables point to the same object. Mutating it through any one of them changes it for all.',
    detail: 'When you assign an object from one variable to another (`b = a`), you copy the reference — now both `a` and `b` point to the same heap object. Mutating through `b` (e.g. `b.x = 5`) is immediately visible via `a.x` too, because there is only one object.',
    analogy: 'Two people with keys to the same house. One redecorates — both see the change.',
    sicp: 'SICP §3.3.1 — Mutable List Structure',
  },
  'Garbage Collection': {
    tldr: 'Heap objects are automatically freed when nothing holds a reference to them.',
    detail: 'JavaScript uses a garbage collector that periodically scans for objects with no reachable references and reclaims their memory. You don\'t call `free()` — but you can cause memory leaks by accidentally keeping references alive (e.g., in closures, event listeners, or global caches).',
    analogy: 'Like a librarian who returns books to the shelf when no one has a checkout slip for them.',
    sicp: 'SICP §3.3 — Modeling with Mutable Data (storage allocation)',
  },
  'Control Flow': {
    tldr: 'The order in which statements execute — branches, loops, and function calls all alter it.',
    detail: 'By default code runs top to bottom. `if/else` selects a branch based on a condition. `while`/`for` repeat a block. `return` exits a function early. `throw` unwinds the stack to the nearest `catch`. Understanding control flow means being able to trace *exactly* which lines run in what order for a given input.',
    analogy: 'Like a train switchyard: the condition is the switch lever, the branches are different tracks.',
    sicp: 'SICP §1.1.6 — Conditional Expressions and Predicates',
  },
  'Iteration / Complexity': {
    tldr: 'Each loop iteration is work. Count them to understand time complexity.',
    detail: 'A single loop over `n` elements is O(n). A loop inside a loop is O(n²). Every iteration you see in the event stream is a unit of real work. If a function with n=100 shows 10,000 events, you\'re likely looking at O(n²) behavior. This is how you *see* complexity — not just reason about it abstractly.',
    analogy: 'Each iteration is a step on a hike. More steps = more time.',
    sicp: 'SICP §1.2.1 — Linear Recursion and Iteration',
  },
  'Error Propagation': {
    tldr: 'A thrown error unwinds the call stack until a `catch` block handles it.',
    detail: 'When an error is thrown, JavaScript abandons the current function and pops its frame, then abandons the caller, etc. — until it finds a `try/catch`. Each popped frame is gone (no partial results saved). If no `catch` is found, the program terminates with an uncaught exception.',
    analogy: 'Like a fire alarm: everyone leaves the building floor by floor until someone pulls the fire hose.',
    sicp: 'SICP §4.1 — The Metacircular Evaluator (error handling in evaluators)',
  },
  'Lexical Scope': {
    tldr: 'Where a variable is visible is determined by where it\'s written in the source code — not where it\'s called from.',
    detail: 'In a lexically scoped language (like JavaScript), a function "closes over" the variables in the scope where it was *defined*, not where it\'s *invoked*. This is the foundation of closures: inner functions can access outer variables even after the outer function has returned.',
    analogy: 'A function is like a backpack: it carries the variables from the room where it was packed, no matter where you open it.',
    sicp: 'SICP §3.2 — The Environment Model',
  },
}

// ── Explanation templates ──────────────────────────────────────────────────────
// Each receives the event and returns { summary, why, concept }.

export const EXPLAIN = {
  [EventType.PROGRAM_START]: () => ({
    summary: 'Program execution begins',
    why: 'The JavaScript engine has parsed your code into an Abstract Syntax Tree and is now starting to walk it. The global scope is created first — all `var` declarations in your code are hoisted to this scope before any line runs.',
    concept: 'Lexical Scope',
  }),

  [EventType.PROGRAM_END]: (e) => ({
    summary: e?.error
      ? `Program ended with an uncaught error: ${e.error.type}`
      : 'Program execution complete',
    why: e?.error
      ? 'An exception was thrown and no catch block handled it. The call stack was fully unwound.'
      : 'All top-level statements have been executed. The global scope is now fully resolved.',
    concept: 'Control Flow',
  }),

  [EventType.FUNCTION_CALL]: (e) => {
    const argc = e.args?.length ?? 0
    const argStr = argc === 0
      ? 'no arguments'
      : argc === 1
        ? `1 argument${e.args?.[0] !== undefined ? ` (${JSON.stringify(e.args[0])})` : ''}`
        : `${argc} arguments (${e.args?.map(a => JSON.stringify(a)).join(', ')})`
    return {
      summary: `Calling \`${e.functionName}\` with ${argStr}`,
      why: `A new stack frame is pushed for \`${e.functionName}\`. Its local variables (parameters + any \`let\`/\`const\`/\`var\` inside it) will live in this frame. When \`${e.functionName}\` returns, the frame is destroyed and those variables are gone.`,
      concept: 'Call Stack',
    }
  },

  [EventType.FUNCTION_RETURN]: (e) => {
    const retStr = JSON.stringify(e.returnValue)
    const isUndef = e.returnValue === undefined
    return {
      summary: `\`${e.functionName}\` returns ${isUndef ? 'undefined (no explicit return)' : retStr}`,
      why: `The frame for \`${e.functionName}\` is popped from the call stack. Execution resumes at the call site — the return value \`${isUndef ? 'undefined' : retStr}\` becomes the result of the call expression, continuing the computation that was waiting.`,
      concept: 'Call Stack',
    }
  },

  [EventType.VARIABLE_DECLARE]: (e) => ({
    summary: `Declare \`${e.name}\` = ${JSON.stringify(e.value)}`,
    why: e.kind === 'var'
      ? '`var` is hoisted to the nearest **function** scope — it already existed (as `undefined`) from the very top of the function. This line just assigns the value. Hoisting is a common source of surprising bugs; prefer `let` or `const`.'
      : `\`${e.kind}\` is **block-scoped** — it only exists inside the nearest \`{ }\` block. If this is inside a loop, each iteration gets its own fresh binding.`,
    concept: 'Scope',
  }),

  [EventType.VARIABLE_ASSIGN]: (e) => ({
    summary: `\`${e.name}\` changes from ${JSON.stringify(e.oldValue)} → ${JSON.stringify(e.newValue)}`,
    why: `JavaScript walks the scope chain outward to find the nearest scope that owns \`${e.name}\`, then updates it there. Every other variable or closure referencing \`${e.name}\` in that scope will now see the new value.`,
    concept: 'Scope / Mutation',
  }),

  [EventType.OBJECT_CREATE]: (e) => ({
    summary: `New ${e.objectType} allocated on the heap (id: ${e.objectId})`,
    why: `Objects live on the heap, not the stack. The variable doesn't hold the object — it holds a **reference** (an arrow pointing to it). Copying the variable copies only the arrow. Both the original and the copy point to the same object in memory.`,
    concept: 'Heap / References',
  }),

  [EventType.OBJECT_MUTATE]: (e) => ({
    summary: `Heap object ${e.objectId}: \`${e.property}\` ${JSON.stringify(e.oldValue)} → ${JSON.stringify(e.newValue)}`,
    why: `All variables holding a reference to object #${e.objectId} see this change immediately — there is only one copy on the heap. This is why mutating an object that was "passed" to a function also changes it in the caller.`,
    concept: 'Shared References',
  }),

  [EventType.OBJECT_GC]: (e) => ({
    summary: `Object ${e.objectId} collected (no more references)`,
    why: 'When nothing points to an object it becomes unreachable — no code can ever access it again. The garbage collector reclaims the memory. This happens automatically; you don\'t need to free memory manually in JavaScript.',
    concept: 'Garbage Collection',
  }),

  [EventType.CONDITIONAL_BRANCH]: (e) => {
    const condPart = e.conditionResult !== undefined && e.condition
      ? `\`${e.condition}\` → \`${JSON.stringify(e.conditionResult)}\` → ${e.result}`
      : `\`${e.condition}\` is ${e.result}`
    return {
      summary: `${condPart} → taking the ${e.branch} branch`,
      why: `Only the **${e.branch}** branch will execute. The ${e.branch === 'then' ? 'else' : 'then'} branch is skipped entirely — those lines don't run at all. This is how programs make decisions based on runtime data.`,
      concept: 'Control Flow',
    }
  },

  [EventType.LOOP_ITERATION]: (e) => {
    const ordinal = e.iteration === 1 ? '1st' : e.iteration === 2 ? '2nd' : e.iteration === 3 ? '3rd' : `${e.iteration}th`
    return {
      summary: `Loop iteration ${e.iteration} (${e.loopType})`,
      why: `This is the ${ordinal} time through the loop body — the loop condition was truthy ${e.iteration} time${e.iteration > 1 ? 's' : ''}. Each iteration is a unit of work: if you see many iterations, the loop's cost grows with input size. That's what O(n) means in practice.`,
      concept: 'Iteration / Complexity',
    }
  },

  [EventType.ERROR_THROWN]: (e) => ({
    summary: `${e.errorType}: ${e.message}`,
    why: 'An exception starts unwinding the call stack — abandoning each function frame one by one until a matching `catch` block is found. If no handler exists, the program terminates. Frames are not restored; any work done inside them is lost.',
    concept: 'Error Propagation',
  }),

  [EventType.ERROR_CAUGHT]: (e) => ({
    summary: `Error caught: ${e.errorType ?? 'Error'}`,
    why: 'A `catch` block intercepted the error before it could terminate the program. Execution now continues normally from inside the `catch` block. The call stack has been partially unwound to this point.',
    concept: 'Error Propagation',
  }),

  [EventType.SCOPE_ENTER]: (e) => ({
    summary: `New block scope opened (id: ${e.scopeId})`,
    why: 'A `{ }` block was entered. Any variables declared with `let` or `const` inside this block are born here and will be destroyed when the block closes. `var` ignores this boundary and hoists to the function instead.',
    concept: 'Lexical Scope',
  }),

  [EventType.SCOPE_EXIT]: (e) => ({
    summary: `Block scope ${e.scopeId} closed`,
    why: 'The `{ }` block has finished executing. Any `let` or `const` variables declared inside are now out of scope — they no longer exist and cannot be accessed. Their memory can be reclaimed.',
    concept: 'Lexical Scope',
  }),
}
