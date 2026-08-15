# Lesson 04: Shape Theming in XML — ShapeAppearance Styles

**What you will build**
You will override the Material Design Components (MDC) global shape scale by defining three distinct `ShapeAppearance` styles in a new `res/values/shape.xml` file, and mapping them to your app's theme. The transferable problem you are solving is centralizing geometric branding: instead of styling individual buttons and cards with hardcoded corner radii, you define small, medium, and large corner treatments once at the theme level, ensuring consistent geometry across every MDC widget in the app automatically.

**What you need to know first**
- `themes.xml` and `colors.xml` structure (from `android-ui-foundations` Lesson 34).
- Style inheritance using the `parent=` attribute.
- How to navigate Android Studio's resource folders.

**Terms introduced in this lesson**
- **Shape scale** — A standardized hierarchy of component sizes (Small, Medium, Large) defined by MDC that dictates the geometric styling for different types of UI elements. *Why it exists:* It provides a single source of truth for app geometry, preventing the need to manually apply corner shapes to every individual widget, which scales poorly and invites visual inconsistency.
- **Corner family** — The geometric treatment applied to a shape's corners, typically `rounded` or `cut`. *Why it exists:* It allows a brand to express character (e.g., approachability vs. structural precision) structurally across all components without needing custom drawing logic.

**Objects and methods used**
- `ShapeAppearanceOverlay`
  - *What it is:* A style definition used specifically to override MDC shape parameters.
  - *Implementation:* `<style name="ShapeAppearanceOverlay.InventoryApp.SmallComponent" parent="">`
  - *Its use:* Acts as the container for `cornerFamily` and `cornerSize` attributes.
- `cornerFamily`
  - *What it is:* An XML attribute determining the geometry of a corner.
  - *Implementation:* `<item name="cornerFamily">rounded</item>`
  - *Its use:* Switches corners between standard rounded edges and chamfered (cut) edges.
- `cornerSize`
  - *What it is:* An XML attribute determining the scale of the corner geometry.
  - *Implementation:* `<item name="cornerSize">12dp</item>`
  - *Its use:* Defines the exact radius for a rounded corner or the length of the cut for a cut corner.

---

## Concept Unit: The MDC Shape Scale

### The Problem
When you want to change the corner radius of all your buttons, text inputs, and cards, manually adding `app:cornerRadius` to every single XML layout file is tedious, error-prone, and impossible to maintain. If the design changes, you have to update dozens of files. Material Design Components solve this by categorizing every UI widget into one of three buckets based on its physical size and usage.

### The New Code
| Shape Scale Component | Used by MDC Widgets |
| :--- | :--- |
| `shapeAppearanceSmallComponent` | `MaterialButton`, `Chip`, `TextInputLayout`, `FloatingActionButton` (mini) |
| `shapeAppearanceMediumComponent` | `MaterialCardView`, `AlertDialog` |
| `shapeAppearanceLargeComponent` | `BottomSheetDialog`, `NavigationView` |

### The Updated Project
No code changes in this unit.

### Mechanical Walkthrough
- **Component grouping**: MDC widgets automatically look up their shape from the theme based on this grouping. You do not tell a `MaterialCardView` to use the medium shape scale; it inherently knows to look for `shapeAppearanceMediumComponent`.
- **Theme-level indirection**: By modifying what the small, medium, and large scales mean in your app's theme, every widget in that bucket immediately adopts the new geometry.

### CS Lens
This is an application of **indirection** and **semantic abstraction**. By decoupling the *definition* of a shape (e.g., 12dp rounded) from its *application* (e.g., a card), the system abstracts raw geometric values behind semantic tokens (Medium Component). This mirrors CSS variables or constants in programming.

### SE Lens
The design principle here is **Single Source of Truth (SSoT)**. The alternative not chosen is specifying shape attributes directly on views or even via custom view styles for every widget type. The tradeoff is reduced granularity: if you want one specific button to have 0dp corners while all other buttons have 8dp, you must break the abstraction for that one view, but you gain massive velocity for the 99% of components that align with the brand.

