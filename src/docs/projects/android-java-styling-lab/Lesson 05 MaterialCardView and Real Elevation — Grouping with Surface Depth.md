# Lesson 05: MaterialCardView and Real Elevation — Grouping with Surface Depth

**What you will build**
You will replace the flat `LinearLayout` or `ConstraintLayout` roots of your existing inventory list rows with `MaterialCardView`. By applying real elevation, theme-aware corner radii, and proper internal padding, you will create visually distinct, grouped items that float above the background. The transferable problem here is visual hierarchy: using physical depth and spacing to teach the user that a collection of text views and icons belongs together as a single interactive unit.

**What you need to know first**
- You understand how `RecyclerView`, adapters, and `ViewHolder` connect XML item layouts to data (from `android-ui-foundations` Lessons 26–27).
- You know how to define `colorSurface` and margin-based grouping (from `android-ui-foundations` Lesson 34).
- You are familiar with the basic MDC theme structure and shape system introduced in Lessons 01–04 of this series.

**Terms introduced in this lesson**
- **Elevation** — a dimensional property (measured in dp) that dictates how far above the base surface a view sits. *Why it exists: It generates a real-time, physical drop shadow that changes based on the lighting angle, providing immediate, natural cues about hierarchy and interactability without hardcoded colors.*
- **TranslationZ** — a runtime dimensional offset added on top of a view's base elevation. *Why it exists: It allows views to animate upward (e.g., when pressed or dragged) without permanently changing their base architectural elevation layer.*
- **Content Padding** — padding applied inside a CardView specifically using CardView attributes rather than standard view padding. *Why it exists: It ensures the content does not overlap with the card's rounded corners or shadow calculations, keeping the internal layout safe from the card's physical geometry.*

**Objects and methods used**
- `com.google.android.material.card.MaterialCardView`
  - *What it is:* The Material Design implementation of a card layout.
  - *Implementation:* Used as the root ViewGroup in an XML layout file.
  - *Its use:* Provides a bounded, elevated, and styled surface for grouping related content, automatically reading shape and color from the app theme.
- `app:cardElevation`
  - *What it is:* An XML attribute defining the base elevation of the card.
  - *Implementation:* Applied directly to the `MaterialCardView` tag in XML.
  - *Its use:* Lifts the card off the surface, creating a drop shadow to indicate it is a distinct, floating element.
- `app:contentPadding`
  - *What it is:* An XML attribute for defining inner spacing in a card.
  - *Implementation:* Applied to the `MaterialCardView` tag (with variations like `app:contentPaddingLeft`).
  - *Its use:* Pushes the card's child views away from the card's edges so they don't clip into the rounded corners.
- `android:clipToPadding="false"`
  - *What it is:* A boolean ViewGroup attribute.
  - *Implementation:* Applied to the `RecyclerView` in XML.
  - *Its use:* Allows children (and their shadows) to draw in the padded areas of the RecyclerView, preventing shadows from being abruptly cut off at the edge of the list.

---

## Concept Unit: How View Elevation Works

### The Problem
When you want to show that an item is interactive or layered above the background, a flat border or background color change isn't always enough. You need it to look physical. In some UI frameworks, "elevation" is faked by drawing a gray rectangle behind the view. If you change to a dark theme, that hardcoded gray shadow looks terrible or disappears. We need a system that calculates real shadows based on lighting, shape, and depth, regardless of the theme.

### The New Code

```xml
<View
    android:layout_width="100dp"
    android:layout_height="100dp"
    android:background="?attr/colorSurface"
    android:elevation="2dp" />
```

This specifies a base elevation. When pressed, you might animate `translationZ` in Java:

```java
myView.setTranslationZ(4f); // lifts the view an additional 4 pixels during a press
```

### The Updated Project

```xml
<!-- In a test layout or item layout -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="16dp">

    <!-- ← new -->
    <View
        android:layout_width="100dp"
        android:layout_height="100dp"
        android:layout_marginEnd="16dp"
        android:background="?attr/colorSurface"
        android:elevation="0dp" />

    <!-- ← new -->
    <View
        android:layout_width="100dp"
        android:layout_height="100dp"
        android:layout_marginEnd="16dp"
        android:background="?attr/colorSurface"
        android:elevation="2dp" />
        
    <!-- ← new -->
    <View
        android:layout_width="100dp"
        android:layout_height="100dp"
        android:background="?attr/colorSurface"
        android:elevation="8dp" />

</LinearLayout>
```

### Mechanical Walkthrough
- `android:elevation` — establishes the physical distance between the view and its parent surface on the Z-axis. Without this, the view sits flat at 0dp and generates no shadow. The system uses this value to cast a real shadow.
- `translationZ` — is a dynamic, runtime offset. Without it, animating a button press would require changing the base `elevation` property, which breaks the architectural definition of the view's resting state.

### CS Lens
This is an application of **3D rendering pipelines** in a 2D interface. The Android UI toolkit literally contains a directional light source and an ambient light source. It calculates the shadow geometry based on the view's outline, elevation, and the light sources, much like a 3D game engine rendering shadows for objects, rather than just blitting a static texture.

