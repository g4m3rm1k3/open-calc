// DSA + Design Patterns — Lesson 02
// Linked Lists and the Iterator Pattern

export const lesson = {
  id: 'dsa-patterns-02',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '2. Linked Lists and the Iterator Pattern',
  checkpoints: [
    { id: 'cp-nodes',    label: 'Nodes & Linking' },
    { id: 'cp-list',     label: 'Linked List' },
    { id: 'cp-iterator', label: 'Iterator Pattern' },
  ],
  segments: [

    // ── Why we need a linked list ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'In lesson 1 you saw that inserting into the middle of an array is O(n) — every item after the insertion point must move one slot right. For a task queue that processes hundreds of thousands of items, this cost matters. A Linked List solves it by giving up fast random access (you cannot jump to index 500 directly) in exchange for O(1) insertion and removal at any position you already have a reference to. The trade-off: arrays are fast to read, linked lists are fast to modify. The right choice depends on what you do more.',
      code: null,
    },

    // ── Step 1: The Node — the single unit ────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-node',
      text: 'Build a linked list one piece at a time, starting with the single unit: a Node. A node holds two things — a value, and a reference to the next node. The reference starts as null. Notice createNode is a Factory function (lesson 1) — it is the single source of truth for what a node looks like. In CodeLens, when you run this, watch the Variables panel: you will see "node" appear as an object with exactly two properties, value and next.',
      code: `// Step 1: A single node — the atomic unit of a linked list
function createNode(value) {
  return {
    value,
    next: null,   // will point to another node once linked
  }
}

const node = createNode('apple')
console.log('value:', node.value)
console.log('next:', node.next)    // null — not linked yet`,
    },

    // ── Step 2: Linking two nodes ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-linking',
      text: 'Link two nodes by setting next. This is all a linked list is: nodes that know where the next node lives. In memory, nodes do NOT have to be next to each other — each node can be anywhere in memory. The "link" is just an address stored in the next property. In CodeLens, step through this line by line. When you reach "nodeA.next = nodeB", watch nodeA in the Variables panel — its next property changes from null to a reference to nodeB.',
      code: `function createNode(value) {
  return { value, next: null }
}

// Step 2: link two nodes manually
const nodeA = createNode('apple')
const nodeB = createNode('banana')

nodeA.next = nodeB   // A now points to B
// nodeB.next is still null — end of the chain

console.log('A value:',      nodeA.value)
console.log('A.next value:', nodeA.next.value)  // follows the link to B
console.log('B.next:',       nodeB.next)        // null — chain ends here`,
    },

    // ── Step 3: Building and walking a chain ──────────────────────────────────

    {
      type: 'narration',
      id: 'step3-chain',
      text: 'Build a three-node chain and walk it with a while loop. The walk is the fundamental linked list operation: start at the head, follow next until you reach null. Every other operation — find, append, count — is a variation of this walk. In CodeLens, watch the "current" variable change with each iteration — it will show you the object it currently points to, and you will see it advance through the chain.',
      code: `function createNode(value) {
  return { value, next: null }
}

// Step 3: a three-node chain and the walk
const nodeA = createNode('apple')
const nodeB = createNode('banana')
const nodeC = createNode('cherry')

nodeA.next = nodeB
nodeB.next = nodeC
// nodeC.next stays null

// Walk: start at the head, follow next until null
let current = nodeA
while (current !== null) {
  console.log(current.value)
  current = current.next   // advance to the next node
}`,
    },

    {
      type: 'challenge',
      id: 'ch-nodes',
      text: 'Create three nodes with values 10, 20, 30. Link them in order. Walk the chain and log the sum of all values. Expected output: 60.',
      expectedOutput: '60',
      startCode: `function createNode(value) {
  return { value, next: null }
}

// create and link three nodes
// walk the chain and sum the values
// console.log(sum)`,
      hint: 'Create n1=10, n2=20, n3=30. Set n1.next=n2 and n2.next=n3. Then let sum=0; let c=n1; while(c!==null){ sum+=c.value; c=c.next } console.log(sum)',
      validate: ({ logs }) => logs.some(l => String(l).trim() === '60' || String(l).includes('60')),
    },

    { type: 'checkpoint', id: 'cp-nodes' },

    // ── Step 4: Encapsulate into a LinkedList ─────────────────────────────────

    {
      type: 'narration',
      id: 'step4-encapsulate',
      text: 'Managing nodes by hand would make your code chaotic. Wrap the chain in a LinkedList object that owns the head pointer and exposes clean operations. Callers never touch the nodes directly — they call the methods. This is encapsulation: hiding the internal structure (nodes and next pointers) behind a clean interface. If you later change how nodes are represented, none of the calling code breaks.',
      code: `function createNode(value) {
  return { value, next: null }
}

// Step 4: the LinkedList wrapper — encapsulates the node chain
function createLinkedList() {
  let head = null   // the first node; null means empty list

  return {
    // Is the list empty?
    isEmpty() {
      return head === null
    },

    // How many nodes?
    size() {
      let count = 0
      let current = head
      while (current !== null) { count++; current = current.next }
      return count
    },
  }
}

const list = createLinkedList()
console.log('Empty:', list.isEmpty())   // true
console.log('Size:', list.size())       // 0`,
    },

    // ── Step 5: prepend — O(1) ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-prepend',
      text: 'Add the prepend operation — adding to the front of the list. This is where linked lists shine: O(1) regardless of list size. The two-line operation: point the new node\'s next at the current head, then make the new node the new head. No items move. No memory reorganisation. In CodeLens watch this carefully: the Variables panel will show "head" update to the new node, and the new node\'s next will point to what used to be the head.',
      code: `function createNode(value) { return { value, next: null } }

function createLinkedList() {
  let head = null

  return {
    isEmpty() { return head === null },
    size() { let c=0,n=head; while(n){c++;n=n.next} return c },

    // Step 5: prepend — add to the FRONT — O(1)
    prepend(value) {
      const node = createNode(value)
      node.next = head   // new node points to what was the head
      head = node        // new node IS the head now
      // Two pointer assignments. That's it. O(1).
    },

    toArray() {
      const result = []; let n = head
      while (n) { result.push(n.value); n = n.next }
      return result
    },
  }
}

const list = createLinkedList()
list.prepend('cherry')
list.prepend('banana')   // becomes new head
list.prepend('apple')    // becomes new head

console.log(list.toArray())   // ['apple', 'banana', 'cherry']
console.log('Size:', list.size())`,
    },

    // ── Step 6: append — O(n) ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-append',
      text: 'Add the append operation — adding to the back. This requires walking the entire chain to find the last node, so it is O(n). You can make it O(1) by keeping a "tail" pointer alongside the head — the tail always knows the last node. We will add tail optimisation in lesson 3. For now, watch append walk the chain in CodeLens: you will see "current" advance through every node until it finds the one with next === null.',
      code: `function createNode(value) { return { value, next: null } }

function createLinkedList() {
  let head = null

  return {
    prepend(value) { const n=createNode(value); n.next=head; head=n },

    // Step 6: append — add to the BACK — O(n) without a tail pointer
    append(value) {
      const node = createNode(value)
      if (head === null) { head = node; return }   // empty list edge case

      // Walk to the last node
      let current = head
      while (current.next !== null) {
        current = current.next
      }
      current.next = node   // attach to the end
    },

    toArray() { const r=[]; let n=head; while(n){r.push(n.value);n=n.next} return r },
  }
}

const list = createLinkedList()
list.append('first')
list.append('second')
list.prepend('zero')   // O(1) — goes to front

console.log(list.toArray())   // ['zero', 'first', 'second']`,
    },

    // ── Step 7: removeFirst — O(1) ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-remove',
      text: 'Removing from the front is O(1) — the reason a linked list makes a better queue than an array. Simply advance the head pointer to the second node. The first node is no longer reachable and JavaScript will garbage collect it. Compare this to array shift() which moves every remaining item. In CodeLens, watch head change from pointing to the first node to pointing to the second — that is the entire operation.',
      code: `function createNode(value) { return { value, next: null } }

function createLinkedList() {
  let head = null

  return {
    prepend(v) { const n=createNode(v); n.next=head; head=n },
    append(v) { const n=createNode(v); if(!head){head=n;return} let c=head; while(c.next)c=c.next; c.next=n },

    // Step 7: removeFirst — O(1). This is why linked lists beat arrays for queues
    removeFirst() {
      if (head === null) return null
      const value = head.value
      head = head.next   // advance head — the old first node is gone
      return value
    },

    toArray() { const r=[]; let n=head; while(n){r.push(n.value);n=n.next} return r },
    size() { let c=0,n=head; while(n){c++;n=n.next} return c },
  }
}

const list = createLinkedList()
list.append('first')
list.append('second')
list.append('third')

const removed = list.removeFirst()   // O(1) — just moves the head pointer
console.log('Removed:', removed)
console.log('Remaining:', list.toArray())
console.log('Size:', list.size())`,
    },

    {
      type: 'challenge',
      id: 'ch-list',
      text: 'Using the linked list from step 7, build a queue: append three items ("red", "green", "blue"), then removeFirst twice. Log the remaining array. Expected: [\'blue\'].',
      expectedOutput: null,
      startCode: `function createNode(value) { return { value, next: null } }
function createLinkedList() {
  let head = null
  return {
    append(v) { const n=createNode(v); if(!head){head=n;return} let c=head; while(c.next)c=c.next; c.next=n },
    removeFirst() { if(!head)return null; const v=head.value; head=head.next; return v },
    toArray() { const r=[]; let n=head; while(n){r.push(n.value);n=n.next} return r },
  }
}

const queue = createLinkedList()
// append red, green, blue
// removeFirst twice
console.log(queue.toArray())`,
      hint: 'queue.append("red"); queue.append("green"); queue.append("blue"); queue.removeFirst(); queue.removeFirst();',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('blue') && !flat.includes('red') && !flat.includes('green')
      },
    },

    { type: 'checkpoint', id: 'cp-list' },

    // ── Step 8: The Iterator Pattern ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-iterator-problem',
      text: 'Right now the only way for external code to visit every item is toArray() — which creates a full copy of the list just to look at the values. There is a deeper problem: if someone writes code that depends on knowing the list has a "head" property, they are reaching inside the object\'s internals. If you ever rename "head" to "first", their code breaks. The Iterator pattern solves this by providing a standard "give me the next item" contract — callers never touch the internals.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step8-iterator-contract',
      text: 'JavaScript has a built-in iterator protocol. If an object has a [Symbol.iterator]() method that returns an object with a next() function, that object works with for...of, the spread operator (...), Array.from(), and destructuring. Every JavaScript built-in collection (Array, Map, Set, String) implements this exact protocol. Your linked list will join that family.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step8-iterator-code',
      text: 'Add [Symbol.iterator]() to the linked list. The method returns an object with a next() function. Each call to next() returns { value, done }. When done is true, iteration is finished. Notice that "current" is a local variable captured inside the iterator — each for...of loop gets its own independent cursor through the list. In CodeLens, watch "current" advance through the chain as the for...of loop runs.',
      code: `function createNode(value) { return { value, next: null } }

function createLinkedList() {
  let head = null

  return {
    prepend(v) { const n=createNode(v); n.next=head; head=n },
    append(v) { const n=createNode(v); if(!head){head=n;return} let c=head; while(c.next)c=c.next; c.next=n },
    removeFirst() { if(!head)return null; const v=head.value; head=head.next; return v },
    size() { let c=0,n=head; while(n){c++;n=n.next} return c },

    // Step 8: Iterator protocol — the contract between collection and caller
    [Symbol.iterator]() {
      let current = head          // each iteration gets its own cursor
      return {
        next() {
          if (current === null) {
            return { value: undefined, done: true }
          }
          const value = current.value
          current = current.next  // advance cursor
          return { value, done: false }
        }
      }
    }
  }
}

const list = createLinkedList()
list.append(10)
list.append(20)
list.append(30)

// for...of works because of [Symbol.iterator]
for (const item of list) {
  console.log(item)
}

// Spread works too
const arr = [...list]
console.log(arr)

// Find the first value > 15
for (const item of list) {
  if (item > 15) { console.log('First > 15:', item); break }
}`,
    },

    {
      type: 'narration',
      id: 'step8-iterator-why',
      text: 'The Iterator pattern separates "how data is stored" from "how data is traversed." The linked list stores data using node pointers — that is its private implementation. The iterator exposes "give me the next item" — that is its public contract. Any code that uses the iterator is independent of the storage. If you later changed the linked list to use an internal array for small sizes and nodes for large ones, all for...of loops would continue working unchanged. Depend on interfaces, not implementations.',
      code: null,
    },

    {
      type: 'challenge',
      id: 'ch-iterator',
      text: 'Add the iterator to this linked list, then use for...of to build a new array containing only values greater than 5. Log the result. The list contains [3, 7, 1, 9, 4]. Expected: [7, 9].',
      expectedOutput: null,
      startCode: `function createNode(v) { return { value: v, next: null } }
function createLinkedList() {
  let head = null
  return {
    append(v) { const n=createNode(v); if(!head){head=n;return} let c=head; while(c.next)c=c.next; c.next=n },
    // Add [Symbol.iterator]() here
  }
}

const list = createLinkedList()
;[3,7,1,9,4].forEach(v => list.append(v))

const result = []
for (const item of list) {
  if (item > 5) result.push(item)
}
console.log(result)`,
      hint: 'Add: [Symbol.iterator]() { let c = head; return { next() { if(!c) return {done:true,value:undefined}; const v=c.value; c=c.next; return {value:v,done:false} } } }',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('7') && flat.includes('9') && !flat.includes('3') && !flat.includes('1') && !flat.includes('4')
      },
    },

    { type: 'checkpoint', id: 'cp-iterator' },

    // ── Complete file + CodeLens ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'complete-file',
      text: 'Here is the complete linked list with every piece assembled: the Node factory, the LinkedList with prepend O(1), append O(n), removeFirst O(1), size O(n), and the Iterator. Read through it as a whole to see how the pieces fit together before opening it in CodeLens.',
      code: `// The complete Linked List implementation
function createNode(value) {
  return { value, next: null }
}

function createLinkedList() {
  let head = null

  return {
    prepend(value) {
      const node = createNode(value)
      node.next = head
      head = node
    },

    append(value) {
      const node = createNode(value)
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

    size() {
      let count = 0
      let current = head
      while (current) { count++; current = current.next }
      return count
    },

    [Symbol.iterator]() {
      let current = head
      return {
        next() {
          if (!current) return { value: undefined, done: true }
          const value = current.value
          current = current.next
          return { value, done: false }
        }
      }
    }
  }
}

// Use it as a queue: O(1) removeFirst beats array.shift()
const queue = createLinkedList()
queue.append('first task')
queue.append('second task')
queue.prepend('urgent task')   // jumps to front

console.log('Queue size:', queue.size())

for (const item of queue) {
  console.log('-', item)
}

const processed = queue.removeFirst()
console.log('Processed:', processed)
console.log('Remaining:', queue.size())`,
    },

    {
      type: 'codelens',
      id: 'cl-linked-list',
      text: 'Open in CodeLens and step through the complete linked list. Watch the Variables panel: see "head" change with each prepend and append. Watch "current" walk the chain during append and during the for...of loop. See how removeFirst simply moves the head pointer forward without touching any other node. Every O(1) operation is two pointer assignments. Every O(n) operation is a walk from head to the end.',
      code: `function createNode(value) {
  return { value, next: null }
}

function createLinkedList() {
  let head = null

  return {
    prepend(value) {
      const node = createNode(value)
      node.next = head
      head = node
    },
    append(value) {
      const node = createNode(value)
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
          if (!current) return { value: undefined, done: true }
          const value = current.value
          current = current.next
          return { value, done: false }
        }
      }
    }
  }
}

const queue = createLinkedList()
queue.append('first task')
queue.append('second task')
queue.prepend('urgent task')

for (const item of queue) {
  console.log(item)
}

const done = queue.removeFirst()
console.log('Done:', done)`,
      lang: 'js',
    },

  ],
}
