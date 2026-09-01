# Lesson 0.8: Reproduce Before You Touch

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, small, safe reproduction of a real migration file's own SQL, run twice against two different real (but throwaway) SQLite databases, to settle exactly what it does when actually executed - rather than trusting a plausible guess about SQL syntax. The transferable problem: a hunch about what broken code will do, even a well-reasoned one, is not evidence - only actually running it is, and a wrong hunch can be wrong in a way that only running it reveals.

**What you need to know first:** Reading real, existing source as a starting hypothesis rather than a settled fact; that different real database engines don't all accept identical SQL syntax.

## Terms used in this lesson

- **SQL dialect** — The specific real variant of SQL syntax one particular database engine actually accepts - PostgreSQL, MySQL, and SQLite each support a real, overlapping but not identical grammar. It exists because "valid SQL" isn't one single fixed standard every engine implements identically; code written and tested against one real engine can be syntactically invalid against a different real one, even when the underlying intent (add two columns to a table) is the same.

## Objects and methods used

- **`sqlite3.OperationalError`**
  - *What it is:* The real exception SQLite's Python driver raises when a database operation can't be carried out as requested.
  - *Implementation:* A class, in Python's standard library `sqlite3` module - raised, not constructed directly by calling code.
  - *Its use:* This lesson's lab catches it to see exactly what SQLite itself reports when a real, broken migration statement is actually run - rather than guessing at the message from reading the SQL alone.
  - *Type:* A class (an `Exception` subclass), in Python's standard library `sqlite3` module.
  - *Responsibility:* Represent, as one real exception type, a broad real category of failure - a malformed SQL statement, a reference to a table that doesn't exist, and other real problems SQLite detects while trying to carry out a statement - with the specific real reason given in the exception's own message text, not encoded in a separate, more specific exception type per cause.
  - *Depends on:* Being raised by a real `sqlite3.Connection.execute` call that SQLite itself rejects.
  - *Connects to:* Caught directly in this lesson's own `except` blocks; its message is read via `str(e)`, the same pattern already used investigating `PDMService.download_file`'s own fallback.
  - *Shape:* Carries one real, human-readable message string describing what specifically went wrong - this lesson's own real evidence shows that message text is not fixed for "a broken multi-column ALTER TABLE" in general; it depends on what else about the statement SQLite happens to check first.

## Concept Unit: What Actually Happens When This Runs - Predicted, Then Checked

### The Problem

`backend/migrations/20260111_132000_add_program_number_to_sequences.py`'s real `upgrade()` function runs one real SQL statement - `ALTER TABLE sequences ADD COLUMN program_number VARCHAR(20), ADD COLUMN nc_file VARCHAR(100)` - a single `ALTER TABLE` naming two column additions, separated by a comma. That comma-separated form is real, valid syntax in PostgreSQL and MySQL. This application's own real, configured database, per `config.py`, is SQLite. Reading the SQL suggests it might fail against SQLite - but reading it doesn't say exactly how, and a real habit of verifying claims by running them means settling that with a real run, not a confident guess.

Before reading on:

- Before running anything: if this statement fails against SQLite, do you expect the same real failure regardless of whether a real `sequences` table already exists to run it against - or could SQLite check something else about the statement first, depending on what's actually there? Make a real prediction before reading on.
- If your prediction turns out wrong, what does that tell you about trusting a plausible-sounding guess over actually running the statement?

### Project Change

- **Reference Source:** `backend/migrations/20260111_132000_add_program_number_to_sequences.py`, read in full this session - its real `upgrade()` function (lines 11-20) runs exactly this comma-separated `ALTER TABLE` statement.
- **Files affected:** `verification/phase-00/lab_reproduce_broken_migration.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's standard library `sqlite3` module only - no real project database file is touched.

Rather than reason about whether this SQL is valid, this unit runs the exact real statement twice, against two different real (throwaway, in-memory) SQLite databases - one with no `sequences` table at all, one with a minimal real one - to see what SQLite itself actually reports in each real case.

### The New Code

New code, typed into a new throwaway file - the whole file at once, since there's no existing structure to return to for something this small:

**File:** `verification/phase-00/lab_reproduce_broken_migration.py` (new)

```python
import sqlite3

BROKEN_SQL = """
    ALTER TABLE sequences
    ADD COLUMN program_number VARCHAR(20),
    ADD COLUMN nc_file VARCHAR(100)
"""

