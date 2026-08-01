# SE Masterclass — LAB-24 — Undo/Redo Stack

**Language: TypeScript (Node.js)** — same module as LAB-21–23.

**Prerequisites:** LAB-23 (Command System) — every `Command` from LAB-23 already has `execute()`/`undo()`. This lab builds the TWO-STACK structure (LAB-05) that turns individual undoable commands into a full Ctrl+Z / Ctrl+Y system.

**What this lab adds:**
- The two-stack model: an undo stack and a redo stack, both built from LAB-05's `Stack`
- Undo/redo round trips: moving commands BETWEEN the two stacks, not deleting them
- Branching history: what happens to the redo stack when you undo, then do something NEW
- Bounding history size — the space-time trade-off (LAB-08) applied to undo history

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. After `undo()`, the undone command didn't just disappear — where did it go, and why does it need to go somewhere?
> 2. You undo twice, then execute a brand NEW command. What should happen to the two commands sitting in the redo stack?
> 3. If the undo stack is capped at 50 entries and a 51st command executes, which command should be forgotten — the newest, or the oldest?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Execute Three Commands ===
execute("Hello"): "Hello"
execute(" World"): "Hello World"
execute("!!!"): "Hello World!!!"
undo stack size: 3, redo stack size: 0

=== Undo Twice ===
undo(): "Hello World"
undo(): "Hello"
undo stack size: 1, redo stack size: 2

=== Redo Once ===
redo(): "Hello World"
undo stack size: 2, redo stack size: 1

=== Branching History: New Command After Undo ===
undo(): "Hello"
undo stack size: 1, redo stack size: 2
execute(" There"): "Hello There"
undo stack size: 2, redo stack size: 0
  ← the redo stack was WIPED — " World" and "!!!" are gone forever, replaced by this new branch

=== Undo/Redo at the Boundaries ===
undo() 5 times when only 2 are available: stops safely at "" 
redo() when redo stack is empty: does nothing, no error

=== Bounded History (max 3 entries) ===
executed 5 commands, undo stack capped at: 3
oldest 2 commands were evicted — cannot undo back to the very start anymore
```

---

### Concept: Two Stacks, Not One List

**What it is:** A working undo/redo system needs TWO separate stacks (LAB-05's LIFO structure): an **undo stack** (commands that have been done, ready to be undone) and a **redo stack** (commands that have been undone, ready to be redone). Undo/redo MOVES a command between the two stacks — it never deletes it, unless a new action branches history (covered below).

**The problem before:** A single list of "things that happened" doesn't distinguish between "still in effect" and "currently undone" — you'd need extra bookkeeping (a pointer/index into the list) to track where you "currently are," and REDO would require carefully not just re-adding a command but knowing exactly which one comes next.

**The solution:**

```ts
class UndoRedoManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []

  execute(command: Command) {
    command.execute()
    this.undoStack.push(command)
    this.redoStack = []          // new action — the old redo branch is no longer reachable (more on this below)
  }

  undo() {
    const command = this.undoStack.pop()
    if (!command) return
    command.undo()
    this.redoStack.push(command)     // MOVED, not deleted — ready to be redone
  }

  redo() {
    const command = this.redoStack.pop()
    if (!command) return
    command.execute()
    this.undoStack.push(command)     // MOVED back — ready to be undone again
  }
}
```

**Canonical example (General Explanation):** Think of two piles of cards on a desk: "done" (face up, in order) and "undone" (face down, ready to redo). Undoing takes the top card off "done," flips it, and places it on "undone." Redoing does the exact reverse. Neither pile ever throws a card away during a normal undo/redo — they just move between the two piles, exactly LAB-05's LIFO push/pop.

---

## Step 1 — Build the Two-Stack Manager

```ts
// undo-redo-manager.ts
import { Command } from './commands'      // reused directly from LAB-23

export class UndoRedoManager {
  private undoStack: Command[] = []       // ← add: LAB-05's stack — array used as LIFO via push/pop
  private redoStack: Command[] = []

