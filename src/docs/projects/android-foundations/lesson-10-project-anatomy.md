# Lesson 10: Project Anatomy — Gradle and the Traditional Android Layout

**What you will build:** a real, minimal traditional-Views Android
project, read piece by piece — `build.gradle`, `AndroidManifest.xml`,
`res/layout/activity_main.xml`, `MainActivity.java` — proving how one
XML layout, one Java class, and one manifest entry connect into a real,
launchable screen, before this arc's own lessons go deeper on any one
piece.

**What you need to know first:** [Lesson 03](lesson-03-interfaces-anonymous-classes-and-lambdas.md)
(real OOP already assumed; this lesson is the framework arc's own
starting point, and needs no other lesson in this series beyond Java
Essentials).

**Terms introduced in this lesson:**
- **Gradle** — the real build system every Android Studio project uses;
  `build.gradle` files declare dependencies and build configuration, the
  direct counterpart to `wpf-foundations`' own `.csproj`.
- **`AndroidManifest.xml`** — the file, read by the OS before any of an
  app's own code runs, declaring which classes are real, launchable
  screens and what permissions/features the app needs.
- **The `R` class** — a class Android's build tools generate
  automatically from every resource file (`res/layout/...`,
  `res/values/...`), giving each one a real, compiled integer reference
  usable from Java code.
- **`setContentView`** — the real `Activity` method that inflates a
  layout XML file into actual, on-screen `View` objects.

**Objects and methods used:**

**`Activity.setContentView(int)`**
- *What it is:* a real method on `android.app.Activity`.
- *Implementation:* `protected void setContentView(int layoutResID)` —
  confirmed against the real Android SDK method signature; takes a
  compiled layout resource reference and inflates it.
- *Its use:* the real, load-bearing call this lesson's own `MainActivity`
  makes inside `onCreate`, proven directly to be what turns XML into a
  real, visible screen.

---

## Concept Unit: `build.gradle` — the Real Project Manifest

### The Problem

Before any Java code can compile into a real, installable Android app,
something has to declare what kind of project this is, which Android
API level it targets, and what libraries it depends on — the same real
job `wpf-foundations` Lesson 09 proved a `.csproj` does for a WPF
project.

### Introduce the Concept in Isolation

A real, minimal app-level `build.gradle` (Groovy DSL — the classic,
still-common form; `build.gradle.kts`, the Kotlin DSL alternative, does
the identical real job with different syntax, not exercised here):

```groovy
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.example.myapp'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.myapp"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
}
```

`plugins { id 'com.android.application' }` — declares this project as a
real, buildable Android application (as opposed to a library module).
`compileSdk 34` — which Android API version the code compiles against;
`minSdk 24` — the real, lowest Android version this app is allowed to
run on, enforced by the Play Store and by the build tools themselves.
`dependencies { implementation '...' }` — real, declared library
dependencies, resolved and downloaded automatically by Gradle — the
direct counterpart to a `.csproj`'s own `<PackageReference>`
(`wpf-foundations` Lesson 09) or this series' own Java Lesson 05
material on `import`ed standard-library classes, except these are
external libraries, not built into the JDK.

### Discard

This proof is disposable; a real project's actual `build.gradle` grows
with more dependencies as an app grows, following this exact shape.

### Mechanical Walkthrough

