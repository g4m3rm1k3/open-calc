# Lesson 01: The MDC Theme System — What the Design System Actually Is for Views

**What you will build**
You will open your existing `themes.xml` and `colors.xml` and, for the first time, read the full list of Material Design Components (MDC) named theme attributes using Android Studio's Theme Editor. You won't fundamentally alter the app's appearance yet; instead, you will add placeholder comments to `themes.xml` marking the color, type appearance, and shape appearance categories that later lessons will fill in. The transferable problem here is discovering the system: understanding what slots exist before you fill them is what separates intentional styling from accidentally-accepted defaults.

**What you need to know first**
- You must have completed the `android-ui-foundations` series, specifically Lesson 34 (which covers `themes.xml`, `colors.xml`, `colorPrimary`, `colorAccent`, and style inheritance via `parent=`). 

**Terms introduced in this lesson**
- **Material Design Components (MDC)** — A comprehensive library of real `View` subclasses (`MaterialButton`, `MaterialCardView`, `TextInputLayout`, etc.) that implement Google's Material Design specification. *Why it exists:* It prevents developers from having to build and manually style complex interactive elements from scratch, ensuring standard components automatically respond to a centralized theme.
- **Theme Attribute** — A variable name within the Android styling system (like `?attr/colorPrimary` or `?attr/textAppearanceBodyLarge`) whose specific value is resolved at runtime based on the active theme. *Why it exists:* It provides a layer of indirection so that a UI element can simply ask for "the primary color" without knowing what that color is, allowing the entire app to change its look by swapping a single variable.

**Objects and methods used**
- `MaterialButton`
  - *What it is:* A specialized `View` subclass provided by the MDC library.
  - *Implementation:* Extends `androidx.appcompat.widget.AppCompatButton` and automatically wires itself to read Material Design theme attributes.
  - *Its use:* Used as the standard button in Material apps; it inherently knows to color its background using `?attr/colorPrimary` and its text using `?attr/colorOnPrimary` without needing explicit XML attributes on the button itself.
- `Theme.MaterialComponents.DayNight.NoActionBar`
  - *What it is:* The base theme style that provides Material Design defaults.
  - *Implementation:* Declared in XML using the `parent` attribute inside a `<style>` tag.
  - *Its use:* Establishes the core MDC styling rules across the entire application, serving as the default dictionary that defines what `colorPrimary` and dozens of other attributes resolve to if you don't override them.

---

## Concept Unit: What MDC Actually Is

### The Problem
When you apply a theme in Android, it might feel like magic formatting being sprinkled over your XML layouts. But MDC is not just a stylesheet. It is a library of actual Java classes—like `MaterialButton`—that are hardcoded to look for specific variables in your theme. If you change a theme variable, the `View` reads the new value and redraws itself. We need to prove this connection exists.

### The New Code
```xml
        <!-- Primary brand color. -->
        <item name="colorPrimary">#FF5722</item> <!-- Deep Orange -->
```

Notice that we are not touching any layout XML files, just the global theme.

### The Updated Project
```xml
<!-- res/values/themes.xml -->
<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Base application theme. -->
    <style name="Theme.InventoryApp" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <!-- Primary brand color. -->
        <item name="colorPrimary">#FF5722</item> <!-- ← new -->
        <item name="colorPrimaryDark">@color/purple_700</item>
        <item name="colorAccent">@color/teal_200</item>
    </style>
</resources>
```

When you update this, MDC components recalculate their appearance automatically.

### Mechanical Walkthrough
- `<item name="colorPrimary">#FF5722</item>`: Overrides the default purple color with a deep orange. *Why we do this:* By changing this one attribute, every `MaterialButton` in the app will change its background color because the `MaterialButton` class internally calls `getColor(R.attr.colorPrimary)` to paint itself. Without this override, the button would simply fall back to the purple defined in the parent MDC theme, hiding the mechanical reality that the button is actively querying the theme.

### CS Lens
This is the **Dependency Injection** principle applied to UI. The button does not hardcode its color; it expects the environment (the theme) to provide a dependency named `colorPrimary`. This inversion of control means the component is completely decoupled from the specific branding of the application.

