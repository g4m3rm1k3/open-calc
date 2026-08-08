# Lesson 72: Forgetting on Purpose — an LRU Cache from Scratch

**What you will build:** an `LRUCache` class with `get` and `put`, both
running in O(1), that automatically evicts whatever hasn't been used in
the longest time once it's full. The working feature is a fixed-size
cache that manages itself. The transferable problem: fast lookup
(Lesson 70) and knowing *the order things were used in* are two
separate concerns, and neither structure built so far solves both at
once — this lesson combines two already-built structures because
neither alone is enough.

**What you need to know first:** Lesson 68 (linked list from scratch)
— this lesson extends that node from one `next` pointer to two
(`prev` and `next` both), the same extension Lesson 71 made in a
different direction (`left`/`right` instead of `prev`/`next`). Lesson
70 (hash table from scratch) — `LRUCache` uses a plain Python `dict`
as its O(1) key-to-node lookup, which is exactly what Lesson 70 built
by hand; using the built-in here is spending that earlier lesson's
result, not reinventing it.

---

## Concept Unit: The Problem — Fast Lookup and Recency Are Two Different Jobs

### The Problem

A cache needs two things at once: find a value by key instantly (or
caching is pointless — you'd be back to searching), and know which
entries haven't been touched in the longest time, so that once the
cache is full, the *right* thing gets evicted to make room. A plain
list can track order but not fast lookup. A plain dict can do fast
lookup but, as this lab shows, doesn't track *access* order at all.

### The New Code

```python
# Option 1: a plain list keeps order (recency), but finding a key means scanning.
cache_list = [("a", 1), ("b", 2), ("c", 3)]

def find(cache_list, key):
    for k, v in cache_list:
        if k == key:
            return v
    return None

print("list lookup:", find(cache_list, "c"))
print("list keeps order, but lookup is O(n) -- scanned up to", len(cache_list), "pairs")

# Option 2: a plain dict is O(1) lookup, but has no idea what order keys were touched in.
cache_dict = {"a": 1, "b": 2, "c": 3}
print("dict lookup:", cache_dict["c"], "-- O(1), but dict remembers INSERTION order, not ACCESS order")
cache_dict["a"]  # "using" a doesn't change its position at all
print(list(cache_dict.keys()), "-- still a, b, c -- reading 'a' didn't move it")
```

### Run It

```
list lookup: 3
list keeps order, but lookup is O(n) -- scanned up to 3 pairs
dict lookup: 3 -- O(1), but dict remembers INSERTION order, not ACCESS order
['a', 'b', 'c'] -- still a, b, c -- reading 'a' didn't move it
```

Discarded now. The real insight this proves: `cache_dict["a"]` reading
a value did not change `list(cache_dict.keys())`'s order at all — a
dict tracks *insertion* order (a Python guarantee since 3.7), never
*access* order, and access order is the entire thing an LRU
("least-recently-used") cache needs to track. Neither structure alone
solves this — the rest of the lesson combines them.

### CS Lens

Needing two different structures because each is good at exactly one
of two simultaneous requirements — never one doing both — is a common
enough shape to have its own recognizable pattern: a search engine's
index (fast lookup) paired with a relevance-ranked result list (order),
a browser's history (chronological) paired with its autocomplete index
(fast prefix lookup), an operating system's page table (fast lookup)
paired with its page-replacement queue (recency order) — which is, not
coincidentally, solving almost exactly this same problem at the OS
level.

---

## Concept Unit: The Doubly Linked Node

### The Problem

Lesson 68's linked-list node points forward only (`.next`). Tracking
recency needs a structure where "this was just used, move it to the
front" and "this is oldest, remove it from the back" are both cheap —
and removing a node from the *middle* of a singly linked list cheaply
requires already having a reference to the node *before* it, which a
forward-only chain doesn't hand you for free.

### The New Code

```python
class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

a = Node("a", 1)
b = Node("b", 2)
a.next = b
b.prev = a

print(a.next.key)   # walk forward from a
print(b.prev.key)   # walk backward from b
```

### Run It

```
b
a
```

Confirms the wiring in both directions: from `a`, `.next` reaches `b`;
from `b`, `.prev` reaches `a`, without re-searching anything. This is
called a **doubly linked list node** — Lesson 68's single-pointer node,
extended with a second pointer, the same kind of extension Lesson 71
made to build a tree node (one pointer to two, just in a different
direction: backward/forward here, instead of left/right). One further
detail worth naming: this `Node` carries *two* pieces of payload,
`key` and `value`, not just one — necessary here, because the linked
list alone won't be enough to find a node by key (that's the hash
map's job, in the next unit); the node needs to know its own key so
that, once *found* via the hash map, it can be located and unlinked
from *this* list too.

### Discarded

This manual two-node wiring is deleted now; the real project builds a
list with fixed sentinel ends instead of loose nodes wired by hand,
built next.

---

## Concept Unit: A Sentinel-Bounded List — `_remove` and `_add_front`

### The Problem

A doubly linked list needs a defined front (most-recently-used) and
back (least-recently-used) — and code that adds or removes at either
end needs to handle "the list is empty" and "this is the only node"
without special-casing them separately from the normal case.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as Lessons 70 and 71.
- **Files affected:** `lru_cache.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** the `Node` class from the previous unit.

### The New Code

```python
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head = Node(None, None)   # sentinel: most-recently-used side
        self.tail = Node(None, None)   # sentinel: least-recently-used side
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node
```

### Run It

```python
>>> from lru_cache import LRUCache, Node
>>> c = LRUCache(3)
>>> n1 = Node("a", 1)
>>> n2 = Node("b", 2)
>>> c._add_front(n1)
>>> c._add_front(n2)
>>> node = c.head.next
>>> order = []
>>> while node is not c.tail:
...     order.append(node.key)
...     node = node.next
>>> order
['b', 'a']
>>> c._remove(n1)
>>> node = c.head.next
>>> order = []
>>> while node is not c.tail:
...     order.append(node.key)
...     node = node.next
>>> order
['b']
```

### Mechanical Walkthrough

- `self.head = Node(None, None)` and `self.tail = Node(None, None)` —
  **first appearance of sentinel nodes.** Two `Node` instances that
  never hold real cache data (`key` and `value` both `None`) — they
  exist purely to mark the two ends of the list, so every real node
  always has a real `.prev` and a real `.next` to work with, never
  `None`. This is the detail that removes the special-casing: without
  sentinels, `_remove` on the very first or last real node would need
  an `if node.prev is None` branch; with them, `node.prev` is *always*
  a real object (possibly `self.head` itself), so the same code path
  works every time.
- `self.head.next = self.tail` and `self.tail.prev = self.head` — the
  two sentinels start out pointing directly at each other, representing
  an empty list: nothing real between the most-recently-used marker
  and the least-recently-used marker yet.
- `def _remove(self, node): node.prev.next = node.next; node.next.prev = node.prev`
  — **first appearance of unlinking a node from a doubly linked list.**
  Two assignments, each closing one side of the gap `node` leaves
  behind: the node *before* `node` now points forward directly to the
  node *after* it, and vice versa. Nothing about `node` itself is
  touched — its own `.prev`/`.next` still point at its old neighbors
  after this call, which is fine, because nothing in the list points
  *back* to `node` anymore; it's unreachable by traversal even though
  its own fields are technically stale.
- `def _add_front(self, node): node.next = self.head.next; node.prev = self.head; self.head.next.prev = node; self.head.next = node`
  — **first appearance of inserting at a specific position via
  sentinel.** Four assignments, in a deliberate order: first, point
  the new node forward at whatever was previously first (`self.head.next`)
  and backward at the head sentinel; only *then* fix up the two
  existing neighbors to point at the new node — `self.head.next.prev
  = node` runs *before* `self.head.next` itself is overwritten on the
  next line, which is exactly why it has to come in this order: it
  still needs `self.head.next` to mean "the old first node" at the
  moment it runs.

### Execution Trace

```python
c = LRUCache(3)
c._add_front(n1)   # n1 = Node("a", 1)
c._add_front(n2)   # n2 = Node("b", 2)
```

1. `_add_front(n1)` — `n1.next = self.head.next` → `n1.next = tail`
   (list was empty); `n1.prev = self.head`; `self.head.next.prev =
   n1` → `tail.prev = n1`; `self.head.next = n1`. List is now
   `head ↔ n1 ↔ tail`.
2. `_add_front(n2)` — `n2.next = self.head.next` → `n2.next = n1`
   (the *current* first node, from step 1); `n2.prev = self.head`;
   `self.head.next.prev = n2` → `n1.prev = n2`; `self.head.next = n2`.
   List is now `head ↔ n2 ↔ n1 ↔ tail`.

Forward traversal from `head.next` therefore visits `b` then `a` —
matching the real output `['b', 'a']` exactly: each `_add_front` call
puts its node immediately after `head`, so the most recently added
node is always first.

3. `_remove(n1)` — `n1.prev.next = n1.next` → `n2.next = tail`;
   `n1.next.prev = n1.prev` → `tail.prev = n2`. List becomes
   `head ↔ n2 ↔ tail` — `n1` is gone, `n2` now connects directly to
   `tail`, matching the real output `['b']`.

### CS Lens

Two dummy nodes marking fixed boundaries so every real node has real
neighbors to work with, with no `None`-checking special cases, is
called the **sentinel pattern**. Also recognized in: a sentinel value
ending a C string search loop instead of checking a length every
iteration, a "guard" HTTP route matching anything unmatched instead of
special-casing 404 handling separately, a binary search's `-1`
"not found" return acting as a sentinel result rather than a special
exception path.

---

## Concept Unit: The Hash Map — O(1) Lookup by Key

### The Problem

The linked list above tracks *order* correctly, but finding a specific
node by key still means walking the list — exactly the O(n) problem
this whole lesson exists to avoid. Something needs to map a key
directly to its node.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition; the lookup mechanism itself (a hash table) has a real
  counterpart in Lesson 70's own `HashTable`, but this project uses
  Python's built-in `dict` directly rather than re-importing that
  earlier class, since the point here is combining structures, not
  re-proving hashing works.
- **Files affected:** `lru_cache.py`.
- **Change type:** modify — `self.map = {}` is already present in
  `__init__` from the previous unit; this unit is about *using* it,
  not adding it.
- **Location:** inside `LRUCache.__init__`, already-existing line;
  the new work is in `get`, added next.
- **Dependencies:** the sentinel list from the previous unit.

### The New Code

```python
    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.value
```

### The Updated Project

```python
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head = Node(None, None)
        self.tail = Node(None, None)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):                                             # ← new
        if key not in self.map:                                      # ← new
            return -1                                                  # ← new
        node = self.map[key]                                            # ← new
        self._remove(node)                                                # ← new
        self._add_front(node)                                              # ← new
        return node.value                                                   # ← new
