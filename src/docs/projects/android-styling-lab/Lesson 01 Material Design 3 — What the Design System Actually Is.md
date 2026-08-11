# Lesson 01: Material Design 3 — What the Design System Actually Is

**What you will build**
You will restructure the existing `InventoryAppTheme` composable from your `android-kotlin-foundations` project into a dedicated, intentionally organized theme file. By explicitly exposing the three core pillars of Material Design—color, typography, and shape—using `TODO` placeholders, you transition from accidentally using built-in system defaults to intentionally laying the groundwork for a custom design system.

**What you need to know first**
- You understand Composable functions (from `android-kotlin-foundations` Lesson 14).
- You are familiar with basic `MaterialTheme` setup and `lightColorScheme` (from Lesson 26).
- You understand higher-order functions and the `content` lambda pattern for composable wrappers (from Lesson 27).

**Terms introduced in this lesson**
- **Design System** — a standardized collection of reusable components, rules, and design tokens. *Why it exists:* To ensure visual consistency across an entire application without redefining styles for every individual screen or button.
- **Design Token** — an atomic value (like a specific hex color or a corner radius) represented by a semantic name (like "Primary Color" or "Small Shape"). *Why it exists:* To decouple the visual value from its usage, allowing sweeping design changes by updating a single central definition.
- **Material Design 3 (M3)** — Google's open-source design system. *Why it exists:* To provide a comprehensive, accessible, and mathematically sound baseline for UI design so developers do not have to invent interaction patterns from scratch.

**Objects and methods used**
- `MaterialTheme` (androidx.compose.material3.MaterialTheme)
  - *What it is:* A composable function that provides styling context to all composables inside its hierarchy.
  - *Implementation:* It accepts `colorScheme`, `typography`, `shapes`, and a `content` lambda.
  - *Its use:* To inject design tokens down the composition tree implicitly using CompositionLocal.
- `Typography` (androidx.compose.material3.Typography)
  - *What it is:* A data class defining the 15 type scales (e.g., headlineLarge, bodyMedium) of the M3 design system.
  - *Implementation:* Instantiating it without arguments populates it with Roboto-based defaults.
  - *Its use:* To establish the baseline text styles used by components like `Text` and `Button`.
- `Shapes` (androidx.compose.material3.Shapes)
  - *What it is:* A data class defining the corner rounding scales (e.g., small, medium, large) for components.
  - *Implementation:* Instantiating it without arguments applies standard M3 corner radii (e.g., slightly rounded corners for cards).
  - *Its use:* To standardize the physical outline of surface components globally.

---

## Concept Unit: What Material Design 3 Is

### The Problem
In your foundational project, you wrapped your application in a `MaterialTheme` and passed it a `colorScheme`. But Material Design 3 is not just a library of buttons; it is a conceptual design language built on three specific token categories: color, typography, and shape. By only specifying color, you were interacting with a fraction of the system, leaving the rest to invisible defaults. To wield the design system intentionally, you must first expose its entire surface area.

### The New Code
```kotlin
@Composable
fun MaterialTheme(
    colorScheme: ColorScheme = MaterialTheme.colorScheme,
    shapes: Shapes = MaterialTheme.shapes,
    typography: Typography = MaterialTheme.typography,
    content: @Composable () -> Unit
)
```

Notice that the Compose library's implementation of `MaterialTheme` expects three specific pillars.

### The Updated Project
Currently, in your `MainActivity.kt`, your theme wrapper looks something like this:

```kotlin
// MainActivity.kt
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

@Composable
fun InventoryAppTheme(content: @Composable () -> Unit) {
    val myColors = lightColorScheme(
        primary = androidx.compose.ui.graphics.Color(0xFF6200EE)
    )

    MaterialTheme(
        colorScheme = myColors, // ← new context: we are only setting one of three
        content = content
    )
}
```

### Mechanical Walkthrough
- `@Composable fun MaterialTheme(...)`: The core engine of M3 in Compose. It intercepts the composition tree and provides these objects to every child composable. If a `Button` needs to know its corner radius, it asks this theme.
- `colorScheme = myColors`: We provided a custom mapping for colors, successfully overriding the system's baseline.
- `shapes` and `typography`: Because we omitted these, Kotlin's default arguments kicked in, pulling values from the default `MaterialTheme.shapes` and `MaterialTheme.typography`.

