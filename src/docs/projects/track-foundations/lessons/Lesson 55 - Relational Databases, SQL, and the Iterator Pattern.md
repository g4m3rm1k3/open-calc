# Lesson 55: Relational Databases, SQL, and the Iterator Pattern

**What you will build:** Two units run real, verified SQL against a real
SQLite database. Two units read real Android mechanisms directly. One
unit is a small, fully runnable, plain Java lab. One unit runs a real,
verified SQL-injection attack.

**What you need to know first:** Lesson 05's inheritance, Lesson 54's
boundary validation.

**Terms introduced in this lesson:**

- **Relational database model** — data organized as tables (a fixed set
  of named, typed columns) holding any number of rows, each row one
  record, queried declaratively rather than by manually walking a data
  structure.
- **SQL** — the declarative query language used to define tables and
  read/write their rows in a relational database — not Java syntax,
  regardless of which language embeds it as a string.
- **Primary key** — a column (or set of columns) guaranteed unique across
  every row in a table, used to identify one exact record regardless of
  whether any other column's values happen to coincide.
- **`SQLiteOpenHelper`** — an Android base class managing a SQLite
  database file's creation and version upgrades, subclassed to define a
  specific app's own schema.
- **`Cursor`** — a database result set that reads rows one at a time on
  demand, rather than loading every matching row into memory at once.
- **Iterator Pattern** — a uniform way of stepping through a sequence one
  element at a time, without exposing how that sequence is actually
  stored or produced underneath.
- **SQL injection** — a vulnerability where untrusted input, concatenated
  directly into a SQL query string, is interpreted as part of the query's
  own structure instead of as plain data.

---

## Concept Unit: Relational Database Model and SQL

### The Problem

Lesson 11's own `SharedPreferences` can store one number, or one string,
under one key — it has no way to represent many structured, related
records (a whole inventory of items, each with its own name and
quantity) the way a real database can.

### Introduce the Concept in Isolation

This is not a throwaway lab in the Java sense — it's real, standard SQL,
executed this session against a real SQLite database to verify the
output:

```sql
CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    name TEXT,
    quantity INTEGER
);

INSERT INTO items (name, quantity) VALUES ('Wrench', 12);
INSERT INTO items (name, quantity) VALUES ('Bolt', 340);
INSERT INTO items (name, quantity) VALUES ('Hammer', 5);

SELECT id, name, quantity FROM items WHERE quantity > 10;
```

Here is the real output (run against a real SQLite database, verified
this session):

```
1|Wrench|12
2|Bolt|340
```

This is the `relational database model` — **first appearance**: data
organized as tables (a fixed set of named, typed columns) holding any
number of rows, each row one record, queried declaratively rather than
by manually walking a data structure. `items` is one table, with three
named, typed columns; each `INSERT` adds one row/record. This is `SQL`
— **first appearance**: the declarative query language used to define
tables and read/write their rows in a relational database — not Java
syntax, regardless of which language embeds it as a string. `CREATE
TABLE` and `SELECT` are real SQL vocabulary, unrelated to any Java
keyword, even where a Java program later embeds this exact same text as
a string.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified SQL.

### Mechanical Walkthrough

1. `CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, quantity
   INTEGER);` — **(a) first appearance**: defines the table's fixed
   column structure, once, before any row exists.
2. Three `INSERT INTO items (...) VALUES (...)` statements — **(a) first
   appearance**: each adds exactly one row/record to the table.
3. `SELECT id, name, quantity FROM items WHERE quantity > 10;` — **(a)
   first appearance**: declares *what* rows to retrieve (quantity greater
   than 10), not *how* to walk the table to find them — the database
   itself decides the retrieval mechanism.
4. The real output shows exactly two rows: Wrench and Bolt qualify
   (`12 > 10`, `340 > 10`); Hammer (`5`) is correctly excluded.

### CS Lens

SQL's declarative style — say *what* you want, not *how* to get it — is
the core distinction from every collection-walking loop this curriculum
has shown so far (a `for` loop manually decides *how* to search). This
distinction is the transferable skill, regardless of which specific
relational database engine (SQLite, PostgreSQL, MySQL) is involved.

