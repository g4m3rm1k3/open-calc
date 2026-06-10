# Python Tool Database — LAB 04 — Functions

**Prerequisites:** Lab 03. You know control flow (`if`, `for`, `while`), types, and basic expressions. `tooldb/sfm.py` has `calculate_sfm` from Lab 00c.

**What this lab adds:**
- Parameters vs arguments: the names have different meanings
- Default arguments — how to make a parameter optional
- The mutable default trap — why `def f(x=[])` is a famous Python bug
- Keyword arguments — calling functions with named values
- `*args` and `**kwargs` — functions that accept variable numbers of arguments
- A `recommended_rpm` function that composes with `calculate_sfm`, built through Red-Green-Refactor

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In `def calculate_sfm(diameter_inches, rpm)`, are `diameter_inches` and `rpm` parameters or arguments? What about in `calculate_sfm(0.5, 3820)`?
> 2. Predict: if a function has `def send_email(to, subject, cc=[])`, what happens to the `cc` list if two callers each append to it without passing their own list?
> 3. `calculate_rpm(1.0, 1000)` and `calculate_rpm(diameter_inches=1.0, target_sfm=1000)` — are these the same call?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have `recommended_rpm(diameter_inches, material, rpm_override=None)` — a function that looks up the SFM target for a material, computes the correct RPM, and returns a readable summary:

```python
recommended_rpm(0.5, "carbide")
# → "EM 0.500\": 3820 RPM (target: 1000 SFM, material: carbide)"

recommended_rpm(0.5, "carbide", rpm_override=4000)
# → "EM 0.500\": 4000 RPM (OVERRIDE — normal: 3820 RPM)"
```

This function composes `calculate_sfm` and `calculate_rpm` from `tooldb/sfm.py` with a material-based SFM lookup.

---

## Step 1 — Parameters vs Arguments

Open the REPL: `python`

```python
def add(x, y):    # x and y are PARAMETERS — the names used inside the function definition
    return x + y

add(3, 5)         # 3 and 5 are ARGUMENTS — the values passed in at the call site
```

---

### Concept: Parameters vs Arguments

**What it is:** Two words that describe the same slot — one from the definition's perspective, one from the caller's perspective.

**Parameter:** The name used inside the function definition. `def calculate_sfm(diameter_inches, rpm)` — `diameter_inches` and `rpm` are parameters. They are placeholders.

**Argument:** The actual value passed when the function is called. `calculate_sfm(0.5, 3820)` — `0.5` and `3820` are arguments. They fill the placeholder.

This distinction matters in error messages: `TypeError: calculate_sfm() missing 1 required positional argument: 'rpm'` is telling you that you provided the argument for `diameter_inches` but not for `rpm`.

**Canonical example (General):**

A recipe says "add [flour] and [sugar]" — `flour` and `sugar` are parameters. When you follow the recipe, you add 2 cups of flour and 1 cup of sugar — those quantities are arguments.

**Smallest possible example:**

```python
def greet(name):           # name is a PARAMETER — a slot waiting to be filled
    print(f"Hello, {name}!")

greet("Mike")              # "Mike" is the ARGUMENT — it fills the name slot
greet("Dr. Smith")         # "Dr. Smith" is a different argument for the same parameter
```

**Why it matters here:** Error messages use both words. When pytest says `test_calculate_sfm() takes 0 positional arguments but 1 was given`, understanding "argument" lets you diagnose it.

**You will see this again in:** Every function call ever. In Python documentation: "Parameters" section describes the function signature; "Returns" describes the return value.

**Watch for:** People often use these words interchangeably in conversation. Formally they are different. Context usually makes clear which is meant.

---

## Step 2 — Default Arguments

Some parameters should have a sensible default so callers do not always have to provide them:

```python
def calculate_sfm(diameter_inches, rpm, decimal_places=0):
    import math
    raw_sfm = math.pi * diameter_inches * rpm / 12
    return round(raw_sfm, decimal_places)   # round to N decimal places

calculate_sfm(0.5, 3820)         # → 1000  (uses default: 0 decimal places)
calculate_sfm(0.5, 3820, 2)      # → 1000.07  (2 decimal places)
```

