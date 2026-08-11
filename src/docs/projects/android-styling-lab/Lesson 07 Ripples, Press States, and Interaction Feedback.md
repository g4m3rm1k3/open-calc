# Lesson 07: Ripples, Press States, and Interaction Feedback

**What you will build**
You will add explicit interaction feedback to the `InventoryApp`. First, you will rely on the default Material 3 components like `Card` to handle ripples automatically for simple clickable items. Then, for a custom raw `Row` composable that needs to be tappable, you will manually wire up a `MutableInteractionSource` and an `Indication` (using `rememberRipple`) to explicitly draw a ripple. The transferable problem: users cannot tell whether something is tappable or whether their press actually registered if there is no visual feedback; a silent tap feels broken and unresponsive.

**What you need to know first**
* From *android-kotlin-foundations* Lesson 08: Lambdas and trailing lambda syntax.
* From *android-kotlin-foundations* Lesson 14: `Modifier` chaining and order of operations.
* From *android-styling-lab* Lessons 01–06: Basic Material 3 theming, color schemes, and layout composables.

**Terms introduced in this lesson**
* **Doherty Threshold** — the HCI rule stating interactions faster than 100ms feel instantaneous, while anything slower begins to feel laggy. *Why it exists:* To provide a quantifiable baseline for system responsiveness; immediate feedback like a ripple tells the user the system heard them before the actual network or database work completes.
* **Interaction Feedback** — the immediate visual or auditory response to user input. *Why it exists:* To eliminate ambiguity and assure the user that their tap, swipe, or press was successfully registered by the device.

**Objects and methods used**
* `MutableInteractionSource`
  * *What it is:* An observable stream that tracks user interactions (presses, drags, hovers, focus) on a component.
  * *Implementation:* `val interactionSource = remember { MutableInteractionSource() }`
  * *Its use:* Acts as the bridge between what the user physically did and what the UI needs to react to.
* `Indication`
  * *What it is:* An interface representing how to visually draw an interaction on the screen.
  * *Implementation:* Passed to the `indication` parameter of `Modifier.clickable`.
  * *Its use:* Translates an interaction state (like being pressed) into a drawing operation (like expanding a shaded circle).
* `rememberRipple()`
  * *What it is:* Material Design's built-in `Indication` implementation that draws the signature ink ripple effect.
  * *Implementation:* `rememberRipple(bounded = true, color = Color.Gray, radius = Dp.Unspecified)`
  * *Its use:* Provides standard Material visual feedback for custom tappable components.

---

## Concept Unit: Automatic Interaction Feedback

### The Problem
When you build user interfaces, the size of the tap target is only half of the perceived quality; the other half is feedback latency. If a user taps an inventory item and the app takes 300ms to load the detail screen without any immediate visual response, the user might think they missed the tap and try again. This violates the Doherty Threshold. The application must confirm the press within 100ms, even if the destination isn't ready.

### The New Code
```kotlin
Card(
    onClick = { onInventoryItemClick(item) }
) {
    // Content goes here
}
```

### The Updated Project
```kotlin
@Composable
fun StandardInventoryItem(
    item: InventoryItem,
    onInventoryItemClick: (InventoryItem) -> Unit
) {
    // ← new: using the clickable overload of Card
    Card(
        onClick = { onInventoryItemClick(item) },
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
    ) {
        Text(
            text = item.name,
            modifier = Modifier.padding(16.dp)
        )
    }
}
```

### Mechanical Walkthrough
* `onClick = { onInventoryItemClick(item) }` — Explaining: Material 3 components like `Button`, `IconButton`, and `Card` have specialized overloads that take an `onClick` lambda. By using these overloads, the component automatically wires up an internal `MutableInteractionSource` and an internal `Indication`. Without it, you would have an inert container that ignores touches.
* `Card(onClick = ...)` versus `Modifier.clickable` — Explaining: The `Card` component handles clipping the ripple to its own rounded corners automatically. If you just slapped a basic `Modifier.clickable` onto a non-clickable `Card`, the ripple might draw as a hard rectangle overlapping the rounded corners, looking visually broken.