print("Run 1: against an empty in-memory database (no sequences table)")
conn = sqlite3.connect(":memory:")
try:
    conn.execute(BROKEN_SQL)
    print("  succeeded (unexpected)")
except sqlite3.OperationalError as e:
    print(f"  sqlite3.OperationalError: {e}")
conn.close()

print()
print("Run 2: against an in-memory database with a real sequences table")
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE sequences (id TEXT PRIMARY KEY)")
try:
    conn.execute(BROKEN_SQL)
    print("  succeeded (unexpected)")
except sqlite3.OperationalError as e:
    print(f"  sqlite3.OperationalError: {e}")
conn.close()
```

### Mechanical Walkthrough

- `BROKEN_SQL = """..."""` — The exact real SQL text from the real migration file's own `upgrade()` function, unchanged - a triple-quoted string (basic Python), so the real statement can be run more than once without retyping it.
- `conn = sqlite3.connect(":memory:")` — Opens a real SQLite connection to a throwaway, in-memory database that exists only for this run and touches no real file on disk at all - safe to run repeatedly, and nowhere near this application's own real, working database.
- `conn.execute(BROKEN_SQL)` — Actually runs the real, unmodified broken statement against this real (if empty) SQLite database - not a simulation, a genuine attempt SQLite itself evaluates.
- `except sqlite3.OperationalError as e: print(f"  sqlite3.OperationalError: {e}")` — Catches the real exception SQLite's driver raises and prints its own real message text - `str(e)`, implicit in the f-string (basic Python) - rather than assuming what it would say.
- `conn.execute("CREATE TABLE sequences (id TEXT PRIMARY KEY)")` — Before the second real run, creates a minimal real `sequences` table - just enough for the table to genuinely exist, not a copy of this application's real schema - so the second run's real result can be compared against the first.

### CS Lens

This is empirical verification: settling a claim by actually executing it and observing the real result, rather than reasoning about what "should" happen. The same idea recurs as a scientist running a controlled experiment instead of trusting a prediction, a debugger sitting a breakpoint at the exact line in question instead of guessing which line is at fault, and a hardware engineer testing a chip's real behavior on the bench instead of trusting the schematic alone - in every case, a real run is evidence a plausible account of the mechanism, however well-reasoned, is not.

### SE Lens

The real alternative not chosen: predicting the failure mode from reading the SQL and SQLite's known grammar, and writing a fix based on that prediction directly. The real, honest cost of that shortcut, made visible by this unit's own two real runs: the two runs report genuinely different real messages - `"no such table: sequences"` against the empty database, `"near \",\": syntax error"` against the one with a real table - meaning a fix aimed at "no such table" (checking existence first) would have been aimed at the wrong real problem for this migration's actual, intended use, where the table already exists. Only running both real cases revealed that the failure mode itself depends on state that reading the SQL alone can't tell you.

### Commands needed

- `python verification/phase-00/lab_reproduce_broken_migration.py` — Run from the manufacturing-platform repository root - though this particular script has no real dependency on that location, since it never opens a real file, only two throwaway `:memory:` databases.

### Verification

```text
Run 1: against an empty in-memory database (no sequences table)
  sqlite3.OperationalError: no such table: sequences

Run 2: against an in-memory database with a real sequences table
  sqlite3.OperationalError: near ",": syntax error
```

Full saved run: `verification/phase-00/lab_reproduce_broken_migration_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first and only unit in this lesson.

## Connect the pieces

One real, broken migration statement, run twice instead of read once: `backend/migrations/20260111_132000_add_program_number_to_sequences.py`'s real comma-separated `ALTER TABLE` fails against SQLite either way - but which real message it fails with, `"no such table: sequences"` or `"near \",\": syntax error"`, depends on real state (whether a `sequences` table exists) that reading the SQL statement alone never revealed. A prediction made from the SQL alone, however reasonable, would have had a real, even chance of describing the wrong actual failure - only running it, safely, against a real but throwaway database, settled which one this application's own real migration history actually hit.

**Next lesson:** Turning every habit built so far - verify instead of recall, trace real callers instead of trusting a name, read real control flow instead of a docstring, reproduce instead of predict - on this same application's own real, still-unresolved problems, to see exactly what they can and can't yet explain.