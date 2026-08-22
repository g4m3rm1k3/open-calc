# Lesson 6.4: Close Enough to Call Equal

- **What you will build** — This lesson gives `AndroidCalculator` its first
  real fractional numbers, closing two promises this curriculum has
  carried since earlier in Stage 6: a real, permanent `SquareRoot` that
  refuses to silently mishandle a negative input, and a real, permanent
  `Sine` that correctly converts a user-facing degree value into the
  radians `kotlin.math`'s own trigonometric functions actually expect.
  The transferable problem underneath both: a computer cannot store most
  real numbers exactly, only a close approximation of them, and that
  approximation changes how equality, correctness, and error-handling all
  have to be reasoned about the moment fractional numbers enter a
  program — in games, graphics, finance, and any simulation, not just a
  calculator.
- **What you need to know first** —
  - Lesson 6.1 (A Function That Only Needs One Number): the
    `fun interface`/SAM-conversion dispatch-table pattern this lesson's
    `ScientificFunction` reuses, generalized from `Int` to `Double`.
  - Lesson 6.3 (Functions That Know Their Own Limits): the
    domain-check-then-throw pattern (`IllegalArgumentException`, checked
    before any real computation runs) this lesson applies to a real
    `Double` function for the first time.
  - Lesson 2.5 (A Failure the Compiler Allows): `try`/`catch`, and
    throwing a real, descriptive exception instead of crashing or
    silently returning a wrong value.
  - Lesson 0.8 (A Fixed Set of Choices and a Record of What Happened):
    `enum class`, reused here for `AngleMode`.
  - Lesson 0.3 (Choosing What Runs): the `when` expression, reused here
    inside `toRadians`.

## Terms used in this lesson

- **`import`** — a directive at the top of a file bringing a name
  declared elsewhere (another package, the standard library) into scope
  so it can be referenced unqualified; needed here because `kotlin.math`'s
  functions and constants (`sqrt`, `sin`, `PI`, `abs`) aren't visible by
  default the way `println` and other core-language names already are.
- **`package`** — declares which namespace a file's own top-level
  declarations belong to; every real file in this project starts with
  `package com.example.calculator`, so every class and function in it can
  refer to every other one by its bare name, with no import needed
  between them.
- **`fun`** — the keyword introducing a function declaration; every named
  unit of executable behavior in this project — `main`, `toRadians`,
  every `apply` override — starts with it.
- **`val`** — declares a read-only local binding, assigned exactly once;
  used throughout this lesson's throwaway labs to hold an intermediate
  value (`sum`, `difference`, `input`) that's read once and never
  reassigned.
- **Double literal** — a numeric literal written with a decimal point
  (`0.1`, `16.0`, `-1.0`), which Kotlin infers as type `Double` by
  default, with no suffix required; this is the language's own default
  choice for "a fractional number, no explicit type requested," and it's
  this literal syntax, not just the `Double` type itself, that lets
  fractional values appear directly in code the way whole numbers already
  have since Stage 0.
- **`+` / `-` (arithmetic operators)** — addition and subtraction, both
  binary (`0.1 + 0.2`) and, for `-`, unary negation (`-1.0`); the same two
  operators this project's own `Operation` implementations have used
  since Stage 0, now operating on `Double` operands instead of `Int` ones
  for the first time.
- **`==` (structural equality)** — Kotlin's `==` calls the left operand's
  own `equals` method rather than comparing memory addresses; already
  proven for `Int` and for this project's own `data class`es, it
  reappears here to test the most surprising real behavior this lesson
  exposes — two `Double` values that both look like `0.3` are not always
  considered `==` to a literal `0.3`.
- **`<` (less-than comparison)** — numeric ordering comparison; used in
  this lesson both inside a domain check (`value < 0`) and inside an
  approximate-equality test (comparing a computed difference against a
  small tolerance).
- **`!=` (inequality)** — the negation of `==`; used in this lesson's own
  permanent test to assert a computed `Double` result is genuinely not
  exactly `0.0`, the concrete, tested proof behind this lesson's own
  central finding.
- **`if`** — a conditional branch; every domain check in this lesson
  (`if (value < 0)`) runs its guard before any real computation, the same
  check-first shape this project's own earlier, diagnostic domain-error
  work already proved is correct — check before computing, never after.
- **`throw`** — immediately halts normal execution and raises an
  exception object instead of returning a value; used here, for the first
  time in this project's real, permanent code, to reject a negative input
  to a real `Double` function before it reaches `kotlin.math.sqrt`.
- **`try` / `catch`** — `try` marks a block whose exceptions should be
  caught rather than propagate uncaught; `catch (e: SomeType) { ... }`
  names the exception type to intercept and binds it to a local name;
  used in this lesson's own throwaway lab to demonstrate a domain check's
  real, thrown exception being caught and its message printed, rather
  than letting it crash the lab's own `main`.
- **String template** — a `$name` or `${expression}` sequence inside a
  double-quoted string, replaced at runtime with that value's own string
  representation; used here inside a thrown exception's own message
  (`"Cannot take the square root of a negative number: $value"`) and
  inside a caught exception's printed message
  (`"guarded sqrt(-1.0) -> ${e.message}"`).
- **`override`** — marks a method as replacing (not just matching the
  name of) a member already declared by a supertype or interface; every
  `apply` this lesson writes uses it, since `ScientificFunction.apply` is
  an interface member each implementing class must supply its own real
  body for.
- **`class`** — declares a new type with its own real, named identity —
  as opposed to a `fun interface`'s single abstract method, a `class`
  here (`SquareRoot`, `Sine`) can hold its own state (`Sine`'s own
  `mode`) and gets constructed with `ClassName(...)`.
- **`fun interface`** — an interface with exactly one abstract method,
  letting Kotlin perform SAM (Single Abstract Method) conversion; already
  proven in this project's own Stage 0 (`Operation`) and Stage 6
  (`UnaryFunction`, a throwaway lab) work, reused here for
  `ScientificFunction` — the reason this project reaches for it again is
  the same one already established: a single, uniformly callable shape
  (`apply(value: Double): Double`) that many different real
  implementations (`SquareRoot`, `Sine`, and any future scientific
  function) can each satisfy independently.
- **`enum class`** — a type restricted to a fixed, named, exhaustive set
  of values, already proven for this project's own `Operator`; reused
  here for `AngleMode`, whose only two real values, `DEGREES` and
  `RADIANS`, are exactly the two units a real angle in this project could
  ever actually be measured in.
- **`when` (expression)** — a multi-branch conditional that, used as an
  expression (its result assigned or returned, not just executed for
  effect), must cover every real case or the compiler rejects it; reused
  here inside `toRadians`, branching on `AngleMode`'s own two real
  values.
- **`->` (branch arrow)** — separates a `when` branch's condition from
  the expression it evaluates to; also used, structurally identically,
  inside a lambda's parameter list elsewhere in this project — here it
  always appears in its `when`-branch role,
  `AngleMode.DEGREES -> angle * PI / 180.0`.
- **Primary constructor property (`private val mode: AngleMode`)** — a
  parameter declared directly inside a class's own primary constructor
  parameter list, prefixed with `val` (or `var`), which both accepts the
  constructor argument and, in the same declaration, creates a real
  property of the class holding it; `Sine`'s own `mode` is `private`, so
  it's set exactly once, at construction, and never exposed for an
  outside caller to read or reassign.
- **`private`** — an access modifier restricting visibility to the
  declaring class itself; `Sine`'s own `mode` uses it because nothing
  outside `Sine` ever needs to read which angle mode a specific `Sine`
  instance was built with — `apply` is the only thing that ever needs it.
- **`return`** — exits a function immediately with a given value; every
  function in this lesson with a body wrapped in `{ }` (as opposed to a
  single-expression `=` body) uses it explicitly to produce its own
  result.
- **`@Test`** — a JUnit annotation marking a function as a real,
  independently runnable test case, discovered and executed automatically
  by the test runner with no manual registration; every one of this
  lesson's five new permanent tests carries it.

## Objects and methods used

- **`Double`**
  - What it is: Kotlin's real, built-in type representing a 64-bit,
    double-precision, IEEE-754 floating-point number — the type every
    fractional numeric literal in this lesson (`0.1`, `16.0`, `-1.0`) is
    inferred as.
  - Implementation: `kotlin.Double`, a real, final class in the Kotlin
    standard library, holding 64 bits split (per the IEEE-754 standard it
    implements) into a sign bit, an 11-bit exponent, and a 52-bit
    fraction — meaning it can represent an enormous range of magnitudes,
    but only a finite number of distinct exact values, never every real
    number that exists between two of them.
  - Its use: every one of this lesson's new real functions
    (`SquareRoot.apply`, `toRadians`, `Sine.apply`) takes and returns
    `Double`, because this is the first time this project needs a number
    that isn't a whole count — a converted angle, an irrational square
    root, a trigonometric ratio.
  - Type: a `final class` in `kotlin`, compiled, on the JVM, to the
    primitive `double`.
  - Responsibility: represents a fractional or very large/small real
    number using a fixed, finite binary encoding, and defines the
    arithmetic operators (`+`, `-`, `*`, `/`) and comparison operators
    (`==`, `<`) that make it usable as an ordinary numeric type.
  - Depends on: nothing external — it's a foundational type in the
    standard library, same tier as `Int`, `Boolean`, and `String`.
  - Connects to: every arithmetic expression and every `kotlin.math`
    function this lesson calls, since all of them are typed to accept
    and/or return `Double` specifically.
  - Shape: a foundational, built-in value type sitting beneath every
    other real construct this lesson adds — every new class, function,
    and test in this lesson exists to operate on or produce a `Double`.

