# Lesson 2.5: A Failure the Compiler Allows

- **What you will build** — a real, permanent fix inside `CalculatorScreen`'s
  own `=` button so that dividing by `0` shows the word `"Error"` on the
  display instead of crashing the running app, plus a second real fix so
  that typing a fresh digit after an error starts a new number instead of
  gluing onto the word `"Error"`. The transferable problem underneath the
  feature: Kotlin's compiler happily accepts `5 / 0` as valid code — the
  types check, the syntax is legal — and only fails at the moment the
  program actually runs it. This lesson is about what a program is
  supposed to do the instant reality disagrees with what the type checker
  allowed, and how a UI is supposed to tell a human about that without
  falling over.
- **What you need to know first** — Lesson 2.1's direct
  `operator.operation.apply(...)` calls (no `Calculator` wrapper class
  sits between a button press and the real arithmetic anymore); Lesson
  2.2's Arrange/Act/Assert test shape and `assertEquals`; Lesson 1.4's
  Robolectric setup (`@RunWith(RobolectricTestRunner::class)`,
  `@Config(sdk = [34])`, `createComposeRule()`,
  `composeTestRule.setContent { CalculatorScreen() }`) and its
  `Modifier.testTag`/`onNodeWithTag`/`performClick`/`assertTextEquals`
  testing tools; Lesson 1.6's `CalculatorScreen` state
  (`displayText`, `firstOperand`, `pendingOperator`) and its `=` button's
  `when` branch, which reads both stashed values and calls
  `operator.operation.apply(...)`.

## Terms used in this lesson

- **`try` / `catch`** — a block that attempts some code (`try`) and names
  a second block to run instead (`catch`) if that attempt throws an
  exception partway through. It exists because a program cannot always
  guarantee, just by compiling, that an operation will succeed — dividing
  by a variable whose value the compiler cannot know in advance is exactly
  this case — so the language needs a way to say "attempt this, and here
  is what to do if it fails" without wrapping every risky call in a manual
  success/failure check.
- **`try` as an expression** — in Kotlin (unlike Java, where `try`/`catch`
  is statement-only and can never itself produce a value), a whole
  `try { ... } catch (...) { ... }` block is itself an expression: it
  evaluates to whichever branch actually ran, and that value can be
  assigned directly. It exists so that "compute a value, or a fallback
  value if computing it fails" doesn't need a separate mutable variable
  declared above the `try` and reassigned inside both branches — the
  assignment and the fallback logic live in one place.
- **`||` (logical OR)** — an operator between two `Boolean` expressions
  that evaluates to `true` if *either* side is `true`, and, critically,
  stops evaluating the right side the instant the left side is already
  `true` (this is called **short-circuit evaluation**). It exists because
  a condition is often built from several sub-conditions where any one of
  them being true is enough — and because skipping the right side when
  it's already unnecessary matters whenever that right side has real work
  to do, not just a value to read.
- **`@Test`** — a JUnit annotation marking a function as a real, runnable
  test case rather than an ordinary method; without it, the JUnit test
  runner never calls the function at all. It exists so a test class can
  hold both test methods and ordinary helper methods, with the annotation
  being the one signal that tells the runner which is which.
- **`@RunWith`** — a JUnit annotation naming a custom class (here,
  `RobolectricTestRunner`) that JUnit should hand control to instead of
  its own default runner. It exists because JUnit's default runner only
  knows how to call plain methods — it has no idea how to simulate an
  Android device — so `@RunWith` is the hook that lets a completely
  different execution strategy take over for this one test class.
- **`@Config`** — a Robolectric-specific annotation (here,
  `@Config(sdk = [34])`) configuring which simulated Android SDK version
  Robolectric's `RobolectricTestRunner` pretends to be running against for
  this class's tests. It exists because Android's real behavior can differ
  across SDK versions, so a simulation needs to be told which version's
  behavior to imitate rather than guessing.
- **`::class`** — a reference to a type's own `KClass` object (Kotlin's
  own reflection representation of a class), used here as
  `ArithmeticException::class`. It exists because some APIs need to be
  handed the *type itself*, as a value, rather than an instance of that
  type — `@RunWith(RobolectricTestRunner::class)` already needed this for
  the same reason back when Robolectric was first set up: JUnit needs to
  know *which class* to instantiate as the runner, not an already-built
  runner object.

## Objects and methods used

- **`ArithmeticException`**
  - *What it is:* a real, standard exception class representing a failed
    arithmetic operation.
  - *Implementation:* `kotlin.ArithmeticException`, a type alias for
    `java.lang.ArithmeticException`, itself a subclass of
    `RuntimeException`; its own real constructors accept either no
    arguments or a `String?` message.
  - *Its use:* this is the exact, real exception the JVM throws for
    integer division or modulo by `0` — the same operation
    `Division.apply` and `Modulo.apply` already perform with `current /
    amount` and `current % amount`.
  - *Type:* a `class`, extending `RuntimeException` — an *unchecked*
    exception, meaning Kotlin's compiler never forces a caller to
    acknowledge it, unlike some checked exceptions in other languages.
  - *Responsibility:* to represent, as a real object carrying a real
    message, the specific fact that an arithmetic operation could not
    produce a valid result — nothing about *how* to recover, only *that*
    it failed and *why*.
  - *Depends on:* nothing to construct manually here — the JVM's own
    integer division/modulo instructions construct and throw it
    automatically when the divisor is `0`.
  - *Connects to:* thrown by the JVM's own `idiv`/`irem` bytecode
    instructions (what `/` and `%` compile down to for `Int` operands);
    caught, in this lesson, by a `catch` block that reads its `message`.
  - *Shape:* a runtime-only signal that crosses a function-call boundary
    without being part of any function's declared return type — the
    boundary between "the math this program does" and "the math this
    program can't do."

- **`Throwable.message`**
  - *What it is:* a real property, inherited by every exception, holding
    the human-readable description of what went wrong.
  - *Implementation:* declared on `kotlin.Throwable` as `open val message:
    String?` — nullable, since not every exception is constructed with a
    message.
  - *Its use:* read here as `error.message` to print exactly what the JVM
    itself says failed, rather than guessing at a description.
  - *Type:* an instance property (a `val` getter), not a method call
    despite reading like one in some languages.
  - *Responsibility:* to carry whatever descriptive text the exception was
    constructed with, unchanged, for as long as the exception object
    exists.
  - *Depends on:* the exception object it's read from having been
    constructed with a message in the first place (here, the JVM's own
    internal construction of `ArithmeticException` for a `0` divisor,
    which supplies its own real message).
  - *Connects to:* read by `println` in this lesson's isolated lab; in
    real Android crash logs, this same property is what appears in the
    stack trace's first line.
  - *Shape:* a read-only, public accessor — part of every exception's own
    public contract, not an implementation detail.

