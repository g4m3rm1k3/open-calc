# Lesson 71: Relationships That Storage Alone Can't Hold — Trees, Graphs, and Traversal

**What you will build:** a from-scratch binary search tree (`insert`,
`in_order`) and a from-scratch graph (`add_edge`, `dfs`, `bfs`,
`shortest_path`). The working feature is two structures that can answer
questions a flat list or a hash table can't. The transferable problem:
some data isn't just a bag of items — it has *relationships between*
items (parent/child, connected/not-connected) — and once relationships
exist, "visit everything" stops being a single obvious loop and becomes
a real design choice with more than one correct answer.

**What you need to know first:** Lesson 68 (stack, queue, linked list
from scratch) — this lesson reuses the same node-with-pointers shape a
linked list uses, extended from one `next` pointer to two (`left` and
`right`), and reuses the FIFO idea a queue provides, though this
lesson's project code reaches for Python's own `collections.deque`
rather than rebuilding a queue class a third time. Lesson 70 (hash
table from scratch) — membership testing against a `set`/`dict` in
this lesson (`if neighbor not in visited`) is exactly the O(1)
lookup-by-key idea Lesson 70 built by hand; Python's built-in `set` and
`dict` are hash tables under the hood, so that check is the payoff of
Lesson 70's work, not a new idea.

---

## Concept Unit: The Problem — Order Alone Doesn't Encode Relationships

### The Problem

A list stores things in sequence. A hash table (Lesson 70) stores
things by key, for fast lookup. Neither one stores *relationships
between* the things it holds. Some real data is fundamentally about
those relationships — an org chart, a file system's folders inside
folders, a road network — and asking "who reports to the VP of
Engineering?" or "can I get from town A to town E?" isn't a question a
flat structure can answer at all, no matter how it's searched.

### The New Code

```python
org = ["CEO", "VP Eng", "VP Sales", "Eng Manager", "Sales Manager", "Engineer 1", "Engineer 2"]
print(org)
print("Who reports to 'VP Eng'? The list alone can't answer that -- there's no relationship encoded, only order.")
```

### Run It

```
['CEO', 'VP Eng', 'VP Sales', 'Eng Manager', 'Sales Manager', 'Engineer 1', 'Engineer 2']
Who reports to 'VP Eng'? The list alone can't answer that -- there's no relationship encoded, only order.
```

This is discarded now — it exists only to make the gap concrete. The
rest of this lesson builds two different structures that close it, for
two different shapes of relationship: a **tree**, where each item has
exactly one parent (an org chart, a file system), and a **graph**,
where connections can go in any pattern at all, including cycles (a
road network, a social graph).

### CS Lens

A tree is really a graph with an extra rule (no cycles, one path
between any two nodes) — worth knowing that relationship going in,
even though this lesson builds them as two separate classes for
clarity rather than one generalized over the other.

---

## Concept Unit: The Tree Node — One Value, Two Children

### The Problem

Lesson 68's linked list gave each node one pointer forward (`next`).
To represent "one parent, up to two children" — the shape a binary
search tree needs — a node needs two pointers instead of one, and
nothing yet to decide *which* child a new value goes under.

### The New Code

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

root = TreeNode(50)
root.left = TreeNode(30)
root.right = TreeNode(70)

print(root.value, root.left.value, root.right.value)
print(root.left.left, root.left.right)   # both empty so far
```

### Run It

```
50 30 70
None None
```

This proves the shape works by hand — a `TreeNode` holding another
`TreeNode` in `.left`, a third in `.right`, both still empty at the
next level down. This is called a **binary tree node**: the same
attribute-holding-a-reference idea Lesson 68's linked list node used
for `.next`, extended to two named references instead of one.

### Discarded

This manual wiring (`root.left = TreeNode(30)`) is deleted now — a
real tree won't be built by hand, node by node, from outside the
class. The next unit builds an `insert` method that does this
correctly on its own, including *deciding* which side a new value
belongs on.

### CS Lens

A node holding references to other nodes of its own type — so the
structure is built entirely out of instances of itself — is called a
**recursive data structure**. Also recognized in: a folder containing
folders, an HTML element containing child elements, a JSON value that
can itself contain JSON values, Lesson 68's linked list (a node whose
`.next` is itself a node).

---

## Concept Unit: Binary Search Tree Insert

### The Problem

`TreeNode` can be wired by hand, but nothing decides *where* a new
value goes automatically, and nothing keeps the tree in any useful
order. A **binary search tree** adds exactly one rule that fixes both
problems at once: at every node, everything smaller lives in `.left`,
everything larger lives in `.right`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as Lesson 70's hash table.
- **Files affected:** `bst.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** the `TreeNode` class from the previous unit.

### The New Code

