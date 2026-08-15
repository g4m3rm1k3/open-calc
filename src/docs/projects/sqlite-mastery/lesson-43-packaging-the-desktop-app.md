# Lesson 43: Packaging the Desktop App

**What you will build:** a real, standalone executable —
`dist/app.exe` — that runs this entire project on a real machine with
no Python installation at all, plus the real fix for a genuine,
non-obvious bug packaging introduces on its own.

**What you need to know first:** [Lesson 42](lesson-42-running-the-backend-and-pywebview-together.md)
— `app.py`'s own real, complete, single-entry-point shape, the exact
file this lesson packages.

**Terms introduced in this lesson:**
- **PyInstaller** — a real, third-party tool (`pip install pyinstaller`)
  that analyzes a real Python script, finds every real module it
  imports, and bundles all of it — plus a real, embedded copy of the
  Python interpreter itself — into one real, standalone executable.

**Objects and methods used:**

**`sys._MEIPASS`**
- *What it is:* a real, genuine attribute PyInstaller adds to Python's
  own standard `sys` module — but only when the running code is inside
  a real, packaged one-file executable, never during ordinary
  `python app.py` development.
- *Implementation:* holds the real, absolute path to a real, temporary
  directory PyInstaller extracts the bundled application into at
  startup — the real, actual location any bundled data file (like
  `index.html`) lives at while the packaged app is running.
- *Its use:* correctly locating `index.html` from inside a real,
  packaged executable, where a plain relative path no longer resolves
  the way it does during development.

---

## Concept Unit: A Real, First Standalone Build

### The Problem

`python app.py` (Lesson 42) requires a real, working Python
installation, this project's own dependencies (`fastapi`, `uvicorn`,
`pywebview`) already installed, and the project's own source files
present. A real, non-developer user has none of that, and shouldn't
need to.

### Introduce the Concept in Isolation

```
$ pip install pyinstaller
$ pyinstaller --onefile --add-data "index.html;." app.py
```

```
...
12345 INFO: Building EXE from EXE-00.toc completed successfully.
```

A real, new `dist/` folder now contains `app.exe` (on Windows; a
real, extension-less `app` binary on macOS/Linux) — one real,
self-contained file, typically tens of megabytes, holding a real,
embedded Python interpreter, every real dependency this project
imports, and (per `--add-data`) a real, bundled copy of `index.html`.

### Discard

Nothing throwaway — this real build command, and the real `dist/app.exe`
it produces, are this project's own real, intended deliverable from
here forward.

### Mechanical Walkthrough

- `pyinstaller --onefile app.py` — **(a) first appearance**, full
  treatment above; `--onefile` — a real, specific PyInstaller option
  bundling everything into a single real executable, rather than a
  real folder of many separate files (PyInstaller's own other real,
  valid mode, `--onedir`, not used here).
- `--add-data "index.html;."` — **(a) first appearance**: PyInstaller's
  own real, automatic dependency analysis only follows Python `import`
  statements — it has no way to know `index.html` exists at all unless
  told explicitly; `"index.html;."` names the real, source file and
  `.`, the real, destination folder inside the bundle (the bundle's own
  root). The `;` separator is real and Windows-specific; macOS/Linux
  use a real `:` in the identical option instead.

### CS Lens

PyInstaller performs real, genuine **static dependency analysis** —
reading `app.py`'s own real `import` statements (and everything *those*
modules import, recursively) to build a real, complete list of what
must be bundled, the identical underlying technique a real compiler's
own linker uses to decide which libraries a compiled binary actually
needs.

### SE Lens

The real, honest tradeoff: a `--onefile` build's own real convenience
(one file to distribute) costs real, measurable startup time on every
single launch — the entire bundle has to be extracted to a real,
temporary location (this lesson's own next unit) before anything can
run, every time, since nothing persists between runs. PyInstaller's own
real `--onedir` mode avoids that repeated extraction cost, at the real
cost of distributing a real folder full of files instead of one — a
real, legitimate alternative this project doesn't choose, favoring
`--onefile`'s own simpler, single-artifact distribution story for a
project this size.

## Concept Unit: `sys._MEIPASS` — Finding `index.html` Inside the Bundle

### The Problem

`app.py`'s own real `webview.create_window("Pocket Hardware",
"index.html")` call uses a plain, relative path — correct during
`python app.py` development, when the real current directory genuinely
contains `index.html` right next to it. Does that same relative path
still resolve correctly once `--add-data` has bundled it *inside* a
real, packaged executable instead?

### Introduce the Concept in Isolation

Running `dist/app.exe` directly, with no other change to `app.py`:

```
$ dist/app.exe
```

A real, genuine failure — the native window either fails to open at
all or shows a real, blank/error page, because `"index.html"`, resolved
relative to wherever the packaged `.exe` happens to be *run from* (not
where its own bundled contents live), genuinely doesn't exist at that
real path. `--add-data` really did bundle the file — but bundled
*inside* the executable, extracted at real runtime to a real, different,
temporary location this code never asked about.

The real, correct fix:

```python
import sys
import os


def resource_path(relative_path):
    base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))
    return os.path.join(base_path, relative_path)


