# Android Kotlin Calculator — Handoff

Read this file first each session, before touching anything else. This
curriculum's own standing convention: only `brd.md`, `LESSON SCHEMA.md`,
and this file get read at session start — never an old lesson file, in
this curriculum or any other, for format or content precedent.

**Hard rule, stated explicitly because it was violated once already:
do not read anything outside this curriculum's own series (`brd.md`,
this handoff, and files already inside
`src/docs/projects/android_kotlin/`) and `src/docs/reference/LESSON
SCHEMA.md` itself.** This means, concretely: no directory listings of
other curricula's folders "just to check a naming convention," no
opening another curriculum's README/verification-README/CURRICULUM_NOTES
for precedent, no browsing another project's lesson files "for an
example of the format." The one time this was violated this session,
the justification felt reasonable in the moment (checking file-naming
convention, checking a verification-folder layout) — that is exactly
the failure mode this rule exists to close off, not an exception to it.
**Why:** other curricula in this repo were written against earlier
versions of the schema and do not necessarily match the current one —
treating something found in one of them as precedent risks importing
stale, non-conforming patterns and then defending them as if they were
current. The schema file and this curriculum's own BRD/handoff/already-
written lessons are the only sources of truth for how anything here
gets written; nothing else is current by definition. If the schema's
own text points at an external file (its Verification Rule cites
`OOPDSAETC/verification/README.md` as an example layout), apply the
schema's own written description of the convention instead of opening
that file — the schema already states the naming pattern
(`lab*`/`step*`/`break*`/`scale*`, one subfolder per lesson) inline;
that's sufficient without visiting the external doc.
**Verification-rule reads are not covered by this restriction** —
compiling real code, reading a real library's real installed source
(e.g. `kotlin-stdlib-sources.jar`) to quote an accurate signature — that
is what the Verification Rule itself requires and is about external
factual accuracy, not curriculum precedent.

## Source documents

- BRD: `src/docs/projects/android_kotlin/brd.md` — the master curriculum
  (Stage → Slice → Lesson → Concepts → Practice → Ship), Stage 0 through
  Stage 16.
- Schema: `src/docs/reference/LESSON SCHEMA.md` — the mechanical
  production template every lesson file must follow.

## Standing decisions

- **Math is just-in-time, never speculative.** The user was explicit:
  no math lesson exists unless a concrete function in the project
  actually needs it, "nothing just to have it." The BRD, as written,
  does not require calculus anywhere — Stage 8 needs linear-algebra
  *reasoning* (why matrix multiply/determinant/inverse work, not just
  how to code them) because Slice 8 is a matrix calculator; Stage 9 as
  literally specified (plot `y = f(x)` by sampling) needs no calculus at
  all. No calculus stage has been inserted speculatively. If a later
  session's Stage 9 work adds a concrete feature a real graphing
  calculator would have (tangent line at a point, root-finding, shaded
  area under a curve), that is the trigger for a calculus Concept Unit,
  motivated by that specific feature — not before, and not as a
  separate "math track" bolted alongside the app.
- **File location:** lessons live flat in
  `src/docs/projects/android_kotlin/`, alongside `brd.md` — `projects/`
  is where the write-lesson skill's own description places Android
  curricula specifically (its own text names
  `android-persistence-lab`/`android-ui-foundations` as examples of
  curricula it covers).
- **File naming:** `Lesson <stage>.<n> <Concept-First Title>.md`,
  keeping the BRD's own `0.1`, `0.2`, `1.1` ... numbering verbatim so a
  file always traces back to its BRD entry. Title is concept-first per
  the schema's Header rule, not copied verbatim from the BRD's
  feature-first phrasing.
- **Verification folder:** created — `verification/<lesson-id>/`, one
  subfolder per lesson (`0.1/`, `0.2/`, ...), holding this curriculum's
  own real, compiled, run Kotlin source: `lab*.kt` (an isolated Concept
  Unit lab), `step*.kt` (a snapshot of `Calculator.kt`/the lesson's own
  project file at one specific point), `break*.kt` (a deliberate
  failure — some expected to fail to compile, that's the point). This
  is this curriculum's own self-contained record of the convention now
  — no external file needs consulting to continue it. **Adapted for
  Stage 1's multi-file Android projects (starting Lesson 1.1):** a
  single-file `lab*.kt`/`step*.kt` doesn't fit a real Gradle project, so
  the "project state" for Stage 1+ is the living project directory
  itself (`AndroidCalculator/`, see below), and `verification/<lesson-id>/`
  instead holds real, saved **command transcripts** (`stepN_*.txt`,
  `breakN_*.txt`) — the exact real command run and its exact real
  output, captured by temporarily staging files in/out of the real
  project to reproduce each lesson stage, never reconstructed from
  memory afterward.
- **`AndroidCalculator/` real project, Stage 1+:** lives at
  `src/docs/projects/android_kotlin/AndroidCalculator/`, a real, working
  Android Gradle project — separate from `Calculator.kt`, per the BRD's
  own "The First Android Calculator" framing for Stage 1. Package
  `com.example.calculator` (both `namespace` and `applicationId`);
  `compileSdk`/`targetSdk` 34, `minSdk` 24; AGP `8.5.2`, Kotlin Gradle
  plugin `1.9.24`, Gradle wrapper pinned to `8.7`.
  **`sourceCompatibility`/`targetCompatibility`/`jvmTarget` must all be
  set to `17` explicitly** in `app/build.gradle.kts` — confirmed by a
  real failed build this session without it ("Inconsistent JVM-target
  compatibility... (1.8) and ...(21)"): this machine's own default JDK
  is 21 (see Lesson 0.1), which disagrees with AGP's own older default
  (1.8) unless overridden. `local.properties` (machine-specific SDK
  path) and all `build/`/`.gradle/` output are gitignored (see the repo
  root `.gitignore`, updated this session) — never assume they're
  absent if reasoning about "what files exist," check for real.
- **`AndroidCalculator/` now has Jetpack Compose enabled (Lesson 1.2).**
  `app/build.gradle.kts` sets `buildFeatures.compose = true` and
  `composeOptions.kotlinCompilerExtensionVersion = "1.5.14"` — the exact
  Compose compiler build Google's own compatibility map pairs with this
  project's pinned Kotlin Gradle plugin `1.9.24`; **if the Kotlin plugin
  version ever changes, this pin must move with it.** A `dependencies { }`
  block (new to this project) is built on
  `platform("androidx.compose:compose-bom:2024.06.00")`, with
  `implementation` on `androidx.compose.ui:ui`,
  `androidx.compose.ui:ui-tooling-preview`,
  `androidx.compose.material3:material3`,
  `androidx.activity:activity-compose:1.9.0` (this one versioned
  explicitly, outside the BOM), and `debugImplementation` on
  `androidx.compose.ui:ui-tooling`. **A new file, `gradle.properties`, sets
  `android.useAndroidX=true`** — required, confirmed by a real failed
  build this session ("Configuration ... contains AndroidX dependencies,
  but the `android.useAndroidX` property is not enabled"); every
  dependency this project now has is an AndroidX artifact, so this is not
  optional. `MainActivity` now extends `androidx.activity.ComponentActivity`
  (not `android.app.Activity` directly — still its superclass,
  transitively) and calls `setContent { CalculatorScreen() }` from inside
  `onCreate`, after `super.onCreate(...)`. Real, verified via a full
  `./gradlew :app:assembleDebug` producing a real, installable
  `app-debug.apk` with actual Compose UI compiled in.
- **Concept Isolation Rule, adapted for Compose (Stage 1+, established
  Lesson 1.2).** `@Composable` functions can only be compiled through the
  real, fully Gradle-wired project (the Compose compiler plugin only
  attaches there) — there is no standalone `kotlinc`-only sandbox for
  them the way Stage 0's throwaway `.kt` files worked. The adaptation:
  isolated throwaway labs for Compose concepts are still real, separate,
  temporary composable functions (e.g. `LabColumn`, `LabButton`) added to
  the real project's own source tree, batched together in one file,
  compiled for real via `./gradlew :app:compileDebugKotlin`, and then the
  entire temporary file is deleted before the concept's real, permanent
  form lands in the project's actual composable — never a separate
  standalone project. Gradle/Manifest/build-configuration concepts (no
  Kotlin construct to isolate at all) skip the lab step entirely and are
  verified directly against the real project's own permanent files
  instead — this was already Lesson 1.1's approach for Gradle/Manifest;
  Lesson 1.2 documents it explicitly as a standing, reusable adaptation
  rather than a one-off choice.
- **`AndroidCalculator/`'s `CalculatorScreen` now has a complete,
  data-driven calculator keypad (Lesson 1.3).** `CalculatorScreen`
  builds a `Column` (`fillMaxWidth().padding(16.dp)`,
  `verticalArrangement = Arrangement.spacedBy(8.dp)`,
  `horizontalAlignment = Alignment.CenterHorizontally`) holding the
  display `Text` and a `for (row in keypadRows)` loop, each iteration a
  `Row(horizontalArrangement = Arrangement.spacedBy(8.dp))` with its own
  inner `for (label in row)` loop calling
  `Button(onClick = {}, modifier = Modifier.weight(1f)) { Text(text =
  label) }`. `keypadRows` is a new top-level `private val
  keypadRows: List<List<String>>` (four rows: `7 8 9 ÷` / `4 5 6 ×` /
  `1 2 3 −` / `C 0 = +`) sitting above `CalculatorScreen` in
  `MainActivity.kt`. **Real, confirmed finding: `Modifier.weight(...)` is
  a scoped extension function** — resolves inside both `RowScope` and
  `ColumnScope` (confirmed for real both ways this session) but is a
  genuine `Unresolved reference` outside either; this is the first
  Compose construct in this curriculum that isn't an ordinary,
  everywhere-callable `Modifier` extension like `fillMaxWidth`/`padding`.
  Real, verified via a full `./gradlew :app:assembleDebug` producing a
  real, installable `app-debug.apk`.
- **`AndroidCalculator/` now has real, working Robolectric-based Compose
  UI testing (Lesson 1.4) — a major capability upgrade, supersedes the
  "no on-device verification possible" limitation below for anything
  Robolectric can simulate.** `app/build.gradle.kts` adds
  `testOptions.unitTests.isIncludeAndroidResources = true` and, in
  `dependencies { }`: `testImplementation` on `junit:junit:4.13.2`,
  `org.robolectric:robolectric:4.13`, the existing Compose BOM, and
  `androidx.compose.ui:ui-test-junit4`; `debugImplementation` on
  `androidx.compose.ui:ui-test-manifest`. A real test class,
  `app/src/test/java/com/example/calculator/CalculatorScreenTest.kt`,
  uses `@RunWith(RobolectricTestRunner::class)`, `@Config(sdk = [34])`,
  `createComposeRule()`, `composeTestRule.setContent { CalculatorScreen()
  }`, and `onNodeWithTag`/`onNodeWithText`/`performClick`/
  `assertTextEquals` to click real buttons and assert real, live text —
  run via `./gradlew :app:testDebugUnitTest`, a JVM-only task, no
  emulator needed. **Real, concrete proof this actually works**: a real
  test asserting the display reads `"0"`, then `"7"` after clicking `"7"`,
  then `"78"` after clicking `"8"`, passed for real; a second real test
  proved `remember`'s necessity by removing it and watching a counter
  that should read `"1"` after one click actually still read `"0"` for
  real. **Important, real limitation to keep honest**: Robolectric
  simulates the Android framework (semantics tree, click dispatch,
  recomposition scheduling) faithfully enough for exactly these kinds of
  claims, but does **not** perform genuine GPU rendering — actual drawn
  pixels, animation timing, and true multi-touch gesture recognition
  still cannot be verified this way. For those, the Verification Rule's
  Necessity exemption (predicted, honestly-labeled, not executed) or a
  real device/emulator (still unavailable, see below) is still required.
- **`AndroidCalculator/`'s `C` (Clear) button is now real (Lesson 1.5).**
  Each `Button`'s `onClick` is now a `when` with two branches:
  `label[0].isDigit() -> { ... }` (Lesson 1.4) and, new,
  `label == "C" -> { displayText = "0" }`. **Still open, real, no-op
  buttons**: `÷`, `×`, `−`, `+`, `=` (five buttons) — their real behavior
  needs `Calculator.kt`'s own arithmetic, connected in Lesson 1.6. Real,
  verified via a real, executed Robolectric test
  (`pressingClearResetsDisplay`: types `"78"`, presses `C`, asserts the
  display reads `"0"`) and a full `./gradlew testDebugUnitTest
  assembleDebug`. **Design call, recorded**: `Modifier.clickable` was
  taught in an isolated lab only (proven real via its own Robolectric
  test) and deliberately *not* added to the real project — `Button`
  already gives this project's keypad everything it needs (Material
  styling, real pressed-state, accessibility semantics), so forcing
  `clickable` in would have been code added without a real need, the
  same judgment call already made for `run` (Lesson 0.10) and `!!`
  (Lesson 0.7).
- **🟢 `AndroidCalculator/` is now a real, fully working calculator
  (Lesson 1.6) — Slice 1 shipped.** **Real, important finding recorded
  here for future sessions: `Calculator.kt` was never persisted as one
  canonical file anywhere in this curriculum** — Stage 0's console
  calculator only ever existed as real, compiled `verification/0.X/
  step*.kt` snapshots, never a single top-level `Calculator.kt`. Its
  final, real state is `verification/0.10/step4_also_calculation.kt`.
  Lesson 1.6 ported the reusable domain logic from that exact file
  (`Operation`/`Addition`/`Subtraction`/`Multiplication`/`Division`/
  `Calculator`/`Operator` — **not** `Calculation`/`describe()`/`main()`,
  which were console-app-specific) into a real, new, permanent file:
  `app/src/main/java/com/example/calculator/Calculator.kt`, same
  package as `MainActivity.kt`, so no import is needed. `CalculatorScreen`
  gained two new `remember`ed nullable state properties —
  `firstOperand: Int?` and `pendingOperator: Operator?` — and a new
  top-level `private val operatorSymbols: Map<String, Operator>` mapping
  each keypad symbol to its real `Operator` constant (this also
  **fulfilled the long-open "Map's key-lookup operator" promise**, using
  real `in`/`[]` against this real map). The `when` block inside every
  `Button`'s `onClick` now has all four real branches: digit
  (Lesson 1.4), `C` (Lesson 1.5), operator symbol → stash
  `firstOperand`/`pendingOperator` and reset display (Lesson 1.6), `=` →
  smart-cast both stashed values, construct a real `Calculator`, call
  `perform`, write the result back, then clear both stashed values
  (Lesson 1.6). **A new, permanent, non-Robolectric test file was also
  added**: `app/src/test/java/com/example/calculator/CalculatorTest.kt`
  — a plain JUnit test with no `@RunWith`, testing `Calculator`/`Operator`
  directly, real-measured at `0.0s` versus the Compose UI tests'
  multi-second Robolectric runs — demonstrates "Keeping logic testable"
  concretely, not just conceptually. Real, verified: 5 real, executed
  tests across both test files pass (`pressingDigitsUpdatesDisplay`,
  `pressingClearResetsDisplay`, `pressingSevenPlusThreeEqualsShowsTen`,
  `pressingEqualsWithNoPendingOperatorDoesNothing`,
  `performAddsAmountToDisplayValue`), plus a full
  `./gradlew testDebugUnitTest assembleDebug` producing a real,
  installable `.apk`. **Honest, deliberately-not-fixed carryovers from
  Stage 0**, still open: `Division`'s unhandled `0` divisor (real
  `ArithmeticException` at runtime — still deferred to Stage 2, per the
  existing promise); `Calculator.perform`'s own mutating, side-effecting
  design (not refactored to a pure function — explicitly Lesson 2.1's own
  job, per the BRD). **Deliberate scope limit, since corrected — see
  below**: pressing `=` clears `firstOperand`/`pendingOperator`, so
  chained operations (`7 + 3 = 10 + 5 = 15`) were believed NOT supported
  at the time this lesson shipped — a real, honest, smaller feature set
  than a full calculator, not a bug. **Correction, Lesson 7.1, this
  session**: this claim was stale even before Lesson 7.1's own work —
  a real, executed trace of the exact, current `nextState` this session
  (not assumed from this note) proved chaining actually already works,
  and has since at least Lesson 3.3's own `CalculatorState`/`nextState`
  rewrite: pressing an operator symbol reads `current.display.textOrZero().toInt()`
  as the new `firstOperand`, which after `=` already holds the prior
  result — so `7, +, 3, =, +, 5, =` really does produce `15`, for real,
  confirmed via `verification/7.1/step1_chaining_check.kt`. This note is
  left in place, corrected rather than deleted, as a record of how a
  true-when-written claim silently went stale after a later, unrelated
  refactor changed the exact mechanism it was describing, with nothing
  prompting a review of it until Lesson 7.1's own real, unrelated work
  happened to depend on knowing the real, current answer.
- **The `Calculator` class is gone (Lesson 2.1) — `Calculator.kt` now
  holds only `Operation`/`Addition`/`Subtraction`/`Multiplication`/
  `Division`/`Operator`.** Lesson 2.1's own real, motivated finding:
  `Calculator.perform` was never doing anything `Operation.apply` itself
  didn't already do purely — `Calculator` existed only to wrap an
  already-pure call in a mutating shell. `CalculatorScreen`'s own `=`
  branch now reads `operator.operation.apply(first,
  displayText.toInt())` directly — no `Calculator` construction, no
  mutation, one fewer real dependency. `CalculatorTest.kt` was updated to
  match: `Operator.PLUS.operation.apply(7, 3)`, asserted `== 10`, one
  line, no object construction. **Real, complete regression proof**: all
  5 of this project's own tests (`additionAppliesRealArithmetic`,
  `pressingDigitsUpdatesDisplay`, `pressingClearResetsDisplay`,
  `pressingEqualsWithNoPendingOperatorDoesNothing`,
  `pressingSevenPlusThreeEqualsShowsTen`) pass after the refactor,
  including the real end-to-end `7 + 3 = 10` UI flow — proving the
  removal changed nothing this project's users would notice. `Calculator`'s
  own real removal was confirmed with an actual negative-case compile
  (`Unresolved reference: Calculator`). **This closes the
  `Calculator.perform`-mutation gap Lesson 1.6's own standing decision
  flagged as explicitly Lesson 2.1's job; `Division`'s unhandled `0`
  divisor is deliberately untouched here, genuinely Lesson 2.5's own job
  per the BRD** (see its own promise entry below).
- **`CalculatorTest.kt` now has a real, complete 4-operator AAA test
  suite (Lesson 2.2).** All four tests share one shape (`// Arrange` /
  `// Act` / `// Assert` comments, a `val operation = Operator.X.
  operation`, `operation.apply(a, b)`, `assertEquals(expected, result)`):
  `additionAppliesRealArithmetic` (`2+2=4`, restructured and its numbers
  changed from the earlier `7+3=10`), `subtractionAppliesRealArithmetic`
  (`10-3=7`), `multiplicationAppliesRealArithmetic` (`5×6=30`),
  `divisionAppliesRealArithmetic` (`20÷4=5`, deliberately not a
  divide-by-zero case — that's still Lesson 2.5's own job). This project
  now has 8 real, passing tests total (4 in `CalculatorTest.kt`, 4 in
  `CalculatorScreenTest.kt`). **Real, important finding, worth knowing
  for any future lesson touching JUnit assertions**: `org.junit.Assert.
  assertEquals` has 12 real overloads (confirmed via real `javap` against
  the actual installed `junit-4.13.2.jar`), including
  `assertEquals(long, long)` and `assertEquals(Object, Object)` but no
  plain `assertEquals(int, int)`. Checking this project's own *compiled
  bytecode* (`javap -c` on `CalculatorTest.class`) confirmed that Kotlin
  resolves `assertEquals(4, result)` (two real `Int`s) to the
  `Object, Object` overload, NOT `long, long` — Kotlin does not perform
  Java-style implicit primitive widening (`Int`→`Long`) when resolving
  overloaded Java static methods; it boxes to `Object` instead. This
  contradicts what plain Java-overload-resolution reasoning would predict
  and was only caught by actually inspecting real bytecode, not by
  reasoning from the method signatures alone — matches this curriculum's
  own standing "verify claims with the real compiler/real artifact, not
  reasoning alone" methodology, extended here to a real interop subtlety
  between Kotlin and a Java library. Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug`.
- **Gap found and left unfixed in Lessons 1.6 and 2.1, worth knowing**:
  `assertEquals` was used extensively in both lessons' own real code but
  never given its own proper Header "Objects and methods used" CRC entry
  (only described in walkthrough prose) — a real miss of the same kind
  the CRC-bundling methodology note already tracks. **Deliberately not
  retroactively fixed** in those two already-shipped lesson files,
  matching this curriculum's own established pattern (e.g., `copy()`'s
  stale-result gap, Lesson 0.8) of flagging an imperfection honestly
  rather than opening a retroactive-audit scope creep; `assertEquals`
  finally got its first real, proper Header entry in Lesson 2.2 instead.
- **`Calculator.kt` now has a fifth real operation, `Modulo` (Lesson
  2.3), added through a real, executed TDD (Red→Green→Refactor) cycle.**
  `class Modulo : Operation { override fun apply(current: Int, amount:
  Int): Int { return current % amount } }`, held by a new
  `Operator.MODULO` constant. **Design call, recorded**: `Modulo` was
  deliberately chosen (over alternatives like power or percentage)
  because it fits `Operation`'s existing binary `(Int, Int) -> Int` shape
  exactly, with zero architectural change needed. **Real TDD sequence,
  captured in full**: (1) a test (`moduloAppliesRealArithmetic`,
  asserting `17 % 5 == 2`) written and committed to the real project
  *before* `Modulo`/`MODULO` existed — real compile error
  (`Unresolved reference: MODULO`); (2) a deliberately-wrong stub
  (`return 0`) added — real compile success, real test failure
  (`expected:<2> but was:<0>`); (3) the real fix (`return current %
  amount`) — real, full 9-test suite passes. (4) A real Refactor check:
  an actual lambda-based alternative (`Operation { current, amount ->
  current % amount }`) was written and compiled for real, confirming the
  choice between named classes and lambdas (first raised in Lesson 0.9)
  is a live one — concluded, with a fifth real data point, that named
  classes remain the right call; no structural change made. **Deliberate
  scope limit, recorded**: `Modulo`/`MODULO` is real and tested but
  **not** wired into `CalculatorScreen`'s own real keypad — no new "%"
  button. Stage 2 is "Testing & Better OOP," not UI work; a real keypad
  addition is left as Stage 3 ("UI Engineering")'s own territory, a
  legitimate future integration point if a later lesson wants it. This
  project now has 9 real, passing tests total (5 in `CalculatorTest.kt`,
  4 in `CalculatorScreenTest.kt`). Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug`.
- **`Addition`/`Subtraction`/`Multiplication`/`Division`/`Modulo` are now
  all `private` (Lesson 2.4).** `Operation` (the interface) stays public
  — confirmed for real it *must*: `private fun interface Operation`
  produces a real compile error (`'public' property exposes its
  'private-in-file' type Operation`), since `Operator`'s own public `val
  operation: Operation` requires the type it exposes to also be public.
  The five implementation classes, by contrast, were confirmed for real
  to be referenced nowhere outside `Calculator.kt` (a real search across
  `MainActivity.kt` and both test files found zero direct references —
  everything goes through `Operator`), so marking them `private` was
  safe; a real negative-case compile from a different file confirmed
  `Addition` is now genuinely inaccessible (`Cannot access 'Addition':
  it is private in file`). All 9 real tests still pass, unchanged, and a
  real `.apk` still builds — real regression proof the visibility change
  broke nothing. **Real investigation, not adopted**: an actual,
  compiled inheritance-based alternative (`enum class InheritedOperator :
  Operation { PLUS { override fun apply(...) = ... }, ... }`) was written
  and confirmed to compile, then explicitly NOT adopted — composition
  (the current, real design) keeps each `Operation` implementation
  independently constructable/testable with zero `Operator` involvement
  (exactly what Lesson 2.1's own isolated labs already relied on);
  inheritance would couple every operation permanently to enum machinery
  it doesn't need. Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug`.
- **🟢 Division-by-zero no longer crashes the app (Lesson 2.5) — Slice 2
  shipped.** The real crash was verified first, per this lesson's own
  explicit instruction not to assume: a real Robolectric test driving
  `5`, `÷`, `0`, `=` through the actual, unmodified `CalculatorScreen`
  failed with a genuine, captured `java.lang.ArithmeticException at
  Calculator.kt:27`, propagating straight out of the click handler —
  proof this was a real, reachable crash, not a hypothetical one.
  **Design decision, investigated and recorded**: a candidate custom
  exception type, `DivisionByZeroError`, was written and compiled for
  real, then explicitly rejected — this calculator's domain has exactly
  one real arithmetic failure mode (a `0` amount on `/` or `%`, shared
  identically by `Division` and `Modulo`), so `ArithmeticException`
  already says exactly what happened; a wrapper would add code for zero
  new information. **The real fix**: `CalculatorScreen`'s own `=` branch
  now reads `displayText = try { operator.operation.apply(...).toString()
  } catch (invalidOperation: ArithmeticException) { "Error" }` — using
  `try` as a Kotlin *expression* (new to this project), not a statement.
  A second real gap was found and closed in the same lesson: typing a
  digit right after `"Error"` would have appended onto the word (producing
  `"Error9"`) — fixed with `displayText == "0" || displayText == "Error"`
  in the digit branch, `||`'s first real use in this project. **A small,
  permanent, real testability improvement landed alongside the fix**:
  every keypad `Button` now carries `Modifier.testTag(label)` (previously
  only the display had a tag), so `onNodeWithTag` can click any button
  unambiguously even when its label matches text currently shown
  elsewhere on screen — replacing an earlier, more fragile
  matcher-combinator approach (`onNode(hasText(...) and
  hasClickAction())`) that was tried, worked, but was deliberately
  abandoned in favor of this simpler, permanent fix before the lesson was
  finalized (see the Methodology note below). This project now has 12
  real, passing tests total (6 in `CalculatorTest.kt`, including a new
  `divisionByZeroThrowsArithmeticException` proving the engine-level
  throw; 6 in `CalculatorScreenTest.kt`, including
  `pressingFiveDivideZeroEqualsShowsErrorInsteadOfCrashing` and
  `pressingDigitAfterErrorStartsFreshInsteadOfAppending`). Real, verified
  via a full `./gradlew testDebugUnitTest assembleDebug`.
