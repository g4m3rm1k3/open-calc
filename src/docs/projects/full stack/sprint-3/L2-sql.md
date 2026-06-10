# Sprint 3 · Lesson 2 — SQL: write queries against real data

## What you will build

By the end of this lesson, you will have created the `work_orders` table in Postgres, inserted five rows, retrieved them with filters, updated one, and deleted one — all using SQL written directly in TablePlus. You will understand what SQL is, why it exists, how each statement maps to the operations you wrote in Python in Sprint 2, and what the database is actually doing when you run a query.

---

## What you need to know first

- Sprint 3 L1: Postgres is running in Docker, TablePlus is connected.
- Sprint 2 L1: The work order data structure (id, title, status, priority, assigned_to).

---

## The lesson

---

### 1. What SQL is

**The problem:** You have a database. A database stores data. SQL is how you communicate with it.

**What SQL is:** SQL stands for Structured Query Language. It is a **declarative language** for interacting with relational databases. Declarative means you state *what* you want, not *how* to get it. `SELECT * FROM work_orders WHERE status = 'open'` says "give me all open work orders." The database decides how to find them — which indexes to use, in what order to scan data, how to optimise the query. You describe the result; the database computes it.

SQL has four core statement types that map directly to the CRUD operations you built in Sprint 2:

| SQL statement | CRUD operation | HTTP verb |
|---|---|---|
| `INSERT` | Create | POST |
| `SELECT` | Read | GET |
| `UPDATE` | Update | PUT/PATCH |
| `DELETE` | Delete | DELETE |

SQL was invented in the 1970s by IBM, standardised by ANSI and ISO, and is used by every major database: Postgres, MySQL, SQLite, Oracle, SQL Server. The SQL you write in this lesson works on all of them with minor variations.

In TablePlus, open the SQL editor: press `Cmd+Enter` (Mac) or `F5` (Windows/Linux) to run queries, or use the keyboard shortcut shown in the interface.

---

### 2. CREATE TABLE

**The problem:** The database has no tables yet. You need to create one that matches the `WorkOrder` data model from Sprint 2.

In the TablePlus SQL editor, run:

```sql
CREATE TABLE work_orders (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'open',
    priority    TEXT NOT NULL,
    assigned_to TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Walkthrough — every part of the statement:**

`CREATE TABLE work_orders` — creates a new table named `work_orders` in the current database. A **table** is the fundamental data structure in a relational database: a collection of rows (records), where every row has the same set of columns (fields).

`id SERIAL PRIMARY KEY` — three things about the `id` column:
- `SERIAL` is a Postgres data type that is shorthand for "an integer that auto-increments." Every time you insert a row without specifying `id`, Postgres assigns the next integer automatically (1, 2, 3, ...). This replaces the `next_id` counter in your Python code.
- `PRIMARY KEY` makes `id` the primary key: every row is uniquely identified by this column, the value cannot be null, and Postgres automatically creates an **index** on it. An index is a data structure (typically a B-tree) that Postgres maintains alongside the table to make lookups by primary key fast. `SELECT * FROM work_orders WHERE id = 42` uses the index and is O(log n) instead of O(n).

`title TEXT NOT NULL` — a `TEXT` column named `title`. `TEXT` in Postgres is a variable-length string with no length limit. `NOT NULL` is a **constraint** — Postgres will reject any insert or update that tries to put `NULL` into this column.

`status TEXT NOT NULL DEFAULT 'open'` — a `TEXT` column with `NOT NULL` and a default value. `DEFAULT 'open'` means if no value is provided for `status` in an `INSERT`, Postgres uses `'open'` automatically.

`assigned_to TEXT` — no `NOT NULL` constraint. This column can be `NULL` — the work order may not be assigned to anyone. This mirrors `Optional[str]` in Pydantic.

`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()` — a timestamp column. `TIMESTAMP WITH TIME ZONE` stores date and time with timezone information. `DEFAULT NOW()` means if no value is provided, Postgres uses the current timestamp at the moment of insertion. This gives you a free audit trail.

Verify the table was created: in TablePlus, press `Cmd+R` to refresh. Under Schemas → public → Tables, `work_orders` appears.

**CS lens — the schema as a static type system for data.** `CREATE TABLE` is the database equivalent of a TypeScript interface. The column definitions — their names, their types, their constraints — form a **schema**: a contract that every row must satisfy. The database enforces this contract at write time. If you try to insert `title = NULL`, Postgres rejects the insert with `null value in column "title" violates not-null constraint`. This is runtime type enforcement at the data layer — analogous to Pydantic's `ValidationError` at the API layer.

**SE lens — two layers of validation.** You now have validation at two layers: Pydantic validates data when it enters the API (the HTTP boundary), and Postgres validates data when it enters the database (the storage boundary). Belt-and-suspenders validation. Pydantic catches most errors early with clear error messages. Postgres catches anything that slips through (e.g., a bug in your service layer that bypasses Pydantic) with a database error. Defence in depth.

**Real-world connection:** `SERIAL PRIMARY KEY` is the standard for auto-incrementing integer IDs in Postgres. Modern databases also offer `UUID` primary keys — universally unique identifiers that are not sequential and do not reveal the number of records in the table (a sequential ID of 42 tells a competitor "you have at least 42 users"). You will use `UUID` in larger production systems; `SERIAL` is sufficient for this curriculum.

**What breaks without this:** Running `INSERT INTO work_orders (title) VALUES ('Fix belt')` (missing `priority`) fails with `null value in column "priority" violates not-null constraint`. The `NOT NULL` constraint works. Fix: include all required columns in every insert.

---

### 3. INSERT rows

**The problem:** The table exists but is empty. Insert five work orders.

```sql
INSERT INTO work_orders (title, status, priority, assigned_to)
VALUES
    ('Fix conveyor belt', 'open', 'high', 'Alice'),
    ('Lubricate pump', 'open', 'medium', NULL),
    ('Replace gasket', 'in_progress', 'high', 'Bob'),
    ('Inspect safety valves', 'closed', 'low', 'Alice'),
    ('Clean filters', 'open', 'medium', NULL);
