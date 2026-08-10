# Concept: `QStandardPaths` — Finding the OS-Correct Place to Store App Data

**What you'll understand by the end:** how `QStandardPaths.
writableLocation(...)` asks the operating system for the real,
platform-correct directory an application should store its own data
in, instead of a hardcoded path — and a real, easy-to-miss
correctness gotcha: that location depends on the application having
set its own real, distinguishing name first.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Real, persistent application data (settings, a local database, cached
files) needs to live somewhere on disk — but "somewhere" genuinely
differs by operating system (`AppData\Roaming` on Windows,
`~/Library/Application Support` on macOS, `~/.local/share` on Linux),
and hardcoding any one of those paths directly breaks on every other
real platform. Worse, even the *correct*, platform-aware API can point
two different, unrelated applications at the **same real directory**
if neither one told the OS which distinct application it actually is.

## The Isolated Example

```python
print("BEFORE setApplicationName:")
print(QStandardPaths.writableLocation(QStandardPaths.StandardLocation.AppDataLocation))

app.setApplicationName("MyRealApp")

print("AFTER setApplicationName:")
print(QStandardPaths.writableLocation(QStandardPaths.StandardLocation.AppDataLocation))
```

**Real output, run this session:**
```
BEFORE setApplicationName:
C:/Users/g4m3r/AppData/Roaming/python

AFTER setApplicationName:
C:/Users/g4m3r/AppData/Roaming/MyRealApp
```

**What this proves:** before `setApplicationName` was ever called,
`AppDataLocation` genuinely resolved to a directory named `python` —
Qt fell back to the running interpreter's own generic name, since no
real, distinguishing application name had been given yet. **Any**
other PySide6/PyQt application on the same machine that also forgot
to set its own name would resolve to that identical `python`
directory — a real, silent collision waiting to happen. After
`setApplicationName("MyRealApp")`, the path correctly became specific
to this one real application.

## Mechanical Walkthrough

- `QStandardPaths.writableLocation(location_type)` asks the real,
  running operating system for the correct directory for a given
  purpose — `AppDataLocation` for general app data, with several other
  real, distinct location types available (documents, downloads,
  temp, etc.) for their own respective purposes.
- The **platform-specific** part of the resolved path (`AppData\
  Roaming` vs. `Library/Application Support` vs. `.local/share`) is
  handled entirely by Qt itself — application code never has to branch
  on `sys.platform` to get this right.
- The **application-specific** part of the path (the final folder
  name) is built from `QApplication`'s own `applicationName` — which
  defaults to something generic (the interpreter's own name, in a
  Python/PySide6 app) unless `setApplicationName(...)` is called
  explicitly, early, before any code relies on a path derived from it.
- Calling `setApplicationName` **after** some other code has already
  queried and used a stale path is too late for that earlier call —
  the real, correct discipline is calling it once, early, during
  application startup, before anything else touches
  `QStandardPaths`.

## CS Lens

This is a real instance of **platform abstraction** — code expresses
*intent* ("give me a place to store app data") and delegates the real,
concrete, platform-specific answer to a layer built to know the
correct convention for whichever OS is actually running, rather than
the application embedding that platform knowledge (and its own,
likely-incomplete cross-platform edge cases) directly.

Also recognized in: Node's `os.homedir()`/a cross-platform
`app-data-path`-style npm package; Python's own `platformdirs`
library (the identical real concept, standard-library-adjacent, for
non-Qt applications); any real framework's "conventions over
hardcoded paths" philosophy for where generated or persistent files
belong.

## SE Lens

The real, practical risk this step's own code fixes directly: two
completely unrelated, real applications — both built with PySide6,
both forgetting to call `setApplicationName` — would silently share
the identical `AppData\Roaming\python` directory, each one's real data
files sitting in the same folder as the other's, with genuine
potential for filename collisions or one application accidentally
reading the other's data. The fix costs exactly one real, explicit
line, called once, early — cheap insurance against a bug that would
otherwise only surface once a second such application happened to run
on the same real machine.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md` — `applicationName`
is a property of the same `QApplication` object every PySide6
application already constructs. A real, applied instance in this
project's own history: a tool library's own real, persistent SQLite
store, located via `QStandardPaths.writableLocation(AppDataLocation)`
— the real collision this file's own isolated example demonstrates
was an actual, caught bug in this project's own code, fixed by adding
an explicit `app.setApplicationName(settings.app_name)` call to
`main()`.

## Try It Yourself

1. Call `QStandardPaths.writableLocation` for a **different** real
   location type (`QStandardPaths.StandardLocation.DocumentsLocation`)
   and confirm it resolves to a real, sensible, completely different
   directory — proof this mechanism generalizes past just app data.
2. Set `applicationName` to two different real values in sequence,
   querying `AppDataLocation` after each — confirm the resolved path
   changes both times, direct proof the path is computed fresh from
   whatever the current `applicationName` happens to be, not cached
   from the first real call.
3. Research what `QStandardPaths.writableLocation` resolves to on a
   real macOS or Linux machine (if you don't have one available,
   check Qt's own documentation) and compare it directly to this
   file's own real Windows output — confirming the *shape* of the
   platform difference this abstraction is built to hide.