- **A real, named theme now exists (Lesson 3.1) — a new file,
  `app/src/main/java/com/example/calculator/Theme.kt`.** Three
  `private val` constants — `CalculatorColorScheme` (a real
  `lightColorScheme(primary = Color(0xFF1565C0), onPrimary =
  Color(0xFFFFFFFF), secondary = Color(0xFFFF6F00), background =
  Color(0xFFF5F5F5))`), `CalculatorTypography` (a real `Typography
  (displayLarge = TextStyle(fontSize = 48.sp, fontWeight =
  FontWeight.Light))`), `CalculatorShapes` (a real `Shapes(small =
  RoundedCornerShape(12.dp))`) — plus a real `@Composable fun
  CalculatorTheme(content: @Composable () -> Unit)` wrapping
  `MaterialTheme(colorScheme = ..., typography = ..., shapes = ...,
  content = content)`. `MainActivity`'s own `setContent` now reads
  `CalculatorTheme { CalculatorScreen() }`; `CalculatorScreen`'s own
  display `Text` now passes `style = MaterialTheme.typography.displayLarge`,
  and every keypad `Button` now passes `shape = MaterialTheme.shapes.small`
  — both read directly from the theme, no value threaded down as an
  explicit parameter. **Real, concrete proof this actually works**: a
  new, permanent test, `ThemeTest.kt`'s
  `calculatorThemeProvidesRealCustomPrimaryColor`, builds a real
  throwaway composable that reads `MaterialTheme.colorScheme.primary`
  with no parameter passed to it, nests it inside `CalculatorTheme`, and
  asserts the captured value really is `Color(0xFF1565C0)` — proving
  Compose's implicit context propagation for real, not just that the
  code compiles. **Real, worth-knowing finding**: `MaterialTheme` is
  simultaneously a real top-level composable *function* (in a
  compiler-generated `MaterialThemeKt` class) and a real singleton
  *object* (`MaterialTheme`, with `INSTANCE`) exposing `.colorScheme`/
  `.typography`/`.shapes` — two genuinely separate compiled declarations
  sharing one name, confirmed via real `javap` against the installed
  Material3 library, not assumed from familiarity with the API. This
  project now has 13 real, passing tests. Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug`.
- **`CalculatorScreen`'s own inline keypad `Button` is gone — a real,
  permanent `CalculatorButton` composable now exists (Lesson 3.2).**
  `@Composable fun CalculatorButton(label: String, onClick: () -> Unit,
  modifier: Modifier = Modifier)`, wrapping `Button(onClick = onClick,
  shape = MaterialTheme.shapes.small, modifier =
  modifier.testTag(label)) { Text(text = label) }` — sitting in
  `MainActivity.kt` between `operatorSymbols` and `CalculatorScreen`.
  `CalculatorScreen`'s own keypad loop now calls `CalculatorButton(label
  = label, onClick = { ... }, modifier = Modifier.weight(1f))` instead
  of `Button` directly; `Modifier.weight(1f)` is still built at the call
  site (inside the real `RowScope` only `CalculatorScreen`'s own `Row`
  provides) and handed down as `CalculatorButton`'s `modifier`
  parameter — `CalculatorButton` itself is never directly inside a
  `RowScope`, so it could never have built that particular modifier on
  its own. **Real, motivated design choice, recorded**: `modifier:
  Modifier = Modifier` was included specifically because
  `CalculatorScreen`'s own existing call site already needs it (to
  attach `weight`), not as speculative flexibility — matches this
  project's established minimalism pattern. **Real, BRD-confirmed
  forward motivation, not speculative**: Stage 4 ("Calculator Modes")
  already plans Basic/Scientific/Matrix screens, each needing its own
  keypad-like grid — `CalculatorButton`'s own general shape (label,
  click behavior, optional modifier) is already built to serve that
  real, already-planned need. **Real, complete regression proof**: all
  13 of this project's existing tests pass unchanged after the
  extraction — no new permanent test was added specifically for
  `CalculatorButton` in isolation, since the existing
  `CalculatorScreenTest.kt` suite already exercises it 16 times over via
  its own real button clicks. Real, verified via a full `./gradlew
  testDebugUnitTest assembleDebug`.
- **Methodology finding, recorded during this lesson's own self-check**:
  a Concept Unit that combines two already-proven constructs from
  earlier units in the *same* lesson into real project code, introducing
  no new previously-untaught concept of its own, does not need its own
  throwaway lab or Discard step — forcing one in produced a structurally
  hollow unit. The fix: merge such a unit into the *last* unit that
  actually proved something in isolation, so that one unit both proves
  and integrates (matching the pattern Lesson 3.1's own final "Theme"
  unit already used). A unit with two "CS Lens"/"SE Lens" pairs (one
  before the merge point, one after) is the tell that a merge like this
  needs to also consolidate those, not just move headings.
- **🟢 `CalculatorScreen`'s three separate `remember`ed properties are
  gone — a real, single, immutable `CalculatorState` now holds all of
  it, and the ad-hoc `"Error"` string sentinel is gone too (Lesson 3.3)
  — Slice 3 now more than half-shipped.** A real, permanent, from-scratch
  sealed class, added to `Calculator.kt`: `sealed class Display { data
  class Value(val text: String) : Display(); object Error : Display() }`
  — replacing the bare `"Error"` string that used to share `String` with
  every genuine numeric display value, with no way for the type system to
  tell the two apart. Alongside it, a real, permanent `data class
  CalculatorState(val display: Display = Display.Value("0"), val
  firstOperand: Int? = null, val pendingOperator: Operator? = null)` and
  a real, permanent, pure top-level function, `fun nextState(current:
  CalculatorState, label: String): CalculatorState`, holding the exact
  same four real branches (digit / `"C"` / operator symbol / `"="`)
  `CalculatorScreen`'s own `onClick` `when` block has had since Lesson
  1.6 — moved there, unchanged in logic. `operatorSymbols` moved from
  `MainActivity.kt` into `Calculator.kt` alongside it, since it's now a
  real dependency of `nextState`, not just of the UI. `CalculatorScreen`
  itself shrank to `var state by remember { mutableStateOf
  (CalculatorState()) }` plus one line per button, `onClick = { state =
  nextState(state, label) }` — its own entire button-press logic now
  lives in one pure, Compose-free, directly-unit-testable function.
  `MainActivity.kt` keeps its own small, UI-only `private fun
  Display.toDisplayText(): String` (rendering `Display.Error` as the
  word `"Error"` on screen); `Calculator.kt` keeps a separate, private
  `Display.textOrZero(): String` (treating `Display.Error` as `"0"` for
  arithmetic purposes) — two deliberately separate extension functions,
  one UI-concern, one domain-concern, over the same sealed type. **Real,
  important finding, verified before any fix was designed**: this
  lesson's own Problem section reproduced a second, previously-unknown,
  genuinely-reachable crash — pressing `5`, `÷`, `0`, `=`, then any
  operator symbol (`+`/`−`/`×`/`÷`) called the old, unmodified
  `displayText.toInt()` directly on the literal string `"Error"`,
  throwing a real, uncaught `NumberFormatException` at that exact call
  site — a second, real gap sitting right next to the division-by-zero
  crash Lesson 2.5 already fixed, never caught until this lesson's own
  verification found it. The real fix: `nextState`'s operator-symbol
  branch now calls `current.display.textOrZero().toInt()` instead of
  reading a raw `String` directly, converting any `Display.Error` into
  the safe string `"0"` before `.toInt()` ever runs. **Design call,
  investigated and confirmed for real**: an isolated lab
  (`LabResult`/`LabSuccess`/`LabFailure`) proved `sealed class`'s own
  real **exhaustiveness checking** — deleting a `when` branch over a
  sealed type produces a genuine compile error
  (`'when' expression must be exhaustive`), not a silent runtime gap;
  this is the concrete mechanism motivating `Display` over continuing to
  use a bare `String` sentinel. Real, complete regression proof: all 13
  of this project's prior tests still pass, plus five new ones — a new,
  entirely Robolectric-free `CalculatorStateTest.kt` (four tests, calling
  `nextState` directly, each measured at real sub-millisecond speed) and
  one new `CalculatorScreenTest.kt` test
  (`pressingOperatorAfterErrorStartsFreshInsteadOfCrashing`, the exact
  real crash sequence, now asserting a safe `"0"` instead of a thrown
  exception). This project now has 18 real, passing tests total. Real,
  verified via a full `./gradlew testDebugUnitTest assembleDebug`.
- **🟢 The display now has a real, animated color — normal for an
  ordinary value, distinct the instant `Display.Error` appears (Lesson
  3.4).** `Theme.kt`'s own `CalculatorColorScheme` gained two new,
  explicitly-chosen colors (`onBackground = Color(0xFF212121)`, `error =
  Color(0xFFB00020)` — this project's own deliberate design choice, not
  a claim about any Material3 built-in default). `CalculatorScreen`
  gained one new line, `val displayColor by animateColorAsState
  (targetValue = when (state.display) { is Display.Value ->
  MaterialTheme.colorScheme.onBackground; Display.Error ->
  MaterialTheme.colorScheme.error }, label = "displayColor")`, and the
  display `Text` now passes `color = displayColor` — its own `color`
  parameter, present since Lesson 1.2 but never once used until now.
  **Real, checked finding, worth knowing for any future Compose-
  animation lesson**: no new Gradle dependency was needed —
  `./gradlew :app:dependencies --configuration debugCompileClasspath`,
  run for real this session, showed `androidx.compose.animation
  :animation:1.6.8` already resolved on the compile classpath, pulled in
  transitively through `androidx.compose.material3:material3:1.2.1`.
  **Real, executed proof of the actual mechanism, not just that the code
  compiles**: an isolated lab (`LabColorBox`, rendering its own animated
  `Color`'s `toString()` as literal text so a Robolectric test could read
  it) proved, using `composeTestRule.mainClock.autoAdvance = false` and a
  controlled `advanceTimeBy(1000)`, that the value stays at its old color
  immediately after the target changes (with the clock still paused) and
  only reaches the new target after real time is advanced — the concrete
  difference between "animated" and "instant." **Honest, deliberate
  scope limit, consistent with this project's own already-standing
  Robolectric/GPU-rendering limitation**: no new permanent test asserts
  the real project's own on-screen color, since Robolectric performs no
  genuine pixel rendering; the mechanism is proven by the (now-discarded)
  lab, and the integration is covered by this project's existing,
  unbroken regression suite. This project still has 18 real, passing
  tests — no new permanent test was added, by design. Real, verified via
  a full `./gradlew testDebugUnitTest assembleDebug`.
- **Self-check finding, this session**: Lesson 3.3's own first-saved
  draft had six real "Lesson N" citations sitting inside Concept Unit
  prose (two in a Socratic prompt and a Problem section citing
  `Calculation`'s and the division-by-zero fix's origin lessons by
  number, one each in a Problem section, two in a Mechanical Walkthrough
  bullet and an SE Lens sentence) — caught by the same
  `grep -n "Lesson [0-9]"` self-check this curriculum has run since
  Lesson 1.3, confirming that check still needs to run on every lesson,
  not just reappearing-object-heavy ones. Fixed by stripping each
  citation and restating the same substance citation-free (e.g. "the
  division-by-zero crash this project already fixed by catching
  `ArithmeticException`" instead of "Lesson 2.5"), leaving lesson-number
  mentions only inside the Header's own "What you will build"/"What you
  need to know first"/"Objects and methods used" sections, never inside
  a Concept Unit's own prose — matching the schema's own stated rule
  exactly. **Recurred again in Lesson 3.4's own first-saved draft**, five
  more real instances — one inside a Concept Unit's own "Project Change"
  step's "Dependencies" field specifically (matching a location this same
  note already named as a past failure spot for Lesson 1.3), one in an SE
  Lens sentence, one in the Concept Unit's own internal "Connect the
  Pieces" step, and one in the lesson's overall closing "Connect the
  Pieces" section (after the last Concept Unit) — confirming this check
  is not a one-lesson fluke and needs to run on literally every lesson,
  including checking the overall closing section, which had not
  previously been called out by name as a location to check.
- **🟢 Three real accessibility guarantees now exist and are permanently
  tested (Lesson 3.5).** `MainActivity.kt` gained a new `private val
  accessibilityLabels: Map<String, String>` (`"×"` → `"times"`, `"÷"` →
  `"divide"`, `"−"` → `"minus"`, `"C"` → `"clear"`) and `CalculatorButton`
  gained a new `contentDescription: String? = null` parameter, applied
  via `Modifier.semantics { contentDescription?.let { this
  .contentDescription = it } }` — an explicit, spoken-word label for the
  four real keypad buttons whose visible glyph isn't already an
  unambiguous word, replacing nothing about what's actually drawn on
  screen. A new, permanent file, `AccessibilityTest.kt`, holds three real
  tests: `symbolButtonsExposeReadableContentDescriptions` (confirming all
  four real descriptions are found via `onNodeWithContentDescription`);
  `keypadButtonsMeetMinimumTouchTargetHeight` (confirming a real keypad
  button meets Android's own documented `48dp` minimum touch-target
  size, via `assertHeightIsAtLeast`); and
  `defaultButtonColorsMeetMinimumContrastRatio` (confirming this
  project's own real, default button colors — white on blue, read
  directly off `ButtonDefaults.buttonColors()` — meet the real WCAG AA
  contrast minimum, `4.5:1`). `Theme.kt` gained a new, permanent, public
  function, `fun contrastRatio(foreground: Color, background: Color):
  Double`, a real, from-scratch implementation of the W3C's own
  published WCAG relative-luminance/contrast-ratio formula, built on two
  new private helpers, `linearize` and `relativeLuminance`. **Real,
  important findings, worth knowing for future lessons**: (1) a bare,
  unstyled Material3 `Button` — no explicit size modifier anywhere —
  already measures at least `48dp` tall for real, confirmed via a real,
  executed Robolectric layout-measurement assertion
  (`assertHeightIsAtLeast`), proving Compose's own real layout system
  computes genuine sizes under Robolectric even with zero GPU rendering
  involved; (2) `ButtonDefaults.buttonColors()`'s own real
  `containerColor`/`contentColor` were confirmed, via a real test, to be
  exactly `MaterialTheme.colorScheme.primary`/`.onPrimary` — meaning
  every one of this project's sixteen real keypad buttons has always
  rendered with that exact pair, never independently checked before this
  lesson; (3) Compose's own `Color.red`/`.green`/`.blue` are real,
  normalized `0f..1f` floats, not raw `0-255` integers — confirmed via a
  real, discriminating test, since getting this backwards would have
  silently produced a wrong contrast number with no compile error to
  catch it. **Real, computed finding, both units 2 and 3 of this
  lesson**: neither Touch Targets nor Contrast needed a real production
  fix — both of this project's own real, pre-existing defaults already
  passed the real, checked standard — so both units' own real value is a
  permanent, automated regression guard, not a bug fix, an intentional,
  honest departure from this project's usual "problem found, problem
  fixed" lesson shape. **Real, honest, deliberately-unfixed gap, left
  open on purpose**: `CalculatorColorScheme`'s own `secondary` color,
  `0xFFFF6F00`, was computed this session to fail the real WCAG minimum
  against `onPrimary` (roughly `2.8:1`) — left unfixed because
  `secondary` isn't actually rendered anywhere in this project's real,
  shipped UI yet (a named-but-unused color), so fixing it now would be
  fixing a hypothetical bug, not a present one; worth revisiting the
  moment a future lesson (Stage 4's mode-switching UI is the most likely
  candidate) actually puts `secondary` on screen. This project now has
  21 real, passing tests. Real, verified via a full `./gradlew
  testDebugUnitTest assembleDebug`.
- **Self-check finding, this session**: Lesson 3.5's own first-saved
  draft was missing every single "Commands Needed"/"Run It"/per-unit
  "Connect the Pieces" heading across all three of its Concept Units
  (nine missing headings total), plus a whole missing "Mechanical
  Walkthrough" heading in its Touch Targets unit — the real content for
  most of these existed in the draft already (real command transcripts,
  real output), just embedded as unheaded prose inside "Introduce the
  Concept in Isolation" or immediately after "Updated Project" instead of
  under their own required `###` headings, later in the unit, per the
  schema's own step order. Caught by the same structural self-check this
  handoff has documented since Lesson 2.5 (enumerate every `###` heading
  inside each Concept Unit, confirm all required ones are present) — a
  reminder that this check catches *missing* headings just as reliably
  as it catches duplicated ones, and needs to be actually run, in full,
  against the finished draft, not assumed clean because each individual
  section read fine in isolation while it was being written.

