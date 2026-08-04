# Lesson 18: A Fixed Set of Values, Layered Behavior, and a Locked Algorithm
### (Project 7 — Inventory Management System, Java)

**What you will build.** A `Category` enum replacing a stringly-typed
field with a real, compiler-checked fixed set of values; `PricingStrategy`
decorators — `TaxDecorator`, `GiftWrapDecorator` — stacking behavior on
top of `RegularPricing`/`ClearancePricing` without touching either;
and a `ReportGenerator` whose overall shape is *locked*, while specific
steps stay open for each report type to define differently. The
transferable problems this lesson is actually about: representing "one
of exactly these options, nothing else" as a real type instead of a
string anyone could misspell, adding behavior by wrapping instead of
modifying, and separating what must never change about an algorithm
from what's deliberately left open.

**What you need to know first.** Lesson 15 — `PricingStrategy` as a
real interface. Lesson 16 — `Product.ProductBuilder`. Lesson 17 —
`ProductRepository`, `Product.toLine`/`fromLine`.

---

## Concept Unit: `enum`

### The Problem

A `Product`'s category — electronics, clothing, groceries — has a real,
small, fixed set of valid values. Representing it as a plain `String`
field, the way every project in this curriculum has represented
similar fields so far, means `"Electronics"`, `"electronics"`, and
`"ELECTRONCIS"` (a typo) are all equally valid as far as the compiler is
concerned — a mismatch that would only ever surface as a bug at
runtime, the same category of problem Lesson 15's whole first unit
exists to prevent for other kinds of values.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `EnumLab.java` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond the JDK.

### The New Code

```java
public class EnumLab {
    enum Direction { NORTH, SOUTH, EAST, WEST }

    public static void main(String[] args) {
        Direction d = Direction.NORTH;
        System.out.println(d);

        switch (d) {
            case NORTH -> System.out.println("Heading up");
            case SOUTH -> System.out.println("Heading down");
            default -> System.out.println("Heading sideways");
        }
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
NORTH
Heading up
```

`enum Direction { NORTH, SOUTH, EAST, WEST }` declares a brand-new
*type* — not a `String`, not an `int` — whose only legal values are
exactly those four named constants. `Direction d = Direction.NORTH;`
assigns one of them, and `switch (d) { case NORTH -> ...}` branches on
which one, by name, directly — no string comparison, no risk of a typo
silently falling through to the wrong branch. Now, proving the compiler
genuinely enforces this rather than just providing convenient names:

```java
EnumLab.Direction d = "NORTH";
```

```
$ javac EnumTypeCheck.java
EnumTypeCheck.java:3: error: incompatible types: String cannot be converted to Direction
        EnumLab.Direction d = "NORTH";
                              ^
1 error
```

A plain `String`, even one that reads identically to a real enum
constant's name, is rejected outright — `Direction` and `String` are
different types entirely, the same guarantee Lesson 15 proved for
`int`/`String`, now protecting a fixed set of named options instead of
an open-ended value.

### Discard the throwaway example

`EnumLab`/`EnumTypeCheck` are deleted — they only existed to prove
`enum` creates a real, distinct, compiler-checked type, isolated from
`Product` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `Category.java`; modified `Product.java`.
- **Change type** — add; add a field, a getter, and a builder setter.
- **Location** — `Category.java` is new; `Product`/`ProductBuilder`
  gain a `category` field.
- **Dependencies** — none new.

### The New Code

```java
public enum Category {
    ELECTRONICS, CLOTHING, GROCERY, TOYS
}
```

and, inside `Product`/`ProductBuilder`:

```java
    private Category category;
    // ...
        private Category category = Category.GROCERY;
    // ...
        public ProductBuilder setCategory(Category category) {
            this.category = category;
            return this;
        }
```

### The Updated Project

`Category.java`, in full — a top-level `enum`, its own file, the same
way a top-level `class` gets its own file:

```java
public enum Category {
    ELECTRONICS, CLOTHING, GROCERY, TOYS
}
```

`Product.summary()` changes to include it:

```java
    public String summary() {
        return name + " (" + sku + ") [" + category + "]: $" + price + " x" + quantity;  // ← changed
    }
```

### Mechanical walkthrough

- `public enum Category {` — **(b) hard concept reappearing**, same
  mechanics as `Direction`, now declared as its own top-level type
  rather than nested inside a demo class — the normal way a real
  project's enum would be declared, since other classes (`Product`) need
  to reference it by name.
