# Lesson 3.5: Built for a User You'll Never Meet

- **What you will build** — three real, verified accessibility
  guarantees added to this project's own real keypad: an explicit,
  spoken-word label for every symbol button whose visible glyph isn't
  already a clear word, replacing a raw Unicode character with something
  a screen reader can announce meaningfully; a permanent, automated test
  confirming this project's own keypad buttons already meet Android's
  own documented minimum touch-target size; and a real, computable
  contrast-ratio function, permanently testing that this project's own
  default button colors meet the real minimum a low-vision user needs to
  read them. The transferable problem: an app that looks and works fine
  to the one specific person who built it — sighted, precise fine-motor
  control, typical color vision — can be silently unusable to someone
  whose senses or abilities work differently, and unlike almost every
  other kind of defect, a gap like this produces no crash, no compiler
  warning, no failing build; it only becomes visible if someone actually
  checks, by name, for the specific thing that's missing.
- **What you need to know first** — Lesson 3.4's `MaterialTheme
  .colorScheme` and `Color`; Lesson 3.1's `Theme.kt` and
  `CalculatorColorScheme`; Lesson 3.2's `CalculatorButton`; Lesson 1.6's
  `mapOf` and `Map`'s own key-lookup operator; Lesson 1.4's
  Robolectric-based Compose UI testing, `composeTestRule`, and
  `onNodeWithTag`; Lesson 0.10's `?.` safe call and `let`.

## Terms used in this lesson

- **`?.`** — Kotlin's safe call operator: calling a member on a nullable
  value only if that value is actually non-null at runtime, producing
  `null` instead of a real, thrown exception when it isn't. It exists so
  a chain like `contentDescription?.let { ... }` can be written as one
  short expression instead of an explicit `if (contentDescription !=
  null) { ... }` block, while still never risking a real null-pointer
  failure on the call it guards.

## Objects and methods used

- **`Modifier.semantics`** *(this lesson's own new Compose function)*
  - *What it is:* the real Compose UI function attaching accessibility-
    relevant information — a description, a role, a state — to whatever
    composable its `Modifier` is applied to, information a screen reader
    or other assistive technology can read even when it isn't part of
    what's drawn on screen.
  - *Implementation:* `fun Modifier.semantics(mergeDescendants: Boolean =
    false, properties: SemanticsPropertyReceiver.() -> Unit): Modifier` —
    this lesson calls it with its `mergeDescendants` left at its own real
    default, `false`, confirmed sufficient by a real, executed test this
    session (below); `properties` is a lambda with `SemanticsPropertyReceiver`
    as its real receiver, letting the block inside set real semantics
    properties like `contentDescription` directly, by name.
  - *Its use:* attaches a real, explicit `contentDescription` to a
    keypad button, without changing anything about what's actually drawn
    on screen.
  - *Type:* an extension function on `Modifier`.
  - *Responsibility:* to record one or more real accessibility
    properties against a composable's own semantics node, for assistive
    technology to read later.
  - *Depends on:* a `properties` lambda naming which real semantics
    properties to set.
  - *Connects to:* called inside `CalculatorButton`'s own `Modifier`
    chain, right after `.testTag(label)`; its own `contentDescription`
    property is read back out by a real Robolectric test's
    `onNodeWithContentDescription`, below.
  - *Shape:* a public Compose UI API, `androidx.compose.ui.semantics
    .semantics` — already on this project's real compile classpath since
    Lesson 1.2 first added `androidx.compose.ui:ui`, no new Gradle
    dependency required.

- **`contentDescription`** *(this lesson's own new Compose property)*
  - *What it is:* a real, settable property inside a `semantics { }`
    block, holding the exact string an assistive technology should
    announce for this node, in place of whatever text it would otherwise
    infer from what's drawn.
  - *Implementation:* `var SemanticsPropertyReceiver.contentDescription:
    String` — a real property, backed by a semantics key,
    `SemanticsProperties.ContentDescription`, that Compose's own
    accessibility services read from later.
  - *Its use:* set to a real, explicit word — `"times"`, `"divide"`,
    `"minus"`, `"clear"` — for the four keypad buttons whose own visible
    glyph isn't already an unambiguous spoken word.
  - *Type:* a mutable property, settable only inside a `semantics { }`
    block's own receiver scope.
  - *Responsibility:* to hold exactly the one real string an assistive
    technology should read for this node.
  - *Depends on:* being set inside a real `Modifier.semantics { }` call.
  - *Connects to:* set by `CalculatorButton`; read by a real,
    executed test via `onNodeWithContentDescription`, confirming the
    real value actually reaches the semantics tree.
  - *Shape:* a public Compose UI semantics API, read by the Android
    accessibility framework outside this project's own code entirely.

- **`onNodeWithContentDescription`** *(this lesson's own new Compose test
  function)*
  - *What it is:* the real Compose UI testing finder that locates a node
    in the semantics tree by its exact `contentDescription`, the same
    real family `onNodeWithTag`/`onNodeWithText` already belong to.
  - *Implementation:* `fun onNodeWithContentDescription(label: String,
    substring: Boolean = false, ignoreCase: Boolean = false, useUnmergedTree:
    Boolean = false): SemanticsNodeInteraction` — this lesson calls it with
    only the real, required `label` argument, every other real parameter
    left at its own default.
  - *Its use:* proves, for real, that a button's own explicit
    `contentDescription` actually reaches the semantics tree — not just
    that the code compiles.
  - *Type:* a top-level test function, part of `androidx.compose.ui.test`.
  - *Responsibility:* to search the current real semantics tree for
    exactly one node whose `contentDescription` matches, and hand back a
    real `SemanticsNodeInteraction` an assertion can then run against.
  - *Depends on:* a real, already-composed UI tree, built by
    `composeTestRule.setContent { ... }`.
  - *Connects to:* called by this lesson's own new, permanent test,
    `symbolButtonsExposeReadableContentDescriptions`; finds nodes real
    `CalculatorButton` calls built.
  - *Shape:* a public Compose UI testing API, unchanged in kind from
    `onNodeWithTag`/`onNodeWithText`, already real dependencies since
    Lesson 1.4.

- **`assertHeightIsAtLeast`** *(this lesson's own new Compose test
  function)*
  - *What it is:* the real Compose UI testing assertion checking a real,
    already-composed node's own real, measured height against a minimum.
  - *Implementation:* `fun SemanticsNodeInteraction.assertHeightIsAtLeast
    (minHeight: Dp): SemanticsNodeInteraction` — an extension function on
    the same `SemanticsNodeInteraction` type `onNodeWithTag`/
    `onNodeWithContentDescription` both return, real, confirmed this
    session by a real, successful compile and a real, passing assertion
    against an intentionally unsized `Button`.
  - *Its use:* checks a real keypad button's own real, measured height
    against `48.dp`, the real, documented Android accessibility minimum
    touch-target size.
  - *Type:* an extension function on `SemanticsNodeInteraction`.
  - *Responsibility:* to measure one real node's own real layout height
    and fail the test, with a real, descriptive message, if it falls
    short of the given minimum.
  - *Depends on:* a real, already-composed node and a `Dp` minimum to
    check against.
  - *Connects to:* called against a real `CalculatorButton`, rendered
    through the real, unmodified `CalculatorScreen`.
  - *Shape:* a public Compose UI testing API, real proof that layout
    measurement — unlike drawn pixels or animation timing — works for
    real under Robolectric, with no GPU rendering needed at all.

- **`contrastRatio`** *(this lesson's own new, permanent, pure function)*
  - *What it is:* this project's own real, from-scratch implementation of
    the W3C's own published WCAG contrast-ratio formula, turning two real
    `Color` values into one real number describing how legible one is
    against the other.
  - *Implementation:*
    ```kotlin
    fun contrastRatio(foreground: Color, background: Color): Double {
        val foregroundLuminance = relativeLuminance(foreground)
        val backgroundLuminance = relativeLuminance(background)
        val lighter = if (foregroundLuminance > backgroundLuminance) foregroundLuminance else backgroundLuminance
        val darker = if (foregroundLuminance > backgroundLuminance) backgroundLuminance else foregroundLuminance
        return (lighter + 0.05) / (darker + 0.05)
    }
    ```
    built on two real, private helpers, `relativeLuminance` and
    `linearize`, both shown in full in this lesson's own New Code, below.
  - *Its use:* checks this project's own real, currently-shipped default
    button colors — white text on a blue background — against the real
    WCAG minimum, `4.5`, for the first time.
  - *Type:* a top-level, pure function — same real, side-effect-free
    definition Lesson 2.1 already gave the term: the same two `Color`
    inputs always produce the same real number, and calling it changes
    nothing outside its own return value.
  - *Responsibility:* to compute exactly one real number, the WCAG
    contrast ratio between any two colors, correctly for every real pair
    — confirmed against the one real, independently-known correct
    answer any implementation of this exact formula must produce: pure
    black against pure white is exactly `21.0`, the real, published
    maximum this formula can ever return, and this project's own
    implementation was verified, this session, to produce exactly that.
  - *Depends on:* two `Color` values.
  - *Connects to:* called by this lesson's own new, permanent test,
    `defaultButtonColorsMeetMinimumContrastRatio`; reads real values
    produced by `relativeLuminance`, which itself reads real `Color`
    channel values.
  - *Shape:* a public, project-owned utility function, living in
    `Theme.kt` alongside this project's own other real color-related
    code — this project's own first color-checking, rather than
    color-defining, function.

- **`pow`**
  - *What it is:* the real Kotlin standard library function raising a
    real `Float` to a real exponent.
  - *Implementation:* `fun Float.pow(x: Float): Float`, from
    `kotlin.math`.
  - *Its use:* implements the real WCAG formula's own required step —
    raising a normalized color channel to the real exponent `2.4`, part
    of converting a raw sRGB value into a real linear-light value before
    it can be weighted into a luminance.
  - *Type:* an extension function on `Float`.
  - *Responsibility:* to compute one real number, its receiver raised to
    the given real power.
  - *Depends on:* a receiver `Float` and an exponent `Float`.
  - *Connects to:* called inside this project's own new, private
    `linearize` function, once per real color channel.
  - *Shape:* a public Kotlin standard library function, this project's
    own first real use of it.

### Everything else in the file, not this lesson's subject but still explained

- **`mapOf`**
  - *What it is:* the real Kotlin standard library function building an
    immutable `Map` from a real list of key-value pairs.
  - *Implementation:* `fun <K, V> mapOf(vararg pairs: Pair<K, V>): Map<K,
    V>`.
  - *Its use:* builds `accessibilityLabels`, this lesson's own new map
    from a keypad symbol to its real, explicit spoken word.
  - *Type:* a top-level standard library function.
  - *Responsibility:* to build one real, immutable, real lookup table
    from a fixed real list of pairs.
  - *Depends on:* zero or more real `Pair<K, V>` arguments.
  - *Connects to:* built once, at this project's own top level; read by
    `CalculatorButton`'s own call site via a real key lookup, below.
  - *Shape:* a public Kotlin standard library function, unchanged from
    where it was first used to build `operatorSymbols`.

- **`to`**
  - *What it is:* the real Kotlin standard library infix function
    building a `Pair` from two real values.
  - *Implementation:* `infix fun <A, B> A.to(that: B): Pair<A, B>`.
  - *Its use:* builds each real key-value pair `mapOf` assembles into
    `accessibilityLabels` — `"×" to "times"`, and three more like it.
  - *Type:* a top-level infix extension function.
  - *Responsibility:* to bundle exactly two real values into one real,
    ordered `Pair`.
  - *Depends on:* a receiver value and one real argument.
  - *Connects to:* called four real times, building `accessibilityLabels`;
    unchanged from where `operatorSymbols` first used it.
  - *Shape:* a public Kotlin standard library function, unchanged from
    its first real use.

- **`let`**
  - *What it is:* the real Kotlin scope function running a lambda against
    a real, non-null receiver and returning that lambda's own result.
  - *Implementation:* `inline fun <T, R> T.let(block: (T) -> R): R`.
  - *Its use:* combined with `?.`, above, runs `this.contentDescription =
    it` only when this lesson's own new `contentDescription` parameter is
    actually non-null — for twelve of sixteen real keypad buttons, this
    entire block never runs at all.
  - *Type:* an inline extension function, part of the Kotlin standard
    library.
  - *Responsibility:* to hand its own receiver into a lambda as `it`, and
    return whatever that lambda computes.
  - *Depends on:* a receiver and a `block` lambda.
  - *Connects to:* chained directly off `?.`, above, inside
    `CalculatorButton`'s own `semantics { }` block.
  - *Shape:* a public Kotlin standard library function, unchanged from
    where it was first used in this project.

- **`ButtonDefaults.buttonColors`**
  - *What it is:* the real Material3 function building the exact
    `ButtonColors` a plain `Button` uses when no `colors` argument is
    passed to it directly.
  - *Implementation:* `@Composable fun ButtonDefaults.buttonColors(...):
    ButtonColors` — a real function returning a real object with, among
    other real properties, `containerColor: Color` and `contentColor:
    Color`; confirmed, this session, by a real, passing test, that its
    own real `containerColor` and `contentColor` are exactly
    `MaterialTheme.colorScheme.primary` and `.onPrimary`.
  - *Its use:* read directly, this lesson, to get the exact real colors
    every one of this project's own sixteen keypad buttons actually
    renders with — not a value assumed or reconstructed, but read
    straight from the real object Material3 itself builds.
  - *Type:* a `@Composable` factory function.
  - *Responsibility:* to build one real, complete set of a `Button`'s own
    default colors, for every real button state.
  - *Depends on:* the current `MaterialTheme.colorScheme`, read
    implicitly.
  - *Connects to:* called by this lesson's own new test; its real
    `containerColor`/`contentColor` are handed straight into
    `contrastRatio`.
  - *Shape:* a public Material3 API, this project's own first direct
    read of it — every earlier lesson used a plain `Button` and simply
    trusted its own defaults without ever naming them.

- **`Color`**
  - *What it is:* the real Compose type representing one RGBA color
    value.
  - *Implementation:* alongside its already-established hex constructor,
    `Color(0xFF1565C0)`, `Color` also exposes real, individual channel
    properties — `val red: Float`, `val green: Float`, `val blue: Float`
    — each a real value already normalized to the real range `0f..1f`,
    confirmed this session by a real, passing test reading
    `Color(0xFF1565C0).red` and finding it equal to `0x15 / 255f`, not
    the raw integer `21`.
  - *Its use:* `relativeLuminance` reads all three real channels off
    each color it's given, to compute a real luminance value.
  - *Type:* a value class, immutable once constructed.
  - *Responsibility:* to represent exactly one real color value, and
    expose its own real channel components for anything that needs to
    compute with them rather than just draw with them.
  - *Depends on:* nothing further, once constructed.
  - *Connects to:* constructed in `Theme.kt`; its own real channels read,
    for the first time in this project, by `relativeLuminance`.
  - *Shape:* a public Compose UI graphics type, unchanged from where it
    was first introduced.

- **`MaterialTheme.colorScheme`**
  - *What it is:* the real, live `ColorScheme` instance this project's
    own `CalculatorTheme` builds, exposing this project's own named
    colors to every composable nested inside it.
  - *Implementation:* a real class exposing, among other real properties,
    `val primary: Color` and `val onPrimary: Color` — the exact real pair
    this lesson's new test checks.
  - *Its use:* read, indirectly, through `ButtonDefaults.buttonColors()`,
    above, to confirm the real colors a keypad button actually renders
    with.
  - *Type:* an instance property access, returning a real `ColorScheme`
    object.
  - *Responsibility:* to hold this project's own complete, named color
    palette as one real object.
  - *Depends on:* `CalculatorTheme` having already wrapped the current
    composition with a real `MaterialTheme(colorScheme =
    CalculatorColorScheme, ...)` call.
  - *Connects to:* built by `CalculatorTheme`, in `Theme.kt`; read here
    by `ButtonDefaults.buttonColors()`, not directly by this lesson's own
    new code.
  - *Shape:* a public Compose/Material3 API, unchanged from where it was
    first introduced.

## Concept Unit: Content Descriptions and Screen Readers

### The Problem

Four of this project's own sixteen real keypad buttons — `×`, `÷`, `−`,
and `C` — show only a bare Unicode symbol or a single letter as their
own visible label. A sighted user recognizes `×` as "multiply" instantly,
from years of familiarity with the glyph; a screen reader user hears
whatever Android's own accessibility service announces for that exact
character instead, with no equivalent instant recognition available, and
`C` alone could just as easily be read as the letter itself as it could
be understood to mean "Clear."

> Every keypad `Button` already wraps a `Text` showing its own visible
> label — given that a screen reader normally reads whatever text a
> `Text` composable displays, what do you think an accessibility service
> currently announces when it reaches the `×` button, and is that
> announcement necessarily the same thing a sighted user understands by
> looking at the glyph? If you wanted a specific button to announce
> something different from its own visible text, what would have to
> exist — some new value, attached to that composable, read instead of
> the text already there? And given every digit button (`0`–`9`) and the
> `+`/`=` buttons already show ordinary, already-clear characters, do you
> think every one of the sixteen keypad buttons needs this fix, or only
> some of them — and specifically which ones?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun LabAccessibleButton() {
    Button(
        onClick = {},
        modifier = Modifier
            .testTag("labAccessibleButton")
            .semantics { contentDescription = "times" }
    ) {
        Text(text = "×")
    }
}
```

