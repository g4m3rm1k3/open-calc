# Python Tool Database — LAB 08 — Modules, Imports, and Project Structure

**Prerequisites:** Lab 07. You have written classes, used `from tooldb.tool_types import EndMill`, and seen `__name__ == "__main__"` in Lab 01. This lesson explains what all of that means under the hood.

**What this lab adds:**
- What a module is and what "import" actually does
- How Python finds modules: `sys.path` and the search order
- `from x import y` vs `import x` — when each form is right
- Circular imports and how to avoid them
- What a virtual environment is and why it exists
- `pip` and PyPI — installing packages
- Installing and using `rich` for formatted terminal output

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. When Python executes `import tooldb.tool_types`, what does it actually do? Does it run the file every time, or just once?
> 2. Why would two projects on the same machine need separate virtual environments? What goes wrong if they share one Python installation?
> 3. `from tooldb.sfm import calculate_sfm` and `import tooldb.sfm` — what is the difference in how you call the function afterward?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have the project's existing code organized cleanly, and a new `main.py` demo that uses the `rich` library to print a formatted tool table to the terminal:

```
┌──────────────┬──────────────┬────────┬──────────────┐
│ Name         │ Diameter     │ Type   │ SFM Target   │
├──────────────┼──────────────┼────────┼──────────────┤
│ EM-0500      │ 0.500"       │ EndMill│ 1000         │
│ DR-0250      │ 0.250"       │ Drill  │ 1000         │
│ FM-0750      │ 0.750"       │ EndMill│ 1000         │
└──────────────┴──────────────┴────────┴──────────────┘
```

---

## Step 1 — What a Module Is

A **module** is any `.py` file. When you write `import tooldb.sfm`, Python loads `tooldb/sfm.py` and makes its names available to your code under the `tooldb.sfm` namespace.

Open the REPL: `python`

```python
import tooldb.sfm            # loads tooldb/sfm.py if it has not been loaded yet
tooldb.sfm.calculate_sfm     # access the function via the full namespace
tooldb.sfm.calculate_sfm(0.5, 3820)   # call it
```

---

### Concept: Module — A Namespace

**What it is:** A file that defines a namespace — a scope where all the names defined in the file live. Importing the module gives you access to those names without polluting your own namespace.

**The problem before modules:** Every name in every file would collide. If two files both define `calculate_sfm`, which one runs when you call it? Without namespacing, the answer is undefined.

**What namespacing hides:** The global symbol table. Python tracks all defined names in a dict-like structure. A module creates a separate "room" so its names cannot collide with names in other modules. `tooldb.sfm.calculate_sfm` and `tooldb.sfm_lookup.calculate_sfm_for_material` are different names even if the function names are similar.

**The invariant it protects:** Names in `tooldb.sfm` cannot accidentally overwrite names in `tooldb.service`. The module boundary is the protection.

**`import` is a single-execution operation:** Python imports a module exactly once per interpreter session, regardless of how many files `import` it. The result is cached in `sys.modules`. Subsequent imports of the same module are instant lookups in that cache.

**Canonical example (General):**

A library is organized into sections: "Fiction," "Science," "History." Each section is a namespace. A book titled "Origins" in Fiction and a book titled "Origins" in Science do not conflict — the section name distinguishes them. Without sections, every book title would have to be unique across the entire library.

**Project application:** Every file in `tooldb/` is a module. `tooldb.sfm` holds SFM calculations. `tooldb.service` holds `ToolService`. `tooldb.tool_types` holds `Tool`, `EndMill`, `Drill`. This structure prevents names from colliding and makes it clear where each concern lives.

**You will see this again in:** Every Python project. In PySide6 (Block 3): `from PySide6.QtWidgets import QApplication`. In SQLAlchemy (Block 5): `from sqlalchemy import create_engine`. In FastAPI (Block 11): `from fastapi import FastAPI`.

**Watch for:** Circular imports — `module_a` imports from `module_b`, and `module_b` imports from `module_a`. Python handles this by partially loading modules, which can cause `ImportError: cannot import name 'X'` when `X` has not been defined yet. The fix is to restructure so the dependency only goes one direction.

---

## Step 2 — How Python Finds Modules: `sys.path`

When Python encounters `import tooldb.sfm`, it searches for `tooldb/sfm.py` in a list of directories called `sys.path`.

