# Lesson 02: Color Roles in XML — Filling in the Full Material Color Scheme

**What you will build**
You will replace a minimal three-attribute color setup with a complete Material Design Components (MDC) color scheme. Instead of just picking hex values, you will define semantic roles (like primary, secondary, surface, and error) and pair them with their corresponding "on" colors to guarantee that text and icons are always readable against their background. The problem this solves is creating an accessible, maintainable color system where updating the branding color does not inadvertently render UI text invisible.

**What you need to know first**
- *android-ui-foundations Lesson 34*: Basics of `themes.xml`, `colors.xml`, `colorPrimary`/`colorAccent`, style inheritance via `parent=`, and margin-based visual grouping.
- *android-java-styling-lab Lesson 01*: Setting up the base MDC theme and migrating from AppCompat to MaterialComponents.

**Terms introduced in this lesson**
- **Semantic color roles** — A color system where colors are named for their *purpose* (like `primary` or `surface`) rather than their literal hue (like `blue` or `white`). *Why it exists*: It decouples the visual branding from the structural layout, allowing the entire app to change themes (like light/dark mode) without altering layout files.
- **The "on" convention** — A set of colors (like `colorOnPrimary`) specifically designed to be drawn on top of a base color role (like `colorPrimary`). *Why it exists*: It creates a programmatic contract guaranteeing sufficient contrast for text and icons against changing background colors.
- **WCAG AA Contrast** — A Web Content Accessibility Guidelines standard requiring a minimum luminance contrast ratio of 4.5:1 for normal text and 3.0:1 for large text. *Why it exists*: It ensures visually impaired users, or users in bright sunlight, can still read the UI, turning contrast from a subjective preference into a testable threshold.

**Objects and methods used**
- `colorPrimary`
  - *What it is:* A theme attribute defining the app's primary branding color, used for key components like the app bar and prominent buttons.
  - *Implementation:* `<item name="colorPrimary">@color/blue_800</item>` in `themes.xml`.
  - *Its use:* Establishes the dominant visual identity of the application.
- `colorOnPrimary`
  - *What it is:* A theme attribute defining the color of text and icons displayed over the primary color.
  - *Implementation:* `<item name="colorOnPrimary">@color/white</item>` in `themes.xml`.
  - *Its use:* Ensures legibility of content drawn over `colorPrimary` surfaces.
- `colorSecondary`
  - *What it is:* A theme attribute for the secondary branding color, used to accent and distinguish floating action buttons or selection controls.
  - *Implementation:* `<item name="colorSecondary">@color/amber_900</item>`.
  - *Its use:* Provides visual distinction for interactive or secondary emphasis elements.
- `colorOnSecondary`
  - *What it is:* A theme attribute for text/icons on top of the secondary color.
  - *Implementation:* `<item name="colorOnSecondary">@color/white</item>`.
  - *Its use:* Guarantees legibility on top of `colorSecondary` elements.
- `colorSurface`
  - *What it is:* A theme attribute defining the background color of component surfaces (like cards, sheets, and menus).
  - *Implementation:* `<item name="colorSurface">@color/grey_50</item>`.
  - *Its use:* Sets the foundational color for discrete UI containers.
- `colorOnSurface`
  - *What it is:* A theme attribute for text and icons drawn directly on surface elements.
  - *Implementation:* `<item name="colorOnSurface">@color/grey_900</item>`.
  - *Its use:* Ensures body text inside cards and dialogs is readable.
- `colorBackground`
  - *What it is:* A theme attribute for the underlying background color of the entire screen/window.
  - *Implementation:* `<item name="colorBackground">@color/grey_50</item>`.
  - *Its use:* Sets the backdrop color behind all surfaces and UI elements.
- `colorOnBackground`
  - *What it is:* A theme attribute for text and icons placed directly on the screen background.
  - *Implementation:* `<item name="colorOnBackground">@color/grey_900</item>`.
  - *Its use:* Ensures text lying directly on the screen (not inside a card) is legible.
- `colorError`
  - *What it is:* A theme attribute signaling an error state, such as invalid text input.
  - *Implementation:* `<item name="colorError">@color/red_700</item>`.
  - *Its use:* Visually alerts the user to failures or destructive actions.
