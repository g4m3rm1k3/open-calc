# Vue Spreadsheet — Lesson 11 — Undo / Redo

## What you will build

Ctrl+Z undoes any cell edit. Ctrl+Y (or Ctrl+Shift+Z) redoes it. A status line below the grid shows how many undo and redo steps are available. The history persists through the entire session.

```
[ undo: 3 | redo: 1 ]
```

---

## What you need to know first

`cells` is `ref<Record<CellId, Cell>>({})`. Every edit calls `commitEdit`, which writes to `cells.value`. The undo history is a stack of `cells` snapshots.

---

## Concept: immutable snapshots

Undo works by keeping a list of every past state. On each edit, a snapshot of the entire `cells` map is pushed onto a history stack. Ctrl+Z pops the stack and restores the previous snapshot.

The key requirement: each snapshot must be independent. If two snapshots share a reference to the same object, modifying one would modify the other. The simplest way to ensure independence is to make each snapshot a **shallow copy** of `cells.value` at the moment of the edit.

This approach is simple, correct, and appropriate for a spreadsheet where each cell is an immutable value object (no nested mutable state). For deeply nested structures, deep cloning would be needed — but `Cell` values are simple: `{ kind, value }` or `{ kind, expr }`, with no nested objects.

---

## Step 1 — History state

**The problem:** No state records past versions of `cells`.

Add to `<script setup>`:

```typescript
const history  = ref<Array<Record<CellId, Cell>>>([])
const redoStack = ref<Array<Record<CellId, Cell>>>([])
```

`history` is a stack of past states. `redoStack` holds states that were undone and can be redone. Both start empty.

**Walkthrough — `Array<Record<CellId, Cell>>`, the same array type written a second, equivalent way:**

Every array type so far has used the shorthand `T[]` — `Token[]`, `ExpressionNode[]`.
`Array<Record<CellId, Cell>>` is the identical concept, written using the generic
syntax directly (`Array` is itself a generic type, the same way `Record` is) instead
of the shorthand. `Token[]` and `Array<Token>` mean exactly the same thing to
TypeScript; this project uses `T[]` when `T` is a simple name and switches to
`Array<T>` here specifically because the shorthand would read as
`Record<CellId, Cell>[]` — legal, but the generic form makes the nesting (an array
*of* records) easier to parse visually at a glance. `history` is a **stack**: a list
where new items are added and removed from the same end — `.push()` adds to the end,
`.pop()` removes from the end. A stack always gives you the most recently added item
back first, which is exactly what "undo the last thing that happened" needs.

---

## Step 2 — Save a snapshot on every commit

**The problem:** `commitEdit` modifies `cells.value` without saving the prior state.

Update `commitEdit`:

```typescript
function commitEdit(coordinate: Coordinate, value: string): void {
  if (editingCoordinate.value === null) return

  // Save snapshot BEFORE modifying
  history.value.push({ ...cells.value })
  redoStack.value = []   // any new edit clears the redo stack

  cells.value[cellId(coordinate)] = parseRawInput(value)
  editingCoordinate.value = null
}
```

**Walkthrough — `{ ...cells.value }` (shallow copy):**

