# Python Tool Database — LAB 00c — Red-Green-Refactor: The Heartbeat

**Prerequisites:** Lab 00 (Python installed, virtual environment created and active, `python-tooldb/` folder exists) and Lab 00b (XP practices — you know what TDD is and what the three steps mean). You should be able to open a terminal inside `python-tooldb/` with your virtual environment active.

**What this lab adds:**
- The first real Python code in this project: a `calculate_sfm` function
- pytest installed and running — the test runner every lesson from here uses
- One complete Red-Green-Refactor cycle with a visible, specific state at each step
- Two Python language features used in every lesson from here: `def` (defining a function) and `import` (bringing in code from another file)

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Lab 00b said "Green means the minimum code." If you could pass the test by writing `return 1000` — a hardcoded constant — should you? Why or why not?
> 2. In the Red step, the test fails. Does it matter *how* it fails — which specific error you see? Or is any failure the same?
> 3. You rename a parameter from `d` to `diameter_inches` and all the tests still pass. What has that confirmed?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson your terminal will show:

```
collected 1 item

tests/test_sfm.py .                                      [100%]

1 passed in 0.01s
```

And two new files will exist:

```
python-tooldb/
    tooldb/
        __init__.py
        sfm.py          ← calculate_sfm lives here, clean and refactored
    tests/
        test_sfm.py     ← one test, written before the function existed
```

You will have written the test file first, watched it fail, written the function, watched it pass, then improved the code until it is production-quality — all without ever breaking the test.

---

## The Formula This Lesson Uses

Before writing any code, you need to understand the domain. What does "SFM" mean and where does the formula come from?

### Math: Surface Feet per Minute (SFM)

**What it computes:** The speed at which the cutting edge of a rotating tool moves past the workpiece material, measured in feet per minute.

**The real-world analogy:** Picture the tip of a cutting tooth as a point painted on the rim of a bicycle wheel. The wheel (the cutter) spins at some RPM. Every full revolution, that point traces one complete circle — a circle with circumference equal to `π × diameter`. If the cutter is 1 inch in diameter, that circle is `π × 1.0` ≈ 3.14 inches around. At 3820 RPM, the tip travels `3.14 × 3820` inches every minute. Divide by 12 to convert inches to feet.

```
SFM = (π × diameter_inches × rpm) / 12

Example: 1.0 inch diameter, 3820 RPM
SFM = (3.14159 × 1.0 × 3820) / 12
    = 12000.9 / 12
    = 1000.07 feet per minute  →  rounded: 1000 SFM
```

**Why machinists round to whole numbers:** SFM is a setup guide, not a measurement. Material hardness, coolant flow, and tool condition vary in the real world. Reporting "1000 SFM" is the convention — the fractional part is noise.

**Why it matters here:** This specific formula has a known answer for known inputs. For a 1.0-inch tool at 3820 RPM, the answer rounds to 1000. That known answer is what makes it ideal for teaching TDD: you can write the assertion before writing a single line of the function.

**Watch for:** The formula uses diameter, not radius. If you accidentally pass the radius, the result is half the correct answer. That is a common mistake when reading old machining tables that list "radius" as "r" and "diameter" as "d" — the variable names overlap the convention.

---

## Setup — Create the Project Structure

The project needs two folders: one for source code, one for tests. Python convention separates them so tests are never shipped to users.

Open a terminal in `python-tooldb/` with your virtual environment active. Then create the folder structure:

```powershell
New-Item -ItemType Directory -Path tooldb   # source package folder
New-Item -ItemType Directory -Path tests    # test folder
```

Create the package marker file inside `tooldb/`:

```powershell
New-Item -ItemType File -Path tooldb\__init__.py   # empty file — explained below
```

**What `__init__.py` does:** Python only recognizes a folder as an importable package — something you can `import` from — if it contains a file named `__init__.py`. The file can be completely empty; its presence is the signal. Without it, `from tooldb.sfm import calculate_sfm` would fail with `ModuleNotFoundError: No module named 'tooldb'`, even if the `tooldb/` folder and `sfm.py` both exist.

Now install pytest:

```powershell
pip install pytest
```

### SAVE AND TRY

Verify pytest is installed:

```powershell
pytest --version
```

**You should see:**

```
pytest 8.x.x
```

The exact version number may differ — anything `7.x` or higher works fine for this series.

**In the terminal:** Run `pytest --help` to see available options. You will use `pytest tests/`, `pytest -v` (verbose), and `pytest -k "some_name"` (run matching tests) throughout this series.

**If you see "command not found" or "not recognized":** Your virtual environment is not active. Run `.venv\Scripts\Activate.ps1`, then try again.

