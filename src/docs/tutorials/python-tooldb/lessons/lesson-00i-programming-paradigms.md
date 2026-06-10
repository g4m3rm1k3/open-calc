# Python Tool Database — LAB 00i — Programming Paradigms: Imperative, Declarative, Functional

**Prerequisites:** Labs 00–00h. All tests are passing.

**What this lab adds:**
- The three programming paradigms you will use throughout this project, by name and by recognition
- How to read a piece of code and identify which paradigm it is using
- When to choose each paradigm for a given problem
- A test comparing two implementations of the same filter — one imperative, one declarative

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. SQL says `SELECT * FROM tools WHERE diameter < 0.5`. Does SQL describe HOW to search the table (which rows to check, in what order) or WHAT result you want?
> 2. A Python `for` loop that builds a filtered list tells the computer each step: "check this item, if it matches, add it, move to the next item." Does that describe HOW or WHAT?
> 3. Can a single codebase use more than one paradigm? Or must it pick one?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have:

1. A test (`tests/test_filters.py`) that verifies two filter functions produce identical results: one written imperatively, one written declaratively
2. A **reference card** in `notes.md` showing all three paradigms with examples from this project

---

## Concept: Programming Paradigm

**What it is:** A style of writing instructions to a computer. A paradigm is not a feature of a language — it is a way of thinking about problems and expressing solutions. Most languages support multiple paradigms.

**Why it matters:** Different problems have natural fits with different paradigms. SQL queries are naturally declarative. File processing loops are naturally imperative. Data transformation pipelines are naturally functional. Recognizing which paradigm fits reduces unnecessary complexity.

---

## Paradigm 1 — Imperative

### Concept: Imperative Programming

**What it is:** Telling the computer exactly HOW to achieve a result, step by step. The code describes a procedure: do this, then do this, then check this, then do this.

**The problem before:**

Imperative code for simple operations is verbose. A filter written imperatively:

```python
def find_small_tools_imperative(all_tools, max_diameter_inches):
    result = []                             # step 1: create an empty list
    for tool in all_tools:                  # step 2: go through every tool
        if tool.diameter_inches < max_diameter_inches:  # step 3: check each one
            result.append(tool)             # step 4: add matching tools
    return result                           # step 5: return the list
```

Five steps to say "give me the tools where diameter < max." The reader must mentally execute all five steps to understand the intent.

**What it is good at:**
- Algorithms where the step-by-step process matters (sorting, parsing, file processing)
- Precise control over order and flow
- Cases where performance depends on the exact sequence of operations

**Canonical example (General):**

A recipe: "Add flour. Stir until smooth. Add eggs one at a time. Beat for 3 minutes." This is imperative — every step is explicit, and order matters.

**Project application:**

The Mastercam file parser (Block 7) will be imperative: read the SQLite file, iterate rows, extract fields, apply transformations. The order of operations matters, and the code needs explicit control at each step.

**You will see this again in:**
- Every `for` loop in this project
- Migration scripts (Block 3)
- File parsing (Block 7)
- The database backup routine (Block 10)

**Watch for:** Imperative code becomes hard to read when it grows long. A function with 30 imperative steps is 30 things to hold in mind at once. When imperative code grows beyond one screen, it usually needs to be broken into smaller named functions (refactoring: Extract Function).

---

## Paradigm 2 — Declarative

### Concept: Declarative Programming

**What it is:** Telling the computer WHAT result you want, without specifying how to achieve it. The implementation details are handled by the language or framework.

**The same filter, written declaratively:**

```python
def find_small_tools_declarative(all_tools, max_diameter_inches):
    return [tool for tool in all_tools if tool.diameter_inches < max_diameter_inches]
```

One line. The **list comprehension** (`[... for ... if ...]`) is Python's declarative syntax for filtering: "give me a list of tools where the diameter is less than max." You declare the result; Python decides how to compute it.

**What a list comprehension is:** A Python shorthand for "build a list by applying an expression to each item in a sequence, optionally filtering items." The form is always:

```python
[expression for item in sequence if condition]
    ^         ^           ^               ^
    what      each        where          filter
    to put    item is     to get items   (optional)
    in list   called      from
```

