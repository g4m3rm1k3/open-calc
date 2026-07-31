# Lesson 22a: Destructive Action Confirmation

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Destructive action confirmation** — a destructive, hard-to-reverse
  action is deliberately made harder to trigger accidentally than a
  normal, safe action, by structuring code so the dangerous call is
  syntactically reachable only from inside an explicit confirmation step.

---

## Concept Unit: Destructive Action Confirmation

### The Problem

Deleting an inventory item is a genuinely destructive, hard-to-
reverse action — it deserves different treatment than a normal button
tap, because the cost of a mistake (permanently lost data) is
categorically different from the cost of, say, mis-tapping a row to view
its details.

### Introduce the Concept in Isolation

```
mkdir lesson-22a
cd lesson-22a
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

## Connect the Pieces

`requestDelete`'s own `if (userConfirmed)` check demonstrates the general
shape: a dangerous call reachable only from inside an explicit
confirmation step. The next lesson shows Android's own real mechanism
for actually asking the user in the moment.

## What Breaks Without This

Wiring a delete button directly to `deleteItem`, with no confirmation
step of any kind, makes permanent data loss exactly one mis-tap away,
with no chance to reconsider.

## Exercises

1. Modify `requestDelete` to also print the item's name when deletion is
   cancelled, and explain why `deleteItem` still never runs in that case.
2. Explain, in your own words, why `deleteItem` being unreachable except
   through `requestDelete` is a structural guarantee, not just a
   convention.
3. Attempt calling `deleteItem` directly from `main`, bypassing
   `requestDelete` entirely, and explain, in your own words, why this
   compiles — and what that implies about where the real safeguard
   actually needs to live in a bigger program.

## Definition of Done

- [ ] You ran the `requestDelete`/`deleteItem` example and can explain
      why `deleteItem` is never reachable without confirmation.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a
      confirmation step is a structural safeguard, not just a courtesy.