### SE Lens
The design principle here is **Single Source of Truth**. The alternative would be setting `android:backgroundTint="@color/orange"` on every single button in your layouts. That approach fails at scale because rebranding would require a find-and-replace across dozens of layout files, risking missed buttons and inconsistent UI. Centralizing the variable in `themes.xml` ensures guaranteed consistency with a single point of failure.

### Run It Yourself
Run the app on your emulator. Navigate to any screen with a standard button. Observe that the button is now Deep Orange, confirming that `MaterialButton` is actively reading `colorPrimary` from your theme, even though you didn't write any code on the button itself.

---

## Concept Unit: The Three Attribute Categories

### The Problem
MDC themes consist of dozens of attributes, but they aren't completely random. To effectively build a design system, you need to know that these attributes are rigorously categorized into three structural pillars: Color, Typography, and Shape. We need to explicitly carve out space for these pillars in our theme file so we understand the shape of the system.

### The New Code
```xml
        <!-- ============================== -->
        <!-- COLOR ATTRIBUTES               -->
        <!-- e.g., colorPrimary, colorSurface -->
        <!-- ============================== -->

        <!-- ============================== -->
        <!-- TYPE APPEARANCE ATTRIBUTES     -->
        <!-- e.g., textAppearanceBodyLarge  -->
        <!-- ============================== -->

        <!-- ============================== -->
        <!-- SHAPE APPEARANCE ATTRIBUTES    -->
        <!-- e.g., shapeAppearanceSmallComponent -->
        <!-- ============================== -->
```

These comments serve as a skeleton for our future design system.

### The Updated Project
```xml
<!-- res/values/themes.xml -->
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.InventoryApp" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        
        <!-- ============================== --> <!-- ← new -->
        <!-- COLOR ATTRIBUTES               --> <!-- ← new -->
        <!-- e.g., colorPrimary, colorSurface --> <!-- ← new -->
        <!-- ============================== --> <!-- ← new -->
        <item name="colorPrimary">#FF5722</item>
        <item name="colorPrimaryDark">@color/purple_700</item>
        <item name="colorAccent">@color/teal_200</item>

        <!-- ============================== --> <!-- ← new -->
        <!-- TYPE APPEARANCE ATTRIBUTES     --> <!-- ← new -->
        <!-- e.g., textAppearanceBodyLarge  --> <!-- ← new -->
        <!-- ============================== --> <!-- ← new -->

        <!-- ============================== --> <!-- ← new -->
        <!-- SHAPE APPEARANCE ATTRIBUTES    --> <!-- ← new -->
        <!-- e.g., shapeAppearanceSmallComponent --> <!-- ← new -->
        <!-- ============================== --> <!-- ← new -->
        
    </style>
</resources>
```

By adding these sections, we establish that a theme does more than just hold colors.

### Mechanical Walkthrough
- `<!-- COLOR ATTRIBUTES -->`: Marks where attributes starting with `color` will go. *Why we do this:* It isolates the palette variables. Without organizing them, it's easy to confuse semantic colors (like `colorError`) with direct color references (like `@color/red_500`), breaking the design system abstraction.
- `<!-- TYPE APPEARANCE ATTRIBUTES -->`: Marks where attributes starting with `textAppearance` will go. *Why we do this:* It clarifies that MDC typography attributes do not map to raw font sizes (like `16sp`); they map to entire `TextAppearance.*` styles that contain size, weight, and tracking. Without this, developers often try to assign raw dimensions to these attributes, causing compile errors.
- `<!-- SHAPE APPEARANCE ATTRIBUTES -->`: Marks where attributes starting with `shapeAppearance` will go. *Why we do this:* It sets up the concept that the corner rounding of components (like cards or buttons) is centrally managed. Without this, developers will manually create custom XML drawables for rounded corners, ignoring the built-in shape engine entirely.

### CS Lens
This is an example of **Taxonomy** and **Namespace Grouping**. By prefixing attributes with `color`, `textAppearance`, and `shapeAppearance`, MDC creates a predictable naming convention. Predictable namespaces allow developers to search and discover the API surface area without memorizing every individual variable name.

### SE Lens
The design principle is **Mental Models over Ad-hoc Organization**. The alternative is appending new overrides to the bottom of the XML file as you discover them. Doing so turns `themes.xml` into a dumping ground. Structuring the file according to MDC's internal categories forces future developers to adhere to the design system's intended architecture when adding overrides.

