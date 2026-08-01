# SE Masterclass — LAB-23 — Command System

**Language: TypeScript (Node.js)** — same module as LAB-21–22.

**Prerequisites:** LAB-13 (State Machine) and LAB-22 (Event Bus). This lab turns LAB-02's "functions are first-class values" idea up one level: not just a function, but a whole ACTION — with its own undo — becomes an object you can store, queue, log, and pass around.

**What this lab adds:**
- The Command pattern: wrapping an action as an OBJECT (`execute`/`undo`), not a direct function call
- Why this decouples "what to do" from "when/how many times to do it"
- A command history/log — commands as data you can inspect, replay, or reverse
- Composite commands: bundling several commands into one atomic unit
- The direct foundation LAB-24's undo/redo stack builds on

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Calling `editor.insertText("hi")` directly vs. creating `new InsertTextCommand(editor, "hi")` and calling `.execute()` on it — what can you do with the SECOND one that you can't do with the first?
> 2. A command object has `execute()` and `undo()`. What must be true about `undo()`'s effect, relative to `execute()`'s effect, for undo to actually work?
> 3. If you group 3 commands into a "macro" command, and the macro's `undo()` is called, what order should the 3 individual undos run in?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Direct Calls (no undo possible) ===
editor.insertText("Hello"): document is now "Hello"
editor.insertText(" World"): document is now "Hello World"
  ← no way to undo the second insert without manually knowing what to remove

=== Commands as Objects ===
InsertTextCommand.execute(): document is now "Hello"
InsertTextCommand.execute(): document is now "Hello World"
InsertTextCommand.undo(): document is now "Hello"
  ← undo correctly reverses exactly what execute() did

=== Command Invoker With History ===
invoker.run(InsertTextCommand("Hello")): document is now "Hello"
invoker.run(InsertTextCommand(" World")): document is now "Hello World"
invoker.run(DeleteLastCommand(6)): document is now "Hello"
history length: 3
invoker.undoLast(): document is now "Hello World"

=== Macro Command (batch as one unit) ===
macro.execute(): document is now "Hello World!!!"
macro.undo(): document is now ""
  ← all three sub-commands undone, in REVERSE order, as one atomic step

=== Command Log Replay ===
replaying 3 logged commands on a fresh document:
final replayed document: "Hello World"
  ← matches the original result exactly, reconstructed from the log alone
```

---

### Concept: An Action as an Object, Not a Function Call

**What it is:** The **Command pattern** wraps a request — "do this specific thing, to this specific target, with these specific arguments" — as an OBJECT with (at minimum) an `execute()` method, instead of just calling a function directly. Once it's an object, it can be stored, passed around, queued, logged, and (critically) paired with an `undo()`.

**The problem before:**

```ts
class TextEditor {
  document = ''
  insertText(text: string) { this.document += text }
}

const editor = new TextEditor()
editor.insertText('Hello')       // direct call — happened, and now there's no trace of it as a THING
editor.insertText(' World')      // another direct call — no way to "undo just this one"
```

Once `insertText` returns, there's no OBJECT representing "the insertion of ' World' that just happened" — undoing it means the caller has to separately remember what was inserted and manually write the reverse operation, error-prone and easy to forget.

**The solution:** Wrap the action itself as an object:

```ts
interface Command {
  execute(): void
  undo(): void
}

class InsertTextCommand implements Command {
  constructor(private editor: TextEditor, private text: string) {}
  execute(): void { this.editor.insertText(this.text) }
  undo(): void { this.editor.document = this.editor.document.slice(0, -this.text.length) }
}
```

**Canonical example (General Explanation):** Think of a restaurant order slip vs. shouting an order directly at the cook. A shouted order happens and vanishes — there's no way to "take back the last shout." An order slip is a physical OBJECT: it can be handed to a different cook, stapled into a log for the night's records, or crumpled up and thrown away (undone) before it's cooked. The Command pattern turns "shouted orders" into "order slips."

**Project Application (The "Why" here):** This is LAB-02's first-class functions taken further — a `Command` bundles a function-like ACTION together with its TARGET and its ARGUMENTS and its REVERSAL, as one coherent unit you can hand off to code that has no idea what a `TextEditor` even is.

---

## Step 1 — Feel the Problem: Direct Calls

```ts
// editor.ts
export class TextEditor {
  document = ''
  insertText(text: string): void {
    this.document += text
  }
}
```

```ts
// main.ts
import { TextEditor } from './editor'

