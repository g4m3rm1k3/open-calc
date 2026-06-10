# Python Tool Database — LAB 00e — Refactoring: Improving Code Without Breaking It

**Prerequisites:** Lab 00c (Red-Green-Refactor cycle, `calculate_sfm` exists and passes tests) and Lab 00d (YAGNI, Simple Design). All tests should be passing before this lesson begins.

**What this lab adds:**
- A precise definition of refactoring — what it is, what it is not, and why the distinction matters
- Five specific refactoring moves you will use in every lesson from here: Rename, Extract Function, Inline Variable, Remove Duplication, Move Function
- The rule for when to refactor and when to stop
- A personal refactoring log that tracks every improvement you make throughout the series

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You fix a bug while also renaming a variable in the same change. Is that a refactoring? What is the problem with combining them?
> 2. In Lab 00c, you renamed `d` to `diameter_inches`. Was that a refactoring? How do you know?
> 3. If you have no tests, can you safely refactor? What is the risk?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces:

1. A **refactoring log** started in `notes.md` — one row per refactoring move you make, in this lesson and every lesson after
2. A clear mental model of the five most common moves — concrete enough that you can name the move you are making whenever you make it

There is no new source code to write. The lesson applies refactoring moves to `calculate_sfm` and introduces a second function to demonstrate Extract Function.

---

## Concept: What Refactoring Is — and What It Is Not

**What it is (precise definition):** Changing the internal structure of code without changing its observable behavior. Before the refactoring, tests pass. After each change, tests still pass. The test suite defines "observable behavior" — if the tests pass before and after, the refactoring is safe.

**What it is NOT:**

| This is NOT refactoring | What it actually is |
|---|---|
| Adding a new parameter | Feature addition |
| Fixing a bug | Bug fix |
| Rewriting the module from scratch | Rewrite |
| Optimizing a function to run faster | Performance optimization |
| Changing what the function returns | Behavior change |

**Why the distinction matters in practice:**

Refactoring and other changes must be kept separate. Not because the rules say so, but because mixing them makes failures harder to diagnose.

If you rename a variable and fix a bug in the same commit, and the tests fail, which change caused the failure? If you extracted a function and changed its return type, the test failure could be either change. Keeping them separate means: when tests fail after a refactoring, you know the refactoring changed behavior. That tells you exactly what to undo.

**The problem before (what happens without disciplined refactoring):**

```python
# Week 1: function is small and clear
def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT

# Week 3: someone adds material correction (a feature, committed with renaming)
def calculate_sfm(diameter_inches, rpm, material=None):
    # renamed INCHES_PER_FOOT to conversion_factor "while we were here"
    conversion_factor = 12
    if material == "hardened":
        rpm = rpm * 0.7  # reduce speed for hard materials
    return math.pi * diameter_inches * rpm / conversion_factor

# Week 5: tests start failing — was it the rename? the new parameter? the rpm mutation?
# Nobody knows. The git history is one commit that changed three things.
```

**The solution:**

Keep each type of change in its own step, its own commit if you are using git:

1. Refactor (rename, extract, etc.) → run tests → green → commit "refactor: rename conversion_factor back to INCHES_PER_FOOT"
2. Feature (add material parameter) → run tests → green → commit "feat: add material speed correction"

The commit history becomes a log of what changed and why. When a test fails, you know exactly which commit to blame.

**What it hides:** The cognitive cost of tracking "what did I change?" Keeping refactoring separate means you always know: "in this step, I changed structure only. In the next step, I changed behavior."

**Canonical example (General):**

A librarian reorganizing shelves is refactoring: books move, but the collection's contents are unchanged. A librarian who reorganizes and also checks out some books, orders new ones, and discards damaged ones is not refactoring — they are doing many things at once, and the "reorganize" part is now impossible to undo cleanly.

**You will see this again in:**
- Every lesson's Refactor step — explicitly separated from Red and Green
- Git commit discipline: "refactor:", "feat:", "fix:" prefixes tell reviewers what category of change was made
- Pull request review: "this PR mixes refactoring and feature work — can we split it?"
- Martin Fowler's "Refactoring" (the book that established the vocabulary) — each move is a named, atomic change

**Watch for:** "I'll just fix this while I'm refactoring" is where discipline breaks down. When you notice a bug during a refactoring session, do not fix it yet. Write a test that catches the bug (turn the bug into a failing test), then commit the refactoring, then fix the bug in a separate step. This way the bug fix has a test and the refactoring history is clean.

---

## The Five Moves

