# Python Tool Database — LAB 71 — Application Settings with QSettings

**Prerequisites:** Lab 63 (QSettings mentioned briefly). Lab 68 (FilterState persistence). You have used QSettings for one specific thing. This lesson uses it systematically for all app settings.

**What this lab adds:**
- `QSettings` storage backends — where settings are actually stored on disk
- An `AppSettings` class that owns all setting keys and provides typed accessors
- Window geometry persistence: save and restore size and position
- Recent files list: adding, limiting, and reading
- Settings dialog: a `QDialog` with checkboxes and spinboxes that reads and writes `AppSettings`

**Time:** 45–55 minutes

---

## What You Will Build

An `AppSettings` class and a Settings dialog:

```
Settings
────────────────────────────────────
[x] Watch library folder on startup
[ ] Show audit log tab

Watch folder: [C:\Libraries\________] [Browse]

Recent files (max 10):
  C:\Libraries\shop_floor.tooldb
  C:\Libraries\archive\tools_v2.tooldb

[OK]  [Cancel]
```

Window size and position are saved on close and restored on startup — silently, without user action.

---

> **Quick Check — try to answer before reading:**
>
> 1. `QSettings` stores values as strings. You store `True`. You load it back with `settings.value("key")`. What type do you get? Is it `True` (bool) or `"true"` (string)?
> 2. `QSettings` has multiple "scopes": `UserScope` and `SystemScope`. What is the difference and which scope does the tool database use?
> 3. You store the window's position as `(x, y)`. On the next startup, those coordinates are off-screen because the user unplugged a monitor. What should you check before restoring the position?
>
> *(Answers at the end of this lab)*

---

## Concept: `QSettings` — Persistent Key-Value Storage

**What it is:** A Qt class that reads and writes application settings to platform-appropriate storage (registry on Windows, `.ini` files or `~/.config` on Linux/macOS). One API, three backends.

**The problem before:** Without `QSettings`, you would manage settings manually:
- Write a JSON file to the user's home directory
- Parse the JSON on startup
- Handle missing files, corrupt files, concurrent reads
- Choose a platform-appropriate path

**The solution:** `QSettings("YourCompany", "YourApp")` — Qt picks the right location for the current platform:
- Windows: `HKCU\Software\YourCompany\YourApp` in the registry
- macOS: `~/Library/Preferences/com.YourCompany.YourApp.plist`
- Linux: `~/.config/YourCompany/YourApp.ini`

**What it hides:** The path, the file format, registry API calls, and the locking needed for safe concurrent access. You call `setValue` / `value`; Qt handles the rest.

**The protected invariant:** Settings are written to the platform's designated user preferences location — they survive app updates, are accessible without admin rights, and are separate from system-wide settings.

**The `type=` parameter is required for non-strings:**

```python
settings.setValue("max_recents", 10)
val = settings.value("max_recents")      # returns "10" (string!) on some platforms
val = settings.value("max_recents", type=int)   # returns 10 (int)
```

Always pass `type=int` or `type=bool` when reading numeric or boolean values. Without `type=`, `QSettings` returns strings on some platforms (especially Windows registry) and native types on others. `type=` normalizes across all platforms.

**You will see this again in:** Every desktop app. Window position, last-opened file, user preferences, recent history, API keys (with care — QSettings is not encrypted). The pattern of an `AppSettings` class that owns all keys appears in every professional Qt codebase.

---

## Step 1 — The AppSettings Class

Create `tooldb_ui/app_settings.py`:

```python
from PySide6.QtCore import QSettings
from pathlib import Path
```

```python
class AppSettings:
    """
    Owns all application settings keys.
    Provides typed accessors — callers never deal with raw QSettings.
    """

    ORGANIZATION = "ToolDatabase"    # used to namespace registry keys / config files
    APPLICATION  = "ToolDatabaseApp"

    # Key constants — defined here so a typo raises a NameError, not a silent miss
    _KEY_WINDOW_GEOMETRY = "window/geometry"
    _KEY_WATCH_ON_STARTUP = "watcher/start_on_startup"
    _KEY_WATCH_FOLDER    = "watcher/folder"
    _KEY_MAX_RECENTS     = "recents/max_count"
    _KEY_RECENT_FILES    = "recents/files"
    _KEY_SHOW_AUDIT_TAB  = "ui/show_audit_tab"

    def __init__(self):
        self._settings = QSettings(self.ORGANIZATION, self.APPLICATION)
```

Private constants for every key name — the first place a typo shows up as an `AttributeError` rather than a silent missing value.

