# Python Tool Database — LAB 62 — Batch Import UI

**Prerequisites:** Lab 61 (merge strategies). Lab 59 (QTabWidget). You can scan a directory, merge databases, and add tabs to the main window. This lesson adds a UI for doing all three at once.

**What this lab adds:**
- `QFileDialog.getExistingDirectory()` — picking a folder, not a file
- `QProgressDialog` — showing progress during a long operation without freezing the UI
- Processing a list of files in sequence and updating progress between each
- A summary dialog after batch operations

**Time:** 50–60 minutes

---

## What You Will Build

A "Batch Import..." menu option that opens a folder picker. After the user picks a folder, a progress bar appears as each `.tooldb` file is processed. When done, a summary appears:

```
Batch Import Complete
─────────────────────────────
Files processed:  3
Tools imported:   47
Tools skipped:    12 (duplicates)
Errors:            1

Details:
  shop_floor.tooldb  → 20 imported
  library_v2.tooldb  → 27 imported
  corrupt.tooldb     → ERROR: Cannot open file
```

---

> **Quick Check — try to answer before reading:**
>
> 1. `QProgressDialog` is shown during the import loop. The loop runs on the main thread. Why does the UI update between file imports but NOT mid-file (while one large file is being processed)?
> 2. The user clicks "Cancel" on the progress dialog mid-import. You have already imported 30 tools. Do you roll them back?
> 3. `QFileDialog.getExistingDirectory()` vs `getOpenFileName()` — what does the user see differently?
>
> *(Answers at the end of this lab)*

---

## Concept: `QProgressDialog`

**What it is:** A modal dialog that shows a progress bar and a label. It blocks the user from interacting with the rest of the UI while a long operation runs — but it keeps the UI from appearing frozen.

**The problem before:** A long import loop runs entirely on the main thread. While it runs, the window appears frozen — it cannot be moved, resized, or closed. The OS may even show the "Not Responding" badge.

**The solution:** Call `QApplication.processEvents()` inside the loop. This yields control back to the Qt event loop momentarily — letting it repaint the progress dialog, handle the cancel button, and keep the window responsive.

```python
from PySide6.QtWidgets import QProgressDialog, QApplication

progress = QProgressDialog("Importing...", "Cancel", 0, total_files, parent)
progress.setWindowModality(Qt.WindowModal)   # blocks this window only, not the whole app

for i, path in enumerate(files):
    if progress.wasCanceled():
        break
    progress.setValue(i)
    progress.setLabelText(f"Processing {path.name}...")
    QApplication.processEvents()             # ← let Qt repaint and handle events

    do_the_import(path)                      # ← the actual work

progress.setValue(total_files)              # signals completion
```

**What it hides:** Manual painting and event handling. Without `QProgressDialog`, you would need to manually repaint the window, handle the cancel button click, and decide when to stop. `QProgressDialog` gives you all of this for a `setWindowModality` and a `processEvents()` call.

**The protected invariant:** `wasCanceled()` is set by the dialog when the user clicks Cancel — your loop checks it before each file. This makes cancellation clean: it always stops between files, never mid-file.

**You will see this again in:** Any GUI application with long-running operations — file conversion, database migrations, network downloads, rendering. `processEvents()` is the simple path; `QThread` with signals is the correct path for operations that can take seconds (covered in Block 11).

**Watch for:** `processEvents()` allows re-entrant event handling. If the user can click a button that triggers another operation while `processEvents()` is running inside the first operation, you get nested operations. The `Qt.WindowModal` flag mitigates this by blocking the parent window.

---

## Step 1 — The Folder Picker

Add a menu action in `tooldb_ui/main.py`:

```python
# In _build_menu, under the Import submenu:
batch_action = QAction("Batch Import...", self)         # ← add this
batch_action.triggered.connect(self._on_batch_import)  # ← add this
import_menu.addAction(batch_action)                     # ← add this
```

Now the handler:

```python
def _on_batch_import(self):
    directory = QFileDialog.getExistingDirectory(
        self, "Select Library Folder",
        str(Path.home()),          # start at the user's home directory
        QFileDialog.ShowDirsOnly   # hide files in the picker — folders only
    )
    if not directory:
        return    # user cancelled
    self._run_batch_import(Path(directory))
```

`getExistingDirectory` returns an empty string if the user cancels. The `QFileDialog.ShowDirsOnly` flag removes files from the picker, so the user cannot accidentally pick a `.tooldb` file instead of a folder.

### SAVE AND TRY

Add the action to the menu and run the app. Click the new menu item.

**You should see:** A folder picker dialog that shows only directories. Cancel it — nothing happens. Pick a folder — for now, nothing else happens either (we add that next).

---

## Step 2 — The Import Loop with Progress

