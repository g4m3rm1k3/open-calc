# Concept: Foreign Keys and Referential Integrity

**What you'll understand by the end:** how one table's column can point
at a specific row in another table, and what stops that pointer from
ever pointing at nothing.

**Prerequisites:** `sql-create-table-and-schema.md`.

## Setup

```
python3 -c "import sqlite3; print(sqlite3.sqlite_version)"
```

## The Problem

Real data is rarely one flat table — a machine really does belong to a
real group, an order really does belong to a real customer. Storing that
relationship as a plain column (an ordinary string or integer, no
special meaning to the database) leaves nothing stopping a typo, a
deleted row, or a genuine bug from leaving that column pointing at a
group that was renamed, or never existed, or was deleted out from under
it — a real, silent, easy-to-introduce inconsistency.

## The Isolated Example

```python
import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("PRAGMA foreign_keys = ON")

connection.execute("CREATE TABLE groups (id TEXT PRIMARY KEY, name TEXT)")
connection.execute(
    "CREATE TABLE machines (id TEXT PRIMARY KEY, name TEXT, "
    "group_id TEXT, FOREIGN KEY (group_id) REFERENCES groups(id))"
)

connection.execute("INSERT INTO groups (id, name) VALUES ('g1', 'Mills')")
connection.execute(
    "INSERT INTO machines (id, name, group_id) VALUES ('m1', 'HAAS VF2', 'g1')"
)
connection.commit()
print("Real insert against a real, existing group: succeeded")

try:
    connection.execute(
        "INSERT INTO machines (id, name, group_id) VALUES ('m2', 'Doosan', 'does-not-exist')"
    )
    connection.commit()
except sqlite3.IntegrityError as e:
    print("Real insert against a non-existent group:", e)
```

**Real output:**
```
Real insert against a real, existing group: succeeded
Real insert against a non-existent group: FOREIGN KEY constraint failed
```

**What this proves:** the identical real `INSERT` statement, differing
only in what `group_id` names, succeeded when it pointed at a real,
existing row and failed, loudly, at the database level, when it didn't —
this check runs inside SQLite itself, not in any application code that
could forget to perform it.

## Mechanical Walkthrough

- `FOREIGN KEY (group_id) REFERENCES groups(id)` — declares that every
  real, non-null value in `machines.group_id` must equal some real,
  existing value in `groups.id` — a real, database-enforced rule, not a
  convention application code has to remember to check.
- `PRAGMA foreign_keys = ON` — SQLite specifically requires this
  pragma to actually enforce foreign keys at all (a real, SQLite-
  specific quirk — most other real database engines enforce this by
  default, with no equivalent opt-in needed).
- This real guarantee is called **referential integrity** — every real
  reference from one table to another genuinely refers to something
  that exists, enforced continuously, not just at the moment a row was
  first inserted (a real attempt to delete `g1` while `m1` still
  references it would also be rejected, by the identical real mechanism,
  unless the schema explicitly says otherwise).
- The referenced column (`groups.id`) is real, typically a **primary
  key** — the one column a foreign key can safely assume uniquely
  identifies exactly one real row.

## CS Lens

This is a real, enforced **invariant** — a fact the system guarantees
stays true at every point in time, not merely true "if application code
behaves." Enforcing it at the database layer, rather than trusting every
piece of application code that ever writes to these tables to check it
correctly, moves the guarantee to the one real place all of that code
already has to go through anyway.

Also recognized in: any real system with append-only or single-source-
of-truth invariants enforced structurally (a type checker refusing code
that could violate a type; a compiler rejecting a reference to an
undefined name) rather than trusted to every caller's own discipline.

## SE Lens

**A real foreign key is a database-enforced promise, and ORMs
(`orm-object-relational-mapping.md`) don't remove the need for it, even
though they add their own, separate, application-level conveniences on
top (cascading deletes, lazy-loaded relationships).** The real, honest
risk of skipping it: application code that "always remembers" to check
a reference is valid before writing it is one real refactor, one missed
code path, or one direct database edit away from silently breaking that
promise — a real foreign key keeps the guarantee true regardless of
which application code, or how many different ones, ever write to these
tables.

## Connection

Builds on `sql-create-table-and-schema.md`. Directly relevant to
`orm-cascade-delete-vs-core-delete.md` (what happens on the *other* side
of this same real relationship, when a referenced row is deleted).

## Try It Yourself

1. Insert a real group, then a real machine referencing it, then try to
   `DELETE FROM groups WHERE id = 'g1'` while a real machine still
   references it — read the real, resulting error.
2. Run the identical failing insert from this file's own example with
   `PRAGMA foreign_keys = ON` removed entirely — confirm SQLite accepts
   the real, dangling reference silently, with no error at all,
   demonstrating the pragma is not just extra safety, it's the entire
   real difference between enforced and unenforced.
3. Look up `ON DELETE CASCADE` (a real, optional clause on a foreign key
   definition) and reason about the real, different tradeoff it makes
   compared to this example's own default (rejecting the delete outright
   instead of automatically deleting dependent rows too).
