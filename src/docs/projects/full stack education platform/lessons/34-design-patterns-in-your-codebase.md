# Lesson 34 — Design Patterns in Your Codebase

## What You Will Build

Identify and name the design patterns already present in the codebase, then implement
two new patterns where they solve real problems: the **strategy pattern** for swappable
code execution backends (JavaScript, Python via Pyodide), and the **command pattern**
for a redo-able editor history. Naming patterns is not academic — it is the vocabulary
for code reviews, architecture discussions, and hiring interviews.

---

## What You Need to Know First

- Lesson 07: Monaco editor, `useRef`
- Lesson 09: Sandbox runner, code execution
- Lesson 08: `useReducer`, actions

---

## The Lesson

### Step 1 — Patterns Already in Your Codebase

Before introducing new patterns, name what is already present. This exercise makes
the existing code more legible and the naming precise.

**Observer (Lesson 03 and 08):**
React state is the observer pattern: components subscribe to state changes and re-render
when the state updates. `useContext` is an observable — the context value is the subject;
components are observers. When the value changes, React notifies all observers.

**Adapter (Lesson 07):**
`CodeEditor` wraps Monaco's imperative API (`editor.getValue()`, `editor.setValue()`)
into React's declarative props interface. The adapter converts one interface (Monaco's
event-based API) to another (React's controlled component pattern). This is the textbook
adapter pattern.

**Repository (Lesson 12 and 13):**
`lessonRepository.ts` and `progressRepository.ts` abstract database access. The route
handlers call `getLessonById(id)`, not `prisma.lesson.findUnique(...)`. If the ORM
changes, route handlers are unaffected. This is the repository pattern.

**Middleware chain / Chain of Responsibility (Lesson 11 and 18):**
Express middleware chain: each middleware decides whether to handle the request or pass
it to `next()`. `authenticate`, `requireRole`, the route handler itself — a chain of
handlers. Each handler has one responsibility; the chain composes them.

**Factory (Lesson 09):**
`createSandboxRunner()` creates and returns a runner object. The caller does not know
how the runner is constructed. The function is a factory — it creates objects.

### Step 2 — Strategy Pattern: Swappable Execution Backends

**The problem:**
The current sandbox runner executes only JavaScript. The app should support Python
(via Pyodide — Python compiled to WebAssembly) and potentially TypeScript (via
compilation to JavaScript). Each language requires a different execution mechanism,
but the lesson engine should not care which language it is running.

**The strategy pattern:** Define an interface; swap the implementation at runtime.

```typescript
// The interface — the strategy contract
interface ExecutionStrategy {
  readonly language: string
  run(code: string): Promise<ExecutionResult>
  cleanup(): void
}

// Strategy 1: JavaScript sandbox (existing)
export class JavaScriptStrategy implements ExecutionStrategy {
  readonly language = 'javascript'
  private runner = createSandboxRunner()

  async run(code: string): Promise<ExecutionResult> {
    return this.runner.run(code)
  }

  cleanup(): void {
    this.runner.cleanup()
  }
}

// Strategy 2: Python via Pyodide (WebAssembly)
export class PythonStrategy implements ExecutionStrategy {
  readonly language = 'python'
  private pyodide: any = null

  async run(code: string): Promise<ExecutionResult> {
    if (this.pyodide === null) {
      const { loadPyodide } = await import('pyodide')
      this.pyodide = await loadPyodide()
    }

    const stdout: string[] = []
    this.pyodide.setStdout({ batched: (text: string) => stdout.push(text) })

    try {
      await this.pyodide.runPythonAsync(code)
      return { stdout, stderr: [], error: null }
    } catch (e) {
      return { stdout: [], stderr: [], error: String(e) }
    }
  }

  cleanup(): void {
    this.pyodide = null
  }
}

// The context — selects and uses a strategy
const strategies: Map<string, ExecutionStrategy> = new Map([
  ['javascript', new JavaScriptStrategy()],
  ['python', new PythonStrategy()],
])

function getStrategy(language: string): ExecutionStrategy {
  const strategy = strategies.get(language)
  if (strategy === undefined) {
    throw new Error(`Unsupported language: ${language}`)
  }
  return strategy
}
```

**The lesson engine change:**
```typescript
async function handleRun() {
  const strategy = getStrategy(lesson.language)
  const result = await strategy.run(currentCode)
  // ...
}
```

**CS lens — open/closed principle:**
Adding Python support required no changes to `LessonEngine` or `checkOutput`. A new
strategy was registered. The engine is **open for extension** (new languages) and
**closed for modification** (no changes to existing code). This is the open/closed
principle in action.

**SE lens — dependency inversion:**
`LessonEngine` depends on `ExecutionStrategy` (an interface), not on `JavaScriptStrategy`
(a concrete class). The concrete implementation is injected via the `strategies` map.
High-level modules do not depend on low-level modules; both depend on abstractions.

### Step 3 — Command Pattern: Editor History

**The problem:**
The Monaco editor has built-in undo (Ctrl+Z). But the app also makes programmatic
changes (inserting hint code, resetting to starter code, auto-completing brackets).
These programmatic changes should be undoable and should integrate with the edit history.

**The command pattern:** Encapsulate each operation as an object with `execute()` and
`undo()` methods. A history stack of commands enables arbitrary undo.

```typescript
interface EditorCommand {
  execute(): void
  undo(): void
  readonly description: string
}

class InsertTextCommand implements EditorCommand {
  private previousValue: string = ''
  readonly description: string

  constructor(
    private readonly editor: monaco.editor.IStandaloneCodeEditor,
    private readonly text: string,
    private readonly position: monaco.Position,
  ) {
    this.description = `Insert: ${text.slice(0, 20)}`
  }

  execute(): void {
    this.previousValue = this.editor.getValue()
    const range = new monaco.Range(
      this.position.lineNumber,
      this.position.column,
      this.position.lineNumber,
      this.position.column,
    )
    this.editor.executeEdits('command', [{ range, text: this.text }])
  }

  undo(): void {
    this.editor.setValue(this.previousValue)
  }
}

class ResetToStarterCommand implements EditorCommand {
  private previousValue: string = ''
  readonly description = 'Reset to starter code'

  constructor(
    private readonly editor: monaco.editor.IStandaloneCodeEditor,
    private readonly starterCode: string,
  ) {}

  execute(): void {
    this.previousValue = this.editor.getValue()
    this.editor.setValue(this.starterCode)
  }

  undo(): void {
    this.editor.setValue(this.previousValue)
  }
}

// Command history manager
class CommandHistory {
  private readonly history: EditorCommand[] = []
  private index = -1

  execute(command: EditorCommand): void {
    // Discard any future history (branching undo model)
    this.history.splice(this.index + 1)
    command.execute()
    this.history.push(command)
    this.index = this.history.length - 1
  }

  undo(): void {
    if (this.index < 0) return
    this.history[this.index]!.undo()
    this.index--
  }

  redo(): void {
    if (this.index >= this.history.length - 1) return
    this.index++
    this.history[this.index]!.execute()
  }
}
```

**CS lens — separation of operation from execution:**
The command pattern separates the *what* (the command object, which knows how to execute
and undo) from the *when* (the history manager, which decides when to execute and undo).
This same separation appears in task queues (the task is a command, the queue is the
history manager), database transactions (operations are queued, committed atomically), and
UI frameworks with action-reducer patterns (the action is the command, the reducer is
the executor).

**`useReducer` as the command pattern:**
The `useReducer` actions in Lesson 08 are commands: each action has a type (like a command
class) and a reducer that knows how to execute it. `dispatch({ type: 'RESET_LESSON' })` is
`commandHistory.execute(new ResetToStarterCommand(...))`. `useReducer` implements the command
pattern without the undo capability.

### Step 4 — Recognizing Patterns in Libraries

Understanding patterns makes library code readable:

**TanStack Query's `useQuery`** is the **proxy pattern**: it wraps an async data source
(a `queryFn`) and adds caching, loading state, error handling, and background refresh.
The component calls `useQuery` as if data is local; the proxy handles the complexity.

**Zod's `.safeParse()`** is the **decorator pattern**: it adds validation behavior to
a schema type without changing the schema's representation.

**React's `createContext` / `useContext`** is the **mediator pattern**: components
communicate through the context (the mediator) rather than directly. No component
holds a reference to another; all state flows through the shared context.

---

## Connect the Pieces

The strategy pattern here is the same as the repository pattern in Lesson 12. Both define
an interface and swap the implementation. The repository hides database access behind
an interface; the execution strategy hides the execution mechanism. The structural pattern
is identical — the domain differs.

The command history `index` pointer is the same data structure as the navigation stack
from Lesson 05. Both are stacks with a current-position pointer. The navigation stack
pops on "back"; the command history decrements the index on "undo" and discards future
history on "execute". The underlying abstraction is the same.

The `useReducer` action pattern from Lesson 08 is named "command pattern" here. Recognizing
that `useReducer` implements the command pattern (minus undo) helps explain why Redux uses
"actions" and why Redux DevTools can implement time-travel debugging: each dispatched action
is a command; the DevTools replay commands from any point in history.

---

## What Breaks Without This

Without the strategy pattern, adding Python support means modifying `LessonEngine` directly.
The condition grows: `if (lesson.language === 'javascript') { ... } else if (lesson.language === 'python') { ... }`. Every new language adds a branch. The file grows; the function
grows. The lesson engine is now aware of every execution backend. Adding TypeScript requires
another `else if`. This is the **switch statement problem** — a signal that the strategy
pattern is needed.

Without the command pattern, "Reset to starter code" cannot be undone. Users who accidentally
click "Reset" lose their work. Adding an undo for reset requires special-casing it with a
saved backup — the same ad-hoc approach that the command pattern eliminates generically.

---

## Definition of Done

- [ ] `JavaScriptStrategy` and `PythonStrategy` implement the same `ExecutionStrategy` interface
- [ ] The lesson engine selects the strategy based on `lesson.language`
- [ ] "Reset to starter code" is implemented as a command and can be undone (Ctrl+Z after reset restores the code)
- [ ] You can name the design patterns in `authenticate` middleware, `CodeEditor`, and `lessonRepository`
- [ ] You can answer: what is the strategy pattern and what problem does it solve?
- [ ] You can answer: what is the command pattern and what does it enable beyond a simple function call?
- [ ] You can answer: why is `useReducer` an implementation of the command pattern?
- [ ] You can answer: what is the open/closed principle and how does the strategy pattern demonstrate it?
- [ ] `git commit` with a message explaining why — "Add strategy pattern for multi-language execution and command pattern for editor history"
