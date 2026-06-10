# Python Tool Database — LAB 63 — File System Watching

**Prerequisites:** Lab 62 (batch import). Lab 34 (signals and slots). You can import files and emit Qt signals. This lesson watches a directory and notifies the app when a new `.tooldb` file appears.

**What this lab adds:**
- The `watchdog` library — OS-level file system events without polling
- The Observer/Handler pattern — subclassing `FileSystemEventHandler` to react to events
- Thread safety: `watchdog` runs on a background thread; Qt widgets must only be touched from the main thread
- Debouncing: file system events fire multiple times per file; waiting 500ms before reacting

**Time:** 55–70 minutes

---

## What You Will Build

A `DatabaseWatcher` that monitors a folder. When a new `.tooldb` file is dropped in, a notification bar appears at the bottom of the main window:

```
┌────────────────────────────────────────────────────────┐
│  New library found: shop_floor_v2.tooldb   [Import]  [×]│
└────────────────────────────────────────────────────────┘
```

Clicking [Import] runs the import pipeline. Clicking [×] dismisses the notification.

---

> **Quick Check — try to answer before reading:**
>
> 1. `watchdog` calls your event handler on a background thread. You want to call `self._label.setText(...)` from the handler. What happens if you do it directly?
> 2. A user copies a 50 MB `.tooldb` file into the watched folder. The OS fires `created`, then `modified` several times as data is written to disk. How many import attempts would a naive handler trigger?
> 3. Polling (checking every N seconds) vs OS event notification — name one situation where polling is the better choice.
>
> *(Answers at the end of this lab)*

---

## Concept: OS File System Events

**What it is:** Instead of your program periodically checking whether files have changed, the OS notifies your program when a file event occurs — a file was created, modified, moved, or deleted.

**The problem before:** To detect a new `.tooldb` file with polling:

```python
import time
from pathlib import Path

known_files = set(Path("libraries").glob("*.tooldb"))

while True:
    current = set(Path("libraries").glob("*.tooldb"))
    new_files = current - known_files
    for f in new_files:
        print(f"New file: {f}")
    known_files = current
    time.sleep(5)   # check every 5 seconds — wastes CPU, misses files for up to 5 seconds
```

**The solution:** `watchdog` wraps the OS event API (`inotify` on Linux, `FSEvents` on macOS, `ReadDirectoryChangesW` on Windows). Your handler is called within milliseconds of the event, without any polling.

**What it hides:** Platform-specific OS API calls. `watchdog` presents the same event model on all platforms — you subclass one class regardless of OS.

**The protected invariant:** You never miss a file creation event (within the same process lifetime). Polling has a window between checks where events can occur undetected.

**You will see this again in:** Code editors (detecting file changes on disk), build systems (re-running tests when a source file changes), IDEs (showing "file modified externally" dialogs), Dropbox-style sync tools, hot-reload in web dev servers.

**Career signal:** OS event-driven programming appears in every system that reacts to external changes. The pattern — register a handler, let the OS call it — is the same whether you are watching files, network sockets, or hardware interrupts.

**Watch for:** On network drives, the OS file system events may not fire reliably. If the watcher is used over a network share, add a fallback polling timer (see Step 4).

---

## Step 1 — Install watchdog and the Basic Handler

```
pip install watchdog
```

Create `tooldb/watchers/database_watcher.py`:

```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent
import threading
```

`Observer` is the watchdog component that monitors the directory. `FileSystemEventHandler` is the base class you override.

Now write the event handler:

```python
class TooldbHandler(FileSystemEventHandler):
    """Called by watchdog on a background thread when files change."""

    def __init__(self, on_new_file):
        super().__init__()
        self._on_new_file = on_new_file    # a callable: path → None
        self._pending: dict[str, threading.Timer] = {}

    def on_created(self, event: FileCreatedEvent):
        if event.is_directory:
            return
        if not event.src_path.endswith(".tooldb"):
            return
        self._schedule_import(event.src_path)

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith(".tooldb"):
            self._schedule_import(event.src_path)
```

`on_created` fires when a new file appears. `on_modified` fires as the file is written. Both call `_schedule_import` — which debounces them.

```python
    def _schedule_import(self, path: str) -> None:
        """
        Debounce: cancel any pending import for this path and restart the 500ms timer.
        When the file stops changing, the timer fires once.
        """
        if path in self._pending:
            self._pending[path].cancel()    # cancel previous timer

        timer = threading.Timer(0.5, self._on_new_file, args=[path])
        self._pending[path] = timer
        timer.start()
```

