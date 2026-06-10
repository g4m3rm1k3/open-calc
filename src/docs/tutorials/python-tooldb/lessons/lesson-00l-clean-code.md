# Python Tool Database — LAB 00l — Clean Code: Rules for Code That Reads Like Prose

**Prerequisites:** Labs 00–00k. All tests are passing. You have a working project with several files in `tooldb/`.

**What this lab adds:**
- Seven clean code rules you will apply in every Refactor step from here on
- `black` installed — the Python auto-formatter that enforces consistent style
- One applied clean code pass over `tooldb/sfm.py`
- The Boy Scout Rule as a permanent habit

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A comment says `# increment counter` above the line `count += 1`. Is this comment useful?
> 2. A variable is named `d`. A parameter is named `temp`. A function is named `process`. What do all three names have in common?
> 3. You are cleaning up a file and notice old code that is commented out (surrounded by `# `). Should you delete it, keep it, or uncomment it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces:

1. `black` installed and run — every file is now auto-formatted consistently
2. A clean code pass on `tooldb/sfm.py` applying all seven rules
3. A clean code rules section in `notes.md` for reference during the Refactor step of every future cycle

---

## Why Clean Code Matters

Robert Martin (author of "Clean Code") opens with this:

> "The ratio of time spent reading code versus writing code is well over 10 to 1. We are constantly reading old code as part of the effort to write new code. Because this ratio is so high, we want the reading of code to be easy, even if it makes the writing harder."

You spend more time reading code than writing it. Including your own code from three weeks ago. Clean code reduces the cost of that reading.

Clean code is not about aesthetics. It is not about personal style. It is about communication: the code communicates to the next person who reads it (which is often you). Every choice of name, comment, and structure is a choice about what to communicate and how efficiently.

---

## Rule 1 — Names Reveal Intent

### Concept: Naming Rules

**What it is:** A set of conventions for naming variables, functions, and classes so that the name tells you what the thing IS, not what it does in one specific context.

**The problem:**

```python
def calc(d, r):          # what is "d"? what is "r"? what does "calc" calculate?
    t = 3.14 * d * r
    return t / 12        # what is 12?
```

A reader must guess. `d` might be diameter or distance or delta. `r` might be radius or RPM or rate. `t` is temporary — it says nothing. `12` is a magic number.

**The solution:**

```python
def calculate_sfm(diameter_inches, rpm):
    circumference_inches = math.pi * diameter_inches
    return circumference_inches * rpm / INCHES_PER_FOOT
```

Names that reveal intent:

- **Functions: use verbs.** `calculate_sfm`, `validate_tool`, `find_by_material`, `list_tools`
- **Classes: use nouns.** `Tool`, `ToolValidator`, `FakeToolRepository`, `ImportReport`
- **Booleans: use `is_` or `has_` prefix.** `is_valid`, `has_errors`, `is_carbide`, `has_stickout`
- **Collections: use plurals.** `all_tools`, `matching_jobs`, `validation_errors`
- **Single values: use singular.** `selected_tool`, `current_job`, `diameter_inches`

**What it hides:** The mental translation step. With poor names, every read requires translating the code into meaning. With good names, the code IS the meaning.

**You will see this again in:**
- Every code review — naming is the most common feedback category
- The Boy Scout Rule — rename as you go
- The refactoring log — Rename is the most common move

**Watch for:** Abbreviations erode over time. `sfm` is fine — it is a domain term. `calc`, `tmp`, `mgr`, `util`, `helper` are not — they say nothing about the specific calculation, temporary value, or utility.

---

## Rule 2 — Functions Do One Thing

**What it is:** A function should do exactly one thing at the level of abstraction described by its name.

**The test:** If you need the word "and" to describe what a function does, it does two things:

```python
# Two things:
def validate_and_save_tool(name, diameter):
    # validates tool name
    # saves to repository
    # TWO reasons to change: validation rules change, storage changes

# One thing each:
def validate_tool(name, diameter):
    ...

def save_tool(tool):
    ...
```

**The abstraction level test:** All lines in a function should be at the same level of abstraction. A function named `create_tool` that orchestrates calls to `validate_tool` and `repository.save` is at the "orchestration" level. If it also contains `cursor.execute("INSERT INTO ...")` — that SQL line is at the "storage implementation" level, and it does not belong here.

**You will see this again in:**
- Single Responsibility Principle (same idea at class level)
- Extract Function refactoring move — the cure when a function does two things

---

## Rule 3 — Function Length

**What it is:** A function should be short enough to understand without scrolling.

**Not a line-count rule.** There is no magic number (not 10 lines, not 20). The rule is: can you read the function from top to bottom and hold its full meaning in short-term memory? If scrolling is required to remember what the top of the function said, the function is too long.

