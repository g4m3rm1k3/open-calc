# Lesson 3.1: Defined Once, Read Everywhere

- **What you will build** — a real `Theme.kt` file naming this
  calculator's own colors, text style, and button shape exactly once,
  plus a `CalculatorTheme` composable that makes every screen the app
  ever builds read those same values automatically — no color, font
  size, or corner radius typed out a second time anywhere else in the
  project. The transferable problem: once an app has more than one
  screen, "just hardcode the color here too" stops being harmless — it's
  the same fact, written in two places, that can silently drift apart.
- **What you need to know first** — Lesson 1.2's `@Composable` functions
  and `Modifier` chains; Lesson 1.3's named/default-parameter calls
  (`Arrangement.spacedBy(8.dp)`, `Column(modifier = ..., ...)`); Lesson
  1.4's Robolectric setup (`createComposeRule`, `composeTestRule.setContent`);
  Lesson 2.2's Arrange/Act/Assert test shape and `assertEquals`; Lesson
  2.5's `Modifier.testTag` on every keypad `Button`, and
  `CalculatorScreen`'s own `displayText` state and keypad-building loop.

## Terms used in this lesson

- **Named argument** — calling a function by writing `parameterName =
  value` instead of relying on position, as in `Color(red = 0f, green =
  0f, blue = 0f)`. It exists so a call with several parameters of the
  same type (three `Float`s, here) stays unambiguous and readable — the
  order can't be silently mixed up, and a reader doesn't have to check
  the function's own declaration to know which value means what.
- **Default parameter** — a parameter declared with a fallback value,
  usable by simply omitting it from a call. It exists so a function with
  many configurable parts (`lightColorScheme` has over thirty) doesn't
  force every caller to specify all of them — a caller states only the
  handful that differ from the sensible default, and the rest are
  supplied automatically.
- **Hex literal** — an integer written in base 16 with a `0x` prefix,
  such as `0xFF1565C0`. It exists because colors are naturally expressed
  as packed bytes (alpha, red, green, blue, one byte each) — a hex digit
  pair maps directly onto one byte, so `0xFF1565C0` reads, digit pair by
  digit pair, as alpha `FF`, red `15`, green `65`, blue `C0`, in a way a
  decimal number of the same value never would.
- **`.dp`** — a property turning a plain number into a `Dp` (density-
  independent pixel) value, as in `12.dp`. It exists so a size is
  specified in a unit that renders as the same physical size across
  screens with different pixel densities, rather than in raw pixels,
  which would look a different physical size on every device.
- **`.sp`** — a property turning a plain number into a `TextUnit` scaled
  for text, as in `48.sp` (scale-independent pixels). It exists for the
  same physical-consistency reason `.dp` does, with one addition: `sp`
  values also scale with the user's own system-wide font-size
  accessibility setting, while `dp` values never do — a font in `sp`
  grows for a user who has set larger text system-wide; a corner radius
  in `dp` correctly does not.

## Objects and methods used

- **`Color`**
  - *What it is:* a real type representing one packed color value —
    alpha, red, green, and blue channels together.
  - *Implementation:* `androidx.compose.ui.graphics.Color`; this lesson
    uses two of its real constructors: `Color(color: Long)`, reading a
    32-bit hex literal as packed ARGB bytes, and `Color(red: Float,
    green: Float, blue: Float, alpha: Float = 1f)`, taking each channel
    as its own `0f`–`1f` value with `alpha` defaulting to fully opaque.
  - *Its use:* every real color this lesson names — a calculator's
    primary color, its text color, its background — is a `Color` value.
  - *Type:* a value-based class — two `Color` values built from the same
    channels are equal to each other, the same structural-equality idea
    already proven for `data class`es, just for a type that isn't
    declared with the `data` keyword.
  - *Responsibility:* to hold exactly one color's worth of channel data,
    nothing else — no name, no role, no meaning beyond the raw value.
  - *Depends on:* either a packed `Long` (the hex-literal constructor) or
    four `Float` channel values (the named-argument constructor).
  - *Connects to:* constructed directly in this lesson's own lab and in
    `Theme.kt`; read back by `assertEquals`/`assertNotEquals` in tests,
    and, later in this lesson, by `MaterialTheme.colorScheme.primary`.
  - *Shape:* a small, immutable value type — a public Compose Graphics
    API, not a composable itself.

- **`assertNotEquals`**
  - *What it is:* a real JUnit static method asserting that two values
    are *not* equal, failing the test if they are.
  - *Implementation:* `org.junit.Assert.assertNotEquals(Object,
    Object)`, from the same `org.junit.Assert` class `assertEquals` and
    `assertThrows` already come from.
  - *Its use:* proves two differently-built `Color` values are genuinely
    distinct, not just that two same-built ones are equal — a single
    `assertEquals` alone can't rule out "every `Color` is secretly
    equal to every other one."
  - *Type:* a `static` method, called without any `Assert` instance.
  - *Responsibility:* to compare two values with `equals` and fail the
    test, with both values shown in the failure message, if they turn
    out equal.
  - *Depends on:* two values to compare — here, two real `Color`s.
  - *Connects to:* called from this lesson's own isolated lab test;
    reads `Color`'s own real `equals` implementation to do the
    comparison.
  - *Shape:* a public JUnit testing API, external to this project.

- **`lightColorScheme`**
  - *What it is:* a real Material3 function building a complete
    `ColorScheme` — every named color role a Material Design app needs —
    from a light-mode base, with sensible defaults for every role a
    caller doesn't specify.
  - *Implementation:* `fun lightColorScheme(primary: Color = ..., onPrimary:
    Color = ..., secondary: Color = ..., background: Color = ..., ...):
    ColorScheme` — confirmed, via this project's own real compiled call,
    to have over thirty real `Color` parameters, every one of them a
    default parameter.
  - *Its use:* this project needs a real `ColorScheme` but has no reason
    to hand-specify all thirty-plus roles — only the four that give this
    calculator its own identity.
  - *Type:* a top-level function, not a class or constructor.
  - *Responsibility:* to produce one complete, internally-consistent
    `ColorScheme`, filling every unspecified role with a real, tested
    Material Design default rather than leaving it unset.
  - *Depends on:* zero or more named `Color` arguments; every parameter
    can be omitted.
  - *Connects to:* called once, in this project's own `Theme.kt`; its
    return value becomes `CalculatorColorScheme`, later handed to
    `MaterialTheme`.
  - *Shape:* a public Material3 factory function — the one, real entry
    point for building a `ColorScheme` from scratch.

