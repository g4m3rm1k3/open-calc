# Lesson 32: Two-Phase Construction

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons. Today's case study: separating "the object exists"
from "the object is safe to configure."

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Two-phase construction/initialization** — separating "produce the
  object" from "the object now exists, safe to configure" into two
  distinct steps or methods, because the moment a thing is fully
  constructed isn't always the moment it's safe to configure.

---

## Concept Unit: Two-Phase Construction

### The Problem

A constructor's job, so far, has always been "build the object and it's
immediately ready." Some objects genuinely can't work that way — a
constructor might produce something whose *own internal pieces* aren't
fully wired up yet, needing a distinct, later step before it's actually
safe to configure further, even though the object technically already
exists.

### Introduce the Concept in Isolation

```
mkdir lesson-32
cd lesson-32
```

Create `Main.java`:

```java
class Panel {
    java.util.List<String> labels = new java.util.ArrayList<>();

    void addLabel(String text) {
        labels.add(text);
    }
}

class PanelBuilder {
    Panel buildEmptyPanel() {
        System.out.println("Phase 1: panel produced, but not yet configured.");
        return new Panel();
    }

    void configurePanel(Panel panel) {
        System.out.println("Phase 2: panel now exists, safe to configure.");
        panel.addLabel("Name");
        panel.addLabel("Quantity");
    }
}

public class Main {
    public static void main(String[] args) {
        PanelBuilder builder = new PanelBuilder();

        Panel panel = builder.buildEmptyPanel();
        builder.configurePanel(panel);

        System.out.println("Labels: " + panel.labels);
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
Phase 1: panel produced, but not yet configured.
Phase 2: panel now exists, safe to configure.
Labels: [Name, Quantity]
```

`buildEmptyPanel()` and `configurePanel(panel)` are two distinct, separate
steps rather than one constructor doing everything. This is `two-phase
construction/initialization` — **first appearance**: separating "produce
the object" from "the object now exists, safe to configure" into two
distinct steps or methods, because the moment a thing is fully
constructed isn't always the moment it's safe to configure.
`buildEmptyPanel()`'s only job is producing a real `Panel`; only once
that's returned does `configurePanel(...)` add labels to it, guaranteed a
real, complete `Panel` already exists to configure.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Panel buildEmptyPanel() { ... return new Panel(); }` — **(a) first
   appearance** of phase one: produces and returns a real object, doing
   nothing more.
2. `void configurePanel(Panel panel) { ... panel.addLabel(...); }` —
   **(a) first appearance** of phase two: receives the already-produced
   object as a parameter and configures it further, guaranteed to run
   only after phase one has genuinely completed.
3. `Panel panel = builder.buildEmptyPanel(); builder
   .configurePanel(panel);` — the two phases called explicitly, in
   sequence, by `main` — nothing hides this split; it's visible directly
   at the call site.

### CS Lens

Two-phase construction separates *existence* from *readiness*: an object
can be fully allocated and referenceable (phase one complete) while still
not being in a state that's safe to configure further (phase two not yet
run). This distinction matters most when phase one's own internals aren't
fully wired up the instant the constructor returns — a real, specific
situation, not merely an arbitrary style preference.

Also recognized in: two-step object initialization patterns in many UI
frameworks generally (a widget produced in one step, attached to its
parent and made interactive in a distinct, later step), factory methods
that return a partially-configured object for further setup, builder
patterns with a final, explicit `.build()` step.

### SE Lens

The alternative — one constructor doing everything, immediately — was not
chosen for objects where the safe-to-configure moment genuinely comes
later than the exists moment. Splitting construction into two explicit
phases makes that distinction visible and structural, rather than hidden
inside one constructor's own internal ordering that calling code has no
way to observe or rely on.

---

## Connect the Pieces

`buildEmptyPanel()` produces a real `Panel` — phase one, complete.
`configurePanel(panel)` — phase two — only then adds labels, guaranteed
a real object already exists to receive them. The two phases are visible
and explicit at the call site in `main`, not hidden inside one
constructor pretending both happen at once.

## What Breaks Without This

Calling `configurePanel` before `buildEmptyPanel` has actually run —
attempting to pass a `Panel` that was never produced — fails to compile,
since there is no `Panel` reference to pass at all until phase one
completes:

```java
Panel panel; // declared, but never assigned
builder.configurePanel(panel); // no value to pass
```

```
error: variable panel might not have been initialized
        builder.configurePanel(panel);
                                ^
```

This is concrete proof the two phases have a real, enforced order —
phase two genuinely cannot run without phase one's own output already in
hand.

## Exercises

1. Add a third label via a second `configurePanel` call on the same
   `Panel`, and confirm both configuration calls accumulate correctly
   on the one object.
2. Explain, in your own words, a real situation (not necessarily from
   this lesson) where combining both phases into one constructor would
   be perfectly fine — reasoning about when the two-phase split is
   actually needed, versus when it's unnecessary ceremony.
3. Attempt the "What Breaks Without This" example yourself, read the
   real compiler error, then fix it by calling `buildEmptyPanel()`
   first.

## Definition of Done

- [ ] You ran the two-phase example and saw the real, ordered output.
- [ ] You attempted to skip phase one, saw the real "might not have been
      initialized" compiler error, and fixed it.
- [ ] You can state, without looking back at this lesson, the difference
      between an object existing and an object being safe to configure.