```python
    def insert(self, value):
        self.root = self._insert_recursive(self.root, value)

    def _insert_recursive(self, node, value):
        if node is None:
            return TreeNode(value)
        if value < node.value:
            node.left = self._insert_recursive(node.left, value)
        elif value > node.value:
            node.right = self._insert_recursive(node.right, value)
        return node
```

### The Updated Project

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, value):                                          # ← new
        self.root = self._insert_recursive(self.root, value)          # ← new

    def _insert_recursive(self, node, value):                          # ← new
        if node is None:                                                # ← new
            return TreeNode(value)                                      # ← new
        if value < node.value:                                          # ← new
            node.left = self._insert_recursive(node.left, value)        # ← new
        elif value > node.value:                                        # ← new
            node.right = self._insert_recursive(node.right, value)      # ← new
        return node                                                     # ← new
```

`BinarySearchTree` now goes from "a bare `TreeNode` shape" to a working
structure with a single public entry point, `insert`, that always
finds the one correct spot for a new value and never needs the caller
to touch `.left` or `.right` directly.

### Mechanical Walkthrough

- `self.root = self._insert_recursive(self.root, value)` — `insert` is
  the public method; it delegates to a private helper
  (`_insert_recursive`, leading underscore already an established
  convention) and *reassigns* `self.root` to whatever that helper
  returns. This detail matters: `insert` doesn't just call the helper
  for effect, it trusts the helper's return value as the new root —
  necessary for the very first insert, where `self.root` is `None` and
  needs to *become* a real node.
- `def _insert_recursive(self, node, value):` — **first appearance of
  a recursive method walking a tree.** `node` here means "the subtree
  we're currently considering," not necessarily the whole tree's root
  — on the outermost call it is the root, but every recursive call
  passes a smaller and smaller subtree.
- `if node is None: return TreeNode(value)` — the **base case**: an
  empty spot (`None`) is exactly where a new value belongs, so a brand
  new `TreeNode` is created and handed back.
- `if value < node.value: node.left = self._insert_recursive(node.left, value)`
  — the **recursive case** for smaller values: call the same function
  again, one level down, on `node.left` — and, critically, *assign the
  result back* to `node.left`. On every call except the one that hits
  the base case, this reassignment is a no-op (it just writes the same
  node back to itself) — but on the call that *does* hit the base
  case, this reassignment is how the brand-new `TreeNode` actually gets
  attached to its parent instead of being created and immediately
  discarded.
- `elif value > node.value: ...` — same idea, mirrored, for larger
  values landing in `.right`.
- `return node` — every call, base case or not, ends by returning
  `node` (or the newly built one) back up to whichever call is waiting
  for it — the mechanism that makes the reassignment one level up
  possible at all.

### Execution Trace

```python
tree = BinarySearchTree()
for v in [50, 30, 70, 20]:
    tree.insert(v)
```

1. `tree.insert(50)` — `self.root` is `None`, so `_insert_recursive(None, 50)`
   hits the base case immediately and returns `TreeNode(50)`;
   `self.root` becomes that node.
2. `tree.insert(30)` — `_insert_recursive(root, 30)`: `root` is not
   `None`, and `30 < 50`, so it recurses into `root.left`, which is
   `None` — base case fires, returns `TreeNode(30)` — assigned to
   `root.left`. The outer call then hits its own final `return node`
   (returning `root` itself, unchanged in identity, just with `.left`
   now filled in), which `insert` reassigns to `self.root` — a no-op
   in practice, since it's the same object, but the mechanism that
   *would* matter if this weren't the top-level call.
3. `tree.insert(70)` — same shape as step 2, mirrored: `70 > 50`
   recurses right, hits `None`, returns `TreeNode(70)`, assigned to
   `root.right`.
4. `tree.insert(20)` — `20 < 50` recurses left to the `30` node;
   `20 < 30` recurses left again, into `30`'s `.left`, which is `None`
   — base case fires, `TreeNode(20)` returned and assigned to `30`'s
   `.left`. Two levels of recursion this time, not one — the depth
   grows with how far down the tree the right spot turns out to be.

### Run It

```python
>>> from bst import BinarySearchTree
>>> tree = BinarySearchTree()
>>> for v in [50, 30, 70, 20, 40, 60, 80]:
...     tree.insert(v)
>>> tree.root.value
50
>>> tree.root.left.value
30
>>> tree.root.right.value
70
>>> tree.root.left.left.value
20
>>> tree.root.left.right.value
40
>>> tree.root.right.left.value
60
>>> tree.root.right.right.value
80
```

Every value landed exactly where the trace above predicts: smaller
values fan out to the left, larger to the right, at every level.

### CS Lens

Solving a problem by solving a smaller version of the *same* problem,
and trusting that smaller call to work correctly, is **recursion** —
already used structurally in the linked-list-shaped `TreeNode`, now
used for real, as the actual control flow. Also recognized in: a file
system's own recursive directory listing, JSON parsing (a JSON value
can contain JSON values), the Concept Isolation Rule this very
curriculum's schema uses on itself when a concept contains a smaller
instance of a concept already taught.

### SE Lens

The alternative to recursion here is an explicit loop carrying its own
stack of "nodes still to check" — strictly possible, and sometimes
preferred in languages or situations where deep recursion risks a
stack overflow (Python's default recursion limit is a few thousand
frames; a badly unbalanced tree of a million sorted-in-order inserts
would hit it). Recursion is chosen here because it matches the
problem's own recursive shape almost exactly, at the real cost of that
depth limit — a tradeoff worth knowing, not a free choice.

---

## Concept Unit: In-Order Traversal

### The Problem

Values are stored, correctly positioned — but nothing yet reads them
back out. A binary search tree's whole value proposition is that
reading them out in the right order recovers sorted data, for free,
with no separate sort step.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `bst.py`.
- **Change type:** add.
- **Location:** inside `BinarySearchTree`, immediately after `insert`
  and `_insert_recursive`.
- **Dependencies:** `insert` (something to traverse).

### The New Code

```python
    def in_order(self):
        result = []
        self._in_order_recursive(self.root, result)
        return result

    def _in_order_recursive(self, node, result):
        if node is None:
            return
        self._in_order_recursive(node.left, result)
        result.append(node.value)
        self._in_order_recursive(node.right, result)
