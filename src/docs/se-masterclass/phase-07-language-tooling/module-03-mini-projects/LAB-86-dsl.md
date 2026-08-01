# SE Masterclass — LAB-86 — DSL

**Prerequisites:** LAB-85 (Template Engine)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What makes a language "domain-specific" as opposed to general-purpose?
2. Why does a task-runner DSL need only a tiny fraction of Nano's grammar (LAB-80–83) to be useful?
3. What's the risk of designing a DSL's grammar before writing any example programs in it?

## What You Will Build

**TaskLang** — a tiny domain-specific language for defining build/task pipelines, purpose-built for exactly one job: describing tasks and their dependencies, then running them in the right order.

```
task build {
  run "compiling..."
}

task test depends build {
  run "running tests..."
}

task deploy depends test {
  run "deploying..."
}
```

Running this program executes `build`, then `test`, then `deploy` — in dependency order, each only once, even if multiple tasks depend on the same one.

## Concept: DSL Design — Purpose-Built Languages

**What it is:** A domain-specific language is a small language designed to express one narrow kind of problem extremely well, at the cost of being useless for anything else. Nano (LAB-80–84) is general-purpose — it has arithmetic, functions, loops, closures, because it needs to express *arbitrary* computation. TaskLang has none of that; it has exactly the vocabulary a build pipeline needs (`task`, `depends`, `run`) and nothing more.

**The problem before:** Every real build tool (Make, npm scripts, CMake, Bazel) reinvents some version of "declare named units of work, some of which depend on others, then run them in dependency order." Nano's full grammar (functions, closures, arithmetic) would be massive overkill for expressing that — most of it would go unused, and users would have to learn a general-purpose language's entire surface area to write what's fundamentally a dependency list. LAB-14/15 (Phase 1) already built the *algorithm* for this (topological sort, scheduling) — what's missing is a language for humans to *declare* the graph in, instead of writing it as a JS object literal by hand.

**The solution:** Design the grammar by writing example programs first (the "What You Will Build" block above, written before a single line of lexer code), then build exactly the lexer/parser/interpreter needed to run those examples — reusing LAB-80's tokenizer technique and LAB-82's recursive descent technique, but with a grammar of maybe five rules instead of Nano's twenty. The interpreter, rather than tree-walking arbitrary expressions, does one very specific thing: build a dependency graph from parsed `task` declarations and run it with LAB-14's topological sort.

**Canonical example:**

```typescript
interface TaskNode { name: string; dependsOn: string[]; commands: string[] }

function interpretTaskLang(tasks: TaskNode[]): void {
  const order = topologicalSort(tasks) // reuses LAB-14's algorithm directly
  for (const taskName of order) runTask(tasks.find(t => t.name === taskName)!)
}
```

**Project Application:** LAB-87's compiler reuses TaskLang's lexer/parser shape (small, purpose-built grammar) but targets JavaScript output instead of direct execution — the two labs are siblings, both about small custom languages, one interpreted and one compiled.

**Watch for:** Designing more grammar than the domain needs "just in case." A DSL that grows arithmetic expressions, string concatenation, and conditionals to become "more flexible" has quietly turned back into a general-purpose language — at which point Nano itself should be used instead of a bespoke DSL nobody asked for.

## Step 1: Designing the grammar from examples, not the other way around

```
program     := task*
task        := "task" IDENTIFIER ("depends" IDENTIFIER)? "{" run* "}"
run         := "run" STRING
```

Three rules. That's the entire grammar, and it was derived by looking at the three example tasks in "What You Will Build" and asking "what's the minimum structure that describes exactly this?" — not by imagining every feature a build tool *could* have. `depends` only supports one dependency per task in this grammar deliberately — the Challenge extends it to multiple.

### SAVE AND TRY

Write two more example TaskLang programs by hand (on paper or in a comment) *before* writing any code — one with three chained dependencies, one with a task that has no `run` commands at all. If either example doesn't fit the three-rule grammar above, that's a signal to revisit the grammar now, while it costs nothing, rather than after a lexer and parser are already built around it.

## Step 2: Lexer and AST — smaller than Nano's, same technique

