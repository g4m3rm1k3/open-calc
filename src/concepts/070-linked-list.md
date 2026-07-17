---
concept: 070-linked-list
name: Linked List
---

## Definition

A linked list is a sequence of nodes where each node holds a value and a
reference (pointer) to the next node — rather than storing elements
contiguously in memory the way an array does.

## Problem

Inserting into the front or middle of an array requires shifting every
following element over — O(n) — because array elements must stay contiguous
in memory (see the Array concept). A linked list breaks that constraint:
since nodes are only connected by pointers, inserting a new node just means
rewiring a couple of pointers, regardless of how long the list already is.

## Execution

Start: head → Node(1) → Node(2) → Node(3) → null
↓
prepend(0): create Node(0), set Node(0).next = head, then set head = Node(0)
↓
head → Node(0) → Node(1) → Node(2) → Node(3) → null — O(1), just 2 pointer writes, no shifting
↓
To read the 3rd value (2): start at head, follow .next twice — Node(0) → Node(1) → Node(2)
↓
Reading requires walking node by node from the head — O(n) — there's no
direct "jump to index i" the way an array's contiguous memory allows

## Computer Science

The fundamental trade-off against an array is prepend/insert cost versus
access cost — a linked list's node-and-pointer structure makes prepending
O(1) (rewire 2 pointers) but makes indexed access O(n) (walk from the
head), while an array is the exact opposite: O(1) indexed access via direct
address arithmetic, but O(n) prepend since every element must shift.

Tags: Pointers, Nodes, Sequential access, Array

## Software Engineering

Linked lists are the right choice specifically when insertions or deletions
at the front (or in the middle, given a reference to the node) dominate, and
indexed/random access is rare — implementing a stack, a queue, or an undo
history. When indexed access ("give me the 500th element") is common, an
array is almost always the better choice, since that access is O(1) there
and O(n) here.

Tags: Insertion cost, Random access, Data structure selection, Doubly linked lists

## Common Mistakes

- Using a linked list when indexed/random access is the common operation — every index-style access costs O(n) here versus O(1) for a real array, silently making the whole program slower than expected.
- Losing a node's `next` pointer before saving it elsewhere during a rewire (an insert or delete) — this orphans the rest of the list, a very common off-by-one-pointer bug.

## Exercises

- Implement `append` (add to the END of the list) and compare its cost to `prepend` — why is `append` O(n) here unless a separate "tail" pointer is also tracked?
- Trace by hand what happens to the pointers when deleting the middle node (value 1) from `head → Node(0) → Node(1) → Node(2) → null`.

## javascript

```javascript
class ListNode {
  constructor(value) { this.value = value; this.next = null }
}

class LinkedList {
  #head = null
  prepend(value) {
    const node = new ListNode(value)
    node.next = this.#head
    this.#head = node
  }
  toArray() {
    const result = []
    let current = this.#head
    while (current) { result.push(current.value); current = current.next }
    return result
  }
}

const list = new LinkedList()
list.prepend(3)
list.prepend(2)
list.prepend(1)
console.log(list.toArray())   // [1, 2, 3] — each prepend became the new head
```
Walkthrough: each `prepend` call creates a new node, points its `.next` at
whatever the current head was, then makes it the new head — two pointer
writes, regardless of how long the list already is. `toArray` walks the list
from `head` one `.next` link at a time to read every value — this walk is
what makes indexed access O(n) instead of O(1).

## python

```python
class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None


class LinkedList:
    def __init__(self):
        self._head = None

    def prepend(self, value):
        node = ListNode(value)
        node.next = self._head
        self._head = node

    def to_list(self):
        result = []
        current = self._head
        while current:
            result.append(current.value)
            current = current.next
        return result


lst = LinkedList()
lst.prepend(3)
lst.prepend(2)
lst.prepend(1)
print(lst.to_list())   # [1, 2, 3] -- each prepend became the new head
```
Walkthrough: identical node-and-pointer mechanics to the JavaScript version —
`prepend` is two pointer writes regardless of list length, and `to_list` has
to walk the chain one `.next` link at a time, exactly the O(n) traversal the
Execution section traces.
