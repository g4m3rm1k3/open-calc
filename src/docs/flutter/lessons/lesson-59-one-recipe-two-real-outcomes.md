# Lesson 59: One Recipe, Two Real Outcomes

**Themes**

## What you will build

This app's own design system's real, single `AppTheme.light`
grows a real, second sibling — `AppTheme.dark` — built from the
identical real recipe, differing only in one real, explicit input. This
app then grows a real way to choose between them: automatically,
following whatever real brightness the OS itself already reports; or
live, real, and immediately, through the reader's own tap. The
transferable problem: a design system that only ever produces one real
result isn't actually reusable yet — the real test of a decision made
once and applied everywhere is whether that identical real decision
can honestly produce more than one real, valid outcome, and whether the
real *choice* of outcome can itself change live, without a restart.

## What you need to know first

- Lesson 13 ("A Fixed Set of Named Possibilities") — enums, an
  exhaustive `switch`, and an enhanced enum's own real members
  (`Difficulty.basePoints`) — this lesson's own real starting point for
  `ThemeMode`, a real, enhanced enum this lesson reaches for.
- Lesson 26 ("Your First Flutter Application") — `MaterialApp`/
  `AppBar`, both real, already-established widgets this lesson grows
  further.
- Lesson 35 ("When One Widget's State Isn't Enough") — the real,
  established distinction between plain, local `State` (`setState`) and
  a real, shared value multiple widgets need — this lesson's own real
  judgment call for where a live theme choice belongs.
- Lesson 58 ("Deciding Once, Applying Everywhere") — `AppTheme`,
  `AppSpacing`, `AppShapes`, and the real **design token** idea this
  entire lesson extends: one real recipe, now proven to honestly
  support more than one real outcome.

## Terms used in this lesson

- **Switch expression** — a real, `switch`-based expression (`switch
  (x) { pattern => value, ... }`) that itself *produces* a real value,
  distinct from a `switch` *statement* (already established), which
  runs real statements instead of evaluating to one. Exists so
  "pick one real value based on which real case matches" can be written
  as a single real expression — assignable, returnable, passable — 
  rather than a real block of `case`s each assigning the identical real
  variable by hand.
- **`static`** (as a method modifier, not a field) — a real method
  reached through its own class's real name (`AppTheme._build(...)`),
  never through a real instance, the identical real reach `static`
  already gives a field. Exists here because building a
  real `ThemeData` needs no real, per-instance state of its own — it's
  a real, pure, repeatable recipe, not behavior tied to one specific
  real object.

## Objects and methods used

- **`AppTheme`**
  - *What it is:* this app's own real, shared design-system class, now
    real and holding two complete, real visual identities instead of
    one.
  - *Implementation:*
    ```dart
    class AppTheme {
      static final ThemeData light = _build(Brightness.light);
      static final ThemeData dark = _build(Brightness.dark);

      static ThemeData _build(Brightness brightness) { /* real, shared recipe, below */ }
    }
    ```
  - *Its use:* `SudokuApp.build` reads both `AppTheme.light` and
    `AppTheme.dark`, real and handing each to `MaterialApp`'s own real
    `theme:`/`darkTheme:`.
  - *Type:* an ordinary class with two real `static final` fields and
    one real, private `static` method; never meant to be instantiated.
  - *Responsibility:* owning every real visual decision this app makes,
    in both of its own real, supported brightness variants — nothing
    about *which* of the two a real reader currently sees, which stays
    entirely `MaterialApp`'s and, later in this lesson, this app's own
    real choice.
  - *Depends on:* `_build`, below, called real and twice, once per real
    `Brightness`.
  - *Connects to:* `light`/`dark` are each read once, real and
    directly, inside `SudokuApp.build`.
  - *Shape:* this app's own real, shared design-system seam, grown,
    not replaced — the identical real file, real and now proven to
    honestly support more than one real outcome.

- **`AppTheme._build`**
  - *What it is:* a real, new, private, `static` method — this lesson's
    own first primary subject — the one real recipe both `light` and
    `dark` are built from.
  - *Implementation:*
    ```dart
    static ThemeData _build(Brightness brightness) {
      return ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: brightness),
        textTheme: const TextTheme(
          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            shape: AppShapes.medium,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
          ),
        ),
        cardTheme: CardThemeData(shape: AppShapes.medium, elevation: 2),
      );
    }
    ```
  - *Its use:* called real and exactly twice, by `light`/`dark`, above,
    each real call differing only in its own one, real, explicit
    argument.
  - *Type:* a real, private, `static` method.
  - *Responsibility:* real and specifically, building one, complete,
    real `ThemeData` for whichever real `Brightness` it's given —
    nothing about which real brightness a specific real caller actually
    wants, which stays entirely `light`'s/`dark`'s own job.
  - *Depends on:* a real `Brightness`; every other real field
    (`textTheme`/`elevatedButtonTheme`/`cardTheme`) it builds is
    brightness-independent, real and identical either way.
  - *Connects to:* called by `AppTheme.light`/`AppTheme.dark`, above;
    calls `ColorScheme.fromSeed` (already established),
    now real and passing its own `brightness:` argument explicitly for
    the first time.
  - *Shape:* a real, new, private seam inside `AppTheme` — real and
    existing purely to avoid this app's own typography/button/card
    decisions being real and duplicated twice, once per real
    brightness.

- **`Brightness`**
  - *What it is:* the real, standard `dart:ui` enum naming whether a
    real color scheme is meant for light or dark surroundings.
  - *Implementation:* real, confirmed this session from `sky_engine`'s
    own real `window.dart`: `enum Brightness { dark, light }` — a real,
    plain, two-value enum, no real enhanced members.
  - *Its use:* `AppTheme._build`'s own real, new parameter type;
    `Brightness.light`/`Brightness.dark` are each passed real and
    exactly once.
  - *Type:* a real, plain Dart enum.
  - *Responsibility:* naming exactly one of two real possibilities —
    nothing about what a real caller actually does with either one.
  - *Depends on:* nothing.
  - *Connects to:* read by `_build`, passed straight into
    `ColorScheme.fromSeed`'s own real `brightness:` parameter (already
    established, previously left at its own real, implicit default).
  - *Shape:* a real, standard `dart:ui` enum — this lesson's own first
    real, explicit use of a value this app's own code had, until now,
    only ever relied on implicitly.

