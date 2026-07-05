export default {
  id: 'queue',
  title: 'Queue',
  tag: 'Data Structure',
  steps: [
    {
      title: 'Queue — items array, FIFO contract',
      semanticEvent: 'DefineClass',
      code:
`class Queue {
  constructor() {
    this.items = []
  }
}

const q = new Queue()
console.log(q.items)`,
      explanation: [
        '`Queue` establishes the **FIFO contract**: wrapping a single `items` array, it guarantees that the first element added will be the first removed. The data structure owns this invariant — no caller needs to enforce it manually. Unlike a Stack (LIFO, both ends at the tail), a Queue adds at one end and removes from the other.',
        'CS — A queue is an abstract data type defined by two operations: enqueue (add to back) and dequeue (remove from front). Using an array: enqueue calls `Array.push` (`O(1)`) — appends to tail; dequeue calls `Array.shift` (`O(n)`) — removes from head and shifts all remaining elements left. For high-throughput queues, a doubly linked list is preferred because dequeue becomes `O(1)`.',
        'SE — Queues are the backbone of every async system: browser event queue (mouse clicks, keystrokes wait in queue until the call stack is empty), Node.js libuv task queue (I/O callbacks), job queues (BullMQ, Celery, Sidekiq), message queues (RabbitMQ, Kafka, SQS). The FIFO guarantee preserves ordering — messages are processed in the order they arrived.',
        'Without this: without the queue abstraction, callers manage the array directly — pushing and shifting manually. When the implementation changes (say, from array to linked list for performance), every call site breaks. The class encapsulates the operation names (`enqueue`, `dequeue`) and owns the implementation choice.',
      ],
      active: [
        { startLine: 1, endLine: 5, color: 'indigo', label: 'Queue — FIFO via array' },
        { startLine: 7, endLine: 8, color: 'emerald', label: 'new Queue() starts empty' },
      ],
      connections: [],
    },
    {
      title: 'enqueue() — add to the back',
      semanticEvent: 'DefineFunction',
      code:
`class Queue {
  constructor() {
    this.items = []
  }

  enqueue(item) {
    this.items.push(item)
    return this
  }
}

const q = new Queue()
console.log(q.items)

q.enqueue('task-1').enqueue('task-2').enqueue('task-3')
console.log(q.items)`,
      explanation: [
        '`enqueue()` establishes the **stable add-to-back contract**: `return this` enables chaining, so `q.enqueue(\'task-1\').enqueue(\'task-2\').enqueue(\'task-3\')` loads three tasks in one expression. The FIFO guarantee is maintained because `Array.push` always appends to the tail — `task-1` lands at index 0, the front, and will be the first removed.',
        'CS — `Array.push` is amortised `O(1)`. JavaScript arrays are dynamic — when they run out of capacity, the engine allocates a larger buffer and copies. Amortised over many pushes, the average cost is constant. The push end is the "tail" of the queue; index 0 is the "head". Dequeue will operate at index 0.',
        'SE — Production job queues call their add operation `enqueue`, `push`, `publish`, or `send` — the name signals intent. BullMQ\'s `queue.add(name, data)` enqueues a job to Redis. SQS\'s `SendMessage` enqueues a message. The operation is always: add to the back and let the consumer pick up from the front in arrival order.',
        'Without this: without `enqueue`, callers call `q.items.push(item)` directly — exposing that the internal structure is an array. If you later optimise to a linked list, all callers break. `enqueue` is the stable API; `push` on `items` is the implementation detail.',
      ],
      active: [
        { startLine: 6,  endLine: 9,  color: 'violet',  label: 'enqueue — push to back, return this' },
        { startLine: 15, endLine: 16, color: 'emerald', label: 'three enqueues; task-1 is at front (index 0)' },
      ],
      connections: [{ fromLine: 15, toLine: 6, color: 'emerald', label: 'chained enqueues', type: 'calls' }],
    },
    {
      title: 'dequeue() — remove from the front',
      semanticEvent: 'DefineFunction',
      code:
`class Queue {
  constructor() {
    this.items = []
  }

  enqueue(item) {
    this.items.push(item)
    return this
  }

  dequeue() {
    if (this.items.length === 0) return undefined
    return this.items.shift()
  }
}

const q = new Queue()
console.log(q.items)

q.enqueue('task-1').enqueue('task-2').enqueue('task-3')
console.log(q.items)

console.log(q.dequeue())
console.log(q.dequeue())
console.log(q.items)`,
      explanation: [
        '`dequeue()` establishes the **FIFO extraction contract**: the empty-queue guard returns `undefined` rather than crashing, and `Array.shift` removes and returns the first element. After two calls, `task-1` and `task-2` are gone in arrival order — `task-1` (first in) comes out first. The remaining `[\'task-3\']` confirms the FIFO invariant holds.',
        'CS — `Array.shift` is `O(n)`: it removes index 0 and shifts every remaining element one index to the left. For a queue with 1,000 items, dequeue copies 999 references. This is the known weakness of array-backed queues. The optimisation is to use two stacks or a circular buffer for `O(1)` dequeue — but for moderate queue sizes, `Array.shift` is acceptable.',
        'SE — The JavaScript event loop\'s task queue uses dequeue: `setTimeout` callbacks are enqueued when the timer fires; the event loop dequeues and executes them one at a time. Node.js\'s `process.nextTick` queue, `Promise` microtask queue, and `setImmediate` queue are all dequeue-driven. The browser\'s `requestAnimationFrame` callbacks are dequeued each frame.',
        'Without this: without the empty-queue guard (`if length === 0 return undefined`), calling `dequeue()` on an empty queue returns `undefined` from `shift()` anyway — but for a queue of objects, `undefined` is ambiguous: was the queue empty, or did someone enqueue `undefined`? The guard makes the empty case explicit.',
      ],
      active: [
        { startLine: 11, endLine: 14, color: 'violet',  label: 'dequeue — guard then shift from front' },
        { startLine: 23, endLine: 25, color: 'emerald', label: 'task-1 out, task-2 out, task-3 remains' },
      ],
      connections: [{ fromLine: 23, toLine: 11, color: 'emerald', label: 'dequeue → task-1 (first in)', type: 'calls' }],
    },
    {
      title: 'peek() and size — read without removing',
      semanticEvent: 'DefineFunction',
      code:
`class Queue {
  constructor() {
    this.items = []
  }

  enqueue(item) {
    this.items.push(item)
    return this
  }

  dequeue() {
    if (this.items.length === 0) return undefined
    return this.items.shift()
  }

  peek() {
    return this.items[0]
  }

  get size() {
    return this.items.length
  }
}

const q = new Queue()
console.log(q.items)

q.enqueue('task-1').enqueue('task-2').enqueue('task-3')
console.log(q.items)

console.log(q.dequeue())
console.log(q.dequeue())
console.log(q.items)

console.log(q.peek())
console.log(q.size)`,
      explanation: [
        '`peek()` and `size` establish the **non-destructive read contract**: `peek` exposes the front element without modifying the queue, and `size` computes from `items.length` on demand rather than maintaining a separate counter. After two dequeues, `peek()` returns `\'task-3\'` and `size` returns `1` — the queue\'s state is unchanged by both calls.',
        'CS — `peek` reads the head of the queue in `O(1)` — direct index access. The `size` getter is a computed property: the length is not stored separately (that would get out of sync), it reads `items.length` on demand. Using a getter means callers write `q.size` not `q.size()` — it looks like a property even though it runs code.',
        'SE — `peek` is essential in priority queues and scheduling systems: before dequeuing a job, the scheduler peeks to check if it should be processed now (based on priority, delay, or resource availability). BullMQ\'s `Queue.getWaiting()` returns jobs without removing them. Kafka consumers `poll()` to peek at the next batch before committing the offset.',
        'Without this: without `peek`, reading the front of the queue requires dequeue-then-re-enqueue — a destructive round-trip that loses FIFO ordering if anything is pushed in between. The dedicated `peek` method is the non-destructive read-without-remove operation the data structure contract requires.',
      ],
      active: [
        { startLine: 16, endLine: 18, color: 'violet',  label: 'peek — read front, O(1), no removal' },
        { startLine: 20, endLine: 22, color: 'indigo',  label: 'size getter — computed from items.length' },
        { startLine: 35, endLine: 36, color: 'emerald', label: 'peek → task-3, size → 1' },
      ],
      connections: [],
    },
    {
      title: 'isEmpty() and drain — process all items',
      semanticEvent: 'DefineFunction',
      code:
`class Queue {
  constructor() {
    this.items = []
  }

  enqueue(item) {
    this.items.push(item)
    return this
  }

  dequeue() {
    if (this.items.length === 0) return undefined
    return this.items.shift()
  }

  peek() {
    return this.items[0]
  }

  get size() {
    return this.items.length
  }

  isEmpty() {
    return this.items.length === 0
  }
}

const q = new Queue()
console.log(q.items)

q.enqueue('task-1').enqueue('task-2').enqueue('task-3')
console.log(q.items)

console.log(q.dequeue())
console.log(q.dequeue())
console.log(q.items)

console.log(q.peek())
console.log(q.size)

const work = new Queue()
work.enqueue('email').enqueue('resize-image').enqueue('generate-pdf')
while (!work.isEmpty()) {
  const job = work.dequeue()
  console.log('processing: ' + job)
}
console.log(work.isEmpty())`,
      explanation: [
        '`isEmpty()` establishes the **safe termination contract**: the drain loop `while (!work.isEmpty()) { work.dequeue() }` processes `\'email\'`, `\'resize-image\'`, `\'generate-pdf\'` in arrival order, then stops. `isEmpty()` checks the count rather than the element value — so it remains correct even if `undefined` was enqueued.',
        'CS — The drain loop `while (!isEmpty()) { dequeue() }` is fundamental to queue-based algorithms. Breadth-first search drains a queue level by level. Topological sort drains a queue of zero-in-degree nodes. The event loop drains its task queue between render frames. All of these are instances of the same loop structure.',
        'SE — Job workers drain job queues continuously: `while (true) { const job = await queue.dequeue(); await process(job) }`. BullMQ workers, Sidekiq workers, and Celery workers all implement this pattern. The `isEmpty()` guard prevents calling `dequeue()` on an empty queue — which would return `undefined` and `process(undefined)` would fail silently.',
        'Without this: without `isEmpty`, the drain loop uses `while (q.size > 0)` or checks if dequeue returned `undefined`. These work, but `isEmpty()` communicates intent — "loop while there is work" — in plain English. The named method also means the queue can change its internal size representation without affecting any loop.',
      ],
      active: [
        { startLine: 24, endLine: 26, color: 'violet',  label: 'isEmpty — size === 0 check' },
        { startLine: 42, endLine: 45, color: 'emerald', label: 'drain loop — process all jobs in FIFO order' },
      ],
      connections: [{ fromLine: 43, toLine: 24, color: 'violet', label: 'isEmpty checked before each dequeue', type: 'calls' }],
    },
    {
      title: 'Priority queue — process by importance',
      semanticEvent: 'DefineClass',
      code:
`class Queue {
  constructor() {
    this.items = []
  }

  enqueue(item) {
    this.items.push(item)
    return this
  }

  dequeue() {
    if (this.items.length === 0) return undefined
    return this.items.shift()
  }

  peek() {
    return this.items[0]
  }

  get size() {
    return this.items.length
  }

  isEmpty() {
    return this.items.length === 0
  }
}

class PriorityQueue {
  constructor() {
    this.items = []
  }

  enqueue(item, priority) {
    this.items.push({ item: item, priority: priority })
    this.items.sort(function(a, b) { return b.priority - a.priority })
  }

  dequeue() {
    if (this.items.length === 0) return undefined
    return this.items.shift().item
  }

  peek() {
    return this.items.length > 0 ? this.items[0].item : undefined
  }
}

const work = new Queue()
work.enqueue('email').enqueue('resize-image').enqueue('generate-pdf')
while (!work.isEmpty()) {
  const job = work.dequeue()
  console.log('processing: ' + job)
}
console.log(work.isEmpty())

const pq = new PriorityQueue()
pq.enqueue('low-priority-cleanup', 1)
pq.enqueue('critical-alert', 10)
pq.enqueue('normal-task', 5)
console.log(pq.peek())
console.log(pq.dequeue())
console.log(pq.dequeue())
console.log(pq.dequeue())`,
      explanation: [
        '`PriorityQueue` establishes the **priority-ordered extraction contract**: sorting by descending `priority` after every `enqueue` means `items[0]` is always the most urgent. After inserting priorities 1, 10, 5, dequeue order is 10 → 5 → 1 — arrival order is irrelevant, urgency determines sequence.',
        'CS — A priority queue is a queue that dequeues by priority, not arrival order. Sorting on insert is `O(n log n)` — acceptable for small queues. Production priority queues use a binary heap for `O(log n)` insert and `O(log n)` dequeue. The heap property guarantees the highest-priority item is always at index 0 without full sorting.',
        'SE — Operating system schedulers are priority queues: `SIGKILL` at priority 9 preempts everything. Dijkstra\'s shortest path algorithm uses a min-priority-queue (lowest weight first). A* pathfinding uses a priority queue of nodes sorted by estimated total cost. React\'s scheduler (in Concurrent Mode) uses a priority queue to decide which update to process next.',
        'Without this: without priority ordering, a web server would process a health-check ping before a critical alert that arrived after it. FIFO is fair but not smart. Priority queues let systems assign urgency — critical work is never blocked behind low-priority work just because it arrived later.',
      ],
      active: [
        { startLine: 29, endLine: 46, color: 'indigo',  label: 'PriorityQueue — sort by priority on enqueue' },
        { startLine: 35, endLine: 35, color: 'violet',  label: 'sort descending — highest priority to front' },
        { startLine: 59, endLine: 62, color: 'emerald', label: 'dequeued in order: 10 → 5 → 1' },
      ],
      connections: [],
    },
  ],
}