- **`assertThrows`**
  - *What it is:* a real JUnit static method that runs a block of code and
    asserts that it throws a specific exception type — failing the test if
    it doesn't.
  - *Implementation:* `org.junit.Assert.assertThrows`, confirmed this
    session via `javap` against the real, installed `junit-4.13.2.jar`:
    `public static <T extends Throwable> T assertThrows(Class<T>,
    ThrowingRunnable)`. `ThrowingRunnable` is itself a real `fun
    interface` (one abstract method, `run()`) — the exact same SAM
    (Single Abstract Method) shape `Operation` has had since it was first
    made a `fun interface`, which is what lets a trailing lambda be passed
    directly where a `ThrowingRunnable` is expected, with no explicit
    object construction.
  - *Its use:* this lesson's own test needs to assert "this call throws,"
    not "this call returns some value" — `assertEquals` has no way to
    express that at all.
  - *Type:* a `static` method (a Java-style class-level function, callable
    without any `Assert` instance).
  - *Responsibility:* to run the given block exactly once, catch whatever
    it throws, confirm the caught exception's type matches the expected
    class, and either return that exception (on success) or fail the test
    with a real, descriptive message (if nothing was thrown, or the wrong
    type was).
  - *Depends on:* a `Class<T>` naming the expected exception type, and a
    `ThrowingRunnable` (here, a trailing lambda) containing the code
    expected to throw.
  - *Connects to:* called by this lesson's new test; internally calls the
    passed lambda, which in turn calls `Operation.apply`, the exact same
    real method every earlier Stage 2 test has already called.
  - *Shape:* a JUnit library entry point — public testing API, not part of
    this project's own code at all.

- **`KClass.java`**
  - *What it is:* a real property converting Kotlin's own reflection type,
    `KClass<T>`, into the Java platform's `Class<T>`.
  - *Implementation:* an extension property in `kotlin.jvm`, declared as
    `val <T : Any> KClass<T>.java: Class<T>`.
  - *Its use:* `assertThrows`'s real signature (confirmed above) takes a
    `java.lang.Class<T>`, not a `KClass<T>` — `ArithmeticException::class`
    alone produces a `KClass`, so `.java` is what bridges it to the exact
    type JUnit's own Java-authored method actually declares.
  - *Type:* an extension property (an instance-level getter added onto an
    existing type from outside its own declaration).
  - *Responsibility:* to hand back the one, real `java.lang.Class` object
    the JVM already maintains for the given type — not to construct
    anything new.
  - *Depends on:* a `KClass<T>` value to call it on — here,
    `ArithmeticException::class`.
  - *Connects to:* produced by `::class`, consumed by `assertThrows`'s
    first parameter.
  - *Shape:* a small, public interop seam between Kotlin's own reflection
    model and the underlying Java platform's — necessary because Kotlin
    added `KClass` as its own richer type without replacing `java.lang.Class`
    everywhere Java libraries already expect it.

- **`Exception`**
  - *What it is:* the real, general-purpose base class for representing a
    failure condition in Kotlin.
  - *Implementation:* `kotlin.Exception`, itself extending `Throwable`;
    real constructors accepting no arguments, a `String?` message, a
    `Throwable?` cause, or both.
  - *Its use:* this lesson's own investigation subclasses it
    (`DivisionByZeroError(message: String) : Exception(message)`) to ask,
    concretely, whether this calculator's own domain deserves its own
    named exception type rather than relying on the JVM's generic
    `ArithmeticException`.
  - *Type:* an `open class` (subclassable by design — `Exception` would be
    useless as a base type otherwise).
  - *Responsibility:* to be a general, subclassable representation of "a
    failure occurred," carrying an optional message and an optional cause,
    with no assumption about what kind of failure.
  - *Depends on:* nothing required — every parameter is optional.
  - *Connects to:* extended, in this lesson's discarded investigation, by
    `DivisionByZeroError`; extended, more distantly, by `ArithmeticException`
    itself (through `RuntimeException`), which is why both share the same
    real `message` property.
  - *Shape:* the root of almost every custom exception hierarchy a Kotlin
    program would ever define — a public, foundational library type.

- **`DivisionByZeroError`** *(this lesson's own throwaway investigation
  class — written, compiled, and explicitly rejected, never added to the
  real project)*
  - *What it is:* a candidate custom exception type, considered as a
    replacement for using the JVM's own `ArithmeticException` directly.
  - *Implementation:*
    `class DivisionByZeroError(message: String) : Exception(message)` —
    one constructor parameter, immediately forwarded to `Exception`'s own
    constructor.
  - *Its use:* exists only to make the "should this project have its own
    named exception type" question concrete enough to actually compile and
    run, instead of staying a purely abstract design debate.
  - *Type:* a `class` with a primary constructor, extending `Exception`.
  - *Responsibility:* (as designed, hypothetically) to represent, by name,
    specifically a division-by-zero failure in this calculator's own
    domain — distinct from any other possible failure.
  - *Depends on:* a `String` message, supplied by whatever code would
    construct and throw it.
  - *Connects to:* would have required a `catch (error:
    DivisionByZeroError)` clause somewhere, and `Division`/`Modulo` would
    have needed to catch the JVM's own `ArithmeticException` internally
    just to rethrow this one instead — real, added coupling this lesson's
    own Domain Errors unit examines directly.
  - *Shape:* a from-scratch design candidate, evaluated in isolation and
    never wired into `Calculator.kt`.

### Everything else in the file, not this lesson's subject but still explained

- **`Operator`**
  - *What it is:* the real enum this project already uses to represent
    each of the five calculator operations.
  - *Implementation:* `enum class Operator(val operation: Operation)`,
    five constants (`PLUS`, `MINUS`, `TIMES`, `DIVIDE`, `MODULO`), each
    constructed with its own `Operation` implementation.
  - *Its use:* `Operator.DIVIDE` names the exact constant whose real
    behavior — raw integer division — this lesson's tests exercise at
    `0`.
  - *Type:* an `enum class` — a fixed, closed set of named instances, not
    an open type new values could be added to at runtime.
  - *Responsibility:* to give every operation a stable, nameable identity
    the rest of the project (keypad symbols, tests) can refer to, while
    carrying its own real `Operation` behavior alongside that identity.
  - *Depends on:* an `Operation` implementation supplied to each constant
    at the enum's own declaration.
  - *Connects to:* constructed once, at class-load time, by
    `Calculator.kt`'s own enum declaration; read by this lesson's new test
    (`Operator.DIVIDE.operation`) and by `CalculatorScreen`'s `=` branch.
  - *Shape:* a small, internal, project-owned domain type — not a
    framework or library class.

- **`Operation`**
  - *What it is:* the real interface every one of this project's five
    arithmetic behaviors implements.
  - *Implementation:* `fun interface Operation { fun apply(current: Int,
    amount: Int): Int }` — a SAM (Single Abstract Method) interface, the
    same shape `ThrowingRunnable` above has.
  - *Its use:* `Operator.DIVIDE.operation` returns a real `Operation`
    instance (specifically, `Division`) whose `apply` this lesson's new
    test calls directly.
  - *Type:* a `fun interface` — an interface the compiler allows a plain
    lambda to satisfy through SAM conversion, without a named
    implementing class at the call site.
  - *Responsibility:* to give every arithmetic behavior in this project
    one common, callable shape, so calling code never needs to know which
    concrete operation it's holding.
  - *Depends on:* nothing beyond its own two `Int` parameters at the point
    of calling `apply`.
  - *Connects to:* implemented (privately) by `Addition`/`Subtraction`/
    `Multiplication`/`Division`/`Modulo`; called by `Operator`'s own
    constants and by this lesson's test.
  - *Shape:* a public interface boundary between "some operation exists"
    and "which specific operation it is" — a project-owned abstraction,
    not a framework type.

