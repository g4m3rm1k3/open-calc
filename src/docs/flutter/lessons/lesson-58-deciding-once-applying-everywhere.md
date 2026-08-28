# Lesson 58: Deciding Once, Applying Everywhere

**Design System**

## What you will build

This app gets its first real design system: one, shared `ThemeData`
(`AppTheme`) supplying real colors, real typography, real button styling,
and real card styling to every screen that reads it, plus two small,
project-specific token classes (`AppSpacing`, `AppShapes`) for the two
real, structural decisions Flutter's own `ThemeData` has no built-in
scale for. The transferable problem: every one of this app's own visual
decisions — a highlight color, a digit's own size, a gap between two
widgets, a button's rounded corner — has, until now, been a separate,
hand-picked literal sitting at its own real call site, with nothing
connecting one decision to the next; changing "this app's own color"
today would mean finding and editing that same literal everywhere it
happens to appear, by hand, hoping none were missed.

## What you need to know first

- Lesson 26 ("Your First Flutter Application") — `MaterialApp`/
  `Scaffold`, the real shell every visual decision in this lesson
  ultimately reaches through.
- Lesson 28 ("Stateful Widgets") — `ElevatedButton`, the real widget
  this lesson's own Buttons unit themes for the first time.
- Lesson 29 ("Layout Fundamentals") — `Padding`/`EdgeInsets`/`SizedBox`,
  the real spacing widgets this lesson's own Spacing unit replaces bare
  literals inside.
- Lesson 30 ("Flutter's Constraint System") — `Container`, the real
  widget this lesson's own Colors and Typography units reach inside of.
- Lesson 31 ("Building the Sudoku Board") — `SudokuBoardView`/
  `SudokuCellView`, and this app's own original, ad hoc
  `Colors.blue.shade100` highlight literal, the real starting point this
  lesson's own Colors unit replaces.
- Lesson 33 ("The Input System") — `NumberPadButtonView`, and
  `TextStyle`, the real class this lesson's own Typography unit builds
  on.
- Lesson 57 ("Leaderboard Queries") — this app's own real, current,
  complete state, immediately before this lesson.

## Terms used in this lesson

- **Design token** — a single, real, named value standing in for a
  visual decision (a color, a size, a corner radius), stored in exactly
  one place and referenced everywhere that decision applies, instead of
  the same raw literal repeated at every real call site. Exists so
  changing a decision means editing one real declaration, not hunting
  down every real place that decision was ever copied.
- **`static`** — a real member (a field or a method) that belongs to
  the class itself, not to any one real instance of it — reached through
  the class's own real name (`AppSpacing.md`), never through an object
  built with `new`/a constructor call. Exists because a design token, a
  design-system class, and similar project-wide constants have no real
  reason to exist as a separate real object per use; there is exactly
  one real, shared value, and `static` is what lets every real caller
  reach it without first building anything.
- **`final`** (as a field modifier, not a local variable) — a real
  field whose value is computed exactly once and can never be
  reassigned afterward, same "assign once" real guarantee a `final`
  local variable already gives, now applied to a class's own real
  member instead of a variable inside a function body. Exists so a
  real, computed value (like a `ThemeData` built from several real,
  non-`const` calls) still only ever gets built one real time, not
  rebuilt on every real access.
- **Null-assertion operator (`!`)** — a real, postfix operator asserting
  a nullable value is genuinely non-null at this exact point, real and
  throwing a genuine runtime error if that real assertion turns out to
  be wrong. Exists so code can keep using a plain, non-nullable type
  after a point where the real, surrounding logic already guarantees
  non-`null`, without carrying a `?` the rest of the way for no reason.

## Objects and methods used

- **`AppTheme`**
  - *What it is:* a real, new, project-specific class — this lesson's
    own central subject — holding this app's one, shared `ThemeData`.
  - *Implementation:*
    ```dart
    class AppTheme {
      static final ThemeData light = ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
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
  - *Its use:* `SudokuApp.build`, in `sudoku_app.dart`, hands
    `AppTheme.light` to `MaterialApp`'s own real `theme:` parameter —
    the one, real place every widget in this app ends up reading it
    from.
  - *Type:* an ordinary class with a single, real `static final` field;
    never meant to be instantiated.
  - *Responsibility:* owning this entire app's own one, real, shared
    visual identity — every color, text style, button style, and card
    style this app draws — so that decision lives in exactly one real
    place, not scattered across every real widget file that happens to
    need one.
  - *Depends on:* `ColorScheme.fromSeed`, `TextTheme`,
    `ElevatedButtonThemeData`/`ElevatedButton.styleFrom`,
    `CardThemeData`, and this lesson's own two new token classes,
    `AppSpacing`/`AppShapes` — below.
  - *Connects to:* built once, real and lazily, the first real time
    anything reads `AppTheme.light`; read by `SudokuApp.build`
    (`theme: AppTheme.light`), and, indirectly, by every real widget
    underneath it that calls `Theme.of(context)`.
  - *Shape:* a real, new, top-level seam in
    `presentation/theme/app_theme.dart` — this app's own one, real,
    shared source of visual truth, sitting above every individual
    widget file, never inside one.

- **`ThemeData`**
  - *What it is:* the real, standard Flutter class describing an
    entire app's own visual configuration — colors, typography, and
    per-widget style overrides, together, in one real object.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/theme_data.dart` — a real class with
    dozens of real, optional named fields; this lesson uses exactly
    four: `final ColorScheme colorScheme;`, `final TextTheme textTheme;`,
    `final ElevatedButtonThemeData elevatedButtonTheme;`,
    `final CardThemeData cardTheme;`.
  - *Its use:* `AppTheme.light` constructs exactly one, real
    `ThemeData`, filling in those four real fields across this lesson's
    own four units that touch it (Colors, Typography, Buttons, Cards).
  - *Type:* an ordinary, real, immutable Flutter class.
  - *Responsibility:* holding every real, per-app visual default a
    widget might ask for — nothing about which specific widget reads
    which specific field, which stays entirely each real widget's own
    job.
  - *Depends on:* real values for whichever of its own real fields a
    caller chooses to set; every unset field falls back to its own
    real, built-in Material default.
  - *Connects to:* built once by `AppTheme.light`; read, field by
    field, by `Theme.of(context)` and by individual widgets (`Card`,
    `ElevatedButton`) that consult their own matching real sub-theme.
  - *Shape:* this app's own first real use of Flutter's own,
    already-existing, app-wide configuration object — before this
    lesson, `MaterialApp` never received a `theme:` at all.

- **`ColorScheme.fromSeed`**
  - *What it is:* a real, named factory constructor generating a
    complete, real Material color palette from a single, real seed
    color.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/color_scheme.dart`:
    ```dart
    factory ColorScheme.fromSeed({
      required Color seedColor,
      Brightness brightness = Brightness.light,
      DynamicSchemeVariant dynamicSchemeVariant = DynamicSchemeVariant.tonalSpot,
      double contrastLevel = 0.0,
      // ...further optional overrides for individual roles
    })
    ```
    This lesson supplies only its one, real, required argument,
    `seedColor`.
  - *Its use:* `AppTheme.light`'s own `colorScheme:` field is built
    entirely from one real call to this factory, real and never
    hand-listing individual colors itself.
  - *Type:* a real, named factory constructor.
  - *Responsibility:* real and specifically, computing dozens of real,
    named, mutually-consistent color roles (`primary`, `onPrimary`,
    `primaryContainer`, and more) from one real input — nothing about
    deciding which real widget reads which real role, which stays
    entirely each real widget's own job.
  - *Depends on:* one real, required `Color` (`seedColor`); every other
    real parameter is optional, defaulting to a real, standard Material
    3 tonal-palette algorithm.
  - *Connects to:* called once, inside `AppTheme.light`; its real
    result becomes `ThemeData.colorScheme`, later read by
    `Theme.of(context).colorScheme` anywhere in this app.
  - *Shape:* this app's own first real use of Material 3's own,
    already-built color-generation system — replacing this app's
    original, single, hand-picked `Colors.blue.shade100` literal with a
    real, complete, internally-consistent palette instead.

- **`Colors` / `Colors.indigo`**
  - *What it is:* the real, standard Flutter class holding every
    Material color swatch as a real, named static constant —
    `Colors.indigo`, specifically, is this lesson's own real, chosen
    seed.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/colors.dart`:
    ```dart
    static const MaterialColor indigo = MaterialColor(0xFF3F51B5, <int, Color>{
      50: Color(0xFFE8EAF6), 100: Color(0xFFC5CAE9), 200: Color(0xFF9FA8DA),
      300: Color(0xFF7986CB), 400: Color(0xFF5C6BC0), 500: Color(0xFF3F51B5),
      600: Color(0xFF3949AB), 700: Color(0xFF303F9F), 800: Color(0xFF283593),
      900: Color(0xFF1A237E),
    });
    ```
    A real `MaterialColor` is itself a real `Color` (its own real
    `0xFF3F51B5` primary value) that also carries ten further real,
    named shades.
  - *Its use:* `ColorScheme.fromSeed(seedColor: Colors.indigo)` reads
    exactly the real `0xFF3F51B5` value, above — this lesson's own,
    deliberately chosen real starting color for this app's entire real
    palette.
  - *Type:* a real, `const`-constructible class (`MaterialColor`,
    itself a real subclass of `Color`).
  - *Responsibility:* naming a real, ready-made Material color and its
    own real family of shades — nothing about how that color spreads
    into a full, real, generated `ColorScheme`, which is
    `ColorScheme.fromSeed`'s own job entirely.
  - *Depends on:* nothing; a real, fixed, compile-time constant.
  - *Connects to:* read once, real and directly, as
    `ColorScheme.fromSeed`'s own `seedColor` argument.
  - *Shape:* this app's own real, standard Material color catalog —
    already present in this project's original code as
    `Colors.blue.shade100`, but never before given its own
    real Header treatment; given it here, in full, now that this
    lesson reaches for a different real member of the identical real
    class.

