# Lesson 1: Two Screens, Talking on Purpose

**What you will build:** A minimal Android app with two separate `Activity`
classes — `MainActivity` and a second screen, `SecondActivity` — where
tapping a button on the first deliberately hands control to the second.
Nothing about login or signup yet; that's the point. The transferable
problem this lesson is actually about: **how does Android know what code
to run when the app starts, and how does one screen ever get another
screen to run?** Every later lesson in this series — Login screen, Signup
screen, and the router that chooses between them — is built entirely out
of the two mechanisms this lesson isolates: the `Activity` and the
`Intent`. If these two are shaky, the routing logic in Lesson 4 will feel
like magic instead of code you wrote on purpose.

**What you need to know first:** Nothing. This is Lesson 1.

**Terms used in this lesson**

- **Activity** — an Android app is not one long-running program the way a
  desktop app often is; it's a collection of separate, independently
  launchable *components*, and `Activity` is the component type that
  represents one screen a user can look at and interact with. This exists
  because a phone user can jump into your app at literally any entry
  point (a notification, a share action, a link from another app) — there
  is no single "top of the program" the way `main()` gives a desktop app.
  Android needs every screen to be a self-contained unit it can start on
  its own, without first running through some other screen to get there.
- **Manifest** — `AndroidManifest.xml`, a single XML file at the root of
  every Android project that declares, up front, every component the app
  contains — every `Activity` among them — before any of your code runs.
  This exists because the Android OS itself decides when to create your
  `Activity` objects (see `Activity`, above) — your own code never calls
  `new MainActivity()` — and the OS can't discover a class by scanning
  your compiled code at runtime the way a scripting language might; it
  needs a fixed, declared list to consult first.
- **Explicit Intent** — an `Intent` (see Objects and methods, below)
  that names its target component by exact class, the way this lesson
  uses it. Contrasted with an *implicit* Intent, which describes an
  action ("share this text," "open this URL") and lets Android's own
  resolution system pick whichever installed app can handle it. This
  lesson only uses explicit Intents — you already know exactly which
  class you want to run next, because it's a class in your own app — so
  there's no ambiguity to resolve.
- **Layout (XML)** — a `.xml` file under `res/layout/` describing a
  screen's visual structure declaratively — what Views exist, in what
  arrangement — separately from the Java code that gives them behavior.
  This exists so a screen's *appearance* and its *behavior* live in two
  different files that can each be edited, and reasoned about, without
  touching the other.
- **View** — the base class for anything drawn on an Android screen a
  user can see or touch — a button, a text field, a label. Every
  concrete UI element this lesson uses (`Button`) is a `View`
  underneath. This matters because Android's own APIs for finding and
  manipulating on-screen elements (see `findViewById`, below) are
  written against `View`, not against each specific subclass, so
  understanding that a `Button` *is a* `View` is what makes those APIs'
  shapes make sense.

**Objects and methods used**

- **`Activity`**
  - *What it is:* The Android framework class representing one screen.
  - *Implementation:* `public class Activity extends ContextWrapper
    implements ComponentCallbacks2, ...` — declared in the Android SDK,
    not something your project defines from scratch.
  - *Its use:* Every screen in this series — Login, Signup, the router,
    the real app — is a subclass of this.
  - *Type:* A public framework class, meant to be subclassed, never
    instantiated directly with `new`.
  - *Responsibility:* Owns one screen's entire lifecycle — being
    created, becoming visible, receiving user input, being paused when
    another screen covers it, and eventually being destroyed — and
    exposes the callback methods (like `onCreate`, below) your code
    overrides to hook into each of those moments.
  - *Depends on:* The Android OS itself to construct it — your code
    never calls its constructor. It also depends on being declared in
    the Manifest (see Terms, above); an undeclared `Activity` subclass
    will crash the moment Android tries to start it.
  - *Connects to:* The OS creates it and calls its lifecycle methods;
    your subclass (`MainActivity`, `SecondActivity`) overrides those
    methods to run your own code at the right moment; it can create an
    `Intent` (below) and call `startActivity` on itself to hand off to
    another `Activity`.
  - *Shape:* This is the outermost architectural boundary in an Android
    app — the seam between "code the OS drives" and "code you write."
    Nothing above an `Activity` in this app; the OS is the caller.

