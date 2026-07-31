# Lesson 23c: `Snackbar`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 23b's `ItemTouchHelper`, Lesson
9e's `Toast`.

**Terms introduced in this lesson:**

- **`Snackbar`** — a brief, auto-dismissing bar anchored to the screen,
  similar to `Toast` but interactive — capable of holding a real,
  tappable action.

---

## Concept Unit: `Snackbar`

### The Problem

A row vanishing the instant `ItemTouchHelper` (Lesson 23b) detects a
completed swipe, with zero feedback and no way to reverse it, would feel
abrupt — the user has no confirmation the deletion happened, and no
recovery path if the swipe was accidental.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Snackbar.make(recyclerView, "Item deleted", Snackbar.LENGTH_LONG)
    .setAction("Undo", view -> restoreItem(deletedItem, position))
    .show();
```

This is `Snackbar` — **first appearance**: a brief, auto-dismissing bar
anchored to the screen, similar to `Toast` (Lesson 9e) but interactive —
capable of holding a real, tappable action. Unlike `Toast`, which only
ever displays a message, `Snackbar.setAction("Undo", ...)` attaches a
real, tappable button directly to the bar itself, wired to a callback
that can reverse whatever just happened.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Snackbar.make(recyclerView, "Item deleted", Snackbar.LENGTH_LONG)` —
   **(b) reappearing** shape from Lesson 9e's own `Toast.makeText(...)`,
   now producing a `Snackbar` instead, anchored to the `RecyclerView`
   itself.
2. `.setAction("Undo", view -> restoreItem(deletedItem, position))` —
   **(a) first appearance**: the feature `Toast` has no equivalent for —
   a real, tappable action, wired directly to a callback capable of
   reversing the deletion.
3. `.show();` — **(b) reappearing** from Lesson 9e's own `Toast` example,
   displaying the bar; it auto-dismisses after `Snackbar.LENGTH_LONG`'s
   duration if the action is never tapped.

### CS Lens

`Snackbar` sits between `Toast` (passive, no interaction) and a full
modal dialog (Lesson 22b's own `AlertDialog`, blocking until answered) —
a brief, non-blocking bar that still offers one real, optional action.
Recognizing which of these three a given feedback moment calls for is the
transferable judgment: a passive confirmation, an actionable-but-
non-blocking one, or a blocking gate.

Also recognized in: "undo" toasts/snackbars across virtually every
mainstream mobile and web UI (email clients' "message deleted, undo"
banners), any transient UI element offering an optional, time-limited
reversal action.

### SE Lens

The alternative — using `Toast` instead of `Snackbar` for this feedback
— was not chosen because `Toast` has no way to attach a real, tappable
action at all; the whole point of this specific feedback moment is
offering an undo path, which only `Snackbar` supports.

---

## Connect the Pieces

`Snackbar` is what makes an undo path possible after a swipe — its
`"Undo"` action is a real, tappable reversal. The next lesson names the
design principle that lets the same delete logic be wired to both a
confirming dialog and this immediate-then-undo path.

## What Breaks Without This

Deleting a row on swipe with no `Snackbar` at all leaves the user with no
feedback and no recovery path for what might have been an accidental
gesture.

## Exercises

1. Change `Snackbar.LENGTH_LONG` to `Snackbar.LENGTH_SHORT` and explain,
   in your own words, what tradeoff that makes for the user's own undo
   window.
2. Explain, in your own words, why `Snackbar` is described as sitting
   "between" `Toast` and `AlertDialog`.
3. Explain, in your own words, why `Toast` cannot be used for this
   specific feedback moment.

## Definition of Done

- [ ] You read the real `Snackbar` example and can explain what
      distinguishes it from `Toast`.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why `Snackbar`
      is the right choice for this specific feedback moment, not
      `Toast` or `AlertDialog`.
