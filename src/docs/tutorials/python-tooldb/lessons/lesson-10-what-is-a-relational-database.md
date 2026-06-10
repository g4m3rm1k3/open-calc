# Python Tool Database — LAB 10 — What is a Relational Database?

**Prerequisites:** Lab 09. You can write Python classes, handle errors, and read JSON files. No SQL knowledge required — that is what this block teaches.

**What this lab adds:**
- The mathematical idea behind relational databases: a relation as a set of tuples
- Why flat files (JSON, CSV) break down when data grows — the three failure modes
- What SQLite is and why it fits this project
- The ACID properties: what guarantees a database makes that a plain file cannot
- A design sketch of the tool database schema before writing any SQL

**Time:** 30–45 minutes (reading and design — no code written yet)

---

> **Quick Check — try to answer before reading:**
>
> 1. You have 500 tools in a JSON file. A holder name changes. How many places in the file must you update? What goes wrong if you miss one?
> 2. Two users open the same JSON file and save changes at the same time. What happens to their edits?
> 3. SQLite is "a relational database in a single file." What problem does "no server" solve for this project?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces no runnable code. Instead you will produce a **schema design sketch** — the tool database tables drawn out with their columns and relationships. This design drives every SQL lesson that follows.

Good design before code prevents the most expensive kind of mistake: discovering that your data model cannot express the real-world domain after you have written 1000 lines of SQL.

---

## Step 1 — The Problem with Flat Files

The project currently loads a single tool from a JSON file (`load_tool_from_file`). Imagine trying to build the full tool database as a collection of JSON files or a single large JSON file.

**Problem 1 — Redundancy**

If you store the holder name inside every tool record:

```json
[
    {"name": "EM-0500", "holder": "CAT40-ER32", "holder_taper": "CAT40"},
    {"name": "EM-0375", "holder": "CAT40-ER32", "holder_taper": "CAT40"},
    {"name": "DR-0250", "holder": "CAT40-ER32", "holder_taper": "CAT40"}
]
```

The holder name `"CAT40-ER32"` and taper `"CAT40"` appear three times. When the holder is renamed or its details change, you must update every tool record that references it. Missing one update creates inconsistency.

**Problem 2 — Inconsistency**

After a partial update, the file contains two different values for the same fact:

```json
[
    {"name": "EM-0500", "holder": "CAT40-ER32-A", ...},  ← updated
    {"name": "EM-0375", "holder": "CAT40-ER32",   ...},  ← missed
    {"name": "DR-0250", "holder": "CAT40-ER32-A", ...}   ← updated
]
```

The holder name `"CAT40-ER32"` in EM-0375 is now wrong. There is no mechanism to detect or prevent this.

**Problem 3 — No enforced constraints**

A JSON file cannot enforce "every tool must have a name" or "diameter must be positive." Any value, or no value, can appear anywhere. Validation must happen entirely in application code, and validation bugs let bad data in permanently.

---

### Concept: The Relational Model — Structured Data with Enforced Constraints

**What it is:** A mathematical model for organizing data into tables (relations) where each row has the same set of named columns, constraints prevent invalid data, and relationships between tables are expressed through shared keys.

**The key ideas:**

**Table (Relation):** A set of rows where every row has exactly the same columns. No missing columns, no extra columns.

```
tools table:
id | name     | diameter_inches | material | tool_type
1  | EM-0500  | 0.5             | carbide  | endmill
2  | DR-0250  | 0.25            | carbide  | drill
3  | FM-0750  | 0.75            | HSS      | facemill
```

**Primary Key:** A column (or combination of columns) that uniquely identifies each row. `id = 1` means exactly one row. Two rows cannot have the same id. This eliminates ambiguity.

**Foreign Key:** A column in one table that references the primary key of another table. This enforces relationships and prevents orphaned records.

