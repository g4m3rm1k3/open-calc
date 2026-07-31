# Lesson 28: Refresh on Resume

**What you will build:** A real Android lifecycle-callback example, read
directly — nothing here compiles with plain `javac`.

**What you need to know first:** Lesson 10's `Activity lifecycle`.

**Terms introduced in this lesson:**

- **Refresh on resume** — re-reading potentially-changed state every time
  a screen becomes active again, rather than trusting a value read once
  at an earlier point is still current.

---

## Concept Unit: Refresh on Resume

### The Problem

A value read once, inside `onCreate` (Lesson 10), and never re-read
again, quietly becomes stale the moment something else changes it —
another screen updating a setting, for instance, that this screen already
read before that other screen ever opened. `onCreate` runs exactly once
per screen instance; it is not the right hook for state that might
change while a user has briefly navigated elsewhere and could come back
at any time.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
public class InventoryActivity extends Activity {
    private int lowStockThreshold;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        lowStockThreshold = loadThresholdFromSettings();
    }

    @Override
    protected void onResume() {
        super.onResume();
        lowStockThreshold = loadThresholdFromSettings();
        refreshList();
    }
}
```

This is `refresh on resume` — **first appearance**: re-reading
potentially-changed state every time a screen becomes active again,
rather than trusting a value read once at an earlier point is still
current. `lowStockThreshold` is read inside `onResume`, not only inside
`onCreate` — if the user navigates to a Settings screen, changes this
value, and presses Back, `onCreate` never runs again (Lesson 22's own
back-stack explanation: the original Activity was only paused, never
destroyed) — but `onResume` reliably fires on that exact return, which is
why it, not `onCreate`, is where re-reading potentially-stale state
belongs.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `protected void onCreate(Bundle savedInstanceState) { ...
   lowStockThreshold = loadThresholdFromSettings(); }` — **(b)
   reappearing** Activity lifecycle method from Lesson 10, reading the
   value once, at the screen's initial creation.
2. `protected void onResume() { ... lowStockThreshold =
   loadThresholdFromSettings(); refreshList(); }` — **(b) reappearing**
   the second of Lesson 10's six lifecycle methods, this time given real
   work to do: re-reading the exact same value, every single time this
   screen becomes active again, not only once.
3. `super.onResume();` — **(b) reappearing** parent-implementation call
   from Lesson 10, run before this Activity's own additional work, the
   same required pattern already established for `onCreate`.

### CS Lens

This is the Activity lifecycle (Lesson 10) put to genuine use: `onCreate`
answers "what does this screen need the very first time it exists,"
while `onResume` answers a different question — "what might have changed
while this screen wasn't the one visible on screen." Recognizing which
lifecycle method actually answers the question a given piece of code
needs answered is the real skill this lesson teaches, not memorizing six
method names in order.

Also recognized in: any long-lived UI component's own "became visible
again" hook across other frameworks (a web page's `visibilitychange`
event, a desktop window's own focus-regained event) — the general need
to re-check state on return recurring wherever a component can be
temporarily backgrounded and later revisited.

### SE Lens

The alternative — reading `lowStockThreshold` only once, inside
`onCreate`, and trusting it for the Activity's entire lifetime — was not
chosen because it produces a real, observable bug: a value changed
elsewhere while this screen was backgrounded silently fails to take
effect until the screen is fully destroyed and recreated (a configuration
change, or the user force-closing and reopening the app) — neither of
which a user would expect to be required just to see a setting they
already changed take effect.

---

## Connect the Pieces

`onCreate` reads `lowStockThreshold` once, when `InventoryActivity` is
first built. `onResume`, reliably fired every time this same Activity
instance becomes visible again — including after only being paused, not
destroyed, per Lesson 22's own back-stack explanation — re-reads that
same value, so a change made on a different screen and returned from is
never silently missed.

## What Breaks Without This

Reading `lowStockThreshold` only inside `onCreate` produces a real,
observable bug: changing the threshold on a Settings screen, then
pressing Back to return to `InventoryActivity`, shows the *old* value
still in effect — not because of any error or crash, but because nothing
ever re-read the setting after the screen was first created. This is the
concrete, silent failure mode `refresh on resume` exists to prevent.

## Exercises

1. Add a second piece of state, `String currentUserName`, following the
   exact same refresh-on-resume shape as `lowStockThreshold`.
2. Explain, in your own words, why `onResume` is a better fit for this
   pattern than `onStart` (also part of Lesson 10's own lifecycle,
   firing slightly earlier in the same sequence) — reasoning through the
   real difference rather than guessing.
3. Trace, on paper, exactly which lifecycle methods fire, in order, for
   `InventoryActivity` across: first launch, navigating to Settings,
   pressing Back to return.

## Definition of Done

- [ ] You read the `onCreate`/`onResume` example and can explain why the
      same read appears in both methods.
- [ ] You completed Exercise 1 and added a second, correctly-refreshed
      piece of state.
- [ ] You can state, without looking back at this lesson, what real bug
      results from reading changeable state only inside `onCreate`.