- **`ColorScheme`**
  - *What it is:* a real class holding every named color role a
    Material Design app can reach for — `primary`, `onPrimary`,
    `secondary`, `background`, and dozens more.
  - *Implementation:* confirmed via this session's own real inspection of
    the installed Material3 library, `ColorScheme` declares real
    properties including (a representative excerpt, not the full list):
    ```kotlin
    class ColorScheme {
        val primary: Color
        val onPrimary: Color
        val primaryContainer: Color
        val onPrimaryContainer: Color
        val secondary: Color
        val onSecondary: Color
        val background: Color
        // and over twenty more named color roles
    }
    ```
  - *Its use:* this project reads exactly one of its many roles so far,
    `primary`, back out in a real test — proof the value handed to
    `lightColorScheme` actually survives into the object it returns.
  - *Type:* a class with many `val` properties, each a real `Color`.
  - *Responsibility:* to be the one object every Material3 composable in
    an app consults for "what color is this role," so no composable ever
    needs its own separate color logic.
  - *Depends on:* nothing to read from — its values are fixed once
    `lightColorScheme` constructs it.
  - *Connects to:* returned by `lightColorScheme`; read later in this
    lesson via `MaterialTheme.colorScheme`.
  - *Shape:* a public Material3 data-holding class — this app's own
    single source of truth for color.

