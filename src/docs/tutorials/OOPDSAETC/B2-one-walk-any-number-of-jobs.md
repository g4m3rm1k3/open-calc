# Lesson B2: One Walk, Any Number of Jobs

**What you will build** — Three new, independent read-only operations
over the same six-node tree from Lesson B1 — print every label, count
every node, total a new per-node quantity — added without writing three
new copies of the tree-walking recursion, and without changing
`TreeNode`'s own shape more than once. The transferable problem: once a
piece of data has more than one thing done to it (printed, summed,
counted, and whatever comes next), hard-coding each new operation as
its own function that re-walks the structure from scratch means the
*walking* logic — which is really the same every time — gets
duplicated once per operation, and any future change to how the
structure is walked has to be repeated in every single one of those
copies.

**What you need to know first** — Lesson B1's `TreeNode` struct and its
six-node tree, and the recursive traversal shape it already
established (a function visiting a node, then recursively visiting its
children). Track A's Lesson A5, which put interchangeable behavior
behind one shared interface so a caller never has to change — this
lesson reuses that same idea, applied to *which operation runs at each
node* instead of *which lines get kept*.

**Terms used in this lesson**

- **Visitor** — a design pattern where new operations over a fixed
  structure are added as separate objects, each implementing a common
  interface, rather than as new methods on the structure's own classes.
  It exists so that adding operation number four never requires editing
  the node type that operations one through three already depend on —
  only the node type's *own* interface (one method: "accept a visitor")
  has to stay fixed, no matter how many operations get added later.
- **abstract base class** — a class that declares at least one method
  with no implementation of its own (a **pure virtual function**,
  below), which means it can never be instantiated directly — only a
  subclass that supplies a real implementation for every such method
  can be. It exists to name a *shared interface* without committing to
  any one specific behavior — `Visitor` itself is never a concrete
  visitor; it only states "every real visitor must supply a `visit`
  method," leaving what that method actually does entirely up to each
  subclass.
- **pure virtual function** — a virtual method declared with `= 0`
  instead of a body (`virtual void visit(TreeNode& node) = 0;`),
  meaning the class that declares it makes no promise about what this
  method does — only that every concrete subclass must supply one. It
  exists to make "this method must exist, but this class isn't the one
  defining it" an enforceable rule the compiler checks, rather than a
  convention a subclass could silently forget to follow.
- **`override`** — a keyword placed after a method's parameter list,
  telling the compiler "this method is meant to replace a virtual
  method inherited from a base class." It exists purely as a safety
  net: without it, a method that was *meant* to override a base class's
  virtual method but doesn't quite match its signature (a typo in the
  name, a mismatched parameter type) silently becomes an unrelated new
  method instead of an error — `override` turns that silent mismatch
  into a compile-time error, at the exact line where the mismatch is.
- **double dispatch** — resolving which specific behavior to run based
  on *two* objects' runtime types instead of one, achieved by two
  chained virtual calls (`node.accept(visitor)`, which itself calls
  `visitor.visit(node)`). It exists because a single virtual call only
  lets one object's type decide what runs; Visitor specifically needs
  the *combination* of "which kind of node is this" and "which
  operation is currently running" to decide the behavior, which is more
  than a single virtual call alone can express.
- **forward declaration** — a statement naming a type (`class Visitor;`)
  without yet defining it, telling the compiler "this name refers to a
  type that will be fully defined later in this file." It exists to
  break exactly the kind of circular dependency this lesson's own code
  runs into: `TreeNode` needs to mention `Visitor` in a method
  signature, and `Visitor` needs to mention `TreeNode` in one of its
  own — one of the two has to be nameable before it's fully defined, or
  neither could ever compile.
- **class vs. struct** — in C++, the only actual difference between
  the keywords `class` and `struct` is the default access level for
  their members (`private` for `class`, `public` for `struct`) —
  otherwise they are the exact same kind of thing. It exists as a
  naming *convention*, not a technical requirement: this project uses
  `struct` for `TreeNode` (plain data, no invariant to protect) and
  `class` for `Visitor` and its subclasses (types defined by their
  behavior/interface), signaling that distinction to a reader even
  though the compiler does not enforce it.

**Objects and methods used**

