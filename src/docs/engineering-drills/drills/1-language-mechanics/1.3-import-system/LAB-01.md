# DRILL 1.3 — Python: The Import System

**Series:** Language Mechanics | **Difficulty:** Intermediate | **Time:** 60–90 min  
**Project:** Unit Converter — a tiny multi-file Python app that breaks three specific ways

---

## Quick Check

Answer these before reading. Check your answers at the bottom.

1. You write `import math` in two different files. Does Python execute `math.py` twice?
2. You delete `__init__.py` from a package directory. What breaks?
3. You write `from converters import distance`. Does this execute `distance.py`?
4. Module A imports module B. Module B imports module A. What happens and why?

---

## What It Is

The `import` statement is a runtime operation. When Python sees `import math`, it does three things in order:

1. Searches `sys.path` — a list of directories — for a file named `math.py` (or a package named `math/`)
2. Executes the file from top to bottom, building a module object
3. Caches the result in `sys.modules` and binds the name in the current namespace

That's it. There is no linker, no compile step, no magic. `import` is a function call that finds, runs, and caches a file.

**The cache matters.** `import math` twice only runs `math.py` once. The second call finds it in `sys.modules` and returns immediately. This means module-level code (like creating a database connection, reading a config file, registering plugins) runs exactly once per process.

---

## The Problem Before

Before import systems existed, you had one option: copy-paste code into every file that needed it. Change the function? Find and update every copy. This is how bugs live forever.

The alternative — dumping everything into one file — works until it doesn't. One 3,000-line file with every function your app needs is impossible to navigate, impossible to test in isolation, and impossible for two developers to work on without constant merge conflicts.

---

## The Solution

Split code into modules (single `.py` files) and packages (directories with `__init__.py`). Import what you need, where you need it. Python handles finding and executing the files.

---

## What It Hides (Abstractions)

- **File I/O:** Python reads your `.py` file from disk. You never see this.
- **Compilation to bytecode:** Python compiles `.py` to `.pyc` (in `__pycache__/`) the first time it's imported. Subsequent imports use the cached bytecode. You rarely see this.
- **Module objects:** `import math` creates a `types.ModuleType` object. `math.sqrt` is an attribute lookup on that object.
- **`sys.modules` management:** Python's import machinery handles cache lookups and insertion atomically (mostly).

---

## Canonical Example

```python
import math          # finds math.py in sys.path, executes it, caches in sys.modules
import math          # returns cached version — math.py does NOT run again

from math import sqrt  # still executes all of math.py — just binds one name here
import math as m       # same execution, different local name
```

---

## Project Application

You will build a unit converter split across multiple files. The project will break in three specific ways, each revealing something real about how imports work.

---

## Constraints

- Python 3.8+
- No third-party packages
- No IDE — use a terminal and a plain text editor

---

## Failure Modes

| Symptom | Root Cause |
|---|---|
| `ModuleNotFoundError: No module named 'converters'` | Python can't find your package in `sys.path` |
| `ImportError: cannot import name 'X' from partially initialized module` | Circular import — module not done executing when something tries to import from it |
| `AttributeError: module 'converters' has no attribute 'distance'` | `__init__.py` doesn't expose submodule |
| Code runs twice | Missing `if __name__ == "__main__"` guard |

---

## Operational Reality

In production Python codebases:

- Circular imports are one of the most common restructuring problems when a codebase grows without planning
- `sys.path` manipulation (e.g., `sys.path.insert(0, ...)`) is a code smell — it means the project isn't installable as a proper package
- `__init__.py` files control your public API — what users of your package can import
- Understanding `__name__` matters for writing modules that are both importable and runnable as scripts

---

## You Will See This Again In

- Every Python project larger than one file
- Django and Flask apps (they are packages; their `__init__.py` sets up the app)
- pytest (it manipulates `sys.path` to find your tests)
- `pip install` (it installs packages into `sys.path` so you can import them anywhere)

---

## Watch For

- Naming a file the same as a standard library module (e.g., `math.py`, `os.py`) — your file shadows the stdlib
- Running a script from the wrong directory — `sys.path` includes the directory of the script being run, which changes based on where you run it from
- `from package import *` — only works if `__init__.py` defines `__all__`; otherwise imports nothing or everything depending on the version