- `colorOnError`
  - *What it is:* A theme attribute for text/icons drawn over the error color.
  - *Implementation:* `<item name="colorOnError">@color/white</item>`.
  - *Its use:* Guarantees the error message text or icon is legible against the error background.
- `colorPrimaryVariant`
  - *What it is:* A theme attribute defining a darker or lighter shade of the primary color.
  - *Implementation:* `<item name="colorPrimaryVariant">@color/blue_900</item>`.
  - *Its use:* Used for system elements like the status bar to create depth alongside the primary color.
- `colorSecondaryVariant`
  - *What it is:* A theme attribute defining a shade variation of the secondary color.
  - *Implementation:* `<item name="colorSecondaryVariant">@color/amber_1000</item>`.
  - *Its use:* Provides contrast for secondary elements when interacting or focused.

---

## Concept Unit: Understanding Color Roles and the "On" Convention

### The Problem
When you assign a hardcoded hex color to a UI element's background, you must also manually assign a text color to ensure it can be read. If your app later supports a dark theme, or the company rebrands, changing that background color might suddenly make the text invisible if you forget to update the text color attribute in every XML file. We need a system where a background color and its corresponding readable text color are bound together in a contract, so that elements inherently know what color text to draw over themselves.

### The New Code
```xml
<color name="deep_blue">#1565C0</color>
<color name="white">#FFFFFF</color>

<item name="colorPrimary">@color/deep_blue</item>
<item name="colorOnPrimary">@color/white</item>
```

### The Updated Project
`res/values/colors.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <!-- ← new -->
    <color name="deep_blue">#1565C0</color>
</resources>
```

`res/values/themes.xml`:
```xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.InventoryApp" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <!-- ← new -->
        <item name="colorPrimary">@color/deep_blue</item>
        <!-- ← new -->
        <item name="colorOnPrimary">@color/white</item>
        
        <item name="colorSecondary">@color/teal_200</item>
    </style>
</resources>
```

### Mechanical Walkthrough
- `colorPrimary` sets the background color for primary branded elements (like the App Bar and standard Material Buttons). Without this, the system falls back to default purple.
- `colorOnPrimary` explicitly defines the color used for text and icons drawn inside elements colored by `colorPrimary`. Because MDC buttons automatically use `colorOnPrimary` for their text, defining this pair guarantees that if `colorPrimary` changes to a dark navy, the button text remains a legible white, rather than inheriting a default dark text color that would break the UI.

### CS Lens
This is the **Observer Pattern / Data Binding** concept applied to styling. The button does not know its exact color; it is bound to the `colorOnPrimary` reference. When the theme state changes (e.g., from Light to Dark mode), the reference resolves to a different value. By pairing variables logically (`Primary` and `OnPrimary`), the framework enforces a rigid interface constraint—if you override the background, you must override its foreground pair.

### SE Lens
**Semantic Naming vs. Literal Naming**. The alternative is naming colors based on their literal value (`<item name="buttonBackground">@color/blue</item>`). This fails when the dark theme button needs to be grey. By naming the role semantically (`colorPrimary`), the code describes *what the color represents in the app hierarchy*, decoupling the UI components from specific branding constraints.

### Run It Yourself
1. Open your app and navigate to a screen with a primary Material Button.
2. Note that the button is deep blue and the text is white.
3. Temporarily change `colorOnPrimary` in `themes.xml` to `@color/deep_blue`.
4. Build and run.
5. **Result:** The button text will disappear. It is drawing blue text on a blue background. This proves that the MDC button automatically pulls `colorOnPrimary` to style its text. Restore it to `@color/white`.

---

## Concept Unit: Contrast as a Design Constraint

### The Problem
Selecting an "on" color is not just about making the text "look okay" to the developer. Visual acuity varies widely among users, and viewing conditions (like screen glare in sunlight) severely reduce screen readability. We need a mathematical guarantee that the foreground text contrasts enough against its background role to be accessible to all users, conforming to industry standards.