```

`LRUCache` now has its first complete operation: `get` finds a node in
O(1) via `self.map`, and — the actual point of an *LRU* cache — every
successful read also counts as "this was just used," moving that node
to the front of the list before returning its value.

### Mechanical Walkthrough

- `if key not in self.map: return -1` — `not in` against a `dict` is
  the same O(1) hash-based membership check reappearing from Lesson
  71's `visited` sets (a hard concept reappearing, not new); returning
  `-1` here is a real design choice, not arbitrary — the convention
  this class follows (matching the standard convention for LRU cache
  implementations) is a *sentinel return value* for "not found,"
  reappearing from this lesson's own sentinel-node unit, just applied
  to a return value instead of a linked-list position.
- `node = self.map[key]` — O(1) dict lookup, already-basic, but worth
  stating plainly what it returns: not the *value* the caller asked
  for, but the `Node` object itself — the map's whole job is mapping
  key → node, not key → value, precisely so this method can reach the
  node's list position, not just its payload.
- `self._remove(node)` then `self._add_front(node)` — **first
  appearance of the "move to front" idiom**, built from two already-
  established operations run back to back: unlink the node from
  wherever it currently sits, then re-insert it at the front. This
  pair is what actually implements "least recently used" — every
  access moves a node to the most-recently-used position, so whatever
  remains at the *opposite* end, over time, is genuinely whatever
  hasn't been touched in the longest stretch.
- `return node.value` — only after the reordering above, hand back
  the value the caller actually wanted.

### Run It

```python
>>> c = LRUCache(3)
>>> for k, v in [("a", 1), ("b", 2), ("c", 3)]:
...     n = Node(k, v)
...     c.map[k] = n
...     c._add_front(n)
>>> c.order()          # helper walking head -> tail, listing keys
['c', 'b', 'a']
>>> c.get("a")
1
>>> c.order()
['a', 'c', 'b']
>>> c.get("z")
-1
```

(`order()`, used here only to inspect internal state for teaching
purposes, is the same head-to-tail walk written out by hand in the
previous unit's execution trace, wrapped as a small helper method —
shown in full in the final class below.)

### Execution Trace

Starting order `['c', 'b', 'a']` (most-recently-added first, since
each was `_add_front`'d in turn: a, then b, then c).

1. `c.get("a")` — `"a" in c.map` is true; `node = c.map["a"]`, the `a`
   node, currently at the *back* of the list (added first, never
   touched since). `_remove(node)` unlinks it from between `b` and the
   tail sentinel. `_add_front(node)` re-inserts it directly after
   `head`. New order: `['a', 'c', 'b']` — `a` jumped from last to
   first, `c` and `b` unchanged relative to each other.
2. `c.get("z")` — `"z" in c.map` is false; returns `-1` immediately,
   no list operation happens at all — a miss doesn't touch recency,
   because nothing was actually used.

Real output confirms both: `['a', 'c', 'b']` matches the trace exactly,
and the miss returns `-1` with no crash.

### CS Lens

A hash map storing *references to nodes in a second structure*, rather
than storing the payload data twice, is the same idea behind a
database index (points at a row, doesn't duplicate the row), a search
engine's inverted index (points at documents, doesn't copy their
text), and a symbol table in a compiler (points at where a variable's
storage actually lives).

---

## Concept Unit: `put` — Insert, Update, and Evict

### The Problem

`get` handles reading an existing key. Nothing yet handles adding a
new key, updating an existing one without duplicating it, or — the
actual reason this is an *LRU* cache and not just a cache — evicting
the least-recently-used entry once the cache is full.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `lru_cache.py`.
- **Change type:** add.
- **Location:** inside `LRUCache`, immediately after `get`.
- **Dependencies:** `self.capacity` (already stored in `__init__`),
  `_remove`/`_add_front` (already built).

### The New Code

```python
    def put(self, key, value):
        if key in self.map:
            node = self.map[key]
            node.value = value
            self._remove(node)
            self._add_front(node)
            return
        if len(self.map) >= self.capacity:
            lru_node = self.tail.prev
            self._remove(lru_node)
            del self.map[lru_node.key]
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
```

### The Updated Project

```python
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head = Node(None, None)
        self.tail = Node(None, None)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.value

    def put(self, key, value):                                       # ← new
        if key in self.map:                                            # ← new
            node = self.map[key]                                        # ← new
            node.value = value                                            # ← new
            self._remove(node)                                             # ← new
            self._add_front(node)                                           # ← new
            return                                                          # ← new
        if len(self.map) >= self.capacity:                                # ← new
            lru_node = self.tail.prev                                       # ← new
            self._remove(lru_node)                                           # ← new
            del self.map[lru_node.key]                                        # ← new
        node = Node(key, value)                                                # ← new
        self.map[key] = node                                                    # ← new
        self._add_front(node)                                                    # ← new
