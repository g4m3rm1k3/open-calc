# Lesson 08: Animated Visibility and Content Transitions

**What you will build**
The InventoryApp's state transitions feel polished by replacing abrupt show/hide with `AnimatedVisibility`, and deleted rows with `animateContentSize`, rather than jarring jumps. The "Add Item" input form slides in using a combined vertical slide and fade transition, and sliding out when dismissed. Deleted rows will smoothly animate their height to zero. The transferable problem: state changes that happen instantaneously feel like glitches; motion that matches the rate of change signals that the UI is alive and responsive.

**What you need to know first**
* **android-kotlin-foundations Lesson 15**: Recomposition and State.
* **android-kotlin-foundations Lesson 17**: State hoisting.
* **android-styling-lab Lessons 01–07**: Prior knowledge of Compose modifiers, standard UI layouts, and basic styling.

**Terms introduced in this lesson**
* **EnterTransition** — An animation spec defining how a Composable enters the composition — *Why it exists*: to decouple the declarative presence of UI from the visual choreography of its appearance.
* **ExitTransition** — An animation spec defining how a Composable leaves the composition — *Why it exists*: to provide symmetric or distinct visual cleanup before the element is destroyed in memory.
* **Operator Overloading** — Allowing standard operators like `+` to work on custom classes — *Why it exists*: to create expressive, readable Domain Specific Languages (DSLs) where composing complex behaviors looks like simple arithmetic.

**Objects and methods used**
* `AnimatedVisibility`
  * *What it is:* A Composable that animates the appearance and disappearance of its content.
  * *Implementation:* `androidx.compose.animation.AnimatedVisibility`
  * *Its use:* Wrapping content that needs to smoothly enter and exit the screen based on a boolean state, rather than popping in and out abruptly.
* `slideInVertically`
  * *What it is:* An `EnterTransition` that animates position along the Y axis.
  * *Implementation:* `androidx.compose.animation.slideInVertically`
  * *Its use:* Moving an element into view from above or below, giving it a spatial origin.
* `fadeIn` / `fadeOut`
  * *What it is:* Transitions that animate the alpha (opacity) of a Composable.
  * *Implementation:* `androidx.compose.animation.fadeIn` / `androidx.compose.animation.fadeOut`
  * *Its use:* Softening the appearance or disappearance of an element so it doesn't pop harshly.
* `Modifier.animateContentSize`
  * *What it is:* A modifier that animates its own size when its child's size changes.
  * *Implementation:* `androidx.compose.animation.animateContentSize`
  * *Its use:* Applied to a container to interpolate the size difference when its contents grow, shrink, or are removed, smoothing the layout reflow.

---

## Concept Unit: Why Motion Communicates State Change

### The Problem
When the user clicks "Add Item", the form appears instantly. The human visual system tracks moving objects automatically as a reflex. State changes that happen instantaneously feel like glitches. Motion that reflects a state transition—something sliding in from somewhere specific—tells the viewer what changed and how to think about the spatial relationship. A form that appears instantly from nowhere gives no spatial signal. As the Material Design motion spec states: "motion helps users understand relationships, reinforce hierarchy, and provide context."

### The New Code
```kotlin
AnimatedVisibility(visible = isAddingItem) {
    AddItemForm()
}
```

### The Updated Project
```kotlin
@Composable
fun InventoryScreen(isAddingItem: Boolean) {
    Column {
        Header()
        AnimatedVisibility(visible = isAddingItem) { // ← new
            AddItemForm()                            // ← new
        }                                            // ← new
        InventoryList()
    }
}
```

### Mechanical Walkthrough
* `AnimatedVisibility` — Replaces the standard `if` statement for conditional rendering. *Why it exists*: A standard `if` statement immediately adds or removes the Composable during recomposition. `AnimatedVisibility` intercepts this boolean change and keeps the Composable in the tree long enough to run an exit animation when it turns false, and runs an enter animation when it turns true. Without it, you cannot easily animate an element leaving, because the element is instantly destroyed.

### CS Lens
This embodies the concept of **State Interpolation**. In rendering systems and game engines, you rarely jump a value from A to B instantly; you compute the intermediate states over time (Delta T). Here, Compose is automatically generating the intermediate rendering frames between "not in tree" and "in tree".

