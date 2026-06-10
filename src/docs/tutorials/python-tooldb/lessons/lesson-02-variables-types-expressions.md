# Python Tool Database — LAB 02 — Variables, Types, and Expressions

**Prerequisites:** Lab 01. You can run a Python script and use the REPL. The project has `tooldb/display.py` with `format_tool_line`, and `tests/test_main.py` passes.

**What this lab adds:**
- Python's five built-in types: `int`, `float`, `str`, `bool`, `None` — what each one is and when to use it
- Variable assignment: how Python binds names to values at runtime
- Arithmetic operators, including a subtle trap with integer vs float division
- f-strings for building formatted strings
- A new function `describe_tool(name, diameter_inches, flutes)` built through a full Red-Green-Refactor cycle

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If Python is "dynamically typed," what does that mean at runtime? Can the same variable name hold an `int` on one line and a `str` on the next?
> 2. The SFM formula uses `math.pi` (a `float`) divided by `12` (an `int`). What type does Python return from that division?
> 3. What happens when you try `"4" + 4` in Python? Predict the result before trying it.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have a `describe_tool` function that takes a tool's name, diameter, and number of flutes and returns a formatted summary string:

```
Tool: EM-0500  diameter: 0.500"  flutes: 4
```

Built entirely through Red-Green-Refactor. Every concept taught along the way appears directly in the code you are writing.

---

## Step 1 — Variables and Assignment

Open the REPL:

```powershell
python
```

Type each line and press Enter after each one:

```python
tool_name = "EM-0500"   # bind the name tool_name to the string "EM-0500"
print(tool_name)
```

**You should see:** `EM-0500`

Now try this:

```python
tool_name = 42          # rebind the same name to an integer
print(tool_name)
```

**You should see:** `42`

This is the first thing that surprises people coming from other languages. In Python, a variable name is just a label you stick on a value. The label can be moved to a different value at any time — including a value of a completely different type. Python does not restrict what type a name can hold.

---

### Concept: Variable Assignment

**What it is:** Binding a name to a value. The `=` sign does not mean "equals" — it means "from now on, the name on the left refers to the value on the right."

**The problem before:** Without named variables, you would have to repeat the same value everywhere:

```python
# Without variables:
print(3.14159 * 0.5 * 0.5)   # is this diameter or radius?
print(3.14159 * 1.0 * 1.0)   # magic numbers everywhere, no meaning
```

**The solution:** Give values names. Now the code reads like the intent:

```python
diameter_inches = 0.5
print(3.14159 * diameter_inches * diameter_inches)
```

**What it hides:** The memory address of the value. When you write `diameter_inches = 0.5`, Python allocates a `float` object, stores `0.5` in it, and records that the name `diameter_inches` points to that object. You never see the address. You just use the name.

The invariant the abstraction protects: you can always use the name instead of the raw value, and if the value needs to change (different tool diameter), you change it in one place, not everywhere it appears.

**Canonical example (General):**

A sticky note on a jar. The note says "Monday's lunch." What's in the jar can change — soup today, salad tomorrow. The note always finds it for you.

```python
INCHES_PER_FOOT = 12   # name stuck on the value 12
diameter_inches = 0.5  # name stuck on the value 0.5
```

**Project application:** Every meaningful number in this project gets a name. `INCHES_PER_FOOT = 12` instead of a bare `12` in the SFM formula. `diameter_inches = 0.5` instead of a bare `0.5` passed around.

**Smallest possible example:**

```python
x = 10    # bind name x to 10
y = x + 5 # bind name y to the result of x + 5
print(y)  # → 15
x = 99    # rebind x — y is NOT affected; it still holds 15
print(y)  # → 15 (y captured the value 15, not a reference to x)
```

**Why it matters here:** Every function parameter, every local variable, every constant in this project is a binding between a meaningful name and a value.

**You will see this again in:** Every programming language uses variables. The name-binding model is specific to Python — languages like C use memory slots instead. The distinction matters in interviews.

**Watch for:** `y = x + 5` evaluates `x + 5` right now and binds `y` to the result. Later changes to `x` do NOT affect `y`. Python variables do not create "live links" between names.

---

### SAVE AND TRY

In the REPL:

```python
sfm_target = 1000        # recommended SFM for carbide endmill
diameter_inches = 0.5    # tool diameter
INCHES_PER_FOOT = 12     # named constant

import math
result = sfm_target * INCHES_PER_FOOT / (math.pi * diameter_inches)
print(round(result))     # round() reduces float decimal noise
```

