# Lesson 36: Transitions Between Screens

**What you will build:** A consistent slide animation applied to every
screen-to-screen navigation already built — login to grid, grid to
notifications, and back — replacing Android's default abrupt cut with a
deliberate, uniform motion. The transferable problem: every navigation in
this app already works correctly (Milestones 4 and 6 proved that); what's
missing is purely perceptual — nothing currently tells a user "you moved
forward into something" versus "you moved back to where you were,"
because every transition currently looks identical to every other.

**What you need to know first:** Lesson 17 (`startActivity`, the
Manifest entries for each screen), Lesson 31 (the Notifications screen).

**Terms introduced in this lesson:**
- **`overridePendingTransition` (the option this project builds)** — an
  `Activity` method setting a custom enter/exit animation pair for the
  transition immediately following a `startActivity` or `finish` call.
- **`overrideActivityTransition` (recognition, real alternative)** — the
  newer replacement API, added in Android 14 (API level 34), with an
  additional background-color parameter, and only usable on that API
  level or higher.

---

## Concept Unit: Two Real Ways to Customize a Transition

### The Problem

By default, Android's transition between two Activities is an abrupt cut
with, at most, a generic system fade — communicating nothing about
*direction* (moving forward into a new screen versus moving back to a
previous one).

### Option A — `overridePendingTransition` (works on every API level this project targets)

```java
Intent intent = new Intent(this, InventoryActivity.class);
startActivity(intent);
overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left);
```

### Option B — `overrideActivityTransition` (Android 14 / API 34 and above only)

```java
overrideActivityTransition(
    Activity.OVERRIDE_TRANSITION_OPEN,
    R.anim.slide_in_right,
    R.anim.slide_out_left,
    Color.WHITE);
```

### The Tradeoff

