# Lesson 18c: Fragment Transaction

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 18b's `Fragment`.

**Terms introduced in this lesson:**

- **Fragment transaction** — Fragment changes (add/remove/replace)
  batched into an explicit transaction object, finalized by one commit
  call rather than each change taking effect immediately and
  independently.

---

## Concept Unit: Fragment Transaction

### The Problem

`InventoryListFragment` existing as a class is not the same as it
appearing on screen — something must explicitly place it inside a real
Activity's own view tree, at a real moment in time, or nothing changes
on screen at all.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
getSupportFragmentManager()
    .beginTransaction()
    .replace(R.id.fragmentContainer, new InventoryListFragment())
    .commit();
```

This is a `fragment transaction` — **first appearance**: Fragment
changes (add/remove/replace) batched into an explicit transaction
object, finalized by one commit call rather than each change taking
effect immediately and independently.
`getSupportFragmentManager().beginTransaction()` (Lesson 13d's own
builder-pattern shape) configures the operation step by step;
`.replace(...)` names which container and which `Fragment`; nothing
actually happens on screen before `.commit()` runs.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `getSupportFragmentManager().beginTransaction()` — **(b) reappearing**
   builder pattern from Lesson 13d, now configuring a Fragment operation
   step by step rather than a Room database.
2. `.replace(R.id.fragmentContainer, new InventoryListFragment())` —
   **(a) first appearance**: names the container view (Lesson 3a's own
   view tree) and the new `Fragment` instance to place inside it.
3. `.commit();` — **(a) first appearance**: the final step; nothing about
   the Fragment actually appears on screen before this exact call runs.

### CS Lens

A fragment transaction is the same builder-pattern shape (Lesson 13d)
applied to view-tree mutation: configure every piece of the change, then
commit it as one explicit, atomic step — rather than mutating the view
tree directly, piece by piece, with no single moment marking "the change
is now visible."

Also recognized in: transaction-style APIs across virtually every
framework needing an explicit, atomic "apply this batch of changes now"
step (database transactions, batched UI updates in various frameworks).

### SE Lens

The alternative — directly adding or removing views from the Activity's
own view tree by hand, without a dedicated transaction API — was not
chosen because `Fragment`'s own lifecycle (creation, view creation,
destruction) needs to be driven correctly alongside the view-tree change
itself; `FragmentManager`'s own transaction handles both together,
correctly, rather than leaving a developer to keep them in sync by hand.

---

## Connect the Pieces

A fragment transaction is the explicit, committed step that actually
places a `Fragment` into an Activity's view tree — nothing appears on
screen before `.commit()`. The next lesson shows a real, subtle cost of
`Fragment`'s own design once one is kept alive on a back stack.

## What Breaks Without This

Configuring a fragment transaction without ever calling `.commit()`
leaves the screen showing nothing new — every step up to that point had
no visible effect at all.

## Exercises

1. Explain, in your own words, why `.replace(...)` alone, without a
   following `.commit()`, produces no visible change on screen.
2. Add a second `.replace(...)` call on a different container ID within
   the same transaction, and explain what would appear once `.commit()`
   runs.
3. Explain, in your own words, why directly adding views to an
   Activity's own view tree by hand would fail to correctly drive a
   `Fragment`'s own lifecycle.

## Definition of Done

- [ ] You read the real fragment-transaction example and can explain
      what `.commit()` does that the earlier steps alone do not.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why Fragment
      changes are batched into an explicit transaction rather than
      applied immediately.
