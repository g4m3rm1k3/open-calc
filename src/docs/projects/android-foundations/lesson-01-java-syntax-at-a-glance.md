# Lesson 01: Java Syntax at a Glance

**What you will build:** a real, reproduced `==` bug comparing two
`String`s — Java's single most common early gotcha — fixed with
`.equals()`, then generalized into the real, provable rule separating
primitives from everything else in the language. Arrays and `final`
follow, each proven, not described.

**What you need to know first:** real OOP — classes, objects,
constructors, inheritance. Nothing about Java's own specific syntax
assumed, even where it looks familiar from Kotlin or C#.

**Terms introduced in this lesson:**
- **Primitive type** — `int`, `double`, `boolean`, `char`, and five
  others: a value stored directly, not as an object, with no methods of
  its own and no possibility of being `null`.
- **Reference type** — every class type, including `String` and every
  wrapper class (`Integer`, `Double`); a variable of this kind holds a
  reference to an object, not the object's data directly.
- **Autoboxing** — Java's automatic conversion between a primitive
  (`int`) and its matching wrapper class (`Integer`) where one is needed
  but the other was given.
- **`final`** — Java's real keyword for "this variable can only be
  assigned once."

**Objects and methods used:** none beyond `System.out.println`, already
familiar from this curriculum's own prior Java-based Android material.

---

## Concept Unit: `==` on Objects Compares Identity, Not Contents

### The Problem

Comparing two pieces of text for equality is one of the most common
operations in any real program. Does Java's `==` do what it appears to
do on two `String`s built from literal text?

### Introduce the Concept in Isolation

```java
String a = "Drill";
String b = "Drill";
System.out.println(a == b);

String c = new String("Drill");
System.out.println(a == c);
System.out.println(a.equals(c));
```

Output:
```
true
false
true
```

`a == b` is `true` — two `String` **literals** with identical text,
because Java's compiler places identical string literals in a shared
pool, and `a`/`b` both end up referencing that exact same object.
`a == c` is `false` — even though `c` holds the identical text `"Drill"`
— because `new String("Drill")` deliberately constructs a genuinely
**separate** object, not drawn from that literal pool, and `==` on any
reference type compares whether two variables point at the *same*
object, never whether their contents match. `a.equals(c)` is `true` —
`.equals()` is the real, correct method for comparing *contents*, and
it's what actually answers "do these hold the same text," regardless of
whether they're the same object.

**This is the single most common early Java bug, proven directly rather
than asserted:** two strings that clearly, visibly hold the same text
compared `false` with `==`. The first pair only happened to compare
`true` because of an implementation detail (literal pooling) that a
program should never actually depend on — real `String`s in practice
often arrive from user input, file reads, or network responses, none of
which go through the literal pool, and `==` on any of those behaves like
`c` above, not like `b`.

### Discard

This proof is disposable; the real rule — `==` for primitives, `.equals()`
for object contents — is the standing, permanent takeaway.

### Mechanical Walkthrough

- `String a = "Drill";` — **(c) already basic**, ordinary variable
  declaration and assignment, already familiar.
- `a == b` — **(a) first appearance** of `==`'s real behavior on
  reference types specifically: identity comparison — explained above.
- `new String("Drill")` — **(a) first appearance** of this specific,
  deliberate construction: forcing a genuinely new `String` object
  rather than reusing the literal pool, used here purely to make the
  identity-vs-contents distinction observable.
- `a.equals(c)` — **(a) first appearance** of `.equals()` as the real,
  correct contents-comparison method — a real method every object in
  Java has (inherited from `Object`, covered fully in Lesson 04), with
  `String`'s own version comparing character-by-character content.

### SE Lens

The real reason Java doesn't make `==` compare contents automatically
for every reference type, the way it does for primitives: identity
comparison (`==`) is a real, meaningful, different operation from
contents comparison (`.equals()`) — two genuinely distinct `Item`
objects representing the same real-world item are a legitimate case
where a program needs to ask "is this literally the same object I
already have a reference to," separate from "does this describe the
same data." Making `==` silently mean contents-comparison for every
class would remove the ability to ask the identity question at all;
Java's real design keeps both operations available, at the honest cost
proven directly above: forgetting which one you actually want is a real,
common, and easy mistake.