- **`Visitor`** (this lesson's own subject)
  - *What it is:* an abstract base class declaring the one operation
    every concrete visitor must implement.
  - *Implementation:* declared in this lesson's Concept Unit 1 as
    ```cpp
    class Visitor {
    public:
        virtual void visit(TreeNode& node) = 0;
    };
    ```
    One pure virtual method, `visit`, taking a `TreeNode&`. `Visitor`
    itself has no data members and can never be instantiated — only
    `PrintVisitor`, `CountVisitor`, and `SumVisitor` (below) can be.
  - *Its use:* every new read-only operation this lesson adds is a new
    subclass of `Visitor`, never a new method on `TreeNode`.
- **`TreeNode::accept`** (this lesson's own subject, extending B1's
  `TreeNode`)
  - *What it is:* a member method added to `TreeNode` — its first ever
    — that hands the current node to a `Visitor` and then recurses into
    both children.
  - *Implementation:* declared inside `TreeNode`'s own definition as
    `void accept(Visitor& visitor);` and defined, once `Visitor` is
    fully known, as
    ```cpp
    void TreeNode::accept(Visitor& visitor) {
        visitor.visit(*this);
        if (left != nullptr) left->accept(visitor);
        if (right != nullptr) right->accept(visitor);
    }
    ```
  - *Its use:* `accept` is the *only* place this lesson's own
    tree-walking logic lives — every visitor this lesson builds reuses
    this exact same walk by calling `someNode->accept(someVisitor)`,
    instead of writing its own recursive walk from scratch.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`TreeNode`**
  - *What it is:* the tree node struct built in Lesson B1.
  - *Implementation:* extended in this lesson's Concept Unit 3 with one
    new member, shown there in full.
  - *Its use:* the type every visitor in this lesson operates on.

---

## Concept Unit 1: A Base Class Two Different Types Can Both Be

### The Problem

Lesson B1 already needed three genuinely different operations over the
same tree — pre-order print, in-order print, post-order print — and
built each one as its own free function, each with its own copy of the
recursive walk (visit left, visit right, in whatever order). That was
the right call in B1, because the *order itself* was the actual
concept being taught. But it exposes a real cost going forward: every
one of those three functions independently re-implements "how to visit
every node," and any new read-only operation — counting nodes, summing
a value, anything else — would mean writing a fourth (or fifth, or
sixth) function that copies that same walk pattern yet again. What's
needed is a way to write the walk exactly once, and let *what happens
at each node* vary independently, without touching the walk each time
it does.

### Project Change

- **Reference Source** — No reference counterpart; this project builds
  its own tree directly, not from a parser, per Lesson B1's own scoping
  decision.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new class definition, placed above `TreeNode`'s own
  definition (forward-declared) and below it (fully defined), plus one
  new declaration inside `TreeNode` itself; a new concrete class below
  both.
- **Dependencies** — none beyond what Lesson B1 already built.

### The New Code

```cpp
class Visitor;
```

### The Updated Project

This one line is new, freestanding text at the very top of the file,
above everything Lesson B1 built — nothing existing is being changed
yet, so there's no larger enclosing structure to show it inside of.
What it enables comes next.

### Introduce the Concept in Isolation

A minimal proof that the same function call can run genuinely
different code depending on which object is handed to it — nothing
about trees yet:

```cpp
#include <iostream>

class Greeter {
public:
    virtual void greet() = 0;
};

class FriendlyGreeter : public Greeter {
public:
    void greet() override {
        std::cout << "hello!" << std::endl;
    }
};

class FormalGreeter : public Greeter {
public:
    void greet() override {
        std::cout << "good evening." << std::endl;
    }
};

void announce(Greeter& g) {
    g.greet();
}

int main() {
    FriendlyGreeter f;
    FormalGreeter form;

    announce(f);
    announce(form);
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab1_virtual_dispatch.cpp -o lab1 && ./lab1
hello!
good evening.
```

`announce` is a single function, with a single line of code
(`g.greet();`), called twice with two different objects — and it
printed two different things. `g`'s declared type is `Greeter&` both
times; the *actual* behavior that ran depended on which real object
(`f` or `form`) was behind that reference at the moment of the call,
not on anything `announce` itself decided. This is called **dynamic
dispatch**, and a class like `Greeter` — one that only declares *that*
`greet()` must exist, without saying what it does — is called an
**abstract base class**, enforced here by writing `= 0` after the
method, which makes it a **pure virtual function**.

### Discard the Throwaway Example

`Greeter`, `FriendlyGreeter`, `FormalGreeter`, and `announce` above
existed only to prove dynamic dispatch works. They're discarded now;
this project applies the same mechanism to `Visitor` and `TreeNode`
next.

### Mechanical Walkthrough

Enumerating the isolated lab's declarations, in order:

- **`class Greeter { public: virtual void greet() = 0; };`** —
  declares an abstract base class. `class` (rather than `struct`) is
  used here because `Greeter` is defined by its *behavior* (one
  required method), not by holding plain data — a convention this
  project follows consistently, explained under "class vs. struct" in
  this lesson's Header. `virtual` marks `greet` as a method whose
  actual implementation is resolved at runtime, based on the real
  object's type, rather than fixed at compile time. `= 0` (instead of
  a `{ ... }` body) makes it a pure virtual function — `Greeter` itself
  supplies no implementation, and, as a direct consequence, `Greeter`
  can never be instantiated on its own (`Greeter g;` would be a
  compile error) — only a subclass that implements `greet` can be.
- **`class FriendlyGreeter : public Greeter { ... };`** — declares a
  new class that **inherits** from `Greeter`, using `public`
  inheritance (meaning everything `Greeter` makes public stays public
  in `FriendlyGreeter` too). This is the mechanism that makes
  `FriendlyGreeter` *count as* a `Greeter` — anywhere a `Greeter&` is
  expected, a `FriendlyGreeter` object can be passed.
- **`void greet() override { ... }`** (inside `FriendlyGreeter`) — a
  concrete implementation of `greet`, finally giving `Greeter`'s
  promised method real behavior. `override` states explicitly "this is
  meant to replace `Greeter`'s virtual `greet`" — the compiler checks
  that a base class method with a matching name and signature actually
  exists, and refuses to compile if it doesn't (proven for real,
  against this exact code, in this unit's Closing-style failure demo
  later in the lesson).
