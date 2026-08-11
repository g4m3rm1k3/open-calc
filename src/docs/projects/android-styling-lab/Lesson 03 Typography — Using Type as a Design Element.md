# Lesson 03: Typography — Using Type as a Design Element

**What you will build**
You will replace every unstyled `Text()` call in the InventoryApp with semantically-typed text using Material 3's type scale, loaded from a real custom typeface (Nunito via the Compose Google Fonts library). The transferable problem is this: if you use ad-hoc font sizes everywhere in an application, changing your typeface or adjusting scaling for accessibility requires touching every single call site. Semantic type roles mean you define the visual identity in one object, and the UI components just declare their structural purpose.

**What you need to know first**
* `android-kotlin-foundations` Lesson 14: Working with `Text` composables and string resources.
* `android-kotlin-foundations` Lesson 26: Basic application of Compose modifiers.
* `android-styling-lab` Lesson 01: The structure of a Material 3 theme.
* `android-styling-lab` Lesson 02: Semantic color roles and the `MaterialTheme` object.

**Terms introduced in this lesson**
* **Typeface** — A specific design of letters, numbers, and symbols (e.g., Nunito). *Why it exists:* It provides the distinct visual personality of the text, separating the content from its appearance.
* **Semantic Type Role** — A functional category for text, like "Headline" or "Body", rather than a physical description like "24sp bold". *Why it exists:* It allows a design system to scale and adapt globally without rewriting individual UI elements.
* **Font Fallback** — The system's behavior of substituting a default font if the requested custom font cannot be loaded. *Why it exists:* It ensures text remains readable even during network failures or missing font assets, preventing the application from crashing.

**Objects and methods used**
* `androidx.compose.ui.text.font.FontFamily`
  * *What it is:* A collection of fonts that represent different weights and styles of a single typeface.
  * *Implementation:* `val NunitoFontFamily = FontFamily(Font(googleFont = ...))`
  * *Its use:* Acts as the central identifier for a typeface when applying it to a `TextStyle`.
* `androidx.compose.ui.text.googlefonts.GoogleFont.Provider`
  * *What it is:* A configuration object detailing how to fetch fonts securely from Google Fonts.
  * *Implementation:* `val provider = GoogleFont.Provider(providerAuthority = "com.google.android.gms.fonts", ...)`
  * *Its use:* Connects the Compose font loading system to the Android system's downloadable fonts mechanism.
* `androidx.compose.material3.Typography`
  * *What it is:* The Material 3 object that holds the complete set of 15 semantic text styles.
  * *Implementation:* `val AppTypography = Typography(bodyLarge = TextStyle(...), ...)`
  * *Its use:* Passed into `MaterialTheme` to define the text styling for the entire application.
* `androidx.compose.ui.text.TextStyle`
  * *What it is:* An immutable object containing the visual styling configuration for text.
  * *Implementation:* `TextStyle(fontFamily = NunitoFontFamily, fontSize = 16.sp, ...)`
  * *Its use:* Defines exactly how a specific type role (like `bodyLarge`) should look in terms of size, weight, and line height.

---

## Concept Unit: M3's Type Scale

### The Problem
When building user interfaces, you frequently need text of different sizes: huge text for marketing banners, large text for screen titles, medium text for paragraphs, and tiny text for timestamps. If you manually set `fontSize = 24.sp` on every title, your code becomes brittle. If design decides titles should now be `22.sp`, you have to hunt down every instance. Furthermore, a user with accessibility needs who increases their system font size might break your hardcoded layout.

### The New Code
```kotlin
// We don't write ad-hoc sizes:
// Text("Inventory", fontSize = 24.sp)

// Instead, we declare the text's role in the hierarchy:
Text(
    text = "Inventory",
    style = MaterialTheme.typography.titleLarge
)
```

### The Updated Project
```kotlin
// ui/screens/InventoryListScreen.kt
@Composable
fun InventoryListScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        text = "Inventory",
                        style = MaterialTheme.typography.titleLarge // ← new
                    ) 
                }
            )
        }
    ) { padding ->
        // ...
    }
}
```

