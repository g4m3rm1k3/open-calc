# Lesson 19: The Ceremony Java Required, Removed Again
### (Project 8 — Desktop Inventory Tracker, C#)

**What you will build.** The same `Product` shape from Project 7,
rebuilt in C# — but where Java's Lesson 16 needed a `private` field plus
a hand-written `public` getter for every single exposed value, C#'s
**properties** do the same job with almost no ceremony at all, while
keeping every guarantee. And where Java's own collection filtering
(Lesson 16's `Inventory.all()`, Lesson 18's `LowStockReport`) meant
writing a real loop with a real `if` every time, C#'s **LINQ** expresses
the same operations as short, declarative expressions. The transferable
problem this lesson is actually about: two languages solving the exact
same problems Phase 3 already solved, with real, measurable differences
in how much ceremony each one actually requires — proven side by side,
not asserted.

**What you need to know first.** Project 7 (Phase 3) in full —
specifically `Product`'s `private` fields and getters (Lesson 15),
and the manual loops behind `Inventory.all()`/`LowStockReport.include()`
(Lessons 16 and 18). This lesson exists specifically to compare against
both, directly.

---

## Concept Unit: Properties

### The Problem

Every exposed field on every Java class in Project 7 needed the same
three-part dance: a `private` field, a `public` method to read it, and,
for anything genuinely mutable, a `public` method to write it too —
`getSku()`, `getPrice()`, and so on, all through Lesson 15–18. C#'s
equivalent guarantee — controlled, validatable access to a field — is
about to be shown taking a fraction of the code, without losing any of
the protection.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `PropertyLab.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — the .NET SDK's C# compiler — no separate install
  needed beyond what's already used to build and run this lesson's
  examples.

### The New Code

```csharp
class Point {
    public int X { get; set; }
    public int Y { get; set; }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
Point p = new Point();
p.X = 3;
p.Y = 4;
Console.WriteLine(p.X + p.Y);
```

Real output:

```
7
```

`p.X = 3` looks exactly like setting a plain public field — no method
call syntax anywhere — and `p.X` reads it back the same way. But
`{ get; set; }` isn't a field; it's an **auto-implemented property**:
C# generates a hidden private backing field and trivial get/set methods
automatically, with none of Java's `private int x; public int getX() {
return x; } public void setX(int x) { this.x = x; }` ever written by
hand. This alone already replaces two full Java methods per field with
one line — but the real payoff isn't the shorthand for the trivial
case; it's what happens the moment a property needs to do something
*other* than trivial storage, shown directly below.

### Discard the throwaway example

`Point` is deleted — it only existed to prove the shorthand syntax
compiles and behaves like a plain field from the caller's side,
isolated from `Product` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `Product.cs`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```csharp
class Product {
    public string Name { get; set; }

    private double price;
    public double Price {
        get { return price; }
        set {
            if (value < 0) {
                throw new ArgumentException("Price cannot be negative");
            }
            price = value;
        }
    }

    public Product(string name, double price) {
        Name = name;
        Price = price;
    }