```python
import sys
print(sys.path)
```

**You should see** something like:

```
['', 'C:\\Python312\\Lib\\idlelib', 'C:\\Python312\\python312.zip', 
 'C:\\Python312\\Lib', 'C:\\Python312\\DLLs', ...]
```

The `''` (empty string) at the start means "the current directory." This is why `import tooldb.sfm` works when you run Python from the `python-tooldb/` directory — Python finds `tooldb/sfm.py` relative to where it was launched.

**The `__init__.py` file:** A directory becomes a Python **package** (importable as a namespace) when it contains a file named `__init__.py`. The file can be empty — its presence is the signal. `tooldb/` has `__init__.py`, which is why `from tooldb.sfm import calculate_sfm` works.

Check that it exists:

```powershell
ls python-tooldb\tooldb\__init__.py
```

If it does not exist yet:

```powershell
New-Item -ItemType File -Path "python-tooldb\tooldb\__init__.py" -Force
```

**Why `sys.path` matters:** Installed packages (via `pip`) are placed in the Python installation's `site-packages` directory, which is on `sys.path`. That is why `import rich` works after you install it — Python finds `rich` in `site-packages`.

---

### SAVE AND TRY

In the REPL:

```python
import sys
import tooldb.sfm

print("tooldb.sfm location:", tooldb.sfm.__file__)   # full path to the loaded module
print("Is it in sys.modules?", "tooldb.sfm" in sys.modules)   # True — cached after first import

import tooldb.sfm   # import again — does NOT re-execute the file
print("Still the same object:", "tooldb.sfm" in sys.modules)   # True — uses cache
```

**You should see:** The file path, then two `True` values.

**Console test:**

```python
sys.path[0]   # what is the first entry?
```

**Expected:** `''` (empty string) — meaning the current working directory.

**Change something:** Try `import nonexistent_module`. **Expected:** `ModuleNotFoundError: No module named 'nonexistent_module'` — Python searched all of `sys.path` and found nothing.

---

## Step 3 — Import Forms

Python has two import forms, and they serve different purposes:

```python
# Form 1: import the whole module — use it with its full namespace
import tooldb.sfm
result = tooldb.sfm.calculate_sfm(0.5, 3820)   # explicit namespace

# Form 2: import a specific name — bring it into the current namespace
from tooldb.sfm import calculate_sfm
result = calculate_sfm(0.5, 3820)              # no namespace prefix needed
```

---

### Concept: `import x` vs `from x import y`

**What they are:** Two ways to make imported names available in your code.

**`import tooldb.sfm`:** The module is loaded, but only the name `tooldb` is added to your namespace. You access everything through the full dotted path. Explicit and unambiguous — readers always know where `tooldb.sfm.calculate_sfm` comes from.

**`from tooldb.sfm import calculate_sfm`:** The module is loaded, and the specific name `calculate_sfm` is added directly to your namespace. Shorter to write and call. The tradeoff: a reader seeing `calculate_sfm(...)` does not immediately know which module it came from — they must check the imports at the top of the file.

**`from tooldb.sfm import *`:** Imports every public name from the module into your namespace. Never do this in production code. It creates invisible name collisions and makes it impossible to tell where a name came from.

**When to use each:**

| Form | When to use |
|------|-------------|
| `import module` | When module name provides useful context (`math.pi`, `os.path.join`) |
| `from module import name` | When the name is unambiguous enough to stand alone (`calculate_sfm`, `Tool`) |
| `import module as alias` | When the module name is long (`import numpy as np`) |
| `from module import *` | Never in production code |

**Project application:** The `tooldb` codebase uses `from tooldb.X import Y` throughout. Each file imports exactly the names it needs. Readers can check imports at the top of any file to understand what comes from where.

**You will see this again in:** Every Python file. This is a style decision that varies by team. The project's pattern is `from module import name` — specific and explicit.

**Watch for:** Name shadowing — if you `from math import pi` and then later write `pi = 3.14` in the same file, you shadow the `math.pi` name. The `from ... import` form is more susceptible to this than the `import math` form.

---

### SAVE AND TRY

In the REPL:

```python
# Both of these produce the same result:
import math
result_1 = math.pi * 0.5 * 3820 / 12

from math import pi
result_2 = pi * 0.5 * 3820 / 12

print(round(result_1) == round(result_2))   # → True
```