### CS Lens
The Feedback Loop. In human-computer interaction, every action must have an equal and immediate reaction. This mirrors low-level hardware interrupts: when a peripheral sends data, the CPU acknowledges the interrupt before processing the payload. The ripple is the UI's acknowledgment packet.

### SE Lens
Sensible Defaults vs. Manual Overrides. The framework provides components like `Card` that have built-in styling and interaction handling. We choose this approach when we want standard behavior because it reduces boilerplate. The tradeoff is a lack of deep customization; if you need a completely unique shape or feedback mechanism, the standard component is too restrictive.

### Run It Yourself
Run the app on a device or emulator. Tap the `StandardInventoryItem`. You will immediately see a subtle shaded wave expand from the exact point of your touch, perfectly clipped by the card's rounded borders.

---

## Concept Unit: The Event Stream (`MutableInteractionSource`)

### The Problem
Sometimes standard Material components don't fit your design, and you must use raw layout primitives like a `Row` or `Box`. If you make a raw `Row` clickable, it lacks the sophisticated interaction tracking built into `Button`. How does a custom composable know the difference between a quick tap, a long press, or a focus event from a keyboard?

### The New Code
```kotlin
val interactionSource = remember { MutableInteractionSource() }
```

### The Updated Project
```kotlin
@Composable
fun CustomInventoryRow(
    item: InventoryItem,
    onRowClick: (InventoryItem) -> Unit
) {
    // ← new: explicitly tracking interactions for this specific row
    val interactionSource = remember { MutableInteractionSource() }

    Row(
        modifier = Modifier
            .clickable(
                interactionSource = interactionSource,
                indication = null, // we will add the ripple next
                onClick = { onRowClick(item) }
            )
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(item.name)
    }
}
```

### Mechanical Walkthrough
* `MutableInteractionSource()` — Explaining: This creates an event bus that captures all interaction states (Press, Hover, Focus, Drag) directed at the component. Without this, the composable has no way to broadcast that it is currently being pressed down.
* `remember { ... }` — Explaining: The interaction source must survive recompositions. If we didn't `remember` it, every time the row recomposes, it would create a new interaction source, dropping any currently active press states and breaking the visual feedback loop.
* `interactionSource = interactionSource` — Explaining: We pass the stream to `Modifier.clickable`. Now, when the user touches the row, `clickable` emits a `PressInteraction.Press` event into this exact stream.

### CS Lens
Event Streams. This embodies the Observer pattern but modernized as reactive streams. The `MutableInteractionSource` acts as a publisher. Other parts of the system (like the visual ripple) can subscribe to this stream and react asynchronously as events flow in, decoupling the act of touching from the act of drawing.

### SE Lens
Separation of Concerns. The framework separates *what happened* (the interaction source) from *how to draw it* (the indication). The alternative would be hardcoding press animations directly inside the click modifier. By splitting them, we can use the same interaction source to trigger a ripple, play a sound, or start a network request simultaneously.

### Run It Yourself
Run the app and tap the `CustomInventoryRow`. Nothing visual happens yet because we explicitly passed `null` for the `indication`, but the `onClick` lambda fires. This proves that the interaction source is collecting events, but nobody is rendering them.

---

## Concept Unit: The Visual Renderer (`Indication` and `rememberRipple`)

### The Problem
Now that our custom `Row` is tracking press events via the `MutableInteractionSource`, we need to visually respond. A silent tap feels broken. We must explicitly define *how* this component should draw its press state.

### The New Code
```kotlin
val ripple = rememberRipple(bounded = true, color = MaterialTheme.colorScheme.primary)
```

### The Updated Project
```kotlin
@Composable
fun CustomInventoryRow(
    item: InventoryItem,
    onRowClick: (InventoryItem) -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    
    // ← new: defining the visual feedback mechanism
    val ripple = rememberRipple(
        bounded = true,
        color = MaterialTheme.colorScheme.primary
    )

    Row(
        modifier = Modifier
            // ← new: wiring the indication to the interaction source
            .clickable(
                interactionSource = interactionSource,
                indication = ripple,
                onClick = { onRowClick(item) }
            )
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(item.name)
    }
}
```