### Run It Yourself
Run the app. There will be no visual change, but your `themes.xml` is now architecturally prepared to act as a complete design system rather than a simple color palette.

---

## Concept Unit: Reading the Full Attribute List in Android Studio

### The Problem
Your `themes.xml` currently defines only 3 overrides, but the MDC theme system relies on dozens of attributes to style your app. You need to see the invisible attributes that your app is inheriting from `Theme.MaterialComponents.DayNight.NoActionBar` to understand what you actually have control over.

### The New Code
```xml
        <!-- Inspected via Theme Editor: Over 30 inherited attributes active -->
```

This comment serves as a permanent reminder that the file you see is not the full system.

### The Updated Project
```xml
<!-- res/values/themes.xml -->
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.InventoryApp" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        
        <!-- Inspected via Theme Editor: Over 30 inherited attributes active --> <!-- ← new -->
        
        <!-- ============================== -->
        <!-- COLOR ATTRIBUTES               -->
...
```

The true scope of the theme is hidden in the parent class until you use tooling to inspect it.

### Mechanical Walkthrough
- `<!-- Inspected via Theme Editor... -->`: A breadcrumb acknowledging the tooling step. *Why we do this:* In Android Studio, navigating to **Tools → Theme Editor** (or looking at the merged manifest/resources) reveals the full computed theme. Without acknowledging the tooling, developers assume the three items in `themes.xml` represent the entirety of their application's visual styling, leading to confusion when `MaterialCardView` renders with a default elevation they can't find in their code.

### CS Lens
This illustrates **Inheritance and the Prototype Chain**. Your `Theme.InventoryApp` is just the tip of the iceberg. When an MDC View asks for an attribute, the system checks your theme first. If it's missing, it travels up the `parent=` chain to `Theme.MaterialComponents`, querying the prototype until it finds a default value. 

### SE Lens
The design principle is **Convention over Configuration**. The alternative is forcing developers to define all 30+ attributes in every new project before the app will compile. By providing a deep inheritance chain of sensible defaults, MDC allows developers to override only the specific attributes they care about, drastically reducing boilerplate code.

### Run It Yourself
In Android Studio, click **Tools** → **Theme Editor** (or simply Ctrl+Click / Cmd+Click on `Theme.MaterialComponents.DayNight.NoActionBar` in your code). Scroll through the vast list of attributes that are currently providing the default colors, text sizes, and shapes for your app. 

---

## Connect the Pieces
In `android-ui-foundations`, you learned how to apply basic colors to a theme. In this lesson, you uncovered the mechanism behind those colors: MDC provides intelligent Views like `MaterialButton` that actively read from your theme. You categorized your `themes.xml` into Color, Typography, and Shape pillars, and you used Android Studio's tooling to reveal the hidden, inherited defaults. You now know that `themes.xml` is not just a config file; it is the central brain of a comprehensive design system.

## What Breaks Without This
If you don't understand the scope of the MDC theme system, you will fight the framework. 
1. Open any layout file containing a standard `<Button>`.
2. Add `android:backgroundTint="@color/teal_200"` directly to the XML tag.
3. Run the app. The button turns teal.
4. Now, update `colorPrimary` in `themes.xml` to a new color. 
5. Run the app again. The button remains teal. 

By hardcoding the tint on the button itself, you have severed the component from the design system. It no longer listens to the central theme. Remove the `android:backgroundTint` attribute to restore the button's connection to MDC.

## Exercises
1. Using the Theme Editor or by Ctrl+Clicking the parent theme, find the name of the attribute responsible for the text color drawn on top of the primary color (Hint: it starts with `colorOn...`).
2. Add a new `<item>` in the Color Attributes section of your `themes.xml` to override that text color to black (`#000000`). Run the app and observe the text on your buttons.
3. Look at the Type Appearance section. Attempt to guess the name of the attribute that controls the style of standard headline text in MDC. Write it down, then verify it in the Theme Editor.

## Definition of Done
- Your `themes.xml` explicitly groups attributes using comments for Color, Typography, and Shape.
- You have verified that changing `colorPrimary` updates MDC components automatically.
- You have inspected the parent theme to see the inherited defaults.
- You have committed your code with the message: `docs: outline MDC theme attribute categories in themes.xml`. *Why:* This documents that the theme is being deliberately structured for a full design system implementation, preparing the ground for future layout decoupling.
