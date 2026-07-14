# Vue Spreadsheet — Lesson 19 — Multiple Sheets and Cross-Sheet References

## What you will build

A row of sheet tabs below the grid — `SHEET1`, `SHEET2` — click one to switch, click `+` to add another. Each sheet holds its own independent cells; editing `SHEET2` never touches `SHEET1`'s data. Then formulas learn to reach across sheets: `=SHEET2!A1`, typed on `SHEET1`, reads `SHEET2`'s A1 — a genuine extension of Lesson 18's grammar, not a special case bolted on top of it.

```
[ SHEET1 ] [ SHEET2 ] [ + ]
    A       B
1 | 5     | =SHEET2!A1 → (whatever SHEET2's A1 currently holds)
```

---

## What you need to know first

This lesson restructures `cells` itself — the single `ref<Record<CellId, Cell>>` every lesson since Lesson 04 has read from and written to directly. It does not rewrite `commitEdit`, `displayCell`, `evaluate`, or any other function that already uses `cells` — Lesson 03's single-write-point discipline and Lesson 09's dependency-injection design mean almost everything keeps working with one small, contained change. This lesson also extends Lesson 18's grammar again, for the second time in two lessons, using the same "look at what comes after an identifier to decide what it means" technique Lesson 18 established for distinguishing a function call from a bare identifier.

---

## Concept: what actually needs to change, and what doesn't

A cell's address, `"A1"`, is no longer globally unique the moment a second sheet exists — `SHEET1`'s A1 and `SHEET2`'s A1 are different cells that happen to share a name. The fix is a **nested lookup table** — a `Record` whose values are themselves `Record`s, the same pattern Lesson 03 built once (`Record<CellId, string>`) and Lesson 12 (`Record<CellId, CellStyle>`), applied one level deeper:

```typescript
type SheetId = string

const sheets = ref<Record<SheetId, Record<CellId, Cell>>>({ SHEET1: {} })
```

`sheets.value['SHEET1']` is exactly the `Record<CellId, Cell>` every previous lesson has called `cells`. The question this lesson has to answer carefully is: how much of the last fifteen lessons' worth of code, all written against a flat `cells`, actually needs to change to keep working against this nested structure?

---

## Step 1 — `cells` becomes a computed window onto the active sheet

**The problem:** Eighteen lessons of code call `cells.value[someKey]`, read and write. Rewriting every one of those call sites to say `sheets.value[activeSheetId.value][someKey]` instead would touch a large fraction of this entire project for no real gain.

Add to `<script setup>`, and remove the old `const cells = ref<Record<CellId, Cell>>({})`:

```typescript
type SheetId = string

const sheets = ref<Record<SheetId, Record<CellId, Cell>>>({ SHEET1: {} })
const sheetOrder = ref<SheetId[]>(['SHEET1'])
const activeSheetId = ref<SheetId>('SHEET1')

const cells = computed(() => sheets.value[activeSheetId.value])
```

Click ▶ Run. Nothing else in this project changes yet — every existing call to `cells.value[cellId(coordinate)]`, in `commitEdit`, `displayCell`, `evaluate`'s `lookupCell`, everywhere, continues to compile and run exactly as before.

**Walkthrough — why mutating `cells.value[key] = ...` still works, even though `cells` is a `computed`, not a `ref`:**

A `computed` (Lesson 06) is normally read-only — there is no setter here, and `cells.value = somethingElse` would fail. But no code in this project ever does that. Every existing call site writes to a *field of* `cells.value` — `cells.value[cellId(coordinate)] = newCell` — never replaces `cells.value` itself. `cells.value` is a real reference to the actual object living inside `sheets.value['SHEET1']`, and Vue's `ref` performs **deep reactivity**: every nested object inside a `ref`'s value is itself wrapped reactively, all the way down, not just the top level. Mutating a field on that nested object is a real, tracked write to `sheets`, exactly as if you had written `sheets.value['SHEET1'][cellId(coordinate)] = newCell` directly — `cells` is not a copy, it's a live window onto one specific part of `sheets`, and `computed` only had to change how that window is *selected* (by `activeSheetId`), not how writes through it behave.

