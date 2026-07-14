# Vue Spreadsheet — Lesson 17 — Performance at Scale: Virtualizing the Grid

## What you will build

Grow this project's grid from 10 rows to 10,000 — and watch it become genuinely, visibly unusable: a multi-second freeze on every keystroke, a browser tab straining to hold 60,000 real DOM cells. Then fix it with **virtualization**: at any moment, only the roughly 20 rows actually visible in the viewport exist as real DOM nodes — the other 9,980 do not exist until scrolled into view. The grid ends this lesson feeling identical to use, at any row count, because rendering cost stops depending on how much data exists at all.

```
Before: ROW_COUNT = 10,000  →  60,000 real <td> elements  →  the tab visibly freezes
After:  ROW_COUNT = 10,000  →  ~120 real <td> elements at any moment  →  instant
```

---

## What you need to know first

Lesson 12's component split (`SpreadsheetGrid.vue`, `CellDisplay.vue`) and Lesson 15's ARIA grid roles and `moveSelection`/keyboard-focus system both get restructured in this lesson — not because they were wrong, but because virtualization changes a real, load-bearing assumption both were built on: that every cell's DOM element always exists. This lesson is the first time that assumption stops being true, and both systems need a small, precise fix as a result.

---

## Concept: the browser's frame budget, made concrete

A browser aims to redraw the screen 60 times per second — **60fps**. That gives every single frame a budget of `1000ms / 60 ≈ 16.6ms` to do everything needed before the next redraw: run your JavaScript, recalculate layout, repaint pixels. Miss that budget on one frame, and the browser has nothing new to show — the previous frame stays on screen a little longer, which a human eye perceives as a stutter, commonly called **jank**. Miss it by a lot — hundreds of milliseconds, single-digit seconds — and the page doesn't stutter, it **freezes**: JavaScript is single-threaded (Lesson 01), so one long-running synchronous block of work (like creating sixty thousand DOM elements in a single `v-for` pass) blocks everything else, including scrolling, clicking, and typing, until it finishes.

This project's grid has never needed to think about this, because it has never had a **hot path** — code whose cost scales with data size, run somewhere a user actually notices. Sixty cells, created once, is negligible at any reasonable measure. Ten thousand rows changes that completely, and this lesson's whole job is making that change, then fixing what it breaks.

---

## Concept Lab — measuring render cost directly, before fixing anything

**The problem this lab isolates:** "creating a lot of DOM nodes is slow" should not be taken on faith — it should be measured, on something with zero spreadsheet complexity, using the browser's own real timing tool.

Run this throwaway:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const itemCount = ref(100)
const items = ref<number[]>(Array.from({ length: 100 }, (_, i) => i))
const lastRenderMs = ref(0)

function regenerate(count: number): void {
  const start = performance.now()
  itemCount.value = count
  items.value = Array.from({ length: count }, (_, i) => i)
  requestAnimationFrame(() => {
    lastRenderMs.value = performance.now() - start
  })
}
</script>

<template>
  <div>
    <button @click="regenerate(100)">100 items</button>
    <button @click="regenerate(10000)">10,000 items</button>
    <button @click="regenerate(100000)">100,000 items</button>
    <p>Last change took: {{ lastRenderMs.toFixed(1) }}ms</p>
    <div style="height:200px; overflow:auto; border:1px solid #ccc">
      <div v-for="i in items" :key="i" style="height:20px">Item {{ i }}</div>
    </div>
  </div>