- **🟢 Every real keypad button now triggers a real haptic pulse on press
  (Lesson 3.6) — Slice 3 shipped.** `CalculatorButton` gained one new
  line, `val haptic = LocalHapticFeedback.current`, and its own `Button`
  call's `onClick` is now a real lambda —
  `haptic.performHapticFeedback(HapticFeedbackType.LongPress); onClick()`
  — instead of handing `CalculatorButton`'s own `onClick` parameter to
  `Button` directly. `LocalHapticFeedback` is a real, public
  `ProvidableCompositionLocal<HapticFeedback>`
  (`androidx.compose.ui.platform`), already on this project's real
  classpath since Lesson 1.2 — no new Gradle dependency. **Real,
  checked finding**: this project's own currently-resolved Compose UI
  version (`1.6.8`) has exactly two real `HapticFeedbackType` constants
  — `LongPress` and `TextHandleMove` — confirmed by real `javap` output
  against the actual installed `.jar`, not assumed from familiarity with
  a newer API surface; `LongPress`, despite its name, is this real API's
  own general "confirm a tap" effect, used here for every real keypad
  press. **Real, permanent, executed proof of the actual mechanism, not
  just that the code compiles**: a new, permanent test,
  `HapticsTest.kt`'s `pressingKeypadButtonTriggersHapticFeedback`,
  substitutes a real, custom `HapticFeedback` implementation for the
  real `CalculatorScreen` via `CompositionLocalProvider(LocalHapticFeedback
  provides fakeHaptic) { ... }`, confirms nothing fires before a press
  (`assertNull`), then confirms a real `HapticFeedbackType.LongPress`
  call fires after one (`assertEquals`) — proving the real mechanism
  without needing real vibration hardware, honestly consistent with this
  project's own standing GPU/hardware-verification limitation (the
  actual felt vibration itself remains unverifiable in this
  environment, same category as drawn pixels and animation timing).
  This project now has 22 real, passing tests. Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug`.

- **`AndroidCalculator` now has a real second screen and real Jetpack
  Navigation Compose wiring it to the calculator (Lesson 4.1).** A new
  `@Composable fun HomeScreen(onModeSelected: (String) -> Unit)`
  (`MainActivity.kt`) shows a title and one real `CalculatorButton`,
  `"Basic Calculator"` — deliberately only one button, since Basic is
  this project's only real mode today; no Scientific/Matrix buttons were
  added, matching this project's standing "nothing just to have it"
  discipline (those become real buttons only once Stages 5/6/8 give them
  real functionality). A new `@Composable fun CalculatorApp(navController:
  NavHostController = rememberNavController())` holds a real `NavHost`
  with two routes — `"home"` → `HomeScreen`, `"calculator/{mode}"` →
  `CalculatorScreen(mode = ...)`, the `mode` argument extracted from the
  real `NavBackStackEntry` via `.arguments?.getString("mode") ?: "Basic"`.
  `CalculatorScreen` gained one new parameter, `mode: String = "Basic"`,
  displayed as a new title `Text` (`testTag("modeTitle")`) — the default
  keeps all ten of this project's existing no-argument
  `CalculatorScreen()` call sites compiling and passing unchanged.
  `MainActivity.onCreate` now calls `CalculatorApp()` instead of
  `CalculatorScreen()` directly. **New Gradle dependencies, both
  real-resolved with zero version conflicts against this project's
  existing Compose BOM `2024.06.00`/Kotlin Gradle plugin `1.9.24`:**
  `androidx.navigation:navigation-compose:2.7.7` (`implementation`) and
  `androidx.navigation:navigation-testing:2.7.7` (`testImplementation`).
  **Real, checked finding**: `androidx.test:core:1.5.0`
  (`ApplicationProvider`) was already resolved transitively before this
  lesson (via Robolectric/`ui-test-junit4`) — no new dependency needed
  for it. **Real, checked finding, worth knowing for future
  Navigation-Compose work**: setting a `NavHostController`'s graph
  pushes *two* real back-stack entries, not one — the graph itself gets
  an entry, in addition to its start destination — confirmed by forcing
  a real, temporary failing assertion and reading the actual number
  (`2`) back from a real test failure, not assumed from "one entry per
  screen" reasoning. **Real, checked finding**: `rememberNavController()`'s
  own real, published body (fetched from AndroidX's public source this
  session) calls `rememberSaveable`, not plain `remember` — navigation
  state survives a configuration change, not just recomposition — and
  its own KDoc states it auto-registers `ComposeNavigator`/
  `DialogNavigator`, which is exactly why test code building its own
  `TestNavHostController` directly has to register `ComposeNavigator`
  by hand (`navigatorProvider.addNavigator(ComposeNavigator())`) instead
  of getting it for free. **A new, permanent test file,
  `NavigationTest.kt`**, holds four real tests: `homeScreenIsTheStartDestination`,
  `tappingBasicCalculatorNavigatesToCalculatorScreen`,
  `pressingBackFromCalculatorReturnsToHomeScreen` (using a real
  `TestNavHostController` to call `popBackStack()` directly, standing in
  for a real device back button this environment still can't simulate —
  same category as the project's existing GPU/hardware-verification
  limitation, not a new gap), and
  `navigatingFromHomePassesBasicAsRealModeArgument`. This project now
  has 26 real, passing tests. Real, verified via a full `./gradlew
  testDebugUnitTest assembleDebug`.

- **🟢 Lesson 4.2 (Why Architecture Exists) shipped — no production
  code changes.** A purely diagnostic lesson, per the BRD's own "use the
  growing calculator to discover" framing: four Concept Units (Coupling,
  Cohesion, Responsibility, Separation of Concerns), each with its own
  isolated `kotlinc`-compiled lab, then applied as real, honest analysis
  of `CalculatorScreen`'s own current, unmodified code. **Design call,
  recorded**: since no unit touches real project code, every unit
  correctly omits the Project Change/New Code/Updated Project headings
  (per the schema's own explicit allowance for units that don't touch
  real project code) — 9 headings per unit, not 12; confirmed via the
  same heading-enumeration self-check used on every other lesson. **Real,
  concrete evidence gathered this session, not asserted from feeling**:
  (1) `nextState` was temporarily renamed to `computeNextState` inside
  the real `Calculator.kt`, and a real `./gradlew :app:compileDebugKotlin`
  produced a real `Unresolved reference: nextState` error at
  `MainActivity.kt:144` — real, provable coupling — then reverted; (2)
  the isolated Coupling lab mirrored this exact shape (a
  tightly-coupled function calling another by name vs. one receiving a
  function as a parameter), independently proving the same failure mode
  via a real, temporary rename-and-recompile; (3) the Cohesion unit
  quotes `CalculatorScreen`'s own real, complete body and walks through
  all six real, distinct concerns actually living inside it (state
  ownership, color animation, layout, text rendering, keypad
  construction, business-logic invocation); (4) the Separation of
  Concerns unit's own isolated lab proved, with real, executed output,
  that an object owning its own state loses that state the moment a
  fresh instance replaces it, while state held in a separate, externally
  owned object survives being rendered by different callers — then
  named the real, already-open consequence: `CalculatorScreen`'s own
  `state` uses plain `remember`, not `rememberSaveable`, so a real
  configuration change would really lose a user's in-progress
  calculation, using the exact same `remember`-vs-`rememberSaveable`
  distinction Lesson 4.1 already proved for real via
  `rememberNavController`'s own published source. **No new Gradle
  dependency** — every lab used plain, standalone `kotlinc`, this
  project's own established Stage-0-style verification approach,
  requiring no Android SDK or Gradle project at all. This project still
  has 26 real, passing tests — unchanged, since no production code was
  touched. Real, verified via a final `./gradlew :app:testDebugUnitTest
  :app:assembleDebug` confirming nothing regressed.
- **Major self-check finding, this session — worth re-running on every
  future lesson, not just this one**: the "Everything else in the file,
  not this lesson's subject but still explained" trailing Header
  section is *not* exempt from the full eight-sub-bullet CRC format
  every other Objects-and-methods entry gets — the schema states this
  explicitly ("Primary vs. supporting cast is about placement, not
  treatment. Every entry gets the full three-part format regardless of
  category" plus "CRC breakdown — added to every entry"), but both
  Lesson 4.1's and this lesson's own first-saved drafts wrote "Everything
  else" entries as a single bolded name plus one flowing paragraph
  instead — real, confirmed by comparing against this exact project's
  own already-shipped Lesson 3.6, which does use the full format there.
  Caught by actually running the CRC-bullet-count script (`grep -c` for
  each of the 8 exact labels) against the "Everything else" section
  specifically, not just the primary entries above it — both counts came
  back at zero for the CRC-specific labels while the "What it is"-style
  labels also came back zero, revealing the whole section was in the
  wrong format. Both lessons were rewritten in place, in the same
  session, before being considered shipped — this also surfaced a
  related miss: annotations (`@RunWith`, `@Config`, `@Test`, `@get:Rule`)
  had been listed under Objects-and-methods, when the schema requires
  annotations to live in Terms instead ("never a language keyword,
  annotation, or operator... those are concepts... belong in Terms
  Introduced instead") — both were moved. **Run this check explicitly
  against the "Everything else" section on every future lesson**, not
  just the primary entries above it — a lesson can pass every other
  self-check item while this one specific section silently reverts to
  an abbreviated, non-compliant format, since it's easy to treat
  "supporting cast" as license to write less.

- **🟢 `AndroidCalculator` now owns its state through a real
  `CalculatorViewModel`, not `CalculatorScreen`'s own `remember` — the
  real fix for Lesson 4.2's own proven risk (Lesson 4.3).** A new file,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`:
  `class CalculatorViewModel : ViewModel() { var state by mutableStateOf
  (CalculatorState()); private set; fun onButtonClick(label: String) {
  state = nextState(state, label) } }`. `CalculatorScreen` gained one new
  parameter, `calculatorViewModel: CalculatorViewModel = viewModel()`,
  replacing its own former `var state by remember { mutableStateOf
  (CalculatorState()) }` entirely; its own keypad `onClick` now calls
  `calculatorViewModel.onButtonClick(label)` instead of mutating a local
  variable directly. **Real, checked finding: zero new Gradle
  dependency needed** — `androidx.lifecycle:lifecycle-viewmodel:2.6.2`,
  `-viewmodel-compose:2.6.2`, and `-viewmodel-savedstate:2.6.2` were
  already resolved transitively via `androidx.navigation:
  navigation-compose` (Lesson 4.1's own dependency) — Navigation
  Compose's own real implementation needs `ViewModel` machinery
  internally for its own per-destination state. **Real, decisive proof,
  not argued for**: `viewModel()` called with no explicit owner
  anywhere in `CalculatorApp`'s own `NavHost` correctly resolves to the
  calculator's own specific `NavBackStackEntry` — confirmed real via
  `javap` this session that `androidx.navigation.NavBackStackEntry`
  genuinely implements `ViewModelStoreOwner`, the same real interface
  `ComponentActivity` implements. A new, permanent test,
  `CalculatorViewModelTest.kt`'s
  `inProgressCalculationSurvivesRealSimulatedConfigurationChange`, uses
  `Robolectric.buildActivity(ComponentActivity::class.java).setup()` +
  `.configurationChange()` (a real, JVM-simulated device rotation, no
  emulator needed) to prove a real in-progress calculation (`7`, `+`,
  `3`, `=` not yet pressed) genuinely survives — the exact real scenario
  Lesson 4.2's own Socratic prompt described, now closed. **Real,
  checked finding, worth knowing for any future Robolectric
  `ActivityController` use**: under this project's installed Robolectric
  version, `controller.get()` returns the *same* real Activity object
  before and after `.configurationChange()` (not a literally new
  instance, a genuine, checked difference from a real device's own
  behavior) — so object identity on the Activity itself can't prove a
  real teardown happened; the `ViewModelStore`'s own real survival is
  the decisive evidence instead, and it holds regardless. **Real,
  reproducible bug found and fixed before this lesson shipped**: the new
  test, run alone, passed; run as part of the *full* suite
  (`./gradlew :app:testDebugUnitTest --rerun`), it caused two unrelated
  tests (`HapticsTest`, `ThemeTest`) to fail with a real
  `androidx.test.espresso.AppNotIdleException`, reproduced twice — root
  cause: the built Activity was never torn down, leaving Robolectric's
  shared main-looper state dirty for later test classes in the same test
  JVM. **The real fix, now a standing pattern for any future
  `ActivityController`-based test**: call
  `controller.pause().stop().destroy()` at the end of the test. This
  project now has 27 real, passing tests. Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug`.
- **Methodology finding, this session**: a real regression from a new
  Robolectric `ActivityController`-based test can be invisible when that
  test class is run alone (or via a scoped `--tests` filter) and only
  surface when the *entire* suite runs together, because the failure
  lands in a completely unrelated test class, not the new one itself.
  `./gradlew :app:testDebugUnitTest --rerun` (forcing real re-execution,
  bypassing Gradle's own up-to-date caching) is what actually reproduced
  it reliably. **Standing rule for future lessons**: any lesson adding a
  test that builds a real `ActivityController` must run the *complete*
  project suite, not just the new test in isolation, before considering
  the lesson verified — a scoped-only run is not sufficient proof of "no
  regression."

- **🟢 Lesson 4.4 (MVVM: "Code That Doesn't Know It's Android") shipped
  — no production code changes, Slice 4 now four-fifths shipped.** A
  purely diagnostic lesson, exactly like Lesson 4.2's own shape: this
  project's own real three-layer architecture — `Calculator.kt` (Domain),
  `CalculatorViewModel.kt` (ViewModel), `MainActivity.kt` (UI) — already
  existed, unchanged, before this lesson began; the lesson's own real job
  was proving, with real, executed compiler evidence, that dependencies
  between them only flow one direction. **Real, decisive evidence,
  gathered this session, not asserted from a diagram**: (1) a real copy
  of `Calculator.kt` compiled standalone via `kotlinc` with *zero*
  classpath entries at all — no Android SDK, no Compose, nothing beyond
  the Kotlin standard library — real, clean success, confirmed by
  reading its own real, current content: zero `import` statements of any
  kind; (2) a real copy of `CalculatorViewModel.kt` failed to compile
  against only the Domain layer's own compiled output, then compiled
  cleanly the moment Compose's own real **Runtime** artifact
  (`androidx.compose.runtime`, providing `mutableStateOf`) and AndroidX's
  own real **Lifecycle ViewModel** artifact were added — with no Compose
  UI, no Material3, no `android.jar` on the classpath at all; (3) a real
  copy of `MainActivity.kt`, compiled against that exact same restricted
  classpath, failed — needing `android.os.Bundle`,
  `androidx.activity.ComponentActivity`,
  `androidx.compose.animation.animateColorAsState`,
  `androidx.compose.foundation.layout.Column`,
  `androidx.compose.material3.*`, and `androidx.navigation.*`, none of
  which the ViewModel layer needed even once. **Real, worth-knowing
  finding**: Compose ships as several separate real library artifacts
  (`androidx.compose.runtime` distinct from `androidx.compose.ui`), not
  one monolithic dependency — this is precisely what makes "the
  ViewModel layer only needs state machinery, never rendering" a real,
  structural fact provable by a real compile, not just a convention
  someone has to remember. This project still has 27 real, passing
  tests — unchanged, since no production code was touched. Real,
  verified via a final `./gradlew :app:testDebugUnitTest :app:assembleDebug`
  confirming nothing regressed.

- **🟢 Lesson 4.5 (Two One-Way Streets) shipped — no production code
  changes, Slice 4 now fully shipped.** A purely diagnostic lesson,
  exactly like Lessons 4.2's and 4.4's own shape: this project's state
  and events already move through exactly two one-way streets — state
  from `CalculatorViewModel` down to `CalculatorScreen`, read-only;
  events from `CalculatorScreen` up to `CalculatorViewModel`, decided by
  exactly one owner — and this lesson proves both directions are real,
  compiler-enforced guarantees, not just the current, coincidental shape
  of the code. **Real, decisive evidence gathered this session**: (1) a
  throwaway `Counter` class, with a `private set` property, proved
  externally-blocked writes and externally-open reads via two real,
  contrasting compiles; (2) a **real, important correction to that same
  lab's own first draft, caught before shipping**: the first draft
  claimed `private set`'s boundary was "the declaring file," and
  described `CalculatorScreen`'s real block as happening merely because
  it's "a different file" — a real, executed negative-case compile
  (`SameFileAttack.kt`, a second top-level `main` added to the *same*
  file as `Counter`, but outside its class body) proved this wrong:
  the real boundary is the *class*, not the file — that second `main`
  was rejected with the identical real error, despite sharing a file
  with `Counter`. The lesson was rewritten throughout, before shipping,
  to state the mechanism correctly (class-scoped `private`, not
  file-scoped), with the same real, temporary `MainActivity.kt` edit
  from Lesson 4.2's own established pattern (added, compiled, real error
  captured, reverted) used to confirm the real project's own
  `CalculatorViewModel.state` obeys the identical real rule; (3) a
  second throwaway pair, `Vault`/`OpenVault`, proved that an event
  ("deposit this amount," decided internally by `Vault.deposit`, which
  rejects non-positive amounts) guarantees one consistent rule regardless
  of caller, while a directly-writable `balance` let two different
  callers silently disagree about what "depositing -5" should do — one
  correctly rejected it, a second, careless one didn't, real output
  showing `100` versus `95` from the identical real call; applied to the
  real project via a real, executed `grep -n "nextState"` across both
  `MainActivity.kt` (zero matches) and `CalculatorViewModel.kt` (exactly
  one), confirming `nextState` — the function deciding what every event
  means — has exactly one real caller in this entire project. This
  project still has 27 real, passing tests — unchanged, since no
  production code was touched. Real, verified via a full
  `./gradlew :app:testDebugUnitTest :app:assembleDebug`.
- **Incidental, real finding this session, not part of Lesson 4.5's own
  content — recorded here, not fixed, since it's orthogonal to what this
  lesson touches.** Forcing a genuine full-suite re-execution via
  `./gradlew :app:testDebugUnitTest --rerun-tasks` (not `--rerun`, see
  below) surfaced real, intermittent flakiness: three consecutive full
  runs this session, zero code changes between them, came back
  FAIL / PASS / FAIL, always the identical two tests
  (`HapticsTest.pressingKeypadButtonTriggersHapticFeedback`,
  `ThemeTest.calculatorThemeProvidesRealCustomPrimaryColor`), both
  failing with a real `androidx.test.espresso.AppNotIdleException`
  ("Compose did not get idle... may be causing an infinite composition
  loop") at the very first `composeTestRule.setContent { ... }` call in
  each test, before any click or assertion. Neither test builds a real
  `ActivityController` (the already-known, already-fixed cause of a
  similar-looking flake from Lesson 4.3), so this is a real, currently
  open, different root cause, not yet investigated further this session
  — worth a real investigation the moment it recurs or a future lesson
  touches `HapticsTest`/`ThemeTest`/animation-related test setup.
  Transcripts real, saved at
  `verification/4.5/incidental_finding_full_suite_flakiness.txt`.
  **A real, important correction to this curriculum's own standing
  methodology, also discovered this session**: `--rerun`, the exact flag
  this handoff's own Lesson 4.3 methodology note has recommended since it
  was written, does **not** force real re-execution — a real, executed
  attempt with that exact flag this session completed in under a second
  with every task reported `UP-TO-DATE`, meaning nothing actually re-ran.
  The correct flag, confirmed for real this session, is
  `--rerun-tasks`. **Standing correction for every future lesson**: use
  `--rerun-tasks`, not `--rerun`, whenever a genuine forced full-suite
  re-execution is actually required.
- **🟢 Stage 6 (Scientific Mathematics), Slice 6 (Scientific Functions)
  started — Lesson 6.1 (A Function That Only Needs One Number) shipped,
  purely diagnostic, no production code changes.** Real, executed proof
  that this project's own established dispatch-table pattern
  (`Operation`/`Operator`/`operatorSymbols`, unchanged since this
  project's first working calculator) generalizes to a genuinely
  different shape of function object: a real, throwaway `fun interface
  UnaryFunction { fun apply(value: Int): Int }`, taking exactly one
  operand instead of `Operation`'s own two, with two real
  implementations, `Square` and `Negate`, retrieved from a real,
  throwaway `Map<String, UnaryFunction>` dispatch table by name and
  called directly — real, executed output `25` and `-5`, exactly as
  predicted. **Real, deliberate design call, recorded**: `Square`/
  `Negate` are real, named classes, not lambdas — directly fulfilling
  this project's own earlier, already-recorded reasoning (Stage 0) that
  permanent names would remain worth the extra code once more
  operations eventually arrived; Stage 6 is that arrival. **Real,
  deliberate scope limit, recorded**: no real, permanent scientific
  function (`sin`/`cos`/`sqrt`/`log`) was built — each needs real
  floating-point precision (`brd.md`'s own Lesson 6.4) and, for several
  of them, real domain-error handling (Lesson 6.3) neither of which
  exists yet; this lesson's own real job was proving the *structural*
  pattern generalizes, using safe, `Int`-only placeholder functions,
  before any real scientific math gets built on top of it. This project
  still has 43 real, passing tests — unchanged, since no production
  code was touched.
- **🟢 Lesson 6.2 (A Number That Doesn't Know What It Means) shipped —
  purely diagnostic, no production code changes.** Real, executed proof
  of Degrees/Radians/Angle-mode via a throwaway `enum class AngleMode {
  DEGREES, RADIANS }` and a real, executed, Int-only demonstration:
  `750 / 360 = 2` full rotations, `750 % 360 = 30` left over — real,
  exact, whole-number arithmetic, made possible specifically because a
  full turn in degrees is exactly `360`. **Real, honest, load-bearing
  finding driving this whole lesson's own scope, worked out this
  session rather than assumed**: real degree-to-radian conversion
  needs `π`, an irrational number — genuinely, structurally requiring
  real floating-point arithmetic, which this project does not have
  yet (`brd.md`'s own Lesson 6.4, "Floating Point," is explicitly
  where `Double` gets properly introduced). This confirms Lessons 6.2
  and 6.4 are more entangled than `brd.md`'s own separate listing
  suggests — resolved by keeping this lesson strictly conceptual
  (proving *why* the two units genuinely differ, using only
  already-established `Int` arithmetic) and explicitly, honestly
  deferring the real conversion itself, rather than either
  front-running `Double` before its own dedicated lesson or silently
  ignoring the real dependency. No `AngleMode` enum was added to the
  real project — with no real conversion function yet possible and no
  real caller, a real, permanent enum here would have been premature,
  the identical judgment already applied to Lesson 6.1's own
  `UnaryFunction` work. This project still has 43 real, passing tests
  — unchanged, since no production code was touched.
- **🟢 Lesson 6.3 (Functions That Know Their Own Limits) shipped —
  purely diagnostic, no production code changes.** Real, executed proof
  of Domain/Domain error — a term this curriculum's own real Lesson 2.5
  already introduced, via this project's own real, shipped
  division-by-zero fix — reapplied here to two BRD-named real examples,
  `sqrt(-1)` and `log(0)`, without needing `Double`. **Real, decisive
  design call, worked out this session rather than assumed**: a
  hand-written, `Int`-only `integerSquareRoot`/`integerLog2` pair,
  each checking its own real domain explicitly (`n < 0`; `n <= 0`)
  and throwing a real `IllegalArgumentException` before any real
  computation runs, directly previews the exact real check `sqrt`/
  `log` will eventually need, entirely avoiding the same `Double`
  entanglement Lesson 6.2 already found and deferred. Real, executed
  output: `integerSquareRoot(16) = 4`, `integerSquareRoot(17) = 4`
  (`⌊√17⌋`), `integerLog2(8) = 3`; `integerSquareRoot(-1)` and
  `integerLog2(0)` both throw the real, expected exception, caught and
  printed via `Throwable.message`. **Real, worth-knowing finding, part
  of this lesson's own real SE Lens**: without the explicit domain
  check, `integerSquareRoot`'s own real loop condition,
  `(candidate + 1) * (candidate + 1) <= n`, would never fire for a
  negative `n` and would silently return `0` — a real, plausible-
  looking, completely wrong answer, not a crash — real, concrete proof
  that a hand-written function has none of integer division's own
  automatic protection and needs an explicit check instead. This
  project still has 43 real, passing tests — unchanged, since no
  production code was touched.
- **🟢 `AndroidCalculator` now has real, permanent, tested scientific
  functions — Lesson 6.4 (Close Enough to Call Equal) — Slice 6 shipped.**
  A new file, `app/src/main/java/com/example/calculator/ScientificFunctions.kt`:
  `fun interface ScientificFunction { fun apply(value: Double): Double }`,
  implemented by `class SquareRoot` (a real, domain-checked square root,
  throwing `IllegalArgumentException` before ever calling
  `kotlin.math.sqrt` on a negative input) and `class Sine(private val
  mode: AngleMode)` (converting its own input via a new, real
  `toRadians(angle: Double, mode: AngleMode): Double` before calling
  `kotlin.math.sin`). A new, permanent `enum class AngleMode { DEGREES,
  RADIANS }` sits alongside them. **This closes both of Stage 6's own
  open forward-reference promises in one lesson** — the real
  degree-to-radian conversion Lesson 6.2 deferred, and the real `sqrt`
  domain check Lesson 6.3 deferred — both explicitly worked out this
  session as genuinely closeable together, since both were blocked on
  the exact same real dependency (`Double`) becoming available for the
  first time. **Real, decisive finding, checked rather than assumed**:
  `kotlin.math.sqrt(-1.0)` does not throw or crash — it silently returns
  `NaN`, confirmed by real, executed output this session — a different,
  and arguably more dangerous, failure shape than `integerSquareRoot`'s
  own silent wrong-answer (`0`) from Lesson 6.3, since a `NaN` could
  propagate through further real calculations before ever being
  noticed; `SquareRoot`'s own explicit domain check exists specifically
  to intercept it before it ever reaches `kotlin.math.sqrt` at all.
  **A second real, decisive finding, also checked, not assumed**:
  `sin(toRadians(180.0, AngleMode.DEGREES))` — mathematically exactly
  `0` — computes, for real, to `1.2246467991473532E-16`, because
  `kotlin.math.PI` is itself only `Double`'s own closest representable
  approximation of true π; a real, concrete, unplanned tie-back between
  this lesson's own first Concept Unit (`Double`'s own approximate
  nature) and its third (real trigonometry), discovered only because
  this lesson's own real execution, not a predicted value, was used.
  **Design call, made and recorded this session**: every new scientific
  function uses `kotlin.math` (`sqrt`, `sin`, `PI`, `abs`), not
  `java.lang.Math` directly, matching this project's own established
  idiomatic-Kotlin discipline — confirmed, via a real, freshly-compiled
  and run lab, that `kotlin.math`'s own real output is identical to
  `java.lang.Math`'s for every value this lesson computes. **Design
  call, investigated and recorded**: `Sine`'s own angle unit (`mode`) is
  fixed at construction, in its own primary constructor, rather than
  accepted as a second argument to `apply` — keeps `ScientificFunction`'s
  own real contract (one `Double` in, one `Double` out) uniform for
  every implementation, at a real, honest, recorded cost: one `Sine`
  instance only ever answers for one angle unit, so a future UI letting
  a user switch modes mid-session would need a fresh `Sine`, not a
  reused one. A new, permanent test file,
  `app/src/test/java/com/example/calculator/ScientificFunctionsTest.kt`,
  holds five real tests: `squareRootOfAPerfectSquareIsExact` (asserting
  `sqrt(16.0)` is exactly `4.0`, a real, confirmed exception to this
  lesson's own general "never assert `Double` equality exactly" rule,
  since a perfect square's own root has zero floating-point error),
  `squareRootOfANegativeNumberThrowsARealDomainError`,
  `toRadiansConvertsNinetyDegreesToApproximatelyHalfPi`,
  `sineOfNinetyDegreesIsApproximatelyOne`, and
  `sineOfOneHundredEightyDegreesIsApproximatelyButNotExactlyZero` (which
  asserts both `result != 0.0` *and* `abs(result) < epsilon` together, a
  real, permanent regression guard against this lesson's own headline
  finding). **Deliberate, honest scope limit, recorded**: neither
  `SquareRoot` nor `Sine` has a real caller anywhere else in this
  project yet — the same honest, open state `Tokenizer.kt` was left in
  after Lesson 5.4 — no Scientific-mode screen or keypad exists to call
  them from; see the `HomeScreen` forward-reference note, below, updated
  this session to reflect that the underlying engine is now real while
  the UI trigger condition remains unmet. This project now has 48 real,
  passing tests (43 prior + 5 new). Real, verified via a full, clean,
  saved `./gradlew testDebugUnitTest assembleDebug --rerun-tasks` run
  (`BUILD SUCCESSFUL`, 48/48 tests, 0 failures) — the already-documented
  `HapticsTest`/`ThemeTest` flake recurred twice more on earlier real
  attempts this session, confirmed unrelated the same way as every
  prior real-code lesson in this project; a separate, one-off
  `packageDebug` failure (a real `IncrementalSplitterRunnable` error)
  also occurred once, did not reproduce on retry, and is not treated as
  a new standing issue — most likely a transient build-tooling hiccup
  from two Gradle invocations run in quick succession, not a code
  defect.
- **🟢 Stage 7 (Persistence), Slice 7 (Calculation History) started —
  Lesson 7.1 (What Already Happened Doesn't Change) shipped.**
  `AndroidCalculator` now has a real, permanent, in-memory record of
  every calculation it's performed this session. A new file,
  `app/src/main/java/com/example/calculator/Calculation.kt`:
  `data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)`
  — a real, immutable historical record, with one strict, recorded
  discipline: never call `.copy()` on one, since `result` is only
  correct because it was computed at the same moment as the two
  operands it depends on. `CalculatorState` gains a fourth real
  property, `val history: List<Calculation> = emptyList()`; `nextState`'s
  own `"="` branch is restructured to build a real `Calculation` and
  append it via `current.history + Calculation(...)` — the real,
  non-mutating `List.plus` operator, deliberately chosen over
  `MutableList`/`.add()` — every time a calculation succeeds, and to add
  nothing at all when one fails (division by zero). **Real, decisive
  finding, proven via a real, executed throwaway lab before any real
  code was written**: giving `CalculatorState` a `MutableList` field
  instead would have silently broken its own established immutability
  guarantee — `.copy()` only copies a `MutableList` field's own
  *reference*, not its contents, so two `CalculatorState`s built from
  the same original would secretly share, and corrupt, the same
  underlying list; real, executed proof: `stateA.items`/`stateB.items`
  both read `[1, 2]` after mutating only one of them, and
  `stateA == stateB` printed `true`. **This also finally, properly
  resolves the "`copy()`'s stale result" gap flagged all the way back in
  Lesson 0.8** — not by making `.copy()` smarter, but by establishing,
  with real, executed proof of the actual corruption it would cause,
  that a `Calculation` is created once and never copied again. **A real,
  necessary regression fix, not just an addition**: this lesson's own
  change to `nextState` required correcting one already-shipped test,
  `pressingSevenPlusThreeEqualsProducesTen` — its own expected
  `CalculatorState` no longer matched reality the moment a real
  calculation started recording history — caught by actually running
  the full suite, not assumed safe because only new tests were added.
  **A related, real, important correction, discovered investigating this
  lesson's own scope**: this project's own long-standing Lesson 1.6 note
  claiming chained calculations (`7 + 3 = 10 + 5 = 15`) are "NOT
  supported" was stale — a real, executed trace of the current
  `nextState` this session proved chaining already works, and has since
  at least the Lesson 3.3 `CalculatorState` rewrite; the original note
  is corrected in place, above, rather than deleted. This project now
  has 50 real, passing tests (48 prior + 2 new, one existing test
  corrected). Real, verified via a full, clean, saved
  `./gradlew testDebugUnitTest assembleDebug --rerun-tasks` run
  (`BUILD SUCCESSFUL`, 50/50 tests, 0 failures) — the already-documented
  `HapticsTest`/`ThemeTest` flake recurred once more on an earlier real
  attempt this session, confirmed unrelated the same way as every prior
  real-code lesson in this project.
- **🟢 Lesson 7.2 (Gone the Moment the Process Is) shipped — no
  production code changes.** A purely diagnostic lesson, matching this
  project's own already-established pattern for exactly this shape of
  BRD entry (a bare concept list, no concrete described feature — the
  same shape Lessons 6.1/6.2/6.3 and 4.2/4.4/4.5 already had): three
  Concept Units (Persistence, Tables & Records, CRUD), each with its own
  isolated lab, then applied as real, honest analysis of this project's
  own current, unmodified `Calculation`/`CalculatorState.history`.
  **Design call, made and recorded this session**: seriously considered
  building a real, working but simple persistence mechanism this lesson
  (e.g. `SharedPreferences` or plain file I/O) rather than staying
  purely conceptual — rejected, because `brd.md`'s own very next lesson
  is named "Room," meaning any simpler mechanism built here would only
  be replaced, not built upon, the moment 7.3 starts — real, wasted
  work violating this project's own established just-in-time
  discipline. **Real, concrete evidence gathered this session, not
  asserted from feeling**: (1) a real, temporary `main()`, driving a
  verbatim, unchanged copy of this project's own real `Calculator.kt`/
  `Calculation.kt` through a real `7 + 3 =`, then building a second,
  completely fresh `CalculatorState()` standing in for a genuine process
  restart — real, executed proof that this project's own real history
  reads back empty (`[]`) the instant a fresh instance replaces the old
  one, exactly the real gap the rest of Stage 7 exists to close; (2) a
  real, executed lab proving a `List<data class>` already *is* a table
  in miniature — one element per row, one property per column — directly
  connected to this project's own real `Calculation` shape (`operator`/
  `operandA`/`operandB`/`result`), which already fits that exact shape
  with zero redesign needed; (3) a real, executed lab proving all four
  real CRUD operations (`add`, `find`, `indexOfFirst` + reassignment,
  `removeAll`) on a throwaway `MutableList`, then applied honestly back
  to this project's own real code: Create and Read are already real
  (`current.history + Calculation(...)`; any future read of
  `state.history`), Update is permanently, deliberately forbidden (per
  Lesson 7.1's own `.copy()` rule), Delete is a real, honest, unbuilt
  gap. This project still has 50 real, passing tests — unchanged, since
  no production code was touched.
- **🟢 `AndroidCalculator` now has real, permanent, working Room-backed
  persistence — Lesson 7.3 (An Address on Disk).** Three new real,
  permanent files: `app/src/main/java/com/example/calculator/CalculationEntity.kt`
  (`@Entity(tableName = "calculations") data class CalculationEntity(@PrimaryKey(autoGenerate = true) val id: Long = 0, val operator: String, val operandA: Int, val operandB: Int, val result: Int)`
  — a real, permanent, deliberately separate persistence-only type, not
  a reuse of the real, existing `Calculation`); `CalculationDao.kt`
  (`@Dao interface CalculationDao` with real `@Insert`/`@Query` methods);
  `AppDatabase.kt` (`@Database(entities = [CalculationEntity::class], version = 1, exportSchema = false) abstract class AppDatabase : RoomDatabase()`).
  A new, permanent test, `AppDatabaseTest.kt`, proves the whole real
  pipeline round-trips a real calculation correctly, via a real,
  in-memory Room database built through Robolectric. **New real Gradle
  dependencies**: `app/build.gradle.kts` gains the `kotlin-kapt` plugin
  and `androidx.room:room-runtime:2.6.1`/`room-ktx:2.6.1`/
  `room-compiler:2.6.1` (the last routed through `kapt(...)`, not
  `implementation`) — confirmed, this session, to resolve and build
  cleanly on the first real attempt, no version-compatibility trial and
  error needed. **Design call, made and recorded this session**: KAPT
  chosen over the newer, faster KSP specifically for this project's own
  already-pinned, older toolchain (Kotlin 1.9.24), trading real build
  speed for real, confirmed compatibility. **Real, decisive findings,
  checked rather than assumed, all three saved to
  `verification/7.3/`**: (1) Room's own real annotation processor
  genuinely refuses to compile an `@Entity` with no `@PrimaryKey`
  (`"An entity must have at least 1 field annotated with @PrimaryKey"`),
  a real, compiler-enforced requirement, not just documented advice; (2)
  Room's own real, generated `_Impl` code, read directly out of this
  project's own real build output (not reconstructed from memory), shows
  `@Insert`/`@Query` really do become genuine, parameterized SQL and
  real `Cursor`-walking code — proof `@Dao` isn't opaque magic; (3) a
  real, plain (non-`suspend`) Room database genuinely throws
  `IllegalStateException: Cannot access database on the main thread...`
  when queried from Robolectric's own simulated main thread — fixed with
  the real, legitimate `.allowMainThreadQueries()` escape hatch,
  deliberately chosen over introducing `suspend` early, since Coroutines
  is explicitly a later, dedicated lesson's own job. **Design call, made
  and recorded this session**: `CalculationEntity` is a real, deliberate,
  separate type from the real, existing `Calculation` — not the same
  type reused with Room annotations added — keeping this project's own
  domain logic free of persistence concerns, a boundary the next lesson
  (Repository) is about to formalize. **Deliberate, honest scope limit,
  recorded, and now a tracked forward-reference promise (see below)**:
  nothing in this project's own real `CalculatorViewModel` calls any of
  this new persistence code yet — real, permanent, tested, and
  completely unused by the rest of the app, exactly the shape Lesson
  7.4 (Repository) exists to change. **Methodology note, this session**:
  this lesson's own mandatory diff-check caught more real defects than
  usual before shipping — a throwaway lab's own interface name didn't
  match what was actually compiled (`LabCalculationDao` written in the
  draft vs. the real, verified `LabBrokenDao`), a real generated Java
  method was shown truncated with a bare `...` the elision-scan's own
  regex didn't catch, a claimed "BUILD SUCCESSFUL" output was never
  actually piped to a saved file (only the JUnit XML was), and a shown
  test-report XML was missing its own real `<?xml ...?>` declaration and
  `<properties/>` tag — all four caught only by the diff-check's own
  systematic, automated sweep, not by careful reading, reinforcing why
  this step stays mandatory on every lesson. This project now has 51
  real, passing tests (50 prior + 1 new). Real, verified via a full,
  clean, saved `./gradlew testDebugUnitTest assembleDebug --rerun-tasks`
  run (`BUILD SUCCESSFUL`, 51/51 tests, 0 failures) — the
  already-documented `HapticsTest`/`ThemeTest` flake recurred once more
  on an earlier real attempt this session, confirmed unrelated the same
  way as every prior real-code lesson in this project.
- **🟢 `AndroidCalculator` now has a real, permanent, tested Repository
  giving Room's own real persistence its first proper caller — Lesson
  7.4 (Nothing Outside Needs to Know).** Two new real, permanent files:
  `app/src/main/java/com/example/calculator/CalculationMapper.kt`
  (`fun Calculation.toEntity(): CalculationEntity` /
  `fun CalculationEntity.toDomain(): Calculation`, using each enum's own
  real, compiler-generated `.name`/`.valueOf(...)` to bridge the real,
  type-safe `Operator` and the plain `String` Room actually stores);
  `CalculationRepository.kt` (`class CalculationRepository(private val dao: CalculationDao)`
  with domain-shaped `save(calculation: Calculation)` and
  `getAll(): List<Calculation>`, never exposing `CalculationEntity` to
  any real caller). Two new, permanent tests —
  `CalculationMapperTest.kt` (a real, executed round-trip proof) and
  `CalculationRepositoryTest.kt` (the same real, in-memory Room +
  Robolectric pattern established in Lesson 7.3, proving the whole real
  pipeline — mapper and DAO together — round-trips a real domain
  `Calculation` correctly). **Real, decisive design work, worked out
  honestly this session rather than assumed**: the original
  forward-reference promise (below) named wiring this Repository
  directly into `CalculatorViewModel` as this lesson's own job — worked
  out, this session, to be a genuine mistake to actually do yet: calling
  a real, blocking Room operation from `onButtonClick` would either
  crash outright (this project's own real, shipped `AppDatabase` is
  never built with `.allowMainThreadQueries()`, unlike this lesson's own
  tests) or force a genuinely bad, main-thread-blocking design; building
  some other, temporary workaround now, only to replace it the moment
  real Coroutines exist, would repeat the exact kind of premature
  engineering Lesson 7.2 already chose not to do for persistence itself.
  The real, honest scope call: build and prove the Repository completely
  correct on its own, real and tested, deliberately not yet called from
  the live app — the same honest "no real caller yet" shape
  `Tokenizer.kt` had after Lesson 5.4 — with the actual, safe UI wiring
  now explicitly, precisely re-owed to Lesson 7.5 (see the
  forward-reference promise update, below). This project now has 53
  real, passing tests (51 prior + 2 new). Real, verified via a full,
  clean, saved `./gradlew testDebugUnitTest assembleDebug --rerun-tasks`
  run (`BUILD SUCCESSFUL`, 53/53 tests, 0 failures) — the
  already-documented `HapticsTest`/`ThemeTest` flake recurred once more
  on an earlier real attempt this session, confirmed unrelated the same
  way as every prior real-code lesson in this project. **Methodology
  note**: this lesson's own mandatory diff-check, run as a complete,
  systematic sweep matching every single fenced block against a real
  saved or permanent file, found zero defects — the first real-code
  lesson since this check became mandatory to pass cleanly on the first
  full pass, worth noting as a real, positive data point for the
  practice, not just a source of caught mistakes.
- **🟢 `CalculatorViewModel` now genuinely persists every successful
  calculation, safely, without ever blocking the real screen — the real,
  final wiring the 7.4 promise re-owed to this lesson (Lesson 7.5,
  Waiting Without Blocking).** Three real Concept Units, each proven via
  real, executed evidence rather than assumed from familiarity with
  standard JVM coroutine behavior: (1) **`suspend`** — a real, temporary
  `labSuspendGreeting` proved, via a genuine, captured compile error
  (`Suspend function 'labSuspendGreeting' should be called only from a
  coroutine or another suspend function`), that `suspend` is a real,
  compiler-enforced restriction, not a naming convention; `CalculationDao`'s
  `insert`/`getAll` and `CalculationRepository`'s `save`/`getAll` all gained
  the real modifier, and `AppDatabaseTest.kt`/`CalculationRepositoryTest.kt`
  were updated to call them from inside `runBlocking { }`, with
  `.allowMainThreadQueries()` removed from both — no longer needed once
  every call goes through a suspend path. (2) **Dispatcher** — a real,
  temporary Room DAO/database pair proved, via a real, executed,
  Robolectric-run test, that Room's own suspend DAO methods already run
  safely off the main thread with **no** explicit `Dispatchers.IO`/
  `withContext` needed and **no** `.allowMainThreadQueries()` required —
  a genuine, checked finding, not assumed from general coroutine
  knowledge, that directly justified removing that call in Unit 1; a
  second real lab, comparing `Thread.currentThread().name` inside a
  `withContext(Dispatchers.IO) { }` block against the calling test
  thread's own name, proved the real, concrete thread-switching mechanism
  a Dispatcher performs. (3) **Structured Concurrency** — a real,
  temporary `LabScopedWorker`, launching delayed work inside its own
  `CoroutineScope(Dispatchers.Default)`, proved via a real, executed test
  that cancelling the scope before the delay finishes genuinely stops the
  work from ever completing. **The real, permanent fix**:
  `CalculatorViewModel` now takes `@JvmOverloads constructor(application:
  Application, private val repository: CalculationRepository =
  CalculationRepository(Room.databaseBuilder(application,
  AppDatabase::class.java, "calculator.db").build().calculationDao()))`,
  extends `AndroidViewModel(application)` instead of plain `ViewModel()`,
  and `onButtonClick` now calls `viewModelScope.launch { repository.save(newCalculation)
  }` exactly when a new calculation lands in `state.history`. **Real,
  decisive bug caught and fixed this session, not anticipated in
  advance**: adding that default-valued second constructor parameter
  broke the real, already-existing `CalculatorViewModelTest.kt`'s own
  `ViewModelProvider(activity).get(CalculatorViewModel::class.java)` call
  with a genuine, captured `NoSuchMethodException:
  com.example.calculator.CalculatorViewModel.<init>(android.app.Application)`
  — because Kotlin's default-parameter mechanism does not, by itself,
  generate a separate, reflection-visible single-argument JVM constructor;
  `@JvmOverloads` is the real, minimal, confirmed fix, re-verified by
  re-running the exact same test to a real `BUILD SUCCESSFUL`. **Real,
  checked finding, worth knowing for future ViewModel/coroutine-testing
  work**: under Robolectric, `viewModelScope.launch`'s own real body
  completes synchronously enough that a fake DAO's own recorded state is
  already correct by the time `onButtonClick` returns — a new, permanent
  test file, `CalculatorViewModelPersistenceTest.kt`, proves both
  `successfulCalculationIsSavedThroughTheRealRepository` and
  `failedCalculationIsNeverSaved` using a real, hand-written
  `FakeCalculationDao`, with **no** `kotlinx-coroutines-test`/
  `TestDispatcher` machinery needed at all — confirmed necessary only
  after first checking, since assuming standard JVM coroutine-testing
  patterns would transfer unchanged here was exactly the risk this
  session was warned to check empirically rather than assume. **No new
  Gradle dependency** — `kotlinx-coroutines-core`/`-android:1.7.1` and
  `lifecycle-viewmodel-ktx:2.6.2` (for `viewModelScope`) were both
  confirmed, via a real `./gradlew :app:dependencies` run, to already be
  resolved transitively (through Room's own `room-ktx` and the existing
  Compose/Lifecycle stack) before this lesson began. This project now has
  55 real, passing tests (53 prior + 2 new). Real, verified via a full,
  clean `./gradlew testDebugUnitTest assembleDebug` run (`BUILD
  SUCCESSFUL`, 55/55 tests, 0 failures).
- **🟢 This project's own persisted calculation history now genuinely,
  visibly reaches the user, live, with no manual refresh anywhere in the
  path — Slice 7 (Calculation History) shipped (Lesson 7.6, A Question
  That Keeps Answering).** Two real Concept Units. (1) **Flow**:
  `CalculationDao.getAll()` converted from `suspend fun getAll():
  List<CalculationEntity>` to `fun getAll(): Flow<List<CalculationEntity>>`;
  `CalculationRepository.getAll()` converted the same way, using
  `kotlinx.coroutines.flow.map` to convert each emitted list. Two real,
  already-existing tests (`AppDatabaseTest`, `CalculationRepositoryTest`)
  updated to read through the new `Flow` via `.first()`. Proven, via a
  real, temporary Room DAO/database pair and a real, executed,
  deterministic test, that a `Flow`-returning query genuinely re-emits
  after a real insert, with zero explicit refresh call — the first
  attempt at this same lab, using a fixed `delay(50)` before inserting,
  produced a real, misleading result (both emissions came back
  identical, because the insert sometimes landed before Room's own first
  query ran); the fix, a real polling loop waiting for genuine proof
  each stage happened rather than guessing a duration, is the version
  actually shown — a real, worth-remembering methodology finding for any
  future lesson testing indeterminate async timing. (2) **StateFlow**:
  `CalculatorViewModel` gained `val persistedHistory: StateFlow<List<Calculation>> =
  repository.getAll().stateIn(viewModelScope, SharingStarted.Eagerly,
  emptyList())`; `CalculatorScreen` gained a new `LazyColumn`, reading
  `persistedHistory` via `collectAsState()`, rendering one row per saved
  calculation. **Real, decisive, empirically-checked design choice**: a
  real, temporary lab proved `SharingStarted.WhileSubscribed(...)`'s own
  `.value` never updates with zero active collectors, while
  `SharingStarted.Eagerly`'s does — the real reason `Eagerly` was chosen,
  not assumed from general familiarity with the API. `FakeCalculationDao`
  (`CalculatorViewModelPersistenceTest.kt`, first built in Lesson 7.5)
  was rebuilt around a real `MutableStateFlow`, forced to change the
  moment `CalculationDao`'s own interface changed, and a new, third,
  real, permanent test,
  `persistedHistoryReflectsARealSaveWithNoExplicitRefreshCall`, proves
  the full, real, reactive chain end to end with no database or
  Robolectric-timing assumptions unverified. **No new Gradle
  dependency** — `androidx.compose.foundation:foundation` (the real
  package `LazyColumn`/`items` live in) confirmed, via a real, executed
  `./gradlew :app:compileDebugKotlin`, to already be resolved
  transitively through this project's existing Material3 dependency.
  This project now has 56 real, passing tests (55 prior + 1 new). Real,
  verified via a full, clean `./gradlew testDebugUnitTest assembleDebug`
  run (`BUILD SUCCESSFUL`, 56/56 tests, 0 failures) — the
  already-documented `HapticsTest`/`ThemeTest`/(this session, also
  `NavigationTest`) flake recurred on earlier attempts, confirmed
  unrelated the same way as every prior real-code lesson in this
  project, by re-running the new/affected tests in isolation before
  retrying the full suite for a clean save.

## Progress

- **Stage 0 (Kotlin Foundations), Slice 0 (Console Calculator): complete —
  all 10 lessons shipped.** Lesson-by-lesson status below.
- **🟢 Stage 1 (Android Fundamentals), Slice 1 (The First Android
  Calculator): complete — all 6 lessons shipped.** A real, fully working
  Android calculator now exists (see the standing decisions below,
  especially Lesson 1.6's own real business-logic integration).
- **🟢 Stage 2 (Testing & Better OOP), Slice 2 (Trustworthy Calculator):
  complete — all 5 lessons shipped.** See the standing decisions below —
  the `Calculator` class removed, a real, complete 4-operator AAA test
  suite, a real fifth operation `Modulo` added via TDD, the five
  `Operation` implementations made `private`, and, finally, Lesson 2.5's
  real division-by-zero fix (`try` as an expression, `"Error"` on the
  display instead of a crash, `||` recovery, a real testTag on every
  keypad button). This project now has 12 real, passing tests.
- **🟢 Stage 3 (UI Engineering), Slice 3 (Beautiful Calculator):
  complete — all 6 lessons shipped.** See the standing decisions below —
  a real `Theme.kt` naming this calculator's own color, text style, and
  button shape exactly once with a `CalculatorTheme` composable making
  every screen read them automatically; a real, permanent
  `CalculatorButton` composable replacing `CalculatorScreen`'s own
  sixteen inline `Button` calls; a real, single, immutable
  `CalculatorState` and `Display` sealed class replacing three separate
  `remember`ed properties and the old `"Error"` string sentinel, closing
  a second real, previously-uncaught crash along the way; a real,
  animated display color distinguishing an ordinary value from
  `Display.Error`, via `animateColorAsState`; three real, permanently
  tested accessibility guarantees — explicit spoken labels for ambiguous
  keypad symbols, a confirmed real `48dp` minimum touch target, and a
  real, computed WCAG contrast-ratio check; a real haptic pulse on every
  real keypad press, via `LocalHapticFeedback`. This project now has 22
  real, passing tests.
- **🟢 Stage 4 (Architecture & Navigation), Slice 4 (Calculator Modes):
  complete — all 5 lessons shipped.** See the standing decisions
  below — a real second screen, `HomeScreen`, and a real `CalculatorApp`
  composable wiring it to `CalculatorScreen` through Jetpack Navigation
  Compose (`NavHost`/`composable`/`rememberNavController`), a real
  back stack proven with `TestNavHostController`, and a real navigation
  argument carrying the chosen mode through to the calculator screen
  (4.1); a purely diagnostic lesson naming Coupling, Cohesion,
  Responsibility, and Separation of Concerns, with real, proven evidence
  that `CalculatorScreen`'s own current design already has a real,
  reproducible risk — no production code changed (4.2); a real
  `CalculatorViewModel`, the real fix for that exact risk, with a real,
  Robolectric-simulated configuration change proving a user's
  in-progress calculation genuinely survives (4.3); real, compiler-proven
  evidence that this project's own three files already form a real MVVM
  architecture — Domain needs nothing, ViewModel needs state machinery
  but never rendering, UI needs everything — no production code changed
  (4.4); real, compiler-proven evidence that this project's state and
  events already move through exactly two one-way streets — state down,
  read-only; events up, decided by exactly one owner — no production
  code changed (4.5). This project now has
  27 real, passing tests.
- **🟢 Stage 5 (DSA Through the Scientific Calculator), Slice 5
  (Expression Parser): complete — all 11 lessons shipped.** See the
  standing decisions above — a real, executed proof that this project's
  own current `nextState` cannot hold two pending operators at once,
  this slice's own starting vocabulary (tokens, grammar, operator
  precedence, associativity), real, executed, counted or timed proof of
  all five Big-O growth rates (Lesson 5.2), a real, hand-written Stack
  proving LIFO/push/pop/peek and correctly validating this slice's own
  real target expression's parentheses (Lesson 5.3), this project's
  first real, permanent, tested tokenizer (Lesson 5.4), a real,
  hand-written Queue proving which structure preserves this project's
  own real token order (Lesson 5.5), this project's own real, permanent,
  tested Shunting-Yard algorithm (Lesson 5.6), a real, hand-written
  expression tree matching this project's own real target expression,
  with a real, executed proof that a post-order read of it exactly
  reproduces `toPostfix`'s own already-tested result (Lesson 5.7),
  real, live proof of the actual call stack via
  `Thread.currentThread().stackTrace`, plus a real, general, recursive
  function independently reproducing that same postfix result for a
  third time (Lesson 5.8), this project's own real, permanent AST
  builder (Lesson 5.9), this project's own real, permanent evaluator —
  correctly computing `3 + 5 × (2 − 8)` to its real answer, `-27`, for
  the first time, closing the exact gap Lesson 5.1's own opening probe
  proved (Lesson 5.10), and, in Lesson 5.11, a real, escalating test
  battery proving the complete pipeline correct on genuinely harder
  valid expressions, plus a real, previously-unknown, honestly
  documented (not fixed) crash on malformed input. This project now has
  43 real, passing tests.
- **🟢 Stage 6 (Scientific Mathematics), Slice 6 (Scientific Functions):
  complete — all 4 lessons shipped.** See the standing decisions
  above — real, executed proof that this project's own established
  dispatch-table pattern generalizes from two-operand to one-operand
  functions, using safe, `Int`-only placeholder functions
  (`Square`/`Negate`) (Lesson 6.1); real, executed, Int-only proof of
  exactly why degrees and radians are genuinely different units, and a
  real working-out of exactly why converting between them has to wait
  for `Double` (Lesson 6.2); real, executed, Int-only proof of what a
  domain error means and how a function should report one, using
  hand-written `integerSquareRoot`/`integerLog2` functions previewing
  real `sqrt`/`log`'s own eventual domain checks without needing
  `Double` either (Lesson 6.3); and, in Lesson 6.4, this project's own
  first real `Double`, a real, permanent, domain-checked `SquareRoot`
  and a real, angle-mode-aware `Sine`, closing both of this slice's own
  open forward-reference promises in one lesson, plus the real,
  concrete finding that `sin(180°)` computes to a tiny nonzero value
  rather than a clean zero, tying this project's own floating-point-
  precision and real-trigonometry work together. This project now has
  48 real, passing tests.
- **🟢 Stage 7 (Persistence), Slice 7 (Calculation History):
  complete — all 6 lessons shipped.** See the standing decisions
  above — a real, permanent `Calculation` data class
  and a real, growing `CalculatorState.history`, built and proven with
  real, executed evidence that a `MutableList` field would have silently
  broken this project's own established immutability discipline, and
  that this finally, properly resolves the `copy()` stale-result gap
  Lesson 0.8 first flagged (Lesson 7.1); real, executed proof of exactly
  why that history doesn't yet survive a restart, what shape durable
  storage for it would take (tables of uniform records, already matching
  `Calculation`'s own real shape), and which of the four CRUD operations
  this project's own history already performs, permanently forbids, or
  hasn't built yet, no production code changed (Lesson 7.2); this
  project's own first real, working, Room-backed persistence — a real
  `@Entity`, `@Dao`, and `@Database`, proven to round-trip a real
  calculation correctly through a real, in-memory database (Lesson 7.3);
  in Lesson 7.4, a real, tested Repository and domain/persistence mapper
  finally giving that persistence a proper caller — though still
  deliberately not the live `CalculatorViewModel` itself, a scope
  refinement worked out honestly this session (see the standing
  decisions above); and, in Lesson 7.5, the real, final, safe wiring
  itself — `CalculatorViewModel` now genuinely saves every successful
  calculation through the real Repository, via `viewModelScope.launch`,
  never blocking the real screen, closing the forward-reference promise
  Lesson 7.4 re-owed to this lesson (see the forward-reference promises
  section, now fulfilled). `history` now genuinely, durably survives a
  process death for the first time in this project's own life — the one
  real piece still open is that nothing in this project's own UI reads
  and, in Lesson 7.6, the real, final piece — `CalculationDao`/
  `CalculationRepository`'s own `getAll()` converted from a one-shot
  `suspend` read into a live `Flow`, and `CalculatorViewModel`'s new
  `persistedHistory: StateFlow<List<Calculation>>`, built with
  `.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())` and
  rendered by a new `LazyColumn` in `CalculatorScreen` via
  `collectAsState()` — closing the loop end to end: a real database
  change now becomes a real, visible screen change, automatically, with
  no manual refresh call anywhere in the path. This project now has 56
  real, passing tests.
- **🟢 Stage 8 (Linear Algebra), Slice 8 (Matrix Calculator) started —
  Lesson 8.1 (Rows That Don't Have to Match) shipped.** See the standing
  decisions above — three real, isolated `kotlinc` labs proving
  `List<List<Int>>` is a real, legal way to represent a 2D grid, that
  `grid[row][col]` is two chained calls to the same `List<E>.get`
  operator already established for plain `List<Int>`, and, the real
  motivating finding, that nothing about `List<List<Int>>` stops its
  rows from having different lengths — a real, executed, compiled
  "jagged list" that Kotlin accepts exactly as readily as a well-formed
  one. Purely diagnostic; no production code changed. This project still
  has 56 real, passing tests.
- **🟢 Lesson 8.2 (The Grid That Checks Itself) shipped.** See the
  standing decisions above — a real, permanent `Matrix.kt`, validated at
  construction (closing Lesson 8.1's own proven gap for real), with a
  real two-parameter `operator get`, and all five BRD-named operations
  (`add`, `subtract`, `multiply`, `transpose`, `determinant`) working,
  each with its own real, isolated `kotlinc` lab and its own real
  Concept Unit. A new, permanent `MatrixTest.kt` adds 10 real, passing
  tests. This project now has 66 real, passing tests.
- **🟢 Lesson 8.3 (Eight Times Instead of Four) shipped.** See the
  standing decisions above — real, counted proof that
  `add`/`subtract`/`transpose` share real `O(n²)` growth while
  `multiply` is genuinely `O(n³)` — `8×` real cost per doubling, not
  `4×` — a growth rate new to this project; `determinant`'s own
  real, constant-time nature named honestly without a dedicated unit.
  Purely diagnostic; no production code changed. This project still has
  66 real, passing tests.
- **🟢 Lesson 8.4 (Choosing the Math After the Fact) shipped.** See the
  standing decisions above — a real `MatrixOperation` Strategy-pattern
  interface, `MatrixAddition`/`MatrixMultiplication` as real, named
  singleton implementations `add`/`multiply` now delegate to (a real
  package-level naming collision with `Calculator.kt`'s own already-
  private `Addition`/`Multiplication` caught by the real compiler and
  fixed), and a real, decisive, executed investigation proving
  `Inverse` needs `Matrix` to support a non-`Int` type before it can be
  built correctly — honestly deferred, not built, with a real
  forward-reference promise now owed to Lesson 8.6. This project now
  has 69 real, passing tests.
- **🟢 Lesson 8.5 (A Name Instead of Twenty-Five Numbers) shipped.** See
  the standing decisions above — a real `Matrix.identity(size)` factory
  function via an unnamed `companion object`, a real, investigated
  rejection of a heavier class-based Factory (BRD's own "only if
  genuinely benefits" condition answered honestly), and a deliberate
  scope limit (only `identity`, no speculative siblings). This project
  now has 71 real, passing tests.
- **🟢 Lesson 8.6 (The Class That Doesn't Know Its Own Numbers)
  shipped — the `Inverse` forward-reference promise, open since Lesson
  8.4, is now closed.** See the standing decisions above — `Matrix`
  rewritten as a genuinely generic `Matrix<T>`; `add`/`subtract`/
  `multiply`/`determinant` relocated to real extension functions on
  `Matrix<Int>` specifically, a real, necessary move proven by a real,
  259-line negative-case compiler error; a bounded-type-parameter
  alternative investigated and rejected as genuinely speculative; and a
  real, permanent `Matrix<Double>.inverse()`, computing this project's
  own already-proven-correct formula on genuine `Double` cells at last.
  This project now has 74 real, passing tests.
- **🟢 Lesson 8.7 (True for Every Matrix, Not Just One) shipped —
  Slice 8 (Matrix Calculator) shipped in full.** See the standing
  decisions above — a new `MatrixInvariantTest.kt`, this project's own
  first real property-based tests (`repeat(100)` over genuine
  `kotlin.random.Random` values), the identity and addition-commutativity
  invariants proven that way, multiplication's real non-commutativity
  proven instead with one deliberate, permanent counterexample (a random
  version would have been genuinely flaky), and the inverse invariant
  closing the loop — which along the way surfaced a real, unplanned JVM
  type-erasure collision (`Matrix<Int>.multiply` and a new
  `Matrix<Double>.multiply` erase to the identical JVM signature),
  real-fixed with `@JvmName`. This project now has 78 real, passing
  tests. Every operation BRD's own Slice 8 plan named — `add`,
  `subtract`, `multiply`, `transpose`, `determinant`, `inverse` — is now
  real, permanent, and tested.
- **🟢 Stage 9 (Graphing), Slice 9 (Equation Graph) started — Lesson 9.1
  (Where Up Stopped Being Positive) shipped.** Purely diagnostic, no
  production code changed — three real, isolated `kotlinc` labs
  (batch-compiled together in one pass, saved to `verification/9.1/`)
  proving, in order: the Cartesian coordinate system (an infinite,
  `y`-up plane, demonstrated by turning five raw `Double`s into five
  `Point`s on `y = x²`); the Android/screen pixel coordinate system (a
  bounded, `y`-down grid with its origin fixed at the top-left corner,
  demonstrated by naming a hypothetical 400×400 screen's four real
  corners); and the coordinate-transformation formula connecting them —
  `toScreenX`/`toScreenY`, an origin offset plus a scale factor, with a
  deliberate sign flip on the `y` axis alone. **Real, caught mistake,
  worth recording**: the first real compile of the third lab's own
  `main` function had a copy-paste error — its last line passed `2.0`
  into `toScreenY` instead of `4.0` — producing a genuinely wrong
  `(240, 160)` instead of the correct `(240, 120)`; caught only by
  actually running the code, not by re-reading the source, then fixed
  and recompiled before the real output was saved — recorded honestly in
  `verification/9.1/lab3_output.txt` alongside the corrected output.
  **Self-check finding, this session**: the first-saved draft cited
  "Lesson N" inside four Header Terms entries, one Objects-and-methods
  CRC *Shape* bullet, and five separate Concept Unit body locations
  (two Discard steps, one Mechanical Walkthrough bullet, two SE Lens
  sentences) — caught by the standing `grep -n "Lesson [0-9]"` scan and
  fixed by restating each citation's substance in place, with no bare
  lesson-number pointer left anywhere outside the Header's "What you
  need to know first" list and the closing "Next:" pointer, confirming
  this scan still needs to run in full on every lesson, Header CRC
  entries included, not just Concept Unit prose. **Also caught this
  session**: the schema's own "CS lens... name several unrelated places
  the same idea recurs, as a short list" instruction is illustrated with
  a literal fenced block in the schema's own text; the first-saved draft
  had written all three units' own "Also recognized in" lists as plain
  prose instead — reformatted to match the schema's own literal fenced
  presentation in all three units before this lesson was considered
  shipped. This project's own real evaluator (`Evaluator.kt`) still has
  no variable support and works only on `Int`, not `Double` — a real,
  current gap this lesson deliberately did not touch or reference by
  lesson number, left for Lesson 9.2's own sampling work to raise and
  close on its own terms. This project still has 78 real, passing
  tests — unchanged, since no production code was touched.
- **🟢 Lesson 9.2 (The Same Expression, Many Answers) shipped — this
  project's own real expression pipeline now supports a variable and
  real `Double` evaluation, and a new, permanent `sample` function
  exists.** **Real, reachable crash found and fixed, verified first per
  this curriculum's own standing methodology**: run for real against
  this project's own then-current, unmodified `Tokenizer.kt`/
  `ShuntingYard.kt`/`AST.kt`, `toPostfix(tokenize("x×x"))` silently
  dropped both `"x"` tokens (neither number, known operator, nor paren
  matched any branch of `toPostfix`'s own `when` block, and a
  statement-position `when` with no matching branch and no `else`
  simply does nothing) leaving `postfix = [×]`; `buildTree` then tried
  to pop two children for that lone operator off a real, empty stack,
  throwing a genuine `IndexOutOfBoundsException` — saved in
  `verification/9.2/break1_variable_gap.kt` and
  `break1_output.txt`. **The real fix**: a new, shared
  `fun isOperand(token: String): Boolean = token.toIntOrNull() != null
  || token == "x"` added to `ShuntingYard.kt`, called from both
  `toPostfix`'s own operand branch and `AST.kt`'s `buildTree` (both
  previously had their own separate, independently-wrong
  `token.toIntOrNull() != null` check) — one shared function instead of
  two separately-drifting copies. **A second real, permanent addition**:
  `Evaluator.kt` gains `fun evaluateAt(node: Node, x: Double): Double`,
  a genuinely separate function from the existing `evaluate` (left
  completely untouched, still the real, only path this project's live
  calculator screen uses) — walks the same real `Node` tree recursively,
  substitutes a given `x` at any leaf whose value is literally `"x"`,
  and dispatches `+`/`−`/`×`/`÷` directly as real `Double` arithmetic
  rather than through the existing `Operation`/`Operator` system, which
  is permanently typed to `(Int, Int) -> Int` and has no `Double`
  counterpart — a deliberate, recorded scope decision (a full
  `Operation` generification, mirroring Lesson 8.6's own `Matrix<T>`
  treatment, was considered too large and risky for this lesson, and
  BRD names no such lesson for Stage 9). **A third real, permanent
  addition, a brand-new file**: `Graphing.kt`, holding `data class
  Point(val x: Double, val y: Double)` (the same shape Lesson 9.1's own
  discarded lab already previewed, this time real) and `fun sample(f:
  (Double) -> Double, xMin: Double, xMax: Double, sampleCount: Int):
  List<Point>` — deliberately generic over any `(Double) -> Double`
  rather than hard-coded to this project's own `Node`/`evaluateAt`,
  keeping `sample` completely ignorant of this project's own expression
  format (the real wiring — `sample({ x -> evaluateAt(tree, x) }, ...)`
  — happens only at real call sites, proven in `GraphingTest.kt`, not
  inside `sample` itself). This project now has 84 real, passing tests
  (6 new: two in `ShuntingYardTest.kt`, one in `ASTTest.kt`, one in
  `EvaluatorTest.kt`, two in the new `GraphingTest.kt`). **Flake note,
  consistent with the standing Robolectric/Espresso limitation**: the
  pre-existing `HapticsTest`/`NavigationTest`/`ThemeTest`
  `AppNotIdleException` flake recurred on several `testDebugUnitTest`
  attempts this session — confirmed not a regression by running the
  new/touched test classes in isolation (always clean) and by retrying
  the full suite until a genuinely clean, saved 84/84 run was captured
  (`verification/9.2/step1_full_suite.txt`). Real, verified via a full
  `./gradlew :app:testDebugUnitTest :app:assembleDebug`.
- **🟢 Lesson 9.3 (What the Canvas Won't Show You) shipped — this
  project draws its first real, visible curve.** A real, new "Graph"
  button on `HomeScreen` and a new `"graph"` `NavHost` route lead to a
  real, permanent `GraphScreen`: parses this project's own `"x×x"`,
  samples it a hundred times, converts every point to a real screen
  coordinate, and draws the connected result via Android's own real
  `Canvas`/`Path` API. **`Graphing.kt` gained, all real and permanent**:
  `ScreenPoint`/`toScreenX`/`toScreenY` — Lesson 9.1's own formulas,
  proven once in a discarded lab, finally promoted to real code —
  `toScreen` (a new combiner, closing the exact deferred refinement
  Lesson 9.1's own SE Lens had named), `toScreenPoints`, and
  `buildGraphPath` (a real, `DrawScope`-free function building a `Path`
  from a `List<ScreenPoint>`, deliberately kept pure and independently
  testable). **Real, major finding, investigated properly before being
  accepted**: Robolectric's own Compose UI testing (trusted since Lesson
  1.4) can prove a `Canvas` composes, doesn't crash, and gets the
  correct real layout size — but a real, temporary lab proved,
  concretely, that `DrawScope`'s own draw lambda does not observably
  execute under this project's current Robolectric setup at all (two
  package-level `mutableStateOf` properties, written only from inside
  the draw lambda, stayed at their initial `-1f` even after
  `waitForIdle()`). Two real, separate attempts to get past this were
  made before accepting it as a genuine, sharper boundary on the
  project's own standing GPU-rendering limitation:
  `@GraphicsMode(GraphicsMode.Mode.NATIVE)` made no difference, and
  `composeTestRule.onRoot().captureToImage()` (the documented API for
  forcing a real capture) hung and timed out. **Design consequence**:
  every function this lesson could keep `DrawScope`-free —
  `toScreenPoints`, `buildGraphPath` — was, deliberately, leaving only
  one real, unverifiable step (`drawPath` itself) as small as possible;
  `Path.getBounds()` (a real, inspectable `Rect`) turned out to be a
  genuinely meaningful assertion target for `buildGraphPath`'s own real
  geometry, confirmed by a real throwaway probe before being relied on.
  **Real, caught mid-session bug in this curriculum's own drafting, not
  the app**: `Graphing.kt`'s functions were first added in a different
  order than the lesson's own narrative (`buildGraphPath` after all four
  transform functions, not before) — caught by this session's own
  code-block diff-check sweep against the real file, fixed by reordering
  the real file to match the narrative (`ScreenPoint`, `buildGraphPath`,
  then `toScreenX`/`toScreenY`/`toScreen`/`toScreenPoints`), a safe,
  behavior-preserving change confirmed by a full, clean test rerun
  afterward. This project now has 90 real, passing tests (6 new: two in
  `GraphingTest.kt`, two in the new `GraphPathTest.kt`, one in the new
  `GraphScreenTest.kt`, one in `NavigationTest.kt`). Real, verified via a
  full `./gradlew :app:testDebugUnitTest :app:assembleDebug`, with the
  same pre-existing Haptics/Navigation/Theme flake (now occasionally
  joined by `GraphScreenTest`'s own single Compose-UI test, same root
  cause) recurring on several attempts before a genuinely clean 90/90 run
  was captured (`verification/9.3/step3_full_suite.txt`).
- **🟢 Lesson 9.4 (What the Fingers Can Prove) shipped — this project's
  real graph responds to touch for the first time.** `Graphing.kt`
  gained a real, permanent `data class GraphTransform(val panOffset:
  Offset, val scale: Double)` and `fun applyGesture(current:
  GraphTransform, pan: Offset, zoom: Float): GraphTransform` — a
  deliberately pure function, no `Canvas`/`DrawScope`/gesture detector in
  its own signature, matching this project's own established discipline
  (Lesson 9.3's `toScreenPoints`/`buildGraphPath`). `GraphScreen` now
  holds one real `var transform by remember { mutableStateOf(...) }`
  instead of computing a fixed origin fresh every draw, and its own
  `Canvas` gained a real `.pointerInput(Unit) { detectTransformGestures
  { _, pan, zoom, _ -> transform = applyGesture(transform, pan, zoom) }
  }` block — one real gesture detector handling both drag-as-pan and
  pinch-as-zoom, since `detectTransformGestures` reports both from
  however many real fingers are down. **Real, major finding, genuinely
  surprising, investigated properly rather than assumed**: this
  project's own earlier standing note that "true multi-touch gesture
  recognition still cannot be verified this way" turned out to be
  wrong, or at least stale — a real, temporary lab proved Compose's own
  `performTouchInput` testing API genuinely supports synthetic
  *multi*-pointer sequences (`down(pointerId, ...)`, `moveTo(pointerId,
  ...)`, tracked independently per real pointer ID), and a real,
  synthetic two-finger pinch (fingers starting `141.4px` apart, ending
  `282.8px` apart) drove `detectTransformGestures` to report an exact
  real zoom of `2.0` — confirmed reproducible, no touch-slop-style
  shortfall unlike drag. **A second real finding, from the same
  session's own drag lab**: `detectDragGestures` consumes a real, fixed
  touch-slop distance before reporting any drag delta at all — a raw
  `(300, 200)` move reported as `(286.7, 191.1)`, and a smaller raw
  `(30, 20)` move reported as `(16.7, 11.1)` — the identical `(13.3,
  8.9)` shortfall both times, confirming it's a fixed threshold, not a
  percentage. **Design consequence, this project's own established
  pattern extended one lesson further**: because `applyGesture` is pure,
  it has an exact, instant, Robolectric-free test
  (`applyGestureAccumulatesRealPanAndMultipliesRealScale`); the only
  gesture-related tests that need real Robolectric UI simulation
  (`draggingTheRealGraphCanvasDoesNotCrashTheRealScreen`,
  `pinchingTheRealGraphCanvasDoesNotCrashTheRealScreen`) only prove a
  real gesture reaches the real screen without crashing it — not what
  the screen then draws, per Lesson 9.3's own already-confirmed
  `DrawScope`-observability limit. This project now has 94 real, passing
  tests (4 new: two in `GraphingTest.kt`, two in `GraphScreenTest.kt`).
  Real, verified via a full `./gradlew :app:testDebugUnitTest
  :app:assembleDebug`, with the same pre-existing flake pattern (now
  also occasionally covering all three of `GraphScreenTest`'s own tests)
  recurring on several attempts before a genuinely clean 94/94 run was
  captured (`verification/9.4/step3_full_suite.txt`).
- **🟢 Lesson 9.5 (Fast Enough Is a Real Number) shipped — Slice 9
  (Equation Graph) now shipped in full, per the BRD's own "🟢 Ship Slice
  9" line.** Purely diagnostic in its own first unit, one small, real,
  permanent addition in its second: a new `PerformanceTest.kt` asserting
  `toScreenPoints`/`buildGraphPath`, at this project's own real `100`-point
  sample count, complete in under a real `5` millisecond bound (a
  deliberately generous ceiling — real, warmed-up measurements came in
  under a single millisecond even at `10,000` points). **Real
  investigation, methodologically important, worth remembering for any
  future timing-based lesson**: a first, real, un-warmed-up timing loop
  produced a genuinely backwards result — `buildGraphPath` at `100`
  points measured slower (`~10.9ms`) than at `1,000` points (`~2.0ms`) —
  a real, confirmed instance of JVM class-loading/JIT warm-up cost being
  mistaken for algorithmic cost. Adding a real `50`-iteration warm-up
  pass before measuring, and averaging `20` real repetitions per data
  point, corrected this; even so, the corrected real numbers still don't
  trace a textbook-clean straight line (`toScreenPoints` grew `~50×`
  while its own input grew `1000×`) — recorded honestly as a real,
  known limit of wall-clock microbenchmarking without a dedicated tool
  like JMH, with `toScreenPoints`'s own real `O(n)` complexity asserted
  instead from its own code structure (one `map`-driven call per
  element, an already-established, documented stdlib contract), not
  from the noisy timing numbers alone. **Real, confirmed finding
  directly extending Lesson 9.3's own `DrawScope`-observability limit**:
  a temporary, instrumented counter placed inside the real
  `toScreenPoints` function itself, to try to count how many times a
  real gesture triggers a redraw, stayed at `0` even after a real,
  synthetic drag — confirming the same "code inside a real `DrawScope`
  draw lambda is not observable under this project's Robolectric setup"
  finding also blocks counting invocations, not just inspecting drawn
  pixels; this is why this lesson's own real measurements time the two
  underlying, `DrawScope`-free functions directly instead. This project
  now has 95 real, passing tests (1 new). **Real, session-local mistake,
  not a project defect, worth recording**: an early full-suite run this
  session failed with real "Could not write XML test results" errors —
  caused by this session's own concurrent execution of a second,
  unrelated `./gradlew` timing experiment against the same project at
  the same time, racing on the same output directory, not a flake in
  this project's own tests; a clean, isolated rerun passed all 95 tests
  with zero failures on its very first attempt. Real, verified via a
  full `./gradlew :app:testDebugUnitTest :app:assembleDebug`
  (`verification/9.5/step2_full_suite.txt`).

**🟢 Stage 9 (Graphing), Slice 9 (Equation Graph): shipped in full,
Lessons 9.1–9.5 all complete.** A real, interactive graphing calculator
now exists: a real expression (`x×x`) parses through this project's own
Stage 5/6 pipeline, extended with real variable support and `Double`
evaluation (Lesson 9.2); samples into real Cartesian points (Lesson
9.2); converts to real screen coordinates through a transform proven
once in isolation and made real three lessons later (Lessons 9.1, 9.3);
draws as a real, continuous curve via Android's own real `Canvas`/`Path`
API (Lesson 9.3); responds to real drag and pinch gestures, changing
that same real transform's own pan and scale (Lesson 9.4); and does all
of it fast enough, backed now by a real, permanent, automated regression
guard instead of a one-time impression (Lesson 9.5). This project now
has 95 real, passing tests, 0 known regressions. The single largest,
recurring real finding across this entire stage: this project's own
Robolectric-based testing can prove composition, layout, real screen
size, and real gesture-input recognition — but not that a `DrawScope`'s
own draw-time code actually ran, confirmed independently three separate
times (Lessons 9.3, 9.4, and 9.5), each time by a real, executed
attempt, never assumed from the previous lesson's own finding alone.
- **🟢 Stage 10 (Concurrency & Performance), Slice 10 (Smooth Graphing)
  started — Lesson 10.1 (The Queue Every Tap Waits In) shipped.** Purely
  diagnostic, matching the pattern already established by Lessons 4.2,
  8.1, and 9.1 — no production code left changed by the end of it. Two
  real Concept Units. (1) A real, temporary `LabLooperTest.kt`, added
  directly to the real Gradle project (the only way to reach real,
  working `android.os.Looper`/`Handler` under a real, simulated Android
  runtime), proved that Robolectric's real, simulated main `Looper`
  starts paused and runs every posted `Runnable` strictly in the order
  posted, only once told to `idle()` — real, quoted source from AOSP's
  own `Looper.java`/`Handler.java` (fetched this session from
  `android.googlesource.com`, both `refs/heads/main` and
  `refs/heads/android14-release`) confirms `loop()`'s real body is a
  literal `for (;;) { ... }`, and `Handler`'s own class Javadoc states
  plainly that an app's main thread "is dedicated to running a message
  queue." A second, batched test in the same lab proved `check(...)`'s
  own real failure mode (a real, caught `IllegalStateException`, its
  message genuinely computed from the trailing lambda, not fixed text).
  (2) A real, temporary, two-line patch to `CalculatorButton`'s own real
  `onClick` — `check(Thread.currentThread() ==
  Looper.getMainLooper().thread) { ... }` plus a real `Thread.sleep(500)`
  — proved, first, that the `check` never threw across this project's
  entire existing test suite (every real click this project's tests
  perform already runs on the exact real main-`Looper` thread Unit 1
  characterized), and second, via a real, measured
  `System.nanoTime()`-bracketed `performClick()` call, that a slow
  `onClick` genuinely, synchronously blocks for its own real duration —
  a real, forced-failure run captured the exact measured value,
  `elapsedMs=584`, before the assertion was corrected to its real,
  passing form. Both temporary changes were reverted immediately after;
  a full, clean `./gradlew testDebugUnitTest assembleDebug --rerun-tasks`
  run confirmed this project's exact prior state restored — `95` tests,
  `0` failures. **Real, cited platform fact, fetched this session from
  Android's own official documentation**
  (`developer.android.com/topic/performance/vitals/anr`): blocking the
  main thread for `5` real seconds without responding to an input event
  is what actually triggers a real ANR ("Application Not Responding")
  dialog — the real, official, named consequence this lesson's own
  evidence builds toward, beyond what Robolectric itself can simulate
  (the same already-established Robolectric/`DrawScope`-observability
  limitation this project documented across Lessons 9.3–9.5). This
  project's own real `sample`/`buildGraphPath` functions are nowhere near
  that threshold today — already, directly measured at comfortably
  sub-millisecond — so this lesson proves and names a real, structural
  risk without yet triggering it anywhere in this project's own current
  code. This project still has 95 real, passing tests — unchanged, since
  no production code was left touched.
- **🟢 Lesson 10.2 (Off the Main Thread, Still Tied to the Screen)
  shipped — `GraphScreen`'s own real sampling work is no longer
  synchronous on the main thread.** Two real Concept Units, the first
  purely diagnostic, the second a real, permanent production change. (1)
  A real, standalone, plain-`kotlinc` lab (no Android needed —
  `kotlinx-coroutines-core` alone) proved, with a real, measured number,
  that `Dispatchers.Default` and `Dispatchers.IO` are genuinely
  different real thread pools: fifty real, concurrently-launched,
  genuinely blocking (`Thread.sleep`, not `delay`) coroutines used
  exactly `10` distinct real threads on `Dispatchers.Default` — this
  machine's own real CPU core count, confirmed independently via
  `Runtime.getRuntime().availableProcessors()` — versus `50` distinct
  real threads on `Dispatchers.IO`, one per task, reproduced identically
  across three separate runs. Real, official documentation for both
  (`kotlinlang.org/api/kotlinx.coroutines`, fetched this session) quoted
  and confirmed the real numbers match: `Dispatchers.Default` capped at
  "the number of CPU cores, \[...\] at least two"; `Dispatchers.IO`
  defaulting to "64 threads or the number of cores (whichever is
  larger)." (2) A real, temporary lab (`LabLaunchedEffectTest.kt`, a
  tiny two-route `NavHost` reusing this project's own established
  `TestNavHostController`/`ComposeNavigator` pattern from Lesson 4.1)
  proved `LaunchedEffect`'s own real structured-concurrency guarantee:
  a `LaunchedEffect` left on screen genuinely completes its own real
  background work, while an identical one whose screen is navigated
  away from before that work finishes never does — confirmed via real,
  fetched AndroidX source (`Effects.kt`,
  `LaunchedEffectImpl.onForgotten()` calling
  `job?.cancel(ExitedCompositionCancellationException())`), not assumed
  from the KDoc alone. **The real, permanent fix**: `GraphScreen`'s own
  `val points = remember { sample(...) }` (synchronous, on the main
  thread) is now `var points by remember { mutableStateOf<List<Point>>
  (emptyList()) }` plus `LaunchedEffect(Unit) { points =
  withContext(Dispatchers.Default) { sample(...) } }` — real,
  asynchronous, and automatically cancelled the instant `GraphScreen`
  itself leaves composition. A new, permanent test in `GraphingTest.kt`,
  `samplingOnDispatchersDefaultProducesTheIdenticalRealResultToSamplingDirectly`,
  confirms the async wrapping changes nothing about `sample`'s own real,
  computed output. This project's existing `GraphScreenTest.kt` suite
  required no changes — none of its three tests ever asserted on
  `points`'s own specific values, only that the real canvas composes and
  survives real gesture input, both still true with an initially-empty,
  later-populated points list. **Design call, recorded**: `LaunchedEffect`
  was given the fixed key `Unit`, since `GraphScreen`'s own real
  expression is still hardcoded to `"x×x"` — there is, honestly, nothing
  yet for a real key to vary with; the moment a real, editable expression
  exists, which real key should govern cancel-and-restart becomes a live
  design question, explicitly left open here and owed to whichever future
  lesson gives `GraphScreen` real, editable input (a genuine candidate
  for Lesson 10.3, "Cancellation," though not pre-committed under that
  exact name). This project now has 96 real, passing tests (95 prior + 1
  new). Real, verified via a full `./gradlew testDebugUnitTest
  assembleDebug` run — the already-documented `HapticsTest`/
  `NavigationTest`/`ThemeTest`/`GraphScreenTest` `AppNotIdleException`
  flake recurred on two full-suite attempts this session (the identical
  6 of 96 tests both times, none from this lesson's own new code),
  confirmed unrelated by re-running the affected classes
  (`GraphScreenTest`, `GraphingTest`) in isolation to a clean 10/10, then
  retrying the full suite until a genuinely clean, saved `96/96` run
  landed (`verification/10.2/step1_full_suite.txt`), alongside a real,
  installable `.apk`.
- **🟢 Lesson 10.3 (The Old Answer Never Gets to Land) shipped — closes
  the exact "live design question" Lesson 10.2's own SE Lens deliberately
  left open.** Two real Concept Units. (1) A real, temporary lab
  (`LabKeyedEffectTest.kt`) proved `LaunchedEffect`'s own second real
  guarantee — not just cancelling on leaving composition (Lesson 10.2)
  but cancelling and restarting when its own key changes — using a
  real, deliberately asymmetric timing setup (the *older*, cancelled
  key's own background work was given the *longer* real duration, `800`
  vs `200` real milliseconds) so a passing result could only mean real
  cancellation, not a timing coincidence. **A real, deliberate negative-
  case check, run before trusting the positive result**: temporarily
  changing `LaunchedEffect(key)` to `LaunchedEffect(Unit)` made the
  identical test fail for real, with a real, captured
  `expected:<[B]> but was:<[A]>` — confirming the stale result genuinely
  does land without real cancellation, and that the passing test
  actually discriminates. Real, fetched `javap` evidence
  (`kotlinx.coroutines.JobCancellationException extends
  java.util.concurrent.CancellationException extends
  IllegalStateException`) named the exact real exception type that stops
  a cancelled coroutine's own stale write from ever executing. (2) The
  real, permanent fix: `GraphScreen` gained a real, editable `expression`
  state (starting at `"x×x"`) and two new real `CalculatorButton`s
  (`"x×x"`, `"x"`) above the canvas; `LaunchedEffect(Unit)` became
  `LaunchedEffect(expression)`, with expression-tree building
  (`tokenize`/`toPostfix`/`buildTree`) moved inside the async block
  alongside `sample` — this project's first real proof its own
  expression pipeline works for anything other than the one string it's
  been hardcoded to since Lesson 9.1. A new, permanent test in
  `GraphScreenTest.kt`,
  `switchingToARealDifferentExpressionKeepsTheGraphScreenWorking`, taps
  both real buttons in quick succession and confirms the real graph
  canvas survives throughout. **Design call, recorded**: two real, fixed
  expression buttons were chosen over a free-text field, deliberately, so
  this lesson could focus specifically on cancellation without also
  having to invent real invalid-expression-handling UX at the same time
  — a free-text field remains a real, legitimate, explicitly-named future
  option. This project now has 97 real, passing tests (96 prior + 1
  new). Real, verified via a full `./gradlew testDebugUnitTest
  assembleDebug` run — the same already-documented `GraphScreenTest`/
  `HapticsTest`/`NavigationTest`/`ThemeTest` `AppNotIdleException` flake
  recurred on two full-suite attempts this session (the identical 6 of
  97 tests both times, none from this lesson's own new code), confirmed
  unrelated by re-running `GraphScreenTest` in isolation to a clean 4/4,
  then retrying the full suite until a genuinely clean, saved `97/97`
  run landed (`verification/10.3/step1_full_suite.txt`), alongside a
  real, installable `.apk`.
- **🟢 Lesson 10.4 (Free to Answer While It's Still Thinking) shipped —
  Stage 10 (Concurrency & Performance), Slice 10 (Smooth Graphing)
  shipped in full.** Purely diagnostic, no production code changed,
  closing this stage the same way it opened. Two real Concept Units.
  (1) A real, temporary lab (`LabResponsivenessTest.kt`) built a
  composable combining `LaunchedEffect`/`Dispatchers.Default`/
  `withContext` exactly as `GraphScreen` already ships, with a real
  `2000`ms background sleep — proving, with a real, measured
  `elapsedMs=62` (forced to print via a deliberate, temporary assertion
  failure before being corrected), that a real button click on the main
  thread returns near-instantly while that background work is still
  running — the direct, positive mirror of Lesson 10.1's own real
  `elapsedMs=584` finding for a genuinely blocked thread. (2) A real,
  standalone `kotlinc` lab measured this project's own real, empirical
  memory cost per sampled `Point` — `60.07408` real bytes, reproduced
  identically across three runs — via `Runtime.getRuntime().totalMemory()`/
  `.freeMemory()`, a real technique new to this project; at this
  project's own real, current `100`-point scale, that's a real
  `100 × 60.07408 ≈ 6,007` bytes, under `6` real kilobytes. Rendering
  cost was named honestly rather than re-investigated — this project's
  own already three-times-confirmed (Lessons 9.3–9.5) `DrawScope`-
  observability limit stands unchanged. This project still has 97 real,
  passing tests — unchanged, since no production code was touched. Real,
  verified via the two isolated lab runs above (both saved in full,
  `verification/10.4/`); no new combined-suite run was needed since
  nothing in the real, shipped project changed.
- **🟢 Stage 10 (Concurrency & Performance), Slice 10 (Smooth Graphing):
  shipped in full, Lessons 10.1–10.4 all complete.** This project's real
  main thread now runs one task at a time, strictly serially — proven,
  and its exact real cost measured (`elapsedMs=584` for a genuinely
  blocked thread, Lesson 10.1). `GraphScreen`'s own real sampling work
  moved off that thread, onto `Dispatchers.Default` — the real, correctly
  sized pool for CPU-bound work, distinct from `Dispatchers.IO` — via
  `LaunchedEffect`, a real, structured-concurrency mechanism guaranteeing
  that work can never outlive `GraphScreen` itself (Lesson 10.2). A real,
  user-driven reason for that work to restart was added — two selectable
  real expressions — with `LaunchedEffect`'s own real, key-based
  cancellation proven, via a deliberately asymmetric real timing setup
  and a confirmed negative case, to stop a stale answer from ever landing
  even when its own real duration would otherwise have let it finish last
  (Lesson 10.3). Finally, the real payoff was measured directly: a real
  button stays responsive (`elapsedMs=62`) while a genuinely slow
  background computation runs, and this project's own real CPU, memory,
  and rendering costs were named, measured, or honestly deferred, not
  assumed (Lesson 10.4). This project now has 97 real, passing tests, 0
  known regressions.
- **🟢 Stage 11 (Learning APIs From Documentation), Slice 11 (Tilt-to-Pan)
  started — Lesson 11.1 (The Contract Before the Code) shipped.** Purely
  diagnostic, no production code changed — this project's first real
  encounter with a genuinely unfamiliar Android API (the Sensor API),
  taught as a transferable, real skill: reading an unfamiliar API's own
  real, official documentation systematically before writing any code
  against it. Two real Concept Units, both verified against real, fresh-
  fetched AOSP source (`SensorManager.java`, `SensorEventListener.java`,
  branch `refs/heads/android14-release`, fetched this session) and real
  `javap` output against this project's own real, installed
  `android.jar`. (1) A real, temporary lab
  (`LabSensorEntryTest.kt`) proved `getSystemService(Context
  .SENSOR_SERVICE)`, cast to `SensorManager`, genuinely returns a real,
  non-null instance under Robolectric — confirming the real entry point
  the fetched `@SystemService(Context.SENSOR_SERVICE)` class annotation
  already named — and found, empirically, that a real, simulated
  Robolectric device starts with zero sensors until a test explicitly
  adds one. (2) A real, temporary lab (`LabSensorLifecycleTest.kt`),
  using Robolectric's own real, dedicated `ShadowSensorManager`/
  `ShadowSensor` testing support, proved `registerListener` genuinely
  starts real event delivery (confirmed via real `hasListener` checks
  and a real, dispatched, synthetic `SensorEvent` whose exact values
  arrived intact at a real listener's `onSensorChanged`), and that
  `unregisterListener` genuinely stops it. **Real, honest, additional
  finding**: Robolectric's own `ShadowSensorManager.createSensorEvent`
  helper is itself deprecated in this project's real, installed
  Robolectric 4.13 — a real deprecation in the *test tooling*, not in
  Android's own production Sensor API (confirmed by trying the
  documented, newer alternative for real, which threw a real
  `NullPointerException`); reverted to the working, if deprecated,
  overload rather than chase a deprecation-free path at the cost of a
  real, working test. **Real mistake caught and fixed this session,
  worth recording as a methodology note**: this lesson's own first-saved
  draft's Concept Unit 1 code block was missing one real import
  (`org.robolectric.Shadows.shadowOf`) that the actually-executed,
  saved verification file had — caught by this session's own mandatory
  diff-check sweep, run explicitly against the real saved lab source,
  not just eyeballed; resolved by removing the real, genuinely-unused
  import from the saved file itself (cleaner than preserving dead code)
  and re-running to confirm the cleaned version still compiles and
  passes before re-saving. This project still has 97 real, passing
  tests — unchanged, since no production code was touched. Real, final
  baseline confirmed via a full, clean `./gradlew testDebugUnitTest
  assembleDebug` run (`97/97`, `0` failures) — the already-documented
  `GraphScreenTest`/`HapticsTest`/`NavigationTest`/`ThemeTest`
  `AppNotIdleException` flake recurred on two attempts this session
  first, confirmed unrelated (this lesson touched no production code at
  all) before a genuinely clean save landed
  (`verification/11.1/step1_full_suite.txt`).
- **🟢 Lesson 11.2 (A Window Meant to Close) shipped — per the BRD's own
  explicit framing for this exact lesson, a genuinely throwaway feature,
  built for real, proven for real, then deliberately discarded.** Two
  real Concept Units. (1) A real, temporary lab
  (`LabDisposableEffectTest.kt`) proved `DisposableEffect` — this
  project's first real use of it, confirmed via real, fetched AndroidX
  source (`Effects.kt`, branch `refs/heads/androidx-main`, fetched this
  session) — guarantees exactly one real `onDispose` call the instant its
  host composable leaves composition, with no coroutine, dispatcher, or
  `Job` involved at all (`DisposableEffectImpl` implements the same real
  `RememberObserver` interface `LaunchedEffectImpl` already did, but
  `onForgotten()` calls a plain `onDispose?.dispose()` instead of
  cancelling a coroutine) — a real, deliberate, non-coroutine sibling to
  `LaunchedEffect`. (2) A real, temporary sensor-viewer composable and
  test (`LabSensorViewerTest.kt`) combined `DisposableEffect` with the
  previous lesson's own real Sensor API to prove live hardware data can
  genuinely reach real, on-screen Compose text: a real, synthetic,
  dispatched `SensorEvent` updated a real `Text` from `"x=0.0"` to
  `"x=4.5"`, and real cleanup was confirmed via
  `shadowOf(sensorManager).listeners.size` — `1` while on screen, `0`
  after navigating away. **Both real, temporary files — composable and
  test alike — were deleted immediately after this real run**, exactly
  as the BRD's own "Throwaway: Tiny sensor viewer" framing required;
  nothing about this project's own permanent code changed. **Real
  mistake caught and fixed this session, second time this exact pattern
  recurred**: this lesson's own first-saved draft's Concept Unit 2 code
  block was missing one real import
  (`androidx.compose.runtime.mutableStateOf`) that the actually-executed,
  saved verification file had — caught again by this session's own
  mandatory diff-check sweep; resolved the same way as Lesson 11.1's own
  identical finding, by removing the real, genuinely-unused import from
  the saved file and re-verifying. **A second real accuracy fix, caught
  during this session's own self-review**: this lesson's own SE Lens
  first claimed three real "mistakes" were "made and fixed" while
  building this lesson's own labs (event reuse, state placement,
  `DisposableEffect`'s required final statement) — none of the three
  were actually gotten wrong first and then fixed during this session's
  real work; corrected to honestly describe them as real design
  questions this lesson's own labs had to answer, not mistakes actually
  caught. This project still has 97 real, passing tests — unchanged,
  since no production code was touched. Real, final baseline confirmed
  via a full, clean `./gradlew testDebugUnitTest assembleDebug` run,
  saved in full in `verification/11.2/step1_full_suite.txt`.
- **🟢 The phone's own tilt now really pans the graph (Lesson 11.3) —
  Slice 11 more than half-shipped.** Unit 1 proved `LocalContext`, a
  Compose `CompositionLocal` reaching the current real Android `Context`
  from directly inside a composable with nothing passed in as a
  parameter — this project's second real use of that mechanism, after
  `LocalHapticFeedback` (Lesson 3.6). **Real, honest finding, caught by
  an actual failing assertion, not predicted in advance**: a real, first-
  written test assumed `LocalContext.current` under Robolectric's
  `createComposeRule()` would be the identical real object
  `ApplicationProvider.getApplicationContext()` returns — it genuinely
  failed (`expected=android.app.Application actual=
  androidx.activity.ComponentActivity`); investigated and corrected to
  the real, accurate claim: `LocalContext.current` is a real, hosting
  `ComponentActivity` (needed for Compose to have a real window), whose
  own `.applicationContext` genuinely is the same real `Application`
  object obtained directly — saved in full, both the real failure and
  the real fix, in `verification/11.3/lab1_output.txt`. Unit 2 made this
  project's real, permanent tilt-to-pan feature: `Graphing.kt` gained
  `sensorValuesToPanDelta(x: Float, y: Float): Offset`, a small, pure
  function scaling and axis-correcting a raw accelerometer reading into
  the same real `Offset` shape `applyGesture`'s own `pan` parameter
  already expects; `MainActivity.kt`'s `GraphScreen` gained a real
  `DisposableEffect` — reached via `LocalContext.current` instead of a
  passed-in parameter — registering a real `SensorEventListener` against
  the device's real accelerometer and calling `applyGesture` a second,
  independent way on every real sensor reading, alongside the existing
  real touch-gesture path, both driving the exact same shared `transform`
  state. **A second real, additional finding, this time a positive
  confirmation rather than a caught failure**: a new, permanent test,
  `sensorRegistersOnComposeAndUnregistersOnLeavingComposition`, obtained
  its own real `SensorManager` independently through
  `ApplicationProvider.getApplicationContext()` and still saw the exact
  same real listener `GraphScreen`'s own internal `LocalContext`-based
  `DisposableEffect` registered — real, concrete proof that
  `LocalContext.current`'s own `getSystemService` and
  `ApplicationProvider.getApplicationContext()`'s own `getSystemService`
  resolve to the identical real `SensorManager` singleton under
  Robolectric, not two separate ones. This project now has 99 real,
  passing tests (2 new: `sensorValuesToPanDeltaScalesAndInvertsTheRealXAxisReading`
  in `GraphingTest.kt`, `sensorRegistersOnComposeAndUnregistersOnLeavingComposition`
  in `GraphScreenTest.kt`). **The known, pre-existing
  `AppNotIdleException` flake recurred once this session**, on the first
  full-combined-suite run (8 of 99 tests failed, all the same real
  Espresso cross-test-class idle-state flake, none in tests this lesson
  added or touched) — resolved the established way, by retrying the full
  suite once more: a second, clean run passed all 99 tests with zero
  failures, saved in full in `verification/11.3/step2_full_suite.txt`,
  alongside `verification/11.3/step1_production_tests.txt`'s own
  targeted, real confirmation of just this lesson's two new tests. Real,
  verified via a full `./gradlew testDebugUnitTest assembleDebug`.
- **🟢 A real, physical click on every real axis crossing (Lesson 11.4)
  — Slice 11 shipped in full.** Unit 1 re-applied Lesson 11.1's own
  documentation-reading checklist to a second, genuinely different real
  Android API: `Vibrator`/`VibrationEffect`, obtained and used the same
  real `getSystemService` pattern already proven for `SensorManager`.
  **Real, checked finding**: `Context.VIBRATOR_SERVICE` is itself
  genuinely deprecated (real compiler warning), in favor of
  `Context.VIBRATOR_MANAGER_SERVICE`/`VibratorManager` — investigated,
  deliberately not adopted, since migrating would need its own real SDK-
  version branch for a capability this project's existing, still-
  functional path already provides correctly on every device its own
  `minSdk` (24) targets. **A second real, honest investigation**: the
  isolated lab proving `VibrationEffect.createPredefined(EFFECT_TICK)`
  actually requested the real TICK effect first failed at
  `@Config(sdk = [34])` — fetching Robolectric's own real
  `ShadowSystemVibrator.java` source showed the shadow method exposing a
  simple, checkable effect ID is real, only `@Implementation(minSdk = Q,
  maxSdk = R)` (API 29-30); fixed by testing that one specific claim at
  `@Config(sdk = [30])` instead, a genuine Robolectric shadow-fidelity
  limit on newer configured API levels, not a production bug — saved in
  full in `verification/11.4/lab1_output.txt`. Unit 2 proved
  `remember(key1) { }`, a genuinely new, keyed `remember` overload
  (recomputes only when its real key changes, unlike the plain
  `remember { }` this project already had), via an isolated lab —
  `verification/11.4/lab2_output.txt`. Unit 3 shipped the real,
  permanent feature: `Graphing.kt` gained `crossedAxis`/`signFlipped`,
  small pure functions detecting a real sign flip in `GraphTransform`'s
  own accumulated pan; `MainActivity.kt`'s `GraphScreen` gained a real,
  keyed `remember(context)`-cached `Vibrator` and a shared
  `updateTransform` function both of this project's real input sources
  (touch and tilt) now call through, triggering a real, version-gated
  vibration (`VibrationEffect.createPredefined(EFFECT_TICK)` on API 26+,
  a real, deprecated `vibrate(20)` fallback below it) exactly on a real
  crossing. **Real, honest debugging finding**: the first version of the
  new integration test called `waitForIdle()` immediately before each
  `isVibrating` assertion and genuinely failed — Robolectric's own real
  `ShadowSystemVibrator` schedules a `Handler.postDelayed` reset
  runnable on every vibrate call, which a near-zero-duration predefined
  effect fires almost immediately once the main looper is drained,
  racing `waitForIdle()`; fixed by asserting immediately after
  `sendSensorEventToListeners` returns, since the real listener callback
  (and the real vibrate call inside it) already run synchronously. This
  project now has 104 real, passing tests (5 new: two real
  `crossedAxis` sign-flip cases, two real `crossedAxis` no-crossing
  cases, and `realAxisCrossingFromSensorTiltTriggersARealVibration` in
  `GraphScreenTest.kt`). **The known, pre-existing `AppNotIdleException`
  flake recurred twice this session, once more widely than in any prior
  lesson** (a first attempt hit 8 of 105 tests — one of them an
  accidentally-still-present throwaway lab file, cleaned up and
  reconfirmed clean in isolation; a second attempt, with the lab
  properly removed, hit 9 of 104 tests, this time including several of
  `GraphScreenTest`'s own pre-existing tests, though never this lesson's
  own new test) — resolved the established way, by retrying a third
  time: a clean run passed all 104 tests with zero failures, saved in
  full in `verification/11.4/step2_full_suite.txt`, alongside
  `verification/11.4/step1_production_tests.txt`'s own targeted, real
  confirmation. Real, verified via a full `./gradlew testDebugUnitTest
  assembleDebug`.

🟢 **Stage 11 ("Learning APIs From Documentation") shipped in full,
Lessons 11.1–11.4** — Slice 11 ("Tilt-to-Pan," expanded into a real,
hardware-enhanced graphing feature). The stage's own real, transferable
throughline: Lesson 11.1 built a documentation-reading checklist from
first principles, with no code of its own; Lesson 11.2 applied it once,
in a throwaway lab, to the real Sensor API; Lesson 11.3 turned that
proof into this project's own real, permanent tilt-to-pan feature, plus
this project's first real `CompositionLocal` beyond `LocalHapticFeedback`
(`LocalContext`); Lesson 11.4 applied the same checklist a second real
time, to the real, lower-level Vibrator API, and shipped a real,
physical click on every real axis crossing from either real input
source. `GraphScreen` now responds to touch, tilt, and gives real,
physical feedback — a real, hardware-enhanced feature no lesson before
Stage 11 could have built.

- **🟢 Stage 12 (Dependency Injection), Slice 12 (Multiple Calculation
  Engines) started — Lesson 12.1 (The Object Graph One Constructor
  Hides) shipped.** Purely diagnostic, matching the pattern already
  established by Lessons 4.2, 8.1, 9.1, 10.1, and 11.1 — no production
  code changed by the end of it. Two real Concept Units, both built on
  real, already-existing evidence sitting in this project's own code, not
  an invented scenario. (1) An isolated `kotlinc` lab
  (`Connection`/`Store`/`Service`, each printing from its own `init`
  block) proved, with a real, printed, leaf-first construction order,
  what an **object graph** is; applied directly to this project's own
  real `CalculatorViewModel.kt` (lines 15–22), showing its own real
  second constructor parameter already builds a three-level real object
  graph — `Room.databaseBuilder(...).build().calculationDao()` wrapped in
  `CalculationRepository(...)` — entirely inside one default parameter
  value. (2) A second isolated lab, extending the same
  `Connection`/`Store`/`Service` shape across three separate functions,
  proved real, forced **shotgun surgery**: a single, minimal constructor
  change (`Store` gaining a required `retryLimit: Int`) produced three
  real, simultaneous compile errors, one per independent call site;
  applied directly to this project's own real
  `CalculatorViewModelPersistenceTest.kt`, showing its own real
  `CalculatorViewModel(application, CalculationRepository(fakeDao))`
  construction line already appears three separate times (lines 30, 50,
  67), independently typed, one per `@Test` method — the identical real
  risk the lab's own break just proved. **Real, verified finding, not
  assumed**: `AndroidViewModel` was confirmed, via real `javap -p`
  against this project's own installed `lifecycle-viewmodel-2.6.2-api.jar`
  this session, to be a real, `public`, non-`abstract` class — catching
  and correcting a first-drafted claim that it was `abstract`, the exact
  kind of error this curriculum's own Verification Rule exists to catch.
  Also named, honestly, or without building anything yet: the same
  manual-construction cost is a real, near-certain future cost the moment
  any of this project's own already-shipped `ScientificFunctions.kt`,
  `Matrix.kt`, or `Evaluator.kt`/`Graphing.kt` calculation logic gets a
  `ViewModel`-style owner of its own. This project still has 104 real,
  passing tests — unchanged, since no production code was touched. Real,
  verified via two real, executed `kotlinc` lab runs plus one real,
  deliberately broken compile, all saved in full in `verification/12.1/`.
- **🟢 Lesson 12.2 (A Constructor That Only Receives) shipped —
  `CalculatorViewModel`'s constructor now only ever receives.**
  `@JvmOverloads` and `CalculationRepository`'s own default parameter
  value are both gone from `CalculatorViewModel`'s real constructor,
  which now has two plain, required parameters. A new, real, permanent
  `CalculatorViewModelFactory : ViewModelProvider.Factory` is the one,
  single, real place that now knows how to build the real object graph
  Lesson 12.1 proved was hiding inline — real `Room.databaseBuilder(...)`
  chain included. **Real, deliberate, not-assumed proof this wasn't
  free**: the bare constructor change was run for real, alone, before
  either real call site was fixed — `./gradlew testDebugUnitTest --tests
  CalculatorViewModelTest` produced a real, caught
  `java.lang.RuntimeException: Cannot create an instance of class
  CalculatorViewModel`, caused by a real `NoSuchMethodException`, tracing
  through `AndroidViewModelFactory`/`SavedStateViewModelFactory` — real,
  concrete proof of exactly why `@JvmOverloads` had been load-bearing.
  `CalculatorScreen`'s own real default parameter value now passes
  `factory = CalculatorViewModelFactory(LocalContext.current.applicationContext
  as Application)` explicitly; `CalculatorViewModelTest.kt`'s own real
  construction line now builds and passes that same factory explicitly
  too. This project still has 104 real, passing tests — unchanged, since
  no new permanent test was needed; the existing, now-fixed
  `CalculatorViewModelTest` is itself the real proof. Real, verified via
  a full, clean `./gradlew testDebugUnitTest assembleDebug` run (the
  already-documented `AppNotIdleException` flake in
  `GraphScreenTest`/`HapticsTest`/`ThemeTest` recurred on two attempts
  this session, confirmed unrelated — neither `CalculatorViewModelTest`
  nor the new, temporary `LabFactoryTest` were ever among the failures —
  before a genuinely clean save landed), all saved in full in
  `verification/12.2/`.
- **🟢 Lesson 12.3 (A Contract Instead of One Function) shipped — Slice
  12 (Multiple Calculation Engines) now more than half-shipped.**
  `CalculatorViewModel.onButtonClick` no longer calls `nextState` by
  name — it now reads `engine.compute(state, label)`, through a new,
  real, permanent `CalculationEngine` interface
  (`app/src/main/java/com/example/calculator/Calculator.kt`), with a new,
  real `BasicCalculationEngine` as its first, only implementation,
  wrapping this project's own existing, unchanged `nextState`.
  `CalculationRepository`, a concrete class since Stage 7, is now itself
  a real interface, with a new, real `RoomCalculationRepository` holding
  its own former body, unchanged. `CalculatorViewModel`'s own constructor
  gained a third real, required, constructor-injected parameter,
  `engine: CalculationEngine`; `CalculatorViewModelFactory` now builds
  both real, concrete implementations and is this project's own real,
  named **composition root** — the one, single, real place any concrete
  type is named at all. **Real, decisive, twice-repeated proof, not
  assumed**: an isolated `kotlinc` lab first proved a caller bound to a
  function by name breaks on rename while a caller bound only to an
  interface survives it (real, saved break + fix,
  `verification/12.3/lab1_interface_boundary.kt`,
  `break1_rename_breaks_named_caller.kt`,
  `lab2_rename_survives_interface_caller.kt`); the identical real
  experiment was then repeated against this project's own actual code —
  `nextState` temporarily renamed to `computeNextState`, `Calculator.kt`
  itself left with the one real, expected, isolated error
  (`Calculator.kt:112: Unresolved reference: nextState`) while
  `CalculatorViewModel.kt`/`MainActivity.kt` produced zero errors, real,
  direct proof neither depends on `nextState`'s own name anymore — then
  reverted. Two small, real test-file fixes complete the change:
  `CalculatorViewModelPersistenceTest.kt`'s three real construction lines
  now build `RoomCalculationRepository`/`BasicCalculationEngine`
  explicitly; `CalculationRepositoryTest.kt`'s own construction line does
  the same, its own declared field type needing zero change at all —
  real, concrete proof a caller depending on the interface never has to
  know which real implementation it holds. This project still has 104
  real, passing tests. Real, verified via a full, clean `./gradlew
  testDebugUnitTest assembleDebug` run (`104/104`, `0` failures, a real
  installable `.apk`), all saved in full in `verification/12.3/`.

| Lesson | Title | Status |
|---|---|---|
| 0.1 | The Shape of a Running Program | complete |
| 0.2 | Naming a Piece of Work | complete |
| 0.3 | Choosing What Runs | complete |
| 0.4 | Holding Many Values at Once | complete |
| 0.5 | The Value That Might Not Be There | complete |
| 0.6 | A Blueprint and Its Real Things | complete |
| 0.7 | One Shape, Many Behaviors | complete |
| 0.8 | A Fixed Set of Choices and a Record of What Happened | complete |
| 0.9 | Functions as Values | complete |
| 0.10 | Reading Kotlin the Way Kotlin Is Actually Written | complete |
| 1.1 | How an Android Project Actually Fits Together | complete |
| 1.2 | Describing a Screen Instead of Building It | complete |
| 1.3 | Sharing Space Instead of Fixing It | complete |
| 1.4 | A Value That Survives Its Own Rebuild | complete |
| 1.5 | Handing Behavior to Someone Else to Call | complete |
| 1.6 | Where the Screen Ends and the Math Begins | complete |
| 2.1 | A Function That Owns Nothing But Its Answer | complete |
| 2.2 | Checking a Claim Instead of Reading the Code | complete |
| 2.3 | Writing the Failure Before the Fix | complete |
| 2.4 | One Call, Five Behaviors | complete |
| 2.5 | A Failure the Compiler Allows | complete |
| 3.1 | Defined Once, Read Everywhere | complete |
| 3.2 | A Button Written Once | complete |
| 3.3 | A Shape the Compiler Won't Let You Forget | complete |
| 3.4 | A Color That Doesn't Jump | complete |
| 3.5 | Built for a User You'll Never Meet | complete |
| 3.6 | A Response You Can Feel | complete |
| 4.1 | Screens That Remember How You Got There | complete |
| 4.2 | Why Architecture Exists | complete |
| 4.3 | An Owner That Outlives the Screen | complete |
| 4.4 | Code That Doesn't Know It's Android | complete |
| 4.5 | Two One-Way Streets | complete |
| 5.1 | One Slot, Two Operators | complete |
| 5.2 | What More Data Actually Costs | complete |
| 5.3 | What Opened Last Closes First | complete |
| 5.4 | Nine Real Pieces | complete |
| 5.5 | What Came First Goes First | complete |
| 5.6 | The Operator That Finally Gets to Wait | complete |
| 5.7 | Reading the Same Tree Two Ways | complete |
| 5.8 | The Deepest Call Returns First | complete |
| 5.9 | The Tree That Finally Stayed | complete |
| 5.10 | The Answer Is Negative Twenty-Seven | complete |
| 5.11 | The Parenthesis That Was Never Checked | complete |
| 6.1 | A Function That Only Needs One Number | complete |
| 6.2 | A Number That Doesn't Know What It Means | complete |
| 6.3 | Functions That Know Their Own Limits | complete |
| 6.4 | Close Enough to Call Equal | complete |
| 7.1 | What Already Happened Doesn't Change | complete |
| 7.2 | Gone the Moment the Process Is | complete |
| 7.3 | An Address on Disk | complete |
| 7.4 | Nothing Outside Needs to Know | complete |
| 7.5 | Waiting Without Blocking | complete |
| 7.6 | A Question That Keeps Answering | complete |
| 8.1 | Rows That Don't Have to Match | complete |
| 8.2 | The Grid That Checks Itself | complete |
| 8.3 | Eight Times Instead of Four | complete |
| 8.4 | Choosing the Math After the Fact | complete |
| 8.5 | A Name Instead of Twenty-Five Numbers | complete |
| 8.6 | The Class That Doesn't Know Its Own Numbers | complete |
| 8.7 | True for Every Matrix, Not Just One | complete |
| 9.1 | Where Up Stopped Being Positive | complete |
| 9.2 | The Same Expression, Many Answers | complete |
| 9.3 | What the Canvas Won't Show You | complete |
| 9.4 | What the Fingers Can Prove | complete |
| 9.5 | Fast Enough Is a Real Number | complete |
| 10.1 | The Queue Every Tap Waits In | complete |
| 10.2 | Off the Main Thread, Still Tied to the Screen | complete |
| 10.3 | The Old Answer Never Gets to Land | complete |
| 10.4 | Free to Answer While It's Still Thinking | complete |
| 11.1 | The Contract Before the Code | complete |
| 11.2 | A Window Meant to Close | complete |
| 11.3 | The Phone Itself as Input | complete |
| 11.4 | A Tick at the Line You Just Crossed | complete |
| 12.1 | The Object Graph One Constructor Hides | complete |
| 12.2 | A Constructor That Only Receives | complete |
| 12.3 | A Contract Instead of One Function | complete |

**🟢 Slice 0 (Console Calculator) shipped**, per Lesson 0.10's own
Closing. `Calculator.kt`'s final Slice-0 state: a `fun interface
Operation` implemented by `Addition`/`Subtraction`/`Multiplication`/
`Division`; `Calculator(var displayValue: Int)` with one `perform`
method; `enum class Operator` carrying its own `Operation` per
constant; `data class Calculation` with an `describe()` extension
function; `main` built with `apply`/`let`/`also`. Real final output:
`Calculator initialized with displayValue = 6` /
`Recorded: 6 PLUS 0 = 6`.

**Stage 1, Lesson 1.1 complete.** A real, ongoing Android Gradle
project now exists at
`src/docs/projects/android_kotlin/AndroidCalculator/` — separate from
`Calculator.kt`, per the BRD's own Stage 1 framing ("The First Android
Calculator"). Real, verified via an actual `./gradlew :app:assembleDebug`
build (`BUILD SUCCESSFUL`, real `.apk` produced, inspected with real
`aapt2` output): `settings.gradle.kts`, root `build.gradle.kts`,
`app/build.gradle.kts` (namespace `com.example.calculator`, compileSdk/
minSdk/targetSdk 34/24/34, JVM target 17 — see the "Standing decisions"
note below on why 17 was needed), `app/src/main/AndroidManifest.xml`,
and `app/src/main/java/com/example/calculator/MainActivity.kt`
(extends `android.app.Activity`, overrides `onCreate`). Gradle wrapper
committed (`./gradlew`, pinned to Gradle 8.7) so the project builds
reproducibly without depending on whatever Gradle happens to be
installed system-wide.
**Real finding worth knowing for later lessons:** overriding
`Activity.onCreate` is optional, not compiler-required (confirmed by
actually compiling a second `Activity` subclass with zero overrides —
real exit code 0) — a genuine, verified contrast with Lesson 0.7's own
proof that implementing an interface's method *is* compiler-required.
Caught and fixed a real factual error in this lesson's own first draft
that had claimed the opposite; corrected before finalizing.

Stages 1–9 now shipped in full, per the Progress table above; Stages
10–16 not yet started — see `brd.md` for the full map.

**Stage 1 tooling: resolved.** The blocker below was hit, the user
was unreachable to decide between options (push notification didn't
land), and explicitly said to make the call myself, in whatever way
produces the best lesson series for them as the learner — see the
"Autonomous judgment calls" note under Methodology, below, which is now
a standing instruction, not a one-off. The call made: install real
Android SDK tooling rather than downgrade Stage 1+ to unverified
claims, since verified-real-output is this curriculum's whole
differentiator and Stages 1–16 are ~90% of it.

- **Installed and confirmed working:** Android SDK command-line tools,
  platform-tools, `platforms;android-34` (real `android.jar`),
  `build-tools;34.0.0` (all via `brew install --cask
  android-commandlinetools` + `sdkmanager`, `ANDROID_HOME=
  /opt/homebrew/share/android-commandlinetools`), and Gradle 9.7.1
  (`brew install gradle`). Verified for real this session: compiled a
  Kotlin `Activity` subclass (`onCreate`, `Bundle`, `TextView`) against
  the genuine `android.jar` with `kotlinc -classpath
  "$ANDROID_HOME/platforms/android-34/android.jar" ...`, exit 0, and
  inspected the real generated class with `javap`. This means Stage 1+
  lessons can get the same real-compiler-error / real-generated-code
  proof Stage 0 used, for anything that only needs to *compile*
  correctly (project structure, Activities, Views, most Compose
  composable declarations, layouts).
- **Not available: a working emulator or physical device.** This
  machine's disk was 95% full (11GB free; a minimal AVD needs 12GB+
  contiguous for its userdata partition) — confirmed by actually
  creating an AVD and trying to boot it (`emulator -avd calc_test
  -no-window ...`), which failed with a real, specific error
  ("Not enough space to create userdata partition"). Rather than leave
  a non-functional 5GB+ emulator + system-image sitting on an
  already-tight real disk, both were removed after the failure (disk
  is back to 17GB free). `adb` also showed one already-`unauthorized`
  device (serial `ZY22KN6L89`) of unknown origin — not reachable from
  this sandbox (no matching USB device found via `system_profiler`),
  not investigated further since it would need physical
  authorization on a real screen regardless.
- **Practical consequence for lesson-writing — updated as of Lesson 1.4,
  materially better than originally assessed here.** Robolectric-based
  Compose UI testing (see the standing decision above) closes most of the
  original gap this note used to describe: click dispatch, state changes,
  recomposition, and semantics-tree-level UI structure can all be
  verified for real, on the JVM, no emulator needed — proven concretely
  by Lesson 1.4's own real, passing tests. What genuinely remains
  unverifiable in this environment: actual drawn pixels/GPU rendering,
  real animation timing, true multi-touch gesture recognition, and
  sensor input (relevant to later Stage 1 polish and Stages 9–11). For
  *those* specific claims only, apply the schema's own Verification Rule
  Necessity exemption honestly: state predicted output/shape where
  genuinely confident from well-documented, stable framework behavior,
  say plainly it's stated from confidence not executed, never dress up a
  prediction as a real run. Everything that only needs to *compile* —
  still gets the full real-verification treatment via `kotlinc`/`javap`
  against the real SDK, exactly like Stage 0; everything about *behavior*
  that Robolectric can simulate now gets real, executed test proof
  instead of a predicted description — check whether Robolectric covers
  a given claim before reaching for the exemption.
- If disk space frees up later and an emulator becomes worth
  revisiting (e.g. once a lesson genuinely needs it), the system image
  package name is `system-images;android-34;google_apis;arm64-v8a` —
  reinstall via `sdkmanager` rather than reasoning from memory of this
  note, since availability can change.

## Outstanding forward-reference promises (must be fulfilled, under these exact names)

Per the schema's "every Lesson N forward-reference is a promise" rule —
track these until each is actually delivered:

- ~~`Matrix.Inverse`, real, decisively investigated and honestly
  deferred, Lesson 8.4~~ — **fulfilled** by Lesson 8.6: `Matrix` itself
  rewritten as a real, generic `Matrix<T>` (shape/validation/`get`/
  `transpose` all type-agnostic), `add`/`subtract`/`multiply`/
  `determinant` relocated to real extension functions scoped to
  `Matrix<Int>` specifically (a real, necessary move — an unconstrained
  `T` genuinely has no `plus`/`minus`/`times`, confirmed by a real,
  259-line negative-case compile trying every `plus` overload in scope),
  and a real, permanent `Matrix<Double>.inverse()` extension function,
  computing the exact real `2×2` formula Lesson 8.4's own lab first
  proved correct — this time on genuine `Double` cells, with a real
  `require(det != 0.0)` guard against a singular matrix. Three new real
  tests in `MatrixTest.kt` confirm it.
- ~~Lesson 0.9 (Lambdas) must cover `list.map { ... }` and
  `list.filter { ... }` for real~~ — **fulfilled** by Lesson 0.9:
  `numbers.map { n -> n * 2 }` and `numbers.filter { n -> n > 3 }`,
  both real, verified, with real stdlib source quoted for both. (Note:
  this also introduced `>`/`Int.compareTo` with its first full
  treatment anywhere in this curriculum — Lesson 0.3 listed "Comparison
  operators," plural, as a concept but only ever fully implemented
  `==`; `>` never got its own treatment until 0.9 needed it for a
  `filter` predicate. Not a broken promise — 0.3 never named `>`
  specifically — but worth knowing if a future session wonders why `>`
  wasn't covered earlier.)
- **Lesson 0.9 also retrofitted `Operation` to `fun interface`**
  (SAM conversion) as a real project change, beyond what its own BRD
  concept list strictly required — motivated by "Transfer: critical for
  idiomatic Kotlin and Compose." `Addition`/`Subtraction`/
  `Multiplication`/`Division` were deliberately left as named classes,
  not rewritten as lambdas (Lesson 0.9's own SE Lens states why:
  permanent names remain valuable once Stage 6 adds many more
  operations) — a design call worth knowing about if Stage 6 revisits
  this.
- ~~A lesson covering `Map`'s key-lookup operator (`somemap[key]`, which
  returns a nullable `V?`) is still owed~~ — **fulfilled** by Lesson 1.6:
  `operatorSymbols: Map<String, Operator>`, with real `label in
  operatorSymbols` (membership check) and real `operatorSymbols[label]`
  (key lookup, real declared type `Operator?`), both real, compiled,
  tested project code — not an isolated lab.
- **A later lesson should revisit `Calculator.kt`'s single shared `?:
  0` fallback** for all four operators — Lesson 0.5's own SE Lens
  flagged `0` as correct for `add`/`subtract` but wrong for
  `multiply`/`divide` (should be `1`), left as a deliberate,
  acknowledged gap rather than fixed on the spot. **Note as of Lesson
  1.6**: the real, shipped Android app's own operand-handling design
  (`firstOperand`/`pendingOperator`, smart-cast checked) is a genuinely
  different shape than the original console app's `?: 0` fallback
  pattern — it never defaults a missing operand to `0` at all, it simply
  does nothing until both a real operator and a real first operand
  exist. This specific promise is about the *original* console-app
  design, not the shipped Android app; still worth closing if a later
  lesson revisits the console calculator's own code directly.
- ~~`divide`'s unhandled `0` divisor (Lesson 0.2), explicitly deferred to
  Stage 2 ("Errors")~~ — **fulfilled** by Lesson 2.5: the real crash was
  verified first (a real Robolectric test against the actual, unmodified
  `CalculatorScreen` failed with a genuine, captured
  `ArithmeticException`), a custom domain exception type was investigated
  and deliberately rejected, and `CalculatorScreen`'s own `=` branch now
  catches `ArithmeticException` via `try` as a Kotlin expression, showing
  `"Error"` instead of crashing — with a second real fix so typing a digit
  afterward starts fresh instead of appending onto the word. The original
  console-calculator logic's own copy
  (`verification/0.10/step4_also_calculation.kt`) is untouched and not
  part of the shipped app — this promise was always about the one real,
  running app, which is now fixed.
- ~~Lesson 0.7 (Interfaces & Polymorphism) must give `Calculator`'s
  four operations one common shape, through an interface~~ — **fulfilled**
  by Lesson 0.7: `Operation` interface, `Addition`/`Subtraction`/
  `Multiplication`/`Division` implementing it, `Calculator.perform`
  calling through it polymorphically, `Calculator`'s own four original
  methods removed.
- ~~Lesson 0.8 (Data Classes & Enums) must give `Calculator`'s own data
  a cleaner, more idiomatic shape~~ — **fulfilled** by Lesson 0.8:
  `operatorSymbol` became `enum class Operator(val operation:
  Operation)` (each constant carrying its own `Operation`, eliminating
  the old `when`-based lookup entirely), and a new `data class
  Calculation(operator, operandA, operandB, result)` now records every
  completed calculation, with real, verified structural equality and
  `copy()` (both proven with real `javap` output showing the actual
  compiler-generated members).
- ~~`copy()`'s "stale result" gap~~ — **fulfilled** by Lesson 7.1: Lesson
  0.8's own SE Lens flagged that `calculation.copy(operandB = 4)` does
  not recompute `result` (a generated `copy()` has no concept of a
  relationship between properties); left as a deliberate, acknowledged
  limitation at the time, not fixed on the spot, since the original
  console-app `Calculation`/`describe()` were deliberately never ported
  into the real Android app and had no live home to fix. Lesson 7.1
  reintroduced `Calculation` for real, this time for the app's own real
  calculation-history feature — the exact trigger this promise's own
  entry named — and resolved the gap not by making `copy()` smarter (it
  can't be, generically) but by real, executed, concrete proof of why
  `.copy()` must never be called on one: a real, isolated lab showed
  `LabCalculation("+", 2, 2, 4).copy(operandB = 100)` producing a real,
  internally inconsistent record (`operandB=100, result=4`), establishing
  the standing rule this project's own real `Calculation` now follows —
  created once, fully formed, never modified again.
- ~~Lesson 0.10 (Idiomatic Kotlin) must review and tighten
  `Calculator.kt`'s idioms before Slice 0 ships~~ — **fulfilled** by
  Lesson 0.10: `Calculation.describe()` (extension function + string
  templates), `Calculator(6).apply { ... }`, `operandB?.let { ... }`,
  `Calculation(...).also { ... }` all real, verified project changes;
  `run` covered in isolation only (deliberately — didn't fit
  `Calculator.kt`'s own real code, same judgment call Lesson 0.7 made
  for `!!`). Slice 0 marked shipped in the Progress section above.
- ~~Lesson 1.2 (Jetpack Compose) must give `MainActivity` "its first real,
  visible UI, through Jetpack Compose"~~ — **fulfilled** by Lesson 1.2:
  `MainActivity` now extends `ComponentActivity` and calls
  `setContent { CalculatorScreen() }`; `CalculatorScreen` is a real
  `@Composable` function building a `Column` (sized/padded by a real
  `Modifier` chain) holding a display `Text` and a `Row` of two `Button`s,
  each labeled with `Text`. Real, verified via a full
  `./gradlew :app:assembleDebug`.
- ~~Lesson 1.3 (Layout) must turn Lesson 1.2's two-button `Row` into a
  real calculator keypad~~ — **fulfilled** by Lesson 1.3: a real,
  complete, data-driven 4×4 keypad (see the standing decision above),
  covering `Arrangement`, `Alignment`, `Weight`, `Spacing`, and
  Responsive UI, all real and verified.
- ~~Lesson 1.5 (Events) must replace all sixteen of `CalculatorScreen`'s
  `onClick = {}` no-op lambdas with real behavior~~ — **fulfilled in
  full** by Lessons 1.4–1.6: all sixteen buttons (ten digits, `C`, four
  operators, `=`) now have real, tested `onClick` logic — see the Lesson
  1.6 standing decision above for the final five.
- **A later lesson should confirm whether `Modifier` chain *order*
  actually changes a visible result** — still open; neither Lesson 1.2
  nor Lesson 1.3's own chains (`fillMaxWidth().padding(...)`) demonstrate
  a case where reordering visibly differs. No specific future lesson is
  committed to closing this, flag it if a later lesson's own design would
  naturally show the contrast.
- ~~Recomposition, named but not exercised in Lesson 1.2, is still owed a
  real, working example~~ — **fulfilled** by Lesson 1.4: a real,
  executed, passing Robolectric test clicked real buttons and observed
  real recomposition-driven display updates (`"0"` → `"7"` → `"78"`), plus
  a real negative-case test proving `remember`'s necessity.
- **Lesson 1.3's own honest, unverified assumption** (Concept Unit 6's SE
  Lens): `weight`'s documented behavior is trusted to produce a *usable*
  keypad (buttons large enough to tap accurately) across real screen
  widths, but nothing in this environment (no working emulator/device)
  can verify that beyond the compiler accepting the code. Not a specific
  lesson's promise to close — flag it if disk space ever frees up enough
  for a real emulator (see the Stage 1 tooling note below) and this
  becomes checkable for real.
- **`HomeScreen`'s own real button, deliberately singular for now
  (Lesson 4.1)** — only `"Basic Calculator"` exists, since Basic is the
  only real mode this project has. Real, BRD-confirmed future
  integration points, not speculative: Stage 5/6 gives this app a real
  Scientific mode (an expression parser and scientific functions), and
  Stage 8 gives it a real Matrix mode — each is the trigger for its own
  real `HomeScreen` button and its own `"calculator/{mode}"`-style route
  (or a dedicated route of its own, a live design choice for whichever
  lesson actually adds it), not before either stage gives that mode real
  functionality. **Update as of Lesson 6.4**: Slice 5's parser and
  Slice 6's scientific functions are both now real and fully shipped —
  `ShuntingYard`/`AST`/`Evaluator`/`ScientificFunctions.kt` all exist,
  tested, and correct — but this is honestly *not* the same as "this
  mode gives a real user real functionality" yet: nothing in this
  project's own UI lets a user actually reach a Scientific keypad, type
  an expression with a `sin`/`sqrt` button, or see a result from any of
  this engine. The real trigger condition for a second `HomeScreen`
  button and its own route is still unmet — it needs a real Scientific-
  mode screen/route (matching the already-standing `HomeScreen`
  design), not just the engine underneath one; flagged here so a future
  session doesn't mistake "the math works" for "the mode exists."
  **Update as of Lesson 8.7**: the identical gap now applies to Matrix
  mode too — Slice 8 shipped a real, complete, fully-tested `Matrix<T>`
  (constructor validation, `add`/`subtract`/`multiply`/`transpose`/
  `determinant`/`inverse`, all real and permanent), but nothing in this
  project's own UI lets a user reach a Matrix keypad, enter a matrix, or
  see any of this engine's own real output — the same real trigger
  condition (a Matrix-mode screen/route, not just the engine) is still
  unmet, same honest reasoning as the Scientific-mode note above.
- **Real, intermittent full-suite test flakiness, discovered during
  Lesson 4.5** — `HapticsTest.pressingKeypadButtonTriggersHapticFeedback`
  and `ThemeTest.calculatorThemeProvidesRealCustomPrimaryColor` failed
  with a real `AppNotIdleException` in two of three consecutive, real,
  forced (`--rerun-tasks`) full-suite runs, always the same two tests,
  always at the first `setContent` call. Not a specific lesson's promise
  to close — neither test builds an `ActivityController`, so this is a
  different root cause than Lesson 4.3's own already-fixed teardown gap;
  flag it for real investigation the moment it recurs, or the moment a
  future lesson touches `HapticsTest`, `ThemeTest`, or any animation-
  related test setup. Real transcripts saved at
  `verification/4.5/incidental_finding_full_suite_flakiness.txt`.
- **🟢 Stage 5 (DSA Through the Scientific Calculator), Slice 5
  (Expression Parser) started — Lesson 5.1 (One Slot, Two Operators)
  shipped, purely diagnostic, no production code changes.** This
  project's own `Calculator.kt`/`Calculator.kt`'s `nextState`/
  `CalculatorState` are still completely untouched by this lesson —
  its own real job was proving, with real, executed evidence, exactly
  why this calculator's current one-`pendingOperator`/one-`firstOperand`
  design cannot correctly evaluate an expression with more than one
  operator, and introducing this slice's own starting vocabulary:
  tokens, grammar, operator precedence, and associativity. **Real,
  decisive evidence, gathered this session**: a verbatim, standalone
  copy of this project's own real `Calculator.kt` (confirmed, again,
  to need zero Android/Compose imports, the same real fact Lesson 4.4
  already proved), compiled via plain `kotlinc` with one temporary,
  non-permanent `main` added, driving the real, unmodified `nextState`
  through the real button sequence `3, +, 5, ×, 2, =` — real, executed
  output: `10`. Not the naive left-to-right answer (`16`) and not the
  correct, precedence-respecting answer (`13`) — a *third*, genuinely
  wrong answer, because `CalculatorState.copy(firstOperand = ...,
  pendingOperator = ...)` inside `nextState`'s own operator-symbol
  branch unconditionally overwrites both fields the moment a second
  operator arrives, silently discarding the first operand and operator
  entirely rather than either chaining them (real four-function
  calculator behavior) or deferring them correctly by precedence. Four
  real, isolated, executed throwaway labs proved the rest, each
  discarded immediately after: a hand-written `tokenize` function
  (`"12+7"` → real, executed output `["12", "+", "7"]`); a hand-written
  `isValidSimpleExpression` grammar check (real, executed output
  `true`/`false`/`false` across three real inputs); a `precedence =
  mapOf("+" to 1, "-" to 1, "×" to 2, "÷" to 2)` table proving precedence
  is just data (real, executed output `true` for `timesPrecedence >
  plusPrecedence`); and a real, computed contrast, `(8 - 3) - 2` versus
  `8 - (3 - 2)`, proving associativity changes the actual answer (real,
  executed output `left: 3, right: 7`). **Real, worth-knowing finding**:
  `Set`/`setOf` is this curriculum's own first appearance of that
  collection type — Lesson 0.4's own concept list covered `List`/
  `MutableList`/`Map` but never `Set`, confirmed by this session's own
  Vocabulary Extraction Rule pass, not assumed. All five real `.kt`
  files (four labs, one real-project probe) were compiled together in
  one real, batched `kotlinc` pass producing one real, executable
  `.jar`, per the Verification Rule's own batching requirement, then
  each run separately and its real output saved; every code block shown
  in the lesson file was diff-checked, this session, byte-for-byte
  against its own real, saved verification source, and every shown
  output block was diff-checked against its own real, saved transcript.
  This project still has 27 real, passing tests — unchanged, since no
  production code was touched.
- **🟢 Lesson 5.2 (What More Data Actually Costs) shipped — purely
  diagnostic, no production code changes.** Real, executed proof of all
  five BRD-listed Big-O growth rates (O(1), O(n), O(n²), O(log n),
  O(n log n)), grounded wherever a genuine real-project connection
  existed rather than invented wholesale. **Real, decisive evidence,
  gathered this session**: a real, counted linear-search lab proved
  O(n) exactly — comparisons equal to list size, every time, for sizes
  `10`/`100`/`1,000`/`10,000`; a real, twice-repeated (forward and
  reversed size order), wall-clock-timed `Map`-lookup lab proved O(1) —
  no meaningful slowdown for a map 100,000× larger, with the real
  ordering experiment also catching and correctly attributing a real
  JVM JIT-warmup confound (whichever size ran *first* measured
  slowest, regardless of whether that size was 10 or 1,000,000) rather
  than misreading it as a genuine size effect. **The real, most
  significant finding**: `nextState`'s own real, permanent digit
  branch (`current.display.textOrZero()` then `currentText + label`),
  quoted verbatim and instrumented in an isolated lab, has real,
  measured O(n²) cost across a full number typed one digit at a time —
  `15`/`55`/`210`/`820` total characters copied for `5`/`10`/`20`/`40`
  digits, a real `~4×` cost increase per doubling — a genuine,
  previously-unmeasured fact about code shipping since Lesson 1.6,
  deliberately **not** fixed (`StringBuilder` investigated and rejected
  in the SE Lens as real, premature optimization at this project's own
  real display-length scale). A real, minimal `while`-loop demo (this
  curriculum's own first appearance of `while` — confirmed absent from
  both Lesson 0.3's and 0.4's own BRD concept lists) preceded a real,
  counted binary-search lab (O(log n) — `3`/`6`/`9`/`13` comparisons for
  the same four sizes linear search needed `10`/`100`/`1,000`/`10,000`
  for) and a real, `Comparator`-instrumented `sortedWith` lab on
  shuffled data (O(n log n) — `21`/`538`/`8,705`/`120,443` comparisons,
  landing within a few percent of predicted `n·log₂n` scaling). This
  project still has 27 real, passing tests — unchanged, since no
  production code was touched.
- **Major methodology finding, this session — two real errors caught
  only by systematic, automated diff-checking, not by care while
  writing.** Lesson 5.2's own first-saved draft contained two real,
  would-have-shipped defects: (1) a fabricated `Map`-lookup output value
  (`found=10000000000000` for one size, dressed up with an invented,
  plausible-sounding but factually wrong explanation — "`Int` overflow
  in a tight loop" — when the real, saved transcript for that exact run
  showed `found=100000` for every size, with no anomaly at all); (2) a
  small `while`-loop demonstration whose output (`steps: 7, remaining:
  1`) was never actually compiled and run at all — written from a
  hand-traced prediction that was itself arithmetically wrong (the real,
  executed answer is `steps: 6`). Both were caught only by writing a
  script that programmatically extracts every fenced code block and
  every fenced output block from the finished lesson file and diffs
  each one, byte-for-byte, against its own real, saved verification
  source/transcript — neither error was visible on a careful read-through,
  since both read as perfectly plausible, well-explained real output.
  **Standing rule, now confirmed necessary rather than merely good
  practice**: run this byte-for-byte diff — every shown code block
  against its real saved `.kt` source, every shown output block against
  its real saved `_run.txt` transcript — as a mandatory, automated step
  on every future lesson before considering it shipped, not a
  nice-to-have; this session's own Lesson 5.1 first suggested doing
  this, and Lesson 5.2 is the real, concrete case where skipping it
  would have shipped two fabricated facts.
- **🟢 Lesson 5.3 (What Opened Last Closes First) shipped — purely
  diagnostic, no production code changes.** Real, executed proof of
  Stack/LIFO/push/pop/peek via a hand-written, non-generic `class Stack`
  (deliberately not written as `class Stack<T>` — this curriculum's own
  Generics lesson is explicit BRD Stage 8 territory, not front-run here),
  built twice: once over `String` for a real, executed browser-history
  simulation (three real pushes, two real pops, real output confirming
  LIFO order exactly), and once over `Char` for a real, executed
  balanced-parentheses checker — run against four real inputs including
  this slice's own actual target expression, `3 + 5 × (2 − 8)`
  (correctly balanced), two genuinely invalid expressions (one missing a
  close, one with a close and nothing open — both correctly rejected),
  and one real nested-and-sequential expression (correctly balanced,
  specifically because LIFO order closes the *inner* parenthesis before
  the *outer* one). **Real, worth-knowing finding**: compiling both
  labs together in one shared `kotlinc` pass, the way this slice's own
  first two lessons batched every file, produced a real
  `redeclaration: class Stack` compile error — both labs deliberately
  declare the identically-named class, since "Stack" is the one word
  this whole lesson is actually teaching — resolved by compiling each
  lab in its own separate `kotlinc` invocation instead, per the
  Verification Rule's own explicit "colliding names" batching
  exception. This project still has 27 real, passing tests — unchanged,
  since no production code was touched.
- **🟢 `AndroidCalculator` now has a real, permanent tokenizer — Lesson
  5.4 (Nine Real Pieces).** A new file, `app/src/main/java/com/example/
  calculator/Tokenizer.kt`: `fun tokenize(expression: String):
  List<String>`, the identical, already-proven digit-accumulate-and-
  split mechanism from this slice's own opening lesson, now real and
  permanent, needing zero changes to correctly handle this project's own
  real operator symbols and, for the first time, real parentheses — both
  fall out of the same "any non-digit character is its own token" rule
  that already handled `+`/`−`/`×`/`÷`. Deliberately placed in its own
  new file rather than inside `Calculator.kt`: tokenizing a whole,
  pre-existing string is a genuinely different responsibility from
  `nextState`'s own job of reacting to one button press against existing
  state — the same real Cohesion argument this project already proved
  for itself in Lesson 4.2. **Real, deliberate scope limit, recorded**: a
  richer `sealed class Token` hierarchy (distinguishing number/operator/
  paren cases) was considered and explicitly not built — nothing in this
  project has yet shown a bare `List<String>` causing a real problem,
  so a typed hierarchy would be solving a hypothetical, not a present,
  issue; flagged as a live design question for whichever later lesson
  (Shunting-Yard or AST construction, most likely) first hits a concrete
  reason it isn't enough. A new, permanent test file,
  `TokenizerTest.kt`, holds two real tests:
  `tokenizingTheProjectsOwnTargetExpressionSplitsEveryRealSymbol`
  (asserting the real, executed nine-token result for this slice's own
  actual target expression, `"3+5×(2−8)"` → `["3", "+", "5", "×", "(",
  "2", "−", "8", ")"]`) and `tokenizingKeepsMultiDigitNumbersAsOneToken`.
  **`tokenize` has no real caller yet** — deliberately, honestly the
  same shape this project's own domain logic (`Operation`/`Calculator`)
  had for its first ten real lessons, before Stage 1 gave it a screen.
  This project now has 29 real, passing tests. **Real, honest finding,
  reinforcing an already-open one**: the pre-existing, already-documented
  intermittent `HapticsTest`/`ThemeTest` flake (first found in Lesson
  4.5) recurred twice more this session, unprompted, on two separate
  real, forced (`--rerun-tasks`) full-suite runs — neither failure
  involves `Tokenizer.kt` or `TokenizerTest.kt` in any way, confirmed by
  running `TokenizerTest` alone (real, clean `BUILD SUCCESSFUL`) and by
  a later full-suite run that also came back fully clean. Real,
  ultimately verified via a full, clean, saved
  `./gradlew testDebugUnitTest assembleDebug --rerun-tasks` run
  (`BUILD SUCCESSFUL`, all 43 tasks, all 29 tests).
- **Methodology finding, this session — a real gap the mandatory
  diff-check caught, distinct from Lesson 5.2's own two.** Lesson 5.4's
  own first-saved draft claimed a specific real transcript
  ("BUILD SUCCESSFUL in 7s... 43 actionable tasks: 43 executed") that
  had genuinely happened, once, in this session's own real terminal
  output — but had never actually been piped to a saved file, only
  observed in passing before a later, different real command overwrote
  the same terminal output. This is a different failure shape than
  Lesson 5.2's two (an outright fabricated value; a never-executed
  prediction) — here the claimed fact *was* real and *had* genuinely
  happened, just not properly persisted per the Verification Rule's own
  Persistence requirement ("real pasted output, not reconstructed
  afterward"). Caught by the same mandatory code/output diff-check,
  which flagged the block as having no matching saved file to diff
  against — fixed by re-running the exact same real command until the
  identical real result recurred and was properly saved this time.
  **Standing lesson**: "I definitely saw this happen for real a moment
  ago" is not the same as "this is saved and diffable" — every claimed
  real transcript needs its own actual saved file, checked by the
  diff script, not trusted from a moment-old memory of the terminal.
- **🟢 Lesson 5.5 (What Came First Goes First) shipped — purely
  diagnostic, no production code changes.** Real, executed proof of
  Queue/FIFO/enqueue/dequeue via a hand-written, non-generic
  `class Queue` (same deliberate non-generic design call as this
  slice's own `Stack`, for the identical reason — Generics stays Stage
  8 territory), built first over `String` for a real, executed
  print-job-queue simulation (three real enqueues, three real dequeues,
  real output confirming FIFO order exactly opposite this slice's own
  already-proven LIFO), then reused, over `Int`, for the lesson's own
  real, decisive proof: this project's own real digit tokens from its
  real target expression — `[3, 5, 2, 8]`, exactly what `tokenize`
  already proved exists inside `"3+5×(2−8)"` in real reading order —
  fed through a fresh `Queue` came back unchanged, `[3, 5, 2, 8]`; fed
  through a fresh `Stack` (rebuilt identically to this slice's own real
  one), came back reversed, `[8, 2, 5, 3]`. **Real, concrete conclusion,
  now proven rather than asserted**: this slice's coming Shunting-Yard
  work needs a Stack for tracking pending operators and a genuinely
  different structure, a Queue, for preserving the real order results
  are produced in — reusing the Stack for both jobs would produce a
  real, wrong evaluation order, not just an inelegant design. This
  project still has 29 real, passing tests — unchanged, since no
  production code was touched.
- **🟢 `AndroidCalculator` now has a real, permanent, working
  infix-to-postfix converter — Lesson 5.6 (The Operator That Finally
  Gets to Wait), the biggest single-lesson assembly this slice has done
  so far.** Two new files: `app/src/main/java/com/example/calculator/
  Stack.kt` (this slice's own real Stack, made permanent for the first
  time — identical shape already proven in Lesson 5.3) and
  `app/src/main/java/com/example/calculator/ShuntingYard.kt`, holding a
  new, real, permanent `val precedence: Map<String, Int>` (deliberately
  kept separate from `operatorSymbols`/`Operator` — a real Cohesion
  call, recorded: precedence is a parsing-only concern Basic mode has
  never needed and still doesn't) and `fun toPostfix(tokens:
  List<String>): List<String>`, a real, from-scratch implementation of
  Dijkstra's Shunting-Yard algorithm. **Real, decisive evidence,
  gathered this session, closing the exact gap Lesson 5.1's own real
  probe proved**: a new, permanent test,
  `precedenceCorrectlyReordersMultiplicationBeforeAddition`, converts
  `tokenize("3+5×2")`'s own real tokens to postfix `["3", "5", "2",
  "×", "+"]` — which, evaluated by hand, is `5×2=10` then `3+10=13`,
  the exact correct answer `nextState` has never been able to produce
  (it real, verifiably gives `10`, per Lesson 5.1's own probe). A
  second new test, `samePrecedenceOperatorsGroupLeftAssociatively`,
  converts `tokenize("8−3−2")` to `["8", "3", "−", "2", "−"]`, which
  evaluates to `3`, matching `(8−3)−2`'s own real, already-computed
  answer from Lesson 5.1 — real, concrete proof that `toPostfix`'s own
  `>=` precedence comparison (not a plain `>`) is what makes two
  tied-precedence operators group left-associatively; a plain `>` would
  have silently produced the wrong grouping here. A third new test
  converts this project's own full real target expression,
  `"3+5×(2−8)"`, to `["3", "5", "2", "8", "−", "×", "+"]`. **Real,
  deliberate design calls, recorded**: tokens stay `List<String>` (no
  typed `Token` sealed class) — the exact live question Lesson 5.4's
  own SE Lens flagged, revisited honestly here and still not triggered,
  since `toPostfix` implements correctly with plain string checks; the
  real output sequence is built as a plain `MutableList<String>`, not a
  formal `Queue` instance — Queue's own real lesson (5.5) justified the
  *ordering choice* (append-only, never dequeued mid-algorithm), not a
  literal `Queue` object, so none was built. This project now has 32
  real, passing tests (29 prior + 3 new). Real, verified via a full,
  clean, saved `./gradlew testDebugUnitTest assembleDebug --rerun-tasks`
  run (`BUILD SUCCESSFUL`, all 43 tasks, all 32 tests) — the
  already-documented `HapticsTest`/`ThemeTest` flake recurred once more
  on an earlier real attempt this session, confirmed unrelated the same
  way as Lesson 5.4 (new tests pass in isolation; a later full run comes
  back clean).
- ~~A real fix for the precedence gap Lesson 5.1 proved is owed by
  this slice's own later lessons~~ — **fulfilled in full**, not by a
  "Lesson N" citation inside any lesson's own prose (none was written,
  per the schema's own rule), but worth closing the loop on here
  regardless: `brd.md`'s own Slice 5 lessons Stacks (5.3), Tokenization
  (5.4), Queues (5.5), Shunting-Yard (5.6), Trees (5.7), Recursion
  (5.8), AST (5.9), and Evaluation (5.10) have together delivered a
  real, working, tested pipeline — `tokenize` → `toPostfix` →
  `buildTree` → `evaluate` — that correctly handles precedence,
  associativity, and parentheses and, for the first time, actually
  computes a real number: `evaluate` on this project's own real target
  expression produces `-27`, and on the simpler two-operator case
  Lesson 5.1's own opening probe used, produces the correct `13`, not
  the `10` `nextState` has produced the entire time this slice has run.
  This project's own real Basic mode (`CalculatorState`/`nextState`)
  remains completely unmodified throughout — the real fix lives
  entirely in this new, separate, additive pipeline, with no real UI
  caller yet. **What's still genuinely open**: whether the eventual
  real evaluator gets wired into a genuinely new Scientific-mode
  screen/route (matching the already-standing `HomeScreen`
  forward-reference promise, above) or a change to Basic mode itself
  remains a live design choice for whichever future lesson actually
  builds that UI — not decided by any lesson in this slice so far, and
  not necessarily this slice's own remaining job either (Lesson 5.11,
  Parser Testing, is the only lesson left in Slice 5 per `brd.md`).
- **🟢 Lesson 5.7 (Reading the Same Tree Two Ways) shipped — purely
  diagnostic, no production code changes.** Real, executed proof of
  Node/parent-child/root/leaf/binary-tree/traversal via a hand-written,
  throwaway `class Node(val value: String, val left: Node? = null,
  val right: Node? = null)`, built into the exact real tree this
  project's own target expression forms (matching `brd.md`'s own
  Lesson 5.9 diagram precisely). **Real, decisive, satisfying finding,
  gathered this session**: a real, general, iterative pre-order
  traversal (stack-based, reusing this slice's own already-proven
  push/pop mechanism via a plain `MutableList`) produced `[+, 3, ×, 5,
  −, 2, 8]`; a *post-order* read of the identical tree — left, right,
  node, read explicitly by hand for this one known tree rather than via
  a general algorithm, since general recursive tree processing is
  deliberately left to this slice's own next lesson — produced `[3, 5,
  2, 8, −, ×, +]`, which is not merely similar to but **character-for-
  character identical** to `toPostfix`'s own real, already-tested
  postfix result for this exact expression (Lesson 5.6). Two completely
  different real algorithms — Shunting-Yard's stack-based token
  reordering, and a tree read in a specific order — converge on the
  identical real answer, real mutual proof both are correct. **Real,
  deliberate scope limits, recorded**: no general, reusable post-order
  function was built (that needs either recursion, deliberately reserved
  for Lesson 5.8, or a fiddlier iterative two-stack technique judged not
  worth the complexity for a foundational lesson); no `Node` class was
  added to the real project (this project doesn't have a real AST yet
  to use one in — that's explicitly Lesson 5.9's own job, needing
  Recursion from 5.8 first). This project still has 32 real, passing
  tests — unchanged, since no production code was touched.
- **🟢 Lesson 5.8 (The Deepest Call Returns First) shipped — purely
  diagnostic, no production code changes.** Real, executed proof of
  recursion, base case, recursive case, and the call stack, via a
  throwaway `class Directory` (BRD's own suggested directory-tree
  throwaway) with two real, hand-written recursive functions.
  **Real, decisive finding, gathered this session**: `printWithDepth`
  read `Thread.currentThread().stackTrace.size` — a real, live JVM
  introspection call, not a simulated or hand-tracked count — at each
  recursive call on a real 3-level directory chain, producing real,
  measured depths `4, 5, 6` entering and `6, 5, 4` leaving, in that
  exact order: real, physical proof the call stack is a genuine,
  inspectable LIFO structure, not a metaphor, growing and shrinking
  automatically the same way this slice's own hand-built Stack (5.3)
  had to be told to. **A second real, decisive finding**: a real,
  general, recursive `postOrder` function, applied — as a fresh
  throwaway, not real project code — to the identical real expression
  tree Lesson 5.7 already built, produced `[3, 5, 2, 8, −, ×, +]`,
  independently reproducing, for a *third* time, the exact same real
  result `toPostfix` (5.6) and Lesson 5.7's own hand-read post-order
  both already established — three genuinely different real methods,
  one identical real answer. **Real, deliberate scope limit,
  recorded**: no `Node`/`Directory` class or recursive function was
  added to the real project — this project still doesn't have a real
  AST to process, which remains explicitly Lesson 5.9's own job. This
  project still has 32 real, passing tests — unchanged, since no
  production code was touched.
- **🟢 `AndroidCalculator` now has a real, permanent AST builder —
  Lesson 5.9 (The Tree That Finally Stayed) — and this project's own
  real pipeline runs start to finish for the first time.** A new file,
  `app/src/main/java/com/example/calculator/AST.kt`: `data class
  Node(val value: String, val left: Node? = null, val right: Node? =
  null)` — the identical real shape Lessons 5.7/5.8 each proved twice
  as a throwaway `class`, now real and permanent, and deliberately
  upgraded from `class` to **`data class`** — a real, motivated design
  call, recorded: only a `data class` gives real, structural `equals()`
  for free, which is exactly what real tests asserting a tree's own
  shape need, rather than reference equality. `fun buildTree(postfix:
  List<String>): Node`, a real, permanent stack-based construction
  (pop two, combine under the operator, push) using a plain
  `MutableList<Node>` rather than this project's own real `Stack`
  class — deliberately: `Stack` is hard-typed to `String`, and making
  it generic to also hold `Node` would need real generics, still
  deliberately outside this curriculum's own current scope (same
  standing call as Lessons 5.3/5.5). **Real, decisive milestone,
  proven this session**: a new, permanent test chains this project's
  own real `tokenize`, `toPostfix`, and `buildTree` together for the
  first time — `buildTree(toPostfix(tokenize("3+5×(2−8)")))` — and
  `assertEquals`, relying on `Node`'s own real, structural equality,
  confirmed the result matches the exact tree this slice has now
  proven correct three independent ways (Shunting-Yard, hand-read
  traversal, general recursion). A second new test confirms a simpler,
  single-operator case. This project now has 34 real, passing tests
  (32 prior + 2 new). Real, verified via a full, clean, saved
  `./gradlew testDebugUnitTest assembleDebug --rerun-tasks` run
  (`BUILD SUCCESSFUL`, all 43 tasks, all 34 tests) — the
  already-documented `HapticsTest`/`ThemeTest` flake recurred once more
  on an earlier real attempt this session, confirmed unrelated the same
  way as Lessons 5.4 and 5.6 before it.
- **🟢 This project can now correctly evaluate its own real target
  expression — Lesson 5.10 (The Answer Is Negative Twenty-Seven) — the
  culminating lesson of the entire real, executed arc this slice opened
  with in Lesson 5.1.** A new file, `app/src/main/java/com/example/
  calculator/Evaluator.kt`: `fun evaluate(node: Node): Int`, a real,
  permanent, recursive function reading this project's own real AST and
  computing its real value — deliberately reusing this project's own
  real, *original* domain logic (`operatorSymbols`/`Operator`/
  `Operation.apply`, unchanged since this project's very first working
  Android calculator) rather than reimplementing arithmetic a second
  time, a real, motivated design call recorded in the SE Lens: Basic
  mode and this project's coming expression evaluator now share the
  exact same real arithmetic, by construction, including the identical
  real `ArithmeticException` division-by-zero already throws in both. A
  base case reads a leaf's own real numeric value via `String.toInt()`;
  a recursive case looks its own operator symbol up via
  `operatorSymbols.getValue(...)` and calls `Operation.apply` on both
  children's own already-recursively-computed real values — smart-cast
  `left`/`right` to non-null via an early return, no `!!` needed. **Real,
  decisive milestone, proven this session**: a new, permanent test
  chains all four of this project's own real pipeline stages together
  for the first time — `evaluate(buildTree(toPostfix(tokenize(
  "3+5×(2−8)"))))` — and produces the real, computed answer `-27`,
  exactly the number this whole slice has been building toward since
  its own opening lesson. A second new test closes the specific,
  simpler gap that opening lesson actually proved: `evaluate` on
  `"3+5×2"` produces the correct `13`, not the `10` this project's own
  real, unmodified `nextState` has produced the entire time this slice
  has been running (`nextState` itself remains completely unmodified —
  this is a second, separate, additive real pipeline, not a replacement
  for Basic mode). This project now has 36 real, passing tests (34
  prior + 2 new). Real, verified via a full, clean, saved `./gradlew
  testDebugUnitTest assembleDebug --rerun-tasks` run (`BUILD
  SUCCESSFUL`, all 43 tasks, all 36 tests) — the already-documented
  `HapticsTest`/`ThemeTest` flake recurred once more on an earlier real
  attempt this session, confirmed unrelated the same way as every prior
  real-code lesson in this slice.
- **🟢 Slice 5 (Expression Parser) fully shipped — Lesson 5.11 (The
  Parenthesis That Was Never Checked), the last lesson in this slice.**
  A new, permanent test file, `app/src/test/java/com/example/
  calculator/ParserTest.kt`, with a real, private helper,
  `evaluateExpression(expression: String): Int`, chaining this
  project's own full real pipeline (`tokenize` → `toPostfix` →
  `buildTree` → `evaluate`) in one call — this project's own first
  private helper method living inside a test class. **Real, thorough
  exploratory testing done this session, before committing to any
  permanent test**: ten real, escalating expressions were run against
  the real pipeline first (division, chained division, multiple/nested
  parens, multi-digit numbers, all four real operators mixed, a
  trivial single-number case, and division by zero) — every one
  produced the correct real answer. **Four of those became real,
  permanent regression tests**: `10÷2` → `5`; `100÷10÷2` → `5` (a
  second, independent, real confirmation — after subtraction's own,
  Lesson 5.6 — that this project's `>=` precedence comparison correctly
  left-associates same-precedence operators, this time for division);
  `(1+2)×(3+4)` → `21` (two separate parenthesized groups); `12+34×
  (56−78)÷2` → `-362` (multi-digit, all four operators, parens,
  together). **Real, previously-unknown finding, gathered this
  session**: two further exploratory expressions, `"(1+2"` (missing a
  closing paren) and `"1+2)"` (an unmatched closing paren), both threw
  a real, uncaught `IndexOutOfBoundsException` — from two genuinely
  different real code paths (`Stack.pop()`/`peek()` called on an empty
  stack, reached from inside `toPostfix` in one case and `buildTree` in
  the other) — confirming neither function has ever validated that its
  own input is well-formed. **Real, deliberate design call, recorded**:
  this gap is NOT fixed in this lesson — real grammar validation was
  always Lesson 5.1's own named, deliberately-deferred concern, and
  `brd.md`'s own Slice 5 never asked for it; there is also no real UI
  yet that could produce malformed input for a real user to hit. Two
  new, permanent **characterization tests** (a term this lesson
  introduces: a test recording current, real, possibly-unintended
  behavior without asserting it's ideal) capture this exact real
  behavior via `assertThrows(IndexOutOfBoundsException::class.java)`,
  so it stays a known, documented, deliberate gap rather than an
  undiscovered one. A seventh new test, `divisionByZeroPropagates
  TheRealArithmeticExceptionAllTheWayUp`, is the first real, executed
  proof (not just a stated prediction) that Lesson 5.10's own SE Lens
  claim holds: division by zero throws a real `ArithmeticException`
  that propagates unhandled, all the way up through `evaluate`. This
  project now has 43 real, passing tests (36 prior + 7 new). Real,
  verified via a full, clean, saved `./gradlew testDebugUnitTest
  assembleDebug --rerun-tasks` run (`BUILD SUCCESSFUL`, all 43 tasks,
  all 43 tests) — the already-documented `HapticsTest`/`ThemeTest`
  flake recurred once more on an earlier real attempt this session,
  confirmed unrelated the same way as every prior real-code lesson in
  this slice.
- **Real, honest, deliberately-unfixed gap, left open on purpose —
  malformed-expression input crashes with a real, unhelpful,
  low-level exception, not a clean error.** Discovered and recorded for
  real in Lesson 5.11: an expression with an unbalanced parenthesis —
  either missing a close, or an unmatched extra close — throws a real
  `IndexOutOfBoundsException` from deep inside `Stack.pop()`/`peek()`,
  reached from either `toPostfix` or `buildTree` depending on which way
  the expression is malformed. Two real, permanent characterization
  tests in `ParserTest.kt` now document this exact behavior. Not fixed,
  deliberately: real grammar validation was always a separate concern
  from tokenizing (Lesson 5.1's own stated design), never asked for by
  `brd.md`'s own Slice 5, and there is no real UI yet that could feed
  this pipeline malformed input at all. Worth a real fix — and
  worth updating these exact two tests' own expected behavior when it
  happens — the moment a future lesson (most likely whichever one
  finally builds a real Scientific-mode screen) gives a real user a way
  to type an expression this pipeline has never validated.
- ~~A real degree-to-radian (and radian-to-degree) conversion is owed
  by a later lesson, once `Double` exists~~ — **fulfilled** by Lesson
  6.4: a real, permanent `enum class AngleMode { DEGREES, RADIANS }`
  and a real, permanent `fun toRadians(angle: Double, mode: AngleMode): Double`
  (`app/src/main/java/com/example/calculator/ScientificFunctions.kt`),
  both real, compiled, tested project code — not an isolated lab.
  `Sine(private val mode: AngleMode)` is this promise's own real,
  tested caller, confirming `toRadians` correctly feeds
  `kotlin.math.sin` a real radian value, with the real, executed proof
  that `sin(toRadians(180.0, AngleMode.DEGREES))` computes to
  `1.2246467991473532E-16`, not a clean `0.0` — confirming, for real,
  that `Double`'s own approximate nature applies here exactly as
  predicted.
- **Real, explicit domain checks for `sqrt` are owed by whichever later
  lesson first builds it for real, once `Double` exists** —
  **fulfilled, for `sqrt` specifically**, by Lesson 6.4: a real,
  permanent `class SquareRoot : ScientificFunction`
  (`ScientificFunctions.kt`) checks `value < 0` and throws a real,
  descriptive `IllegalArgumentException` before ever calling
  `kotlin.math.sqrt` — confirmed, via real, executed output this
  session, that `kotlin.math.sqrt(-1.0)` itself silently returns `NaN`
  rather than throwing, making the explicit check a genuine, necessary
  addition, not a defensive formality. **`log`'s own equivalent domain
  check is still owed** — Lesson 6.4 deliberately built no real `log`
  function at all (a deliberate scope decision, made this session, to
  avoid redundantly re-teaching the identical domain-check mechanism a
  second time in the same lesson that already proved it once, for
  `sqrt`); whichever later lesson first builds a real `log` still owes
  the real, equivalent check (`x <= 0` for `log`) against real `Double`
  input, following the exact same pattern `SquareRoot` already
  establishes. A real, deliberate choice — still undecided for both —
  for how a real Scientific-mode UI should surface either failure to a
  real user, mirroring this project's own real `Display.Error` pattern
  or something new, also remains open.
- ~~A real Repository, wiring this project's own real Room persistence
  (`CalculationEntity`/`CalculationDao`/`AppDatabase`) into
  `CalculatorViewModel`, is owed by Lesson 7.4~~ — ~~the real, live UI
  wiring — `CalculatorViewModel` actually calling `CalculationRepository`,
  safely, without blocking the real screen — is now precisely, explicitly
  owed by Lesson 7.5~~ — **fully fulfilled, across the two lessons this
  promise actually took to close.** Lesson 7.4 delivered the real
  Repository half: `CalculationRepository` (real, permanent, tested,
  wrapping `CalculationDao`) and `Calculation.toEntity()`/
  `CalculationEntity.toDomain()` (the real conversion between the domain
  `Calculation` and the persistence `CalculationEntity`, two deliberately
  separate types since Lesson 7.3's own SE Lens) — both real, both proven
  correct via a real, executed round-trip test through a real, in-memory
  Room database, deliberately not yet called from the live app (see
  above — calling it from the real UI thread at that point would have
  either crashed outright or forced a bad, blocking design). Lesson 7.5
  delivered the other half, for real: `CalculatorViewModel` now takes a
  real `CalculationRepository` (defaulting to one built on the real,
  permanent `AppDatabase`), extends `AndroidViewModel` instead of plain
  `ViewModel`, and its own `onButtonClick` now calls
  `viewModelScope.launch { repository.save(newCalculation) }` the instant
  a calculation succeeds — never blocking the real screen, proven by two
  new, real, permanent, passing tests,
  `successfulCalculationIsSavedThroughTheRealRepository` and
  `failedCalculationIsNeverSaved`, in
  `CalculatorViewModelPersistenceTest.kt`. This promise is now closed in
  full — nothing about it remains open.
- **🟢 Stage 8 (Linear Algebra), Slice 8 (Matrix Calculator) started —
  Lesson 8.1 (Rows That Don't Have to Match) shipped, purely diagnostic,
  no production code changes.** Three real, isolated, `kotlinc`-compiled
  labs (this curriculum's own plain-`kotlinc` Stage-0-style verification,
  same as Lesson 5.1/6.1/8.1's own no-Android-needed approach — nothing
  here touches `AndroidCalculator/` at all): `lab1_nested_collections.kt`
  proved `List<List<Int>>` is real, legal Kotlin, with the outer list's
  own `size` correctly reporting row count, not total element count;
  `lab2_indexing.kt` proved `grid[row][col]` is genuinely two separate,
  chained calls to the same real `List<E>.get(index: Int): E` operator
  already established for plain `List<Int>` — one per dimension, nothing
  special about the double brackets; `lab3_ragged_dimensions.kt` proved
  the real, motivating gap this whole lesson exists to surface: a
  **jagged list** — `listOf(listOf(1, 2, 3), listOf(4, 5))`, rows of
  different lengths — compiles and runs exactly as cleanly as a
  well-formed grid, with nothing in `List<List<Int>>` or the Kotlin
  compiler enforcing that a matrix's rows actually match. **Real,
  checked findings, both sourced from the actual, currently-installed
  `kotlin-stdlib-sources.jar` this session, not memory**: `List<E>`'s
  real `get`/`size` declarations (`commonMain/kotlin/Collections.kt`)
  and `listOf`'s real signature (`commonMain/kotlin/collections/Collections.kt`)
  were fetched and quoted directly; `println`'s real JVM body
  (`jvmMain/kotlin/io/Console.kt`) was also fetched and confirmed to be
  a direct, one-line call into `System.out.println`, not anything
  Kotlin-specific underneath. All three labs were compiled together in
  one real, batched `kotlinc` pass (`kotlinc lab1_*.kt lab2_*.kt
  lab3_*.kt -include-runtime -d labs.jar`), each producing its own
  independently runnable class (`Lab1_nested_collectionsKt`, etc., since
  each file declares its own top-level `fun main()`), then each run
  separately via `java -cp labs.jar <Class>Kt` and its real output
  saved. This project still has 56 real, passing tests — unchanged,
  since no production code was touched. **Design call, recorded**: this
  lesson deliberately does not build or even name a real `Matrix` type
  — per this schema's own rule against citing a specific future lesson
  number inside Concept Unit prose, the gap it proves (nothing enforces
  rectangularity) is named only as "a future, permanent Matrix type this
  project will build," with the actual commitment to close it living
  only in the Header's own "next lesson" pointer, matching how Lesson
  4.2's and 5.1's own diagnostic lessons handed off to their following
  build lesson.
- **New verification folder, `verification/8.1/`,** holds all three real
  lab sources and their real, saved run transcripts
  (`lab1_nested_collections.kt`/`_run.txt`,
  `lab2_indexing.kt`/`_run.txt`, `lab3_ragged_dimensions.kt`/`_run.txt`)
  — the compiled `labs.jar` itself was deliberately not kept, matching
  every earlier lesson's own verification-folder convention (source and
  real output only, never the compiled artifact).
- **🟢 `AndroidCalculator` now has a real, permanent, tested `Matrix`
  type (Lesson 8.2) — Slice 8 more than a quarter shipped.** A new file,
  `app/src/main/java/com/example/calculator/Matrix.kt`:
  `data class Matrix(private val data: List<List<Int>>)`, with computed
  `val rows: Int`/`val cols: Int` properties and a real `init` block
  calling `require(data.all { it.size == cols })` — the real, permanent
  fix for the exact gap Lesson 8.1's own third unit proved was open
  (nothing about bare `List<List<Int>>` enforces equal row lengths); an
  invalid `Matrix` is now genuinely impossible to construct, closing
  that gap for real rather than just describing it. Six real Concept
  Units, each with its own throwaway `kotlinc` lab: the class itself
  (`init`/`require`); a real, permanent two-parameter
  `operator fun get(row: Int, col: Int): Int`, letting real code write
  `matrix[row, col]` (Kotlin's `operator` mechanism genuinely supports
  more than one parameter, confirmed real via `LabGrid`); `add`/
  `subtract`, bundled into one Concept Unit as the same real
  "element-wise binary operation" idea applied with two different
  arithmetic operators (matching this curriculum's own established
  merge-instead-of-hollow-unit precedent, Lesson 3.2); `multiply`, a
  genuinely different rule (`cols == other.rows`, not
  `rows == other.rows && cols == other.cols`) producing a genuinely
  different result shape, built from a real dot product
  (`(0 until cols).sumOf { k -> this[r, k] * other[k, c] }`) computed
  once per result cell; `transpose`, reshaping one matrix by swapping
  which range is outer and which is inner in the same nested
  `map`-over-`until` pattern every other operation already uses; and
  `determinant`, a real, honest, deliberately narrow `2×2`-only
  implementation (`this[0,0]*this[1,1] - this[0,1]*this[1,0]`), guarded
  by two separate `require` checks — square first, then exactly `2×2` —
  with the scope limit (no general cofactor expansion for larger square
  matrices) explicitly recorded rather than silently left implicit,
  matching this project's own standing "nothing built speculatively"
  discipline. **Real, checked findings, sourced from the actual,
  currently-installed `kotlin-stdlib-sources.jar` this session**: real
  signatures for `require`, `all`, `until`, `map`, and `sumOf` were all
  fetched and quoted, including `require`'s own real body (confirmed to
  throw `IllegalArgumentException(message.toString())`, only calling its
  lazy message when the condition is actually false) and the exact real
  `Int.until(to: Int): IntRange` overload (confirmed distinct from
  `Int.until(to: Byte)`/`(to: Long)`/`(to: Short)` overloads also present
  in the same file). A new, permanent test file, `MatrixTest.kt`, holds
  10 real tests — one success case and one thrown-`IllegalArgumentException`
  case for most of the five new operations, using this project's own
  already-established `assertEquals`/`assertThrows` pattern; `Matrix`
  being a `data class` is what makes `assertEquals(expectedMatrix,
  actualMatrix)` work at all (real, compiler-generated `equals`, not
  object-identity comparison). **Real, intermittent full-suite
  flakiness recurred this session** — the same, already-documented
  `AppNotIdleException` issue first flagged in Lesson 4.5 (see the
  forward-reference promises section) — a first
  `./gradlew testDebugUnitTest assembleDebug` run failed 4 of 66 tests
  (`HapticsTest`, `NavigationTest`, `ThemeTest` — never `MatrixTest`,
  confirmed by checking each real, individual test-result XML), and an
  immediate rerun, no code changed, passed all 66 with a real `.apk`
  assembled — consistent with the existing note's own "intermittent,
  same root cause category" framing; not re-investigated further here,
  same as that note already recommends. This project now has 66 real,
  passing tests. Real, verified via that clean, complete
  `./gradlew testDebugUnitTest assembleDebug` run.
- **New verification folder, `verification/8.2/`,** holds all six real
  lab sources and their real, saved run transcripts
  (`lab1_init_require.kt` through `lab6_determinant_2x2.kt`, each with
  its own `_run.txt`) — the compiled `labs.jar` was not kept, same
  convention as every earlier verification folder.
- **🟢 Lesson 8.3 (Eight Times Instead of Four) shipped — purely
  diagnostic, no production code changes.** Real, counted proof that
  `Matrix`'s five real operations split into two real growth-rate
  families, not one: `add`/`subtract`/`transpose` all share real,
  counted `O(n²)` growth (a throwaway `countedCombine` lab, quoting
  `add`'s own real nested `map`-over-`until` shape verbatim with one
  counter added, measured `4`/`16`/`64`/`256` cell visits for
  `2`/`4`/`8`/`16`-sized square matrices — exactly `n²`, exactly `4×`
  per doubling); `multiply` does not — a second throwaway
  `countedMultiply` lab, quoting `multiply`'s own real
  `map`-over-`until`-over-`sumOf` shape verbatim, measured
  `8`/`64`/`512`/`4096` real multiplications for the same four sizes —
  exactly `n³`, exactly `8×` per doubling, a real growth rate new to
  this project (**cubic time, `O(n³)`**), genuinely faster-growing than
  every rate this project's own earlier complexity lesson already
  proved. `determinant` was deliberately given no dedicated unit or
  lab — real, constant-time by construction (its own two `require`
  checks only ever let it proceed for exactly one size, `2×2`), and
  introduces no new growth rate this project hasn't already proven real
  elsewhere; named honestly in the Closing instead. **Design call,
  recorded**: the Header's own primary "Objects and methods used" entry
  for `Matrix`'s five operations required real, deliberate judgment —
  no lab in this lesson actually calls `Matrix`/`add`/`multiply`/etc.
  directly (each lab is an independent, throwaway reimplementation of
  the same real shape, per the Concept Isolation Rule), so the usual
  "does this lesson's code depend on it" test doesn't trigger a slot on
  its own; added anyway per the schema's own explicit rule that a
  lesson's own real subject gets a full entry "even though it's what the
  lesson is about," since skipping it here would have left this lesson's
  actual real subject with no Header entry at all — worth watching for
  on any future purely-diagnostic lesson that measures, rather than
  calls, its own subject's real code. This project still has 66 real,
  passing tests — unchanged, since no production code was touched.
- **New verification folder, `verification/8.3/`,** holds both real lab
  sources and their real, saved run transcripts
  (`lab1_quadratic_family.kt`/`_run.txt`,
  `lab2_cubic_multiply.kt`/`_run.txt`) — same convention as every
  earlier verification folder.
- **🟢 `Matrix.kt` now has a real `MatrixOperation` Strategy-pattern
  interface (Lesson 8.4), and one real, honest, open promise.** A new
  `interface MatrixOperation { fun apply(a: Matrix, b: Matrix): Matrix }`
  plus two real singleton implementations, `object MatrixAddition` and
  `object MatrixMultiplication`, added at the end of `Matrix.kt`;
  `Matrix.add`/`Matrix.multiply` are now one-line delegations
  (`MatrixAddition.apply(this, other)` /
  `MatrixMultiplication.apply(this, other)`) instead of full
  implementations — the identical real computations, just relocated.
  `subtract` was deliberately left untouched (BRD's own
  `MatrixOperation` list names only Addition/Multiplication/Inverse, not
  Subtraction — a real, recorded scope limit, not an oversight). **Real,
  unplanned finding, caught by the real compiler this session**: this
  lesson's own first attempt named the two new objects `Addition`/
  `Multiplication` (matching BRD's own bullet-diagram names) — a real
  `./gradlew :app:compileDebugKotlin` run failed with
  `Redeclaration: Addition`/`Redeclaration: Multiplication`, both
  pointing at `Calculator.kt`, which already has `private class
  Addition`/`private class Multiplication` (its own Stage-0/2 scalar
  `Operation` implementations, made `private` in Lesson 2.4). **Real,
  confirmed Kotlin fact**: a top-level `private` declaration is private
  *to its own file*, but still claims its name across the whole
  *package* — a same-named top-level declaration in a different file of
  that package is a real compile error regardless of the first one's
  visibility. Fixed by renaming to `MatrixAddition`/`MatrixMultiplication`,
  confirmed to compile clean. A new, permanent test file,
  `MatrixOperationTest.kt`, adds 3 real tests: `MatrixAddition`/
  `MatrixMultiplication` called directly (not through `Matrix`), plus a
  real, executed proof of actual Strategy-pattern polymorphism (one
  `runOperation(operation: MatrixOperation)` function, called with both
  real objects, producing genuinely different real results from the
  identical call site). **Real, decisive investigation, this lesson's
  own second unit**: BRD's own third `MatrixOperation` member,
  `Inverse`, was investigated for real before being built — a real,
  executed lab computed the actual `2×2` inverse of `[[4, 3], [2, 1]]`
  (real determinant `-2`) two ways: plain `Int` division produced a
  real, *wrong* answer (`[[0, 1], [1, -2]]`, silently truncated);
  converting the determinant to `Double` first (via real `.toDouble()`)
  produced the real, correct answer (`[[-0.5, 1.5], [1.0, -2.0]]`).
  **Real, honest conclusion, not built this lesson**: `Matrix`'s own
  `Int`-only cells cannot represent a correct inverse at all, for a
  perfectly ordinary example, not an edge case — `Inverse` is
  deliberately, explicitly deferred until `Matrix` can hold non-integer
  values, the real motivating trigger for Lesson 8.6's own generics
  work (see the forward-reference promises section, updated below).
  This project now has 69 real, passing tests (66 carried over, 3 new in
  `MatrixOperationTest.kt`). Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug` run (one real,
  already-documented `AppNotIdleException` flake recurred on the first
  attempt — `HapticsTest`/`NavigationTest`×2/`ThemeTest`, never anything
  Matrix-related — an immediate, unmodified rerun passed clean, same
  pattern as every earlier occurrence).