**You should see:** `7639`

That is the RPM you would set on the machine for a half-inch endmill running at 1000 SFM. The formula is the `calculate_rpm` function from lesson 00e, written out manually here so you can see each binding.

**Change something:** Change `diameter_inches = 0.5` to `diameter_inches = 0.25`. Run again.
**Expected:** `15279` — half the diameter means twice the RPM to reach the same surface speed.
Change it back to `0.5`.

---

## Step 2 — The Five Basic Types

Still in the REPL. Python's five built-in primitive types:

```python
type(42)          # → <class 'int'>
type(0.5)         # → <class 'float'>
type("EM-0500")   # → <class 'str'>
type(True)        # → <class 'bool'>
type(None)        # → <class 'NoneType'>
```

**`type()`** is a Python built-in that returns the type of any value. You will use it constantly while learning — ask Python what something is when you are not sure.

---

### Concept: Python's Basic Types

**What it is:** A type is a set of values plus a set of operations that are valid on those values.

**The five types you need now:**

| Type | What it holds | Examples |
|------|--------------|---------|
| `int` | Whole numbers, no decimal point | `0`, `42`, `-7`, `1000` |
| `float` | Numbers with a decimal point | `0.5`, `3.14159`, `-1.0` |
| `str` | Text, zero or more characters | `"EM-0500"`, `""`, `"4 flutes"` |
| `bool` | Exactly two values: True or False | `True`, `False` |
| `None` | The absence of a value | `None` |

**Why `None` exists:** `0` means zero. `""` means an empty string. `None` means "there is no value here at all — the concept does not apply." A tool with unknown flute count is not `0` flutes — it is `None` (unknown). These are different facts.

**Dynamic typing:** The type is attached to the VALUE, not to the variable name.

```python
x = 42         # x refers to an int
type(x)        # → <class 'int'>
x = "hello"    # x now refers to a str — the old int still exists but x no longer points to it
type(x)        # → <class 'str'>
```

Python checks types at runtime (when the code runs), not at compile time (before it runs). This is called **dynamic typing**. The advantage: flexibility. The risk: type errors surface at runtime, not before.

**Contrast with JavaScript:** JavaScript has `var`, `let`, `const` — different keywords for different scoping and mutability rules — but the value is still dynamically typed. Python only has `=`.

**Canonical example (General):**

A physical shelf label. The label says "SFM TARGET" and right now holds a sticky note with `1000` on it. You can take that note off and put a new one that says `800`. The shelf label has no opinion about what kind of note you use — it just holds whatever you put there.

```python
sfm_target = 1000         # shelf holds int 1000
sfm_target = "see chart"  # now the shelf holds a str — valid Python
```

**Project application:** Tool diameters are `float`. Tool names are `str`. Flute counts are `int`. A tool with no flute count recorded is `None`. These types tell you immediately what kind of data you are working with.

**Smallest possible example:**

```python
name = "DR-0250"           # str: tool name
diameter_inches = 0.25     # float: diameter in inches
flutes = None              # NoneType: drill flutes — not applicable
is_carbide = True          # bool: material check
```

**Why it matters here:** When you write `describe_tool(name, diameter_inches, flutes)`, each parameter will be one of these types. The f-string formatting code needs to know whether to format as `:.3f` (float) or as a plain `{name}` (str).

**You will see this again in:** Every Python program. In job interviews: "What is the difference between `None`, `0`, and `False`?" is a common Python question. In SQL: `NULL` maps directly to Python's `None`. In Pydantic validation (Block 9): every field has an explicit type annotation.

**Watch for:** `bool` is a subtype of `int` in Python. `True == 1` and `False == 0`. This means `True + True` is `2`. It also means an `if` statement accepts any type, not just `bool` — explained in lesson 03.

---

### SAVE AND TRY

In the REPL:

```python
tool_name = "EM-0500"
diameter_inches = 0.5
flutes = 4
is_special_order = False
coating = None

print(type(tool_name))          # → <class 'str'>
print(type(diameter_inches))    # → <class 'float'>
print(type(flutes))             # → <class 'int'>
print(type(is_special_order))   # → <class 'bool'>
print(type(coating))            # → <class 'NoneType'>
```

**You should see:** Five lines of type output, one per variable.