</template>
```

Click ▶ Run. Click "100 items" — a near-instant, sub-millisecond-to-low-single-digit number. Click "100,000 items" — a number in the hundreds of milliseconds, likely accompanied by a genuine, visible stutter as the browser creates a hundred thousand real `<div>` elements at once.

**Walkthrough — `performance.now()`, a browser API built specifically for this measurement:**

`performance.now()` returns a high-precision timestamp, in milliseconds, measured from when the page started loading — unlike `Date.now()` (which measures wall-clock time and can jump if the system clock changes), `performance.now()` is monotonic and precise enough to measure code that runs in fractions of a millisecond. Calling it once before a change and once after — `performance.now() - start` — is the standard way to measure how long a piece of code actually took, rather than guessing.

**Walkthrough — `requestAnimationFrame`, and why the measurement waits for it:**

`requestAnimationFrame(callback)` schedules `callback` to run right before the browser's next repaint — Lesson 01's "60fps" idea, given a real API. Measuring `performance.now() - start` synchronously, immediately after `items.value = ...`, would only capture how long it took Vue to *schedule* the update, not how long the browser actually took to build and paint the new DOM — Vue's reactivity (Lesson 03) batches DOM updates to happen asynchronously, not the instant a `ref` is written. Wrapping the measurement in `requestAnimationFrame` waits until the browser has actually finished the visual work before recording the elapsed time, which is what makes the number on screen honest.

**This lab is now finished — it is deleted and will not appear in the project again.** The number it produced is the whole point: the *technique that fixes it* is what the rest of this lesson builds.

---

## Step 1 — Prove the problem is real, in this project specifically

**The problem:** Before building a fix, per this series' Agile Delivery discipline since Lesson 01 — never solve a problem you haven't first made visible — the actual slowdown needs to happen, in this actual grid, not just be asserted.

In `App.vue`, change:

```typescript
const ROW_COUNT = 10
```

to:

```typescript
const ROW_COUNT = 10000
```

Click ▶ Run. Depending on your machine, this takes anywhere from a very noticeable pause to several full seconds of an unresponsive tab — `Array.from({ length: 10000 }, ...)` for `rows`, then a `v-for` creating `10000 × 6 = 60000` real `<td>` elements, all in one synchronous burst, comfortably blowing past the 16.6ms frame budget by a factor of hundreds.

**Do not fix this yet.** Confirm the freeze is real, then continue — the rest of this lesson exists entirely to make this exact change harmless.

---

## Step 2 — From a `<table>` to a virtualized ARIA grid

**The problem:** A native HTML `<table>` lays out all of its rows together, as one unit — there is no way to tell a `<table>` "only build ten of your rows right now, and reposition them as the user scrolls." Virtualization requires each visible row to be independently, absolutely positioned, which `<table>` layout does not support.

**Where does this new state live? The same place every other piece of shared state in this project already lives, for a reason worth being precise about.** `viewportEl` — the real scrollable DOM element — has to be a ref local to whichever component's `<template>` attaches it: Vue's template-ref mechanism only binds `ref="name"` to a name available in *that exact component's* own `<script setup>`. That component is `SpreadsheetGrid.vue`. But `scrollRowIntoView` (Step 3) is called from `moveSelection`, which lives in `App.vue` alongside every other action this project defines — and `App.vue` cannot reach into a child component's local variables; Vue components don't expose their internals upward.

The fix uses a property `provide`/`inject` already has that this project hasn't needed until now: `provide` shares the *same* `Ref` object with every injector — not a copy. `App.vue` creates `viewportEl = ref<HTMLElement | null>(null)` and provides it exactly like `cells` or `selectedCoordinate`; `SpreadsheetGrid.vue` injects that identical object via `useSpreadsheet()` and writes `ref="viewportEl"` in its own template. The DOM element Vue attaches after mount is written into *that same shared object* — both components hold a reference to one `Ref`, not two independent ones, so `App.vue`'s `moveSelection` sees the real element the instant `SpreadsheetGrid.vue` mounts it. `scrollTop`, `onScroll`, `totalHeight`, and `visibleRows` move to `App.vue` for the identical reason: `App.vue` is this project's one and only state owner (Lesson 12's entire reason `provide`/`inject` exists), and `SpreadsheetGrid.vue` reads all of them the same way it already reads `cells` or `columns` — through `useSpreadsheet()`, never by declaring its own copy.

Add to `spreadsheet-context.ts`'s `SpreadsheetContext`:

```typescript
  viewportEl: Ref<HTMLElement | null>
  onScroll: (event: Event) => void
  totalHeight: ComputedRef<number>
  visibleRows: ComputedRef<number[]>
  ROW_HEIGHT: number