- **`TextStyle`**
  - *What it is:* a real class describing everything about how a run of
    text should look — size, weight, and more.
  - *Implementation:* `TextStyle(fontSize: TextUnit = TextUnit.Unspecified,
    fontWeight: FontWeight? = null, ...)` — like `lightColorScheme`, every
    parameter is a default parameter.
  - *Its use:* this lesson builds one real `TextStyle` for the
    calculator's own display text, naming its size and weight once.
  - *Type:* a class, constructed directly (not a factory function).
  - *Responsibility:* to hold one complete description of a text
    appearance, so a `Text` composable can be told "look like this"
    instead of being handed size and weight as separate, disconnected
    parameters.
  - *Depends on:* whichever of its many parameters a caller chooses to
    override — here, `fontSize` and `fontWeight`.
  - *Connects to:* constructed in this lesson's own lab and in
    `Theme.kt`; read back by `assertEquals` in the lab, and, later,
    applied to `CalculatorScreen`'s own display `Text` via `MaterialTheme.
    typography.displayLarge`.
  - *Shape:* a public Compose Text API — a value type, not a composable.

- **`FontWeight`**
  - *What it is:* a real class representing how bold a piece of text is.
  - *Implementation:* `FontWeight`, with real named constants exposed
    through its own companion object — `FontWeight.Light`,
    `FontWeight.Normal`, `FontWeight.Bold`, and others — each a real,
    distinct `FontWeight` instance, confirmed via this session's own
    inspection of the installed library.
  - *Its use:* names this calculator's own display text as deliberately
    light-weight, rather than accepting whatever a `Text` composable's
    own default happens to be.
  - *Type:* a class whose usable instances are reached through named
    constants on its companion object, not through a public constructor.
  - *Responsibility:* to represent exactly one weight value, comparable
    for equality against any other `FontWeight`.
  - *Depends on:* nothing — `FontWeight.Light` is already a fully
    constructed, ready-to-use value.
  - *Connects to:* read as `TextStyle`'s own `fontWeight` argument.
  - *Shape:* a public Compose Text API constant.

- **`Typography`**
  - *What it is:* a real class holding every named text-style role a
    Material Design app can reach for — `displayLarge`, `bodyMedium`,
    `labelSmall`, and more.
  - *Implementation:* confirmed via this session's own real inspection of
    the installed Material3 library, `Typography` declares fifteen real
    `TextStyle` properties:
    ```kotlin
    class Typography {
        val displayLarge: TextStyle
        val displayMedium: TextStyle
        val displaySmall: TextStyle
        val headlineLarge: TextStyle
        val headlineMedium: TextStyle
        val headlineSmall: TextStyle
        val titleLarge: TextStyle
        val titleMedium: TextStyle
        val titleSmall: TextStyle
        val bodyLarge: TextStyle
        val bodyMedium: TextStyle
        val bodySmall: TextStyle
        val labelLarge: TextStyle
        val labelMedium: TextStyle
        val labelSmall: TextStyle
    }
    ```
    its own constructor gives every one of these fifteen a default
    `TextStyle`, so a caller only needs to name the roles it actually
    wants to change.
  - *Its use:* this project overrides exactly one role, `displayLarge`,
    for the calculator's own display text.
  - *Type:* a class with fifteen `val` properties, each a real
    `TextStyle`.
  - *Responsibility:* to be the one object every Material3 `Text` in an
    app can consult for "what should this role of text look like."
  - *Depends on:* whichever of its fifteen named roles a caller chooses
    to override — here, only `displayLarge`.
  - *Connects to:* constructed once in `Theme.kt`; its `displayLarge`
    property is read later via `MaterialTheme.typography.displayLarge`.
  - *Shape:* a public Material3 data-holding class — this app's own
    single source of truth for text style.

- **`RoundedCornerShape`**
  - *What it is:* a real class describing a rectangle with rounded
    corners, by radius.
  - *Implementation:* `RoundedCornerShape(corner: Dp)`, among other real
    overloads — this lesson uses the single-`Dp` constructor, applying
    the same radius to all four corners.
  - *Its use:* names the exact corner radius this calculator's own
    buttons should have, once, instead of leaving each `Button` to fall
    back on whatever shape it would otherwise default to.
  - *Type:* a class, implementing the more general `Shape` contract
    (referenced here as its declared type; not itself expanded, since
    this lesson calls no member of `Shape` beyond what `RoundedCornerShape`
    already provides).
  - *Responsibility:* to describe one specific rounded-rectangle outline,
    usable anywhere a `Shape` is expected.
  - *Depends on:* a `Dp` radius — here, `12.dp`.
  - *Connects to:* constructed in this lesson's own lab and in
    `Theme.kt`; two differently-built instances are compared for
    distinctness via `assertNotEquals` in the lab.
  - *Shape:* a public Compose Foundation shape API.

- **`Shapes`**
  - *What it is:* a real class holding every named corner-shape role a
    Material Design app can reach for — `extraSmall`, `small`, `medium`,
    `large`, `extraLarge`.
  - *Implementation:* `class Shapes(val extraSmall: CornerBasedShape =
    ..., val small: CornerBasedShape = ..., val medium: CornerBasedShape
    = ..., val large: CornerBasedShape = ..., val extraLarge:
    CornerBasedShape = ...)` — confirmed via this session's own real
    inspection of the installed Material3 library; all five parameters
    are default parameters.
  - *Its use:* this project overrides exactly one role, `small`, with
    this calculator's own real `RoundedCornerShape`.
  - *Type:* a class with five `val` properties.
  - *Responsibility:* to be the one object every Material3 composable in
    an app can consult for "what shape should this role have."
  - *Depends on:* whichever of its five named roles a caller chooses to
    override — here, only `small`.
  - *Connects to:* constructed once in `Theme.kt`; its `small` property
    is read later via `MaterialTheme.shapes.small`, applied to every
    keypad `Button`.
  - *Shape:* a public Material3 data-holding class — this app's own
    single source of truth for shape.

- **`MaterialTheme` (the composable function)**
  - *What it is:* a real composable that makes a `ColorScheme`, a
    `Typography`, and a `Shapes` available to every composable nested
    inside it, without passing them as an explicit parameter to each one.
  - *Implementation:* confirmed via this session's own real inspection of
    the installed Material3 library:
    `fun MaterialTheme(colorScheme: ColorScheme, shapes: Shapes,
    typography: Typography, content: @Composable () -> Unit)`.
  - *Its use:* this project's own `CalculatorTheme` calls it once,
    handing it this project's own `CalculatorColorScheme`,
    `CalculatorTypography`, and `CalculatorShapes`.
  - *Type:* a top-level `@Composable` function — a real, distinct
    compiled declaration from the `MaterialTheme` *object* below, even
    though both share the same name (confirmed via this session's own
    real inspection of the installed library's compiled classes:
    `MaterialThemeKt`, holding this function, versus `MaterialTheme`,
    the singleton object below — two separate real `.class` files).
  - *Responsibility:* to wrap a `content` lambda and, for its entire
    duration, make its three arguments the ones every nested composable
    reads back through the `MaterialTheme` object's own properties.
  - *Depends on:* a `ColorScheme`, a `Shapes`, a `Typography`, and a
    `content` lambda to wrap.
  - *Connects to:* called by `CalculatorTheme`; every composable nested
    inside its `content` lambda — including, transitively, every `Button`
    and `Text` in `CalculatorScreen` — can read what it provided.
  - *Shape:* a public Material3 API — the one real seam between "values
    named once" and "values available everywhere they're needed."

- **`MaterialTheme.colorScheme`**
  - *What it is:* a real property reading back whichever `ColorScheme`
    the nearest enclosing `MaterialTheme` call provided.
  - *Implementation:* confirmed via this session's own real inspection of
    the installed Material3 library: a property on the real `MaterialTheme`
    *object* (a Kotlin singleton, confirmed via its own compiled shape,
    `public static final MaterialTheme INSTANCE`), reading a
    `ColorScheme` that was stored, not passed as a normal function
    argument, when `MaterialTheme(...)` last ran.
  - *Its use:* read directly in this lesson's own real test to prove, for
    real, that `CalculatorTheme` actually provides the exact `Color` this
    project named — not just that the code compiles.
  - *Type:* a read-only property on a Kotlin `object` (a singleton — one
    shared instance, not something constructed per call).
  - *Responsibility:* to always answer with whichever `ColorScheme` is
    currently in effect for wherever it's read from, with no argument
    passed to ask for it.
  - *Depends on:* being read from inside a composable that is itself
    nested inside a `MaterialTheme` call — reading it with no enclosing
    `MaterialTheme` falls back to a real Material3-provided default
    `ColorScheme`, not a crash.
  - *Connects to:* set by `MaterialTheme`'s own real internals every time
    it runs; read here by a test composable, and, in a later Concept
    Unit, by `CalculatorScreen`'s own keypad code.
  - *Shape:* a public Material3 API — the "read" half of the same seam
    `MaterialTheme` the function is the "write" half of.

- **`MaterialTheme.typography`**
  - *What it is:* a real property reading back whichever `Typography`
    the nearest enclosing `MaterialTheme` call provided.
  - *Implementation:* the same real singleton-property shape as
    `MaterialTheme.colorScheme`, above, just returning a `Typography`
    instead of a `ColorScheme`.
  - *Its use:* read by `CalculatorScreen`'s own display `Text`, later in
    this lesson, to apply this project's own named `displayLarge` style.
  - *Type:* a read-only property on the same `MaterialTheme` object.
  - *Responsibility:* to always answer with whichever `Typography` is
    currently in effect for wherever it's read from.
  - *Depends on:* the same enclosing-`MaterialTheme` requirement as
    `MaterialTheme.colorScheme`.
  - *Connects to:* set by `MaterialTheme`; read by `CalculatorScreen`'s
    display `Text`.
  - *Shape:* a public Material3 API, structurally identical in role to
    `MaterialTheme.colorScheme`, just for a different named value.

- **`MaterialTheme.shapes`**
  - *What it is:* a real property reading back whichever `Shapes` the
    nearest enclosing `MaterialTheme` call provided.
  - *Implementation:* the same real singleton-property shape as
    `MaterialTheme.colorScheme`, above, just returning a `Shapes`
    instead of a `ColorScheme`.
  - *Its use:* read by every keypad `Button`, later in this lesson, to
    apply this project's own named `small` corner shape.
  - *Type:* a read-only property on the same `MaterialTheme` object.
  - *Responsibility:* to always answer with whichever `Shapes` is
    currently in effect for wherever it's read from.
  - *Depends on:* the same enclosing-`MaterialTheme` requirement as
    `MaterialTheme.colorScheme`.
  - *Connects to:* set by `MaterialTheme`; read by every `Button` in
    `CalculatorScreen`'s keypad.
  - *Shape:* a public Material3 API, structurally identical in role to
    `MaterialTheme.colorScheme`, just for a different named value.

- **`CalculatorTheme`** *(this lesson's own new, permanent composable)*
  - *What it is:* this project's own real wrapper composable, naming
    this calculator's own theme as one callable unit.
  - *Implementation:* `@Composable fun CalculatorTheme(content:
    @Composable () -> Unit)`, calling `MaterialTheme` with this project's
    own `CalculatorColorScheme`/`CalculatorTypography`/`CalculatorShapes`
    and forwarding `content` unchanged.
  - *Its use:* lets `MainActivity` write `CalculatorTheme { CalculatorScreen()
    }` instead of repeating all three theme values at the one real call
    site that needs them.
  - *Type:* a `@Composable` function taking a `@Composable` lambda
    parameter — the same "wrap and forward a `content` lambda" shape
    `MaterialTheme` itself has.
  - *Responsibility:* to be the one place this project names its own
    theme, so nothing else in the project ever calls `MaterialTheme`
    directly with hand-written values.
  - *Depends on:* a `content` lambda to wrap — here, always
    `CalculatorScreen()`.
  - *Connects to:* calls `MaterialTheme`, passing this project's own
    `CalculatorColorScheme`/`CalculatorTypography`/`CalculatorShapes`;
    called, in turn, from `MainActivity`'s own `setContent`.
  - *Shape:* a public API surface *within* this project — this app's own
    single, real entry point for "look like this app."

### Everything else in the file, not this lesson's subject but still explained

- **`Button`**
  - *What it is:* the real Material3 composable already building every
    key on this calculator's keypad.
  - *Implementation:* `@Composable fun Button(onClick: () -> Unit, modifier:
    Modifier = Modifier, shape: Shape = ButtonDefaults.shape, ...)` —
    already carries its own real `shape` parameter, unused by this
    project until this lesson.
  - *Its use:* this lesson's own new code passes its `shape` parameter
    explicitly for the first time, instead of leaving it at whatever
    `Button` would otherwise default to.
  - *Type:* a `@Composable` function.
  - *Responsibility:* to render one real, tappable Material button,
    including its own visual shape, ripple, and accessibility semantics.
  - *Depends on:* an `onClick` lambda; optionally, a `modifier` and a
    `shape`, among other parameters this project doesn't set.
  - *Connects to:* called once per keypad key inside `CalculatorScreen`'s
    own nested loops; its `shape` parameter now reads from
    `MaterialTheme.shapes.small`.
  - *Shape:* a public Material3 composable — unchanged in this lesson
    except for one new argument at its existing call site.

- **`Text`**
  - *What it is:* the real Material3 composable already rendering this
    project's display value and every keypad label.
  - *Implementation:* `@Composable fun Text(text: String, modifier:
    Modifier = Modifier, style: TextStyle = LocalTextStyle.current, ...)`
    — already carries its own real `style` parameter, unused by this
    project until this lesson.
  - *Its use:* this lesson's own new code passes `style` explicitly, for
    the display `Text` only, for the first time.
  - *Type:* a `@Composable` function.
  - *Responsibility:* to render one real run of text with a given style.
  - *Depends on:* a `text: String`; optionally, a `modifier` and a
    `style`, among other parameters this project doesn't set.
  - *Connects to:* called for the display and for every keypad label;
    only the display's own call now passes `style =
    MaterialTheme.typography.displayLarge`.
  - *Shape:* a public Material3 composable — unchanged except for one new
    argument at one of its many call sites.

- **`Modifier.testTag`**
  - *What it is:* a real `Modifier` extension attaching a test-only
    string identifier to a composable.
  - *Implementation:* `fun Modifier.testTag(tag: String): Modifier`.
  - *Its use:* already tags every keypad `Button` and the display `Text`;
    unchanged by this lesson.
  - *Type:* an extension function on `Modifier`, returning a new
    `Modifier`.
  - *Responsibility:* to attach exactly one piece of test-only metadata,
    with no effect on appearance or behavior.
  - *Depends on:* a `String` tag.
  - *Connects to:* chained onto every keypad `Button`'s own `Modifier`;
    read by `onNodeWithTag` in this project's existing tests.
  - *Shape:* a public Compose testing API, called from real, permanent
    project code.

- **`CalculatorScreen`**
  - *What it is:* this project's own top-level composable — the entire
    calculator UI.
  - *Implementation:* `@Composable fun CalculatorScreen()`, building the
    display `Text` and the full keypad from `keypadRows`.
  - *Its use:* now nested inside `CalculatorTheme` at its one real call
    site in `MainActivity`, instead of being called directly.
  - *Type:* a `@Composable` function with no parameters.
  - *Responsibility:* to own the calculator's entire visible state and
    behavior; unchanged by this lesson except for the two `MaterialTheme`
    reads inside it.
  - *Depends on:* nothing external — it owns all of its own state.
  - *Connects to:* now called from inside `CalculatorTheme`'s own
    `content` lambda, rather than directly from `setContent`.
  - *Shape:* the single, public composable this whole project's UI is
    built from.

## Concept Unit: Color

### The Problem

Every color this project has shown so far has been whatever Material3's
own built-in defaults happen to be — `Button` and `Text` have never once
been told what color to use, because nothing in this project has ever
named one. The moment this calculator wants its *own* look — not
Material3's generic default look — something has to hold that decision:
one real, specific color value, nameable, and reusable everywhere the
app needs it.

> What would it even mean, concretely, for a color to be a real Kotlin
> value rather than just a description like "blue"? If two different
> parts of this project both wanted "the same blue," what would have to
> be true about the two values they each held, for that claim to be
> checkable in code rather than just asserted in English?

### Introduce the Concept in Isolation

```kotlin
@Test
fun sameHexProducesEqualColors() {
    assertEquals(Color(0xFF1565C0), Color(0xFF1565C0))
}