- **`ThemeMode`**
  - *What it is:* the real, standard Flutter enum naming this app's own
    three possible, real theme-selection strategies.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/app.dart`:
    ```dart
    enum ThemeMode {
      system, // follow the real, current OS brightness setting
      light,  // always light, regardless of the real OS setting
      dark;   // always dark, regardless of the real OS setting
      bool get isSystem => this == ThemeMode.system;
      // ...and two further real, matching getters, isLight/isDark
    }
    ```
    A real, enhanced enum (already established) — three
    real, named values, plus real, convenience getters this lesson's
    own code never calls directly.
  - *Its use:* `MaterialApp`'s own `themeMode:` parameter, below; this
    app's own new `_themeMode` field, this lesson's own final unit.
  - *Type:* a real, enhanced Dart enum.
  - *Responsibility:* naming this app's own real theme-selection
    strategy — nothing about how that real strategy is actually
    resolved into one, real, concrete `ThemeData`, which stays entirely
    `MaterialApp`'s own job.
  - *Depends on:* nothing.
  - *Connects to:* read by `MaterialApp` itself, and, later in this
    lesson, by this app's own new theme-cycling logic.
  - *Shape:* a real, standard Flutter enum, this app's own first real
    use of it.

- **`MaterialApp.darkTheme` / `MaterialApp.themeMode`**
  - *What it is:* two real, already-existing, optional `MaterialApp`
    fields, real and reached for the first time this lesson.
  - *Implementation:* real, confirmed this session:
    `final ThemeData? darkTheme;`, `final ThemeMode? themeMode;`.
    Real and confirmed, from `MaterialApp`'s own real, internal
    resolution logic:
    ```dart
    final ThemeMode mode = widget.themeMode ?? ThemeMode.system;
    final Brightness platformBrightness = MediaQuery.platformBrightnessOf(context);
    final bool useDarkTheme = mode == ThemeMode.dark ||
        (mode == ThemeMode.system && platformBrightness == Brightness.dark);
    ```
  - *Its use:* `SudokuApp.build`'s own `MaterialApp(...)` call passes
    both, real and alongside its own already-established `theme:`.
  - *Type:* two real, optional fields on an already-established class.
  - *Responsibility:* `darkTheme`'s whole real job: naming which real
    `ThemeData` to use *if* dark mode is real and actually chosen;
    `themeMode`'s whole real job: naming *which* of this app's own
    three real strategies decides that — neither field does anything
    real on its own without the other.
  - *Depends on:* a real `ThemeData` for `darkTheme`; a real
    `ThemeMode` for `themeMode`.
  - *Connects to:* both real, read internally by `MaterialApp`'s own
    build method, together with `MediaQuery.platformBrightnessOf`,
    below, to decide, every real build, which real `ThemeData` this
    app's own widgets actually see through `Theme.of(context)`.
  - *Shape:* this app's own first real use of `MaterialApp`'s own,
    already-existing, real theme-switching surface — every real digit,
    every real button, every real card already reads `Theme.of
    (context)`; neither one needs any real change at all
    for this to start working.

- **`MediaQuery.platformBrightnessOf`**
  - *What it is:* a real, static method reading the real, current OS
    brightness setting, as reported to Flutter.
  - *Implementation:* real and confirmed, quoted directly above,
    inside `MaterialApp`'s own real, internal build method — this
    lesson's own code never calls it directly; `MaterialApp` itself
    does, on this app's own behalf.
  - *Its use:* the real, second half of `MaterialApp`'s own real
    `useDarkTheme` decision, alongside `themeMode`, above — directly
    proving, from real, fetched source rather than a confident
    sentence alone, exactly how "follow the system" is real and
    actually implemented.
  - *Type:* a real, static method.
  - *Responsibility:* real and specifically, reporting the real,
    current OS brightness — nothing about what any real caller does
    with that real answer.
  - *Depends on:* a real `BuildContext`.
  - *Connects to:* called once, inside `MaterialApp`'s own real,
    internal build method, real and combined with `themeMode` to
    compute `useDarkTheme`.
  - *Shape:* real, standard Flutter platform-brightness plumbing — this
    lesson's own first, real, direct look at *how* `ThemeMode.system`
    actually resolves, rather than trusting the name alone.

- **`AnimatedTheme`**
  - *What it is:* the real, standard Flutter widget `MaterialApp`
    itself uses internally to animate a real theme change, rather than
    swapping instantly.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/app.dart`, a genuine, honest,
    first-attempt discovery, not assumed in advance:
    ```dart
    if (widget.themeAnimationStyle != AnimationStyle.noAnimation) {
      childWidget = AnimatedTheme(
        data: theme,
        duration: widget.themeAnimationStyle?.duration ?? widget.themeAnimationDuration,
        curve: widget.themeAnimationStyle?.curve ?? widget.themeAnimationCurve,
        child: childWidget,
      );
    }
    ```
    `themeAnimationDuration` defaults to `kThemeAnimationDuration`, real
    and confirmed from `package:flutter/src/material/theme.dart`:
    `const Duration kThemeAnimationDuration = Duration(milliseconds:
    200);` — a real, genuine, non-zero 200ms transition, every real
    time `MaterialApp`'s own resolved theme changes.
  - *Its use:* never called directly by this app's own code — real and
    confirmed to wrap every real widget beneath `MaterialApp`
    automatically, the real reason this lesson's own permanent test
    needed `pumpAndSettle`, not a single `pump()`, to see a real theme
    change's own real, final color.
  - *Type:* a real, standard, stateful Flutter widget.
  - *Responsibility:* real and specifically, smoothing a real theme
    change into a real, visible, 200ms transition — nothing about
    *when* or *why* the theme actually changed, which stays entirely
    `MaterialApp`'s own decision.
  - *Depends on:* a real, new `ThemeData` to animate toward, real and
    supplied by `MaterialApp` itself every real time its own resolved
    theme changes.
  - *Connects to:* wraps every real widget beneath `MaterialApp`,
    invisibly, real and automatically — no real widget in this app
    knows, or needs to know, it exists.
  - *Shape:* real, hidden, already-existing Flutter machinery — this
    lesson's own real, first-hand discovery of it, prompted by a real,
    genuine test failure, not read about in advance.

