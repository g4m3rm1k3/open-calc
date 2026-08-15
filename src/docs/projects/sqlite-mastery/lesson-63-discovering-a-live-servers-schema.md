# Lesson 63: Discovering a Live Server's Schema

**What you will build:** a real, structured inventory of a live,
remote server database's own schema — every table, every column, every
foreign key — built the same real, disciplined way Arc 6 already
taught, using the real, portable system views every major SQL engine
provides instead of SQLite's own `PRAGMA`.

**What you need to know first:** [Lesson 44](lesson-44-handed-a-db-with-no-docs.md)
— its own real discipline (trust the system's own structural facts,
never a name or an assumption) is this lesson's entire method, applied
to a live server instead of a handed-over file. [Lesson 62](lesson-62-connecting-to-a-real-enterprise-server-database.md)
— the real connection this lesson's own queries run through.

**Terms introduced in this lesson:**
- **`INFORMATION_SCHEMA`** — a real, ANSI SQL standard set of views
  every major relational database (SQL Server, Postgres, MySQL alike)
  provides, describing that database's own real, current schema —
  SQLite's real, closest counterpart is `PRAGMA table_info`/
  `sqlite_master`, though SQLite itself does not implement
  `INFORMATION_SCHEMA` directly.

**Objects and methods used:**

**`INFORMATION_SCHEMA.TABLES`**
- *What it is:* a real, standard, queryable view listing every real
  table (and view) in the current database.
- *Implementation:* real columns include `TABLE_SCHEMA`, `TABLE_NAME`,
  and `TABLE_TYPE` (`'BASE TABLE'` for an ordinary table, `'VIEW'` for
  a real view) — queryable with ordinary `SELECT`.
- *Its use:* this lesson's own first, real step: discovering what
  exists at all.

**`INFORMATION_SCHEMA.COLUMNS`**
- *What it is:* a real, standard, queryable view listing every real
  column of every real table.
- *Implementation:* real columns include `TABLE_NAME`, `COLUMN_NAME`,
  `DATA_TYPE`, `IS_NULLABLE`, and `ORDINAL_POSITION` — the real,
  portable, standard-SQL counterpart to `PRAGMA table_info`'s own
  output shape (Lesson 44).
- *Its use:* recovering one real table's own full, structured shape.

---

## Concept Unit: `INFORMATION_SCHEMA` — the Real, Portable Counterpart to `PRAGMA`

### The Problem

Lesson 44's own real discipline — trust the system's own structural
facts, gathered directly, never a name or an assumption — still
applies here, unchanged. `PRAGMA table_info` itself, however, is a
real, genuine SQLite-specific mechanism; it does not exist on a real
SQL Server, Postgres, or MySQL server at all.

### Introduce the Concept in Isolation

The real, standard, portable equivalent — available, in this same
real shape, across every major SQL engine:

```sql
SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
ORDER BY TABLE_SCHEMA, TABLE_NAME;
```

```
TABLE_SCHEMA  TABLE_NAME       TABLE_TYPE
------------  ---------------  ----------
dbo           Customers        BASE TABLE
dbo           OrderLines       BASE TABLE
dbo           Orders           BASE TABLE
dbo           Products         BASE TABLE
dbo           vw_OpenOrders    VIEW
```

(A real, plausible result for a real, small enterprise order-management
database — your own real server's own real table names will genuinely
differ; the shape of this query, and its real, standard column names,
will not.) `TABLE_TYPE` directly distinguishes a real, ordinary table
from a real view — the identical real distinction Lesson 44's own
`sqlite_master` query already made for SQLite, now made through a
different, real, portable mechanism.

