# Lesson 17: Managing Database Changes Safely

**What you will build**
A SQLAlchemy model for `members`, and a real Alembic migration that finally adds the `UNIQUE` constraint Lesson 13 flagged as a known gap — applied to an existing database with real rows, without deleting anything. The problem we're solving: every schema change so far has assumed you can just delete `social.db` and let `init_db()` recreate it. A production system with real user data can never do that — this lesson is about the tool that makes schema changes safe when data already exists.

**What you need to know first**
Lesson 13 (the flagged `UNIQUE` gap). Lesson 16 (Repository pattern — today extends the same "stop hand-writing this by hand" instinct to schema itself).

---

## Concept Unit: Schema as Python, Not Strings

### The Problem

Every table so far is a hand-written SQL string inside `init_db()`. Nothing checks that string for correctness until it actually runs. Worse, nothing anywhere records *what the schema currently looks like* versus *what it should look like* — which is exactly the information a tool would need to generate the specific change from one to the other.

### Introduce the concept in isolation

Create `lab_sqlalchemy.py`:

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True)
    text = Column(String, nullable=False)

engine = create_engine("sqlite:///lab.db")
Base.metadata.create_all(engine)

print(Note.__table__.columns.keys())
```

Run it:

```bash
python lab_sqlalchemy.py
```

Output:

```text
['id', 'text']
```

*What this proves:* `Note` is a normal Python class, but `Base.metadata.create_all(engine)` was able to generate and run a real `CREATE TABLE` statement from it — nothing here is a SQL string you wrote by hand. `Note.__table__.columns.keys()` proves the class itself *is* the source of truth for the schema; SQLAlchemy read the class definition and derived the table structure from it, the reverse direction of everything built so far.

### Explain the mechanism

This is an **ORM** (Object-Relational Mapper) — the thing named back in Lesson 7's CS Lens as the standard fix for the relational-to-hierarchical mismatch, now actually in use. `Column(Integer, primary_key=True)` and `Column(String, nullable=False)` are Python objects describing a column's type and constraints; SQLAlchemy translates that description into the appropriate `CREATE TABLE` SQL for whatever database engine you're using (SQLite here, but the same model class would generate different, correct SQL for PostgreSQL without changes). The Python class is authoritative; the SQL is generated from it, not written by hand.

### Discard the throwaway example

Delete `lab_sqlalchemy.py` and `lab.db`. Define the real `Member` model — the specific table this lesson needs to safely modify.

### Project Change

* **Files affected:** Create `models.py`.
* **Change type:** Add.
* **Dependencies:** `sqlalchemy`, `alembic`.

### The New Code

```python
# models.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False, unique=True)
    role = Column(String, nullable=False, default="member")
```

### Mechanical walkthrough

1. `unique=True`: (first appearance in model form, already-established *concept* from Lesson 13's `UNIQUE`). Declares, in the model, the exact constraint the raw SQL in `db.py` already states for *new* databases — but this model is what a migration tool can compare against an *existing* database to detect the gap.
2. Only `Member` is modeled here, deliberately, not every table: (worth naming honestly). Rewriting all fourteen-plus tables into SQLAlchemy models in one lesson would be a large, risky, all-or-nothing change — the kind of big-bang rewrite that's genuinely more dangerous than the incremental approach this whole curriculum has followed. `db.py`'s raw SQL keeps running everything else for now; `models.py` grows table by table, as each one actually needs Alembic's capabilities.

### CS Lens

**A model is a declarative description, not an imperative instruction.** `CREATE TABLE members (...)` is imperative — "do this specific action, now, in this order." `class Member(Base): ...` is declarative — "this is what a member row's shape *is*," leaving *how* to achieve or reconcile that shape (create it, alter it, leave it alone) to the tool reading the description. This distinction is exactly why a model can be diffed against reality; a hardcoded SQL string cannot be diffed against anything, it can only be re-run or not.

### SE Lens

**Incremental adoption of a new approach beats an all-at-once rewrite.** Keeping `db.py`'s raw SQL running for tables not yet modeled, while introducing `models.py` and Alembic for the one table that needs them right now, is a deliberate choice to reduce risk — the same instinct behind every vertical slice this whole project has been built with, applied here to infrastructure instead of features.

---

## Concept Unit: Alembic — Versioned, Data-Safe Migrations

### The Problem

Even with `Member` as a model, we still need something that (1) knows what the *actual* database currently looks like, (2) compares it against the model, (3) generates the *specific* `ALTER` statement needed to close the gap, and (4) applies it without touching existing rows.

### The failing test

```python
def test_duplicate_username_rejected_by_database_constraint():
    conn = get_connection()
    conn.execute("PRAGMA foreign_keys = OFF")  # isolate this test to the constraint itself
    try:
        conn.execute("INSERT INTO members (username) VALUES ('duplicate_test')")
        conn.commit()
        with pytest.raises(sqlite3.IntegrityError):
            conn.execute("INSERT INTO members (username) VALUES ('duplicate_test')")
            conn.commit()
    finally:
        conn.close()
