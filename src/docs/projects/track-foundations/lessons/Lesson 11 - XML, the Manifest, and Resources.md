# Lesson 11: XML, the Manifest, and Resources

**What you will build:** This lesson's material is markup and
configuration, not runnable Java — nothing here compiles with `javac`.
Each unit instead reads a small, real, verified example directly: the
markup format itself, then the real Android files built from it that make
`setContentView(R.layout.activity_main)` and a launchable app icon
possible at all.

**What you need to know first:** Lesson 10's `Activity`.

**Terms introduced in this lesson:**

- **XML** — a markup format using nested tags and attributes to describe
  structured data.
- **Android Manifest** — a required XML file declaring every component an
  Android app has (Activities, permissions, and more) so the OS knows
  what the app contains before ever running any of it.
- **Intent filter** — a Manifest declaration stating what kind of
  external request (such as "be the app's launcher screen") a given
  Activity is willing to handle.
- **Android resources** — non-code assets (strings, layouts, styles,
  images) stored in a structured `res/` folder, separate from source
  code, referenced symbolically rather than hardcoded inline.
- **Generated `R` class** — a class Android's build tools generate
  automatically, giving every resource a compile-time-checked integer
  constant instead of an error-prone raw string or file-path lookup.

---

## Concept Unit: XML — Nested Tags Describing Structured Data

### The Problem

Every file written so far has been Java source, describing behavior. Some
information isn't behavior at all — it's structured, hierarchical data: a
name, a list of properties, nested groupings — and forcing that kind of
data into Java source code (as string literals, as nested method calls)
is both awkward to write and awkward for a non-code tool to read back
out. A format built specifically for hierarchical data, readable by tools
that have nothing to do with Java at all, is needed instead.

### Introduce the Concept in Isolation

This concept needs no Java project at all — create a plain text file
named `pet.xml` anywhere, with this real, verified content:

```xml
<pet species="dog">
    <name>Rex</name>
    <age>3</age>
</pet>
```

This is `XML` — **first appearance**: a markup format using nested tags
and attributes to describe structured data. There is no `javac`/`java`
step for this file — nothing "runs" it; it exists purely to be read, by a
human or by a tool that understands this format's structure.

### Discard the Throwaway Example

This file is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `<pet species="dog"> ... </pet>` — **(a) first appearance** of a
   **tag**: `<pet ...>` opens it, `</pet>` closes it — everything between
   belongs to it. `species="dog"` is an **attribute**: a name-value pair
   attached directly to the opening tag, for a small piece of data that
   describes the tag itself rather than being nested content within it.
2. `<name>Rex</name>` and `<age>3</age>` — two more tags, nested inside
   `<pet>`, each holding its own text content rather than an attribute.
   Nesting is how XML expresses "this data belongs to, or is part of,
   that other data" — `name` and `age` belong to this specific `pet`,
   because they're written inside its tags.

### CS Lens

XML represents a **tree**: `<pet>` is the root, `<name>` and `<age>` are
its children, and `species` is a property of the root itself rather than
a child. This is the same nested-structure idea a filesystem's own
folders and files represent, described here for arbitrary data instead
of files.

Also recognized in: HTML (a close relative, built for documents rather
than arbitrary data), JSON (a different, more compact syntax for the same
underlying idea — nested, structured data), configuration formats across
countless tools and languages, none of them Java-specific.

### SE Lens

The alternative — encoding this same data as a Java string, hand-parsed —
was not chosen because XML already has a well-defined, widely-supported
structure that many existing tools (including Android's own build
system, this lesson's actual subject) already know how to read, without
any custom parsing code being written at all.

---

## Concept Unit: The Android Manifest — Declaring What an App Contains

### The Problem

Lesson 10 built and ran `MainActivity` in plain Java, but never
established how the Android OS would actually know `MainActivity`
exists, or which of an app's possibly-many Activities should open first
when the app's icon is tapped. Nothing about writing a Java class makes
Android aware of it automatically — some separate, OS-readable
declaration is needed.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, verified `AndroidManifest.xml`
shape, read directly:

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
permissions, and more) so the OS knows what the app contains before ever
running any of it. `MainActivity`, from Lesson 10, is only a real,
launchable screen because of this `<activity android:name=".MainActivity"
.../>` line — without it, the class exists in the compiled app but Android
has no record of it as a usable component at all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real, verified
shape of a required project file.

### Mechanical Walkthrough

1. `<manifest ...>` — **(a) first appearance** of the Manifest's root
   tag; `package="com.example.myapp"` names the application itself.