```python
    # --- Window geometry ---

    def save_window_geometry(self, geometry: bytes) -> None:
        self._settings.setValue(self._KEY_WINDOW_GEOMETRY, geometry)

    def load_window_geometry(self) -> bytes | None:
        return self._settings.value(self._KEY_WINDOW_GEOMETRY)

    # --- Watcher ---

    def watch_on_startup(self) -> bool:
        return self._settings.value(self._KEY_WATCH_ON_STARTUP, False, type=bool)

    def set_watch_on_startup(self, enabled: bool) -> None:
        self._settings.setValue(self._KEY_WATCH_ON_STARTUP, enabled)

    def watch_folder(self) -> str:
        return self._settings.value(self._KEY_WATCH_FOLDER, "", type=str)

    def set_watch_folder(self, path: str) -> None:
        self._settings.setValue(self._KEY_WATCH_FOLDER, path)

    # --- UI ---

    def show_audit_tab(self) -> bool:
        return self._settings.value(self._KEY_SHOW_AUDIT_TAB, False, type=bool)

    def set_show_audit_tab(self, visible: bool) -> None:
        self._settings.setValue(self._KEY_SHOW_AUDIT_TAB, visible)
```

Each setting has two methods: a getter with a default value and a setter. The caller never writes `settings.value("watcher/start_on_startup", False, type=bool)` — they call `app_settings.watch_on_startup()` and get a `bool`.

### SAVE AND TRY

```python
from tooldb_ui.app_settings import AppSettings

s = AppSettings()
print(f"Watch on startup (default): {s.watch_on_startup()}")   # False

s.set_watch_on_startup(True)
s.set_watch_folder("C:/Libraries")

s2 = AppSettings()   # new instance reads from same persistent store
print(f"Watch on startup (after set): {s2.watch_on_startup()}")  # True
print(f"Watch folder: {s2.watch_folder()}")                      # C:/Libraries
```

**You should see:**
```
Watch on startup (default): False
Watch on startup (after set): True
Watch folder: C:/Libraries
```

**Change something:** Remove `type=bool` from `watch_on_startup()`. Call it after setting it to `True`. Depending on your OS, you may get `"true"` (string) instead of `True` (bool). Add it back.

---

## Step 2 — Recent Files List

A recent files list is an ordered list that grows up to a max count, with duplicates removed:

```python
    # --- Recent files ---

    MAX_RECENTS_DEFAULT = 10

    def max_recents(self) -> int:
        return self._settings.value(self._KEY_MAX_RECENTS, self.MAX_RECENTS_DEFAULT, type=int)

    def recent_files(self) -> list[str]:
        """Returns the recent files list, newest first, filtered to existing files."""
        raw = self._settings.value(self._KEY_RECENT_FILES, [])
        if isinstance(raw, str):
            raw = [raw]    # QSettings returns a single string, not a list, when only one item is stored
        return [f for f in raw if Path(f).exists()]
        # filter to existing files — removes entries for deleted or moved files

    def add_recent_file(self, path: str) -> None:
        """Adds a file to the front of the recent list, removing duplicates."""
        recents = self._settings.value(self._KEY_RECENT_FILES, [])
        if isinstance(recents, str):
            recents = [recents]

        # Remove existing entry for this path (dedup):
        recents = [f for f in recents if f != path]
        # Prepend the new entry:
        recents.insert(0, path)
        # Trim to max:
        recents = recents[:self.max_recents()]

        self._settings.setValue(self._KEY_RECENT_FILES, recents)
```

The `isinstance(raw, str)` guard: `QSettings` stores lists as arrays, but when the list has only one element and the settings backend is the registry or a `.ini` file, some platforms return the single value as a plain string instead of a one-element list. This is a known Qt quirk — the guard converts it back to a list.

### SAVE AND TRY

```python
s = AppSettings()
s.add_recent_file("C:/Libraries/shop_floor.tooldb")
s.add_recent_file("C:/Libraries/archive/tools_v2.tooldb")
s.add_recent_file("C:/Libraries/shop_floor.tooldb")   # duplicate — should move to front

recents = s._settings.value(s._KEY_RECENT_FILES, [])
print(f"Recent files: {recents}")
```

**You should see:**
```
Recent files: ['C:/Libraries/shop_floor.tooldb', 'C:/Libraries/archive/tools_v2.tooldb']
```

The duplicate was removed and the file moved to the front. Only 2 entries — the duplicate did not grow the list to 3.

---

## Step 3 — Window Geometry Persistence

Qt provides `QMainWindow.saveGeometry()` and `restoreGeometry()` — they pack window size, position, and maximized state into a `bytes` object:

```python
# In your main window — call on close:

def closeEvent(self, event) -> None:
    self._app_settings.save_window_geometry(self.saveGeometry())
    super().closeEvent(event)

# In __init__ — call after building the window:

def _restore_geometry(self) -> None:
    saved = self._app_settings.load_window_geometry()
    if saved:
        self.restoreGeometry(saved)
    # If no saved geometry: window opens at Qt's default position and size
```

