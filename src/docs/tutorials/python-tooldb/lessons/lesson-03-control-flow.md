# Python Tool Database — LAB 03 — Control Flow: if, for, while

**Prerequisites:** Lab 02. You know Python's five basic types, variable assignment, arithmetic, and f-strings. `describe_tool` exists in `tooldb/display.py` and its tests pass.

**What this lab adds:**
- `if/elif/else` — branching based on conditions
- Boolean expressions and Python's truthiness rules
- `for` loops over lists and over `range()`
- `while` loops and `break`
- A function that classifies tool diameters as "standard" or "special order," built through Red-Green-Refactor

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What values in Python are "falsy" — treated as `False` in an `if` statement? Can you name four?
> 2. `for i in range(5)` loops how many times? What is the value of `i` on the last iteration?
> 3. A `while True` loop runs forever unless something stops it. What two tools stop a `while` loop?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have a function `classify_diameter(diameter_inches)` that returns `"standard"`, `"oversized"`, or `"special order"` based on tool diameter, and a loop that processes a list of tool diameters and prints a classification for each:

```
DR-0125: 0.125" → special order
EM-0250: 0.250" → standard
EM-0500: 0.500" → standard
FM-0750: 0.750" → standard
EM-1000: 1.000" → oversized
EM-1500: 1.500" → special order
```

---

## Step 1 — The `if` Statement

Open the REPL: `python`

```python
diameter_inches = 0.5

if diameter_inches < 0.25:           # if the condition is True, run this block
    print("very small tool")
elif diameter_inches < 0.75:         # elif = "else if" — checked only if the above was False
    print("standard size")
else:                                 # runs if none of the above conditions were True
    print("large tool")
```

**You should see:** `standard size`

The indentation is not optional. Python uses indentation to define blocks. Everything indented under an `if` is part of that branch. The `elif` and `else` must align with the original `if`.

---

### Concept: `if/elif/else` — Conditional Branching

**What it is:** A control flow statement that runs one of several code blocks based on which condition is `True`.

**The problem before:** Without branching, a program does the same thing every time. A tool that cannot decide "is this carbide or HSS?" cannot choose the right SFM range.

**The solution:**

```python
if condition_A:       # test condition_A
    ...               # run if A is True
elif condition_B:     # only tested if A was False
    ...               # run if B is True
else:                 # runs if nothing above was True
    ...
```

**Rules:**
- Only one branch runs — the first one whose condition is `True`
- `elif` and `else` are optional
- Multiple `elif` branches are allowed

**Boolean expressions in conditions:** Any expression that evaluates to `True` or `False`. The comparison operators:

```python
x == y   # equal (two equal signs — one equals is assignment)
x != y   # not equal
x < y    # less than
x > y    # greater than
x <= y   # less than or equal
x >= y   # greater than or equal
```

**Combining conditions with `and` / `or` / `not`:**

```python
if diameter_inches >= 0.25 and diameter_inches <= 0.75:
    print("standard range")

if material == "carbide" or material == "HSS":
    print("known material")

if not is_special_order:
    print("standard tool")
```

**Canonical example (General):**

A traffic light: red → stop, yellow → slow, green → go. Exactly one of those three things happens — never two at once.

```python
if light == "red":
    action = "stop"
elif light == "yellow":
    action = "slow"
else:
    action = "go"
```

**Project application:** Every classification decision — material type, diameter range, holder compatibility — is an `if/elif/else`. `classify_diameter` uses it directly.

**Smallest possible example:**

```python
diameter_inches = 0.5
if diameter_inches > 1.0:
    category = "large"
elif diameter_inches > 0.25:
    category = "medium"
else:
    category = "small"
print(category)   # → "medium"
```

**Why it matters here:** Classifying tools, checking validation errors, deciding which adapter to use — all require branching.

**You will see this again in:** Every program ever written. In Block 2 (SQL): `CASE WHEN diameter > 1.0 THEN 'large' ELSE 'standard' END` is SQL's equivalent. In Pydantic (Block 9): validators use `if/else` to decide whether data is valid.

