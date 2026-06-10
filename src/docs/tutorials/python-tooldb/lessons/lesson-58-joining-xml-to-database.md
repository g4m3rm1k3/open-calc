# Python Tool Database — LAB 58 — Joining XML Data to the Database

**Prerequisites:** Lab 57 (Mastercam XML structure — you can extract tools and operations from an XML file). Lab 15 (SQL JOINs). Lab 48 (SQLAlchemy querying). You can read operation data from XML and you can query tools from the database. This lesson connects them.

**What this lab adds:**
- The in-memory join: combining data from two different sources on a shared key — in Python, without SQL
- Handling the unmatched case: what to do when the XML references a tool not in your database
- Separating the data-gathering step from the display step — why they should never be the same function

**Time:** 45–55 minutes

---

## What You Will Build

A function that takes an XML operation sheet and produces a combined report — one row per operation, enriched with tool data from the database:

```
Operation Report
═══════════════════════════════════════════════════════
POCKET-1   │ 1/2 FLAT ENDMILL  │ 0.5" carbide │ SFM: 600  │ feed: 0.003"
POCKET-2   │ 1/2 FLAT ENDMILL  │ 0.5" carbide │ SFM: 600  │ feed: 0.003"
DRILL-1    │ 1/4 DRILL         │ 0.25" HSS    │ SFM: 80   │ feed: 0.005"
DRILL-2    │ 1/4 DRILL         │ 0.25" HSS    │ SFM: 80   │ feed: 0.005"
FACE-1     │ 1 FACE MILL       │ 1.0" carbide │ SFM: 900  │ feed: 0.006"
───────────────────────────────────────────────────────
5 operations. 0 unmatched tools.
```

If a tool in the XML has no match in the database, the report shows why instead of crashing.

---

> **Quick Check — try to answer before reading:**
>
> 1. SQL has `JOIN`. Python has no join keyword. How would you combine two lists — one with `{"tool_id": "1", "op": "POCKET-1"}` and one with `{"id": "1", "name": "Flat Endmill"}` — to produce `{"op": "POCKET-1", "name": "Flat Endmill"}`?
> 2. In Lab 53, you decoded `fld_mc_material = 2` to `"HSS"` by building `{2: "HSS"}`. This lesson joins on a key too. What is different about the key here?
> 3. You join XML operations against database tools. 50 operations, 20 unique tools. How many database queries does a naïve approach make? How many should it make?
>
> *(Answers at the end of this lab)*

---

## Concept: The In-Memory Join

**What it is:** Combining records from two data sources by matching a shared key — the same logical operation as a SQL JOIN, done in Python using a dict as the lookup table.

**The problem before:** You have operations from XML, each with a `tool_id`. You have tools in the database, each with an `id` and `name`. To produce the report, you need to match each operation to its tool. The naive approach:

```python
for op in operations:
    # For each operation, query the database:
    tool = session.get(ToolORM, op['tool_id'])   # ← one query per operation
    print(f"{op['name']} used {tool.name}")
```

With 50 operations, that is 50 database queries. You built this bug in Lab 46 — it is the N+1 problem, and it is just as slow here even though the join is happening in Python instead of SQL.

**The solution:** Load all the tools you need once, build a dict, then look up each operation in the dict:

```python
# One query to load all relevant tools:
all_tools = {str(t.id): t for t in session.scalars(select(ToolORM)).all()}

# Zero additional queries in the loop:
for op in operations:
    tool = all_tools.get(op['tool_id'])   # O(1) dict lookup
```

**What it hides:** The dict hides the repeated database round-trips. Once built, `all_tools.get(key)` is a single hash lookup — O(1) regardless of how many tools are in the dict. The SQL query ran once; the dict absorbs all subsequent lookups with no further I/O.

**The protected invariant:** Every lookup in the loop reads from the same snapshot of the database. If you queried the database per-operation instead, a concurrent write between iterations could produce a report where operation 1 and operation 2 saw different versions of the same tool.

**Canonical example — the phone book:**
A phone book is a pre-built dict: `{name → number}`. Looking up "Smith" takes the same time whether the book has 100 entries or 10,000 — you open to S and check. A join is building that phone book from one list and then looking up entries from another list.

```python
# Building the "phone book" from the first source:
tool_by_id = {tool.id: tool for tool in tools}

# Looking up each entry from the second source:
for op in operations:
    tool = tool_by_id.get(op['tool_id'])   # O(1)
```

**You will see this again in:** Every place two datasets meet: matching API responses to database records, matching CSV rows to a lookup table, matching log entries to user records, GraphQL dataloader batching. The pattern is always the same — build a dict from one source, look up from the other. Senior engineers call it a "hash join," which is also how databases implement JOINs internally when both tables fit in memory.

**Career signal:** "Explain how you would join two large lists in Python without using a database" is a real interview question. The answer is this pattern. Knowing it also helps you understand why database indexes make JOINs fast — an index is a pre-built hash (or B-tree) that makes the lookup O(log n) instead of O(n).