**Console test:** Try `from tooldb.sfm import calculate_sfm, calculate_rpm`. Then call both functions. **Expected:** Both work — you imported two names in one `from ... import` statement.

**Change something:** Try `from tooldb.sfm import *`. Then type `dir()` in the REPL. Notice that `calculate_sfm`, `calculate_rpm`, `tool_circumference_inches`, `INCHES_PER_FOOT`, and `math` all appeared in your namespace. This is why `import *` is dangerous — you imported `math` too, even though you only wanted the SFM functions.

---

## Step 4 — Circular Imports

A circular import is when `module_a` imports from `module_b`, and `module_b` imports from `module_a`. Python handles this by loading modules in order, but if module_b needs a name from module_a that has not been defined yet (because module_a is still loading), the import fails.

**Example to avoid:**

```python
# tooldb/service.py imports from tooldb/tool.py
from tooldb.tool import Tool

# tooldb/tool.py imports from tooldb/service.py
from tooldb.service import ToolService   # ← circular — would cause ImportError
```

**The fix:** Restructure the imports so dependencies only go one way. In this project, the dependency direction is:

```
tool.py (no imports from tooldb)
ports.py (imports from tool.py)
fakes.py (imports from ports.py)
service.py (imports from tool.py and ports.py)
tool_types.py (imports from tool.py or is independent)
```

Nothing imports from `service.py` within the `tooldb` package — that is the correct direction.

---

## Step 5 — Virtual Environments

A **virtual environment** is an isolated Python installation for a single project. It has its own copies of `pip` and its own `site-packages` directory, separate from every other project.

**The problem without virtual environments:**

```
Project A needs: requests==2.28.0
Project B needs: requests==2.31.0
System Python: one copy of requests
```

You cannot have both versions installed at the system level. Installing `2.31.0` for Project B breaks Project A.

**The solution:**

```
Project A has: its own virtual environment with requests==2.28.0
Project B has: its own virtual environment with requests==2.31.0
System Python: untouched
```

Each project's environment is completely isolated.

**Check the current environment:**

```powershell
python -m pip list   # list installed packages
```

The `python-tooldb` project should already have `pytest` installed. If not, activate the virtual environment first.

**Viewing the environment path:**

```powershell
python -c "import sys; print(sys.prefix)"
```

If a virtual environment is active, this shows the virtual environment directory. If not, it shows the system Python directory.

---

### Concept: Virtual Environment — Per-Project Dependency Isolation

**What it is:** A self-contained directory containing a specific Python version and all the packages for one project.

**What it hides:** The system Python installation. When a virtual environment is active, `python` and `pip` refer to the virtual environment's copies, not the system copies. System Python is invisible.

**The invariant it protects:** Package versions installed for this project cannot affect other projects, and other projects' packages cannot affect this one. Reproducibility: your project works the same on your machine, your colleague's machine, and the CI server — because all three use the same list of packages.

**Creating a virtual environment (if not already done):**

```powershell
python -m venv .venv        # create virtual environment in .venv/ folder
.venv\Scripts\Activate.ps1  # activate on Windows PowerShell
```

After activation, your prompt shows `(.venv)` to confirm the environment is active.

**`requirements.txt`:** The convention for recording project dependencies:

```
pytest==8.2.0
rich==13.7.0
```

**`pip freeze > requirements.txt`** captures all installed packages and versions. Another developer runs `pip install -r requirements.txt` to reproduce the exact environment.

**You will see this again in:** Every Python project. `venv` is the built-in approach. `poetry`, `pipenv`, and `uv` are alternative tools that manage virtual environments and dependencies together. All professional Python projects use dependency isolation.

**Watch for:** Forgetting to activate the virtual environment. If you run `pip install rich` without activating first, you install into system Python, not the project. Symptoms: `import rich` fails in the project but works from a different terminal.

---

## Step 6 — Installing and Using `rich`

`rich` is a Python library for beautiful terminal output — tables, colors, progress bars, syntax highlighting. Install it:

```powershell
pip install rich
```

Verify it installed:

```python
python -c "import rich; print(rich.__version__)"
```

---

### Concept: `pip` and PyPI

**What they are:** `pip` is the package installer for Python. **PyPI** (Python Package Index) is the public repository at `pypi.org` where Python packages are published.

**`pip install rich`:** Downloads the `rich` package from PyPI and installs it into the active Python environment's `site-packages`.