**Watch for:** The classic mistake: `if x = 5` (one equals) instead of `if x == 5` (two equals). One equals is assignment; it is a `SyntaxError` in an `if` condition in Python. This is common when first learning.

---

### SAVE AND TRY

In the REPL:

```python
diameter_inches = 0.5

if diameter_inches > 1.25:
    category = "special order"
elif diameter_inches > 0.75:
    category = "oversized"
else:
    category = "standard"

print(f'{diameter_inches:.3f}" → {category}')
```

**You should see:** `0.500" → standard`

**Console test:** Change `diameter_inches = 0.5` to `diameter_inches = 1.5` and re-run the block. **Expected:** `1.500" → special order`

**Change something:** Change `elif diameter_inches > 0.75` to `elif diameter_inches > 0.5`. What is the category for `diameter_inches = 0.75` now? Change it back.

---

## Step 2 — Truthiness

Python's `if` statement does not require a strict `bool`. Any value can be tested:

```python
tool_name = "EM-0500"
if tool_name:             # str is truthy if it has content
    print("has a name")

tool_name = ""
if tool_name:             # empty string is falsy
    print("has a name")   # ← this does NOT print
else:
    print("no name set")  # ← this prints
```

---

### Concept: Truthiness — What Python Considers True or False

**What it is:** Python's rule for converting any value to `bool` when used in a condition. Every value in Python is either "truthy" (behaves like `True`) or "falsy" (behaves like `False`).

**The falsy values — memorize these six:**

| Value | Type | Why falsy |
|-------|------|-----------|
| `False` | bool | The false boolean |
| `None` | NoneType | The absence of a value |
| `0` | int | Zero |
| `0.0` | float | Zero as float |
| `""` | str | Empty string |
| `[]` | list | Empty list |

Everything else is truthy. A non-zero number, a non-empty string, a non-empty list — all truthy.

**Why it matters:** In Python, you rarely write `if tool_name != ""` or `if flutes != None`. You write `if tool_name` or `if flutes is not None`. The code reads more naturally.

**Warning for `None`:** Use `is not None`, not `if flutes`. Why? `if flutes` is falsy for `None` but also for `0`. A tool with 0 flutes (if that ever happened) would be treated the same as no flute count. Always use `is not None` when you specifically mean "this is not None."

**Canonical example (General):**

Asking someone "Do you have tickets?" — they either have them (truthy) or they don't (falsy). The empty wallet is falsy. The wallet with one ticket is truthy. Zero tickets is falsy. The question tests presence, not an exact value.

**Smallest possible example:**

```python
names = []
if names:            # empty list is falsy — this block does NOT run
    print("tools found")

names = ["EM-0500"]
if names:            # non-empty list is truthy — this block DOES run
    print("tools found")   # → "tools found"
```

**You will see this again in:** Every Python guard clause: `if not errors:`, `if results:`, `if connection:`. In React (Block 11): JavaScript has the same concept — `if (toolList.length)` is a common truthiness check.

**Watch for:** `0` is falsy. If you have a counter that legitimately reaches zero and you use `if count:` to check it, you will get wrong results. Always be explicit: `if count > 0` when zero is a meaningful value.

---

### SAVE AND TRY

In the REPL:

```python
def describe_if_present(tool_name):
    if tool_name:                          # truthy: non-empty string
        print(f"Tool name: {tool_name}")
    else:
        print("No tool name provided")

describe_if_present("EM-0500")   # → "Tool name: EM-0500"
describe_if_present("")          # → "No tool name provided"
describe_if_present(None)        # → "No tool name provided" (None is also falsy)
```

**Console test:** What does `bool("")` return? What does `bool("EM-0500")` return?
**Expected:** `False`, `True`

**Change something:** Try `bool(0)`, `bool(0.0)`, `bool([])`. All should return `False`. Try `bool(0.001)` — `True`. Change nothing back — this is exploration.

---

## Step 3 — The `for` Loop

A `for` loop runs a block of code once for each item in a sequence:

```python
diameters = [0.125, 0.25, 0.5, 0.75, 1.0, 1.5]

for diameter in diameters:        # each iteration: diameter gets the next value
    print(f'{diameter:.3f}"')     # runs once per item
```

