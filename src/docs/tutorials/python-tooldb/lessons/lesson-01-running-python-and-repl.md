# Python Tool Database — LAB 01 — Running Python and the REPL

**Prerequisites:** Block 0 complete. You have Python installed, a virtual environment active, pytest working, and a project structure in `python-tooldb/`. You have seen `def` and `import` in Block 0 but not yet learned how Python actually executes code.

**What this lab adds:**
- A precise model of how Python runs your code — the interpreter vs compiler distinction
- The REPL: Python's interactive session for trying things immediately
- The `__main__` guard: how to write a file that works both as a script and as a module
- A working `main.py` entry point for the project

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Python files end in `.py`. So do test files. If you `import sfm` from a test, does Python run the whole `sfm.py` file from top to bottom? What might that break?
> 2. A compiler translates your code to machine instructions before running it. An interpreter does something different. What?
> 3. When you type `python sfm.py` at the terminal, where does Python look for the file `sfm`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have a `main.py` file in `python-tooldb/` that:

1. Runs as a script (`python main.py`) and prints tool information to the terminal
2. Can be imported by tests without running the print statements
3. Uses the `__main__` guard to separate "entry point" code from "library" code

Terminal output when you run it:

```
=== Tool Database ===
Tool: EM-0500  diameter: 0.500"  recommended SFM: 1000
Tool: DR-0250  diameter: 0.250"  recommended SFM: 500
Tool: FM-0750  diameter: 0.750"  recommended SFM: 750
```

---

## Concept: Interpreter vs Compiler

**What it is:** Two different strategies for translating a programming language into instructions a computer can execute.

**A compiler** translates the entire program to machine code (or bytecode) before running it. The translation is a separate step. You compile once; you run the result.

```
Go, Rust, C, C++:
  source.go → [COMPILER] → executable_binary → [CPU executes binary]
  compile:  go build source.go   (happens once)
  run:      ./source             (runs the compiled binary)
```

**An interpreter** reads and executes the source code directly, one statement at a time. There is no separate compile step.

```
Python, Ruby, JavaScript (Node):
  script.py → [INTERPRETER runs it line by line]
  python script.py
```

**What Python actually does** (a nuance worth knowing):

Python is interpreted, but it does have a compile step — it is just automatic and hidden. When you run `python sfm.py`, Python:

1. Compiles `sfm.py` to bytecode (`.pyc` files in `__pycache__/`)
2. Runs the bytecode in the Python Virtual Machine (PVM)

The bytecode is not machine code — it still requires the Python interpreter to run. But it is faster to execute than re-parsing the source text every time.

**The practical difference you will feel:**

- Compilation errors (syntax mistakes) appear immediately when you run the file, before any line executes
- Runtime errors (wrong types, missing attributes) appear only when the failing line is reached
- There is no "build" step — just `python filename.py`

**You will see this again in:**
- Python's `__pycache__/` folders — the compiled bytecode lives there
- `SyntaxError` before your code runs — the compile step caught it
- When you port to Rust (Block 8), you will feel the difference: `cargo build` is a real compile step

**Watch for:** Python caches bytecode in `__pycache__/`. If you see stale behavior after editing a file, run `python -B filename.py` to skip bytecode caching, or delete `__pycache__/` manually.

---

## Concept: The REPL

**What it is:** An interactive Python session that reads one expression, evaluates it, prints the result, and waits for the next. REPL = Read, Eval, Print, Loop.

**The problem before:**

Without a REPL, to try "what does `round(math.pi * 1.0 * 3820 / 12)` return?", you would:
1. Create a file
2. Write `print(round(math.pi * 1.0 * 3820 / 12))`
3. Save
4. Run the file
5. Read the output
6. Delete the file

That is five steps for one question.

**The solution:**

```python
>>> import math
>>> round(math.pi * 1.0 * 3820 / 12)
1000
```

Three lines. Immediate feedback. No file created or deleted.

**Starting the REPL:**

```powershell
python
```

The `>>>` prompt means Python is waiting for input.

**Exiting:**

```python
>>> exit()
```

Or press `Ctrl+Z` then `Enter` on Windows.

**What it is good at:**
- Quickly testing a formula or syntax you are not sure about
- Exploring an API you just installed: `import requests; dir(requests)`
- Verifying a regex before embedding it in code

**What it is NOT good at:**
- Writing more than 2–3 lines of code
- Multi-line functions (the prompt becomes `...` and indentation is awkward)
- Saving work (REPL sessions are ephemeral — close the window, lose the session)

**Canonical example (General):**

