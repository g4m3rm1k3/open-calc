# Lesson 06: MaterialToolbar and AppBarLayout — Branding the Top of Every Screen

**What you will build**
You will replace the default action bar on all three screens with a custom `MaterialToolbar` wrapped inside an `AppBarLayout`, coordinated by a `CoordinatorLayout`. This gives every screen a branded header with consistent coloring. You will also wire up navigation icons in Java so that the back arrow on the inventory and notification screens actually closes the current activity and returns to the previous one. This solves the transferable problem of creating a unified, controllable header architecture across an app, moving away from relying on the opaque, system-provided action bar.

**What you need to know first**
You need to understand the Activity lifecycle, basic layout containers, and navigation between screens (from `android-ui-foundations` Lessons 07, 08, and 17). You should also be familiar with using Material Design Components, XML layouts, and View Binding from Lessons 01–05 of this series.

**Terms introduced in this lesson**
- **App Bar** — A design pattern that provides a dedicated space at the top of a screen for branding, navigation, and primary actions. *Why it exists:* It gives users a consistent anchor point to identify where they are and how to get back, preventing them from getting lost in deep navigation hierarchies.
- **Support Action Bar** — A compatibility layer in Android that treats a custom toolbar view as if it were the system's built-in action bar. *Why it exists:* It allows developers to use modern, customizable Material toolbars while still integrating with older Android system behaviors like the options menu and title routing.

**Objects and methods used**
- `androidx.coordinatorlayout.widget.CoordinatorLayout`
  - *What it is:* A super-powered `FrameLayout` designed to coordinate scrolling and positioning behaviors between its child views.
  - *Implementation:* Used as the root element of your screen layout XML.
  - *Its use:* It listens to scroll events from content views (like `NestedScrollView` or `RecyclerView`) and relays those events to the `AppBarLayout`, allowing the toolbar to react (e.g., collapse or hide) when the user scrolls.
- `com.google.android.material.appbar.AppBarLayout`
  - *What it is:* A vertical `LinearLayout` that implements many of the features of Material Design's app bar concept, namely scrolling gestures and elevation.
  - *Implementation:* Placed as a direct child of the `CoordinatorLayout`, containing a `MaterialToolbar`.
  - *Its use:* It acts as a wrapper that interprets the scroll events provided by the `CoordinatorLayout` and applies them to the toolbar inside it.
- `com.google.android.material.appbar.MaterialToolbar`
  - *What it is:* The Material Design implementation of a toolbar, which is a generalized layout for use at the top of an application window.
  - *Implementation:* Placed inside the `AppBarLayout` in XML.
  - *Its use:* It provides the actual visual container for the screen title, navigation icon (like a back button), and action items.
- `setSupportActionBar()`
  - *What it is:* A method in `AppCompatActivity` that sets a given `Toolbar` to act as the `ActionBar` for the Activity window.
  - *Implementation:* Called in `onCreate()` passing the view-bound toolbar instance: `setSupportActionBar(binding.toolbar);`.
  - *Its use:* It wires the custom XML toolbar into the Android system's action bar framework, meaning system features like title handling and menu inflation will automatically target your custom toolbar.
- `getSupportActionBar().setDisplayHomeAsUpEnabled()`
  - *What it is:* A method to enable or disable the "home" navigation affordance, usually a back arrow.
  - *Implementation:* Called after `setSupportActionBar`: `getSupportActionBar().setDisplayHomeAsUpEnabled(true);`.
  - *Its use:* It visually adds the back arrow icon to the start of the toolbar, signaling to the user that they can return to the previous screen.
- `setNavigationOnClickListener()`
  - *What it is:* A listener specifically for the navigation icon (the home/back button) on the toolbar.
  - *Implementation:* Set directly on the toolbar instance: `binding.toolbar.setNavigationOnClickListener(v -> finish());`.
  - *Its use:* It defines exactly what happens when the back arrow is tapped. Without it, the arrow is just a picture that does nothing.

---

## Concept Unit: CoordinatorLayout

### The Problem
If you simply drop a toolbar at the top of a `LinearLayout`, it will sit there statically. Modern mobile apps often have toolbars that react to the content below them—shrinking, hiding, or elevating when the user scrolls the main content. Standard layouts like `ConstraintLayout` or `LinearLayout` don't know how to pass scroll events between sibling views. You need a layout container explicitly built to let its children communicate about their positioning and scrolling state.