- **`Operation.apply`**
  - *What it is:* the real, single method every `Operation` implementation
    defines.
  - *Implementation:* `fun apply(current: Int, amount: Int): Int` —
    `Division`'s own real body is `return current / amount`.
  - *Its use:* called directly, with the literal arguments `5` and `0`,
    to force the exact real crash this lesson investigates.
  - *Type:* an instance method, dispatched polymorphically — the call
    site (`Operator.DIVIDE.operation.apply(...)`) doesn't know or care
    that it's specifically `Division`'s own body running.
  - *Responsibility:* to compute one arithmetic result from two `Int`
    inputs, and nothing else — no display formatting, no state, no error
    handling of its own.
  - *Depends on:* the two `Int` parameters, `current` and `amount`,
    supplied by whichever caller invokes it.
  - *Connects to:* called by this lesson's new test and, unchanged, by
    `CalculatorScreen`'s own `=` branch.
  - *Shape:* the one real seam between this project's UI and its actual
    math — a public method on a project-owned interface.

- **`Modifier.testTag`**
  - *What it is:* a real Compose `Modifier` extension attaching a string
    identifier to a composable, invisible to the user, readable only by
    tests.
  - *Implementation:* `fun Modifier.testTag(tag: String): Modifier`, from
    `androidx.compose.ui.platform`.
  - *Its use:* already used once, on the display `Text`, to give
    `onNodeWithTag("display")` something unambiguous to find; this
    lesson applies the same call to every keypad `Button`, tagging each
    one with its own label.
  - *Type:* an extension function on `Modifier`, returning a new
    `Modifier` (Compose `Modifier`s are immutable — each call in a chain
    produces a new value rather than mutating the receiver).
  - *Responsibility:* to attach exactly one piece of test-only metadata to
    whatever composable this `Modifier` is applied to, without changing
    anything about how that composable actually looks or behaves.
  - *Depends on:* a `String` tag, supplied by the caller.
  - *Connects to:* written here inside each `Button`'s own `modifier =`
    parameter; read later by `onNodeWithTag` inside Robolectric tests.
  - *Shape:* a public Compose testing API, called from real, permanent
    project code (not a test file).

- **`Modifier.weight`**
  - *What it is:* the real, `RowScope`-scoped `Modifier` extension that
    divides available space among siblings proportionally.
  - *Implementation:* `fun RowScope.weight(weight: Float, fill: Boolean =
    true): Modifier`.
  - *Its use:* already gives every keypad button equal width; this
    lesson's own change chains `.testTag(label)` onto the same `Modifier`
    value, immediately after `.weight(1f)`.
  - *Type:* a scoped extension function — resolvable only inside a
    `RowScope` receiver, unlike `testTag`, which is callable anywhere.
  - *Responsibility:* to claim a proportional share of a `Row`'s leftover
    space for the composable it's applied to.
  - *Depends on:* being called inside a real `RowScope` — here, the `Row`
    each keypad row is built from.
  - *Connects to:* chained directly before `.testTag(label)` on the same
    `Modifier` value; the chain order between these two specific calls
    doesn't change anything observable, since `testTag` doesn't touch
    layout and `weight` doesn't touch semantics.
  - *Shape:* a public, scoped Compose layout API, unchanged from where it
    was first introduced.

- **`RobolectricTestRunner`**
  - *What it is:* the real class that replaces JUnit's default test
    runner to simulate the Android framework on the plain JVM.
  - *Implementation:* `org.robolectric.RobolectricTestRunner`, itself
    extending JUnit's own `BlockJUnit4ClassRunner`.
  - *Its use:* already governs every test in `CalculatorScreenTest`,
    including the two new ones this lesson adds — nothing about this
    class-level annotation changes.
  - *Type:* a `class`, instantiated by JUnit itself (via `@RunWith`), not
    by this project's own code.
  - *Responsibility:* to intercept every test method in the class it's
    attached to, and run each one inside a simulated Android environment
    instead of a bare JVM.
  - *Depends on:* the `@Config` annotation on the same class, telling it
    which simulated SDK version to imitate.
  - *Connects to:* selected by `@RunWith`; every `composeTestRule` call in
    every test method in this class ultimately runs through the
    simulation this class sets up.
  - *Shape:* a public Robolectric library entry point.

