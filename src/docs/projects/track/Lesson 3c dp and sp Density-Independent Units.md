# Lesson 3c: `dp` / `sp` — Density-Independent Units

**What you will build:** No new code — a real Android layout example,
read directly.

**What you need to know first:** Lesson 3b's constraint satisfaction
layout.

**Terms introduced in this lesson:**

- **`dp` / `sp` (density-independent units)** — Android size units that
  get automatically scaled per-device so the same value produces
  roughly the same physical size regardless of screen pixel density;
  `sp` additionally respects the user's system font-size accessibility
  setting.

---

## Concept Unit: `dp` / `sp` — Density-Independent Units

### The Problem

Even a correctly constrained layout still needs actual sizes for
padding, text, and spacing — and a size specified in raw pixels looks
physically smaller on a high-density screen than the identical pixel
count would on a lower-density one, since different devices pack
different numbers of physical pixels into the same physical space.

### Introduce the Concept in Isolation

A layout fragment, verified against the real Android layout schema:

```xml
<TextView
    android:layout_width="100dp"
    android:textSize="16sp" />
```

This is `dp` / `sp` — **first appearance**: Android size units that
get automatically scaled per-device so the same value produces
roughly the same physical size regardless of screen pixel density;
`sp` additionally respects the user's system font-size accessibility
setting. `android:layout_width="100dp"` produces roughly the same
physical width on a low-density and a high-density screen alike —
Android itself converts `dp` into the correct number of raw pixels for
each specific device's own density. `android:textSize="16sp"` does the
same for text size, with the additional behavior of scaling further if
the user has increased their device's system font size for
accessibility.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
layout XML.

### Mechanical Walkthrough

1. `android:layout_width="100dp"` — **(a) first appearance** of `dp`
   ("density-independent pixels"): a unit Android itself scales per
   device, rather than a raw pixel count interpreted identically
   everywhere.
2. `android:textSize="16sp"` — **(a) first appearance** of `sp`
   ("scale-independent pixels"): behaves like `dp` for density scaling,
   with the additional behavior of respecting the user's own
   system-wide font-size preference — a real, deliberate distinction
   from `dp`, worth keeping separate rather than treating the two units
   as interchangeable.

### CS Lens

`dp`/`sp` bake a real hardware correction — physical screen density —
into the unit itself, rather than leaving that correction to
per-device developer math. The same underlying idea — letting the
platform handle a real physical or environmental variance
automatically, rather than application code computing it manually —
recurs elsewhere in Android, a later lesson's own subject for resource
qualifiers specifically.

Also recognized in: points versus pixels on iOS (an almost identical
density-independent unit system, for the same underlying reason),
`rem` units in CSS (scaling relative to a root font size, respecting
user preference the same way `sp` does).

### SE Lens

The alternative — specifying every size in raw pixels, then computing
a density-correction factor manually in application code for every
value — was not chosen because it would need repeating at every single
size declaration throughout an app; baking the correction into the
unit itself means every `dp`/`sp` value is automatically correct on
every device, with no manual per-value math required anywhere.

---

## Connect the Pieces

Lesson 3a's view tree established relative position; Lesson 3b's
constraints established precisely how those relative positions are
computed. This lesson completes the picture: `dp`/`sp` ensure the
actual sizes used within a solved layout look physically consistent
across devices with different pixel densities, without any manual
per-device correction.

## What Breaks Without This

Specifying a size in raw pixels (`android:layout_width="100px"`)
instead of `dp` produces a real, visible inconsistency: the identical
value looks noticeably smaller on a high-density device than on a
lower-density one — not a crash or an error, but a real, visually
observable layout defect that only appears once the app actually runs
on more than one physical device.

## Exercises

1. Explain, in your own words, why `sp` is used for text size
   specifically, while `dp` is used for everything else (padding,
   widths, margins).
2. Explain, in your own words, why a raw-pixel-sized layout would look
   correct on the exact device it was designed on, but incorrect on
   others.
3. Explain, in your own words, what a user's increased system font
   size does to a `sp`-sized text element that it would not do to a
   `dp`-sized one.

## Definition of Done

- [ ] You read the `dp`/`sp` example and can explain what each unit
      scales for.
- [ ] You completed Exercise 1 and Exercise 3.
- [ ] You can state, without looking back at this lesson, the
      difference between `dp` and `sp`.
