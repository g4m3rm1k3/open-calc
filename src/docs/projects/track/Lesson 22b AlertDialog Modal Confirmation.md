# Lesson 22b: `AlertDialog` (Modal Confirmation)

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 22a's destructive action
confirmation, Lesson 13d's Builder Pattern.

**Terms introduced in this lesson:**

- **`AlertDialog` (Modal Confirmation)** — a dialog blocking interaction
  with the rest of the screen until the user makes an explicit choice,
  inserted as a synchronous confirmation gate before an irreversible
  operation.

---

## Concept Unit: `AlertDialog` (Modal Confirmation)

### The Problem

Lesson 22a's own `requestDelete(name, userConfirmed)` took the user's
decision as a plain `boolean` parameter — but a real app has no such
parameter available; it needs to actually ask the user, in the moment,
and block further interaction until they answer.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
new AlertDialog.Builder(this)
    .setTitle("Delete item?")
    .setMessage("This cannot be undone.")
    .setPositiveButton("Delete", (dialog, which) -> deleteItem(item))
    .setNegativeButton("Cancel", null)
    .show();
```

This is `AlertDialog` (Modal Confirmation) — **first appearance**: a
dialog blocking interaction with the rest of the screen until the user
makes an explicit choice, inserted as a synchronous confirmation gate
before an irreversible operation. `AlertDialog.Builder` (Lesson 13d's
own Builder Pattern) configures the dialog's title, message, and both
buttons; `.show()` displays it and blocks meaningful interaction with the
rest of the screen until the user taps one of the two buttons.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new AlertDialog.Builder(this)` — **(b) reappearing** Builder Pattern
   from Lesson 13d, now configuring a real, on-screen confirmation dialog
   step by step.
2. `.setPositiveButton("Delete", (dialog, which) -> deleteItem(item))` —
   **(a) first appearance**: the real, dangerous call — the direct Android
   equivalent of Lesson 22a's own `deleteItem` — reachable, in this real
   app, only from inside this exact callback.
3. `.setNegativeButton("Cancel", null)` — **(a) first appearance**:
   dismisses the dialog with no further action — the direct equivalent of
   Lesson 22a's own `requestDelete(name, false)` path.
4. `.show();` — displays the dialog and blocks further interaction with
   the underlying screen until one of the two buttons is tapped.

### CS Lens

`AlertDialog` is Lesson 22a's own destructive-action-confirmation
concept, real and load-bearing: `deleteItem`'s real Android equivalent is
reachable only from inside `setPositiveButton`'s own callback — there is
no path in the real app that deletes an item without the dialog itself
being shown and explicitly confirmed first.

Also recognized in: modal confirmation dialogs across virtually every
mainstream UI framework and OS, "are you sure?" patterns generally before
any destructive, hard-to-reverse operation.

### SE Lens

The alternative — deleting the item directly the moment a delete icon is
tapped, with no dialog — was not chosen for exactly the same reason
Lesson 22a's own first unit rejected wiring a button straight to
`deleteItem`: it removes the one chance for the user to reconsider before
an irreversible action actually happens.

---

## Connect the Pieces

Lesson 22a's `requestDelete` demonstrated the general shape: a dangerous
call reachable only from inside an explicit confirmation step.
`AlertDialog` is that exact shape, real and load-bearing:
`setPositiveButton`'s own callback is the only place the real delete
call is ever wired to, with `.show()` genuinely blocking interaction
with the rest of the screen until the user answers.

## What Breaks Without This

Skipping `AlertDialog` in a real app reproduces the exact same risk
Lesson 22a's own throwaway lab was built to show: permanent data loss
exactly one mis-tap away, with no chance to reconsider.

## Exercises

1. Explain, in your own words, why `setNegativeButton("Cancel", null)`
   passing `null` instead of a callback is safe here, connecting your
   answer to Lesson 22a's own destructive-action-confirmation material.
2. Explain, in your own words, why `AlertDialog.Builder` uses the Builder
   Pattern rather than one large `AlertDialog` constructor taking every
   option as a parameter.
3. Explain, in your own words, what would happen if a developer wired a
   delete icon directly to `deleteItem(item)`, bypassing this dialog
   entirely.

## Definition of Done

- [ ] You read the real `AlertDialog.Builder` example and can explain
      what `.show()` blocks until the user responds.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a
      confirmation dialog before deletion is a structural safeguard, not
      just a courtesy.
