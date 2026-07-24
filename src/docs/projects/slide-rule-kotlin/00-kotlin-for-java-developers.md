# Lesson 0: Kotlin for Java Developers

**Developer Story**
> As a developer who already knows Java from `../track/`, I want to see
> exactly what Kotlin does differently so I can read and write it
> confidently before touching Compose.

**What you will build**
Nothing in the Slide Rule app yet — this lesson is a translation guide, not
a feature. Every construct here is taught as a direct diff against Java you
already know, verified by actually running both versions side by side, not
described in the abstract. By the end you'll have Kotlin installed and a
one-line "Hello World" run from the command line, ready for Lesson 1's first
Compose project.

**What you need to know first**
All 34 lessons of `../track/`. This lesson assumes real, working Java
knowledge — classes, methods, `if`/`for`, `String`, `Object.equals()` — and
never re-explains any of it. It only explains what's *different*.

---

## Concept Unit: `val` and `var` Replace Java's Default-Mutable Local

### The Problem

In Java, a local variable is mutable unless you write `final` in front of
it — and almost nobody does, so almost every Java local you've ever written
was silently reassignable. Kotlin flips the default: every local declaration
picks explicitly between "this name is bound once" and "this name can be
reassigned," and the compiler enforces whichever you picked.

### Introduce the concept in isolation

```kotlin
val name = "Ada"
var count = 1
count = 2
println("$name has count $count")
```

Run it:

```bash
kotlin valvar.kts
```

Real output:

```text
Ada has count 2
```

Now try reassigning the `val`:

```kotlin
val name = "Ada"
var count = 1
count = 2
println("$name has count $count")
name = "Grace"
```

Real output — verified on the machine this lesson was written on:

```text
valvar.kts:5:1: error: 'val' cannot be reassigned.
name = "Grace"
^
```

*What this proves:* `count = 2` on line 3 compiled and ran fine — `var` is
exactly Java's ordinary mutable local. `name = "Grace"` on line 5 never ran
at all — the whole script failed to compile, the same "reject the entire
program before running any of it" behavior as a type error, just enforcing
mutability instead of a type.

### Discard the throwaway example

Delete both scripts. `val`/`var` themselves aren't discarded — every Kotlin
declaration from here on uses one or the other.

### CS Lens

This is the same **immutability-by-default** idea behind Java's own `final`,
Rust's `let` (immutable) vs. `let mut`, and JavaScript's `const` vs. `let` —
Kotlin just inverts which one requires the extra keyword, betting that
*most* locals should never be reassigned and the rare ones that need to be
should say so explicitly.

### SE Lens

Why bother, when Java's `final` already exists? Because almost no Java
codebase actually uses it consistently — it's opt-in, and opting in on every
line is friction nobody pays in practice. Kotlin makes the *safer* default
free and the mutable case cost one extra letter (`var` vs `val`), which is
cheap enough that people actually do it. The real payoff: reading `val` on
an unfamiliar variable tells you, guaranteed, that its value never changes
after this line — no need to scan the rest of the function to check.

### Connection

Every Kotlin declaration in this course picks `val` or `var` deliberately —
watch for `val` used far more often than Java habits would predict.

---

## Concept Unit: Null Safety Is Part of the Type

### The Problem

`NullPointerException` is Java's single most common runtime crash, and
Java's type system does nothing to prevent it — `String username` can hold
`null`, and the compiler never warns you. Kotlin makes nullability part of
the type itself: `String` and `String?` are genuinely different types, and
the compiler tracks which one you have at every point in the code.

### Introduce the concept in isolation

```kotlin
var nickname: String? = null
println(nickname?.uppercase() ?: "no nickname")
nickname = "Ace"
println(nickname?.uppercase() ?: "no nickname")
```

Run it:

```bash
kotlin nullsafety_ok.kts
```

Real output:

```text
no nickname
ACE
```

Now try assigning `null` to a plain, non-nullable `String`:

```kotlin
var username: String = "grace"
username = null
```

