---
concept: 092-flyweight-pattern
name: Flyweight Pattern
---

## Definition

The Flyweight pattern minimizes memory use by sharing one common object
between many logical "instances" that share the same underlying data,
instead of allocating a separate full copy for each one.

## Problem

Representing a huge number of similar objects — a million trees in a
forest, each with the same mesh and texture but a different position — as
fully independent objects wastes enormous memory duplicating the shared
data across every single instance. Flyweight splits that shared, unchanging
(**intrinsic**) data into one object referenced by many, keeping only the
per-instance (**extrinsic**) data — like position — separate.

## Execution

Create ONE shared TreeType object holding the mesh and texture (expensive, shared data)
↓
Create a million Tree "instances," each just holding an (x, y) position
PLUS a reference to the SAME shared TreeType object
↓
Rendering tree #500,000 reads its own (x,y) but the SAME shared
mesh/texture data every other tree also references
↓
Memory used = one copy of the expensive shared data + a million small
(x,y) pairs, NOT a million copies of the expensive data

## Computer Science

This is a specific application of sharing immutable data by reference —
intrinsic (shared, context-independent) state lives in one flyweight
object referenced by many contexts, while extrinsic (unique per usage)
state is stored separately per instance. This only works cleanly when the
shared state is truly immutable, since mutating it would affect every
"instance" sharing it at once.

Tags: Shared state, Intrinsic vs extrinsic state, Memory optimization, Object pooling

## Software Engineering

Flyweight is worth the added complexity specifically when the number of
logical instances is very large AND a meaningful fraction of their data is
identical across instances — for a modest number of objects, or objects
with little shared data, the added indirection isn't worth the memory
savings.

Tags: Memory optimization, Object pooling, Large-scale object management

## Common Mistakes

- Applying Flyweight to objects that aren't actually numerous enough for the memory savings to matter — the added indirection has a real complexity cost that needs a genuinely large number of instances to pay for itself.
- Accidentally storing per-instance (extrinsic) data inside the shared flyweight object — this corrupts every "instance" that references it, since they're all sharing that exact same object.

## Exercises

- Create 3 `Tree` instances sharing one `TreeType`, print each tree's own position alongside the shared type's mesh name, and confirm all three see the exact same mesh name.
- Estimate how much memory a million-tree forest would use with vs. without Flyweight, assuming the mesh/texture data is 1KB and the position data is 16 bytes.

## javascript

```javascript
class TreeType {
  constructor(mesh, texture) { this.mesh = mesh; this.texture = texture }
}

class Tree {
  constructor(x, y, type) { this.x = x; this.y = y; this.type = type }   // type is SHARED, not copied
  describe() { return `Tree at (${this.x},${this.y}) using ${this.type.mesh}` }
}

const oakType = new TreeType('oak-mesh', 'oak-texture')   // created ONCE
const trees = [new Tree(1, 2, oakType), new Tree(5, 8, oakType), new Tree(3, 3, oakType)]

trees.forEach(t => console.log(t.describe()))
console.log(trees[0].type === trees[1].type)   // true — all trees share the EXACT SAME TreeType object
```
Walkthrough: all three `Tree` instances hold a reference to the SAME
`oakType` object rather than each having their own copy of `mesh`/`texture`
— `trees[0].type === trees[1].type` being `true` confirms it's literally
one shared object in memory, not three equal-looking copies.

## python

```python
class TreeType:
    def __init__(self, mesh, texture):
        self.mesh = mesh
        self.texture = texture


class Tree:
    def __init__(self, x, y, tree_type):
        self.x = x
        self.y = y
        self.type = tree_type   # shared, not copied

    def describe(self):
        return f'Tree at ({self.x},{self.y}) using {self.type.mesh}'


oak_type = TreeType('oak-mesh', 'oak-texture')   # created ONCE
trees = [Tree(1, 2, oak_type), Tree(5, 8, oak_type), Tree(3, 3, oak_type)]

for t in trees:
    print(t.describe())
print(trees[0].type is trees[1].type)   # True -- all trees share the EXACT SAME TreeType object
```
Walkthrough: identical shared-reference mechanics as the JavaScript version
— `trees[0].type is trees[1].type` confirms all three trees reference the
identical `TreeType` object, not separate copies of the same data.