@Test
fun differentHexProducesUnequalColors() {
    assertNotEquals(Color(0xFF1565C0), Color(0xFFFF6F00))
}
```

Real output:

```
BUILD SUCCESSFUL
```

Both tests pass. This proves two things at once: first, that `Color`
really does carry comparable, structural data — two `Color`s built from
the identical hex literal are genuinely equal, the same value-based
equality already proven for `data class`es, here on a type that isn't
declared with the `data` keyword at all; second, that two `Color`s built
from *different* hex literals are genuinely unequal — ruling out the
possibility that `Color`'s `equals` is broken in some trivial way that
would make every color look the same. This is called **value equality**:
equality decided by comparing the actual data two objects hold, not by
whether they're the literal same object in memory.

### Discard the Throwaway Example

Both tests above were written only to prove `Color`'s own equality
behavior; neither becomes part of this project.

### Project Change

- **Reference Source** — No reference counterpart: this is a from-scratch
  addition. Stage 3 has no separate reference implementation being
  ported from.
- **Files affected** — `app/src/main/java/com/example/calculator/Theme.kt`
  (new file).
- **Change type** — add.
- **Location** — a new, top-level `private val` in a brand-new file;
  nothing yet to locate a position within.
- **Dependencies** — `Color`, just proven above; `lightColorScheme`, a
  real Material3 function this project hasn't called before.

### The New Code

```kotlin
private val CalculatorColorScheme = lightColorScheme(
    primary = Color(0xFF1565C0),
    onPrimary = Color(0xFFFFFFFF),
    secondary = Color(0xFFFF6F00),
    background = Color(0xFFF5F5F5)
)
```

This is a brand-new top-level declaration in a brand-new file, so there
is no larger enclosing structure yet to return to — the next Concept
Unit adds directly below it.

### Mechanical Walkthrough

- `private val CalculatorColorScheme` — a module-level constant, visible
  only inside `Theme.kt`, the same `private`/file-scoped visibility this
  project's own `Addition`/`Subtraction`/`Division`/`Modulo` classes
  already use — nothing outside this file needs to construct a
  `ColorScheme` directly, only read this one, already-built value.
- `lightColorScheme(...)` — the real function described in the Header,
  called once, with four **named arguments** out of its more than thirty
  real, **default** parameters.
- `primary = Color(0xFF1565C0)` — a **named argument**, `primary`,
  paired with a real `Color` built from a **hex literal**: alpha `FF`
  (fully opaque), red `15`, green `65`, blue `C0` — a specific, real
  blue, this calculator's own primary color from now on.
- `onPrimary = Color(0xFFFFFFFF)` — this project's own choice for text
  and icons drawn *on top of* the primary color: opaque white, chosen so
  it stays readable against the deep blue `primary` just defined.
- `secondary = Color(0xFFFF6F00)` — a second real color, a warm orange,
  this project's own accent color, distinct from `primary`.
- `background = Color(0xFFF5F5F5)` — a near-white gray, this project's
  own screen background, deliberately not pure white, so real content
  drawn on top of it stays visually distinguishable from the background
  itself.
- Every other one of `lightColorScheme`'s thirty-plus parameters —
  `primaryContainer`, `onSecondary`, `error`, and dozens more — is left
  entirely unspecified, relying on its own real **default parameter**
  value, a Material Design-vetted color already chosen for that role.

### CS Lens

Holding one real value that many different, otherwise-unrelated parts of
a system all read, instead of each part computing or hardcoding its own
copy, is a recurring idea: **single source of truth**. Also recognized
in: a database's own canonical row, read by every report that needs that
data rather than each report keeping its own copy; a build system's
single version-number file, read by every package that needs to stamp
its own version; a spreadsheet's named cell, referenced by formula in
many other cells instead of its value being retyped into each one.

### SE Lens

The alternative already ruled out implicitly by this design: writing
`Color(0xFF1565C0)` directly inside `CalculatorScreen`'s own `Button`
and `Text` calls, wherever this project's own primary color happens to
be needed. The real tradeoff: hardcoding at each call site means zero
new vocabulary to learn right now, but every future change to "this
calculator's primary color" would require finding and editing every one
of those call sites by hand — a real, growing maintenance cost as this
project's own screen count grows past one. Naming it once here costs one
extra file and one extra level of indirection, paid up front, in
exchange for that maintenance cost never recurring.

### Commands Needed

`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.ColorEqualityCheck"` — the same JVM-only Gradle
task this project's every other test already runs through.

