# Lesson 6.13: Query Planning

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Two real scripts. The first recaps this curriculum's own Indexes lesson with one more real, verified query plan - `Part.part_number`'s own real index genuinely used, contrasted with the real `machine_id` scan that lesson already found. The second measures a real, classic ORM antipattern directly: fetching five real `Part` rows then asking, separately, for each one's own real `CAMFile`s produces six real SQL statements, where the identical logical result, asked for as one real `JOIN`, produces exactly one - a real, counted comparison, not an estimate.

**What you need to know first:** This curriculum's own Indexes lesson - `EXPLAIN QUERY PLAN`, and this project's own real, already-found missing index on `machine_id`; this curriculum's own Foreign Keys lesson - `Part.cam_files`'s own real relationship; this curriculum's own SQL lesson - a real `JOIN`.

## Terms used in this lesson

- **index (recap)** — Fully treated in this curriculum's own Indexes lesson - a real, separate, sorted structure a database keeps so a lookup can rule out most candidates at once instead of checking every row. Named again here specifically because a query plan's own real choices - this lesson's own subject - only make sense in terms of which real indexes actually exist for it to choose between.
- **query plan (recap)** — Fully treated in this curriculum's own Indexes lesson - the real, concrete steps a database engine actually decides to take to execute one specific statement, inspectable directly via SQLite's own `EXPLAIN QUERY PLAN`. Named again here because this lesson's own real N+1 finding is itself a fact about HOW a whole sequence of statements actually executes, not merely what each one, individually, returns.
- **N+1 queries** — A real, measurable pattern where fetching N parent rows, then separately asking for each one's own children one at a time, produces N+1 real round trips to the database - one for the parents, one MORE per parent - instead of the single real statement (typically a `JOIN`) that could answer the identical logical question at once. It exists as a named antipattern because it is easy to write by accident: ordinary, correct-looking code, one real loop over already-fetched parent rows, each iteration innocently asking for "this one's children," with nothing about the code itself hinting how many real, separate database round trips that loop actually costs.
- **database-side vs application-side processing** — The general, recurring choice this whole phase has already shown in several real, different shapes: whether the database itself computes an answer (a filtered `SELECT`, a `JOIN`, a `GROUP BY`) or the calling application fetches raw rows and computes the identical answer itself, in its own code. It exists as the single idea underneath several of this phase's own separate real findings - this curriculum's own Querying, Indexes, and SQL lessons, and this lesson's own N+1 finding - each one, in its own way, a real instance of the identical underlying choice.

## Objects and methods used

- **`sqlalchemy.event.listen (before_cursor_execute)`**
  - *What it is:* A real SQLAlchemy function that registers a callback to run every time the underlying database driver is about to execute one real SQL statement.
  - *Implementation:* `event.listen(engine, "before_cursor_execute", callback)` - `callback` is called once per real statement actually sent to the database, receiving (among other real arguments) the statement text itself; `event.remove(engine, "before_cursor_execute", callback)` un-registers it.
  - *Its use:* This lesson's own N+1 lab uses this to count, precisely, how many real SQL statements two different real access patterns actually execute - not an estimate, a real, exact number.
  - *Type:* A real SQLAlchemy function.
  - *Responsibility:* Making every real statement sent to the database observable from Python, without changing what any of them actually do.
  - *Depends on:* A real SQLAlchemy engine, and a callable to run per real statement.
  - *Connects to:* Registered once, before this lesson's own two real access patterns run, and removed once both have been measured.
  - *Shape:* Takes an engine, an event name, and a callback; returns nothing - its effect is entirely the side effect of the callback running on every real statement.

## Concept Unit: Indexes and Query Plans - One More Real, Verified Case

### The Problem

This curriculum's own Indexes lesson already found, via a real `EXPLAIN QUERY PLAN`, that filtering `MachineCAMPairing` by `machine_id` alone falls back to a full `SCAN`. `Part.part_number` is also declared with a real, dedicated `index=True`. Does filtering BY that real column actually get the real `SEARCH` treatment this project's own `machine_id` case was denied?

Before reading on:

- `Part.part_number` has its own real, dedicated index, unlike `MachineCAMPairing.machine_id`. Before running the lab below: do you expect `EXPLAIN QUERY PLAN` to report a `SCAN` or a `SEARCH` for a query filtering by it?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/part.py:218`, already cited in this curriculum's own Constraints and Indexes lessons: ``` part_number = db.Column(db.String(20), unique=True, nullable=False, index=True) ``` This unit runs the identical real diagnostic, `EXPLAIN QUERY PLAN`, already established in this curriculum's own Indexes lesson, against this real, dedicated index instead.
- **Files affected:** `verification/phase-06/lab_query_plan_recap.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

One real `Part`, its own real index checked directly:

**File:** `verification/phase-06/lab_query_plan_recap.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy import text

from app import create_app, db
from app.models.part import Part

app = create_app("testing")

with app.app_context():
    db.session.add(Part(id="P1", part_number="1234567", description="Bracket Assembly"))
    db.session.commit()

    print("real query plan: filtering parts by its own real, indexed part_number:")
    for row in db.session.execute(text("EXPLAIN QUERY PLAN SELECT * FROM parts WHERE part_number = '1234567'")):
        print(" ", row)
```

### Mechanical Walkthrough

- `EXPLAIN QUERY PLAN SELECT * FROM parts WHERE part_number = '1234567'` — The identical real SQLite diagnostic already established in this curriculum's own Indexes lesson, run here against `parts` instead of `machine_cam_pairings`.
- `SEARCH parts USING INDEX ix_parts_part_number (part_number=?)` — The real, literal text SQLite reports - a genuine `SEARCH`, using the real, named index this project's own real `index=True` declaration creates, unlike the `SCAN` this curriculum's own Indexes lesson already found for `machine_id`.

### CS Lens

Fully treated in this curriculum's own Indexes lesson - **indexes** and **query plans**, recapped here with a second, real, contrasting case: a `SEARCH`, not a `SCAN`.

### SE Lens

The design principle, already established in this curriculum's own Indexes lesson, is that a real index's own payoff depends on it actually existing for the column a real query filters by. The real, concrete difference this unit adds: `Part.part_number` earns a real `SEARCH` precisely because `index=True` was actually declared for it, unlike `MachineCAMPairing.machine_id`, which was not.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_query_plan_recap.py` — Run from the manufacturing-platform repository root, using this project's own real backend virtual environment.

### Verification

```text
Seeding default users...
real query plan: filtering parts by its own real, indexed part_number:
  (3, 0, 39, 'SEARCH parts USING INDEX ix_parts_part_number (part_number=?)')
```

Full saved run: `verification/phase-06/lab_query_plan_recap_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it recaps and extends this curriculum's own Indexes lesson; the next unit studies a real cost that is not about any ONE statement's own plan at all, but about how MANY statements a real access pattern produces.

## Concept Unit: N+1 Queries - A Real, Measured Query-Count Explosion

### The Problem

`Part.cam_files`, already fully studied in this curriculum's own Foreign Keys lesson, makes fetching one part's own CAM files a single, real, ordinary-looking line: `part.cam_files.all()`. If that line runs once per part, inside a loop over several already- fetched real parts, how many real, separate SQL statements does the whole loop actually cost - and does that match what the identical logical result would cost as one real `JOIN`?

Before reading on:

- Fetching 5 real parts is one real statement. If each part's own `cam_files.all()` is ALSO a separate, real statement, how many real statements total should the whole loop cost?
- This curriculum's own SQL lesson already ran a real `JOIN` returning the identical parts-and-cam-files data in one result. Before running the lab below: how many real statements should that take, compared to the loop?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/part.py:346`, already cited in this curriculum's own Foreign Keys and One-to- Many lessons: ``` cam_files = db.relationship('CAMFile', backref='part', lazy='dynamic') ``` This unit measures the real, exact number of SQL statements two different, real access patterns against this same relationship actually produce.
- **Files affected:** `verification/phase-06/lab_n_plus_one.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

Five real parts, five real CAM files, one per part - fetched two different real ways, each one's own real statement count measured directly:

**File:** `verification/phase-06/lab_n_plus_one.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy import event, text

from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile

app = create_app("testing")

