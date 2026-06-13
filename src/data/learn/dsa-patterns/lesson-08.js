// DSA + Design Patterns — Lesson 08
// Fast/Slow Pointers + Iterator

export const lesson = {
  id: 'dsa-patterns-08',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '8. Fast/Slow Pointers + Iterator',
  checkpoints: [
    { id: 'cp-pointers', label: 'Fast/Slow Pointers' },
    { id: 'cp-iterator', label: 'Iterator Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'A linked list should be a chain with an end. But what if the last node\'s next reference does not point to null — it points back to an earlier node? You now have a cycle. Traversal never terminates. A while(node !== null) loop spins forever. You cannot simply check "have I been here before?" without O(n) extra memory for a visited set. There is an algorithm that detects cycles, finds the middle of a list, and finds the start of a cycle — all with O(1) extra memory, using only two references that move through the list at different speeds. And separately, there is a design pattern that solves a different but structurally similar problem: how do you traverse any collection — array, linked list, tree, file — without the traversal logic leaking into the collection itself or into the code that uses it? Both problems involve two independent cursors moving through a structure, and that structural similarity is not a coincidence.',
      code: null,
    },

    // ── Step 1: Building a cyclic list (the problem) ──────────────────────────

    {
      type: 'narration',
      id: 'step1-cycle',
      text: 'First, build a linked list and deliberately create a cycle so you can see the problem. A node\'s next reference pointing back to an earlier node creates a loop in what should be a chain. Traversal with a simple loop will spin forever. This is not a contrived problem — corrupt data, circular references in graphs, and certain data structures like circular buffers intentionally form cycles.',
      code: `class Node {
  constructor(value) {
    this.value = value
    this.next  = null
  }
}

// Build a list: 1 → 2 → 3 → 4 → 5 → (back to 3)
const n1 = new Node(1), n2 = new Node(2), n3 = new Node(3)
const n4 = new Node(4), n5 = new Node(5)

n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n5
n5.next = n3   // ← cycle: last node points back to node 3

// A naive loop would run forever:
// let cur = n1
// while (cur !== null) { ... }  // cur never becomes null — infinite loop

// Safe traversal with a limit:
let cur = n1
let steps = 0
while (cur !== null && steps < 10) {
  console.log(cur.value)
  cur = cur.next
  steps++
}
console.log('stopped at step', steps, '— would loop forever without limit')`,
    },

    // ── Step 2: Floyd's cycle detection ──────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-floyds',
      text: 'Floyd\'s cycle detection algorithm uses two references — called slow and fast — that move through the list at different speeds. Slow advances one node per step: slow = slow.next. Fast advances two nodes per step: fast = fast.next.next. If there is no cycle, fast reaches null and the traversal ends cleanly. If there is a cycle, fast will lap slow — it will eventually land on the same node as slow, because they are both running around the same loop and fast is gaining one node per step. When slow === fast, a cycle is confirmed. O(n) time to detect — at most one full loop. O(1) extra space — only two additional references, regardless of list size.',
      code: `function hasCycle(head) {
  let slow = head
  let fast = head

  while (fast !== null && fast.next !== null) {
    slow = slow.next          // advance one step
    fast = fast.next.next     // advance two steps
    if (slow === fast) return true   // met — cycle confirmed
  }

  return false   // fast reached null — no cycle
}

// Build lists
function makeList(values) {
  const nodes = values.map(v => new Node(v))
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1]
  return nodes[0]
}

class Node { constructor(v) { this.value = v; this.next = null } }

const linear  = makeList([1, 2, 3, 4, 5])   // no cycle
const cyclic  = makeList([1, 2, 3, 4, 5])

// Create cycle in cyclic list: 5 → 3
let tail = cyclic; while (tail.next !== null) tail = tail.next
let third = cyclic; third = third.next.next   // node 3
tail.next = third

console.log('linear has cycle:', hasCycle(linear))   // false
console.log('cyclic has cycle:', hasCycle(cyclic))   // true`,
    },

    // ── Step 3: Finding the middle ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-middle',
      text: 'The fast/slow technique also finds the middle of a list in one pass without knowing the list length. When fast reaches the end, slow is at the middle — because slow has moved half as many steps as fast. For an odd-length list, slow lands exactly on the middle node. For even-length, slow lands on the second of the two middle nodes. This is O(n) time and O(1) space — one pass, two references.',
      code: `function findMiddle(head) {
  let slow = head
  let fast = head

  while (fast !== null && fast.next !== null) {
    slow = slow.next          // one step
    fast = fast.next.next     // two steps
  }
  // When fast reaches the end, slow is at the middle
  return slow
}

class Node { constructor(v) { this.value = v; this.next = null } }
function makeList(vals) {
  const ns = vals.map(v => new Node(v))
  for (let i = 0; i < ns.length - 1; i++) ns[i].next = ns[i+1]
  return ns[0]
}

const odd  = makeList([1, 2, 3, 4, 5])   // middle is 3
const even = makeList([1, 2, 3, 4])       // middle is 3 (second of two middle nodes)

console.log(findMiddle(odd).value)    // 3
console.log(findMiddle(even).value)   // 3`,
    },

    // ── Challenge: fast/slow pointers ─────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-pointers',
      text: 'Write a function called findCycleStart(head) that, given a linked list with a cycle, returns the value of the node where the cycle begins — the node that has two incoming references. Use Floyd\'s algorithm: first detect the cycle with fast/slow pointers. Once fast === slow (cycle detected), reset slow to head. Advance both slow and fast one step at a time. When they meet again, that node is the cycle start. Test with a list 1→2→3→4→5 where 5 points back to 3. The cycle starts at node 3 (value 3). Log the start node\'s value.',
      expectedOutput: null,
      startCode: `class Node { constructor(v) { this.value = v; this.next = null } }

function findCycleStart(head) {
  let slow = head, fast = head

  // Phase 1: detect cycle
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) break
  }

  if (fast === null || fast.next === null) return null  // no cycle

  // Phase 2: find start
  // reset slow to head, advance both one step at a time
  // when slow === fast, that is the cycle start
  slow = head
  while (slow !== fast) {
    // advance both one step
  }
  return slow.value
}

// Build 1→2→3→4→5, with 5.next = node3
const nodes = [1,2,3,4,5].map(v => new Node(v))
for (let i = 0; i < 4; i++) nodes[i].next = nodes[i+1]
nodes[4].next = nodes[2]   // cycle: 5 → node at index 2 (value 3)

console.log(findCycleStart(nodes[0]))  // 3`,
      hint: 'In Phase 2: slow = head; while (slow !== fast) { slow = slow.next; fast = fast.next; } then return slow.value',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(3)
      },
    },

    { type: 'checkpoint', id: 'cp-pointers' },

    // ── Step 4: Iterator pattern intro ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-iterator-intro',
      text: 'The Iterator pattern provides a standard way to traverse a collection — one element at a time — without exposing the internal structure of the collection. The iterator object maintains its own cursor: a reference to the current position in the traversal. Calling next() advances the cursor and returns the next value. Calling hasNext() checks whether more elements remain. The collection does not change. The iterator is a separate object that tracks position. This matters because: the same collection can have multiple independent iterators at the same time, each at a different position. A for-of loop in JavaScript uses this exact mechanism — it calls the iterator\'s next() method repeatedly until hasNext() is false.',
      code: null,
    },

    // ── Step 5: Iterator over an array ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-array-iterator',
      text: 'Build a simple iterator over an array. The iterator maintains an index — its cursor. next() returns the value at the current index and advances the cursor. hasNext() returns true if the index is still within bounds.',
      code: `class ArrayIterator {
  constructor(arr) {
    this.arr   = arr
    this.index = 0      // ← NEW: cursor — current position in the array
  }

  hasNext() {           // ← NEW
    return this.index < this.arr.length
  }

  next() {              // ← NEW: return current value, advance cursor
    if (!this.hasNext()) throw new Error('No more elements')
    return this.arr[this.index++]
  }
}

const it = new ArrayIterator([10, 20, 30, 40])

while (it.hasNext()) {
  console.log(it.next())
}
// 10, 20, 30, 40

// Two independent iterators over the same array
const a = new ArrayIterator([1, 2, 3])
const b = new ArrayIterator([1, 2, 3])

a.next()   // a is now at index 1
console.log('a:', a.next())   // 2 — a's cursor, independent of b
console.log('b:', b.next())   // 1 — b's cursor starts at 0`,
    },

    // ── Step 6: Iterator over a linked list ───────────────────────────────────

    {
      type: 'narration',
      id: 'step6-list-iterator',
      text: 'Now build an iterator over a linked list. Instead of an integer index, the cursor is a node reference — the current node. next() returns the current node\'s value and advances the cursor to next. The collection\'s internal structure (the node chain) is hidden from the caller entirely.',
      code: `class Node { constructor(v) { this.value = v; this.next = null } }

class LinkedListIterator {
  constructor(head) {
    this.current = head   // ← NEW: cursor is a node reference, not an index
  }

  hasNext() { return this.current !== null }

  next() {
    if (!this.hasNext()) throw new Error('No more elements')
    const value     = this.current.value
    this.current    = this.current.next   // advance cursor to next node
    return value
  }
}

// Build a list: 1 → 2 → 3
const n1 = new Node(1), n2 = new Node(2), n3 = new Node(3)
n1.next = n2; n2.next = n3

const it = new LinkedListIterator(n1)
while (it.hasNext()) {
  console.log(it.next())
}
// 1, 2, 3`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-meeting',
      text: 'This is where the two ideas meet. Floyd\'s algorithm uses two independent cursors — slow and fast — traversing the same linked list at different speeds. Each cursor is independently positioned in the list at any moment. The Iterator pattern is the formalization of exactly this concept: a cursor object that tracks an independent position in a collection. When you create two iterators over the same linked list, you have two cursors — each moving independently, each holding a current node reference. Floyd\'s slow and fast are two unnamed iterators. The Iterator pattern is Floyd\'s algorithm made general and named. Two independent cursors, one traversal abstracted from the collection: the same idea, one from algorithms and one from design patterns.',
      code: null,
    },

    // ── Challenge: Iterator ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-iterator',
      text: 'Write a class called RangeIterator that iterates over integers from start (inclusive) to end (exclusive), stepping by step. Constructor takes (start, end, step). hasNext() returns true if current position has not yet reached end. next() returns the current value and advances by step. Do not use an array — generate values on demand. Test: iterate RangeIterator(0, 10, 2) — should produce 0, 2, 4, 6, 8. Log each value. Then log RangeIterator(1, 4, 1).next() three times — should produce 1, 2, 3.',
      expectedOutput: null,
      startCode: `class RangeIterator {
  constructor(start, end, step) {
    this.current = start
    this.end     = end
    this.step    = step
  }

  hasNext() {
    // return true if current < end
  }

  next() {
    // return current value, then advance current by step
  }
}

const range = new RangeIterator(0, 10, 2)
while (range.hasNext()) {
  console.log(range.next())   // 0, 2, 4, 6, 8
}

const ones = new RangeIterator(1, 4, 1)
console.log(ones.next())   // 1
console.log(ones.next())   // 2
console.log(ones.next())   // 3`,
      hint: 'hasNext(): return this.current < this.end. next(): const v = this.current; this.current += this.step; return v',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(0) && nums.includes(8) && nums.includes(1) && nums.includes(3)
      },
    },

    { type: 'checkpoint', id: 'cp-iterator' },

    // ── Step 8: Combined ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'Build a PeekingIterator — an iterator that wraps another iterator and adds a peek() method. peek() returns the next value without consuming it. This is a real utility used in parsers and stream processors. Internally, it uses two cursors: the underlying iterator\'s cursor, and a "buffered" value that has been peeked but not yet returned from next(). The fast/slow pointer analogy: one cursor is one step ahead of the other.',
      code: `class ArrayIterator {
  constructor(arr) { this.arr = arr; this.index = 0 }
  hasNext() { return this.index < this.arr.length }
  next()    { return this.arr[this.index++] }
}

class PeekingIterator {
  constructor(iterator) {
    this.iter    = iterator
    this.peeked  = null      // buffered value — fetched but not yet returned
    this.hasPeek = false     // whether peeked holds a real value
  }

  peek() {
    if (!this.hasPeek) {
      this.peeked  = this.iter.next()  // fetch ahead — like fast pointer
      this.hasPeek = true
    }
    return this.peeked
  }

  next() {
    if (this.hasPeek) {
      const val    = this.peeked       // return the buffered value
      this.hasPeek = false
      this.peeked  = null
      return val
    }
    return this.iter.next()
  }

  hasNext() {
    return this.hasPeek || this.iter.hasNext()
  }
}

const it = new PeekingIterator(new ArrayIterator([1, 2, 3, 4]))

console.log(it.peek())    // 1 — peeked, not consumed
console.log(it.peek())    // 1 — same value, still not consumed
console.log(it.next())    // 1 — now consumed
console.log(it.next())    // 2
console.log(it.peek())    // 3
console.log(it.next())    // 3`,
    },

    // ── Challenge: combined ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Write a function called zip(iterA, iterB) that takes two iterators and returns an array of pairs [a, b] where a is from iterA and b is from iterB. Stop when either iterator is exhausted. Use only hasNext() and next() — do not access the underlying arrays directly. Test: zip(RangeIterator(1,4,1), RangeIterator(10,40,10)) should produce [[1,10],[2,20],[3,30]]. Log the length (3) and the second pair as "2,20".',
      expectedOutput: null,
      startCode: `class RangeIterator {
  constructor(s, e, st) { this.c = s; this.e = e; this.st = st }
  hasNext() { return this.c < this.e }
  next()    { const v = this.c; this.c += this.st; return v }
}

function zip(iterA, iterB) {
  const result = []
  while (iterA.hasNext() && iterB.hasNext()) {
    // push [iterA.next(), iterB.next()] to result
  }
  return result
}

const pairs = zip(
  new RangeIterator(1, 4, 1),
  new RangeIterator(10, 40, 10),
)

console.log(pairs.length)       // 3
console.log(pairs[1].join(',')) // '2,20'`,
      hint: 'result.push([iterA.next(), iterB.next()])',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs.includes('3') && strs.includes('2,20')
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through hasCycle(). Watch the slow and fast variables in the Variables panel. Slow moves one node per step: 1→2→3→4→5→3... Fast moves two: 1→3→5→4→3→5... They start at the same node. Watch the gap between them. At some step, they land on the same node — slow === fast — and the function returns true. Count the steps: a cycle of length 3 (nodes 3,4,5) means fast catches slow in at most 3 steps inside the cycle.',
      code: `class Node { constructor(v) { this.value = v; this.next = null } }

function hasCycle(head) {
  let slow = head, fast = head
  let step = 0
  while (fast !== null && fast.next !== null) {
    step++
    slow = slow.next
    fast = fast.next.next
    console.log('step', step, '— slow:', slow.value, 'fast:', fast.value)
    if (slow === fast) { console.log('cycle detected at step', step); return true }
  }
  return false
}

const nodes = [1,2,3,4,5].map(v => new Node(v))
for (let i = 0; i < 4; i++) nodes[i].next = nodes[i+1]
nodes[4].next = nodes[2]   // 5 → node3

console.log(hasCycle(nodes[0]))`,
    },

    {
      type: 'codelens',
      id: 'cl-fast-slow',
      text: `Step through each iteration. Watch slow and fast in the Variables panel.

Step 1: slow moves to node(2), fast moves to node(3). Not equal.
Step 2: slow moves to node(3), fast moves to node(5). Not equal.
Step 3: slow moves to node(4), fast moves to node(4). slow === fast — cycle detected.

Fast gained one node per step on slow inside the cycle (cycle length 3). It takes at most cycle_length steps to catch up. O(n) total.`,
      code: `class Node { constructor(v) { this.value = v; this.next = null } }
function hasCycle(head) {
  let slow = head, fast = head
  while (fast !== null && fast.next !== null) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
const ns = [1,2,3,4,5].map(v => new Node(v))
for (let i = 0; i < 4; i++) ns[i].next = ns[i+1]
ns[4].next = ns[2]
console.log(hasCycle(ns[0]))  // true`,
      lang: 'js',
    },

  ],
}
