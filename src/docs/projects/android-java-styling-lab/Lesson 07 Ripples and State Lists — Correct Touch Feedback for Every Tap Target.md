# Lesson 07: Ripples and State Lists — Correct Touch Feedback for Every Tap Target

**What you will build**
You will add tactile, visible touch feedback to every interactive element in the InventoryApp. By the end of this lesson, you will have applied standard system ripples to generic tappable surfaces, built custom bounded ripples for branded elements, and designed state list selectors for complex press states. The transferable problem: users cannot distinguish tappable surfaces from static ones without immediate, visible feedback; a silent tap feels broken and erodes trust in the application.

**What you need to know first**
You need to understand `Button` elements and click listeners (from `android-ui-foundations` Lesson 11), `OnClickListener` interfaces (Lesson 16), and the basic styling techniques covered in Lessons 01–06 of this series. You should also be familiar with applying XML attributes to Views.

**Terms introduced in this lesson**
* **Ripple** — A visual expanding circle effect triggered by a touch event on an Android screen. *Why it exists:* It provides instantaneous confirmation to the user that their touch was registered at the exact coordinate they tapped, reinforcing the illusion of physical interaction.
* **State List Drawable** — An XML file that maps different visual states (like pressed, focused, or default) to different graphics or colors. *Why it exists:* It allows a single background attribute to react dynamically to user input without requiring complex Java logic to swap drawables during touch events.
* **Bounded Ripple** — A ripple effect that is clipped to the edges of its container. *Why it exists:* It prevents the visual touch feedback from bleeding outside the logical boundaries of the tappable component, maintaining a clean UI structure.

**Objects and methods used**
* `?attr/selectableItemBackground`
  * *What it is:* A theme attribute that resolves to the system's default bounded ripple drawable.
  * *Implementation:* Applied in XML as `android:background="?attr/selectableItemBackground"`.
  * *Its use:* Used to give standard, bounded touch feedback to any View or ViewGroup that handles click events.
* `?attr/selectableItemBackgroundBorderless`
  * *What it is:* A theme attribute that resolves to a ripple drawable that expands beyond the immediate bounds of the View.
  * *Implementation:* Applied in XML as `android:background="?attr/selectableItemBackgroundBorderless"`.
  * *Its use:* Ideal for small, unbordered interactive elements like icon buttons, where clipping the ripple to a tight box looks rigid and unnatural.
* `<ripple>`
  * *What it is:* An XML drawable tag used to define a custom `RippleDrawable`.
  * *Implementation:* Created in the `res/drawable` directory, specifying the `android:color` attribute for the ripple wave.
  * *Its use:* Used when the default system ripple colors do not fit the application's branding or when specific boundary masks are required.
* `<selector>`
  * *What it is:* An XML drawable tag representing a `StateListDrawable`.
  * *Implementation:* Created in `res/drawable`, containing `<item>` tags that specify `android:state_pressed="true"` or other states.
  * *Its use:* Used to define completely different background appearances based on the View's current interaction state.

---

## Concept Unit: Theme-Provided Ripples

### The Problem
When you attach an `OnClickListener` to a generic `LinearLayout` in your inventory row, it becomes tappable. However, tapping it produces no visual feedback. The user taps, the screen flashes no confirmation, and a split-second later an action occurs. This feels detached. We need a way to instantly show the user that their input was accepted, using the system's default interactive style.

### The New Code
```xml
android:background="?attr/selectableItemBackground"
```

This single attribute hooks into the Android theme to retrieve the standard touch feedback behavior.

### The Updated Project
Open `res/layout/item_inventory_row.xml` and update the root `LinearLayout`:

```xml
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="16dp"
    android:clickable="true"
    android:focusable="true"
    android:background="?attr/selectableItemBackground"> <!-- ← new -->
    
    <ImageView
        android:id="@+id/item_icon"
        android:layout_width="48dp"
        android:layout_height="48dp"
        android:src="@drawable/ic_inventory_box" />
        
    <TextView
        android:id="@+id/item_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginStart="16dp"
        android:text="Sample Item" />
        
</LinearLayout>
```

The addition of `clickable="true"` and `focusable="true"` is required if the View doesn't have an `OnClickListener` attached immediately, ensuring the ripple can still be tested visually.

### Mechanical Walkthrough
* `android:background="?attr/selectableItemBackground"`: This applies the theme's default bounded ripple as the background. Without it, the background remains transparent and static, offering no visual proof that a tap occurred.
* `?attr/`: This syntax queries the current theme for a value rather than hardcoding a specific resource. If the app switches to a dark theme, the ripple color automatically adapts. Without using `?attr/`, you would have to manually manage light and dark ripple colors.
* `android:clickable="true"`: This enables the View to receive click events. Without it, the View ignores touch inputs, and the ripple will never trigger.
* `android:focusable="true"`: This allows the View to be navigated to via keyboard or D-pad. Without it, accessibility users cannot interact with the item.

### CS Lens
This is an implementation of the Observer pattern at the system level. The `RippleDrawable` observes the View's touch events. When an `ACTION_DOWN` event fires, the drawable calculates the exact X/Y coordinate of the touch and begins an expanding animation from that origin.

