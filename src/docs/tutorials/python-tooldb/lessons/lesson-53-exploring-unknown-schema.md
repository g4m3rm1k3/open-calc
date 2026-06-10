# Python Tool Database — LAB 53 — Exploring an Unknown Database Schema

**Prerequisites:** Lab 52. This lesson has nothing new in Python syntax. What it teaches is a skill you will use throughout your career: sitting down in front of a database you have never seen before and figuring out what it contains.

Mastercam stores tool libraries in `.tooldb` files, which are SQLite databases. The schema was not designed for readability — it was designed for Mastercam's internal use. Column names like `dbo_ToolMgr_Tool.fld_mc_tool_diameter` tell you something, but not everything. Some columns are obvious; others are mysteries.

**What this lab teaches:**
- `sqlite_master` — the built-in table that describes every table in a SQLite database
- `PRAGMA table_info()` — a fast way to list every column and its type
- The insert-and-query technique — how to learn what a column means by putting known data in it
- Why you never modify the source file — always work on a copy
- The ETL vocabulary: Extract, Transform, Load

**Time:** 40–50 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You open a SQLite database you've never seen before. You can run any SELECT you want, but you cannot ask the author. What is the first query you run to orient yourself?
> 2. You find a column named `fld_mc_tool_type_id`. It contains integers: 1, 2, 5, 6, 9. You have no documentation. How do you figure out what 1 means vs 5?
> 3. You find a column named `fld_mc_tool_diameter`. One row has the value `0.5`, another has `12.7`. You expected all diameters in inches, but 12.7 inches is enormous. What is likely happening?
>
> *(Answers at the end)*

---

## The Problem: Someone Else's Database

You have built your own tool database schema from scratch. You know every column because you created it. Mastercam's `.tooldb` file is the opposite — you did not design it, it was not designed for you to read, and there is no documentation for the internal schema.

This situation comes up constantly in real work. Legacy systems, third-party tools, vendor databases, inherited codebases — you will regularly need to read data from a system you did not build.

The approach is always the same:
1. **List what's there.** What tables exist? What columns does each have?
2. **Read sample data.** What values actually appear? What is the range?
3. **Inject known data.** Add a record you control through the application, then find it in the database. The application filled in every required field — that tells you which fields matter.
4. **Form a hypothesis.** "This column is probably diameter in mm."
5. **Test the hypothesis.** Find records where you know the answer. Does the column match?

You will do all five steps in this lesson.

---

## Setup: Getting a .tooldb File

If you have Mastercam installed, open the Tool Manager, create a simple library with 3–4 tools (one endmill, one drill, one face mill), and save it as a `.tooldb` file. Note the path.

If you do not have Mastercam, create a sample database that approximates the structure:

```python
import sqlite3

conn = sqlite3.connect("sample_mastercam.tooldb")
conn.executescript("""
CREATE TABLE IF NOT EXISTS dbo_ToolMgr_Tool (
    fld_mc_tool_id          INTEGER PRIMARY KEY,
    fld_mc_tool_type_id     INTEGER NOT NULL,
    fld_mc_tool_name        TEXT,
    fld_mc_tool_comment     TEXT,
    fld_mc_tool_diameter    REAL,
    fld_mc_corner_rad       REAL,
    fld_mc_flute_len        REAL,
    fld_mc_overall_len      REAL,
    fld_mc_num_flutes       INTEGER,
    fld_mc_material         INTEGER,
    fld_mc_in_use           INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS dbo_ToolMgr_ToolType (
    fld_mc_tool_type_id     INTEGER PRIMARY KEY,
    fld_mc_tool_type_name   TEXT
);

CREATE TABLE IF NOT EXISTS dbo_ToolMgr_Material (
    fld_mc_material_id      INTEGER PRIMARY KEY,
    fld_mc_material_name    TEXT
);

INSERT INTO dbo_ToolMgr_ToolType VALUES
    (1, 'End Mill'), (2, 'Drill'), (3, 'Face Mill'), (4, 'Turn Tool');

INSERT INTO dbo_ToolMgr_Material VALUES
    (1, 'Carbide'), (2, 'High Speed Steel'), (3, 'Cobalt');

INSERT INTO dbo_ToolMgr_Tool VALUES
    (1, 1, '1/2 FLAT ENDMILL 4FL', 'Carbide 4-flute', 0.5,  0.0,  0.75, 2.5, 4, 1, 1),
    (2, 1, '3/8 BALL ENDMILL',      'Carbide',        0.375, 0.1875, 0.5, 2.0, 4, 1, 1),
    (3, 2, '1/4 DRILL',             'HSS',            0.25,  0.0,  1.0,  3.0, 2, 2, 1),
    (4, 3, '1 FACE MILL',           NULL,             1.0,   0.0,  0.0,  2.0, 5, 1, 1);
""")
conn.commit()
conn.close()
print("Created sample_mastercam.tooldb")
```

