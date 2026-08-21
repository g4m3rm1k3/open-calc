# Lesson 1.1: How an Android Project Actually Fits Together

**What you will build.** A brand-new, real, standalone Android
project — `AndroidCalculator/`, separate from Stage 0's
`Calculator.kt` — that actually compiles and packages into a real,
installable `.apk` file, built entirely from five real files: a
project-level Gradle settings file, a project-level Gradle build file,
a module-level Gradle build file, an Android Manifest, and one real
`Activity` class. No calculator UI exists yet — Slice 1's own feature,
"Basic calculator UI," starts in Lesson 1.2. This lesson's transferable
problem is different, and stated directly by the BRD as its own goal:
understand what an Android project actually *is* — the real pieces, and
what each one is genuinely responsible for — rather than memorizing
configuration syntax by copying a template without knowing what any of
it does.

**What you need to know first.** Nothing from `Calculator.kt` directly
— this is a new, separate real project. What carries over is
everything this curriculum already established about Kotlin itself:
`class`, `fun`, `override`, and packages/imports, all given full
treatment across Stage 0.

**Terms used in this lesson**

- **Android project** — the complete, top-level collection of
  everything needed to build one or more real Android applications:
  build configuration, source code, and resources, organized under one
  root directory. It exists as the outermost real unit Android tooling
  understands — the thing you open, the thing a build command targets,
  the thing that contains everything else this lesson introduces.
- **module** — one buildable, independently-configured unit inside an
  Android project — most commonly the actual application itself,
  conventionally named `app`, though a real project can contain more
  than one (a phone app and a companion library, for instance). It
  exists because a real project's build configuration and its actual
  application code are two genuinely separate concerns: the project as
  a whole coordinates *which* modules exist and how they relate; each
  module owns *its own* build settings and *its own* source.
- **Gradle** — the real, general-purpose build automation tool Android
  projects use to turn source files into a running application. It
  exists because turning Kotlin source, XML resources, and a manifest
  into a signed, installable package is a genuinely multi-step process
  — compiling code, merging resources, processing the manifest,
  packaging everything, and more — and Gradle is the real program that
  reads a project's own configuration and carries out every one of
  those steps, in the right order, only redoing the steps whose inputs
  actually changed.
- **Kotlin DSL build script** — a Gradle configuration file written in
  actual Kotlin syntax (a file ending in `.gradle.kts`), rather than
  Gradle's older Groovy-based format. It exists so a project's own
  build configuration can be written, read, and type-checked using the
  identical language this curriculum has already spent nine lessons on
  — real Kotlin syntax, not a second scripting language layered on top
  of it.
- **plugin** — a real, named unit of Gradle functionality, applied to a
  project or module to give it new capabilities it doesn't have by
  default — `com.android.application`, this lesson's own real example,
  is what actually teaches Gradle how to build an Android app at all.
  It exists because Gradle itself, at its core, only knows how to run
  tasks in dependency order — it has no built-in knowledge of Android
  whatsoever; every Android-specific capability this lesson's project
  depends on comes from a plugin, not from Gradle itself.
- **namespace** — the base Kotlin/Java package name a module's own
  generated code is organized under — `com.example.calculator`, in
  this lesson's own project. It exists so every class Android's own
  build tooling generates on a module's behalf (and every one a
  developer writes) has an unambiguous, unique home, the same
  motivation Lesson 0.1 already gave for Kotlin's own package system.
- **applicationId** — the real, globally-unique identifier one specific
  built application is installed and identified under on a real
  device — distinct from `namespace`, even though this lesson's project
  gives them the identical value. It exists because a device (and the
  Play Store) needs one stable identity per installed app, and that
  identity is allowed to differ from a module's own source-code
  package structure — most real projects keep them matching, as this
  lesson's own project does, but the two are answering genuinely
  different questions: "what package do generated classes live under"
  versus "what unique ID does this app install as."
- **SDK version** — one of three real numbers a module's build
  configuration states: `compileSdk` (which version of Android's own
  APIs the code is compiled against), `minSdk` (the oldest real Android
  version the app is willing to run on at all), and `targetSdk` (the
  version the app has been written and tested to behave correctly
  against). They exist because "Android" isn't one fixed API — it's a
  sequence of real, numbered platform versions, each adding or changing
  real behavior, and a build has to state, explicitly, which version(s)
  it's actually built for and willing to run on.
- **AndroidManifest.xml** — a required XML file every Android module
  has exactly one of, declaring what real components (`Activity`,
  given full treatment below, among others this curriculum hasn't
  reached yet) the application contains and what the operating system
  needs to know about it before ever running a single line of the
  app's own code. It exists because the Android operating system —
  not the app itself — decides when to start an `Activity`, and it
  needs a real, declared list of what's available to start, discoverable
  without first running any of the app's own compiled code.
- **XML** — a markup format representing structured data as nested
  tags, each with a name and optional attributes —
  `<activity android:name=".MainActivity">`, in this lesson's own real
  Manifest, is one real XML element with one real attribute. It exists
  as a plain-text, human-readable way to describe structured
  configuration data — here, what components an app declares — parsed
  by real tooling rather than compiled the way Kotlin source is.
- **APK** — Android Package, the real, final, installable file format a
  built Android application is packaged into — a `.apk` file, this
  lesson's own real, concrete build output. It exists as the one real
  artifact everything else in this lesson's project ultimately produces:
  compiled code, processed resources, and the manifest, all merged and
  packaged into one file a real device could install and run.

**Objects and methods used**

