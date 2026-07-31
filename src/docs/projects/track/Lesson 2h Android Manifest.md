# Lesson 2h: The Android Manifest — Declaring What an App Contains

**What you will build:** No new code to compile — this reads a real,
verified `AndroidManifest.xml` shape directly.

**What you need to know first:** Lesson 2g's XML, Lesson 2e's
`Activity`.

**Terms introduced in this lesson:**

- **Android Manifest** — a required XML file declaring every component
  an Android app has (Activities, permissions, and more) so the OS
  knows what the app contains before ever running any of it.

---

## Concept Unit: The Android Manifest — Declaring What an App Contains

### The Problem

Lesson 2e built and read `MainActivity` in real Android code, but never
established how the Android OS would actually know `MainActivity`
exists, or which of an app's possibly-many Activities should open first
when the app's icon is tapped. Nothing about writing a Java class makes
Android aware of it automatically — some separate, OS-readable
declaration is needed.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, verified
`AndroidManifest.xml` shape, read directly:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp">

    <application android:label="My App">
        <activity android:name=".MainActivity" android:exported="true">
        </activity>
    </application>
</manifest>
```

This is the `Android Manifest` — **first appearance**: a required XML
file declaring every component an Android app has (Activities,
permissions, and more) so the OS knows what the app contains before
ever running any of it. `MainActivity`, from Lesson 2e, is only a real,
launchable screen because of this
`<activity android:name=".MainActivity" .../>` line — without it, the
class exists in the compiled app but Android has no record of it as a
usable component at all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real, verified
shape of a required project file.

### Mechanical Walkthrough

1. `<manifest ...>` — **(a) first appearance** of the Manifest's root
   tag; `package="com.example.myapp"` names the application itself.
2. `<application ...>` — a required child tag representing the app as
   a whole; `android:label="My App"` is the human-readable name shown
   to the user (on the launcher icon, for instance).
3. `<activity android:name=".MainActivity" android:exported="true">` —
   **(a) first appearance** of declaring an Activity: `android:name`
   names the real Java class (`.MainActivity`, shorthand for
   `com.example.myapp.MainActivity`, the package name plus the class);
   `android:exported="true"` means this Activity can be launched by
   things outside the app itself (the launcher, for instance) —
   required, as of recent Android versions, for any Activity meant to
   be reachable from outside the app.

### CS Lens

The Manifest is a real, load-bearing example of XML — Lesson 2g's own
concept — applied to a genuine engineering problem: the Android OS
needs to know an app's entire component inventory *before* running any
of that app's own code, since the OS itself is what decides when to
construct and destroy each component. A plain Java class, with no
matching Manifest entry, is invisible to the OS as a launchable thing,
no matter how correctly it's written.

Also recognized in: any plugin system's own manifest or registration
file (a browser extension's `manifest.json`, a VS Code extension's
`package.json`) — the same "declare what this component provides
before the host system runs any of it" shape recurring outside Android
entirely.

### SE Lens

The alternative — Android scanning compiled code directly, looking for
anything that looks like an Activity — was not chosen because it would
be slow (scanning an entire compiled app on every launch) and
ambiguous (any class extending `Activity`, intentionally reachable or
not, would be exposed). A required, explicit declaration means only
what's genuinely meant to be a component the OS manages is ever
treated as one.

---

## Connect the Pieces

`<pet>`'s own nested-tag shape (Lesson 2g) is exactly what
`AndroidManifest.xml` uses for real: declaring `MainActivity` so the OS
knows it exists at all. The next lesson (Intent Filters) shows how the
Manifest also declares which specific Activity opens from the launcher
icon.

## What Breaks Without This

An Activity declared in Java but missing from the Manifest entirely
cannot be launched — attempting to start it produces a real runtime
crash resembling:

```
android.content.ActivityNotFoundException: Unable to find explicit activity class {com.example.myapp/com.example.myapp.MainActivity}; have you declared this activity in your AndroidManifest.xml?
```

This is the concrete proof the Manifest isn't optional bookkeeping: the
Android OS genuinely does not know an Activity exists until it's
declared here, no matter how correctly the Java class itself is
written and compiled.

## Exercises

1. Add a second `<activity>` tag to the Manifest, for a hypothetical
   `SettingsActivity`.
2. Find and read the real `ActivityNotFoundException` message above
   carefully — identify which specific part of the message names the
   missing Manifest declaration.
3. Explain, in your own words, why the Manifest must be read *before*
   any of the app's own Java code ever runs.

## Definition of Done

- [ ] You read the real Manifest shape and identified which line makes
      `MainActivity` launchable from the icon specifically.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a
      correctly-written Activity class still isn't launchable without a
      matching Manifest entry.
