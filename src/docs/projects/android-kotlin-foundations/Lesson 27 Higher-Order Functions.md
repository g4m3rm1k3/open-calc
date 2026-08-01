# Lesson 27: Higher-Order Functions

**What you will build:** A `makeValidator` factory replacing this
series' two nearly-identical validation extension functions, and a
shared `ScreenScaffold` composable used by both Compose screens. The
transferable problem: this series has used functions that *accept*
another function as a parameter since Lesson 08 (`setOnClickListener`),
and used several standard-library ones since Lesson 13 (`apply`,
`let`). The other half of the same idea — a function that *returns* a
function — hasn't appeared yet, and this project's own code has been
quietly carrying a small, real duplication that half solves for.

**What you need to know first:** This series' own Lesson 08 (function
types, lambdas), Lesson 09 (`String?.isValidUsername()`,
`String?.isValidPassword()` — the duplication this lesson removes),
Lesson 26 (a composable parameter with a composable function type,
`content: @Composable () -> Unit` — reused directly, not re-taught).

**Terms introduced in this lesson:**
- **Higher-order function** — a function that takes another function as
  a parameter, returns a function, or both.
- **Function factory** — informal name for a function whose entire job
  is building and returning a new function, usually configured by the
  factory's own parameters.

---

## Concept Unit: A Function That Returns a Function

### The Problem

This series' own Lesson 09 built `String?.isValidUsername()` (minimum
length 3) and, in Lesson 12, `String?.isValidPassword()` (minimum
length 6) — two separate functions, differing only in one number, both
doing the identical "check the length, handle `null`" job.

### Introduce the Concept in Isolation

```kotlin
fun makeValidator(minLength: Int): (String) -> Boolean {
    return { input -> input.length >= minLength }
}

fun main() {
    val isValidUsername = makeValidator(3)
    val isValidPassword = makeValidator(6)

    println(isValidUsername("ab"))
    println(isValidUsername("alex"))
    println(isValidPassword("alex"))
    println(isValidPassword("alexander"))
}
```

Compile and run:

```
kotlinc HigherOrder.kt -include-runtime -d HigherOrder.jar
java -jar HigherOrder.jar
```

Real output, from running this just now:

```
false
true
false
true
```

`makeValidator`'s own return type, `(String) -> Boolean`, is this
series' own Lesson 08 function type — but here it's what the *function
itself* hands back, not what it accepts. Calling `makeValidator(3)`
doesn't check anything yet — it builds and returns a brand-new lambda,
`{ input -> input.length >= minLength }`, with `minLength` fixed at `3`
for this specific returned function (a real, working **closure** — the
returned lambda keeps a live reference to `minLength` from the call that
created it, even though `makeValidator` itself has already finished
running by the time `isValidUsername` is actually called later).
`isValidUsername` and `isValidPassword` are two independent functions,
each produced by the same factory with a different configuration,
proven by the different, correct results each one gives on identical
input. A **higher-order function** is any function that takes a
function as a parameter, returns one, or both — `makeValidator` is the
"returns one" half; `setOnClickListener` (this series' own Lesson 08)
was always the "takes one" half.

### Discard the Throwaway Example

`HigherOrder.kt` is deleted. `makeValidator`'s exact shape is the real
project's own next application.

### CS Lens

A returned function that keeps access to variables from the scope it
was created in — here, `minLength` — is a real, working **closure**, the
same concept underlying JavaScript's own closures and Python's nested
functions capturing an enclosing scope. This series has been using
closures informally since Lesson 08 (every lambda passed to
`setOnClickListener` closes over `binding`, `viewModel`, and other
surrounding variables) without needing the term until a function
*returning* a closure made the mechanism worth naming directly.

### SE Lens

**Why does replacing two nearly-identical functions with one factory
matter for a duplication this small?** The real cost of
`isValidUsername`/`isValidPassword`'s duplication isn't the two extra
lines today — it's that fixing a bug in the shared logic (say, trimming
whitespace before checking length) means remembering to fix it in both
places, and a third validation rule later (an email field, say) would be
a third near-identical copy. `makeValidator` collapses the actual shared
logic into one place, permanently, regardless of how many differently-
configured validators this project eventually needs.

---

## Concept Unit: Applying It — One Factory, Two Validators

### Project Change

- **Reference Source:** No reference counterpart — an application-
  specific refactor.
- **Files affected:** `MainActivity.kt`.
- **Change type:** Replace two extension functions with one factory and
  two configured values.
