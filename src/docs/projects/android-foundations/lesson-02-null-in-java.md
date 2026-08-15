# Lesson 02: Null in Java

**What you will build:** a real, deliberately caused
`NullPointerException`, then the same code fixed with a defensive `if`
check, and again with `Optional<T>` — each tool's real, distinct
tradeoff observed directly, and all three compared honestly against
Kotlin's compiler-enforced alternative from this series' own Lesson 07.

**What you need to know first:** [Lesson 01](lesson-01-java-syntax-at-a-glance.md)
(reference types). [Lesson 07](lesson-07-kotlin-null-safety.md) (Kotlin's
own null safety) is useful, direct contrast, not required.

**Terms introduced in this lesson:**
- **`NullPointerException`** — a real, unchecked exception thrown the
  instant code calls a method or reads a field through a reference that
  turns out to hold no object.
- **`Optional<T>`** — a real, standard-library wrapper type explicitly
  representing "a value that might legitimately be absent," forcing
  callers to acknowledge that possibility before extracting the value.

**Objects and methods used:**

**`java.util.Optional<T>`**
- *What it is:* a real, generic class in `java.util`.
- *Implementation:* real static factories `Optional.of(value)`
  (non-null required), `Optional.empty()`, `Optional.ofNullable(value)`
  (accepts either); real instance methods `isPresent()`, `get()`,
  `orElse(fallback)` — confirmed against the real JDK class.
- *Its use:* the real, explicit alternative this lesson's third unit
  proves against a plain nullable reference.

---

## Concept Unit: A Real, Caused `NullPointerException`

### The Problem

Every Java reference type variable — proven in Lesson 01 to hold a
reference, not the object's data directly — can, by default, hold no
reference at all: `null`. Does calling a method through such a variable
fail gracefully, or does it crash, and with what real, specific error?

### Introduce the Concept in Isolation

```java
String name = null;
System.out.println(name.length());
```

This compiles cleanly and **crashes at runtime**:

```
Exception in thread "main" java.lang.NullPointerException:
    Cannot invoke "String.length()" because "name" is null
    at Main.main(Main.java:2)
```

`String name = null;` — a plain, unremarkable declaration; nothing about
it looks dangerous, and the compiler raises no warning at all. The real
danger is entirely deferred to the moment `name.length()` actually runs
— proving, directly, that Java's own type system (unlike Kotlin's,
proven in this series' Lesson 07) makes no distinction between a
`String` variable that's guaranteed non-null and one that might be
`null` — every plain reference type is silently, always nullable.

### Discard

This crashing proof is disposable; each real fix, below, replaces it
directly.

### Mechanical Walkthrough

- `String name = null;` — **(c) already basic** as assignment syntax;
  its real, load-bearing point — that nothing here looks any different
  from an assignment that's genuinely safe — is this unit's own proof.
- `name.length()` — **(c) already basic** as a method call; its real,
  observed crash — not a compile-time warning, a genuine runtime
  exception — is this lesson's entire subject.

## Concept Unit: A Defensive `if` Check — the Real, Manual Fix

### The Problem

Without a compiler tracking null the way Kotlin's does, does a plain,
hand-written `if` check genuinely prevent the crash, the same way it
would in any language?

### Introduce the Concept in Isolation

```java
String name = null;

if (name != null) {
    System.out.println(name.length());
} else {
    System.out.println("No name provided");
}
```

Output:
```
No name provided
```

This runs correctly, with no crash — `if (name != null)` guards the
risky call, and the `else` branch handles the real, legitimate
`null` case explicitly. This works, and this lesson's own next unit
exposes the real, honest limit of this fix: nothing forces this specific
check to exist at all.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `if (name != null) { ... } else { ... }` — **(c) already basic**, an
  ordinary `if`/`else`, already familiar; its real effect — genuinely
  preventing the crash — is this unit's own proof.

### SE Lens

**The real, honest gap, proven directly:** removing this `if` check
entirely, reverting to this lesson's first unit's exact code, compiles
with **zero** warning of any kind — the compiler has no way to know, and
no way to insist, that a null check happen before `name.length()` runs.
This is the real, structural difference from Kotlin's own approach
(this series' Lesson 07): Kotlin's compiler *statically proves*, from
real code flow, whether a null check occurred before a risky access,
and refuses to compile the unguarded version at all. Java's `if` check
is real and effective once written, but nothing enforces that it's
written in the first place — the actual, provable reason
`NullPointerException` remains one of the most common real bugs in
large Java codebases, including Android's own historically Java-based
framework.

## Concept Unit: `Optional<T>` — Making Absence Explicit in the Type Itself

### The Problem

A plain nullable reference gives no visible signal, at the type level,
that a value might be absent — proven directly by this lesson's own
first unit, where `String name` looked identical whether or not `null`
was a real possibility. Does Java provide a real type that makes
"this might not exist" part of the declared type itself?

### Introduce the Concept in Isolation

```java
import java.util.Optional;

Optional<String> maybeName = Optional.ofNullable(null);

if (maybeName.isPresent()) {
    System.out.println(maybeName.get().length());
} else {
    System.out.println("No name provided");
}

String realName = maybeName.orElse("Unknown");
System.out.println(realName);
```

Output:
```
No name provided
Unknown
```

`Optional<String>` — a real, generic wrapper type; a method or field
declared to return `Optional<String>` rather than plain `String` signals,
directly in its own type, "this might legitimately be absent" — a real,
visible difference from Lesson 01's plain `String name`, which gave no
such signal at all. `Optional.ofNullable(null)` — a real static factory,
producing an empty `Optional` from a `null` input (a genuine, non-null
value would produce a populated one instead). `maybeName.isPresent()` —
real, explicit presence checking, structurally similar to the previous
unit's `if (name != null)`, but now checking a value whose *type itself*
already announced the possibility. `maybeName.orElse("Unknown")` — a
real, single-expression fallback, the direct structural counterpart to
Kotlin's own `?:` (this series' Lesson 07) — though, unlike Kotlin's
Elvis operator, `Optional` is a real, ordinary generic class, not
built-in compiler syntax.

