---
concept: 089-composite-pattern
name: Composite Pattern
---

## Definition

The Composite pattern lets individual objects and groups of objects be
treated through the exact same interface, so client code doesn't need to
distinguish "is this one item, or a collection of items?" when operating on
a tree-shaped structure.

## Problem

A tree of nested groups — files inside folders inside folders, UI
components inside containers inside containers — forces calling code to
handle "a single item" and "a group of items" as two different cases,
usually with recursive special-casing scattered everywhere size, total, or
render logic is needed. Composite gives both the same interface, so a group
can be treated exactly like a single item, recursively.

## Execution

file.getSize() → returns its own size directly (a leaf node)
↓
folder.getSize() → sums getSize() over every child it contains
↓
Some of those children might themselves be folders → each one recursively
sums ITS OWN children the same way
↓
Calling folder.getSize() at the very top of a deep tree transparently
triggers the same getSize() call all the way down, with the caller never
needing to know how deep the tree actually is

## Computer Science

This exploits treating "a leaf" and "a composite of leaves" as the same
type — both implement the identical interface, so a tree of arbitrary depth
can be processed with a single recursive method that doesn't need to
special-case "is this a leaf or a branch" at the call site, only inside
each node's own implementation of that one shared method.

Tags: Recursive structure, Uniform interface, Tree traversal, Polymorphism

## Software Engineering

Composite is the natural fit for anything genuinely tree-shaped — file
systems, UI component trees, organizational hierarchies — anywhere "the
whole group behaves just like one of its parts" is a true statement about
the domain, not just a convenient simplification being forced onto data
that doesn't actually nest that way.

Tags: Tree structures, UI component trees, File systems

## Common Mistakes

- Forcing Composite onto data that isn't genuinely hierarchical, just to get uniform-interface convenience — this adds recursive structure and complexity where a flat list would have been simpler and clearer.
- Forgetting a base/leaf case in the recursive method, causing infinite recursion (or a crash) once the tree traversal reaches an actual leaf node with no children of its own.

## Exercises

- Build a 3-level-deep folder structure (a folder containing files and sub-folders) and confirm calling `getSize()` on the top folder correctly sums every file at every depth.
- Add a `countFiles()` method to both `File` and `Folder` using the same recursive Composite structure as `getSize()`.

## javascript

```javascript
class File {
  constructor(name, size) { this.name = name; this.size = size }
  getSize() { return this.size }
}

class Folder {
  constructor(name) { this.name = name; this.children = [] }
  add(child) { this.children.push(child); return this }
  getSize() {
    return this.children.reduce((total, child) => total + child.getSize(), 0)
  }
}

const root = new Folder('root')
  .add(new File('a.txt', 100))
  .add(new Folder('sub').add(new File('b.txt', 200)))

console.log(root.getSize())   // 300 — 100 (a.txt) + 200 (b.txt inside sub), summed recursively
```
Walkthrough: `File.getSize()` and `Folder.getSize()` are both called
`getSize()`, so `root.getSize()` doesn't need to know whether each child is
a file or another folder — it just calls `child.getSize()` on each one, and
folders recursively do the exact same thing on their own children.

## python

```python
class File:
    def __init__(self, name, size):
        self.name = name
        self.size = size

    def get_size(self):
        return self.size


class Folder:
    def __init__(self, name):
        self.name = name
        self.children = []

    def add(self, child):
        self.children.append(child)
        return self

    def get_size(self):
        return sum(child.get_size() for child in self.children)


root = (Folder('root')
        .add(File('a.txt', 100))
        .add(Folder('sub').add(File('b.txt', 200))))

print(root.get_size())   # 300 -- 100 (a.txt) + 200 (b.txt inside sub), summed recursively
```
Walkthrough: identical uniform-interface recursion as the JavaScript
version — `get_size()` means the same thing whether called on a `File` or a
`Folder`, letting the tree be summed with one simple recursive call
regardless of depth.