```
holders table:         tools table (with holder reference):
id | name              id | name     | holder_id
1  | CAT40-ER32        1  | EM-0500  | 1   ← references holders.id = 1
2  | BT30-ER16         2  | DR-0250  | 1   ← same holder
                       3  | FM-0750  | 2   ← references holders.id = 2
```

If you try to set `holder_id = 99` and there is no holder with `id = 99`, the database rejects the insert. Orphaned references are impossible.

**Constraints:** Rules enforced by the database engine:
- `NOT NULL` — this column must have a value
- `UNIQUE` — no two rows can have the same value in this column
- `PRIMARY KEY` — uniquely identifies each row
- `FOREIGN KEY REFERENCES` — the value must exist in the referenced table
- `CHECK` — a custom condition the value must satisfy

**What it hides:** The complexity of maintaining data consistency. Without a database, every check must be written in application code. With a database, the engine enforces constraints on every write — even direct writes that bypass the application.

**Canonical example (General):**

A payroll system. Employee table: `id`, `name`, `salary`. Department table: `id`, `name`. Employee has `department_id` that references `departments.id`. No employee can belong to a nonexistent department. If a department is deleted, the database prevents it if employees still reference it (or cascades the deletion, if configured).

**The three problems the relational model solves:**

1. **Redundancy**: store holder data once in `holders`. Every tool references the holder by `id` — one integer, not a repeated string. Update the holder name once; all tools see the new name.
2. **Inconsistency**: the foreign key constraint guarantees every `holder_id` in `tools` exists in `holders`. No orphaned references, no conflicting values.
3. **Search**: SQL (Structured Query Language) lets you express complex queries declaratively. "Find all endmills with carbide material and diameter under 0.5" is one SQL query, not a loop through 500 JSON records.

**You will see this again in:** Every data-backed application ever built. SQLite, PostgreSQL, MySQL, SQL Server, Oracle — all implement the relational model. Understanding the model means you can work with any of them. This is one of the most transferable skills in all of software engineering.

**Career signal:** SQL is asked in almost every software engineering interview for any role that touches a database. "Write a query to find all tools with more than 4 flutes" is a common problem. Understanding the relational model is what makes SQL readable, not just memorized.

---

## Step 2 — What SQLite Is

**SQLite** is a relational database engine that stores its entire database in a single file on disk. Unlike PostgreSQL or MySQL, it requires no server process, no installation, and no configuration. The file is the database.

**Why SQLite for this project:**

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Installation | None — bundled with Python | Server install required |
| File format | One `.db` file | Server-managed data directory |
| Multi-user concurrent writes | Limited | Full support |
| Deployment | Copy the file | Run a server |
| Scale | Up to ~1TB, tens of thousands of rows | Billions of rows |
| Use case | Desktop apps, testing, embedded | Web apps, multi-user, production |

For a shop-floor tool database used by 1–5 people, SQLite is the right choice. It is fast, simple, requires no administration, and is backed up by copying a file.

**Python includes SQLite:** `import sqlite3` is in Python's standard library. No `pip install` needed.

---

## Step 3 — ACID Properties

Every database transaction makes four guarantees collectively called ACID:

---

### Concept: ACID — The Four Database Guarantees

**What it is:** Four properties that guarantee database operations are reliable even in the presence of crashes, errors, or concurrent access.

**A — Atomicity:** A transaction either completes entirely or not at all. If you insert a tool AND its holder in one transaction and the process crashes after the tool insert but before the holder insert, when the database recovers, neither insert survives. No half-done state.

**Why it matters for this project:** Creating an assembly requires inserting: the assembly record, linking it to a tool, and linking it to a holder. If any step fails, the whole operation should fail. Atomicity makes this possible.

**C — Consistency:** The database moves from one valid state to another valid state. A transaction that violates a constraint (e.g., `NOT NULL` violated, foreign key violated) is rejected entirely. The database remains consistent.

**I — Isolation:** Concurrent transactions do not see each other's uncommitted changes. If two operators are editing the tool database simultaneously, one does not see the other's half-written changes.