Real output — verified this session:

```text
nullsafety_bad.kts:2:12: error: null cannot be a value of a non-null type 'String'.
username = null
           ^
```

*What this proves:* `String` (no `?`) is a type that structurally cannot
hold `null` — the compiler rejects the assignment before the program runs,
the same static-checking behavior from the previous unit, now applied to
nullability itself. `String?` (with `?`) is a different type that *can* hold
`null`, and the compiler forces you to handle that case — `?.` (safe call)
returns `null` instead of crashing when the receiver is `null`, and `?:`
(the **Elvis operator**) supplies a fallback value when the left side is
`null`.

One more tool exists for when you're certain a nullable value isn't actually
null right now: `!!` (the **not-null assertion**), which skips the check and
crashes immediately if you're wrong.

```kotlin
var nickname: String? = null
println(nickname!!.uppercase())
```

Real output — verified this session:

```text
java.lang.NullPointerException
	at Bangbang.<init>(bangbang.kts:2)
```

*What this proves:* `!!` doesn't remove the possibility of a
`NullPointerException` — it just moves the check from "the compiler stops
you" back to "a real crash at runtime," exactly Java's original behavior.
It exists as an escape hatch, not a recommended default.

### Discard the throwaway examples

All three scripts are discarded. Nullability handling (`?`, `?.`, `?:`, and
occasionally `!!`) appears throughout the real app from here on.

### CS Lens

This is **null safety encoded in the type system** — sometimes called
"making the billion-dollar mistake"(the inventor of `null` in ALGOL, Tony
Hoare, called it that himself) "a compile-time question instead of a
runtime one." Also recognized in: Swift's `Optional<T>`, Rust's `Option<T>`,
and TypeScript's `strictNullChecks` — all mainstream languages designed
after Java converged on the same fix.

### SE Lens

The real tradeoff: every function signature now has to be honest about
whether `null` is a valid input or output (`fun findUser(id: String): User?`
vs. `fun findUser(id: String): User`), which is more upfront specification
work than Java demands. The payoff: a `NullPointerException` on a
non-nullable type is now a genuine impossibility the compiler guarantees,
not just a bug you happened not to hit yet — the exact category of crash
that made Java code review checklists include "did you null-check this?"
for every single parameter.

### Connection

Every Room and network-response type in this course (Epic 8) will be
written with nullability stated explicitly — this is the mechanism that
makes that honest.

---

## Concept Unit: String Templates Replace Concatenation and `String.format`

### The Problem

You've already used `$name` and `${...}` without comment in the previous two
units' examples — time to name what that actually is. Java requires either
`+` concatenation (`"Hello, " + name + "!"`) or `String.format("Hello, %s!",
name)` to build a string from variables. Both already appeared, unremarked,
in the null-safety examples above.

### The construct, named

`"$name"` embeds a variable directly; `"${expression}"` embeds any
expression, with braces required only when it's more than a bare name —
`"$name has count $count"` from the very first unit's example is exactly
this, and it already ran correctly.

### CS Lens

**String interpolation** — the same idea as Python's f-strings, JavaScript's
template literals, and C#'s `$"..."` (from this curriculum's WPF course) —
each language choosing its own delimiter for "embed the expression next to
the text it belongs in."

### SE Lens

The alternative, `String.format("%s has count %d", name, count)`, requires
matching each `%s`/`%d` placeholder to an argument by *position*, which
silently breaks the moment someone reorders the arguments without also
reordering the format string. Interpolation ties each value to its exact
spot in the text, so there's no positional list to get out of sync.

### Connection

Every string built in this course from here on uses interpolation — no
`+` concatenation chains, no `String.format`.

---

## Concept Unit: `data class` Replaces Java's Equals/HashCode/ToString Boilerplate

### The Problem

A plain Java class holding just two fields gives you none of the behavior
you'd actually want from it for free. Prove it:

```java
class Point {
    double x, y;
    Point(double x, double y) { this.x = x; this.y = y; }
}

public class PointDemo {
    public static void main(String[] args) {
        Point a = new Point(2.0, 3.0);
        Point b = new Point(2.0, 3.0);
        System.out.println(a);
        System.out.println(a.equals(b));
    }
}
```

Run it:

```bash
javac PointDemo.java && java PointDemo
```

Real output — verified this session:

```text
Point@15db9742
false
```

*What this proves:* `System.out.println(a)` printed a useless
hashcode-based string, and `a.equals(b)` returned `false` even though `a`
and `b` have identical field values — Java's default `Object.equals()`
checks reference identity, not content, and `Object.toString()` doesn't
know anything about your fields. Getting real content-based `equals`,
`hashCode`, and `toString` in Java means writing all three by hand (or
generating them), for every class, every time.

### Introduce the concept in isolation

```kotlin
data class Point(val x: Double, val y: Double)

val a = Point(2.0, 3.0)
val b = Point(2.0, 3.0)
println(a)
println(a == b)
println(a === b)
```

Run it:

```bash
kotlin dataclass.kts
```

Real output — verified this session:

```text
Point(x=2.0, y=3.0)
true
false
```

*What this proves:* one keyword, `data`, in front of the class declaration
generates a readable `toString()`, and `==` now compares content instead of
reference — `a == b` is `true` for two separately-constructed but
equal-valued points. `===` (three equals signs) is Kotlin's *separate*
operator for the old reference-identity check Java's `==` used to mean —
`a === b` is `false`, exactly matching Java's `a.equals(b)` false result
from the identity check `Object.equals()` falls back to.

### Discard the throwaway examples

Both the Java and Kotlin scratch files are discarded. `data class` is the
exact shape Epic 5's `Vector` and `Matrix` types use — Lesson 16 builds on
this directly.

### Mechanical walkthrough

1. `data class Point(val x: Double, val y: Double)` — (first appearance)
   `data` before `class` tells the compiler to generate `equals()`,
   `hashCode()`, `toString()`, and a few other methods (covered as they're
   needed) from the **primary constructor's** properties.
2. `(val x: Double, val y: Double)` — (first appearance) a **primary
   constructor** declared directly in the class header. `val` here does two
   things at once: declares a constructor parameter *and* a read-only
   property on the class — no separate field declaration and no
   hand-written getter, unlike Java's constructor-plus-field-plus-getter
   pattern.
3. `==` — (first appearance in Kotlin, hard concept reappearing from Java)
   in Kotlin, `==` always means content equality (calls `equals()`
   underneath) — this is different from Java, where `==` on objects means
   reference identity and you have to remember to call `.equals()` instead.
4. `===` — (first appearance) Kotlin's dedicated reference-identity
   operator — what Java's `==` actually does for objects.

### CS Lens

This is **value semantics** made convenient — two values are equal if their
contents are equal, independent of identity. Also recognized in: Python's
`@dataclass`, C# 9+ `record` types (this curriculum's WPF course covers
`record` directly), and Swift's `struct` — every mainstream language
converging on "give me equality and printing for free from my fields" as a
one-keyword feature.

### SE Lens

The real tradeoff: `data class` is meant for types that are simple
value-holders, not types with real identity or internal invariants to
protect — reach for a plain `class` (no `data`) the moment a type needs
private mutable state that shouldn't be exposed via an auto-generated
`toString()`or compared via auto-generated `equals()`. Epic 5's `Vector`
and `Matrix` are a clean fit for `data class`: pure values, no hidden state.

### Connection

Lesson 16 defines `Vector` and `Matrix` as `data class`es and adds operator
overloading on top of exactly this shape.

---

## Concept Unit: `when` Replaces `switch`, as a Real Expression

### The Problem

Java's `switch` is a statement — it performs actions but doesn't itself
produce a value, and (pre-Java 14 arrow syntax) requires `break` on every
branch or falls through by accident. Kotlin's `when` is an **expression** —
it evaluates to a value directly, the same way an `if`/`else` chain used as
an expression does.

### Introduce the concept in isolation