### SE Lens
The design principle here is Reusability via Indirection. We use a theme attribute (`?attr/`) instead of hardcoding a drawable. The alternative would be writing a custom ripple for every single view. By relying on the theme, we ensure consistency across the entire app and drastically reduce maintenance when design language changes.

### Run It Yourself
Deploy the app to your emulator. Tap on an inventory row. You will see a subtle, gray circle expand from your finger's exact location and fade out when you release.

## Concept Unit: MDC Components and Automatic Ripples

### The Problem
You might notice that `MaterialButton` or `MaterialCardView` already show ripples when tapped, even though you never explicitly set a background on them. It seems like magic, but it is just standard code. We need to understand how MDC applies these so we know why custom views require manual intervention.

### The New Code
```xml
<com.google.android.material.card.MaterialCardView
    android:clickable="true">
```

MDC components automatically generate their own ripples when they are made clickable.

### The Updated Project
Open `res/layout/fragment_inventory.xml` and observe the summary card:

```xml
<com.google.android.material.card.MaterialCardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:clickable="true" <!-- ← new -->
    android:focusable="true">
    
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:padding="16dp"
        android:text="Inventory Summary" />
</com.google.android.material.card.MaterialCardView>
```

By simply making the card clickable, it handles the rest.

### Mechanical Walkthrough
* `MaterialCardView`: This is an MDC component that extends `FrameLayout`. Internally, its Java implementation checks if it is clickable. If it is, it automatically constructs a `RippleDrawable` and applies it as the foreground. Without using an MDC component, you are left with the base Android views which do not have this automatic behavior.
* `android:clickable="true"`: This triggers the internal logic inside `MaterialCardView` to generate the ripple. Without it, the card assumes it is purely decorative and skips the costly ripple generation.

### CS Lens
This represents Encapsulation. The `MaterialCardView` hides the complexity of creating and managing a `RippleDrawable`. It exposes a simple boolean state (`clickable`) and handles the complex visual side effects internally.

### SE Lens
The trade-off here is Convention over Configuration. MDC assumes that if a card is clickable, you want a Material-compliant ripple based on your theme's `colorOnSurface`. The alternative is forcing developers to configure ripples manually every time. While this convention saves time, it makes overriding the default behavior slightly more complex.

### Run It Yourself
Run the app and tap the Inventory Summary card. Observe the ripple. Notice that it uses a tint derived from your primary or surface color, unlike the generic system ripple.

## Concept Unit: Custom Bounded Ripples

### The Problem
Sometimes the default system ripple or the MDC automatic ripple doesn't fit your design. Perhaps you have a custom view with rounded corners, and the default ripple bleeds outside those corners, or you need a specific brand color for the interaction. We must build a custom `RippleDrawable` XML to define our own color and clipping mask.

### The New Code
```xml
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
    android:color="?attr/colorOnSurface">
    <item android:id="@android:id/mask">
        <shape android:shape="rectangle" />
    </item>
</ripple>
```

This XML defines a ripple effect with a specific color and a mask that dictates its boundaries.

### The Updated Project
Create a new file `res/drawable/row_feedback.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<ripple xmlns:android="http://schemas.android.com/apk/res/android"
    android:color="?attr/colorPrimary"> <!-- ← new -->
    <item android:id="@android:id/mask"> <!-- ← new -->
        <shape android:shape="rectangle">
            <corners android:radius="8dp" />
            <solid android:color="@android:color/white" />
        </shape>
    </item>
</ripple>
```

Now apply it to a view in `res/layout/item_custom.xml`:

```xml
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:clickable="true"
    android:focusable="true"
    android:background="@drawable/row_feedback"> <!-- ← new -->
    
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:padding="16dp"
        android:text="Custom Item" />
</LinearLayout>
```

This applies your custom XML drawable as the background.

### Mechanical Walkthrough
* `<ripple>`: The root element indicating this drawable is a `RippleDrawable`. Without this, you cannot achieve the expanding wave effect native to Android.
* `android:color="?attr/colorPrimary"`: Defines the color of the ripple wave. Here we use the theme's primary color. Without setting a color, the ripple might be invisible or default to black.
* `android:id="@android:id/mask"`: This specific ID tells the Android system that this item should NOT be drawn on screen; instead, its shape should be used strictly to clip the ripple. Without this ID, the shape would be drawn as a solid background block.
* `<solid android:color="@android:color/white" />`: The mask requires a solid color to define its alpha channel for clipping. The actual color doesn't matter (it won't be drawn), but without an opaque color, the mask has no area and the ripple will not show.

### CS Lens
This is a form of spatial masking, similar to bitmasking in memory but applied to 2D rendering. The mask acts as a boolean matrix: if a pixel falls inside the mask's opaque region, the ripple is allowed to render there. If it falls outside, the ripple's alpha is forced to zero.

### SE Lens
We are using Composition. A `RippleDrawable` is composed of an effect color and an optional underlying drawable (the mask or a background). The alternative is writing custom `onDraw` logic in a Java View subclass. By composing XML elements, we separate visual definition from business logic.