```

**Walkthrough:**

`INSERT INTO work_orders (title, status, priority, assigned_to)` — specifies which columns to insert into. `id` and `created_at` are omitted because they have defaults (`SERIAL` and `NOW()`). The column list maps to the `VALUES` list by position: the first value in each row goes to `title`, the second to `status`, etc.

`VALUES` clause — contains one tuple per row. Each tuple `(...)` is one row. Multiple tuples are separated by commas. Postgres inserts all five rows in a single statement, which is more efficient than five separate inserts.

`NULL` — the SQL null value. Unlike Python's `None`, SQL `NULL` means "unknown" or "absent." `NULL` is not equal to anything — not even to `NULL`. `WHERE assigned_to = NULL` returns zero rows (even when `assigned_to` is null) because `NULL = NULL` is `NULL` (unknown), not `TRUE`. You must use `WHERE assigned_to IS NULL` to check for null.

**Verify:** In TablePlus, click the `work_orders` table to view the rows. You should see 5 rows with `id` values 1–5 (auto-assigned by `SERIAL`) and `created_at` timestamps (auto-set by `NOW()`).

**CS lens — transactional insert.** By default in Postgres, each SQL statement runs in its own implicit transaction. A **transaction** is an all-or-nothing operation: either all the rows in this `INSERT VALUES (...)` are inserted, or none are (if, say, one row violates a constraint). You will use explicit transactions in Lesson 3 when SQLAlchemy manages them.

**SE lens — never hardcode IDs.** The five rows receive IDs 1–5 because the sequence starts at 1. Do not assume specific IDs in application code — the auto-increment value depends on how many rows have been inserted and deleted. Always retrieve the ID after insertion; never assume it. `INSERT ... RETURNING id` (shown below) is the SQL-level solution.

---

### 4. SELECT with filters

**The problem:** Retrieve rows matching specific criteria.

Run each query separately and observe the results:

```sql
-- All open orders
SELECT * FROM work_orders WHERE status = 'open';

-- High priority orders assigned to Alice
SELECT * FROM work_orders WHERE priority = 'high' AND assigned_to = 'Alice';

-- Orders not yet assigned
SELECT * FROM work_orders WHERE assigned_to IS NULL;