A parameter with a default is **optional** — the caller may provide it or not. Parameters without defaults are **required** — omitting them causes `TypeError`.

**Required parameters must come before optional ones:**

```python
def describe(name, diameter_inches, flutes=4, material="carbide"):  # valid
    ...

def bad(name, flutes=4, material):  # SyntaxError: non-default after default
    ...
```

---

### Concept: Default Arguments

**What it is:** A fallback value for a parameter, used when the caller does not provide that argument.

**The problem before:** Every caller must supply every value:

```python
calculate_sfm(0.5, 3820, 0)   # why must callers always specify 0 decimal places?
```

If 90% of callers want 0 decimal places, they should not have to say so. Only the 10% who want something different should need to specify.

**The solution:**

```python
def calculate_sfm(diameter_inches, rpm, decimal_places=0):
    ...

calculate_sfm(0.5, 3820)        # most callers: decimal_places = 0
calculate_sfm(0.5, 3820, 2)     # callers who need precision
```

**Canonical example (General):**

A coffee order form with defaults: "Size: [medium], Milk: [oat milk], Sugar: [1 packet]." You only write down what you want to change. If you want the default, leave it blank.

**Smallest possible example:**

```python
def describe_tool(name, diameter_inches, material="carbide"):  # material defaults to "carbide"
    return f"{name}: {diameter_inches:.3f}\" ({material})"

describe_tool("EM-0500", 0.5)              # → "EM-0500: 0.500\" (carbide)"
describe_tool("EM-0500", 0.5, "HSS")      # → "EM-0500: 0.500\" (HSS)"
```

**Why it matters here:** `recommended_rpm` will have `rpm_override=None` as an optional parameter. Callers who do not need to override simply omit it.

**You will see this again in:** Every Python library. In PySide6 (Block 3): `QTableView(parent=None)`. In FastAPI (Block 11): route parameters with defaults. In pytest: `@pytest.fixture(scope="function")`.

**Watch for:** The mutable default trap — covered immediately below.

---

### The Mutable Default Trap

Try this in the REPL:

```python
def add_tool(tool, tool_list=[]):     # default is a LIST — this is WRONG
    tool_list.append(tool)
    return tool_list

print(add_tool("EM-0500"))    # first call
print(add_tool("DR-0250"))    # second call
```

**You should see:**

```
['EM-0500']
['EM-0500', 'DR-0250']
```

The second call uses the same list that was created during the first call. The default `[]` is created ONCE when the function is defined, not each time the function is called. Every call that uses the default shares the same list. This is one of Python's most famous bugs.

---

### Concept: The Mutable Default Argument Trap

**What it is:** A Python behavior where mutable default argument values (lists, dicts, sets) are shared across all calls that use the default.

**The problem:**

```python
def add_tool(tool, tool_list=[]):   # the [] is created once at definition time
    tool_list.append(tool)          # appends to the SAME list every time
    return tool_list
```

**The solution:** Use `None` as the default, and create a new mutable value inside the function:

```python
def add_tool(tool, tool_list=None):          # None is immutable — safe default
    if tool_list is None:                    # if no list was provided
        tool_list = []                       # create a new empty list for this call
    tool_list.append(tool)
    return tool_list

print(add_tool("EM-0500"))    # → ['EM-0500']
print(add_tool("DR-0250"))    # → ['DR-0250']  — fresh list, no contamination
```

**Why it happens:** When Python processes `def add_tool(tool, tool_list=[])`, it evaluates `[]` once and stores it as the default value. That object persists for the lifetime of the function. Mutable objects (lists, dicts) can be changed in place — so every call that uses the default modifies the same object.

**What it hides / the invariant broken:** Python usually hides memory management from you — you just name values. But defaults are an exception: they are named objects created once. The invariant you expect — "each call starts fresh" — is violated for mutable defaults.

