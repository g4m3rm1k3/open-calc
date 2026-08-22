# Lesson 4.5: Two One-Way Streets

- **What you will build** — no new feature, and no production code changes
  at all; every one of this project's 27 real, passing tests still passes,
  unchanged, at the end of it. Instead, this lesson proves, with real,
  executed evidence rather than a diagram, that this project's state and
  its events already move through exactly two one-way streets, never one
  two-way street: the calculator's current state travels only from
  `CalculatorViewModel` down to `CalculatorScreen`, read-only once it
  arrives, and every request to change that state travels only the
  opposite direction, as a plain description of what happened, decided by
  `CalculatorViewModel` alone. The transferable problem: it is easy to
  draw an arrow from "ViewModel" to "UI" on a diagram and call the result
  "one-way," without ever checking whether anything actually stops the
  arrow from running backward, or whether "the ViewModel decides" is a
  real, enforced guarantee instead of just a habit every caller happens to
  follow so far.
- **What you need to know first** — Lesson 3.3's `CalculatorState` and
  `nextState`, both real, pure, living in `Calculator.kt`; Lesson 4.3's
  real `CalculatorViewModel`, exposing its own state through a `by
  mutableStateOf(...)` delegate with `private set`; Lesson 1.5's real
  function-typed parameter, handing behavior to something else to call,
  the same shape `CalculatorButton`'s own `onClick` parameter still uses;
  Lesson 4.4's real, compiler-proven evidence that this project's three
  files already form a genuine layered architecture.
- **Terms used in this lesson**
  - **Unidirectional Data Flow** — an architectural rule that state and
    the requests to change it are only ever allowed to move through a
    system in one consistent shape: the current state flows from a single
    owner down to whatever displays it, read-only on the receiving end,
    and every request to change that state flows the opposite direction,
    as a plain description of what happened, decided by the owner alone.
    Why it matters: without a rule like this, a system can end up with
    several different places that can both read and directly write the
    same piece of state, and the moment two of them disagree about what a
    change should actually do, there is no way to say which one is right
    — because the design itself never picked exactly one.
  - **Event** — a message describing something that already happened (a
    specific button was pressed), never a message carrying a precomputed
    answer for what the resulting state should be. Why it matters: an
    event that only reports "this happened" forces whoever receives it to
    be the one place that decides what happens next, instead of letting
    whichever code sent the message quietly compute its own version of
    the answer.
  - **`private set`** — Kotlin's own syntax placing the `private` access
    modifier on only a property's setter, leaving its getter at whatever
    visibility the property itself declares. On a property declared
    inside a class, as both `Counter.count` and
    `CalculatorViewModel.state` are, `private` scopes to the *class* —
    only code physically inside that class's own body can use it, no
    matter which file that code sits in. Why it matters: without it,
    restricting writes to a mutable property from outside its own class
    would mean making the whole property private and hand-writing a
    second, separate method just to expose reading it — `private set`
    gets the identical real guarantee on a single ordinary `var`, with no
    extra code.
  - **`by` (property delegation)** — Kotlin's own syntax handing a
    property's actual storage and get/set behavior to a separate delegate
    object, instead of the property managing a backing field itself. Why
    it matters: `mutableStateOf(0)` alone returns a `MutableState<Int>`
    object, and reading or writing its value would mean writing `.value`
    at every single use; `by` lets a property using it read and write
    like a plain `Int` everywhere it appears, while every one of those
    reads and writes is actually being routed through the delegate
    underneath.
