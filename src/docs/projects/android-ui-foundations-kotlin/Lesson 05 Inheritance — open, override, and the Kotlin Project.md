# Lesson 05: Inheritance — `open`, `override`, and the Kotlin Project

**What you will build:** A real Android Studio project with Kotlin
selected, and a full, precise reading of the `MainActivity.kt` it
generates — including one genuine, easy-to-be-bitten-by inversion of
Java's own default. The transferable problem: Java lets any class be
subclassed unless explicitly marked `final`. Kotlin flips this: every
class you write is `final` — sealed against subclassing — unless you
explicitly mark it otherwise. This project's own classes will hit this
rule directly, not just Android's framework classes.

**What you need to know first:** Java's `extends`, `@Override`, and the
real `AppCompatActivity` contract (its own `extends`/`implements`
chain, and its `onCreate` signature).

**Terms introduced in this lesson:**
- **`open`** — the modifier required on a Kotlin class before it can be
  subclassed at all, and on a member before it can be overridden.
- **`override`** — a required keyword (not an optional annotation) on
  any function replacing an inherited `open` member.
- **`:` (supertype delimiter)** — Kotlin's single symbol for both
  `extends` and `implements`, used identically for a superclass and any
  number of interfaces.

---

## Concept Unit: Kotlin Classes Are Closed by Default

### The Problem

Java's inheritance model assumes openness: any class can be subclassed
unless the author explicitly closes it off with `final`. Kotlin assumes
the opposite, and the difference isn't cosmetic — it changes what
compiles.

### Introduce the Concept in Isolation

```kotlin
class Greeter {
    fun greet() = "Hello"
}

class LoudGreeter : Greeter() {
    fun shout() = greet().uppercase()
}
```

Attempt to compile this exactly as written. Real error:

```
error: this type is final, so it cannot be inherited from
class LoudGreeter : Greeter() {
                    ^
```

`class Greeter` — no modifier — is **closed**: sealed against being
subclassed at all, by default. `class LoudGreeter : Greeter()` is a
genuine attempt to subclass it, using the `:` **supertype delimiter**
(Kotlin's single symbol for both `extends` and `implements` — no
separate keyword for either), and the `()` after `Greeter` is a direct
call to the parent's own constructor, inline in the declaration rather
than a separate `super(...)` call written in a constructor body. None of
that matters here, because the compiler rejects the attempt before
reaching any of it — `Greeter` simply cannot be inherited from as
written.

Fix it by marking `Greeter` explicitly `open`:

```kotlin
open class Greeter {
    open fun greet() = "Hello"
}

class LoudGreeter : Greeter() {
    override fun greet() = "HELLO"
}

fun main() {
    val loud: Greeter = LoudGreeter()
    println(loud.greet())
}
```

Compile and run:

```
kotlinc OpenDemo.kt -include-runtime -d OpenDemo.jar
java -jar OpenDemo.jar
```

Real output:

```
HELLO
```

Two separate `open` markers were required: one on `class Greeter`
itself (permitting subclassing at all) and a second on `fun greet()`
specifically (permitting *that particular method* to be overridden —
a class can be `open` while still protecting individual methods from
being overridden, simply by leaving them without their own `open`).
`override fun greet()` in `LoudGreeter` — **`override` is a required
keyword here, not an optional annotation** like Java's `@Override`:
omitting it is a compile error, not a missed opportunity for a helpful
warning.

### Discard the Throwaway Example

`Greeter` and `LoudGreeter` are deleted now. `AppCompatActivity`, next,
never faces this restriction at all — it's worth understanding
precisely why.

### CS Lens

