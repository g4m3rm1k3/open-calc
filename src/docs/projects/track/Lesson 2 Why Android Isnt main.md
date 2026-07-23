# Lesson 2: Why Android Isn't `main()`

**What you will build:** Nothing new visually yet — you'll instrument
your existing empty `MainActivity` screen and watch Android itself call
methods on it that you never call. The transferable problem: in every
Java program you've written before this, execution starts at
`public static void main(String[] args)` and *you* are in control of
the order things happen. Android throws that model out. There is no
`main()` in your app at all. Instead, the OS owns a class you write,
and calls specific methods on it, in a specific order, at times *it*
decides — when the user opens your app, switches away, gets a phone
call, rotates the screen, or the system needs the memory back. Today
you make that invisible machinery visible.

**What you need to know first:** Lesson 1 — specifically, that
`package com.yourname.pocketinventory;` at the top of `MainActivity.java`
matches its folder location, and that `MainActivity.java` already
exists with `extends AppCompatActivity` left unexplained on purpose.

---

## Concept Unit: The Manifest — How Android Even Knows You Exist

### The Problem

You have a compiled class, `MainActivity`. In a normal Java program,
having a `main()` method is enough — the JVM knows exactly where to
start. Android has no such convention. If you wrote ten different
`Activity` subclasses in this project, how would the OS know which one
to show first when the user taps your app icon? Nothing about the
*code itself* answers that question. Something outside the code has to
declare it.

### Project Change

- **Reference Source:** No reference counterpart — this is your own
  generated project's manifest, already created by the wizard in
  Lesson 1.
- **Files affected:** `app/src/main/AndroidManifest.xml` (already
  exists — you're reading it, not creating it).
- **Change type:** Inspect (no edit yet).
- **Location:** Android view → `app > manifests > AndroidManifest.xml`.

### The New Code

Open it. You'll see something like this (yours may have minor
differences):

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.PocketInventory">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### The Updated Project

This *is* the whole file (a manifest doesn't nest inside anything
larger) — so no further "enclosing structure" to show; you're looking
at the complete document as generated.

### Mechanical Walkthrough

- `<manifest ...>` — **first appearance.** The root declaration of an
  entirely separate file format from Java: XML. Unlike your `.java`
  files, this file is read by the Android build tools and by the OS
  itself, not compiled into bytecode the same way.
- `xmlns:android="..."` — **first appearance.** An XML namespace
  declaration — conceptually the exact same idea as the Java package
  namespace from Lesson 1 (a scheme to avoid attribute-name collisions
  between Android's own attributes and anyone else's), just XML's
  version of it rather than Java's.
- `<application>` — **first appearance.** Describes properties of the
  app as a whole: its icon, its display name, its visual theme.
- `android:allowBackup`, `android:icon`, `android:label`,
  `android:theme` — **first appearance**, as a group: these are
  attributes, each pointing at a resource rather than a hardcoded
  value (`@mipmap/...`, `@string/...`, `@style/...` — the `@` syntax
  is its own concept, covered below).
- `<activity android:name=".MainActivity" ...>` — **first appearance.**
  This is the actual answer to the Problem above: this line is the
  *only* place in your entire project that connects the class
  `MainActivity` to the running app. `.MainActivity` is shorthand for
  `com.yourname.pocketinventory.MainActivity` — the leading dot means
  "append this to the package name already declared at the top of this
  manifest" (which you'd find in `build.gradle`, not shown here — not
  needed yet). Delete this `<activity>` block entirely and
  `MainActivity.java` would still compile fine, but the OS would have
  no idea it exists as something launchable.
- `<intent-filter>`, `<action android:name="android.intent.action.MAIN" />`,
  `<category android:name="android.intent.category.LAUNCHER" />` —
  **first appearance, as a group.** This is the actual declaration of
  *which* activity is the one shown when the user taps your app icon
  on the home screen. `MAIN` means "this is a valid entry point,"
  `LAUNCHER` means "and specifically, show it in the app drawer/home
  screen." A project can have many Activities; only one (usually) has
  this exact filter combination.