- **`kotlin.math.abs`**
  - What it is: a real, top-level function in the Kotlin standard
    library's `kotlin.math` package, returning a value's absolute value
    (its distance from zero, always non-negative).
  - Implementation: `fun abs(x: Double): Double`, one of several real
    overloads (also `abs(Int)`, `abs(Float)`, `abs(Long)`) — the `Double`
    overload is the one this lesson calls, since every value it's applied
    to here is already a `Double`.
  - Its use: this lesson's own approximate-equality check needs the
    *size* of the gap between two `Double` values, regardless of which
    one is larger — `abs(sum - 0.3)` turns a possibly-negative difference
    into an always-non-negative one before comparing it against a small
    tolerance.
  - Type: a top-level (free) function, not a member of any class.
  - Responsibility: computes and returns one value's magnitude, with no
    side effects and no dependency on anything beyond its own single
    argument.
  - Depends on: one `Double` argument, `x`.
  - Connects to: called directly inside this lesson's own
    approximate-equality lab and, later, inside
    `ScientificFunctionsTest.kt`'s own permanent tests, wherever a
    computed `Double` needs comparing against an expected value within a
    tolerance rather than exactly.
  - Shape: a small, stateless utility sitting in the Kotlin standard
    library's public API surface — the same tier as `println` or
    `listOf`, callable from anywhere with the right import.

- **`kotlin.math.sqrt`**
  - What it is: a real, top-level function computing a real number's
    non-negative square root.
  - Implementation: `fun sqrt(x: Double): Double`, delegating, on the
    JVM, to `java.lang.Math.sqrt` — confirmed for real this session: for
    a valid non-negative input it returns the real, exact or
    nearest-representable square root (`sqrt(16.0)` returns exactly
    `4.0`; `sqrt(2.0)` returns `1.4142135623730951`, `Double`'s own
    closest representable approximation of the true, irrational √2); for
    a negative input it does not throw or crash — it silently returns
    the special `Double` value `NaN` ("Not a Number").
  - Its use: this is the real square-root computation `SquareRoot.apply`
    performs, once its own domain check has already confirmed the input
    is safe to hand to it.
  - Type: a top-level (free) function.
  - Responsibility: computes one real number's square root and returns
    it, or returns `NaN` for an input outside its own real mathematical
    domain — it does not itself validate or reject invalid input.
  - Depends on: one `Double` argument, `x`.
  - Connects to: called from inside `SquareRoot.apply`, only ever after
    that method's own `if (value < 0)` check has already passed —
    `sqrt` itself is never the thing deciding whether an input is valid.
  - Shape: a small, stateless standard-library utility, sitting one layer
    beneath this project's own `SquareRoot` class, which exists
    specifically to add the domain-safety `sqrt` itself does not provide.

- **`IllegalArgumentException`**
  - What it is: a real, standard, built-in exception type representing
    exactly one situation — a caller passed an argument that violates a
    function's own stated contract.
  - Implementation: `kotlin.IllegalArgumentException`, a real class
    extending `RuntimeException`, constructible with an optional
    `message: String?` describing what was wrong; this project's own
    earlier, diagnostic domain-error work already previewed this exact
    type, over `Int`-only hand-written functions — this lesson is its first real,
    permanent appearance in this project's actual, shipped code.
  - Its use: `SquareRoot.apply` throws one, with a real, specific message
    naming the actual bad value, the moment it sees a negative input —
    rejecting it loudly and immediately, instead of letting
    `kotlin.math.sqrt` silently return `NaN`.
  - Type: a `class`, in the Kotlin standard library, extending
    `RuntimeException`.
  - Responsibility: represents, and carries a human-readable description
    of, one specific real failure — an argument that fails a function's
    own precondition — so calling code (or a human reading a stack trace)
    knows exactly what went wrong and why.
  - Depends on: a `message: String?` describing the failure, supplied at
    construction.
  - Connects to: thrown by `SquareRoot.apply`; caught, in this lesson's
    own throwaway lab, by a matching `catch (e: IllegalArgumentException)`
    block; asserted directly, in `ScientificFunctionsTest.kt`'s own
    permanent test, via `assertThrows`.
  - Shape: a public, standard-library type sitting at this project's own
    domain-error boundary — the same real role this project's own
    `ArithmeticException`-based division-by-zero fix already established,
    now proven for a second, different real failure mode.

- **`ScientificFunction`**
  - What it is: a new, real, permanent `fun interface` this lesson adds
    to this project — a single, uniform shape any one-argument,
    `Double`-to-`Double` scientific function can satisfy.
  - Implementation: `fun interface ScientificFunction { fun apply(value: Double): Double }`
    — structurally identical in shape to this project's own earlier,
    throwaway `UnaryFunction`, but real and permanent this
    time, and typed over `Double` instead of `Int`, since a genuine
    scientific function needs fractional precision `UnaryFunction`'s own
    placeholder `Square`/`Negate` implementations never did.
  - Its use: gives `SquareRoot` and `Sine` — two functions with genuinely
    different real implementations — one common, interchangeable shape,
    the same real motivation this project's own `Operation` interface
    already proved for two-operand arithmetic back in Stage 0.
  - Type: a `fun interface` (SAM — Single Abstract Method — interface).
  - Responsibility: defines the one real contract every scientific
    function this project has must satisfy — accept one `Double`, return
    one `Double` — with no opinion at all about how any specific
    implementation computes that return value.
  - Depends on: nothing on its own; it's a pure contract.
  - Connects to: implemented by `SquareRoot` and `Sine`, both added in
    this same lesson; any future scientific function this project adds
    (`cos`, `log`, a power function) would implement it the same way.
  - Shape: a public API surface inside this project's own domain layer —
    `ScientificFunctions.kt`, alongside `Calculator.kt`, both real,
    Compose-free files with no Android dependency at all.

- **`SquareRoot`**
  - What it is: a new, real, permanent class — this project's own first
    real, working scientific function.
  - Implementation: `class SquareRoot : ScientificFunction`, overriding
    `apply(value: Double): Double`; its real body checks `value < 0` and
    throws before ever calling `kotlin.math.sqrt`.
  - Its use: the real, permanent, closing piece of a promise this
    curriculum has carried since its own earlier, diagnostic domain-error
    work — a genuine, `Double`-based, domain-checked square root,
    previewed there using only `Int` arithmetic because `Double` didn't
    exist in this project yet.
  - Type: a `class` implementing `ScientificFunction`.
  - Responsibility: computes a real number's square root for any valid,
    non-negative input, and rejects any invalid, negative input with a
    clear, real, immediate exception instead of letting a silent `NaN`
    propagate.
  - Depends on: a `Double` value, handed to `apply`; `kotlin.math.sqrt`,
    for the actual computation once the domain check has passed.
  - Connects to: constructed and called directly in this lesson's own
    permanent test file; has no other real caller yet inside this
    project — the same honest, open state this project's own
    `Tokenizer.kt` was left in when it was first added, before a later
    lesson gave it one.
  - Shape: a concrete implementation sitting behind `ScientificFunction`'s
    own public interface, inside this project's domain layer.

- **`kotlin.math.PI`**
  - What it is: a real, top-level constant in `kotlin.math` — the
    mathematical constant π, the ratio of a circle's circumference to its
    diameter.
  - Implementation: `const val PI: Double = 3.141592653589793` — a real,
    compile-time constant, holding `Double`'s own closest representable
    approximation of the true, irrational value of π, confirmed for real
    this session by printing it directly.
  - Its use: `toRadians` needs π to convert a degree value into radians
    at all — the conversion `degrees × π ÷ 180` is the actual
    mathematical definition of the relationship between the two units,
    and nothing about it can be expressed using only whole-number, `Int`
    arithmetic.
  - Type: a top-level `const val` (a compile-time constant property, not
    a function).
  - Responsibility: provides one fixed, precomputed, real value — never
    recalculated, never dependent on any input — for any calculation in
    this project that needs π.
  - Depends on: nothing; it's a literal constant.
  - Connects to: read directly inside `toRadians`'s own `DEGREES` branch;
    nowhere else in this project yet.
  - Shape: a small, stateless piece of the Kotlin standard library's own
    public surface, same tier as `kotlin.math.sqrt` and `kotlin.math.sin`.

- **`kotlin.math.sin`**
  - What it is: a real, top-level function computing the trigonometric
    sine of an angle.
  - Implementation: `fun sin(x: Double): Double`, delegating, on the JVM,
    to `java.lang.Math.sin` — its own real, documented contract expects
    `x` in **radians**, never degrees, which is exactly why this project
    needs a real conversion function before ever calling it with a
    user-facing angle.
  - Its use: `Sine.apply`'s own real computation, called only after
    `toRadians` has already converted whatever unit the caller supplied
    into the radians this function actually expects.
  - Type: a top-level (free) function.
  - Responsibility: computes and returns one angle's sine, under the
    strict assumption that its caller has already supplied that angle in
    radians — it performs no unit conversion or validation of its own.
  - Depends on: one `Double` argument, `x`, already in radians.
  - Connects to: called from inside `Sine.apply`, always downstream of a
    `toRadians` call in the same expression.
  - Shape: a small, stateless standard-library utility, the trigonometric
    counterpart to `sqrt`, sitting one layer beneath this project's own
    `Sine` class.

