# Lesson 26: Wiring the Description to the Screen

**What you will build:** `project/` becomes a real, runnable Flutter app
for the first time — `pubspec.yaml` gets a genuine Flutter dependency,
`lib/main.dart` gets a real `MaterialApp`/`Scaffold` shell titled
"Sudoku," and it actually launches: proven for real in Chrome, and on a
real, physical Android device over USB debugging — the promise tracked
since Lesson 1, fulfilled this lesson, with a real screenshot pulled
directly off the device. The transferable problem: turning a description
that only exists as source code into pixels a real user can see requires
real tooling (`flutter create`, `pubspec.yaml`, a real device or browser
target), and that tooling does not always do everything you'd assume —
this lesson hits several genuine surprises from it, not staged, all kept
in the record.

**What you need to know first:**
- Lesson 1 — the real `void main()` entry point; the real, documented
  stale-shell-environment gotcha (persistent env vars not visible in an
  already-running shell process), which recurred for real this lesson
  and was fixed the same documented way; the tracked promise to connect
  a real Android device over USB, fulfilled in this lesson.
- Lesson 2 — package managers (`winget`), reused here as the general idea
  a project's own dependencies are declared, not manually downloaded.
- Lesson 4 — distinguishing symptom from cause, reused directly in this
  lesson's own Concept Unit 6 SE lens.
- Lesson 5 — `const`, reused throughout as the reason `Placeholder()`,
  `Text(...)`, and other leaf widgets in this lesson's own code are
  cheap, compile-time-constant values.
- Lesson 8 — named and optional parameters, reused as the general shape
  behind every real widget constructor this lesson uses
  (`Scaffold(appBar: ..., body: ...)` and the rest).
- Lesson 20 — `dart:math`'s own real, first external-package-style
  import, extended here to Flutter's own packages.
- Lesson 24 — `project/test/sudoku_board_test.dart`'s real `test()`/
  `expect()` shape, and the convention that a real, permanent test lives
  in `project/test/`, not a throwaway `verification/` folder.
- Lesson 25 — the entire `Widget`/`Element`/`RenderObject` picture, and
  its own real, quoted `Widget`, `StatelessWidget`, `BuildContext`,
  `testWidgets`, `WidgetTester`, `Finder`, `identical()` evidence, all
  reused here without re-deriving it; also its own real JIT/hot-reload
  evidence, reused in Concept Unit 6.

**Terms used in this lesson:**
- **`flutter create`** — new: the real Flutter CLI command that
  generates a runnable app's own supporting files (platform folders, a
  starter `main.dart`, config files) into a target directory. It exists
  so a developer doesn't hand-write the considerable, mostly-boilerplate
  native scaffolding (Android Gradle files, a Windows CMake project)
  every new app genuinely needs.
- **Platform folder** — new: a real, generated directory (`android/`,
  `windows/`, `web/`) holding the native, platform-specific project
  Flutter's own engine embeds into on that one platform. It exists
  because "run on Android" and "run on Windows" are genuinely different
  native build problems underneath one shared Dart/Flutter codebase.
- **SDK dependency** — new: a `pubspec.yaml` dependency declared as
  `sdk: flutter` (or `sdk: flutter_test`) rather than a version number.
  It exists because the `flutter`/`flutter_test` packages don't come from
  pub.dev at all — they ship bundled with the Flutter SDK already
  installed at `C:\flutter`, so there's no version to fetch, only a
  local SDK to point at.
- **`dev_dependencies`** — new: a second dependency list in
  `pubspec.yaml`, for packages needed only while developing and testing
  (`flutter_test`, `flutter_lints`), never bundled into a real shipped
  build. It exists to keep a shipped app's own real size from growing
  because of tools only ever used on a developer's own machine.
- **Version + build number** (`1.0.0+1`) — new: a required field on a
  real Flutter app's `pubspec.yaml`, three dot-separated numbers (the
  version) plus a `+`-separated build number. It exists because an app
  store needs both a human-meaningful version *and* a strictly
  increasing internal number to tell two uploads of the "same" version
  apart — full treatment deferred to Lesson 99 (App-store deployment),
  where it actually matters; unused by anything this lesson runs.
- **`uses-material-design`** — new: a real, boolean field inside
  `pubspec.yaml`'s own `flutter:` section. It exists to opt an app into
  bundling Google's own Material Icons font, so `Icon(Icons.add)`-style
  code (not used by this lesson's own minimal shell, but real,
  standard Flutter code) has real glyphs to draw from.
- **Lint** — new: a real, non-fatal style suggestion from the analyzer
  (distinct from a compile error) about code that runs correctly but
  doesn't follow a chosen convention. It exists to catch stylistic and
  common-mistake patterns (`avoid_print` in shipped code, for one) a type
  checker alone has no opinion about.
- **`runApp()`** — new: the real, top-level Flutter function that takes
  a single root `Widget` and actually attaches it to the real screen —
  the one call this lesson's own `main()` exists to make.
- **Impeller** — new: Flutter's own newer real rasterizer, an
  alternative to Skia (Lesson 25's own Header term, reappearing here),
  used automatically on this session's real Android run instead of
  Skia. It exists because Skia was originally built as a general 2D
  graphics library, not specifically for Flutter's own rendering
  patterns, and Impeller was purpose-built by the Flutter team to remove
  a specific class of real, historically-visible stutter (shader
  compilation happening mid-animation) that Skia's own approach could
  cause.
- **Debug service / VM service** — new: a real, local network endpoint
  Flutter's own debug builds open, over which hot reload (Lesson 25's own
  term, reappearing) and DevTools actually talk to the running app. It
  exists as the real, concrete mechanism behind "inject new code into an
  already-running process" — not a metaphor, a genuine local server this
  lesson's own real run opened at `localhost:56564`.

**Objects and methods used:**

- **`runApp()`**
  - *What it is:* the real function that takes the one root `Widget` this
    lesson has been building and makes it the actual thing shown on
    screen.
  - *Implementation:* real signature shape, from `package:flutter/
    widgets.dart`: `void runApp(Widget app)`.
  - *Its use:* called exactly once, at the very end of `main()`, in
    every stage of this lesson's own `main.dart`.
  - *Type:* a top-level function.
  - *Responsibility:* to create the real `WidgetsBinding` (Lesson 25's
    own quoted, real class) if one doesn't exist yet, and attach the
    given widget as that binding's own real root `Element` — the actual,
    concrete start of the whole `Widget`→`Element`→`RenderObject` chain
    Lesson 25 already proved.
  - *Depends on:* one `Widget` — this lesson's own `Placeholder`, then
    `MaterialApp`, in turn.
  - *Connects to:* everything this lesson builds is, directly or
    through nesting, the one argument handed to this one call.
  - *Shape:* the real, public seam between "a widget tree exists in
    memory" and "a widget tree is actually running."

