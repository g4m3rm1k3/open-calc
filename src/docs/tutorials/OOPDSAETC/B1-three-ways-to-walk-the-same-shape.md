# Lesson B1: Three Ways to Walk the Same Shape

**What you will build** — A small tree of six labeled nodes, built by
hand on the heap, walked three different recursive ways — pre-order,
in-order, post-order — and then walked a fourth way with no recursion
at all, using an explicit stack that stands in for the call stack. The
transferable problem underneath the feature: once data stops being a
flat sequence and starts nesting — a group containing more groups,
which is exactly what parsed structured data looks like — "loop over
it" stops being a meaningful instruction. A tree has no single "next"
element the way an array does; there are several different, equally
valid, precisely defined orders in which its nodes can be visited, and
a working program has to pick one on purpose and be able to produce it
two different ways: by letting the language's own call stack do the
bookkeeping (recursion), and by doing that bookkeeping by hand (an
explicit stack).

**What you need to know first** — Lesson A6's merge sort, specifically
its recursive shape: a function that solves a problem by calling a
smaller version of itself and combining the results. This lesson
reuses that exact shape, applied to a tree instead of a flat array.
General comfort compiling and running a C++ program from a terminal,
built up across all of Track A, is assumed throughout — this lesson
does not re-teach `clang++`/`g++` invocation from zero, though every
command used is still shown and explained at the point it's needed,
per this schema's own rule.

**Terms used in this lesson**

- **tree** — a hierarchical structure of nodes where each node may
  point to zero or more other nodes ("children"), exactly one node has
  no parent (the "root"), and no chain of children ever loops back on
  itself. It exists because some real data genuinely nests — a
  category containing subcategories, a folder containing folders — and
  a flat array has no way to represent "contains" at all, only
  "comes after."
- **node** — one single element of a tree: a piece of data plus the
  pointers that connect it to its children. It exists as a name for
  "one of the things a tree is made of," distinct from the tree as a
  whole, because traversal code operates one node at a time.
- **self-referential structure** — a `struct` (or `class`) that
  contains a pointer to its own type as one of its members. It exists
  because a fixed, single struct definition can only describe a fixed
  shape of data unless one of its members can point to *another
  instance of that same struct* — that one trick is what lets a single
  type describe a chain, a tree, or a graph of unbounded size and
  depth, instead of a fixed-size record.
- **pointer** — a variable whose value is the memory address of another
  value, written with a trailing `*` in its type (`TreeNode*` is "a
  pointer to a `TreeNode`"). It exists because C++ needs some way to
  refer to a piece of data that lives somewhere else in memory without
  copying it — and, specifically for this lesson, without pointers a
  self-referential structure would have no way to name "the next node"
  at all.
- **`nullptr`** — the literal value meaning "this pointer points to
  nothing." It exists because a pointer variable must always hold some
  value, and a tree node's children are frequently absent (a leaf node
  has none) — `nullptr` is the language's own way of representing
  "there is genuinely nothing here" instead of an uninitialized,
  garbage address.
- **heap allocation** — requesting a block of memory that keeps
  existing until it is explicitly given back, rather than memory tied
  to the lifetime of the function that created it. It exists because a
  tree's nodes are created inside one function call (the one building
  the tree) but have to keep existing after that call returns and be
  reachable from anywhere else in the program that holds a pointer to
  them.
- **dangling pointer** — a pointer that still holds an address, but the
  memory at that address is no longer valid (the thing that used to
  live there is gone). It exists as the name for exactly the failure
  heap allocation avoids: reading through a dangling pointer reads
  whatever memory happens to be there now, which is not the value you
  put there.
- **memory leak** — heap-allocated memory that is never given back,
  even after nothing in the program can reach it anymore. It exists as
  the honest name for the cost this lesson is knowingly taking on: this
  project allocates nodes with `new` and never frees them, because
  ownership and cleanup for linked, pointer-based structures is its own
  concept, taught in full later in this curriculum — not silently
  ignored, explicitly deferred.
- **recursion** — a function that solves a problem by calling itself on
  a smaller version of the same problem, until it reaches a case simple
  enough to answer directly (the **base case**) without calling itself
  again. It exists because some problems — including "visit every node
  of a tree" — have a naturally self-similar shape: the work of
  visiting a whole tree is "visit this node, then do the exact same
  kind of work on each of its subtrees," which is the definition of the
  original problem, just smaller.
- **base case** — the specific input to a recursive function for which
  it returns an answer directly, without recursing again. It exists
  because a recursive function with no base case never stops calling
  itself; the base case is the only thing that gives the chain of calls
  anywhere to end.
- **pre-order traversal** — visiting a tree by processing the current
  node first, then recursively visiting the left subtree, then
  recursively visiting the right subtree (node, left, right). It exists
  as one specific, named answer to "in what order do I visit a tree's
  nodes" — the one where a node is always seen before anything nested
  inside it, useful whenever you need to know about a container before
  you know about its contents (for example, copying a tree structure
  top-down).
- **in-order traversal** — visiting a tree by recursively visiting the
  left subtree, then processing the current node, then recursively
  visiting the right subtree (left, node, right). It exists as a second
  named answer to the same question — the one where, for a tree whose
  values are arranged in sorted order left-to-right, visiting nodes
  in-order produces those values in sorted order, which is the entire
  reason in-order traversal is a distinct, useful thing to name rather
  than just "some other order."
- **post-order traversal** — visiting a tree by recursively visiting
  the left subtree, then recursively visiting the right subtree, then
  processing the current node last (left, right, node). It exists as a
  third named answer — the one where every node is guaranteed to be
  visited only after everything nested inside it has already been
  visited, useful whenever a node depends on its children's results
  before it can be processed itself (for example, deleting a tree node
  by node, or computing a folder's total size from its files').
- **LIFO (last-in, first-out)** — an ordering rule where the most
  recently added item is the first one removed. It exists as the
  precise, name-able rule that defines what a stack *is*, as opposed to
  a queue (first-in, first-out) or any other ordering — a container
  only counts as a stack because it enforces this rule specifically.
- **iterative** — accomplishing repeated work with an explicit loop
  (`while`, `for`) instead of a function calling itself. It exists as
  the paired term to "recursive": the same traversal order can be
  produced either way, and this lesson's last Concept Unit exists
  specifically to prove that by building the iterative version and
  checking its output against the recursive one.
- **explicit stack** — a stack data structure the programmer manages by
  hand (pushing and popping it directly in code), used to replace the
  hidden, automatic stack the language itself maintains during
  recursive calls. It exists because recursion's bookkeeping (which
  node to come back to, and what work is still pending) has to live
  *somewhere* — normally the language's own call stack holds it
  invisibly; an explicit stack makes that same bookkeeping visible and
  programmer-controlled instead.