### SE Lens
The design principle here is **Declarative vs Imperative Animation**. The imperative alternative is manually updating an alpha float in a loop and removing the view when alpha hits 0. The declarative tradeoff is that we trade fine-grained, frame-by-frame control for safety and conciseness. We describe *what* should happen, and the framework manages the *how*.

### Run It Yourself
Run the app on your device and tap the "Add Item" button. You will observe the form expanding into view instead of instantly popping onto the screen.

## Concept Unit: Customizing AnimatedVisibility

### The Problem
By default, `AnimatedVisibility` uses a generic expand and fade. But we want the "Add Item" form to slide in from above to feel like it's dropping down from a toolbar. We need explicit control over the `EnterTransition` and `ExitTransition`.

### The New Code
```kotlin
AnimatedVisibility(
    visible = isAddingItem,
    enter = slideInVertically { height -> -height },
    exit = slideOutVertically { height -> -height }
) {
    AddItemForm()
}
```

### The Updated Project
```kotlin
@Composable
fun InventoryScreen(isAddingItem: Boolean) {
    Column {
        Header()
        AnimatedVisibility(
            visible = isAddingItem,                           // ← new
            enter = slideInVertically { height -> -height },  // ← new
            exit = slideOutVertically { height -> -height }   // ← new
        ) {
            AddItemForm()
        }
        InventoryList()
    }
}
```

### Mechanical Walkthrough
* `enter = slideInVertically` — Overrides the default entrance animation. *Why it exists*: Defines the specific physical path the element takes. Without it, the default expand animation applies.
* `{ height -> -height }` — A lambda defining the initial vertical offset based on the element's full measured height. *Why it exists*: Negative height means it starts exactly one full height *above* its resting position. Without this exact calculation, it might slide from an arbitrary fixed pixel distance that looks wrong on different screen densities.
* `exit = slideOutVertically` — Overrides the default exit animation. *Why it exists*: Tells the framework how to reverse the entrance. Without it, it would shrink or fade out instead of sliding back up.

### CS Lens
This reflects **Coordinate System Transformation**. The lambda receives the measured size of the component and returns an offset vector. You are shifting the local origin of the Composable in a 2D Cartesian space (where Y goes down).

### SE Lens
The principle is **Higher-Order Functions for Configuration**. The alternative is having `slideInVertically` take a hardcoded DP value. By taking a lambda `(Int) -> Int`, the API defers the calculation until layout time when the actual pixel height is known, preventing hardcoded magic numbers and avoiding premature calculation before layout.

### Run It Yourself
Tap the "Add Item" button. The form now slides down perfectly from the top edge of its bounds, and slides back up when dismissed.

## Concept Unit: EnterTransition and ExitTransition Composition

### The Problem
The vertical slide is nice, but it looks a bit harsh because the form is fully opaque from the first pixel it moves. We want it to fade in *while* it slides in.

### The New Code
```kotlin
enter = slideInVertically { height -> -height } + fadeIn(),
exit = slideOutVertically { height -> -height } + fadeOut()
```

### The Updated Project
```kotlin
@Composable
fun InventoryScreen(isAddingItem: Boolean) {
    Column {
        Header()
        AnimatedVisibility(
            visible = isAddingItem,
            enter = slideInVertically { height -> -height } + fadeIn(),  // ← new
            exit = slideOutVertically { height -> -height } + fadeOut()  // ← new
        ) {
            AddItemForm()
        }
        InventoryList()
    }
}
```

### Mechanical Walkthrough
* `+` operator — Combines two `EnterTransition` objects into one. *Why it exists*: It executes both animations simultaneously. Without it, you would need a completely separate monolithic transition function like `slideAndFadeInVertically`. This operator overload keeps the API modular.
* `fadeIn()` / `fadeOut()` — Adds an alpha interpolation from 0f to 1f (and vice-versa). *Why it exists*: Softens the visual edge of the moving component. Without it, the component is fully visible as it moves.

### CS Lens
This is an example of the **Composite Pattern** utilizing **Operator Overloading**. The `+` function returns a new `EnterTransition` that contains a collection of the transitions added together. The framework then iterates over this collection and applies them all to the animation matrix.