- **New verification folder, `verification/8.4/`,** holds both real lab
  sources and their real, saved run transcripts
  (`lab1_strategy_pattern.kt`/`_run.txt`,
  `lab2_inverse_needs_double.kt`/`_run.txt`) — same convention as every
  earlier verification folder.
- **🟢 `Matrix.kt` now has a real, permanent `Matrix.identity(size)`
  factory function (Lesson 8.5).** A new, unnamed `companion object`
  block added inside `Matrix`, after `determinant`, holding
  `fun identity(size: Int): Matrix`, building a real `size × size` grid
  (`1` wherever row equals column, `0` elsewhere) and handing it to
  `Matrix`'s own ordinary, still-fully-public constructor — `identity`
  goes through the exact same real validation as any other `Matrix`,
  it does not bypass it. **Real, investigated design call, honoring
  BRD's own explicit conditional framing ("only if dynamic matrix
  creation genuinely benefits from it")**: a heavier, separate,
  instantiated `MatrixFactory` class was considered and rejected — no
  real runtime decision between competing factory implementations
  exists for this project's own real need (every caller already knows,
  at the call site, that it wants an identity matrix); Kotlin's own
  simplest real form of the same idea, a `companion object` factory
  function, was judged the genuinely-benefiting, minimal real answer.
  **Deliberate scope limit, recorded honestly**: only `identity` was
  built — no `zeros`/all-ones/other special-matrix factory alongside
  it, since nothing in this project's own real, current plans needs one
  yet; the identical `companion object` shape is already proven ready
  the moment a real need for one exists. Two new tests added to the
  existing `MatrixTest.kt`
  (`identityOfSizeTwoHasOnesOnDiagonal`/`identityOfSizeThreeHasOnesOnDiagonal`).
  This project now has 71 real, passing tests. Real, verified via a
  full `./gradlew testDebugUnitTest assembleDebug` run.
