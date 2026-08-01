# Lesson 13: The Permission Flow — `if` as an Expression and `when`

**What you will build:** The SMS permission request flow, rebuilt in
Kotlin — the Manifest declarations are identical (XML, not
language-dependent, no new concept there), and the runtime request
uses Kotlin's own trailing-lambda callback shape. Along the way: the
real reason Kotlin has no separate ternary operator at all, and `when`,
Kotlin's own generalization of the same idea. The transferable problem:
the Java series taught the ternary operator as a genuinely new,
isolated construct. Kotlin doesn't have one — and understanding
precisely *why* it doesn't need one is the actual lesson, not just a
syntax swap.

**What you need to know first:** The Manifest permission model
(`uses-permission`, dangerous vs. normal); `ActivityResultContracts.RequestPermission`
and why it was chosen over the legacy request-code API; the ternary
operator's own shape, as the point of contrast.

**Terms introduced in this lesson:**
- **`if` as an expression** — in Kotlin, `if`/`else` itself can produce
  a value directly, the same job Java's separate ternary operator does;
  Kotlin has no separate ternary syntax at all.
- **`when`** — Kotlin's generalized branching construct, usable as a
  statement or an expression, replacing both Java's `switch` and,
  often, longer `if`/`else if` chains.

---

## Concept Unit: `if` Is Already an Expression

### The Problem

Java needed a dedicated ternary operator, `condition ? a : b`, because
its own `if`/`else` is purely a **statement** — it runs one branch or
the other, but the construct itself produces no value a caller could
assign or return directly. Kotlin's `if` was designed differently from
the start.

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val temperature = 30
    val description = if (temperature > 20) "warm" else "cold"

    println(description)
}
```

Compile and run:

```
kotlinc IfExpressionDemo.kt -include-runtime -d IfExpressionDemo.jar
java -jar IfExpressionDemo.jar
```

Real output:

```
warm
```

`if (temperature > 20) "warm" else "cold"` — no ternary operator
anywhere, because none exists in Kotlin — is an ordinary `if`/`else`,
used directly as an expression, assigned straight into `description`.
This is not new syntax layered on top of `if`; it's the same `if` this
series has already used as a statement (inside `onCreate`, guarding
`super.onCreate` calls and the like), Kotlin simply never restricted it
to statement-only use the way Java does. An `if` used this way requires
an `else` branch — omitting it would leave a path producing no value at
all, which the compiler rejects the moment the result is actually used
as an expression.

### Discard the Throwaway Example

Deleted now. The permission status text, next, uses this exact
mechanism for real.

### CS Lens

Making a control-flow construct simultaneously valid as a
**statement** (run for its side effects, value discarded) and an
**expression** (run for its resulting value) is a real, deliberate
language design choice — functional-programming-influenced languages
(and Kotlin draws directly from this tradition) tend to make most or
all constructs expressions, on the reasoning that a dedicated,
separate ternary syntax is really just a restricted, second copy of
`if`/`else` that a language wouldn't need if `if`/`else` itself weren't
artificially limited to one role.

### SE Lens

**Why does Java restrict `if` to statement-only use in the first
place, if letting it double as an expression is possible and, as
Kotlin proves, workable?** Java's design predates widespread mainstream
adoption of expression-oriented control flow, and changing `if`'s
fundamental shape decades into the language's life would break
enormous amounts of existing code and tooling built around its
statement-only meaning. Kotlin, designed later with no such legacy
constraint, made the different choice from the start — this is a real
example of language design being shaped as much by history and
compatibility as by which choice is "better" in the abstract.

---

## Concept Unit: `when`

### The Problem

`if`/`else` as an expression handles exactly two branches cleanly. More
than two conditions, chained as `if`/`else if`/`else if`/`else`, gets
visually noisy fast — the exact case Java's `switch` exists for, with
its own real limitations (fall-through behavior that's a frequent
source of bugs, and, historically, support for only a narrow set of
types).

### Introduce the Concept in Isolation

```kotlin
fun describeCount(count: Int): String {
    return when {
        count == 0 -> "none"
        count == 1 -> "one"
        count in 2..9 -> "a few"
        else -> "many"
    }
}

