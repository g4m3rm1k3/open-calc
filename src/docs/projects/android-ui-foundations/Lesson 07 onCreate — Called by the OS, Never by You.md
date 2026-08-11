# Lesson 07: `onCreate` — Called by the OS, Never by You

**What you will build:** One line added inside the `onCreate` you've been
reading since Lesson 05 — a debug log statement — used as proof of a
claim this lesson makes about who actually calls that method. The
transferable problem: in Lesson 01, your own command (`java HelloWorld`)
was what caused `main` to run. Nothing in Android ever calls `onCreate`
from your own code, anywhere — yet it runs, every time your app starts.
Understanding *how* that happens, and *why* Android is designed that way,
changes how you read every other Android callback you'll meet later.

**What you need to know first:** Lesson 06 (`extends`, `@Override`,
`super`, and the real `MainActivity.java` this lesson continues
explaining).

**Terms introduced in this lesson:**
- **`protected`** — an access modifier meaning "callable by this class,
  its subclasses (anywhere), and other code in the same package" — wider
  than package-private, narrower than `public`.
- **Lifecycle callback** — a method a framework calls on your object at a
  moment *it* decides, rather than a moment your own code decides.
- **Inversion of Control (the "Hollywood Principle")** — a design
  relationship where the framework holds the flow of control and calls
  into your code, rather than your code calling into the framework and
  staying in charge.
- **`Bundle` (recognition only)** — a parameter holding state saved from
  a previous run of the same Activity; not used for real in this series,
  since a UI-only project has nothing that needs saving across restarts.
- **Manifest / `<activity>` declaration** — the file, read by the OS
  before any of your code runs, that declares which of your classes are
  real, launchable screens.
- **`Log.d` / Logcat** — Android's filterable debug-output channel,
  separate from a plain console.
- **XML** — a text format built from nested `<tag>...</tag>` pairs
  carrying `attribute="value"` pairs, describing structured
  configuration data rather than executable code; unlike Java, nothing
  compiles it to bytecode — the OS reads it directly as data.

**Objects and methods used:**

**`Activity.onCreate(Bundle)`**
- *What it is:* the lifecycle callback the OS calls once, when an
  Activity is starting.
- *Implementation:* `protected void onCreate(Bundle savedInstanceState)`
  — real, declared signature, verified this session against Android's
  own official reference documentation, quoted in full below.
- *Its use:* the exact method already sitting in `MainActivity.java`
  since Lesson 05, now proven — via the `Log.d` line this lesson adds
  — to run without your own code ever calling it.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`android.util.Log`**
  - *What it is:* a class Android provides for writing to Logcat, a
    filterable debug-output channel separate from a plain console.
  - *Implementation:* `.d(tag, message)` is its debug-level logging
    method — `.i` info, `.w` warning, `.e` error are the same call
    shape at different severities.
  - *Its use:* a diagnostic tool used here to prove a claim (that
    `onCreate` really runs without your own code calling it), not this
    lesson's own subject.

---

## Concept Unit: `protected` — Wider Than Private, Narrower Than Public

### The Problem

`onCreate` is declared `protected`, not `public`. Lesson 01 already
established what `public` means: anything, anywhere, can see it. If
`onCreate` doesn't need to be called by literally anyone, why not make it
`public` anyway, the way `main` was? Because `public` would mean any
unrelated code, anywhere in the app, could call `activity.onCreate(null)`
directly and by hand — bypassing the entire sequence the operating system
is responsible for running in order. Java has a narrower modifier for
exactly this situation: visible to the class itself, to subclasses
(wherever they live), and to other code in the same package — but not to
arbitrary unrelated code.

### Introduce the Concept in Isolation

Two disposable packages, proving `protected`'s exact boundary.

`labdemo/base/Base.java`:

```java
package base;

public class Base {
    protected void internalSetup() {
        System.out.println("Base setup ran");
    }
}
```

`labdemo/sub/Sub.java` — a subclass, in a **different** package:

```java
package sub;

import base.Base;

public class Sub extends Base {
    public void run() {
        internalSetup();
    }
}
```

`labdemo/outsider/Outsider.java` — unrelated code, no inheritance
relationship, also a different package:

```java
package outsider;

import base.Base;

public class Outsider {
    public static void main(String[] args) {
        Base b = new Base();
        b.internalSetup();
    }
}
```

Compile all three together and try to run `Outsider`:

```
javac base/Base.java sub/Sub.java outsider/Outsider.java
java outsider.Outsider
```

This does **not** compile. Real error:

```
outsider/Outsider.java:8: error: internalSetup() has protected access in Base
        b.internalSetup();
         ^
```

Now delete `Outsider.java` and instead compile and run `Sub`, adding a
tiny runner:

```java
// sub/SubMain.java
package sub;

public class SubMain {
    public static void main(String[] args) {
        new Sub().run();
    }
}
```

```
javac base/Base.java sub/Sub.java sub/SubMain.java
java sub.SubMain
```

Real output:

```
Base setup ran
```

The contrast proves it: `Sub`, a genuine subclass, could reach
`internalSetup()` — even from a completely different package — because
inheritance grants access to `protected` members. `Outsider`, with no
inheritance relationship at all, was rejected by the compiler for the
exact same method. `protected` is precisely this: open to the class
itself and its subclasses everywhere, plus same-package code, closed to
everyone else.

### Discard the Throwaway Example

`base`, `sub`, and `outsider` are deleted now — three throwaway packages,
never part of the real project.

### Mechanical Walkthrough

- `protected void internalSetup()` — a method visible to `Base` itself,
  every subclass of `Base` regardless of package, and other code in
  `Base`'s own package — narrower than `public`, wider than
  package-private.
- `Sub extends Base` calling `internalSetup()` — succeeds because
  inheritance grants access to a parent's `protected` members, even
  across the package boundary between `sub` and `base`.
- `Outsider` (no inheritance relationship, different package) calling
  `b.internalSetup()` — rejected by the compiler, proving `protected`
  access genuinely depends on the inheritance relationship, not merely
  on holding a reference to an object of that type.

### SE Lens

Why does `protected` grant access based on inheritance rather than just
package location alone (the narrower `package-private` a later
exercise in this lesson isolates directly)? A framework author
publishing a class like `Activity` wants subclasses — the entire point
of the class — to be able to reach certain internal methods no matter
what package they're written in, since an app's own code will never
live in Android's own package. `package-private` alone couldn't grant
that; `protected` is the specific tool for "open to the extension
mechanism itself, not to arbitrary callers."

### CS Lens

This is **access control** applied at a level between two extremes: a
framework author (here, whoever wrote Android's `Activity` class) can
expose a method meant only for subclasses to call or override, while
closing it off from arbitrary outside callers who have no business
invoking it directly.

Also recognized in: C++ and C#'s own `protected` keyword (same idea,
same name), abstract base classes in virtually every object-oriented
framework that expects you to subclass and fill in specific methods, and
any API that distinguishes "public surface for consumers" from "protected
surface for extenders."

---

## Concept Unit: `onCreate` as a Framework-Invoked Callback

### The Problem

In Lesson 01, running `java HelloWorld` was *your own action* that caused
`main` to execute — you typed the command, the JVM looked up `main`,
ran it, and control stayed with your code until the program ended. Look
through every file in your Android project: nowhere does your own code
ever write `myActivity.onCreate(...)`. Yet every time you press Run,
`onCreate` executes, `setContentView` runs, and a screen appears. If you
never called it, who did — and when did they decide to?

### Project Change

