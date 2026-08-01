# Lesson 23: `if` as an Expression, and Kotlin's Ternary Answer

**What you will build:** Nothing new on screen — this lesson explains,
properly and in isolation, the exact construct the previous lesson
already used without pausing on it: `if (isGranted) "..." else "..."`,
used directly as `Text`'s argument. The transferable problem: Java's
Lesson 32 taught the ternary operator, `? :`, specifically because
plain `if`/`else` in Java is a **statement** — it runs a branch, but
produces no value of its own, so picking one of two values needs a
dedicated, separate expression form. Kotlin has no ternary operator at
all. This isn't a missing feature — it's a direct consequence of a fact
about `if` this series has been quietly relying on since Lesson 09
without ever naming it.

**What you need to know first:** Java's Lesson 32 in full (the ternary
operator, when it's preferred over `if`/`else`, and its real
requirement that both branches produce a value). This series' own
Lesson 02 (the Elvis operator, `?:` — this lesson resolves the exact
naming-collision risk flagged there).

**Terms introduced in this lesson:** None new — `if` as an expression is
not a separate construct from the `if`/`else` **statement** this series
has used since Lesson 02's own smart-cast lab; it's the same keyword,
used in a position that requires it to produce a value instead of
merely choosing which branch runs.

---

## Concept Unit: `if`/`else` Is Already an Expression

### The Problem

Every `if`/`else` this series has written so far — Lesson 02's smart
cast, Lesson 03's `describe()` method, Lesson 09's validation check —
was written as a **statement**: run one branch or the other, produce no
value directly. Does Kotlin's `if` have a second mode, the way Java
needed a completely separate operator for the value-producing case?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    var temperature = 30
    val description = if (temperature > 20) "warm" else "cold"
    println(description)

    temperature = 10
    val description2 = if (temperature > 20) "warm" else "cold"
    println(description2)
}
```

Compile and run:

```
kotlinc IfExpr.kt -include-runtime -d IfExpr.jar
java -jar IfExpr.jar
```

Real output, from running this just now:

```
warm
cold
```

`if (temperature > 20) "warm" else "cold"` is assigned directly into
`description` — no separate operator, no special punctuation, the exact
same `if`/`else` keywords this series has used from the start. There is
no second mode to learn: `if`/`else` in Kotlin is *always* an
expression — it always evaluates to a value — and this series' own
earlier uses of it as a statement simply discarded that value, the same
way calling any function and ignoring its return value discards
whatever it produced. Java's Lesson 32 needed the ternary operator
specifically because Java's `if`/`else` genuinely has no value of its
own to produce; Kotlin's `if`/`else` always has one, whether or not a
given use actually reads it.

### Discard the Throwaway Example

`IfExpr.kt` is deleted. This exact shape is already sitting in
`NotificationsActivity.kt` from this series' own previous lesson.

---

## Concept Unit: `if` Requires Both Branches When Used as an Expression

### The Problem

A statement-shaped `if` with no `else` is completely ordinary — "if
this condition holds, do this one extra thing, otherwise do nothing" is
a ubiquitous shape, used by this series' own Lesson 09 validation check.
Does that same missing-`else` shape work when the result is actually
being used as a value?

### The Proof

```kotlin
fun main() {
    val temperature = 30
    val description = if (temperature > 20) "warm"
    println(description)
}
```

Compile:

```
kotlinc NoElse.kt -include-runtime -d NoElse.jar
```

Real output, from running this just now:

```
NoElse.kt:3:23: error: 'if' must have both main and 'else' branches when used as an expression.
    val description = if (temperature > 20) "warm"
                      ^^
```

A real, precise compiler error — worth reading closely, since it names
the exact rule: `if` must have both branches *when used as an
expression*, not universally. An `if` with no `else`, used as a plain
statement with its result discarded, is completely legal — this series'
own Lesson 09 (`if (!username.isValidUsername()) { ...; return@... }`)
already relies on exactly that shape, with nothing after it reading a
value at all. The moment a value is actually needed — assigned to a
`val`, returned, passed as an argument — both branches must exist, for
an unavoidable reason: if `temperature` weren't greater than `20`, there
would be nothing at all for `description` to hold.

### Discard the Throwaway Example

`NoElse.kt` is deleted.

### CS Lens

`if`/`else` always being a real expression, rather than a statement with
a separate expression-shaped sibling, is the same design choice
functional programming languages have long made — in Lisp, ML-family
languages, and Haskell, `if` has always produced a value directly, with
no separate conditional-statement form needed at all. Kotlin's choice
here (along with `when`, this series' own Lesson 12, which is *also*
usable as an expression) reflects a broader design stance: fewer,
more general constructs, rather than a statement form and a separate
expression form for the same underlying decision.

Also recognized in: Rust's `if`/`else` (also always an expression, with
an identical both-branches-required rule when a value is needed), and
Scala's `if`/`else` (same shape again) — a real, recognizable pattern
across several modern, statically-typed languages designed after Java.

### SE Lens

**Why does Kotlin choose one general construct over Java's two
specialized ones (`if`/`else` statement, plus a separate ternary
expression)?** Two separate forms for the same underlying decision means
a reader has to recognize *which* one they're looking at, and remember
two sets of rules (a ternary requires exactly one expression per branch;
an `if`/`else` statement allows any number of statements per branch, or
none). One construct that's always an expression removes that
distinction entirely — the same keywords work whether the result is
being used or not, and the "both branches must produce a value" rule
only ever applies in the one situation where it's actually relevant,
checked directly by the compiler rather than left to a reader's memory
of which form they reached for.

---

## Concept Unit: Not a Ternary Operator — Resolving the Elvis Collision

### The Problem

A reader arriving from Java, having just been told Kotlin's `if`/`else`
replaces the ternary operator, might reasonably expect Kotlin's own `? :`
symbols to still exist, just meaning the same thing. This series' own
Lesson 02 already flagged this exact risk when introducing `?:`, the
Elvis operator, promising to resolve it here.

### The Proof

```kotlin
fun main() {
    val temperature = 30
    val description = temperature > 20 ? "warm" : "cold"
    println(description)
}
```

Compile:

```
kotlinc TernaryAttempt.kt -include-runtime -d TernaryAttempt.jar
```

Real output, from running this just now:

```
TernaryAttempt.kt:3:40: error: syntax error: Unexpected tokens (use ';' to separate expressions on the same line).
    temperature > 20 ? "warm" : "cold"
                     ^^^^^^^^^^^^^^^^^
