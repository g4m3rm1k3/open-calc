# Lesson 02: Color Roles — Beyond Primary and Accent

**What you will build**
You will replace the minimal two-color palette from previous lessons with a deliberate, complete Material 3 color scheme utilizing six core semantic color role pairs: `primary`/`onPrimary`, `secondary`/`onSecondary`, `surface`/`onSurface`, `background`/`onBackground`, `error`/`onError`, and `primaryContainer`/`onPrimaryContainer`. The transferable problem is mapping raw color values (hex codes) to semantic roles so that components know *how* to use them automatically, ensuring visual consistency and contrast across the entire application without hardcoding colors on individual screens.

**What you need to know first**
From `android-kotlin-foundations` Lesson 26, you must know how to invoke `lightColorScheme` to provide colors to `MaterialTheme`. From `android-styling-lab` Lesson 01, you must understand the three token categories (Color, Typography, Shape) and the standard Compose theme file structure (Theme.kt, Color.kt).

**Terms introduced in this lesson**
- **Semantic color role** — A color assignment based on meaning and usage (e.g., "primary", "error") rather than its appearance (e.g., "blue", "red"). *Why it exists:* It decouples the design intent from the actual hue, allowing the app to swap palettes (like dark mode or dynamic theming) without altering the UI component code.
- **On-color** — A color specifically chosen to be drawn on top of another specific color role (e.g., `onPrimary` is drawn on top of `primary`). *Why it exists:* It enforces contrast and legibility at the system level, ensuring text and icons are always readable against their backgrounds.
- **Contrast ratio** — A numerical value measuring the difference in luminance between two colors, ranging from 1:1 (no difference) to 21:1 (maximum difference). *Why it exists:* It provides an objective, mathematical baseline to guarantee accessibility for users with visual impairments.

**Objects and methods used**
- `Color` (androidx.compose.ui.graphics)
  - *What it is:* A class representing a specific color in an ARGB format.
  - *Implementation:* `val MyBlue = Color(0xFF1E88E5)`
  - *Its use:* To define the raw, literal color values in `Color.kt` before they are assigned to semantic roles.
- `lightColorScheme` (androidx.compose.material3)
  - *What it is:* A factory function that constructs a complete set of Material 3 color roles for a light theme.
  - *Implementation:* `lightColorScheme(primary = MyBlue, onPrimary = Color.White, ...)`
  - *Its use:* To map our defined `Color` objects to specific semantic roles in `Theme.kt`, forming the active palette.

---

## Concept Unit: What color roles are

### The Problem
Previously, we defined a UI by applying hex colors directly to elements, or by passing just one or two colors to our theme. If you have a button, what color should its text be? If you change the button to yellow, the white text suddenly becomes unreadable. We need a systematic way to pair background colors with foreground colors so components can automatically look up the correct, legible color for their content.

### The New Code
```kotlin
// A conceptual mapping of roles, enforcing the 'on-*' convention.
val primaryColor = Color(0xFF0D47A1) // Deep Blue
val onPrimaryColor = Color(0xFFFFFFFF) // White

val errorColor = Color(0xFFB00020) // Red
val onErrorColor = Color(0xFFFFFFFF) // White
```

### The Updated Project
```kotlin
// Theme.kt
import androidx.compose.ui.graphics.Color
import androidx.compose.material3.lightColorScheme

// ← new
val AppLightColorScheme = lightColorScheme(
    primary = Color(0xFF0D47A1),
    onPrimary = Color(0xFFFFFFFF),
    error = Color(0xFFB00020),
    onError = Color(0xFFFFFFFF)
)
```

### Mechanical Walkthrough
- `primary = Color(0xFF0D47A1)`: Assigns the raw color value to the `primary` role. This is the main color of the app, used for prominent components like standard buttons and active states. If omitted, it falls back to a default Material purple.
- `onPrimary = Color(0xFFFFFFFF)`: Explicitly sets the color for content (text, icons) drawn *on top of* `primary` surfaces. This guarantees that when a button uses the `primary` color for its background, it will automatically use `onPrimary` for its text. Without it, the text might inherit a default color that is unreadable against the primary hue.
- `error = Color(...)` and `onError = Color(...)`: The same relationship, applied to the error state.

### CS Lens
This is **Dependency Injection** for styling. The UI component (like a Button) depends on a color to draw its text. Instead of hardcoding that dependency, the theme *injects* it via the `onPrimary` role. The component just asks for "my content color," and the theme provides the correct one based on the context. 

