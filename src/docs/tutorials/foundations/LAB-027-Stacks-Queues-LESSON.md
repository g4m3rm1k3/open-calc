# FOUNDATIONS — LAB-027 — Stacks and Queues

**Series:** FOUNDATIONS — Part V: Data Structures
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A `Stack` class with O(1) push/pop, a `Queue` class with O(1) enqueue/dequeue (implemented with two stacks), an undo/redo system built on two stacks, and a breadth-first search implemented with a queue. After this lab, you will understand exactly when the call stack (LAB-001) and the browser event queue (LAB-002) model LIFO and FIFO behavior, and how to choose between them.

---

## What You Need to Know First

**From LAB-001 (Call Stack):** The call stack is a LIFO structure — the most recently called function is the first to return. You already understand LIFO from first principles.

**From LAB-002 (Event Loop):** The task queue is FIFO — tasks are processed in the order they arrived.

**From LAB-024 (Arrays):** `push` is O(1); `pop` is O(1). Both operate at the end of the array. `unshift` and `shift` are O(n) — they operate at the start. This determines how to implement an efficient queue.

---

> **Quick Check — try to answer before reading:**
>
> 1. A call stack uses LIFO order. When `f` calls `g` calls `h`, which function returns first?
> 2. A print queue uses FIFO order. Three print jobs arrive: A, then B, then C. In what order do they print?
> 3. If you implement a queue using a single JavaScript array, why is `dequeue` (removing from the front) O(n)?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Stack: LIFO with O(1) Push and Pop

**The problem this step solves:** Implement a stack and use it for undo history.

**The code:**

```js
class Stack {
  #items = [];

  push(item) {
    this.#items.push(item);   // O(1) — add to end
    return this;
  }

  pop() {
    if (this.isEmpty) throw new Error("Stack underflow: cannot pop from an empty stack");
    return this.#items.pop();  // O(1) — remove from end
  }

  peek() {
    if (this.isEmpty) return undefined;
    return this.#items[this.#items.length - 1];  // O(1) — read without removing
  }

  get size() { return this.#items.length; }
  get isEmpty() { return this.#items.length === 0; }
}
```

**The walkthrough — push/pop:**

`push(1)`: internal array becomes `[1]`. Size 1.
`push(2)`: internal array becomes `[1, 2]`. Size 2.
`push(3)`: internal array becomes `[1, 2, 3]`. Size 3.
`pop()`: removes `3` from end. Returns `3`. Array is `[1, 2]`. Size 2.
`peek()`: returns `2` without removing. Array unchanged.

**Stack overflow:** the error from LAB-001 is named after this: when the call stack (which IS a stack) runs out of space because too many frames were pushed without being popped.

**Stack underflow:** popping from an empty stack — no element to return. Our guard prevents silent `undefined` returns.

**CS lens — LIFO as "depth-first":**

LIFO means you always work on the most recently added item first. This is **depth-first** processing: go as deep as possible before backtracking. Recursive function calls use LIFO (the call stack). Depth-first graph traversal (DFS) uses a stack explicitly or via recursion. Browser history (Back button) uses LIFO — the most recently visited page is the first you return to.

**SE lens — undo/redo with two stacks:**

```js
class TextEditor {
  #content = "";
  #undoStack = new Stack();
  #redoStack = new Stack();

  type(text) {
    this.#undoStack.push(this.#content);  // save current state before changing
    this.#redoStack = new Stack();        // typing clears redo history
    this.#content += text;
  }

  undo() {
    if (this.#undoStack.isEmpty) return;
    this.#redoStack.push(this.#content);  // save current state for redo
    this.#content = this.#undoStack.pop(); // restore previous state
  }

  redo() {
    if (this.#redoStack.isEmpty) return;
    this.#undoStack.push(this.#content);   // save current state for undo
    this.#content = this.#redoStack.pop(); // restore the redone state
  }

  get text() { return this.#content; }
}
```

Undo pushes the current state to the redo stack and pops the previous state from the undo stack. Redo is the inverse. Both are O(1) — push and pop are constant time.

**What breaks if you use an array with unshift/shift:**

`undoStack.unshift(state)` and `undoStack.shift()` operate at the beginning of the array: O(n) each. For a large undo history, every undo operation shifts all entries. With `push`/`pop` (operating at the end), both are O(1). LIFO is naturally O(1) with end-of-array operations.

---

### SAVE AND TRY