These five refactoring moves cover the vast majority of cleanup work in this project. Each one has a precise name — use the name when you make the move, both to develop the vocabulary and so the refactoring log is meaningful.

---

### Move 1: Rename

**What it does:** Gives a variable, function, parameter, or constant a more accurate name.

**When to use:** Whenever you read a name and it takes more than one second to understand what it refers to.

**Example — before:**

```python
def calc(d, r):          # what is "d"? what is "r"?
    return 3.14 * d * r / 12
```

**After Rename:**

```python
def calculate_sfm(diameter_inches, rpm):    # ← both names reveal their meaning
    return 3.14 * diameter_inches * rpm / 12
```

**Cost:** Near zero. Rename is the cheapest refactoring and the most frequently needed.

**Rule it satisfies:** Simple Design Rule 3 — the code expresses its intent clearly.

---

### Move 2: Extract Function

**What it does:** Takes a block of code inside a function, gives it a name, and makes it a separate function. The original function now calls the new one.

**When to use:** When a comment is needed to explain what a block of code does. If you would write `# compute the conversion factor` before three lines of code, those three lines should be a function named `compute_conversion_factor`.

**Example — before:**

```python
def calculate_machining_time(length_inches, feed_rate_ipm, approach_inches, retract_inches):
    # total distance = approach + cut + retract
    total_distance = approach_inches + length_inches + retract_inches
    # time = distance / feed rate
    return total_distance / feed_rate_ipm
```

**After Extract Function:**

```python
def total_travel_distance(length_inches, approach_inches, retract_inches):
    return approach_inches + length_inches + retract_inches    # the extracted block, named

def calculate_machining_time(length_inches, feed_rate_ipm, approach_inches, retract_inches):
    distance = total_travel_distance(length_inches, approach_inches, retract_inches)
    return distance / feed_rate_ipm    # reads like the domain rule, not like arithmetic
```

**Cost:** Adds a function. But removes the need for a comment. If a function needs comments to explain what it does, it should be split until it does not.

**Rule it satisfies:** Simple Design Rule 3 (clearer intent). Sometimes also Rule 2 (if the extracted function is then called from two places that used to duplicate the logic).

---

### Move 3: Inline Variable

**What it does:** Removes a variable that is only assigned once and whose name adds nothing over just using the expression directly.

**When to use:** When the variable name is not more informative than the expression it holds.

**Example — before:**

```python
def calculate_sfm(diameter_inches, rpm):
    result = math.pi * diameter_inches * rpm / INCHES_PER_FOOT   # 'result' adds nothing
    return result
```

**After Inline Variable:**

```python
def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT   # ← inline the expression
```

**When NOT to inline:** When the variable name is more informative than the expression:

```python
# Do NOT inline this — the name explains what the calculation means:
total_travel_distance = approach_inches + length_inches + retract_inches
return total_travel_distance / feed_rate_ipm
```

**Rule it satisfies:** Simple Design Rule 4 — remove structures that do not improve rules 1–3.

---

### Move 4: Remove Duplication

**What it does:** Finds two or more places where the same logic appears, extracts it into one place, and makes both callers use that single definition.

**When to use:** When you copy-paste code and realize you are about to create two things that must stay synchronized forever.

**Example — before:**

```python
def calculate_sfm_imperial(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / 12   # /12 appears here

def calculate_min_sfm(diameter_inches, rpm):
    minimum_speed_factor = 0.75
    return math.pi * diameter_inches * rpm * minimum_speed_factor / 12   # and here
```

If the conversion factor ever changed (it will not for inches, but as a pattern), you would need to find and change it in both places. Miss one: silent wrong answer.

**After Remove Duplication:**

```python
INCHES_PER_FOOT = 12   # one place — change it here, both functions update

def calculate_sfm_imperial(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT

def calculate_min_sfm(diameter_inches, rpm):
    minimum_speed_factor = 0.75
    return math.pi * diameter_inches * rpm * minimum_speed_factor / INCHES_PER_FOOT
```

**This is the DRY principle:** Don't Repeat Yourself. Every piece of knowledge has one authoritative representation in the system.

**Rule it satisfies:** Simple Design Rule 2 — no duplication.

**Cost:** Adds a shared dependency. If you later need the two functions to use different constants, you must un-inline. The cost is usually worth it: duplication is a maintenance trap that grows over time.

---

### Move 5: Move Function

**What it does:** Moves a function from one module or class to another module or class, because the function uses more data from the destination than from the source.