- **New verification folder, `verification/8.5/`,** holds
  `lab1_companion_factory.kt`/`_run.txt` (a real, working `companion
  object` factory demo) and `break1_private_constructor.kt`/`_run.txt`
  (a real, deliberately-broken direct-construction attempt, its own
  real compile error saved) — same convention as every earlier
  verification folder.
- **🟢 `Matrix` is now genuinely generic, `Matrix<T>` (Lesson 8.6) —
  the `Inverse` forward-reference promise is closed.** `Matrix.kt`
  rewritten: `data class Matrix<T>(private val data: List<List<T>>)`,
  with `rows`/`cols`/`init`/`get`/`transpose` all type-agnostic (none of
  them ever touched arithmetic, so none needed to change beyond their
  own declared types). `add`/`subtract`/`multiply`/`determinant` moved
  out of the class entirely, now real top-level extension functions
  scoped to `Matrix<Int>` specifically (`fun Matrix<Int>.add(...)`, and
  so on) — their own real bodies unchanged, byte-for-byte, only their
  location changed. `MatrixOperation`/`MatrixAddition`/`MatrixMultiplication`
  retyped to `Matrix<Int>` explicitly. `Matrix.identity(size)` retyped to
  return `Matrix<Int>` explicitly (its own body unchanged — confirmed
  for real that referencing the raw class name `Matrix.identity(...)`,
  with no type argument, still correctly resolves through the
  companion object even though `Matrix` itself is now generic — a
  companion object belongs to the class as a whole, not any one
  instantiation). **Real, decisive investigation, this lesson's own
  first unit**: a real, negative-case compile attempting `a + b` on an
  unconstrained generic `T` produced a genuine 259-line compiler error
  (not a simple "unresolved reference" — Kotlin tries every real `plus`
  overload anywhere in scope, `BigDecimal` through `CharArray` through
  `Sequence`, rejecting each for a receiver-type mismatch), real,
  concrete proof of why `add`/`subtract`/`multiply`/`determinant`
  could not stay inside `Matrix<T>` itself. **Real, investigated and
  rejected alternative**: a bounded type parameter (`Matrix<T : Number>`)
  was considered — Kotlin's own real `Number` type declares no shared
  `plus`/`minus`/`times` at all, so bounding would not have restored any
  operation without a real, custom-written numeric-abstraction interface,
  judged genuinely speculative machinery this project's own real,
  current need (exactly `Int` arithmetic plus one `Double` operation)
  doesn't justify. A new, real, permanent
  `fun Matrix<Double>.inverse(): Matrix<Double>` computes this project's
  own already-proven-correct `2×2` inverse formula on genuine `Double`
  cells, guarded by real square/`2×2`/nonzero-determinant checks — the
  same real numbers (`[[-0.5, 1.5], [1.0, -2.0]]`) Lesson 8.4's own
  throwaway lab first proved by hand, now computed by a real, permanent,
  tested method. Three new tests added to `MatrixTest.kt`
  (`inverseOfTwoByTwoMatrixIsComputedCorrectly`,
  `inverseOfSingularMatrixThrows`, `inverseOfNonSquareMatrixThrows`); one
  small, real, unrelated test-code fix required in
  `MatrixOperationTest.kt` (a local helper function's own return type,
  bare `Matrix`, needed `Matrix<Int>` once `Matrix` became generic — a
  real, caught-by-the-compiler, one-line fix). This project now has 74
  real, passing tests. Real, verified via a full
  `./gradlew testDebugUnitTest assembleDebug` run.