**Change something:** Run `pytest` with no arguments from inside `python-tooldb/`. pytest will report "no tests ran" because no test files exist yet. That is correct — there is nothing to fail.

---

## Concept: A Python Source File

**What it is:** A text file with a `.py` extension that the Python interpreter reads and executes line by line.

**The problem before:**

Typing code directly in the Python terminal (the `>>>` prompt) works for experiments, but nothing persists — close the window and everything is gone. You would retype the SFM function every session.

**The solution:**

Write the code in a `.py` file. The interpreter reads and runs that file on demand:

```powershell
python sfm.py   # runs every line in sfm.py from top to bottom
```

pytest does the same thing internally when it runs your tests.

**What it hides:** The full interpreter pipeline: reading text, tokenizing it into symbols, parsing symbols into an abstract syntax tree, compiling that tree into bytecode, and executing bytecode in the Python virtual machine. From your perspective: you write text, something happens, you see results.

**Canonical example (General):**

A recipe card. The card is text. A cook (the interpreter) follows it. The card persists — run it tomorrow and get the same result. You do not need to understand the cook's process; you only need to write clear instructions.

**Project application:**

Every piece of working logic in this project lives in a `.py` file inside `tooldb/`. Every test lives in a `.py` file inside `tests/`. pytest finds test files automatically by their name pattern (`test_*.py`).

**Smallest possible example:**

Create `hello.py` anywhere and write:

```python
print("hello")   # print() outputs a line to the terminal, then adds a newline
```

Run it:

```powershell
python hello.py
```

Output: `hello`

**You will see this again in:**
- Every Python project — `.py` files are the fundamental unit of organization
- When pytest says "collected 3 items" — it found and read 3 test files
- `python -m pytest` — running pytest as a Python module rather than a standalone command
- Django's `manage.py`, Flask's `app.py` — entry point scripts that start a web server

**Watch for:** Python is case-sensitive. `sfm.py` and `SFM.py` are different files. If pytest reports "no tests found," the most common cause is a mistyped filename.

---

## Concept: Defining a Function (`def`)

**What it is:** A named, reusable block of code that takes inputs (parameters) and returns an output — an abstraction that gives a calculation a name.

**The problem before:**

Without a function, every caller repeats the full formula:

```python
# Every place that needs SFM must copy the formula:
sfm_endmill = 3.14159 * 1.0 * 3820 / 12    # endmill
sfm_drill   = 3.14159 * 0.5 * 7640 / 12    # drill
sfm_rougher = 3.14159 * 0.75 * 5093 / 12   # roughing endmill
# Change the formula once? Find and fix every copy. Miss one → silent wrong answer.
```

**The solution:**

Define the calculation once with named parameter placeholders:

```python
def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / 12
```

Every caller passes their specific values. The formula lives in one place. Change it once, and every caller is updated.

**What it hides:** The repeated implementation. A function is a contract: "hand me a diameter and an RPM, I give you a surface speed." Callers do not need to know how the SFM is computed — only what goes in and what comes out.

**The invariant it protects:** The formula is defined in exactly one place. Copy-paste duplication cannot create inconsistency because there is nothing to copy.

**Canonical example (General):**

```python
def add(first_number, second_number):  # def = start of function; name = "add"
    return first_number + second_number  # return sends the result back to the caller

result = add(3, 4)   # call the function: first_number=3, second_number=4
print(result)        # outputs: 7
```

Line by line:

- `def` — the keyword that begins a function definition
- `add` — the name you assign; use this name every time you call the function
- `(first_number, second_number)` — the **parameters**: placeholders for the real values the caller provides
- `:` — closes the function header; everything indented below belongs to the function body
- `return` — sends a value back to whoever called the function; without it, the function implicitly returns `None`

**Project application:**

`calculate_sfm` takes two numbers (a diameter in inches, an RPM) and returns one number (surface feet per minute). Every test, every UI form, every future calculation that needs SFM goes through this single definition.

**Smallest possible example:**

```python
def double(number):     # one parameter: number
    return number * 2   # multiply it by 2, return the result

print(double(5))   # → 10
print(double(3))   # → 6   — same function, different input, different output
```

**Why it matters here:** The function you are about to test uses `def` and `return`. Understanding what those words do — giving code a name and specifying what it gives back — is the foundation for every lesson from here on.

**You will see this again in:**
- Every Python file you ever write — functions are the fundamental unit of logic
- Class methods in Labs 09 and 10 — same `def`, but inside a class, with `self` as the first parameter
- pytest test functions — pytest looks specifically for functions whose names start with `test_`
- Callbacks in Lab 03 — functions passed as arguments to other functions, called later