**When to use:** When you read a function and most of its logic involves data from a different module — the function is "in the wrong neighborhood."

**Example — before:**

```python
# tooldb/sfm.py
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT

def validate_rpm(rpm, tool_max_rpm):    # ← this function is about tool properties, not SFM
    return 0 < rpm <= tool_max_rpm
```

`validate_rpm` belongs with tool validation code, not with SFM calculations. When you add tool validation logic elsewhere, `validate_rpm` will be in the wrong file.

**After Move Function:**

```python
# tooldb/sfm.py — only SFM calculation remains
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT


# tooldb/validation.py — tool validation lives here
def validate_rpm(rpm, tool_max_rpm):
    return 0 < rpm <= tool_max_rpm
```

**Rule it satisfies:** Simple Design Rule 3 (clearer intent — each file has one cohesive purpose). Also supports Single Responsibility Principle (SOLID, taught in Lab 00g).

**Cost:** Splits a working module. Callers of the moved function must update their imports. Worth it when a module is growing beyond its stated purpose.

---

## Step 1 — Apply Rename to a Real Example

Your current `tooldb/sfm.py` is already clean. To practice the Rename move, you will introduce a new function alongside `calculate_sfm` and apply Rename to it.

The new function is `calculate_rpm` — given a desired SFM and a tool diameter, compute the required spindle speed. This is the inverse of `calculate_sfm`:

```
RPM = (SFM × 12) / (π × diameter_inches)
    = (SFM × INCHES_PER_FOOT) / (π × diameter_inches)
```

First, write the test. In `tests/test_sfm.py`, add:

```python
from tooldb.sfm import calculate_sfm, calculate_rpm  # ← update the import to include calculate_rpm

def test_calculate_sfm_one_inch():
    result = calculate_sfm(1.0, 3820)
    assert round(result) == 1000

def test_calculate_rpm_one_inch():               # ← add this test
    result = calculate_rpm(1000, 1.0)            # 1000 SFM, 1.0 inch diameter → expect 3820 RPM
    assert round(result) == 3820
```

### SAVE AND TRY

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
FAILED tests/test_sfm.py::test_calculate_rpm_one_inch - ImportError: cannot import name 'calculate_rpm'
```

The test is Red. `calculate_rpm` does not exist yet. The ImportError is the signal.

Now add `calculate_rpm` to `tooldb/sfm.py`:

```python
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT

def calculate_rpm(s, d):                             # ← add this (parameter names intentionally poor)
    return (s * INCHES_PER_FOOT) / (math.pi * d)   # s = sfm target, d = diameter — not clear
```

### SAVE AND TRY

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
2 passed in 0.01s
```

Green. The function exists and the formula is correct. Now apply the Rename move.

**The Rename:** `s` is an unclear name for the target surface speed. `d` is an unclear name for the diameter. Apply Rename to both:

In `tooldb/sfm.py`, change the function definition:

```python
def calculate_rpm(target_sfm, diameter_inches):                     # ← was: s, d
    return (target_sfm * INCHES_PER_FOOT) / (math.pi * diameter_inches)  # ← was: s, d
```

### SAVE AND TRY

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
2 passed in 0.01s
```

Still green. The rename did not change behavior. Record this in your refactoring log (see below).

**Change something:** Rename `target_sfm` to `sfm` (shorter, less clear). Run pytest. Still green — the test calls the function positionally, so the parameter name does not affect correctness. But Rule 3 is now violated: `sfm` does not tell you it is the target value, not the result. Rename it back to `target_sfm`.

---

## Step 2 — Apply Extract Function

The current state of `tooldb/sfm.py`:

```python
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT

def calculate_rpm(target_sfm, diameter_inches):
    return (target_sfm * INCHES_PER_FOOT) / (math.pi * diameter_inches)
```

Notice: both functions involve `math.pi * diameter_inches`. This is not duplication of the formula (the formulas are different), but there is a shared sub-expression: the **circumference** of the tool (how far the cutting edge travels per revolution).

```
circumference_inches = π × diameter_inches

SFM = circumference_inches × rpm / INCHES_PER_FOOT
RPM = (target_sfm × INCHES_PER_FOOT) / circumference_inches
```

Apply Extract Function to name the shared concept:

```python
import math

INCHES_PER_FOOT = 12

def tool_circumference_inches(diameter_inches):        # ← extracted function, names the concept
    return math.pi * diameter_inches                   # π × d = how far the edge travels per rev

