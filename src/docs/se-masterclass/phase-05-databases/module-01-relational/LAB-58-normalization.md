# SE Masterclass — LAB-58 — Normalization

**Language: Python (SQLite)** — same module as LAB-56–57.

**Prerequisites:** LAB-56 (this lab formalizes the redundancy problem LAB-56's Step 1 demonstrated INTUITIVELY, into three precisely-named, checkable rules).

**What this lab adds:**
- **1NF**: every column holds one atomic value — no comma-separated lists hiding in a cell
- **2NF**: every non-key column depends on the ENTIRE primary key, not just part of it
- **3NF**: every non-key column depends DIRECTLY on the key, not on another non-key column
- Denormalization: when DELIBERATELY breaking these rules is the right engineering trade-off

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A `tags` column contains `"urgent,billing,vip"` as one comma-separated string. What can't you easily do with this data, that you COULD do if tags were separate rows?
> 2. A table's primary key is `(student_id, course_id)`. A column `student_name` depends only on `student_id`, not on the FULL key. What redundancy does this cause?
> 3. Normalization eliminates redundancy — so why would anyone EVER deliberately denormalize?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python normalization.py` prints:

```
=== 1NF Violation: Non-Atomic Values ===
tags column: "urgent,billing,vip"
finding all "urgent" tickets requires string parsing, not a clean WHERE clause
  ← violates 1NF: each cell should hold ONE value, not a hidden list

=== 1NF Fixed: One Tag Per Row ===
ticket_tags table: [(1,'urgent'), (1,'billing'), (1,'vip')]
finding "urgent" tickets: SELECT ticket_id FROM ticket_tags WHERE tag='urgent'
  ← a clean, indexable query — no string parsing needed

=== 2NF Violation: Partial Dependency ===
enrollments(student_id, course_id, student_name, grade)
student_name depends ONLY on student_id — repeated for every course that student takes
Alice's name stored 3 times (once per enrollment)

=== 2NF Fixed: Split Out the Partial Dependency ===
students(student_id, student_name) — name stored ONCE
enrollments(student_id, course_id, grade) — only what depends on the FULL key

=== 3NF Violation: Transitive Dependency ===
employees(id, name, department_id, department_name)
department_name depends on department_id, NOT directly on employee id
  ← changing a department's name requires updating EVERY employee row in it

=== 3NF Fixed: Split Out the Transitive Dependency ===
departments(department_id, department_name) — name stored ONCE per department
employees(id, name, department_id) — references the department, doesn't repeat its name

=== Denormalization: A Deliberate Trade-off ===
normalized: 3 JOINs needed for the dashboard query, 45ms
denormalized (redundant summary table): 0 JOINs needed, 2ms
  ← redundancy re-introduced ON PURPOSE, for read performance — kept in sync deliberately
```

---

### Concept: 1NF — Atomic Values

**What it is:** **First Normal Form** requires every column to hold ONE indivisible (atomic) value — never a hidden LIST crammed into a single cell as a delimited string.

---

## Step 1 — 1NF: Fix Non-Atomic Values

```python
# normalization.py
import sqlite3

conn = sqlite3.connect(':memory:')
cursor = conn.cursor()

cursor.execute('CREATE TABLE tickets_bad (id INTEGER PRIMARY KEY, title TEXT, tags TEXT)')
cursor.execute("INSERT INTO tickets_bad VALUES (1, 'Server down', 'urgent,billing,vip')")

print("=== 1NF Violation: Non-Atomic Values ===")
tags = cursor.execute("SELECT tags FROM tickets_bad WHERE id = 1").fetchone()[0]
print(f'tags column: "{tags}"')
print("finding all \"urgent\" tickets requires string parsing, not a clean WHERE clause")
print("  ← violates 1NF: each cell should hold ONE value, not a hidden list")

cursor.execute('CREATE TABLE tickets (id INTEGER PRIMARY KEY, title TEXT)')
cursor.execute('CREATE TABLE ticket_tags (ticket_id INTEGER, tag TEXT)')
cursor.execute("INSERT INTO tickets VALUES (1, 'Server down')")
cursor.executemany('INSERT INTO ticket_tags VALUES (?, ?)', [(1, 'urgent'), (1, 'billing'), (1, 'vip')])

print("\n=== 1NF Fixed: One Tag Per Row ===")
print("ticket_tags table:", cursor.execute('SELECT * FROM ticket_tags').fetchall())
print("finding \"urgent\" tickets: SELECT ticket_id FROM ticket_tags WHERE tag='urgent'")
print("  ← a clean, indexable query — no string parsing needed")
```

### SAVE AND TRY

```bash
python normalization.py
```

**Expected:**
```
=== 1NF Violation: Non-Atomic Values ===
tags column: "urgent,billing,vip"
finding all "urgent" tickets requires string parsing, not a clean WHERE clause
  ← violates 1NF: each cell should hold ONE value, not a hidden list

=== 1NF Fixed: One Tag Per Row ===
ticket_tags table: [(1, 'urgent'), (1, 'billing'), (1, 'vip')]
finding "urgent" tickets: SELECT ticket_id FROM ticket_tags WHERE tag='urgent'
  ← a clean, indexable query — no string parsing needed
```

**Confirm the practical cost of the violation:** With `tags` as one string, finding "urgent" tickets requires `WHERE tags LIKE '%urgent%'` — which CANNOT use an index efficiently (LAB-57), and would ALSO incorrectly match a tag like "nonurgent" if you're not careful with the pattern. The fixed `ticket_tags` table supports `WHERE tag = 'urgent'`, a clean, INDEXABLE, exact-match query — 1NF isn't just a formality; it directly enables the query patterns and indexing strategies from LAB-56–57.

---

### Concept: 2NF — No Partial Dependencies

**What it is:** **Second Normal Form** (which requires 1NF as a starting point) says: if a table's primary key is COMPOSITE (made of multiple columns), every non-key column must depend on the WHOLE key — not just PART of it.

---

## Step 2 — 2NF: Fix a Partial Dependency

```python
cursor.execute('''
    CREATE TABLE enrollments_bad (
        student_id INTEGER,
        course_id INTEGER,
        student_name TEXT,      -- depends ONLY on student_id — a PARTIAL dependency
        grade TEXT,              -- depends on BOTH student_id AND course_id — correct
        PRIMARY KEY (student_id, course_id)
    )
''')
cursor.executemany('INSERT INTO enrollments_bad VALUES (?, ?, ?, ?)', [
    (1, 101, 'Alice', 'A'), (1, 102, 'Alice', 'B'), (1, 103, 'Alice', 'A'),
])

print("\n=== 2NF Violation: Partial Dependency ===")
print("enrollments(student_id, course_id, student_name, grade)")
print("student_name depends ONLY on student_id — repeated for every course that student takes")
names = cursor.execute("SELECT student_name FROM enrollments_bad WHERE student_id = 1").fetchall()
print(f"Alice's name stored {len(names)} times (once per enrollment)")

cursor.execute('CREATE TABLE students (student_id INTEGER PRIMARY KEY, student_name TEXT)')
cursor.execute('''
    CREATE TABLE enrollments (
        student_id INTEGER,
        course_id INTEGER,
        grade TEXT,
        PRIMARY KEY (student_id, course_id)
    )
''')
cursor.execute("INSERT INTO students VALUES (1, 'Alice')")
cursor.executemany('INSERT INTO enrollments VALUES (?, ?, ?)', [(1, 101, 'A'), (1, 102, 'B'), (1, 103, 'A')])

print("\n=== 2NF Fixed: Split Out the Partial Dependency ===")
print("students(student_id, student_name) — name stored ONCE")
print("enrollments(student_id, course_id, grade) — only what depends on the FULL key")
```

### SAVE AND TRY

```bash
python normalization.py
```

**Expected:**
```
=== 2NF Violation: Partial Dependency ===
enrollments(student_id, course_id, student_name, grade)
student_name depends ONLY on student_id — repeated for every course that student takes
Alice's name stored 3 times (once per enrollment)

=== 2NF Fixed: Split Out the Partial Dependency ===
students(student_id, student_name) — name stored ONCE
enrollments(student_id, course_id, grade) — only what depends on the FULL key
```

**Confirm the diagnostic question:** For EVERY non-key column, ask: "does this depend on the WHOLE primary key, or just PART of it?" `grade` genuinely needs BOTH `student_id` AND `course_id` (a grade is specific to ONE student in ONE course) — it stays. `student_name` only needs `student_id` — a PARTIAL dependency, and exactly the same redundancy problem LAB-56's Step 1 demonstrated, just in a table with a COMPOSITE key instead of a single one.

---

### Concept: 3NF — No Transitive Dependencies

**What it is:** **Third Normal Form** (requires 2NF) says: a non-key column must depend DIRECTLY on the primary key — not on ANOTHER non-key column, which itself depends on the key (a "transitive" dependency — key → column A → column B).

---

## Step 3 — 3NF: Fix a Transitive Dependency

```python
cursor.execute('''
    CREATE TABLE employees_bad (
        id INTEGER PRIMARY KEY,
        name TEXT,
        department_id INTEGER,
        department_name TEXT      -- depends on department_id, NOT directly on id — TRANSITIVE
    )
''')
cursor.executemany('INSERT INTO employees_bad VALUES (?, ?, ?, ?)', [
    (1, 'Alice', 10, 'Engineering'), (2, 'Bob', 10, 'Engineering'), (3, 'Carol', 20, 'Sales'),
])

print("\n=== 3NF Violation: Transitive Dependency ===")
print("employees(id, name, department_id, department_name)")
print("department_name depends on department_id, NOT directly on employee id")
print("  ← changing a department's name requires updating EVERY employee row in it")

cursor.execute('CREATE TABLE departments (department_id INTEGER PRIMARY KEY, department_name TEXT)')
cursor.execute('''
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT,
        department_id INTEGER,
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
    )
''')
cursor.executemany('INSERT INTO departments VALUES (?, ?)', [(10, 'Engineering'), (20, 'Sales')])
cursor.executemany('INSERT INTO employees (id, name, department_id) VALUES (?, ?, ?)', [
    (1, 'Alice', 10), (2, 'Bob', 10), (3, 'Carol', 20),
])

print("\n=== 3NF Fixed: Split Out the Transitive Dependency ===")
print("departments(department_id, department_name) — name stored ONCE per department")
print("employees(id, name, department_id) — references the department, doesn't repeat its name")
```

### SAVE AND TRY

```bash
python normalization.py
```

**Expected:**
```
=== 3NF Violation: Transitive Dependency ===
employees(id, name, department_id, department_name)
department_name depends on department_id, NOT directly on employee id
  ← changing a department's name requires updating EVERY employee row in it

=== 3NF Fixed: Split Out the Transitive Dependency ===
departments(department_id, department_name) — name stored ONCE per department
employees(id, name, department_id) — references the department, doesn't repeat its name
```

**Confirm the CHAIN of dependency:** `id -> department_id -> department_name` — `department_name` doesn't depend on `id` DIRECTLY; it depends on `department_id`, which itself depends on `id`. This TRANSITIVE chain means renaming "Engineering" to "Software Engineering" requires updating EVERY employee row with `department_id = 10` — precisely the SAME redundancy bug as LAB-56's Step 1, discovered through a THIRD, more subtle pattern (a dependency hiding one level removed from the primary key, instead of directly duplicated).

---

### Concept: Denormalization — Breaking the Rules on Purpose

**What it is:** Full normalization MINIMIZES redundancy, but every `JOIN` needed to reassemble related data costs QUERY TIME (LAB-57). For READ-HEAVY systems (a dashboard queried thousands of times per second, updated rarely), it can be a DELIBERATE, informed trade-off to RE-INTRODUCE some redundancy — storing a precomputed, denormalized SUMMARY — accepting the update-consistency risk in exchange for dramatically faster reads.

---

## Step 4 — Denormalization as a Deliberate Trade-off

```python
import time

conn2 = sqlite3.connect(':memory:')
c2 = conn2.cursor()
c2.execute('CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT)')
c2.execute('CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department_id INTEGER)')
c2.execute('CREATE TABLE salaries (employee_id INTEGER, amount REAL)')
c2.execute("INSERT INTO departments VALUES (1, 'Engineering')")
c2.executemany('INSERT INTO employees VALUES (?, ?, ?)', [(i, f'emp-{i}', 1) for i in range(1000)])
c2.executemany('INSERT INTO salaries VALUES (?, ?)', [(i, 75000 + i) for i in range(1000)])

print("\n=== Denormalization: A Deliberate Trade-off ===")
start = time.perf_counter()
for _ in range(100):
    c2.execute('''
        SELECT departments.name, AVG(salaries.amount)
        FROM employees
        JOIN departments ON employees.department_id = departments.id
        JOIN salaries ON salaries.employee_id = employees.id
        GROUP BY departments.name
    ''').fetchall()
normalized_time = (time.perf_counter() - start) * 1000
print(f"normalized: 3 JOINs needed for the dashboard query, {normalized_time:.0f}ms")

c2.execute('CREATE TABLE department_summary (department_name TEXT, avg_salary REAL)')      # ← add: a DENORMALIZED, precomputed table
c2.execute('''
    INSERT INTO department_summary
    SELECT departments.name, AVG(salaries.amount)
    FROM employees JOIN departments ON employees.department_id = departments.id
    JOIN salaries ON salaries.employee_id = employees.id
    GROUP BY departments.name
''')

start = time.perf_counter()
for _ in range(100):
    c2.execute('SELECT * FROM department_summary').fetchall()
denormalized_time = (time.perf_counter() - start) * 1000
print(f"denormalized (redundant summary table): 0 JOINs needed, {denormalized_time:.0f}ms")
print("  ← redundancy re-introduced ON PURPOSE, for read performance — kept in sync deliberately")
```

### SAVE AND TRY

```bash
python normalization.py
```

**Expected (shape — the denormalized query should be measurably faster):**
```
=== Denormalization: A Deliberate Trade-off ===
normalized: 3 JOINs needed for the dashboard query, 45ms
denormalized (redundant summary table): 0 JOINs needed, 2ms
  ← redundancy re-introduced ON PURPOSE, for read performance — kept in sync deliberately
```

**Confirm this is a DELIBERATE, MANAGED trade-off, not a mistake:** `department_summary` DUPLICATES data already derivable from the normalized tables — exactly the kind of redundancy normalization eliminates. The difference from LAB-56's Step 1 problem: here, the redundancy is INTENTIONAL, DOCUMENTED, and requires a DELIBERATE process (recomputing `department_summary` periodically, or on every relevant write) to stay in sync — a conscious engineering choice, not an accidental design flaw.

---

## 🎯 Challenge: Normalize a Messy Table End-to-End

**You know:** All three normal forms and their diagnostic questions.

**Task:** Given this single flat table, identify EVERY normalization violation and split it into properly normalized tables:

```python
# orders_bad(order_id, customer_name, customer_email, product_names, product_id, product_price, category_id, category_name)
```

<details>
<summary>▶ Show Solution</summary>

**Violations found:**
- `product_names` (plural, comma-separated) — **1NF** violation
- `customer_name`/`customer_email` depend only on the customer, not the full order — a form of redundancy fixable the SAME way as LAB-56 (not strictly 2NF since `order_id` alone is presumably the key here, but the SAME "split out repeated facts" principle applies)
- `category_name` depends on `category_id`, not directly on the order or product — **3NF** transitive dependency

**Normalized structure:**
```python
# customers(customer_id, name, email)
# categories(category_id, name)
# products(product_id, name, price, category_id)     -- references categories
# orders(order_id, customer_id, order_date)            -- references customers
# order_items(order_id, product_id, quantity)           -- join table — one row per product IN an order
```

**Key insight:** Real-world tables are rarely violating just ONE normal form — this table needed FOUR separate fixes, applying THREE different diagnostic questions (atomic values? full-key dependency? direct-key dependency?) repeatedly across different column groups. Normalization isn't a single pass — it's a checklist you apply systematically, column by column, until every remaining non-key column depends on "the key, the whole key, and nothing but the key" (a classic mnemonic for 2NF+3NF together).

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| 1NF (atomic values) | Why "don't store CSV in a column" is universal database advice |
| 2NF/3NF (dependency rules) | The formal justification behind LAB-56's intuitive table-splitting |
| Denormalization | Read replicas, materialized views, cache tables (LAB-65) — all deliberate, managed redundancy |

**Where you will see this again:** LAB-62 (ORM) and LAB-66 (Analytics Engine) both need to reason about normalized vs. denormalized schemas — an ORM typically models NORMALIZED tables; an analytics/reporting system often deliberately DENORMALIZES for query speed.

---

## Final Check

| Feature | How to verify |
|---|---|
| A 1NF violation (comma-separated values) is identified and fixed | Step 1 |
| A 2NF violation (partial dependency on a composite key) is identified and fixed | Step 2 |
| A 3NF violation (transitive dependency) is identified and fixed | Step 3 |
| Denormalization is demonstrated as a deliberate, measured trade-off | Step 4 |
| A messy real-world table is fully normalized across all three forms | Challenge |
| You can state, from memory, the diagnostic question for each of 1NF/2NF/3NF | All steps |

---

## Quick Check Answers

**1. What can't you easily do with a comma-separated `tags` column?**

Query for an exact tag efficiently (an indexable `WHERE tag = 'urgent'`), or use a foreign key to reference a shared "tags" concept, or avoid accidental substring false-matches (`'nonurgent'` matching a `LIKE '%urgent%'` search) — demonstrated directly in Step 1. Splitting tags into their own table (one row per ticket-tag pairing) turns "find urgent tickets" into a clean, exact, indexable query instead of fragile string parsing.

**2. `student_name` depending only on `student_id`, not the full `(student_id, course_id)` key — what redundancy?**

The student's name gets REPEATED once for every course they're enrolled in — Step 2 demonstrated this directly: Alice's name was stored 3 separate times, once per enrollment row, purely because it was placed in a table whose key includes `course_id`, even though the name has nothing to do with WHICH course. This is exactly LAB-56's core redundancy problem, just surfacing in a table with a composite key instead of a simple one.

**3. Why would anyone deliberately denormalize?**

For READ PERFORMANCE, when a system queries the SAME derived/aggregated data far more often than the underlying data changes — Step 4 demonstrated this directly: the denormalized `department_summary` table answered in a fraction of the time the fully-normalized 3-JOIN query needed, because the expensive aggregation work was done ONCE (or periodically) instead of on EVERY read. This is a deliberate, MANAGED trade-off — accepting some redundancy and the added responsibility of keeping it in sync, in exchange for dramatically cheaper reads on a hot path.

---

*Next: [LAB-59 — Transactions](LAB-59-transactions.md) — Python (SQLite), same module*