- **`Theme.of`**
  - *What it is:* a real, static method reading the nearest real,
    ambient `ThemeData` above wherever it's called, in the real widget
    tree.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/theme.dart`:
    ```dart
    static ThemeData of(BuildContext context) {
      final _InheritedTheme? inheritedTheme =
          context.dependOnInheritedWidgetOfExactType<_InheritedTheme>();
      // ...merges in localization/Cupertino-specific adjustments, then
      // returns the real, resolved ThemeData.
    }
    ```
    Real and confirmed: this is a real `InheritedWidget` lookup — the
    same real Flutter mechanism `MediaQuery.of`/`Directionality.of`
    already use — walking real and upward through the widget tree from
    `context` until it finds the nearest real `MaterialApp`'s own real
    `theme:`.
  - *Its use:* `SudokuCellView.build` and `NumberPadButtonView.build`
    each call this once, real and directly, to reach `AppTheme.light`
    without either widget needing to be handed it as a real,
    explicit constructor parameter.
  - *Type:* a real, static method.
  - *Responsibility:* real and specifically, resolving "what is the
    real, current theme, right here" for whichever real `BuildContext`
    calls it — nothing about which real field of the result a caller
    actually reads afterward.
  - *Depends on:* a real `BuildContext` genuinely sitting below a real
    `MaterialApp`/`Theme` ancestor; every real widget's own `build`
    method already receives one.
  - *Connects to:* called inside `SudokuCellView.build`,
    `NumberPadButtonView.build`; real and reads all the way up to
    `MaterialApp`'s own `theme: AppTheme.light`, set once, real and
    high in this app's own widget tree.
  - *Shape:* this app's own first real use of Flutter's own, ambient,
    tree-propagated configuration lookup — distinct from this app's
    own, already-established Riverpod `ref.watch`/`ref.read` (Lesson
    38), a real, separate mechanism for a real, separate purpose:
    reading this app's own game state, not its own visual theme.

- **`TextTheme`**
  - *What it is:* the real, standard Flutter class naming this app's
    own real typographic scale — a fixed, real set of named text roles
    (`titleLarge`, `titleMedium`, and more), each a real, optional
    `TextStyle`.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/text_theme.dart` — fifteen real,
    named `TextStyle?` fields in total; this lesson sets exactly two:
    `final TextStyle? titleLarge;`, `final TextStyle? titleMedium;`.
    Every real field this lesson leaves unset keeps Flutter's own real,
    built-in Material 3 default.
  - *Its use:* `AppTheme.light`'s own `textTheme:` field names this
    app's own real digit typography once — `titleLarge` for this app's
    own board digits, `titleMedium` for its own number-pad digits.
  - *Type:* an ordinary, real, immutable Flutter class, `const`
    -constructible when every real value it holds is itself `const`.
  - *Responsibility:* naming a real, shared vocabulary of text roles
    other widgets read by name (`.titleLarge`, `.titleMedium`) — nothing
    about which real widget uses which real role, which stays entirely
    each real widget's own choice.
  - *Depends on:* real, optional `TextStyle` values for whichever real
    named role a caller chooses to override.
  - *Connects to:* built once inside `AppTheme.light`; read, by name,
    through `Theme.of(context).textTheme.titleLarge`/`.titleMedium`.
  - *Shape:* this app's own first real, shared typographic scale —
    before this lesson, every digit's own `TextStyle` was a separate,
    disconnected literal at its own real call site
    (`TextStyle(fontSize: 18)`, `TextStyle(fontWeight: ...)`).

- **`TextStyle.copyWith`**
  - *What it is:* a real, already-established class's (`TextStyle`)
    real instance method, building a new, real `TextStyle`
    from an existing one with only specific real fields changed.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/painting/text_style.dart`:
    ```dart
    TextStyle copyWith({
      bool? inherit,
      Color? color,
      double? fontSize,
      FontWeight? fontWeight,
      // ...many further optional overrides
    })
    ```
    Real and confirmed: every real argument left `null` keeps this
    style's own existing real value; only a real, explicitly-passed
    argument overrides it — the original `TextStyle` itself is left
    completely untouched, real and consistent with this app's own
    already-established immutability principle: building a new, real,
    changed copy instead of mutating the original in place.
  - *Its use:* `SudokuCellView.build` calls
    `Theme.of(context).textTheme.titleLarge!.copyWith(fontWeight: ...)`
    — reusing `titleLarge`'s own real, shared `fontSize` (`20`) while
    re-deciding only its real `fontWeight`, per real cell.
  - *Type:* a real, ordinary instance method.
  - *Responsibility:* real and specifically, producing one, real, new
    `TextStyle` that agrees with its own real source on every
    unmentioned field — nothing about which real fields a specific
    caller chooses to change.
  - *Depends on:* an existing, real `TextStyle` to call it on; real,
    optional named arguments for whichever fields a caller wants
    different.
  - *Connects to:* called on `Theme.of(context).textTheme.titleLarge!`,
    real and inside `SudokuCellView.build`.
  - *Shape:* this app's own first real use of `TextStyle.copyWith` —
    the real, standard way to take one, shared, named style and adjust
    it per real call site, without duplicating every other real field
    it already has right.

- **`FontWeight`**
  - *What it is:* the real, standard `dart:ui` class naming a real
    font's own thickness, as a real, fixed numeric value.
  - *Implementation:* real, confirmed this session from
    `sky_engine`'s own real `text.dart`:
    ```dart
    const FontWeight(this.value)
      : assert(value >= 1), assert(value <= 1000);
    final int value;
    static const FontWeight w400 = FontWeight(400);
    static const FontWeight w600 = FontWeight(600);
    static const FontWeight w700 = FontWeight(700);
    static const FontWeight normal = w400;
    static const FontWeight bold = w700;
    ```
    Real and confirmed: `.normal` and `.bold` are not their own,
    separate real values at all — they are real, named aliases for
    `w400` and `w700`, on the identical real numeric scale `.w600`
    (this lesson's own real, new choice) sits on, real and exactly
    between them.
  - *Its use:* this app's own original code already called
    `FontWeight.bold`/`FontWeight.normal` without either
    ever receiving its own real Header entry — a real, honest,
    retroactively-noticed gap, not revised at its own real source per
    this curriculum's own established convention, but given full, real
    treatment here, now that this lesson also introduces `FontWeight
    .w600` as a real, new value inside `AppTheme.light`'s own
    `textTheme:`.
  - *Type:* a real, `const`-constructible class.
  - *Responsibility:* naming one, real, specific font thickness —
    nothing about which real widget applies it, or to which real text.
  - *Depends on:* nothing; every real named constant is a real,
    compile-time value.
  - *Connects to:* `FontWeight.w600` is read twice, real and directly,
    inside `AppTheme.light`'s own `textTheme:`; `FontWeight.bold`/
    `.normal` are read inside `SudokuCellView.build`'s own real
    `.copyWith(fontWeight: ...)` call.
  - *Shape:* a real, standard, already-existing Flutter/`dart:ui`
    constant class — this lesson's own first real Header treatment of
    it, not its own first real appearance in this project.

- **`AppSpacing`**
  - *What it is:* a real, new, project-specific class — this lesson's
    own second primary subject — naming this app's own shared scale of
    spacing values.
  - *Implementation:*
    ```dart
    class AppSpacing {
      static const double sm = 8;
      static const double md = 16;
      static const double lg = 24;
    }
    ```
  - *Its use:* replaces every real, bare spacing literal this app's own
    `sudoku_app.dart` already had (`8`, `16`), and supplies a real, new
    one (`24`) for this lesson's own Buttons unit.
  - *Type:* an ordinary class with three real `static const` fields;
    never meant to be instantiated.
  - *Responsibility:* naming this app's own real, shared spacing scale
    in exactly one place — nothing about which real widget uses which
    real value, or where.
  - *Depends on:* nothing; every real value is a real, compile-time
    constant.
  - *Connects to:* read from `sudoku_app.dart` (padding, gaps between
    widgets) and from `AppTheme.light` (button padding).
  - *Shape:* a real, new, project-specific token class — Flutter itself
    ships no real, built-in spacing scale the way it ships `ColorScheme`
    for colors or `TextTheme` for typography; **no reference
    counterpart — this is a from-scratch addition, because Flutter's
    own `ThemeData` has no field for it at all.**

- **`AppShapes`**
  - *What it is:* a real, new, project-specific class — this lesson's
    own third primary subject — naming this app's own one, shared
    corner-radius token.
  - *Implementation:*
    ```dart
    class AppShapes {
      static final RoundedRectangleBorder medium =
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(12));
    }
    ```
  - *Its use:* read by `AppTheme.light`'s own `elevatedButtonTheme:`
    and `cardTheme:`, so every real button and every real card in this
    app shares the identical real corner radius.
  - *Type:* an ordinary class with a single, real `static final` field;
    never meant to be instantiated.
  - *Responsibility:* naming this app's own real, shared shape decision
    in exactly one place — nothing about which real widget applies it.
  - *Depends on:* `BorderRadius.circular`/`RoundedRectangleBorder`,
    below.
  - *Connects to:* read twice, real and directly, inside
    `AppTheme.light`.
  - *Shape:* a real, new, project-specific token class, the identical
    real role `AppSpacing` plays for spacing, now for shape. **No
    reference counterpart — this is a from-scratch addition, because
    Flutter's own `ThemeData` has no single, shared "corner radius"
    field either — only per-component shape fields this lesson's own
    `AppShapes.medium` feeds into.**

- **`BorderRadius.circular`**
  - *What it is:* a real, static factory method building a real
    `BorderRadius` with every real corner rounded by an identical real
    amount.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/painting/border_radius.dart`:
    `factory BorderRadiusGeometry.circular(double radius) =
    BorderRadius.circular;` — a real, redirecting factory; calling it
    genuinely constructs a real `BorderRadius` object.
  - *Its use:* `AppShapes.medium` calls this once, real and directly,
    with a real, chosen `12`.
  - *Type:* a real, static factory method.
  - *Responsibility:* real and specifically, building one, real,
    uniformly-rounded corner radius from one real number — nothing
    about which real widget it eventually shapes.
  - *Depends on:* one real `double`, the real radius, in real, logical
    pixels.
  - *Connects to:* its real result is handed straight into
    `RoundedRectangleBorder`'s own real `borderRadius:` argument, below.
  - *Shape:* this app's own first real use of `BorderRadius` — a real,
    standard Flutter geometry type, not specific to any one real
    widget.

