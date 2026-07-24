# Lesson 22: Waiting Without Blocking

*(An Animated Projectile Simulation via Coroutines)*

**User Story**
> As a user, I want to watch a projectile's actual trajectory animate on
> the graph canvas, without the app freezing while it plays.

**What you will build**
A "Simulate" button on the Physics screen that animates a small dot
tracing the real projectile-motion trajectory over time on the graph
canvas — smoothly, with the rest of the UI staying fully responsive while
it plays.

**What you need to know first**
Lesson 21's `Formula.ProjectileRange`. From `../track/`: Lesson 14, "The
Main Thread Cannot Wait" — that lesson's entire problem statement is this
lesson's motivation, arrived at from a completely different mechanism.

---

## Concept Unit: Why a Plain Loop-and-Sleep Would Freeze the App

### The Problem

`../track/` Lesson 14 already established the core rule: Android has one
main/UI thread, and anything that blocks it — including old-fashioned
`Thread.sleep(...)` in a loop meant to "animate" something — freezes the
entire app, including its ability to redraw the screen at all, for as long
as the block runs. A naive animation attempt,
`for (t in ...) { updatePosition(t); Thread.sleep(16) }`, would be exactly
that mistake: it blocks the very thread responsible for showing each
updated frame, so nothing would visibly animate at all — the whole loop
would run to completion, then the final frame alone would appear.

`../track/`'s fix for this shape of problem was a background `Thread` or
`AsyncTask`, with results posted back to the main thread via a callback.
Kotlin coroutines solve the same problem with a fundamentally different
programming model — not a new kind of thread, a new way of writing
sequential-looking code that can pause without blocking anything.

### CS Lens