- **New verification folder, `verification/8.6/`,** holds three real
  working labs and two real, deliberately-broken negative-case compiles
  (`lab1_generic_class.kt`, `break1_unconstrained_plus.kt` — whose full,
  untruncated 259-line real compiler output is saved separately as
  `break1_full_output.txt`, since it's too long to usefully inline —
  `lab2_extension_on_instantiation.kt`, `break2_extension_wrong_type.kt`,
  `lab3_generic_inverse.kt`), each with its own real, saved run
  transcript — same convention as every earlier verification folder.
- **🟢 `MatrixInvariantTest.kt` now exists (Lesson 8.7) — Slice 8
  shipped in full.** A new, permanent test file, four real tests: the
  identity invariant (`A × I = A`) and addition's own commutativity
  (`A + B = B + A`), each proven across 100 real, freshly-generated
  random `2×2` `Int` matrices via `repeat(100) { ... }` (this project's
  own first real use of genuine, unseeded `kotlin.random.Random`);
  multiplication's own real *non*-commutativity, proven instead with
  exactly one permanent, hand-computed counterexample
  (`[[1,2],[3,4]]`/`[[5,6],[7,8]]` → `[[19,22],[43,50]]` vs.
  `[[23,34],[31,46]]`) — a deliberate, real, explained departure from
  property-based testing, since a random-trial version of this specific
  test would be genuinely flaky (some real matrix pairs, e.g. involving
  the identity, do commute); and the inverse invariant
  (`A × A⁻¹ = I`), proven across 100 more random, guaranteed-invertible
  `Matrix<Double>` trials, using JUnit's real, tolerance-based
  three-argument `assertEquals(expected, actual, delta)` overload rather
  than exact equality — a real, executed, hand-verified check this
  session confirmed plain `Double` arithmetic does *not* always land on
  an exact `1.0`/`0.0` for this exact formula (determinants like `10`,
  `14`, `29` produced real floating-point residue on the order of
  `1e-16`; "nice" determinants like `-2`, `1`, `3`, `7` did not) — the
  same real floating-point-precision category this project's own
  scientific-function work already proved for `sin(180°)`. **Real,
  unplanned, significant finding, this session**: writing the inverse
  invariant test required a real `Matrix<Double>.multiply` that didn't
  exist yet (only `Matrix<Int>.multiply` did) — attempting to add one
  the same way `Matrix<Int>.multiply` was already written produced a
  real, genuine compile error, `Platform declaration clash`, because
  Kotlin generics undergo real **type erasure** at the JVM level:
  `Matrix<Int>.multiply` and `Matrix<Double>.multiply` compile to the
  *identical* raw JVM signature (`Matrix` alone, type argument erased),
  so the two declarations collide as far as the JVM is concerned even
  though Kotlin's own source-level type system treats them as genuinely
  different. **Real fix**: `@JvmName("multiplyDouble")` on the `Double`
  version — Kotlin callers still write `a.multiply(b)` identically
  either way; only the compiled `.class` file's own internal method name
  differs, invisibly. This project now has 78 real, passing tests. Real,
  verified via a full `./gradlew testDebugUnitTest assembleDebug` run
  (the same, already-documented `AppNotIdleException` flake recurred
  once more, unrelated to any Matrix code; an immediate, unmodified
  rerun passed clean, same pattern as every earlier occurrence).