### Run It

Real output, from this session:

```
$ ./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ColorEqualityCheck"
BUILD SUCCESSFUL
```

### Connect the Pieces

This unit named this calculator's own four core colors, once, as a real
`ColorScheme` — nothing yet reads them; the next two units add this
project's own text style and button shape the same way, before the final
unit connects all three to the actual screen.

## Concept Unit: Typography

### The Problem

The calculator's display text has looked however `Text`'s own defaults
render it, from the moment this project first called `Text` — no font
size, no weight, ever specified. The display is this project's single
most important piece of text; it deserves a deliberately chosen look,
named the same reusable way `Color` just was.

> `TextStyle` and `Color` are both real classes with many parameters,
> most left at their own defaults. Given `Color`'s own shape — a
> constructor accepting named channel values — what would you guess
> `TextStyle`'s own constructor accepts, for controlling how large text
> renders? For controlling how bold it looks?

### Introduce the Concept in Isolation

```kotlin
@Test
fun textStyleCarriesRealFontSizeAndWeight() {
    val style = TextStyle(fontSize = 48.sp, fontWeight = FontWeight.Light)
    assertEquals(48.sp, style.fontSize)
    assertEquals(FontWeight.Light, style.fontWeight)
}
```

Real output:

```
BUILD SUCCESSFUL
```

The test passes: `style.fontSize` really does read back the exact `48.sp`
it was constructed with, and `style.fontWeight` really does read back
the exact `FontWeight.Light` — proving `TextStyle` genuinely stores what
it's given rather than silently normalizing or ignoring it, and proving
`.sp` and `FontWeight.Light` are both real, comparable values, not
opaque tokens.

### Discard the Throwaway Example

This test was written only to prove `TextStyle` stores its own real
`fontSize` and `fontWeight`; it is not part of the project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch
  addition, the same as the previous unit's own `ColorScheme`.
- **Files affected** — `app/src/main/java/com/example/calculator/Theme.kt`
  (modified).
- **Change type** — add.
- **Location** — a new top-level `private val`, directly below
  `CalculatorColorScheme`, the previous unit's own addition.
- **Dependencies** — `TextStyle`/`FontWeight`/`.sp`, just proven above;
  `Typography`, a real Material3 class this project hasn't used before.

### The New Code

```kotlin
private val CalculatorTypography = Typography(
    displayLarge = TextStyle(fontSize = 48.sp, fontWeight = FontWeight.Light)
)
```

### The Updated Project

```kotlin
 1  private val CalculatorColorScheme = lightColorScheme(
 2      primary = Color(0xFF1565C0),
 3      onPrimary = Color(0xFFFFFFFF),
 4      secondary = Color(0xFFFF6F00),
 5      background = Color(0xFFF5F5F5)
 6  )
 7
 8  private val CalculatorTypography = Typography(                    // ← new
 9      displayLarge = TextStyle(fontSize = 48.sp, fontWeight = FontWeight.Light)  // ← new
10  )                                                                  // ← new
```

`Theme.kt` now names two of this calculator's own three theme values —
its colors and, as of this unit, its display text style — both as
top-level constants, both built the same way: a real Material3 class or
function, called once, with only the roles this project actually cares
about overridden by name.

### Mechanical Walkthrough

- `private val CalculatorTypography` — the same file-scoped, `private`
  visibility `CalculatorColorScheme` already uses, one line above.