```

### The Updated Project

```python
class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, value):
        self.root = self._insert_recursive(self.root, value)

    def _insert_recursive(self, node, value):
        if node is None:
            return TreeNode(value)
        if value < node.value:
            node.left = self._insert_recursive(node.left, value)
        elif value > node.value:
            node.right = self._insert_recursive(node.right, value)
        return node

    def in_order(self):                                              # ← new
        result = []                                                    # ← new
        self._in_order_recursive(self.root, result)                    # ← new
        return result                                                   # ← new

    def _in_order_recursive(self, node, result):                       # ← new
        if node is None:                                                # ← new
            return                                                       # ← new
        self._in_order_recursive(node.left, result)                     # ← new
        result.append(node.value)                                        # ← new
        self._in_order_recursive(node.right, result)                     # ← new
```

`BinarySearchTree` is now a complete write-then-read pair: `insert`
places values according to the left-smaller, right-larger rule;
`in_order` reads them back by trusting that same rule at every node.

### Mechanical Walkthrough

- `result = []` then `self._in_order_recursive(self.root, result)` —
  **first appearance of a pattern**: rather than each recursive call
  returning and concatenating lists (which works but copies data
  repeatedly), a single mutable `result` list is created once and
  passed down through every recursive call, which all append into the
  *same* list. `in_order` itself never touches `result` directly after
  creating it — it just hands it off and returns it once recursion is
  done.
- `if node is None: return` — base case, already established from the
  `insert` unit: an empty subtree contributes nothing, so the function
  returns immediately with no side effect.
- `self._in_order_recursive(node.left, result)` — recurse into the
  left subtree *first*, before doing anything with `node.value` — this
  ordering is the entire trick, not incidental.
- `result.append(node.value)` — only after the entire left subtree has
  been fully visited does this node's own value get appended.
- `self._in_order_recursive(node.right, result)` — then the right
  subtree, same recursive call, same shared `result`.

### Execution Trace

Tree from the previous unit: `50` at root, `30`/`70` as children,
`20`/`40` under `30`, `60`/`80` under `70`.

```python
tree.in_order()
```

1. `_in_order_recursive(50, result)` — not `None`; recurses left into
   `30` *before* touching `50` at all.
2. `_in_order_recursive(30, result)` — not `None`; recurses left into
   `20` before touching `30`.
3. `_in_order_recursive(20, result)` — not `None`; recurses left into
   `None` (base case, nothing happens), *then* appends `20` — first
   value ever added, because `20` has no left subtree to delay it
   further — then recurses right into `None` (nothing happens).
4. Back in step 2's frame: `20`'s subtree is done, so *now* `30` gets
   appended — `result = [20, 30]` — then recurses right into `40`,
   which has no children, so `40` appends immediately: `result = [20,
   30, 40]`.
5. Back in step 1's frame: the entire left subtree of `50` (`20, 30,
   40`) is done, so *now* `50` appends: `result = [20, 30, 40, 50]` —
   then recurses right into `70`, which by the same left-then-self-then-right
   logic appends `60`, then `70`, then `80`: final `result = [20, 30,
   40, 50, 60, 70, 80]`.

The value that recurses left the most times ends up first; the node
that recurses right the most ends up last — which is exactly why
"leftmost value first" produces sorted order, not a coincidence of
this particular tree's shape.

### Run It

```
Inserted order: [50, 30, 70, 20, 40, 60, 80]
In-order output: [20, 30, 40, 50, 60, 70, 80]
```

Real output, matching the trace exactly: seven values, inserted in a
scrambled order, come back out fully sorted — with no sort step
anywhere in `in_order`'s own code.

### CS Lens

Recovering sorted order purely from *where* things were placed, rather
than by comparing and rearranging afterward, is the core payoff of
keeping a binary search tree's ordering invariant true on every
insert. Also recognized in: a database B-tree index (the real-world,
disk-optimized cousin of this exact idea), autocomplete structures
that keep candidates pre-sorted, priority queues that maintain order
as items are added rather than sorting on demand.

---

## Concept Unit: The Graph — Adjacency List and Depth-First Search

### The Problem

A tree assumes one parent per node and no cycles — true for an org
chart, false for a road network, where any town might connect to any
other, in any pattern, including loops back to where you started. A
different structure is needed: one that doesn't assume a hierarchy at
all, just a set of connections.

### The New Code

```python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C", "E"],
    "E": ["D"],
}

