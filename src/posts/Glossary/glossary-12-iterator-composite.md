# Classic Patterns II: Iterator, Composite

## What you will build

Two runnable programs — one per pattern — in both Python and TypeScript,
showing how to traverse a collection without exposing its internal
structure (Iterator), and how to treat individual objects and groups of
objects through the same interface (Composite). By the end you'll
understand why Python's `for` loop works on everything from lists to
files to custom objects, and why a file system can treat a single file
and an entire folder through the same set of operations.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. No prior glossary posts are required — this post stands fully
alone. The Composite pattern connects to the post on Entity, Value
Object, and Aggregate (Glossary 05) — specifically the idea of treating
parts and wholes uniformly.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation. `node`
runs the compiled output.

---

## Concept 1: Iterator

An **Iterator** provides a way to access elements of a collection one at
a time, in sequence, without revealing how that collection is structured
internally. Code that uses an iterator doesn't need to know whether the
underlying collection is a list, a tree, a database query, a file on
disk, or a network stream — it just asks "give me the next item" until
there are no more.

### Problem first

Suppose you have several different data structures — a list, a custom
range, a tree — and you want code that processes them to look the same
regardless of which one it's working with. Without a common interface,
code that iterates over a list uses list-specific indexing, code that
iterates over a tree uses tree-specific traversal, and code that reads
from a file uses file-specific methods — each caller must know the
specific internals of what it's iterating over.

### Python — how iteration already works

Python's `for` loop is built on the iterator protocol — a contract every
iterable object satisfies. When you write `for item in some_object:`,
Python calls two methods behind the scenes:

1. `__iter__` on `some_object` — returns an **iterator object** (an
   object responsible for tracking the current position)
2. `__next__` on that iterator — returns the next value; raises
   `StopIteration` when there are no more items

Most of the time this is invisible, because built-in types (lists,
strings, dicts, files) already implement the protocol. But you can
implement it yourself for any class:

```python
class CountDown:
    def __init__(self, start):
        self._start = start
        self._current = start

    def __iter__(self):
        self._current = self._start
        return self

    def __next__(self):
        if self._current <= 0:
            raise StopIteration
        value = self._current
        self._current -= 1
        return value
```

**Walkthrough:** `__iter__` resets `_current` back to `_start` and
returns `self` — the same object acts as both the iterable (the thing
you iterate over) and the iterator (the thing that tracks position). This
is a common simplification for single-use iterators. `__next__` checks
whether any values remain: if `_current <= 0`, it raises `StopIteration`
— the signal Python's `for` loop looks for to stop iterating. Otherwise,
it captures the current value, decrements `_current` for next time, and
returns the captured value.

```python
countdown = CountDown(5)

print("Using for loop:")
for number in countdown:
    print(f"  {number}")

print("\nUsing next() directly:")
countdown2 = CountDown(3)
iterator = iter(countdown2)
print(next(iterator))
print(next(iterator))
print(next(iterator))

try:
    print(next(iterator))
except StopIteration:
    print("  StopIteration raised — no more values")
```

```
Using for loop:
  5
  4
  3
  2
  1

Using next() directly:
3
2
1
  StopIteration raised — no more values
```

**Walkthrough — new syntax.** `iter(some_object)` is Python's built-in
function that calls `__iter__` on an object and returns the iterator.
`next(some_iterator)` calls `__next__` and returns the next value, or
raises `StopIteration` if exhausted. These are the exact same operations
Python's `for` loop performs internally on every iteration — the `for`
loop is simply a convenient syntax over `iter()` and `next()`.

**CS lens — why does this matter?** The iterator protocol is one of the
most powerful ideas in Python's design: any object that implements
`__iter__` and `__next__` works transparently with `for`, `list()`,
`sum()`, `zip()`, `enumerate()`, and every other piece of code that
consumes sequences. You can write a custom class that reads from a
database, a network socket, or an infinite mathematical sequence — and
the code that processes the results looks identical to code that processes
a plain list, because all of them speak the same protocol. This is
**polymorphism** through a shared interface (the iterator protocol),
applied to sequential access.

Now a more practical example — an iterator over a custom data structure:

```python
class NumberRange:
    def __init__(self, start, stop, step=1):
        self._start = start
        self._stop  = stop
        self._step  = step

    def __iter__(self):
        current = self._start
        while current < self._stop:
            yield current
            current += self._step
```

**Walkthrough — new syntax.** `yield` is a keyword that transforms a
regular function into a **generator function**. When Python encounters
`yield`, it pauses the function, returns the yielded value to the caller,
and resumes from that exact point the next time the caller asks for
another value. A function containing `yield` doesn't return a plain value
— it returns a **generator object**, which automatically implements
`__iter__` and `__next__`. This means `__iter__` here doesn't need to
manually track `_current` or raise `StopIteration` — Python handles all
of that automatically when a generator is exhausted. `yield` is one of
Python's most powerful features: it lets you write iteration logic that
*looks* like a regular loop but *behaves* like an iterator, producing
values one at a time instead of building a complete list in memory.

```python
evens = NumberRange(0, 10, step=2)
print("Even numbers:")
for n in evens:
    print(f"  {n}")

print(f"\nSum: {sum(NumberRange(1, 6))}")
print(f"List: {list(NumberRange(0, 5))}")
```

```
Even numbers:
  0
  2
  4
  6
  8

Sum: 15
List: [0, 1, 2, 3, 4]
```

**Walkthrough:** `sum(NumberRange(1, 6))` works because `sum` uses the
iterator protocol internally — it calls `iter()`, then `next()` repeatedly
until `StopIteration`. `list(NumberRange(0, 5))` also works the same way.
The `NumberRange` object doesn't know or care that it's being used with
`sum` or `list` — it just implements the protocol and lets the consumer
decide what to do with the values.

**SE lens.** The iterator protocol is the reason Python code that processes
sequences is so composable: `zip`, `enumerate`, `map`, `filter`, and list
comprehensions all work on any iterable. When you implement `__iter__`
(or use `yield`), your class immediately gains compatibility with the
entire Python ecosystem of sequence-processing tools. In production
systems, iterators over database query results, log file lines, API
pagination responses, and streaming data sources all work through this
same protocol — the processing code never changes as the data source
changes.

**What breaks without this:** Without the iterator protocol, every data
structure exposes its specific internals to callers — code that processes
a list uses index access, code that processes a tree uses recursive
traversal, code that reads a file uses `readline()`. Switching from one
data source to another requires rewriting the processing code, not just
changing which object is passed in.

### TypeScript

TypeScript/JavaScript has its own iteration protocol, equivalent to
Python's `__iter__`/`__next__`. An object is iterable if it implements
the `[Symbol.iterator]()` method, which returns an iterator object with
a `next()` method that returns `{ value: T, done: boolean }`.

```typescript
class CountDown implements Iterable<number> {
  constructor(private start: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    return {
      next(): IteratorResult<number> {
        if (current <= 0) {
          return { value: 0, done: true };
        }
        return { value: current--, done: false };
      },
    };
  }
}
```

**Walkthrough — new syntax.** `implements Iterable<number>` — `Iterable`
is a built-in TypeScript interface for objects that can be iterated with
`for...of`. The `<number>` generic parameter specifies what type of values
the iteration produces. `[Symbol.iterator]()` — `Symbol.iterator` is
JavaScript's special built-in symbol used as the property name for the
iterator method. The square brackets around it in the method name
(`[Symbol.iterator]()`) is **computed property name** syntax: using a
variable or symbol as a property name rather than a literal string.
`Iterator<number>` is the built-in TypeScript interface for iterator
objects. `IteratorResult<number>` is the type of each step's result —
an object with `value` (the current value) and `done` (whether iteration
is complete). `current--` is the **post-decrement operator**: it returns
the current value of `current` and *then* decrements it by 1, equivalent
to Python's pattern of capturing the value before modifying it.

```typescript
const countdown = new CountDown(5);

console.log("Using for...of loop:");
for (const number of countdown) {
  console.log(`  ${number}`);
}
```

```
Using for...of loop:
  5
  4
  3
  2
  1
```