    public string Summary() {
        return $"{Name}: ${Price}";
    }
}
```

### The Updated Project

Brand-new file, shown whole above — `Name` stays a trivial
auto-implemented property; `Price` becomes a **full property**, with an
explicit backing field (`price`, lowercase) and real validation logic
inside its `set` block, the direct C# counterpart to what Project 3,
Lesson 9 hand-validated inside a POST handler, and what Java's own
`private`/getter pattern *could* have done but Project 7 never actually
needed to.

### Mechanical walkthrough

- `public string Name { get; set; }` — **(b) hard concept reappearing**,
  the auto-implemented shorthand proven in the isolated `Point` lab.
- `private double price;` — **(b) hard concept reappearing**, an
  ordinary private field — but note the naming convention: `Price`
  (capitalized) is the public property; `price` (lowercase) is the
  private backing field behind it — a real, common C# convention with
  no direct Python or JavaScript equivalent, since neither language
  distinguishes casing this way by convention.
- `public double Price { get { return price; } set { ... } }` — **(a)
  first appearance** of a **full property**: `get { }` and `set { }`
  are real method bodies, not generated automatically this time —
  `get` runs whenever `Price` is *read*, `set` runs whenever it's
  *assigned*.
- `if (value < 0) { throw new ArgumentException("Price cannot be negative"); }`
  — **(a) first appearance** of the implicit `value` keyword: inside a
  property's `set` block, `value` automatically refers to whatever was
  assigned — `p.Price = -5` makes `value` equal `-5` inside this exact
  block, with no parameter declared anywhere, unlike Java's explicit
  `setPrice(double price)` parameter.
- `Price = price;` inside the constructor — **(a) first appearance,
  conceptually**: assigning to the *property* `Price`, not the backing
  field `price`, directly from the constructor — meaning the validation
  logic inside `Price`'s own `set` runs even during construction,
  automatically, with no separate call needed.
- `$"{Name}: ${Price}"` — **(a) first appearance** of a **string
  interpolation** literal: `$"..."` with `{expr}` sections evaluated and
  substituted — C#'s own version of Python's f-string and JavaScript's
  template literal, both already proven in earlier phases.

### CS lens

This is still encapsulation — Java's own Lesson 15 concept, unchanged
— expressed with a language feature purpose-built for exactly this
shape: controlled access that *looks* like direct field access from the
outside. Also recognized in: Kotlin's and Swift's own properties (both
directly inspired by C#'s), Python's `@property` decorator (available
in Phase 1 but never used, since nothing there needed validated
assignment specifically), TypeScript's `get`/`set` accessors.

### SE lens

Proven directly, not just claimed: calling `p.Price = -5` on the real
`Product` above:

```csharp
try {
    p.Price = -5;
} catch (ArgumentException e) {
    Console.WriteLine("Caught: " + e.Message);
}
```

Real output:

```
Widget: $9.99
Widget: $12.5
Caught: Price cannot be negative
```

The exact same validation guarantee Java's `setPrice(double price) {
if (price < 0) throw ... }` would have required — here, `p.Price = -5`
is indistinguishable, at the call site, from assigning a plain public
field, and the validation still runs, invisibly, underneath. The real
tradeoff, worth naming honestly: this closeness to plain-field syntax
is also properties' biggest risk — a property's `set` can do
arbitrary, potentially expensive or side-effecting work, and nothing
about `p.Price = -5`'s *appearance* warns a reader that it might throw,
the way a method call's name (`setPrice`) at least hints that something
real might be happening.

### Commands needed

C# source is compiled with the C# compiler and run against the .NET
runtime — the mechanics are the same `compile, then run` two-step
Lesson 15 established for Java, with different tool names underneath.

### Run it

Shown above, in full.

### Connecting sentence

The exact guarantee Java's Lesson 15 needed two methods to provide now
takes one property, with validation logic still fully intact — the
next unit shows the same "less ceremony, same guarantee" pattern
applied to something Java's Lessons 16 and 18 both needed real loops
for.

---

## Concept Unit: LINQ

### The Problem

Filtering a list down to matching items, and sorting it, both needed a
real, hand-written loop in every Java lesson so far — `Inventory.all()`'s
plain iteration, `LowStockReport.include()`'s `if` check, called once
per item from inside `ReportGenerator`'s own loop. C# has a built-in,
declarative way to express exactly these operations without writing the
loop by hand at all.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `LinqLab.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `System.Linq`, part of the .NET standard library.

### The New Code

```csharp
using System.Linq;
using System.Collections.Generic;

List<int> numbers = new List<int> { 5, 12, 8, 3, 19, 7 };

List<int> bigOnes = numbers.Where(n => n > 7).ToList();
List<int> sorted = numbers.OrderBy(n => n).ToList();
int total = numbers.Sum();
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
12, 8, 19
3, 5, 7, 8, 12, 19
Sum: 54
```

`.Where(n => n > 7)` filtered the list down to exactly the items
matching a condition — the direct C# counterpart to Java's `if` inside
a loop, expressed as a single call instead. `.OrderBy(n => n)` sorted
it — no `Comparator`, no `Collections.sort` (Lesson 18's own exercise
named exactly this Java tool) — just the value each item should be
sorted by, handed directly to `OrderBy`. `.Sum()` needed no loop, no
accumulator variable, at all. `n => n > 7` and `n => n` are **lambda
expressions** — a genuinely lighter-weight version of the exact same
idea Java's Lesson 15 introduced as a shorthand *on top of* a required
interface; C# doesn't require declaring an interface first at all for
this.

### Discard the throwaway example

`numbers`/`bigOnes`/`sorted` are deleted — they only existed to prove
`.Where`/`.OrderBy`/`.Sum` work as real, chainable operations, isolated
from `Product` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `InventoryLinqDemo.cs`.
- **Change type** — add.
- **Location** — new file, alongside `Product.cs`.
- **Dependencies** — `Product.cs`, this lesson's previous unit;
  `System.Linq`.

### The New Code

```csharp
List<Product> lowStockManual = new List<Product>();
foreach (Product p in products) {
    if (p.Quantity < 5) {
        lowStockManual.Add(p);
    }
}
lowStockManual.Sort((a, b) => a.Quantity.CompareTo(b.Quantity));
```

and, doing the identical job:

```csharp
var lowStockLinq = products
    .Where(p => p.Quantity < 5)
    .OrderBy(p => p.Quantity)
    .ToList();
```

### The Updated Project

Brand-new file, shown whole above — deliberately written both ways in
the same file, side by side, specifically so the comparison is real and
direct rather than described from memory.

### Mechanical walkthrough

- `foreach (Product p in products) { if (p.Quantity < 5) { lowStockManual.Add(p); } }`
  — **(b) hard concept reappearing**: structurally identical to Java's
  enhanced `for` loop from Lesson 16 and `LowStockReport.include()`'s
  own filtering logic from Lesson 18, just in C#'s own loop syntax.
- `lowStockManual.Sort((a, b) => a.Quantity.CompareTo(b.Quantity));` —
  **(b) hard concept reappearing**: a lambda passed directly as a
  comparison function — the same idea as Java's `Comparator`, without
  needing to name an interface first.
- `products.Where(p => p.Quantity < 5)` — **(b) hard concept
  reappearing**, `.Where` from the isolated lab, now filtering real
  `Product` objects by a real field instead of plain integers.
- `.OrderBy(p => p.Quantity)` — **(b) hard concept reappearing**, same
  idea, chained directly onto `.Where`'s own result — **(a) first
  appearance** of this specific *chaining* shape: each LINQ method
  returns something that can itself have another LINQ method called on
  it, so a whole pipeline of operations reads as one fluent expression,
  echoing the same method-chaining shape Project 7, Lesson 16's
  `ProductBuilder` used for construction, here used for querying
  instead.
- `.ToList()` — **(a) first appearance.** LINQ operations like `.Where`
  and `.OrderBy` don't immediately produce a list — they produce a
  *description* of the operation, only actually executed when something
  like `.ToList()` asks for the real, concrete result. Not explored
  further here, but worth naming honestly rather than glossing over:
  this is a genuinely different execution model (called **deferred
  execution**) from anything in this curriculum so far.

### CS lens

LINQ is **declarative** querying: stating *what* result is wanted
(items where quantity is under 5, sorted by quantity) rather than *how*
to compute it step by step (loop, check, collect, then loop again to
sort). Also recognized in: SQL itself (`SELECT * FROM products WHERE
quantity < 5 ORDER BY quantity` — genuinely the same underlying idea,
which is not a coincidence; LINQ was explicitly designed to feel
SQL-like), Python's list comprehensions (Project 1, Lesson 2 — a
smaller-scale version of the same declarative instinct), JavaScript's
`.filter()`/`.sort()` array methods (Project 5's own `.filter()` from
Project 4, Lesson 11 — the same idea, without LINQ's chained-pipeline
breadth).