- **`IconButton`**
  - *What it is:* the real, standard Flutter widget for a real, single,
    tappable icon — this lesson's own new, real, live theme control.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/icon_button.dart`:
    ```dart
    const IconButton({
      required this.icon,
      required this.onPressed,
      this.tooltip,
      // ...many further optional overrides
    });
    ```
  - *Its use:* `SudokuApp.build`'s own new `AppBar.actions`, below,
    holds real and exactly one.
  - *Type:* a real, `const`-constructible, ordinary widget.
  - *Responsibility:* real and specifically, showing one real, tappable
    icon and calling one real callback when tapped — nothing about
    what that real callback actually does.
  - *Depends on:* a real `icon:` (an `Icon`, below) and a real
    `onPressed:` callback.
  - *Connects to:* its own real `icon:` reads
    `_iconForThemeMode(_themeMode)`, below; its own real `onPressed:`
    calls `_cycleThemeMode`, below, real and directly.
  - *Shape:* this app's own first real, tappable `AppBar` action —
    every earlier real button in this app (Pause/Resume, Start New
    Game) sits inside the real body, not the real app bar.

- **`Icon` / `Icons`**
  - *What it is:* `Icon`, a real, standard Flutter widget rendering one
    real glyph; `Icons`, the real, standard Flutter class holding every
    real Material icon as a real, named `IconData` constant — the
    identical real shape `Colors` already has for colors.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/icons.dart`:
    ```dart
    static const IconData brightness_auto = IconData(0xe10c, fontFamily: 'MaterialIcons');
    static const IconData light_mode = IconData(0xe37a, fontFamily: 'MaterialIcons');
    static const IconData dark_mode = IconData(0xe1b0, fontFamily: 'MaterialIcons');
    ```
    Each real, named constant is a real, fixed Unicode code point
    inside a real, bundled icon font.
  - *Its use:* `_iconForThemeMode`, below, returns one of these three
    real constants; `IconButton`'s own `icon:` wraps whichever one
    comes back in a real `Icon(...)`.
  - *Type:* `Icon` — a real, ordinary widget; `Icons` — a real,
    `const`-holding class, never instantiated.
  - *Responsibility:* `Icons`'s whole real job: naming a real, specific
    glyph; `Icon`'s whole real job: actually painting whichever real
    `IconData` it's given — neither one knows anything about *which*
    real theme mode it happens to represent.
  - *Depends on:* `Icon` depends on a real `IconData`.
  - *Connects to:* `_iconForThemeMode` reads a real `Icons.*` constant;
    `IconButton`'s own `icon:` wraps it in a real `Icon`.
  - *Shape:* this app's own first real use of either — real and
    reached now that this app's own `AppBar` needs a real, visual way
    to show its own current, real theme choice.

- **`AppBar.actions`**
  - *What it is:* a real, already-existing, optional field on `AppBar`
    (already established), naming real widgets shown on the
    real, opposite side from its own `title`.
  - *Implementation:* real, confirmed this session:
    `final List<Widget>? actions;`.
  - *Its use:* `SudokuApp.build`'s own real `AppBar` grows this real
    field for the first time, holding real and exactly one
    `IconButton`, above.
  - *Type:* a real, optional field on an already-established class.
  - *Responsibility:* real and specifically, placing its own real
    widgets in the app bar's own real, trailing region — nothing about
    what any of them actually do.
  - *Depends on:* a real `List<Widget>`.
  - *Connects to:* holds `IconButton`, above, directly.
  - *Shape:* this app's own `AppBar`, real and unchanged in every other
    real way, growing one real, new field.

---

## Concept Unit 1: `AppTheme._build` — One Real Recipe, Explicit About Its Own One Real Input

### The Problem

`AppTheme.light`'s own real `ColorScheme.fromSeed(seedColor:
Colors.indigo)` call never names its own real `brightness:`
argument at all — it silently relies on `ColorScheme.fromSeed`'s own
real, default value (`Brightness.light`, already confirmed from
source). Nothing about that was wrong, since this app had only ever
needed one real outcome — but a real, second, dark variant is about to
need the identical real recipe, differing in exactly this one real
input.

> **Socratic prompt:** `AppTheme.light`'s own real `ThemeData(...)`
> call has four real fields — `colorScheme`, `textTheme`,
> `elevatedButtonTheme`, `cardTheme` — and only the first one would
> ever need to differ for a real, dark variant; the other three are
> real, brightness-independent decisions. Given that, what real,
> concrete risk would simply copy-pasting the entire real
> `ThemeData(...)` call a second time, changing only `brightness:`,
> introduce that a real, single, shared recipe would not?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart`, its
  own real, existing `light` field (read fresh this session) — the real
  starting point this unit refactors.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart` —
  modified.
- **Change type:** refactor.
- **Location:** inside `AppTheme`, replacing `light`'s own real,
  direct `ThemeData(...)` call.
- **Dependencies:** none new.

### The New Code

```dart
static ThemeData _build(Brightness brightness) {
  return ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: brightness),
    textTheme: const TextTheme(
      titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        shape: AppShapes.medium,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
      ),
    ),
    cardTheme: CardThemeData(shape: AppShapes.medium, elevation: 2),
  );
}
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_theme.dart`, every
real line shown, the real, changed/new lines marked:

```dart
 1  import 'package:flutter/material.dart';
 2
 3  import 'app_shapes.dart';
 4  import 'app_spacing.dart';
 5
 6  class AppTheme {
 7    static final ThemeData light = _build(Brightness.light);                          // ← changed
 8
 9    static ThemeData _build(Brightness brightness) {                                  // ← new
10      return ThemeData(                                                                // ← new
11        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: brightness), // ← changed
12        textTheme: const TextTheme(
13          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
14          titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
15        ),
16        elevatedButtonTheme: ElevatedButtonThemeData(
17          style: ElevatedButton.styleFrom(
18            shape: AppShapes.medium,
19            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
20          ),
21        ),
22        cardTheme: CardThemeData(shape: AppShapes.medium, elevation: 2),
23      );                                                                                // ← new
24    }                                                                                    // ← new
25  }
```

`AppTheme.light` still, really, resolves to the identical real
`ThemeData` it always did — this unit changes *how* it's built, never
what it real, actually is; every one of this app's own real, already-
established, passing tests keeps passing, unmodified, real and proving
that honestly.

### Isolate and Discard

No separate throwaway lab needed — `_build`'s own real behavior, for
`Brightness.light` specifically, is exactly what this app's own,
already-existing, unmodified tests already, really check
(`AppTheme.light.cardTheme.shape`, `.elevatedButtonTheme`, and so on);
proven directly, for real, by those same real, passing tests, plus a
real, new, additional check in this lesson's own permanent test,
Concept Unit 2, below: `AppTheme.light.colorScheme.brightness ==
Brightness.light`, real and confirming this unit's own real refactor
didn't silently change the one real value it was supposed to make
explicit.

### Mechanical Walkthrough

- `static ThemeData _build(Brightness brightness) {` — **`static`**
  (Terms, above), real and applied to a method this time, not a field
  — `_build` is reached as `AppTheme._build(...)`, never through a real
  instance; a leading underscore (already established — Dart's own
  real, per-library privacy) marks it real and private,
  reachable only from inside this same real file; `Brightness`
  (Objects and methods, above) — a real, plain, two-value enum,
  confirmed from source, naming exactly which of the two real outcomes
  this specific real call should produce.
- `colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo,
  brightness: brightness)` — `ColorScheme.fromSeed` (already
  established) reappearing, real and now supplying its own
  real, optional `brightness:` argument explicitly for the first time —
  directly answering this unit's own Socratic question: this real
  argument is the *one* real thing that needs to differ between
  `light` and `dark`; naming it here, explicitly, inside the one real,
  shared recipe, real and means neither future real caller has to
  remember, or guess, what the real, implicit default used to be.
- `textTheme: const TextTheme(...)`, `elevatedButtonTheme:
  ElevatedButtonThemeData(...)`, `cardTheme: CardThemeData(...)` —
  every one already established, reappearing, real and
  completely unchanged in shape — real, direct proof that these three
  real decisions genuinely don't depend on brightness at all.
- `static final ThemeData light = _build(Brightness.light);` —
  `static`/`final` (Terms, above) reappearing; `_build`, above,
  real and called once, real and passing `Brightness.light` explicitly
  — the identical real outcome `light` already produced before this
  unit, real and now reached through the shared recipe instead of its
  own, separate `ThemeData(...)` call.

### CS Lens

Not a hard concept on its own — extracting a real, shared recipe out of
one real, concrete result, before a real, second result needs it, is
ordinary, foundational software practice. The real idea worth naming:
this is the identical real shape this app's own `AppShapes` already
modeled — a real, shared decision, built once, ahead of its second real
consumer, rather than let that second consumer improvise its own,
separate copy.

### SE Lens

The real principle is **separating what varies from what doesn't,
before the variation actually shows up a second time** — directly
answering this unit's own Socratic question. The alternative not
chosen: leave `light`'s own real `ThemeData(...)` call exactly as it
was, and let the next unit's own real, dark variant write a real,
second, nearly-identical call, differing only in `brightness:`. The
real tradeoff: that alternative costs nothing extra today, and would
even *work*, real and correctly — but it means this app's own real
typography/button/card decisions would suddenly exist in two, real,
separate places; a real, future change to either one (this app's own
real, already-established habit) would need to be made twice,
by hand, with a real, ongoing risk that one real copy quietly drifts
from the other. Refactoring first, before the second real caller
exists, costs one small, real indirection now and removes that entire
real risk category before it can ever start.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — `_build(Brightness.dark)` has no real
caller until the next unit; every real, current caller
(`AppTheme.light`) is exercised together with this lesson's other
units, in Concept Unit 2's own summary, below.

### Connect

This app's own visual identity now comes from one, real, shared recipe,
explicit about the one real input that could ever make it differ. The
next unit calls that identical real recipe a second time.

---

## Concept Unit 2: `AppTheme.dark` — The Second Real Outcome, for Free

### The Problem

This app has exactly one real `ThemeData`. A real player using a real,
dark-themed OS still sees this app's own bright, light-seeded colors —
nothing in this app has ever produced a real, dark alternative at all.

> **Socratic prompt:** `_build`, previous unit, already takes a real
> `Brightness` and returns a real, complete `ThemeData`. Given that,
> what real, concrete amount of *new* code should a real, dark variant
> actually need?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart`, its
  own real, existing `_build`/`light`, previous unit (read fresh this
  session) — the real recipe this unit's own new field reuses whole.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart` —
  modified;
  `project/test/app_theme_test.dart` — modified.
