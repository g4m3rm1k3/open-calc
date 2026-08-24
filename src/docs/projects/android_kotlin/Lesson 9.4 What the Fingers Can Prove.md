# Lesson 9.4: What the Fingers Can Prove

**What you will build.** This project's own real `GraphScreen` becomes
genuinely interactive for the first time: dragging pans the view,
pinching zooms it, both changing the exact same real screen transform
already built for a fixed origin and scale. The transferable problem
underneath it: a real touch surface reports a continuous stream of raw
pointer movements, not "the user dragged" or "the user pinched" —
turning that raw stream into one small, well-defined change to a
project's own state is a real, general problem every touch-driven
feature eventually has to solve, independent of what the state actually
represents.

**What you need to know first.** This project's own real `GraphScreen`,
`Point`/`sample`/`evaluateAt`, `toScreenPoints`, and `buildGraphPath` —
all already real, permanent code. `remember`/`mutableStateOf` and the
`by` property-delegate syntax already used for this project's own
calculator state. `data class` and `Offset` — both already established.

## Terms used in this lesson

- **Gesture** — a real, recognized pattern in a stream of raw pointer
  events — a drag, a pinch, a tap — identified by a framework's own
  gesture-detection code so that a project never has to interpret raw
  touch coordinates by hand. It exists because a real touch screen only
  ever reports "a finger is now at this pixel"; every higher-level idea
  like "the user is dragging" has to be recognized from a sequence of
  those low-level reports, a real, nontrivial job worth a shared,
  reusable name.
- **`pointerInput` modifier** — a real Compose UI modifier that opens a
  block of code with direct access to a composable's own raw, real
  pointer events. It exists as the entry point every real gesture
  detector needs — without it, a composable receives no touch
  information at all beyond ordinary clicks.
- **`detectDragGestures`** — a real, standard-library gesture detector
  recognizing a single continuous drag: one finger going down, moving,
  and lifting. It exists so a project never has to hand-write the real,
  fiddly logic of tracking one pointer's own position across many
  events itself.
- **`detectTransformGestures`** — a real, standard-library gesture
  detector recognizing pan, zoom, and rotation together, from either one
  or several real fingers at once. It exists because pan and zoom are
  not actually two separate gestures at the framework level — both come
  from the same real, general computation over however many fingers are
  currently touching the screen, so one detector handles both instead of
  two redundant ones.
- **Touch slop** — a real, small, fixed pixel distance a pointer has to
  move before a drag gesture starts being reported at all. It exists so
  an ordinary tap — a finger going down and up again with a tiny,
  unintentional wobble in between — is never misrecognized as the start
  of a real drag.
- **Centroid** — the real, single point representing the average
  position of every finger currently touching the screen at once. It
  exists because a multi-finger gesture needs one real reference point
  to measure pan and zoom relative to, not one point per finger.
- **Pan** (as a gesture value) — the real distance a gesture's own
  centroid has moved since the last reported event. It exists as the
  general form of a drag: a single finger's own movement is just a
  one-finger centroid's own pan.
- **Zoom factor** — a real, multiplicative number describing how much
  closer together or further apart a gesture's fingers have moved since
  the last reported event: greater than `1.0` for fingers spreading
  apart, less than `1.0` for fingers moving together, exactly `1.0` for
  no change. It exists because "the fingers moved apart" has to become
  one real number a scale value can actually be multiplied by.
- **Pointer ID** — a real, stable integer identifying one specific
  finger across an entire gesture, even while several fingers are down
  at once. It exists because a real multi-touch event stream has to say
  *which* finger moved, not just that some finger did.
- **`data class`** (reappearing) — a class modifier telling the compiler
  to generate real `equals`, `hashCode`, `toString`, and `copy`
  implementations directly from the properties listed in its primary
  constructor.
- **`Float`** (reappearing) — a 32-bit floating-point numeric type;
  every real value a gesture reports — pan, zoom, a raw pointer
  coordinate — is one.
- **`Double`** (reappearing) — a 64-bit floating-point numeric type;
  this project's own real transform math has always used it.
- **`by` property delegation** (reappearing) — the syntax `var x by
  remember { ... }`, letting a property read and write through
  `remember`'s own stored value directly, without writing `.value`
  everywhere the property is used. It exists so state that changes over
  time reads exactly like an ordinary mutable variable at every use
  site, while still being real, Compose-tracked, recomposition-safe
  state underneath.

## Objects and methods used

This lesson's own subject — recognizing a drag and a pinch, and turning
each into a real change to this project's own screen transform — is
built from this project's own new function and real Compose gesture
APIs, not a single external class, so it has no entry of its own here.
Every real class or method this lesson's new code actually calls is
supporting cast, listed below under one trailing heading.

### Everything else in the file, not this lesson's subject but still explained