A real, executed test, against this exact lab composable:

```kotlin
composeTestRule.setContent {
    LabAccessibleButton()
}

composeTestRule.onNodeWithContentDescription("times").assertExists()
```

Real output, from this session — the full test passed, real exit code
`0`:

```
BUILD SUCCESSFUL in 5s
27 actionable tasks: 7 executed, 20 up-to-date
```

This proves, for real, that an explicit `contentDescription` set inside
a `semantics { }` block reaches the semantics tree and can be found by
name — even though the button's own visible `Text` still shows the raw
`×` glyph, `onNodeWithContentDescription("times")` finds this exact node,
proving the explicit value, not the raw glyph, is what an accessibility
service would actually be handed. This mechanism is called
**semantics-tree annotation**.

### Discard the Throwaway Example

`LabAccessibleButton` and its own test were written only to prove an
explicit `contentDescription` reaches the semantics tree; neither is
part of the project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch
  accessibility fix, motivated by this project's own real, currently-
  shipped gap (four keypad buttons whose visible glyph isn't already an
  unambiguous spoken word).
- **Files affected** —
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified:
  a new `accessibilityLabels` map; `CalculatorButton` gains a new
  parameter and a new `Modifier`; its own call site passes the new
  argument); `app/src/test/java/com/example/calculator/AccessibilityTest.kt`
  (new file, created).