### SE Lens
The design principle here is **Separation of state and architecture**. We keep `elevation` for the permanent resting height of the component, and `translationZ` for temporary interaction states (like being dragged or pressed). If we overloaded a single `elevation` variable for both, resetting the view after a drag would require the code to remember what the original elevation was supposed to be. By splitting them, we just set `translationZ` back to 0.

### Run It Yourself
Add the three views to your `activity_main.xml` temporarily and run the app. You will see three squares: one flat, one slightly raised, and one noticeably floating. Switch your device to Dark Mode; notice how the shadows are still present and correctly calculated, rather than looking like graphical glitches.

---

## Concept Unit: MaterialCardView vs Plain CardView

### The Problem
Android provides a standard `androidx.cardview.widget.CardView`. However, when you use it, you have to manually define its corner radius and background color in every XML file. If you update your app's theme to use sharper corners (changing the `shapeAppearanceMediumComponent`), the plain `CardView` will ignore it and remain rounded. We need a card component that natively listens to the Material theme.

### The New Code

```xml
<com.google.android.material.card.MaterialCardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content">
    <!-- content -->
</com.google.android.material.card.MaterialCardView>
```

Contrast this with the old way (do not use this):

```xml
<androidx.cardview.widget.CardView
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:cardCornerRadius="8dp"> <!-- hardcoded, ignores theme -->
</androidx.cardview.widget.CardView>
```

### The Updated Project

Replace the root of `item_inventory.xml`.

```xml
<!-- item_inventory.xml -->
<!-- ← new -->
<com.google.android.material.card.MaterialCardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content">
        
        <TextView
            android:id="@+id/itemName"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Inventory Item"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintStart_toStartOf="parent"/>
            
    </androidx.constraintlayout.widget.ConstraintLayout>
</com.google.android.material.card.MaterialCardView>
```

### Mechanical Walkthrough
- `com.google.android.material.card.MaterialCardView` — the MDC specific view class. Without this specific class, you fall back to the AndroidX `CardView` which does not read `colorSurface` or shape themes automatically, leading to inconsistent UI when themes change.

### CS Lens
This illustrates **Inversion of Control** in styling. The component (`MaterialCardView`) does not dictate its own look; instead, it delegates its styling decisions (color, shape) to a central configuration (the Theme). This makes the component highly reusable across completely different branded applications.

### SE Lens
The tradeoff here is **Dependency weight vs Maintainability**. Including the entire Material Components library adds weight to your APK just to get a theme-aware card. The alternative (using `androidx.cardview` and custom styles) saves space but requires immense manual upkeep. For enterprise apps, maintainability almost always wins.

### Run It Yourself
Change your `shapeAppearanceMediumComponent` in `themes.xml` to have a `cornerSize` of `0dp` (square corners). Run the app. Notice that the `MaterialCardView` becomes instantly square without you touching `item_inventory.xml`.

---

## Concept Unit: Converting the Row Layout and Internal Padding

### The Problem
Now that we have a `MaterialCardView`, the content inside it is squished directly against the edges. Normally, you use `android:padding` on a layout to push children inward. However, CardView does complex calculations for its corners and shadow boundaries. If you use standard `android:padding`, the child views might bleed over the rounded corners or interfere with the bounds.

### The New Code

```xml
app:contentPadding="16dp"
app:cardElevation="2dp"
app:strokeWidth="1dp"
```

### The Updated Project

Update the root `MaterialCardView` in `item_inventory.xml`.

```xml
<!-- item_inventory.xml -->
<com.google.android.material.card.MaterialCardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:cardElevation="2dp"
    app:strokeWidth="1dp"
    app:strokeColor="?attr/colorOutline"
    app:contentPadding="16dp"> <!-- ← new -->

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content">
        
        <TextView
            android:id="@+id/itemName"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Inventory Item"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintStart_toStartOf="parent"/>
            
    </androidx.constraintlayout.widget.ConstraintLayout>
</com.google.android.material.card.MaterialCardView>
```

### Mechanical Walkthrough
- `app:contentPadding` — specifically instructs the CardView to inset its content area safely away from the rounded corners. Without this (and using `android:padding` instead), content can sometimes clip awkwardly over the card's curved edges on older Android versions.
- `app:cardElevation` — sets the resting elevation. Without it, the card sits flat.
- `app:strokeWidth` and `app:strokeColor` — draws a thin border. Without this, a low-elevation card on a similar-colored background (like white-on-white) loses its defined edge, making the UI look mushy.

### CS Lens
This is a **Bounding Box** problem. The card has an outer bounding box (including the shadow) and an inner bounding box (the safe area for content). `contentPadding` explicitly calculates the safe inner rectangle by subtracting the corner radii and required shadow padding from the outer dimensions.

### SE Lens
We choose to use `app:contentPadding` on the parent rather than `android:layout_margin` on all the child views. Adding margins to every child is tedious and error-prone (you might forget one). Setting padding on the parent guarantees the constraint is enforced universally for all children, reducing human error.