**The practical consequence:** Extract any logic that would be described by a comment. Comments are a hint that Extract Function is overdue:

```python
# Before:
def create_tool(name, diameter_inches):
    # validate the name
    if not name or len(name) < 3:
        raise ValueError("...")
    if not name[0:2].isupper():
        raise ValueError("...")

    # validate the diameter
    if diameter_inches <= 0:
        raise ValueError("...")

    # create and save
    tool = Tool(name=name, diameter_inches=diameter_inches)
    repository.save(tool)
    return tool

# After: the comments become function names
def create_tool(name, diameter_inches):
    _validate_tool_name(name)          # the comment became the function name
    _validate_diameter(diameter_inches)
    tool = Tool(name=name, diameter_inches=diameter_inches)
    repository.save(tool)
    return tool
```

The "after" version reads like a summary of steps. The detail is in the extracted functions. Each can be understood independently.

---

## Rule 4 — Comments Explain WHY, Not WHAT

**What it is:** Comments explain non-obvious reasons — hidden constraints, workarounds for specific bugs, business rules that have no other documentation. They do not describe what the code does.

**The problem:**

```python
count += 1   # increment counter
```

"Increment counter" describes what `count += 1` does. The code already says this. The comment adds nothing — it is noise.

**The correct use of comments:**

```python
INCHES_PER_FOOT = 12   # 12 inches in one foot — unit conversion for the SFM formula

result = math.pi * diameter_inches * rpm / INCHES_PER_FOOT
# Note: math.pi is used instead of 3.14159 for full float precision (~15 significant digits)
# The difference matters for very small tool diameters (below 0.1") at high RPM.
```

The second comment explains WHY a specific choice was made — the precision requirement. A future reader might be tempted to simplify to `3.14159`, and the comment explains why that would be wrong.

**The DELETE THE COMMENT test:** Read the comment. Now delete it. If the code is equally clear without it, the comment was noise. If the code is now less clear, the comment was explaining WHY — keep it.

---

## Rule 5 — Dead Code is Deleted

**What it is:** Code that is never called, variables that are assigned but never read, and commented-out code should be deleted.

**The problem with keeping dead code:**

```python
# Old implementation — kept "just in case"
# def old_calculate_sfm(d, r):
#     return 3.14 * d * r / 12

def calculate_sfm(diameter_inches, rpm):
    return math.pi * diameter_inches * rpm / INCHES_PER_FOOT
```

The commented-out code creates questions: Was it wrong? Why was it replaced? Should I use the old version in some cases? Is this a TODO to merge them?

The answer to all of these questions: git knows. `git log -p tooldb/sfm.py` shows the full history of every change. The old implementation is in the history, not in the working code. Delete it from the file.

**You will see this again in:**
- Every code review: "why is this commented out?" is always asked
- The Boy Scout Rule: delete one piece of dead code every time you touch a file

**Watch for:** `# TODO:` comments are not dead code — they are planned work. Keep them, but put a ticket number or a date so they do not accumulate forever.

---

## Rule 6 — The Boy Scout Rule

**What it is:** Leave the code cleaner than you found it. Every time you open a file, make one small improvement: rename one variable, extract one function, delete one dead comment.

**Why it works:** Incremental cleanup accumulates. If every developer who touches a file improves one small thing, the codebase slowly becomes cleaner without any dedicated "cleanup sprint." The alternative is the reverse: every developer who touches a file leaves a small mess, and the codebase slowly degrades.

**The practical form:**

Before committing any change:
1. Did you improve one name you noticed was poor?
2. Did you delete one comment that described what (not why)?
3. Did you delete one commented-out block?

If you answered no to all three: look again. There is almost always one small improvement available.

**Project application:** Every Refactor step in this project is the Boy Scout Rule formalized. The TDD cycle builds the habit: write a test (Red), make it pass (Green), clean it up (Refactor). The Refactor step IS the Boy Scout Rule.

---

## Rule 7 — Consistency: PEP 8 and `black`

**What it is:** PEP 8 is Python's official style guide — spacing, naming conventions, line length, import ordering. `black` is a formatter that enforces it automatically.

**Why consistency matters:**

A codebase that looks like it was written by one person is easier to read than one that has five different indentation styles, five different naming conventions, and five different approaches to whitespace. Reading style shifts forces a context switch that slows comprehension.

**PEP 8 key rules:**

```python
# Constants: ALL_CAPS_WITH_UNDERSCORES
INCHES_PER_FOOT = 12

# Functions and variables: snake_case
def calculate_sfm(diameter_inches, rpm):
    tool_circumference = math.pi * diameter_inches
    return tool_circumference * rpm / INCHES_PER_FOOT

# Classes: PascalCase (also called UpperCamelCase)
class ToolValidator:
    pass

# Private helpers (used only inside this module): single leading underscore
def _validate_name_format(name):
    pass
```