This is the single-write-point discipline (Lesson 03) and the dependency-injection design (Lesson 09) paying off at once: nothing that depends on `cells` had to be told sheets exist.

---

## Step 2 — Per-sheet history, and the real bug that appears without it

**The problem:** `history` and `redoStack` (Lesson 11) are single, global stacks of `cells` snapshots. With multiple sheets now real, a concrete bug is one keystroke away: edit `SHEET1`, switch to `SHEET2`, edit it, switch back to `SHEET1`, press Ctrl+Z — and `undo` would pop `SHEET2`'s most recent snapshot and assign it into whatever `cells` currently points to, silently overwriting `SHEET1`'s cells with `SHEET2`'s data.

**See this happen before fixing it** — with only the Step 1 change applied, edit a cell on `SHEET1`, switch to `SHEET2` (once sheet-switching exists later in this lesson — for now, trust the trace): the global `history` array does not know which sheet each snapshot belongs to, so `undo`'s `cells.value = history.value.pop()` reassigns whichever sheet is *currently active* to hold a snapshot that was captured from a *different* sheet entirely. This is real data corruption, not a cosmetic glitch.

Fix it with the identical nested-`Record` pattern from Step 1:

```typescript
const history = ref<Record<SheetId, Array<Record<CellId, Cell>>>>({ SHEET1: [] })
const redoStack = ref<Record<SheetId, Array<Record<CellId, Cell>>>>({ SHEET1: [] })
```

Update `commitEdit`, `undo`, and `redo` (Lesson 11) to go through the active sheet's own stack:

```typescript
function commitEdit(coordinate: Coordinate, value: string): void {
  if (editingCoordinate.value === null) return

  history.value[activeSheetId.value].push({ ...cells.value })
  redoStack.value[activeSheetId.value] = []

  cells.value[cellId(coordinate)] = parseRawInput(value)
  editingCoordinate.value = null
}

function undo(): void {
  const previous = history.value[activeSheetId.value].pop()
  if (!previous) return
  redoStack.value[activeSheetId.value].push({ ...cells.value })
  sheets.value[activeSheetId.value] = previous
}
```

`redo` mirrors `undo`, reading and writing `redoStack.value[activeSheetId.value]` and `history.value[activeSheetId.value]` the same way, and the same `sheets.value[activeSheetId.value] = ...` assignment in place of `cells.value = ...`:

```typescript
function redo(): void {
  const next = redoStack.value[activeSheetId.value].pop()
  if (!next) return
  history.value[activeSheetId.value].push({ ...cells.value })
  sheets.value[activeSheetId.value] = next
}
```

**Walkthrough — why `sheets.value[activeSheetId.value] = previous`, not `cells.value = previous`:**

This is the one real exception to "nothing had to change" — `undo` is the one function that genuinely needs to *replace* a sheet's entire cell map, not mutate a field within it, and `cells` (a `computed`, no setter) cannot be assigned to directly. Writing through `sheets` instead — replacing the exact entry `cells` is currently a window onto — achieves the identical effect: the next time anything reads `cells.value`, the `computed` re-evaluates and returns the freshly-assigned object.

**Recognized elsewhere:** per-tab or per-document undo history, scoped independently even when a user has several open at once, is standard behavior in every real multi-document application — separate browser tabs, separate files open in a code editor, and, precisely, separate sheets in Excel or Google Sheets, where Ctrl+Z never reaches across a sheet switch to undo a different sheet's edit.

---

## Step 3 — Sheet tabs

**The problem:** Nothing on screen lets a user see which sheet is active, switch sheets, or create a new one.

Add to `<script setup>`:

```typescript
function switchToSheet(sheetId: SheetId): void {
  activeSheetId.value = sheetId
  selectedCoordinate.value = null
  editingCoordinate.value = null
}

function addSheet(): void {
  const nextNumber = sheetOrder.value.length + 1
  const newSheetId = `SHEET${nextNumber}`
  sheets.value[newSheetId] = {}
  history.value[newSheetId] = []
  redoStack.value[newSheetId] = []
  sheetOrder.value.push(newSheetId)
  switchToSheet(newSheetId)
}
```

Add to `<template>`, below the grid:

```html
<div class="sheet-tabs" role="tablist" aria-label="Sheets">
  <button
    v-for="sheetId in sheetOrder"
    :key="sheetId"
    role="tab"
    :aria-selected="sheetId === activeSheetId"
    :class="{ active: sheetId === activeSheetId }"
    @click="switchToSheet(sheetId)"
  >{{ sheetId }}</button>
  <button class="add-sheet" @click="addSheet" aria-label="Add sheet">+</button>
</div>
```

Add to `<style>`:

```css
.sheet-tabs { display: flex; gap: 4px; margin-top: 0.5rem; }
.sheet-tabs button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: #f1f5f9;
  font-size: 0.8rem;
  cursor: pointer;
}
.sheet-tabs button.active { background: white; font-weight: 600; border-color: #2563eb; }
.add-sheet { font-weight: bold; }
```

Click ▶ Run. Click `+` — a new `SHEET2` tab appears and becomes active. Type into a cell, switch back to `SHEET1` — `SHEET1`'s data is untouched; switch back to `SHEET2` — your edit is exactly where you left it.

**Walkthrough — `role="tablist"` and `role="tab"`, a new ARIA pattern, distinct from Lesson 15's grid pattern:**

Sheet tabs are a genuinely different UI pattern from the grid — a small set of mutually exclusive views, one visible at a time — and ARIA has a purpose-built pattern for exactly this: `role="tablist"` on the container, `role="tab"` on each button, `aria-selected` marking which one is currently active. This is the same family of thinking as Lesson 15's grid roles (a semantic vocabulary matched to the actual interaction shape) applied to a different, equally common composite widget.

**Walkthrough — why `switchToSheet` clears `selectedCoordinate` and `editingCoordinate`:**

A `Coordinate` (Lesson 01) has always meant "a position within whichever sheet is currently active" — it has no sheet field of its own. Switching sheets without clearing selection would leave `selectedCoordinate` pointing at, say, `{ col: 2, row: 3 }` on the newly active sheet, regardless of what was actually selected before switching — usually harmless, but capable of showing a stale, misleading selection outline on a cell the user never actually clicked on this sheet. Clearing it on every switch is the honest choice: a freshly-viewed sheet starts with nothing selected, matching what the user actually did.

**Honest scope note:** renaming and deleting sheets are real, expected spreadsheet features this lesson deliberately does not build — `addSheet`'s auto-generated `SHEET${n}` naming and the absence of any delete button are a scope cut, not an oversight, kept out to hold this lesson's focus on the state-architecture question (nested Records, per-sheet undo) and the grammar extension that follows, rather than UI-only work with no new CS/SE content of its own.

---

## Step 4 — Cross-sheet references in formulas: extending the grammar a second time

**The problem:** `=SHEET2!A1`, typed on `SHEET1`, needs to mean "go read `SHEET2`'s A1," not "look for a cell named `SHEET2` on the current sheet." Nothing in Lesson 18's grammar has a way to say "this cell reference belongs to a different sheet."