  execute(command: Command): void {
    command.execute()
    this.undoStack.push(command)            // ← add: newly done — goes on the undo stack
  }

  undo(): void {
    const command = this.undoStack.pop()     // ← add: take the MOST RECENTLY done command
    if (!command) return                       // nothing to undo — safe no-op
    command.undo()
    this.redoStack.push(command)                // ← add: moved, not deleted
  }

  redo(): void {
    const command = this.redoStack.pop()
    if (!command) return
    command.execute()
    this.undoStack.push(command)
  }

  get undoStackSize(): number { return this.undoStack.length }
  get redoStackSize(): number { return this.redoStack.length }
}
```

```ts
// main.ts
import { TextEditor } from './editor'
import { InsertTextCommand } from './commands'
import { UndoRedoManager } from './undo-redo-manager'

console.log('=== Execute Three Commands ===')
const editor = new TextEditor()
const manager = new UndoRedoManager()

manager.execute(new InsertTextCommand(editor, 'Hello'))
console.log(`execute("Hello"): "${editor.document}"`)
manager.execute(new InsertTextCommand(editor, ' World'))
console.log(`execute(" World"): "${editor.document}"`)
manager.execute(new InsertTextCommand(editor, '!!!'))
console.log(`execute("!!!"): "${editor.document}"`)