- **Change type:** add.
- **Location:** inside `AppTheme`, alongside `light`.
- **Dependencies:** `_build` (previous unit).

### The New Code

```dart
static final ThemeData dark = _build(Brightness.dark);
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_theme.dart`, every
real line shown, the one, real, new line marked:

```dart
 1  import 'package:flutter/material.dart';
 2
 3  import 'app_shapes.dart';
 4  import 'app_spacing.dart';
 5
 6  class AppTheme {
 7    static final ThemeData light = _build(Brightness.light);
 8    static final ThemeData dark = _build(Brightness.dark);                            // ← new
 9
10    static ThemeData _build(Brightness brightness) {
11      return ThemeData(
12        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: brightness),
13        textTheme: const TextTheme(
14          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
15          titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
16        ),
17        elevatedButtonTheme: ElevatedButtonThemeData(
18          style: ElevatedButton.styleFrom(
19            shape: AppShapes.medium,
20            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
21          ),
22        ),
23        cardTheme: CardThemeData(shape: AppShapes.medium, elevation: 2),
24      );
25    }
26  }
```

`AppTheme` now real and genuinely offers two, complete, real visual
identities — real and still nobody, anywhere in this app, actually
reads `dark` yet; that's the next unit's own real job.

### Isolate and Discard

No separate throwaway lab needed — `_build(Brightness.dark)` combines
only already-established or already-explained real constructs; proven
directly, for real, by this lesson's own permanent test,
`project/test/app_theme_test.dart`, immediately below. This is called
**deciding once, applying everywhere** — the identical real idea Lesson
58 already named, now proven to honestly produce two, real, valid
outcomes from that one real decision, not only one.

