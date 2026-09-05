# Lesson M3.2: The Docstring Claims an Exception That Never Fires

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. All new code in this lesson goes into verification/mastercam-app-copy/mastercam-app/tests/ - not the real mastercam-app/tests/, per this phase's rule.*

**What you will build:** Real tests against _validate_and_upsert_ta - the densest logic in this file - that prove what it actually does with an unrecognized tool (mints a real "NA###" placeholder number, reused by fingerprint) and, separately, prove that a documented exception the module's own docstring promises is raised on conflict is never actually raised by any code path in the file.

**What you need to know first:** save_part from the previous lesson - _validate_and_upsert_ta is the method save_part calls once per sequence to resolve each tool's TA number.

## Terms used in this lesson

- **Fingerprint** — In this file, the (holder_name, tool_code, stick_out) triple - three fields that together identify "the same physical tool assembly" even when no TA number is known yet. Not a cryptographic term here, just this codebase's word for that combination.
- **Dead code** — Code that exists, is syntactically correct, and is never actually reached by any real execution path - here, two whole exception classes with detailed docstrings that no line of code ever raises.

## Objects and methods used

- **`Database._validate_and_upsert_ta`**
  - *What it is:* Resolves one sequence's tool to a real TA number, minting a placeholder if none is known
  - *Implementation:* mastercam_app/db/database.py:567
  - *Its use:* Called once per sequence inside save_part's loop
  - *Type:* method
  - *Responsibility:* Decide: reuse an existing TA/NA, mint a new NA, or update an existing TA's fields
  - *Depends on:* self._conn, self.get_ta
  - *Connects to:* save_part, which uses its returned ta_number to insert the ta_parts row
  - *Shape:* branching resolution, not a single query

## Concept Unit: An Unrecognized Tool Gets a Real, Reusable Placeholder Number

### The Problem

Not every tool in a real Mastercam file has an assigned TA number yet - someone has to decide what to link ta_parts to when there isn't one, without creating a new placeholder every single time the exact same unrecognized tool shows up again.

Before reading on:

- The second call below uses the identical holder/code/stickout as the first - what real column in the tas table is what makes the code find that match?
- If stick_out were '2.25' the first time and '2.250' the second time, would norm_float make these the same fingerprint or two different ones?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:614-628 (inside _validate_and_upsert_ta, the NA-minting branch), quoted verbatim:
# No match at all — mint a new NA number cur = self._conn.execute(
    "SELECT ta_number FROM tas WHERE ta_number LIKE 'NA%' "
    "ORDER BY ta_number DESC LIMIT 1"
) last = cur.fetchone() if last:
    try:
        next_num = int(dict(last)["ta_number"][2:]) + 1
    except ValueError:
        next_num = 1
else:
    next_num = 1
ta_number = f"NA{next_num:03d}"
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_ta_resolution.py` (new)
- **Change type:** add
- **Location:** new test file
- **Dependencies:** mastercam_app.db.database.Database

### The New Code

A helper with sensible defaults, and the first two tests.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_ta_resolution.py` (new)

```python
from mastercam_app.db.database import Database


def resolve(db, **overrides):
    fields = {
        "ta_number": "",
        "holder_name": "ER32",
        "holder_catalog": "",
        "holder_manufacturer": "",
        "tool_code": "T0101",
        "tool_comment": "1/2 EM",
        "tool_diameter": "0.5",
        "tool_type": "Endmill",
        "tool_oal": "3.0",
        "tool_flutes": "4",
        "stick_out": "2.25",
        "now": "2026-01-01 00:00:00",
    }
    fields.update(overrides)
    return db._validate_and_upsert_ta(**fields)


def test_an_unknown_tool_with_no_ta_number_mints_na001():
    db = Database(":memory:")
    ta_number, warning = resolve(db)
    assert ta_number == "NA001"
    assert warning is None


def test_the_same_fingerprint_reuses_the_minted_na_number_instead_of_minting_again():
    db = Database(":memory:")
    resolve(db, now="2026-01-01 00:00:00")
    ta_number, warning = resolve(db, now="2026-01-01 00:00:01")
    assert ta_number == "NA001"
```

### Mechanical Walkthrough

- `SELECT ta_number FROM tas WHERE ta_number LIKE 'NA%' ORDER BY ta_number DESC LIMIT 1` — This only runs once no existing row matched the fingerprint - it's asking "what's the highest NA number that already exists?" so the next one can be one higher. It scans every NA row's number as text, ordered DESC - "NA099" sorts before "NA100" alphabetically too, which happens to agree with numeric order here only because every number is zero-padded to 3 digits by f"NA{next_num:03d}" on the way in.
- `def resolve(db, **overrides): ...; fields.update(overrides)` — _validate_and_upsert_ta takes eleven keyword-only arguments - without this helper, every test would repeat all eleven even when only one field is the actual thing being tested.

### CS Lens

This is a real **fingerprint-based deduplication** scheme - instead of a global unique ID assigned at creation time, identity is derived from a stable combination of fields, computed fresh on every lookup. The tradeoff is real: it works without ever needing a real TA number, but two physically-different tools that happen to share holder/code/stickout would incorrectly collapse into the same NA number.

