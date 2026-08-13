# Lesson 01: A Program That Builds Another Program

**What you will build:** the smallest possible Kivy app — one label,
on screen — run two ways: first directly on your own computer with an
ordinary `python main.py`, then packaged into a real, installable
Android APK and run on an actual phone. The transferable problem: this
series' real first subject isn't a language feature at all — it's the
pipeline itself. Writing Python that runs *as* Android is fundamentally
different from writing Python that runs *on* your computer: a separate
tool has to translate, compile, and package it first, and nothing
about that pipeline is optional or skippable.

**What you need to know first:** real, working Python — functions,
classes, `import`. This series does not re-teach the language itself,
only what's specific to building for Android with it.

**Terms introduced in this lesson:**
- **Kivy** — a cross-platform Python framework for building an
  application with a real, drawn user interface, running unchanged on
  Android, desktop, and other platforms.
- **Widget** — Kivy's base class for anything that can appear on
  screen — a label, a button, a layout that holds other widgets. Every
  visible thing in a Kivy app is a `Widget` or a subclass of one.
- **Root widget** — the one top-level widget an app's `build()` method
  hands back to Kivy. Every other widget an app ever shows is nested
  somewhere inside this one, directly or indirectly.
- **`python-for-android` / Buildozer** — the real toolchain that turns
  a Kivy app's plain Python source into an actual, installable Android
  package. `python-for-android` does the real work (bundling a real
  Python interpreter and your code together, compiling it against the
  Android SDK/NDK); Buildozer is the tool that drives it from one
  config file instead of many manual steps.
- **`buildozer.spec`** — the one file describing an app to Buildozer:
  its name, its package identifier, which Python packages it needs,
  and which Android permissions it requires.

**Objects and methods this lesson uses:**
- **`kivy.app.App`**
  - *What it is:* the base class every Kivy application's own main
    class inherits from.
  - *Implementation:* an abstract base class — subclassing it and
    implementing `build()` is the minimum needed for a real app;
    `.run()`, called once, starts Kivy's own event loop and keeps the
    app alive until the user closes it.
  - *Its use:* this lesson's own `MyApp` class, below, inherits from
    it directly.
- **`App.build()`**
  - *What it is:* the one method every subclass must implement.
  - *Implementation:* takes no arguments beyond `self`; must return a
    `Widget` — Kivy calls this once, automatically, when the app
    starts, and uses whatever it returns as the root widget.
  - *Its use:* returns this lesson's one `Label`, below.
- **`kivy.uix.label.Label`**
  - *What it is:* a widget that displays a single piece of text.
  - *Implementation:* constructed with a `text` keyword argument
    holding the string to display.
  - *Its use:* this lesson's entire visible UI — one label, nothing
    else.
- **`Logger`** (`kivy.logger`)
  - *What it is:* Kivy's own built-in logging object.
  - *Implementation:* imported from `kivy.logger`; methods like
    `.info(...)` and `.debug(...)` take one string, conventionally
    written as `"Category: message"` — the part before the colon
    becomes a label Kivy's own log output groups by, the same way a
    tag separates one source of log lines from another.
  - *Its use:* this lesson's own stand-in for proving code actually
    ran, the same role a printed line or a logged message plays in any
    environment without an attached interactive debugger.

---

## Concept Unit: Proving the App Itself Works, Before Involving Android at All

### The Problem

Building a real Android package is slow — realistically minutes, not
seconds, for `python-for-android` to compile a real Python interpreter
and every dependency against the Android toolchain, even for the
smallest possible app. Debugging a real mistake in the app's own
Python code by only ever testing it through that full Android build
cycle would make even a trivial typo expensive to find. Kivy's own
design allows something better: the exact same app code runs directly
on a desktop computer, with `python main.py`, in about as long as
starting any other Python script — a fast, cheap way to prove the
*app itself* is correct before ever asking Buildozer to package it.

### Step 1 — Prove It on the Desktop First

**Reference Source:** no reference counterpart — this is the first
lesson of a new series; there is no earlier project state to build on.
The minimal app shape below is confirmed against Kivy's own current
official documentation, fetched this session.

**Files affected:** a new file, `main.py`, in a new, empty project
folder.

**Change type:** new file.

**Dependencies:** a working Python installation and Kivy itself
(`pip install kivy`) — installed directly, no Buildozer involved yet,
since this step runs on the desktop only.

