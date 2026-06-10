# Python Tool Database — LAB 26 — What to Test and What Not to Test

**Prerequisites:** Lab 25. You have a full test suite with fixtures, service tests, repository tests, and query tests. The suite is green. Now we audit it: are we testing the right things?

**What this lab adds:**
- The rule: test your logic, not the framework
- What is "your logic" vs "the framework's logic"
- The cost of over-testing: maintenance burden
- The cost of under-testing: silent bugs
- Regression tests: the test you write *after* finding a bug
- A practical review of the existing test suite

**Time:** 30–40 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a test that inserts a tool with `conn.execute(INSERT_SQL, ...)` and then asserts that `SELECT COUNT(*) FROM tools` returns 1. Is this testing your logic or sqlite3's logic?
> 2. A bug is found in production: tools with `flutes=0` are displaying "0 flutes" in the UI when they should display nothing. You fix the bug. What test should you write *before* fixing it?
> 3. You have 200 tests. Coverage is at 78%. Your manager says "get it to 95%." What is wrong with this framing?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

No new production code. You will:
1. Audit the existing test suite and remove tests that test the framework
2. Find and document two test gaps (behaviors with no test)
3. Write one regression test for a real bug you identify

---

## Step 1 — The Core Rule

**Test your logic. Not the framework.**

Your logic is any code you wrote that makes a *decision*:
- If/else branches
- Calculations
- Validation rules ("diameter must be positive")
- Business rules ("an assembly name must be unique per job")
- Error handling ("tool not found → raise ValueError")
- Data transformations (mapping Mastercam fields to your schema)

The framework is sqlite3, pytest, Python itself, PySide6 (later). These are already tested by their maintainers. Writing a test that proves sqlite3 can insert a row is not your job.

The harder question: where is the line?

---

## Step 2 — Recognizing Framework Tests

### Example A — testing sqlite3

```python
def test_can_insert_and_retrieve_tool():
    conn = sqlite3.connect(":memory:")
    conn.execute(TOOLS_TABLE_SQL)
    conn.execute(
        "INSERT INTO tools (name, diameter_inches, material, tool_type) VALUES (?, ?, ?, ?)",
        ("Mill-01", 0.5, "carbide", "endmill"),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM tools WHERE name = ?", ("Mill-01",)).fetchone()
    assert row is not None
```

This tests that sqlite3 can insert and retrieve data. That is sqlite3's job. Unless there is a bug in sqlite3, this test can never fail. Delete it.

### Example B — testing your validation logic

```python
def test_create_tool_rejects_negative_diameter(tool_service):
    with pytest.raises(ValueError, match="diameter"):
        tool_service.create_tool(name="Bad", diameter_inches=-0.5, material="carbide", tool_type="endmill")
```

This tests that *your* code enforces the rule "diameter must be positive." sqlite3 would happily store `-0.5`. Your service refuses to. That is your logic. Keep this test.

### Example C — borderline

```python
def test_foreign_key_prevents_orphan_assembly(db_conn):
    from tooldb.queries import insert_holder, insert_assembly
    holder_id = insert_holder(db_conn, "ER32 Holder", "BT30", 0.5)
    db_conn.commit()
    conn2 = sqlite3.connect(":memory:")  # different connection, no PRAGMA
    with pytest.raises(sqlite3.IntegrityError):
        conn2.execute("DELETE FROM holders WHERE id = ?", (holder_id,))
```

This is testing SQLite's foreign key enforcement — but with a twist: it is actually testing that *your application* always enables `PRAGMA foreign_keys = ON`. Without the pragma, the constraint is silently ignored. The test is documenting a required setup step. This is worth keeping, but rewrite it to test your code's behavior, not sqlite3 internals:

```python
def test_delete_holder_in_use_raises_integrity_error(db_conn):
    from tooldb.queries import insert_holder, insert_tool, insert_assembly
    tool_id = insert_tool(db_conn, "Mill", 0.5, "carbide", "endmill")
    holder_id = insert_holder(db_conn, "ER32", "BT30", 0.5)
    insert_assembly(db_conn, "Assembly 1", tool_id, holder_id, 1.5)
    db_conn.commit()

    with pytest.raises(sqlite3.IntegrityError):
        db_conn.execute("DELETE FROM holders WHERE id = ?", (holder_id,))
        db_conn.commit()
```

