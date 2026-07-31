# Lesson 19b: Single-Activity Architecture

**What you will build:** No new code to compile — this reads a real,
documented Android architectural pattern directly.

**What you need to know first:** Lesson 19a's directed graph, Lesson
18b's `Fragment`.

**Terms introduced in this lesson:**

- **Single-Activity Architecture** — collapsing every screen in an app
  into Fragments hosted by one single Activity, rather than one Activity
  per screen.

---

## Concept Unit: Single-Activity Architecture

### The Problem

Five separate Activities, one per screen, each with its own Manifest
entry (Lesson 2h), is one valid way to structure an app — but it's not
the only way, and every one of those separate Activities makes the
app's own screen topology (Lesson 19a's own directed graph) harder to
see and validate as one connected structure, scattered instead across
five separate Manifest entries and however many hand-built `Intent`
calls connect them.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, documented Android
architectural pattern, verified against the actual framework
recommendation:

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); // hosts a NavHostFragment
    }
}
// Every screen — ItemListFragment, ItemDetailFragment, and so on — is a
// Fragment hosted inside this one Activity's own NavHostFragment.
```

This is `Single-Activity Architecture` — **first appearance**: collapsing
every screen in an app into Fragments hosted by one single Activity,
rather than one Activity per screen. `MainActivity` is the *only*
Activity in this design; every screen this course has previously
modeled as a separate Activity (Lesson 2e) becomes a `Fragment` (Lesson
18b) instead, all hosted inside `MainActivity`'s own single Manifest
entry.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, documented
Android architectural pattern.

### Mechanical Walkthrough

1. `public class MainActivity extends AppCompatActivity` — **(b)
   reappearing** Activity/inheritance shape from Lesson 2e, but now the
   *only* Activity the entire app declares.
2. `setContentView(R.layout.activity_main);` — **(b) reappearing** from
   Lesson 2e, hosting a `NavHostFragment` (not shown in full) rather than
   screen-specific content directly.
3. Every other screen becomes a `Fragment`, swapped in and out of that
   one host — no additional Activity, and no additional Manifest entry,
   is needed for any of them.

### CS Lens

Single-Activity architecture is what lets an app's own directed graph of
screens (Lesson 19a) be represented and validated as one connected
structure, rather than scattered across several separate Manifest
entries and hand-built `Intent`s — the concrete mechanism for declaring
that structure as data is the subject of the next lesson.

Also recognized in: single-page application architecture on the web (one
HTML document, many client-side-routed views) — the same underlying
shift from "one full page/screen per destination" to "one host, many
swapped-in views."

### SE Lens

The alternative — one Activity per screen, as this course has modeled
through Lesson 18 — was not chosen for this architecture because it
means separate Manifest entries and hand-built `Intent`s scattered
across the app; single-Activity architecture, built on `Fragment`,
consolidates the app's own screen topology into one host instead.

---

## Connect the Pieces

Collapsing every screen into Fragments hosted by one Activity is the
architectural shift; the next lesson shows the concrete mechanism —
declaring the app's own directed graph of screens as real, XML data.

## What Breaks Without This

One Activity per screen means separate Manifest entries and hand-built
`Intent`s scattered across the app, with nothing representing the full
screen topology as one connected, inspectable structure.

## Exercises

1. Explain, in your own words, why `MainActivity` is described as
   hosting screens rather than being one of them.
2. Explain, in your own words, why collapsing screens into Fragments
   reduces the number of Manifest entries an app needs.
3. Name one cost of single-Activity architecture — something that
   becomes harder, not easier, compared to one Activity per screen.

## Definition of Done

- [ ] You read the real `MainActivity` example and can explain what
      makes it the *only* Activity in this design.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what
      single-Activity architecture replaces.
