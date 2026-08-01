# Lesson 29: Animating Between Screens

**What you will build:** A consistent slide animation on the
`"inventory"`/`"notifications"` hop inside this series' own `NavHost`
(this series' own Lesson 25), plus confirmation that the one remaining
`Intent`-based hop — login into the merged Compose Activity — still uses
Java's exact `overridePendingTransition` mechanism, unchanged. The
transferable problem: Java's Lesson 36 named this precisely — every
navigation in this app already works; what's missing is purely
perceptual, nothing currently signals "forward" versus "back." That
perceptual gap exists identically in both UI systems, and this lesson
closes it with two genuinely different mechanisms at the two genuinely
different navigation boundaries this project now has.

**What you need to know first:** Java's Lesson 36 in full
(`overridePendingTransition`, the deliberate choice over the
API-34-only `overrideActivityTransition`, and slide-animation resource
files). This series' own Lesson 25 (`NavHost`, `composable(route) { }`,
the merged Compose screens this lesson animates).

**Terms introduced in this lesson:**
- **`AnimatedContentTransitionScope`** — the receiver a `composable(...)`
  destination's transition lambdas run inside, providing directional
  slide/fade builders scoped to that specific navigation event.
- **`enterTransition` / `exitTransition` / `popEnterTransition` /
  `popExitTransition`** — the four transition slots Navigation Compose
  exposes per destination, covering forward and backward navigation
  separately.

---

## Concept Unit: The `Intent`-Based Hop — Unchanged

### The Problem

