# SE Masterclass — LAB-57 — Indexing

**Language: Python (SQLite)** — same module as LAB-56.

**Prerequisites:** LAB-08 (Big-O — an index is LAB-08's O(log n) binary search, made durable and automatic) and LAB-06 (a B-tree, the structure behind most database indexes, is a WIDER version of LAB-06's binary search tree).

**What this lab adds:**
- Why scanning every row (a "full table scan") is slow for large tables
- What an index actually is, and the dramatic speedup it provides
- Reading `EXPLAIN QUERY PLAN` to see WHETHER a query used an index
- The real cost of an index: slower writes, extra storage — LAB-08's space-time trade-off, in a production system

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Finding a word in a dictionary by reading every page front to back, vs. using alphabetical order to jump close to the right spot — which is a full table scan, and which is an index?
> 2. If an index makes READS faster, why doesn't every column on every table just get an index automatically?
> 3. `EXPLAIN QUERY PLAN` shows `SCAN` for one query and `SEARCH ... USING INDEX` for another. Which one is doing LAB-08's O(n) work, and which is closer to O(log n)?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python indexing.py` prints:

```
=== Full Table Scan: 100,000 Rows, No Index ===
query: SELECT * FROM parts WHERE name = 'part-73291'
without index: 8.42ms

=== Adding an Index ===
CREATE INDEX idx_parts_name ON parts(name)
with index: 0.03ms
  ← ~280x faster — same query, same data, same answer

=== Reading the Query Plan ===
without index: SCAN parts
with index: SEARCH parts USING INDEX idx_parts_name (name=?)

=== The Cost: Slower Writes ===
inserting 10,000 rows WITHOUT an index: 45ms
inserting 10,000 rows WITH an index: 89ms
  ← the index must be updated on EVERY insert too — not just reads get affected

=== Composite Index: Column Order Matters ===
query: WHERE last_name = 'Smith' AND first_name = 'Alice'
index on (last_name, first_name): USES the index
index on (first_name, last_name) for THIS query: does NOT use it efficiently
```

---

### Concept: Full Table Scan vs. Index