**Watch for:** Python uses indentation (4 spaces, not a tab) to mark what is inside a function. If the `return` line lines up with `def` instead of being indented under it, Python reads it as a separate statement that runs at import time, not inside the function.

---

## Concept: The `return` Statement

**What it is:** The statement inside a function that specifies what value the function sends back to its caller.

**Why it is separate from `def`:** `def` creates the function. `return` specifies the output. They are different things.

**The problem before:**

```python
def calculate_sfm_broken(diameter_inches, rpm):
    result = 3.14159 * diameter_inches * rpm / 12  # computes the answer
    # no return — the answer is computed but never sent back

sfm = calculate_sfm_broken(1.0, 3820)
print(sfm)   # prints: None  — the function ran but returned nothing
```

**The solution:**

```python
def calculate_sfm(diameter_inches, rpm):
    result = 3.14159 * diameter_inches * rpm / 12
    return result   # ← sends the computed value back to the caller
```

Or equivalently (the version you will write):

```python
def calculate_sfm(diameter_inches, rpm):
    return 3.14159 * diameter_inches * rpm / 12   # compute and return in one line
```

**Canonical example (General):**

A vending machine is a function: you provide inputs (coins, selection), it does work (checks inventory, dispenses), and returns an output (the item). If the machine swallowed your money and returned nothing — that is a function without `return`.

**Smallest possible example:**

```python
def get_double(number):
    return number * 2        # the result travels back to wherever this was called

value = get_double(7)        # value = 14
print(value)                 # 14
```

**You will see this again in:**
- Every function you write — the return value is the function's output
- SQLAlchemy: `session.execute(query)` returns a result object you must capture
- FastAPI: route functions must return a response object or dict

**Watch for:** A function with no `return` (or with `return` on a line that never executes) returns `None`. If your test fails with `assert round(None) == 1000`, you have a missing or unreachable `return`.

---

## Concept: `assert`

**What it is:** A statement that verifies a condition is true at runtime — if it is not, Python raises an `AssertionError` immediately.

**The problem before:**

A test function without `assert` has no way to fail:

```python
def test_calculate_sfm():
    result = calculate_sfm(1.0, 3820)
    print(result)   # prints the answer but never checks it — this "test" always passes
```

pytest marks this function as passed even if `calculate_sfm` returns `0`. A test that cannot fail is not a test.

**The solution:**

```python
def test_calculate_sfm_one_inch():
    result = calculate_sfm(1.0, 3820)
    assert round(result) == 1000   # fails with AssertionError if not true
```

If `round(result)` is `1000`, nothing happens — the test continues. If it is anything else, Python raises `AssertionError` and pytest marks the test as failed.

**What it hides:** The manual check-and-raise pattern:

```python
# Without assert — what you would write by hand:
if round(result) != 1000:
    raise AssertionError(f"Expected 1000, got {round(result)}")
```

`assert condition` is this entire pattern compressed to one word.

**Canonical example (General):**

```python
assert 2 + 2 == 4    # condition is True — nothing happens
assert 2 + 2 == 5    # condition is False → raises AssertionError
```

**Project application:**

Every test function ends with one or more `assert` statements. `assert round(calculate_sfm(1.0, 3820)) == 1000` is the written contract: "for these inputs, the answer rounds to 1000." The test suite enforces that contract automatically, every time.

**Smallest possible example:**

```python
def test_addition():
    result = 2 + 2
    assert result == 4    # passes silently
    assert result == 5    # raises AssertionError — this line would fail
```

**You will see this again in:**
- Every pytest test you write in this series
- `unittest.TestCase.assertEqual()` — Python's built-in framework uses method calls instead of `assert`, but the same idea
- Production code: `assert 0 < timeout_seconds < 300, "timeout must be between 1 and 299"` — a developer-facing contract
- The `assert` in SQLAlchemy internals that fires when you misuse a session

**Watch for:** `assert` is disabled when Python runs in "optimized" mode (`python -O script.py`). Never use it to validate user input or enforce security rules — it can be silently bypassed. Only use `assert` in tests and for developer-facing invariants that should never be violated in correct code.

---

## Concept: pytest — The Test Runner

**What it is:** A program that automatically finds all functions whose names start with `test_` in all files whose names start with `test_`, runs each one, and reports which passed and which failed.

**The problem before:**

Without a test runner, you call every test function by hand:

```python
# Without pytest — you maintain this list forever:
test_calculate_sfm_one_inch()
test_calculate_sfm_half_inch()
test_calculate_sfm_at_zero()
print("done?")    # no useful information — you only know it ran
```

