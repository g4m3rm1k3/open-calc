# Lesson 24c: Permission Rationale State Machine

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 24b's Runtime Permission Model.

**Terms introduced in this lesson:**

- **Permission Rationale State Machine** — a small state machine layered
  on top of a seemingly binary yes/no permission — distinguishing "ask
  normally" from "explain first" from "permanently denied, guide to
  Settings" — because a single boolean can't express all three.

---

## Concept Unit: The Permission Rationale State Machine

### The Problem

A simple granted/denied check, from Lesson 24b, cannot actually
distinguish every real state a permission request can be in. A user who
denied once, but might reasonably grant it if they understood why it's
needed, is in a genuinely different situation than a user who denied it
and told Android never to ask again — treating both the same way,
respecting neither of those specific, different outcomes, is a real,
common mistake.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        == PackageManager.PERMISSION_GRANTED) {
    openCamera();
} else if (shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)) {
    showExplanationDialog();
} else {
    requestPermissionLauncher.launch(Manifest.permission.CAMERA);
}
```

This is a `Permission Rationale State Machine` — **first appearance**: a
small state machine layered on top of a seemingly binary yes/no
permission — distinguishing "ask normally" from "explain first" from
"permanently denied, guide to Settings" — because a single boolean can't
express all three. `shouldShowRequestPermissionRationale` returns `true`
specifically when the user has denied once before, but hasn't
permanently blocked future requests — exactly the case where showing a
brief explanation, then asking again, is the correct next step, distinct
both from a fresh first-time request and from a permanently-denied state
this same check cannot detect at all (that third state requires guiding
the user to the device's own system settings manually, outside this
lesson's own excerpt).

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `ContextCompat.checkSelfPermission(...) ==
   PackageManager.PERMISSION_GRANTED` — **(b) reappearing** granted check
   from Lesson 24b, still the first branch checked.
2. `shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)` —
   **(a) first appearance**: a real, distinct query, separate from the
   granted check, answering "has this been denied before, in a way that
   still allows asking again" — `true` only in that specific
   in-between state.
3. `showExplanationDialog()` — a placeholder for real UI (not shown in
   full here) explaining why the permission matters, shown specifically
   before asking again, in this one specific state.
4. The final `else` branch — reached only when neither of the above is
   true: either a genuinely first-time request, or a permanently-denied
   one that `shouldShowRequestPermissionRationale` itself cannot
   distinguish from a first-time request (both return `false`) — a real,
   documented limitation this lesson names rather than glosses over.

### CS Lens

A **state machine** is a system with a fixed set of named states and
rules for moving between them — here, three real states ("not yet asked
or already granted," "denied once, can ask again," "denied permanently")
where a single `boolean` could only ever represent two. Recognizing that
a seemingly yes/no question actually has three meaningfully different
answers, and modeling all three explicitly, is what this permission flow
requires to behave correctly in every real situation a user might put it
in.

Also recognized in: any UI wizard with more states than a simple on/off
toggle (a form field that's valid, invalid-but-not-yet-submitted, or
invalid-and-submitted, each needing different visual treatment), traffic
light logic (red, yellow, green — never modeled as a single boolean), any
retry-with-backoff system distinguishing "first attempt," "retrying,"
and "given up permanently."

### SE Lens

The alternative — treating every non-granted state identically, always
just requesting the permission again — was not chosen because it
produces a real, frustrating loop for a user who's already permanently
denied the permission: repeatedly showing a system prompt that Android
itself will no longer display, leaving the app's own UI apparently doing
nothing with no explanation. Modeling all three states explicitly is what
lets the app show a genuinely different, correct message for "please
enable this in Settings" versus "here's why we're asking again."

---

## Connect the Pieces

`shouldShowRequestPermissionRationale` refines Lesson 24b's own runtime
check further, distinguishing three real states a bare granted/denied
check cannot tell apart, so the app can respond correctly to each one
instead of treating "denied once" and "denied forever" as the same
situation. The next lesson names a general principle this same code
already follows.

## What Breaks Without This

Treating every non-granted state identically produces a real,
frustrating loop for a user who's already permanently denied the
permission: repeatedly showing a system prompt that Android itself will
no longer display.

## Exercises

1. Write out, in your own words, what UI text `showExplanationDialog()`
   should reasonably contain, given it's shown specifically to a user
   who already denied once.
2. Explain, in your own words, why `shouldShowRequestPermissionRationale`
   cannot distinguish a first-time request from a permanently-denied one.
3. Draw, on paper, the three states this state machine models and the
   conditions that move between them.

## Definition of Done

- [ ] You read the three-branch rationale state machine and can name all
      three states it distinguishes.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a single
      `boolean` cannot correctly represent every real permission state.