- **Objects and methods used**

  - **Everything else in the file, not this lesson's subject but still
    explained:**

    - **`CalculatorViewModel`**
      - *What it is:* this project's own real, permanent class owning
        the calculator's current state, independent of any one screen's
        own lifecycle.
      - *Implementation:* `class CalculatorViewModel : ViewModel() { var
        state by mutableStateOf(CalculatorState()); private set; fun
        onButtonClick(label: String) { state = nextState(state, label) }
        }`, in `CalculatorViewModel.kt` — confirmed by reading its own
        real, current content this session.
      - *Its use:* this lesson's own real, decisive subject for both
        halves of the pattern it names — the single owner state flows
        down from, and the single owner every event flows up to.
      - *Type:* a class extending `ViewModel`.
      - *Responsibility:* own this calculator's current state, expose it
        for reading, and be the one and only place that decides what a
        button press actually changes it to.
      - *Depends on:* `CalculatorState` and `nextState`, both from
        `Calculator.kt`; Compose's own `mutableStateOf`; AndroidX's own
        `ViewModel` base class.
      - *Connects to:* read by `CalculatorScreen` via
        `calculatorViewModel.state`; called by `CalculatorScreen` via
        `calculatorViewModel.onButtonClick(label)`; calls `nextState`
        internally.
      - *Shape:* the real, single crossing point this project's state
        and events both pass through, in opposite directions.

    - **`mutableStateOf`**
      - *What it is:* the real Compose function building the actual
        observable holder Compose watches for reads and writes.
      - *Implementation:* `fun <T> mutableStateOf(value: T):
        MutableState<T>` — unchanged from its own first appearance in
        this project.
      - *Its use:* builds the specific `MutableState<CalculatorState>`
        `CalculatorViewModel.state` is delegated to, via `by`.
      - *Type:* a top-level function.
      - *Responsibility:* wrap one value so any read of it can be
        tracked and any write to it can trigger recomposition wherever
        it's read.
      - *Depends on:* an initial value to wrap.
      - *Connects to:* called inside `CalculatorViewModel`; the `by`
        delegate reads its `getValue`/`setValue` operators on every
        access to `state`.
      - *Shape:* Compose's own observable-state primitive — the real
        mechanism underneath this lesson's own state-flows-down
        guarantee.

    - **`ViewModel`**
      - *What it is:* the real AndroidX base class giving a class its
        own lifecycle, independent of any one screen.
      - *Implementation:* `abstract class ViewModel`, in
        `androidx.lifecycle` — `CalculatorViewModel` extends it
        directly, unchanged by this lesson.
      - *Its use:* gives `CalculatorViewModel` the real survival
        guarantee this project already proved, so its own state can
        outlive `CalculatorScreen` being torn down and rebuilt.
      - *Type:* an abstract class.
      - *Responsibility:* outlive whatever specific screen created it,
        for as long as that screen's own real owner (an Activity, a
        navigation back-stack entry) says it should.
      - *Depends on:* nothing from Compose or any specific screen.
      - *Connects to:* extended by `CalculatorViewModel`; instantiated
        on this project's behalf by `viewModel()`, below.
      - *Shape:* AndroidX's own lifecycle-aware base class — the real
        foundation this lesson's own "single owner" claim is built on.

    - **`viewModel()`**
      - *What it is:* the real Compose function that obtains an existing
        `ViewModel` instance for the current caller, or creates one the
        first time, tied to the nearest real `ViewModelStoreOwner`.
      - *Implementation:* `@Composable fun <VM : ViewModel> viewModel(...):
        VM`, from `androidx.lifecycle.viewmodel.compose` — its default
        parameter value inside `CalculatorScreen`'s own real signature,
        unchanged by this lesson.
      - *Its use:* supplies `CalculatorScreen`'s own `calculatorViewModel`
        parameter with the one real, correct `CalculatorViewModel`
        instance for the current screen, without `CalculatorScreen` ever
        constructing one itself.
      - *Type:* a `@Composable` function.
      - *Responsibility:* find or create the one real `ViewModel`
        instance that belongs to the current caller, and hand it back —
        nothing about what that `ViewModel` actually does once handed
        back.
      - *Depends on:* an ambient `ViewModelStoreOwner` — already proven,
        real, to be the current `NavBackStackEntry` for this project's
        own calculator route.
      - *Connects to:* called once, as `CalculatorScreen`'s own default
        parameter value; the object it returns is what `CalculatorScreen`
        then reads state from and sends events to.
      - *Shape:* the real seam between this project's UI layer and its
        ViewModel layer — the one call that actually crosses it.

    - **`CalculatorScreen`**
      - *What it is:* this project's own real, top-level screen
        composable.
      - *Implementation:* `@Composable fun CalculatorScreen(mode: String
        = "Basic", calculatorViewModel: CalculatorViewModel =
        viewModel())`, in `MainActivity.kt`, unchanged by this lesson.
      - *Its use:* this lesson's own real, decisive subject for the
        receiving side of both halves of the pattern — it reads state,
        and it is the only place a button press's real event first
        appears.
      - *Type:* a `@Composable` function.
      - *Responsibility:* render whatever state `calculatorViewModel`
        currently exposes, and forward every real button press back to
        it as an event — nothing about computing a result or deciding
        what a press actually means.
      - *Depends on:* `CalculatorViewModel`, above, for both state and
        behavior.
      - *Connects to:* reads `calculatorViewModel.state`; calls
        `calculatorViewModel.onButtonClick(label)` on every keypad press;
        never calls `nextState` itself.
      - *Shape:* the real top of this project's own layered architecture
        — the one place state arrives read-only, and the one place
        events originate.

    - **`CalculatorState`**
      - *What it is:* this project's own real, immutable data class
        holding the calculator's entire current state.
      - *Implementation:* `data class CalculatorState(val display:
        Display = Display.Value("0"), val firstOperand: Int? = null, val
        pendingOperator: Operator? = null)`, unchanged by this lesson.
      - *Its use:* the exact value that flows down from
        `CalculatorViewModel` to `CalculatorScreen`, and the exact value
        `nextState` reads and returns a new copy of.
      - *Type:* a `data class`.
      - *Responsibility:* hold one complete, immutable snapshot of this
        calculator's state — nothing about who owns it or how a new one
        gets computed.
      - *Depends on:* `Display`, `Operator` — both this project's own
        already-established types.
      - *Connects to:* built and returned by `nextState`; read by
        `CalculatorScreen` through `calculatorViewModel.state`.
      - *Shape:* the plain data value both halves of this lesson's own
        pattern are actually about — moving it down, and deciding its
        next version from events moving up.

    - **`nextState`**
      - *What it is:* this project's own real, pure function computing
        the calculator's next state from its current one and a pressed
        label.
      - *Implementation:* `fun nextState(current: CalculatorState, label:
        String): CalculatorState`, a `when` expression over four real
        branches, unchanged by this lesson.
      - *Its use:* this lesson's own real, decisive proof that exactly
        one place decides what any event actually means — called from
        exactly one real call site in this entire project.
      - *Type:* a top-level, pure function.
      - *Responsibility:* compute, and only compute, the one correct
        next `CalculatorState` for a given current state and label —
        nothing about rendering, nothing about ownership, nothing about
        who's allowed to call it.
      - *Depends on:* a `CalculatorState` and a `String` label; no
        Compose or Android dependency at all.
      - *Connects to:* called only by `CalculatorViewModel.onButtonClick`
        — confirmed for real this session by an actual, executed `grep`
        across every file in this project that could plausibly call it.
      - *Shape:* the single real authority this project's own events are
        always decided by — the actual mechanism behind "the ViewModel
        decides," not just a description of it.

    - **`onButtonClick`**
      - *What it is:* this project's own real, permanent method
        receiving every keypad press as a real event.
      - *Implementation:* `fun onButtonClick(label: String) { state =
        nextState(state, label) }`, inside `CalculatorViewModel`,
        unchanged by this lesson.
      - *Its use:* the one real method `CalculatorScreen` ever calls to
        report that a button was pressed — never anything that hands
        back a precomputed state.
      - *Type:* an instance method.
      - *Responsibility:* receive a real button-press event, described
        only by which label was pressed, and be the one place that turns
        it into an actual state change.
      - *Depends on:* `nextState`; the current `state` it already owns.
      - *Connects to:* called by `CalculatorScreen`, once per keypad
        press; calls `nextState` and reassigns `state`.
      - *Shape:* the real, single doorway every event this project has
        must pass through before it can change anything.