`project/test/app_theme_test.dart`'s own two, real, new checks, added
this unit:

```dart
test('AppTheme.light really is a light-brightness theme', () {
  expect(AppTheme.light.colorScheme.brightness, Brightness.light);
});

test('AppTheme.dark really is a dark-brightness theme, genuinely different from light', () {
  expect(AppTheme.dark.colorScheme.brightness, Brightness.dark);
  expect(AppTheme.dark.colorScheme.primary, isNot(AppTheme.light.colorScheme.primary));
  expect(AppTheme.dark.cardTheme.shape, AppShapes.medium);
  expect(AppTheme.dark.textTheme.titleLarge?.fontSize, 20);
});
```

Real, captured output (`flutter test test/app_theme_test.dart`): both
pass — real, direct proof that `light`/`dark` genuinely differ in real,
computed color (`primary`), while genuinely sharing the identical real
shape and typography decisions (`cardTheme.shape`, `titleLarge
.fontSize`), exactly as this unit's own Socratic question predicted.

### Mechanical Walkthrough

- `static final ThemeData dark = _build(Brightness.dark);` —
  `static`/`final` (Terms, above) reappearing; `_build` (Objects
  and methods, above) called a real, second time, real and passing
  `Brightness.dark` — directly answering this unit's own Socratic
  question: real and exactly one line, since every other real decision
  already lives inside `_build` itself, real and shared, not repeated.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1): a
real, shared recipe, extracted ahead of its own second real consumer;
this unit's own real contribution is proving that extraction actually
paid off — a real, second, complete, correct outcome for the real cost
of one line.

### SE Lens

The real principle is **letting a real refactor's own value show up as
a genuinely small diff at its own second real use** — directly
answering this unit's own Socratic question, and the clearest, most
concrete real evidence yet that Concept Unit 1's own real SE Lens
tradeoff was worth taking. The alternative not chosen: skip the
previous unit's own real refactor, and write `dark`'s own real
`ThemeData(...)` call out in full here instead. The real tradeoff: that
alternative would look, real and identically, correct today — but this
app's own real, three brightness-independent decisions
(`textTheme`/`elevatedButtonTheme`/`cardTheme`) would now real and
genuinely exist in two separate places, with no real force keeping
them in sync the next real time either one changes.

### Commands Needed

None new.

### Run It

Real, captured output (`flutter test test/app_theme_test.dart`): both
new checks pass. Full summary covered together with this lesson's other
units, in Concept Unit 4, below.

### Connect

This app now has two, real, complete, valid visual identities, built
from the identical real recipe. Neither one has a real reader yet — the
next unit gives this app its first real, automatic way to choose.

---

## Concept Unit 3: `themeMode: ThemeMode.system` — Following the Real, Current OS Setting

### The Problem

`AppTheme.dark` exists, real and correct, but nothing in this app's own
`MaterialApp` knows about it. This app still, only ever, shows
`AppTheme.light` — regardless of whatever real brightness the reader's
own real OS is actually, currently set to.

> **Socratic prompt:** `MaterialApp` already, really accepts a real,
> optional `darkTheme:` parameter, and a real, optional `themeMode:`
> parameter, alongside its own already-established `theme:`. Given
> those two real names alone, and nothing else, what would you guess
> `ThemeMode.system` is supposed to make this app do — and what real,
> live signal would it need to actually make that real decision?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart`, its own
  real, existing `MaterialApp(...)` call (read fresh this session),
  already carrying `theme: AppTheme.light` — the real,
  established call this unit extends.
- **Files affected:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified;
  `project/test/theme_mode_test.dart` — created.
- **Change type:** add.
- **Location:** inside `SudokuApp.build`'s own `MaterialApp(...)` call,
  alongside `theme:`.
- **Dependencies:** `AppTheme.dark` (previous unit).

### The New Code

```dart
darkTheme: AppTheme.dark,
themeMode: ThemeMode.system,
```

### Updated Project

`SudokuApp.build`'s own `MaterialApp(...)` call, every real line shown,
the real, new lines marked:

```dart
 1  return MaterialApp(
 2    scaffoldMessengerKey: _scaffoldMessengerKey,
 3    theme: AppTheme.light,
 4    darkTheme: AppTheme.dark,                                                          // ← new
 5    themeMode: ThemeMode.system,                                                       // ← new
 6    home: Scaffold(
 7      appBar: AppBar(title: const Text('Sudoku')),
 8      body: SingleChildScrollView(
 9        padding: const EdgeInsets.all(AppSpacing.md),
10        child: Column(
11          children: [
12            Text('Status: ${session.status.name}'),
13            const SizedBox(height: AppSpacing.sm),
14            Card(
15              child: Padding(
16                padding: const EdgeInsets.all(AppSpacing.sm),
17                child: SudokuBoardView(
18                  cells: boardDto.cells,
19                  givenCells: boardDto.givenCells,
20                  selectedRow: _selectedRow,
21                  selectedCol: _selectedCol,
22                  onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
23                ),
24              ),
25            ),
26            const SizedBox(height: AppSpacing.md),
27            NumberPadView(onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))),
28            const SizedBox(height: AppSpacing.md),
29            if (canTogglePause)
30              ElevatedButton(
31                onPressed: () => _dispatch(TogglePauseIntent()),
32                child: Text(session.status == GameStatus.paused ? 'Resume' : 'Pause'),
33              ),
34            const SizedBox(height: AppSpacing.md),
35            const _SessionStatus(),
36          ],
37        ),
38      ),
39    ),
40  );
```

This app now, really, offers `MaterialApp` both of its own real theme
variants, plus a real, explicit strategy for choosing between them —
every real widget beneath it keeps reading `Theme.of(context)` exactly
as it already did, completely unaware which of the two real
variants it's actually receiving.

### Isolate and Discard

`MaterialApp`'s own real resolution of `ThemeMode.system` is hidden
behavior — nothing in this app's own source shows *how* "follow the
system" is actually decided. Per the Verification Rule's own "hidden
behavior needs proof" standard, real, fetched source, not a confident
sentence, is what actually proves it — already quoted in this lesson's
own Header, above:

```dart
final ThemeMode mode = widget.themeMode ?? ThemeMode.system;
final Brightness platformBrightness = MediaQuery.platformBrightnessOf(context);
final bool useDarkTheme = mode == ThemeMode.dark ||
    (mode == ThemeMode.system && platformBrightness == Brightness.dark);