---

## Step 1 — Everything in One File

Start here. This works. We're going to break it deliberately.

Create this directory structure:

```
unit-converter/
    converter.py
```

Create `converter.py`:

```python
# converter.py
# Everything in one file. This works, but it's a dead end.
# When this file hits 500 lines, nobody will want to touch it.

def miles_to_km(miles):
    # 1 mile = 1.60934 km
    # We hardcode the conversion factor — it never changes
    return miles * 1.60934

def km_to_miles(km):
    return km / 1.60934

def celsius_to_fahrenheit(c):
    # The formula: multiply by 9/5, then add 32
    # Why 9/5? Because a Fahrenheit degree is 5/9 of a Celsius degree
    return (c * 9 / 5) + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5 / 9

def kg_to_lbs(kg):
    # 1 kg = 2.20462 lbs
    return kg * 2.20462

def lbs_to_kg(lbs):
    return lbs / 2.20462

# This block only runs when you execute this file directly.
# If another file imports converter.py, this block is SKIPPED.
# We'll explain exactly why in Step 6.
if __name__ == "__main__":
    print(f"10 miles = {miles_to_km(10):.2f} km")
    print(f"100°C = {celsius_to_fahrenheit(100):.1f}°F")
    print(f"70 kg = {kg_to_lbs(70):.2f} lbs")
```

### SAVE AND TRY

```
cd unit-converter
python converter.py
```

**Expected output:**
```
10 miles = 16.09 km
100°C = 212.0°F
70 kg = 154.32 lbs
```

**Change something:** Remove the `if __name__ == "__main__":` line and dedent the three `print()` calls. Run the file again — same output. Now try `python -c "import converter"` from the same directory. The prints run even though you're just importing. That's the problem `if __name__` solves.

Put the guard back before continuing.

---

## Step 2 — Split Into Modules (First Break)

The single-file approach breaks down as the project grows. Split the converters into separate files.

Create this structure:

```
unit-converter/
    converter.py
    converters/
        distance.py
        temperature.py
        weight.py
```

Create `converters/distance.py`:

```python
# converters/distance.py
# This file IS the distance module.
# Python will execute this file when someone does: import converters.distance

def miles_to_km(miles):
    # Same formula as before, now lives in its own dedicated file
    return miles * 1.60934

def km_to_miles(km):
    return km / 1.60934
```

Create `converters/temperature.py`:

```python
# converters/temperature.py

def celsius_to_fahrenheit(c):
    return (c * 9 / 5) + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5 / 9
```

Create `converters/weight.py`:

```python
# converters/weight.py

def kg_to_lbs(kg):
    return kg * 2.20462

def lbs_to_kg(lbs):
    return lbs / 2.20462
```

Now update `converter.py` to import from the submodules:

```python
# converter.py (updated)
# We're trying to import from submodules.
# This will FAIL. That's intentional — we need to see why.

import converters.distance    # <- attempting to import the distance submodule
import converters.temperature
import converters.weight

if __name__ == "__main__":
    print(f"10 miles = {converters.distance.miles_to_km(10):.2f} km")
    print(f"100°C = {converters.temperature.celsius_to_fahrenheit(100):.1f}°F")
    print(f"70 kg = {converters.weight.kg_to_lbs(70):.2f} lbs")
```

### SAVE AND TRY (This Breaks)

```
python converter.py
```

**Expected error:**
```
ModuleNotFoundError: No module named 'converters'
```

**Why it broke:** Python treats `converters/` as a regular directory, not a package. Python only recognizes a directory as a package if it contains an `__init__.py` file. Without it, `import converters.distance` fails before it even looks for `distance.py`.

---

## Step 3 — The `__init__.py` File

The `__init__.py` file is the contract that says "this directory is a Python package." Its presence is what makes `import converters.distance` work.

Create an empty `__init__.py`:

```
unit-converter/
    converter.py
    converters/
        __init__.py     <- CREATE THIS (empty for now)
        distance.py
        temperature.py
        weight.py
```

The file can be completely empty. Create it and leave it blank.

### SAVE AND TRY