print(graph["A"])   # towns directly reachable from A
print(graph["D"])   # towns directly reachable from D
```

### Run It

```
['B', 'C']
['B', 'C', 'E']
```

This is called an **adjacency list**: a mapping from each node to the
list of nodes it directly connects to. Discarded now as a hand-written
literal — the real `Graph` class below builds this same shape
programmatically, via `add_edge`, instead of requiring it typed out by
hand.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `graph.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** none beyond the standard library.

### The New Code

```python
class Graph:
    def __init__(self):
        self.adjacency = {}

    def add_edge(self, a, b):
        self.adjacency.setdefault(a, []).append(b)
        self.adjacency.setdefault(b, []).append(a)

    def dfs(self, start):
        visited = set()
        result = []
        self._dfs_recursive(start, visited, result)
        return result

    def _dfs_recursive(self, node, visited, result):
        if node in visited:
            return
        visited.add(node)
        result.append(node)
        for neighbor in self.adjacency[node]:
            self._dfs_recursive(neighbor, visited, result)
```

### Run It

```python
>>> from graph import Graph
>>> g = Graph()
>>> for a, b in [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D"), ("D", "E")]:
...     g.add_edge(a, b)
>>> g.adjacency
{'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A', 'D'], 'D': ['B', 'C', 'E'], 'E': ['D']}
>>> g.dfs("A")
['A', 'B', 'D', 'C', 'E']
```

### Mechanical Walkthrough

- `self.adjacency = {}` — an empty `dict`, already established, used
  here as the adjacency list's backing storage.
- `self.adjacency.setdefault(a, []).append(b)` — **first appearance of
  `dict.setdefault`.** It looks up key `a`; if `a` is already present,
  it returns the existing value unchanged; if `a` is *not* present, it
  first inserts `a` mapped to the given default (`[]`) and *then*
  returns that newly-inserted empty list — either way, the expression
  evaluates to "the list at key `a`, guaranteed to exist," which
  `.append(b)` can then safely call without a separate
  check-then-create step. Called twice, once for each direction —
  `a`'s list gets `b` appended, `b`'s list gets `a` appended — because
  this graph is **undirected**: a connection between A and B means A
  can reach B *and* B can reach A.
- `visited = set()` — a `set`, first use in this project. Membership
  testing (`in`) against a `set` is the same O(1) hash-based lookup
  Lesson 70 built by hand for `HashTable`; Python's `set` is a hash
  table holding only keys, no values.
- `def _dfs_recursive(self, node, visited, result):` reappears the
  recursive-helper-with-accumulator shape from the BST's
  `_in_order_recursive` — a hard concept reappearing, not new.
- `if node in visited: return` — **first appearance of the cycle
  guard.** A graph, unlike a tree, can lead back to a node already
  visited (A connects to B, B connects back to A) — without this
  check, `_dfs_recursive` would call itself on the same nodes forever.
  This line is what makes traversing a graph with cycles safe at all.
- `visited.add(node)` then `result.append(node)` — mark this node
  visited *before* recursing into its neighbors (not after) — this
  ordering matters: if a neighbor's own recursive call leads back to
  this node before this line ran, the cycle guard above wouldn't catch
  it yet.
- `for neighbor in self.adjacency[node]: self._dfs_recursive(neighbor, visited, result)`
  — visit every direct neighbor, recursively, each call sharing the
  same `visited` set and `result` list (same accumulator-sharing
  pattern as `in_order`).

