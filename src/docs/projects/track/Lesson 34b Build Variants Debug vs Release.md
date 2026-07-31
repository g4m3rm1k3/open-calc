# Lesson 34b: Build Variants (Debug vs. Release)

**What you will build:** No new code to compile — this reads a real,
verified Gradle build configuration directly.

**What you need to know first:** Lesson 34a's Build Variant / Environment
Profile.

**Terms introduced in this lesson:**

- **Build Variants (Debug vs. Release)** — separate build configurations
  — at minimum debug and release — compiled from one shared codebase,
  differing in signing, debuggability, and code shrinking.

---

## Concept Unit: Build Variants — Debug vs. Release

### The Problem

Every run of an Android app throughout this course has used one
particular configuration, without ever naming it: fully debuggable,
signed with an insecure, auto-generated key, and completely unshrunk —
appropriate for a developer's own testing, and specifically wrong for
what should ever reach a real user's device.

### Introduce the Concept in Isolation

A real, verified Gradle build configuration snippet:

```
android {
    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
        }
        release {
            debuggable false
            minifyEnabled true
        }
    }
}
```

This is Android's own `Build Variants` — **first appearance**: separate
build configurations — at minimum debug and release — compiled from one
shared codebase, differing in signing, debuggability, and code
shrinking. `debug`, used implicitly by every run of this course's own
Android examples so far, is `debuggable` (a real debugger can attach to
it) and unshrunk (`minifyEnabled false`). `release` is the opposite on
both counts — the configuration meant for a real user's device, never
used by this course's own throwaway labs.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real build configuration shape, verified against the actual Gradle Android build DSL.

### Mechanical Walkthrough

1. `buildTypes { debug { ... } release { ... } }` — **(a) first
   appearance** of this specific configuration shape: two named build
   types, each with its own settings, both compiled from the exact same
   application source code.
2. `debuggable true` / `debuggable false` — controls whether a real
   debugger can attach to the running app; `true` for a developer's own
   testing, `false` for anything reaching a real user, for real security
   reasons the next lesson makes concrete.
3. `minifyEnabled true` / `minifyEnabled false` — controls whether a
   later shrinking step runs at all; covered fully two lessons ahead.

### CS Lens

Android's debug/release split is Lesson 34a's own general build-variant
concept, applied concretely: one shared Android codebase, two named
configurations, each suited to a different purpose (developer testing
versus real distribution) — with the application's own Java source never
needing two separate copies to support both.

Also recognized in: `Debug`/`Release` build configurations in Visual
Studio and most C/C++/C# tooling, `NODE_ENV=development` versus
`NODE_ENV=production` in Node.js projects — the same debug/production
split recurring across nearly every compiled or built software platform.

### SE Lens

The alternative — one single build configuration, used for both
development and real distribution — was not chosen because a
developer-friendly build (debuggable, unshrunk, easy to inspect) is
specifically the wrong shape to hand to a real user: it's larger than
necessary, easier to reverse-engineer, and exposes a real security
surface (an attachable debugger) that has no legitimate use once the app
is out of a developer's own hands.

---

## Connect the Pieces

`debug` and `release` are Lesson 34a's own build-variant idea, applied
concretely to Android. The next lesson shows a real requirement that
only applies to the `release` variant.

## What Breaks Without This

A single build configuration used for both development and real
distribution is larger than necessary, easier to reverse-engineer, and
exposes a real security surface that has no legitimate use once the app
is out of a developer's own hands.

## Exercises

1. Write, from scratch, a `staging` build type — a third variant beyond
   `debug`/`release`, `debuggable false` but `minifyEnabled false` — and
   explain, in your own words, what real purpose such a variant might
   serve.
2. Explain, in your own words, why `debug` is `debuggable true` while
   `release` is `debuggable false`.
3. Explain, in your own words, why this course's own Android examples
   have implicitly used the `debug` variant throughout.

## Definition of Done

- [ ] You read the debug/release build-type configuration and can state
      which one this course's own Android examples have used so far.
- [ ] You completed Exercise 1 and designed a coherent third build
      variant.
- [ ] You can state, without looking back at this lesson, why a
      developer-friendly build is the wrong shape for a real user.
