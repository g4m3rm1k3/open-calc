# Android Java Styling & Design Masterclass — Full Lesson Plan

## What This Is

The visual polish chapter for the app you built in
[`android-ui-foundations`](../android-ui-foundations/).

That series built a real, working app — a login screen, an inventory grid,
and a notifications screen with a runtime permission — in 36 lessons. It
stopped when the app was *functionally complete*. Lesson 34 made the first
deliberate visual decision (a shared color theme and proximity-based
spacing). This series picks up where Lesson 34 left off and teaches
everything that comes after: making the app look genuinely professional
using Android's full View-based styling toolchain.

This is not a tip sheet. Every lesson adds one real, code-level layer to
the existing project: a complete Material color scheme in XML, a
typography system with real typefaces, shape theming through style
inheritance, real card-based elevation, a Material toolbar, correct
touch feedback through state drawables and ripples, View animations and
transitions, dark mode through resource qualifiers, and a methodical
visual audit using Android Studio's real tools.

## Prerequisite

Finish [`android-ui-foundations`](../android-ui-foundations/) in full,
including Lesson 34 (themes.xml, colors.xml, colorPrimary/colorAccent,
and the proximity-based margin reasoning). This series assumes that lesson
is already done — it doesn't re-teach what a theme is, what `colorPrimary`
does, or why colors are defined in a separate file.

## Surface Language

All code in this series is Java with Android's View system and the
Material Design Components for Android (MDC) library — the same
`Theme.MaterialComponents.*` base already in use from Lesson 05. No
Compose. Every styling decision lives in XML resource files
(`themes.xml`, `colors.xml`, `styles.xml`, drawable XML) and in Java
where programmatic changes are needed. A parallel Kotlin/Compose version
of this series exists in `android-styling-lab` — this series is not a
translation of that one. The View system and the Compose system have
genuinely different styling mechanisms, and this series teaches the View
system's own mechanisms on their own terms.

## Lesson Plan

### Milestone 1 — Understanding the Material Design System in Views (Lessons 1–3)

**1. The MDC Theme System — What the Design System Actually Is for Views**
— What Material Design Components actually is in the View world: a library
of real `View` subclasses (MaterialButton, MaterialCardView, TextInputLayout)
that read their appearance from named theme attributes. The three attribute
categories: color attributes (`colorPrimary`, `colorOnPrimary`, etc.),
type appearance styles (`textAppearanceBodyLarge`, etc.), and shape
appearance styles (`shapeAppearanceMediumComponent`, etc.). Reading the
inherited theme attribute hierarchy in Android Studio's Theme Editor for
the first time.

**2. Color Roles in XML — Filling in the Full Material Color Scheme** —
A complete color scheme filling all of MDC's semantic color attributes —
`colorPrimary`/`colorOnPrimary`, `colorSecondary`/`colorOnSecondary`,
`colorSurface`/`colorOnSurface`, `colorBackground`/`colorOnBackground`,
`colorError`/`colorOnError` — in `themes.xml`, with matching entries in
`colors.xml`. The `on-*` convention as a real accessibility contract, not
a naming quirk. WCAG contrast ratios verified by hand against the chosen
values.

**3. Typography in Views — TextAppearance Styles and Custom Typefaces** —
A full typography system in `styles.xml` overriding MDC's
`textAppearanceHeadlineLarge` through `textAppearanceBodySmall` with a
custom typeface (Nunito loaded via a downloadable font XML). Applied to
every `TextView`, `Button`, and `EditText` across all three screens via
the theme's own style inheritance — zero per-widget `fontFamily`
attributes.

---

### Milestone 2 — Surfaces, Elevation, and Shape (Lessons 4–6)

**4. Shape Theming in XML — ShapeAppearance Styles** — MDC's three shape
scale sizes (`shapeAppearanceSmallComponent`, `shapeAppearanceMediumComponent`,
`shapeAppearanceLargeComponent`), each defining a `cornerFamily` and
`cornerSize` applied automatically to every MDC component of that size.
Overriding all three in `themes.xml` and confirming which components visibly
change. The difference between `rounded` and `cut` corner families as real
brand signals.

