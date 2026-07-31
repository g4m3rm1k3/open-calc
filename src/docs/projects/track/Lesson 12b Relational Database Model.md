# Lesson 12b: Relational Database Model

**What you will build:** No new code to compile — this reads real,
verified SQL run against a real SQLite database.

**What you need to know first:** Lesson 11d's `SharedPreferences`.

**Terms introduced in this lesson:**

- **Relational database model** — data organized as tables (a fixed set
  of named, typed columns) holding any number of rows, each row one
  record, queried declaratively rather than by manually walking a data
  structure.

---

## Concept Unit: Relational Database Model

### The Problem

Lesson 11d's own `SharedPreferences` can store one number, or one string,
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
named, typed columns; each `INSERT` adds one row/record.

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

Organizing data as fixed-shape tables of rows, rather than ad hoc
key-value pairs, is what makes "many structured, related records"
representable at all — the foundation every relational query language
builds on, regardless of which specific database engine implements it.

Also recognized in: spreadsheets (rows and columns, the same shape in
miniature), any relational database engine — SQLite, PostgreSQL,
MySQL — sharing this identical table/row model underneath real syntax
differences.

### SE Lens

The alternative — storing structured, related records as several
separate `SharedPreferences` keys, manually kept in sync — was not chosen
because `SharedPreferences` has no concept of "many rows of the same
shape" at all; a relational table is the structure this kind of data
actually needs.

---

## Connect the Pieces

`items` is one table holding any number of rows, each one record. The
next lesson introduces the language used to actually query and modify
that data.

## What Breaks Without This

Storing an entire inventory as several `SharedPreferences` keys forces
manual bookkeeping for every relationship between records — there is no
way to ask "which items have quantity greater than 10" without loading
and checking every value by hand.

## Exercises

1. Run this lesson's own `CREATE TABLE`/`INSERT`/`SELECT` SQL yourself
   against a real SQLite database (via the `sqlite3` command-line tool)
   and confirm you see the same real output shown above.
2. Add a fourth row to `items` and rerun the `SELECT` query, confirming
   the new row appears or doesn't appear correctly based on its
   quantity.
3. Explain, in your own words, why a table's columns are described as
   "fixed" while its rows are not.

## Definition of Done

- [ ] You ran (or read the real, verified output of) the
      `CREATE TABLE`/`INSERT`/`SELECT` SQL and can explain what a
      relational table is.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why
      `SharedPreferences` cannot represent this kind of data.