Also recognized in: SQL itself, standardized and portable (with dialect
differences) across virtually every relational database engine in
existence, LINQ in C# (a declarative query syntax layered over
collections and databases alike).

### SE Lens

The alternative — storing structured, related records as several
separate `SharedPreferences` keys, manually kept in sync — was not chosen
because `SharedPreferences` has no concept of "many rows of the same
shape," no query language, and no way to ask "which rows satisfy this
condition" without manually loading and checking every value by hand.

---

## Concept Unit: Primary Key

### The Problem

`Item.equals()` (Lesson 07) compares every field — but that can't answer
"update *this exact* item" once two items could coincidentally share
every single value (two "Wrench, 12" rows, say). Something must
distinguish one specific row from every other row, independent of
whether its other data happens to match.

### Introduce the Concept in Isolation

This is not a throwaway lab in the Java sense — it's real, standard SQL,
executed this session against a real SQLite database to verify the
output:

```sql
INSERT INTO items (id, name, quantity) VALUES (1, 'Duplicate', 99);
```

Here is the real output (run against the same database as above, which
already has a row with `id = 1`, verified this session):

```
Error: stepping, UNIQUE constraint failed: items.id (19)
```

This is `primary key` — **first appearance**: a column (or set of
columns) guaranteed unique across every row in a table, used to identify
one exact record regardless of whether any other column's values happen
to coincide. `id INTEGER PRIMARY KEY` (declared above) means the database
itself refuses this insert — real, verified proof the database enforces
uniqueness on `id`, not merely a convention a developer has to remember.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified SQL.

### Mechanical Walkthrough

1. `id INTEGER PRIMARY KEY` — **(b) reappearing** from this lesson's own
   first Concept Unit, now examined specifically for its uniqueness
   guarantee.
2. `INSERT INTO items (id, name, quantity) VALUES (1, 'Duplicate', 99);`
   — attempts to insert a *second* row claiming `id = 1`, already used by
   the real `Wrench` row inserted earlier.
3. The database itself rejects the insert with a real
   `UNIQUE constraint failed` error — proof the guarantee is enforced by
   the database, not merely assumed.

### CS Lens

A primary key is what makes "update/delete *this exact* row" possible at
all, regardless of whether every other column happens to match another
row — the same underlying need that motivates unique identifiers in
general (an object's own identity, Lesson 18, versus its merely-equal
content).

Also recognized in: primary keys in every relational database engine,
unique identifier fields (`id`, UUID) in NoSQL databases and APIs
generally.

### SE Lens

The alternative — identifying a row by its full set of column values
instead of a dedicated key — was not chosen because two rows can
legitimately share every other value (two identical inventory counts);
only a value the database itself guarantees unique can reliably target
one exact row.

---

## Concept Unit: `SQLiteOpenHelper`

### The Problem

A real, on-device SQLite database file needs to be created the first
time an app runs, and its schema needs a defined way to change (an
upgrade) across app versions — neither of which the raw SQL from this
lesson's own first unit handles by itself.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
class InventoryDbHelper extends SQLiteOpenHelper {
    InventoryDbHelper(Context context) {
        super(context, "inventory.db", null, 1);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, quantity INTEGER)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS items");
        onCreate(db);
    }
}
```

This is `SQLiteOpenHelper` — **first appearance**: an Android base class
managing a SQLite database file's creation and version upgrades,
subclassed to define a specific app's own schema. `InventoryDbHelper`
`extends` (Lesson 05's own inheritance) `SQLiteOpenHelper`, supplying the
app-specific schema (`onCreate`) and upgrade behavior (`onUpgrade`) that
`SQLiteOpenHelper` itself calls automatically at the right moment.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class InventoryDbHelper extends SQLiteOpenHelper` — **(b)
   reappearing** inheritance from Lesson 05, now subclassing a real
   Android framework class.