### SE Lens
The design principle is **Convention over Configuration**. By adhering to the `on-*` naming convention natively built into Material 3, we avoid having to configure text colors on every single button. The alternative is manually setting `color = Color.White` on every text node inside a button. That alternative scales poorly and breaks instantly if the primary color is ever changed to a light hue. The tradeoff is that we must strictly define our theme upfront.

### Run It Yourself
We haven't applied this to the whole app yet, but observe the pattern. If you were to create a custom composable that draws a box with the `error` color, you would use the `onError` color for any text inside it.

## Concept Unit: Contrast as a design constraint

### The Problem
How do we know `Color.White` is the correct `onPrimary` for our deep blue `primary`? We can't just guess or trust our monitors. Web Content Accessibility Guidelines (WCAG) dictate a minimum contrast ratio of 4.5:1 for standard text. If we pick two colors that don't meet this, we exclude users with visual impairments. We need objective proof that our `on-*` colors work.

### The New Code
```kotlin
// No new project code in this unit; we evaluate the mathematical relationship.
// Primary: 0xFF0D47A1
// On-Primary: 0xFFFFFFFF
// Contrast Ratio: ~8.8:1 (Passes WCAG AA)
```

### The Updated Project
```kotlin
// Color.kt
package com.example.inventoryapp.ui.theme

import androidx.compose.ui.graphics.Color

// ← new (verified contrast pairs)
val DeepBlue = Color(0xFF0D47A1)
val White = Color(0xFFFFFFFF)

val Amber = Color(0xFFFFC107)
val DarkGray = Color(0xFF121212)
```

### Mechanical Walkthrough
- `val DeepBlue = Color(0xFF0D47A1)`: A dark background color. Its luminance is low.
- `val White = Color(0xFFFFFFFF)`: A light foreground color. Its luminance is high. The formula `(L1 + 0.05) / (L2 + 0.05)` (where L is relative luminance) yields a high ratio, well above 4.5:1, meaning it is mathematically accessible.
- `val Amber = Color(0xFFFFC107)` and `val DarkGray = Color(0xFF121212)`: For a light, high-luminance color like Amber, using White as the `on-` color would fail the contrast check. We must use a dark color (like DarkGray) to achieve a safe contrast ratio.

### CS Lens
This is a **Validation Constraint**. In database design, you have constraints (like non-null) to ensure data integrity. In UI engineering, contrast ratios act as structural constraints ensuring interface integrity.

### SE Lens
The design principle is **Accessibility as a Core Requirement**. The alternative is treating contrast as an afterthought or a "nice to have", which results in exclusionary software. The tradeoff is that your color palette is mathematically restricted; you cannot freely combine any two colors you think look nice if they fail the contrast threshold.

### Run It Yourself
Navigate to a contrast checking tool like the Material Theme Builder or WebAIM contrast checker. Input `#0D47A1` as the background and `#FFFFFF` as the foreground. Observe the 8.8:1 passing score. Then input `#FFC107` (Amber) and `#FFFFFF`. Observe the failing 1.6:1 score. 

## Concept Unit: Building the scheme

### The Problem
We have verified our color pairs conceptually, but the app is still using raw hex values or a skeletal theme. We need to instantiate the complete `lightColorScheme` with all six core semantic pairs and apply it to the `MaterialTheme` wrapper so the entire application can consume it.

### The New Code
```kotlin
val LightColors = lightColorScheme(
    primary = DeepBlue,
    onPrimary = White,
    secondary = Amber,
    onSecondary = DarkGray,
    surface = Color(0xFFFBFDF9),
    onSurface = Color(0xFF191C1A),
    background = Color(0xFFFBFDF9),
    onBackground = Color(0xFF191C1A),
    error = Color(0xFFBA1A1A),
    onError = White,
    primaryContainer = Color(0xFFD8E2FF),
    onPrimaryContainer = Color(0xFF001A41)
)
```

