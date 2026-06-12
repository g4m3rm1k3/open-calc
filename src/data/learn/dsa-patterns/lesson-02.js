// DSA + Design Patterns — Lesson 02
// Linked Lists and the Iterator Pattern

export const lesson = {
  id: 'dsa-02',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '2. Linked Lists and the Iterator Pattern',
  checkpoints: [
    { id: 'cp-nodes',    label: 'Nodes & Links' },
    { id: 'cp-list',     label: 'Linked List' },
    { id: 'cp-iterator', label: 'Iterator Pattern' },
  ],
  segments: [

    // ── The problem arrays have ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'array-problem',
      text: 'In lesson 1 you saw that inserting into or removing from the middle of an array is O(n) — slow for large data. Here is why: an array is a contiguous block of memory. The computer finds element at index 5 by jumping directly to (start_address + 5 × element_size). That is what makes reading fast. But inserting at position 3 means every element from position 3 onward must physically move one slot to the right to make room. For 1 million elements, that is 1 million memory writes for a single insertion. A Linked List solves this problem by trading away fast random access to gain fast insertion and deletion anywhere.',
      code: null,
    },

    {
      type: 'narration',
      id: 'array-vs-linked',
      text: 'Before building a linked list, understand the trade-off precisely. Arrays: read by index O(1), insert/delete middle O(n), memory contiguous. Linked Lists: read by index O(n) — you must walk from the start, insert/delete at a known position O(1) — just relink two pointers, memory scattered. Neither is "better" — each is the right tool for different problems. A linked list shines when you need frequent insertions and deletions but rarely need to access items by position.',
      code: null,
    },

    // ── The Node ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'node-intro',
      text: 'A linked list is made of nodes. Each node holds two things: a value, and a reference (pointer) to the next node. The last node points to null — that is how you know you have reached the end. This structure is self-referential: a Node contains a reference to another Node. It sounds circular, but it is not — the chain terminates at null. Think of it like a treasure hunt: each clue tells you the answer AND gives you the location of the next clue. The last clue says "you have reached the end."',
      code: `// The Node — the single unit of a linked list
// Each node knows its value and the location of the next node
function createNode(value) {
  return {
    value,
    next: null,   // will point to the next node once linked
  }
}

const nodeA = createNode('apple')
const nodeB = createNode('banana')
const nodeC = createNode('cherry')

// Link them manually: A → B → C → null
nodeA.next = nodeB
nodeB.next = nodeC
// nodeC.next is already null

// Walk the chain
let current = nodeA
while (current !== null) {
  console.log(current.value)
  current = current.next
}`,
    },

    {
      type: 'narration',
      id: 'node-factory',
      text: 'Notice that createNode is a Factory function — it creates a consistently-shaped object every time. From lesson 1: a factory is the single source of truth for an object\'s shape. If you ever need to add a property to every node (for example, a timestamp), you change createNode in one place and every node in your program gets it. You are already combining patterns and data structures, and we have only just started.',
      code: null,
    },

    {
      type: 'challenge',
      id: 'ch-nodes',
      text: 'Create three nodes with values 10, 20, 30. Link them in order. Then walk the chain and log the sum of all values. Expected output: 60.',
      expectedOutput: '60',
      startCode: `function createNode(value) {
  return { value, next: null }
}

// Create nodes for 10, 20, 30
// Link them
// Walk and sum

console.log(sum)`,
      hint: 'Create each node, set first.next = second, second.next = third. Then loop with while(current !== null) and add current.value to a running sum.',
      validate: ({ logs }) => logs.some(l => l === '60' || l.includes('60')),
    },

    {
      type: 'checkpoint',
      id: 'cp-nodes',
    },

    // ── Building the LinkedList ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'list-intro',
      text: 'Three nodes linked by hand is a linked list. But managing that manually in real code would be chaos. We need an object that owns the chain and provides operations: add to front, add to back, remove from front, find a value. This is the LinkedList class — a wrapper around the node chain that exposes clean operations and hides the pointer manipulation. Hiding implementation details behind a clean interface is called encapsulation — one of the most important ideas in software engineering.',
      code: null,
    },

    {
      type: 'narration',
      id: 'list-code',
      text: 'Here is a complete LinkedList. Read it slowly — every method is a pointer operation. The key insight in prepend: to add to the front, create a new node, point its next to the current head, then make the new node the new head. Two pointer assignments and the operation is done — O(1) regardless of list size.',
      code: `function createNode(value) {
  return { value, next: null }
}

function createLinkedList() {
  let head = null   // first node in the chain
  let size = 0

  return {
    // Add to front — O(1)
    prepend(value) {
      const node = createNode(value)
      node.next = head   // new node points to old head
      head = node        // new node becomes the head
      size++
    },

    // Add to back — O(n): must walk to the end
    append(value) {
      const node = createNode(value)
      if (!head) { head = node; size++; return }
      let current = head
      while (current.next) current = current.next
      current.next = node
      size++
    },

    // Remove from front — O(1)
    removeFirst() {
      if (!head) return null
      const value = head.value
      head = head.next   // head advances one step
      size--
      return value
    },

    getSize() { return size },

    toArray() {
      const result = []
      let current = head
      while (current) { result.push(current.value); current = current.next }
      return result
    }
  }
}

const list = createLinkedList()
list.append('banana')
list.prepend('apple')   // faster than append!
list.append('cherry')

console.log(list.toArray())   // ['apple', 'banana', 'cherry']
console.log('Size:', list.getSize())

list.removeFirst()
console.log(list.toArray())   // ['banana', 'cherry']`,
    },

    {
      type: 'challenge',
      id: 'ch-list',
      text: 'Using the createLinkedList factory above, build a queue (first in, first out). Enqueue three items by appending to the back. Then dequeue twice by removing from the front. Log the remaining list as an array. Expected: [\'three\']',
      expectedOutput: null,
      startCode: `function createNode(value) { return { value, next: null } }

function createLinkedList() {
  let head = null, size = 0
  return {
    prepend(value) { const n = createNode(value); n.next = head; head = n; size++ },
    append(value) { const n = createNode(value); if (!head) { head = n; size++; return } let c = head; while (c.next) c = c.next; c.next = n; size++ },
    removeFirst() { if (!head) return null; const v = head.value; head = head.next; size--; return v },
    toArray() { const r = []; let c = head; while (c) { r.push(c.value); c = c.next } return r }
  }
}

const queue = createLinkedList()
// append 'one', 'two', 'three'
// removeFirst twice
console.log(queue.toArray())`,
      hint: 'queue.append adds to the back (end of the line). queue.removeFirst removes from the front (first served).',
      validate: ({ logs }) => logs.some(l => l.includes('three') && !l.includes('one') && !l.includes('two')),
    },

    {
      type: 'checkpoint',
      id: 'cp-list',
    },

    // ── The Iterator Pattern ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'iterator-problem',
      text: 'Right now, the only way to visit every item in the linked list is toArray() — but that creates a full copy of the list just to look at the values. There is a bigger problem: if someone else uses your linked list, they need to know it has a head property and write their own while loop. They are reaching inside the object and using its internal structure. That breaks encapsulation: if you ever change "head" to "first" internally, every caller who wrote that while loop breaks. The Iterator pattern solves this.',
      code: null,
    },

    {
      type: 'narration',
      id: 'iterator-concept',
      text: 'The Iterator pattern provides a standard way to step through a collection without exposing how the collection stores its data. The caller just calls next() repeatedly. They never touch the internal "head" pointer. They do not know or care that it is a linked list — it could be an array, a tree, a database query. The iterator is the contract between the collection and anyone who wants to traverse it. JavaScript has a built-in iterator protocol using Symbol.iterator — which is exactly what makes for...of loops work.',
      code: null,
    },

    {
      type: 'narration',
      id: 'iterator-code',
      text: 'Here is the full iterator added to the linked list. The [Symbol.iterator]() method returns an object with a next() function. Each call to next() returns { value, done }. When done is true, the iteration is finished. Once this method exists, the linked list works with for...of, the spread operator, Array.from(), and destructuring — all the JavaScript syntax that works with any iterable.',
      code: `function createNode(value) { return { value, next: null } }

function createLinkedList() {
  let head = null

  return {
    prepend(v) { const n = createNode(v); n.next = head; head = n },
    append(v)  { const n = createNode(v); if (!head) { head = n; return } let c = head; while (c.next) c = c.next; c.next = n },

    // Iterator protocol — this is what makes for...of work
    [Symbol.iterator]() {
      let current = head        // captured once at the start of iteration
      return {
        next() {
          if (current === null) return { value: undefined, done: true }
          const value = current.value
          current = current.next  // advance one step
          return { value, done: false }
        }
      }
    }
  }
}

const list = createLinkedList()
list.append('first')
list.append('second')
list.append('third')

// for...of works because of [Symbol.iterator]
for (const item of list) {
  console.log(item)
}

// So does spread
const arr = [...list]
console.log(arr)

// And Array.from
const arr2 = Array.from(list)
console.log('Length:', arr2.length)`,
    },

    {
      type: 'narration',
      id: 'iterator-power',
      text: 'The Iterator pattern separates "how data is stored" from "how data is traversed." The linked list stores data using node pointers — that is an implementation detail. The iterator exposes "give me the next item" — that is the interface. Any code that uses the iterator is independent of the storage mechanism. If you later replaced the linked list with a different structure internally, all code that uses the iterator would continue to work unchanged. This is one of the most important ideas in software design: depend on interfaces, not implementations.',
      code: null,
    },

    {
      type: 'challenge',
      id: 'ch-iterator',
      text: 'Add an iterator to the linked list below, then use it with for...of to find and log the first value greater than 10. Expected output: 15',
      expectedOutput: '15',
      startCode: `function createNode(v) { return { value: v, next: null } }
function createLinkedList() {
  let head = null
  return {
    append(v) { const n = createNode(v); if (!head) { head = n; return } let c = head; while (c.next) c = c.next; c.next = n },
    // Add [Symbol.iterator]() here
  }
}

const list = createLinkedList()
list.append(5)
list.append(15)
list.append(25)

for (const item of list) {
  if (item > 10) { console.log(item); break }
}`,
      hint: 'Add [Symbol.iterator]() { let current = head; return { next() { if (!current) return { done: true }; const v = current.value; current = current.next; return { value: v, done: false } } } }',
      validate: ({ logs }) => logs.some(l => l === '15' || l.includes('15')),
    },

    {
      type: 'checkpoint',
      id: 'cp-iterator',
    },

    // ── What you built and where it goes ──────────────────────────────────────

    {
      type: 'narration',
      id: 'summary',
      text: 'In this lesson you built a linked list from nodes, implemented O(1) prepend and remove from front, and added an iterator that makes the list work with all of JavaScript\'s built-in iteration syntax. The linked list is the foundation of the stack and queue you will build in lesson 3. The iterator you built here is the same pattern used in JavaScript\'s built-in Map, Set, and Array — when you write for (const item of someMap.values()), a [Symbol.iterator] exactly like yours is running under the hood.',
      code: null,
    },

    // ── CodeLens invite ────────────────────────────────────────────────────────

    {
      type: 'codelens',
      id: 'cl-linked-list',
      code: `function createNode(value) {
  return { value, next: null }
}

function createLinkedList() {
  let head = null

  return {
    prepend(v) {
      const node = createNode(v)
      node.next = head
      head = node
    },
    append(v) {
      const node = createNode(v)
      if (!head) { head = node; return }
      let current = head
      while (current.next) current = current.next
      current.next = node
    },
    removeFirst() {
      if (!head) return null
      const value = head.value
      head = head.next
      return value
    },
    [Symbol.iterator]() {
      let current = head
      return {
        next() {
          if (!current) return { done: true, value: undefined }
          const value = current.value
          current = current.next
          return { value, done: false }
        }
      }
    }
  }
}

const list = createLinkedList()
list.append(10)
list.append(20)
list.prepend(5)

for (const item of list) {
  console.log(item)
}

const removed = list.removeFirst()
console.log('Removed:', removed)`,
      lang: 'js',
    },

  ],
}