- **New verification folder, `verification/8.7/`,** holds
  `lab1_property_based_testing.kt`/`_run.txt` and
  `lab2_multiplication_counterexample.kt`/`_run.txt` — same convention
  as every earlier verification folder.

## Methodology notes for future sessions

- **Before a lesson claims to "connect to" or "port" an earlier
  project's code, verify that code actually exists as a real, persistent
  file — don't assume it does because a handoff narrative describes its
  final state in prose.** Lesson 1.6's own loop prompt assumed
  `Calculator.kt` was a real, movable file inside this curriculum's own
  directory (a reasonable-sounding assumption from how the handoff's own
  Progress section describes "`Calculator.kt`'s final Slice-0 state").
  Checking for real (`find` across the curriculum directory) found no
  such file — Stage 0 only ever produced real, compiled
  `verification/0.X/step*.kt` snapshots, never one persistent top-level
  file. The fix was cheap once checked: read the real, final snapshot
  (`verification/0.10/step4_also_calculation.kt`, itself already inside
  this curriculum's own directory, not a forbidden external read) and
  port from that. The general lesson: a real project's "current state" is
  whatever real files actually exist on disk right now, not whatever a
  narrative summary implies — check before building a lesson's own plan
  on top of an assumption about what exists.
- **A documented tooling limitation deserves a second look with a
  *different* tool, not just periodic re-attempts of the original one —
  especially before a lesson the BRD itself flags as important.** Stage 1
  tooling notes had, since Lesson 1.1, documented "no working emulator or
  device" and treated that as meaning on-device-style behavior couldn't
  be verified — true for a real emulator, specifically, but not true for
  *all* on-device-style verification. Robolectric (a JVM-based Android
  test framework, unrelated to the emulator/AVD approach already tried
  and abandoned) turned out to fully support real, executed Compose UI
  testing — click dispatch, state, recomposition — with zero emulator
  involved, discovered only because Lesson 1.4 (State/Recomposition,
  BRD-flagged as "one of the most important Android lessons") was
  important enough to justify spending real effort investigating an
  alternative rather than defaulting to the already-established Necessity
  exemption. The two real, saved failed attempts on the way to a working
  test (an ambiguous text-based finder matching two nodes; a
  merged-semantics button swallowing a nested tag) were themselves cheap,
  fast JVM test runs, not expensive infrastructure dead ends like the
  emulator attempt was — worth remembering that a genuinely different
  tool can have a completely different cost/risk profile than the one
  already tried, even when solving what looks like the same problem.
- **"Lesson N" citations leak into Concept Unit prose easily once a
  lesson starts reusing a *previous Android lesson's* real objects
  (`Column`, `Row`, `Modifier`, ...), not just Stage 0 constructs — watch
  for this specifically when writing lesson 2+ of a multi-lesson project
  segment.** Lesson 1.3's own first draft had over a dozen real instances
  of "unchanged from Lesson 1.2" / "already resolved ... through Lesson
  1.2's dependencies" scattered through its Header's "Everything else"
  entries, Project Change "Dependencies" fields, and Concept Unit prose —
  a real violation of the schema's own rule that a lesson number belongs
  only in the Header's "what you need to know first" list and the
  closing "next lesson" pointer, never inside a Concept Unit's own prose.
  This is easy to miss specifically in a *reappearing-object-heavy*
  lesson (one Android project evolving lesson to lesson, not a series of
  independent Stage-0 exercises) because writing "unchanged from Lesson
  X" feels like an efficient, honest shortcut in the moment, when the
  schema requires either full restated substance or a citation-free
  statement of "carried over unchanged" with no lesson number at all.
  Caught by a targeted `grep -n "Lesson [0-9]"` self-check pass across
  the whole draft, run immediately after the automated back-to-back-code
  and Socratic-question-count scans — worth running as a standing check
  on every future Stage 1+ lesson, not just this one.
- **A wrong-typed argument forces the real compiler to print a real
  signature — a reusable trick beyond just proving requirements.** Lesson
  1.2 needed `Modifier.padding(...)`'s and `Modifier.fillMaxWidth(...)`'s
  exact real parameter types quoted accurately, without trusting memory or
  an unfetched external doc. Passing a deliberately wrong-typed argument
  (a `String` where a `Float`/`Dp` was expected) made `kotlinc` itself
  print the real, complete signature (all three real `padding` overloads,
  in `padding`'s case) directly in its own error text — proof sourced
  from the actual compiler, not a secondhand reproduction, and reusable
  any time a lesson needs to quote an external library's real signature
  precisely: trigger a real type-mismatch against it and read the
  diagnostic, rather than asserting the signature from confidence alone.
- **Framework "requirement" claims need an actual negative-case
  compile, not just analogy to an already-proven pattern.** Lesson
  1.1's own first draft claimed overriding `Activity.onCreate` was
  "required... for the identical reason" Lesson 0.7 proved interface
  methods are required — plausible-sounding, wrong. A real compile of a
  second `Activity` subclass with zero overrides succeeded (exit `0`),
  proving it's optional; a further real compile with an empty override
  that never calls `super.onCreate` also succeeded, proving that's not
  compiler-enforced either — the real requirement is the Android
  runtime's own contract, not something `kotlinc` checks. Caught only
  by actually testing the negative case, not by re-reading the original
  claim more carefully. For Stage 1+: any claim that extending a real
  framework class "requires" overriding or calling something needs an
  actual compile of the version that skips it, before asserting the
  requirement is real — analogy to an already-proven Kotlin-language
  pattern (like interface implementation) is not itself proof once the
  underlying mechanism (a class's own real default vs. an interface's
  lack of one) is genuinely different.
- **Autonomous judgment calls when the user is unreachable.** If a
  loop/session hits a real blocker that would normally warrant asking
  the user, and a push notification doesn't reach them (or they're
  otherwise not there to answer), don't just idle waiting for a reply
  that may not come — make the call yourself, choosing whichever option
  actually produces the best lesson series for them as the learner, and
  keep going. This was stated explicitly and generally ("I can't make a
  call if I'm not here... make the call") after exactly this situation
  happened once already (the missing-Android-SDK blocker, below) — it's
  a standing instruction for this curriculum, not a one-time exception.
  Record the decision made and why, the same way every other design
  call in this file is recorded, so it's reviewable after the fact even
  though it wasn't approved beforehand.
- **Socratic-prompt self-check false positives:** counting raw `?`
  characters in a Concept Unit's Problem section to verify the
  "2–4 questions" rule breaks the moment the lesson's own subject uses
  a literal `Int?`/`String?`-shaped token (nullability lessons,
  generics-adjacent lessons). Count only `?` immediately followed by
  whitespace/end-of-text and *not* immediately followed by a backtick
  — that excludes an inline-code type token like `` `Int?` `` while
  still catching a real sentence-ending question mark.
- **CRC breakdown labels must be the literal words "Depends on:" /
  "Connects to:"** (not grammatically-adjusted plurals like "Depend
  on:" / "Connect to:") even when one Header entry covers several
  functions at once — split into one entry per function instead of
  bundling, both for this reason and because the schema's own
  self-check greps for the exact labels. **Recurred in Lesson 1.4
  despite being documented here already** — two reappearing-object
  entries bundled 4 functions each under "What they are" (plural). A
  cheap, reusable automated check now exists for this specific failure:
  `grep -o "^- [A-Za-z ]*:" <file> | sed 's/:$//' | sort | uniq -c` across
  a finished Header — every one of the 8 CRC labels (`What it is`,
  `Implementation`, `Its use`, `Type`, `Responsibility`, `Depends on`,
  `Connects to`, `Shape`) should show the *identical* count; any label
  short of the others, or any `What they are`/`Depend on`/etc. variant
  showing up at all, means an entry was bundled or mislabeled. Run this
  script (plus the equivalent Socratic-question-count script and the
  `grep -n "Lesson [0-9]"` scan, both already documented above) on every
  future lesson's finished draft, not just when something feels off.
- **The Concept Isolation Rule applies to a small, ordinary-looking JUnit
  or `try`/`catch` addition exactly as much as it applies to a Compose
  construct — caught and fixed in Lesson 2.5's own first draft.** Two
  Concept Units in that lesson (`assertThrows`; `try` as an expression)
  originally jumped straight from naming the new concept to writing it
  directly into the real, permanent project test file — no separate
  throwaway lab, no discard statement — because both felt "too small to
  need a lab" (a few lines of ordinary-looking JUnit/Kotlin, not a dense
  new framework API). A structural self-check (verifying every Concept
  Unit has all of: Problem, Introduce-in-Isolation, Discard,
  [Project-Change/New-Code/Updated-Project when applicable], Mechanical
  Walkthrough, CS Lens, SE Lens, Commands Needed, Run It, Connect the
  Pieces) caught the missing Discard step in both units, which traced
  back to the missing isolated lab in the first place. The fix: a genuine
  standalone `main()`-based lab for each (proving `assertThrows` on an
  invented `divideByZero()` function; proving `try`-as-expression on an
  invented `amount`/`result` pair), compiled and run for real, discarded,
  *before* the real permanent test/fix landed — exactly the same pattern
  already used for denser constructs. **A reusable structural self-check
  worth running on every future lesson**: enumerate every `###` heading
  inside each `## Concept Unit`, and confirm each Concept Unit has
  Problem/Introduce/Discard/CS-Lens/SE-Lens/Commands/Run-It/Connect at
  minimum — a missing Discard step is a reliable signal an isolated lab
  was skipped entirely, not just under-explained.
- **A test-ambiguity fix chosen mid-lesson can make an entire class of
  new vocabulary unnecessary — worth reconsidering scope before writing,
  not just after.** Lesson 2.5's first working fix for the "0 button
  versus display both reading 0" ambiguity (the same real bug class
  Lesson 1.4 first hit) used a compound Compose matcher,
  `onNode(hasText("0") and hasClickAction())` — real, verified, working,
  but it would have dragged three new Compose-testing API entries
  (`hasText`, `hasClickAction`, `onNode`) into the Header for a lesson
  whose own named concepts (Exceptions/Invalid state/Domain
  errors/User-facing errors) had nothing to do with semantics-matching.
  Adding `Modifier.testTag(label)` to every keypad button instead —
  already-established, reappearing vocabulary, zero new Header entries —
  solved the same ambiguity permanently and more simply. Worth checking,
  before committing to a first-working fix: is there an already-taught
  tool that solves this more directly, especially when the fix is
  incidental to the lesson's own real subject.
- The "given full treatment in this lesson's Header/in Lesson N"
  phrasing is only compliant when real restated substance immediately
  follows in the same breath — never as a bare pointer with nothing
  else. Caught and fixed several bare instances in 0.1–0.2 during
  self-check; write the restatement first, from now on, rather than
  auditing for it afterward.
- **A Concept Unit that introduces no new previously-untaught concept of
  its own — it only combines constructs already proven, separately, by
  *earlier* units in the same lesson — should not be a standalone unit
  with its own empty lab/Discard step.** Lesson 3.2's first draft had a
  third unit ("Reuse") whose own "Introduce the Concept in Isolation"
  step admitted, in its own prose, that nothing new needed isolating —
  a structural sign the unit itself shouldn't exist as written. The
  fix: merge it into the *last* unit that actually proved something in
  isolation, so that one unit both proves its own new construct and
  immediately integrates it, combined with whatever earlier units in the
  same lesson already proved — the same shape Lesson 3.1's own final
  "Theme" unit already used successfully. Applying the structural
  self-check (every Concept Unit has Problem/Introduce/Discard/CS-Lens/
  SE-Lens/Commands/Run-It/Connect) caught this — a unit whose own
  "Introduce" step explicitly says "nothing new here" is the same kind
  of tell a missing Discard step already was in Lesson 2.5. **A related
  trap the merge itself can introduce**: combining two units' content
  can leave two "CS Lens"/"SE Lens" pairs inside one now-merged unit —
  the structural self-check must also flag *duplicate* headings within a
  single unit, not just missing ones; consolidate into one CS Lens and
  one SE Lens covering both ideas, positioned after the Mechanical
  Walkthrough per the schema's own step order, not left in whatever
  position the pre-merge draft happened to leave them.

- **A loop prompt's own embedded description of "current progress" can go
  stale — this handoff, read fresh, is the only source of truth for where
  the project actually is.** This session's own loop instructions opened
  by describing the project as mid-Stage-3 (Lessons 3.1/3.2 done, 13
  tests passing) — a real, accurate snapshot from several sessions ago,
  carried forward verbatim in a saved prompt, but stale by the time this
  session actually ran: this handoff's own Progress section, read fresh
  per this file's own standing rule, showed Stages 0–4 fully shipped (27
  tests) and Stage 5 not yet started. Rather than redo already-shipped
  work or ask the user to resolve the discrepancy, this session trusted
  the handoff (this file, read first, exactly as this file's own opening
  rule instructs) over the prompt's own embedded narrative, and picked
  up at the real next lesson, Stage 5's Lesson 5.1. Worth remembering for
  any future session that receives a loop prompt with an embedded
  progress summary: treat it as the state at the time the loop was
  configured, not as a live fact — this handoff's own Progress table,
  read fresh every session per its own opening rule, is what actually
  governs where to continue.

## Session pacing

Per standing session-management guidance: pace by session
duration/context size, not by lesson count. Do not stop between lessons
to ask permission to continue — keep building until the session's
natural end, then update this file's Progress table and this note
before stopping (handoff gets written at the *start* of the next
session's setup work, not appended at the end of the current one,
except for this initial creation).
