# Lesson M3.5: The Second Definition Wins, and the First Never Runs

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. This lesson's tests go into verification/mastercam-app-copy/mastercam-app/tests/, per this phase's rule - the real fix in mastercam-app/mastercam_app/db/database.py is yours to make once you've worked through this lesson, not something Claude writes.*

**What you will build:** A real test proving which of database.py's two identical search_by_tool_code definitions actually runs, and real, permanent tests locking in that method's correct behavior - so once you delete the dead first definition for real, these tests keep proving nothing broke.

**What you need to know first:** How Python classes are actually built - a class body executes top to bottom like any other code, and each `def` assigns a name in the class's namespace, the same as any other assignment.

## Terms used in this lesson

- **Class namespace** — The dict a class body builds as it executes - every def and assignment inside the class body sets a key in it. There's no special "duplicate name" error; a second def with the same name just overwrites the dict entry the first one created, silently.
- **__code__.co_firstlineno** — A real attribute every Python function object carries - the exact source line its def started on. Useful here specifically because it can answer "which of two identically-named definitions is the one actually bound to this name" without needing to read the whole file by eye.

## Objects and methods used

- **`Database.search_by_tool_code`**
  - *What it is:* Finds every real part/machine that used a given tool code
  - *Implementation:* mastercam_app/db/database.py:767 (the one that runs) - a dead, identical copy also exists at line 403
  - *Its use:* Called from the UI's tool-code search feature
  - *Type:* method
  - *Responsibility:* Query ta_parts joined to tas and parts, filtered by tool code
  - *Depends on:* self._conn, self._rows_to_list
  - *Connects to:* save_part, which is what populates the rows it searches
  - *Shape:* one JOIN query, then JSON-column deserialization

## Concept Unit: A grep Finds Two Definitions - Python Only Keeps One

### The Problem

grep -n "def search_by_tool_code" mastercam_app/db/database.py returns two real line numbers: 403 and 767. Before touching anything, the real question is which one actually runs when db.search_by_tool_code(...) is called - and whether the answer is even knowable without reading both bodies line by line.

Before reading on:

- A class body runs top to bottom, like a script. If it hits `def search_by_tool_code` at line 403 and then hits another `def search_by_tool_code` at line 767, what does the second one do to whatever the first one just set?
- Comparing the two real function bodies at those line numbers shows only a whitespace difference inside the SQL string (4-space vs 7-space continuation indent) - does that difference change which rows the query returns?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:403 and :767 - both real, identical-except-for-whitespace definitions of search_by_tool_code inside the same Database class.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_search_by_tool_code.py` (new)
- **Change type:** add
- **Location:** new test file
- **Dependencies:** mastercam_app.db.database.Database

### The New Code

A real test using __code__.co_firstlineno to answer "which definition is actually bound" mechanically, instead of trusting a read-through.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_search_by_tool_code.py` (new)

```python
from mastercam_app.db.database import Database


def test_only_the_second_definition_of_search_by_tool_code_is_reachable():
    assert Database.search_by_tool_code.__code__.co_firstlineno == 767
```

### Mechanical Walkthrough

- `Database.search_by_tool_code.__code__.co_firstlineno` — Database.search_by_tool_code is whatever function object is currently sitting under that name in the class's namespace - by the time the class body finishes executing, that's the *second* def, because the first one's entry was silently overwritten. co_firstlineno reads the real source line that surviving function object was defined on - 767, not 403 - proving which one actually runs without needing to trust a manual read.
- `asserts 767, not 403` — This is deliberately the more specific, falsifiable claim - not just "search_by_tool_code exists" but "line 767's version specifically is the one bound." If someone later reordered the two definitions, this exact test would start failing, which is correct: it's testing a fact about which one wins, and that fact would have genuinely changed.

### CS Lens

This is **name shadowing** at class-definition time - the same general phenomenon as a local variable shadowing an outer one, just happening inside a class body instead of nested scopes. The language gives no warning; the last assignment to a name always wins, whether that's `x = 1; x = 2` or two `def`s with the same name.

### SE Lens

The real alternative to grep-and-verify here is a linter - pyflakes and similar tools do flag redefinition of the same name in one scope. This codebase's test suite (Phase M1) doesn't currently run one, which is exactly why 26 identical lines of dead code sat here undetected - a real, concrete case for the value of that category of tool, not just for style.

### Commands needed

- `python -m pytest tests/test_database_search_by_tool_code.py::test_only_the_second_definition_of_search_by_tool_code_is_reachable -v` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
collected 1 item

