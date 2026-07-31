# Lesson 23d: Capability/Policy Separation

**What you will build:** No new code to compile — this directly analyzes
real code already shown in earlier lessons.

**What you need to know first:** Lesson 23c's `Snackbar`, Lesson 22a's
destructive action confirmation.

**Terms introduced in this lesson:**

- **Capability/Policy Separation** — a capability has no built-in opinion
  about when or how safely it's invoked — every safety decision lives
  entirely in the caller, not the capability itself.

---

## Concept Unit: Capability/Policy Separation

### The Problem

This project now has two different entry points to the exact same
`deleteItem` method: one gated behind `AlertDialog`'s confirmation
(Lesson 22b), and one triggered directly by a completed swipe
(`ItemTouchHelper`, Lesson 23b), with only a `Snackbar` undo window
afterward. `deleteItem` itself has no idea which safety strategy, if any,
guarded the call that reached it.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a direct analysis of real code already
shown in this course, not a runnable example of its own:

```java
// deleteItem itself — identical in both real call paths shown below.
void deleteItem(Item item) {
    items.remove(item);
    adapter.notifyItemRemoved(position);
}

// Path 1 (Lesson 22b): gated behind an explicit confirmation dialog.
new AlertDialog.Builder(this)
    .setPositiveButton("Delete", (dialog, which) -> deleteItem(item))
    .show();

// Path 2 (Lesson 23b/23c): triggered directly by a completed swipe,
// with only an Undo window afterward.
public void onSwiped(RecyclerView.ViewHolder viewHolder, int direction) {
    deleteItem(items.get(viewHolder.getAdapterPosition()));
    Snackbar.make(recyclerView, "Item deleted", Snackbar.LENGTH_LONG)
        .setAction("Undo", view -> restoreItem(...))
        .show();
}
```

This is `capability/policy separation` — **first appearance**: a
capability has no built-in opinion about when or how safely it's
invoked — every safety decision lives entirely in the caller, not the
capability itself. `deleteItem` (the capability) is identical code in
both paths; it does not, and cannot, know whether it was reached through
a confirmation dialog or a direct swipe. Every safety decision — confirm
first, or allow-then-compensate — lives entirely in the caller. Both call
paths shown above are real, verified against the actual framework
mechanisms already confirmed in Lesson 22b's own `AlertDialog` example
and Lesson 23b's own `ItemTouchHelper` example — nothing about
`deleteItem` itself changes between them.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this analyzes real code
already shown in this course.

### Mechanical Walkthrough

1. `void deleteItem(Item item) { ... }` — **(a) first appearance** of
   this concept's own vocabulary for it: the capability itself, with no
   safety logic of its own at all.
2. `AlertDialog`'s own `setPositiveButton` callback — one caller,
   choosing to gate `deleteItem` behind explicit confirmation.
3. `onSwiped(...)` — a second, entirely different caller, choosing to
   call `deleteItem` immediately and offer a `Snackbar` undo window
   instead — a different policy, wrapping the exact same capability.

### CS Lens

Capability/policy separation is why the same `deleteItem` method can
correctly serve two different safety strategies without being duplicated
or modified — the capability stays simple and reusable precisely because
it carries no opinion about safety; every caller supplies its own policy
around it.

Also recognized in: the general "mechanism, not policy" principle in
operating-system and API design (a kernel providing a capability, with
policy decisions left to user-space callers), any reusable function
deliberately kept free of caller-specific safety logic.

### SE Lens

The alternative — building safety logic (a confirmation check, an undo
window) directly into `deleteItem` itself — was not chosen because it
would force every single caller to accept the same safety strategy,
even where a different one (immediate action plus undo, versus a
blocking confirmation) is clearly the better fit for that specific call
site.

---

## Connect the Pieces

`deleteItem` stays identical across both call paths — capability/policy
separation is why. The next lesson names the actual tradeoff each of
those two callers made.

## What Breaks Without This

If `deleteItem` itself tried to bake in one single safety strategy (say,
always requiring confirmation), a swipe-to-delete gesture could never
use it without adding unwanted friction to a gesture meant to feel
immediate.

## Exercises

1. Explain, in your own words, why `deleteItem` itself contains no
   confirmation logic and no undo logic.
2. Design (in prose, no code required) a third caller of `deleteItem`
   that uses neither strategy, and explain what safety tradeoff it makes.
3. Explain, in your own words, how capability/policy separation connects
   to the "mechanism, not policy" principle in operating-system design.

## Definition of Done

- [ ] You can explain, without looking back at this lesson, why
      `deleteItem` has no built-in safety logic of its own.
- [ ] You completed Exercise 2.
- [ ] You can state, in your own words, what a "capability" and a
      "policy" each are in this pattern's own vocabulary.
