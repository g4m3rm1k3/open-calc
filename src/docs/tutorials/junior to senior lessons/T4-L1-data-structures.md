# Junior to Senior — T4·L1 — Data Structures Reference

**Prerequisites:** T4·L0 (Big O Notation). You can reason about algorithmic
complexity. This lesson gives you the data structures you will reach for throughout
the rest of the curriculum — with the right one for each situation.

**What this lab adds:**
- Stack (LIFO): push/pop/peek — undo/redo, expression parsing
- Queue (FIFO): enqueue/dequeue — job queues, breadth-first search
- Hash map / Set: O(1) lookup — the most frequently useful structure
- Tree: hierarchical — scene graphs, ASTs, dependency graphs
- When to use each: the decision table

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You need to implement undo/redo. Which structure models "the last action
>    done is the first to undo"?
> 2. You need to process geometry items in the order they were added, one at
>    a time. Which structure?
> 3. You need to check "does this tool ID exist?" 10,000 times per second.
>    Which structure, and why?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

TypeScript implementations of all four core structures, each tested:

```
$ npx vitest run

✓ Stack > push and pop follow LIFO order
✓ Stack > peek returns top without removing
✓ Stack > isEmpty returns true when empty
✓ Queue > enqueue and dequeue follow FIFO order
✓ Queue > isEmpty returns true when empty
✓ Tree > depth-first traversal visits every node
✓ Tree > findById returns the correct node

Tests  7 passed (7)
```

---

### Concept: Stack — Last In, First Out (LIFO)

**What it is:** A stack adds items to the top and removes from the top only.
The last item pushed is the first item popped.

**The problem before (implementing undo without a stack):**

```ts
// Trying to implement undo with an array and manual index tracking:
const actions: string[] = [];
let undoIndex = actions.length - 1;

function undo() {
  if (undoIndex < 0) return;
  applyReverse(actions[undoIndex]);
  undoIndex--;
}
// Error-prone: undoIndex must be manually updated everywhere
```

**The solution — a Stack:**

```ts
const undoStack = new Stack<Action>();
const redoStack = new Stack<Action>();

function doAction(action: Action): void {
  applyAction(action);
  undoStack.push(action);
  while (!redoStack.isEmpty) redoStack.pop();  // clear redo on new action
}

function undo(): void {
  const action = undoStack.pop();
  if (!action) return;
  reverseAction(action);
  redoStack.push(action);
}
```

**What it hides:** The index management. A Stack's interface (`push`, `pop`, `peek`)
encodes the LIFO invariant — you cannot access any element except the top without
violating the abstraction.

The invariant a Stack protects: LIFO order. The last item pushed is always the first
item available to pop. No element can "jump the queue."

**Canonical example:** A stack of plates. You put plates on top and take them from
the top. You cannot take the third plate down without first removing the top two.
LIFO: the last plate washed (pushed) is the first plate used (popped).

**Project Application:** The undo/redo system for CAD/CAM operations. Every geometry
operation (add line, move point, delete arc) is pushed. Ctrl+Z pops and reverses.

**Smallest possible example:**

```ts
class Stack<T> {
  private items: T[] = [];
  push(item: T)    { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  get isEmpty() { return this.items.length === 0; }
}

const s = new Stack<number>();
s.push(1); s.push(2); s.push(3);
s.pop();   // → 3  (last in, first out)
s.pop();   // → 2
```

**You will see this again in:**
- Browser history: back button is a stack
- Call stack: the execution context is literally a stack
- Expression parsing: matching parentheses uses a stack
- Depth-first graph traversal

**Watch for:** `Stack.pop()` on an empty stack returns `undefined`. Always check
`isEmpty` before popping, or handle the `undefined` case.

---

### Concept: Queue — First In, First Out (FIFO)

**What it is:** A queue adds items to the back and removes from the front.
The first item enqueued is the first item dequeued.

**When it appears:** Processing items in the order they arrived — print queues,
background job queues, breadth-first graph traversal.

**The problem before — using array with pop(0):**

```ts
const queue: string[] = [];
queue.push('first job');
queue.push('second job');
queue.shift();   // O(n) — shifts every element left
```

`Array.shift()` is O(n). For high-throughput queues, use a proper Queue implementation
or a doubly-linked list.

**The solution:**

```ts
class Queue<T> {
  private items: T[] = [];
  enqueue(item: T)    { this.items.push(item); }     // O(1)
  dequeue(): T | undefined { return this.items.shift(); } // O(n) — acceptable for small n
  peek(): T | undefined { return this.items[0]; }
  get isEmpty() { return this.items.length === 0; }
}
```

**What it hides:** The ordering guarantee. FIFO means processing is fair —
the first request submitted is the first processed. No item can be skipped.

