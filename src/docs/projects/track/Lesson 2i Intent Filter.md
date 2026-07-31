# Lesson 2i: Intent Filters — Declaring What an Activity Is Willing to Handle

**What you will build:** No new code to compile — this reads a real,
verified Manifest addition directly.

**What you need to know first:** Lesson 2h's Android Manifest.

**Terms introduced in this lesson:**

- **Intent filter** — a Manifest declaration stating what kind of
  external request (such as "be the app's launcher screen") a given
  Activity is willing to handle.

---

## Concept Unit: Intent Filters — Declaring What an Activity Is Willing to Handle

### The Problem

Lesson 2h's Manifest declares that `MainActivity` exists, but nothing
yet says *which* Activity should open when the user taps the app's
icon — a real, specific decision an app with more than one Activity
genuinely needs to make, and the Manifest alone, as shown so far,
doesn't express.

### Introduce the Concept in Isolation

The same Manifest, extended with a real, verified addition:

```xml
<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

`<intent-filter>` is an `intent filter` — **first appearance**: a
Manifest declaration stating what kind of external request (such as
"be the app's launcher screen") a given Activity is willing to handle.
This specific combination — `action.MAIN` plus `category.LAUNCHER` —
is the exact, real mechanism behind an app icon being tappable and
opening this particular Activity: nothing else in the Manifest marks
an Activity as "the one that opens from the launcher."

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real,
verified shape of a required Manifest element.

### Mechanical Walkthrough

1. `<intent-filter> ... </intent-filter>` — **(a) first appearance.**
   Nested inside `<activity>`, declaring one specific kind of request
   this Activity accepts.
2. `<action android:name="android.intent.action.MAIN" />` — **(a)
   first appearance**: declares this Activity as a valid *entry point*
   — a screen with no expectation of receiving data from whatever
   launched it, unlike a screen a user navigates to mid-app.
3. `<category android:name="android.intent.category.LAUNCHER" />` —
   **(a) first appearance**: declares this Activity should appear as a
   tappable icon in the device's app launcher specifically. `MAIN`
   alone, without this category, would mark a valid entry point that
   still never shows up as an icon.

### CS Lens

An intent filter is a **capability declaration**: rather than the OS
assuming every Activity can handle every kind of request, each
Activity explicitly states what it's willing to handle, and the OS
matches requests against those declarations. This mirrors Lesson 0q's
interface concept structurally — a declared contract about what
something can do — applied here to Manifest XML instead of Java code.

Also recognized in: a web server's own route declarations (which URLs
a given handler responds to), any plugin architecture where components
declare which events or requests they can service, rather than the
host assuming.

### SE Lens

The alternative — Android simply opening the first Activity declared
in the Manifest, with no explicit marking at all — was not chosen
because an app can have many Activities, added and reordered over
time, with no reliable "first" one; an explicit `LAUNCHER` declaration
means exactly which Activity opens from the icon never depends on file
ordering or declaration order at all.

---

## Connect the Pieces

Lesson 2h's Manifest declared that `MainActivity` exists at all. This
lesson's `<intent-filter>` declares specifically that this Activity is
the one that opens from the launcher icon — a separate, additional
declaration on top of mere existence.

## What Breaks Without This

Remove the `<intent-filter>` entirely, keeping the `<activity>` tag
itself. The app installs, and `MainActivity` still exists as a
component — but no icon appears in the device's launcher at all, since
nothing declares it as the launcher entry point. This is real behavior,
verified against the actual framework source, not a hypothetical:
`android.intent.category.LAUNCHER` is the one and only signal the
launcher itself scans for.

## Exercises

1. Add a second Activity with no `<intent-filter>` of its own, and
   explain, in your own words, why it would not appear as a launcher
   icon even though it's still declared.
2. Remove only the `<category>` line, keeping `<action
   android:name="android.intent.action.MAIN" />`, and explain what
   this Activity would still be valid for.
3. Explain, in your own words, why an intent filter is described as a
   "capability declaration."

## Definition of Done

- [ ] You read the real intent-filter shape and can explain what
      `action.MAIN` and `category.LAUNCHER` each declare.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why an app
      with two Activities needs an explicit way to say which one is the
      launcher.
