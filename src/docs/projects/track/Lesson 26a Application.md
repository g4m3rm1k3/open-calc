# Lesson 26a: `Application`

**What you will build:** No new code to compile — this reads a real,
verified component contract directly.

**What you need to know first:** Lesson 2e's `Activity`.

**Terms introduced in this lesson:**

- **`Application`** — a class representing the whole running process, not
  one screen or component — exactly one instance exists for the app's
  entire lifetime, created before any Activity.

---

## Concept Unit: `Application` — One Instance for the Whole Process

### The Problem

An `Activity`, from Lesson 2e, represents one screen, created and
destroyed repeatedly as the user navigates. Some setup work genuinely
needs to happen exactly once, before any screen opens, and stay valid for
the entire time the app's process is alive — no single Activity is
correctly positioned to own that, since any one of them might not be the
first to run, and all of them come and go independently.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real component shape, verified against the actual Android framework source. `Application`'s real, partial declared contract:

```java
public class Application extends ContextWrapper {
    public void onCreate() {
        // called exactly once, before any Activity, Service, or
        // BroadcastReceiver in this app is created
    }
}
```

A concrete subclass, as an application developer would write it:

```java
public class MyApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        // one-time, whole-process setup goes here
    }
}
```

Declared in the Manifest:

```xml
<application android:name=".MyApp" android:label="My App">
</application>
```

This is `Application` — **first appearance**: a class representing the
whole running process, not one screen or component — exactly one instance
exists for the app's entire lifetime, created before any Activity.
`android:name=".MyApp"` tells Android to construct this specific
subclass, instead of a plain default `Application`, as the very first
object built when the process starts.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract and Manifest shape.

### Mechanical Walkthrough

1. `public class Application extends ContextWrapper { ... }` — **(b)
   reappearing** inheritance shape from Lesson 0l, applied to a real
   Android base class representing the whole process rather than one
   screen.
2. `public void onCreate()` — **(a) first appearance** of `Application`'s
   own lifecycle hook: unlike `Activity`'s six-step lifecycle (Lesson
   2f), `Application` has essentially one meaningful moment — creation —
   since it's never individually paused, stopped, or resumed the way a
   screen is; it simply exists for as long as the process does.
3. `public class MyApp extends Application { @Override public void
   onCreate() { super.onCreate(); ... } }` — **(b) reappearing**
   overriding, `@Override`, and `super` from Lessons 0m and 2n, applied
   here to the process-level base class instead of a screen-level one.
4. `android:name=".MyApp"` inside `<application>` — **(a) first
   appearance** of this specific attribute: without it, Android
   constructs a plain, default `Application` instance automatically;
   with it, Android constructs `MyApp` instead, running its overridden
   `onCreate()`.

### CS Lens

`Application` is the same inversion-of-control shape from Lesson 2a,
applied at the broadest possible scope: the Android OS decides when the
process itself starts and constructs exactly one `Application` instance,
calling its `onCreate()` before constructing anything else — the same
"framework calls you, not the reverse" idea, now governing the entire
process's own startup rather than one screen's.

Also recognized in: a web server's own application-startup hook (run
once, before any individual request is handled), a desktop app's
`Main`/`Program` entry point in frameworks that still hand control to a
larger runtime, any "singleton root object" a platform constructs first.

### SE Lens

The alternative — putting process-wide setup in whichever Activity
happens to be first opened — was not chosen because "whichever Activity
happens to be first" is not reliable: a different Activity could
legitimately be the entry point depending on how the app was launched
(from the icon, from a notification, from another app), and duplicating
setup logic across every possible entry point invites exactly the kind of
drift Lesson 21c's own single-source-of-truth material already warned
against. `Application.onCreate()` is guaranteed to run exactly once,
before anything else, regardless of which Activity ends up opening
first.

---

## Connect the Pieces

`MyApp extends Application`, declared in the Manifest, is constructed
exactly once, before any Activity. The next lesson uses this one
reliable place to do a different kind of one-time setup.

## What Breaks Without This

Putting process-wide setup in whichever Activity happens to be first
opened is unreliable — a different Activity could legitimately be the
entry point depending on how the app was launched, and duplicating setup
logic across every possible entry point invites drift.

## Exercises

1. Read `Application`'s real contract again and identify what
   distinguishes it from `Activity`'s own lifecycle — specifically, why
   `Application` has no `onPause`/`onStop`/`onDestroy` equivalents.
2. Explain, in your own words, why `android:name=".MyApp"` is required
   to use a custom subclass.
3. Name one kind of one-time, whole-process setup (besides what the next
   lesson covers) that belongs in `Application.onCreate()` rather than
   any one Activity.

## Definition of Done

- [ ] You read `Application`'s real contract and can explain why
      `android:name=".MyApp"` is required to use a custom subclass.
- [ ] You completed Exercise 3.
- [ ] You can state, without looking back at this lesson, why
      `Application.onCreate()` is guaranteed to run before any Activity.
