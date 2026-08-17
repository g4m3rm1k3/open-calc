# Lesson B3: Looping Over a Shape That Isn't Flat

**What you will build** — A `Tree` wrapper around the root `TreeNode*`
and a `TreeIterator` that together let the six-node tree from Lessons
B1–B2 be walked with an ordinary `for (TreeNode& node : tree)` loop —
the exact same loop syntax C++ already uses for a `std::vector` or a
plain array. The transferable problem: every way this project has
walked the tree so far — three recursive functions, one manual
`std::stack` loop, `accept`/`Visitor`'s own internal walk — required
the *caller* to know the tree is a tree, and to reach for tree-specific
code to walk it. A caller that just wants "give me each node, one at a
time, in some sensible order" shouldn't have to know or care that the
underlying shape is a tree at all, any more than looping over a
`std::vector` requires knowing how `std::vector` stores its elements
internally.

**What you need to know first** — Lesson B1's `TreeNode` and its
`std::stack`-based `iterativePreOrder` function specifically — this
lesson takes that exact same walking logic and reshapes it, piece by
piece, into something that fits C++'s own iteration syntax instead of
a single stand-alone function. Lesson B2's `Visitor`/`accept` are not
required for this lesson's own code, but the same six-node tree and
its `quantity` field are reused unchanged.

**Terms used in this lesson**

- **iterator** — an object that remembers a position within some
  structure, and supports moving to the next position and reading the
  value at the current one — without the code using it needing to know
  anything about how that structure actually stores its elements. It
  exists so that "walk through this, one element at a time" can be
  written the same way regardless of whether the underlying structure
  is an array, a linked list, a tree, or anything else that can produce
  a sequence of elements.
- **operator overloading** — giving an existing operator symbol (`*`,
  `++`, `!=`, and others) a custom meaning for a user-defined type, by
  writing a function named `operator` followed by the symbol. It exists
  so that a user-defined type — here, `TreeIterator` — can be used with
  the same familiar symbols built-in types already use, instead of
  forcing callers to write differently-named methods for a concept
  (dereference, advance, compare) that already has standard notation.
- **dereference operator (`*`, as a prefix/unary operator)** — when
  overloaded on a type, a method named `operator*` that returns
  whatever value that object currently "points at" or represents. It
  exists, for an iterator specifically, so that `*it` reads as "the
  value at the iterator's current position," using the exact same
  syntax already familiar from dereferencing an ordinary pointer.
- **prefix increment operator (`++`, as `operator++()`, no parameter)**
  — when overloaded on a type, a method that advances the object to
  its next logical state and returns a reference to itself afterward.
  It exists, for an iterator, so that `++it` reads as "move to the next
  position," matching how `++` already means "advance" for an ordinary
  integer or pointer.
- **range-based for loop** — the `for (Type& name : range) { ... }`
  syntax, which the compiler expands into calls to `range.begin()`,
  `range.end()`, and repeated calls to `operator*`, `operator++`, and
  `operator!=` on whatever those return. It exists to let a loop over
  "every element of this thing" be written without manually managing an
  index or an iterator variable by hand.
- **sentinel** — a special value used specifically to signal "there is
  nothing more here," rather than representing real data. It exists
  because a loop needs *some* way to know when to stop; this lesson's
  `TreeIterator::end()` returns a sentinel — an iterator whose
  `current` is `nullptr` — that never corresponds to an actual node,
  only to "iteration is finished."
- **desugaring** — the process of expanding a piece of convenient
  syntax (like a range-based for loop) into the more verbose, explicit
  code it actually compiles down to. It exists as a name for
  "convenient syntax is not magic — it has a real, statable expansion,"
  which is exactly what this lesson's Mechanical Walkthrough shows for
  the range-based for loop, backed by a real compiler error later in
  this lesson proving the expansion is real, not asserted.

**Objects and methods used**

