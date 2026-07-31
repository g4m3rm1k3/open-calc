# Lesson 44: Resource Qualifiers and Feature Detection

**What you will build:** Two real Android examples, read directly —
nothing here compiles with plain `javac`.

**What you need to know first:** Lesson 11's `Android resources`.

**Terms introduced in this lesson:**

- **Resource qualifiers** — the same resource name resolves to different
  actual files depending on the device's current configuration (dark
  mode, screen size, density, locale), selected automatically by the
  platform outside application code.
- **Feature detection vs. configuration detection** — checking whether a
  capability or result actually exists and branching accordingly, rather
  than checking a device/configuration threshold number directly — more
  robust since it depends only on what's actually present, not on
  correctly guessing every configuration that might produce it.

---

## Concept Unit: Resource Qualifiers

### The Problem

The identical resource name — a color, a layout — sometimes needs
genuinely different actual content depending on the device's current
configuration: a different color in dark mode, an entirely different
layout on a tablet-sized screen. Hardcoding a check for "is dark mode
on" directly in application code, then choosing between two differently-
named resources by hand, would need repeating at every single place a
themed resource is used.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android project structure,
verified against the actual framework behavior:

```
res/values/colors.xml           <!-- default -->
res/values-night/colors.xml     <!-- used automatically in dark mode -->
```

Both files declare the identical resource name:

```xml
<!-- res/values/colors.xml -->
<color name="background">#FFFFFF</color>
```

```xml
<!-- res/values-night/colors.xml -->
<color name="background">#000000</color>
```

This is `resource qualifiers` — **first appearance**: the same resource
name resolves to different actual files depending on the device's
current configuration (dark mode, screen size, density, locale),
selected automatically by the platform outside application code.
Application code always refers to `R.color.background` (Lesson 11's own
generated `R` class) — never checking dark mode directly and choosing a
file manually; Android itself selects the correct file, from the correct
qualified folder, based on the device's actual current configuration.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android project structure.

### Mechanical Walkthrough

1. `res/values/colors.xml` and `res/values-night/colors.xml` — **(a)
   first appearance** of a qualified resource folder: `-night` is a
   real, recognized qualifier suffix; Android selects this folder's own
   `colors.xml` automatically whenever the device is currently in dark
   mode, and the plain `values/colors.xml` otherwise.
2. `<color name="background">#FFFFFF</color>` and the equivalent
   `#000000` entry — **(b) reappearing** resource declaration shape from
   Lesson 11, with the identical `name` attribute in both files —
   exactly what lets `R.color.background` resolve correctly to whichever
   one is actually appropriate.

### CS Lens

Resource qualifiers let a *single symbolic reference*
(`R.color.background`) resolve to *different concrete data*, chosen by
the platform based on live, external context — the same general shape as
function overloading (Lesson 02), where one name resolves to different
real behavior based on context, applied here to data files rather than
method calls, and resolved by the platform's own configuration matching
rather than by argument types at compile time.

Also recognized in: internationalization/localization systems generally
(the same string key resolving to different translated text based on
the device's current language), responsive web design's own media
queries (the same visual intent, different concrete CSS rules, chosen
based on screen size).

### SE Lens

The alternative — checking "is dark mode currently on" directly in Java
code, at every single place a themed color is used, then choosing
between two differently-named resources by hand — was not chosen because
it would need repeating, correctly, at every single usage site; resource
qualifiers push that decision entirely into the resource system itself,
resolved once, automatically, with application code never needing to
know or check the current configuration at all for this purpose.

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

This is `feature detection vs. configuration detection` — **first
appearance**: checking whether a capability or result actually exists
and branching accordingly, rather than checking a device/configuration
threshold number directly — more robust since it depends only on what's
actually present, not on correctly guessing every configuration that
might produce it. `detailContainer` (Lesson 11's own `findViewById`)
either exists — because the currently-active layout resource (chosen via
this lesson's own resource-qualifier mechanism, based on screen size)
includes it — or it doesn't. The Java code never checks screen width
directly at all; it checks for the *actual presence* of the view the
layout resource decided to include.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `findViewById(R.id.detailContainer)` — **(b) reappearing** view-tree
   lookup from Lesson 11, here specifically used to test for a view's
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
actually there, letting the layout resource (via resource qualifiers)
remain the single source of truth (Lesson 37) for which configurations
get the two-pane treatment, rather than duplicating that decision as a
separate, hardcoded threshold in Java code.

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

`res/values-night/colors.xml`, alongside `res/values/colors.xml`,
established that the same resource name can resolve to genuinely
different content automatically, based on device configuration — the
platform's own job, not application code's. `detailContainer`'s presence
or absence is exactly this mechanism applied to entire layouts: the
currently-active layout resource, chosen the same way, either includes
the detail pane or doesn't — and checking for its actual presence, rather
than re-deciding based on a hardcoded screen-width threshold, is what
keeps the layout resource the single, authoritative source of that
decision.

## What Breaks Without This

Hardcoding a screen-width threshold directly in Java code, duplicating
what a layout qualifier already decides, produces a real, silent
inconsistency the moment the two fall out of sync: a new
qualifier folder added for a genuinely new device class, with no
matching update to the hardcoded Java threshold, means the two-pane
layout might display while the Java code still believes it's showing the
single-pane one — no crash, no error, just a real, silent mismatch
between what's actually on screen and what the code assumes.

## Exercises

1. Write a second qualified resource pair, for a string resource that
   should read differently on a `-land` (landscape) qualified folder
   versus the default, following the same shape as
   `values`/`values-night`.
2. Explain, in your own words, why checking `detailContainer != null` is
   preferred over checking a screen-width value directly, connecting
   your answer to this lesson's own single-source-of-truth reasoning.
3. Explain, in your own words, what would happen if a device's actual
   configuration matched no qualified folder at all for a given
   resource.

## Definition of Done

- [ ] You read the `values`/`values-night` example and can explain which
      file Android selects, and when.
- [ ] You read the `detailContainer` feature-detection example and can
      explain why it doesn't check screen width directly.
- [ ] You can state, without looking back at this lesson, why feature
      detection is described as more robust than configuration
      detection.
