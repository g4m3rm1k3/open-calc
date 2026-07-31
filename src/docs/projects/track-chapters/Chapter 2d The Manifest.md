# Chapter 2, Lesson D: The Manifest — How Android Even Knows You Exist

**What you will build:** Nothing new — you'll read a file Android
Studio already generated for you when the project was created, and
understand exactly what every line of it does. The transferable
problem: in a normal Java program, having a `main()` method is enough —
the JVM knows exactly where to start. Android has no such convention.
If this project eventually has ten different `Activity` subclasses, how
would the OS know which one to show first when the user taps your app
icon? Nothing about the *code itself* answers that question. Something
outside the code has to declare it.

**What you need to know first:** Chapter 1 (a package name is a
compiler-checked promise about folder location). Chapter 2A–2C are not
required for this specific lesson — the Manifest isn't Java at all —
but the capstone right after this one needs all three.

**Terms introduced in this lesson:**
- **XML** — a text format built from nested `<tag>...</tag>` pairs
  carrying `attribute="value"` pairs, describing structured data or
  configuration rather than executable code.
- **Manifest / `<application>`** — the file (and its root
  application-wide element) that declares every component an Android
  app has, read by the OS before any of the app's own code ever runs.
- **`<activity>` declaration** — the manifest entry connecting a
  compiled `Activity` class to the running app; without it, the class
  compiles fine but the OS has no idea it's launchable.
- **Intent filter / `MAIN` / `LAUNCHER`** — the declaration of which
  Activity is a valid entry point (`MAIN`) and which one specifically
  appears on the home screen/app drawer (`LAUNCHER`).
- **Resource reference (`@mipmap/...`, `@string/...`, `@style/...`)** —
  points at a named resource defined elsewhere instead of hardcoding a
  value inline.

---

## Concept Unit: The Manifest — How Android Even Knows You Exist

### The Problem

You have a compiled class, `MainActivity`. In a normal Java program,
having a `main()` method is enough — the JVM knows exactly where to
start. Android has no such convention. If this project eventually has
ten different `Activity` subclasses, how would the OS know which one to
show first when the user taps your app icon? Nothing about the *code
itself* answers that question. Something outside the code has to
declare it.

### Project Change

- **Reference Source:** No reference counterpart — this is your own
  generated project's manifest, already created by the wizard in
  Chapter 1B.
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
  namespace from Chapter 1B (a scheme to avoid attribute-name
  collisions between Android's own attributes and anyone else's), just
  XML's version of it rather than Java's.
- `<application>` — **first appearance.** Describes properties of the
  app as a whole: its icon, its display name, its visual theme.
- `android:allowBackup`, `android:icon`, `android:label`,
  `android:theme` — **first appearance, as a group.** These are
  attributes, each pointing at a resource rather than a hardcoded value
  (`@mipmap/...`, `@string/...`, `@style/...` — the `@` syntax is its
  own concept, covered below).
- `<activity android:name=".MainActivity" ...>` — **first appearance.**
  This is the actual answer to the Problem above: this line is the
  *only* place in your entire project that connects the class
  `MainActivity` to the running app. `.MainActivity` is shorthand for
  `com.yourname.pocketinventory.MainActivity` — the leading dot means
  "append this to the package name already declared at the top of this
  project" (in `build.gradle`, not shown here — not needed yet). Delete
  this `<activity>` block entirely and `MainActivity.java` would still
  compile fine, but the OS would have no idea it exists as something
  launchable.
- `<intent-filter>`, `<action android:name="android.intent.action.MAIN" />`,
  `<category android:name="android.intent.category.LAUNCHER" />` —
  **first appearance, as a group.** This is the actual declaration of
  *which* activity is the one shown when the user taps your app icon on
  the home screen. `MAIN` means "this is a valid entry point,"
  `LAUNCHER` means "and specifically, show it in the app drawer/home
  screen." A project can have many Activities; only one (usually) has
  this exact filter combination.
- `@mipmap/ic_launcher`, `@string/app_name`, `@style/Theme.PocketInventory`
  — **first appearance, as a group.** The `@type/name` syntax is
  Android's *resource reference* system — instead of hardcoding
  `"Pocket Inventory"` as a literal string here, the manifest points at
  a named resource defined elsewhere (`res/values/strings.xml`), so
  translations, theming, and reuse are centralized rather than
  scattered through code.

### CS Lens

The Manifest is an instance of **declarative configuration separated
from imperative code** — you're not writing instructions ("run this
function"), you're describing facts about the system ("this class is
an entry point") for something *else* (the OS) to read and act on.
Also recognized in: a web server's routing config mapping URLs to
handlers, a `package.json`'s `"main"` field, systemd unit files
describing services to the OS, Kubernetes YAML describing desired state
rather than steps.

### SE Lens

**Why does Android require a separate declaration file instead of just
scanning your compiled code for a class that looks like an entry
point** (say, one with a specific method name, the way `main()`
works)? The alternative — convention-based discovery — is exactly what
plain Java does, and it works fine when there's only one kind of "entry
point" to find. Android apps can have *many* entry points (multiple
Activities, plus Services, Broadcast Receivers, and Content Providers,
none of which you've met yet) and the OS needs to know about all of
them, their permissions, and their capabilities *before* it ever loads
your code — for security review, for showing your app's declared
permissions to the user before install, and for letting the OS start
components without loading your whole app into memory just to check.
The cost of this design: a second file format and syntax to maintain in
parallel with your Java, which has to stay manually in sync with your
actual classes — miss updating the Manifest when you add a new
Activity, and it silently doesn't exist as far as the OS is concerned,
even though it compiles perfectly.

---

## Connect the Pieces

One trace through this lesson: `MainActivity`'s package name (Chapter
1B) is what `.MainActivity`'s leading dot expands against; the
`<intent-filter>`'s `MAIN`/`LAUNCHER` combination is what makes it the
one screen shown when the app icon is tapped. The capstone of this
chapter picks up from exactly this point: the OS has now found
`MainActivity` via this file — what does it actually *do* with it?

## What Breaks Without This

Comment out the entire `<activity>...</activity>` block in the
Manifest (wrap it in `<!-- ... -->`, XML's comment syntax) and try to
run the app. Read the actual error or behavior (it'll likely be about
no launcher activity, or the app installing but not appearing anywhere
to tap). Restore the block afterward by removing the comment markers.

## Exercises

1. Change `android:label="@string/app_name"` to a hardcoded string,
   `android:label="Test Name"`, run the app, and confirm the home
   screen label changes. Then restore it to `@string/app_name` and
   explain, in your own words, why pointing at a resource is usually
   preferred over hardcoding the value directly here.

## Definition of Done

- [ ] You can point to the exact line in the Manifest that makes
      `MainActivity` the launcher screen.
- [ ] You triggered the "no launcher activity" failure yourself by
      commenting out the `<activity>` block, and restored it.
- [ ] You can explain what XML is and how it differs from the Java
      you've written so far.
- [ ] Commit: message explaining why (e.g. "No code change — read
      through AndroidManifest.xml and confirmed the MAIN/LAUNCHER
      intent-filter is what makes MainActivity the app's entry point").

Next: Chapter 2, Lesson E (the capstone) — the OS has found
`MainActivity` through this file; now it builds an object from it and
calls a method you never call yourself.
