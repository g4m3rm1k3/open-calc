# Lesson 13: Scope Functions — `apply`, `let`, and `also`

**What you will build:** A small, real refactor of this project's own
validation flow (Lesson 12), adding a diagnostic log line without
restructuring the code around it — plus three disposable labs proving
exactly what each of Kotlin's scope functions returns, since that's the
one detail that actually distinguishes them from each other. The
transferable problem: this series has already written code shaped like
"do something with this value, then keep going" more than once (Lesson
04's `binding` setup, Lesson 12's `validate(...)` call) without ever
naming the pattern. Kotlin has four small standard-library functions
built specifically for this shape, and picking the right one depends
entirely on one question: what should the whole expression evaluate to
when it's done?

**What you need to know first:** This series' Lesson 02 (nullable types,
`?.`), Lesson 08 (lambdas, trailing lambda syntax, `it`), Lesson 12
(`validate(...)`, the code this lesson's real application modifies).

**Terms introduced in this lesson:**
- **Scope function** — a small standard-library function whose only job
  is running a lambda against a given value inside a temporary scope,
  differing only in how that value is referred to inside the lambda
  (`this` vs. `it`) and what the whole call evaluates to (the original
  object vs. the lambda's own result).
- **`apply`** — runs a lambda with the receiver as `this`, and returns
  the receiver itself.
- **`let`** — runs a lambda with the receiver as `it`, and returns the
  lambda's result.
- **`also`** — runs a lambda with the receiver as `it`, and returns the
  receiver itself (like `apply`, but referring to it as `it`).

---

## Concept Unit: `apply` — Configure and Return the Same Object

### The Problem

Building an object and then configuring several of its properties before
using it is common — Lesson 08's real project code, and Java's own
Lesson 22 `Point`, both showed this general shape via a constructor
taking every value up front. Sometimes an object's own type doesn't take
every setting through its constructor at all (a real, common case in
Android APIs this series meets directly once Compose's own configuration
objects appear) — configuration happens afterward, through several
separate property assignments, one per line.

### Introduce the Concept in Isolation

```kotlin
class Paint {
    var color: String = "black"
    var strokeWidth: Int = 1
}

fun main() {
    val paint = Paint().apply {
        color = "red"
        strokeWidth = 4
    }
    println("${paint.color} ${paint.strokeWidth}")
}
```

Compile and run:

```
kotlinc ApplyDemo.kt -include-runtime -d ApplyDemo.jar
java -jar ApplyDemo.jar
```

Real output, from running this just now:

```
red 4
```

`Paint().apply { color = "red"; strokeWidth = 4 }` builds a `Paint`, runs
the lambda against it — inside the lambda, `color` and `strokeWidth`
refer directly to the new `Paint`'s own properties, because `apply`
makes the object available as `this`, exactly the same implicit-receiver
rule that lets an ordinary method read its own class's fields with no
qualifier — and then the *entire expression* evaluates to that same
`Paint` object, assigned into `paint`. Without `apply`, the identical
result needs a named intermediate variable and one line per assignment:

```kotlin
val without = Paint()
without.color = "blue"
without.strokeWidth = 2
```

Both versions produce an equally configured `Paint`; `apply`'s version
does it as a single expression, usable directly wherever a `Paint` value
is needed — assigned to a `val`, passed as an argument, or returned from
a function — without ever needing the intermediate variable at all.

### Discard the Throwaway Example

`ApplyDemo.kt` is deleted. This project's own code doesn't yet have a
natural forcing moment for `apply` — every object built so far is either
fully configured through its constructor (`InventoryItem`, Lesson 10) or
needs no post-construction setup (`binding`, `Intent`). `apply` reappears
for real once Milestone 4's Compose code starts chaining several
configuration calls onto one UI element at once — a genuinely common
shape there this series isn't ready to build yet.

### CS Lens

A scope function is a small, deliberate application of a **higher-order
function** — a function that takes another function as an argument —
this series' own Lesson 08 concept, reused here in the standard library
itself rather than for a UI callback.

---

## Concept Unit: `let` — Transform a Value, Especially After `?.`

### The Problem

Lesson 02's safe-call operator, `?.`, already returns `null` immediately
if its receiver is `null`, without running anything after it. Chaining
several more operations onto that result — and only running them at all
when the original value was real — is common enough to deserve its own
function.

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val name: String? = "Kotlin"
    val length = name?.let {
        println("Got: $it")
        it.length
    }
    println(length)

    val nothing: String? = null
    val length2 = nothing?.let {
        println("Got: $it")
        it.length
    }
    println(length2)
}
```

Compile and run:

```
kotlinc LetDemo.kt -include-runtime -d LetDemo.jar
java -jar LetDemo.jar
```

Real output, from running this just now:

```
Got: Kotlin
6
null
```

`name?.let { ... }` only runs the lambda at all if `name` isn't `null` —
`?.`'s own short-circuiting behavior (Lesson 02), now guarding a whole
block instead of a single method call. Inside the lambda, the value is
available as `it` (this series' own Lesson 08 implicit-parameter
concept, reused), not `this` — `let` refers to its receiver differently
from `apply` specifically because `let` is meant for *transforming* a
value into something else, and using `it` reads naturally as "the input
to this transformation," the same way a one-parameter lambda anywhere
else in this series already has. The whole expression evaluates to the
*lambda's own result* — `it.length`, a plain `Int` — not the original
`String`, which is exactly why `nothing?.let { ... }` correctly produced
`null` without ever running the block at all: there was no value to
pass `let` in the first place.

### Discard the Throwaway Example

`LetDemo.kt` is deleted. This exact `?.let { }` shape is the real
project's own next application.

### SE Lens

**What does `let` actually add over Lesson 02's `if (x != null) { ... }`
smart-cast pattern, which already does the same job for a local `val`?**
`let` chains directly onto the expression that produced the value — no
separate variable needs to exist first at all, and no separate `if`
block needs to be opened. This matters most exactly where Lesson 02's
own smart-cast unit found a real limit: a mutable property (`var`) can't
be smart-cast safely across two separate statements, but
`someObject.someMutableProperty?.let { ... }` reads it exactly once,
into the lambda's own local `it`, sidestepping the "could this change
between the check and the use" risk entirely, since there is no separate
check-then-use gap at all.

---

## Concept Unit: `also` — a Side Effect Without Breaking a Chain

### The Problem

Sometimes a value needs a side effect performed on it — logging it,
displaying it, recording it — with the *original* value, unchanged,
still needed immediately afterward. `let`'s own return value (the
lambda's result) is the wrong shape for this: using `let` here would
mean the logging block's own return value silently became the "real"
result unless it were written carefully to return the original value
back out.

### Introduce the Concept in Isolation

```kotlin
class Paint {
    var color: String = "black"
    var strokeWidth: Int = 1
}

fun main() {
    val paint = Paint()
        .also { println("Created with default color: ${it.color}") }
        .apply {
            color = "red"
            strokeWidth = 4
        }
    println("${paint.color} ${paint.strokeWidth}")
}
```

Compile and run:

```
kotlinc AlsoDemo.kt -include-runtime -d AlsoDemo.jar
java -jar AlsoDemo.jar
```

Real output, from running this just now:

```
Created with default color: black
red 4
```

`.also { println(...) }` runs its lambda with the value as `it` (like
`let`), but — unlike `let` — returns the *original, unchanged* value,
exactly like `apply` does. The chain keeps flowing directly into
`.apply { ... }` afterward as if `.also` had never been there at all,
which is precisely the point: `also` exists purely to insert a side
effect into the *middle* of an existing chain of calls, without changing
what the chain ultimately produces. Between `apply` and `also`, the
choice is which name inside the lambda reads better for the job:
`apply`'s `this` for configuring the object's own properties directly,
`also`'s `it` for treating the object as an input being observed or
logged rather than modified.

### Discard the Throwaway Example

`AlsoDemo.kt` is deleted. This is the exact shape the real project
applies next.

---

## Concept Unit: Applying It — Logging a Validation Result Mid-Chain

### The Problem

Lesson 12's `validate(username, password)` call, inside `loginButton`'s
listener, currently feeds directly into a `when`. Adding a temporary
diagnostic log of the result — without introducing a separate named
variable just to hold it for one `Log.d` call — is exactly `also`'s job.

### Project Change

- **Reference Source:** No reference counterpart — a temporary
  diagnostic addition, the same kind Java's own Lesson 13 and this
  series' own Lesson 07 already added and later removed.
- **Files affected:** `MainActivity.kt`.
- **Change type:** Insert `.also { ... }` into an existing expression.
- **Location:** Immediately after the `validate(username, password)`
  call, before the `when` it feeds into.
- **Dependencies:** None new.

### The New Code

```kotlin
when (validate(username, password).also { result ->
    Log.d("MainActivity", "Validation result: $result")
}) {
```

### The Updated Project

```kotlin
when (validate(username, password).also { result ->                      // ← new
    Log.d("MainActivity", "Validation result: $result")                  // ← new
}) {                                                                      // ← new
    is InvalidUsername -> {
        Toast.makeText(this, "Username must be at least 3 characters", Toast.LENGTH_SHORT).show()
        return@setOnClickListener
    }
    is InvalidPassword -> {
        Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
        return@setOnClickListener
    }
    is Valid -> {}
}
```

### Mechanical Walkthrough

- `validate(username, password).also { result -> Log.d(...) }` —
  reappearing, this lesson's own `also` concept: `validate(...)`'s real
  return value (one of `LoginValidation`'s sealed subtypes, Lesson 12)
  flows through `also` completely unchanged — the log line runs purely
  as a side effect — and the exact same `LoginValidation` value is what
  the surrounding `when` actually switches on. Naming the lambda
  parameter `result` instead of leaving it as implicit `it` is a
  deliberate readability choice for a multi-word `Log.d` line, the same
  "name it when the body is more than trivial" reasoning this series'
  own Lesson 08 already applied to `onClick`'s `view` parameter.
- `"Validation result: $result"` — reappearing, this series' own Lesson
  07 string template — `$result` calls `LoginValidation`'s inherited
  `toString()` (from `Any`, Kotlin's root type, the direct equivalent of
  Java's `Object`), which for a plain `object` like `InvalidUsername`
  prints a compiler-generated, reasonably descriptive default.

### SE Lens

**Why insert the log via `also` instead of just adding a separate `val
validation = validate(...)` line above the `when`, then logging it, then
switching on `validation`?** Both work identically at runtime — the
choice here is purely about **scope minimization**: a separate named
`validation` variable would remain in scope for the rest of the
listener, readable and potentially reused (correctly or by mistake) by
any later line, even though its only real job was being switched on
once. `.also { }` keeps the diagnostic logging tightly scoped to exactly
the one expression it's commenting on, with no new name introduced into
the surrounding code at all — a small, real instance of the same
"minimize what's exposed" reasoning this series has applied to fields,
properties, and function parameters throughout.

---

## Concept Unit: `run` and `with` — the Same Two Axes, Recombined

### The Problem

`apply` uses `this` and returns the receiver; `let` and `also` both use
`it`, differing only in what they return. That leaves one combination
unaccounted for: a function using `this` (like `apply`) but returning
the *lambda's own result* (like `let`).

### Introduce the Concept in Isolation

```kotlin
class Paint {
    var color: String = "black"
    var strokeWidth: Int = 1
}

fun main() {
    val paint = Paint()

    val description = paint.run {
        color = "green"
        "$color, width $strokeWidth"
    }
    println(description)

    val description2 = with(paint) {
        "$color, width $strokeWidth"
    }
    println(description2)
}
```

Compile and run:

```
kotlinc RunWithDemo.kt -include-runtime -d RunWithDemo.jar
java -jar RunWithDemo.jar
```

Real output, from running this just now:

```
green, width 1
green, width 1
```

`paint.run { ... }` reads properties directly as `this` (like `apply`)
but the whole expression evaluates to the lambda's *last line* — the
built string — not `paint` itself (like `let`). `with(paint) { ... }`
does the identical job, spelled differently: not called *on* `paint`
with a dot, but passed *as an argument* to a plain function, `with`.
This project doesn't currently have a natural need for either — `run`
and `with` earn their place in a codebase specifically where a value
needs to be both read via several unqualified property accesses *and*
transformed into a different result in one expression, a shape this
series' own real code hasn't needed yet.

### Discard the Throwaway Example

`RunWithDemo.kt` is deleted.

### CS Lens

All four scope functions, plus `run`/`with`, are really one small
two-by-two table — this vs. it, receiver vs. result — a real,
minimal instance of how a small number of independent design choices
combine to produce a family of related tools, each optimized for one
specific corner of the same general shape.

| | Returns the receiver | Returns the lambda's result |
|---|---|---|
| **Refers to it as `this`** | `apply` | `run` / `with` |
| **Refers to it as `it`** | `also` | `let` |

### SE Lens

**Why does Kotlin provide five small functions here instead of one
flexible one with a parameter for "which behavior do you want"?** Each
name is a small, load-bearing signal to a reader about *intent*, not
just mechanism — seeing `.apply { }` tells a reader "this block
configures the object and the object itself is what matters next," while
seeing `.let { }` tells them "this block transforms the value into
something else." A single configurable function would still work
mechanically, but would erase exactly the readability signal these five
short, specific names exist to provide.

---

## Connect the Pieces

One trace: `validate(username, password)` (Lesson 12) produces a real
`LoginValidation` value. `.also { result -> Log.d(...) }` observed that
value with a diagnostic log line, using `it` (named `result` here)
without altering it in any way, and the unchanged value flowed directly
into the exhaustive `when` that actually acts on it. `apply`, `let`, and
`run`/`with` all proved, in isolation, to be the same small idea —
run a lambda against a value inside a temporary scope — differing only
in the receiver's name inside the block and what the whole expression
finally evaluates to.

## What Breaks Without This

Change `.also { result -> ... }` to `.let { result -> ... }` in the real
project, leaving everything else the same, and read what the `when` now
switches on.

Real output, from running this yourself: a real compiler error — the
`when`'s branches (`is InvalidUsername`, `is InvalidPassword`, `is
Valid`) no longer type-check, because `let`'s return value is the
`Log.d(...)` call's own result (an `Int`, `Log.d`'s real Android return
type), not the original `LoginValidation` value `also` would have passed
through unchanged. This is the concrete, compiler-enforced version of
this lesson's own core distinction: `let` and `also` are not
interchangeable, even though both use `it`. Restore `.also` before
moving on.

## Exercises

1. Rewrite this lesson's `apply` lab (`Paint().apply { ... }`) using
   `also` instead, referring to the object as `it.color = "red"` rather
   than plain `color = "red"`. Confirm it still compiles and produces
   the same configured `Paint` — then explain, in your own words, why
   this project still prefers `apply` for pure configuration even though
   `also` can technically do the same job here.
2. Chain `.also { println(it) }` onto the real project's
   `validate(username, password)` call *and* keep the existing
   diagnostic `also` — confirming more than one `also` can chain in
   sequence, each observing the same unchanged value.
3. Rewrite this lesson's `run`/`with` lab using `let` instead
   (`paint.let { "$it.color, width ${it.strokeWidth}" }` — note: this
   requires `it.color`, not bare `color`, since `let` uses `it`, not
   `this`). Confirm it produces the identical string, proving `run` and
   `let` differ only in how the receiver is referred to inside the
   block, not in what either one returns.

## Definition of Done

- [ ] You ran every lab and can state, without looking, which of the
      five scope functions returns the receiver and which returns the
      lambda's result, and which use `this` versus `it`.
- [ ] You triggered the real compiler error from swapping `also` for
      `let` in the real project, and can explain exactly why the `when`
      stopped type-checking.
- [ ] The login flow now logs its validation result via `also` without
      introducing a new named variable, verified in Logcat on a running
      emulator or device.
- [ ] Commit: `git commit -m "Log validation result via also without
      introducing an intermediate variable"` — explaining the scope-
      minimization reasoning, not just the addition.

Milestone 3 is done — a fully interactive, validated login screen.
Milestone 4 starts the inventory grid — and, for the first time in this
series, a real reason to leave the View/XML system behind: Jetpack
Compose.