```js
const editor = new TextEditor();

editor.type("Hello");
editor.type(", world");
console.log("Text:", editor.text);  // → "Hello, world"

editor.undo();
console.log("After undo:", editor.text);  // → "Hello"

editor.undo();
console.log("After undo:", editor.text);  // → ""

editor.redo();
console.log("After redo:", editor.text);  // → "Hello"

editor.type("!");
console.log("After type:", editor.text);  // → "Hello!"
editor.redo();  // redo stack was cleared by 'type'
console.log("Redo (empty):", editor.text);  // → "Hello!" (unchanged)
```

Expected: each state correctly tracked.

**Change something:** Add a `type("world")` call, undo it, then redo it 3 times. Expected: redo only works once — the redo stack has one entry; subsequent redos are no-ops.

---

### Step 2 — Queue: FIFO with O(1) Enqueue and Dequeue

**The problem this step solves:** Show why a single-array queue has O(n) dequeue and implement an efficient O(1) version using two stacks.

**The code — the naive O(n) queue:**

```js
class NaiveQueue {
  #items = [];

  enqueue(item) {
    this.#items.push(item);   // O(1) — add to back
  }

  dequeue() {
    if (this.#items.length === 0) throw new Error("Queue is empty");
    return this.#items.shift();  // O(n) — removes from front, shifts everything
  }
}
```

`Array.prototype.shift()` — removes the first element and returns it. O(n): every remaining element must shift one position left to fill the gap. For a 10,000-element queue, every dequeue shifts 9,999 elements.

**The efficient O(1) queue — two stacks:**

```js
class Queue {
  #inbox  = new Stack();   // new items go here
  #outbox = new Stack();   // items are dequeued from here

  enqueue(item) {
    this.#inbox.push(item);   // O(1) always
  }

  dequeue() {
    if (this.#outbox.isEmpty) {
      // Transfer all items from inbox to outbox (reverses order)
      while (!this.#inbox.isEmpty) {
        this.#outbox.push(this.#inbox.pop());
      }
    }
    if (this.#outbox.isEmpty) throw new Error("Queue is empty");
    return this.#outbox.pop();   // O(1) for the pop itself
  }

  get size() { return this.#inbox.size + this.#outbox.size; }
  get isEmpty() { return this.#inbox.isEmpty && this.#outbox.isEmpty; }
}
```

**The walkthrough — why this is O(1) amortized:**

`enqueue("A")` → inbox: `[A]`
`enqueue("B")` → inbox: `[A, B]`
`enqueue("C")` → inbox: `[A, B, C]`

`dequeue()` — outbox is empty. Transfer: pop from inbox (`C`, `B`, `A`) and push to outbox (`C`, `B`, `A` reverse to `A`, `B`, `C`). Outbox now `[C, B, A]` (A at top). Pop outbox → returns `A`. ✓ FIFO.

`enqueue("D")` → inbox: `[D]`

`dequeue()` — outbox still has `[C, B]`. Pop → returns `B`. ✓ FIFO (B was enqueued before C).

**The transfer costs:** Each item is moved from inbox to outbox exactly once. Over N operations, total transfer work is N — O(1) amortized per dequeue. The occasional expensive transfer (when outbox is empty) is paid for by all the O(1) dequeues that follow.

**CS lens — amortized analysis of the two-stack queue:**

For N enqueue/dequeue operations, the total number of push/pop operations is at most 2N (each item is pushed to inbox once and popped to outbox once). Amortized per operation: 2N/N = 2 — O(1). This is the same amortized analysis as dynamic arrays. The key insight: each item is moved at most once.

**SE lens — queue applications:**

**Task queues:** A web server processes HTTP requests in FIFO order — the first request received is handled first (fairness). `job-queue.enqueue(request)` when a request arrives; `job-queue.dequeue()` when a worker is free.

**Breadth-first search (BFS):** Process all neighbors at distance 1 before neighbors at distance 2. A queue naturally achieves this: enqueue all neighbors, dequeue-process-enqueue-their-neighbors, repeat.

**Message queues (Kafka, RabbitMQ):** Producers enqueue messages; consumers dequeue them. Decoupled, FIFO delivery.

**What breaks with LIFO for a task queue:**

If a task queue accidentally uses LIFO (stack), the newest tasks are processed first. Long-running systems would starve old tasks — the original request might never be processed if new requests keep arriving. FIFO guarantees bounded waiting time for each task.

---

### SAVE AND TRY

```js
const taskQueue = new Queue();

taskQueue.enqueue({ id: 1, task: "send email" });
taskQueue.enqueue({ id: 2, task: "resize image" });
taskQueue.enqueue({ id: 3, task: "generate report" });

console.log("Queue size:", taskQueue.size);   // → 3

while (!taskQueue.isEmpty) {
  const task = taskQueue.dequeue();
  console.log(`Processing: ${task.task} (id ${task.id})`);
}
```

