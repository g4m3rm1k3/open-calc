# Lesson 18b: `Fragment`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 18a's two-phase construction,
Lesson 2e's Activity, Lesson 3a's view tree.

**Terms introduced in this lesson:**

- **`Fragment`** — a reusable, embeddable chunk of UI with its own
  related-but-distinct lifecycle, hosted inside an Activity's view tree
  instead of replacing it entirely.

---

## Concept Unit: `Fragment`

### The Problem

Every screen so far has been a whole Activity, each requiring its own
Manifest entry (Lesson 2h) and reached only through a full-screen
`Intent` navigation (Lesson 4f) — UI can't be embedded inside another
screen, or shown alongside something else on the same screen, if it can
only ever exist as an entire, standalone Activity.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
public class InventoryListFragment extends Fragment {
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_inventory_list, container, false);
    }
}
```

This is `Fragment` — **first appearance**: a reusable, embeddable chunk
of UI with its own related-but-distinct lifecycle, hosted inside an
Activity's view tree instead of replacing it entirely.
`InventoryListFragment` `extends` (Lesson 0l) `Fragment`, and supplies
its own view tree (Lesson 3a) via `onCreateView` — a two-phase shape
(Lesson 18a): the `Fragment` object exists first, and only later does
`onCreateView` produce the view it's actually safe to configure — but
unlike an Activity, it has no Manifest entry of its own and is never
reached through `startActivity`; it's hosted *inside* an existing
Activity's own view tree.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `public class InventoryListFragment extends Fragment` — **(b)
   reappearing** inheritance shape from Lesson 0l, this time extending
   Android's real `Fragment` base class.
2. `onCreateView(LayoutInflater inflater, ViewGroup container, Bundle
   savedInstanceState)` — **(a) first appearance**: the method a
   `Fragment` overrides to supply its own view tree — the direct
   equivalent of an Activity's own `setContentView`, but returning a
   `View` to be embedded rather than taking over the whole screen.
3. `inflater.inflate(R.layout.fragment_inventory_list, container,
   false);` — **(b) reappearing** layout-inflation shape from Lesson 6d,
   producing this `Fragment`'s own real view tree from XML.

### CS Lens

`Fragment` decouples "a self-contained chunk of UI and behavior" from
"an entire, standalone screen" — the same relationship a reusable
component has to a whole page in virtually any UI framework. Recognizing
"this needs to be embeddable, not a full screen" is the transferable
signal for reaching for this pattern.

Also recognized in: reusable UI components/widgets across virtually
every mainstream UI framework (React/Compose components, iframes on the
web) — the same underlying need for embeddable, reusable UI.

### SE Lens

The alternative — every reusable chunk of UI implemented as its own
Activity — was not chosen because an Activity always takes over the
entire screen and requires its own Manifest entry; `Fragment` allows the
exact same kind of reusable UI and behavior to be embedded inside another
screen, or shown alongside other content, neither of which a standalone
Activity can do.

---

## Connect the Pieces

`InventoryListFragment` supplies its own view tree via `onCreateView`,
embeddable inside an Activity rather than replacing it. The next lesson
shows the explicit step that actually places it there.

## What Breaks Without This

Every reusable chunk of UI implemented as its own Activity would require
its own Manifest entry and always take over the entire screen — there
would be no way to embed UI inside another screen, or show two pieces of
UI side by side.

## Exercises

1. Explain, in your own words, why `InventoryListFragment` has no
   Manifest entry, connecting your answer to Lesson 2h's own material.
2. Explain, in your own words, why `onCreateView` returns a `View`
   rather than the `Fragment` configuring the screen directly the way
   an Activity's `setContentView` does.
3. Explain, in your own words, how `Fragment`'s two-step shape
   (object first, view later) connects to Lesson 18a's own two-phase
   construction material.

## Definition of Done

- [ ] You read the real `Fragment`/`onCreateView` example and can explain
      what distinguishes it from an Activity.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why `Fragment`
      has no Manifest entry of its own.