The invariant a Queue protects: FIFO order. The first item enqueued is always
the next item dequeued.

**Canonical example:** A coffee shop queue. The first person in line (enqueued)
is the first person served (dequeued). Cutting in line (taking from the middle)
violates the Queue's contract.

**Project Application:** A toolpath generation queue. The user selects five profiles
and clicks "Generate All." Each profile is enqueued. The generator processes them in
order, one at a time.

**Smallest possible example:**

```ts
const queue = new Queue<string>();
queue.enqueue('first');
queue.enqueue('second');
queue.dequeue();   // → 'first'  (first in, first out)
queue.dequeue();   // → 'second'
```

**You will see this again in:**
- Message queues (RabbitMQ, AWS SQS): the fundamental queueing abstraction
- Breadth-first search: uses a queue to visit nodes level by level
- Task schedulers: OS process queues are FIFO

**Watch for:** `Queue.dequeue()` on an empty queue returns `undefined`. Always
check `isEmpty` before dequeuing.

---

### Concept: Hash Map and Set — O(1) Lookup

**What it is:** A hash map stores key→value pairs with O(1) average lookup, insert,
and delete. A `Set` is a hash map where only the keys matter (no associated values).

**When to use:**
- "Does X exist?" → `Set`
- "What is the value for key X?" → `Map`
- "Count occurrences of each X" → `Map<X, number>`

**The problem before — scanning for membership:**

```ts
const processedIds: string[] = [];

function alreadyProcessed(id: string): boolean {
  return processedIds.includes(id);  // O(n) — scans the whole array each time
}
```

With 10,000 IDs, every `alreadyProcessed` call does 10,000 comparisons.

**The solution:**

```ts
const processedIds = new Set<string>();

function alreadyProcessed(id: string): boolean {
  return processedIds.has(id);  // O(1) — hash lookup
}
```

**What it hides:** The hash computation and bucket management. When you call
`map.get(key)`, JavaScript computes `hash(key)`, finds the bucket, and checks
for the key. The total size of the map does not affect this time.

The invariant a Set protects: uniqueness. Every element appears at most once.
Attempting to add a duplicate is silently ignored — no crash, no error.

**Canonical example:** A library card catalogue. The catalogue (Map) maps each book
title (key) to its location (value). Finding a book takes the same time whether the
library has 100 or 100,000 books — you always look up by the card catalogue.

**Project Application:** The CAD/CAM geometry registry: `Map<string, GeometryItem>`.
Every click event, every toolpath operation, every G-code line starts with an O(1) ID
lookup against this map.

**Smallest possible example:**

```ts
const cities = new Set(['London', 'Paris', 'Berlin']);
cities.has('London')     // → true  (O(1))
cities.has('Tokyo')      // → false (O(1))

const scores = new Map([['Alice', 95], ['Bob', 87]]);
scores.get('Alice')      // → 95  (O(1))
```

**You will see this again in:**
- Database hash indexes: O(1) lookup by indexed column
- Memoisation (`lru_cache` from T5): cache results in a Map for O(1) retrieval
- Deduplication: `new Set(array)` removes duplicates in O(n)

**Watch for:** Keys in a Map must be hashable. In JavaScript/TypeScript, objects
are compared by reference, not value. `new Map<{x:number}, string>()` might not
behave as expected if you create new objects as keys each time.

---

### Concept: Tree — Hierarchical Structure

**What it is:** A tree has nodes connected in a parent-child hierarchy. One node
is the root (no parent). Every other node has exactly one parent and zero or more
children.

**When to use:** Hierarchical data — file systems, scene graphs, ASTs, dependency graphs.

**The problem before — flat list for hierarchical data:**

```ts
// Trying to represent a scene graph as a flat list:
const items = [
  { id: 'scene', parentId: null },
  { id: 'layer-1', parentId: 'scene' },
  { id: 'line-1', parentId: 'layer-1' },
  { id: 'arc-1', parentId: 'layer-1' },
];

// Finding all children of 'layer-1' requires scanning all items
// Traversal requires sorting and filtering — complex and O(n) per node
```

**The solution — a tree with typed nodes:**

```ts
interface TreeNode<T> {
  id:       string;
  data:     T;
  children: TreeNode<T>[];
}

function* traverse<T>(node: TreeNode<T>): Generator<TreeNode<T>> {
  yield node;
  for (const child of node.children) {
    yield* traverse(child);   // depth-first: parent before children
  }
}

function findById<T>(root: TreeNode<T>, id: string): TreeNode<T> | undefined {
  for (const node of traverse(root)) {
    if (node.id === id) return node;
  }
  return undefined;
}
```