```kotlin
fun describe(x: Int): String = when {
    x < 0 -> "negative"
    x == 0 -> "zero"
    else -> "positive"
}
println(describe(-5))
println(describe(0))
println(describe(5))
```

Run it:

```bash
kotlin whenexpr.kts
```

Real output — verified this session:

```text
negative
zero
positive
```

*What this proves:* `when` with no argument tests each branch's condition
in order top to bottom and the whole `when` block evaluates to whichever
branch's expression matched — no `break`, no fallthrough, and the function
body is just `= when { ... }`, a single expression.

### Discard the throwaway example

Deleted. Epic 7's `Formula` sealed class (Lesson 21) uses `when` over a
closed set of subtypes instead of conditions like this — the same construct,
a different, more powerful use.

### CS Lens

This is **pattern matching as an expression**, the same family as ML/Haskell
`case`, Rust `match`, and modern Java's own `switch` expressions (added
years after Kotlin already had this). The `else` branch existing is what
makes the compiler treat the coverage as complete for a plain condition
`when`; Lesson 21 shows the stronger case, where `when` over a `sealed
class` can be exhaustive with *no* `else` at all, because the compiler
knows every possible subtype.

### SE Lens

Using `when` as an expression assigned directly to a function body (or a
`val`) forces every branch to actually produce a value of the same type —
if you later add a branch that forgets to return anything, it's a compile
error, not a silent bug. A `switch` *statement* gives you no such guarantee;
you can easily write a branch that does some work and returns nothing by
accident.

### Connection

Lesson 21's formula screen is where this construct's real power shows up —
`when` over a sealed class, checked exhaustively by the compiler.

---

## Concept Unit: Extension Functions

### The Problem

In Java, if you want a new method on `String` and you don't own `String`'s
source code, you're stuck writing a static utility method
(`StringUtils.shout(str)`) that reads backwards from how you'd call a real
method. Kotlin lets you add a method to an existing type from outside it.

### Introduce the concept in isolation

```kotlin
fun String.shout(): String = this.uppercase() + "!"
println("hello".shout())
```

Run it:

```bash
kotlin extfun.kts
```

Real output — verified this session:

```text
HELLO!
```

*What this proves:* `fun String.shout()` defines a function that's called
*as if* it were a real method on `String` — `"hello".shout()` — even though
`String` itself (a JVM/Kotlin standard library class you don't own) was
never modified. `this` inside the function refers to the specific string
`.shout()` was called on, exactly like `this` inside a real method.

### Discard the throwaway example

Deleted — `shout()` itself never appears in the real app. The mechanism
does: Lesson 9 adds real extension functions like `Double.toRadians()`
directly on `Double` for the calculator's trig buttons.

### CS Lens

This is genuinely new relative to Java — there is no clean Java equivalent
that doesn't devolve into a static-method utility class. It's implemented as
a compiler trick, not real runtime modification: `"hello".shout()` compiles
down to an ordinary static call `StringExtensionsKt.shout("hello")` — the
extension function never actually becomes part of `String` itself at
runtime, which is exactly why it doesn't need `String`'s source code.

### SE Lens

The real tradeoff: because it's a compile-time-only trick, an extension
function can't access `String`'s private internals, and two different
libraries can each define their own `.shout()` extension on `String` without
conflicting — whichever one is imported in a given file is the one that
applies. The alternative Java pattern (a static utility class) is
functionally equivalent but reads backwards (`StringUtils.shout(name)`
instead of `name.shout()`), which is the entire reason this feature exists.

### Connection

Lesson 9 is where this stops being a toy and starts doing real work — Kotlin
math extension functions on `Double`.

---

## Concept Unit: Default and Named Arguments

### The Problem

Java has no default parameter values — the usual workaround is overloading
the same method several times with fewer parameters, each one calling the
"real" method with a hardcoded fallback. Kotlin lets a parameter declare its
own default directly, and lets a caller name which parameter they're
supplying instead of relying purely on position.

### Introduce the concept in isolation

```kotlin
fun greet(name: String, greeting: String = "Hello") = "$greeting, $name"
println(greet("Ada"))
println(greet(name = "Grace", greeting = "Hi"))
println(greet(greeting = "Yo", name = "Alan"))
```

Run it:

```bash
kotlin defargs.kts
```

Real output — verified this session:

```text
Hello, Ada
Hi, Grace
Yo, Alan
```

*What this proves:* `greet("Ada")` used `greeting`'s default without
supplying it at all. The last call supplied both arguments in the
*opposite* order from the declaration and still worked correctly, because
naming an argument (`greeting = "Yo"`) makes its position irrelevant.

### Discard the throwaway example

Deleted. Composable functions in every remaining lesson lean on this
constantly — Compose's own `Text(text = "...", fontSize = 24.sp)` is this
exact mechanism, not special Compose magic.

### Mechanical walkthrough

1. `greeting: String = "Hello"` — (first appearance) a **default parameter
   value** — any caller who omits this argument gets `"Hello"` automatically.
2. `greet(name = "Grace", greeting = "Hi")` — (first appearance) **named
   arguments** — `name = "Grace"` explicitly labels which parameter this
   value fills, independent of its position in the argument list.

### CS Lens

Also recognized in: Python's keyword arguments and defaults (a very direct
match), C#'s named/optional parameters, and Swift's default parameter
values — a feature Java has never adopted, still requiring overloads or
builder objects to get the same effect.