- **`Modifier.pointerInput`**
  - *What it is:* A real Compose UI modifier granting a block of
    suspending code direct, low-level access to a composable's own raw
    pointer events.
  - *Implementation:*
    `androidx.compose.ui.input.pointer.pointerInput(key1: Any?, block:
    suspend PointerInputScope.() -> Unit): Modifier` — the given `block`
    runs inside a real `PointerInputScope`, restarted only when `key1`
    itself changes between recompositions.
  - *Its use:* both this lesson's own throwaway labs and its real,
    permanent `GraphScreen` attach one to their own `Canvas`, passing
    `Unit` as `key1` since the gesture-handling logic itself never
    needs to change.
  - *Type:* an extension function on `Modifier`.
  - *Responsibility:* opening a real channel of raw pointer events to
    whatever gesture-detection code is given to it, and keeping that
    channel alive across recompositions unless its own key changes.
  - *Depends on:* the `Modifier` chain it's called on, and a `key1`
    controlling when its own block restarts.
  - *Connects to:* called directly on a `Canvas`'s own `Modifier`; the
    real `detectDragGestures`/`detectTransformGestures` calls inside its
    block are what actually interpret the raw events it provides.
  - *Shape:* the one real entry point between raw Android touch input
    and any of this project's own gesture-handling code — nothing in
    Compose can react to a finger at all without going through it.
- **`detectDragGestures`**
  - *What it is:* A real, standard-library suspending function that
    recognizes one continuous single-finger drag and reports it,
    incrementally, as it happens.
  - *Implementation:*
    `androidx.compose.foundation.gestures.detectDragGestures(onDrag:
    (change: PointerInputChange, dragAmount: Offset) -> Unit)` — called
    from inside a real `PointerInputScope`; internally watches raw
    pointer events, waits for the real touch-slop threshold (full
    treatment in Terms, above) to be crossed, and from then on calls
    `onDrag` once per real pointer movement, each time with the real
    incremental `Offset` moved since the previous call.
  - *Its use:* this lesson's own first isolated lab uses this to prove
    real drag detection works at all, before this project's own real
    `GraphScreen` moves on to the more general
    `detectTransformGestures`.
  - *Type:* a top-level, suspending function.
  - *Responsibility:* turning a real stream of raw pointer events into a
    real sequence of incremental drag-distance callbacks, handling touch
    slop and pointer tracking so calling code never has to.
  - *Depends on:* a real `PointerInputScope` to run inside, and an
    `onDrag` callback to report each real movement to.
  - *Connects to:* called inside a `pointerInput` block; its own
    `onDrag` callback is where this lesson's own lab code reads each
    real `dragAmount`.
  - *Shape:* a focused, single-purpose gesture detector — real,
    reusable recognition logic sitting between raw touch events and a
    project's own, much simpler "what does a drag mean here" logic.
