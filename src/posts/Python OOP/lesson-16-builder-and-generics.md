# Lesson 16: Too Many Constructors, and Collections With Enforced Shape
### (Project 7 — Inventory Management System, Java)

**What you will build.** `Product` grows real optional fields —
description, quantity — and gets a `Builder` to construct it cleanly
instead of one constructor trying to cover every combination. Then a
real `Inventory`, backed by Java's `HashMap` and `ArrayList`, both
carrying a declared element type the way `PricingStrategy` carried a
declared contract in Lesson 15. The transferable problems this lesson
is actually about: what happens to object construction once "optional
fields" stop being one or two, and what a *typed* collection actually
buys over a plain list or dictionary — proven with a real crash, not
just claimed.

**What you need to know first.** Lesson 15 — `Product`'s private
fields and getters, static typing caught at compile time, and
`PricingStrategy` as a real interface.

---

## Concept Unit: The Telescoping Constructor Problem

### The Problem

`Product` from Lesson 15 has two fields, both required. A real
inventory item needs more: a SKU (always required), a description
(often skipped), a starting quantity (sometimes zero, sometimes not).
Some combination of "some fields required, some optional, in no fixed
order" needs a real answer — and Java's most obvious tool, adding more
constructors, has a real, provable cost as the field count grows.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `TelescopingLab.java` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none beyond the JDK.

### The New Code

```java
public class TelescopingLab {
    public TelescopingLab(String name) {
        this(name, 0.0);
    }

    public TelescopingLab(String name, double price) {
        this(name, price, "");
    }

    public TelescopingLab(String name, double price, String sku) {
        System.out.println(name + " " + price + " " + sku);
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```java
public static void main(String[] args) {
    new TelescopingLab("Widget");
    new TelescopingLab("Widget", 9.99);
    new TelescopingLab("Widget", 9.99, "W-001");
}
```

Real output:

```
Widget 0.0 
Widget 9.99 
Widget 9.99 W-001
```

Three constructors, each calling the *next* one with a default value
filled in for whatever wasn't provided — `this(name, 0.0)` inside the
one-argument constructor calls the two-argument one directly. This
works, and it's a real, named shape: a **telescoping constructor**.
The problem it hides: with only three fields, three constructors were
already needed to cover every useful combination. `Product` needs five
fields (`name`, `price`, `sku`, `description`, `quantity`), and — the
real issue — what if a caller wants to skip `description` but *set*
`quantity`? Overloading can only add parameters from the *end*; there's
no telescoping constructor that skips a *middle* optional field without
a separate overload written specifically for that exact combination.
With enough optional fields, the number of constructors needed to cover
every useful combination grows fast, not gradually.

### Discard the throwaway example

`TelescopingLab` is deleted — it only existed to prove the pattern works
for a *few* fields and to name exactly where it stops scaling, isolated
from `Product` entirely.

### Mechanical walkthrough

- `public TelescopingLab(String name) { this(name, 0.0); }` — **(a)
  first appearance** of `this(...)` used as a *constructor call*, not a
  field reference: calling `this(...)` as the very first line of a
  constructor invokes a *different* constructor of the same class,
  passing along whatever values it decides — chaining constructors
  together instead of duplicating their bodies.

### CS lens

Nothing new beyond ordinary method overloading, already implicit in
having multiple constructors at all — worth naming plainly rather than
inventing a lens that isn't genuinely there yet; the real CS content
arrives in the next unit's actual fix.

### SE lens

The alternative to fixing this — just keep adding overloads as more
optional fields arrive — genuinely doesn't scale: five optional fields,
if every meaningful combination needed its own constructor, would mean
dozens of overloads, most differing only in which parameters got a
default. That's real, provable complexity, not a hypothetical concern —
the next unit's fix exists specifically because this one runs out of
room.

### Commands needed

`javac TelescopingLab.java && java TelescopingLab`, the same pattern as
Lesson 15.

### Run it

Shown above.

### Connecting sentence

Chaining constructors works, barely, for a handful of fields — the next
unit replaces the whole approach with something that scales to as many
optional fields as a real `Product` actually needs.

---

## Concept Unit: The Builder Pattern

### The Problem

What's actually needed: a way to set exactly the fields that matter,
by name, in any order, skipping the rest — with required fields still
genuinely required, not just optional-with-a-default standing in for
"forgot to set it."

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `PersonBuilderLab.java` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none beyond the JDK.

### The New Code

```java
class PersonBuilder {
    private Person person = new Person();

