# Lesson 33a: Resource Qualifiers

**What you will build:** No new code to compile — this reads real
Android project structure directly.

**What you need to know first:** Lesson 2j's Android Resources.

**Terms introduced in this lesson:**

- **Resource Qualifiers** — the same resource name resolves to different
  actual files depending on the device's current configuration (dark
  mode, screen size, density, locale), selected automatically by the
  platform outside application code.

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

This is `Resource Qualifiers` — **first appearance**: the same resource
name resolves to different actual files depending on the device's
current configuration (dark mode, screen size, density, locale),
selected automatically by the platform outside application code.
Application code always refers to `R.color.background` (Lesson 2k's own
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
   Lesson 2j, with the identical `name` attribute in both files —
   exactly what lets `R.color.background` resolve correctly to whichever
   one is actually appropriate.

### CS Lens

Resource qualifiers let a *single symbolic reference*
(`R.color.background`) resolve to *different concrete data*, chosen by
the platform based on live, external context — the same general shape as
function overloading (Lesson 0h), where one name resolves to different
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

## Connect the Pieces

`res/values-night/colors.xml`, alongside `res/values/colors.xml`,
establishes that the same resource name can resolve to genuinely
different content automatically, based on device configuration. The
next lesson shows how application code should react to that same
mechanism applied to entire layouts.

## What Breaks Without This

Checking "is dark mode currently on" directly in Java code, at every
single place a themed color is used, would need repeating, correctly,
at every single usage site — a real, growing maintenance burden.

## Exercises

1. Write a second qualified resource pair, for a string resource that
   should read differently on a `-land` (landscape) qualified folder
   versus the default, following the same shape as
   `values`/`values-night`.
2. Explain, in your own words, why `R.color.background` never changes in
   application code, regardless of which file is actually selected.
3. Explain, in your own words, what would happen if a device's actual
   configuration matched no qualified folder at all for a given
   resource.

## Definition of Done

- [ ] You read the `values`/`values-night` example and can explain which
      file Android selects, and when.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why resource
      qualifiers are compared to function overloading.
