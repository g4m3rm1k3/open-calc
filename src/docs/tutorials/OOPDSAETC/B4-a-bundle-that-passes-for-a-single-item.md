# Lesson B4: A Bundle That Passes for a Single Item

**What you will build** — A new, small hierarchy — `CatalogItem`,
`Product`, and `Category` — where a `Category` can hold any number of
other `CatalogItem`s (individual `Product`s, or entire nested
`Category`s), and a single operation (`totalQuantity()`) gives the
right answer whether it's called on one bare `Product` or on an entire
multi-level nested catalog, with no special-casing anywhere in the
calling code. The transferable problem: Lessons B1–B3's `TreeNode` can
only ever hold exactly two children (`left`, `right`) and never
distinguished "one item" from "many items" — real nested data doesn't
respect that limit (a real catalog category might hold one item, ten,
or another whole category), and code that has to check "is this one
thing or a bundle of things" before it can act is exactly the
duplicated, brittle logic this lesson exists to remove.

**What you need to know first** — Lesson B2's abstract base classes,
pure virtual functions, and `override` — this lesson reuses that exact
mechanism, applied to a genuinely different shape than B2's single
concrete `TreeNode` type. Lesson B1's own scoping note, stated directly
in its Header, that a binary tree was a deliberate simplification and
"we'll widen this to real n-ary nesting in B4" — this lesson is where
that promise is kept.

**Terms used in this lesson**

- **Composite** — a design pattern where a "container" type and the
  "individual item" types it can contain all implement the same
  shared interface, so that any code written against that interface
  works identically whether it's handed a single item or an entire
  nested bundle of them. It exists so that calling code never needs an
  `if` check for "am I holding one thing or many" — the container's own
  implementation of the shared interface handles that distinction
  internally, once, instead of every caller handling it separately,
  everywhere it might come up.
- **leaf** — in a Composite hierarchy, a concrete type that holds no
  children of its own — `Product`, in this lesson. It exists as the
  base case of the pattern: something that answers the shared
  interface's operations directly, using only its own data, with no
  further recursion needed.