- `@mipmap/ic_launcher`, `@string/app_name`, `@style/Theme.PocketInventory`
  — **first appearance, as a group.** The `@type/name` syntax is
  Android's *resource reference* system — instead of hardcoding
  `"Pocket Inventory"` as a literal string here, the manifest points
  at a named resource defined elsewhere (`res/values/strings.xml`),
  so translations, theming, and reuse are centralized rather than
  scattered through code.

### CS Lens

The Manifest is an instance of **declarative configuration separated
from imperative code** — you're not writing instructions ("run this
function"), you're describing facts about the system ("this class is
an entry point") for something *else* (the OS) to read and act on.
Also recognized in: a web server's routing config mapping URLs to
handlers, a `package.json`'s `"main"` field, systemd unit files
describing services to the OS, Kubernetes YAML describing desired
state rather than steps.

### SE Lens

**Why does Android require a separate declaration file instead of just
scanning your compiled code for a class that looks like an entry
point** (say, one with a specific method name, the way `main()` works)?
The alternative — convention-based discovery — is exactly what plain
Java does, and it works fine when there's only one kind of "entry
point" to find. Android apps can have *many* entry points (multiple
Activities, plus Services, Broadcast Receivers, and Content Providers,
none of which you've met yet) and the OS needs to know about all of
them, their permissions, and their capabilities *before* it ever loads
your code — for security review, for showing your app's declared
permissions to the user before install, and for letting the OS start
components without loading your whole app into memory just to check.
The cost of this design: a second file format and syntax to maintain
in parallel with your Java, which has to stay manually in sync with
your actual classes — miss updating the Manifest when you add a new
Activity, and it silently doesn't exist as far as the OS is concerned,
even though it compiles perfectly.

---

## Concept Unit: `extends AppCompatActivity` and the Methods You Never Call

### The Problem

Open `MainActivity.java` again:

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

You've never called `onCreate`. Nothing in this file calls it. And yet
when you ran this app in Lesson 1, code inside it clearly executed —
you saw a screen. Something is calling this method, and it isn't you.

### Introduce the Concept in Isolation

Before touching Android's real lifecycle (which has many methods),
prove the *underlying mechanism* — a subclass method getting called by
someone other than you — with a tiny throwaway example, no Android
involved at all.

Create `pkgdemo2/Base.java` and `pkgdemo2/Child.java`:

```java
public class Base {
    public void run() {
        System.out.println("Base.run() starting");
        setup();
        System.out.println("Base.run() finished");
    }
    protected void setup() {
        System.out.println("Base's default setup — nobody overrode me");
    }
}
```

```java
public class Child extends Base {
    @Override
    protected void setup() {
        System.out.println("Child's setup ran instead!");
    }
    public static void main(String[] args) {
        Child c = new Child();
        c.run();
    }
}
```

Compile and run both:

```
javac pkgdemo2/Base.java pkgdemo2/Child.java
java -cp pkgdemo2 Child
```

You'll see `Base.run() starting`, then `Child's setup ran instead!`,
then `Base.run() finished` — even though `Child` never calls `setup()`
itself, and `main()` only calls `run()`. This is what the output
*proves*: a parent class can call a method that a child class
overrides, and the parent's own code decides *when* to call it, while
the child only decides *what happens* when it's called.

Discard `pkgdemo2` — it won't appear in the project again. But hold
onto the pattern: `AppCompatActivity` (which you didn't write — it's
part of the Android framework, a `Base`-like class) is doing exactly
this. The Android OS holds a reference to *its* code, and *its* code
calls `onCreate()` at the right moment. `MainActivity` just overrides
what happens when that call arrives.

### Project Change

- **Reference Source:** No reference counterpart — reading the wizard's
  generated `MainActivity.java`.
- **Files affected:** `app/src/main/java/.../MainActivity.java`.
- **Change type:** Inspect, then a small addition (a log line) to make
  the calling behavior visible.

### The New Code

Add one line inside the existing `onCreate`:

```java
android.util.Log.d("Lifecycle", "onCreate called");
```

### The Updated Project

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        android.util.Log.d("Lifecycle", "onCreate called");  // ← new
    }
}
```