**5. MaterialCardView and Real Elevation** — Replacing the flat
`RecyclerView` rows with `MaterialCardView` items carrying real `elevation`
and `strokeWidth`. How Android's View elevation differs from Compose's M3
tonal elevation: View elevation draws a real drop shadow (not a color
overlay), which means elevation is visible in both light and dark modes.
`CardView`'s own `contentPadding` attributes and the spacing strategy that
makes a card list feel like a deliberate list rather than an accidental pile.

**6. MaterialToolbar and AppBarLayout — Branding the Top of Every Screen**
— Adding a `MaterialToolbar` inside an `AppBarLayout` to every screen's
layout XML, wired to `setSupportActionBar` in Java, with the app name and
branded color. `CoordinatorLayout` as the required root for
`AppBarLayout`'s scroll behaviors. Navigation icons and the back-arrow
pattern on every non-root screen.

---

### Milestone 3 — Touch Feedback, Animation, and Polish (Lessons 7–9)

**7. Ripples and State Lists — Correct Touch Feedback for Every Tap Target**
— `?attr/selectableItemBackground` and `?attr/selectableItemBackgroundBorderless`
as the one-attribute solution for correct ripple feedback on custom views.
`RippleDrawable` and state list drawables (`selector` XML) for custom
tappable elements that can't use the theme attribute shorthand. Why touch
feedback is a trust signal, not decoration.

**8. View Animations and Activity Transitions — Motion That Communicates**
— `ViewPropertyAnimator` for animating the "Add Item" form in and out (fade
+ slide vs. `setVisibility(GONE)` with no transition). Polishing the
`overridePendingTransition` calls from Lesson 36 with directional slide
animations that distinguish forward navigation (slide left) from backward
navigation (slide right). Custom animation XML in `res/anim/`.

**9. Dark Mode with Resource Qualifiers — One App, Both Appearances** —
A `res/values-night/colors.xml` file supplying dark-mode color values for
every name already defined in `res/values/colors.xml`. Why dark mode in
the View system is handled through resource qualifiers (a compile-time
mechanism, not runtime code), how to trigger night mode programmatically
with `AppCompatDelegate.setDefaultNightMode`, and a systematic on-device
check of all three screens in both modes.

---

### Milestone 4 — Putting It Together (Lesson 10)

**10. Visual Audit — Reading Your Own App Like a Designer** — A systematic,
screen-by-screen review of the finished app using Android Studio's Layout
Inspector and the Accessibility Scanner app. WCAG contrast ratio checks
against the values chosen in Lesson 2, tap-target size verification (48dp
minimum) in the Layout Inspector, `contentDescription` gaps caught by the
Accessibility Scanner, and a visual hierarchy check using the five-second
heuristic. How to know when a design is done versus when it's merely not
obviously broken.

## XML Styling Concepts Taught

MDC theme attribute system, `colorPrimary`/`colorOnPrimary`/`colorSecondary`/
`colorOnSecondary`/`colorSurface`/`colorBackground`/`colorError` and their
`on-*` pairs, WCAG contrast ratios, downloadable fonts XML, `textAppearance`
style override, `shapeAppearanceSmallComponent`/`shapeAppearanceMediumComponent`/
`shapeAppearanceLargeComponent`, `cornerFamily` and `cornerSize`,
`MaterialCardView` elevation vs. `CardView`, `AppBarLayout`,
`CoordinatorLayout`, `setSupportActionBar`, `?attr/selectableItemBackground`,
`RippleDrawable`, state list drawables, `ViewPropertyAnimator`, animation
resource XML, `overridePendingTransition` with custom animations,
`res/values-night/` resource qualifiers, `AppCompatDelegate.setDefaultNightMode`,
Layout Inspector, Accessibility Scanner.

## Java APIs Taught

`setSupportActionBar`, `getSupportActionBar`, `setNavigationOnClickListener`,
`ViewCompat.animate()`, `ViewPropertyAnimator` (`.alpha()`, `.translationY()`,
`.setDuration()`, `.setInterpolator()`), `AppCompatDelegate.setDefaultNightMode`,
`Resources.Configuration.UI_MODE_NIGHT_YES`.
