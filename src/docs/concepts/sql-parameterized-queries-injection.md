# Concept: Parameterized Queries and SQL Injection

**What you'll understand by the end:** why building a SQL query by concatenating raw input into a string is dangerous, and how parameterized queries fix it completely.

**Prerequisites:** `sql-insert-select-where.md`.

## Setup

Python 3 with its standard-library `sqlite3` module — no install needed.

## The Problem

A SQL query is just text handed to a database engine to execute — if part of that text comes directly from untrusted input (a user-typed name, a URL segment), and that input is inserted into the query string *before* the database ever sees it, the input can contain real SQL syntax of its own, changing what the query actually does, not just what value it searches for.

## The Isolated Example

```python
import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, secret TEXT)")
connection.execute("INSERT INTO users (name, secret) VALUES ('alice', 'alice-secret')")
connection.execute("INSERT INTO users (name, secret) VALUES ('bob', 'bob-secret')")
connection.commit()

def vulnerable_lookup(name):
    query = f"SELECT * FROM users WHERE name = '{name}'"
    print("query sent:", query)
    return connection.execute(query).fetchall()

def safe_lookup(name):
    return connection.execute("SELECT * FROM users WHERE name = ?", (name,)).fetchall()

print(vulnerable_lookup("alice"))
print(vulnerable_lookup("x' OR '1'='1"))
print(safe_lookup("x' OR '1'='1"))
```

**Real output:**
```
query sent: SELECT * FROM users WHERE name = 'alice'
[(1, 'alice', 'alice-secret')]
query sent: SELECT * FROM users WHERE name = 'x' OR '1'='1'
[(1, 'alice', 'alice-secret'), (2, 'bob', 'bob-secret')]
[]
```

**What this proves:** the malicious input `"x' OR '1'='1"`, string-concatenated directly into the query, closed the intended quoted string early and added a real, always-true `OR` condition — the vulnerable version leaked *every* row, including `bob`'s, from a lookup that should have matched nothing. The parameterized version, given the identical malicious string, correctly returned zero rows — the input was never interpreted as SQL syntax at all.

## Mechanical Walkthrough

- `f"...{name}..."` (or any other string-building — `.format()`, plain `+` concatenation) inserts `name`'s literal characters directly into the query's text, *before* the database ever parses it — from the database's point of view, there is no distinction between "structure the developer wrote" and "data the input happened to contain"; it is all just one string of SQL to parse and execute.
- `?` is a **placeholder** — the query's text sent to the database contains the literal characters `?`, never the actual value; the real value is passed *separately*, as a second argument to `.execute()`, and the database driver substitutes it in a way that is guaranteed to be treated purely as a data value, never as SQL syntax, no matter what characters it contains.
- This is why `"x' OR '1'='1"` is completely inert when passed as a parameter: the database compares the `name` column against the literal, nine-character string `x' OR '1'='1` — quotes and all, as data — rather than executing any part of it as a condition.
- Every real database driver provides some form of this mechanism, though the exact placeholder syntax varies (`?` in SQLite, `%s` in PostgreSQL's `psycopg2`, `$1` in some others) — the underlying guarantee (values are sent separately from query structure) is the same regardless of syntax.

## CS Lens

This is **injection** — a general vulnerability class where untrusted input is interpreted as *code or structure* rather than pure *data*, because the two were never actually kept separate. SQL injection is the most famous specific instance, but the identical failure shape recurs anywhere a string is assembled by concatenating trusted structure with untrusted content: shell command injection (untrusted input reaching a shell command string), and, in a different but related form, this project's own XSS concern (untrusted content reaching raw HTML via `.innerHTML` instead of `.textContent`).

Also recognized in: OWASP's own long-standing top-10 vulnerability list (SQL injection has appeared on it for over two decades), and any templating or query system that offers both a "safe by construction" interpolation mechanism and a "raw, trust-me" escape hatch — the safe mechanism should always be the default.

## SE Lens

Parameterized queries cost nothing extra to write correctly — `?` with a separate tuple of values is not more code than string interpolation, only a different, safe default habit. The real, asymmetric cost is on the other side: a codebase already built with string-concatenated queries requires auditing every single query by hand to retrofit safety, a real, larger, error-prone undertaking compared to establishing the safe pattern from the very first query written.

## Connection

Builds on `sql-insert-select-where.md`. The identical "never let untrusted input become code/structure" principle appears in `default-deny-security-pattern.md`'s broader security framing, and in this project's own `textcontent-vs-innerhtml-xss.md` concept for the HTML-rendering equivalent of this exact risk.

## Try It Yourself

1. Try a different real injection payload — one that attempts to *delete* data instead of just reading extra rows (`"x'; DROP TABLE users; --"`) — against both `vulnerable_lookup` and `safe_lookup`, and reason about why SQLite's own `execute()` (which runs exactly one statement) limits how far this specific payload could actually go, while some other drivers/configurations allowing multiple statements per call would be considerably more dangerous.
2. Rewrite `vulnerable_lookup` to build its query with Python's `.format()` method instead of an f-string, and confirm the identical vulnerability exists — proof the danger is about *string-building itself*, not the specific interpolation syntax used.
3. Search a real codebase you have access to for any place a database query is built via string formatting/concatenation rather than parameters, and assess (without necessarily changing it yet) whether any part of that string ever originates from user-controllable input.
