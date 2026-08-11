# Lesson 09: Dark Mode — One Theme, Both Appearances

**What you will build**
You will add a complete dark color scheme parallel to the existing light scheme and update the `InventoryAppTheme` to automatically select between them based on the system's appearance settings. You will verify this by toggling the system-wide dark mode on your device and observing the app update its colors in real time without restarting. Finally, you will introduce dynamic color support for Android 12+ devices, allowing your app to derive its palette directly from the user's wallpaper.

**What you need to know first**
This lesson builds heavily on Lesson 02 (contrast ratios and M3 color roles). You should already have the light color scheme defined and be familiar with the roles of `primary`, `onPrimary`, `surface`, and `onSurface`. You also need a basic understanding of Compose's state reactivity, as the theme will recompose when system settings change.

**Terms introduced in this lesson**
* **Dynamic Color** — A feature introduced in Android 12 (Material You) where the system generates a unified color palette based on the user's current wallpaper. *Why it exists:* To provide a highly personalized, cohesive visual experience across the entire OS and all participating apps without requiring developers to build custom theming engines.
* **Monet** — The internal codename for the algorithm Android uses to extract colors from a wallpaper and generate a structurally sound tonal palette. *Why it exists:* Because algorithmically extracting aesthetic, high-contrast color palettes from arbitrary images is mathematically complex; Monet centralizes this logic in the OS.

**Objects and methods used**
* `darkColorScheme(...)`
  * *What it is:* A Compose Material 3 function that constructs a `ColorScheme` populated with default dark baseline colors, overridden by the parameters you provide.
  * *Implementation:* `val DarkColors = darkColorScheme(primary = Color(0xFF90CAF9), ...)`
  * *Its use:* To define the exact color values for every Material role when the app is presented in dark mode.
* `isSystemInDarkTheme()`
  * *What it is:* A Compose composable function that reads the host device's current system-wide appearance configuration.
  * *Implementation:* `val useDarkTheme = isSystemInDarkTheme()`
  * *Its use:* To determine which color scheme (light or dark) should be passed down the composition tree at runtime.
* `dynamicDarkColorScheme(...)` / `dynamicLightColorScheme(...)`
  * *What it is:* Functions that query the Android OS (Android 12+) for the Monet-generated wallpaper palette.
  * *Implementation:* `val colorScheme = dynamicDarkColorScheme(context)`
  * *Its use:* To opt into Material You personalized theming instead of hardcoded deliberate colors on supported devices.

---

## Concept Unit: Why Dark Mode is Not Just "Invert Everything"

### The Problem
When designers first approach dark mode, the instinct is often to take the light mode colors and invert them, or simply use the same brand colors against a black background. However, a dark blue `primary` color (like `#1565C0`) that looks great on a white background will be nearly illegible on a dark gray surface, violating the minimum 4.5:1 contrast ratio required for accessibility. Dark mode requires re-evaluating the tonal values of your palette: primary colors in dark mode typically need to be *lighter* and less saturated than their light mode counterparts to maintain legibility and reduce visual vibration against dark backgrounds.

### The New Code
```kotlin
// A conceptual mapping, not actual running code yet
val LightPrimary = Color(0xFF1565C0) // Dark Blue (high contrast on white)
val DarkPrimary = Color(0xFF90CAF9)  // Light Blue (high contrast on dark gray)
```

### The Updated Project
```kotlin
// ui/theme/Color.kt

package com.example.inventoryapp.ui.theme

import androidx.compose.ui.graphics.Color

val LightPrimary = Color(0xFF1565C0)
val LightOnPrimary = Color(0xFFFFFFFF)
val LightSurface = Color(0xFFFBFDF8)
val LightOnSurface = Color(0xFF191C19)

// ← new
val DarkPrimary = Color(0xFF90CAF9) 
val DarkOnPrimary = Color(0xFF003258)
val DarkSurface = Color(0xFF191C19)
val DarkOnSurface = Color(0xFFE2E2E5)
```