### SE Lens

The real cost avoided: Java's usual "default value" workaround is a chain
of overloaded methods, each one a real, separately-compiled method that has
to stay in sync with the others by hand. Kotlin's version is one method
declaration; every caller sees the same defaults with zero duplicated code
to maintain. This is also why Compose function calls stay readable even
with a dozen optional parameters — you only ever name the few you're
actually overriding.

### Connection

Every `@Composable` function call from Lesson 1 onward uses named arguments
for exactly this reason — read them as "these are the specific things this
call customizes," not positional noise.

---

## Closing

### Connect the pieces

One concrete trace: `val`/`var` (unit 1) decide whether a name can be
reassigned; nullability (unit 2) is tracked as part of every type those
names have; string templates (unit 3) build readable text from them;
`data class` (unit 4) gives a value type free equality and printing;
`when` (unit 5) branches on values as a real expression; extension
functions (unit 6) add behavior to types you don't own; default/named
arguments (unit 7) make function calls—especially Compose's, starting next
lesson—readable without positional guessing. None of this is Android- or
Compose-specific — it's the language underneath everything from here on.

### What breaks without this

Delete the `?` from a `String?` declaration anywhere a `null` is later
assigned to it and try to compile — you already saw this exact failure in
Concept Unit 2 (`nullsafety_bad.kts`). That's not a contrived example; it's
the single most common first mistake moving from Java, where the same
assignment would have compiled silently and only crashed later, at
whatever line actually dereferenced the `null`.

### Exercises

- Change `describe`'s `when` branches to overlapping conditions (e.g., put
  `x < 10 -> "small"` before `x < 0 -> "negative"`) and confirm branches are
  checked top to bottom, first match wins — call `describe(-5)` and predict
  the output before running it.
- Write an extension function `Int.isEven(): Boolean` and call `4.isEven()`
  — confirm it reads exactly like a real method call.
- Take the `greet` function and add a third parameter with its own default;
  call it while supplying only the first and third arguments by name.

### Definition of done

- [ ] `kotlin -version` runs successfully on your machine.
- [ ] You triggered the real `val` reassignment and null-assignment compiler
      errors yourself, not just read about them.
- [ ] You ran the Java `PointDemo` example yourself and can state, in your
      own words, what `data class` gives you for free that it didn't.
- [ ] You can explain what `===` means in Kotlin and why it's a separate
      operator from `==`.
- [ ] Commit: `git commit -m "Add Kotlin language notes — no app code yet, prerequisite for the Compose lessons that follow"`.