**Walkthrough:** `for...of` in TypeScript/JavaScript calls
`[Symbol.iterator]()` on the object and then calls `.next()` on the
resulting iterator until `done` is `true` — exactly the same mechanism as
Python's `for` calling `__iter__` then `__next__` until `StopIteration`.

TypeScript/JavaScript also supports generator functions with `function*`
and `yield`, directly equivalent to Python's generators:

```typescript
function* numberRange(start: number, stop: number, step: number = 1): Generator<number> {
  let current = start;
  while (current < stop) {
    yield current;
    current += step;
  }
}

console.log("\nEven numbers:");
for (const n of numberRange(0, 10, 2)) {
  console.log(`  ${n}`);
}

console.log(`\nAs array: ${JSON.stringify([...numberRange(0, 5)])}`);
```

```
Even numbers:
  0
  2
  4
  6
  8

As array: [0,1,2,3,4]
```

**Walkthrough — new syntax.** `function*` (with an asterisk) declares a
**generator function** — the TypeScript/JavaScript equivalent of Python's
generator function using `yield`. `Generator<number>` is the return type.
`yield current` pauses the function and produces `current` as the next
value, identical in behavior to Python's `yield`. `[...numberRange(0, 5)]`
uses the **spread operator** inside an array literal to collect all values
from the generator into an array — the TypeScript equivalent of Python's
`list(NumberRange(0, 5))`.

---

## Concept 2: Composite

The **Composite** pattern lets you treat individual objects and groups of
objects through the same interface. A single file and a folder containing
many files both respond to `size()`, `display()`, or `delete()` — the
caller doesn't need to know whether it's working with a leaf (an
individual item) or a composite (a container of items). Composites can
contain other composites, forming a tree structure of arbitrary depth.

### Problem first

A file system has files and folders. A folder can contain files and other
folders. Code that calculates the total size of "this item" should work
whether "this item" is a single file or a folder containing hundreds of
nested files and subfolders. Without the Composite pattern, the calling
code needs to know what kind of thing it's dealing with: "if it's a file,
get its size; if it's a folder, loop over its contents recursively." With
Composite, both respond to `get_size()` and the tree-walking happens
inside the composite, invisibly.

### Python

```python
class FileSystemItem:
    def get_size(self):
        raise NotImplementedError

    def display(self, indent=0):
        raise NotImplementedError
```

**Walkthrough:** `FileSystemItem` is the common interface — both files
and folders will implement `get_size` and `display`. `indent=0` is a
default parameter for the display method: it controls how many spaces
to print before an item's name, allowing nested items to appear indented.

```python
class File(FileSystemItem):
    def __init__(self, name, size_kb):
        self._name = name
        self._size_kb = size_kb

    def get_size(self):
        return self._size_kb

    def display(self, indent=0):
        print(f"{'  ' * indent}📄 {self._name} ({self._size_kb}KB)")
```

**Walkthrough — new syntax.** `'  ' * indent` is Python's string
repetition: `'  ' * 0` produces `""`, `'  ' * 1` produces `"  "`, `'  ' *
2` produces `"    "` — a convenient way to produce the right number of
spaces for indentation without a loop. `File` is the **leaf** node: it has
no children, its `get_size` simply returns its own size, and its `display`
prints one line with appropriate indentation.

```python
class Folder(FileSystemItem):
    def __init__(self, name):
        self._name = name
        self._children = []

    def add(self, item):
        self._children.append(item)
        return self

    def get_size(self):
        return sum(child.get_size() for child in self._children)

    def display(self, indent=0):
        total = self.get_size()
        print(f"{'  ' * indent}📁 {self._name}/ ({total}KB total)")
        for child in self._children:
            child.display(indent + 1)
```

**Walkthrough:** `Folder` is the **composite** node: it holds a list of
children (which can be `File` objects, other `Folder` objects, or any
mix). `get_size` uses a generator expression to sum `child.get_size()` for
every child — each child handles its own size calculation, whether it's a
file (returning a number) or a folder (recursively summing its own
children). The caller doesn't need to know which — they both respond to
`get_size()`. `display` prints the folder's name, then calls `display` on
each child with `indent + 1`, so each level of nesting appears one step
further indented.