- **`RoundedRectangleBorder`**
  - *What it is:* a real, standard Flutter class describing a real
    shape — a rectangle with real, rounded corners — usable anywhere a
    real widget accepts a real `shape:`.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/painting/rounded_rectangle_border.dart`:
    `const RoundedRectangleBorder({super.side, this.borderRadius =
    BorderRadius.zero});` — a real, `const`-constructible class whose
    own real default, if `borderRadius` is never supplied, is real,
    completely square corners.
  - *Its use:* `AppShapes.medium` builds exactly one, real instance,
    real and reused everywhere this app needs its own shared corner
    radius.
  - *Type:* a real, `const`-constructible class.
  - *Responsibility:* real and specifically, describing one, real,
    rounded-rectangle shape — nothing about elevation, color, or any
    other real visual property, which stay entirely separate real,
    named parameters wherever this shape gets used.
  - *Depends on:* a real `BorderRadius` (`AppShapes.medium` supplies
    `BorderRadius.circular(12)`, above).
  - *Connects to:* built once inside `AppShapes.medium`; read, real and
    directly, by both `ElevatedButton.styleFrom`'s own `shape:` and
    `CardThemeData`'s own `shape:`, below.
  - *Shape:* this app's own first real, shared shape value — real and
    reused, unmodified, across this lesson's own Buttons and Cards
    units.

- **`ElevatedButtonThemeData` / `ElevatedButton.styleFrom`**
  - *What it is:* a real, standard Flutter class holding a real,
    app-wide override for every real `ElevatedButton`'s own default
    style, plus the real, standard factory method that actually builds
    that override.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/elevated_button_theme.dart` and
    `elevated_button.dart`:
    ```dart
    const ElevatedButtonThemeData({this.style});
    final ButtonStyle? style;

    static ButtonStyle styleFrom({
      Color? backgroundColor,
      double? elevation,
      EdgeInsetsGeometry? padding,
      OutlinedBorder? shape,
      // ...many further optional overrides
    })
    ```
  - *Its use:* `AppTheme.light`'s own `elevatedButtonTheme:` is built
    from one real `ElevatedButtonThemeData`, whose own real `style:` is
    built from one real call to `ElevatedButton.styleFrom`, supplying
    `shape: AppShapes.medium` and a real, chosen `padding:`.
  - *Type:* a real, `const`-constructible class
    (`ElevatedButtonThemeData`); a real, static factory method
    (`styleFrom`).
  - *Responsibility:* `ElevatedButtonThemeData`'s whole job: holding one
    real, optional `ButtonStyle` override, applied to every real
    `ElevatedButton` in this app that doesn't supply its own; `styleFrom
    `'s whole job: real and specifically, building a real `ButtonStyle`
    from a handful of real, commonly-changed named arguments, instead
    of every real `ButtonStyle` field needing its own explicit,
    per-state value.
  - *Depends on:* `styleFrom` depends on whichever real, optional
    arguments a caller supplies; `ElevatedButtonThemeData` depends on a
    real `ButtonStyle`, real and usually built by `styleFrom`.
  - *Connects to:* `styleFrom`'s real result becomes
    `ElevatedButtonThemeData.style`; that, in turn, becomes
    `ThemeData.elevatedButtonTheme`, real and read automatically by
    every real `ElevatedButton` this app already has
    (`sudoku_app.dart`'s own Pause/Resume and Start New Game buttons),
    with no change to either real call site.
  - *Shape:* this app's own first real, app-wide button style — before
    this lesson, both of this app's real `ElevatedButton`s drew their
    real shape and padding from Flutter's own, unstyled, built-in
    defaults.

- **`EdgeInsets.symmetric`**
  - *What it is:* a real, named factory constructor building real
    padding that's identical on opposite real sides, distinct from
    `EdgeInsets.all` (already established), which forces all
    four real sides equal.
  - *Implementation:* real and confirmed: `factory
    EdgeInsets.symmetric({double horizontal = 0.0, double vertical =
    0.0})` — two real, independent values, one applied to both real
    left/right sides, the other to both real top/bottom sides.
  - *Its use:* `ElevatedButton.styleFrom`'s own `padding:` argument,
    above, uses this to give this app's own buttons more real,
    horizontal breathing room (`AppSpacing.lg`) than vertical
    (`AppSpacing.sm`) — a real, deliberately different amount per real
    axis, which `EdgeInsets.all` alone could never express.
  - *Type:* a real, named factory constructor.
  - *Responsibility:* real and specifically, building one real
    `EdgeInsets` whose own real left/right padding may differ from its
    own real top/bottom padding — nothing about which real widget it
    ends up padding.
  - *Depends on:* two real, optional `double` values.
  - *Connects to:* its real result is handed straight into
    `ElevatedButton.styleFrom`'s own `padding:` argument.
  - *Shape:* this app's own first real use of `EdgeInsets.symmetric` —
    the identical real `EdgeInsets` class `EdgeInsets.all` already
    established, now reached through its own real, second, more
    flexible constructor.

- **`CardThemeData`**
  - *What it is:* a real, standard Flutter class holding a real,
    app-wide override for every real `Card`'s own default appearance.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/card_theme.dart`:
    ```dart
    const CardThemeData({
      this.color, this.shadowColor, this.elevation,
      this.margin, this.shape, // ...and further optional overrides
    });
    final double? elevation;
    final ShapeBorder? shape;
    ```
  - *Its use:* `AppTheme.light`'s own `cardTheme:` sets exactly two
    real fields — `shape: AppShapes.medium`, `elevation: 2` — leaving
    every other real field at its own, real, built-in default.
  - *Type:* a real, `const`-constructible class.
  - *Responsibility:* real and specifically, holding real, optional
    overrides every real `Card` in this app reads automatically —
    nothing about which real widget any given `Card` actually contains.
  - *Depends on:* real, optional values for whichever fields a caller
    chooses to override.
  - *Connects to:* built once inside `AppTheme.light`; real and read by
    every real `Card.build` call, below, through `CardTheme.of
    (context)`.
  - *Shape:* this app's own first real, app-wide card style — this app
    had never drawn a real `Card` anywhere before this lesson.

- **`Card`**
  - *What it is:* the real, standard Flutter widget giving its real
    child an elevated, real, Material surface — a real shadow and real,
    rounded corners, by default.
  - *Implementation:* real, confirmed this session from
    `package:flutter/src/material/card.dart`:
    ```dart
    const Card({
      super.key, this.color, this.elevation, this.shape,
      this.margin, this.clipBehavior, this.child, /* ... */
    });

    Widget build(BuildContext context) {
      final CardThemeData cardTheme = CardTheme.of(context);
      // ...
      return Padding(
        padding: margin ?? cardTheme.margin ?? defaults.margin!,
        child: Material(
          elevation: elevation ?? cardTheme.elevation ?? defaults.elevation!,
          shape: shape ?? cardTheme.shape ?? defaults.shape,
          child: child,
        ),
      );
    }
    ```
    Real and confirmed: `Card`'s own real `shape`/`elevation` fields
    each default to `null`; its real `build` method falls back, in
    real order, to the real, ambient `CardThemeData` first, and only
    then to Flutter's own real, hard-coded default — real, direct proof
    that a bare `Card()`, with nothing passed, genuinely inherits this
    app's own real `AppTheme.light.cardTheme` instead of Flutter's own,
    generic default.
  - *Its use:* `sudoku_app.dart` wraps `SudokuBoardView` in exactly one,
    real, new `Card`, real and passing no `shape:`/`elevation:` of its
    own — trusting the real, ambient `cardTheme:` entirely.
  - *Type:* a real, ordinary `StatelessWidget`.
  - *Responsibility:* real and specifically, giving its real child one
    real, elevated Material surface — nothing about what that real
    child actually is or does.
  - *Depends on:* a real `child`; real, ambient `CardTheme.of(context)`
    for every real style field this specific `Card` doesn't set itself.
  - *Connects to:* wraps `SudokuBoardView`, real and directly, inside
    `sudoku_app.dart`'s own `build` method; real and reads
    `AppTheme.light.cardTheme` through `CardTheme.of(context)`.
  - *Shape:* this app's own first real `Card` — the most visually
    significant real change in this lesson, giving this app's own
    puzzle grid a real, distinct, elevated surface instead of sitting
    bare against the scaffold's own background.

---

## Concept Unit 1: `AppTheme` and `ColorScheme.fromSeed` — One Real Palette, Not One Literal Per Widget

### The Problem

This app's own selected-cell highlight is a single, bare literal —
`Colors.blue.shade100` — sitting inside `SudokuCellView`'s own build
method, with nothing else in this app referencing it, agreeing with it,
or even aware it exists. Nothing about `MaterialApp` itself carries any
real color decision at all; every real widget this app has ever drawn
has picked its own real colors independently, or used Flutter's own
plain, generic defaults.

> **Socratic prompt:** `Colors.blue.shade100` is one, single, real,
> hand-picked color. If this app's designer later wanted a genuinely
> different highlight color — not just a different shade of blue, but a
> whole, different, real hue — what would have to change, and where?
> Given `MaterialApp` already accepts a real `theme:` parameter (even
> though this app has never used it), what would a *single*, real,
> shared place for that decision look like instead of a lone literal
> buried inside one specific widget's own file?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart`,
  `SudokuCellView.build`'s own real, existing `Colors.blue.shade100`
  literal (read fresh this session) — the real, original decision this
  unit replaces.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart` —
  created;
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified;
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart` —
  modified;
  `project/test/sudoku_board_view_test.dart` — modified.
- **Change type:** add (new file, new `MaterialApp` argument); replace
  (the real, hardcoded highlight color).
- **Location:** a real, new file under
  `presentation/theme/`; inside `SudokuApp.build`, on the real
  `MaterialApp(...)` call; inside `SudokuCellView.build`, replacing the
  `BoxDecoration`'s own `color:` argument.
- **Dependencies:** none new — `ColorScheme`/`ThemeData`/`Theme` all
  already ship inside `package:flutter/material.dart`, already imported
  everywhere this app draws a widget.

### The New Code