**Console test:** In the REPL, try:

```python
type(True) == type(1)   # is bool the same as int?
```

**Expected:** `False` — they are different types even though `True == 1` evaluates to `True`.

**Change something:** Try `type(True + 1)`. What type does Python return?
**Expected:** `<class 'int'>` — adding a bool and an int produces an int. Change it back — this is a curiosity, not a pattern to use.

---

## Step 3 — Arithmetic Operators

Python's arithmetic operators, with one that catches everyone the first time:

```python
10 + 3    # → 13   (addition)
10 - 3    # → 7    (subtraction)
10 * 3    # → 30   (multiplication)
10 / 3    # → 3.3333...  (division — always returns float)
10 // 3   # → 3    (floor division — integer result, truncates toward negative infinity)
10 % 3    # → 1    (modulo — the remainder after floor division)
10 ** 3   # → 1000 (exponentiation — 10 to the power of 3)
```

The one that surprises people: `/` always returns a float in Python 3.

```python
10 / 2    # → 5.0   not 5 — even though the result is whole, it is a float
type(10 / 2)  # → <class 'float'>
```

---

### Concept: Float Division vs Floor Division

**What it is:** Python has two division operators. `/` always returns a `float`. `//` returns the largest integer that does not exceed the mathematical result.

**The problem before (Python 2):** In Python 2, `10 / 3` returned `3` — integer division was the default. This caused many bugs: `1 / 2` returned `0` instead of `0.5`. Python 3 changed `/` to always return a float so the result is never silently wrong.

**The solution:** Use `/` for real division (always float). Use `//` when you need an integer — but understand it truncates toward negative infinity, not toward zero.

```python
7 / 2     # → 3.5   (float division)
7 // 2    # → 3     (floor division: 3.5 → 3)
-7 // 2   # → -4    (floor division: -3.5 → -4, toward negative infinity)
```

**Why it matters here:** The SFM formula divides by `INCHES_PER_FOOT = 12`. We use `/` because SFM is a physical measurement — `1000 / 12` must be `83.333...`, not `83`. Using `//` would introduce calculation error.

**Canonical example (General):**

Dividing 10 apples among 3 people. Real division: each person gets 3.333 apples. Floor division: each person gets 3 apples and there is 1 left over (modulo). Both are correct answers to different questions.

**Smallest possible example:**

```python
diameter_mm = 12.7       # 1/2 inch in millimeters
diameter_inches = diameter_mm / 25.4   # real division: 0.5
whole_inches = 12 // 25  # floor division: 0 whole inches (used for display)
remainder_mm = 12 % 25   # modulo: 12mm remainder
```

**You will see this again in:** Every numerical calculation in this project. In Block 2 (SQL): `COUNT(*) / total` for percentage calculations. In Block 9 (Pydantic): when converting between metric and imperial units.

**Watch for:** `//` on negative numbers truncates toward negative infinity, not zero. `-7 // 2` is `-4`, not `-3`. If you need "truncate toward zero," use `int(-7 / 2)` which gives `-3`.

---

### SAVE AND TRY

In the REPL:

```python
import math

diameter_inches = 0.5
rpm = 3820

sfm = math.pi * diameter_inches * rpm / 12   # divide by int 12
print(type(sfm))    # → <class 'float'> — int * float * float / int → float
print(round(sfm))   # → 1000
```

**Console test:**

```python
type(3820 / 12)   # divide int by int
```

**Expected:** `<class 'float'>` — Python 3 always returns float from `/`.

**Change something:** Try `3820 // 12` (floor division). See the different result. Change it back to `/`.

---

## Step 4 — String Operations

Strings support two operations at the expression level that you will use immediately:

```python
"EM" + "-" + "0500"    # → "EM-0500"    (concatenation)
len("EM-0500")         # → 7            (length)
```

And one you will NOT use (the old approach):

```python
name = "EM-0500"
diameter = 0.5
old_style = "Tool: " + name + "  diameter: " + str(diameter) + '"'
```

The problem: you must call `str(diameter)` to convert a float to a string before concatenating. If you forget, Python raises `TypeError: can only concatenate str (not "float") to str`. The `str()` conversion is easy to forget and the error message is confusing when you are just learning.

The solution is f-strings, in the next step.

---

### Concept: f-strings — Formatted String Literals

**What it is:** A string that interpolates Python expressions directly into text. Prefix with `f` or `F`. Put any Python expression inside `{}`.