### The New Code
```text
contrast ratio = (L1 + 0.05) / (L2 + 0.05)
```

### The Updated Project
`res/values/colors.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- other colors -->
    <color name="deep_blue">#1565C0</color>
    <color name="white">#FFFFFFFF</color>
    <!-- ← new -->
    <color name="amber_900">#FF6F00</color>
</resources>
```

### Mechanical Walkthrough
- `#1565C0` (deep blue) vs `#FFFFFF` (white): These values are chosen precisely because their calculated luminance contrast ratio is around 6.5:1. Without adhering to the 4.5:1 minimum threshold (WCAG AA), the app would fail accessibility audits, and visually impaired users would be unable to read the labels on primary actions.

### CS Lens
This is an **Objective Validation Metric**. In software, we prefer tests that return a boolean (pass/fail) rather than subjective evaluations. Contrast ratios convert the subjective domain of "design aesthetics" into a hard numeric constraint that can be automatically computed and validated in a CI/CD pipeline.

### SE Lens
**Accessibility as a Core Requirement, Not an Add-on**. The alternative is designing the app's visual identity first and attempting to "fix" readability later. The tradeoff of strictly enforcing WCAG AA is that it restricts your branding color palette. However, the engineering benefit is a vastly expanded user base and compliance with legal accessibility standards, which outweighs the restriction on color choices.

### Run It Yourself
1. Go to a contrast checking website (like contrast-ratio.com).
2. Enter `#1565C0` as the background and `#FFFFFF` as the text.
3. **Result:** The tool will report a ratio of ~6.5:1, passing WCAG AA.
4. Now test `#1565C0` against `#FF6F00` (amber). Notice it fails the text contrast requirement.

---

## Concept Unit: Building the Complete Color Scheme

### The Problem
The app has more than just a primary color. It has backgrounds, floating cards, secondary interactions, and error states. If we leave these undefined, the app will inherit Android's default palette, resulting in a fractured visual experience where some elements clash with our branding. We must explicitly define the complete matrix of semantic color roles to fully control the UI.

### The New Code
```xml
<item name="colorSurface">@color/near_white_surface</item>
<item name="colorOnSurface">@color/dark_grey</item>
```

### The Updated Project
`res/values/colors.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="deep_blue">#1565C0</color>
    <color name="white">#FFFFFFFF</color>
    <!-- ← new -->
    <color name="amber_900">#FF6F00</color>
    <!-- ← new -->
    <color name="near_white_surface">#FAFAFA</color>
    <!-- ← new -->
    <color name="near_white_bg">#FFFBFE</color>
    <!-- ← new -->
    <color name="dark_grey">#1C1B1F</color>
    <!-- ← new -->
    <color name="red_error">#B3261E</color>
    <!-- ← new -->
    <color name="darker_blue">#0D47A1</color>
    <!-- ← new -->
    <color name="darker_amber">#E65100</color>
</resources>
```

`res/values/themes.xml`:
```xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.InventoryApp" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">@color/deep_blue</item>
        <!-- ← new -->
        <item name="colorPrimaryVariant">@color/darker_blue</item>
        <item name="colorOnPrimary">@color/white</item>
        
        <!-- ← new -->
        <item name="colorSecondary">@color/amber_900</item>
        <!-- ← new -->
        <item name="colorSecondaryVariant">@color/darker_amber</item>
        <!-- ← new -->
        <item name="colorOnSecondary">@color/white</item>
        
        <!-- ← new -->
        <item name="colorSurface">@color/near_white_surface</item>
        <!-- ← new -->
        <item name="colorOnSurface">@color/dark_grey</item>
        
        <!-- ← new -->
        <item name="colorBackground">@color/near_white_bg</item>
        <!-- ← new -->
        <item name="colorOnBackground">@color/dark_grey</item>
        
        <!-- ← new -->
        <item name="colorError">@color/red_error</item>
        <!-- ← new -->
        <item name="colorOnError">@color/white</item>
    </style>
</resources>
```

