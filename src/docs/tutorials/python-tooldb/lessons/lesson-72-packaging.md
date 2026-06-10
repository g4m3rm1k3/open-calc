# Python Tool Database — LAB 72 — Packaging with PyInstaller

**Prerequisites:** Lab 71 (the app has settings, a watcher, imports, exports). You have a complete application. This lesson bundles it into a single distributable `.exe` that runs without Python installed.

**What this lab adds:**
- What PyInstaller does: static analysis + bundling, not compilation
- `--onedir` vs `--onefile` — two bundle modes with very different tradeoffs
- The hidden-import problem: watchdog and SQLAlchemy require explicit hints
- A `ToolDatabase.spec` file: the repeatable build definition
- What PyInstaller cannot do: the honest list

**Time:** 50–65 minutes

---

## What You Will Build

A `dist/ToolDatabase/` folder that contains a standalone app:

```
dist/
  ToolDatabase/
    ToolDatabase.exe      ← the launcher
    _internal/            ← Qt DLLs, Python runtime, all dependencies
    tooldb.sqlite3        ← database goes here at first run
```

Double-clicking `ToolDatabase.exe` starts the application with no Python installation required.

---

> **Quick Check — try to answer before reading:**
>
> 1. PyInstaller does not compile Python to native machine code. What does it actually do?
> 2. A `--onefile` bundle unpacks itself to a temp directory every time it starts. Name one situation where this matters.
> 3. Your app opens `"tooldb.sqlite3"` with a relative path. Inside the PyInstaller bundle, where is the current working directory?
>
> *(Answers at the end of this lab)*

---

## Concept: What PyInstaller Does

**What it is:** A tool that walks your Python import graph, collects every `.py` file, `.so`/`.pyd` extension, and data file your program needs, and packages them alongside an embedded Python interpreter into a folder or a single file.

**What it does NOT do:** Compile Python to native code. Your `.py` files become `.pyc` (bytecode) files, not native executables. The "exe" is a launcher that extracts and runs the Python runtime. This means:
- Performance is the same as running with Python directly
- A determined user can extract the bytecode and decompile it
- The bundle size is large (typically 50–200 MB) because it includes the entire Python runtime

**The problem before packaging:** Distributing a Python app meant requiring users to: install Python, create a virtual environment, `pip install` all dependencies, and then run `python main.py`. For a shop floor app, that is not realistic.

**The solution:** One folder (or one file) that the user can copy and run. No installation, no Python required. The app behaves identically to running from source.

**What it hides:** The complexity of bundling the Python runtime, finding shared libraries, handling platform-specific paths, and creating the entry point binary.

**You will see this again in:** Any Python desktop app that needs to be distributed to non-technical users. PyInstaller is the standard tool. Nuitka is an alternative that compiles to native code — faster and smaller but harder to configure. `cx_Freeze` is another alternative that predates PyInstaller but is less actively maintained.

---

## Step 1 — Install and First Run

```
pip install pyinstaller
```

Run the simplest possible build first — before any configuration:

```
pyinstaller --windowed --name ToolDatabase tooldb_ui/main.py
```

`--windowed` — no console window when the app runs (correct for GUI apps).
`--name ToolDatabase` — sets the output folder and exe name.
`tooldb_ui/main.py` — the entry point.

PyInstaller outputs to `dist/ToolDatabase/`. Navigate there and run `ToolDatabase.exe`.

### SAVE AND TRY

Run the packaged exe.

**You will probably see:** Either the app starts and works, OR it crashes immediately with an error dialog or nothing. Most first-run failures are import errors — PyInstaller's static analysis missed a dependency.

Check `dist/ToolDatabase/ToolDatabase.exe.log` (or run from the command line to see the error). The most common errors:

```
ModuleNotFoundError: No module named 'watchdog.observers.inotify'
Failed to load module 'PySide6.QtSvg'
```

These are the **hidden-import problem** — covered in Step 2.

---

## Concept: The Hidden-Import Problem

**What it is:** PyInstaller finds imports by scanning for `import X` statements. It cannot find imports that are constructed at runtime — like `importlib.import_module("watchdog.observers." + backend_name)`.

**The problem:** `watchdog` selects its backend based on the operating system, at runtime:

```python
# Inside watchdog (you don't write this — watchdog does):
backend = "inotify" if sys.platform == "linux" else "fsevents"
module = importlib.import_module(f"watchdog.observers.{backend}")
```

PyInstaller sees no `import watchdog.observers.inotify` anywhere in the source it scans. The module is not included in the bundle. At runtime, the import fails.

**The solution:** Tell PyInstaller explicitly which modules to include with `--hidden-import`:

```
pyinstaller --windowed --name ToolDatabase \
  --hidden-import watchdog.observers.winapi \
  --hidden-import sqlalchemy.dialects.sqlite \
  tooldb_ui/main.py
```

