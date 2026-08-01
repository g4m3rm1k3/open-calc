# SE Masterclass — LAB-95 — Memory Management

**Prerequisites:** LAB-94 (Synchronization)

## Quick Check

Before starting, answer these (answers at the bottom):

1. LAB-01 introduced stack vs. heap. What does a garbage collector add on top of that distinction?
2. Why can a memory leak happen in a garbage-collected language like JavaScript, if the GC automatically frees unused memory?
3. Why does a `Map` holding DOM nodes (or any long-lived object) as values prevent those nodes from ever being garbage collected, even after they're removed from the page?

## What You Will Build

A deliberate memory leak in Node.js (an ever-growing cache with no eviction), observed via heap statistics, then fixed with a `WeakMap` — watching the process's memory footprint stop growing once the fix is in place.

```
Leaky version:  heap used after 10,000 iterations: 187.4 MB (growing every iteration)
Fixed version:  heap used after 10,000 iterations: 12.1 MB (stable -- old entries get collected)
```

## Concept: Memory Management — Allocation, GC, and Leak Prevention

**What it is:** LAB-01 (Phase 1) established stack (fixed-size, automatic, function-call-scoped) versus heap (dynamic, manually-tracked-lifetime memory). A **garbage collector** automates the heap side of that: instead of a programmer explicitly freeing heap memory (as in C), the runtime periodically finds objects nothing can reach anymore and frees them automatically. V8 (Node's JS engine) does this via a generational, mark-and-sweep-style collector.

**The problem before:** "Automatic memory management" sounds like it should make leaks impossible — if nothing reachable is ever freed, and the GC frees everything unreachable, what's left to leak? The answer: a leak in a GC'd language isn't memory the GC failed to free — it's memory the GC *correctly* did not free, because something in the program is still holding a reference to it, even though the programmer's intent was for that memory to be discardable. The GC is doing its job perfectly; the bug is that the program never let go.

**The solution:** Understand *reachability* — the GC only frees objects that are unreachable from any "root" (global variables, active call stack frames, etc.). A cache that grows forever without eviction, a list of event listeners that's added to but never cleaned up, a `Map` holding long-lived references to objects that should otherwise be short-lived — all of these keep objects reachable indefinitely, defeating the GC not through a bug in it, but through the program's own reference graph. A `WeakMap`/`WeakSet` holds *weak* references — ones the GC is allowed to ignore when deciding reachability — specifically so a cache can reference objects without keeping them alive on the cache's behalf alone.

**Canonical example:**

```typescript
const cache = new Map<object, string>() // strong references -- keeps every key alive forever
const weakCache = new WeakMap<object, string>() // weak references -- doesn't prevent GC
```

**Project Application:** LAB-99's memory visualizer simulates exactly the allocation/free/fragmentation lifecycle this lab observes for real in V8; LAB-97's process manager must avoid this lab's leak pattern in its own process-registry map, since it grows and shrinks over the manager's entire lifetime.

**Watch for:** Assuming `delete obj.property` or setting a variable to `null` is what "frees" memory in JavaScript. Neither does anything by itself — they only remove *one* reference; if any other reference to the same object still exists anywhere reachable, the object stays alive regardless. Freeing happens only when the GC determines *zero* reachable references remain.

## Step 1: Observing heap memory directly

```typescript
function logHeapUsage(label: string): void {
  const usage = process.memoryUsage()
  console.log(`${label}: heap used = ${(usage.heapUsed / 1024 / 1024).toFixed(1)} MB`)
}

logHeapUsage("baseline")
```

`process.memoryUsage().heapUsed` reports V8's actual current heap usage — the ground truth this lab's later steps will watch change (or fail to change) as objects become unreachable. This is the same instinct as LAB-08's complexity-benchmarking (measure directly, don't guess), applied to memory instead of time.

### SAVE AND TRY

Run `logHeapUsage("baseline")`, then allocate a large array (`const big = new Array(1_000_000).fill("x")`) and call `logHeapUsage("after allocation")` again — confirm the reported `heapUsed` increased, proving the measurement genuinely reflects real allocations, not a static or cached number.

