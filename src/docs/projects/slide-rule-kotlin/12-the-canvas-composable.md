# Lesson 12: A Surface You Draw On Directly

*(The Canvas Composable — Axes and a Grid)*

**User Story**
> As a user, I want a Graph screen showing real coordinate axes, ready for
> a function to be plotted on next.

**What you will build**
The "graph" route's placeholder `Text` (Lesson 4) is replaced with a real
`Canvas` drawing an x/y axis pair, centered on screen.

**What you need to know first**
Lesson 4's `"graph"` route. Nothing from `../track/` applies directly here —
that course never needed pixel-level drawing; this is genuinely new ground
for both courses.

---

## Concept Unit: `Canvas` and `DrawScope`

### The Problem

Every composable so far describes UI in terms of existing controls
(`Text`, `Button`, `Column`). Drawing a coordinate grid needs something
lower-level: direct control over individual lines and coordinates, the way
`../track/`'s standard `View` system never required for this course's
purposes.

### The New Code

```kotlin
Canvas(modifier = Modifier.fillMaxSize()) {
    val centerX = size.width / 2f
    val centerY = size.height / 2f

    drawLine(
        color = Color.Gray,
        start = Offset(0f, centerY),
        end = Offset(size.width, centerY),
        strokeWidth = 2f
    )
    drawLine(
        color = Color.Gray,
        start = Offset(centerX, 0f),
        end = Offset(centerX, size.height),
        strokeWidth = 2f
    )
}
```

### The Updated Project

```kotlin
composable("graph") {
    Canvas(modifier = Modifier.fillMaxSize()) {   // ← changed: was Text("Graph screen — placeholder")
        val centerX = size.width / 2f
        val centerY = size.height / 2f

        drawLine(
            color = Color.Gray,
            start = Offset(0f, centerY),
            end = Offset(size.width, centerY),
            strokeWidth = 2f
        )
        drawLine(
            color = Color.Gray,
            start = Offset(centerX, 0f),
            end = Offset(centerX, size.height),
            strokeWidth = 2f
        )
    }
}
```

The Graph tab now shows a real horizontal and vertical axis crossing at the
screen's center, replacing Lesson 4's placeholder text entirely.

### Mechanical walkthrough

1. `Canvas(modifier = Modifier.fillMaxSize()) { ... }` — (first appearance)
   a composable whose lambda runs inside a **`DrawScope`** — a receiver
   providing direct drawing operations, rather than composing other
   composables.
2. `size.width` / `size.height` — (first appearance) `DrawScope` properties
   giving the canvas's actual pixel dimensions on the current device —
   used here to find the center point regardless of screen size.
3. `drawLine(color = ..., start = Offset(...), end = Offset(...), strokeWidth = ...)`
   — (first appearance) draws a straight line between two points. `Offset`
   is a simple `(x, y)` pixel-coordinate pair — Compose's 2D point type.
4. `2f` — (hard concept reappearing) Kotlin's `f` suffix marking a `Float`
   literal — `strokeWidth` and `Offset`'s coordinates are `Float`, not
   `Double`, a real distinction: Compose's drawing APIs use `Float`
   throughout for performance reasons (smaller, faster on graphics
   hardware), while this app's calculator math (Lesson 6 onward) uses
   `Double` for precision — Lesson 13 is where these two numeric worlds
   have to be deliberately converted between each other.

### CS Lens

`DrawScope`'s coordinate system has `(0, 0)` at the **top-left**, with `y`
increasing **downward** — the standard convention for essentially every
2D graphics API (this repo's OpenMAT visualiser, HTML `<canvas>`, and
Android's older `View.onDraw(Canvas)` all agree on this), which is the
*opposite* of standard mathematical convention, where `y` increases
upward. This mismatch is not a bug to work around quietly — Lesson 13
names the conversion explicitly, because getting it wrong silently flips
every graph upside down.

### SE Lens

Why does Compose offer a low-level `Canvas` at all, when it also has
higher-level composables for everything else? Because a coordinate plane
with plotted functions has no natural representation as a tree of
buttons and text — direct pixel control is the correct tool exactly when
the content is inherently geometric, not a UI layout problem. Reaching
for `Canvas` for ordinary UI (buttons, forms) instead of Compose's normal
composables would be the wrong instinct — `Canvas` is reserved, in this
app, for the graph screen alone.

### Connection

Lesson 13 draws an actual function inside this exact `Canvas`, converting
real `(x, f(x))` math values into `Offset` pixel coordinates using
`centerX`/`centerY` established here as the origin.

---

## Closing

### Connect the pieces

`Canvas` (this lesson) provides a `DrawScope` with direct access to the
screen's real pixel dimensions (`size.width`/`size.height`). Two
`drawLine` calls, using those dimensions to find the center, draw a
horizontal and vertical axis — the graph screen's foundation every
remaining Epic 4 and Epic 6 lesson draws on top of.

### What breaks without this

Swap `size.width`/`size.height` for hardcoded pixel values (e.g., `400f`,
`800f`) instead of reading them from `size`. Real, observable failure: the
axes render correctly on one specific screen size and visibly off-center
on any other — run the app on a device or emulator with a different
screen resolution than whatever the hardcoded numbers assumed, and the
crossing point is no longer centered. Restore `size.width`/`size.height`
and it's correct on every screen size again.

### Exercises

- Add tick marks: several short vertical `drawLine` calls along the
  horizontal axis, evenly spaced.
- Change `strokeWidth` to `1f` and `8f` and observe the visual difference —
  connect this to why `2f` was chosen as a reasonable default.

### Definition of done

- [ ] The Graph screen shows a centered horizontal and vertical axis.
- [ ] Axes remain centered on different screen sizes (verify in more than
      one emulator size if possible).
- [ ] You can explain, concretely, why `DrawScope`'s `y` axis points down
      and why that matters for the next lesson.
- [ ] Commit: `git commit -m "Add a Canvas-drawn coordinate axis to the Graph screen"`.
