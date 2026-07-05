export default {
  id: 'linked-list',
  title: 'Linked List',
  tag: 'Data Structure',
  steps: [
    {
      title: 'Node — value and pointer',
      semanticEvent: 'DefineClass',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}`,
      explanation: [
        '`Node` defines the **two-field building block** of a linked list: `value` holds the data and `next` is the pointer to the following node, starting as `null`. The chain is formed by setting `next` to other nodes. There is no fixed-size allocation — the list grows by creating new nodes and linking them one at a time.',
        'CS — A singly linked list is a recursive data structure: a list is either empty (`null`) or a node with a value and a pointer to the rest of the list. Each node is an independent heap allocation. Traversal is `O(n)` — you follow `next` pointers from head to tail. Index access is also `O(n)`, unlike an array\'s `O(1)`. Insertion at the head is `O(1)`, unlike an array\'s `O(n)` shift.',
        'SE — Linked lists underpin many production data structures: queues (append to tail, remove from head in `O(1)`), stacks (push/pop at head in `O(1)`), and LRU caches (doubly-linked list for `O(1)` move-to-front). Node.js\'s `stream.Readable` uses a linked list internally for its chunk buffer.',
        'Without this: if `next` were initialised to anything other than `null`, a freshly created node would appear to point to a valid successor. Every traversal would need to handle the uninitialised pointer — the loop would not terminate correctly. `null` is the sentinel value that signals "end of list."',
      ],
      active: [
        { startLine: 3, endLine: 3, color: 'indigo', label: 'value — the data' },
        { startLine: 4, endLine: 4, color: 'violet', label: 'next — points to next node' },
      ],
      connections: [],
    },
    {
      title: 'Create a node and inspect it',
      semanticEvent: 'CreateObject',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

const a = new Node(10)
console.log(a.value)`,
      explanation: [
        '`new Node(10)` **creates the first node**: the constructor runs, assigns `value = 10` and `next = null`, and stores the instance in `a`. `a` is a reference to a heap object with two fields. `a.value` prints `10`. `a.next` is `null` — this node exists in isolation, not yet part of any chain. This is the atomic unit from which a list is built.',
        'CS — `new Node(10)` allocates a new object on the heap and runs the constructor. `a` is a reference to that heap location. `a.value` reads through the reference to the object\'s `value` slot. Two distinct variables holding the same `new Node(10)` result would be references to the same heap object — mutating one would mutate the other.',
        'SE — In production linked list code, `Node` is often a private implementation detail. The public API is the `LinkedList` class (coming next) — callers never interact with `Node` directly. This encapsulation means the internal representation can change (doubly-linked, sentinel head node) without breaking the public API.',
        'Without this: creating a node without inspecting it is harder to debug. `console.log(a.value)` confirms the constructor ran correctly and the assignment worked. Before building the full list, verifying the node primitive is correct prevents mysterious failures in later steps where `value` would be `undefined` if the constructor had a typo.',
      ],
      active: [
        { startLine: 8, endLine: 9, color: 'emerald', label: 'node created, value printed' },
        { startLine: 2, endLine: 5, color: 'indigo',  label: 'constructor runs' },
      ],
      connections: [{ fromLine: 8, toLine: 2, color: 'emerald', label: 'new Node(10)', type: 'creates' }],
    },
    {
      title: 'Link two nodes',
      semanticEvent: 'WriteProperty',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

const a = new Node(10)
console.log(a.value)

const b = new Node(20)

a.next = b
console.log(a.next.value)`,
      explanation: [
        '`a.next = b` establishes the **pointer relationship**: `a`\'s `next` field now holds a reference to `b`. The chain `a(10) → b(20) → null` is formed by a single assignment. `a.next.value` reads through the pointer — follows `next` to `b`, then reads `b.value`. This assignment is the fundamental linking operation from which all list construction is built.',
        'CS — `a.next = b` does not copy `b` — it stores a reference. Both `b` (the variable) and `a.next` (the field) point to the same heap object. If you mutate `b.value = 99`, then `a.next.value` would also be `99`. This aliasing is fundamental to how linked structures work — nodes reference each other, they do not copy each other.',
        'SE — Following `a.next.value` is the traversal primitive that all list operations are built from. A loop that keeps following `.next` until `null` is the traversal algorithm. Every linked list operation — search, insert, delete — is built on this single primitive: "if not null, follow the pointer."',
        'Without this: if `a.next` remained `null`, the chain would not exist. `a.next.value` would throw `TypeError: Cannot read properties of null (reading \'value\')`. This is the most common linked list bug: following a `next` pointer without checking for `null` first. Always guard with `if (node.next)` before accessing `.next.value`.',
      ],
      active: [
        { startLine: 11, endLine: 11, color: 'violet',  label: 'second node' },
        { startLine: 13, endLine: 14, color: 'emerald', label: 'a.next = b — linked!' },
      ],
      connections: [{ fromLine: 13, toLine: 4, color: 'emerald', label: 'next → b', type: 'writes' }],
    },
    {
      title: 'LinkedList — head and size',
      semanticEvent: 'DefineClass',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }
}