Or in the `.spec` file (Step 3): `hiddenimports=["watchdog.observers.winapi", "sqlalchemy.dialects.sqlite"]`

**The discovery method:** Run the exe from a command line (not double-click) so you see error output. Find the `ModuleNotFoundError`. Add that module to `hiddenimports`. Rebuild. Repeat.

---

## Step 2 — Diagnosing Missing Modules

Run the packaged exe from a terminal to capture errors:

```powershell
# In dist/ToolDatabase/:
.\ToolDatabase.exe
```

For a Qt + SQLAlchemy + watchdog app, the typical hidden imports required:

```
watchdog.observers.winapi          # Windows file system events
watchdog.observers.read_directory_changes  # alternative Windows backend
sqlalchemy.dialects.sqlite         # SQLite dialect — not always auto-discovered
sqlalchemy.dialects.sqlite.pysqlite  # the pysqlite connector specifically
PySide6.QtSvg                      # required by some Qt themes
```

Add each to the build command as it fails. This is an iterative process — rebuild after each addition.

---

## Step 3 — The `.spec` File

Instead of a long command line, PyInstaller uses a `.spec` file — a Python script that defines the build. Running `pyinstaller main.py` creates a `ToolDatabase.spec` file automatically. Edit it:

```python
# ToolDatabase.spec  — the repeatable build definition
# Run: pyinstaller ToolDatabase.spec

block_cipher = None

a = Analysis(
    ['tooldb_ui/main.py'],           # entry point
    pathex=[],
    binaries=[],
    datas=[
        ('tooldb/migrations', 'tooldb/migrations'),   # include Alembic migrations folder
        ('tooldb/alembic.ini', 'tooldb/alembic.ini'), # Alembic config
    ],
    hiddenimports=[
        'watchdog.observers.winapi',
        'sqlalchemy.dialects.sqlite',
        'sqlalchemy.dialects.sqlite.pysqlite',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
```

`datas` is a list of `(source, dest)` tuples — files that must be included but are not Python modules. Alembic migrations are `.py` files that PyInstaller might collect but not in the right location. Including them explicitly in `datas` ensures they are available at runtime.

```python
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ToolDatabase',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,           # compress with UPX if available — reduces size
    console=False,      # no console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='tooldb_ui/icons/app.ico' if os.path.exists('tooldb_ui/icons/app.ico') else None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ToolDatabase',
)
```

Build from the spec file:

```
pyinstaller ToolDatabase.spec
```

### SAVE AND TRY

Build from the spec file. Run `dist/ToolDatabase/ToolDatabase.exe`.

**You should see:** The application start, with all features working.

**Change something:** Change `console=True` in the spec. Rebuild. When you run the exe, a console window appears behind the app — useful for seeing `print()` output and exceptions during testing. Change it back to `False` for distribution.

---

## Concept: Paths Inside a PyInstaller Bundle

**The problem:** Your code opens the database with `Path("tooldb.sqlite3")` — a relative path. Inside the bundle, the current working directory when the user double-clicks the exe is wherever they double-clicked it from — not the bundle folder. The database file is not there.

**The solution:** Use `sys.executable` or `__file__` to find the bundle location, then construct paths relative to it. PyInstaller provides a special variable for this:

```python
import sys
from pathlib import Path

if getattr(sys, "frozen", False):
    # Running inside a PyInstaller bundle
    BASE_DIR = Path(sys.executable).parent
else:
    # Running from source
    BASE_DIR = Path(__file__).parent.parent

DATABASE_PATH = BASE_DIR / "tooldb.sqlite3"
```

`sys.frozen` is set to `True` by PyInstaller when running from a bundle. It is not set when running from source. This flag lets you write one path-resolution block that works in both environments.

In `--onefile` mode, `sys.executable` is the `.exe` path, but the extracted files are in `sys._MEIPASS` — a temp directory. Use `Path(sys.executable).parent` for the database (next to the exe), not `sys._MEIPASS` (temp — wiped on exit).

### SAVE AND TRY

Add the `BASE_DIR` resolution to wherever your database path is set. Rebuild. Move `dist/ToolDatabase/` to a different location (copy it to your Desktop). Double-click the exe from the new location.

**You should see:** The app still finds and opens the database. If it creates a new database, the path resolution is working — it creates `tooldb.sqlite3` next to the exe, wherever that is.

---

## Step 4 — `--onedir` vs `--onefile`

**`--onedir`** (default): produces a folder. The exe launches instantly — no extraction needed. Files on disk are directly accessible. Distributing requires copying the whole folder.