Update the grammar (Lesson 07's diagram, extended a second time):

```
Primary → Number
        | CellReference
        | SheetQualifiedCellReference
        | FunctionCall
        | "(" Expression ")"

SheetQualifiedCellReference → Identifier "!" CellReference
```

Add a `bang` token (`!`) to `tokenize`, alongside the existing single-character tokens:

```typescript
if (character === '!') {
  tokens.push({ type: 'bang' })
  position++
  continue
}
```

Add `bang` to the `Token` union, and add an optional `sheetId` field to `CellReferenceNode`:

```typescript
type Token =
  | { type: 'number';     value: number }
  | { type: 'cell';       name: string  }
  | { type: 'identifier'; name: string  }
  | { type: 'operator';   value: '+' | '-' | '*' | '/' }
  | { type: 'paren';      value: '(' | ')' }
  | { type: 'comma' }
  | { type: 'bang' }

interface CellReferenceNode {
  kind: 'CellReference'
  name: string
  sheetId?: SheetId
}
```

**The problem underneath that problem: `addSheet`'s own sheet names break this the moment you write it the obvious way.** `SHEET1`, `SHEET2` — every sheet name this project's own `addSheet` ever generates — has *exactly* the same shape as a real cell reference: letters, then digits. Lesson 06's tokenizer decides `cell` versus `identifier` purely by "did digits follow the letters" — it has no way to know that `SHEET2` here means a sheet, not the (nonexistent, in a 6-column grid) cell `SHEET2`. `tokenize("SHEET2!A1")` produces `{ type: 'cell', name: 'SHEET2' }`, not `{ type: 'identifier', name: 'SHEET2' }` — so a lookahead branch that only fires `if (token.type === 'identifier')` never runs at all for this exact formula. `parsePrimary` would hit its *existing* `cell` branch first, immediately return a bare `CellReference` for `SHEET2` alone, and leave `!A1` dangling — which `parse`'s own leftover-token check (Lesson 07) correctly reports as a parse error. Every cross-sheet formula on every auto-generated sheet name would fail, silently proving the feature "works" only for a hand-typed sheet name that happens not to end in a digit.

The fix is not a new tokenizer rule — it's recognizing that the sheet-qualifier lookahead has to run *before* `parsePrimary` commits to treating a leading token as a plain `cell` OR a plain `identifier`, since a sheet name can honestly tokenize as either shape:

```typescript
if (token.type === 'cell' || token.type === 'identifier') {
  const afterToken = tokens[position + 1]

  if (afterToken && afterToken.type === 'bang') {
    const sheetName = token.name
    advance()   // consume the sheet name — tokenized as 'cell' or 'identifier', either is fine here
    advance()   // consume '!'
    const cellToken = peek()
    if (!cellToken || cellToken.type !== 'cell') {
      throw new Error(`Expected a cell reference after "${sheetName}!"`)
    }
    advance()
    return { kind: 'CellReference', name: cellToken.name, sheetId: sheetName }
  }
}

if (token.type === 'cell') {
  advance()
  return { kind: 'CellReference', name: token.name }
}

if (token.type === 'identifier') {
  // ...existing function-call branch from Lesson 18, completely unchanged
}
```

**Walkthrough — why this check runs before either the `cell` or `identifier` branch, not inside one of them:**

A single up-front check — "does a `!` immediately follow this token, regardless of which token type it is?" — replaces two separate, duplicated checks that would otherwise have to live inside both the `cell` branch and the `identifier` branch. This is the same lesson every `assertNever`-guarded `switch` in this project has been teaching since Lesson 05, arriving from a different angle: when two branches of a decision need to share logic, that logic belongs *before* the branch, not copy-pasted into each one. Once this check finds no `bang` following, control falls through unchanged to `parsePrimary`'s original `cell` branch (a bare `CellReference`, exactly as before Lesson 19) or its original `identifier` branch (Lesson 18's function-call lookahead, completely untouched).

**Walkthrough — `tokens[position + 1]`, a second, deliberate form of lookahead:**

Lesson 18's `parsePrimary` decided "function call" purely by advancing past the identifier and *then* checking what `peek()` returned. This check decides *before* advancing at all, by looking one token past the current position directly — `tokens[position + 1]` — because the decision (sheet reference vs. everything else) has to be made before committing to consuming the leading token. Both are legitimate uses of lookahead; which one reads more clearly depends on exactly what's being decided. This project now has two real, working examples of a recursive-descent parser looking ahead before deciding how to proceed — worth noticing as a pattern in its own right, not just a one-off trick.

