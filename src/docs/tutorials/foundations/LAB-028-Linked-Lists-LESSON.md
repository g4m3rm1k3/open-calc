# FOUNDATIONS — LAB-028 — Linked Lists

**Series:** FOUNDATIONS — Part V: Data Structures
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A singly linked list with O(1) head insertion, O(n) traversal, and O(n) index access. A doubly linked list with O(1) tail insertion. A function that reverses a singly linked list in place. After this lab you will understand exactly why insertion is O(1) while access by index is O(n), and why JavaScript arrays (which are NOT linked lists) give O(1) access at the cost of O(n) insertion at the front.

---

## What You Need to Know First

**From LAB-024 (Arrays):** Array index access is O(1) because elements sit in contiguous memory — element i is at `base + i * elementSize`. Inserting at the front is O(n) because every element must shift right by one position.

**From LAB-027 (Stacks and Queues):** The `Stack` you built used an array internally. Linked lists are the alternative internal structure — and inserting at the head is their strength.

**From LAB-012 (Classes and Objects):** Nodes are objects. Each node is a class instance with properties pointing to the next node.

---

> **Quick Check — try to answer before reading:**
>
> 1. An array's index access is O(1). What memory property makes this possible?
> 2. Why is `Array.unshift(item)` O(n) but `Array.push(item)` is O(1)?
> 3. If you have a pointer to a node in the middle of a linked list, can you find the node before it in O(1)? Why or why not?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Node: One Element of the Chain

**The problem this step solves:** A linked list is not one contiguous block of memory. It is a chain of individual objects, each holding a value and a pointer to the next object. The first thing to build is the individual link.

**The code:**

```js
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;   // null means "end of chain"
  }
}
```

**The walkthrough:**

`new Node(42)` creates `{ value: 42, next: null }`. The `next` property is `null` because a freshly created node is not yet connected to anything. When you link two nodes together, `node1.next = node2` makes `node1.next` point to the object `node2` — not a copy, the actual object. This is a reference, exactly like the heap references you saw in the CodeLens heap viewer.

**The CS lens — pointer:** `node.next` is a pointer — a reference to another object in memory. Pointers are how linked structures differ from arrays. An array indexes into contiguous memory by arithmetic. A linked list follows pointers, one at a time, from node to node.

**The SE lens — single responsibility:** `Node` has one job: hold one value and know the next node. It does not know the size of the list, does not know the previous node, and does not perform any traversal. Keeping it minimal makes it reusable in both singly and doubly linked lists.

**What breaks without it:** Without the `next` pointer, each node would be isolated — you would have a bag of disconnected objects with no way to traverse them as a sequence.

---

### Step 2 — Singly Linked List with O(1) Head Insertion

**The problem this step solves:** Maintain a sequence where insertion at the front (head) is O(1), regardless of how many elements are already in the list.

**The code:**

```js
class LinkedList {
  #head = null;
  #size = 0;

  // O(1) — no elements shift, only two pointer assignments
  insertAtHead(value) {
    const newNode = new Node(value);
    newNode.next = this.#head;   // new node points to old head
    this.#head = newNode;        // list now starts at new node
    this.#size++;
    return this;
  }

  get size() { return this.#size; }
  get isEmpty() { return this.#size === 0; }

  // O(n) — must walk the chain to print
  print() {
    const values = [];
    let currentNode = this.#head;
    while (currentNode !== null) {
      values.push(currentNode.value);
      currentNode = currentNode.next;
    }
    console.log(values.join(' → ') + ' → null');
  }
}
```

**The walkthrough — insertAtHead:**

Start: `head = null`, size = 0.

`insertAtHead(10)`:
1. Create `nodeA = { value: 10, next: null }`.
2. `nodeA.next = this.#head` — `nodeA.next = null` (head was null).
3. `this.#head = nodeA` — head now points to nodeA.
List: `nodeA(10) → null`. Size: 1.

`insertAtHead(20)`:
1. Create `nodeB = { value: 20, next: null }`.
2. `nodeB.next = this.#head` — `nodeB.next = nodeA`. nodeB is now linked to nodeA.
3. `this.#head = nodeB` — head now points to nodeB.
List: `nodeB(20) → nodeA(10) → null`. Size: 2.

`insertAtHead(30)`:
List: `nodeC(30) → nodeB(20) → nodeA(10) → null`. Size: 3.

Notice: no existing nodes moved. Only two pointer assignments regardless of list size. That is why head insertion is O(1).

**The walkthrough — print:**

`currentNode = head` (nodeC, value 30).
Loop: push 30, `currentNode = nodeC.next` (nodeB).
Loop: push 20, `currentNode = nodeB.next` (nodeA).
Loop: push 10, `currentNode = nodeA.next` (null).
`null` exits the while loop. Output: `30 → 20 → 10 → null`.

