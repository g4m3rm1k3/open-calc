# Lesson 06: Kotlin Syntax at a Glance

**What you will build:** small, disposable proofs of Kotlin's core
statement-level syntax — `val` vs. `var`, type inference, string
templates — each checked against a real, provable behavior rather than
described from familiarity with Java or C#.

**What you need to know first:** real OOP from Java and/or C#
([`wpf-foundations`](../wpf-foundations/)) — classes, objects,
constructors. Nothing about Kotlin specifically.

**Terms introduced in this lesson:**
- **`val`** — declares an immutable reference: once assigned, it cannot
  be reassigned to a different object or value.
- **`var`** — declares a mutable reference, reassignable, the closer
  Kotlin analogue to an ordinary variable in Java or C#.
- **Type inference** — Kotlin infers a variable's concrete type from its
  initializer; the variable is still fixed to that one real type
  afterward, the same static-typing guarantee C#'s `var` (already proven
  in `wpf-foundations` Lesson 03) provides.
- **String template** — `"$name"` or `"${expr}"` embedded directly in a
  string literal, Kotlin's own version of string interpolation.

**Objects and methods used:** none beyond `println`, Kotlin's real
top-level function for writing a line to standard output.

---

## Concept Unit: `val` — Immutable by Default

### The Problem

Java and C# variables are reassignable by default, and staying
disciplined about *not* reassigning something that shouldn't change is
left entirely to the programmer, with no help from the compiler. Kotlin
flips this default — does it actually enforce immutability, or is `val`
just documentation?

### Introduce the Concept in Isolation

```kotlin
val name = "Drill"
println(name)
name = "Level"
```

This does **not** compile:

```
error: val cannot be reassigned
```

`val name = "Drill"` declares `name` as **immutable** — assignable
exactly once, at declaration. The second attempted assignment,
`name = "Level"`, is rejected by the compiler outright, not merely
discouraged by convention. This is a real, checked guarantee — proof,
not description.

### Discard

This two-line proof is disposable.

### Mechanical Walkthrough

- `val name = "Drill"` — **(a) first appearance.** `val` — explained
  above; no semicolon at the end of the line — **(a) first appearance**:
  Kotlin statements don't require a trailing `;` the way Java's and C#'s
  do (a semicolon is still legal, just unnecessary, when a single
  statement occupies its own line).
- `println(name)` — **(a) first appearance** of `println`, Kotlin's real
  top-level function (not a member of any class you construct — callable
  directly, unlike Java's `System.out.println` or C#'s
  `Console.WriteLine`) for writing a line to standard output.
- `name = "Level"` — **(c) already basic** as assignment syntax; its
  real *rejection* is this unit's entire proof.

## Concept Unit: `var` — Kotlin's Reassignable Variable

### The Problem

Not everything is naturally immutable — a running total, a loop counter.
Kotlin needs a real, distinct keyword for this case, since `val` was just
proven to reject it outright.

### Introduce the Concept in Isolation

```kotlin
var count = 0
println(count)
count = count + 1
println(count)
```

Output:
```
0
1
```