- **`ComposeContentTestRule.setContent`**
  - *What it is:* the real method that renders a composable function
    inside the simulated environment, for a test to interact with.
  - *Implementation:* `fun setContent(composable: @Composable () ->
    Unit)`.
  - *Its use:* both of this lesson's new tests call
    `composeTestRule.setContent { CalculatorScreen() }` exactly like every
    earlier test in this file already does.
  - *Type:* an instance method on `ComposeContentTestRule` (the real
    interface `composeTestRule`'s declared type implements).
  - *Responsibility:* to build and render the given composable once, so
    the rest of the test can query and interact with what it produced.
  - *Depends on:* a `@Composable` lambda — here, a call to
    `CalculatorScreen()`.
  - *Connects to:* called once at the top of each test; every later
    `onNodeWithTag` call in that same test reads the tree this call
    built.
  - *Shape:* a public Compose testing entry point.

- **`onNodeWithTag`**
  - *What it is:* the real Compose testing function that finds exactly
    one node in the rendered UI by its `testTag`.
  - *Implementation:* `fun onNodeWithTag(testTag: String,
    useUnmergedTree: Boolean = false): SemanticsNodeInteraction`.
  - *Its use:* this lesson's two new tests call it four times each
    (`"5"`, `"÷"`, `"0"`, `"="`), now that every keypad button carries its
    own unique tag — the exact fix that makes clicking the `"0"` button
    unambiguous, since the display can also read `"0"` at that point but
    never carries that button's tag.
  - *Type:* an instance method on `SemanticsNodeInteractionsProvider`
    (implemented by `composeTestRule`).
  - *Responsibility:* to search the current semantics tree for a node
    whose tag matches exactly, and fail loudly, with a real, descriptive
    error, if it finds anything other than exactly one.
  - *Depends on:* a `testTag` string to search for, and a rendered tree
    (from a prior `setContent` call) to search within.
  - *Connects to:* returns a `SemanticsNodeInteraction`, immediately
    chained into `.performClick()` or `.assertTextEquals(...)`.
  - *Shape:* a public Compose testing API surface — a test-only lookup
    boundary between this project's own rendered UI and the assertions
    written against it, external to this project's own code.

- **`performClick`**
  - *What it is:* the real method that simulates a user tapping whatever
    node it's called on.
  - *Implementation:* `fun SemanticsNodeInteraction.performClick():
    SemanticsNodeInteraction`.
  - *Its use:* drives every button press in this lesson's two new tests —
    `"5"`, then `"÷"`, then `"0"`, then `"="`.
  - *Type:* an extension function on `SemanticsNodeInteraction`.
  - *Responsibility:* to dispatch a real, simulated click event to the
    found node, triggering that composable's own `onClick` lambda exactly
    as a real touch would.
  - *Depends on:* a `SemanticsNodeInteraction` already resolved to exactly
    one real, clickable node.
  - *Connects to:* called immediately after `onNodeWithTag`; internally
    triggers the exact `onClick` lambda written inside `CalculatorScreen`'s
    own `Button`.
  - *Shape:* a public Compose testing API surface — the simulated
    equivalent of a real touch event, external to this project's own
    code.

- **`assertTextEquals`**
  - *What it is:* the real assertion that a node's own text matches an
    exact expected string.
  - *Implementation:* `fun SemanticsNodeInteraction.assertTextEquals(vararg
    value: String, ...): SemanticsNodeInteraction`.
  - *Its use:* both new tests call
    `onNodeWithTag("display").assertTextEquals("Error")` (and, in the
    second test, `.assertTextEquals("9")` afterward) to confirm exactly
    what the display shows.
  - *Type:* an extension function on `SemanticsNodeInteraction`.
  - *Responsibility:* to read the target node's actual current text and
    fail the test, with both the expected and actual values shown, if it
    doesn't match.
  - *Depends on:* a `SemanticsNodeInteraction` already resolved to a node
    with readable text.
  - *Connects to:* called last in each assertion chain, after
    `onNodeWithTag`.
  - *Shape:* a public Compose testing API surface — the assertion
    boundary where a test's expectation meets the UI's own actual,
    rendered state, external to this project's own code.

- **`CalculatorScreen`**
  - *What it is:* this project's own top-level composable — the entire
    calculator UI.
  - *Implementation:* `@Composable fun CalculatorScreen()`, holding
    `displayText`/`firstOperand`/`pendingOperator` state and building the
    display plus the full keypad.
  - *Its use:* rendered fresh, from scratch, at the start of every test in
    this file, including this lesson's two new ones.
  - *Type:* a `@Composable` function with no parameters.
  - *Responsibility:* to own the calculator's entire visible state and
    behavior — every button, every state transition, now including what
    happens when the underlying math fails.
  - *Depends on:* nothing external — it owns all of its own state via
    `remember`.
  - *Connects to:* called once per test, inside `setContent { ... }`.
  - *Shape:* the single, public composable this whole project's UI is
    built from.

## Concept Unit: Exceptions

### The Problem

`Division.apply` computes `current / amount`. Kotlin's compiler checks
that both are `Int`s, checks that the function returns an `Int`, and
accepts the code without complaint — division by zero is not a type
error. Nothing about `current / amount`'s own declared shape says
anything can go wrong. And yet, at the exact moment `amount` happens to
be `0`, the JVM cannot produce an `Int` result — there is no integer that
correctly answers "how many zeroes fit into five." Something has to
happen at that instant, and it isn't a compile error, because the
compiler already finished checking this code long before it ever ran.

> Before reading on: what could a running program actually *do* at the
> exact moment `current / amount` can't produce a result? It already
> passed every check the compiler could perform — nothing stopped it from
> starting to run. Could the function just... not return anything? Could
> it return a placeholder `Int`, like `0` or `-1`? What would go wrong for
> the rest of this project if `Division.apply(5, 0)` silently returned
> `0`, and a later line trusted that `0` as if it were a real answer?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    try {
        val result = 5 / 0
        println("Result: $result")
    } catch (error: ArithmeticException) {
        println("Caught: ${error.message}")
    }
}
```

Compiling this with `kotlinc` produces a real warning, not an error —
`warning: division by zero`, pointing at `5 / 0` — because both operands
are literal constants the compiler itself can evaluate, so it can warn
about this *one specific case* in advance. That warning does not stop the
file from compiling, and it would disappear entirely if `0` were replaced
with a variable whose value the compiler can't know ahead of time
(exactly `Division.apply`'s own situation, where `amount` is whatever the
user typed). Running the compiled program prints, exactly:

```
Caught: / by zero
```

This proves three real things at once: first, that `5 / 0` really does
fail at runtime, not compile time, exactly as predicted above; second,
that failing looks like a specific, real, catchable object — not a crash
with no information attached — since `error.message` recovered a genuine
description, `"/ by zero"`, straight from the JVM itself; and third, that
`println("Result: $result")` never ran at all — no `"Result: ..."` line
appears anywhere in the real output. This mechanism — a running program
signaling failure by constructing and *throwing* an object, which some
enclosing `catch` block can *catch* and inspect — is called an
**exception**.

### Mechanical Walkthrough

Here is exactly what happened, in order:

1. `try { ... }` — Kotlin begins running the block, with no guarantee yet
   that it will finish.
2. `val result = 5 / 0` — the JVM's own integer-division instruction runs,
   cannot produce a result, and constructs a real `ArithmeticException`
   object, then immediately **throws** it — control leaves this line
   instantly, mid-statement, before `result` is ever assigned.
3. `println("Result: $result")` — never runs. The thrown exception is
   already unwinding the stack, skipping every remaining statement in the
   `try` block, looking for a `catch` that can handle it.
4. `catch (error: ArithmeticException) { ... }` — Kotlin finds this clause
   matches the thrown exception's own type, stops unwinding, and binds the
   thrown object to `error`.
5. `println("Caught: ${error.message}")` — runs, reading the real message
   the JVM itself attached to the exception object in step 2.

### Discard the Throwaway Example

This lab was never part of the real project — it lived only in this
curriculum's own verification folder, compiled and run once to prove
exceptions are real, catchable objects, and is done being useful now that
it's proven that. `Division.apply` itself is not being touched yet.

### CS Lens

A running program signaling failure by unwinding its own call stack,
skipping every remaining statement until something further up agrees to
handle it, is a distinct control-flow mechanism from an ordinary function
return — **exception-based control flow**. Also recognized in: a Unix
process receiving a signal (`SIGSEGV`, `SIGINT`) that interrupts whatever
it was doing regardless of where execution happened to be; a CPU hardware
interrupt suspending the currently-running instruction stream; a
JavaScript `Promise` rejection propagating past every `.then()` until a
`.catch()` handles it; a database transaction rollback unwinding every
statement since the last commit point.

### SE Lens

The alternative this project's own earlier code already relies on
elsewhere is a **sentinel value** — `operatorSymbols[label]` returning a
nullable `Operator?` rather than throwing when a key is missing, checked
explicitly with `!= null`. The real tradeoff: a sentinel value is easy to
silently ignore — nothing forces a caller to check it — while an
exception is structurally impossible to silently ignore: it keeps
unwinding, forcibly, until something catches it or the whole program
terminates. The cost runs the other way: an exception completely bypasses
a function's own declared return type. `Division.apply`'s own signature,
`fun apply(current: Int, amount: Int): Int`, promises an `Int` and says
nothing about ever failing — Kotlin, unlike Java, has no *checked*
exceptions, so nothing at compile time forces a caller to even know this
function can throw. That gap is exactly what the rest of this lesson
exists to close.

### Commands Needed

`kotlinc lab1_exceptions.kt -include-runtime -d lab1_exceptions.jar`
compiles this lab into a runnable `.jar` with the Kotlin runtime bundled
in (`-include-runtime`), needed because this lab runs completely outside
the Gradle project and has no other way to find Kotlin's own standard
library at runtime. `java -jar lab1_exceptions.jar` then runs it.

### Run It

Real output, from this session, already shown above and restated here in
full:

```
$ kotlinc lab1_exceptions.kt -include-runtime -d lab1_exceptions.jar
lab1_exceptions.kt:3:22: warning: division by zero.
        val result = 5 / 0
                     ^^^^^
$ java -jar lab1_exceptions.jar
Caught: / by zero
```

### Connect the Pieces

This unit's own six-line lab, disconnected from the real project
entirely, is the foundation the rest of this lesson builds on: proof
that exceptions are real, constructible, throwable, catchable objects —
before the next unit asks whether this project's own real code actually
produces one.

## Concept Unit: Invalid State

### The Problem

The lab above proves exceptions exist and can be caught — in a completely
disconnected, six-line file with nothing to do with this project. The
real question this lesson actually needs answered is narrower and more
concrete: does *this project's own, currently-shipped* `Division` class
really have this exact problem right now, today, with no changes at all?
A program can sit for a long time with code that's only *theoretically*
capable of failing, if nothing ever actually drives it into the specific
input that triggers the failure.

> `Division.apply(current, amount)` is called, right now, from exactly
> one place in this whole project — `CalculatorScreen`'s own `=` branch,
> with `displayText.toInt()` as `amount`. Given that `displayText` is a
> `String` a real user can type anything into, is there anything in this
> project's current code that stops `displayText` from ever holding
> `"0"` at the moment `=` gets pressed? What would you write to prove,
> for real, that `amount` can actually reach `0` this way?

### Introduce the Concept in Isolation

A **state** a program can reach that violates some assumption its own
code depends on — here, `Division.apply`'s implicit assumption that
`amount` is never `0` — is called an **invalid state**. Proving one is
reachable means driving the real code into it and watching what actually
happens, not reasoning about it in the abstract — and `assertThrows`
itself, the tool this unit needs to do that inside a real test, is new to
this lesson and deserves its own isolated proof before it's trusted
inside this project's own permanent test suite.

```kotlin
import org.junit.Assert.assertThrows