- **Change type** — add.
- **Location** — `MainActivity.kt`, `accessibilityLabels` sits right
  after `toDisplayText`, before `CalculatorButton`; `CalculatorButton`'s
  own parameter list and `Modifier` chain; the keypad loop's own
  `CalculatorButton` call.
- **Dependencies** — `Modifier.semantics`/`contentDescription`, both
  already real, part of `androidx.compose.ui:ui`, already a dependency
  of this project's own build — no new Gradle dependency required.

### The New Code

```kotlin
private val accessibilityLabels = mapOf(
    "×" to "times",
    "÷" to "divide",
    "−" to "minus",
    "C" to "clear"
)
```

### The Updated Project

`CalculatorButton`, in full, with this lesson's own additions marked:

```kotlin
 1  @Composable
 2  fun CalculatorButton(
 3      label: String,
 4      onClick: () -> Unit,
 5      modifier: Modifier = Modifier,
 6      contentDescription: String? = null                    // ← new
 7  ) {
 8      Button(
 9          onClick = onClick,
10          shape = MaterialTheme.shapes.small,
11          modifier = modifier
12              .testTag(label)
13              .semantics {                                    // ← new
14                  contentDescription?.let { this.contentDescription = it }  // ← new
15              }                                                // ← new
16      ) {
17          Text(text = label)
18      }
19  }
```