- **`class FormalGreeter : public Greeter { ... };`** and its own
  **`void greet() override { ... }`** — a second, independent subclass
  of `Greeter`, same mechanism as `FriendlyGreeter`, with its own,
  different implementation of `greet`. Two different subclasses
  implementing the same required method differently is precisely what
  makes the next line's behavior worth noticing.
- **`void announce(Greeter& g) { g.greet(); }`** — a function taking a
  reference to the *base* type, `Greeter&`, not either subclass
  specifically. `g.greet();` looks, at the point this function is
  compiled, like it could only ever mean one thing — but because
  `greet` is `virtual`, the actual method that runs is determined by
  `g`'s real, runtime type, not its declared type.
- **`FriendlyGreeter f; FormalGreeter form;`** — two concrete objects,
  one of each subclass.
- **`announce(f); announce(form);`** — the same function, called with
  two different concrete objects. `f`'s real type is
  `FriendlyGreeter`, so `g.greet()` inside `announce` resolves to
  `FriendlyGreeter::greet` for that call; `form`'s real type is
  `FormalGreeter`, so the second call resolves to
  `FormalGreeter::greet` instead — same source line inside
  `announce`, two different methods actually running.

### CS Lens

Dynamic dispatch through a shared abstract interface is the mechanism
underneath most of object-oriented programming's own flexibility. Also
recognized in: every GUI framework's event handlers (a `Button` and a
`Checkbox` both respond to "clicked" through the same interface, each
in their own way); a plugin system loading unknown implementations of
a known interface at runtime; and, most directly, Track A's own Lesson
A5, which used this identical mechanism (an abstract interface, and
one method call resolving differently per concrete subclass) to
implement the Strategy pattern — Visitor, this lesson's actual subject,
is best understood as Strategy's close relative: both put swappable
behavior behind a shared interface; Visitor's distinguishing feature,
covered in this same Concept Unit's project code below, is that the
*data structure itself* — not the caller — decides when to hand control
to that behavior.

### SE Lens

The alternative to a shared abstract interface here would be a single
function with a big `if`/`else if` chain checking some kind of "mode"
flag or type tag, doing different work in each branch. That's rejected
specifically because it doesn't scale the way this lesson's project
needs to: every new operation would mean editing that one function
again, adding another branch — exactly the coupling an abstract
interface avoids, since a brand-new `Visitor` subclass never requires
touching any existing code at all, only adding a new, independent one.
The real cost being taken on: an extra class per operation, and one
extra virtual function call at each node compared to a plain function
call — a real, if small, runtime cost, worth naming honestly rather
than pretending indirection through an interface is ever completely
free.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab1_virtual_dispatch.cpp -o lab1
```

Same `clang++` flags used throughout Lesson B1 — `-std=c++17` to target
this whole lesson's language version, `-Wall -Wextra` to surface
questionable-but-legal code instead of hiding it, `-o lab1` to name the
compiled program.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab1_virtual_dispatch.cpp -o lab1 && ./lab1
hello!
good evening.
```

The real project's own `class Visitor;` forward declaration cannot be
checked standalone yet — it has no visible effect until `TreeNode` and
`Visitor` are both actually built out, in the rest of this Concept
Unit below.

### Connecting Sentence

The isolated lab proved dynamic dispatch works with a throwaway
`Greeter` type; the rest of this Concept Unit applies that exact same
mechanism to `Visitor` and `TreeNode`, so operations over the real tree
can be swapped the same way `announce`'s behavior just was.

---

Continuing Concept Unit 1's project code — the forward declaration
above exists specifically to make the next two pieces possible.

### Project Change (continued)

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add (a new method declaration inside `TreeNode`;
  a new class, `Visitor`, fully defined; a new method definition for
  `TreeNode::accept`; a new class, `PrintVisitor`).
- **Location** — the `accept` declaration goes inside `TreeNode`'s own
  definition (from Lesson B1), as a new, last member; `Visitor`'s full
  definition goes directly below `TreeNode`'s closing `};`;
  `TreeNode::accept`'s body goes directly below `Visitor`;
  `PrintVisitor` goes directly below that.
- **Dependencies** — the `class Visitor;` forward declaration above,
  without which `TreeNode`'s new `accept` declaration would not
  compile (proven directly, for real, below).

### The New Code

```cpp
void accept(Visitor& visitor);
```

### The Updated Project

`TreeNode`, as Lesson B1 left it, with this one new line added as its
final member:

```cpp
struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;

    void accept(Visitor& visitor);   // ← new
};
```

`TreeNode` now declares that it can `accept` a `Visitor` — though
`Visitor` itself doesn't exist yet at this exact point in the file,
which is exactly why the forward declaration from earlier in this same
Concept Unit is required here, not optional. Proof, not assertion:
removing that forward declaration and trying to compile this exact
`TreeNode` produces a real error —

```
$ clang++ -std=c++17 -Wall -Wextra lab3_why_forward_declare.cpp -o lab3_bad
lab3_why_forward_declare.cpp:9:17: error: unknown type name 'Visitor'
    9 |     void accept(Visitor& visitor);
      |                 ^
1 error generated.
```

