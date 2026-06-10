# Python Tool Database — LAB 00d — YAGNI and Simple Design

**Prerequisites:** Lab 00c — you have written one Red-Green-Refactor cycle, `calculate_sfm` exists in `tooldb/sfm.py`, and all tests pass. You should be able to run `pytest tests/` and see green.

**What this lab adds:**
- A concrete rule for deciding what to build right now: YAGNI (You Aren't Gonna Need It)
- Kent Beck's four rules of Simple Design — a decision framework you will use in every lesson from here
- An applied audit: checking whether anything in `calculate_sfm` violates either rule
- A permanent question to ask before writing any new code in this project

**Time:** 30–45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you are writing a tool database and you think "I will probably need a unit conversion (imperial to metric) eventually," should you add it now? What would YAGNI say?
> 2. What is the difference between code that "passes all tests" and code that "expresses intent clearly"? Can code pass all tests and still be unclear?
> 3. The lesson plan has 70+ lessons. Does knowing the whole plan mean you should build infrastructure for later lessons now?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces no new source files. It produces two things you will use for the rest of the series:

1. **A YAGNI checklist** — added to `notes.md` — one question to ask before writing any line of code
2. **A Simple Design audit** of `tooldb/sfm.py` — reading the current code through the lens of Kent Beck's four rules and confirming it passes all four

By the end, you will understand exactly why `calculate_sfm` is written the way it is — and why it is not written a dozen other plausible ways.

---

## The Setup

Before reading further, confirm your project is in this state:

```powershell
pytest tests/
```

**You should see:**

```
2 passed in 0.01s
```

(or more if you added tests in the Lab 00c challenges — all should be green).

**If any test is failing:** Stop here and fix it before continuing. YAGNI and Simple Design only apply to working code. To working code, they are refinements. To broken code, they are distractions.

---

## Concept: YAGNI — You Aren't Gonna Need It

**What it is:** A rule that says do not write code until a failing test demands it. Not "I might need this." Not "while I'm here." Only when a test fails because the code is missing.

**The problem before:**

Programmers are good at anticipating the future. You are building a tool database, and you can already see that eventually you will need:

- metric unit support (millimeters instead of inches)
- SFM calculations for different material types with a correction factor
- a caching layer so you do not recalculate the same RPM twice
- a `Tool` class that bundles diameter and RPM together
- validation to reject negative diameters

All of that is reasonable anticipation. The temptation is to add it now while you are already in the file. The problem:

```python
# Adding metric support "just in case":
def calculate_sfm(diameter_inches, rpm, unit="imperial"):   # ← no test demands this
    if unit == "imperial":
        return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
    elif unit == "metric":
        # diameter in mm, speed in mm/min?
        # wait, what unit does "metric SFM" use? surface meters per minute?
        # "smm"? this isn't even a standard term
        return math.pi * (diameter_inches / 25.4) * rpm / INCHES_PER_FOOT  # ← guessing
    else:
        raise ValueError(f"Unknown unit: {unit}")  # ← also not tested
```

That function is now longer, harder to test, has untested branches, and the metric path is based on a guess about what you will need. When the real requirement arrives, you will discover the guess was wrong — and you will have dead code that must be removed.

**The solution:**

Do not add the `unit` parameter until a test fails because it is missing. When that day comes, you will have a specific requirement (a real use case) instead of a guess, a test that defines exactly what the behavior should be, and no dead code to remove first.

**What it hides:** Future uncertainty. YAGNI is not a claim that you will never need metric support. It is a claim that building it before the requirement is known produces worse code than building it when the requirement is specific. Uncertainty costs money in code.

**The invariant it protects:** Every line of code in the project is there because a test required it. No untested branches, no speculative features, no "just in case" parameters. If you can point to the test that demanded each piece of code, you have honored YAGNI.

**Canonical example (General):**

A contractor building a kitchen is told: "We want a standard island." The contractor does not pre-wire for a gas line "just in case they want a gas range later" — that is expensive, possibly wasted, and requires assumptions about a future decision. Instead: build the island to spec, and when the client says "we want gas," now there is a specific requirement to implement.

**Project application:**

The lesson plan has 70+ lessons. You can see that you will eventually build Mastercam import, XML parsing, a REST API, and a React frontend. None of that means you should add abstractions for it now. The lesson plan is a roadmap; YAGNI governs what you build today.

Specific things you will be tempted to add early and should resist until a test demands them:

| "While I'm here, let me add..." | What YAGNI says |
|---|---|
| A `unit` parameter to `calculate_sfm` for metric support | Do not add it — no test demands it yet |
| A `Tool` class to bundle diameter and RPM | Do not add it — `calculate_sfm` works fine with two arguments |
| A `cache` dictionary to avoid recalculating | Do not add it — no test measures performance yet |
| Error handling for negative diameter | Do not add it — no test uses a negative diameter yet |

**Smallest possible example:**

```python
# YAGNI violation: adding flexibility before a test demands it
def greet(name, language="english"):  # ← no test has ever called greet(name, language="french")
    if language == "english":
        return f"Hello, {name}"
    elif language == "french":
        return f"Bonjour, {name}"   # ← this branch has no test — it could be wrong forever

# YAGNI compliant: build exactly what the test requires
def greet(name):
    return f"Hello, {name}"

# When a test demands French:
# def test_greet_in_french():
#     assert greet("monde", language="french") == "Bonjour, monde"
# ...then and only then, add the parameter.
```

**Why it matters here:** You are about to audit `calculate_sfm`. The audit question is: does every line, parameter, and branch exist because a test demanded it?

**You will see this again in:**
- Code review: "Why is this parameter here? What test uses it?" is a real feedback pattern
- Technical debt: speculative features that were never used but must be maintained are a major source of complexity in real codebases
- Simple Design (next concept) — YAGNI is one of its four rules
- Every time you are tempted to add something "while you're there" in a later lesson

**Watch for:** YAGNI can be taken too far. "I won't write any error handling until a test fails because of bad input" is valid TDD discipline. But `assert diameter_inches > 0` as an invariant at function entry is reasonable to add when you understand the domain — even before a test for it. Use judgment. YAGNI governs features and abstractions, not basic defensive checks in safety-critical calculations.

---

## Step 1 — YAGNI Audit of `calculate_sfm`

Open `tooldb/sfm.py`. Read it now:

```python
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
```

Now answer these questions:

**1. Is there any parameter that no test ever passes?**

The tests call `calculate_sfm(1.0, 3820)` and `calculate_sfm(0.5, 3820)`. Both parameters (`diameter_inches` and `rpm`) are used by every test. No unused parameters. ✓

**2. Is there any branch (`if`/`elif`/`else`) that no test exercises?**

No branches at all. One path through the function. ✓

**3. Is there any constant or variable defined but never read?**

`INCHES_PER_FOOT` is defined and used in the `return` line. `math.pi` is used. ✓

**4. Is there any comment that describes planned future behavior?**

No comments at all. ✓

**The audit result:** `calculate_sfm` passes the YAGNI audit. Every line is there because the tests require it. Nothing is speculative.

### SAVE AND TRY

This audit produced no changes. Confirm the code is still working:

```powershell
pytest tests/
```

**You should see:** All tests passing. The audit changed nothing, which is correct — a passing audit requires no changes.

**In the terminal:** Open `tooldb/sfm.py` directly:

```powershell
python -c "from tooldb.sfm import calculate_sfm; print(calculate_sfm(1.0, 3820))"
```

**Expected:** `1000.0691...` — the unrounded float. The test rounds it; the function returns the raw value. Notice that no rounding happens inside the function — rounding is the test's concern, not the function's.

**Change something:** Add a `unit="imperial"` parameter with a default value to `calculate_sfm` and a branch that does nothing different:

```python
def calculate_sfm(diameter_inches, rpm, unit="imperial"):  # ← add this (temporarily)
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
```

Run `pytest tests/`. The tests still pass — the default value means the existing calls still work. But now there is an untested, unused parameter. Remove it. This is what a YAGNI violation looks like: code that does not break anything but is not required by any test.

---

## Concept: Simple Design — Four Rules

**What it is:** Kent Beck's original four rules for deciding whether a design is as simple as it should be, listed in priority order. If two rules conflict, the earlier rule wins.

**The four rules:**

```
Rule 1 — The code passes all the tests
Rule 2 — The code contains no duplication
Rule 3 — The code expresses its intent clearly (good names, small functions)
Rule 4 — The code has the fewest possible classes and methods that satisfy rules 1–3
```

**Why the order matters:**

- **Rule 1** is the constraint that all other rules operate within. A "clean" codebase that fails tests is worthless. Tests come first.
- **Rule 2** is about removing duplication, which is the single biggest source of bugs and maintenance cost in real codebases. If the same logic appears in two places, it will eventually diverge — one copy gets updated, the other is forgotten.
- **Rule 3** is about readability. Code is read more often than it is written. A function named `calc(d, r)` passes the tests and has no duplication, but it communicates nothing. Rule 3 requires it to be named `calculate_sfm(diameter_inches, rpm)`.
- **Rule 4** is the YAGNI rule expressed as a design constraint. If you can satisfy rules 1–3 with one class instead of two, use one class. Extra classes, extra layers, extra indirection — all of these cost something. They must earn their presence by satisfying rules 1–3 in a way that fewer structures cannot.

**The problem without these rules:**

Without a clear priority, design discussions are opinions: "I prefer to have more abstraction," "I prefer to have less." Kent Beck's rules convert opinions into questions: "Does this duplication violate Rule 2? Does this abstraction reduce code that was needed under Rule 3?"

**What it hides:** The need for taste. With these four rules, "is this simple enough?" has an answer: pass all four rules in order. If Rule 2 is satisfied and Rule 3 is satisfied and you have added an extra class — Rule 4 says remove it.

**The invariant it protects:** A design that satisfies all four rules, in order, is the simplest possible design that works, communicates, and does not repeat itself. It cannot be simplified without violating an earlier rule.

**Canonical example (General):**

```python
# Violates Rule 2 (duplication):
def get_first_name(person):
    return person["first_name"].strip().lower()

def get_last_name(person):
    return person["last_name"].strip().lower()   # same strip-and-lower logic duplicated

# Satisfies all four rules:
def normalize_name_part(raw_name):    # Rule 3: clear name; Rule 2: no duplication
    return raw_name.strip().lower()

def get_first_name(person):
    return normalize_name_part(person["first_name"])

def get_last_name(person):
    return normalize_name_part(person["last_name"])
```

**Project application:**

You will apply these four rules to every piece of code in this series. Specifically:
- Rule 2 will drive every "Extract Function" refactoring when logic repeats
- Rule 3 drove the rename of `d` to `diameter_inches` in Lesson 00c
- Rule 4 will stop you from adding a `ToolFactory` class until a test demands it

**You will see this again in:**
- Every code review — Rule 2 catches duplication, Rule 3 catches poor naming, Rule 4 catches over-engineering
- Robert Martin's "Clean Code" covers Rule 3 in detail (chapter 2: Meaningful Names)
- Martin Fowler's "Refactoring" is a catalog of moves that fix Rule 2 violations
- DDD (Domain-Driven Design, Lab 00h) adds domain-specific rules on top of these four

**Watch for:** Rule 4 is frequently misread as "always write less code." It is not. It says the fewest structures needed to satisfy rules 1–3. If rules 1–3 require two classes, you must have two classes. Rule 4 only removes what is surplus to satisfying the earlier rules.

---

## Step 2 — Simple Design Audit of `tooldb/sfm.py`

Apply all four rules in order to the current code:

```python
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
```

**Rule 1 — Does the code pass all tests?**

```powershell
pytest tests/
```

All tests pass. Rule 1: satisfied. ✓

**Rule 2 — Does the code contain any duplication?**

There is exactly one function and one constant. The formula appears once. If a second function used the same formula and duplicated it, Rule 2 would be violated. Right now, there is nothing to deduplicate. Rule 2: satisfied. ✓

**Rule 3 — Does the code express its intent clearly?**

- `import math` — clear: loads the math module
- `INCHES_PER_FOOT = 12` — clear: the value is named for what it represents
- `def calculate_sfm(diameter_inches, rpm)` — clear: the function name states exactly what it computes; the parameter names state exactly what the inputs are
- `return math.pi * diameter_inches * rpm / INCHES_PER_FOOT` — clear: the formula reads as the domain rule

Rule 3: satisfied. ✓

**Rule 4 — Does the code have the fewest possible structures that satisfy rules 1–3?**

One module, one constant, one function. Can it be fewer?

- Remove the constant? You would have `/ 12` — Rule 3 is violated (the `12` becomes a magic number).
- Remove the function? You would have to duplicate the formula in every test and every caller — Rule 2 is violated.
- Combine `import math` and the function into something smaller? No — `import math` is required syntax to access `math.pi`.

Nothing can be removed without violating an earlier rule. Rule 4: satisfied. ✓

**The audit result:** `tooldb/sfm.py` passes all four rules. The design is as simple as it can be.

### SAVE AND TRY

```powershell
pytest tests/
```

Still passing. The audit changed nothing.

**Change something:** Add an empty class to `tooldb/sfm.py`:

```python
class SFMCalculator:    # ← add this (temporarily)
    pass
```

Run `pytest tests/`. Still passes. But Rule 4 is now violated: `SFMCalculator` is a class that serves no purpose in satisfying rules 1–3. No test requires it, it expresses no intent that the function did not already express, and it deduplicates nothing. Rule 4 says remove it. Remove it.

---

## The YAGNI Checklist

Before writing any new code in this project, ask these two questions:

```
1. Is there a failing test that demands this code?
   If no → do not write it yet.

2. Does this code satisfy Kent Beck's four rules in order?
   Rule 1: Does it make a failing test pass?
   Rule 2: Does it reduce duplication that existed before?
   Rule 3: Does it make the code's intent clearer?
   Rule 4: Is it the minimum structure needed for rules 1–3?
   If any rule is violated → fix it before moving on.
```

Add this to `notes.md` in your project root. It is the operating procedure for every lesson from here.

---

## The YAGNI vs. Planning Tension

The lesson plan has 70+ lessons. You already know that Block 8 will need a `ToolRepositoryPort`, that Block 9 will need Pydantic validation, that Block 11 will need a FastAPI router. Does YAGNI mean you should ignore all of that?

No. There is a distinction that matters:

**Planning broadly vs. building narrowly.**

The lesson plan is a map. It shows roughly where you are going. Maps do not build the road — they show you where the road will eventually be. When you are building Lesson 7 code, you are building Lesson 7. The fact that Lesson 32 will eventually need a different structure is not a reason to build Lesson 32 structure now.

**The specific cost of premature building:**

When you build something before the requirement is understood, you build it based on a guess about what will be needed. When the real requirement arrives (later, with more context), you discover the guess was subtly wrong. Now you have code that almost does what you need — not code you can delete (it has callers), not code you can use directly (it has the wrong shape). You refactor it anyway. But now the refactor is harder because it involves real code instead of a blank slate.

YAGNI does not say "never plan." It says "build when you understand, not when you anticipate."

**Where this applies in the tool database:**

| Anticipated future need | YAGNI says |
|---|---|
| Mastercam import (Block 5) | Do not build import code during Block 1 lessons |
| Assembly junction table (Block 2) | Do not create junction tables before the test that requires them |
| REST API routes (Block 11) | Do not write Flask routes before Block 11 |
| Abstract base class for Tool (Block 3) | Do not create the base class before the test that requires polymorphism |

The line is: when a test in the current lesson fails because a piece of infrastructure is missing, then and only then build that infrastructure.

---

## 🎯 Challenge: The Tempting Addition

**You know:** YAGNI and Simple Design Rule 4.

**Task:** Read the function below. It was written by a programmer who violated YAGNI three times. Identify each violation: what was added before a test demanded it, and what Simple Design rule each violation breaks.

```python
import math
import logging   # added "for debugging"

log = logging.getLogger(__name__)   # standard logging setup

INCHES_PER_FOOT = 12
DEFAULT_MATERIAL_FACTOR = 1.0   # "for future material correction"

def calculate_sfm(diameter_inches, rpm, material_factor=DEFAULT_MATERIAL_FACTOR, unit="imperial"):
    """
    Calculate surface feet per minute.
    
    Args:
        diameter_inches: Tool diameter in inches (or mm if unit='metric')
        rpm: Spindle speed in revolutions per minute
        material_factor: Correction factor for material hardness (default 1.0, no effect)
        unit: 'imperial' (default) or 'metric' — metric support planned for v2
    
    Returns:
        float: Surface speed in surface feet per minute
    """
    log.debug(f"Calculating SFM: d={diameter_inches}, rpm={rpm}, factor={material_factor}")

    if unit == "imperial":
        effective_diameter = diameter_inches
    elif unit == "metric":
        effective_diameter = diameter_inches / 25.4  # convert mm to inches
    else:
        raise ValueError(f"Unknown unit system: {unit!r}")

    result = math.pi * effective_diameter * rpm * material_factor / INCHES_PER_FOOT
    log.debug(f"Result: {result}")
    return result
```

All existing tests still pass with this version. Is that enough? What does each extra piece cost?

**Hints:**

1. Count the parameters. How many are tested? How many have default values that mean "pretend this parameter was not added"?
2. Look at the branches. How many paths through the function are exercised by any existing test?
3. Read the docstring. Does it describe present behavior or future plans?

---

<details>
<summary>▶ Show Solution</summary>

**YAGNI violation 1: `import logging` and `log = logging.getLogger(__name__)`**

No test requires logging output. No test checks that a debug message was emitted. The logger adds two lines of overhead and a dependency on the logging module for no current benefit.

- **Simple Design Rule 4:** adds two structures (`logging` import, `log` variable) that no rule 1–3 requirement justifies.
- **Cost:** every reader must understand what the logger does; it will emit messages in test output if logging is enabled; the test suite cannot easily assert what was logged.

**YAGNI violation 2: `material_factor=DEFAULT_MATERIAL_FACTOR` parameter**

No test passes a `material_factor`. The parameter defaults to `1.0`, which multiplies by 1 — mathematically invisible. The only thing it does is make the function signature larger and add a branch in the reader's mental model ("what happens when material_factor is not 1?").

- **Simple Design Rule 4:** adds a parameter and a constant that satisfy no rule 1–3 requirement.
- **Cost:** when the real material correction feature is built, you will discover `material_factor` was the wrong abstraction (the real correction uses a lookup table, not a multiplicative scalar). You will refactor code that should not exist yet.

**YAGNI violation 3: `unit="imperial"` parameter and the `if/elif/else` branch**

No test calls `calculate_sfm(diameter_mm, rpm, unit="metric")`. The metric branch is untested, making its correctness unknown. The `else: raise ValueError` branch is also untested — the error message format, the exception type, all of it is guesswork.

- **Simple Design Rule 2:** the `if unit == "imperial"` branch duplicates logic: `effective_diameter = diameter_inches` could be replaced with no branch at all.
- **Simple Design Rule 4:** adds a parameter, a constant, and a three-branch conditional that no existing test requires.
- **Cost:** when metric support is actually needed, you will learn that "metric SFM" is not a standard term — machinists use surface meters per minute (SMM) in metric, which is a completely different calculation. The existing branch will be replaced entirely.

**The docstring**

The docstring says "metric support planned for v2." Plans do not belong in docstrings — they belong in the issue tracker, the lesson plan, or the commit message. Code documentation describes present behavior. Future plans in a docstring become false documentation the moment the plan changes.

**Key insight:** Every YAGNI violation here passes all existing tests. Simple Design is not about making tests fail — it is about removing cost that tests do not prevent. The violations are invisible to `pytest`. They are only visible to the next programmer who reads the code (possibly you, three months from now, wondering why there is a `material_factor` parameter that does nothing and a `unit` parameter for a feature that was never finished).

The corrected version is exactly what you wrote in Lab 00c:

```python
import math

INCHES_PER_FOOT = 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
```

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All tests still pass | Run `pytest tests/` — all green, no new failures |
| `calculate_sfm` has no unused parameters | Open `tooldb/sfm.py` — exactly two parameters: `diameter_inches` and `rpm` |
| `calculate_sfm` has no branches | Open `tooldb/sfm.py` — one `return` statement, no `if` |
| YAGNI checklist added to `notes.md` | Open `notes.md` — the two-question checklist is there |
| You can state Simple Design Rule 4 | Close this lesson — say Rule 4 out loud without reading it |

---

## Quick Check Answers

**1. Should you add metric unit support now? What would YAGNI say?**

YAGNI says: do not add it. No test currently fails because metric support is missing. When you add code without a failing test demanding it, you are building based on anticipation rather than requirement. Metric support in machining turns out to be non-trivial — the calculation is not just a unit conversion but a different standard (surface meters per minute, not SFM). When the requirement arrives, you will have a specific test that defines exactly what is needed. The code you write then will be better than the code you write now.

**2. Can code pass all tests and still be unclear?**

Yes. The original Green step in Lab 00c had `def calculate_sfm(d, rpm)` — it passed all tests, but `d` was an unclear name. Rule 1 and Rule 2 of Simple Design are necessary but not sufficient. Rule 3 specifically requires that the code expresses intent clearly. A function that passes tests but uses names like `x`, `temp`, or `data` satisfies Rule 1 but violates Rule 3. The refactor step exists to bring the code into compliance with Rule 3.

**3. Knowing the 70-lesson plan — does that mean you should build for later lessons now?**

No. The lesson plan is a map — it shows where you are going, not instructions to build the destination before you arrive. YAGNI distinguishes between planning broadly (knowing the road ahead) and building narrowly (building only what today's test requires). The plan is not a to-do list for today. It is the context that makes today's small step meaningful.