```typescript
type TaskToken =
  | { type: "TASK" } | { type: "DEPENDS" } | { type: "RUN" }
  | { type: "IDENTIFIER"; value: string } | { type: "STRING"; value: string }
  | { type: "LBRACE" } | { type: "RBRACE" } | { type: "EOF" }

function tokenizeTaskLang(source: string): TaskToken[] {
  const tokens: TaskToken[] = []
  const keywordMap: Record<string, TaskToken["type"]> = { task: "TASK", depends: "DEPENDS", run: "RUN" }
  const wordPattern = /[a-zA-Z_][a-zA-Z0-9_]*/y
  const stringPattern = /"([^"]*)"/y
  let pos = 0

  while (pos < source.length) {
    const ch = source[pos]
    if (/\s/.test(ch)) { pos++; continue }
    if (ch === "{") { tokens.push({ type: "LBRACE" }); pos++; continue }
    if (ch === "}") { tokens.push({ type: "RBRACE" }); pos++; continue }

    stringPattern.lastIndex = pos
    const stringMatch = stringPattern.exec(source)
    if (stringMatch && stringMatch.index === pos) {
      tokens.push({ type: "STRING", value: stringMatch[1] })
      pos = stringPattern.lastIndex
      continue
    }

    wordPattern.lastIndex = pos
    const wordMatch = wordPattern.exec(source)
    if (wordMatch && wordMatch.index === pos) {
      const word = wordMatch[0]
      tokens.push(keywordMap[word] ? { type: keywordMap[word] } : { type: "IDENTIFIER", value: word })
      pos = wordMatch[0].length + pos
      continue
    }

    throw new Error(`Unexpected character '${ch}'`)
  }
  tokens.push({ type: "EOF" })
  return tokens
}
```

Sticky regexes (`/y` flag, anchored at `lastIndex`) do the same "classify a run of characters" job LAB-80's hand-rolled `isDigit`/`isAlpha` loops did — a legitimate shortcut here specifically *because* TaskLang's token shapes are simple enough that regex won't run into the ambiguity problems LAB-80 warned about with multi-character operators (TaskLang has no `==` vs `=` to disambiguate).

### SAVE AND TRY

```typescript
console.log(tokenizeTaskLang('task build { run "compiling..." }').map(t => t.type))
// ["TASK", "IDENTIFIER", "LBRACE", "RUN", "STRING", "RBRACE", "EOF"]
```

## Step 3: Recursive descent parser for the three-rule grammar

```typescript
interface TaskDeclaration { name: string; dependsOn: string | null; commands: string[] }

function parseTaskLang(tokens: TaskToken[]): TaskDeclaration[] {
  let pos = 0
  const tasks: TaskDeclaration[] = []

  function expect<T extends TaskToken["type"]>(type: T): Extract<TaskToken, { type: T }> {
    if (tokens[pos].type !== type) throw new Error(`Expected ${type}, got ${tokens[pos].type}`)
    return tokens[pos++] as Extract<TaskToken, { type: T }>
  }

  while (tokens[pos].type !== "EOF") {
    expect("TASK")
    const name = expect("IDENTIFIER").value

    let dependsOn: string | null = null
    if (tokens[pos].type === "DEPENDS") { pos++; dependsOn = expect("IDENTIFIER").value }

    expect("LBRACE")
    const commands: string[] = []
    while (tokens[pos].type !== "RBRACE") {
      expect("RUN")
      commands.push(expect("STRING").value)
    }
    expect("RBRACE")

    tasks.push({ name, dependsOn, commands })
  }
  return tasks
}
```

This is the same `expect`/cursor pattern LAB-82's `Parser` class used, shrunk to match a three-rule grammar instead of Nano's twelve statement/expression kinds — proof that recursive descent scales *down* just as naturally as it scales up: the technique doesn't care how big the grammar is.

### SAVE AND TRY

```typescript
const source = `
  task build { run "compiling..." }
  task test depends build { run "running tests..." }
`
const tasks = parseTaskLang(tokenizeTaskLang(source))
console.log(tasks)
// [{ name: "build", dependsOn: null, commands: ["compiling..."] },
//  { name: "test", dependsOn: "build", commands: ["running tests..."] }]
```

## Step 4: Interpreting via LAB-14's dependency graph