```

Add to `App.vue`'s `<script setup>` (`ref`/`computed` are already imported from earlier lessons):

```typescript
const ROW_HEIGHT = 28
const VIEWPORT_HEIGHT = 400
const BUFFER_ROWS = 4

const viewportEl = ref<HTMLElement | null>(null)
const scrollTop = ref(0)

function onScroll(event: Event): void {
  scrollTop.value = (event.target as HTMLElement).scrollTop
}

const totalHeight = computed(() => ROW_COUNT * ROW_HEIGHT)

const visibleRows = computed(() => {
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT)
  const firstRow = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER_ROWS)
  const lastRow = Math.min(ROW_COUNT - 1, firstRow + visibleCount + BUFFER_ROWS * 2)
  const result: number[] = []
  for (let row = firstRow; row <= lastRow; row++) result.push(row)
  return result
})
```

Add `viewportEl, onScroll, totalHeight, visibleRows, ROW_HEIGHT` to the `provide(SPREADSHEET_KEY, { ... })` call, alongside everything already there.

Replace `SpreadsheetGrid.vue` entirely — including its column-letter header row from Lesson 01, now pinned above the scrolling viewport with `position: sticky` rather than scrolling away with the data, since only the 10,000 *rows* need virtualizing, not the fixed six columns:

```vue
<script setup lang="ts">
import { useSpreadsheet } from '../composables/useSpreadsheet.ts'
import CellDisplay from './CellDisplay.vue'

const {
  columns, columnLetter, cellId, selectCell, startEditing,
  isCellSelected, onCellKeydown,
  viewportEl, onScroll, totalHeight, visibleRows, ROW_HEIGHT,
} = useSpreadsheet()
</script>

<template>
  <div class="spreadsheet-header" role="row">
    <div class="spreadsheet-cell header-cell"></div>
    <div
      v-for="col in columns"
      :key="col"
      class="spreadsheet-cell header-cell"
      role="columnheader"
    >{{ columnLetter(col) }}</div>
  </div>
  <div
    class="spreadsheet-viewport"
    role="grid"
    aria-label="Spreadsheet"
    ref="viewportEl"
    @scroll="onScroll"
  >
    <div class="spreadsheet-spacer" :style="{ height: totalHeight + 'px' }">
      <div
        v-for="row in visibleRows"
        :key="row"
        role="row"
        class="spreadsheet-row"
        :style="{ transform: `translateY(${row * ROW_HEIGHT}px)` }"
      >
        <div class="spreadsheet-cell header-cell" role="rowheader">{{ row + 1 }}</div>
        <div
          v-for="col in columns"
          :key="col"
          class="spreadsheet-cell"
          role="gridcell"
          :id="'cell-' + cellId({ col, row })"
          :aria-selected="isCellSelected(col, row)"
          :tabindex="isCellSelected(col, row) ? 0 : -1"
          @click="selectCell({ col, row })"
          @dblclick="startEditing({ col, row })"
          @keydown="onCellKeydown($event, col, row)"
        >
          <CellDisplay :col="col" :row="row" />
        </div>
      </div>
    </div>
  </div>
</template>
```

Add to `<style>`:

```css
.spreadsheet-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f1f5f9;
}
.spreadsheet-viewport {
  height: 400px;
  overflow-y: auto;
  position: relative;
  border: 1px solid #cbd5e1;
}
.spreadsheet-spacer { position: relative; }
.spreadsheet-row {
  position: absolute;
  top: 0; left: 0; right: 0;
  display: flex;
  height: 28px;
}
.spreadsheet-cell {
  min-width: 90px;
  border: 1px solid #cbd5e1;
  padding: 0 6px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}
