# Python Tool Database — LAB 22 — pytest: Writing and Running Your First Tests

**Prerequisites:** Lab 21. You understand what a test is and why tests exist. You have been running pytest but haven't yet focused on *how* to write test functions from scratch.

**What this lab adds:**
- The structure of a pytest test function
- Assertion patterns: `==`, `in`, `isinstance`, `pytest.raises`
- Test naming conventions
- Reading pytest output: dots, `F`, `E`, traceback
- `pytest -v` for verbose output
- `pytest -k` for running a subset of tests

**Time:** 35–45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. pytest discovers test files and test functions by name. What naming rule must a test function follow for pytest to find it?
> 2. What is the difference between an assertion that fails (`assert False`) and an exception raised inside a test (`raise ValueError`)? How does pytest report each?
> 3. You have 40 tests and you only want to run the ones that test the "service" layer. What `pytest` flag lets you filter by name?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three test functions for `describe_tool` from Lesson 01, plus one deliberately broken test so you can read a real failure. You will also add a fourth test using `pytest.raises` for an error case.

```
tests/
    test_describe_tool.py    ← NEW: 4 tests
```

The `describe_tool` function (from your `tooldb/queries.py` or wherever it lives):

```python
def describe_tool(name: str, diameter_inches: float, flutes: int | None = None) -> str:
    if flutes:
        return f"{name} — {diameter_inches}\" diameter, {flutes} flutes"
    return f"{name} — {diameter_inches}\" diameter"
```

---

## Step 1 — How pytest Finds Tests

pytest's discovery rules:
1. It searches for files named `test_*.py` or `*_test.py`
2. Inside those files, it runs functions named `test_*`
3. It runs methods named `test_*` inside classes named `Test*`

That is the entire discovery system. No registration, no configuration, no decorators needed for basic tests.

---

## Step 2 — RED: Write the Tests First

Create `tests/test_describe_tool.py`. The function exists already — but pretend it doesn't. Write what you *want* it to do, then verify the tests pass.

```python
from tooldb.queries import describe_tool


def test_describe_tool_includes_name():
    result = describe_tool("1/2 Carbide EM", diameter_inches=0.5)
    assert "1/2 Carbide EM" in result


def test_describe_tool_includes_diameter():
    result = describe_tool("1/2 Carbide EM", diameter_inches=0.5)
    assert "0.5" in result


def test_describe_tool_with_flutes_includes_flute_count():
    result = describe_tool("1/2 Carbide EM", diameter_inches=0.5, flutes=4)
    assert "4 flutes" in result


def test_describe_tool_without_flutes_omits_flute_text():
    result = describe_tool("1/2 Carbide EM", diameter_inches=0.5, flutes=None)
    assert "flutes" not in result
```

Notice: each test checks **one thing**. Not "the whole output string" — one specific claim about the output. This makes failures precise: you know exactly what was wrong, not just "the function returned something bad."

---

## Step 3 — GREEN: Run the Tests

```
cd python-tooldb
pytest tests/test_describe_tool.py -v
```

Expected output:
```
tests/test_describe_tool.py::test_describe_tool_includes_name PASSED
tests/test_describe_tool.py::test_describe_tool_includes_diameter PASSED
tests/test_describe_tool.py::test_describe_tool_with_flutes_includes_flute_count PASSED
tests/test_describe_tool.py::test_describe_tool_without_flutes_omits_flute_text PASSED

4 passed in 0.05s
```

Four dots if you run without `-v`. Four lines with names if you run with `-v`. Always use `-v` when you are actively developing — the names tell you exactly what passed.

---

## Step 4 — Reading a Failure

Now deliberately break one test so you can practice reading the output. Change the third test:

```python
def test_describe_tool_with_flutes_includes_flute_count():
    result = describe_tool("1/2 Carbide EM", diameter_inches=0.5, flutes=4)
    assert "5 flutes" in result  # wrong: changed 4 to 5
```

Run pytest again:

```
pytest tests/test_describe_tool.py -v
```

The output will look like:

```
FAILED tests/test_describe_tool.py::test_describe_tool_with_flutes_includes_flute_count

================================= FAILURES ==================================
_____________ test_describe_tool_with_flutes_includes_flute_count ______________

    def test_describe_tool_with_flutes_includes_flute_count():
        result = describe_tool("1/2 Carbide EM", diameter_inches=0.5, flutes=4)
>       assert "5 flutes" in result
E       AssertionError: assert '5 flutes' in '1/2 Carbide EM — 0.5" diameter, 4 flutes'
E       Left:  '5 flutes'
E       Right: '1/2 Carbide EM — 0.5" diameter, 4 flutes'
```

Read this output from bottom to top:
- The rightmost line shows the actual value returned
- The leftmost line shows what the assertion expected
- The `>` line shows the exact assertion that failed
- The function name and file:line tell you exactly where to look

Fix the test back to `"4 flutes"` before continuing.

---

## Concept Block — The Assert Vocabulary

```python
# Equality
assert result == 1000.0

# Membership
assert "flutes" in result         # substring check
assert tool_id in [1, 2, 3]       # list membership

# Type check
assert isinstance(result, int)

# Boolean
assert result is None
assert result is not None
assert flag is True

# Comparison
assert diameter > 0
assert count >= 1
```