**You should see:**

```
0.125"
0.250"
0.500"
0.750"
1.000"
1.500"
```

---

### Concept: `for` Loop — Iterating Over a Sequence

**What it is:** A loop that runs exactly once for each item in a sequence, binding a name to each item in turn.

**The problem before:** Without a loop, you would repeat the same code for each item:

```python
print(f'{0.125:.3f}"')
print(f'{0.25:.3f}"')
print(f'{0.5:.3f}"')
# ... repeated for every diameter — fragile and cannot handle dynamic data
```

**The solution:**

```python
for diameter in diameters:
    print(f'{diameter:.3f}"')
```

Python assigns each value from `diameters` to `diameter` in turn. When the list is exhausted, the loop ends.

**What it hides:** The index tracking. Without a `for` loop, you would manually track position: `i = 0`, `diameters[i]`, `i += 1`, check `i < len(diameters)`. The `for` loop hides all of that — you get the value directly.

**`range()` — looping over numbers:**

```python
for i in range(5):       # generates 0, 1, 2, 3, 4
    print(i)             # 5 iterations total

for i in range(1, 6):    # generates 1, 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2):  # start, stop, step → 0, 2, 4, 6, 8
    print(i)
```

`range(n)` generates n integers starting at 0. The stop value is excluded (like Python slices — always).

**Index-based vs value-based loops:**

```python
tools = ["EM-0500", "DR-0250", "FM-0750"]

# Value-based (preferred when you only need the value):
for tool in tools:
    print(tool)

# Index-based (when you need the position):
for i in range(len(tools)):
    print(f"{i}: {tools[i]}")

# Both at once (enumerate — combines value and index):
for index, tool in enumerate(tools):
    print(f"{index}: {tool}")
```

**Canonical example (General):**

Reading each page of a book. You start at page 1, read it, move to page 2, read it, continue until you finish the last page. The page number (index) changes; the action (read the page) is the same.

**Project application:** Processing a list of tool diameters, iterating over rows returned from the database, generating a report line for each tool in an assembly — all `for` loops.

**Smallest possible example:**

```python
STANDARD_DIAMETERS = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1.0]   # common endmill sizes

for diameter in STANDARD_DIAMETERS:
    print(f"Checking: {diameter:.3f}")
```

**Why it matters here:** The `classify_diameter` function you are about to build will be called in a `for` loop over a list of tool records.

**You will see this again in:** Every program. In Block 2 (SQL): iterating over database query results. In Block 7 (Mastercam import): processing each row of an imported tool list. In React (Block 11): `tools.map()` is the functional equivalent.

**Watch for:** Do NOT modify a list while iterating over it with a `for` loop. Python's behavior is undefined. If you need to remove items, iterate over a copy: `for item in list(original):`.

---

### SAVE AND TRY

In the REPL:

```python
TOOL_NAMES = ["DR-0125", "EM-0250", "EM-0500", "FM-0750", "EM-1000", "EM-1500"]
DIAMETERS  = [0.125,     0.25,      0.5,       0.75,      1.0,       1.5     ]

for name, diameter in zip(TOOL_NAMES, DIAMETERS):   # zip() pairs items from two lists
    print(f'{name}: {diameter:.3f}"')
```

**You should see:**

```
DR-0125: 0.125"
EM-0250: 0.250"
EM-0500: 0.500"
FM-0750: 0.750"
EM-1000: 1.000"
EM-1500: 1.500"
```

**Console test:**

```python
list(range(0, 10, 2))   # what does this produce?
```

**Expected:** `[0, 2, 4, 6, 8]`

**Change something:** Change `range(0, 10, 2)` to `range(10, 0, -2)`. What does it produce? **Expected:** `[10, 8, 6, 4, 2]` — counting backward. Change it back.

---

## Step 4 — `while` Loops and `break`

A `while` loop repeats as long as its condition is `True`:

```python
retries = 0
MAX_RETRIES = 3

while retries < MAX_RETRIES:       # check condition before each iteration
    print(f"Attempt {retries + 1}")
    retries += 1                    # retries = retries + 1 — increment

print("Done")
```