2. `super(context, "inventory.db", null, 1);` — **(b) reappearing** `
   super` constructor call from Lesson 33, naming the database file and
   its schema version.
3. `onCreate(SQLiteDatabase db) { db.execSQL("CREATE TABLE ..."); }` —
   **(a) first appearance**: called automatically, exactly once, the
   first time the database file doesn't yet exist.
4. `onUpgrade(...)` — **(a) first appearance**: called automatically when
   the app declares a higher schema version than what's currently on
   disk, giving the app a defined place to migrate its schema.

### CS Lens

`SQLiteOpenHelper` is Lesson 32's own two-phase-construction idea applied
to a database file: the file's existence/creation is handled once,
automatically, separately from every later open of that same file — the
app never needs to manually check "does this file already exist" itself.

Also recognized in: database migration frameworks in virtually every
server-side framework (Rails migrations, Django migrations) — the same
"versioned schema, upgrade path defined once" idea.

### SE Lens

The alternative — manually checking whether the database file exists and
running `CREATE TABLE` by hand every time the app starts — was not
chosen because `SQLiteOpenHelper` already handles exactly this check,
correctly, once, with a defined upgrade path for schema changes across
app versions.

---

## Concept Unit: `Cursor`

### The Problem

Loading every single row of a very large table into memory at once, just
to read them one at a time, wastes memory the app may never need all at
once — the same "don't eagerly load everything" concern Lesson 46's own
`ViewHolder` recycling material already raised for on-screen rows.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Cursor cursor = db.rawQuery("SELECT id, name, quantity FROM items", null);
while (cursor.moveToNext()) {
    int id = cursor.getInt(0);
    String name = cursor.getString(1);
    int quantity = cursor.getInt(2);
    System.out.println(id + ": " + name + ", " + quantity);
}
cursor.close();
```

This is `Cursor` — **first appearance**: a database result set that
reads rows one at a time on demand, rather than loading every matching
row into memory at once. `cursor.moveToNext()` advances to, and loads,
exactly one row at a time — the rest of the result set stays on disk
until actually requested.

#### Execution Trace

Trace of the `while (cursor.moveToNext())` loop against this lesson's own
three-row `items` table:

1. `cursor.moveToNext()` — advances to the Wrench row, returns `true`;
   `getInt`/`getString` read only that one row's own three columns, and
   `1: Wrench, 12` is printed.
2. `cursor.moveToNext()` — advances to the Bolt row, returns `true`; the
   Wrench row is not re-read or kept in memory — `2: Bolt, 340` is
   printed.
3. `cursor.moveToNext()` — advances to the Hammer row, returns `true`;
   `3: Hammer, 5` is printed.
4. `cursor.moveToNext()` — no rows remain, returns `false`; the loop ends
   without ever having held more than one row's data at a time.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `db.rawQuery("SELECT ...", null)` — **(a) first appearance**: runs the
   SQL query and returns a `Cursor` positioned before the first row — no
   row data has been read into memory yet.
2. `while (cursor.moveToNext())` — **(a) first appearance**: advances to
   the next row, returning `false` once no rows remain, ending the loop.
3. `cursor.getInt(0)`, `cursor.getString(1)`, `cursor.getInt(2)` — **(a)
   first appearance**: read the current row's columns by position, only
   for the one row currently loaded.
4. `cursor.close();` — **(b) reappearing** manual-resource-cleanup
   pattern from Lesson 29: releases the `Cursor`'s own underlying
   resources once done.

### CS Lens

`Cursor` reads on demand instead of eagerly — the same underlying
resource-efficiency concern as lazy evaluation generally, and directly
connected to this lesson's next unit: `Cursor`'s own `moveToNext()`
shape is the concrete Android instance of the general Iterator Pattern.

Also recognized in: database cursors in virtually every SQL client
library across languages, lazy sequences/generators in Python and other
languages.

### SE Lens

The alternative — a method returning a fully-loaded `List<Item>` of every
matching row at once — was not chosen for very large result sets because
it forces loading everything into memory immediately, even if the caller
only needs the first few rows; `Cursor` defers that cost until each row is
actually requested.

---

## Concept Unit: Iterator Pattern

### The Problem

`Cursor.moveToNext()` and a `for`-each loop over a `List` look
superficially different, but they're solving the exact same problem: step
through a sequence one element at a time, without the calling code needing
to know how that sequence is actually stored or produced underneath.

### Introduce the Concept in Isolation

```
mkdir lesson-55
cd lesson-55
```

Create `Main.java`:

```java
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Wrench");
        names.add("Bolt");
        names.add("Hammer");

        Iterator<String> iterator = names.iterator();
        while (iterator.hasNext()) {
            String name = iterator.next();
            System.out.println(name);
        }
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Wrench
Bolt
Hammer
```

This is the `Iterator Pattern` — **first appearance**: a uniform way of
stepping through a sequence one element at a time, without exposing how
that sequence is actually stored or produced underneath.
`iterator.hasNext()` and `iterator.next()` are the exact same shape as
`Cursor`'s own `moveToNext()`/`getInt(...)` pair — one method to check
"is there more," one to advance and retrieve — regardless of whether the
underlying sequence is an in-memory `ArrayList` or a database result set
read from disk.

#### Execution Trace

Trace of the `while (iterator.hasNext())` loop:

1. `iterator.hasNext()` returns `true`; `iterator.next()` advances past
   `"Wrench"` and returns it; `Wrench` is printed.
2. `iterator.hasNext()` returns `true`; `iterator.next()` advances past
   `"Bolt"` and returns it; `Bolt` is printed.
3. `iterator.hasNext()` returns `true`; `iterator.next()` advances past
   `"Hammer"` and returns it; `Hammer` is printed.
4. `iterator.hasNext()` returns `false` — no elements remain — and the
   loop ends.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Iterator<String> iterator = names.iterator();` — **(a) first
   appearance**: obtains an iterator positioned before the first element
   — no element has been read yet.