### Mechanical Walkthrough
- `colorSurface` / `colorOnSurface` sets the backgrounds for discrete containers like MaterialCards. Because we define `colorOnSurface` as dark grey, text placed inside a card will be dark, readable, and consistent, overriding default text colors without this explicit declaration.
- `colorBackground` / `colorOnBackground` applies to the root layout of the Activity. Distinguishing background from surface allows designers to use subtle shading differences to visually elevate cards off the background.
- `colorError` / `colorOnError` binds the red warning color to white text. When a TextInputLayout goes into an error state, it will automatically pull `colorError` for its border and text hints, standardizing error reporting across the app so it is immediately recognizable.
- `colorPrimaryVariant` / `colorSecondaryVariant` provide darker alternatives. For example, the Android system draws the top status bar using `colorPrimaryVariant`. Without it, the app bar and status bar merge into a flat block of color lacking depth.

### CS Lens
This is a **Complete State Matrix**. Just as a finite state machine must define transitions for all possible inputs, a robust styling architecture must define values for all semantic roles expected by the framework. Incomplete implementations result in undefined behavior (falling back to OS defaults that vary by manufacturer).

### SE Lens
**Configuration over Hardcoding**. By fully populating `themes.xml`, we configure the application's entire visual ruleset in one file. The tradeoff is upfront verbosity in the XML setup. The benefit is that developers building new screens never have to make color decisions; they use MDC components, which automatically read from this central configuration matrix.

### Run It Yourself
1. Build and run the app.
2. Navigate across the three main screens.
3. Observe the status bar is now a darker blue than the app bar (`colorPrimaryVariant`), and floating action buttons or switches (if any) are now amber (`colorSecondary`).
4. **Result:** The app looks like a cohesive, custom-branded product rather than a generic Android template.

---

## Connect the Pieces
In this lesson, we transitioned from picking isolated colors to engineering a complete semantic color matrix. First, we mapped our literal hex values to distinct names in `colors.xml`. Then, in `themes.xml`, we mapped those colors to Material semantic roles: defining the core brand (`colorPrimary`), the accents (`colorSecondary`), the structural backgrounds (`colorSurface`, `colorBackground`), and the alerts (`colorError`). Crucially, we enforced the contract of the "on" convention by defining `colorOnPrimary`, `colorOnSecondary`, etc., ensuring that every background color is permanently tethered to a WCAG AA compliant text color.

## What Breaks Without This
If you map `colorPrimary` but ignore its `onPrimary` pair, your application is structurally fragile.
1. In `themes.xml`, comment out `<item name="colorOnPrimary">@color/white</item>`.
2. Assume the default system text color in dark mode is white. It looks fine.
3. Now, switch the device to Light Theme (where the default text color is dark grey).
4. Run the app. The primary buttons (deep blue) will now draw dark grey text on top of them, failing contrast requirements and becoming unreadable.
5. Restore `<item name="colorOnPrimary">@color/white</item>` to fix it.

## Exercises
1. **The Dark Mode Matrix:** Create a `themes.xml (night)` resource file. Redefine `colorPrimary` to a lighter, desaturated blue, and change `colorOnPrimary` to a very dark grey to maintain contrast. Run the app in dark mode to see the components adapt instantly without touching layout files.
2. **Break the Contrast:** Change `colorOnSecondary` to the exact same color as `colorSecondary`. Find a UI element using the secondary color (like a FloatingActionButton icon) and observe how it vanishes.
3. **Elevate Surfaces:** Change `colorSurface` to a pale yellow while leaving `colorBackground` white. Observe how cards and dialogs stand out from the root Activity background.

## Definition of Done
- [ ] `colors.xml` contains all hex values required for the scheme, separated from the theme logic.
- [ ] `themes.xml` contains all 12 core Material semantic color roles mapped to explicit colors.
- [ ] Every base color role (`primary`, `secondary`, `surface`, `background`, `error`) has a defined `on` color pair.
- [ ] You have verified via contrast checker that all `color`/`onColor` pairs meet WCAG AA requirements.
- [ ] Commit your changes: `git commit -m "feat(theme): define complete MDC semantic color matrix ensuring WCAG AA contrast"` so that the application has a standardized, accessible styling configuration moving forward.