tests/test_database_search_by_tool_code.py::test_only_the_second_definition_of_search_by_tool_code_is_reachable PASSED [100%]
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_search_by_tool_code_output.txt`.

### Connection to the previous unit

Lesson M3.2 already found one real gap between what this file claims and what it does (exceptions that never raise); this is a second, unrelated one, found the same way - by checking, not trusting the read-through.

## Concept Unit: Locking In the Real Behavior Before You Delete the Dead Copy

### The Problem

Deleting the first, dead definition should change nothing about real behavior - it's unreachable. Proving that requires a real test of what search_by_tool_code actually does today, so removing lines 403-429 for real can be checked against it afterward instead of trusted by eye.

Before reading on:

- The test below saves a real part with tool code 'T0101', then searches for 'T0101' - why does a search for a code that was never saved ('NOPE') matter as a second, separate test rather than being implied by the first passing?
- After you delete lines 403-429 in the real mastercam-app/mastercam_app/db/database.py, what real command would prove nothing broke?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:767-793 (the real, reachable search_by_tool_code), quoted verbatim - the query this lesson's tests actually exercise:
def search_by_tool_code(self, tool_code: str) -> List[dict]:
    """Find all parts/machines that used a given tool code."""
    q = f"%{tool_code.strip().upper()}%"
    cur = self._conn.execute(
        """SELECT ...
        FROM ta_parts tp
        JOIN tas t  ON tp.ta_number  = t.ta_number
        JOIN parts p ON tp.partnumber = p.partnumber
        WHERE UPPER(t.tool_code) LIKE ?
        ORDER BY tp.partnumber, tp.recorded_at DESC""",
        (q,)
    )
    ...
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_search_by_tool_code.py` (modified)
- **Change type:** add
- **Location:** end of test_database_search_by_tool_code.py
- **Dependencies:** Database, save_part from Lesson M3.1

### The New Code

Two real behavioral tests - a real match, and a real non-match.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_search_by_tool_code.py` (new)

```python
def test_search_by_tool_code_finds_a_real_saved_part_by_its_tool_code():
    db = Database(":memory:")
    part = {
        "partnumber": "P300",
        "rev": "A",
        "description": "Search Test Part",
        "machine": "HAAS-1",
        "sequences": [
            {
                "number": 1,
                "tool": {
                    "code": "T0101",
                    "comment": "1/2 EM",
                    "assembly": {
                        "ta_number": "TA0050",
                        "stick_out": "2.0",
                        "holder": {"name": "ER32"},
                    },
                },
                "operations": {},
            }
        ],
    }
    db.save_part(part)

    results = db.search_by_tool_code("T0101")

    assert len(results) == 1
    assert results[0]["partnumber"] == "P300"
    assert results[0]["ta_number"] == "TA0050"


def test_search_by_tool_code_returns_empty_for_a_code_that_was_never_saved():
    db = Database(":memory:")

    results = db.search_by_tool_code("NOPE")

    assert results == []
```

### Mechanical Walkthrough

- `db.save_part(part) then db.search_by_tool_code('T0101')` — This chains two real methods from two different lessons - save_part (M3.1) actually populates ta_parts and tas, and this test's real value is proving search_by_tool_code's JOIN correctly reconnects them, not just that the SQL is syntactically valid.
- `assert results == []` — Without this second test, a version of the query with a typo'd WHERE clause that matched *everything* regardless of tool_code would still pass the first test - it would just also return the row it shouldn't. This is the test that specifically rules that out.

### CS Lens

This pair is a **positive and negative case** - proving the function does the right thing on a match, and separately proving it doesn't do the wrong thing on a non-match. Either alone leaves a real gap a single bad implementation could slip through.

### SE Lens

The real alternative to writing these before deleting the dead code is deleting it first and trusting a manual smoke-test in the UI afterward. That's real risk for zero real benefit here - the fix itself is one 27-line deletion, but proving it's safe first costs only these two short tests, run in under a tenth of a second.

### Commands needed

- `python -m pytest tests/test_database_search_by_tool_code.py -v` — Run from verification/mastercam-app-copy/mastercam-app/, all three tests

### Verification

```text
collected 3 items

tests/test_database_search_by_tool_code.py::test_only_the_second_definition_of_search_by_tool_code_is_reachable PASSED [ 33%]
tests/test_database_search_by_tool_code.py::test_search_by_tool_code_finds_a_real_saved_part_by_its_tool_code PASSED [ 66%]
tests/test_database_search_by_tool_code.py::test_search_by_tool_code_returns_empty_for_a_code_that_was_never_saved PASSED [100%]

============================== 3 passed in 0.09s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_search_by_tool_code_output.txt`.

### Connection to the previous unit

The unit above proved which definition runs; this unit proves what it does - together, enough to delete mastercam-app/mastercam_app/db/database.py's real lines 403-429 for real and know immediately, from a real test run, whether anything changed.

## Connect the pieces

Trace tool code "T0101" through both units: co_firstlineno == 767 identifies which definition would run the query at all; the second unit's save_part-then-search proves that definition's JOIN actually reconnects "T0101" back to part P300 and TA0050, for real, before you touch the real file.

**Next lesson:** This closes Phase M3. The real fix - deleting mastercam-app/mastercam_app/db/database.py's dead first definition (lines 403-429) - is yours to make; re-run this lesson's three tests against the real app's own test suite afterward to confirm nothing changed. balloons.py (the ~900-line drawing-annotation subsystem) is real, separate scope for a future phase, not part of this one.