**The problem before:** String concatenation with `+` and manual `str()` conversion:

```python
name = "EM-0500"
diameter_inches = 0.5
flutes = 4

# Old approach — error-prone:
result = "Tool: " + name + "  diameter: " + str(diameter_inches) + '"  flutes: ' + str(flutes)
```

Four separate `+` operations. Two `str()` conversions. Two different quote styles. Easy to get a space wrong.

**The solution:**

```python
result = f'Tool: {name}  diameter: {diameter_inches}"  flutes: {flutes}'
```

One string. The `{name}`, `{diameter_inches}`, and `{flutes}` expressions are evaluated and inserted automatically. No `str()` conversion needed.

**Format codes:** Inside `{}`, you can add a `:` followed by a format code to control how the value is displayed:

```python
f'{diameter_inches:.3f}'   # → "0.500"  (3 decimal places, padded with zero)
f'{diameter_inches:.1f}'   # → "0.5"   (1 decimal place)
f'{flutes:02d}'            # → "04"    (integer, at least 2 digits, zero-padded)
f'{1000:,}'                # → "1,000" (thousands separator)
```

**What it hides:** The conversion of any Python value to its string representation, and the formatting arithmetic (padding, decimal places, separators). Without f-strings, you would have to call `format(diameter_inches, '.3f')` separately and then concatenate.

The invariant it protects: you cannot accidentally omit the type conversion. `{diameter_inches}` always converts to string — Python handles it. You focus on the format code, not the mechanics of conversion.

**Canonical example (General):**

A form letter with blanks: `"Dear [NAME], your order of [COUNT] items is ready."` You fill in the blanks at print time. The letter template does not care what `NAME` or `COUNT` are — it inserts them where marked.

```python
customer_name = "Smith"
item_count = 3
print(f"Dear {customer_name}, your order of {item_count} items is ready.")
# → "Dear Smith, your order of 3 items is ready."
```

**Project application:** Every tool description, every report line, every error message that includes a value uses an f-string. `f'Tool: {name}  diameter: {diameter_inches:.3f}"'` is cleaner than any concatenation approach.

**Smallest possible example:**

```python
name = "EM-0500"
diameter_inches = 0.5
flutes = 4
line = f'Tool: {name}  diameter: {diameter_inches:.3f}"  flutes: {flutes}'
print(line)
# → Tool: EM-0500  diameter: 0.500"  flutes: 4
```

**Why it matters here:** The `describe_tool` function you are about to build returns an f-string. Every display function in this project uses f-strings.

**You will see this again in:** Every Python project. In Block 3 (PySide6): formatting cell values in the tool table. In Block 11 (FastAPI): building response messages. In SQL error messages and validation output.

**Watch for:** `{some_float}` with no format code gives you Python's default float representation: `0.5` → `"0.5"`, but `0.500000001` → `"0.500000001"`. Always use `:.3f` or similar when showing dimensions so the user sees clean numbers.

---

### SAVE AND TRY

In the REPL:

```python
name = "EM-0500"
diameter_inches = 0.5
flutes = 4

line = f'Tool: {name}  diameter: {diameter_inches:.3f}"  flutes: {flutes}'
print(line)
```

**You should see:**

```
Tool: EM-0500  diameter: 0.500"  flutes: 4
```

**Console test:** Try the format code variations:

```python
f'{diameter_inches}'        # no format code
f'{diameter_inches:.1f}'    # 1 decimal place
f'{diameter_inches:.5f}'    # 5 decimal places
```

**Expected:** `"0.5"`, `"0.5"`, `"0.50000"` — the format code controls precision.

**Change something:** Change `:.3f` to `:.0f`. What does the line look like?
**Expected:** `Tool: EM-0500  diameter: 0"  flutes: 4` — zero decimal places rounds to whole number. Change it back to `:.3f`.

---

## 🎯 Challenge: Format Multiple Tools

**You know:** Variables, types, arithmetic, f-strings.

**Task:** In the REPL, create three tools as separate variables and print a formatted line for each using f-strings. Each line must show: name, diameter in inches (3 decimal places), diameter in millimeters (2 decimal places), and flute count.

1 inch = 25.4 millimeters.

**Starting point:**