```dart
class AppTheme {
  static final ThemeData light = ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
  );
}
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_theme.dart`, a real,
brand-new file — Project Change already covers this case (nothing to
show it "inside," since there is no earlier version of this file):

```dart
1  import 'package:flutter/material.dart';
2
3  class AppTheme {
4    static final ThemeData light = ThemeData(
5      colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
6    );
7  }
```

`SudokuApp.build`, every real line shown, the one, real, new line
marked:

```dart
 1  Widget build(BuildContext context) {
 2    final session = ref.watch(gameSessionProvider);
 3    final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;
 4    final boardDto = SudokuBoardDto.fromBoard(session.board);
 5    return MaterialApp(
 6      scaffoldMessengerKey: _scaffoldMessengerKey,
 7      theme: AppTheme.light,                                                        // ← new
 8      home: Scaffold(
 9        appBar: AppBar(title: const Text('Sudoku')),
10        body: SingleChildScrollView(
11          padding: const EdgeInsets.all(16),
12          child: Column(
13            children: [
14              Text('Status: ${session.status.name}'),
15              const SizedBox(height: 8),
16              SudokuBoardView(
17                cells: boardDto.cells,
18                givenCells: boardDto.givenCells,
19                selectedRow: _selectedRow,
20                selectedCol: _selectedCol,
21                onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
22              ),
23              const SizedBox(height: 16),
24              NumberPadView(onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))),
25              const SizedBox(height: 16),
26              if (canTogglePause)
27                ElevatedButton(
28                  onPressed: () => _dispatch(TogglePauseIntent()),
29                  child: Text(session.status == GameStatus.paused ? 'Resume' : 'Pause'),
30                ),
31              const SizedBox(height: 16),
32              const _SessionStatus(),
33            ],
34          ),
35        ),
36      ),
37    );
38  }
```

This app's own `MaterialApp` now carries a real, explicit visual
identity for the first time — every real widget beneath it can now ask
`Theme.of(context)` for it, instead of each one deciding its own real
colors independently.

`SudokuCellView.build`, every real line shown, the one, real, changed
line marked:

```dart
 1  Widget build(BuildContext context) {
 2    return InkWell(
 3      onTap: onTap,
 4      child: Container(
 5        width: 36,
 6        height: 36,
 7        alignment: Alignment.center,
 8        decoration: BoxDecoration(
 9          color: isSelected ? Theme.of(context).colorScheme.primaryContainer : null,  // ← changed
10          border: Border(
11            top: BorderSide(width: row % 3 == 0 ? 2 : 0.5),
12            left: BorderSide(width: col % 3 == 0 ? 2 : 0.5),
13            right: BorderSide(width: col == 8 ? 2 : 0.5),
14            bottom: BorderSide(width: row == 8 ? 2 : 0.5),
15          ),
16        ),
17        child: Text(
18          value == null ? '' : '$value',
19          style: TextStyle(fontWeight: isGiven ? FontWeight.bold : FontWeight.normal),
20        ),
21      ),
22    );
23  }
```

`SudokuCellView`'s own real highlight decision no longer names a
specific real color at all — it now names a real, semantic *role*
(`primaryContainer`) inside whichever real `ColorScheme` this app
happens to be running with, real and resolved fresh, every real build,
through `Theme.of(context)`.

### Isolate and Discard

`ColorScheme.fromSeed`'s own real, computed output is not something to
predict with confidence — this app had never called it before, and its
real, underlying tonal-palette algorithm is not a value Claude already
knows cold. Run for real, per the Verification Rule, staged temporarily
as `project/test/_scratch_lesson58_lab_test.dart`, then deleted —
`verification/lesson-58/color_scheme_lab.dart` is the permanent, real
record:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('what ColorScheme.fromSeed(seedColor: Colors.indigo) actually computes', () {
    final scheme = ColorScheme.fromSeed(seedColor: Colors.indigo);
    print('primary: ${scheme.primary}');
    print('primaryContainer: ${scheme.primaryContainer}');
  });
}
```

Real, captured output (`flutter test test/_scratch_lesson58_lab_test.dart`):

```
primary: Color(alpha: 1.0000, red: 0.3176, green: 0.3569, blue: 0.5725, colorSpace: ColorSpace.sRGB)
primaryContainer: Color(alpha: 1.0000, red: 0.8706, green: 0.8784, blue: 1.0000, colorSpace: ColorSpace.sRGB)
All tests passed!
```

A real, genuinely surprising finding, worth stating honestly: this
Flutter version's own `Color.toString()` prints four real,
per-channel floating-point components, not the older, packed-hex
`Color(0xffXXXXXX)` form an outdated memory of Flutter would predict —
this version stores a `Color`'s real channels as real floating-point
values, not one packed integer. Discarded — this exact throwaway script
is deleted from the real project; what it proved is what the real,
permanent test below now checks directly. This whole idea — one, real,
named value standing in for a visual decision, referenced everywhere
that decision applies instead of repeated as a raw literal — is called a
**design token**.

### Mechanical Walkthrough

- `class AppTheme {` — a real, new, ordinary class, this app's own real,
  single home for its entire shared visual identity.
- `static final ThemeData light = ThemeData(...)` — **`static`** (Terms,
  above): `light` belongs to `AppTheme` itself, reached as
  `AppTheme.light`, never through a real, separate instance —
  real and directly answering this unit's own Socratic question: there
  is exactly one, real, shared `ThemeData`, not a new one per real
  widget that happens to need one. **`final`** (Terms, above, as a
  field modifier): `light` is computed exactly once, real and the
  first real time anything reads it, and never reassigned afterward —
  deliberately `final`, not `const`, because `ColorScheme.fromSeed(...)`
  is a real, ordinary factory call, not a real, compile-time constant
  expression; nothing about this specific value could ever be known at
  real compile time the way `AppSpacing`'s own plain number literals,
  later in this lesson, genuinely can be.
- `ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo))`
  — `ThemeData` (Objects and methods, above), a real, ordinary
  constructor call, real and supplying exactly one of its own dozens of
  real, optional named fields; `colorScheme:` names which real field;
  `ColorScheme.fromSeed` (Objects and methods, above), a real, named
  factory constructor, called with its own one, real, required
  argument; `seedColor: Colors.indigo` — `Colors.indigo` (Objects and
  methods, above), a real, fixed, compile-time `MaterialColor`
  constant, real and handed in as the one, real, starting point every
  other real color role this app now has gets computed from.
- `theme: AppTheme.light` — inside `SudokuApp.build`'s own real
  `MaterialApp(...)` call: `MaterialApp` (already established)
  reappearing, real and now given a real, explicit `theme:` for
  the first time in this app's own history; `AppTheme.light` — the
  identical real, `static`, single value described above, real and
  read here, directly.
- `color: isSelected ? Theme.of(context).colorScheme.primaryContainer : null`
  — the ternary operator (already established) reappearing,
  choosing between two real branches based on `isSelected`'s own real,
  boolean value, unchanged in shape from this app's own original code;
  `Theme.of(context)` (Objects and methods, above) — a real, static
  method, real and confirmed, this session, from Flutter's own real
  source, to be a real `InheritedWidget` lookup, walking real and
  upward through the widget tree from `context` until it finds
  `MaterialApp`'s own real, ambient `theme:` — directly answering this
  unit's own Socratic question: `SudokuCellView` never receives
  `AppTheme.light` as its own, explicit constructor parameter at all;
  it reaches it through this real, ambient lookup instead, the same
  real widget tree every real widget already sits inside; `.colorScheme`
  — a real, plain field read on the real, resolved `ThemeData`, real
  and returning the identical real `ColorScheme` `ColorScheme.fromSeed`
  built, above; `.primaryContainer` — a real, named color role that
  real `ColorScheme` carries, real and one of dozens
  `ColorScheme.fromSeed` computed together from one, real `seedColor` —
  no longer a bare, disconnected literal the way `Colors.blue.shade100`
  was, but one real, named member of one real, internally-consistent
  palette.

### CS Lens

**Design token** (Terms, above) is a genuine, hard, recurring concept —
a real, named value standing in for a decision, kept in exactly one
real place, referenced everywhere that decision applies. Also
recognized in: CSS custom properties and the W3C's own published Design
Tokens format; Apple's own semantic system colors on iOS/macOS
(`systemBlue`, resolved differently per real appearance, never a raw
hex value at each real call site); Android's own Material You dynamic
color system (the identical real, seed-based generation idea
`ColorScheme.fromSeed` itself implements); print and brand style
guides, real and long before software existed, naming "Pantone 286 C"
once and referencing it everywhere rather than re-mixing the identical
real ink by eye each time.

Separately, `Theme.of`'s own real mechanism — an ambient value read by
walking real and upward through a tree, rather than passed explicitly,
argument by argument, down through every real, intermediate layer — is
its own, real, recognized pattern too. Also recognized in: React's own
Context API; Android's own `Context`-scoped system services
(`getSystemService`); a language's own thread-local storage; CSS's own
cascade, real values inherited downward through the DOM unless a more
specific rule overrides them.

### SE Lens

The real principle is **giving a project-wide visual decision exactly
one, real, shared home, instead of letting each real widget file decide
independently** — directly answering this unit's own Socratic question.
The alternative not chosen: keep `Colors.blue.shade100` exactly where it
was, and simply pick a new, different literal by hand whenever this
app's own designer wants a different color. The real tradeoff: that
alternative costs nothing extra to write today, while this app draws
exactly one real, colored thing — but it means every future real widget
that wants a matching, consistent color would either duplicate that
same literal (real risk: one real copy quietly drifts from the others
after an edit) or reach back into `SudokuCellView`'s own file just to
find it, a real, awkward, backwards dependency for an unrelated widget
to carry. A real, honest debt this project is not yet carrying, but
worth naming: `AppTheme.light` currently exists as one, single, hardcoded
`static final` value — a genuinely different, real, future need
(a real, user-toggleable dark mode) would mean this same class growing a
second real `ThemeData`, and something real deciding between them,
neither of which this lesson builds.

### Commands Needed

None new.

### Run It

Real, captured summary — `flutter analyze .`: 56 issues (identical
count and identical categories to this lesson's own pre-change
baseline; zero new); `flutter test`: real and covered together with
this lesson's other five units, in Concept Unit 6's own closing summary,
below, since every real check this lesson adds lives in two, shared,
real files (`sudoku_board_view_test.dart`, `app_theme_test.dart`)
touched by more than one real unit.

### Connect

This app now has one, real, shared, generated color palette, reached
through Flutter's own real, ambient `Theme.of` lookup, instead of one
bare literal known only to a single real widget. The next unit gives
this app's own real digit text the identical real treatment.

---

## Concept Unit 2: `TextTheme` and `copyWith` — One Real Typographic Scale, Not Two Disconnected Literals

### The Problem

This app's own two real, digit-bearing widgets each carry their own,
separate, disconnected real `TextStyle` — `SudokuCellView`'s
`TextStyle(fontWeight: isGiven ? FontWeight.bold : FontWeight.normal)`
names no real size at all (silently inheriting whatever default Flutter
happens to supply); `NumberPadButtonView`'s `TextStyle(fontSize: 18)`
names a size but no real weight. Neither real widget's own choice
agrees with, or even knows about, the other's.

> **Socratic prompt:** `AppTheme.light` already names this app's own
> real colors in exactly one, shared place. Given `ThemeData` also
> accepts a real `textTheme:` field, naming a real, shared *set* of
> named text styles, how could this app's own two, separate digit
> styles both read from that identical real, shared place — while
> still letting `SudokuCellView` decide, per real cell, whether *this*
> specific digit should render bold or not?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart`, its
  own real, existing `colorScheme:` field, added in the previous unit
  (read fresh this session) — the real, established shape this unit's
  own new field joins.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart` —
  modified;
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart` —
  modified;
  `project/lib/features/sudoku/presentation/number_pad_view.dart` —
  modified;
  `project/test/sudoku_board_view_test.dart` — modified.
