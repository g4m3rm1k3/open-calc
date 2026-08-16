# Lesson 57: Transformation Hierarchies

**What you will build:** `find_node` and `get_world_transform` — a way
to organize any number of rigid transforms into a **transformation
hierarchy**, and compute any one part's position relative to a single
shared root, no matter how many parent levels separate them. Lesson 55's
own closing already composed a two-stage chain — tool relative to
fixture, fixture relative to table — by hand, with one direct
`multiply_matrices4` call. That doesn't scale: a real CAD assembly or a
robot's own joint chain can have many more levels, and hard-coding one
multiplication per level, rewritten every time a new level is added, is
exactly the kind of repetition this curriculum has avoided since its
first `for` loop. This lesson builds one function that walks a chain of
*any* depth, and its own closing extends this curriculum's fixture
scenario with a genuine fourth level — a machine, sitting above the
table — reusing the machine-level mention this curriculum's own handoff
notes have carried since Lesson 14–16 without ever building it until
now.

**What you need to know first:** Lesson 55's own `tool_to_fixture`/
`fixture_to_table` transforms and their already-verified composed result
— this lesson's own opening unit reproduces that exact result as its
first real check. Lesson 56's `multiply_matrices4` and its own
confirmed right-argument-applies-first composition order. Lesson 38's
`while` loop, reused here to walk a chain of unknown length. Lesson 33's
`list`-of-tuples representation pattern (a polygon as a list of vertex
tuples), reused here for a hierarchy as a list of node tuples.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–56.

**Terms introduced in this lesson:**