webview.create_window("Pocket Hardware", resource_path("index.html"))
```

Rebuilt and rerun:

```
$ pyinstaller --onefile --add-data "index.html;." app.py
$ dist/app.exe
```

The real, native window now opens correctly, `index.html` genuinely
found and loaded. `getattr(sys, "_MEIPASS", os.path.abspath("."))`
correctly resolves to two real, different real locations depending on
how this exact same code is currently running: the real, temporary
PyInstaller extraction folder when running as `dist/app.exe`, or the
real, ordinary current directory (unchanged from Lesson 42's own
behavior) when running as plain `python app.py` during development —
one real function, correct in both real contexts.

### Discard

Nothing throwaway — `resource_path` is a real, permanent, small utility
function, and every real file this project loads by relative path
(`index.html`, and any future static asset) should be looked up through
it from here on.

### Mechanical Walkthrough

- `base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))` — **(a)
  first appearance** of `sys._MEIPASS`, full treatment above;
  `getattr(sys, "_MEIPASS", default)` — **(a) first appearance** of
  Python's own real, built-in `getattr` with a real, explicit default —
  used specifically because `_MEIPASS` genuinely doesn't exist as an
  attribute at all outside a packaged build, and a plain `sys._MEIPASS`
  would raise a real `AttributeError` during ordinary development.
- `os.path.join(base_path, relative_path)` — **(a) first appearance**
  of Python's own standard, real, cross-platform path-joining function
  — correctly builds a real, valid path regardless of the real
  operating system's own path-separator convention.

### CS Lens

`resource_path`'s own real, dual behavior — correct both inside and
outside a packaged bundle — is a real, minimal instance of
**environment abstraction**: one real function hiding a genuine
difference between two real runtime contexts (a plain script, a
PyInstaller bundle) behind a single, consistent interface, so the rest
of `app.py` never needs its own `if` statement asking "am I bundled
right now?"

### SE Lens

The real, honest, further gap this lesson's own fix does not close,
worth naming directly rather than implying packaging is now fully
solved: `pocket_hardware.db` itself, if opened via a plain relative
path (`sqlite3.connect("pocket_hardware.db")`, this entire series' own
default), would resolve inside `sys._MEIPASS`'s own real, *temporary*
extraction folder too, once packaged — a real, serious problem, since
that folder is genuinely deleted after every run, meaning every real
write this project makes would silently vanish the moment the app
closes. The real, correct fix for a genuinely persistent database
belongs in a real, permanent, per-user location instead (a real,
standard OS-provided application-data folder, `Path.home() /
".pocket_hardware" / "pocket_hardware.db"`, say) — deliberately left as
this lesson's own exercise, both because implementing it is genuinely
straightforward given everything this lesson already taught, and
because leaving a known, real gap open honestly is more useful than
implying, incorrectly, that packaging alone made data persistence safe.

## Connect the pieces

One real, standalone `dist/app.exe`, built with `pyinstaller
--onefile --add-data`, bundling this entire project — backend, window,
and static UI — into a single real file requiring no Python
installation at all. `resource_path`, using the real, genuine
`sys._MEIPASS` attribute PyInstaller provides only inside a packaged
build, correctly closed the real gap between "where `index.html` lives
during development" and "where it actually ends up once bundled and
extracted at real runtime" — the same real fix this lesson's own SE
Lens named as still owed, honestly, to `pocket_hardware.db` itself.

## What breaks without this

Revert `resource_path` and rebuild, reproducing this lesson's own
original real failure on purpose, then check the packaged executable's
own real, temporary extraction folder directly while it's running (a
real path printable with `print(sys._MEIPASS)`, temporarily added for
this one diagnostic run):

```
$ dist/app.exe
C:\Users\...\AppData\Local\Temp\_MEI123456\
```

A real, genuine, temporary folder — confirming directly that
`index.html`'s own bundled copy really does exist somewhere real on
disk while the app runs, just never at the plain, relative path
`"index.html"` this code originally, incorrectly assumed. This is
direct, provable proof the original failure was a real path-resolution
bug, not a sign `--add-data` silently failed to bundle the file at all.

## Exercises

1. Implement the real, per-user database path fix this lesson's own SE
   Lens named directly — `Path.home() / ".pocket_hardware" /
   "pocket_hardware.db"`, created if it doesn't yet exist, used by
   `get_db` (Lesson 31) instead of the plain relative path this entire
   series has used until now. Confirm a real write made through the
   packaged `dist/app.exe` genuinely survives closing and reopening it.
2. Build a real `--onedir` version instead of `--onefile`, compare its
   own real startup time against the one-file build (`dist/app.exe`
   built earlier), and state, in your own words and based on what you
   directly observe, whether this lesson's own SE Lens claim about
   `--onefile`'s extraction cost is actually noticeable at this
   project's own current, real size.

## Definition of Done

- [ ] You built a real, standalone `dist/app.exe` with PyInstaller.
- [ ] You reproduced the real `index.html`-not-found failure and fixed
      it with `resource_path`/`sys._MEIPASS`.
- [ ] You confirmed the real, temporary extraction folder genuinely
      exists and contains the bundled file, using `sys._MEIPASS`
      directly.
- [ ] You completed both exercises, including the real, persistent
      per-user database path fix.

## Arc 5 complete

Seven lessons, and this project now has a real, complete desktop
application: a genuine native window (Lesson 37), jQuery and jQuery
DataTables rendering Arc 4's own real backend data (Lessons 38–39),
DataTables' own real server-side protocol correctly implemented against
real SQL (Lesson 40), full, real CRUD reachable directly from the UI
(Lesson 41), both halves launched together with a real, proven fix for
a genuine startup race condition (Lesson 42), and a real, standalone,
installable executable (this lesson). [Arc 6](lesson-44-handed-a-db-with-no-docs.md)
now deliberately leaves this project's own familiar `pocket_hardware.db`
behind, handing this exact application a second, real database it was
never designed around at all.