### Run It — DFS Traced

Graph: A↔B, A↔C, B↔D, C↔D, D↔E (five edges, five towns).

```
DFS from A: ['A', 'B', 'D', 'C', 'E']
```

Real output: starting at A, DFS commits fully to one direction before
backing up — A, then A's first neighbor B, then B's first *unvisited*
neighbor D, then D's first unvisited neighbor (B is already visited,
so) C, then C has no unvisited neighbors left, backing up to D's
remaining neighbor E. The shape is "go deep before going wide" — the
namesake of **depth-first search**.

### CS Lens

Recursing into the first branch fully before trying the next is the
same strategy as: solving a maze by always taking the first available
turn and backtracking only on a dead end, a compiler's recursive-descent
parser fully resolving one expression before moving to the next token,
a file system's recursive folder walk finishing one subfolder
completely before moving to its sibling.

---

## Concept Unit: Breadth-First Search — Level by Level

### The Problem

DFS answers "is there *a* path?" — it doesn't answer "what's the
*shortest* path?", because committing fully down one branch before
trying another can easily wander far past a short route that a
different branch would have found immediately.

### The New Code

```python
    def bfs(self, start):
        visited = {start}
        result = []
        queue = deque([start])
        while queue:
            node = queue.popleft()
            result.append(node)
            for neighbor in self.adjacency[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return result
```

Before this method makes sense, its one genuinely new piece needs its
own throwaway lab.

```python
from collections import deque

q = deque()
q.append("A")
q.append("B")
q.append("C")
print(list(q))
print(q.popleft())   # removes and returns the FRONT, not the back
print(list(q))
```

```
['A', 'B', 'C']
A
['B', 'C']
```

This is called a **`deque`** (double-ended queue), imported from
Python's `collections` module. `q.popleft()` removes and returns the
item at the *front* — proven above: after appending `A`, `B`, `C` in
that order, `popleft()` returns `A`, the first one in, not `C`, the
most recent. This is the same **FIFO** (first-in, first-out) behavior
Lesson 68 built a queue class to provide from scratch; this project
reaches for the standard library's version instead of rebuilding a
third custom class, but the underlying discipline — the *first* item
enqueued is the *first* one processed — is exactly the concept Lesson
68 already taught, just under new syntax. Discarded now; `q` itself
doesn't appear in the project again, but `deque` does.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, reusing the standard library's `deque` rather than
  building a queue a third time.
- **Files affected:** `graph.py`.
- **Change type:** add; also requires `from collections import deque`
  added at the top of the file.
- **Location:** inside `Graph`, immediately after `dfs` and
  `_dfs_recursive`.
- **Dependencies:** `add_edge` (something to traverse).

### The Updated Project

```python
from collections import deque


class Graph:
    def __init__(self):
        self.adjacency = {}

    def add_edge(self, a, b):
        self.adjacency.setdefault(a, []).append(b)
        self.adjacency.setdefault(b, []).append(a)

    def dfs(self, start):
        visited = set()
        result = []
        self._dfs_recursive(start, visited, result)
        return result

    def _dfs_recursive(self, node, visited, result):
        if node in visited:
            return
        visited.add(node)
        result.append(node)
        for neighbor in self.adjacency[node]:
            self._dfs_recursive(neighbor, visited, result)

    def bfs(self, start):                                             # ← new
        visited = {start}                                               # ← new
        result = []                                                      # ← new
        queue = deque([start])                                           # ← new
        while queue:                                                      # ← new
            node = queue.popleft()                                         # ← new
            result.append(node)                                             # ← new
            for neighbor in self.adjacency[node]:                            # ← new
                if neighbor not in visited:                                   # ← new
                    visited.add(neighbor)                                      # ← new
                    queue.append(neighbor)                                      # ← new
        return result                                                            # ← new
```

`Graph` now offers two different traversal strategies over the exact
same `adjacency` data — `dfs` and `bfs` never disagree about which
nodes are reachable, only about the *order* they're visited in, which
is the entire point of building both.

### Mechanical Walkthrough

- `visited = {start}` — **first appearance of set literal syntax**
  (`{...}` building a `set` when it holds bare values, as opposed to
  `{key: value}` building a `dict`) — here, a one-element set
  containing the start node, marked visited immediately rather than
  when it's later dequeued.
- `queue = deque([start])` — building a `deque` pre-loaded with one
  item, using the lab's construct for real, on the actual start node.
- `while queue:` — **first appearance of a `deque` (or any container)
  used directly as a truthiness check.** An empty `deque` is falsy, a
  non-empty one truthy — so this loop runs exactly as long as there
  are still nodes waiting to be processed, with no separate length
  check needed.