### Mechanical Walkthrough
* `style = MaterialTheme.typography.titleLarge` — We assign a pre-defined `TextStyle` from the active Material theme. We are using `titleLarge`, one of the 15 semantic roles. Without this, the `Text` composable falls back to its default style, which usually resolves to the generic system default (typically `bodyLarge` equivalent).

### CS Lens
This is an application of **indirection** and **semantic abstraction**. We are decoupling the *meaning* of the text (it's a large title) from its *implementation* (it's exactly 22 scalable pixels tall, medium weight, sans-serif).

### SE Lens
The design principle here is **Single Source of Truth**. By relying on semantic roles, the concrete sizing and styling logic lives entirely within the Theme. The alternative—inline styling—creates scattered, duplicated logic that invariably falls out of sync over a project's lifecycle.

### Run It Yourself
Run the app. You won't see a massive visual change yet because we are still using the default Material 3 `Typography` object, which maps `titleLarge` to a standard Roboto configuration. The visible result is that the title looks like a standard app bar title.

---

## Concept Unit: Loading a custom typeface with Google Fonts Compose

### The Problem
Roboto is clean, but it doesn't give our InventoryApp a unique personality. We want to use "Nunito". Bundling font files (`.ttf`) inside the app APK increases download size. We want to load the font efficiently and asynchronously from Google Fonts at runtime using Android's downloadable fonts system.

### The New Code
```kotlin
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.googlefonts.GoogleFont
import androidx.compose.ui.text.googlefonts.Font
import com.example.inventoryapp.R

val provider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs
)

val fontName = GoogleFont("Nunito")

val NunitoFontFamily = FontFamily(
    Font(googleFont = fontName, fontProvider = provider)
)
```

### The Updated Project
```kotlin
// ui/theme/Type.kt
package com.example.inventoryapp.ui.theme

import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.googlefonts.GoogleFont
import androidx.compose.ui.text.googlefonts.Font
import com.example.inventoryapp.R

// ← new
val provider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = R.array.com_google_android_gms_fonts_certs
)

// ← new
val fontName = GoogleFont("Nunito")

// ← new
val NunitoFontFamily = FontFamily(
    Font(googleFont = fontName, fontProvider = provider)
)
```

### Mechanical Walkthrough
* `GoogleFont.Provider(...)` — Configures how the system fetches the font. It tells Compose to use Google Play Services (`com.google.android.gms`) as the font provider. Without this, the system doesn't know who is authorized to deliver the font over the network.
* `certificates = R.array.com_google_android_gms_fonts_certs` — Provides the cryptographic hashes of the provider's signing certificates (this XML file must be in your `res/values/` directory). Without this, Android will refuse to load the font to prevent malicious code injection via compromised font files.
* `GoogleFont("Nunito")` — Declares the exact name of the typeface requested from the provider.
* `Font(googleFont = ..., fontProvider = ...)` — Connects the requested font name with the provider capable of resolving it.
* `FontFamily(...)` — Wraps the individual `Font` into a family.

### CS Lens
This demonstrates **lazy loading** and **fail-safe degradation**. The font is requested asynchronously. If the user has no internet connection the first time they open the app, or if Play Services is missing, the Compose text system gracefully falls back to the default system font (Roboto) instead of crashing or leaving a blank screen.

### SE Lens
The principle is **Separation of Concerns**. We delegate the storage, caching, and serving of font assets to a specialized OS-level service (Google Play Services) rather than bloating our application binary. The tradeoff is a slight dependency on external system state, mitigated by the built-in fallback mechanism.

### Run It Yourself
You won't see a change on screen yet because we have defined the `FontFamily`, but we haven't told our application's `Typography` to use it.

---

## Concept Unit: Building the Typography object

### The Problem
Now that we have our `NunitoFontFamily`, we need to instruct Material 3 to actually use it for the semantic roles in our app. We must construct a custom `Typography` object overriding the roles we care about: `displayLarge`, `headlineMedium`, `titleLarge`, `bodyLarge`, `bodyMedium`, and `labelLarge`.