```python
from kivy.app import App
from kivy.uix.label import Label
from kivy.logger import Logger


class MyApp(App):
    def build(self):
        Logger.info("MyApp: build() called — about to return the root widget")
        return Label(text="Hello from Kivy")


if __name__ == "__main__":
    MyApp().run()
```

Run it — directly, with `python main.py`, no Android device or
Buildozer involved at all. A real window opens, showing the label.
Expected terminal output includes a real line similar to:

```
[INFO   ] [MyApp       ] build() called — about to return the root widget
```

This proves the actual app logic — the class, `build()`, the returned
`Label` — is correct, using the fastest possible feedback loop this
project will ever have. Nothing about Android has been touched yet.

### Step 2 — The Same Code, Packaged for a Real Phone

**Files affected:** the exact same `main.py` from Step 1, unchanged; a
new `buildozer.spec`, generated by Buildozer itself, then edited.

**Change type:** add (`buildozer.spec`), unchanged (`main.py`).

**Dependencies:** `pip install buildozer`, and Buildozer's own
underlying requirements (a Java JDK, the Android SDK/NDK, which
Buildozer downloads and manages on its first real build) — real,
first-time setup that easily takes longer than the build itself.
Linux or macOS natively; Windows requires WSL.

In the same folder as `main.py`, running `buildozer init` generates a
real, complete `buildozer.spec` — every field below already exists in
that generated file; only a few are worth understanding right away:

```ini
[app]
title = MyApp
package.name = myapp
package.domain = org.example
source.dir = .
source.include_exts = py,png,jpg,kv,atlas
version = 0.1
requirements = python3,kivy

[buildozer]
log_level = 2
```

- `title` — the name shown under the app's icon on the phone.
- `package.name` / `package.domain` — combine into Android's real,
  required package identifier (`org.example.myapp`) — the same kind of
  globally-unique reverse-domain name every Android app needs,
  regardless of what language built it.
- `requirements` — the real Python packages `python-for-android` must
  bundle into the app — `kivy` itself has to be listed explicitly, the
  same way any dependency would need declaring in an ordinary Python
  project's own requirements.

Building and running on a real, connected Android device:

```
buildozer android debug deploy run logcat
```

- `android debug` — build a real, installable, debug-signed APK.
- `deploy` — install it onto a connected device via `adb`.
- `run` — launch it.
- `logcat` — stream the device's real log output back to this
  terminal, live.

### Mechanical Walkthrough

- `from kivy.app import App` / `class MyApp(App)` — **first
  appearance**, full treatment above.
- `def build(self):` — **first appearance**, full treatment above.
- `Logger.info("MyApp: ...")` — **first appearance**, full treatment
  above (Objects and methods). The `"MyApp: "` prefix is this specific
  call's own chosen category, not a fixed part of the method itself —
  any string before the first colon works, and choosing one
  consistent per source of messages is what makes real log output
  filterable later.
- `return Label(text="Hello from Kivy")` — **first appearance of
  `Label`**, full treatment above. Constructed and returned in the
  same expression — nothing requires assigning it to a variable first
  when nothing else in this lesson needs to refer back to it.
- `if __name__ == "__main__":` — **ordinary Python, already assumed
  knowledge for this series** — included because it's genuinely part
  of the real file, not because it needs teaching here.
- `MyApp().run()` — **first appearance of `.run()`**, full treatment
  above (Objects and methods, under `App`).
- `buildozer init` — **first appearance.** Generates a complete,
  heavily-commented `buildozer.spec` — real Buildozer's own generated
  file has far more fields than shown above; the rest stay at their
  generated defaults until a later lesson needs to change one.
- `buildozer android debug deploy run logcat` — **first appearance.**
  Four distinct actions, chained in one command — each named
  individually above, since running only some of them (just `debug`,
  say, to build without installing) is a real, valid, separate choice
  later lessons and exercises will use.

### Execution Trace

**Honesty note this whole project commits to throughout:** this
session has no real phone, no desktop Python/Kivy environment, and no
working Buildozer toolchain to actually run either step against. Every line below is a predicted
result, based on Kivy's and Buildozer's own current, official
documentation, fetched and confirmed this session — not a captured
run. Confirm both steps for real, on your own machine, before trusting
these predictions.

1. `python main.py` (Step 1) — predict a real desktop window opens
   almost immediately, showing "Hello from Kivy," and the terminal
   shows the real `Logger.info` line before the window fully appears,
   since `build()` runs before the window is shown.
2. `buildozer init` — predict a real `buildozer.spec` file appears in
   the current folder, several dozen lines long, mostly comments.