Reappearing directly: `../track/` Lesson 14 already named the core
constraint (one UI thread, don't block it). Nothing new to prove about
*why* this matters — the new material is entirely about the *mechanism*
Kotlin offers to respect that constraint.

---

## Concept Unit: `suspend fun` and `LaunchedEffect`

### The Problem

The fix needs a way to say "wait 16 milliseconds, then update the
position, then repeat" without that waiting blocking the UI thread the
way `Thread.sleep` does.

### The New Code

```kotlin
suspend fun simulateProjectile(
    speed: Double,
    angleDegrees: Double,
    onFrame: (x: Double, y: Double) -> Unit
) {
    val angleRadians = angleDegrees * Math.PI / 180.0
    val vx = speed * cos(angleRadians)
    val vy = speed * sin(angleRadians)
    var t = 0.0
    while (true) {
        val x = vx * t
        val y = vy * t - 0.5 * 9.8 * t * t
        if (y < 0.0) break
        onFrame(x, y)
        delay(16L)
        t += 0.05
    }
}
```

### Project Change

- **Reference Source:** No reference counterpart — the Compose/coroutine
  equivalent of `../track/` Lesson 14's background-thread animation,
  arrived at with a different mechanism, not a line-for-line port.
- **Files affected:** New file `Simulation.kt`; the Physics screen
  composable (Lesson 21).
- **Change type:** Add.
- **Location:** A "Simulate" button triggers this; its output drives a
  drawn point on the graph canvas (Lesson 12).
- **Dependencies:** `kotlinx.coroutines` (already a transitive dependency
  of Compose and lifecycle-viewmodel-compose — no new library needed).

### The Updated Project

```kotlin
composable("physics") {
    // ... existing formula picker from Lesson 21 ...
    var isSimulating by remember { mutableStateOf(false) }
    var projectilePosition by remember { mutableStateOf<Pair<Double, Double>?>(null) }

    Button(onClick = { isSimulating = true }) { Text("Simulate") }

    LaunchedEffect(isSimulating) {                                  // ← new
        if (isSimulating && formula is Formula.ProjectileRange) {
            simulateProjectile(
                speed = (formula as Formula.ProjectileRange).speed,
                angleDegrees = formula.angleDegrees
            ) { x, y -> projectilePosition = x to y }
            isSimulating = false
        }
    }

    // On the graph canvas, elsewhere: draw a small circle at
    // projectilePosition, converted to screen coordinates exactly like
    // Lesson 13's evaluateFunction output.
}
```

### Mechanical walkthrough

1. `suspend fun simulateProjectile(...)` — (first appearance) the
   `suspend` modifier marks a function as one that can pause its own
   execution (at `delay(16L)`) and resume later, without blocking
   whatever thread called it. A `suspend` function can only be called
   from another `suspend` function, or from a **coroutine** — this
   restriction is checked by the compiler, not a convention.
2. `delay(16L)` — (first appearance) a `suspend` function from
   `kotlinx.coroutines` that pauses *this coroutine* for the given
   milliseconds, `16` here approximating a 60fps frame interval — unlike
   `Thread.sleep`, `delay` frees up the underlying thread entirely while
   waiting, letting it do other work (like redrawing the UI) during the
   pause.
3. `onFrame: (x: Double, y: Double) -> Unit` — (hard concept reappearing)
   Lesson 10's function-as-value idea — `simulateProjectile` doesn't know
   or care what happens with each computed position; it just calls back
   with it every frame.
4. `LaunchedEffect(isSimulating) { ... }` — (first appearance) a Compose
   function that launches a coroutine tied to this composable's lifecycle,
   re-launching its block whenever its **key** (`isSimulating` here)
   changes value — this is Compose's answer to the exact problem Lesson 2's
   CS Lens flagged as unsafe: a composable function's body must be safe to
   call any number of times, so starting a coroutine (a genuine side
   effect) directly inside the function body would violate that;
   `LaunchedEffect` is the sanctioned place such side effects belong.
5. `formula as Formula.ProjectileRange` — (first appearance) an explicit
   **unsafe cast** — unlike the `is` checks used everywhere else in this
   lesson's `when` expressions, this line asserts the type without the
   compiler verifying it structurally first; it's guarded here by the
   surrounding `formula is Formula.ProjectileRange` check, the same
   disciplined pattern as Lesson 20's guarded `!!`.

### Execution trace

```
isSimulating: false → true (button tapped)
LaunchedEffect(isSimulating) key changes → block launches
  t=0.0:  x=0.0,  y=0.0             → onFrame(0.0, 0.0)   → delay(16ms) → t += 0.05
  t=0.05: x=0.71, y=0.68            → onFrame(0.71, 0.68) → delay(16ms) → t += 0.05
  t=0.10: x=1.41, y=1.32            → onFrame(1.41, 1.32) → delay(16ms) → t += 0.05
  ... continues until y < 0.0 ...
  loop exits → isSimulating = false
```

*Note:* during every one of those `delay(16ms)` pauses, the UI thread is
completely free — the Deg/Rad toggle, the calculator's own buttons on a
different tab, everything else in the app stays fully responsive, which is
the entire point this lesson exists to demonstrate, directly contrasting
with the blocked-thread failure Concept Unit 1 described.

### CS Lens

This is **structured concurrency** built on coroutines — the code inside
`simulateProjectile` *reads* like an ordinary sequential loop (easy to
follow top to bottom) despite pausing, potentially for many frames, at
each `delay` call. Under the hood, the Kotlin compiler transforms a
`suspend fun` into a state machine that can be paused and resumed by the
coroutine scheduler — the sequential-looking code is a compiler-provided
illusion over what's actually a series of resumable steps, similar in
spirit to how `async`/`await` works in JavaScript or C# (this curriculum's
WPF course's own async patterns, when it reaches them).

### SE Lens

The real tradeoff versus `../track/`'s background-`Thread`-plus-callback
approach: that pattern requires manually posting results back to the main
thread (`runOnUiThread`, or a `Handler`) and manually managing when the
background work should stop if the screen is closed mid-animation.
`LaunchedEffect` ties the coroutine's entire lifetime to the composable's
own lifetime automatically — if the Physics screen is navigated away from
mid-simulation, Compose cancels the coroutine for you, no manual cleanup
code required. This is a real, meaningful reduction in the exact kind of
lifecycle bug `../track/` Lesson 14 had to teach you to watch for by hand.

### Connection

Epic 8's Room persistence (Lesson 23) uses `suspend fun` for the same
underlying reason — database access is slow enough to need doing off the
blocking path, and coroutines are how this app does that consistently
everywhere, not just for animation.

---

## Closing

### Connect the pieces

`simulateProjectile` (unit 1's fix, unit 2's real code) computes the
projectile's real physical position frame by frame, pausing between each
one with `delay` instead of blocking. `LaunchedEffect` (unit 2) is the
Compose-sanctioned place to launch that coroutine, tied correctly to the
screen's own lifecycle. The result: a real animation, computed from actual
physics, that never freezes the rest of the app — direct, working proof
against the naive `Thread.sleep`-in-a-loop failure Concept Unit 1
described but never actually ran (because it would freeze the app if you
did).

### What breaks without this

Replace `delay(16L)` with `Thread.sleep(16)` inside `simulateProjectile`
(both are callable from this context, since `Thread.sleep` is a plain,
non-suspending function). Run the simulation and try tapping any other
button while it plays. Real, observable failure: the entire UI freezes
completely until the whole trajectory finishes computing — no animation is
visible at all, and no other button responds — the exact failure `../track/`
Lesson 14 already named, now reproduced with coroutines' own delay
mechanism swapped for the blocking one it exists to avoid. Restore `delay`
and the app stays responsive throughout.

### Exercises

- Trigger the real failure above yourself — swap in `Thread.sleep`, run
  it, and confirm the freeze — then restore `delay` and confirm the
  animation plays smoothly with the rest of the UI still responsive.
- Add a "Cancel" button that sets `isSimulating = false` mid-animation and
  confirm the trajectory stops — connect this to `LaunchedEffect`'s
  key-based relaunch behavior.

### Definition of done

- [ ] The projectile animates smoothly across the graph canvas.
- [ ] The rest of the app (other tabs, buttons) stays responsive during
      the animation.
- [ ] You triggered the `Thread.sleep` freeze yourself and can explain,
      concretely, why `delay` doesn't cause the same freeze.
- [ ] You can state what's the same and what's different between this and
      `../track/` Lesson 14's background-thread approach.
- [ ] Commit: `git commit -m "Animate projectile motion with a suspend function and LaunchedEffect — no UI freeze"`.
