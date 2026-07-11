---
series: dsa-python
level: 5
title: Linked Lists
lang: python
---

# Linked Lists

A linked list stores elements in nodes where each node holds a value and a pointer to
the next node. Unlike a Python list (a contiguous array), a linked list's nodes live
anywhere in memory. There is no index arithmetic — to reach node N you must follow N
pointers from the head. Understanding linked lists teaches you how pointers, nodes, and
traversal work — the same primitives that power trees and graphs.

## Nodes and Traversal

A node is an object with two fields: `val` (the stored value) and `next` (a reference
to the next node, or `None` at the tail). A linked list is just a reference to its
head node. Every algorithm starts by setting a pointer to `head` and following `next`
until `None`.

```python
class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

# Build list: 1 -> 2 -> 3 -> None
head = Node(1, Node(2, Node(3)))

current = head
while current is not None:
    print(current.val)
    current = current.next
# 1
# 2
# 3
```

**CS lens:** Traversal is the fundamental linked list operation. Every other algorithm
— sum, search, reversal, cycle detection — is a traversal with a twist. The traversal
pattern (`current = head; while current: ...; current = current.next`) is the linked
list equivalent of `for i in range(n)` for arrays.

**SE lens:** The `Node` class is the minimal data structure: it represents a cell in
the list and nothing else. The linked list itself is represented by a bare reference
to the head node — there is no wrapper class. This is the lowest-level form of a
list abstraction, which is why understanding it transfers directly to understanding
tree nodes and graph adjacency lists.

Summing a linked list is a direct application of traversal: accumulate a running total
while advancing through nodes.

```python
def list_sum(head):
    total = 0
    current = head
    while current is not None:
        total += current.val
        current = current.next
    return total

head = Node(1, Node(2, Node(3, Node(4))))
print(list_sum(head))   # 10
```

## Challenge: list sum

Write `list_sum(head)` that returns the sum of all values in a linked list.
The list may be empty — `head` may be `None`. Return 0 for an empty list.

The `Node` class is already defined as shown above. You do not need to redefine it.

```challenge
class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def list_sum(head):
    pass
```

```test
assert list_sum(None) == 0
assert list_sum(Node(5)) == 5
assert list_sum(Node(1, Node(2, Node(3)))) == 6
assert list_sum(Node(10, Node(20, Node(30, Node(40))))) == 100
assert list_sum(Node(-1, Node(1))) == 0
```

## Cycle Detection

A linked list has a cycle if some node's `next` pointer points back to an earlier node,
creating an infinite loop. Naive traversal would loop forever. Floyd's cycle detection
algorithm — also called the "tortoise and hare" — solves this in O(n) time and O(1) space
using the fast/slow pointer pattern from Level 1.

Advance `slow` by one step and `fast` by two. If `fast` and `slow` ever point to the
same node, there is a cycle — `fast` has lapped `slow` inside the loop. If `fast`
reaches `None`, there is no cycle.

```python
def has_cycle(head):
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:   # same object in memory
            return True
    return False

# Acyclic list: 1 -> 2 -> 3 -> None
a = Node(1, Node(2, Node(3)))
print(has_cycle(a))   # False

# Cyclic list: 1 -> 2 -> 3 -> (back to 2)
n1, n2, n3 = Node(1), Node(2), Node(3)
n1.next = n2
n2.next = n3
n3.next = n2   # cycle: 3 points back to 2
print(has_cycle(n1))  # True
```

**CS lens:** Why does fast catching slow prove a cycle? If a cycle of length L exists,
fast enters the cycle at most L steps before slow does. Once both are inside the cycle,
fast gains one step per iteration. After at most L more iterations, fast has lapped slow
and they are at the same node. Without a cycle, fast exits via `None` in at most n/2
iterations.

**SE lens:** Using `is` (identity comparison) rather than `==` (equality comparison)
is correct here — we are asking "are these the exact same node object in memory?", not
"do these nodes hold the same value?". Two different nodes could hold the same value;
only one pair of pointers can point to the same node.

Reversing a linked list requires no extra memory — only three pointer variables.
At each step, redirect `current.next` to the previous node, then advance all three pointers.

```python
def reverse_list(head):
    prev = None
    current = head
    while current is not None:
        next_node = current.next   # save before we overwrite it
        current.next = prev        # reverse the pointer
        prev = current             # advance prev
        current = next_node        # advance current
    return prev   # prev is now the new head

head = Node(1, Node(2, Node(3, Node(4))))
new_head = reverse_list(head)
current = new_head
while current:
    print(current.val, end=" ")
# 4 3 2 1
```

## Challenge: has cycle

Write `has_cycle(head)` that returns `True` if the linked list contains a cycle and
`False` otherwise. The function must run in O(1) extra space — no visited set.

```challenge
class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    pass
```

```test
assert has_cycle(None) == False
assert has_cycle(Node(1)) == False

n1 = Node(1)
n2 = Node(2)
n3 = Node(3)
n1.next = n2
n2.next = n3
assert has_cycle(n1) == False

c1 = Node(1)
c2 = Node(2)
c3 = Node(3)
c1.next = c2
c2.next = c3
c3.next = c1
assert has_cycle(c1) == True

d1 = Node(1)
d2 = Node(2)
d1.next = d2
d2.next = d1
assert has_cycle(d1) == True
```