### SE lens

Both versions above produce *identical* real output, confirmed
directly:

```
--- manual loop ---
Gizmo (Z-003): $14.99 x1
Gadget (G-002): $19.99 x3
--- LINQ ---
Gizmo (Z-003): $14.99 x1
Gadget (G-002): $19.99 x3
```

The manual version is six lines and a separate `.Sort()` call with an
explicit comparison lambda; the LINQ version is three lines, chained.
The real cost isn't performance (LINQ's `.Where`/`.OrderBy` are
themselves implemented as loops underneath — this isn't magic, just
already-written code) — it's a genuine readability tradeoff in the
other direction from what Phase 3 kept emphasizing: LINQ hides the loop
entirely, which is exactly what makes it concise, and exactly what
makes debugging a subtle mid-pipeline bug harder than stepping through
an explicit `foreach` line by line. Both are real, valid choices; this
project will keep using LINQ where the operation is genuinely simple
(a filter, a sort, a sum) and drop back to explicit loops the moment
per-item logic gets complex enough that spelling it out plainly is
clearer than compressing it into a lambda.

### Commands needed

Same compile-then-run pattern as this lesson's first unit.

### Run it

Shown above.

### Connecting sentence

The exact filtering and sorting logic Project 7 needed real loops for,
twice, across two separate lessons, now takes three chained lines — the
same "same guarantee, less ceremony" theme as this lesson's first unit,
now proven against operations instead of field access.