with app.app_context():
    machine = Machine(id="m1", name="Haas VF-2", category="mill", sub_type="3_axis")
    db.session.add(machine)
    parts = [Part(id=f"P{i}", part_number=f"{i:07d}", description=f"Part {i}") for i in range(5)]
    db.session.add_all(parts)
    db.session.commit()
    for i, part in enumerate(parts):
        db.session.add(CAMFile(id=f"cf{i}", part_id=part.id, machine_id="m1", file_name=f"rev{i}.nc"))
    db.session.commit()

    query_count = 0

    def count_queries(conn, cursor, statement, parameters, context, executemany):
        global query_count
        query_count += 1

    event.listen(db.engine, "before_cursor_execute", count_queries)

    query_count = 0
    all_parts = Part.query.all()
    for part in all_parts:
        list(part.cam_files.all())
    print(f"N+1 pattern: {len(all_parts)} parts, {query_count} real SQL statements executed")

    query_count = 0
    rows = list(db.session.execute(text(
        "SELECT parts.id, cam_files.file_name FROM parts JOIN cam_files ON parts.id = cam_files.part_id"
    )))
    print(f"single JOIN: {len(rows)} rows, {query_count} real SQL statement executed")

    event.remove(db.engine, "before_cursor_execute", count_queries)
```

### Mechanical Walkthrough

- `event.listen(db.engine, "before_cursor_execute", count_queries)` — `sqlalchemy.event.listen`, fully treated in this lesson's own Header - registers `count_queries` to run once per real statement, so this lab can report an EXACT, measured count rather than an estimate.
- `all_parts = Part.query.all() / for part in all_parts: list(part.cam_files.all())` — One real statement fetches all 5 real parts; the `for` loop (basic Python) then calls `part.cam_files.all()` once per part, each call its OWN separate, real statement against the database - 5 more, for a real total of 6.
- `print(f"N+1 pattern: {len(all_parts)} parts, {query_count} real SQL statements executed")` — Reports the real, counted total - `6`, for `5` real parts - confirming the "N+1" name directly: N real parents, plus one more real statement per parent's own children, plus the original one fetching the parents themselves.
- `db.session.execute(text("... JOIN ..."))` — The identical real `JOIN` construct already fully treated in this curriculum's own SQL lesson, returning the identical logical data - which part goes with which CAM file - in one single real statement instead of six.

### Mental Model

```text
N+1 pattern                       single JOIN
------------                       -----------
SELECT * FROM parts     (1)         SELECT parts.id, cam_files.file_name
SELECT cam_files WHERE               FROM parts JOIN cam_files
  part_id = 'P0'        (2)          ON parts.id = cam_files.part_id  (1)
SELECT cam_files WHERE
  part_id = 'P1'        (3)
SELECT cam_files WHERE
  part_id = 'P2'        (4)
SELECT cam_files WHERE
  part_id = 'P3'        (5)
SELECT cam_files WHERE
  part_id = 'P4'        (6)

6 real round trips versus 1, for the identical logical result.
```

### CS Lens

This is the **N+1 queries** antipattern, fully named in this lesson's own Header - a real cost hidden inside ordinary-looking, correct code. Also recognized in: a web page making one request per thumbnail image instead of one batched request for all of them; a spreadsheet macro looking up a value in a separate sheet once per row instead of one combined lookup; a shopping cart checking inventory once per line item in a loop instead of one query for every item at once; and, in this project's own domain, this exact real measured cost - fetching a real part's own CAM files, one real database round trip at a time, for every real part a page needs to display.

### SE Lens

The design principle is that "how many real round trips does this cost" is a real, measurable property of code, not something a correct-looking loop guarantees stays small - the real alternative this unit already measured, a single `JOIN`, answers the identical logical question in one real round trip regardless of how many real parts exist. The honest cost of the loop-based version instead: it reads simply, one line per real idea ("for each part, get its CAM files"), and that same simplicity is exactly what hides the real, multiplying cost - a real database round trip, however small individually, adds real, cumulative latency the more real parents there are, in a way the code's own shape never hints at.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_n_plus_one.py` — Run from the repository root, using this project's own real backend virtual environment.

### Verification

```text
Seeding default users...
N+1 pattern: 5 parts, 6 real SQL statements executed
single JOIN: 5 rows, 1 real SQL statement executed
```