The method as a whole now does what it did before (call the parent's
setup work, inflate your screen's layout) *plus* one visible proof
that it ran: a log line you can watch appear in real time.

### Mechanical Walkthrough

- `extends AppCompatActivity` — **first appearance** (the framework
  version of the `Base`/`Child` pattern you just labbed).
- `@Override` — **first appearance.** A compiler-checked annotation:
  "I intend this method to replace a method of the same name/signature
  in the parent class." Without it, a typo in the method name (say,
  `onCreat`) would silently compile as a brand-new unrelated method
  that the OS never calls — `@Override` turns that mistake into a
  compile error instead of a silent bug.
- `protected void onCreate(Bundle savedInstanceState)` — **first
  appearance.** `protected` means callable by the class itself, by
  subclasses, and — critically — by framework code in the same
  package, which is exactly how the OS is able to call it without it
  being fully `public`. `Bundle savedInstanceState` is a parameter
  holding saved state from a previous run (not needed yet — you'll use
  it for real once your app has actual data to preserve, in a later
  lesson).
- `super.onCreate(savedInstanceState)` — **first appearance.** Directly
  matches the `pkgdemo2` lab: this explicitly calls the parent class's
  own version of `onCreate`, which does essential framework setup you
  are not shown and should never skip.
- `setContentView(R.layout.activity_main)` — **first appearance.**
  `R.layout.activity_main` is your first sight of the generated `R`
  class — covered as its own unit next — and `setContentView` is the
  call that actually puts a layout on screen.
- `android.util.Log.d(...)` — **reappearing pattern** (a static method
  call, already basic), but the *purpose* — writing to Android's
  Logcat system, a dedicated debugging output channel separate from
  `System.out` — is worth a clause: Logcat survives and is filterable
  in ways plain console output on a phone isn't, which is why Android
  code uses `Log.d`/`Log.e`/etc. instead of `System.out.println` once
  you're off a desktop JVM.

### Run It

Run the app on an emulator or device. Open the **Logcat** panel at the
bottom of Android Studio, filter by the tag `Lifecycle`, and confirm
you see `onCreate called` appear the moment the app launches — this is
your own eyes watching the OS call a method you never called.

### CS Lens

This is the **Template Method pattern** — a base class defines the
overall algorithm's shape and calls out to points a subclass fills in.
Also recognized in: `unittest`/JUnit's `setUp()`/`tearDown()` being
called around your test methods, GUI frameworks in general (a window
toolkit calling your `onClick` handler), servlet containers calling
`doGet`/`doPost` on your class, and game engines calling your `update()`
every frame.

### SE Lens

**Why does Android control the calling instead of letting you write
your own startup sequence?** The alternative — you write `main()` and
manually orchestrate window creation, resource loading, and shutdown —
is exactly what desktop Java GUI apps historically did, and it worked,
but it meant every app reinvented (and often got wrong) subtle,
security- and battery-relevant behavior: what happens when the user
switches apps, when the OS is low on memory, when the screen rotates.
By owning the calling and only exposing override points, Android
guarantees every app handles these system-level events consistently,
at the cost of exactly the disorientation you started this lesson
with — control flow that isn't visible by reading your file top to
bottom, because a real part of "what runs when" lives outside your
code entirely.

---

## Concept Unit: The `R` Class — Generated Code You Never Write

### The Problem

`setContentView(R.layout.activity_main)` references `R.layout`. You
never created a class called `R`. Where does it come from, and why
does autocomplete somehow know about it?

### Project Change

- **Reference Source:** No reference counterpart — `R.java` is
  generated by the Android build tools, not written by a developer,
  ever.
- **Files affected:** none you edit — this unit is purely inspection.

### The New Code

There's nothing to type here — instead, locate the generated file.
Build the project once (Build → Make Project) if you haven't, then in
the **Project** view (not Android view) find:
`app/build/generated/.../R.java`

