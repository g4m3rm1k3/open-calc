# Vue Spreadsheet — Lesson 15 — Keyboard Navigation and the ARIA Grid Pattern

## What you will build

Click a cell, then never touch the mouse again: arrow keys move the selection one cell at a time, clamped to the grid's edges. Pressing Enter while editing commits the value *and* moves selection down one row — the same behavior every real spreadsheet has trained you to expect without ever thinking about it. A screen reader, tested with the browser's own accessibility inspector, announces each cell's address and content as you move. Tab reaches the grid as a single stop, not sixty — and once inside, arrow keys, not Tab, do the moving.

```
Before this lesson: sixty <td> elements, zero of them reachable without a mouse.
After:             one Tab stop into the grid; ArrowUp/Down/Left/Right inside it;
                    Enter commits and drops to the next row, exactly like Excel.
```

---

## What you need to know first

Lesson 12 split the grid into `SpreadsheetGrid.vue` (renders the table shell, owns click/dblclick) and `CellDisplay.vue` (renders one cell, either its value or an edit `<input>`), sharing state through `useSpreadsheet()`. Lesson 13 introduced ARIA in a narrow context — `aria-pressed` on toggle buttons, `aria-label` on unlabeled color swatches, `role="toolbar"`. This lesson returns to ARIA and treats it as the much larger vocabulary it actually is: a whole family of roles and states designed specifically for exactly this project's shape — a grid of interactive cells.

---

## Concept: what currently happens with no mouse, and why that's a real defect, not an edge case

Unplug your mouse, right now, and try to use this project's grid using only the keyboard. Nothing works. `<td>` is not a naturally focusable element — no `tabindex`, no keyboard listener, nothing. `Tab` walks past the entire sixty-cell grid without ever landing inside it; the only reachable controls are the formula bar and the format toolbar, both fixed by Lessons 12 and 13's deliberate use of real `<button>` and `<input>` elements. Every cell — the actual spreadsheet — is completely unreachable without a pointing device.

This is not a rare situation being over-engineered against. Keyboard-only use covers several overlapping, common real populations: users with motor impairments who cannot operate a mouse precisely, screen-reader users (who navigate by keyboard as a rule, since a screen reader has no way to know where a mouse cursor visually is), and — a population every engineer eventually joins — anyone with a broken trackpad, an unplugged mouse, or simply a power user who finds arrow-key navigation faster than reaching for a mouse for every single cell, the way real spreadsheet users overwhelmingly work in Excel and Google Sheets. A spreadsheet that cannot be driven by keyboard is not a spreadsheet with a minor gap. It fails at the one interaction pattern its entire real-world category is built around.

**Legal and professional context, stated plainly:** the Web Content Accessibility Guidelines (WCAG) — already this project's basis for Lesson 13's contrast-ratio work — require keyboard operability for all interactive functionality (Success Criterion 2.1.1, Keyboard). This is not a stylistic preference; it is enforceable in many jurisdictions under disability-rights law (in the US, the Americans with Disabilities Act has been applied to inaccessible websites in real litigation), and it is standard practice at any company building software used by the general public or by government agencies (US federal sites require Section 508 compliance, which incorporates WCAG directly). Accessibility work is professional engineering practice, not a nice-to-have layered on afterward.

---

## Concept Lab — roving tabindex, built on a disposable toolbar first

**The problem this lab isolates:** a grid of sixty cells cannot each be a normal Tab stop — a user would have to press Tab sixty times to get past the grid to whatever comes next on the page. But the cells still need to be individually focusable once the user is *inside* the grid. This is a real, named, general pattern — **roving tabindex** — and it deserves to be understood on something with no spreadsheet complexity attached before it's applied to real cells.

Run this throwaway — five buttons in a row, standing in for any composite widget (a toolbar, a tab list, a grid):

```vue
<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref(0)

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowRight') {
    activeIndex.value = Math.min(activeIndex.value + 1, 4)
    focusActive()
  } else if (event.key === 'ArrowLeft') {
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    focusActive()
  }
}

function focusActive(): void {
  document.getElementById('btn-' + activeIndex.value)?.focus()
}
</script>

<template>
  <div style="display:flex; gap:8px">
    <button
      v-for="i in [0, 1, 2, 3, 4]"
      :key="i"
      :id="'btn-' + i"
      :tabindex="i === activeIndex ? 0 : -1"
      @keydown="onKeydown"
      @click="activeIndex = i"
    >Button {{ i }}</button>
  </div>
</template>
```