```

Kotlin's parser doesn't recognize `? :` as an operator at all — there is
no ternary operator in Kotlin, full stop; `if`/`else`-as-an-expression is
the entire replacement. `?:`, this series' own Lesson 02 **Elvis
operator**, is a real, different, single token (no space between `?`
and `:`) doing a completely different job: supplying a fallback for a
`null` value (`message ?: "no message yet"`), never picking between two
arbitrary values based on an arbitrary condition. Confusing the two is
an easy, natural mistake for a reader who knows C-family ternary syntax
and sees `?` and `:` characters appear together in Kotlin source — worth
naming directly, one more time, now that both constructs have been seen
for real: Kotlin's answer to "pick one of two values" is `if`/`else`;
its answer to "use this unless it's null" is `?:`; they share no
relationship beyond an accidental visual resemblance in one token.

---

## Concept Unit: Confirming the Real Project Code

### The Problem

`NotificationsActivity.kt`, from this series' own previous lesson,
already contains `if (isGranted) "Notifications: enabled" else
"Notifications: not yet requested"` directly inside a `Text` call. This
lesson's job is confirming, precisely, why that's correct rather than
provisional.

### The Code, Already Written

```kotlin
Text(text = if (isGranted) "Notifications: enabled" else "Notifications: not yet requested")
```

### Mechanical Walkthrough

- `if (isGranted) "..." else "..."` — reappearing, this lesson's own
  concept, now confirmed as the direct, correct Kotlin equivalent of
  Java's own `granted ? getString(...) : getString(...)` from Lesson 33
  — same job, same "both branches only ever produce one value" shape
  Java's Lesson 32 SE Lens already named as the right occasion for its
  own ternary operator, expressed here with Kotlin's one general
  construct instead of a dedicated second one.

### SE Lens

**Java's Lesson 32 warned that nesting ternary expressions inside one
another is a real readability trap — does Kotlin's `if`/`else`-as-
expression carry the identical risk?** Yes, for the identical reason:
`if (a) x else if (b) y else z` is legal, compiles, and becomes
genuinely harder to read at a glance the more it nests, exactly like a
nested ternary would. Kotlin's own `when` expression (this series' own
Lesson 12) exists as the more readable tool for exactly the case Java's
Lesson 32 warned against — three or more branches choosing between
values — with `if`/`else` reserved, by convention, for the simple,
two-outcome case this lesson's own status text represents.

---

## Connect the Pieces

One trace: `if`/`else` in Kotlin was never a statement lacking a value
the way Java's is — it always produces one, and this series' own
earlier statement-shaped uses simply discarded it, unremarked, since
Lesson 02. `NotificationsActivity`'s status text reads that value
directly, requiring — proven by a real compiler error — both branches to
exist, for the same unavoidable reason Java's ternary operator requires
both operands. And Kotlin's complete absence of `? :` syntax, proven by
a second real compiler error, closes the exact naming-collision risk
this series flagged back in Lesson 02: `?:` is Elvis, not ternary, and
the two share nothing beyond an accidental resemblance.

## What Breaks Without This

This lesson's own two proofs — the missing-`else`-as-expression error
and the nonexistent-ternary-syntax error — are both real, deliberately
triggered failures, not hypotheticals.

## Exercises

1. Rewrite `NotificationsActivity`'s status text using a `when`
   expression instead of `if`/`else` (`when (isGranted) { true -> "..."
   ; false -> "..." }`), confirming it produces identical output, then
   explain, in your own words, why this series still prefers `if`/`else`
   for this specific two-outcome case per this lesson's own closing SE
   Lens.
2. Deliberately write a nested `if`/`else`-as-expression three levels
   deep, choosing between four possible string values based on three
   conditions, and judge, honestly, how hard it is to read at a glance —
   the same personal exercise Java's own Lesson 32 asked for nested
   ternaries.
3. Confirm `?:` and `if`/`else` are genuinely unrelated by trying to use
   `?:` to pick between two non-null values based on an arbitrary
   `Boolean` condition (not a null check) — for instance,
   `isGranted ?: "fallback"` where `isGranted` is a plain, non-nullable
   `Boolean`. Read the real compiler error and connect it to this
   lesson's own explanation of what `?:` actually checks.

## Definition of Done

- [ ] You ran the `if`-as-expression lab and can state, precisely, why
      Kotlin needed no separate ternary operator.
- [ ] You triggered both real compiler errors — missing `else` in an
      expression position, and the nonexistent `? :` syntax — yourself.
- [ ] You can explain the real difference between `if`/`else` and `?:`,
      and why confusing them is an easy, understandable mistake rather
      than a careless one.
- [ ] Commit: not applicable — this lesson only explained code the
      previous lesson already wrote; no new project changes.

Next: the real permission request — `rememberLauncherForActivityResult`,
Compose's own answer to the strict, unconditional-registration timing
rule Java's field-initializer approach already satisfies a different
way.