```python
readme     = File("README.md", 4)
main_py    = File("main.py", 12)
config     = File("config.yaml", 2)
test_py    = File("test_main.py", 8)
logo       = File("logo.png", 340)

tests = Folder("tests")
tests.add(test_py)

assets = Folder("assets")
assets.add(logo)

project = Folder("my_project")
project.add(readme)
project.add(main_py)
project.add(config)
project.add(tests)
project.add(assets)

print("File system structure:")
project.display()

print(f"\nTotal project size: {project.get_size()}KB")
print(f"Tests folder size:  {tests.get_size()}KB")
print(f"Single file size:   {readme.get_size()}KB")
```

```
File system structure:
📁 my_project/ (366KB total)
  📄 README.md (4KB)
  📄 main.py (12KB)
  📄 config.yaml (2KB)
  📁 tests/ (8KB total)
    📄 test_main.py (8KB)
  📁 assets/ (340KB total)
    📄 logo.png (340KB)

Total project size: 366KB
Tests folder size:  8KB
Single file size:   4KB
```

**Walkthrough:** The last three lines demonstrate the pattern's key
property: `project.get_size()`, `tests.get_size()`, and
`readme.get_size()` all use the exact same call — the caller doesn't know
or care that `project` is a deeply nested folder, `tests` is a shallow
folder, and `readme` is a single file. Each handles its own size
calculation appropriately.

**CS lens — recursion and tree structures.** `Folder.get_size` and
`Folder.display` are both **recursive** — they call themselves indirectly,
through `child.get_size()` or `child.display()`, where the child might
itself be a `Folder` that does the same. This is the natural fit between
the Composite pattern and tree-shaped data: the recursive structure of the
algorithm mirrors the recursive structure of the data. A tree of arbitrary
depth is traversed correctly without the calling code knowing or specifying
the depth — each node handles its own subtree. This is a fundamental CS
idea: recursive data structures are most elegantly processed by recursive
algorithms.

**SE lens.** Composite appears wherever hierarchical data needs to be
treated uniformly: a GUI widget system where a panel can contain buttons,
labels, and other panels (and `draw()` works on all of them); an
organization chart where an employee's `total_reports()` includes all
reports-of-reports; a shopping cart where a bundle of items can be nested
inside another bundle; arithmetic expression trees where `evaluate()` works
on numbers and compound expressions alike. The pattern shows up whenever
"this thing might be one item or a collection of items, and the caller
shouldn't need to care which."

**What breaks without this:** Without Composite, code that processes a
hierarchy must explicitly check: "is this a file or a folder? if a
folder, loop over it and check each child..." — the type-checking and
tree-walking logic leaks into every piece of code that touches the
hierarchy, rather than being encapsulated inside the composite nodes
themselves.

### TypeScript

```typescript
interface FileSystemItem {
  getSize(): number;
  display(indent?: number): void;
}
```

**Walkthrough:** `indent?: number` — the `?` marks the parameter as
optional: callers may omit it, in which case it will be `undefined`.
Inside the method, a default value handles `undefined`: `indent = 0`
(shown below in the implementations). This is the TypeScript equivalent of
Python's `indent=0` default parameter, just expressed differently — in
TypeScript, default values go in the method body or parameter list of the
implementing class, not in the interface.

```typescript
class FileItem implements FileSystemItem {
  constructor(
    private name: string,
    private sizeKb: number
  ) {}

  getSize(): number {
    return this.sizeKb;
  }

  display(indent: number = 0): void {
    console.log(`${"  ".repeat(indent)}📄 ${this.name} (${this.sizeKb}KB)`);
  }
}

class FolderItem implements FileSystemItem {
  private children: FileSystemItem[] = [];

  constructor(private name: string) {}

  add(item: FileSystemItem): FolderItem {
    this.children.push(item);
    return this;
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  display(indent: number = 0): void {
    const total = this.getSize();
    console.log(`${"  ".repeat(indent)}📁 ${this.name}/ (${total}KB total)`);
    for (const child of this.children) {
      child.display(indent + 1);
    }
  }
}
```