- **`Activity`**
  - *What it is:* the real Android framework class representing one
    screen, or one focused thing the user is doing — the fundamental
    building block every visible Android app screen is built from.
  - *Implementation:* `android.app.Activity`, part of the real Android
    SDK (`platforms/android-34/android.jar`, fetched and confirmed
    installed this session) — declares, among many other real members
    this curriculum hasn't reached yet, `protected void onCreate
    (Bundle savedInstanceState)`, confirmed this session by compiling a
    real subclass against the genuine `android.jar` and inspecting the
    real result with `javap`.
  - *Its use:* `MainActivity`, this lesson's own new class, extends it
    — the one real screen this lesson's project declares, even though
    it doesn't yet show anything on it.
  - *Type:* a real Android SDK class, meant to be subclassed.
  - *Responsibility:* represent one screen's entire lifecycle — from
    the operating system first creating it, through it becoming
    visible, through it eventually being destroyed — and provide real,
    overridable methods (`onCreate` among them) the operating system
    calls at each of those real moments.
  - *Depends on:* being declared, by name, inside a real
    `AndroidManifest.xml` (given full treatment above) before the
    operating system will ever construct one.
  - *Connects to:* constructed and called by the Android operating
    system itself — external code this curriculum has never written
    and never will — the moment a user (or, this lesson's own case, a
    real build tool) launches it; this lesson's own `MainActivity`
    overrides `onCreate` to hook into that real lifecycle.
  - *Shape:* a public Android SDK API surface — a real framework class
    this lesson's own code extends by subclassing, a genuinely
    different shape from Lesson 0.7's own interface implementation:
    extending a concrete class with its own real, working default
    behavior, rather than satisfying a contract with no default at all
    — a real, verified distinction this lesson's own Concept Unit 4
    proves directly.

- **`Activity.onCreate`**
  - *What it is:* the real method the Android operating system calls,
    automatically, the moment a specific `Activity` is actually being
    created — never called directly by this lesson's own code.
  - *Implementation:* declared on `Activity` as `protected void
    onCreate(Bundle savedInstanceState)`, confirmed this session via
    real `javap` output against the actual `android.jar`; this lesson's
    own override calls `super.onCreate(savedInstanceState)` first,
    the same `super`-call convention this curriculum will give full,
    dedicated treatment once inheritance between concrete classes (not
    just interface implementation) is this curriculum's own subject.
  - *Its use:* the one real place this lesson's `MainActivity` hooks
    into the Android framework's own lifecycle — chosen, not forced,
    per this lesson's own Concept Unit 4 real proof that overriding it
    at all is optional; currently empty beyond the `super` call, since
    no UI exists yet.
  - *Type:* a `protected` instance method on `Activity`, meant to be
    overridden.
  - *Responsibility:* give a specific `Activity` subclass a real,
    guaranteed moment to set up whatever it needs before that screen
    becomes visible — nothing about *when* this method actually runs
    is under this lesson's own code's control; that's entirely the
    operating system's decision.
  - *Depends on:* one real parameter, `savedInstanceState` — a
    `Bundle?` (nullable, per Lesson 0.5's own real proof that a
    nullable type genuinely might hold nothing) carrying state from a
    previous instance of this same `Activity`, if the operating system
    is recreating one that previously existed — not used by name
    anywhere in this lesson's own code beyond passing it to `super`.
  - *Connects to:* called by the Android operating system itself, not
    by this lesson's own code, at a time and for reasons entirely
    outside this project's control — the identical "called by the
    framework, not by you" shape Lesson 0.7's own SE Lens already
    named for interface-satisfying code.
  - *Shape:* a callback boundary — the real seam between framework code
    this curriculum will never open or edit and this lesson's own,
    genuinely inspectable application code.

- **Gradle build command (`./gradlew`, `assembleDebug`)**
  - *What it is:* the real, project-local wrapper script every real
    Gradle project this curriculum will build includes, plus the real
    task name that actually produces a debug-signed, installable `.apk`.
  - *Implementation:* `./gradlew`, a real shell script (with a
    `gradlew.bat` sibling for Windows) generated once, this session, by
    running `gradle wrapper --gradle-version 8.7` — it exists so anyone
    building this exact project uses the identical, pinned Gradle
    version, without needing Gradle already installed system-wide
    first. `assembleDebug`, a real task name the Android Gradle plugin
    (given full treatment below, as part of this lesson's own
    `com.android.application` entry) generates automatically from this
    lesson's own `app/build.gradle.kts` — confirmed this session by
    running `./gradlew :app:tasks` for real and finding it listed,
    alongside dozens of other real, automatically-generated tasks.
  - *Its use:* `./gradlew :app:assembleDebug`, run for real this
    session, is the exact command that produced this lesson's own real,
    verified `.apk` file.
  - *Type:* a shell script (`./gradlew`) invoking a real Gradle task
    (`assembleDebug`) by name.
  - *Responsibility:* `./gradlew` locates (downloading, if not already
    present) the exact Gradle version this project's own wrapper
    properties specify, then hands off to it; `assembleDebug` compiles
    every source file, merges every resource and the manifest, and
    packages the real result into a `.apk` — the concrete, real shape
    of "build," given full treatment as a Term above.
  - *Depends on:* every file this lesson's own Concept Units build up —
    without a real, valid `AndroidManifest.xml`, this exact command
    fails with a real, specific error, proven directly in this lesson's
    own Concept Unit 3.
  - *Connects to:* invoked from a terminal, inside this lesson's own
    `AndroidCalculator/` project directory; its real output is a `.apk`
    file this lesson's own Concept Unit 5 inspects with `aapt2`.
  - *Shape:* the outermost command boundary of this entire project —
    the one real command that turns every file this lesson writes into
    one real, tangible build artifact.

---

## Concept Unit: The Android Project and Its One Module

### The Problem

`Calculator.kt`, since Lesson 0.1, has been one file, compiled with one
direct `kotlinc` command. A real Android application can never be built
that way — it needs real device-specific code the JVM alone doesn't
have (proven directly in this lesson's own Header: `Activity` lives in
`android.jar`, a real SDK file this curriculum only gained access to
this session, not part of any ordinary JVM). Given that a real build
needs to know both *what kind of thing* is being built (an app? a
library?) and *how* to actually build it, what do you think the
smallest possible set of real files might be — before any actual
calculator code exists at all — just to tell a build tool "here is one
Android application project, containing one real, buildable piece"?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Android project"/"Module" concepts for this lesson.
- **Files affected** — created: `AndroidCalculator/settings.gradle.kts`,
  `AndroidCalculator/build.gradle.kts`, and an empty
  `AndroidCalculator/app/` directory — a brand-new, separate real
  project, not a modification to `Calculator.kt`.
- **Change type** — add (three brand-new files/directories).
- **Location** — n/a; this is the project's first content.
- **Dependencies** — the real Android SDK and Gradle, confirmed
  installed and working this session (`ANDROID_HOME=
  /opt/homebrew/share/android-commandlinetools`; Gradle 9.7.1).

### The New Code

```kotlin
// settings.gradle.kts
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "Calculator"
include(":app")
```

and, alongside it:

```kotlin
// build.gradle.kts
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
}
```

### The Updated Project

This is a brand-new project — step 5's two files above are its entire
content so far, alongside one empty directory
(`AndroidCalculator/app/`) with nothing inside it yet. There is no
larger enclosing structure to return to.

### Introduce the Concept in Isolation

The New Code above is already this unit's own real, isolated
demonstration — the smallest real Gradle project structure that means
anything at all. Run for real this session, from inside
`AndroidCalculator/`, with `app/` present but completely empty:

```
$ ./gradlew projects --console=plain
```

Real output (saved in full to
`verification/1.1/step1_gradle_projects.txt`):

```
> Task :projects