### The New Code
```kotlin
import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val AppTypography = Typography(
    bodyLarge = TextStyle(
        fontFamily = NunitoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    // Other roles defined similarly...
)
```

### The Updated Project
```kotlin
// ui/theme/Type.kt
// ... (provider and FontFamily definitions from previous step)

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// ← new
val AppTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = NunitoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 57.sp,
        lineHeight = 64.sp,
        letterSpacing = (-0.25).sp
    ),
    headlineMedium = TextStyle(
        fontFamily = NunitoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.sp
    ),
    titleLarge = TextStyle(
        fontFamily = NunitoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = NunitoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = NunitoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.2.sp
    ),
    labelLarge = TextStyle(
        fontFamily = NunitoFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    )
)
```

```kotlin
// ui/theme/Theme.kt
@Composable
fun InventoryAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography, // ← new
        content = content
    )
}
```

### Mechanical Walkthrough
* `Typography(...)` — The constructor for the Material 3 typography system. We pass in custom `TextStyle` instances for specific named parameters. Any parameters we *don't* pass will retain their M3 default (using Roboto).
* `bodyLarge = TextStyle(...)` — We are explicitly redefining what "Body Large" means in our application. Without doing this mapping, M3 uses its internal defaults.
* `fontFamily = NunitoFontFamily` — Directs this specific style to use our custom font.
* `fontSize`, `lineHeight`, `letterSpacing` — The physical metrics of the text. `sp` (scalable pixels) are used instead of `dp` so that text scales correctly with the user's system-wide accessibility settings.
* `typography = AppTypography` — Inside `MaterialTheme`, we inject our custom configuration. Without this, the app completely ignores the `AppTypography` object we just built.

### CS Lens
This is an instance of **Configuration Injection**. The `MaterialTheme` acts as a context provider. By injecting `AppTypography`, every descendant node in the Compose tree that reads `MaterialTheme.typography` will receive our custom definitions.

### SE Lens
**Open/Closed Principle.** The `MaterialTheme` composable is closed for modification (you can't rewrite Google's source code for it), but open for extension (you can inject your own `Typography` configuration to completely alter its behavior).

### Run It Yourself
Run the app. Because we previously updated the app bar title to use `style = MaterialTheme.typography.titleLarge`, you will now see the word "Inventory" rendered in the Nunito typeface.

---

## Concept Unit: Applying roles to real composables

### The Problem
We have a fully configured typography system, but the rest of the app is still using unstyled `Text()` composables. When a `Text` composable lacks an explicit `style`, it implicitly uses `MaterialTheme.typography.bodyLarge`. If we want semantic structure (like headlines looking like headlines and labels looking like labels), we must explicitly assign roles to all our text elements.

### The New Code
```kotlin
Text(
    text = item.name,
    style = MaterialTheme.typography.bodyLarge
)
Text(
    text = "Qty: ${item.quantity}",
    style = MaterialTheme.typography.labelLarge
)
```

### The Updated Project
```kotlin
// ui/components/InventoryItemRow.kt
@Composable
fun InventoryItemRow(item: InventoryItem) {
    Row(
        modifier = Modifier.padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.name,
                style = MaterialTheme.typography.bodyLarge // ← new
            )
            Text(
                text = "SKU: ${item.sku}",
                style = MaterialTheme.typography.bodyMedium // ← new
            )
        }
        Text(
            text = "Qty: ${item.quantity}",
            style = MaterialTheme.typography.labelLarge // ← new
        )
    }
}
```

```kotlin
// ui/screens/LoginScreen.kt
@Composable
fun LoginScreen() {
    Column {
        Text(
            text = "Welcome Back",
            style = MaterialTheme.typography.headlineMedium // ← new
        )
        // ... (Text fields here, labels should use bodyMedium)
    }
}
```

