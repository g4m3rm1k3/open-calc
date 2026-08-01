# SE Masterclass — LAB-35 — Rendering Pipelines

**Language: TypeScript (Browser)** — same setup as LAB-29–34.

**Prerequisites:** LAB-32 (signals/effects — this lab studies WHEN effects run, not just whether they run) and LAB-08 (complexity — unnecessary repeated work is a real, measurable cost).

**What this lab adds:**
- Why running an effect SYNCHRONOUSLY on every single signal write can waste work
- Batching: coalescing multiple state changes into ONE effect run before anything touches the DOM
- The browser's own rendering pipeline (JS runs → style → layout → paint) and why a browser repaint is expensive
- `requestAnimationFrame` — asking the browser WHEN it's about to draw, instead of guessing

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If a click handler sets THREE different signals in a row, and each `set` immediately runs every subscribed effect, how many times does the DOM get touched for ONE click?
> 2. Is touching the DOM three times, with the SAME final values as touching it once, guaranteed to LOOK any different to the user?
> 3. `requestAnimationFrame(fn)` runs `fn` right before the browser's next repaint. Why is that a better time to update the DOM than "immediately, synchronously, the instant state changes"?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, browser console output (DevTools) shows:

```
=== Unbatched: One DOM Write Per Signal Change ===
effect ran (DOM write #1) — x: 1, y: 0
effect ran (DOM write #2) — x: 1, y: 1
effect ran (DOM write #3) — x: 1, y: 2
total DOM writes for ONE click handler: 3
  ← the DOM was touched 3 times, even though only the FINAL values matter visually

=== Batched: One DOM Write Per Logical Update ===
effect ran (DOM write #1) — x: 1, y: 2
total DOM writes for ONE click handler: 1
  ← same final state, 1/3 the DOM writes

=== requestAnimationFrame: Aligning With the Browser's Own Clock ===
signal changed 5 times synchronously
requestAnimationFrame fired once, AFTER all 5 changes
final DOM write: x: 5
```

---

### Concept: Every Signal Write Triggering an Immediate Effect Run Can Waste Work

**What it is:** LAB-32's `createSignal`'s `set()` immediately calls every subscribed effect — SYNCHRONOUSLY, one signal-write-at-a-time. If a single click handler changes THREE related signals in a row, and one effect depends on all three, that effect runs THREE TIMES — even though only the state AFTER all three changes is ever actually shown to the user.

**The problem before:**

```ts
function onDrag(dx: number, dy: number) {
  setX(x() + dx)     // effect runs — writes to the DOM
  setY(y() + dy)     // effect runs AGAIN — writes to the DOM again
  // the user only ever SEES the state after BOTH lines ran — the middle DOM write was pure waste
}
```

**The solution — batching:** Collect signal writes during a synchronous block of work, and only run subscribed effects ONCE, after ALL the writes in that block are done — with the FINAL values.

---

## Step 1 — Feel the Unbatched Cost

```ts
// main.ts
import { createSignal, createEffect } from './signals'

console.log('=== Unbatched: One DOM Write Per Signal Change ===')
const [x, setX] = createSignal(0)
const [y, setY] = createSignal(0)
let writeCount = 0

createEffect(() => {
  writeCount++
  console.log(`effect ran (DOM write #${writeCount}) — x: ${x()}, y: ${y()}`)
})

