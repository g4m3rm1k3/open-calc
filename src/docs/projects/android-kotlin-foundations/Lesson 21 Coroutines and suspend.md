# Lesson 21: Coroutines and `suspend` — Answering Java's Inversion of Control

**What you will build:** Two small, disposable programs — one built with
callbacks, one built with Kotlin coroutines — performing the identical
two-step asynchronous operation, so the difference in how each one
*reads* can be measured against real, observed output rather than
described in the abstract. The transferable problem: Java's Lesson 33,
ahead of this series, names this exact situation as "the clearest,
most concrete Inversion-of-Control case in the entire series" — a
request that returns immediately, long before any real answer exists,
with the actual answer arriving later, on a schedule the calling code
cannot predict. Java's own answer, at the point that lesson reaches it,
is a registered callback. Kotlin has a structurally different answer,
and this lesson proves — not just claims — exactly what it changes.

**What you need to know first:** This series' Lesson 08 (lambdas,
callbacks, `setOnClickListener`'s own Inversion of Control). Java's
Lesson 33 (the permission-request Inversion-of-Control problem this
lesson's mechanism answers — read here for the problem statement only;
this series builds its own Compose-based permission flow in the next
three lessons, not a port of Java's Activity-based one).

**Terms introduced in this lesson:**
- **`suspend`** — a function modifier declaring that a function may
  pause its own execution partway through, without blocking the thread
  it's running on, and resume later from exactly where it left off.
- **Coroutine** — a unit of suspendable computation; a
  lighter-weight alternative to a thread that can be paused and resumed
  without the operating system needing to manage it as a separate
  thread.
- **`delay`** — a `suspend` function that pauses a coroutine for a given
  time, without blocking the underlying thread the way `Thread.sleep`
  does.
- **`runBlocking` / `launch`** — coroutine builders: functions that
  actually start a new coroutine running a given `suspend` lambda.

---

## Concept Unit: The Problem, Built With Callbacks First

### The Problem

Model a simplified two-step asynchronous operation — fetch a user, then
fetch a greeting for that user, each taking real time — using nothing
but the callback mechanism this series' own Lesson 08 already proved:
a lambda handed to a function, called later, on the function's own
schedule.

### Introduce the Concept in Isolation

```kotlin
fun fetchUserCallback(onResult: (String) -> Unit) {
    Thread {
        Thread.sleep(50)
        onResult("alex")
    }.start()
}

fun fetchGreetingCallback(user: String, onResult: (String) -> Unit) {
    Thread {
        Thread.sleep(50)
        onResult("Hello, $user!")
    }.start()
}

fun main() {
    println("Starting")
    fetchUserCallback { user ->
        fetchGreetingCallback(user) { greeting ->
            println(greeting)
        }
    }
    println("Requested (this may print before the greeting!)")
    Thread.sleep(200)
}
```

Compile and run:

```
kotlinc CallbackStyle.kt -include-runtime -d CallbackStyle.jar
java -jar CallbackStyle.jar
```

Real output, from running this just now:

```
Starting
Requested (this may print before the greeting!)
Hello, alex!
```

Read the order of these three lines against the order they're *written*
in the source: `println(greeting)` is written *before*
`println("Requested...")` in the source text, nested two callbacks deep
— but it printed *after* it, because both `fetchUserCallback` and
`fetchGreetingCallback` return immediately, having only started a
background `Thread` and registered a callback to run once that thread
finishes, exactly the same registration-now/invocation-later shape
Java's own Lesson 33 named for a permission request. Reading this code
top to bottom tells you almost nothing about when each line actually
runs — the real execution order has to be reconstructed by tracing
which callback triggers which, the same "prose isn't proof" problem this
curriculum's own execution-trace standard exists to catch.

### Discard the Throwaway Example

`CallbackStyle.kt` is deleted, but only after direct contrast with the
next unit's real alternative.

---

## Concept Unit: `suspend` and `delay` — Pausing Without Blocking

### The Problem

Is there a way to write the identical two-step operation so it *reads*
top to bottom in the order it actually runs, without giving up the real
requirement that neither step blocks anything else the app is doing
while it waits?

### Introduce the Concept in Isolation

```kotlin
import kotlinx.coroutines.*

suspend fun fetchUser(): String {
    delay(50)
    return "alex"
}

suspend fun fetchGreeting(user: String): String {
    delay(50)
    return "Hello, $user!"
}

fun main() = runBlocking {
    println("Starting")
    val user = fetchUser()
    val greeting = fetchGreeting(user)
    println(greeting)
    println("Done")
}
```

Compile and run:

```
kotlinc -cp kotlinx-coroutines-core.jar SuspendStyle.kt -include-runtime -d SuspendStyle.jar
java -cp SuspendStyle.jar:kotlinx-coroutines-core.jar SuspendStyleKt
```

Real output, from running this just now:

```
Starting
Hello, alex!
Done
```

This time the printed order matches the *written* order, exactly.
`fetchUser()` and `fetchGreeting(user)` are marked **`suspend`** — a
function modifier declaring "this function may pause partway through
without blocking the thread it's running on." `delay(50)` — itself a
`suspend` function from Kotlin's coroutines library — is doing real,
asynchronous waiting, the same underlying kind of "come back to this
later" `Thread.sleep` performs, but without occupying a whole operating
system thread while it waits; the calling code around it, though, reads
as if it were a perfectly ordinary, synchronous, blocking call: assign a
`val`, use it on the next line, exactly this series' own Lesson 01
first program's own top-to-bottom shape. This is a **coroutine**: a
unit of computation that can genuinely pause and later resume — here
started by `runBlocking`, a **coroutine builder** that runs its lambda
as a coroutine and blocks the calling thread only until that whole
coroutine finishes (appropriate for a `main` function; a real Android
app never uses `runBlocking` on its main thread, for reasons the next
unit names directly).

### Discard the Throwaway Example

`SuspendStyle.kt` is deleted. `suspend` and `delay` reappear, for real,
in this project's own permission-flow code starting next lesson.

### CS Lens

A coroutine that appears to "block" while actually yielding control back
to whatever's running it is a real implementation of a **continuation** —
a way of representing "the rest of a computation, to be resumed later,"
a concept with roots in programming-language theory going back decades,
here made practical and ordinary rather than exotic.

Also recognized in: JavaScript's `async`/`await` (a near-identical
surface syntax solving the identical problem — code that reads
sequentially but genuinely suspends at each `await`), Python's own
`async`/`await` and `asyncio`, and C#'s `async`/`await`, which
significantly influenced Kotlin's own coroutine design.

