# DRILL 1.4 — Python: Virtual Environments and Packaging

**Series:** Language Mechanics | **Difficulty:** Intermediate | **Time:** 60–90 min  
**Project:** Build and install a tiny Python package from scratch

---

## Quick Check

Answer these before reading. Check your answers at the bottom.

1. You `pip install requests` globally. Your coworker clones your repo and runs `pip install requests` globally too. Is their version guaranteed to match yours?
2. You activate a virtual environment. What actually changes in your shell?
3. You run `pip install -e .` instead of `pip install .`. What's the practical difference?
4. You have `requests` installed globally. You create and activate a new venv. Can you `import requests` inside it?

---

## What It Is

`pip install somepackage` downloads files from PyPI (the Python Package Index) and copies them into a directory called `site-packages`. Every Python install has a `site-packages` directory. When you `import somepackage`, Python searches `sys.path`, which includes `site-packages`. That's the whole mechanism.

The problem: there is only one global `site-packages`. If two projects need different versions of the same package, they cannot coexist globally. One wins. The other breaks.

A virtual environment solves this by creating a new, isolated `site-packages` directory for each project. Activating a venv puts its `bin/` (or `Scripts/` on Windows) directory first on `$PATH`, so `python` and `pip` point to the venv's copies instead of the global ones.

---

## The Problem Before

Without virtual environments, this is your reality:

```
Project A (built in 2022): needs requests==2.28.0
Project B (built in 2024): needs requests==2.31.0

pip install requests==2.28.0   # works for A
pip install requests==2.31.0   # OVERWRITES 2.28.0 — A might break
```

You cannot have both. One project breaks. This is not a theoretical problem — it happens constantly in teams where everyone installs packages globally.

---

## The Solution

One virtual environment per project. Each venv has its own Python binary and its own `site-packages`. They never conflict.

---

## What It Hides (Abstractions)

- **Path manipulation:** Activating a venv prepends a directory to `$PATH`. That's the entire mechanism. The activation script is a shell script you can read.
- **Symlinks:** A venv's `python` binary is usually a symlink to the system Python binary — it doesn't copy Python itself, just creates an isolated package space.
- **`sys.path` modification:** The venv's Python is configured at creation time to look at its own `site-packages` first.
- **`pip` isolation:** Each venv has its own `pip` that installs into that venv's `site-packages`.

---

## Canonical Example

```bash
python -m venv myenv          # create a venv in the myenv/ directory
myenv\Scripts\activate        # Windows: prepend myenv\Scripts\ to PATH
source myenv/bin/activate     # macOS/Linux: prepend myenv/bin/ to PATH

pip install requests          # installs into myenv's site-packages only
python -c "import requests; print(requests.__version__)"

deactivate                    # remove the venv from PATH — back to global Python
```

---

## Project Application

You will:
1. See exactly where global packages go
2. Create, activate, and inspect a virtual environment
3. Install a package in isolation and verify it doesn't exist globally
4. Write a tiny installable package from scratch using `pyproject.toml`
5. Install it in editable mode and import it from anywhere

---

## Constraints

- Python 3.8+
- Windows (PowerShell) for activation commands
- Work in a fresh directory for each step

---

## Failure Modes

| Symptom | Root Cause |
|---|---|
| `pip install X` works but `import X` fails | You installed into the wrong Python's site-packages (two Python installs, wrong pip) |
| `ModuleNotFoundError` after activating venv | Package was installed globally, not into the active venv |
| `pip install -e .` fails with "no pyproject.toml" | Running pip from wrong directory, or missing the config file |
| Package changes not reflected after edit | Not installed in editable mode (`-e`), or installed without `-e` then re-installed with `-e` |
| `deactivate` not found | Venv not activated — nothing to deactivate |

---

## Operational Reality

In production:

- Every project gets its own venv — this is not optional, it's standard practice
- `requirements.txt` is generated with `pip freeze > requirements.txt` and committed to the repo — it pins exact versions for reproducibility
- CI/CD pipelines create a fresh venv on every build, install from `requirements.txt`, then run tests — this catches "works on my machine" problems
- `pyproject.toml` is the modern standard — `setup.py` is legacy; avoid it for new projects
- `pip install -e .` is used during development; `pip install .` (without `-e`) is used for final deployments

---

## You Will See This Again In

- Every Python project you work on professionally
- Django, Flask, FastAPI — all expect to be installed in a venv
- GitHub Actions, Docker — both create isolated Python environments as standard practice
- `conda` environments — a different tool that solves the same problem, plus handles non-Python dependencies

---

## Watch For

- Running `pip install` without an active venv — you're polluting your global environment
- Committing the `venv/` directory to git — it's large, platform-specific, and unnecessary; add it to `.gitignore`
- `pip freeze` including packages you didn't intend to install (transitive dependencies) — this is normal, but know what you're pinning
- Editable installs (`-e`) in production — they require the source directory to still exist at the installed path

---

## Step 1 — Where Packages Actually Go

Before creating a venv, understand what `pip install` does globally.

### SAVE AND TRY

```
python -m site
```

**Expected output (yours will show different paths):**
```
sys.path = [
    'C:\\Users\\g4m3r\\AppData\\Local\\Programs\\Python\\Python311',
    'C:\\Users\\g4m3r\\AppData\\Local\\Programs\\Python\\Python311\\python311.zip',
    'C:\\Users\\g4m3r\\AppData\\Local\\Programs\\Python\\Python311\\DLLs',
    'C:\\Users\\g4m3r\\AppData\\Local\\Programs\\Python\\Python311\\lib',
    'C:\\Users\\g4m3r\\AppData\\Local\\Programs\\Python\\Python311\\lib\\site-packages',
]
USER_BASE: 'C:\\Users\\g4m3r\\AppData\\Roaming\\Python' (exists)
USER_SITE: 'C:\\Users\\g4m3r\\AppData\\Roaming\\Python\\Python311\\site-packages' (exists)
ENABLE_USER_SITE: True
```

The `site-packages` path at the bottom is where `pip install` puts things globally.

Now check a specific package (if you have `requests` installed; if not, try `pip`):

```
pip show pip
```

**Expected output:**
```
Name: pip
Version: 23.x.x
Location: C:\Users\g4m3r\AppData\Local\Programs\Python\Python311\lib\site-packages
```

`Location` is the `site-packages` directory. You can navigate there in Explorer and see the actual files that `pip install` puts on disk.

**Change something:** Run `pip show pip` after creating and activating a venv in Step 3 — the `Location` line will point to the venv's `site-packages` instead.

---

## Step 2 — Create a Virtual Environment

Create a new working directory and make a venv:

```
mkdir venv-demo
cd venv-demo
python -m venv myenv
```

Now look at what was created:

```
ls myenv
```

**Expected output (Windows):**
```
Include  Lib  pyvenv.cfg  Scripts
```

The important parts:

| Path | What it is |
|---|---|
| `myenv\Scripts\python.exe` | The Python executable for this venv |
| `myenv\Scripts\pip.exe` | pip that installs into THIS venv only |
| `myenv\Lib\site-packages\` | Where packages installed in this venv go |
| `myenv\pyvenv.cfg` | Config file that links this venv to a Python install |

### SAVE AND TRY

```
type myenv\pyvenv.cfg
```

**Expected output:**
```
home = C:\Users\g4m3r\AppData\Local\Programs\Python\Python311
include-system-site-packages = false
version = 3.11.x
```

`home` points to the Python install this venv was created from. `include-system-site-packages = false` means packages installed globally are NOT visible inside this venv — full isolation.

**Change something:** Open `pyvenv.cfg` and change `include-system-site-packages = false` to `true`. Activate the venv (next step), then run `pip list` — you'll see your globally-installed packages appear. Change it back to `false` before continuing.

---

## Step 3 — Activate the Venv

Activation modifies `PATH` so that `python` and `pip` resolve to the venv's copies.

### SAVE AND TRY

Check Python location before activating:

```
where python
```

**Expected output (global Python):**
```
C:\Users\g4m3r\AppData\Local\Programs\Python\Python311\python.exe
```

Now activate:

```
myenv\Scripts\activate
```

Your prompt changes to show the venv name:
```
(myenv) PS C:\Users\g4m3r\venv-demo>
```

Check Python location after activating:

```
where python
```

**Expected output:**
```
C:\Users\g4m3r\venv-demo\myenv\Scripts\python.exe
C:\Users\g4m3r\AppData\Local\Programs\Python\Python311\python.exe
```

The venv's Python is now first. That's the entire activation mechanism — `Scripts\` was prepended to `PATH`. When you type `python`, Windows finds the venv's copy first.

Check the current `pip list` — it should be nearly empty:

```
pip list
```

**Expected output:**
```
Package    Version
---------- -------
pip        23.x.x
setuptools 68.x.x
```

Only the bare minimum. No globally-installed packages are visible.

---

## Step 4 — Install a Package in Isolation

With the venv still active, install a package:

```
pip install requests
```

**Expected output:**
```
Collecting requests
  Downloading requests-2.xx.x-py3-none-any.whl (xx kB)
...
Successfully installed certifi-... charset-normalizer-... idna-... requests-2.xx.x urllib3-...
```

Now verify where it went:

```
pip show requests
```

**Expected output:**
```
Name: requests
Version: 2.xx.x
Location: C:\Users\g4m3r\venv-demo\myenv\Lib\site-packages
```

Location is inside your venv. The global `site-packages` is untouched.

### SAVE AND TRY

```
python -c "import requests; print(requests.__version__)"
```

**Expected output:**
```
2.xx.x
```

Now deactivate and try the same command:

```
deactivate
python -c "import requests; print(requests.__version__)"
```

**Two possible outcomes:**
- If you have `requests` installed globally: it prints its version (different from the venv's)
- If you don't have it globally: `ModuleNotFoundError: No module named 'requests'`

This is isolation working correctly. The venv's `requests` is not visible outside the venv.

**Reactivate before continuing:**

```
myenv\Scripts\activate
```

**Change something:** Run `pip freeze`. This shows every installed package with exact versions — the format used in `requirements.txt`. Run `pip freeze > requirements.txt` and open the file. This is the file you commit to your repo so others can recreate your exact environment with `pip install -r requirements.txt`.

---

## Step 5 — Write a `pyproject.toml`

`pyproject.toml` is the modern way to define a Python package. It replaces `setup.py`. It tells pip everything it needs to know to install your code.

Create a new directory for your package (still inside `venv-demo/`, venv still active):

```
mkdir greetings-pkg
cd greetings-pkg
```

Create this directory structure:

```
greetings-pkg/
    pyproject.toml
    src/
        greetings/
            __init__.py
            hello.py
```

Create `pyproject.toml`:

```toml
# pyproject.toml
# This file makes the directory an installable Python package.
# pip reads this file to understand what you're installing.

[build-system]
# build-system tells pip which tool to use to build your package.
# setuptools is the standard; hatchling and flit are popular alternatives.
requires = ["setuptools>=61.0"]
build-backend = "setuptools.backends.legacy:build"

[project]
# This is the metadata that appears on PyPI and in `pip show`
name = "greetings"
version = "0.1.0"
description = "A tiny greeting package — demo for Drill 1.4"

# Python version requirement
requires-python = ">=3.8"

# Third-party packages this package depends on.
# Empty for now — our package has no dependencies.
dependencies = []

[tool.setuptools.packages.find]
# Tell setuptools where to find the package source code.
# "src" means look inside the src/ directory.
where = ["src"]
```

Create `src/greetings/__init__.py`:

```python
# src/greetings/__init__.py
# This file makes greetings/ a Python package.
# We import from hello.py here so users can do:
#   from greetings import hello, goodbye
# instead of:
#   from greetings.hello import hello, goodbye