**Watch for:** Dict keys must match exactly. If the XML `tool_id` is the string `"1"` and the database `id` is the integer `1`, `all_tools.get("1")` returns `None` — not the tool. Convert to a consistent type when building the dict. You will see this in Step 2.

---

## Step 1 — Load the Database Tools Once

Create `tooldb/reports/operation_report.py`:

```python
from sqlalchemy import select
from sqlalchemy.orm import Session
from tooldb.orm.models import ToolORM
```

`select` and `Session` are already familiar from Lessons 48 and 52. The import is here as a reminder that the report module lives in the ORM layer — it reads from the database using the same session pattern.

Now write the loader:

```python
def load_tools_by_id(session: Session) -> dict[str, ToolORM]:
    """
    Returns a dict mapping tool ID (as string) → ToolORM object.
    String key because XML attributes are always strings.
    One query. No further queries needed in the join loop.
    """
    tools = session.scalars(select(ToolORM)).all()
    return {str(t.id): t for t in tools}
    # str(t.id) converts the integer database ID to a string
    # so it matches the string tool_id values coming out of the XML
```

The `str(t.id)` conversion is the type-mismatch fix from the "Watch for" in the concept block. Database IDs are integers; XML attributes are strings. Converting the database ID to string on the way in means every lookup key is the same type.

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from tooldb.reports.operation_report import load_tools_by_id

with SessionLocal() as session:
    tool_lookup = load_tools_by_id(session)
    print(f"Loaded {len(tool_lookup)} tools into lookup dict")
    # Inspect one entry:
    first_key = next(iter(tool_lookup))
    print(f"Key type: {type(first_key).__name__}, value: {first_key}")
    print(f"Tool: {tool_lookup[first_key].name}")
```

**You should see:**
```
Loaded 5 tools into lookup dict
Key type: str, value: 1
Tool: 1/2 FLAT ENDMILL
```

**Change something:** Remove `str()` from the dict comprehension — use `t.id` directly instead of `str(t.id)`. Then try `tool_lookup.get("1")`. Expected: `None`. The lookup fails because the key is now an integer `1`, not the string `"1"`. Change it back.

---

## Step 2 — Build the Report Rows

Add this function to `operation_report.py`:

```python
def build_report(operations: list[dict], tool_lookup: dict) -> list[dict]:
    """
    Joins XML operations with database tools.
    Returns one dict per operation — matched or unmatched.
    Does NOT display anything. The caller decides how to present the result.
    """
    rows = []

    for op in operations:
        tool_id = op['tool_id']          # string, from XML attribute
        tool    = tool_lookup.get(tool_id)   # O(1) lookup — may return None

        if tool is None:
            # Unmatched: XML references a tool ID not in the database
            rows.append({
                "op_name":   op['name'],
                "tool_name": f"[Tool #{tool_id}: not in database]",
                "diameter":  None,
                "material":  None,
                "cutting":   op.get('cutting', {}),
                "matched":   False,
            })
        else:
            rows.append({
                "op_name":   op['name'],
                "tool_name": tool.name,
                "diameter":  tool.diameter_inches,
                "material":  tool.material,
                "cutting":   op.get('cutting', {}),
                "matched":   True,
            })

    return rows
```

Two things worth pausing on:

`tool_lookup.get(tool_id)` returns `None` if there is no match. Calling it `get` instead of indexing with `[]` is the difference between a graceful `None` and a `KeyError` crash. The report should never crash because an XML file references a tool your database doesn't have — that is an expected mismatch, not an error.

The `"matched": True/False` flag is there for the summary line at the bottom of the report. Instead of counting matched rows in the display function, the data carries its own status. The display function just asks `row['matched']` — it does not need to re-examine `tool_name` to figure out whether the join succeeded.

### SAVE AND TRY

```python
import xml.etree.ElementTree as ET
from tooldb.parsers.mastercam_xml_parser import extract_tools, extract_operations, load_operation_sheet
from tooldb.reports.operation_report import load_tools_by_id, build_report
from tooldb.orm.session import SessionLocal

root = load_operation_sheet("sample_operations.xml")
ops  = extract_operations(root)

with SessionLocal() as session:
    tool_lookup = load_tools_by_id(session)
    rows = build_report(ops, tool_lookup)

print(f"Report rows: {len(rows)}")
for row in rows:
    status = "✓" if row['matched'] else "✗"
    print(f"  {status} {row['op_name']:12} → {row['tool_name']}")
```

**You should see:**
```
Report rows: 5
  ✓ POCKET-1     → 1/2 FLAT ENDMILL
  ✓ POCKET-2     → 1/2 FLAT ENDMILL
  ✓ DRILL-1      → 1/4 DRILL
  ✓ DRILL-2      → 1/4 DRILL
  ✓ FACE-1       → 1 FACE MILL