**Canonical example (General):**

A stamp pad used as the "default ink." Every letter you stamp goes into the same pad. The pad's ink supply decreases with each use — the "default" state changes because the object is shared.

**Project application:** Any time a function builds a list (validation errors, results, warnings), use `result = None` as the default and create `result = []` inside. This pattern appears in `ToolValidator.validate_create` from Lab 00g.

**You will see this again in:** This is a standard Python interview question. "What is the mutable default argument trap?" If you can explain it, you demonstrate real Python knowledge. It appears in every codebase that has been around long enough to hit it accidentally.

**Watch for:** This trap only applies to mutable types: `list`, `dict`, `set`. Immutable defaults (`int`, `float`, `str`, `tuple`, `None`) are completely safe.

---

### SAVE AND TRY

In the REPL:

```python
def safe_collect(item, items=None):    # None is the safe default
    if items is None:
        items = []                     # fresh list each call
    items.append(item)
    return items

print(safe_collect("EM-0500"))         # → ['EM-0500']
print(safe_collect("DR-0250"))         # → ['DR-0250']  — fresh list
```

**You should see:** Two separate single-item lists.

**Console test:** Create the unsafe version and call it twice:

```python
def unsafe_collect(item, items=[]):
    items.append(item)
    return items

unsafe_collect("A")
unsafe_collect("B")
unsafe_collect("C")
```

**Expected:** Each call returns a longer list. The default list accumulates everything.

**Change something:** Pass an explicit empty list to the unsafe version: `unsafe_collect("X", [])`. What happens? **Expected:** Returns `['X']` — when you provide your own list, the default is not used, so there is no contamination. Change it back.

---

## Step 3 — Keyword Arguments

You can call any function by naming the parameters instead of relying on position:

```python
import math

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / 12

# Positional call — argument order must match parameter order:
calculate_sfm(0.5, 3820)

# Keyword call — order does not matter:
calculate_sfm(rpm=3820, diameter_inches=0.5)    # reversed order, same result

# Mixed — positional first, then keyword:
calculate_sfm(0.5, rpm=3820)
```

---

### Concept: Keyword Arguments

**What it is:** Passing arguments by naming the parameter they fill, instead of relying on position.

**Why it matters:**

```python
schedule_maintenance(True, False, True, 3)   # what do these booleans mean?

schedule_maintenance(
    requires_coolant=True,
    is_emergency=False,
    notify_operator=True,
    days_until_due=3
)
```

The second form is self-documenting. Booleans at the call site are almost always confusing without names — keyword arguments fix that.

**The rule:** Positional arguments come before keyword arguments. `f(a, b=value)` is valid; `f(a=value, b)` is a `SyntaxError`.

**Canonical example (General):**

Filling out a form: "Name: _______ Age: _______" — the fields have names. You fill in the right box regardless of the order the form lists them.

**Smallest possible example:**

```python
def create_tool(name, diameter_inches, flutes=4, material="carbide"):
    return f"{name} {diameter_inches:.3f}\" {flutes}fl {material}"

# All positional:
create_tool("EM-0500", 0.5, 2, "HSS")

# Mixed, with keyword for clarity on the tricky ones:
create_tool("EM-0500", 0.5, flutes=2, material="HSS")

# All keyword — perfectly valid:
create_tool(name="EM-0500", diameter_inches=0.5, flutes=2, material="HSS")
```

**Why it matters here:** `recommended_rpm(0.5, "carbide", rpm_override=4000)` — the `rpm_override` keyword makes the intent clear: this is an override, not a third positional argument.

**You will see this again in:** Python's standard library uses keyword arguments everywhere. `open("file.txt", encoding="utf-8")`. `sorted(tools, key=lambda t: t.name, reverse=True)`. In PySide6 (Block 3): `QLabel("text", parent=self)`.

**Watch for:** A function can be called with all positional, all keyword, or mixed. The only hard rule: positional arguments must come before keyword arguments at the call site.