### The Updated Project
```kotlin
// Theme.kt
package com.example.inventoryapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Define the raw colors
val DeepBlue = Color(0xFF0D47A1)
val White = Color(0xFFFFFFFF)
val Amber = Color(0xFFFFC107)
val DarkGray = Color(0xFF121212)

// ← new (the complete scheme)
private val LightColors = lightColorScheme(
    primary = DeepBlue,
    onPrimary = White,
    secondary = Amber,
    onSecondary = DarkGray,
    surface = Color(0xFFFBFDF9),
    onSurface = Color(0xFF191C1A),
    background = Color(0xFFFBFDF9),
    onBackground = Color(0xFF191C1A),
    error = Color(0xFFBA1A1A),
    onError = White,
    primaryContainer = Color(0xFFD8E2FF),
    onPrimaryContainer = Color(0xFF001A41)
)

@Composable
fun InventoryAppTheme(
    content: @Composable () -> Unit
) {
    // ← new (applying the scheme)
    MaterialTheme(
        colorScheme = LightColors,
        typography = Typography, // Assume this exists from Lesson 01
        content = content
    )
}
```

### Mechanical Walkthrough
- `surface = Color(...)` and `onSurface = Color(...)`: `surface` is used for components that float above the background, like Cards or bottom sheets. `onSurface` ensures text inside those cards is readable.
- `background = Color(...)` and `onBackground = Color(...)`: `background` is the baseline color of the entire screen behind scrollable content. `onBackground` is standard text resting directly on the screen.
- `primaryContainer = Color(...)` and `onPrimaryContainer = Color(...)`: A newer M3 concept. Containers are meant for large, blocky elements that need primary branding but shouldn't be as overwhelming as the stark `primary` hue (e.g., a selected item in a navigation drawer). The `on-*` rule strictly applies here too.
- `colorScheme = LightColors`: Injects our fully defined object into the `MaterialTheme` provider. Without this, the app defaults to the system baseline.

### CS Lens
This acts as a **Global Context** or **Registry**. The `MaterialTheme` uses a `CompositionLocal` under the hood to pass this `LightColors` object down the entire UI tree implicitly. No component has to ask for it explicitly; it is universally available.

### SE Lens
The principle is a **Single Source of Truth**. The alternative is defining `background = Color(...)` on the root of every single screen in the app. If you decide to make the background slightly warmer, you have to find and replace it in 30 files. The tradeoff is indirection: when looking at a standard Compose `Text` element, you don't immediately see what color it is; you have to know how the theme resolves `onSurface` or `onBackground`.

### Run It Yourself
Compile and run the app. Navigate to all three screens. Because standard Material components (like `Scaffold`, `Button`, `Card`, and `FloatingActionButton`) are programmed to read from `MaterialTheme.colorScheme` by default, the entire app should now reflect the deep blue and amber palette, with perfect text legibility, without you changing a single line of UI layout code.

## Connect the Pieces
Let's trace how the `Amber` hex code becomes a readable button. 
1. `val Amber = Color(0xFFFFC107)` is defined in memory.
2. In `LightColors`, `secondary` is assigned `Amber`.
3. To enforce contrast, `onSecondary` is assigned `DarkGray`.
4. `MaterialTheme` wraps the entire app, providing `LightColors`.
5. On the Item Entry Screen, a `FloatingActionButton` (FAB) is drawn.
6. The FAB is programmed by default to use the `secondary` role for its background. It reads `Amber` from the theme.
7. The FAB then looks up the corresponding content role for `secondary`, which is `onSecondary`. It reads `DarkGray` from the theme.
8. It draws the '+' icon in `DarkGray` over an `Amber` circle.

## What Breaks Without This
Open `Theme.kt`. Change `onPrimary` to exactly match `primary`:
```kotlin
private val LightColors = lightColorScheme(
    primary = DeepBlue,
    onPrimary = DeepBlue, // ← intentionally broken
    // ...
)
```
Run the app. Look at any standard `Button` (which uses `primary`). The button text is now completely invisible because it is deep blue on deep blue. This demonstrates that the `on-*` color is doing real work to style child elements; it's not just a suggestion. Restore `onPrimary = White`.

## Exercises
1. Change the `surface` color to a light pastel yellow, and update `onSurface` to ensure contrast. Verify how Cards on the list screen change automatically.
2. Override a specific component manually: find a `Text` composable and explicitly set its color to `MaterialTheme.colorScheme.error`. Observe it bypassing the standard hierarchy.

## Definition of Done
- `Theme.kt` contains a fully fleshed out `lightColorScheme` with at least the 6 core role pairs defined.
- `MaterialTheme` is providing this updated scheme.
- The app runs and all screens inherit the correct colors, with legible text throughout.
- Commit your changes to git with the message: `refactor: implement complete semantic light color scheme to ensure contrast accessibility and centralize palette definitions.`