```

**Change something:** Edit `sample_operations.xml` — change one `tool_id="1"` to `tool_id="99"`. Run again. That operation should show `✗ POCKET-1 → [Tool #99: not in database]`. Change it back.

---

## Step 3 — Display the Report

Add a display function that formats the rows. Keep it separate from `build_report` — one function gathers and joins, the other formats and prints. They have different reasons to change: the join logic changes when the data model changes; the formatting changes when you want the output to look different.

```python
def print_report(rows: list[dict]) -> None:
    """Formats and prints the joined report. No data logic here."""
    print("\nOperation Report")
    print("═" * 70)

    for row in rows:
        if not row['matched']:
            print(f"  {'UNMATCHED':<12} │ {row['op_name']}")
            continue

        cutting = row['cutting']
        sfm     = cutting.get('sfm', '—')
        # Feed could be per-tooth or per-rev depending on tool type
        feed    = cutting.get('feed_per_tooth') or cutting.get('feed_per_rev', '—')

        print(
            f"  {row['op_name']:<12} │ "
            f"{row['tool_name']:<20} │ "
            f"{row['diameter']}\"{row['material']:<8} │ "
            f"SFM: {sfm:<6} │ feed: {feed}\""
        )

    matched   = sum(1 for r in rows if r['matched'])
    unmatched = len(rows) - matched
    print("─" * 70)
    print(f"  {len(rows)} operation(s). {unmatched} unmatched tool(s).")
```

### SAVE AND TRY

```python
from tooldb.reports.operation_report import print_report
print_report(rows)
```

**You should see** the formatted table from "What You Will Build" at the top of this lab.

**Change something:** In `build_report`, remove the `"matched"` key from both branches. In `print_report`, try to access `row['matched']` — you get a `KeyError`. This demonstrates why the data structure should carry its own status: the display function should not have to re-derive it from the content of other fields. Add it back.

---

## 🎯 Challenge: Group Operations by Tool

**You know:** `build_report` returns a flat list of rows. The `tool_name` field repeats for every operation using the same tool.

**Task:** Write `group_by_tool(rows: list[dict]) -> dict[str, list[dict]]` that returns a dict mapping tool name to the list of operations using it. For the sample data:

```python
{
  "1/2 FLAT ENDMILL": [row for POCKET-1, row for POCKET-2],
  "1/4 DRILL":        [row for DRILL-1, row for DRILL-2],
  "1 FACE MILL":      [row for FACE-1],
}
```

Then write a second display function `print_grouped_report(grouped)` that prints operations nested under their tool.

**Starting code:**
```python
def group_by_tool(rows: list[dict]) -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        key = row['tool_name']
        # add row to grouped[key]
        ...
    return grouped
```

**Hint:** `grouped.setdefault(key, []).append(row)` adds to a list, creating it if missing.

---

<details>
<summary>▶ Show Solution</summary>

```python
def group_by_tool(rows: list[dict]) -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row['tool_name'], []).append(row)
    return grouped


def print_grouped_report(grouped: dict[str, list[dict]]) -> None:
    for tool_name, ops in grouped.items():
        print(f"\n  {tool_name}  ({len(ops)} operation(s))")
        for row in ops:
            cutting = row['cutting']
            sfm = cutting.get('sfm', '—')
            print(f"    {row['op_name']:<12}  SFM: {sfm}")
```

**Key insight:** `setdefault(key, [])` is the standard Python idiom for "give me the existing list for this key, or create an empty one." It avoids the `if key not in grouped: grouped[key] = []` pattern. This grouping operation appears constantly in data processing: grouping log lines by severity, grouping orders by customer, grouping test results by status.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `load_tools_by_id` makes exactly one database query | Add `echo=True` to `SessionLocal` — count SELECT statements |
| Dict keys are strings — `tool_lookup.get("1")` works, `tool_lookup.get(1)` returns None | Run the "Change something" in Step 1 |
| Unmatched tool produces a row with `matched=False`, not a crash | Edit XML to use `tool_id="99"`, run SAVE AND TRY in Step 2 |
| `build_report` returns data; `print_report` formats it — neither does the other's job | Check: `build_report` has no `print()` calls; `print_report` has no `session.get()` calls |
| Grouped report shows operations nested under their tool | Run challenge solution and verify nesting |

---

## Quick Check Answers

**1. How would you combine two Python lists that share a key?**
Build a dict from one list keyed on the shared field — `{item['id']: item for item in list_a}` — then loop over the second list and use `.get()` to look up the matching entry. This is the in-memory join from the Concept block. The dict lookup is O(1); no nested loops, no repeated database queries.

**2. What is different about the key here vs Lab 53's material map?**
In Lab 53, the key was a small integer (`2`) that mapped to a fixed string (`"HSS"`). The lookup table was static — you wrote it by hand once. Here, the key is a tool ID from the database — dynamic, assigned at insert time, not known in advance. You build the lookup dict from the actual database rows at runtime. The structure of the join is identical; the difference is that the lookup table is generated, not hardcoded.

**3. How many database queries does the naïve approach make vs the correct approach?**
Naïve: one query per operation — 50 queries for 50 operations. That is the N+1 problem from Lab 46 expressed in Python instead of SQL. Correct: one query to load all tools into a dict, then zero queries in the loop — total of 1 query regardless of how many operations the XML has. With 1000 operations, the difference is 1000 queries vs 1.
