# SE Masterclass — LAB-60 — NoSQL Trade-offs

**Language: Python** — Module 2 of Phase 5 begins.

**Prerequisites:** LAB-56–59 (you need to feel WHY relational modeling is often right before understanding when it's wrong) and LAB-04 (a key-value store IS LAB-04's hash map, as an entire database).

**What this lab adds:**
- The exact shape of data relational modeling struggles with: VARIABLE structure across "rows"
- A document store: schema PER DOCUMENT instead of schema per table
- A key-value store: the simplest possible database — LAB-04's hash map, persisted
- A decision framework: relational vs. document vs. key-value, by actual data shape and access pattern

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A `tools` table needs columns for drills (diameter, flute count), end mills (diameter, flutes, coating), AND inserts (grade, shape) — none of which fully overlap. What happens to a relational table trying to hold all three?
> 2. A key-value store's ENTIRE query capability is "give me the value for this key." What's the trade-off for that extreme simplicity?
> 3. Is "NoSQL" a single technology, or several genuinely different approaches lumped under one name?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python nosql.py` prints:

```
=== The Problem: Variable-Structure Data in a Relational Table ===
tools table columns: id, type, diameter, flute_count, coating, grade, shape
drill row:    diameter=6.0, flute_count=2, coating=NULL, grade=NULL, shape=NULL
end_mill row: diameter=8.0, flute_count=4, coating='TiN', grade=NULL, shape=NULL
insert row:   diameter=NULL, flute_count=NULL, coating=NULL, grade='C6', shape='round'
  ← 4 of 7 columns are NULL for any given row — wasted structure, awkward queries

=== Fixed: A Document Store ===
drill document:    {'type': 'drill', 'diameter': 6.0, 'flute_count': 2}
end_mill document:  {'type': 'end_mill', 'diameter': 8.0, 'flute_count': 4, 'coating': 'TiN'}
insert document:    {'type': 'insert', 'grade': 'C6', 'shape': 'round'}
  ← each document has EXACTLY the fields relevant to ITS type — no wasted NULLs

=== Key-Value Store: The Simplest Database ===
set('session:abc123', {...user data...})
get('session:abc123'): O(1) — {...user data...}
  ← no schema, no query language — just get/set by key, as fast as a hash map

=== Decision Framework ===
scenario: bank account balances, strict consistency needed -> RELATIONAL
scenario: product catalog with wildly different fields per category -> DOCUMENT
scenario: session cache, cache invalidation, rate limiting -> KEY-VALUE
```

---

### Concept: When Relational Structure Doesn't Fit

**What it is:** Relational tables assume every ROW of a table has the SAME set of COLUMNS. This works great when that's actually true (LAB-56's customers, orders). It works POORLY when different "rows" of conceptually the same thing genuinely have DIFFERENT structure — a drill has a diameter and flute count; a carbide insert has a grade and a shape; almost NONE of these fields overlap.

---

## Step 1 — Feel the Relational Mismatch

```python
# nosql.py
import sqlite3

conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE tools (
        id INTEGER PRIMARY KEY,
        type TEXT,
        diameter REAL,
        flute_count INTEGER,
        coating TEXT,
        grade TEXT,
        shape TEXT
    )