## Step 2: A deliberate leak — an unbounded cache

```typescript
const leakyCache = new Map<string, { data: string; timestamp: number }>()

function leakyOperation(id: number): void {
  const key = `item-${id}`
  leakyCache.set(key, { data: "x".repeat(10_000), timestamp: Date.now() }) // never evicted, ever
}

function runLeakyLoop(): void {
  logHeapUsage("before leaky loop")
  for (let i = 0; i < 10_000; i++) leakyOperation(i)
  if (global.gc) global.gc() // force a collection cycle so the measurement reflects true reachable memory
  logHeapUsage("after leaky loop")
}

runLeakyLoop()
```

`leakyCache` is a module-level (or otherwise long-lived) `Map` — a **root** the GC can always reach, so *everything* stored in it stays reachable, and therefore alive, forever, regardless of whether the code that inserted an entry still cares about it. This is the concept section's central point made concrete: nothing is "wrong" with the GC here — it's correctly keeping every `leakyCache` entry alive, because the program's own reference graph says to.

### SAVE AND TRY

Run with `node --expose-gc script.js` (the `--expose-gc` flag makes `global.gc()` callable, giving an accurate before/after reading instead of an unpredictable one). Confirm `heapUsed` after the loop is dramatically higher than before — roughly `10,000 * 10,000 bytes ≈ 100 MB` worth of string data, all still reachable through `leakyCache`.

## Step 3: Fixing it with eviction — bounding the cache's lifetime

```typescript
const boundedCache = new Map<string, { data: string; timestamp: number }>()
const MAX_CACHE_SIZE = 100

function boundedOperation(id: number): void {
  const key = `item-${id}`
  if (boundedCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = boundedCache.keys().next().value // Map preserves insertion order -- oldest is first
    boundedCache.delete(oldestKey)
  }
  boundedCache.set(key, { data: "x".repeat(10_000), timestamp: Date.now() })
}

function runBoundedLoop(): void {
  logHeapUsage("before bounded loop")
  for (let i = 0; i < 10_000; i++) boundedOperation(i)
  if (global.gc) global.gc()
  logHeapUsage("after bounded loop")
}

runBoundedLoop()
```

This is LAB-65's LRU cache pattern (Phase 5) reused directly: cap the cache's size, evict the oldest entry before inserting a new one once the cap is hit. Evicted entries lose their last reachable reference (removed from `boundedCache`, and nothing else in the program points to them) — which is what actually makes them eligible for collection; deleting the `Map` entry doesn't free the memory *itself*, it removes the reference that was keeping it reachable, and the GC does the rest on its next cycle.

### SAVE AND TRY

Run this version with the same `--expose-gc` flag. `heapUsed` after the loop should be dramatically lower than Step 2's — roughly bounded by `100 * 10,000 bytes ≈ 1 MB`, regardless of whether the loop runs 10,000 or 10,000,000 iterations, since the cache never holds more than `MAX_CACHE_SIZE` entries at once.

## Step 4: `WeakMap` — references that don't keep objects alive

```typescript
function demonstrateWeakMap(): void {
  const metadata = new WeakMap<object, { label: string }>()

  function processObject(obj: object): void {
    metadata.set(obj, { label: `processed at ${Date.now()}` })
  }

  let temp: object | null = { id: 1 }
  processObject(temp)
  console.log("Has metadata before nulling:", metadata.has(temp)) // true

  temp = null // the ONLY strong reference to the original object is gone now
  // metadata's reference to the original object was always weak -- it does not keep
  // the object alive on its own. Once no strong references remain, the object becomes
  // eligible for collection, and its WeakMap entry disappears along with it -- automatically,
  // with no explicit .delete() call needed.
}

demonstrateWeakMap()
```

A `WeakMap`'s keys must be objects (not primitives), and critically, holding an object as a `WeakMap` key does **not** count toward keeping it reachable — the GC is specifically allowed to collect a `WeakMap` key (and silently drop that entry) the moment no other *strong* reference to it exists anywhere. This is the precise inverse of Step 2's bug: a `Map` (strong references) used as a cache keeps every entry alive forever unless *manually* evicted; a `WeakMap` used the same way lets entries disappear *automatically* the moment nothing else needs them.