- **`AngleMode`**
  - What it is: a new, real, permanent `enum class` this project adds —
    the two real units a calculator's own angle input could ever
    actually be measured in.
  - Implementation: `enum class AngleMode { DEGREES, RADIANS }` — exactly
    two constants, no associated data, no custom methods.
  - Its use: closes the real, structural gap this project's own earlier,
    diagnostic angle-mode work already found and deliberately left
    open — converting between degrees and radians only
    means something once the value being converted knows, unambiguously,
    which unit it currently is.
  - Type: an `enum class`.
  - Responsibility: represents exactly one of two mutually exclusive,
    exhaustive real states — an angle is in `DEGREES`, or it is in
    `RADIANS`, never both, never neither, and the compiler enforces that
    exhaustiveness on any `when` that branches over it.
  - Depends on: nothing; it's a self-contained, closed set of values.
  - Connects to: passed into `toRadians` alongside a raw angle value;
    passed into `Sine`'s own constructor, fixing which unit a specific
    `Sine` instance always expects.
  - Shape: a small, public, closed vocabulary type sitting inside this
    project's own domain layer.

- **`toRadians`**
  - What it is: a new, real, permanent, top-level function this lesson
    adds — this project's own actual degree-to-radian (and, when already
    in radians, pass-through) conversion.
  - Implementation: `fun toRadians(angle: Double, mode: AngleMode): Double`,
    returning `angle * PI / 180.0` for `DEGREES` and `angle` unchanged
    for `RADIANS`.
  - Its use: the real, permanent, closing piece of a second promise this
    curriculum has carried since its own earlier, diagnostic angle-mode
    work — a genuine conversion function that finally exists now that
    `Double` and `PI` are both
    real and available.
  - Type: a top-level (free) function.
  - Responsibility: converts one real angle value, in whichever of the
    two real `AngleMode` units it currently is, into the radians every
    one of this project's real trigonometric functions actually
    requires — and does nothing at all beyond that one conversion.
  - Depends on: a `Double` angle value; an `AngleMode` stating which unit
    that value is currently in; `kotlin.math.PI`, for the `DEGREES`
    branch's own real computation.
  - Connects to: called from inside `Sine.apply`, immediately before
    `kotlin.math.sin`; called directly, on its own, in this lesson's own
    permanent test proving the conversion itself is correct independent
    of any trig function built on top of it.
  - Shape: a small, public, pure function inside this project's own
    domain layer — no class, no state, callable on its own.

- **`Sine`**
  - What it is: a new, real, permanent class — this project's own first
    real, working, angle-mode-aware trigonometric function.
  - Implementation: `class Sine(private val mode: AngleMode) : ScientificFunction { override fun apply(value: Double): Double { return sin(toRadians(value, mode)) } }`
    — its own `mode` fixed once, at construction, never changed
    afterward.
  - Its use: proves, with a real, computed, executed result, that a value
    entering this project as a user-facing degree can be correctly
    converted and correctly evaluated by a real trigonometric function —
    closing the same forward-reference `toRadians` closes, from the
    other end (an actual caller, not just the conversion in isolation).
  - Type: a `class` implementing `ScientificFunction`, with a real
    primary-constructor property.
  - Responsibility: computes the sine of one angle, in whichever real
    unit its own `mode` was constructed with, by first converting that
    angle to radians and only then calling the real trigonometric
    function that expects them.
  - Depends on: a `Double` value, handed to `apply`; its own
    `mode: AngleMode`, fixed at construction; `toRadians` and
    `kotlin.math.sin`, for the actual conversion and computation.
  - Connects to: constructed and called directly in this lesson's own
    permanent test file; like `SquareRoot`, has no other real caller
    inside this project yet.
  - Shape: a concrete implementation sitting behind `ScientificFunction`'s
    own public interface, alongside `SquareRoot`, inside this project's
    domain layer. **Honest, real design limitation, worth recording**:
    because `mode` is fixed at construction, one `Sine` instance can only
    ever answer for one angle unit — a real Scientific-mode UI letting a
    user switch between degrees and radians would need to construct a
    fresh `Sine` (or hold `mode` differently) rather than reusing one
    instance across a mode switch; not a problem yet, since nothing in
    this project switches modes at runtime, but worth knowing before a
    future lesson wires this up to a real UI.

### Everything else in the file, not this lesson's subject but still explained

- **`println`**
  - What it is: a real, top-level function in the Kotlin standard library
    printing a value's string representation to standard output, followed
    by a newline.
  - Implementation: `fun println(message: Any?)`, among several real
    overloads — converts its argument via `toString()` (or prints an
    empty line for the no-argument overload) and writes it to
    `System.out`.
  - Its use: every real value this lesson's throwaway labs compute — a
    sum, a difference, a boolean, a converted angle — is made visible
    through it, since these labs exist only to be read and then
    discarded.
  - Type: a top-level (free) function.
  - Responsibility: writes one value's textual representation to the
    console and nothing else — no return value worth using, no effect
    beyond the printed line.
  - Depends on: one argument (of nearly any type) to print.
  - Connects to: called repeatedly inside every one of this lesson's
    three throwaway labs; never appears in this project's own real,
    permanent code, which reports results through function return values
    instead.
  - Shape: a small, standard-library utility, same tier as
    `abs`/`sqrt`/`sin`, used here exclusively for temporary, human-facing
    lab output.

- **`main`**
  - What it is: the real, standard entry-point function every one of this
    lesson's three standalone throwaway labs is run through.
  - Implementation: `fun main()` — Kotlin also allows
    `fun main(args: Array<String>)`, but none of this lesson's labs need
    any command-line argument, so the no-argument form is used
    throughout.
  - Its use: gives each isolated lab a real, runnable starting point,
    compiled and executed directly via `kotlinc`, entirely outside this
    project's own Android/Gradle build.
  - Type: a top-level (free) function, specially recognized by the
    Kotlin compiler as a program's real entry point.
  - Responsibility: the one function the JVM itself calls first when a
    compiled Kotlin file is run — everything else in that file only runs
    because something inside `main`, directly or indirectly, calls it.
  - Depends on: nothing required, beyond existing as a real top-level
    declaration in a compiled file.
  - Connects to: calls every other function this lesson's own labs
    define — `abs`, `sqrt`, `sin`, `toRadians` — none of which would ever
    execute in a standalone lab without it.
  - Shape: the outermost real boundary of each throwaway lab — never
    present in this project's own permanent files, which have no entry
    point of their own and only ever run inside the Android app or a
    JUnit test.