**`pip install package==1.2.3`:** Install a specific version. Without the version specifier, `pip` installs the latest.

**`pip list`:** List all installed packages and their versions.

**`pip freeze`:** List installed packages in `requirements.txt` format (with exact versions, suitable for reproducibility).

**Why it matters:** Every library you will use in this project — SQLAlchemy (Block 5), Pydantic (Block 9), FastAPI (Block 11), PySide6 (Block 3) — is installed via `pip` from PyPI. `pip` is the mechanism; PyPI is the library.

**You will see this again in:** Every Python project. In a CI/CD pipeline (GitHub Actions): `pip install -r requirements.txt` restores the environment. In Docker deployments: `RUN pip install ...` in the Dockerfile.

---

## Step 7 — Red: Write the Test

The lesson plan says to build a `rich`-based tool display. Because terminal output format depends on the `rich` library's version, the test focuses on the data preparation rather than the exact table rendering.

Create `tests/test_tool_table.py`:

```python
from tooldb.tool_table import build_table_rows   # ← will fail


def test_build_table_rows_returns_list():
    from tooldb.tool_types import EndMill, Drill
    tools = [
        EndMill("EM-0500", 0.5, 4, 0.0),
        Drill("DR-0250", 0.25, 118),
    ]
    rows = build_table_rows(tools)
    assert len(rows) == 2


def test_build_table_rows_includes_name():
    from tooldb.tool_types import EndMill
    tools = [EndMill("EM-0500", 0.5, 4, 0.0)]
    rows = build_table_rows(tools)
    assert rows[0]["name"] == "EM-0500"


def test_build_table_rows_includes_diameter_formatted():
    from tooldb.tool_types import EndMill
    tools = [EndMill("EM-0500", 0.5, 4, 0.0)]
    rows = build_table_rows(tools)
    assert rows[0]["diameter"] == '0.500"'     # formatted with 3 decimal places and inch mark
```

Run:

```powershell
pytest tests/test_tool_table.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.tool_table'
```

Red.

---

## Step 8 — Green: Write the Module

Create `tooldb/tool_table.py`:

```python
from tooldb.tool_types import Tool   # import the base type for type annotation


def build_table_rows(tools: list) -> list:
    rows = []                                    # accumulate result rows

    for tool in tools:
        rows.append({                            # dict for each tool
            "name": tool.name,
            "diameter": f'{tool.diameter_inches:.3f}"',   # formatted with inch mark
            "type": type(tool).__name__,         # class name as string: "EndMill", "Drill"
        })

    return rows
```

Run:

```powershell
pytest tests/test_tool_table.py
```

**You should see:** 3 passed.

Now add the `main.py` demonstration using `rich`. Update `main.py` (at the project root):

```python
from rich.table import Table         # rich's Table class — renders a bordered table
from rich.console import Console     # rich's Console class — the output device

from tooldb.tool_types import EndMill, Drill   # our domain classes
from tooldb.tool_table import build_table_rows  # our row builder

DEMO_TOOLS = [                       # sample tools for demonstration
    EndMill("EM-0500",  diameter_inches=0.5,   flutes=4, corner_radius_inches=0.0),
    EndMill("EM-0375",  diameter_inches=0.375, flutes=4, corner_radius_inches=0.03),
    Drill("DR-0250",    diameter_inches=0.25,  point_angle_degrees=118),
    Drill("DR-0500",    diameter_inches=0.5,   point_angle_degrees=135),
]


def run_demo() -> None:
    rows = build_table_rows(DEMO_TOOLS)    # get the formatted row data

    table = Table(title="Tool Database Demo")   # rich Table with a title
    table.add_column("Name",     style="cyan")  # add columns with optional styles
    table.add_column("Diameter", style="green")
    table.add_column("Type",     style="yellow")

    for row in rows:
        table.add_row(row["name"], row["diameter"], row["type"])  # add each row

    console = Console()             # Console handles the actual output
    console.print(table)            # render and print the table


if __name__ == "__main__":
    run_demo()
```

Run:

```powershell
python python-tooldb\main.py
```