fun main() {
    println(describeCount(0))
    println(describeCount(1))
    println(describeCount(5))
    println(describeCount(50))
}
```

Compile and run:

```
kotlinc WhenDemo.kt -include-runtime -d WhenDemo.jar
java -jar WhenDemo.jar
```

Real output:

```
none
one
a few
many
```

`when { ... }`, used with no argument in parentheses, evaluates each
branch's condition (`count == 0`, `count == 1`, `count in 2..9`) in
order, top to bottom, and executes (and, used this way as an
expression, returns the value of) the first one that's `true` — `else`
catches anything none of the earlier branches matched. `count in
2..9` uses a Kotlin **range** (`2..9`, every integer from 2 through 9
inclusive) with the `in` operator, checking membership directly, no
`>=`/`<=` pair needed. Unlike Java's `switch`, there is no fall-through
at all — each branch is fully independent, and no `break` is needed or
even exists for this purpose.

### Discard the Throwaway Example

Deleted now. This project's own real branching (Java: a ternary picking
one of two strings) doesn't strictly need `when`'s multi-branch power —
worth being honest about that, the same way Lesson 12 was honest that
smart casts weren't strictly required by this project's own delete
logic — but `when` is common enough in real Kotlin Android code
(dispatching on a sealed class, a view type, a request code) that
seeing it once, for real, matters before meeting it unexplained
elsewhere.

### CS Lens

`when` used with no subject expression (`when { condition -> ... }`,
as shown) is really a cleaner-syntax replacement for an `if`/`else if`
chain; `when` used *with* a subject (`when (x) { 1 -> ...; 2 -> ... }`,
Kotlin's closer analog to Java's `switch`) additionally supports smart
casts on the subject inside each branch — one more real, concrete
payoff of Lesson 12's flow-sensitive typing, extended to a different
control structure.

### SE Lens

**Why does this project's own permission-status logic use plain `if`
rather than `when`, given `when` was just introduced?** Two branches,
each producing one of exactly two literal values, is precisely the
case `if`-as-an-expression already handles cleanly — reaching for
`when` here would add a construct with no real benefit for a
two-outcome decision, the same "right tool for the actual shape of the
problem" reasoning the Java series already applied when choosing the
ternary operator over a full `if`/`else` block for the identical
two-branch case.

---

## Concept Unit: The Real Permission Flow

### The Problem

With Kotlin's expression-oriented `if` and its trailing-lambda callback
style both understood, the runtime permission request can be written in
its real, idiomatic Kotlin form.

### The New Code

```kotlin
class NotificationsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityNotificationsBinding

    private val requestSmsPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            updateStatusText(isGranted)
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNotificationsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        updateStatusText(isSmsPermissionGranted())

        binding.enableNotificationsButton.setOnClickListener {
            if (isSmsPermissionGranted()) {
                updateStatusText(true)
            } else {
                requestSmsPermissionLauncher.launch(Manifest.permission.SEND_SMS)
            }
        }
    }

    private fun updateStatusText(granted: Boolean) {
        binding.notificationStatusText.text = if (granted) {
            getString(R.string.notifications_status_granted)
        } else {
            getString(R.string.notifications_status_denied)
        }
    }

    private fun isSmsPermissionGranted(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) ==
            PackageManager.PERMISSION_GRANTED
    }
}
```

### Mechanical Walkthrough

- `private val requestSmsPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted -> ... }`
  — reappearing mechanism, real syntax difference: the callback is a
  trailing lambda (Lesson 07) directly, not a separate object
  constructed and passed as an explicit second argument the way Java's
  version reads. `val`, not `var` — this property is assigned exactly
  once, at construction, and never reassigned, correctly using Lesson
  01's immutable-by-default keyword.
- `binding.enableNotificationsButton.setOnClickListener { if (...) { ... } else { ... } }`
  — reappearing trailing lambda and SAM conversion; the `if`/`else`
  inside is used as an ordinary **statement** here, not an expression —
  both branches call `updateStatusText`, a real side effect, with no
  value being produced or assigned from the `if` itself, a legitimate,
  common use of `if` in its original, Java-familiar role even in a
  language where it *can* also be an expression.
- `binding.notificationStatusText.text = if (granted) { ... } else { ... }`
  — **`if` as an expression, for real**, this lesson's own concept,
  assigned directly into a property, replacing the Java version's
  ternary operator line exactly.
- `isSmsPermissionGranted(): Boolean` — reappearing `ContextCompat.checkSelfPermission`,
  unchanged Java API call; `==` comparison against
  `PackageManager.PERMISSION_GRANTED`, identical to the Java version.

### SE Lens

**Why does the click listener's `if`/`else` stay a statement while the
status-text `if`/`else` becomes an expression, given both are the same
`if`/`else` construct?** The click listener's two branches do
different, real things (call `updateStatusText(true)` directly versus
launching a permission request) — there is no single value to
produce, only side effects to choose between, so expression form
wouldn't even apply. The status-text branches each produce exactly one
string and do nothing else — precisely the shape expression-form `if`
exists for. Recognizing which shape a piece of logic actually has,
and reaching for the matching form, is the real skill; neither form is
inherently more "Kotlin-idiomatic" than the other outside of that fit.

---

## Connect the Pieces

The full trace across this Kotlin rebuild: Lesson 05's `open`/`override`
built the project's real classes; Lesson 06's View Binding and Lesson
02's null safety removed the `findViewById` platform-type risk from
every widget reference; Lesson 07's trailing lambdas and SAM conversion
wired every listener in the app, including this lesson's own permission
callback; Lesson 08's data class replaced the entire hand-written
`InventoryItem`; Lesson 09 through 12 rebuilt the grid screen with
Kotlin's own collection types, scope functions, and null-safety tools;
and this lesson's `if`-as-expression closes the loop on the Java
series' dedicated ternary-operator lesson, showing precisely why Kotlin
never needed a separate construct for it at all.

## What Breaks Without This

Remove the `else` branch from the status-text `if`, leaving only
`if (granted) { getString(R.string.notifications_status_granted) }`
with the result still assigned to `binding.notificationStatusText.text`.
Real error:

```
error: 'if' must have both branches (with 'else') to be used as an expression
```

confirming precisely what Lesson 13's first unit stated: `if` is only
usable as an expression when every path genuinely produces a value —
an `if` with no `else`, used as a statement, is completely legal in
Kotlin; the exact same code becomes illegal the moment its result is
actually used as a value with no `else` to cover the missing case.

## Exercises

1. Rewrite `updateStatusText`'s `if`/`else` using `when` instead
   (`when (granted) { true -> ...; else -> ... }`) and confirm it
   compiles and behaves identically — direct, personal proof that
   `when` genuinely can replace a two-branch `if`, even though this
   lesson argued `if` is the better-fitting tool here.
2. Grant the permission once, relaunch `NotificationsActivity`, and
   confirm the status text correctly shows "enabled" immediately —
   the identical idempotent-check behavior the Java version proved,
   now running through Kotlin's own expression-based status logic.

## Definition of Done

- [ ] You ran the `if`-as-expression lab and can explain why Kotlin
      never needed a separate ternary operator.
- [ ] You ran the `when` lab and can state one real advantage it has
      over a Java `switch`.
- [ ] You triggered the real "must have both branches" error from an
      incomplete `if` expression.
- [ ] Tapping "Enable Low-Stock Notifications" shows the real system
      permission dialog, and both a real grant and a real denial
      correctly update the status text.
- [ ] Commit: `git commit -m "Rebuild the SMS permission flow using
      trailing-lambda callbacks and if-as-an-expression"` — explaining
      what's idiomatically different from the Java version, not just
      that the feature works.

This is the last lesson in this companion series. Every screen from the
Java version now exists in Kotlin — functionally identical, with real,
specific language differences understood precisely rather than
pattern-matched: null safety enforced by the type system instead of
left to runtime luck, `open`/`inner` inverting two of Java's own
defaults, data classes replacing hand-written boilerplate, and
`if`/`when` closing the gap Java's dedicated ternary operator existed
to fill.