------------------------------------------------------------
Root project 'Calculator'
------------------------------------------------------------

Root project 'Calculator'
\--- Project ':app'

To see a list of the tasks of a project, run gradlew <project-path>:tasks
For example, try running gradlew :app:tasks

BUILD SUCCESSFUL in 313ms
1 actionable task: 1 executed
```

Gradle really did read `settings.gradle.kts`, found
`rootProject.name = "Calculator"` and `include(":app")`, and printed
back the exact real project hierarchy those two lines describe —
proving `settings.gradle.kts` is what actually tells Gradle an
**Android project** exists and what **module**(s) it contains, before
a single line of real application code, or even a real build
configuration for `:app` itself, exists. `app/`, at this point, is
nothing more than an empty directory — Gradle accepted it as a real
module location purely because `settings.gradle.kts` named it, proven
directly by an earlier real attempt this session that *removed* the
directory entirely and got a real, specific error instead
(`Configuring project ':app' without an existing directory is not
allowed`) — an empty, existing directory is the genuine minimum; a
missing one is not.

### Discard the Throwaway Example

There is no separate throwaway file for this unit — the real project
files shown above *are* `AndroidCalculator`'s own first real content,
kept permanently, not discarded; this differs from every Stage 0
lesson, where an isolated lab was always separate scratch code. The
reason: unlike a language construct (a `for` loop, a lambda), there is
no smaller, more isolated way to demonstrate "this is what a real
Android project's own root configuration looks like" than the real
project configuration itself.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`pluginManagement { repositories { ... } }`** — a configuration
  block stating where Gradle itself should look for *plugins* (given
  full treatment in this lesson's Header) when this project asks for
  one; `google()` and `mavenCentral()`, given full treatment as
  **repository** locations — real, publicly-hosted collections of
  downloadable packages — state that Android-specific plugins live in
  Google's own repository, and general-purpose ones in Maven Central,
  the JVM ecosystem's own standard public repository.
  `gradlePluginPortal()` names a third real repository, Gradle's own,
  for plugins that aren't Android- or JVM-ecosystem-specific.
- **`dependencyResolutionManagement { repositories { ... } }`** — the
  identical two real repositories, `google()` and `mavenCentral()`,
  stated a second time — this time for where actual *code
  dependencies* (libraries the project's own code will use, not yet
  needed by this lesson but declared here so every module in this
  project inherits the same real locations without repeating them).
- **`rootProject.name = "Calculator"`** — an assignment, the same `=`
  operator given full treatment in Lesson 0.1, setting this real
  project's own name, confirmed in the real `gradlew projects` output
  above (`Root project 'Calculator'`).
- **`include(":app")`** — a function call, the same call syntax given
  full treatment in Lesson 0.2, declaring that a **module**, given full
  treatment in this lesson's Header, named `app`, is part of this
  project — the `:` prefix is Gradle's own real path syntax, naming
  `app` relative to the project's own root, confirmed in the real
  output above (`\--- Project ':app'`).
- **`plugins { id("com.android.application") version "8.5.2" apply false }`**
  — a `plugins` block, applied at the *project* level rather than any
  one module's; `id("com.android.application")`, given full treatment
  in this lesson's Header, names the real plugin that teaches Gradle
  how to build Android applications at all; `version "8.5.2"` states
  exactly which real, published version; `apply false` means this
  project-level declaration only makes the plugin *available*, at a
  pinned version, without actually turning it on for the root project
  itself — a real Gradle convention this lesson's own `app/build.gradle.kts`,
  in the next unit, relies on by applying the same plugin for real,
  without repeating its version number.
- **`id("org.jetbrains.kotlin.android") version "1.9.24" apply false`**
  — the identical shape, naming a second real plugin: the one that
  teaches Gradle how to compile Kotlin source specifically for Android,
  as opposed to the plain JVM compilation `kotlinc` alone, given full
  treatment since Lesson 0.1, already performs.

### CS Lens

Separating "what pieces exist and how they relate" (this unit's own
`settings.gradle.kts`) from "how is each individual piece actually
built" (later units' own module-level configuration) is a build-system
design recurring well beyond Gradle. Also recognized in: a `.sln`
Visual Studio solution file, listing which real `.csproj` projects
belong together, separate from each project's own build settings; a
monorepo's own top-level workspace configuration, distinct from each
individual package's own `package.json`; a shipping manifest listing
which real containers are on a vessel, separate from what's packed
inside each one; an orchestra's own seating chart, naming which
sections exist, separate from each section's own sheet music.

### SE Lens

Gradle could have required every single setting — plugins, real
repository locations, the module list — to live in one flat file. It
doesn't: `settings.gradle.kts` genuinely only answers "what modules
exist," and, per this unit's own real `plugins { ... apply false }`
block, plugin *versions* are pinned once, at the project level, without
being turned on anywhere yet. The real payoff, which this lesson's own
project is currently too small to feel but a larger real app genuinely
would: a project with several real modules (this lesson's BRD-planned
future, once Stage 4's own navigation work begins) can pin one
consistent plugin version for all of them in exactly one place, rather
than each module separately declaring — and risking disagreeing about —
its own version number.

### Commands Needed

- **`gradle wrapper --gradle-version 8.7`** — run once, this session,
  to generate `./gradlew` (given full treatment in this lesson's
  Header) — a real, project-local Gradle launcher pinned to version
  8.7, so building this exact project never depends on whatever Gradle
  version happens to already be installed on a given machine.
- **`./gradlew projects`** — the real command this unit's own Run It,
  below, uses: lists every real module `settings.gradle.kts` declares,
  without building anything.

### Run It

Real output, `AndroidCalculator/` at its current state (verified this
session, saved to `verification/1.1/step1_gradle_projects.txt`):

```
$ ./gradlew projects --console=plain
```

Real output:

```
Root project 'Calculator'
\--- Project ':app'
```

### Connect

A real Android project, and its one real module, both now exist and
are recognized by Gradle — proven directly, not assumed. The next unit
gives that module its own real configuration.

---

## Concept Unit: Gradle, Conceptually

### The Problem

`app/`, right now, is a real, recognized module — and an entirely empty
one; nothing about it says what *kind* of module it is, what Android
version it targets, or what its own real name should be once installed
on a device. Given that the previous unit's `plugins { ... apply false
}` block only made the Android application plugin *available*, not
active, what do you think it would take for `app` specifically to
actually *use* that plugin — and, once it does, what real information
do you think Gradle would need from `app` before it could do anything
useful with it at all? If a module's own real configuration turned out
to be wrong or incomplete, at what point do you think Gradle would
actually notice — immediately, when the file is read, or only much
later, when an actual build is attempted?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Gradle conceptually" concept for this lesson.
- **Files affected** — created: `AndroidCalculator/app/build.gradle.kts`.
- **Change type** — add (a brand-new file, inside the previously-empty
  `app/` directory).
- **Location** — n/a; this is `app/`'s first content.
- **Dependencies** — Concept Unit 1's own `settings.gradle.kts` and
  root `build.gradle.kts`.

### The New Code

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.calculator"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.calculator"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}
```