- **Reference Source:** the real, documented contract for this method —
  [Android developer reference, `Activity.onCreate(Bundle)`](https://developer.android.com/reference/android/app/Activity#onCreate(android.os.Bundle)),
  confirmed this session. Quoted directly:

  > "Called when the activity is starting. This is where most
  > initialization should go: calling `setContentView(int)` to inflate
  > the activity's UI, using `findViewById` to programmatically interact
  > with widgets in the UI... Derived classes must call through to the
  > superclass's implementation of this method. If they do not, an
  > exception will be thrown."

  This is the **Parent Contract** `MainActivity`'s `onCreate` is filling
  in — a real declared method on `Activity` (the class `AppCompatActivity`
  itself extends), not something inferred from how `MainActivity` happens
  to use it. Its real declared signature: `protected void
  onCreate(Bundle savedInstanceState)` — exactly matching the `protected`
  access level just proven above, and the exact parameter type and name
  already sitting in your `MainActivity.java`.
- **Files affected:** `MainActivity.java`, same file and path as
  Lesson 06.
- **Change type:** Add one line inside the existing `onCreate` body.
- **Location:** Inside `onCreate`, after the existing
  `super.onCreate(savedInstanceState);` and `setContentView(...)` lines.
- **Dependencies:** None new.

### The New Code

```java
Log.d("MainActivity", "onCreate is running right now");
```

### The Updated Project

```java
package com.yourname.yourapp;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d("MainActivity", "onCreate is running right now"); // ← new
    }
}
```

`onCreate` now does everything it did before, plus writes one line to
Android's debug log every time it runs. Nothing about the visible screen
changes — this line exists purely as an instrument to prove a claim, not
to build a feature.

### Mechanical Walkthrough

- `Log.d(...)` — **first appearance.** `Log` is a class Android provides
  for writing to **Logcat** — a filterable debug-output channel separate
  from a plain terminal console, viewable in Android Studio's Logcat
  panel while the app runs on a device or emulator. `.d(...)` is the
  **debug**-level logging method (as opposed to `.i` info, `.w` warning,
  `.e` error — different severities, same general call shape).
- `"MainActivity"` — the first argument, the **tag**: a label used to
  filter Logcat's output down to messages from a specific source, since a
  running device produces a huge volume of log lines from the OS and
  every other app.
- `"onCreate is running right now"` — the second argument, the actual
  message text.

You'll need `import android.util.Log;` at the top of the file for this to
compile — Android Studio will offer to add this automatically (a red
lightbulb / quick-fix prompt) the moment you type `Log.d(...)` without the
import present.

### Run It Yourself

Run the app on an emulator or device, then open the **Logcat** panel in
Android Studio (bottom toolbar). Filter by the tag `MainActivity`. Real
line you'll see appear the moment the app launches:

```
D/MainActivity: onCreate is running right now
```

Now search your entire project for the literal text `onCreate(` being
*called* — not declared, called, as in `something.onCreate(...)`. There
is no such call anywhere in code you wrote. The method still ran. That's
the proof: something outside your own source — the Android OS itself —
decided to construct a `MainActivity` object and call this method on it,
at a moment of its own choosing (specifically: when it decides your app's
process needs to show this Activity).

### CS Lens

This relationship — your code never calls the framework's entry points,
the framework calls yours — is **Inversion of Control**, often called the
**Hollywood Principle**: "don't call us, we'll call you." Lesson 06's
Template Method pattern already showed the *shape* of this (a parent
class calling out to a method a subclass fills in); this lesson proves
the *timing* half of the same idea: the parent decides *when*, not just
*that*, your override runs.

Also recognized in: every GUI framework's event handlers (a button's
click listener runs only when the framework detects a tap, never when
your code calls it), JUnit calling your `@Test`-annotated methods in a
test run, web frameworks calling your route-handler function when a
request arrives, and dependency-injection frameworks that construct and
wire up objects your code never directly instantiates.

### SE Lens