### Mechanical Walkthrough
* `DarkPrimary = Color(0xFF90CAF9)` — We define a distinctly lighter variant of our primary blue. *Why it exists:* To ensure the primary brand color remains readable and visually distinct against the near-black dark theme surface. Without this, the deep blue of `LightPrimary` would bleed into the dark background, failing accessibility checks.
* `DarkOnPrimary = Color(0xFF003258)` — We use a very dark blue for text sitting on top of `DarkPrimary`. *Why it exists:* Because `DarkPrimary` is now light, the text on top of it must be dark to maintain the contrast ratio. If we kept the white `LightOnPrimary`, it would be unreadable against the light blue.
* `DarkSurface` and `DarkOnSurface` — The background and text colors are essentially swapped from the light scheme. *Why it exists:* To provide the foundational dark canvas and legible light text. Note that `DarkSurface` is often a very dark gray (`#191C19`) rather than pure black (`#000000`), which reduces eye strain and smearing on OLED screens.

### CS Lens
This is an example of non-linear transformations in state mapping. You cannot simply apply a mathematical inversion `f(x) = 255 - x` to RGB values to get a dark theme, because human perception of color and contrast is non-linear. The transformation requires a separate, deliberately tuned data structure.

### SE Lens
The design principle here is explicit configuration over implicit magic. The framework could try to auto-darken your colors via an algorithm, but it would inevitably produce inaccessible or visually jarring results in edge cases. By forcing the developer to provide an explicit dark mapping, the framework ensures the final result is deliberate and verifiable.

### Run It Yourself
We haven't wired these colors into the app yet, so running it will show no change. This unit merely establishes the required palette structure in memory.

---

## Concept Unit: The `darkColorScheme` Constant

### The Problem
We have individual `Color` constants representing our dark palette, but Compose Material components don't know what `DarkPrimary` or `DarkSurface` are. We need to bundle these distinct colors into a standardized `ColorScheme` object that the Material design system understands and can distribute via `MaterialTheme`.

### The New Code
```kotlin
val DarkColorPalette = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkOnPrimary,
    surface = DarkSurface,
    onSurface = DarkOnSurface
)
```

### The Updated Project
```kotlin
// ui/theme/Theme.kt

package com.example.inventoryapp.ui.theme

import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme // ← new
// ... other imports

private val LightColorPalette = lightColorScheme(
    primary = LightPrimary,
    onPrimary = LightOnPrimary,
    surface = LightSurface,
    onSurface = LightOnSurface
)

// ← new
private val DarkColorPalette = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkOnPrimary,
    surface = DarkSurface,
    onSurface = DarkOnSurface
)
```

### Mechanical Walkthrough
* `darkColorScheme(...)` — A builder function provided by Material 3. *Why it exists:* To create a complete `ColorScheme` object prepopulated with dark-mode defaults for any roles you omit (like `error` or `tertiary`), ensuring the app doesn't crash or render invisibly if you forget a specific color role.
* `primary = DarkPrimary` — Mapping our specific color constant to the semantic role. *Why it exists:* So that when a button requests the `primary` color from the theme, it receives our custom light blue rather than the Material default purple.

### CS Lens
This represents the implementation of an Interface or Contract. `darkColorScheme` returns a `ColorScheme` object, which is the precise data structure `MaterialTheme` requires. We are satisfying the contract of the theming engine by packaging our raw data into the expected format.

### SE Lens
Notice we separate the *definition* of the raw colors (`Color.kt`) from the *assembly* of the semantic themes (`Theme.kt`). This separation of concerns means a designer can tweak the exact hex code of "Light Blue" in one file without ever touching the logic of how that blue is applied to the UI components.

### Run It Yourself
Again, the app will not change yet, as we have built the engine but haven't put it in the car.

---

## Concept Unit: `isSystemInDarkTheme()`

### The Problem
We now have two valid color schemes: `LightColorPalette` and `DarkColorPalette`. The app needs a way to decide which one to use when it launches, and more importantly, it needs to instantly switch between them if the user changes their device settings while the app is open.

### The New Code
```kotlin
val colors = if (isSystemInDarkTheme()) {
    DarkColorPalette
} else {
    LightColorPalette
}
```