### The New Code
```xml
<androidx.coordinatorlayout.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### The Updated Project
*In `activity_login.xml`:*
```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- ← new -->
<androidx.coordinatorlayout.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- Screen content will go here, inside a NestedScrollView -->

</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### Mechanical Walkthrough
- `androidx.coordinatorlayout.widget.CoordinatorLayout` — This is the root tag. It establishes a layout context where child views can be assigned `Behavior` objects. Without this specific root, the `AppBarLayout` we add next will render statically, but its advanced scrolling and collapsing features will never trigger because no parent is listening to or dispatching the necessary scroll events.
- `xmlns:app="http://schemas.android.com/apk/res-auto"` — We import the `app` namespace. Without this, we cannot use custom layout behaviors (like `layout_behavior`) or Material Design attributes on the child views inside this coordinator.

### CS Lens
This is an implementation of the **Mediator pattern**. Instead of the scrolling content view trying to find the toolbar and tell it to move, both views talk to the `CoordinatorLayout`. The `CoordinatorLayout` mediates their interaction based on rules (Behaviors) defined in XML, decoupling the scrolling source from the reacting target. You see this pattern in UI frameworks where complex drag-and-drop or nested scrolling physics require a central referee to calculate positions.

### SE Lens
We choose `CoordinatorLayout` as the root purely for its behavioral coordination capabilities. The alternative is to write complex scroll listeners in Java to manually calculate offsets and translate the toolbar's Y-position every time the user scrolls a pixel. By delegating this to `CoordinatorLayout`, we trade slightly slower layout inflation (it's a heavy container) for a massive reduction in brittle, imperative animation code.

### Run It Yourself
- Replace the root layout in `activity_login.xml` with `CoordinatorLayout`.
- Run the app.
- Notice that the screen is entirely blank (if you removed the previous content). The `CoordinatorLayout` itself has no visual representation; it is purely a structural and behavioral container.

---

## Concept Unit: AppBarLayout and MaterialToolbar

### The Problem
Now that we have a coordinator, we need the actual toolbar. However, the Material Design specification for an "App Bar" includes shadows (elevation) and states (collapsed/expanded) that a standard toolbar view doesn't handle natively. You need a container specifically designed to wrap the toolbar and provide these Material elevation and scrolling physics.

### The New Code
```xml
<com.google.android.material.appbar.AppBarLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:fitsSystemWindows="true">

    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/toolbar"
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        app:layout_scrollFlags="scroll|enterAlways" />

</com.google.android.material.appbar.AppBarLayout>
```

### The Updated Project
*In `activity_login.xml`:*
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- ← new -->
    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:fitsSystemWindows="true">

        <com.google.android.material.appbar.MaterialToolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:layout_scrollFlags="scroll|enterAlways" />

    </com.google.android.material.appbar.AppBarLayout>

</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### Mechanical Walkthrough
- `AppBarLayout` — The container that provides Material elevation and interacts with the `CoordinatorLayout`. Without it, the `MaterialToolbar` would not cast the correct shadow or respond to scroll events.
- `android:fitsSystemWindows="true"` — Tells the `AppBarLayout` to leave padding for the status bar at the top of the screen. Without this, your toolbar might render underneath the system clock and battery icons on some devices.
- `MaterialToolbar` — The actual toolbar view containing the title and icons. Without this inner view, the `AppBarLayout` is just an empty block of color.
- `android:layout_height="?attr/actionBarSize"` — Sets the toolbar height to the system's standard action bar height. Without this, you would have to hardcode a dimension (like `56dp`), which breaks on devices with different accessibility settings or form factors.
- `app:layout_scrollFlags="scroll|enterAlways"` — Configures how the toolbar reacts to scrolling. `scroll` means it will scroll off-screen, and `enterAlways` means it will reappear as soon as the user scrolls up, even if they aren't at the top of the list. We set this now to prepare for scrolling content later; without it, the toolbar remains permanently pinned to the top regardless of scrolling.

### CS Lens
This demonstrates **Composition over Inheritance**. Instead of creating a massive `ScrollingShadowedToolbar` class that inherits from `Toolbar` and adds a hundred new methods, Android provides an `AppBarLayout` container that you *compose* with a standard `MaterialToolbar`. The scrolling and elevation logic lives in the container, while the title and menu logic lives in the toolbar view.