- `node = queue.popleft()` — reappearing from the lab, for real this
  time: takes the *oldest* item still in the queue, not the newest.
- `result.append(node)` — record this node as visited-and-processed.
  Notably different from `dfs`, where `visited.add` and
  `result.append` happen together, at the top of the recursive call;
  here they're split — a node is marked `visited` (added to the set)
  the moment it's *discovered* (added to the queue), but only
  `append`ed to `result` once it's actually *processed* (popped).
- `for neighbor in self.adjacency[node]: if neighbor not in visited:`
  — reappearing set-membership check from `dfs`'s cycle guard, same
  reasoning: a graph with cycles must not revisit.
- `visited.add(neighbor); queue.append(neighbor)` — mark discovered
  *and* enqueue for later processing, together — this is what makes it
  breadth-first: every neighbor of the current node gets queued before
  any of *their* neighbors get a chance to.

### Run It — BFS Traced, Compared to DFS

Same graph as before: A↔B, A↔C, B↔D, C↔D, D↔E.

```
DFS from A: ['A', 'B', 'D', 'C', 'E']
BFS from A: ['A', 'B', 'C', 'D', 'E']
```

Real output, same graph, same start node, genuinely different order:
BFS visits A, then *both* of A's direct neighbors (B, C) before going
any further, then D (one hop from both B and C), then E last. This is
called visiting **level by level** — everything one hop away, before
anything two hops away — and it's exactly why BFS, not DFS, is the
right tool when the actual question is "what's the *shortest* route,"
built next.

### CS Lens

Exhausting everything at the current distance before moving further
out is the same strategy as: a search-and-rescue team fanning out ring
by ring from a last-known point rather than committing to one
direction, a network protocol flooding a packet to all directly
connected routers before it goes any further, ripple spread on water —
the near ring fully forms before the next ring starts.

### SE Lens

DFS uses the *call stack itself* as its "what's left to explore"
structure (implicit, via recursion); BFS uses an explicit `deque`.
That's not a stylistic choice — it's forced by what each algorithm
needs: DFS needs to remember "go back to where I branched," which a
call stack does automatically on `return`; BFS needs to process
strictly oldest-discovered-first, which only an explicit FIFO
structure guarantees. Trying to write BFS recursively, the way `dfs`
is written, would fight the call stack's own LIFO order instead of
working with it.

---

## Concept Unit: Shortest Path — BFS with Parent Tracking

### The Problem

`bfs` above visits every reachable node in the right *order* to
guarantee shortest-path-first discovery, but throws away the one thing
that would let it actually report a path: which node discovered which.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `graph.py`.
- **Change type:** add.
- **Location:** inside `Graph`, immediately after `bfs`.
- **Dependencies:** the same `deque` import already present from the
  `bfs` unit.

### The New Code

```python
    def shortest_path(self, start, goal):
        visited = {start}
        parent = {start: None}
        queue = deque([start])
        while queue:
            node = queue.popleft()
            if node == goal:
                path = []
                while node is not None:
                    path.append(node)
                    node = parent[node]
                path.reverse()
                return path
            for neighbor in self.adjacency[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = node
                    queue.append(neighbor)
        return None
```

### The Updated Project

```python
class Graph:
    def __init__(self):
        self.adjacency = {}

    def add_edge(self, a, b):
        self.adjacency.setdefault(a, []).append(b)
        self.adjacency.setdefault(b, []).append(a)

    def dfs(self, start):
        visited = set()
        result = []
        self._dfs_recursive(start, visited, result)
        return result

    def _dfs_recursive(self, node, visited, result):
        if node in visited:
            return
        visited.add(node)
        result.append(node)
        for neighbor in self.adjacency[node]:
            self._dfs_recursive(neighbor, visited, result)

    def bfs(self, start):
        visited = {start}
        result = []
        queue = deque([start])
        while queue:
            node = queue.popleft()
            result.append(node)
            for neighbor in self.adjacency[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return result

    def shortest_path(self, start, goal):                              # ← new
        visited = {start}                                                # ← new
        parent = {start: None}                                            # ← new
        queue = deque([start])                                             # ← new
        while queue:                                                        # ← new
            node = queue.popleft()                                           # ← new
            if node == goal:                                                  # ← new
                path = []                                                      # ← new
                while node is not None:                                        # ← new
                    path.append(node)                                           # ← new
                    node = parent[node]                                          # ← new
                path.reverse()                                                    # ← new
                return path                                                        # ← new
            for neighbor in self.adjacency[node]:                                   # ← new
                if neighbor not in visited:                                          # ← new
                    visited.add(neighbor)                                             # ← new
                    parent[neighbor] = node                                            # ← new
                    queue.append(neighbor)                                              # ← new
        return None                                                                      # ← new
```