    public PersonBuilder setName(String name) {
        person.name = name;
        return this;
    }

    public PersonBuilder setAge(int age) {
        person.age = age;
        return this;
    }

    public PersonBuilder setEmail(String email) {
        person.email = email;
        return this;
    }

    public Person build() {
        return person;
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```java
Person p = new PersonBuilder()
    .setName("Ada")
    .setEmail("ada@example.com")
    .build();

System.out.println(p.name + " " + p.age + " " + p.email);
```

Real output:

```
Ada 0 ada@example.com
```

`setAge` was never called at all — `p.age` simply kept its default
value (`0`, `int`'s automatic default) — and nothing about that required
a special constructor overload for "name and email, no age." Each
`setX` method ends with `return this;`, handing back the *same* builder
object it was just called on, which is what makes `.setName(...).setEmail(...)`
chainable into one expression — this shape is called **method
chaining**, and a sequence of chained setters like this reads almost
like a small, dedicated sentence: "build a person, set the name, set
the email." `.build()` is the final step, handing back the actual
`Person` once every desired field has been set.

### Discard the throwaway example

`Person`/`PersonBuilder` are deleted — they only existed to prove
chained setters plus a final `build()` can construct an object with any
subset of its fields set, isolated from `Product` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `Product.java`; created
  `ProductBuilderDemo.java`.
- **Change type** — replace `Product`'s public constructor with a
  private one; add a nested `ProductBuilder` class.
- **Location** — inside `Product.java`.
- **Dependencies** — none new.

### The New Code

```java
    private Product(ProductBuilder builder) {
        this.name = builder.name;
        this.price = builder.price;
        this.sku = builder.sku;
        this.description = builder.description;
        this.quantity = builder.quantity;
    }

    public static class ProductBuilder {
        private String name;
        private double price;
        private String sku;
        private String description = "";
        private int quantity = 0;

        public ProductBuilder(String name, double price, String sku) {
            this.name = name;
            this.price = price;
            this.sku = sku;
        }

        public ProductBuilder setDescription(String description) {
            this.description = description;
            return this;
        }

        public ProductBuilder setQuantity(int quantity) {
            this.quantity = quantity;
            return this;
        }

        public Product build() {
            return new Product(this);
        }
    }
```

### The Updated Project

```java
public class Product {
    private String name;
    private double price;
    private String sku;                                    // ← new
    private String description;                             // ← new
    private int quantity;                                     // ← new

    private Product(ProductBuilder builder) {                  // ← changed
        this.name = builder.name;
        this.price = builder.price;
        this.sku = builder.sku;
        this.description = builder.description;
        this.quantity = builder.quantity;
    }

    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getSku() { return sku; }                      // ← new

    public double priceWith(PricingStrategy strategy) {
        return strategy.apply(price);
    }

    public String summary() {
        return name + " (" + sku + "): $" + price + " x" + quantity;  // ← changed
    }

    public static class ProductBuilder {                          // ← new
        private String name;
        private double price;
        private String sku;
        private String description = "";
        private int quantity = 0;

        public ProductBuilder(String name, double price, String sku) {
            this.name = name;
            this.price = price;
            this.sku = sku;
        }

        public ProductBuilder setDescription(String description) {
            this.description = description;
            return this;
        }

        public ProductBuilder setQuantity(int quantity) {
            this.quantity = quantity;
            return this;
        }

        public Product build() {
            return new Product(this);
        }
    }
}
```

`Product`'s own constructor is now `private` — nothing outside
`Product.java` can call `new Product(...)` directly at all; the *only*
path to a real `Product` is through `ProductBuilder`, whose own
constructor takes exactly the fields that should always be required
(`name`, `price`, `sku`), with everything else set optionally, by name,
through chained setters.

### Mechanical walkthrough

- `private Product(ProductBuilder builder) {` — **(a) first
  appearance**, conceptually: a `private` *constructor* — legal, and
  meaningfully different from a `private` field: this specific
  constructor can only be called from *inside* `Product` itself
  (including its nested `ProductBuilder`, covered next), never from any
  other class.
- `public static class ProductBuilder {` — **(a) first appearance** of
  a **nested class**: a class declared *inside* another class. `static`
  here means `ProductBuilder` doesn't need an existing `Product`
  instance to exist — it's constructed independently, as
  `new Product.ProductBuilder(...)`, before any `Product` exists at
  all.
- `private String description = "";` / `private int quantity = 0;`
  inside `ProductBuilder` — **(b) hard concept reappearing**: field
  initializers, same mechanism as Java's automatic `int` default proven
  in the isolated `Person` lab, here set explicitly rather than relied
  on implicitly.
- `public ProductBuilder(String name, double price, String sku) {` —
  **(b) hard concept reappearing**, an ordinary constructor — this one
  belongs to `ProductBuilder`, not `Product`, and is the *only* place
  the three genuinely required fields get enforced.
- `public ProductBuilder setDescription(String description) { this.description
  = description; return this; }` — **(b) hard concept reappearing**,
  the exact chained-setter shape proven in the isolated `PersonBuilder`
  lab.
- `public Product build() { return new Product(this); }` — **(a) first
  appearance**, specifically: `this` here refers to the `ProductBuilder`
  instance itself, passed directly into `Product`'s private constructor
  — which only compiles at all because that constructor lives inside
  the same outer class, `Product`, and nested classes are allowed to
  reach across to their enclosing class's private members.

### CS lens

This is the **Builder pattern**: separating *how an object is
constructed, step by step* from *what the object actually is* once
built — the exact distinction the Gang of Four's own original
description of the pattern makes. Also recognized in: `StringBuilder`
in Java's own standard library (appending pieces before producing a
final `String`), a SQL query builder library (chaining `.where(...)`,
`.orderBy(...)` before producing a final query string), any HTTP client
library's request builder (`.method(...)`, `.header(...)`, `.build()`).

### SE lens

The alternative — this lesson's own previous unit — genuinely doesn't
scale past a handful of fields; Builder costs one entire extra class
(here, nested inside `Product` specifically so it stays visibly tied to
the object it builds, rather than floating as an unrelated top-level
class) in exchange for arbitrary combinations of optional fields, set
by name, in any order, with zero additional constructors ever needed
again. The real guarantee, proven directly:

```java
Product p = new Product();
```

```
$ javac Product.java BadDirectConstruct.java
BadDirectConstruct.java:3: error: constructor Product in class Product cannot be applied to given types;
        Product p = new Product();
                    ^
  required: ProductBuilder
  found:    no arguments
  reason: actual and formal argument lists differ in length
1 error
```

The private constructor genuinely, compilably blocks any attempt to
build a `Product` outside of `ProductBuilder` — this isn't a convention
anyone has to remember to follow, it's enforced the same way Lesson 15's
type mismatches were.

### Commands needed

Same `javac`/`java` pattern as Lesson 15, now compiling `Product.java`
alongside whatever demo file uses it.

### Run it

```java
Product widget = new Product.ProductBuilder("Widget", 9.99, "W-001")
    .setQuantity(50)
    .build();

Product gadget = new Product.ProductBuilder("Gadget", 19.99, "G-002")
    .setDescription("A fancy gadget")
    .setQuantity(10)
    .build();

System.out.println(widget.summary());
System.out.println(gadget.summary());
```

```
Widget (W-001): $9.99 x50
Gadget (G-002): $19.99 x10
```

Two products, two genuinely different sets of optional fields set — one
skips `description` entirely, the other provides it — with no
constructor overload written for either specific combination.

### Connecting sentence

`Product` can now be built cleanly with any combination of optional
fields — the next unit turns to holding many of them at once, in
collections that carry the same compile-time guarantees this lesson has
been proving all along.

---

## Concept Unit: Generic Collections

### The Problem

An inventory needs to hold many `Product`s. Every prior project in this
curriculum reached for a plain list (Python) or array (JavaScript) for
exactly this job, with no restriction on what could go inside. Java has
`ArrayList`, its own growable list — but a list with no declared
element type has a real, provable danger: nothing stops the *wrong kind
of thing* from ending up inside it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `RawListLab.java` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `java.util.ArrayList`, part of the standard
  library.

### The New Code

```java
import java.util.ArrayList;

public class RawListLab {
    public static void main(String[] args) {
        ArrayList items = new ArrayList();
        items.add("a string");
        items.add(42);

        String first = (String) items.get(0);
        System.out.println(first);

        String second = (String) items.get(1);
        System.out.println(second);
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```
$ javac -Xlint:unchecked RawListLab.java
RawListLab.java:6: warning: [unchecked] unchecked call to add(E) as a member of the raw type ArrayList
        items.add("a string");
                 ^
RawListLab.java:7: warning: [unchecked] unchecked call to add(E) as a member of the raw type ArrayList
        items.add(42);
                 ^
2 warnings
```

It compiles — with warnings, not errors — and running it:

```
$ java RawListLab
a string
Exception in thread "main" java.lang.ClassCastException: class java.lang.Integer cannot be cast to class java.lang.String (java.lang.Integer and java.lang.String are in module java.base of loader 'bootstrap')
	at RawListLab.main(RawListLab.java:12)
```

A **raw type** `ArrayList` — declared with no `<...>` — happily accepted
*both* a `String` and an `Integer`, `42`, into the same list. The
program ran, printed the first item correctly, then crashed on the
second — `(String) items.get(1)` is a **cast**, telling Java "trust me,
this is a `String`," and Java, having no way to check that claim at
compile time for a raw list, only discovers the lie at runtime, as a
`ClassCastException`. This is exactly the kind of mistake Lesson 15
proved static typing catches *early* — except here, a raw collection
quietly opted back out of that guarantee.

### Discard the throwaway example

`RawListLab` is deleted — it only existed to prove a raw collection's
real, runtime-only danger, isolated from `Inventory` entirely.

### Project Change (the fix, still isolated)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `GenericListLab.java`,
  `GenericListBad.java` (both throwaway, this unit only).
- **Change type** — add.
- **Location** — new files.
- **Dependencies** — none new.

### The New Code

```java
ArrayList<String> items = new ArrayList<String>();
items.add("a string");

String first = items.get(0);
System.out.println(first);
```

Real output:

```
a string
```

No cast needed this time — `items.get(0)` already returns a `String`,
because `ArrayList<String>` declared, once, that this list only ever
holds `String`s. Now, attempting the exact mistake from the raw-type
version:

```java
ArrayList<String> items = new ArrayList<String>();
items.add("a string");
items.add(42);
```

```
$ javac GenericListBad.java
GenericListBad.java:7: error: incompatible types: int cannot be converted to String
        items.add(42);
                  ^
1 error
```

The identical mistake that crashed at *runtime* in the raw-type version
is now rejected at *compile time* — the program never runs at all. This
is called a **generic type**: `<String>` is a **type parameter**,
declaring, once, at the point the collection is created, exactly what
type it's allowed to hold — checked by the compiler at every `.add()`
and every `.get()` call from then on.

### Discard the throwaway example

`GenericListLab`/`GenericListBad` are deleted — they only existed to
prove generics move the raw-type crash from runtime to compile time,
isolated from `Product`/`Inventory` entirely.

### CS lens

This is **parametric polymorphism** — a single collection class,
`ArrayList`, written once, usable safely with *any* element type, by
parameterizing it with that type at the point of use, rather than
writing a separate list class per type (a `StringArrayList`, an
`IntArrayList`, and so on). Also recognized in: C++ templates and C#
generics (both coming later in this curriculum, genuinely similar
ideas), TypeScript's own generic types layered onto JavaScript, Python's
`list[str]` type hints — checked only by external tools, never enforced
by Python itself, unlike Java's compiler-enforced version.

### SE lens

Nothing about *runtime* behavior differs between a raw `ArrayList` and
a generic `ArrayList<String>` holding only correctly-typed items — the
entire benefit is when the *compiler* catches a mistake instead of the
*program* crashing on a specific, possibly rare, input later. That's a
strict improvement with essentially no real cost once `<...>` is
written — which is exactly why modern Java code almost never uses raw
types at all; `RawListLab`'s own compiler warnings were Java itself
flagging that this code was opting out of a protection it should
almost always keep.

### Commands needed

Same `javac`/`java` pattern.

### Run it

Shown above.

### Connecting sentence

A typed list catches the wrong kind of item before the program runs —
the next, final unit applies the same guarantee to a key-value
collection, and builds the real `Inventory` this whole project has been
building toward.

---

## Concept Unit: A Typed `Inventory`

### The Problem

Project 3, Phase 1, Lesson 9 built a hash index — a `dict` mapping id to
user — specifically to make lookup fast without scanning. Project 7
needs exactly that same idea, for products keyed by SKU, and Java's
own version of a dict needs the same generic-type treatment this unit
just proved matters.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `Inventory.java`.
- **Change type** — add.
- **Location** — new file, alongside `Product.java`.
- **Dependencies** — `java.util.HashMap`, `java.util.ArrayList`.

### The New Code

```java
import java.util.HashMap;
import java.util.ArrayList;

public class Inventory {
    private HashMap<String, Product> productsBySku = new HashMap<String, Product>();

    public void add(Product product) {
        productsBySku.put(product.getSku(), product);
    }

    public Product findBySku(String sku) {
        return productsBySku.get(sku);
    }

    public ArrayList<Product> all() {
        return new ArrayList<Product>(productsBySku.values());
    }
}
```

### The Updated Project

Brand-new file, shown whole above.

### Mechanical walkthrough

- `private HashMap<String, Product> productsBySku = new HashMap<String, Product>();`
  — **(a) first appearance** of a generic type with *two* type
  parameters: `<String, Product>` declares this `HashMap`'s keys are
  always `String`s and its values are always `Product`s — the direct
  Java counterpart to Project 3's `self._by_id = {}` and Lesson 13's
  `Map`, now with both sides of every entry compiler-checked.
- `public void add(Product product) { productsBySku.put(product.getSku(), product); }`
  — **(a) first appearance** of `.put()`: `HashMap`'s method for
  storing a key-value pair — the counterpart to Python's `dict[key] =
  value` or JavaScript's `map.set(key, value)`.
- `public Product findBySku(String sku) { return productsBySku.get(sku); }`
  — **(b) hard concept reappearing**: `.get()` — the same method name
  JavaScript's `Map` used in Project 5, and functionally the same idea
  as Project 3's `self._by_id.get(user_id)` — returning `null` (Java's
  "no value," the direct counterpart to Python's `None` and
  JavaScript's `undefined`) if the key isn't present, rather than
  raising an error.
- `public ArrayList<Product> all() { return new ArrayList<Product>(productsBySku.values()); }`
  — **(a) first appearance** of `.values()`: returns every value
  currently stored in the map, with no guarantee about *order* — proven
  directly below — wrapped in `new ArrayList<Product>(...)` to hand back
  a real, typed list rather than `HashMap`'s own internal view of its
  values.

### CS lens

Nothing new beyond what Project 3, Lesson 9 already covered for hash
indexes in general — `HashMap` *is* that same idea, generic-typed. Worth
naming precisely instead: unlike Python's `dict` (insertion-ordered
since Python 3.7) and JavaScript's `Map` (always insertion-ordered,
proven directly in Project 5, Lesson 13), Java's `HashMap` makes **no
ordering guarantee at all** — proven directly below, not asserted.

### SE lens

`ArrayList<Product>` and `HashMap<String, Product>` both cost the same
small ceremony as every generic type in this lesson — declaring the
element type once, up front — in exchange for the exact same compile-time
safety proven earlier: nothing but a `Product` can ever be added to
`productsBySku`'s values, checked by the compiler, not discovered by a
crash later.

### Commands needed

Same pattern.

### Run it

```java
Inventory inventory = new Inventory();

inventory.add(new Product.ProductBuilder("Widget", 9.99, "W-001")
    .setQuantity(50)
    .build());
inventory.add(new Product.ProductBuilder("Gadget", 19.99, "G-002")
    .setQuantity(10)
    .build());

Product found = inventory.findBySku("G-002");
System.out.println("Found: " + found.summary());

Product missing = inventory.findBySku("Z-999");
System.out.println("Missing lookup returns: " + missing);

System.out.println("All products:");
for (Product p : inventory.all()) {
    System.out.println("  " + p.summary());
}
```

Real output:

```
Found: Gadget (G-002): $19.99 x10
Missing lookup returns: null
All products:
  Gadget (G-002): $19.99 x10
  Widget (W-001): $9.99 x50
```

Two real details worth stopping on, both proven by this exact output,
not described in the abstract: `findBySku("Z-999")` returns `null`
cleanly — no crash, the same safe-miss behavior Project 3's `.get()`
and Lesson 13's `Map.get()` both had. And **"Widget" was added first,
but "Gadget" printed first** in `all()` — real, live proof of this
unit's own CS lens: `HashMap` genuinely does not preserve insertion
order, unlike every dict-like structure used anywhere earlier in this
curriculum. Code that depends on iteration order here would be relying
on something Java explicitly does not promise.

### Connecting sentence

Every guarantee this lesson has built — a builder that can't be
bypassed, a list that can't hold the wrong type, a map that can't either
— now backs one real, working `Inventory`, and one genuinely
language-specific surprise (no ordering guarantee) got caught by
actually running the code, exactly the way this curriculum has insisted
on since Lesson 1.

---

## Closing

**Connect the pieces.** One product, through the whole lesson:
`new Product.ProductBuilder("Gadget", 19.99, "G-002").setQuantity(10).build()`
constructs a `Product` through the only path Lesson 15's private
constructor now allows; `inventory.add(...)` calls `product.getSku()`
and stores it in `productsBySku`, a `HashMap<String, Product>` that
would refuse, at compile time, to accept anything but a real `Product`
as that value; `inventory.findBySku("G-002")` retrieves it back,
type-checked the whole way, with no cast required anywhere — the same
protection Lesson 15 proved for a simple `int`, now covering an entire
object graph: builder, list, and map, together.

**What breaks without this.** Already shown three times in this
lesson's own units — the raw-list `ClassCastException`, the blocked
direct-construction attempt, and the compile-time rejection of a
mismatched generic type — each one deliberately left where it happened,
inside the unit that needed it, rather than staged separately here.

**Exercises.**
1. Add a `removeBySku(String sku)` method to `Inventory`, using
   `HashMap`'s own `.remove(key)`.
2. `Inventory.all()`'s lack of guaranteed order was proven, not assumed.
   Add a method `allSortedBySku()` returning products in a predictable
   order — look up `Collections.sort` combined with a `Comparator`
   (Lesson 15's own CS lens already named `Comparator` as Java's
   Strategy-shaped sorting tool).
3. Try declaring `Inventory`'s map as a raw `HashMap` (no `<...>`)
   instead, deliberately reintroduce this lesson's own raw-type mistake
   by adding a `String` where a `Product` belongs, and confirm — with a
   real crash — that the exact failure from this lesson's third unit
   reappears in project code, not just an isolated lab.

**Definition of done.**
- [ ] `Product` can only be constructed through `ProductBuilder`,
      confirmed by a real compile error when attempting `new Product()`
      directly.
- [ ] `ProductBuilder` correctly builds products with different subsets
      of optional fields set, confirmed against real output.
- [ ] You've triggered the real raw-type `ClassCastException`, then
      confirmed the identical mistake becomes a compile-time error once
      generics are used instead.
- [ ] `Inventory`, backed by `HashMap<String, Product>` and
      `ArrayList<Product>`, correctly adds, finds, and lists products —
      and you've confirmed, with real output, that `HashMap` does not
      preserve insertion order.
- [ ] Commit with a message explaining why — e.g. `"Replace Product's
      growing constructor with a Builder, and back Inventory with
      generic collections so the wrong type is caught at compile time
      instead of crashing at runtime"` — not `"add builder and
      inventory"`.

**Next lesson** stays in Project 7: the `Repository` pattern, rebuilt
in Java on top of this lesson's own `Inventory`, and a first look at
Java's checked exceptions — a real, compiler-enforced requirement to
handle certain failures explicitly, with no Python or JavaScript
equivalent anywhere in this curriculum so far.