const a = new Node(10)
console.log(a.value)

const b = new Node(20)

a.next = b
console.log(a.next.value)

const list = new LinkedList()
console.log(list.size)`,
      explanation: [
        '`LinkedList` establishes the **list-as-abstraction**: `head` is the single entry point to the entire chain (or `null` if empty), and `size` caches the element count so callers don\'t need to traverse to count. Every operation on the list starts from `head` — it is the only handle. `size` provides `O(1)` length access at the cost of keeping it accurate on every mutation.',
        'CS — `head` is the invariant of the linked list abstraction. All operations that modify the list must keep `head` correct: inserting at the front replaces `head`, deleting the head replaces `head` with `head.next`. `size` is a cached count — without it, counting elements requires an `O(n)` traversal. Caching `size` makes `.length` checks `O(1)` at the cost of maintaining it on every mutation.',
        'SE — JavaScript\'s built-in `Array` uses a flat memory block with a length counter. A linked list uses heap-allocated nodes with a head pointer. The trade-off: arrays are `O(1)` random access, `O(n)` insert-at-front; linked lists are `O(1)` insert-at-front, `O(n)` random access. Choose based on which operation is in the critical path.',
        'Without this: without `head`, there is no way to start a traversal. Without `size`, operations that need the count require `O(n)` traversal every time. Caching `size` is a classic space-time trade-off — one extra field saves repeated traversals.',
      ],
      active: [
        { startLine: 8,  endLine: 12, color: 'violet',  label: 'LinkedList — head is the door' },
        { startLine: 23, endLine: 24, color: 'emerald', label: 'empty list created' },
      ],
      connections: [{ fromLine: 23, toLine: 9, color: 'emerald', label: 'new LinkedList()', type: 'creates' }],
    },
    {
      title: 'append() — head is null branch',
      semanticEvent: 'DefineFunction',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }
}

const a = new Node(10)
console.log(a.value)

const b = new Node(20)

a.next = b
console.log(a.next.value)

const list = new LinkedList()
console.log(list.size)

list.append(10)
console.log(list.size)`,
      explanation: [
        '`append()` defines **two paths for insertion**: the empty-list branch (head is null → set head directly, no traversal needed) and the non-empty branch (walk to tail and link). The first `append(10)` takes the empty branch — `this.head = node`, `size++`, return. After this call, `head` points to `Node(10)` and `size` is `1`.',
        'CS — The two-branch structure in `append` is necessary because an empty list has no tail to walk to. `if (!this.head)` detects the empty case and handles it without entering the while loop. The while loop on line 18 walks `cur.next` until `null` — if `head` were `null`, `cur = this.head` would set `cur` to `null` and `cur.next` would throw immediately.',
        'SE — The empty-list guard is the first thing you check when debugging a linked list implementation. If `append` on an empty list crashes, this guard is missing or wrong. If `append` on a non-empty list crashes, the while loop or `cur.next = node` has a bug. These two failure modes point to exactly one of two code locations.',
        'Without this: without the `if (!this.head)` guard, `let cur = this.head` would assign `null` to `cur`. The next line `while (cur.next)` would throw `TypeError: Cannot read properties of null (reading \'next\')`. The guard is not optional — it is the invariant check that every linked list mutation must perform before touching `head`.',
      ],
      active: [
        { startLine: 34, endLine: 35, color: 'emerald', label: 'first append — head was null' },
        { startLine: 15, endLine: 16, color: 'violet',  label: 'head = node — empty list branch' },
        { startLine: 2,  endLine: 5,  color: 'indigo',  label: 'Node(10) created' },
      ],
      connections: [
        { fromLine: 34, toLine: 14, color: 'emerald', label: 'enters append', type: 'calls' },
        { fromLine: 15, toLine: 2,  color: 'indigo',  label: 'new Node()', type: 'creates' },
      ],
    },
    {
      title: 'append(20) — walk to tail and link',
      semanticEvent: 'CallFunction',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }
}