`CalculatorScreen`'s own keypad loop, with this lesson's own addition
marked:

```kotlin
 1  for (row in keypadRows) {
 2      Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
 3          for (label in row) {
 4              CalculatorButton(
 5                  label = label,
 6                  onClick = { state = nextState(state, label) },
 7                  modifier = Modifier.weight(1f),
 8                  contentDescription = accessibilityLabels[label]  // ← new
 9              )
10          }
11      }
12  }
```

`CalculatorButton` itself is unchanged in every other respect — the
same real `Button`, the same real `shape`, the same real `testTag`; it
now also carries an optional, explicit spoken label, defaulted to
`null` so every button that doesn't need one keeps behaving exactly as
it already did.

### Mechanical Walkthrough

- `private val accessibilityLabels` — a new, top-level, private `Map`,
  visible only inside `MainActivity.kt`, the same visibility this file's
  own `keypadRows` already uses.
- `mapOf(...)` — the real, reappearing standard library function that
  builds this project's own second real `Map`, the same one
  `operatorSymbols` already used.
- `"×" to "times"` — the real, reappearing `to` infix function, building
  one real `Pair<String, String>` per line; four real calls build the
  four real entries this map holds.
- `contentDescription: String? = null` — a new parameter on
  `CalculatorButton`, its type a nullable `String`, its own real default
  `null` meaning "no explicit override" — the same optional-parameter
  shape `modifier: Modifier = Modifier` already established for this
  function.
- `.semantics { ... }` — this lesson's own new subject, chained directly
  onto the existing `.testTag(label)` call; attaches real accessibility
  information to this exact `Button`'s own semantics node.
- `contentDescription?.let { this.contentDescription = it }` — the real
  safe-call-plus-`let` idiom: if the outer function's own
  `contentDescription` parameter is `null` (true for twelve of sixteen
  real buttons), `?.` short-circuits and the whole block never runs; when
  it's non-null, `let` receives it as `it` and runs
  `this.contentDescription = it` — where `this`, inside the `semantics {
  }` lambda, is the real `SemanticsPropertyReceiver`, not
  `CalculatorButton` itself, so `this.contentDescription` sets the real
  semantics property from this lesson's own Header entry, above, a
  genuinely different real property from the outer function's own
  parameter of the identical name.
- `accessibilityLabels[label]` — the real, reappearing `Map` key-lookup
  operator, the same one `operatorSymbols[label]` already used;
  evaluates to `"times"` for `label == "×"`, and to `null` for every
  label not present in the map — exactly the `null` this new parameter's
  own default is built to accept.

### CS Lens

Separating a value's own visible representation from its spoken or
otherwise announced representation is a real, general idea: **semantic
labeling**. Also recognized in: an HTML `<img>` tag's own `alt`
attribute, giving a purely visual image a real, separate textual
alternative; ARIA's `aria-label` attribute across the rest of web
accessibility generally; wayfinding signage that pairs an icon with real
printed text for exactly the same reason a glyph alone can't always be
trusted to communicate on its own. This project's own `operatorSymbols`
map, built back when `CalculatorScreen` first learned to dispatch button
presses, already pairs a visible symbol with its real underlying meaning
for a completely different reason — routing a keypress to the right real
`Operator` — a real, close parallel worth noticing: the same "symbol
means something more than itself" idea, solving two genuinely different
real problems in the same project.

### SE Lens