```
python converter.py
```

**Expected output:**
```
10 miles = 16.09 km
100°C = 212.0°F
70 kg = 154.32 lbs
```

It works now. Python sees `__init__.py`, recognizes `converters/` as a package, and allows `import converters.distance`.

**What `__init__.py` actually does:**

When Python executes `import converters.distance`, it does this in order:
1. Find `converters/` in `sys.path`
2. Execute `converters/__init__.py` — this creates the `converters` module object
3. Find `converters/distance.py`
4. Execute `distance.py` — this creates the `converters.distance` module object
5. Cache both in `sys.modules`

`__init__.py` runs first, every time someone imports anything from your package. This makes it the right place to:
- Define your package's public API
- Set up package-level constants
- Import submodules you always want available

**Change something:** Put this in `__init__.py`:

```python
# __init__.py
print("converters package is being imported")
```

Run `python converter.py`. You'll see the print once, at the top. Now run it again — you'll see it once per process, not once per import of a submodule. Remove the print before continuing.

---

## Step 4 — `sys.path`: Where Python Looks

Every `import` statement searches `sys.path` — a list of directories. Understanding this list explains every `ModuleNotFoundError` you will ever see.

### SAVE AND TRY

```
python -c "import sys; print('\n'.join(sys.path))"
```

**Expected output (yours will differ):**
```

C:\Users\g4m3r\AppData\Local\Programs\Python\Python311\python311.zip
C:\Users\g4m3r\AppData\Local\Programs\Python\Python311\DLLs
C:\Users\g4m3r\AppData\Local\Programs\Python\Python311\lib
C:\Users\g4m3r\AppData\Local\Programs\Python\Python311
C:\Users\g4m3r\AppData\Local\Programs\Python\Python311\lib\site-packages
```

When you run this from the `unit-converter/` directory:
```
python -c "import sys; print(sys.path[0])"
```

**Expected output:**
```

```
(empty string)

An empty string `''` means "the current working directory." This is why `import converters.distance` works when you run the script from `unit-converter/` — Python looks in the current directory first, finds `converters/`, and imports it.

**What each entry means:**

| Entry | What it is |
|---|---|
| `''` (empty string) | Current working directory — changes based on where you run Python |
| `python311.zip` | Compressed stdlib — rarely used in practice |
| `.../lib` | The standard library (`math`, `os`, `json`, etc.) |
| `.../site-packages` | Where `pip install` puts third-party packages |

**Why this matters:** If you `import converters` from a script in a different directory, it fails — because `unit-converter/` is not in `sys.path`. This is why proper Python projects are installed as packages (covered in Drill 1.4) rather than relying on directory-based imports.

**Change something:** From the `unit-converter/` directory, run:

```
cd ..
python -c "import converters.distance"
```

**Expected error:**
```
ModuleNotFoundError: No module named 'converters'
```

The exact same code fails from one directory up. `sys.path` includes the directory you ran Python from, not the directory where `converter.py` lives.

Go back into `unit-converter/` before continuing.

---

## Step 5 — Circular Imports (Second Break)

This is the most confusing import error you will encounter. It happens when two modules try to import each other.

Add a `utils.py` file that needs something from `distance.py`, and modify `distance.py` to import from `utils.py`:

Create `converters/utils.py`:

```python
# converters/utils.py
# This module wants to use the distance converter to validate input.
# It imports from distance.py.

from converters.distance import km_to_miles  # <- this will cause a problem

def validate_positive(value, unit):
    # Imaginary validation: ensure the value makes physical sense
    if value < 0:
        raise ValueError(f"Cannot have negative {unit}")
    return value
```

Now modify `converters/distance.py` to import from `utils.py`:

```python
# converters/distance.py (modified — creates circular import)
# distance imports utils, utils imports distance.
# Python cannot resolve this.

from converters.utils import validate_positive  # <- importing from utils

def miles_to_km(miles):
    validate_positive(miles, "miles")  # using the validator
    return miles * 1.60934

def km_to_miles(km):
    validate_positive(km, "km")
    return km / 1.60934
```

### SAVE AND TRY (This Breaks)

```
python converter.py
```