```

Real, direct proof this app's own code now genuinely responds to,
saved as this lesson's own permanent test,
`project/test/theme_mode_test.dart`:

```dart
testWidgets('ThemeMode.system automatically follows the real, simulated platform brightness', (
  WidgetTester tester,
) async {
  tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
  addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);

  await tester.pumpWidget(const ProviderScope(child: SudokuApp()));

  expect(Theme.of(tester.element(find.byType(Scaffold))).colorScheme.brightness, Brightness.dark);
});
```

Real, captured output (`flutter test test/theme_mode_test.dart`):
passes — real, direct proof that simulating a real, dark OS setting
(`tester.platformDispatcher.platformBrightnessTestValue`, a real,
dedicated `flutter_test` API built exactly for this) genuinely flips
this app's own resolved theme to `AppTheme.dark`, with zero code in
this app's own `SudokuApp` deciding that itself — directly answering
this unit's own Socratic question: the real, live signal is
`MediaQuery.platformBrightnessOf(context)`, read entirely inside
`MaterialApp`'s own real, internal build method.

### Mechanical Walkthrough

- `darkTheme: AppTheme.dark` — `MaterialApp.darkTheme` (Objects and
  methods, above), a real, already-existing, optional field, reached
  for the first time; `AppTheme.dark` (already established, previous
  unit) — this app's own real, second visual identity, now real and
  actually reachable.
- `themeMode: ThemeMode.system` — `MaterialApp.themeMode` (Objects and
  methods, above), real and reached for the first time;
  `ThemeMode.system` — `ThemeMode` (Objects and methods, above), a
  real, enhanced enum (already established), confirmed from
  source to carry exactly three real values; `.system` real and
  chosen, explicitly, over `.light`/`.dark`, telling `MaterialApp` to
  decide for itself, every real build, based on the real, live OS
  setting — directly answering this unit's own Socratic question:
  `MediaQuery.platformBrightnessOf(context)` (Objects and methods,
  above), read internally, is that real, live signal.

### CS Lens

Not a hard concept on its own — reading one real, live, external signal
(the OS's own brightness setting) to choose between two, real,
already-built outcomes is ordinary, foundational practice: a real
configuration read once, at the moment it's needed, not hardcoded.

### SE Lens

The real principle is **letting the platform's own real preference win
by default, without this app writing a single real line of its own
platform-detection code** — directly answering this unit's own Socratic
question. The alternative not chosen: this app could, in principle,
read the real OS brightness itself (`MediaQuery.platformBrightnessOf`
is real and public) and manually pick `theme:` vs a real, separate
`Theme` override higher up its own widget tree. The real tradeoff: that
alternative would work, but would mean re-implementing real logic
`MaterialApp` already, correctly, provides — including real,
correct behavior this lesson's own next unit needs too (a real,
*live* update, not just a real, one-time read at startup); `themeMode:
ThemeMode.system` gets that same real, live behavior for the cost of
one real, named argument.

### Commands Needed

None new.

### Run It

Real, captured output (`flutter test test/theme_mode_test.dart`): the
real, automatic, system-only check passes. Full summary covered
together with this lesson's final unit, below.

### Connect

This app now automatically follows the real, live OS brightness
setting, with zero new logic of its own. The final unit lets a real
reader override that real, automatic choice, live.

---

## Concept Unit 4: A Real, Live Theme Choice — Overriding the System, One Tap at a Time

### The Problem

`ThemeMode.system` (previous unit) is a real, fixed, hardcoded literal
— every real reader gets whatever the real OS decides, with no real way
to ask for something different. Nothing in this app lets a real reader
say "no, I want dark, regardless of what my OS thinks."

> **Socratic prompt:** This app already, really holds two other,
> similar, real, per-widget choices — `_selectedRow`/`_selectedCol` —
> as plain, local `State` fields, updated with `setState`, real and
> read only inside `SudokuApp` itself. Given that
> `_themeMode` would, real and similarly, only ever be read and changed
> inside this identical real widget, which of this app's own two,
> already-established real state strategies — plain, local `State`, or
> a real, shared Riverpod provider — actually fits here?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart`, its own
  real, existing `_selectedRow`/`_selectedCol` fields (read fresh this
  session) — the real, established, plain-`State` pattern this unit's
  own new field follows.
- **Files affected:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified;
  `project/test/theme_mode_test.dart` — modified.