console.log(`undo stack size: ${manager.undoStackSize}, redo stack size: ${manager.redoStackSize}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Execute Three Commands ===
execute("Hello"): "Hello"
execute(" World"): "Hello World"
execute("!!!"): "Hello World!!!"
undo stack size: 3, redo stack size: 0
```

**Confirm the redo stack starts empty:** Nothing has been undone yet, so there's nothing waiting to be redone — this matches the "two piles" mental model: everything so far is in the "done" pile.

---

## Step 2 — Undo and Redo Round Trips

```ts
console.log('\n=== Undo Twice ===')
manager.undo()
console.log(`undo(): "${editor.document}"`)
manager.undo()
console.log(`undo(): "${editor.document}"`)
console.log(`undo stack size: ${manager.undoStackSize}, redo stack size: ${manager.redoStackSize}`)

console.log('\n=== Redo Once ===')
manager.redo()
console.log(`redo(): "${editor.document}"`)
console.log(`undo stack size: ${manager.undoStackSize}, redo stack size: ${manager.redoStackSize}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Undo Twice ===
undo(): "Hello World"
undo(): "Hello"
undo stack size: 1, redo stack size: 2

=== Redo Once ===
redo(): "Hello World"
undo stack size: 2, redo stack size: 1
```

**Trace the stack sizes exactly:** Start: undo=3, redo=0. After 2 undos: undo=1, redo=2 (2 commands MOVED across). After 1 redo: undo=2, redo=1 (1 command moved BACK). The total (undo + redo) stays constant at 3 throughout — nothing is created or destroyed during ordinary undo/redo, only relocated between the two stacks.

---

### Concept: Branching History — Undo Then Do Something New

**What it is:** If you undo some actions, then perform a BRAND NEW action instead of redoing, the commands sitting in the redo stack become UNREACHABLE — they described a future that no longer exists, because the document just took a DIFFERENT path.

**The problem before:** Imagine NOT clearing the redo stack: you undo twice (document: "Hello"), type something new ("Hello There"), then call `redo()` — what would it even redo TO? The old redo stack still has `InsertTextCommand(" World")` sitting on top, but applying THAT now would produce `"Hello There World"` — nonsense, because " World" was designed to apply to `"Hello"`, and the document is no longer in that exact state's lineage in the way the original commands assumed.

**The solution:** Any new `execute()` call WIPES the redo stack — the old "future" is discarded, and a new one begins from the current point.

**Canonical example (General Explanation):** Think of `git`: if you check out an old commit and make a NEW commit from there, the commits that were "ahead" on the original branch don't automatically reattach — you've created a new branch, and the old path forward requires an explicit `git reflog` (a safety net, not automatic reattachment) to ever find again. A normal undo/redo stack doesn't even keep that reflog — the old redo branch is simply gone.

---

## Step 3 — Confirm the Redo Stack Gets Wiped

```ts
// Add to undo-redo-manager.ts's execute():
execute(command: Command): void {
  command.execute()
  this.undoStack.push(command)
  this.redoStack = []          // ← add: a NEW action invalidates whatever "future" the redo stack represented
}
```

Add to `main.ts`:

```ts
console.log('\n=== Branching History: New Command After Undo ===')
manager.undo()
console.log(`undo(): "${editor.document}"`)
console.log(`undo stack size: ${manager.undoStackSize}, redo stack size: ${manager.redoStackSize}`)

manager.execute(new InsertTextCommand(editor, ' There'))
console.log(`execute(" There"): "${editor.document}"`)
console.log(`undo stack size: ${manager.undoStackSize}, redo stack size: ${manager.redoStackSize}`)
console.log('  ← the redo stack was WIPED — " World" and "!!!" are gone forever, replaced by this new branch')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Branching History: New Command After Undo ===
undo(): "Hello"
undo stack size: 1, redo stack size: 2
execute(" There"): "Hello There"
undo stack size: 2, redo stack size: 0
  ← the redo stack was WIPED — " World" and "!!!" are gone forever, replaced by this new branch
```

**Confirm they're genuinely gone, not just hidden:** Call `manager.redo()` right after this and confirm NOTHING happens (`redoStackSize` is `0` — there's nothing left to redo). The `InsertTextCommand(" World")` and `InsertTextCommand("!!!")` objects that USED to be in the redo stack are no longer referenced anywhere, and (in a real long-running program) become eligible for garbage collection — they're not lurking, recoverable, or reachable through this manager at all.

---

## Step 4 — Safe Boundaries

```ts
console.log('\n=== Undo/Redo at the Boundaries ===')
const boundaryEditor = new TextEditor()
const boundaryManager = new UndoRedoManager()
boundaryManager.execute(new InsertTextCommand(boundaryEditor, 'Hi'))
boundaryManager.undo()

process.stdout.write('undo() 5 times when only 2 are available: ')
for (let i = 0; i < 5; i++) boundaryManager.undo()   // calling undo() far more times than there's history
console.log(`stops safely at "${boundaryEditor.document}" `)

process.stdout.write('redo() when redo stack is empty: ')
boundaryManager.redo()
boundaryManager.redo()
boundaryManager.redo()
console.log('does nothing, no error')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Undo/Redo at the Boundaries ===
undo() 5 times when only 2 are available: stops safely at "" 
redo() when redo stack is empty: does nothing, no error
```

**Confirm this from `undo()`'s own code:** `const command = this.undoStack.pop()` on an EMPTY array returns `undefined` (LAB-05's `std::stack` would need an explicit `.empty()` check first; JavaScript's array `.pop()` on empty just gives `undefined` safely) — the `if (!command) return` guard catches this immediately, exactly the boundary-validation instinct from LAB-09, applied here to "don't crash when there's nothing left to undo."

---

## 🎯 Challenge: Bound the Undo Stack's Size

**You know:** LAB-08's space-time trade-off — unlimited undo history means unlimited memory growth for a long editing session. A real editor caps history at some maximum (Photoshop, for instance, has a configurable history limit).

**Task:** Modify `execute()` so the undo stack never holds more than `maxHistory` entries — when a NEW command would push it over the limit, evict the OLDEST entry (not the newest) to make room.

**Hint:** `Array.prototype.shift()` removes and returns the FIRST element (LAB-01's array basics) — the oldest entry, since new entries are always pushed onto the END.

<details>
<summary>▶ Show Solution</summary>

```ts
export class UndoRedoManager {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  constructor(private maxHistory: number = Infinity) {}

  execute(command: Command): void {
    command.execute()
    this.undoStack.push(command)
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift()          // evict the OLDEST — it's the one least likely to still be needed
    }
    this.redoStack = []
  }
  // undo(), redo() unchanged
}
```

**Key insight:** Evicting the OLDEST (not the newest) preserves the ABILITY to undo RECENT work, which is almost always what a user actually wants — losing the ability to undo all the way back to the very first keystroke of a long session is an acceptable trade-off; losing the ability to undo your last few actions would not be. This is LAB-08's space-time trade-off made into a real product decision: bounded memory, at the cost of bounded undo depth.

</details>

Add to `main.ts`:

```ts
console.log('\n=== Bounded History (max 3 entries) ===')
const boundedEditor = new TextEditor()
const boundedManager = new UndoRedoManager(3)

