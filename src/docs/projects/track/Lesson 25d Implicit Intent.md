# Lesson 25d: Implicit Intent

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 4f's `Intent`.

**Terms introduced in this lesson:**

- **Implicit Intent** — an Intent describing a desired action via a
  standard action string, without naming a specific target class,
  letting the OS resolve any installed app capable of handling it.

---

## Concept Unit: Implicit Intent

### The Problem

Lesson 4f's `Intent` always named a specific target class —
`SettingsActivity.class`, a class this project's own source code
declares and knows about at compile time. "Open the camera" cannot work
that way: this project has no camera Activity of its own, and no
compile-time knowledge of which camera app, if any, a given device even
has installed.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
startActivity(intent);
```

This is an `Implicit Intent` — **first appearance**: an Intent describing
a desired action via a standard action string, without naming a specific
target class, letting the OS resolve any installed app capable of
handling it. `MediaStore.ACTION_IMAGE_CAPTURE` names a standard, publicly
documented action — "capture an image" — not a specific class at all. The
Android OS itself resolves, at runtime, which installed app (if any)
declares it can handle that exact action, and launches it — this
project's own code never names, or even needs to know, which camera app
that turns out to be.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Intent(MediaStore.ACTION_IMAGE_CAPTURE)` — **(a) first
   appearance** of this constructor shape: unlike Lesson 4f's `new
   Intent(this, SettingsActivity.class)`, this constructor takes only an
   action string — no target class at all, because none is known or
   named by this project.
2. `startActivity(intent)` — **(b) reappearing** launch call from Lesson
   4f; the OS resolution — matching this action string against every
   installed app's own declared intent filters (Lesson 2i) — happens
   entirely inside this one call.

### CS Lens

An implicit intent is message passing through a broker (Lesson 4e) at
its most decoupled: the sender doesn't just avoid holding a direct
reference to the receiver — it doesn't even know the receiver's identity
at all, only the action it wants performed. The OS is the broker in the
fullest sense here, matching a request against every candidate app's own
declared capability (an `<intent-filter>` declaring
`android.media.action.IMAGE_CAPTURE`, the exact mechanism Lesson 2i
already established for the launcher icon itself).

Also recognized in: URL scheme handlers on other platforms (an app
registering to handle `mailto:` links, with the OS resolving which
installed app handles a given link at the moment it's tapped), any
capability-based request system where the requester describes what it
needs, not who should provide it.

### SE Lens

The alternative — this project shipping its own, hand-written camera
Activity — was not chosen because building and maintaining a full camera
implementation is real, substantial work already solved correctly by
existing camera apps on virtually every device; an implicit intent lets
this project request the capability generically, relying on whatever
camera app the device already has, rather than duplicating that work.

---

## Connect the Pieces

Lesson 4f's `Intent` named a specific target class, known at compile
time. `new Intent(MediaStore.ACTION_IMAGE_CAPTURE)` names only an action,
resolved by the OS at runtime against every installed app's own declared
capabilities — the same broker-mediated request Lesson 4f established,
now decoupled even further: the sender doesn't know, or need to know,
which specific app will actually handle it.

## What Breaks Without This

Launching an implicit intent for an action no installed app declares
support for throws a real runtime error, resembling:

```
android.content.ActivityNotFoundException: No Activity found to handle Intent { act=android.media.action.IMAGE_CAPTURE }
```

This is concrete proof the OS's resolution step is real and can fail — an
implicit intent is a request, not a guarantee, and code that sends one
must handle the possibility that no app on this particular device can
fulfill it.

## Exercises

1. Write a second implicit intent, using
   `Intent.ACTION_VIEW` with a web URL as its data, and explain, in your
   own words, what app a typical device would likely resolve this to.
2. Explain, in your own words, why `MediaStore.ACTION_IMAGE_CAPTURE`
   alone, with no target class, is enough information for the OS to find
   a working camera app.
3. Read the real `ActivityNotFoundException` message in "What Breaks
   Without This" and identify exactly which action it says found no
   handler.

## Definition of Done

- [ ] You read the real implicit-intent example and can explain what
      `MediaStore.ACTION_IMAGE_CAPTURE` represents.
- [ ] You can state, without looking back at this lesson, the difference
      between the explicit intent from Lesson 4f and this lesson's
      implicit one.
- [ ] You can state why an implicit intent might fail at runtime even
      though it compiles correctly.