Run this once to create the sample file. The column names mirror actual Mastercam naming conventions — verbose, prefixed with `fld_mc_`.

---

## Step 1 — The First Query: `sqlite_master`

Every SQLite database has a built-in table called `sqlite_master`. It contains one row for every table, view, index, and trigger in the database. It is the schema's table of contents.

```python
import sqlite3

conn = sqlite3.connect("sample_mastercam.tooldb")
conn.row_factory = sqlite3.Row

tables = conn.execute(
    "SELECT name, type, sql FROM sqlite_master WHERE type = 'table'"
).fetchall()

for t in tables:
    print(f"\n=== {t['name']} ===")
    print(t['sql'])
```

Run this. You will see the full `CREATE TABLE` statements for every table — the same SQL that was used to define the schema, preserved verbatim inside the database itself.

Read the output carefully. Before you do anything else, ask:
- How many tables are there?
- Which table names suggest tool data?
- Do you see any junction tables (names with two entities, like `Tool_Holder`)?
- What naming pattern do the columns follow?

In a real Mastercam file you might see 20–30 tables. Most are irrelevant — they store operation data, machine settings, post-processor config. Your job is to identify the tables that have tool geometry.

---

## Step 2 — `PRAGMA table_info()`

Once you identify a likely table, `PRAGMA table_info(tablename)` lists every column with its type, whether it is nullable, and its default value. It is faster to read than the full `CREATE TABLE` SQL:

```python
columns = conn.execute("PRAGMA table_info(dbo_ToolMgr_Tool)").fetchall()

for col in columns:
    nullable = "" if col["notnull"] else " (nullable)"
    default = f" default={col['dflt_value']}" if col["dflt_value"] else ""
    print(f"  {col['cid']:2} | {col['name']:<30} | {col['type']:<10}{nullable}{default}")
```

The output gives you a column-by-column inventory. Write it down or keep it in a scratch file. You will refer to it constantly as you build the adapter.

---

## Step 3 — Read Sample Rows

Column names tell you what the data might be. Actual values tell you what it is:

```python
rows = conn.execute("SELECT * FROM dbo_ToolMgr_Tool").fetchall()

for row in rows:
    print(dict(row))
```

Print each row as a dict so you can see field name alongside value. Now look:

- `fld_mc_tool_diameter` — values are 0.5, 0.375, 0.25, 1.0. Those are decimal inches. Confirmed.
- `fld_mc_tool_type_id` — values are 1, 1, 2, 3. Integers, not strings. There must be a lookup table.
- `fld_mc_material` — values are 1, 1, 2, 1. Also integers. Another lookup table.
- `fld_mc_corner_rad` — 0.0, 0.1875, 0.0, 0.0. The ball endmill has a corner radius of 0.1875, which is 3/8 ÷ 2. That is the radius of a 3/8" ball — confirmed.
- `fld_mc_tool_comment` — one row is NULL. Notes are optional.

Notice `fld_mc_in_use = 1` on every row. What happens when it is 0? That probably means "deleted" or "inactive" — tools that were removed from the library but not physically deleted from the database. You want to filter those out.

---

## Step 4 — Resolve the Lookup Tables

`fld_mc_tool_type_id = 1` means nothing until you resolve it against the lookup table:

```python
types = conn.execute(
    "SELECT fld_mc_tool_type_id, fld_mc_tool_type_name FROM dbo_ToolMgr_ToolType"
).fetchall()

type_map = {row["fld_mc_tool_type_id"]: row["fld_mc_tool_type_name"] for row in types}
print(type_map)
# {1: 'End Mill', 2: 'Drill', 3: 'Face Mill', 4: 'Turn Tool'}
```

Now you can decode any tool row: `type_map[row["fld_mc_tool_type_id"]]` gives you the human-readable type name. Do the same for `fld_mc_material`:

```python
materials = conn.execute(
    "SELECT fld_mc_material_id, fld_mc_material_name FROM dbo_ToolMgr_Material"
).fetchall()

material_map = {row["fld_mc_material_id"]: row["fld_mc_material_name"] for row in materials}
print(material_map)
# {1: 'Carbide', 2: 'High Speed Steel', 3: 'Cobalt'}
```

This is the pattern for every integer column that looks like an enum. If values are small integers with no apparent mathematical meaning, look for a companion lookup table.

---

## Step 5 — The Insert-and-Query Technique

This technique works when you have access to the application. You create a tool in Mastercam (or any application) with specific, recognizable values, then query the database to find that row.

Choose values you will recognize in a sea of data:
- Name: `"TEST-TOOL-ABCXYZ"` — unique enough that a `WHERE name LIKE '%ABCXYZ%'` will find it
- Diameter: `1.2345` — an unusual float that will stand out

After inserting in the application:

```python
test_row = conn.execute(
    "SELECT * FROM dbo_ToolMgr_Tool WHERE fld_mc_tool_name LIKE '%ABCXYZ%'"
).fetchone()

print(dict(test_row))
```

