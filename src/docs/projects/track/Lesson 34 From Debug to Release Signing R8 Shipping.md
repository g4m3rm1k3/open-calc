# Lesson 34: From Debug to Release — Signing, R8, and Shipping a Build

**What you will build:** A real, signed, shrunk release build of Pocket
Inventory — the first build in this entire project not installed
directly from Android Studio's Run button, and the last lesson in this
series. The transferable problem: every single run of this app, since
Lesson 1, has used a debug build — automatically signed with a
throwaway key Android Studio generates and manages for you,
un-shrunk, and, critically, `debuggable="true"`, meaning any tool on
the device can attach a debugger and inspect this app's memory, logs,
and behavior in detail. None of that belongs in a build handed to a
real user. This lesson is about the specific, deliberate differences
between "runs on my emulator" and "safe and ready to actually ship."

**What you need to know first:** Lesson 1 (the project's package name
and identity — a signing key ties permanently to this), Lesson 13/28
(Room and Retrofit's reflection-based, annotation-driven code — exactly
what this lesson's shrinking step can break if misconfigured), Lesson
30/31 (this project's test suite — what should be run, and pass, before
any release build is trusted).

---

## Concept Unit: Why a Debug Build Was Never Shippable

### The Problem

Look at `app/build.gradle`'s `android { }` block — Android Studio has
always been quietly building a `debug` variant, distinct from a
`release` variant this project has never actually produced.

### The Concept, in Prose

Every Android project has (at minimum) two **build types**: `debug`
and `release`. `debug` is signed with an auto-generated, insecure debug
key every Android SDK installation shares by convention, has
`android:debuggable="true"` injected automatically (letting debugging
tools attach freely — exactly what you've relied on throughout this
entire curriculum via Logcat and Android Studio's debugger), and skips
code shrinking entirely for faster, more debuggable builds. None of
that is acceptable for something installed on a real user's device: a
debuggable, unshrunk build is both a real security exposure (internal
strings, class names, and logic are all fully inspectable) and simply
larger and slower than it needs to be.

### CS Lens

Maintaining separate debug and release configurations from one shared
codebase is an instance of the general **build variant / environment
profile** pattern — the same idea as a web app's separate development
and production configuration (verbose error pages and hot-reloading in
development; minified assets and generic error pages in production),
or a compiler's debug versus optimized (`-O2`) build modes.

---

## Concept Unit: `signingConfigs` — Proving This Build Is Really Yours

### The Problem

Before anything else, a release build needs a real, private signing
key — one you generate once and keep permanently, since every future
update to this app must be signed with the *same* key to be accepted
as a legitimate update rather than a different app entirely.

### Commands Needed

```
keytool -genkeypair -v -keystore pocket-inventory-release.keystore -alias pocketInventory -keyalg RSA -keysize 2048 -validity 10000
```

`keytool` — Java's built-in key and certificate management tool
(already installed alongside your JDK, the same toolchain `javac` from
Lesson 1 belongs to). `-genkeypair` generates a new key pair.
`-keystore pocket-inventory-release.keystore` names the file the key is
stored in — **treat this file, and the passwords you're about to set,
as genuinely sensitive**: losing it means permanently losing the
ability to publish updates to this exact app identity; anyone who
obtains it can sign and distribute builds impersonating yours.
`-alias pocketInventory` names this specific key within the keystore
file (a keystore can hold several). `-keysize 2048`/`-validity 10000`
are standard, reasonable defaults (roughly 27 years). You'll be
prompted for a keystore password and key password — real passwords,
not placeholders, and **do not commit this file to Git**.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `app/build.gradle`; new (untracked)
  `keystore.properties`; `.gitignore`.
- **Change type:** Configure, create.

### The New Code

Create `keystore.properties` in the project root (**not** inside
`app/`):

```properties
storeFile=../pocket-inventory-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=pocketInventory
keyPassword=YOUR_KEY_PASSWORD
```

Add to `.gitignore`:

```
keystore.properties
*.keystore
```

In `app/build.gradle`, above the `android { }` block:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("keystore.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { }`:

```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

### The Updated Project

`app/build.gradle` gains a small block reading credentials from a file
deliberately kept **out of version control** (`.gitignore`, reappearing
concept from the Git fundamentals this curriculum assumes, applied here
for the first time to a genuinely sensitive file rather than build
output), plus a `signingConfigs`/`buildTypes` pairing wiring that
config specifically to the `release` variant — `debug` continues using
Android Studio's own auto-managed debug key, untouched.

### Mechanical Walkthrough
- `def keystoreProperties = new Properties()` — **first appearance of
  Gradle-script-level Groovy syntax** distinct from the Java this
- project's app code has used throughout — `build.gradle` files are
  themselves Groovy scripts (a JVM language related to but distinct
  from Java), a real, honest thing worth naming even though a full
  Groovy treatment is out of scope this late in the curriculum.
- `rootProject.file("keystore.properties")` — locates the file relative
  to the project root, not `app/`.
- `keystoreProperties.load(new FileInputStream(keystorePropertiesFile))`
  — reads the key-value file into memory — the same
  key-value-file-as-config idea as `SharedPreferences` (Lesson 11),
  here read once, at build time, by the build system itself rather than
  the running app.
- `signingConfigs { release { storeFile ...; storePassword ...; keyAlias ...; keyPassword ... } }`
  — **first appearance.** Declares a named signing configuration,
  pulling every credential from the loaded properties rather than
  hardcoding them directly in a file that *is* committed to Git.
- `buildTypes { release { signingConfig signingConfigs.release } }` —
- **first appearance of the `buildTypes` block** — ties the
  `release` build type to the signing config just declared.

### SE Lens

**Why go through a separate, gitignored `keystore.properties` file
instead of just writing the passwords directly into `build.gradle`?**
`build.gradle` is source code — committed, shared, and, in a real team
project, potentially visible to many collaborators or even public on
GitHub. Signing credentials committed directly into it would be a real,
serious secret leak the moment the repository is shared at all. The
indirection costs one extra file and one small loading block, in
exchange for keeping the actual secret genuinely out of version
control — the exact same "never commit secrets" discipline any real
engineering environment enforces.

---

## Concept Unit: R8 — Shrinking, Optimizing, and Obfuscating

### The Problem

A debug build ships every class this app and its libraries define,
completely unshrunk, with full, readable class and method names —
larger than necessary, and trivially reverse-engineerable.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `app/build.gradle`; `app/proguard-rules.pro`
  (wizard-generated, empty until now).
- **Change type:** Configure, add.

### The New Code

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### The Updated Project

`buildTypes { release { ... } }` gains three more lines alongside the
signing config added in the previous unit.

### Mechanical Walkthrough
- `minifyEnabled true` — **first appearance.** Turns on R8 — Android's
  code shrinker, optimizer, and obfuscator, run automatically as part
  of building the `release` variant. It performs **tree-shaking**
  (removing classes and methods nothing in your app actually calls,
  including large unused portions of libraries — Retrofit, Lesson 28,
  ships far more than this project's one `CatalogApi` interface uses),
  **optimization** (rewriting bytecode into a smaller, faster
  equivalent), and **obfuscation** (renaming classes/methods/fields to
  short, meaningless names like `a.b.c`, making reverse-engineering
  meaningfully harder).
- `shrinkResources true` — **first appearance.** A companion step
  removing unused *resources* (an unreferenced drawable, an unused
- string) — only effective alongside `minifyEnabled true`, since it
  needs R8's code analysis to know what's actually referenced.
- `proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'`
  — **first appearance.** Supplies R8 two rule files: a
  platform-provided default (handling common Android framework needs)
- and this project's own `proguard-rules.pro` — the wizard-generated,
  empty file every Lesson 1 project already contains, finally given
  real content next.

### Commands Needed — Building It

Android Studio menu: **Build → Generate Signed Bundle / APK → Android
App Bundle**, selecting the keystore file and credentials from this
lesson's first unit, build variant `release`. Real output: a real
`.aab` file (Android App Bundle — the format Google Play requires for
new app submissions, distinct from a raw installable `.apk`) appears
under `app/release/`.

### Run It — and Watch It Break

Install this release build on a real device or emulator
(`adb install app/release/app-release.apk` if you also generate an APK
variant for direct sideloading, since an `.aab` isn't directly
installable on its own) and open it. Depending on exactly which
libraries' consumer rules did or didn't fully cover this project's
usage, you may see a real crash — commonly a `ClassNotFoundException`
or a Room/Gson failure, since **R8's default aggressiveness can strip
or rename classes that Room and Gson only ever reference indirectly, by
reflection, at runtime** — `Item.java`'s fields, read by Gson via field-
name matching (Lesson 28) and by Room via annotation processing (Lesson
13), are exactly the kind of "never called directly, only found by
name at runtime" code R8 has no static way to know is actually needed.

### Project Change — Fixing It

- **Reference Source:** No reference counterpart.
- **Files affected:** `app/proguard-rules.pro`.
- **Change type:** Add.

### The New Code

```proguard
-keep class com.yourname.pocketinventory.Item { *; }
-keep class com.yourname.pocketinventory.RemoteNotice { *; }
```

### The Updated Project

`proguard-rules.pro`, previously empty, gains two `-keep` rules.

### Mechanical Walkthrough
- `-keep class com.yourname.pocketinventory.Item { *; }` — **first
  appearance of ProGuard/R8 rule syntax.** Tells R8 explicitly: never
  rename, remove, or otherwise touch this class or any of its members
- (`{ *; }` — everything inside it), overriding its default
  reflection-blind analysis for exactly the classes that need it —
  `Item` (read by both Room and Gson via field names) and `RemoteNotice`
  (read by Gson, Lesson 28) are precisely the two classes in this
  project whose correctness depends on their field *names* surviving
  intact, not just their behavior.

### Run It Again

Rebuild the signed release bundle/APK with the updated rules and
reinstall. Confirm the app now runs correctly end-to-end — add an item,
confirm it saves and reloads (Room), and, with connectivity, confirm
Lesson 28's network fetch still parses correctly (Gson) — proof the
`-keep` rules genuinely fixed the specific reflection-dependent break.

### CS Lens

**This is a hard concept — static analysis versus runtime reflection,
and the blind spot between them — and it recurs constantly:** any tool
that analyzes code by reading it (a shrinker, a linter, a type checker)
can only reason about calls it can actually *see* in the code's
structure; a call made indirectly, by looking up a name as a string at
runtime, is invisible to that analysis by construction. Also recognized
in: JavaScript minifiers breaking code that accesses object properties
via dynamically-constructed string keys, Python's `getattr(obj, name)`
being invisible to static type checkers, and ORMs generally (any
reflection-based mapping between a database schema and class fields)
being a recurring, named source of exactly this shrinker/obfuscator
interaction across the whole software industry, not an Android-specific
quirk.

### SE Lens

**Why does R8 default to aggressive shrinking that can break reflection-
dependent code, instead of defaulting to a safer, more conservative
mode?** A maximally conservative default — keep everything that
*might* be reflectively accessed — would defeat most of the actual size
and security benefit shrinking exists to provide, since nearly any
class *could* theoretically be reached reflectively. R8's real default
behavior trusts library-provided **consumer ProGuard rules** (Room and
Retrofit both ship their own, automatically merged into your build,
covering their own internal reflection needs) to protect *library*
internals correctly out of the box; it's specifically *your own*
application classes used reflectively — `Item`, here — that R8 has no
way to know about without an explicit rule, which is exactly the gap
this unit's fix closed.

---

## Connect the Pieces

Full trace: `keystore.properties`, kept out of Git, feeds real signing
credentials into `app/build.gradle`'s `signingConfigs.release` →
`buildTypes.release` ties that signing config together with
`minifyEnabled true` and `shrinkResources true`, activating R8 → a real
signed, shrunk build genuinely broke on first run, because R8's static
analysis couldn't see Room's and Gson's reflection-based field access
into `Item`/`RemoteNotice` → two `-keep` rules in `proguard-rules.pro`
closed exactly that gap, without disabling shrinking or obfuscation for
anything else in the app — every other class, including this project's
own `InventoryAdapter`, `ItemRepository`, and every Fragment, still
gets fully shrunk and obfuscated, since none of them are ever looked up
by name at runtime the way `Item` and `RemoteNotice` are.

## What Breaks Without This

Already demonstrated directly above, as the lesson's own central
exercise: building with `minifyEnabled true` and no `-keep` rules,
watching the real reflection-related crash, then fixing it. Additionally,
temporarily remove `signingConfig signingConfigs.release` from the
`release` block entirely and try **Generate Signed Bundle**: Android
Studio refuses to produce an unsigned release artifact through that
flow at all, a real, deliberate guard against accidentally producing an
unshippable, unsigned build. Restore the signing config afterward.

## Exercises

1. Before generating a release build, actually run this project's full
   test suite (Lesson 30's unit tests, Lesson 31's instrumented tests)
   and only proceed once every test passes — write, in your own words,
   why "the release build compiled successfully" and "the release build
   is correct" are different claims, and why this project's earlier
   testing lessons matter most, practically, at exactly this final step.
2. Open the generated `.aab`/`.apk` in Android Studio's **APK Analyzer**
   (`Build → Analyze APK...`) and compare its size against a debug
   build's — confirm shrinking and resource removal produced a real,
   measurably smaller artifact, not just a theoretical one.

## Definition of Done

- [ ] A real keystore exists, is referenced only through a gitignored
      properties file, and is backed up somewhere safe outside the
      repository.
- [ ] A signed, shrunk release build installs and runs correctly,
      including Room persistence and Gson-based network parsing.
- [ ] You personally triggered and fixed the reflection-related R8
      crash, rather than only reading about the risk.
- [ ] Every test built across Lessons 30–31 passes before this build
      was produced.
- [ ] Commit: message explaining why (e.g. "Add release signing
      config and R8 shrinking with explicit keep rules for
      reflection-accessed classes, producing the project's first real
      shippable build").

---

This closes the Pocket Inventory track. Thirty-four lessons ago, this
project was a wizard-generated package name and an unexplained
`extends AppCompatActivity`. Every concept since — the Activity
lifecycle, XML layouts and constraints, Intents and navigation,
RecyclerView and Adapters, three different persistence layers,
threading and ANRs, the full ViewModel/LiveData/Repository/Fragment
architecture stack, Navigation Component, dialogs and gestures,
permissions, implicit Intents, background work and notifications,
broadcasts, networking, content providers, automated testing at two
different levels, an alternative UI toolkit, and a real shippable
build — is something you built, ran, broke on purpose, and fixed
yourself, not something you copied. That's the actual curriculum.