`Graph` now has three traversal methods sharing the same `adjacency`
data: `dfs` for "is anything reachable, in depth-first order," `bfs`
for "visit everything in shortest-distance order," and
`shortest_path`, which reuses `bfs`'s exact traversal order but adds
memory of *how* each node was reached, so it can answer "what's the
actual route" — not just "is it reachable."

### Mechanical Walkthrough

- `visited = {start}`, `queue = deque([start])`, the `while queue:`
  loop, `queue.popleft()`, and the `if neighbor not in visited: ...
  queue.append(neighbor)` block — all **hard concepts reappearing**
  from `bfs`, unchanged in mechanism.
- `parent = {start: None}` — **first appearance in this project of a
  dict used to record traversal history rather than to look up
  application data.** `parent[node]` will hold "which node discovered
  `node`" — the start node's own parent is set to `None`, since
  nothing discovered it; it was the beginning.
- `if node == goal:` — **first appearance of an early-exit check
  inside a BFS loop.** `bfs` above always drains the entire queue,
  visiting everything reachable; `shortest_path` stops the instant the
  goal is dequeued — because BFS guarantees the goal is dequeued via
  the shortest possible route, there's no reason to keep searching
  once it's found.
- `parent[neighbor] = node` — added alongside `bfs`'s existing
  `visited.add`/`queue.append` pair: every time a node is newly
  discovered, record *who* discovered it, not just *that* it was
  discovered.
- `path = []`, then `while node is not None: path.append(node); node = parent[node]`
  — **first appearance of walking a chain of recorded parents backward
  to reconstruct a route.** Starting from `goal` (the loop's `node`
  still holds it, since the `if node == goal` check just matched),
  repeatedly step to `parent[node]` and append each node along the
  way, until `parent` returns `None` — the start node's own marker —
  which ends the loop.
- `path.reverse()` — the walk above necessarily builds the path
  *backward* (goal first, start last), since it follows parent links
  from the end toward the beginning; reversing in place restores
  start-to-goal reading order.
- `return None` — reached only if the `while queue:` loop drains
  completely without the `if node == goal:` branch ever firing — the
  goal is genuinely unreachable from `start`.

### Execution Trace

Graph: A↔B, A↔C, B↔D, C↔D, D↔E, E↔F, C↔F (seven edges).
`shortest_path("A", "E")`:

1. `queue=[A]`, `visited={A}`, `parent={A: None}`. Pop `A`; not goal
   (`E`). Neighbors `[B, C]`: both new — `parent[B]=A`, `parent[C]=A`,
   both enqueued. `queue=[B, C]`.
2. Pop `B`; not goal. Neighbors `[A, D]`: `A` visited, skip; `D` new —
   `parent[D]=B`, enqueued. `queue=[C, D]`.
3. Pop `C`; not goal. Neighbors `[A, D, F]`: `A`, `D` already visited
   (`D` was just claimed by `B` in the previous step) — skip both;
   `F` new — `parent[F]=C`, enqueued. `queue=[D, F]`.
4. Pop `D`; not goal. Neighbors `[B, C, E]`: `B`, `C` visited, skip;
   `E` new — `parent[E]=D`, enqueued. `queue=[F, E]`.
5. Pop `F`; not goal. Neighbors `[E, C]`: both already visited (`E`
   just claimed by `D`), nothing new added. `queue=[E]`.
6. Pop `E`; **matches goal.** Reconstruct: `path=[E]`, `node =
   parent[E] = D` → `path=[E, D]`, `node = parent[D] = B` →
   `path=[E, D, B]`, `node = parent[B] = A` → `path=[E, D, B, A]`,
   `node = parent[A] = None` → loop ends. Reverse: `[A, B, D, E]`.

### Run It

```python
>>> from graph import Graph
>>> g = Graph()
>>> for a, b in [("A","B"),("A","C"),("B","D"),("C","D"),("D","E"),("E","F"),("C","F")]:
...     g.add_edge(a, b)
>>> g.shortest_path("A", "E")
['A', 'B', 'D', 'E']
>>> g.shortest_path("A", "F")
['A', 'C', 'F']
>>> g.shortest_path("A", "Z")
None
```

Real output, matching the trace: `A` to `E` returns the actual
four-node route computed step by step above. `A` to `F` returns a
*shorter* route (`A, C, F` — two hops) than the one BFS would've found
going through `E` (four hops) — confirming BFS finds the true shortest
path, not just some path. `A` to `Z` (a node that was never added via
`add_edge`) returns `None` — cleanly signaling "unreachable" rather
than raising a `KeyError` on a missing key.

### CS Lens

