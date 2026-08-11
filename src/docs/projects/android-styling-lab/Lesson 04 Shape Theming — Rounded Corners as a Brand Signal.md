# Lesson 4: Shape Theming — Rounded Corners as a Brand Signal

**What you will build**
A `Shapes` object setting `extraSmall` (4.dp), `small` (8.dp), `medium` (16.dp), `large` (24.dp), and `extraLarge` (28.dp) corner radii — applied automatically to every `Button`, `Card`, text field, dialog, and sheet in the app via the `MaterialTheme` shapes slot. The transferable problem: without a shape system, buttons have different corners from cards which have different corners from sheets, and changing one requires finding every call site.

**What you need to know first**
- `android-kotlin-foundations` Lesson 14 and Lesson 26 (modifiers and clipping).
- `android-styling-lab` Lessons 01–03 (Color and Typography theming, MaterialTheme wiring).

**Terms introduced in this lesson**
- **Shape scale** — The set of five named semantic sizes (`extraSmall` through `extraLarge`) used by Material Design 3. *Why it exists: It creates a standardized language for shape across the entire component library, allowing developers to redefine the brand universally.*
- **Corner-based shape** — A shape whose geometry is defined purely by manipulating its four corners, rather than drawing arbitrary paths. *Why it exists: Almost all UI components are rectangles, and corner manipulation is computationally cheap and universally understood by users.*

**Objects and methods used**
- `Shapes`
  - *What it is:* A data class containing the five `CornerBasedShape` properties for the Material Design 3 shape scale.
  - *Implementation:* `androidx.compose.material3.Shapes`
  - *Its use:* Passed to the `MaterialTheme` composable to define the shapes used by standard components.
- `RoundedCornerShape`
  - *What it is:* A shape that rounds its corners based on a provided radius.
  - *Implementation:* `androidx.compose.foundation.shape.RoundedCornerShape`
  - *Its use:* Used to define the actual radius of corners for a shape in the scale.
- `CutCornerShape`
  - *What it is:* A shape that cuts its corners geometrically instead of rounding them.
  - *Implementation:* `androidx.compose.foundation.shape.CutCornerShape`
  - *Its use:* Used as an alternative to rounded corners to convey a different brand signal (sharp, technical).

---

## Concept Unit: The M3 Shape Scale

### The Problem
Material 3 components are not hardcoded with 8dp or 16dp corners. Instead, they are hardcoded to use specific *slots* from a central shape scale. A `Button` uses the `full` shape by default, a `Card` uses the `medium` shape, and an `AlertDialog` uses the `extraLarge` shape. You don't control which component uses which size — you control what each size *means* in your app. We need to define this mapping.

### The New Code
```kotlin
val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(28.dp)
)
```

### The Updated Project
`ui/theme/Shape.kt`
```kotlin
package com.example.inventoryapp.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

// ← new
val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(28.dp)
)
```

### Mechanical Walkthrough
- `val AppShapes = Shapes(...)`: We instantiate the Material 3 `Shapes` data class. *Without this, we have no object to pass to our theme, and components will fall back to default M3 baseline shapes.*
- `extraSmall`, `small`, `medium`, `large`, `extraLarge`: These are the semantic slots provided by the `Shapes` class. We map each to a specific radius. *Without defining these, they default to the baseline values, meaning our brand's unique geometry wouldn't apply globally.*
- `RoundedCornerShape(4.dp)`: Defines a shape where all four corners are rounded by 4 density-independent pixels. *Without `dp`, the radius would be based on arbitrary screen pixels, causing corners to look tiny on high-density displays and huge on low-density ones.*

### CS Lens
The shape scale acts as an **Indirection Layer**. Components do not know their absolute geometry; they only know their relative semantic size (e.g., "I am a medium container"). The `Shapes` object acts as the resolution table. This is identical to how virtual memory maps virtual addresses to physical pages, or how DNS maps domain names to IP addresses.

### SE Lens
The design principle here is **Inversion of Control (IoC)**. The component gives up control over its exact appearance to the theme context. The alternative is configuring every `Card(shape = RoundedCornerShape(16.dp))` individually. That requires finding every call site when the brand changes, which is a maintenance nightmare and guarantees inconsistencies.

### Run It Yourself
We have only defined the `AppShapes` object; it is not yet wired into the theme. Nothing changes visually on the device yet. 

---

## Concept Unit: RoundedCornerShape vs CutCornerShape