— the compiler has no idea what `Visitor` refers to yet, because
nothing has told it "a type by this name exists" before this line is
read. The one-line forward declaration (`class Visitor;`) is exactly
what tells it that, without requiring `Visitor`'s full definition to
exist yet.

`Visitor` itself, fully defined now that `TreeNode` above it is
complete:

```cpp
class Visitor {
public:
    virtual void visit(TreeNode& node) = 0;
};
```

`TreeNode::accept`'s actual body, defined now that `Visitor` above it
is complete:

```cpp
void TreeNode::accept(Visitor& visitor) {
    visitor.visit(*this);
    if (left != nullptr) left->accept(visitor);
    if (right != nullptr) right->accept(visitor);
}
```

And the first concrete visitor, reusing the label-printing behavior
Lesson B1's `preOrder` already had:

```cpp
class PrintVisitor : public Visitor {
public:
    void visit(TreeNode& node) override {
        std::cout << node.label << " ";
    }
};
```

### Mechanical Walkthrough

Enumerating what's genuinely new here, beyond what the isolated lab
above already covered in full (the mechanics of `virtual`, `= 0`,
`override`, and public inheritance carry over unchanged):

- **`virtual void visit(TreeNode& node) = 0;`** — `Visitor`'s one pure
  virtual method, taking a `TreeNode&` by reference rather than by
  value — a reference means `visit` operates on the actual node being
  visited, not a copy of it, which matters because `PrintVisitor`
  needs to read that exact node's real `label`, not a throwaway
  duplicate.
- **`void TreeNode::accept(Visitor& visitor)`** — a member function
  defined *outside* `TreeNode`'s own `{ ... }` body, using the scope
  resolution syntax `TreeNode::accept` to say "this is `accept`,
  specifically the one declared inside `TreeNode`." This split —
  declaring `accept` inside `TreeNode` but defining its actual body
  afterward — exists because `accept`'s body needs to call
  `visitor.visit(...)`, which requires `Visitor` to be a *complete*
  type (not just forward-declared) at the point that call is compiled;
  placing the body here, after `Visitor`'s full definition, satisfies
  that, while the earlier *declaration* inside `TreeNode` only ever
  needed `Visitor` to be nameable, which the forward declaration
  already provided.
- **`visitor.visit(*this);`** — the double dispatch itself. `*this`
  dereferences `TreeNode`'s own implicit `this` pointer, producing a
  reference to the current node — the same node `accept` was called
  on. Passing it into `visitor.visit(...)` is the second half of the
  double dispatch: the first virtual call (`accept`, dispatched based
  on which kind of node this is — not yet observable with only one
  node type, but real regardless) hands off to a second virtual call
  (`visit`, dispatched based on which concrete `Visitor` was passed
  in) — two separate runtime decisions chained together, which is the
  literal meaning of "double" in double dispatch.
- **`if (left != nullptr) left->accept(visitor);`** — after visiting
  the current node, `accept` recurses into the left child, passing the
  *same* `visitor` object along — this is what makes one `accept` call
  on the root walk the *entire* tree, not just one node; the `nullptr`
  check is the same base-case reasoning Lesson B1's `preOrder`
  used, guarding against calling `accept` on a nonexistent child.
- **`if (right != nullptr) right->accept(visitor);`** — the matching
  recursive call for the right child, run second — visiting self, then
  left, then right, in that order, is precisely pre-order traversal,
  reapplied here as `accept`'s own fixed internal shape rather than a
  free function's.
- **`class PrintVisitor : public Visitor`** — same public-inheritance
  mechanism as `FriendlyGreeter`/`FormalGreeter` in the isolated lab,
  now making `PrintVisitor` a real, instantiable `Visitor`.
- **`void visit(TreeNode& node) override { std::cout << node.label << " "; }`**
  — `PrintVisitor`'s implementation of the one method `Visitor`
  required: read the current node's `label` and print it, exactly what
  `preOrder`'s own print statement did in Lesson B1 — the difference is
  *where* this behavior now lives: inside a swappable object, not
  baked into the walking function itself.

### CS Lens

Double dispatch — resolving behavior from two independent runtime
types instead of one — recurs anywhere a system needs to combine "what
kind of thing is this" with "what operation is currently happening."
Also recognized in: a compiler's own code generator, choosing machine
instructions based on both an AST node's type *and* the target
architecture; collision handling in a physics engine, where what
happens depends on the types of *both* colliding objects (a ball
hitting a wall behaves differently than a ball hitting another ball);
and operator overload resolution itself in languages that support it,
which must consider the types of *both* operands to `+` before
deciding which implementation runs.

### SE Lens

The specific tradeoff this Concept Unit takes on, restated concretely
now that real code exists to point at: `accept`'s body — the walk
itself — now lives in exactly one place, `TreeNode::accept`, rather
than being copy-pasted into every operation the way Lesson B1's three
traversal functions each carried their own walk. The real cost: adding
`accept` required editing `TreeNode` itself, once — a cost the Visitor
pattern's own promise ("add new operations without touching the node
class") explicitly doesn't cover, because that promise only holds
*after* a node type already knows how to accept a visitor at all. This
lesson pays that one-time cost now, so that `CountVisitor` and
`SumVisitor`, later in this same lesson, can be added without touching
`TreeNode` a second time.

