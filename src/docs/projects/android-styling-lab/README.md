# Android Styling & Design Masterclass — Full Lesson Plan

## What This Is

The visual polish chapter for the app you built across
[`android-ui-foundations`](../android-ui-foundations/) and
[`android-kotlin-foundations`](../android-kotlin-foundations/).

Those two series built a real, working app — a login screen, an inventory
grid, and a notifications screen with a runtime permission. They stopped
when the app was *functionally complete*. This series picks it up there
and teaches the one thing both explicitly deferred: making it look
genuinely good.

This is not a collection of design tips. Every lesson adds one real, code-
level layer to the existing project: a deliberate color scheme, a type
scale, shape theming, elevation, an app bar, interaction feedback,
motion, dark mode, and a methodical visual audit. Every change is a choice
that can be explained, justified, and reversed — not a style drop applied
from memory.

## Prerequisite

Finish both prior Android series first. This series assumes you know what
a `@Composable` function is, how `MaterialTheme` wraps a composable
tree, how `ViewModel` and `StateFlow` connect state to UI, and what the
three screens of the InventoryApp look and behave like.

What this series teaches is everything *on top* of that: how Android's
Material Design 3 system works as a complete design language, how to use
it intentionally instead of accidentally, and how to read your own app
the way a designer would.

## Surface Language

All code in this series is Kotlin with Jetpack Compose and Material
Design 3. Java's XML theming system (`colors.xml`, `themes.xml`) is
referenced for contrast only — this series does not maintain a parallel
Java path, because M3's real color roles, type scale, and shape system
live entirely inside the Compose `MaterialTheme` API. The XML mechanism
Lesson 34 of `android-ui-foundations` introduced is genuinely different,
intentionally so, and Kotlin Lesson 26 of `android-kotlin-foundations`
already named why they coexist.

## Lesson Plan

### Milestone 1 — Understanding the Material Design System (Lessons 1–3)

**1. Material Design 3: What the Design System Actually Is** — What M3
is, where it comes from, and why every Android app already participates in
it whether deliberately or not. Setting up the `MaterialTheme` token
pipeline — color, typography, shape — intentionally rather than accepting
the defaults as invisible scaffolding.

**2. Color Roles: Beyond Primary and Accent** — A full, deliberate color
scheme using M3's role system (`primary`, `onPrimary`, `secondary`,
`surface`, `error`, and their on-* counterparts) replacing the minimal
two-color scheme from the Kotlin series. Color roles as semantic slots,
contrast requirements as a design constraint with a real accessibility
justification, and `lightColorScheme`/`darkColorScheme` as paired
artifacts rather than independent choices.

**3. Typography: Using Type as a Design Element** — A complete `Typography`
object loading a real typeface (Nunito via Google Fonts) and mapping it
to M3's semantic type roles (`displayLarge` through `labelSmall`),
applied to every `Text()` composable across all three screens. Why
semantic roles exist instead of ad-hoc sizes, and why that choice matters
the moment you change a single `fontFamily`.

---

### Milestone 2 — Surfaces, Elevation, and Shape (Lessons 4–6)

**4. Shape Theming: Rounded Corners as a Brand Signal** — A `Shapes`
object wiring specific corner radii to M3's shape scale, applied
consistently to every `Card`, `Button`, text field, and dialog across
the app. Shape as brand identity rather than per-widget decoration, and
what breaking shape consistency visually costs.

**5. Cards and Elevation: Grouping with Surface Depth** — Wrapping each
inventory grid row in a styled `Card` with real tonal elevation. How M3
communicates depth through color overlay rather than drop shadow, why that
choice differs from older Android and iOS conventions, and when elevation
communicates hierarchy versus when it's just noise.

**6. The App Bar: Branding the Top of Every Screen** — A
`CenterAlignedTopAppBar` added to every screen via `Scaffold`, carrying
the app name, branded color, and real navigation icons. Why the app bar
is a trust signal for native feel, what `Scaffold` actually is and why
it exists, and how slot-based layout APIs differ from the XML constraint
systems the prior series used.

---

### Milestone 3 — Motion, Interaction Feedback, and Polish (Lessons 7–9)

**7. Ripples, Press States, and Interaction Feedback** — Ensuring every
tappable element gives correct interaction feedback: fixing invisible
ripples on custom composables, adding `indication` and `interactionSource`
where needed. Why interaction feedback is non-optional for perceived
quality, and what the research actually says about how feedback affects
trust.

**8. Animated Visibility and Content Transitions** — The "Add Item" form
slides in with `AnimatedVisibility`; deleted rows animate out with a size
transition; screen-level navigation transitions are tuned from the defaults
set in the Kotlin series. Why motion communicates state change better than
abrupt redraws, and how to measure the threshold at which motion becomes
a performance cost rather than a quality gain.

**9. Dark Mode: One Theme, Both Appearances** — A complete dark color
scheme paired to the existing light scheme, selected automatically via
`isSystemInDarkTheme()`, with real on-device verification that every
screen looks correct in both appearances. Why dark mode is not "invert
everything," how M3's dark role values are derived (not guessed), and
`dynamicColorScheme` on Android 12+ as the third, system-driven option.

---

### Milestone 4 — Putting It Together (Lesson 10)

**10. Visual Audit: Reading Your Own App Like a Designer** — A systematic,
screen-by-screen review of the finished app checking contrast ratios, tap
target sizes, text legibility, and spacing consistency using Android
Studio's Layout Inspector and Accessibility Scanner as real tools. WCAG
contrast minimum (4.5:1 for normal text), minimum tap target (48dp), and
a visual hierarchy audit checklist. How to know when a design is done
versus when it is merely not obviously broken.

## Visual Design Concepts Taught

Material Design 3 token system (color, typography, shape), color roles
and semantic slot assignment, WCAG contrast ratios, M3 type scale
(`displayLarge` through `labelSmall`), `FontFamily` loading via Google
Fonts Compose, shape systems and corner radius theming, tonal elevation,
`Scaffold` slot-based layout, `TopAppBar` variants, `Indication` and
`InteractionSource`, `AnimatedVisibility`, `EnterTransition`/`ExitTransition`,
`animateContentSize`, dark mode with `isSystemInDarkTheme()`, dynamic
color with `dynamicColorScheme`, Layout Inspector, and Accessibility
Scanner.

## Android/Compose APIs Taught

`MaterialTheme`, `lightColorScheme`, `darkColorScheme`, `dynamicColorScheme`,
`ColorScheme` roles, `Typography`, `TextStyle`, `FontFamily`,
`GoogleFont.Provider`, `Shapes`, `RoundedCornerShape`, `Card`, `Surface`,
`Scaffold`, `TopAppBar`, `CenterAlignedTopAppBar`, `NavigationIcon`,
`Icon`, `rememberRipple`, `Indication`, `MutableInteractionSource`,
`clickable`, `AnimatedVisibility`, `animateContentSize`, `EnterTransition`,
`ExitTransition`, `isSystemInDarkTheme`.