```python
from tooldb.importers.pathlib_scanner import scan_for_tooldb_files
from tooldb.importers.merge_policy import MergePolicy, merge_database


def _run_batch_import(self, directory: Path) -> None:
    files = list(scan_for_tooldb_files(directory))   # collect all paths first

    if not files:
        QMessageBox.information(self, "Batch Import", "No .tooldb files found.")
        return

    progress = QProgressDialog(
        "Starting...", "Cancel", 0, len(files), self
    )
    progress.setWindowTitle("Batch Import")
    progress.setWindowModality(Qt.WindowModal)
    progress.show()

    totals = {"imported": 0, "skipped": 0, "overwritten": 0, "errors": []}
    file_summaries = []

    for i, path in enumerate(files):
        if progress.wasCanceled():
            break

        progress.setValue(i)
        progress.setLabelText(f"Processing {path.name}  ({i + 1}/{len(files)})")
        QApplication.processEvents()

        result = merge_database(path, MergePolicy.SKIP, self._service)

        totals["imported"]   += result["imported"]
        totals["skipped"]    += result["skipped"]
        totals["errors"]     += result["errors"]
        file_summaries.append((path.name, result))

    progress.setValue(len(files))
    self._load_tools()        # refresh the tool table
    self._show_batch_summary(file_summaries, totals)
```

### SAVE AND TRY

Create two copies of `sample_mastercam.tooldb` with different names in a test folder, then run Batch Import on that folder.

**You should see:** The progress dialog advancing from 0 to 2. Then a summary. (You'll write the summary dialog next.)

**Change something:** Remove `QApplication.processEvents()`. Run again with 3+ files. Watch whether the progress bar updates between files. On small files it may still update, but on a slow machine or large files, the window freezes.

---

## Step 3 — The Summary Dialog

```python
def _show_batch_summary(self, file_summaries: list, totals: dict) -> None:
    lines = [
        f"Files processed:  {len(file_summaries)}",
        f"Tools imported:   {totals['imported']}",
        f"Tools skipped:    {totals['skipped']} (duplicates)",
        f"Errors:           {len(totals['errors'])}",
        "",
        "Details:",
    ]
    for name, result in file_summaries:
        if result["errors"]:
            lines.append(f"  {name}  → ERROR: {result['errors'][0]}")
        else:
            lines.append(f"  {name}  → {result['imported']} imported")

    QMessageBox.information(self, "Batch Import Complete", "\n".join(lines))
```

### SAVE AND TRY

Run the full batch import now.

**You should see** the summary dialog matching the format in "What You Will Build."

---

## 🎯 Challenge: Policy Selector

**You know:** `MergePolicy` has three values. `merge_database` takes a policy argument.

**Task:** Before the import loop starts, show a small dialog with three radio buttons (Skip / Overwrite / Rename) that lets the user choose the merge policy. Pass the selected policy to each `merge_database` call.

**Starting code:**
```python
from PySide6.QtWidgets import QDialog, QRadioButton, QVBoxLayout, QDialogButtonBox

class PolicyDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Merge Policy")
        self._skip      = QRadioButton("Skip duplicates (keep existing)")
        self._overwrite = QRadioButton("Overwrite duplicates (use incoming)")
        self._skip.setChecked(True)    # default
        # add buttons and layout
        ...

    def selected_policy(self) -> MergePolicy:
        if self._overwrite.isChecked():
            return MergePolicy.OVERWRITE
        return MergePolicy.SKIP
```

---

<details>
<summary>▶ Show Solution</summary>

```python
class PolicyDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Merge Policy")

        self._skip      = QRadioButton("Skip duplicates (keep existing data)")
        self._overwrite = QRadioButton("Overwrite duplicates (use file data)")
        self._skip.setChecked(True)

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)

        layout = QVBoxLayout(self)
        layout.addWidget(self._skip)
        layout.addWidget(self._overwrite)
        layout.addWidget(buttons)

    def selected_policy(self) -> MergePolicy:
        return MergePolicy.OVERWRITE if self._overwrite.isChecked() else MergePolicy.SKIP
```

In `_on_batch_import`, show the dialog before scanning:
```python
policy_dlg = PolicyDialog(self)
if policy_dlg.exec() != QDialog.Accepted:
    return
policy = policy_dlg.selected_policy()
```

**Key insight:** The dialog is responsible for capturing a decision; it returns a `MergePolicy` enum, not a string. The import function receives a typed value and cannot receive an invalid policy by accident. UI → typed value → logic is the correct flow.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| Folder picker shows only directories, not files | Open the dialog and look |
| Progress bar advances between files | Watch it during a 3-file import |
| Cancel stops the import between files, not mid-file | Click Cancel; check how many tools were imported |
| Summary dialog shows per-file breakdown | Read the dialog after import |
| Tool table refreshes after import completes | Check that new tools appear without restarting |

---

## Quick Check Answers

**1. Why does UI update between files but not mid-file?**
`processEvents()` is called between loop iterations — after one file finishes and before the next starts. During the import of a single large file, control never returns to the event loop. The solution for mid-operation responsiveness is `QThread` — the import runs on a background thread and emits a signal for each file completed. The main thread updates the progress bar in the signal handler.

**2. Do you roll back the 30 imported tools if the user cancels?**
No — and this is the right decision for imports. The 30 tools that were successfully imported are correct data. Rolling them back would discard valid work to achieve "all or nothing" semantics that nobody asked for. The user can see exactly which files were processed in the summary. For operations where partial state is truly unacceptable (financial transactions), a transaction rollback is appropriate. For file imports where each record is independent, partial completion is fine.

**3. `getExistingDirectory` vs `getOpenFileName` — what the user sees:**
`getOpenFileName` shows files and folders; the user picks a file. `getExistingDirectory` with `ShowDirsOnly` shows only folders; the user picks a folder. The OS-native folder picker also looks different — it may show a collapsible tree instead of a flat list.