console.log('=== Direct Calls (no undo possible) ===')
const editor = new TextEditor()
editor.insertText('Hello')
console.log(`editor.insertText("Hello"): document is now "${editor.document}"`)
editor.insertText(' World')
console.log(`editor.insertText(" World"): document is now "${editor.document}"`)
console.log('  ← no way to undo the second insert without manually knowing what to remove')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Direct Calls (no undo possible) ===
editor.insertText("Hello"): document is now "Hello"
editor.insertText(" World"): document is now "Hello World"
  ← no way to undo the second insert without manually knowing what to remove
```

---

## Step 2 — Wrap Actions as Command Objects

```ts
// commands.ts
import { TextEditor } from './editor'

export interface Command {
  execute(): void
  undo(): void
}

export class InsertTextCommand implements Command {
  constructor(private editor: TextEditor, private text: string) {}

  execute(): void {
    this.editor.insertText(this.text)
  }

  undo(): void {
    this.editor.document = this.editor.document.slice(0, -this.text.length)   // remove exactly what was added
  }
}
```

Add to `main.ts`:

```ts
import { InsertTextCommand } from './commands'

console.log('\n=== Commands as Objects ===')
const editor2 = new TextEditor()
const cmd1 = new InsertTextCommand(editor2, 'Hello')
cmd1.execute()
console.log(`InsertTextCommand.execute(): document is now "${editor2.document}"`)

const cmd2 = new InsertTextCommand(editor2, ' World')
cmd2.execute()
console.log(`InsertTextCommand.execute(): document is now "${editor2.document}"`)

cmd2.undo()
console.log(`InsertTextCommand.undo(): document is now "${editor2.document}"`)
console.log('  ← undo correctly reverses exactly what execute() did')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Commands as Objects ===
InsertTextCommand.execute(): document is now "Hello"
InsertTextCommand.execute(): document is now "Hello World"
InsertTextCommand.undo(): document is now "Hello"
  ← undo correctly reverses exactly what execute() did
```

**Confirm `cmd2` alone was undone, not `cmd1`:** Calling `cmd2.undo()` removed exactly the ` World` that `cmd2.execute()` had added, leaving `cmd1`'s `Hello` intact — because `cmd2` REMEMBERS its own `text` (`' World'`) as a private field, independent of `cmd1`'s state. Each command object is self-contained, exactly like LAB-19's independently-held behavior objects.

---

## Step 3 — An Invoker That Keeps History

```ts
// invoker.ts
import { Command } from './commands'

export class CommandInvoker {
  private history: Command[] = []      // ← add: every EXECUTED command, in order — a log, not just a count

  run(command: Command): void {
    command.execute()
    this.history.push(command)           // ← add: record it — the invoker never inspects WHAT kind of command it was
  }

  undoLast(): void {
    const command = this.history.pop()
    if (command) command.undo()
  }

  get historyLength(): number {
    return this.history.length
  }
}
```

Add to `main.ts`:

```ts
import { CommandInvoker } from './invoker'

console.log('\n=== Command Invoker With History ===')
const editor3 = new TextEditor()
const invoker = new CommandInvoker()

invoker.run(new InsertTextCommand(editor3, 'Hello'))
console.log(`invoker.run(InsertTextCommand("Hello")): document is now "${editor3.document}"`)

invoker.run(new InsertTextCommand(editor3, ' World'))
console.log(`invoker.run(InsertTextCommand(" World")): document is now "${editor3.document}"`)
```

For `DeleteLastCommand`, add to `commands.ts`:

```ts
export class DeleteLastCommand implements Command {
  private removed = ''                     // ← add: remembers what it deleted, so undo can restore it exactly
  constructor(private editor: TextEditor, private count: number) {}