### The Problem
Before we apply our shape scale, we need to understand the design signal we are sending. `RoundedCornerShape` feels approachable and organic. `CutCornerShape` feels sharp, technical, and digital. This is a real brand signal, not just an aesthetic preference. We need to test how a cut corner feels compared to a rounded corner.

### The New Code
```kotlin
@Composable
fun ShapeExperiment() {
    Column(modifier = Modifier.padding(16.dp)) {
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(Color.Blue, RoundedCornerShape(16.dp))
        )
        Spacer(modifier = Modifier.height(16.dp))
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(Color.Red, CutCornerShape(16.dp))
        )
    }
}
```

### The Updated Project
`MainActivity.kt`
```kotlin
package com.example.inventoryapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CutCornerShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            // ← new
            ShapeExperiment()
        }
    }
}

// ← new
@Composable
fun ShapeExperiment() {
    Column(modifier = Modifier.padding(16.dp)) {
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(Color.Blue, RoundedCornerShape(16.dp))
        )
        Spacer(modifier = Modifier.height(16.dp))
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(Color.Red, CutCornerShape(16.dp))
        )
    }
}
```

### Mechanical Walkthrough
- `.background(Color, Shape)`: This overload of the `background` modifier paints the background color but clips it to the specified shape. *Without the second parameter, the box would just be a sharp-cornered rectangle.*
- `RoundedCornerShape(16.dp)`: Generates a path with 16dp rounded corners.
- `CutCornerShape(16.dp)`: Generates a path that draws straight lines diagonally across the corners, starting 16dp away from the actual corner vertex. *Without this specific class, creating a cut-corner effect would require writing a custom path algorithm.*

### CS Lens
These shape classes are **Strategies** (from the Strategy Design Pattern). The `background` modifier doesn't know how to draw corners. It delegates the geometry calculation to the provided `Shape` interface implementation.

### SE Lens
The tradeoff between cut and rounded corners is about **User Psychology vs Universal Convention**. Rounded corners are the universal standard (iOS, Android M3 default); they are safe and expected. Cut corners are a deliberate deviation that stands out, often used in gaming or fintech apps to signal precision or edginess.

### Run It Yourself
Run the app. You will see a blue box with smooth corners and a red box with angular, cut corners. Discard `ShapeExperiment` after viewing; we will proceed with our rounded shape scale.

---

## Concept Unit: Building the Shapes object and wiring it

### The Problem
We have our `AppShapes` defined, but Material components are completely ignoring it. They are still reading from the default Material 3 fallback shapes. We need to inject our shape scale into the ambient theme context so every component can find it.

### The New Code
```kotlin
MaterialTheme(
    colorScheme = colorScheme,
    typography = AppTypography,
    shapes = AppShapes,
    content = content
)
```

### The Updated Project
`ui/theme/Theme.kt`
```kotlin
package com.example.inventoryapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

@Composable
fun InventoryTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = lightColorScheme(
        // ... colors ...
    )

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        shapes = AppShapes, // ← new
        content = content
    )
}
```

### Mechanical Walkthrough
- `shapes = AppShapes`: We pass our custom `Shapes` instance into the `shapes` parameter of `MaterialTheme`. *Without this argument, `MaterialTheme` uses `MaterialTheme.shapes` default, falling back to M3 baselines, meaning cards and dialogs ignore our custom radii.*

### CS Lens
This is **Dependency Injection** via context. Instead of passing `AppShapes` explicitly to every `Card` and `Button` down the tree, `MaterialTheme` provides it implicitly using a `CompositionLocal`. Any composable inside the `content` block can resolve this dependency.

### SE Lens
By keeping `colorScheme`, `typography`, and `shapes` separate but assembling them in one `MaterialTheme` call, we adhere to the **Single Responsibility Principle**. The color file handles color, the shape file handles geometry, and the theme file acts purely as the composition root.

### Run It Yourself
Run the app. Look at any `Card` or `AlertDialog` in the InventoryApp. Their corner radii will now strictly match the 16dp (`medium`) and 28dp (`extraLarge`) values we defined.

---

## Concept Unit: Using shape roles explicitly in code

### The Problem
Material components like `Card` read from `MaterialTheme.shapes` automatically. But what if we build a custom composable — like a custom highlighted text block — that uses a standard `Box`? A `Box` doesn't read from the shape scale. We must explicitly reach into the theme to pull the correct shape value to maintain visual consistency.

### The New Code
```kotlin
Box(
    modifier = Modifier
        .clip(MaterialTheme.shapes.medium)
        .background(MaterialTheme.colorScheme.primaryContainer)
)
```

