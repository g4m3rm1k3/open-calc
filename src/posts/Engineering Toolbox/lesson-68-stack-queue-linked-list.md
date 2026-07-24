# Lesson 68: What a List Actually Is

## What you will build

Four small data structures, each built from nothing but plain variables
and objects — no `list`, no `collections.deque` doing the real work
underneath: a `DynamicArray` that grows itself, a `Stack` used to check
whether an expression's brackets are balanced, a `LinkedList` made of
individually-connected nodes, and a `Queue` built on top of it. The
transferable problem this lesson is actually about: every data structure
is a specific tradeoff between *how it's laid out in memory* and *what
operations that layout makes cheap or expensive* — not just a container
with a different name.

## What you need to know first

- Nothing beyond general Python fluency (functions, classes, `for`
  loops) — this lesson is intentionally self-contained, per this
  curriculum's Track 10, which runs independent of the networking-project
  tracks.

---

## The Problem, in prose, no code yet

Every lesson so far that needed a list of things just wrote `[]` and
moved on — Python's `list` handles growing, shrinking, and indexing, and
none of that machinery has ever needed a second thought. That's the right
call for building features. But `list` is not one simple thing; it's a
specific engineering answer to a specific set of tradeoffs, and treating
it as a black box forever means never being able to answer questions like
"why is `list.insert(0, x)` slow?" or "when would I reach for something
else entirely?" This lesson opens that box: builds what's actually inside
a `list`-like structure, then builds two more structures — a stack and a
linked list — whose entire reason to exist is making different tradeoffs
than an array does.

Per this curriculum's own exception for concept labs (stated in
`LessonContract.md`: "a concept whose entire point *is* a type this
curriculum will actually use"), the structures below are not preceded by
disposable-named stand-ins — `Stack`, `Queue`, `LinkedList`, and
`DynamicArray` are literally the concepts being taught, so building them
directly, under their real names, from the first line, *is* the lab.

---

## Concept Unit: A Fixed-Size Array Can't Grow

### The Problem

Python's `list` can hold as many items as memory allows, growing as
needed. But the actual arrays a computer's memory provides are nothing
like that — a block of memory is allocated at a fixed size, and there is
no operation that makes an existing block of memory bigger; the memory
immediately after it might already belong to something else entirely.
Understanding `list` means starting from that harder, more honest
starting point: a fixed-size array, and the real problem of what to do
when it fills up.

### Introduce the concept in isolation

```python
class FixedCapacityArray:
    def __init__(self, capacity):
        self.capacity = capacity
        self.slots = [None] * capacity
        self.count = 0

    def append(self, value):
        if self.count == self.capacity:
            raise IndexError("no room left — capacity is fixed")
        self.slots[self.count] = value
        self.count += 1

fixed_array = FixedCapacityArray(capacity=3)
fixed_array.append("a")
fixed_array.append("b")
fixed_array.append("c")
print("slots after 3 appends:", fixed_array.slots)

try:
    fixed_array.append("d")
except IndexError as error:
    print("4th append failed:", error)
```

Run it:

```
slots after 3 appends: ['a', 'b', 'c']
4th append failed: no room left — capacity is fixed
```

What this proves: `[None] * capacity` (reused Python syntax, list
repetition) creates a block of exactly `capacity` slots up front, each
holding a placeholder. `self.count` tracks how many of those slots are
actually in use, separately from `self.capacity`, which never changes.
The output proves the array works exactly as long as there's room, and
then hard-fails the instant it doesn't — there is no attempt to make more
room, because a fixed-size array, by definition, cannot make more room.

This lab is deleted now; it never appears in the project. What survives
is the problem it exposes: real, growable structures need an actual
strategy for what happens at the boundary this class just crashed on.

### CS Lens

This is the honest, low-level shape of an **array**: a contiguous block
of fixed-size slots, each reachable in constant time by its index because
its memory address is a simple calculation (`start_address + index ×
slot_size`) rather than a search.

Also recognized in: a video game's fixed-size inventory grid, a CPU
register file, a hardware frame buffer — anywhere "exactly N slots, no
more, no less" is a real physical or architectural constraint, not just a
design choice.

### SE Lens

A language could expose only fixed-size arrays and force every programmer
to think about capacity by hand, the way C does. Python instead hides
that entirely behind `list`, trading a small amount of performance
overhead (the bookkeeping the next unit adds) for an enormous usability
win: nobody using `list` needs to think about capacity at all. This
lesson exists specifically to show what that convenience is actually
built out of.