Update `evaluate`'s `'CellReference'` case, and `lookupCell`'s signature, to route by sheet. `evaluate` itself also declares the *type* of the `lookupCell` parameter it expects — that declaration has to grow the same second parameter, or `evaluate`'s own body (which now calls `lookupCell(node.name, node.sheetId)`, two arguments) stops matching the one-argument type it declared for its own parameter:

```typescript
function evaluate(
  node: ExpressionNode,
  lookupCell: (name: string, sheetId?: SheetId) => EvalResult
): EvalResult {
  switch (node.kind) {
    // ...every existing case unchanged
    case 'CellReference':
      return lookupCell(node.name, node.sheetId)
    // ...every existing case unchanged
  }
}
```

```typescript
function lookupCell(name: string, sheetId?: SheetId): EvalResult {
  const targetSheetCells = sheets.value[sheetId ?? activeSheetId.value]
  if (!targetSheetCells) return { kind: 'error', message: `Unknown sheet: ${sheetId}` }
  // ...existing lookup logic, unchanged, now reading from targetSheetCells instead of allCells
}
```

Click ▶ Run. On `SHEET1`, type `=SHEET2!A1`. Switch to `SHEET2`, type `42` into A1. Switch back to `SHEET1` — the formula shows `42`. Change `SHEET2`'s A1 to `100` — `SHEET1`'s formula updates automatically, across the sheet boundary, the same reactive chain (Lesson 09) that already connects same-sheet references.

**Walkthrough — `sheetId ?? activeSheetId.value`, the default that makes same-sheet references keep working unchanged:**

Every `CellReferenceNode` built before this lesson has no `sheetId` at all (`sheetId?:` — optional, Lesson 12's optional-field convention). `sheetId ?? activeSheetId.value` (Lesson 03's `??`) means: if this reference specified a sheet, use it; otherwise, assume the currently active one — exactly the behavior every same-sheet formula written since Lesson 09 already relies on, now expressed as the fallback case of a more general rule instead of the only case.

**The problem underneath that problem: there are two other `lookupCell`s, and `evaluate` doesn't know or care which one it's calling.**

`evaluate`'s `'CellReference'` case now always calls `lookupCell(node.name, node.sheetId)` — two arguments, every time. But this project has never had exactly one `lookupCell`. Lesson 08 and Lesson 10 already built two independent, single-purpose closures that each implement the same idea in their own context: one inside `displayCell` (what a cell actually shows in the grid), one inside `debugInfo` (Lesson 10's debug panel, already fixed once before for a different signature mismatch — see that lesson's Step 2b). Both were written with `lookupCell(name: string)` — one parameter. JavaScript does not error when a function is called with more arguments than it declares; the extra `sheetId` argument would simply be silently dropped, and both closures would keep resolving every reference against whichever sheet they already had in scope — the *wrong* sheet, for exactly the cross-sheet formulas this lesson exists to support. This would not throw, or look broken in any way that draws attention to itself: `=SHEET2!A1` would just silently show some *other* number — whatever `A1` (or nothing) resolves to on the wrong sheet — a wrong answer with total confidence, the worst kind of bug a spreadsheet can have.

Both need the identical fix `evaluate`'s own case already got: accept `sheetId?: SheetId`, and resolve through `sheets.value[sheetId ?? activeSheetId.value]` instead of whatever single-sheet data they closed over before.

Update `displayCell`'s inner `lookupCell` (used by `displayValues` — what every cell actually shows):