-- Order count by status
SELECT status, COUNT(*) as order_count
FROM work_orders
GROUP BY status
ORDER BY order_count DESC;
```

**Walkthrough:**

`SELECT * FROM work_orders WHERE status = 'open'` — `*` means all columns. `WHERE status = 'open'` filters to rows where `status` equals the string `'open'`. SQL strings use single quotes. The database scans the table (or uses an index if one exists on `status`) and returns matching rows.

`AND` — combines two conditions. Both must be true for the row to be included. `OR` would include rows where either condition is true.

`WHERE assigned_to IS NULL` — the correct way to check for null. `IS NULL` is not `= NULL`. This is one of SQL's most common gotchas: `NULL = NULL` evaluates to `NULL` (unknown), not `TRUE`. Always use `IS NULL` and `IS NOT NULL`.

`COUNT(*) as order_count` — `COUNT(*)` is an **aggregate function** — it counts the number of rows in a group. `as order_count` is a **column alias** — it renames the result column. `GROUP BY status` groups the rows by their `status` value and applies the aggregate to each group separately. `ORDER BY order_count DESC` sorts the result by `order_count` descending (highest first).

**CS lens — SQL as set operations.** A SQL query operates on sets of rows, not individual rows. `WHERE status = 'open'` does not loop through rows — it describes a set (all rows where `status = 'open'`). The database executes the query using whatever algorithm is most efficient for that set operation — full table scan, index scan, hash join. This is the declarative nature of SQL: you describe the set; the database's **query planner** decides how to compute it.

**SE lens — explain the query plan.** When performance matters, `EXPLAIN SELECT * FROM work_orders WHERE status = 'open'` shows the query plan — what the database will do to execute the query. "Seq Scan" means it scans every row. "Index Scan" means it uses an index. For a 5-row table, the difference is invisible. For a 5-million-row table, a missing index on `status` is the difference between a 1ms response and a 5-second one. Sprint 3 L3 will add relevant indexes.

**What breaks without this:** `WHERE assigned_to = NULL` returns zero rows even when there are null `assigned_to` values. The fix is always `IS NULL`. This is a frequently introduced bug in code written by developers who learned SQL casually.

---

### 5. UPDATE and RETURNING

**The problem:** Change an existing row. Retrieve the updated row in a single query.

```sql
UPDATE work_orders
SET status = 'in_progress', assigned_to = 'Charlie'
WHERE id = 2
RETURNING *;
```

**Walkthrough:**

`UPDATE work_orders SET status = 'in_progress', assigned_to = 'Charlie' WHERE id = 2` — updates the row with `id = 2`. `SET` lists the columns to change and their new values. The `WHERE` clause limits which rows are updated. Without `WHERE`, every row would be updated — a destructive mistake.

`RETURNING *` — returns the updated row. By default, `UPDATE` does not return data — it just modifies. `RETURNING` makes it return the specified columns (or all columns with `*`) after the update. This means you can update a row and retrieve its new state in a single round-trip to the database, instead of running `UPDATE` then `SELECT`. SQLAlchemy uses this internally.

**CS lens — `RETURNING` as an atomic read-after-write.** Without `RETURNING`, updating a row and reading it requires two queries in two round-trips. Between those two operations, another process could update the row. `RETURNING` gives you the state of the row exactly after your update — atomically, within the same transaction. No race condition possible.

**SE lens — always use `WHERE` on `UPDATE` and `DELETE`.** An `UPDATE` or `DELETE` without a `WHERE` clause affects every row in the table. This is almost always a bug. Some database GUIs require you to confirm before running `UPDATE` without `WHERE`. In application code, always pass the ID as a parameter. SQLAlchemy makes this safe by requiring explicit filtering on updates.

---

### 6. DELETE

**The problem:** Remove a row.

```sql
DELETE FROM work_orders WHERE id = 4;
```

Verify with `SELECT * FROM work_orders` — you should see 4 rows; ID 4 is gone.

**Walkthrough:** `DELETE FROM work_orders WHERE id = 4` removes the row where `id = 4`. The `SERIAL` sequence does not reset — the next inserted row gets ID 6 (not ID 4). Deleted IDs are not reused. This is intentional: if another part of your system stored a reference to order 4, reusing the ID would attach the old references to the new row.

**CS lens — delete as tombstoning vs hard delete.** This is a **hard delete** — the row is permanently gone. Many production systems use **soft delete** instead: a `deleted_at TIMESTAMP` column. Setting `deleted_at = NOW()` marks a row as deleted without removing it. Queries filter out soft-deleted rows with `WHERE deleted_at IS NULL`. Soft delete preserves the audit trail (you can see that the row existed and when it was deleted) at the cost of accumulating rows over time. Which approach to use is a business decision — "do we need to know that this work order was ever deleted?"

**SE lens — referential integrity.** If another table had a foreign key pointing to `work_orders(id)` — for example, a `comments` table where `work_order_id` references `work_orders(id)` — deleting a work order without first deleting its comments would violate the foreign key constraint. Postgres would reject the delete. You configure this behaviour with `ON DELETE CASCADE` (delete child rows automatically) or `ON DELETE RESTRICT` (reject the delete if child rows exist). This is why thinking about relationships between tables before building them matters.

---

### 7. `NULL` in depth

**The problem:** `NULL` in SQL is a three-valued logic that surprises every developer. Understand it before it burns you in production.

```sql
-- NULL comparisons
SELECT NULL = NULL;         -- returns NULL (not TRUE)
SELECT NULL IS NULL;        -- returns TRUE
SELECT NULL IS NOT NULL;    -- returns FALSE