2. `while (iterator.hasNext())` — **(a) first appearance**: checks whether
   another element remains, without advancing.
3. `iterator.next()` — **(a) first appearance**: advances to, and returns,
   the next element — `"Wrench"`, then `"Bolt"`, then `"Hammer"`, each on
   a separate call.

### CS Lens

The Iterator Pattern's whole point is decoupling "how do I step through
this" from "how is this sequence actually stored" — a `for`-each loop
over any `Iterable` in Java is sugar over exactly this same
`hasNext()`/`next()` pair, whether the underlying sequence is an
`ArrayList`, a `Cursor`, or any other iterable source.

Also recognized in: iterators/generators in virtually every mainstream
language (Python's own iterator protocol, C#'s `IEnumerator`), any API
exposing "step through my elements" without exposing internal storage.

### SE Lens

The alternative — exposing a sequence's own internal storage directly (an
array, an internal index) for callers to walk manually — was not chosen
because it would force every caller to know, and depend on, that internal
representation; the Iterator Pattern lets the underlying storage change
freely (an `ArrayList` today, a database `Cursor` tomorrow) without
breaking any code that only ever calls `hasNext()`/`next()`.

---

## Concept Unit: SQL Injection

### The Problem

Building a SQL query by directly concatenating untrusted input into a
query string — rather than treating that input strictly as data — lets
the input change the query's own structure, not just its data, the
moment that input contains SQL syntax of its own.

### Introduce the Concept in Isolation

This is not a throwaway lab in the Java sense — it's a real,
verified SQL-injection attack, executed this session against a real
SQLite database:

```sql
-- Intended: look up one item by name.
SELECT * FROM items WHERE name = 'Wrench';
```

Here is the real, intended output:

```
1|Wrench|12
```

Now the same query, built the way a vulnerable Java program would —
by directly concatenating untrusted input (`' OR '1'='1`) into the query
string:

```sql
SELECT * FROM items WHERE name = '' OR '1'='1';
```

Here is the real, injected output (run this session, against the same
database):