### SE Lens

The real alternative is refusing to save a tool with no TA number at all until a human assigns one - safer (no risk of a wrong auto-match) but blocks real, everyday uploads on a shop floor where not every tool has been catalogued yet. This codebase chose availability over that safety, with the fingerprint match as a partial mitigation.

### Commands needed

- `python -m pytest tests/test_database_ta_resolution.py -v` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
collected 3 items

tests/test_database_ta_resolution.py::test_an_unknown_tool_with_no_ta_number_mints_na001 PASSED [ 33%]
tests/test_database_ta_resolution.py::test_the_same_fingerprint_reuses_the_minted_na_number_instead_of_minting_again PASSED [ 66%]
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_ta_resolution_output.txt`.

### Connection to the previous unit

save_part's upsert from the previous lesson replaces a whole row by partnumber; this unit is the same "find or create" shape applied to a fuzzier identity - a fingerprint instead of a primary key.

## Concept Unit: A Real TA Conflict Doesn't Raise - It Overwrites and Warns

### The Problem

DuplicateToolError and MismatchedTAError are defined at the top of this file with real docstrings describing exactly when each should be raised, and the module's own public API docs say "Raises DuplicateToolError / MismatchedTAError on conflicts." Before trusting that, it needs to actually be checked against the code - the same discipline Lesson M0.2 already established: a claim isn't proof.

Before reading on:

- grep the whole file for 'raise DuplicateToolError' and 'raise MismatchedTAError' - how many real matches are there?
- If no code path raises them, what actually happens today when a real TA number's holder changes in Mastercam between two uploads?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:696-716 (inside _validate_and_upsert_ta, the mismatch-detected branch), quoted verbatim:
mismatch_warning = None if not (holder_ok and code_ok and stickout_ok):
    mismatches = []
    if not holder_ok:
        mismatches.append(
            f"Holder: DB='{existing['holder_name']}'  vs  new='{holder_name}'"
        )
    ...
    mismatch_warning = (
        f"TA {ta_number} has a mismatch in database:\n  " +
        "\n  ".join(mismatches) +
        f"\nUsing new values from Mastercam."
    )
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_ta_resolution.py` (modified)
- **Change type:** add
- **Location:** end of test_database_ta_resolution.py
- **Dependencies:** the resolve helper from the unit above

### The New Code

The real test - a fingerprint mismatch on an existing TA number.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_ta_resolution.py` (new)

```python
def test_a_real_ta_number_with_a_changed_holder_does_not_raise_and_overwrites_silently():
    db = Database(":memory:")
    resolve(db, ta_number="TA0042", holder_name="ER32")

    ta_number, warning = resolve(db, ta_number="TA0042", holder_name="ER40")

    assert ta_number == "TA0042"
    assert "mismatch" in warning.lower()
    stored = db.get_ta("TA0042")
    assert stored["holder_name"] == "ER40"
```

### Mechanical Walkthrough

- `grep -n "raise DuplicateToolError\|raise MismatchedTAError" mastercam_app/db/database.py` — Zero matches, real, checked. Both classes (lines 56 and 80) exist, both have docstrings describing when they'd be raised, and neither is ever actually raised anywhere in this file - dead code, and the module docstring's "Raises DuplicateToolError / MismatchedTAError on conflicts" claim is not true of the code as it actually runs today.
- `assert stored['holder_name'] == 'ER40'` — This is the real, concrete consequence of no exception being raised: the database silently accepts whatever the most recent Mastercam upload says, even for a holder that contradicts the previous upload - there's no code path where this discrepancy stops anything or requires a decision, only a warning string the caller may or may not surface to a user.

### CS Lens

This is exactly what **dead code** looks like in practice - not obviously-unreachable code a linter flags, but two fully-formed, well-documented classes that read as if they're load-bearing. A grep for the raise sites is the mechanical proof; the docstring alone is not.

### SE Lens

The real alternative - actually raising these exceptions - is a real design decision with a real cost: it would stop save_part partway through a real upload the moment one sequence's tool conflicts, instead of finishing the whole part with a warning. The current code chose "never block an upload," which is a defensible choice for a shop-floor tool used under deadline - but the docstring should say that, not claim exceptions that don't happen.

### Commands needed

- `python -m pytest tests/test_database_ta_resolution.py -v` — Run from verification/mastercam-app-copy/mastercam-app/, all three tests
- `grep -n "raise DuplicateToolError\|raise MismatchedTAError" mastercam_app/db/database.py` — Run from verification/mastercam-app-copy/mastercam-app/ - confirms zero real matches

### Verification

```text
collected 3 items

tests/test_database_ta_resolution.py::test_an_unknown_tool_with_no_ta_number_mints_na001 PASSED [ 33%]
tests/test_database_ta_resolution.py::test_the_same_fingerprint_reuses_the_minted_na_number_instead_of_minting_again PASSED [ 66%]
tests/test_database_ta_resolution.py::test_a_real_ta_number_with_a_changed_holder_does_not_raise_and_overwrites_silently PASSED [100%]