### Mechanical Walkthrough
* `rememberRipple(...)` — Explaining: This function instantiates an `Indication` object specifically designed to draw the Material Design ink ripple. Without it, the component wouldn't know what shape or animation to draw when pressed.
* `bounded = true` — Explaining: This tells the ripple to clip itself to the exact bounds of the composable it is applied to (in this case, the `Row`). If this were `false`, the ripple would expand circularly out into neighboring UI elements, which is generally only desired for small, unbordered icons.
* `color = MaterialTheme.colorScheme.primary` — Explaining: We explicitly set the color of the ripple. Without this, it defaults to a semi-transparent layer based on the local content color.
* `indication = ripple` — Explaining: We pass our configured ripple into the `clickable` modifier. When `clickable` sees a press event in the `interactionSource`, it invokes the `indication` to draw the effect on the screen.

### CS Lens
The Strategy Pattern. `Indication` is an interface. `rememberRipple` provides a specific implementation of that interface. If you wanted the row to shrink instead of ripple when pressed, you would write a custom class implementing `Indication` and swap it in here. The `clickable` modifier doesn't care *how* it's drawn, only that it *can* be drawn.

### SE Lens
Composability of Modifiers. We explicitly wire the state (`MutableInteractionSource`) to the view (`Indication`) inside a single modifier. This explicit wiring allows maximum flexibility: you could have one interaction source drive ripples on two completely separate UI elements simultaneously. The tradeoff is verbosity for custom elements compared to standard Material components.

### Run It Yourself
Run the app. Tap the `CustomInventoryRow`. You will now see a primary-colored ripple originate from your finger and fill the bounds of the row. The silent tap is fixed.

---

## Connect the Pieces
When a user taps the screen over the `CustomInventoryRow`:
1. The hardware registers a touch and Android routes it to the Compose UI tree.
2. `Modifier.clickable` detects the touch event within the `Row`'s layout bounds.
3. Because the user's finger is down, `clickable` emits a `PressInteraction.Press` object into the `MutableInteractionSource`.
4. The `Indication` (our `rememberRipple`), which is secretly observing that `MutableInteractionSource`, sees the new `Press` event.
5. The `Indication` immediately hooks into the drawing phase and renders an expanding circle using the `MaterialTheme.colorScheme.primary` color, providing feedback within the 100ms Doherty threshold.
6. When the user lifts their finger, `clickable` triggers the `onClick` lambda (executing your app logic) and emits a `PressInteraction.Release` into the stream, causing the ripple to fade out.

## What Breaks Without This
1. Go to `CustomInventoryRow` and remove the `indication = ripple` argument, or pass `indication = null`.
2. Run the app.
3. Tap the row. The `onClick` fires, but the row remains visually completely static. It feels dead, and a fast user will likely tap it twice, assuming the first tap failed, leading to double-execution of your click logic.
4. Restore `indication = ripple`.

## Exercises
1. Change the `bounded` parameter in `rememberRipple` to `false` in your `CustomInventoryRow`. Tap near the edge of the row and observe how the ripple bleeds into the surrounding space.
2. Change the `color` in `rememberRipple` to `Color.Red` directly. Observe how explicit colors override the semantic theming, and consider why relying on `MaterialTheme.colorScheme` is generally safer.

## Definition of Done
- [ ] You have replaced standard clickable rows with standard Material components (like `Card`) where possible to get free interaction feedback.
- [ ] You have manually wired `MutableInteractionSource` and `rememberRipple` to a custom raw `Row` to guarantee interaction feedback.
- [ ] You have verified that tapping these elements provides a visual response well within human perception limits.
- [ ] You have committed your code: `git commit -m "feat(ui): add manual ripple indication to custom row to prevent silent, ambiguous taps"`