**Expected error:**
```
ImportError: cannot import name 'km_to_miles' from partially initialized module 
'converters.distance' (most likely due to a circular import)
```

**Exactly why this fails — the execution trace:**

1. Python starts executing `converter.py`
2. Hits `import converters.distance`
3. Starts executing `distance.py`
4. `distance.py` hits `from converters.utils import validate_positive`
5. Starts executing `utils.py`
6. `utils.py` hits `from converters.distance import km_to_miles`
7. Python checks `sys.modules` — `converters.distance` IS there (it was added at step 3)
8. But `distance.py` is only HALF executed — `km_to_miles` hasn't been defined yet
9. Python tries to get `km_to_miles` from the partially-built module object — it doesn't exist
10. **Crash**

The module IS in `sys.modules` — that's what makes circular imports so confusing. The problem isn't that Python can't find the module. The problem is that the module isn't finished yet.

**The fix:** Move the shared logic out of both modules into a third module that neither of them imports.

Create `converters/validation.py`:

```python
# converters/validation.py
# This module has no imports from converters/.
# It's the bottom of the dependency tree.
# distance.py and utils.py can both import from here safely.

def validate_positive(value, unit):
    if value < 0:
        raise ValueError(f"Cannot have negative {unit}")
    return value
```

Update `converters/utils.py` to import from `validation.py` instead:

```python
# converters/utils.py (fixed)
# Now imports from validation, not from distance.
# The circular dependency is broken.

from converters.validation import validate_positive  # <- no longer circular

def format_result(value, from_unit, to_unit):
    # A formatting helper — this is why utils.py exists
    return f"{value:.4f} {from_unit} -> {to_unit}"
```

Update `converters/distance.py` to import from `validation.py`:

```python
# converters/distance.py (fixed)
# Imports from validation, not from utils.
# validation.py has no imports from converters/ — safe.

from converters.validation import validate_positive

def miles_to_km(miles):
    validate_positive(miles, "miles")
    return miles * 1.60934

def km_to_miles(km):
    validate_positive(km, "km")
    return km / 1.60934
```

### SAVE AND TRY

```
python converter.py
```

**Expected output:**
```
10 miles = 16.09 km
100°C = 212.0°F
70 kg = 154.32 lbs
```

The fix is always the same: find the code that both modules need, extract it into a module that imports from neither, and have both modules import from that new module.

---

## Step 6 — `__name__ == "__main__"` (Third Break)

Every Python file has a `__name__` variable. Its value depends on how the file is run:

- Run directly (`python distance.py`): `__name__` is `"__main__"`
- Imported by another file: `__name__` is the module's dotted name (e.g., `"converters.distance"`)

This matters because module-level code runs on import. If you put test prints, demo code, or setup logic at the module level without a guard, it runs every time the module is imported — not just when you run the file directly.

Demonstrate this. Add demo code to `converters/distance.py` WITHOUT a guard:

```python
# converters/distance.py (demonstrating the problem)

from converters.validation import validate_positive

def miles_to_km(miles):
    validate_positive(miles, "miles")
    return miles * 1.60934

def km_to_miles(km):
    validate_positive(km, "km")
    return km / 1.60934

# NO GUARD — this runs on every import
print("Testing distance module:")
print(f"  5 miles = {miles_to_km(5):.2f} km")
```

### SAVE AND TRY (This Breaks in a Subtle Way)

```
python converter.py
```

**Expected output:**
```
Testing distance module:
  5 miles = 8.05 km
10 miles = 16.09 km
100°C = 212.0°F
70 kg = 154.32 lbs
```

The test output from `distance.py` appears when you run `converter.py` — because importing `distance.py` executes it. This is the problem. Multiply this across a large codebase and imports start printing things, making network requests, or running slow setup code unexpectedly.

**The fix:** wrap executable code in a guard:

```python
# converters/distance.py (fixed with guard)

from converters.validation import validate_positive

def miles_to_km(miles):
    validate_positive(miles, "miles")
    return miles * 1.60934

def km_to_miles(km):
    validate_positive(km, "km")
    return km / 1.60934

# This block ONLY runs when you execute this file directly:
#   python converters/distance.py
# When converter.py does `import converters.distance`, __name__ is
# "converters.distance" — not "__main__" — so this block is skipped.
if __name__ == "__main__":
    print("Testing distance module:")
    print(f"  5 miles = {miles_to_km(5):.2f} km")
    print(f"  8.05 km = {km_to_miles(8.05):.2f} miles")
```

