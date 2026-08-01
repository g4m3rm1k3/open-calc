# Lesson 12: Sealed Classes and `when` as an Expression

**What you will build:** A real `LoginValidation` result type — valid,
invalid username, or invalid password — replacing the single
early-return check Lesson 09 wired into both button listeners, with a
result the compiler can prove every caller actually handles completely.
The transferable problem: "this operation can end in one of several
specific, known outcomes" is one of the most common shapes in real code,
and Java has no dedicated language feature for it — modeling it usually
means a set of constants, a `String` tag, or a chain of `if`/`else if`
checks, none of which the compiler can verify are handled completely.
This lesson introduces a feature with no equivalent lesson anywhere in
the Java series, because Java genuinely has nothing that does this job
the same way.

**What you need to know first:** This series' Lesson 05 (`open`, and why
a Kotlin class can't be subclassed without it — sealed classes extend
that same idea further). Lesson 09 (the validation check this lesson
replaces with something more structured). Lesson 10 (`data class` — the
subtypes built here reuse that exact syntax).

**Terms introduced in this lesson:**
- **`sealed class`** — a class whose complete set of direct subclasses
  is known to the compiler at compile time, because every one of them
  must be declared in the same package.
- **`when` as an exhaustive expression** — a `when` used to produce a
  value (or, as verified in this lesson, even just as a statement) over
  a sealed type must cover every possible subtype, or the compiler
  refuses to compile it.
- **`is` (type-check branch)** — a `when` branch matching a specific
  runtime type, smart-casting the checked value to that type inside the
  branch.

---

## Concept Unit: The Problem `sealed class` Solves

### The Problem

Lesson 09's validation check does one thing: reject a too-short username.
A real login attempt genuinely has more than one possible way to end:
succeed, fail because the username itself is invalid, or fail because
the password is invalid — three, specific, known outcomes, not an
open-ended list. Java has no dedicated feature for "this value is
always exactly one of these N known kinds" — the closest tools are a set
of `int` or `String` constants checked with `if`/`else if` (which
compiles fine even if a case is silently missed), or a plain class
hierarchy with no way for the compiler to know or enforce the *complete*
list of subclasses that exist.

### Introduce the Concept in Isolation

```kotlin
sealed class LoginResult

class Success(val username: String) : LoginResult()
class WrongPassword : LoginResult()
class NetworkError(val message: String) : LoginResult()

fun describe(result: LoginResult): String {
    return when (result) {
        is Success -> "Welcome, ${result.username}"
        is WrongPassword -> "Incorrect password"
        is NetworkError -> "Network error: ${result.message}"
    }
}

fun main() {
    println(describe(Success("alex")))
    println(describe(WrongPassword()))
    println(describe(NetworkError("timeout")))
}
```

Compile and run:

```
kotlinc SealedDemo.kt -include-runtime -d SealedDemo.jar
java -jar SealedDemo.jar
```

Real output, from running this just now:

```
Welcome, alex
Incorrect password
Network error: timeout
```

`sealed class LoginResult` declares a class that can be subclassed
(sealed classes are implicitly `open` for their permitted subclasses,
overriding this series' own Lesson 05 final-by-default rule specifically
for this case) — but with a real, additional restriction the next unit
proves directly. `Success`, `WrongPassword`, and `NetworkError` are
three ordinary subclasses, each carrying whatever data is relevant to
that specific outcome (`Success` needs a username; `WrongPassword` needs
nothing extra; `NetworkError` needs a message). `when (result) { is
Success -> ...; is WrongPassword -> ...; is NetworkError -> ... }`
checks `result`'s real runtime type branch by branch — `is Success`
smart-casts `result` to `Success` inside that one branch, which is
exactly why `result.username` is readable there with no cast written by
hand, the same smart-cast mechanism this series' own Lesson 02 already
proved for a plain `if (x != null)` check, here triggered by a type
check instead of a null check.

### Discard the Throwaway Example

`SealedDemo.kt` is deleted, but this exact shape becomes real project
code before this lesson ends.

---

## Concept Unit: Exhaustiveness — the Compiler Proves Nothing Was Missed

### The Problem

The real value of `sealed class` is what happens when a branch is
missing, not what happens when every branch is present.

### The Proof

Remove the `NetworkError` branch entirely, leaving only two of the three
real subtypes handled:

```kotlin
fun describe(result: LoginResult): String {
    return when (result) {
        is Success -> "Welcome, ${result.username}"
        is WrongPassword -> "Incorrect password"
    }
}
```

Compile:

```
kotlinc MissingBranch.kt -include-runtime -d MissingBranch.jar
```

Real output, from running this just now:

```
MissingBranch.kt:8:12: error: 'when' expression must be exhaustive. Add the 'is NetworkError' branch or an 'else' branch.
    return when (result) {
           ^^^^
```

The compiler doesn't just complain generically — it names the *exact*
subtype that's missing, `NetworkError`, because `sealed` means the
compiler genuinely knows the complete list of every possible subtype and
can compare it directly against which branches actually exist. This
error appears at compile time, before the program ever runs, for a
mistake that in Java's `if`/`else if`-over-constants approach would
simply compile silently and produce a wrong or missing result the first
time that particular case actually occurred at runtime.

One more real behavior worth confirming directly, since it matters for
how this feature gets used in practice: does this exhaustiveness
requirement only apply when the `when`'s result is actually used (as
here, in a `return`), or does it apply even to a `when` used as a bare
statement with no result read at all?

```kotlin
fun handle(result: LoginResult) {
    when (result) {
        is Success -> println("Welcome, ${result.username}")
        is WrongPassword -> println("Incorrect password")
    }
}
```

Real output, from running this just now:

```
StatementWhen.kt:8:5: error: 'when' expression must be exhaustive. Add the 'is NetworkError' branch or an 'else' branch.
    when (result) {
    ^^^^
```

The identical error, even though nothing here reads a return value at
all — on this project's Kotlin compiler version, exhaustiveness over a
sealed type is enforced whether or not the `when`'s result is actually
used.

### Discard the Throwaway Example

`MissingBranch.kt`/`StatementWhen.kt` are deleted.

---

## Concept Unit: Why `sealed` Specifically — Contrast With a Plain `open` Class

### The Problem

This series' Lesson 05 already showed `open class Animal` allowing
subclasses freely. Would a plain `open class LoginResult` — no `sealed`
— give the same exhaustiveness checking `sealed` just proved?

### The Proof

```kotlin
open class LoginResult

class Success(val username: String) : LoginResult()
class WrongPassword : LoginResult()
class NetworkError(val message: String) : LoginResult()

fun describe(result: LoginResult): String {
    return when (result) {
        is Success -> "Welcome, ${result.username}"
        is WrongPassword -> "Incorrect password"
    }
}
```

Compile:

```
kotlinc OpenNotSealed.kt -include-runtime -d OpenNotSealed.jar
```

Real output, from running this just now:

```
OpenNotSealed.kt:8:12: error: 'when' expression must be exhaustive. Add an 'else' branch.
    return when (result) {
           ^^^^
```

Notice precisely what changed in the error message: with a plain `open`
class, the compiler can only ever suggest adding a generic **`else`**
branch — never a specific missing subtype — because an ordinary `open`
class could be subclassed by code *anywhere*, in any file, any package,
even a library added later; the compiler has no way to know the complete
list of subtypes and therefore cannot check against it. `sealed`'s real
value is exactly this: restricting where subclasses are allowed to exist
is what makes "the compiler knows every possible case" a provable fact
rather than an assumption.

Confirm that restriction is real, not just a description, by attempting
to subclass a sealed class from a different package:

```kotlin
// pkg1/Sealed1.kt
package pkg1
sealed class LoginResult
class Success(val username: String) : LoginResult()
```

```kotlin
// pkg2/Sealed2.kt
package pkg2
import pkg1.LoginResult
class OutsideAttempt : LoginResult()
```

Real output, from running this just now:

```
pkg2/Sealed2.kt:3:24: error: a class can only extend a sealed class or interface declared in the same package.
class OutsideAttempt : LoginResult()
                       ^^^^^^^^^^^^
```

This is the exact mechanism behind the previous unit's exhaustiveness
proof: a sealed class's subclasses must live in the same package as the
sealed class itself, which is precisely what lets the compiler enumerate
every one of them with certainty.

### Discard the Throwaway Examples

`OpenNotSealed.kt`, `pkg1/Sealed1.kt`, and `pkg2/Sealed2.kt` are all
deleted.

### CS Lens

A `sealed class` is Kotlin's real implementation of an **algebraic data
type**'s "sum type" (also called a tagged union or variant type) — a
value that is always exactly one of a fixed, known set of alternatives,
each potentially carrying its own different data. This is a foundational
idea in typed functional languages, arriving in Kotlin specifically to
make exhaustiveness checking possible.