const a = new Node(10)
console.log(a.value)

const b = new Node(20)

a.next = b
console.log(a.next.value)

const list = new LinkedList()
console.log(list.size)

list.append(10)
console.log(list.size)

list.append(20)
console.log(list.size)`,
      explanation: [
        '`append(20)` takes the **non-empty path**: `head` is not null, so the while loop begins at `Node(10)`. `Node(10).next` is null — loop exits after zero iterations. `cur.next = Node(20)` links the new node. `size` becomes `2`. The chain is now `head → Node(10) → Node(20) → null`. For a one-element list, the tail-walk costs zero iterations.',
        'CS — The while loop on line 18 walks to the tail: it keeps advancing `cur` as long as `cur.next` is not `null`. For a one-element list, the loop runs zero times — `Node(10).next` is already `null`, so the condition is immediately false. For an `n`-element list, the loop runs `n - 1` times. `append` is `O(n)` — this is the main cost of a singly linked list without a tail pointer.',
        'SE — The `O(n)` tail walk is why production linked list implementations cache a `tail` pointer alongside `head`. With a `tail` pointer, `append` is `O(1)`: `tail.next = node; tail = node`. This is how Node.js streams and queue implementations handle it — `head` for dequeue, `tail` for enqueue, both `O(1)`.',
        'Without this: if `size++` on line 20 were missing, `list.size` would remain `1` after two appends. The node would be correctly linked but the count would be wrong. Any loop that iterates `list.size` times would miss elements. The `size` counter must be incremented on every append path — both branches.',
      ],
      active: [
        { startLine: 37, endLine: 38, color: 'emerald', label: 'second append' },
        { startLine: 17, endLine: 20, color: 'violet',  label: 'walk to tail, link Node(20)' },
      ],
      connections: [
        { fromLine: 37, toLine: 14, color: 'emerald', label: 'enters append', type: 'calls' },
        { fromLine: 19, toLine: 4,  color: 'violet',  label: 'cur.next = Node(20)', type: 'writes' },
      ],
    },
    {
      title: 'append(30) — walks two hops',
      semanticEvent: 'CallFunction',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }
}

const a = new Node(10)
console.log(a.value)

const b = new Node(20)

a.next = b
console.log(a.next.value)

const list = new LinkedList()
console.log(list.size)

list.append(10)
console.log(list.size)

list.append(20)
console.log(list.size)

list.append(30)
console.log(list.size)`,
      explanation: [
        '`append(30)` reveals the **O(n) tail-walk cost**: the while loop must traverse `Node(10) → Node(20)` — two hops — before reaching the tail and linking `Node(30)`. `size` becomes `3`. Each additional `append` adds one more hop. This is the defining cost of singly-linked-list append without a cached tail pointer.',
        'CS — The while loop iterated once: from `Node(10)` to `Node(20)`. For an `n`-element list, `append` always walks `n - 1` hops to reach the tail. This is the defining performance characteristic of singly linked list append: `O(n)`. The walk is necessary because the only way to reach the tail is to follow pointers from `head`.',
        'SE — This `O(n)` append is acceptable when the list is small or when appending is rare. It becomes a bottleneck in production queues where append happens on every message. The fix — adding a `tail` pointer — is a one-field change to the `LinkedList` class that changes append from `O(n)` to `O(1)`. This is a common data structures interview question.',
        'Without this: a missing `size++` here would give `list.size = 2` after three appends — a silent bug. The list would have the correct nodes but the wrong count. Any code that iterates exactly `list.size` times would miss the last element. Always increment `size` on every append path — both the head branch (line 16) and the tail branch (line 20).',
      ],
      active: [
        { startLine: 40, endLine: 41, color: 'emerald', label: 'third append — two hops' },
        { startLine: 18, endLine: 18, color: 'violet',  label: 'while: walks 10→20→stop' },
        { startLine: 19, endLine: 19, color: 'violet',  label: 'links Node(30) to tail' },
      ],
      connections: [{ fromLine: 40, toLine: 14, color: 'emerald', label: 'enters append', type: 'calls' }],
    },
    {
      title: 'toArray — follow the chain',
      semanticEvent: 'DefineFunction',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  append(value) {
    const node = new Node(value)
    if (!this.head) { this.head = node; this.size++; return }
    let cur = this.head
    while (cur.next) cur = cur.next
    cur.next = node
    this.size++
  }

  toArray() {
    const out = []; let cur = this.head
    while (cur) { out.push(cur.value); cur = cur.next }
    return out
  }
}