- **`assertEquals` (with a real `delta` argument)**
  - What it is: a real, static method from JUnit's own `org.junit.Assert`
    class, asserting two `Double` values are equal within a stated
    tolerance — a genuinely different real overload than the
    `assertEquals(Object, Object)` this project's own earlier testing
    work already gave full treatment to.
  - Implementation: `public static void assertEquals(double expected, double actual, double delta)`
    — passes only if `Math.abs(expected - actual) <= delta`; this
    project's own test uses a real `delta` of `0.0`, since
    `kotlin.math.sqrt(16.0)` is confirmed, this session, to return
    exactly `4.0` with no floating-point error at all for this specific,
    perfect-square input.
  - Its use: `squareRootOfAPerfectSquareIsExact` needs to assert an exact
    `Double` result — this specific overload exists precisely because
    plain `Double` equality (this lesson's own Unit 1 finding) is *not*
    generally safe to assert with the two-argument, `Object`-based
    overload this project already knows.
  - Type: a `static` method on `org.junit.Assert`.
  - Responsibility: fails a test with a real, descriptive JUnit assertion
    error the moment two `Double` values differ by more than the stated
    tolerance; passes silently otherwise.
  - Depends on: an expected value, an actual value, and a tolerance, all
    `Double`.
  - Connects to: called once, in `ScientificFunctionsTest.kt`'s own
    `squareRootOfAPerfectSquareIsExact`; every other new `Double`-comparing
    test in this lesson instead uses `assertTrue` with an explicit
    `abs(...) < epsilon` check, since their own expected results are not
    exact.
  - Shape: part of JUnit's own public assertion API, the same library
    surface `assertEquals(Object, Object)` and `assertThrows` already
    come from.

- **`assertThrows`**
  - What it is: a real, static method from `org.junit.Assert`, asserting
    that running a given block of code throws an exception of a specific
    real type — already given full treatment in this project's own
    earlier division-by-zero work.
  - Implementation: `public static <T extends Throwable> T assertThrows(Class<T> expectedType, ThrowingRunnable runnable)`
    — runs `runnable`, fails the test if nothing is thrown or the wrong
    type is thrown, and otherwise returns the real caught exception for
    further inspection.
  - Its use: `squareRootOfANegativeNumberThrowsARealDomainError` proves,
    for real, that `SquareRoot.apply(-1.0)` throws
    `IllegalArgumentException` — the actual, permanent, tested proof
    behind this lesson's own headline claim, not just a comment asserting
    it.
  - Type: a generic, `static` method on `org.junit.Assert`.
  - Responsibility: runs a real block of code and turns "did this throw
    the right thing" into a pass/fail assertion, rather than requiring a
    hand-written `try`/`catch`/`fail()` sequence to do the same job.
  - Depends on: a `Class<T>` naming the expected exception type; a
    `ThrowingRunnable` — here, a real Kotlin lambda — containing the code
    expected to throw.
  - Connects to: called once, in `ScientificFunctionsTest.kt`; the code
    it runs calls `SquareRoot.apply` directly.
  - Shape: part of JUnit's own public assertion API.

- **`assertTrue`**
  - What it is: a real, static method from `org.junit.Assert`, asserting
    a given boolean condition is `true`, failing the test if it is not.
  - Implementation: `public static void assertTrue(boolean condition)`,
    among a few real overloads (one accepting a custom failure message
    first) — this lesson's own tests use the plain, single-argument
    form.
  - Its use: this lesson's own three approximate-`Double` tests
    (`toRadiansConvertsNinetyDegreesToApproximatelyHalfPi`,
    `sineOfNinetyDegreesIsApproximatelyOne`,
    `sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero`) all
    assert an `abs(...) < epsilon`-shaped condition, since none of their
    expected results is safe to assert with exact `Double` equality.
  - Type: a `static` method on `org.junit.Assert`.
  - Responsibility: fails a test with a real, descriptive JUnit assertion
    error the moment its given condition evaluates to `false`; passes
    silently otherwise.
  - Depends on: one `Boolean` condition.
  - Connects to: called four times total across this lesson's own new
    tests — three approximate-equality checks, plus one explicit
    `result != 0.0` check proving `sin(180° in radians)` is genuinely
    nonzero, not just approximately checked against zero.
  - Shape: part of JUnit's own public assertion API.

- **`Throwable.message`**
  - What it is: a real, public, read-only property every real `Throwable`
    (the real superclass of every exception, including
    `IllegalArgumentException`) carries.
  - Implementation: `open val message: String?` — nullable, since not
    every real exception is guaranteed to have been constructed with a
    description.
  - Its use: this lesson's own throwaway lab reads it, inside a `catch`
    block, to print the real, actual message `IllegalArgumentException`'s
    own constructor was given — proving the thrown exception really does
    carry the specific, descriptive text this project's own domain check
    supplied, not just that *something* was thrown.
  - Type: an open, real instance property on `kotlin.Throwable`.
  - Responsibility: exposes whatever human-readable description an
    exception was constructed with, if any.
  - Depends on: a real, already-caught `Throwable` instance to read it
    from.
  - Connects to: read once, inside `lab2_domain_checked_sqrt.kt`'s own
    `catch` block; this project's own permanent test file never reads it
    directly, since `assertThrows` only needs to confirm the real type
    thrown, not its message text.
  - Shape: a real, inherited member every exception this project ever
    throws or catches automatically carries, part of the Kotlin standard
    library's own `Throwable` base class.

---

## Concept Unit: Double, Precision, and Approximate Equality

### The Problem

Every real value this project has computed since its very first working
program has been an `Int` — a whole number, with no fractional part,
stored exactly. That has
never once caused a problem, because nothing this project has done so
far actually needed anything *between* two whole numbers. That changes
the moment Stage 6 asks for real scientific math: a real square root
(`√2`, not just `√4`) is irrational — it has no exact, finite decimal
representation at all — and a real angle conversion needs π, itself
irrational. Neither of those can be represented by `Int`. This project
needs a type that can hold a fractional value. But a computer's own
memory is finite — a fixed number of bits per value — and an irrational
number, by definition, has infinitely many digits. Something has to
give.

> **Stop and think, before reading on:**
> - Given that `Int` can only ever hold a whole number, what type would
>   you reach for to hold something like `3.14`, or the result of
>   dividing `1` by `3`?
> - If a computer stores every number in binary, using a fixed, finite
>   number of bits, can it always store a value like `0.1` exactly — the
>   same way it stores `2` exactly? What might happen if it can't?
> - Predict: if you write `0.1 + 0.2 == 0.3` in Kotlin, using the `==`
>   this project has already proven checks real structural equality, do
>   you expect that to print `true` or `false`?

### Introduce the Concept in Isolation

```kotlin
import kotlin.math.abs

fun main() {
    val sum = 0.1 + 0.2
    println(sum)
    println(sum == 0.3)

    val difference = sum - 0.3
    println(difference)

    val epsilon = 0.0000001
    println(abs(sum - 0.3) < epsilon)
}
```

Real, executed output:

```
0.30000000000000004
false
5.551115123125783E-17
true
```

This proves something surprising and real: `0.1 + 0.2` does not print
`0.3` — it prints `0.30000000000000004`, and comparing it against the
literal `0.3` with `==` genuinely returns `false`. This isn't a bug in
Kotlin, or in this specific computer — it's a direct consequence of how
every `Double` is stored. Internally, a `Double` is a binary
(base-2) fraction, not a decimal (base-10) one. `0.1` in decimal has no
exact, finite representation in binary — the same way `1/3` has no exact,
finite representation in decimal (`0.333...`, forever). Kotlin's own
`Double` stores the *closest representable* binary approximation of
`0.1`, and the closest approximation of `0.2`, and adding those two
approximations together produces a result that is the closest
approximation of `0.30000000000000004`, not `0.3`. This is called
**floating-point representation** — a fixed-size binary encoding that can
represent an enormous range of values, but never all of them exactly.
The real, printed `difference`, `5.551115123125783E-17`, is that tiny
gap made visible: not zero, but small enough that it's easy to
mistake for zero if you don't look closely. The fix is not to expect
exact equality from `Double` at all — instead, compare how *close* two
values are, using a small tolerance (`epsilon`) as the threshold for
"close enough to call equal." This is called **approximate equality**,
and the real, printed `true` on the last line is the proof it works:
even though `sum == 0.3` is `false`, `abs(sum - 0.3) < epsilon` is
`true`, because the real gap between them is about
`0.00000000000000006` — far smaller than the `0.0000001` tolerance this
lab chose.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real, printed output already proved what it needed to: `Double` cannot
be trusted with `==`, and an epsilon-based comparison can be.

### Mechanical Walkthrough

- `import kotlin.math.abs` — brings `kotlin.math`'s own top-level `abs`
  function into scope, unqualified; without it, this file would have to
  write the fully qualified `kotlin.math.abs(...)` at every call site.
- `fun main()` — the real entry point this lab is run through; the JVM
  calls it first, and every other line in this lab only runs because
  `main`'s own body reaches it in sequence.
- `val sum = 0.1 + 0.2` — declares a read-only local binding, `sum`,
  assigned exactly once. `0.1` and `0.2` are both Double literals — each
  one, individually, is already an approximation, since neither `0.1` nor
  `0.2` has an exact binary representation. `+` is ordinary addition,
  reused from every arithmetic operation this project has performed since
  Stage 0, now operating on two `Double` operands instead of two `Int`
  ones — and the real result it computes is itself a third approximation,
  compounding the first two.
- `println(sum)` — prints `sum`'s own real value, revealing the
  approximation directly: `0.30000000000000004`, not the `0.3` a human
  would expect from adding `0.1` and `0.2` on paper.
  Real, printed output for this call, from this session's own actual
  run: `0.30000000000000004`.
- `println(sum == 0.3)` — `==` calls `Double`'s own real `equals`
  method, the same structural-equality mechanism already proven for
  `Int` and for this project's own `data class`es — but here, the two
  operands are `sum` (the real, computed approximation
  `0.30000000000000004`) and a fresh Double literal, `0.3` (its own,
  separately computed closest approximation). Because those two
  approximations are not bit-for-bit identical, `equals` correctly
  reports them as unequal.
  Real, printed output: `false`.
- `val difference = sum - 0.3` — ordinary subtraction, reused from Stage
  0, computing the real, tiny gap between the two approximations
  directly, as its own `Double` value.
- `println(difference)` — prints that real gap.
  Real, printed output: `5.551115123125783E-17` — a number expressed in
  scientific notation (`5.55...` times `10` to the `-17`), meaning
  roughly `0.0000000000000000555` — vanishingly small, but, per the line
  above, provably not zero.
- `val epsilon = 0.0000001` — declares a chosen tolerance: any gap
  smaller than this is treated as "close enough to call equal." This
  specific value is a deliberate choice, not a fixed language rule —
  different real applications (a physics simulation, a financial
  calculation) would choose a different tolerance depending on how much
  imprecision that application can actually tolerate.
- `println(abs(sum - 0.3) < epsilon)` — `abs(sum - 0.3)` recomputes the
  same real difference from two lines above and passes it to `kotlin.math.abs`,
  which strips any negative sign, guaranteeing a non-negative result
  regardless of which operand happened to be larger; `<` then compares
  that non-negative gap against `epsilon`. This is the real mechanism of
  approximate equality: not "are these two values identical," but "is
  the distance between them small enough not to matter."
  Real, printed output: `true`.

### CS Lens

**Floating-point representation** is a real, foundational computer
science idea — how a computer approximates the infinite, continuous
number line using a finite number of bits — and, per this project's own
established standard for a hard concept, it's worth naming several
places the same idea recurs, not just this one:

```
Also recognized in: every scripting language's own "0.1 + 0.2" surprise
(JavaScript, Python, and Ruby all show the identical result, since all
of them use the same IEEE-754 double-precision format Kotlin's own
Double does); financial software deliberately choosing a fixed-point or
decimal type instead of Double, specifically to avoid this; audio and
signal-processing code comparing sample values with a tolerance instead
of exact equality; a game engine's own collision detection using an
epsilon rather than checking two positions for exact equality; GPS and
mapping software comparing coordinates the same way.
```

### SE Lens

Why compare with an epsilon rather than switching to a different, exact
numeric type entirely? A real alternative exists — a fixed-point or
arbitrary-precision decimal type (the shape real financial software
reaches for, specifically because money can never tolerate silent
rounding error). This project doesn't reach for one: an exact decimal
type is dramatically slower than a primitive `Double`, and everything
Stage 6 actually needs — angle conversion, square roots, trigonometry —
is scientific and engineering math, not currency, a domain where a tiny,
bounded approximation error is the normal, accepted cost of real
floating-point speed, not a defect that has to be eliminated. The real,
honest cost being accepted here: every future scientific-function test
this project writes has to remember to compare with a tolerance, never
bare `==`, or it will eventually fail for a value that is, for all
practical purposes, correct.

### Commands Needed

- `kotlinc lab1_double_precision.kt -include-runtime -d lab1.jar` —
  invokes the real Kotlin compiler (`kotlinc`) on this lab's own single
  file, `-include-runtime` bundles the Kotlin standard library into the
  output so the result can run standalone, `-d lab1.jar` names the real
  compiled output file. Success produces no output at all — a compiler
  that succeeds silently, the same real behavior this project has relied
  on since Stage 0.
- `java -jar lab1.jar` — runs the real, compiled program directly with
  the JVM, printing this lab's own real output to the terminal.

### Run It

Already shown above, under "Introduce the Concept in Isolation" — the
real, executed output was:

```
0.30000000000000004
false
5.551115123125783E-17
true
```

### Connect the Pieces

`Double` and approximate equality are this lesson's own foundation —
every real function the next two units add (`SquareRoot`, `toRadians`,
`Sine`) computes a `Double`, and every real test this lesson writes
against one of them has to decide, correctly, whether that result needs
exact or approximate comparison, using exactly the reasoning just proven
here.

---

## Concept Unit: A Domain-Checked Square Root

### The Problem

This project's own earlier, diagnostic domain-error work already proved,
using nothing but hand-written `Int` code, exactly what a domain error is
and exactly what
checking for one looks like — `integerSquareRoot`, given a negative
input, either had to throw a real exception or silently return a
plausible-looking wrong answer (`0`), and this project deliberately chose
to throw. But `integerSquareRoot` was never real, permanent project
code — it existed only to prove the pattern, using safe, whole-number
arithmetic, before this project had any way to compute a real,
irrational square root at all. Now that the unit above has given this
project a real `Double`, a real square root — one that can return
`1.4142135623730951`, not just a whole number — finally becomes
possible. But `kotlin.math.sqrt`, the Kotlin standard library's own real
square-root function, is a piece of code this project didn't write and
can't change. The real question this unit has to answer: what does that
real function actually do when handed a real, negative `Double` — and is
its own default behavior something this project can safely rely on?

> **Stop and think, before reading on:**
> - This project's own earlier, diagnostic domain-error work already
>   proved that `integerSquareRoot(-1)`, left unchecked, would silently return a
>   plausible-looking wrong answer, `0`. Now that `sqrt` is a real
>   function operating on real `Double`s instead of hand-written `Int`
>   code — what do you expect `kotlin.math.sqrt(-1.0)` to do: crash,
>   throw, or return some other value?
> - If `kotlin.math.sqrt` doesn't throw or crash on a negative input,
>   what real problem could that create for a calculator user who tries
>   `√(-1)` and sees whatever it does print?
> - Given the domain-check pattern this project's own earlier, diagnostic
>   work already proved — check first, throw before computing — what
>   would the equivalent real code look like for a `Double`-based square root
>   function, instead of the `Int`-based one already proven?

### Introduce the Concept in Isolation

```kotlin
import kotlin.math.sqrt

fun main() {
    println(sqrt(16.0))
    println(sqrt(2.0))
    println(sqrt(-1.0))

    try {
        val input = -1.0
        if (input < 0) {
            throw IllegalArgumentException("Cannot take the square root of a negative number: $input")
        }
        println(sqrt(input))
    } catch (e: IllegalArgumentException) {
        println("guarded sqrt(-1.0) -> ${e.message}")
    }
}
```

Real, executed output:

```
4.0
1.4142135623730951
NaN
guarded sqrt(-1.0) -> Cannot take the square root of a negative number: -1.0
```

This proves the real, decisive fact this unit needed: `kotlin.math.sqrt(-1.0)`
does **not** throw and does **not** crash — it silently returns `NaN`
("Not a Number"), a special `Double` value. This is a genuinely different
failure shape than `integerSquareRoot`'s own silent wrong answer (`0`) —
`NaN` is at least a visibly strange value rather than a plausible-looking
wrong one — but it's still silent: nothing stops a `NaN` from being
printed straight to a calculator's own display, or from propagating
through several more calculations before anyone notices something went
wrong. The guarded version, underneath, shows the real fix: check the
domain explicitly, before ever calling `sqrt` at all, and throw a real,
descriptive `IllegalArgumentException` the moment an invalid input is
seen — the same real pattern this project's own earlier, diagnostic
domain-error work already proved, now applied to a real `Double`
function for the first time.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: `kotlin.math.sqrt` alone
is not domain-safe, and an explicit guard, matching this project's own
established pattern, is.

### Project Change

- **Reference Source**: no reference counterpart — this is a from-scratch
  addition. This project has no external reference implementation it's
  being built toward for scientific functions; the design (a `fun
  interface`, a per-function domain check, a real `IllegalArgumentException`)
  follows this project's own already-established patterns, from its own
  earlier `UnaryFunction` shape and its own earlier domain-check shape,
  now adapted from `Int` to real `Double`.
- **Files affected**: created
  `app/src/main/java/com/example/calculator/ScientificFunctions.kt`;
  created
  `app/src/test/java/com/example/calculator/ScientificFunctionsTest.kt`.
- **Change type**: add (both are brand-new files).
- **Location**: n/a — both are brand-new files, with nothing existing yet
  to locate a position within.
- **Dependencies**: `kotlin.math`, part of the Kotlin standard library
  already available on this project's classpath — no new Gradle
  dependency needed.

### The New Code

```kotlin
fun interface ScientificFunction {
    fun apply(value: Double): Double
}

class SquareRoot : ScientificFunction {
    override fun apply(value: Double): Double {
        if (value < 0) {
            throw IllegalArgumentException("Cannot take the square root of a negative number: $value")
        }
        return sqrt(value)
    }
}
```

This same unit also adds a second, real, permanent file — a matching
pair of tests, proving `SquareRoot`'s own two real behaviors (a correct
computation; a thrown domain error) rather than only asserting them in
prose:

```kotlin
@Test
fun squareRootOfAPerfectSquareIsExact() {
    assertEquals(4.0, SquareRoot().apply(16.0), 0.0)
}

@Test
fun squareRootOfANegativeNumberThrowsARealDomainError() {
    assertThrows(IllegalArgumentException::class.java) {
        SquareRoot().apply(-1.0)
    }
}
```

### The Updated Project

Since `ScientificFunctions.kt` is a brand-new file, the code above *is*
the whole file so far — shown here in full, numbered, with its own
`package` declaration and import:

```kotlin
 1: package com.example.calculator
 2:
 3: import kotlin.math.sqrt
 4:
 5: fun interface ScientificFunction {
 6:     fun apply(value: Double): Double
 7: }
 8:
 9: class SquareRoot : ScientificFunction {
10:     override fun apply(value: Double): Double {
11:         if (value < 0) {
12:             throw IllegalArgumentException("Cannot take the square root of a negative number: $value")
13:         }
14:         return sqrt(value)
15:     }
16: }
```

This file now holds this project's own real scientific-function contract
(`ScientificFunction`) and its first real implementation (`SquareRoot`) —
a genuine, working, domain-checked square root, ready to be called
directly from a test, with no Android or Compose dependency of any kind.
`ScientificFunctionsTest.kt`, also brand-new, is likewise shown here in
full, numbered:

```kotlin
 1: package com.example.calculator
 2:
 3: import org.junit.Assert.assertEquals
 4: import org.junit.Assert.assertThrows
 5: import org.junit.Test
 6:
 7: class ScientificFunctionsTest {
 8:     @Test
 9:     fun squareRootOfAPerfectSquareIsExact() {
10:         assertEquals(4.0, SquareRoot().apply(16.0), 0.0)
11:     }
12:
13:     @Test
14:     fun squareRootOfANegativeNumberThrowsARealDomainError() {
15:         assertThrows(IllegalArgumentException::class.java) {
16:             SquareRoot().apply(-1.0)
17:         }
18:     }
19: }
```

This second file now holds this project's own first two real, executed
proofs that `SquareRoot` behaves exactly as its own domain check
promises — a real safety net around the real code above, not just a
description of it.