**The CS lens — O(1) insertion:** Array `unshift` is O(n) because every existing element shifts right. Linked list `insertAtHead` is O(1) because no elements move — only two pointers change: the new node's `next` and `this.#head`. The cost is constant regardless of n.

**The SE lens — access modifier:** `#head` and `#size` use JavaScript's private field syntax (`#`). External code cannot access or corrupt the list's internal state directly. All interaction goes through the methods. This is the encapsulation principle from LAB-013 — the invariant "size always reflects the actual count of nodes" is enforced by the class.

**What breaks without it:** Without `newNode.next = this.#head` before `this.#head = newNode`, the old head would become unreachable — a memory leak (in environments with manual memory management) or a silent data loss.

**Try it:**

```js
const list = new LinkedList();
list.insertAtHead(10).insertAtHead(20).insertAtHead(30);
list.print();   // 30 → 20 → 10 → null
console.log(list.size);   // 3
```

---

### Step 3 — O(n) Access by Index

**The problem this step solves:** Retrieve the element at position i. There is no arithmetic shortcut — you must follow the chain one node at a time.

**The code:**

```js
// Add to LinkedList class:
getAt(index) {
  if (index < 0 || index >= this.#size) {
    throw new RangeError(`Index ${index} is out of bounds (size ${this.#size})`);
  }
  let currentNode = this.#head;
  for (let stepCount = 0; stepCount < index; stepCount++) {
    currentNode = currentNode.next;
  }
  return currentNode.value;
}
```

**The walkthrough:**

List: `30 → 20 → 10 → null`. Size: 3.

`getAt(0)`: zero steps. `currentNode` stays at head (30). Returns 30.
`getAt(1)`: one step. `currentNode = head.next` (node 20). Returns 20.
`getAt(2)`: two steps. `currentNode = head.next.next` (node 10). Returns 10.
`getAt(3)`: throws `RangeError` — index equals size, which is out of bounds.

**The CS lens — O(n) access:** There is no formula to compute the address of index i because nodes are scattered in memory at arbitrary addresses. The only way to reach index i is to walk the chain from the head, following `next` pointers i times. This makes access O(n) — proportional to the index, which in the worst case is proportional to n.

**The array/list tradeoff — stated precisely:**

| Operation | Array | Linked List |
|---|---|---|
| Access by index | O(1) | O(n) |
| Insert at head | O(n) | O(1) |
| Insert at tail | O(1) amortized | O(n) or O(1) with tail pointer |
| Search by value | O(n) | O(n) |

The right choice depends on your access pattern. Linked lists win when you insert at the head far more often than you access by index. Arrays win when random access dominates.

---

### Step 4 — Tail Insertion and the Tail Pointer

**The problem this step solves:** Inserting at the tail without a tail pointer requires walking the entire list to find the last node — O(n). With a tail pointer, it is O(1).

**The code:**

```js
class DoublyLinkedList {
  #head = null;
  #tail = null;
  #size = 0;

  insertAtTail(value) {
    const newNode = { value, next: null, prev: null };
    if (this.#tail === null) {
      // Empty list: both head and tail point to the single node
      this.#head = newNode;
      this.#tail = newNode;
    } else {
      newNode.prev = this.#tail;      // new node points back
      this.#tail.next = newNode;     // old tail points forward
      this.#tail = newNode;          // tail advances
    }
    this.#size++;
    return this;
  }

  insertAtHead(value) {
    const newNode = { value, next: null, prev: null };
    if (this.#head === null) {
      this.#head = newNode;
      this.#tail = newNode;
    } else {
      newNode.next = this.#head;
      this.#head.prev = newNode;
      this.#head = newNode;
    }
    this.#size++;
    return this;
  }