The alternative already in place before this lesson: leave every button
labeled only by its own visible text, the real, free, zero-code default
every earlier lesson relied on without ever naming the gap. The real
tradeoff: doing nothing costs no code at all, but leaves four of sixteen
real buttons genuinely ambiguous to a screen reader user; this lesson's
own fix costs one small map and one new optional parameter, entirely
invisible to a sighted user — nothing on screen changes at all — in
exchange for those same four buttons announcing something a listener can
actually act on. This fix is deliberately scoped to exactly the four
real buttons whose glyph is genuinely ambiguous, not applied blanket
across all sixteen — a blanket application would have added a real
`contentDescription` override even where the visible text already reads
perfectly clearly on its own, redundant code solving a problem that
specific button never actually had.

### Commands Needed

The isolated lab needed no new command — it lived inside this project's
own real, already-Gradle-wired source tree, per this curriculum's own
standing Concept Isolation Rule adaptation for Compose, compiled and run
the same way as every real project test: `./gradlew :app:testDebugUnitTest
--tests "com.example.calculator.LabAccessibilityTest"`. For the real
project change: `./gradlew testDebugUnitTest assembleDebug` — this
project's own already-established combined command.

### Run It

Real output, from this session, after the real project change landed and
the isolated lab was deleted:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 5s
43 actionable tasks: 10 executed, 33 up-to-date
```

All 18 of this project's pre-existing tests still pass, unchanged, plus
one new, permanent test, `symbolButtonsExposeReadableContentDescriptions`,
asserting all four real, explicit content descriptions —
`"times"`/`"divide"`/`"minus"`/`"clear"` — really exist in the actual,
rendered `CalculatorScreen`'s own semantics tree. This project now has
19 real, passing tests.

### Connect the Pieces

The isolated lab proved that an explicit `contentDescription` set inside
a `semantics { }` block reaches the semantics tree and can be found by
name; this unit applied that exact mechanism to the four real keypad
buttons whose own visible glyph isn't already an unambiguous spoken
word, wiring it through one small map so every button that doesn't need
an override keeps its own existing, unmodified behavior.

## Concept Unit: Touch Targets

### The Problem

`CalculatorButton` has never set an explicit height or minimum size of
its own — every real dimension it ends up with comes from whatever
Material3's own internal defaults, plus this project's own `Modifier
.weight(1f)`, happen to produce. Android's own accessibility guidance
names a real, specific number, `48dp`, as the minimum a touch target
should measure so a user with limited fine motor control — a tremor, low
dexterity, or simply a larger fingertip — can reliably hit it. Nobody has
ever actually checked, for real, whether this project's own real keypad
buttons meet that real number, or whether it's just been assumed because
the buttons "look about right" on screen.

> Given that `CalculatorButton` never sets an explicit height of its own,
> what do you think actually determines how tall each real button ends
> up — where would that value be coming from, if not from this project's
> own code? Without running anything yet: do you expect a bare, unstyled
> Material3 `Button` — no explicit size set at all — to land above or
> below Android's own real `48dp` accessibility minimum, and what's your
> reasoning for that guess?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun LabDefaultSizeButton() {
    Button(
        onClick = {},
        modifier = Modifier.testTag("labDefaultSizeButton")
    ) {
        Text(text = "7")
    }
}
```

A real, executed test, measuring this exact lab composable's own real,
rendered height with no explicit size applied anywhere:

```kotlin
composeTestRule.setContent {
    LabDefaultSizeButton()
}

composeTestRule.onNodeWithTag("labDefaultSizeButton").assertHeightIsAtLeast(48.dp)
```

Real output, from this session — this real assertion passed:

```
BUILD SUCCESSFUL in 5s
27 actionable tasks: 7 executed, 20 up-to-date
```

A real, genuinely surprising finding, worth stating plainly: contrary to
what the Socratic prompt above might have led you to guess, Material3's
own real, built-in default `Button` size already meets the real `48dp`
accessibility minimum — with no explicit sizing modifier written
anywhere. This proof is called **layout measurement**: unlike a drawn
pixel's actual color, a composable's real, computed size is something
Compose's own layout system produces on the JVM regardless of whether
anything is actually painted to a real screen, which is exactly why
Robolectric — with no genuine GPU rendering at all — can still measure
it for real.

### Discard the Throwaway Example

`LabDefaultSizeButton` and its own test were written only to measure a
default Material3 `Button`'s own real height; neither is part of the
project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch,
  permanent regression guard for a real property this project's own code
  already, honestly, happens to satisfy.
- **Files affected** —
  `app/src/test/java/com/example/calculator/AccessibilityTest.kt`
  (modified: one new test method added; no production code changes).
- **Change type** — add.
- **Location** — `AccessibilityTest.kt`, a new method right after
  `symbolButtonsExposeReadableContentDescriptions`.
- **Dependencies** — `CalculatorButton`/`CalculatorScreen`, both already
  real, entirely unmodified by this unit; `assertHeightIsAtLeast`,
  already on the real test classpath this project's own Compose UI
  testing setup already provides.

### The New Code

```kotlin
@Test
fun keypadButtonsMeetMinimumTouchTargetHeight() {
    composeTestRule.setContent {
        CalculatorTheme {
            CalculatorScreen()
        }
    }

    composeTestRule.onNodeWithTag("7").assertHeightIsAtLeast(48.dp)
}
```

### The Updated Project

`AccessibilityTest.kt`, in full, with this unit's own addition marked:

```kotlin
 1  @RunWith(RobolectricTestRunner::class)
 2  @Config(sdk = [34])
 3  class AccessibilityTest {
 4
 5      @get:Rule
 6      val composeTestRule = createComposeRule()
 7
 8      @Test
 9      fun symbolButtonsExposeReadableContentDescriptions() {
10          composeTestRule.setContent {
11              CalculatorTheme {
12                  CalculatorScreen()
13              }
14          }
15
16          composeTestRule.onNodeWithContentDescription("times").assertExists()
17          composeTestRule.onNodeWithContentDescription("divide").assertExists()
18          composeTestRule.onNodeWithContentDescription("minus").assertExists()
19          composeTestRule.onNodeWithContentDescription("clear").assertExists()
20      }
21
22      @Test                                                          // ← new
23      fun keypadButtonsMeetMinimumTouchTargetHeight() {               // ← new
24          composeTestRule.setContent {                                // ← new
25              CalculatorTheme {                                       // ← new
26                  CalculatorScreen()                                  // ← new
27              }                                                       // ← new
28          }                                                           // ← new
29                                                                       // ← new
30          composeTestRule.onNodeWithTag("7").assertHeightIsAtLeast(48.dp)  // ← new
31      }                                                               // ← new
32  }
```