### Run It Yourself
No code to run for this conceptual unit.

## Concept Unit: Corner Family and Corner Size

### The Problem
To redefine a shape scale, you need a vocabulary to describe the geometry. You cannot just pass a raw `dp` value to the theme because a corner isn't just a shape scale parameter—it's a distinct shape.

### The New Code
```xml
<item name="cornerFamily">cut</item>
<item name="cornerSize">12dp</item>
```

### The Updated Project
```xml
<!-- res/values/shape.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="ShapeAppearanceOverlay.InventoryApp.MediumComponent" parent="">
        <!-- ← new -->
        <item name="cornerFamily">cut</item>
        <item name="cornerSize">12dp</item>
    </style>
</resources>
```

### Mechanical Walkthrough
- `cornerFamily`: Defines the geometry style (`rounded` or `cut`). Without this, the system defaults to `rounded`, meaning if you want chamfered corners, you must specify `cut`. Cut corners are a real brand signal—they appear in tools, fintech, and productivity apps, communicating precision and structure rather than the approachability of rounded corners.
- `cornerSize`: Defines the magnitude of the corner geometry. For `rounded`, it's the radius. For `cut`, it's the length of the straight chamfer cut. Without this, the geometry has no size and won't render visibly different from a square corner if the default is 0.

### CS Lens
This is **parameterization of graphics**. Instead of requiring developers to write complex `Path` drawing algorithms, MDC provides a declarative API where `Family` determines the drawing algorithm and `Size` provides the input scalar. This is common in 3D modeling and rendering pipelines.

### SE Lens
The principle is **Declarative UI Styling**. The alternative not chosen is writing custom `Drawable` XML files with `<shape>` and `<corners>` tags for every state (pressed, default, disabled) and setting them as backgrounds. The tradeoff is that you are restricted to the geometries MDC supports (`rounded` and `cut`), but you avoid the immense maintenance burden of managing custom background drawables.

### Run It Yourself
No visible change yet, as we haven't wired this into the app theme.

## Concept Unit: Wiring Shapes to the Theme

### The Problem
We know the three shape scales, and we know how to define a shape style. Now we need to create all three definitions and tell our application's master theme to use them instead of the MDC defaults.

### The New Code
```xml
<item name="shapeAppearanceSmallComponent">@style/ShapeAppearanceOverlay.InventoryApp.SmallComponent</item>
<item name="shapeAppearanceMediumComponent">@style/ShapeAppearanceOverlay.InventoryApp.MediumComponent</item>
<item name="shapeAppearanceLargeComponent">@style/ShapeAppearanceOverlay.InventoryApp.LargeComponent</item>
```

### The Updated Project
```xml
<!-- res/values/shape.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- ← new -->
    <style name="ShapeAppearanceOverlay.InventoryApp.SmallComponent" parent="">
        <item name="cornerFamily">rounded</item>
        <item name="cornerSize">4dp</item>
    </style>

    <style name="ShapeAppearanceOverlay.InventoryApp.MediumComponent" parent="">
        <item name="cornerFamily">rounded</item>
        <item name="cornerSize">12dp</item>
    </style>

    <style name="ShapeAppearanceOverlay.InventoryApp.LargeComponent" parent="">
        <item name="cornerFamily">rounded</item>
        <item name="cornerSize">24dp</item>
    </style>
</resources>
```

```xml
<!-- res/values/themes.xml -->
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.InventoryApp" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <!-- Primary brand color. -->
        <item name="colorPrimary">@color/purple_500</item>
        
        <!-- Shape scale overrides -->
        <!-- ← new -->
        <item name="shapeAppearanceSmallComponent">@style/ShapeAppearanceOverlay.InventoryApp.SmallComponent</item>
        <item name="shapeAppearanceMediumComponent">@style/ShapeAppearanceOverlay.InventoryApp.MediumComponent</item>
        <item name="shapeAppearanceLargeComponent">@style/ShapeAppearanceOverlay.InventoryApp.LargeComponent</item>
    </style>
</resources>
```