Open it and skim — you'll see something shaped like:

```java
public final class R {
    public static final class layout {
        public static final int activity_main = 0x7f0b001c;
    }
    public static final class string {
        public static final int app_name = 0x7f100000;
    }
    ...
}
```

### Mechanical Walkthrough

- `public final class R` — **first appearance of the pattern**, though
  `public class` itself is already basic. `final` here means this
  class cannot be subclassed — reasonable, since it's pure generated
  data, never meant to be extended.
- Nested `static final class layout`, `class string`, etc. — **first
  appearance.** Each nested class groups one *type* of resource. This
  is why you write `R.layout.activity_main` and `R.string.app_name` —
  the outer `R` plus the resource-type name plus the specific
  resource's name, three-part addressing.
- The integer values (`0x7f0b001c`) — **first appearance**, worth one
  clause: these are just unique numeric IDs. You never write or read
  them directly; you always go through the generated constant names.
  The numbers exist because, ultimately, Android's resource system is
  numeric under the hood for performance — the human-readable names are
  purely a compile-time convenience layered on top.

### CS Lens

This is **code generation** — a build tool produces source code from
another artifact (here, your `res/` folder's file and folder names)
rather than a human typing it. Also recognized in: gRPC/Protocol
Buffer generated classes from a `.proto` file, SQL ORM generated model
classes from a database schema, and Swagger/OpenAPI generated API
client code.

### SE Lens

**Why generate a class instead of just using string literals like
`setContentView("activity_main")`?** The alternative is exactly what
some older or simpler frameworks do, and its failure mode is exactly
what you'd expect: typo a string, and you get a runtime crash, often
far from where the mistake was made, discovered only when that code
path executes. Generating `R` means a renamed or deleted layout file
becomes an immediate, compile-time error in every place that
references it — the cost is a build step that has to regenerate `R`
every time your resources change, which is part of why Android builds
can feel slow compared to a plain Java project.

---

## Connect the Pieces

One trace through the whole lesson: you tap the Pocket Inventory icon
→ the OS reads the Manifest, finds the `<activity>` with the
`MAIN`/`LAUNCHER` intent-filter, and knows to instantiate
`MainActivity` → the OS (via `AppCompatActivity`'s framework code, not
your code) calls `onCreate()` → your override runs `super.onCreate()`
then `setContentView(R.layout.activity_main)` → `R.layout.activity_main`
resolves to the generated ID pointing at your `activity_main.xml` file
→ that layout gets inflated onto the screen you see. Every step in
that chain is something you can now point to a real file for.

## What Breaks Without This

Comment out the entire `<activity>...</activity>` block in the
Manifest and try to run the app. Read the actual error (it'll likely
be about no launcher activity, or the app installing but not appearing
anywhere to tap). Restore the block afterward.

## Exercises

1. Add a second `Log.d` call inside `onCreate`, *before*
   `super.onCreate(...)`, with a different message. Run it and check
   Logcat — does your line appear before or after Android's own
   internal setup work? What does that tell you about calling
   `super.onCreate()` first vs. last?
2. In the `pkgdemo2` lab, add a *second* override level: a `GrandChild`
   extending `Child`, overriding `setup()` again. Predict the output
   before running it, then check yourself.

## Definition of Done

- [ ] You can point to the exact line in the Manifest that makes
      `MainActivity` the launcher screen.
- [ ] You saw your own `Log.d` line appear in Logcat, proving `onCreate`
      is called by the OS, not by you.
- [ ] You ran the `pkgdemo2` Template Method lab and it matched your
      prediction (or you understand why it didn't).
- [ ] You located the real generated `R.java` file on disk, not just
      read about it.
- [ ] Commit: message explaining *why* (e.g. "Add Logcat trace to
      onCreate to observe Android's lifecycle calling MainActivity,
      not the reverse").

Next lesson: Story 2 — building a real layout instead of the wizard's
default, and what `ConstraintLayout` is actually solving.