**Walkthrough — new syntax.** `"  ".repeat(indent)` is JavaScript's
string method for repetition — the direct equivalent of Python's
`'  ' * indent`. `FileItem` instead of `File` to avoid colliding with
the browser DOM's built-in `File` type (the same naming-collision issue
from earlier posts in this series, now guarded preemptively).
`FolderItem` similarly avoids any collision with `Folder`.
`this.children.reduce((total, child) => total + child.getSize(), 0)` is
`.reduce()` (from TypeScript Prereq 02): starts with `0`, adds each
child's `getSize()` to the running total — the TypeScript equivalent of
Python's `sum(child.get_size() for child in self._children)`.

```typescript
const readme   = new FileItem("README.md", 4);
const mainPy   = new FileItem("main.py", 12);
const config   = new FileItem("config.yaml", 2);
const testPy   = new FileItem("test_main.py", 8);
const logo     = new FileItem("logo.png", 340);

const tests = new FolderItem("tests");
tests.add(testPy);

const assets = new FolderItem("assets");
assets.add(logo);

const project = new FolderItem("my_project");
project.add(readme);
project.add(mainPy);
project.add(config);
project.add(tests);
project.add(assets);

console.log("File system structure:");
project.display();

console.log(`\nTotal project size: ${project.getSize()}KB`);
console.log(`Tests folder size:  ${tests.getSize()}KB`);
console.log(`Single file size:   ${readme.getSize()}KB`);
```

```
File system structure:
📁 my_project/ (366KB total)
  📄 README.md (4KB)
  📄 main.py (12KB)
  📄 config.yaml (2KB)
  📁 tests/ (8KB total)
    📄 test_main.py (8KB)
  📁 assets/ (340KB total)
    📄 logo.png (340KB)

Total project size: 366KB
Tests folder size:  8KB
Single file size:   4KB
```

---

## Connect the pieces

**Iterator** and **Composite** both solve the problem of working with
structured data without coupling the consuming code to the data's
specific internal shape.

Iterator solves "how do I access elements one at a time without knowing
how they're stored?" — the answer is a protocol (`__iter__`/`__next__` in
Python, `Symbol.iterator`/`next()` in TypeScript) that every collection
implements, making all of them interchangeable from the consumer's
perspective. Python's `for` loop, `sum()`, `list()`, and every other
sequence-consuming tool are all built on this protocol.

Composite solves "how do I operate on a hierarchy without knowing whether
I'm at a leaf or a branch?" — the answer is a shared interface
(`FileSystemItem`) that both leaves (`File`) and composites (`Folder`)
implement, where the composite's implementation recurses into its children
automatically. The caller calls `get_size()` on whatever it has; the tree
walks itself.

The two patterns are frequently combined: a Composite tree is typically
traversed using iteration — a tree iterator visits every node in some
order (depth-first, breadth-first) without the caller needing to manage
the traversal logic. This is how Python's `os.walk()` works: it returns
an iterator over a directory tree, producing one (folder, subfolders,
files) tuple at a time, combining both patterns.

## What breaks without these patterns

Without Iterator, every piece of code that processes a collection must
know the collection's specific internal structure — index-based access
for lists, recursive traversal for trees, cursor-based access for
databases — making collections non-interchangeable and preventing the
composition with higher-order tools like `sum`, `zip`, and `filter`.
Without Composite, code that operates on a hierarchy must manually
check whether each node is a leaf or a container before deciding how to
proceed — type-checking logic that belongs inside the data structure
leaks outward into every caller.

## Definition of done

- [ ] You can explain what `__iter__` and `__next__` do in Python and
      what happens when `StopIteration` is raised.
- [ ] You can explain what `yield` does and why a function containing it
      is called a generator function.
- [ ] You've run the `CountDown` example directly using `iter()` and
      `next()` and observed `StopIteration` being raised.
- [ ] You can explain what the Composite pattern's defining property is —
      specifically why the last three `get_size()` calls in the example
      look identical even though they're operating on very different
      structures.
- [ ] You can explain what `"  ".repeat(indent)` does in TypeScript and
      what the Python equivalent is.
- [ ] You've run both patterns in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain why `FileItem` and `FolderItem` were used instead
      of `File` and `Folder` in the TypeScript version.