- **`AppCompatActivity`**
  - *What it is:* A subclass of `Activity` provided by Android's
    AndroticX support library, not the raw framework class.
  - *Implementation:* `public class AppCompatActivity extends
    FragmentActivity` (which itself extends `Activity`) — found in the
    `androidx.appcompat.app` package.
  - *Its use:* This lesson extends `AppCompatActivity`, not `Activity`
    directly, because that's what a new Android Studio project
    generates by default and what every later lesson in this series
    will keep using — it back-ports newer visual and behavioral features
    to devices running older Android versions.
  - *Type:* A public class, meant to be subclassed, same as `Activity`.
  - *Responsibility:* Everything `Activity` is responsible for, plus
    compatibility shims so newer UI behavior (like modern theming, which
    Lesson 7 covers) works correctly on older Android versions.
  - *Depends on:* Being declared in the Manifest, exactly like plain
    `Activity` — the OS doesn't distinguish "how far up the hierarchy"
    a component sits when reading the Manifest, only whether the class
    is listed.
  - *Connects to:* Sits directly between your `MainActivity`/
    `SecondActivity` classes and the framework's own `Activity` — your
    code calls its inherited methods (`setContentView`, `findViewById`);
    it in turn talks to the OS on your behalf.
  - *Shape:* A compatibility layer — an internal implementation detail
    of "which exact framework class do I extend," invisible to the rest
    of the app's logic.