### SAVE AND TRY

```
python converter.py
```

**Expected output:**
```
10 miles = 16.09 km
100°C = 212.0°F
70 kg = 154.32 lbs
```

```
python converters/distance.py
```

**Expected output:**
```
Testing distance module:
  5 miles = 8.05 km
  8.05 km = 5.00 miles
```

The guard makes one file serve two purposes: a reusable module AND a runnable script.

**Change something:** In `converter.py`, change `import converters.distance` to `from converters.distance import miles_to_km`. Note that the import still executes all of `distance.py` — the `if __name__` block is still skipped. `from X import Y` does not avoid executing X.

---

## Final State

Your project should look like this:

```
unit-converter/
    converter.py
    converters/
        __init__.py
        distance.py
        temperature.py
        weight.py
        validation.py
        utils.py
```

### SAVE AND TRY (Full Verification)

```
python converter.py
```
Expected: 3 conversion lines, no extra prints

```
python converters/distance.py
```
Expected: distance module test output

```
python -c "import sys; sys.path.insert(0, '.'); import converters.distance; print(converters.distance.miles_to_km(1))"
```
Expected: `1.60934`

---

## Challenge

**No solution provided. Requirements checklist only.**

You are given a broken project. Three modules have a circular import problem. Your job is to restructure the imports to break the cycle without changing the public API — the names that `main.py` imports must remain the same.

**Starter — create these files exactly:**

`main.py`:
```python
from app.users import get_user_display
from app.posts import get_post_summary

print(get_user_display(1))
print(get_post_summary(1))
```

`app/__init__.py`: (empty)

`app/users.py`:
```python
from app.posts import get_post_count  # <- part of the cycle

USERS = {1: {"name": "Alice", "id": 1}}

def get_user_display(user_id):
    user = USERS[user_id]
    count = get_post_count(user_id)
    return f"{user['name']} ({count} posts)"
```

`app/posts.py`:
```python
from app.users import USERS  # <- part of the cycle

POSTS = {1: {"title": "Hello World", "user_id": 1}}

def get_post_count(user_id):
    return sum(1 for p in POSTS.values() if p["user_id"] == user_id)

def get_post_summary(post_id):
    post = POSTS[post_id]
    user = USERS[post["user_id"]]
    return f'"{post["title"]}" by {user["name"]}'
```

**Requirements checklist:**

- [ ] Running `python main.py` produces no errors
- [ ] Output is: `Alice (1 posts)` then `"Hello World" by Alice`
- [ ] `main.py` is not modified — the two import lines stay exactly as written
- [ ] No `sys.path` manipulation
- [ ] All three modules (`users.py`, `posts.py`, and any new modules you add) have `if __name__ == "__main__"` guards with at least one test print each
- [ ] `app/` has a proper `__init__.py`

**When done:** Run `python main.py` and verify both lines print correctly. Then run `python app/users.py` and `python app/posts.py` individually — each should print its own test output.

**Stuck? Ask AI:** "I have a circular import between users.py and posts.py in a Python project. users.py needs get_post_count from posts.py, and posts.py needs the USERS dict from users.py. How do I restructure this without changing what main.py imports?"

---

## Quick Check Answers

1. **No.** The second `import math` finds `math` in `sys.modules` and returns the cached version. `math.py` executes exactly once per process.

2. **`import package.submodule` fails** with `ModuleNotFoundError`. Python won't treat the directory as a package without `__init__.py`.

3. **Yes.** `from converters import distance` still executes the entire `distance.py` file. The `from X import Y` syntax only affects which name gets bound in the current namespace — not whether X is executed.

4. **It crashes with `ImportError: cannot import name X from partially initialized module`.** Python starts executing A, which tries to import B, which tries to import from A — but A isn't done executing yet. Python finds A in `sys.modules` (it was added when execution started), but the name B needs hasn't been defined yet in A's partially-built module object.