```

`LRUCache` is now feature-complete: `get` and `put` together maintain
one invariant at all times — `self.map` and the linked list always
agree on exactly which keys exist, and the linked list's front-to-back
order always reflects true most-to-least recently used, updated on
every single read or write.

### Mechanical Walkthrough

- `if key in self.map:` — the **update path**, handled first: if the
  key already exists, this is not a new insertion. `node.value =
  value` overwrites the stored value in place — the node itself is
  reused, not replaced — then the same already-established
  "remove, then add-front" move-to-front idiom from `get` runs, because
  a *write* to an existing key counts as using it, exactly like a read
  does. `return` exits before any of the insertion logic below can
  run.
- `if len(self.map) >= self.capacity:` — reached only for a genuinely
  new key: `len(self.map)` is already-basic; comparing it against
  `self.capacity` decides whether the cache is already full.
- `lru_node = self.tail.prev` — **first appearance of reading the
  least-recently-used node directly.** Because every access moves a
  node to the *front* (right after `self.head`), the node
  *immediately before the tail sentinel* is, by construction, whatever
  hasn't been touched in the longest time — no searching required,
  just one pointer dereference.
- `self._remove(lru_node)` then `del self.map[lru_node.key]` — evict
  in both structures, not just one: unlink it from the list (already
  established), and delete its entry from `self.map` too — skipping
  either half would leave the two structures disagreeing about what
  the cache actually contains, breaking the invariant this whole class
  depends on.
- `node = Node(key, value)`, `self.map[key] = node`, `self._add_front(node)`
  — build the new node, register it in the map, and place it at the
  front — the same three steps, in the same order, that inserting any
  brand-new entry always needs.

### Execution Trace

`LRUCache(capacity=3)`, empty to start.

```python
c.put("a", 1)
c.put("b", 2)
c.put("c", 3)
c.get("a")
c.put("d", 4)
```

1. `put("a", 1)` — `"a"` not in `map` (empty); `len(map)=0 < 3`, no
   eviction; new node created, `map={"a": ...}`, front-inserted.
   Order: `['a']`.
2. `put("b", 2)` — new key, `len(map)=1 < 3`, no eviction.
   Order: `['b', 'a']`.
3. `put("c", 3)` — new key, `len(map)=2 < 3`, no eviction.
   Order: `['c', 'b', 'a']`.
4. `get("a")` — `"a"` in map; move-to-front. Order: `['a', 'c', 'b']`.
5. `put("d", 4)` — new key; `len(map)=3 >= capacity=3` — eviction
   fires. `lru_node = self.tail.prev` — the node right before the
   tail sentinel is `b` (last in the order from step 4). `_remove(b)`
   unlinks it; `del self.map["b"]` drops it from the map entirely.
   *Then* the new `d` node is created, mapped, and front-inserted.
   Final order: `['d', 'a', 'c']`; `map` keys: `{'a', 'c', 'd'}` — `b`
   is gone from both structures.

### Run It

```
after a,b,c: ['c', 'b', 'a'] dict_keys(['a', 'b', 'c'])
after get(a): ['a', 'c', 'b']
after put(d): ['d', 'a', 'c'] ['a', 'c', 'd']
get(b): -1
get(d): 4
```

Real output, matching the trace exactly: `b`, the one entry never
`get`-accessed after its insertion, is exactly the one evicted when a
fourth key arrives at a 3-capacity cache — confirmed both by the order
list (`b` no longer appears) and by a direct `get("b")` afterward
returning `-1`.

One more real check, worth its own explicit run: updating an existing
key must *not* trigger eviction, since it doesn't grow the cache.

```python
>>> c2 = LRUCache(2)
>>> c2.put("x", 100)
>>> c2.put("y", 200)
>>> c2.put("x", 999)   # x already exists -- update, not insert
>>> c2.order()
['x', 'y']
>>> c2.map["x"].value
999
```

```
['x', 'y'] {'x': 999, 'y': 200}
```

Both entries survive — the update path returns before the eviction
check ever runs, exactly as the `if key in self.map: ... return` block
above guarantees.

### CS Lens

Reading the node right before a fixed sentinel, with no search, to
find "the oldest surviving entry" — because the structure's own
invariant guarantees it's there — is the same trick behind a
ring-buffer's overwrite pointer, a garbage collector's "oldest
generation" boundary in generational GC, and a video game's replay
buffer discarding its oldest frame the instant a new one arrives past
capacity.

### SE Lens

The alternative to sentinels here — tracking recency with, say, a
plain Python list and `.remove()`/`.insert(0, ...)` — would make `get`
and `put` both `O(n)` again (list removal and insertion both shift
elements), defeating the entire point of this lesson. The doubly
linked list plus hash map combination costs real complexity — two
structures to keep in sync, not one — bought specifically to make
every operation genuinely O(1), which is the one property a fixed-size
cache actually needs to be worth using at all: a cache slower than the
thing it's caching isn't a cache.

---

## Connect the Pieces

```python
class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}
        self.head = Node(None, None)
        self.tail = Node(None, None)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.value

    def put(self, key, value):
        if key in self.map:
            node = self.map[key]
            node.value = value
            self._remove(node)
            self._add_front(node)
            return
        if len(self.map) >= self.capacity:
            lru_node = self.tail.prev
            self._remove(lru_node)
            del self.map[lru_node.key]
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)

    def order(self):
        node = self.head.next
        result = []
        while node is not self.tail:
            result.append(node.key)
            node = node.next
        return result