```typescript
function runTaskLang(tasks: TaskDeclaration[]): void {
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const taskMap = new Map(tasks.map(t => [t.name, t]))

  function run(name: string) {
    if (visited.has(name)) return
    if (visiting.has(name)) throw new Error(`Circular dependency detected at '${name}'`)
    visiting.add(name)

    const task = taskMap.get(name)
    if (!task) throw new Error(`Unknown task '${name}'`)
    if (task.dependsOn) run(task.dependsOn) // depth-first: dependency runs before dependent

    visiting.delete(name)
    visited.add(name)

    for (const command of task.commands) console.log(`[${name}] ${command}`)
  }

  for (const task of tasks) run(task.name)
}
```

`visited`/`visiting` is LAB-14's cycle-detection pattern reused directly — a task currently being resolved (`visiting`) that gets asked to resolve itself again means a cycle, exactly the same check LAB-14 used for dependency graphs and LAB-79 reused for pathfinding's visited-set. TaskLang's "interpreter" isn't a general `evaluate` function like LAB-83's — it's this one specific, purpose-built traversal, because that's the *only* thing TaskLang programs ever need to do: run tasks in dependency order.

### SAVE AND TRY

Run `runTaskLang` on the full three-task example from "What You Will Build." Output should show `build`'s command first, then `test`'s, then `deploy`'s — each exactly once — confirming the dependency order was respected even though the source declared them in the same top-to-bottom order they happened to run in (try reordering the declarations in the source to confirm execution order still follows dependencies, not declaration order).

## 🎯 Challenge

Extend the grammar to support multiple dependencies per task (`task deploy depends build, test { ... }`) instead of just one, updating the lexer (add a `COMMA` token), parser (`dependsOn: string[]` instead of `string | null`), and interpreter (`for (const dep of task.dependsOn) run(dep)` instead of a single `run(task.dependsOn)` call).

<details>
<summary>Solution</summary>

```typescript
// Lexer: add comma handling
// if (ch === ",") { tokens.push({ type: "COMMA" }); pos++; continue }

interface TaskDeclaration { name: string; dependsOn: string[]; commands: string[] }

// Parser: replace the single-dependency block with:
const dependsOn: string[] = []
if (tokens[pos].type === "DEPENDS") {
  pos++
  dependsOn.push(expect("IDENTIFIER").value)
  while (tokens[pos].type === "COMMA") { pos++; dependsOn.push(expect("IDENTIFIER").value) }
}

// Interpreter: replace `if (task.dependsOn) run(task.dependsOn)` with:
for (const dep of task.dependsOn) run(dep)
```

The `while (tokens[pos].type === "COMMA")` loop is the same "loop while a separator token is present" pattern LAB-82's `parseCallExpression` used for comma-separated function arguments — a small, reusable parsing idiom for "zero or more, comma-separated."

</details>

## Mental Model

| Concept | Nano (general-purpose) | TaskLang (domain-specific) |
|---|---|---|
| Grammar size | ~20 statement/expression kinds | 3 rules |
| What it can express | Arbitrary computation | Exactly one thing: task dependency graphs |
| "Interpreter" | Generic `evaluate`/`execute` over any AST shape | One purpose-built traversal (topological run) |
| Design starting point | A grammar spec | Example programs, written first |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does TaskLang's grammar have only 3 rules while Nano's has around 20? | |
| 2 | Why write example TaskLang programs before designing its grammar? | |
| 3 | What would be the sign that a DSL has grown too big and should just be Nano instead? | |

## Quick Check Answers

1. A domain-specific language is scoped to express one narrow kind of problem well, deliberately omitting everything not needed for that domain — unlike a general-purpose language, which must be able to express arbitrary computation.
2. Because a build pipeline only ever needs to declare named units of work and their dependencies — none of Nano's arithmetic, closures, or loops are relevant to that one job, so a minimal purpose-built grammar covers 100% of the domain's needs with far less surface area to learn.
3. Designing the grammar first risks inventing rules for cases that don't actually occur in real usage, or missing a rule a real case needs — writing concrete examples first grounds every grammar rule in an actual requirement.

*Next: [LAB-87 — Compiler](LAB-87-compiler.md)*
