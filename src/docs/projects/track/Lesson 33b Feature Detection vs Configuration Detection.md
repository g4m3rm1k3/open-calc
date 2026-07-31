# Lesson 33b: Feature Detection vs. Configuration Detection

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 33a's Resource Qualifiers.

**Terms introduced in this lesson:**

- **Feature Detection vs. Configuration Detection** — checking whether a
  capability or result actually exists and branching accordingly, rather
  than checking a device/configuration threshold number directly — more
  robust since it depends only on what's actually present, not on
  correctly guessing every configuration that might produce it.

---

## Concept Unit: Feature Detection vs. Configuration Detection

### The Problem

Deciding whether to show a two-pane, tablet-style layout versus a
single-pane phone layout could be based on checking a screen-width
threshold number directly in Java code — but that requires correctly
guessing every device configuration that should, and shouldn't, trigger
the two-pane layout, a real, ongoing maintenance burden as new device
sizes appear.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
View detailContainer = findViewById(R.id.detailContainer);

if (detailContainer != null) {
    showTwoPaneLayout();
} else {
    showSinglePaneLayout();
}
```

This is `Feature Detection vs. Configuration Detection` — **first
appearance**: checking whether a capability or result actually exists
and branching accordingly, rather than checking a device/configuration
threshold number directly — more robust since it depends only on what's
actually present, not on correctly guessing every configuration that
might produce it. `detailContainer` (Lesson 4j's own `findViewById`)
either exists — because the currently-active layout resource (chosen via
Lesson 33a's own resource-qualifier mechanism, based on screen size)
includes it — or it doesn't. The Java code never checks screen width
directly at all; it checks for the *actual presence* of the view the
layout resource decided to include.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `findViewById(R.id.detailContainer)` — **(b) reappearing** view-tree
   lookup from Lesson 4j, here specifically used to test for a view's
   presence rather than to configure a view already known to exist.
2. `if (detailContainer != null) { ... } else { ... }` — **(a) first
   appearance** of this specific pattern: branching on whether a real
   result actually exists, rather than on a separately-checked
   configuration value (like screen width) that would need to correctly
   predict whether that result exists.

### CS Lens

Feature detection checks the *actual, current reality* directly (does
this view exist right now); configuration detection checks a *proxy*
for that reality (is the screen wider than some threshold) and hopes the
proxy correctly predicts it. Feature detection is more robust precisely
because it has no proxy to get wrong — it directly observes what's
actually there, letting the layout resource (via resource qualifiers,
Lesson 33a) remain the single source of truth (Lesson 21c) for which
configurations get the two-pane treatment, rather than duplicating that
decision as a separate, hardcoded threshold in Java code.

Also recognized in: feature detection in web JavaScript (checking `if
('geolocation' in navigator)` rather than guessing which browsers support
it by version number), capability negotiation in network protocols
generally (asking "can you do X" rather than assuming based on a version
number).

### SE Lens

The alternative — checking `getScreenWidthDp() > 600` directly in Java
code — was not chosen because it duplicates a decision the layout
resource system already makes (via resource qualifiers), and risks
drifting out of sync with it: a layout qualifier folder added or changed
later, without a matching update to the hardcoded threshold check, would
silently produce the wrong result. Checking for the actual view's
presence instead means the layout resource stays the one, single place
that decision is made.

---

## Connect the Pieces

`detailContainer`'s presence or absence is Lesson 33a's own resource-
qualifier mechanism applied to entire layouts: the currently-active
layout resource, chosen the same way, either includes the detail pane or
doesn't — and checking for its actual presence, rather than re-deciding
based on a hardcoded screen-width threshold, is what keeps the layout
resource the single, authoritative source of that decision.

## What Breaks Without This

Hardcoding a screen-width threshold directly in Java code, duplicating
what a layout qualifier already decides, produces a real, silent
inconsistency the moment the two fall out of sync: a new qualifier
folder added for a genuinely new device class, with no matching update
to the hardcoded Java threshold, means the two-pane layout might display
while the Java code still believes it's showing the single-pane one — no
crash, no error, just a real, silent mismatch between what's actually on
screen and what the code assumes.

## Exercises

1. Explain, in your own words, why checking `detailContainer != null` is
   preferred over checking a screen-width value directly, connecting
   your answer to Lesson 21c's own single-source-of-truth reasoning.
2. Explain, in your own words, why a layout qualifier folder added later
   with no matching Java update produces a silent bug rather than a
   crash.
3. Name one other place in this course where checking for a real
   result's presence would be more robust than checking a proxy
   condition.

## Definition of Done

- [ ] You read the `detailContainer` feature-detection example and can
      explain why it doesn't check screen width directly.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why feature
      detection is described as more robust than configuration
      detection.