### Mechanical Walkthrough
- `@style/ShapeAppearanceOverlay.InventoryApp.*`: We define three standalone styles in `shape.xml`. Notice they have `parent=""`. They act as overlays, overriding only the specific shape attributes we provide. If we omit them, we have nothing to map our theme against.
- `shapeAppearanceSmallComponent`: We map the theme attribute to our new Small style. Without this mapping in `themes.xml`, `MaterialButton` widgets will continue to use the default MDC small shape (usually 4dp rounded).
- `shapeAppearanceMediumComponent`: Mapped to the Medium style. Without this, `MaterialCardView` ignores our 12dp rounded definition.
- `shapeAppearanceLargeComponent`: Mapped to the Large style. Without this, `BottomSheetDialog` instances will ignore our 24dp rounded definition.

### CS Lens
This is **Dependency Injection at the resource level**. The MDC widgets depend on a shape appearance. Instead of hardcoding the appearance inside the widget class, the widget asks the active Theme for the appearance. By swapping the dependency in the theme, we alter the behavior of all dependent widgets globally.

### SE Lens
The principle is **Global Configuration**. The alternative is defining styles like `@style/Widget.InventoryApp.Button` and `@style/Widget.InventoryApp.Card` and setting the shape overlay on each specific widget style. The tradeoff is that setting it globally via `shapeAppearance*` is less work but affects *every* small component (e.g., Chips and TextInputs get the same corners as Buttons). If your design system requires Buttons to be rounded but Chips to be cut, you cannot use the global shape scale and must fall back to widget-specific styles.

### Run It Yourself
1. Build and run the app.
2. Observe a screen with a `MaterialButton` (Small), a `MaterialCardView` (Medium), and open a `BottomSheetDialog` (Large).
3. Confirm that the button corners are 4dp rounded, the card corners are 12dp rounded, and the dialog top corners are 24dp rounded.

## Connect the Pieces
When you run the app, the Android framework inflates your XML layouts. When it encounters a `<com.google.android.material.card.MaterialCardView>`, the MDC View constructor reads your app's theme (`Theme.InventoryApp`). It inherently knows it is a "Medium Component". It looks for the `shapeAppearanceMediumComponent` attribute in your theme, finds `@style/ShapeAppearanceOverlay.InventoryApp.MediumComponent`, and reads `<item name="cornerSize">12dp</item>`. The view then configures its internal drawing bounds to clip its background and children to a 12dp rounded rectangle. All of this happens automatically because we populated the correct theme attributes.

## What Breaks Without This
If you misspell `cornerSize` or use an invalid attribute, the shapes will fail to render correctly. Let's break the mapping.
1. Open `themes.xml`.
2. Change `<item name="shapeAppearanceMediumComponent">` to `<item name="shapeAppearanceMedium">`.
3. Run the app.
4. Observe that your `MaterialCardView` corners revert to the MDC default, ignoring your 12dp definition, because the framework looks specifically for `shapeAppearanceMediumComponent`.
5. Restore the attribute name to `shapeAppearanceMediumComponent`.

## Exercises
1. Change the `cornerFamily` of the `SmallComponent` style to `cut` and run the app. Observe how all buttons and chips instantly adopt chamfered edges.
2. Change the `cornerSize` of the `MediumComponent` style to `32dp`. Run the app and observe the cards.
3. Try setting the top-left and bottom-right corners differently by using `cornerSizeTopLeft` and `cornerSizeBottomRight` in your `MediumComponent` style.

## Definition of Done
- `res/values/shape.xml` exists and defines three `ShapeAppearanceOverlay` styles.
- `res/values/themes.xml` maps the three `shapeAppearance*` attributes to your custom styles.
- The app compiles and all MDC widgets visually reflect the newly defined corner radii.
- **Commit:** `git commit -m "Centralize shape geometry via MDC shape scales in theme"` *because defining geometry at the theme level ensures cross-component consistency and allows single-point updates for brand changes.*