Every time you add a test, you must remember to add the call here. Every time you forget, that test silently never runs.

**The solution:**

Name your file `test_sfm.py`, name your function `test_calculate_sfm_one_inch`, then run:

```powershell
pytest tests/
```

pytest scans all `test_*.py` files, finds all `def test_*()` functions, calls each one, catches any `AssertionError`, and prints a summary:

```
tests/test_sfm.py .      [100%]
1 passed in 0.01s
```

One `.` per passing test. One `F` per failing test. You always see the full picture.

**What it hides:** Test discovery (scanning directories for test files), test isolation (each test function starts fresh), result accumulation (collecting pass/fail across all tests), and output formatting. Without pytest, you build all of this yourself for each project.

**The invariant it protects:** Every test defined in the codebase runs every time you run `pytest`. No test is silently skipped because a caller was forgotten.

**Canonical example (General):**

```python
# test_math.py
def test_add():
    assert 2 + 2 == 4

def test_subtract():
    assert 5 - 3 == 2
```

```powershell
pytest test_math.py
```

```
..
2 passed in 0.01s
```

Two dots = two passing tests. If one failed: `F.` — one failure, one pass, in order.

**Project application:**

From this lesson on, every lesson starts with `pytest tests/` confirming all previous tests still pass before writing anything new. This is the smallest possible version of continuous integration: the proof that today's work did not break yesterday's work.

**You will see this again in:**
- GitHub Actions, GitLab CI, Jenkins — all run `pytest` automatically on every push
- Code review policies: "PR requires passing tests before merge"
- `pytest -v` (verbose) — shows the full name of each test function instead of a dot
- `pytest -k "sfm"` — runs only tests whose names contain "sfm"
- `pytest --tb=short` — shorter traceback output when debugging failures

**Watch for:** pytest discovers tests by naming convention, not by location. A function named `verify_sfm` will not be found — it must start with `test_`. A file named `sfm_tests.py` will not be found — it must start with `test_`. The naming rules are not flexible.

---

## Step 1 — Red: Write the Test First

You write the test now. The function does not exist yet. That is the point.

Create the file `tests/test_sfm.py` and write exactly this:

```python
def test_calculate_sfm_one_inch():          # must start with "test_" for pytest to find it
    result = calculate_sfm(1.0, 3820)       # 1.0 inch diameter, 3820 RPM — function not yet defined
    assert round(result) == 1000            # round() brings the float 1000.07... to integer 1000
```

Three lines. No imports. No function definition anywhere.

**Why no import?** `calculate_sfm` does not exist anywhere yet — there is no module to import from. Writing the test without an import means the failure will be a `NameError: name 'calculate_sfm' is not defined`. That error is exactly what you want to see: it proves the test ran and failed because the code it needs is missing.

**Why `round()`?** The SFM formula produces a float like `1000.07`. Machinists work in whole numbers, so the test asserts the rounded result. `round(1000.07)` returns `1000`. When the function is correct, this assertion will pass.

### SAVE AND TRY

Save `tests/test_sfm.py`. From the `python-tooldb/` directory, run:

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
FAILED tests/test_sfm.py::test_calculate_sfm_one_inch - NameError: name 'calculate_sfm' is not defined
```

At the bottom:

```
1 failed in 0.01s
```

The test is Red. This is exactly correct.

**Why this NameError is good news — not a mistake:**

The test ran. pytest found it, called it, and the function call `calculate_sfm(1.0, 3820)` failed because `calculate_sfm` is not defined anywhere. If this test had passed right now — with no function defined anywhere — the test would be broken. A test that passes before you write the code is not checking anything real.

The NameError is the confirmation that: (1) pytest is working, (2) the test is running, and (3) the test correctly detects that the code it needs does not exist.

**In the terminal:** Note these three pieces of information in the output:
- `FAILED` — not "syntax error," not "not found" — the test ran and the test failed
- `NameError: name 'calculate_sfm' is not defined` — the exact reason for the failure
- `1 failed in 0.01s` — one test ran, one test failed

**Change something:** Change `calculate_sfm(1.0, 3820)` to `calculate_sfm(1.0)` (remove one argument). Save. Run pytest. What error do you get? Is it still a valid Red state? Change it back.

---

## Concept: The `import` Statement

**What it is:** The statement that loads code from another file (called a module) and makes it available in the current file.

**The problem before:**

Without imports, every file that needs `calculate_sfm` must contain its own copy. Five files = five copies. Change the formula = find and fix all five.

**The solution:**

Define the function once in `tooldb/sfm.py`. Then in any file that needs it:

```python
from tooldb.sfm import calculate_sfm   # load calculate_sfm from the sfm module inside the tooldb package
```

Now all files share a single definition.

**What it hides:** The file system lookup, the import cache, and the module initialization. Python finds `tooldb/sfm.py`, runs it once (building the module object), stores it in a cache (`sys.modules`), and gives you back the name you asked for. Subsequent imports of the same module return the cached version — the file is not re-read every time.

**The invariant it protects:** A name imported with `from X import Y` refers to exactly the `Y` that was defined in module `X`. You cannot accidentally use a different version of the same function in different files.

**Canonical example (General):**

```python
import math              # load Python's built-in math module
print(math.pi)           # → 3.141592653589793  — access pi through the module name

