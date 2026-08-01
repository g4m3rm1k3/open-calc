# SE Masterclass — LAB-56 — Relational Modeling

**Language: Python (SQLite)** — the runtime for most of Phase 5. SQLite ships with Python's standard library (`sqlite3`) — no server, no install, a real relational database in one file.

**Prerequisites:** LAB-04 (hash maps — a primary key lookup is conceptually the SAME O(1)-ish direct-access idea) and LAB-14 (relationships between tables are LAB-14's graph edges, just between rows instead of packages).

**What this lab adds:**
- Tables, rows, and columns — and why "one big flat table" breaks down
- Primary keys (uniquely identifying a row) and foreign keys (referencing another table's row)
- One-to-many relationships (a customer has many orders)
- Many-to-many relationships (students enroll in many courses; courses have many students) via a JOIN table

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A single "orders" table repeats each customer's name and email on EVERY row they order. What goes wrong if that customer's email changes?
> 2. A "customer_id" column in the `orders` table pointing to the `customers` table's `id` — what's this called, and what does it PREVENT?
> 3. Students take many courses, and courses have many students. Can this be modeled with a single foreign key column on EITHER table? Why or why not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python relational.py` prints:

```
=== The Problem: One Flat Table ===
inserted 3 orders, all for the same customer (redundant data)
customer email appears 3 TIMES: alice@example.com, alice@example.com, alice@example.com
updating email requires updating ALL 3 rows — miss one, and data disagrees with itself

=== Fixed: Customers and Orders (One-to-Many) ===
customers table: [(1, 'Alice', 'alice@example.com')]
orders table: [(1, 1, 'Book'), (2, 1, 'Pen'), (3, 1, 'Laptop')]
email stored ONCE — updating it touches exactly 1 row

=== Querying Across Tables: JOIN ===
Alice's orders: Book, Pen, Laptop
  ← customer info fetched once, orders fetched separately, JOINed together

=== Many-to-Many: Students and Courses ===
enrollments table: [(1,1), (1,2), (2,1)]
Alice is enrolled in: Math, Physics
Math has students: Alice, Bob

=== Foreign Key Enforcement ===
attempting to insert an order for customer_id=999 (doesn't exist)
Error: FOREIGN KEY constraint failed
```

---

### Concept: The Problem With One Flat Table

**What it is:** Cramming everything into ONE table — repeating a customer's name and email on every order row — creates REDUNDANT data. The same fact (Alice's email) is stored MULTIPLE times, and nothing enforces that all copies stay in agreement.

---

## Step 1 — Feel the Flat-Table Problem

```python
# relational.py
import sqlite3

conn = sqlite3.connect(':memory:')     # an in-memory database — real SQLite, no file needed for this lab
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE flat_orders (
        id INTEGER PRIMARY KEY,
        customer_name TEXT,
        customer_email TEXT,
        item TEXT
    )
''')

cursor.executemany(
    'INSERT INTO flat_orders (customer_name, customer_email, item) VALUES (?, ?, ?)',
    [('Alice', 'alice@example.com', 'Book'),
     ('Alice', 'alice@example.com', 'Pen'),
     ('Alice', 'alice@example.com', 'Laptop')]
)
conn.commit()

print("=== The Problem: One Flat Table ===")
print("inserted 3 orders, all for the same customer (redundant data)")
emails = cursor.execute('SELECT customer_email FROM flat_orders').fetchall()
print(f"customer email appears {len(emails)} TIMES: {', '.join(e[0] for e in emails)}")
print("updating email requires updating ALL 3 rows — miss one, and data disagrees with itself")
```

### SAVE AND TRY

```bash
python relational.py
```

**Expected:**
```
=== The Problem: One Flat Table ===
inserted 3 orders, all for the same customer (redundant data)
customer email appears 3 TIMES: alice@example.com, alice@example.com, alice@example.com
updating email requires updating ALL 3 rows — miss one, and data disagrees with itself
```

**Confirm the redundancy problem is real, not theoretical:** Run `UPDATE flat_orders SET customer_email = 'alice2@example.com' WHERE id = 1`. Now query all emails again — you'll see TWO different emails for the SAME PERSON (`alice2@example.com` on row 1, `alice@example.com` on rows 2 and 3) — the data has become internally INCONSISTENT, purely because the same fact was stored in multiple places and only some copies were updated. This exact problem is what LAB-58 (Normalization) formally studies and fixes.

---

## Step 2 — Split Into Customers and Orders (One-to-Many)

```python
cursor.execute('''
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT
    )
''')
cursor.execute('''
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,             -- ← add: FOREIGN KEY — a reference to customers.id
        item TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
''')

cursor.execute('INSERT INTO customers (name, email) VALUES (?, ?)', ('Alice', 'alice@example.com'))
alice_id = cursor.lastrowid

cursor.executemany(
    'INSERT INTO orders (customer_id, item) VALUES (?, ?)',
    [(alice_id, 'Book'), (alice_id, 'Pen'), (alice_id, 'Laptop')]
)
conn.commit()

print("\n=== Fixed: Customers and Orders (One-to-Many) ===")
print("customers table:", cursor.execute('SELECT * FROM customers').fetchall())
print("orders table:", cursor.execute('SELECT * FROM orders').fetchall())
print("email stored ONCE — updating it touches exactly 1 row")
```

### SAVE AND TRY

```bash
python relational.py
```

**Expected:**
```
=== Fixed: Customers and Orders (One-to-Many) ===
customers table: [(1, 'Alice', 'alice@example.com')]
orders table: [(1, 1, 'Book'), (2, 1, 'Pen'), (3, 1, 'Laptop')]
email stored ONCE — updating it touches exactly 1 row
```

**Confirm the redundancy is genuinely gone:** `alice@example.com` now appears EXACTLY ONCE, in `customers`. Every `orders` row references her via `customer_id = 1` — a small INTEGER, not a repeated copy of her name and email. Updating her email now means changing EXACTLY ONE ROW, and every order referencing her `customer_id` automatically "sees" the updated email the next time it's looked up — there's no possibility of disagreement, because there's only ONE copy of the fact.

**This is LAB-14's graph, applied to data:** `customers` and `orders` are two node TYPES; `customer_id` is a directed EDGE from an order to the customer it belongs to — exactly LAB-14's dependency graph structure, now representing real-world RELATIONSHIPS instead of package dependencies.

---

## Step 3 — Querying Across Tables: JOIN

```python
print("\n=== Querying Across Tables: JOIN ===")
result = cursor.execute('''
    SELECT customers.name, orders.item
    FROM orders
    JOIN customers ON orders.customer_id = customers.id
    WHERE customers.name = 'Alice'
''').fetchall()

items = [row[1] for row in result]
print(f"Alice's orders: {', '.join(items)}")
print("  ← customer info fetched once, orders fetched separately, JOINed together")
```

### SAVE AND TRY

```bash
python relational.py
```

**Expected:**
```
=== Querying Across Tables: JOIN ===
Alice's orders: Book, Pen, Laptop
  ← customer info fetched once, orders fetched separately, JOINed together
```

**Confirm `JOIN` is doing the "recombination" work:** Splitting into two tables (Step 2) SOLVED the redundancy problem but created a NEW question: "how do I get a customer's name ALONGSIDE their orders, if they're in different tables?" `JOIN ... ON orders.customer_id = customers.id` matches rows across the two tables WHERE the foreign key equals the referenced primary key — conceptually the SAME "match by key" idea as LAB-04's hash map lookup, just declared as a SQL relationship instead of a `dict[key]` access.

---

## Step 4 — Many-to-Many: A Join Table

**The problem:** Students take MULTIPLE courses; courses have MULTIPLE students. A single foreign key on EITHER table can't represent this — a `student_id` column on `courses` could only reference ONE student per course row, and vice versa.

**The solution:** A THIRD table — a **join table** (or "junction table") — with a row for EVERY (student, course) PAIR, each half a foreign key to one of the two "real" tables.

```python
cursor.execute('CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT)')
cursor.execute('CREATE TABLE courses (id INTEGER PRIMARY KEY, name TEXT)')
cursor.execute('''
    CREATE TABLE enrollments (
        student_id INTEGER,
        course_id INTEGER,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
    )
''')

cursor.executemany('INSERT INTO students (name) VALUES (?)', [('Alice',), ('Bob',)])
cursor.executemany('INSERT INTO courses (name) VALUES (?)', [('Math',), ('Physics',)])
cursor.executemany('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
                    [(1, 1), (1, 2), (2, 1)])                # Alice: Math + Physics.  Bob: Math only.
conn.commit()

print("\n=== Many-to-Many: Students and Courses ===")
print("enrollments table:", cursor.execute('SELECT * FROM enrollments').fetchall())

alice_courses = cursor.execute('''
    SELECT courses.name FROM enrollments
    JOIN courses ON enrollments.course_id = courses.id
    WHERE enrollments.student_id = 1
''').fetchall()
print(f"Alice is enrolled in: {', '.join(c[0] for c in alice_courses)}")

math_students = cursor.execute('''
    SELECT students.name FROM enrollments
    JOIN students ON enrollments.student_id = students.id
    WHERE enrollments.course_id = 1
''').fetchall()
print(f"Math has students: {', '.join(s[0] for s in math_students)}")
```

### SAVE AND TRY

```bash
python relational.py
```

**Expected:**
```
=== Many-to-Many: Students and Courses ===
enrollments table: [(1, 1), (1, 2), (2, 1)]
Alice is enrolled in: Math, Physics
Math has students: Alice, Bob
```

**Confirm the join table's shape:** `enrollments` has NO primary key data of its OWN interest — every row is JUST a pairing, `(student_id, course_id)`. Alice (id 1) has TWO rows (one per course) — a one-to-many relationship FROM the join table's perspective toward students, and ALSO one-to-many toward courses — the COMBINATION of two one-to-many relationships is exactly how a many-to-many relationship is represented relationally.

---

## 🎯 Challenge: Foreign Key Enforcement

**You know:** A foreign key is supposed to GUARANTEE that a referenced row actually exists — SQLite must be told to actually ENFORCE this (it's off by default, for historical compatibility reasons).

**Task:** Enable foreign key enforcement and confirm inserting an order for a NONEXISTENT customer is REJECTED.

<details>
<summary>▶ Show Solution</summary>

```python
conn2 = sqlite3.connect(':memory:')
conn2.execute('PRAGMA foreign_keys = ON')       # ← SQLite requires this explicitly — easy to forget!
cursor2 = conn2.cursor()

cursor2.execute('CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT)')
cursor2.execute('''
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        item TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
''')

print("\n=== Foreign Key Enforcement ===")
print("attempting to insert an order for customer_id=999 (doesn't exist)")
try:
    cursor2.execute('INSERT INTO orders (customer_id, item) VALUES (999, \'Ghost Item\')')
    conn2.commit()
except sqlite3.IntegrityError as e:
    print(f"Error: {e}")
```

**Key insight:** Without `PRAGMA foreign_keys = ON`, SQLite would SILENTLY ALLOW this invalid insert — the `orders` row would exist, pointing at a `customer_id` that has NO corresponding row in `customers`, an "orphaned" reference that would break any `JOIN` expecting to find that customer. This is LAB-09's boundary-validation instinct, enforced by the DATABASE ITSELF rather than relying on application code to always remember to check — a genuine defense-in-depth measure, since ANY future code path that inserts an order (a script, a different application, a manual `sqlite3` CLI session) gets this protection automatically, without needing to remember to re-implement the check.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| Tables, primary/foreign keys | Every relational database — PostgreSQL, MySQL, SQLite |
| One-to-many (`customer_id` on orders) | The most common relationship shape in real schemas |
| Many-to-many (join tables) | Tags on posts, permissions on roles, students on courses — everywhere |
| `JOIN` | How an ORM (LAB-62) fetches related objects behind the scenes |

**Where you will see this again:** LAB-58 (Normalization) formalizes the "eliminate redundancy" instinct from Step 1 into precise, named rules. LAB-62 (ORM) builds a layer that lets application code work with OBJECTS instead of writing `JOIN` queries by hand, though the underlying tables are structured exactly as this lab built them.

---

## Final Check

| Feature | How to verify |
|---|---|
| The flat-table redundancy problem is demonstrated directly | Step 1 |
| Customers and orders are correctly split with a foreign key relationship | Step 2 |
| A `JOIN` correctly recombines data across the two tables | Step 3 |
| A many-to-many relationship is correctly modeled via a join table | Step 4 |
| Foreign key enforcement rejects a reference to a nonexistent row | Challenge |
| You can explain, without notes, why a single foreign key can't model many-to-many | Step 4 |

---

## Quick Check Answers

**1. Flat table repeats customer email on every row — what goes wrong if it changes?**

The SAME fact (the customer's email) exists in MULTIPLE places, and updating it requires finding and changing EVERY copy — miss even one row, and the data becomes internally INCONSISTENT, with different rows disagreeing about the same customer's actual email, demonstrated directly in Step 1's "Change something" exercise.

**2. `customer_id` referencing `customers.id` — what's this called, and what does it prevent?**

A FOREIGN KEY — it prevents (when enforced, Step 4's Challenge) an `orders` row from referencing a customer that doesn't actually EXIST, guaranteeing every order can always be correctly traced back to a real, valid customer record. Without this enforcement, "orphaned" references (pointing at nothing) become possible, silently breaking any code that assumes every foreign key points somewhere real.

**3. Can many-to-many be modeled with a single foreign key on either table?**

No — demonstrated in Step 4's Concept box. A foreign key column can only hold ONE value per row, meaning a `student_id` column on `courses` could reference at most ONE student per course row — but a course legitimately has MANY students, and a student legitimately takes MANY courses. Representing this requires a THIRD table (a join table) with one row per (student, course) PAIR, giving each individual pairing its own row, which a single foreign key column on either original table structurally cannot do.

---

*Next: [LAB-57 — Indexing](LAB-57-indexing.md) — Python (SQLite), same module*
