# Lesson 57: Destructive Action Confirmation and `AlertDialog`

**What you will build:** A small, fully runnable, plain Java lab, followed
by a real Android mechanism read directly.

**What you need to know first:** Lesson 56's builder pattern.

**Terms introduced in this lesson:**

- **Destructive action confirmation** — a destructive, hard-to-reverse
  action is deliberately made harder to trigger accidentally than a
  normal, safe action, by structuring code so the dangerous call is
  syntactically reachable only from inside an explicit confirmation step.
- **`AlertDialog` (modal confirmation)** — a dialog blocking interaction
  with the rest of the screen until the user makes an explicit choice,
  inserted as a synchronous confirmation gate before an irreversible
  operation.

---

## Concept Unit: Destructive Action Confirmation

### The Problem

Deleting an inventory item is the first genuinely destructive, hard-to-
reverse action this app performs — it deserves different treatment than
a normal button tap, because the cost of a mistake (permanently lost
data) is categorically different from the cost of, say, mis-tapping a
row to view its details.

### Introduce the Concept in Isolation

```
mkdir lesson-57
cd lesson-57
```

Create `Main.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<String> items = new ArrayList<>(List.of("Wrench", "Bolt", "Hammer"));

    // The dangerous call itself — not reachable from anywhere except
    // the confirmation step below.
    static void deleteItem(String name) {
        items.remove(name);
        System.out.println("Deleted: " + name);
    }

    // Every deletion must pass through this confirmation step first.
    static void requestDelete(String name, boolean userConfirmed) {
        if (userConfirmed) {
            deleteItem(name);
        } else {
            System.out.println("Deletion cancelled for: " + name);
        }
    }

    public static void main(String[] args) {
        requestDelete("Wrench", false);
        requestDelete("Bolt", true);
        System.out.println("Remaining: " + items);
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Deletion cancelled for: Wrench
Deleted: Bolt
Remaining: [Wrench, Hammer]
```

`deleteItem` is never called anywhere except from inside
`requestDelete`'s own `if (userConfirmed)` branch — there is no path in
this program that reaches `deleteItem` without first passing through that
check. This is `destructive action confirmation` — **first appearance**:
a destructive, hard-to-reverse action is deliberately made harder to
trigger accidentally than a normal, safe action, by structuring code so
the dangerous call is syntactically reachable only from inside an
explicit confirmation step. `"Wrench"` was requested for deletion but not
confirmed, and survives; `"Bolt"` was confirmed, and is genuinely gone.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `requestDelete("Wrench", false)` — **(a) first appearance**:
   `userConfirmed` is `false`, so the `else` branch runs; `deleteItem` is
   never called, and `"Wrench"` remains in `items`.
2. `requestDelete("Bolt", true)` — `userConfirmed` is `true`, so
   `deleteItem("Bolt")` actually runs, permanently removing it.
3. `System.out.println("Remaining: " + items);` — confirms `"Wrench"` and
   `"Hammer"` remain, while `"Bolt"` is genuinely gone — proof the
   confirmation step, not merely a comment or convention, controlled
   which deletion actually happened.

### CS Lens

This is a structural, not merely documented, safeguard: `deleteItem`
being unreachable except through `requestDelete`'s own check means no
future code change elsewhere in the program can accidentally call it
directly and skip the confirmation — the guarantee lives in the call
graph itself, not in a comment reminding developers to check first.

Also recognized in: any API design gating a dangerous operation behind a
required confirmation parameter or a separate, explicit method call
(e.g. a cloud provider's own "type the resource name to confirm deletion"
UX pattern), the general principle of making dangerous operations harder
to invoke by accident than safe ones.

### SE Lens

The alternative — wiring a delete button directly to `deleteItem`, with
no confirmation step in between — was not chosen because it would make
permanent data loss exactly one mis-tap away, with no chance to
reconsider; the confirmation step exists specifically to interrupt that
single-tap path.

---

## Concept Unit: `AlertDialog` (Modal Confirmation)

### The Problem

This lesson's own `requestDelete(name, userConfirmed)` took the user's
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

This is `AlertDialog` (modal confirmation) — **first appearance**: a
dialog blocking interaction with the rest of the screen until the user
makes an explicit choice, inserted as a synchronous confirmation gate
before an irreversible operation. `AlertDialog.Builder` (Lesson 56's own
builder pattern) configures the dialog's title, message, and both
buttons; `.show()` displays it and blocks meaningful interaction with the
rest of the screen until the user taps one of the two buttons.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new AlertDialog.Builder(this)` — **(b) reappearing** builder pattern
   from Lesson 56, now configuring a real, on-screen confirmation dialog
   step by step.
2. `.setPositiveButton("Delete", (dialog, which) -> deleteItem(item))` —
   **(a) first appearance**: the real, dangerous call — the direct Android
   equivalent of this lesson's own `deleteItem` — reachable, in this real
   app, only from inside this exact callback.
3. `.setNegativeButton("Cancel", null)` — **(a) first appearance**:
   dismisses the dialog with no further action — the direct equivalent of
   this lesson's own `requestDelete(name, false)` path.
4. `.show();` — displays the dialog and blocks further interaction with
   the underlying screen until one of the two buttons is tapped.

### CS Lens

`AlertDialog` is this lesson's own destructive-action-confirmation
concept, real and load-bearing: `deleteItem`'s real Android equivalent is
reachable only from inside `setPositiveButton`'s own callback — there is
no path in the real app that deletes an item without the dialog itself
being shown and explicitly confirmed first.

Also recognized in: modal confirmation dialogs across virtually every
mainstream UI framework and OS, "are you sure?" patterns generally before
any destructive, hard-to-reverse operation.

### SE Lens

The alternative — deleting the item directly the moment a delete icon is
tapped, with no dialog — was not chosen for exactly the same reason this
lesson's own first unit rejected wiring a button straight to `deleteItem`:
it removes the one chance for the user to reconsider before an
irreversible action actually happens.

---

## Connect the Pieces

`requestDelete`'s own `if (userConfirmed)` check demonstrated the general
shape: a dangerous call reachable only from inside an explicit
confirmation step. `AlertDialog` is that exact shape, real and
load-bearing: `setPositiveButton`'s own callback is the only place the
real delete call is ever wired to, with `.show()` genuinely blocking
interaction with the rest of the screen until the user answers.

## What Breaks Without This

Wiring a delete action directly to a button tap, with no confirmation
step of any kind, makes permanent data loss exactly one mis-tap away —
this lesson's own first unit demonstrated directly that a confirmation
step, structured so the dangerous call is unreachable without it, is what
prevents that; skipping `AlertDialog` in a real app reproduces the exact
same risk this lesson's own throwaway lab was built to show.

## Exercises

1. Modify `requestDelete` to also print the item's name when deletion is
   cancelled, and explain why `deleteItem` still never runs in that case.
2. Explain, in your own words, why `setNegativeButton("Cancel", null)`
   passing `null` instead of a callback is safe here, connecting your
   answer to this lesson's own destructive-action-confirmation material.
3. Explain, in your own words, why `AlertDialog.Builder` uses the Builder
   Pattern rather than one large `AlertDialog` constructor taking every
   option as a parameter.

## Definition of Done

- [ ] You ran the `requestDelete`/`deleteItem` example and can explain
      why `deleteItem` is never reachable without confirmation.
- [ ] You read the real `AlertDialog.Builder` example and can explain
      what `.show()` blocks until the user responds.
- [ ] You can state, without looking back at this lesson, why a
      confirmation dialog before deletion is a structural safeguard, not
      just a courtesy.