### SAVE AND TRY

There's no way to directly observe a `WeakMap` entry vanish (by design — `WeakMap` deliberately offers no `.size`, no iteration, no way to enumerate its contents, specifically so its automatic-cleanup behavior can't be relied on as an *observable* API). Instead, confirm the conceptual point: rerun Step 2's leak with `leakyCache` replaced by a `WeakMap<object, {...}>` keyed on a fresh object per iteration (not a string, since `WeakMap` requires object keys) — if nothing else in the program holds a reference to those per-iteration key objects, `heapUsed` after forcing GC should stay low, unlike Step 2's ever-growing string `Map`.

## 🎯 Challenge

Build a `WeakRef`-based cache: store values wrapped in `WeakRef` (allowing the *value*, not just a key, to be collected while the cache entry technically still "exists" as a dangling reference), and on each `get`, check `weakRef.deref()` — if it returns `undefined`, the value was collected, so remove the stale entry and report a cache miss.

<details>
<summary>Solution</summary>

```typescript
class WeakValueCache<K, V extends object> {
  private map = new Map<K, WeakRef<V>>()

  set(key: K, value: V): void {
    this.map.set(key, new WeakRef(value))
  }

  get(key: K): V | undefined {
    const ref = this.map.get(key)
    if (!ref) return undefined

    const value = ref.deref()
    if (value === undefined) {
      this.map.delete(key) // the value was collected -- clean up the stale entry
      return undefined
    }
    return value
  }
}

const cache = new WeakValueCache<string, { data: string }>()
let obj: { data: string } | null = { data: "expensive to recompute" }
cache.set("key1", obj)
console.log(cache.get("key1")) // { data: "expensive to recompute" }

obj = null // drop the only other strong reference
// after this point, IF the GC has run and collected the value,
// cache.get("key1") would return undefined instead -- the cache holds a
// weak reference, so it cannot single-handedly keep the value alive.
```

The `map` itself (of `K -> WeakRef<V>`) still grows unboundedly as a structure — a real limitation this simple version doesn't solve — but the *values* it references no longer stay alive purely because the cache holds them, which is the specific problem `WeakRef` targets: a cache that speeds up repeated lookups without forcing every cached value to live forever.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| "Memory leak in JS" | Can't happen — GC frees everything unused | Happens when something reachable holds a reference longer than intended |
| `delete obj.prop` / `x = null` | Frees the memory immediately | Removes one reference; memory frees only once ALL references are gone |
| Unbounded cache (`Map`) | Safe — the GC will handle it | Every entry stays reachable forever unless explicitly evicted |
| `WeakMap`/`WeakRef` | Same as `Map`, just a different name | References that don't prevent garbage collection |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does a garbage collector never free an object that's still reachable, even if the programmer considers it "done with"? | |
| 2 | Why does Step 3's LRU eviction fix Step 2's leak, when neither version calls anything resembling `free()`? | |
| 3 | Why does `WeakMap` deliberately not support `.size` or iteration? | |

## Quick Check Answers

1. A garbage collector adds automatic reachability tracking — instead of a programmer explicitly deciding when heap memory is no longer needed and freeing it, the runtime periodically determines which heap objects are unreachable from any root and frees only those.
2. Because a strong reference (like a `Map` holding an object as a value) counts toward reachability just as much as any other reference — the GC has no way to distinguish "this reference means I intend to keep it forever" from "this reference is incidental," so it correctly keeps anything referenced alive, leak or not.
3. Because a `Map` (or object property) holding a reference to a DOM node counts as a reachable path to that node from a GC root — even after the node is removed from the visible page, the `Map` entry keeps it reachable, so the GC correctly (if unhelpfully) keeps it alive until that `Map` entry is also removed.

*Next: [LAB-96 — Shell](../module-02-mini-projects/LAB-96-shell.md)*