**What it hides:** The recursive traversal machinery. `traverse` uses a generator
(covered in T5-L0h) to yield nodes one at a time in depth-first order.

The invariant a Tree protects: no cycles. Every non-root node has exactly one parent,
and no path from a node leads back to itself.

**Canonical example:** A file system. Every directory (parent node) contains files
and subdirectories (children). Traversing the file system from `/` visits every file
by recursively descending into each directory — depth-first traversal.

**Project Application:** The CAD/CAM scene graph: `Scene → Layers → GeometryItems`.
Every rendering pass traverses this tree. Operations on a layer apply to all its items.

**Smallest possible example:**

```ts
const tree: TreeNode<string> = {
  id: 'root', data: 'Root', children: [
    { id: 'child-1', data: 'Child 1', children: [] },
    { id: 'child-2', data: 'Child 2', children: [
      { id: 'grandchild', data: 'Grandchild', children: [] }
    ]},
  ]
};

[...traverse(tree)].map(n => n.id)
// → ['root', 'child-1', 'child-2', 'grandchild']  — depth-first
```

**You will see this again in:**
- DOM: the browser document is a tree of HTML elements
- React's virtual DOM: a tree that R3F's scene graph maps to Three.js
- ASTs: parsed code (from T9) is a tree of tokens

**Watch for:** Infinite recursion on cyclic data. A tree traversal assumes no cycles.
If you accidentally add a cycle, `traverse` runs forever. Always verify "is this a tree
or a graph?" before using tree traversal.

---

## Step 1 — Implement All Four Structures

Create `src/data-structures.ts`:

```ts
export class Stack<T> {
  private readonly items: T[] = [];

  push(item: T): void                     { this.items.push(item); }
  pop():         T | undefined            { return this.items.pop(); }
  peek():        T | undefined            { return this.items[this.items.length - 1]; }
  get isEmpty(): boolean                  { return this.items.length === 0; }
  get size():    number                   { return this.items.length; }
}

export class Queue<T> {
  private readonly items: T[] = [];

  enqueue(item: T): void                  { this.items.push(item); }
  dequeue():        T | undefined         { return this.items.shift(); }
  peek():           T | undefined         { return this.items[0]; }
  get isEmpty():    boolean               { return this.items.length === 0; }
  get size():       number                { return this.items.length; }
}

export interface TreeNode<T> {
  id:       string;
  data:     T;
  children: TreeNode<T>[];
}

export function* traverse<T>(node: TreeNode<T>): Generator<TreeNode<T>> {
  yield node;
  for (const child of node.children) {
    yield* traverse(child);
  }
}

export function findById<T>(
  root: TreeNode<T>,
  id:   string,
): TreeNode<T> | undefined {
  for (const node of traverse(root)) {
    if (node.id === id) return node;
  }
  return undefined;
}
```

---

## Step 2 — Write Tests

Create `src/data-structures.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Stack, Queue, TreeNode, traverse, findById } from './data-structures';

describe('Stack', () => {

  it('push and pop follow LIFO order', () => {
    const stack = new Stack<number>();
    stack.push(1); stack.push(2); stack.push(3);

    expect(stack.pop()).toBe(3);   // last in, first out
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it('peek returns the top item without removing it', () => {
    const stack = new Stack<string>();
    stack.push('a'); stack.push('b');

    expect(stack.peek()).toBe('b');
    expect(stack.size).toBe(2);    // still 2 items
  });

  it('isEmpty returns true when the stack has no items', () => {
    const stack = new Stack<number>();
    expect(stack.isEmpty).toBe(true);

    stack.push(1);
    expect(stack.isEmpty).toBe(false);

    stack.pop();
    expect(stack.isEmpty).toBe(true);
  });

  it('pop returns undefined on an empty stack', () => {
    expect(new Stack<number>().pop()).toBeUndefined();
  });

});

describe('Queue', () => {

  it('enqueue and dequeue follow FIFO order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1); queue.enqueue(2); queue.enqueue(3);

    expect(queue.dequeue()).toBe(1);   // first in, first out
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
  });

  it('isEmpty returns true when the queue has no items', () => {
    const queue = new Queue<string>();
    expect(queue.isEmpty).toBe(true);

    queue.enqueue('a');
    expect(queue.isEmpty).toBe(false);

    queue.dequeue();
    expect(queue.isEmpty).toBe(true);
  });

});

describe('Tree traversal', () => {

  function makeScene() {
    const scene: TreeNode<string> = { id: 'scene', data: 'Scene', children: [] };
    const layer: TreeNode<string> = { id: 'layer-1', data: 'Layer 1', children: [] };
    const line:  TreeNode<string> = { id: 'line-1',  data: 'Line',    children: [] };
    const arc:   TreeNode<string> = { id: 'arc-1',   data: 'Arc',     children: [] };
    layer.children.push(line, arc);
    scene.children.push(layer);
    return scene;
  }

  it('depth-first traversal visits every node in parent-before-children order', () => {
    const scene = makeScene();
    const ids   = [...traverse(scene)].map(n => n.id);

    expect(ids).toEqual(['scene', 'layer-1', 'line-1', 'arc-1']);
  });

  it('findById returns the node with the matching id', () => {
    const scene = makeScene();
    const found = findById(scene, 'arc-1');

    expect(found?.data).toBe('Arc');
  });

  it('findById returns undefined for a missing id', () => {
    const scene = makeScene();
    expect(findById(scene, 'nonexistent')).toBeUndefined();
  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ Stack > push and pop follow LIFO order
✓ Stack > peek returns the top item without removing it
✓ Stack > isEmpty returns true when the stack has no items
✓ Stack > pop returns undefined on an empty stack
✓ Queue > enqueue and dequeue follow FIFO order
✓ Queue > isEmpty returns true when the queue has no items
✓ Tree traversal > depth-first traversal visits every node
✓ Tree traversal > findById returns the node with the matching id
✓ Tree traversal > findById returns undefined for a missing id

Tests  9 passed (9)
```

