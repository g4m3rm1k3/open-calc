# Lesson 05: Cards and Elevation — Grouping with Surface Depth

**What you will build**
You will wrap each inventory grid row in a styled `Card` with real tonal elevation, replacing the flat list items from the prior series. The transferable problem: flat list items give the viewer no visual signal that each row is a tappable unit — elevation communicates interactability and grouping without needing a visible border.

**What you need to know first**
* **android-kotlin-foundations Lesson 16:** `LazyColumn` for rendering lists.
* **android-kotlin-foundations Lesson 26:** `MaterialTheme` and `Modifier` usage.
* **android-ui-foundations Lesson 34 / android-kotlin-foundations Lesson 26:** The proximity principle (consistent gaps read as related items).
* **android-styling-lab Lessons 01–04:** Theming and styling foundations in Jetpack Compose.

**Terms introduced in this lesson**
* **Tonal Elevation** — A Material Design 3 mechanism where elevated surfaces receive a color overlay instead of just a drop shadow. *Why it exists:* Drop shadows are invisible against dark mode backgrounds; a color overlay shifts the surface color slightly toward the primary color, making depth visible in both light and dark themes.
* **Surface** — The core background composable in Compose. *Why it exists:* It provides the lowest-level foundation for rendering shape, background color, and elevation, automatically setting the appropriate content color for text and icons placed inside it.
* **Card** — A specialized container composable. *Why it exists:* It builds upon `Surface` to provide opinionated defaults for list items or grouped content, including built-in rounding, content padding, and click handling.

**Objects and methods used**
* `androidx.compose.material3.Card`
    * *What it is:* A Material Design container used to group related information.
    * *Implementation:* A composable function that wraps its content in a stylized box.
    * *Its use:* Used as the top-level container for individual items in lists or grids to visually group them.
* `androidx.compose.material3.CardDefaults.cardElevation`
    * *What it is:* A factory method that creates elevation configurations for cards.
    * *Implementation:* Returns a `CardElevation` object specifying elevations for different states (resting, pressed, etc.).
    * *Its use:* Passed to the `elevation` parameter of `Card` to establish its visual depth.
* `androidx.compose.material3.Surface`
    * *What it is:* A base composable that represents a Material surface.
    * *Implementation:* A composable that handles clipping, elevation, and background rendering.
    * *Its use:* Used when building custom components that need a background and elevation but shouldn't inherit the specific semantics of a `Card`.

---

## Concept Unit: Material 3 Tonal Elevation Model

### The Problem
Historically, interfaces communicated depth using drop shadows. In light mode, a grey shadow beneath a white card clearly separates it from a grey background. In dark mode, however, a black shadow beneath a dark grey card on a black background is virtually invisible. You lose the ability to signal depth, which means you lose the ability to signal that a component is raised, tappable, or important.

### The New Code
```kotlin
Surface(
    modifier = Modifier.fillMaxWidth(),
    tonalElevation = 2.dp
) {
    Text("I am slightly shifted toward the primary color")
}
```

### The Updated Project
```kotlin
@Composable
fun ElevationExperiment() {
    Column(modifier = Modifier.padding(16.dp)) {
        // ← new: Flat surface
        Surface(tonalElevation = 0.dp) {
            Text("Flat (0.dp)", modifier = Modifier.padding(16.dp))
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // ← new: Elevated surface
        Surface(tonalElevation = 2.dp) {
            Text("Elevated (2.dp)", modifier = Modifier.padding(16.dp))
        }
    }
}
```

### Mechanical Walkthrough
* `tonalElevation = 2.dp`: This does not just draw a shadow. It mathematically mixes a small percentage of the theme's `primary` color into the surface's background color. The formula is roughly `alpha = 4.5% × ln(elevation + 1)`. Without this, the component would rely solely on shadows, failing to convey depth in dark mode.
* `Surface`: This composable reads the current theme and the requested `tonalElevation` to calculate the exact pixel color to draw. Without it, you would have to manually compute and apply color tints based on system state.

### CS Lens
This is an implementation of **algorithmic rendering**. Instead of requiring the designer to hand-pick separate hex codes for "background", "slightly elevated background", and "highly elevated background" for both light and dark themes, the system uses a mathematical formula (a natural logarithm) to dynamically generate the correct color in real-time based on a single continuous variable (depth).