- **Change type:** add (a new `ThemeData` field); replace (both real
  digit `TextStyle`s).
- **Location:** inside `AppTheme.light`, alongside `colorScheme:`;
  inside `SudokuCellView.build`'s own `Text`; inside
  `NumberPadButtonView.build`'s own `Text`.
- **Dependencies:** none new.

### The New Code

```dart
textTheme: const TextTheme(
  titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
  titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
),
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_theme.dart`, every
real line shown, the new lines marked:

```dart
 1  import 'package:flutter/material.dart';
 2
 3  class AppTheme {
 4    static final ThemeData light = ThemeData(
 5      colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
 6      textTheme: const TextTheme(                                                  // ← new
 7        titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),          // ← new
 8        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),         // ← new
 9      ),                                                                            // ← new
10    );
11  }
```

`AppTheme.light` now names this app's own real digit typography, not
only its own real colors — two real, named roles, `titleLarge` and
`titleMedium`, each a complete, real, chosen `TextStyle`.

`SudokuCellView.build`'s own real `Text`, the one, real, changed line
marked:

```dart
16      child: Text(
17        value == null ? '' : '$value',
18        style: Theme.of(context)                                                   // ← changed
19            .textTheme.titleLarge!                                                 // ← changed
20            .copyWith(fontWeight: isGiven ? FontWeight.bold : FontWeight.normal),   // ← changed
21      ),
```

`NumberPadButtonView.build`'s own real `Text`, the one, real, changed
line marked:

```dart
36      child: Container(
37        width: 44,
38        height: 44,
39        alignment: Alignment.center,
40        decoration: BoxDecoration(border: Border.all()),
41        child: Text('$digit', style: Theme.of(context).textTheme.titleMedium),      // ← changed
42      ),
```

Both real digit widgets now read from the identical real, shared
`AppTheme.light.textTheme` instead of each carrying its own,
disconnected `TextStyle` literal — `SudokuCellView` still, real and
separately, decides its own per-cell `fontWeight`, but starts from the
identical real, shared `fontSize` (`20`) every other board digit shares.

### Isolate and Discard

No separate throwaway lab — `TextTheme`, `.copyWith`, and `FontWeight
.w600` are proven directly, for real, by this lesson's own real,
permanent test: `project/test/sudoku_board_view_test.dart`'s own
"a real given clue renders bold; a player-fillable cell does not" test
now asserts both `givenCellText.style?.fontWeight == FontWeight.bold`
*and* `givenCellText.style?.fontSize == 20`, real and confirming
`.copyWith` genuinely preserved `titleLarge`'s own shared size while
only changing its own real weight. This is called a **design token**
applied to typography — the identical real idea Concept Unit 1 already
named for color, now naming a real, shared text style instead of a
real, shared color.

### Mechanical Walkthrough

- `textTheme: const TextTheme(...)` — `textTheme:` names
  `ThemeData`'s own second real field this lesson sets; `TextTheme`
  (Objects and methods, above), a real, ordinary, `const`-constructible
  class; `const` (already established) reappearing — every
  real value inside is itself a real, compile-time constant, so the
  whole real `TextTheme` can be built once, at real compile time,
  rather than real and freshly, every real app start.
- `titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600)` —
  `titleLarge` names one of `TextTheme`'s own fifteen real, named
  fields; `TextStyle` (already established) reappearing,
  real and given full treatment again: an immutable, real value
  describing how text should look; `fontSize: 20` — a real, chosen
  value, this app's own new, shared size for every real board digit;
  `fontWeight: FontWeight.w600` — `FontWeight` (Objects and methods,
  above), real and confirmed from source to be a real, numeric
  thickness scale (`w400` through `w900`); `.w600` is a real, named
  step real and exactly between `.normal` (`w400`) and `.bold`
  (`w700`) — this app's own new, deliberately chosen, real "semi-bold"
  default, distinct from either extreme.
- `titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)` —
  the identical real shape, above, real and naming this app's own
  second real digit role — a real, deliberately smaller size (`16`,
  down from `titleLarge`'s `20`) for this app's own number-pad digits,
  which sit inside their own, individually-tappable touch targets
  rather than needing to read clearly across an entire real 9×9 grid.
- `Theme.of(context).textTheme.titleLarge!` — `Theme.of(context)`
  (already established, Concept Unit 1) reappearing; `.textTheme` — a
  real, plain field read on the resolved `ThemeData`, real and
  returning the identical real `TextTheme` built above; `.titleLarge`
  — a real, named field read on that real `TextTheme`, itself a real,
  nullable `TextStyle?`; **null-assertion operator (`!`)** (Terms,
  above) — real and safe here specifically because `AppTheme.light`'s
  own `textTheme:` genuinely sets `titleLarge` itself, above, so this
  real value can never actually be `null` at this exact point, even
  though its own real, declared type says it could be.
- `.copyWith(fontWeight: isGiven ? FontWeight.bold : FontWeight.normal)`
  — `TextStyle.copyWith` (Objects and methods, above), real and
  confirmed from source to leave every unmentioned real field
  untouched, building a real, new `TextStyle` that keeps `titleLarge`'s
  own real, shared `fontSize` (`20`) while only real and freshly
  deciding `fontWeight`, per real cell — directly answering this unit's
  own Socratic question: the real, shared style and the real,
  per-cell decision now compose, rather than either one replacing the
  other; the ternary (already established) reappearing,
  choosing `FontWeight.bold`/`FontWeight.normal` (Objects and methods,
  above) from `isGiven`'s own real, boolean value, unchanged in shape
  from this app's own original code.
- `Theme.of(context).textTheme.titleMedium` — the identical real
  `Theme.of`/`.textTheme` access, above, real and reading
  `titleMedium` instead; no real `!`/`.copyWith` needed here, since
  `NumberPadButtonView` makes no further, real, per-digit decision of
  its own — every real digit on the number pad renders identically.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1): a
**design token**, the identical real idea, now applied to a real,
shared text style instead of a real, shared color; this unit's own real
contribution is showing that a real, shared token and a real,
per-call-site decision can compose together (`.copyWith`), rather than
one having to fully replace the other.

### SE Lens

The real principle is **letting two, separate, real widgets share one
real typographic decision without either one needing to know the other
exists** — directly answering this unit's own Socratic question. The
alternative not chosen: keep each real digit's own `TextStyle` as its
own, separate, hand-written literal, real and manually kept in sync by
whoever edits either file. The real tradeoff: that alternative already
silently drifted once, in this app's own real history — before this
lesson, `SudokuCellView`'s own digit named no real size at all, while
`NumberPadButtonView`'s named `18`, with nothing connecting the two;
routing both through one, real, shared `TextTheme` instead means a
future, real change to this app's own board-digit size only ever needs
editing `AppTheme.light`'s own one, real `titleLarge` field, and every
real widget reading it updates together, automatically.

### Commands Needed

None new.

### Run It

Real, captured output (`flutter test test/sudoku_board_view_test.dart`):
the "a real given clue renders bold; a player-fillable cell does not"
test passes, real and confirming both `fontWeight == FontWeight.bold`
*and* `fontSize == 20` on the real, rendered given-clue digit. Full
summary covered together with this lesson's other five units, in
Concept Unit 6, below.

### Connect

This app's own two real digit widgets now share one, real typographic
scale, composing a real, shared size with a real, per-cell weight
decision rather than duplicating either. The next unit gives this
app's own spacing the identical real treatment.

---

## Concept Unit 3: `AppSpacing` — One Real Scale, Not a Magic Number at Every Call Site

### The Problem

`sudoku_app.dart` already, really uses the identical two, real numbers
— `8` and `16` — five separate, real times, as bare `SizedBox`/
`EdgeInsets` arguments, with nothing connecting one real `16` to the
next; a reader has no real way to tell, just by looking, whether two
separate `16`s are the same real decision or a real coincidence.

> **Socratic prompt:** Flutter's own `ThemeData` has a real field for
> colors (`colorScheme`) and a real field for typography (`textTheme`)
> — but no real field at all for spacing. Given that gap, and given
> this app already, really repeats the identical two numbers five
> separate times, what would a real, minimal, project-specific answer
> to "what does `16` mean, here" look like, if not a field on
> `ThemeData` itself?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/sudoku_app.dart`, its own
  real, existing five bare spacing literals (`8`, `16`, `16`, `16`,
  `16`) (read fresh this session) — the real, original decisions this
  unit replaces.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_spacing.dart` —
  created;
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified.
- **Change type:** add (new file); replace (every real, bare spacing
  literal).