### Mechanical Walkthrough

- `package com.example.calculator` (line 1) — declares this file's own
  namespace, the same one every other real file in this project already
  shares, so `Calculator.kt`, `Tokenizer.kt`, and every other file here
  can reference `ScientificFunction`/`SquareRoot` by their bare names,
  with no import required between them.
- `import kotlin.math.sqrt` (line 3) — brings the standard library's own
  top-level `sqrt` function into scope, unqualified, so line 14 can call
  it as `sqrt(value)` rather than the fully qualified
  `kotlin.math.sqrt(value)`.
- `fun interface ScientificFunction` (lines 5–7) — declares a new
  interface with exactly one abstract method, enabling SAM conversion,
  the same real mechanism this project's own `Operation` (Stage 0) and
  its own earlier, throwaway `UnaryFunction` already proved: any class — or,
  later, any lambda — matching this exact single-method shape can stand
  in wherever a `ScientificFunction` is expected.
  - `fun apply(value: Double): Double` (line 6) — the interface's one
    abstract member: a method named `apply`, taking one `Double`
    parameter named `value`, returning a `Double`. This is the entire
    real contract every scientific function this project has must
    satisfy — nothing about *how* the value is computed, only that a
    `Double` goes in and a `Double` comes out.
- `class SquareRoot : ScientificFunction` (lines 9–16) — declares
  a new, real, named class, `SquareRoot`; the `:` followed by
  `ScientificFunction` declares that this class implements that
  interface, taking on its real contract.
  - `override fun apply(value: Double): Double` (line 10) — `override`
    marks this method as fulfilling `ScientificFunction`'s own abstract
    `apply` member, not introducing an unrelated new one; without it, the
    compiler would reject this class for failing to implement the
    interface's required method.
  - `if (value < 0)` (line 11) — the real domain check, run
    first, before any computation: `<` compares `value` against the
    literal `0`, and `if` branches into the block only when that
    comparison is `true`.
  - `throw IllegalArgumentException("Cannot take the square root of a negative number: $value")`
    (line 12) — `throw` immediately halts this method's own execution and
    raises a new `IllegalArgumentException`, constructed with a real,
    specific message. `$value` is a string template: at the moment this
    line actually runs, Kotlin replaces `$value` with that real, specific
    bad input's own string representation — so a caller who passes
    `-4.0` sees `-4.0` named directly in the real thrown message, not a
    generic "invalid input" with no specifics.
  - `return sqrt(value)` (line 14) — only reached when line 11's check
    did *not* throw; calls the real, imported `kotlin.math.sqrt`
    function directly on `value`, and `return` sends that real result
    back to whichever caller invoked `apply`.
- `package com.example.calculator` (test file, line 1) — the same
  namespace declaration explained above, now heading this second, new
  file, so it too can reference `SquareRoot` by its bare name.
- `import org.junit.Assert.assertEquals` / `import org.junit.Assert.assertThrows` / `import org.junit.Test`
  (test file, lines 3–4, 6) — bring JUnit's own real assertion methods and
  its `@Test` annotation into scope, unqualified.
- `class ScientificFunctionsTest` (test file, line 7) — declares a new,
  real, plain class — no `: ScientificFunction`, no supertype at all —
  existing only to group this file's own real test functions together
  under one JUnit-discoverable name.
  - `@Test` (test file, lines 8 and 13) — marks each function immediately
    below it as a real, independently runnable test case; without it,
    JUnit would never discover or run either function at all.
  - `fun squareRootOfAPerfectSquareIsExact()` (test file, line 9) — an
    ordinary function declaration, its own long, descriptive name stating
    exactly what it proves, with no parameters and no explicit return
    type (Kotlin infers `Unit`, since a test's own real job is asserting,
    not returning a value).
  - `assertEquals(4.0, SquareRoot().apply(16.0), 0.0)` (test file, line
    10) — constructs a real `SquareRoot`, calls its own real `apply`
    directly on `16.0`, and asserts the real result against the literal
    `4.0` with a `delta` of `0.0` — safe here specifically because a
    perfect square's own square root has no floating-point error to
    tolerate.
  - `fun squareRootOfANegativeNumberThrowsARealDomainError()` (test
    file, line 14) — the same kind of function declaration as above, this
    time proving the domain check rather than a correct computation.
  - `assertThrows(IllegalArgumentException::class.java) { SquareRoot().apply(-1.0) }`
    (test file, lines 15–17) — passes a real Kotlin lambda (the code
    inside `{ }`) as `assertThrows`'s own second argument; that lambda
    constructs a `SquareRoot` and calls `apply(-1.0)` directly, and
    `assertThrows` fails the test unless running it genuinely throws a
    real `IllegalArgumentException`.

### CS Lens

**Domain errors** — a value valid by its own type, but outside the set
of inputs a specific function or operation is actually mathematically
defined for — are a real, recurring computer science idea this project's
own earlier, diagnostic domain-error work already introduced, using
`integerSquareRoot`'s and `integerLog2`'s own hand-written `Int` checks.
The same idea, now applied
to a real library function operating on real `Double` input:

```
Also recognized in: SQL's own division-by-zero or invalid-date
construction errors; a parser rejecting a malformed token before ever
attempting to build an AST from it; a filesystem API refusing a filename
containing invalid characters; a network library validating a URL's own
shape before ever attempting to connect to it; this project's own
Division and Modulo, already refusing a zero amount since this
project's own real division-by-zero fix.
```

### SE Lens

Why throw a real `IllegalArgumentException` instead of letting
`kotlin.math.sqrt` return its own `NaN` and checking for that afterward?
A real alternative exists: call `sqrt` unconditionally, then check
`result.isNaN()` after the fact. This project doesn't do that — an
immediate, loud failure at the exact call site that caused it, carrying a
specific, descriptive message naming the actual bad value, is far easier
to debug than a `NaN` that might not even be checked before it silently
propagates through several more calculations first, corrupting a chain of
otherwise-valid results before anyone notices. The real, honest cost:
every scientific function this project adds from here on has to remember
to check its own domain explicitly — `kotlin.math`'s own functions
provide zero enforcement of this by default, unlike a compile-time-checked
API that would reject an invalid call before it ever ran.

### Commands Needed

- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ScientificFunctionsTest.squareRootOfAPerfectSquareIsExact" --tests "com.example.calculator.ScientificFunctionsTest.squareRootOfANegativeNumberThrowsARealDomainError"`
  — invokes this project's real Gradle wrapper, `./gradlew`, running only
  this unit's own two new tests via two `--tests` filters (one per test
  method's fully qualified name), rather than the entire suite —
  confirming exactly this unit's own contribution compiles and passes on
  its own.

### Run It

Real, executed output (test report, this session):

```
<testsuite name="com.example.calculator.ScientificFunctionsTest" tests="2" skipped="0" failures="0" errors="0" timestamp="2026-08-22T19:02:12" hostname="Michaels-Mac-mini.local" time="0.004">
  <testcase name="squareRootOfAPerfectSquareIsExact" classname="com.example.calculator.ScientificFunctionsTest" time="0.002"/>
  <testcase name="squareRootOfANegativeNumberThrowsARealDomainError" classname="com.example.calculator.ScientificFunctionsTest" time="0.002"/>
</testsuite>
```

Both real tests pass: `squareRootOfAPerfectSquareIsExact` confirms
`SquareRoot().apply(16.0)` equals `4.0` exactly (`assertEquals` with a
`delta` of `0.0`); `squareRootOfANegativeNumberThrowsARealDomainError`
confirms `SquareRoot().apply(-1.0)` really does throw
`IllegalArgumentException`, via `assertThrows`.

### Connect the Pieces

The unit above proved `Double` needs approximate, not exact, comparison
in general — but `sqrt(16.0)` is a real, confirmed exception to that:
`16` is a perfect square, so its square root is exactly representable,
with zero floating-point error, which is exactly why
`squareRootOfAPerfectSquareIsExact` is allowed to use a `delta` of `0.0`
rather than an epsilon. `SquareRoot` itself closes a promise this
curriculum has carried since its own earlier, diagnostic domain-error
work — a real, `Double`-based, domain-checked square root, now built and
tested, not just previewed with `Int` placeholders.

---

## Concept Unit: An Angle That Knows Its Own Unit

### The Problem

This project's own earlier, diagnostic angle-mode work already proved,
using only `Int` arithmetic, exactly why degrees and radians are
genuinely different units — `750 / 360 = 2` full rotations,
`750 % 360 = 30` left over, real and exact, because a full turn in
degrees is exactly `360`. But that same earlier work also proved a
real conversion *between* the two units needs π, an irrational number no
`Int` could represent — so it deliberately built no real conversion
function at all, leaving the promise open until `Double` existed. Now it
does. But a raw `Double` angle value, on its own, still doesn't know
which unit it's actually in — `90.0` could mean ninety degrees, or ninety
radians (more than fourteen full turns), and those are wildly different
real angles. And `kotlin.math.sin`, the real trigonometric function this
project needs, has its own fixed, real expectation about which unit its
input is already in.