**You should see:**

```
Attempt 1
Attempt 2
Attempt 3
Done
```

`while` is the right loop when you do not know in advance how many iterations you need — the loop continues until a condition changes. `break` exits the loop immediately regardless of the condition.

```python
import random

while True:                         # infinite loop — only break stops it
    value = random.randint(1, 10)   # random integer from 1 to 10
    print(f"Got: {value}")
    if value == 7:
        break                       # exit the loop when we get 7
print("Found 7, stopping")
```

**When to use `for` vs `while`:**
- `for`: when you are iterating over a known sequence (a list, a range, query results)
- `while`: when you are waiting for a condition to change (retrying a connection, reading until end of file, processing a queue until empty)

---

### SAVE AND TRY

In the REPL:

```python
count = 0
while count < 5:
    print(f"count is {count}")
    count += 1

print("loop ended")
```

**You should see:** Five lines of count output, then "loop ended".

**Console test:** Remove the `count += 1` line. What happens? Press Ctrl+C to stop an infinite loop. **Expected:** Infinite `"count is 0"` output — without incrementing, the condition `count < 5` is always `True`.

**Change something:** Add `if count == 3: break` inside the loop. What is the last line printed? **Expected:** `count is 3` — break exits before printing 4. Remove that line.

---

## Step 5 — Red: Write the Test

Now build `classify_diameter` through Red-Green-Refactor.

Create `tests/test_classify.py`:

```python
from tooldb.classify import classify_diameter   # ← this import will fail — that is correct
```

Add test cases covering all three categories:

```python
from tooldb.classify import classify_diameter


def test_standard_diameter():
    assert classify_diameter(0.5) == "standard"    # clearly in standard range


def test_oversized_diameter():
    assert classify_diameter(1.0) == "oversized"   # between standard and special


def test_special_order_diameter():
    assert classify_diameter(1.5) == "special order"  # too large for standard stock


def test_small_special_order():
    assert classify_diameter(0.125) == "special order"  # too small for standard stock


def test_exact_boundary_low():
    assert classify_diameter(0.25) == "standard"   # boundary: 0.25" is standard


def test_exact_boundary_high():
    assert classify_diameter(0.75) == "standard"   # boundary: 0.75" is still standard
```

Run:

```powershell
pytest tests/test_classify.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.classify'
```

Red. The module does not exist yet. That error is the signal we need — now we write the code that makes it pass.

---

## Step 6 — Green: Write the Function

Create a new file `tooldb/classify.py`:

```python
STANDARD_MIN_DIAMETER = 0.25   # smallest "standard stock" diameter in this shop
STANDARD_MAX_DIAMETER = 0.75   # largest "standard stock" diameter in this shop
OVERSIZED_MAX_DIAMETER = 1.25  # above this, the tool is special order


def classify_diameter(diameter_inches: float) -> str:
    if diameter_inches > OVERSIZED_MAX_DIAMETER:            # above 1.25" — rare special tool
        return "special order"
    elif diameter_inches > STANDARD_MAX_DIAMETER:           # between 0.75" and 1.25"
        return "oversized"
    elif diameter_inches >= STANDARD_MIN_DIAMETER:          # between 0.25" and 0.75" inclusive
        return "standard"
    else:                                                    # below 0.25" — micro tooling
        return "special order"
```

Run:

```powershell
pytest tests/test_classify.py
```

**You should see:**

```
6 passed in 0.01s
```

Green. All six boundary cases pass.

---

## Step 7 — Refactor: Add the Loop

The function works. Now add the loop that uses it to process a list of tools. Add to `tooldb/classify.py`:

```python
STANDARD_MIN_DIAMETER = 0.25   # ← already exists
STANDARD_MAX_DIAMETER = 0.75   # ← already exists
OVERSIZED_MAX_DIAMETER = 1.25  # ← already exists


def classify_diameter(diameter_inches: float) -> str:     # ← already exists
    if diameter_inches > OVERSIZED_MAX_DIAMETER:
        return "special order"
    elif diameter_inches > STANDARD_MAX_DIAMETER:
        return "oversized"
    elif diameter_inches >= STANDARD_MIN_DIAMETER:
        return "standard"
    else:
        return "special order"


def classify_tool_list(tools: list) -> None:              # ← add this function
    for tool in tools:                                    # each tool is a dict with "name" and "diameter_inches"
        name = tool["name"]                               # extract name from dict
        diameter = tool["diameter_inches"]                # extract diameter from dict
        category = classify_diameter(diameter)            # call the function we just tested
        print(f'{name}: {diameter:.3f}" → {category}')   # one line per tool
```

Add a test for the full loop output. Add to `tests/test_classify.py`:

```python
import io
import sys

def test_classify_tool_list_output(capsys):        # capsys is a pytest fixture that captures print() output
    from tooldb.classify import classify_tool_list

    sample_tools = [
        {"name": "DR-0125", "diameter_inches": 0.125},   # too small → special order
        {"name": "EM-0500", "diameter_inches": 0.5},     # standard
        {"name": "EM-1500", "diameter_inches": 1.5},     # too large → special order
    ]

    classify_tool_list(sample_tools)
    captured = capsys.readouterr()                  # collect what was printed

    assert "DR-0125" in captured.out                # tool name appears
    assert "special order" in captured.out          # DR-0125 is special order
    assert "EM-0500" in captured.out
    assert "standard" in captured.out               # EM-0500 is standard
```

Run:

```powershell
pytest tests/
```

**You should see:** All tests pass.

---

### Concept: `capsys` — Capturing Output in Tests

**What it is:** A pytest built-in fixture that intercepts `print()` calls during a test so you can assert on what was printed.

**The problem before:** A function that calls `print()` produces output but does not return it. You cannot assert on output you cannot access:

```python
def test_bad():
    classify_tool_list(tools)   # output goes to the terminal
    # how do you check what was printed? You can't.
```

**The solution:** `capsys` captures stdout and stderr:

```python
def test_good(capsys):             # pytest injects capsys automatically when named
    classify_tool_list(tools)
    captured = capsys.readouterr() # captured.out = all stdout output as a string
    assert "standard" in captured.out
```

**What it hides:** The plumbing of redirecting stdout to a buffer and reading it back. Without `capsys`, you would have to manually redirect `sys.stdout` to a `io.StringIO()` buffer, which is verbose and error-prone.

**Why it matters here:** Functions that print output for the user — report generators, display functions — need tests. `capsys` is the clean way to test them without changing the function to return strings instead of printing.

**You will see this again in:** Any project where functions produce terminal output. In Block 3 (PySide6): signal-based testing replaces `capsys` for UI output. In Block 11 (FastAPI): response bodies replace stdout for web output.

**Watch for:** `capsys.readouterr()` consumes the captured output — calling it again returns empty strings. If you need to assert multiple times, store the result first: `captured = capsys.readouterr()`.

---

### SAVE AND TRY

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass, including all earlier tests.

**Console test:** Run the classification loop directly:

```python
python
from tooldb.classify import classify_tool_list

SAMPLE_TOOLS = [
    {"name": "DR-0125", "diameter_inches": 0.125},
    {"name": "EM-0250", "diameter_inches": 0.25},
    {"name": "EM-0500", "diameter_inches": 0.5},
    {"name": "FM-0750", "diameter_inches": 0.75},
    {"name": "EM-1000", "diameter_inches": 1.0},
    {"name": "EM-1500", "diameter_inches": 1.5},
]

classify_tool_list(SAMPLE_TOOLS)
```

**You should see:**

```
DR-0125: 0.125" → special order
EM-0250: 0.250" → standard
EM-0500: 0.500" → standard
FM-0750: 0.750" → standard
EM-1000: 1.000" → oversized
EM-1500: 1.500" → special order
```

**Change something:** Change `OVERSIZED_MAX_DIAMETER = 1.25` to `OVERSIZED_MAX_DIAMETER = 0.875`. Run `test_oversized_diameter` — it should now fail because `1.0"` is now "special order", not "oversized". Change it back.

---

## 🎯 Challenge: Count by Category