### The Updated Project

This is `app/build.gradle.kts`'s first content — a brand-new file
inside the module Concept Unit 1 already created — step 5's code above
is the file in full.

### Introduce the Concept in Isolation

The New Code above is this unit's own real demonstration. Run for real
this session, with this exact file now present and no `Activity` or
`AndroidManifest.xml` anywhere in the project yet:

```
$ ./gradlew :app:tasks --console=plain
```

Real output (saved in full to
`verification/1.1/step2_gradle_app_tasks.txt`; excerpted here):

```
Build tasks
-----------
assemble - Assemble main outputs for all the variants.
assembleAndroidTest - Assembles all the Test applications.
assembleUnitTest - Assembles all the unit test applications.
build - Assembles and tests this project.
...
compileDebugSources
...

Install tasks
-------------
installDebug - Installs the Debug build.
...

BUILD SUCCESSFUL in ...
```

Roughly twenty lines of real configuration — no calculator logic, no
UI, nothing this lesson has written any actual behavior for yet —
produced dozens of real, genuinely runnable tasks: `assemble`,
`installDebug`, `lint`, `test`, and many more, none of them typed out
by hand anywhere in this project. This is what **Gradle** actually is,
concretely, beyond the Header's own definition: a real program that
reads a project's declared configuration and *generates* the real,
ordered set of work needed to satisfy it — every one of those task
names came from the two real plugins this unit's own `plugins { }`
block turned on, applied to the real settings this unit's own
`android { }` block declared, not from anything hand-written task by
task.

### Discard the Throwaway Example

As in Concept Unit 1, there is no separate throwaway file here — the
real `app/build.gradle.kts` shown above is kept permanently as this
project's own real module configuration, not scratch code.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`plugins { id("com.android.application") id("org.jetbrains.kotlin.android") }`**
  — the same two real plugins named in Concept Unit 1's own root
  `build.gradle.kts`, given full treatment there, now actually applied
  — no `apply false` this time, and no version number repeated, since
  Concept Unit 1's own project-level declaration already pinned one.
- **`android { ... }`** — a configuration block the Android application
  plugin itself adds — this exact block only exists, and only means
  anything, because `com.android.application`, applied immediately
  above it, taught Gradle what an `android { }` block even is.
- **`namespace = "com.example.calculator"`** — an assignment, the same
  `=` given full treatment in Lesson 0.1, setting the **namespace**
  given full treatment in this lesson's Header — every class this
  module's own build tooling generates lives under this base package.
- **`compileSdk = 34`** — an assignment setting the **SDK version**
  given full treatment in this lesson's Header that determines which
  real Android API surface this module's code is compiled against —
  `34`, matching the real platform this session's `platforms;android-34`
  SDK component actually installed and confirmed working.
- **`defaultConfig { applicationId = "com.example.calculator" minSdk = 24 targetSdk = 34 versionCode = 1 versionName = "1.0" }`**
  — a nested block; `applicationId`, given full treatment in this
  lesson's Header, distinct from `namespace` even though this project
  gives both the identical value; `minSdk` and `targetSdk`, the other
  two real **SDK version** numbers this lesson's Header names;
  `versionCode` (an `Int`, given full treatment in Lesson 0.1, used
  internally to compare app versions) and `versionName` (a `String`,
  the human-readable version users would actually see) — neither used
  by this lesson's own build commands yet, but required, real fields
  every module declares.
- **`compileOptions { sourceCompatibility = JavaVersion.VERSION_17 targetCompatibility = JavaVersion.VERSION_17 }`**
  and **`kotlinOptions { jvmTarget = "17" }`** — real configuration
  this session's own first build attempt proved is genuinely required,
  not optional boilerplate: an earlier real run, without these two
  blocks, failed with a real error — "Inconsistent JVM-target
  compatibility detected for tasks 'compileDebugJavaWithJavac' (1.8)
  and 'compileDebugKotlin' (21)" — because this machine's own default
  JDK (confirmed, since Lesson 0.1, as version 21) disagreed with
  Android's own older default (`1.8`) about which compiled bytecode
  version to target; setting both explicitly to `17` — a real,
  supported middle version — is what actually fixed it.

### CS Lens

A build tool deriving a real, concrete set of executable work from a
comparatively small amount of declared configuration — rather than
requiring every individual step to be hand-written — is a widely
recurring idea in tooling design generally. Also recognized in: a
`Makefile`'s own implicit rules, generating real compilation commands
from file-extension patterns rather than one explicit line per file; a
database query planner, generating a real, concrete execution strategy
from a declarative `SELECT` statement instead of a hand-written
row-by-row procedure; a 3D printer slicer, generating thousands of real
individual print-head instructions from one declared model file; a
tax-preparation program, generating a real, specific set of required
forms from a comparatively short declared list of a person's own
circumstances.

