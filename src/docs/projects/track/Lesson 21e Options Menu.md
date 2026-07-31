# Lesson 21e: Options Menu (`MenuProvider`)

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 21d's `Toolbar`, Lesson 18d's
Fragment vs. View Lifecycle Mismatch.

**Terms introduced in this lesson:**

- **Options menu (`MenuProvider`)** — a declared set of actions in an XML
  menu resource, shown in a Toolbar's overflow or as visible icons,
  dispatched to a handler through an interface scoped to a Fragment's
  view lifecycle.

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
declared set of actions in an XML menu resource, shown in a Toolbar's
overflow or as visible icons, dispatched to a handler through an
interface scoped to a Fragment's view lifecycle.
`onCreateMenu` inflates a real menu resource (Lesson 6d's own
layout-inflation shape, applied here to a menu instead of a row) into
the `Toolbar`'s own overflow area; `onMenuItemSelected` reacts only when
one of those specific, occasionally-used actions is actually chosen —
itself a command dispatch table (Lesson 21a), matching a selected
item's `id` to its own handler.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `requireActivity().addMenuProvider(new MenuProvider() { ... },
   getViewLifecycleOwner());` — **(b) reappearing**
   `getViewLifecycleOwner()` from Lesson 18d's own Fragment/view lifecycle
   mismatch material, ensuring this menu provider is removed correctly
   once this specific Fragment's own view is destroyed.
2. `onCreateMenu(Menu menu, MenuInflater menuInflater)` — **(a) first
   appearance**: called once, inflating this destination's own menu
   resource into the shared `Toolbar`.
3. `onMenuItemSelected(MenuItem menuItem)` — **(a) first appearance**:
   called only when the user actually selects one of the inflated menu's
   own items — `R.id.action_delete_all` here.

### CS Lens

The options menu is Lesson 4i's own capability/policy separation, applied
to menu actions: `deleteAllItems()` (the capability) is unaware it was
triggered from a menu item rather than some other caller; the
`MenuProvider` is simply one more policy wrapping it, the same shape a
dialog confirmation or a swipe-to-delete gesture would also use to reach
the identical capability.

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

`Toolbar` (Lesson 21d) replaces the framework's own plain default title
bar with one kept automatically in sync with the navigation graph. The
options menu attaches to that same `Toolbar`, giving each destination a
declared place for occasionally-used actions, correctly scoped to that
destination's own view lifecycle via `getViewLifecycleOwner()` (Lesson
18d).

## What Breaks Without This

Giving every action, including rare ones, its own permanently-visible
button crowds the screen with controls that are almost never used — the
options menu exists specifically to avoid that.

## Exercises

1. Add a second `<item>` to `R.menu.list_menu` (in your own reasoning,
   no code required) and explain what change `onMenuItemSelected` would
   need to correctly react to it.
2. Explain, in your own words, why `addMenuProvider` is passed
   `getViewLifecycleOwner()` rather than the `Fragment` itself,
   connecting your answer to Lesson 18d's own material.
3. Explain, in your own words, why `onMenuItemSelected` is described as
   a command dispatch table.

## Definition of Done

- [ ] You read the real `MenuProvider` example and can explain when
      `onMenuItemSelected` is called.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why an options
      menu action doesn't need its own permanently-visible button.
