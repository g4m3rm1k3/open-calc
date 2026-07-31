# Lesson 12h: SQL Injection

**What you will build:** No new code to compile — this reads a real,
verified SQL-injection attack run against a real SQLite database.

**What you need to know first:** Lesson 12c's SQL, Lesson 9c's boundary
validation.

**Terms introduced in this lesson:**

- **SQL injection** — a security vulnerability where untrusted input is
  concatenated directly into a SQL query string, letting an attacker
  alter the query's actual meaning.

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
database as Lesson 12b):

```
1|Wrench|12
2|Bolt|340
3|Hammer|5
```

This is `SQL injection` — **first appearance**: a security vulnerability
where untrusted input is concatenated directly into a SQL query string,
letting an attacker alter the query's actual meaning. The intended query
returns exactly one row; the injected input (`' OR '1'='1`) closes the
intended string early and adds a condition that's always true, returning
every row in the table instead of one — a boundary-validation failure
(Lesson 9c) at the exact point untrusted input crosses into a query.

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

Lessons 12a through 12g established tables, SQL, primary keys, iteration,
and Android's own `SQLiteOpenHelper`/`Cursor` pair. This lesson closes
the group out with the real, verified cost of building any of those
queries by direct string concatenation with untrusted input, rather than
treating that input strictly as data — exactly the boundary-validation
failure Lesson 9c already named in the abstract.

## What Breaks Without This

Building any query by concatenating untrusted input directly into the
query string — as this lesson's own real, verified example proved — lets
that input silently rewrite the query's own logic, returning far more
(or different) data than intended, with no error or crash to signal it
happened.

## Exercises

1. Run this lesson's own two queries yourself against a real SQLite
   database and confirm you see the same real, injected output.
2. Explain, in your own words, why binding `"Wrench"` as a separate,
   parameterized value (rather than concatenating it into the query
   string) prevents the SQL-injection attack shown above.
3. Explain, in your own words, why SQL injection is a boundary-validation
   failure specifically, connecting your answer to Lesson 9c.

## Definition of Done

- [ ] You ran (or read the real, verified output of) the SQL-injection
      example and can explain why the injected input changed the query's
      own logic.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why SQL
      injection is described as a boundary-validation failure.