- **`detectTransformGestures`**
  - *What it is:* A real, standard-library suspending function
    recognizing pan, zoom, and rotation together, from one or more real
    fingers.
  - *Implementation:*
    `androidx.compose.foundation.gestures.detectTransformGestures(onGesture:
    (centroid: Offset, pan: Offset, zoom: Float, rotation: Float) ->
    Unit)` — called from inside a real `PointerInputScope`; calls
    `onGesture` repeatedly as real pointers move, computing a real
    `centroid` (full treatment in Terms, above), `pan` (full treatment
    in Terms, above), `zoom` (a real multiplicative `Float`, full
    treatment in Terms, above), and `rotation` (a real angle in
    degrees, unused by this lesson's own code) from however many real
    fingers are currently down.
  - *Its use:* this lesson's own second isolated lab, and this project's
    own real, permanent `GraphScreen`, both use this — a single finger
    produces `pan` with `zoom` staying at `1.0`; two fingers spreading
    apart or together produce real, nonzero `zoom` alongside `pan`.
  - *Type:* a top-level, suspending function.
  - *Responsibility:* computing one real, combined pan/zoom/rotation
    update per real gesture event, from however many fingers are
    actually touching the screen, and reporting it through one callback.
  - *Depends on:* a real `PointerInputScope`, and an `onGesture`
    callback to report each real update to.
  - *Connects to:* called inside a `pointerInput` block; this lesson's
    own real `GraphScreen` calls this project's own new `applyGesture`
    function directly inside its `onGesture` callback.
  - *Shape:* a more general real gesture detector than
    `detectDragGestures` — the same real seam between raw touch input
    and project logic, generalized to cover multi-finger input too.
- **`Offset`** (reappearing)
  - *What it is:* A real, immutable data type representing one 2D pixel
    location or displacement.
  - *Implementation:* `androidx.compose.ui.geometry.Offset(x: Float, y:
    Float)` — a real constructor taking two `Float`s; supports real
    operator overloads for `+` (combining two offsets) and `*` (scaling
    one by a number).
  - *Its use:* every real gesture value this lesson works with — a
    `dragAmount`, a `pan`, a `panOffset` accumulated over time — is one.
  - *Type:* an immutable value class.
  - *Responsibility:* holding exactly one real 2D value, as two
    `Float`s, and supporting real arithmetic directly on that value.
  - *Depends on:* the two `Float` values given to its constructor.
  - *Connects to:* produced by `detectDragGestures`/
    `detectTransformGestures`; accumulated into this project's own real
    `GraphTransform`.
  - *Shape:* the same real, shared coordinate type this project's own
    `Canvas`-drawing code already depends on, reused here for gesture
    math instead of drawing.
- **`performTouchInput`**
  - *What it is:* A real Compose UI testing function letting a test
    inject synthetic, real touch events directly into a composable under
    test.
  - *Implementation:*
    `androidx.compose.ui.test.performTouchInput(block: TouchInjectionScope.()
    -> Unit): Unit` — the real `TouchInjectionScope` it provides exposes
    `down(pointerId, position)`, `moveTo(pointerId, position)`,
    `moveBy(pointerId, delta)`, and `up(pointerId)`, each corresponding
    to one real, synthetic touch event, with `pointerId` defaulting to
    `0` when a test only ever touches with one finger at a time.
  - *Its use:* every real test in this lesson calls this to simulate a
    real drag (one pointer) or a real pinch (two pointers, tracked by
    separate real pointer IDs) without any physical device or emulator.
  - *Type:* a real Compose UI testing extension function.
  - *Responsibility:* translating a sequence of real, described touch
    actions into the same real, low-level pointer events an actual touch
    screen would produce, and delivering them to the composable under
    test.
  - *Depends on:* a real `SemanticsNodeInteraction` (found via
    `onNodeWithTag`) identifying which composable to send the events to.
  - *Connects to:* called on the result of `onNodeWithTag`; the real
    events it injects are what `pointerInput`'s own
    `detectDragGestures`/`detectTransformGestures` actually receive and
    interpret, on the other end.
  - *Shape:* a real, genuine substitute for physical touch input —
    confirmed, this session, to actually drive real gesture-detection
    code, not just simulate a click.

---

## Concept Unit: Detecting a Drag

### The Problem

This project's own real `GraphScreen` draws a real curve, but nothing
about it responds to touch — the exact same fixed origin gets computed
from `Canvas`'s own real size every single time, no matter what a real
user does with their finger. A real touch screen reports raw pointer
positions, one event at a time; nothing built so far turns "a finger
moved from here to here" into anything this project's own code can use.

Before reading on: if a real finger goes down, moves a tiny,
unintentional amount, and lifts again — the ordinary wobble in any real
tap — should that count as the start of a drag? If a drag is a
continuous, ongoing action, does it make more sense for a project to be
told the drag's own total distance just once, when the finger finally
lifts, or the *incremental* distance moved since the last update, many
times while the finger is still down? Given this project's own real
`Canvas` composable can already read raw drawing information from a
`DrawScope` receiver, do you expect touch information to arrive through
that same receiver, or somewhere else entirely?

### Introduce the Concept in Isolation

The following throwaway lab, added to this project's own real source
tree — gesture detectors, like `Canvas` itself, only compile and run
through the real Compose compiler plugin — defines a real, temporary
box tracking its own total real drag distance:

```kotlin
@Composable
fun LabDragBox() {
    var dragTotal by remember { mutableStateOf(Offset.Zero) }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .testTag("dragBox")
            .background(Color.Gray)
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    dragTotal += dragAmount
                    labLastDragTotal.value = dragTotal
                }
            }
    )
}

val labLastDragTotal = mutableStateOf(Offset.Zero)
```

Exercised by a real, temporary Robolectric test injecting a real,
synthetic drag:

```kotlin
@Test
fun draggingRealPointerInputUpdatesRealDragTotal() {
    composeTestRule.setContent { LabDragBox() }

    composeTestRule.onNodeWithTag("dragBox").performTouchInput {
        down(Offset(50f, 50f))
        moveBy(Offset(300f, 200f))
        up()
    }
    composeTestRule.waitForIdle()

    println("labLastDragTotal = ${labLastDragTotal.value}")
    assertEquals(300f, labLastDragTotal.value.x, 20f)
    assertEquals(200f, labLastDragTotal.value.y, 20f)
}
```

Run for real:

```
labLastDragTotal = Offset(286.7, 191.1)
BUILD SUCCESSFUL in 14s
```

This output proves real drag detection genuinely works, end to end,
with no physical device: a real, synthetic finger going down at
`(50, 50)`, moving by a real `(300, 200)`, and lifting, really did
produce a real, accumulated `dragTotal` close to `(300, 200)` — not
exactly equal, and that gap is itself real, meaningful evidence, not
noise: a second real run using a smaller raw move, `(30, 20)`, produced
`(16.7, 11.1)` — the identical real shortfall, `(13.3, 8.9)`, in both
cases, regardless of how far the real drag actually traveled. That
fixed, repeatable shortfall is **touch slop** (full treatment in Terms,
above), consumed once, right at the start of the real gesture, before
`onDrag` ever gets called for the first time.

### Discard the Throwaway Example

`LabDragBox`, `labLastDragTotal`, and the real test exercising them are
all deleted. Neither appears in the real project. This project's own
real `GraphScreen` uses the more general `detectTransformGestures`
instead, this lesson's own next unit's subject.

### Mechanical Walkthrough

Every distinct syntactic element in the lab above, in the order it
appears:

- `var dragTotal by remember { mutableStateOf(Offset.Zero) }` — the real
  **`by` property delegation** (full treatment in Terms, above): `var`
  declares a real, reassignable property; `remember`/`mutableStateOf`
  (already established) create the real, Compose-tracked backing state;
  `by` lets every later read or write of `dragTotal` go straight through
  to that state's own value, with no explicit `.value` needed. `Offset.
  Zero` is a real, pre-defined constant — the real `Offset(0f, 0f)`.
- `Box(modifier = ...)` — the real, already-established `Box` composable,
  here only as a real, minimal surface for the gesture modifier to
  attach to; this lab needs no `Canvas`, since dragging is about
  receiving input, not drawing output.
- `.fillMaxSize()` and `.testTag("dragBox")` — both already established,
  reused here identically.
- `.background(Color.Gray)` — a real, standard `Modifier` giving the box
  a real, visible fill color; used here only so a real device would show
  something to actually drag, not load-bearing for this lab's own real
  proof.
- `.pointerInput(Unit) { ... }` — calls the real **`Modifier.
  pointerInput`** (full treatment above) with the literal `Unit` as its
  key, opening the block that follows to real, raw pointer events.
- `detectDragGestures { change, dragAmount -> ... }` — calls the real
  **`detectDragGestures`** (full treatment above); its own trailing
  lambda names two real parameters, `change` (a real
  `PointerInputChange`, this project's own code only ever calls
  `.consume()` on it) and `dragAmount` (a real, incremental `Offset`).
- `change.consume()` — a real call telling Compose this lab's own code
  has fully handled this pointer event, so nothing else downstream
  tries to also interpret the same real touch as a different gesture.
- `dragTotal += dragAmount` — uses the real `+` operator overload on
  `Offset` (full treatment above) to accumulate this event's own real
  incremental movement into the running real total.
- `labLastDragTotal.value = dragTotal` — writes the current real total
  into a second, package-level `mutableStateOf`, existing only so this
  lab's own real test, running outside the composable itself, can read
  the real, current value.

### CS Lens

This is **gesture recognition** — the general CS idea of turning a real,
continuous, low-level input stream (raw pointer positions, arriving
many times a second) into discrete, higher-level, named events (a drag
started; a drag moved by this much; a drag ended).

```
Also recognized in: speech recognition turning a raw audio
waveform into discrete words, a compiler's own lexer turning raw
characters into discrete tokens, a motion sensor's own step-
counting algorithm turning raw accelerometer readings into
discrete "step taken" events
```

Every one of these systems shares the same real shape: a lower layer
handles genuinely difficult, continuous, noisy real-world input, so a
higher layer can work with clean, discrete, already-interpreted events
instead.

### SE Lens

The design choice worth naming here is Compose providing a real,
separate `detectDragGestures` at all, instead of leaving every project
to hand-write its own raw-pointer-event interpretation from scratch. The
alternative — reading raw `PointerInputChange` events directly and
manually tracking touch slop, pointer identity, and drag state — is
real, possible, and exactly what `detectDragGestures` itself does
internally; every project that used it directly would need to get touch
slop's own real threshold right, correctly, independently, with real
risk of subtly different behavior between different projects doing the
same real job. One shared, real, tested detector means every app built
on it, this one included, gets identical, correct drag recognition for
free. The honest cost, worth naming precisely because of what this
unit's own lab just proved: a caller has no control over touch slop's
own real value, and has to accept a small, real, unavoidable gap between
raw finger movement and reported drag distance as the price of that
shared correctness.

### Commands Needed

```
./gradlew :app:testDebugUnitTest --tests "com.example.calculator.LabGesture94Test"
```

Compiles this lab through the real Compose compiler plugin and runs its
own real, temporary Robolectric test, the same combined compile-and-test
pattern this project has used for every Compose concept lab since Lesson
1.2.

### Run It

```
labLastDragTotal = Offset(286.7, 191.1)
BUILD SUCCESSFUL in 14s
```

Real, saved in `verification/9.4/lab1_2_gesture.kt`,
`verification/9.4/lab1_2_gesture_test.kt`, and
`verification/9.4/lab1_2_output.txt`.

### Connect the Pieces

This unit proved real, single-finger drag detection works, and found a
real, repeatable quirk — touch slop — worth knowing before this
project's own real code depends on it. Nothing here yet involves more
than one finger at once; the next unit is what a real pinch actually
needs.

---

## Concept Unit: Detecting a Pinch

### The Problem

`detectDragGestures`, this lesson's own first unit, only ever tracks one
real finger. Zooming a graph is a fundamentally two-finger gesture — a
pinch — and nothing built so far can even represent a second,
simultaneous real touch, let alone compute how far apart two fingers
have moved relative to each other.

Before reading on: if two real fingers are both touching the screen at
once, and the code handling touch needs to know which reported position
belongs to which finger, what real piece of information would it need
to tell them apart? If two fingers start `100` real pixels apart and
end up `200` real pixels apart, what single real number would you
compute to describe "how much bigger" that gap became? Does that number
depend at all on *where* on the screen the two fingers actually are, or
only on the real distance between them?

### Introduce the Concept in Isolation

The following throwaway lab, added to the same real, temporary file as
the last unit's lab, defines a real, temporary box tracking its own
total real zoom factor:

```kotlin
val labLastZoom = mutableStateOf(-1f)

@Composable
fun LabPinchBox() {
    var zoomTotal by remember { mutableStateOf(1f) }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .testTag("pinchBox")
            .background(Color.Gray)
            .pointerInput(Unit) {
                detectTransformGestures { _, _, zoom, _ ->
                    zoomTotal *= zoom
                    labLastZoom.value = zoomTotal
                }
            }
    )
}
```

Exercised by a real, temporary Robolectric test injecting a real,
synthetic two-finger pinch, each finger tracked by its own real pointer
ID:

```kotlin
@Test
fun pinchingRealTwoFingerPointerInputUpdatesRealZoom() {
    composeTestRule.setContent { LabPinchBox() }

    composeTestRule.onNodeWithTag("pinchBox").performTouchInput {
        down(0, Offset(100f, 100f))
        down(1, Offset(200f, 200f))
        moveTo(0, Offset(50f, 50f))
        moveTo(1, Offset(250f, 250f))
        up(0)
        up(1)
    }
    composeTestRule.waitForIdle()

    println("labLastZoom = ${labLastZoom.value}")
    assert(labLastZoom.value > 1f) { "expected zoom > 1f, was ${labLastZoom.value}" }
}
```

Run for real:

```
labLastZoom = 2.0
BUILD SUCCESSFUL in 13s
```

This output proves two real things at once. First, this project's own
tooling really can simulate genuine multi-touch — two real, separate
pointer IDs, `0` and `1`, tracked independently through their own real
`down`/`moveTo`/`up` calls — and have `detectTransformGestures` actually
recognize it as one combined real gesture, not two unrelated single-
finger touches; this refines a real, standing limitation this project's
own earlier work had already noted (that genuine multi-touch couldn't be
verified), discovered only because this session actually tried it rather
than assuming the old note still held. Second, the real, reported zoom
factor is exactly `2.0` — no touch-slop-style shortfall this time — which
is exactly correct: the two fingers started a real `141.4` pixels apart
(`(100,100)` to `(200,200)`) and ended a real `282.8` pixels apart
(`(50,50)` to `(250,250)`), and `282.8 / 141.4` is `2.0`. This is called
computing a real **zoom factor** (full treatment in Terms, above) from a
gesture's own **centroid** (full treatment in Terms, above) and the
changing real distance between its own fingers.

### Discard the Throwaway Example

`LabPinchBox` and the real test exercising it are both deleted. Neither
appears in the real project. A real, permanent version — wired into this
project's own real `GraphScreen`, and combined with real drag/pan
handling in one call — is built in this lesson's own next unit.

### Mechanical Walkthrough

Beyond what the last unit's own lab already fully explained (`by`
property delegation, `Box`, `.fillMaxSize()`/`.testTag()`/`.background()`,
`.pointerInput(Unit) { ... }`) — every element genuinely different in
this real version:

- `val labLastZoom = mutableStateOf(-1f)` — a package-level real state
  property, its initial value `-1f` deliberately chosen as something no
  real zoom factor (always positive) could ever equal, so a test can
  tell "never updated" apart from any real, computed result.
- `var zoomTotal by remember { mutableStateOf(1f) }` — a real, `by`-
  delegated property starting at `1f`, the real zoom factor meaning
  "unchanged," the correct starting point for something meant to
  *accumulate* zoom over many real gesture events.
- `detectTransformGestures { _, _, zoom, _ -> ... }` — calls the real
  **`detectTransformGestures`** (full treatment above); its own trailing
  lambda names four real parameters, with `_` used for the three this
  lab's own code doesn't need (`centroid`, `pan`, `rotation`) and `zoom`
  named directly, the one real value this lab actually reads.
- `zoomTotal *= zoom` — uses the real `*=` compound-assignment operator,
  multiplying the running real total by this event's own real,
  incremental zoom factor — multiplicative accumulation, not additive,
  because zoom factors compose by multiplying (doubling twice means
  four times as big, not twice as big).
- `labLastZoom.value = zoomTotal` — the identical real pattern the last
  unit's own lab already used, writing the current real total somewhere
  this lab's own test can read it from outside the composable.

### CS Lens

This is a real, concrete instance of computing a **scale factor from a
changing distance** — a specific application of the same general CS
idea of **normalization by a reference measurement**, used any time a
system needs "how much has this changed, proportionally" rather than
just "by how much, in absolute terms."

```
Also recognized in: a map application's own pinch-to-zoom,
camera software computing digital zoom from two-finger spread,
audio software normalizing volume relative to a reference level,
image scaling algorithms computing a resize ratio from an
original and a target dimension
```

Every one of these computes the same real shape of number this lab just
did — a ratio between a current measurement and a reference one — even
though the actual quantities being measured (pixels, decibels,
dimensions) are all completely different.

### SE Lens

The design choice worth naming here is `detectTransformGestures`
reporting one, real, combined `zoom: Float` rather than the two raw
finger positions and leaving the ratio computation to calling code. The
alternative — handing back both fingers' own real, raw coordinates and
letting each project compute its own distance ratio — would work, but
would mean every project doing pinch-to-zoom re-deriving the identical
real geometry (distance-between-two-points, then a ratio) independently,
with real risk of getting the edge cases (a finger lifting mid-gesture,
a third finger joining) subtly wrong in slightly different ways each
time. Reporting one, already-computed real `zoom` value means this
project's own code, this lesson's own next unit, never has to reason
about raw finger coordinates at all — only about "the fingers got this
much closer or further apart," a real problem correctly solved once, by
Compose itself, not the same real problem solved differently everywhere
it comes up.

### Commands Needed

```
./gradlew :app:testDebugUnitTest --tests "com.example.calculator.LabGesture94Test"
```

The same real, combined compile-and-test command already covered in
this lesson's first unit; `pinchingRealTwoFingerPointerInputUpdatesRealZoom`
is the second of the two real tests it runs.

### Run It

```
labLastZoom = 2.0
BUILD SUCCESSFUL in 13s
```

Real, saved in `verification/9.4/lab1_2_gesture.kt`,
`verification/9.4/lab1_2_gesture_test.kt`, and
`verification/9.4/lab1_2_output.txt`.

### Connect the Pieces

Both real gestures this project's graph needs — a single-finger drag and
a real two-finger pinch — have now been proven, separately, in
isolation: a real `Offset` for drag, a real `Float` for zoom. Neither
has touched this project's own real `GraphScreen` yet. The next unit
combines both into one real, permanent change.

---

## Concept Unit: Making the Graph Respond to Touch

### The Problem

This project's own real `GraphScreen` still computes its origin from
nothing but `Canvas`'s own real, current size, every single time,
exactly as it has since it was first built — a real, fixed graph, not
an interactive one. This lesson's own first two units proved drag and
pinch detection work; nothing has yet turned either into an actual
change to what this project's own graph actually shows.

Before reading on: this project's own real `toScreenPoints` already
takes an `originX`, an `originY`, and a `scale` as real parameters —
given that, what real, minimal new piece of state would `GraphScreen`
need to hold, so a real drag or pinch could change what gets passed into
those exact same parameters, without changing `toScreenPoints` itself
at all? If both a drag's own `pan` and a pinch's own `pan`/`zoom` come
from the identical real `detectTransformGestures` callback, does this
project still need `detectDragGestures` anywhere in its own real,
permanent code, or only in this lesson's own first, discarded lab? Given
this project's own established practice of keeping transform math free
of `DrawScope`, would you expect the *logic* deciding how a gesture
changes the graph's own origin and scale to live inside the real
`Canvas`'s own drawing lambda, or somewhere else?

### Introduce the Concept in Isolation

Both of this lesson's own real gesture mechanisms — `detectDragGestures`
and `detectTransformGestures` — were already proven correct, separately,
in this lesson's own first two units. What's still unproven is the one,
small, genuinely new piece: a pure function turning a gesture's own real
pan and zoom into a real, updated transform, with no `Canvas` or gesture
detector involved at all:

```kotlin
data class GraphTransform(val panOffset: Offset, val scale: Double)