- `namespace 'com.example.myapp'` — **(a) first appearance.** The real
  Java package every generated class (including the `R` class, this
  lesson's next unit) belongs to — the direct counterpart to this
  series' own Java Lesson 01 material on `String`/`Object`'s own package,
  `java.lang`, now naming *this app's* package instead.
- `applicationId "com.example.myapp"` — **(a) first appearance.** The
  real, unique identifier the Play Store and the Android OS itself use
  to distinguish this app from every other installed app — often
  identical to `namespace` for a simple project, but a genuinely
  separate value the build tools track independently (an app can change
  its Java package without changing its Play Store identity, or vice
  versa).

### SE Lens

The real reason Android needs its own build system rather than reusing
plain `javac`/`java` directly: a real Android app isn't just compiled
Java bytecode — it's a `.apk`/`.aab` package bundling compiled code,
compiled resources (this lesson's next unit), a manifest, and native
libraries, all merged and packaged together, for a platform (a phone,
not the machine doing the building) the build tools themselves aren't
running on. Gradle's real job is orchestrating that whole, genuinely
more complex pipeline — the same real "no plain compiler is enough"
problem `wpf-foundations` Lesson 09 already named for a WPF app's own
XAML-to-C# compile step, solved here with a different, more elaborate
toolchain because the target platform itself is more different from the
build machine.

## Concept Unit: `res/layout/activity_main.xml` — a Real Screen, Declared in XML

### The Problem

A real, visible screen — text, a button — needs to be described
somewhere before any Java code runs. Is this XML fundamentally the same
declarative idea `wpf-foundations` proved for WPF's own XAML, or a
genuinely different mechanism?

### Introduce the Concept in Isolation

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <TextView
        android:id="@+id/greetingText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello, Android" />

</LinearLayout>
```

This is real XML — angle-bracket elements, exactly the same shape
`wpf-foundations` Lesson 02 already proved for XAML, describing a real
object tree rather than executable code: `LinearLayout` and `TextView`
are both real, compiled Java classes (`android.widget.LinearLayout`,
`android.widget.TextView`); writing `<TextView ... />` is a declarative
way of describing "construct a `TextView` object," the identical real
idea already proven for WPF's `<TextBlock />`, expressed through
Android's own, separate XML vocabulary and build pipeline rather than
WPF's.

### Discard

This proof is disposable; full, dedicated treatment of Android's real
layout system (`LinearLayout` vs. `ConstraintLayout`, attributes,
`match_parent`/`wrap_content`) is this arc's own next lesson.

### Mechanical Walkthrough

- `xmlns:android="http://schemas.android.com/apk/res/android"` — **(a)
  first appearance.** An XML namespace declaration, the identical real
  mechanism `wpf-foundations` Lesson 02 already proved for WPF's own
  `xmlns` — not a URL that's fetched, a unique string identifying which
  vocabulary of attribute names (`android:layout_width`, `android:text`)
  this file is using.
- `android:id="@+id/greetingText"` — **(a) first appearance.** The `@+id/`
  syntax is real, specific Android resource syntax: `@+id/greetingText`
  means "generate a new, unique identifier named `greetingText` for this
  view" — the direct counterpart to WPF's own `x:Name`
  (`wpf-foundations` Lesson 10), though the underlying mechanism (proven
  in this lesson's next unit) works differently.
- `android:layout_width="match_parent"` — flagged, not fully explained
  yet; full treatment of Android's own sizing attributes is this arc's
  next lesson's own subject.

## Concept Unit: The `R` Class — a Real, Compiled Reference to Every Resource

### The Problem

`@+id/greetingText`, written in XML, needs some way to be reached from
real Java code — the exact question this series' own `wpf-foundations`
Lesson 10 already answered for WPF's `x:Name` (a generated, typed field).
Does Android generate something comparable?

### Introduce the Concept in Isolation

```java
package com.example.myapp;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView greeting = findViewById(R.id.greetingText);
        greeting.setText("Hello, real Android!");
    }
}
```

`R.layout.activity_main` and `R.id.greetingText` are both real,
compiled `int` constants — **not** strings, and **not** written by
hand anywhere in this project. `R` — the **`R` class** — is generated
automatically by Android's build tools, scanning every file under
`res/` and every `android:id="@+id/..."` inside them, producing one real
integer constant per resource. `R.layout.activity_main` specifically
refers to the compiled form of the `activity_main.xml` file from the
previous unit; `R.id.greetingText` refers to the compiled form of that
file's own `@+id/greetingText` attribute.

### Discard

Nothing here is disposable — this `MainActivity`/`R` relationship is the
real, standard shape every traditional-Views Android screen in this
arc's later lessons builds on.

### Mechanical Walkthrough

- `public class MainActivity extends Activity` — **(c) already basic**
  as class/inheritance syntax, already familiar; `Activity` itself —
  **(a) first appearance** as a real Android SDK class, representing one
  real, launchable screen — full lifecycle treatment is this arc's own
  next lesson.
- `@Override protected void onCreate(Bundle savedInstanceState)` — **(a)
  first appearance** of this specific real method: a lifecycle callback
  the OS calls, not something this project's own code ever calls
  directly — proven and explained fully in this arc's next lesson;
  flagged here only so the method's presence isn't mysterious.
- `super.onCreate(savedInstanceState);` — **(c) already basic** as
  `super` call syntax, already familiar; its real requirement (an
  `Activity` subclass that skips this throws a real exception) is left
  to this arc's next lesson to prove directly.
- `setContentView(R.layout.activity_main);` — **(a) first appearance**
  of this real method, confirmed in this lesson's Header: takes the
  compiled `R.layout.activity_main` reference, parses that XML file's
  real tree, and builds real `View` objects from it in memory — the
  direct counterpart to WPF's own `setContentView`-equivalent step
  (`wpf-foundations` Lesson 09's `InitializeComponent()`).
- `findViewById(R.id.greetingText)` — **(a) first appearance** of this
  real method, inherited from `Activity` — returns the real `View`
  object matching that compiled ID; full treatment of why its return
  type requires attention (a real cast) is this arc's own dedicated
  lesson.
- `greeting.setText("Hello, real Android!");` — **(c) already basic** as
  a method call; its real effect — replacing the XML-declared text with
  new, code-set text — is direct, provable confirmation `findViewById`
  really did return the correct, live `TextView` object, not a copy.

### CS Lens

**(b) hard concept reappearing.** This whole chain —
`activity_main.xml` compiled into `R.layout.activity_main`, referenced
by `setContentView`, its child views compiled into `R.id.*` constants,
referenced by `findViewById` — is the identical real
**declarative-description-compiled-into-a-real-object-tree** idea
`wpf-foundations` Lesson 01 already proved for XAML/`InitializeComponent()`,
solved through a genuinely different, Android-specific compilation
pipeline (a generated `R` class of integer constants, rather than a
generated `partial class`).

## Concept Unit: `AndroidManifest.xml` — Declaring the Real Entry Point

### The Problem

Even with `MainActivity` correctly written, something has to tell the
Android OS *which* class, out of potentially many in a real app, is the
one that should actually launch when the app icon is tapped — the exact
same real question `wpf-foundations` Lesson 01 already answered for
WPF's own `App.xaml`/`StartupUri`.

### Introduce the Concept in Isolation

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application android:label="My App">
        <activity android:name=".MainActivity"
                  android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

`<activity android:name=".MainActivity">` — the leading `.` is real,
specific shorthand meaning "in this app's own declared package"
(`com.example.myapp.MainActivity`, matching this lesson's own
`build.gradle` `namespace`) — this line is the real answer to "how does
the OS know `MainActivity` exists as a real screen at all." Delete this
`<activity>` entry entirely, and `MainActivity.java` still compiles
perfectly — the OS simply has no idea it exists. `<intent-filter>` with
`MAIN`/`LAUNCHER` — the real, specific pair of values marking this
`Activity` as the one that gets a real icon in the device's app
drawer and actually launches on tap; without them, this same
`Activity` could still exist and be navigated to from elsewhere in the
app (this arc's own Intents lesson), but nothing would launch it
directly.

### Discard

Nothing here is disposable — this is the real, standard shape every
traditional-Views Android app's manifest takes for its own launcher
Activity.

### Mechanical Walkthrough

- `<manifest xmlns:android="...">` — **(b) hard concept reappearing**,
  the identical `xmlns` mechanism already proven for the layout XML
  earlier in this lesson.
- `android:exported="true"` — **(a) first appearance**, flagged, not
  fully explained: a real, required attribute (on modern Android target
  versions) for any `Activity` with an `intent-filter`, governing
  whether other apps can launch it directly — full treatment deferred to
  this arc's own Permissions lesson, where the real security reasoning
  belongs.
- `<action android:name="android.intent.action.MAIN" />` /
  `<category android:name="android.intent.category.LAUNCHER" />` —
  **(a) first appearance** of these two specific, real values, explained
  above.

## Connect the pieces

One trace: `build.gradle` declares this as a real Android app, targeting
a real SDK version, with real dependencies Gradle resolves
automatically. `res/layout/activity_main.xml` describes a real screen
declaratively, the same real idea already proven for WPF's own XAML.
Android's build tools compile every resource file into the real `R`
class — `R.layout.activity_main`, `R.id.greetingText` — genuine `int`
constants, not strings. `MainActivity.onCreate` calls
`setContentView(R.layout.activity_main)`, inflating that XML into real,
on-screen `View`s, then `findViewById(R.id.greetingText)` retrieves one
specific view by its compiled ID. `AndroidManifest.xml`'s
`<activity>`/`<intent-filter>` entry is the real, separate piece telling
the OS this specific class is the one to launch — proven directly by its
real absence leaving `MainActivity` compiled but unreachable.

## What breaks without this

Delete the `<intent-filter>` block from `AndroidManifest.xml` entirely,
leaving the bare `<activity android:name=".MainActivity" .../>`, and
attempt to run the app from Android Studio. Real, observed result:
Android Studio reports there is no launcher activity to run — the same
real class of failure `wpf-foundations` Lesson 01 already proved for
WPF's own missing `StartupUri`. `MainActivity.java` itself still
compiles with zero errors — the failure is entirely in the manifest,
not the Java code, direct proof these are two separate, independently
required pieces.

## Exercises

1. Rename `greetingText` in `activity_main.xml`'s `android:id` to
   something else, with no matching change in `MainActivity.java`.
   Attempt to build, and read the real compile error `R.id.greetingText`
   (now referring to an ID that no longer exists) produces — confirm it
   names the missing resource directly.
2. Add a second `<TextView>` to `activity_main.xml` with its own real
   `android:id`, and retrieve it in `MainActivity.onCreate` via a second
   `findViewById` call, setting its text as well. Confirm both real
   `TextView`s show their own, independently set text.

## Definition of Done

- [ ] You can state, in your own words, the real job `build.gradle`
      does, and its direct parallel to `wpf-foundations`' `.csproj`.
- [ ] You traced a real `android:id="@+id/greetingText"` through the
      generated `R` class into a real `findViewById` call.
- [ ] You reproduced the real "no launcher activity" failure by removing
      the manifest's `<intent-filter>`.
- [ ] You caused the real `R.id` compile error from a renamed,
      unmatched resource ID.
- [ ] You completed both exercises.

## Next

[Lesson 11 — The Activity Lifecycle](lesson-11-the-activity-lifecycle.md)
covers `onCreate` and its five real sibling callbacks — proven, with
real logged output, to run in a specific, OS-controlled order your own
code never calls directly.