''')
cursor.execute("INSERT INTO tools (type, diameter, flute_count) VALUES ('drill', 6.0, 2)")
cursor.execute("INSERT INTO tools (type, diameter, flute_count, coating) VALUES ('end_mill', 8.0, 4, 'TiN')")
cursor.execute("INSERT INTO tools (type, grade, shape) VALUES ('insert', 'C6', 'round')")
conn.commit()

print("=== The Problem: Variable-Structure Data in a Relational Table ===")
print("tools table columns: id, type, diameter, flute_count, coating, grade, shape")
for row in cursor.execute('SELECT type, diameter, flute_count, coating, grade, shape FROM tools').fetchall():
    type_, *fields = row
    labels = ['diameter', 'flute_count', 'coating', 'grade', 'shape']
    field_str = ', '.join(f"{l}={v}" for l, v in zip(labels, fields))
    print(f"{type_} row: {field_str}")
print("  ← 4 of 7 columns are NULL for any given row — wasted structure, awkward queries")
```

### SAVE AND TRY

```bash
python nosql.py
```

**Expected:**
```
=== The Problem: Variable-Structure Data in a Relational Table ===
tools table columns: id, type, diameter, flute_count, coating, grade, shape
drill row: diameter=6.0, flute_count=2, coating=None, grade=None, shape=None
end_mill row: diameter=8.0, flute_count=4, coating=TiN, grade=None, shape=None
insert row: diameter=None, flute_count=None, coating=None, grade=C6, shape=round
```

**Confirm the structural mismatch, precisely:** EVERY row wastes MOST of its columns as `NULL` — a drill row has ZERO use for `grade`/`shape` (insert-specific fields), and an insert row has ZERO use for `diameter`/`flute_count`/`coating` (cutting-tool-specific fields). Worse: adding a FOURTH tool type (say, a reamer with its own unique fields) means ALTERing the table AGAIN, adding MORE mostly-unused columns for everyone else. This is the exact scenario relational modeling handles POORLY — LAB-58's normalization rules don't even directly apply here, because the PROBLEM isn't redundancy, it's variable STRUCTURE.

---

## Step 2 — A Document Store

```python
tools_documents = [
    {'type': 'drill', 'diameter': 6.0, 'flute_count': 2},
    {'type': 'end_mill', 'diameter': 8.0, 'flute_count': 4, 'coating': 'TiN'},
    {'type': 'insert', 'grade': 'C6', 'shape': 'round'},
]

print("\n=== Fixed: A Document Store ===")
for doc in tools_documents:
    print(f"{doc['type']} document: {doc}")
print("  ← each document has EXACTLY the fields relevant to ITS type — no wasted NULLs")
```

### SAVE AND TRY

```bash
python nosql.py
```

**Expected:**
```
=== Fixed: A Document Store ===
drill document: {'type': 'drill', 'diameter': 6.0, 'flute_count': 2}
end_mill document: {'type': 'end_mill', 'diameter': 8.0, 'flute_count': 4, 'coating': 'TiN'}
insert document: {'type': 'insert', 'grade': 'C6', 'shape': 'round'}
  ← each document has EXACTLY the fields relevant to ITS type — no wasted NULLs
```

**Confirm the schema-PER-DOCUMENT model:** Each dictionary (a JSON-like "document," MongoDB's exact terminology) has ONLY the fields that make sense for ITS type — no `NULL` waste, and adding a FOURTH tool type means adding NEW documents with WHATEVER fields they need, with ZERO impact on the drill/end_mill/insert documents already stored. This is the direct trade-off: you GIVE UP the relational guarantee "every row of this collection has the same shape," and in EXCHANGE, gain the flexibility this exact scenario needs.

**What you're trading away:** There's no `FOREIGN KEY` enforcement (LAB-56), no guaranteed structure a query can rely on (a typo'd field name silently returns nothing instead of a clear error), and cross-document consistency (LAB-59's transactions) is typically weaker or scoped differently. This is a REAL cost — not a strictly-better alternative, a DIFFERENT set of trade-offs.

---

## Step 3 — A Key-Value Store: The Simplest Database

```python
import json

class KeyValueStore:                        # ← add: literally LAB-04's hash map, wearing a "database" label
    def __init__(self):
        self.data = {}

    def set(self, key, value):
        self.data[key] = value

    def get(self, key):
        return self.data.get(key)

kv = KeyValueStore()

print("\n=== Key-Value Store: The Simplest Database ===")
print("set('session:abc123', {...user data...})")
kv.set('session:abc123', {'user_id': 42, 'logged_in_at': '2026-01-01T10:00:00'})

result = kv.get('session:abc123')
print(f"get('session:abc123'): O(1) — {result}")
print("  ← no schema, no query language — just get/set by key, as fast as a hash map")
```

### SAVE AND TRY

```bash
python nosql.py
```

**Expected:**
```
=== Key-Value Store: The Simplest Database ===
set('session:abc123', {...user data...})
get('session:abc123'): O(1) — {'user_id': 42, 'logged_in_at': '2026-01-01T10:00:00'}
  ← no schema, no query language — just get/set by key, as fast as a hash map
```

**Confirm this is LITERALLY LAB-04's hash map, with nothing added:** `KeyValueStore` is `self.data = {}` plus two thin methods — there is NO query language, NO schema, NO relationships. This EXTREME simplicity is the entire point: a key-value store (Redis, DynamoDB in its simplest mode) trades away almost EVERY capability a relational database offers (joins, complex queries, schema enforcement) in exchange for the SIMPLEST, FASTEST possible access pattern — O(1) by key, always, no matter how much data is stored (LAB-08).

---

### Concept: A Decision Framework

**What it is:** "NoSQL" isn't one thing — it's several genuinely DIFFERENT approaches (document, key-value, and others like column-family and graph databases) each making a DIFFERENT trade-off. The right choice depends on your DATA SHAPE and ACCESS PATTERN, not a blanket "NoSQL is faster" belief (it usually isn't inherently faster — it's DIFFERENTLY shaped, for different problems).

---

## Step 4 — Apply the Framework

```python
scenarios = [
    ("bank account balances, strict consistency needed", "RELATIONAL",
     "needs ACID transactions (LAB-59), foreign keys, and guaranteed structure"),
    ("product catalog with wildly different fields per category", "DOCUMENT",
     "each product type has genuinely different attributes — Step 1's exact problem"),
    ("session cache, cache invalidation, rate limiting", "KEY-VALUE",
     "pure lookup-by-ID, extreme speed matters more than query flexibility"),
]

print("\n=== Decision Framework ===")
for scenario, choice, reason in scenarios:
    print(f"scenario: {scenario} -> {choice}")
```

### SAVE AND TRY

```bash
python nosql.py
```

**Expected:**
```
=== Decision Framework ===
scenario: bank account balances, strict consistency needed -> RELATIONAL
scenario: product catalog with wildly different fields per category -> DOCUMENT
scenario: session cache, cache invalidation, rate limiting -> KEY-VALUE
```

**Confirm the reasoning behind each choice, not just the label:** Bank balances need LAB-59's ACID transactions — losing money to a race condition is unacceptable, and relational databases are BUILT for this guarantee. A product catalog has Step 1's EXACT variable-structure problem — a document store fits naturally. A session cache is PURE lookup-by-key, accessed at extremely high frequency — a key-value store's O(1) simplicity (Step 3) is exactly what's needed, and its lack of query flexibility is irrelevant since sessions are ALWAYS looked up by their exact ID.

---

## 🎯 Challenge: Model the Same Scenario Both Ways

**You know:** Real systems often use MULTIPLE database types together — relational for the "core of record" data, document/key-value for specific sub-problems that fit better.

**Task:** For an e-commerce order system, sketch which PARTS would be relational (needing strict consistency/relationships) and which parts would be document or key-value (needing flexibility or raw speed). Justify each choice.

<details>
<summary>▶ Show Solution</summary>

```
orders, order_items, payments   -> RELATIONAL
  (needs ACID transactions — LAB-59's exact bank-transfer-style guarantee for "charge card + create order together")

product_catalog                 -> DOCUMENT
  (wildly different attributes per category: clothing has size/color, electronics has wattage/ports — Step 1's exact problem)

shopping_cart (pre-checkout)    -> KEY-VALUE
  (looked up by session ID only, extremely high read/write frequency, doesn't need durability guarantees as strong as a completed order)

product_search_index            -> a SPECIALIZED structure (LAB-53/54's inverted index — arguably its own NoSQL category)
```

**Key insight:** A real production system is RARELY "all relational" or "all NoSQL" — it's a DELIBERATE mix, choosing the RIGHT storage model for EACH sub-problem's actual shape and access pattern, exactly like this lab's Step 4 framework. Understanding the TRADE-OFFS (not just memorizing "NoSQL = flexible, SQL = strict") is what lets you make this kind of mixed, informed decision instead of defaulting to whichever technology is trendiest.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| Document store | MongoDB, CouchDB, Firestore |
| Key-value store | Redis, DynamoDB (simple mode), Memcached |
| Relational (LAB-56–59) | PostgreSQL, MySQL, SQLite |
| Mixed architecture (Challenge) | Nearly every real production system at any meaningful scale |

**Where you will see this again:** LAB-65 (Caching Layer) builds a REAL key-value cache (Redis-style). LAB-2.6 in engineering-drills (marked COMPLETE, via the taski labs) covers MongoDB's document model in much greater depth.

---

## Final Check

| Feature | How to verify |
|---|---|
| The relational NULL-waste problem is demonstrated directly with real data | Step 1 |
| A document store correctly represents variable-structure data with no wasted fields | Step 2 |
| A key-value store correctly performs O(1) get/set, with zero query capability beyond that | Step 3 |
| Each of three scenarios is correctly matched to relational/document/key-value | Step 4 |
| A mixed-architecture real system is correctly sketched with justified choices | Challenge |
| You can explain, without notes, why "NoSQL" isn't one single technology | Concept box |

---

## Quick Check Answers

**1. A `tools` table with drill/end_mill/insert fields — what happens?**

Most columns end up `NULL` for any given row — Step 1 demonstrated this directly: every row wasted 4 of its 7 columns. This isn't just wasteful storage; it also makes queries awkward (you often need to check "is this column meaningfully filled for this row's type?" as extra logic) and means every NEW tool type requires altering the table again, affecting every EXISTING row's structure even though they don't need the new columns at all.

**2. Key-value's extreme simplicity — what's the trade-off?**

You give up EVERYTHING beyond "look up by exact key" — no querying by a field's VALUE, no relationships between keys, no complex filtering or joining. Step 3's `KeyValueStore` can answer "what's stored at key X" instantly, but has NO way to answer "find all values where some field equals Y" without manually scanning every value — exactly the O(n) cost LAB-08 and LAB-57 studied, except here there's no possible INDEX to fix it, because the store fundamentally only understands keys, not the internal structure of values.

**3. Is NoSQL one technology or several different approaches?**

Several genuinely DIFFERENT approaches — document stores (Step 2), key-value stores (Step 3), and others (column-family databases, graph databases) each make DIFFERENT trade-offs suited to DIFFERENT problems. Treating "NoSQL" as one interchangeable category is a common, costly mistake — a document store's strengths (flexible per-record structure) have almost nothing to do with a key-value store's strengths (raw lookup speed), and choosing between them requires understanding what EACH one specifically trades away, not just "SQL vs. not-SQL."

---

*Next: [LAB-61 — Consistency Models](LAB-61-consistency-models.md) — Python, same module*