Confirm directly: `MainActivity`'s own navigation into the merged
Compose Activity (this series' own Lesson 25) still goes through a real
`Intent`/`startActivity` call, at a real UI-system boundary
`NavController` has no way to reach across — exactly the boundary this
series named honestly in Lesson 25 itself.

### The New Code

```kotlin
val intent = Intent(this, InventoryActivity::class.java)
startActivity(intent)
overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
```

### Mechanical Walkthrough

`Intent(this, InventoryActivity::class.java)` and `startActivity(intent)`
are both reappearing, unchanged, from this series' own Lesson 11.
`overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)`
is the identical real `Activity` method Java's Lesson 36 already chose,
called immediately after `startActivity`, referencing the identical
animation resource files that lesson already built — this hop needed no
Kotlin-specific change at all, for the same reason Java's own Lesson 36
tradeoff reasoning (choosing the API working across every supported
`minSdk`, not just Android 14+) is a platform-level engineering
judgment, unaffected by language.

### SE Lens

**Why does this one navigation hop still deserve the older,
`Activity`-level animation API, when the rest of this project has moved
to Compose's own equivalents wherever possible?** `overridePendingTransition`
operates on Activity transitions specifically — the exact mechanism
still in play at this one remaining `Intent`-based boundary. Nothing
about adopting Compose elsewhere changes what tool is correct for an
`Activity`-to-`Activity` transition; Java's Lesson 36 own reasoning
(broadest device support, still fully functional despite being
deprecated on the newest API level) applies with zero modification here.

---

## Concept Unit: Compose Navigation's Own Transition Slots

### The Problem

The `"inventory"` → `"notifications"` hop (this series' own Lesson 25)
never crosses an Activity boundary at all — it's `NavHost` swapping
composable content in place. `overridePendingTransition` has no
application here; Compose Navigation needs its own, separate mechanism
for the identical perceptual goal.

### The New Code

```kotlin
NavHost(navController = navController, startDestination = "inventory") {
    composable(
        route = "inventory",
        exitTransition = {
            slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Left)
        },
        popEnterTransition = {
            slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Right)
        }
    ) {
        InventoryScreen(onNavigateToNotifications = { navController.navigate("notifications") })
    }
    composable(
        route = "notifications",
        enterTransition = {
            slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Left)
        },
        popExitTransition = {
            slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Right)
        }
    ) {
        NotificationsScreen(onNavigateBack = { navController.popBackStack() })
    }
}
```

### Mechanical Walkthrough

- `enterTransition = { slideIntoContainer(...) }` — **first appearance.**
  Declared on the `"notifications"` destination, this runs when
  navigating *forward* into it — the direct analog of Java's own
  `slide_in_right.xml`, describing how the incoming screen enters.
- `exitTransition = { slideOutOfContainer(...) }` — **first appearance.**
  Declared on the `"inventory"` destination, this runs when navigating
  *away from* it, forward — the analog of `slide_out_left.xml`.
- `popEnterTransition` / `popExitTransition` — **first appearance.**
  Java's Lesson 36 own animation files came in two directional pairs
  (`slide_in_right`/`slide_out_left` for forward, and, per that
  lesson's full file list, a `slide_in_left`/`slide_out_right` pair for
  the *back* direction) — Compose Navigation names this same forward/
  backward split directly in its parameter names rather than requiring
  four separately-authored animation resource files: `popEnterTransition`
  governs a screen reappearing because of a back navigation,
  `popExitTransition` governs a screen leaving because the user
  navigated back away from it.
- `AnimatedContentTransitionScope.SlideDirection.Left` /`.Right` — **first
  appearance.** Named directions, read directly rather than inferred
  from separate `fromXDelta`/`toXDelta` percentage values the way Java's
  Lesson 36 XML animation resources required — the same underlying
  slide-in-from-one-side/slide-out-to-the-other motion, expressed as a
  named constant instead of raw XML translation values.

### CS Lens

Both mechanisms solve the identical **motion communicates state**
principle Java's Lesson 36 already named: forward navigation and
backward navigation are given visually distinct, opposite-direction
motion specifically so a user's spatial intuition ("I moved forward,"
"I moved back") is reinforced by what they see, not left to be inferred
from content alone.

### SE Lens

**Why does Compose Navigation require four separate transition slots
(`enterTransition`/`exitTransition`/`popEnterTransition`/
`popExitTransition`) per destination, rather than one single "transition"
setting the way `overridePendingTransition`'s two arguments might
suggest?** `overridePendingTransition`'s own two arguments already
encode the identical four-way split — one call, with different
arguments, made once for the forward hop and once (implicitly, via
`finish()`) for the back hop, using four separate animation resource
files in total, exactly as Java's Lesson 36 built. Compose Navigation
makes the same four-way structure explicit in one place, per
destination, rather than splitting it across two separate call sites
the way Activity-based navigation does — a real, deliberate
consolidation, not a new requirement Compose invented.

---

## Connect the Pieces

One trace: `MainActivity`'s own `Intent`-based hop into the merged
Compose Activity kept using `overridePendingTransition`, exactly as
Java's Lesson 36 built it, because that one remaining boundary is a
genuine Activity-to-Activity transition, unaffected by anything Compose
does. The `"inventory"`/`"notifications"` hop, entirely internal to one
`NavHost` (this series' own Lesson 25), used Compose Navigation's own
four transition slots instead — the identical forward/backward,
opposite-direction motion Java's Lesson 36 already established as the
right perceptual goal, expressed through named slide directions instead
of hand-authored XML animation resource files.

## What Breaks Without This

Remove all four transition parameters from both `composable(...)` calls,
leaving only their routes and content, and navigate back and forth
between the two screens.

Real result, when you do this yourself: an abrupt cut between the two
screens with no motion at all — Compose Navigation's own default,
precisely the gap Java's Lesson 36 opening paragraph already named:
"nothing currently tells a user 'you moved forward into something'
versus 'you moved back to where you were.'" Restore all four transition
parameters before moving on.

## Exercises

1. Swap the slide directions on the `"notifications"` destination (make
   it enter from the right, exit to the left) and observe how confusing
   the resulting motion feels compared to the version matching the
   `Intent`-based hop's own direction — connecting the observation to
   Java's Lesson 36 own emphasis on *consistent* direction meaning
   something specific.
2. Look up `fadeIn()`/`fadeOut()` as alternatives to
   `slideIntoContainer`/`slideOutOfContainer` within the same
   `AnimatedContentTransitionScope`, and try combining a slide and a
   fade using Compose's transition-combining syntax on one destination.
3. Time both this project's remaining `Intent`-based transition and its
   `NavHost`-based one (roughly, by eye, or with a screen recording) and
   confirm both last a comparable, deliberately brief duration — long
   enough to register as motion, short enough not to feel sluggish.

## Definition of Done

- [ ] The `Intent`-based hop from `MainActivity` still slides correctly,
      using Java's own unchanged `overridePendingTransition` mechanism.
- [ ] The `"inventory"`/`"notifications"` hop inside `NavHost` slides in
      one consistent direction forward and the opposite direction on
      back navigation, verified on a running emulator or device.
- [ ] You triggered the real abrupt-cut default by removing all four
      transition parameters, and restored them.
- [ ] You can explain why this project uses two genuinely different
      transition mechanisms rather than one, and precisely where the
      boundary between them sits.
- [ ] Commit: `git commit -m "Add directional slide transitions to the
      NavHost destinations, matching the existing Activity transition"`
      — explaining both mechanisms exist deliberately, not that one
      replaced the other.

Milestone 6 is done. Next: a synthesis lesson with no single Java-series
ancestor — modeling this app's three destinations as one sealed
navigation state, tying this series' own Lesson 12 back into
`NavController` directly.