This tests that your schema (with `ON DELETE RESTRICT`) enforces referential integrity when the `PRAGMA` is set. It is documenting the contract of your schema design.

---

## Step 3 — What Is Worth Testing

Use this checklist:

```
✓ Any function that contains an if/else
✓ Any calculation (arithmetic, date math, unit conversion)
✓ Any validation rule that you invented
✓ Any function that can raise more than one kind of error
✓ Any function that transforms data from one format to another
✓ Any rule a stakeholder stated ("tools must have positive diameter")
✓ Any bug you fixed (regression test)
```

```
✗ Simple property assignment (self.name = name)
✗ Trivial getters (return self.name)
✗ One-liners that just delegate: return self.repo.get_all()
✗ pytest's own assert mechanism
✗ sqlite3's INSERT behavior
✗ SQLAlchemy's ORM behavior (later)
```

---

## Step 4 — Audit Your Test Suite

Open `tests/test_queries.py`. For each test, ask: "Is this testing my logic or a library's behavior?"

Mark:
- **KEEP** — tests a decision you made
- **REWRITE** — tests the right thing but with unnecessary boilerplate
- **DELETE** — tests library behavior, can never fail on your end

Do the same for `tests/test_fk.py`, `tests/test_junction.py`, `tests/test_joins.py`, `tests/test_aggregation.py`.

You are not required to delete anything right now — this is an audit. The goal is to see the distinction.

---

## Step 5 — Regression Tests

A regression test is a test you write *after* finding a bug, *before* fixing it.

**The cycle:**
1. Bug is reported: "tools with `flutes=0` show '0 flutes' in the output"
2. You reproduce it: `describe_tool("Mill", 0.5, flutes=0)` returns `"Mill — 0.5\" diameter, 0 flutes"`
3. You write the test:
   ```python
   def test_describe_tool_with_zero_flutes_omits_flute_text():
       result = describe_tool("Mill", diameter_inches=0.5, flutes=0)
       assert "flutes" not in result
   ```
4. You run it — it **fails** (Red). This proves the bug exists and the test is real.
5. You fix the code: change `if flutes:` to `if flutes is not None:` — but wait, that breaks it. Change to `if flutes:` — 0 is falsy, so it omits "0 flutes" already. Actually: is the bug that `describe_tool` shows "0 flutes," or is the bug that `flutes=0` is allowed at all?

Decide: `flutes=0` is meaningless for a cutting tool. The fix is in `ToolService.create_tool`:
```python
if flutes is not None and flutes <= 0:
    raise ValueError("flutes must be a positive integer or None")
```

6. Run the test — it **passes** (Green). The bug is fixed and can never silently return.

The regression test stays in the suite forever. If someone later changes the validation and accidentally re-allows `flutes=0`, the test will fail immediately.

---

## Step 6 — Two Tests You Should Add

Based on the code you have built so far, here are two gaps:

### Gap 1: `calculate_sfm` with extremely large values

Nobody has tested what happens at the limits. Add:

```python
# tests/test_sfm.py
def test_calculate_sfm_large_values_do_not_crash():
    # A 12" face mill at 1000 RPM — valid machining parameters
    result = calculate_sfm(diameter_inches=12.0, rpm=1000)
    assert result > 0
    assert isinstance(result, float)
```

This is not testing float arithmetic — it is documenting that large but realistic values are supported.

### Gap 2: `ToolService.create_tool` with a very long name

SQLite has no length limit by default, but your future Pydantic schema might impose one. Test the boundary now so you know what the current behavior is:

```python
def test_create_tool_with_long_name(tool_service):
    long_name = "A" * 500
    tool_id = tool_service.create_tool(
        name=long_name,
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )
    result = tool_service.get_tool(tool_id)
    assert result["name"] == long_name
```