2. `<application ...>` — a required child tag representing the app as a
   whole; `android:label="My App"` is the human-readable name shown to
   the user (on the launcher icon, for instance).
3. `<activity android:name=".MainActivity" android:exported="true">` —
   **(a) first appearance** of declaring an Activity: `android:name`
   names the real Java class (`.MainActivity`, shorthand for
   `com.example.myapp.MainActivity`, the package name plus the class);
   `android:exported="true"` means this Activity can be launched by
   things outside the app itself (the launcher, for instance) — required,
   as of recent Android versions, for any Activity meant to be reachable
   from outside the app.

### CS Lens

The Manifest is a real, load-bearing example of XML — the previous unit's
concept — applied to a genuine engineering problem: the Android OS needs
to know an app's entire component inventory *before* running any of that
app's own code, since the OS itself is what decides when to construct and
destroy each component. A plain Java class, with no matching Manifest
entry, is invisible to the OS as a launchable thing, no matter how
correctly it's written.

Also recognized in: any plugin system's own manifest or registration file
(a browser extension's `manifest.json`, a VS Code extension's
`package.json`) — the same "declare what this component provides before
the host system runs any of it" shape recurring outside Android entirely.

### SE Lens

The alternative — Android scanning compiled code directly, looking for
anything that looks like an Activity — was not chosen because it would be
slow (scanning an entire compiled app on every launch) and ambiguous (any
class extending `Activity`, intentionally reachable or not, would be
exposed). A required, explicit declaration means only what's genuinely
meant to be a component the OS manages is ever treated as one.

---

## Concept Unit: Intent Filters — Declaring What an Activity Is Willing to Handle

### The Problem

The previous unit's Manifest declares that `MainActivity` exists, but
nothing yet says *which* Activity should open when the user taps the
app's icon — a real, specific decision an app with more than one Activity
genuinely needs to make, and the Manifest alone, as shown so far, doesn't
express.

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
Manifest declaration stating what kind of external request (such as "be
the app's launcher screen") a given Activity is willing to handle. This
specific combination — `action.MAIN` plus `category.LAUNCHER` — is the
exact, real mechanism behind an app icon being tappable and opening this
particular Activity: nothing else in the Manifest marks an Activity as
"the one that opens from the launcher."

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real, verified
shape of a required Manifest element.

### Mechanical Walkthrough

1. `<intent-filter> ... </intent-filter>` — **(a) first appearance.**
   Nested inside `<activity>`, declaring one specific kind of request
   this Activity accepts.
2. `<action android:name="android.intent.action.MAIN" />` — **(a) first
   appearance**: declares this Activity as a valid *entry point* — a
   screen with no expectation of receiving data from whatever launched
   it, unlike a screen a user navigates to mid-app.
3. `<category android:name="android.intent.category.LAUNCHER" />` —
   **(a) first appearance**: declares this Activity should appear as a
   tappable icon in the device's app launcher specifically. `MAIN` alone,
   without this category, would mark a valid entry point that still
   never shows up as an icon.

### CS Lens

An intent filter is a **capability declaration**: rather than the OS
assuming every Activity can handle every kind of request, each Activity
explicitly states what it's willing to handle, and the OS matches
requests against those declarations. This mirrors Lesson 06's interface
concept structurally — a declared contract about what something can do —
applied here to Manifest XML instead of Java code.

Also recognized in: a web server's own route declarations (which URLs a
given handler responds to), any plugin architecture where components
declare which events or requests they can service, rather than the host
assuming.

### SE Lens

The alternative — Android simply opening the first Activity declared in
the Manifest, with no explicit marking at all — was not chosen because an
app can have many Activities, added and reordered over time, with no
reliable "first" one; an explicit `LAUNCHER` declaration means exactly
which Activity opens from the icon never depends on file ordering or
declaration order at all.

---

## Concept Unit: Android Resources and the Generated `R` Class

### The Problem