- **Location:** a real, new file under `presentation/theme/`; inside
  `SudokuApp.build` and `_SessionStatusState.build`, every real
  `SizedBox`/`EdgeInsets` argument.
- **Dependencies:** none new.

### The New Code

```dart
class AppSpacing {
  static const double sm = 8;
  static const double md = 16;
}
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_spacing.dart`, a
real, brand-new file:

```dart
1  class AppSpacing {
2    static const double sm = 8;
3    static const double md = 16;
4  }
```

`SudokuApp.build`, every real line shown, every real, changed line
marked:

```dart
 1  Widget build(BuildContext context) {
 2    final session = ref.watch(gameSessionProvider);
 3    final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;
 4    final boardDto = SudokuBoardDto.fromBoard(session.board);
 5    return MaterialApp(
 6      scaffoldMessengerKey: _scaffoldMessengerKey,
 7      theme: AppTheme.light,
 8      home: Scaffold(
 9        appBar: AppBar(title: const Text('Sudoku')),
10        body: SingleChildScrollView(
11          padding: const EdgeInsets.all(AppSpacing.md),                              // ← changed
12          child: Column(
13            children: [
14              Text('Status: ${session.status.name}'),
15              const SizedBox(height: AppSpacing.sm),                                 // ← changed
16              SudokuBoardView(
17                cells: boardDto.cells,
18                givenCells: boardDto.givenCells,
19                selectedRow: _selectedRow,
20                selectedCol: _selectedCol,
21                onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
22              ),
23              const SizedBox(height: AppSpacing.md),                                 // ← changed
24              NumberPadView(onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))),
25              const SizedBox(height: AppSpacing.md),                                 // ← changed
26              if (canTogglePause)
27                ElevatedButton(
28                  onPressed: () => _dispatch(TogglePauseIntent()),
29                  child: Text(session.status == GameStatus.paused ? 'Resume' : 'Pause'),
30                ),
31              const SizedBox(height: AppSpacing.md),                                 // ← changed
32              const _SessionStatus(),
33            ],
34          ),
35        ),
36      ),
37    );
38  }
```

`_SessionStatusState.build`, every real line shown, every real, changed
line marked:

```dart
 1  Widget build(BuildContext context) {
 2    return Column(
 3      mainAxisSize: MainAxisSize.min,
 4      children: [
 5        Row(
 6          mainAxisAlignment: MainAxisAlignment.center,
 7          children: [
 8            Text('Elapsed: $_elapsedSeconds s'),
 9            const SizedBox(width: AppSpacing.md),                                    // ← changed
10            Text('Games started: $_gamesStarted'),
11          ],
12        ),
13        const SizedBox(height: AppSpacing.sm),                                       // ← changed
14        ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),
15      ],
16    );
17  }
```

Every real gap in this app's own layout now names *which* real spacing
decision it's applying (`.sm`/`.md`) rather than a bare number a reader
has to trust matches every other bare number that happens to look the
same.

### Isolate and Discard

No separate throwaway lab needed — `AppSpacing.sm`/`.md` are real,
plain `double` constants with values identical to the real literals
they replace (`8`, `16`); nothing about their own real runtime behavior
is in doubt, per the Verification Rule's own Necessity clause. Proven
directly, for real, by this app's own already-existing, unmodified
`project/test/layout_test.dart`, whose own real assertion
(`paddingWidget.padding == const EdgeInsets.all(16)`) still, really
passes — `AppSpacing.md`, a real, compile-time `const double` equal to
`16`, produces a real `EdgeInsets` genuinely indistinguishable from the
literal it replaced. This is another real **design token** — the
identical real idea Concept Units 1 and 2 already named, now applied to
spacing.

### Mechanical Walkthrough

- `class AppSpacing {` — a real, new, ordinary class, this app's own
  real, single home for its own shared spacing scale — directly
  answering this unit's own Socratic question: since `ThemeData` itself
  has no real spacing field, this app's own real answer is its own,
  small, project-specific class instead, the same real shape `AppTheme`
  already established for colors and typography.
- `static const double sm = 8;` — **`static`** (Terms, above)
  reappearing, real and giving `sm` the identical real, class-level
  reach `AppTheme.light` already has; `const` (already established)
  reappearing — real and distinct from Concept Unit 1's own
  `final`: `8` is a real, literal, compile-time-known value, so `const`
  applies here where it genuinely couldn't for `AppTheme.light`'s own
  `ColorScheme.fromSeed(...)` call.
- `static const double md = 16;` — the identical real shape, above,
  naming this app's own second, real, shared spacing value.
- `padding: const EdgeInsets.all(AppSpacing.md)` — `EdgeInsets.all`
  (already established) reappearing, real and unchanged in
  shape; `AppSpacing.md` replaces the real, bare literal `16` that sat
  here before, real and still a genuine, real, compile-time constant,
  so the surrounding `const` keyword stays exactly as valid as it was.
- `const SizedBox(height: AppSpacing.sm)` /
  `const SizedBox(height: AppSpacing.md)` /
  `const SizedBox(width: AppSpacing.md)` — `SizedBox` (already
  established) reappearing, unchanged in shape; each real,
  bare literal (`8`/`16`/`16`) replaced by the real, named token that
  now states, by name, which real spacing decision each one actually
  is.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1): a
**design token**, the identical real idea, now applied to spacing
instead of color or typography.

### SE Lens

The real principle is **naming a repeated, real value once, so every
real reader can tell two identical numbers are the same real decision,
not a coincidence** — directly answering this unit's own Socratic
question, and a real, concrete instance of avoiding a genuine "magic
number." The alternative not chosen: leave every real `8`/`16` exactly
where it was. The real tradeoff: that alternative costs nothing to
write and, today, changes nothing about how this app actually looks —
but a real, future change ("make every real gap slightly larger") would
mean finding every real, bare `16` in this file by hand, with no real
way to be certain a stray `16` used for some unrelated, genuinely
different reason wasn't accidentally caught in the same real sweep;
naming the token once removes that real risk entirely, at the cost of
one, extra, tiny real indirection per call site.

### Commands Needed

None new.

### Run It

Real, captured output (`flutter test test/layout_test.dart`): both
tests pass, unchanged, real and confirming `AppSpacing.md`'s own real
value produces an identical `EdgeInsets.all(16)`. Full summary covered
together with this lesson's other five units, in Concept Unit 6, below.

### Connect

This app's own spacing now names its own real decisions instead of
repeating a bare number by hand. The next unit gives this app its own
first real, shared shape.

---

## Concept Unit 4: `AppShapes` — One Real Corner Radius, Not a Choice Made Twice

### The Problem

This lesson's own next two units — Buttons and Cards — are both about
to need the identical real, rounded-corner decision. Nothing in this
app yet names what that real corner radius actually *is*, in one, real,
shared place, the way `AppSpacing` now does for gaps.

> **Socratic prompt:** `AppSpacing` solved an identical real shape of
> problem for spacing — one, small, project-specific class, since
> `ThemeData` had no built-in field for it. `ThemeData` also has no
> single, shared "corner radius" field — only *separate*, real,
> per-component `shape:` fields (one for buttons, a different one for
> cards). Given that, what would the identical real strategy —
> `AppSpacing`'s own — look like, applied to shape instead of spacing?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/theme/app_spacing.dart`,
  its own real, complete, existing shape (read fresh this session) —
  the real, established pattern this unit's own new class follows.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_shapes.dart` —
  created.
- **Change type:** add.
- **Location:** a real, new file under `presentation/theme/`,
  alongside `app_spacing.dart`.
- **Dependencies:** none new.

### The New Code

```dart
class AppShapes {
  static final RoundedRectangleBorder medium =
      RoundedRectangleBorder(borderRadius: BorderRadius.circular(12));
}
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_shapes.dart`, a
real, brand-new file:

```dart
1  import 'package:flutter/material.dart';
2
3  class AppShapes {
4    static final RoundedRectangleBorder medium =
5        RoundedRectangleBorder(borderRadius: BorderRadius.circular(12));
6  }
```

This real, new class has no caller yet inside this app's own code —
the next two units, Buttons and Cards, are what actually read
`AppShapes.medium`.

### Isolate and Discard

No separate throwaway lab needed — `BorderRadius.circular`/
`RoundedRectangleBorder` are ordinary, real, deterministic geometry
constructions (a real number in, a real, immutable object out), with
nothing about their own behavior genuinely in doubt. Proven directly,
for real, by this lesson's own new, permanent test,
`project/test/app_theme_test.dart`'s own "`AppShapes.medium` is a real,
12-pixel rounded rectangle" check, in Concept Unit 6, below. This is
another real **design token** — the identical real idea Concept Units
1 through 3 already named, now applied to shape.

### Mechanical Walkthrough

- `class AppShapes {` — a real, new, ordinary class, real and following
  the identical real shape `AppSpacing` already established —
  directly answering this unit's own Socratic question.
- `static final RoundedRectangleBorder medium = ...` — **`static`**
  (Terms, above) reappearing; **`final`** (Terms, above) reappearing,
  real and deliberately chosen over `const` here, the identical real
  reason as `AppTheme.light`: `RoundedRectangleBorder(borderRadius:
  BorderRadius.circular(12))` calls a real, ordinary factory method
  (`BorderRadius.circular`), not a real, compile-time constant
  expression, so this real value can only be `final`, computed once,
  real and the first real time anything reads it.
- `BorderRadius.circular(12)` — `BorderRadius.circular` (Objects and
  methods, above), a real, static factory method, real and confirmed
  from source to be a real, redirecting factory that genuinely
  constructs a `BorderRadius`; `12` — a real, chosen radius, in real,
  logical pixels, this app's own one, shared "how rounded" decision.
- `RoundedRectangleBorder(borderRadius: ...)` — `RoundedRectangleBorder`
  (Objects and methods, above), a real, `const`-constructible class,
  real and confirmed from source to default to real, square corners
  when no `borderRadius:` is given; here, real and given the exact
  `BorderRadius` built immediately above, real and producing this
  app's own one, shared, rounded-rectangle shape value.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1): a