- **aggregate initialization** — initializing a `struct` with no
  user-written constructors by listing its member values in order
  inside braces (`TreeNode{"D", nullptr, nullptr}` sets `label`,
  `left`, and `right` in the order they're declared). It exists as a
  compact way to fully initialize every member of a plain struct in one
  expression, without writing a constructor whose only job would be
  copying its arguments straight into matching members.

**Objects and methods used**

- **`TreeNode`** (this lesson's own subject)
  - *What it is:* a `struct` — a plain, user-defined type with no
    behavior of its own, just data — representing one node of the tree
    this lesson builds.
  - *Implementation:* declared in this lesson's Concept Unit 1 as
    ```cpp
    struct TreeNode {
        std::string label;
        TreeNode* left;
        TreeNode* right;
    };
    ```
    Three members, in this order: a `std::string` holding the node's
    printable name, and two `TreeNode*` pointers — `left` and `right`
    — each either `nullptr` or the address of another `TreeNode`.
  - *Its use:* every node this lesson's tree is made of is one
    `TreeNode`, heap-allocated with `new` and wired to its neighbors by
    setting `left` and `right`.
- **`std::string`**
  - *What it is:* the C++ standard library's class for a dynamically
    sized, owned sequence of characters — a real object, not a raw
    character array.
  - *Implementation:* declared in `<string>` as
    `typedef basic_string<char> string;` (confirmed this session by
    reading the real declaration at line 525 of this machine's local
    `<string>` header, under
    `/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1/string`)
    — `std::string` is not its own hand-written class; it's a name for
    `std::basic_string` filled in with `char`. It owns its own
    heap-allocated buffer and grows that buffer automatically as
    needed.
  - *Its use:* each `TreeNode`'s `label` member is a `std::string`,
    holding a short human-readable name (`"A"`, `"B"`, and so on) for
    that node.
- **`std::stack<T>`**
  - *What it is:* a standard library **container adaptor** — a type
    that doesn't implement storage itself, but wraps another container
    and restricts how it can be used, here to enforce strict LIFO
    (last-in, first-out) access.
  - *Implementation:* declared in `<stack>` (confirmed this session by
    reading the real declaration in this machine's local `<stack>`
    header) as
    ```cpp
    template <class T, class Container = deque<T>>
    class stack {
    public:
        bool empty() const;
        size_type size() const;
        reference top();
        void push(const value_type& x);
        void push(value_type&& x);
        void pop();
        // ...
    };
    ```
    (trimmed to the members this lesson actually calls; the real header
    also declares copy/move constructors, comparison operators, and a
    C++23 range constructor not used here). By default it stores its
    elements in a `std::deque<T>` underneath, though this lesson never
    touches that underlying container directly — only through `stack`'s
    own `push`/`pop`/`top`/`empty`.
  - *Its use:* this lesson's final Concept Unit uses
    `std::stack<TreeNode*>` to hold "nodes not yet visited," replacing
    the hidden call stack recursion would normally use.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`std::cout`**
  - *What it is:* the standard library object representing the
    program's standard output stream — the terminal, by default.
  - *Implementation:* a global object of type `std::ostream`, declared
    in `<iostream>`.
  - *Its use:* every traversal in this lesson prints each node's label
    to `std::cout` as it's visited, which is how this lesson can
    actually see and compare the four different visiting orders.
- **`operator<<` (stream insertion)**
  - *What it is:* an overloaded operator that writes a value to an
    output stream and returns that same stream, which is what allows
    chaining (`std::cout << a << b`).
  - *Implementation:* `std::ostream& operator<<(std::ostream&, const T&)`
    — one overload exists for each type it supports (`std::string`,
    `int`, and others); the compiler picks the matching overload based
    on the right-hand value's type.
  - *Its use:* every `std::cout << node->label << " ";` line in this
    lesson uses this operator to actually produce visible output.
- **`std::endl`**
  - *What it is:* a stream manipulator — a special value that, when
    inserted into a stream, writes a newline character and forces any
    buffered output to actually be written out immediately (a "flush").
  - *Implementation:* declared in `<ostream>` as a function template;
    `std::cout << std::endl` is really `std::endl(std::cout)`, using
    `operator<<`'s function-pointer overload.
  - *Its use:* ends each traversal's line of printed output in this
    lesson's `main`.

---

## Concept Unit 1: A Struct That Points to More of Itself

### The Problem

Parsed structured data nests: a group can contain more groups, and
there's no way to know, up front, how many levels deep it goes or how
many items sit at any one level. A single, ordinary `struct` — a fixed
list of named fields — can describe one *record*, like a single
product with a name and a price. It cannot, by itself, describe
*catalog of categories containing more categories*, because a plain
struct's fields all have to be named and fixed at compile time, and
"how many nested groups" isn't a fixed number. Something about the
struct's own shape has to be able to refer to *another instance of that
same shape* — otherwise every level of nesting would need its own,
separately-written type, and a tree five levels deep would need five
different struct definitions instead of one.

### Project Change

- **Reference Source** — No reference counterpart. Track B deliberately
  does not build a real JSON/XML parser (lexing and recursive-descent
  parsing are a large, separate body of concepts not named anywhere in
  Track B's own BRD rows); this tree is constructed directly in code,
  from scratch, as a stand-in for "data that would have come from
  parsing something nested."
- **Files affected** — `catalog_tree.cpp`, created new. Track B begins
  its own evolving project file here, distinct in kind from Track A's
  `dynamic_array.cpp` — a tree of nested nodes is not a variation on a
  flat, sortable integer container; it's a different structure serving
  a different purpose, which is exactly the condition this curriculum's
  one-file-per-track rule requires before starting a new file.
- **Change type** — add (new file).
- **Location** — top of the new file, above `main`.
- **Dependencies** — `#include <iostream>` and `#include <string>`;
  nothing from Track A is reused here.

### The New Code

```cpp
struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};
```

### The Updated Project

This is the very first code in a brand-new file — there is no existing
structure to place it inside yet. `catalog_tree.cpp` so far is just
this struct definition, plus the includes it needs and an empty `main`
to make it a runnable program:

```cpp
#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

int main() {
    return 0;
}
```

### Introduce the Concept in Isolation

Strip everything away except the one new idea: can a struct hold a
pointer to its own type at all? A minimal, throwaway version, using a
type called `Link` instead of `TreeNode` so it's obviously not the real
project:

```cpp
#include <iostream>
#include <string>

struct Link {
    std::string label;
    Link* next;
};

int main() {
    Link second{"second", nullptr};
    Link first{"first", &second};

    std::cout << first.label << " -> " << first.next->label << std::endl;
    return 0;
}
```

Compiled and run for real this session:

```
$ clang++ -std=c++17 -Wall -Wextra lab1_self_referential.cpp -o lab1 && ./lab1
first -> second
```

That output proves the idea works: `first` is a `Link`, and one of its
own members (`next`) points to a *second, separate* `Link` — a
struct's own definition was able to name "a pointer to another instance
of itself" as a member type, and following that pointer (`first.next`)
reaches real, distinct data (`second`), not a copy and not garbage.
This is exactly what `TreeNode`'s `left` and `right` members do above,
just with two outgoing pointers per node instead of one. A struct
built this way is called a **self-referential structure** — the
single trick that lets one fixed type definition describe a chain,
tree, or graph of unbounded size.

### Discard the Throwaway Example

`Link`, `first`, and `second` above existed only to prove a struct can
point to its own type. They're discarded now and will not appear again
in this project — `catalog_tree.cpp` uses `TreeNode` exclusively from
here on.

### Mechanical Walkthrough

Enumerating every syntactic element of the New Code, in order:

- **`struct TreeNode { ... };`** — declares a new type named `TreeNode`.
  A `struct` in C++ is a blueprint for a value made of several named
  pieces (its *members*) — it is not itself a running thing; nothing
  exists yet just because this line was compiled. A value of this type
  only comes into existence later, wherever the code writes
  `TreeNode{...}` or `new TreeNode{...}`.
- **`std::string label;`** — declares a member named `label`, of type
  `std::string` (the standard library's owned, growable character
  sequence — full treatment above, under "Objects and methods used").
  This is the piece of a `TreeNode` that will hold its printable name.
- **`TreeNode* left;`** — declares a member named `left`, of type
  `TreeNode*` — a pointer to a `TreeNode`. The trailing `*` in the type
  is what makes this a pointer declaration rather than a plain
  `TreeNode` member; a plain (non-pointer) `TreeNode left;` member
  would be a compile error here, because `TreeNode`'s own definition
  isn't finished yet at the point this line is being read, so the
  compiler wouldn't yet know its size — a *pointer* to `TreeNode`
  always has a fixed, known size (a memory address), regardless of how
  big `TreeNode` itself eventually turns out to be, which is exactly
  what makes self-reference possible at all.
- **`TreeNode* right;`** — declares a second pointer member, `right`,
  identical in kind to `left`. Two separate pointer members, rather
  than one, is what will let a node have up to two children instead of
  just a single "next" — the structural difference between a linked
  chain (one outgoing pointer per node) and a tree (more than one).
- **`;` after the closing `}`** — required syntax ending the `struct`
  declaration statement; without it the next declaration in the file
  would be read as part of the same statement and fail to compile.

### CS Lens

A self-referential structure is the foundation every linked structure
is built from. Also recognized in: every linked list (a node pointing
to "the next node"), every tree (a node pointing to its children, which
is exactly what this lesson builds), every graph (a node pointing to
its neighbors), a compiler's own abstract syntax tree node types, and
the DOM node objects a web browser builds while parsing an HTML page —
all of them are, underneath, one struct or class whose own definition
contains a pointer (or reference) to more instances of that same type.

### SE Lens

The alternative to a pointer-based node is an index-based one: instead
of `TreeNode* left`, store `int leftIndex` and keep every node in one
big flat array, with `-1` meaning "no child." Some real, performance-
sensitive systems (game engines, some database indexes) do exactly
this, because flat arrays keep related data close together in memory,
which the CPU's cache rewards heavily — pointer-based nodes, by
contrast, are scattered across the heap wherever `new` happened to put
them, and following a chain of pointers means jumping to unpredictable
memory locations. The tradeoff going the other way: pointer-based nodes
are far simpler to reason about (a node just *has* a `left`, full stop,
no index arithmetic, no shared array to manage) and never need to be
resized or reorganized as the tree grows. This lesson takes the
simpler, pointer-based route on purpose, because the concept being
taught right now is "trees and how to walk them," not "how to make a
tree cache-friendly" — that tradeoff is real, but out of scope here.
This project is also, right now, choosing not to pay a second real
cost: nothing frees these nodes yet, which is a genuine memory leak.
That's addressed honestly in the next Concept Unit, not silently
ignored.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab1_self_referential.cpp -o lab1
```

- `clang++` — this machine's C++ compiler (Apple clang 17, and `g++`
  resolves to the same toolchain on this machine).
- `-std=c++17` — compile using the C++17 language standard, the
  version this whole lesson's syntax targets.
- `-Wall -Wextra` — enable a broad set of compiler warnings; a program
  can compile cleanly under weaker settings while still doing something
  the language allows but is almost never intended, and these flags
  surface that instead of hiding it.
- `lab1_self_referential.cpp` — the source file to compile.
- `-o lab1` — name the resulting compiled program `lab1` (without this
  flag, `clang++` would default to naming it `a.out`).

```
./lab1
```

Runs the just-compiled program from the current directory (`./` is
required because the current directory isn't normally on the shell's
search path for executables).

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab1_self_referential.cpp -o lab1 && ./lab1
first -> second
```

### Connecting Sentence

`TreeNode` above is exactly this same self-referential idea, just with
two outgoing pointers instead of `Link`'s one — the next Concept Unit
puts real, heap-allocated `TreeNode`s behind those pointers to build an
actual tree.

---

## Concept Unit 2: Giving a Node a Life Beyond the Function That Made It

### The Problem

Building this tree means creating six separate nodes and wiring them
together with pointers — but all six have to keep existing, and stay
reachable, for as long as the program is walking the tree, which could
be long after whatever code created them has returned. An ordinary
local variable (`TreeNode d{...};` sitting inside a function) is
destroyed the moment that function returns; a pointer to it left
behind after that becomes a **dangling pointer** — a pointer that still
holds an address, but the data that used to live there is gone. This
project needs a way to create a `TreeNode` whose lifetime is not tied
to any one function call at all.

### Project Change

- **Reference Source** — No reference counterpart; same reasoning as
  Concept Unit 1 — this project constructs its tree directly, not by
  parsing anything real.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — inside `main`, replacing the empty body left by
  Concept Unit 1.
- **Dependencies** — none beyond what Concept Unit 1 already added.

### The New Code

```cpp
TreeNode* d = new TreeNode{"D", nullptr, nullptr};
```

### The Updated Project

`main` currently holds nothing but `return 0;`. With this one line
added (the rest of the tree's nodes are built the same way and follow
right after, covered later in this same Concept Unit):

```cpp
int main() {
    TreeNode* d = new TreeNode{"D", nullptr, nullptr}; // ← new

    return 0;
}
```

`main` now creates one real, heap-allocated `TreeNode` and keeps a
pointer to it (`d`) — the first actual piece of the tree this lesson
builds.

### Introduce the Concept in Isolation

First, the working version — a minimal proof that memory requested with
`new` really does outlive the function that requested it:

```cpp
#include <iostream>

int* makeOnHeap(int value) {
    int* p = new int;
    *p = value;
    return p;
}

int main() {
    int* fromHeap = makeOnHeap(42);
    std::cout << "value survives the function call: " << *fromHeap << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab2_heap_new.cpp -o lab2 && ./lab2
value survives the function call: 42
```

`makeOnHeap` returns, its local variable `p` goes away, and the value
`42` is still readable through the pointer it handed back. This is
called **heap allocation** (also "dynamic allocation") — memory
requested with `new` that keeps existing until something explicitly
frees it (or, as this project is knowingly choosing not to do yet, is
just never freed).

Now the contrast — proof, not assertion, of what goes wrong *without*
this, using the same shape but a stack-local variable instead:

```cpp
#include <iostream>

int* makeOnStack(int value) {
    int local = value;
    return &local;
}

int main() {
    int* dangling = makeOnStack(42);
    std::cout << "reading after the function returned: " << *dangling << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab2b_dangling_contrast.cpp -o lab2b && ./lab2b
lab2b_dangling_contrast.cpp:5:13: warning: address of stack memory associated with local variable 'local' returned [-Wreturn-stack-address]
    5 |     return &local;
      |             ^~~~~
1 warning generated.
reading after the function returned: 70190396
```

Two separate, real pieces of evidence, not one: the compiler itself
flags this at compile time (`-Wreturn-stack-address` — it's watching
for exactly this mistake), and the program, when actually run, prints
garbage — `70190396`, not `42`. That number is not meaningful and will
likely differ on a different run or a different machine; that
unpredictability *is* the point. `local` stopped existing the instant
`makeOnStack` returned, and `dangling` was left pointing at whatever
happens to occupy that same stack memory now. This is what a
**dangling pointer** looks like when actually run, not just described.
`d`'s node above uses `new` specifically to avoid this exact failure.

### Discard the Throwaway Example

`makeOnHeap`, `makeOnStack`, `fromHeap`, and `dangling` above existed
only to prove why `new` is necessary here. They're discarded now;
`catalog_tree.cpp` never calls either of them.

### Mechanical Walkthrough

Enumerating `TreeNode* d = new TreeNode{"D", nullptr, nullptr};`, in
order:

- **`TreeNode* d`** — declares a local variable `d`, of type
  `TreeNode*` (a pointer to a `TreeNode`). Declaring `d` itself is
  ordinary local-variable syntax; what it's initialized *with*, next,
  is the new part.
- **`=`** — assignment used as initialization: whatever the right-hand
  side evaluates to becomes `d`'s starting value.
- **`new TreeNode{"D", nullptr, nullptr}`** — a *new-expression*. `new`
  is a C++ operator (not a function, not an object — full treatment
  belongs here because it's a first-class language operator, same
  category as `+` or `==`) that does two things in sequence: it
  requests a block of heap memory exactly large enough for one
  `TreeNode`, and it constructs a `TreeNode` inside that memory using
  the braces that follow. The whole expression's value is a
  `TreeNode*` — the address of the just-created node — which is what
  gets stored into `d`.
- **`{"D", nullptr, nullptr}`** — an aggregate initializer. `TreeNode`
  has no constructors of its own (Concept Unit 1's definition is
  nothing but three plain members), so C++ falls back to **aggregate
  initialization**: the values inside the braces are assigned to
  `TreeNode`'s members in declaration order — `"D"` to `label`,
  `nullptr` to `left`, `nullptr` to `right` — exactly the order
  `TreeNode`'s own definition declared them in.
- **`"D"`** — a string literal. It's being used here to initialize
  `label`, whose type is `std::string`; C++ implicitly converts a
  `const char*` string literal into a `std::string` when one is needed,
  which is why this compiles without writing `std::string("D")`
  explicitly.
- **`nullptr`** (first occurrence, initializing `left`) — the null
  pointer literal, meaning "point at nothing." Node `d` is being built
  first, before any of the nodes that will become its children exist,
  so it genuinely has none yet — `nullptr` states that honestly rather
  than leaving `left` holding an uninitialized, garbage address.
- **`nullptr`** (second occurrence, initializing `right`) — the same
  literal, same reasoning, for the `right` member.
- **`;`** — ends the statement.

The remaining five nodes use this identical three-part mechanism —
`new`, aggregate braces, `nullptr` for absent children — so rather than
re-deriving the mechanism five more times, here is what's actually new
about each one: which existing nodes it wires itself to as children.

```cpp
TreeNode* e = new TreeNode{"E", nullptr, nullptr};
TreeNode* f = new TreeNode{"F", nullptr, nullptr};
TreeNode* b = new TreeNode{"B", d, e};
TreeNode* c = new TreeNode{"C", f, nullptr};
TreeNode* a = new TreeNode{"A", b, c};
```

- **`e`** — a second leaf node, same shape as `d`: no children yet.
- **`f`** — a third leaf node, same shape again.
- **`b`** — its `left` argument is `d` and its `right` argument is `e`
  — both already-existing pointers, not `nullptr`. This is the first
  line where `new`'s braces wire one node to two others that were
  already built: `b` now has two real children.
- **`c`** — its `left` argument is `f`; its `right` argument is
  `nullptr` — `c` has exactly one child, on the left, and no right
  child at all.
- **`a`** — its `left` argument is `b` and its `right` argument is `c`
  — `a` becomes the root, with `b` and `c` as its two children, which
  in turn already have their own children wired in from the lines
  above.

The complete `main`, with every node built and wired:

```cpp
int main() {
    TreeNode* d = new TreeNode{"D", nullptr, nullptr};
    TreeNode* e = new TreeNode{"E", nullptr, nullptr};
    TreeNode* f = new TreeNode{"F", nullptr, nullptr};
    TreeNode* b = new TreeNode{"B", d, e};   // ← new
    TreeNode* c = new TreeNode{"C", f, nullptr}; // ← new
    TreeNode* a = new TreeNode{"A", b, c};   // ← new

    return 0;
}
```

The resulting shape, drawn out:

```
            A
          /   \
         B     C
        / \   /
       D   E F
```

Six calls to `new`, each identical in mechanism, produced six
independently heap-allocated nodes; the pointer arguments passed to the
later ones are what actually assembles them into this specific tree
shape, rather than six disconnected nodes.

### CS Lens

The heap/stack lifetime distinction shown by the two isolated labs
above is not specific to C++. Also recognized in: why languages with
garbage collection (Java, Python, JavaScript) exist at all — every
object in those languages lives on something equivalent to this same
heap, and the garbage collector's entire job is doing, automatically,
what a C++ programmer does by hand with `new`/`delete`; why recursion
has a maximum depth (the call stack is a fixed-size region of memory,
and every recursive call — including the ones this lesson writes next
— consumes a slice of it); and why "use after free" is an entire,
named category of real security vulnerabilities (reading or writing
through a dangling pointer, exactly like `lab2b` did on purpose here,
except accidentally and often exploitably in real software).

### SE Lens

The alternative to raw `new` with no matching cleanup is RAII —
tying a resource's lifetime to an object's, so a destructor guarantees
it gets freed, which is the exact concept Track A's Lesson A3 named and
built for file handles. This lesson deliberately does not do that for
`TreeNode` yet: every node `new`'d here is genuinely leaked — never
freed, for the whole life of this small program. That's a real,
honestly-stated cost, not an oversight; teaching *ownership* for a
pointer-based linked structure (who is responsible for freeing each
node, and when) is substantial enough to be its own concept, covered in
full later in this curriculum. Loading it in here as well would mean
this lesson is teaching two unrelated hard ideas — tree traversal and
resource ownership — at once, which the Repetition Rule's sibling
principle, the Concept Isolation Rule, exists specifically to prevent.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab2_heap_new.cpp -o lab2 && ./lab2
clang++ -std=c++17 -Wall -Wextra lab2b_dangling_contrast.cpp -o lab2b && ./lab2b
```

Same `clang++` flags as Concept Unit 1, explained there; run here
against the two new source files.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab2_heap_new.cpp -o lab2 && ./lab2
value survives the function call: 42

$ clang++ -std=c++17 -Wall -Wextra lab2b_dangling_contrast.cpp -o lab2b && ./lab2b
lab2b_dangling_contrast.cpp:5:13: warning: address of stack memory associated with local variable 'local' returned [-Wreturn-stack-address]
    5 |     return &local;
      |             ^~~~~
1 warning generated.
reading after the function returned: 70190396
```

The real project's own tree (not runnable as a standalone check yet —
`main` just builds it and returns) is confirmed by inspection against
the mechanical walkthrough above: six `new` calls, wired exactly as
drawn.

### Connecting Sentence

Concept Unit 1 gave `TreeNode` the *shape* needed to point at more of
itself; this unit actually built six of them on the heap and wired
them into a real tree — the next three units each define one specific,
named order for visiting those six nodes.

---

## Concept Unit 3: Pre-order Traversal

### The Problem

The tree built in Concept Unit 2 exists in memory, wired together by
pointers, but nothing has looked at it yet. "Visit every node" isn't
one instruction — a `for` loop that works for an array has nothing to
loop *over* here; there's no single sequential block of memory to walk
index by index. The first thing needed is a definition, precise enough
to code, of what order to visit a tree's nodes in — and pre-order is
the most direct one: visit a node itself, before visiting anything
nested inside it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same
  as the two Concept Units above.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new free function, placed above `main`, below the
  `TreeNode` struct from Concept Unit 1.
- **Dependencies** — the six-node tree built in Concept Unit 2, to call
  this function on.

### The New Code

```cpp
void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}
```

### The Updated Project

`catalog_tree.cpp` so far has the `TreeNode` struct and a `main` that
builds the six-node tree. `preOrder` is added as a new, freestanding
function above `main` — nothing existing is being modified, so per
this schema's own rule there's no larger enclosing structure to show
it inside of yet; it's shown whole, above, and called from `main` in
this unit's "Run It" step below.

### Introduce the Concept in Isolation

A tree small enough to see the whole order at a glance — three nodes,
one root with two leaf children:

```cpp
#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    preOrder(x);
    std::cout << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab_preorder_tiny.cpp -o lab_preorder_tiny && ./lab_preorder_tiny
X Y Z
```

`X` — the root — is printed *first*, before either of its
children. This is exactly what `preOrder` in the code shown above does
to the real six-node tree, just on the smallest tree that can show it:
a node, then its left subtree, entirely, then its right subtree,
entirely. This visiting order is called **pre-order traversal**.

### Discard the Throwaway Example

This three-node `X`/`Y`/`Z` tree exists only inside the isolated lab
file and is discarded once its output is understood; `catalog_tree.cpp`
keeps working with the real six-node tree from Concept Unit 2.

### Mechanical Walkthrough

Enumerating `preOrder`'s body, in order:

- **`void preOrder(TreeNode* node)`** — a function declaration.
  `void` means this function returns nothing; it does its work
  (printing) as a side effect rather than producing a value to use.
  Its one parameter, `node`, is a `TreeNode*` — the pointer to whichever
  node this particular call should visit.
- **`if (node == nullptr) return;`** — the **base case** of this
  recursive function. `node == nullptr` is true exactly when this call
  was asked to visit "no node at all" — which happens whenever a
  parent's `left` or `right` pointer was `nullptr` to begin with (every
  leaf node's children, in this tree). Without this line, the function
  would try to dereference a null pointer on the very next line and
  crash; with it, hitting an absent child simply stops that branch of
  recursion immediately, returning without printing or recursing
  further.
- **`std::cout << node->label << " ";`** — prints the current node's
  label, followed by a single space (so consecutive labels are visibly
  separated in the output rather than run together). `node->label`
  uses the arrow operator to access a member (`label`) through a
  pointer (`node`) — equivalent to `(*node).label`, dereferencing
  `node` and then accessing `.label`, but written more directly. This
  line runs *before* either recursive call below it — which is
  precisely what makes this pre-order rather than one of the other two
  orders: the node itself is processed first.
- **`preOrder(node->left);`** — a recursive call: `preOrder` calls
  itself, passing the current node's left child. This is the same
  recursive shape Lesson A6's merge sort used — a function calling a
  smaller version of the same problem (here, "visit this whole
  subtree" shrinks to "visit one smaller subtree") — except the base
  case here is "no node," not "an array of length one."
  Every recursive call this line makes will itself run through this
  entire function body again, from the top, for whatever node
  `node->left` is — including, eventually, hitting the `nullptr` base
  case for any leaf's absent children.
- **`preOrder(node->right);`** — a second recursive call, on the
  current node's right child. It runs only after the entire left-child
  recursive call above has fully finished (including all of *its* own
  nested recursive calls) — C++ statements execute strictly in the
  order they're written, and a function call doesn't return control to
  its caller until it's completely done.

### Execution Trace

Tracing `preOrder(a)` against the real six-node tree from Concept
Unit 2 (`A` → children `B`, `C`; `B` → children `D`, `E`; `C` → children
`F`, `nullptr`):

1. `preOrder(a)` — `a` is not `nullptr`, so it prints `A`, then calls
   `preOrder(a->left)`, which is `preOrder(b)`.
2. `preOrder(b)` — `b` is not `nullptr`, so it prints `B`, then calls
   `preOrder(b->left)`, which is `preOrder(d)`.
3. `preOrder(d)` — `d` is not `nullptr`, so it prints `D`, then calls
   `preOrder(d->left)`, which is `preOrder(nullptr)` (`d` is a leaf; its
   `left` was set to `nullptr` in Concept Unit 2).
4. `preOrder(nullptr)` — the base case matches; nothing is printed,
   the call returns immediately.
5. Back inside step 3's call (`preOrder(d)`), the left-child call has
   now returned, so it proceeds to its own next line: `preOrder(d->right)`,
   which is `preOrder(nullptr)` again — `d`'s right child is also
   `nullptr`. Base case matches again; nothing printed. `preOrder(d)`
   has now finished completely, and control returns to step 2.
6. Back inside step 2's call (`preOrder(b)`), the left-child call
   (everything under `d`) has now fully finished, so it proceeds to
   `preOrder(b->right)`, which is `preOrder(e)`.
7. `preOrder(e)` — prints `E`, then both its children are `nullptr`
   (`e` is also a leaf), so both of its own recursive calls hit the
   base case immediately and print nothing. `preOrder(e)` finishes;
   control returns to step 2.
8. `preOrder(b)` has now run both of its recursive calls to
   completion — it's entirely finished. Control returns to step 1.
9. Back inside step 1's call (`preOrder(a)`), the left-child call
   (everything under `b`) has now fully finished, so it proceeds to
   `preOrder(a->right)`, which is `preOrder(c)`.
10. `preOrder(c)` — prints `C`, then calls `preOrder(c->left)`, which
    is `preOrder(f)`.
11. `preOrder(f)` — prints `F`; both its children are `nullptr`, so
    both recursive calls hit the base case and print nothing.
    `preOrder(f)` finishes; control returns to step 10.
12. Back inside step 10's call (`preOrder(c)`), it proceeds to
    `preOrder(c->right)`, which is `preOrder(nullptr)` (`c`'s `right`
    was set to `nullptr` in Concept Unit 2). Base case matches;
    nothing printed. `preOrder(c)` finishes; control returns to step 1.
13. `preOrder(a)` has now run both of its recursive calls to
    completion. The whole traversal is done.

Printed, in the order each `std::cout` line actually ran:
`A B D E C F` — matching the pre-order rule (node, then left subtree in
full, then right subtree in full) at every single one of the six real
nodes.

### CS Lens

Pre-order traversal — visit the node, then recurse — is the shape used
whenever a container has to be fully understood *before* its contents.
Also recognized in: copying or serializing a tree top-down (you have to
write out a node before you can write out where its children attach);
a filesystem's `find` command listing a directory before descending
into it; rendering an HTML/DOM tree, where a parent element's own
opening tag is emitted before any of its children's markup.

### SE Lens

The alternative considered and rejected here is writing one big
function that handles the whole tree with explicit, hand-managed
bookkeeping (a manual worklist, checked and updated at every step)
instead of recursion. Recursion is chosen because the *language's own
call stack* already does exactly that bookkeeping for free — every
pending `preOrder(node->right)` call is quietly remembered by the stack
until its matching `preOrder(node->left)` call finishes, with no
explicit list to manage in the code. The real cost, honestly stated: a
tree deep enough (thousands of levels) would eventually exhaust the
call stack and crash, since recursion depth is bounded by that same
fixed-size stack region named in this lesson's CS Lens above. This
project's tree is only three levels deep, so that cost isn't visible
here — the fix, doing this iteratively with an explicit stack instead,
is this lesson's own final Concept Unit.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab_preorder_tiny.cpp -o lab_preorder_tiny
```

Same `clang++` flags as before, run against the isolated lab file.

### Run It — Real Output

Against the real project's six-node tree, calling `preOrder(a)` from
`main` (this connects to Concept Unit 2's tree-building code directly
above it):

```cpp
int main() {
    TreeNode* d = new TreeNode{"D", nullptr, nullptr};
    TreeNode* e = new TreeNode{"E", nullptr, nullptr};
    TreeNode* f = new TreeNode{"F", nullptr, nullptr};
    TreeNode* b = new TreeNode{"B", d, e};
    TreeNode* c = new TreeNode{"C", f, nullptr};
    TreeNode* a = new TreeNode{"A", b, c};

    std::cout << "pre-order: ";
    preOrder(a);                          // ← new
    std::cout << std::endl;

    return 0;
}
```

```
$ clang++ -std=c++17 -Wall -Wextra step_preorder.cpp -o step_preorder && ./step_preorder
pre-order: A B D E C F
```

(Verified this session by compiling and running the real project file
in this exact state — the six-node tree from Concept Unit 2 plus this
unit's `preOrder` call.)

### Connecting Sentence

Pre-order visits a node before its subtrees; the next Concept Unit
defines a second order — in-order — that visits a node *between* its
two subtrees instead, and produces a visibly different sequence from
this same tree.

---

## Concept Unit 4: In-order Traversal

### The Problem

Pre-order answers "visit the node first" — but that's one specific
choice among several equally valid ones, not the only meaningful order
a tree can be walked in. A different, also-precise rule — visit
everything in the left subtree, then the node itself, then everything
in the right subtree — produces a genuinely different sequence from the
same tree, and is worth its own name because of a specific, useful
property it has for search trees: when a tree's values are arranged so
that everything in a node's left subtree is "less than" the node and
everything in its right subtree is "greater than" it, visiting the
nodes in this left-node-right order produces them in fully sorted
order. (This lesson's own tree isn't arranged that way — its labels
were assigned arbitrarily when it was built in Concept Unit 2 — so
running in-order traversal on it won't produce alphabetical output;
that specific guarantee belongs to a search-ordered tree, which is
Track C's subject, not this one. What's being taught here is the
traversal rule itself, independent of what property it would prove on
a differently-built tree.)

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new free function, placed directly below `preOrder`.
- **Dependencies** — none beyond what already exists.

### The New Code

```cpp
void inOrder(TreeNode* node) {
    if (node == nullptr) return;
    inOrder(node->left);
    std::cout << node->label << " ";
    inOrder(node->right);
}
```

### The Updated Project

`catalog_tree.cpp` now has two traversal functions, one above the
other, both above `main`:

```cpp
void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}

void inOrder(TreeNode* node) {          // ← new
    if (node == nullptr) return;        // ← new
    inOrder(node->left);                // ← new
    std::cout << node->label << " ";    // ← new
    inOrder(node->right);               // ← new
}                                        // ← new
```

### Introduce the Concept in Isolation

The same three-node `X`/`Y`/`Z` shape from Concept Unit 3's lab,
rebuilt fresh in a new standalone file — same includes, same
`TreeNode` struct — with `inOrder` in place of `preOrder`:

```cpp
void inOrder(TreeNode* node) {
    if (node == nullptr) return;
    inOrder(node->left);
    std::cout << node->label << " ";
    inOrder(node->right);
}

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    inOrder(x);
    std::cout << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab_inorder_tiny.cpp -o lab_inorder_tiny && ./lab_inorder_tiny
Y X Z
```

Compare directly against `preOrder`'s output on this exact same tree,
from the previous Concept Unit: `X Y Z`. Same three nodes, same tree
shape, and a visibly different order — `Y` (the left child) now comes
*before* `X` (the root) instead of after it, because `inOrder` fully
finishes the left subtree before printing the current node at all,
where `preOrder` printed the current node first. This is **in-order
traversal**: left subtree, node, right subtree.

### Discard the Throwaway Example

The `X`/`Y`/`Z` tree is discarded again here, same as in Concept Unit
3; it exists only inside the isolated lab file.

### Mechanical Walkthrough

`inOrder`'s body is line-for-line structurally identical to
`preOrder`'s, with one line moved — enumerating what's actually
different:

- **`void inOrder(TreeNode* node)`** — same kind of function
  declaration as `preOrder`: `void` return type, one `TreeNode*`
  parameter. Full treatment of what a function declaration and a
  pointer parameter are was already given in Concept Unit 3's
  walkthrough; the mechanism is identical here.
- **`if (node == nullptr) return;`** — the same base case as
  `preOrder`, doing the same job: stop this branch of recursion when
  there's no node to visit. Every recursive traversal function in this
  lesson needs this exact same check, because they're all walking the
  same tree shape and hitting the same absent children.
- **`inOrder(node->left);`** — a recursive call on the left child, same
  mechanism as `preOrder`'s equivalent line. The difference from
  `preOrder` is *where this line sits relative to the print
  statement* — here it comes first.
- **`std::cout << node->label << " ";`** — the same print statement as
  `preOrder`'s, doing the same job (write this node's label, followed
  by a space). What's different is *when* it runs: after the left
  subtree has been fully visited, but before the right subtree has
  been touched at all. This single change in position — printing
  between the two recursive calls instead of before both of them — is
  the entire difference between pre-order and in-order; nothing else
  in the function changed.
- **`inOrder(node->right);`** — a recursive call on the right child,
  same mechanism as before, now running last.

### Execution Trace

Tracing `inOrder(a)` against the same real six-node tree used in
Concept Unit 3's trace:

1. `inOrder(a)` — not `nullptr`; calls `inOrder(a->left)`, i.e.
   `inOrder(b)`, *before* printing anything.
2. `inOrder(b)` — not `nullptr`; calls `inOrder(b->left)`, i.e.
   `inOrder(d)`, before printing.
3. `inOrder(d)` — not `nullptr`; calls `inOrder(d->left)`, i.e.
   `inOrder(nullptr)` (`d` is a leaf). Base case matches; nothing
   printed, returns immediately.
4. Back in step 3's call, the left-child call has returned, so `inOrder(d)`
   now runs its own print statement: prints `D`.
5. `inOrder(d)` then calls `inOrder(d->right)`, i.e. `inOrder(nullptr)`
   again. Base case matches; nothing printed. `inOrder(d)` is now
   fully finished; control returns to step 2.
6. Back in step 2's call (`inOrder(b)`), the left-child call
   (everything under `d`, which printed `D`) has fully finished, so
   `inOrder(b)` now runs its own print statement: prints `B`.
7. `inOrder(b)` then calls `inOrder(b->right)`, i.e. `inOrder(e)`.
8. `inOrder(e)` — not `nullptr`; calls `inOrder(e->left)`
   (`nullptr`, base case, nothing printed), then prints `E`, then calls
   `inOrder(e->right)` (`nullptr`, base case, nothing printed).
   `inOrder(e)` finishes; control returns to step 2.
9. `inOrder(b)` has now run both its left-child call and its right-child
   call to completion — it's entirely finished. Control returns to
   step 1.
10. Back in step 1's call (`inOrder(a)`), the left-child call
    (everything under `b`, which printed `D B E` in that order) has
    fully finished, so `inOrder(a)` now runs its own print statement:
    prints `A`.
11. `inOrder(a)` then calls `inOrder(a->right)`, i.e. `inOrder(c)`.
12. `inOrder(c)` — not `nullptr`; calls `inOrder(c->left)`, i.e.
    `inOrder(f)`.
13. `inOrder(f)` — not `nullptr`; both children `nullptr`, so it prints
    `F` between two no-op base-case calls. Finishes; control returns to
    step 12.
14. Back in step 12's call (`inOrder(c)`), the left-child call has
    finished, so it prints `C`.
15. `inOrder(c)` then calls `inOrder(c->right)`, i.e. `inOrder(nullptr)`
    (`c`'s `right` is `nullptr`). Base case matches; nothing printed.
    `inOrder(c)` finishes; control returns to step 1.
16. `inOrder(a)` has now run both its calls to completion. The whole
    traversal is done.

Printed, in order: `D B E A F C` — every node still visited exactly
once, but in a genuinely different sequence from pre-order's
`A B D E C F`, because the node's own print statement moved to a
different position relative to the two recursive calls.

### CS Lens

In-order traversal's defining, name-worthy property — that it produces
sorted output on a search-ordered tree — is one specific instance of a
much more general pattern: an operation defined in terms of "left, then
here, then right" recurs anywhere a structure is organized around a
comparison. Also recognized in: reading a binary search tree's contents
in sorted order (Track C's subject, foreshadowed here); expression
trees in a compiler, where an in-order walk of `+`/`*` nodes and their
operands reconstructs the original infix expression (`(a + b) * c`)
rather than the prefix or postfix form pre-order or post-order would
produce.

### SE Lens

The design choice being reinforced here, not a new one — the same
tradeoff named in Concept Unit 3's SE Lens (recursion's call-stack
bookkeeping versus an explicit worklist) applies identically to
`inOrder`; nothing about moving the print statement's position changes
that cost. What is worth naming freshly here: `preOrder` and `inOrder`
are separate functions with almost entirely duplicated code, differing
in exactly one line's position. A tempting alternative would be one
function with a parameter selecting which order to use — that's
rejected here on purpose, because collapsing these into one
configurable function is exactly the kind of premature abstraction this
curriculum's own working rules warn against: three traversal functions
that are each individually simple and readable is better than one
function whose control flow branches on a mode flag, for a total of
three variants that will never need a fourth mixed in dynamically at
runtime.

### Commands Needed

Same as Concept Unit 3 — `clang++ -std=c++17 -Wall -Wextra`, no new
flags.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab5_three_orders_tiny.cpp -o lab5tmp && ./lab5tmp
pre-order:  X Y Z
in-order:   Y X Z
post-order: Y Z X
```

(A separate, fourth lab file — distinct from the three single-function
isolation labs above — built for exactly this comparison: the same
`TreeNode` struct and tiny `X`/`Y`/`Z` tree, with all three traversal
functions defined and called back to back in `main`, each behind its
own printed label. Printing all three side by side, on the same tree,
in one real run, is what makes the difference between them visible at
a glance; only the second line, `Y X Z`, belongs to `inOrder` itself.)

Against the real project's six-node tree, adding the call to `main`
right after `preOrder`'s:

```cpp
std::cout << "pre-order: ";
preOrder(a);
std::cout << std::endl;

std::cout << "in-order:  ";
inOrder(a);                           // ← new
std::cout << std::endl;
```

```
$ clang++ -std=c++17 -Wall -Wextra step_inorder.cpp -o step_inorder && ./step_inorder
pre-order: A B D E C F
in-order:  D B E A F C
```

(Verified this session by compiling and running the real project file
in this exact state.)

### Connecting Sentence

Pre-order visits a node before its subtrees, in-order visits it
between them; the next Concept Unit completes the classic trio with
post-order, which visits a node only after both subtrees are fully
done.

---

## Concept Unit 5: Post-order Traversal

### The Problem

Two orders down, one left: what if a node's own processing genuinely
*depends* on its children being handled first? Deleting a tree node by
node, for instance, has to free every child before freeing the parent
— freeing the parent first would leave its children unreachable,
leaking them. Neither pre-order (node first) nor in-order (node in the
middle, with the right subtree still unvisited) guarantees that
everything nested under a node has already been fully handled by the
time that node itself is processed. A third, precise rule is needed:
visit both subtrees completely, and only then visit the node.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new free function, placed directly below `inOrder`.
- **Dependencies** — none beyond what already exists.

### The New Code

```cpp
void postOrder(TreeNode* node) {
    if (node == nullptr) return;
    postOrder(node->left);
    postOrder(node->right);
    std::cout << node->label << " ";
}
```

### The Updated Project

`catalog_tree.cpp` now has all three traversal functions, stacked
above `main`:

```cpp
void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}

void inOrder(TreeNode* node) {
    if (node == nullptr) return;
    inOrder(node->left);
    std::cout << node->label << " ";
    inOrder(node->right);
}

void postOrder(TreeNode* node) {        // ← new
    if (node == nullptr) return;        // ← new
    postOrder(node->left);              // ← new
    postOrder(node->right);             // ← new
    std::cout << node->label << " ";    // ← new
}                                        // ← new
```

### Introduce the Concept in Isolation

The same `X`/`Y`/`Z` shape, rebuilt fresh again in its own standalone
file — same includes, same `TreeNode` struct — with `postOrder` in
place of `preOrder`/`inOrder`:

```cpp
void postOrder(TreeNode* node) {
    if (node == nullptr) return;
    postOrder(node->left);
    postOrder(node->right);
    std::cout << node->label << " ";
}

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    postOrder(x);
    std::cout << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab_postorder_tiny.cpp -o lab_postorder_tiny && ./lab_postorder_tiny
Y Z X
```

`X` — the root — is printed *last* here, only after both `Y` and `Z`
have already been printed. Compare all three orders on this identical
tree, side by side: pre-order `X Y Z`, in-order `Y X Z`, post-order
`Y Z X` — three genuinely different sequences from the exact same six
lines of tree-building code, differing only in where each function's
print statement sits relative to its two recursive calls. This
visiting order — both subtrees completely, then the node — is called
**post-order traversal**.

### Discard the Throwaway Example

The `X`/`Y`/`Z` tree shape is discarded a final time; it has now been
rebuilt fresh, in its own standalone lab file, for all three recursive
traversal Concept Units, and will not appear again.

### Mechanical Walkthrough

Enumerating what's different from `inOrder`'s already-explained shape:

- **`void postOrder(TreeNode* node)`** — same function-declaration
  mechanism as `preOrder` and `inOrder`, already given full treatment.
- **`if (node == nullptr) return;`** — the same base case, doing the
  same job, for the same reason, as in both previous traversal
  functions.
- **`postOrder(node->left);`** — recursive call on the left child, same
  mechanism as before, running first.
- **`postOrder(node->right);`** — recursive call on the right child,
  same mechanism as before, running second — and, critically, running
  *before* this function's own print statement, unlike both `preOrder`
  (print, then both calls) and `inOrder` (left call, print, then right
  call).
- **`std::cout << node->label << " ";`** — the same print statement
  mechanism as before, now positioned last, after both recursive calls
  have fully completed. This is what guarantees post-order's defining
  property: by the time any node's label is printed, every node
  beneath it — its entire left subtree and entire right subtree — has
  already been printed.

### Execution Trace

Tracing `postOrder(a)` against the real six-node tree:

1. `postOrder(a)` — not `nullptr`; calls `postOrder(a->left)`, i.e.
   `postOrder(b)`, before printing anything.
2. `postOrder(b)` — not `nullptr`; calls `postOrder(b->left)`, i.e.
   `postOrder(d)`, before printing.
3. `postOrder(d)` — not `nullptr`; calls `postOrder(d->left)`
   (`nullptr`, base case, nothing printed), then `postOrder(d->right)`
   (`nullptr`, base case, nothing printed), and only now — after both
   — prints `D`. `postOrder(d)` finishes; control returns to step 2.
4. Back in step 2's call (`postOrder(b)`), the left-child call
   (everything under `d`, which printed `D`) has finished, so it calls
   `postOrder(b->right)`, i.e. `postOrder(e)`.
5. `postOrder(e)` — not `nullptr`; both children `nullptr` (base cases,
   nothing printed), then prints `E`. Finishes; control returns to
   step 2.
6. `postOrder(b)` has now run both recursive calls to completion —
   only now does it run its own print statement: prints `B`.
7. `postOrder(b)` has finished entirely; control returns to step 1.
8. Back in step 1's call (`postOrder(a)`), the left-child call
   (everything under `b`, which printed `D E B` in that order) has
   finished, so it calls `postOrder(a->right)`, i.e. `postOrder(c)`.
9. `postOrder(c)` — not `nullptr`; calls `postOrder(c->left)`, i.e.
   `postOrder(f)`.
10. `postOrder(f)` — not `nullptr`; both children `nullptr` (base
    cases, nothing printed), then prints `F`. Finishes; control returns
    to step 9.
11. Back in step 9's call (`postOrder(c)`), the left-child call has
    finished, so it calls `postOrder(c->right)`, i.e.
    `postOrder(nullptr)` (`c`'s `right` is `nullptr`). Base case
    matches; nothing printed.
12. `postOrder(c)` has now run both recursive calls to completion —
    only now does it print `C`. Finishes; control returns to step 1.
13. `postOrder(a)` has now run both recursive calls to completion
    (everything under `b`, printing `D E B`, and everything under `c`,
    printing `F C`) — only now, last of all, does it print `A`. The
    whole traversal is done.

Printed, in order: `D E B F C A` — every node visited exactly once
again, in a third distinct sequence, with the root `A` printed dead
last, exactly as post-order's own definition requires.

### CS Lens

Post-order's defining property — a node is only processed after
everything beneath it is fully handled — recurs anywhere "dependencies
before dependents" matters. Also recognized in: safely deleting a tree
node-by-node (free children before their parent, or the parent's
pointers to them are lost first); computing a directory's total size
from its files and subdirectories' own already-computed sizes; and,
more broadly, topological ordering of any dependency graph, where a
task can only run once everything it depends on has already finished —
Track E's own Lesson E3 takes that exact idea and generalizes it beyond
trees to arbitrary graphs.

### SE Lens

Same underlying tradeoff as the two previous traversal functions —
recursion's call-stack bookkeeping, at the cost of stack-depth limits
on very deep trees — restated here because, per this schema's own
Repetition Rule, a design decision reappearing still earns its own real
restatement rather than a citation. What's specific to `postOrder`: it
is the traversal order this project would need if it ever did implement
the node-by-node cleanup Concept Unit 2's SE Lens named as deliberately
deferred — freeing a tree correctly requires visiting it post-order,
children before parent, which is exactly why this shape matters beyond
just being "a third way to print labels."

### Commands Needed

Same as the previous two units — no new flags.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab5_three_orders_tiny.cpp -o lab5tmp && ./lab5tmp
pre-order:  X Y Z
in-order:   Y X Z
post-order: Y Z X
```

(The same fourth, comparison lab file from Concept Unit 4's Run It
step — all three traversal functions, called back to back on the same
tiny tree, now confirmed to also include `postOrder`'s own line.)

Against the real project's six-node tree:

```cpp
std::cout << "pre-order:  ";
preOrder(a);
std::cout << std::endl;

std::cout << "in-order:   ";
inOrder(a);
std::cout << std::endl;

std::cout << "post-order: ";
postOrder(a);                          // ← new
std::cout << std::endl;
```

```
$ clang++ -std=c++17 -Wall -Wextra step_postorder.cpp -o step_postorder && ./step_postorder
pre-order:  A B D E C F
in-order:   D B E A F C
post-order: D E B F C A
```

(Verified this session by compiling and running the real project file
in this exact state — all three recursive traversals, back to back, on
the same six-node tree.)

### Connecting Sentence

All three recursive orders are now built and confirmed to each produce
a genuinely different, correct sequence from the same tree; the next
two Concept Units set recursion itself aside and produce one of these
same sequences — pre-order — a completely different way.

---

## Concept Unit 6: A Container That Remembers What's Left, in Reverse

### The Problem

Every traversal function so far leans entirely on recursion's hidden
bookkeeping: when `preOrder` calls `preOrder(node->left)`, the language
itself remembers, invisibly, "come back here and run
`preOrder(node->right)` once that call returns." Doing the same
traversal *without* recursion means that bookkeeping — "which nodes
still need visiting" — has to be tracked explicitly, by hand, in a
variable the code manages itself. Something is needed that can hold a
growing, shrinking list of "not yet visited" nodes, and — critically —
give back the *most recently added* one first, since that's the exact
order recursion's own call stack uses (the most recent, still-pending
call is always the next one control returns to).

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add (an include; the container itself is only used
  starting in the next Concept Unit).
- **Location** — the includes block at the top of the file.
- **Dependencies** — `#include <stack>`.

### The New Code

```cpp
#include <stack>
```

### The Updated Project

The file's includes, with this one added:

```cpp
#include <iostream>
#include <string>
#include <stack>   // ← new
```

### Introduce the Concept in Isolation

`std::stack` in isolation, using plain integers so nothing about
`TreeNode` is in the way yet:

```cpp
#include <iostream>
#include <stack>

int main() {
    std::stack<int> pending;
    pending.push(10);
    pending.push(20);
    pending.push(30);

    std::cout << "top is: " << pending.top() << std::endl;

    while (!pending.empty()) {
        std::cout << "popped: " << pending.top() << std::endl;
        pending.pop();
    }

    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab3_stack_isolation.cpp -o lab3 && ./lab3
top is: 30
popped: 30
popped: 20
popped: 10
```

Three values were pushed in the order `10`, `20`, `30` — and popped
back out in the exact reverse order, `30`, `20`, `10`. `top()` after
all three pushes confirms it directly: the *most recently pushed*
value, `30`, is the one sitting on top, not `10` (the first one in) or
any other. This ordering rule — most recently added, first removed —
is called **LIFO (last-in, first-out)**, and a container that enforces
it is called a **stack**.

### Discard the Throwaway Example

The plain-integer `pending` stack above is discarded; the next Concept
Unit builds a `std::stack<TreeNode*>` instead, applying this exact same
behavior to real tree nodes.

### Mechanical Walkthrough

Enumerating the isolated lab's `std::stack` usage, in order:

- **`std::stack<int> pending;`** — declares a variable `pending` of
  type `std::stack<int>`. `<int>` fills in `std::stack`'s template
  parameter `T` (shown in this lesson's Header, under "Objects and
  methods used") — this particular stack holds `int` values
  specifically, using its default underlying container,
  `std::deque<int>`, per that same real declared shape. Declaring it
  with no arguments constructs an empty stack, using `stack`'s
  default constructor.
- **`pending.push(10);`** — calls `push`, one of the two overloads
  shown in the Header's real declared shape
  (`void push(const value_type& x)`, here `value_type` is `int`).
  Adds `10` as the new top of the stack. Before this call, `pending`
  was empty; after it, `pending` holds exactly one element, `10`.
- **`pending.push(20);`** — same `push` call, with `20`. `pending` now
  holds `10` underneath and `20` on top — `20` is now the most
  recently added.
- **`pending.push(30);`** — same call again, with `30`. `pending` now
  holds, top to bottom, `30`, `20`, `10` — `30` is the most recently
  added of the three.
- **`pending.top()`** — calls `top`, returning a reference to whichever
  element is currently on top, without removing it. Immediately after
  the three pushes above, this returns `30` — the last one pushed —
  which is exactly what the real output above confirms.
- **`while (!pending.empty())`** — a loop condition using `empty`,
  which returns `true` only when the stack holds zero elements.
  `!pending.empty()` reads as "while `pending` is *not* empty" — the
  `!` is C++'s logical-NOT operator, inverting a `bool`. This loop
  keeps running for as long as there's still at least one element left
  to process.
- **`pending.top()`** (inside the loop) — same method as above, called
  again each iteration to read whatever is currently on top *before*
  removing it.
- **`pending.pop();`** — calls `pop`, which removes the current top
  element. Unlike many other languages' equivalent methods, `pop` here
  returns nothing (`void`, per the real declared shape in the Header)
  — it only removes; reading the value has to happen via `top()`
  first, which is exactly why this loop calls `top()` immediately
  before calling `pop()` on each iteration, rather than trying to use
  `pop()`'s own (nonexistent) return value.

### Execution Trace

The `while` loop's own repeated behavior, values at each iteration:

```
Before loop: pending = [30, 20, 10] (top → bottom)
Iteration 1: top() → 30, prints "popped: 30", pop() → pending = [20, 10]
Iteration 2: top() → 20, prints "popped: 20", pop() → pending = [10]
Iteration 3: top() → 10, prints "popped: 10", pop() → pending = []
Loop check:  pending.empty() is now true → loop ends
```

Each iteration's popped value is explained by the same rule every
time: `top()` always returns whichever value was pushed most recently
among those still present — after `30` is removed, `20` (pushed
second) becomes the new top, and after `20` is removed, `10` (pushed
first) is what's left.

### CS Lens

LIFO ordering, enforced by a stack, is a specific, name-worthy pattern
recognized far beyond this one container type. Also recognized in: the
"undo" button in almost any editor (the most recent action is always
the first one undone — Track H's own Lesson H4 builds exactly this);
a web browser's back button (the most recently visited page is the
first one returned to); and, most directly relevant to this lesson,
the call stack itself — every ordinary recursive function call,
including all three traversal functions built earlier in this lesson,
is already using a LIFO stack, just one the language manages instead
of one written out in code. The next Concept Unit makes that hidden
similarity explicit.

### SE Lens

`std::stack` is deliberately reached for here instead of, say, a
`std::vector` used with `push_back`/`pop_back` directly (which would
behave identically underneath — `std::stack`'s default container is
literally a `std::deque`, not a `std::vector`, but either could serve).
The real reason to prefer `std::stack` specifically: it's a **container
adaptor** — its entire public interface (`push`, `pop`, `top`, `empty`)
only exposes LIFO operations, deliberately hiding everything else a
`std::deque` or `std::vector` could otherwise do (indexing by position,
inserting in the middle, iterating front-to-back). That's a real,
worthwhile tradeoff: code written against `std::stack` cannot
accidentally reach in and read or modify something other than the
current top, which is a guarantee `std::vector` used the same way
would not enforce — nothing would stop a future edit from calling
`myVector[5]` on what was meant to always be used as a stack. Naming
the intent in the type itself is the whole benefit.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab3_stack_isolation.cpp -o lab3
```

Same flags as every previous unit, explained in Concept Unit 1.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab3_stack_isolation.cpp -o lab3 && ./lab3
top is: 30
popped: 30
popped: 20
popped: 10
```

The real project (`catalog_tree.cpp` with `#include <stack>` added) is
not separately runnable as its own check yet — the include alone has
no visible effect until the next Concept Unit actually uses
`std::stack`.

### Connecting Sentence

`std::stack<int>` above proved LIFO behavior on plain numbers; the
final Concept Unit swaps `int` for `TreeNode*` and uses that exact
same behavior to reproduce pre-order traversal without writing a single
recursive call.

---

## Concept Unit 7: Trading Recursion for an Explicit Stack

### The Problem

`preOrder` (Concept Unit 3) relies entirely on the language's own call
stack to remember "which right-child call is still pending" while it
works through a left subtree. That hidden stack cannot be inspected,
paused, resumed on a separate thread, or bounded in size by the
program itself — it's simply *given*, as part of how function calls
work. Building the same traversal with a stack the code manages
directly proves those two are actually doing the same job, and makes
that previously-invisible bookkeeping something the program can see
and control.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new free function, placed directly below
  `postOrder`.
- **Dependencies** — `std::stack`, added to this file in Concept Unit
  6.

### The New Code

```cpp
void iterativePreOrder(TreeNode* root) {
    if (root == nullptr) return;
    std::stack<TreeNode*> pending;
    pending.push(root);
    while (!pending.empty()) {
        TreeNode* current = pending.top();
        pending.pop();
        std::cout << current->label << " ";
        if (current->right != nullptr) pending.push(current->right);
        if (current->left != nullptr) pending.push(current->left);
    }
}
```

### The Updated Project

`catalog_tree.cpp` now has all four traversal functions:

```cpp
void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}

void inOrder(TreeNode* node) {
    if (node == nullptr) return;
    inOrder(node->left);
    std::cout << node->label << " ";
    inOrder(node->right);
}

void postOrder(TreeNode* node) {
    if (node == nullptr) return;
    postOrder(node->left);
    postOrder(node->right);
    std::cout << node->label << " ";
}

void iterativePreOrder(TreeNode* root) {          // ← new
    if (root == nullptr) return;                  // ← new
    std::stack<TreeNode*> pending;                 // ← new
    pending.push(root);                            // ← new
    while (!pending.empty()) {                     // ← new
        TreeNode* current = pending.top();          // ← new
        pending.pop();                              // ← new
        std::cout << current->label << " ";         // ← new
        if (current->right != nullptr) pending.push(current->right); // ← new
        if (current->left != nullptr) pending.push(current->left);   // ← new
    }                                                // ← new
}                                                    // ← new
```

### Introduce the Concept in Isolation

A tiny, escalating step before the real six-node tree: the same
three-node `X`/`Y`/`Z` shape from Concept Units 3–5, walked this one
new way:

```cpp
#include <iostream>
#include <string>
#include <stack>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    std::stack<TreeNode*> pending;
    pending.push(x);
    while (!pending.empty()) {
        TreeNode* current = pending.top();
        pending.pop();
        std::cout << current->label << " ";
        if (current->right != nullptr) pending.push(current->right);
        if (current->left != nullptr) pending.push(current->left);
    }
    std::cout << std::endl;

    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab4_iterative_preorder_tiny.cpp -o lab4 && ./lab4
X Y Z
```

`X Y Z` — identical to `preOrder(x)`'s recursive output on this exact
same tree, from Concept Unit 3. This is exactly what the real project's
`iterativePreOrder`, shown above, does — the smallest version of it,
proven against the smallest tree, before meeting the real six-node
tree next. This technique — walking a tree with a manually-managed
stack instead of recursive calls — is called an **iterative traversal**.

### Discard the Throwaway Example

This third and final use of the `X`/`Y`/`Z` tree is discarded once its
output is confirmed; `catalog_tree.cpp` only ever runs
`iterativePreOrder` against the real six-node tree from here on.

### Mechanical Walkthrough

Enumerating `iterativePreOrder`'s body, in order:

- **`void iterativePreOrder(TreeNode* root)`** — a function
  declaration, same mechanism as the three recursive traversal
  functions; the parameter is named `root` rather than `node` here
  specifically because, unlike the recursive versions (which are
  re-entered fresh, once per node, at every level), this function runs
  exactly once per call and needs a name for "the one fixed starting
  point of the whole walk."
- **`if (root == nullptr) return;`** — a base case, but a different
  kind from the recursive functions': this function isn't calling
  itself, so this line only guards against being handed an empty tree
  to begin with, not against a per-node absent child (that case is
  handled differently below, without recursion).
- **`std::stack<TreeNode*> pending;`** — declares a `std::stack`
  holding `TreeNode*` values (full treatment of `std::stack`'s real
  shape and behavior is in Concept Unit 6 and this lesson's Header) —
  this is the explicit, visible replacement for the call stack the
  recursive `preOrder` used invisibly.
- **`pending.push(root);`** — the `push` method (Concept Unit 6) adds
  the tree's root as the first, and so far only, node "not yet
  visited."
- **`while (!pending.empty())`** — loops for as long as there's at
  least one node still pending, same mechanism as Concept Unit 6's
  isolated lab.
- **`TreeNode* current = pending.top();`** — declares a local variable
  `current`, initialized to whatever `top()` (Concept Unit 6) currently
  returns — the most recently pushed, not-yet-visited node.
- **`pending.pop();`** — removes that same node from the stack, same
  mechanism as Concept Unit 6's lab; `current` still holds its address,
  since `pop()` only removes it from the stack, it doesn't invalidate
  the pointer value already copied into `current`.
- **`std::cout << current->label << " ";`** — prints the current
  node's label, same print mechanism used in every traversal function
  in this lesson. This is the moment this node counts as "visited."
- **`if (current->right != nullptr) pending.push(current->right);`**
  — pushes the right child onto the stack, but *only* if it actually
  exists; pushing `nullptr` itself would mean popping it back out later
  and dereferencing it, crashing the program — this check exists for
  exactly the same reason the recursive functions' `if (node ==
  nullptr) return;` base case exists, just phrased as "don't push it"
  instead of "stop if you got it."
- **`if (current->left != nullptr) pending.push(current->left);`** —
  the same check and push, for the left child, run second — and this
  ordering (right pushed before left) is the one genuinely subtle
  choice in this whole function, explained fully in the Execution
  Trace below.

### Execution Trace

Tracing `iterativePreOrder(a)` against the real six-node tree — same
tree, same expected `A B D E C F` output as recursive `preOrder`
produced in Concept Unit 3, but reached by manipulating `pending`
directly instead of by nested function calls:

```
Start:       pending = [a]
Iteration 1: current = a, pop → pending = []
             prints "A"
             push a->right (c) → pending = [c]
             push a->left  (b) → pending = [c, b]   (b on top)
Iteration 2: current = b, pop → pending = [c]
             prints "B"
             push b->right (e) → pending = [c, e]
             push b->left  (d) → pending = [c, e, d] (d on top)
Iteration 3: current = d, pop → pending = [c, e]
             prints "D"
             d->right is nullptr → not pushed
             d->left  is nullptr → not pushed
Iteration 4: current = e, pop → pending = [c]
             prints "E"
             e->right is nullptr → not pushed
             e->left  is nullptr → not pushed
Iteration 5: current = c, pop → pending = []
             prints "C"
             c->right is nullptr → not pushed
             push c->left (f) → pending = [f]
Iteration 6: current = f, pop → pending = []
             prints "F"
             f->right is nullptr → not pushed
             f->left  is nullptr → not pushed
Loop check:  pending.empty() is now true → loop ends
```

Every iteration's pop is explained by the same rule: `top()`/`pop()`
always removes whichever pointer was pushed most recently among those
still on the stack (LIFO, established in Concept Unit 6) — after
Iteration 1 pushes `c` then `b`, `b` (pushed second, i.e. more
recently) is popped first in Iteration 2, which is exactly why the
right child is pushed *before* the left child in the code: pushing
right-then-left means left ends up on top and gets popped — and
therefore visited — first, which is required for the output to match
pre-order's own node-left-right rule. Pushing them in the opposite
order would visit each subtree's nodes in the correct relative order
internally, but would process the entire right subtree before the left
one — still a valid, nameable traversal, just not this one.

Printed, in order: `A B D E C F` — identical, node for node, to
Concept Unit 3's recursive `preOrder(a)` output.

### CS Lens

That an explicit stack can reproduce recursion exactly, node for node,
is not a coincidence specific to this one function — it's a general,
foundational fact: any recursive algorithm can be rewritten iteratively
using an explicit stack that manually holds what the call stack would
otherwise hold automatically. Also recognized in: how an interpreter or
virtual machine (including the one running underneath languages like
Python) actually implements function calls — a real, explicit stack of
call frames, just one built into the runtime instead of written by an
application programmer; how a debugger's own "call stack" panel is
able to show pending calls at all, because that structure genuinely
exists as data, not just as an abstraction; and directly-related
algorithms across this same curriculum that convert other kinds of
recursion into explicit iteration for exactly this same reason (Track
E's own graph traversals face this identical choice between recursive
depth-first search and an explicit-stack iterative version).

### SE Lens

The tradeoff is now concrete, not just named: `preOrder` (four lines,
Concept Unit 3) is shorter and more directly readable than
`iterativePreOrder` (nine lines here) for the exact same result — the
recursive version is genuinely the better default when a tree's depth
is bounded and reasonable, which is true of everything built in this
lesson. What the iterative version buys back, at the cost of that extra
length: no dependency on the call stack's fixed size at all (a tree
too deep for recursion to survive can still be walked this way, since
`pending` lives on the heap through `std::stack`'s underlying
container, not on the bounded call stack), and a `pending` variable
that's real, inspectable data — a debugger can print its exact
contents at any pause point, where a recursive call stack's pending
work is comparatively opaque. Neither version is a strictly better
choice than the other in general; which one a real project reaches for
depends on whether stack-depth risk or code brevity matters more for
that specific tree.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab4_iterative_preorder_tiny.cpp -o lab4
```

Same flags as every previous unit.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab4_iterative_preorder_tiny.cpp -o lab4 && ./lab4
X Y Z
```

Against the real project's six-node tree, calling all four traversal
functions from `main`:

```cpp
std::cout << "pre-order (recursive): ";
preOrder(a);
std::cout << std::endl;

std::cout << "in-order:              ";
inOrder(a);
std::cout << std::endl;

std::cout << "post-order:            ";
postOrder(a);
std::cout << std::endl;

std::cout << "pre-order (iterative): ";
iterativePreOrder(a);                 // ← new
std::cout << std::endl;
```

```
$ clang++ -std=c++17 -Wall -Wextra catalog_tree.cpp -o catalog_tree && ./catalog_tree
pre-order (recursive): A B D E C F
in-order:              D B E A F C
post-order:            D E B F C A
pre-order (iterative): A B D E C F
```

(Verified this session by compiling and running the complete real
project file in exactly this state — every line of output above came
from an actual run, not a prediction.) The last two lines match
exactly, node for node: `iterativePreOrder`, with no recursion
anywhere in its body, reproduces `preOrder`'s output precisely.

### Connecting Sentence

All four traversal orders this lesson set out to build now exist, are
verified against each other, and are verified against the real,
six-node heap-allocated tree built in Concept Unit 2 — the Closing,
next, traces one single node through all four of them at once.

---

## Closing

### Connect the Pieces

Follow one node — `F` — through everything this lesson built, start to
finish:

1. **Built** (Concept Unit 2): `TreeNode* f = new TreeNode{"F",
   nullptr, nullptr};` allocates `F` on the heap as a leaf (both
   children `nullptr`), then `TreeNode* c = new TreeNode{"C", f,
   nullptr};` wires it in as `C`'s left child, and `C` itself becomes
   `A`'s right child.
2. **Pre-order** (Concept Unit 3): `F` is reached after `A`, `B`, `D`,
   `E`, and `C` — it's the fifth of six labels printed (`A B D E C F`),
   because pre-order finishes `A`'s entire left subtree (everything
   under `B`) before touching `A`'s right subtree at all, and once
   inside `C`'s subtree, `C` itself (the node) prints before its child
   `F` does.
3. **In-order** (Concept Unit 4): `F` is reached fifth again, but for a
   different structural reason — it's `D B E A F C` — `F` prints after
   `A` (which sits between the entire left and right sides of the whole
   tree) and before `C`, because `F` is `C`'s *left* child, and
   in-order visits a node's left subtree before the node itself.
4. **Post-order** (Concept Unit 5): `F` is reached fifth once more, in
   `D E B F C A` — but here `F` prints *before* its own parent `C`,
   because post-order guarantees every node is visited only after
   everything beneath it, and `F` is beneath `C`.
5. **Iterative pre-order** (Concept Unit 7): the stack-based version
   reaches `F` at Iteration 6, having popped it off `pending` — traced
   step by step in that unit's Execution Trace — and prints it as the
   sixth and final label, matching recursive pre-order's own placement
   of `F` exactly.

Same node, same tree, four different — and in every case, precisely
predictable — positions in the output, depending only on which of the
four rules was walking it.

### What Breaks Without This

Deleting `preOrder`'s base case on purpose, to see the real failure it
prevents:

```cpp
void preOrder(TreeNode* node) {
    // if (node == nullptr) return;   ← removed
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}
```

Compiled and run for real, against the same six-node tree:

```
$ clang++ -std=c++17 -Wall -Wextra break_no_base_case.cpp -o break_no_base_case && ./break_no_base_case
break_no_base_case.cpp:10:31: warning: all paths through this function will call itself [-Winfinite-recursion]
   10 | void preOrder(TreeNode* node) {
      |                               ^
1 warning generated.

$ echo "exit code: $?"
exit code: 139
```

Two real, verified failures, not one theoretical one: the compiler
itself catches the shape of the mistake at compile time
(`-Winfinite-recursion` — it can see that this function's every code
path calls itself, with nothing that could ever stop it), and running
the program anyway crashes it: exit code `139` is the shell's standard
way of reporting a process killed by a signal, decoded as
`128 + 11`, where `11` is `SIGSEGV` — a segmentation fault. What
actually happens: once a leaf node's absent left child (`nullptr`) is
passed into `preOrder` with the base case gone, the very next line
tries to read `node->label` through a null pointer — undefined
behavior that this machine's toolchain turns into an immediate crash.
No output reaches the terminal at all (`std::cout`'s output is
buffered and never gets flushed before the crash), which is itself a
real, if secondary, lesson: a crash can happen before any of a
program's buffered output is ever seen. Restoring the base case:

```cpp
void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}
```

### Exercises

- Add a seventh node as a new child of `E` (currently a leaf).
  Before running anything, write down, by hand, what you predict all
  four traversal outputs will become — then run the program and check.
- Write `iterativeInOrder`, an iterative version of `inOrder` (a
  genuinely harder rewrite than this lesson's `iterativePreOrder` — an
  explicit stack alone isn't quite enough; a second variable tracking
  "which node to visit next" is one workable approach). Verify its
  output against `inOrder`'s own recursive output, node for node, the
  same way this lesson verified `iterativePreOrder` against `preOrder`.
- Write a `countNodes` function using any one of the three recursive
  traversal shapes, returning an `int` instead of printing labels.
  Verify it reports `6` against this lesson's tree.

### Definition of Done

- [ ] `catalog_tree.cpp` compiles cleanly with `clang++ -std=c++17
      -Wall -Wextra`, no warnings.
- [ ] Running it prints all four traversal lines, and the two
      pre-order lines (recursive and iterative) match exactly.
- [ ] Every one of this lesson's seven Concept Units' isolated labs
      was actually compiled and run this session, with real pasted
      output, not written from memory.
- [ ] The base-case-removed failure was actually caused and observed
      (real compiler warning, real crash, real exit code), then
      reverted.
- [ ] `git commit -m "Give the project a way to walk nested data before
      Track B's patterns need one — Visitor, Iterator, and Composite
      all assume the reader can already name and predict how a tree
      gets visited"`