**You know:** `if/elif/else`, `for` loops, variables, types.

**Task:** Write a function `count_by_category(tools: list) -> dict` that returns a dictionary with three keys — `"standard"`, `"oversized"`, `"special order"` — each mapping to the count of tools in that category.

For the sample list above, the expected return value is:
```python
{"standard": 3, "oversized": 1, "special order": 2}
```

Write the test first in `tests/test_classify.py`, then write the function in `tooldb/classify.py`.

**Hints:**
1. Start with `counts = {"standard": 0, "oversized": 0, "special order": 0}`
2. In the loop, call `classify_diameter(tool["diameter_inches"])` and increment the right counter

---

<details>
<summary>▶ Show Solution</summary>

**Test first** (add to `tests/test_classify.py`):

```python
def test_count_by_category():
    from tooldb.classify import count_by_category

    tools = [
        {"name": "DR-0125", "diameter_inches": 0.125},  # special order
        {"name": "EM-0250", "diameter_inches": 0.25},   # standard
        {"name": "EM-0500", "diameter_inches": 0.5},    # standard
        {"name": "FM-0750", "diameter_inches": 0.75},   # standard
        {"name": "EM-1000", "diameter_inches": 1.0},    # oversized
        {"name": "EM-1500", "diameter_inches": 1.5},    # special order
    ]

    result = count_by_category(tools)

    assert result["standard"] == 3        # EM-0250, EM-0500, FM-0750
    assert result["oversized"] == 1       # EM-1000
    assert result["special order"] == 2   # DR-0125, EM-1500
```

**Then the function** (add to `tooldb/classify.py`):

```python
def count_by_category(tools: list) -> dict:
    counts = {"standard": 0, "oversized": 0, "special order": 0}  # initialize all three to zero

    for tool in tools:
        category = classify_diameter(tool["diameter_inches"])  # classify this tool
        counts[category] += 1                                  # increment the right counter

    return counts
```

**Key insight:** `counts[category] += 1` uses the category string as a dict key to look up and increment the right counter. Because `classify_diameter` returns exactly one of the three strings that are already keys in `counts`, there is no `if/elif` needed here — the dict lookup handles the branching.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `classify_diameter(0.5)` returns `"standard"` | Run `pytest tests/test_classify.py` — 6 tests pass |
| `classify_diameter(1.5)` returns `"special order"` | `test_special_order_diameter` passes |
| `classify_diameter(0.125)` returns `"special order"` | `test_small_special_order` passes |
| Boundary values 0.25" and 0.75" are "standard" | `test_exact_boundary_low` and `test_exact_boundary_high` pass |
| `classify_tool_list` prints correct categories | `test_classify_tool_list_output` passes |
| All previous tests still pass | Run `pytest tests/` — no regressions |
| You can explain when to use `for` vs `while` | `for` = known sequence; `while` = condition-dependent |

---

## Quick Check Answers

**1. What values in Python are "falsy"?**

The six falsy values are: `False` (the bool), `None` (no value), `0` (zero int), `0.0` (zero float), `""` (empty string), and `[]` (empty list). Empty dict `{}` and empty tuple `()` are also falsy. Every other value — non-zero numbers, non-empty strings, non-empty lists — is truthy. Python's `if condition:` converts `condition` to bool using these rules. You can check any value with `bool(value)` in the REPL.

**2. `for i in range(5)` — how many iterations? Last value of `i`?**

Five iterations. The values are `0, 1, 2, 3, 4`. `range(5)` generates 5 integers starting at 0 and stopping before 5. The last value of `i` when the loop ends is `4`. This "stop before" rule is consistent across Python — slices work the same way: `my_list[0:5]` gives items at positions 0, 1, 2, 3, 4 but not 5.

**3. Two tools that stop a `while` loop:**

`break` exits the loop immediately and resumes after the loop. The condition becoming `False` ends the loop normally — after the current iteration, Python checks the condition again, finds it `False`, and skips the loop body. `return` inside a loop also stops the loop by returning from the enclosing function entirely. There is also `continue`, which skips the rest of the current iteration but does not end the loop — it goes back to check the condition for the next iteration.