Also recognized in: Swift's `enum` with associated values (structurally
almost identical to a Kotlin sealed class), Rust's `enum`, Haskell and
ML-family languages' native sum types (where this idea originates), and
TypeScript's discriminated unions (a looser, non-sealed approximation of
the same idea, checked structurally rather than by a closed class list).

### SE Lens

**Why does Kotlin restrict sealed subclasses to the same package instead
of allowing them anywhere, the way an ordinary class allows subclasses
anywhere?** The entire value of exhaustiveness checking depends on the
compiler being able to *prove* it has seen every subtype — a promise
that becomes false the instant subclassing is allowed from anywhere. The
same-package restriction is the actual mechanism that keeps the promise
true; loosening it would mean either giving up the specific-missing-case
compiler error this lesson's own proof relies on, or accepting an
exhaustiveness check that could be silently wrong the moment an
unrelated part of a large codebase added a new subclass the original
`when` never anticipated.

---

## Concept Unit: Applying It — a Real `LoginValidation` Result

### The Problem

Lesson 09's check only distinguishes "valid" from "not valid," collapsing
two genuinely different failure reasons (a bad username versus a bad
password) into one undifferentiated early return. A `sealed class`
result can carry the real, specific reason.

### Project Change

- **Reference Source:** No reference counterpart — an application-
  specific result type, not a framework contract.
- **Files affected:** `MainActivity.kt`.
- **Change type:** Add a sealed class hierarchy; replace the validation
  check inside both button listeners.
- **Location:** The sealed class declared at file scope, outside
  `MainActivity`; both listener bodies updated.
- **Dependencies:** This series' own Lesson 09
  (`String?.isValidUsername()`), reused, plus a new
  `String?.isValidPassword()` of the same shape.

### The New Code

```kotlin
sealed class LoginValidation
object Valid : LoginValidation()
object InvalidUsername : LoginValidation()
object InvalidPassword : LoginValidation()

fun validate(username: String, password: String): LoginValidation {
    if (!username.isValidUsername()) {
        return InvalidUsername
    }
    if (!password.isValidPassword()) {
        return InvalidPassword
    }
    return Valid
}
```

```kotlin
when (val validation = validate(username, password)) {
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

### The Updated Project

```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.loginButton.setOnClickListener { view ->
            val username = binding.usernameField.text.toString()
            val password = binding.passwordField.text.toString()

            when (validate(username, password)) {                                    // ← new
                is InvalidUsername -> {                                               // ← new
                    Toast.makeText(this, "Username must be at least 3 characters", Toast.LENGTH_SHORT).show()  // ← new
                    return@setOnClickListener                                         // ← new
                }                                                                     // ← new
                is InvalidPassword -> {                                               // ← new
                    Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()  // ← new
                    return@setOnClickListener                                         // ← new
                }                                                                     // ← new
                is Valid -> {}                                                        // ← new
            }                                                                         // ← new

            Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()
            val intent = Intent(this, InventoryActivity::class.java)
            startActivity(intent)
        }

        // createAccountButton unchanged in shape, same validate() call
    }
}

sealed class LoginValidation                                                          // ← new
object Valid : LoginValidation()                                                      // ← new
object InvalidUsername : LoginValidation()                                            // ← new
object InvalidPassword : LoginValidation()                                            // ← new

fun validate(username: String, password: String): LoginValidation {                   // ← new
    if (!username.isValidUsername()) {
        return InvalidUsername
    }
    if (!password.isValidPassword()) {
        return InvalidPassword
    }
    return Valid
}