### SE Lens
We could use a basic `androidx.appcompat.widget.Toolbar` instead of `MaterialToolbar`. We explicitly choose `MaterialToolbar` because it natively integrates with the Material Design theming system we've configured (reading colors and typography directly from our theme), ensuring visual consistency without requiring manual styling overrides on every screen.

### Run It Yourself
- Add the `AppBarLayout` and `MaterialToolbar` to your `CoordinatorLayout`.
- Run the app.
- You will see a toolbar at the top of the screen, but it will be empty (no title) and likely a neutral background color. The system action bar might *also* still be visible above it if your theme isn't set to a `NoActionBar` variant.

---

## Concept Unit: setSupportActionBar

### The Problem
You have an XML `MaterialToolbar` on the screen, but Android doesn't know it's supposed to be the *official* action bar. It's just a view. Because it's not the official action bar, it doesn't automatically display the Activity's title, and system calls to manipulate the action bar (like adding a back arrow) will fail or affect the wrong thing. You need to wire your custom view into the system's action bar framework.

### The New Code
```java
setSupportActionBar(binding.toolbar);
if (getSupportActionBar() != null) {
    getSupportActionBar().setDisplayHomeAsUpEnabled(true);
}
binding.toolbar.setNavigationOnClickListener(v -> finish());
```

### The Updated Project
*In `InventoryActivity.java`:*
```java
public class InventoryActivity extends AppCompatActivity {
    private ActivityInventoryBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityInventoryBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // ← new
        setSupportActionBar(binding.toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
        binding.toolbar.setNavigationOnClickListener(v -> finish());
    }
}
```

### Mechanical Walkthrough
- `setSupportActionBar(binding.toolbar)` — Tells the Activity to treat this specific `MaterialToolbar` view as the system action bar. Without this, the system won't automatically set the toolbar's text to the Activity's label (defined in the manifest), and `getSupportActionBar()` will return null or point to the default system bar.
- `getSupportActionBar().setDisplayHomeAsUpEnabled(true)` — Asks the system to display the "Home" affordance, typically rendered as a back arrow. Without this, the start of the toolbar remains empty, offering the user no visual cue that they can return to the previous screen. We check for null first because `getSupportActionBar()` can return null if the setup failed.
- `binding.toolbar.setNavigationOnClickListener(v -> finish())` — Defines the action taken when the back arrow is tapped. Without this listener, the back arrow is purely decorative. Tapping it will do absolutely nothing, leaving the user trapped on the screen. `finish()` tells the current Activity to close and return to whatever was below it on the back stack.

### CS Lens
This is an example of the **Adapter pattern** at the framework level. The Android system expects to interact with an `ActionBar` interface. By calling `setSupportActionBar`, the `AppCompatActivity` creates an adapter that wraps your `MaterialToolbar` view and exposes it to the system as if it were a standard `ActionBar`, bridging the gap between a modern UI component and a legacy system interface.

### SE Lens
Notice the separation of concerns: `setDisplayHomeAsUpEnabled` handles the *visuals* (drawing the arrow), while `setNavigationOnClickListener` handles the *behavior* (calling finish). While it seems tedious to do both manually, this design gives you control. You might want a "cancel" X icon instead of an arrow, or you might want to show an "Are you sure?" dialog when they tap back, rather than immediately closing the screen. Decoupling the visual affordance from the navigation action makes this flexibility possible.

### Run It Yourself
- Add this Java code to the `onCreate` of `InventoryActivity`.
- Make sure your app theme in `themes.xml` inherits from a `NoActionBar` theme (e.g., `Theme.MaterialComponents.DayNight.NoActionBar`), otherwise the app will crash when you call `setSupportActionBar` because a default action bar already exists.
- Run the app, navigate to the Inventory screen, and tap the back arrow.
- The Inventory screen will close, returning you to the Login screen.

---

## Concept Unit: Toolbar colors via theme attributes

### The Problem
By default, `MaterialToolbar` reads the `colorSurface` attribute from your theme for its background, and `colorOnSurface` for its text and icons. This results in a neutral, white or dark-gray toolbar. While modern and clean, you often want the toolbar to prominently display your app's primary branding color (e.g., a bold blue or red header). You need a way to tell the toolbar to use primary colors instead of surface colors without hardcoding hex codes.