```

Every method — `get`, `put`, and the eviction branch inside `put` —
touches both structures every time, never just one: `self.map` for
"does this key exist, and where," the linked list for "what order was
everything actually used in." Neither structure could do the other's
job; combining them is the entire lesson.

## What Breaks Without This

Comment out the eviction block inside `put` and run the same five-call
sequence from the trace above:

```python
def put(self, key, value):
    if key in self.map:
        node = self.map[key]
        node.value = value
        self._remove(node)
        self._add_front(node)
        return
    # if len(self.map) >= self.capacity:      # <- removed
    #     lru_node = self.tail.prev
    #     self._remove(lru_node)
    #     del self.map[lru_node.key]
    node = Node(key, value)
    self.map[key] = node
    self._add_front(node)
```

```
after a,b,c: ['c', 'b', 'a']
after put(d): ['d', 'c', 'b', 'a']
```

No crash, no error — which is exactly what makes this failure
dangerous. The cache silently stops being size-limited at all: it's now
an ordinary unbounded dict with extra bookkeeping, growing forever, in
exactly the kind of long-running server process an LRU cache exists to
protect from running out of memory.

## Exercises

- Add a `__len__` method returning `len(self.map)`, and confirm it
  never exceeds `self.capacity` no matter how many `put` calls run.
- Add an `LFU` (least-*frequently*-used, not least-recently) variant:
  track an access *count* per key instead of recency order, and evict
  the lowest count instead of the tail node. Notice this needs a
  different tiebreaker strategy when two keys have equal counts —
  worth researching before implementing.
- Wrap a slow function (anything with an artificial `time.sleep(0.5)`
  inside it) with an `LRUCache`-backed memoizer, and time calling it
  with the same argument twice — confirm the second call is
  effectively instant.
- Research what Python's own `functools.lru_cache` decorator does
  differently or the same as the class built here.

## Definition of Done

- [ ] `LRUCache.get` and `.put` implemented and run, matching every
      trace above, including the update-doesn't-evict case.
- [ ] The eviction trace (`a, b, c` inserted, `a` accessed, `d`
      inserted, `b` evicted) reproduced on your own machine, confirmed
      by a real `get("b")` returning `-1` afterward.
- [ ] The eviction-removed failure actually run, confirming the cache
      silently grows past capacity rather than crashing.
- [ ] Can explain out loud, without looking at the code, why `get` has
      to move a node to the front even on a successful read, not just
      on write.
- [ ] Committed, with a message explaining *why* — e.g. `"LRU cache:
      O(1) get/put by pairing a hash map for lookup with a sentinel
      doubly linked list for recency order"` — not `"add
      lru_cache.py"`.