---

## Closing

**Connect the pieces.** One inventory, through the whole lesson:
`Product`'s `Price` property enforces non-negativity on every single
assignment, anywhere in the codebase, through nothing more than plain
`=` syntax — the same guarantee Java's Lesson 15 needed a dedicated
method for. `products.Where(p => p.Quantity < 5).OrderBy(p => p.Quantity).ToList()`
produces the exact low-stock, sorted-by-urgency list Project 7,
Lesson 18's `LowStockReport` needed a `ReportGenerator` subclass and an
overridden `include()` method to produce — here, one chained
expression, no subclass required. Neither of C#'s tools removed a
single guarantee Phase 3 built — they removed the *ceremony* those
guarantees cost in Java, proven side by side rather than assumed.

**What breaks without this.** Already shown directly — the caught
`ArgumentException` from `p.Price = -5`, and the byte-for-byte identical
output between the manual loop and the LINQ pipeline — deliberately not
restaged here, since both proofs already happened exactly where they
mattered, inside the units that built them.

**Exercises.**
1. Add a `Sku` property to `Product` using the full `get`/`set` syntax,
   with a `set` that throws if the value is empty — the same validation
   shape as `Price`, applied to a `string` instead of a `double`.
2. Rewrite this lesson's `InventoryLinqDemo` to also compute the total
   value of all low-stock inventory (`quantity * price`, summed) —
   first with an explicit loop, then as a single chained LINQ
   expression using `.Sum(p => ...)`. Confirm both produce the same
   number.
3. LINQ's `.Where`/`.OrderBy` were named as *deferred* — not actually
   run until something like `.ToList()` asks for a result. Add a
   `Console.WriteLine` inside a `.Where` lambda, and, without calling
   `.ToList()` or otherwise consuming the result, confirm — with real
   output — that the `WriteLine` never actually runs. Then call
   `.ToList()` and confirm it does.

**Definition of done.**
- [ ] `Product`'s `Price` property enforces its validation rule on
      every assignment, confirmed by a real caught `ArgumentException`.
- [ ] A LINQ pipeline and a manually written loop produce byte-for-byte
      identical output for the same filtering-and-sorting task,
      confirmed against real output.
- [ ] You can state, in one sentence each, what ceremony properties
      removed compared to Java's getters/setters, and what ceremony
      LINQ removed compared to Java's manual loops — and one honest
      cost each one introduced in exchange.
- [ ] Commit with a message explaining why — e.g. `"Replace Java-style
      getters/setters with C# properties carrying the same validation,
      and replace manual filter/sort loops with LINQ producing
      identical results"` — not `"port Product to C#"`.

**Next lesson** stays in Project 8: the `Observer` pattern's C#-native
form — `event` and `delegate` — compared directly against both Project
2, Lesson 7's hand-built Python version and Project 4, Lesson 10's
already-built-in JavaScript `addEventListener`, landing C# somewhere
genuinely distinct between the two.