**D — Durability:** Once a transaction is committed, it survives crashes. The data is on disk. If the power goes out one millisecond after a commit, the data is still there when the machine restarts.

**SQLite's ACID implementation:** SQLite is fully ACID-compliant for single-writer access. It uses a journal (or WAL — Write-Ahead Log) to ensure durability and atomicity. For this project's single-shop use case, this is sufficient.

**Canonical example (General):**

A bank transfer. Moving $100 from account A to account B requires two steps: debit A, credit B. Without Atomicity, a crash between the debit and the credit loses $100. Without Durability, the committed transfer might vanish after a power outage. ACID makes the transfer either happen completely or not at all, and stay happened.

**You will see this again in:** Every database lesson. In Block 16 (transactions): you will write explicit `BEGIN/COMMIT/ROLLBACK`. In Block 5 (SQLAlchemy): sessions manage transactions automatically.

---

## Step 4 — Schema Design

Now design the tool database schema before writing a single line of SQL. This is the design step. Decisions made here affect every subsequent lesson.

---

### The Entities

From the DDD work in Lab 00h, the domain has these entities:

**Tool** — a cutting tool. Has: name, diameter, flutes (optional), material, tool_type.

**Holder** — the physical adapter that grips the tool and is held by the machine spindle. Has: name, taper type, collet size.

**Assembly** — a specific pairing of tool + holder, with a recorded stickout length. A reusable setup: "EM-0500 in CAT40-ER32, stickout 1.5 inches."

**Job** — a machining job file. Has: name, part number, date, source file path.

---

### The Relationships

**Tool ↔ Assembly:** One tool can appear in many assemblies (same endmill in multiple setups). One assembly contains exactly one tool. **One-to-many** (tool → assemblies).

**Holder ↔ Assembly:** One holder can appear in many assemblies. One assembly uses exactly one holder. **One-to-many** (holder → assemblies).

**Assembly ↔ Job:** One assembly can be used in many jobs. One job uses many assemblies. **Many-to-many** — requires a junction table.

---

### The Schema Sketch

```
tools
  id            INTEGER  PRIMARY KEY
  name          TEXT     NOT NULL  UNIQUE
  diameter_inches REAL   NOT NULL
  flutes        INTEGER             (nullable — drills don't track this)
  material      TEXT     NOT NULL   (carbide, HSS, cobalt)
  tool_type     TEXT     NOT NULL   (endmill, drill, facemill, threadmill)
  notes         TEXT                (nullable — free text)

holders
  id            INTEGER  PRIMARY KEY
  name          TEXT     NOT NULL  UNIQUE
  taper         TEXT     NOT NULL   (CAT40, BT30, HSK63A)
  collet_size_inches REAL NOT NULL

assemblies
  id            INTEGER  PRIMARY KEY
  name          TEXT     NOT NULL  UNIQUE   (e.g. "EM-0500 in CAT40-ER32 1.5\"")
  tool_id       INTEGER  NOT NULL  REFERENCES tools(id)
  holder_id     INTEGER  NOT NULL  REFERENCES holders(id)
  stickout_inches REAL  NOT NULL
  notes         TEXT

jobs
  id            INTEGER  PRIMARY KEY
  name          TEXT     NOT NULL
  part_number   TEXT
  created_at    TEXT     NOT NULL   (ISO 8601 datetime string)
  source_file   TEXT                (path to .mcam file if from Mastercam)

job_assemblies    ← junction table: many-to-many between jobs and assemblies
  id              INTEGER  PRIMARY KEY
  job_id          INTEGER  NOT NULL  REFERENCES jobs(id) ON DELETE CASCADE
  assembly_id     INTEGER  NOT NULL  REFERENCES assemblies(id)
  tool_position   INTEGER            (T01, T02 etc. in the NC program)
  added_at        TEXT     NOT NULL
```

**Design decisions and why:**

