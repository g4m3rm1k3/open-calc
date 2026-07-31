# Lesson 58: `Snackbar`, Capability/Policy Separation, and the Compensating Action Pattern

**What you will build:** All three units read real Android mechanisms or
reason directly about real code from earlier lessons — nothing here
compiles with plain `javac`.

**What you need to know first:** Lesson 47's `ItemTouchHelper`, Lesson
54's `Toast`, Lesson 57's destructive action confirmation.

**Terms introduced in this lesson:**

- **`Snackbar`** — a brief, auto-dismissing bar anchored to the screen,
  similar to `Toast` but interactive — capable of holding a real,
  tappable action.
- **Capability/policy separation** — a capability has no built-in opinion
  about when or how safely it's invoked — every safety decision lives
  entirely in the caller, not the capability itself.
- **Compensating action** — rather than blocking an operation before it
  happens, let it happen and provide a reliable way to reverse its effect
  afterward.

---

## Concept Unit: `Snackbar`

### The Problem

A row vanishing the instant `ItemTouchHelper` (Lesson 47) detects a
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
anchored to the screen, similar to `Toast` (Lesson 54) but interactive —
capable of holding a real, tappable action. Unlike `Toast`, which only
ever displays a message, `Snackbar.setAction("Undo", ...)` attaches a
real, tappable button directly to the bar itself, wired to a callback
that can reverse whatever just happened.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Snackbar.make(recyclerView, "Item deleted", Snackbar.LENGTH_LONG)` —
   **(b) reappearing** shape from Lesson 54's own `Toast.makeText(...)`,
   now producing a `Snackbar` instead, anchored to the `RecyclerView`
   itself.
2. `.setAction("Undo", view -> restoreItem(deletedItem, position))` —
   **(a) first appearance**: the feature `Toast` has no equivalent for —
   a real, tappable action, wired directly to a callback capable of
   reversing the deletion.
3. `.show();` — **(b) reappearing** from Lesson 54's own `Toast` example,
   displaying the bar; it auto-dismisses after `Snackbar.LENGTH_LONG`'s
   duration if the action is never tapped.

### CS Lens

`Snackbar` sits between `Toast` (passive, no interaction) and a full
modal dialog (Lesson 57's own `AlertDialog`, blocking until answered) —
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

## Concept Unit: Capability/Policy Separation

### The Problem

This project now has two different entry points to the exact same
`deleteItem` method: one gated behind `AlertDialog`'s confirmation
(Lesson 57), and one triggered directly by a completed swipe
(`ItemTouchHelper`, Lesson 47), with only a `Snackbar` undo window
afterward. `deleteItem` itself has no idea which safety strategy, if any,
guarded the call that reached it.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a direct analysis of real code already
shown in this curriculum, not a runnable example of its own:

```java
// deleteItem itself — identical in both real call paths shown below.
void deleteItem(Item item) {
    items.remove(item);
    adapter.notifyItemRemoved(position);
}

// Path 1 (Lesson 57): gated behind an explicit confirmation dialog.
new AlertDialog.Builder(this)
    .setPositiveButton("Delete", (dialog, which) -> deleteItem(item))
    .show();

// Path 2 (Lesson 47/58): triggered directly by a completed swipe,
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
mechanisms already confirmed in Lesson 57's own `AlertDialog` example and
Lesson 47's own `ItemTouchHelper` example — nothing about `deleteItem`
itself changes between them.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this analyzes real code
already shown in this curriculum.

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

## Concept Unit: Compensating Action

### The Problem

A list-row swipe is a deliberate, specific gesture (Lesson 47's own event
stream classification) where immediate visual feedback feels responsive
— but a confirmation dialog on every single swipe, as Lesson 57 uses for
a menu-triggered delete, would add real friction to a gesture meant to
feel quick.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a direct analysis of real code already
shown in this lesson's own first unit, not a runnable example of its own:

```java
public void onSwiped(RecyclerView.ViewHolder viewHolder, int direction) {
    deleteItem(items.get(viewHolder.getAdapterPosition()));
    Snackbar.make(recyclerView, "Item deleted", Snackbar.LENGTH_LONG)
        .setAction("Undo", view -> restoreItem(deletedItem, position))
        .show();
}
```

This is the `compensating action` pattern — **first appearance**: rather
than blocking an operation before it happens, let it happen and provide a
reliable way to reverse its effect afterward. `onSwiped` calls
`deleteItem` immediately — nothing blocks the deletion from happening —
and only afterward offers `Snackbar`'s own `"Undo"` action as the
reliable way to reverse it, in contrast to Lesson 57's own
`AlertDialog`, which blocks the deletion from happening at all until
confirmed.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this analyzes real code
already shown in this lesson's own first unit.

### Mechanical Walkthrough

1. `deleteItem(items.get(viewHolder.getAdapterPosition()));` — **(b)
   reappearing** from this lesson's own capability/policy-separation
   unit: runs immediately, with nothing blocking it beforehand.
2. `Snackbar.make(...).setAction("Undo", view -> restoreItem(...))` —
   **(b) reappearing** from this lesson's own first unit: the reliable
   reversal path, available only *after* the deletion already happened.
3. Contrasted directly against Lesson 57's own `AlertDialog` path: that
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
confirmation dialog, exactly like Lesson 57's own menu-triggered delete —
was not chosen because a list-row swipe is a deliberate, specific gesture
where immediate feedback feels right; a confirmation dialog on every
swipe would cost far more friction than the brief undo window this
lesson's own `Snackbar` offers instead.

---

## Connect the Pieces

`Snackbar` is what makes a compensating action possible at all — its
`"Undo"` action is the real, tappable reversal path. Capability/policy
separation is why the exact same `deleteItem` method can be wired to two
different callers — Lesson 57's confirming `AlertDialog` and this
lesson's own immediate-then-compensate `onSwiped` — without being
duplicated or modified for either. And compensating action names the
actual tradeoff those two different callers each made: block first, or
allow immediately and offer a reliable way back.

## What Breaks Without This

Deleting a row on swipe with no `Snackbar` at all leaves the user with no
feedback and no recovery path for what might have been an accidental
gesture — this lesson's own first unit identified exactly that abrupt
feeling as the problem `Snackbar`'s undo action solves. And if
`deleteItem` itself tried to bake in one single safety strategy (say,
always requiring confirmation), Lesson 47's own swipe-to-delete gesture
could never use it without adding unwanted friction to a gesture meant to
feel immediate.

## Exercises

1. Explain, in your own words, why `deleteItem` itself contains no
   confirmation logic and no undo logic, connecting your answer to this
   lesson's own capability/policy-separation material.
2. Explain, in your own words, why a swipe gesture uses a compensating
   action (`Snackbar`'s undo) while a menu-triggered delete
   (Lesson 57) uses a blocking confirmation instead, even though both
   ultimately call `deleteItem`.
3. Design (in prose, no code required) a third caller of `deleteItem`
   that uses neither strategy, and explain what safety tradeoff it makes.

## Definition of Done

- [ ] You read the real `Snackbar` example and can explain what
      distinguishes it from `Toast`.
- [ ] You can explain, without looking back at this lesson, why
      `deleteItem` has no built-in safety logic of its own.
- [ ] You can state the tradeoff between blocking confirmation
      (Lesson 57) and compensating action (this lesson) in your own
      words.