This test currently *passes* — which tells you: no length limit is enforced. When you add Pydantic validation in Block 6, this test will fail, which is your cue to decide what the actual limit should be.

Add both tests and run the suite.

---

## Step 7 — SAVE AND TRY: Coverage

pytest has a coverage plugin. Install it:

```
pip install pytest-cov
```

Run:

```
pytest --cov=tooldb --cov-report=term-missing
```

The output shows:
- Which files were covered
- What percentage of lines ran
- Which specific lines were never executed (`term-missing` adds the line numbers)

Look at the "missing" lines. For each one, ask: "Is there a decision here that I should test?" If yes, add a test. If it is a one-liner that just returns a value, coverage is not the right metric there — move on.

---

## Concept Block — Coverage Is a Tool, Not a Goal

Coverage measures which lines ran during testing. 100% coverage does not mean the code is correct:

```python
def divide(a, b):
    return a / b

def test_divide():
    assert divide(10, 2) == 5  # 100% line coverage
```

This test achieves 100% line coverage but never tests `divide(10, 0)` — which raises `ZeroDivisionError`. The coverage metric is satisfied; the edge case is not.

Coverage is useful for finding *dead zones* — large areas of code with no tests at all. It is not useful as a target number. A project with 60% coverage on every *decision point* is safer than one with 90% coverage on trivial getters and 0% on validation logic.

---

## Challenge

Find a real gap in your test suite using this method:

1. Open any test file
2. Find a function that has tests for the normal case and at least one error case
3. Ask: is there an edge case not covered?
4. Write a test for it

Common edges not tested:
- Empty string for a required text field
- `flutes=1` (minimum non-None value)
- `diameter_inches=0.001` (minimum valid)
- `diameter_inches=24.0` (maximum valid, per `MAX_DIAMETER_INCHES`)
- What happens when `get_tools()` is called on a database with 1000 tools?

<details>
<summary>One example answer</summary>

`MAX_DIAMETER_INCHES = 24.0` is defined in `ToolService` but there is no test that verifies it is enforced. Here is the gap:

```python
def test_create_tool_rejects_diameter_above_maximum(tool_service):
    with pytest.raises(ValueError, match="diameter"):
        tool_service.create_tool(
            name="Giant Tool",
            diameter_inches=25.0,  # above MAX_DIAMETER_INCHES = 24.0
            material="carbide",
            tool_type="facemill",
        )
```

And the boundary case:

```python
def test_create_tool_accepts_maximum_diameter(tool_service):
    tool_id = tool_service.create_tool(
        name="Max Tool",
        diameter_inches=24.0,  # exactly at MAX_DIAMETER_INCHES
        material="carbide",
        tool_type="facemill",
    )
    assert tool_id >= 1
```

These two tests together document the boundary: 24.0 is valid, 25.0 is not.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Distinguish "my logic" from "the framework's logic" | |
| Identify at least one test in the suite that tests the framework | |
| Write a regression test by reproducing a bug before fixing it | |
| Use `pytest --cov` to see which lines are untested | |
| Explain why 100% coverage doesn't mean the code is correct | |
| Find an edge case in an existing function and write a test for it | |

---

## Quick Check Answers

1. **It is testing sqlite3's logic.** sqlite3 can definitely insert and retrieve a row — that is what a database does. This test can only fail if sqlite3 itself is broken, which is not your responsibility. The test adds maintenance cost with no benefit. Delete it.

2. **Before fixing the bug, write:** `assert "flutes" not in describe_tool("Mill", 0.5, flutes=0)`. Run it — it fails (Red). Now you have proof the bug exists and a test that will verify the fix. Fix the code, run the test — Green. The test stays in the suite and will catch any regression.

3. **Coverage is a measure of line execution, not correctness.** 95% coverage can be achieved by running every line once without asserting anything meaningful. The right question is not "what percentage of lines ran?" but "do we have tests for every decision and rule this code enforces?" A high-quality 70% beats a hollow 95%.
