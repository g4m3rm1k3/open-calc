export default {
  id: 'doubly-linked-list',
  title: 'Doubly Linked List',
  tag: 'Data Structure',
  steps: [
    {
      title: 'Node — value, next, and prev',
      semanticEvent: 'DefineClass',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.next  = null
    this.prev  = null
  }
}

const a = new Node(10)
const b = new Node(20)
a.next = b
b.prev = a
console.log(a.value)
console.log(a.next.value)
console.log(b.prev.value)`,
      explanation: [
        '`Node` adds a third field — `prev` — alongside `next`, establishing **bidirectional linking**. `a.next = b` connects forward; `b.prev = a` connects backward. The chain `a ↔ b` can now be traversed in either direction. This second pointer is the only structural difference between a singly and doubly linked list — but it unlocks `O(1)` deletion and backward traversal.',
        'CS — A singly-linked list (`next` only) supports forward traversal in `O(n)` and forward deletion in `O(1)` (given the node). A doubly-linked list adds backward traversal and backward deletion — but each node uses twice the pointer memory. The trade-off is flexibility vs. memory. Doubly linked lists are preferred when you need: delete-at-cursor, traverse in both directions, or implement a deque (push/pop at both ends).',
        'SE — JavaScript\'s `Map` iteration order is preserved via a doubly-linked list internally (in V8). The LRU (Least Recently Used) cache is a hash map + doubly linked list: the map provides `O(1)` lookup; the list tracks access order. Accessing a key moves its node to the head in `O(1)` (via `prev`/`next` manipulation) — without the `prev` pointer, moving a node requires scanning from the head.',
        'Without this: without `prev`, deleting a node requires knowing the previous node to relink — which means scanning from the head: `O(n)`. With `prev`, deletion is `O(1)`: `node.prev.next = node.next; node.next.prev = node.prev`. The `prev` pointer is the `O(1)` backward-link that enables efficient insertion and deletion at any position.',
      ],
      active: [
        { startLine: 1,  endLine: 7,  color: 'indigo',  label: 'Node — value + next (forward) + prev (backward)' },
        { startLine: 11, endLine: 15, color: 'emerald', label: 'a↔b linked; a.next=20, b.prev=10' },
      ],
      connections: [
        { fromLine: 11, toLine: 4,  color: 'violet', label: 'a.next → b (forward)', type: 'writes' },
        { fromLine: 12, toLine: 5,  color: 'indigo', label: 'b.prev → a (backward)', type: 'writes' },
      ],
    },
    {
      title: 'DoublyLinkedList class — head, tail, size',
      semanticEvent: 'DefineClass',
      code:
`class Node {
  constructor(value) {
    this.value = value; this.next = null; this.prev = null
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null
    this.tail = null
    this.size = 0
  }

  pushBack(value) {
    const node = new Node(value)
    if (this.tail === null) {
      this.head = this.tail = node
    } else {
      node.prev  = this.tail
      this.tail.next = node
      this.tail  = node
    }
    this.size++
    return this
  }
}

const list = new DoublyLinkedList()
list.pushBack(10).pushBack(20).pushBack(30)
console.log(list.head.value)
console.log(list.tail.value)
console.log(list.size)
console.log(list.head.next.value)
console.log(list.tail.prev.value)`,
      explanation: [
        '`DoublyLinkedList` adds a **`tail` pointer** alongside `head`, enabling `O(1)` appends: `pushBack` links the new node backward to the current tail (`node.prev = this.tail`), links the current tail forward (`this.tail.next = node`), then advances the tail pointer. No traversal needed. After three pushes, `head.value = 10`, `tail.value = 30`, and `head.next.value = tail.prev.value = 20`.',
        'CS — Maintaining `head` and `tail` pointers makes both `pushFront` and `pushBack` `O(1)` — no traversal needed. `head.prev` and `tail.next` are always `null` (sentinels). The invariant: for any node `n` that is not the last, `n.next.prev === n`. For any node that is not the first, `n.prev.next === n`. This bidirectional consistency must hold after every mutation.',
        'SE — A doubly-linked list where all four operations (pushFront, pushBack, popFront, popBack) are `O(1)` is a deque (double-ended queue). Python\'s `collections.deque` is implemented as a doubly linked list of fixed-size blocks. JavaScript\'s `Map` and `Set` maintain insertion order via a doubly-linked list of entries. The browser\'s History API maintains a doubly-linked list of navigation entries.',
        'Without this: without tracking both `head` and `tail`, `pushBack` would need to traverse from head to find the last node — `O(n)`. A "naive" linked list without a tail pointer costs `O(n)` for every append. The tail pointer is the constant-time shortcut to the end.',
      ],
      active: [
        { startLine: 7,  endLine: 12, color: 'indigo',  label: 'DoublyLinkedList — head, tail, size' },
        { startLine: 14, endLine: 24, color: 'violet',  label: 'pushBack — append and link bidirectionally' },
        { startLine: 28, endLine: 34, color: 'emerald', label: 'head=10, tail=30, size=3, head.next=20, tail.prev=20' },
      ],
      connections: [
        { fromLine: 19, toLine: 3,  color: 'violet', label: 'node.prev = old tail (backward link)', type: 'writes' },
        { fromLine: 20, toLine: 3,  color: 'indigo', label: 'old tail.next = node (forward link)', type: 'writes' },
      ],
    },
    {
      title: 'pushFront() and traversal',
      semanticEvent: 'DefineFunction',
      code:
`class Node {
  constructor(value) { this.value = value; this.next = null; this.prev = null }
}

class DoublyLinkedList {
  constructor() { this.head = null; this.tail = null; this.size = 0 }

  pushBack(value) {
    const node = new Node(value)
    if (!this.tail) { this.head = this.tail = node }
    else { node.prev = this.tail; this.tail.next = node; this.tail = node }
    this.size++; return this
  }

  pushFront(value) {
    const node = new Node(value)
    if (!this.head) { this.head = this.tail = node }
    else { node.next = this.head; this.head.prev = node; this.head = node }
    this.size++; return this
  }

  toArray() {
    const result = []
    let cur = this.head
    while (cur !== null) { result.push(cur.value); cur = cur.next }
    return result
  }

  toArrayReverse() {
    const result = []
    let cur = this.tail
    while (cur !== null) { result.push(cur.value); cur = cur.prev }
    return result
  }
}

const list = new DoublyLinkedList()
list.pushBack(10).pushBack(20).pushBack(30)
console.log(list.head.value)
console.log(list.tail.value)
console.log(list.size)

list.pushFront(5).pushFront(1)
console.log(list.toArray())
console.log(list.toArrayReverse())`,
      explanation: [
        '`pushFront` prepends by **linking the new node to the current head in both directions**: `node.next = this.head` (forward), `this.head.prev = node` (backward), then advance `this.head = node`. `toArrayReverse()` traverses using `prev` from `tail` instead of `next` from `head` — the same loop pattern, opposite direction. Both forward and reverse traversals are `O(n)` with no reversal cost.',
        'CS — `toArray` traverses forward (head → tail via `next`). `toArrayReverse` traverses backward (tail → head via `prev`). Both are `O(n)`. The doubly-linked list is the only linear structure that supports `O(n)` traversal in BOTH directions without reversing. A singly-linked list reversed traversal requires `O(n)` time to reverse first, then `O(n)` to traverse — `O(n)` total but with `O(n)` extra space or an in-place reverse.',
        'SE — Text editors use doubly-linked lists for cursor operations: `Ctrl+Left`/`Ctrl+Right` traverses word boundaries forward or backward. A `rope` data structure (B-tree of doubly-linked character buffers) powers VS Code\'s text model — `prev`/`next` pointers enable efficient insertion and deletion at the cursor position. Browser `contenteditable` uses a similar model for caret movement.',
        'Without this: without `pushFront`, adding to the front of a singly-linked list requires creating a new head and pointing it at the old head — `O(1)`, but backward traversal to the new head is impossible without the `prev` chain. `pushFront` is identical in complexity to `pushBack` when both `head` and `tail` pointers are maintained.',
      ],
      active: [
        { startLine: 15, endLine: 19, color: 'violet',  label: 'pushFront — prepend and link bidirectionally' },
        { startLine: 22, endLine: 33, color: 'indigo',  label: 'toArray (forward) and toArrayReverse (backward)' },
        { startLine: 42, endLine: 45, color: 'emerald', label: 'list 1→5→10→20→30; reverse 30→20→10→5→1' },
      ],
      connections: [{ fromLine: 17, toLine: 2, color: 'violet', label: 'node.next = old head; head.prev = node', type: 'writes' }],
    },
    {
      title: 'popFront() and popBack() — O(1) removal from both ends',
      semanticEvent: 'DefineFunction',
      code:
`class Node {
  constructor(value) { this.value = value; this.next = null; this.prev = null }
}

class DoublyLinkedList {
  constructor() { this.head = null; this.tail = null; this.size = 0 }

  pushBack(value) {
    const node = new Node(value)
    if (!this.tail) { this.head = this.tail = node }
    else { node.prev = this.tail; this.tail.next = node; this.tail = node }
    this.size++; return this
  }

  pushFront(value) {
    const node = new Node(value)
    if (!this.head) { this.head = this.tail = node }
    else { node.next = this.head; this.head.prev = node; this.head = node }
    this.size++; return this
  }

  toArray() {
    const r = []; let c = this.head; while (c) { r.push(c.value); c = c.next } return r
  }

  popFront() {
    if (!this.head) return undefined
    const val = this.head.value
    this.head = this.head.next
    if (this.head) this.head.prev = null
    else this.tail = null
    this.size--
    return val
  }

  popBack() {
    if (!this.tail) return undefined
    const val = this.tail.value
    this.tail = this.tail.prev
    if (this.tail) this.tail.next = null
    else this.head = null
    this.size--
    return val
  }
}

const list = new DoublyLinkedList()
list.pushBack(10).pushBack(20).pushBack(30)
list.pushFront(5).pushFront(1)
console.log(list.toArray())

console.log(list.popFront())
console.log(list.popBack())
console.log(list.toArray())
console.log(list.size)`,
      explanation: [
        '`popFront` and `popBack` complete the **deque interface**: both are `O(1)` because `head` and `tail` give direct access to either end. `popFront` advances `head` to `head.next` and nulls out the new head\'s `prev`. `popBack` retreats `tail` to `tail.prev` and nulls out the new tail\'s `next`. Edge case: if the list becomes empty, both `head` and `tail` are set to `null`.',
        'CS — A doubly-linked list with `O(1)` pushFront, pushBack, popFront, popBack is a deque — a double-ended queue. This is the most general sequential structure: it can simulate a stack (`pushBack/popBack`), a queue (`pushBack/popFront`), or a deque (all four). The `prev` pointer is what makes `popBack` and `pushFront` `O(1)` — without it, both require traversal.',
        'SE — LRU cache implementation: hash map for `O(1)` key lookup + doubly-linked list for `O(1)` access-order tracking. On cache hit: remove node from current position (`O(1)` via `prev`/`next`), move to head (`O(1)` pushFront). On cache miss: insert at head; if at capacity, popBack to evict the least-recently-used. This exact structure is the basis of `lru-cache` on npm (used by webpack, jest, and most build tools).',
        'Without this: a queue implemented with a singly-linked list and only a head pointer requires `O(n)` to dequeue from the back (scan to find the second-to-last node). The doubly-linked list\'s `prev` makes popBack `O(1)` — the tail already knows its predecessor. The `prev` pointer is the structural enabler of all `O(1)` back-operations.',
      ],
      active: [
        { startLine: 25, endLine: 33, color: 'violet',  label: 'popFront — O(1): advance head, null prev' },
        { startLine: 35, endLine: 43, color: 'indigo',  label: 'popBack — O(1): retreat tail, null next' },
        { startLine: 51, endLine: 54, color: 'emerald', label: 'popped 1 (front), 30 (back) → [5,10,20], size=3' },
      ],
      connections: [],
    },
    {
      title: 'deleteNode() — O(1) deletion at any position',
      semanticEvent: 'DefineFunction',
      code:
`class Node {
  constructor(value) { this.value = value; this.next = null; this.prev = null }
}

class DoublyLinkedList {
  constructor() { this.head = null; this.tail = null; this.size = 0 }

  pushBack(value) {
    const node = new Node(value)
    if (!this.tail) { this.head = this.tail = node }
    else { node.prev = this.tail; this.tail.next = node; this.tail = node }
    this.size++; return this
  }

  pushFront(value) {
    const node = new Node(value)
    if (!this.head) { this.head = this.tail = node }
    else { node.next = this.head; this.head.prev = node; this.head = node }
    this.size++; return this
  }

  popFront() {
    if (!this.head) return undefined
    const v = this.head.value; this.head = this.head.next
    if (this.head) this.head.prev = null; else this.tail = null
    this.size--; return v
  }

  popBack() {
    if (!this.tail) return undefined
    const v = this.tail.value; this.tail = this.tail.prev
    if (this.tail) this.tail.next = null; else this.head = null
    this.size--; return v
  }

  toArray() { const r=[]; let c=this.head; while(c){r.push(c.value);c=c.next} return r }

  deleteNode(node) {
    if (node.prev) node.prev.next = node.next
    else           this.head = node.next
    if (node.next) node.next.prev = node.prev
    else           this.tail = node.prev
    node.next = null; node.prev = null
    this.size--
  }
}

const list = new DoublyLinkedList()
list.pushBack(10).pushBack(20).pushBack(30).pushBack(40).pushBack(50)
console.log(list.toArray())

const midNode = list.head.next.next
console.log(midNode.value)
list.deleteNode(midNode)
console.log(list.toArray())
console.log(list.size)`,
      explanation: [
        '`deleteNode(node)` achieves **`O(1)` deletion at any position** using the `prev` pointer: `node.prev.next = node.next` bypasses the node going forward; `node.next.prev = node.prev` bypasses it going backward. No traversal from `head` is needed — the node already knows both its neighbours. The middle node `30` is removed and the chain relinks around it in four pointer assignments.',
        'CS — `O(1)` deletion at any position is the killer feature of the doubly-linked list. A singly-linked list needs the PREVIOUS node to delete — found only by scanning from the head: `O(n)`. With `prev`, the node already has its predecessor. No scan needed. The four-pointer rewiring (`prev.next`, `next.prev`, clear `node.next`, clear `node.prev`) is the complete deletion algorithm.',
        'SE — LRU cache uses `deleteNode` to move accessed nodes: look up the node via the hash map `O(1)`, call `deleteNode(node)` `O(1)`, then `pushFront(node)` `O(1)`. Total: `O(1)` access-order update. Without `deleteNode` being `O(1)`, the LRU cache degrades. The doubly-linked list is the LRU\'s secret weapon. `node-lru-cache` (used in webpack) implements exactly this.',
        'Without this: without `prev`, deleting "node with value 30" from a singly-linked list requires starting at head (10) and scanning: 10→20→found predecessor 20, relink 20.next to 40. That\'s `O(n)`. The `prev` pointer collapses the scan to zero steps — the node already knows its predecessor. The `prev` pointer trades 8 bytes per node for the ability to delete in constant time.',
      ],
      active: [
        { startLine: 37, endLine: 44, color: 'violet',  label: 'deleteNode — O(1): relink prev and next, handle edges' },
        { startLine: 50, endLine: 54, color: 'emerald', label: 'remove middle node 30 → [10,20,40,50], size 4' },
      ],
      connections: [
        { fromLine: 38, toLine: 2,  color: 'violet', label: 'node.prev.next = node.next (skip forward)', type: 'writes' },
        { fromLine: 40, toLine: 2,  color: 'indigo', label: 'node.next.prev = node.prev (skip backward)', type: 'writes' },
      ],
    },
  ],
}