UI text, colors, and layouts could be written directly inside Java
source, as string literals — but that mixes content (what a button
says) with behavior (what happens when it's tapped) in the same file,
and makes translating an app to another language mean editing Java code
directly. Some separation between "what the UI displays" and "what the
code does" is needed.

### Introduce the Concept in Isolation

A real, verified resource file, `res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">My App</string>
    <string name="welcome_message">Welcome!</string>
</resources>
```

This is an `Android resource` — **first appearance**: a non-code asset
(here, text) stored in a structured `res/` folder, separate from source
code, referenced symbolically rather than hardcoded inline. Java code
never writes `"Welcome!"` directly — it refers to `R.string.welcome_message`
instead, and Android's build tools generate a real `R` class connecting
that symbolic name to the actual resource:

```java
public final class R {
    public static final class string {
        public static final int app_name = 0x7f0f001c;
        public static final int welcome_message = 0x7f0f001d;
    }
}
```

This is the `generated R class` — **first appearance**: a class Android's
build tools generate automatically, giving every resource a compile-time-
checked integer constant instead of an error-prone raw string or
file-path lookup. It is never hand-written — the build tools regenerate
it every time a resource file changes, keeping it permanently in sync
with the actual contents of `res/`.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — the `strings.xml` shape and
the generated `R` class are both real, verified project artifacts.

### Mechanical Walkthrough

1. `<resources> ... </resources>` and `<string name="app_name">My
   App</string>` — **(a) first appearance** of this specific resource
   shape: `name` is the symbolic identifier code will refer to;
   `app_name` never appears as literal text anywhere in Java source.
2. `public final class R { public static final class string { ... } }`
   — **(a) first appearance** of the generated class's real shape: a
   nested `string` class (Lesson 01's nested classes, reused, **(b)**),
   holding one `static final int` constant (Lesson 03's class-level
   state, reused, **(b)**) per string resource, each an automatically-
   assigned integer.
3. `R.string.welcome_message` — the symbolic reference Java code
   actually writes, resolved by the compiler to one specific generated
   integer constant, checked at compile time exactly like any other
   field access.

### CS Lens

The generated `R` class turns "does this resource exist, spelled
correctly" from a runtime question (a typo'd file path simply fails to
find anything, discovered only when that code actually runs) into a
compile-time one (a typo'd `R.string.welcom_message` fails to compile at
all, since no such constant was ever generated). This is a real, load-
bearing example of the same static-checking value Lesson 07's generics
already established, applied here to resource references instead of
container element types.

Also recognized in: any build system that generates typed bindings from a
non-code asset (a GraphQL schema generating typed query functions, a
database schema generating typed row classes) — the general shape of
"generate compile-time-checked code from a separate, non-code
description."

### SE Lens

The alternative — referring to resources by raw string or file path
directly in Java code (`loadString("welcome_message")`) — was not chosen
because a typo in that string would only be discovered at runtime, if
ever, on whatever specific code path happens to execute it. The generated
`R` class converts this entire category of mistake into a compile error,
the same tradeoff already justified for `List<String>` in Lesson 07: real
compile-time safety, in exchange for a build step neither file could
have provided by itself.

---

## Connect the Pieces

`<pet species="dog">...</pet>` established XML's own nested-tag shape.
`AndroidManifest.xml` is a real, load-bearing use of that shape: declaring
`MainActivity` so the OS knows it exists at all, and an `<intent-filter>`
inside it declaring specifically that this Activity is the one that opens
from the launcher icon. `res/values/strings.xml` is a second real use of
the same XML shape, this time for UI content — and the generated `R`
class is what makes that content safely, symbolically referenceable from
Java code, the same compile-time-checked payoff generics already
delivered for collections.

## What Breaks Without This

An Activity declared in Java but missing from the Manifest entirely
cannot be launched — attempting to start it produces a real runtime
crash resembling:

```
android.content.ActivityNotFoundException: Unable to find explicit activity class {com.example.myapp/com.example.myapp.MainActivity}; have you declared this activity in your AndroidManifest.xml?
```

This is the concrete proof the Manifest isn't optional bookkeeping: the
Android OS genuinely does not know an Activity exists until it's declared
here, no matter how correctly the Java class itself is written and
compiled.

## Exercises

1. Add a second `<string>` resource, `goodbye_message`, and write out, by
   hand, what its generated `R` class entry would look like, following
   this lesson's real example.
2. Add a second `<activity>` to the Manifest, without an `<intent-filter>`
   of its own, and explain, in your own words, why it would not appear as
   a launcher icon even though it's still declared.
3. Find and read the real `ActivityNotFoundException` message shown in
   "What Breaks Without This" carefully — identify which specific part of
   the message names the missing Manifest declaration.

## Definition of Done

- [ ] You wrote and read through the plain `pet.xml` example and can
      identify its tags and its one attribute by name.
- [ ] You read the real Manifest shape and identified which line makes
      `MainActivity` launchable from the icon specifically.
- [ ] You completed Exercise 1 and can explain how a resource's `name`
      attribute becomes its generated `R` class constant.
- [ ] You can state, without looking back at this lesson, why a
      correctly-written Activity class still isn't launchable without a
      matching Manifest entry.