```typescript
function lookupCell(name: string, sheetId?: SheetId): EvalResult {
  const targetCells = sheetId !== undefined ? sheets.value[sheetId] : allCells
  const visitKey = `${sheetId ?? activeSheetId.value}:${name}`
  if (visiting.has(visitKey)) {
    return { kind: 'circular', chain: [...visiting, visitKey] }
  }
  const referenced = targetCells?.[name]
  if (!referenced)                  return { kind: 'ok', value: 0 }
  if (referenced.kind === 'number') return { kind: 'ok', value: referenced.value }
  if (referenced.kind === 'text')   return { kind: 'ok', value: 0 }

  const refParse = parse(tokenize(referenced.expr))
  if (refParse.success === false) return { kind: 'error', message: 'parse failed' }

  visiting.add(visitKey)
  const result = evaluate(refParse.ast, lookupCell)
  visiting.delete(visitKey)
  return result
}
```

Update `debugInfo`'s `lookupCell` the same way — sheet-aware, but keeping its existing one-level-deep simplification (Lesson 10 already scoped the debug panel to not fully recurse; this doesn't change that):

```typescript
function lookupCell(name: string, sheetId?: SheetId): EvalResult {
  const c = sheets.value[sheetId ?? activeSheetId.value]?.[name]
  if (!c || c.kind === 'text') return { kind: 'ok', value: 0 }
  if (c.kind === 'number') return { kind: 'ok', value: c.value }
  const pr = parse(tokenize(c.expr))
  return pr.success === true ? evaluate(pr.ast, () => ({ kind: 'ok', value: 0 })) : { kind: 'error', message: 'parse failed' }
}
```

**Walkthrough — why `visitKey` is `` `${sheetId}:${name}` ``, not just `name`:**

`visiting` (Lesson 09's circular-reference guard) tracked bare cell names because, with one sheet, a name was already unique. With multiple sheets, `SHEET1`'s `A1` and `SHEET2`'s `A1` are different cells that share a name — tracking `visiting` by name alone could either miss a genuine cross-sheet cycle (`SHEET1!A1 → SHEET2!A1 → SHEET1!A1` never repeats the bare string `"A1"` isn't even the issue here, but a subtler case does exist: two *different* cells named `A1` on two sheets would incorrectly be treated as "the same cell already being visited" the moment both happen to be mid-evaluation at once) or falsely flag two unrelated same-named cells on different sheets as circular when neither actually is. Prefixing every tracked name with its sheet id makes each entry in `visiting` uniquely identify one real cell, on one real sheet — the same fix, at the level of a `Set`'s keys, that `SheetId`-qualifying `CellId` conceptually needed the moment a second sheet became real.

---

## What breaks without this

**Reverting Step 1's `cells` to a plain `ref({})` instead of a `computed`:**

Sheet-switching would have nothing to reassign — every sheet would silently share the exact same underlying cell map, and editing `SHEET2` would visibly change `SHEET1`'s data too, since there was never more than one map to begin with.

**Skipping Step 2's per-sheet history:**

The corruption scenario Step 2 opens with — undo, after switching sheets, silently overwriting the wrong sheet's data with a stale snapshot from a different one — happens on the very first cross-sheet undo a real user attempts.

**Forgetting the `bang` token and reusing the plain `operator` type for `!`:**

`tokenize("SHEET2!A1")` would either throw on the unrecognized character or, worse, silently misclassify it, and `parsePrimary`'s new lookahead would never match — every cross-sheet formula would fail to parse, with an error nowhere near as clear as "expected a cell reference after SHEET2!".

**Only checking for `bang` inside the `identifier` branch, not the `cell` branch too:**

This is the bug this lesson's own worked example would have shipped with. `addSheet` names every sheet `SHEET${n}` — letters followed by digits, tokenized as a `cell` token, not `identifier`, by the exact same rule that turns `A1` into a `cell` token. `=SHEET2!A1` would tokenize `SHEET2` as `{ type: 'cell', name: 'SHEET2' }`, `parsePrimary`'s *existing*, untouched `cell` branch would return a bare `CellReference` for `SHEET2` alone before ever checking for a following `!`, and `parse` would then correctly report the leftover `!A1` as an unexpected token — every cross-sheet formula on every auto-generated sheet name fails to parse, while a hand-typed, non-digit-ending sheet name (`=Budget!A1`) would have worked, hiding the bug from a test that only tries the "obvious" case.