### The Updated Project
```kotlin
// ui/theme/Theme.kt

package com.example.inventoryapp.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme // ← new
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable

// ... LightColorPalette and DarkColorPalette definitions ...

@Composable
fun InventoryAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(), // ← new
    content: @Composable () -> Unit
) {
    // ← new
    val colors = if (darkTheme) {
        DarkColorPalette
    } else {
        LightColorPalette
    }

    MaterialTheme(
        colorScheme = colors, // ← new
        typography = Typography,
        content = content
    )
}
```

### Mechanical Walkthrough
* `isSystemInDarkTheme()` — A composable function that queries the system environment. *Why it exists:* It bridges the gap between the Android OS configuration and the Compose runtime. Because it is a composable, Compose tracks it as state.
* `darkTheme: Boolean = isSystemInDarkTheme()` — A parameter with a default value. *Why it exists:* It defaults to the system setting, but allows callers to override it (e.g., if you want a "Force Dark Mode" toggle inside your app's own settings screen, or for generating specific previews).
* `val colors = if (darkTheme) ...` — The conditional logic selecting the scheme. *Why it exists:* To ensure the `MaterialTheme` receives a single, resolved `ColorScheme` based on current state. If `darkTheme` changes, this entire block recomposes, instantly swapping out the palette.

### CS Lens
This is reactive programming in action. `isSystemInDarkTheme()` does not just return a boolean once; it sets up a subscription to the system configuration. When the system configuration changes, Compose invalidates the `InventoryAppTheme` function, re-executing it and passing down the newly selected color scheme to all child components.

### SE Lens
The tradeoff here is performance vs. correctness. By making `darkTheme` a reactive state read on every recomposition, we incur a tiny overhead, but we guarantee that the app's UI is never out of sync with the user's OS-level preferences. The alternative—reading it once on `Activity.onCreate`—would require restarting the entire activity when the setting changes, resulting in a jarring user experience.

### Run It Yourself
1. Run the app on your device or emulator.
2. Observe the current theme (likely light mode).
3. Pull down the Android quick settings shade (or go to Settings -> Display) and toggle "Dark theme".
4. Return to the app. You will immediately see the UI using the dark background and light blue primary accents, without the app having restarted.

---

## Concept Unit: `dynamicColorScheme` (Android 12+)

### The Problem
While our deliberate light and dark themes are excellent, Android 12 introduced "Material You", which allows the system to generate a cohesive color palette directly from the user's wallpaper. Users expect modern apps to support this, so they feel seamlessly integrated into their personal device setup. We need to use this dynamic scheme if available, while falling back to our deliberate themes on older Android versions.

### The New Code
```kotlin
val colors = when {
    dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    }
    darkTheme -> DarkColorPalette
    else -> LightColorPalette
}
```

### The Updated Project
```kotlin
// ui/theme/Theme.kt

package com.example.inventoryapp.ui.theme

import android.os.Build // ← new
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.dynamicDarkColorScheme // ← new
import androidx.compose.material3.dynamicLightColorScheme // ← new
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext // ← new

// ... LightColorPalette and DarkColorPalette definitions ...

@Composable
fun InventoryAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true, // ← new
    content: @Composable () -> Unit
) {
    // ← new
    val colors = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorPalette
        else -> LightColorPalette
    }

    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content
    )
}
```

### Mechanical Walkthrough
* `dynamicColor: Boolean = true` — A flag enabling the feature by default. *Why it exists:* It provides an easy way to disable dynamic colors (e.g., `InventoryAppTheme(dynamicColor = false)`) if you absolutely must enforce your brand colors on a specific screen.
* `Build.VERSION.SDK_INT >= Build.VERSION_CODES.S` — The runtime OS version check. *Why it exists:* Dynamic color APIs were introduced in Android 12 (API 31, code `S`). Calling these functions on Android 11 or lower will cause a `NoSuchMethodError` crash. This guard guarantees backward compatibility.
* `val context = LocalContext.current` — Retrieves the Android `Context`. *Why it exists:* The dynamic color schemes are not generated by Compose; they are pulled from the Android OS via Context system services. `LocalContext.current` provides the bridge from the Compose world to the Android platform world.
* `dynamicDarkColorScheme(context)` — Asks the OS for the wallpaper-derived palette. *Why it exists:* To retrieve the precise hex values the Monet algorithm generated, perfectly mapped into the Material 3 `ColorScheme` structure.

### CS Lens
This is the Strategy Pattern implemented via conditional logic. The `colors` variable requires a `ColorScheme` object, and we have three distinct strategies for obtaining one: OS-generated (dynamic), hardcoded dark, or hardcoded light. The `when` block acts as the strategy selector based on environment constraints (OS version, user preference).

### SE Lens
We are balancing brand identity against platform consistency. By defaulting `dynamicColor = true`, we choose to prioritize making the user feel at home on their device over forcing our specific brand blue. However, by maintaining our deliberate fallbacks, we ensure a high-quality experience on older devices where dynamic colors aren't available.

### Run It Yourself
1. Run the app on an Android 12+ emulator or physical device.
2. Go to the device's home screen, long-press, and change the wallpaper to an image with strong, distinct colors (e.g., deep red or bright green).
3. Return to the app. You will see that buttons and surfaces are now tinted based on the wallpaper, completely ignoring the `LightPrimary` and `DarkPrimary` you defined earlier.

---

## Connect the Pieces
Consider what happens when the app launches on an Android 13 device with dark mode enabled and a green wallpaper:
1. `InventoryAppTheme` is invoked.
2. `isSystemInDarkTheme()` evaluates to `true`.
3. `dynamicColor` is `true` (by default).
4. The `when` block evaluates the first condition: `dynamicColor` is true AND the OS is Android 13 (`>= S`), so it enters the branch.
5. It grabs the `Context` and checks `darkTheme` (which is `true`), calling `dynamicDarkColorScheme(context)`.
6. The OS returns a `ColorScheme` generated from the green wallpaper, optimized for dark mode.
7. This dynamic palette is assigned to `colors` and passed to `MaterialTheme`.
8. Your UI components draw themselves using the dynamically generated green-tinted dark colors.
If the same app runs on an Android 10 device, the first `when` condition fails. It falls back to `darkTheme -> DarkColorPalette`, injecting your deliberate `DarkPrimary` (light blue) palette instead.

## What Breaks Without This
Remove the OS version check from the dynamic color logic:
```kotlin
val colors = when {
    dynamicColor -> { // CRASH ON OLD DEVICES
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    }
    // ...
}
```
If you run this on an Android 11 emulator, the app will instantly crash with a `java.lang.NoSuchMethodError` or `NoClassDefFoundError` because `dynamicDarkColorScheme` internally calls Android OS APIs that physically do not exist on that version of the operating system. The `Build.VERSION` check is not a suggestion; it is a structural requirement for stability.

## Exercises
1. **Force Light Mode:** Temporarily modify `InventoryAppTheme` so that it completely ignores the system dark theme setting and always uses the `LightColorPalette`, regardless of OS version or wallpaper. Observe how the app behaves when you toggle the device's dark mode.
2. **Disable Dynamic Color:** Update your `MainActivity` where `InventoryAppTheme` is called, and pass `dynamicColor = false`. Change your wallpaper on an Android 12+ device and verify that the app now stubbornly sticks to your hardcoded `LightPrimary` and `DarkPrimary` colors.

## Definition of Done
- You have defined `DarkPrimary`, `DarkOnPrimary`, `DarkSurface`, and `DarkOnSurface` in `Color.kt`.
- You have created a `DarkColorPalette` using `darkColorScheme(...)` in `Theme.kt`.
- `InventoryAppTheme` dynamically selects between dynamic colors, dark mode, and light mode using `when` and `isSystemInDarkTheme()`.
- You have verified on a device that toggling system dark mode updates the app instantly.
- You have committed your changes to version control with a message explaining the logic: `git commit -m "feat: Add dark mode palette and Android 12 dynamic color support"`