**Why does Android insist on owning this control instead of letting your
code call `setContentView` whenever it wants?** The alternative — your
code freely deciding when to create its own UI — sounds simpler, but an
Android device is running dozens of apps' processes at once, deciding
which one is visible, which are paused in the background, and which
should be killed to free memory. Only the OS has the information needed
to make those calls correctly. Inversion of control here means Android
can guarantee a consistent, correct sequence (create, then start, then
resume — lifecycle stages this series doesn't need in full yet) across
every app on the system, instead of trusting each app's author to
reimplement that sequencing correctly themselves. The cost: your code
must be written to fit into a shape the framework dictates, rather than
structured however you'd prefer.

---

## Concept Unit: The Manifest Declares Which Class Gets Called

### The Problem

Even granting that "the OS decides when to call `onCreate`" — how does
the OS know *which* class, out of every `.java` file in your project, to
construct and call it on in the first place? Nothing about the name
`MainActivity` is special to Android; renaming the class to
`StartScreen` doesn't stop the app from working. Something else has to
tell the OS which class is the real, launchable entry point.

### Project Change

- **Reference Source:** No external framework signature to cite — this
  is a configuration file the Android Studio wizard generated for you in
  Lesson 05, not a Java class.
- **Files affected:** `app/src/main/AndroidManifest.xml`, inside the same
  project.
- **Change type:** None yet — read only, first sight.

### The New Code

No new code to type. Open `AndroidManifest.xml` in your project (Project
panel → `app > manifests > AndroidManifest.xml`).

### The Updated Project

```xml
<application ...>
    <activity
        android:name=".MainActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

### Mechanical Walkthrough

- **XML** — **first appearance.** A text format built from nested
  `<tag>...</tag>` pairs carrying `attribute="value"` pairs, describing
  structured configuration data rather than executable code. Unlike
  Java, there's no compiler translating this into bytecode — the OS
  reads it directly as data.
- `<application>` — the root element covering app-wide configuration;
  everything the app declares about itself lives inside it.
- `<activity android:name=".MainActivity">` — **first appearance.** This
  is the actual answer to this unit's problem: this line is what tells
  the OS "a class named `MainActivity` (the `.` shorthand means "in this
  app's own package") is a real, launchable screen." Delete this
  `<activity>` block entirely and `MainActivity.java` still compiles
  perfectly — the OS simply has no idea it exists as a launchable screen.
- `android:exported="true"` — flagged, not explained yet; relevant once a
  later lesson deals with permissions and what other apps can and can't
  start.
- `<intent-filter>`, `<action android:name="android.intent.action.MAIN">`,
  `<category android:name="android.intent.category.LAUNCHER">` — **first
  appearance.** An **intent filter** declares what kind of request this
  component is willing to handle. `MAIN` marks this Activity as a valid
  entry point (as opposed to a screen only reachable from inside the
  app). `LAUNCHER` specifically marks it as the one that gets an icon in
  the device's home screen/app drawer. Together, these two lines are the
  actual mechanism: without them, this `Activity` could still exist and
  even be navigated to from elsewhere in the app, but nothing would run
  it when the app icon is tapped.

### SE Lens

**Why put this declaration in a separate XML file instead of just
letting the OS scan all your compiled classes and guess which one is the
entry point?** The alternative — convention-based discovery, like Java's
own `main` method lookup — would force some arbitrary rule ("the first
Activity class alphabetically"?) in a system where an app can legitimately
contain dozens of Activities, most of which are *not* meant to be
launchable directly. An explicit manifest declaration removes the
guesswork entirely and lets one app declare several Activities while
being precise about which ones are real entry points versus internal
screens only reachable through code — the same design goal Lesson 01's
CS Lens already named for `main`, solved differently because Android's
problem (many components, several legitimately launchable) is a harder
version of Java's (exactly one entry point).

---

## Connect the Pieces

One trace through this lesson: `AndroidManifest.xml` tells the OS
`MainActivity` is a real, launchable entry point. When the app icon is
tapped, the OS — not your code — constructs a `MainActivity` object and
calls its `onCreate`, at a moment entirely of the OS's own choosing. The
`protected` access level on that method is what makes this safe: your
own subclass can override it, but no unrelated code can call it directly
and skip the sequence the OS is managing. The `Log.d` line you just added
is standing proof that this call happened without your code ever writing
it.

## What Breaks Without This

In `AndroidManifest.xml`, delete the entire `<intent-filter>` block (both
`<action>` and `<category>` lines) from inside `<activity>`, leaving the
bare `<activity android:name=".MainActivity" android:exported="true" />`.
Run the app from Android Studio's Run button. Real result: Android Studio
reports there is no launcher activity to run (the Run configuration
either fails or asks you to pick a different entry point, since none is
declared). Restore the `<intent-filter>` block before moving on.

## Exercises

1. Redo the `protected` lab, but change `Base.internalSetup()`'s modifier
   to plain package-private (remove the modifier entirely, leaving just
   `void internalSetup()`). Re-test both `Sub` (different package) and a
   version of `Sub` moved into the *same* package as `Base`. Confirm for
   yourself: package-private access depends only on package location, not
   on the inheritance relationship `protected` also grants.
2. Add a second `Log.d` call inside `onCreate`, positioned *before*
   `super.onCreate(...)` instead of after everything. Run the app and
   check Logcat's ordering of your two messages against
   `super.onCreate`'s own internal logging (Android's own framework logs
   several lines during startup) to build a concrete feel for what
   "before" and "after" actually mean in a real execution, not just in
   source order.

## Definition of Done

- [ ] You ran the `protected` lab yourself and saw the real compiler
      error naming `internalSetup()`'s access level.
- [ ] You added the `Log.d` line, ran the real app, and saw the real
      Logcat line appear — proving `onCreate` runs without your code ever
      calling it.
- [ ] You can explain, in your own words, why `onCreate` is `protected`
      rather than `public`.
- [ ] You deleted the manifest's `<intent-filter>` and saw the real
      "no launcher activity" failure, then restored it.
- [ ] Commit: `git commit -m "Add onCreate logging to confirm the OS
      invokes it, not our own code"` — explaining why the line exists
      (a diagnostic proof), not just that a line was added.

Milestone 1 is done: you have a real, running Android project, and you
understand every word already sitting inside its generated
`MainActivity.java` and `AndroidManifest.xml` — nothing in it is
unexplained anymore. Lesson 08 starts the login screen itself: real XML,
real widgets, nothing hidden behind "we'll get to that later."