`overridePendingTransition` is deprecated as of API level 34, but remains
fully functional there and is the only one of the two that works at all
on any device running an older Android version — a real, practical
concern, since a typical Android project's minimum supported version
(`minSdk`, set once back in Lesson 05's wizard) is very likely well below
34, meaning `overrideActivityTransition` alone would simply crash or fail
to compile against devices this project is otherwise built to support.
`overrideActivityTransition` adds one genuine improvement — an explicit
background color parameter, smoothing a visual gap the older API could
leave between the outgoing and incoming screens on some devices — at the
cost of only working on the newest Android versions.

**This project uses `overridePendingTransition`**, since it's the only
one of the two that actually works across this project's real supported
device range. A production app whose `minSdk` is deliberately set to 34
or higher — a real, valid choice for an app targeting only the newest
devices — would correctly prefer `overrideActivityTransition` instead,
with no other change to the animation resources this lesson builds next.

### Project Change

- **Reference Source:** No external framework signature beyond the two
  method signatures already shown above, both real and confirmed against
  Android's own API documentation this session.
- **Files affected:** New files `app/src/main/res/anim/slide_in_right.xml`,
  `slide_out_left.xml`, `slide_in_left.xml`, `slide_out_right.xml`;
  `InventoryActivity.java`; `MainActivity.java`.
- **Change type:** Create four new animation resource files; add one
  line after each existing `startActivity` call.
- **Dependencies:** None new.

### The New Code

`res/anim/slide_in_right.xml` — a new screen entering from the right,
for forward navigation:

```xml
<?xml version="1.0" encoding="utf-8"?>
<translate
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromXDelta="100%"
    android:toXDelta="0%"
    android:duration="250" />
```

`res/anim/slide_out_left.xml` — the previous screen exiting to the left,
paired with the entrance above:

```xml
<?xml version="1.0" encoding="utf-8"?>
<translate
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromXDelta="0%"
    android:toXDelta="-30%"
    android:duration="250" />
```

`slide_in_left.xml` and `slide_out_right.xml` mirror these with the sign
of each `Delta` reversed, for the return trip (back navigation).

In `MainActivity.java`, immediately after the existing
`startActivity(intent);` call from Lesson 17:

```java
overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left);
```

### The Updated Project

```java
loginButton.setOnClickListener((view) -> {
    String username = usernameField.getText().toString();
    String password = passwordField.getText().toString();
    Toast.makeText(this, "Logging in: " + username, Toast.LENGTH_SHORT).show();

    Intent intent = new Intent(this, InventoryActivity.class);
    startActivity(intent);
    overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left); // ← new
});
```

The identical pattern — one added line, immediately after each existing
`startActivity` call — applies to `InventoryActivity`'s own navigation to
`NotificationsActivity` from Lesson 31.

### Mechanical Walkthrough

- `<translate android:fromXDelta="100%" android:toXDelta="0%" android:duration="250" />`
  — **first appearance of an animation resource.** A `<translate>`
  animation moves a view along one axis over time; `fromXDelta="100%"`
  means "start fully offset one full width to the right of its final
  position," `toXDelta="0%"` means "end at its normal position" —
  together describing a slide-in-from-the-right motion. `duration="250"`
  is in milliseconds — a quarter of a second, short enough to feel
  responsive rather than sluggish.
- `overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)`
  — **first appearance.** Called immediately after `startActivity`, this
  overrides the default transition for exactly this one navigation: the
  first argument is the animation applied to the Activity being entered
  (`InventoryActivity`, sliding in from the right); the second is applied
  to the Activity being left behind (`MainActivity`, sliding out to the
  left) — both playing simultaneously, producing the combined effect of
  the new screen sliding the old one out of the way.
- The reversed `slide_in_left.xml`/`slide_out_right.xml` pair — applied
  the same way, immediately after `finish()` or a back-navigation event —
  reappearing pattern, not a new concept: the same `<translate>`
  mechanism, with the sign of the direction reversed, communicating
  "returning" as visually distinct from "advancing."

### CS Lens

Applying a **consistent, direction-encoding transition** — forward
navigations always slide one way, backward navigations always slide the
opposite way — is a form of **visual state encoding**: the animation
itself carries information (which direction in the navigation history
this move represents) redundantly with, but independently of, the actual
screen content, the same way a progress bar's fill direction or a video
scrubber's position encodes state visually rather than requiring a user
to read text to understand it.

Also recognized in: web browsers' own forward/back page transition
conventions on mobile, physical book page-turning conventions (forward
always turns one way), and any wizard-style multi-step form UI where
"Next" and "Back" consistently animate in opposite directions.

### SE Lens

**Why apply this as a small, repeated one-line addition at every
navigation call site, rather than some single, global setting once?**
Android's transition override is deliberately scoped to one specific
navigation event at a time (the call immediately following
`startActivity` or `finish`) rather than a blanket application-wide
switch, because different navigations within the same app can
legitimately warrant different treatment — a modal-style dialog-like
screen might fade rather than slide, for instance. Repeating the one-line
call at each real navigation point keeps that flexibility available,
at the small, explicit cost of remembering to add it consistently
everywhere a new navigation is introduced — a real, honest maintenance
cost, not a hidden one.

---

## Connect the Pieces

The full trace across the last three milestones: Lesson 30 declared the
SMS permission; Lesson 31 built the Notifications screen and chose the
modern permission-request API; Lesson 33 wired the real request and
handled both outcomes; Lesson 34 gave every screen a shared, consistent
color theme and grouped its own elements through spacing; Lesson 35
confirmed focus order already matched logical flow and smoothed the
keyboard-driven path through it; this lesson adds the final piece —
every screen-to-screen navigation in the entire app now animates
consistently, in a direction that reflects whether the user is moving
forward or back.

## What Breaks Without This

Remove the `overridePendingTransition` call after just one of the several
`startActivity` calls (leave the others in place) and navigate through
the app. Real, directly observable result: every other navigation slides
consistently, while this one specific transition abruptly cuts —
concrete, visible proof that this is a per-call-site setting, not a
global one, exactly as the SE Lens above described. Restore the missing
line before moving on.

## Exercises

1. Apply the reversed `slide_in_left`/`slide_out_right` pair to a real
   back-navigation moment (overriding `onBackPressed`, or the equivalent
   call after `finish()`) and confirm forward and backward navigation now
   visually read as opposite directions, not identical motions played in
   reverse timing only.
2. Change `slide_in_right.xml`'s `duration` to `1000` (a full second),
   rerun the app, and judge for yourself whether the slower animation
   feels responsive or sluggish — direct, subjective confirmation of why
   this lesson chose `250`ms rather than a longer value, rather than
   accepting the choice on faith.

## Definition of Done

- [ ] Every `startActivity` call in the project is immediately followed
      by a matching `overridePendingTransition` call.
- [ ] Forward navigation (login → grid → notifications) visually slides
      in one consistent direction across every screen transition.
- [ ] You removed one transition call, observed the real inconsistency
      directly, and restored it.
- [ ] You can state, concretely, why this project chose
      `overridePendingTransition` over `overrideActivityTransition`
      despite the latter being newer.
- [ ] Commit: `git commit -m "Apply consistent slide transitions to
      every screen navigation"` — explaining the direction-consistency
      goal, not just that animations were added.

---

This is the last lesson in this series. Every piece this
series set out to build now exists, working, and understood from first
principles: a login screen with masked password input and both required
buttons; a labeled data grid with working add and delete, built on
`RecyclerView`'s real, correctly-handled recycling contract; a fully
functioning SMS permission flow, declared in the Manifest and requested
at runtime through Android's current API, handling both a grant and a
denial without breaking the rest of the app; and a consistent visual
theme, deliberate grouping, correct focus order, and direction-consistent
transitions tying all three screens together as one coherent
application — not three separately-built pieces.