- **local transform** and **world transform** — a node's **local
  transform** is its rigid transform relative to its own immediate
  parent only (the same thing Lesson 55's `tool_to_fixture` already
  was: the tool's position *relative to the fixture*, nothing further
  up the chain). A node's **world transform** is its position relative
  to the one shared root of the entire hierarchy, found by composing
  its own local transform with every ancestor's local transform in
  turn. They exist as two separate terms because a real hierarchy needs
  both: local transforms are what a CAD assembly or robot design
  actually specifies by hand (each part positioned relative to whatever
  it's directly attached to), while world transforms are what's
  actually needed to answer "where is this thing, really" — this
  lesson's own `get_world_transform` is the function that converts one
  into the other.
- **transformation hierarchy** — a collection of nodes, each with its
  own local transform and a reference to its parent (or no parent at
  all, for the single root), used to organize any number of rigid
  transforms into one connected structure. It exists because a flat
  list of independent transforms has no way to express "this thing
  moves when its parent moves" — the actual relationship a real
  fixture, table, and machine have with each other.

**Objects and methods used:**

None new.

---

## Concept Unit: Representing a Hierarchy — Parent Pointers by Name

### The Problem

Lesson 55's own closing built exactly two rigid transforms —
`tool_to_fixture` and `fixture_to_table` — and combined them with one
direct `multiply_matrices4` call, because there were only two levels to
combine. A real hierarchy needs a representation that works for *any*
number of levels without the calling code changing shape every time a
level is added or removed — the same scalability problem `for`/`while`
loops solved for repeated computation, now applied to a repeated
*structure* instead.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  representational choice, following the same "plain tuples and lists,
  no dedicated type" pattern this curriculum has used since Lesson 33's
  own polygon representation.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 56's `invert_rigid_transform`).
- **Change type:** add.
- **Location:** new section, `# ── L57: transformation hierarchies ──`.
- **Dependencies:** `build_rigid_transform` (Lesson 55).

### The New Code

```python
identity_r = ((1, 0, 0), (0, 1, 0), (0, 0, 1))
identity_t = build_rigid_transform(identity_r, (0, 0, 0))
fixture_to_table = build_rigid_transform(rotation_matrix_z(90), (50, 20, 15))
tool_to_fixture = build_rigid_transform(rotation_matrix_z(0), (1, 1, 1))

hierarchy = [
    ("table", identity_t, None),
    ("fixture", fixture_to_table, "table"),
    ("tool", tool_to_fixture, "fixture"),
]
```

### The Updated Project

A new, freestanding list — nothing surrounding it yet to show placed
inside, per the schema's own stated exception. Reuses `fixture_to_table`
and `tool_to_fixture`'s own exact numbers from Lesson 55's closing per
this curriculum's own established convention of reusing exact numbers
when extending an existing scenario.

### Mechanical Walkthrough

- `identity_t = build_rigid_transform(identity_r, (0, 0, 0))` — **(b)
  hard concept reappearing** (Lesson 55/56) — this is `table`'s own
  local transform: the identity, because `table` is this hierarchy's
  own root and has no parent to be positioned relative to.
- `("table", identity_t, None)` — **(a) first appearance**, as a
  pattern: a **node**, a 3-tuple of `(name, local_transform,
  parent_name)`. `None` here means "no parent" — this curriculum's
  first use of `None` to represent the deliberate *absence* of
  something, rather than a zero or empty value standing in for it.
- `("fixture", fixture_to_table, "table")` — **(b) hard concept
  reappearing** as a repeated instance of the same node pattern just
  introduced — `fixture`'s own parent is named `"table"`, a plain
  string matching the first element of the `table` node above it, not
  a direct reference to that tuple. This is the **local transform**
  Terms Introduced entry from this lesson's own Header, made concrete:
  `fixture_to_table` describes *only* the fixture's position relative
  to the table, nothing about the table's own position in turn.
- `[...]` (the `hierarchy` list itself) — **(b) hard concept
  reappearing** (Lesson 33's own list-of-tuples pattern) — a
  **transformation hierarchy**, this lesson's own Header term, made
  concrete: three nodes, connected only by each one's own
  `parent_name` string, not by any special container type.

### CS Lens

Looking a node up by matching a plain string against every other node's
own name, rather than holding a direct reference to the parent tuple
itself, is a form of **indirection** — the same idea, at a smaller
scale, behind Lesson 21–25's own `line_point`/`line_direction`
parametric representation (a point on a line described *indirectly*, by
a formula and a parameter `t`, rather than stored directly). Recognized
well beyond this one hierarchy:

```
Also recognized in: foreign keys in a relational database (a row
referencing another row by its ID, not by holding a copy of it),
DOM element IDs referenced by CSS selectors, any file system's own
directory tree (a file's path names its parent directory by string,
not by embedding the directory itself)
```

### Connecting Sentence

Three nodes now exist, connected only by name — the next unit builds
the function that actually follows those names back up to the root.

---

## Concept Unit: Walking the Chain — `get_world_transform`

### The Problem

`hierarchy`'s own nodes each know only their *local* transform — their
position relative to their immediate parent. Finding `tool`'s own
**world transform** (per this lesson's own Header term: its position
relative to the shared root, `table`) means following `tool`'s own
parent chain — `tool` → `fixture` → `table` — collecting every local
transform along the way, then combining them in the right order.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `hierarchy`'s own definition in the same
  section.
- **Dependencies:** `multiply_matrices4` (Lesson 55).

### The New Code

```python
def find_node(hierarchy, name):
    for node in hierarchy:
        if node[0] == name:
            return node
    return None


def get_world_transform(hierarchy, node_name):
    chain = []
    current_name = node_name
    while current_name is not None:
        node = find_node(hierarchy, current_name)
        chain.append(node[1])
        current_name = node[2]
    result = chain[len(chain) - 1]
    i = len(chain) - 2
    while i >= 0:
        result = multiply_matrices4(result, chain[i])
        i = i - 1
    return result
```

### The Updated Project

Both brand-new, freestanding functions — nothing surrounding them yet
to show placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `find_node` and
`get_world_transform` directly after Lesson 56's own last function.

### Mechanical Walkthrough

- `for node in hierarchy: if node[0] == name: return node` — **(b) hard
  concept reappearing** (Lesson 27's own first real `for` loop, and
  Lesson 5's comparison operators) — a linear search, checking each
  node's own name in turn.
- `return None` (at the end of `find_node`) — **(b) hard concept
  reappearing**, the same explicit "nothing found" signal this unit's
  own hierarchy already used for a missing parent.
- `chain = []` — **(b) hard concept reappearing** (Lesson 38's own
  `list.append` pattern, empty list started before an unknown number of
  items get added).
- `current_name = node_name` — **(c) already basic.**
- `while current_name is not None:` — **(a) first appearance**, as a
  pattern: `is not None`, rather than `!= None` — Python's own
  recommended way to check specifically for the `None` value, distinct
  from checking whether something merely equals it (a distinction that
  doesn't matter for `None` specifically in ordinary use, but `is` is
  the idiomatic form this curriculum adopts here for the first time).
  The loop itself is Lesson 38's own already-established `while` shape,
  used because the chain's own length — however many parents deep a
  node sits — isn't known in advance, exactly the condition Lesson 38's
  own Repetition Rule entry already requires for reaching for `while`
  over `for`.
- `node = find_node(hierarchy, current_name)` — **(b) hard concept
  reappearing**, just defined above.
- `chain.append(node[1])` — **(b) hard concept reappearing** (Lesson
  38) — collects each node's own **local transform** (Header term),
  starting from `node_name` itself and walking upward.
- `current_name = node[2]` — **(a) first appearance**, as a pattern:
  this is the actual "walk up one level" step — replacing the current
  name with its own parent's name, so the next loop iteration looks up
  the *parent's* node instead. The loop naturally stops once
  `current_name` becomes `None` — the root's own `parent_name`, per
  this unit's own hierarchy definition above.
- `result = chain[len(chain) - 1]` — **(b) hard concept reappearing**
  (Lesson 33's own `len`/index pattern) — starts the composition from
  the *last* item appended, which is always the root's own local
  transform (the identity, in this lesson's own example), since the
  walk went from `node_name` upward and the root is wherever the walk
  stopped.
- `i = len(chain) - 2`, the second `while` loop, and
  `result = multiply_matrices4(result, chain[i])` — **(a) first
  appearance**, as a pattern: composing the chain from the root
  *downward* — each step multiplies the current `result` (everything
  above this level, already composed) by the next level down's own
  local transform. This matches Lesson 56's own confirmed composition
  order (`multiply_matrices4(A, B)` applies `B` first): starting from
  the root and repeatedly multiplying by the next child's local
  transform builds up exactly the same order Lesson 55's own manual
  `fixture_to_table` then `tool_to_fixture` composition already used.

### Real Verification

Confirm `get_world_transform` reproduces Lesson 55's own already-
verified two-level result exactly, before trusting it on anything new:

```python
tool_world = get_world_transform(hierarchy, "tool")
for row in tool_world:
    print("  ", row)
p_tool = (2, 0, 0)
result = apply_matrix4(tool_world, to_homogeneous_3d(p_tool))
print("apply to p_tool =", result)
```

Real output:

```
   (6.123233995736766e-17, -1.0, 0.0, 49.0)
   (1.0, 6.123233995736766e-17, 0.0, 21.0)
   (0.0, 0.0, 1.0, 16.0)
   (0.0, 0.0, 0.0, 1.0)
apply to p_tool = (49.0, 23.0, 16.0, 1.0)
```

`(49.0, 23.0, 16.0, 1.0)` — exactly Lesson 55's own closing result,
reached this time by walking a general chain instead of one hand-written
`multiply_matrices4` call. `get_world_transform` doesn't just look
correct on this one case; it reproduces a previously-verified answer
using a genuinely different, general-purpose route.

### Connecting Sentence

Two levels are confirmed correct — the closing below adds the real
fourth level this curriculum's own notes have referenced since Lesson
14–16 without ever building it.

---

## Closing

### Connect the Pieces

Extend `hierarchy` with a real fourth level: a `machine`, sitting above
`table`, offset by `(100, 0, 0)` in the machine's own coordinate frame —
the "fixture→table(→machine)" scenario this curriculum's own conventions
have named since Lesson 14–16, built for real for the first time:

```python
table_to_machine = build_rigid_transform(identity_r, (100, 0, 0))
hierarchy4 = [
    ("machine", identity_t, None),
    ("table", table_to_machine, "machine"),
    ("fixture", fixture_to_table, "table"),
    ("tool", tool_to_fixture, "fixture"),
]
tool_world_4 = get_world_transform(hierarchy4, "tool")
result_4 = apply_matrix4(tool_world_4, to_homogeneous_3d(p_tool))
print("4-level result =", result_4)
```

Real output:

```
4-level result = (149.0, 23.0, 16.0, 1.0)
```

Exactly the two-level result, `(49.0, 23.0, 16.0)`, shifted by the new
machine-level offset `(100, 0, 0)` — `y` and `z` completely unchanged,
`x` shifted by exactly `100`. Adding a fourth level required no change
at all to `get_world_transform` itself, only one new node in the list —
the same scalability `for`/`while` loops already gave ordinary
computation, now shown to hold for a hierarchy's own *depth* as well.

### What Breaks Without This

`get_world_transform`'s own second loop composes the chain in a
specific order — root first, child second, matching Lesson 56's own
confirmed `multiply_matrices4(A, B)` "applies `B` first" convention.
Reverse it — compose child-then-parent instead of parent-then-child —
using the same two transforms from this lesson's own two-level example:

```python
wrong_order = multiply_matrices4(tool_to_fixture, fixture_to_table)
wrong_result = apply_matrix4(wrong_order, to_homogeneous_3d(p_tool))
print("wrong order result =", wrong_result, " vs correct =", result)
```

Real output:

```
wrong order result = (51.0, 23.0, 16.0, 1.0)  vs correct = (49.0, 23.0, 16.0, 1.0)
```

`51.0` instead of `49.0` — wrong, but only by `2`, with `y` and `z`
matching exactly. This is a real, verified, silently wrong result of a
particularly dangerous kind: not obviously broken the way Lesson 55's
own `IndexError` was, and not wildly far off the way Lesson 54's
double-cover failure was — close enough that a quick glance, or a test
with a loose tolerance, could mistake it for correct. `y` and `z`
matching by coincidence here (both transforms happen to leave those two
components unaffected on this specific input) is exactly the kind of
thing that makes an order mistake easy to miss on one test case and
genuinely wrong on the next one. `get_world_transform`'s own careful
root-to-child composition order isn't a stylistic choice; it's the
specific thing standing between this lesson's own correct result and
this one.

### Exercises

- Add a fifth level of your own choosing (a specific feature positioned
  relative to the tool) and confirm `get_world_transform` still produces
  a correct result with no changes to the function itself.
- Using `find_node`, confirm `find_node(hierarchy4, "nonexistent")`
  returns `None` rather than crashing — and explain what would happen
  if `get_world_transform` were called on a name that isn't in the
  hierarchy at all.
- Compute `fixture`'s own world transform (not `tool`'s) from
  `hierarchy4`, and confirm its own translation column is exactly
  `table_to_machine`'s translation plus `fixture_to_table`'s own —
  `(150, 20, 15)` — connecting this lesson's own chain-walking directly
  back to Lesson 1's plain vector addition.

### Definition of Done

- [ ] `find_node` and `get_world_transform` both exist in
      `geometry_verified_library.py`.
- [ ] `get_world_transform` was verified against Lesson 55's own
      already-known two-level result before being trusted on the new
      four-level case.
- [ ] The four-level extension was actually run and its result confirmed
      to be exactly the two-level result shifted by the new root's own
      offset, not just assumed to work from the function's shape.
- [ ] The wrong-composition-order failure was actually run and its
      close-but-wrong result compared directly against the correct one,
      with the specific danger of a close-but-wrong result named
      explicitly, not just a generic "order matters" note.
- [ ] Commit with a message stating *why*: any depth of rigid-transform
      hierarchy can now be resolved to one shared root with a single
      function call, rather than one hand-written composition per
      level — and the commit message should note this is the last
      lesson standing directly on Lessons 55/56's own rigid-transform
      machinery before Section III moves on to cameras and projection.
