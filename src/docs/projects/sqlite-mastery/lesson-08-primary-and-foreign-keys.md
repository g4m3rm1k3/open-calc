# Lesson 08: Primary and Foreign Keys

**What you will build:** a real `supplier_id` column on `parts`,
pointing at Lesson 07's real `suppliers` table — plus direct, run proof
of a genuinely surprising SQLite default that silently lets a broken
reference through unless one specific `PRAGMA` is set, every single
connection.

**What you need to know first:** [Lesson 07](lesson-07-constraints.md)
— the real `suppliers` table this lesson's own foreign key points at.
[Lesson 02](lesson-02-create-table-and-type-affinity.md) — `INTEGER
PRIMARY KEY` as a real `rowid` alias, the exact thing a foreign key
references on the `suppliers` side.

**Terms introduced in this lesson:**
- **Primary key** — the column (or columns) that uniquely identifies a
  row within its own table; `suppliers.id` and `parts.id`, per Lesson
  02, are each their table's real primary key.
- **Foreign key** — a column in one table holding a real value that
  must match some row's primary key in another (or the same) table,
  the mechanism that connects `parts` to `suppliers`.
- **Referential integrity** — the real guarantee that every foreign key
  value genuinely points at a row that exists, never a dangling
  reference to nothing.

**Objects and methods used:**

**`ALTER TABLE ... ADD COLUMN`**
- *What it is:* a real SQL statement that adds a new column to an
  already-existing table.
- *Implementation:* `ALTER TABLE table_name ADD COLUMN column_def;` —
  every existing row immediately gets the new column, set to `NULL`
  unless a `DEFAULT` is given.
- *Its use:* the real mechanism giving `parts` — already holding six
  real rows since Lesson 06 — a new `supplier_id` column without
  recreating the table from scratch. (SQLite's own real, much stricter
  limits on what `ALTER TABLE` can do beyond this are this series' own
  Lesson 49.)

**`REFERENCES`**
- *What it is:* a column constraint declaring that column a real
  foreign key.
- *Implementation:* `supplier_id INTEGER REFERENCES suppliers(id)` —
  names the target table and column the value must match.
- *Its use:* the real, declared link from a `parts` row to the
  `suppliers` row that supplies it.

**`PRAGMA foreign_keys`**
- *What it is:* a real, session-scoped setting controlling whether
  SQLite actually enforces `REFERENCES` constraints at all.
- *Implementation:* `PRAGMA foreign_keys;` reads the current setting;
  `PRAGMA foreign_keys = ON;` (or `= OFF;`) sets it — **off by default**,
  proven below, and not persisted: a fresh connection to the same file
  starts back at off again, every time.
- *Its use:* the exact setting this lesson proves is not optional to
  remember, despite defaulting to disabled.

---

## Concept Unit: A Real Foreign Key — Declared, but Not Yet Enforced

### The Problem

`suppliers` now holds two real rows. `parts` has no way to say which
supplier any given part comes from — nothing links the two tables at
all yet.

### Introduce the Concept in Isolation

No throwaway table — `parts` gets its real new column directly:

```
$ sqlite3 pocket_hardware.db
sqlite> ALTER TABLE parts ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id);
sqlite> .schema parts
CREATE TABLE parts (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    quantity INTEGER
, supplier_id INTEGER REFERENCES suppliers(id));
```

`.schema` shows `ALTER TABLE ADD COLUMN`'s own real, honest mechanism:
SQLite doesn't rewrite the original `CREATE TABLE` text to look
hand-authored — it literally appends the new column definition after
the original closing structure, comma included, which is why the real
schema above reads slightly awkwardly rather than as if `supplier_id`
had been there from Lesson 02 onward.

Every existing row now has this column, set to `NULL`:

```
sqlite> UPDATE parts SET supplier_id = 1 WHERE name IN ('Hammer', 'Wrench', 'Drill');
sqlite> UPDATE parts SET supplier_id = 2 WHERE name IN ('Tape Measure', 'Level');
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT id, name, supplier_id FROM parts;
id  name             supplier_id
--  ---------------  -----------
1   Hammer           1
2   Wrench           1
3   Drill             1
4   Tape Measure     2
5   Level             2
6   Screwdriver Set
```

`Screwdriver Set` (id `6`) is deliberately left with a `NULL`
`supplier_id` — a real, legitimate case (no supplier assigned yet),
proven safe below, and reused directly by this series' own Lesson 09.

Now the real, surprising part — a `supplier_id` that doesn't match any
real `suppliers` row at all:

```
sqlite> INSERT INTO parts (name, price, quantity, supplier_id) VALUES
   ...>     ('Bogus Part', 1.0, 1, 999);
```

This succeeds. No error, no rejection — despite `REFERENCES
suppliers(id)` being declared, and despite `999` matching no real
`suppliers.id` at all (only `1` and `2` genuinely exist).

```
sqlite> PRAGMA foreign_keys;
foreign_keys
------------
0
```

The real, root cause: `PRAGMA foreign_keys` reports `0` — **off** —
which was already its state before `Bogus Part`'s own `INSERT` ever
ran, and is SQLite's own real, documented default for every new
connection, unconditionally.

```
sqlite> PRAGMA foreign_keys = ON;
sqlite> INSERT INTO parts (name, price, quantity, supplier_id) VALUES
   ...>     ('Bogus Part 2', 1.0, 1, 999);
Runtime error: FOREIGN KEY constraint failed
```

The identical bad `supplier_id`, rejected this time — the only real
difference between the two attempts is `PRAGMA foreign_keys`'s own
state. `REFERENCES` was declared identically both times; enforcement
depended entirely on a separate, easy-to-forget setting.