fun applyGesture(current: GraphTransform, pan: Offset, zoom: Float): GraphTransform =
    GraphTransform(current.panOffset + pan, current.scale * zoom)
```

Exercised directly — no Compose, no Robolectric, no gesture detector,
this project's own established pattern for keeping transform math
independently testable:

```kotlin
@Test
fun applyGestureAccumulatesRealPanAndMultipliesRealScale() {
    // Arrange
    val current = GraphTransform(Offset(10f, 5f), 20.0)

    // Act
    val updated = applyGesture(current, pan = Offset(3f, -2f), zoom = 1.5f)

    // Assert
    assertEquals(GraphTransform(Offset(13f, 3f), 30.0), updated)
}
```

Run for real:

```
BUILD SUCCESSFUL
```

This output proves `applyGesture`'s own real math directly, with exact,
hand-checkable numbers: a starting pan of `(10, 5)` plus a gesture's own
real `(3, -2)` becomes exactly `(13, 3)`; a starting scale of `20.0`
times a real zoom of `1.5` becomes exactly `30.0` — real, ordinary
addition and multiplication, nothing hidden. Because this test needed no
`Canvas`, no gesture detector, and no Robolectric at all, it runs in a
real fraction of a second, the same real advantage this project's own
`sample`/`evaluateAt` tests already have.

### Discard the Throwaway Example

Nothing here is discarded — `GraphTransform` and `applyGesture`, unlike
every other lab in this lesson, are written directly as real, permanent
code the first time, since neither depends on anything Compose-specific
that would make a throwaway version meaningfully different from the real
one.

### Project Change

- **Reference Source:** No reference counterpart — `GraphTransform` and
  `applyGesture` are from-scratch additions, motivated by this lesson's
  own first two units' already-proven gesture mechanisms; wiring them
  into `GraphScreen` is a from-scratch modification to this project's
  own existing real screen.
- **Files affected:**
  `app/src/main/java/com/example/calculator/Graphing.kt` (adds
  `GraphTransform`, `applyGesture`) and
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modifies
  `GraphScreen`).
- **Change type:** add (`Graphing.kt`) and replace (`GraphScreen`'s own
  state and `Canvas` block).
- **Location:** `GraphTransform`/`applyGesture` are added directly after
  the existing `toScreenPoints`, in `Graphing.kt`. `GraphScreen`'s own
  single `remember`ed value replaces its previous fixed-origin logic,
  and its `Canvas`'s own `Modifier` gains a new `pointerInput` block.
- **Dependencies:** this project's own real, already-used `Offset` type
  — no new Gradle dependency.

### The New Code

```kotlin
data class GraphTransform(val panOffset: Offset, val scale: Double)