fun String?.isValidPassword(): Boolean {                                              // ← new
    if (this == null) {
        return false
    }
    return this.length >= 6
}
```

### Mechanical Walkthrough

- `object Valid : LoginValidation()` — **first appearance of `object`
  as a subclass.** Each of these three outcomes carries no data of its
  own — unlike this lesson's earlier `Success(val username: String)`
  lab — so there is no reason more than one instance of `InvalidUsername`
  should ever need to exist. `object` declares a class with exactly one
  instance, created automatically, referred to directly by its own name
  (`InvalidUsername`, not `InvalidUsername()` — no constructor call at
  all). This is Kotlin's built-in, language-level version of the classic
  object-oriented **Singleton pattern**, with none of the manual
  ceremony (a private constructor, a static getter) that pattern
  normally requires.
- `when (validate(username, password)) { is InvalidUsername -> ...; is
  InvalidPassword -> ...; is Valid -> {} }` — reappearing, this lesson's
  own exhaustive `when`, now over three data-free `object` subtypes
  instead of three data-carrying classes. `is Valid -> {}` is a required
  branch, not an oversight — the whole point of exhaustiveness is that
  "do nothing for the success case, just fall through to the rest of the
  listener" still has to be stated, so the compiler can confirm every
  outcome was genuinely considered, not silently forgotten.
- `return@setOnClickListener` — reappearing, this series' own Lesson 09
  labeled-return concept, now used inside two of the three branches
  specifically to stop this one click's handling before the login
  `Toast`/navigation lines run.

### SE Lens

**Why introduce a whole sealed hierarchy for a check this small, instead
of just keeping Lesson 09's simpler true/false early return?** The
scale of this exact example is intentionally modest — the real payoff is
what happens as a real app's login logic grows past "one boolean check"
into several genuinely different failure reasons, each needing its own
distinct message or handling. An `if`/`else if` chain over `String` or
`Int` tags scales into exactly the silently-incomplete-case risk this
lesson's own missing-branch proof demonstrated; a `sealed class` scales
by having the compiler itself refuse to compile the moment a new
outcome is added somewhere and a `when` elsewhere is not updated to
handle it. The cost paid here, on a genuinely small example, is
ceremony that looks like overkill for three cases — the benefit compounds
specifically as the number of cases and the number of places that
`when` gets reused both grow.

---

## Connect the Pieces

One trace: `validate(username, password)` returns one of three `object`
instances — `Valid`, `InvalidUsername`, or `InvalidPassword` — each a
genuine singleton, this lesson's own `object` concept. The `when`
wrapping that call is checked, at compile time, against `LoginValidation`'s
complete, package-restricted set of subtypes — proven, not assumed,
by this lesson's own deliberately-triggered "must be exhaustive" errors
— and a labeled `return@setOnClickListener` (Lesson 09) exits early for
either failure case, leaving the success path to fall through to the
login `Toast` and navigation this series' own Lessons 08 and 11 already
built.

## What Breaks Without This

Add a fourth outcome, `object InvalidBoth : LoginValidation()`, to the
sealed hierarchy, without updating the `when` inside `loginButton`'s
listener at all, and try to build.

Real output, from running this yourself: the exact `'when' expression
must be exhaustive. Add the 'is InvalidBoth' branch or an 'else' branch`
error this lesson's own lab already triggered on purpose — except this
time inside real, already-working project code, refusing to let the
build succeed until the new case is actually handled somewhere. Remove
the unused `InvalidBoth` object before moving on, since this project's
`validate` function never actually produces it.

## Exercises

1. Add `is InvalidUsername` and `is InvalidPassword` handling to
   `createAccountButton`'s listener as well, reusing the same `validate`
   function — confirming one sealed hierarchy and one validation
   function serve both buttons, the same "learn the mechanism once"
   payoff Java's own Lesson 16 already noted for its second button.
2. Replace one of the two `object` failure cases with a real
   data-carrying `class` instead (for instance, `class InvalidUsername(
   val reason: String) : LoginValidation()`, with `validate` supplying a
   specific reason string), and update the `when` branch to read it.
   Confirm `is InvalidUsername -> { ... validation.reason ... }` type-
   checks correctly with the smart cast this lesson's first lab already
   proved.
3. Try declaring a plain, non-sealed `enum class LoginValidation { VALID,
   INVALID_USERNAME, INVALID_PASSWORD }` instead, and confirm a `when`
   over an `enum class` is *also* exhaustively checked by the compiler —
   then explain, in your own words, one real thing a `sealed class` can
   express that a plain `enum class` cannot (a case that needs to carry
   different data per outcome, like this lesson's original
   `Success(val username: String)`).

## Definition of Done

- [ ] You ran every lab in this lesson and triggered all three real
      compiler errors: the specific-missing-branch error on a sealed
      class, the generic-`else`-only error on a plain open class, and
      the cross-package subclassing error.
- [ ] You can explain, precisely, why `sealed` specifically — not `open`
      alone — is what makes exhaustiveness checking possible.
- [ ] Both buttons now distinguish an invalid username from an invalid
      password with a real, distinct `Toast` message, verified on a
      running emulator or device.
- [ ] You can explain what `object` declares, and why `InvalidUsername`
      is referred to with no `()` after it.
- [ ] Commit: `git commit -m "Model login validation as a sealed
      LoginValidation result instead of a single boolean check"` —
      explaining why a sealed hierarchy over a boolean, not just the
      new file.

Next: a repeated pattern this project's own code has already started
leaning on without naming it — Kotlin's scope functions, `apply` and
`let`, and exactly what each one actually returns.