A pocket calculator is a REPL for arithmetic: press keys, see the result. The REPL is Python's calculator — type expressions, see results, no ceremony required.

**Project application:**

In Block 0, you already used the REPL to verify: `round(3.14159 * 1.0 * 3820 / 12)`. That is the REPL's correct use: confirming a single calculation, then leaving.

**You will see this again in:**
- `python -c "expression"` — run one Python expression from the terminal without entering the REPL
- IPython and Jupyter notebooks — enhanced REPLs used in data science
- Database CLIs (`sqlite3` command) — a REPL for SQL
- Node.js REPL — same concept for JavaScript

**Watch for:** Code written in the REPL does not persist. If you want to save something, put it in a file. The REPL is for exploration, not development.

---

## Step 1 — Explore in the REPL

Open the REPL:

```powershell
python
```

Try each expression. Observe the output:

```python
>>> 2 + 2
4

>>> "tool database"
'tool database'

>>> "EM-" + "0500"
'EM-0500'

>>> type(0.5)
<class 'float'>

>>> type("EM-0500")
<class 'str'>

>>> from tooldb.sfm import calculate_sfm
>>> calculate_sfm(1.0, 3820)
1000.0691...

>>> round(calculate_sfm(1.0, 3820))
1000
```

### SAVE AND TRY

You should see the results above. Each line is independent — the REPL evaluates and prints immediately.

**Try these experiments:**

```python
>>> 10 / 3       # what kind of number does Python give you?
>>> 10 // 3      # what does // do differently?
>>> 10 % 3       # what does % (modulo) produce?
>>> "EM" * 3     # can you multiply a string?
```

**Change something:** Type a deliberately broken expression: `calculate_sfm(1.0` (missing closing paren). Press Enter. What happens? Type `)` to close it and try again.

Exit with `exit()`.

---

## Concept: Script Execution and `__name__`

**What it is:** A mechanism that lets Python distinguish between "this file is being run directly" and "this file is being imported by another file."

**The problem:**

Every `.py` file can be both:
1. A script: run directly with `python filename.py`
2. A module: imported with `from filename import something`

When Python imports a file, it executes the entire file from top to bottom. This is fine for function and class definitions. But if the file has code that runs on import (print statements, function calls), that code runs every time the file is imported:

```python
# sfm.py — if it had this at the bottom:
print("sfm module loaded")           # this runs when someone imports calculate_sfm
result = calculate_sfm(1.0, 3820)    # this runs on import too
print(f"SFM: {result}")
```

Every test that imports `from tooldb.sfm import calculate_sfm` would print three lines. Unacceptable.

**The solution — `if __name__ == "__main__":`:**

Python sets a special variable `__name__` on every module:
- When a file is run directly: `__name__` is set to `"__main__"`
- When a file is imported: `__name__` is set to the module's name (`"tooldb.sfm"`)

```python
# sfm.py — with the guard:
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT

if __name__ == "__main__":           # only runs when this file is the entry point
    print(f"SFM: {calculate_sfm(1.0, 3820):.0f}")   # ← .0f = format as 0 decimal places
```

Now `from tooldb.sfm import calculate_sfm` runs the module cleanly — no print output.
Running `python tooldb/sfm.py` directly prints the result.

**What it hides:** The execution context. The `if __name__` guard hides the "am I a script or a library?" decision inside the file itself. Callers do not have to know; they just import.

**Canonical example (General):**

A Swiss Army knife has a main blade and several tools. When you use the knife by itself (running it directly), you open the main blade. When you use it as part of a toolkit (imported into another tool), only the specific tool that is asked for is used — the main blade does not open automatically.

**You will see this again in:**
- Every Python module you write that doubles as a demo script
- FastAPI's `uvicorn.run(app, ...)` is always inside `if __name__ == "__main__":`
- pytest uses `__name__` to discover modules safely
- The standard library `random`, `json`, etc. — all use this guard for their self-tests

**Watch for:** Code inside `if __name__ == "__main__":` is never importable. If you write a useful function inside the guard instead of above it, tests and other modules cannot access it.

---

## Step 2 — Red: Write a Test for `main.py` Logic

Before writing `main.py`, extract the logic into a testable function. The display format for a tool entry is:

```
Tool: EM-0500  diameter: 0.500"  recommended SFM: 1000
```

Write the test first. Create `tests/test_main.py`:

```python
from tooldb.display import format_tool_line   # function we are about to build

def test_format_tool_line():
    line = format_tool_line(name="EM-0500", diameter_inches=0.5, sfm=1000)
    assert line == 'Tool: EM-0500  diameter: 0.500"  recommended SFM: 1000'
```