---

## Step 4 — `*args` and `**kwargs`

Sometimes you do not know in advance how many arguments a function will receive:

```python
def sum_diameters(*args):      # *args collects any number of positional arguments into a tuple
    total = 0.0
    for diameter in args:      # args is a tuple — you can loop over it
        total += diameter
    return total

sum_diameters(0.5, 0.25, 1.0)   # → 1.75
sum_diameters(0.5)               # → 0.5
sum_diameters()                  # → 0.0
```

```python
def configure_tool(**kwargs):   # **kwargs collects any keyword arguments into a dict
    for key, value in kwargs.items():
        print(f"  {key}: {value}")

configure_tool(material="carbide", coating="TiN", flutes=4)
# prints:
#   material: carbide
#   coating: TiN
#   flutes: 4
```

These are most commonly seen when building wrapper functions that pass arguments through to another function:

```python
def log_and_call(func, *args, **kwargs):
    print(f"Calling {func.__name__}")       # __name__ is the function's name as a string
    return func(*args, **kwargs)            # unpack and forward all arguments

log_and_call(calculate_sfm, 0.5, 3820)
```

---

### Concept: `*args` and `**kwargs`

**What they are:** Syntax that collects any number of extra arguments into a tuple (`*args`) or dict (`**kwargs`).

**The problem before:** Without these, you must declare exactly how many arguments a function accepts. A function that sums a variable number of diameters cannot be written with a fixed signature.

**`*args` — variable positional arguments:**

The `*` in `def f(*args)` means "collect all remaining positional arguments into a tuple named `args`." The name `args` is conventional — `*measurements` or `*tools` works too.

**`**kwargs` — variable keyword arguments:**

The `**` in `def f(**kwargs)` means "collect all remaining keyword arguments into a dict named `kwargs`." The name `kwargs` is conventional.

**When to use them:**

- `*args`: when a function logically accepts any number of the same kind of value (summing, comparing, collecting)
- `**kwargs`: when a function accepts configuration options that vary by caller
- Both: when writing decorator functions or wrappers that forward arguments

**Canonical example (General):**

A grocery order line: "Give me [any number of items]." The checkout total function does not need to know in advance whether you have 3 or 30 items — it iterates over whatever arrived.

**Smallest possible example:**

```python
def join_names(*names):                # accepts any number of name strings
    return ", ".join(names)            # join() concatenates with a separator

join_names("EM-0500", "DR-0250")           # → "EM-0500, DR-0250"
join_names("EM-0500", "DR-0250", "FM-0750") # → "EM-0500, DR-0250, FM-0750"
```

**Why it matters here:** In Block 9 (Pydantic), `**kwargs` is used when constructing domain objects from dict data. In pytest fixtures, `*args` is used in parametrized tests.

**You will see this again in:** Python's standard library (`print(*objects, sep=' ', end='\n')`). In Python decorators (used in pytest, FastAPI, Flask). In any library that wraps another library.

**Watch for:** `*args` and `**kwargs` are optional — they only collect extra arguments that go beyond the declared parameters. You can mix them: `def f(name, diameter, *tags, **options)` — `name` and `diameter` are required, `*tags` catches extra positional, `**options` catches extra keyword.

---

### SAVE AND TRY

In the REPL:

```python
def tool_summary(*names):
    print(f"Summary of {len(names)} tools:")   # len() on a tuple gives item count
    for name in names:
        print(f"  - {name}")

tool_summary("EM-0500", "DR-0250", "FM-0750")
```

**You should see:**

```
Summary of 3 tools:
  - EM-0500
  - DR-0250
  - FM-0750
```

**Console test:**

```python
def show_options(**kwargs):
    for key, value in kwargs.items():    # .items() gives (key, value) pairs
        print(f"  {key} = {value}")

show_options(material="carbide", flutes=4, coating="TiN")
```

**Expected:** Three lines, one per keyword argument.