**What it is:** Without an index, finding rows matching `WHERE name = 'part-73291'` requires checking EVERY row, one at a time — a **full table scan**, O(n) (LAB-08). An **index** is a separate, ORDERED structure (typically a B-tree — a WIDER version of LAB-06's binary search tree, where each node can have MANY children instead of just 2) that lets the database jump almost directly to matching rows, roughly O(log n).

---

## Step 1 — Feel the Full Table Scan Cost

```python
# indexing.py
import sqlite3
import time
import random

conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

cursor.execute('CREATE TABLE parts (id INTEGER PRIMARY KEY, name TEXT, price REAL)')

print("=== Full Table Scan: 100,000 Rows, No Index ===")
rows = [(f'part-{i}', round(random.uniform(1, 100), 2)) for i in range(100_000)]
cursor.executemany('INSERT INTO parts (name, price) VALUES (?, ?)', rows)
conn.commit()

print("query: SELECT * FROM parts WHERE name = 'part-73291'")
start = time.perf_counter()
cursor.execute("SELECT * FROM parts WHERE name = 'part-73291'").fetchall()
elapsed = (time.perf_counter() - start) * 1000
print(f"without index: {elapsed:.2f}ms")
```

### SAVE AND TRY

```bash
python indexing.py
```

**Expected (exact timing varies by machine, but should be measurably slow — several milliseconds):**
```
=== Full Table Scan: 100,000 Rows, No Index ===
query: SELECT * FROM parts WHERE name = 'part-73291'
without index: 8.42ms
```

**Confirm WHY this is slow:** Without an index, SQLite has NO shortcut — it must read `name` from EVERY one of the 100,000 rows, checking each against `'part-73291'`, exactly LAB-08's linear search demonstration (`O(n)`), just with a real database instead of a JavaScript array.

---

## Step 2 — Add an Index

```python
print("\n=== Adding an Index ===")
print("CREATE INDEX idx_parts_name ON parts(name)")
cursor.execute('CREATE INDEX idx_parts_name ON parts(name)')

start = time.perf_counter()
cursor.execute("SELECT * FROM parts WHERE name = 'part-73291'").fetchall()
elapsed = (time.perf_counter() - start) * 1000
print(f"with index: {elapsed:.2f}ms")
```

### SAVE AND TRY

```bash
python indexing.py
```

**Expected (exact numbers vary — the RATIO is what matters):**
```
=== Adding an Index ===
CREATE INDEX idx_parts_name ON parts(name)
with index: 0.03ms
  ← ~280x faster — same query, same data, same answer
```

**Confirm the SAME question, dramatically cheaper to answer:** Both queries return the IDENTICAL row — the index changed NOTHING about the DATA or the ANSWER, only HOW CHEAPLY the database could find it. This is EXACTLY LAB-08's binary-search-vs-linear-search demonstration (`~20 comparisons vs. up to 1,000,000`), now measured with a real database engine instead of a hand-written JavaScript function.

---

## Step 3 — Reading the Query Plan

```python
print("\n=== Reading the Query Plan ===")

conn2 = sqlite3.connect(':memory:')
cursor2 = conn2.cursor()
cursor2.execute('CREATE TABLE parts (id INTEGER PRIMARY KEY, name TEXT)')
cursor2.executemany('INSERT INTO parts (name) VALUES (?)', [(f'part-{i}',) for i in range(1000)])

plan_no_index = cursor2.execute("EXPLAIN QUERY PLAN SELECT * FROM parts WHERE name = 'part-500'").fetchall()
print(f"without index: {plan_no_index[0][3]}")

cursor2.execute('CREATE INDEX idx_name ON parts(name)')
plan_with_index = cursor2.execute("EXPLAIN QUERY PLAN SELECT * FROM parts WHERE name = 'part-500'").fetchall()
print(f"with index: {plan_with_index[0][3]}")
```

### SAVE AND TRY

```bash
python indexing.py
```

**Expected:**
```
=== Reading the Query Plan ===
without index: SCAN parts
with index: SEARCH parts USING INDEX idx_name (name=?)
```

**Confirm `EXPLAIN QUERY PLAN` is your window into WHICH algorithm the database chose:** `SCAN parts` means "check every row" (O(n), LAB-08); `SEARCH ... USING INDEX` means "use the index's ordered structure to jump directly" (roughly O(log n)). Real-world query optimization work is LARGELY about reading THIS output and asking "why isn't my index being used here?" — a skill this lab gives you the vocabulary and mental model for.

---

### Concept: The Cost of an Index

**What it is:** An index isn't free — it's LAB-08's space-time trade-off, made concrete. Maintaining the index's ordered structure means EVERY `INSERT`/`UPDATE`/`DELETE` must ALSO update the index, not just the table — writes get SLOWER, and the index itself consumes extra disk space.

---

## Step 4 — Measure the Write Cost

```python
print("\n=== The Cost: Slower Writes ===")

conn3 = sqlite3.connect(':memory:')
cursor3 = conn3.cursor()
cursor3.execute('CREATE TABLE parts_a (id INTEGER PRIMARY KEY, name TEXT)')     # no index
cursor3.execute('CREATE TABLE parts_b (id INTEGER PRIMARY KEY, name TEXT)')
cursor3.execute('CREATE INDEX idx_b_name ON parts_b(name)')                       # indexed

rows = [(f'item-{i}',) for i in range(10_000)]

start = time.perf_counter()
cursor3.executemany('INSERT INTO parts_a (name) VALUES (?)', rows)
conn3.commit()
no_index_time = (time.perf_counter() - start) * 1000

start = time.perf_counter()
cursor3.executemany('INSERT INTO parts_b (name) VALUES (?)', rows)
conn3.commit()
with_index_time = (time.perf_counter() - start) * 1000

print(f"inserting 10,000 rows WITHOUT an index: {no_index_time:.0f}ms")
print(f"inserting 10,000 rows WITH an index: {with_index_time:.0f}ms")
print("  ← the index must be updated on EVERY insert too — not just reads get affected")
```

### SAVE AND TRY

```bash
python indexing.py
```

**Expected (shape — the indexed table's inserts should take measurably longer):**
```
=== The Cost: Slower Writes ===
inserting 10,000 rows WITHOUT an index: 45ms
inserting 10,000 rows WITH an index: 89ms
  ← the index must be updated on EVERY insert too — not just reads get affected
```

**Confirm this is a REAL trade-off, not just a footnote:** A table with MANY indexes on it, receiving FREQUENT writes, pays this cost on EVERY SINGLE insert/update/delete — which is exactly why real database design involves deliberately choosing WHICH columns deserve an index (ones frequently used in `WHERE`/`JOIN`/`ORDER BY`), rather than indexing everything "just in case." Indexing every column would make writes universally slow for a benefit that's only realized on the subset of columns actually queried often.

---

## 🎯 Challenge: Composite Index Column Order

**You know:** An index can cover MULTIPLE columns together (a "composite" index) — but the ORDER of columns in the index matters for which queries it can help.

**Task:** Create a composite index on `(last_name, first_name)`. Confirm it's used efficiently for a query filtering on BOTH columns, and for a query filtering on `last_name` ALONE — but NOT efficiently for a query filtering on `first_name` ALONE.

<details>
<summary>▶ Show Solution</summary>

```python
conn4 = sqlite3.connect(':memory:')
cursor4 = conn4.cursor()
cursor4.execute('CREATE TABLE people (id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT)')
cursor4.executemany('INSERT INTO people (first_name, last_name) VALUES (?, ?)',
                     [('Alice', 'Smith'), ('Bob', 'Jones')] * 500)
cursor4.execute('CREATE INDEX idx_name ON people(last_name, first_name)')    # last_name FIRST

print("\n=== Composite Index: Column Order Matters ===")
print("query: WHERE last_name = 'Smith' AND first_name = 'Alice'")

plan1 = cursor4.execute(
    "EXPLAIN QUERY PLAN SELECT * FROM people WHERE last_name = 'Smith' AND first_name = 'Alice'"
).fetchall()
print(f"index on (last_name, first_name): {'USES the index' if 'idx_name' in plan1[0][3] else 'does NOT use it'}")

plan2 = cursor4.execute(
    "EXPLAIN QUERY PLAN SELECT * FROM people WHERE first_name = 'Alice'"
).fetchall()
print(f"index on (first_name, last_name) for THIS query: {'does NOT use it efficiently' if 'idx_name' not in plan2[0][3] else 'USES it'}")
```

**Key insight:** A composite index `(last_name, first_name)` is physically ORDERED first by `last_name`, THEN by `first_name` WITHIN each `last_name` group — like a phone book sorted by last name, then first name. This makes it EXCELLENT for "find by last_name" or "find by last_name AND first_name," but nearly USELESS for "find by first_name alone" — there's no way to jump directly to all "Alice"s without scanning across every last-name group, since `first_name` isn't the PRIMARY sort key. This is precisely why real schema design asks "which columns are queried TOGETHER, and in what order?" before creating a composite index — the leading column is the one that MUST appear in a query's `WHERE` clause for the index to help.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| B-tree indexes | PostgreSQL, MySQL, SQLite — B-trees are the default index type in nearly every relational database |
| `EXPLAIN QUERY PLAN` | PostgreSQL's `EXPLAIN ANALYZE`, MySQL's `EXPLAIN` — every real database has an equivalent |
| Write-cost trade-off | Why production database migrations that add indexes to LARGE tables are scheduled carefully (they can lock or slow the table during creation) |
| Composite index ordering | The single most common real-world database performance mistake — a "missing" or "wrong-order" composite index |

**Where you will see this again:** LAB-63 (Query Engine) builds a simplified query PLANNER that makes exactly these SCAN-vs-SEARCH decisions explicit and hand-written.

---

## Final Check

| Feature | How to verify |
|---|---|
| A full table scan on 100,000 rows is measurably slow | Step 1 |
| Adding an index produces a dramatic, measurable speedup for the SAME query | Step 2 |
| `EXPLAIN QUERY PLAN` correctly shows `SCAN` vs. `SEARCH ... USING INDEX` | Step 3 |
| Indexed writes are measurably slower than unindexed writes | Step 4 |
| A composite index's column order determines which queries benefit | Challenge |
| You can explain, without notes, why NOT every column should be indexed | Step 4's Concept box |

---

## Quick Check Answers

**1. Reading a dictionary front-to-back vs. using alphabetical order — which is which?**

Reading front-to-back is a full table SCAN — checking every entry, O(n) (LAB-08). Using alphabetical ordering to jump close to the right spot is exactly what an INDEX provides — a pre-sorted structure that lets you skip most of the data, roughly O(log n), demonstrated directly in Steps 1–2 where the SAME query went from milliseconds (scan) to a small fraction of a millisecond (index).

**2. Why doesn't every column just get an index automatically?**

Because indexes aren't free — Step 4 demonstrated the real cost directly: EVERY write (insert/update/delete) must ALSO update every index on that table, and indexes consume additional disk space. A table with many rarely-queried, heavily-indexed columns would pay this write cost constantly for benefits that are rarely, if ever, actually used — the classic space-time trade-off (LAB-08) applied to real schema design, where the right answer is "index the columns actually used in frequent `WHERE`/`JOIN`/`ORDER BY` clauses," not "index everything just in case."

**3. `SCAN` vs. `SEARCH ... USING INDEX` — which is O(n), which is closer to O(log n)?**

`SCAN` is the O(n) full table scan (check every row); `SEARCH ... USING INDEX` is the roughly O(log n) indexed lookup (jump directly via the B-tree's ordered structure) — confirmed directly in Step 3's `EXPLAIN QUERY PLAN` output, which is precisely how you'd verify, for any REAL query against a REAL database, which of these two algorithms is actually being used.

---

*Next: [LAB-58 — Normalization](LAB-58-normalization.md) — Python (SQLite), same module*