```
1|Wrench|12
2|Bolt|340
3|Hammer|5
```

This is `SQL injection` — **first appearance**: a vulnerability where
untrusted input, concatenated directly into a SQL query string, is
interpreted as part of the query's own structure instead of as plain
data. The intended query returns exactly one row; the injected input
(`' OR '1'='1`) closes the intended string early and adds a condition
that's always true, returning every row in the table instead of one.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
SQL-injection attack.

### Mechanical Walkthrough

1. `SELECT * FROM items WHERE name = 'Wrench';` — **(a) first
   appearance**: the intended query, correctly returning exactly the one
   row named `"Wrench"`.
2. `SELECT * FROM items WHERE name = '' OR '1'='1';` — the same query
   template, but with `name`'s value replaced by attacker-supplied text
   that itself contains SQL syntax (`' OR '1'='1`).
3. Because the input was concatenated directly into the query string
   rather than treated as plain data, `'1'='1'` is evaluated as a real,
   always-true condition of the query itself — the real output proves it:
   every row is returned, not just one.

### CS Lens

This is named explicitly as one of the most common real-world security
vulnerabilities in software history, and a direct consequence of the
exact string-built-query shape shown above — treating untrusted input as
literal query text rather than as data is the root cause, regardless of
which language or database is involved.

Also recognized in: SQL injection across virtually every language and
database that allows building queries by string concatenation, and the
broader category of injection vulnerabilities generally (command
injection, XSS) — untrusted input being interpreted as code/structure
instead of as data.

### SE Lens

The real fix — parameterized queries (binding `"Wrench"` as a separate
value rather than concatenating it into the query text) — was not shown
directly above because this unit's job is proving the vulnerability is
real, not the fix; the same query built with a parameterized/bound value
instead of string concatenation cannot be reinterpreted this way, because
the database itself never treats a bound parameter's contents as query
syntax, no matter what characters it contains.

---

## Connect the Pieces

The relational model and SQL established tables, rows, and declarative
querying. Primary key showed how the database itself guarantees one row
can always be targeted exactly. `SQLiteOpenHelper` wires an app's own
schema into Android's real, on-device SQLite file. `Cursor` reads that
schema's rows on demand, one at a time — the exact same shape as the
general Iterator Pattern, now named explicitly. And SQL injection showed
the real, verified cost of building any of these queries by direct string
concatenation with untrusted input, rather than treating that input
strictly as data.

## What Breaks Without This

Skipping `SQLiteOpenHelper` in favor of manually checking file existence
risks recreating the table on every launch, destroying existing data.
Loading every row into a `List` instead of using `Cursor` wastes memory on
very large tables. And building any query by concatenating untrusted
input directly into the query string — as this lesson's own real,
verified example proved — lets that input silently rewrite the query's
own logic, returning far more (or different) data than intended, with no
error or crash to signal it happened.

## Exercises

1. Run this lesson's own `CREATE TABLE`/`INSERT`/`SELECT` SQL yourself
   against a real SQLite database (via the `sqlite3` command-line tool)
   and confirm you see the same real output shown above.
2. Attempt this lesson's own duplicate-primary-key `INSERT` yourself and
   confirm you see the same real `UNIQUE constraint failed` error.
3. Explain, in your own words, why binding `"Wrench"` as a separate,
   parameterized value (rather than concatenating it into the query
   string) prevents the SQL-injection attack shown above.

## Definition of Done

- [ ] You ran (or read the real, verified output of) the
      `CREATE TABLE`/`INSERT`/`SELECT` SQL and can explain what a
      relational table and a declarative query are.
- [ ] You ran (or read the real, verified output of) the duplicate-key
      `INSERT` and can explain what a primary key guarantees.
- [ ] You read the real `SQLiteOpenHelper` and `Cursor` examples and can
      explain what each is responsible for.
- [ ] You ran the `Iterator` example and can explain how it matches
      `Cursor`'s own shape.
- [ ] You ran (or read the real, verified output of) the SQL-injection
      example and can explain why the injected input changed the query's
      own logic.