def calculate_sfm(diameter_inches, rpm):
    circumference = tool_circumference_inches(diameter_inches)  # ← call the extracted function
    return circumference * rpm / INCHES_PER_FOOT

def calculate_rpm(target_sfm, diameter_inches):
    circumference = tool_circumference_inches(diameter_inches)  # ← reuse — no duplication
    return (target_sfm * INCHES_PER_FOOT) / circumference
```

### SAVE AND TRY

```powershell
pytest tests/test_sfm.py
```

**You should see:**

```
2 passed in 0.01s
```

Still green. The extraction is safe. The formulas now read like the domain rule: SFM is circumference times RPM per foot. RPM is SFM-in-feet-per-minute times the conversion, divided by circumference.

**Is this extraction required by Rule 2 or Rule 3?**

- **Rule 2:** both `calculate_sfm` and `calculate_rpm` now call `tool_circumference_inches` instead of duplicating `math.pi * diameter_inches`. The shared concept has one representation. ✓
- **Rule 3:** `tool_circumference_inches(diameter_inches)` expresses the domain concept (the tool's cutting-edge travel per revolution) rather than the formula `math.pi * diameter_inches`. ✓
- **Rule 4:** adds one function, but that function is required by Rule 2 and 3. ✓

The extraction satisfies all four rules.

**Change something:** Inline `tool_circumference_inches` back (put `math.pi * diameter_inches` directly in both functions):

```python
def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT    # ← inlined

def calculate_rpm(target_sfm, diameter_inches):
    return (target_sfm * INCHES_PER_FOOT) / (math.pi * diameter_inches)  # ← duplicated
```

Run pytest. Still green. But now `math.pi * diameter_inches` appears in two places — Rule 2 is violated. Change it back to the extracted version.

---

## The Refactoring Log

Start a refactoring log in `notes.md`. The format:

```
## Refactoring Log

| Lesson | File | Move | Before → After | Rule satisfied |
|---|---|---|---|---|
| 00c | tooldb/sfm.py | Rename | d → diameter_inches | Rule 3 |
| 00c | tooldb/sfm.py | Rename | 3.14159 → math.pi | Rule 3 |
| 00c | tooldb/sfm.py | Inline Variable | result = ...; return result → return ... | Rule 4 |
| 00e | tooldb/sfm.py | Rename | s, d → target_sfm, diameter_inches | Rule 3 |
| 00e | tooldb/sfm.py | Extract Function | math.pi * diameter_inches → tool_circumference_inches() | Rule 2, 3 |
```

Add one row every time you make a refactoring move in any lesson. By the end of the series, this log will show how often each move appears and which rule it most commonly satisfies.

---

## When to Refactor — and When to Stop

### When to refactor

Refactoring belongs in the **Refactor step** of the Red-Green-Refactor cycle — after the test is Green. Not during Red (you are writing a test), not during Green (you are making it pass). Only after Green.

If you notice a refactoring opportunity while in the Red step or Green step, write it down (add a comment: `# TODO: rename this parameter`) and finish the current step first. Then refactor.

### When to stop

Stop when:

1. All four Simple Design rules are satisfied
2. The code reads like the domain — the names match the real-world concepts, the functions are small enough to read in one screen
3. You have been refactoring for more than 10 minutes without making a test fail

The last rule is a time box. Refactoring sessions can expand indefinitely — there is always something that could be cleaner. Set a mental (or real) 10-minute limit for the Refactor step of each cycle. If you have been refactoring for 10 minutes, run the tests, commit, and move to the next Red step.

### The trap: refactoring as procrastination

Refactoring feels productive. Code gets cleaner without writing any new features. This can become procrastination — improving what exists instead of building what is needed. The Red step is the antidote: go back to it after each Refactor step. The next failing test pulls you forward.

---

## 🎯 Challenge: Classify the Moves

**You know:** The five refactoring moves and the four Simple Design rules.

**Task:** The function below has been modified from a clean state. Identify exactly what changes need to be made to satisfy all four Simple Design rules, and name the refactoring move for each change.

```python
import math
import datetime   # added but never used

CONVERSION = 12   # what does "CONVERSION" mean?

def sfm(a, b):   # what is "a"? what is "b"?
    t = math.pi * a * b / CONVERSION   # what is "t"?
    return t

def rpm(a, b):   # "a" and "b" again — are they the same things?
    c = (a * CONVERSION) / (math.pi * b)   # "c" = ?
    return c
```

All tests still pass (the tests use positional arguments). What is wrong, and which move fixes each problem?

**Hint:** List each issue separately. Some issues share a move name.