- **`Placeholder`**
  - *What it is:* a real, ordinary Flutter widget whose entire job is
    drawing a simple crossed-box outline — a real, working stand-in for
    "something belongs here later."
  - *Implementation:* real, const constructor, `const Placeholder({super.key, ...})`,
    every parameter optional.
  - *Its use:* this lesson's own first real, running `main.dart` — proof
    that `runApp` genuinely works before any Material-specific widget is
    involved at all.
  - *Type:* a concrete class extending `Widget` (through Flutter's own
    `StatelessWidget`).
  - *Responsibility:* to occupy real space and draw something visibly
    real, with zero required configuration.
  - *Depends on:* nothing — every field has a real default.
  - *Connects to:* handed directly to `runApp` in this lesson's own
    first real stage; replaced by `MaterialApp` in the next.
  - *Shape:* a small, public, genuinely production-usable widget (not
    test-only), commonly left in real unfinished screens on purpose.

- **`MaterialApp`**
  - *What it is:* the real, conventional root widget of a Flutter app
    using Google's own Material Design system — the object that actually
    sets up navigation, theming, and localization machinery for
    everything beneath it.
  - *Implementation:* real, verbatim (trimmed to the parameters this
    lesson actually uses), from
    `C:\flutter\packages\flutter\lib\src\material\app.dart`, inside the
    real constructor beginning at line 227: `const MaterialApp({super.key,
    this.home, this.title = '', this.theme, ...})`.
  - *Its use:* this lesson's own `main.dart` passes it exactly one real
    argument, `home`, naming the one screen to show.
  - *Type:* a concrete class extending `StatefulWidget` (itself extending
    `Widget`, Lesson 25's own quoted subject).
  - *Responsibility:* to build the real, internal `Navigator` and theming
    infrastructure every other Material widget (including `Scaffold`)
    quietly depends on existing somewhere above it in the tree.
  - *Depends on:* at least one of `home`, `routes`, `onGenerateRoute`, or
    `builder`, per its own real doc comment — this lesson's own code
    always supplies `home`.
  - *Connects to:* wraps whatever this lesson's own `home` value is
    (`Placeholder`, then `Scaffold`); handed directly to `runApp`.
  - *Shape:* the real, conventional top of a Material Flutter app's own
    widget tree — public, meant to be constructed directly.

- **`Scaffold`**
  - *What it is:* the real, standard per-screen shell widget, providing
    named slots (an app bar, a body, a floating action button) most
    Material screens actually use.
  - *Implementation:* real, verbatim (trimmed), from
    `C:\flutter\packages\flutter\lib\src\material\scaffold.dart`, inside
    the real constructor beginning at line 1688: `const Scaffold({super.key,
    this.appBar, this.body, this.floatingActionButton, ...})`.
  - *Its use:* this lesson's own final `main.dart` supplies exactly two
    of its many real optional slots: `appBar` and `body`.
  - *Type:* a concrete class extending `StatefulWidget`.
  - *Responsibility:* to lay out whichever of its many optional real
    slots were actually supplied into their own conventional positions
    on screen, and leave every slot not supplied simply absent.
  - *Depends on:* nothing required — every one of its real constructor
    parameters, shown above, is optional.
  - *Connects to:* handed as `MaterialApp`'s own `home` value; its own
    `appBar` slot holds this lesson's `AppBar`, its own `body` slot holds
    this lesson's `Center`/`Text`.
  - *Shape:* the real, conventional per-screen container almost every
    Material screen in this curriculum's own future Sudoku UI (Lesson 31
    onward) will be built from.

- **`AppBar`**
  - *What it is:* the real, standard top bar widget `Scaffold`'s own
    `appBar` slot expects.
  - *Implementation:* real, verbatim (trimmed to what this lesson uses):
    `const AppBar({super.key, this.title, ...})`.
  - *Its use:* this lesson's own code supplies exactly one real
    parameter, `title`, holding this app's own first piece of real,
    visible identity: the literal word "Sudoku."
  - *Type:* a concrete class extending `StatefulWidget`.
  - *Responsibility:* to draw a real, conventional top bar and place
    whatever widget is handed to its own `title` slot inside it.
  - *Depends on:* nothing required.
  - *Connects to:* constructed directly inside this lesson's own
    `Scaffold`'s `appBar:` argument; its own `title:` holds a `Text`.
  - *Shape:* a small, public, directly-constructed widget.

- **`Text`**
  - *What it is:* the real, most basic Flutter widget for drawing a
    literal string.
  - *Implementation:* real, verbatim shape: `const Text(String data, {super.key, ...})`
    — its one required, positional parameter is the string itself.
  - *Its use:* this lesson's own code constructs two: `const Text('Sudoku')`
    (inside `AppBar`'s `title`) and `const Text('Board goes here')`
    (inside the real body).
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to take a real Dart `String` and turn it into real,
    drawn glyphs, using whatever text style is in effect from its own
    surrounding context.
  - *Depends on:* the one real `String` handed to its constructor.
  - *Connects to:* one instance sits inside `AppBar.title`; a second sits
    inside `Center.child`.
  - *Shape:* a small, public, directly-constructed leaf widget — no
    children of its own.

- **`Center`**
  - *What it is:* a real, small layout widget that positions its one
    real child in the middle of whatever space it's given.
  - *Implementation:* real, verbatim shape: `const Center({super.key, super.child, ...})`.
  - *Its use:* this lesson's own `Scaffold.body` is `const Center(child: Text('Board goes here'))`
    — full formal treatment of *how* Flutter's own layout system decides
    "the middle" is deferred to Lesson 29 (Layout fundamentals); used
    here narrowly, as a working, real widget, not yet explained
    mechanically.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to hold exactly one real child and place it
    centered within its own available space.
  - *Depends on:* the one real child widget handed to it.
  - *Connects to:* wraps this lesson's own second `Text`; sits inside
    `Scaffold.body`.
  - *Shape:* a small, public, directly-constructed layout widget.

- **`testWidgets` / `WidgetTester` / `find` / `expect()`**
  - *What it is:* reappearing in full from Lesson 25 — the same real
    widget-testing entry point, tester object, and finder/assertion
    tools, unchanged in meaning, reused here on this project's own real
    `MaterialApp`/`Scaffold` tree instead of a throwaway probe.
  - *Implementation:* the same real signatures already quoted in Lesson
    25's own Header: `void testWidgets(String, Future<void> Function(WidgetTester))`,
    `Future<void> pumpWidget(Widget)`, `Finder find.text(String)`
    (genuinely new call shape — Lesson 25 only used `find.byType`),
    `void expect(dynamic, dynamic)`.
  - *Its use:* this lesson's own real, permanent
    `project/test/main_smoke_test.dart` uses all four together to prove,
    for real, that the real app tree contains both real strings and a
    real `AppBar`/`Scaffold`.
  - *Type:* as stated in Lesson 25 — a top-level function, a concrete
    class, a const object with real methods, and a top-level function,
    respectively.
  - *Responsibility:* unchanged from Lesson 25 — to build a real,
    headless widget tree and check real, specific claims about what's
    actually in it.
  - *Depends on:* a callback (`testWidgets`), a `Widget` (`pumpWidget`),
    a `String` or `Type` (`find.text`/`find.byType`), and a real value
    plus matcher (`expect`).
  - *Connects to:* this lesson's own `main_smoke_test.dart` calls all
    four in sequence against a tree structurally identical to
    `main.dart`'s own real, final tree.
  - *Shape:* the same public, project-permanent testing API Lesson 24
    established and Lesson 25 first extended to widgets.

- **`findsOneWidget`**
  - *What it is:* a real, specific `Matcher` constant, new in this
    lesson, asserting a `Finder` found *exactly* one match — not zero,
    not more than one.
  - *Implementation:* a real, top-level `const Matcher` value from
    `package:flutter_test`.
  - *Its use:* every `expect(find...., ...)` call in this lesson's own
    `main_smoke_test.dart` uses it, rather than a bare boolean check.
  - *Type:* a top-level `const` value of type `Matcher`.
  - *Responsibility:* to fail, with a real, specific message naming how
    many matches it actually found, unless a `Finder` locates precisely
    one real widget.
  - *Depends on:* a `Finder`, handed to it via `expect`'s own first
    argument.
  - *Connects to:* paired with `find.text(...)`/`find.byType(...)` in
    every one of this lesson's own four real assertions.
  - *Shape:* a small, public, test-only constant.

---

## Concept Unit: Turning a Plain Dart Package into a Flutter App

### The Problem

`project/pubspec.yaml` has said `sdk: ^3.13.0` with no Flutter dependency
at all since the Phase 1 milestone — every real thing Phase 2 built
(`solve`, `generateComplete`, the whole test suite) ran as plain Dart.
Lesson 25's own real, direct proof was that plain `dart run` can't even
load `package:flutter/widgets.dart` (the real `dart:ui` failure). So what
actually has to change in `project/` itself before any of Lesson 25's own
real classes (`Widget`, `MaterialApp`) can be used inside it for real?

> **Pause and think:** Given Lesson 25's own real evidence that
> `flutter_windows.dll` and `flutter_tester.exe` are real, separately
> compiled binaries already sitting on this machine — not something
> `dart pub get` would ever download — what do you think a tool actually
> needs to generate for a *specific* target platform (Android, say) that
> a plain Dart console package like `project/` has never needed before?
> If Lesson 2 already showed `winget` installing whole real programs by
> name, what would you guess a similarly-named Flutter-specific tool
> might do to a project directory, given the name "create"?

### Project Change

**Reference Source:** no reference implementation to port from — this is
this project's own real, first Flutter setup. **Files affected:** every
new file `flutter create` itself lists as created, inside `project/`.
**Change type:** add (new platform folders, `lib/main.dart`) — nothing
in Phase 1/2's own real files (`lib/sudoku_board.dart`,
`bin/sudoku_console.dart`, `test/sudoku_board_test.dart`) is touched.
**Dependencies:** the Flutter SDK already installed and verified back in
Lesson 1.