> **Stop and think, before reading on:**
> - This project's own earlier, diagnostic angle-mode work already
>   showed, using only `Int` arithmetic, that converting between degrees
>   and radians needs π — an irrational
>   number no `Int` can represent. Now that `Double` is real in this
>   project, what would you guess the actual conversion formula from
>   degrees to radians looks like?
> - If `kotlin.math.sin` expects its input already in radians, and a
>   real user types a degree value, what has to happen to that value
>   before it's safe to hand to `sin` at all?
> - The mathematically exact value of `sin(180°)` is `0`. Given
>   everything the first unit of this lesson already proved about
>   `Double`'s own approximate nature, do you expect a real, computed
>   `sin(toRadians(180.0, AngleMode.DEGREES))` to print exactly `0.0` —
>   or something else?

### Introduce the Concept in Isolation

```kotlin
import kotlin.math.PI
import kotlin.math.sin

enum class AngleMode {
    DEGREES,
    RADIANS
}

fun toRadians(angle: Double, mode: AngleMode): Double {
    return when (mode) {
        AngleMode.DEGREES -> angle * PI / 180.0
        AngleMode.RADIANS -> angle
    }
}

fun main() {
    println(PI)
    println(toRadians(90.0, AngleMode.DEGREES))
    println(sin(toRadians(90.0, AngleMode.DEGREES)))
    println(sin(toRadians(180.0, AngleMode.DEGREES)))
}
```

Real, executed output:

```
3.141592653589793
1.5707963267948966
1.0
1.2246467991473532E-16
```

This proves two real things at once. First, the conversion itself works:
`toRadians(90.0, AngleMode.DEGREES)` correctly computes
`1.5707963267948966` — `Double`'s own closest representable
approximation of the true, exact value `π ÷ 2` — and `sin` of that is
exactly `1.0`, matching the real, expected mathematical fact that
`sin(90°) = 1`. Second, and more surprising: `sin(toRadians(180.0, AngleMode.DEGREES))`
does **not** print `0.0`, even though `sin(180°)` is mathematically
exactly zero. It prints `1.2246467991473532E-16` — an almost
impossibly tiny number, but, per line 4's own real output, provably not
zero. This is the first unit's own finding, now showing up somewhere
genuinely unexpected: `PI` itself is only an approximation of the true,
irrational π, so any computation built on it — including this one —
inherits that same tiny, real imprecision. A calculator built on this
project's own real `Sine` would need the exact same approximate-equality
reasoning already proven in this lesson's first unit to correctly treat
this result as "sine of 180 degrees, as far as floating-point math can
represent it" rather than reporting it as some other, wrong angle.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: the conversion formula is
correct, and even a mathematically exact result like `sin(180°) = 0`
comes out as a tiny nonzero `Double`, not a clean zero.

### Project Change

- **Reference Source**: no reference counterpart — this is a from-scratch
  addition, for the same reason the unit above gave: this project has no
  external reference implementation it's being built toward for
  scientific functions.
- **Files affected**: modified
  `app/src/main/java/com/example/calculator/ScientificFunctions.kt`
  (adding to the file the previous unit created); modified
  `app/src/test/java/com/example/calculator/ScientificFunctionsTest.kt`
  (adding to the file the previous unit created).
- **Change type**: add.
- **Location**: in `ScientificFunctions.kt`, immediately after
  `SquareRoot`'s own closing brace; in `ScientificFunctionsTest.kt`,
  immediately after the previous unit's own two tests.
- **Dependencies**: `AngleMode`, needed by both `toRadians` and `Sine`'s
  own constructor parameter, added together, in this same unit, in that
  order.

### The New Code

```kotlin
enum class AngleMode {
    DEGREES,
    RADIANS
}

fun toRadians(angle: Double, mode: AngleMode): Double {
    return when (mode) {
        AngleMode.DEGREES -> angle * PI / 180.0
        AngleMode.RADIANS -> angle
    }
}

class Sine(private val mode: AngleMode) : ScientificFunction {
    override fun apply(value: Double): Double {
        return sin(toRadians(value, mode))
    }
}
```

This same unit also adds three new tests to `ScientificFunctionsTest.kt`,
proving the conversion and both real trigonometric results — including
this unit's own headline finding, that `sin(180°)` is approximately, but
not exactly, zero:

```kotlin
@Test
fun toRadiansConvertsNinetyDegreesToApproximatelyHalfPi() {
    val result = toRadians(90.0, AngleMode.DEGREES)
    assertTrue(abs(result - (PI / 2)) < 0.0000001)
}

@Test
fun sineOfNinetyDegreesIsApproximatelyOne() {
    val result = Sine(AngleMode.DEGREES).apply(90.0)
    assertTrue(abs(result - 1.0) < 0.0000001)
}

@Test
fun sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero() {
    val result = Sine(AngleMode.DEGREES).apply(180.0)
    assertTrue(result != 0.0)
    assertTrue(abs(result) < 0.0000001)
}
```

### The Updated Project

`ScientificFunctions.kt`, in full, numbered, with this unit's new lines
marked:

```kotlin
 1: package com.example.calculator
 2:
 3: import kotlin.math.PI                                          // ← new
 4: import kotlin.math.sin                                         // ← new
 5: import kotlin.math.sqrt
 6:
 7: fun interface ScientificFunction {
 8:     fun apply(value: Double): Double
 9: }
10:
11: class SquareRoot : ScientificFunction {
12:     override fun apply(value: Double): Double {
13:         if (value < 0) {
14:             throw IllegalArgumentException("Cannot take the square root of a negative number: $value")
15:         }
16:         return sqrt(value)
17:     }
18: }
19:
20: enum class AngleMode {                                         // ← new
21:     DEGREES,                                                    // ← new
22:     RADIANS                                                     // ← new
23: }                                                                // ← new
24:
25: fun toRadians(angle: Double, mode: AngleMode): Double {         // ← new
26:     return when (mode) {                                        // ← new
27:         AngleMode.DEGREES -> angle * PI / 180.0                  // ← new
28:         AngleMode.RADIANS -> angle                                // ← new
29:     }                                                            // ← new
30: }                                                                // ← new
31:
32: class Sine(private val mode: AngleMode) : ScientificFunction {  // ← new
33:     override fun apply(value: Double): Double {                 // ← new
34:         return sin(toRadians(value, mode))                       // ← new
35:     }                                                            // ← new
36: }                                                                // ← new
```

This file now holds this project's own complete real answer to both of
Stage 6's still-open forward-reference promises: a real, domain-checked
`SquareRoot`, and a real, angle-mode-aware `Sine`, sharing one common
`ScientificFunction` contract, with no Android or Compose dependency
anywhere in the file. `ScientificFunctionsTest.kt`, in full, numbered,
with this unit's new lines marked:

```kotlin
 1: package com.example.calculator
 2:
 3: import org.junit.Assert.assertEquals
 4: import org.junit.Assert.assertThrows
 5: import org.junit.Assert.assertTrue                                         // ← new
 6: import org.junit.Test
 7: import kotlin.math.PI                                                      // ← new
 8: import kotlin.math.abs                                                     // ← new
 9:
10: class ScientificFunctionsTest {
11:     @Test
12:     fun squareRootOfAPerfectSquareIsExact() {
13:         assertEquals(4.0, SquareRoot().apply(16.0), 0.0)
14:     }
15:
16:     @Test
17:     fun squareRootOfANegativeNumberThrowsARealDomainError() {
18:         assertThrows(IllegalArgumentException::class.java) {
19:             SquareRoot().apply(-1.0)
20:         }
21:     }
22:
23:     @Test                                                                   // ← new
24:     fun toRadiansConvertsNinetyDegreesToApproximatelyHalfPi() {              // ← new
25:         val result = toRadians(90.0, AngleMode.DEGREES)                     // ← new
26:         assertTrue(abs(result - (PI / 2)) < 0.0000001)                      // ← new
27:     }                                                                       // ← new
28:
29:     @Test                                                                   // ← new
30:     fun sineOfNinetyDegreesIsApproximatelyOne() {                           // ← new
31:         val result = Sine(AngleMode.DEGREES).apply(90.0)                    // ← new
32:         assertTrue(abs(result - 1.0) < 0.0000001)                          // ← new
33:     }                                                                       // ← new
34:
35:     @Test                                                                   // ← new
36:     fun sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero() {   // ← new
37:         val result = Sine(AngleMode.DEGREES).apply(180.0)                   // ← new
38:         assertTrue(result != 0.0)                                           // ← new
39:         assertTrue(abs(result) < 0.0000001)                                 // ← new
40:     }                                                                       // ← new
41: }
```

This second file now holds all five of this lesson's own real, executed
proofs — two for `SquareRoot`, three for `Sine`/`toRadians` — closing
both of this lesson's forward-reference promises with tested code, not
just a working implementation.

### Mechanical Walkthrough

- `import kotlin.math.PI` (line 3) — brings the standard library's own
  real π constant into scope, unqualified, so line 27 can reference it as
  `PI` rather than `kotlin.math.PI`.
- `import kotlin.math.sin` (line 4) — brings the standard library's own
  real sine function into scope, unqualified, so line 34 can call it as
  `sin(...)` rather than `kotlin.math.sin(...)`.
- `enum class AngleMode { DEGREES, RADIANS }` (lines 20–23) — declares a
  new type restricted to exactly two named values, the same real
  mechanism already proven for this project's own `Operator`; `DEGREES`
  and `RADIANS` are its only two real instances, and nothing else can
  ever be an `AngleMode`.