### CS Lens
**Implicit vs. Explicit State.** By omitting arguments, you rely on implicit state (the library's hardcoded defaults). While convenient, implicit state hides the levers of control. In systems programming, relying on default environment variables without documenting them often leads to "it works on my machine" bugs. Here, it leads to "it looks like every other Android app" syndrome.

### SE Lens
**Separation of Mechanism and Policy.** The `MaterialTheme` function provides the mechanism (how styles are applied to children), but you are responsible for the policy (what those styles actually are). When you accept defaults silently, you surrender policy control to the library authors.

### Run It Yourself
Run the app. Observe a standard button or text element. Notice the font (Roboto) and the slightly rounded corners on any buttons. These are the implicit policies you are currently accepting.

## Concept Unit: Where the Defaults Come From

### The Problem
If we want to change the typography or shapes later, we first need to manifest them in our code. We must shift from implicit defaults to explicit defaults. We need to instantiate the default `Typography` and `Shapes` objects ourselves and pass them to the theme.

### The New Code
```kotlin
val defaultTypography = Typography()
val defaultShapes = Shapes()
```

By calling the constructors with no arguments, we generate objects filled with Google's default M3 values.

### The Updated Project
Update `InventoryAppTheme` in your `MainActivity.kt` to explicitly pass these default instances.

```kotlin
// MainActivity.kt
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

@Composable
fun InventoryAppTheme(content: @Composable () -> Unit) {
    val myColors = lightColorScheme(
        primary = androidx.compose.ui.graphics.Color(0xFF6200EE)
    )
    val defaultTypography = Typography() // ← new
    val defaultShapes = Shapes() // ← new

    MaterialTheme(
        colorScheme = myColors,
        typography = defaultTypography, // ← new
        shapes = defaultShapes, // ← new
        content = content
    )
}
```

### Mechanical Walkthrough
- `val defaultTypography = Typography()`: Instantiates the M3 type scale. Without arguments, it defaults to the system font (Roboto on Android) sized precisely to M3 specifications.
- `val defaultShapes = Shapes()`: Instantiates the M3 shape scale. Without arguments, it defaults to specific `RoundedCornerShape` values for small, medium, and large components.
- `typography = defaultTypography`: We explicitly bind our local instance to the `MaterialTheme` parameter. We now own the reference.

### CS Lens
**Reification.** We are taking an abstract, hidden concept (the default styles) and reifying it—making it a concrete, manipulable object in our code. You cannot modify what you cannot reference. 

### SE Lens
**The Strangler Fig Pattern (Micro-Scale).** By replacing a black-box system default with an explicit local variable that does the exact same thing, we establish a seam. We haven't changed the behavior yet, but we've exposed the configuration point so we can safely alter it in the future without ripping out the underlying engine.

### Run It Yourself
Run the app again. There should be absolutely zero visual difference. The app looks identical because we substituted the implicit defaults with explicit instances of the exact same defaults.

## Concept Unit: The Theme File

### The Problem
Your `MainActivity.kt` is currently responsible for defining colors, typography, shapes, and the theme wrapper itself. As we customize these tokens in future lessons, this file will explode in size. Theme configuration is infrastructure; it does not belong mixed with UI entry points. We need a dedicated file structured for intentional design.

### The New Code
```kotlin
// A structural outline for a theme file
private val AppColors = lightColorScheme(...)
private val AppTypography = Typography()
private val AppShapes = Shapes()
```

We organize the tokens as private top-level variables, exposing only the composable wrapper.

### The Updated Project
Create a new file at `ui/theme/Theme.kt` (or inside your existing theme package) and move the theme logic out of `MainActivity.kt`.

```kotlin
// ui/theme/Theme.kt
package com.example.inventoryapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// TODO: Replace with custom color palette in Lesson 02
private val AppColors = lightColorScheme( // ← new
    primary = Color(0xFF6200EE)
)

// TODO: Replace with custom typography in Lesson 03
private val AppTypography = Typography() // ← new

// TODO: Replace with custom shapes in Lesson 04
private val AppShapes = Shapes() // ← new

@Composable
fun InventoryAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AppColors, // ← new
        typography = AppTypography, // ← new
        shapes = AppShapes, // ← new
        content = content
    )
}
```

And clean up `MainActivity.kt` so it only imports and uses the theme:

```kotlin
// MainActivity.kt
package com.example.inventoryapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.inventoryapp.ui.theme.InventoryAppTheme // ← new

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            InventoryAppTheme {
                // Your app content here
            }
        }
    }
}
```

### Mechanical Walkthrough
- `private val AppColors`: Declared at the top level so it is instantiated once. Marked `private` so other files cannot bypass the theme and access the raw colors directly; they must ask `MaterialTheme`.
- `TODO: Replace...`: We are intentionally leaving placeholders. This file now acts as a blueprint.
- `import com.example.inventoryapp.ui.theme.InventoryAppTheme`: `MainActivity` no longer knows how the theme is constructed. It just uses it.

### CS Lens
**Encapsulation.** By moving the token definitions into a separate file and marking them `private`, we prevent state leakage. Components in other files are forced to interact with the theme through the official `MaterialTheme.typography` and `MaterialTheme.colorScheme` accessors, ensuring the design system remains the single source of truth.

### SE Lens
**Single Responsibility Principle.** `Theme.kt` is now solely responsible for defining the design policy. `MainActivity.kt` is solely responsible for bootstrapping the application lifecycle. When a designer asks to change a font, you know exactly which file to open, and you know you won't accidentally break an Activity lifecycle callback while doing it.

### Run It Yourself
Run the app. Again, verify that nothing visual has changed. The refactoring is purely structural.

## Connect the Pieces
When your app launches, `MainActivity` calls `setContent`. It immediately invokes `InventoryAppTheme`. Because `InventoryAppTheme` lives in `Theme.kt`, the Kotlin class loader initializes the top-level properties: `AppColors`, `AppTypography`, and `AppShapes`. These explicit tokens are passed into `MaterialTheme`, which injects them into Compose's hidden context (CompositionLocal). When your app's internal composables (like `Text` or `Button`) render, they query this context. Because we mapped `AppTypography` to a default `Typography()` instance, a `Text` composable asking for `bodyMedium` receives the exact default Roboto specifications, maintaining the baseline look while setting the stage for future overrides.

## What Breaks Without This
If you expose your raw tokens publicly instead of funneling them through `MaterialTheme`, you break the design system contract.

Change `private val AppColors` to `public val AppColors` in `Theme.kt`. Then, in a composable, try to bypass the theme:

```kotlin
// Inside some composable
Text(
    text = "Hello",
    color = AppColors.primary // Direct access!
)
```

**What goes wrong:** If you ever introduce a Dark Theme later, this `Text` will not update. `AppColors` is hardcoded to the light scheme. By relying on `MaterialTheme.colorScheme.primary`, the system automatically swaps the palette underneath you. Revert `AppColors` to `private` to enforce proper access.

## Exercises
1. In `Theme.kt`, try completely removing the `shapes = AppShapes` line from the `MaterialTheme` call. Does the app still compile? Does it still run? (Yes, because `MaterialTheme` has fallback default arguments).
2. Look at the autocomplete/source code for `Typography()`. How many distinct text styles (like `displayLarge`, `labelSmall`) does the M3 system define? 

## Definition of Done
- [ ] You have created `ui/theme/Theme.kt`.
- [ ] `InventoryAppTheme` explicitly passes `colorScheme`, `typography`, and `shapes` to `MaterialTheme`.
- [ ] `MainActivity` has been stripped of all direct styling logic.
- [ ] The app runs and looks exactly the same as it did before.
- [ ] Commit your changes: `git commit -m "chore: extract InventoryAppTheme to dedicated file with explicit token categories"` (Why: To establish an intentional structure for overriding Material 3 defaults in upcoming lessons).