### The New Code
```xml
style="@style/Widget.MaterialComponents.Toolbar.Primary"
```

### The Updated Project
*In `activity_login.xml` (on the `MaterialToolbar`):*
```xml
<com.google.android.material.appbar.MaterialToolbar
    android:id="@+id/toolbar"
    android:layout_width="match_parent"
    android:layout_height="?attr/actionBarSize"
    app:layout_scrollFlags="scroll|enterAlways"
    style="@style/Widget.MaterialComponents.Toolbar.Primary" /> <!-- ← new -->
```

### Mechanical Walkthrough
- `style="@style/Widget.MaterialComponents.Toolbar.Primary"` — Applies a built-in Material style to the toolbar. Without this, the toolbar defaults to a surface-colored background (usually white in light mode) with dark text. This specific style internally remaps the toolbar's color references so that its background uses your theme's `colorPrimary` and its text/icons use `colorOnPrimary`.

### CS Lens
This relies on **Attribute mapping**. The style doesn't contain actual color values; it contains instructions to map one semantic token (`colorPrimary`) to a specific UI property (the background). This indirection means that if you change your app's primary color in `colors.xml`, every toolbar using this style updates automatically, ensuring a single source of truth for your design system.

### SE Lens
We use a predefined style rather than manually setting `android:background="?attr/colorPrimary"`. If you only set the background, you also have to manually set the title text color, the navigation icon tint, and the overflow menu tint to `colorOnPrimary` to ensure contrast. The `Widget.MaterialComponents.Toolbar.Primary` style handles all of these dependent properties simultaneously, preventing accessibility issues where dark text might become illegible against a dark primary background.

### Run It Yourself
- Add the style attribute to the `MaterialToolbar` in your XML layout.
- Run the app.
- Notice the toolbar is now vividly colored with your app's primary theme color, and the title text has automatically adjusted to the appropriate contrasting color.

---

## Connect the Pieces
We've constructed a robust, branded header system. The `CoordinatorLayout` acts as the master structural container. Inside it, the `AppBarLayout` provides Material elevation physics. Inside *that*, the `MaterialToolbar` holds our title and applies our primary brand colors via the Material style. Finally, in Java, we wire this structure into the Android system with `setSupportActionBar`, visually enable the back arrow, and explicitly define its behavior with a click listener calling `finish()`. This structure is repeated across screens, ensuring a consistent user experience.

## What Breaks Without This
If you rely on the system's default action bar instead of building this architecture, you lose the ability to coordinate scroll behaviors. 
1. Remove the `CoordinatorLayout`, `AppBarLayout`, and `MaterialToolbar` from `activity_inventory.xml`.
2. Remove the Java code setting the support action bar in `InventoryActivity.java`.
3. Change your theme back to a `DarkActionBar` variant.
4. Run the app. You have a toolbar, but you cannot easily customize its font, center the title, or make it collapse when a long list is scrolled. You are locked into the system's rigid implementation. 
5. Restore the custom XML and Java code to regain control over your header.

## Exercises
1. Apply this `CoordinatorLayout` + `AppBarLayout` + `MaterialToolbar` architecture to the `activity_notifications.xml` layout.
2. In `NotificationsActivity.java`, wire up the toolbar just as you did for the Inventory screen, ensuring the back arrow works.
3. On the `LoginActivity`, set up the toolbar in XML and wire it in Java, but do *not* call `setDisplayHomeAsUpEnabled(true)`. The login screen is the root of the app, so it should not have a back arrow.

## Definition of Done
- All three activities (`LoginActivity`, `InventoryActivity`, `NotificationsActivity`) have a `CoordinatorLayout` root containing an `AppBarLayout` and a `MaterialToolbar`.
- The `MaterialToolbar` uses the `Primary` style for branding.
- Java code in all three activities calls `setSupportActionBar`.
- The Inventory and Notifications activities enable the back arrow and have an `OnClickListener` that calls `finish()`.
- You can navigate from Login to Inventory, and use the toolbar back arrow to return to Login successfully.
- You have committed these changes to version control with a message like: `feat: implement branded MaterialToolbar navigation architecture across all screens`. This ensures you have a checkpoint of the working, customized header system before adding scrolling content below it.
