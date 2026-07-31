# Lesson 65: `Toolbar` and the Options Menu

**What you will build:** Both units read real Android mechanisms
directly.

**What you need to know first:** Lesson 62's `Fragment` and its view
lifecycle mismatch, Lesson 63's navigation graph.

**Terms introduced in this lesson:**

- **`Toolbar`** — a Material Design app bar widget wired to an Activity's
  action-bar slot and, via a navigation-aware helper, to the current
  navigation destination's title and back behavior automatically.
- **Options menu (`MenuProvider`)** — a declared set of actions attached
  to the current screen's `Toolbar`, for operations that don't need a
  permanently-visible button of their own.

---

## Concept Unit: `Toolbar`

### The Problem

The framework's own plain default title bar has no Back affordance and
nowhere to place menu actions — and in a single-Activity architecture
(Lesson 63), every navigation destination is a `Fragment` swapped in and
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
to the navigation graph (Lesson 63) — its title and Back button now stay
in sync with whichever destination is currently showing, without any
per-screen title-setting code anywhere.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Toolbar toolbar = findViewById(R.id.toolbar);` — **(b) reappearing**
   `findViewById` from Lesson 45, retrieving a real `Toolbar` view from
   the view tree (Lesson 41).
2. `setSupportActionBar(toolbar);` — **(a) first appearance**: installs
   this `Toolbar` as the Activity's own action bar, replacing the
   framework's default title bar entirely.
3. `NavigationUI.setupActionBarWithNavController(this, navController);`
   — **(a) first appearance**: wires the installed `Toolbar` directly to
   the navigation graph (Lesson 63) — its title and Back button now
   update automatically as the user navigates between destinations.

### CS Lens

`Toolbar` is a real, concrete instance of Lesson 63's own navigation
graph paying off structurally: because every destination and its title
are already declared as data in one graph, a navigation-aware helper can
read that same data and keep the `Toolbar` in sync automatically, rather
than requiring each destination to set its own title by hand.

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

## Concept Unit: Options Menu (`MenuProvider`)

### The Problem

Every action so far has needed its own permanently-visible button,
competing for limited screen space — but not every action deserves a
permanent, always-visible button (a "delete this list" action, say, used
rarely, doesn't need to sit on screen at all times).

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
requireActivity().addMenuProvider(new MenuProvider() {
    @Override
    public void onCreateMenu(Menu menu, MenuInflater menuInflater) {
        menuInflater.inflate(R.menu.list_menu, menu);
    }

    @Override
    public boolean onMenuItemSelected(MenuItem menuItem) {
        if (menuItem.getItemId() == R.id.action_delete_all) {
            deleteAllItems();
            return true;
        }
        return false;
    }
}, getViewLifecycleOwner());
```

This is the options menu (`MenuProvider`) — **first appearance**: a
declared set of actions attached to the current screen's `Toolbar`, for
operations that don't need a permanently-visible button of their own.
`onCreateMenu` inflates a real menu resource (Lesson 46's own
layout-inflation shape, applied here to a menu instead of a row) into the
`Toolbar`'s own overflow area; `onMenuItemSelected` reacts only when one
of those specific, occasionally-used actions is actually chosen.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `requireActivity().addMenuProvider(new MenuProvider() { ... },
   getViewLifecycleOwner());` — **(b) reappearing**
   `getViewLifecycleOwner()` from Lesson 62's own Fragment/view lifecycle
   mismatch material, ensuring this menu provider is removed correctly
   once this specific Fragment's own view is destroyed.
2. `onCreateMenu(Menu menu, MenuInflater menuInflater)` — **(a) first
   appearance**: called once, inflating this destination's own menu
   resource into the shared `Toolbar`.
3. `onMenuItemSelected(MenuItem menuItem)` — **(a) first appearance**:
   called only when the user actually selects one of the inflated menu's
   own items — `R.id.action_delete_all` here.

### CS Lens

The options menu is Lesson 58's own capability/policy separation, applied
to menu actions: `deleteAllItems()` (the capability) is unaware it was
triggered from a menu item rather than some other caller; the
`MenuProvider` is simply one more policy wrapping it, alongside
`AlertDialog` (Lesson 57) and swipe-to-delete (Lesson 47/58).

Also recognized in: overflow/options menus across virtually every
mainstream mobile UI framework — a declared, occasionally-used action set
attached to the current screen, distinct from permanently-visible
buttons.

### SE Lens

The alternative — a permanently-visible button for every single action,
including rarely-used ones like "delete all" — was not chosen because
screen space is limited and most actions aren't needed most of the time;
the options menu keeps them declared and available without permanently
occupying screen space.

---

## Connect the Pieces

`Toolbar` replaces the framework's own plain default title bar with one
kept automatically in sync with the navigation graph (Lesson 63) — no
per-destination title code required. The options menu attaches to that
same `Toolbar`, giving each destination a declared place for
occasionally-used actions, correctly scoped to that destination's own
view lifecycle via `getViewLifecycleOwner()` (Lesson 62).

## What Breaks Without This

Skipping `Toolbar`'s own navigation-graph wiring means every `Fragment`
destination must set the Activity's title and Back behavior by hand, in
every single destination, with nothing preventing one from being
forgotten. And giving every action, including rare ones, its own
permanently-visible button crowds the screen with controls that are
almost never used — the options menu exists specifically to avoid that.

## Exercises

1. Explain, in your own words, what would need to change per-destination
   if `Toolbar` were *not* wired to the navigation graph via
   `NavigationUI.setupActionBarWithNavController`.
2. Add a second `<item>` to `R.menu.list_menu` (in your own reasoning,
   no code required) and explain what change `onMenuItemSelected` would
   need to correctly react to it.
3. Explain, in your own words, why `addMenuProvider` is passed
   `getViewLifecycleOwner()` rather than the `Fragment` itself,
   connecting your answer to Lesson 62's own material.

## Definition of Done

- [ ] You read the real `Toolbar`/`NavigationUI` example and can explain
      what stays automatically in sync as the user navigates.
- [ ] You read the real `MenuProvider` example and can explain when
      `onMenuItemSelected` is called.
- [ ] You can state, without looking back at this lesson, why an options
      menu action doesn't need its own permanently-visible button.
