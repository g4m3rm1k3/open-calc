# Python Tool Database — LAB 21 — What is a Test and Why Tests Exist

**Prerequisites:** Lab 20. You have a three-layer architecture (`repositories/`, `services/`), `ToolService`, and test files for each lesson so far. You have been running `pytest` for a while — now we slow down and understand what tests actually are.

**What this lab adds:**
- A precise definition of what a test is and what it checks
- The four kinds of cases every good test suite covers
- Reading tests as documentation
- Understanding what tests protect you from
- No new production code — the output is understanding, not lines

**Time:** 25–35 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You change a function. You run pytest. All 47 tests pass. What do you now know that you didn't know five seconds ago?
> 2. A test is named `test_create_tool_with_negative_diameter_raises_error`. Before reading the test body, what do you already know about the function it tests?
> 3. Your colleague says "I don't write tests — I just try it manually and see if it works." Name one situation where manual testing will miss a bug that automated tests would catch.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

No new code. You will read three existing test files from your own project and answer specific questions about each. The exercise builds the skill of reading tests as documentation — which is the prerequisite for writing them well.

---

## Step 1 — A Test is a Tiny Program

Here is the simplest test in your project:

```python
def test_calculate_sfm_returns_correct_value():
    result = calculate_sfm(diameter_inches=1.0, rpm=3820)
    assert result == 1000.0
```

Break this down:

| Part | What it is |
|------|-----------|
| `test_calculate_sfm_returns_correct_value` | The name — tells you what is being checked and under what conditions |
| `calculate_sfm(diameter_inches=1.0, rpm=3820)` | The call — known inputs, no surprises |
| `assert result == 1000.0` | The claim — if this is false, the test fails |

A test is a function that:
1. Sets up a known state
2. Calls the code under test with specific inputs
3. Asserts that the output matches what you expect

If the assertion is false, pytest stops and shows you exactly what the actual value was — not just "it failed," but "expected `1000.0`, got `999.87`."

---

## Step 2 — What Problem Tests Solve

### The manual testing spiral

Imagine you have a running app with 20 features. You change one function. Now you have to manually click through all 20 features to make sure nothing broke. For a small app this takes five minutes. For a medium app, 30 minutes. For a large app you simply stop checking everything — and bugs start reaching users.

### Tests automate the checking

With tests:
- You run one command: `pytest`
- Every check runs in seconds
- You get a clear list of what passed and what failed
- The cost of "checking everything" is near zero

### The compounding benefit

The longer the project lives, the more valuable tests become. You will forget exactly why a piece of code was written a certain way. The tests remember for you. If a test named `test_foreign_key_constraint_prevents_orphan_assembly` fails after your change, you immediately know: your change broke referential integrity — even if you forgot that relationship existed.

---

## Step 3 — The Four Cases Every Suite Should Cover

For any function, there are four kinds of inputs worth testing:

```
1. Normal case   — the happy path, typical input, expected output
2. Edge case     — the boundary of valid input (zero, empty string, max value)
3. Error case    — input that should fail, and what error should be raised
4. Regression    — a specific bug that was found and fixed; the test proves it can't silently come back
```

Look at your existing `tests/test_queries.py`. Find one example of each. If a category is missing, that is information — not a problem to fix right now, just something to notice.

---

## Step 4 — Tests as Documentation

This is the most underrated benefit of tests.

Compare these two ways of understanding what `create_tool` does:

**Option A — read the docstring:**
```python
def create_tool(self, name, diameter_inches, material, tool_type, flutes=None, notes=None) -> int:
    """Creates a new tool. Returns the tool ID."""
```

**Option B — read the tests:**
```python
def test_create_tool_returns_integer_id():
    ...

def test_create_tool_rejects_negative_diameter():
    ...

def test_create_tool_rejects_duplicate_name():
    ...

def test_create_tool_accepts_none_flutes():
    ...
```

The test names tell you:
- What it returns (an integer ID)
- What it rejects (negative diameter, duplicate name)
- What is optional (flutes can be None)

A docstring tells you what someone *intended* the code to do. Tests tell you what the code *actually enforces* — and they are automatically checked to be true.

---

## Step 5 — What Tests Do Not Do

Tests are not a proof of correctness. They check the cases you thought to write. A function with 10 passing tests can still have bugs — for inputs no test covers.

This is not a reason to distrust tests. It is a reason to think about coverage:
- Did you test the normal case? (Usually yes.)
- Did you test the edges? (Often forgotten.)
- Did you test the errors? (Sometimes skipped because "that shouldn't happen.")
- Did you write a regression test for every bug you found? (Rarely done at first.)