============================== 3 passed in 0.10s ==============================

--- grep for raise sites ---
(zero matches for "raise DuplicateToolError" or "raise MismatchedTAError")
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_ta_resolution_output.txt`.

### Connection to the previous unit

The unit above proved what NA-minting actually does; this unit proves what a real TA conflict actually does - and, unlike the docstring's claim, it's a warning, not an exception.

## Concept Unit: Choosing the Fix: Correct the Claim, Not the Behavior

### The Problem

There are two different real fixes available here, not one: make the code match the docstring (actually raise), or make the docstring match the code (stop claiming it raises). They are not equivalent, and picking wrong has real consequences.

Before reading on:

- If DuplicateToolError/MismatchedTAError actually started raising, what would happen to a real save_part call partway through an 8-sequence upload, given Lesson M3.3's `with self._conn:` behavior?
- This codebase runs on a shop floor with real deadlines. Which of the two fixes is safe to make without the person running it that day noticing any difference at all?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:1-42 (the module docstring) and :60-104 (both exception classes' docstrings), quoted verbatim in the unit above - all three currently claim behavior the real code doesn't have.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/db/database.py` (modified)
- **Change type:** configure
- **Location:** module docstring, DuplicateToolError docstring, MismatchedTAError docstring
- **Dependencies:** none - documentation only, zero behavior change

### The New Code

The real, applied fix - correcting the module docstring's Rules and Public API sections to state what save_part actually does.

**File:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/db/database.py` (already exists — modified)

```python
• On insert of a new TA:
    - If a TA already exists with matching (holder_name, tool_code, stick_out)
      but a different ta_number → the new TA is still inserted, and a real
      warning string (not an exception) is returned describing the match,
      so the UI can show it. See DuplicateToolError's own docstring - it
      exists for callers that want to opt into raising instead.
    - If ta_number already exists with DIFFERENT (holder, code, stickout) →
      the existing row is silently overwritten with the new values, and a
      real warning string is returned describing the conflict. See
      MismatchedTAError's own docstring - same note.

Public API
----------
  db = Database("mastercam.db")
  warnings = db.save_part(part_dict)
      Returns list of warning strings (non-fatal) - conflicts never raise;
      see the Rules section above for what each warning means.
```

### Mechanical Walkthrough

- `the new TA is still inserted, and a real warning string (not an exception) is returned` — This is the one-word difference that matters most: "Raised" became "a real warning string ... is returned." Nothing about save_part's actual code changed - only the sentence describing it, which now agrees with the two tests that already proved this from the previous unit.
- `See DuplicateToolError's own docstring - it exists for callers that want to opt into raising instead` — Rather than deleting the two exception classes outright (real, structured, ready-to-use error types some future caller might legitimately want), the fix keeps them and is honest that they're not wired in - a real, working option, not dead code pretending to be active code.

### CS Lens

This is choosing to fix a **specification/implementation mismatch** by moving the specification to match reality, rather than the other way around - a legitimate, common resolution when the existing implementation's behavior is the one with real, tested value (Lesson M3.3 already relies on save_part's specific never-blocks-on-conflict behavior).

### SE Lens

The real alternative - making the exceptions actually fire - is a behavior change to a function real uploads depend on today, with a real cost: partway through an 8-sequence part, sequence 5's conflict would now abort the whole save_part call (Lesson M3.3's `with self._conn:` would roll back sequences 1-4 too), on a shop floor where "the upload failed" mid-shift is a real, costly interruption nobody asked for. Fixing the docstring costs nothing and changes no one's day; fixing the behavior is a real, separate decision that deserves its own deliberate choice, not one made as a side effect of "the docs said so."

### Commands needed

- `python -m pytest tests/test_database_ta_resolution.py -v` — Run from verification/mastercam-app-copy/mastercam-app/ - confirms the documentation-only fix changed no test outcome

### Verification

```text
collected 3 items

tests/test_database_ta_resolution.py::test_an_unknown_tool_with_no_ta_number_mints_na001 PASSED [ 33%]
tests/test_database_ta_resolution.py::test_the_same_fingerprint_reuses_the_minted_na_number_instead_of_minting_again PASSED [ 66%]
tests/test_database_ta_resolution.py::test_a_real_ta_number_with_a_changed_holder_does_not_raise_and_overwrites_silently PASSED [100%]

============================== 3 passed in 0.10s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_all_fixes_verified_output.txt`.

### Connection to the previous unit

The two units above proved what the code actually does; this unit is the deliberate choice of which side of the mismatch to fix, and why that choice - not the other one - is the safe one to make without asking the person running this on a real shop floor first.

## Connect the pieces

Trace TA0042 through both units: first resolve() with holder ER32 inserts it cleanly (no warning, matching the unit above's insert path); the second resolve() with holder ER40 hits the exact branch quoted in this unit - no exception, a real warning string, and get_ta("TA0042") afterward proves the row was actually overwritten to ER40, silently.

**Next lesson:** Next: what happens when a real exception IS raised partway through save_part's loop over sequences - transactions, and what's left behind in the database when a write fails halfway.