pytest rewrites these assertions on failure so you see the actual vs expected values — not just "assertion failed." This is one of pytest's most useful features.

---

## Step 5 — Testing Error Cases with `pytest.raises`

Some functions are *supposed* to raise exceptions. If you call `describe_tool` with `diameter_inches=-1.0`, what should happen? Right now the function doesn't validate — it would happily return `"1/2 Carbide EM — -1.0\" diameter"`.

But we want to test that ToolService *does* reject negative diameters. Here is the pattern for testing that an exception is raised:

```python
import pytest
from tooldb.services.tool_service import ToolService, ToolRepository
import sqlite3

def test_tool_service_rejects_negative_diameter():
    conn = sqlite3.connect(":memory:")
    # minimal setup — just enough to construct the service
    repo = ToolRepository(conn)
    service = ToolService(repo)

    with pytest.raises(ValueError):
        service.create_tool(
            name="Bad Tool",
            diameter_inches=-0.5,
            material="carbide",
            tool_type="endmill",
        )
```

The `with pytest.raises(ValueError):` block says: "the code inside this block must raise `ValueError`. If it does, the test passes. If it doesn't raise (or raises a different exception), the test fails."

You can also check the error message:

```python
with pytest.raises(ValueError, match="diameter"):
    service.create_tool(...)
```

`match` takes a regex pattern and checks it against the exception message. This makes the test more precise — it not only requires a `ValueError` but requires one that mentions the word "diameter."

---

## Step 6 — SAVE AND TRY

### 6a. Run the full suite

```
pytest -v
```

Confirm all tests still pass, including the new `test_describe_tool.py`.

### 6b. Run a filtered subset

Run only tests whose names contain the word "diameter":

```
pytest -v -k "diameter"
```

Run only tests in a specific file:

```
pytest tests/test_describe_tool.py -v
```

Run a specific test by name:

```
pytest tests/test_describe_tool.py::test_describe_tool_includes_name -v
```

### 6c. Read the summary line

At the end of every pytest run:
```
4 passed, 0 failed, 0 errors in 0.12s
```

The three numbers to watch: passed, failed, errors. An error (`E`) is different from a failure (`F`):
- **Failure** (`F`): an assertion was false — the test ran to completion and disagreed with the result
- **Error** (`E`): an exception was raised *before the assertion* — the test couldn't even run. Usually a missing import, a missing function, or a setup problem.

---

## Step 7 — REFACTOR: Naming Conventions

Look at the four tests you wrote:

```
test_describe_tool_includes_name
test_describe_tool_includes_diameter
test_describe_tool_with_flutes_includes_flute_count
test_describe_tool_without_flutes_omits_flute_text
```

This naming pattern is: `test_<function>_<condition>_<expected>`.

The condition is optional for the normal case. The important thing: a reader who has never seen your code must understand what the test checks from the name alone. If the test fails, the name is the first thing they read.

Bad names: `test_1`, `test_a`, `test_describe`. These fail the reader.

Good names: `test_create_tool_with_zero_diameter_raises_error`, `test_find_carbide_returns_only_carbide_tools`. These pass the reader.

---

## Challenge

Add a fifth test to `tests/test_describe_tool.py`:

```python
def test_describe_tool_with_zero_flutes_omits_flute_text():
    ...
```

The question: is `flutes=0` the same as `flutes=None` for this function? Run the test and find out. If it isn't, decide: is that a bug in the function, or is `0` a valid way to say "no flutes"?

<details>
<summary>Answer</summary>

```python
def test_describe_tool_with_zero_flutes_omits_flute_text():
    result = describe_tool("1/2 Carbide EM", diameter_inches=0.5, flutes=0)
    assert "flutes" not in result
```

The current implementation uses `if flutes:` — which treats `0` and `None` identically (both are falsy). So the test passes. Whether that is correct depends on your domain: in machining, a tool with 0 flutes doesn't make sense, so treating `0` the same as `None` is probably fine.

The real lesson: by writing this test, you discover that the current code handles `0` the same as `None` — and you have to *decide* if that's intentional. Without the test, it's an untested assumption.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Write a test function that pytest will discover | |
| Use `assert x in result` to check substrings | |
| Use `pytest.raises(SomeError)` to test for expected exceptions | |
| Run `pytest -v` and read the output | |
| Distinguish a failure (F) from an error (E) | |
| Use `pytest -k "pattern"` to run a filtered subset | |
| Name a test so someone unfamiliar with the code understands it | |

---

## Quick Check Answers

1. **Test functions must start with `test_`.** The file must be named `test_*.py` or `*_test.py`. No imports or registration required — just the naming convention.

2. **A failing assertion** (`AssertionError`) is reported as `FAILED` (F). pytest shows the assertion line, the expected value, and the actual value. **An uncaught exception** before the assertion is reported as `ERROR` (E). pytest shows the full traceback. Both cause the test to not pass, but they mean different things: a failure means the code ran but returned the wrong thing; an error means the code didn't run successfully at all.

3. **`pytest -k "service"`** — this runs all tests whose name (or file path) contains the word "service". You can use any substring: `pytest -k "create"` would run all tests with "create" in the name. You can combine with `and`/`or`/`not`: `pytest -k "service and not duplicate"`.