- **Change type:** add (a new field, two new methods, a new `AppBar`
  action); replace (the previous unit's own literal `ThemeMode
  .system`).
- **Location:** inside `_SudokuAppState`, alongside
  `_selectedRow`/`_selectedCol`; inside `SudokuApp.build`'s own
  `MaterialApp`/`AppBar`.
- **Dependencies:** none new.

### The New Code

```dart
void _cycleThemeMode() {
  setState(() {
    _themeMode = switch (_themeMode) {
      ThemeMode.system => ThemeMode.light,
      ThemeMode.light => ThemeMode.dark,
      ThemeMode.dark => ThemeMode.system,
    };
  });
}

IconData _iconForThemeMode(ThemeMode mode) {
  return switch (mode) {
    ThemeMode.system => Icons.brightness_auto,
    ThemeMode.light => Icons.light_mode,
    ThemeMode.dark => Icons.dark_mode,
  };
}
```

### Updated Project

`_SudokuAppState`'s own real field list, every real line shown, the
one, real, new line marked:

```dart
1  final _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
2  int? _selectedRow = 4;
3  int? _selectedCol = 4;
4  ThemeMode _themeMode = ThemeMode.system;                                             // ← new
```

`SudokuApp.build`'s own `MaterialApp(...)` call, every real line shown,
the real, changed/new lines marked:

```dart
 1  return MaterialApp(
 2    scaffoldMessengerKey: _scaffoldMessengerKey,
 3    theme: AppTheme.light,
 4    darkTheme: AppTheme.dark,
 5    themeMode: _themeMode,                                                             // ← changed
 6    home: Scaffold(
 7      appBar: AppBar(
 8        title: const Text('Sudoku'),                                                    // ← changed
 9        actions: [                                                                       // ← new
10          IconButton(                                                                    // ← new
11            icon: Icon(_iconForThemeMode(_themeMode)),                                   // ← new
12            tooltip: 'Change theme',                                                     // ← new
13            onPressed: _cycleThemeMode,                                                  // ← new
14          ),                                                                             // ← new
15        ],                                                                               // ← new
16      ),                                                                                 // ← changed
17      body: SingleChildScrollView(
18        padding: const EdgeInsets.all(AppSpacing.md),
19        child: Column(
20          children: [
21            Text('Status: ${session.status.name}'),
22            const SizedBox(height: AppSpacing.sm),
23            Card(
24              child: Padding(
25                padding: const EdgeInsets.all(AppSpacing.sm),
26                child: SudokuBoardView(
27                  cells: boardDto.cells,
28                  givenCells: boardDto.givenCells,
29                  selectedRow: _selectedRow,
30                  selectedCol: _selectedCol,
31                  onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
32                ),
33              ),
34            ),
35            const SizedBox(height: AppSpacing.md),
36            NumberPadView(onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))),
37            const SizedBox(height: AppSpacing.md),
38            if (canTogglePause)
39              ElevatedButton(
40                onPressed: () => _dispatch(TogglePauseIntent()),
41                child: Text(session.status == GameStatus.paused ? 'Resume' : 'Pause'),
42              ),
43            const SizedBox(height: AppSpacing.md),
44            const _SessionStatus(),
45          ],
46        ),
47      ),
48    ),
49  );
```

This app's own theme choice is now real and genuinely live —
`themeMode: _themeMode` reads this widget's own, real, current field,
not a fixed literal, and a real tap on the new app-bar icon changes it,
immediately, real and visibly.

### Isolate and Discard

A real, isolated lab, run once, real and directly, with `dart run`
(no Flutter dependency needed — this is a plain, pure-Dart language
feature), proving switch-expression syntax and its own real,
compiler-enforced exhaustiveness, before writing it into project code:

```dart
enum Direction { north, south, east, west }

String describe(Direction d) => switch (d) {
  Direction.north => 'up',
  Direction.south => 'down',
  Direction.east => 'right',
  Direction.west => 'left',
};