`var count = 0` declares a genuinely reassignable variable — `count =
count + 1` compiles and runs correctly, producing the real, incremented
value. This is the closer Kotlin analogue to an ordinary Java or C#
variable; `val`, from the previous unit, has no direct equivalent in
either language as a *default* — both require an explicit `final`
(Java) or `readonly`/`const` (C#) to get the same compiler-enforced
guarantee `val` gives for free, by being the more commonly reached-for
keyword.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `var count = 0` — **(a) first appearance** of `var` itself, explained
  above.
- `count = count + 1` — **(c) already basic**, ordinary arithmetic and
  reassignment; its success here, contrasted directly against the
  previous unit's real rejection, is the entire point.

## Concept Unit: Type Inference — Still Real Static Typing

### The Problem

`val name = "Drill"` looks, exactly the way C#'s `var` did before it was
proven otherwise (`wpf-foundations` Lesson 03), like it could mean
"whatever type, checked only at runtime." Whether Kotlin's inference is
static typing or something looser needs the same direct proof.

### Introduce the Concept in Isolation

```kotlin
val name = "Drill"
name = 5
```

This does **not** compile — and for a **different, additional** reason
than the previous `val`-reassignment failure:

```
error: val cannot be reassigned
error: type mismatch: inferred type is Int but String was expected
```

Kotlin reports **both** real errors: the reassignment violation already
proven, *and* a genuine type mismatch — `name`'s type was inferred as
`String` from its initializer, fixed from that point on, exactly the
same guarantee C#'s `var` already proved. Even a hypothetical `var name
= "Drill"` (reassignable, this lesson's second unit) would still reject
`name = 5` on the type-mismatch grounds alone — confirmed by trying it
directly, and observing only the type-mismatch error remains once `var`
replaces `val`.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `val name = "Drill"` — **(b) hard concept reappearing**, `val` from
  this lesson's first unit.
- `name = 5` — **(c) already basic** as assignment syntax; the real,
  layered failure it causes — both a `val` violation and a genuine type
  mismatch — is this unit's own proof, distinguishing "can't reassign at
  all" from "wouldn't be allowed to hold this type even if it could."

## Concept Unit: String Templates

### The Problem

Building a message from literal text and variable values needs a real,
readable syntax — the same problem C#'s string interpolation
(`wpf-foundations` Lesson 03) solved for that language. Does Kotlin have
an equivalent, and does it work identically?

### Introduce the Concept in Isolation

```kotlin
val name = "Drill"
val qty = 3

println("Item: $name, qty: $qty")
println("Item: ${name.uppercase()}, total: ${qty * 2}")
```

Output:
```
Item: Drill, qty: 3
Item: DRILL, total: 6
```

`"Item: $name, qty: $qty"` — a **string template**: `$name` inside a
string literal substitutes that variable's value directly, no leading
`$` before the opening quote required the way C#'s `$"..."` needs (every
Kotlin string literal is eligible for templating; `$` marks the
substitution point itself, not the whole string). `${name.uppercase()}`
— curly braces are required once the substituted content is more than a
bare variable name — here, a real method call (`.uppercase()`, Kotlin's
own case-conversion method) and an arithmetic expression
(`qty * 2`) — both evaluated as real Kotlin code, not text.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `"Item: $name, qty: $qty"` — **(a) first appearance** of the bare-`$`
  substitution form, explained above.
- `"${name.uppercase()}"` / `"${qty * 2}"` — **(a) first appearance** of
  the `${expr}` form, required for anything beyond a bare identifier;
  `.uppercase()` — **(a) first appearance**, a real Kotlin `String`
  method (Java's own `String` has `.toUpperCase()`; Kotlin renames
  several common `String` methods to lowerCamelCase without the
  `to`-prefix convention Java uses).

### CS Lens

String templates and C#'s string interpolation are the identical idea —
embedding expressions inside a string literal instead of concatenating
with `+` — solving the same real readability problem in both languages,
confirmed directly by this lesson's own side-by-side proof against
`wpf-foundations` Lesson 03's near-identical example.

## Connect the pieces

One trace: `val` is immutable by default, proven by a real, rejected
reassignment. `var` is Kotlin's reassignable counterpart, proven by a
real, successful increment. Both still infer a fixed, real, static type
from their initializer — proven by a genuine type-mismatch error
surviving even once the `val`-specific rejection is set aside. String
templates (`$name`, `${expr}`) are Kotlin's own syntax for the same
interpolation idea C#'s `$"..."` already proved, substituting real,
evaluated Kotlin expressions directly into a string literal.

## What breaks without this

Declare a `val` and never assign it a value at the point of declaration,
attempting to assign it later instead, exactly once:

```kotlin
val name: String
name = "Drill"
println(name)
```

This **does** compile and run correctly, printing `Drill` — a real,
provable exception to "assignable exactly once, at declaration": Kotlin
allows a `val` to be declared with an explicit type and no initializer,
then assigned exactly once, later, as long as the compiler can prove
every possible code path assigns it before it's ever read. Attempting a
*second* assignment after that first one, anywhere, reproduces the
original `val cannot be reassigned` failure exactly as before — proving
the real rule is "assigned exactly once, ever," not strictly "assigned
only at the declaration line itself."

## Exercises

1. Declare a `var` with an inferred type from an initial integer value,
   then attempt to reassign it to a `String` value. Confirm the real
   type-mismatch error, and confirm it's the *only* error (no
   reassignment violation, since `var` permits reassignment) — direct,
   provable contrast against this lesson's own `val` proof.
2. Write a string template mixing a `val` and a real conditional
   expression (`if (qty > 1) "items" else "item"`) inside a single
   `${}` block. Confirm the real, correct pluralization in the printed
   output.

## Definition of Done

- [ ] You caused the real `val cannot be reassigned` failure.
- [ ] You confirmed `var` permits reassignment where `val` rejects it.
- [ ] You caused the real type-mismatch failure, confirming inference
      produces a fixed, real type regardless of `val`/`var`.
- [ ] You confirmed string templates substitute real, evaluated
      expressions, not just bare variable names.
- [ ] You reproduced the deferred-`val`-assignment exception and
      understood the real rule it reveals.
- [ ] You completed both exercises.

## Next

[Lesson 07 — Kotlin Null Safety](lesson-07-kotlin-null-safety.md) covers
Kotlin's real, compiler-enforced answer to the exact null-reference bug
class C#'s nullable reference types (`wpf-foundations` Lesson 03)
already proved a different, closely related fix for.
