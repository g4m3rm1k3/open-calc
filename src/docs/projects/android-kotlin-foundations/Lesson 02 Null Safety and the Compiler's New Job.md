# Lesson 02: Null Safety — `?`, `!!`, and the Compiler's New Job

**What you will build:** Nothing app-related yet — a sequence of small,
disposable examples proving exactly what Kotlin's type system does
differently from Java's around `null`, and what each of the four
operators built around that difference actually promises. The
transferable problem: Java's Lesson 04 named `NullPointerException` as
"the single most common runtime crash in Java code, by a wide margin,"
and closed by naming Kotlin directly as a language that tried to fix
this by "building 'can this hold nothing?' directly into the type
system." This lesson makes good on that closing line — not as a
description, but as five real compiler and runtime experiments proving
exactly what changed and what didn't.

**What you need to know first:** Java's Lesson 04 (`null`,
`NullPointerException`, and why `null` is only possible for reference
types) — this lesson assumes that failure mode is already familiar and
spends its time on Kotlin's answer to it. Lesson 01 of this series
(`kotlinc`/`kotlin` tooling, top-level functions).

**Terms introduced in this lesson:**
- **Nullable type (`String?`)** — a type explicitly marked as "may hold
  `null`," distinct at compile time from the same type without the `?`.
- **Safe call operator (`?.`)** — calls a member only if the receiver
  isn't `null`; otherwise short-circuits to `null`.
- **Not-null assertion operator (`!!`)** — forces a nullable value to be
  treated as non-null, reintroducing a runtime crash on purpose.
- **Elvis operator (`?:`)** — supplies a fallback value when the
  left-hand side is `null`.
- **Smart cast** — the compiler narrowing a nullable type to its
  non-null form inside a branch it can prove already checked for `null`.

---

## Concept Unit: Nullable Types — `String` vs. `String?`

### The Problem

Java's Lesson 04 proved that any `String` variable can hold `null` —
there was no way to declare a `String` that *couldn't*. The type
`String` said nothing about whether `null` was a possibility; you found
out only at runtime, the hard way, via `NullPointerException`. Kotlin's
starting bet is that this is a solvable type-system problem, not just an
inevitable runtime risk. Can a type itself say, up front, "this can never
be null" or "this might be" — and can the compiler actually enforce it?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val message: String? = null
    println(message)
    println(message == null)
}
```

Compile and run:

```
kotlinc NullableDemo.kt -include-runtime -d NullableDemo.jar
java -jar NullableDemo.jar
```

Real output, from running this just now:

```
null
true
```

So far this looks identical to Java's Lesson 04 lab — because `String?`,
read here, behaves the same way `String` always did in Java. The real
difference only shows up when you try the *other* direction — declaring
a variable typed as a plain `String`, with no `?`, and assigning `null`
to it:

```kotlin
fun main() {
    val message: String = null
    println(message)
}
```

Compile:

```
kotlinc NonNullReject.kt -include-runtime -d NonNullReject.jar
```

Real output, from running this just now:

```
NonNullReject.kt:2:27: error: null cannot be a value of a non-null type 'String'.
    val message: String = null
                          ^^^^
```

This is a **compiler error**, not a runtime crash — the program never
ran; it never even finished compiling. This is called **null safety**:
Kotlin's type system treats `String` and `String?` as two genuinely
different types. Plain `String` now carries a real, compiler-enforced
guarantee — "this reference is never null" — that Java's `String` never
had. `String?` is the *only* Kotlin type allowed to hold `null` at all.

### Discard the Throwaway Examples

Both `NullableDemo.kt` and `NonNullReject.kt` are deleted now. The
distinction they proved — `String` versus `String?` as two different
types, one of which the compiler guarantees can never be `null` — is not
throwaway; it's the foundation every remaining unit in this lesson builds
on.

---

## Concept Unit: The Safe Call Operator `?.`

### The Problem

A `String?` is genuinely useful — Lesson 01 showed a real Android field
that starts out with no value. But now there's a new problem: if the
compiler enforces that only `String?` can hold `null`, what happens when
code tries to actually *use* a `String?` — call `.length` on it, the way
Java's Lesson 04 called `.length()` on a possibly-null `String`?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val message: String? = null
    println(message.length)
}
```