Requiring explicit `open` is Kotlin's language-level enforcement of a
real, named object-oriented design principle: the **open/closed
principle** applied specifically to inheritance itself — a class should
be closed to modification (including being subclassed in ways its
author didn't anticipate or design for) unless deliberately opened.
Java's opposite default effectively assumes every class is safe to
subclass unless its author remembers to close it; Kotlin assumes the
reverse, treating unplanned inheritance as the risk to guard against by
default, not the safe default itself.

### SE Lens

**Why does this restriction matter enough to be a language default,
rather than just a style guideline teams could choose to follow?** A
class not designed with subclassing in mind can have real, subtle bugs
when subclassed anyway — a method calling another method internally,
assuming its own implementation, can behave incorrectly the moment a
subclass overrides the second method without knowing about that
internal call. Java's `final` exists to prevent exactly this but is, in
practice, rarely applied consistently across a real codebase, the same
observed pattern that motivated Lesson 01's `val`/`var` default
inversion. Kotlin's default makes the *safe* choice (closed) the one
requiring zero extra effort, and the riskier choice (open to
subclassing) the one requiring a deliberate, visible keyword.

---

## Concept Unit: The Real Kotlin Project and `MainActivity.kt`

### The Problem

With `open`/`override` understood precisely, the generated
`MainActivity.kt` can now be read completely, with nothing left
unexplained.

### The New Code

Create a new Android Studio project exactly as before, this time
selecting **Kotlin** in the Language dropdown instead of Java. The
generated file, `MainActivity.kt`:

```kotlin
package com.yourname.yourapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

### Mechanical Walkthrough

- `class MainActivity : AppCompatActivity()` — reappearing (this
  lesson's own `:` and constructor-call syntax), applied for real.
  `AppCompatActivity` itself needs no `open` marker to be subclassed
  here, for a precise reason: `AppCompatActivity` is a **Java** class —
  Kotlin's closed-by-default rule applies only to classes *written in
  Kotlin*; a Java class's openness is governed by Java's own rules
  (open unless explicitly `final`), completely unaffected by which
  language is doing the subclassing. `MainActivity` itself, being a
  Kotlin class with no `open` modifier, is closed — if this project ever
  needed a second class extending `MainActivity` further, that would
  fail exactly like `LoudGreeter` did above, until `MainActivity` were
  marked `open` deliberately.
- `override fun onCreate(savedInstanceState: Bundle?)` — reappearing
  `override`, applied to a real, inherited method for the first time.
  `Bundle?` — a **nullable** type (Lesson 02), not `Bundle` — correctly
  reflecting the real contract: `AppCompatActivity`'s own Java-side
  `onCreate(@Nullable Bundle savedInstanceState)` explicitly annotates
  this parameter `@Nullable`, one of the cases from Lesson 03 where the
  Android SDK's own annotations give Kotlin real, verified nullability
  information instead of a bare platform type — this is not a guess,
  it's Kotlin correctly reading a real annotation already present on the
  Java method being overridden.
- `super.onCreate(savedInstanceState)` — reappearing `super`, identical
  concept and identical necessity to the Java version: omitting it
  produces the same real `IllegalStateException` the Java series already
  triggered on purpose.
- `setContentView(R.layout.activity_main)` — reappearing, no change in
  behavior or syntax from Java at all.

### SE Lens

**Why does `AppCompatActivity`'s Java origin exempt it from Kotlin's own
closed-by-default rule, rather than Kotlin retroactively treating every
Java class as closed too, for consistency?** Retroactively closing every
Java class Kotlin interacts with would break an enormous amount of
real, working interop — the entire Android SDK, and every other Java
library, was written assuming Java's own open-by-default rule, with
real subclasses depending on that openness throughout the ecosystem.
Kotlin's rule change is deliberately scoped to *new Kotlin code*, not
retroactively imposed on the Java code it must remain fully compatible
with.

---

## Connect the Pieces

One trace: `Greeter`, a plain Kotlin class, rejected an inheritance
attempt outright until marked `open`. `AppCompatActivity`, a Java class,
never needed that marker at all — its own language's rules govern it,
untouched by Kotlin's stricter default. `MainActivity`'s real,
generated code applies `override` (required, not optional) to a method
whose nullable parameter type is read directly from a real Java
annotation, not inferred or assumed.

## What Breaks Without This

Remove `override` from `onCreate` entirely, leaving `fun onCreate(...)`.
Real error:

```
error: 'onCreate' hides member of supertype 'AppCompatActivity' and needs 'override' modifier
```

Unlike Java's `@Override` (a check that catches an accidental typo but
whose *absence* is completely legal), Kotlin requires the keyword
whenever a member genuinely does override something inherited — this is
enforced in both directions, not just checked when present.

## Exercises

1. Mark `MainActivity` itself `open` and add a second, empty Kotlin
   class `class DebugActivity : MainActivity()` in the same package.
   Confirm it compiles once `open` is present, and fails with the same
   "type is final" error from this lesson's own lab when it's removed.
2. Add a second `open` method to a scratch class, override it in a
   subclass, and then attempt to override that same method a second
   time in a further subclass *without* the overriding method itself
   being `open` — Kotlin requires `override` members to be re-marked
   `open` explicitly if they're meant to be overridden again further
   down the hierarchy. Confirm this real, cascading requirement for
   yourself.

## Definition of Done

- [ ] You triggered the real "type is final, so it cannot be inherited
      from" error, and fixed it with `open`.
- [ ] You can explain why `AppCompatActivity` needed no `open` marker.
- [ ] You triggered the real "needs 'override' modifier" error from an
      omitted `override` keyword.
- [ ] A real Kotlin Android project exists, and you can explain every
      line of its generated `MainActivity.kt`.
- [ ] Commit: `git commit -m "Create Kotlin Android project; confirm
      MainActivity.kt's open/override contract"` — explaining what was
      verified, not just that a project was created.

Next: reading widgets from Kotlin — View Binding, built the way Kotlin
projects overwhelmingly prefer it, contrasted against the
`findViewById` platform-type risk from Lesson 03.