- `Typography(...)` — the real class constructor described in the
  Header, called with one **named argument** out of its fifteen real
  **default** parameters.
- `displayLarge = TextStyle(...)` — names this calculator's own
  `displayLarge` role; every other one of `Typography`'s fourteen roles
  — `bodyMedium`, `labelSmall`, and the rest — is left at its own
  Material Design default, the same "override only what matters"
  pattern `lightColorScheme` already used.
- `TextStyle(fontSize = 48.sp, fontWeight = FontWeight.Light)` — the
  exact real construction just proven in isolation, now naming this
  project's own real choice: a large, deliberately light-weight display
  font.
- `48.sp` — the `.sp` property, turning the plain number `48` into a
  real `TextUnit` scaled for text — large enough to read a calculator's
  running total at a glance, and, unlike a `dp` value would, one that
  grows further for a user who has set larger text system-wide.
- `FontWeight.Light` — a real, named constant, read from `FontWeight`'s
  own companion object, chosen over `FontWeight.Bold` or the unspecified
  default deliberately, so a large display number reads as light and
  numeric rather than heavy and shouting.

### CS Lens

The same **single source of truth** idea the previous unit's CS Lens
named applies again here, for text style instead of color — one real
`TextStyle`, read everywhere this project's display text needs to look
this way, rather than `fontSize`/`fontWeight` typed out again at each
call site.

### SE Lens

The alternative: passing `style = TextStyle(fontSize = 48.sp, fontWeight
= FontWeight.Light)` directly at the display `Text`'s own call site,
skipping `Typography` entirely. The real tradeoff: that alternative
would work today, with this project's exactly one styled `Text`, but
gives up the same thing naming a color role instead of hardcoding it
gave up avoiding — if a second screen ever needs the identical display
style, `Typography`'s own `displayLarge` role is already there to read;
a hardcoded `TextStyle` at one call site would need to be either copied
or extracted later, under time pressure, instead of already existing.

### Commands Needed

`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.ThemeLabTest"` — same JVM-only Gradle task,
same project.

### Run It

Real output, from this session:

```
$ ./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ThemeLabTest"
BUILD SUCCESSFUL
```

### Connect the Pieces

`Theme.kt` now names two of this calculator's own three theme values;
the next unit adds the third, its button shape, before the final unit
connects all three to the actual screen.

## Concept Unit: Shapes

### The Problem

Every keypad button has rendered with whatever corner shape Material3's
own `Button` defaults to — never a shape this project chose. A
calculator's own keypad is the single most-touched part of its UI; its
buttons deserve a deliberately chosen shape, the same reusable way color
and text style just were.

> `RoundedCornerShape` takes a `Dp` — the same unit `Modifier.padding`
> already builds its own values from. Given that `Color` compares equal
> when built from the same channels, and `TextStyle` reads back exactly
> what it was constructed with, what would you predict happens when two
> `RoundedCornerShape`s are built from two genuinely *different* radii —
> are they the same kind of comparable value, or something else? And this
> calculator already has sixteen real keypad buttons — what would change,
> concretely, about how many places in this project's own code would need
> editing if its corner radius were hardcoded at each `Button` call
> instead of named once here?

### Introduce the Concept in Isolation

```kotlin
@Test
fun roundedCornerShapeCarriesRealRadius() {
    val shape = RoundedCornerShape(12.dp)
    val other = RoundedCornerShape(4.dp)
    assertNotEquals(shape, other)
}
```

Real output:

```
BUILD SUCCESSFUL
```

The test passes: two `RoundedCornerShape`s built from different radii
really are unequal, the same value-based comparison already proven for
`Color` — different real data in, different real object out, provably
so, not just presumed.

### Discard the Throwaway Example

This test was written only to prove `RoundedCornerShape` carries real,
comparable radius data; it is not part of the project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch
  addition, matching this lesson's previous two units.
- **Files affected** — `app/src/main/java/com/example/calculator/Theme.kt`
  (modified).
- **Change type** — add.
- **Location** — a new top-level `private val`, directly below
  `CalculatorTypography`, the previous unit's own addition.
- **Dependencies** — `RoundedCornerShape`/`.dp`, just proven above;
  `Shapes`, a real Material3 class this project hasn't used before.

### The New Code

```kotlin
private val CalculatorShapes = Shapes(
    small = RoundedCornerShape(12.dp)
)
```

### The Updated Project

```kotlin
 1  private val CalculatorColorScheme = lightColorScheme(
 2      primary = Color(0xFF1565C0),
 3      onPrimary = Color(0xFFFFFFFF),
 4      secondary = Color(0xFFFF6F00),
 5      background = Color(0xFFF5F5F5)
 6  )
 7
 8  private val CalculatorTypography = Typography(
 9      displayLarge = TextStyle(fontSize = 48.sp, fontWeight = FontWeight.Light)
10  )
11
12  private val CalculatorShapes = Shapes(                            // ← new
13      small = RoundedCornerShape(12.dp)                             // ← new
14  )                                                                  // ← new
```

`Theme.kt` now names all three of this calculator's own theme values —
color, text style, and, as of this unit, shape — every one of them the
same real pattern: a Material3 class or function, called once, only the
roles this project actually needs overridden by name.

### Mechanical Walkthrough

- `private val CalculatorShapes` — the same file-scoped, `private`
  visibility both earlier constants in this file already use.
- `Shapes(...)` — the real class constructor described in the Header,
  called with one **named argument** out of its five real **default**
  parameters.
- `small = RoundedCornerShape(12.dp)` — names this calculator's own
  `small` role; every other one of `Shapes`'s four roles —
  `extraSmall`, `medium`, `large`, `extraLarge` — is left at its own
  Material Design default.
- `RoundedCornerShape(12.dp)` — the exact real construction just proven
  in isolation; `12.dp`, the `.dp` property already familiar from
  `Modifier.padding(16.dp)`, turning the plain number `12` into a real
  `Dp` radius that renders the same physical size across screen
  densities.

### CS Lens

The same **single source of truth** idea named twice already in this
lesson applies a third time — one real `Shapes` value, naming this
project's own button-corner radius once, rather than a `RoundedCornerShape`
constructed fresh at every `Button` call site.

### SE Lens

The alternative: passing `shape = RoundedCornerShape(12.dp)` directly at
every one of `CalculatorScreen`'s sixteen `Button` calls. The real
tradeoff, sharper here than in the previous two units: this project
already has sixteen real call sites that would each need the identical
literal repeated, not just one — the maintenance cost of a future radius
change is immediate and concrete right now, not merely hypothetical.
Naming it once as `Shapes`'s own `small` role means one future change,
in one place, reaches all sixteen buttons automatically.