### SE Lens

**Why does reading top-to-bottom actually matter, if the callback
version and the coroutine version both eventually produce the correct
final output?** The callback version's real cost compounds with every
additional step: a third asynchronous operation means a third level of
nested lambdas, and error handling (what happens if step one fails?)
has to be threaded through every nesting level by hand. The coroutine
version's sequential structure means adding a third step is just a
third line, and Kotlin's ordinary `try`/`catch` (not built in this
lesson, but a real, direct consequence of this structure) works exactly
the way it would for fully synchronous code — a real, compounding
readability and correctness advantage that grows with the complexity of
the asynchronous logic involved, not a one-time convenience.

---

## Concept Unit: `suspend` Is Contagious — Checked by the Compiler

### The Problem

Nothing about `fun main() = runBlocking { ... }` in the previous unit
was accidental — try calling a `suspend` function from a completely
ordinary function instead.

### The Proof

```kotlin
import kotlinx.coroutines.delay

suspend fun fetchUser(): String {
    delay(50)
    return "alex"
}

fun main() {
    val user = fetchUser()
    println(user)
}
```

Compile:

```
kotlinc -cp kotlinx-coroutines-core.jar SuspendFromPlain.kt -include-runtime -d SuspendFromPlain.jar
```

Real output, from running this just now:

```
SuspendFromPlain.kt:9:16: error: suspend function 'suspend fun fetchUser(): String' can only be called from a coroutine or another suspend function.
    val user = fetchUser()
               ^^^^^^^^^
```

A `suspend` function can only be called from inside another `suspend`
function, or from inside a coroutine started by a builder like
`runBlocking` or `launch` — the compiler checks this directly, at every
call site, the same way it checks any other type mismatch. This is
deliberate, not incidental: a plain function has no mechanism at all
for genuinely pausing without blocking its caller's thread, so allowing
a plain function to call a `suspend` one without itself being inside a
coroutine would create exactly the contradiction the error message
names.

### CS Lens

A property that automatically propagates outward from every function
that has it to every function that calls it is a **contagious type
qualifier** — the same general shape as `async` functions in JavaScript
and Python (calling an `async` function generally requires the caller
to itself be `async`, or to explicitly bridge out of that world), and,
more distantly, a language's `const`/`unsafe` qualifiers propagating
through a call chain in a similar checked, contagious way.