fun applyGesture(current: GraphTransform, pan: Offset, zoom: Float): GraphTransform =
    GraphTransform(current.panOffset + pan, current.scale * zoom)
```

### The Updated Project

`Graphing.kt`, with `toScreenPoints` unchanged above it and this unit's
own new code added directly after:

```kotlin
36  fun toScreen(point: Point, originX: Int, originY: Int, scale: Double): ScreenPoint =
37      ScreenPoint(toScreenX(point.x, originX, scale), toScreenY(point.y, originY, scale))
38
39  fun toScreenPoints(points: List<Point>, originX: Int, originY: Int, scale: Double): List<ScreenPoint> =
40      points.map { point -> toScreen(point, originX, originY, scale) }
41
42  data class GraphTransform(val panOffset: Offset, val scale: Double)  // ← new
43
44  fun applyGesture(current: GraphTransform, pan: Offset, zoom: Float): GraphTransform =  // ← new
45      GraphTransform(current.panOffset + pan, current.scale * zoom)
```

`MainActivity.kt`'s own `GraphScreen`, with its real, permanent gesture
wiring:

```kotlin
113  @Composable
114  fun GraphScreen() {
115      val tree = remember { buildTree(toPostfix(tokenize("x×x"))) }
116      val points = remember { sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100) }
117      var transform by remember { mutableStateOf(GraphTransform(Offset.Zero, 20.0)) }  // ← changed
118      Canvas(
119          modifier = Modifier
120              .fillMaxSize()
121              .testTag("graphCanvas")
122              .pointerInput(Unit) {  // ← new
123                  detectTransformGestures { _, pan, zoom, _ ->
124                      transform = applyGesture(transform, pan, zoom)
125                  }
126              }
127      ) {
128          val originX = (size.width / 2 + transform.panOffset.x).toInt()  // ← changed
129          val originY = (size.height / 2 + transform.panOffset.y).toInt()  // ← changed
130          val screenPoints = toScreenPoints(points, originX, originY, transform.scale)  // ← changed
131          drawPath(buildGraphPath(screenPoints), color = Color.Blue, style = Stroke(width = 4f))
132      }
133  }
```

`tree`/`points` (lines 115–116) are completely untouched — this
project's own real sampling still works exactly as it did. `transform`
(line 117) replaces what used to be nothing at all — the previous
version had no persistent origin/scale state, only ever computing a
fixed origin fresh on every draw — now holding one real `GraphTransform`,
starting at no pan and a scale of `20.0`, the same real starting scale
this project's `GraphScreen` has always used. The new
`.pointerInput(Unit) { ... }` block (lines 122–126) is genuinely new: it
calls the real `detectTransformGestures` this lesson's own second unit
already proved, and its own trailing lambda calls this unit's own real
`applyGesture` directly, reassigning `transform` to whatever real,
updated value comes back. Lines 128–130 read `transform.panOffset`/
`transform.scale` instead of the fixed values `GraphScreen` used before
this lesson, so every real, subsequent draw reflects whatever real
gestures have happened so far.

### Mechanical Walkthrough

Every distinct syntactic element in this unit's own New Code, in the
order it appears:

- `data class GraphTransform(val panOffset: Offset, val scale: Double)`
  — a real **`data class`** (full treatment in Terms, above) holding two
  **`val`**-declared, read-only properties: a real `Offset` (already
  established) and a real `Double` (already established), together
  naming everything this project's own graph needs to know about how it
  should currently be drawn.
- `fun applyGesture(current: GraphTransform, pan: Offset, zoom: Float):
  GraphTransform = GraphTransform(current.panOffset + pan,
  current.scale * zoom)` — an expression-body function taking the
  current real `GraphTransform` plus this event's own real `pan`/`zoom`,
  and returning a brand-new `GraphTransform` — never modifying `current`
  itself. `current.panOffset + pan` uses the real `+` operator overload
  on `Offset` (already established) to accumulate the real pan;
  `current.scale * zoom` uses the real `*` operator, multiplying a real
  `Double` by a real `Float` — Kotlin resolves this through `Double`'s
  own real operator overload accepting a `Float` right-hand side,
  producing a real `Double` result, the same type `scale` already is.
- `var transform by remember { mutableStateOf(GraphTransform(Offset.Zero,
  20.0)) }` — the same real **`by` property delegation** (full treatment
  in Terms, above) this lesson's own first two labs already used,
  holding one real `GraphTransform` instead of two separate properties.
- `.pointerInput(Unit) { detectTransformGestures { _, pan, zoom, _ ->
  transform = applyGesture(transform, pan, zoom) } }` — calls the real
  **`Modifier.pointerInput`** and **`detectTransformGestures`** (both
  full treatment above); the trailing lambda ignores `centroid` and
  `rotation` (both `_`), reads `pan`/`zoom`, and reassigns `transform` to
  this unit's own `applyGesture`'s real return value — the one real
  place this whole project mutates `transform` at all.
- `val originX = (size.width / 2 + transform.panOffset.x).toInt()` and
  `val originY = (size.height / 2 + transform.panOffset.y).toInt()` —
  each reads the real `DrawScope.size` property (already established),
  divides by `2` to find the real center, and now also adds
  `transform.panOffset`'s own real `x`/`y` before converting to `Int`
  — a real screen centered on whatever real space it occupies, then
  shifted by however far a real finger has dragged it.
- `val screenPoints = toScreenPoints(points, originX, originY,
  transform.scale)` — calls this project's own already-established
  `toScreenPoints`, passing `transform.scale` — a real, currently
  live `Double` that changes with every real pinch — where a fixed
  literal `20.0` used to be the only option.

### CS Lens

This whole unit is a real, working instance of the general
**model-update-view** shape: a real, external event (a gesture) produces
a pure, deterministic update to a project's own model (`applyGesture`
computing a new `GraphTransform`), which a completely separate rendering
step (`GraphScreen`'s own `Canvas` block) then reads to produce whatever
gets drawn — the update logic and the render logic never touching each
other directly.

```
Also recognized in: any UI framework's own state-management
pattern (Redux, MVI, MVU), a game engine separating its own
input-handling step from its own rendering step, a spreadsheet
separating "a cell's formula changed" from "redraw the grid"
```

Every one of these keeps the same real separation this unit's own code
does: something happens, a pure function computes what should change,
and rendering is a completely separate concern that just reads whatever
the current state now says.

### SE Lens

The design choice worth naming here is `applyGesture` taking and
returning a plain `GraphTransform`, with no `Canvas`, no `DrawScope`, and
no gesture detector anywhere in its own signature — the same real
discipline this project already applied to `toScreenPoints` and
`buildGraphPath`. The alternative — updating `panOffset`/`scale`
directly inside the `detectTransformGestures` lambda, with no separate
function at all — would have worked, and is almost exactly what this
lesson's own first two throwaway labs actually did. It was deliberately
not kept for the real, permanent version: inlining the update logic
would mean the only way to verify "does a gesture update the transform
correctly" is through a real, Robolectric-based UI test, injecting
synthetic touch events, exactly like this lesson's own labs needed —
slow, and, per this project's own already-confirmed finding, incapable
of observing anything that happens inside a real `DrawScope` block.
`applyGesture`, kept separate and pure, is instead provably correct
with an exact, instant, Robolectric-free test — this
lesson's own real, fast, exact-value test already proved it — leaving
the real, unavoidable, Robolectric-dependent surface area to exactly one
thing: confirming a real drag or pinch doesn't crash the real screen,
which is honestly all this project's own tooling can confirm about a
real gesture reaching a real `Canvas` at all.

### Commands Needed

```
./gradlew :app:testDebugUnitTest :app:assembleDebug
```

The same real, combined command this project has run after every real
production change since Stage 1.

### Run It

```
$ ./gradlew :app:testDebugUnitTest --rerun-tasks --console=plain
BUILD SUCCESSFUL in 12s
32 actionable tasks: 32 executed
$ find app/build/test-results/testDebugUnitTest -name "*.xml" | xargs grep -h "tests=" | \
  grep -oE 'tests="[0-9]+" skipped="[0-9]+" failures="[0-9]+"' | \
  awk -F'"' '{t+=$2; s+=$4; f+=$6} END {print "total tests:", t, "skipped:", s, "failures:", f}'