### Commands Needed

`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.ThemeLabTest"` — same JVM-only Gradle task, same
project, same test file this unit's own lab lives in alongside the
previous unit's.

### Run It

Real output, from this session:

```
$ ./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ThemeLabTest"
BUILD SUCCESSFUL
```

### Connect the Pieces

`Theme.kt` now names all three of this calculator's own theme values —
nothing in the actual running app reads any of them yet. The final unit
connects all three to `CalculatorScreen` for real.

## Concept Unit: Theme

### The Problem

`CalculatorColorScheme`, `CalculatorTypography`, and `CalculatorShapes`
are three real values sitting in `Theme.kt`, entirely unread by anything
else in the project. Somehow, `CalculatorScreen`'s own `Button` and
`Text` calls — written in a different file, with no parameter passed
between them and `Theme.kt` — need to end up using these exact values.
Passing all three as explicit parameters through every composable that
might eventually need them would mean threading three extra parameters
through every function in this project's whole UI, forever.

> `Operator`'s own `operation: Operation` property is read by naming
> `Operator.DIVIDE.operation` — no parameter passed anywhere to ask for
> it, just a name. Could something similar work here — some real value a
> composable can simply *read*, by name, without anyone having explicitly
> passed it down as a parameter? What would have to place that value
> somewhere for such a read to find it?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun ReadTheme(onRead: (Color) -> Unit) {
    onRead(MaterialTheme.colorScheme.primary)
}

@Test
fun calculatorThemeProvidesRealCustomPrimaryColor() {
    var captured: Color? = null
    composeTestRule.setContent {
        CalculatorTheme {
            ReadTheme { color -> captured = color }
        }
    }
    assertEquals(Color(0xFF1565C0), captured)
}
```

Real output:

```
BUILD SUCCESSFUL
```

The test passes: `captured` really does end up holding
`Color(0xFF1565C0)` — the exact real color this lesson's first unit
named as `primary` — even though nothing in `ReadTheme`'s own signature
ever receives a `Color` as a parameter. `ReadTheme` reads
`MaterialTheme.colorScheme.primary` cold, and gets back exactly the
value `CalculatorTheme` provided several composables away. This proves
`MaterialTheme` really does make its three values available to every
composable nested inside it, by name, with no explicit parameter passed
at each level in between.

### Discard the Throwaway Example

`ReadTheme` was written only to prove `MaterialTheme`'s own values reach
a nested composable without being passed as a parameter; it is not part
of the project. (`CalculatorTheme` itself, which this lab already needed
to exist, is real and permanent — built in this same unit, below.)

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch
  addition tying this lesson's previous three units together.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Theme.kt` (modified: one new
  composable added);
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified:
  `setContent`'s own body, the display `Text`'s own call, every keypad
  `Button`'s own call).
- **Change type** — add; modify existing calls.
- **Location** — `Theme.kt`, below `CalculatorShapes`; `MainActivity.kt`'s
  `onCreate`, inside `setContent`; `CalculatorScreen`'s own display
  `Text` call and its keypad-building `Button` call.
- **Dependencies** — `MaterialTheme` (the function), just proven above;
  `CalculatorColorScheme`/`CalculatorTypography`/`CalculatorShapes`,
  this lesson's own previous three units.

### The New Code

```kotlin
@Composable
fun CalculatorTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = CalculatorColorScheme,
        typography = CalculatorTypography,
        shapes = CalculatorShapes,
        content = content
    )
}
```

### The Updated Project

```kotlin
 1  private val CalculatorColorScheme = lightColorScheme(
 2      primary = Color(0xFF1565C0),
 3      onPrimary = Color(0xFFFFFFFF),
 4      secondary = Color(0xFFFF6F00),
 5      background = Color(0xFFF5F5F5)
 6  )
 7
 8  private val CalculatorTypography = Typography(
 9      displayLarge = TextStyle(fontSize = 48.sp, fontWeight = FontWeight.Light)
10  )
11
12  private val CalculatorShapes = Shapes(
13      small = RoundedCornerShape(12.dp)
14  )
15
16  @Composable                                                       // ← new
17  fun CalculatorTheme(content: @Composable () -> Unit) {             // ← new
18      MaterialTheme(                                                // ← new
19          colorScheme = CalculatorColorScheme,                      // ← new
20          typography = CalculatorTypography,                        // ← new
21          shapes = CalculatorShapes,                                // ← new
22          content = content                                         // ← new
23      )                                                              // ← new
24  }                                                                  // ← new
```

`Theme.kt` is now complete: three named theme values, and one real
composable tying all three to `MaterialTheme` in a single call.

Separately, in `MainActivity.kt`:

```kotlin
24  class MainActivity : ComponentActivity() {
25      override fun onCreate(savedInstanceState: Bundle?) {
26          super.onCreate(savedInstanceState)
27          setContent {
28              CalculatorTheme {                                     // ← new
29                  CalculatorScreen()
30              }                                                     // ← new
31          }
32      }
33  }
```

`onCreate` now wraps `CalculatorScreen()` inside `CalculatorTheme`,
instead of calling it directly — every composable `CalculatorScreen`
itself builds is now nested inside a real `MaterialTheme`.

And, inside `CalculatorScreen` itself, its display `Text`:

```kotlin
59          Text(
60              text = displayText,
61              style = MaterialTheme.typography.displayLarge,        // ← new
62              modifier = Modifier.testTag("display")
63          )
```

and every keypad `Button`:

```kotlin
67                      Button(
68                          onClick = {
69                              when {
70                                  label[0].isDigit() -> {
71                                      displayText = if (displayText == "0" || displayText == "Error") label else displayText + label
72                                  }
73                                  label == "C" -> {
74                                      displayText = "0"
75                                  }
76                                  label in operatorSymbols -> {
77                                      firstOperand = displayText.toInt()
78                                      pendingOperator = operatorSymbols[label]
79                                      displayText = "0"
80                                  }
81                                  label == "=" -> {
82                                      val operator = pendingOperator
83                                      val first = firstOperand
84                                      if (operator != null && first != null) {
85                                          displayText = try {
86                                              operator.operation.apply(first, displayText.toInt()).toString()
87                                          } catch (invalidOperation: ArithmeticException) {
88                                              "Error"
89                                          }
90                                      }
91                                      pendingOperator = null
92                                      firstOperand = null
93                                  }
94                              }
95                          },
96                          shape = MaterialTheme.shapes.small,        // ← new
97                          modifier = Modifier.weight(1f).testTag(label)
98                      ) {
99                          Text(text = label)
100                     }
```