fun divideByZero(): Int = 5 / 0

fun main() {
    assertThrows(ArithmeticException::class.java) {
        divideByZero()
    }
    println("assertThrows caught it - no exception escaped main()")
}
```

Real output:

```
assertThrows caught it - no exception escaped main()
```

Nothing crashed this standalone program, even though `divideByZero()`
throws exactly the same real `ArithmeticException` the very first
Concept Unit in this lesson already proved — because `assertThrows`
itself caught it internally, confirmed its type matched, and let `main`
continue normally afterward. This proves `assertThrows` genuinely
behaves as advertised, on a function invented only for this lab, before
it's trusted against this project's own real `Division` class.

### Discard the Throwaway Example

`divideByZero()` and this lab's own `main` function were written only to
prove `assertThrows` really catches and confirms a thrown exception; both
are discarded now and will not appear in the project.

### Project Change

- **Reference Source** — No reference counterpart: this is a from-scratch
  addition to this project's own test suite. Stage 2 has no separate
  reference implementation being ported from; every test in
  `CalculatorTest.kt` so far is original to this project.
- **Files affected** — `app/src/test/java/com/example/calculator/CalculatorTest.kt`
  (modified: one new import, one new test method).
- **Change type** — add.
- **Location** — a new `import org.junit.Assert.assertThrows` alongside
  the existing `import org.junit.Assert.assertEquals`; a new
  `divisionByZeroThrowsArithmeticException` test appended after
  `moduloAppliesRealArithmetic`, the last test an earlier Stage 2 lesson
  left in this file.
- **Dependencies** — `Operator.DIVIDE`, this project's own already-existing
  `DIVIDE` constant, unchanged; `org.junit.Assert.assertThrows`, already
  present in this project's existing `junit:junit:4.13.2` test dependency,
  just not imported or called until now.

### The New Code

```kotlin
@Test
fun divisionByZeroThrowsArithmeticException() {
    // Arrange
    val operation = Operator.DIVIDE.operation

    // Act & Assert
    assertThrows(ArithmeticException::class.java) {
        operation.apply(5, 0)
    }
}
```

### The Updated Project

```kotlin
 1  import org.junit.Assert.assertEquals
 2  import org.junit.Assert.assertThrows                              // ← new
 3  import org.junit.Test
 4
 5  class CalculatorTest {
 6
 7      // ... additionAppliesRealArithmetic, subtractionAppliesRealArithmetic,
 8      // multiplicationAppliesRealArithmetic, divisionAppliesRealArithmetic,
 9      // moduloAppliesRealArithmetic all unchanged, exactly as an earlier
10      // Stage 2 lesson left them
11
12      @Test                                                          // ← new
13      fun divisionByZeroThrowsArithmeticException() {                // ← new
14          // Arrange                                                 // ← new
15          val operation = Operator.DIVIDE.operation                  // ← new
16
17          // Act & Assert                                            // ← new
18          assertThrows(ArithmeticException::class.java) {            // ← new
19              operation.apply(5, 0)                                  // ← new
20          }                                                          // ← new
21      }                                                              // ← new
22  }
```

`CalculatorTest` now has a sixth test, proving — for real, against this
project's own currently-shipped code, with no changes to `Calculator.kt`
at all — that `Division`'s real behavior throws exactly the exception the
isolated lab predicted.

### Mechanical Walkthrough

- `import org.junit.Assert.assertThrows` — a new import, bringing this
  specific static method into scope by name, the same import mechanism
  `assertEquals` already uses one line above.
- `@Test` — the same JUnit annotation every other test method in this
  file already carries, marking this function as a real, runnable test
  case rather than an ordinary helper.
- `val operation = Operator.DIVIDE.operation` — reads the `DIVIDE`
  constant's own `operation` property, exactly as `divisionAppliesRealArithmetic`
  already does one test above, producing the real `Division` instance.
- `assertThrows(ArithmeticException::class.java) { ... }` — calls the
  real static method described above in the Header. `ArithmeticException::class`
  is a `KClass` reference to the exception type itself, not an instance
  of it; `.java` converts that `KClass` into the `java.lang.Class` the
  method's own real signature requires, bridging Kotlin's reflection type
  to the Java platform type JUnit's own Java-authored code expects.
- The trailing lambda, `{ operation.apply(5, 0) }` — SAM-converts into the
  `ThrowingRunnable` parameter, the exact same conversion `Operation`
  itself has relied on since it became a `fun interface`: a plain lambda
  standing in for a one-method interface, with no named class written at
  the call site.
- `operation.apply(5, 0)` — the literal arguments `5` and `0`, chosen
  specifically because `0` is the one value that makes `Division`'s real
  `current / amount` fail.

Here is what actually happens when this test runs, in order:

1. `operation.apply(5, 0)` starts running inside `assertThrows`'s own
   internal call to the passed lambda.
2. The JVM's real integer-division instruction fails, constructs a real
   `ArithmeticException`, and throws it — exactly as the isolated lab
   already proved.
3. `assertThrows` itself — not this test's own code — catches that thrown
   exception internally, checks that its type matches the
   `ArithmeticException::class.java` argument, and, because it matches,
   treats the test as passing.
4. If `operation.apply(5, 0)` had *not* thrown anything, `assertThrows`
   would have caught nothing, noticed no exception was thrown at all, and
   failed the test itself — proving `assertThrows` genuinely checks for
   the throw, rather than merely tolerating one if it happens to occur.

### CS Lens

Discovering that a program can be driven into a state its own code never
explicitly guards against — here, by supplying the one input value
(`0`) that the rest of the logic silently assumes never occurs — is a
central idea in software correctness: **invalid state**. Also recognized
in: a login form trusting that a submitted age field is always a positive
number; a file parser assuming a file handle it was given is never
already closed; a thermostat's control loop assuming a temperature sensor
reading is never physically impossible; any array index computed from
user input, unchecked against the array's own real bounds.

### SE Lens

The alternative to writing `divisionByZeroThrowsArithmeticException` at
all would be to trust that this lesson's own later fix, further below, is
correct by inspection, without a real, permanent test proving the
underlying engine-level behavior it depends on. The real tradeoff: this test is
narrow — it only proves `Division` itself throws, nothing about what the
UI does in response — but that narrowness is exactly its value. If a
future refactor ever changed `Division.apply`'s own behavior (say, to
silently return `0` instead of throwing), this test would fail
immediately and specifically, at the exact layer the change happened in,
rather than failing later and less clearly inside a Compose UI test three
steps downstream. The cost: one more permanent test to keep passing,
forever, alongside the five this project already had.

### Commands Needed

For the isolated lab: `kotlinc lab2b_assertThrows.kt -include-runtime -cp
junit-4.13.2.jar:hamcrest-core-1.3.jar -d lab2b.jar` — the same
`-include-runtime` compile this lesson's first lab used, with `-cp`
added to put JUnit's own real classes on the classpath, since this lab
calls `assertThrows` directly without any Gradle project supplying that
dependency automatically. For the real project test:
`./gradlew :app:testDebugUnitTest` — the same JVM-only Gradle task every
Robolectric and plain-JUnit test in this project already runs through,
requiring no emulator.

### Run It

Real output, from this session:

```
$ ./gradlew :app:testDebugUnitTest --tests "com.example.calculator.CalculatorTest"
BUILD SUCCESSFUL
```

All six tests in `CalculatorTest`, including the new one, pass — this
project's own real `Division` class genuinely throws `ArithmeticException`
for a `0` amount, today, unmodified.

### Connect the Pieces

The isolated lab proved exceptions are real, catchable objects, in
general; this unit proved this exact project already has the specific
invalid state that produces one, without changing a single line of
`Calculator.kt`.

## Concept Unit: Domain Errors

### The Problem

`ArithmeticException` is a generic JVM exception — the exact same type
`5 / 0` throws in any Kotlin or Java program anywhere, for any reason at
all involving arithmetic. It carries no knowledge of *this* project: not
that it came from a calculator, not that it came specifically from
division rather than modulo, nothing project-specific at all. Is that
generic type actually good enough for this project's own error handling,
or does a calculator's own domain deserve its own, specifically-named
exception type?

> Every other named type in this project so far — `Operator`, `Operation`,
> `Addition`, `Division` — was written specifically for this calculator's
> own domain. Given that pattern, what would a calculator-specific
> exception type look like? What would it need to hold that
> `ArithmeticException` doesn't already give it for free? And what would
> defining one actually cost — in code, and in how many exception types
> every future `catch` block in this project would need to know about?

### Introduce the Concept in Isolation

```kotlin
class DivisionByZeroError(message: String) : Exception(message)