from greetings.hello import hello, goodbye
```

Create `src/greetings/hello.py`:

```python
# src/greetings/hello.py
# The actual implementation.
# These functions will be importable after `pip install -e .`

def hello(name: str) -> str:
    # Accepts a name, returns a greeting string.
    # We return instead of print so callers control output.
    return f"Hello, {name}!"

def goodbye(name: str) -> str:
    return f"Goodbye, {name}. See you next time."
```

---

## Step 6 — Install in Editable Mode

`pip install .` copies your source files into `site-packages`. If you change `hello.py`, the installed version doesn't change — you have to reinstall.

`pip install -e .` installs a pointer (a `.pth` file) that says "the source for this package is over there." Changes to `hello.py` are immediately visible without reinstalling.

### SAVE AND TRY

Make sure you're in `greetings-pkg/` and the venv is active:

```
pip install -e .
```

**Expected output:**
```
Obtaining file:///C:/Users/g4m3r/venv-demo/greetings-pkg
  Installing build dependencies ... done
  Checking if build page is up to date ... done
  Preparing metadata (pyproject.toml) ... done
Installing collected packages: greetings
  Running setup.py develop for greetings
Successfully installed greetings-0.1.0
```

Now verify the installation:

```
pip show greetings
```

**Expected output:**
```
Name: greetings
Version: 0.1.0
Summary: A tiny greeting package — demo for Drill 1.4
Location: C:\Users\g4m3r\venv-demo\greetings-pkg\src
Editable project location: C:\Users\g4m3r\venv-demo\greetings-pkg\src
```

`Location` points to your source directory — not a copy in `site-packages`. That's editable mode.

Now import it:

```
python -c "from greetings import hello; print(hello('World'))"
```

**Expected output:**
```
Hello, World!
```

**Change something — prove editable mode works:**

Open `src/greetings/hello.py` and change the greeting:

```python
def hello(name: str) -> str:
    return f"Greetings and salutations, {name}!"  # changed
```

Without reinstalling, run the import again:

```
python -c "from greetings import hello; print(hello('World'))"
```

**Expected output:**
```
Greetings and salutations, World!
```

The change is immediately visible. No reinstall required. This is the practical reason editable mode exists — you edit source, test immediately, edit again.

Change the greeting back to `"Hello, {name}!"` when done.

---

## Step 7 — Write a Script That Uses Your Package

Create a script outside the package directory — anywhere in the filesystem (as long as the venv is active):

Go up to `venv-demo/`:
```
cd ..
```

Create `demo_script.py`:

```python
# demo_script.py
# This script lives outside the greetings-pkg/ directory.
# It can import greetings because the package is installed in the active venv.
# There are no sys.path tricks here — pip handles the discovery.

from greetings import hello, goodbye

names = ["Alice", "Bob", "Carol"]

for name in names:
    # hello() and goodbye() return strings — we print them here
    print(hello(name))

print()  # blank line for readability

for name in names:
    print(goodbye(name))
```

### SAVE AND TRY

```
python demo_script.py
```

**Expected output:**
```
Hello, Alice!
Hello, Bob!
Hello, Carol!

Goodbye, Alice. See you next time.
Goodbye, Bob. See you next time.
Goodbye, Carol. See you next time.
```

**Change something:** Deactivate the venv (`deactivate`) and run `python demo_script.py` again.

**Expected error:**
```
ModuleNotFoundError: No module named 'greetings'
```

The package is only installed in the venv. Without the venv active, `greetings` doesn't exist from Python's perspective. Reactivate (`myenv\Scripts\activate`) to restore it.

---

## Final State

Your `venv-demo/` directory should look like:

```
venv-demo/
    myenv/               <- venv (add to .gitignore)
    requirements.txt     <- generated by pip freeze
    demo_script.py
    greetings-pkg/
        pyproject.toml
        src/
            greetings/
                __init__.py
                hello.py