### Discard

`Bogus Part` (the row that wrongly succeeded) is deleted, restoring
`parts` to exactly its six legitimate rows; `Bogus Part 2` never
existed as a stored row at all, since its `INSERT` was genuinely
rejected.

### Mechanical Walkthrough

- `ALTER TABLE parts ADD COLUMN supplier_id INTEGER REFERENCES
  suppliers(id);` — **(a) first appearance** of `ALTER TABLE ADD
  COLUMN`, full treatment above; `REFERENCES suppliers(id)` — **(a)
  first appearance** of a real foreign key declaration, full treatment
  above.
- `UPDATE parts SET supplier_id = 1 WHERE name IN (...)` — **(b) hard
  concept reappearing** for `UPDATE`/`SET`/`WHERE`, all fully explained
  in Lesson 06; `IN (...)` — **(a) first appearance**: true when the
  left side matches any one value in the parenthesized list, a real,
  dedicated shorthand for chaining several `OR`-ed `=` comparisons
  (Lesson 05's own `OR` reused conceptually, not spelled out that way
  here).
- `PRAGMA foreign_keys;` / `PRAGMA foreign_keys = ON;` — **(a) first
  appearance** of `PRAGMA` as a real, general SQLite mechanism for
  reading and setting engine-level options — this lesson's own
  `foreign_keys` is one specific pragma among many others this series'
  own Lesson 16 tours.

### CS Lens

A foreign key is SQLite's real, declared form of **referential
integrity**: the guarantee that a reference (`parts.supplier_id`)
always points at something that genuinely exists (`suppliers.id`),
never a dangling pointer to nothing.

Also recognized in: a pointer or reference in any general-purpose
language that must never be dereferenced after what it pointed to was
freed (the real bug class garbage collection and Rust's own borrow
checker both exist to prevent), a URL that 404s because the page it
named was removed, a citation in a paper referencing a source that was
later retracted — every case, the same underlying failure: a reference
outliving or never having matched the real thing it claims to point at.

### SE Lens

SQLite's own real, documented reason for defaulting `PRAGMA
foreign_keys` to off, rather than on: backward compatibility — foreign
key enforcement was added to SQLite years after the file format itself
already existed and was widely used without it, and flipping the
default later would have silently broken any already-deployed
application whose data happened to contain (harmlessly, for its own
purposes) references that wouldn't survive strict enforcement. The real
cost this project inherits from that historical decision: this pragma
must be set **every real connection**, application-level — not once,
ever, for the file itself — a genuine, easy-to-forget requirement this
series carries forward explicitly into Arc 2's own Python connection
code and Arc 4's own FastAPI startup, rather than assuming Lesson 08
"solved" it permanently here.

## Connect the pieces

`parts` now has a real `supplier_id` column, added after the fact with
`ALTER TABLE ADD COLUMN` rather than requiring `parts` to be dropped
and recreated, and five of its six rows now genuinely reference a real
row in Lesson 07's own `suppliers` table (`Screwdriver Set`'s `NULL`
deliberately excepted). The real, load-bearing fact this lesson proved
directly: declaring `REFERENCES` alone does not enforce anything at all
— `Bogus Part`'s own successful, bad insert proved that concretely —
and only `PRAGMA foreign_keys = ON`, set fresh on this exact
connection, turned that same declaration into a real, enforced
guarantee.

## What breaks without this

Open a **brand-new** connection to the same, already-`ON`-set database,
and check the pragma again without setting it:

```
$ sqlite3 pocket_hardware.db "PRAGMA foreign_keys;"
0
```

Back to `0` — off — despite this exact file having had it explicitly
set to `ON` moments earlier, in this lesson's own isolated lab. `PRAGMA
foreign_keys` is a real, **per-connection** setting, never written into
the database file itself; every single new connection — including,
concretely, every one Arc 2's Python code and Arc 4's FastAPI backend
will open — starts back at SQLite's own real default, off, regardless
of what any earlier session set it to.

## Exercises

1. Reproduce this lesson's exact `Bogus Part`/`Bogus Part 2` proof
   yourself, in a fresh terminal session, and confirm `PRAGMA
   foreign_keys` really does read back `0` the instant that new session
   opens — before you set it yourself.
2. Attempt `DELETE FROM suppliers WHERE name = 'Ace Tools Co.';` with
   `PRAGMA foreign_keys = ON;` set, while `Hammer`, `Wrench`, and
   `Drill` still reference it. Confirm you get a real, new kind of
   foreign-key failure — this time triggered by removing the *target*
   of a real reference, not by inserting a bad one — and read its exact
   real wording.

## Definition of Done

- [ ] You added `parts.supplier_id` with `ALTER TABLE ADD COLUMN` and
      confirmed its real, slightly-awkward appended schema with
      `.schema parts`.
- [ ] You assigned real supplier IDs to five of `parts`' six rows,
      leaving `Screwdriver Set` deliberately `NULL`.
- [ ] You reproduced the real `Bogus Part` success (pragma off) and
      `Bogus Part 2` rejection (pragma on) and can state, from memory,
      why the identical `REFERENCES` declaration behaved two different
      ways.
- [ ] You confirmed `PRAGMA foreign_keys` resets to off on a fresh
      connection to the same file.
- [ ] You completed both exercises.

## Next

[Lesson 09 — Inner and Left Joins](lesson-09-inner-and-left-joins.md)
uses this lesson's real `parts`/`suppliers` link for the first time —
including a real, direct proof of what happens to `Screwdriver Set`'s
deliberately `NULL` `supplier_id` once two tables are combined.