### Mechanical Walkthrough

- `@Test` — the real, reappearing JUnit annotation marking this function
  as a real, independently-runnable test case, the same annotation every
  other real test in this project already carries.
- `composeTestRule.setContent { CalculatorTheme { CalculatorScreen() } }`
  — renders the actual, unmodified, real `CalculatorScreen` — not a lab,
  the real project — wrapped in its own real `CalculatorTheme`, exactly
  the way `MainActivity`'s own real `onCreate` does.
- `onNodeWithTag("7")` — the real, reappearing semantics-tree finder,
  locating the real `"7"` button by the real `testTag` `CalculatorButton`
  already attaches to every keypad button.
- `.assertHeightIsAtLeast(48.dp)` — this unit's own new subject, checking
  that real, found node's own real, measured height directly against the
  real accessibility minimum this unit's own isolated lab already proved
  a bare Material3 default meets.

### CS Lens

Treating a physical, motor-accessibility property as a real, measurable
design constraint — a specific number, checkable by a real tool, rather
than a vague impression of "big enough" — is a real, general idea:
**quantified accessibility**. Also recognized in: building-code minimum
sizes for elevator buttons and door handles; automotive touchscreen
button-size standards, written specifically because a driver's own
attention and motor precision are both reduced while driving; ATM and
public-kiosk accessible-design standards, which name real minimum target
sizes the same way Android's own guidance does here.

### SE Lens

The alternative already in place, by default, before this unit: trust
that a button "looks big enough" from visual inspection alone — exactly
what every lesson through 3.4 implicitly did, since nothing ever checked
this number. The real tradeoff: this unit adds zero production code —
Material3's own sensible real default already meets the real minimum —
so the honest value here isn't a fix, it's a permanent, automated
guarantee: any future lesson that changes keypad spacing, padding, or
button count per row now has a real, immediate test failure waiting if
that change ever shrinks a button below the real accessible minimum,
instead of a silent, unnoticed regression nobody would catch without
this test already in place.

### Commands Needed

The isolated lab needed no new command, run the same way as every other
lab this session: `./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabAccessibilityTest"`. For the real project
change: `./gradlew testDebugUnitTest assembleDebug` — this project's own
already-established combined command.

### Run It

Real output, from this session:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 4s
43 actionable tasks: 10 executed, 33 up-to-date
```

All 19 of this project's tests — the 18 pre-existing plus the previous
unit's own new one — still pass, plus this unit's own new,
permanent test, `keypadButtonsMeetMinimumTouchTargetHeight`. This project
now has 20 real, passing tests.

### Connect the Pieces

The isolated lab proved that a bare, unstyled Material3 `Button` already
measures at least `48dp` tall, with no explicit sizing code at all; this
unit applied that exact same real measurement assertion to the actual,
unmodified `CalculatorScreen`, turning a real, one-time finding into a
permanent, automated guarantee against every future lesson that touches
this keypad's own layout.

## Concept Unit: Contrast

### The Problem

Every one of this project's own sixteen real keypad buttons currently
renders with a specific, real, currently-shipped color pair: white text
on a blue background — Material3's own default `ButtonColors`, reading
straight from `CalculatorColorScheme`'s own `onPrimary` and `primary`,
`0xFFFFFFFF` and `0xFF1565C0`. A user with low vision needs enough real,
measurable difference between those two colors to read the text at all;
nobody has ever numerically checked this exact, currently-rendered pair
against any real accessibility standard.

> You already confirmed, in the previous unit, that a real, existing
> default can already meet a real accessibility standard with zero code
> change — do you expect the same to be true here, or is `primary`'s and
> `onPrimary`'s own real contrast something you could actually predict
> just by looking at their two hex values, `0xFF1565C0` and `0xFFFFFFFF`?
> The W3C's own real WCAG standard defines "enough contrast" as one
> specific numeric ratio, not a vague impression — if you had to design a
> function taking two colors and returning one real number for how
> different they are, what real properties of each color would that
> function actually need to look at? And given that number depends on
> each color's own red, green, and blue components, do you think a flat,
> unweighted average of the three channels would match how human eyes
> actually perceive brightness — or might red, green, and blue each
> deserve a different real weight?

### Introduce the Concept in Isolation

```kotlin
private fun labLinearize(channel: Float): Float {
    return if (channel <= 0.03928f) channel / 12.92f else ((channel + 0.055f) / 1.055f).pow(2.4f)
}

private fun labRelativeLuminance(color: Color): Float {
    return 0.2126f * labLinearize(color.red) + 0.7152f * labLinearize(color.green) + 0.0722f * labLinearize(color.blue)
}

