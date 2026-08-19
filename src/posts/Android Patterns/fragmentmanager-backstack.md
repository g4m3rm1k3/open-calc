# A Reversible History Within One Screen: FragmentManager's Back Stack

**What problem this solves.** Within a single screen, an app may want
to show a sequence of different content over time and let the user
navigate backward through that sequence with the same "back"
gesture used everywhere else in the system — without spinning up an
entirely new, full-screen `Activity`, with all of its own separate
lifecycle and window overhead, for what's conceptually just a sub-view
within one larger screen. The abstract fix: let sub-views themselves be
swappable, independently manageable units, and maintain an explicit,
ordered history of which ones have been shown, so that navigating
backward means undoing the most recent swap and returning to whatever
was there before — the same mental model as navigating between full
screens, applied one level down.

**Classic pattern family.** Not a clean Gang-of-Four fit either — this
resembles Memento's "state to return to later" and Command's "undo
stack" example, but the real subject here — an ordered, reversible
history of *view swaps within one screen* — is Android's own specific
navigation mechanism, not a direct instance of either.

**Where you'll meet it in Android.**
`androidx.fragment.app.FragmentManager`, through its
`beginTransaction()` → `replace()` → `addToBackStack()` → `commit()`
chain, and `popBackStack()`.

**Terms used in this pattern.**

- **Method chaining** — calling one method directly on the return value
  of the previous call, letting a sequence of configuration calls read
  as one continuous statement. Used here for the same underlying reason
  a Builder chain is: a `FragmentTransaction` is configured step by
  step before it's finally applied as one unit.

**Objects and methods used.**

- **`FragmentManager`**
  *What it is:* a class managing the set of `Fragment`s attached to an
  `Activity` (or a parent `Fragment`) and their own back stack.
  *Implementation:* obtained via `getSupportFragmentManager()`; exposes
  `beginTransaction()` and `popBackStack()`.
  *Its use:* the actual owner of both which `Fragment` is currently
  shown and the ordered history of previously shown ones — the direct
  analogue, one level down, of what the whole-`Activity` back stack does
  between full screens.
- **`FragmentManager.beginTransaction()`**
  *What it is:* an instance method on `FragmentManager`, returning
  `FragmentTransaction`.
  *Implementation:* `public FragmentTransaction beginTransaction()`.
  *Its use:* starts building a description of a set of changes to
  apply, without applying any of them yet — nothing about the
  currently-shown `Fragment` changes until this transaction is
  committed.
- **`FragmentTransaction.replace(int containerId, Fragment fragment)`**
  *What it is:* an instance method on `FragmentTransaction`, returning
  `FragmentTransaction`.
  *Implementation:* `public FragmentTransaction replace(int
  containerViewId, Fragment fragment)`.
  *Its use:* records, within this transaction, that whatever `Fragment`
  currently occupies the given container should be removed and this
  new one put in its place — not yet actually performed.
- **`FragmentTransaction.addToBackStack(String name)`**
  *What it is:* an instance method on `FragmentTransaction`, returning
  `FragmentTransaction`.
  *Implementation:* `public FragmentTransaction addToBackStack(@Nullable
  String name)`.
  *Its use:* the one call that actually makes this transaction
  reversible — marks it to be recorded onto the ordered back-stack
  history, so a later pop can undo it; without this call, a `replace`
  still happens but leaves nothing behind to navigate back to.
- **`FragmentTransaction.commit()`**
  *What it is:* an instance method on `FragmentTransaction`, returning
  `int`.
  *Implementation:* `public int commit()`.
  *Its use:* the point everything actually happens — every change
  recorded since `beginTransaction()` is applied together, as one unit,
  only now.
- **`FragmentManager.popBackStack()`**
  *What it is:* an instance method on `FragmentManager`, returning
  `void`.
  *Implementation:* `public void popBackStack()`.
  *Its use:* reverses the most recently added back-stack entry,
  restoring whatever `Fragment` state existed immediately before it was
  added — the actual "undo" half of this whole mechanism.

---

## The Shape

Four participants:

- **`FragmentManager`** — owns both the currently displayed
  `Fragment`(s) and the ordered back-stack history.
- **`FragmentTransaction`** — a temporary, Builder-like object
  describing a batch of changes before they're actually applied.
- **The back stack itself** — an ordered list of recorded transactions,
  most-recent on top, that `popBackStack()` reverses one at a time.
- **The container `View`** (`R.id.fragment_container`) — the fixed spot
  in the layout a `Fragment`'s own view actually gets placed into,
  regardless of which `Fragment` currently occupies it.