Every column in the result was either filled by you (the fields you set in the UI) or filled by Mastercam automatically (required fields, default values). Columns that changed from NULL to a value are required by Mastercam. Columns that stayed NULL are optional.

This is how you discover fields your schema does not have. If Mastercam populated `fld_mc_holder_id` automatically, your schema needs to account for it during import even if your application does not use it.

---

## Step 6 — SAVE AND TRY: Be Suspicious

Open your sample database and try to find the diameter discrepancy yourself. In a real Mastercam file, some tools have diameters stored as millimeters even when the library is set to inches — a unit inconsistency in Mastercam's storage layer.

Try this:

```python
rows = conn.execute(
    "SELECT fld_mc_tool_name, fld_mc_tool_diameter FROM dbo_ToolMgr_Tool"
).fetchall()

for row in rows:
    name = row["fld_mc_tool_name"]
    diam = row["fld_mc_tool_diameter"]
    if diam > 4.0:  # suspicious for an inch-unit endmill
        print(f"SUSPICIOUS: {name} diameter={diam}")
```

In your sample database, no tools will trigger this. But when you run it against a real Mastercam file, you may find rows where diameter is 12.7 instead of 0.5. The inch value for a 1/2" endmill is 0.5; the mm value is 12.7. If you find both patterns in the same database, the import needs a unit-detection heuristic — or you will import an "endmill" with a 12.7-inch diameter and wonder why your SFM calculations are absurd.

The lesson: always sanity-check values against known physical constraints. A diameter > 4 inches for a standard endmill is a red flag. Check it before you trust it.

---

## Step 7 — Write Down What You Learned

Before writing a single line of adapter code, write a mapping table. This is not busywork — it is design documentation:

```
Mastercam column                Our schema field    Notes
─────────────────────────────── ──────────────────── ──────────────────────────────
fld_mc_tool_name                name                 direct
fld_mc_tool_diameter            diameter_inches      assume inches; flag if > 4.0
fld_mc_corner_rad               corner_radius        endmill only; 0.0 = no radius
fld_mc_num_flutes               flutes               endmill, drill only
fld_mc_flute_len                flute_length         nullable
fld_mc_tool_type_id → lookup    tool_type            decode via type_map dict
fld_mc_material → lookup        material             decode via material_map dict
fld_mc_tool_comment             notes                nullable
fld_mc_in_use                   (filter: skip if 0) don't import inactive tools
fld_mc_tool_id                  (not imported)       Mastercam's ID, not ours
```

Two columns get special treatment:
- `fld_mc_tool_type_id` — requires lookup before mapping
- `fld_mc_in_use` — is a filter condition, not a field to import

One column is deliberately excluded:
- `fld_mc_tool_id` — Mastercam's primary key is Mastercam's business. Your database assigns its own IDs.

---

## Concept: ETL

What you just did — listing tables, reading columns, sampling data, resolving lookups — is the Extract phase of ETL:

**Extract** — read data from the source system in its native format, without any transformation  
**Transform** — convert the data to your format: rename fields, decode IDs to strings, convert units, validate  
**Load** — insert the transformed records into your database

These three phases should stay separate. Code that reads from Mastercam should not also write to your database — if anything goes wrong during the write, you want to be able to retry the write without re-reading the source. Code that transforms data should not know about either database — it takes a raw row and returns a `ToolCreate`, nothing more.

The next lesson writes the Transform step: a `MastercamAdapter` that takes a raw Mastercam row and returns a `ToolCreate`.

---

## Final Check

| | |
|--|--|
| `sqlite_master` lists every table in a SQLite database | ✓ |
| `PRAGMA table_info(t)` lists every column, type, and nullability | ✓ |
| Integer columns with small values are often foreign keys to lookup tables | ✓ |
| Insert a recognizable record in the app, then query to find it | ✓ |
| Map source columns → target schema before writing any code | ✓ |
| The ETL phases should stay separate | ✓ |

---

## Quick Check Answers

1. **`SELECT name, type, sql FROM sqlite_master WHERE type = 'table'`** — this lists every table with its full CREATE TABLE statement. It gives you an immediate overview of the whole schema: how many tables, what they're called, and what columns each has. This is always the first query.

2. **Use the insert-and-query technique.** Create a tool in Mastercam and set the tool type to something you know — say, "End Mill." Find the row in Python. The `fld_mc_tool_type_id` value in that row is the integer that means "End Mill." Repeat for each type. Alternatively, look for a table named something like `ToolType` or `ToolCategory` — the lookup table almost certainly exists. Query it to get the full mapping.

3. **The column stores millimeters for some tools.** The value 12.7 mm = 0.5 inches. Mastercam may store metric and imperial tools in the same library, or the unit setting may have changed between sessions. The correct fix is to detect the unit inconsistency before importing: if a supposed "inch" value is greater than a reasonable upper bound (say, 4 inches for standard endmills), it is probably in millimeters and needs conversion. Never silently trust raw float values from an external system without a sanity check.