---

<details>
<summary>▶ Show Solution</summary>

**Issue 1: `import datetime` — never used**

Move: **Inline Variable** (or simply Delete). Remove the import.

Rule violated: Simple Design Rule 4 — an import is a dependency, and unused dependencies add cognitive load.

**Issue 2: `CONVERSION = 12` — name does not say what is being converted**

Move: **Rename**. Change `CONVERSION` to `INCHES_PER_FOOT`.

Rule violated: Simple Design Rule 3 — the intent is unclear.

**Issue 3: `def sfm(a, b)` — function name is abbreviated, parameters unnamed**

Two Rename moves:
- Rename `sfm` to `calculate_sfm`
- Rename `a` to `diameter_inches`
- Rename `b` to `rpm` (inside `sfm`)

Rule violated: Simple Design Rule 3.

**Issue 4: `t = ...; return t` in `sfm`**

Move: **Inline Variable**. `t` adds nothing — the expression can be returned directly.

Rule violated: Simple Design Rule 4 — `t` is a structure with no benefit.

**Issue 5: `def rpm(a, b)` — same parameter naming problem**

Move: **Rename**. `rpm` → `calculate_rpm`, `a` → `target_sfm`, `b` → `diameter_inches`, `c` → nothing (inline).

**Issue 6: `math.pi * a * b` appears in both functions (after renaming: `math.pi * diameter_inches * ???`)**

Wait — looking carefully: in `sfm`, the expression is `math.pi * a * b` (circumference × rpm). In `rpm`, the expression is `math.pi * b` (just circumference). These are not duplications of the same logic — one is `π × diameter × rpm`, the other is `π × diameter`. However, `math.pi * b` (circumference) appears in both. That is a candidate for Extract Function.

Move: **Extract Function**. Extract `math.pi * diameter_inches` to `tool_circumference_inches(diameter_inches)` and call it from both.

**The corrected code:**

```python
import math

INCHES_PER_FOOT = 12

def tool_circumference_inches(diameter_inches):
    return math.pi * diameter_inches

def calculate_sfm(diameter_inches, rpm):
    return tool_circumference_inches(diameter_inches) * rpm / INCHES_PER_FOOT

def calculate_rpm(target_sfm, diameter_inches):
    return (target_sfm * INCHES_PER_FOOT) / tool_circumference_inches(diameter_inches)
```

**Key insight:** Multiple refactoring moves are often needed to bring messy code into Simple Design compliance. You do not have to apply them all in one step. Apply one move, run the tests, confirm green, apply the next. Each step is independently safe and independently verifiable.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All tests pass after extraction | Run `pytest tests/` — all green |
| `tooldb/sfm.py` has `tool_circumference_inches` | Open the file — function exists, returns `math.pi * diameter_inches` |
| `calculate_sfm` calls `tool_circumference_inches` | Open the file — no raw `math.pi * diameter_inches` in `calculate_sfm` body |
| `calculate_rpm` calls `tool_circumference_inches` | Open the file — no raw `math.pi * diameter_inches` in `calculate_rpm` body |
| Refactoring log has entries for 00c and 00e | Open `notes.md` — at least 5 rows in the log |
| You can name all 5 moves without reading | Close this lesson and list them |
| You can state when to stop refactoring | Say the three rules out loud |

---

## Quick Check Answers

**1. You fix a bug while also renaming a variable in the same change. Is that a refactoring?**

No. A refactoring changes structure without changing behavior. Fixing a bug changes behavior (you are making a previously-failing test pass, or fixing code that was producing wrong results). Combining them means: if a test fails after the commit, you cannot tell whether the rename or the bug fix caused it. Keep them separate. Write the regression test for the bug, commit the refactoring, then commit the bug fix with its test.

**2. In Lab 00c, was renaming `d` to `diameter_inches` a refactoring?**

Yes — it satisfies the precise definition. Before the rename, all tests passed. After the rename, all tests still passed. The function's observable behavior (what it returns for any input) was unchanged. The only change was the name of the parameter, which is internal structure. The test passes before and after. The rename is exactly a refactoring.

**3. Without tests, can you safely refactor?**

You can make changes. But "safe refactoring" requires a way to verify that behavior did not change. Without tests, the only check is manual: run the app, click around, observe. Manual checks are incomplete — they cannot verify every code path. A rename that accidentally left a reference to the old name would cause a `NameError` on first use, but if the test for that path is not run manually, the error is invisible. Tests are the safety net. Without tests, refactoring is not safe — it is optimistic.
