# Lesson 34d: R8 (Code Shrinking, Optimization, Obfuscation)

**What you will build:** No new code to compile — this reads a real,
verified build configuration directly.

**What you need to know first:** Lesson 34b's Build Variants.

**Terms introduced in this lesson:**

- **R8 (Code Shrinking, Optimization, Obfuscation)** — a build step
  removing unused classes/methods/resources (tree-shaking), rewriting
  bytecode for size and speed (optimization), and renaming identifiers to
  meaningless names (obfuscation) — run automatically for release
  builds.

---

## Concept Unit: R8 — Code Shrinking, Optimization, and Obfuscation

### The Problem

A debug build, unshrunk, ships every class this app and its libraries
define, completely intact, with every original class and method name
still readable — larger than necessary for a real user to download, and
trivially easy for anyone to open and read the app's own internal
structure and logic.

### Introduce the Concept in Isolation

The same build-type configuration from Lesson 34b, revisited:

```
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt")
    }
}
```

`minifyEnabled true` triggers `R8` — **first appearance**: a build step
removing unused classes/methods/resources (tree-shaking), rewriting
bytecode for size and speed (optimization), and renaming identifiers to
meaningless names (obfuscation) — run automatically for release builds.
A class or method never actually referenced anywhere in the final app is
stripped out entirely; a class named `InventoryValidator` might become a
class named `a` in the final, released bytecode — functionally
identical, but no longer readable as "the validation logic" by anyone
inspecting the compiled app.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real build configuration shape, verified against the actual Gradle Android build DSL.

### Mechanical Walkthrough

1. `minifyEnabled true` — **(b) reappearing** setting from Lesson 34b,
   now shown as the actual trigger for R8's whole pipeline rather than
   just named.
2. `proguardFiles getDefaultProguardFile("proguard-android-optimize.txt")`
   — **(a) first appearance**: names a real configuration file
   controlling exactly which rules R8 follows — which classes are safe to
   rename or remove, and which must be kept exactly as declared (a class
   only ever referenced by name as a string, for instance, would be
   silently broken if R8 renamed it without being told not to).

### CS Lens

R8's three jobs are genuinely distinct, even though one setting enables
all three at once: tree-shaking removes code that provably can't be
reached; optimization rewrites remaining bytecode into an equivalent,
faster or smaller form; obfuscation renames identifiers, trading
human-readability for both a smaller download and real resistance to
casual reverse-engineering.

Also recognized in: minifiers for JavaScript (Terser, UglifyJS — the same
three-job shape, applied to a different bytecode target), any compiled
language's own "release mode" optimizer, ProGuard (R8's own direct
predecessor, still the name of the rule-file format R8 itself reads).

### SE Lens

The alternative — shipping every release build exactly as written, fully
readable, with no shrinking at all — was not chosen because a debug-sized,
fully-readable build is strictly worse for a real user: larger to
download, slower, and offering no resistance at all to casual inspection
of the app's own internal logic. The real cost: R8's renaming can break
code that depends on a class's original name at runtime (reflection) —
the next lesson names this exact failure mode directly.

---

## Connect the Pieces

`release` additionally triggers R8, shrinking and obfuscating the final
compiled app — none of this touches the application's own Java source
code directly; it's configuration layered on top of the exact same code
already written. The next lesson names a real limit on what R8 can
safely shrink.

## What Breaks Without This

Shipping a fully-readable, unshrunk release build is strictly worse for
a real user: larger to download, slower, and offering no resistance at
all to casual inspection of the app's own internal logic.

## Exercises

1. Explain, in your own words, why tree-shaking, optimization, and
   obfuscation are described as "genuinely distinct" jobs, even though
   one setting enables all three.
2. Explain, in your own words, why a class named `InventoryValidator`
   becoming a class named `a` doesn't change the app's own behavior.
3. Name one real cost of obfuscation (besides breaking reflection) that
   a development team might need to account for.

## Definition of Done

- [ ] You read the R8 configuration and can explain what `minifyEnabled
      true` actually triggers.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, R8's three
      distinct jobs.