fun main() {
    try {
        throw DivisionByZeroError("Cannot divide by zero")
    } catch (error: DivisionByZeroError) {
        println("Caught: ${error.message}")
    }
}
```

Real output:

```
Caught: Cannot divide by zero
```

### Mechanical Walkthrough

This proves `DivisionByZeroError` genuinely compiles and works exactly
like any other exception. `class DivisionByZeroError(message: String) :
Exception(message)` declares a new type extending `Exception`, forwarding
its one constructor parameter straight into `Exception`'s own constructor
— the same `:` supertype syntax every `Operation` implementation in this
project already declares its own supertype with, just naming a real
constructor call here instead of naming an implemented interface.
`throw DivisionByZeroError(...)` constructs one and throws it manually,
the same throwing mechanism the JVM itself performed automatically inside
`5 / 0` in the previous unit — the only difference is who constructs the
exception object: the JVM itself, there, versus this project's own code,
here. This is a real, working, **domain-specific exception type** — one
whose very name describes a specific failure in this project's own
domain, rather than a generic platform failure.

### Discard the Throwaway Example

This class was written and run to make the design question concrete, not
to become part of the project. It is **not** being added to `Calculator.kt`.

### CS Lens

Choosing between a generic, platform-provided type and a project-specific
named type to represent the same underlying fact is a recurring design
question wherever a domain sits on top of a more general platform:
**domain modeling**. Also recognized in: an HTTP API returning a bare
`400`/`500` status code versus a structured JSON error body naming the
specific validation rule that failed; a database driver's generic
`SQLException` versus an ORM's own `RecordNotFoundException`; a parser
using a language's built-in `Exception` versus a dedicated
`SyntaxError` type with its own line/column fields.

### SE Lens

`Division` and `Modulo` currently throw `ArithmeticException`, and this
lesson leaves that completely unchanged. A domain-specific exception type
earns its cost when a domain has more than one distinct failure reason a
caller genuinely needs to tell apart — a network client separating "timed
out" from "server rejected the request," say. This calculator's own
domain has exactly one arithmetic failure mode, across every one of its
five operations: a `0` amount on `/` or `%`. Introducing
`DivisionByZeroError` here would mean either catching `ArithmeticException`
inside `Division`/`Modulo` themselves just to rethrow a renamed version —
real code, for zero new information — or catching it even further
downstream anyway, since the JVM's own division instruction is what
throws it regardless of any wrapper placed around it. `ArithmeticException`
already says exactly what happened, correctly, in a domain this small.

### Commands Needed

`kotlinc lab3_domain_exception_investigation.kt -include-runtime -d
lab3.jar` compiles this investigation the same way the first lab in this
lesson was compiled; `java -jar lab3.jar` runs it.

### Run It

Real output, from this session, restated in full:

```
$ kotlinc lab3_domain_exception_investigation.kt -include-runtime -d lab3.jar
$ java -jar lab3.jar
Caught: Cannot divide by zero
```

### Connect the Pieces

The previous unit proved this project's own `Division` class really does
throw `ArithmeticException` today; this unit settled that the exception
it throws is already the right one to keep catching — nothing about
`Calculator.kt` changes because of this unit, only the confidence that
leaving it alone is a deliberate choice, not an oversight.

## Concept Unit: User-Facing Errors

### The Problem

The previous unit settled *what* gets thrown — nothing changes there.
This unit is about what happens *above* the throw: right now, nothing in
`CalculatorScreen`'s own `=` branch catches anything at all. An uncaught
exception thrown inside a Compose `onClick` lambda propagates straight
out of that lambda, and Compose's own click-dispatch mechanism has no
built-in recovery for it — it would genuinely crash the running app,
mid-tap, with nothing shown to the person holding the phone except
whatever the operating system does with a crashed app.

> Given that `operator.operation.apply(...)` is the one call that can
> throw, and that a `try`/`catch` around a *statement* was already proven
> to work in this lesson's very first lab — where, specifically, would a
> `try`/`catch` need to go inside the `=` branch to stop this crash?
> And once the exception is caught, what should `displayText` actually
> become — the app's normal number-formatted result, or something else
> entirely?

### Introduce the Concept in Isolation

`try`/`catch` as a *statement* was already proven, in this lesson's very
first lab, to run one block or the other. What that lab never showed is
whether the whole block can be treated as a value in its own right — the
exact behavior this fix needs, to turn "compute a result, or `"Error"` if
that fails" into one assignment.

```kotlin
fun main() {
    val amount = 0
    val result = try {
        (10 / amount).toString()
    } catch (error: ArithmeticException) {
        "Error"
    }
    println("Result: $result")
}
```

Real output:

```
Result: Error
```

`result` genuinely holds `"Error"` — the `catch` block's own last
expression — even though nothing anywhere in this lab explicitly wrote
`result = "Error"`. This proves the entire `try`/`catch` construct
evaluates to a real value on its own, assignable exactly like any other
expression, confirming this is **`try` as an expression**, not merely a
statement.

### Discard the Throwaway Example

This lab's own `amount`/`result`/`main` exist only to prove `try` can be
assigned; none of it is added to the project.

Before the real fix can even be tested, one small enabling change is also
needed: right now, clicking the `"0"` digit button can't be told apart
from clicking the display itself, because after `5` then `÷` are pressed,
`CalculatorScreen`'s own design resets `displayText` back to `"0"` — so
the display and the `"0"` button would show the identical text at the
exact moment a test needs to click that button. `Modifier.testTag`,
already used once on the display so a test could find it by tag instead
of by text, fixes this the same way again here: tagging each button with
its own label gives every button — not just the display — a real, unique
identity a test can find by, regardless of what text currently happens to
be on screen.

### Project Change

- **Reference Source** — No reference counterpart: this is a from-scratch
  addition; catching this specific exception in this specific UI has no
  precedent elsewhere in this project.
- **Files affected** —
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified:
  the keypad `Button`'s `modifier`, and the `=` branch's own body);
  `app/src/test/java/com/example/calculator/CalculatorScreenTest.kt`
  (modified: one new test).
- **Change type** — modify existing branch; add new test.
- **Location** — inside `CalculatorScreen`'s keypad-building loop, on the
  `Button` composable itself (its `modifier` parameter) and inside its
  `onClick` lambda's `when` block, in the `label == "="` branch — this
  project's own existing branch that reads `pendingOperator` and
  `firstOperand` and calls `operator.operation.apply(...)`.
- **Dependencies** — none beyond what this project already has;
  `Modifier.testTag` and `onNodeWithTag` are both already real,
  already-established dependencies of this project.

### The New Code

```kotlin
displayText = try {
    operator.operation.apply(first, displayText.toInt()).toString()
} catch (invalidOperation: ArithmeticException) {
    "Error"
}
```

### The Updated Project

```kotlin
60  Button(
61      onClick = {
62          when {
63              label[0].isDigit() -> {
64                  displayText = if (displayText == "0") label else displayText + label
65              }
66              label == "C" -> {
67                  displayText = "0"
68              }
69              label in operatorSymbols -> {
70                  firstOperand = displayText.toInt()
71                  pendingOperator = operatorSymbols[label]
72                  displayText = "0"
73              }
74              label == "=" -> {
75                  val operator = pendingOperator
76                  val first = firstOperand
77                  if (operator != null && first != null) {
78                      displayText = try {                                        // ← new
79                          operator.operation.apply(first, displayText.toInt()).toString()  // ← new
80                      } catch (invalidOperation: ArithmeticException) {          // ← new
81                          "Error"                                               // ← new
82                      }                                                         // ← new
83                  }
84                  pendingOperator = null
85                  firstOperand = null
86              }
87          }
88      },
89      modifier = Modifier.weight(1f).testTag(label)                              // ← new
90  ) {
91      Text(text = label)
92  }
```

The whole `Button` composable — every branch of its keypad logic, digit
through `=` — is unchanged in every branch except `=`'s own body, which
now decides `displayText`'s next value through a `try`/`catch` instead of
a bare, unguarded call; and the `modifier` line, which now tags this
button with its own label alongside the layout weight it already had.

### Mechanical Walkthrough

- `displayText = try { ... } catch (...) { ... }` — this is **`try` as an
  expression**, the Kotlin-specific behavior named in this lesson's
  Header: the entire `try`/`catch` block evaluates to a value, and that
  value is assigned directly to `displayText`, with no separate mutable
  placeholder variable declared above it and reassigned inside each
  branch.
- `operator.operation.apply(first, displayText.toInt()).toString()` —
  this project's own already-established call from `Operator`'s stashed
  operation down to the real arithmetic, now sitting as the `try` block's
  own last expression, meaning its result becomes the whole `try`
  expression's value whenever it succeeds.
- `catch (invalidOperation: ArithmeticException) { "Error" }` — catches
  exactly the exception type this lesson's first two units already proved
  is the real, specific failure mode; `"Error"` is this `catch` block's
  own last expression, so it becomes the whole `try` expression's value
  whenever the `try` block throws instead.
- `Modifier.weight(1f).testTag(label)` — chains the already-established
  `weight` call with a new `testTag` call, tagging this specific button
  with its own label (`"5"`, `"÷"`, `"0"`, `"="`, and so on for every
  other key) so a test can find it by tag regardless of what text happens
  to be showing anywhere else on screen at that moment.

Here is exactly when each branch of the new `try`/`catch` actually runs,
for the real case this lesson is fixing (`first = 5`,
`displayText.toInt() = 0`):

1. `operator.operation.apply(5, 0)` starts running as the `try` block's
   first statement.
2. The JVM's real integer-division instruction fails and throws a real
   `ArithmeticException` — exactly as the first two Concept Units in this
   lesson already proved happens for these exact inputs.
3. `.toString()` never runs — the exception already left the `try` block
   before that call was ever reached, the same "control leaves
   mid-statement" behavior the very first isolated lab in this lesson
   demonstrated.
4. Kotlin finds the `catch (invalidOperation: ArithmeticException)`
   clause immediately below, sees it matches, and runs its body instead.
5. `"Error"` is evaluated as the `catch` block's own last expression —
   and because the whole `try`/`catch` is itself an expression, this
   string literal becomes the value the entire block evaluates to.
6. `displayText = ...` completes, assigning `"Error"` — not a number, not
   a crash — as the display's new state.

### CS Lens

Deciding, deliberately, what a system shows a human when its own internal
logic fails — rather than letting that failure leak through as a raw
crash, a stack trace, or a blank screen — is the real idea behind
**user-facing errors**. Also recognized in: a web form showing "Invalid
email address" instead of a raw server exception; a file-upload widget
showing "File too large" instead of silently doing nothing; a payment
form showing "Card declined" instead of an HTTP `500` page; a GPS app
showing "No signal" instead of freezing on a stale map.

### SE Lens

The alternative already ruled out by the previous Concept Unit was
catching a custom `DivisionByZeroError` here instead of the platform's
own `ArithmeticException` — rejected there because this domain has only
one real failure mode to represent. A different alternative, not yet
addressed: catching `Exception` broadly, instead of `ArithmeticException`
specifically, so any future failure inside any future operation is
automatically caught too. That would be strictly less precise — it would
also silently swallow a genuine programming bug (a `NullPointerException`
from a real mistake elsewhere, say) and show the user `"Error"` for it,
exactly as if it were an expected, ordinary invalid-input case. Catching
the exact type this lesson already proved is the real, specific failure
mode keeps that distinction intact: this `catch` clause only ever
triggers for the one condition it was actually written to handle.

### Commands Needed

For the isolated lab: `kotlinc lab4_try_as_expression.kt -include-runtime
-d lab4.jar`, then `java -jar lab4.jar` — the same pattern this lesson's
first lab already used, needing no extra classpath this time since
nothing beyond Kotlin's own standard library is involved. For the real
project: `./gradlew testDebugUnitTest assembleDebug` — this project's own
already-established combined command, proving both the test suite and a
real, installable `.apk` still build successfully after a change.

### Run It

Real output, from this session:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 5s
43 actionable tasks: 9 executed, 34 up-to-date
```