Click ▶ Run. Click "Button 0," then press Tab — focus leaves the whole row in *one* Tab press, not five. Click back into the row, then use ArrowLeft/ArrowRight — focus moves button to button without ever touching Tab.

**Walkthrough — `tabindex`, an attribute with three distinct meanings depending on its value:**

`tabindex` is a real HTML attribute (`:tabindex` here binds it dynamically, the same attribute-binding pattern as every `:id` and `:class` since Lesson 01) that controls two separate things: whether an element can receive focus at all, and where it sits in the page's Tab order.

- **`tabindex="0"`** — this element is focusable, and it sits in the *natural* Tab order (wherever it appears in the page).
- **`tabindex="-1"`** — this element is focusable *programmatically* (a real `.focus()` call, from your own code, will work), but `Tab` skips over it entirely. This is the value every element in this row has *except* the currently active one.
- **No `tabindex` at all**, on an element like `<div>` or `<td>` that isn't naturally interactive, means the element cannot receive focus by any means — not by Tab, not by `.focus()`.

**Roving tabindex, named precisely:** exactly one element in the group has `tabindex="0"` at any moment — the "currently active" one — and every other element in the same group has `tabindex="-1"`. Tab reaches the group once, landing on whichever element currently holds `tabindex="0"`. From there, arrow keys move `activeIndex`, which moves *which* element holds `tabindex="0"` — the `:tabindex="i === activeIndex ? 0 : -1"` binding recalculates on every re-render — and a manual `.focus()` call (in `focusActive`) moves the browser's actual focus to match. The "roving" part of the name is exactly this: the single `0` value rove­s from element to element as the user navigates, rather than every element holding `0` simultaneously.

**Walkthrough — `document.getElementById(...)?.focus()`, and why `:tabindex` alone isn't enough:**

Changing which element has `tabindex="0"` does not, by itself, move the browser's actual focus — it only changes what happens the *next* time someone presses Tab. If the user is already inside the widget using arrow keys, `activeIndex.value = ...` alone would silently update state with no visible or audible effect: the highlighted, screen-reader-announced element wouldn't change at all. `.focus()` — a real method on every focusable DOM element — is what actually moves focus, immediately, and it's why `focusActive()` is called explicitly after every arrow-key press rather than relied upon to happen automatically. `?.` here is **optional chaining**: `document.getElementById(...)` returns `Element | null` (Lesson 01's `document.getElementById` behavior, unchanged); `?.focus()` calls `.focus()` only if the left side wasn't `null`, silently doing nothing otherwise — a defensive guard against a typo'd id ever throwing a hard error.

**This lab is now finished — it is deleted and will not appear in the project again.** The five-button row's entire mechanism — one field tracking "which item is active," a `:tabindex` binding derived from it, a keydown handler that updates it and calls `.focus()` — is exactly what the grid needs next, at sixty cells instead of five.

*Recognized elsewhere:* roving tabindex is not a technique invented for this lesson — it is the **W3C ARIA Authoring Practices Guide's** official recommended pattern for every composite keyboard widget: tab lists, toolbars (Lesson 13's own `role="toolbar"` was already hinting at this), menus, and — precisely — grids. Google Sheets' and Excel Online's own cell grids use this exact pattern. You are not approximating professional practice; you are implementing the specified one.

---

## Step 1 — ARIA roles for the grid, and `aria-selected`

**The problem:** `<table>`, `<tr>`, and `<td>` already carry *implicit* ARIA roles from being real HTML table elements — but their implicit roles (`table`, `row`, `cell`) describe *static, readable* tabular data, not an interactive, navigable grid. A screen reader treats a plain `<table>` as something to read cell by cell, not something to navigate and edit.

Update `SpreadsheetGrid.vue`'s template:

```html
<template>
  <table class="spreadsheet" role="grid" aria-label="Spreadsheet">
    <thead>
      <tr role="row">
        <th></th>
        <th
          v-for="col in columns"
          :key="col"
          role="columnheader"
          :aria-colindex="col + 2"
        >{{ columnLetter(col) }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row" role="row" :aria-rowindex="row + 2">
        <th role="rowheader">{{ row + 1 }}</th>
        <td
          v-for="col in columns"
          :key="col"
          :id="'cell-' + cellId({ col, row })"
          role="gridcell"
          :aria-selected="isCellSelected(col, row)"
          :aria-rowindex="row + 2"
          :aria-colindex="col + 2"
          :tabindex="isCellSelected(col, row) ? 0 : -1"
          @click="selectCell({ col, row })"
          @dblclick="startEditing({ col, row })"
          @keydown="onCellKeydown($event, col, row)"
        >
          <CellDisplay :col="col" :row="row" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

**Walkthrough — `role="grid"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, `role="gridcell"`, the ARIA grid pattern's full vocabulary:**

The `role` attribute overrides or clarifies what kind of thing an element is, for assistive technology, independent of what HTML tag it happens to be. `role="grid"` on the `<table>` tells a screen reader "treat this as an interactive, two-dimensional, navigable grid" — richer than the plain reading-table behavior a bare `<table>` gets by default. Every cell inside must then declare its own role: `role="columnheader"` and `role="rowheader"` for the label cells (column letters, row numbers), `role="gridcell"` for the actual sixty data cells, and `role="row"` for each `<tr>`, tying the structure together. This is a matched *set* — the ARIA grid pattern doesn't work with only some of these roles present; a screen reader inferring "grid" from `role="grid"` but finding plain, unmarked `<td>`s inside would have no reliable way to know which cells are headers and which are data.

**Walkthrough — `aria-rowindex` and `aria-colindex`, position a sighted user sees instantly but a screen-reader user cannot:**

A sighted user glancing at the grid immediately perceives "this is column B, row 3" from position alone. A screen-reader user, landing on one cell at a time with no visual overview, has no equivalent — `aria-rowindex`/`aria-colindex` supply that position explicitly, as numbers, so the screen reader can announce "row 3, column B" the same way a sighted user perceives it instantly. The `+ 2` (not `+ 1`) exists because ARIA's row/column indices count the header row and header column as row/column `1` — `col`/`row` in this project's own zero-based coordinate system need one shift to become 1-based (the same `+ 1` reasoning as `cellId`'s row-label conversion from Lesson 01), and a second shift to account for the header occupying index `1` ahead of the first real data column or row.

**Walkthrough — `aria-selected`, the accessible counterpart to `.cell-selected`:**

`:aria-selected="isCellSelected(col, row)"` reuses the exact same function Lesson 02 built for the `.cell-selected` CSS class — one function, two consumers, an SRP-friendly reuse rather than a duplicated check. This is the same "communicate the same state two independent ways" principle from Lesson 02's outline-plus-fill-color selection style and Lesson 13's `aria-pressed`: `.cell-selected`'s blue outline is the sighted signal, `aria-selected="true"` is the signal a screen reader actually announces ("selected") — sighted and non-sighted users each get a full, independent account of which cell is active.

---

## Step 2 — Arrow keys move selection and DOM focus together

**The problem:** `tabindex` alone lets a cell *receive* focus; nothing yet moves the selection or the browser's actual focus in response to arrow keys.

Add `moveSelection` to `App.vue`'s `<script setup>`, alongside `selectCell`:

```typescript
function moveSelection(deltaCol: number, deltaRow: number): void {
  const current = selectedCoordinate.value ?? { col: 0, row: 0 }
  const nextCoordinate: Coordinate = {
    col: Math.max(0, Math.min(COLUMN_COUNT - 1, current.col + deltaCol)),
    row: Math.max(0, Math.min(ROW_COUNT - 1, current.row + deltaRow)),
  }
  selectCell(nextCoordinate)
  document.getElementById('cell-' + cellId(nextCoordinate))?.focus()
}
```

Add `onCellKeydown` alongside it:

```typescript
function onCellKeydown(event: KeyboardEvent, col: number, row: number): void {
  const arrowDeltas: Record<string, [number, number]> = {
    ArrowUp:    [0, -1],
    ArrowDown:  [0, 1],
    ArrowLeft:  [-1, 0],
    ArrowRight: [1, 0],
  }
  const delta = arrowDeltas[event.key]
  if (!delta) return

  event.preventDefault()
  moveSelection(delta[0], delta[1])
}
```

Add both to `SpreadsheetContext` and the `provide(SPREADSHEET_KEY, { ... })` call from Lesson 12, and destructure `onCellKeydown` in `SpreadsheetGrid.vue` from `useSpreadsheet()`.

Click ▶ Run. Click any cell, then press an arrow key: the selection — and the browser's real, visible focus outline — moves one cell in that direction, stopping cleanly at the grid's edges instead of wrapping or erroring.

**Walkthrough — `Math.max(0, Math.min(COLUMN_COUNT - 1, ...))`, clamping to bounds:**

This is the same `Math.max`/`Math.min` pair from Lesson 13's contrast-ratio lab, applied here for a different purpose: **clamping** — forcing a value to stay within a range. `Math.min(COLUMN_COUNT - 1, current.col + deltaCol)` prevents the column from ever exceeding the grid's last valid index; the outer `Math.max(0, ...)` prevents it from ever going below `0`. Pressing ArrowLeft repeatedly at column `0` keeps recomputing `Math.max(0, -1)`, which is always `0` — the selection simply stops at the edge instead of erroring or wrapping to the opposite side (wrapping is a legitimate design choice some real spreadsheets make; this project deliberately doesn't, favoring predictability over a cleverness a first-time user wouldn't expect).

**Walkthrough — `Record<string, [number, number]>`, and why a lookup table instead of an `if`/`else if` chain:**

`arrowDeltas` maps each arrow key's exact string (`event.key` for the up arrow is literally the string `'ArrowUp'` — a real, specific browser API detail, not this project's naming) to a `[number, number]` **tuple** — an array with a fixed length and a known type at each position, here representing `[deltaCol, deltaRow]`. This is the same `Record<K, V>` lookup-table pattern from Lesson 03's `rawValues`, applied to keyboard keys instead of cell addresses. `const delta = arrowDeltas[event.key]` looks up the pressed key in one line; `if (!delta) return` handles every other key (letters, Tab, Shift) by simply doing nothing, without an `if/else if` chain checking four string comparisons by hand. Adding a fifth navigable key later — Home, say — means adding one entry to the table, not one more `else if` branch.