from math import sqrt    # import just sqrt from math
print(sqrt(16))          # → 4.0  — use it directly, no "math." prefix needed
```

**Two import forms:**

```python
import math              # imports the whole module; access with math.pi, math.sqrt()
from math import sqrt    # imports one name; access with sqrt() directly
```

**Project application:**

`from tooldb.sfm import calculate_sfm` means: "look inside the `tooldb` package (the `tooldb/` folder with `__init__.py`), find the file `sfm.py`, and give me the name `calculate_sfm` from it."

**Smallest possible example:**

```python
# file_a.py — defines the function
def greet(name):
    return f"Hello, {name}"

# file_b.py — imports and uses it
from file_a import greet
print(greet("world"))   # → Hello, world
```

**You will see this again in:**
- Every Python file beyond this lesson — imports are the glue between modules
- `from sqlalchemy.orm import Session` (Lab 08) — pulling one specific class from a large library
- `from pydantic import BaseModel` (Lab 09) — same pattern
- Circular import errors — when file A imports from file B while file B imports from file A

**Watch for:** The import `from tooldb.sfm import calculate_sfm` requires:
1. A folder named `tooldb/`
2. A file `tooldb/__init__.py` (the package marker)
3. A file `tooldb/sfm.py`
4. A function named `calculate_sfm` defined inside `tooldb/sfm.py`

Miss any one of these and you get an `ImportError` or `ModuleNotFoundError`.

---

## Step 2 — Green: Write the Minimum Code

The goal of the Green step is to make the test pass. Not the best code. Not the cleanest code. The shortest path from Red to Green.

**First, create the source file.** Create `tooldb/sfm.py` and write:

```python
def calculate_sfm(d, rpm):            # parameter named 'd' — short, not ideal, but functional
    return 3.14159 * d * rpm / 12    # approximate pi — not the best value, but enough to pass
```

Two lines. The single-letter `d` is a bad parameter name — it will be fixed in the Refactor step. The magic number `3.14159` is an imprecise approximation — also fixed in Refactor. Right now, none of that matters. What matters is making the test green.

**Why deliberately write imperfect code?** Because the Refactor step needs something to improve. If you write perfect code in the Green step, there is nothing to refactor — and you have skipped practicing the most important safety mechanism: making changes to working code and proving the tests still pass.

**Second, update the test file** to import the function:

```python
from tooldb.sfm import calculate_sfm  # ← add this line at the top

def test_calculate_sfm_one_inch():
    result = calculate_sfm(1.0, 3820)
    assert round(result) == 1000
```

The `from tooldb.sfm import calculate_sfm` line does the lookup described in the import concept block: it finds `tooldb/sfm.py` and brings in `calculate_sfm`.

### SAVE AND TRY

Save both files. Run:

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
collected 1 item

tests/test_sfm.py .                                      [100%]

1 passed in 0.01s
```

One dot. One passing test. The test is Green.

**Verify the math in the terminal:** Open a Python prompt to confirm the arithmetic yourself:

```powershell
python
```

Then type:

```python
>>> round(3.14159 * 1.0 * 3820 / 12)
```

**Expected:** `1000`

`3.14159 × 1.0 × 3820 = 12000.87`, divided by 12 = `1000.07`, rounded = `1000`.

Type `exit()` to leave the Python prompt.

**Change something:** In `tooldb/sfm.py`, change the `return` line to `return 0`. Save. Run pytest. You should see `FAILED` with `AssertionError: assert 0 == 1000`. This is what a failing test looks like when the function runs but returns the wrong answer. Change it back to the real formula.

---

## Concept: Magic Numbers

**What it is:** A numeric literal in code with no explanation of where the value came from or what it represents.

**The problem:**

```python
def calculate_sfm(d, rpm):
    return 3.14159 * d * rpm / 12   # what is 3.14159? what is 12?
```