**`tools.flutes` is nullable:** A drill's flute count is not tracked the same way as an endmill's (drills have different geometry terminology). `NULL` means "not applicable" — not zero.

**`assemblies.name` is required and unique:** Assemblies are reusable. Giving each a human-readable name makes it clear in the UI. "EM-0500 in CAT40-ER32 1.5" is unambiguous.

**`jobs.created_at` as TEXT:** SQLite has no native datetime type. Storing ISO 8601 strings (`"2024-01-15T09:30:00"`) is the standard SQLite datetime pattern — the format sorts correctly as a string.

**`job_assemblies.job_id` has `ON DELETE CASCADE`:** When a job is deleted, its assembly assignments are deleted automatically. Assemblies themselves are not deleted — they can be used in other jobs.

**`assemblies.tool_id` and `assemblies.holder_id` are NOT CASCADE:** If you try to delete a tool that is used in an assembly, the database rejects it. You must explicitly handle existing assemblies first. This is the safer default — it prevents accidental data loss.

---

## Step 5 — Write the Design in Your Notes

Add to `notes.md`:

```markdown
## Database Schema — Design Decisions

### Tables
- `tools` — one row per cutting tool. Nullable `flutes` for drill types.
- `holders` — one row per holder. `collet_size_inches` is the maximum shank diameter.
- `assemblies` — tool + holder + stickout. Reusable across jobs. Has a name for display.
- `jobs` — a machining job file reference. Source file tracked for re-import.
- `job_assemblies` — junction table for many-to-many jobs ↔ assemblies.

### Key Decisions
- ISO 8601 TEXT for datetimes — SQLite has no native datetime type; ISO format sorts correctly.
- ON DELETE CASCADE on job_assemblies.job_id — deleting a job removes its assembly links.
- No CASCADE on assemblies.tool_id — deleting a tool requires explicitly clearing assemblies first.
- Nullable `flutes` in tools — drills don't use this field; NULL means "not applicable."
```

---

## Final Check

| Feature | How to verify |
|---|---|
| Can name the three flat-file failure modes | Redundancy, inconsistency, no enforced constraints |
| Can state what ACID stands for | Atomicity, Consistency, Isolation, Durability |
| Can explain why SQLite fits this project | Single-file, no server, bundled with Python, adequate for 1–5 users |
| Schema sketch exists in notes.md | Open notes.md — tables and decisions present |
| Can explain the job_assemblies junction table | Many-to-many: one job uses many assemblies; one assembly appears in many jobs |
| Can explain the ON DELETE CASCADE decision | Deleting a job removes its assembly links but not the assemblies themselves |

---

## Quick Check Answers

**1. How many places in a JSON file must you update when a holder name changes?**

One place for every tool that references that holder. If 47 tools reference `"CAT40-ER32"` and you need to rename it to `"CAT40-ER32-SHORT"`, you must find and update all 47 occurrences. Miss one and the database now contains two different names for the same holder — the definition of inconsistency. A relational database solves this with a foreign key: the holder name is stored once in the `holders` table; tools reference it by integer `id`. Rename the holder in one place; all tools automatically reflect the new name.

**2. Two users save to the same JSON file simultaneously — what happens?**

The second save overwrites the first. There is no concurrency control in a plain file. Whichever write finishes last wins; the other user's changes are silently lost. SQLite's isolation property prevents this: writes acquire a write lock, preventing concurrent writes from interfering. With SQLite's WAL mode, readers can continue reading while a write is in progress, giving reasonable multi-user behavior for a small team.

**3. What problem does "no server" solve for this project?**

Installation and maintenance complexity. A PostgreSQL or MySQL server requires installation, configuration, a running daemon process, user accounts, network configuration, and ongoing administration. For a desktop tool database used by machinists on a shop floor, that overhead is unacceptable. SQLite requires none of it — the database is a file. It runs on the machine that needs it, backed up by copying the file, deployed by copying the application. This matches the project's requirement of a "simple desktop app for one shop."