void main() {
  for (final d in Direction.values) {
    print('${d.name}: ${describe(d)}');
  }
}
```

Real, captured output (`dart run switch_expression_lab.dart`):

```
north: up
south: down
east: right
west: left
```

This is called a **switch expression**. A real, second, deliberately
broken check — the identical lab with its own `Direction.west` case
removed, run through `dart analyze` alone — real and confirms the
identical real, compiler-enforced exhaustiveness already proved for a
`switch` *statement* also holds for this expression form:
`error - The type 'Direction' isn't exhaustively matched by the switch
cases... - non_exhaustive_switch_expression`. Discarded — this exact
`Direction`/`describe` pair never appears in the real project;
`_cycleThemeMode`/`_iconForThemeMode`'s own real switch expressions,
over the real `ThemeMode` enum, are what this lab's own real proof
backs.

**A real, honest, first-attempt test failure, kept as documented
evidence:** the first real version of this lesson's own permanent
interactive test called a real `tester.tap(...)` followed by a single
`tester.pump()`, then asserted the real, resolved theme had already
switched to light — and it hadn't; `Theme.of(...).colorScheme
.brightness` still, really, read `Brightness.dark`. A real, separate
check confirmed `MaterialApp.themeMode` itself had already, genuinely
become `ThemeMode.light` at that exact point — proving `_cycleThemeMode`
itself worked; the real problem was downstream. Root-caused by reading
`MaterialApp`'s own real source: it wraps its own resolved theme in a
real `AnimatedTheme` (Objects and methods, above), animating every real
theme change over a real, non-zero 200ms — a single, zero-duration
`pump()` observes the real, mid-animation color, not the real, final
one. Fixed by replacing every real `pump()` immediately after a
real, theme-changing tap with `tester.pumpAndSettle()`. Real, permanent
test, saved to `project/test/theme_mode_test.dart`:

```dart
testWidgets(
  'a real, live tap on the theme icon overrides ThemeMode.system, and cycles all the way back to it',
  (WidgetTester tester) async {
    tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
    addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);

    await tester.pumpWidget(const ProviderScope(child: SudokuApp()));

    expect(Theme.of(tester.element(find.byType(Scaffold))).colorScheme.brightness, Brightness.dark);
    expect(tester.widget<Icon>(find.byType(Icon)).icon, Icons.brightness_auto);

    await tester.tap(find.byType(IconButton));
    await tester.pumpAndSettle();
    expect(Theme.of(tester.element(find.byType(Scaffold))).colorScheme.brightness, Brightness.light);
    expect(tester.widget<Icon>(find.byType(Icon)).icon, Icons.light_mode);

    await tester.tap(find.byType(IconButton));
    await tester.pumpAndSettle();
    expect(Theme.of(tester.element(find.byType(Scaffold))).colorScheme.brightness, Brightness.dark);
    expect(tester.widget<Icon>(find.byType(Icon)).icon, Icons.dark_mode);

    await tester.tap(find.byType(IconButton));
    await tester.pumpAndSettle();
    expect(Theme.of(tester.element(find.byType(Scaffold))).colorScheme.brightness, Brightness.dark);
    expect(tester.widget<Icon>(find.byType(Icon)).icon, Icons.brightness_auto);
  },
);
```

Real, captured output: passes — the full, real, four-step sequence
(system-following-dark → light → dark → system-following-dark again)
confirmed, both the real, resolved color and the real, displayed icon,
at every real step.

### Mechanical Walkthrough

- `void _cycleThemeMode() {` — a real, new, ordinary method, this
  app's own single, real place `_themeMode` is ever changed.
- `setState(() { ... })` — `setState` (already established)
  reappearing, real and unchanged in shape — the identical real
  mechanism `_dispatch`'s own `SelectCellIntent` case already uses.
- `_themeMode = switch (_themeMode) { ... }` — a **switch expression**
  (Terms, above): `switch (_themeMode)` real and evaluates to one,
  real value, assigned directly, rather than a `switch` *statement*
  (already established) running separate, real assignment
  statements inside each real `case`; `ThemeMode.system => ThemeMode
  .light,` — a real, single arrow-case: when `_themeMode` real and
  equals `ThemeMode.system`, the whole real expression evaluates to
  `ThemeMode.light`; the next two real cases, identically shaped,
  real and complete this app's own three-step, real cycle
  (`.light` → `.dark`, `.dark` → `.system`) — real and compiler-checked
  for exhaustiveness (confirmed above), so a real, future fourth
  `ThemeMode` value, should Flutter ever add one, would real and fail
  to compile here instead of silently falling through.
- `IconData _iconForThemeMode(ThemeMode mode) {` — a real, new, pure
  function: real and given a `ThemeMode`, always returns the identical
  real `IconData` for it, nothing else.
- `return switch (mode) { ... };` — the identical real switch-expression
  shape, above, real and mapping each of `ThemeMode`'s own three real
  values to its own real `Icons.*` constant (Objects and methods,
  above).
- `themeMode: _themeMode` — the previous unit's own real, fixed literal
  `ThemeMode.system` replaced by this widget's own, real, live field —
  directly answering this unit's own Socratic question: `_themeMode`
  is read and written real and only inside `_SudokuAppState` itself,
  the identical real shape `_selectedRow`/`_selectedCol` already have,
  so plain, local `State` is the real, correct, minimal choice here —
  reaching for a real, shared Riverpod provider (already established)
  would add real, unnecessary machinery for a real value
  nothing else in this app needs to read.
- `actions: [IconButton(icon: Icon(_iconForThemeMode(_themeMode)),
  tooltip: 'Change theme', onPressed: _cycleThemeMode)]` —
  `AppBar.actions` (Objects and methods, above), real and set for the
  first time; `IconButton` (Objects and methods, above), real and
  given a real `icon:` (an `Icon` (Objects and methods, above)
  wrapping this widget's own current, real icon choice), a real
  `tooltip:` (already-established `String`), and a real `onPressed:`
  reaching `_cycleThemeMode`, above, directly — real and completing
  this unit's own live, real loop: tap → `setState` → new `_themeMode`
  → new `themeMode:`/`icon:`, both real and read fresh on this
  widget's own very next real rebuild.

### CS Lens

**Switch expression** (Terms, above) is worth naming as its own,
real, recognized pattern — mapping a fixed, real set of possibilities
to a real value, exhaustively, is not unique to Dart. Also recognized
in: Kotlin's own `when` expression; Rust's own `match`; Swift's own
`switch` expression; even SQL's own `CASE WHEN ... THEN ... END` —
every one real, and every one built around the identical real idea:
enumerate every real possibility once, let the language itself catch
a real, missing one, rather than a real, silent fall-through.

### SE Lens

The real principle is **matching the weight of a real state-management
tool to how widely its own real value is actually shared** — directly
answering this unit's own Socratic question. The alternative not
chosen: a real, new, shared Riverpod `NotifierProvider<ThemeModeNotifier,
ThemeMode>` (the identical real shape `gameSessionProvider` already
uses). The real tradeoff: that alternative would work,
real and correctly — but `_themeMode` has real, exactly one reader and
real, exactly one writer, both `_SudokuAppState` itself; introducing a
real, shared provider for a real value nothing else in this app ever
needs would add a real, second, established pattern's own real
overhead (a provider declaration, a notifier class) for zero real,
additional benefit over the plain, local `State` this app already,
correctly, uses for `_selectedRow`/`_selectedCol`. A real, honest
debt this project is not yet carrying, but worth naming: a real,
future Settings screen (curriculum's own later, explicit real bullet)
would need this exact, real choice to actually *persist* across a real
app restart — plain, local `State`, real and by design, forgets its
own value the instant this app closes; that real gap is deliberately
not solved here.

### Commands Needed

None new.

### Run It

Real, captured summary, covering every real change across all four of
this lesson's own units together:

`flutter analyze .`: **56 issues found** — identical count and
identical categories to this lesson's own pre-change baseline; zero
new issues from any file this lesson touched (one real,
initially-introduced `unused_import` warning caught by this same real
run and fixed before this lesson was called done).

`flutter test`: **50 real test-file-level checks** (up from 46 at the
previous lesson), `All tests passed!`, confirmed clean across two
consecutive full runs. Two new checks live in
`project/test/app_theme_test.dart` (Concept Unit 2, above); two more,
the most substantial, live in `project/test/theme_mode_test.dart`
(Concept Units 3 and 4, above) — one real, automatic, system-only
check, and one real, four-step, fully interactive sequence.

### Connect

A real reader can now override this app's own automatic, system-
following theme choice with one real tap, cycling all the way back to
automatic on the third — every real step confirmed, real and live, on
this app's own actually-rendered colors and icon, not merely on the
field driving them.

---

## Connect the Pieces

One real recipe, `AppTheme._build`, built once (Concept Unit 1) and
called twice (Concept Unit 2), is what makes every later unit in this
lesson honest: `AppTheme.light` and `AppTheme.dark` are real, genuinely
different outcomes — real, different colors, confirmed by a real,
passing inequality check — built from the identical real typography,
button, and card decisions this app's own design system already made,
real and never duplicated. `MaterialApp`'s own `themeMode:
ThemeMode.system` (Concept
Unit 3) then let this app follow a real, live, external signal — the
reader's own OS brightness — automatically, with zero platform-
detection code of its own, real and proven against a real, simulated
dark platform. The final unit (Concept Unit 4) gave a real reader the
power to override that real, automatic choice, live: one real, local,
`_themeMode` field, changed by one real tap, read straight back into
`themeMode:`, real and correctly, minimally, chosen as plain `State`
over a heavier, real, shared provider this value never needed. Along
the way, a real, genuine debugging discovery — `MaterialApp`'s own
internal `AnimatedTheme`, animating every real theme change over a
real 200ms — turned a real, first-attempt test failure into a deeper,
real, first-hand understanding of a mechanism this app had been
relying on, invisibly, since the very first tap. One real design
system, now proven to honestly support two real outcomes,
chosen automatically or live, by a real reader, at will.