### SAVE AND TRY

```powershell
pytest tests/test_main.py
```

**You should see:**

```
FAILED tests/test_main.py::test_format_tool_line
  - ModuleNotFoundError: No module named 'tooldb.display'
```

Red. The module does not exist. ✓

---

## Step 3 — Green: Create `tooldb/display.py`

Create `tooldb/display.py`:

```python
def format_tool_line(name: str, diameter_inches: float, sfm: int) -> str:
    return f'Tool: {name}  diameter: {diameter_inches:.3f}"  recommended SFM: {sfm}'
    # f-string format codes:
    # {name}              → plain string substitution
    # {diameter_inches:.3f} → float with 3 decimal places (0.500, not 0.5)
    # {sfm}               → integer substitution (no decimal point)
    # :.3f means: format as float with 3 decimal places
```

**f-string format codes:** Inside `{}` in an f-string, you can add a `:` followed by a format specification:
- `:.3f` — float, 3 decimal places: `0.5` → `0.500`
- `:.0f` — float, 0 decimal places: `1000.07` → `1000`
- `:>10` — right-aligned in 10 characters (for alignment)
- `:.2%` — percentage: `0.75` → `75.00%`

### SAVE AND TRY

```powershell
pytest tests/test_main.py
```

**You should see:**

```
1 passed in 0.01s
```

Green. ✓

**Verify the format code in the REPL:**

```powershell
python
```

```python
>>> f"{0.5:.3f}"
'0.500'

>>> f"{1000.07:.0f}"
'1000'
```

Exit with `exit()`.

**Change something:** Change `:.3f` to `:.1f` in `format_tool_line`. Run pytest. The test fails because `0.5` formatted to 1 decimal place is `0.5`, not `0.500`. The test is correctly asserting the exact format. Change it back.

---

## Step 4 — Build `main.py`

Now create `main.py` in `python-tooldb/` (the project root, not inside `tooldb/`):

```python
from tooldb.sfm import calculate_sfm           # the SFM calculation function
from tooldb.display import format_tool_line    # the display formatting function

DEMO_TOOLS = [                                 # list of (name, diameter, recommended_rpm) tuples
    ("EM-0500", 0.5, 3820),
    ("DR-0250", 0.25, 7640),
    ("FM-0750", 0.75, 2547),
]


def run_demo():
    print("=== Tool Database ===")                      # print() outputs a line to the terminal
    for name, diameter, rpm in DEMO_TOOLS:              # unpack each 3-tuple into three variables
        sfm = round(calculate_sfm(diameter, rpm))       # compute SFM, round to integer
        line = format_tool_line(name, diameter, sfm)    # format for display
        print(line)                                     # output the formatted line


if __name__ == "__main__":   # only runs when: python main.py
    run_demo()               # NOT when: import main
```

**Tuple unpacking:** `for name, diameter, rpm in DEMO_TOOLS:` — each item in `DEMO_TOOLS` is a tuple of three values. Python unpacks them into `name`, `diameter`, and `rpm` automatically.

### SAVE AND TRY

```powershell
python main.py
```

**You should see:**

```
=== Tool Database ===
Tool: EM-0500  diameter: 0.500"  recommended SFM: 1000
Tool: DR-0250  diameter: 0.250"  recommended SFM: 500
Tool: FM-0750  diameter: 0.750"  recommended SFM: 750
```

**Verify the `__main__` guard:**

```powershell
python -c "import main; print('imported cleanly — no output')"
```

**You should see:**

```
imported cleanly — no output
```

`import main` ran the file but the `if __name__ == "__main__":` block was skipped. The `run_demo()` function was never called.

**Change something:** Remove the `if __name__ == "__main__":` guard and call `run_demo()` at module level:

```python
run_demo()   # called at module level — no guard
```

Run `pytest tests/`. Every test that indirectly imports anything will now trigger the print output. Run the import check again:

```powershell
python -c "import main; print('done')"
```

The print output from `run_demo()` appears — the import ran the function. Add the guard back.

---

## Step 5 — Refactor: Name the Tuple Structure

The `DEMO_TOOLS` list contains raw tuples. Three-item tuples with unnamed positions are hard to read:

```python
("EM-0500", 0.5, 3820)   # is 3820 the RPM or the SFM? you must read the loop to know
```

Refactor to use keyword arguments when building each entry, making it self-documenting:

```python
from tooldb.sfm import calculate_sfm
from tooldb.display import format_tool_line

DEMO_TOOLS = [
    {"name": "EM-0500", "diameter_inches": 0.5, "rpm": 3820},   # ← dict with named keys
    {"name": "DR-0250", "diameter_inches": 0.25, "rpm": 7640},
    {"name": "FM-0750", "diameter_inches": 0.75, "rpm": 2547},
]


def run_demo():
    print("=== Tool Database ===")
    for tool in DEMO_TOOLS:                                         # tool is now a dict
        sfm = round(calculate_sfm(tool["diameter_inches"], tool["rpm"]))
        line = format_tool_line(tool["name"], tool["diameter_inches"], sfm)
        print(line)


if __name__ == "__main__":
    run_demo()
```

### SAVE AND TRY

```powershell
python main.py
```

Same output as before. The refactor changed structure (tuples → dicts) without changing behavior.

```powershell
pytest tests/
```

All tests still pass.

**Change something:** Change `tool["diameter_inches"]` to `tool["diameter"]` (wrong key). Run `python main.py`. You get `KeyError: 'diameter'`. Python's dict raises `KeyError` when you access a key that does not exist. Change it back.

---

## 🎯 Challenge: Add a Fourth Tool

**You know:** How to add entries to `DEMO_TOOLS` and run the demo.

**Task:** Add a face mill to the demo:
- Name: `FM-1500`
- Diameter: 1.5 inches
- RPM: 1273

The expected SFM is `round(π × 1.5 × 1273 / 12)`. Calculate it by hand (or in the REPL) before running the code to verify your test is correct.

Write a test in `tests/test_main.py` that verifies `format_tool_line` produces the correct string for these values, then add the tool to `DEMO_TOOLS`.

---

<details>
<summary>▶ Show Solution</summary>

First, calculate the expected SFM in the REPL:

```python
>>> import math
>>> round(math.pi * 1.5 * 1273 / 12)
499
```

Wait — is that right? `π × 1.5 × 1273 / 12 = 3.14159 × 1909.5 / 12 = 6000.6 / 12 = 500.05`. Rounds to `500`.

Let me check: `math.pi * 1.5 * 1273 / 12 = 3.14159265 * 1909.5 / 12 = 5999.35... / 12 = 499.94...`. Rounds to `500`.

Add the test:

```python
def test_format_tool_line_face_mill():
    line = format_tool_line(name="FM-1500", diameter_inches=1.5, sfm=500)
    assert line == 'Tool: FM-1500  diameter: 1.500"  recommended SFM: 500'
```

Run `pytest tests/test_main.py::test_format_tool_line_face_mill`. It should pass (the `format_tool_line` function already handles any valid inputs).

Add to `DEMO_TOOLS`:

```python
{"name": "FM-1500", "diameter_inches": 1.5, "rpm": 1273},
```

Run `python main.py`. The fourth line appears:

```
Tool: FM-1500  diameter: 1.500"  recommended SFM: 500
```

**Key insight:** The test for `format_tool_line` does not need to change when you add new tools — the function already handles any valid inputs. The new test documents the expected output for the specific FM-1500 values, which is different from testing the function's general behavior. Both kinds of tests are valid: one tests the abstraction (the formatting function), the other tests a specific case (the face mill entry).

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All tests pass | Run `pytest tests/` — all green |
| `python main.py` prints tool table | Run it — four tools displayed with correct format |
| Import without print output | Run `python -c "import main; print('ok')"` — only "ok" appears |
| `tooldb/display.py` exists with `format_tool_line` | Open file — function present |
| REPL works | Run `python`, type `2 + 2`, see `4`, exit |

---

## Quick Check Answers

**1. Does `import sfm` run the whole file?**

Yes — Python executes the entire file from top to bottom when importing it. This is why the `if __name__ == "__main__":` guard exists: code inside that block does not run on import. Function and class definitions run (they define the function/class), but they do not execute the body. Only code at module level outside of definitions (and outside the `__main__` guard) runs unconditionally on import.

**2. What does a Python interpreter do differently from a compiler?**

A compiler translates the entire program to machine code (or bytecode) before any part of it runs. An interpreter (like CPython) reads and executes code statement by statement — it compiles to bytecode internally, but the bytecode still requires the interpreter to execute. The practical difference: Python syntax errors appear before execution, but runtime errors (like `NameError` or `AttributeError`) appear only when the failing line is reached during execution.

**3. Where does Python look for `sfm.py` when you run `python sfm.py`?**

The current working directory first, then the directories in `sys.path`. `sys.path` includes the directory containing the script being run, the standard library directories, and any site-packages directories from the active virtual environment. When you import `from tooldb.sfm import calculate_sfm`, Python looks for a `tooldb` package (directory with `__init__.py`) in each `sys.path` directory until it finds one.