### SE Lens
The design principle here is **graceful degradation and universal design**. M3 chose tonal elevation because it works universally across lighting environments. The alternative (pure shadow-based depth) required maintaining two entirely separate visual paradigms for light and dark modes. The tradeoff is that highly elevated surfaces in M3 shift their hue significantly toward the primary color, which can alter the intended color harmony if overused.

### Run It Yourself
Place the `ElevationExperiment` in a preview. Switch between Light and Dark mode previews. Observe that in Dark mode, the 2.dp surface is noticeably lighter/tinted compared to the 0.dp surface, proving the tonal shift is working.

---

## Concept Unit: Card vs Surface

### The Problem
You understand elevation, and you could build your list items using `Surface`. However, a list item usually needs rounded corners, default elevation, and often a clickable ripple effect. Building this from scratch with `Surface` requires chaining many modifiers (`clip`, `background`, `clickable`, `padding`).

### The New Code
```kotlin
Card(
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
) {
    Text("I am a card")
}
```

### The Updated Project
```kotlin
@Composable
fun ComponentComparison() {
    Column(modifier = Modifier.padding(16.dp)) {
        // ← new: The low-level primitive
        Surface(
            tonalElevation = 2.dp,
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Surface: Needs explicit shape", modifier = Modifier.padding(16.dp))
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // ← new: The opinionated component
        Card(
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Text("Card: Built-in shape & semantics", modifier = Modifier.padding(16.dp))
        }
    }
}
```

### Mechanical Walkthrough
* `Card(...)`: A domain-specific container for grouped content. It automatically applies a medium rounded shape and sets up standard semantic boundaries. Without it, you'd reinvent these visual standards manually with `Surface`.
* `CardDefaults.cardElevation(...)`: A specific configuration object for cards. Unlike `Surface` which takes a raw `Dp` value, `Card` expects this object so it can manage different elevations for resting, pressed, and disabled states. Without it, interactive cards wouldn't visually respond to user touch.

### CS Lens
This illustrates **abstraction layering**. `Surface` is the low-level rendering primitive. `Card` is a higher-level semantic component that wraps `Surface` and pre-configures it for a specific use case. This mirrors how `TCP` sits below `HTTP` — you use the higher-level tool when its assumptions match your goal.

### SE Lens
The design principle is **convention over configuration**. `Card` enforces the Material 3 conventions for list items out of the box. The alternative is writing a custom `InventoryItemSurface` composable everywhere. The tradeoff is flexibility: if you need a shape or interaction model that directly conflicts with the Material specification, `Card` will fight you, and you must drop down to `Surface`.

### Run It Yourself
Deploy the `ComponentComparison` to a device. Notice that the `Card` provides a consistent corner radius without you specifying one, inheriting it directly from the M3 shape theme.

---

## Concept Unit: Wrapping the Grid Row

### The Problem
The inventory list currently renders as flat text rows. There is no visual boundary indicating where one item ends and another begins, making it hard to read and failing to communicate that each row can be tapped to view item details.

### The New Code
```kotlin
Card(
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    modifier = Modifier.fillMaxWidth()
) {
    // Existing Row content here
}
```

### The Updated Project
```kotlin
@Composable
fun InventoryList(items: List<InventoryItem>) {
    LazyColumn(
        // padding will be added in the next unit
    ) {
        items(items) { item ->
            // ← new: Card wraps the row
            Card(
                elevation = CardDefaults.cardElevation(
                    defaultElevation = 2.dp,
                    pressedElevation = 8.dp // If clickable
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(item.name)
                    Text("${item.quantity}")
                }
            }
        }
    }
}
```

### Mechanical Walkthrough
* `Card(...) { Row(...) }`: We enclose the existing linear layout (`Row`) inside the volumetric container (`Card`). Without this containment, the row exists flat on the background canvas.
* `modifier = Modifier.fillMaxWidth()`: Applied to the `Card`, forcing it to stretch across the screen. Without it, the card would shrink-wrap tightly around the text, creating jagged, misaligned items in the list.
* `pressedElevation = 8.dp`: If you add a `onClick` handler to the card, this tells the system to raise the card closer to the user when they touch it. Without it, the interaction feels dead.

### CS Lens
This is **composition**. We are not modifying the `Row` to be card-like; we are placing the `Row` inside a `Card`. This separation of concerns means the layout logic (Row) and the presentation/containment logic (Card) remain independent and reusable.

### SE Lens
The design principle is **visual affordance**. An affordance is a property that indicates how an object can be used (like a handle on a door). Elevation is a primary digital affordance for "this is an interactive, discrete object." The alternative is adding explicit "Tap Here" buttons to every row, which wastes screen real estate.