### Commands Needed

No new flags; same `clang++ -std=c++17 -Wall -Wextra` invocation used
throughout.

### Run It — Real Output

The real project file, compiled and run in exactly this state — B1's
existing traversal functions plus this unit's `Visitor`/`accept`/
`PrintVisitor` addition, called from `main` right after the existing
traversal calls:

```cpp
std::cout << "pre-order (iterative): ";
iterativePreOrder(a);
std::cout << std::endl;

std::cout << "visitor (print):       ";
PrintVisitor printer;                 // ← new
a->accept(printer);                   // ← new
std::cout << std::endl;
```

```
$ clang++ -std=c++17 -Wall -Wextra step_printvisitor.cpp -o step_printvisitor && ./step_printvisitor
pre-order (recursive): A B D E C F
visitor (print):       A B D E C F
```

(Verified this session by compiling and running the real project file
in this exact state.) `PrintVisitor`, walked via `accept`, produces the
identical sequence `preOrder` already produced in Lesson B1 — proof
that `accept`'s fixed self-then-left-then-right shape really does
reproduce pre-order, just reached through a swappable object instead of
a dedicated function.

### Connecting Sentence

One walk (`accept`) and one swappable operation (`PrintVisitor`) are
now proven to work together; the next Concept Unit adds a second
operation — one that has to remember something across the whole walk,
not just print as it goes — without touching `TreeNode` or `accept`
again.

---

## Concept Unit 2: An Object That Remembers What It's Counted

### The Problem

`PrintVisitor` never needs to remember anything between one `visit`
call and the next — each call is independent, print this label, done.
"Count every node" is different: the answer isn't known until *every*
node has been visited, which means something has to accumulate a
running total across the whole walk, and still be readable afterward,
once `accept` has returned. `accept` itself returns nothing (`void`) —
so the running count can't come back as a return value the way, say, a
function that summed an array directly could. Something about the
visitor object itself has to hold that state.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add.
- **Location** — a new class, `CountVisitor`, placed directly below
  `PrintVisitor`. `TreeNode` and `Visitor` are not touched.
- **Dependencies** — the `Visitor` interface and `TreeNode::accept`,
  both already built in Concept Unit 1.

### The New Code

```cpp
class CountVisitor : public Visitor {
public:
    void visit(TreeNode& node) override {
        (void)node;
        count++;
    }
    int count = 0;
};
```

### The Updated Project

This is a new, freestanding class — nothing existing is being modified
to make room for it, so per this schema's own rule there's no larger
enclosing structure to show it inside of; it's shown whole, above,
sitting directly below `PrintVisitor`, and used from `main` in this
unit's "Run It" step below.

### Introduce the Concept in Isolation

A minimal proof that an object's own member variable really does keep
its value across several separate method calls:

```cpp
#include <iostream>

class Counter {
public:
    void tally() {
        count++;
    }
    int count = 0;
};

int main() {
    Counter c;
    c.tally();
    c.tally();
    c.tally();

    std::cout << "count after three calls: " << c.count << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab2_accumulating_state.cpp -o lab2 && ./lab2
count after three calls: 3
```

Three separate calls to `c.tally()`, and `c.count` correctly reflects
all three — `count` isn't reset between calls, because it belongs to
`c` itself, not to any one call of `tally()`. This is exactly what
`CountVisitor` needs: a member variable that persists across every one
of `accept`'s recursive calls to `visit`, each of which is a completely
separate function call from `accept`'s point of view, just like each
call to `c.tally()` was separate here.

### Discard the Throwaway Example

`Counter`, `c`, and `tally()` above existed only to prove that member
state survives across repeated calls. They're discarded now;
`catalog_tree.cpp` uses `CountVisitor`'s own `count` member for this
exact same purpose.

### Mechanical Walkthrough

Enumerating `CountVisitor`'s new code:

- **`class CountVisitor : public Visitor`** — same public-inheritance
  mechanism as `PrintVisitor`, making `CountVisitor` a second, fully
  independent concrete `Visitor`.
- **`void visit(TreeNode& node) override`** — same override mechanism
  as `PrintVisitor`'s own `visit`, satisfying the same one required
  method on `Visitor`. Two different classes independently overriding
  the same base method, each with entirely different behavior, is
  Visitor's whole promise made concrete: `accept` doesn't know or care
  which one it's calling.
- **`(void)node;`** — an explicit, deliberate no-op use of the `node`
  parameter. `CountVisitor` doesn't need anything about the node
  itself, only that a visit happened at all — but leaving `node`
  completely unused would trigger an "unused parameter" warning under
  this project's own `-Wextra` compiler flag; `(void)node;` is a
  standard C++ idiom telling both the compiler and a future reader "I
  know this parameter goes unused here, on purpose."
- **`count++;`** — increments `CountVisitor`'s own `count` member by
  one, using the same isolated lab's mechanism, now doing real work:
  each time `accept` calls `visit` on this `CountVisitor`, `count`
  goes up by exactly one.