```python
# Tool 1: EM-0500, 0.5 inch diameter, 4 flutes
# Tool 2: DR-0250, 0.25 inch diameter, 2 flutes (a drill — flutes not applicable, use None)
# Tool 3: FM-1000, 1.0 inch diameter, 6 flutes

MILLIMETERS_PER_INCH = 25.4   # ← conversion constant

# Write three print() calls, one per tool
```

**Expected output:**

```
Tool: EM-0500  diameter: 0.500" (12.70mm)  flutes: 4
Tool: DR-0250  diameter: 0.250" (6.35mm)  flutes: N/A
Tool: FM-1000  diameter: 1.000" (25.40mm)  flutes: 6
```

**Hint:** For the drill with `flutes = None`, you cannot put `None` directly into the flutes slot — it would print `"flutes: None"`. Use a Python conditional expression (ternary): `flutes if flutes is not None else "N/A"`. You have not formally learned this yet, but the shape is readable enough to use here.

---

<details>
<summary>▶ Show Solution</summary>

```python
MILLIMETERS_PER_INCH = 25.4

# Tool 1
name_1 = "EM-0500"
diameter_1 = 0.5
flutes_1 = 4
diameter_1_mm = diameter_1 * MILLIMETERS_PER_INCH  # float * float → float
print(f'Tool: {name_1}  diameter: {diameter_1:.3f}" ({diameter_1_mm:.2f}mm)  flutes: {flutes_1}')

# Tool 2 — drill with no flute count
name_2 = "DR-0250"
diameter_2 = 0.25
flutes_2 = None
diameter_2_mm = diameter_2 * MILLIMETERS_PER_INCH
flutes_2_display = flutes_2 if flutes_2 is not None else "N/A"  # conditional expression
print(f'Tool: {name_2}  diameter: {diameter_2:.3f}" ({diameter_2_mm:.2f}mm)  flutes: {flutes_2_display}')

# Tool 3
name_3 = "FM-1000"
diameter_3 = 1.0
flutes_3 = 6
diameter_3_mm = diameter_3 * MILLIMETERS_PER_INCH
print(f'Tool: {name_3}  diameter: {diameter_3:.3f}" ({diameter_3_mm:.2f}mm)  flutes: {flutes_3}')
```

**Key insight:** `MILLIMETERS_PER_INCH = 25.4` is a named constant placed once at the top. If the conversion factor ever changed (it does not, but hypothetically), you change one line. The f-string `:.2f` controls exactly how many decimal places appear in the millimeter value, so `12.700000000000001` (floating-point noise) appears as `12.70`.

</details>

---

## Step 5 — Red: Write the Test First

Exit the REPL:

```python
exit()
```

Now write the test before the function exists. Open `tests/test_display.py` (create it if it does not exist):

```python
from tooldb.display import describe_tool   # ← this import will fail — that is correct
```

Add the tests:

```python
from tooldb.display import describe_tool


def test_describe_tool_includes_name():
    result = describe_tool("EM-0500", 0.5, 4)   # name, diameter_inches, flutes
    assert "EM-0500" in result                   # the name must appear somewhere in the output


def test_describe_tool_includes_diameter():
    result = describe_tool("EM-0500", 0.5, 4)
    assert "0.500" in result                     # diameter formatted to 3 decimal places


def test_describe_tool_includes_flute_count():
    result = describe_tool("EM-0500", 0.5, 4)
    assert "4" in result                         # flute count appears in the output
```

Run:

```powershell
pytest tests/test_display.py
```

**You should see:**

```
ImportError: cannot import name 'describe_tool' from 'tooldb.display'
```

This is the Red step. The test cannot even run because `describe_tool` does not exist yet. The import error IS the failure — it is not a problem, it is the signal that the test is demanding something real.

---

## Step 6 — Green: Write the Minimum Function

Open `tooldb/display.py`. It currently has `format_tool_line`. Add `describe_tool` below it:

```python
def format_tool_line(name: str, diameter_inches: float, sfm: int) -> str:   # ← already exists
    return f'Tool: {name}  diameter: {diameter_inches:.3f}"  recommended SFM: {sfm}'


def describe_tool(name: str, diameter_inches: float, flutes: int) -> str:   # ← add this
    return f'Tool: {name}  diameter: {diameter_inches:.3f}"  flutes: {flutes}'
    # f-string: name inserted as-is, diameter formatted to 3 decimal places, flutes as integer
```

Run:

```powershell
pytest tests/test_display.py
```

**You should see:**

```
3 passed in 0.01s
```