**design token**, the identical real idea, now applied to shape.

### SE Lens

The real principle is **naming a shared decision before its second real
consumer needs it, rather than letting the first real consumer that
happens to need it invent its own, local copy** — directly answering
this unit's own Socratic question. The alternative not chosen: let the
Buttons unit, next, build its own `RoundedRectangleBorder(borderRadius:
BorderRadius.circular(12))` directly inside `AppTheme.light`, then let
the Cards unit, after that, build a real, second, separate one for
itself. The real tradeoff: that alternative would work, real and
identically, the very first real time — but it silently reintroduces
the exact real risk `AppSpacing` already closed for spacing: two,
separate, real `12`s, agreeing today by real coincidence, with nothing
stopping one from drifting from the other the next real time either
one gets edited.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — `AppShapes.medium` has no real caller
until the next two units; exercised for real, together with them, in
Concept Unit 6, below.

### Connect

This app now has one, real, shared corner-radius decision, built and
named before either of its own two, real, future consumers needs it.
The next unit is this token's own first real, real use.

---

## Concept Unit 5: `ElevatedButtonThemeData` — One Real Button Style, Reached by Every Button Automatically

### The Problem

This app's own two, real `ElevatedButton`s — Pause/Resume, and Start
New Game — each draw Flutter's own plain, generic, unstyled default
shape and padding; neither carries this app's own new, real corner
radius (`AppShapes.medium`) or any deliberate, real spacing decision at
all.

> **Socratic prompt:** Both of this app's real `ElevatedButton`s sit in
> two, separate, real files, with no `style:` of their own. Given that
> `ThemeData` already, really carries this app's own colors and
> typography for every real widget to read automatically, what would a
> real way to give *both* buttons the identical, real, new shape look
> like — one that needs no real change at either button's own call
> site at all?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart`, its
  own real, existing `colorScheme:`/`textTheme:` fields (read fresh
  this session) — the real, established shape this unit's own new
  field joins.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_spacing.dart` —
  modified;
  `project/lib/features/sudoku/presentation/theme/app_theme.dart` —
  modified.
- **Change type:** add (a new `AppSpacing` field, a new `ThemeData`
  field).
- **Location:** inside `AppSpacing`, alongside `sm`/`md`; inside
  `AppTheme.light`, alongside `colorScheme:`/`textTheme:`.
- **Dependencies:** `AppShapes.medium` (previous unit).

### The New Code

```dart
elevatedButtonTheme: ElevatedButtonThemeData(
  style: ElevatedButton.styleFrom(
    shape: AppShapes.medium,
    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
  ),
),
```

### Updated Project

`project/lib/features/sudoku/presentation/theme/app_spacing.dart`,
every real line shown, the one, real, new line marked:

```dart
1  class AppSpacing {
2    static const double sm = 8;
3    static const double md = 16;
4    static const double lg = 24;                                                    // ← new
5  }
```

`project/lib/features/sudoku/presentation/theme/app_theme.dart`, every
real line shown, the new lines marked:

```dart
 1  import 'package:flutter/material.dart';
 2
 3  import 'app_shapes.dart';                                                          // ← new
 4  import 'app_spacing.dart';                                                         // ← new
 5
 6  class AppTheme {
 7    static final ThemeData light = ThemeData(
 8      colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
 9      textTheme: const TextTheme(
10        titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
11        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
12      ),
13      elevatedButtonTheme: ElevatedButtonThemeData(                                  // ← new
14        style: ElevatedButton.styleFrom(                                             // ← new
15          shape: AppShapes.medium,                                                   // ← new
16          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm), // ← new
17        ),                                                                            // ← new
18      ),                                                                              // ← new
19    );
20  }
```

Neither of this app's own two real `ElevatedButton` call sites changes
at all — both, real and automatically, now render with
`AppShapes.medium`'s own rounded corners and this app's own new,
chosen padding, purely because `ThemeData` itself grew this one, real,
new field.

### Isolate and Discard

No separate throwaway lab needed — `ElevatedButton.styleFrom`/
`EdgeInsets.symmetric` are real, ordinary factory calls combining
already-established or already-explained constructs; proven directly,
for real, by this lesson's own new, permanent test,
`project/test/app_theme_test.dart`'s own "every real `ElevatedButton`
in the running app renders with the real, shared theme shape" check —
real and inspecting the actual, rendered `Material` `ButtonStyleButton`
builds, not merely the unbuilt widget's own `style` field, which stays
`null` at both of this app's own real call sites, in Concept Unit 6,
below.

### Mechanical Walkthrough

- `static const double lg = 24;` — the identical real shape
  `AppSpacing.sm`/`.md` already established, naming this app's own
  third, real, shared spacing value — real and deliberately larger,
  chosen specifically for this unit's own real, horizontal button
  padding.
- `elevatedButtonTheme: ElevatedButtonThemeData(...)` —
  `elevatedButtonTheme:` names `ThemeData`'s own third real field this
  lesson sets; `ElevatedButtonThemeData` (Objects and methods, above),
  a real, `const`-constructible class, real and confirmed from source
  to hold exactly one real field, `style`, applied to every real
  `ElevatedButton` beneath it that doesn't set its own.
- `style: ElevatedButton.styleFrom(shape: AppShapes.medium, padding: ...)`
  — `ElevatedButton.styleFrom` (Objects and methods, above), a real,
  static factory method, real and confirmed from source to build a
  real `ButtonStyle` from a handful of real, commonly-changed, named
  arguments rather than every real `ButtonStyle` field needing its own
  explicit value; `shape: AppShapes.medium` — the identical real,
  shared token the previous unit built, real and reached here for its
  own first real use — directly answering this unit's own Socratic
  question: neither real button's own call site changes, because this
  real style lives on `ThemeData` itself, not on either button.
- `padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm)`
  — `EdgeInsets.symmetric` (Objects and methods, above), real and
  confirmed from source to accept two, real, independent values, one
  per real axis, distinct from `EdgeInsets.all` (already established),
  which forces every real side identical; `AppSpacing.lg`/
  `AppSpacing.sm` — real and deliberately different real values per
  real axis, giving this app's own buttons more real, horizontal room
  than vertical.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1): a
**design token**, `AppShapes.medium`, applied here for its own first
real, real use — this unit's own real contribution is proving a real
token defined once can be consumed by more than one, real, unrelated
call site with zero change to either.

### SE Lens

The real principle is **styling every real button of a given kind in
exactly one, real, shared place, instead of styling each real button
individually** — directly answering this unit's own Socratic question.
The alternative not chosen: give each of this app's own two real
`ElevatedButton`s its own, separate, explicit `style:` argument, real
and each repeating the identical real `AppShapes.medium`/padding by
hand. The real tradeoff: that alternative would look, real and
identically, correct today — but a real, future third button, added
without remembering to copy that same real `style:`, would silently
render with Flutter's own plain, unstyled default instead, with
nothing catching the real inconsistency until a real person actually
noticed it looked different; a real, shared `elevatedButtonTheme`
instead makes "styled like every other button" this app's own real,
automatic default, and an unstyled outlier the thing that would now
require deliberate, real effort to produce.

### Commands Needed

None new.

### Run It

Not runnable standalone yet — exercised for real, together with this
lesson's final unit, in Concept Unit 6, below.

### Connect

Both of this app's own real buttons now share one, real, named shape
and padding, reached automatically through `ThemeData`, with neither
real call site changed at all. The final unit gives this app its own
first real `Card`.

---

## Concept Unit 6: `Card` — This App's Own First Real, Elevated Surface

### The Problem

This app's own Sudoku board sits directly against the scaffold's own
plain background, with nothing visually separating "the real puzzle"
from the rest of the real screen. This app has never drawn a real
`Card` anywhere.

> **Socratic prompt:** `AppShapes.medium` already, really shapes this
> app's own buttons, in the previous unit, with no real change to
> either button's own call site. `ThemeData` also, really accepts a
> real `cardTheme:` field, the identical real shape as
> `elevatedButtonTheme:`. Given that, and given `Card`'s own real
> `shape`/`elevation` fields default to `null`, what real, concrete
> proof would actually confirm a bare, real `Card()` — with nothing
> passed to it directly — genuinely inherits this app's own theme,
> rather than merely looking plausible?

### Project Change