-- NULL in arithmetic
SELECT 5 + NULL;            -- returns NULL

-- NULL in aggregates
SELECT COUNT(*) FROM work_orders;           -- counts all rows including NULLs
SELECT COUNT(assigned_to) FROM work_orders; -- counts only non-NULL assigned_to values
```

**Walkthrough:**

`NULL = NULL` returns `NULL` — not `TRUE`. In SQL's three-valued logic, every expression involving `NULL` evaluates to `NULL` (unknown). `5 = NULL` is `NULL`. `NULL AND TRUE` is `NULL`. This is consistent with the meaning: if the value is unknown, the result of comparing it is also unknown.

`NULL IS NULL` returns `TRUE` — `IS NULL` is a special test that checks whether a value is null. It does not use the `=` operator and is not subject to three-valued logic.

`5 + NULL` returns `NULL` — arithmetic with `NULL` propagates null. If one operand is unknown, the result is unknown.

`COUNT(assigned_to)` counts only non-null values — aggregate functions (except `COUNT(*)`) ignore `NULL`. This is correct behaviour: if you want the count of assigned orders, `COUNT(assigned_to)` gives it.

**CS lens — three-valued logic.** Standard Boolean logic is two-valued: `TRUE` or `FALSE`. SQL's three-valued logic adds `NULL` (unknown). This is mathematically sound but counterintuitive to developers who expect `NULL = NULL` to be `TRUE`. The rule: any comparison with `NULL` produces `NULL`. To test for null, use `IS NULL`. This distinction matters in `WHERE` clauses: `WHERE assigned_to != 'Alice'` does not return rows where `assigned_to IS NULL` — those rows are excluded because `NULL != 'Alice'` is `NULL` (unknown), not `TRUE`.

**What breaks without this:** `WHERE status != 'closed'` does not return rows with `status IS NULL`. If `status` can be null, you need `WHERE status != 'closed' OR status IS NULL`. This bug is invisible in development (where test data usually has non-null statuses) and appears in production (where real data has gaps).

---

## Connect the pieces

Every query in this lesson corresponds to an operation in your FastAPI routes:

| SQL operation | FastAPI endpoint |
|---|---|
| `INSERT INTO work_orders ...` | `POST /orders` |
| `SELECT * FROM work_orders` | `GET /orders` |
| `SELECT ... WHERE id = ?` | `GET /orders/{id}` |
| `UPDATE work_orders SET ... WHERE id = ?` | `PUT /orders/{id}` |
| `DELETE FROM work_orders WHERE id = ?` | `DELETE /orders/{id}` |

In Lesson 3, SQLAlchemy translates your Python code into these SQL statements and executes them against the Postgres database. You will see the actual SQL in the logs — which is why understanding it matters: you will read it and recognise it.

---

## What breaks without this

**`UPDATE` without `WHERE` updates every row:** Test this in TablePlus — it is recoverable in development, catastrophic in production. Always verify your `WHERE` clause before running `UPDATE` or `DELETE`.

**`NULL` not matching in `WHERE`:** `WHERE assigned_to != NULL` never matches any rows because `!= NULL` evaluates to `NULL`. Use `WHERE assigned_to IS NOT NULL`.

---

## Definition of done

- [ ] `work_orders` table exists in the `workorders` database with all six columns
- [ ] 5 rows are present (or 4 after the delete)
- [ ] You ran all queries in this lesson and can read the output
- [ ] You can explain why `NULL = NULL` is `NULL`, not `TRUE`
- [ ] You can explain what `SERIAL PRIMARY KEY` does
- [ ] You can explain what `RETURNING *` does and why it is useful
- [ ] You can explain the difference between `COUNT(*)` and `COUNT(column_name)`

**Git commit:**

```
git commit -m "Write SQL foundation: CREATE TABLE, INSERT, SELECT with filters, UPDATE RETURNING, DELETE, and NULL behaviour documented"
```

Note: SQL written in TablePlus is not tracked by git. The commit message documents that you completed this lesson. The actual schema definition will be tracked when Alembic migrations are introduced in Lesson 4.