Compile:

```
kotlinc DirectAccess.kt -include-runtime -d DirectAccess.jar
```

Real output, from running this just now:

```
DirectAccess.kt:3:20: error: only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type 'String?'.
    println(message.length)
                   ^
```

Another compile-time rejection — and the error message itself names the
two ways forward. Try the first one, the **safe call operator**, `?.`:

```kotlin
fun main() {
    val message: String? = null
    val name: String? = "Kotlin"
    println(message?.length)
    println(name?.length)
}
```

Compile and run:

```
kotlinc SafeCall.kt -include-runtime -d SafeCall.jar
java -jar SafeCall.jar
```

Real output, from running this just now:

```
null
6
```

`message?.length` checks whether `message` is `null` first; since it is,
the whole expression short-circuits to `null` without ever calling
`.length` — no crash, because the method call that would have crashed
never happened. `name?.length` runs the check, finds a real `String`,
and calls `.length` normally, returning `6`. Notice the *type* this
returns: `message?.length` is an `Int?`, not a plain `Int` — a safe call
always produces a nullable result, because "the receiver might have been
null" has to be represented somewhere in the answer's type, not just
silently absorbed.

### Discard the Throwaway Example

`DirectAccess.kt` and `SafeCall.kt` are both deleted. `?.` itself is not
— it's the first of the two ways forward this unit's own compiler error
named, and it reappears in real project code the moment a nullable
`Intent` extra or a View Binding field needs reading safely.

---

## Concept Unit: The Not-Null Assertion Operator `!!`

### The Problem

The compiler error above named a second way forward: `!!.`. What is it,
and why would anyone reach for the option that isn't the safe one?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val message: String? = null
    println(message!!.length)
}
```

Compile:

```
kotlinc NotNullAssert.kt -include-runtime -d NotNullAssert.jar
```

Real output, from running this just now: nothing — it compiles cleanly,
with no error at all. Now run it:

```
java -jar NotNullAssert.jar
```

Real output, from running this just now:

```
Exception in thread "main" java.lang.NullPointerException
	at NotNullAssertKt.main(NotNullAssert.kt:3)
	at NotNullAssertKt.main(NotNullAssert.kt)
```

This is the **not-null assertion operator**, `!!` — it tells the compiler
"trust me, this is never actually null, stop checking, let me treat it as
a plain `String`." The compiler takes that promise at face value and
lets the code through — and when the promise turns out to be false at
runtime, the result is exactly what Java's Lesson 04 already showed:
a real `NullPointerException`. Worth noticing directly: this exception's
message is empty — no variable name, no method name, unlike the detailed
message modern Java's own `NullPointerException` printed in Lesson 04
(`Cannot invoke "String.length()" because "message" is null"`). `!!`
doesn't just reintroduce Java's exact risk; the crash it produces is
*less* informative than the one Java gives you by default.

### Discard the Throwaway Example

`NotNullAssert.kt` is deleted. `!!` itself is not — but this lesson's SE
Lens, below, is going to argue directly that reaching for it should be
rare, not a habit.

---

## Concept Unit: The Elvis Operator `?:`

### The Problem