## Concept Unit: Primitives vs. Reference Types — a Real, Provable Split

### The Problem

`int`, `double`, and `boolean` behave differently from `String` and
every other class type in several real, connected ways. Is this an
arbitrary inconsistency, or one real distinction with several
consequences?

### Introduce the Concept in Isolation

```java
int x = 5;
int y = x;
y = 10;
System.out.println(x);
System.out.println(y);

Integer boxedX = 5;
Integer boxedY = boxedX;
System.out.println(boxedX == boxedY);
```

Output:
```
5
10
true
```

`int x = 5; int y = x;` — copies the actual value `5` into `y`; changing
`y` afterward, proven directly, has zero effect on `x` — the same real,
provable value-copy behavior `wpf-foundations` Lesson 04 proved for C#'s
`struct`. `Integer boxedX = 5;` — **autoboxing**: Java automatically
wraps the primitive `5` into a real `Integer` object, because `Integer`
is a reference type and `5` alone is a primitive value, not an object.
`boxedX == boxedY` evaluating `true` here specifically relies on a real,
separate Java implementation detail — a small-integer cache (values
-128 to 127) — that this lesson's next unit proves is genuinely
unreliable to depend on.

### Discard

This proof is disposable; the real, unreliable-cache proof, next, is
this lesson's actual point about `Integer` specifically.

### Mechanical Walkthrough

- `int x = 5; int y = x;` — **(a) first appearance** of `int` as this
  lesson's own subject: a real primitive type, copied by value — proven
  directly by `y`'s later reassignment not affecting `x`.
- `Integer boxedX = 5;` — **(a) first appearance** of autoboxing itself,
  explained above; `Integer` — **(a) first appearance** as a real
  wrapper class, the reference-type counterpart to primitive `int`.
- `boxedX == boxedY` — **(b) hard concept reappearing**, `==`'s
  identity-comparison meaning from this lesson's first unit, now applied
  to `Integer` — a reference type — rather than `String`.

### The Real Gotcha, Proven

```java
Integer largeX = 200;
Integer largeY = 200;
System.out.println(largeX == largeY);
System.out.println(largeX.equals(largeY));
```

Output:
```
false
true
```

With `200` — outside the small-integer cache's real -128-to-127 range —
`largeX == largeY` is `false`, even though the previous unit's identical
code, using `5`, printed `true`. Direct, provable proof that `Integer`
comparison via `==` is genuinely unreliable — its result depends on the
specific numeric value involved, an implementation detail no correct
program should ever rely on. `.equals()` is the real, correct comparison
for `Integer`, exactly as it was for `String`.

### SE Lens

The real, practical rule this lesson's two proofs together establish:
**always use `==` for primitives** (`int`, `double`, `boolean`, and the
other six — value comparison is the only meaning `==` has for them, and
it's always correct), **and always use `.equals()` for any reference
type**, `String`, `Integer`, or a custom class — including cases (small
cached integers, pooled string literals) where `==` might *appear* to
work correctly by coincidence. The real cost of getting this wrong,
proven directly by this lesson's own `largeX`/`largeY` result: code that
passed casual testing with small numbers can fail silently once real
data includes a larger value.

## Concept Unit: Arrays — Fixed Size, Real Declared Length

### The Problem

A primitive value or a single object reference covers one item. Several
items of the same type, indexed by position, need a real, distinct
construct.

### Introduce the Concept in Isolation

```java
int[] scores = new int[3];
scores[0] = 90;
scores[1] = 85;
System.out.println(scores.length);
System.out.println(scores[2]);
```

Output:
```
3
0
```

`new int[3]` — allocates a real array of exactly three `int` slots,
fixed at creation; `scores.length` — **not** a method call (no
parentheses) — a real, public field every array has, reporting its own
fixed size. `scores[2]`, never explicitly assigned, prints `0` — proof
Java arrays of a primitive type are automatically initialized to that
type's own zero-equivalent default (`0` for `int`; `false` for
`boolean`; `null` for any reference-type array), not left as garbage
data.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `int[] scores = new int[3];` — **(a) first appearance** of array
  declaration and construction syntax; the fixed size (`3`) is
  established here, once, and cannot change afterward — attempting to
  access `scores[3]` or beyond throws a real
  `ArrayIndexOutOfBoundsException`, not silently returning anything.