The goal is not 100% coverage of every line — it is coverage of every *decision* the code makes.

---

## Step 6 — Reading Exercise

Open these three files and answer the questions below each one.

### File 1: `tests/test_queries.py`

Questions:
- How many tests are there?
- What function or behavior is tested most thoroughly?
- Is there a test for what happens when `insert_tool` is called with a duplicate name? If not, is that a gap?
- Pick one test. Without running it, predict: what would happen if you changed the `ORDER BY diameter_inches DESC` to `ASC` in `top_tools_by_diameter`? Which test would fail?

### File 2: `tests/test_fk.py`

Questions:
- `test_cannot_delete_tool_used_in_assembly` — this is an error case test. What is the expected error type?
- Is there a test for what happens when you delete a *holder* that is used in an assembly? If not, what result would you expect?

### File 3: `tests/test_tool_service.py`

Questions:
- Find the test that checks for a duplicate name. What does `ToolService` raise when a duplicate is detected?
- Find the test that checks for a negative diameter. Where does the validation happen — inside `ToolService` or inside `ToolRepository`?
- Are these tests testing your logic or testing sqlite3's behavior?

Write your answers in a comment block at the top of a scratch file, or just think through them. This is not submitted anywhere — it is thinking practice.

---

## Step 7 — SAVE AND TRY

No new code to save. Instead:

1. Run the full test suite:
   ```
   cd python-tooldb
   pytest -v
   ```
2. Count the tests. Write the number down.
3. Find the slowest test (pytest prints timing with `--durations=5`):
   ```
   pytest --durations=5
   ```
4. Look at the slowest test. Is it slow because it does more work, or because it sets up and tears down a database?

This baseline matters. As the suite grows, you will notice if it starts getting slower.

---

## Concept Block — The Testing Vocabulary

```
TERM          MEANING
----          -------
test          A function that calls code and asserts an outcome
assertion     A claim that must be true; pytest fails the test if false
test suite    All the test files in the project, run together
passing test  The assertion was true; the code behaved as expected
failing test  The assertion was false; the code did something unexpected
regression    A bug that was fixed; a regression test makes sure it stays fixed
coverage      How much of the code is executed by at least one test
edge case     Input at the boundary of valid values (zero, max, empty)
error case    Input that should cause the code to raise an exception
fixture       Code that sets up (and tears down) state before a test runs
```

---

## Challenge

Look at `tests/test_junction.py`. The test `test_add_same_assembly_twice_to_same_job_fails` was written *before* the UNIQUE constraint was added to the schema — it was the test that revealed the missing constraint.

Write a short paragraph (in a comment or a scratch file) describing the sequence of events:
1. The test was written. Did it pass or fail?
2. The test failed. What did that failure tell you?
3. The schema was changed. The test passed. What did that prove?

<details>
<summary>Answer</summary>

1. The test was written first (Red step). It failed because there was no UNIQUE constraint — inserting the same `(job_id, assembly_id)` pair twice succeeded when it should have raised an error.

2. The failure told you that the production code had a gap: the business rule "an assembly can only appear once per job" was not enforced by the database. Without the test, this bug might have been discovered much later — after real data was corrupted.

3. After `UNIQUE (job_id, assembly_id)` was added to `JOB_ASSEMBLIES_TABLE_SQL`, the test passed. This proved the constraint was active and working. Now if anyone accidentally removes that constraint, the test will fail immediately — before the code reaches production.

This is the core value of a test that starts Red: you learn something real about the system. A test that starts Green from the beginning proves nothing.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| State in one sentence what a test is | |
| Name the four cases every test suite should cover | |
| Read a test name and state what it checks | |
| Explain why tests are more reliable documentation than comments | |
| Describe one thing tests cannot guarantee | |
| Run the full test suite and read the output | |

---

## Quick Check Answers

1. **You know none of the 47 behaviors those tests check were broken by your change.** You do not know about behavior no test covers — but 47 specific, named things are still correct.

2. **The function `create_tool` is supposed to raise an error when the diameter is negative.** You know the expected behavior, the input condition, and the expected outcome — all from the name, before reading one line of the body.

3. Examples:
   - You changed a function that runs every night in a batch job — you would never manually test it at 2 AM.
   - A bug only happens when two specific conditions are both true at the same time — you might check one condition manually but not think to combine both.
   - Regression: a bug you fixed three months ago reappears after an unrelated change — manual testing only catches what you think to test, not what you once fixed and forgot.