Full saved run: `verification/phase-06/lab_n_plus_one_output.txt`.

### Connection to the previous unit

The previous unit recapped a single real query's own plan; this unit measures a real cost that only appears across many real statements at once. The final unit names the general idea both units, and several earlier lessons, already share.

## Concept Unit: Database-Side vs Application-Side Processing - The Idea Underneath Every Earlier Finding

### The Problem

This curriculum's own Querying lesson measured a real, linear scan's own cost; its own Indexes lesson measured a real `SCAN` versus `SEARCH`; its own SQL lesson used real `GROUP BY`/aggregate functions instead of counting in Python; and this lesson's own previous unit just measured six real statements versus one. Are these four real, separately-discovered findings actually four different ideas, or the same one, found four different times?

Before reading on:

- This curriculum's own Querying lesson's own real lab scanned 200,000 synthetic records in Python. This lesson's own N+1 lab issued six real database round trips instead of one. Is the real cost in both cases coming from the SAME kind of decision - who does the work, the application or the database - or two unrelated problems that merely look similar?

### Project Change

- **Reference Source:** No new reference source - this unit names the single, general idea already demonstrated by four separate, real, already-cited findings across this curriculum: the Querying lesson's own linear- scan measurement, the Indexes lesson's own `SCAN`/`SEARCH` contrast, the SQL lesson's own `GROUP BY`/aggregate functions, and this lesson's own previous unit's real N+1 measurement.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - this unit synthesizes real findings already shown across this curriculum; no new file is added.
- **Dependencies:** None beyond what this curriculum's own earlier lessons already established.

### CS Lens

This is **database-side vs application-side processing**, fully named in this lesson's own Header - the single, general choice underneath every one of this phase's own separate real findings. Also recognized in: a spreadsheet's own built-in `SUMIF` versus exporting every row to a script that adds them up by hand; a search engine's own server-side ranking versus downloading every matching page and sorting them in the browser; a database index existing specifically so the database, not the application, decides where to look; and, in this project's own domain, every one of this phase's own four real, separately-discovered findings, each one a different real instance of the identical underlying choice.

### SE Lens

The design principle is recognizing these four real findings as one idea, not four unrelated coincidences: a linear scan in Python, a missing index forcing a real table `SCAN`, fetching every row to count categories by hand instead of `GROUP BY`, and six real round trips instead of one `JOIN` - every one of them is application code doing work the database was actually positioned to do directly, and every one of them was real, measured, and shown, not merely asserted. The honest cost on the other side, stated plainly across all four: pushing work to the database is not automatically free either - it depends on a real index actually existing (this curriculum's own Indexes lesson), a real query actually being shaped to use it (this lesson's own first unit), and a real statement actually being written to ask for the combined answer at once (this curriculum's own SQL lesson's own `JOIN`) - the database can only do the work the application actually asks it to do.

### Verification

This unit draws its own conclusion from four real findings already run, shown, and verified in this curriculum's own earlier lessons - it introduces no new code or claim that itself needs a fresh, separate run.

### Connection to the previous unit

The previous unit measured one more real instance of this exact idea; this unit names what all of them, together, actually are.

## Connect the pieces

Follow one real question - "which CAM files belong to which parts" - through every unit, and back through this whole phase. This lesson's own first unit confirmed `Part.part_number` earns a real `SEARCH` where `MachineCAMPairing.machine_id`, this curriculum's own Indexes lesson already found, does not. Its own second unit measured the identical logical question - which CAM files belong to which parts - costing 6 real statements looped one part at a time, or 1 real statement as a `JOIN`, this curriculum's own SQL lesson's own real construct. And its own third unit named what ties that finding to three earlier ones: a linear scan (Querying), a missing index (Indexes), and a hand-counted `GROUP BY` (SQL) are all the identical real choice, found four separate times across this entire phase - whether the database does the work, or the application does it instead, one real row at a time.

**Next lesson:** Next, the specific real database engine every one of this phase's own labs has actually been running against - SQLite itself - gets studied directly: what makes it different from a real client-server database, and what its own real, particular behaviors mean for this project, which uses it as its actual, current, real development database.