---

## Concept Unit: State Flows Down, Read-Only

### The Problem

`CalculatorViewModel.state` has always been described as something
`CalculatorScreen` "reads." That's a fact about how the code is
currently used — not a proof that it's the only thing the code is
allowed to do. Nothing has ever actually tried writing to `state` from
anywhere else, and it isn't even obvious yet what "anywhere else" would
mean: `CalculatorScreen` sits in a completely different file than
`CalculatorViewModel`, but is that actually what matters — the file — or
is it something else about `CalculatorScreen` not being part of the
`CalculatorViewModel` class at all?

> **Stop and think:** `CalculatorViewModel.kt` declares `var state by
> mutableStateOf(CalculatorState()); private set`. Given what `private`
> already does when it sits in front of a whole class or a whole
> function, what do you think it restricts here, sitting only in front
> of `set`? Suppose a plain top-level function lived in the exact same
> file as `CalculatorViewModel`, but wasn't written inside the class
> itself — would you predict it could write `state` directly, or would
> it be blocked the same way `CalculatorScreen`, in a genuinely different
> file, would be? What would that answer tell you about whether
> `private`'s real boundary here is the *file* or something else?

### Introduce the Concept in Isolation

A real, small, throwaway class, proving the general mechanism with
nothing from this project involved at all:

```kotlin
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class Counter {
    var count by mutableStateOf(0)
        private set

    fun increment() {
        count = count + 1
    }
}

fun main() {
    val counter = Counter()
    counter.increment()
    counter.increment()
    println(counter.count)
}
```

Compiled completely standalone, with only Compose's own real Runtime
artifact on the classpath — nothing else this project uses:

```
$ kotlinc Counter.kt -cp runtime_extract/classes.jar -include-runtime -d counter.jar
(compiles clean, no warnings/errors)
exit code: 0
```

A real, clean compile. Now the first real test of the Socratic
question above: the exact same `Counter` class, in one real file
together with a `main` that tries to write to it directly — same file,
but outside the class body entirely, the same way `increment()` is
written *inside* it:

```kotlin
// SameFileAttack.kt — same file as Counter, but main() is outside the class
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

class Counter {
    var count by mutableStateOf(0)
        private set

    fun increment() {
        count = count + 1
    }
}

fun main() {
    val counter = Counter()
    counter.count = 99
    println(counter.count)
}
```

Compiled the same real way as `Counter.kt` itself, with nothing
different about the classpath:

```
$ kotlinc SameFileAttack.kt -cp runtime_extract/classes.jar -include-runtime -d same_file_attack.jar
SameFileAttack.kt:16:13: error: cannot access 'count': it is private in 'Counter'.
    counter.count = 99
            ^^^^^
exit code: 1
```

A real, genuine compile error — even though this `main` sits in the
exact same file `Counter` itself is declared in. That already answers
the Socratic question: `private set` is not a file-level rule at all;
`main` here fails for the identical reason `increment()`, a few lines
above it in that same file, succeeds — `increment()` is written *inside*
`Counter`'s own class body, and `main` is not. Now two more real,
separate files, confirming the same class-level boundary holds once file
identity is added back in. First, a file that only reads:

```kotlin
// CounterReader.kt — a different file, only reading
fun main() {
    val counter = Counter()
    counter.increment()
    println(counter.count)
}
```

Compiled the same real way, against the `Counter` class this file never
declared itself:

```
$ kotlinc CounterReader.kt -cp "counter.jar:runtime_extract/classes.jar" -include-runtime -d counter_reader.jar
(compiles clean, no warnings/errors)
exit code: 0
```

A real, clean compile — reading `count` from outside the class, in a
different file this time, is still entirely allowed. Now a second file,
attempting to write instead:

```kotlin
// CounterAttack.kt — a different file, trying to write directly
fun main() {
    val counter = Counter()
    counter.count = 99
    println(counter.count)
}
```

The identical real compile command, aimed at this file instead:

```
$ kotlinc CounterAttack.kt -cp "counter.jar:runtime_extract/classes.jar" -include-runtime -d counter_attack.jar
CounterAttack.kt:3:13: error: cannot access 'count': it is private in 'Counter'.
    counter.count = 99
            ^^^^^
exit code: 1
```

The identical real rejection as `SameFileAttack.kt`'s own, for the
identical real reason — this file, too, is outside `Counter`'s own class
body. Three real compiles now agree: reading `count` compiles clean
from anywhere; writing it only ever compiles from inside `Counter`
itself, regardless of which file the attempt is written in. This is
called **Unidirectional Data Flow**'s first half — state moving one way,
down to whoever reads it, with the write side closed off to everything
outside the one class that owns it.

Now the same real question, asked of this project's own actual code
instead of an invented one. Temporarily, `MainActivity.kt`'s real
`CalculatorScreen` had one line added, immediately after the line that
already reads `calculatorViewModel.state`:

```kotlin
val state = calculatorViewModel.state
calculatorViewModel.state = CalculatorState()   // ← temporary, illegal line
val displayColor by animateColorAsState(
```

That one extra line was compiled through this real project's own real
build, exactly the way any real edit would be:

```
$ ./gradlew :app:compileDebugKotlin
> Task :app:compileDebugKotlin FAILED
e: .../MainActivity.kt:118:5 Cannot assign to 'state': the setter is private in 'CalculatorViewModel'
BUILD FAILED
exit code: 1 (build failure)
```

The real project's own compiler rejects the exact same kind of write, for
the exact same real reason — `state`'s own `private set`. The illegal
line was removed immediately after this transcript was captured, and a
follow-up real compile confirmed the project was back to its normal,
passing state before anything else in this lesson continued.

### Discard the Throwaway Example

`Counter.kt`, `SameFileAttack.kt`, `CounterReader.kt`, `CounterAttack.kt`,
and every compiled `.jar` are deleted now — none of them are part of
this project and none of them will appear again. The temporary line
added to `MainActivity.kt` was never committed and is already gone.
Real, saved in `verification/4.5/lab1_counter.kt`,
`verification/4.5/step1_lab1_counter_compiles.txt`,
`verification/4.5/break0_same_file_attack.kt`,
`verification/4.5/break0_same_file_attack_fails.txt`,
`verification/4.5/step1b_counter_reader.kt`,
`verification/4.5/step1b_counter_reader_compiles.txt`,
`verification/4.5/break1_counter_attack.kt`,
`verification/4.5/break1_counter_attack_fails.txt`, and
`verification/4.5/break2_real_state_direct_write_fails.txt`.