`saveGeometry()` returns `QByteArray` (Qt's byte array type). `QSettings.setValue()` stores it directly. `restoreGeometry()` accepts the same `QByteArray` back.

Why not store `x, y, width, height` separately? `saveGeometry()` also stores whether the window was maximized, minimized, and on which screen — information that would require 6+ separate keys to replicate.

### SAVE AND TRY

Add `closeEvent` and `_restore_geometry` to your main window. Run the app, resize the window, close it. Reopen — the window should open at the same size and position.

**You should see:** The window opens exactly where you left it.

**Change something:** Move the window to a corner, close, reopen — it should still be in the corner. Maximize, close, reopen — it should open maximized. The `saveGeometry` / `restoreGeometry` pair handles all cases.

---

## 🎯 Challenge: Settings Dialog

**You know:** `QDialog` (Lab 62's PolicyDialog), `QCheckBox`, `QSpinBox`, `QDialogButtonBox`. `AppSettings` has getters and setters for all preferences.

**Task:** Build a `SettingsDialog` that:
1. Opens with current values loaded from `AppSettings`
2. Has a checkbox for "Watch library folder on startup"
3. Has a line edit + "Browse" button for the watch folder path
4. Has a spinbox for "Max recent files" (range 1–50)
5. On OK: writes all values back to `AppSettings`
6. On Cancel: discards all changes (no writes)

**Starting code:**

```python
from PySide6.QtWidgets import (
    QDialog, QCheckBox, QLineEdit, QPushButton,
    QSpinBox, QFormLayout, QDialogButtonBox, QFileDialog
)
from tooldb_ui.app_settings import AppSettings


class SettingsDialog(QDialog):
    def __init__(self, app_settings: AppSettings, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Settings")
        self._settings = app_settings

        self._watch_checkbox = QCheckBox("Watch library folder on startup")
        self._watch_checkbox.setChecked(self._settings.watch_on_startup())

        self._folder_edit = QLineEdit(self._settings.watch_folder())
        self._browse_btn  = QPushButton("Browse...")
        self._browse_btn.clicked.connect(self._on_browse)

        self._max_recents_spin = QSpinBox()
        self._max_recents_spin.setRange(1, 50)
        self._max_recents_spin.setValue(self._settings.max_recents())

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self._on_ok)
        buttons.rejected.connect(self.reject)

        # Build layout here...
```

---

<details>
<summary>▶ Show Solution</summary>

```python
        from PySide6.QtWidgets import QHBoxLayout, QVBoxLayout, QLabel
        folder_row = QHBoxLayout()
        folder_row.addWidget(self._folder_edit)
        folder_row.addWidget(self._browse_btn)

        layout = QFormLayout()
        layout.addRow(self._watch_checkbox)
        layout.addRow("Watch folder:", folder_row)
        layout.addRow("Max recent files:", self._max_recents_spin)

        outer = QVBoxLayout(self)
        outer.addLayout(layout)
        outer.addWidget(buttons)

    def _on_browse(self) -> None:
        folder = QFileDialog.getExistingDirectory(
            self, "Select Watch Folder", self._folder_edit.text()
        )
        if folder:
            self._folder_edit.setText(folder)

    def _on_ok(self) -> None:
        self._settings.set_watch_on_startup(self._watch_checkbox.isChecked())
        self._settings.set_watch_folder(self._folder_edit.text())
        self._settings.set_max_recents(self._max_recents_spin.value())
        self.accept()
```

Add `set_max_recents` to `AppSettings`:

```python
def set_max_recents(self, count: int) -> None:
    self._settings.setValue(self._KEY_MAX_RECENTS, count)
```

**Key insight:** The dialog owns no persistent state. On open: read from `AppSettings`. On OK: write to `AppSettings`. On Cancel: do nothing. This pattern — dialog as pure input form, settings object as single source of truth — means you can have multiple places in the app that show settings, and they all read from and write to the same `AppSettings` object. The dialog is UI; `AppSettings` is the model.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `watch_on_startup()` returns `bool`, not string | `type(settings.watch_on_startup())` → `<class 'bool'>` |
| Recent files deduplicate | Add the same path twice — list has one entry, at the front |
| Recent files list respects `max_recents` | Add 15 files with max=10 — list has 10 entries |
| Window geometry persists | Resize, close, reopen — window at same size/position |
| Settings dialog writes on OK, not Cancel | Change a setting, Cancel — setting unchanged; change, OK — setting changed |

---

## Quick Check Answers

**1. `settings.value("key")` without `type=` — what type do you get?**
It depends on the platform. On Linux and macOS, QSettings often returns the native type (`True` for a stored boolean). On Windows with the registry backend, it returns the string `"true"`. This inconsistency is why `type=bool` is mandatory for non-string values. With `type=bool`, Qt converts whatever the backend returns into a proper Python `bool`. Without it, your code works on Linux and fails on Windows — a subtle cross-platform bug.

**2. `UserScope` vs `SystemScope` — what is the difference?**
`UserScope` (the default) stores settings per user — in `HKCU` on Windows, `~/.config` on Linux. Only the current user sees them. `SystemScope` stores in a location readable by all users — `HKLM` on Windows. The tool database uses `UserScope` (the default): each user gets their own preferences, watch folder, and window position. `SystemScope` would be appropriate for organization-wide defaults — e.g., "all users start with the watch folder set to the shared drive."

**3. What to check before restoring an off-screen position:**
Whether the restored geometry falls within the available screen area. `QGuiApplication.screens()` returns all connected screens and their geometry. If the saved window position is outside all screen bounds, do not restore it — let Qt use the default position. This prevents the "invisible window" problem where the window opens off-screen after a monitor is disconnected. Qt's `restoreGeometry()` handles this in newer versions, but explicitly checking is safer for older Qt versions.
