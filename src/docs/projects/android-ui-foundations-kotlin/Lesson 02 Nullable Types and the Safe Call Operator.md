# Lesson 02: Nullable Types and the Safe Call Operator

**What you will build:** Nothing app-related yet — a disposable example
proving Kotlin's central, defining difference from Java: whether a
reference is allowed to hold `null` is decided by the compiler, at the
type level, not discovered at runtime when a `NullPointerException`
already crashed the app. The transferable problem: Java's `null` is a
value any reference-typed variable can silently hold, checked nowhere
by the compiler; Kotlin makes "can this hold nothing?" a real, enforced
part of every single type.

**What you need to know first:** Java's `null` and
`NullPointerException` — this lesson assumes you already know what
problem is being solved, and teaches Kotlin's specific, different
answer to it.

**Terms introduced in this lesson:**
- **Nullable type (`String?`)** — a type explicitly marked as allowed to
  hold `null`, distinct from its own non-nullable version (`String`).
- **Non-null type** — Kotlin's default: a type with no `?` cannot hold
  `null` at all, enforced by the compiler at every assignment and
  function call.
- **Safe call operator (`?.`)** — calls a method or reads a property only
  if the receiver isn't `null`; evaluates to `null` immediately,
  skipping the call, if it is.

---

## Concept Unit: Two Different Types, Not One Type With a Possible `null`

### The Problem

In Java, `String message` and a `String` that happens to be `null` are
the exact same declared type — nothing in the type itself tells you,
or the compiler, whether a given `String` reference might be empty at
runtime. Every single reference type carries this same unstated risk,
uniformly, everywhere.

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val name: String = "Alex"
    val maybeName: String? = null

    println(name.length)
    println(maybeName.length)
}
```

Attempt to compile this exactly as written. Real error:

```
error: only safe (?.) or non-null asserted (!!.) calls are allowed
  on a nullable receiver of type String?
    println(maybeName.length)
                      ^
```

This is not a runtime crash — it's a **compile-time rejection**,
before the program ever runs. `String` and `String?` are genuinely two
different types from the compiler's point of view: `String` is a
**non-null type** — Kotlin's default — and the compiler guarantees, at
every single point a `String` value is used, that it can never actually
be `null`, because nothing anywhere in valid Kotlin code is allowed to
assign `null` into a plain `String`-typed reference. `String?` is a
**nullable type** — an entirely separate type that explicitly opts into
allowing `null` — and the compiler tracks this difference precisely
enough to reject `maybeName.length` outright: calling a member directly
on a nullable type is not allowed at all, because there might be nothing
there to call it on.

### Discard the Throwaway Example

The broken version is not carried forward. The next unit shows the real,
correct way to read a property that might be `null`.

### CS Lens

This is **null safety built into the type system** — the same problem
Java's `null` (Tony Hoare's own "billion-dollar mistake") leaves entirely
to runtime luck and manual discipline, converted here into a static,
compile-time guarantee. A `String`-typed value in Kotlin is not "probably
not null, if the code was written carefully" — it is *provably* not
null, by construction, the same category of guarantee Java's own compiler
gives you for basic type correctness (you can't accidentally treat an
`int` as a `String`), now extended to cover nullability too.

Also recognized in: Swift's identical optional-type system (`String?`,
`String`), TypeScript's `strictNullChecks` mode (opt-in, rather than
Kotlin's default-on), and Rust's `Option<T>` — different syntax, the same
underlying idea: make "this might not exist" a fact the type checker
verifies, not a fact the programmer has to remember.

---

## Concept Unit: The Safe Call Operator

### The Problem

A nullable type is only useful if there's a real, correct way to
actually *use* the value it might hold, for the cases where genuinely
handling "there might be nothing here" is exactly what the code needs to
do.

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val name: String? = "Alex"
    val missing: String? = null

    println(name?.length)
    println(missing?.length)
}
```

Compile and run:

```
kotlinc SafeCall.kt -include-runtime -d SafeCall.jar
java -jar SafeCall.jar
```

Real output:

```
5
null
```

`name?.length` is the **safe call operator**: if `name` is not `null`,
it calls `.length` normally, exactly like a plain `.`. If the receiver
*is* `null` — as `missing` is — the entire expression short-circuits and
evaluates directly to `null`, without ever attempting the call, and
without throwing any exception at all. The result of a safe call is
itself always nullable (`name?.length` has type `Int?`, not `Int`,
regardless of whether `name` happens to be null this time) — the
compiler propagates the "might be nothing here" fact forward through the
chain rather than letting it quietly disappear.

### Discard the Throwaway Example

Deleted now. Every nullable Android API this project touches from here
on — reading a `View` that might not have been found, a callback result
that might be absent — uses this exact mechanism.

### CS Lens

The safe call operator is Kotlin's real, language-level implementation
of the same idea Java's `Optional<T>` (and, informally, defensive
`if (x != null)` checks) exist to approximate — except enforced by the
compiler at every single potential null site, rather than opt-in and
only as reliable as a developer's own discipline in remembering to check.

### SE Lens

**Why does a safe call propagate `null` forward silently instead of
throwing immediately, the way a direct call on a null Java reference
would?** Immediate throwing is exactly the `NullPointerException`
behavior Kotlin is designed to avoid needing at all — a safe call
represents a deliberate decision that "nothing here" is a legitimate,
expected outcome for this specific expression, not an error state.
This shifts real responsibility onto the *caller*: code using
`name?.length` must itself decide what a resulting `null` means and
handle it (the next lesson's Elvis operator is the most common way),
rather than the language deciding "crash" on the code's behalf by
default.

---

## Connect the Pieces

One trace: `String` and `String?` are two distinct types, not one type
with an optional flaw — the compiler proved this by rejecting a direct
call on the nullable one outright, before the program could ever run.
`name?.length` showed the real, correct way to use a nullable value:
call safely, receive a nullable result back, and let that result's own
nullability flow forward into whatever uses it next.

## What Breaks Without This

This lesson's first example already showed the "breaks without this"
case directly: attempting a plain `.length` call on a `String?` doesn't
compile at all — Kotlin refuses to let the Java-style mistake (a direct
call on a possibly-null reference) exist in the compiled program in the
first place.

## Exercises

1. Chain two safe calls together —
   `val length: Int? = maybeName?.trim()?.length` — and confirm it
   compiles and correctly evaluates to `null` if `maybeName` is `null`,
   without needing two separate null checks written by hand.
2. Declare a function `fun printLength(value: String)` (non-nullable
   parameter) and attempt to call it with a `String?` argument directly.
   Read the real compiler error and connect it to this lesson's core
   claim: the compiler enforces non-nullability at *every* boundary, not
   only at property access.

## Definition of Done

- [ ] You triggered the real compile-time rejection of a direct call on
      a nullable type.
- [ ] You ran the safe-call lab and saw a real `null` propagate through
      without any exception being thrown.
- [ ] You can explain, precisely, why `name?.length` has type `Int?`
      even when `name` isn't null in a particular run.
- [ ] Commit: not applicable — both examples are throwaway labs.

Next: what to actually do with the `null` a safe call can produce — the
Elvis operator, and a real look at where Kotlin's guarantees end because
you're calling into Java-based Android APIs.
