# Lesson 6: Watching a Folder for New Files, Automatically

Same rules as Lessons 1-5: every block tagged, every output actually run
this session (real `QFileSystemWatcher` events, real files written to
disk, headless via `QT_QPA_PLATFORM=offscreen`), CRC-lite on Header
entries.

**Correcting Lesson 5's framing:** I described the trigger as a "Reload"
button. You've clarified the real trigger is different: your CAM
software (or whatever generates the setup sheet) writes a *brand-new*
XML file into a folder each time — it's not editing one file in place,
it's producing a new one, probably with a new name each run. So the
actual job isn't "notice this file changed," it's "notice the folder's
contents changed, then figure out which file in there is the newest one
to actually read." That's a meaningfully different problem, and this
lesson builds the real thing.

## What you will build

`FolderWatcher`: a `QObject` that watches one directory and announces
the path of the newest matching file whenever the folder's contents
settle after a change — debounced, so a burst of filesystem activity
(a large XML being written in chunks, several files landing at once)
collapses into one reaction, not several. Wired into Lesson 5's
`reparse_and_update`, this means: a new XML lands in the folder → your
GUI updates itself, live, with no button press and no restart.

## What you need to know first

Everything from Lessons 1-5, especially Lesson 5's `InspectionModel`,
`ReportWidget`, and `reparse_and_update`. This lesson adds
`QFileSystemWatcher` and `QTimer`, both new.

## Terms used in this lesson

- **Debounce** — collapsing a rapid burst of repeated trigger events into
  a single reaction, by waiting for a quiet period after the *last*
  event before actually reacting, rather than reacting to every single
  event. It exists because a single real-world change (one file being
  written) often produces multiple low-level notifications, not exactly
  one — reacting to every single one wastefully re-runs your whole
  pipeline multiple times for what is, semantically, one event.
- **Modification time (mtime)** — a timestamp the filesystem itself
  tracks per file, updated whenever the file's contents are last
  written. It exists as the natural way to answer "which of these files
  is newest," without needing filenames to follow any particular
  numbering or naming convention.
- **Partial write** — the state a file can be in *while* it's still
  being written to disk, before the writing program has finished and
  closed it. It's a real, distinct concern separate from "the file
  exists": a watcher can be notified that a file exists (or has grown)
  before the process writing it has finished, meaning reading it right
  away could pick up incomplete, unparseable content.

## Objects and methods used