### SE Lens
**Composition over Inheritance**. Instead of creating a massive class hierarchy of every possible animation combination (`FadeEnterTransition`, `SlideEnterTransition`, `SlideAndFadeEnterTransition`), Compose provides atomic transitions and a mechanism (`+`) to combine them. This prevents class explosion.

### Run It Yourself
Toggle the form again. You will observe it gracefully fading in as it drops down, creating a much softer and more polished effect.

## Concept Unit: animateContentSize for Row Deletion

### The Problem
When an item is deleted from the inventory, it vanishes instantly. The items below it snap up immediately to fill the gap. This abrupt reflow is jarring. We want the row to smoothly collapse its height to zero so the rest of the list flows up naturally. (Note: `animateContentSize` animates size changes on a single composable—it does not animate items being added/removed from a `LazyColumn`, which requires `LazyListState` item animations).

### The New Code
```kotlin
Modifier.animateContentSize(animationSpec = tween(300))
```

### The Updated Project
```kotlin
@Composable
fun InventoryRow(item: InventoryItem, onDelete: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .animateContentSize(animationSpec = tween(300)) // ← new
    ) {
        Row {
            Text(item.name)
            // When marked for deletion, internal content heights can shrink to 0
        }
    }
}
```

### Mechanical Walkthrough
* `animateContentSize` — A modifier applied to the container. *Why it exists*: It listens for changes in the layout size of its children. When a change happens, it intercepts the layout pass and interpolates the container's bounds over time. Without it, the layout jumps instantly to the new size.
* `tween(300)` — Defines the interpolation curve and duration (300ms). *Why it exists*: It gives explicit control over the animation timing. Without it, the default spring animation is used, which might feel inappropriate for a simple deletion collapse.

### CS Lens
This is an application of the **Observer Pattern on the Layout Tree**. The modifier acts as an observer on the child layout constraints. When the model invalidates the child layout, the modifier captures the old size and the new size, and schedules a render loop to transition between them.

### SE Lens
**Decoupling Layout from Animation**. The child composable doesn't need to know it is being animated, and the parent list doesn't need to orchestrate the height change. The animation concern is injected exactly at the boundary where it is needed via a Modifier.

### Run It Yourself
Trigger a state change that shrinks an item's content. You will see the container smoothly reduce its height, pushing the adjacent elements gently instead of instantly snapping.

## Connect the Pieces
When the user taps "Add Item", `isAddingItem` becomes `true`. `AnimatedVisibility` triggers the `EnterTransition`. Because we combined `slideInVertically` and `fadeIn` with the `+` operator, the form simultaneously shifts its Y-axis offset from `-height` to `0` and its alpha from `0f` to `1f`. Later, when an item's content changes size, the `animateContentSize` modifier on the row detects the delta in measured layout bounds and uses a 300ms `tween` to animate the frame, smoothly shifting all subsequent UI elements on the screen. The entire UI feels like physical material rather than instantaneous digital glitches.

## What Breaks Without This
1. Remove `AnimatedVisibility` and revert to an `if` block.
2. Trigger the "Add Item" toggle.
3. **What goes wrong:** The UI instantly flashes into existence, displacing the list below it abruptly. There is no spatial context for where the form came from, making the app feel cheap and unresponsive to physical principles.
4. Restore `AnimatedVisibility`.

## Exercises
1. Change the enter transition to `slideInHorizontally { width -> width } + fadeIn()`. Observe how the form now slides in from the right edge.
2. Change the `animateContentSize` animation spec from `tween(300)` to `spring(dampingRatio = Spring.DampingRatioHighBouncy)`. Observe the physical rubber-band effect when the size changes.

## Definition of Done
- [ ] `AnimatedVisibility` replaces the `if` block for the add item form.
- [ ] Enter and exit transitions are explicitly defined and combined with the `+` operator.
- [ ] `Modifier.animateContentSize` is applied to the inventory row.
- [ ] The app compiles and the animations run smoothly on a device.
- [ ] Commit your changes with the message: `Add explicit motion choreography to state transitions to provide spatial context and reduce abrupt layout shifts.`