**Walkthrough — `event.preventDefault()` on arrow keys:**

Arrow keys have a native browser default behavior even outside of any input: scrolling the page. Without `preventDefault()` (Lesson 03's distinction between this and `stopPropagation()` applies again here, unchanged), pressing ArrowDown on a cell near the bottom of a tall page would both move the selection *and* scroll the browser window — two things happening from one keypress, only one of which this project wants.

---

## Step 3 — Enter commits and moves down, the behavior every spreadsheet user already expects

**The problem:** Lesson 11 wired `Enter` to *start* editing a selected cell. Nothing currently makes `Enter`, pressed while *already* editing, move selection down afterward — the muscle-memory behavior from every real spreadsheet, where committing a row of values means typing, pressing Enter, typing, pressing Enter, without ever touching an arrow key.

Update `CellDisplay.vue`'s `@keydown.enter.stop` handler:

```html
<input
  class="cell-input"
  :value="editableText(cells[cellId({ col: props.col, row: props.row })])"
  @keydown.enter.stop="() => {
    commitEdit({ col: props.col, row: props.row }, ($event.target as HTMLInputElement).value)
    moveSelection(0, 1)
  }"
  @blur="commitEdit({ col: props.col, row: props.row }, ($event.target as HTMLInputElement).value)"
  :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
/>
```

Destructure `moveSelection` from `useSpreadsheet()` in `CellDisplay.vue` alongside its existing imports.

Click ▶ Run. Double-click a cell, type a value, press Enter: the value commits, editing ends, *and* the cell one row down is now selected and focused — ready to type into immediately.

**Walkthrough — an inline arrow function as the whole handler body, instead of a single expression:**

Every earlier `@keydown` handler in this series has been one expression — `commitEdit(...)`, a single function call. `() => { commitEdit(...); moveSelection(0, 1) }` is an arrow function (Lesson 01) wrapping *two* statements, used here because Vue's inline event-handler syntax accepts either a bare expression or a function; wrapping multiple statements in a function is how you run more than one thing in response to one event without pulling the logic out into a named method. `moveSelection(0, 1)` reuses Step 2's function exactly — `deltaCol: 0`, `deltaRow: 1` — one row down, no column change, the same function arrow-key presses call, called here for a different reason.

**Why `@blur` does *not* also call `moveSelection`:**

Lesson 03 already established that `blur` fires as a side effect of `Enter`'s own `v-if` branch-replacement removing the input from the DOM — calling `moveSelection` from `@blur` too would move the selection an *additional* time on top of the Enter handler's own call, landing two rows down instead of one. `@blur`'s only job remains committing the value for the click-elsewhere case; moving the selection is deliberately scoped to the Enter path alone.

---

## Step 4 — Announcing changes to a screen reader with `aria-live`

**The problem:** `aria-selected` and `aria-rowindex`/`aria-colindex` tell a screen reader *where* the current cell is if it asks — but nothing proactively *announces* a change out loud when the selection moves. A sighted user sees the blue outline jump instantly; a screen-reader user, without an announcement, would have no idea anything happened until they specifically re-query the current cell.

Add to `App.vue`'s `<template>`, anywhere visually hidden is acceptable (it is never meant to be seen):

```html
<div
  class="sr-only"
  role="status"
  aria-live="polite"
>
  {{ selectionAnnouncement }}
</div>
```

Add the computed value to `<script setup>`:

```typescript
const selectionAnnouncement = computed(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return ''
  const address = cellId(sel)
  const content = displayValues.value[address] ?? 'empty'
  return `${address}, ${content}`
})
```

Add to `<style>`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Click ▶ Run. Visually, nothing changes — the announcement region is invisible by design. Open a screen reader (macOS: VoiceOver, Cmd+F5; Windows: NVDA, free) and move the grid selection: each move is announced — "B1, 15," "C1, empty."

**Walkthrough — `aria-live="polite"`, and why not `"assertive"`:**

An **`aria-live` region** is an element a screen reader watches continuously; any time its text content changes, the screen reader announces the new content automatically, without the user needing to navigate to it. `"polite"` means the announcement waits for whatever the screen reader is currently saying to finish before speaking — it queues politely. `"assertive"` interrupts immediately, cutting off whatever's currently being announced. Selection changes here are frequent (every arrow key press) and never urgent — `"assertive"` would be genuinely disruptive, cutting off a screen reader mid-sentence dozens of times during normal use. `"assertive"` is reserved for things that truly can't wait — a critical error, a session about to expire. `role="status"` reinforces `aria-live="polite"` for older screen readers that read the role before the live-region attribute.

**Walkthrough — `.sr-only`, a real, standard CSS pattern for content that must exist but never be seen:**

Every property in `.sr-only` works together to make an element completely invisible on screen while remaining fully present in the DOM (and therefore fully readable to a screen reader, which reads DOM content and accessibility attributes, not pixels). `display: none` or `visibility: hidden` would *also* hide the element from assistive technology — screen readers skip elements hidden that way, on the reasonable assumption that if it's hidden from everyone, it's hidden on purpose for everyone. `.sr-only`'s combination (a 1×1 pixel box, clipped to nothing, overflow hidden, positioned out of flow) keeps the element technically present and rendered — just utterly imperceptible visually. This exact class name and property set, not just the general idea, is a widely reused convention — you will find a `.sr-only` or `.visually-hidden` class defined almost identically in Bootstrap, Tailwind CSS, and most production design systems.

**Why this data flows through a `computed`, not an imperative announcement call:**

`selectionAnnouncement` is derived reactively from `selectedCoordinate` and `displayValues`, the same pattern as every `computed` since Lesson 06's `debugTokens` — no explicit "announce now" call exists anywhere, including inside `moveSelection`. The `aria-live` region watches for *any* change to its own text content, and the `computed` guarantees that text updates automatically and correctly whenever the selection or the underlying cell content changes — including from *any* cause, not just arrow keys: clicking a cell, or another cell's formula recalculating the currently-selected cell's displayed value, both update the announcement correctly, for free, because reactivity does not care which code path caused the change.

---

## The Design lens — the focus ring you did not build, and must never remove

Every cell that receives keyboard focus in this lesson shows the browser's own default focus ring — a native outline the browser draws automatically on any focused element, completely independent of this project's own `.cell-selected` styling. This is worth calling out explicitly because removing it is one of the most common real accessibility failures on the web: `*:focus { outline: none }`, often added by a developer who thought the default outline looked visually unpolished, with nothing put in its place. Doing that here would leave keyboard users with *zero* visual indication of where they are in the grid — arrow keys would still move `selectedCoordinate` and `aria-selected` correctly, but a sighted keyboard user watching the screen would see nothing confirming it. If you ever do want to restyle the default focus ring instead of keeping the browser's, the rule is not "remove it" — it's "replace it with something at least as visible," matching this project's own `.cell-selected` outline, which happens to already coexist with the native ring without conflict.

*Recognized elsewhere:* "removed default focus outline with nothing replacing it" is one of the most frequently cited failures in real accessibility audits (Lesson 13's contrast-checker tools, axe and Lighthouse, both flag it directly) — common enough that it has its own name in accessibility circles: "sighted keyboard users are the most commonly forgotten population," neither covered by mouse-only testing nor by screen-reader testing alone.

---

## What breaks without this

**Setting every cell's `tabindex` to `0` instead of using roving tabindex:**

Tab would need to be pressed sixty times to move past the grid — the exact problem this lesson exists to fix, reintroduced. Roving tabindex's entire value is collapsing the grid into one Tab stop while remaining fully navigable once inside.

**Forgetting `event.preventDefault()` in `onCellKeydown`:**

Pressing ArrowDown near the bottom of a tall page moves the selection correctly *and* scrolls the browser window — both happen, because the browser's native "arrow keys scroll the page" behavior was never told to stop.

**Using `aria-live="assertive"` instead of `"polite"`:**

Every arrow-key press interrupts the screen reader mid-sentence, even if it was still announcing the *previous* cell. Rapid navigation becomes a garbled, half-spoken mess instead of a clean sequence of complete announcements.

**Calling `moveSelection` from both `@keydown.enter.stop` and `@blur`:**

Pressing Enter fires both handlers in sequence (Lesson 03's DOM-removal-triggers-blur chain, unchanged) — selection would move down *twice*, landing two rows below the edited cell instead of one, silently, with no error to reveal why.

---

## Connect the pieces

```
App.vue
  <script setup>
    moveSelection(deltaCol, deltaRow)  — clamps to grid bounds; selectCell + .focus()
    onCellKeydown(event, col, row)     — arrow-key lookup table; preventDefault; delegates
    selectionAnnouncement              — computed; feeds the aria-live region
  provides moveSelection, onCellKeydown via SpreadsheetContext

SpreadsheetGrid.vue
  role="grid", role="row", role="columnheader", role="rowheader"
  <td role="gridcell" :aria-selected :aria-rowindex :aria-colindex :tabindex @keydown="onCellKeydown">

CellDisplay.vue
  @keydown.enter.stop — commitEdit, then moveSelection(0, 1)

App.vue <template>
  <div class="sr-only" role="status" aria-live="polite"> — announces selectionAnnouncement
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Clicking a cell, then pressing arrow keys, moves the selection and the visible browser focus ring together
- [ ] Arrow keys stop cleanly at the grid's edges — no wrapping, no error
- [ ] Tab reaches the grid in one stop; arrow keys, not Tab, move between cells once inside
- [ ] Typing a value and pressing Enter commits it and selects the cell one row down
- [ ] With a screen reader running, moving the selection announces the cell's address and content
- [ ] You can explain the three meanings of `tabindex="0"`, `tabindex="-1"`, and no `tabindex` at all
- [ ] You can explain why `aria-live="polite"` was chosen over `"assertive"`
- [ ] You can explain why `.sr-only` hides content visually without hiding it from a screen reader, and how that differs from `display: none`
- [ ] You can explain why `moveSelection` is called from the Enter handler but not from `@blur`

---

*Next: Lesson 16 — A Plugin System. `CellDisplay.vue` gains new ways to render a cell — a boolean checkbox, negative numbers in red — through a Strategy-pattern plugin registry, added without ever touching `CellDisplay.vue`'s own code again, and this series' first real security lesson: why a plugin can change a cell's text, but never its HTML.*