  get size() { return this.#size; }
}
```

**The walkthrough — insertAtTail:**

Start: `head = null, tail = null`.

`insertAtTail('A')`:
- `newNode = { value: 'A', next: null, prev: null }`.
- Tail is null → both head and tail point to newNode.
- List: `head → A ← tail`.

`insertAtTail('B')`:
- `newNode = { value: 'B', next: null, prev: null }`.
- `newNode.prev = tail` → B's prev points to A.
- `tail.next = newNode` → A's next points to B.
- `tail = newNode` → tail advances to B.
- List: `head → A ⇄ B ← tail`.

**The CS lens — doubly linked list:** Each node has both `next` and `prev` pointers. This makes backward traversal O(n) without walking from the head, and makes deletion of a known node O(1) because you can relink both neighbors without searching for the predecessor. The cost is two pointers per node instead of one.

**The SE lens — tail pointer invariant:** The tail pointer introduces an invariant: `this.#tail` always refers to the last node (or null for an empty list). Every insertion method must maintain this invariant. The private field prevents external code from breaking it by accident.

---

### Step 5 — Reverse a Singly Linked List In Place

**The problem this step solves:** Given a singly linked list, produce the reversed list without allocating any new nodes — by relinking existing nodes.

**The code:**

```js
// Add to LinkedList class:
reverse() {
  let previousNode = null;
  let currentNode = this.#head;

  while (currentNode !== null) {
    const nextNode = currentNode.next;  // save next before overwriting
    currentNode.next = previousNode;   // reverse the pointer
    previousNode = currentNode;        // advance previous
    currentNode = nextNode;            // advance current
  }

  this.#head = previousNode;  // previous now points to old tail = new head
  return this;
}
```

**The walkthrough:**

Before: `30 → 20 → 10 → null`. Head = 30.

**Iteration 1:** currentNode = 30.
- `nextNode = 20` (save).
- `30.next = null` (previousNode was null).
- `previousNode = 30`.
- `currentNode = 20`.

**Iteration 2:** currentNode = 20.
- `nextNode = 10` (save).
- `20.next = 30` (reverse).
- `previousNode = 20`.
- `currentNode = 10`.

**Iteration 3:** currentNode = 10.
- `nextNode = null` (save — was end of list).
- `10.next = 20` (reverse).
- `previousNode = 10`.
- `currentNode = null`.

Loop exits. `this.#head = previousNode = 10`.

After: `10 → 20 → 30 → null`. Head = 10. ✓

**The CS lens — in-place algorithm:** "In place" means O(1) extra space. No new array, no new nodes. The three pointers (`previousNode`, `currentNode`, `nextNode`) are the only extra memory. The linked list is reversed by relinking existing nodes. The same principle applies to in-place sorting algorithms.

**The SE lens — the save-before-overwrite pattern:** `const nextNode = currentNode.next` saves the forward reference before `currentNode.next = previousNode` destroys it. This pattern appears whenever you mutate a pointer that you still need to follow. Missing this line would cause the traversal to lose its place in the chain.

**Try it:**

```js
const list = new LinkedList();
list.insertAtHead(10).insertAtHead(20).insertAtHead(30);
list.print();    // 30 → 20 → 10 → null
list.reverse();
list.print();    // 10 → 20 → 30 → null
```

---

## Connect the Pieces

You now have two different data structures for storing sequences: arrays (LAB-024) and linked lists. The choice between them is a performance decision based on access pattern:

- **Stacks** (LAB-027) can be backed by either — arrays are simpler and cache-friendly.
- **Queues** — the two-stack trick (LAB-027) avoids O(n) shifting; a doubly linked list with head and tail pointers gives O(1) both ends natively.
- **The JavaScript DOM** is a linked tree — each DOM node has `parentNode`, `firstChild`, `lastChild`, `nextSibling`, `previousSibling`. These are the same pointer structure as a doubly linked list, extended into two dimensions.
- **Python's `collections.deque`** is a doubly linked list of fixed-size blocks — O(1) at both ends, O(n) access by index.
- **Memory allocators** use free lists — linked lists of available memory blocks — because insertion and deletion from the middle are O(1) when you already have a pointer to the node.

---

## What Breaks Without This

**What happens without the `nextNode` save in reverse:**

```js
// BUG: next pointer overwritten before saving
while (currentNode !== null) {
  currentNode.next = previousNode;   // next is now destroyed
  previousNode = currentNode;
  currentNode = currentNode.next;    // currentNode.next is previousNode — loops back!
}
```

The list becomes an infinite loop of two nodes pointing at each other. `print()` will hang the browser tab. This is why the save step exists: mutating state you still need to read requires saving the old value first.

---

## Definition of Done

Run each check before moving on:

- [ ] `insertAtHead` on an empty list produces a list of size 1
- [ ] `insertAtHead` three times produces a list in reverse insertion order
- [ ] `getAt(0)` returns the head value
- [ ] `getAt(size)` throws a `RangeError`
- [ ] `reverse()` correctly reverses a list of 1, 2, and 3 elements
- [ ] `DoublyLinkedList.insertAtTail` three times produces the correct forward order

**Git commit:**

```
git add src/
git commit -m "LAB-028: linked list with O(1) head insertion, O(n) access, and in-place reversal — nodes-as-pointers establishes the reference model that backs the DOM tree"
```

---

## Quick Check Answers

1. **Contiguous memory:** Array elements are stored at addresses `base`, `base+stride`, `base+2*stride`... Element i is at `base + i * stride` — one multiplication, no traversal required.
2. **unshift shifts:** Inserting at index 0 requires every existing element to move right by one position — O(n) write operations. `push` adds to the end where no other element needs to move — O(1).
3. **No.** A singly linked list has only forward pointers. To find the node before a given node, you must start from the head and walk until `currentNode.next === targetNode` — O(n). This is why doubly linked lists exist.