- **composite (as a role, not the pattern's own name)** — a concrete
  type that holds a collection of other items (which may themselves be
  leaves or further composites) and answers the shared interface's
  operations by combining its children's own answers — `Category`, in
  this lesson. It exists as the recursive case: something that doesn't
  know or store the final answer directly, only how to combine
  whatever its children report.
- **recursion for free** — the specific benefit this pattern produces:
  once a composite type's own operation is written as "combine my
  children's answers to this same operation," calling that operation
  on a deeply nested structure automatically visits every level, purely
  as a consequence of ordinary virtual dispatch — no separate walking
  function, visitor, or loop written by the caller is needed. It exists
  to name why this pattern is worth its setup cost: the recursive walk
  isn't something a caller has to write and maintain — it falls out of
  the type hierarchy's own structure.

**Objects and methods used**

- **`CatalogItem`** (this lesson's own subject)
  - *What it is:* an abstract base class declaring the one shared
    operation every catalog item — single or bundled — must support.
  - *Implementation:* built in this lesson's first Concept Unit as
    ```cpp
    class CatalogItem {
    public:
        CatalogItem(std::string label) : label(label) {}
        virtual int totalQuantity() const = 0;

        std::string label;
    };
    ```
  - *Its use:* both `Product` and `Category` inherit from it; any code
    holding a `CatalogItem*` can call `totalQuantity()` without knowing
    which concrete type it actually points at.
- **`Product`** (this lesson's own subject)
  - *What it is:* the leaf concrete type — one catalog entry with its
    own stored quantity.
  - *Implementation:* built in this lesson's first Concept Unit; full
    shape shown there.
  - *Its use:* every individual, non-bundled entry in this project's
    catalog.
- **`Category`** (this lesson's own subject)
  - *What it is:* the composite concrete type — a named group holding
    any number of other `CatalogItem`s.
  - *Implementation:* built in this lesson's second Concept Unit; full
    shape shown there.
  - *Its use:* every group in this project's catalog, including groups
    that contain other groups.
- **`std::vector<T>`**
  - *What it is:* the C++ standard library's growable array — a
    contiguous, resizable sequence of elements.
  - *Implementation:* declared in `<vector>` (confirmed this session by
    reading the real declaration in this machine's local `<vector>`
    header) as
    ```cpp
    template <class T, class Allocator = allocator<T> >
    class vector {
    public:
        void push_back(const value_type& x);
        void push_back(value_type&& x);
        // ...
    };
    ```
    (trimmed to the one member this lesson actually calls directly;
    `std::vector` also supports range-based for out of the box, since
    it already supplies its own `begin()`/`end()` — the exact same
    iterator shape Lesson B3 built by hand for `TreeIterator`/`Tree`,
    already present here as part of the standard library, not
    something this lesson needs to build again). By default it manages
    its own heap-allocated buffer and grows it automatically as
    elements are added — the same automatic-growth idea Track A's
    Lesson A1 built from scratch (a container that doubles its own
    capacity when full), later generalized into a reusable, hand-built
    `Array<T>` once Lesson A2 made it generic.
  - *Its use:* `Category` stores its children in a
    `std::vector<CatalogItem*>` — chosen over Track A's own `Array<T>`
    specifically because this project's working rules leave that choice
    open per-track, and `std::vector` is what this lesson reaches for,
    consistent with Lesson B3's own use of `<stack>` from the standard
    library rather than a hand-rolled container.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`std::string`**
  - *What it is:* the standard library's owned, growable character
    sequence, already given full treatment in Lesson B1.
  - *Implementation:* unchanged from Lesson B1.
  - *Its use:* `CatalogItem`'s `label` member, same role `TreeNode`'s
    own `label` played in Lessons B1–B3.

---

## Concept Unit 1: A Shared Interface Two Different Shapes Can Both Satisfy

### The Problem

`TreeNode`, as B1 through B3 left it, is one single concrete type —
every node in that tree is structurally identical, just with different
data and different children. Real catalog data isn't uniform that way:
a single product and an entire category of products are genuinely
different *kinds* of thing — one holds a quantity directly, the other
holds a whole group of other items and has no quantity of its own to
speak of. Before those two different kinds of thing can be treated the
same way by any calling code, they both need to promise to answer the
same question, even though *how* each of them answers it will turn out
to be completely different.

### Project Change

- **Reference Source** — No reference counterpart; this project builds
  its own catalog directly, not from a parser, per Lesson B1's own
  scoping decision.
- **Files affected** — `catalog_composite.cpp`, created new. This
  lesson starts a new file, distinct from `catalog_tree.cpp`
  (Lessons B1–B3), because `Product`/`Category`'s variable-arity,
  polymorphic shape is genuinely different in kind from `TreeNode`'s
  fixed-binary, single-concrete-type shape — forcing both into one file
  would mean either bolting an incompatible second hierarchy onto the
  first, or a large retrofit of `Visitor` and `TreeIterator` that this
  lesson's own BRD row doesn't call for. This mirrors the exact
  reasoning Lesson B1 itself gave for Track A's `sum_readings.cpp` and
  `strategy_filter.cpp` — a genuinely different feature, not a
  variation on the existing one, gets its own file.
- **Change type** — add (new file).
- **Location** — top of the new file.
- **Dependencies** — `#include <iostream>`, `#include <string>`, and
  `#include <vector>` (needed starting in Concept Unit 2).

### The New Code

```cpp
class CatalogItem {
public:
    CatalogItem(std::string label) : label(label) {}
    virtual int totalQuantity() const = 0;

    std::string label;
};
```

### The Updated Project

This is the first code in a brand-new file — there is no existing
structure to place it inside yet.

### Introduce the Concept in Isolation

A minimal proof that one abstract interface can be satisfied by a
concrete type, entirely separate from catalogs or quantities:

```cpp
#include <iostream>

class Shape {
public:
    virtual double area() const = 0;
};

class Square : public Shape {
public:
    Square(double side) : side(side) {}
    double area() const override {
        return side * side;
    }
private:
    double side;
};

int main() {
    Square s(4.0);
    Shape& shape = s;
    std::cout << "area: " << shape.area() << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab1_shared_interface.cpp -o lab1 && ./lab1
area: 16
```

`shape` is declared as `Shape&` — the abstract base type — not
`Square&`, yet calling `shape.area()` still correctly runs `Square`'s
own implementation and returns `16` (`4 * 4`), the same dynamic
dispatch mechanism Lesson B2 already proved in full. What's new here
isn't the mechanism itself — it's the reason for reaching for it: this
project needs *more than one* concrete type answering `area()`-like
question differently, which is exactly what the next Concept Unit adds
a second type for.

### Discard the Throwaway Example

`Shape` and `Square` above existed only to re-confirm the interface
mechanism before applying it to `CatalogItem`. They're discarded now;
this project uses `CatalogItem` and `Product` from here on.

### Mechanical Walkthrough

Enumerating `CatalogItem`'s new code:

- **`class CatalogItem { public: ... };`** — declares an abstract base
  class, same mechanism as `Shape` above and `Visitor` in Lesson B2:
  `class` (not `struct`) because this type is defined by its required
  behavior, not by being plain data.
- **`CatalogItem(std::string label) : label(label) {}`** — a
  constructor taking a label and storing it via a member initializer
  list, same mechanism as `TreeIterator`'s own constructors in Lesson
  B3. Unlike `TreeNode` in Lesson B1 (a `struct` with no constructor of
  its own, relying on aggregate initialization), `CatalogItem` defines
  a real constructor — required here because `CatalogItem` is meant to
  be *inherited from*, and a subclass's own constructor needs an
  explicit way to initialize the base class's part of the object,
  which aggregate initialization does not support for a class with
  inheritance involved.
- **`virtual int totalQuantity() const = 0;`** — the one pure virtual
  method every concrete `CatalogItem` must implement, same
  `virtual`/`= 0` mechanism Lesson B2 gave full treatment to. `const`
  (after the parameter list) promises this method doesn't modify the
  object it's called on — reading a quantity should never itself change
  the catalog.
- **`std::string label;`** — a plain data member, same mechanism as
  `TreeNode`'s own `label` in Lesson B1, now living on the shared base
  class instead of a single concrete type, so both `Product` and
  `Category` inherit it automatically rather than each declaring their
  own copy.

Continuing with `Product`'s own new code:

```cpp
class Product : public CatalogItem {
public:
    Product(std::string label, int quantity)
        : CatalogItem(label), quantity(quantity) {}

    int totalQuantity() const override {
        return quantity;
    }

private:
    int quantity;
};
```

- **`class Product : public CatalogItem`** — same public-inheritance
  mechanism as `Square : public Shape` above, making `Product` a real,
  instantiable `CatalogItem`.
- **`Product(std::string label, int quantity) : CatalogItem(label), quantity(quantity) {}`**
  — `Product`'s own constructor, taking both a label and a quantity.
  The member initializer list here does two things: `CatalogItem(label)`
  explicitly calls the *base class's* constructor, passing `label`
  through to it (this is the "explicit way to initialize the base
  class's part" the walkthrough above referred to); `quantity(quantity)`
  initializes `Product`'s own new member, same self-named-parameter
  pattern already explained in Lesson B1 and B2.
- **`int totalQuantity() const override { return quantity; }`** —
  `Product`'s implementation of the one required method: a leaf simply
  returns its own stored value, directly, with no recursion and no
  further delegation — the simplest possible answer to the shared
  question.
- **`private: int quantity;`** — `Product`'s own data member, holding
  its individually stored quantity — this is precisely the "leaf's own
  quantity," the half of Lesson B2's forward-referenced promise this
  Concept Unit delivers.

### CS Lens

A shared interface satisfied by structurally different concrete types
is the same mechanism named in Lesson B2's CS Lens (dynamic dispatch
through an abstract interface), reapplied here specifically to enable
recursive delegation, covered fully in the next Concept Unit. Also
recognized in: a file system's own `read()`/`write()` interface,
satisfied identically by a plain file, a directory, or a special device
file; and a GUI framework's `draw()` method, satisfied identically by a
single button or an entire panel containing dozens of other widgets —
the exact same "bundle answers like a single item" shape this lesson's
own `Category` builds next.

### SE Lens

The alternative rejected here: giving `Product` and `Category` no
shared base type at all, and having any code that needs to handle
"either kind of catalog entry" check which one it has (with a type tag,
or `dynamic_cast`, or a similar runtime check) before deciding what to
do. That's rejected because it pushes the "is this one item or a
bundle" question out to *every* piece of calling code that ever touches
a catalog item, rather than answering it once, here, in the type
hierarchy itself. The real cost of the interface-based approach instead:
every new operation this catalog might need in the future (not just
`totalQuantity()`) has to be added as a *new pure virtual method* on
`CatalogItem`, implemented in both `Product` and `Category` — a real
coupling between the two concrete types and the shared interface,
directly opposite to Lesson B2's Visitor pattern, which avoided that
exact coupling by keeping new operations external. Composite and
Visitor solve genuinely different problems, and this project uses
each where it fits: Visitor, over `TreeNode`, for operations that
vary independently of the node shape; Composite, here, for a node
shape where the *structure itself* — one item vs. a bundle — is the
thing that needs to become interchangeable.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab1_shared_interface.cpp -o lab1
```

Same `clang++` flags used throughout this project.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab1_shared_interface.cpp -o lab1 && ./lab1
area: 16
```

Against the real project so far — `CatalogItem` and `Product`, with a
single product built and queried directly:

```cpp
int main() {
    Product apple("Apple", 12);
    CatalogItem& item = apple;

    std::cout << item.label << ": " << item.totalQuantity() << std::endl;
    return 0;
}
```

```
$ clang++ -std=c++17 -Wall -Wextra step_product.cpp -o step_product && ./step_product
Apple: 12
```

(Verified this session by compiling and running the real project file
in this exact state.)

### Connecting Sentence

`Product` proves the shared interface works for a single leaf item; the
next Concept Unit builds `Category`, the type that has to answer the
same question by combining the answers of however many other items it
holds.

---

## Concept Unit 2: A Container That Implements the Same Interface as What It Holds

### The Problem

A category in a real catalog holds some number of other items — not a
fixed two, not even a number known when the code is written, but
however many happen to belong there. And a category has no quantity of
its own to report directly; the only honest answer to "how many items
does this category total" is whatever its contents add up to, which
means a category's own implementation of `totalQuantity()` has to ask
each of its children the same question and combine their answers,
rather than storing a number anywhere itself.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_composite.cpp`, modified.
- **Change type** — add.
- **Location** — a new class, `Category`, placed directly below
  `Product`.
- **Dependencies** — `#include <vector>`, added to this file's
  includes; `CatalogItem`, built in Concept Unit 1.

### The New Code

```cpp
int totalQuantity() const override {
    int sum = 0;
    for (CatalogItem* child : children) {
        sum += child->totalQuantity();
    }
    return sum;
}
```

### The Updated Project

`Category`'s complete definition, with this method as its real payoff
— shown together with the constructor and `add` it depends on, since
none of the three make sense read in isolation from each other:

```cpp
class Category : public CatalogItem {
public:
    Category(std::string label) : CatalogItem(label) {}

    void add(CatalogItem* item) {
        children.push_back(item);
    }

    int totalQuantity() const override {                       // ← new
        int sum = 0;                                             // ← new
        for (CatalogItem* child : children) {                     // ← new
            sum += child->totalQuantity();                         // ← new
        }                                                           // ← new
        return sum;                                                  // ← new
    }                                                                  // ← new

private:
    std::vector<CatalogItem*> children;
};
```

### Introduce the Concept in Isolation

The same `Shape`/`Square` domain from Concept Unit 1, extended with a
composite shape whose own `area()` is the sum of whatever shapes it
holds:

```cpp
#include <iostream>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
};

class Square : public Shape {
public:
    Square(double side) : side(side) {}
    double area() const override {
        return side * side;
    }
private:
    double side;
};

class CompositeShape : public Shape {
public:
    void add(Shape* shape) {
        parts.push_back(shape);
    }

    double area() const override {
        double sum = 0;
        for (Shape* part : parts) {
            sum += part->area();
        }
        return sum;
    }

private:
    std::vector<Shape*> parts;
};

int main() {
    Square* a = new Square(2.0);
    Square* b = new Square(3.0);

    CompositeShape* group = new CompositeShape();
    group->add(a);
    group->add(b);

    std::cout << "group area: " << group->area() << std::endl;
    return 0;
}
```

Compiled and run for real:

```
$ clang++ -std=c++17 -Wall -Wextra lab2_composite_shape.cpp -o lab2 && ./lab2
group area: 13
```

`13` is `4 + 9` — `a`'s area (`2 * 2`) plus `b`'s area (`3 * 3`) —
computed without `group->area()`'s own code ever containing a `4` or a
`9` anywhere; it only ever asked each of its parts for *their* answer
and added them together. This is exactly what this lesson's own header
calls **recursion for free**: `CompositeShape` is itself a `Shape`
(same interface), so if one of its `parts` were *another*
`CompositeShape` instead of a plain `Square`, `part->area()` would
already do the right thing automatically, with zero changes to this
code — proven directly, against the real project, later in this
Concept Unit.

### Discard the Throwaway Example

`CompositeShape`, `group`, `a`, and `b` above existed only to prove
recursive delegation through a shared interface works. They're
discarded now; `catalog_composite.cpp` uses `Category` for this exact
same purpose.

### Mechanical Walkthrough

Enumerating `Category`'s new code:

- **`class Category : public CatalogItem`** — same public-inheritance
  mechanism as `Product`, making `Category` a second, independent
  concrete `CatalogItem`.
- **`Category(std::string label) : CatalogItem(label) {}`** — same
  constructor-delegation mechanism `Product`'s constructor used in
  Concept Unit 1, passing `label` through to the base class. Unlike
  `Product`, `Category`'s constructor initializes no member of its own
  here — `children` (below) starts as an empty `std::vector` on its
  own, with no explicit initialization needed, since a freshly
  constructed `std::vector` is already empty by default.
- **`void add(CatalogItem* item) { children.push_back(item); }`** — a
  new public method, letting calling code build up a category's
  contents one item at a time. `children.push_back(item)` calls
  `std::vector`'s own `push_back` (its real declared shape shown in
  this lesson's Header), appending `item` as the vector's new last
  element — the exact same standard library method Lesson B1 could
  have reached for, instead of hand-rolling `Array<T>`'s doubling logic
  from scratch back in Track A; here, this project simply uses the
  standard library version directly.
- **`int totalQuantity() const override`** — same override mechanism
  as `Product`'s own `totalQuantity`, satisfying the same required
  method — but with a genuinely different implementation, which is the
  entire point of a shared interface having more than one concrete
  answer.
- **`int sum = 0;`** — a local variable, initialized to zero before
  any child has been counted — same reasoning as `SumVisitor`'s
  `total = 0` in Lesson B2, adapted here to a local variable inside a
  single method call rather than a member persisting across many
  calls.
- **`for (CatalogItem* child : children)`** — a range-based for loop
  over `children`, using `std::vector`'s own built-in `begin()`/`end()`
  — the identical desugaring Lesson B3 explained in full for
  `TreeIterator`/`Tree`, now happening automatically because
  `std::vector` already supplies that interface itself; nothing in
  this project had to build an iterator for `std::vector` the way
  Lesson B3 built one for the tree.
- **`sum += child->totalQuantity();`** — the recursive delegation
  itself: for each child, call the *same* `totalQuantity()` method
  this method is itself an implementation of, through the base
  `CatalogItem*` pointer. If `child` actually points at a `Product`,
  this resolves to `Product::totalQuantity`'s direct return; if `child`
  actually points at *another* `Category`, this resolves to
  `Category::totalQuantity` again — the exact same method currently
  executing, called on a different object — which is precisely how one
  `totalQuantity()` call at the root ends up visiting an entire nested
  structure, without a separate walking function anywhere in this
  project.
- **`return sum;`** — returns the fully combined total once every
  child has been asked.

### CS Lens

A recursive case whose only job is "combine the answers of my own
recursive calls" — with no separate walking logic anywhere else — is a
specific, well-known shape. Also recognized in: a file system directory
computing its own total size by asking each entry for its size, letting
subdirectories answer the identical question about themselves; an
organization chart computing a division's total headcount by summing
each subordinate group's own already-recursive total; and, structurally
identical to Lesson A6's own merge sort (Track A) — splitting a problem
into smaller instances of the *same* problem and combining their
results, just triggered here by an object's own type rather than an
array's own midpoint.

### SE Lens

The specific tradeoff being paid, concretely: `Category::totalQuantity`
never has to know how deep its own children's structure goes, or how
many levels of nesting exist below it — that's the direct benefit named
in this lesson's Header ("recursion for free"). The real cost: every
`Category` now owns a `std::vector<CatalogItem*>` of raw pointers to
its children, with no code anywhere in this project yet responsible for
freeing them — the identical, deliberately deferred memory-leak
tradeoff Lesson B1 named honestly for `TreeNode`, now applying equally
to a structure where a single node can genuinely own an unbounded
number of children rather than at most two.

### Commands Needed

```
clang++ -std=c++17 -Wall -Wextra lab2_composite_shape.cpp -o lab2
```

Same flags as every previous unit.

### Run It — Real Output

```
$ clang++ -std=c++17 -Wall -Wextra lab2_composite_shape.cpp -o lab2 && ./lab2
group area: 13
```

Against the real project, a single-level category:

```cpp
int main() {
    Product* apple = new Product("Apple", 12);
    Product* banana = new Product("Banana", 7);

    Category* produce = new Category("Produce");
    produce->add(apple);
    produce->add(banana);

    std::cout << produce->label << ": " << produce->totalQuantity() << std::endl;

    return 0;
}
```

```
$ clang++ -std=c++17 -Wall -Wextra step_category.cpp -o step_category && ./step_category
Produce: 19
```

(Verified this session by compiling and running the real project file
in this exact state. `19` is `12 + 7` — `Apple`'s and `Banana`'s
quantities — confirming `Category::totalQuantity` combines its
children correctly at one level of nesting.)

### Connecting Sentence

One level of nesting is now proven correct; the next Concept Unit
builds a category *of* categories, and proves the exact same code —
unchanged — gives the right answer two levels deep, which is the
lesson's own title made concrete: a bundle passing for a single item,
anywhere either one is expected.

---

## Concept Unit 3: Treating a Bundle Exactly Like a Single Item

### The Problem

Everything so far proves `Category` can combine its *direct* children's
answers — but a real catalog nests further than one level: a category
can contain another category, which contains individual products. And,
more importantly than nesting alone: any calling code that wants to
report on "some catalog item" — without caring in advance whether it's
one product or an entire department — needs to be able to hold *either*
kind of thing through the exact same variable type and call the exact
same method on it.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `catalog_composite.cpp`, modified.
- **Change type** — add (a two-level nested catalog, and one function
  demonstrating uniform treatment).
- **Location** — inside `main`, replacing the single-category example
  from Concept Unit 2.
- **Dependencies** — `Product` and `Category`, both already built.

### The New Code

```cpp
void report(const std::string& label, CatalogItem* item) {
    std::cout << label << ": " << item->totalQuantity() << std::endl;
}
```

### The Updated Project

The complete real project, with a genuinely two-level nested catalog
built in `main`, and `report` (above, new) called on three different
things — a bare product, a one-level category, and the whole nested
structure:

```cpp
void report(const std::string& label, CatalogItem* item) {   // ← new
    std::cout << label << ": " << item->totalQuantity() << std::endl; // ← new
}                                                               // ← new

int main() {
    Product* apple = new Product("Apple", 12);
    Product* banana = new Product("Banana", 7);
    Product* bread = new Product("Bread", 4);

    Category* produce = new Category("Produce");
    produce->add(apple);
    produce->add(banana);

    Category* bakery = new Category("Bakery");
    bakery->add(bread);

    Category* catalog = new Category("Catalog");     // ← new
    catalog->add(produce);                            // ← new
    catalog->add(bakery);                              // ← new

    report("a single product (Apple)", apple);           // ← new
    report("a small category (Produce)", produce);        // ← new
    report("the entire nested catalog", catalog);          // ← new

    return 0;
}
```

### Introduce the Concept in Isolation

No new isolated lab is needed for this Concept Unit specifically — it
doesn't introduce a new language construct; it *combines* two already-
proven facts: `Category` correctly sums one level of children (Concept
Unit 2's real project run), and any `CatalogItem*` — whichever concrete
type it actually points at — answers `totalQuantity()` correctly
(Concept Unit 1 and 2's isolated labs, together). What's new here is
purely the structural claim that nesting a second level, and writing
one function against the shared base type, requires no new code beyond
what's already been proven — which is exactly what this unit's real,
verified run demonstrates directly, immediately below, rather than
through a separate throwaway example.

### Mechanical Walkthrough

Enumerating what's new in this Concept Unit:

- **`void report(const std::string& label, CatalogItem* item)`** — a
  free function taking a `CatalogItem*`, not a `Product*` or
  `Category*` specifically. This is the direct, concrete expression of
  this lesson's own title: `report` is written once, against the
  shared interface, and works correctly no matter which concrete type
  is actually passed in — proven, not merely claimed, by the real
  failure this lesson's Closing causes on purpose when that shared type
  is narrowed back down to just `Product*`.
- **`item->totalQuantity()`** (inside `report`) — the same virtual call
  already explained in full in Concept Units 1 and 2, now reached
  through a function parameter rather than a local variable — the
  mechanism is identical regardless of where the `CatalogItem*` came
  from.
- **`Category* catalog = new Category("Catalog"); catalog->add(produce); catalog->add(bakery);`**
  — builds the second level of nesting: `catalog`'s two children are
  themselves `Category` objects (`produce`, `bakery`), not `Product`s.
  `add`'s own parameter type is `CatalogItem*` (Concept Unit 2), and a
  `Category*` converts to that automatically via the same public
  inheritance mechanism a `Product*` already relied on — `add` never
  needed to change, or even be aware, that its second call this time
  received a category instead of a product.
- **`report("a single product (Apple)", apple);`** — calls `report`
  with a `Product*`, implicitly converted to `CatalogItem*` at the call
  site, same inheritance-based conversion as above.
- **`report("a small category (Produce)", produce);`** — the identical
  call, now with a `Category*` — same function, same one line of code
  inside it, resolving via virtual dispatch to `Category`'s own
  `totalQuantity`, one level of real recursion.
- **`report("the entire nested catalog", catalog);`** — the identical
  call again, now with a `Category*` whose own children are themselves
  `Category`s — same function, same one line of code, resolving to
  `Category::totalQuantity`, which itself calls `totalQuantity()` on
  `produce` and `bakery`, each of which calls it again on *their* own
  children — two full levels of recursion, from one unchanged function.

### Execution Trace

The third call, `report("the entire nested catalog", catalog)`, traced
through its own recursive calls — a timing/control-flow trace, since
the interesting fact here is *when* each virtual call actually resolves
to which concrete implementation, not a changing loop value:

1. `item->totalQuantity()` inside `report` — `item` points at
   `catalog`, a `Category`, so this resolves to
   `Category::totalQuantity`, called on `catalog`.
2. `catalog`'s own `totalQuantity` begins its loop over `children`,
   which holds `produce` and `bakery`. The first iteration calls
   `child->totalQuantity()` where `child` points at `produce` — another
   `Category` — so this resolves to `Category::totalQuantity` *again*,
   now called on `produce`.
3. `produce`'s own `totalQuantity` loops over *its* `children` (`apple`,
   `banana`). `child->totalQuantity()` on `apple` resolves to
   `Product::totalQuantity` this time — `apple` is a leaf — returning
   `12` directly, no further recursion.
4. `child->totalQuantity()` on `banana` — also `Product::totalQuantity`
   — returns `7` directly.
5. `produce`'s loop finishes: `sum = 12 + 7 = 19`, returned back up to
   step 2's still-running call.
6. Back in `catalog`'s own loop (step 2), `produce`'s call has now
   returned `19` — `catalog`'s own `sum` becomes `19`. The loop's
   second iteration calls `child->totalQuantity()` where `child` points
   at `bakery` — a third `Category` — resolving to
   `Category::totalQuantity` on `bakery`.
7. `bakery`'s own `totalQuantity` loops over its one child, `bread` — a
   `Product` — `child->totalQuantity()` resolves to
   `Product::totalQuantity`, returning `4` directly.
8. `bakery`'s loop finishes: `sum = 4`, returned back up to step 6's
   still-running call.
9. `catalog`'s own `sum`, which was `19` after `produce`, now adds
   `bakery`'s `4`: `sum = 19 + 4 = 23`. `catalog`'s loop has no more
   children; it returns `23`.
10. Back in `report` (step 1), `item->totalQuantity()` has now returned
    `23` — `report` prints `"the entire nested catalog: 23"`.

Three separate calls to `Category::totalQuantity` (on `catalog`,
`produce`, and `bakery`) and two calls to `Product::totalQuantity` (on
`apple` and `banana`, plus one more on `bread`) — six virtual calls
total, all triggered by the *one* line of code inside `report`, which
never changed across any of the three top-level calls in `main`.

### CS Lens

A recursive structure where every level's own operation is defined
purely in terms of calling that same operation on the level below is
one of computer science's most direct expressions of **structural
recursion** — the recursion follows the data's own shape exactly,
rather than an index or a counter. Also recognized in: any
recursively-defined data format walked by a matching recursive
function (an S-expression, a JSON value that can itself contain more
JSON values); a company's own reporting-line structure, where "total
headcount" at any level is defined the same way at every level, all the
way up; and, again, Lesson A6's merge sort, whose own correctness proof
relies on the exact same idea — the whole problem's answer is defined
purely in terms of smaller instances of the identical problem.

### SE Lens

The design choice being reinforced concretely now: `report` takes
`CatalogItem*`, never `Product*` or `Category*` specifically —
programming against the most general shared type that still supports
everything the caller actually needs, a real, named practice (often
called "program to an interface, not an implementation"). The
alternative — `report` taking `Product*`, with a *second*, separately
written overload taking `Category*` — would work for exactly these two
concrete types, but would need a *third* overload the moment any new
`CatalogItem` subclass is ever added; programming against `CatalogItem*`
instead means `report` already works with any future subclass, without
being touched again — proven directly, and by contrast, in this
lesson's own Closing.

### Commands Needed

No new flags; same `clang++ -std=c++17 -Wall -Wextra` invocation used
throughout this project.

### Run It — Real Output

The complete real project, compiled and run in exactly this state:

```
$ clang++ -std=c++17 -Wall -Wextra step_nested.cpp -o step_nested && ./step_nested
a single product (Apple): 12
a small category (Produce): 19
the entire nested catalog: 23
```

(Verified this session by compiling and running the real project file
in this exact state. `23` is `12 + 7 + 4` — `Apple`, `Banana`, and
`Bread`'s quantities, reached across two full levels of nesting by one
unchanged function, `report`, called identically all three times.)

### Connecting Sentence

`report` now proves a single, unchanged function handles a bare product
and an arbitrarily deep nested catalog identically; the Closing, next,
removes that shared interface on purpose to show precisely what stops
working without it.

---

## Closing

### Connect the Pieces

Follow `bread`, the deepest-nested item in this lesson's catalog,
through one call to `report("the entire nested catalog", catalog)`:

1. `bread` was built directly as a `Product`, holding quantity `4`
   (Concept Unit 1's own leaf type).
2. `bread` was added to `bakery`, a `Category`, via `bakery->add(bread)`
   (Concept Unit 2's `add` method) — `bread` itself never changes; only
   `bakery`'s own `children` vector now holds a pointer to it.
3. `bakery` was added to `catalog`, a second-level `Category`, via
   `catalog->add(bakery)` (Concept Unit 3) — `bakery` doesn't change
   either; it's now simultaneously a `Category` in its own right *and*
   one of `catalog`'s children.
4. `report("the entire nested catalog", catalog)` calls
   `catalog->totalQuantity()`, which — per this lesson's own Execution
   Trace — eventually reaches `bakery->totalQuantity()`, which reaches
   `bread->totalQuantity()`, which returns `4` directly, with no further
   recursion, because `bread` is a `Product`, a leaf.

`bread`'s own `4` travels up through two full levels of `Category`
recursion into `catalog`'s final `23` — reached without `report`,
`catalog`, or `bakery` ever containing a single line of code that knows
`bread` exists specifically, only that *something* under them does.

### What Breaks Without This

Narrowing `report`'s parameter type from the shared `CatalogItem*` back
down to `Product*` specifically, on purpose:

```cpp
// bug: takes a Product* specifically, instead of the shared CatalogItem* interface
void report(const std::string& label, Product* item) {
    std::cout << label << ": " << item->totalQuantity() << std::endl;
}
```

Compiled for real:

```
$ clang++ -std=c++17 -Wall -Wextra break_no_shared_interface.cpp -o break_no_shared_interface
break_no_shared_interface.cpp:57:5: error: no matching function for call to 'report'
   57 |     report("a small category (Produce)", produce);
      |     ^~~~~~
break_no_shared_interface.cpp:47:6: note: candidate function not viable: no known conversion from 'Category *' to 'Product *' for 2nd argument
   47 | void report(const std::string& label, Product* item) {
      |      ^                                ~~~~~~~~~~~~~
1 error generated.
```

A real, verified failure, and a genuinely different *kind* of one from
this project's earlier "what breaks" demonstrations — not a crash, not
an abstract-class error, but the compiler refusing to even consider
`report` a candidate function for a `Category*` argument, because
`Category*` simply cannot convert to `Product*` (a `Category` is not,
and was never meant to be, a kind of `Product` — only a fellow
`CatalogItem`). The call that still works, `report(..., apple)`, is
left completely unaffected — `apple` really is a `Product*`, so that
call still compiles and runs fine; only the calls trying to pass a
`Category*` where `Product*` is required fail. This is the precise,
compiler-enforced proof that `report`'s *original* signature — taking
`CatalogItem*` — was never a stylistic preference; it's the only
signature under which a single product and an entire nested catalog can
both be handed to the same function at all. Restoring it:

```cpp
void report(const std::string& label, CatalogItem* item) {
    std::cout << label << ": " << item->totalQuantity() << std::endl;
}
```

### Exercises

- Add a third leaf, `Milk` (quantity `9`), to a new `Category`,
  `"Dairy"`, and add `"Dairy"` to `catalog` alongside `"Produce"` and
  `"Bakery"`. Predict the new `"the entire nested catalog"` total by
  hand before running it, then confirm.
- Add a `count() const` method to `CatalogItem` (pure virtual, like
  `totalQuantity()`) that returns how many *products* — not categories
  — exist at or below a given item: `1` for any `Product`, and the sum
  of each child's own `count()` for a `Category`. Verify it reports `5`
  for `catalog` once the Dairy exercise above is added.
- Predict, by hand, what would happen if a `Category` were accidentally
  added as one of its *own* children (`catalog->add(catalog);`) — then
  actually try it and observe what really happens, and explain, in your
  own words, why `TreeNode`'s tree shape (Lessons B1–B3) could never
  have this specific problem in the first place.

### Definition of Done

- [ ] `catalog_composite.cpp` compiles cleanly with `clang++
      -std=c++17 -Wall -Wextra`, no warnings.
- [ ] Running it prints all three `report` lines, with `12`, `19`, and
      `23` respectively.
- [ ] Every isolated lab in this lesson was actually compiled and run
      this session, with real pasted output.
- [ ] The narrowed-parameter-type failure was actually caused and
      observed, confirming exactly which call site breaks and which
      one doesn't, then reverted.
- [ ] `git commit -m "Let a single catalog item and an arbitrarily
      nested bundle of them be handled by identical calling code —
      Category implements the same interface Product does, so
      totalQuantity recurses through any depth of nesting for free"`
