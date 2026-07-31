# Lesson 21d: `Toolbar`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 21c's single source of truth,
Lesson 19c's Navigation Graph.

**Terms introduced in this lesson:**

- **`Toolbar`** — a Material Design app bar widget wired to an Activity's
  action-bar slot and, via a navigation-aware helper, to the current
  navigation destination's title and back behavior automatically.

---

## Concept Unit: `Toolbar`

### The Problem

The framework's own plain default title bar has no Back affordance and
nowhere to place menu actions — and in a single-Activity architecture
(Lesson 19b), every navigation destination is a `Fragment` swapped in and
out of the same host, so nothing updates that title bar's own text or
Back behavior per-destination automatically.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Toolbar toolbar = findViewById(R.id.toolbar);
setSupportActionBar(toolbar);

NavController navController = Navigation.findNavController(this, R.id.navHostFragment);
NavigationUI.setupActionBarWithNavController(this, navController);
```

This is `Toolbar` — **first appearance**: a Material Design app bar
widget wired to an Activity's action-bar slot and, via a
navigation-aware helper, to the current navigation destination's title
and back behavior automatically. `setSupportActionBar(toolbar)` installs
this real `Toolbar` in place of the framework's own default title bar;
`NavigationUI.setupActionBarWithNavController(...)` connects it directly
to the navigation graph (Lesson 19c) — its title and Back button now
stay in sync with whichever destination is currently showing, without
any per-screen title-setting code anywhere, the same single-source-of-
truth discipline (Lesson 21c) applied to a real Android widget.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Toolbar toolbar = findViewById(R.id.toolbar);` — **(b) reappearing**
   `findViewById` from Lesson 4j, retrieving a real `Toolbar` view from
   the view tree (Lesson 3a).
2. `setSupportActionBar(toolbar);` — **(a) first appearance**: installs
   this `Toolbar` as the Activity's own action bar, replacing the
   framework's default title bar entirely.
3. `NavigationUI.setupActionBarWithNavController(this, navController);`
   — **(a) first appearance**: wires the installed `Toolbar` directly to
   the navigation graph (Lesson 19c) — its title and Back button now
   update automatically as the user navigates between destinations.

### CS Lens

`Toolbar` is a real, concrete instance of Lesson 19c's own navigation
graph paying off structurally: because every destination and its title
are already declared as data in one graph — a single source of truth
(Lesson 21c) — a navigation-aware helper can read that same data and
keep the `Toolbar` in sync automatically, rather than requiring each
destination to set its own title by hand.

Also recognized in: app bar/navigation bar components across virtually
every mainstream mobile and web UI framework, automatically synced to
whichever route or screen is currently active.

### SE Lens

The alternative — each `Fragment` destination manually setting the
Activity's title and Back-button visibility in its own `onCreateView` or
similar lifecycle callback — was not chosen because it repeats the same
bookkeeping in every single destination, with nothing preventing one
destination from forgetting it; wiring `Toolbar` to the navigation graph
once handles every destination automatically and correctly.

---

## Connect the Pieces

`Toolbar` replaces the framework's own plain default title bar with one
kept automatically in sync with the navigation graph — no per-destination
title code required. The next lesson attaches a declared set of actions
to that same `Toolbar`.

## What Breaks Without This

Skipping `Toolbar`'s own navigation-graph wiring means every `Fragment`
destination must set the Activity's title and Back behavior by hand, in
every single destination, with nothing preventing one from being
forgotten.

## Exercises

1. Explain, in your own words, what would need to change per-destination
   if `Toolbar` were *not* wired to the navigation graph via
   `NavigationUI.setupActionBarWithNavController`.
2. Explain, in your own words, why `setSupportActionBar(toolbar)` and
   `NavigationUI.setupActionBarWithNavController(...)` are two separate
   calls rather than one.
3. Explain, in your own words, how `Toolbar`'s automatic title sync
   connects to Lesson 21c's own single-source-of-truth material.

## Definition of Done

- [ ] You read the real `Toolbar`/`NavigationUI` example and can explain
      what stays automatically in sync as the user navigates.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why `Toolbar`
      is described as a concrete instance of the navigation graph
      "paying off."