### Run It Yourself
Run the app. The inventory list will now look like a series of distinct, raised rectangles rather than a wall of floating text.

---

## Concept Unit: Spacing Between Cards

### The Problem
Wrapping the items in Cards created a new issue: the cards are touching each other end-to-end. A solid block of elevated cards looks like a single bumpy surface, destroying the grouping we just tried to create.

### The New Code
```kotlin
Spacer(modifier = Modifier.height(8.dp))
```

### The Updated Project
```kotlin
@Composable
fun InventoryList(items: List<InventoryItem>) {
    LazyColumn(
        // ← new: Padding for the entire list
        contentPadding = PaddingValues(16.dp)
    ) {
        items(items) { item ->
            Card(
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Row content...
            }
            // ← new: Gap between items
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}
```

### Mechanical Walkthrough
* `Spacer(modifier = Modifier.height(8.dp))`: Inserted *after* the `Card` inside the `items` block. This forces empty vertical space before the next item renders. Without it, the cards touch edges, nullifying the visual separation.
* `contentPadding = PaddingValues(16.dp)`: Applied to the `LazyColumn` itself. This pushes the *entire* list inward from the screen edges, while still allowing items to scroll underneath the status bar/navigation bar at the extremes. Without it, cards would bleed directly into the physical bezel of the phone.

### CS Lens
This is **spatial layout management**. Rather than telling each card "your absolute position is Y=45", we use a relative flow model. The `Spacer` acts as an invisible block in the layout stream, pushing subsequent elements down dynamically regardless of screen size.

### SE Lens
The design principle is the **Gestalt Law of Proximity**. Objects that are near each other are perceived as a group. By adding space *between* the cards that is larger than the space *inside* the cards (padding), we force the human brain to parse each card as a distinct entity. The alternative is drawing hard border lines, which adds visual noise. The tradeoff is that spacing consumes vertical real estate, meaning fewer items fit on screen.

### Run It Yourself
Run the app. Observe that the cards now float independently. Scroll the list and watch how `contentPadding` provides a margin at the top and bottom of the list without clipping the items mid-scroll.

---

## Connect the Pieces
Let's trace what happens when `InventoryList` renders the string "Widget" on a device in Dark Mode:
1. `LazyColumn` begins layout, applying 16.dp of padding around its viewport (`contentPadding`).
2. It hits the `items` block for "Widget".
3. A `Card` is instantiated. It requests 2.dp of elevation.
4. Because the device is in Dark Mode, the M3 tonal elevation algorithm calculates a slight tint based on the theme's primary color and 2.dp of depth.
5. `Card` delegates to `Surface` to draw this exact tinted background color and apply a rounded corner shape.
6. The `Row` inside the card lays out the text "Widget" with internal padding.
7. Finally, a `Spacer` renders an invisible 8.dp block below the card, ensuring the next item ("Sprocket") won't touch it.

---

## What Breaks Without This
1. Open your `InventoryList` code.
2. Remove the `Spacer` inside the `items` loop.
3. Run the app.
**What goes wrong:** The cards collapse into each other. Because they have the exact same tonal elevation (and thus the exact same background color), the visual boundary between them vanishes entirely. The list looks like one massive, unbroken gray pillar.
4. Restore the `Spacer`.

---

## Exercises
1. Change the `tonalElevation` of the `Card` to `12.dp`. Run in both light and dark modes. Observe how dramatically the color shifts in dark mode at higher elevations. Revert to `2.dp`.
2. Move the `padding(16.dp)` from the `LazyColumn`'s `contentPadding` directly onto a `Modifier.padding(16.dp)` on the `LazyColumn` itself. Scroll the list. Notice how items now clip abruptly before reaching the top or bottom of the screen, ruining the scroll experience. Revert to `contentPadding`.

---

## Definition of Done
- [ ] `LazyColumn` uses `contentPadding` to keep content off the screen edges.
- [ ] Each inventory row is wrapped in a `Card`.
- [ ] The `Card` uses `CardDefaults.cardElevation` to set a base elevation of 2.dp.
- [ ] A `Spacer` separates each card.
- [ ] The code is committed to version control.

```bash
git commit -m "Wrap inventory rows in Cards with tonal elevation

Cards provide crucial visual grouping and interactability cues through 
M3's tonal elevation system, separating items without relying on borders."
```