// Simulate a single click handler that updates BOTH x and y:
writeCount = 0
setX(1)
setY(1)
setY(2)
console.log(`total DOM writes for ONE click handler: ${writeCount}`)
console.log('  ← the DOM was touched 3 times, even though only the FINAL values matter visually')
```

### SAVE AND TRY

Check DevTools console.

**Expected:**
```
=== Unbatched: One DOM Write Per Signal Change ===
effect ran (DOM write #1) — x: 1, y: 0
effect ran (DOM write #2) — x: 1, y: 1
effect ran (DOM write #3) — x: 1, y: 2
total DOM writes for ONE click handler: 3
  ← the DOM was touched 3 times, even though only the FINAL values matter visually
```

**Confirm the waste directly:** DOM write #1 and #2 show INTERMEDIATE states (`y: 0`, then `y: 1`) that the user's eye NEVER actually needed to see — only DOM write #3's final `x: 1, y: 2` matters visually. Writes #1 and #2 were real work (real DOM/text updates) spent producing output that was immediately overwritten a moment later.

---

## Step 2 — Batch Multiple Writes Into One Effect Run

```ts
// signals.ts — add batching support
let isBatching = false
let pendingEffects = new Set<Effect>()

export function batch(fn: () => void): void {
  isBatching = true
  fn()                          // run all the signal writes inside — they get QUEUED instead of firing immediately
  isBatching = false
  const toRun = pendingEffects
  pendingEffects = new Set()
  for (const effect of toRun) {   // NOW run each affected effect exactly ONCE, after every write is done
    effect()
  }
}
```

```ts
// Modify createSignal's set() in signals.ts:
function set(newValue: T): void {
  value = newValue
  for (const effect of subscribers) {
    if (isBatching) {
      pendingEffects.add(effect)     // ← add: queue it — a Set naturally de-duplicates repeated effects
    } else {
      effect()                        // unbatched — same immediate behavior as before
    }
  }
}
```

Add to `main.ts`:

```ts
import { batch } from './signals'

console.log('\n=== Batched: One DOM Write Per Logical Update ===')
const [x2, setX2] = createSignal(0)
const [y2, setY2] = createSignal(0)
let batchedWriteCount = 0

createEffect(() => {
  batchedWriteCount++
  console.log(`effect ran (DOM write #${batchedWriteCount}) — x: ${x2()}, y: ${y2()}`)
})

batchedWriteCount = 0
batch(() => {                  // ← add: everything inside runs SYNCHRONOUSLY, but effects wait until the end
  setX2(1)
  setY2(1)
  setY2(2)
})
console.log(`total DOM writes for ONE click handler: ${batchedWriteCount}`)
console.log('  ← same final state, 1/3 the DOM writes')
```

### SAVE AND TRY

**Expected:**
```
=== Batched: One DOM Write Per Logical Update ===
effect ran (DOM write #1) — x: 1, y: 2
total DOM writes for ONE click handler: 1
  ← same final state, 1/3 the DOM writes
```

**Confirm the FINAL state is identical, only the WORK changed:** `x: 1, y: 2` is the SAME final answer as Step 1's write #3 — batching doesn't change WHAT ends up on screen, only HOW MANY TIMES the effect (and, in a real app, the actual DOM) gets touched to get there. `pendingEffects` being a `Set` (LAB-04's hash set) is what makes the DE-DUPLICATION work — if the SAME effect would have run twice from two different signal writes inside the batch, it's only added to the set ONCE, and only runs ONCE.

**Why this is exactly React's `setState` batching:** React (inside event handlers, by default) does PRECISELY this — multiple `setState` calls inside one event handler are batched into a single re-render, for exactly this reason.

---

### Concept: The Browser's Own Rendering Pipeline

**What it is:** After your JavaScript finishes running, the browser goes through several stages before anything new appears on screen: recalculate **style** (which CSS rules apply), compute **layout** (where does everything go, how big is it — this is the expensive one), **paint** (fill in pixels), and **composite** (combine layers onto the screen). Touching the DOM triggers this pipeline; touching it MORE than necessary means running this pipeline more than necessary.

**Where `requestAnimationFrame` fits:** `requestAnimationFrame(fn)` schedules `fn` to run RIGHT BEFORE the browser's next repaint — a natural, browser-provided "wait until it's actually about to draw" signal, better than guessing with `setTimeout` or writing to the DOM immediately and hoping for the best.

---

## Step 3 — Align Updates With the Browser's Paint Cycle

```ts
console.log('\n=== requestAnimationFrame: Aligning With the Browser\'s Own Clock ===')
const [rafSignal, setRafSignal] = createSignal(0)
let rafScheduled = false

function scheduleRafUpdate(): void {
  if (rafScheduled) return                    // ← add: already scheduled — don't double-schedule
  rafScheduled = true
  requestAnimationFrame(() => {
    console.log(`requestAnimationFrame fired once, AFTER all 5 changes`)
    console.log(`final DOM write: x: ${rafSignal()}`)
    rafScheduled = false
  })
}

createEffect(() => {
  rafSignal()               // establish the dependency
  scheduleRafUpdate()        // but the ACTUAL "DOM write" is deferred to the next animation frame
})

console.log('signal changed 5 times synchronously')
for (let i = 1; i <= 5; i++) setRafSignal(i)
```

### SAVE AND TRY

Save. Check DevTools console (the `requestAnimationFrame` line appears on the NEXT rendered frame, slightly after the synchronous log lines).

**Expected (order matters — the RAF line comes LAST, after all 5 synchronous changes):**
```
signal changed 5 times synchronously
requestAnimationFrame fired once, AFTER all 5 changes
final DOM write: x: 5
```

**Confirm the timing, not just the count:** All 5 `setRafSignal(i)` calls run to completion FIRST (synchronously, immediately) — `requestAnimationFrame`'s callback only runs LATER, right before the browser's next paint, by which point `rafSignal()` already holds its FINAL value (`5`). This is a DIFFERENT technique from Step 2's `batch()` (which groups writes within one explicit synchronous block) — `requestAnimationFrame` instead aligns with the BROWSER's own drawing schedule, useful specifically for animation and visual updates that don't need to happen faster than the screen can actually redraw (typically 60 times per second).

---

## 🎯 Challenge: When Would Batching Make a VISIBLE Difference, Not Just an Efficiency One?

**You know:** Step 1's unbatched version showed intermediate states `y: 0` then `y: 1` before the final `y: 2` — but all of this happened synchronously, in the SAME tick, before the browser ever got a chance to actually PAINT anything to the screen.

**Task:** Explain, in your own words, why Step 1's "wasted" DOM writes were INVISIBLE to the user (the browser never painted the intermediate states) — and then describe a DIFFERENT scenario where skipping batching WOULD produce a visible flicker.

<details>
<summary>▶ Show Solution</summary>

**Why Step 1's waste was invisible:** JavaScript in the browser runs to completion for a given task (like a click handler) before the browser gets a chance to paint anything — this is part of the browser's single-threaded event loop. All THREE of Step 1's `setX`/`setY` calls, and all three effect runs, happened within the SAME synchronous block of code, so the browser never had an opportunity to actually DRAW the intermediate `y: 0` or `y: 1` states to the screen — only the FINAL DOM state, after the handler finishes, ever gets painted. The waste was real (CPU cycles spent on DOM writes nobody saw) but not VISUALLY apparent.

**A scenario where it WOULD be visible:** If the three signal writes happened across THREE SEPARATE `setTimeout(..., 0)` calls (or three separate microtask boundaries) instead of one synchronous block, the browser WOULD get a chance to paint between each one — producing a visible flicker as the UI jumps through `y: 0` → `y: 1` → `y: 2` across multiple actual frames, instead of jumping straight to the final state. This is exactly the scenario real framework batching needs to handle carefully — batching across ASYNCHRONOUS boundaries (like inside a `Promise.then()` or `setTimeout`) is harder to get right than batching within one synchronous handler, which is why React historically only auto-batched INSIDE its own event handlers, and needed explicit APIs (`unstable_batchedUpdates`, later automatic batching in React 18) to also batch across async boundaries.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `batch()` coalescing multiple signal writes | React's automatic batching of `setState` calls |
| The browser's style → layout → paint → composite pipeline | What DevTools' "Performance" tab visualizes frame by frame |
| `requestAnimationFrame` | Used by every JS animation library, and internally by React for certain scheduling |
| Wasted intermediate DOM writes | The exact kind of waste React's Fiber scheduler (and "concurrent rendering") is designed to avoid at scale |

**Where you will see this again:** LAB-36 (Virtual DOM) tackles the OTHER major rendering cost — not "how OFTEN do we touch the DOM" (this lab) but "how MUCH do we touch it each time" (diffing instead of full rebuilds).

---

## Final Check

| Feature | How to verify |
|---|---|
| Unbatched signal writes cause one effect run PER write | Step 1 |
| `batch()` coalesces multiple writes into exactly one effect run | Step 2 |
| The batched version's FINAL state matches the unbatched version's final state | Step 2 |
| `requestAnimationFrame` defers a DOM write until after all synchronous changes finish | Step 3 |
| You can explain why Step 1's waste was invisible to the user, but a different scenario could show a real flicker | Challenge |

---

## Quick Check Answers

**1. Three signal sets in a row, each triggering effects immediately — how many DOM touches for one click?**

Three, demonstrated directly in Step 1 — each `set()` call independently notified every subscriber, running the effect (and its DOM write) once per signal change, even though only the FINAL combination of values after all three changes is ever meaningfully shown to the user.

**2. Is touching the DOM three times with the same final values guaranteed to LOOK different to the user?**

Not necessarily — Step 1's Challenge explained this precisely: because all three writes happened SYNCHRONOUSLY within one JavaScript execution block, the browser never got a chance to actually PAINT the intermediate states before the final one overwrote them, so the user's eye never saw anything different from the batched version. The DIFFERENCE is in WASTED WORK (CPU time spent producing invisible intermediate output), not necessarily in visible behavior — though the Challenge also described a scenario (writes spread across async boundaries) where it WOULD become visible.

**3. Why is `requestAnimationFrame` a better time to update the DOM than immediately, synchronously?**

Because it aligns updates with the BROWSER's OWN drawing schedule — updating synchronously, as fast as JavaScript can run, can produce updates FASTER than the screen can actually display them (a typical screen redraws ~60 times per second), which is pure wasted work; `requestAnimationFrame` instead says "do this right before you're ABOUT to draw the next frame," guaranteeing the DOM write actually has a chance to be seen, and naturally throttling update frequency to match what the display can actually show, demonstrated in Step 3 where 5 rapid signal changes correctly collapsed into exactly ONE aligned DOM write.

---

*Next: [LAB-36 — Virtual DOM](LAB-36-virtual-dom.md) — TypeScript (Browser), same module*