### Run It Yourself
Run the app. Observe that the text in the row is now neatly indented from the card edge, and a faint border combined with a shadow cleanly separates the card from the background.

---

## Concept Unit: List Spacing Without Clipping Shadows

### The Problem
You have elevated cards, but in a `RecyclerView`, they are stacked directly on top of each other. Furthermore, if you add padding to the top or bottom of the `RecyclerView` to give the list breathing room, the cards' shadows will be abruptly chopped off (clipped) when they scroll into that padded area.

### The New Code

```xml
<!-- In item layout -->
android:layout_marginBottom="8dp"

<!-- In activity layout -->
android:clipToPadding="false"
android:paddingTop="16dp"
android:paddingBottom="16dp"
```

### The Updated Project

First, add margin to the bottom of the card in `item_inventory.xml`:

```xml
<!-- item_inventory.xml -->
<com.google.android.material.card.MaterialCardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginBottom="8dp" <!-- ← new -->
    app:cardElevation="2dp"
    app:contentPadding="16dp">
    <!-- ... -->
</com.google.android.material.card.MaterialCardView>
```

Next, update the `RecyclerView` in your main layout (e.g., `activity_main.xml`):

```xml
<!-- activity_main.xml -->
<androidx.recyclerview.widget.RecyclerView
    android:id="@+id/inventoryList"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:paddingTop="16dp" <!-- ← new -->
    android:paddingBottom="16dp" <!-- ← new -->
    android:clipToPadding="false" /> <!-- ← new -->
```

### Mechanical Walkthrough
- `android:layout_marginBottom="8dp"` on the card — pushes the next item in the list down, creating a physical gap between cards. Without this, cards touch edges, blurring the distinction between individual list items.
- `android:paddingTop/Bottom` on the RecyclerView — creates space at the very top and bottom of the scrolling list. Without this, the first item slams into the top of the screen.
- `android:clipToPadding="false"` — tells the ViewGroup to allow children to draw themselves (and their shadows) inside the padded area during a scroll. Without this, a shadow entering the 16dp padded zone is rendered invisible, creating a harsh, ugly straight line where the shadow suddenly disappears.

### CS Lens
This deals with **View Clipping and Render Bounds**. By default, UI frameworks optimize rendering by strictly clipping (cutting off) any drawing operations that fall outside a view's defined content bounds (excluding padding). Setting `clipToPadding="false"` disables this specific optimization, allowing the render pipeline to draw the shadow pixels even in the padded margins.

### SE Lens
We apply margin to the bottom of the item, not top and bottom. If we applied 4dp to top and bottom, the gap between items is 8dp, but the gap at the top of the list is only 4dp. By applying 8dp only to the bottom, the math remains consistent. We then control the top of the entire list using the RecyclerView's padding. This avoids "margin collapse" math issues common in UI layout.

### Run It Yourself
Run the app and scroll the list. Notice the clean gaps between the cards. Scroll a card slowly to the top of the screen; observe how its shadow remains fully intact and visible even as it enters the 16dp top padding zone of the RecyclerView.

---

## Connect the Pieces
In this lesson, you transformed a flat, uninspired list into a dimensional interface. You wrapped your data rows in `MaterialCardView`, utilizing its theme-aware shape and color properties. You lifted them off the background using `app:cardElevation` to cast real-time shadows, and safely spaced the internal text using `app:contentPadding`. Finally, you managed the relationship between these new 3D objects by adding `marginBottom` for inter-item spacing, and instructed the `RecyclerView` to respect those shadows during scrolling via `clipToPadding="false"`. The visual hierarchy is now clear: items are grouped, distinct, and physical.

## What Breaks Without This
Remove `android:clipToPadding="false"` from your `RecyclerView`.
Run the app and slowly scroll the list so that the top card begins to move off-screen.
**The Result:** As the card enters the 16dp `paddingTop` region, its drop shadow instantly disappears along a perfectly horizontal invisible line. It looks like a graphical glitch.
**Restore it:** Add `android:clipToPadding="false"` back so the system knows it's allowed to render shadows in that padded area.

## Exercises
1. Change the `app:cardElevation` of your `MaterialCardView` to `12dp`. Run the app. Notice how much further away the card appears, and how the shadow spreads out and softens. Change it back to `2dp`.
2. Add `android:layout_marginHorizontal="16dp"` to the `MaterialCardView` in your item layout. Run the app. The cards are no longer full-width; they float in the center of the screen with space on the left and right, creating a distinct "card list" aesthetic rather than a flat table.

## Definition of Done
- `item_inventory.xml` root is a `MaterialCardView` with elevation and content padding.
- Items have `marginBottom` for spacing.
- The `RecyclerView` has top/bottom padding and `clipToPadding="false"`.
- You have committed these changes to version control with the message: "Wrap inventory rows in MaterialCardView for physical grouping, and fix RecyclerView shadow clipping so items scroll cleanly."