**Change something:** Call `tool_summary()` with no arguments. What does it print? **Expected:** `"Summary of 0 tools:"` and no list items — `*args` collects zero items as an empty tuple, which is valid.

---

## Step 5 — Red: Write the Test

Now build `recommended_rpm` through Red-Green-Refactor.

Create `tests/test_sfm_lookup.py`:

```python
from tooldb.sfm_lookup import recommended_rpm   # ← will fail — module does not exist yet
```

Add the tests:

```python
from tooldb.sfm_lookup import recommended_rpm


def test_carbide_recommended_rpm_half_inch():
    result = recommended_rpm(0.5, "carbide")
    assert "3820" in result              # expected RPM for 0.5" carbide at 1000 SFM


def test_hss_recommended_rpm_half_inch():
    result = recommended_rpm(0.5, "HSS")
    assert "764" in result               # expected RPM for 0.5" HSS at 200 SFM


def test_result_includes_sfm_target():
    result = recommended_rpm(0.5, "carbide")
    assert "1000" in result              # SFM target must appear in the output


def test_result_includes_material():
    result = recommended_rpm(0.5, "carbide")
    assert "carbide" in result           # material name in output


def test_rpm_override():
    result = recommended_rpm(0.5, "carbide", rpm_override=4000)
    assert "4000" in result              # override RPM appears
    assert "OVERRIDE" in result          # word "OVERRIDE" signals manual setting


def test_unknown_material_raises():
    import pytest
    with pytest.raises(ValueError):      # expecting a ValueError for unknown material
        recommended_rpm(0.5, "unobtanium")
```

Run:

```powershell
pytest tests/test_sfm_lookup.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.sfm_lookup'
```

Red. The module does not exist.

---

## Step 6 — Green: Write the Function

Create `tooldb/sfm_lookup.py`:

```python
import math

from tooldb.sfm import calculate_sfm, calculate_rpm   # reuse existing functions from Lab 00c

MATERIAL_SFM_TARGETS = {      # standard starting SFM for common tool materials
    "carbide": 1000,          # carbide endmills: 800-1200 SFM, use 1000 as default
    "HSS": 200,               # high speed steel: 100-300 SFM, use 200 as default
    "cobalt": 400,            # cobalt HSS: 300-500 SFM, use 400 as default
}
```

Now add the function:

```python
def recommended_rpm(diameter_inches: float, material: str, rpm_override: int = None) -> str:
    if material not in MATERIAL_SFM_TARGETS:              # guard: unknown material
        raise ValueError(f"Unknown material: {material!r}. Known: {list(MATERIAL_SFM_TARGETS)}")
        # !r in an f-string adds quotes around the value: 'unobtanium' not unobtanium

    target_sfm = MATERIAL_SFM_TARGETS[material]           # look up the SFM for this material
    normal_rpm = round(calculate_rpm(target_sfm, diameter_inches))  # compute recommended RPM

    if rpm_override is not None:                          # caller is manually setting RPM
        return (
            f'{diameter_inches:.3f}": {rpm_override} RPM '
            f"(OVERRIDE — normal: {normal_rpm} RPM)"
        )

    return (
        f'{diameter_inches:.3f}": {normal_rpm} RPM '
        f"(target: {target_sfm} SFM, material: {material})"
    )
```

Run:

```powershell
pytest tests/test_sfm_lookup.py
```

**You should see:**

```
6 passed in 0.01s
```

Green.

---

## Step 7 — Refactor: Inspect the Composition

Run the full test suite:

```powershell
pytest tests/
```

All tests pass. Now look at what `recommended_rpm` demonstrates about function composition. In the REPL:

```python
from tooldb.sfm_lookup import recommended_rpm

print(recommended_rpm(0.5, "carbide"))
print(recommended_rpm(0.5, "HSS"))
print(recommended_rpm(1.0, "carbide"))
print(recommended_rpm(0.5, "carbide", rpm_override=4000))
```

**You should see:**