The spread operator creates a new object with the same key-value pairs as `cells.value`. The values themselves — `Cell` objects — are not copied; the new object holds the same references. But since `Cell` values are never mutated in place (lesson 02's `readonly` principle), this is sufficient. After `commitEdit`, `cells.value` is reassigned to a new-entry-added version; the snapshot in `history` still reflects the old state exactly.

**Walkthrough — clearing `redoStack` on new edit:**

When you edit after undoing, the future (redoStack) becomes invalid — you took a different path. Clearing `redoStack` on new edits ensures that after typing in a cell, Ctrl+Y cannot take you to a state that no longer follows from the current history.

Run a throwaway to understand shallow copy independence:

```vue
<script setup lang="ts">
const original = { A1: { kind: 'number' as const, value: 5 }, B1: { kind: 'text' as const, value: 'hi' } }
const snapshot = { ...original }   // shallow copy

// Adding a new key to original does not affect snapshot:
const modified = { ...original, C1: { kind: 'number' as const, value: 10 } }

console.log('original:', Object.keys(original))   // A1, B1
console.log('snapshot:', Object.keys(snapshot))   // A1, B1
console.log('modified:', Object.keys(modified))   // A1, B1, C1
console.log('snapshot unchanged:', snapshot === original ? 'same ref!' : 'independent')
</script>
<template><p>Check console</p></template>
```

`snapshot` is an independent object. Adding `C1` to `modified` does not change `snapshot`. The snapshot and the live state are decoupled.

---

## Step 3 — Keyboard handler for undo/redo

**The problem:** Nothing listens for Ctrl+Z or Ctrl+Y.

Add to `<script setup>`:

```typescript
import { onMounted, onBeforeUnmount } from 'vue'

function undo(): void {
  const previous = history.value.pop()
  if (!previous) return
  redoStack.value.push({ ...cells.value })
  cells.value = previous
}

function redo(): void {
  const next = redoStack.value.pop()
  if (!next) return
  history.value.push({ ...cells.value })
  cells.value = next
}

function handleKeydown(event: KeyboardEvent): void {
  const isCtrl = event.ctrlKey || event.metaKey

  if (isCtrl && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
    return
  }

  if (isCtrl && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
    return
  }

  if (event.key === 'Enter' && selectedCoordinate.value && !editingCoordinate.value) {
    startEditing(selectedCoordinate.value)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
```

**Walkthrough — `history.value.pop()`:**

`pop()` removes and returns the last element of the array. Since `history` holds snapshots in order of edits (oldest first, newest last), `pop()` gives the most recent past state. After popping, the current state is pushed onto `redoStack` (so it can be restored), and `cells.value` is replaced with the snapshot.

`redo` is the exact mirror: pop from `redoStack`, push current to `history`, replace `cells.value`.

**Walkthrough — `event.ctrlKey || event.metaKey`:**

`ctrlKey` is the Ctrl key on Windows/Linux; `metaKey` is the Command key on macOS. Both serve the same role in keyboard shortcuts on their respective platforms. Supporting both makes the shortcut work across operating systems.

**Walkthrough — `onMounted` / `onBeforeUnmount`:**

The `keydown` listener is added to `document` when the component mounts and removed when it unmounts. If the component is destroyed (the page navigates away, or the component is conditionally hidden), the listener is cleaned up. Forgetting `onBeforeUnmount` would leave a listener active after the component is gone — a memory leak that could fire into unmounted component state.

---

## Step 4 — Status display

**The problem:** Nothing shows how many undo/redo steps are available.

Add to `<template>` below the debug panel:

```html
<div class="status-bar">
  <button @click="undo" :disabled="history.length === 0">
    ↩ Undo ({{ history.length }})
  </button>
  <button @click="redo" :disabled="redoStack.length === 0">
    Redo ({{ redoStack.length }}) ↪
  </button>
</div>
```

Add to `<style>`:

```css
.status-bar {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}
.status-bar button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #f8fafc;
  font-size: 0.8rem;
  cursor: pointer;
}
.status-bar button:disabled {
  opacity: 0.4;
  cursor: default;
}
```

Click ▶ Run. Edit a few cells, then press Ctrl+Z — each press restores the previous state. Press Ctrl+Y — each press re-applies the edit. The button labels show the count in real time.

**Walkthrough — `:disabled="history.length === 0"`:**

When `history` is empty, there is nothing to undo. The `:disabled` binding greys the button and prevents clicks. In the template, `history` is the auto-unwrapped value of `history` ref — an array. `.length` reads the reactive array's length, which Vue tracks. When `commitEdit` pushes to `history.value`, Vue detects the change and re-evaluates the `:disabled` binding.

**The Design lens — why a disabled button, not a hidden one, and why real `<button>` elements again:**

An alternative design would hide the Undo button entirely when there's nothing to
undo (`v-if="history.length > 0"`). This project greys it out instead
(`:disabled`), and the difference is a real, deliberate usability choice: a disabled
button still tells the user the feature *exists* — greyed out, in its normal
position, communicating "this is a real capability, just not available right now."
A hidden button removes that information entirely; a new user would have no way to
discover Undo exists until they'd already made an edit. This is the same **affordance**
idea from Lesson 02's selection outline, applied to a different signal: showing,
not just doing.

Note also that these are real `<button>` elements, not styled `<div>`s — the same
non-negotiable choice Lesson 13's formatting toolbar makes later in this series, for
the identical reason: a native `<button>` with the `disabled` HTML attribute (which
`:disabled="..."` compiles down to) is automatically removed from the keyboard `Tab`
order while disabled and is announced correctly by screen readers as "Undo, button,
dimmed" — behavior you would have to hand-build yourself with any other element.

**Walkthrough — why replacing `cells.value` is correct:**

```typescript
cells.value = previous
```

This replaces the entire `cells.value` with the snapshot. Vue detects the assignment and invalidates everything that reads `cells.value` — including `displayValues` computed. On the next render, the grid shows the restored state. No cell-by-cell patching is needed; one assignment triggers the correct reactive update.

---

## CS concept — this is the Memento pattern, not the Command pattern, and the difference matters

It's tempting to call any undo/redo system "the Command pattern" — the name has
become a catch-all in casual conversation — but the two are genuinely different
patterns, solving the same problem two different ways, and this project's design is
precisely one of them, not the other:

**The Memento pattern** — what this lesson actually builds — captures and stores an
object's entire internal *state* at a point in time, opaquely, so it can be restored
later without the thing doing the restoring needing to understand what changed or
why. `history.value.push({ ...cells.value })` is exactly this: a snapshot of
everything, with zero knowledge of what the edit actually was. `undo` doesn't reverse
an action — it doesn't even know an action happened. It just replaces the current
state with a saved one.

**The Command pattern** — a genuinely different design — encapsulates a *request* as
an object: not "here is what everything looked like," but "here is the specific
change that happened, and here is how to undo exactly that change." A Command-based
version of this feature would look like:

```typescript
interface EditCommand {
  cellId: CellId
  previousCell: Cell | undefined
  newCell: Cell
}

function undo(command: EditCommand): void {
  if (command.previousCell === undefined) {
    delete cells.value[command.cellId]   // the cell didn't exist before this edit
  } else {
    cells.value[command.cellId] = command.previousCell
  }
}
```

The *diff-based alternative* already described below — storing only the one cell
that changed, old value and new value — is not a memory optimization of Memento; it
is the Command pattern, in this exact codebase. Memento asks "what did everything
look like?" Command asks "what specifically happened, and how do I reverse it?"

The pure-snapshot approach used here is correct for small data. Storing only the *diff* — the old and new value of the one cell that changed, the Command-pattern version above — means undo applies the reverse diff instead of restoring a whole map. For a large spreadsheet with many cells, diffs use far less memory, and this is also the approach that scales to a status bar showing *what* was undone ("Undo: changed A1 from 5 to 10") — Memento's opaque snapshots have no way to describe that, since they never recorded what changed, only what everything looked like.

Both approaches are correct, solving the same problem from opposite ends: Memento is simpler to implement and reason about because it never has to model "what changed" at all; Command scales better and can describe itself. This lesson chooses Memento.

*Recognized elsewhere:* Git's own commit history is much closer to Command
(each commit records a change, reversible with `git revert`) than to Memento; a
database's write-ahead log is Command-shaped for the same reason. Ctrl+Z in most
text editors, by contrast, is usually Memento-shaped for exactly this project's
reason — capturing "the text looked like this" is simpler than modeling every
possible edit as a reversible action. Video game "save states" are pure Memento.

**A real, named Agile/XP principle for exactly this kind of choice: "the simplest
thing that could possibly work."** This is a phrase from Extreme Programming, chosen
deliberately over its opposite failure mode — building the diff-based version now, on
the guess that this spreadsheet will someday need it, is the same speculative
over-engineering YAGNI (Lesson 08) warned against, just applied to performance
instead of features. The snapshot approach is not a lesser version of "the real
solution" — for this project's actual scale, it *is* the correct solution. Choosing
it deliberately, with the trade-off named out loud, is different from choosing it out
of not knowing the alternative exists.

---

## What breaks without this

**Not clearing `redoStack` in `commitEdit`:**

Edit A1 to `hello`. Undo (A1 is empty). Edit A1 to `world`. Redo. A1 becomes `hello` — the redo took you to a state from a completely different branch of history. Once you edit after undoing, the future history is invalidated; `redoStack = []` enforces this.

**Using the same object reference instead of shallow copy:**

```typescript
history.value.push(cells.value)  // BUG: same reference
```

Now `history` and `cells.value` point to the same object. When `commitEdit` adds a new cell to `cells.value[cellId(coordinate)] = ...`, it also modifies the snapshot — the snapshot becomes the *current* state, not the past state. Undo restores the same thing that is already there. History is broken.

**Not cleaning up in `onBeforeUnmount`:**

If this component is destroyed and re-created (switching between spreadsheet sheets, for example), a new `handleKeydown` listener is added each time but the old one is never removed. After three navigations, pressing Ctrl+Z fires the old listeners three times and the new one once — four undos for one keypress.

---

## Connect the pieces

```
App.vue
  <script setup>
    history, redoStack  ref<Array<Record<CellId, Cell>>>([])
    commitEdit()        — pushes { ...cells.value } to history;
                          clears redoStack; edits cells
    undo()              — pop history; push to redo; restore cells
    redo()              — pop redo; push to history; restore cells
    handleKeydown()     — Ctrl+Z → undo; Ctrl+Y/Shift+Z → redo
    onMounted           — adds listener; onBeforeUnmount removes it
  <template>
    :disabled="history.length === 0"  — reactive button state
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Editing cells and pressing Ctrl+Z restores previous states in order
- [ ] Ctrl+Y re-applies undone edits
- [ ] Editing after undoing clears the redo stack
- [ ] The undo/redo buttons show correct counts and disable when empty
- [ ] You can explain why `{ ...cells.value }` creates an independent snapshot
- [ ] You can explain why `redoStack` must be cleared on new edits
- [ ] You can explain why `onBeforeUnmount` is required alongside `onMounted`
- [ ] You can explain the difference between the Memento and Command patterns, and say which one this project uses and why

---

*Next: Lesson 12 — Extracting Components. The single, now-large `App.vue` is split into `SpreadsheetGrid`, `CellDisplay`, and `FormulaBar` — separate components sharing reactive state through `provide`/`inject`, both explained from first principles the moment they're needed.*