- `private Category category;` — **(c) already basic**, a typed field,
  same as every other field on `Product`.
- `private Category category = Category.GROCERY;` inside
  `ProductBuilder` — **(b) hard concept reappearing**: a default value,
  same mechanism as `description`/`quantity`'s own defaults from Lesson
  16 — here chosen as an arbitrary but real default rather than leaving
  it unset (Java's default for any object-typed field would otherwise be
  `null`).
- `public ProductBuilder setCategory(Category category) { this.category
  = category; return this; }` — **(b) hard concept reappearing**, the
  exact chained-setter shape from Lesson 16.
- `"[" + category + "]"` inside `summary()` — **(b) hard concept
  reappearing**: string concatenation, proven safe for arbitrary types
  back in Lesson 15 — an `enum` constant converts to its own name
  (`"ELECTRONICS"`) automatically when concatenated, the same way a
  `double` or `int` did.

### CS lens

An `enum` is an **algebraic data type** in its simplest common form: a
type whose every possible value is enumerable and known in advance.
Also recognized in: Python's own `enum` module (available, though never
used in Phase 1, since nothing there needed this level of enforcement),
TypeScript's union of string literal types, a database column with a
`CHECK` constraint restricting it to a fixed list of values.

### SE lens

The alternative — a plain `String category` field, exactly the shape
every other "one of a few options" value has taken across this entire
curriculum until now — costs nothing to declare and would have worked,
functionally, for `summary()`'s own purposes. The real cost only shows
up the moment something needs to *branch* on category — an `if
(category.equals("Electronics"))` is one silent typo away from a bug
that never crashes, just silently never matches, exactly the shape of
failure Lesson 11 and Lesson 13 both already demonstrated for other
mistakes. `enum` costs one extra file; in exchange, `Category.ELECTRONICS`
either exists or it's a compile error — there is no third, silently
wrong option.

### Commands needed

Same `javac`/`java` pattern as every Java lesson.

### Run it

```java
Product p = new Product.ProductBuilder("Widget", 9.99, "W-001")
    .setQuantity(50)
    .setCategory(Category.ELECTRONICS)
    .build();

System.out.println(p.summary());
```

```
Widget (W-001) [ELECTRONICS]: $9.99 x50
```

### Connecting sentence

`Product`'s category is now a real, enforced set of options instead of
an open string — the next unit turns to a different kind of
flexibility: adding behavior to `PricingStrategy` without touching any
existing implementation of it at all.

---

## Concept Unit: The Decorator Pattern

### The Problem