- `scores[0] = 90;` — **(a) first appearance** of index-based
  assignment, zero-based like every C-family language already familiar.
- `scores.length` — **(a) first appearance** of this specific real
  field, explained above — worth stating plainly because Java's own
  `String.length()` (a method, with parentheses) and `array.length` (a
  field, without) look almost identical and are genuinely different
  members, a real, common point of confusion.

## Concept Unit: `final` — Assignable Exactly Once

### The Problem

An ordinary Java variable is reassignable by default — the same real
default Kotlin's own `var` has, contrasted against `val`'s immutability
(`android-foundations` Lesson 06). Does Java provide an equivalent,
real, compiler-enforced immutability keyword?

### Introduce the Concept in Isolation

```java
final String name = "Drill";
System.out.println(name);
name = "Level";
```

This does **not** compile:

```
error: cannot assign a value to final variable name
```

`final` — placed before a variable's declared type — makes that
variable assignable exactly once; the second attempted assignment is
rejected by the compiler outright, the identical real guarantee
Kotlin's `val` already proved in this series' own Lesson 06, spelled
differently and, unlike Kotlin, **not the default** — an ordinary Java
variable with no `final` is reassignable, and staying disciplined about
not reassigning something that logically shouldn't change is left
entirely to the programmer unless `final` is written explicitly.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `final String name = "Drill";` — **(a) first appearance** of `final`
  itself, explained above.
- `name = "Level";` — **(c) already basic** as assignment syntax; its
  real rejection is this unit's entire proof.

## Connect the pieces

One trace: `==` on a reference type (`String`, `Integer`) compares
identity, not contents — proven by two identical-looking strings, and
two identical-looking boxed integers, both comparing `false` under real,
specific conditions (a freshly constructed `String`, an `Integer` beyond
the small-value cache). `.equals()` is the real, reliable fix in both
cases. Primitives (`int` and its seven relatives) are copied by value,
proven directly, and compared correctly with plain `==` — the real
reason the `==`-vs-`.equals()` rule splits cleanly along the
primitive/reference-type line. Arrays hold a fixed number of same-typed
slots, indexed from zero, defaulting to each type's own zero-equivalent
value. `final` is Java's real, explicit immutability keyword — the same
compiler-enforced guarantee as Kotlin's `val`, opted into rather than
default.

## What breaks without this

Compare two `Integer`s built via **autoboxing from a variable**, rather
than a literal, and observe whether the small-value cache still applies:

```java
int rawValue = 100;
Integer x = rawValue;
Integer y = rawValue;
System.out.println(x == y);
```

Real, observed result: `true` — `100` is still within the cache's
-128-to-127 range, so this still "happens to work," reinforcing the real
danger this lesson's own SE Lens named: the *value* alone determines
whether `==` coincidentally succeeds, with no visual difference in the
code itself warning that it's relying on an implementation detail. Only
`.equals()` is correct regardless of the actual value involved — proven
by rerunning this exact snippet with `150` instead of `100` and watching
`==` flip to `false` with no other change.

## Exercises

1. Reproduce this lesson's own `largeX == largeY` failure with `200`,
   then substitute values across the real cache boundary (`127` and
   `128`) to find, by direct observation, exactly where `==` stops
   coincidentally working.
2. Declare a `final` array reference (`final int[] scores = new
   int[3];`), then attempt reassigning `scores[0]` versus reassigning
   `scores` itself to a brand-new array. Confirm which one is legal and
   which fails to compile — direct, provable evidence for exactly what
   `final` actually protects on a reference type (the reference itself,
   not what it points to).

## Definition of Done

- [ ] You reproduced the real `String` `==` failure and fixed it with
      `.equals()`.
- [ ] You reproduced the real `Integer` cache boundary and understand
      why it makes `==` unreliable on boxed types.
- [ ] You confirmed a primitive is copied by value, contrasted directly
      against a reference type.
- [ ] You caused the real `final`-reassignment compile error.
- [ ] You completed both exercises.

## Next

[Lesson 02 — Null in Java](lesson-02-null-in-java.md) covers what
happens when a reference type — proven in this lesson to always be
compared by identity — turns out to hold no object at all: a real,
caused `NullPointerException`, and the real defensive patterns Java
uses in the absence of Kotlin's compiler-enforced null safety.