---

## Concept Unit: Where a Real Coroutine Actually Runs — `viewModelScope`

### The Problem

`runBlocking` is right for a disposable `main` function that has nothing
else to do while it waits — genuinely blocking the one thread available
is harmless there. Blocking an Android app's main (UI) thread for even a
fraction of a second produces a frozen, unresponsive screen — exactly
the failure this project's whole permission flow, still ahead in this
series, must never risk.

### The Answer, Named for What's Coming

`ViewModel` (this series' own Lesson 19) provides a real, built-in
coroutine scope for exactly this situation: `viewModelScope`. A
coroutine started with `viewModelScope.launch { ... }` runs without
blocking the calling thread at all — `launch`, unlike `runBlocking`,
starts a coroutine and returns immediately, letting the rest of the app
keep responding while the coroutine's own `suspend` code runs and
eventually completes — and is automatically cancelled if the
`ViewModel` itself is ever cleared (this series' own Lesson 19
`onCleared()`), so a coroutine can never keep running, pointlessly,
after the screen that started it is genuinely gone for good. This is
the real tool the next lesson's permission-request flow is built on.

### SE Lens

**Given `launch` doesn't block anything, how does code elsewhere ever
find out what a `launch`ed coroutine eventually produced?** This is
precisely the seam this milestone's own `StateFlow` (Lesson 20) exists
to close: a coroutine started with `viewModelScope.launch { }` can
update a `MutableStateFlow`'s `.value` once its asynchronous work
finishes, and any composable observing that `StateFlow` via
`.collectAsState()` recomposes automatically the moment it does — the
exact chain the next three lessons build for real, on a genuine
permission request instead of `delay(50)`.

---

## Connect the Pieces

One trace: the callback version of a two-step asynchronous operation
proved, with real, observed output, that reading top-to-bottom tells you
nothing about actual execution order once callbacks are nested — the
identical Inversion-of-Control shape Java's Lesson 33 named for a
permission request. The `suspend`/`delay`-based version produced
identical final output while reading, and executing, in the exact
written order — proven, not asserted, by comparing the two real runs'
printed line order directly. `suspend`'s contagious, compiler-checked
requirement (only callable from a coroutine or another `suspend`
function) is what keeps that guarantee real rather than accidental, and
`viewModelScope.launch { }` — not `runBlocking`, which would freeze the
app's main thread — is the real, non-blocking coroutine builder this
project's own permission flow uses next.

## What Breaks Without This

This lesson's own third unit — calling `fetchUser()` from `main()`
directly, with no `runBlocking` or `suspend` context around it — *is*
"what breaks," a real, triggered compiler error rather than a
hypothetical one.

## Exercises

1. Add a third step to the coroutine version — `suspend fun
   fetchFarewell(user: String): String`, following the same `delay`-then-
   return shape — and confirm the three-step chain still reads and
   executes top to bottom with no additional nesting, unlike what a
   third callback-based step would have required.
2. Change `runBlocking` to `launch` inside a `runBlocking { }` wrapper
   (`fun main() = runBlocking { launch { ... } }`) and observe whether
   `"Done"` still reliably prints after `"Hello, alex!"` — investigate
   why `launch`, used incorrectly here with nothing awaiting its
   completion, can let `main` finish before the launched coroutine does.
3. Time both versions (wrap each in a rough real-time measurement, or
   simply observe how long each program takes to finish) and confirm
   both take roughly the same real wall-clock time to complete the two
   sequential steps — direct proof that coroutines aren't "faster," they
   are differently *structured*, a genuinely separate claim from
   performance.

## Definition of Done

- [ ] You ran both the callback version and the coroutine version
      yourself and observed the real difference in printed line order.
- [ ] You triggered the real "can only be called from a coroutine or
      another suspend function" compiler error yourself.
- [ ] You can explain, precisely, what `suspend` guarantees and why it's
      a compiler-checked, contagious property rather than a
      documentation convention.
- [ ] You can explain why `viewModelScope.launch` is the correct choice
      for real Android code, where `runBlocking` would be a genuine bug.
- [ ] Commit: not applicable yet — every example in this lesson is a
      disposable lab; no real project files changed.

Next: the real permission flow begins — declaring the notification
permission, and Kotlin's current, recommended replacement for the
legacy permission-request API, built on the exact coroutine mechanism
this lesson just proved.
