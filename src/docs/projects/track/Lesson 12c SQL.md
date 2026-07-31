# Lesson 12c: SQL

**What you will build:** No new code to compile — this reads real,
verified SQL run against a real SQLite database.

**What you need to know first:** Lesson 12b's relational database model.

**Terms introduced in this lesson:**

- **SQL** — a declarative language for describing what data to retrieve,
  insert, update, or define (tables/schema) — a genuinely different
  language from Java, here embedded as plain strings.

---

## Concept Unit: SQL

### The Problem

Lesson 12b's table needs some way to actually be created, filled, and
queried — Java itself has no built-in syntax for "define a table" or
"retrieve rows matching a condition"; a genuinely different, dedicated
language is required.

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

SELECT id, name, quantity FROM items WHERE quantity > 10;
```

Here is the real output (run against the same table as Lesson 12b,
verified this session):

```
1|Wrench|12
2|Bolt|340
```

This is `SQL` — **first appearance**: a declarative language for
describing what data to retrieve, insert, update, or define
(tables/schema) — a genuinely different language from Java, here
embedded as plain strings. `CREATE TABLE` and `SELECT` are real SQL
vocabulary, unrelated to any Java keyword, even where a Java program
later embeds this exact same text as a string.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified SQL.

### Mechanical Walkthrough

1. `CREATE TABLE items (...)` — **(b) reappearing** from Lesson 12b, now
   examined specifically as SQL's own vocabulary for defining schema,
   distinct from any Java syntax.
2. `SELECT id, name, quantity FROM items WHERE quantity > 10;` — **(b)
   reappearing** from Lesson 12b, now examined as SQL's own declarative
   query vocabulary — `SELECT`/`FROM`/`WHERE` describe *what* to
   retrieve, not *how*.

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

The alternative — writing Java code that manually walks a table's own
internal storage to find matching rows — was not chosen because SQL
already provides a standard, declarative way to describe exactly which
rows are wanted, letting the database itself decide the most efficient
way to find them.

---

## Connect the Pieces

`CREATE TABLE` and `SELECT` are real SQL, distinct from Java syntax even
though a Java program will later embed this exact text as a string. The
next lesson shows how the database itself guarantees one specific row
can always be targeted exactly.

## What Breaks Without This

Without a query language like SQL, retrieving "only the rows where
quantity is greater than 10" requires manually loading every row and
checking each one in application code — SQL's `WHERE` clause lets the
database itself do this filtering instead.

## Exercises

1. Write a `SELECT` query that retrieves only rows where `name` equals
   `'Bolt'`, and explain what SQL vocabulary you used.
2. Explain, in your own words, why `CREATE TABLE` and `SELECT` are
   described as "declarative" rather than "procedural."
3. Explain, in your own words, why SQL is a genuinely different language
   from Java, even when a Java program embeds SQL text as a string.

## Definition of Done

- [ ] You read the real SQL example and can explain the difference
      between `CREATE TABLE` and `SELECT`.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why SQL is
      called a declarative language.