**Making `lookupCell`'s `sheetId` parameter required instead of optional:**

Every formula written before this lesson — every same-sheet cell reference in Lessons 09 through 18's own examples — would stop compiling, because none of them ever supplied a sheet id. The `sheetId ?? activeSheetId.value` fallback is what keeps eighteen lessons of prior formulas valid without modification.

**Updating `evaluate`'s `'CellReference'` case but leaving `displayCell`'s or `debugInfo`'s own `lookupCell` at one parameter:**

Nothing throws. `evaluate(node, lookupCell)` calls `lookupCell(node.name, node.sheetId)` regardless of how many parameters `lookupCell` itself declares — JavaScript silently drops extra call arguments a function never named. `=SHEET2!A1` would keep resolving against whichever single sheet that particular `lookupCell` closure already had in scope, producing a confident, wrong number with no error anywhere — the grid would show the wrong value for a cross-sheet formula, silently, while the debug panel might show a *different* wrong value, since it's a second, independently-scoped closure with the identical bug.

---

## Connect the pieces

```
App.vue
  type SheetId = string
  sheets            ref<Record<SheetId, Record<CellId, Cell>>>
  sheetOrder         ref<SheetId[]>                      — tab display order
  activeSheetId      ref<SheetId>
  cells              computed(() => sheets.value[activeSheetId.value])
                                                          — unchanged by every function that reads it
  history, redoStack  Record<SheetId, Array<...>>          — per-sheet, fixes cross-sheet undo corruption
  switchToSheet(), addSheet()
  Token               — + bang
  CellReferenceNode   — + optional sheetId
  parsePrimary()      — + sheet-qualified lookahead, checked for both 'cell' and 'identifier' tokens
                          (sheet names like SHEET2 tokenize as 'cell', same shape as a real cell ref),
                          falling through unchanged to Lesson 18's original cell/identifier branches
  evaluate()'s 'CellReference' case  — lookupCell(node.name, node.sheetId)
  displayCell()'s lookupCell         — sheet-aware; visiting keyed by "sheetId:name" for correct
                                        cross-sheet circular-reference detection
  debugInfo()'s lookupCell           — sheet-aware; keeps its existing one-level-deep simplification
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Clicking `+` creates a new sheet tab and switches to it
- [ ] Editing one sheet never changes another sheet's data
- [ ] Undo/redo, after switching sheets, only ever affects the sheet it was recorded on
- [ ] `=SHEET2!A1` on one sheet correctly reads and reactively tracks another sheet's cell
- [ ] The debug panel (Lesson 09) shows the correct value for a formula cell that references another sheet, not just same-sheet formulas
- [ ] `=SHEET2!A1` works using the actual auto-generated sheet name from clicking `+`, not just a hand-typed one
- [ ] You can explain why `SHEET2` tokenizes as a `cell` token, not an `identifier`, and why the sheet-qualifier lookahead has to check both
- [ ] You can explain why `cells` could stay a working `computed` instead of every call site being rewritten
- [ ] You can reproduce, by disabling Step 2's fix, the cross-sheet undo corruption bug this lesson opens with
- [ ] You can explain the two different points in `parsePrimary` where this project now performs lookahead, and why each looks ahead at a different moment

---

*Next: Lesson 20 — Leaving the Sandbox, the series finale. This exact project, running as a real local project on your own machine: a real terminal, `npm`, a real `git` history, real Vitest replacing Lesson 14's hand-built harness, and a real deploy — every tool explained from first principles the same way every concept in this series has been, plus the real Agile/Scrum team vocabulary a solo learner never had occasion to meet until now.*