for (const text of ['a', 'b', 'c', 'd', 'e']) {
  boundedManager.execute(new InsertTextCommand(boundedEditor, text))
}
console.log(`executed 5 commands, undo stack capped at: ${boundedManager.undoStackSize}`)
console.log('oldest 2 commands were evicted — cannot undo back to the very start anymore')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Bounded History (max 3 entries) ===
executed 5 commands, undo stack capped at: 3
oldest 2 commands were evicted — cannot undo back to the very start anymore
```

---

## Mental Model: Where This Shows Up

| Application | The undo/redo stack |
|---|---|
| Any text editor / IDE | Ctrl+Z / Ctrl+Y (or Cmd+Z / Cmd+Shift+Z) |
| Photoshop / Figma / drawing tools | A visible "History" panel — literally the undo stack, made visible and clickable |
| Git | `git reset` / `git reflog` — a much more permissive, longer-lived version of the same idea |
| Database transactions | `ROLLBACK` is a form of undo; some systems support limited "redo" via WAL replay |
| This curriculum | LAB-23's `Command` objects are the payload; THIS lab's two stacks are the mechanism |

---

## Final Check

| Feature | How to verify |
|---|---|
| Three executed commands land on the undo stack, redo stack empty | Step 1 |
| Undo moves commands to the redo stack; redo moves them back | Step 2 |
| Stack sizes sum correctly (undo + redo constant during round trips) | Step 2 |
| A new command after undo wipes the redo stack | Step 3 |
| Calling `undo()`/`redo()` past the available history is a safe no-op | Step 4 |
| A bounded undo stack evicts the OLDEST entry, not the newest | Challenge |
| You can explain, without notes, why undo/redo needs TWO stacks, not one | Concept box |

---

## Quick Check Answers

**1. After `undo()`, where did the undone command go?**

It moved to the REDO stack — `undoStack.pop()` removed it from one stack, and `redoStack.push(command)` immediately placed the SAME command object onto the other. It needs to go SOMEWHERE (rather than being discarded) precisely so `redo()` can find it again and re-apply it — demonstrated directly in Step 2, where undoing twice then redoing once correctly restored `"Hello World"`.

**2. Undo twice, then execute something new — what happens to the redo stack?**

It gets completely wiped (Step 3) — `execute()`'s `this.redoStack = []` discards whatever was sitting there. This is necessary because the two undone commands were designed to apply to a document state that NO LONGER EXISTS once a new, different command has been executed from that point — attempting to redo them afterward would apply operations meant for one version of the document onto a now-divergent version, corrupting it.

**3. A capped undo stack, 51st command executes — evict newest or oldest?**

The OLDEST — demonstrated in the Challenge, where `Array.prototype.shift()` removes the first (earliest-pushed) entry to make room. Evicting the oldest preserves the ability to undo RECENT changes (almost always what matters most to a user), at the cost of eventually losing the ability to undo all the way back to the very beginning of a long session — a deliberate space-time trade-off (LAB-08), not an oversight.

---

*Next: [LAB-25 — Configuration System](LAB-25-configuration-system.md) — TypeScript, same module*