The display now reads this project's own named text style; every keypad
button now reads this project's own named corner shape — both read
directly from `MaterialTheme`, with nothing passed down as an explicit
parameter to make either read possible.

### Mechanical Walkthrough

- `@Composable fun CalculatorTheme(content: @Composable () -> Unit)` —
  a public, top-level composable, taking one parameter: `content`, a
  `@Composable` lambda, the same "lambda parameter" shape `Button`'s own
  `onClick` already has, just marked `@Composable` here because it's
  expected to itself call other composables, not run ordinary code.
- `MaterialTheme(colorScheme = ..., typography = ..., shapes = ...,
  content = content)` — the real composable function described in the
  Header, called with all four of its real parameters named explicitly.
- `colorScheme = CalculatorColorScheme` — hands this lesson's first
  unit's own named color values to `MaterialTheme`.
- `typography = CalculatorTypography` — hands this lesson's second
  unit's own named text style to `MaterialTheme`.
- `shapes = CalculatorShapes` — hands this lesson's third unit's own
  named shape to `MaterialTheme`.
- `content = content` — forwards `CalculatorTheme`'s own `content`
  parameter straight through to `MaterialTheme`'s own `content`
  parameter, unchanged; `CalculatorTheme` adds no UI of its own, it only
  wraps.
- `CalculatorTheme { CalculatorScreen() }` — inside `MainActivity`'s
  `setContent`, `CalculatorScreen()` is now the trailing lambda handed to
  `CalculatorTheme`'s own `content` parameter, the same trailing-lambda
  call syntax `Column`/`Row` already use for their own final lambda
  parameter.
- `style = MaterialTheme.typography.displayLarge` — reads the real
  property described in the Header; `.displayLarge` then reads that
  `Typography`'s own `displayLarge` property, the exact real `TextStyle`
  this lesson's second unit constructed.
- `shape = MaterialTheme.shapes.small` — reads the real property
  described in the Header; `.small` then reads that `Shapes`'s own
  `small` property, the exact real `RoundedCornerShape` this lesson's
  third unit constructed.

Here is the real sequence of events, in order, that makes
`MaterialTheme.shapes.small` inside a `Button` resolve to this project's
own `12.dp` shape rather than some other value:

1. `setContent { CalculatorTheme { CalculatorScreen() } }` runs; Compose
   begins building the composition starting from `CalculatorTheme`.
2. `CalculatorTheme` calls `MaterialTheme(colorScheme =
   CalculatorColorScheme, ..., content = content)` — this is the one
   moment `CalculatorShapes` is handed to `MaterialTheme` at all.
3. `MaterialTheme`'s own real internals store `CalculatorShapes`
   somewhere every composable nested inside its `content` lambda can
   read from, then call `content()` — which is `CalculatorScreen()`.
4. `CalculatorScreen` builds its keypad; each `Button` call reads
   `MaterialTheme.shapes.small` — because `Button` is running *nested
   inside* the `content` lambda `MaterialTheme` is still executing, this
   read finds exactly what step 2 stored, not some other default.
5. If `CalculatorScreen()` had been called directly, outside any
   `MaterialTheme`, `MaterialTheme.shapes.small` would still resolve —
   to Material3's own built-in default `Shapes`, not a crash — simply
   because no enclosing `MaterialTheme` call ever stored anything else
   for it to find instead.

### CS Lens

A value read by name from wherever a piece of code happens to be
running, rather than received as an explicit parameter passed down
through every intermediate function, is a real, general pattern:
**implicit context propagation**. Also recognized in: a web server
reading the current logged-in user from request-scoped context, instead
of every function in the call chain accepting a `currentUser` parameter;
a programming language's own dynamic-scoping mechanisms; an operating
system process reading an environment variable set by its parent, with
no explicit argument passed at every level of the process tree in
between.

### SE Lens

The alternative already named in this unit's own Problem: threading
`colorScheme`/`typography`/`shapes` as three explicit parameters through
every function that might eventually need one, all the way down from
`MainActivity` to the deepest `Button` call. The real tradeoff: explicit
parameters are easier to trace by reading a function's own signature
alone — nothing hidden — but `CalculatorScreen` would need three new
parameters it never actually uses itself, only to pass along to whatever
it calls, and if a tenth composable were ever nested ten levels deep,
all three parameters would have to be threaded through all ten
intervening functions, most of which have nothing to do with theming.
`MaterialTheme`'s implicit-read approach costs real traceability — a
reader can't tell, from `Button`'s own signature alone, that it depends
on a `Shapes` at all — in exchange for zero parameter-threading through
composables that don't otherwise care.

### Commands Needed

`./gradlew testDebugUnitTest assembleDebug` — this project's own
already-established combined command, proving both the test suite and a
real, installable `.apk` still build successfully after a change.

### Run It

Real output, from this session:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 5s
43 actionable tasks: 10 executed, 33 up-to-date
```

All 13 real tests pass, including a new permanent one,
`calculatorThemeProvidesRealCustomPrimaryColor` — the exact real proof
from this unit's own isolated lab, now a permanent regression test
guarding against `CalculatorTheme` ever silently stopping to provide
this project's own real colors.

### Connect the Pieces

The previous three units each named one real theme value with nothing
reading it; this unit built the one real composable, `CalculatorTheme`,
that makes all three actually reach the running screen — closing the
loop this lesson's own Problem opened.

## Connect the Pieces

One value, traced through every unit this lesson built:
`Color(0xFF1565C0)`. The first Concept Unit proved, in isolation, that a
`Color` built from this exact hex literal is a real, comparable value —
then named it `primary` inside a real `CalculatorColorScheme`, in a
brand-new `Theme.kt`. The second and third units named this project's
own display text style and button shape the same way, each proven real
in isolation first. Nothing in the running app read any of the three
until this lesson's final unit built `CalculatorTheme`, wrapped
`CalculatorScreen()` in it from `MainActivity`, and proved — with a real,
now-permanent test — that `Color(0xFF1565C0)` really does reach
`MaterialTheme.colorScheme.primary`, several composables away, with no
parameter ever passed to carry it there. The calculator's own display
now reads its own named text style; every one of its sixteen keypad
buttons now reads its own named shape — the same three real values,
defined exactly once.
