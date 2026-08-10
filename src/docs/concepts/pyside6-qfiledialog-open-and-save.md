# Concept: `QFileDialog.getOpenFileName`/`getSaveFileName` and the Filter Syntax

**What you'll understand by the end:** how to open a real, native
"choose a file" dialog and its write-side sibling, "choose where to
save," with one static method call each, what their real (identical)
return shape is, and the small filter-string micro-syntax that controls
which files they show.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install PySide6`.

## The Problem

Letting a user pick a real file from disk — to open, or to choose where
to save a new one — needs a real, native file-picker dialog, the same
one their operating system already provides for every other
application, not a custom-built substitute. Building that from scratch
would be enormous real work for something every GUI toolkit already
provides as one call each.

## The Isolated Example

Opening an existing file:

```python
import sys
from unittest.mock import patch
from PySide6.QtWidgets import QApplication, QFileDialog

app = QApplication.instance() or QApplication(sys.argv)

# getOpenFileName needs a human at a real dialog in normal use;
# patched here only so this example can run headlessly.
with patch.object(
    QFileDialog, "getOpenFileName",
    return_value=("/tmp/report.csv", "CSV Files (*.csv)"),
):
    path, selected_filter = QFileDialog.getOpenFileName(
        None, "Choose a File", "", "CSV Files (*.csv);;All Files (*)"
    )

print("path:", path)
print("selected_filter:", selected_filter)
print("type of return value:", type((path, selected_filter)))
```

**Real output, run this session:**
```
path: /tmp/report.csv
selected_filter: CSV Files (*.csv)
type of return value: <class 'tuple'>
```

Choosing where to save a **new** file — the write-side sibling:

```python
import sys
from unittest.mock import patch
from PySide6.QtWidgets import QApplication, QFileDialog

app = QApplication.instance() or QApplication(sys.argv)

with patch.object(
    QFileDialog, "getSaveFileName",
    return_value=("/tmp/new-report.csv", "CSV Files (*.csv)"),
):
    path, selected_filter = QFileDialog.getSaveFileName(
        None, "Save As", "", "CSV Files (*.csv);;All Files (*)"
    )

print("path:", path)
print("selected_filter:", selected_filter)
print("same return shape as getOpenFileName:", isinstance((path, selected_filter), tuple))
```

**Real output, run this session:**
```
path: /tmp/new-report.csv
selected_filter: CSV Files (*.csv)
same return shape as getOpenFileName: True
```

**What this proves:** both methods always return a real 2-element
tuple — the chosen path (or an empty string if the user cancelled) and
which filter group was active when they picked it — never just a bare
path string on its own, and never a different shape between the "open"
and "save" cases. The only real difference between the two calls is
which native dialog appears and what it's *for* (choosing among
existing files vs. naming a new one); the method signature, filter
syntax, and return shape are identical.

## Mechanical Walkthrough

- `QFileDialog.getOpenFileName(parent, title, start_dir, filter_string)`
  and `QFileDialog.getSaveFileName(parent, title, start_dir,
  filter_string)` are both real **static methods** — called on the
  class itself, not on an instance; internally each constructs, shows,
  and tears down a real dialog, blocking until the user responds.
- The first return value is the chosen path as a plain `str` — real,
  empty string `""` specifically if the user cancelled, never `None`,
  for both methods identically.
- The second return value is which named filter group (below) was
  active — useful when a dialog offers several real file-type choices
  and the caller wants to know which one the user actually picked
  from or saved as.
- The filter string (`"CSV Files (*.csv);;All Files (*)"`) is its own
  small, real syntax: semicolon-**pairs** (`;;`) separate independent
  named groups, each written as `"Label (*.ext1 *.ext2 ...)"` — a
  single group can list more than one real glob pattern, space-
  separated inside its own parentheses. This syntax is shared,
  unchanged, between both methods.
- The real, meaningful difference is behavioral, not syntactic:
  `getOpenFileName`'s dialog only lets the user select a file that
  **already exists**; `getSaveFileName`'s dialog lets the user **type a
  new filename** that doesn't exist yet (and, on most real platforms,
  will prompt for confirmation if the typed name *does* already exist,
  since saving there would overwrite it).

## CS Lens

This is a **native OS integration point**: rather than the GUI toolkit
drawing its own file browser, it delegates to the operating system's
own real, already-familiar file picker — the same dialog every other
application on that machine uses, inheriting the user's own real
navigation habits, favorites, and recent-files list for free. Both the
open and save variants delegate to the same underlying native
mechanism, just configured for a different real purpose.

Also recognized in: every desktop GUI toolkit's equivalent (`<input
type="file">` in a browser delegates to the OS picker the identical
real way for opening; the browser's own download-location prompt is the
web's rough analogue for saving; Electron's `dialog.showOpenDialog`/
`dialog.showSaveDialog` mirror this exact open/save pairing) — a
consistent real pattern of "don't rebuild what the platform already
provides well."

## SE Lens

The real, practical value of the filter-string micro-syntax: it lets an
application scope what's *shown* (or, for saving, what extension gets
appended) by default, hiding irrelevant file types up front while still
offering an explicit "All Files" escape hatch for a real, edge-case file
the primary filter wouldn't match — a small, real usability decision
worth being deliberate about, not an arbitrary string to copy without
understanding. Keeping the open and save call sites' filter strings in
sync (both restricting to the same real file type) is a real, easy detail
to let drift if they're written independently rather than sharing one
constant.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md`. The real, un-mocked
version of either call requires an actual human at a real dialog — the
`unittest.mock.patch` used here to make this file runnable headlessly
is itself a real, general test-double technique, covered on its own
terms once a project's own tests need the identical real substitution
(see `pytest-monkeypatch-fixture.md` for that project's own real,
`pytest`-native equivalent, including a second real facet — replacing a
dialog call with a controlled return value to simulate a specific user
choice, exactly as done for `getSaveFileName` above).

## Try It Yourself

1. Change the filter string to offer three groups instead of two
   (`"Text Files (*.txt);;CSV Files (*.csv);;All Files (*)"`) and
   confirm the mocked return value's `selected_filter` can be any one
   of the three real strings, unchanged by which group is "first" —
   for both methods.
2. Remove the `unittest.mock.patch` around `getOpenFileName` and run it
   in a real, non-headless environment — confirm a real, native dialog
   actually appears, and that cancelling it (rather than picking a
   file) makes `path` come back as a real, empty string. Do the same for
   `getSaveFileName` and confirm you can type a filename that doesn't
   exist yet.
3. Look up `QFileDialog.getExistingDirectory` — a real, third sibling
   for picking a whole folder rather than a file — and note how much of
   its shape (return type, blocking-dialog behavior) you can already
   predict from these two.