Safe call (`?.`) avoids the crash but produces `null` right back out —
useful when `null` is an acceptable answer, unhelpful when the code
actually needs a real, usable value no matter what. Is there a way to say
"use this value if it's there, otherwise use this specific fallback
instead," in one expression?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val message: String? = null
    val name: String? = "Kotlin"
    println(message ?: "no message yet")
    println(name ?: "no message yet")
    println((message ?: "no message yet").length)
}
```

Compile and run:

```
kotlinc Elvis.kt -include-runtime -d Elvis.jar
java -jar Elvis.jar
```

Real output, from running this just now:

```
no message yet
Kotlin
14
```

`message ?: "no message yet"` reads as "`message`, or, if that's `null`,
this fallback instead." This is called the **Elvis operator** — the `?:`
token, rotated, is said to resemble a smiley with a hair curl, which is
genuinely where the name comes from. Unlike `?.`, its result is *not*
nullable: `message ?: "no message yet"` is a plain `String`, guaranteed,
because either branch produces a real, non-null `String`. That's why
`.length` can be called directly on the parenthesized result in the last
line with no `?.` needed — the compiler already knows nothing there can
be `null`.

### Discard the Throwaway Example

`Elvis.kt` is deleted. Keep the name — Lesson 23 of this series returns
to it directly, because `?:` is easy to mistake for a ternary operator on
first glance, and it is not one.

### CS Lens

Kotlin's `String?` versus `String` is a real implementation of an idea
computer science calls an **option type** (or Maybe type) — making "this
value might be absent" part of a value's *type*, checked by the compiler,
rather than a possibility every reader has to remember unaided. Java's
Lesson 04 already named the cost this exists to fix: Tony Hoare's
"billion-dollar mistake."

Also recognized in: Swift's `Optional<T>` (`T?`), Rust's `Option<T>`,
Haskell's `Maybe a`, and — inside Java itself, added years after `null`
already shipped and impossible to make the compiler enforce the way
Kotlin's `?` is — `java.util.Optional<T>`.

### SE Lens

**Why does Kotlin allow `!!` at all, if the entire point of `String?` is
to make the compiler catch what `!!` deliberately un-catches?** A real
tradeoff, not a contradiction: Kotlin runs on the same JVM as Java and
constantly calls into Java libraries that predate null safety entirely —
libraries whose own signatures can't tell Kotlin's compiler whether a
returned reference might be `null`. `!!` exists as an honest escape hatch
for exactly that boundary, and for the rarer case where a programmer
genuinely has outside information the compiler can't see. The real cost
this project pays for reaching for `!!` out of impatience rather than
necessity: every `!!` is a spot where Kotlin's whole compile-time
guarantee is switched off by hand, and — as this unit's own crash just
showed — the resulting failure is *less* informative than the Java
exception it's standing in for, not more. The idiomatic default used
throughout the rest of this series is `?.` and `?:`; `!!` appears only
where its use is the deliberate point of the lesson.

---

## Concept Unit: Smart Casts — the Compiler Remembers a Null Check

### The Problem

`?.` and `?:` both route *around* a `null` check to avoid ever fully
"unwrapping" a nullable type. But an ordinary `if` statement already
checks for `null` explicitly — the same shape Java's own Lesson 04
exercise used (`if (message != null) { ... }`). Does Kotlin force `?.`
even inside a branch that's already proven a value isn't `null`?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val message: String? = "Kotlin"
    if (message != null) {
        println(message.length)
    } else {
        println("no message yet")
    }
}
```

Compile and run:

```
kotlinc SmartCast.kt -include-runtime -d SmartCast.jar
java -jar SmartCast.jar
```

Real output, from running this just now:

```
6
```

`message.length` is called here with no `?.` and no `!!` — and it
compiles. Inside the `if (message != null)` branch, the compiler itself
tracks that `message` cannot be `null` at this specific point in the
code, and silently treats it as a plain `String` for the rest of that
branch. This is called a **smart cast**: the compiler narrowing a
nullable type down to its non-null form, automatically, wherever it can
*prove* the narrowing is safe — no operator, no extra syntax, just an
ordinary `if` check the compiler is actually reading.

That last phrase — "wherever it can prove it's safe" — is a real limit,
not a throwaway qualifier. Change `message` from a local `val` to a
mutable property on a class:

```kotlin
class Holder {
    var message: String? = "Kotlin"
}

fun main() {
    val holder = Holder()
    if (holder.message != null) {
        println(holder.message.length)
    }
}
```

Compile:

```
kotlinc SmartCastFail.kt -include-runtime -d SmartCastFail.jar
```

Real output, from running this just now:

```
SmartCastFail.kt:8:17: error: smart cast to 'String' is impossible, because 'message' is a mutable property that could be mutated concurrently.
        println(holder.message.length)
                ^^^^^^^^^^^^^^
```

This proves the smart cast is a real, checked compiler guarantee, not a
convenience the compiler applies loosely: `var message` is mutable, and
the compiler can't prove some other code didn't set `holder.message` back
to `null` in the gap between the `if` check and the line reading it —
concurrently, from another thread, or even from a property with a custom
getter recomputing a different value each read. Rather than accept a
smart cast it can't actually back up, the compiler refuses it outright.

### Discard the Throwaway Examples

`SmartCast.kt`, `Holder`, and `SmartCastFail.kt` are all deleted. Smart
casts themselves apply automatically, with no import and no operator,
anywhere the real project later writes an `if (x != null)` check against
a `val`.

---

## Connect the Pieces

One trace through this lesson: `String?` made "might be null" part of a
type, checked at compile time instead of discovered at a crash site.
`?.` used that type honestly — check, then call, or short-circuit to
`null`. `!!` deliberately threw that guarantee away and got back exactly
Java's `NullPointerException`, with less detail than Java gives by
default. `?:` turned a nullable value into a guaranteed non-null one by
supplying a real fallback. And the smart cast showed the compiler
applying all of this automatically inside an ordinary `if` — right up
until it could no longer *prove* the check still held, at which point it
refused the shortcut rather than pretend.

## What Breaks Without This

This lesson's `!!` and smart-cast-failure units *are* "what breaks" —
each triggered a real, verified failure on purpose: `!!` reintroduced
Java's own `NullPointerException` by deliberately disabling the
compiler's help, and the mutable-property smart cast produced a real
compile-time refusal rather than a silently wrong runtime guess. Both are
the honest cost side of null safety, not swept under the rug.

## Exercises

1. Take the `!!` example and replace it with `?:` supplying a fallback
   string instead. Confirm it no longer crashes, and explain in your own
   words why `?:` and `!!` both "resolve" a nullable value but produce
   completely different outcomes when the value turns out to be `null`.
2. Take the mutable-property smart cast failure and fix it without using
   `!!` — copy `holder.message` into a local `val` first (`val msg =
   holder.message`), then check `msg != null`. Confirm this compiles, and
   explain why copying into a `val` restores the compiler's ability to
   prove the smart cast is safe.
3. Chain two safe calls together: given `val a: String? = null`, write
   `a?.length?.let { println(it) }` (don't worry about `let` yet — this
   series covers it directly in Lesson 13) and confirm nothing prints,
   with no crash, because the chain short-circuits at the very first
   `?.`.

## Definition of Done

- [ ] You ran every lab above yourself and saw the real compiler errors
      and real runtime output, not just read about them.
- [ ] You can state, precisely, the difference in type between
      `message?.length` and `message ?: "fallback"` — one is nullable,
      one is guaranteed not to be, and you can say why for each.
- [ ] You triggered the smart-cast compiler error on a mutable property
      yourself, and can explain why the compiler refuses it even though
      the `if` check looks identical to the one that worked on a `val`.
- [ ] You can explain why `!!`'s crash carries less information than the
      equivalent Java `NullPointerException` from Lesson 04.
- [ ] Commit: not applicable yet — every example in this lesson was a
      deleted scratch file, not part of any tracked project.

Next: a real Kotlin class — constructors, properties, and exactly how
much of Java's Lesson 02 (`new`, references) and Lesson 13 (fields,
`private`) still applies unchanged.