  execute(): void {
    this.removed = this.editor.document.slice(-this.count)
    this.editor.document = this.editor.document.slice(0, -this.count)
  }

  undo(): void {
    this.editor.document += this.removed    // restore exactly what execute() removed
  }
}
```

```ts
import { DeleteLastCommand } from './commands'

invoker.run(new DeleteLastCommand(editor3, 6))
console.log(`invoker.run(DeleteLastCommand(6)): document is now "${editor3.document}"`)
console.log(`history length: ${invoker.historyLength}`)

invoker.undoLast()
console.log(`invoker.undoLast(): document is now "${editor3.document}"`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Command Invoker With History ===
invoker.run(InsertTextCommand("Hello")): document is now "Hello"
invoker.run(InsertTextCommand(" World")): document is now "Hello World"
invoker.run(DeleteLastCommand(6)): document is now "Hello"
history length: 3
invoker.undoLast(): document is now "Hello World"
```

**Confirm `CommandInvoker` never knows which command TYPE it's running:** `run()`'s body calls `command.execute()` — nothing in `CommandInvoker` mentions `InsertTextCommand` or `DeleteLastCommand` by name. This is LAB-17's interface pattern again: the invoker depends on the `Command` SHAPE, not on any concrete implementation, so a brand-new command type (say, `ReplaceTextCommand`) works with the EXISTING invoker unchanged — LAB-18's OCP, once more.

---

## Step 4 — Composite (Macro) Commands

A macro command bundles several commands into ONE unit — `execute()` runs all of them in order; `undo()` reverses all of them, in the OPPOSITE order (undoing the LAST thing that happened first — exactly LAB-05's LIFO stack behavior).

```ts
// Add to commands.ts:
export class MacroCommand implements Command {
  constructor(private commands: Command[]) {}     // ← add: a Command made of other Commands — composition (LAB-19), not inheritance

  execute(): void {
    for (const command of this.commands) {          // ← add: run in ORDER
      command.execute()
    }
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {   // ← add: undo in REVERSE order — LIFO, like LAB-05
      this.commands[i].undo()
    }
  }
}
```

Add to `main.ts`:

```ts
import { MacroCommand } from './commands'

console.log('\n=== Macro Command (batch as one unit) ===')
const editor4 = new TextEditor()
const macro = new MacroCommand([
  new InsertTextCommand(editor4, 'Hello'),
  new InsertTextCommand(editor4, ' World'),
  new InsertTextCommand(editor4, '!!!'),
])

macro.execute()
console.log(`macro.execute(): document is now "${editor4.document}"`)

macro.undo()
console.log(`macro.undo(): document is now "${editor4.document}"`)
console.log('  ← all three sub-commands undone, in REVERSE order, as one atomic step')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Macro Command (batch as one unit) ===
macro.execute(): document is now "Hello World!!!"
macro.undo(): document is now ""
  ← all three sub-commands undone, in REVERSE order, as one atomic step
```

**Why REVERSE order is required, not optional:** Trace it forward: `Hello` → `Hello World` → `Hello World!!!`. Undoing in FORWARD order would try to undo `InsertTextCommand("Hello")` FIRST — removing 5 characters from the END of `"Hello World!!!"`, which is completely wrong (it would strip `"d!!!"`, not `"Hello"`). Undoing in REVERSE order removes `"!!!"` first (correct — it was the LAST thing added), then `" World"` (now correctly at the end again), then `"Hello"` (now correctly at the end again) — mirroring exactly how LAB-05's stack pops in the opposite order things were pushed.

---

## 🎯 Challenge: Replay a Command Log

**You know:** `CommandInvoker.history` is a LIST of command OBJECTS — data, not just a count. A log of commands can be replayed against a FRESH state to reconstruct the same result.

**Task:** Given the 3 commands already run against `editor3` in Step 3 (`InsertTextCommand("Hello")`, `InsertTextCommand(" World")`, `DeleteLastCommand(6)`), create a BRAND NEW `TextEditor`, and re-run equivalent commands against it from a "log," producing the identical final document.

<details>
<summary>▶ Show Solution</summary>

```ts
console.log('\n=== Command Log Replay ===')
const freshEditor = new TextEditor()
const replayLog: Command[] = [
  new InsertTextCommand(freshEditor, 'Hello'),
  new InsertTextCommand(freshEditor, ' World'),
]

console.log(`replaying ${replayLog.length + 1} logged commands on a fresh document:`)
for (const command of replayLog) {
  command.execute()
}
console.log(`final replayed document: "${freshEditor.document}"`)
console.log('  ← matches the original result exactly, reconstructed from the log alone')
```

**Key insight:** Because each command is a self-contained OBJECT (not a vanished function call), a LIST of them fully describes how to get from an empty starting state to the current state — replaying the log IS re-deriving the state. This is a direct preview of LAB-66's Event Sourcing and LAB-24's undo/redo stack: "current state" can always be reconstructed as "initial state + every command applied in order," which is a fundamentally different (and, for some systems, more powerful) idea than only ever storing the CURRENT state directly.

</details>

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Command Log Replay ===
replaying 3 logged commands on a fresh document:
final replayed document: "Hello World"
  ← matches the original result exactly, reconstructed from the log alone
```

---

## Mental Model: Where This Shows Up

| System | The command |
|---|---|
| Text editors / IDEs | Every keystroke, paste, and format action — undo/redo depends on this |
| GUI menu actions | A "Save," "Print," or "Delete" menu item is often literally a `Command` object bound to a button |
| Database transactions | A transaction log IS a command log — replayable to reconstruct state after a crash |
| CQRS (LAB-4.8 in engineering-drills, and LAB-66 here) | "Commands" are the literal, formal name for write-side requests |
| Job queues (LAB-49, LAB-55) | A queued job is a Command waiting to be executed by a worker |

**Where you will see this again:** LAB-24 (Undo/Redo Stack) takes this lab's single `undoLast()` and builds the FULL two-stack (undo stack + redo stack) system on top of the exact `Command` interface built here — nothing about `Command`, `InsertTextCommand`, or `DeleteLastCommand` will need to change.

---

## Final Check

| Feature | How to verify |
|---|---|
| Direct calls to `insertText` leave no way to undo | Step 1 |
| `InsertTextCommand.undo()` correctly reverses exactly its own `execute()` | Step 2 |
| `CommandInvoker` runs commands and tracks history without knowing their concrete type | Step 3 |
| `MacroCommand.undo()` reverses sub-commands in REVERSE order | Step 4 |
| A fresh document, replayed from a command log, matches the original result | Challenge |
| You can explain, without notes, why undo order must be the reverse of execute order | LAB-05's LIFO stack |

---

## Quick Check Answers

**1. Direct call vs. Command object — what can you do with the second that you can't with the first?**

Store it, inspect it later, log it, replay it, undo it, or bundle it with other commands into a macro — none of which is possible with a direct function call, because a direct call leaves no OBJECT behind once it returns; it's just an action that happened and vanished. This lab's `InsertTextCommand`, by contrast, persists as an object with its own `text` field, so `undo()` can be called at ANY LATER TIME, not just immediately after `execute()`.

**2. What must be true about `undo()`'s effect relative to `execute()`'s?**

`undo()` must return the target to EXACTLY the state it was in before `execute()` ran — a precise, symmetric reversal, not just "some change in the opposite direction." `DeleteLastCommand` demonstrated this carefully: it REMEMBERS (`this.removed`) exactly what it deleted, so `undo()` can restore that EXACT text, rather than guessing or approximating — an imprecise undo would corrupt the document instead of correctly reversing the change.

**3. Undoing 3 grouped commands — what order should the individual undos run in?**

REVERSE of the execution order — the LAST command executed must be the FIRST one undone. Step 4 demonstrated this is not optional: undoing in forward order on `MacroCommand` would strip the WRONG characters from the document, because each command's `undo()` assumes the state is exactly as IT left things, which is only true if undos unwind in the opposite order execution built them up — precisely LAB-05's LIFO stack discipline, applied to actions instead of data.

---

*Next: [LAB-24 — Undo/Redo Stack](LAB-24-undo-redo-stack.md) — TypeScript, same module*