### The Updated Project
`ui/components/CustomHighlightBlock.kt`
```kotlin
package com.example.inventoryapp.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp

@Composable
fun CustomHighlightBlock(text: String) {
    Box(
        modifier = Modifier
            // ← new
            .clip(MaterialTheme.shapes.medium)
            .background(MaterialTheme.colorScheme.primaryContainer)
            .padding(16.dp)
    ) {
        Text(
            text = text,
            color = MaterialTheme.colorScheme.onPrimaryContainer
        )
    }
}
```

### Mechanical Walkthrough
- `.clip(MaterialTheme.shapes.medium)`: We read the `medium` slot from the ambient theme and apply it to the `clip` modifier. *Without `MaterialTheme.shapes.medium`, we would hardcode `RoundedCornerShape(16.dp)`. If the brand changes `medium` to 12dp later, this component would be visually broken.*
- `.background(...)`: Applies color. We must clip before applying the background color, or the color will paint outside the rounded corners. *Without clipping first (or passing the shape directly to `background`), the corners remain sharp visually.*

### CS Lens
`MaterialTheme.shapes.medium` is a **Global Variable disguised as Context**. It is globally available to any composable in the tree, but it is scoped and safe because it is immutable and provided explicitly by the root `MaterialTheme`.

### SE Lens
The principle is **Single Source of Truth (SSOT)**. When building custom UI, you should never hardcode a dimension or shape that semantically belongs to the brand identity. By referencing `MaterialTheme.shapes`, this custom block is resilient to future redesigns.

### Run It Yourself
Add a `CustomHighlightBlock("Test String")` to your main screen and run the app. It will render with the exact same 16dp corners as your standard `Card` components, proving the theming system unifies custom and standard UI.

---

## Connect the Pieces

Let's trace how a custom shape ends up on the screen:
1. In `Shape.kt`, you define `AppShapes` where `medium = RoundedCornerShape(16.dp)`.
2. In `Theme.kt`, you pass `AppShapes` to `MaterialTheme(shapes = AppShapes)`.
3. In `MainActivity.kt`, you wrap your app in `InventoryTheme`.
4. Inside the app, you render a `Card`.
5. The `Card` composable internally checks its M3 spec: "I need the medium shape."
6. It reads `MaterialTheme.shapes.medium` from the nearest `MaterialTheme` context.
7. It receives your `RoundedCornerShape(16.dp)`.
8. The `Card` applies this shape to its background, rounding the corners at 16dp.
9. Similarly, `CustomHighlightBlock` manually asks for `MaterialTheme.shapes.medium`, receives the exact same `16.dp` definition, and clips its background. Both standard and custom components stay in sync.

## What Breaks Without This

Let's deliberately break the shape resolution by removing our custom shapes from the theme.

1. Open `ui/theme/Theme.kt`.
2. Comment out the `shapes = AppShapes` line in `MaterialTheme`.
3. Run the app.
4. **What goes wrong:** Look at your `CustomHighlightBlock` and your standard `Card`. They no longer use 16dp corners. They have reverted to the Material 3 baseline shapes. You have lost control of your app's visual identity because the resolution table was decoupled from the context.
5. **Restore it:** Uncomment `shapes = AppShapes` and run again to bring the brand back.

## Exercises

1. **The Fintech Rebrand:** Change every shape in `AppShapes` to a `CutCornerShape` with the same radii. Run the app and observe how drastically the personality of the UI changes from friendly to aggressive/technical.
2. **The Pill Button:** Buttons use the `Shapes.full` default in M3, which isn't part of the standard five-slot scale. However, you can override a specific component's shape manually. Find a `Button` in your app and pass `shape = MaterialTheme.shapes.extraSmall`. Watch it turn from a pill shape into a near-rectangle.
3. **Mismatched Geometry:** In `CustomHighlightBlock`, remove the `.clip()` modifier but keep the background color. Observe what happens to the corners. Add the shape directly to the `.background(color, shape)` modifier instead of using `.clip()`.

## Definition of Done

- [ ] `Shape.kt` defines a complete `AppShapes` object mapping five semantic sizes to `RoundedCornerShape`.
- [ ] `InventoryTheme` injects `AppShapes` into the `MaterialTheme` composable.
- [ ] `CustomHighlightBlock` reads `MaterialTheme.shapes.medium` instead of hardcoding a corner radius.
- [ ] The app compiles and standard components visibly adopt the custom radii.
- [ ] You have committed your changes with a message explaining the architectural decision:
  `git commit -m "Configure AppShapes in MaterialTheme to establish a single source of truth for component corner radii"`