```

Run it against the project's existing `social.db` (already populated from earlier lessons, standing in for "real production data" for this lesson's purpose):

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_duplicate_username_rejected_by_database_constraint
DID NOT RAISE sqlite3.IntegrityError
```

*Why this fails:* exactly the gap Lesson 13 named — this database was created before the `UNIQUE` constraint existed in `db.py`'s `CREATE TABLE IF NOT EXISTS`, which does nothing for a table that already exists.

### Set up Alembic

```bash
pip install alembic
alembic init migrations
```

This creates a `migrations/` directory and `alembic.ini`. Point `migrations/env.py` at `models.py`'s `Base.metadata` (the standard Alembic setup step — one line changed in the generated file, connecting Alembic to your models as its source of truth) and at the same `social.db` used throughout this project.

### Generate a migration

```bash
alembic revision --autogenerate -m "add unique constraint to members username"
```

Output (a new file appears under `migrations/versions/`):

```text
Generating migrations/versions/a1b2c3_add_unique_constraint_to_members_username.py ... done
```

Open the generated file — abridged to the relevant part:

```python
def upgrade():
    with op.batch_alter_table("members") as batch_op:
        batch_op.create_unique_constraint("uq_members_username", ["username"])

def downgrade():
    with op.batch_alter_table("members") as batch_op:
        batch_op.drop_constraint("uq_members_username", type_="unique")
```

*What this proves, before running anything:* Alembic compared `Member`'s model (which says `unique=True`) against the actual `social.db` schema (which doesn't have that constraint yet), and generated the *exact*, minimal change needed — nothing about existing rows is touched, only the table's constraint definition. `downgrade()` is the same change in reverse, generated automatically alongside `upgrade()`.

### Apply it

```bash
alembic upgrade head
```

```text
Running upgrade  -> a1b2c3, add unique constraint to members username
```

### Mechanical walkthrough

1. `alembic revision --autogenerate`: (first appearance). Diffs the model against the live database schema and writes a migration file — a real, editable Python script, not a black box; you're expected to read it before running it, which is why it was shown above before `upgrade`.
2. `op.batch_alter_table`: (first appearance). SQLite, specifically, doesn't support `ALTER TABLE ADD CONSTRAINT` directly the way some other databases do — Alembic's "batch" mode works around this by creating a new table with the desired structure, copying existing rows into it, and swapping it in, all inside one transaction. This is worth knowing exists, even without needing to hand-write it: the tool is handling a real database-specific limitation you'd otherwise have to solve by hand, matching the manual "delete and recreate" workaround this project has been using since Lesson 13 — except now done safely, preserving every existing row, inside a transaction.
3. `alembic upgrade head`: (first appearance). Applies every migration not yet applied, in order, up to the latest ("head") — tracked in a table Alembic maintains inside the database itself, so it always knows exactly which migrations have already run.

### CS Lens

**Migrations as a versioned, ordered log of schema changes — the same idea as version control, applied to a database's structure.** Each migration file is a discrete, ordered step, with an explicit forward (`upgrade`) and backward (`downgrade`) direction — directly analogous to a commit and its revert. Alembic's internal tracking table is essentially "which commits have been applied here," the schema equivalent of a git branch's current position.