### Mechanical Walkthrough

- `import androidx.compose.runtime.getValue` / `setValue` — the two real
  operator functions a `by`-delegated `var` actually compiles down to
  calling; without both imported, `by mutableStateOf(...)` on a `var`
  wouldn't resolve at all.
- `import androidx.compose.runtime.mutableStateOf` — the real function
  this whole lab is testing the guarantees of.
- `class Counter` — a brand-new, throwaway class declaration, existing
  only for this one lab.
- `var count by mutableStateOf(0)` — declares a mutable property named
  `count`, then hands its actual storage to the `MutableState<Int>`
  object `mutableStateOf(0)` returns, via `by`. Every future read of
  `count` becomes a read through that delegate; every future write to it
  becomes a write through that same delegate.
- `private set` — restricts only the compiler-generated setter for
  `count` to `Counter`'s own class body; the getter stays exactly as
  public as the property declaration itself (here, the class's own
  default, public visibility).
- `fun increment()` — an ordinary instance method, declared inside
  `Counter` itself, meaning code inside it can still use `count`'s own
  private setter freely — `private` restricts access from *outside the
  class*, never the declaring class's own internal code.
- `count = count + 1` — reads `count`'s current value, computes one more
  than it, and writes the result back — a write that's allowed here only
  because this line sits inside `Counter`'s own class body.
- `fun main()` (in `Counter.kt` itself) — the real JVM entry point this
  first lab is run through.
- `val counter = Counter()` — constructs one real `Counter` instance.
- `counter.increment()`, called twice — each call runs the real write
  above, from inside the class, succeeding both times.
- `println(counter.count)` — reads `count`; allowed regardless of where
  this line sits, since only writes are restricted.
- `fun main()`, in the separate `SameFileAttack.kt` — a second, real copy
  of the exact same file, this time with an extra top-level function
  sitting alongside `Counter`, outside its class body entirely.
- `counter.count = 99`, in `SameFileAttack.kt` — attempts the identical
  kind of write `count = count + 1` performed above, but from a function
  that isn't part of `Counter`'s own class, despite living in the same
  file.
- `error: cannot access 'count': it is private in 'Counter'`, from
  `SameFileAttack.kt` — the real, literal compiler diagnostic, proving
  same-file placement alone doesn't grant access; only being inside the
  class does.
- `counter.count = 99`, again, in the separate `CounterAttack.kt` — the
  identical kind of write, now also from a different file, confirming
  the same class-level rule holds regardless of file.
- `error: cannot access 'count': it is private in 'Counter'`, from
  `CounterAttack.kt` — the identical real diagnostic as
  `SameFileAttack.kt`'s own, for the identical real reason: neither
  function is written inside `Counter`'s class body.
- `calculatorViewModel.state = CalculatorState()`, temporarily added to
  the real `MainActivity.kt` — the exact same shape of external write,
  this time against this project's own real class instead of the
  invented `Counter`, from `CalculatorScreen`, which is neither in the
  same file as `CalculatorViewModel` nor part of its class.
- `Cannot assign to 'state': the setter is private in 'CalculatorViewModel'`
  — the real project's own compiler, rejecting it for the identical real
  reason. The wording differs slightly from `Counter`'s own error
  (`cannot access` versus `Cannot assign to`) — a real, observed
  difference in exactly how Kotlin phrases the same underlying rejection
  when compiling a whole module's files together from source, versus
  compiling one file against an already-compiled `.jar` — but all three
  rejections reject the exact same thing: a write to a property whose
  setter is `private`, attempted from outside the class that declares it.

### CS Lens

Exposing a value's read side while sealing off its write side, so only
one specific piece of code can ever change it, is a real, concrete
instance of **encapsulation** — not "hiding details" in the abstract, but
one particular, checkable rule: reads are open to everyone, writes are
open to exactly one owner.

```
Also recognized in: a bank's own ledger, where any teller can look up a
balance but only the ledger's own posting process can change one; a
version-control repository's read replicas, servable to anyone, while
writes are only ever accepted by the one real primary; a thermostat's
displayed temperature, readable by anyone standing in the room, while
only its own internal control loop ever changes what it's set to
```

### SE Lens