**`black` — the auto-formatter:**

`black` reformats Python code to a consistent style automatically. You stop arguing about formatting in code review. You stop making decisions about whitespace. `black` decides, and everyone uses `black`.

Install it:

```powershell
pip install black
```

Run it on the whole project:

```powershell
black tooldb/ tests/
```

`black` will reformat any file whose style does not match its standard and report what it changed.

### SAVE AND TRY

```powershell
pip install black
black tooldb/ tests/
pytest tests/
```

**You should see:**

```
reformatted tooldb/sfm.py
reformatted ...
All done! ✨ 🍰 ✨
4 files reformatted, 3 files left unchanged.
```

Then pytest should still show all tests passing.

**What changed:** `black` enforces consistent spacing, consistent quote style (`"` vs `'`), consistent comma placement, and consistent line length. The code is functionally identical; the formatting is standardized.

**Change something:** In `tooldb/sfm.py`, deliberately mis-indent one line (add an extra space before `return`). Run `black tooldb/sfm.py`. It fixes the indentation. Run `pytest tests/`. Still passing.

---

## Step 1 — Apply Clean Code Rules to `tooldb/sfm.py`

Open `tooldb/sfm.py`. It currently looks like:

```python
import math

INCHES_PER_FOOT = 12

def tool_circumference_inches(diameter_inches):
    return math.pi * diameter_inches

def calculate_sfm(diameter_inches, rpm):
    circumference = tool_circumference_inches(diameter_inches)
    return circumference * rpm / INCHES_PER_FOOT

def calculate_rpm(target_sfm, diameter_inches):
    circumference = tool_circumference_inches(diameter_inches)
    return (target_sfm * INCHES_PER_FOOT) / circumference
```

Apply each rule:

**Rule 1 — Names reveal intent:**
- `INCHES_PER_FOOT` — clear ✓
- `tool_circumference_inches` — clear, but does `_inches` need to be in the function name? The returned value is always inches; the parameter name `diameter_inches` already says the unit. This is a judgment call — keep `_inches` for now, it removes ambiguity. ✓
- `target_sfm` — clear (it is the desired SFM, not the result SFM) ✓

**Rule 2 — Functions do one thing:**
- `calculate_sfm` delegates to `tool_circumference_inches`, then computes. Two steps, but both at the "SFM calculation" level. ✓
- `calculate_rpm` same. ✓
- `tool_circumference_inches` does exactly one thing: `π × d`. ✓

**Rule 3 — Function length:**
- All functions are 1–2 lines. ✓

**Rule 4 — Comments explain WHY:**
- No comments at all. Is anything confusing enough to need a comment?
- The `INCHES_PER_FOOT = 12` constant could benefit from a WHY comment: why 12 specifically?

Add one comment:

```python
INCHES_PER_FOOT = 12   # 12 inches per foot — converts inch-based circumference to feet per minute
```

**Rule 5 — No dead code:**
- No commented-out code. ✓

**Rule 6 — Boy Scout Rule:**
- Nothing to improve beyond the comment just added. ✓

**Rule 7 — Consistency (`black`):**
- Already formatted by `black`. ✓

### SAVE AND TRY

```powershell
pytest tests/
```

**You should see:** All tests passing after the comment was added. Comments do not affect behavior.

**In the terminal:** Run `black tooldb/sfm.py`. It should report `1 file left unchanged` — the file is already clean.

---

## The Clean Code Reference Card

Add to `notes.md`:

```
## Clean Code — Seven Rules

1. NAMES REVEAL INTENT
   Functions: verbs (calculate_sfm, validate_tool)
   Classes: nouns (Tool, ToolValidator)
   Booleans: is_ / has_ prefix (is_valid, has_errors)
   Collections: plural (all_tools, validation_errors)

2. FUNCTIONS DO ONE THING
   Test: does the description need the word "and"? Split it.
   All lines at the same level of abstraction.

3. FUNCTION LENGTH
   Fits on one screen without scrolling.
   Comments that describe a block → Extract Function using that comment as the name.

4. COMMENTS EXPLAIN WHY, NOT WHAT
   Delete comments that describe what the code does (the code says that).
   Keep comments that explain non-obvious constraints and workarounds.

5. DEAD CODE IS DELETED
   Commented-out code → git history has it; delete it from the file.
   Unused imports, variables, parameters → delete them.

6. BOY SCOUT RULE
   Leave every file slightly cleaner than you found it.
   One rename, one extraction, one dead comment deleted — every time.

7. CONSISTENCY: PEP 8 + black
   Run: black tooldb/ tests/
   Never argue about formatting — black decides.
```