3. `buildozer android debug deploy run logcat` (Step 2), run for the
   very first time — predict this takes real minutes, not seconds,
   while Buildozer downloads the Android SDK/NDK and compiles a real
   Python interpreter for Android; every later build of the same
   project, unchanged, should be noticeably faster.
4. Predict the same "Hello from Kivy" label appears on the real
   phone's screen, and the same `Logger.info` line appears in the live
   `logcat` stream in this lesson's terminal — the exact same
   application logic Step 1 already proved, now genuinely running as
   Android, not merely predicted to.

### CS Lens

**A build toolchain that itself runs on a general-purpose computer to
produce a program for a *different* target platform is called
cross-compilation.** Also recognized in: a C compiler targeting an
embedded microcontroller from a developer's desktop; a game engine's
editor, running on Windows, exporting a build for a game console; any
mobile app framework — this project's own Kivy/Buildozer pipeline is
one specific, real instance of a much older, general pattern. The
shared reasoning is identical every time it appears: the target device
is usually too slow, too resource-limited, or simply unable to run the
full compiler and toolchain itself, so a more capable machine builds
for it instead.

### SE Lens

**Why does Kivy's own design make Step 1 — running directly on the
desktop, no Android involved at all — possible in the first place,
rather than requiring every single test to go through a real Android
build?** Kivy's core deliberately depends on nothing Android-specific
— its widgets, its event loop, its own rendering are all implemented
to run identically on desktop Python. The real cost of this design:
anything that genuinely is Android-specific (reading a real sensor,
which this series gets to soon) cannot be tested this same fast way —
Step 1's speed is only available for the parts of an app that don't
touch real device hardware, which is exactly why this project treats
"does the app itself work" and "does it work as a real Android
package" as two separate, sequential questions instead of one.

---

## Connect the Pieces

`MyApp`, `build()`, and `Label` are the entire real application —
proven correct once, cheaply, directly on the desktop in Step 1,
before `buildozer.spec` or the Android toolchain ever entered the
picture. Step 2 changed nothing about that application code at all;
it only added the packaging description (`buildozer.spec`) and the
real build pipeline (`python-for-android`, driven by Buildozer) that
turns identical Python source into an actual, installable APK — the
cross-compilation relationship this lesson's CS Lens named directly.

## What Breaks Without This

Skip Step 1 entirely, and introduce a real typo directly into the
Android-only path — change `Label(text="Hello from Kivy")` to
`Lable(text="Hello from Kivy")` (a misspelled class name), then run
only `buildozer android debug deploy run logcat`.

Predicted result: several real minutes pass before Buildozer's own
build fails, with a genuine Python `NameError` buried inside a much
longer build log — the exact same error Step 1 would have shown
instantly, now costing a full build cycle to even discover. Restore
the correct spelling, and confirm for yourself, by running Step 1
first this time, how much faster the same real mistake is caught.

## Exercises

1. Change the label's text to something else, rerun Step 1, and
   confirm the desktop window reflects it immediately. Only once
   that's confirmed, rerun Step 2 and confirm the same change reaches
   the real phone.
2. Add a second `Logger.info(...)` call inside `build()`, with a
   different category prefix than `"MyApp: "`, and confirm both lines
   appear, distinguishable, in both Step 1's terminal output and Step
   2's real `logcat` stream.
3. Open the real, full `buildozer.spec` `buildozer init` generated on
   your own machine, and find three fields not mentioned in this
   lesson. For each one, read its own generated comment and write, in
   your own words, what it controls.

## Definition of Done

- [ ] You ran Step 1 for real, on your own computer, and saw a real
      desktop window with the label, plus the real `Logger.info` line
      in your terminal.
- [ ] You ran `buildozer init` for real and looked through the actual
      generated `buildozer.spec` file it produced.
- [ ] You ran Step 2 for real, on a real or emulated Android device,
      and saw the same app running as an actual Android package, with
      real `logcat` output reaching your terminal.
- [ ] You can explain, without looking, why this lesson proves the app
      on the desktop first instead of only ever testing through a real
      Android build.
- [ ] You triggered the real typo-based build failure from What Breaks
      Without This, read the real error Buildozer's build log
      produced, and compared how long it took to surface versus Step
      1's near-instant feedback.
- [ ] You can state, in your own words, what cross-compilation means
      and name one example of it besides this lesson's own
      Kivy/Buildozer pipeline.
- [ ] Commit: `main.py` and `buildozer.spec`, the start of a new
      project.