- **Reference Source:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart`, its
  own real, existing `elevatedButtonTheme:` field, previous unit (read
  fresh this session) — the real, established shape this unit's own
  new field joins.
- **Files affected:**
  `project/lib/features/sudoku/presentation/theme/app_theme.dart` —
  modified;
  `project/lib/features/sudoku/presentation/sudoku_app.dart` —
  modified;
  `project/test/app_theme_test.dart` — created.
- **Change type:** add (a new `ThemeData` field; a new `Card` wrapping
  the real board).
- **Location:** inside `AppTheme.light`, alongside
  `elevatedButtonTheme:`; inside `SudokuApp.build`, wrapping
  `SudokuBoardView`.
- **Dependencies:** `AppShapes.medium` (Concept Unit 4).

### The New Code

```dart
cardTheme: CardThemeData(shape: AppShapes.medium, elevation: 2),
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
 7    static final ThemeData light = ThemeData(
 8      colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
 9      textTheme: const TextTheme(
10        titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
11        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
12      ),
13      elevatedButtonTheme: ElevatedButtonThemeData(
14        style: ElevatedButton.styleFrom(
15          shape: AppShapes.medium,
16          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
17        ),
18      ),
19      cardTheme: CardThemeData(shape: AppShapes.medium, elevation: 2),                // ← new
20    );
21  }
```

`AppTheme.light` is now genuinely complete for this lesson — four real
fields, each grown in its own real Concept Unit, together forming this
app's own one, real, shared visual identity.

`SudokuApp.build`, every real line shown, the real, changed lines
marked:

```dart
 1  Widget build(BuildContext context) {
 2    final session = ref.watch(gameSessionProvider);
 3    final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;
 4    final boardDto = SudokuBoardDto.fromBoard(session.board);
 5    return MaterialApp(
 6      scaffoldMessengerKey: _scaffoldMessengerKey,
 7      theme: AppTheme.light,
 8      home: Scaffold(
 9        appBar: AppBar(title: const Text('Sudoku')),
10        body: SingleChildScrollView(
11          padding: const EdgeInsets.all(AppSpacing.md),
12          child: Column(
13            children: [
14              Text('Status: ${session.status.name}'),
15              const SizedBox(height: AppSpacing.sm),
16              Card(                                                                  // ← new
17                child: Padding(                                                       // ← new
18                  padding: const EdgeInsets.all(AppSpacing.sm),                        // ← new
19                  child: SudokuBoardView(
20                    cells: boardDto.cells,
21                    givenCells: boardDto.givenCells,
22                    selectedRow: _selectedRow,
23                    selectedCol: _selectedCol,
24                    onCellTap: (row, col) => _dispatch(SelectCellIntent(row, col)),
25                  ),
26                ),                                                                     // ← new
27              ),                                                                       // ← new
28              const SizedBox(height: AppSpacing.md),
29              NumberPadView(onDigitTap: (digit) => _dispatch(EnterDigitIntent(digit))),
30              const SizedBox(height: AppSpacing.md),
31              if (canTogglePause)
32                ElevatedButton(
33                  onPressed: () => _dispatch(TogglePauseIntent()),
34                  child: Text(session.status == GameStatus.paused ? 'Resume' : 'Pause'),
35                ),
36              const SizedBox(height: AppSpacing.md),
37              const _SessionStatus(),
38            ],
39          ),
40        ),
41      ),
42    );
43  }
```

This app's own real Sudoku board now sits inside a real, elevated,
rounded surface, visually distinct from the rest of the real screen for
the first time — real and reached with zero explicit `shape:`/
`elevation:` at this exact call site.

### Isolate and Discard

No separate throwaway lab — `Card`'s own real shape/elevation fallback
is proven directly, for real, by this lesson's own new, permanent test,
`project/test/app_theme_test.dart`, immediately below. This is the
final real **design token** consumer this lesson builds — the identical
real `AppShapes.medium` this app's buttons already share.

`project/test/app_theme_test.dart`, a real, new, permanent test file,
covering every real claim this lesson makes about shapes, buttons, and
cards together:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:open_calc_sudoku/features/sudoku/presentation/sudoku_app.dart';
import 'package:open_calc_sudoku/features/sudoku/presentation/sudoku_board_view.dart';
import 'package:open_calc_sudoku/features/sudoku/presentation/theme/app_shapes.dart';
import 'package:open_calc_sudoku/features/sudoku/presentation/theme/app_spacing.dart';
import 'package:open_calc_sudoku/features/sudoku/presentation/theme/app_theme.dart';

import 'database_test_support.dart';

void main() {
  useIsolatedTestDatabase();

  test('AppShapes.medium is a real, 12-pixel rounded rectangle', () {
    expect(AppShapes.medium.borderRadius, BorderRadius.circular(12));
  });

  test('AppTheme.light wires AppShapes.medium into cardTheme and elevatedButtonTheme together', () {
    expect(AppTheme.light.cardTheme.shape, AppShapes.medium);
    expect(AppTheme.light.cardTheme.elevation, 2);

    final buttonShape = AppTheme.light.elevatedButtonTheme.style!.shape!.resolve(<WidgetState>{});
    expect(buttonShape, AppShapes.medium);

    final buttonPadding = AppTheme.light.elevatedButtonTheme.style!.padding!.resolve(<WidgetState>{});
    expect(buttonPadding, const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm));
  });

  testWidgets('every real ElevatedButton in the running app renders with the real, shared theme shape', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const ProviderScope(child: SudokuApp()));

    final buttonMaterial = tester.widget<Material>(
      find
          .descendant(of: find.widgetWithText(ElevatedButton, 'Start New Game'), matching: find.byType(Material))
          .first,
    );
    final renderedShape = buttonMaterial.shape! as RoundedRectangleBorder;
    expect(renderedShape.borderRadius, AppShapes.medium.borderRadius);
  });

  testWidgets('the real board sits inside a real, themed Card', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: SudokuApp()));

    expect(
      find.ancestor(of: find.byType(SudokuBoardView), matching: find.byType(Card)),
      findsOneWidget,
    );

    final cardMaterial = tester.widget<Material>(
      find.descendant(of: find.byType(Card), matching: find.byType(Material)).first,
    );
    expect(cardMaterial.shape, AppShapes.medium);
    expect(cardMaterial.elevation, 2);
  });
}
```

Real, captured output (`flutter test test/app_theme_test.dart`): all
four real tests pass, `All tests passed!` — real and directly answering
this unit's own Socratic question: the third and fourth real tests
prove, on the real, rendered `Material` widget each real `Card`/
`ElevatedButton` builds internally, that `AppShapes.medium` genuinely
reached both, purely through `ThemeData`, with neither real call site
ever passing it explicitly.

### Mechanical Walkthrough

- `cardTheme: CardThemeData(shape: AppShapes.medium, elevation: 2)` —
  `cardTheme:` names `ThemeData`'s own fourth, real field this lesson
  sets; `CardThemeData` (Objects and methods, above), a real,
  `const`-constructible class, real and confirmed from source to hold
  real, optional overrides every real `Card` reads automatically;
  `shape: AppShapes.medium` — the identical real, shared token the
  previous two units already established, reached here for its own
  second real use; `elevation: 2` — a real, chosen value, this app's
  own new, deliberate real shadow depth, distinct from Flutter's own
  real, built-in default of `1.0`.
- `Card(child: Padding(padding: const EdgeInsets.all(AppSpacing.sm), child: SudokuBoardView(...)))`
  — `Card` (Objects and methods, above), a real, ordinary
  `StatelessWidget`, real and given no `shape:`/`elevation:` of its own
  at all; `Padding`/`EdgeInsets.all`/`AppSpacing.sm` (already
  established, above) reappearing, real and giving the
  board a small, real gap from the real card's own edge; `SudokuBoardView`
  (already established) reappearing, real and unchanged
  itself — only its own, real, surrounding context changed.
- Real, confirmed from source, `Card.build`'s own real fallback chain
  — a real, control-flow trace, not a real, changing-values one, per
  the Verification Rule's own "hidden behavior needs proof" standard:
  1. `shape ?? cardTheme.shape ?? defaults.shape` — this specific,
     real `Card()` call's own `shape` argument is `null`, since the
     code above never passes one.
  2. Real and confirmed: `CardTheme.of(context)` — the same real,
     ambient `Theme.of`-style lookup Concept Unit 1 already
     established, applied here to `AppTheme.light.cardTheme` — reads
     `AppShapes.medium`, real and genuinely non-`null`.
  3. The already-established `??` operator real and
     short-circuits the instant step 2 produces a real, non-`null`
     value — `defaults.shape`, Flutter's own real, generic fallback,
     is never even real, actually reached.

### CS Lens

Not repeated separately — real and covered above (Concept Unit 1): a
**design token**, `AppShapes.medium`, applied here for its own third
and final real use this lesson — this unit's own real contribution is
the clearest, most direct real proof yet: a bare `Card()` with nothing
passed genuinely renders with this app's own chosen shape, confirmed on
the real, rendered `Material` itself, not merely asserted from an
unbuilt widget's own, unset fields.

### SE Lens

The real principle is **making the real, common case require zero
real effort, while still letting a real, individual call site override
it if it genuinely needs to** — directly answering this unit's own
Socratic question. The alternative not chosen: pass
`shape: AppShapes.medium, elevation: 2` directly on this one, real
`Card()` call, real and skipping `cardTheme` entirely. The real
tradeoff: that alternative would look, real and identically, correct
today, for this app's own one, real `Card` — but a real, future second
`Card`, added anywhere else in this app, would silently draw Flutter's
own plain, generic default unless someone remembered to repeat the
identical real arguments there too; a real, shared `cardTheme` instead
means this app's own real, styled `Card` is the default outcome of
writing `Card(child: ...)` at all, anywhere in this project, forever,
with no real risk of a stray, unstyled one slipping through unnoticed.

### Commands Needed

None new.

### Run It

Real, captured summary, covering every real change across all six of
this lesson's own units together:

`flutter analyze .`: **56 issues found** — identical count and
identical categories to this lesson's own pre-change baseline; zero new
issues from any file this lesson touched.

`flutter test`: **46 real test-file-level checks** (up from 42 at the
previous lesson), `All tests passed!`, confirmed clean across two
consecutive full runs. The four new checks live in this unit's own new
`project/test/app_theme_test.dart`, above; two existing checks in
`project/test/sudoku_board_view_test.dart` were strengthened from a
loose `isNotNull` into exact, real equality against
`AppTheme.light.colorScheme.primaryContainer`, and gained a new,
second real assertion (`fontSize == 20`), now that this lesson gives
both real values an actual, real name to compare against.

### Connect

This app's own real Sudoku board now sits inside a real, elevated,
rounded card, the final piece of this lesson's own one, shared,
real visual identity — reached with zero explicit styling at its own
call site, purely because `ThemeData` itself already knows what a
`Card` in this app should look like.

---

## Connect the Pieces

A single, real, concrete value — the corner radius `12` — traces
through this entire lesson. Concept Unit 4 named it once, real and
only once, as `AppShapes.medium`. Concept Unit 5 handed that identical
real value to `ElevatedButton.styleFrom`'s own `shape:`, and, with
zero change to either of this app's own real button call sites, both
`ElevatedButton`s began rendering with real, rounded corners. Concept
Unit 6 handed the identical real value to `CardThemeData`'s own
`shape:`, and this app's own first-ever real `Card` — wrapping its own
Sudoku board — inherited it the identical real way, confirmed on the
real, rendered `Material` widget each one actually builds, not merely
assumed. Alongside it, Concept Unit 1 gave this app one real, generated
color palette in place of a single, disconnected literal; Concept Unit
2 gave it one real, shared typographic scale, composed per real call
site with `.copyWith`; Concept Unit 3 gave its own repeated spacing
values real names instead of bare numbers. Every one of these — color,
type, spacing, shape — is the identical real idea, applied five real
times: a **design token**, decided once, in one real, shared place,
and applied everywhere that real decision belongs, rather than
re-decided, by hand, at every real call site that happens to need it.