```

### SAVE AND TRY (Full Verification)

All commands with venv active:

```
pip show greetings
```
Expected: shows name, version, editable location

```
python -c "import greetings; print(dir(greetings))"
```
Expected: `['__builtins__', ..., 'goodbye', 'hello', ...]`

```
python demo_script.py
```
Expected: 6 greeting lines

```
pip list | findstr greetings
```
Expected: `greetings    0.1.0`

---

## Challenge

**No solution provided. Requirements checklist only.**

Create a `string_tools` package with three utility functions, a proper `pyproject.toml`, and a separate script that uses all three. Install it in editable mode and verify the installation.

**Starter — create this structure:**

```
string-tools-pkg/
    pyproject.toml      <- you write this
    src/
        string_tools/
            __init__.py  <- you write this
            core.py      <- you write this
test_script.py           <- outside the package directory
```

**Function specifications for `core.py`:**

```python
def reverse(s: str) -> str:
    # Returns the string reversed
    # reverse("hello") -> "olleh"
    ...

def palindrome_check(s: str) -> bool:
    # Returns True if the string reads the same forwards and backwards
    # Case-insensitive, ignores spaces
    # palindrome_check("Racecar") -> True
    # palindrome_check("hello") -> False
    ...

def word_count(s: str) -> dict:
    # Returns a dict mapping each word to its count
    # Case-insensitive
    # word_count("the cat sat on the mat") -> {"the": 2, "cat": 1, "sat": 1, "on": 1, "mat": 1}
    ...
```

**Requirements checklist:**

- [ ] `pyproject.toml` exists with correct `name`, `version`, `description`, `requires-python`
- [ ] `pip install -e .` succeeds without errors
- [ ] `pip show string_tools` shows the package as installed with an editable location
- [ ] `test_script.py` imports from `string_tools` using `from string_tools import reverse, palindrome_check, word_count`
- [ ] `test_script.py` demonstrates all three functions with at least two calls each, printing results
- [ ] `reverse("python")` returns `"nohtyp"`
- [ ] `palindrome_check("A man a plan a canal Panama")` returns `True`
- [ ] `word_count("to be or not to be")` returns `{"to": 2, "be": 2, "or": 1, "not": 1}`
- [ ] Running `test_script.py` produces correct output without modifying `sys.path`
- [ ] Changing a function in `core.py` is immediately reflected when running `test_script.py` again (no reinstall)

**When done:** Run `pip show string_tools` and confirm `Editable project location` points to your `src/` directory. Run `test_script.py` from a different directory (e.g., `cd ..` then `python string-tools-pkg/../test_script.py`) and confirm it still works — the package is installed in the venv, not tied to a directory.

**Stuck? Ask AI:** "I'm writing a Python package with pyproject.toml and setuptools. My package is in src/string_tools/. How do I configure pyproject.toml so that pip install -e . makes it importable as `import string_tools`? What does the [tool.setuptools.packages.find] section need to say?"

---

## Quick Check Answers

1. **No.** There is no guarantee of version match without pinning. Your `pip install` might pull down a different version than your coworker's depending on when each of you ran it. `requirements.txt` with `pip freeze` solves this — it pins exact versions so everyone installs identically.

2. **Only `PATH` changes.** The activation script prepends the venv's `Scripts\` (or `bin/`) directory to `PATH`. Now `python` and `pip` resolve to the venv's copies instead of the global ones. Nothing else changes — no environment variables, no registry entries, no magic.

3. **`pip install -e .` installs a pointer; `pip install .` copies files.** With `-e` (editable), changes to your source code are immediately visible without reinstalling. Without `-e`, pip copies your source to `site-packages` — you must reinstall after every change.

4. **No.** A new venv starts empty (only pip and setuptools). The global `requests` is not visible inside the venv unless `pyvenv.cfg` has `include-system-site-packages = true`. This isolation is the entire point of virtual environments.
