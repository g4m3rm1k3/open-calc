# Lesson 2b: The Manifest — How Android Even Knows You Exist

> **Revised 2026-07-25** — updated the shown Manifest to match current
> Android Studio output. Headings marked `(revised 07/25)` below (check
> "On This Page" in the sidebar) are exactly what changed — no need to
> reread the rest. Full detail in `CHANGELOG.md` in this folder.

**What you will build:** Nothing new yet — you'll read a file Android
Studio already generated for you in Lesson 1, and understand exactly
what every line of it does. The transferable problem: in every plain
Java program you've written so far (Lesson 1's `HelloWorld`, Lesson
2a's `LightSwitchDemo`), `public static void main` was enough — the
JVM knows exactly where to start because there's only ever one
candidate. Android has no such convention, because an Android project
can contain many classes that *could* plausibly be an entry point.
Something outside your Java code has to explicitly say which one is
real.

**What you need to know first:** Lesson 1 (`MainActivity.java` exists,
its `package` line matches its folder) and Lesson 2a (what a class is —
not strictly required for this specific lesson, since the Manifest
isn't Java at all, but the next lesson immediately after this one needs
it).

---

## Concept Unit: The Manifest — How Android Even Knows You Exist

### The Problem

You have a compiled class, `MainActivity`. In a normal Java program,
having a `main()` method is enough — the JVM knows exactly where to
start. Android has no such convention. If this project eventually has
ten different `Activity` subclasses (a screen is called an "Activity"
in Android — you'll build a second one in Lesson 4), how would the OS
know which one to show first when the user taps your app icon? Nothing
about the *code itself* answers that question. Something outside the
code has to declare it.

### Project Change

- **Reference Source:** No reference counterpart — this is your own
  generated project's manifest, already created by the wizard in
  Lesson 1.
- **Files affected:** `app/src/main/AndroidManifest.xml` (already
  exists — you're reading it, not creating it).
- **Change type:** Inspect (no edit yet).
- **Location:** Android view → `app > manifests > AndroidManifest.xml`.

### The New Code (revised 07/25 — matches current Android Studio output)

Open it. Newer Android Studio versions generate a few more lines than
older ones — none of it is a mistake or a sign anything broke; every
extra line is explained below, the first time it appears in this
curriculum:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PocketInventory">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

(If your file also already shows a second `<activity>` block for
`InventoryActivity`, ignore it for now — that's Lesson 4's subject,
covered in full there, not this lesson's.)

### The Updated Project

This *is* the whole file (a manifest doesn't nest inside anything
larger) — so there's no further "enclosing structure" to show; you're
looking at the complete document as generated.

### Mechanical Walkthrough (revised 07/25 — new attributes explained)

- `<?xml version="1.0" encoding="utf-8"?>` — **first appearance.** The
  **XML declaration** (also called the XML prolog) — required at the
  very top of a fully standards-compliant XML file, before even the
  root element. `version="1.0"` names which XML specification this
  file follows (1.0 is what essentially everything uses); `encoding="utf-8"`
  states which character encoding the file's text is stored in — UTF-8
  is the encoding almost every modern text file uses, capable of
  representing essentially any character in any language. You'll never
  type this line yourself — Android Studio and its templates add it to
  every XML file it generates — but it's worth recognizing as its own
  thing, distinct from the `<manifest>` element that follows it.
- `<manifest ...>` — **first appearance.** The root element of an
  entirely different file format from Java: **XML** (Extensible
  Markup Language — a text format built from nested `<tag>...</tag>`
  pairs, each of which can carry `attribute="value"` pairs, used to
  describe structured data or configuration rather than executable
  code). This file is read by the Android build tools and by the OS
  itself, not compiled into bytecode the way your `.java` files are.
- `xmlns:android="..."` — **first appearance.** An XML namespace
  declaration — conceptually the exact same idea as the Java package
  namespace from Lesson 1 (a scheme to avoid attribute-name collisions
  between Android's own attributes and anyone else's), just XML's
  version of it rather than Java's.
- `xmlns:tools="http://schemas.android.com/tools"` — **first
  appearance.** A second namespace declaration, sitting right next to
  `xmlns:android`, the same way a Java file can have several `import`
  statements. This one isn't used anywhere in this particular file yet
  (nothing here starts with `tools:`) — it's declared up front because
  Android Studio's templates always include it, ready for the moment a
  later file actually needs a `tools:`-prefixed attribute. Those are
  design-time-only hints (visible in Android Studio's preview, stripped
  out of the real, installed app) — not needed yet, flagged here so the
  unused declaration doesn't look like a mistake.
- `<application>` — **first appearance.** Describes properties of the
  app as a whole: its icon, its display name, its visual theme.
- `android:allowBackup`, `android:icon`, `android:label`,
  `android:theme` — **first appearance, as a group.** These are XML
  attributes, each pointing at a resource rather than a hardcoded
  value (`@mipmap/...`, `@string/...`, `@style/...` — the `@` syntax
  is its own concept, covered below).
- `android:dataExtractionRules="@xml/data_extraction_rules"` and
  `android:fullBackupContent="@xml/backup_rules"` — **first appearance,
  as a pair.** Both point at small XML files (in `res/xml/`, a resource
  folder you haven't needed until now) that Android Studio's template
  also generates, controlling exactly which of your app's files are
  allowed to be included in two different Android features: automatic
  cloud backup, and the device-to-device transfer flow when someone
  sets up a new phone. Right now those generated rule files say
  "include everything" — the honest default for a project with nothing
  sensitive in it yet. Not touched again until a much later lesson
  actually needs to exclude something (like locally-cached data that
  shouldn't follow a user to a new device).
- `android:roundIcon="@mipmap/ic_launcher_round"` — **first
  appearance.** A second version of your app icon, pre-cropped to a
  circle, for the subset of home-screen launchers that display round
  icons instead of square ones (which launcher a user has installed
  isn't something your app controls) — `android:icon` above is the
  square version. Both are generated together by the same wizard step
  from Lesson 1; you'll only touch either once this project has a real
  icon of its own, in a much later lesson.
- `android:supportsRtl="true"` — **first appearance.** Opts this app
  into automatic **RTL (right-to-left) layout mirroring** — for
  languages read right-to-left (Arabic, Hebrew), Android can
  automatically flip your entire layout horizontally (a `Start`-aligned
  view becomes right-aligned instead of left-aligned, and so on) if you
  set this flag and use direction-aware properties (`Start`/`End`
  rather than `Left`/`Right` — you'll meet these specifically in Lesson
  3). This project isn't translating into any RTL language yet, but
  leaving this `true` costs nothing today and avoids a real retrofit
  later.
- `<activity android:name=".MainActivity" ...>` — **first appearance.**
  This is the actual answer to the Problem above: this line is the
  *only* place in your entire project that connects the class
  `MainActivity` to the running app. `.MainActivity` is shorthand for
  `com.yourname.pocketinventory.MainActivity` — the leading dot means
  "append this to the package name already declared elsewhere in the
  build configuration" (not shown here — not needed yet). Delete this
  `<activity>` block entirely and `MainActivity.java` would still
  compile fine, but the OS would have no idea it exists as something
  launchable — proven for yourself in this lesson's "What Breaks
  Without This."
- `android:windowSoftInputMode="adjustResize"` — **first appearance.**
  Controls what happens to this Activity's layout when the on-screen
  keyboard opens (tapping into a `TextBox`-equivalent input field,
  covered starting Lesson 9). `adjustResize` means the window itself
  shrinks to make room for the keyboard, so whatever's focused stays
  visible above it, rather than the keyboard simply sliding up and
  covering the bottom portion of the screen (the alternative,
  `adjustPan`, moves the whole screen up instead of resizing it — not
  used in this project). Worth having set correctly now, before any
  real input field exists, since it's easy to forget and only notice
  once a keyboard is actually covering something you need to see.
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
point** (say, one with a specific method name, the way `main()`
works)? The alternative — convention-based discovery — is exactly what
plain Java does, and it works fine when there's only one kind of
"entry point" to find. Android apps can have *many* entry points
(multiple Activities, plus other component types you haven't met yet)
and the OS needs to know about all of them, their permissions, and
their capabilities *before* it ever loads your code — for security
review, for showing your app's declared permissions to the user before
install, and for letting the OS start components without loading your
whole app into memory just to check. The cost of this design: a second
file format and syntax to maintain in parallel with your Java, which
has to stay manually in sync with your actual classes — miss updating
the Manifest when you add a new Activity, and it silently doesn't
exist as far as the OS is concerned, even though it compiles perfectly.

---

## Connect the Pieces

One trace through this lesson: the OS reads the Manifest before it
ever runs a line of your Java, finds the `<activity>` with the
`MAIN`/`LAUNCHER` intent-filter, and now knows `.MainActivity` (which
it resolves to `com.yourname.pocketinventory.MainActivity`, the exact
package-qualified name from Lesson 1) is what to show when the app
icon is tapped. Nothing about this required reading a single line of
`MainActivity.java` itself — the Manifest is a completely separate
source of truth, checked first.

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
- [ ] Commit: message explaining *why* (e.g. "No code change — read
      through AndroidManifest.xml and confirmed the MAIN/LAUNCHER
      intent-filter is what makes MainActivity the app's entry point").

Next lesson: `extends AppCompatActivity` — using the class/object/`new`
vocabulary from Lesson 2a to explain, mechanically, why Android is able
to call methods on your `MainActivity` that you never call yourself.