Green. The three assertions pass:

- `"EM-0500" in result` — `{name}` inserts the name string directly
- `"0.500" in result` — `{diameter_inches:.3f}` formats `0.5` as `"0.500"`
- `"4" in result` — `{flutes}` converts the integer `4` to `"4"`

---

## Step 7 — Refactor: Add a Test for None Flutes

The function works for a normal endmill, but the challenge showed that drills have no flute count. What does the current function do with `None`?

Add one more test to `tests/test_display.py`:

```python
def test_describe_tool_handles_none_flutes():
    result = describe_tool("DR-0250", 0.25, None)   # drill — flutes not applicable
    assert "N/A" in result                           # human-readable, not "None"
```

Run:

```powershell
pytest tests/test_display.py
```

**You should see:**

```
FAILED tests/test_display.py::test_describe_tool_handles_none_flutes
AssertionError: assert 'N/A' in 'Tool: DR-0250  diameter: 0.250"  flutes: None'
```

Red again — the function currently puts the literal word `None` in the output. That is not human-readable. Refactor the function to handle it:

In `tooldb/display.py`, update `describe_tool`:

```python
def describe_tool(name: str, diameter_inches: float, flutes: int) -> str:
    flutes_display = flutes if flutes is not None else "N/A"   # ← add this line
    return f'Tool: {name}  diameter: {diameter_inches:.3f}"  flutes: {flutes_display}'
    # flutes_display is either the integer (e.g. 4) or the string "N/A"
```

Run:

```powershell
pytest tests/test_display.py
```

**You should see:**

```
4 passed in 0.01s
```

---

### Concept: The Conditional Expression (Ternary)

**What it is:** A one-line `if/else` that produces a value.

**The problem before:**

```python
if flutes is not None:
    flutes_display = flutes
else:
    flutes_display = "N/A"
```

Four lines to say "use flutes if it exists, otherwise use N/A."

**The solution:**

```python
flutes_display = flutes if flutes is not None else "N/A"
```

One line. Same logic, less vertical space.

**The syntax:**

```
value_if_true  if  condition  else  value_if_false
```

Read it left to right: "give me `flutes` *if* `flutes is not None`, *else* give me `"N/A"`."

**`is not None`:** The correct way to check for `None` in Python. Use `is not None`, not `!= None`. The reason: `is` checks object identity (is this the actual `None` object?), while `==` checks value equality. For `None`, you always want identity — it is the only `None` that exists.

**Canonical example (General):**

The question "What do you want to drink?" with a person who might or might not be thirsty:

```python
preference = "coffee" if is_thirsty else "nothing, thanks"
```

**Smallest possible example:**

```python
value = None
display = value if value is not None else "unknown"
print(display)   # → "unknown"

value = 42
display = value if value is not None else "unknown"
print(display)   # → 42
```

**Why it matters here:** `None` appears throughout the tool database — tools without holder assignments, tools without flute counts, jobs without due dates. Every time a `None` value is displayed to a user, it must be converted to something human-readable. The conditional expression is how you do it in one line.

**You will see this again in:** Pydantic validators (Block 9) — `value if value is not None else default`. React (Block 11) — the same pattern in JavaScript: `value ?? "N/A"`.

**Watch for:** The conditional expression should not replace a multi-branch `if`. If there are three or more cases, use a regular `if/elif/else` block — it is easier to read than a nested ternary.

---

### SAVE AND TRY

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass, including all previously written tests.

**Console test:** In the REPL, import and call the function directly:

```python
from tooldb.display import describe_tool
print(describe_tool("EM-0500", 0.5, 4))
print(describe_tool("DR-0250", 0.25, None))
```

**Expected:**

```
Tool: EM-0500  diameter: 0.500"  flutes: 4
Tool: DR-0250  diameter: 0.250"  flutes: N/A
```

**Change something:** Change `"N/A"` in the function to `"not measured"`. Run pytest. The test `test_describe_tool_handles_none_flutes` fails — it asserts `"N/A" in result`. Change it back. This shows how the test protects the behavior: if you accidentally change the output format, the test tells you immediately.

---

## 🎯 Challenge: Add Metric Diameter to describe_tool

**You know:** f-strings, arithmetic, variables, types, the conditional expression.

**Task:** Extend `describe_tool` to also show the diameter in millimeters, formatted to 2 decimal places.

The new output format:

```
Tool: EM-0500  diameter: 0.500" (12.70mm)  flutes: 4
```

Requirements:
1. Add a constant `MILLIMETERS_PER_INCH = 25.4` at the top of `tooldb/display.py`
2. Update the `describe_tool` function to calculate and show millimeters
3. Add a new test to `tests/test_display.py` that asserts `"12.70mm"` appears in the output for a half-inch tool

**Starting code** (current state of `tooldb/display.py`):

```python
def describe_tool(name: str, diameter_inches: float, flutes: int) -> str:
    flutes_display = flutes if flutes is not None else "N/A"
    return f'Tool: {name}  diameter: {diameter_inches:.3f}"  flutes: {flutes_display}'
```

**Hints:**
1. `12.7` appears in the output as `12.70` with format code `:.2f`
2. Add the test first, see it fail, then update the function

---

<details>
<summary>▶ Show Solution</summary>

**Test first** — add to `tests/test_display.py`:

```python
def test_describe_tool_includes_metric_diameter():
    result = describe_tool("EM-0500", 0.5, 4)
    assert "12.70mm" in result   # 0.5 * 25.4 = 12.7 → formatted as 12.70mm
```

Run pytest → FAILED (the format doesn't include mm yet).

**Then update** `tooldb/display.py`:

```python
MILLIMETERS_PER_INCH = 25.4   # ← add this constant at the top of the file


def describe_tool(name: str, diameter_inches: float, flutes: int) -> str:
    diameter_mm = diameter_inches * MILLIMETERS_PER_INCH   # ← compute metric diameter
    flutes_display = flutes if flutes is not None else "N/A"
    return f'Tool: {name}  diameter: {diameter_inches:.3f}" ({diameter_mm:.2f}mm)  flutes: {flutes_display}'
    # {diameter_mm:.2f}mm → "12.70mm" for 0.5 inch tool
```

Run pytest → all tests pass.

**Key insight:** `MILLIMETERS_PER_INCH` is a named constant at the file level, not a magic number inside the function. If you had written `diameter_inches * 25.4` directly in the f-string, every reader would have to know that `25.4` is the inch-to-mm conversion factor. The constant makes the intent obvious and changes happen in one place.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `describe_tool("EM-0500", 0.5, 4)` returns a string | Run `pytest tests/test_display.py` — 4+ tests pass |
| Diameter appears as `0.500"` (3 decimal places) | Test `test_describe_tool_includes_diameter` passes |
| Flutes appear in output | Test `test_describe_tool_includes_flute_count` passes |
| `None` flutes shows `N/A`, not the word `None` | Test `test_describe_tool_handles_none_flutes` passes |
| All previous tests still pass | Run `pytest tests/` — no regressions |
| You can name the 5 basic types from memory | `int`, `float`, `str`, `bool`, `None` — list them without reading |
| You can explain dynamic typing in one sentence | The type is on the VALUE, not the variable name |

---

## Quick Check Answers

**1. If Python is "dynamically typed," what does that mean at runtime?**

Dynamic typing means the type of a value is determined at runtime, not before the program runs. The variable name carries no type information — only the value does. You can write `x = 42` and then `x = "hello"` on the next line: Python does not complain because `x` has no declared type. The `int` 42 and the `str` "hello" both exist; `x` just points to whichever one is current. In a statically typed language (Java, C, TypeScript with strict mode), the variable name carries a type declaration and the compiler rejects `x = "hello"` after `int x = 42`.

**2. What type does `math.pi / 12` return?**

`float`. In Python 3, the `/` operator always returns `float`, regardless of what types are on either side. `math.pi` is a `float`; `12` is an `int`; `math.pi / 12` is a `float`. You can verify with `type(math.pi / 12)` → `<class 'float'>`. This is intentional in Python 3 — before Python 3, integer division was the default and caused many bugs in numerical code.

**3. What happens when you try `"4" + 4`?**

Python raises `TypeError: can only concatenate str (not "int") to str`. Python does not automatically convert `4` to `"4"` when you concatenate with `+`. This is deliberate: Python refuses the ambiguity. Does `"4" + 4` mean string concatenation (the answer is `"44"`) or addition (the answer is `8`)? Python refuses to guess. You must be explicit: either `"4" + str(4)` for string concatenation, or `int("4") + 4` for numeric addition. This is why f-strings exist — `f"{'4'}{4}"` handles the conversion automatically and leaves no ambiguity.