### Run It Yourself
Deploy the app and tap the custom item. The ripple will now be your primary color and will sharply cut off at the 8dp rounded corners, perfectly matching the shape.

## Concept Unit: State List Selectors for Pressed States

### The Problem
A ripple is great for transient feedback, but some UI elements need a more persistent visual change while held down. If a user presses and holds a custom button, the ripple finishes expanding, but you might want the button to physically look "pressed" (e.g., darkened or visually sunken) as long as the finger remains on the screen. We need a `StateListDrawable` to switch background appearances based on the View's current state.

### The New Code
```xml
<selector>
    <item android:state_pressed="true" android:drawable="@color/gray_pressed" />
    <item android:drawable="@color/white" />
</selector>
```

This selector evaluates from top to bottom, applying the first matching item based on the view's state.

### The Updated Project
Create a new file `res/drawable/row_pressed_state.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:state_pressed="true"> <!-- ← new -->
        <shape android:shape="rectangle">
            <solid android:color="#E0E0E0" />
        </shape>
    </item>
    
    <item> <!-- ← new -->
        <shape android:shape="rectangle">
            <solid android:color="#FFFFFF" />
        </shape>
    </item>
</selector>
```

Then apply it in `res/layout/item_holdable.xml`:

```xml
<FrameLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:clickable="true"
    android:focusable="true"
    android:background="@drawable/row_pressed_state"> <!-- ← new -->
    
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:padding="24dp"
        android:text="Press and Hold Me" />
</FrameLayout>
```

The View will now swap its background shape entirely when the `pressed` state changes.

### Mechanical Walkthrough
* `<selector>`: The root element defining a `StateListDrawable`. Without it, you cannot conditionally serve different drawables based on View states.
* `<item android:state_pressed="true">`: This condition checks if the user's finger is currently down on the view. Without this specific state check, the drawable would never know when to change.
* Order of `<item>` tags: Selectors evaluate top-to-bottom and stop at the first match. If you put the default `<item>` (with no state conditions) at the top, it will ALWAYS match, and the `state_pressed` item below it will never be reached, breaking your interaction feedback.
* `<item>` (default): The fallback drawable used when no other states match. Without a default item, the View's background will disappear completely when not pressed.

### CS Lens
This is a Finite State Machine (FSM) implemented in UI rendering. The View exists in discrete states (Default, Pressed, Focused). The XML defines the output mapping for each state. The Android framework acts as the engine, transitioning between states based on hardware interrupts (touch events) and triggering redraws.

### SE Lens
The principle is Declarative UI State. You declare what the UI should look like in various states, rather than writing imperative Java code (`if (event.getAction() == ACTION_DOWN) { setBackground(...) }`). The declarative approach is far less error-prone and keeps visual styling completely out of your Java controllers.

### Run It Yourself
Run the app. Press and hold the "Press and Hold Me" item. Notice the background instantly snaps to the gray color and stays gray as long as your finger is down. Release your finger, and it snaps back to white.

## Connect the Pieces
In this lesson, you took a static, unresponsive InventoryApp and gave it a tactile heartbeat. You started by applying the system's `?attr/selectableItemBackground` to standard list rows, granting them immediate, familiar ripple feedback. You then looked under the hood of MDC components to see how they automatically generate ripples when made clickable. To handle a branded, uniquely shaped component, you built a custom `<ripple>` XML with a defined boundary mask. Finally, for an element requiring a persistent held state, you constructed a `<selector>` state list to definitively swap colors upon touch. Together, these tools ensure that every tap target in your app clearly and immediately acknowledges the user's input.

## What Breaks Without This
Without touch feedback, users double-tap. Let's break the app to see this. Open `res/layout/item_inventory_row.xml` and remove the `android:background="?attr/selectableItemBackground"` line. Run the app. 

When you tap a row, the screen remains static. Because the human brain expects instant physics-based feedback, a 100-millisecond delay in network or database loading will cause the user to think their tap missed. They will tap again. If that tap triggers an action (like deleting an item or opening an activity), the double-tap might trigger the action twice, leading to crashes or corrupted state. Restore the `android:background` attribute to prevent this user behavior.

## Exercises
1. Apply `?attr/selectableItemBackgroundBorderless` to a small `ImageView` acting as a favorite button. Observe how the ripple expands past the image bounds into a circle.
2. Modify your custom `row_feedback.xml` to use a different mask shape, such as an oval (`android:shape="oval"`), and observe how the ripple is clipped to the new geometry.
3. Add an `android:state_focused="true"` item to your `<selector>` drawable with a distinct color to support keyboard/D-pad navigation feedback.

## Definition of Done
- All interactive `LinearLayout` and `FrameLayout` rows in your layouts have a ripple background applied.
- The custom `row_feedback.xml` and `row_pressed_state.xml` drawables exist in your `res/drawable` folder.
- You have tested the app on an emulator and visually confirmed that every tap target provides feedback.
- Commit your changes: `git commit -m "Add ripple and state list touch feedback to all interactive views"`. *Why:* This commit documents the UI polish phase where static views were upgraded to reactive tap targets, ensuring proper interaction design.