Lesson 15 built `RegularPricing` and `ClearancePricing`. A real store
also needs tax added on top of *either* one, and, separately, an
optional gift-wrap fee, possibly *both at once*, possibly neither.
Writing a `RegularPricingWithTax`, a `ClearancePricingWithTax`, a
`RegularPricingWithTaxAndGiftWrap`, and so on for every combination is
exactly the same combinatorial explosion Lesson 16's own telescoping
constructor problem named — here for *behaviors* stacked together
instead of *fields* set together.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `GreeterDecoratorLab.java` (throwaway,
  this unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```java
interface Greeter {
    String greet(String name);
}

class PlainGreeter implements Greeter {
    public String greet(String name) {
        return "Hello, " + name;
    }
}

class ExcitedGreeter implements Greeter {
    private Greeter wrapped;

    public ExcitedGreeter(Greeter wrapped) {
        this.wrapped = wrapped;
    }

    public String greet(String name) {
        return wrapped.greet(name) + "!!!";
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```java
Greeter plain = new PlainGreeter();
Greeter excited = new ExcitedGreeter(plain);
Greeter veryExcited = new ExcitedGreeter(excited);

System.out.println(plain.greet("Ada"));
System.out.println(excited.greet("Ada"));
System.out.println(veryExcited.greet("Ada"));
```

Real output:

```
Hello, Ada
Hello, Ada!!!
Hello, Ada!!!!!!
```

`ExcitedGreeter` doesn't replace `PlainGreeter` — it *holds* one
(`wrapped`) and calls through to it, adding its own behavior on top of
whatever the wrapped `Greeter` already produced. Critically,
`ExcitedGreeter` itself `implements Greeter` — so it can be wrapped
*again*, by another `ExcitedGreeter`, proven directly by
`veryExcited`'s doubled `"!!!!!!"`. Neither `PlainGreeter` nor the first
`ExcitedGreeter` was ever modified to make this possible; the second
layer is purely additive, stacked from outside.

### Discard the throwaway example

`Greeter`/`PlainGreeter`/`ExcitedGreeter` are deleted — they only
existed to prove that wrapping the same interface repeatedly stacks
behavior cleanly, isolated from `PricingStrategy` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `TaxDecorator.java`,
  `GiftWrapDecorator.java`.
- **Change type** — add.
- **Location** — new files, alongside `PricingStrategy.java`,
  `RegularPricing.java`, `ClearancePricing.java`.
- **Dependencies** — `PricingStrategy`, Lesson 15.

### The New Code

```java
public class TaxDecorator implements PricingStrategy {
    private PricingStrategy wrapped;
    private double taxRate;

    public TaxDecorator(PricingStrategy wrapped, double taxRate) {
        this.wrapped = wrapped;
        this.taxRate = taxRate;
    }

    public double apply(double price) {
        double base = wrapped.apply(price);
        return base + (base * taxRate);
    }
}
```

```java
public class GiftWrapDecorator implements PricingStrategy {
    private PricingStrategy wrapped;
    private static final double GIFT_WRAP_FEE = 2.50;

    public GiftWrapDecorator(PricingStrategy wrapped) {
        this.wrapped = wrapped;
    }

    public double apply(double price) {
        return wrapped.apply(price) + GIFT_WRAP_FEE;
    }
}
```

### The Updated Project

Both files shown whole above — each one `implements PricingStrategy`,
the same interface `RegularPricing`/`ClearancePricing` implement, which
is precisely what makes them composable with each other and with the
strategies from Lesson 15: anything expecting a `PricingStrategy` — like
`Product.priceWith(...)` — can't tell the difference between a plain
strategy and a decorated one.

### Mechanical walkthrough

- `public class TaxDecorator implements PricingStrategy {` — **(b) hard
  concept reappearing**, `implements` from Lesson 15, satisfied by a
  class whose whole job is wrapping another implementation rather than
  computing a price from scratch.
- `private PricingStrategy wrapped;` — **(b) hard concept reappearing**,
  the exact `wrapped` field shape from the isolated `ExcitedGreeter` lab
  — note its declared type is the *interface*, `PricingStrategy`, not
  any specific implementing class, which is what allows *any*
  `PricingStrategy` — including another decorator — to be wrapped.
- `private static final double GIFT_WRAP_FEE = 2.50;` — **(a) first
  appearance** of `static final` used together: `static` means this
  value belongs to the class itself, not to any one instance; `final`
  means it can never be reassigned after being set — together, a real
  **constant**, Java's answer to a fixed value that should never change,
  with no direct equivalent keyword in Python or JavaScript (both rely
  on convention — naming something in `ALL_CAPS` — rather than
  compiler enforcement).
- `public double apply(double price) { double base = wrapped.apply(price); return base + (base * taxRate); }`
  — **(b) hard concept reappearing**: calls the *wrapped* strategy's own
  `apply` first, then adds its own behavior on top of that result — the
  exact call-through-then-add shape `ExcitedGreeter.greet` proved.

### CS lens

This is the **Decorator pattern**: adding responsibilities to an
individual object dynamically, by wrapping it, rather than by
subclassing or modifying it. Also recognized in: Python's own function
decorators (`@app.route(...)`, never formally named as "Decorator" in
Phase 1, but the same underlying idea — wrapping a function with added
behavior); Java's own `BufferedWriter` wrapping a `FileWriter` from
Lesson 17, doing exactly this for performance rather than pricing;
coffee-shop-style examples so common in describing this pattern that
this lesson deliberately used a greeting instead, to keep the isolated
lab from being a well-worn cliché standing in for real understanding.

### SE lens

The alternative — a `RegularPricingWithTax` class, a
`ClearancePricingWithTaxAndGiftWrap` class, and so on for every
combination — was already named as untenable in this unit's own Problem
section; decorators cost one small wrapper class per *independent*
behavior (tax, gift wrap) rather than one class per *combination* of
behaviors, and any subset can be composed at runtime, proven directly
below, without a single additional class ever being written for a new
combination.

### Commands needed

Same pattern.

### Run it

```java
Product widget = new Product.ProductBuilder("Widget", 20.00, "W-001").build();

PricingStrategy base = new RegularPricing();
System.out.println("Base: $" + widget.priceWith(base));

PricingStrategy withTax = new TaxDecorator(base, 0.08);
System.out.println("With tax: $" + widget.priceWith(withTax));

PricingStrategy withTaxAndGiftWrap = new GiftWrapDecorator(withTax);
System.out.println("With tax and gift wrap: $" + widget.priceWith(withTaxAndGiftWrap));

PricingStrategy clearanceWithTax = new TaxDecorator(new ClearancePricing(), 0.08);
System.out.println("Clearance with tax: $" + widget.priceWith(clearanceWithTax));
```

Real output:

```
Base: $20.0
With tax: $21.6
With tax and gift wrap: $24.1
Clearance with tax: $10.8
```

Four genuinely different pricing outcomes, from four different
compositions of the *same* three small classes — `RegularPricing`,
`ClearancePricing` from Lesson 15 untouched, `TaxDecorator` and
`GiftWrapDecorator` new — none of which required writing a class
specifically for "clearance with tax" or "regular with tax and gift
wrap."

### Connecting sentence

Behavior now layers cleanly on top of any `PricingStrategy` without
modifying it — the last unit turns to a different kind of structure:
one algorithm with a fixed shape, deliberately locked, with specific
steps left open for each real use to define.

---

## Concept Unit: The Template Method Pattern

### The Problem

This project needs reports — a full inventory listing, a low-stock
alert list — and both share the exact same *overall shape*: print a
title, walk every product, decide whether to include it, print it in
some format, print a footer. What differs between them is narrow and
specific: *which* products get included, and *how* each one gets
formatted. Writing two completely separate, unrelated methods for these
two reports would duplicate the shared shape and risk it drifting apart
between them over time.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `RecipeLab.java` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```java
abstract class Recipe {
    public final void make() {
        boilWater();
        brew();
        addCondiments();
    }

    private void boilWater() {
        System.out.println("Boiling water");
    }

    private void brew() {
        System.out.println("Steeping");
    }

    protected abstract void addCondiments();
}

class Tea extends Recipe {
    protected void addCondiments() {
        System.out.println("Adding lemon");
    }
}

class Coffee extends Recipe {
    protected void addCondiments() {
        System.out.println("Adding milk and sugar");
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```java
System.out.println("--- Tea ---");
new Tea().make();
System.out.println("--- Coffee ---");
new Coffee().make();
```

Real output:

```
--- Tea ---
Boiling water
Steeping
Adding lemon
--- Coffee ---
Boiling water
Steeping
Adding milk and sugar
```

`make()` runs the *exact same three steps, in the exact same order*,
for both `Tea` and `Coffee` — the first two, `boilWater()` and `brew()`,
produce identical output either way, because neither subclass can
override them (they're `private`, not even visible to subclasses).
Only the third step, `addCondiments()`, genuinely differs — because
`Recipe` declares it `abstract`, forcing every subclass to provide its
own version, the same requirement Lesson 15's `PricingStrategy`
interface placed on `apply`. `abstract class Recipe` itself can never
be instantiated directly (`new Recipe()` would be a compile error) —
only a concrete subclass, one that's actually provided every abstract
method, can be built.

### Discard the throwaway example

`Recipe`/`Tea`/`Coffee` are deleted — they only existed to prove a fixed
method sequence with exactly one deliberately open step, isolated from
`ReportGenerator` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `ReportGenerator.java`,
  `FullInventoryReport.java`, `LowStockReport.java`.
- **Change type** — add.
- **Location** — new files.
- **Dependencies** — `Product`, `Category`.

### The New Code

```java
public abstract class ReportGenerator {
    public final void generate(ArrayList<Product> allProducts) {
        System.out.println("=== " + title() + " ===");
        for (Product p : allProducts) {
            if (include(p)) {
                System.out.println(formatRow(p));
            }
        }
        System.out.println("=== End of report ===");
    }

    protected abstract String title();
    protected abstract boolean include(Product product);
    protected abstract String formatRow(Product product);
}
```

```java
public class FullInventoryReport extends ReportGenerator {
    protected String title() { return "Full Inventory"; }
    protected boolean include(Product product) { return true; }
    protected String formatRow(Product product) { return product.summary(); }
}
```

```java
public class LowStockReport extends ReportGenerator {
    private int threshold;

    public LowStockReport(int threshold) {
        this.threshold = threshold;
    }

    protected String title() {
        return "Low Stock (below " + threshold + ")";
    }

    protected boolean include(Product product) {
        return product.getQuantity() < threshold;
    }

    protected String formatRow(Product product) {
        return product.getName() + " -- only " + product.getQuantity() + " left!";
    }
}
```

### The Updated Project

Three brand-new files, shown whole above — `ReportGenerator.generate()`
is the fixed skeleton, `final`, identical to every report that will
ever exist; `title()`, `include()`, `formatRow()` are the three open
steps, each subclass filling them in completely differently.

### Mechanical walkthrough

- `public abstract class ReportGenerator {` — **(b) hard concept
  reappearing**, `abstract` from the isolated `Recipe` lab.
- `public final void generate(ArrayList<Product> allProducts) {` —
  **(a) first appearance** of `final` on a *method*: unlike `Recipe`'s
  version, which used `private` to prevent overriding, `generate` needs
  to be called from *outside* the class (by whatever code runs a
  report), so it has to be `public` — `final` is what prevents a
  subclass from overriding it while still allowing outside code to call
  it.
- `if (include(p)) { System.out.println(formatRow(p)); }` inside the
  loop — **(b) hard concept reappearing**: calling the two abstract
  methods from inside the fixed skeleton — neither call knows or cares
  which concrete subclass is actually running; that's decided entirely
  by which object `generate()` happens to be called on.
- `protected abstract String title();` / `include`/`formatRow` — **(b)
  hard concept reappearing**, the same abstract-method requirement as
  `Recipe.addCondiments()` and `PricingStrategy.apply()`, three
  separate open steps instead of one.
- `LowStockReport`'s own constructor and `threshold` field — **(b) hard
  concept reappearing**: an ordinary constructor and field, proving a
  concrete subclass can carry its *own* extra state (a threshold) that
  the abstract base class knows nothing about, used inside its own
  `include`/`title` implementations.

### CS lens

This is the **Template Method pattern**: an algorithm's overall
structure defined once, in one place, with specific steps deferred to
subclasses — the inverse emphasis from Strategy (Lesson 15), which
makes an *entire* behavior swappable as one unit; Template Method fixes
the *sequence* and only lets *pieces* of it vary. Also recognized in: a
unit testing framework's own `setUp()`/`test()`/`tearDown()` lifecycle
(the framework calls all three, in that fixed order, for every test —
Project 1, Lesson 4's `pytest`, seen now from underneath), a game
engine's fixed per-frame update loop with specific hooks games override,
a web framework's fixed request-handling pipeline with specific
middleware steps left open.

### SE lens

The alternative — two entirely separate, hand-written report methods
— would duplicate the shared header/footer/loop shape twice, and every
future report type would duplicate it again, with real risk of the two
copies quietly drifting apart (one report gaining a feature the other
never gets, purely by oversight). Template Method costs an abstract
base class and, honestly, a real constraint: any report this project
ever needs *has* to fit the fixed shape — title, filter, format, one
row per included item — and a genuinely different report shape (a
report that groups products by category, say, rather than listing them
flat) wouldn't fit this template at all and would need its own,
different design. Proven directly, the fixed skeleton really is locked:

```java
public void generate(java.util.ArrayList<Product> allProducts) {
    System.out.println("sneaking around the skeleton");
}
```

```
$ javac BadReport.java
BadReport.java:6: error: generate(ArrayList<Product>) in BadReport cannot override generate(ArrayList<Product>) in ReportGenerator
    public void generate(java.util.ArrayList<Product> allProducts) {
                ^
  overridden method is final
1 error
```

A subclass attempting to override `generate()` itself — bypassing the
fixed skeleton entirely — is rejected at compile time, the same
`final` guarantee proven for `ProductRepository`'s own encapsulation
back in Lesson 16, here protecting an algorithm's shape instead of a
constructor.

### Commands needed

Same pattern.

### Run it

```java
ArrayList<Product> products = new ArrayList<Product>();
products.add(new Product.ProductBuilder("Widget", 9.99, "W-001").setQuantity(50).build());
products.add(new Product.ProductBuilder("Gadget", 19.99, "G-002").setQuantity(3).build());
products.add(new Product.ProductBuilder("Gizmo", 14.99, "Z-003").setQuantity(1).build());

ReportGenerator full = new FullInventoryReport();
full.generate(products);

ReportGenerator lowStock = new LowStockReport(5);
lowStock.generate(products);
```

Real output:

```
=== Full Inventory ===
Widget (W-001) [GROCERY]: $9.99 x50
Gadget (G-002) [GROCERY]: $19.99 x3
Gizmo (Z-003) [GROCERY]: $14.99 x1
=== End of report ===
=== Low Stock (below 5) ===
Gadget -- only 3 left!
Gizmo -- only 1 left!
=== End of report ===
```

Two genuinely different reports — different titles, different filters
(all three products versus only the two under the threshold), different
row formats — produced by one shared `generate()` method that neither
subclass ever had to write or duplicate.

### Connecting sentence

The report's shape is fixed everywhere it needs to be, and open exactly
where each report type genuinely differs — the same
lock-what-must-stay-consistent, open-what-must-vary balance this whole
lesson has been building, now proven across three separate patterns in
one project.

---

## Closing

**Connect the pieces.** One product, through the whole lesson:
`new Product.ProductBuilder("Gadget", 19.99, "G-002").setQuantity(3).setCategory(Category.ELECTRONICS).build()`
carries a real, compiler-checked `Category`, not a stringly-typed
guess. `widget.priceWith(new TaxDecorator(new ClearancePricing(), 0.08))`
prices it through two independently-written, freely-composed
behaviors, neither aware the other exists. And
`new LowStockReport(5).generate(products)` walks it through a fixed,
`final` skeleton — title, filter, format, footer — deciding, entirely
through `LowStockReport`'s own `include()`, whether this specific
product (quantity `3`, below the threshold `5`) belongs in the report
at all.

**What breaks without this.** Already shown directly, three separate
times, exactly where each one landed: a `String` rejected in place of a
`Category`, and a subclass forbidden from overriding `generate()` —
deliberately not restaged here, since seeing each fail inside the real
code that needed the guarantee is the whole point.

**Exercises.**
1. Add a `Category.TOYS`-only report — a third `ReportGenerator`
   subclass filtering `include()` on category instead of quantity,
   reusing the exact same `generate()` skeleton.
2. Write a `PercentOffDecorator` implementing `PricingStrategy`, taking
   a percentage in its constructor, and confirm — with real output — 
   that stacking it with `TaxDecorator` in different *orders*
   (`new TaxDecorator(new PercentOffDecorator(...), ...)` versus the
   reverse) produces genuinely different final prices. Explain in one
   sentence why order matters here.
3. `ReportGenerator`'s `formatRow` is called once per included product,
   inside the loop. Add an *optional* template step —
   a non-abstract `protected void afterReport()` method, doing nothing
   by default, called once after the loop — and override it in one
   report subclass to print a summary count, without touching the other
   subclass or `generate()` itself.

**Definition of done.**
- [ ] `Category` compiles as a real enum, and a `String` assigned where
      a `Category` is expected is rejected at compile time, confirmed
      with real output.
- [ ] `TaxDecorator` and `GiftWrapDecorator` both correctly stack on top
      of `RegularPricing`/`ClearancePricing` in multiple combinations,
      confirmed against the four real prices shown above.
- [ ] `ReportGenerator`'s two concrete subclasses produce genuinely
      different, correct reports from the same shared `generate()`
      method, confirmed against real output.
- [ ] You've triggered the real compile error from attempting to
      override `generate()`, and can explain why `final` on that
      specific method is what Template Method actually depends on.
- [ ] Commit with a message explaining why — e.g. `"Replace stringly-
      typed category with a real enum, add composable pricing
      decorators, and lock the report algorithm's shape with Template
      Method while leaving filtering and formatting open"` — not `"add
      enum, decorators, and reports"`.

**This closes Project 7, and Java's Phase.** Across Lessons 15–18:
static typing and checked exceptions caught real mistakes before
runtime that every earlier phase could only catch by triggering them;
Strategy, Builder, Repository, Decorator, and Template Method all
required real ceremony Python and JavaScript never asked for, and each
one paid for that ceremony with a compiler-enforced guarantee neither
earlier language's version ever actually had. **Phase 4** moves to C#
— compared directly against Java rather than re-taught from zero — where
properties, LINQ, and `async`/`await` (a genuine second look at Project
6's own async ideas, in a language with true native support for the
exact same pattern) take the ceremony this phase required and, in
several real places, remove it again.