### SE Lens

The alternative to a plugin-driven, declarative `android { }` block
would be a project that hand-writes every real build step directly —
explicit compiler invocations, explicit resource-merging commands,
explicit packaging steps — the way this curriculum's own Stage 0
project used a single, direct `kotlinc` call throughout. That
alternative genuinely doesn't scale to a real Android app: the real,
generated task list this unit's own run just proved (dozens of tasks,
from twenty lines of configuration) hints at how much real,
non-trivial work — resource merging, manifest processing, dexing,
packaging — a real Android build actually performs, none of which this
curriculum will ever need to hand-write, because the Android
application plugin already has. The real cost this lesson's project is
already carrying, honestly: understanding *why* a specific task exists,
or why a build failed partway through one, requires knowing that these
tasks are generated, not written — a real debugging skill this
curriculum will keep building as later lessons hit real build
failures of their own.

### Commands Needed

- **`./gradlew :app:tasks`** — lists every real task available inside
  specifically the `:app` module, generated from its own applied
  plugins and configuration; the `:app:` prefix targets one specific
  module by its real Gradle path, given full treatment in Concept
  Unit 1, rather than the whole project.

### Run It

Real output, `AndroidCalculator/` at its current state (verified this
session, saved in full to
`verification/1.1/step2_gradle_app_tasks.txt`):

```
$ ./gradlew :app:tasks --console=plain
```

Real output (excerpted; full real list saved to the verification
folder):

```
Build tasks
-----------
assemble - Assemble main outputs for all the variants.
...
installDebug - Installs the Debug build.
...
BUILD SUCCESSFUL in ...
```

### Connect

`app` is now a real, fully-configured Android module — proven by the
real, generated task list Gradle produced from its own configuration.
The next unit asks what happens when one of those real tasks is
actually run.

---

## Concept Unit: The Manifest

### The Problem

`app` now has real build configuration, but nothing in it says
*what the application actually contains* — no screens, no components,
nothing the operating system could ever find or start. Given that this
lesson's Header already named `AndroidManifest.xml` as a required file
declaring exactly that, what do you think would actually happen if a
real build were attempted right now, with a fully-configured module
but no Manifest at all? Would Gradle simply skip whatever needs it, or
would it genuinely refuse to proceed?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Manifest" concept for this lesson.
- **Files affected** — created: `AndroidCalculator/app/src/main/AndroidManifest.xml`.
- **Change type** — add.
- **Location** — a new file, inside a new `app/src/main/` directory —
  the real, standard location every Android module's own manifest
  lives at.
- **Dependencies** — Concept Unit 2's own `app/build.gradle.kts`.

### The New Code

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="Calculator">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### The Updated Project

This is `AndroidManifest.xml`'s first content — a brand-new file — step
5's code above is the file in full.

### Introduce the Concept in Isolation

Before writing the Manifest, this session first attempted the real
build *without* it, to confirm this unit's own Problem's prediction
rather than assume it:

```
$ ./gradlew :app:assembleDebug --console=plain
```

Real output (saved in full to
`verification/1.1/break3_no_manifest.txt`):

```
> Task :app:processDebugMainManifest FAILED

FAILURE: Build failed with an exception.

* What went wrong:
A problem was found with the configuration of task ':app:processDebugMainManifest' (type 'ProcessApplicationManifest').
  - In plugin 'com.android.internal.version-check' type 'com.android.build.gradle.tasks.ProcessApplicationManifest' property 'mainManifest' specifies file '.../app/src/main/AndroidManifest.xml' which doesn't exist.

BUILD FAILED in 357ms
```

A real, specific failure — not a generic error, but one naming the
*exact* expected file path — proving `AndroidManifest.xml` is a real,
required input a real Gradle task checks for directly, not a
convention that merely happens to be followed.

With the real Manifest shown above now in place, this session reran
the identical command:

```
$ ./gradlew :app:assembleDebug --console=plain
```

Real output (saved in full to
`verification/1.1/step4_manifest_no_activity.txt`):

```
> Task :app:compileDebugKotlin NO-SOURCE
...
> Task :app:packageDebug
> Task :app:assembleDebug

BUILD SUCCESSFUL in 492ms
```

The build succeeded — genuinely surprising, given that
`android:name=".MainActivity"` names a real Kotlin class,
`com.example.calculator.MainActivity`, that, at this exact point,
**does not exist anywhere in this project.** `compileDebugKotlin
NO-SOURCE` states plainly why: there is no Kotlin source at all yet, so
compilation is skipped entirely, and packaging proceeds anyway. This
proves something concrete about what the Manifest actually *is*: real,
structured **XML**, given full treatment in this lesson's Header,
checked by Gradle for its own real, well-formed content — but *not*
cross-checked, at this stage of the build, against whether the classes
it names by string actually exist as real, compiled code. Declaring a
component and providing its real implementation are two genuinely
separate, independently-checked things.

### Discard the Throwaway Example

There is no separate throwaway file here — `AndroidManifest.xml` is
kept permanently as this project's own real, required manifest, not
scratch code; the *absence* of a manifest, in the first real run
above, was the throwaway condition, deliberately reverted immediately
afterward.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`<?xml version="1.0" encoding="utf-8"?>`** — an XML declaration,
  required at the very top of any well-formed XML document, given full
  treatment in this lesson's Header, stating the XML format version and
  text encoding this file uses.
