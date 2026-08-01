# SE Masterclass — LAB-15 — Scheduler

**Language: JavaScript (Node.js)** — same module as LAB-09–14.

**Prerequisites:** LAB-14 (Dependency Graph) — this lab's scheduler picks the next READY task using exactly LAB-14's "zero remaining dependencies" idea, then adds PRIORITY on top of it.

**What this lab adds:**
- Why a plain FIFO queue (LAB-05) isn't enough once tasks have different urgency
- A binary heap: an O(log n) priority queue, built as an array with index arithmetic
- Combining LAB-14's dependency ordering WITH priority — "ready AND most urgent," not just "ready"
- A working task scheduler that respects both constraints simultaneously

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A hospital emergency room doesn't treat patients FIFO (first arrived, first treated). What does it use instead, and why is that the right choice?
> 2. If you keep a priority queue as a SORTED array, inserting a new item costs O(n) (shifting elements). Removing the highest-priority item is O(1) (it's at the front). Is there a data structure that makes BOTH operations cheap?
> 3. Two tasks are both "ready" (LAB-14: zero unresolved dependencies) but have different priorities. Which should run first — and does dependency order or priority order win when they conflict?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Naive Priority Queue (sorted array) ===
inserted: urgent(1), normal(5), critical(0), low(9)
peek: critical (priority 0)
extractMin order: critical normal urgent low

=== Binary Heap ===
inserted: urgent(1), normal(5), critical(0), low(9), emergency(-1)
peek: emergency (priority -1)
extractMin order: emergency critical urgent normal low

=== Heap Internal Array (watch it reorganize) ===
after inserting 5, 3, 8, 1: [1, 3, 8, 5]
after extractMin (removes 1): [3, 5, 8]

=== Task Scheduler: Dependencies + Priority ===
tasks:
  compile (priority 5, needs: [])
  lint (priority 2, needs: [])
  test (priority 3, needs: [compile])
  package (priority 4, needs: [compile, test])
  deploy (priority 1, needs: [package, lint])

execution order: lint compile test package deploy

=== Scheduler: Priority Breaks Ties Among Ready Tasks ===
ready at start: [compile, lint] -> picks lint (priority 2 < 5)
after lint: ready = [compile] -> picks compile
after compile: ready = [test] -> picks test
after test: ready = [package] -> picks package
after package: ready = [deploy] -> picks deploy
```

---

### Concept: Why FIFO Isn't Enough

**What it is:** A **priority queue** is a queue where items come out in order of PRIORITY, not order of arrival. Unlike LAB-05's `std::queue` (strict FIFO — first in, first out), a priority queue always hands you the MOST URGENT item next, regardless of when it was added.

**The problem before:** LAB-05's queue and LAB-14's topological sort both process things in a fixed, arrival-based or dependency-based order — neither has any concept of "this one matters more, serve it first." A build system that treats a critical security patch exactly the same as a routine formatting fix, just because the formatting fix was queued first, is making a bad choice.

**The solution:** Track a priority (a number — lower can mean "more urgent," like this lab's convention, or higher can mean "more urgent," depending on convention) alongside each item, and always remove the item with the BEST priority next, no matter what order things were inserted.

**Canonical example (General Explanation):**

An emergency room doesn't treat patients FIFO — a broken finger that arrived first waits behind a heart attack that arrived second. Triage assigns urgency, and urgency — not arrival time — decides who's seen next. A priority queue is triage, formalized as a data structure.

**Project Application (The "Why" here):** LAB-14 already answers "which tasks are ALLOWED to run right now" (zero unresolved dependencies). This lab answers the NEXT question: "of the tasks that are allowed, which should run FIRST?"

**Watch for:** "Priority queue" doesn't specify HOW ties are broken (two items with equal priority) — this lab's implementation will process equal-priority items in the order they were inserted, but that's a design CHOICE, not an automatic guarantee of every priority queue.

---

## Step 1 — A Naive Priority Queue (Sorted Array)

The simplest possible priority queue: keep the array always sorted, so the minimum is always at the front.

```js
// naive-pq.js

class NaivePriorityQueue {
  constructor() {
    this.items = []                                     // sorted ascending by priority
  }

  insert(value, priority) {
    const entry = { value, priority }
    let i = 0
    while (i < this.items.length && this.items[i].priority <= priority) {   // ← add: find the insertion point
      i++
    }
    this.items.splice(i, 0, entry)                        // ← add: O(n) — shifts every element after i
  }

  extractMin() {
    return this.items.shift().value                        // ← add: O(n) too — shifts every remaining element down
  }

  peek() {
    return this.items[0].value
  }

  get size() {
    return this.items.length
  }
}

module.exports = { NaivePriorityQueue }
```

```js
// main.js
const { NaivePriorityQueue } = require('./naive-pq')

console.log('=== Naive Priority Queue (sorted array) ===')
const pq = new NaivePriorityQueue()
pq.insert('urgent', 1)
pq.insert('normal', 5)
pq.insert('critical', 0)
pq.insert('low', 9)

console.log('inserted: urgent(1), normal(5), critical(0), low(9)')
console.log(`peek: ${pq.peek()} (priority 0)`)

const order = []
while (pq.size > 0) order.push(pq.extractMin())
console.log(`extractMin order: ${order.join(' ')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Naive Priority Queue (sorted array) ===
inserted: urgent(1), normal(5), critical(0), low(9)
peek: critical (priority 0)
extractMin order: critical normal urgent low
```

**Confirm the O(n) cost:** `Array.prototype.splice` inserting in the MIDDLE of an array must shift every element after the insertion point — for a queue that grows to thousands of items, EVERY insert costs proportional work (LAB-08's O(n)), even though only ONE item is being added. `extractMin`'s `.shift()` has the same problem in reverse — removing from the front shifts everything else down by one.

**Change something:** Insert 1,000 items with random priorities using a loop, then time `extractMin()` being called 1,000 times, using LAB-08's `benchmark` helper. This is the setup for the next Concept box's motivation.

---

### Concept: The Binary Heap

**What it is:** A **binary heap** is a binary tree (LAB-06) with one special property — the **heap property**: every parent's priority is BETTER than (for a min-heap: less than or equal to) both of its children's priorities. This guarantees the SINGLE best item is always at the ROOT, without requiring the WHOLE tree to be fully sorted.

**The problem before:** A sorted array keeps EVERYTHING in order, which is more work than necessary — you only ever need to know the SINGLE best item quickly; you don't need item #500 and #501 to be in exact relative order until they're about to be extracted.

**The solution:** Relax the ordering requirement — only enforce "parent ≤ both children," not "everything fully sorted." This is a MUCH weaker constraint, which makes it MUCH cheaper to maintain: inserting or removing only needs to fix the heap property along ONE path from root to leaf (a path of length `log n`, from LAB-08's O(log n) Concept box — a balanced binary tree of `n` nodes has depth `log₂ n`), not reorganize the whole collection.

**Canonical example (General Explanation):**

Think of a company org chart (LAB-06 again) where the rule is "every manager has a lower salary number... er, HIGHER priority... than their direct reports" — NOT "everyone company-wide is perfectly ranked." The CEO (root) is guaranteed to be the top-priority person, but you make NO claim about whether a random employee in one department outranks a random employee in another department — only PARENT-CHILD relationships are guaranteed.

**The array trick (no pointers needed):** A binary heap is stored as a flat ARRAY, using index arithmetic to represent the tree shape — no `left`/`right` pointers like LAB-06's `TreeNode` at all:

```
For a node at index i:
  parent index  = Math.floor((i - 1) / 2)
  left child    = 2i + 1
  right child   = 2i + 2
```

```
Array: [1, 3, 8, 5, 9]

Tree view:
          1  (index 0)
        /   \
       3     8  (indices 1, 2)
      / \
     5   9      (indices 3, 4)
```

**What it hides (Law 7):** Callers of a heap-based priority queue never see the array or the index math — they only see `insert(value, priority)` and `extractMin()`, exactly the same interface as the naive version. The performance improvement is entirely internal.

**Where you will see this again:** LAB-52 (Task Scheduler, backend version) and LAB-79 (Pathfinding Visualizer's Dijkstra/A*) both rely on exactly this heap structure for their core loop.

---

## Step 2 — Build a Binary Heap

```js
// heap.js

class MinHeap {
  constructor() {
    this.items = []                                   // flat array — the tree lives here, via index math
  }

  parentIndex(i) { return Math.floor((i - 1) / 2) }
  leftIndex(i) { return 2 * i + 1 }
  rightIndex(i) { return 2 * i + 2 }

  swap(i, j) {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]]
  }

  insert(value, priority) {
    this.items.push({ value, priority })                // ← add: add at the END — the next open array slot
    this.bubbleUp(this.items.length - 1)                  // ← add: then fix the heap property, walking UP
  }

  bubbleUp(i) {
    while (i > 0) {
      const parent = this.parentIndex(i)
      if (this.items[parent].priority <= this.items[i].priority) break   // parent already ≤ child — heap property holds
      this.swap(i, parent)                                                 // out of order — swap with parent
      i = parent                                                            // continue checking from the new position
    }
  }

  extractMin() {
    const min = this.items[0]
    const last = this.items.pop()                        // ← add: remove the LAST element (cheap — no shifting)
    if (this.items.length > 0) {
      this.items[0] = last                                  // ← add: move it to the ROOT — temporarily breaks the heap
      this.bubbleDown(0)                                     // ← add: fix the heap property, walking DOWN
    }
    return min.value
  }

  bubbleDown(i) {
    while (true) {
      const left = this.leftIndex(i)
      const right = this.rightIndex(i)
      let smallest = i

      if (left < this.items.length && this.items[left].priority < this.items[smallest].priority) {
        smallest = left
      }
      if (right < this.items.length && this.items[right].priority < this.items[smallest].priority) {
        smallest = right
      }
      if (smallest === i) break                             // both children are already ≥ this node — done

      this.swap(i, smallest)
      i = smallest                                            // continue checking from the new position
    }
  }

  peek() {
    return this.items[0].value
  }

  get size() {
    return this.items.length
  }
}

module.exports = { MinHeap }
```

### SAVE AND TRY

```js
// main.js — add below the naive priority queue section
const { MinHeap } = require('./heap')

console.log('\n=== Binary Heap ===')
const heap = new MinHeap()
heap.insert('urgent', 1)
heap.insert('normal', 5)
heap.insert('critical', 0)
heap.insert('low', 9)
heap.insert('emergency', -1)

console.log('inserted: urgent(1), normal(5), critical(0), low(9), emergency(-1)')
console.log(`peek: ${heap.peek()} (priority -1)`)

const heapOrder = []
while (heap.size > 0) heapOrder.push(heap.extractMin())
console.log(`extractMin order: ${heapOrder.join(' ')}`)
```

```bash
node main.js
```

**Expected:**
```
=== Binary Heap ===
inserted: urgent(1), normal(5), critical(0), low(9), emergency(-1)
peek: emergency (priority -1)
extractMin order: emergency critical urgent normal low
```

**Confirm the same RESULT as the naive version, via a different MECHANISM:** Both priority queues produce IDENTICAL output order — this lab isn't changing the ANSWER, only how cheaply it's computed. `bubbleUp`/`bubbleDown` each touch at most `log n` elements (one path from root to leaf), compared to the naive version's `splice`/`shift` touching up to `n` elements.

**Change something:** Insert the SAME 5 items using `heap.insert(...)` calls in a DIFFERENT order (say, `low` first, `emergency` last). Confirm `extractMin order` is still `emergency critical urgent normal low` — insertion order never affects the final extraction order, only priority does.

---

## Step 3 — Watch the Internal Array Reorganize

```js
console.log('\n=== Heap Internal Array (watch it reorganize) ===')
const watchHeap = new MinHeap()
watchHeap.insert('a', 5)
watchHeap.insert('b', 3)
watchHeap.insert('c', 8)
watchHeap.insert('d', 1)
console.log(`after inserting 5, 3, 8, 1: [${watchHeap.items.map(x => x.priority).join(', ')}]`)

watchHeap.extractMin()
console.log(`after extractMin (removes 1): [${watchHeap.items.map(x => x.priority).join(', ')}]`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Heap Internal Array (watch it reorganize) ===
after inserting 5, 3, 8, 1: [1, 3, 8, 5]
after extractMin (removes 1): [3, 5, 8]
```

**Trace the array shape, not just the extraction order:** After inserting `5, 3, 8, 1` in that order, the array is `[1, 3, 8, 5]` — NOT the fully sorted `[1, 3, 5, 8]`. This is the heap property in action: index 0 (`1`) is ≤ both its children (index 1: `3`, index 2: `8`) — satisfied. Index 1 (`3`)'s only child is index 3 (`5`) — `3 ≤ 5` — satisfied. The array is only PARTIALLY ordered, exactly enough to guarantee the minimum is at index 0, which is all a priority queue actually needs.

**Trace `extractMin`:** Removes `1` (root). The LAST element (`5`, at index 3) moves to index 0: `[5, 3, 8]`. `bubbleDown(0)` compares `5` against its children `3` (index 1) and `8` (index 2) — `3` is smaller, so swap: `[3, 5, 8]`. Now check index 1 (`5`)'s children — index 3 is out of bounds (array length is now 3), so `bubbleDown` stops. Final array: `[3, 5, 8]`, matching the expected output.

---

## 🎯 Challenge: Combine LAB-14's Dependency Graph With This Lab's Heap

**You know:** LAB-14's `topologicalSort` tracked in-degree (Kahn's algorithm variant) to find "ready" nodes. A `MinHeap` picks the best of several ready candidates.

**Task:** Build a scheduler that, at each step, picks the HIGHEST-priority task among all currently-ready tasks (zero unresolved dependencies), executes it (just print its name), then re-checks which NEW tasks became ready.

**Starting code:**

```js
const tasks = {
  compile: { priority: 5, needs: [] },
  lint:    { priority: 2, needs: [] },
  test:    { priority: 3, needs: ['compile'] },
  package: { priority: 4, needs: ['compile', 'test'] },
  deploy:  { priority: 1, needs: ['package', 'lint'] },
}

function schedule(tasks) {
  // TODO: track remaining dependency counts per task (like LAB-14's in-degree)
  // TODO: seed a MinHeap with every task that starts with zero dependencies
  // TODO: repeatedly extractMin, record it as executed, then decrement dependents'
  //       remaining counts — push any that reach zero into the heap
  // TODO: return the execution order
}
```

**Hint:** This is LAB-06's Challenge (topological sort via Kahn's algorithm) with ONE change: instead of a plain `queue` holding all zero-in-degree nodes in arrival order, use a `MinHeap` keyed by `priority` — everything else about the algorithm's shape is identical.

<details>
<summary>▶ Show Solution</summary>

```js
function schedule(tasks) {
  const remaining = {}                                    // remaining unresolved dependency count per task
  const dependents = {}                                   // reverse map: task -> [things that need it]

  for (const name of Object.keys(tasks)) {
    remaining[name] = tasks[name].needs.length
    dependents[name] = dependents[name] || []
  }
  for (const name of Object.keys(tasks)) {
    for (const dep of tasks[name].needs) {
      dependents[dep] = dependents[dep] || []
      dependents[dep].push(name)                            // 'name' depends on 'dep' — record the reverse edge
    }
  }

  const ready = new MinHeap()
  for (const name of Object.keys(tasks)) {
    if (remaining[name] === 0) ready.insert(name, tasks[name].priority)   // seed with everything already unblocked
  }

  const order = []
  while (ready.size > 0) {
    const current = ready.extractMin()                       // best-priority READY task
    order.push(current)

    for (const dependent of dependents[current] || []) {
      remaining[dependent]--                                   // one of its dependencies just finished
      if (remaining[dependent] === 0) {
        ready.insert(dependent, tasks[dependent].priority)       // just became ready — add it to the heap now
      }
    }
  }

  return order
}
```

**Key insight:** `remaining[name] === 0` seeding the heap is LAB-14's in-degree-zero check; `dependents[current]` decrementing is LAB-14's edge-relaxation step. The ONLY new idea is using a `MinHeap` instead of a plain FIFO queue to hold the "currently ready" set — which means among SEVERAL simultaneously-ready tasks, the highest-priority one always runs first, while dependency ORDER (LAB-14's guarantee) is still never violated, since a task only ever ENTERS the heap once every single thing it needs has already finished.

</details>

Add to `main.js`:

```js
console.log('\n=== Task Scheduler: Dependencies + Priority ===')
const tasks = {
  compile: { priority: 5, needs: [] },
  lint:    { priority: 2, needs: [] },
  test:    { priority: 3, needs: ['compile'] },
  package: { priority: 4, needs: ['compile', 'test'] },
  deploy:  { priority: 1, needs: ['package', 'lint'] },
}

console.log('tasks:')
for (const [name, t] of Object.entries(tasks)) {
  console.log(`  ${name} (priority ${t.priority}, needs: [${t.needs.join(', ')}])`)
}

console.log(`\nexecution order: ${schedule(tasks).join(' ')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Task Scheduler: Dependencies + Priority ===
tasks:
  compile (priority 5, needs: [])
  lint (priority 2, needs: [])
  test (priority 3, needs: [compile])
  package (priority 4, needs: [compile, test])
  deploy (priority 1, needs: [package, lint])

execution order: lint compile test package deploy
```

---

## Step 4 — Watch Priority Break Ties Among Ready Tasks

```js
console.log('\n=== Scheduler: Priority Breaks Ties Among Ready Tasks ===')
console.log('ready at start: [compile, lint] -> picks lint (priority 2 < 5)')
console.log('after lint: ready = [compile] -> picks compile')
console.log('after compile: ready = [test] -> picks test')
console.log('after test: ready = [package] -> picks package')
console.log('after package: ready = [deploy] -> picks deploy')
```

**Trace this against the real algorithm:** At the very start, BOTH `compile` and `lint` have zero dependencies — both are seeded into the heap together. `lint` (priority 2) beats `compile` (priority 5) — lower number wins in this lab's min-heap convention — so `lint` runs FIRST, even though `compile` also could have legally run first from a pure dependency standpoint. This is exactly the answer to this lab's third Quick Check question: dependency order determines what's ALLOWED to run; priority decides which ALLOWED option runs first when there's a choice.

**Change something:** Swap `lint`'s priority to `10` (lower urgency than `compile`'s `5`). Re-run. Confirm `compile` now runs first instead — the DEPENDENCY STRUCTURE didn't change, only which of the two equally-legal choices wins.

---

## Final Check

| Feature | How to verify |
|---|---|
| Naive sorted-array priority queue produces correct extraction order | Step 1 |
| Binary heap produces the SAME extraction order as the naive version | Step 2 |
| The heap's internal array is only partially ordered, not fully sorted | Step 3 |
| `schedule()` never runs a task before something it depends on | Challenge |
| `schedule()` picks the higher-priority task when multiple are ready | Step 4 |
| Changing a task's priority (not its dependencies) changes execution order among ties | Step 4 |
| You can explain, without notes, why a heap only needs the parent-child invariant, not full sorting | Concept box |

---

## Quick Check Answers

**1. Why does an ER use triage instead of FIFO?**

Because arrival order and URGENCY are different things, and treating patients in arrival order could mean a life-threatening case waits behind routine ones. A priority queue formalizes exactly this: the item that comes out next is the one with the BEST priority among everything currently waiting, regardless of how long anything has been waiting — demonstrated directly in this lab, where `emergency` (priority `-1`, inserted LAST) was still extracted FIRST.

**2. Sorted array: O(n) insert, O(1) extract. Is there something cheap at BOTH?**

Yes — a binary heap, built in Step 2. `insert` costs O(log n) (`bubbleUp` touches at most one path from a leaf to the root) and `extractMin` also costs O(log n) (`bubbleDown` touches at most one path from the root to a leaf) — both far better than the sorted array's O(n) insert, at the cost of NOT keeping the whole collection fully sorted at all times (which a priority queue never actually needs).

**3. Two ready tasks, different priorities — which runs first, and which ordering "wins"?**

The higher-priority one runs first, but ONLY among tasks that are ALREADY allowed to run — dependency order (LAB-14) determines the SET of legal next choices, and priority (this lab) picks WHICH ONE from that set goes first. They never actually conflict, because priority is only ever consulted among tasks that have ALREADY satisfied every dependency — demonstrated in Step 4, where `lint` and `compile` were both simultaneously legal (zero dependencies each), and priority alone decided which of the two ran first.

---

*Next: [LAB-16 — Simple VM](LAB-16-simple-vm.md) — JavaScript, Module 1's capstone*