One real table's own full, structured shape:

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, ORDINAL_POSITION
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Products'
ORDER BY ORDINAL_POSITION;
```

```
COLUMN_NAME    DATA_TYPE  IS_NULLABLE  ORDINAL_POSITION
-------------  ---------  -----------  ----------------
ProductID      int        NO           1
ProductName    nvarchar   NO           2
UnitPrice      money      YES          3
CategoryID     int        YES          4
```

The identical real information `PRAGMA table_info(parts)` (Lesson 44)
already gave for SQLite — column name, type, nullability, position —
recovered here through the real, standard, engine-agnostic view
instead.

### Discard

Nothing throwaway — `INFORMATION_SCHEMA.TABLES`/`.COLUMNS` are real,
permanent, reusable introspection tools for this project's own real,
ongoing work against this server.

### Mechanical Walkthrough

- `SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE FROM
  INFORMATION_SCHEMA.TABLES` — **(a) first appearance**, full treatment
  above; `ORDER BY` — **(b) hard concept reappearing**, Lesson 04's own
  real clause, unchanged.
- `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, ORDINAL_POSITION FROM
  INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products'` — **(a)
  first appearance**, full treatment above; `WHERE`/`=` — **(b) hard
  concept reappearing**, Lesson 04's own real shape.

### CS Lens

`INFORMATION_SCHEMA` is a real, direct instance of a **standardized
interface over a genuinely varying implementation** — the identical
underlying idea DB-API 2.0 (Lesson 17, proven again directly in Lesson
62) already gave this series for *connecting*; `INFORMATION_SCHEMA`
gives the same real portability for *introspecting*, a real, second,
separate standard this series hadn't needed until a genuinely
different engine entered the picture.

### SE Lens

The real, practical value, stated directly: the exact same real query
this unit just ran against a real SQL Server would work, largely
unchanged, against a real Postgres or MySQL server too — a real,
genuine time savings the instant this project's own real, future work
touches a second or third external database, each potentially a
different real engine. `PRAGMA table_info` remains the real, correct,
and often more convenient tool specifically for this project's own
SQLite files; `INFORMATION_SCHEMA` is the real, correct reach the
moment the target is anything else.

## Concept Unit: Recovering Foreign Keys — Portable, and a Real, Simpler Alternative

### The Problem

`PRAGMA foreign_key_list` (Lesson 16, reused directly in Lesson 45) has
no single, equally simple `INFORMATION_SCHEMA` equivalent — real
foreign-key relationships are described across *several* real,
standard views, joined together, because the ANSI standard itself
models a constraint's *definition* and its *column mapping* as two
real, separate, related facts.

### Introduce the Concept in Isolation

The real, portable, standard shape — genuinely more verbose than
`PRAGMA foreign_key_list`, and worth seeing once for what it actually
is:

```sql
SELECT
    kcu1.TABLE_NAME AS TableName,
    kcu1.COLUMN_NAME AS ColumnName,
    kcu2.TABLE_NAME AS ReferencedTable,
    kcu2.COLUMN_NAME AS ReferencedColumn
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu1
    ON rc.CONSTRAINT_NAME = kcu1.CONSTRAINT_NAME
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu2
    ON rc.UNIQUE_CONSTRAINT_NAME = kcu2.CONSTRAINT_NAME;
```

A real, exact join like this one is worth confirming directly against
your own real server's own documentation before trusting its output —
the real, standard views exist everywhere, but exactly which of a
table's own real columns line up across `REFERENTIAL_CONSTRAINTS` and
`KEY_COLUMN_USAGE` is genuinely easy to get subtly wrong by memory
alone, the identical real caution this series has already applied to
any construct not independently verified.

The real, simpler, SQL-Server-specific alternative — a real, direct
system-catalog query, less portable, and considerably easier to read
and trust:

```sql
SELECT
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id;
```

```
TableName    ColumnName   ReferencedTable  ReferencedColumn
-----------  -----------  ---------------  ----------------
Orders       CustomerID   Customers        CustomerID
OrderLines   OrderID      Orders           OrderID
OrderLines   ProductID    Products         ProductID
```

The identical real, structural information Lesson 45's own ER-diagram
work already recovered for `library_system.db` — every real
table's own real relationship to every other one — now recovered from a
live, remote server instead of a handed-over file.

### Discard

Nothing throwaway — both real queries are permanent, reusable
introspection tools; which one this project actually reaches for
depends on whether portability or simplicity matters more for a given,
real task.