Expected: tasks process in FIFO order: id 1, id 2, id 3.

**Change something:** Enqueue items 1, 2, 3, dequeue one (gets 1), enqueue 4 and 5, then dequeue all remaining. Expected order: 2, 3, 4, 5 — proving FIFO even after interleaved enqueue/dequeue operations.

---

### Step 3 — BFS with a Queue

**The problem this step solves:** Show a real algorithm (breadth-first graph search) that requires a queue, not a stack.

**The code:**

```js
// Find the shortest path in an unweighted graph using BFS
function bfs(graph, start, target) {
  const visited = new Set();
  const queue   = new Queue();
  const path    = new Map();   // node → which node we came from

  queue.enqueue(start);
  visited.add(start);
  path.set(start, null);  // start has no predecessor

  while (!queue.isEmpty) {
    const current = queue.dequeue();

    if (current === target) {
      // Reconstruct path from target back to start
      const result = [];
      let node = target;
      while (node !== null) {
        result.unshift(node);
        node = path.get(node);
      }
      return result;
    }

    for (const neighbor of (graph[current] ?? [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.set(neighbor, current);
        queue.enqueue(neighbor);
      }
    }
  }

  return null;  // target not reachable
}

// A simple graph:
//  A — B — C
//  |       |
//  D — E — F
const graph = {
  A: ["B", "D"],
  B: ["A", "C"],
  C: ["B", "F"],
  D: ["A", "E"],
  E: ["D", "F"],
  F: ["C", "E"],
};

console.log(bfs(graph, "A", "F"));   // → ["A", "B", "C", "F"] or ["A", "D", "E", "F"]
console.log(bfs(graph, "A", "C"));   // → ["A", "B", "C"]
console.log(bfs(graph, "A", "Z"));   // → null (not found)
```

`graph[current] ?? []` — if `graph[current]` is `undefined` (the node has no neighbors), use an empty array `[]` instead. This prevents `for...of` on `undefined`.

**The walkthrough — `bfs(graph, "A", "F")`:**

Queue: `[A]`. Visited: `{A}`. Dequeue `A`. Neighbors: `B`, `D`. Enqueue both. Queue: `[B, D]`. Visited: `{A, B, D}`.

Dequeue `B`. Neighbors: `A` (visited), `C`. Enqueue `C`. Queue: `[D, C]`. Visited: `{A, B, D, C}`.

Dequeue `D`. Neighbors: `A` (visited), `E`. Enqueue `E`. Queue: `[C, E]`.

Dequeue `C`. Neighbors: `B` (visited), `F`. Enqueue `F`. Queue: `[E, F]`. Dequeue `E`. Dequeue `F` — found target! Reconstruct: `F ← C ← B ← A`. Return `["A", "B", "C", "F"]`.

**Why a queue gives shortest path:** BFS processes nodes in order of their distance from the start. Level 0: A. Level 1: B, D. Level 2: C, E. Level 3: F. The first time a node is dequeued, it is reached via the shortest path — FIFO ensures all shorter paths are explored before longer ones.

**CS lens — BFS vs DFS:**

BFS (queue) finds the shortest path in an unweighted graph. DFS (stack/recursion) explores as deep as possible — useful for detecting cycles, topological sort, and when you need to find *any* path. The choice of queue vs stack determines the traversal order and which problems each solves correctly.

**SE lens — BFS in real systems:**