---

## Concept Unit: Growing by Doubling — The Dynamic Array

### The Problem

`FixedCapacityArray` crashes at its boundary instead of growing. The
obvious fix — allocate a new, bigger array and copy everything over —
raises an immediate design question: bigger by how much? Growing by
exactly 1 slot every time works, but means every single `append` after
the array first fills up triggers a full copy of everything already in
it — for `n` appends, that's roughly `1 + 2 + 3 + ... + n` total elements
copied, which grows proportionally to `n²`. Growing more aggressively
avoids that.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition modeling the general strategy real dynamic arrays use (CPython
  's own `list`, C++'s `std::vector`, Java's `ArrayList`), not a port of
  any one of their specific source files.
- **Files affected:** new file, `dynamic_array.py`.
- **Change type:** add.
- **Dependencies:** none.

### The New Code

```python
class DynamicArray:
    def __init__(self):
        self.capacity = 1
        self.slots = [None] * self.capacity
        self.count = 0

    def append(self, value):
        if self.count == self.capacity:
            self._grow()
        self.slots[self.count] = value
        self.count += 1

    def _grow(self):
        self.capacity *= 2
        new_slots = [None] * self.capacity
        for index in range(self.count):
            new_slots[index] = self.slots[index]
        self.slots = new_slots
```

### The Updated Project

A brand-new file with nothing surrounding this class yet — covered by
Project Change above.

### Mechanical Walkthrough

- `self.capacity = 1` — starts deliberately small; the class trusts
  `_grow()` to handle every future expansion rather than guessing a large
  starting size.
- `if self.count == self.capacity: self._grow()` — reused comparison and
  conditional, but a new decision point: unlike `FixedCapacityArray`,
  hitting the boundary now triggers an action instead of a failure.
- `self.capacity *= 2` — **first appearance of this specific growth
  strategy in this curriculum**: doubling. Chosen over "+1 each time"
  specifically to change the total cost of `n` appends from proportional
  to `n²` down to proportional to `n` — proven with real numbers in the
  next unit's timing lab, not just asserted here.
- `new_slots = [None] * self.capacity` then the `for` loop copying each
  old value across — reused list-repetition and indexing; the loop is a
  manual, visible version of what Python's own `list` does invisibly in
  C code every time it needs to grow.
- `self.slots = new_slots` — reassigns the instance's array reference to
  the new, bigger block; the old, smaller `slots` list has no more
  references to it after this line and becomes garbage the next unit's
  lens will name directly.

### Execution Trace

```python
dynamic_array = DynamicArray()
for value in ["a", "b", "c", "d", "e"]:
    previous_capacity = dynamic_array.capacity
    dynamic_array.append(value)
    grew = dynamic_array.capacity != previous_capacity
    print(f"append({value!r}): {dynamic_array}  grew={grew}")
```

```
append('a'): DynamicArray(['a'], capacity=1)  grew=False
append('b'): DynamicArray(['a', 'b'], capacity=2)  grew=True
append('c'): DynamicArray(['a', 'b', 'c'], capacity=4)  grew=True
append('d'): DynamicArray(['a', 'b', 'c', 'd'], capacity=4)  grew=False
append('e'): DynamicArray(['a', 'b', 'c', 'd', 'e'], capacity=8)  grew=True
```

Trace, step by step: appending `'a'` finds `count(0) != capacity(1)`, so
no growth — capacity was already 1. Appending `'b'` finds
`count(1) == capacity(1)`, grows to `capacity=2`, then places `'b'`.
Appending `'c'` finds `count(2) == capacity(2)`, grows to `capacity=4`
(room for two more before the next growth). `'d'` fits in that spare
room with no growth. `'e'` finds `count(4) == capacity(4)` again, growing
to `capacity=8`. Growth happens less and less often as the array gets
bigger — exactly the doubling strategy's point.

### CS Lens

This is **amortized constant-time append**: most individual `append`
calls are cheap (`O(1)` — just write to the next free slot), and the
occasional expensive one (`O(n)` — copy everything) happens rarely enough,
and gets rarer as `n` grows, that the *average* cost per append across
many calls works out to constant time. "Amortized" specifically means
spreading an occasional expensive operation's cost across many cheap ones
when analyzing the average — not that any individual operation is
secretly cheap.

Also recognized in: this exact strategy, by name, inside CPython's own
`list` implementation, C++'s `std::vector`, Java's `ArrayList`, and Go's
slice growth — doubling (or a similar constant-factor growth) is close to
universal across language runtimes for precisely the `n²` reason named
above.

### SE Lens

Doubling wastes memory — right after a growth event, up to half the new
array's slots sit empty, reserved for future appends that haven't
happened yet. That's a deliberate trade of memory headroom for time: a
tighter growth factor (say, growing by only 25% each time) wastes less
memory but triggers copies more often; a looser one (doubling, or more)
wastes more memory but copies less often. There is no factor that avoids
both costs — this is a real tradeoff space, and different real-world
runtimes tune it slightly differently for exactly this reason.

---

## Concept Unit: The Stack — Only the Top Is Reachable

### The Problem

An array (dynamic or fixed) lets any slot be read or written directly by
index. A stack is a deliberately *more restrictive* structure built on
top of one: it only ever exposes its single most-recently-added item. The
restriction isn't a limitation to work around — it's the entire feature,
because "only the most recent thing is reachable" is exactly the rule
that makes a stack the right tool for tracking nested, unfinished work:
function calls waiting to return, or — the real problem this unit solves
— brackets waiting to be closed.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `stack.py`.
- **Change type:** add.
- **Dependencies:** `DynamicArray`, from the previous unit.

### The New Code

```python
class Stack:
    def __init__(self):
        self.items = DynamicArray()

    def push(self, value):
        self.items.append(value)

    def pop(self):
        if len(self.items) == 0:
            raise IndexError("pop from empty stack")
        top_index = len(self.items) - 1
        top_value = self.items.get(top_index)
        self.items.count -= 1
        return top_value

    def peek(self):
        if len(self.items) == 0:
            raise IndexError("peek at empty stack")
        return self.items.get(len(self.items) - 1)

    def is_empty(self):
        return len(self.items) == 0
```

*(This unit also assumes `DynamicArray` has gained a `get(index)` method
and `__len__` — small, undramatic additions of already-familiar patterns,
shown in full in the file this lesson produces, per the "never elide"
rule, but not walked through separately since neither introduces a new
concept beyond ordinary indexing and Python's `len()` protocol, already
established.)*

### The Updated Project

A new, freestanding class — covered by Project Change above.

### Mechanical Walkthrough

- `self.items = DynamicArray()` — **composition**: `Stack` doesn't
  inherit from `DynamicArray` or reimplement growable storage itself; it
  *contains* one and uses it internally. `push` and `pop` are a narrower,
  purpose-built interface layered on top of the array's general one.
- `push` — a direct call to the already-understood `append`; nothing new.
- `pop` — reads the item at `len(self.items) - 1` (the last occupied
  slot), then decrements `self.items.count` directly rather than calling
  a method — deliberately reaching into `DynamicArray`'s internals here,
  since `Stack` and `DynamicArray` are tightly coupled by design in this
  lesson; a production version would instead give `DynamicArray` its own
  proper `pop()` to remove this direct field access.
- `peek` — like the top half of `pop`, but doesn't remove anything;
  useful when code needs to know what's on top without committing to
  removing it.
- `is_empty` — a simple, reused length check, wrapped in a name that
  makes calling code read clearly (`if stack.is_empty():` instead of
  `if len(stack.items) == 0:` leaking an internal field).

### Project Change — Applying the Stack

- **Reference Source:** No reference counterpart.
- **Files affected:** `stack.py`.
- **Change type:** add.
- **Location:** below the `Stack` class.

```python
def is_balanced(expression_text):
    matching_bracket = {")": "(", "]": "[", "}": "{"}
    bracket_stack = Stack()
    for character in expression_text:
        if character in "([{":
            bracket_stack.push(character)
        elif character in ")]}":
            if bracket_stack.is_empty():
                return False
            if bracket_stack.pop() != matching_bracket[character]:
                return False
    return bracket_stack.is_empty()
```

### Mechanical Walkthrough

- `matching_bracket = {...}` — reused `dict`, mapping each closing
  bracket to the opening bracket it must match.
- The `for character in expression_text` loop — reused string iteration.
- `character in "([{"` — reused membership testing against a string,
  treating it as a set of individual characters.
- On an opening bracket: `push` it, remembering it's still unclosed.
- On a closing bracket: if the stack is already empty, there's nothing
  for this closing bracket to match — unbalanced, `return False`
  immediately. Otherwise, `pop` the most recently opened, still-unclosed
  bracket and check it's the *correct* type for this closer, using the
  `matching_bracket` lookup — a `]` must pop a `[`, not a `(`.
- After the loop: `bracket_stack.is_empty()` — if anything is still on
  the stack, some opening bracket was never closed at all.

### Run it

```python
test_expressions = ["(a + b) * [c - d]", "(a + [b)]", "{[()]}", "(("]
for expression in test_expressions:
    print(f"is_balanced({expression!r}) = {is_balanced(expression)}")
```

```
is_balanced('(a + b) * [c - d]') = True
is_balanced('(a + [b)]') = False
is_balanced('{[()]}') = True
is_balanced('((') = False
```

`'(a + [b)]'` proves the type-matching check specifically, not just
counting: it has exactly 2 opening and 2 closing brackets — a naive
counter would call it balanced — but `)` incorrectly tries to close a
`[`, and `pop()` correctly catches that mismatch.

### CS Lens

This is **LIFO** — Last In, First Out — the defining property of a stack,
and `is_balanced` is a textbook application of using that property to
track nested structure: the most recently opened bracket is always the
next one that must close, which is exactly what `pop()` (returning the
*most recently pushed* item) naturally enforces.

Also recognized in: a function call stack (the actual mechanism behind
every function return in every language this curriculum has used), the
undo button in a text editor, browser back-button history, recursive
descent parsers checking exactly this kind of nested/matched structure in
real programming language syntax.

### SE Lens

`is_balanced` never reaches into `bracket_stack.items` directly — it only
calls `push`, `pop`, and `is_empty`. That's **encapsulation**: `Stack`'s
public surface (per `LessonContract.md`'s definition of that term) is
exactly those three operations, and `is_balanced` is written against that
promise, not against `DynamicArray`'s internals. If `Stack` were later
rewritten to use a linked list internally instead of a `DynamicArray`
(the next unit builds exactly that alternative), `is_balanced` would not
need to change at all.

---

## Concept Unit: Why `list.pop(0)` Is a Trap

### The Problem

A stack only ever needs to touch one end of its storage — the end
`append`/`pop` already treat as cheap. A queue needs the *opposite* end
for removal: first in, first out, so whatever was added earliest must be
removed first — normally the front of the array. Python's own `list`
does support `list.pop(0)` for exactly this. It should not be used for a
real queue, and the reason why is worth actually measuring, not just
asserting.

### Introduce the concept in isolation

```python
import time

def time_pop_front(list_size):
    sample_list = list(range(list_size))
    start_time = time.perf_counter()
    while sample_list:
        sample_list.pop(0)
    elapsed_time = time.perf_counter() - start_time
    return elapsed_time

for size in [2_000, 4_000, 8_000]:
    elapsed = time_pop_front(size)
    print(f"popping {size} items from the front took {elapsed:.4f} seconds")
```

Run it:

```
popping 2000 items from the front took 0.0109 seconds
popping 4000 items from the front took 0.0345 seconds
popping 8000 items from the front took 0.0813 seconds
```

What this proves: doubling the list size roughly tripled to quadrupled
the time, not doubled it — the telltale sign of `O(n²)` behavior, not
`O(n)`. `time.perf_counter()` (**first appearance**) is a high-resolution
timer meant specifically for measuring short elapsed durations, more
precise than `time.time()` for this purpose, though — unlike Lesson 32's
`time.monotonic()` — its exact reference point isn't guaranteed
meaningful across processes, only within one running program, which is
all this measurement needs. The reason for the slowdown: removing index
`0` from a Python `list` doesn't just delete one item, it shifts *every
remaining item* one position to the left internally, because a `list`'s
whole design (per the Dynamic Array unit above) depends on items sitting
in contiguous, index-addressable slots — there is no way to remove the
first slot without physically moving everything after it.

This lab is deleted now; it never appears in the project. The measured
fact survives: removing from the front of an array-backed structure costs
real, and growing, time.

### CS Lens

This is a direct, measured consequence of the array layout taught
earlier in this lesson: `O(1)` access by index is only possible because
every element's position is a fixed offset from the start — which is
exactly what makes removing from the *front* expensive, since every
other element's offset must then change.

Also recognized in: any "why is my code slow" investigation that turns
out to be an array-backed structure used at the wrong end — a genuinely
common real-world performance bug, not a contrived example.

### SE Lens

Python could have implemented `list.pop(0)` differently, or refused to
offer it at all — it doesn't, because occasionally removing from the
front of a short list is harmless, and forbidding a rarely-harmful
operation to prevent a specific misuse would make the type less flexible
for its many other legitimate uses. The responsibility instead falls on
the programmer to know when an operation that's *available* isn't
*appropriate* — which is precisely the gap this lesson exists to close.

---

## Concept Unit: The Linked List

### The Problem

A structure that needs to add and remove from *either* end cheaply, and
that never needs random access by index, doesn't need contiguous memory
at all — it needs each element to simply know where the next one is,
wherever in memory it happens to actually live.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `linked_list_and_queue.py`.
- **Change type:** add.
- **Dependencies:** none.

### The New Code

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next_node = None
```

### The Updated Project

A brand-new, minimal class with nothing surrounding it yet.

### Mechanical Walkthrough

- `self.value = value` — reused attribute assignment; holds whatever
  data this node stores.
- `self.next_node = None` — **first appearance of a self-referential
  structure**: `next_node` will eventually hold *another* `Node` object
  (or nothing, `None`, if this is the last one) — a class whose instances
  point to other instances of the same class. This single field is the
  entire mechanism that replaces contiguous memory: instead of "the next
  element is at `address + slot_size`," it's "the next element is
  whatever `next_node` happens to point to," which could be anywhere.

### CS Lens

This is a **linked structure** — data connected by explicit references
rather than by physical adjacency. It trades away `O(1)` indexed access
(there is no way to jump straight to "the 5th node" without walking
through the first four) for `O(1)` insertion or removal at any point
*already reached*, with no shifting of anything else required.

Also recognized in: every tree and graph structure Track 10 builds later
in this curriculum, browser DOM node parent/child/sibling references, a
music player's "next track" pointer, filesystem directory entries linking
to inodes.

### SE Lens

Choosing an array versus a linked structure is a real, consequential
design decision, not a style preference: an array wins when indexed
access is common and the collection's size is relatively stable; a linked
structure wins when insertion/removal at the ends (or in the middle, once
a position is already reached) dominates and indexed access is rare or
absent. Neither is a strictly better general-purpose choice — this is
why real language standard libraries ship both.

### Project Change — The Full List

- **Reference Source:** No reference counterpart.
- **Files affected:** `linked_list_and_queue.py`.
- **Change type:** add.
- **Location:** below `Node`.

### The New Code

```python
class LinkedList:
    def __init__(self):
        self.head_node = None
        self.tail_node = None
        self.length = 0

    def append(self, value):
        new_node = Node(value)
        if self.head_node is None:
            self.head_node = new_node
            self.tail_node = new_node
        else:
            self.tail_node.next_node = new_node
            self.tail_node = new_node
        self.length += 1

    def prepend(self, value):
        new_node = Node(value)
        new_node.next_node = self.head_node
        self.head_node = new_node
        if self.tail_node is None:
            self.tail_node = new_node
        self.length += 1

    def remove_head(self):
        if self.head_node is None:
            raise IndexError("remove_head from empty list")
        removed_value = self.head_node.value
        self.head_node = self.head_node.next_node
        if self.head_node is None:
            self.tail_node = None
        self.length -= 1
        return removed_value

    def __iter__(self):
        current_node = self.head_node
        while current_node is not None:
            yield current_node.value
            current_node = current_node.next_node
```

### Mechanical Walkthrough

- `self.head_node = None` / `self.tail_node = None` — **first appearance
  of tracking both ends explicitly.** `head_node` is the first node
  (needed so traversal and `prepend` have somewhere to start); `tail_node`
  is the last (needed so `append` doesn't have to walk the entire list
  just to find where to attach a new node — without it, `append` would be
  `O(n)` instead of `O(1)`).
- `append`: if the list is currently empty, the new node becomes both
  head and tail at once. Otherwise, the *current* tail's `next_node` is
  pointed at the new node (linking it into the chain), and then
  `tail_node` itself is updated to that new node.
- `prepend`: the new node's `next_node` is set to whatever the current
  head is *first*, then `head_node` is updated to the new node — ordering
  matters here: updating `head_node` first would lose the only reference
  to the rest of the list.
- `remove_head`: saves the value before losing access to it, moves
  `head_node` forward to whatever the removed node was pointing at, and —
  a case easy to miss — if that makes `head_node` become `None` (the list
  is now empty), `tail_node` must be reset to `None` too, or it would
  keep pointing at a node that's no longer reachable from the head at
  all, silently corrupting the "both ends tracked" invariant this class
  depends on.
- `__iter__` and `yield` — **first appearance of a generator method** in
  this curriculum. Defining `__iter__` is what makes `for value in
  linked_list:` work at all (reused `for` syntax, new target type);
  `yield` (new keyword) turns this method into a **generator**: calling
  it doesn't run the body immediately — it returns an object that runs
  the body *incrementally*, producing one value at a time each time the
  `for` loop asks for the next one, pausing exactly at each `yield` and
  resuming from that exact point on the next request. This means a
  million-node list could be iterated one node at a time without ever
  building a million-item Python `list` in memory just to loop over it.

### Execution Trace

```python
linked_list = LinkedList()
linked_list.append("first")
linked_list.append("second")
linked_list.prepend("zeroth")
print("linked list contents:", linked_list)
print("removed head:", linked_list.remove_head())
print("linked list after removal:", linked_list)
```

```
linked list contents: LinkedList(['zeroth', 'first', 'second'])
removed head: zeroth
linked list after removal: LinkedList(['first', 'second'])
```

```
append("first"):  head → [first|None] ← tail
append("second"): head → [first|•] → [second|None] ← tail
prepend("zeroth"): head → [zeroth|•] → [first|•] → [second|None] ← tail
remove_head(): returns "zeroth"; head_node moves to the "first" node;
               tail_node unchanged (list still non-empty)
```

### CS Lens

`__iter__`/`yield` is Python's built-in implementation of the **iterator
pattern** — a standard way to expose "give me the next item" without the
caller needing to know anything about how items are actually stored
underneath. `LinkedList`'s items live in scattered nodes connected by
pointers; a `list`'s items live in one contiguous block; both support
`for value in collection:` identically, because the iterator pattern
deliberately hides that difference from the calling code.

Also recognized in: database cursors (fetching one row at a time instead
of loading an entire result set into memory), file objects iterated line
by line, every `for` loop over a dictionary or set in Python — all of
them generators or iterators underneath, not pre-built lists.

### SE Lens

Tracking `tail_node` costs one extra field and a few extra lines of
bookkeeping (the `if self.head_node is None` branches in both `append`
and `remove_head`) in exchange for turning `append` from an `O(n)`
walk-to-the-end operation into an `O(1)` one. This is the same kind of
tradeoff the `DynamicArray` unit made with capacity doubling: spend a
small, constant amount of extra bookkeeping to avoid a cost that would
otherwise scale with the size of the data.

---

## Concept Unit: The Queue, Built on the Linked List

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `linked_list_and_queue.py`.
- **Change type:** add.
- **Location:** below `LinkedList`.
- **Dependencies:** `LinkedList`, from the previous unit.

### The New Code

```python
class Queue:
    def __init__(self):
        self.items = LinkedList()

    def enqueue(self, value):
        self.items.append(value)

    def dequeue(self):
        return self.items.remove_head()

    def is_empty(self):
        return len(self.items) == 0
```

### Mechanical Walkthrough

Every line here is a **hard concept reappearing**: `composition` (`Stack`
already established wrapping one structure inside a purpose-built
interface), and every method call — `append`, `remove_head`, `len()` via
`__len__` — reuses `LinkedList` operations already fully explained above.
The only genuinely new fact is the choice these three lines encode:
`enqueue` adds at the tail (`append`), `dequeue` removes from the head
(`remove_head`) — the two ends of `LinkedList` that are *both* `O(1)`,
which is exactly why `Queue` is built on `LinkedList` rather than on
`DynamicArray`: a `DynamicArray`-backed queue would need the expensive
front-removal this lesson already measured and rejected.

### Run it

```python
print_queue = Queue()
for customer in ["alice", "bob", "carol"]:
    print_queue.enqueue(customer)
    print(f"enqueue({customer!r})")

while not print_queue.is_empty():
    served = print_queue.dequeue()
    print(f"dequeue() -> {served!r}")
```

```
enqueue('alice')
enqueue('bob')
enqueue('carol')
dequeue() -> 'alice'
dequeue() -> 'bob'
dequeue() -> 'carol'
```

`alice`, enqueued first, is also dequeued first — **FIFO**, First In
First Out, the defining property that distinguishes a queue from the
stack built earlier in this lesson, using the exact same underlying
`LinkedList`.

### CS Lens

FIFO ordering, restated directly against the stack's LIFO ordering from
earlier in this same lesson: same general shape (add on one side, remove
on the other, no random access), opposite ordering guarantee, and that
single difference is what makes a queue right for "process things in the
order they arrived" (a print queue, a task queue, breadth-first graph
traversal in a later Track 10 lesson) while a stack is right for
"process the most recent thing first" (undo history, nested
function calls, depth-first traversal).

Also recognized in: every real print spooler, message queue systems like
RabbitMQ or SQS, CPU task scheduling queues, breadth-first search
(explicitly named here because it's the direct connection this
curriculum will make when Track 10 reaches graph traversal).

### SE Lens

`Queue` and `Stack` share almost the same three-method shape
(`push`/`pop`/`is_empty` versus `enqueue`/`dequeue`/`is_empty`) but are
kept as two separate, small classes rather than one configurable class
with a "mode" flag. That's single responsibility again: each class has
exactly one ordering guarantee to uphold and one job to do, which makes
each trivially easy to verify correct in isolation — exactly what this
lesson's two separate test runs just did.

---

## Connect the pieces

One value, `"second"`, followed through every structure built today:
appended to a `DynamicArray` (lands in a fixed slot, possibly triggering
a doubling copy first), pushed onto a `Stack` built on that same
`DynamicArray` (becomes the only reachable item until something is popped
off above it), or appended to a `LinkedList` (becomes a `Node` whose
`next_node` is `None` until something is appended after it, reachable
only by walking from `head_node` or, if it's the newest, directly via
`tail_node`) — the same value, four different structures, four different
promises about what stays cheap and what doesn't.

## What breaks without this

Delete the `tail_node` update from `LinkedList.append` (keep everything
else) and repeat the earlier trace:

```python
linked_list = LinkedList()
linked_list.append("first")
linked_list.append("second")   # tail_node still points at "first"!
linked_list.append("third")    # attaches to tail_node.next_node == "first".next_node,
                                # silently overwriting the link to "second"
print(list(linked_list))
```

```
['first', 'third']
```

`"second"` is still sitting in memory, still fully constructed — and
completely unreachable, since nothing in the chain from `head_node`
points to it anymore. This is exactly why `tail_node` must be
kept in lockstep with every structural change, not just set once at
construction — a linked structure's correctness lives entirely in its
pointers being accurate, with no independent index or count to catch a
mistake the way `DynamicArray`'s bounds-checking does.

## Definition of done

- [ ] `dynamic_array.py` runs and shows capacity doubling at exactly the
      sizes traced above (grows at 2, 3, 5 elements added; not 4).
- [ ] `stack.py`'s `is_balanced` correctly returns `False` for
      `"(a + [b)]"` — proving type-matching, not just bracket counting.
- [ ] The `pop(0)` timing lab shows clearly super-linear growth on your
      own machine (exact numbers will differ from the ones shown above,
      but the *shape* — more than doubling when input size doubles —
      should hold).
- [ ] `linked_list_and_queue.py`'s `Queue` dequeues `"alice"`, `"bob"`,
      `"carol"` in that exact order after being enqueued in that order.
- [ ] You can explain, without looking back at this lesson, why `Queue`
      is built on `LinkedList` and not on `DynamicArray`.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add dynamic_array.py stack.py linked_list_and_queue.py
  git commit -m "Build DynamicArray, Stack, LinkedList, and Queue from scratch — establishes the array-vs-linked-structure tradeoff (O(1) index vs O(1) end-insertion) that later Track 10 lessons on trees, graphs, and caches all build on"
  ```

## What's next

`LinkedList` here only links forward — reaching the *previous* node from
a given one means walking from the head all over again. `Stack`'s `pop`
also still reaches directly into `DynamicArray.count`, a coupling named
honestly in that unit's walkthrough rather than hidden. Lesson 70's hash
table reuses this lesson's `LinkedList` directly, for a reason that will
only make sense once hash collisions are on the table: multiple keys
landing in the same slot need exactly the kind of cheap-to-extend chain
this lesson just built.
