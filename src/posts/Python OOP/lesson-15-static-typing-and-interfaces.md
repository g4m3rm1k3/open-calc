# Lesson 15: Caught Before It Runs, and a Contract Instead of a Function
### (Project 7 — Inventory Management System, Java)

**What you will build.** A `Product` class with typed fields, and the
`Strategy` pattern rebuilt for real — not as "pass a function," the way
Project 1, Lesson 3 built it in Python and Project 5 echoed it in
JavaScript, but as a real `interface` with real implementing classes,
because Java simply doesn't let a bare function stand in for one. The
transferable problems this lesson is actually about: catching a whole
category of mistakes *before* a program ever runs, rather than while
it's running, and what a language actually requires when it can't treat
functions as ordinary values the way Python and JavaScript both could.

**What you need to know first.** Project 1, Lesson 3 — where Strategy
first appeared, as a dictionary of plain functions. Project 5, Lesson 12
— the exact same pattern, still just functions, in JavaScript. This
lesson is the direct payoff of both: the same idea, in a language that
won't let it stay that simple.

---

## Concept Unit: Static Typing, Caught at Compile Time

### The Problem

Every mistake caught so far in this curriculum — a typo'd method name in
Python (Lesson 4), a missing key in a JavaScript object (Project 3,
Lesson 9's Python version; Lesson 14's own `fetch`) — was caught while
the program was *running*, by actually hitting the broken line. Python
and JavaScript are both **dynamically typed**: a variable can hold
anything, and the language only checks whether an operation makes sense
at the exact moment it's attempted. Java works differently, and this
unit's whole point is seeing that difference happen, not just reading
about it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `PointLab.java` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — a JDK (Java Development Kit) — `javac`, the
  compiler, and `java`, the runtime — installed and on the system path.

### The New Code

```java
public class PointLab {
    public static void main(String[] args) {
        int x = 3;
        int y = 4;
        System.out.println(x + y);
    }
}
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

```
$ javac PointLab.java
$ java PointLab
7
```

Two separate commands, and two separate real steps: `javac` reads
`PointLab.java` and produces `PointLab.class` — compiled bytecode, not
yet run — and only `java PointLab` actually executes it. Nothing in
Python or JavaScript, across fourteen prior lessons, ever had this
separation: `python3 file.py` and `node file.js` both parse *and* run in
one step. Now, the actual payoff — a deliberate mistake:

```java
public class TypeErrorLab {
    public static void main(String[] args) {
        int x = 3;
        String y = "four";
        System.out.println(x + y);
        int z = y;
    }
}
```

```
$ javac TypeErrorLab.java
TypeErrorLab.java:6: error: incompatible types: String cannot be converted to int
        int z = y;
                ^