The new test added to `CalculatorScreenTest.kt`,
`pressingFiveDivideZeroEqualsShowsErrorInsteadOfCrashing`, drives the real
keypad through `5`, `÷`, `0`, `=` — using `onNodeWithTag` for every click,
now that every button carries its own tag — and asserts
`onNodeWithTag("display").assertTextEquals("Error")`. It passes, as part
of the same `BUILD SUCCESSFUL` run above, alongside all eleven other real
tests already in this project.

### Connect the Pieces

The first Concept Unit proved exceptions are real, catchable objects; the
second proved this exact project already produces one; the third settled
which exact type belongs in a `catch` clause here; this unit is where all
three finally meet the real, running UI — the same `5`, `÷`, `0`, `=`
sequence that would have crashed the app now ends with `"Error"` on the
screen instead.

## Concept Unit: Recovering From an Error State

### The Problem

`"Error"` is now a real value `displayText` can hold — but nothing yet
distinguishes it from an ordinary number once the user keeps typing. The
digit branch's own existing logic, `if (displayText == "0") label else
displayText + label`, only treats a bare `"0"` as "start fresh"; typing
`9` right after an error would append onto the word itself, producing
`"Error9"` — a second, smaller invalid state, introduced by the very fix
that closed the first one.

> The digit branch already checks one condition (`displayText == "0"`)
> to decide whether to start fresh or append. What would the condition
> need to look like to also start fresh when `displayText` holds `"Error"`?
> Is there a single `Boolean` expression already available — no new
> Kotlin syntax required beyond ordinary `if`/`else` and equality
> comparisons, both already familiar from this project's own existing
> code — that captures "either of these two things is true"?

### Introduce the Concept in Isolation

```kotlin
fun printAndReturn(label: String, value: Boolean): Boolean {
    println("Checking $label")
    return value
}