A reader seeing this code must already know that `3.14159` approximates π and that `12` converts inches to feet. If they do not know, the code is opaque. And if you later want to improve the precision of π, you must know which `3.14159` in the codebase is π versus some other constant.

**The solution:**

Replace magic numbers with names that explain what they represent:

```python
import math

INCHES_PER_FOOT = 12   # 12 inches in one foot — the conversion factor in the SFM formula

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
```

`math.pi` is Python's own named constant for π (more precise than any typed approximation). `INCHES_PER_FOOT` names the `12`, which now reads as what it is: a unit conversion.

**What it hides:** The decision of what each number means. A named constant forces that decision to be recorded at definition time. Anyone reading the code later does not need to decode the arithmetic.

**Canonical example (General):**

```python
# Hard to read: why 0.1745? what is 57.2958?
angle_rad = 10 * 0.1745   # degrees to radians?
angle_deg = 1.0 * 57.2958  # radians to degrees?

# Readable:
DEGREES_PER_RADIAN = 57.2958
RADIANS_PER_DEGREE = 0.01745

angle_deg = 1.0 * DEGREES_PER_RADIAN
```

**Project application:**

`INCHES_PER_FOOT = 12` is the specific constant that will replace `12` in the refactor. The name makes the unit conversion explicit — essential when the codebase also uses millimeters, meters, and other units in later lessons.