- **`int count = 0;`** — a data member, initialized to `0` at the
  point of declaration (an **in-class member initializer**, meaning a
  freshly-constructed `CountVisitor` starts with `count` already `0`,
  with no separate constructor needed to set it). Declaring it *after*
  `visit` in this class's body still makes it available to `visit`'s
  own code above — a class's members are all visible to each other
  throughout the whole class definition, regardless of the order
  they're written in, unlike ordinary sequential code.

### CS Lens

An object whose job is to accumulate a result across repeated calls it
doesn't itself control the timing or order of is a specific, recurring
shape. Also recognized in: an accumulator variable inside any `reduce`/
`fold` operation (Track G's own Lesson G7 names this exact idea
directly); an event listener that tallies how many times an event
fired, without controlling when the event happens; a test framework's
own pass/fail counters, incremented once per test as an external
runner calls into each one.

### SE Lens

The alternative rejected here: giving `accept` itself a return value
(say, an `int`) that gets summed up the call chain automatically. That
would work for *this one* operation, but breaks the moment a different
operation needs a different kind of result — `PrintVisitor` has no
meaningful return value at all, and a later operation might need to
return a `std::string` or a `bool` instead of an `int`. Letting each
concrete `Visitor` hold whatever state *it* needs, read out after the
walk finishes, keeps `accept`'s own signature (`void accept(Visitor&)`)
completely unchanged no matter what kind of result future operations
need to produce — the real cost is that a Visitor's result has to be
read from the object after calling `accept`, one extra step compared to
using a return value directly.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab2_accumulating_state.cpp -o lab2
```

Same flags as every previous unit.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab2_accumulating_state.cpp -o lab2 && ./lab2
count after three calls: 3
```

Against the real project's six-node tree, adding the call to `main`
right after `PrintVisitor`'s:

```cpp
std::cout << "visitor (print):       ";
PrintVisitor printer;
a->accept(printer);
std::cout << std::endl;

CountVisitor counter;                          // ← new
a->accept(counter);                            // ← new
std::cout << "visitor (count):       " << counter.count << std::endl; // ← new
```

```
$ clang++ -std=c++17 -Wall -Wextra step_countsum.cpp -o step_countsum && ./step_countsum
A B D E C F 
count: 6
total: 13
```

