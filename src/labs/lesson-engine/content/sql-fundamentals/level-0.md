---
series: sql-fundamentals
level: 0
title: What SQL Is
lang: sql
---

# What SQL Is

SQL (Structured Query Language) is the language for working with relational databases. Every web application that stores data uses a relational database — user accounts, products, orders, posts. SQL is how you create, read, update, and delete that data.

## What a relational database is

A relational database stores data in **tables** — like spreadsheets, but with strict structure. Each table has **columns** (fields/attributes) and **rows** (records). Tables are linked to each other through **foreign keys**.

```sql
-- A users table
CREATE TABLE users (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  role     TEXT DEFAULT 'student'
);

-- A courses table
CREATE TABLE courses (
  id          INTEGER PRIMARY KEY,
  title       TEXT NOT NULL,
  author_id   INTEGER REFERENCES users(id),
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
```

```text
-- users table
| id | name    | email              | role    |
|----|---------|-------------------|---------|
| 1  | Alice   | alice@example.com  | admin   |
| 2  | Bob     | bob@example.com    | student |
| 3  | Carol   | carol@example.com  | student |

-- courses table
| id | title              | author_id | created_at  |
|----|--------------------|-----------|-------------|
| 1  | Python Fundamentals | 1        | 2026-01-15  |
| 2  | CSS Mastery         | 1        | 2026-02-10  |
| 3  | JavaScript          | 2        | 2026-03-05  |
```

**CS lens:** A relational database implements the **relational model** — a mathematical model from Edgar Codd (1970) where data is represented as relations (tables), and operations on data are expressed in relational algebra. SQL is a concrete language based on this model. The key idea: data is normalized (stored without redundancy) and relationships are expressed through foreign keys, not by duplicating data.

## SQL statements — the four operations

SQL has four core data operations called **CRUD**: Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE). Plus DDL (Data Definition Language) statements for creating tables.

```sql
-- CREATE: add a row
INSERT INTO users (name, email, role)
VALUES ('Diana', 'diana@example.com', 'student');

-- READ: select rows
SELECT name, email FROM users;

-- UPDATE: modify existing rows
UPDATE users SET role = 'admin' WHERE id = 4;

-- DELETE: remove rows
DELETE FROM users WHERE id = 4;
```

```text
-- SELECT name, email FROM users:
| name  | email              |
|-------|--------------------|
| Alice | alice@example.com  |
| Bob   | bob@example.com    |
| Carol | carol@example.com  |
| Diana | diana@example.com  |
```

**SE lens:** Every web API endpoint ultimately maps to one or more SQL operations. `GET /users` → `SELECT`. `POST /users` → `INSERT`. `PATCH /users/1` → `UPDATE`. `DELETE /users/1` → `DELETE`. Understanding SQL is understanding what your backend is actually doing when it "talks to the database." Knowing SQL means you can diagnose performance issues, understand query costs, and design schemas that scale.

## Popular SQL databases

SQL is a standard — the same core syntax works across implementations. The differences are in advanced features, performance, and deployment model.

```text
SQLite   — serverless, single file, no installation. Used in browsers (WebSQL), 
           mobile apps, small projects. The default database in Python, Django.

PostgreSQL — the most feature-rich open-source RDBMS. Used by most production
             web apps. Supports JSON, full-text search, complex queries.

MySQL / MariaDB — widely used, powers much of early web (WordPress, etc.).

SQL Server — Microsoft's RDBMS. Common in enterprise .NET applications.

All of the above accept the SQL you'll learn here. Differences are mostly in
advanced syntax and functions, not in SELECT/FROM/WHERE/JOIN.
```

**Common mistakes:**
- Treating SQL as case-sensitive for keywords — `SELECT`, `select`, and `Select` all work. Convention is to write SQL keywords in uppercase for readability.
- Forgetting `WHERE` in UPDATE or DELETE — `DELETE FROM users` without `WHERE` deletes **every row**. Always test `WHERE` clauses with `SELECT` first.

**Debug tip:** Before running an UPDATE or DELETE, run the equivalent SELECT with the same WHERE clause. If the SELECT returns the right rows, the UPDATE/DELETE will affect the right rows.

**Next:** SELECT and FROM — the core query syntax for reading data from tables.

## Challenge: sql_basics

Write a SQL SELECT statement.

Write a SQL statement that selects `name` and `email` from a table called `students` where `active = 1`.

```sql
-- Write your SELECT statement:
```

```test
var q = code.trim().toLowerCase()
assert q.startsWith('select')
assert q.includes('name')
assert q.includes('email')
assert q.includes('from')
assert q.includes('students')
assert q.includes('where')
assert q.includes('active')
```