### Mechanical Walkthrough
* `style = MaterialTheme.typography.bodyLarge` — Applied to the primary item name. This tells the system "this is the primary reading text for this component."
* `style = MaterialTheme.typography.bodyMedium` — Applied to secondary info (SKU). It establishes a visual hierarchy within the `Column`, making the SKU less prominent than the name.
* `style = MaterialTheme.typography.labelLarge` — Applied to the quantity. "Labels" are meant for functional, utilitarian text (like button text or concise data readouts).
* `style = MaterialTheme.typography.headlineMedium` — Applied to the login screen header. It signals significant, structural prominence, visually distinguishing the start of a major workflow.

### CS Lens
This is **Tree Traversal and Context Resolution**. When Compose renders the `Text` node, it evaluates the `style` parameter. Because we passed a reference to `MaterialTheme.typography.bodyMedium`, it walks up the composition tree to find the nearest `MaterialTheme` provider, extracts the active `Typography` object, reads the `bodyMedium` property, and resolves it to our Nunito-based `TextStyle`.

### SE Lens
We are enforcing **Consistency through Constraints**. By limiting developers to only using the semantic properties on `MaterialTheme.typography`, we prevent the UI from becoming a mess of inconsistent font sizes and weights. If a designer changes their mind about how labels should look, the change is made in exactly one file (`Type.kt`).

### Run It Yourself
Run the app on an emulator. Navigate through the Login screen to the Inventory list. Observe the distinct visual hierarchy: the large welcoming headline, the clear item names, the smaller SKU text, and the stylized quantity labels, all rendered uniformly in the Nunito typeface.

---

## Connect the Pieces
Let's trace exactly how the Login screen heading gets its appearance:
1. The developer writes `Text("Welcome Back", style = MaterialTheme.typography.headlineMedium)`.
2. Compose looks up the composition tree and finds `InventoryAppTheme`.
3. `InventoryAppTheme` provides `AppTypography` to the material theme system.
4. `AppTypography` maps `headlineMedium` to a `TextStyle` requesting `NunitoFontFamily` at `28.sp`.
5. `NunitoFontFamily` directs Compose to the `GoogleFont.Provider`.
6. The provider queries Google Play Services for "Nunito".
7. The font is resolved, loaded into memory, and the text "Welcome Back" is drawn on screen at the correct size and weight.

## What Breaks Without This
Let's deliberately break the font provider configuration to see the fallback behavior.
1. Open `ui/theme/Type.kt`.
2. Modify the provider authority to be invalid:
   ```kotlin
   val provider = GoogleFont.Provider(
       providerAuthority = "com.google.android.gms.BROKEN.fonts", // Deliberately broken
       // ...
   )
   ```
3. Run the app.
4. **What goes wrong:** The app *does not crash*. However, because Play Services cannot resolve the authority, the font load fails silently. Compose detects the failure and gracefully falls back to the default system font (Roboto). Your text sizes (`28.sp`, etc.) remain correct, but the distinct Nunito styling is gone.
5. Restore the correct authority `com.google.android.gms.fonts` and rebuild.

## Exercises
1. **Change the Typeface:** Change the `fontName` in `Type.kt` from "Nunito" to "Oswald" (another Google Font). Re-run the app to see the entirely new visual identity applied globally. Switch it back to Nunito when you are done.
2. **Override a Default:** Create a new `Text` on the Login screen and give it `style = MaterialTheme.typography.displayLarge`. Note how massive it is. In `Type.kt`, change the `displayLarge` `fontSize` to `80.sp`. Watch the UI update immediately.
3. **Accessibility Test:** On your emulator, go to Android Settings -> Display -> Font size, and set it to the maximum size. Open InventoryApp and observe how your semantically styled text scales automatically because we used `sp` units in our `TextStyle` definitions.

## Definition of Done
* You have defined a `GoogleFont.Provider` and `FontFamily` in `Type.kt`.
* You have instantiated a custom `Typography` object mapping M3 roles to the new `FontFamily`.
* You have injected the `Typography` object into your `MaterialTheme`.
* Every `Text` component in `InventoryItemRow` and `LoginScreen` explicitly uses a semantic typography role.
* You can run the app and visually confirm the new typeface and hierarchy.
* Commit your changes with the message: `style: apply Nunito typeface and M3 semantic typography roles to centralize styling and ensure global consistency.`
