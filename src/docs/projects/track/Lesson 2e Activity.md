# Lesson 2e: `Activity` — Android's Real Template Method

**What you will build:** No new code to compile — this reads
`Activity`'s real, declared shape directly, connecting it back to
Lesson 2a/2d's own hand-rolled examples.

**What you need to know first:** Lesson 2a's inversion of control,
Lesson 2d's template method pattern, Lesson 0l's inheritance.

**Terms introduced in this lesson:**

- **Activity** — an Android framework class representing one on-screen
  screen of an app; instantiated and driven entirely by the Android OS,
  not by your own code.

---

## Concept Unit: `Activity` — Android's Real Template Method

### The Problem

Everything built in Lesson 2a and Lesson 2d was a small, hand-rolled
simulation in plain Java, run with nothing but `javac`/`java` —
deliberately, to isolate inversion of control and the template method
pattern before meeting Android's real version of both at once. An
Android `Activity` cannot actually be compiled and run this way — it
requires the real Android framework and OS to instantiate and drive it.
Instead, this lesson reads `Activity`'s real, declared shape directly,
connecting it back to everything already built and run.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's the real contract, read directly and
verified against the real `android.app.Activity` source. Its relevant
declared shape:

```java
public class Activity extends ContextThemeWrapper {
    protected void onCreate(Bundle savedInstanceState) {
        // real framework implementation, not shown here
    }

    // many further lifecycle methods, covered in the next lesson
}
```

A concrete Activity, as an application developer would write it:

```java
public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // application-specific setup goes here
    }
}
```

`Activity` — **first appearance**: an Android framework class
representing one on-screen screen of an app; instantiated and driven
entirely by the Android OS, not by your own code. `MainActivity extends
Activity` overrides `onCreate`, exactly the same inheritance-and-
overriding shape as Lesson 2d's own `MyProgram extends MiniFramework`
overriding `execute()` — except here, nothing in this program ever
calls `new MainActivity()` or `mainActivity.onCreate(...)` anywhere.
The Android OS does, at a moment and in a manner application code has
no control over at all — the same inversion of control Lesson 2a
already built and ran, now at the scale of an entire operating system
deciding when an application's screens come to life. (`super
.onCreate(savedInstanceState);` is real, required code here — a later
lesson explains exactly what it does and why it's needed.)

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real framework
contract, kept as reference, not deleted.

### Mechanical Walkthrough

1. `public class Activity extends ContextThemeWrapper` — `Activity`
   itself is part of a longer real inheritance chain; `ContextThemeWrapper`
   is not covered in this lesson, named here only so the shown contract
   isn't silently missing a real detail.
2. `protected void onCreate(Bundle savedInstanceState)` — **(a) first
   appearance** of `Bundle`, a class this lesson does not fully explain
   (a later lesson covers it properly) — named here at Recognition
   depth only, since it appears unavoidably in this exact signature.
   `protected` is **(a) first appearance** of a third access level,
   between `private` (Lesson 0j) and `public`: reachable by subclasses
   and code in the same package, but not by unrelated outside code —
   the exact visibility `onCreate` needs, since only a subclass should
   ever override it, but nothing outside the framework should call it
   directly.
3. `public class MainActivity extends Activity` and `@Override
   protected void onCreate(...)` — **(b) reappearing** inheritance,
   overriding, and the `@Override` annotation (Lesson 0x), applied to a
   real framework base class instead of a hand-rolled one.
4. `super.onCreate(savedInstanceState);` — present and required in
   real Android code; a later lesson gives `super` its own full
   first-appearance treatment.

### CS Lens

`Activity` is Lesson 2d's own template method pattern, at Android's
real scale: `onCreate` is one required step in a longer fixed sequence
(the next lesson's Activity lifecycle) the Android OS itself calls, in
an order application code does not control, the same way
`MiniFramework.run()` controlled `setup`/`execute`/`teardown`'s order
regardless of what `MyProgram` did.

Also recognized in: every mobile or desktop UI framework's own
"screen" or "window" base class (`UIViewController` in iOS, `Window` in
WPF) — each instantiated and driven by its own platform, not by
application code directly.

### SE Lens

The alternative — Android providing a `main()`-style entry point that
application code calls to create and show a screen itself — was not
chosen because the OS needs to control screen creation and destruction
tightly, for reasons application code can't be trusted to get right
consistently (memory pressure, the user pressing Back, the phone
rotating). Inversion of control, at OS scale, is what makes that
possible.

---

## Connect the Pieces

Lesson 2a's `MiniFramework` and Lesson 2d's fixed `setup`/`execute`/
`teardown` sequence both showed inversion of control and the template
method pattern in miniature. `Activity`'s real `onCreate`, read
directly from its actual declared shape, is exactly that same pattern
— the next lesson covers its full, real, six-step lifecycle.

## What Breaks Without This

Nothing in application code ever constructs an Activity directly —
there is no `new MainActivity()` anywhere in a real Android app's own
source. Attempting it (in your own reasoning, not by compiling, since
this requires the real Android SDK) would produce an Activity with none
of the OS's own setup (window creation, `Context` wiring) ever having
run — a broken object, not a working screen.

## Exercises

1. Explain, in your own words, why `MainActivity extends Activity`
   never calls `new MainActivity()` anywhere in application code.
2. Compare `MainActivity`'s own shape directly against Lesson 2d's
   `MyProgram extends MiniFramework` — name the one method each
   overrides.
3. Explain, in your own words, why `onCreate` is declared `protected`
   rather than `public`.

## Definition of Done

- [ ] You read the real `Activity`/`MainActivity` contract and can
      explain why nothing constructs it directly.
- [ ] You completed Exercise 2 and can draw the parallel to Lesson 2d's
      own example.
- [ ] You can state, without looking back at this lesson, why
      `onCreate` is `protected`.