```
0.500": 3820 RPM (target: 1000 SFM, material: carbide)
0.500": 764 RPM (target: 200 SFM, material: HSS)
1.000": 3820 RPM (target: 1000 SFM, material: carbide)
0.500": 4000 RPM (OVERRIDE — normal: 3820 RPM)
```

`recommended_rpm` calls `calculate_rpm` from `sfm.py`, which calls `tool_circumference_inches`, which uses `math.pi`. Three levels of function calls — each does one thing, composed to do something bigger.

---

### Concept: The Call Stack

**What it is:** The record Python keeps of which function called which, so it knows where to return when each function finishes.

**What happens when you call a function:**

1. Python pushes a **frame** onto the call stack — a block of memory containing the function's local variables and the return address
2. The function runs with its own local scope (local variables do not leak out)
3. When the function hits `return` (or ends), Python pops the frame and resumes at the call site

**Visualizing `recommended_rpm(0.5, "carbide")`:**

```
call stack (bottom = first, top = current):

  [recommended_rpm]          ← currently running
  [test_carbide_recommended_rpm_half_inch]   ← waiting for recommended_rpm to return
  [pytest test runner]       ← waiting for the test to return

When recommended_rpm calls calculate_rpm:

  [calculate_rpm]
  [recommended_rpm]
  [test function]
  [pytest runner]

When calculate_rpm calls tool_circumference_inches:

  [tool_circumference_inches]
  [calculate_rpm]
  [recommended_rpm]
  [test function]
  [pytest runner]
```

Each return pops one frame and gives the result back to the caller below it.

**What it hides:** Memory management for local variables. When `calculate_rpm` returns, its frame is discarded — `target_sfm`, `diameter_inches`, and `circumference` disappear. Python handles this automatically.

**Why it matters:** When an exception occurs, Python shows you the call stack — the traceback. Reading a traceback from bottom to top tells you the sequence of calls that led to the error.

**Canonical example (General):**

A delegation chain. The manager asks the lead to do a task. The lead asks a developer. The developer completes the task and hands the result back up through the chain, and eventually the manager has the answer. Each level "pauses" while the one below it works.

**You will see this again in:** Python error tracebacks — always. In debugging (`pdb`): the call stack shows you where you are. In recursion (lesson 09 area): each recursive call adds a frame.

**Watch for:** Stack overflow — calling functions so deeply that Python runs out of stack space. Python's default limit is 1000 frames. This rarely matters in normal code; it is relevant for deep recursion.

---

### SAVE AND TRY

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass.

**Console test:**

```python
from tooldb.sfm_lookup import recommended_rpm
import pytest

try:
    recommended_rpm(0.5, "unobtanium")
except ValueError as error:
    print(error)
```

**Expected:** `Unknown material: 'unobtanium'. Known: ['carbide', 'HSS', 'cobalt']`

**Change something:** Change `rpm_override=4000` to `rpm_override=0` in the test. Does the test still pass? **Expected:** Yes — `0` is a valid override (it means stop the machine). The `is not None` check correctly allows `0` as an override. This is why `is not None` matters: `if rpm_override` would treat `0` as "no override," which is wrong.

---

## 🎯 Challenge: Add `calculate_sfm_for_material`

**You know:** Default arguments, keyword arguments, function composition, `raise ValueError`.

**Task:** Write a function `calculate_sfm_for_material(diameter_inches, rpm, material)` in `tooldb/sfm_lookup.py` that:
1. Computes the actual SFM being achieved (using `calculate_sfm` from `sfm.py`)
2. Looks up the target SFM for the material
3. Returns a string like: `"Actual: 1000 SFM (target: 1000 SFM) — ON TARGET"` or `"Actual: 800 SFM (target: 1000 SFM) — BELOW TARGET"` or `"Actual: 1200 SFM (target: 1000 SFM) — ABOVE TARGET"`

Write the test first. Use a tolerance of ±5%: within 5% of target is "ON TARGET."

**Starting code:**