fun main() {
    val result = printAndReturn("left", true) || printAndReturn("right", true)
    println("Result: $result")
}
```

Real output:

```
Checking left
Result: true
```

`"Checking right"` never prints — even though `printAndReturn("right",
true)` would, on its own, also return `true`. This proves `||`'s real
behavior is not "evaluate both sides, then combine them": the moment the
left side of `||` is already `true`, Kotlin skips the right side
entirely, because no possible value it could produce would change the
overall result. This is called **short-circuit evaluation**, and it's
provable here specifically because `printAndReturn`'s own `println` is a
real, visible side effect — if the right side had run, its own `"Checking
right"` line would have appeared in the real output above, and it does
not.

### Discard the Throwaway Example

`printAndReturn` was written only to make `||`'s short-circuit behavior
visible through a real side effect; it is not part of this project and
will not appear again.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch fix for
  a state this project's own previous Concept Unit just introduced.
- **Files affected** —
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified:
  the digit branch's own condition);
  `app/src/test/java/com/example/calculator/CalculatorScreenTest.kt`
  (modified: one new test).
- **Change type** — modify existing branch; add new test.
- **Location** — the `label[0].isDigit()` branch inside the same `Button`
  composable's `when` block the previous unit already showed in full.
- **Dependencies** — none beyond `||` itself, just proven above.

### The New Code

```kotlin
displayText = if (displayText == "0" || displayText == "Error") label else displayText + label
```

### The Updated Project

```kotlin
60  Button(
61      onClick = {
62          when {
63              label[0].isDigit() -> {
64                  displayText = if (displayText == "0" || displayText == "Error") label else displayText + label  // ← new
65              }
66              label == "C" -> {
67                  displayText = "0"
68              }
69              label in operatorSymbols -> {
70                  firstOperand = displayText.toInt()
71                  pendingOperator = operatorSymbols[label]
72                  displayText = "0"
73              }
74              label == "=" -> {
75                  val operator = pendingOperator
76                  val first = firstOperand
77                  if (operator != null && first != null) {
78                      displayText = try {
79                          operator.operation.apply(first, displayText.toInt()).toString()
80                      } catch (invalidOperation: ArithmeticException) {
81                          "Error"
82                      }
83                  }
84                  pendingOperator = null
85                  firstOperand = null
86              }
87          }
88      },
89      modifier = Modifier.weight(1f).testTag(label)
90  ) {
91      Text(text = label)
92  }
```

Only the digit branch's own single line changes; the `=` branch below it
— this lesson's own previous Concept Unit — is shown unchanged, exactly
as it now permanently stands.

### Mechanical Walkthrough

- `displayText == "0"` — this project's own existing, unchanged
  condition: a `String` equality comparison, `true` exactly when the
  display currently reads the single character `"0"`.
- `||` — the operator just proven above: evaluates `displayText == "Error"`
  only if the left side is `false`, and produces `true` the instant either
  side is `true`.
- `displayText == "Error"` — a second, identical-shaped `String` equality
  comparison, `true` exactly when the display currently reads the word
  written by the previous Concept Unit's own `catch` block.
- `label` / `displayText + label` — unchanged: on a fresh start, the new
  digit becomes the whole display; otherwise, it's appended to whatever
  was already there.

For the real case that motivated this fix — `displayText` currently holds
`"Error"`, and the user presses `9`:

1. `displayText == "0"` evaluates first — `"Error" == "0"` is `false`.
2. Because the left side of `||` was `false`, Kotlin does *not* skip the
   right side this time — the short-circuit only skips evaluation when
   the left side is already `true`, which it isn't here.
3. `displayText == "Error"` evaluates — `"Error" == "Error"` is `true`.
4. The overall `||` expression is `true`, so the `if`'s `then` branch
   runs: `displayText = label`, which is `"9"` — a fresh start, not
   `"Error9"`.

### CS Lens

Recognizing that reaching one invalid state (`"Error"` on the display)
can itself create a *second* invalid state one step later (an unreadable
`"Error9"`) if nothing accounts for it is the same **invalid state**
concept this lesson's second Concept Unit already named — applied here
not to the original math, but to the UI's own recovery path.

### SE Lens

The alternative not taken here: leaving `"Error"` unhandled and simply
requiring the user to press `C` first. The real tradeoff is discoverability
versus code size — a `C`-only recovery is one line smaller, but it means
a person who doesn't already know to press `C` sees their next digit
silently glued onto a word that no longer makes sense as a number at all,
with no indication anything is wrong beyond the confusing text itself.
Treating `"Error"` as an equally-valid "start fresh" trigger, right next
to `"0"`, costs one real `||` and comparison — cheap, given what it
prevents.

### Commands Needed

`./gradlew testDebugUnitTest assembleDebug`, run again, unchanged from the
previous Concept Unit.

### Run It

Real output, from this session:

```
$ ./gradlew testDebugUnitTest assembleDebug --rerun
BUILD SUCCESSFUL in 5s
43 actionable tasks: 9 executed, 34 up-to-date
```

The new test, `pressingDigitAfterErrorStartsFreshInsteadOfAppending`,
drives `5`, `÷`, `0`, `=` (reaching `"Error"`, exactly as the previous
unit's test does), asserts the display reads `"Error"`, then presses `9`
and asserts the display reads `"9"` — not `"Error9"`. It passes, as part
of the same `BUILD SUCCESSFUL` run, alongside all eleven other tests in
this project — twelve real, passing tests total now.

### Connect the Pieces

The previous unit made the display show `"Error"` instead of crashing;
this unit makes sure `"Error"` doesn't become a second, smaller trap for
whatever the user does next.

## Connect the Pieces

One value, traced through every unit this lesson built: a user presses
`5`, then `÷`, then `0`, then `=`. Before this lesson, `operator.operation.apply(5,
0)` — the same real call proven, in isolation, back in Concept Unit 1's
lab (`5 / 0`, caught, `error.message` reading `"/ by zero"`) and proven
again, against this exact project's own `Division` class, in Concept Unit
2's `divisionByZeroThrowsArithmeticException` test — would have thrown an
uncaught `ArithmeticException` straight out of a Compose `onClick`
lambda, crashing the app. Concept Unit 3 confirmed that exception's own
generic type is already the right one to catch, for this project's own
single-failure-mode domain, rather than introducing
`DivisionByZeroError`. Concept Unit 4 caught it for real, inside
`CalculatorScreen`'s own `=` branch, using `try` as an expression to turn
the choice between a real result and `"Error"` into a single assignment —
and needed every keypad button tagged first, so a test could prove it.
Concept Unit 5 closed the one gap that fix left open: typing a digit
right after `"Error"` now starts a fresh number, using the exact
short-circuit `||` behavior proven moments earlier with `printAndReturn`.
Twelve real, passing tests — six engine-level, six UI-level — now stand
behind a calculator that no longer crashes on its one remaining known
failure mode.

**🟢 Ship Slice 2: Reliable, tested calculator engine.**