total tests: 94 skipped: 0 failures: 0
$ ./gradlew :app:assembleDebug --console=plain
BUILD SUCCESSFUL in 1s
```

Four new, real, permanent tests confirm this unit directly:
`applyGestureAccumulatesRealPanAndMultipliesRealScale` and
`applyGestureWithNoPanAndUnitZoomLeavesTheTransformUnchanged` (both in
`GraphingTest.kt`, exact-value, Robolectric-free), and
`draggingTheRealGraphCanvasDoesNotCrashTheRealScreen`/
`pinchingTheRealGraphCanvasDoesNotCrashTheRealScreen` (both in
`GraphScreenTest.kt`, injecting the identical real synthetic touch
sequences this lesson's own first two units already proved work, this
time against the real, permanent `GraphScreen`) — real, honest proof
that a real gesture reaches this project's own real screen without
crashing it, not proof of what the screen then actually draws, per this
lesson's own second unit's own confirmed finding about `DrawScope`.
Real, saved in `verification/9.4/step3_full_suite.txt`,
`verification/9.4/step3_Graphing.kt`, and
`verification/9.4/step3_MainActivity.kt`.

### Connect the Pieces

Follow one real gesture through everything this lesson built. A real,
synthetic two-finger pinch — the identical sequence this lesson's own
second unit already proved reports a real zoom of exactly `2.0` — now
reaches this project's own real `GraphScreen` through a real
`pointerInput`/`detectTransformGestures` pair. Its own real `pan` and
`zoom` values reach this unit's own real `applyGesture`, producing a
real, new `GraphTransform` with double the previous scale. That real,
updated `transform` becomes the real `originX`/`originY`/`scale` this
project's own already-proven `toScreenPoints` uses on the very next
real draw — the same real transform math this project has always
trusted, now driven by a real finger instead of a fixed number typed
once.

---

## Closing

**Connect the pieces.** This lesson gave this project's own real graph a
real, working sense of touch, built from three separately-proven pieces.
The first unit proved a single real finger's own movement can be
recognized, incrementally, as a real drag — and found a real, honest
quirk, touch slop, that any project using `detectDragGestures` has to
live with. The second unit proved genuine two-finger multi-touch can be
simulated and recognized too, computing an exact real zoom factor from
nothing but two changing finger positions — a real, welcome correction
to this project's own earlier assumption that multi-touch couldn't be
verified this way at all. The third unit combined both: a real, pure
`applyGesture` function, provably correct with an exact, instant test,
updating a real `GraphTransform` that this project's own already-proven
`toScreenPoints` now reads on every real draw.

This lesson also extended a finding this project had already made,
rather than just building around it. That earlier finding was that
`DrawScope`'s own draw-time code isn't observable under this project's
current tooling; this lesson
found that touch *input* reaching a real gesture detector is genuinely
different, and is observable — real, synthetic multi-touch really does
drive real recognition code, confirmed directly rather than assumed.
Keeping `applyGesture` itself completely `DrawScope`-free is what let
this lesson's own hardest logic — how a gesture actually changes the
graph — stay on the provable side of that same line, with only the
unavoidable last step, confirming a gesture reaches the screen without
crashing it, left on the other side.

Next: Lesson 9.5 — Rendering Performance, which asks what this project's
graph is actually spending its time on now that it redraws on every
single real gesture event instead of once.