Social network "degrees of separation" (who is 2 connections from Alice?) is BFS. Web crawlers explore pages in BFS order. Compiler dependency resolution uses BFS to find the shortest import chain. GPS navigation finds shortest routes with BFS variants (Dijkstra's algorithm, LAB-135).

**What breaks if you use a stack for BFS:**

A stack produces DFS, not BFS. DFS does not guarantee the shortest path — it finds *a* path, not the *shortest* path. For `A to F` with a stack: might return `["A", "B", "C", "F"]` (shortest) or might return `["A", "D", "E", "F"]` (same length here) or a longer path if the graph were larger. The order of traversal is unpredictable from the user's perspective.

---

### SAVE AND TRY

```js
// Find shortest path in a larger graph
const cityGraph = {
  "NYC":     ["Boston", "Philadelphia"],
  "Boston":  ["NYC", "Providence"],
  "Philadelphia": ["NYC", "Baltimore", "Pittsburgh"],
  "Baltimore":    ["Philadelphia", "Washington"],
  "Washington":   ["Baltimore"],
  "Providence":   ["Boston"],
  "Pittsburgh":   ["Philadelphia"],
};

console.log(bfs(cityGraph, "NYC", "Washington"));
// → ["NYC", "Philadelphia", "Baltimore", "Washington"]
console.log(bfs(cityGraph, "Providence", "Pittsburgh"));
// → ["Providence", "Boston", "NYC", "Philadelphia", "Pittsburgh"]
```

Expected: shortest paths by number of hops.

**Change something:** Add `"Chicago": ["Pittsburgh", "Detroit"]` and `"Detroit": ["Chicago"]`. Find the path from "NYC" to "Chicago". Expected: `["NYC", "Philadelphia", "Pittsburgh", "Chicago"]`.

---

## Connect the Pieces

**What you built:** `Stack` with O(1) push/pop, `Queue` with O(1) amortized dequeue via two stacks, undo/redo editor, and BFS shortest-path finder.

**How it connects to LAB-001 (Call Stack):** The call stack IS a stack: function calls push frames; returns pop them. LIFO means the most recent call returns first — this is exactly what you implemented.

**How it connects to LAB-002 (Event Loop):** The browser task queue IS a queue: events arrive in FIFO order and are processed in FIFO order — the first event registered is the first handled.

**How it connects to LAB-024 (Arrays):** `push` and `pop` at array's end are O(1). `shift` from array's front is O(n). This cost asymmetry is why two-stack queue beats single-array queue.

**How it connects forward:**

- **LAB-029 (Trees/BST):** Tree traversal uses both stack (DFS, pre/in/post-order) and queue (BFS, level-order). Choosing between them is about which ordering you need.
- **LAB-030 (Graphs):** DFS and BFS are the two fundamental graph traversal algorithms. Stack gives DFS; queue gives BFS.
- **LAB-078 (Command Pattern):** The `type`/`undo`/`redo` editor implements the Command pattern — each state snapshot is a "command" that can be reversed. The undo stack is the literal command history.

**The real-world connection:**

Browser history (Back/Forward buttons) is two stacks — identical to the undo/redo editor. Job queues in background task systems (Sidekiq, Celery, AWS SQS) are FIFO queues. The JavaScript event loop's task queue is FIFO. Every operating system's process scheduler uses a queue (FIFO or priority queue). The Go runtime's goroutine scheduler uses work-stealing deques (double-ended queues).

---

## What Breaks Without This

**Concrete failure — O(n) queue with Array.shift:**

```js
const naiveQueue = [];

// Enqueue 10,000 tasks:
for (let i = 0; i < 10_000; i++) naiveQueue.push(i);

console.time("naive dequeue");
while (naiveQueue.length > 0) {
  naiveQueue.shift();   // O(n) per dequeue — O(n²) total
}
console.timeEnd("naive dequeue");

// Compare to two-stack queue:
const efficientQueue = new Queue();
for (let i = 0; i < 10_000; i++) efficientQueue.enqueue(i);

console.time("efficient dequeue");
while (!efficientQueue.isEmpty) {
  efficientQueue.dequeue();  // O(1) amortized — O(n) total
}
console.timeEnd("efficient dequeue");
```

Expected: the efficient queue is significantly faster for 10,000 items.

---

## Definition of Done

Verify each item before moving to LAB-028.

- [ ] `Stack.push` and `Stack.pop` are both O(1)
- [ ] `Stack.pop` on an empty stack throws "Stack underflow"
- [ ] `TextEditor` undo/redo works correctly through multiple operations
- [ ] `Queue` FIFO order is correct: first enqueued = first dequeued
- [ ] `Queue.dequeue` on an empty queue throws
- [ ] `bfs(graph, "A", "F")` returns a valid shortest path
- [ ] `bfs` returns `null` for unreachable targets

**Git commit:**

```
git add .
git commit -m "LAB-027: Stack (LIFO) and Queue (FIFO) — undo/redo via two stacks, BFS shortest path with queue"
```

---

## Quick Check Answers

**1. When `f` calls `g` calls `h`, which function returns first?**

`h` returns first — it was pushed onto the call stack last (most recently), so it is at the top. LIFO means last in, first out. `h` finishes, its frame is popped. `g` resumes, finishes, its frame is popped. `f` resumes, finishes.

**2. In what order do print jobs A, B, C print in a FIFO queue?**

A, then B, then C — the order they arrived. FIFO means first in, first out. Job A was enqueued first, so it is dequeued first.

**3. Why is single-array queue dequeue O(n)?**

Removing from the front of an array (`shift`) requires shifting every remaining element one position left to fill the vacated index 0. For a 10,000-element array, this is 10,000 shift operations per dequeue: O(n). The two-stack approach avoids this by transferring elements in reverse (using O(1) pop/push at array ends) and amortizing the transfer cost across multiple dequeue operations.

---

*Next: LAB-028 — Linked Lists*
