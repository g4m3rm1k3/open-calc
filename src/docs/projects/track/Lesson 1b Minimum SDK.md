# Lesson 1b: Minimum SDK

**What you will build:** No new code — this reads a real, verified
build setting directly.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Minimum SDK** — the oldest Android API version an app declares it
  supports; a device running an older version than this cannot install
  the app at all.

---

## Concept Unit: Minimum SDK

### The Problem

Every version of Android adds new capabilities; not every device in
use runs the newest version. An app relying on a capability only
available in a recent Android version needs some way to say,
explicitly, "this app requires at least this version" — otherwise it
might install and immediately fail on an older device that simply
doesn't have the capability it depends on.

### Introduce the Concept in Isolation

A real, verified build configuration line:

```
android {
    defaultConfig {
        minSdk 24
    }
}
```

This is `minimum SDK` — **first appearance**: the oldest Android API
version an app declares it supports; a device running an older version
than this cannot install the app at all. `minSdk 24` means any device
running an Android version older than API level 24 is blocked from
installing this app entirely — the Play Store itself enforces this,
before the app is ever downloaded.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
build setting.

### Mechanical Walkthrough

1. `minSdk 24` — **(a) first appearance.** A single integer, an
   Android API level, the floor below which installation is blocked
   outright — not a suggestion or a runtime check, an install-time
   gate.

### CS Lens

Minimum SDK is a version-compatibility floor, conceptually identical
to a `.NET` project's target framework version, or a browser-support
matrix for a website — a declared minimum below which the software is
known, upfront, not to work correctly.

Also recognized in: an iOS app's own Deployment Target setting,
semantic versioning's own minimum-version dependency declarations — the
same "declare the floor" shape recurring.

### SE Lens

The alternative — supporting every Android version ever released, with
no floor at all — was not chosen because it would mean every new API a
developer wants to use must first be checked, by hand, for
availability on every older version still in use, at every single call
site. Declaring a minimum SDK lets a project use any capability
available at or above that floor freely, without repeated per-call
availability checks.

---

## Connect the Pieces

`minSdk 24` declares the oldest Android version this app will even
attempt to run on — one of several small, silently-present facts a
project's own build configuration establishes from day one.

## What Breaks Without This

Installing an app on a device running an Android version older than
its declared `minSdk` is blocked entirely by the Play Store (or by
`adb install` directly, on a real device), with a real, concrete error
resembling `INSTALL_FAILED_OLDER_SDK` — the block itself is real and
enforced before the app ever runs.

## Exercises

1. Explain, in your own words, what would happen if `minSdk` were set
   higher than a specific device's actual installed Android version.
2. Explain, in your own words, why a project would choose a lower
   `minSdk` (supporting more devices) versus a higher one (supporting
   fewer devices but unlocking newer APIs).
3. Look up the current Android API level distribution (from any public
   source) and identify what `minSdk` value would cover roughly 90% of
   active devices today.

## Definition of Done

- [ ] You can state, without looking back at this lesson, what
      `minSdk` actually blocks, and when that block is enforced.
- [ ] You completed Exercise 1 and Exercise 2.