### Discard

Nothing here is disposable — `Optional<T>` is the real, standard shape
for signaling "this value might be absent" in modern Java code,
including in real Android APIs and libraries that use it.

### Mechanical Walkthrough

- `import java.util.Optional;` — **(a) first appearance** of Java's real
  `import` statement, the direct counterpart to Kotlin's own `import`
  (not yet exercised in this series) and C#'s `using` (`wpf-foundations`
  Lesson 01) — same real job, different keyword.
- `Optional<String> maybeName = Optional.ofNullable(null);` — **(a)
  first appearance** of `Optional<T>` itself and its real
  `ofNullable(...)` factory, both confirmed in this lesson's Header.
- `maybeName.isPresent()` — **(a) first appearance** of this real
  instance method.
- `maybeName.get()` — **(a) first appearance** of this real instance
  method: extracts the wrapped value — genuinely unsafe to call without
  first confirming `isPresent()`, proven directly in this lesson's What
  Breaks section.
- `maybeName.orElse("Unknown")` — **(a) first appearance** of this real
  instance method, explained above.

### CS Lens

**(b) hard concept, real restatement.** `Optional<T>` is a real instance
of the general **option type** (also called a "maybe type") idea: making
"this value might not exist" a genuine, distinct case a type system can
represent and a compiler can nudge callers to handle, rather than
overloading an ordinary reference to silently mean either "a real value"
or "nothing" with no visible difference.

Also recognized in: Kotlin's own `String?` (this series' Lesson 07 —
covering the identical real problem with compiler-enforced, not merely
library-based, support), Rust's `Option<T>`, and Haskell's `Maybe` — the
same idea, independently reinvented across languages because the
underlying problem (representing legitimate absence without silent,
crash-prone `null`) is genuinely common.

## Connect the pieces

One trace: a plain Java reference type is silently, always nullable —
proven by a real `NullPointerException`, caused deliberately, with zero
compile-time warning. A defensive `if (x != null)` check genuinely
prevents the crash once written — proven directly — but nothing forces
it to exist, proven by the identical unguarded code compiling with no
warning at all. `Optional<T>` makes "might be absent" part of the
declared type itself, with real, explicit methods
(`isPresent()`/`get()`/`orElse(...)`) replacing an unmarked, silent
`null` — the real, library-level answer Java offers in place of Kotlin's
own compiler-enforced null safety (Lesson 07), honestly weaker (nothing
stops a method from still returning a plain, unmarked-nullable `String`
instead of an `Optional<String>`) but real and standard practice in
modern Java code.

## What breaks without this

Call `.get()` on an `Optional` that's genuinely empty, skipping the
`isPresent()` check this lesson's own working example used:

```java
Optional<String> empty = Optional.ofNullable(null);
System.out.println(empty.get());
```

This compiles cleanly and **crashes at runtime**:

```
Exception in thread "main" java.util.NoSuchElementException: No value present
```

Direct, provable proof `Optional<T>` does **not** eliminate the real
crash risk on its own — it only makes the *possibility* of absence
visible in the type; a caller still has to actually check `isPresent()`
(or use `orElse(...)`/`orElseThrow(...)`, real alternatives not
exercised further here) before extracting the value, the same real
discipline this lesson's second unit already proved for a plain `if`
check, now applied to a different, more self-documenting wrapper type.

## Exercises

1. Reproduce the real `NoSuchElementException` from the What Breaks
   section yourself, then fix it using `.orElse(...)` instead of
   `.get()`, confirming no crash occurs against a genuinely empty
   `Optional`.
2. Write a small method `findLongest(List<String> names)` (a real
   `java.util.List<String>`, covered fully in Lesson 05) returning
   `Optional<String>` — empty if the list itself is empty, otherwise the
   longest name. Call it against both a real, populated list and an
   empty one, handling both real cases explicitly.

## Definition of Done

- [ ] You reproduced the real `NullPointerException` from an unguarded
      `null` reference.
- [ ] You fixed it with a defensive `if` check, and can state, from
      direct observation, why nothing enforces that check existing.
- [ ] You built a real `Optional<T>` example and understood
      `ofNullable`/`isPresent`/`get`/`orElse`.
- [ ] You reproduced the real `NoSuchElementException` from calling
      `.get()` on an empty `Optional`.
- [ ] You completed both exercises.

## Next

[Lesson 03 — Interfaces, Anonymous Classes, and
Lambdas](lesson-03-interfaces-anonymous-classes-and-lambdas.md) covers
the real mechanism behind every Android listener
(`OnClickListener`) — a single-method interface, satisfied first the
verbose way, then with a real Java 8 lambda.