- **`onCreate(Bundle savedInstanceState)`**
  - *What it is:* A lifecycle callback method, inherited from `Activity`
    and overridden here.
  - *Implementation:* `protected void onCreate(@Nullable Bundle
    savedInstanceState)` — declared in `Activity`, overridden in your
    subclass with the `@Override` annotation.
  - *Its use:* This is where this lesson's code actually runs — the OS
    calls this exactly once, the first time it creates your `Activity`,
    before the screen becomes visible.
  - *Type:* A `protected` instance method, meant to be overridden, not
    called directly by your own code.
  - *Responsibility:* Gives your subclass its first, one-time chance to
    set up the screen — attach a layout, find views, wire up listeners —
    before the user can see or touch anything.
  - *Depends on:* Being called by the OS, which supplies its one
    parameter, `savedInstanceState` — a `Bundle` holding state from a
    previous instance of this same `Activity`, if the OS destroyed and
    recreated it (for example, on a screen rotation). This lesson's code
    doesn't use that parameter yet; it's simply required by the method
    signature you're overriding.
  - *Connects to:* Called by the OS; inside it, your code calls
    `super.onCreate(savedInstanceState)` first (required — skipping it
    breaks the base class's own setup), then `setContentView` and
    `findViewById`.
  - *Shape:* The callback boundary between framework code (the OS
    deciding *when*) and app code (your logic deciding *what*) — the
    first of several such boundaries `Activity` exposes.

- **`setContentView(int layoutResID)`**
  - *What it is:* An `Activity` instance method that attaches a layout
    to the screen.
  - *Implementation:* `public void setContentView(@LayoutRes int
    layoutResID)` — declared in `Activity`; the parameter is an `int`
    because Android compiles every XML layout file into a generated
    integer constant (`R.layout.activity_main`), not a file path.
  - *Its use:* Called once, inside `onCreate`, to say "this screen looks
    like the layout described in this XML file."
  - *Type:* A `public` instance method — called *on* the `Activity`
    itself (implicitly, as `this`), not on some separate object.
  - *Responsibility:* Inflates the given XML layout — walks the file and
    builds the real `View` objects it describes — and installs the
    result as this screen's visible content.
  - *Depends on:* A valid layout resource ID, which in turn depends on a
    real `.xml` file existing under `res/layout/`.
  - *Connects to:* Called by your `onCreate`; internally it drives
    Android's XML-inflation system, which is what actually turns
    `<Button>` tags into real `Button` objects in memory.
  - *Shape:* The seam between the declarative layout file and the
    imperative Java code — everything after this call can assume the
    views described in that XML now exist as real objects.

- **`findViewById(int id)`**
  - *What it is:* A `View`-family method (inherited by `Activity`
    through `Context`) for retrieving a specific view that was just
    inflated by `setContentView`.
  - *Implementation:* `public <T extends View> T findViewById(@IdRes int
    id)` — a generic method; the compiler infers the return type from
    what you assign it to, so no explicit cast is needed in modern code.
  - *Its use:* Called after `setContentView`, once per view your Java
    code needs to interact with — here, the `Button`.
  - *Type:* A `public` instance method.
  - *Responsibility:* Searches the just-inflated view hierarchy for the
    one view whose `android:id` attribute matches the given ID, and
    hands back a live reference to it.
  - *Depends on:* `setContentView` having already run — calling this
    before the layout is attached finds nothing, because there is
    nothing yet to search.
  - *Connects to:* Called by your `onCreate`, after `setContentView`;
    reads the ID that the XML layout declared with `android:id="@+id/..."`.
  - *Shape:* The bridge from the declarative layout world back into
    imperative Java — this is the one call that lets your code hold a
    real, callable reference to something that started life as XML text.

- **`Button`**
  - *What it is:* A concrete `View` subclass representing a tappable
    button.
  - *Implementation:* `public class Button extends TextView` (which
    itself extends `View`) — from `android.widget`.
  - *Its use:* This lesson's one interactive element — the thing the
    user taps to trigger navigation to `SecondActivity`.
  - *Type:* A public class, instantiated by the layout-inflation system
    when `setContentView` reads a `<Button>` tag — never with `new` in
    this lesson's own code.
  - *Responsibility:* Renders itself as a tappable rectangle with a
    label, and reports taps to whatever `View.OnClickListener` has been
    registered on it.
  - *Depends on:* Being declared in the layout XML with a unique
    `android:id`, so `findViewById` can retrieve it afterward.
  - *Connects to:* Created by the inflation system from XML; retrieved
    by `findViewById`; has a listener attached via `setOnClickListener`,
    below.
  - *Shape:* A leaf node in the screen's view hierarchy — the actual
    on-screen surface the user's tap lands on.

- **`setOnClickListener(View.OnClickListener l)`**
  - *What it is:* A `View` instance method for registering a callback to
    run when the view is tapped.
  - *Implementation:* `public void setOnClickListener(@Nullable
    OnClickListener l)` — declared on `View` itself (so every `View`
    subclass, not just `Button`, can be made tappable this way).
    `OnClickListener` is a nested interface of `View`, with a single
    method: `void onClick(View v)`.
  - *Its use:* This lesson attaches a listener to the `Button` so that a
    tap actually runs code — specifically, the code that builds an
    `Intent` and calls `startActivity`.
  - *Type:* A `public` instance method, called on the `Button` object
    retrieved from `findViewById`.
  - *Responsibility:* Stores the given listener object and arranges for
    its `onClick` method to be called, exactly once per tap, whenever
    this specific view registers a tap gesture.
  - *Depends on:* An object implementing `View.OnClickListener` — in
    this lesson, written inline as a lambda expression (Java 8's short
    syntax for implementing a single-method interface without a named
    class).
  - *Connects to:* Called by your `onCreate` on the `Button`; the
    listener it's given is what actually calls `startActivity`, below.
  - *Shape:* A callback boundary between the OS's own touch-handling
    system and your app's logic — the OS decides *when* a tap happened;
    your listener decides *what happens next*.

- **`Intent`**
  - *What it is:* A framework class representing a request to do
    something — here, "start this specific `Activity`."
  - *Implementation:* `public Intent(Context packageContext, Class<?>
    cls)` — the two-argument constructor this lesson uses, from
    `android.content.Intent`.
  - *Its use:* Built inside the button's click listener, naming exactly
    which `Activity` should run next.
  - *Type:* A public class; this lesson constructs it directly with
    `new`, unlike `Activity` or `Button`, which the framework
    constructs for you.
  - *Responsibility:* Carries everything needed to describe "start this
    component" — which class, and (starting in Lesson 2) any data to
    hand it — as one self-contained object that can be built in one
    place and consumed in another.
  - *Depends on:* A `Context` (an `Activity` itself is one, which is why
    `MainActivity.this` is passed) and a `Class` object naming the
    target `Activity`.
  - *Connects to:* Built by your click listener; consumed by
    `startActivity`, below, which reads it to decide what to launch.
  - *Shape:* A data-transfer object at the boundary between two
    Activities — deliberately inert on its own; it does nothing until
    handed to `startActivity`.

- **`startActivity(Intent intent)`**
  - *What it is:* An `Activity` instance method that asks the OS to
    launch the component described by the given `Intent`.
  - *Implementation:* `public void startActivity(Intent intent)` —
    declared on `Activity`.
  - *Its use:* The actual hand-off — calling this is what makes
    `SecondActivity` appear on screen.
  - *Type:* A `public` instance method, called on `this` (the current
    `Activity`) from inside the click listener.
  - *Responsibility:* Hands the `Intent` to the OS's own component-
    resolution system, which reads it, confirms the named class is a
    declared `Activity` (checking the Manifest), and creates and starts
    it.
  - *Depends on:* A fully-built `Intent`; and, transitively, on the
    target `Activity` being declared in the Manifest — an undeclared
    target crashes here at runtime with `ActivityNotFoundException`.
  - *Connects to:* Called by your click listener; hands control to the
    OS, which is what ultimately constructs `SecondActivity` and calls
    *its* `onCreate` — closing the loop back to the very first entry in
    this list.
  - *Shape:* The actual seam this whole lesson exists to explain — the
    literal moment control passes from one screen's code to another's,
    on purpose, by your own explicit request.

---

## Concept Unit: The Activity and the Manifest

### The Problem

Right now you have nothing but a blank Android Studio project. If you
write a class called `MainActivity` with some Java code in it, how does
the phone know to run it when the user taps your app's icon? A desktop
program has one obvious entry point — `main()`. An Android app has none,
by design: the OS itself decides which of your components to start, and
it decides that by reading a fixed list, not by scanning your compiled
code for something that looks like an entry point.

### Introduce the Concept in Isolation

Create a throwaway project — a brand-new, empty Android Studio project,
used only to see this one mechanism, never touched again after this
section.

```java
// MainActivity.java — throwaway, in a scratch project
package com.example.scratch;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("SCRATCH", "MainActivity is running.");
    }
}
```

With this class declared in `AndroidManifest.xml` (shown in the next
section) and the app run on an emulator, Logcat shows:

```
D/SCRATCH: MainActivity is running.
```

Now delete the `<activity>` declaration for this class from the Manifest
— leave the Java file exactly as it is — and run again. The app crashes
immediately on launch:

```
android.content.ActivityNotFoundException: Unable to find explicit
activity class {com.example.scratch/com.example.scratch.MainActivity};
have you declared this activity in your AndroidManifest.xml?
```

That crash *proves* the point this lab exists to make: the class
existing and compiling successfully is not what makes it a runnable
screen. Only the Manifest entry does. This declared-components pattern —
telling a system in advance exactly what pieces exist, rather than
letting it discover them by inspecting code at runtime — is called
**component registration**.

### Discard the Throwaway Example

This scratch project and its `MainActivity` are done being useful. They
are deleted now and will not appear again. Everything from here on
builds the real project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition because this is the very first lesson of a new project with no
  prior codebase to port from.
- **Files affected:** `app/src/main/AndroidManifest.xml` (created by
  Android Studio's "Empty Views Activity" project template, then edited);
  `app/src/main/java/.../MainActivity.java` (created by the same
  template).
- **Change type:** Configure (the Manifest entry) and add (the class
  body, replacing the template's default content).
- **Location:** The `<application>` element in the Manifest, where the
  template already placed one `<activity>` tag for `MainActivity`.
- **Dependencies:** A working Android Studio installation and an
  emulator or physical device to run against — no external packages.

### The New Code

```xml
<activity
    android:name=".MainActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.AuthFlowDemo">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <!-- ← new, whole block: SecondActivity, added in the next unit -->

    </application>
</manifest>
```

As a whole, this Manifest now declares one component the OS can create:
`MainActivity`, and marks it — via the `intent-filter` — as the one
component to run when the user taps the app's launcher icon. Nothing
runs yet without this declaration existing, no matter how correct the
Java class itself is.

### Mechanical Walkthrough

- **`<activity android:name=".MainActivity">`** — a declaration tag, not
  a reference to the `Activity` class from the Header itself, even
  though it names it. This XML tag *is* the component registration this
  lab just proved is required — its own syntax carries meaning: the
  leading dot in `.MainActivity` is shorthand for "prefix this with the
  package name already declared at the top of this file
  (`com.example.scratch`, or whatever your real package is)," saving you
  from writing the fully-qualified class name out by hand every time.
- **`android:exported="true"`** — an attribute controlling whether
  components *outside* this app are allowed to start this `Activity`.
  Starting with Android 12, any `Activity` carrying an `intent-filter`
  (below) must explicitly state this — the OS will refuse to install an
  app that leaves it unset. `MainActivity` needs `true` here because the
  launcher (technically a separate app on the phone) has to be able to
  start it.
- **`<intent-filter>`** — a declaration, nested inside the `<activity>`
  tag, describing what *kinds* of implicit Intents (see Terms, above)
  this Activity is willing to respond to. This lesson's own code only
  ever uses explicit Intents, so this element isn't for anything this
  lesson's Java code does directly — it's read by a different caller
  entirely: the OS's home-screen launcher app, deciding what to do when
  the user taps your icon.
- **`<action android:name="android.intent.action.MAIN" />`** — declares
  that this Activity can serve as an entry point with no expected input
  data, as opposed to an Activity meant to *receive* something (a shared
  photo, a URL). "MAIN" here is a fixed, framework-defined string
  constant, not a name you choose.
- **`<category android:name="android.intent.category.LAUNCHER" />`** —
  declares that this Activity should additionally appear as an icon on
  the device's home screen / app drawer. `MAIN` alone says "I can be an
  entry point"; `LAUNCHER` says "and specifically, put an icon for me
  where the user can tap it." Both together are what make this the
  screen that opens when the app icon is tapped.

### CS Lens

This is an instance of **component registration** — a system requiring
every unit it might need to create or invoke to be declared to it in
advance, rather than discovering them by inspecting code at runtime.

Also recognized in: a web server's routing table (URLs mapped to handler
functions, declared up front, not discovered by scanning source files);
a plugin system that requires a `plugin.json` manifest before it will
load a `.dll` or `.so` file; a dependency-injection container's
configuration file, listing every bean or service it's allowed to
construct; a compiler's own symbol table, built in a first pass before
code generation can reference anything in it.

### SE Lens

The alternative Android *could* have chosen — and other platforms
sometimes do — is runtime reflection: scan the compiled app for any
class extending `Activity` and treat all of them as launchable. Android
deliberately didn't choose that. The tradeoff: reflection-based discovery
is more convenient to write (no separate file to keep in sync) but means
the OS cannot know what your app is capable of — what permissions it
needs, what screens exist, what it should be allowed to do — without
first loading and executing your code, which is both slower at install
time and a real security liability (a malicious app's code would have to
run, at least partially, just to be inspected). Declaring everything in
one static XML file lets the OS, the Play Store's review tooling, and
the user's own permission prompts all reason about the app *before*
running a single line of it. The cost this project is now carrying: this
Manifest is a second place, separate from the Java source, that must be
kept in sync by hand — forgetting to add an `<activity>` entry for a new
class is exactly the crash this lab reproduced on purpose.

### Commands Needed

No new terminal commands for this unit — the Manifest edit is made
directly in Android Studio's editor, and the app is run with Android
Studio's own Run button (▶), which internally invokes Gradle's
`assembleDebug` task and installs the resulting APK to the running
emulator.

### Run It

Running the real project at this point (with `MainActivity`'s `onCreate`
left at the template's default, unedited) launches successfully and
shows the default template screen — proof the Manifest declaration is
correct and the app now has one working entry point. Full behavior
verification continues in the next unit, once `SecondActivity` exists to
navigate to.

### Connection

The Manifest now knows about one screen. The next unit adds a second one
and gives the user a way to move from the first to the second on
purpose — which is the actual mechanism this lesson exists to teach.

---

## Concept Unit: The Explicit Intent

### The Problem

`MainActivity` now runs. But it's alone — nothing in this project can
show a second screen yet. You need a way for one Activity's code to say,
concretely, "stop showing this screen; show that other one instead" —
and you need the OS to be the one that actually does it, since your code
never gets to call `new SecondActivity()` directly (see the `Activity`
entry in the Header — the OS owns construction).

### Introduce the Concept in Isolation

In the same throwaway scratch project style as the previous unit (a
disposable two-Activity project, not the real one), add a second,
empty Activity and a button:

```java
// ScratchActivity.java — throwaway
public class ScratchActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("SCRATCH", "ScratchActivity is now running.");
    }
}
```

```java
// inside MainActivity's onCreate, throwaway
Intent intent = new Intent(MainActivity.this, ScratchActivity.class);
startActivity(intent);
```

Running this, Logcat shows, in order:

```
D/SCRATCH: MainActivity is running.
D/SCRATCH: ScratchActivity is now running.
```

That ordering — `MainActivity`'s log line appearing, then, only after
`startActivity` runs, `ScratchActivity`'s — is the proof: control
genuinely passed from one Activity's code to another's, and it did so
*because* of this specific two-line request, not automatically. This
mechanism — one object naming a target and a separate call handing it to
the OS to act on — is called an **explicit Intent**.

### Discard the Throwaway Example

This scratch `ScratchActivity` and its inline `onCreate` snippet are
deleted now. The real project gets its own, real `SecondActivity` in the
next section, built the same way but kept permanently.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  same as the previous unit; this is still the project's first lesson.
- **Files affected:** `app/src/main/java/.../SecondActivity.java`
  (new file); `app/src/main/res/layout/activity_second.xml` (new file);
  `app/src/main/java/.../MainActivity.java` (modified);
  `app/src/main/res/layout/activity_main.xml` (modified);
  `AndroidManifest.xml` (modified — the `<activity>` block placed as
  "new" in the previous unit's Updated Project step).
- **Change type:** Add (new files, new Manifest entry); modify
  (`MainActivity`'s `onCreate` and its layout).
- **Location:** `MainActivity.onCreate`, after the existing
  `setContentView` call the template generated.
- **Dependencies:** The Manifest entry for `SecondActivity` added in the
  previous unit's Updated Project step must exist before this code runs,
  or the app will crash with the same `ActivityNotFoundException` this
  lesson's first lab reproduced on purpose.

### The New Code

```java
Button goButton = findViewById(R.id.go_button);
goButton.setOnClickListener(v -> {
    Intent intent = new Intent(MainActivity.this, SecondActivity.class);
    startActivity(intent);
});
```

### The Updated Project

```java
package com.example.authflowdemo;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button goButton = findViewById(R.id.go_button);          // ← new
        goButton.setOnClickListener(v -> {                        // ← new
            Intent intent = new Intent(MainActivity.this, SecondActivity.class); // ← new
            startActivity(intent);                                 // ← new
        });                                                        // ← new
    }
}
```

`onCreate` now does three things in sequence, not one: it runs the
mandatory `super` call, attaches the layout, and — the new part — finds
the button that layout declared and gives it something to do. As a
whole, this method now fully sets up the screen: by the time it returns,
the screen is visible *and* the button on it is ready to respond to a
tap, rather than sitting there inert.

### Mechanical Walkthrough

- **`findViewById(R.id.go_button)`** — a call to the method fully
  explained in the Header, above; retrieves the live `Button` object the
  layout's inflation just created, by matching the ID declared on it in
  XML. This is a *reappearing* call — the mechanism is identical to
  `findViewById` anywhere else it's used — and per the Repetition Rule
  it still gets its own real explanation here rather than a silent pass,
  even though it's the same method already given full treatment above.
- **`Button goButton = ...`** — a local variable declaration; `Button`
  here is a type annotation, telling the compiler (and the reader) what
  kind of object this variable will hold, matching the type
  `findViewById`'s generic signature infers from context.
- **`goButton.setOnClickListener(...)`** — an instance method call on
  the `Button` object just retrieved, fully explained in the Header,
  registering the lambda that follows as the code to run on tap.
- **`v -> { ... }`** — a **lambda expression**: Java's syntax for
  implementing a single-method interface (`View.OnClickListener`, whose
  only method is `onClick(View v)`) inline, without writing a separate,
  named class. `v` is the parameter — the `View` that was tapped, here
  unused inside the body — and everything inside the braces is the
  method body that runs when the tap happens. Java requires this because
  `setOnClickListener` demands an actual object implementing that
  interface, not a bare block of code; the lambda is a compact way to
  produce that object without the ceremony of a full anonymous inner
  class.
- **`new Intent(MainActivity.this, SecondActivity.class)`** — a
  constructor call, fully explained in the Header. Two arguments:
  `MainActivity.this` — not plain `this`, because inside the lambda body
  above, `this` would refer to the (unnamed) listener object itself, not
  the enclosing `Activity`; the qualified form `MainActivity.this`
  explicitly reaches out one level to get the `Activity`, which is what
  the `Intent` constructor requires as its `Context` argument. The
  second argument, `SecondActivity.class`, is a `Class` object — a
  literal reference to the class itself, obtained with Java's `.class`
  syntax, which is how the constructor knows *which* component to name,
  without needing an actual instance of it to exist yet.
- **`startActivity(intent)`** — a call to the method fully explained in
  the Header; hands the just-built `Intent` to the OS, which is the
  actual moment `SecondActivity` gets created and shown.

**Execution trace (timing, not changing values):**

1. `goButton.setOnClickListener(...)` — this line only *registers* the
   lambda; nothing inside it runs yet. The app finishes `onCreate` and
   sits idle, showing the screen, waiting.
2. *(user taps the button, at some later, unpredictable moment)* —
   Android's own touch-handling system detects the tap landed on this
   `Button`'s screen area and calls the registered lambda's body.
3. `Intent intent = new Intent(...)` — only now, inside the running
   lambda, does the `Intent` object actually get constructed.
4. `startActivity(intent)` — only now does control actually pass to the
   OS, which is what finally creates and shows `SecondActivity`.

The reason this needs a timing trace rather than a value trace: nothing
here loops or changes state across iterations. The entire point is that
step 1 and step 3–4 can be separated by an arbitrary, unpredictable
amount of real time — the whole reason `setOnClickListener` exists at
all is to let code be written *now* that only actually executes *later*,
whenever the user gets around to tapping.

### CS Lens

This is an instance of the **Observer pattern** — an object (the
`Button`) that doesn't know or care what code wants to react to it,
holding a reference to a listener and calling it back when a specific
event (a tap) occurs, rather than the listener having to repeatedly
check "has anything happened yet?"

Also recognized in: a DOM element's `addEventListener` in JavaScript; a
`PropertyChangeListener` in older Java Swing code; a stock ticker
notifying every subscribed display of a price change; a filesystem
watcher calling your code back when a file changes, instead of you
polling the file in a loop.

### SE Lens

The alternative here would be **polling** — some loop, running
continuously, checking "has the button been tapped yet?" on every pass.
Android (and essentially every modern UI framework) deliberately chose
the callback/listener approach instead: it costs nothing while idle
(the app does no work at all between taps), and it scales cleanly to
screens with many interactive elements, each with its own listener,
without a growing tangle of polling loops. The real cost this pattern
carries: control flow becomes harder to read top-to-bottom in the source
file, because the lambda's body doesn't run in the order it's written in
— it runs later, out of the code's own textual sequence, at a time only
the OS decides. That's exactly why this unit needed a timing trace
instead of a simple top-to-bottom read.

### Commands Needed

No new terminal commands. Running the app continues to use Android
Studio's Run button, same as the previous unit.

### Run It

With `SecondActivity` given a minimal layout (a single `TextView`
reading "Second Screen") and declared in the Manifest, running the app
and tapping the button shows the second screen replacing the first on
screen, and Logcat (with a log line added temporarily to
`SecondActivity.onCreate` to verify, then removed) confirms:

```
D/AUTHFLOW: MainActivity onCreate finished.
D/AUTHFLOW: SecondActivity onCreate ran, after the tap.
```

### Connection

The tap on `MainActivity`'s button is what actually exercises everything
the previous unit set up in the Manifest — without that declaration,
this exact `startActivity` call would crash with the same
`ActivityNotFoundException` the very first lab in this lesson caused on
purpose. The Manifest declares *what's possible*; the `Intent` is what
makes a specific hand-off *actually happen*, on request, when your code
decides to.

---

## Connect the Pieces

Follow one tap, start to finish: the user taps the button on
`MainActivity`'s screen. Android's touch system finds the
`View.OnClickListener` registered on that `Button` back in `onCreate`
and calls its `onClick` method. Inside that lambda, `new Intent(
MainActivity.this, SecondActivity.class)` builds a plain data object
naming exactly one target class. `startActivity(intent)` hands that
object to the OS. The OS reads the `Intent`, looks up `SecondActivity`
in the Manifest — finding it there because of the `<activity>` entry the
first unit added — confirms it's a legitimate, declared component, and
only then constructs a real `SecondActivity` object and calls its
`onCreate`. Every step in that chain — the button existing, the listener
firing, the Intent being buildable, the target being found — depends on
work done earlier in this same lesson.

## What Breaks Without This

Comment out the `<activity android:name=".SecondActivity">` block in the
Manifest (leaving `SecondActivity.java` itself untouched) and run the app
again. Tapping the button crashes the app immediately:

```
android.content.ActivityNotFoundException: Unable to find explicit
activity class {com.example.authflowdemo/com.example.authflowdemo.SecondActivity};
have you declared this activity in your AndroidManifest.xml?
```

This is the exact same failure the very first lab in this lesson
demonstrated on purpose — proof that the lesson's opening point (a class
compiling successfully is not what makes it runnable) holds just as true
for a second Activity reached by Intent as it did for the app's own entry
point. Restore the Manifest entry and confirm the app runs correctly
again before moving on.

## Exercises

- Add a third, empty `Activity` (`ThirdActivity`) with its own layout and
  Manifest entry, and add a second button on `SecondActivity`'s layout
  that navigates to it the same way `MainActivity`'s button navigates to
  `SecondActivity`. This is deliberate repetition — the goal is
  building the Activity-declare-Intent-startActivity sequence into
  muscle memory before Lesson 2 adds real complexity (an actual login
  form) on top of it.
- Delete the `<category android:name="android.intent.category.LAUNCHER"
  />` line from `MainActivity`'s `intent-filter` (leave the `<action>`
  line in place) and try launching the app from the device's home
  screen. Observe and explain what changes, in terms of the two lines'
  separately-explained jobs in this lesson's Mechanical Walkthrough.

## Definition of Done

- [ ] `MainActivity` and `SecondActivity` both exist, both declared in
      the Manifest, both confirmed running via Logcat.
- [ ] Tapping the button on `MainActivity` visibly navigates to
      `SecondActivity` on a real emulator or device run.
- [ ] The "what breaks without this" crash was reproduced on purpose and
      the Manifest entry restored afterward.
- [ ] Commit, with a message explaining *why*: e.g. `Add explicit Intent
      navigation between MainActivity and SecondActivity — establishes
      the Activity/Intent pattern every later screen in this app's auth
      flow will reuse.`

**Next lesson:** Lesson 2 builds the real Login screen — an `EditText`-
based form, and the first use of an `Intent` that carries data along with
it (`putExtra`), not just a bare navigation request.