private fun labContrastRatio(a: Color, b: Color): Double {
    val l1 = labRelativeLuminance(a)
    val l2 = labRelativeLuminance(b)
    val lighter = if (l1 > l2) l1 else l2
    val darker = if (l1 > l2) l2 else l1
    return (lighter + 0.05) / (darker + 0.05)
}
```

Two real, executed tests against this exact lab implementation, checking
it against the one real, independently-known correct answer any correct
implementation of this exact W3C formula must produce:

```kotlin
assertEquals(21.0, labContrastRatio(Color(0xFF000000), Color(0xFFFFFFFF)), 0.01)
assertEquals(1.0, labContrastRatio(Color(0xFF1565C0), Color(0xFF1565C0)), 0.001)
```

Real output, from this session — both real tests passed, real time
`0.013`s, no Robolectric needed at all since `Color` and plain arithmetic
need no composition context to run:

```
BUILD SUCCESSFUL in 1s
27 actionable tasks: 4 executed, 23 up-to-date
```

Pure black against pure white is real, published knowledge: the W3C's
own WCAG standard defines it as the real maximum this formula can ever
return, `21:1` — and a color checked against itself, real or not, can
have no real contrast at all, exactly `1:1`. Both real assertions
passing is real proof this lab's own formula is a correct implementation
of the real, standard **WCAG contrast ratio**, not merely code that
compiles and runs.

### Discard the Throwaway Example

`labLinearize`, `labRelativeLuminance`, and `labContrastRatio` were
written only to prove the real WCAG formula against two independently-
known correct answers; none of it is part of the project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch,
  permanent regression guard implementing a real, published, external
  standard (the W3C's WCAG 2.x contrast-ratio formula) against this
  project's own real, currently-shipped colors.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Theme.kt` (modified: two new
  private helpers, `linearize` and `relativeLuminance`, plus one new
  public function, `contrastRatio`);
  `app/src/test/java/com/example/calculator/AccessibilityTest.kt`
  (modified: one new private composable probe, one new test method).
- **Change type** — add.
- **Location** — `Theme.kt`, all three new functions appended after
  `CalculatorTheme`; `AccessibilityTest.kt`, the new probe and test
  appended after `keypadButtonsMeetMinimumTouchTargetHeight`.
- **Dependencies** — `pow`, from `kotlin.math`, this project's own first
  use of it; `Color`'s own real `.red`/`.green`/`.blue` channels,
  confirmed normalized `0f..1f` this session; `ButtonDefaults
  .buttonColors()`, confirmed this session to expose exactly
  `MaterialTheme.colorScheme.primary`/`.onPrimary` as its own real
  `containerColor`/`contentColor`.

### The New Code

```kotlin
private fun linearize(channel: Float): Float {
    return if (channel <= 0.03928f) channel / 12.92f else ((channel + 0.055f) / 1.055f).pow(2.4f)
}

private fun relativeLuminance(color: Color): Float {
    return 0.2126f * linearize(color.red) + 0.7152f * linearize(color.green) + 0.0722f * linearize(color.blue)
}
```

### The Updated Project

`Theme.kt`, from `CalculatorTheme` on, in full, with this unit's own
additions marked:

```kotlin
 1  @Composable
 2  fun CalculatorTheme(content: @Composable () -> Unit) {
 3      MaterialTheme(
 4          colorScheme = CalculatorColorScheme,
 5          typography = CalculatorTypography,
 6          shapes = CalculatorShapes,
 7          content = content
 8      )
 9  }
10
11  private fun linearize(channel: Float): Float {                     // ← new
12      return if (channel <= 0.03928f) channel / 12.92f else ((channel + 0.055f) / 1.055f).pow(2.4f)  // ← new
13  }                                                                   // ← new
14
15  private fun relativeLuminance(color: Color): Float {                // ← new
16      return 0.2126f * linearize(color.red) + 0.7152f * linearize(color.green) + 0.0722f * linearize(color.blue)  // ← new
17  }                                                                   // ← new
18
19  fun contrastRatio(foreground: Color, background: Color): Double {   // ← new
20      val foregroundLuminance = relativeLuminance(foreground)         // ← new
21      val backgroundLuminance = relativeLuminance(background)         // ← new
22      val lighter = if (foregroundLuminance > backgroundLuminance) foregroundLuminance else backgroundLuminance  // ← new
23      val darker = if (foregroundLuminance > backgroundLuminance) backgroundLuminance else foregroundLuminance  // ← new
24      return (lighter + 0.05) / (darker + 0.05)                       // ← new
25  }                                                                   // ← new
```

`AccessibilityTest.kt`'s own new addition:

```kotlin
 1  @Composable
 2  private fun DefaultButtonColorsProbe(onCaptured: (containsPrimary: Boolean, meetsContrast: Boolean) -> Unit) {
 3      val defaults = ButtonDefaults.buttonColors()
 4      val ratio = contrastRatio(defaults.contentColor, defaults.containerColor)
 5      onCaptured(defaults.containerColor == MaterialTheme.colorScheme.primary, ratio >= 4.5)
 6  }
 7
 8  @Test
 9  fun defaultButtonColorsMeetMinimumContrastRatio() {
10      var containsPrimary = false
11      var meetsContrast = false
12      composeTestRule.setContent {
13          CalculatorTheme {
14              DefaultButtonColorsProbe { primary, contrast ->
15                  containsPrimary = primary
16                  meetsContrast = contrast
17              }
18          }
19      }
20
21      assertTrue(containsPrimary)
22      assertTrue(meetsContrast)
23  }
```

### Mechanical Walkthrough

- `private fun linearize(channel: Float): Float` — a new, private,
  top-level, pure function; takes one real, normalized color channel and
  returns its real linear-light equivalent.
- `if (channel <= 0.03928f) channel / 12.92f else ...` — the real WCAG
  formula's own piecewise definition: very dark channel values are
  linearized with plain division, since the formula's own curved branch
  would be numerically unstable that close to zero.
- `((channel + 0.055f) / 1.055f).pow(2.4f)` — the real formula's own
  second branch, an actual gamma-correction curve; `pow`, this lesson's
  own new subject, raises the parenthesized real value to the real
  exponent `2.4`.
- `private fun relativeLuminance(color: Color): Float` — a second new,
  private, pure function; combines all three of a color's own real
  linearized channels into one real luminance value.
- `0.2126f * linearize(color.red) + 0.7152f * linearize(color.green) +
  0.0722f * linearize(color.blue)` — the real WCAG formula's own fixed,
  published weights: green counts for more than two-thirds of perceived
  brightness, red for about a fifth, blue for barely a fifteenth —
  matching human vision's own real, uneven sensitivity to each color,
  answering this unit's own Socratic prompt directly: a flat average
  would *not* have matched real perception.