Recording "who discovered me" during a search, then walking that trail
backward to recover the actual route, is the core idea behind **path
reconstruction**, used identically in Dijkstra's algorithm (shortest
path with weighted edges), A* pathfinding (games and mapping software),
and a debugger's own call stack (each frame "discovered" by the one
that called it, walked backward to build a stack trace).

### SE Lens

`shortest_path` duplicates almost all of `bfs`'s own logic rather than
calling `bfs` and post-processing its result — a real, deliberate
tradeoff: `bfs`'s `result` list only records *that* a node was visited
and in what order, not *who* discovered it, so there's no way to
reconstruct a path from `bfs`'s output alone without re-running the
traversal with `parent`-tracking added. The alternative — always
track `parent` inside `bfs` itself, even when only traversal order is
wanted — would mean paying that bookkeeping cost on every call, even
the ones that never need a path. Keeping them separate costs code
duplication; merging them would cost unnecessary work on the common
case. Neither is free.

---

## Connect the Pieces

One full trace across both structures built in this lesson, back to
back, showing they solve genuinely different problems even though both
started from "a node holding references to other nodes":

```python
from bst import BinarySearchTree
from graph import Graph

tree = BinarySearchTree()
for v in [50, 30, 70, 20, 40, 60, 80]:
    tree.insert(v)
print(tree.in_order())                  # -> [20, 30, 40, 50, 60, 70, 80]

g = Graph()
for a, b in [("A","B"),("A","C"),("B","D"),("C","D"),("D","E"),("E","F"),("C","F")]:
    g.add_edge(a, b)
print(g.dfs("A"))                        # -> ['A', 'B', 'D', 'C', 'F', 'E']  (order depends on adjacency-list order)
print(g.bfs("A"))                        # -> level-by-level from A
print(g.shortest_path("A", "F"))         # -> ['A', 'C', 'F']
```

The tree answers "what's the sorted order," using one insert rule and
one traversal order, because a tree assumes exactly one path to
everything. The graph answers three different questions — "can I reach
it at all" (`dfs`), "what order does everything become reachable in"
(`bfs`), and "what's the actual shortest route" (`shortest_path`) —
because a graph makes no such assumption, and the three methods exist
precisely because "traverse everything" stopped being one obvious
operation the moment cycles and multiple paths became possible.

## What Breaks Without This

Delete the cycle guard from `_dfs_recursive` — the `if node in
visited: return` line — and run it on the same graph:

```python
def _dfs_recursive(self, node, visited, result):
    # if node in visited:      # <- removed
    #     return
    visited.add(node)
    result.append(node)
    for neighbor in self.adjacency[node]:
        self._dfs_recursive(neighbor, visited, result)
```

```
RecursionError: maximum recursion depth exceeded
```

A confirmed to reach B, B confirmed to reach A right back, forever —
with no check stopping it, the recursion never bottoms out, because
this graph (like almost any real one) has a cycle. The guard isn't
defensive boilerplate; it's the one line that makes traversing a graph
different from — and safe, where — traversing a tree.

## Exercises

- Add a `height()` method to `BinarySearchTree` that returns the
  number of levels in the tree (an empty tree has height 0).
- Add a `contains(value)` method to `BinarySearchTree` using the same
  left-smaller/right-larger rule `insert` uses, without traversing the
  whole tree.
- Modify `dfs` to be iterative instead of recursive, using an explicit
  stack (a plain Python list with `.append`/`.pop`) instead of the
  call stack — confirm it produces the same order as the recursive
  version on the same graph.
- Add weights to `Graph`'s edges (`add_edge(a, b, weight=1)`) and
  research what changes about `shortest_path` once edges aren't all
  equal length — this is the seam where Dijkstra's algorithm begins.

## Definition of Done

- [ ] `BinarySearchTree.insert` and `.in_order` implemented and run,
      producing sorted output from unsorted insert order, matching the
      trace above.
- [ ] `Graph.add_edge`, `.dfs`, `.bfs`, and `.shortest_path` all
      implemented and run on the same seven-node graph used throughout
      this lesson.
- [ ] DFS and BFS run on the *same* graph from the *same* start node,
      with the differing output pasted side by side — confirming the
      order genuinely differs, not just reading that it should.
- [ ] `shortest_path` confirmed to find a *shorter* route than the one
      `bfs`'s visit order alone would suggest (the `A → F` case above),
      and confirmed to return `None`, not raise, for an unreachable
      goal.
- [ ] The cycle-guard removal from "What Breaks Without This" actually
      triggered on your own machine, not just read about.
- [ ] Committed, with a message explaining *why* — e.g. `"Binary
      search tree and graph traversal: BFS for shortest path, DFS for
      reachability, and why a graph needs a cycle guard a tree
      doesn't"` — not `"add bst.py and graph.py"`.