---

## 🎯 Challenge: Apply the Rules

**You know:** All seven clean code rules.

**Task:** The following function violates at least four of the seven rules. Apply all four rules to produce a clean version. Write the test first (it should pass with both the messy and clean versions — behavior must not change).

```python
import sqlite3

def do_stuff(n, d, m, mat):
    # connect to db
    conn = sqlite3.connect("cadcam.db")
    c = conn.cursor()
    
    # check name
    if not n:
        return False
    if len(n) < 3:
        return False
    
    # check diameter  
    if d <= 0:
        return False
    
    # INSERT into tools table
    c.execute("INSERT INTO tools VALUES (?, ?, ?, ?)", (n, d, m, mat))
    conn.commit()
    conn.close()
    
    # Old version - kept for reference
    # c.execute("INSERT INTO tool (name, diameter) VALUES (?, ?)", (n, d))
    
    return True
```

---

<details>
<summary>▶ Show Solution</summary>

**Violations found:**

1. **Rule 1 (naming):** `n`, `d`, `m`, `mat` are meaningless abbreviations; `do_stuff` says nothing about what is done
2. **Rule 2 (one thing):** validates AND creates database connection AND inserts — three responsibilities
3. **Rule 4 (WHY not WHAT):** `# connect to db`, `# check name`, `# check diameter`, `# INSERT into tools table` all describe WHAT; `# Old version - kept for reference` is dead code
4. **Rule 5 (dead code):** the commented-out INSERT is dead code

**Clean version** (splitting into three single-responsibility functions and the service calling them):

```python
# tooldb/validation.py — validation only
def is_valid_tool_name(name: str) -> bool:
    return bool(name) and len(name) >= 3

def is_valid_diameter(diameter_inches: float) -> bool:
    return diameter_inches > 0
```

```python
# tooldb/service.py — orchestration only (through port, not raw SQL)
def create_tool(self, name: str, diameter_inches: float, material: str, tool_type: str) -> Tool:
    if not is_valid_tool_name(name):
        raise ValueError(f"Tool name must be at least 3 characters: {name!r}")
    if not is_valid_diameter(diameter_inches):
        raise ValueError(f"Diameter must be positive: {diameter_inches}")

    tool = Tool(name=name, diameter_inches=diameter_inches)
    self.repository.save(tool)
    return tool
```

**Test:**

```python
def test_clean_version_rejects_empty_name():
    service = ToolService(FakeToolRepository(), ToolValidator())
    with pytest.raises(ValueError):
        service.create_tool(name="", diameter_inches=0.5, material="carbide", tool_type="endmill")
```

**Key insight:** The original `do_stuff` violates Hexagonal Architecture too — it imports `sqlite3` directly instead of using a port. Fixing clean code violations often reveals architectural violations at the same time. The two sets of rules reinforce each other: clean code makes architecture violations visible, and architectural discipline keeps code from becoming messy.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `black` is installed | Run `black --version` — version number appears |
| All files are formatted | Run `black --check tooldb/ tests/` — "would reformat" appears for no file |
| All tests pass | Run `pytest tests/` — all green |
| `INCHES_PER_FOOT` has a WHY comment | Open `tooldb/sfm.py` — comment explains the unit conversion |
| Clean code reference card in `notes.md` | Open `notes.md` — seven rules present |
| No commented-out code in `tooldb/` | Open each file — no `# old_variable = ...` or commented blocks |

---

## Quick Check Answers

**1. Is `# increment counter` above `count += 1` useful?**

No. It describes what the code does — which the code already says. `count += 1` is unambiguous; the comment repeats it in English. Useful comments explain WHY: "Why is this counter being incremented here? What invariant does it maintain? What business rule requires it?" If none of those have a non-obvious answer, no comment is needed.

**2. What do `d`, `temp`, and `process` have in common?**

All three hide intent behind ambiguity. `d` could be diameter, distance, delta, or depth. `temp` could be temperature, temporary variable, or something else — the word "temporary" is meaningless as a name. `process` could process anything; the name says nothing about what is processed or how. All three require the reader to look at the surrounding code to understand what the name means. Names that reveal intent make that lookup unnecessary.

**3. Should commented-out code be deleted, kept, or uncommented?**

Deleted. Version control (git) stores the full history of every file. `git log -p tooldb/sfm.py` shows every version, every deletion, every change. If old code needs to be referenced, it is in the git history — always, completely, with timestamps and author information. Keeping it in the file forces every reader to ask "is this still relevant? should I use this? why was it commented out?" Those questions cannot be answered from the file alone. Delete the code; keep it in history.