**You should see** a formatted bordered table in the terminal. (Exact appearance depends on your terminal's color support.)

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass.

---

### SAVE AND TRY

```powershell
python python-tooldb\main.py
```

**You should see:** A rich-formatted table with all four demo tools.

**Console test:** In the REPL:

```python
from tooldb.tool_table import build_table_rows
from tooldb.tool_types import EndMill

rows = build_table_rows([EndMill("EM-0500", 0.5, 4, 0.0)])
print(rows)
```

**Expected:** `[{'name': 'EM-0500', 'diameter': '0.500"', 'type': 'EndMill'}]`

**Change something:** Add a `"style": "bold red"` to the `table.add_column("Name", ...)` line. Re-run `main.py`. The name column should now appear in bold red. Change it back to `style="cyan"`.

---

## 🎯 Challenge: Add `pip freeze` Output to the Project

**You know:** `pip`, virtual environments, modules, imports.

**Task:** This challenge is slightly different — it is about professional practice rather than code.

1. Run `pip freeze > requirements.txt` in the `python-tooldb/` directory
2. Open `requirements.txt` and verify `pytest` and `rich` both appear with exact versions
3. Add `requirements.txt` to the project (it should be committed to version control)
4. Write one sentence in `notes.md` explaining why `requirements.txt` exists and what `pip install -r requirements.txt` does

Then write a Python test that confirms `rich` is importable (i.e., the dependency is real and testable):

```python
def test_rich_is_installed():
    import rich       # if rich is not installed, this raises ImportError
    assert rich.__version__   # version string exists — package is properly installed
```

Add this test to `tests/test_tool_table.py`.

---

<details>
<summary>▶ Show Solution</summary>

**Generate requirements.txt:**

```powershell
pip freeze > python-tooldb\requirements.txt
```

**Verify contents** — open `requirements.txt` and confirm entries like:

```
pytest==8.x.x
rich==13.x.x
```

**Add to notes.md** (append):

```
## Dependency Management

`requirements.txt` records the exact versions of all installed packages.
`pip install -r requirements.txt` recreates the exact same environment on any machine —
essential for reproducible builds and CI/CD pipelines.
```

**Test** (add to `tests/test_tool_table.py`):

```python
def test_rich_is_installed():
    import rich
    assert rich.__version__   # any non-empty version string confirms proper installation
```

**Key insight:** Writing a test for an installed package is unusual but justified here because `rich` is a dependency of `main.py`. If someone clones the project and forgets `pip install -r requirements.txt`, this test fails immediately with `ModuleNotFoundError: No module named 'rich'`, giving a clear signal of what is missing. Dependency verification tests catch environment setup problems before they turn into mysterious runtime errors.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `build_table_rows` returns correctly formatted rows | `pytest tests/test_tool_table.py` — 3 tests pass |
| `main.py` runs and shows a rich table | Run `python main.py` — table appears in terminal |
| `rich` installed in project environment | `pip list` shows `rich` |
| All previous tests still pass | `pytest tests/` — no regressions |
| Can explain `sys.path` in one sentence | "The list of directories Python searches when you import a module" |
| Can explain virtual environments in one sentence | "An isolated Python installation so each project has its own package versions" |

---

## Quick Check Answers

**1. Does Python run the module file every time it is imported?**

No — only once per interpreter session. The first `import tooldb.sfm` loads and executes `tooldb/sfm.py`, which defines all the functions and stores them in the module's namespace. Python then caches the result in `sys.modules` under the key `"tooldb.sfm"`. Every subsequent `import tooldb.sfm` statement, anywhere in the program, is a fast lookup in `sys.modules` — no re-execution. This is why module-level code (code outside of functions, run when the file is imported) runs exactly once.

**2. Why separate virtual environments?**

Project A might need `requests==2.28.0` and Project B might need `requests==2.31.0`. There can only be one version of `requests` installed in a Python environment at a time. If they share the system Python, installing the version for Project B will overwrite the one for Project A, potentially breaking it. Each project's virtual environment has its own `site-packages` directory — completely separate. `pip install requests==2.31.0` in Project B's environment has no effect on Project A's environment.

**3. Calling the function after each import form:**

After `import tooldb.sfm`, you call it as `tooldb.sfm.calculate_sfm(0.5, 3820)` — the full dotted path is required. After `from tooldb.sfm import calculate_sfm`, you call it as `calculate_sfm(0.5, 3820)` — just the function name, no prefix. Both load the same function; the difference is where the name lives in your current namespace and how you reference it. The `from ... import` form is shorter to call; the `import module` form is more explicit about origin.