`threading.Timer(0.5, fn, args)` calls `fn(path)` after 0.5 seconds — unless cancelled first. If `on_modified` fires three times in quick succession, each call cancels the previous timer and starts a fresh one. Only the last one survives to call `_on_new_file`.

### SAVE AND TRY

```python
def my_handler(path):
    print(f"New file ready: {path}")

handler = TooldbHandler(on_new_file=my_handler)

# Simulate events manually:
from watchdog.events import FileCreatedEvent
handler.on_created(FileCreatedEvent("test.tooldb"))
import time; time.sleep(0.6)   # wait for debounce timer
```

**You should see:**
```
New file ready: test.tooldb
```

If you call `on_created` three times quickly and then wait 0.6 seconds, `my_handler` should still only be called once.

---

## Concept: Qt Thread Safety and Signals

**What it is:** Qt widgets can only be modified from the main thread. When `watchdog` calls your handler, it runs on a background thread. Calling `self._label.setText(...)` from that thread causes a crash or corrupted UI.

**The solution:** Emit a Qt signal from the background thread. Qt's signal-slot system automatically routes cross-thread signals to the receiver's thread — the slot runs on the main thread, even if the signal was emitted from a background thread.

```python
# WRONG — direct widget access from background thread:
def _on_new_file(self, path):
    self._label.setText(f"New: {path}")   # ← crash or corruption

# CORRECT — emit a signal, let Qt route it to the main thread:
def _on_new_file(self, path):
    self.new_file_detected.emit(path)    # ← safe — Qt handles the thread crossing
```

**You will see this again in:** Every Qt application that does work in a background thread. Workers, network requests, timers, `QThread` — all require signals to communicate results back to the UI.

---

## Step 2 — The DatabaseWatcher Class

```python
from PySide6.QtCore import QObject, Signal


class DatabaseWatcher(QObject):
    new_file_detected = Signal(str)    # emits the file path as a string

    def __init__(self, directory: str, parent=None):
        super().__init__(parent)
        self._directory = directory
        self._observer  = Observer()
        handler = TooldbHandler(on_new_file=self._emit_signal)
        self._observer.schedule(handler, self._directory, recursive=True)

    def _emit_signal(self, path: str) -> None:
        """Called on the watchdog background thread — emit signal to cross to main thread."""
        self.new_file_detected.emit(path)

    def start(self) -> None:
        self._observer.start()

    def stop(self) -> None:
        self._observer.stop()
        self._observer.join()    # wait for the background thread to finish
```

`QObject` is the Qt base class needed for signals. `Signal(str)` declares a signal that carries one string argument.

### SAVE AND TRY

```python
import time
from PySide6.QtWidgets import QApplication
import sys

app = QApplication(sys.argv)

watcher = DatabaseWatcher("test_libraries")
watcher.new_file_detected.connect(lambda path: print(f"Signal received: {path}"))
watcher.start()

# Create a file in the watched directory to trigger the event
import time
time.sleep(1)
Path("test_libraries/new_arrival.tooldb").touch()
time.sleep(1)

watcher.stop()
app.quit()
```

**You should see:**
```
Signal received: test_libraries\new_arrival.tooldb
```

---

## Step 3 — Notification Bar in the Main Window

Add a `QFrame` at the bottom of the main window that appears when a new file is detected:

```python
# In tooldb_ui/main.py, add to _build_central or __init__:

self._notification_bar = QFrame()
self._notification_bar.setVisible(False)
notification_layout = QHBoxLayout(self._notification_bar)

self._notification_label = QLabel()
import_btn = QPushButton("Import")
dismiss_btn = QPushButton("×")
import_btn.clicked.connect(self._on_import_detected_file)
dismiss_btn.clicked.connect(self._notification_bar.hide)

notification_layout.addWidget(self._notification_label)
notification_layout.addStretch()
notification_layout.addWidget(import_btn)
notification_layout.addWidget(dismiss_btn)

# Add to the main layout BELOW the tab widget:
main_layout.addWidget(self._notification_bar)
```

Connect the watcher:

```python
def _start_watcher(self, directory: str) -> None:
    self._watcher = DatabaseWatcher(directory)
    self._watcher.new_file_detected.connect(self._on_new_file_detected)
    self._watcher.start()

def _on_new_file_detected(self, path: str) -> None:
    """Runs on the MAIN thread — safe to update UI here."""
    self._detected_path = path
    self._notification_label.setText(
        f"New library found: {Path(path).name}"
    )
    self._notification_bar.setVisible(True)

def _on_import_detected_file(self) -> None:
    if hasattr(self, '_detected_path'):
        from tooldb.importers.merge_policy import MergePolicy, merge_database
        merge_database(self._detected_path, MergePolicy.SKIP, self._service)
        self._load_tools()
        self._notification_bar.hide()
```

### SAVE AND TRY

Call `self._start_watcher("test_libraries")` from `__init__` after the watcher is ready. Run the app, then copy a `.tooldb` file into `test_libraries`.

**You should see:** The notification bar appear at the bottom of the window with the filename and an "Import" button.

---

## Step 4 — Fallback Timer for Network Drives

Add a `QTimer` that polls the directory every 30 seconds as a safety net:

```python
from PySide6.QtCore import QTimer

self._poll_timer = QTimer()
self._poll_timer.setInterval(30_000)   # 30 seconds
self._poll_timer.timeout.connect(self._poll_directory)
self._poll_timer.start()

def _poll_directory(self) -> None:
    """Fallback for network drives where watchdog events may be unreliable."""
    if not hasattr(self, '_last_known_files'):
        self._last_known_files = set()
    current = set(scan_for_tooldb_files(self._watch_directory))
    new_files = current - self._last_known_files
    for path in new_files:
        self._on_new_file_detected(str(path))
    self._last_known_files = current
```

This is the polling approach from the "problem before" — but now it is only a fallback for environments where OS events are unreliable, not the primary mechanism.

---

## 🎯 Challenge: Watcher Start/Stop from Settings

**You know:** `DatabaseWatcher.start()` and `.stop()` exist. `QSettings` stores preferences.

**Task:** Add a "Watch Library Folder" checkbox to a Settings menu. When checked, start the watcher on the configured folder. When unchecked, stop it. Persist the setting with `QSettings` so it survives app restarts.

---

<details>
<summary>▶ Show Solution</summary>

```python
from PySide6.QtCore import QSettings

# In main window:
settings = QSettings("YourCompany", "ToolDatabase")
watch_enabled = settings.value("watcher/enabled", False, type=bool)
watch_folder  = settings.value("watcher/folder", "", type=str)

watch_action = QAction("Watch Library Folder", self, checkable=True)
watch_action.setChecked(watch_enabled)
watch_action.toggled.connect(self._on_watch_toggled)

def _on_watch_toggled(self, enabled: bool) -> None:
    settings = QSettings("YourCompany", "ToolDatabase")
    settings.setValue("watcher/enabled", enabled)
    if enabled and watch_folder:
        self._start_watcher(watch_folder)
    elif hasattr(self, '_watcher'):
        self._watcher.stop()
```

**Key insight:** `QSettings.value(key, default, type=bool)` with the `type` parameter forces the stored string `"true"` to be returned as Python `True`. Without `type=bool`, `QSettings` returns the string `"true"`, which is truthy but not `True`. Always pass `type=` for non-string values.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Debouncing: 3 rapid `on_created` calls → 1 handler call | Add print in handler, trigger 3 events quickly |
| Watcher runs on a background thread | `self._observer.is_alive()` → `True` while watching |
| Signal crosses threads safely | Create a file; notification appears without crash |
| Notification bar appears and dismisses | Copy a `.tooldb` file; click `×` |
| Import button imports the detected file | Click Import; check tool count |

---

## Quick Check Answers

**1. What happens if you call `self._label.setText(...)` from the watchdog background thread?**
Qt raises a runtime warning and may corrupt the UI or crash. Qt's GUI objects are not thread-safe — they use internal data structures that are not protected by locks. Modifying them from two threads simultaneously produces undefined behavior. The safe pattern is always: background thread emits a signal, main thread handles it.

**2. How many import attempts would a naive handler trigger for a 50 MB file being written?**
Potentially dozens — the OS fires `created` once and `modified` many times as data is flushed to disk in chunks. Without debouncing, each event triggers an import attempt, most of which fail because the file is still being written. Debouncing waits until the file has stopped changing (no event for 500ms) before triggering the import — by which time the copy is complete.

**3. When is polling better than OS events?**
When monitoring a network drive or a remote filesystem where OS events are not generated. The OS event API only fires for local file system operations on most configurations — a file written on another machine to a network share does not trigger an event on your machine. In that case, periodic polling (every 30 seconds) is the only reliable detection method.