### Mechanical Walkthrough

- `sys.foreign_keys` / `sys.foreign_key_columns` — **(a) first
  appearance** of these two real, SQL-Server-specific system catalog
  views.
- `OBJECT_NAME(...)` / `COL_NAME(...)` — **(a) first appearance** of
  two real, built-in SQL Server functions translating an internal,
  real numeric object/column ID back into its real, human-readable
  name.
- `INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS` /
  `.KEY_COLUMN_USAGE` — **(a) first appearance** of these two further
  real, standard views, joined together specifically because a real
  foreign key's own definition and its own real column mapping are
  modeled as separate, related facts in the ANSI standard.

### CS Lens

The real, deliberate tradeoff between this unit's own two real queries
— a portable, standard, more complex one against a simpler,
engine-specific one — is a direct, concrete instance of the identical
real choice this series has already named for `sqlite_master` versus
`sys.foreign_keys`, and Lesson 51's own SE Lens for scalability: real
engineering rarely offers a single answer that's simultaneously most
portable *and* simplest; naming the real tradeoff honestly, and
choosing deliberately, is the actual skill.

### SE Lens

The real, honest recommendation this lesson leaves you with: reach for
the engine-specific query (`sys.foreign_keys`, here) for your own,
real, day-to-day exploration of a server you already know is SQL
Server — it's real, simpler, and easier to trust at a glance. Reach for
the portable `INFORMATION_SCHEMA` version specifically when writing
real, reusable tooling meant to work against more than one real engine
without modification — exactly the kind of real, general-purpose script
this project's own future work, touching a second real vendor's
database someday, would genuinely benefit from.

## Connect the pieces

Lesson 44's own real discipline — trust the system, not a name or an
assumption — proved to be entirely portable, even though `PRAGMA`
itself is not: `INFORMATION_SCHEMA.TABLES`/`.COLUMNS` recovered a real,
live server's own full structure, the identical real information Arc 6
already recovered from a handed-over file; and two real, alternative
foreign-key queries — one portable, one SQL-Server-specific — recovered
the identical real relationships Lesson 45's own ER diagram already
proved worth drawing, this time from a genuinely different, live,
remote source.

## What breaks without this

Query `INFORMATION_SCHEMA.TABLES` without knowing which real database
the current connection is actually pointed at — a real, easy mistake
on a real server hosting more than one real database:

```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
```

A real, syntactically valid, successfully-running query — that
silently returns the wrong real database's own tables entirely, if the
connection string's own `DATABASE=` value (Lesson 62) named a
different one than you intended. Unlike SQLite, where the file *is*
the database (Lesson 01's own original framing) with no real ambiguity
possible, a real server hosts many real databases side by side —
direct, honest proof that confirming `DATABASE=` in the real connection
string matches your real intent is worth doing before trusting any
query's own result at all.

## Exercises

1. Run this lesson's own real `INFORMATION_SCHEMA.TABLES`/`.COLUMNS`
   queries against your own real, available server (or a real, public
   sample database, if your own enterprise access isn't ready yet), and
   build a real, written inventory the same way Lesson 44's own
   exercise did.
2. Confirm, directly, which real database your current connection is
   pointed at — research and run the real, standard `SELECT DB_NAME();`
   (SQL Server) — before trusting any further real query's own result.

## Definition of Done

- [ ] You listed every real table and view on a live server using
      `INFORMATION_SCHEMA.TABLES`.
- [ ] You recovered one real table's own full column shape using
      `INFORMATION_SCHEMA.COLUMNS`.
- [ ] You recovered real foreign-key relationships using both the
      portable and the SQL-Server-specific query, and can state the
      real tradeoff between them.
- [ ] You completed both exercises.

## Next

[Lesson 64 — The Backend-in-the-Middle
Architecture](lesson-64-the-backend-in-the-middle-architecture.md)
answers the real, architectural question this series' own prior
conversation already raised directly: whether every real `pywebview`
app should connect to this server on its own.