.header-cell { background: #f1f5f9; color: #475569; font-weight: 600; justify-content: center; min-width: 40px; }
```

Click ▶ Run. With `ROW_COUNT = 10000`, the grid now loads instantly. Open the browser's element inspector while scrolled to the top: only around 15–25 `<div role="row">` elements exist. Scroll down: the same small handful of row elements are still there — repositioned and re-rendered with new data, not multiplied.

**Walkthrough — the spacer element and `totalHeight`:**

`.spreadsheet-spacer` is given an explicit height equal to `ROW_COUNT * ROW_HEIGHT` — the height the *entire* (unrendered) grid would occupy, 280,000px for 10,000 rows. This is what gives the scrollbar an honest, correctly-proportioned size and position: the browser only knows how big a scrollbar's thumb should be from the *scrollable content's* height, and the spacer supplies that height even though almost none of the content inside it is real DOM.

**Walkthrough — `transform: translateY(...)` instead of `top`:**

Every visible row is `position: absolute`, positioned within the spacer using `transform: translateY(row * ROW_HEIGHT + 'px')` rather than the CSS `top` property, even though both would produce the same visual position here. `transform` is handled by the browser's compositor — a separate stage from layout — and repositioning an element via `transform` does not force the browser to recompute the layout of surrounding elements the way changing `top` can. For an element that moves on every scroll event, this is a real, measurable performance difference, not a stylistic preference.

**Walkthrough — `visibleRows`, and why it computes a range, not a fixed count:**

`firstRow` is derived directly from `scrollTop.value / ROW_HEIGHT` — how many row-heights the user has scrolled down tells you exactly which row is now at the top of the viewport. `lastRow` extends far enough to cover the visible height, plus `BUFFER_ROWS` on each side. Only rows in `[firstRow, lastRow]` ever exist in the DOM; everything outside that range is data Vue never touches — `columns`, `cellId`, `CellDisplay` are exactly the same functions and components as before, just called for a small, moving window of rows instead of all of them at once.

**Walkthrough — `BUFFER_ROWS`, a deliberate design constant, not a magic number:**

Rendering *exactly* the visible rows and not one more would mean a fast scroll shows a blank row for one frame before the newly-scrolled-into-view row finishes rendering — a visible flicker at the viewport's leading edge. `BUFFER_ROWS = 4` over-renders four extra rows above and below the strictly-visible range, so a normal scroll always has already-rendered content ready the instant it comes into view. This trades a small, fixed amount of extra rendering (4 rows, not 4% of the data — the cost is constant regardless of `ROW_COUNT`) for eliminating a real, visible defect.

---

## Step 3 — Fix keyboard navigation: scroll into view, then wait, then focus

**The problem:** Lesson 15's `moveSelection` ends with `document.getElementById('cell-' + cellId(nextCoordinate))?.focus()` — but virtualization means that element usually doesn't exist. Pressing ArrowDown near the bottom of the visible window would silently fail to move real focus the moment the target row falls outside `visibleRows`.

Update `moveSelection` in `App.vue`:

```typescript
import { nextTick } from 'vue'

async function moveSelection(deltaCol: number, deltaRow: number): Promise<void> {
  const current = selectedCoordinate.value ?? { col: 0, row: 0 }
  const nextCoordinate: Coordinate = {
    col: Math.max(0, Math.min(COLUMN_COUNT - 1, current.col + deltaCol)),
    row: Math.max(0, Math.min(ROW_COUNT - 1, current.row + deltaRow)),
  }
  selectCell(nextCoordinate)
  scrollRowIntoView(nextCoordinate.row)
  await nextTick()
  document.getElementById('cell-' + cellId(nextCoordinate))?.focus()
}

function scrollRowIntoView(row: number): void {
  const viewport = viewportEl.value
  if (!viewport) return
  const rowTop = row * ROW_HEIGHT
  const rowBottom = rowTop + ROW_HEIGHT
  if (rowTop < viewport.scrollTop) {
    viewport.scrollTop = rowTop
  } else if (rowBottom > viewport.scrollTop + VIEWPORT_HEIGHT) {
    viewport.scrollTop = rowBottom - VIEWPORT_HEIGHT
  }
}
```

Click ▶ Run. Select the last visible row, press ArrowDown repeatedly: the viewport scrolls to keep the selection visible, and the browser's real keyboard focus follows correctly, every time — even though the target cell did not exist in the DOM at the moment `moveSelection` started running.

**Walkthrough — `async function` and `await nextTick()`, waiting for Vue to catch up:**

`scrollRowIntoView` changes `viewport.scrollTop`, which updates the reactive `scrollTop` ref (via the existing `@scroll` handler — scrolling programmatically fires the same `scroll` event as a user's mouse wheel), which changes `visibleRows`, which means Vue needs to create a brand-new DOM element for the newly-visible cell. **None of that happens synchronously.** Vue batches reactive updates and applies them on the next "tick" — the next point in the JavaScript event loop where it's safe to touch the DOM — specifically so that ten reactive writes in a row don't trigger ten separate re-renders. `nextTick()` returns a **Promise** — a value representing work that will finish later, not immediately (this series' first appearance of a Promise, though `try`/`catch`'s error-handling shape will feel familiar) — that resolves once Vue has actually finished applying the pending DOM update. `async function` and `await` are the modern syntax for working with a Promise: `await nextTick()` pauses `moveSelection` at exactly that line until Vue's DOM update is real, and only then does the function continue to the `.focus()` call. Removing `await nextTick()` and calling `.focus()` immediately after `scrollRowIntoView` would call `document.getElementById(...)` a moment too early — before the element exists — silently returning `null` and doing nothing, a real, easy-to-miss race condition.

---

## The Design lens — perceived performance is not the same thing as measured performance

`BUFFER_ROWS` is small enough that virtualization is invisible during normal, moderate scrolling — the user simply sees a spreadsheet, never a "loading" state, never a blank flash. This is worth naming as its own idea, distinct from the millisecond numbers Step 0's lab measured: **perceived performance** is how fast something *feels*, which is not identical to how fast it technically *is*. A grid that takes 2ms to update but visibly flickers feels worse than one that takes 8ms and never flickers, even though the first is measurably faster. Every decision in this lesson — the buffer rows, `transform` over `top`, waiting for `nextTick` before focusing rather than showing a focus ring in the wrong place for one frame — optimizes for the *felt* experience of scrolling and navigating, not only for the number in a profiler.

*Recognized elsewhere:* this exact windowing technique, buffer rows included, is how every production data-grid library actually works — **AG Grid** (a real, widely used spreadsheet-grid component, conceptually close to what this entire series has built from scratch), React's **react-window** and **react-virtualized**, Vue's own **vue-virtual-scroller**, and the framework-agnostic **TanStack Virtual** all implement this identical idea: render a small window, reposition it with `transform`, over-render a small buffer. You have not approximated a simplified version of what these libraries do — you have built the same algorithm they ship, by hand, once, specifically so it is no longer a black box the next time you reach for one of them in a real project.

---

## What breaks without this

**Setting `BUFFER_ROWS = 0`:**

Scroll quickly: for a single frame at a time, freshly-revealed rows at the viewport's leading edge are visibly blank before `visibleRows` catches up and Vue renders them — a real, visible flicker, especially on a fast trackpad scroll or a large jump.

**Using `top` instead of `transform: translateY` for row positioning:**

At small row counts, no observable difference. At real scale, with hundreds of rows changing position during a fast scroll, the browser must recompute layout for each `top` change; `transform` changes are handled by compositing alone. The practical result is visibly choppier scrolling on lower-powered devices, even though both approaches are "correct."

**Removing `await nextTick()` from `moveSelection`:**

Pressing an arrow key toward a cell outside the current viewport silently fails to move real keyboard focus — `selectedCoordinate` updates correctly (so the *visual* selection outline, once that row scrolls in, is right), but a screen-reader or keyboard-only user's actual focus stays on the old cell, because `document.getElementById` returned `null` for an element that did not exist yet.

**Not virtualizing at all, and shipping `ROW_COUNT = 10000` from Step 1:**

The freeze demonstrated in Step 1 is not a worst-case scenario — it is the default, unfixed behavior. A real spreadsheet product cannot ship this; "make the data smaller" is not an available fix for a spreadsheet, whose entire purpose is holding as much data as the user has.

**Declaring `viewportEl`, `scrollTop`, `visibleRows`, and friends locally inside `SpreadsheetGrid.vue` instead of in `App.vue`:**

`moveSelection` and `scrollRowIntoView` — both in `App.vue` — would have no way to reach them: `ROW_COUNT` and `viewportEl` would simply be undefined names inside `App.vue`, a compile error, not a runtime surprise. This is the same lesson Lesson 12 already taught about `SPREADSHEET_KEY`, arriving from the opposite direction — there, two files both needed something declared in a third place; here, two functions in the *same* file (`moveSelection`, `scrollRowIntoView`) need state that virtualization's own template-ref requirement was pulling toward a different component. Centralizing in `App.vue` and sharing the `Ref` object through `provide`/`inject` is the fix both times.

---

## Connect the pieces

```
App.vue
  <script setup>
    ROW_HEIGHT, VIEWPORT_HEIGHT, BUFFER_ROWS  — constants
    viewportEl                        ref<HTMLElement | null>(null) — shared with SpreadsheetGrid.vue
                                        via provide/inject; the child's ref="viewportEl" writes
                                        into this same object
    scrollTop, onScroll()             — scrollTop stays App.vue-private; onScroll is provided
    totalHeight, visibleRows          — computed; provided for SpreadsheetGrid.vue to read
    moveSelection() — async now       — selectCell, scrollRowIntoView, await nextTick, then .focus()
    scrollRowIntoView(row)            — adjusts viewportEl.value.scrollTop if the target isn't visible
  provides viewportEl, onScroll, totalHeight, visibleRows, ROW_HEIGHT via SpreadsheetContext

SpreadsheetGrid.vue
  .spreadsheet-header (sticky)       — column-letter row from Lesson 01; not virtualized, always 6 cells
  <div role="grid"> ... </div>       — replaces <table>; ARIA roles from Lesson 15 make this
                                        possible without losing accessibility
  .spreadsheet-spacer                — fake full height; gives the scrollbar honest proportions
  visibleRows, onScroll, viewportEl, totalHeight, ROW_HEIGHT — all injected, none declared locally
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] With `ROW_COUNT = 10000`, the grid loads and scrolls smoothly — no freeze
- [ ] The browser's element inspector shows roughly 15–30 row elements at any moment, never thousands
- [ ] The scrollbar's size and position accurately reflect scrolling through 10,000 rows, not a fraction of it
- [ ] Arrow-key navigation past the visible viewport correctly scrolls and moves real keyboard focus
- [ ] The column-letter header row (A, B, C...) is still visible and stays pinned while scrolling
- [ ] You can explain why `viewportEl` is declared in `App.vue` but attached in `SpreadsheetGrid.vue`'s template, and why that works
- [ ] You can explain what the 16.6ms frame budget is and why sixty thousand synchronous DOM creations blow through it
- [ ] You can explain why `transform` is used instead of `top` for row positioning
- [ ] You can explain why `moveSelection` needs `await nextTick()` and what would silently fail without it
- [ ] You can explain the purpose of `BUFFER_ROWS` and what a user would see without it

---

*Next: Lesson 18 — A Real Formula Editor. `=SUM(A1,B1,C1)` becomes a genuine, evaluatable formula by extending Lesson 07's actual grammar and parser — not a special case — and a trie data structure powers real autocomplete as you type a function's name.*