```python
# In tests/test_sfm_lookup.py, add these tests:

def test_on_target():
    result = calculate_sfm_for_material(0.5, 3820, "carbide")  # exactly 1000 SFM
    assert "ON TARGET" in result

def test_below_target():
    result = calculate_sfm_for_material(0.5, 3000, "carbide")  # ~786 SFM
    assert "BELOW TARGET" in result

def test_above_target():
    result = calculate_sfm_for_material(0.5, 5000, "carbide")  # ~1309 SFM
    assert "ABOVE TARGET" in result
```

**Hint:** `abs(actual_sfm - target_sfm) / target_sfm` gives the percentage difference as a decimal. Compare it to `0.05` (5%).

---

<details>
<summary>▶ Show Solution</summary>

**Import line** (add to top of test file):

```python
from tooldb.sfm_lookup import recommended_rpm, calculate_sfm_for_material
```

**Function** (add to `tooldb/sfm_lookup.py`):

```python
ON_TARGET_TOLERANCE = 0.05   # within 5% of target is considered "on target"


def calculate_sfm_for_material(diameter_inches: float, rpm: int, material: str) -> str:
    if material not in MATERIAL_SFM_TARGETS:
        raise ValueError(f"Unknown material: {material!r}")

    actual_sfm = round(calculate_sfm(diameter_inches, rpm))   # compute what the machine is doing
    target_sfm = MATERIAL_SFM_TARGETS[material]               # what it should be doing

    difference_ratio = abs(actual_sfm - target_sfm) / target_sfm   # fractional difference

    if difference_ratio <= ON_TARGET_TOLERANCE:
        status = "ON TARGET"
    elif actual_sfm < target_sfm:
        status = "BELOW TARGET"
    else:
        status = "ABOVE TARGET"

    return f"Actual: {actual_sfm} SFM (target: {target_sfm} SFM) — {status}"
```

**Key insight:** `ON_TARGET_TOLERANCE = 0.05` is a named constant. The 5% figure is a business decision about what "close enough" means. Naming it makes that decision visible and changeable without hunting through arithmetic. The `abs()` call handles both below-target and above-target cases without separate branches.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `recommended_rpm(0.5, "carbide")` returns correct RPM string | `pytest tests/test_sfm_lookup.py` — 6 tests pass |
| `rpm_override` parameter is optional | Test `test_carbide_recommended_rpm_half_inch` passes without override |
| Override produces "OVERRIDE" in output | `test_rpm_override` passes |
| Unknown material raises `ValueError` | `test_unknown_material_raises` passes |
| Mutable default trap explained | Can describe the trap and the `None` fix from memory |
| All previous tests still pass | `pytest tests/` — no regressions |

---

## Quick Check Answers

**1. Parameters vs arguments in `def calculate_sfm(diameter_inches, rpm)` and `calculate_sfm(0.5, 3820)`:**

In `def calculate_sfm(diameter_inches, rpm)`, `diameter_inches` and `rpm` are **parameters** — names used inside the function definition, placeholders waiting to be filled. In `calculate_sfm(0.5, 3820)`, `0.5` and `3820` are **arguments** — the actual values passed at the call site. `0.5` fills `diameter_inches`; `3820` fills `rpm`.

**2. What happens when two callers each append to `cc=[]`?**

Both callers share the same list. The `cc=[]` default is created once when the function is defined. The first caller's `.append()` modifies it. The second caller receives the already-modified list from the first call, then appends to it again. This is the mutable default argument trap. The fix: `cc=None`, then inside the function: `if cc is None: cc = []`.

**3. Are `calculate_rpm(1.0, 1000)` and `calculate_rpm(diameter_inches=1.0, target_sfm=1000)` the same?**

They produce the same result if the parameter names match. `diameter_inches=1.0` explicitly fills the first parameter; `target_sfm=1000` fills the second. This is identical to the positional call `calculate_rpm(1.0, 1000)` as long as the first parameter is `diameter_inches` and the second is `target_sfm`. Keyword calls are independent of argument order — which is why keyword calls are safer for functions with many parameters.