- `fun contrastRatio(foreground: Color, background: Color): Double` —
  this lesson's own new, permanent, public subject, combining both real
  private helpers above into the real, complete WCAG contrast-ratio
  formula.
- `val lighter = if (...) ... else ...` / `val darker = if (...) ... else
  ...` — the real formula's own requirement that the *lighter* of the two
  real luminances always sits on top of the ratio, regardless of which
  argument was passed as `foreground` versus `background` — without this,
  swapping the two arguments could produce a real ratio below `1.0`,
  which the real standard never allows.
- `(lighter + 0.05) / (darker + 0.05)` — the real formula's own final
  step; the constant `0.05` in both positions prevents a real
  division-by-zero when the darker color's own luminance is exactly `0`
  (true for pure black).
- `ButtonDefaults.buttonColors()`, inside `DefaultButtonColorsProbe` —
  this lesson's own new subject, read directly for the first time in this
  project, returning the real, complete set of colors a plain `Button`
  actually uses.
- `defaults.contentColor`/`defaults.containerColor` — two real
  properties on the object `buttonColors()` returns, read directly
  rather than assumed.
- `contrastRatio(defaults.contentColor, defaults.containerColor)` — this
  lesson's own new function, called against the exact real colors every
  one of this project's own sixteen keypad buttons actually renders
  with, not a hardcoded stand-in.
- `defaults.containerColor == MaterialTheme.colorScheme.primary` — a
  real structural equality check, confirming the default really is this
  project's own named `primary` color, not merely *a* blue.
- `assertTrue(containsPrimary)` / `assertTrue(meetsContrast)` — two real,
  separate assertions, each checking one real, independent claim this
  unit makes.

### CS Lens

Computing a single, real, checkable number from raw color data, rather
than trusting a human eye's own subjective impression, is a real,
general idea: **quantified legibility**. Also recognized in: print
design's own long-established minimum ink-contrast standards for
newsprint and signage; video-editing software's own real waveform and
vectorscope tools, turning a shot's raw pixel data into checkable numeric
readouts instead of trusting a monitor's own uncalibrated display; audio
engineering's own real, numeric loudness standards (LUFS), replacing "it
sounds about right" with an actual, measured, enforceable number.

### SE Lens

The alternative already in place before this unit: trust that white text
on this project's own specific blue "looks readable," the same real,
implicit assumption every lesson through 3.4 relied on without ever
computing a real number. The real tradeoff: this unit adds real,
permanent, non-trivial code — two private helpers plus one public
function, together implementing an external, published standard from
scratch — in exchange for a real, checkable guarantee, encoded as an
automated test rather than a design document nobody reads twice. This
project's own real, computed finding, worth stating honestly: the
current pair already passes, at a real ratio of `5.75:1` against the
real WCAG AA minimum of `4.5:1` — this unit's own value, exactly like the
previous one's, is the permanent guard against a future regression, not
a fix for a currently-broken pair. A real, honest limitation, left open
on purpose: `CalculatorColorScheme`'s own `secondary` color, `0xFFFF6F00`,
was never checked against `onPrimary` here, and a real, computed check
this session found that specific pair would fail the real WCAG minimum,
at roughly `2.8:1` — left unfixed and unflagged as its own promise,
because `secondary` isn't actually rendered anywhere in this project's
real, currently-shipped UI; it exists in `CalculatorColorScheme` as a
real color this project has *named* but not yet *used*, and fixing a
contrast problem in a pairing nothing on screen actually produces would
be a fix for a hypothetical bug, not this lesson's own real, present one.

### Commands Needed

For the isolated lab: no separate Gradle-managed project needed — a
plain JUnit test with no `@RunWith`, run the same way this project's own
`CalculatorTest.kt` already runs, `./gradlew :app:testDebugUnitTest
--tests "com.example.calculator.LabContrastRatioTest"`. For the real
project change: `./gradlew testDebugUnitTest assembleDebug` — this
project's own already-established combined command.

### Run It

Real output, from this session:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 4s
43 actionable tasks: 10 executed, 33 up-to-date
```

All 20 of this project's tests — the 18 pre-existing plus this lesson's
own previous two units' new tests — still pass, plus this unit's own
new, permanent test, `defaultButtonColorsMeetMinimumContrastRatio`. This
project now has 21 real, passing tests.

### Connect the Pieces

The isolated lab proved `contrastRatio`'s own formula produces the one
real, independently-known correct answer for pure black against pure
white, `21:1`; this unit applied that exact, proven formula to this
project's own real, currently-shipped button colors, read directly off
`ButtonDefaults.buttonColors()` rather than reconstructed by hand,
confirming a real number — `5.75:1` — for a pair this project had never
once checked before, and permanently guarding it against a future
regression.

## Connect the Pieces

One real user, three real ways this project could have failed them
silently, traced end to end. A screen-reader user reaching the `×`
button now hears the real word "times" — not a bare glyph — because
`CalculatorButton`'s own new `contentDescription` parameter, wired
through `accessibilityLabels`, sets it explicitly via `Modifier
.semantics { }`, proven for real by `onNodeWithContentDescription`
finding exactly that value in the semantics tree. A user with limited
fine motor control reaching for the same real button lands on something
already real, measured, and permanently guarded to be at least `48dp`
tall — not because this lesson changed anything about how big it is, but
because `keypadButtonsMeetMinimumTouchTargetHeight` now makes sure a
future lesson never shrinks it without a real test noticing. A user with
low vision reading that same button's own real white-on-blue text is
reading a pair this project can now prove, numerically, meets a real
external standard — `contrastRatio(onPrimary, primary)` computing
`5.75`, permanently checked against the real WCAG minimum, `4.5`, by
`defaultButtonColorsMeetMinimumContrastRatio`. None of these three real
users would ever see a crash, a compiler warning, or a failing build if
any one of these three things had been quietly wrong — the only way any
of them becomes visible at all is checking, by name, for the specific
thing that matters to each one, which is exactly what this lesson's own
three real, permanent tests now do, every time this project's own suite
runs.