**What it is good at:**
- Data retrieval (SQL is the purest declarative language)
- Schemas and validation rules (Pydantic models declare what valid data looks like)
- Filtering and transformation of collections (list comprehensions)
- Configuration (JSON, YAML — you declare the config, the framework acts on it)

**Canonical example (General):**

SQL: `SELECT name FROM tools WHERE diameter < 0.5 ORDER BY name`. This declares the desired result — the names of small tools, sorted. The database decides which algorithm to use (index scan, full scan, hash join). The programmer does not specify how.

**Project application:**

SQL queries (Block 2), Pydantic validation schemas (Block 9), SQLAlchemy model definitions (Block 8), and pytest assertions (`assert result == expected`) are all declarative. You declare what you want; the framework implements it.

**You will see this again in:**
- Every SQL query in this project
- Pydantic's `BaseModel` field declarations
- SQLAlchemy's `mapped_column()` declarations
- HTML/CSS is declarative — you declare structure and appearance, the browser renders it
- React JSX is declarative — you declare what the UI should look like, React handles the DOM

**Watch for:** List comprehensions can become unreadable when nested deeply:

```python
# Hard to read:
result = [tool.name for job in all_jobs for op in job.operations for tool in op.assemblies if tool.material == "carbide"]
```

When a comprehension wraps more than one line, consider switching to an imperative loop — clarity beats brevity.

---

## Paradigm 3 — Functional

### Concept: Functional Programming

**What it is:** Treating computation as the transformation of values through **pure functions** — functions that have no side effects and always return the same output for the same input.

**Pure function:** A function that:
1. Always returns the same output for the same input
2. Has no side effects (does not modify any external state, write to a file, print, change a variable outside itself)

```python
# Pure function:
def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
    # same inputs → always same output; no side effects

# NOT a pure function:
tool_count = 0

def count_and_create_tool(name, diameter_inches):
    global tool_count
    tool_count += 1          # ← side effect: modifying external state
    return Tool(name=name, diameter_inches=diameter_inches)
```

**What it is good at:**
- Data transformation pipelines (map raw data to clean objects)
- Highly testable code (pure functions have no external dependencies)
- Parallel computation (no shared state = no race conditions)
- Mathematical and scientific calculations

**Python's functional tools:**

```python
# map(): apply a function to every item in a sequence
raw_names = ["em-0500", "DR-0250", "fm-0375"]
normalized = list(map(str.upper, raw_names))   # → ["EM-0500", "DR-0250", "FM-0375"]

# filter(): keep only items that match a condition
all_tools = [Tool("EM-0500", 0.5), Tool("DR-0250", 0.25), Tool("EM-0750", 0.75)]
small_tools = list(filter(lambda t: t.diameter_inches < 0.5, all_tools))

# sorted(): return a new sorted list (does not modify the original)
by_diameter = sorted(all_tools, key=lambda t: t.diameter_inches)
```

**Canonical example (General):**

An assembly line where each station transforms the item without keeping any memory of previous items. The transformation at each station is pure — same input, same output, no side effects. The pipeline is the composition of pure stages.

**Project application:**

The Mastercam import pipeline (Block 7) will be functional: a sequence of pure transformations that take raw database rows and produce clean `Tool` objects. Each transformation is a pure function, making each stage independently testable.

Also: `calculate_sfm`, `calculate_rpm`, `tool_circumference_inches` are pure functions. They already demonstrate the functional paradigm.

**You will see this again in:**
- Block 7 (import pipeline): `raw_rows → parsed_rows → validated_rows → Tool objects`
- List comprehensions are functional (they transform a sequence without mutation)
- Python generators (Block 5)
- Any data transformation in the project where the output depends only on the input

**Watch for:** Python is not a purely functional language — it allows mutation and side effects freely. Functional style in Python is a discipline you choose for appropriate situations, not a constraint the language enforces.

---

## Step 1 — Imperative and Declarative Side by Side

Create `tooldb/filters.py` with both filter implementations:

```python
from tooldb.tool import Tool

def find_tools_smaller_than_imperative(all_tools: list, max_diameter_inches: float) -> list:
    result = []                                    # empty list to accumulate matches
    for tool in all_tools:                         # iterate every tool
        if tool.diameter_inches < max_diameter_inches:  # check the condition
            result.append(tool)                    # add to result if match
    return result


def find_tools_smaller_than_declarative(all_tools: list, max_diameter_inches: float) -> list:
    return [                                       # list comprehension: build and return in one expression
        tool                                       # what to put in the list
        for tool in all_tools                      # source of items
        if tool.diameter_inches < max_diameter_inches  # filter condition
    ]
```

### SAVE AND TRY

Write a test that confirms both functions produce the same result. Create `tests/test_filters.py`:

```python
from tooldb.tool import Tool
from tooldb.filters import find_tools_smaller_than_imperative, find_tools_smaller_than_declarative

SAMPLE_TOOLS = [
    Tool(name="EM-0500", diameter_inches=0.5),    # 0.5" — matches threshold 0.75
    Tool(name="DR-0250", diameter_inches=0.25),   # 0.25" — matches
    Tool(name="EM-0750", diameter_inches=0.75),   # 0.75" — exactly at threshold, does NOT match (not <)
    Tool(name="FM-1000", diameter_inches=1.0),    # 1.0" — does not match
]

def test_both_filters_return_same_result():
    threshold = 0.75

    imperative_result = find_tools_smaller_than_imperative(SAMPLE_TOOLS, threshold)
    declarative_result = find_tools_smaller_than_declarative(SAMPLE_TOOLS, threshold)

    assert imperative_result == declarative_result   # same items, same order

def test_filter_excludes_tools_at_threshold():
    threshold = 0.75
    result = find_tools_smaller_than_declarative(SAMPLE_TOOLS, threshold)
    # 0.75" diameter is NOT less than 0.75" — it must not appear in results
    assert all(tool.diameter_inches < threshold for tool in result)

def test_filter_on_empty_list():
    result = find_tools_smaller_than_imperative([], max_diameter_inches=0.5)
    assert result == []   # edge case: empty input → empty output
```

Run:

```powershell
pytest tests/test_filters.py
```

**You should see:**

```
3 passed in 0.01s
```

**Change something:** Change `<` to `<=` in the declarative version only. Run pytest. The `test_both_filters_return_same_result` test now fails — the two functions return different results because the boundary condition differs. Change it back.

---

## Step 2 — Functional Pipeline: Map and Transform

The functional paradigm shines in import scenarios: transform a collection of one type into a collection of another type, without modifying anything.

Add to `tooldb/filters.py`:

```python
def tool_names_uppercase(all_tools: list) -> list:
    return list(map(lambda tool: tool.name.upper(), all_tools))
    # map() applies the lambda to every tool; list() converts the map object to a list
    # lambda tool: tool.name.upper() — an anonymous function: take tool, return its name uppercased
```

**What a lambda is:** A small, anonymous function defined inline. `lambda tool: tool.name.upper()` means "a function that takes `tool` and returns `tool.name.upper()`." It is equivalent to:

```python
def get_uppercase_name(tool):
    return tool.name.upper()
```

Lambdas are used when the function is short and only needed in one place.

Add a test to `tests/test_filters.py`:

```python
from tooldb.filters import tool_names_uppercase

def test_tool_names_are_uppercased():
    tools = [Tool("em-0500", 0.5), Tool("dr-0250", 0.25)]  # lowercase names
    result = tool_names_uppercase(tools)
    assert result == ["EM-0500", "DR-0250"]   # uppercased, order preserved
```

### SAVE AND TRY

```powershell
pytest tests/
```

All tests pass. The `tool_names_uppercase` function is purely functional: it takes a list of tools and returns a new list of strings, without modifying the original tools or any external state.

---

## The Three-Paradigm Reference Card

Add to `notes.md`:

```
## Programming Paradigms Reference Card

### Imperative — HOW
- Describes the procedure step by step
- Uses: for loops, while loops, if/else, explicit state mutation
- When to use: algorithms, file parsing, migration scripts, anything where order matters
- Example in this project: for loop in find_tools_smaller_than_imperative()

### Declarative — WHAT
- Describes the desired result; the framework handles the how
- Uses: SQL queries, list comprehensions, Pydantic models, pytest assertions
- When to use: data retrieval, schemas, validation rules, configuration
- Example in this project: list comprehension in find_tools_smaller_than_declarative()

### Functional — TRANSFORM
- Pure functions: same input → same output, no side effects
- Uses: map(), filter(), sorted(), chained transformations, lambda
- When to use: data pipelines, transformations, anywhere testability is critical
- Example in this project: calculate_sfm(), tool_names_uppercase()
```

---

## 🎯 Challenge: Classify and Rewrite

**You know:** All three paradigms and when each applies.

**Task:** The function below is written imperatively. Rewrite it both declaratively (as a list comprehension) and functionally (using `map()` or `filter()`). Write one test that proves all three implementations return the same result.

```python
def get_tool_names_longer_than_five_chars(all_tools):
    result = []
    for tool in all_tools:
        if len(tool.name) > 5:
            result.append(tool.name)
    return result
```

---

<details>
<summary>▶ Show Solution</summary>

**Declarative version (list comprehension):**

```python
def get_tool_names_longer_than_five_chars_declarative(all_tools):
    return [tool.name for tool in all_tools if len(tool.name) > 5]
```

**Functional version (filter + map):**

```python
def get_tool_names_longer_than_five_chars_functional(all_tools):
    long_name_tools = filter(lambda t: len(t.name) > 5, all_tools)  # keep tools with long names
    return list(map(lambda t: t.name, long_name_tools))             # extract just the names
```

**Test:**

```python
def test_all_three_implementations_agree():
    tools = [
        Tool("EM-0500", 0.5),    # 7 chars — included
        Tool("DR", 0.25),        # 2 chars — excluded
        Tool("FM-0375", 0.375),  # 7 chars — included
        Tool("X", 1.0),          # 1 char — excluded
    ]

    imp = get_tool_names_longer_than_five_chars(tools)
    dec = get_tool_names_longer_than_five_chars_declarative(tools)
    func = get_tool_names_longer_than_five_chars_functional(tools)

    assert imp == dec == func == ["EM-0500", "FM-0375"]
```

**Key insight:** All three produce the same result — the paradigm choice is about expressiveness and readability, not correctness. For a simple filter-and-extract, the declarative list comprehension is the most readable in Python. For a complex multi-step transformation, the functional pipeline (multiple `filter` and `map` calls) can be clearer than a deeply nested comprehension. The imperative version is always available as a fallback when both become unclear.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| All tests pass | Run `pytest tests/` — all green |
| `tooldb/filters.py` has both filter implementations | Open the file — imperative and declarative versions present |
| Test confirms both produce identical results | Open `tests/test_filters.py` — `test_both_filters_return_same_result` present and passing |
| Three-paradigm reference card in `notes.md` | Open `notes.md` — three sections: Imperative, Declarative, Functional |
| You can state when to use each paradigm | Name one use case for each from memory |

---

## Quick Check Answers

**1. Does SQL describe HOW or WHAT?**

WHAT. `SELECT * FROM tools WHERE diameter < 0.5` declares the desired result — tools with small diameters. SQL says nothing about how the database engine should find them (which index to use, how to scan, how to sort internally). The database query planner decides the "how." This is the core of declarative programming: specify the result, let the system handle the process.

**2. Does a `for` loop with an `if` describe HOW or WHAT?**

HOW. The loop explicitly says: "examine each item in this sequence, in this order; if this condition is true, perform this action." Every step is stated. The programmer is specifying the procedure, not the desired result. This is imperative programming — the programmer controls the mechanism.

**3. Can a codebase use more than one paradigm?**

Yes — and should. Good Python code uses all three paradigms in the right places. SQL queries (declarative) read data that a for-loop (imperative) processes, using pure transformation functions (functional) to convert the data. Paradigms are tools; the skill is knowing which tool fits which problem. Most Python code is primarily imperative with declarative SQL and functional utility functions woven in.