**You will see this again in:**
- PEP 8 (Python's style guide): module-level constants in `ALL_CAPS`
- Physics and engineering code — every formula has unit-conversion constants that must be named
- The rule in every code review: "no magic numbers without explanation"

**Watch for:** There is a temptation to name constants with the value instead of the meaning: `TWELVE = 12`. That defeats the purpose. The name must explain why the number exists, not repeat what the number is.

---

## Step 3 — Refactor Part A: Rename the Parameter

The test is Green. Now improve the code. The tests are your safety net — if they stay green after each change, the behavior is unchanged.

**The first improvement:** rename `d` to `diameter_inches`.

In `tooldb/sfm.py`, change the parameter name:

```python
def calculate_sfm(diameter_inches, rpm):  # ← was: d  (renamed for clarity)
    return 3.14159 * diameter_inches * rpm / 12
```

That is one word changed. Nothing about the formula or return value changed.

### SAVE AND TRY

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
1 passed in 0.01s
```

Still Green. The rename was safe: the test calls the function positionally (`calculate_sfm(1.0, 3820)`), so the parameter name does not matter to the caller. The code is more readable; the behavior is identical.

**Why this matters:** This is the Refactor step in practice. A small, safe change. Run the test. Still green. Confidence: the rename was correct.

**Change something:** Temporarily rename `diameter_inches` back to `d` but change the `return` line to use `diameter_inches` (the old name is now gone but the body still references it). Save. Run pytest. What error do you get? It should be a `NameError` inside the function. Change it back.

---

## Step 4 — Refactor Part B: Replace the Magic Number

The second improvement: replace `3.14159` with `math.pi`.

**What is `math`?** Python ships with a standard library — a collection of modules covering common tasks: `math` for mathematical operations, `os` for file system operations, `json` for JSON parsing. You never install these with `pip` — they come with Python itself. You only need to `import` them.

**`math.pi`** is Python's own floating-point representation of π, accurate to the full precision of a 64-bit float: `3.141592653589793`. It is more precise than any typed approximation.

Update `tooldb/sfm.py`:

```python
import math                            # ← add this at the top of the file

INCHES_PER_FOOT = 12                  # ← add this named constant

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT  # ← was: 3.14159 * ... / 12
```

Line by line:

- `import math` — loads Python's standard math module; after this line, `math.pi`, `math.sqrt()`, and `math.floor()` are all available
- `INCHES_PER_FOOT = 12` — a named constant at module level; `ALL_CAPS` is the Python convention for constants that should not change
- `math.pi` — the actual value of π to full float precision; more accurate than `3.14159`
- `/ INCHES_PER_FOOT` — the unit conversion, now named instead of bare `12`

### SAVE AND TRY

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
1 passed in 0.01s
```

Still Green. The refactor is complete.

**Verify the precision improvement in the terminal:**

```powershell
python
```

```python
>>> import math
>>> round(3.14159 * 1.0 * 3820 / 12)      # the old approximation
>>> round(math.pi * 1.0 * 3820 / 12)      # with math.pi
```

**Expected:** Both round to `1000`. The difference is that `math.pi` is `3.141592653589793` versus `3.14159` — more decimal places. For SFM the difference is negligible. For calculations requiring higher precision (later lessons), `math.pi` is the correct choice.

**Change something:** Temporarily change `INCHES_PER_FOOT = 12` to `INCHES_PER_FOOT = 1`. Save. Run pytest. The test should fail with `AssertionError: assert 12001 == 1000`. This confirms the constant controls the unit conversion. Change it back.

---

## Concept: The Full File State

Here is the final state of both files, with every line explained:

`tooldb/sfm.py`:

```python
import math                 # loads Python's math module — math.pi, math.floor, math.sqrt available after this

INCHES_PER_FOOT = 12        # 12 inches = 1 foot — the unit conversion in the SFM formula; ALL_CAPS = module-level constant

def calculate_sfm(diameter_inches, rpm):  # define a function; 'diameter_inches' and 'rpm' are the parameter names
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
    # π × diameter × RPM / 12 = surface feet per minute
    # math.pi = 3.141592653589793 — full float precision
    # diameter_inches = the tool diameter in inches (e.g., 1.0, 0.5, 0.75)
    # rpm = spindle speed in revolutions per minute
    # INCHES_PER_FOOT = 12 — converts inches/minute to feet/minute
```

`tests/test_sfm.py`:

```python
from tooldb.sfm import calculate_sfm  # import the function from its module so this file can use it

def test_calculate_sfm_one_inch():    # pytest finds this because the name starts with "test_"
    result = calculate_sfm(1.0, 3820)  # call the function: 1.0-inch tool at 3820 RPM
    assert round(result) == 1000       # round() → 1000; assert checks it equals 1000
```

---

## 🎯 Challenge: A Second Full Cycle

**You know:** The complete Red-Green-Refactor cycle, applied once.

**Task:** Add a second test for a different tool size, then confirm the function handles it correctly without any changes to `calculate_sfm`.

**Background:** Halving the diameter while keeping RPM constant should halve the SFM. A 0.5-inch tool at 3820 RPM should produce approximately 500 SFM.

```
SFM = π × 0.5 × 3820 / 12 = 500.03...  →  round = 500
```

**Step 1 — Red:**

Add a second test to `tests/test_sfm.py`:

```python
from tooldb.sfm import calculate_sfm

def test_calculate_sfm_one_inch():
    result = calculate_sfm(1.0, 3820)
    assert round(result) == 1000

# ← add the function below:
def test_calculate_sfm_half_inch():
    result = calculate_sfm(0.5, 3820)   # same RPM, half the diameter
    assert round(result) == 500         # expect half the SFM
```

Run pytest. Does the new test pass or fail?

**Step 2 — Reflect:**

The new test should pass immediately — no changes to `calculate_sfm` needed. What does that tell you about the first implementation?

**Hints:**

1. This is a case where Green requires no new code — the function already handles the new input. Does that mean the Red step failed? What was the value of writing the test first?
2. After the test passes, is there a Refactor step? What would you change?

---

<details>
<summary>▶ Show Solution</summary>

**The new test should pass immediately:**

```
collected 2 items

tests/test_sfm.py ..                                     [100%]

2 passed in 0.01s
```

Two dots. Both passing.

**The reflect answer — was the Red step wasted?**

No. Running `pytest tests/` after adding the new test — and seeing it pass — is still the Red-Green-Refactor cycle, just with an instant Green.

The value of writing the test first: you now have a permanent, executable specification that says "for a 0.5-inch tool at 3820 RPM, the answer is 500 SFM." Even if someone later changes the formula, this test will catch the regression. The test exists forever; the Red phase was brief.

**The refactor step:**

Nothing technically needs to change. You might consider:
- Adding a docstring to `calculate_sfm` explaining the formula (useful, but no test requires it)
- Extracting the `round()` call into the function itself (but then the function always rounds — what if a caller wants the float? YAGNI says: no test requires it, do not add it)

The correct refactor here is: nothing. The code is already clean.

**Key insight:** Green does not always mean "write new code." Sometimes the existing code already handles the new test case. The value of the test is the specification and the safety net — not forcing you to write more code.

</details>

---

## 🎯 Challenge: Catch a Bug Before It Ships

**You know:** How to write a test and run the full TDD cycle.

**Task:** Someone on the team accidentally changes `INCHES_PER_FOOT = 12` to `INCHES_PER_FOOT = 1` (treating everything as already in feet). This would return SFM values 12× too large.

Write a third test that would catch this bug. The test should:
- Use a different diameter and RPM than the existing tests
- Assert the expected (correct) rounded SFM value
- Fail if `INCHES_PER_FOOT = 1` is used

**Hint:** Choose inputs where the expected SFM is easy to verify by hand.

---

<details>
<summary>▶ Show Solution</summary>

```python
def test_calculate_sfm_three_inch_tool():
    # 3-inch diameter at 1273 RPM:
    # SFM = π × 3.0 × 1273 / 12 = 3.14159 × 318.25 = 999.7 ≈ 1000
    result = calculate_sfm(3.0, 1273)
    assert round(result) == 1000
```

With `INCHES_PER_FOOT = 1` (the bug):
```
SFM = π × 3.0 × 1273 / 1 = 11996 → round = 11996
assert 11996 == 1000  → FAILED
```

With `INCHES_PER_FOOT = 12` (correct):
```
SFM = π × 3.0 × 1273 / 12 = 999.7 → round = 1000
assert 1000 == 1000  → passed
```

**Key insight:** A test suite that only checks one set of inputs might not catch changes that affect the calculation constants. Multiple tests with different inputs — especially inputs that stress different parts of the formula — provide broader protection. The goal is not more tests for the sake of it; the goal is tests that would fail when real bugs are introduced.

</details>

---

## The Cycle Summarized

You just completed one Red-Green-Refactor cycle. Look at what happened:

```
RED      tests/test_sfm.py written (no function anywhere)
         pytest → FAILED: NameError: name 'calculate_sfm' is not defined
         duration: ~2 minutes

GREEN    tooldb/sfm.py created with def calculate_sfm(d, rpm):...
         tests/test_sfm.py updated with import
         pytest → 1 passed
         duration: ~3 minutes

REFACTOR rename: d → diameter_inches          pytest → 1 passed
         replace: 3.14159 → math.pi          pytest → 1 passed
         replace: 12 → INCHES_PER_FOOT       pytest → 1 passed
         total refactor: ~5 minutes
```

Total: roughly 10 minutes for one complete cycle. The lesson plan says a cycle should take minutes. This was one.

Every lesson from here follows this rhythm: write the test first, write the minimum code, clean it up while tests stay green. The rhythm is always the same. What changes is only the domain.

---

## Final Check

Verify each of these before moving on:

| Feature | How to verify |
|---|---|
| `tooldb/` folder with `__init__.py` | Run `ls tooldb/` — you should see `__init__.py` and `sfm.py` |
| `tests/test_sfm.py` exists | Run `ls tests/` — you should see `test_sfm.py` |
| All tests pass | Run `pytest tests/` — output: `2 passed` (or `3 passed` if you did the third challenge) |
| `calculate_sfm` uses `math.pi` | Open `tooldb/sfm.py` — the function body must reference `math.pi`, not `3.14159` |
| `calculate_sfm` uses `INCHES_PER_FOOT` | Open `tooldb/sfm.py` — the function body must reference `INCHES_PER_FOOT`, not `12` |
| Parameter is named `diameter_inches` | Open `tooldb/sfm.py` — the parameter must be `diameter_inches`, not `d` |
| pytest is installed | Run `pytest --version` — version number appears |
| `round()` appears in the test | Open `tests/test_sfm.py` — the assertion must use `round(result)` |

If any row fails, re-read the corresponding step and fix before continuing.

---

## Quick Check Answers

**1. If you could pass the test by returning the hardcoded value `1000`, should you?**

Yes — for exactly one test. `return 1000` is the minimum code that makes `assert round(calculate_sfm(1.0, 3820)) == 1000` pass. The Green step says minimum code, and `return 1000` qualifies. The reason not to stop there: the next test (the 0.5-inch test in the Challenge) would immediately demand a real formula, because `return 1000` cannot return both `1000` and `500`. The hardcoded constant strategy collapses the moment a second test uses different inputs — which is why the tests, not moral will, enforce the real implementation.

**2. Does it matter which specific error the Red step produces?**

No — and yes. Any failure is a valid Red state: NameError, ImportError, AssertionError, they all mean the test did not pass. What matters is that the failure is for the right reason. A `NameError: name 'calculate_sfm' is not defined` tells you precisely: the thing you are about to build does not exist yet. An `AssertionError: assert 0 == 1000` tells you: the function exists but returns the wrong answer. Both are Red. Both tell you something specific about what to fix next. A failure that crashes pytest itself (syntax error, import loop) is not a useful Red state — the test never ran, so you have no signal.

**3. If you rename `d` to `diameter_inches` and all tests pass, what has that confirmed?**

That the rename did not change behavior. The test calls the function positionally (`calculate_sfm(1.0, 3820)`), so the parameter name is invisible to the caller. The test passing after the rename proves two things: (1) the function body still works correctly with the new name — no reference to `d` was accidentally left in the body, and (2) the test is actually checking behavior, not implementation details like parameter names. This is the Refactor invariant: green before, green after, behavior unchanged.
