# Lesson 23e: Compensating Action

**What you will build:** No new code to compile — this directly analyzes
real code already shown in this group of lessons.

**What you need to know first:** Lesson 23d's Capability/Policy
Separation.

**Terms introduced in this lesson:**

- **Compensating Action** — rather than blocking an operation before it
  happens, let it happen and provide a reliable way to reverse its
  effect afterward.

---

## Concept Unit: Compensating Action

### The Problem

A list-row swipe is a deliberate, specific gesture (Lesson 23a's own
event stream classification) where immediate visual feedback feels
responsive — but a confirmation dialog on every single swipe, as Lesson
22b uses for a menu-triggered delete, would add real friction to a
gesture meant to feel quick.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a direct analysis of real code already
shown in Lesson 23d, not a runnable example of its own:

```java
public void onSwiped(RecyclerView.ViewHolder viewHolder, int direction) {
    deleteItem(items.get(viewHolder.getAdapterPosition()));
    Snackbar.make(recyclerView, "Item deleted", Snackbar.LENGTH_LONG)
        .setAction("Undo", view -> restoreItem(deletedItem, position))
        .show();
}
```

This is the `Compensating Action` pattern — **first appearance**: rather
than blocking an operation before it happens, let it happen and provide a
reliable way to reverse its effect afterward. `onSwiped` calls
`deleteItem` immediately — nothing blocks the deletion from happening —
and only afterward offers `Snackbar`'s own `"Undo"` action as the
reliable way to reverse it, in contrast to Lesson 22b's own
`AlertDialog`, which blocks the deletion from happening at all until
confirmed.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this analyzes real code
already shown in Lesson 23d.

### Mechanical Walkthrough

1. `deleteItem(items.get(viewHolder.getAdapterPosition()));` — **(b)
   reappearing** from Lesson 23d's own capability/policy-separation
   unit: runs immediately, with nothing blocking it beforehand.
2. `Snackbar.make(...).setAction("Undo", view -> restoreItem(...))` —
   **(b) reappearing** from Lesson 23c: the reliable reversal path,
   available only *after* the deletion already happened.
3. Contrasted directly against Lesson 22b's own `AlertDialog` path: that
   path blocks `deleteItem` from running at all until confirmed — the
   opposite ordering from this one.

### CS Lens

Compensating action trades prevention for recovery: rather than paying
the friction cost of a confirmation gate on every single occurrence, the
operation is allowed to happen immediately, with the cost instead paid
only in the rarer case a reversal is actually needed — a real, deliberate
tradeoff, not a lesser version of confirmation.

Also recognized in: compensating transactions in distributed systems
(an operation that already committed is reversed by a separate,
corrective operation rather than never allowed to commit in the first
place), "undo" as a general software design pattern.

### SE Lens

The alternative — gating every single swipe-to-delete behind a
confirmation dialog, exactly like Lesson 22b's own menu-triggered delete
— was not chosen because a list-row swipe is a deliberate, specific
gesture where immediate feedback feels right; a confirmation dialog on
every swipe would cost far more friction than the brief undo window
Lesson 23c's own `Snackbar` offers instead.

---

## Connect the Pieces

Lesson 23c's `Snackbar` is what makes a compensating action possible at
all — its `"Undo"` action is the real, tappable reversal path. Lesson
23d's capability/policy separation is why the exact same `deleteItem`
method can be wired to two different callers — Lesson 22b's confirming
`AlertDialog` and this group's own immediate-then-compensate `onSwiped`
— without being duplicated or modified for either. Compensating action
names the actual tradeoff those two different callers each made: block
first, or allow immediately and offer a reliable way back.

## What Breaks Without This

Gating every single swipe-to-delete behind a confirmation dialog would
cost far more friction than a brief undo window, for a gesture meant to
feel immediate and responsive.

## Exercises

1. Explain, in your own words, why a swipe gesture uses a compensating
   action (`Snackbar`'s undo) while a menu-triggered delete
   (Lesson 22b) uses a blocking confirmation instead, even though both
   ultimately call `deleteItem`.
2. Name one other real feature (besides swipe-to-delete) that uses a
   compensating action instead of a blocking confirmation.
3. Explain, in your own words, why compensating action is described as
   "a real, deliberate tradeoff, not a lesser version of confirmation."

## Definition of Done

- [ ] You can explain, without looking back at this lesson, the
      difference between blocking confirmation and a compensating
      action.
- [ ] You completed Exercise 1.
- [ ] You can state the tradeoff between blocking confirmation
      (Lesson 22b) and compensating action (this lesson) in your own
      words.