1 error
```

This program never ran at all — `javac` refused to even produce a
`.class` file. Notice, precisely, what *did* and *didn't* fail: `x + y`
(an `int` plus a `String`) compiles and runs completely fine — Java
defines `+` between a number and a `String` as concatenation, proven
directly:

```
$ javac ConcatCheck.java && java ConcatCheck
3four
```

Only `int z = y;` — trying to store a `String` value in a variable
explicitly declared to hold an `int` — is the actual error. This is
called **static typing**: every variable's type is fixed, declared up
front (`int x`, `String y`), and checked by the compiler against every
place that variable is used, before the program is ever allowed to run
— catching an entire category of mistakes that Python or JavaScript
would only catch, if at all, by actually executing the broken line.

### Discard the throwaway example

`PointLab`/`TypeErrorLab`/`ConcatCheck` are all deleted — they only
existed to prove the compile-then-run separation and exactly which
kinds of type mismatches Java's compiler catches, isolated from
`Product` entirely.

### Mechanical walkthrough

- `public class PointLab {` — **(a) first appearance** of `public`: an
  **access modifier**, marking this class as usable from outside its own
  file — a concept with no real equivalent yet in this curriculum
  (Python and JavaScript's own privacy conventions were softer, never
  enforced by the language itself); more on this once it actually
  matters, later in this project.
- `public static void main(String[] args) {` — **(a) first appearance**
  of Java's required entry point: unlike Python's `if __name__ ==
  "__main__":` (a convention) or a JavaScript file just running
  top-to-bottom, Java requires *exactly* this method signature,
  named `main`, for `java ClassName` to know where to start.
- `int x = 3;` — **(a) first appearance** of an explicit type
  declaration: `int` names the type *before* the variable name, fixed
  for the variable's entire lifetime — contrast with Python's `x = 3` or
  JavaScript's `let x = 3`, neither of which ever states a type at all.
- `System.out.println(x + y);` — **(a) first appearance** of Java's
  standard output call: `System.out` is Java's counterpart to Python's
  implicit `print` target or JavaScript's `console`; `println` adds a
  newline, the same default behavior as both.

### CS lens

This is the real distinction between **static** and **dynamic**
typing: static typing checks types once, at compile time, across the
entire program at once; dynamic typing checks types continuously, at
runtime, only for the exact code path actually executed. Also
recognized in: TypeScript layered on top of JavaScript (adding exactly
this kind of check back in, optionally), C# and C++ (both statically
typed, coming later in this curriculum), Python's own optional type
hints (checked by external tools like `mypy`, never by Python itself at
runtime).

### SE lens

The real tradeoff, worth stating honestly rather than declaring one
approach simply better: static typing catches real mistakes earlier,
proven directly above — but it costs real ceremony, every variable's
type spelled out, every function's parameter and return types declared,
none of which Python or JavaScript ever required. Dynamic typing let
Phase 1 and Phase 2 move faster, with less upfront declaration, at the
cost of some mistakes only surfacing when a specific line actually runs
— which is precisely why this curriculum's Python and JavaScript
lessons leaned so heavily on *running things and reading real output* to
catch problems: that was often the only way to find them. Static typing
shifts real work earlier, onto the compiler, before a single line
executes.

### Commands needed

`javac <file>.java` compiles one or more `.java` source files into
`.class` bytecode files, one per class, in the same directory.
`java <ClassName>` — note: no `.java` or `.class` extension — runs the
compiled class, looking for its `main` method.

### Run it

Shown above — both the successful compile-and-run, and the compile-time
failure.

### Connecting sentence

Types are checked before anything runs at all — the next unit puts a
real project's own data behind exactly this guarantee.

---

## Concept Unit: A Typed `Product`

### The Problem

Project 7 needs its own core object — a `Product`, the Inventory
Management System's equivalent of `Note`, `Task`, and `Card` — and,
per this lesson's own first unit, every one of its fields needs a
declared, enforced type.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `Product.java`.
- **Change type** — add.
- **Location** — new file, alongside this project's other source files.
- **Dependencies** — none beyond the JDK.

### The New Code

```java
public class Product {
    private String name;
    private double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public String summary() {
        return name + ": $" + price;
    }
}
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

No separate lab needed — every piece here is either a direct
consequence of the previous unit (typed fields, a typed constructor) or
a genuinely new piece explained directly below, since a contrived
example would just be this same shape with different field names.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `private String name;` / `private double price;` — **(a) first
  appearance** of `private`, the access modifier's other common value:
  unlike `public`, `private` means *only code inside this exact class*
  can read or write this field directly — not even a subclass, and
  never code outside `Product` entirely. This is enforced by the
  compiler, not by convention — a real, checked guarantee Python and
  JavaScript's own naming conventions (like Project 3's `_by_id`) never
  actually had.
- `public Product(String name, double price) {` — **(b) hard concept
  reappearing**: a constructor, same role as `__init__`/`constructor`
  from Phase 1 and 2, now with every parameter's type declared
  explicitly.
- `this.name = name; this.price = price;` — **(b) hard concept
  reappearing**, the same `this`-based attribute assignment from
  JavaScript, syntactically closer to Python's `self` (an explicit
  keyword, not implicit) but functioning the same way.