- **`TreeIterator`** (this lesson's own subject)
  - *What it is:* a class representing one position within a walk of
    the tree — the thing a range-based for loop actually manipulates
    on every iteration.
  - *Implementation:* built across this lesson's first two Concept
    Units; full shape shown there.
  - *Its use:* returned by `Tree::begin()` and `Tree::end()`, and
    manipulated automatically by every range-based for loop this
    project writes over a `Tree`.
- **`Tree`** (this lesson's own subject)
  - *What it is:* a thin wrapper around a `TreeNode*` root, whose only
    job is supplying `begin()` and `end()` so a `Tree` object can be
    the subject of a range-based for loop.
  - *Implementation:* built in this lesson's third Concept Unit; full
    shape shown there.
  - *Its use:* every place this project wants to loop over the tree
    with ordinary for-loop syntax, from here on, wraps the root
    `TreeNode*` in a `Tree` first.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`std::stack<TreeNode*>`**
  - *What it is:* the standard library LIFO container adaptor, already
    given full treatment (including its real declared shape) in Lesson
    B1.
  - *Implementation:* unchanged from Lesson B1.
  - *Its use:* `TreeIterator` reuses this exact type internally, to
    hold "nodes not yet visited" — the same role it played inside
    Lesson B1's `iterativePreOrder`, now living inside an iterator
    object instead of a single function's local variable.

---

## Concept Unit 1: A Class That Stands In For "Where You Are"

### The Problem

Looping over a `std::vector` or a plain array in C++ can be written as
`for (auto& x : container)`, with no visible index variable and no
knowledge, in the loop itself, of how that container actually stores
its elements. Nothing about this project's tree works that way yet —
every existing way to walk it (B1's recursive functions, B1's
`std::stack` loop, B2's `accept`) requires the caller to write
tree-specific code. Before that gap can close, something has to exist
that can *stand in* for "a position within a walk," independent of
whatever structure is actually being walked — an object that can be
asked "what's here right now" and told "move to the next one," using
syntax that already means exactly that for other types.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same
  as every Concept Unit in this project so far.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new class, placed above `main` — its exact
  placement relative to `TreeNode` is decided in Concept Unit 2, once
  the class actually needs to refer to `TreeNode`.
- **Dependencies** — none yet; this Concept Unit's own code is proven
  in isolation first, entirely separate from the real tree.

### The New Code

```cpp
int& operator*() {
    return *pointer;
}
```

### The Updated Project

This line doesn't yet belong to any real project code — Concept Unit
2, next, is where an equivalent method becomes part of
`catalog_tree.cpp` for real, once it's operating on `TreeNode` instead
of a raw `int*`. This Concept Unit's own code lives entirely inside the
isolated lab below.

### Introduce the Concept in Isolation

The smallest possible custom iterator: one that walks a plain array of
`int`s using nothing but a raw pointer underneath, proving the three
operators a range-based for loop actually needs can be given real,
working meanings for a user-defined type:

```cpp
#include <iostream>

class NumberIterator {
public:
    NumberIterator(int* pointer) : pointer(pointer) {}

    int& operator*() {
        return *pointer;
    }

    NumberIterator& operator++() {
        pointer++;
        return *this;
    }

    bool operator!=(const NumberIterator& other) const {
        return pointer != other.pointer;
    }

private:
    int* pointer;
};

class NumberRange {
public:
    NumberRange(int* data, int count) : data(data), count(count) {}

    NumberIterator begin() { return NumberIterator(data); }
    NumberIterator end() { return NumberIterator(data + count); }

private:
    int* data;
    int count;
};

int main() {
    int values[] = {10, 20, 30};
    NumberRange range(values, 3);

    for (int& v : range) {
        std::cout << v << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab1_minimal_iterator.cpp -o lab1 && ./lab1
10 20 30
```

`range` is a `NumberRange`, not an array and not any built-in
collection type — and `for (int& v : range)` still worked, printing
all three values in order. Nothing about this loop knows `NumberRange`
stores its data as a raw `int*` internally; it only ever calls
`begin()`, `end()`, and the three operators defined on
`NumberIterator`. This whole shape — an object standing in for "a
position," supporting move-to-next and read-here — is called an
**iterator**.

### Discard the Throwaway Example

`NumberIterator`, `NumberRange`, and `values` above existed only to
prove a custom iterator can drive a real range-based for loop. They're
discarded now; the next Concept Unit builds `TreeIterator` against the
real tree instead.

### Mechanical Walkthrough

Enumerating `NumberIterator` and `NumberRange`, in order:

- **`NumberIterator(int* pointer) : pointer(pointer) {}`** — a
  constructor taking a raw `int*` and storing it in the object's own
  `pointer` member, using a **member initializer list** (the
  `: pointer(pointer)` part, before the `{}` body) — this initializes
  the member directly from the constructor's parameter, which happens
  to share the same name; C++ resolves `pointer(pointer)` as "the
  member named `pointer`, initialized from the parameter named
  `pointer`," not as a name conflict.
- **`int& operator*()`** — overloads the dereference operator. The
  function name is literally `operator*` — this exact spelling is what
  tells the compiler "when someone writes `*someNumberIterator`, call
  this." It returns `int&` — a reference to the actual `int` at the
  current position, not a copy, so that `for (int& v : range)`'s own
  `v` genuinely refers to the underlying array element, not a
  disconnected duplicate.
- **`return *pointer;`** (inside `operator*`) — dereferences the raw
  `int* pointer` member itself, using the *built-in* meaning of `*` on
  an ordinary pointer (unrelated to the `operator*` being defined here,
  despite the same symbol) — this is what actually reads the value out
  of the array.
- **`NumberIterator& operator++()`** — overloads prefix increment
  (`++it`, not `it++`; C++ distinguishes the two with a dummy `int`
  parameter on the *postfix* version, not used in this lesson).
  Returns `NumberIterator&` — a reference to the just-modified object
  itself — matching how `++x` on an ordinary integer both changes `x`
  and evaluates to `x`'s new value.
- **`pointer++;`** (inside `operator++`) — advances the raw pointer by
  one `int`'s worth of memory, using the built-in meaning of `++` on an
  ordinary pointer — moving to the next array element.
- **`return *this;`** (inside `operator++`) — returns a reference to
  the current object (`this`, dereferenced), satisfying the
  `NumberIterator&` return type stated above.
- **`bool operator!=(const NumberIterator& other) const`** — overloads
  `!=`, comparing this iterator against another one. `const` (after
  the parameter list) promises this method doesn't modify the object
  it's called on — a real, compiler-checked promise, not just a
  comment, since comparing two positions should never itself change
  either one.
- **`return pointer != other.pointer;`** — compares the two raw
  pointers directly, using the built-in `!=` on `int*` — two iterators
  are "not equal" exactly when they point at different memory
  locations, which is precisely what a loop needs to know to decide
  whether it's finished.
- **`NumberIterator begin() { return NumberIterator(data); }`** (inside
  `NumberRange`) — constructs and returns a fresh iterator pointing at
  the very first element.
- **`NumberIterator end() { return NumberIterator(data + count); }`**
  — constructs and returns a **sentinel** iterator, pointing one
  position *past* the last real element (`data + count`, not
  `data + count - 1`) — this iterator is never meant to be
  dereferenced; it only ever exists to be compared against, to know
  when to stop.

### CS Lens

Separating "how to walk a structure" from "what the structure actually
is" — the exact thing an iterator does — is a foundational idea in
how programs handle collections generically. Also recognized in: every
standard library container in C++ (a `std::vector`'s iterator and a
`std::stack`'s underlying container both support this same shape);
Python's own iterator protocol (`__iter__`/`__next__`, a different
syntax for an identical idea); a database cursor, which lets code walk
millions of rows one at a time without loading them all into memory
first, using the exact same "give me the next one" shape.

### SE Lens

The alternative already available and already used in this project is
direct access — B1's `iterativePreOrder` and B2's `accept` both walk
the tree using tree-specific code (a `std::stack<TreeNode*>`, explicit
`left`/`right` checks) that only makes sense because the caller already
knows a `TreeNode` is being walked. An iterator's real cost, honestly
stated: writing `TreeIterator` (next Concept Unit) takes noticeably
more code than a single recursive function did in B1, for behavior
that, alone, isn't new — pre-order traversal, again. What that extra
code buys back: any piece of calling code that already knows how to
loop over *any* range-based-for-compatible type (a `std::vector`, an
array, anything) will also already know how to loop over a `Tree`,
with zero tree-specific knowledge required at the call site — a real
gain in interchangeability, at a real, one-time cost to build.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab1_minimal_iterator.cpp -o lab1
```

Same `clang++` flags used throughout this project.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab1_minimal_iterator.cpp -o lab1 && ./lab1
10 20 30
```

### Connecting Sentence

`NumberIterator` proved the three-operator shape works for a plain
array; the next Concept Unit builds the real `TreeIterator`, replacing
the raw `int*` with exactly the `std::stack`-based walk Lesson B1
already built and proved correct.

---

## Concept Unit 2: Wrapping the Stack-Based Walk in `operator++`

### The Problem

Lesson B1's `iterativePreOrder` already contains, inside one `while`
loop, the entire algorithm needed here: pop the current node, visit
it, push its children (right before left) so the left subtree comes
out first. An iterator needs that *exact* same logic, but reshaped —
instead of one function that runs the whole loop start to finish and
returns, the same steps have to be split apart: "set up the very first
position" (a constructor), "move to the next position" (`operator++`),
and "read what's here" (`operator*`), each callable independently,
with the walk's state (the pending stack, and which node is current)
surviving *between* those separate calls instead of living inside one
function's local variables for the loop's whole duration.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — `TreeIterator`'s full definition, placed below
  `TreeNode`'s definition and below `Visitor`/`TreeNode::accept` (it
  needs `TreeNode` to be complete, since it stores `TreeNode*` and
  returns `TreeNode&`) — above `main`.
- **Dependencies** — `<stack>`, already included since Lesson B1;
  `TreeNode`, already built.

### The New Code

```cpp
void advance() {
    if (pending.empty()) {
        current = nullptr;
        return;
    }
    current = pending.top();
    pending.pop();
    if (current->right != nullptr) pending.push(current->right);
    if (current->left != nullptr) pending.push(current->left);
}
```

### The Updated Project

`TreeIterator`'s complete definition, with `advance` as its one private
helper method, called from both the constructor and `operator++`
(shown together here since neither makes sense without the other —
this is the smallest version of `TreeIterator` that actually compiles
and does real work):

```cpp
class TreeIterator {
public:
    explicit TreeIterator(TreeNode* root) {
        if (root != nullptr) {
            pending.push(root);
            advance();
        }
    }

    TreeIterator() : current(nullptr) {}

    TreeNode& operator*() {
        return *current;
    }

    TreeIterator& operator++() {
        advance();
        return *this;
    }

    bool operator!=(const TreeIterator& other) const {
        return current != other.current;
    }

private:
    void advance() {                                        // ← new
        if (pending.empty()) {                               // ← new
            current = nullptr;                                // ← new
            return;                                            // ← new
        }                                                       // ← new
        current = pending.top();                                // ← new
        pending.pop();                                           // ← new
        if (current->right != nullptr) pending.push(current->right); // ← new
        if (current->left != nullptr) pending.push(current->left);   // ← new
    }                                                            // ← new

    TreeNode* current = nullptr;
    std::stack<TreeNode*> pending;
};
```

### Introduce the Concept in Isolation

No separate throwaway lab is needed for `advance` on its own — it's
the same `std::stack` push/pop/top/empty mechanism Lesson B1's
Concept Units 6 and 7 already isolated and proved correct (a lab
pushing plain integers, then a lab applying that exact shape to a tiny
tree), and Concept Unit 1's isolated lab, just above, already proved
the surrounding `operator*`/`operator++`/`operator!=` shape works. What
`advance` does is connect those two already-proven pieces directly:
`this is exactly what `iterativePreOrder`'s own `while` loop body does,
isolated to a single step` — one pass through `advance` is one
iteration of that same `while` loop, called from a different place
(the constructor, once, and `operator++`, repeatedly) instead of
looping internally.

### Discard the Throwaway Example

Nothing new to discard here — this Concept Unit's proof rests entirely
on already-discarded or already-proven material from Lesson B1 and
this lesson's own Concept Unit 1, cited above rather than re-run.

### Mechanical Walkthrough

Enumerating `TreeIterator`'s full definition, in order:

- **`explicit TreeIterator(TreeNode* root)`** — a constructor taking
  the tree's root. `explicit` prevents this constructor from being
  used for *implicit* conversions — without it, a `TreeNode*` could be
  silently converted into a `TreeIterator` anywhere one was expected
  (for example, accidentally passing a raw `TreeNode*` to a function
  wanting a `TreeIterator`, with the compiler quietly "helping" by
  converting it); `explicit` requires that conversion to be written
  out on purpose, `TreeIterator(root)`, catching an entire category of
  accidental-conversion mistakes at compile time instead of letting
  them compile silently.
- **`if (root != nullptr) { pending.push(root); advance(); }`** —
  guards against being constructed from an empty tree (a `nullptr`
  root); if there is a real root, it's pushed onto `pending` and
  `advance()` is called once immediately — this is what makes a
  freshly-constructed iterator already point *at* the first real node
  (`A`), rather than at some position *before* it that a caller would
  have to manually step past first, matching how a `std::vector`'s own
  `begin()` iterator already points at its first element.
- **`TreeIterator() : current(nullptr) {}`** — a second constructor,
  taking no arguments, explicitly initializing `current` to `nullptr`
  via a member initializer list (same mechanism as
  `NumberIterator`'s constructor in Concept Unit 1, applied to a
  different member). Two constructors on the same class, distinguished
  by their parameter lists, is called **constructor overloading** — a
  reappearing use of the same `operator`-style overload resolution
  the compiler already uses for `operator*`/`operator++`/`operator!=`
  themselves, just applied to constructors rather than operators. This
  is the constructor Concept Unit 3's `Tree::end()` will use, to
  produce the sentinel.
- **`TreeNode& operator*() { return *current; }`** — dereferences
  `current` (a raw `TreeNode*`), same built-in pointer-dereference
  mechanism explained in Concept Unit 1, now returning `TreeNode&`
  instead of `int&` — a reference to the real node, not a copy, so
  that reading `(*it).label` or, via a range-based for loop's own
  variable, `node.label`, reflects the actual tree, not a disconnected
  duplicate.
- **`TreeIterator& operator++() { advance(); return *this; }`** —
  prefix increment, same shape as `NumberIterator`'s, delegating its
  real work to `advance()` rather than repeating the stack-manipulation
  logic inline — a real design choice, not a requirement: `advance`
  exists as its own named method specifically because both the
  constructor and `operator++` need to do the identical "step forward
  one node" work, and writing it once, called from two places, avoids
  the exact kind of duplicated-logic cost this whole lesson exists to
  remove.
- **`bool operator!=(const TreeIterator& other) const { return current != other.current; }`**
  — same mechanism as `NumberIterator`'s `operator!=`, now comparing
  `TreeNode*` pointers instead of `int*` ones: two `TreeIterator`s are
  "not equal" exactly when they currently point at different nodes (or
  when exactly one of them is the `nullptr` sentinel and the other
  isn't).
- **`void advance()`** (declared `private`, below the `public:` methods
  above it) — a private helper, meaning code outside `TreeIterator`
  cannot call it directly; only `TreeIterator`'s own constructor and
  `operator++` can, which is intentional — `advance` is an internal
  implementation detail of "how stepping forward actually works," not
  part of the interface a range-based for loop (or any other caller)
  is meant to use directly.
- **`if (pending.empty()) { current = nullptr; return; }`** — the base
  case: once there's nothing left to visit, `current` becomes
  `nullptr`, which is exactly the value `TreeIterator()`'s sentinel
  constructor already set `end()`'s own `current` to — meaning a fully
  walked-through iterator naturally becomes equal to `end()`, which is
  precisely what stops a range-based for loop, explained fully in
  Concept Unit 3.
- **`current = pending.top(); pending.pop();`** — same `std::stack`
  mechanism Lesson B1 fully explained: read the most recently pushed,
  not-yet-visited node, then remove it.
- **`if (current->right != nullptr) pending.push(current->right); if (current->left != nullptr) pending.push(current->left);`**
  — the identical push-right-before-left ordering Lesson B1's
  `iterativePreOrder` used, for the identical reason: pushing right
  first means left ends up on top of the stack and gets popped —
  visited — first, which is what makes this walk produce pre-order
  specifically, not some other valid-but-different order.
- **`TreeNode* current = nullptr;`** and **`std::stack<TreeNode*> pending;`**
  — the two data members holding this iterator's entire state: which
  node it's currently "at," and which nodes are still waiting.
  `current`'s in-class initializer (`= nullptr`) is what makes the
  parameterized constructor's own `if (root != nullptr)` guard safe —
  even if that branch is skipped (an empty tree), `current` still ends
  up `nullptr`, never an uninitialized, unpredictable value.

### CS Lens

Splitting one self-contained loop into separately-callable "start,"
"step," and "read" operations, with the loop's own state surviving
between calls, is a specific, recognizable technique. Also recognized
in: a **coroutine** or **generator** — Track A's own Lesson A4 built
exactly this shape (a function that yields one value at a time, its
own progress remembered between calls) for a completely different
reason (processing a file too large for memory), using a different
mechanism, but solving the identical underlying problem of pausing and
resuming a walk instead of running it start-to-finish in one call; and
a video game's own per-frame update loop, where "world state" persists
between one frame's processing and the next, rather than being
recomputed from scratch each time.

### SE Lens

The specific tradeoff paid here, concretely: `TreeIterator` duplicates
`iterativePreOrder`'s exact algorithm — same stack, same push order,
same base case — rather than having `TreeIterator` call
`iterativePreOrder` internally. That's not an oversight; it's forced by
the shapes being genuinely incompatible: `iterativePreOrder` is built
to run its entire loop in one call and return only after visiting every
node, while `TreeIterator` needs to expose "one step" as its own
callable unit, pausable between any two nodes — no way to call
`iterativePreOrder` partially exists, short of rewriting it, which is
exactly what this Concept Unit's `advance()` is. The real cost, stated
plainly: this project now has the *same* traversal algorithm written
out twice, in two different shapes, for two different calling
conventions — a real, if small, duplication this lesson accepts because
the two shapes serve genuinely different callers (one wants a single
function call that does everything; one wants to loop with ordinary
for-loop syntax) rather than being the same need expressed two
different ways by accident.

### Commands Needed

No new flags; same `clang++ -std=c++17 -Wall -Wextra` invocation used
throughout this project.

### Run It — Real Output

`TreeIterator` cannot be run standalone yet — nothing constructs one
and drives it through a loop until `Tree::begin()`/`Tree::end()` exist,
built in the next Concept Unit. Its individual pieces (`advance`'s
stack logic, `operator*`, `operator++`, `operator!=`) are each already
proven correct, in isolation, by Lesson B1's own verified traversal
work and this lesson's Concept Unit 1 lab, cited above.

### Connecting Sentence

`TreeIterator` can now represent a position in the walk and move
itself forward one step at a time; the next Concept Unit gives the
tree itself a `begin()` and `end()` so a plain `for` loop can actually
drive it.

---

## Concept Unit 3: Making the Tree Itself Loop-Ready

### The Problem

A range-based for loop needs something to call `.begin()` and `.end()`
*on* — and the tree, right now, is just a raw `TreeNode* a` sitting in
`main`, not an object with methods of its own. `for (TreeNode& node : a)`
cannot work, no matter how complete `TreeIterator` is, because a raw
pointer has no `begin()`/`end()` to call. Something has to wrap that
root pointer in a real object whose only job is supplying those two
methods.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new class, `Tree`, placed directly below
  `TreeIterator`; the loop itself is added inside `main`.
- **Dependencies** — `TreeIterator`, built in Concept Unit 2.

### The New Code

```cpp
TreeIterator begin() { return TreeIterator(root); }
TreeIterator end() { return TreeIterator(); }
```

### The Updated Project

`Tree`'s complete definition — a small class whose only members are a
constructor and these two methods:

```cpp
class Tree {
public:
    explicit Tree(TreeNode* root) : root(root) {}

    TreeIterator begin() { return TreeIterator(root); }   // ← new
    TreeIterator end() { return TreeIterator(); }         // ← new

private:
    TreeNode* root;
};
```

And in `main`, wrapping the existing root `a` and looping over it:

```cpp
Tree tree(a);

std::cout << "range-for:              ";
for (TreeNode& node : tree) {
    std::cout << node.label << " ";
}
std::cout << std::endl;
```

### Introduce the Concept in Isolation

No new isolated lab is needed for `Tree` itself — it reuses
`NumberRange`'s exact shape from Concept Unit 1's lab (a small wrapper
supplying `begin()`/`end()`), already proven to work with a real
range-based for loop; what's new is only that it wraps a `TreeNode*`
and returns `TreeIterator`s instead of wrapping an `int*` and returning
`NumberIterator`s. The range-based for loop's own mechanics, though,
get one further isolated proof below — specifically, real evidence
that the loop truly calls `operator!=` the way this lesson has claimed
throughout, not just a description of what it "generally does":

```cpp
class NumberIterator {
public:
    NumberIterator(int* pointer) : pointer(pointer) {}
    int& operator*() { return *pointer; }
    NumberIterator& operator++() { pointer++; return *this; }
    // operator!= deliberately omitted
private:
    int* pointer;
};

class NumberRange {
public:
    NumberRange(int* data, int count) : data(data), count(count) {}
    NumberIterator begin() { return NumberIterator(data); }
    NumberIterator end() { return NumberIterator(data + count); }
private:
    int* data;
    int count;
};

int main() {
    int values[] = {10, 20, 30};
    NumberRange range(values, 3);
    for (int& v : range) { std::cout << v << " "; }
    return 0;
}
```

Compiled for real, with `operator!=` deliberately left out:

```
$ clang++ -std=c++17 -Wall -Wextra lab_missing_notequal.cpp -o lab_missing_notequal
lab_missing_notequal.cpp:38:17: error: invalid operands to binary expression ('NumberIterator' and 'NumberIterator')
   38 |     for (int& v : range) {
      |                 ^
lab_missing_notequal.cpp:38:19: note: in implicit call to 'operator!=' for iterator of type 'NumberRange'
   38 |     for (int& v : range) {
      |                   ^~~~~
lab_missing_notequal.cpp:26:20: note: selected 'begin' function with iterator type 'NumberIterator'
   26 |     NumberIterator begin() { return NumberIterator(data); }
      |                    ^
1 error generated.
```

Real, compiler-produced proof — not an assertion — that the range-based
for loop's own expansion genuinely calls `operator!=` on the iterator
type: the compiler's own error names "`operator!=` for iterator of
type `NumberRange`" directly. This is called **desugaring**: the
compact `for (x : range)` syntax is not a special, opaque loop form —
it expands into ordinary calls to `begin()`, `end()`, `operator*`,
`operator++`, and `operator!=`, exactly the four members this lesson's
`TreeIterator` and `Tree` supply, and nothing more.

### Discard the Throwaway Example

This second appearance of `NumberIterator`/`NumberRange`, deliberately
missing one operator, is discarded once its compiler error is
understood; `catalog_tree.cpp`'s own `TreeIterator` already has a
correct `operator!=`, built in Concept Unit 2.

### Mechanical Walkthrough

Enumerating `Tree`'s definition and its use in `main`:

- **`explicit Tree(TreeNode* root) : root(root) {}`** — same
  constructor mechanism as `TreeIterator`'s own parameterized
  constructor (Concept Unit 2): `explicit` blocks accidental implicit
  conversions from a raw `TreeNode*`, and the member initializer list
  stores the parameter into `Tree`'s own `root` member.
- **`TreeIterator begin() { return TreeIterator(root); }`** —
  constructs and returns a `TreeIterator` positioned at the tree's
  actual root, using the parameterized constructor from Concept Unit
  2, which immediately calls `advance()` once so this returned
  iterator already points at the first real node.
- **`TreeIterator end() { return TreeIterator(); }`** — constructs and
  returns the sentinel `TreeIterator`, using the no-argument
  constructor from Concept Unit 2, whose `current` is `nullptr` and
  will never be dereferenced — it exists only to be compared against.
- **`Tree tree(a);`** (inside `main`) — constructs a `Tree`, wrapping
  the existing root pointer `a` (built back in Lesson B1) — `a` itself
  is completely unchanged by this; `tree` merely holds a copy of that
  same pointer value.
- **`for (TreeNode& node : tree)`** — the range-based for loop itself.
  Per this lesson's own Header ("desugaring"), this line expands,
  roughly, into:
  1. `auto __begin = tree.begin();` — calls `Tree::begin()` once, up
     front, producing a `TreeIterator` already positioned at `A`.
  2. `auto __end = tree.end();` — calls `Tree::end()` once, up front,
     producing the sentinel.
  3. A hidden loop: `while (__begin != __end) { TreeNode& node = *__begin; /* loop body */ ++__begin; }`
     — comparing the two iterators with `operator!=` (proven above to
     be a real, necessary call, not an assumed one), reading the
     current node with `operator*`, running the loop body, then
     advancing with prefix `operator++`.
- **`std::cout << node.label << " ";`** (the loop body) — same print
  mechanism used throughout this project, now reading `label` off
  `node`, which `operator*` supplied as a real reference to the actual
  node currently being visited by `TreeIterator`'s internal walk.

### Execution Trace

The hidden loop desugaring above, traced against this project's real
six-node tree (same shape as every previous lesson: `A` → `B`, `C`;
`B` → `D`, `E`; `C` → `F`, `nullptr`):

```
__begin = tree.begin()   → TreeIterator(a) constructed, advance() runs once:
                            pending=[a] → pop a, current=a, push a->right(c), push a->left(b)
                            → pending=[c, b], current=A
__end   = tree.end()     → TreeIterator() constructed, current=nullptr

Check: __begin != __end  → current(A) != nullptr → true, loop runs
  *__begin → A            → prints "A "
  ++__begin → advance():   pending=[c] after pop b, current=B, push b->right(e), push b->left(d)
                            → pending=[c, e, d], current=B
Check: __begin != __end  → true
  *__begin → B            → prints "B "
  ++__begin → advance():   pop d, current=D, d->right nullptr (skip), d->left nullptr (skip)
                            → pending=[c, e], current=D
Check: __begin != __end  → true
  *__begin → D            → prints "D "
  ++__begin → advance():   pop e, current=E, e->right nullptr (skip), e->left nullptr (skip)
                            → pending=[c], current=E
Check: __begin != __end  → true
  *__begin → E            → prints "E "
  ++__begin → advance():   pop c, current=C, c->right nullptr (skip), push c->left(f)
                            → pending=[f], current=C
Check: __begin != __end  → true
  *__begin → C            → prints "C "
  ++__begin → advance():   pop f, current=F, f->right nullptr (skip), f->left nullptr (skip)
                            → pending=[], current=F
Check: __begin != __end  → true
  *__begin → F            → prints "F "
  ++__begin → advance():   pending is empty → current=nullptr
Check: __begin != __end  → current(nullptr) != nullptr → false, loop ends
```

Every value printed, in order — `A B D E C F` — matches every previous
lesson's pre-order output exactly, and every single transition above
is explained by the same rule each time: `advance()` pops the most
recently pushed node (LIFO, per Lesson B1), makes it `current`, and
pushes its real children, right before left.

### CS Lens

That `for (x : range)` is just ordinary method calls wearing convenient
syntax — proven here by an error message naming the exact hidden call
— is itself an instance of a broader, recognizable idea: convenient
syntax that expands into more explicit, ordinary code underneath.
Also recognized in: Python's own `for x in y` (expanding to explicit
`__iter__`/`__next__` calls); JavaScript's `for...of` loop (an
identical desugaring to a hidden iterator protocol); and, within this
same project, Track A's Lesson A6's comparator lambda, which itself
desugars into an ordinary callable object under the hood, even though
it reads as a compact inline expression at the call site.

### SE Lens

The design choice being reinforced, not a new one: keeping `Tree` as a
*thin* wrapper — two methods, one member, no traversal logic of its own
— rather than folding `TreeIterator`'s own walking logic directly into
`Tree` is a deliberate separation of concerns. `Tree`'s only job is
"can be looped over"; `TreeIterator`'s only job is "remembers a
position and can advance." Collapsing them into one class would work,
functionally, but would mean any future *second* way of walking the
tree (say, an in-order iterator, left as this lesson's own Exercise)
would require either a second, differently-named wrapper class or
extra flags/parameters bolted onto the existing one — keeping them
separate means a new iterator type can be introduced later without
touching `Tree` at all, the same "add without editing" benefit Lesson
B2's Visitor pattern already established for operations, now applied
to walk order instead.

### Commands Needed

No new flags; same `clang++ -std=c++17 -Wall -Wextra` invocation used
throughout this project.

### Run It — Real Output

The complete real project, compiled and run in exactly this state —
every function and class from Lessons B1 and B2, plus this lesson's
`TreeIterator` and `Tree`:

```
$ clang++ -std=c++17 -Wall -Wextra step_treeiterator.cpp -o step_treeiterator && ./step_treeiterator
range-for:              A B D E C F
```

(Verified this session by compiling and running the real project file
in this exact state — `Tree`, `TreeIterator`, and the range-based for
loop, over the real six-node tree, with no separate
`preOrder`/`accept`-style helper called directly by name anywhere in
`main`'s new loop.)

### Connecting Sentence

The tree can now be walked with the exact same loop syntax any
standard C++ collection uses — the Closing, next, proves the
consequence of getting the push order inside `advance()` wrong, the
same way Lesson B1's Closing did for `iterativePreOrder`.

---

## Closing

### Connect the Pieces

Follow node `C` through the full range-based for loop, start to
finish:

1. `Tree tree(a);` wraps the existing root pointer in a `Tree` object;
   `C` itself is untouched — it already existed, built back in Lesson
   B1's Concept Unit 2, as `A`'s right child.
2. `tree.begin()` constructs a `TreeIterator`, whose constructor pushes
   `a` and calls `advance()` once, landing on `A` and pushing `c` (then
   `b`, on top of it) — `C` is now sitting in `pending`, waiting.
3. Four calls to `operator++` later (after `A`, `B`, `D`, `E` have each
   been visited and popped, per this lesson's own Execution Trace),
   `advance()` finally pops `c` itself, setting `current` to `C` and
   pushing `f` (its one real child) — `*__begin` at this exact point
   returns a `TreeNode&` referring to `C`, and the loop body prints
   `"C "`.
4. One more `operator++` call pops `f`, setting `current` to `F` — `C`
   itself is never visited a second time; `TreeIterator` has already
   moved on, exactly once per node, the same guarantee every earlier
   traversal in this project already gave.

### What Breaks Without This

Swapping `advance()`'s push order — left before right, instead of
right before left — on purpose:

```cpp
// bug: left pushed before right (swapped from the correct order)
if (current->left != nullptr) pending.push(current->left);
if (current->right != nullptr) pending.push(current->right);
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra break_wrong_push_order.cpp -o break_wrong_push_order && ./break_wrong_push_order
range-for (buggy push order): A C F B E D
```

A real, verified wrong answer, not a crash — the loop still runs to
completion, still visits every node exactly once, and still compiles
without a single warning, because nothing about this mistake is
syntactically invalid; it's a pure logic error. `A` still prints first
(it's still the root), but `C` — normally reached fifth — now prints
second, because pushing `current->left` before `current->right` puts
`right` on *top* of the stack instead of `left`, so `advance()` pops
and visits the entire right subtree (`C`, then `F`) before ever
reaching `B`. This is the exact same failure mode Lesson B1's own
Closing demonstrated for `iterativePreOrder`, reproduced here to show
it applies identically once that logic moves inside an iterator's
`advance()` method — wrapping an algorithm in a new shape doesn't
change what makes that algorithm correct. Restoring the correct order:

```cpp
if (current->right != nullptr) pending.push(current->right);
if (current->left != nullptr) pending.push(current->left);
```

### Exercises

- Write a second iterator type, `InOrderTreeIterator`, and a matching
  `Tree::beginInOrder()`/`Tree::endInOrder()` pair (`Tree::begin()`/
  `end()` stay pre-order, unchanged), so a caller can opt into
  Lesson B1's in-order sequence through the exact same
  `operator*`/`operator++`/`operator!=` shape. Verify its output
  matches `inOrder`'s recursive output, `D B E A F C`, exactly.
- Add a `bool empty() const` method to `Tree` that returns whether
  `root == nullptr`, and write a throwaway test tree with a `nullptr`
  root to confirm a range-based for loop over an empty `Tree` runs its
  body zero times, not once with a garbage node.
- Predict, by hand, what a range-based for loop over `tree` would
  print if `D` (currently a leaf) gained two new leaf children of its
  own — then actually add them and confirm.

### Definition of Done

- [ ] `catalog_tree.cpp` compiles cleanly with `clang++ -std=c++17
      -Wall -Wextra`, no warnings.
- [ ] The new `range-for:` output line matches `pre-order (recursive):`
      exactly.
- [ ] Every isolated lab in this lesson, including the deliberately
      broken `operator!=`-omitted one, was actually compiled this
      session, with real pasted output or a real pasted error.
- [ ] The wrong-push-order failure was actually caused, run, and
      observed to produce `A C F B E D`, then reverted.
- [ ] `git commit -m "Let the catalog tree be looped over with
      ordinary for-loop syntax, so future code that already knows how
      to loop over any collection doesn't need tree-specific knowledge
      to walk this one"`