const a = new Node(10)
console.log(a.value)

const b = new Node(20)

a.next = b
console.log(a.next.value)

const list = new LinkedList()
console.log(list.size)

list.append(10)
console.log(list.size)

list.append(20)
console.log(list.size)

list.append(30)
console.log(list.size)

console.log(list.toArray())
console.log(list.size)`,
      explanation: [
        '`toArray()` establishes the **traversal pattern**: start at `head`, loop while `cur` is truthy, push `cur.value`, advance `cur = cur.next`. When `cur` becomes `null` (past the last node) the loop exits. The collected values `[10, 20, 30]` are the list in order. This `while (cur)` loop is the fundamental linked-list traversal algorithm.',
        'CS — The `while (cur)` condition is the traversal sentinel. When `cur` is a non-null object it is truthy — loop continues. When `cur` is `null` (past the last node) it is falsy — loop exits. This pattern is the canonical linked list traversal. Every linked list operation that reads the chain uses this exact loop structure.',
        'SE — `toArray()` is the bridge between a linked list and the rest of JavaScript, which expects arrays. Serialisation (JSON), spread (`[...list]`), and array methods (`map`, `filter`) all require arrays. In production, linked lists are internal data structures; the public API often exposes an iterator or `toArray()` method to interoperate with the rest of the ecosystem.',
        'Without this: `return out` outside the while loop means `out` is fully populated before returning. If `return out` were inside the loop (`while (cur) { out.push(cur.value); return out }`), the function would return `[10]` on the first iteration and never process the remaining nodes. Traversal and collection must complete before returning.',
      ],
      active: [
        { startLine: 23, endLine: 26, color: 'violet',  label: 'toArray — follow next pointers' },
        { startLine: 51, endLine: 52, color: 'emerald', label: 'result: [10, 20, 30], size: 3' },
      ],
      connections: [{ fromLine: 51, toLine: 23, color: 'emerald', label: 'enters toArray', type: 'calls' }],
    },
  ],
}