- **Dependencies:** This series' own Lessons 09 and 12
  (`isValidUsername`/`isValidPassword`'s call sites, unchanged).

### The New Code

```kotlin
fun makeValidator(minLength: Int): (String?) -> Boolean {
    return { input -> input != null && input.length >= minLength }
}

val isValidUsername = makeValidator(3)
val isValidPassword = makeValidator(6)
```

### Mechanical Walkthrough

- `(String?) -> Boolean` — reappearing, this series' own Lesson 02
  nullable type, now as part of a function type rather than a plain
  parameter declaration — the exact type this project's real validation
  call sites (`isValidUsername(username)`) actually need, since a value
  read from `binding.usernameField.text?.toString()` may be null.
- `input != null && input.length >= minLength` — reappearing, an
  ordinary null check (Lesson 02) combined with `&&`, replacing the
  earlier extension functions' `if (this == null) { return false }`
  smart-cast shape with an equivalent single-expression form.
- `val isValidUsername = makeValidator(3)` — a top-level `val`, not a
  `fun` — `isValidUsername` is now a plain property holding a function
  value, called with ordinary function-call syntax
  (`isValidUsername(username)`) exactly as it was when it was an
  extension function, since a variable holding a function type is
  called the same way a named function is.

### SE Lens

**Does this refactor lose anything real, given `isValidUsername` was
previously a method-like extension function callable with dot syntax
(`username.isValidUsername()`), and is now a plain value called with
parentheses (`isValidUsername(username)`)?** Yes, honestly: the
dot-syntax readability this series' own Lesson 09 specifically argued
for is genuinely given up here, in exchange for removing the
near-duplicate logic. This is a real, worth-naming tradeoff, not a
strictly-better replacement — a project with many more validation rules
sharing more configuration would likely judge the factory's
de-duplication worth losing the dot syntax; a project with only ever
two, permanently fixed validators might reasonably keep Lesson 09's
original extension-function version instead. Refactoring here is a
judgment call this lesson makes deliberately, not a universal rule that
factories always beat extension functions.

---

## Concept Unit: `ScreenScaffold` — a Shared Composable Wrapper

### The Problem

`InventoryScreen` and `NotificationsScreen` (this series' own Lessons 25
and 26) each independently wrap their own content in a `Column` with the
identical `Modifier.padding(24.dp)`. A shared wrapper composable can
hold that repetition in one place.

### The New Code

```kotlin
@Composable
fun ScreenScaffold(content: @Composable () -> Unit) {
    Column(modifier = Modifier.padding(24.dp)) {
        content()
    }
}
```

```kotlin
composable("inventory") {
    ScreenScaffold {
        InventoryScreen(onNavigateToNotifications = {
            navController.navigate("notifications")
        })
    }
}
```

### Mechanical Walkthrough

- `content: @Composable () -> Unit` — reappearing, this series' own
  Lesson 26 concept (a composable parameter with a composable function
  type), not new here.
- `content()` — calling the passed-in composable directly, placing
  whatever it composes inside `ScreenScaffold`'s own `Column`. This is
  the "takes a function" half of a higher-order function, this time
  applied to a composable instead of an ordinary one — confirming
  directly that this series' own function-type vocabulary (Lesson 08)
  and this lesson's own "returns a function" half combine into one
  general idea, regardless of whether the function involved happens to
  be `@Composable`.
- `ScreenScaffold { InventoryScreen(...) }` — trailing lambda syntax
  (this series' own Lesson 08), applied to a composable call exactly as
  it was applied to `setOnClickListener`.

### SE Lens

**Why does `ScreenScaffold` take a content lambda instead of, say, a
sealed class (this series' own Lesson 12) naming which screen to show
inside it?** A content lambda lets `ScreenScaffold` remain completely
ignorant of what it's wrapping — it composes *whatever* `content()`
happens to produce, with zero knowledge of `InventoryScreen` or
`NotificationsScreen` specifically. A sealed-class-based alternative
would require `ScreenScaffold` itself to know about, and `when`-branch
over, every possible screen it might ever wrap — coupling a purely
layout-level concern (padding, a consistent `Column`) to the actual
identity of every screen using it, for no real benefit here.

---

## Connect the Pieces

One trace: `makeValidator(3)` and `makeValidator(6)` each built and
returned a distinct, independently-working function — a real closure,
carrying its own `minLength` forward — replacing two near-duplicate
extension functions (Lessons 09 and 12) with one shared piece of logic.
`ScreenScaffold`, built from the identical "takes a function as a
parameter" half of the same higher-order-function idea, now applied to
a `@Composable` function type (this series' own Lesson 26 concept),
removed the duplicated `Column`/padding setup both Compose screens
previously repeated independently.

## What Breaks Without This

Call `makeValidator(3)` and immediately call the returned function with
no arguments (`isValidUsername()` instead of `isValidUsername(username)`)
and try to compile.

Real output, from running this yourself: a real compiler error — the
returned function's type is `(String?) -> Boolean`, requiring exactly
one `String?` argument; calling it with none is a genuine type error,
proving the returned lambda's own parameter list is real and checked,
not merely decorative.

## Exercises

1. Add a third validator, `isValidEmail`, built from a *different*
   factory shape (`makeValidator` checks length; write a second factory,
   `makeContainsValidator(required: Char)`, checking whether a string
   contains a specific character) and confirm both factories can coexist
   independently.
2. Rewrite `ScreenScaffold` to also accept a `title: String` parameter,
   displaying it as a `Text` above `content()` — confirming a
   higher-order composable can mix an ordinary parameter with a
   function-typed one, the same shape `AddItemForm`'s `onAdd` parameter
   (this series' own Lesson 17) already used alongside its own local
   state.
3. Print the two closures from this lesson's own isolated lab
   (`println(isValidUsername)`, `println(isValidPassword)`) and observe
   that Kotlin reports them as two genuinely distinct function objects,
   confirming each call to `makeValidator` really did produce its own
   independent closure rather than sharing one underlying object.

## Definition of Done

- [ ] You ran the `makeValidator` lab and can explain, precisely, what a
      closure is and why `isValidUsername`/`isValidPassword` behave
      independently despite being built by the same function.
- [ ] `MainActivity`'s validation logic now uses one factory instead of
      two near-duplicate extension functions, with both buttons still
      validating correctly.
- [ ] Both Compose screens now use a shared `ScreenScaffold`, verified
      on a running emulator or device.
- [ ] You can state one real thing this refactor gave up (dot-syntax
      readability) in exchange for what it gained (removed duplication).
- [ ] Commit: `git commit -m "Replace duplicate validators with a
      makeValidator factory; extract a shared ScreenScaffold"` —
      naming both the de-duplication and the real tradeoff, not just
      the refactor.

Next: focus order and accessibility inside Compose — Java's Lesson 35
`nextFocusForward` and TalkBack traversal, answered by Compose's own
`Modifier`-based mechanism.