**`--onefile`**: produces a single exe. On each launch, extracts the entire bundle to a temp directory (`%TEMP%\{random name}\`), runs from there, then cleans up on exit. Startup takes 3–10 seconds depending on bundle size. Antivirus software sometimes flags `--onefile` bundles as suspicious because they unpack themselves at runtime.

**For the tool database, use `--onedir`.** The application needs to write a database file next to itself. `--onefile` extracts to temp, runs there, then deletes the temp — any write to `sys._MEIPASS` is lost. The database must live next to `sys.executable`, which is always `--onedir` friendly.

---

## 🎯 Challenge: Alembic Migrations at First Run

**You know:** `alembic upgrade head` runs migrations. `BASE_DIR` resolves the bundle path. Alembic reads `alembic.ini` to find the migration scripts.

**Task:** In `main.py`, before creating the Qt application, check if the database exists at `BASE_DIR / "tooldb.sqlite3"`. If it does not exist, run `alembic upgrade head` programmatically to create it. This replaces the manual "run alembic before first run" step.

**Hint:** Alembic's Python API:

```python
from alembic.config import Config
from alembic import command

alembic_cfg = Config(str(BASE_DIR / "tooldb" / "alembic.ini"))
alembic_cfg.set_main_option("sqlalchemy.url", f"sqlite:///{BASE_DIR / 'tooldb.sqlite3'}")
command.upgrade(alembic_cfg, "head")
```

---

<details>
<summary>▶ Show Solution</summary>

```python
# In main.py, before QApplication:

import sys
from pathlib import Path

if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).parent
else:
    BASE_DIR = Path(__file__).parent.parent

db_path = BASE_DIR / "tooldb.sqlite3"

if not db_path.exists():
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config(str(BASE_DIR / "tooldb" / "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", f"sqlite:///{db_path}")
    command.upgrade(alembic_cfg, "head")
    print(f"Database created at {db_path}")
```

**Key insight:** First-run setup belongs in the entry point, before the UI starts. The `sys.frozen` check makes the same code work from source (where the db might already exist in the project root) and from the bundle (where it definitely doesn't exist yet). The Alembic Python API is the same as the command line — `command.upgrade(cfg, "head")` is exactly `alembic upgrade head`.

</details>

---

## What PyInstaller Cannot Do

Knowing the limits is as important as knowing the tool:

- **Cannot build a Windows exe on macOS or Linux** (and vice versa). You must build on the target OS.
- **Cannot reduce size below ~50 MB** for a PySide6 app. Qt is large. Use `--exclude-module` to remove unused Qt modules, but the baseline is still large.
- **Cannot prevent decompilation.** The `.pyc` bytecode in the bundle is extractable and decompilable. Use Cython or Nuitka if source protection is a hard requirement.
- **Cannot bundle a database server.** If the app needs PostgreSQL or MySQL, those must be installed separately — PyInstaller only bundles Python code and C extensions.
- **Cannot auto-update.** The bundle is static. If you ship `v1.0` and need `v1.1`, the user re-downloads and replaces the folder. Tools like `auto-py-to-exe` or Squirrel add update mechanisms, but they are separate projects.

---

## Final Check

| What to verify | How to verify |
|---|---|
| Bundle builds without error | `pyinstaller ToolDatabase.spec` exits with `Building EXE from EXE-00.toc DONE` |
| Exe runs from bundle directory | `cd dist/ToolDatabase && .\ToolDatabase.exe` |
| App runs from a different directory | Copy bundle to Desktop, double-click — opens without missing-file errors |
| Database created next to exe | Check `dist/ToolDatabase/tooldb.sqlite3` exists after first run |
| No console window visible | App opens without a black console window behind it |

---

## Quick Check Answers

**1. What does PyInstaller actually do?**
It walks your program's import graph, collects every `.py` file (compiled to `.pyc`), every C extension (`.pyd` or `.so`), Qt DLLs, and data files. It bundles all of these alongside an embedded Python interpreter (a stripped-down copy of CPython) into a folder or a self-extracting archive. The "exe" is a small C launcher that starts the embedded Python and runs your bytecode. Your Python code runs at full Python speed — there is no native compilation.

**2. When does `--onefile`'s extraction-on-startup matter?**
When startup time is important, when antivirus software is a concern, or when the app writes files that need to persist. `--onefile` extracts to a per-launch temp directory that is deleted on exit — any write to that temp dir is lost. A shop floor app that writes a database must use `--onedir`, where the database can live next to the exe permanently. `--onefile` also fails to start if the temp directory is on a drive with no free space or if the user's antivirus quarantines the unpacked files.

**3. Where is the current working directory inside a PyInstaller bundle?**
Wherever the user launched the exe from — the OS does not change it. If the user double-clicks from `C:\Users\g4m3r\Desktop`, the working directory is `C:\Users\g4m3r\Desktop`. If they double-click from `C:\Tools\`, it is `C:\Tools\`. A relative path like `"tooldb.sqlite3"` resolves to wherever they launched from — almost certainly not the bundle folder. Always construct paths relative to `Path(sys.executable).parent` when `sys.frozen` is True, not relative to the working directory.