(Verified this session by compiling and running the real project file
in this exact state — this build already includes the next Concept
Unit's `SumVisitor` as well, since both were verified together; the
middle line, `count: 6`, is `CountVisitor`'s own result, and correctly
matches the tree's real six nodes: `A`, `B`, `C`, `D`, `E`, `F`.)

### Connecting Sentence

`CountVisitor` proves a `Visitor` can accumulate a result readable
after the walk finishes; the next Concept Unit reuses that exact same
shape for a `SumVisitor` — but summing a `SumVisitor` needs something
`TreeNode` doesn't have yet: a number worth summing.

---

## Concept Unit 3: Giving Nodes Something Worth Totaling

### The Problem

"Total it" — the third operation this lesson set out to build — needs
something numeric to total, and `TreeNode` currently holds nothing but
a `label`. A real catalog node would carry some kind of quantity (how
many of an item, or a price); this project's tree needs the same, even
in its deliberately simplified, hand-built form, or "total it" has
nothing real to operate on.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_tree.cpp`, modified.
- **Change type** — add (a new member on `TreeNode`); refactor (every
  existing `new TreeNode{...}` call in `main`, to supply a value for
  it); add (a new `SumVisitor` class).
- **Location** — the new member goes inside `TreeNode`'s own
  definition, directly after `label`; the six `new TreeNode{...}`
  calls being updated are the same six lines Lesson B1's Concept Unit
  2 built; `SumVisitor` goes directly below `CountVisitor`.
- **Dependencies** — none beyond what already exists.

### The New Code

```cpp
int quantity;
```

### The Updated Project

`TreeNode`, with this one new member added directly after `label`:

```cpp
struct TreeNode {
    std::string label;
    int quantity;              // ← new
    TreeNode* left;
    TreeNode* right;

    void accept(Visitor& visitor);
};
```

`TreeNode` now aggregate-initializes with four values instead of three
— every existing call to `new TreeNode{...}` in `main` has to supply
one, in the same declared-order position as `quantity` now sits
(second, right after `label`), or the code no longer compiles as
written. This project's own hand-picked quantities — arbitrary small
numbers, chosen only so the resulting total is easy to hand-check:

```cpp
TreeNode* d = new TreeNode{"D", 2, nullptr, nullptr};   // ← quantity added
TreeNode* e = new TreeNode{"E", 5, nullptr, nullptr};   // ← quantity added
TreeNode* f = new TreeNode{"F", 3, nullptr, nullptr};   // ← quantity added
TreeNode* b = new TreeNode{"B", 1, d, e};                // ← quantity added
TreeNode* c = new TreeNode{"C", 1, f, nullptr};           // ← quantity added
TreeNode* a = new TreeNode{"A", 1, b, c};                 // ← quantity added
```

Every node now carries a `quantity` — `D`, `E`, and `F` (the tree's
three leaves) hold `2`, `5`, and `3`; `B`, `C`, and `A` each hold `1`.
Nothing in this project yet distinguishes "a leaf's quantity" from "a
group's quantity" as conceptually different things — that distinction,
and a real reason to treat them differently, is Lesson B4's own
subject (Composite), not this one; for now, every node simply carries
one number, and `SumVisitor`, next, adds every single one of them up,
leaves and non-leaves alike.

```cpp
class SumVisitor : public Visitor {
public:
    void visit(TreeNode& node) override {
        total += node.quantity;
    }
    int total = 0;
};
```

### Introduce the Concept in Isolation

No new isolated lab is needed for this Concept Unit specifically —
adding one more built-in-typed member (`int quantity`) to a struct
that already has three other members (`label`, `left`, `right`) is not
a new construct; it uses the exact same member-declaration and
aggregate-initialization mechanics `TreeNode`'s own `label`, `left`,
and `right` already demonstrated in Lesson B1. `SumVisitor` itself
reuses `CountVisitor`'s just-proven accumulating-member-state shape
from Concept Unit 2's isolated lab, with `total += node.quantity;` in
place of `count++;` — the same isolated proof already covers both.

### Mechanical Walkthrough

Enumerating what's different from `CountVisitor`, already given full
treatment in Concept Unit 2:

- **`int quantity;`** (inside `TreeNode`) — a plain `int` member,
  declared the same way `label`, `left`, and `right` were in Lesson
  B1 — full treatment of struct member declaration is in that lesson;
  what's new here is only the specific member and its type, not the
  mechanism.
- **`new TreeNode{"D", 2, nullptr, nullptr}`** (and the five other,
  structurally identical lines) — the same aggregate-initialization
  mechanism Lesson B1 fully explained (`{...}` assigning to members in
  declaration order), now with one more value in the list, `2`,
  landing on `quantity` specifically because `quantity` is declared
  second in `TreeNode`'s own definition, directly after `label`.
- **`class SumVisitor : public Visitor`** and **`void visit(TreeNode& node) override`**
  — the identical mechanism `CountVisitor` already used in full, in
  the previous Concept Unit.
- **`total += node.quantity;`** — reads `quantity` off the specific
  node currently being visited (`node.quantity`, member access through
  a reference, using `.` rather than `->` because `node` here is a
  reference, not a pointer) and adds it into `SumVisitor`'s own running
  `total`, using `+=` (compound assignment: `total = total + node.quantity;`,
  written more compactly).
- **`int total = 0;`** — an in-class member initializer, same
  mechanism as `CountVisitor`'s `count`, starting `SumVisitor` at a
  known `0` before any node has been visited.

### CS Lens

Extending a data type with exactly the field a new operation needs,
rather than any field that might conceivably be useful someday, is
itself a real, named discipline — this project's own working rules
call it out directly (no premature abstraction, no speculative fields
"for later"). Also recognized in: database schema migrations, where a
new column gets added specifically because a real query needs it, not
in anticipation of one; and API versioning, where a new field is added
to a response only once a real client actually needs it.

### SE Lens

The alternative considered and rejected: giving `quantity` a default
value derived from something else (say, always `1` unless overridden)
to avoid touching all six existing `new TreeNode{...}` lines. That's
rejected here because it would hide a real fact — this tree's six
nodes now genuinely need six independently-chosen numbers, and
silently defaulting them would make `SumVisitor`'s output impossible to
predict by reading the tree-building code alone. The real cost being
paid instead, honestly: every future lesson that adds a node to this
tree also has to supply a `quantity` for it, a small but real coupling
this specific member introduces between "add a node" and "the node
type's full shape."

### Commands Needed

No new flags; same `clang++ -std=c++17 -Wall -Wextra` invocation used
throughout this lesson.

### Run It — Real Output

Against the real project's six-node tree, adding the call to `main`
right after `CountVisitor`'s:

```cpp
CountVisitor counter;
a->accept(counter);
std::cout << "visitor (count):       " << counter.count << std::endl;

SumVisitor summer;                             // ← new
a->accept(summer);                             // ← new
std::cout << "visitor (total):       " << summer.total << std::endl; // ← new
```

```
$ clang++ -std=c++17 -Wall -Wextra step_countsum.cpp -o step_countsum && ./step_countsum
A B D E C F 
count: 6
total: 13
```

(Verified this session by compiling and running the real project file
in this exact state. `13` is `2 + 5 + 3 + 1 + 1 + 1` — `D`, `E`, `F`'s
quantities plus `B`, `C`, `A`'s — matching a hand-check against the
quantities assigned above exactly.)

The complete project, compiled once, running every operation this
lesson built, back to back:

```
$ clang++ -std=c++17 -Wall -Wextra catalog_tree.cpp -o catalog_tree && ./catalog_tree
pre-order (recursive): A B D E C F
in-order:              D B E A F C
post-order:            D E B F C A
pre-order (iterative): A B D E C F
visitor (print):       A B D E C F
visitor (count):       6
visitor (total):       13
```

(Verified this session by compiling and running the complete real
project file in exactly this state — every line came from an actual
run.)

### Connecting Sentence

All three operations this lesson set out to build — print, count,
total — now exist as independent `Visitor` subclasses, none of which
required a second change to `TreeNode` beyond Concept Unit 1's one-time
`accept` addition; the Closing, next, proves that promise by adding a
fourth operation live, with zero edits to `TreeNode` or `accept`.

---

## Closing

### Connect the Pieces

Follow one node — `E`, quantity `5` — through this lesson's three
operations, in one pass:

1. `a->accept(printer)` reaches `E` during its walk (the same
   `A B D E C F` order `accept`'s self-then-left-then-right shape
   always produces) and calls `printer.visit(eNode)`, which reads
   `eNode.label` (`"E"`) and prints it — `PrintVisitor` never looks at
   `quantity` at all.
2. The exact same walk, run again with a fresh `CountVisitor`, reaches
   `E` and calls `counter.visit(eNode)`, which ignores everything about
   `eNode` except that it happened, incrementing `count` by one — `E`
   contributes exactly `1` to the final `6`, the same as every other
   node, regardless of its own `quantity`.
3. The same walk again, with a fresh `SumVisitor`, reaches `E` and
   calls `summer.visit(eNode)`, which reads `eNode.quantity` (`5`) and
   adds it into `total` — `E` alone contributes `5` of the final `13`.

Same node, same `accept` method, three completely different pieces of
information extracted from it, decided entirely by which `Visitor`
object was passed in — not by three different walks, and not by three
different methods on `TreeNode` itself.

### What Breaks Without This

Introducing a real, easy-to-make mistake on purpose: misspelling
`visit` as `Visit` inside a new concrete visitor, and leaving off
`override`:

```cpp
class PrintVisitor : public Visitor {
public:
    // typo: "Visit" instead of "visit" -- does not override anything
    void Visit(TreeNode& node) {
        std::cout << node.label << " ";
    }
};
```

Compiled for real:

```
$ clang++ -std=c++17 -Wall -Wextra break_typo_override.cpp -o break_typo_override
break_typo_override.cpp:33:18: error: variable type 'PrintVisitor' is an abstract class
   33 |     PrintVisitor printer;
      |                  ^
break_typo_override.cpp:15:18: note: unimplemented pure virtual method 'visit' in 'PrintVisitor'
   15 |     virtual void visit(TreeNode& node) = 0;
      |                  ^
1 error generated.
```

A real, verified failure: because `Visit` (capital `V`) doesn't match
`Visitor`'s own `visit` (lowercase), the compiler doesn't see an
override at all — it sees an *unrelated* new method named `Visit`
sitting alongside a still-unimplemented `visit`, which means
`PrintVisitor` is still abstract, and abstract classes can't be
instantiated. The error points at `PrintVisitor printer;`, not at the
actual typo — a correct diagnosis, but a genuinely confusing place to
start looking. Adding `override` back, still with the same typo,
changes exactly where the compiler complains:

```cpp
void Visit(TreeNode& node) override {
```

```
$ clang++ -std=c++17 -Wall -Wextra break_typo_with_override.cpp -o break_typo_with_override
break_typo_with_override.cpp:27:32: error: only virtual member functions can be marked 'override'
   27 |     void Visit(TreeNode& node) override {
      |                                ^~~~~~~~
break_typo_with_override.cpp:33:18: error: variable type 'PrintVisitor' is an abstract class
   33 |     PrintVisitor printer;
      |                  ^
2 errors generated.
```

Now the *first* error points directly at the typo'd line itself —
`override` on a method that doesn't actually override anything is
immediately flagged as meaningless, right where the mistake was
made, instead of leaving a reader to work backward from a confusing
"abstract class" error somewhere else in the file. This is the entire,
concrete reason `override` is worth writing on every intentional
override in this project, not just a style preference. Restoring the
correct spelling:

```cpp
void visit(TreeNode& node) override {
    std::cout << node.label << " ";
}
```

### Exercises

- Add a fourth `Visitor` — `MaxQuantityVisitor` — that tracks the
  single largest `quantity` seen across the whole tree (hint: what
  should its member start as, before any node has been visited, so the
  first real comparison is always correct?). Verify it reports `5`
  (`E`'s quantity) against this lesson's tree, with zero changes to
  `TreeNode` or `accept`.
- Add a `LabelListVisitor` that builds a `std::vector<std::string>` of
  every label visited, in the order `accept` visits them, instead of
  printing directly. Verify its final contents match `A B D E C F`
  exactly.
- Predict, by hand, what `SumVisitor`'s `total` would become if a
  seventh node, quantity `4`, were added as a new child of `E` — then
  actually add it and confirm.

### Definition of Done

- [ ] `catalog_tree.cpp` compiles cleanly with `clang++ -std=c++17
      -Wall -Wextra`, no warnings.
- [ ] Running it prints all seven lines — four traversals from Lesson
      B1, plus this lesson's print/count/total — and `visitor (print)`
      matches `pre-order (recursive)` exactly.
- [ ] Every isolated lab in this lesson was actually compiled and run
      this session, with real pasted output.
- [ ] The typo'd-override failure was actually caused and observed in
      both forms (with and without `override`), then reverted.
- [ ] `git commit -m "Let new read-only operations be added to the
      catalog tree without editing TreeNode again — Visitor keeps the
      node type stable while print/count/total, and whatever comes
      next, live outside it"`