### SE Lens

**Migrations are code, and deserve the same scrutiny as any other code change — never trust autogenerate blindly.** `--autogenerate` is a starting draft, not a guarantee of correctness — it can miss changes it doesn't know how to detect, or generate a technically-correct-but-data-destructive migration for a more complex change than a simple constraint addition (e.g., splitting one column into two requires a human decision about how to move the data, which no diffing tool can infer). Reading the generated file before running `upgrade` — as this lesson did — is not optional caution, it's the actual practice.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 24 items

tests/test_api.py ........................                               [100%]

============================== 24 passed in 0.26s ===============================
```

### Connecting sentence

The schema is now safely, reversibly versioned for `members`. The next lesson addresses a different kind of fragility — the tests themselves currently run against the same real `social.db` file every other lesson has mutated, meaning test data and real data have been silently mixing since Lesson 1.

---

## Closing

**Connect the pieces**
`Member`'s SQLAlchemy model declares `unique=True`; Alembic compared that declaration against the actual, already-populated `social.db`, generated a migration using SQLite's batch-table-rebuild workaround, and applied it — closing Lesson 13's exact gap without deleting a single existing row, which the project's prior "just delete `social.db`" approach could never have done safely once real data existed.

**What breaks without this**
Without a migration tool, the only ways to add a constraint to an existing table are: delete all the data (unacceptable once real users exist), or hand-write the exact `CREATE TABLE` + `INSERT INTO ... SELECT` + rename dance Alembic's batch mode just did automatically — correctly, but easy to get subtly wrong by hand, especially under time pressure with production data on the line.

**Exercises**
1. Model `Post` in `models.py` (mirroring `Member`'s pattern) and generate a migration adding an index on `posts.created_at`, matching Lesson 5's manual choice not to index it — decide, and justify in a sentence, whether that index would actually be worth adding now.
2. Run `alembic downgrade -1` after this lesson's migration, confirm (via `EXPLAIN QUERY PLAN` or attempting a duplicate insert) the constraint is genuinely gone, then `alembic upgrade head` again to restore it — proving `downgrade` isn't just generated, but correct.

**Definition of Done**
* [x] `Member` modeled in SQLAlchemy as `models.py`'s first table.
* [x] Alembic initialized, migration autogenerated and reviewed before running.
* [x] `UNIQUE` constraint applied to an already-populated `social.db` with zero data loss.
* [x] Commit: `feat: introduce SQLAlchemy models and Alembic; safely enforce unique usernames on live data`

---

## Context Snapshot (End of Lesson 17)

**1. File Tree (additions):** `models.py`, `migrations/` (Alembic), `alembic.ini`.

**2. Schema State:** `members.username` now has a real `UNIQUE` constraint, applied via migration rather than table recreation.

**4. Dependencies (additions):** `sqlalchemy`, `alembic`.

**5. Test State:** 24 tests, 24 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| ORM (Object-Relational Mapper) | L17 | Translates Python classes into database schema and queries |
| Declarative vs. imperative | L17 | Describing what a shape should be (declarative) vs. issuing a specific action (imperative) |
| Alembic | L17 | A tool that diffs models against a live database and generates versioned migrations |
| Migration (`upgrade`/`downgrade`) | L17 | A discrete, ordered, reversible schema change — analogous to a version-control commit |
| Batch table rebuild | L17 | SQLite's workaround for constraint changes it can't `ALTER TABLE` directly, done safely inside a transaction |

**7. Lesson Completion State:**
- Completed: Lessons 1-17, Interludes A, B, C, D
- Next: Lesson 18 — Advanced Testing Capabilities (Fixtures, Mocking, Test databases)

**8. Current Architecture State:**
- HTTP Layer: 20 routes
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`
- Data Access: `db.py` (raw SQL, most tables), `repositories.py` (`PostRepository`), `models.py` (new — SQLAlchemy, `Member` only so far)
- ORM: introduced, partially adopted by design
- Authentication: complete