- **`<manifest xmlns:android="http://schemas.android.com/apk/res/android">`**
  — the root XML element; `xmlns:android`, an XML namespace
  declaration, stating that any attribute prefixed `android:` inside
  this document (every one this lesson's own Manifest uses) refers to
  Android's own real, defined attribute vocabulary at that exact URL —
  not a convention this file invents, but a real, published contract
  Android's own tooling parses against.
- **`<application android:label="Calculator">`** — a real, required
  child element representing the application itself;
  `android:label`, an attribute stating the human-readable name — the
  same real value `aapt2`'s own output, in Concept Unit 5, confirms
  directly (`application: label='Calculator'`).
- **`<activity android:name=".MainActivity" android:exported="true">`**
  — declares one real `Activity`, given full treatment in this
  lesson's Header; `android:name=".MainActivity"`, a leading-dot
  shorthand meaning "append this name to the module's own `namespace`"
  — resolving, per Concept Unit 2's own real `namespace =
  "com.example.calculator"`, to the real class
  `com.example.calculator.MainActivity`, confirmed directly by Concept
  Unit 5's own real `aapt2` output
  (`launchable-activity: name='com.example.calculator.MainActivity'`);
  `android:exported="true"`, a required, explicit attribute (Android
  no longer allows this to be left unstated) declaring that other
  applications on the same device are allowed to launch this specific
  `Activity`.
- **`<intent-filter> <action android:name="android.intent.action.MAIN" /> <category android:name="android.intent.category.LAUNCHER" /> </intent-filter>`**
  — a nested declaration stating *how* this `Activity` can be reached:
  `action android:name="android.intent.action.MAIN"` marks it as a
  genuine entry point, not a screen only reachable from elsewhere
  inside the app; `category android:name="android.intent.category.LAUNCHER"`
  is what makes it appear as a real, tappable icon on a device's own
  home screen — together, the real, standard declaration marking
  exactly one `Activity` as "this is where the app actually starts,"
  the Android-level equivalent of the JVM's own real `main` method,
  given full treatment in Lesson 0.1.

### CS Lens

Declaring what components exist, and how the surrounding system may
reach them, in a format the operating system can inspect *before*
running any of an application's own code, is a pattern recurring
beyond Android's own Manifest. Also recognized in: a web server's own
routing configuration, listing which URLs map to which real handlers,
inspectable without executing the application; a plugin system's own
manifest file (a browser extension's `manifest.json`, a VS Code
extension's own `package.json`), declaring capabilities before any of
the plugin's real code runs; a building's own posted directory listing,
naming which real offices exist on which floor, readable without
entering any of them; a shipping container's own manifest, declaring
contents inspectable at a port without opening the container itself.

### SE Lens

Android could have required every component to register itself at
runtime, in code, the way some other frameworks do. It doesn't: a
declared, static `AndroidManifest.xml`, checked and merged at build
time — proven directly by this unit's own real `processDebugMainManifest`
failure — lets the operating system know what an app is capable of
*before* ever loading or running a single line of that app's own
compiled code, which matters concretely for security (the system can
enforce permissions before code runs) and for tooling (an app store
can inspect real capabilities without executing anything). The real
cost, proven directly by this unit's own second real run: because the
Manifest and the actual compiled class are checked independently, a
typo in `android:name` — naming a class that doesn't exist, or never
will — is not caught at this stage of the build at all; it would only
surface later, as a real runtime crash on an actual device, the moment
the operating system actually tries to start an `Activity` whose real
class it can't find. This lesson's own project accepts that gap for
now, precisely because there's no device or emulator available in this
environment to demonstrate the resulting crash directly — a real,
acknowledged limitation, not a claim that the gap doesn't matter.

### Commands Needed

No new commands — the same `./gradlew :app:assembleDebug` used in this
unit's own two real runs.

### Run It

Real output, `AndroidCalculator/` at its current state (verified this
session, saved in full to
`verification/1.1/step4_manifest_no_activity.txt`):

```
$ ./gradlew :app:assembleDebug --console=plain
```

Real output:

```
BUILD SUCCESSFUL in 492ms
```

A real `.apk` file exists at this point — proven directly, this
session, by finding it on disk — even though the `Activity` it names
doesn't exist as real code yet.

### Connect

The Manifest now exists, proven to be a real, required, independently-
checked file. The next unit finally gives `.MainActivity` a real class
to actually name.

---

## Concept Unit: The Activity, For Real

### The Problem

The build succeeds, and a real `.apk` file exists — but Concept Unit
3's own real finding was specific: `compileDebugKotlin NO-SOURCE`,
meaning no Kotlin was compiled at all, because none exists yet. Given
that this lesson's own Header already gave `Activity` and its real
`onCreate` method full treatment, and given that the Manifest names
`.MainActivity` — resolving, per Concept Unit 3's own walkthrough, to
`com.example.calculator.MainActivity` — what do you think the smallest
possible real class satisfying that name would actually need to
contain? Given Lesson 0.7's own real proof that a class implementing an
interface must provide every method that interface declares, would you
expect extending a real class like `Activity` to carry a similar
requirement for `onCreate` specifically, or is overriding it optional?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Activity" concept for this lesson.
- **Files affected** — created:
  `AndroidCalculator/app/src/main/java/com/example/calculator/MainActivity.kt`.
- **Change type** — add.
- **Location** — a new file, inside a new directory path matching this
  lesson's own real `namespace`, `com.example.calculator`, given full
  treatment in Concept Unit 2 — the real, standard Android convention
  of a source file's directory path mirroring its own package
  declaration.
- **Dependencies** — Concept Unit 3's own `AndroidManifest.xml`, which
  already names this exact class.

### The New Code

```kotlin
package com.example.calculator

import android.app.Activity
import android.os.Bundle

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }
}
```

### The Updated Project

This is `MainActivity.kt`'s first content — a brand-new file — step 5's
code above is the file in full.

### Introduce the Concept in Isolation

The New Code above is this unit's own real demonstration — this exact
class, compiled for real this session against the genuine
`android.jar`, before it was ever placed inside the real project:

```
$ kotlinc -classpath "$ANDROID_HOME/platforms/android-34/android.jar" TestActivity.kt -d out
$ javap -p -classpath out com.example.test.TestActivity
```

Real output:

```
public final class com.example.test.TestActivity extends android.app.Activity {
  public com.example.test.TestActivity();
  protected void onCreate(android.os.Bundle);
}
```

A real class, genuinely extending the real `android.app.Activity` this
lesson's Header quotes, with a real, generated no-argument constructor
and the exact `onCreate` override this lesson's own code declares —
proof that this shape compiles correctly against the genuine Android
SDK before ever depending on this specific project's own build
configuration at all.

### Discard the Throwaway Example

The isolated `TestActivity.kt` compiled above (under a different
package, `com.example.test`, kept separate for this proof specifically)
is scratch, not part of `AndroidCalculator`; the real
`MainActivity.kt` shown in the New Code above, matching this project's
own actual `namespace` and the Manifest's own real
`android:name=".MainActivity"`, is what actually lands in the project,
kept permanently.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`package com.example.calculator`** — a package declaration, the
  same syntax given full treatment in Lesson 0.1, matching this
  project's own real `namespace`, given full treatment in Concept Unit
  2 — required to match, since a mismatch would mean the Manifest's own
  `.MainActivity` shorthand, given full treatment in Concept Unit 3,
  resolves to a class that genuinely doesn't exist at that resolved
  name.
- **`import android.app.Activity`** and **`import android.os.Bundle`**
  — import declarations, the same syntax given full treatment since
  Lesson 0.1, bringing the real `Activity` class (given full treatment
  in this lesson's Header) and the real `Bundle` class (this lesson's
  first real use of it, part of the genuine Android SDK, representing a
  bundle of saved key-value state) into scope by their real, full
  names.
- **`class MainActivity : Activity()`** — `class`, given full treatment
  in Lesson 0.6; `MainActivity`, an identifier matching the Manifest's
  own resolved expectation exactly; `: Activity()`, the same colon
  syntax Lesson 0.7 gave full treatment for interface implementation,
  here used for its other real purpose — extending a real, concrete
  class, inheriting everything `Activity` itself provides, including
  the real `onCreate` this lesson's Header quotes.
- **`override fun onCreate(savedInstanceState: Bundle?)`** — `override`,
  given full treatment in Lesson 0.7, marking this method as
  deliberately providing new behavior for a method `Activity` already
  declares — but, confirmed by a real compile this session of a second
  class extending `Activity` with no override at all (real exit code
  `0`, no errors), this override is **not** required the way Lesson
  0.7's own real compiler error proved an interface's declared method
  is: `Activity.onCreate` already has a real, working body of its own
  (it isn't `abstract`), so a subclass that never touches it at all is
  still a completely valid `Activity`, just one that never adds
  anything beyond what `Activity` already does by default. This
  lesson's own `MainActivity` overrides it anyway, by choice, because
  it will need a real hook into this exact moment starting with Lesson
  1.4's own state work — not because the compiler leaves no other
  option. `fun`, `onCreate`, and the parameter
  `savedInstanceState: Bundle?` match `Activity`'s own real declared
  signature exactly, `Bundle?` nullable per Lesson 0.5's own
  established treatment of `?`.
- **`super.onCreate(savedInstanceState)`** — `super`, a keyword calling
  the overridden method's own real, original implementation on
  `Activity` itself, before this subclass's own code runs anything
  further. A second real compile this session — an override with an
  empty body, never calling `super.onCreate` at all — also succeeded
  with exit code `0`, proving Kotlin's own compiler doesn't require
  this call either; the requirement is real, but it's the Android
  framework's own runtime contract, not something `kotlinc` checks —
  `Activity.onCreate`'s real body performs essential setup work a
  subclass that skips calling it would never get, a real, common,
  documented category of Android bug this lesson's own code avoids
  from its very first line specifically because it's easy to forget
  exactly *because* nothing catches it at compile time.

### CS Lens

Choosing to override a framework-declared method that already has a
real, working default — and, once choosing to, calling back into that
same framework's own original implementation first — is a pattern
recurring anywhere a framework needs its own setup work to keep
happening regardless of what a subclass optionally adds on top. Also
recognized in: a Java Swing component's own
`paintComponent`, conventionally required to call
`super.paintComponent` first; a biological cell's own inherited
metabolic machinery, still running underneath whatever specialized
function a differentiated cell type adds on top; a franchise business's
required adherence to corporate brand standards, layered underneath
whatever a specific local franchise owner adds; a musical cover
version, required to preserve a song's own real chord structure
underneath whatever new arrangement is layered on top of it.

### SE Lens

`onCreate`'s own real parameter, `savedInstanceState: Bundle?`, is
genuinely unused by name anywhere in this lesson's own code beyond
passing it straight to `super`. That's not an oversight this lesson is
glossing over — it's an honest, correct reflection of what this
specific `Activity`, at this exact point in the curriculum, actually
needs: nothing yet, because there's no state to save or restore until
Lesson 1.4 introduces real, mutable UI state. Writing code to use it
now, before there's anything real to use it *for*, would be exactly
the kind of premature complexity this curriculum's own standing
practice avoids — the parameter stays, unused, because `onCreate`'s
real signature requires it to be there, not because this lesson invents
a use for it it doesn't yet have.

### Commands Needed

No new commands — the same `kotlinc -classpath ...` given full
treatment in this lesson's Concept Unit 4 lab, and the same
`./gradlew :app:assembleDebug` from every earlier unit.

### Run It

Real output, `AndroidCalculator/`'s complete state for this lesson
(verified this session, saved in full to
`verification/1.1/step5_full_build.txt`):

```
$ ./gradlew :app:assembleDebug --console=plain
```

Real output:

```
BUILD SUCCESSFUL in 629ms
35 actionable tasks: 7 executed, 28 up-to-date
```

### Connect

Every piece the Manifest names now has a real, compiled class behind
it. The last unit in this lesson inspects the real, finished build
artifact directly, and honestly names what "run" would mean from here.

---

## Concept Unit: The Build/Run Cycle

### The Problem

`assembleDebug` has now genuinely succeeded, start to finish, with
every real piece in place — but "succeeded" so far has only meant "a
process exited with code 0." Given that this lesson's own Header
already named the real, concrete output of a build — a `.apk` file,
given full treatment there — what do you think would actually prove
that file is a real, genuine Android application, rather than just an
empty file a build process happened to create? And, given this
curriculum's own honestly-documented environment (no real emulator or
device is available here, per this project's own handoff), what do you
think "run" would concretely mean if one were?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Build/run cycle" concept for this lesson.
- **Files affected** — none; this unit inspects the real `.apk` Concept
  Unit 4 already produced, and explains the run step honestly rather
  than adding new project code.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — Concept Units 1–4's own complete, real, building
  project.

### The New Code

n/a for this unit — see the real inspection command below; per this
unit's own Project Change, no new project code is added.

### The Updated Project

n/a — `AndroidCalculator/` is unchanged by this unit; its state remains
exactly what Concept Unit 4 already verified.

### Introduce the Concept in Isolation

Not an isolated lab in the usual sense — this unit inspects the real,
already-built artifact directly, using a real Android SDK tool,
`aapt2` (Android Asset Packaging Tool, confirmed installed this
session as part of `build-tools;34.0.0`):

```
$ aapt2 dump badging app/build/outputs/apk/debug/app-debug.apk
```

Real output (saved in full to
`verification/1.1/step5_full_build.txt`):

```
package: name='com.example.calculator' versionCode='1' versionName='1.0' platformBuildVersionName='14' platformBuildVersionCode='34' compileSdkVersion='34' compileSdkVersionCodename='14'
sdkVersion:'24'
targetSdkVersion:'34'
application: label='Calculator' icon=''
application-debuggable
launchable-activity: name='com.example.calculator.MainActivity'  label='' icon=''
```

Every real value this lesson's own Concept Units declared is present,
unmodified, inside the actual packaged file: the real `applicationId`
and `namespace` (Concept Unit 2), the real `minSdk`/`targetSdk`
(Concept Unit 2), the real application label (Concept Unit 3's own
`android:label="Calculator"`), and the real, resolved launchable
`Activity` name (Concept Units 3 and 4 together) — `aapt2`, a real tool
independent of Gradle itself, reading the real `.apk`'s own contents
directly, confirms none of it was lost or altered anywhere in the real
build pipeline.

### Discard the Throwaway Example

Not applicable — this unit inspected the real, permanent build
artifact directly; there was no separate scratch file to discard.

### Mechanical Walkthrough

Every distinct syntactic element in the command run above:

- **`aapt2`** — the real Android Asset Packaging Tool, part of the
  genuine `build-tools;34.0.0` SDK component confirmed installed this
  session — a separate real program from Gradle itself, specifically
  built to inspect and manipulate real Android package contents.
- **`dump badging`** — a real `aapt2` subcommand, extracting a real
  `.apk`'s own manifest-derived metadata — application name, package
  name, SDK versions, the launchable `Activity` — in a compact, direct
  text form, without needing to actually install or run the package
  anywhere.
- **`app/build/outputs/apk/debug/app-debug.apk`** — the real file path
  Gradle's own `assembleDebug` task, given full treatment in this
  lesson's Header, actually wrote this file to — a real, standard
  Android Gradle Plugin output location this lesson's own build
  produced without any explicit configuration naming it.

### CS Lens

Verifying a build's own final artifact directly — inspecting what was
actually produced, rather than trusting that a successful build process
implies a correct result — is a real, distinct verification step beyond
"did the build succeed." Also recognized in: a compiled binary's own
`file` command output, confirming its real architecture and format
independent of whatever build system produced it; a shipped physical
product's own final quality-control inspection, separate from
confirming the assembly line itself ran without stopping; a signed
legal document's own notarization, verifying the actual final content
independent of the drafting process that produced it; a baked cake's
own taste test, distinct from confirming the oven ran for the correct
time at the correct temperature.

### SE Lens

This lesson's own **build/run cycle**, honestly, only completes the
*build* half — `./gradlew :app:assembleDebug` produces a real,
verified `.apk`, proven directly by `aapt2`'s own real output above,
but *running* it — installing it onto a real device or emulator, and
watching the operating system actually call the real `onCreate` this
lesson's Header gave full treatment — is not something this specific
environment can currently do, an honestly-documented, real limitation
(no Android SDK emulator or physical device is available here) rather
than a claim this lesson glosses over. What "run" would concretely
mean, if a device or emulator were available: `adb install
app-debug.apk` copies the real `.apk` onto the device;
tapping the app's own icon — placed there specifically because of this
lesson's own real `LAUNCHER` intent-filter, given full treatment in
Concept Unit 3 — sends the operating system a real signal to construct
a `MainActivity` instance and call its real `onCreate`, the exact
method this lesson's own code overrides. Every real file this lesson
built is genuinely capable of that — proven by the real, complete build
succeeding — even though this lesson cannot currently show the device
side of it directly.

### Commands Needed

- **`aapt2 dump badging <apk>`** — given full treatment above.

### Run It

This unit adds no new code — `AndroidCalculator/`'s real, final,
verified state for this lesson remains exactly Concept Unit 4's own
Run It: a `BUILD SUCCESSFUL` real Gradle build, producing a real
`.apk`, now additionally confirmed correct by this unit's own real
`aapt2` inspection.

### Connect

A complete, real Android project — project, module, Gradle
configuration, Manifest, and Activity — now builds into a real,
verified, installable package, with every value traced back to the
exact line of configuration that produced it. This is the last new
concept this lesson introduces.

---

## Connect the Pieces

Follow one real build, start to finish, through every unit this lesson
built:

1. `settings.gradle.kts` (Concept Unit 1) declares one real **Android
   project**, `Calculator`, containing one real **module**, `:app` —
   proven directly by `./gradlew projects`'s own real output.
2. `app/build.gradle.kts` (Concept Unit 2) applies the real
   `com.android.application` and `org.jetbrains.kotlin.android`
   **plugins**, given full treatment in this lesson's Header, and
   declares this module's own real `namespace`, `applicationId`, and
   **SDK versions** — proven by `./gradlew :app:tasks`'s own real,
   generated task list, dozens of tasks from roughly twenty lines of
   configuration.
3. `AndroidManifest.xml` (Concept Unit 3) declares one real
   **`Activity`**, `.MainActivity`, resolving via this project's own
   real `namespace` to `com.example.calculator.MainActivity` — proven,
   from two directions, by a real build failure without it
   (`processDebugMainManifest`'s own real "file... doesn't exist"
   error) and a real, surprising success with it present but the named
   class still missing (`compileDebugKotlin NO-SOURCE`).
4. `MainActivity.kt` (Concept Unit 4) provides the real class the
   Manifest names, extending the real `android.app.Activity` and
   overriding its real `onCreate` — proven both by an isolated
   `javap`-inspected compile against the genuine `android.jar`, and by
   the real, complete `BUILD SUCCESSFUL` this exact combination
   produces.
5. `./gradlew :app:assembleDebug` (Concept Unit 5) is the real command
   that actually turns all four of the above into one real, concrete
   **APK** — inspected directly, afterward, with the real `aapt2` tool,
   confirming every declared value survived the real build pipeline
   unchanged.

One real, verified `.apk` file — `app-debug.apk`, its own real contents
confirmed by `aapt2`, not merely assumed from a successful build exit
code — is the complete, tangible result of this lesson's own five real
files. Lesson 1.2 picks this exact project back up to give
`MainActivity` its first real, visible UI, through Jetpack Compose.