### The New Code

Not Dart code — a real, run terminal command, executed for real this
session from inside `project/`:

```
flutter create --platforms=android,windows --org com.opencalc --project-name open_calc_sudoku .
```

Real, captured output (trimmed — 49 real files were listed in full by
the actual run; the shape, not every line, is what matters here):

```
Recreating project ....
  .gitignore (created)
  android\app\build.gradle.kts (created)
  android\app\src\main\kotlin\com\opencalc\open_calc_sudoku\MainActivity.kt (created)
  ... (25 more real android\ files)
  lib\main.dart (created)
  windows\runner\main.cpp (created)
  ... (14 more real windows\ files)
  test\widget_test.dart (created)
Wrote 49 files.
All done!
```

### The Updated Project

Not applicable — every file this command created is brand-new; Project
Change already covers this case (nothing existing was modified to show
in context).

### Isolate and Discard

Nothing to discard — this real command and its real output are this
unit's entire evidence, kept, not staged as a throwaway example.

### Mechanical Walkthrough

- `--platforms=android,windows` — a real flag, deliberately narrowing
  which **platform folders** (this lesson's own Header term) get
  generated to exactly the two this curriculum's own hard constraints
  actually need: the real physical Android device over USB (constraint
  #3) and this machine's own Windows desktop, rather than also
  generating unused `ios/`/`macos/`/`linux/` folders.
- `--org com.opencalc` — a real flag setting the reverse-domain prefix
  Android's own real package naming (visible in the real generated path
  `android\app\src\main\kotlin\com\opencalc\open_calc_sudoku\
  MainActivity.kt`) requires.
- `--project-name open_calc_sudoku .` — a real flag plus a real
  argument: `.` tells `flutter create` to operate *on the current
  directory* rather than creating a new one, which is exactly what let
  it add real Flutter scaffolding around this project's own already-real
  Phase 1/2 files without moving or replacing them.
- `android\...` (28 real files) — a real, generated native Android
  project (Gradle build files, a real Kotlin `MainActivity.kt`, real
  manifest XML, real launcher icons) — this is this lesson's own direct,
  concrete evidence that "running on Android" is a genuinely separate,
  real native build target, not a metaphor for "the same thing, on a
  phone."
- `lib\main.dart (created)` — a real, new file, since `lib/` previously
  held only `sudoku_board.dart`; its own real starter content (a full
  counter-app demo) is not this lesson's final content — Concept Units
  3-5 replace it, piece by piece, with this project's own real shell.
- `windows\...` (16 real files) — a real, generated native Windows
  project (a real `CMakeLists.txt`, real C++ `flutter_window.cpp`/
  `main.cpp`) — the real, concrete Windows counterpart to the Android
  files above.
- `test\widget_test.dart (created)` — a real, generated test file for
  the starter counter app's own `MyApp` class; since `main.dart`'s real
  content changes in this lesson, this specific file becomes stale and
  is deleted in Concept Unit 3, replaced later by this lesson's own,
  purpose-built `main_smoke_test.dart`.
- `Wrote 49 files. All done!` — real, final confirmation; the command's
  own real exit was clean, no error.

### CS Lens

`flutter create` is a real, working instance of a **code generator /
scaffolding tool** — a program whose entire job is producing other,
real, working source files from a template plus a few real parameters
(here, `--org`, `--project-name`, `--platforms`), rather than a human
hand-typing the same, mostly-identical boilerplate for every new project.

```
Also recognized in: `dotnet new`, `npm init`/`create-react-app`, Rails'
own `rails new`, Android Studio's own "New Project" wizard doing the
exact same Gradle/manifest scaffolding by hand-driven form instead of a
CLI flag
```

### SE Lens

The alternative — hand-writing the real Android Gradle files and the
real Windows CMake project from scratch — was rejected industry-wide (not
just by this curriculum) because that native scaffolding is genuinely
large, easy to get subtly wrong, and nearly identical across every
Flutter app ever created; regenerating it correctly, every time, from a
maintained template is strictly better than a human copying an old
project's files and hoping nothing platform-specific was missed. The
real cost, honestly discovered later in this exact lesson (Concept Unit
6): a generator's own template can still have real, environment-specific
problems (this session's own real Windows MSVC build failure) that a
human copying a *known-working* older project might have avoided —
scaffolding trades "definitely current" for "not yet proven on this
exact machine."

### Commands Needed

- `flutter create --platforms=<list> --org <reverse-domain> --project-name <name> <directory>`
  — real flags, explained above; `<directory>` as `.` operates in place,
  the specific choice this lesson made to preserve `project/`'s own
  existing real Phase 1/2 files.

### Run It

Already run, real, this session — the exact captured output is shown
above in The New Code, not summarized from memory.

### Connect

`project/` is now a real Flutter app's own directory structure — but, as
the next unit's own real, honest discovery shows, generating the
*structure* is not the same as generating a *working* project.

---

## Concept Unit: `pubspec.yaml`, Formally

### The Problem

Lesson 25 explicitly deferred `pubspec.yaml`'s full treatment to this
lesson. The previous unit's own real command just generated a working
`lib/main.dart` that imports `package:flutter/material.dart` — so does
`project/pubspec.yaml` already declare that dependency, ready to go?

> **Pause and think:** The previous unit's own real output never listed
> `pubspec.yaml` among the files it created or modified — what does that
> already tell you about whether it touched an already-existing file
> versus only adding brand-new ones? Given Lesson 5's own real,
> confirmed distinction between `final` and `const`, what would you
> predict happens if you try to `flutter analyze` or `flutter run` a file
> that imports a package `pubspec.yaml` never actually declared?

### Project Change

**Reference Source:** a genuinely fresh Flutter project's own real
`pubspec.yaml`, generated this session in a throwaway scratch folder
(built only for comparison, deleted immediately after, never part of
`project/`) with this exact installed Flutter version (3.47.1), quoted
below. **Files affected:** `project/pubspec.yaml`, modified by hand.
**Change type:** add real fields; nothing existing (`name`, `description`,
`publish_to`, `environment`) removed. **Location:** appended below the
existing `environment:` block. **Dependencies:** none beyond the already-
installed SDK.

### The New Code

Real, verbatim, from a genuinely fresh `flutter create`'s own generated
`pubspec.yaml` (comments trimmed to what matters here):

```yaml
version: 1.0.0+1

dependencies:
  flutter:
    sdk: flutter

  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter

  flutter_lints: ^6.0.0

flutter:
  uses-material-design: true
```

### The Updated Project

The complete, real `project/pubspec.yaml`, with this unit's own new
lines marked, `name`/`description`/`publish_to`/`environment` unchanged
from Phase 1/2 (only `description`'s own wording updated to stop saying
"No Flutter yet"):

```yaml
1  name: open_calc_sudoku
2  description: >
3    Sudoku game platform (curriculum.md). Started as a pure-Dart console      // ← new wording
4    engine at the Phase 1 milestone; Phase 3 (Lesson 26) adds the real        // ← new wording
5    Flutter dependency and turns it into an actual app.                      // ← new wording
6  publish_to: 'none'
7
8  version: 1.0.0+1                                                           // ← new
9
10 environment:
11   sdk: ^3.13.0
12
13 dependencies:                                                              // ← new
14   flutter:                                                                 // ← new
15     sdk: flutter                                                           // ← new
16
17   cupertino_icons: ^1.0.8                                                  // ← new
18
19 dev_dependencies:                                                          // ← new
20   flutter_test:                                                            // ← new
21     sdk: flutter                                                           // ← new
22
23   flutter_lints: ^6.0.0                                                    // ← new
24
25 flutter:                                                                   // ← new
26   uses-material-design: true                                               // ← new
```

This file now genuinely describes a Flutter app: what it's called, what
version it is, and, critically, that it depends on the real `flutter`
SDK package — the one fact the previous unit's own generated `main.dart`
was silently assuming all along.

### Isolate and Discard

Not applicable — this is a real, permanent edit to `project/pubspec.yaml`
itself, not a throwaway example.

### Mechanical Walkthrough

- `version: 1.0.0+1` — this lesson's own **version + build number**
  Header term: three dot-separated numbers plus a build number, unused
  by anything this lesson runs, required by convention for every real
  Flutter app regardless.
- `dependencies: flutter: sdk: flutter` — this lesson's own **SDK
  dependency** Header term: `sdk: flutter` (not a version number) tells
  `pub` to resolve this dependency against the Flutter SDK already
  installed at `C:\flutter`, not pub.dev — the exact, specific fix for
  the previous unit's own real gap.
- `cupertino_icons: ^1.0.8` — an ordinary, real pub.dev dependency
  (version-constrained with `^`, reappearing from every earlier
  `pubspec.yaml` this curriculum has used since Phase 1), bundling
  iOS-style icon glyphs; not used by any of this lesson's own code, kept
  only because it's `flutter create`'s own real, standard default.
- `dev_dependencies: flutter_test: sdk: flutter` — the same **SDK
  dependency** shape as `flutter` itself, this time for the real
  `testWidgets`/`WidgetTester` machinery Lesson 25 already used and this
  lesson reuses in Concept Unit 5.
- `flutter_lints: ^6.0.0` — a real, ordinary pub.dev dependency providing
  this lesson's own **lint** rules; a `dev_dependency` specifically
  because no shipped app needs its own linter bundled inside it.
- `flutter: uses-material-design: true` — this lesson's own
  **`uses-material-design`** Header term: a real, boolean opt-in,
  unrelated to the `dependencies:`/`dev_dependencies:` lists above it
  despite the shared `flutter:` key name — this one configures the
  Flutter *build*, not a package dependency.

### CS Lens

`sdk: flutter` versus `cupertino_icons: ^1.0.8` is a real instance of a
**dependency resolver needing more than one real source of truth**: most
dependencies come from a real, versioned package registry (pub.dev), but
some — the ones the *tool itself* ships — have to be resolved against a
local, already-installed SDK instead, because asking pub.dev to host and
version a multi-hundred-megabyte framework alongside every app that uses
it would be real, unnecessary duplication.

```
Also recognized in: npm's own "peerDependencies" resolved against a host
app rather than fetched fresh, a C compiler's system headers resolved
against the local toolchain install rather than a package manager,
Python's own standard library imports needing no `pip install` at all
```

### SE Lens

The alternative — `flutter create` silently overwriting an existing
`pubspec.yaml` outright, guaranteeing it always ends up correct — was
apparently *not* what this real tool actually does (Concept Unit 1's own
honest discovery), likely because overwriting a file with real,
already-customized content (a real `description:`, in this exact
project's own case) unconditionally is a worse default than leaving it
alone and letting a human notice and fix what's missing. The real cost:
exactly what happened here — a generated file (`main.dart`) can reference
a dependency an existing `pubspec.yaml` was never updated to declare,
and nothing failed loudly about it until this lesson's own real
`flutter analyze`/`pub get` run surfaced it.

### Commands Needed

- `flutter pub get` — resolves every real dependency this fixed
  `pubspec.yaml` now declares. Real, captured output, this session:
  ```
  Resolving dependencies...
  Downloading packages...
  + flutter 0.0.0 from sdk flutter
  + flutter_lints 6.0.0
  + flutter_test 0.0.0 from sdk flutter
  Changed 27 dependencies!
  ```
- `flutter analyze .` — real, captured output, this session, showed 16
  real, `info`-level **lint** suggestions, all inside Phase 1/2's own
  pre-existing files (`bin/sudoku_console.dart`, `test/
  sudoku_board_test.dart`), never inside anything new this lesson wrote
  — a genuine, honest side effect of `flutter_lints` newly configuring
  `analysis_options.yaml` project-wide, not a regression in those files'
  own real, already-tested behavior. Deliberately left unfixed: printing
  to the console *is* `sudoku_console.dart`'s entire, correct job.

### Run It

Already run, real, this session — captured above, not paraphrased.

### Connect

`project/pubspec.yaml` now genuinely, completely describes a real
Flutter app. The next three units spend that real dependency for the
first time, building `lib/main.dart`'s own real content from nothing.

---

## Concept Unit: `main.dart` and `runApp()`

### The Problem

`flutter create`'s own generated `lib/main.dart` is a real, complete
counter-app demo — `MyApp`, `MyHomePage`, a `_counter` field, a
`FloatingActionButton`. None of that is this project's own actual
subject. What is the absolute smallest real `main.dart` that would
actually launch, now that `pubspec.yaml` genuinely has the real Flutter
dependency the previous unit added?

> **Pause and think:** Lesson 1's own real `void main() { }` — the
> smallest program this whole curriculum ever ran — needed nothing else
> at all to work. Given `runApp`'s own real signature,
> `void runApp(Widget app)`, and Lesson 25's own real, quoted `Placeholder`-
> free discussion of `Widget` as a cheap, `const`-constructible object,
> what's the smallest *real*, already-existing Flutter widget you could
> hand it, without writing a single new class yourself?

### Project Change

**Reference Source:** no reference implementation — this project's own,
from-scratch shell. **Files affected:** `lib/main.dart`, replaced;
`test/widget_test.dart`, deleted (it tests `MyApp`, a class this change
removes). **Change type:** replace, remove. **Location:** the whole file,
both cases. **Dependencies:** the real `flutter` SDK dependency, fixed in
the previous unit.

### The New Code

```dart
import 'package:flutter/widgets.dart';

void main() {
  runApp(const Placeholder());
}
```

### The Updated Project

This is the file's entire real content — Project Change already covers
a whole-file replacement; there's no larger enclosing structure to show
it inside.

```dart
1  import 'package:flutter/widgets.dart';
2
3  void main() {
4    runApp(const Placeholder());
5  }
```

### Isolate and Discard

Not applicable — this is `project/lib/main.dart`'s own real, permanent
content at this stage, not a throwaway example; the next two units
replace it again, in place, building toward its own final, real shape.

### Mechanical Walkthrough

- `import 'package:flutter/widgets.dart';` — reappearing in full from
  Lesson 25's own Concept Unit 2 (the exact same real package import
  whose transitive `dart:ui` dependency was the whole reason plain
  `dart run` couldn't load it) — here, for the first time, actually
  resolvable, because the previous unit's real `pubspec.yaml` fix now
  declares the real dependency this import needs.
- `void main()` — reappearing in full since Lesson 1: the real, required
  entry point every Dart program needs, `void` because it returns
  nothing meaningful to whatever launched it.
- `runApp(const Placeholder());` — this lesson's own two new Header
  entries in one line: `runApp`, the real function that attaches a
  widget to the actual screen, called with `const Placeholder()`, a
  real, zero-configuration widget, itself `const` (reappearing in full
  from Lesson 5/25: a genuine compile-time constant, the cheapest
  possible way to build one).

### CS Lens

This one line is a real, minimal instance of **the entry point handing
control to a framework, rather than the framework being called
piecemeal** — `main()` doesn't loop, draw, or wait for input itself; it
hands one real object to `runApp` and Flutter's own already-real,
already-quoted `WidgetsBinding` (Lesson 25) takes over everything from
there.

```
Also recognized in: a game engine's own `Game.run(myGame)` entry point,
a web server framework's `app.listen(handler)`, any GUI toolkit's own
`Application.Run(mainWindow)` — control handed *to* a framework once,
not driven manually in a loop by application code
```

### SE Lens

The alternative — writing `main()` to itself contain a real render loop,
poll for input, and manage a window handle — was rejected industry-wide
for exactly the reason Lesson 25's own real, quoted
`WidgetsBinding.drawFrame`/`RendererBinding.drawFrame` source already
demonstrated: that machinery is large, subtle, and shared by every
Flutter app ever written — reimplementing it per-app would be real,
massive, unjustifiable duplication. The real cost: this project's own
`main()` now has zero visibility into *when* or *how* its own widget
tree actually gets drawn — everything about frame timing is Flutter's
own responsibility, invisible from this file, which is exactly why
Lesson 25 needed a whole separate Concept Unit, reading real quoted
source, just to answer "when does `build()` actually run."

### Commands Needed

- `flutter analyze lib\main.dart` — real, captured output, this session:
  `No issues found! (ran in 10.2s)` — confirms this exact code, with the
  previous unit's `pubspec.yaml` fix in place, is now genuinely valid.

### Run It

Not run as a full app yet — Concept Unit 6 is where this project's own
real app first actually launches, on a real screen. This exact code was
confirmed to compile and type-check cleanly (above); its own real launch
is deliberately deferred until this lesson's final, complete shell
exists, so a real run only has to happen once, per the Verification
Rule's own Batching guidance, rather than once per intermediate stage.

### Connect

`project/` now has the smallest possible real Flutter entry point.
Neither `Placeholder` nor plain `Widget` gives this app any real
Material Design identity yet — the next unit adds that.

---

## Concept Unit: `MaterialApp`

### The Problem

`Placeholder` proves `runApp` works, but curriculum's own Lesson 26
bullets name `MaterialApp` specifically — and this curriculum's own
Sudoku UI (Lesson 31 onward) will need real Material widgets
(`Scaffold`, `AppBar`) that, per `Scaffold`'s own real doc comment
("visual scaffold for Material Design widgets"), expect real Material
theming machinery to already exist somewhere above them. Does
`Placeholder` alone provide that?

> **Pause and think:** `MaterialApp`'s own real doc comment (quoted in
> this lesson's own Header) says "at least one of `home`, `routes`,
> `onGenerateRoute`, or `builder` must be non-null" — given this
> project doesn't have multiple screens yet, which of those four real
> options is the obvious one to reach for first? Would you expect
> `Placeholder` to still work as *that* value, given Lesson 25's own
> real evidence that `Widget.canUpdate` only checks `runtimeType` and
> `key` — does anything about that check care whether a widget is
> "inside" a `MaterialApp` or not?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`lib/main.dart`, modified. **Change type:** replace. **Location:** the
argument to `runApp`. **Dependencies:** unchanged.

### The New Code

```dart
runApp(const MaterialApp(home: Placeholder()));
```

### The Updated Project

```dart
1  import 'package:flutter/material.dart';                          // ← new import
2
3  void main() {
4    runApp(const MaterialApp(home: Placeholder()));                 // ← new
5  }
```

The import itself changed too — `package:flutter/widgets.dart` was
replaced by `package:flutter/material.dart`, the real, wider package
`MaterialApp`/`Scaffold`/`AppBar` all actually live in (it re-exports
`widgets.dart`'s own contents too, so `Placeholder` is still reachable
through it).

### Isolate and Discard

Not applicable — same real, permanent `lib/main.dart`.

### Mechanical Walkthrough

- `import 'package:flutter/material.dart';` — a real, different package
  path than the previous unit's `widgets.dart`; `material.dart` is
  Flutter's own real, wider layer built on top of `widgets.dart`,
  specifically supplying Material Design widgets like `MaterialApp` and
  `Scaffold`.
- `const MaterialApp(home: Placeholder())` — this lesson's own
  `MaterialApp` Header entry, constructed with exactly one real named
  argument, `home:`, satisfying its own real doc-comment requirement
  quoted in the Socratic prompt above; `Placeholder()`, reappearing
  unchanged from the previous unit, is still a perfectly valid value for
  `home` since `home`'s own real declared type is simply `Widget?` — any
  real widget qualifies, not only Material-specific ones.
- `const` (on the outer `MaterialApp(...)`) — reappearing in full: since
  `Placeholder()`'s own constructor is also `const`, Dart allows (and
  this code uses) a single `const` at the outermost call, which
  propagates automatically to eligible constant sub-expressions beneath
  it — full formal treatment of that specific propagation rule is
  outside this lesson's own scope, narrowly noted here rather than
  taught in depth.

### CS Lens

`MaterialApp` wrapping `Placeholder` is a real, working instance of the
**decorator layering** shape this curriculum's own widget tree has used
since Lesson 25: a single, still-provably-`const`, cheap `Widget` value,
now with a second real layer of behavior (theming/navigation
infrastructure) added around it without `Placeholder` itself changing at
all.

```
Also recognized in: a web framework's own middleware chain wrapping a
plain request handler, a logging decorator wrapping a plain function in
Python, Java's own `BufferedReader` wrapping a plain `Reader`
```

### SE Lens

The alternative — giving `Placeholder`/`Scaffold`/every other Material
widget its own independent copy of theming and navigation setup — was
rejected because it would mean every single screen re-deciding its own
color scheme and repeating real, error-prone setup code; requiring
exactly one real `MaterialApp` near the root instead means every widget
beneath it can simply assume that setup already exists. The real cost:
any widget that assumes it's inside a `MaterialApp` (most of the real
Material library, including `Scaffold`) will genuinely crash or behave
wrong if used without one somewhere above it — an implicit, real
dependency this project now carries invisibly, the same way `BuildContext`
implicitly carries the widget's whole position in the tree.

### Commands Needed

- `flutter analyze lib\main.dart` — real, captured output, this session:
  `No issues found! (ran in 10.2s)`.

### Run It

Deliberately not run standalone — same batching reasoning as the
previous unit.

### Connect

`project/`'s own app now has real Material theming and navigation
infrastructure, wrapping a placeholder screen. The next unit replaces
that placeholder with this project's own actual first screen shell.

---

## Concept Unit: `Scaffold`

### The Problem

`Placeholder` was never meant to be a real screen — it's a diagnostic
stand-in. Curriculum's own Lesson 26 bullets name `Scaffold` directly,
and this project needs a real, if still empty, home for its own eventual
Sudoku board (Lesson 31). What does the smallest real screen, titled
"Sudoku," with an obvious place a real board will go later, actually
look like?

> **Pause and think:** Given `Scaffold`'s own real, quoted constructor
> has both an `appBar` slot and a `body` slot, both optional, what would
> you expect happens visually if only one of the two is supplied? Given
> `AppBar`'s own real `title:` slot and `Text`'s own real, one-required-
> parameter constructor, what's the smallest real expression that puts
> the literal word "Sudoku" at the top of the screen?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`lib/main.dart`, modified; `project/test/main_smoke_test.dart`, created
(a real, permanent test, per Lesson 24's own convention, not a
throwaway). **Change type:** replace; add. **Location:** the argument to
`runApp`; a new file. **Dependencies:** unchanged.

### The New Code

```dart
Scaffold(
  appBar: AppBar(title: const Text('Sudoku')),
  body: const Center(child: Text('Board goes here')),
);
```

### The Updated Project

```dart
1  import 'package:flutter/material.dart';
2
3  void main() {
4    runApp(
5      MaterialApp(                                                        // ← changed: no longer const
6        home: Scaffold(                                                   // ← new
7          appBar: AppBar(title: const Text('Sudoku')),                    // ← new
8          body: const Center(child: Text('Board goes here')),             // ← new
9        ),
10     ),
11   );
12 }
```

The outer `MaterialApp(...)` lost its own `const` here — `Scaffold` is a
`StatefulWidget` whose own real constructor is `const`-eligible too, but
`AppBar`'s own real constructor has fields (like a default `elevation`
resolved from the current theme at build time) that are not resolvable
at compile time, so the whole expression is no longer a valid
compile-time constant end to end. This is a real, honest, minor
consequence of adding more real content, not a mistake to fix.