**Change something:** Implement breadth-first traversal using a queue instead of
depth-first recursion:

```ts
// Add to data-structures.ts:
export function* bfs<T>(root: TreeNode<T>): Generator<TreeNode<T>> {
  const queue = new Queue<TreeNode<T>>();
  queue.enqueue(root);

  while (!queue.isEmpty) {
    const node = queue.dequeue()!;
    yield node;
    for (const child of node.children) {
      queue.enqueue(child);
    }
  }
}
```

Expected BFS order for the scene: `['scene', 'layer-1', 'line-1', 'arc-1']` — the same
in this case (only one level). Add a second layer to see the difference: BFS visits all
nodes at depth 1 before any at depth 2.

---

## 🎯 Challenge: Build a `BoundedHistory<T>`

**You know:** Stack, Queue, the decision table.

**Task:** Build `BoundedHistory<T>` that keeps the last `maxSize` items. When a new
item is added and the history is full, the oldest item is removed. Implement `add(item)`,
`getLast(n)` (returns the last n items, newest first), and `clear()`.

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
class BoundedHistory<T> {
  private readonly items: T[] = [];

  constructor(private readonly maxSize: number) {}

  add(item: T): void {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items.shift();  // remove the oldest
    }
  }

  getLast(n: number): T[] {
    return this.items.slice(-n).reverse();  // last n items, newest first
  }

  clear(): void { this.items.length = 0; }

  get size(): number { return this.items.length; }
}
```

**Tests:**
```ts
it('keeps only the last maxSize items', () => {
  const h = new BoundedHistory<string>(3);
  h.add('a'); h.add('b'); h.add('c'); h.add('d');
  expect(h.size).toBe(3);   // 'd', 'c', 'b' — 'a' was evicted
});

it('getLast returns n most recent items, newest first', () => {
  const h = new BoundedHistory<string>(10);
  h.add('first'); h.add('second'); h.add('third');
  expect(h.getLast(2)).toEqual(['third', 'second']);
});

it('clear empties the history', () => {
  const h = new BoundedHistory<number>(5);
  h.add(1); h.add(2);
  h.clear();
  expect(h.size).toBe(0);
});
```

</details>

---

## Final Check

| Structure | Operation | Complexity | Use when |
|---|---|---|---|
| Array | Access by index | O(1) | Need index-based access |
| Stack | Push/Pop/Peek | O(1) | LIFO ordering (undo, call stack) |
| Queue | Enqueue/Peek | O(1) | FIFO ordering (job queues) |
| Queue | Dequeue (`shift`) | O(n) | Use deque for high throughput |
| Map/Set | Get/Has/Set | O(1) average | Lookup by key, membership checks |
| Tree | Find by ID | O(n) | Hierarchical data |

---

## Quick Check Answers

**1. LIFO — last action done is first to undo. Which structure?**

Stack. LIFO (Last In, First Out) is the definition of a stack. Push each action when
it is performed; pop to undo (the last action performed is the first popped).

**2. Process geometry items in arrival order. Which structure?**

Queue. FIFO (First In, First Out) — the first item added is the first processed.

**3. "Does this tool ID exist?" 10,000 times per second. Which structure and why?**

`Set<string>`. A Set's `has()` operation is O(1) — hash computation + bucket check.
Running 10,000 O(1) operations per second is trivial. The same check with
`Array.includes()` is O(n) — with 1,000 tool IDs and 10,000 checks per second, that
is 10,000,000 comparisons per second, which becomes measurably slow.