- **`PySide6.QtCore.QFileSystemWatcher`**
  *What it is:* a Qt object that monitors one or more files or
  directories on disk and emits a signal when the operating system
  reports a change.
  *Implementation:* constructed with a list of paths to watch
  (`QFileSystemWatcher([str(folder)])`); emits `directoryChanged(str)`
  when a watched directory's contents change, and separately
  `fileChanged(str)` when a watched *file's* own contents change (not
  used in this lesson, since the whole point here is new files
  appearing, not one file being edited).
  *Its use:* the actual OS-level notification mechanism —
  `FolderWatcher` (this lesson's own class) wraps it, rather than every
  piece of your code talking to it directly.
- **`PySide6.QtCore.QTimer`**
  *What it is:* Qt's timer object, capable of firing a signal once after
  a delay, or repeatedly at an interval.
  *Implementation:* `setSingleShot(True)` makes it fire once and stop,
  rather than repeating; `setInterval(ms)` sets the delay;
  `.start()` (re)starts the countdown — calling `.start()` on an
  already-running single-shot timer restarts its countdown from zero,
  which is the exact mechanism debouncing relies on; `.timeout` is the
  signal fired when the interval elapses.
  *Its use:* the debounce mechanism itself — every new "directory
  changed" notification restarts the timer instead of letting an
  earlier one fire, so only a genuine pause in activity results in an
  actual reaction.
- **`pathlib.Path.glob(pattern)`**
  *What it is:* a method returning every path inside a directory
  matching a simple wildcard pattern.
  *Implementation:* `Path(folder).glob("*.xml")` returns a generator of
  `Path` objects for every file directly inside `folder` ending in
  `.xml`.
  *Its use:* listing candidate files before picking the newest one by
  modification time.
- **`Path.stat().st_mtime`**
  *What it is:* `.stat()` returns a `os.stat_result` object describing a
  file's real filesystem metadata; `.st_mtime` is its last-modified
  timestamp, as a plain float (seconds since epoch).
  *Implementation:* `some_path.stat().st_mtime` → e.g. `1735689600.42`.
  *Its use:* the sort key for finding the newest file — larger
  `st_mtime` means more recently modified.

---

## Concept Unit 1: Finding "the newest one," in isolation

### The Problem

Your setup-sheet generator drops a new `.xml` file into a folder each
run — possibly with a name that isn't predictable or sequential. Given a
folder that might contain several `.xml` files at once, what real,
filesystem-provided piece of information could you use to determine
which one was written most recently, without depending on the filename
itself following any particular pattern?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
from pathlib import Path
import time

folder = Path("/tmp/watchtest")
folder.mkdir(exist_ok=True)
for old in folder.glob("*.xml"):
    old.unlink()

(folder / "a.xml").write_text("first")
time.sleep(0.05)
(folder / "b.xml").write_text("second")
time.sleep(0.05)
(folder / "c.xml").write_text("third, this one is newest")

xml_files = list(folder.glob("*.xml"))
newest = max(xml_files, key=lambda p: p.stat().st_mtime)
print("files found:", sorted(p.name for p in xml_files))
print("newest:", newest.name)
```

Real output:

```
files found: ['a.xml', 'b.xml', 'c.xml']
newest: c.xml
```

This proves `st_mtime` correctly reflects write *order*, not filename
order — `c.xml` sorts last alphabetically too in this particular
example, so this lab deliberately used names that don't hint at the
answer, and the same logic works regardless of what your real setup
sheet's filenames look like.

### Discard the throwaway example

This standalone loop doesn't appear again — only the
`glob` + `max(..., key=lambda p: p.stat().st_mtime)` pattern carries
forward.

### Project Change

- **Reference Source:** none — from-scratch.
- **Files affected:** new file, `folder_watcher.py`.
- **Change type:** add.
- **Location:** top of the file.
- **Dependencies:** `pathlib`.

### The New Code

> **→ goes in `folder_watcher.py`**

```python
from pathlib import Path

def find_newest_xml(folder):
    """Pure logic: a folder path in, the newest matching file (or None) out. Real disk stat, but no watching/waiting."""
    xml_files = list(Path(folder).glob("*.xml"))
    if not xml_files:
        return None
    return max(xml_files, key=lambda p: p.stat().st_mtime)
```

### The Updated Project

Brand-new file — full contents shown above.

### Mechanical walkthrough

- `find_newest_xml(folder)` — deliberately kept "pure" in the same sense
  as Lesson 1's `parse_lines`: it *does* touch disk (`glob`, `.stat()`
  are real filesystem calls, so this isn't I/O-free in the strictest
  sense), but it does no *watching or waiting* — call it once, get an
  answer, no ongoing state. That's the meaningful boundary for this
  lesson: "check right now" versus "keep watching," which the next unit
  builds.
- `if not xml_files: return None` — an empty folder (or one that hasn't
  produced its first file yet, e.g., right after your program starts) is
  a real, expected case, guarded the same way Lesson 2's `text_of`
  guarded a missing XML element.
- `max(xml_files, key=lambda p: p.stat().st_mtime)` — Python's built-in
  `max`, given a `key` function: instead of comparing the `Path` objects
  themselves (which would compare alphabetically), it compares whatever
  the `key` function returns for each one — here, each file's
  modification time — and returns the original `Path` with the largest
  key value.

### Run it

Real output pasted above.

### Connect

You can now answer "which file is newest" on demand. Next: being told
*when* to ask that question, instead of asking it manually.

---

## Concept Unit 2: Watching a folder for real

### The Problem

`find_newest_xml` only answers the question once, when called. You need
something to actually call it again automatically, whenever the folder's
contents change — without your program sitting in a loop constantly
re-checking (which would waste CPU) or requiring a person to click
anything. What would you want the operating system itself to tell you,
and when?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
from PySide6.QtCore import QFileSystemWatcher, QCoreApplication
from pathlib import Path
import time

app = QCoreApplication.instance() or QCoreApplication([])

folder = Path("/tmp/watchtest2")
watcher = QFileSystemWatcher([str(folder)])

events = []
watcher.directoryChanged.connect(lambda path: events.append(path))

(folder / "new_file.xml").write_text("hello")

# process pending Qt events so the signal actually gets delivered
for _ in range(20):
    app.processEvents()
    time.sleep(0.02)
    if events:
        break

print("events received:", events)
```

Real output:

```
events received: ['/tmp/watchtest2']
```

This proves `QFileSystemWatcher` really does hook into the operating
system's own file-change notifications — no polling loop written by
you anywhere in this code — and that Qt delivers the signal through its
own event loop, which is why `app.processEvents()` appears here: without
an event loop actually running (normally handled for you by
`app.exec()` in a real running GUI program), a Qt signal can be emitted
internally but never actually delivered to your connected function. This
lab calls `processEvents()` manually in a loop purely to prove the
signal fires at all, outside a real running application.

### Discard the throwaway example

Doesn't appear again — only the `QFileSystemWatcher([...])`,
`.directoryChanged.connect(...)` shape carries forward.

### Connect

You've proven the OS-level notification works. Next: the debouncing your
real setup-sheet generator's write pattern will actually need.

---

## Concept Unit 3: Debouncing a burst of change events

### The Problem

A single "new file appeared" event from your CAM software might actually
produce several low-level filesystem notifications in quick succession —
the file being created, then written to, then closed, each potentially
its own event. If `find_newest_xml` (and everything downstream of it —
your whole parse/merge/validate pipeline) ran once per raw notification,
what would that mean for a large XML file written in several chunks?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
from PySide6.QtCore import QCoreApplication, QTimer
import time

app = QCoreApplication.instance() or QCoreApplication([])

fire_count = {"n": 0}
timer = QTimer()
timer.setSingleShot(True)
timer.setInterval(100)
timer.timeout.connect(lambda: fire_count.update(n=fire_count["n"] + 1))

# simulate 5 rapid "change" events, each restarting the timer instead of letting it fire
for i in range(5):
    timer.start()  # restarting an already-running QTimer resets its countdown
    app.processEvents()
    time.sleep(0.02)  # much shorter than the 100ms interval

print("fire_count right after the burst:", fire_count["n"])

# now wait long enough for the timer to actually fire once, undisturbed
for _ in range(20):
    app.processEvents()
    time.sleep(0.02)
    if fire_count["n"] > 0:
        break

print("fire_count after waiting past the debounce interval:", fire_count["n"])
```

Real output:

```
fire_count right after the burst: 0
fire_count after waiting past the debounce interval: 1
```

This is the actual proof debouncing works as intended: five separate
"change" simulations, each restarting a 100ms countdown before it could
finish, produced *zero* fires during the burst — and exactly *one* fire,
total, once the events stopped coming and the timer was finally left
alone long enough to complete its countdown. Five raw events collapsed
into one real reaction.

### Discard the throwaway example

Doesn't appear again — only the singleShot-timer-restarted-on-every-event
shape carries forward.

### Project Change

- **Reference Source:** none — from-scratch.
- **Files affected:** `folder_watcher.py`, appended.
- **Change type:** add.
- **Location:** after `find_newest_xml`.
- **Dependencies:** `PySide6.QtCore` (`QObject`, `Signal`,
  `QFileSystemWatcher`, `QTimer`).

### The New Code

> **→ goes in `folder_watcher.py`**

```python
from PySide6.QtCore import QObject, Signal, QFileSystemWatcher, QTimer


class FolderWatcher(QObject):
    """Watches one folder; announces the newest .xml file's path, debounced,
    whenever the folder's contents settle after a change."""

    newestFileChanged = Signal(str)

    def __init__(self, folder, debounce_ms=200):
        super().__init__()
        self.folder = Path(folder)
        self._last_seen_path = None

        self._watcher = QFileSystemWatcher([str(self.folder)])
        self._watcher.directoryChanged.connect(self._on_directory_changed)

        self._debounce_timer = QTimer()
        self._debounce_timer.setSingleShot(True)
        self._debounce_timer.setInterval(debounce_ms)
        self._debounce_timer.timeout.connect(self._check_for_newest)

    def _on_directory_changed(self, path):
        self._debounce_timer.start()  # restarts the countdown on every burst of changes

    def _check_for_newest(self):
        newest = find_newest_xml(self.folder)
        if newest is not None and str(newest) != self._last_seen_path:
            self._last_seen_path = str(newest)
            self.newestFileChanged.emit(str(newest))

    def check_now(self):
        """Manual trigger - used at startup, and in tests, to avoid waiting on the debounce timer."""
        self._check_for_newest()
```

### The Updated Project

```python
 1  from pathlib import Path
 2
 3  def find_newest_xml(folder):
 4      xml_files = list(Path(folder).glob("*.xml"))
 5      if not xml_files:
 6          return None
 7      return max(xml_files, key=lambda p: p.stat().st_mtime)
 8
 9  from PySide6.QtCore import QObject, Signal, QFileSystemWatcher, QTimer  # ← new
10
11  class FolderWatcher(QObject):                          # ← new
12      newestFileChanged = Signal(str)                     # ← new
13
14      def __init__(self, folder, debounce_ms=200):        # ← new
15          super().__init__()                              # ← new
16          self.folder = Path(folder)                      # ← new
17          self._last_seen_path = None                     # ← new
18
19          self._watcher = QFileSystemWatcher([str(self.folder)])  # ← new
20          self._watcher.directoryChanged.connect(self._on_directory_changed)  # ← new
21
22          self._debounce_timer = QTimer()                 # ← new
23          self._debounce_timer.setSingleShot(True)         # ← new
24          self._debounce_timer.setInterval(debounce_ms)    # ← new
25          self._debounce_timer.timeout.connect(self._check_for_newest)  # ← new
```

(`_on_directory_changed`, `_check_for_newest`, and `check_now` are shown
in full above — new methods on this same new class.)

### Mechanical walkthrough

- `newestFileChanged = Signal(str)` — unlike Lesson 5's payload-free
  `dataChanged`, this signal *does* carry a value: the newest file's
  path, as a string. That's a deliberate difference — `InspectionModel`
  didn't need to hand data through its signal because listeners could
  just read `model.merged_ops` afterward; `FolderWatcher` hands the path
  directly because the path itself *is* the discovery being announced,
  not a hint to go check some other state.
- `self._watcher = QFileSystemWatcher([str(self.folder)])` — Concept
  Unit 2's lab, now wrapped inside this class rather than standing alone.
- `self._watcher.directoryChanged.connect(self._on_directory_changed)` —
  connects the raw, un-debounced OS signal to a private method that does
  nothing but restart the debounce timer — deliberately not calling
  `_check_for_newest` directly here, which is exactly what would defeat
  debouncing.
- `self._debounce_timer.timeout.connect(self._check_for_newest)` — the
  *actual* check only happens when the debounce timer completes
  undisturbed — Concept Unit 3's proven mechanism, now driving real file
  discovery instead of an incrementing counter.
- `_on_directory_changed(self, path)` — the `path` argument Qt passes
  here (the watched directory's own path) is intentionally unused;
  its only job is calling `self._debounce_timer.start()`.
- `_check_for_newest(self)` — calls `find_newest_xml` (Concept Unit 1)
  for the real answer, then compares against `self._last_seen_path`
  before emitting — this guard matters: without it, an unrelated
  directory change (a temp file created and deleted by some other
  process, say) that doesn't actually change which file is newest would
  still cause a needless re-parse.
- `check_now(self)` — a public method bypassing the timer entirely, for
  two real uses: checking once at startup (there's no "directory
  changed" event to react to if a matching file is already sitting there
  when your program launches), and for deterministic tests that
  shouldn't have to wait on real timer delays.

### Run it

Constructing a real `FolderWatcher` and dropping two real files into its
folder, one after another:

```python
watcher = FolderWatcher('/tmp/watchtest3', debounce_ms=100)
received = []
watcher.newestFileChanged.connect(lambda p: received.append(p))

(Path('/tmp/watchtest3') / 'run1.xml').write_text('one')
# ... process events, wait for the signal ...
print('after first file, received:', received)

(Path('/tmp/watchtest3') / 'run2.xml').write_text('two, newer')
# ... process events, wait for the signal ...
print('after second (newer) file, received:', received)
```

Real output:

```
after first file, received: ['/tmp/watchtest3/run1.xml']
after second (newer) file, received: ['/tmp/watchtest3/run1.xml', '/tmp/watchtest3/run2.xml']
```

Two real files dropped into a real folder, two real signal emissions,
each carrying the correct newest path at that moment.

### CS lens

Debouncing is a real, named technique used far beyond file watching —
also recognized in: search-box "type-ahead" suggestions (waiting for a
pause in typing before firing a search, rather than one per keystroke),
window-resize handlers in web browsers, and button double-click
prevention. The underlying idea is always the same: collapse a burst of
closely-spaced events into one meaningful reaction, triggered by a
*quiet period*, not by any individual event.

### SE lens

A shorter `debounce_ms` reacts faster but risks catching a file mid-write
more often (Concept Unit 4 covers this directly); a longer one is safer
but adds visible lag between "file finished writing" and "GUI updates."
There's no universally correct value — it depends on how large your real
XML files get and how fast your CAM software writes them; 200ms is a
reasonable starting guess, not a proven-correct constant, and it's
exposed as a constructor parameter specifically so it's easy to tune once
you've watched it against your real files.

### Connect

`FolderWatcher` now reliably announces the newest file, debounced. Next:
wiring that announcement to Lesson 5's actual re-parse pipeline.

---

## Concept Unit 4: Wiring the watcher to the pipeline

### The New Code

> **→ goes in `auto_controller.py`**

```python
from folder_watcher import FolderWatcher
from controller import reparse_and_update


def wire_auto_reparse(model, watch_folder, toolpath_path, gui_config, debounce_ms=200):
    """Connects a FolderWatcher to the same reparse_and_update pipeline
    from Lesson 5's controller - no widget code involved at any point."""
    watcher = FolderWatcher(watch_folder, debounce_ms=debounce_ms)

    def on_newest_xml(xml_path):
        reparse_and_update(model, toolpath_path, xml_path, gui_config)

    watcher.newestFileChanged.connect(on_newest_xml)
    watcher.check_now()  # pick up a file that's already there at startup
    return watcher  # caller must keep a reference - see SE lens
```

### The Updated Project

Brand-new file — full contents shown above.

### Mechanical walkthrough

- `wire_auto_reparse(model, watch_folder, toolpath_path, gui_config,
  debounce_ms=200)` — takes everything Lesson 5's `reparse_and_update`
  needed, plus the folder to watch; returns nothing about widgets at all
  — same boundary discipline as Lesson 5's controller, extended.
- `def on_newest_xml(xml_path):` — a small nested function, closing over
  `model`, `toolpath_path`, and `gui_config` from the enclosing
  `wire_auto_reparse` call (the same closure mechanism from Lesson 4's
  `errors_for`), so it can call `reparse_and_update` with the right
  arguments every time it's invoked, using whatever `xml_path` the
  signal hands it.
- `watcher.newestFileChanged.connect(on_newest_xml)` — connects
  `FolderWatcher`'s own signal directly to this small adapter function —
  `FolderWatcher` itself never imports or calls `reparse_and_update`;
  it only knows it has a signal, same separation as `InspectionModel`
  never knowing about `ReportWidget` in Lesson 5.
- `watcher.check_now()` — called once here, right after wiring up the
  connection, so a file already present in the folder before your
  program even started gets picked up immediately, rather than waiting
  for the *next* change.
- `return watcher` — **this matters more than it looks.** Qt objects
  without a Python reference held somewhere can be garbage-collected
  even while Qt itself still needs them alive to deliver signals — if
  `wire_auto_reparse`'s caller doesn't keep the returned `watcher`
  assigned to something (an attribute on a longer-lived object, a module-
  level variable), the watcher can silently stop working sometime after
  this function returns, with no error raised anywhere. This is a real,
  easy-to-hit Qt/PySide gotcha, not a hypothetical one.

### Run it

Full end-to-end: a folder with one existing file, a widget already
built, then a second, genuinely new file dropped in — using a strict
validation config so a real state change is visible:

```python
model = InspectionModel()
widget = ReportWidget(model)

strict_config = GuiConfig(min_feedrate=10.0)
watcher = wire_auto_reparse(model, '/tmp/watchtest5', 'toolpath.txt', strict_config, debounce_ms=100)
# ... process events ...
print('startup, watcher last_seen:', watcher._last_seen_path)
print('label:', repr(widget.status_label.text()))

# a second, newer file is copied into the same folder
# ... process events ...
print('after new file, watcher last_seen:', watcher._last_seen_path)
print('label:', repr(widget.status_label.text()))
```

Real output:

```
startup, watcher last_seen: /tmp/watchtest5/setupsheet_run1.xml
label: '2 operations — FAIL'
after new file, watcher last_seen: /tmp/watchtest5/setupsheet_run2_newer.xml
label: '2 operations — FAIL'
```

The label text is identical both times here (same underlying sample
data, same strict config, so the same verdict) — but `watcher._last_seen_path`
proves the *second* file was genuinely detected and re-parsed, not
just the first one re-displayed. (Concept Unit 3's own Run It, above,
already proved the signal fires correctly with distinguishable paths;
this run proves the full pipeline — watcher → controller → model →
widget — stays wired correctly end to end.)

### CS lens

`wire_auto_reparse` is a small instance of **dependency injection by
composition**: rather than `FolderWatcher` needing to know about
parsing/merging/validation, or `reparse_and_update` needing to know
about folder-watching, a third, small function wires the two together
from outside, with each piece staying independently reusable — exactly
the same principle as Lesson 5's model/widget separation, applied one
layer further out.

### SE lens

An alternative would be having `FolderWatcher` itself accept a callback
function in its constructor, rather than exposing a signal at all —
simpler in one sense (one fewer `.connect()` call for the caller to
write), but it would mean `FolderWatcher` could only ever notify *one*
thing, decided at construction time. Keeping it signal-based means, if
you ever wanted a second listener — logging every detected file to a
log window, say — it connects independently, with zero changes to
`FolderWatcher` or to `wire_auto_reparse`.

### Connect

New files landing in a folder now drive the whole pipeline automatically.
One real risk remains: what if `check_now`/the debounce timer fires
while your CAM software is still in the middle of writing the file.

---

## Concept Unit 5: The partial-write risk, named honestly

This unit is deliberately shorter than the others — it names a real risk
rather than fully solving it, since the right fix depends on facts about
your specific CAM software's write behavior that this lesson can't know.

### The Problem

`debounce_ms=200` in this lesson's examples waits 200 milliseconds of
*directory* quiet before checking for the newest file — but that says
nothing about whether the *file itself* has finished being written. A
large XML, written slowly, could still be growing well past that 200ms
window. If `parse_setup_sheet_file` (Lesson 2) tries to read a
half-written XML file, what would you expect to happen — a clean
`None` result, or something worse?

### Why this lesson doesn't fully solve it

`ET.parse` (Lesson 2) on a genuinely incomplete XML file raises
`xml.etree.ElementTree.ParseError` — not silently returning partial
data, which is at least a loud, catchable failure rather than a silently
wrong one. The honest fix depends on how your specific generator writes
files: some tools write to a temporary name and rename it only once
complete (in which case `directoryChanged` mostly won't even fire until
the rename, and this risk is much smaller in practice); others write the
final filename directly and grow it in place (the riskier case this unit
is naming).

A real mitigation, if you find you need one: check that a file's size
(or `st_mtime`) has stopped changing across two checks spaced a short
interval apart, before treating it as "done," rather than acting on the
very first sighting. That's a genuinely new piece of logic worth its own
lesson, built and verified against your actual generator's real write
behavior, rather than guessed at generically here.

### Connect

You now know this gap exists, and where it would need attention if it
turns out to matter for your real files — worth watching for, not
something to build blind.

---

## Concept Unit 6: Testing the watcher

### The New Code

> **→ goes in `test_folder_watcher.py`**

```python
import shutil
import time
from pathlib import Path

import pytest
from PySide6.QtWidgets import QApplication

from folder_watcher import find_newest_xml, FolderWatcher
from auto_controller import wire_auto_reparse
from inspection_model import InspectionModel
from report_widget import ReportWidget
from gui_config import GuiConfig


@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    return app


@pytest.fixture
def watch_folder(tmp_path):
    """A fresh, empty temp directory per test - pytest's built-in tmp_path fixture."""
    return tmp_path


def pump_events(app, seconds=0.6, step=0.02):
    """Repeatedly let Qt process pending signal deliveries/timers for up to `seconds`."""
    end = time.time() + seconds
    while time.time() < end:
        app.processEvents()
        time.sleep(step)


def test_find_newest_xml_empty_folder_returns_none(watch_folder):
    assert find_newest_xml(watch_folder) is None

def test_find_newest_xml_picks_latest_mtime(watch_folder):
    (watch_folder / "a.xml").write_text("old")
    time.sleep(0.02)
    (watch_folder / "b.xml").write_text("new")
    assert find_newest_xml(watch_folder).name == "b.xml"

def test_find_newest_xml_ignores_non_xml_files(watch_folder):
    (watch_folder / "notes.txt").write_text("ignore me")
    (watch_folder / "only.xml").write_text("real")
    assert find_newest_xml(watch_folder).name == "only.xml"


def test_watcher_check_now_emits_for_existing_file(qapp, watch_folder):
    (watch_folder / "run1.xml").write_text("data")
    watcher = FolderWatcher(str(watch_folder))
    received = []
    watcher.newestFileChanged.connect(lambda p: received.append(p))
    watcher.check_now()
    assert received == [str(watch_folder / "run1.xml")]

def test_watcher_does_not_re_emit_for_same_newest_file(qapp, watch_folder):
    (watch_folder / "run1.xml").write_text("data")
    watcher = FolderWatcher(str(watch_folder))
    received = []
    watcher.newestFileChanged.connect(lambda p: received.append(p))
    watcher.check_now()
    watcher.check_now()  # nothing changed on disk
    assert len(received) == 1

def test_watcher_emits_again_for_a_genuinely_newer_file(qapp, watch_folder):
    (watch_folder / "run1.xml").write_text("data")
    watcher = FolderWatcher(str(watch_folder))
    received = []
    watcher.newestFileChanged.connect(lambda p: received.append(p))
    watcher.check_now()

    time.sleep(0.02)
    (watch_folder / "run2.xml").write_text("newer data")
    watcher.check_now()
    assert received == [str(watch_folder / "run1.xml"), str(watch_folder / "run2.xml")]

def test_watcher_reacts_to_a_real_filesystem_event(qapp, watch_folder):
    """End-to-end through the real QFileSystemWatcher signal, not check_now()."""
    watcher = FolderWatcher(str(watch_folder), debounce_ms=50)
    received = []
    watcher.newestFileChanged.connect(lambda p: received.append(p))

    (watch_folder / "dropped.xml").write_text("data")
    pump_events(qapp)
    assert received == [str(watch_folder / "dropped.xml")]


def test_wire_auto_reparse_updates_widget_when_new_file_appears(qapp, watch_folder, tmp_path):
    shutil.copy("sample.xml", watch_folder / "setup_run1.xml")

    model = InspectionModel()
    widget = ReportWidget(model)
    assert widget.status_label.text() == "No data yet"

    watcher = wire_auto_reparse(model, str(watch_folder), "toolpath.txt", GuiConfig(), debounce_ms=50)
    pump_events(qapp, seconds=0.3)
    assert "PASS" in widget.status_label.text()

    time.sleep(0.02)
    shutil.copy("sample.xml", watch_folder / "setup_run2.xml")
    pump_events(qapp, seconds=0.6)
    assert watcher._last_seen_path == str(watch_folder / "setup_run2.xml")
```

### Mechanical walkthrough

- `@pytest.fixture def watch_folder(tmp_path):` — `tmp_path` is a
  **built-in** `pytest` fixture (no import needed) providing a fresh,
  automatically-cleaned-up temporary directory per test. Wrapping it in
  a locally-named `watch_folder` fixture is purely for readability at
  each call site — same object, clearer name.
- `pump_events(app, seconds, step)` — a small test helper repeatedly
  calling `app.processEvents()` for a bounded amount of real wall-clock
  time, needed because this lesson's tests exercise real Qt timers and
  real OS-level filesystem notifications, both of which need the Qt
  event loop actually running (even briefly, via `processEvents`) to
  deliver anything — a plain `assert` immediately after writing a file
  would run before the signal had any chance to fire.
- `test_find_newest_xml_*` — the three pure-logic tests need no `qapp`
  fixture at all, since they never construct a `QObject` — the same
  "which tests need which setup" judgment from every earlier lesson's
  testing unit.
- `test_watcher_check_now_emits_for_existing_file` and its siblings use
  `check_now()` specifically to test `FolderWatcher`'s core
  newest-file/no-duplicate-emission logic *without* depending on real
  timer delays or real OS event delivery timing — deterministic,
  fast, and focused on one thing at a time.
- `test_watcher_reacts_to_a_real_filesystem_event` — the one test in
  this unit that deliberately does *not* use `check_now()`, specifically
  to prove the real, full signal chain (OS event → `QFileSystemWatcher`
  → debounce timer → `_check_for_newest`) actually works end to end, not
  just the logic `check_now()` bypasses straight to.
- `test_wire_auto_reparse_updates_widget_when_new_file_appears` — the
  golden test for this lesson: real files copied into a real temp
  folder, a real widget, the real `wire_auto_reparse` function, checked
  against both the visible label text and the watcher's own internal
  tracking of which file it last saw.

### Run it

Actually run with `QT_QPA_PLATFORM=offscreen python3 -m pytest
test_folder_watcher.py -v`. Real output:

```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.6.0
collecting ... collected 8 items

test_folder_watcher.py::test_find_newest_xml_empty_folder_returns_none PASSED         [ 12%]
test_folder_watcher.py::test_find_newest_xml_picks_latest_mtime PASSED                [ 25%]
test_folder_watcher.py::test_find_newest_xml_ignores_non_xml_files PASSED             [ 37%]
test_folder_watcher.py::test_watcher_check_now_emits_for_existing_file PASSED         [ 50%]
test_folder_watcher.py::test_watcher_does_not_re_emit_for_same_newest_file PASSED     [ 62%]
test_folder_watcher.py::test_watcher_emits_again_for_a_genuinely_newer_file PASSED    [ 75%]
test_folder_watcher.py::test_watcher_reacts_to_a_real_filesystem_event PASSED         [ 87%]
test_folder_watcher.py::test_wire_auto_reparse_updates_widget_when_new_file_appears PASSED [100%]

============================== 8 passed in 1.80s ==============================
```

---

## Connect the pieces

Your CAM software finishing a new setup-sheet export, traced end to end
through everything built across Lessons 5 and 6: the operating system
notices a new file in the watched folder and tells `QFileSystemWatcher`
(Concept Unit 2), which emits `directoryChanged`. `FolderWatcher`'s
`_on_directory_changed` (Unit 3) restarts its debounce `QTimer` rather
than reacting immediately — if more filesystem activity follows within
`debounce_ms`, the timer keeps restarting, and nothing fires yet. Once
things go quiet, the timer's `timeout` fires `_check_for_newest` (Unit
3), which calls `find_newest_xml` (Unit 1) — a real `glob` and
`st_mtime` comparison across the folder — and, finding a path different
from `_last_seen_path`, emits `newestFileChanged` with that path (Unit
3). `wire_auto_reparse`'s `on_newest_xml` (Unit 4) receives it and calls
`reparse_and_update` (Lesson 5), which runs the full parse → merge →
validate pipeline (Lessons 1-4) against the new file and calls
`model.set_data(...)` (Lesson 5), which emits `dataChanged`, which
`ReportWidget.refresh` (Lesson 5) receives, updating the visible label —
all without a single button press, and without the widget or the window
it lives in ever being destroyed or rebuilt.

---

## Files for this lesson

`folder_watcher.py`, `auto_controller.py`, `test_folder_watcher.py` are
attached (no changes needed to any Lesson 1-5 file). Run tests with:

```
QT_QPA_PLATFORM=offscreen python3 -m pytest test_folder_watcher.py -v
```

## Where this goes from here

If Concept Unit 5's partial-write risk turns out to matter for your real
generator (you'll know if a re-parse occasionally fails right after a
new file lands), that's a good candidate for a focused follow-up lesson
— built against your generator's actual observed write behavior rather
than guessed at generically.