- `fun toRadians(angle: Double, mode: AngleMode): Double`
  (lines 25–30) — declares a new, real, top-level function, taking two
  parameters (`angle`, a `Double`; `mode`, an `AngleMode`) and returning
  a `Double`.
  - `return when (mode)` (line 26) — `when`, used here as an
    expression (its own result is what `return` sends back), branches on
    `mode`'s own real value; because `AngleMode` is an `enum class` with
    exactly two possible values, the compiler can verify this `when`
    covers both of them — an exhaustiveness check already proven for
    this project's own sealed `Display` type, now proven again for an
    `enum class` instead.
  - `AngleMode.DEGREES -> angle * PI / 180.0` (line 27) — the real
    conversion formula: multiply the raw degree value by π, then divide
    by `180.0`, the actual mathematical relationship between the two
    units (a full turn is `360` degrees, or `2π` radians — so one degree
    is `π ÷ 180` radians). `*` and `/` are ordinary multiplication and
    division, reused from Stage 0, now operating on `Double` values.
  - `AngleMode.RADIANS -> angle` (line 28) — when the value is already in
    radians, no conversion is needed at all; the branch simply returns
    `angle` unchanged.
- `class Sine(private val mode: AngleMode) : ScientificFunction`
  (lines 32–36) — declares a new, real class, `Sine`, with a primary
  constructor property: `private val mode: AngleMode` both accepts a
  constructor argument named `mode` and, in the same declaration, creates
  a real, `private` property of the class holding it — set exactly once,
  at construction, never reassignable, and never readable from outside
  `Sine` itself. The trailing `: ScientificFunction` declares that `Sine`
  implements the same real interface `SquareRoot` already does.
  - `override fun apply(value: Double): Double` (line 33) —
    fulfills `ScientificFunction`'s own required member, the same real
    mechanism already explained for `SquareRoot.apply` above.
  - `return sin(toRadians(value, mode))` (line 34) — first calls
    `toRadians(value, mode)`, converting whatever unit this specific
    `Sine` instance's own `mode` says `value` is currently in into real
    radians; the result of that call is then handed directly, as the
    single argument, to `sin` — the real, imported
    `kotlin.math.sin` — whose own real result `return` sends back as
    `apply`'s final answer.
- `import org.junit.Assert.assertTrue` / `import kotlin.math.PI` / `import kotlin.math.abs`
  (test file, lines 5, 7–8) — bring, respectively, JUnit's own boolean
  assertion method and this lesson's own already-explained `PI`/`abs`
  into the test file's own scope, needed because this unit's own new
  tests compare an approximate `Double` result against a tolerance rather
  than asserting exact equality.
- `fun toRadiansConvertsNinetyDegreesToApproximatelyHalfPi()` (test
  file, lines 23–27) — a new test function, its own descriptive name
  stating exactly what it proves.
  - `val result = toRadians(90.0, AngleMode.DEGREES)` (test file, line
    25) — calls the real `toRadians` function directly, outside of any
    `Sine`, proving the conversion itself is correct independent of any
    trig function built on top of it.
  - `assertTrue(abs(result - (PI / 2)) < 0.0000001)` (test file, line
    26) — the same real approximate-equality mechanism this lesson's
    first unit already proved: `abs` strips the sign from the real
    difference between `result` and the true `PI / 2`, and `<` compares
    that gap against a small, chosen tolerance.
- `fun sineOfNinetyDegreesIsApproximatelyOne()` (test file, lines
  29–33) — a new test function, constructing a real `Sine` and calling
  its own `apply` directly, then asserting the real result is
  approximately `1.0`, using the identical epsilon-comparison mechanism
  just explained above.
- `fun sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero()`
  (test file, lines 35–40) — this lesson's own headline finding, made
  permanent: `assertTrue(result != 0.0)` (line 38) asserts the real
  computed result genuinely is not exactly zero, and
  `assertTrue(abs(result) < 0.0000001)` (line 39) asserts it's still,
  correctly, close enough to zero to call it a correct answer — both
  real, contrasting facts about the exact same computed value, asserted
  together so neither one could regress unnoticed.

### CS Lens

Giving an ambiguous numeric value an explicit, typed unit —
**`AngleMode`** naming, unambiguously, which of two real units a
`Double` angle value currently is — is a real, recognized software
design idea, not unique to this project:

```
Also recognized in: the Mars Climate Orbiter's own real 1999 loss,
caused by one team's software producing thrust values in pound-force
seconds while another team's software expected newton-seconds, with
nothing in either system's own types distinguishing the two; a shipping
API distinguishing kilograms from pounds; a temperature API
distinguishing Celsius from Fahrenheit; a currency type distinguishing
US Dollars from Euros, never just a bare numeric amount with no unit
attached at all.
```

### SE Lens

Why does `Sine` fix its own `mode` at construction, inside its own
constructor, rather than accepting it as a second argument to `apply`,
matching `toRadians`'s own two-argument shape? A real alternative was
considered: change `ScientificFunction.apply`'s own signature to accept
a second parameter. This project doesn't do that — `ScientificFunction`'s
own real, established contract is exactly one `Double` argument in, one
`Double` out, and changing that signature would break it for every other
real implementation, `SquareRoot` included, which needs no second
argument at all. Fixing `mode` at construction keeps `ScientificFunction`'s
own interface uniform for every real implementation, at a real, honest
cost: one `Sine` instance only ever answers for one angle unit, so a
future Scientific-mode UI that lets a user switch between degrees and
radians mid-session would need to construct a fresh `Sine` (or hold
`mode` some other way) rather than reusing a single instance across a
mode switch.

### Commands Needed

- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ScientificFunctionsTest.toRadiansConvertsNinetyDegreesToApproximatelyHalfPi" --tests "com.example.calculator.ScientificFunctionsTest.sineOfNinetyDegreesIsApproximatelyOne" --tests "com.example.calculator.ScientificFunctionsTest.sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero"`
  — runs only this unit's own three new tests via three `--tests`
  filters, confirming exactly this unit's own contribution compiles and
  passes on its own.

### Run It

Real, executed output (test report, this session):

```
<testsuite name="com.example.calculator.ScientificFunctionsTest" tests="3" skipped="0" failures="0" errors="0" timestamp="2026-08-22T19:02:24" hostname="Michaels-Mac-mini.local" time="0.002">
  <testcase name="sineOfNinetyDegreesIsApproximatelyOne" classname="com.example.calculator.ScientificFunctionsTest" time="0.002"/>
  <testcase name="toRadiansConvertsNinetyDegreesToApproximatelyHalfPi" classname="com.example.calculator.ScientificFunctionsTest" time="0.0"/>
  <testcase name="sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero" classname="com.example.calculator.ScientificFunctionsTest" time="0.0"/>
</testsuite>
```

All three real tests pass: `toRadiansConvertsNinetyDegreesToApproximatelyHalfPi`
and `sineOfNinetyDegreesIsApproximatelyOne` both use `assertTrue` with an
`abs(...) < epsilon` check, per the first unit's own proven reasoning;
`sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero` asserts
both `result != 0.0` *and* `abs(result) < epsilon` — the real, tested
proof that this lesson's own headline finding (`sin(180°)` is
approximately, but not exactly, zero) is correct and permanently
guarded against regressing.

### Connect the Pieces

`toRadians` and `Sine` close the second of this lesson's two open
promises, the same way `SquareRoot` closed the first — but this unit's
own real, decisive finding (`sin(180°)` computing to a tiny nonzero
value, not a clean `0.0`) is only correctly understood because of what
the very first unit of this lesson already proved: `Double` is always an
approximation, and "close enough to call equal" — not exact equality —
is the correct standard for judging whether a real, computed
floating-point result is right.

---

## Connect the pieces

Trace one real value through this entire lesson: a user, on a future
Scientific-mode screen, types `180` and presses a `sin` button. That
`180` becomes the `Double` literal `180.0` — a value this project could
not have represented as a fraction-free `Int` conversion at all before
this lesson's first unit gave it a real `Double` to work with. Passed
into `Sine(AngleMode.DEGREES).apply(180.0)`, it first reaches `toRadians`,
this lesson's own real, permanent closing of this project's earlier
degree-to-radian promise: `180.0 * PI / 180.0`, using `kotlin.math.PI`'s
own closest representable approximation of true π, producing
`3.141592653589793` — radians, not degrees, exactly what `kotlin.math.sin`
requires. `sin` then computes its own real result:
`1.2246467991473532E-16`, not the mathematically exact `0` a human doing
this by hand would expect. That gap is not a bug, and not something this
lesson's own `Sine` could have prevented — it's the direct, traceable
consequence of `PI` itself being only an approximation, the exact same
`Double`-representation fact this lesson's very first unit proved with
nothing more than `0.1 + 0.2`. And if that same user instead tries
`√(-1)`, `SquareRoot.apply(-1.0)` — this lesson's own real, permanent
closing of this project's earlier domain-check promise — catches it immediately,
throwing a real, descriptive `IllegalArgumentException` before
`kotlin.math.sqrt` ever gets the chance to silently hand back a `NaN`.
Two different real functions, two different forward-reference promises,
one shared foundation: a real `Double`, understood, from this lesson's
first line onward, as something that is never quite exact — only, when
the code is written correctly, close enough to call equal.