- `public String getName() { return name; }` — **(a) first appearance**
  of a **getter**: because `name` is `private`, nothing outside
  `Product` can read `product.name` directly the way Python or
  JavaScript code freely read `note.title` in earlier projects — a
  public method has to be written specifically to expose it, on
  purpose, one field at a time.
- `public double getPrice() { return price; }` — **(c) already basic**,
  the same getter shape.
- `public String summary() { return name + ": $" + price; }` — **(b)
  hard concept reappearing**: string concatenation with `+`, proven
  safe for `double` and `String` together in the previous unit's
  `ConcatCheck` — the direct Java counterpart to an f-string or template
  literal, without either language's dedicated interpolation syntax.

### CS lens

`private` fields plus `public` getters together are **encapsulation**,
enforced — the same core idea named informally back in Project 1,
Lesson 1, now backed by a real, compiler-checked guarantee instead of
just a naming convention. Also recognized in: any language with real
access control (C#, C++, both later in this curriculum), a bank
account's balance being unreadable except through an official statement
or app, never a shared spreadsheet cell.

### SE lens

The alternative — public fields, `product.name` readable and *writable*
directly from anywhere, the way every Python and JavaScript project in
this curriculum has worked so far — is genuinely simpler to write. The
real cost of exposing fields directly: any code anywhere could set
`product.price = -50` with zero validation, zero warning, and Project 3,
Lesson 9's whole validation lesson would have nowhere to live. Private
fields plus getters cost boilerplate — one method per field that needs
exposing — in exchange for a single, enforced point of control over how
a `Product`'s data can be read, and, later in this project, changed.

### Commands needed

`javac Product.java ProductDemo.java` — compiling more than one source
file in a single call, since `ProductDemo` depends on `Product`.

### Run it

```java
public class ProductDemo {
    public static void main(String[] args) {
        Product p = new Product("Widget", 9.99);
        System.out.println(p.summary());
    }
}
```

```
Widget: $9.99
```

And, proving the previous unit's guarantee extends to constructor
arguments, not just plain variable declarations:

```java
Product p = new Product("Widget", "nine ninety nine");
```

```
$ javac Product.java BadProductDemo.java
BadProductDemo.java:3: error: incompatible types: String cannot be converted to double
        Product p = new Product("Widget", "nine ninety nine");
                                          ^
1 error
```

Passing a `String` where `Product`'s own constructor declared `double
price` fails to compile — the exact same guarantee from this lesson's
first unit, now protecting a real project class's own contract.

### Connecting sentence

`Product` now has real, enforced structure — the next unit is where
this lesson's actual promise lands: giving `Product` swappable pricing
behavior, the way Strategy did back in Python and JavaScript, in a
language that won't let a bare function do the job.

---

## Concept Unit: Strategy, With a Real Interface

### The Problem

Project 1, Lesson 3 built Strategy as `SORT_STRATEGIES`, a dictionary
of plain functions, picked by name. Project 5, Lesson 12 didn't even
need that lesson — JavaScript functions are values too, the same shape
worked directly. Java has no equivalent move available: a bare method
can't be handed around and stored in a variable the way a Python or
JavaScript function can. Something else has to define *what shape* a
piece of swappable behavior is allowed to have, before any actual
behavior can be written.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `PricingStrategy.java`,
  `RegularPricing.java`, `ClearancePricing.java`.
- **Change type** — add.
- **Location** — new files, alongside `Product.java`.
- **Dependencies** — none beyond the JDK.

### The New Code

```java
public interface PricingStrategy {
    double apply(double price);
}
```

```java
public class RegularPricing implements PricingStrategy {
    public double apply(double price) {
        return price;
    }
}

public class ClearancePricing implements PricingStrategy {
    public double apply(double price) {
        return price * 0.5;
    }
}
```

### The Updated Project

Three brand-new files, shown whole above — `PricingStrategy` declares
the *shape* a pricing behavior must have; `RegularPricing` and
`ClearancePricing` are two separate, real classes, each providing a
genuinely different `apply` method matching that exact shape.

### Introduce the concept in isolation

No separate throwaway lab needed — `PricingStrategy` itself, at three
lines, already *is* the smallest possible version of this idea; a
contrived example would be identically shaped with different names, and
this project's own real pricing concept is clearer than an invented
substitute would be.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `public interface PricingStrategy {` — **(a) first appearance** of
  `interface`: not a class — it can never be instantiated directly with
  `new` — it's a **contract**, declaring *what methods* something must
  have, with no bodies, no actual behavior, at all.
- `double apply(double price);` — **(a) first appearance** of an
  **abstract method**: no `{ }` body, just a signature ending in `;` —
  this line says "anything claiming to be a `PricingStrategy` must
  provide a method exactly matching this shape," and nothing about
  *how*.
- `public class RegularPricing implements PricingStrategy {` — **(a)
  first appearance** of `implements`: a class declaring that it fulfills
  a specific interface's contract — the compiler will refuse to compile
  `RegularPricing` at all if it doesn't provide every method
  `PricingStrategy` declares, with a matching signature.
- `public double apply(double price) { return price; }` — **(b) hard
  concept reappearing**, an ordinary method, this one specifically
  fulfilling the interface's required shape.

### CS lens

This is Strategy, built the way Java requires: the interface *is* the
contract Project 1, Lesson 3's dictionary keys implicitly represented —
"something callable with this shape" — made explicit and enforced by
the compiler instead of just assumed by convention. Also recognized in:
`Comparator` in Java's own standard library (an interface with one
method, `compare`, exactly this shape, used to customize sorting — the
direct Java counterpart to Python's `sorted(..., key=...)`), C#'s
`IComparable` (coming later in this curriculum, same idea again),
any plugin system requiring implementers to satisfy a declared interface
before being accepted.

### SE lens

The real cost, worth being honest about rather than glossing past:
three files and roughly a dozen lines were needed here for behavior
that took one line in Python (`def by_title(note): return note.title`)
and even less in JavaScript. That's not this lesson doing something
wrong — it's the real, measurable ceremony static typing requires for
this specific pattern, exactly what was promised back in Project 1,
Lesson 3's own SE lens. What's gained: `PricingStrategy` being an
`interface` means the compiler itself guarantees every implementation
provides a working `apply` method with the right signature — passing
something that *doesn't* implement it is caught before the program
runs, proven directly below, the same guarantee this lesson's first
unit already established for simple types, now extended to behavior
itself.

Worth naming too: Java isn't stuck at this level of ceremony forever.
Since `PricingStrategy` has exactly one abstract method, it qualifies as
a **functional interface**, and Java allows a **lambda expression** —
`price -> price * 0.7`, shown directly below — as a shorthand for
writing a whole new class just to implement it once. The interface
still had to be declared; the lambda is a genuine convenience on top of
it, not a way around needing it in the first place.

### Commands needed

`javac PricingStrategy.java RegularPricing.java ClearancePricing.java
Product.java StrategyDemo.java` — every file the demo depends on,
compiled together.

### Run it

```java
public class StrategyDemo {
    public static void main(String[] args) {
        Product widget = new Product("Widget", 20.00);

        PricingStrategy regular = new RegularPricing();
        PricingStrategy clearance = new ClearancePricing();

        System.out.println("Regular price: $" + widget.priceWith(regular));
        System.out.println("Clearance price: $" + widget.priceWith(clearance));

        PricingStrategy blackFriday = price -> price * 0.3;
        System.out.println("Black Friday price: $" + widget.priceWith(blackFriday));
    }
}
```

(with `Product` gaining one small addition to make this possible:
`public double priceWith(PricingStrategy strategy) { return
strategy.apply(price); }` — the direct Java counterpart to Python's
`sorted(notes, key=strategy)`, calling whatever `apply` implementation
was actually handed in.)

Real output:

```
Regular price: $20.0
Clearance price: $10.0
Black Friday price: $6.0
```

Three completely different pricing behaviors, applied to the same
`Product`, through the same `priceWith` method — two via real classes,
one via a lambda — none of which required `Product` or `priceWith` to
change at all. And, proving the compile-time guarantee genuinely holds:

```java
String notAStrategy = "50% off";
widget.priceWith(notAStrategy);
```

```
$ javac Product.java BadStrategyDemo.java
BadStrategyDemo.java:5: error: incompatible types: String cannot be converted to PricingStrategy
        System.out.println(widget.priceWith(notAStrategy));
                                            ^
1 error
```

A `String` that isn't a `PricingStrategy` is rejected before the program
ever runs — the exact same category of protection this lesson's first
unit proved for `int`/`String`, now protecting a whole *behavior*, not
just a value.

### Connecting sentence

The same Strategy idea from Project 1 and Project 5 now works in Java —
requiring a real, declared contract first, exactly as promised, and
rewarding that ceremony with a guarantee neither earlier language's
version ever actually had: the compiler itself refusing anything that
doesn't genuinely fit.

---

## Closing

**Connect the pieces.** One price, through the whole lesson: `Product`
holds `price` as a `private double`, unreachable directly from outside
the class — the guarantee this lesson's second unit built. `widget.priceWith(clearance)`
calls `ClearancePricing`'s `apply(double price)`, which only compiles at
all because `ClearancePricing implements PricingStrategy`, satisfying
the exact contract that interface declared — the guarantee this
lesson's third unit built. And every one of those connections was
checked by `javac`, once, before `java StrategyDemo` ever ran a single
line — the guarantee this lesson's first unit proved, underneath both
of the others.

**What breaks without this.** Already shown twice, directly, in this
lesson's own units — the `String`-into-`double` constructor error, and
the `String`-instead-of-`PricingStrategy` error — deliberately not
repeated a third time here, since the entire point of both was seeing
them happen inside real, working project code, not a contrived example
manufactured just to fail.

**Exercises.**
1. Add a `BulkPricing` class implementing `PricingStrategy`, applying a
   flat discount only when a quantity parameter (you'll need to change
   `apply`'s signature, and every implementation, to accept one) is
   above some threshold.
2. Try writing `PricingStrategy` as an **abstract class** instead of an
   `interface` (Java has both) — look up the difference, and write one
   sentence on why `interface` was the right choice here specifically.
3. Deliberately remove the `public` keyword from `RegularPricing`'s
   `apply` method (leaving it with no access modifier — Java's default,
   "package-private"), attempt to compile `StrategyDemo` from a
   different package, and observe — with a real error — why the
   `interface`'s own methods need to stay `public` to actually be
   usable from outside.

**Definition of done.**
- [ ] `Product` compiles and runs, with `private` fields only reachable
      through real `public` getters, confirmed against real output.
- [ ] `PricingStrategy` and at least two implementing classes compile
      and produce correct, different prices for the same `Product`,
      confirmed against real output — including a lambda expression
      working as a third, shorthand implementation.
- [ ] You've triggered two real compile-time errors — a type mismatch
      on a plain variable, and a type mismatch on an interface — read
      both error messages, and understand exactly what each one is
      protecting.
- [ ] You can state, in one sentence, why Java's version of Strategy
      needs an `interface` at all when Python's and JavaScript's
      versions of the exact same pattern never did.
- [ ] Commit with a message explaining why — e.g. `"Rebuild Strategy as
      a real interface since Java can't pass bare functions, trading
      ceremony for a compiler-enforced contract"` — not `"add pricing
      strategies"`.

**Next lesson** stays in Project 7: `Builder`, once `Product` needs
enough optional fields that one constructor stops being a good fit, and
a first look at why Java's collections (`ArrayList`, `HashMap`) look
different from the plain arrays and objects Phase 1 and 2 used for the
same jobs.
