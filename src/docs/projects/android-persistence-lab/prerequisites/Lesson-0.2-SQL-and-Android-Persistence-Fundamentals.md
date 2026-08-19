# Lesson 0.2: Rows, Statements, and the API That Wraps Them

_A generic, project-independent reference: what SQL itself does, and what
Android's own persistence classes do on top of it — using plain,
made-up example names, not any specific app's real classes or tables._

- **What you will build** — Nothing that ships. This lesson runs a small
  generic `note` table (`id`, `title`, `body`, `created_at`) through SQL's
  own core operations — `CREATE TABLE`, `INSERT`, `SELECT ... WHERE`,
  `UPDATE`, `DELETE` — and then looks at the Android classes that wrap
  those exact same operations for a real app: `SQLiteOpenHelper`,
  `SQLiteDatabase`, `ContentValues`, and `Cursor`. The transferable
  problem: any specific app's persistence code (its own table names, its
  own helper class, its own field names) is one particular *use* of a
  small, fixed set of underlying operations — and it's much easier to
  read that specific code once the underlying operations themselves are
  already familiar, in isolation, with nothing project-specific in the
  way.
- **What you need to know first** — Nothing. This is a from-scratch
  prerequisite, meant to be read before any project's own persistence
  code.
- **Terms used in this lesson**

  - **Table** — a named, structured collection of rows, each with the
    same fixed set of columns. It exists because a database needs some
    unit to group related data under: every row in a table describes one
    instance of the same kind of thing.
  - **Row** — one single record inside a table — one concrete instance
    of whatever the table represents. It exists as the actual unit of
    data a database stores and returns; a table is the shape, a row is
    one real filled-in copy of that shape.
  - **Column** — one named, typed slot every row in a table has, in the
    same position, holding the same *kind* of value. It exists so a
    table's shape is declared once, up front, rather than each row
    inventing its own fields.
  - **Schema** — the declared structure of a database: what tables
    exist, what columns each one has, and what type and constraints each
    column carries. It exists so a database engine (and every program
    reading from it) has one fixed, shared understanding of what shape
    the data is in, rather than having to guess it from whatever happens
    to be stored.
  - **Data type** — a declared constraint on what kind of value a column
    may hold (`INTEGER`, `TEXT`, `REAL`, `BLOB` in SQLite specifically).
    It exists so the engine can store values compactly and compare them
    correctly — sorting and comparing numbers numerically, for instance,
    only works if the engine knows a column holds numbers and not
    arbitrary text that merely looks like one.
  - **Primary key** — a column (or set of columns) whose value must be
    unique across every row in the table, and is the table's own
    canonical way of naming one specific row. It exists because "row 3"
    isn't a stable way to refer to a piece of data — rows can be
    inserted and deleted — but "the row whose primary key is 7" always
    means the same row for as long as that row exists.
  - **`NULL`** — SQL's explicit marker for "this column has no value for
    this row," distinct from an empty string or a zero. It exists
    because "no value was ever recorded" is a genuinely different fact
    from "the value is empty" or "the value is zero," and a database
    that couldn't represent that distinction would silently lose
    information.
  - **Query** — a single SQL statement asking the database to do
    something: create a structure, add data, read data back, change
    data, or remove data. It exists as SQL's own unit of work — every
    interaction with the database, from either the `sqlite3` command
    line or an app's own code, is one query at a time.
  - **`WHERE` clause** — the part of a query that narrows which rows a
    statement applies to, by stating a condition every matching row's
    columns must satisfy. It exists because almost no real operation
    should apply to *every* row in a table — reading, changing, or
    deleting data almost always means "the rows that match this
    specific condition," not "all of them."
  - **Parameterized query** — a query written with a placeholder (`?` in
    SQLite and in Android's own database API) standing in for a real
    value, with that value supplied separately rather than pasted
    directly into the query text. It exists to prevent **SQL injection**
    (below): the placeholder is always treated as one literal value by
    the database engine, never as SQL syntax, no matter what characters
    the value itself contains.
  - **SQL injection** — a security failure where a value from outside
    the program (user input, in the common case) is pasted directly
    into a SQL statement's own text, letting that value's own characters
    change what the statement actually does — for example, a title
    field containing `'; DROP TABLE note; --` altering or destroying
    data the program never intended to touch. It exists as a named,
    well-understood vulnerability class specifically because
    string-concatenating untrusted values into SQL text is an easy,
    common mistake with a severe consequence; parameterized queries are
    the standard fix, not a defense-in-depth extra.
  - **Row identifier (`rowid` / SQLite's auto-assigned integer key)** —
    every SQLite table (unless declared otherwise) has a hidden or
    explicit 64-bit integer key, automatically assigned on insert,
    unique per row. It exists so every row has a fast, guaranteed-unique
    way to be found again even when a table's own declared columns don't
    happen to include a natural unique value; declaring a column
    `INTEGER PRIMARY KEY` in SQLite makes that column *be* this same
    row identifier, rather than a separate value alongside it.

- **Objects and methods used**

  - **`sqlite3` (the SQLite command-line shell)**
    - *What it is:* a standalone program, included with SQLite itself,
      that reads SQL statements typed at a prompt (or piped in) and runs
      them directly against a database file — no app, no Android, just
      SQL talking to a database.
    - *Implementation:* invoked as `sqlite3 <filename>` (or `sqlite3` with
      no filename for a temporary in-memory database); every line
      afterward is either a SQL statement, ending in `;`, or a dot-command
      like `.tables` or `.schema`.
    - *Its use:* this lesson's own subject for every SQL Concept Unit —
      the exact same SQL engine Android's `SQLiteDatabase` class calls
      into internally, reachable directly with nothing Android-specific
      wrapped around it.
    - *Type:* a compiled C program, not a class or object — a standalone
      executable, invoked fresh from a shell each time.
    - *Responsibility:* to be the plainest, most direct way to run real
      SQL against a real SQLite database file and see the real result,
      with no application code, no framework, and no project-specific
      naming standing between the statement typed and the engine that
      executes it.
    - *Depends on:* a SQLite database file path (or the special
      in-memory sentinel), and well-formed SQL statements typed or piped
      into its standard input.
    - *Connects to:* nothing upstream — it's the tool a person runs
      directly. Downstream, it talks to the same on-disk SQLite file
      format and the same SQL engine that `android.database.sqlite`
      (below) is a thin Java wrapper around.
    - *Shape:* the reference boundary this whole lesson stands on — the
      tool that lets "what does this SQL actually do" be answered
      directly, independent of any language or framework built on top
      of SQLite.

  - **`CREATE TABLE`**
    - *What it is:* the SQL statement that declares a new table's schema
      — its name and the name, type, and constraints of every column it
      will have.
    - *Implementation:* `CREATE TABLE table_name (column_name TYPE
      [constraints], ...)` — for example, `CREATE TABLE note (id INTEGER
      PRIMARY KEY, title TEXT NOT NULL, body TEXT, created_at INTEGER
      NOT NULL);`.
    - *Its use:* the very first statement any table needs before it can
      hold a single row — this lesson's own first Concept Unit.
    - *Type:* a Data Definition Language (DDL) statement — a category of
      SQL that changes the database's *structure*, not its data.
    - *Responsibility:* to establish, once, the fixed shape every future
      row in this table must conform to — column names, their types, and
      any constraints (like `NOT NULL` or `PRIMARY KEY`) the engine will
      enforce on every future insert or update.
    - *Depends on:* a table name not already in use, and a column list
      with at least one column.
    - *Connects to:* every later statement that names this table
      (`INSERT`, `SELECT`, `UPDATE`, `DELETE`) — none of them can run
      successfully until `CREATE TABLE` has already declared the table
      they name.
    - *Shape:* the schema-definition boundary — the one place a table's
      shape is declared, which every data-manipulation statement
      afterward depends on but never redeclares.

  - **`INSERT INTO`**
    - *What it is:* the SQL statement that adds one new row to an
      existing table.
    - *Implementation:* `INSERT INTO table_name (col1, col2, ...) VALUES
      (val1, val2, ...);` — for example, `INSERT INTO note (title, body,
      created_at) VALUES ('Groceries', 'Milk, eggs', 1700000000);`.
    - *Its use:* the operation that actually puts data into a table
      `CREATE TABLE` only declared the shape of.
    - *Type:* a Data Manipulation Language (DML) statement — a category
      of SQL that changes the database's *data*, not its structure.
    - *Responsibility:* to add exactly one new row, with the given
      values in the named columns, and to fail the whole statement (no
      partial row) if any stated constraint — `NOT NULL`, a duplicate
      primary key — is violated.
    - *Depends on:* an already-`CREATE TABLE`-declared table, and a
      value for every column that doesn't have a default and isn't
      allowed to be `NULL`.
    - *Connects to:* `CREATE TABLE` upstream (the table it inserts into
      must already exist); `SELECT` downstream (a row just inserted is
      what a later `SELECT` reads back).
    - *Shape:* one of the three data-changing operations (alongside
      `UPDATE` and `DELETE`) that `SELECT` never performs — `SELECT`
      only ever reads.

  - **`SELECT ... WHERE`**
    - *What it is:* the SQL statement that reads rows back out of a
      table, optionally narrowed to only the rows matching a condition.
    - *Implementation:* `SELECT column1, column2 FROM table_name WHERE
      condition;` — for example, `SELECT id, title FROM note WHERE title
      = 'Groceries';`; `SELECT * FROM note;` with no `WHERE` reads every
      row.
    - *Its use:* the operation that turns stored rows back into a result
      a program (or a person at the `sqlite3` prompt) can actually see
      and use.
    - *Type:* a Data Query Language (DQL) statement — sometimes grouped
      under DML, but distinct in that it changes nothing; it only reads.
    - *Responsibility:* to return exactly the rows satisfying the
      `WHERE` condition (or every row, if there is none), with exactly
      the columns named after `SELECT`, in no particular guaranteed
      order unless an `ORDER BY` is added.
    - *Depends on:* an already-populated table, and (if narrowing is
      wanted) a `WHERE` condition referencing real column names.
    - *Connects to:* every prior `INSERT`/`UPDATE`/`DELETE` on the same
      table — a `SELECT` always reflects whatever the table's current
      state is, as of the moment it runs.
    - *Shape:* the read boundary of SQL's CRUD operations — the only one
      of the four (Create/Read/Update/Delete) that never changes stored
      data.

  - **`UPDATE ... SET ... WHERE`**
    - *What it is:* the SQL statement that changes the values of
      existing rows, without creating or removing any row.
    - *Implementation:* `UPDATE table_name SET column = new_value WHERE
      condition;` — for example, `UPDATE note SET body = 'Milk, eggs,
      bread' WHERE id = 1;`.
    - *Its use:* the operation for "this row already exists, but one of
      its values needs to change" — as opposed to `INSERT` (a new row)
      or `DELETE` (removing the row entirely).
    - *Type:* a Data Manipulation Language (DML) statement, the same
      category as `INSERT` and `DELETE`.
    - *Responsibility:* to change only the named column(s), only on rows
      matching the `WHERE` condition, leaving every other column and
      every non-matching row completely untouched.
    - *Depends on:* an already-populated table and, almost always in
      practice, a `WHERE` condition — an `UPDATE` with no `WHERE`
      applies to *every* row in the table.
    - *Connects to:* whatever earlier `INSERT` created the row being
      changed; any later `SELECT` on that row will reflect this
      `UPDATE`'s new values.
    - *Shape:* the same data-changing category as `INSERT`/`DELETE`, and
      the one most dependent on a correct `WHERE` clause — an
      accidentally omitted `WHERE` here silently changes the entire
      table instead of one row.

  - **`DELETE FROM ... WHERE`**
    - *What it is:* the SQL statement that removes existing rows from a
      table entirely.
    - *Implementation:* `DELETE FROM table_name WHERE condition;` — for
      example, `DELETE FROM note WHERE id = 1;`.
    - *Its use:* the operation for permanently removing a row, as
      opposed to `UPDATE` (changing a row's values while keeping the
      row) or `CREATE TABLE`/`DROP TABLE` (which act on the table's
      structure, not one row).
    - *Type:* a Data Manipulation Language (DML) statement, the same
      category as `INSERT` and `UPDATE`.
    - *Responsibility:* to remove exactly the rows matching the `WHERE`
      condition (or every row, with no `WHERE` at all) and nothing else
      — the table itself, and its schema, are untouched.
    - *Depends on:* an already-populated table and, in almost every real
      case, a `WHERE` condition — the same "no `WHERE` means every row"
      danger `UPDATE` has.
    - *Connects to:* whatever earlier `INSERT` created the row; any
      later `SELECT` for that row will now return nothing.
    - *Shape:* the last of SQL's four core CRUD operations — the one
      that removes data outright rather than adding, reading, or
      changing it.

  - **`android.database.sqlite.SQLiteOpenHelper`**
    - *What it is:* an abstract Android framework class that manages one
      SQLite database file's creation and version upgrades — a subclass
      is how an app gets a ready-to-use, correctly-versioned database
      connection without hand-writing that lifecycle itself.
    - *Implementation:* `public abstract class SQLiteOpenHelper`, with a
      constructor taking a `Context`, a database name, an optional
      `CursorFactory`, and a schema version `int`, plus two methods a
      subclass must implement: `abstract void onCreate(SQLiteDatabase
      db)` and `abstract void onUpgrade(SQLiteDatabase db, int
      oldVersion, int newVersion)`.
    - *Its use:* the standard Android entry point into SQLite — an app
      subclasses this once, and every other class in the app that needs
      the database asks this subclass for a `SQLiteDatabase` rather than
      opening the file directly.
    - *Type:* an abstract class — it cannot be instantiated directly;
      an app must write its own subclass supplying real bodies for the
      two abstract methods.
    - *Responsibility:* to guarantee that, the first time an app ever
      runs, `onCreate` is called once with a fresh, empty database to
      set its schema up; that on every later run, the existing database
      file is reused as-is with no `onCreate` call; and that if the
      subclass's own declared version number has increased since the
      file was last opened, `onUpgrade` is called with the old and new
      version numbers so the schema can be migrated in place.
    - *Depends on:* a subclass supplying `onCreate`/`onUpgrade` bodies,
      an Android `Context` to locate where the database file lives on
      the device, and a version number the subclass itself controls and
      increments whenever the schema changes.
    - *Connects to:* an app's own code calls `getReadableDatabase()` or
      `getWritableDatabase()` on a `SQLiteOpenHelper` subclass instance
      to obtain a `SQLiteDatabase`; internally, this class is what calls
      `onCreate`/`onUpgrade` with a `SQLiteDatabase` already opened and
      ready to run `execSQL` against.
    - *Shape:* the lifecycle boundary between "a database file may or
      may not exist yet, may be an old version, may be brand new" and
      "here is a `SQLiteDatabase` you can just use" — every version/
      first-run concern is handled once, here, instead of by every piece
      of code that needs the database.

  - **`android.database.sqlite.SQLiteDatabase.execSQL(String)`**
    - *What it is:* the method a `SQLiteDatabase` provides for running a
      SQL statement that returns no rows — schema-defining statements
      like `CREATE TABLE`, and any `INSERT`/`UPDATE`/`DELETE` written by
      hand as a raw string.
    - *Implementation:* `public void execSQL(String sql)` — takes one
      argument, the full SQL statement text, and returns nothing.
    - *Its use:* how `onCreate` (above) actually runs its `CREATE TABLE`
      statement against the fresh database it's handed — this is the
      Android-side equivalent of typing that same statement at the
      `sqlite3` prompt.
    - *Type:* an instance method — called on a specific, already-open
      `SQLiteDatabase` object, never `static`.
    - *Responsibility:* to hand a raw SQL string straight to the
      underlying SQLite engine and run it, for statements whose whole
      point is a structural or bulk change rather than reading rows
      back.
    - *Depends on:* an already-open `SQLiteDatabase` (the `db` parameter
      `onCreate`/`onUpgrade` are handed), and a syntactically valid,
      complete SQL statement string.
    - *Connects to:* called from inside `onCreate`/`onUpgrade`, most
      often; internally, this is the direct Android-side call into the
      same SQLite engine the `sqlite3` shell talks to.
    - *Shape:* the raw-SQL escape hatch on `SQLiteDatabase` — the two
      structured methods below (`insert`, `query`) exist specifically to
      avoid needing this for ordinary row-level `INSERT`/`SELECT` work.

  - **`android.content.ContentValues`**
    - *What it is:* a key-value container mapping column names to the
      values to store in them, used to describe one row's worth of data
      without writing that row out as a raw SQL string.
    - *Implementation:* `public final class ContentValues` — built with
      a no-argument constructor, then filled with typed `put` overloads:
      `put(String key, String value)`, `put(String key, Integer value)`,
      `put(String key, Long value)`, and further overloads for the other
      primitive wrapper types.
    - *Its use:* the value passed to `SQLiteDatabase.insert` (below) —
      the structured, type-safe way of saying "this row has this title,
      this body, this timestamp" without hand-assembling an `INSERT`
      statement's SQL text.
    - *Type:* a concrete, instantiable class (`final`, so it cannot
      itself be subclassed) — an ordinary object, not a database
      connection or a query.
    - *Responsibility:* to hold exactly one row's worth of column-name-
      to-value pairs, in memory, until something (`SQLiteDatabase.insert`
      or its `update` counterpart) consumes it — nothing about
      `ContentValues` itself talks to a database.
    - *Depends on:* nothing beyond its own constructor; it's filled in
      after construction with however many `put` calls the row needs.
    - *Connects to:* built by app code, then handed to
      `SQLiteDatabase.insert` (below), which reads its column/value
      pairs to build the actual `INSERT` statement internally.
    - *Shape:* the structured-input boundary on the *write* side — the
      counterpart to `Cursor` (below) on the *read* side: `ContentValues`
      goes in, a `Cursor` comes out, and neither one is raw SQL text.

  - **`android.database.sqlite.SQLiteDatabase.insert(String, String, ContentValues)`**
    - *What it is:* the structured method for inserting one row, built
      from a table name and a `ContentValues` instead of a hand-written
      `INSERT` statement string.
    - *Implementation:* `public long insert(String table, String
      nullColumnHack, ContentValues values)` — `table` names the target
      table, `values` supplies the column/value pairs, and
      `nullColumnHack` (usually passed as `null`) exists only to satisfy
      SQL's own syntax for the edge case of inserting a row with zero
      columns given; the method returns the new row's `rowid`, or `-1`
      if the insert failed.
    - *Its use:* the Android-side equivalent of a raw `INSERT INTO ...
      VALUES (...)` statement, built from a `ContentValues` instead of
      assembled as a string by hand.
    - *Type:* an instance method on `SQLiteDatabase`, the same object
      `execSQL` (above) is called on.
    - *Responsibility:* to build and run a correctly-escaped `INSERT`
      statement from the table name and `ContentValues` given, and to
      report back the new row's own row identifier so calling code can
      immediately reference the row it just created.
    - *Depends on:* an already-open, writable `SQLiteDatabase`; a table
      name matching an existing, already-`CREATE TABLE`-declared table;
      and a `ContentValues` whose keys are real column names on that
      table.
    - *Connects to:* the `CREATE TABLE` statement that declared the
      target table's shape; the `ContentValues` instance supplying this
      call's data; and any later `query`/`rawQuery` call that will read
      the row this call just created.
    - *Shape:* the structured, safer alternative to writing `INSERT`
      SQL text by hand via `execSQL` — values are passed as real typed
      arguments, not concatenated into a string, so a stray `'` inside a
      title can never be mistaken for SQL syntax.

  - **`android.database.sqlite.SQLiteDatabase.query(...)` /
    `rawQuery(String, String[])`**
    - *What it is:* the two ways `SQLiteDatabase` runs a `SELECT` and
      hands back a `Cursor` (below) over the matching rows — `query`
      builds the `SELECT` from separate structured arguments; `rawQuery`
      takes a full SQL string directly, with `?` placeholders for any
      values.
    - *Implementation:* `public Cursor query(String table, String[]
      columns, String selection, String[] selectionArgs, String
      groupBy, String having, String orderBy)` — `selection` is a
      `WHERE` clause with `?` placeholders, `selectionArgs` supplies the
      real values for those placeholders, in order. `public Cursor
      rawQuery(String sql, String[] selectionArgs)` — `sql` is the full
      statement text with `?` placeholders, `selectionArgs` fills them
      the same way.
    - *Its use:* how Android-side code runs the equivalent of `SELECT
      ... FROM ... WHERE ...` and gets a real, iterable result back,
      whether built from separate arguments (`query`) or written as one
      SQL string (`rawQuery`) — both take their `WHERE`-clause values as
      a separate `selectionArgs` array rather than pasted into the
      statement text.
    - *Type:* both are instance methods on `SQLiteDatabase`; `query` has
      several overloads (a 7-argument and an 11-argument form are the
      most common), `rawQuery` is a single method taking exactly two
      arguments.
    - *Responsibility:* to run a read-only query against the database
      and return a `Cursor` positioned before the first matching row,
      never modifying any data — the same read-only guarantee plain
      `SELECT` has.
    - *Depends on:* an already-open `SQLiteDatabase`; a valid table name
      or full SQL string; and, whenever the query is narrowed by a
      condition, a `selectionArgs` array with exactly as many elements
      as there are `?` placeholders, supplied in the same left-to-right
      order.
    - *Connects to:* whatever rows earlier `insert`/`execSQL` calls
      already put into the table; the `Cursor` (below) it returns, which
      is how the calling code actually reads the result.
    - *Shape:* the same parameterized-query pattern as `SELECT ...
      WHERE` with the value supplied separately, at the Android API
      boundary — this is specifically what prevents SQL injection
      (above) on the Android side: `selectionArgs` values are always
      treated as literal data by the underlying engine, never as SQL
      syntax, regardless of what characters they contain.

  - **`android.database.Cursor`**
    - *What it is:* the interface Android hands back from `query`/
      `rawQuery`, representing the result rows of a `SELECT` — not all
      the data loaded into memory at once, but a movable pointer over
      the result set, one row at a time.
    - *Implementation:* an interface with, among others: `boolean
      moveToNext()` (advances to the next row, returns `false` once
      there are none left), `int getColumnIndexOrThrow(String
      columnName)` (looks up a column's position by name), `String
      getString(int columnIndex)` / `int getInt(int columnIndex)` /
      `long getLong(int columnIndex)` (read the current row's value at
      that position, as the named type), and `void close()` (releases
      the underlying resources the cursor holds).
    - *Its use:* the object every piece of Android code that reads rows
      back actually loops over — `query`/`rawQuery`'s real return value,
      and the read-side counterpart to `ContentValues` on the write
      side.
    - *Type:* an interface, not a concrete class — `query`/`rawQuery`
      return a real implementation of it, but calling code only ever
      needs to know the interface's own methods.
    - *Responsibility:* to let calling code walk through a query's
      result rows one at a time, reading whichever columns it needs
      from whichever row is currently positioned, without loading the
      entire result set into memory as one Java collection up front.
    - *Depends on:* being returned from an already-run `query`/
      `rawQuery` call — a `Cursor` is never constructed directly by app
      code.
    - *Connects to:* produced by `SQLiteDatabase.query`/`rawQuery`;
      consumed by a `while (cursor.moveToNext())` loop that reads each
      row's columns and, when finished, must call `close()` so the
      underlying database resources are released.
    - *Shape:* the streaming-read boundary on the way *out* of the
      database — `ContentValues` is the equivalent structured shape on
      the way in; forgetting to `close()` a `Cursor` is a real, common
      resource leak, since nothing else releases what it's holding open.

---

## Concept Unit: A Table Is a Declared Shape, Not Data Itself

### The Problem

Before any data can be stored anywhere, something has to say what shape
that data will have — what a "row" of it even means. Without that
declaration first, there's nothing for a later `INSERT` to conform to,
and nothing for a later `SELECT` to know it can ask for.

### Project Change

- **Reference Source** — No reference counterpart — this lesson has no
  ongoing project; every example here is a standalone scratch session
  against a throwaway SQLite database file, not part of any real app.
- **Files affected** — None (no real file). The running example for this
  whole lesson is a scratch session, referred to below as `scratch.db`,
  opened fresh for this Concept Unit and reused (never renamed, never
  treated as belonging to any actual app) through the rest of the SQL
  Concept Units.
- **Change type** — Add (a brand-new table in a brand-new scratch
  database).
- **Location** — N/A — nothing exists yet to locate a position within.
- **Dependencies** — the `sqlite3` command-line shell.

### The New Code

```sql
CREATE TABLE note (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  created_at INTEGER NOT NULL
);
```

### The Updated Project

This is the very first statement run against `scratch.db` — there is no
enclosing structure yet for it to be shown inside; per the schema, this
step is skipped when the new code already *is* the whole new structure
with nothing surrounding it.

### Mechanical Walkthrough

Enumerating every distinct element of the statement above, in order:

- **`CREATE TABLE note`** — the statement keyword pair declaring a new
  table named `note`. `CREATE TABLE` is a Data Definition Language
  (DDL) statement: it changes the database's *structure* (what tables
  and columns exist), never its *data* (what rows are in them) — that
  distinction is why `CREATE TABLE` is a completely separate statement
  from `INSERT`, rather than one statement doing both.
- **`id INTEGER PRIMARY KEY`** — declares a column named `id`, of type
  `INTEGER`, and marks it as this table's primary key. In SQLite
  specifically, a column declared exactly `INTEGER PRIMARY KEY` becomes
  an alias for the table's own row identifier (the **row identifier**
  term, above) — meaning `id` will be automatically assigned a unique
  integer on every insert that doesn't supply one explicitly, with no
  extra work required to get that behavior.
- **`title TEXT NOT NULL`** — declares a column named `title`, of type
  `TEXT`, with a `NOT NULL` constraint. `NOT NULL` means the engine will
  reject (fail, not silently accept) any `INSERT` or `UPDATE` that would
  leave `title` as `NULL` for a row — enforced by the engine itself,
  not something calling code has to remember to check.
  `NOT NULL` here so a note can never end up with no title in
  the data itself.
- **`body TEXT`** — declares a column named `body`, of type `TEXT`, with
  no constraint — meaning `body` is allowed to be `NULL`. This is a
  deliberate contrast with `title`: a note's body being empty is a
  legitimate, expected state (a title-only note), so nothing here
  forbids it.
- **`created_at INTEGER NOT NULL`** — declares a column named
  `created_at`, of type `INTEGER`, also `NOT NULL`. Storing a timestamp
  as a plain integer (conventionally, seconds or milliseconds since a
  fixed reference point) rather than as formatted text is a common SQL
  convention: integers sort and compare correctly with ordinary `<`/`>`
  operators, where text timestamps only sort correctly if their text
  format happens to also be alphabetically ordered the same way.
- **`;`** — the statement terminator. SQLite (like most SQL dialects)
  needs an explicit end-of-statement marker because a single statement's
  text can itself span multiple lines, as this one does; without `;`,
  the shell would keep reading further lines as part of the same
  statement.

### CS Lens

A `CREATE TABLE` statement is a **schema** in the same sense any typed
language's class or struct declaration is a schema: a fixed, named shape
that every future instance (here, every future row) must conform to,
declared once and checked by the engine on every later operation rather
than trusted to whatever code happens to insert data.

```
Also recognized in: a class's field declarations, a JSON Schema
document, a protobuf `.proto` message definition, a CSV file's header
row (informally), a spreadsheet's column headers
```

### SE Lens

The alternative to declaring a schema up front is a **schemaless** store
— just keep arbitrary key-value data with no enforced shape at all
(common in some NoSQL databases). The tradeoff: a schema, enforced by
the engine, catches a whole class of bugs immediately and loudly (an
`INSERT` missing a required `title` fails right there, at the point it
happens) instead of allowing malformed data to be silently written and
only failing later, somewhere else in the program, when something tries
to read a `title` that was never actually there. The real cost of a
schema is rigidity: changing it later (adding a column, tightening a
constraint) is itself an operation — a **migration** — that has to be
written and run deliberately, rather than every row just being allowed
to look different from the last one.

### Commands Needed

- `sqlite3 scratch.db` — opens (creating it if it doesn't already exist)
  the file `scratch.db` and starts an interactive SQL prompt against it.
- `.schema note` — a `sqlite3`-specific dot-command (not SQL itself)
  that prints the exact `CREATE TABLE` statement currently on record for
  the named table, useful for confirming what was actually declared.

### Run It

```
$ sqlite3 scratch.db
sqlite> CREATE TABLE note (
   ...>   id INTEGER PRIMARY KEY,
   ...>   title TEXT NOT NULL,
   ...>   body TEXT,
   ...>   created_at INTEGER NOT NULL
   ...> );
sqlite> .schema note
CREATE TABLE note (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  created_at INTEGER NOT NULL
);
```

`.schema note` echoing the statement back exactly as declared confirms
the table now exists with exactly this shape, on record with the engine
— not merely typed at the prompt with no lasting effect.

### Connect the pieces

Nothing exists in `scratch.db` yet except this one declared shape — the
next Concept Unit puts an actual row into it.

---

## Concept Unit: INSERT — Adding One Real Row

### The Problem

`CREATE TABLE` only declared what a `note` row's shape looks like — the
table itself is still empty. Something has to actually add data
conforming to that shape.

### Project Change

- **Reference Source** — No reference counterpart — continuing the same
  standalone `scratch.db` session from the previous Concept Unit.
- **Files affected** — None (scratch session, `scratch.db`, continued).
- **Change type** — Add (one new row in the already-declared `note`
  table).
- **Location** — Inside `scratch.db`'s `note` table, declared in the
  previous Concept Unit.
- **Dependencies** — the `note` table must already exist (previous
  Concept Unit).

### The New Code

```sql
INSERT INTO note (title, body, created_at)
VALUES ('Groceries', 'Milk, eggs, bread', 1700000000);
```

### The Updated Project

```sql
CREATE TABLE note (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  created_at INTEGER NOT NULL
);

INSERT INTO note (title, body, created_at)          -- ← new
VALUES ('Groceries', 'Milk, eggs, bread', 1700000000); -- ← new
```

`scratch.db` now has its table declared *and* one real row inside it —
the `CREATE TABLE` from the previous unit is unchanged; this statement
is a second, independent statement run against the same already-open
database.

### Mechanical Walkthrough

- **`INSERT INTO note`** — the statement keyword pair, naming the target
  table. `INSERT` is a Data Manipulation Language (DML) statement — it
  changes *data*, never the table's own declared structure, which is
  exactly the opposite of `CREATE TABLE`'s role in the previous unit.
- **`(title, body, created_at)`** — the explicit column list this
  statement supplies values for. `id` is deliberately omitted: since
  `id` is `INTEGER PRIMARY KEY` (an alias for the row identifier, per
  the previous unit), leaving it out lets SQLite assign the next
  available integer automatically, rather than the caller having to
  track and supply it.
- **`VALUES (...)`** — the keyword introducing the literal values,
  positionally matched to the column list immediately before it: the
  first value goes into the first named column, and so on.
- **`'Groceries'`** — a `TEXT` literal, single-quoted (SQL's own string
  quoting convention — a double-quoted value is instead read as an
  identifier, like a column or table name, so quoting the wrong way
  around is a real, easy-to-hit mistake). This value satisfies `title`'s
  `NOT NULL` constraint from the previous unit.
- **`'Milk, eggs, bread'`** — a second `TEXT` literal, for `body`. The
  commas inside this single string are just ordinary characters — SQL
  only treats a comma as a value separator when it's *outside* any
  quoted literal, so this whole quoted span is one value, not three.
- **`1700000000`** — an `INTEGER` literal (no quotes — an unquoted
  numeric literal is read as a number, not text), satisfying
  `created_at`'s type and `NOT NULL` constraint.
- **`;`** — the same statement terminator as the previous unit's
  `CREATE TABLE`.

### CS Lens

An `INSERT` is the SQL analogue of appending an element to a collection
whose element *type* was already fixed elsewhere (the table's schema) —
the operation itself is only ever "add one more instance of the already-
declared shape," never "add something of a shape decided on the fly."

### SE Lens

The alternative to naming columns explicitly (`INSERT INTO note (title,
body, created_at) VALUES (...)`) is `INSERT INTO note VALUES (...)` with
no column list, supplying a value for *every* column in table-declaration
order, `id` included. The tradeoff: the column-list form is longer to
type but survives a later schema change (a new column added to `note`)
without silently breaking — the no-column-list form would suddenly have
too few values for the new column count and fail, or worse, if the new
column happened to slot in the wrong position, silently insert values
into the wrong columns instead of failing loudly.

### Run It

```
sqlite> INSERT INTO note (title, body, created_at)
   ...> VALUES ('Groceries', 'Milk, eggs, bread', 1700000000);
sqlite> SELECT * FROM note;
1|Groceries|Milk, eggs, bread|1700000000
```

(`SELECT * FROM note;` here is only to *prove* the insert worked — the
next Concept Unit is where `SELECT` itself, and its `WHERE` clause, get
their own real treatment.) The `1` at the start of the output row is
`id`, confirming it really was auto-assigned with no value supplied for
it.

### Connect the pieces

`scratch.db`'s `note` table, declared empty in the previous unit, now
holds one real row — the next Concept Unit reads it back deliberately,
with `SELECT` itself as the subject rather than just a proof-of-work
aside.

---

## Concept Unit: SELECT and WHERE — Reading Rows Back, Narrowed

### The Problem

The previous unit's `SELECT * FROM note;` reads back *every* row,
unconditionally — fine with one row in the table, useless the moment
there's more than one and only a specific row (or rows) is actually
wanted.

### Project Change

- **Reference Source** — No reference counterpart — continuing the same
  `scratch.db` session.
- **Files affected** — None (scratch session, `scratch.db`, continued).
- **Change type** — Add (a second row, so `WHERE` has something real to
  narrow between) and read (a `WHERE`-narrowed `SELECT`).
- **Location** — The `note` table, now with one existing row from the
  previous unit.
- **Dependencies** — the `note` table with at least one existing row.

### The New Code

```sql
INSERT INTO note (title, body, created_at)
VALUES ('Call dentist', NULL, 1700003600);

SELECT id, title FROM note WHERE title = 'Groceries';
```

### The Updated Project

```sql
CREATE TABLE note (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  created_at INTEGER NOT NULL
);

INSERT INTO note (title, body, created_at)
VALUES ('Groceries', 'Milk, eggs, bread', 1700000000);

INSERT INTO note (title, body, created_at)                -- ← new
VALUES ('Call dentist', NULL, 1700003600);                 -- ← new

SELECT id, title FROM note WHERE title = 'Groceries';      -- ← new
```

`note` now holds two rows with two different titles — the exact
situation `WHERE` exists for, since without it there'd be no way to ask
for just one of them.

### Mechanical Walkthrough

- **`INSERT INTO note (title, body, created_at) VALUES ('Call dentist',
  NULL, 1700003600)`** — a second row, same statement shape as the
  previous unit's `INSERT`; the one new thing here is the bare `NULL`
  literal for `body` — an explicit statement of "no value," legal
  because `body` (unlike `title`) has no `NOT NULL` constraint. This is
  the **`NULL`** term (Header, above) shown as a real literal for the
  first time: `NULL` here is not the string `"NULL"` and not an empty
  string `''` — it's SQL's own distinct marker for "nothing was
  recorded here."
- **`SELECT id, title`** — names exactly the two columns this query
  wants back — `body` and `created_at` exist on every row but simply
  aren't asked for, so they won't appear in the result at all, distinct
  from asking for them and getting `NULL`.
- **`FROM note`** — names the table being read from — the same `note`
  table both `INSERT`s just added rows to.
- **`WHERE title = 'Groceries'`** — the condition: `=` compares the
  `title` column's value, row by row, against the literal `'Groceries'`;
  only rows where that comparison is true are included in the result.
  This is the **`WHERE` clause** term (Header, above) in its first real
  use — the mechanism that turns "every row" into "only the rows that
  actually match."
- **`;`** — statement terminator, same as every prior statement.

### Execution Trace

With two rows now in `note` (`id 1`: `'Groceries'`; `id 2`: `'Call
dentist'`), the engine's own row-by-row evaluation of the `WHERE`
condition:

1. Row `id 1`, `title = 'Groceries'` — comparing `'Groceries' =
   'Groceries'` is true, so this row is included in the result.
2. Row `id 2`, `title = 'Call dentist'` — comparing `'Call dentist' =
   'Groceries'` is false, so this row is excluded from the result — not
   an error, not a `NULL`, simply omitted.

The result is exactly one row (`id 1`), even though the table itself
holds two — proving `WHERE` narrows the *result*, never the table's own
actual contents.

### CS Lens

`WHERE`'s row-by-row true/false evaluation is a **filter** in the same
sense any language's array `.filter(predicate)` is a filter: a
condition, checked independently against each element of a collection,
determining membership in a new, smaller collection built from the
matches — SQL simply performs this filtering as part of the read itself,
inside the database engine, rather than the caller reading everything
out first and filtering afterward in its own code.

```
Also recognized in: `.filter()` in JavaScript/Python/etc.,
a search engine's query matching, a spreadsheet's AutoFilter,
firewall rules matching packets against conditions
```

### SE Lens

The alternative to filtering with `WHERE`, at the database layer, is
`SELECT * FROM note;` with no condition, reading every row out of the
database and then filtering it in application code instead. The
tradeoff is real, not just stylistic: filtering in `WHERE` means only
the matching rows ever cross from the database engine into the
program's own memory at all — for a table of a few rows this is
invisible, but for a table of a million rows and one matching row, the
difference between "the engine sends back one row" and "the engine
sends back a million rows, and the program throws 999,999 of them away"
is enormous, and it grows directly with the table's size.

### Commands Needed

None new — `sqlite3` itself and its interactive prompt, both already
introduced.

### Run It

```
sqlite> INSERT INTO note (title, body, created_at)
   ...> VALUES ('Call dentist', NULL, 1700003600);
sqlite> SELECT id, title FROM note WHERE title = 'Groceries';
1|Groceries
```

Only the one matching row comes back, and only its two requested
columns — `'Call dentist'` (the non-matching row) and `body`/
`created_at` (the non-requested columns) are both correctly absent.

### Connect the pieces

`note` now holds two distinguishable rows, and `SELECT ... WHERE` is the
tool that reads back exactly one of them by condition rather than by
position — the next Concept Unit uses that same `WHERE` mechanism to
target `UPDATE` and `DELETE` at one specific row instead of every row.

---

## Concept Unit: UPDATE and DELETE — Changing and Removing Rows

### The Problem

Every row so far has been permanent and unchanging once inserted. Real
data needs to change in place (a note's body edited) and sometimes needs
to be removed entirely (a note deleted) — two different operations, not
one, because "this row now has different values" and "this row no
longer exists" are genuinely different facts.

### Project Change

- **Reference Source** — No reference counterpart — continuing the same
  `scratch.db` session.
- **Files affected** — None (scratch session, `scratch.db`, continued).
- **Change type** — Change (`UPDATE` an existing row's value) and remove
  (`DELETE` an existing row).
- **Location** — The `note` table, now holding the two rows from the
  previous unit.
- **Dependencies** — the `note` table with the two existing rows from
  the previous unit.

### The New Code

```sql
UPDATE note SET body = 'Milk, eggs, bread, coffee' WHERE id = 1;

DELETE FROM note WHERE id = 2;
```

### The Updated Project

```sql
CREATE TABLE note (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  created_at INTEGER NOT NULL
);

INSERT INTO note (title, body, created_at)
VALUES ('Groceries', 'Milk, eggs, bread', 1700000000);

INSERT INTO note (title, body, created_at)
VALUES ('Call dentist', NULL, 1700003600);

UPDATE note SET body = 'Milk, eggs, bread, coffee' WHERE id = 1; -- ← new

DELETE FROM note WHERE id = 2;                                   -- ← new
```

`note` goes from two rows to: row `id 1` with its `body` changed, and
row `id 2` gone entirely — the two `INSERT`s from earlier units are
untouched as statements; their *effects* are what these two new
statements now build on and partly undo.

### Mechanical Walkthrough

- **`UPDATE note`** — names the table being changed. `UPDATE` is a Data
  Manipulation Language (DML) statement, the same category as `INSERT`
  and `DELETE` — none of the three touch the table's own declared
  schema, only its rows.
- **`SET body = 'Milk, eggs, bread, coffee'`** — names the one column
  being changed (`body`) and its new value; every other column on every
  affected row is left exactly as it was — `UPDATE` never implicitly
  resets unmentioned columns.
- **`WHERE id = 1`** — the same `WHERE` mechanism as the previous unit,
  here narrowing *which rows* the `SET` applies to, rather than which
  rows a `SELECT` returns. Using `id` (the primary key) rather than
  `title` here specifically targets exactly one guaranteed-unique row,
  where matching on `title` could in principle match more than one row
  if two notes ever shared a title.
- **`;`** — statement terminator, ending the `UPDATE` statement, whose
  effect is now final; the `DELETE` below is a separate statement.
- **`DELETE FROM note`** — names the table rows are being removed from.
  `DELETE` is the third DML statement, alongside `INSERT` and `UPDATE`.
- **`WHERE id = 2`** — narrows the deletion to exactly the row whose
  `id` is `2` — the `'Call dentist'` row from the previous unit.
- **`;`** — statement terminator for the `DELETE`.

### CS Lens

`UPDATE`'s "change this field on this matching record, leave the rest
alone" is the same shape as a language's own object-field mutation
(`note.body = "..."`) — the difference is that SQL's version applies to
however many rows the `WHERE` condition matches, all at once, rather
than one already-referenced object at a time.

```
Also recognized in: an object's setter method, a spreadsheet
cell edit, a PATCH request in a REST API (as opposed to a full PUT
replacement), version control's diff/patch model
```

### SE Lens

The dangerous alternative to always including a `WHERE` clause on
`UPDATE`/`DELETE` is simply omitting it — `UPDATE note SET body =
NULL;` with no `WHERE` sets *every* row's `body` to `NULL`, and `DELETE
FROM note;` with no `WHERE` removes *every* row in the table. Both are
syntactically valid, complete statements — SQLite has no built-in
"are you sure this has no condition" guard — which is why a `WHERE`
clause on these two statements specifically deserves more care than on
a `SELECT`: a `SELECT` with a missing `WHERE` returns too much data,
which is merely inconvenient; an `UPDATE`/`DELETE` with a missing
`WHERE` silently destroys or corrupts data across the entire table, with
no direct undo.

### Commands Needed

None new.

### Run It

```
sqlite> UPDATE note SET body = 'Milk, eggs, bread, coffee' WHERE id = 1;
sqlite> DELETE FROM note WHERE id = 2;
sqlite> SELECT * FROM note;
1|Groceries|Milk, eggs, bread, coffee|1700000000
```

One row remains, its `body` now the updated value — the `id 2` row from
the previous unit is entirely gone, not merely blanked out.

### Connect the pieces

Every one of SQL's four core CRUD operations — `CREATE TABLE`
(structure), `INSERT`/`SELECT`/`UPDATE`/`DELETE` (data) — has now been
run directly, with nothing but `sqlite3` between the statement typed and
the real result. The next two Concept Units look at the Android classes
that call these exact same operations from inside a real app, rather
than from a person typing at a shell prompt.

---

## Concept Unit: SQLiteOpenHelper — Getting a Ready Database, Once

### The Problem

Everything so far ran by hand, one statement at a time, against a
database file that already existed the moment `sqlite3` opened it. A
real Android app can't assume that: the very first time it ever runs on
a device, its database file doesn't exist yet — `CREATE TABLE` needs to
run exactly once, automatically, before anything else touches the
database — and if a later version of the app changes what the schema
needs to look like, that change needs to run automatically too, exactly
once, only for users upgrading from an older version.

### Introduce the Concept in Isolation

There is no Android runtime available in this environment to actually
run a `SQLiteOpenHelper` subclass (no emulator, no device) — unlike the
SQL statements above, which ran for real against `scratch.db`, this
concept is demonstrated the way this corpus's own established pattern
handles a framework class with nothing runnable to isolate it against:
by showing its real, official declared shape directly, verified against
the framework's own public contract rather than reconstructed from
memory, and stating plainly what it would connect to in a real app.

```java
public abstract class SQLiteOpenHelper {
    public SQLiteOpenHelper(Context context, String name,
            SQLiteDatabase.CursorFactory factory, int version) { ... }

    public abstract void onCreate(SQLiteDatabase db);
    public abstract void onUpgrade(SQLiteDatabase db,
            int oldVersion, int newVersion);

    public SQLiteDatabase getWritableDatabase() { ... }
    public SQLiteDatabase getReadableDatabase() { ... }
}
```

This shape — an abstract class with a constructor taking a version
number, and two abstract methods a subclass must fill in — is
`SQLiteOpenHelper`'s entire real contract for the two lifecycle moments
this lesson cares about: **first-ever creation** and **version
upgrade**.

### Discard

This shape is shown only to establish the real contract — no `example`
subclass built from it is carried forward as "the project's own code"
anywhere; a generic example subclass is written fresh, below, purely to
show the contract's shape filled in.

### Project Change

- **Reference Source** — No reference counterpart in a running project
  — `android.database.sqlite.SQLiteOpenHelper`'s own declared shape,
  above, is itself the authority being followed here, not a stand-in
  for one.
- **Files affected** — None (a freestanding, generic example class,
  never part of any real app or any other lesson's actual project).
- **Change type** — Add (a new, generic example subclass).
- **Location** — N/A — a brand-new freestanding class.
- **Dependencies** — nothing beyond the Android framework classes
  `SQLiteOpenHelper` itself depends on (`Context`, `SQLiteDatabase`).

### The New Code

```java
public class NoteDbHelper extends SQLiteOpenHelper {
    public NoteDbHelper(Context context) {
        super(context, "notes.db", null, 1);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE note (" +
                "id INTEGER PRIMARY KEY, " +
                "title TEXT NOT NULL, " +
                "body TEXT, " +
                "created_at INTEGER NOT NULL)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS note");
        onCreate(db);
    }
}
```

### The Updated Project

This freestanding example class *is* the whole new structure, with
nothing surrounding it yet — per the schema, this step is skipped when
that's the case.

### Mechanical Walkthrough

- **`public class NoteDbHelper extends SQLiteOpenHelper`** — declares a
  new, concrete (non-abstract) class, subclassing the abstract
  `SQLiteOpenHelper` shown above. `extends` is what makes a subclass
  responsible for actually supplying bodies for `SQLiteOpenHelper`'s two
  abstract methods — an abstract class cannot be instantiated on its
  own; only a concrete subclass like this one can be.
- **`public NoteDbHelper(Context context)`** — this class's own
  constructor, taking just a `Context` (the piece of Android-supplied
  information every component needs to reach system services and file
  storage) and nothing else — the database name and version are fixed
  by this class itself, below, rather than left for every caller to
  supply.
- **`super(context, "notes.db", null, 1)`** — calls `SQLiteOpenHelper`'s
  own constructor (shown in the isolated shape above), supplying the
  `context` this constructor received, the literal database file name
  `"notes.db"`, `null` for the optional `CursorFactory` (meaning "use
  the default"), and `1` as this schema's starting version number. This
  call is *why* `getReadableDatabase()`/`getWritableDatabase()` later
  know which file to open and which version to expect — none of that
  logic is written by hand in this subclass; it's inherited, already
  built, from `SQLiteOpenHelper` itself.
- **`@Override public void onCreate(SQLiteDatabase db)`** — supplies the
  real body for the first of `SQLiteOpenHelper`'s two abstract methods.
  `@Override` is not itself an operation — it's a compiler-checked
  annotation confirming this method really does override an existing
  superclass method with a matching signature, catching a typo'd
  signature as a compile error instead of silently creating an unrelated
  new method that Android would never actually call.
- **`db.execSQL("CREATE TABLE note (...)")`** — the `execSQL` call
  (Header, above) running this lesson's own earlier `CREATE TABLE`
  statement — the exact same SQL text, character for character, as the
  very first Concept Unit's statement, just handed to `execSQL` as a
  Java string instead of typed at a `sqlite3` prompt. This is called
  automatically by the framework, exactly once, the first time this
  app's database file doesn't yet exist — never by this class's own
  code directly.
- **`@Override public void onUpgrade(SQLiteDatabase db, int oldVersion,
  int newVersion)`** — supplies the body for `SQLiteOpenHelper`'s second
  abstract method, called automatically instead of `onCreate` whenever
  an existing database file's recorded version is lower than the
  version passed to `super(...)` above.
- **`db.execSQL("DROP TABLE IF EXISTS note")`** — a second raw SQL
  statement, this time `DROP TABLE` (a DDL statement removing a table's
  structure entirely, not shown as its own Header entry since it's used
  here only as part of this one migration strategy, not this lesson's
  own subject). `IF EXISTS` prevents an error if, for some reason, the
  table was already missing.
- **`onCreate(db)`** — an ordinary Java method call, reusing the same
  `onCreate` body just defined above rather than duplicating its SQL —
  this specific upgrade strategy ("drop everything, recreate from
  scratch") is the simplest possible migration, chosen here for clarity;
  a real app whose users have data worth preserving across an upgrade
  would instead run `ALTER TABLE` statements that change the schema in
  place.

### CS Lens

`onCreate`/`onUpgrade` being called *by the framework*, at moments the
subclass's own code never explicitly decides, rather than the subclass
calling them itself, is the **Inversion of Control** pattern: control
over *when* this code runs has been handed to `SQLiteOpenHelper`
(specifically, to its `getReadableDatabase()`/`getWritableDatabase()`
methods, which check the file's existence and version before deciding
which callback, if any, to invoke), and the subclass only supplies
*what* should happen at each of those moments.

```
Also recognized in: any GUI framework's event handlers, a web
framework's request-lifecycle hooks (`beforeRequest`/`afterResponse`),
a test framework's `setUp`/`tearDown`, dependency injection generally
```

### SE Lens

The alternative to `SQLiteOpenHelper` handling first-run/version logic
is writing that check by hand — on every app start, check whether the
database file exists, and if it does, read some stored version number
and compare it to what the code currently expects, branching to the
right setup or migration logic manually. The tradeoff: `SQLiteOpenHelper`
centralizes that check, once, correctly, so every app using it gets the
same reliable behavior; the real cost is that the *only* two hooks it
gives a subclass are "first ever creation" and "an upgrade happened" —
an app needing something more granular (multiple discrete migration
steps for each version jump, for instance) has to build that granularity
itself, inside the single `onUpgrade` callback this class provides.

### Commands Needed

None — this Concept Unit isn't run in this environment; see "Introduce
the Concept in Isolation," above, for why, and what verifying it for
real would require (an Android emulator or device).

### Run It

Not runnable in this environment — no Android runtime is available here.
In a real app, this class connects in as: an `Activity` (or another
component holding a `Context`) constructs `new NoteDbHelper(context)`
once, then calls `getWritableDatabase()` on it whenever it needs an
actual `SQLiteDatabase` to run statements against — which is exactly
what the next Concept Unit does.

### Connect the pieces

`NoteDbHelper` guarantees a `SQLiteDatabase` handed to calling code is
always already correctly created and up to date — the next Concept Unit
picks up from there: what a caller actually does with that
`SQLiteDatabase` once it has one.

---

## Concept Unit: SQLiteDatabase, ContentValues, and Cursor — Structured CRUD From Code

### The Problem

`execSQL`, in the previous unit, ran raw SQL text — fine for `CREATE
TABLE` and `DROP TABLE`, where there's no outside data involved at all.
It's the wrong tool for inserting or querying a *specific* note, though,
whose title and body come from something outside the program's own
fixed source code (what a user actually typed) — pasting an untrusted
string straight into a SQL statement's text is exactly the SQL
injection risk named in the Header, above.

### Introduce the Concept in Isolation

Same as the previous Concept Unit: no Android runtime is available here
to execute this against a real device, so the classes' real declared
shapes (already given full treatment in the Header, above, for
`ContentValues`, `SQLiteDatabase.insert`, `SQLiteDatabase.query`/
`rawQuery`, and `Cursor`) are the direct evidence, not a live run.

### Discard

N/A — the Header's shown shapes for these four are carried forward
directly into this unit's own example code below, not discarded; there
is no separate throwaway example distinct from it here.

### Project Change

- **Reference Source** — No reference counterpart — a generic example
  method, not part of any real app or any other lesson's project.
- **Files affected** — None (freestanding example code).
- **Change type** — Add (two new example methods: inserting a note, and
  reading notes back by title).
- **Location** — Alongside the `NoteDbHelper` class from the previous
  Concept Unit, in the same generic example.
- **Dependencies** — an already-open `SQLiteDatabase`, obtained from a
  `NoteDbHelper` instance's `getWritableDatabase()`, per the previous
  Concept Unit.

### The New Code

```java
long insertNote(SQLiteDatabase db, String title, String body, long createdAt) {
    ContentValues values = new ContentValues();
    values.put("title", title);
    values.put("body", body);
    values.put("created_at", createdAt);
    return db.insert("note", null, values);
}
```

### The Updated Project

This is a freestanding new method with nothing surrounding it yet — per
the schema, this step is skipped for exactly that reason.

### Mechanical Walkthrough

- **`long insertNote(SQLiteDatabase db, String title, String body, long
  createdAt)`** — a plain Java method, taking an already-open
  `SQLiteDatabase` (the previous Concept Unit's own output) plus the
  three real column values a new note needs, and returning a `long` —
  the new row's identifier, matching what `SQLiteDatabase.insert`
  (below) itself returns.
- **`ContentValues values = new ContentValues();`** — constructs a new,
  empty `ContentValues` (Header, above) — at this point it holds no
  column/value pairs at all; the three `put` calls below are what
  actually fill it in.
- **`values.put("title", title)`** — one of `ContentValues`'s typed
  `put` overloads (the `String` one), storing the column name `"title"`
  mapped to this method's own `title` parameter.
- **`values.put("body", body)`** — the same `put(String, String)`
  overload, for the `body` column. Notably, even if the caller's own
  `body` argument is `null`, this still works correctly and results in
  a real SQL `NULL` for that column when inserted — `ContentValues`
  itself has no `NOT NULL` concept; that constraint, if any, is enforced
  by the database engine at insert time, per the `CREATE TABLE`
  Concept Unit's own `body TEXT` (no `NOT NULL`) declaration.
- **`values.put("created_at", createdAt)`** — a *different* `put`
  overload this time (`put(String, Long)`, matching the `long`
  parameter's boxed type) — the same method name, `put`, resolved to a
  different real implementation depending on the argument's type, which
  is what makes `ContentValues` able to hold columns of genuinely
  different SQL types in one object.
- **`return db.insert("note", null, values)`** — calls
  `SQLiteDatabase.insert` (Header, above): `"note"` names the target
  table (the same table the earlier `CREATE TABLE` Concept Unit
  declared); `null` is the rarely-used `nullColumnHack` parameter,
  passed as `null` here because this call always supplies at least one
  real column; `values` is the filled `ContentValues` built just above.
  The method's own real return value — the new row's row identifier, or
  `-1` on failure — is returned directly as this method's own result,
  with no further processing.

### CS Lens

Building a request out of separate, typed pieces (`ContentValues`'s
key/value pairs) instead of assembling one string by hand is the
**Builder**-adjacent idea of keeping a request's *structure* and its
*data* separate until the very last moment they're combined — the SQL
text itself is only ever assembled internally, inside `insert`'s own
implementation, never by this method's own code.

```
Also recognized in: an HTTP client library's request-builder object
(headers/body set as separate typed fields, not concatenated into
one raw string), a `PreparedStatement` in JDBC, an ORM's query builder
```

### SE Lens

The alternative to `ContentValues` + `insert` is `execSQL` with a
hand-built string: `db.execSQL("INSERT INTO note (title, body,
created_at) VALUES ('" + title + "', '" + body + "', " + createdAt +
")")`. This is exactly the SQL injection shape named in the Header,
above — if `title` ever contained a single quote character, the
resulting SQL text would no longer mean what the programmer intended,
and a deliberately crafted `title` could make it mean something the
programmer never intended at all. `insert`/`query`/`rawQuery`'s
structured, separately-passed values exist specifically so this class of
bug is prevented by construction — there is no string concatenation of
untrusted data into SQL text anywhere in this method, so there's no
opportunity for that data to be misread as SQL syntax.

### Commands Needed

None — same as the previous Concept Unit, this code is not run in this
environment.

### Run It

Not runnable in this environment, same reason as the previous Concept
Unit. In a real app, `insertNote` connects in as: called with the
`SQLiteDatabase` a `NoteDbHelper`'s `getWritableDatabase()` returned,
and whatever `title`/`body`/`createdAt` values the app's own UI
collected — the exact same effect as this lesson's own very first
`INSERT` Concept Unit, reached through Android's structured API instead
of a hand-typed SQL string.

### Connect the pieces

Every operation this lesson opened with, run by hand through `sqlite3`
— declaring a table's shape, adding a row, reading rows back by
condition, changing and removing rows — has a direct, named counterpart
in Android's own persistence API: `SQLiteOpenHelper` for the
create/upgrade lifecycle, `execSQL` for raw DDL, and `ContentValues` +
`insert`/`query`/`rawQuery` + `Cursor` for structured, injection-safe
row-level work. None of it is new mechanics — it's the same SQL, the
same four CRUD operations, reached through a different, safer, and more
structured door.

---

## Closing

- **Connect the pieces** — One concrete value, `'Groceries'`, moving
  through every unit built in this lesson: declared possible by
  `CREATE TABLE`'s `title TEXT NOT NULL` column; actually stored by
  `INSERT INTO note (title, ...) VALUES ('Groceries', ...)`; read back
  by `SELECT id, title FROM note WHERE title = 'Groceries'`; and, had
  the later `UPDATE`/`DELETE` Concept Unit targeted it instead of the
  other row, changeable or removable the same way. On the Android side,
  that same string would arrive as this lesson's `insertNote` method's
  own `title` parameter, land in a `ContentValues` under the key
  `"title"`, and be handed to `SQLiteDatabase.insert` — never touching
  raw SQL text at any point along that path.
- **What breaks without this** — Running `DELETE FROM note;` with no
  `WHERE` clause (deliberately, as a demonstration, against `scratch.db`
  — not against any real data) removes every row in the table at once,
  with no confirmation and no direct undo; running
  `SELECT * FROM note;` immediately afterward confirms an empty result.
  Restoring the table means re-running this lesson's own earlier
  `CREATE TABLE` and `INSERT` statements from the top — proving directly
  that `WHERE`'s absence, not `DELETE` itself, is what turned "remove
  one row" into "remove everything."
- **Exercises** — Using only `sqlite3` and the `note` table's existing
  shape: (1) insert three more notes with different titles; (2) write a
  `SELECT` that returns only notes whose `body` is `NULL` (research
  SQL's `IS NULL` — plain `= NULL` does not work, and discovering why
  is itself part of the exercise); (3) write an `UPDATE` that changes
  every note's `created_at` to a single fixed value, deliberately with
  no `WHERE`, and confirm with `SELECT` that it really did affect every
  row; (4) sketch, in comments only (no Android runtime needed), what a
  `deleteNote(SQLiteDatabase db, long id)` method would look like, using
  `SQLiteDatabase.delete(String table, String whereClause, String[]
  whereArgs)` — not shown in this lesson — by reading its real
  documented signature and reasoning from the `insert`/`query` shapes
  already covered here.
- **Definition of done** — [ ] `CREATE TABLE`, `INSERT`, `SELECT ...
  WHERE`, `UPDATE`, and `DELETE` have each been run for real, by hand,
  against `scratch.db`, with their real output seen. [ ] The role of
  `SQLiteOpenHelper`'s `onCreate` vs. `onUpgrade` can be stated without
  looking back at this lesson. [ ] The difference between `execSQL` and
  `insert`/`query` — and specifically *why* the structured pair exists —
  can be explained in terms of SQL injection, not just "one takes a
  ContentValues." No commit — this lesson has no project of its own to
  commit to.