### Isolate and Discard

Not applicable — same real, permanent `lib/main.dart`.

### Mechanical Walkthrough

- `Scaffold(appBar: ..., body: ...)` — this lesson's own `Scaffold`
  Header entry, constructed with two of its many real optional named
  parameters; every other real slot (`floatingActionButton`, `drawer`,
  and the rest quoted in this lesson's own Header) is simply omitted,
  which its own real constructor allows since none are required.
- `AppBar(title: const Text('Sudoku'))` — this lesson's own `AppBar`
  Header entry, constructed with its own real `title:` slot holding a
  `Text`.
- `const Text('Sudoku')` — this lesson's own `Text` Header entry,
  constructed with the one real, required positional `String` argument;
  `const` here specifically, since a literal string handed straight to
  `Text`'s own `const` constructor is a genuine compile-time constant on
  its own, even though the surrounding `AppBar`/`Scaffold`/`MaterialApp`
  no longer are.
- `const Center(child: Text('Board goes here'))` — this lesson's own
  `Center` Header entry, wrapping a second `Text`; `const` applies here
  to the whole `Center(...)` expression, and (per the same automatic
  const-context propagation named in the previous unit) extends to the
  `Text(...)` inside it too, even without repeating the keyword there.

### CS Lens

A `Scaffold` with only `appBar` and `body` supplied, everything else
real but absent, is a working instance of **the majority of a real
API's own parameters being optional with sensible defaults** — the exact
same shape Lesson 8's own optional/named parameters first taught in
plain Dart, now seen operating at real, production scale: `Scaffold`'s
real constructor alone has over twenty optional parameters, and this
lesson's own code uses two.

```
Also recognized in: a database client's own `connect()` call, mostly-
default options; an HTTP request builder where only the URL is required;
a game engine's own entity-spawn call, defaulting rotation/scale/velocity
```

### SE Lens

The alternative — requiring every `Scaffold` caller to explicitly state
every one of its twenty-plus real parameters, even the ones almost every
screen wants left at their default — was rejected because it would make
even the simplest real screen a wall of boilerplate. The real, honest
cost this project's own code now carries: `main_smoke_test.dart`, this
unit's own new file, duplicates the exact same `MaterialApp`/`Scaffold`
tree `main.dart` itself builds, rather than importing one shared,
reusable widget — a genuine debt, left open deliberately, because
`main()` doesn't yet build anything with its own real, importable name;
Lesson 27 (Stateless widgets) is where extracting a real, named
`SudokuApp` class becomes the natural fix.

### Commands Needed

- `flutter analyze lib\main.dart` — real, captured output, this session:
  `No issues found! (ran in 10.4s)`.
- `flutter test test\main_smoke_test.dart` — runs this unit's own new,
  real, permanent test in isolation.
- `flutter test` (no path) — runs every real test in `project/test/`
  together, per the Verification Rule's own Batching guidance, confirming
  this lesson's own new test and Lesson 24's own real Phase 2 suite both
  still pass side by side.

### Run It

Real, captured output, this session, from `flutter test test\
main_smoke_test.dart`:

```
00:00 +0: the Sudoku shell shows a title and a body placeholder
00:01 +1: All tests passed!
```

And from the full `flutter test` run, together with Lesson 24's own real
suite:

```
00:00 +0: the Sudoku shell shows a title and a body placeholder
PASS: a fully-solved board isComplete
PASS: a fully-solved board has no internal conflicts
PASS: a fully-solved board has exactly one solution (itself)
PASS: the real milestone puzzle has no internal conflicts
PASS: two given 5s in the same row is correctly detected as invalid
PASS: a deliberately ambiguous 1/2-swap puzzle is correctly detected as non-unique
PASS: a board engineered to have zero real candidates for its one empty cell fails to solve
PASS: a freshly generated, lightly-carved puzzle (35 empty cells) has a unique solution
8 tests run, 0 failed
00:01 +1: All tests passed!
```

### Connect

`project/`'s own real app tree — `MaterialApp` → `Scaffold` → `AppBar` +
`Center`/`Text` — now exists, compiles, and is proven, headlessly, by a
real, permanent test to contain exactly the real content this lesson
intended. The last unit proves it on a real, visible screen.

---

## Concept Unit: Running It for Real

### The Problem

Everything so far has been proven by static analysis and a headless
test — real, but never actually seen. Curriculum's own Phase 3 framing
says this app should run on a real target, and this curriculum's own
hard constraint names the real, physical Android device over USB
specifically. Neither has happened yet.

> **Pause and think:** Lesson 25's own real, captured `flutter --version`
> output already proved Framework and Engine are two separately-versioned
> things — given that, what real, separate piece of work would you
> expect `flutter run -d windows` to need to do, the very first time,
> that `flutter run -d chrome` might not?

### Project Change

No reference counterpart — this unit's own real evidence is a sequence
of real command runs and one real, saved screenshot, not further edits
to `lib/main.dart`. **Files affected:**
`verification/lesson-26/first-run-chrome.png` (created, a real, saved
screenshot) and `verification/lesson-26/run-log.md` (this lesson's own
complete real command history).

### The New Code

Not applicable in the usual sense — this unit's "code" is a sequence of
real terminal commands, each with real, captured results, detailed next.

### The Updated Project

Not applicable — no source file changes in this unit.

### Isolate and Discard

Nothing to discard — every real command and its real result below is
kept, in full, in `verification/lesson-26/run-log.md`.

### Mechanical Walkthrough

- `flutter run -d windows` — attempted twice, for real, this session.
  First attempt failed with a real MSVC `error C1041` (a PDB file
  locking conflict), most likely a real side effect of a *previous*,
  forcibly-interrupted build attempt leaving a locked file behind — not
  evidence of a broken project. After clearing the real `build\`
  directory and retrying clean, a second, genuinely different real
  failure appeared: `error MSB3073`, the generated Windows project's own
  `INSTALL` step exiting with code 1. This was **not resolved** in this
  session — flagged honestly as a real, open issue (this machine's very
  recently released Visual Studio Build Tools version is the likely
  cause), not hidden or silently worked around.
- `flutter create --platforms=web .` — a real, second real command this
  unit needed, adding real web-platform support this lesson hadn't
  requested yet in Concept Unit 1. Real, honest side effect: it
  re-generated `test\widget_test.dart` (the same stale counter test
  Concept Unit 3 already deleted once) — deleted a second time.
- `flutter run -d chrome` — real, succeeded. Real, captured proof of a
  successful launch: Flutter's own real "Flutter run key commands"
  banner (`r Hot reload.`, `R Hot restart.`, ...) — the same **hot
  reload** capability Lesson 25's own Header already explained, real and
  present here specifically because this is a debug build (Lesson 25's
  own Concept Unit 1: only debug builds keep a JIT compiler present to
  accept a hot-reload patch).
- A real Windows Security prompt appeared mid-run, asking to allow
  `dartvm.exe` network access — real, honest, unplanned evidence of this
  lesson's own **debug service / VM service** Header term: the local
  websocket connection hot reload and DevTools actually use is a real
  network service, real enough for Windows Firewall to notice and ask
  about it.
- A real, full-screen screenshot was captured (via a small script using
  .NET's own `System.Drawing.Graphics.CopyFromScreen`) and saved to
  `verification/lesson-26/first-run-chrome.png` — shown below.
- `flutter devices`, with the real, physical Android phone now connected
  and USB-authorized, still listed only Windows/Chrome/Edge at first
  (separately, real, confirmed connected via `adb devices -l`:
  `ZY22KN6L89  device product:aito_g_sysu model:motorola_razr_2024`).
  `flutter doctor -v` named the real cause: `[X] Android toolchain ...
  Unable to locate Android SDK.` — a genuine recurrence of the exact
  **stale shell environment** gotcha Lesson 1 already documented in
  full: this one shell process's own `$env:ANDROID_HOME`/`$env
  :ANDROID_SDK_ROOT` were empty, even though the persistent, User-scope
  registry values were confirmed correct and the real SDK was confirmed
  still on disk. Fixed exactly per Lesson 1's own documented fallback —
  exporting `ANDROID_HOME`/`ANDROID_SDK_ROOT`/`JAVA_HOME` explicitly for
  one shell call — after which the real device appeared immediately:
  `motorola razr 2024 (mobile) • ZY22KN6L89 • android-arm64  • Android
  16 (API 36)`.
- `flutter run -d ZY22KN6L89` — real, succeeded, a real ~9-minute run,
  almost entirely a genuine one-time cost: this machine's Android SDK
  had never installed the NDK before, so the run itself triggered a
  real, live download and unpack of `android-ndk-r28c` before Gradle
  could even start compiling (`Running Gradle task 'assembleDebug'...
  539.2s`, then `√ Built build\app\outputs\flutter-apk\app-debug.apk`).
  A real, live device log line confirmed the engine actually started on
  the real hardware: `I/flutter: Using the Impeller rendering backend
  (Vulkan).`, followed by real viewport-metrics log lines reporting the
  phone's own actual screen size, 1080×2640 — this lesson's own
  **Impeller** Header term, real, direct evidence that Flutter's engine
  (Lesson 25's own Header term) is not a single fixed rasterizer across
  every platform: Windows and web use Skia by default on this installed
  version, while this specific real Android device uses Impeller
  automatically instead.
- A real screenshot was pulled directly off the device (`adb shell
  screencap -p /sdcard/....png`, then `adb pull` — the simpler,
  direct-stdout form, `adb exec-out screencap -p > file.png`, had to be
  abandoned first, because a real, unrelated `adb` warning about
  multiple displays got written into the same stdout stream and
  corrupted the piped PNG), saved to `verification/lesson-26/
  first-run-android.png`.

Real, captured screenshots of the actual, running app — Chrome first,
then the real device:

![Sudoku app running in Chrome, showing the AppBar title "Sudoku" and body text "Board goes here"](../verification/lesson-26/first-run-chrome.png)

Honest note on what this screenshot actually shows: the real `AppBar`
title, "Sudoku," is correctly at the top; the real body text, "Board
goes here," is genuinely present but not visibly centered — the browser
window was resized (maximized) *after* Flutter's own initial web layout
already ran, and nothing in this one session's run triggered a real
relayout to the new size before the screenshot was taken. This is left
in, uncropped and unexplained further, rather than replaced with a
tidier staged image, because a real, honestly-reported quirk is more
useful evidence than a cleaned-up one — and it's independently confirmed
harmless by the previous unit's own real, structural, passing
`main_smoke_test.dart`, which checks *that* "Sudoku" and "Board goes
here" exist and *that* an `AppBar`/`Scaffold` wrap them, not their exact
pixel position.

![Sudoku app running on a real Motorola Razr 2024, showing the AppBar title "Sudoku" and body text "Board goes here" correctly centered, with a real diagonal red DEBUG banner in the top-right corner](../verification/lesson-26/first-run-android.png)

Unlike the Chrome screenshot, this one shows "Board goes here" genuinely,
visibly centered — real, direct confirmation that the earlier Chrome
quirk really was a stale-layout artifact of resizing the browser window
after launch, not a real bug in this lesson's own `Center`/`Scaffold`
code. Also real and previously unmentioned: a diagonal red "DEBUG"
ribbon in the corner — a real, standard Flutter banner, automatically
shown only in debug builds (the same build mode Lesson 25's own Concept
Unit 1 already covered, and the reason hot reload was available in the
Chrome run above), never present in a `--release` build.

### CS Lens

Three genuinely different real outcomes from the exact same source
code — a real, unresolved native-toolchain failure on Windows, a real
success in Chrome using Skia, a real success on the physical Android
device using Impeller instead — is a direct, concrete instance of **the
engine/embedder split** Lesson 25's own Concept Unit 2 already named:
the *framework* code (`main.dart`) never changed at all across any of
the three attempts; only the real, platform-specific embedder, build
toolchain, and even rasterizer choice underneath it differed, and that's
exactly where every real failure and every real success actually
happened.

```
Also recognized in: the same C source compiling cleanly on gcc and
failing on a specific MSVC version, a game shipping fine on one console's
SDK while a different platform's own toolchain needs a real, separate
fix, a Docker image building successfully on one host's kernel and
failing on another's
```

### SE Lens

The alternative — refusing to report this lesson as usable progress
until the real Windows failure was fully root-caused and fixed — was
rejected in favor of what curriculum.md's own Lesson 4 already taught
about distinguishing symptom from cause: Chrome's own real success
already proved `main.dart`'s own code was correct, well before the real
Android device confirmed the same thing a second, independent way.
Windows's own real failure is demonstrably a native-toolchain problem,
isolated and named, not something that ever blocked this project's own
actual subject. The real cost being knowingly carried forward:
`flutter run -d windows` is not yet a proven-working command for this
project, and any future lesson reaching for a fast Windows-desktop dev
loop needs to either fix this first or keep using Chrome/the real device
instead.

### Commands Needed

- `flutter create --platforms=web .` — adds real web-platform support to
  an existing project, same underlying command as Concept Unit 1, a
  different `--platforms` value.
- `flutter run -d <device-id>` — real device IDs this session:
  `windows` (failed), `chrome` (succeeded), `ZY22KN6L89` (the real
  phone's own real, unique device ID — succeeded). `flutter devices`
  lists every real, currently-available `<device-id>` value.
- `adb devices -l` / `adb shell screencap -p <path>` / `adb pull` — real
  Android Debug Bridge commands, already installed since Lesson 1's own
  toolchain setup: listing authorized real devices, capturing a real
  on-device screenshot to a file on the phone itself, then copying that
  real file back to this machine.

### Run It

Real, run this session — every command and result above (Windows,
Chrome, and the real physical Android device) is pasted verbatim from
`verification/lesson-26/run-log.md`, not summarized from memory.

### Connect

`project/`'s own real app now runs, provably, on two real, independent
targets — Chrome and the real, physical Android device this curriculum's
own hard constraint always named — each proven by its own real
screenshot, not just a passing headless test. The tracked promise from
Lesson 1 is fulfilled.

---

## Connect the Pieces

Follow the literal word "Sudoku" through every unit this lesson built,
start to finish:

1. Concept Unit 1's real `flutter create --platforms=android,windows
   --org com.opencalc --project-name open_calc_sudoku .` generated
   `lib/main.dart` and the real native `android/`/`windows/` folders
   around `project/`'s own already-real Phase 1/2 files — but left
   `pubspec.yaml` untouched, a real, honest gap.
2. Concept Unit 2 closed that gap by hand, comparing against a genuinely
   fresh project's own real `pubspec.yaml`: `dependencies: flutter: sdk:
   flutter` is what finally let `main.dart`'s own
   `import 'package:flutter/material.dart'` — the same real import whose
   missing `dart:ui` broke plain `dart run` back in Lesson 25 — actually
   resolve.
3. Concept Unit 3 replaced the counter-app boilerplate `flutter create`
   generated with the smallest real thing that could launch:
   `runApp(const Placeholder())` — real, `flutter analyze`-clean, but
   not yet showing the word "Sudoku" anywhere.
4. Concept Unit 4 wrapped that in `MaterialApp(home: Placeholder())` —
   real Material theming and navigation infrastructure now exists above
   the tree, still with no real content of its own.
5. Concept Unit 5 replaced `Placeholder` with
   `Scaffold(appBar: AppBar(title: const Text('Sudoku')), body: const
   Center(child: Text('Board goes here')))` — the literal word "Sudoku"
   enters this project's own real, permanent source for the first time,
   real-proved by a real, permanent widget test
   (`main_smoke_test.dart`), run alongside Lesson 24's own real Phase 2
   suite, 9/9 passing.
6. Concept Unit 6 is where that same literal word finally reached a real
   screen, twice, independently: first in Chrome (`flutter run -d
   chrome`, a real, saved screenshot, an honestly-reported layout quirk
   and all), then, after a real, second occurrence of Lesson 1's own
   documented stale-shell-environment gotcha was diagnosed and fixed the
   same way Lesson 1 already taught, on the real, physical Motorola Razr
   2024 this whole curriculum's own hard constraint has named since
   Lesson 1 — a real screenshot, pulled directly off the device, showing
   "Sudoku" and "Board goes here" correctly rendered, genuinely
   centered, under a real Flutter debug banner.

`project/lib/sudoku_board.dart` — the entire, real, fully-tested Sudoku
engine Phase 2 built with zero Flutter dependency — has still not been
touched by anything in this lesson. That's deliberate, and exactly
curriculum's own point: this lesson only had to prove the screen half of
this project works, for real, on both a browser and the real target
device, before Lesson 34 is asked to connect it to the engine half
already sitting, untouched and already fully tested, one lesson away.