The relationship: nothing changes on screen the moment `replace(...)` is
called — only once `commit()` runs does `FragmentManager` actually swap
the container's contents. `addToBackStack(...)`, called somewhere in
between, is what turns an otherwise irreversible swap into one
`FragmentManager` remembers and can later undo — a transaction committed
without it simply happens, with no record left behind for the system's
own back button or gesture to find and reverse.

```
   FragmentManager
        |
        |  beginTransaction()
        v
   FragmentTransaction (not yet applied)
        |  .replace(containerId, newFragment)
        |  .addToBackStack("contact_detail")
        |  .commit()
        v
   container View's contents swapped; a new entry pushed onto
   the back stack, recording what was there before

   [ previous Fragment state ]  <- popBackStack() returns to this
   [ current Fragment state  ]  <- currently shown
```

---

## Mechanical Walkthrough

```java
getSupportFragmentManager()
        .beginTransaction()
        .replace(R.id.fragment_container, new ContactDetailFragment())
        .addToBackStack("contact_detail")
        .commit();
```

- **`getSupportFragmentManager()`** — obtains the `FragmentManager`
  already owned by this `Activity`; not itself constructed here, only
  referenced.
- **`.beginTransaction()`** — the first link in the chain, producing a
  fresh `FragmentTransaction` with nothing recorded on it yet.
- **`.replace(R.id.fragment_container, new ContactDetailFragment())`**
  — records what should happen: whatever currently occupies this
  container should be swapped for a brand-new `ContactDetailFragment`.
  Constructing the `Fragment` here does not display it — display only
  happens once this whole chain reaches `commit()`.
- **`.addToBackStack("contact_detail")`** — records, on the same
  transaction, that this whole batch of changes should be remembered as
  a single reversible unit; the string name is an optional label for
  this specific entry, not required for the mechanism itself to work.
- **`.commit()`** — the final link, and the only one that actually
  applies anything: the container's contents change on screen, and a
  new entry is pushed onto `FragmentManager`'s own back stack in this
  same step.

---

## Collaboration — how it actually runs

1. `beginTransaction()` runs, producing a fresh `FragmentTransaction`
   with nothing recorded on it yet.
2. `.replace(...)` records, on that same transaction object, what
   should happen — still nothing applied.
3. `.addToBackStack(...)` records, on that same transaction, that this
   whole batch of changes should be remembered as a reversible unit.
4. `.commit()` applies everything recorded in steps 2 and 3 together:
   the container's contents actually change on screen, and a new entry
   is pushed onto `FragmentManager`'s own back stack, describing how to
   undo this exact transaction.
5. Later, when the user presses the system back button — handled
   automatically by `FragmentManager` once a back-stack entry exists, in
   typical setups — or app code explicitly calls `popBackStack()`,
   `FragmentManager` reverses the most recently pushed transaction,
   restoring the container to whatever `Fragment` occupied it
   immediately before step 4 ran.

---

## Why It's Shaped This Way

The design principle is giving sub-screen navigation, within a single
`Activity`, **the same ordered, reversible-history model the system
already provides between whole `Activity`s**, without paying the cost
of a full `Activity` — its own separate window, its own full lifecycle
— for what's conceptually a smaller unit of navigation.

The alternative not chosen: a separate full `Activity` for every
navigable unit, relying entirely on the system's own `Activity` back
stack. The real cost avoided by `Fragment`s here: every `Activity`
transition involves real window-level overhead and a full lifecycle
reset, which is wasteful for navigation that's really happening within
one coherent screen — a list, then a detail view, sharing the same
overall layout chrome. `Fragment`s let that shared layout persist while
only the swappable part changes.

The cost this pattern itself carries: the whole
`beginTransaction`/`replace`/`addToBackStack`/`commit` sequence is more
to write and reason about than a single method call, and forgetting
`addToBackStack` specifically is a real, easy, silent mistake — the
swap itself still visibly works, so nothing about testing the forward
navigation alone reveals that back navigation has been left broken.

---

## Recognizing It Elsewhere

Also recognized in: a web browser's own history stack, where each
visited page is a reversible entry the back button pops one at a time;
a graphics editor's undo history, an ordered stack of past states, each
one reversible in turn; a wizard-style multi-step form, where each step
is pushed as a reversible unit so "back" returns to the previous step's
exact state rather than resetting the whole form.

---

## Where This Actually Breaks

The most common real mistake: calling `replace(...).commit()` without
`addToBackStack(...)` for a navigation the user would naturally expect
"back" to undo. Nothing about this fails loudly: the new `Fragment`
appears correctly, and the app looks completely correct in the moment.
The bug only surfaces later, when the user presses back expecting to
return to the previous view and instead exits the `Activity` entirely
(or sees nothing happen at all), because `FragmentManager` has no
record of anything to reverse.