The alternative — a plain, fully public `var state` with no `private
set` at all — would still compile, and would still work today, since
`CalculatorScreen` is currently this project's only real caller and it
already only ever reads `state` or goes through `onButtonClick`. The real
cost is what a fully public `var` doesn't rule out: nothing would stop a
future edit, made in a hurry, from writing `calculatorViewModel.state =
someShortcutValue` directly inside `CalculatorScreen`, skipping
`nextState` entirely and producing a state this project's own
`CalculatorStateTest.kt` never actually tested. `private set` doesn't
cost this project anything today — `CalculatorScreen` never needed write
access to begin with — but it turns "please don't write to this
directly" from a rule a future contributor has to remember into a rule
the compiler already enforces, proven concretely by this unit's own
three real, rejected compiles.

### Commands Needed

- `kotlinc <file>.kt -cp <jar1>:<jar2> -include-runtime -d <file>.jar` —
  compiles a standalone Kotlin file, resolving any real external types it
  references against the exact jars listed after `-cp`
  (colon-separated), bundling the Kotlin runtime into the output so it
  could run standalone afterward.
- `./gradlew :app:compileDebugKotlin` — compiles this real project's own
  main source set only, without running any tests or building an `.apk`
  — the fastest real way to check whether this project's own code still
  compiles after a change.

### Run It

All five real commands and their real output already shown above in
full; transcripts saved at
`verification/4.5/step1_lab1_counter_compiles.txt`,
`verification/4.5/break0_same_file_attack_fails.txt`,
`verification/4.5/step1b_counter_reader_compiles.txt`,
`verification/4.5/break1_counter_attack_fails.txt`, and
`verification/4.5/break2_real_state_direct_write_fails.txt`.

### Connect the Pieces

A throwaway `Counter` and this project's own real `CalculatorViewModel`
enforce the identical real rule, for the identical real reason: a
property with `private set` can be read from anywhere, but written only
from inside the one class that declares it — not merely the one file,
proven by `SameFileAttack.kt`'s own real, rejected compile. That's the
first of this lesson's two one-way streets, proven twice — once
generically, once
against this project's own real, current code. The next unit asks what
happens on the other street: if `CalculatorScreen` can never write
`state` directly, how does pressing a button ever change anything at
all?

---

## Concept Unit: Events Flow Up, Decided by One Owner

### The Problem

The previous unit proved `CalculatorScreen` can't write `state` directly.
But `nextState` is a plain, public, top-level function — nothing stops
`CalculatorScreen` from calling it directly either, computing a finished
`CalculatorState` itself and handing it to `CalculatorViewModel` some
other way. If that would still work, is "the ViewModel decides" a real
guarantee, or just a description of how this project happens to be
written today?

> **Stop and think:** `CalculatorViewModel.onButtonClick(label: String)`
> takes a plain label — `"7"`, `"+"`, `"="` — not a finished
> `CalculatorState`. Given that `nextState` is already public and already
> pure, what would change, in practice, if `CalculatorScreen` computed
> `nextState(state, label)` itself and only handed the *result* to
> `CalculatorViewModel`? If two completely different pieces of code both
> needed to react to a button press someday, and each one computed its
> own version of "what happens next" instead of asking one shared
> function, what could go wrong that couldn't go wrong today, with only
> one real caller?

### Introduce the Concept in Isolation

Two real, small, throwaway designs, proving the same general point with
nothing from this project involved:

```kotlin
class Vault(initialBalance: Int) {
    var balance = initialBalance
        private set

    fun deposit(amount: Int) {
        if (amount <= 0) return
        balance = balance + amount
    }
}

class OpenVault(var balance: Int)

fun depositViaCarefulCaller(vault: OpenVault, amount: Int) {
    if (amount <= 0) return
    vault.balance = vault.balance + amount
}

fun depositViaCarelessCaller(vault: OpenVault, amount: Int) {
    vault.balance = vault.balance + amount
}

fun main() {
    val vault = Vault(100)
    vault.deposit(-5)
    println("Vault.balance after depositing -5: ${vault.balance}")

    val openVaultA = OpenVault(100)
    depositViaCarefulCaller(openVaultA, -5)
    println("OpenVault (careful caller) balance after depositing -5: ${openVaultA.balance}")

    val openVaultB = OpenVault(100)
    depositViaCarelessCaller(openVaultB, -5)
    println("OpenVault (careless caller) balance after depositing -5: ${openVaultB.balance}")
}
```

Compiled and run for real, no classpath needed at all beyond the Kotlin
standard library:

```
$ kotlinc Vault.kt -include-runtime -d vault.jar
(compiles clean, no warnings/errors)
exit code: 0

$ java -jar vault.jar
Vault.balance after depositing -5: 100
OpenVault (careful caller) balance after depositing -5: 100
OpenVault (careless caller) balance after depositing -5: 95
exit code: 0
```

A real, concrete divergence. `Vault.deposit(-5)` always applies the same
rule — reject anything that isn't positive — no matter who calls it,
because that rule lives in exactly one place: inside `deposit` itself.
`OpenVault`, by contrast, has no such rule of its own at all; each
*caller* has to remember to apply it. One caller remembered; a second,
otherwise reasonable-looking caller didn't, and `-5` was silently
accepted as a real deposit, shrinking the balance. Both callers describe
themselves as "depositing" — only one of them is actually guaranteed to
mean the same thing every time. This is called an **event**: `deposit
(amount)` describes an intent — "someone wants to deposit this many" —
and lets `Vault` itself be the one place that decides what actually
happens; `vault.balance = vault.balance + amount` is the opposite — the
caller computes the finished answer and simply overwrites the old one,
carrying no guarantee that every caller computes it the same way.

Now the same real question, asked of this project's own actual code.
`CalculatorViewModel.kt`'s `onButtonClick` takes a plain `label: String`
— an event, describing only which button was pressed — and is the one
place that calls `nextState`:

```
$ grep -n "nextState" MainActivity.kt
(no output — zero matches)
exit code: 1

$ grep -n "nextState" CalculatorViewModel.kt
13:        state = nextState(state, label)
exit code: 0
```

A real, executed search across this entire project's own two files that
could plausibly call `nextState` confirms it: `MainActivity.kt` — where
`CalculatorScreen` lives — never calls it, not once; `CalculatorViewModel
.kt` calls it in exactly one place. Every one of this project's sixteen
real keypad buttons sends the same kind of event — a label — through the
same one method, into the same one function, every single time.

### Discard the Throwaway Example

`Vault.kt` and its compiled `vault.jar` are deleted now — neither is part
of this project and neither will appear again. Real, saved in
`verification/4.5/lab2_vault.kt` and
`verification/4.5/step2_lab2_vault_run.txt`.

### Mechanical Walkthrough

- `class Vault(initialBalance: Int)` — a throwaway class with a real
  primary constructor parameter, used once to set `balance`'s own
  starting value.
- `var balance = initialBalance` with `private set` — the same real
  guarantee the previous unit already proved: writable only from inside
  `Vault`'s own class body, regardless of which file a would-be writer
  sits in.
- `fun deposit(amount: Int)` — the one real method anyone outside `Vault`
  can call to change `balance`.
- `if (amount <= 0) return` — an ordinary guard clause: if the condition
  holds, the function exits immediately, doing nothing further; this is
  the actual rule this unit is about — the one place `Vault` decides a
  non-positive deposit means "do nothing."
- `balance = balance + amount` — reads the current balance, adds the
  requested amount, writes the result back — allowed here because this
  line, like the previous unit's `Counter.increment`, sits inside the
  property's own declaring class.
- `class OpenVault(var balance: Int)` — a second throwaway class, this
  time with no `private set` at all — its `balance` is writable from
  anywhere, by anyone, with no rule attached to that write at all.
- `fun depositViaCarefulCaller(vault: OpenVault, amount: Int)` — a
  free function, not a method on `OpenVault` itself, taking the vault to
  modify as a parameter — this caller re-implements `Vault`'s own guard
  clause by hand.
- `fun depositViaCarelessCaller(vault: OpenVault, amount: Int)` — an
  identically-named kind of operation, but this one forgot the guard —
  nothing in `OpenVault` itself required it to remember.
- `vault.balance = vault.balance + amount`, in both caller functions —
  the exact same read-compute-write shape `Vault.deposit` used
  internally, except performed here from *outside* `OpenVault`'s own
  file, which its missing `private set` allows either caller to do.
- `vault.deposit(-5)` — calls the one real method that can change
  `balance`, passing an event ("deposit this amount") that the method
  itself rejects.
- `depositViaCarefulCaller(openVaultA, -5)` /
  `depositViaCarelessCaller(openVaultB, -5)` — two separate real callers,
  each handed the identical amount, each computing its own answer
  independently.
- `println(...)`, three times — reports each vault's real, final balance
  after the exact same `-5` was "deposited" three different ways.
- `grep -n "nextState" MainActivity.kt` — searches this project's own
  real UI file, line by line, for the literal text `nextState`; `-n`
  prints the matching line number alongside any match found.
- `(no output — zero matches)` / `exit code: 1` — `grep`'s own real,
  standard convention: exit code `1` means the pattern was not found
  anywhere in the file, not that the command itself failed.
- `grep -n "nextState" CalculatorViewModel.kt` — the identical real
  search, aimed at this project's own ViewModel file instead.
- `13:        state = nextState(state, label)` / `exit code: 0` — a real
  match, on line 13, with `grep`'s own convention for "found it at least
  once": exit code `0`.

### CS Lens

A single function that owns the entire decision for "what does this
kind of change actually mean," called by every caller instead of each
caller computing its own version, is the real, concrete idea behind
**single authority over a state transition** — the same idea a
**reducer** embodies in event-driven architectures: one function, one
real place state transitions are decided, regardless of how many
different places might want to trigger one.

```
Also recognized in: a database's own query planner, the single decider
of how a query actually executes regardless of which client sent the SQL;
a multiplayer game server treating itself as authoritative over game
state so no client can simply report "my score is now 500"; a
version-control system's merge algorithm being the one real decider of
merged content, regardless of whose patch happens to arrive first; the
Actor model, where an actor's own message handler is the only code
ever allowed to mutate that actor's internal state
```

### SE Lens

The alternative — letting `CalculatorScreen` compute
`nextState(state, label)` itself and hand `CalculatorViewModel` the
finished result — would still work today, and would arguably be less
code: `onButtonClick` could disappear entirely. The real cost only shows
up the moment a second real caller of a state change exists. This
project's BRD already plans more calculator functionality ahead — a
scientific keypad, a matrix mode — and each one is a real, future
candidate for a second place that might want to trigger a state change.
If each computed its own transition independently, the way
`depositViaCarelessCaller` did above, there would be nothing stopping
two genuinely different pieces of code from disagreeing about what
pressing the same button means, because the actual decision would no
longer live in exactly one place. Keeping `onButtonClick` as the single
real caller of `nextState` costs this project nothing today, since it
has never needed a second caller — but it's worth stating honestly: that
discipline has only ever been tested against one real caller so far, the
same way this project's own accessibility work once flagged an unused
color as an honest, open assumption rather than a proven guarantee.

### Commands Needed

- `grep -n "<pattern>" <file>` — searches a file, line by line, for
  literal or pattern text; `-n` prefixes each match with its real line
  number. A real match sets `grep`'s own exit code to `0`; no match at
  all sets it to `1` — a search that legitimately finds nothing is not a
  failed command, and reading the exit code is how a script (or a
  session like this one) tells the two apart without a human reading the
  output.

### Run It

Both real commands and their real output already shown above in full;
transcripts saved at `verification/4.5/step2_lab2_vault_run.txt` and
`verification/4.5/step3_grep_nextstate_call_sites.txt`.

### Connect the Pieces

`Vault.deposit` and this project's own real `onButtonClick` enforce the
identical real rule: one function receives an event describing what
happened, and that one function alone decides what it means — proven
generically by a careless second caller silently breaking `OpenVault`,
and proven against this project's own real code by a real search finding
exactly one place `nextState` is ever called. That's this lesson's
second one-way street: events moving up, from `CalculatorScreen` to
`CalculatorViewModel`, decided by exactly one owner every single time.

---

## Connect the Pieces

Press "7," then "+," then "3." The label `"7"` leaves `CalculatorScreen`
as a real event, carried by the exact same kind of function-typed
parameter this project already proved hands behavior to something else
to call — `CalculatorButton`'s own `onClick` — up into
`calculatorViewModel.onButtonClick("7")`. Inside
`CalculatorViewModel`, and nowhere else, `onButtonClick` calls
`nextState(state, "7")` — the one real function this whole project trusts
to decide what a label means — and reassigns `state` to whatever it
returns. That reassignment is only legal because this exact line sits
inside `CalculatorViewModel`'s own class body; the first unit's own
three real, rejected compiles proved that same write fails from
anywhere else, same file or not. The new `CalculatorState` then flows
the other way: down from
`CalculatorViewModel`, back into `CalculatorScreen`, through the same
`calculatorViewModel.state` read every recomposition already relies on.
`CalculatorScreen` never computed that new state itself, and it never
wrote it directly — it only ever sent an event up, and read a value back
down. Press "+," then "3," then "=," and the exact same loop runs three
more times, each one a label going up and a `CalculatorState` coming back
down, always through the same two doorways. Nothing about this loop was
built by this lesson — every real line it examined already existed,
unchanged, before this lesson began. What this lesson proved, with real,
executed evidence instead of a diagram, is that the loop this project
already has really does only run in one direction on each of its two
streets, and that both directions are enforced by the compiler, not
merely followed by convention.
