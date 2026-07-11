---
series: python-fundamentals
level: 36
title: SQLite
lang: python
---

SQLite is a database that lives in a single file — no server, no installation, no configuration. Python includes it in the standard library via `sqlite3`. It stores structured data in tables, lets you query it with SQL, and persists it between program runs. SQLite powers millions of production applications: every iOS and Android device uses it, every Firefox and Chrome installation uses it, and every Python project that needs structured persistent storage can use it.

## What a Database Gives You That a File Does Not

A file stores text or bytes. Finding a specific record requires reading every line. A database stores records in tables, indexes them for fast lookup, enforces relationships between tables, and lets multiple processes read and write safely.

```text
File                          Database
─────────────────────────────────────────────────────
Read everything to find one   O(log n) index lookup
No schema enforcement         Schema enforced on write
No querying — you write it    SQL: filtering, sorting, joining
Text comparison only          Types: int, float, text, date
```

SQLite gives all of this without a separate server process. The entire database is one `.db` file.

## Connecting and Creating a Table

`sqlite3.connect(path)` opens (or creates) a database file and returns a **connection** object. `connection.cursor()` returns a **cursor** — the object you use to run SQL statements:

```python
import sqlite3

connection = sqlite3.connect(":memory:")
cursor = connection.cursor()

cursor.execute("""
    CREATE TABLE products (
        id      INTEGER PRIMARY KEY,
        name    TEXT NOT NULL,
        price   REAL NOT NULL,
        stock   INTEGER NOT NULL
    )
""")

connection.commit()
print("Table created.")
```

```text
Table created.
```

`":memory:"` — a special path that creates the database in RAM rather than on disk. Useful for testing and for data you only need during one program run. Replace with `"shop.db"` to persist it to a file.

`cursor.execute(sql)` — sends a SQL statement to the database engine. It does not return results from `CREATE TABLE` — it just runs the statement.

`connection.commit()` — saves all changes since the last commit. Without this, changes exist in a temporary transaction and are discarded when the connection closes. `SELECT` queries do not need a commit, but `INSERT`, `UPDATE`, and `DELETE` always do.

**CS lens:** `commit()` implements **transaction semantics**: a group of changes either all succeed or all fail together. If your program crashes between two `INSERT` statements, an uncommitted transaction rolls back — the database is left in its last committed state, not half-updated. This is why financial systems use databases: a money transfer that debits one account and credits another must be atomic.

## Inserting Records

Use parameterised queries to insert data. Never concatenate user data directly into SQL strings:

```python
import sqlite3

connection = sqlite3.connect(":memory:")
cursor = connection.cursor()

cursor.execute("CREATE TABLE products (name TEXT, price REAL, stock INTEGER)")

products_to_add = [
    ("Apple",  1.20, 500),
    ("Banana", 0.50, 1200),
    ("Cherry", 3.00, 80),
]

cursor.executemany("INSERT INTO products VALUES (?, ?, ?)", products_to_add)
connection.commit()
print("Rows inserted.")
```

```text
Rows inserted.
```

`?` — a **parameter placeholder**. For each `?`, SQLite takes the corresponding value from the tuple and inserts it safely. This prevents **SQL injection**: if `name` were `"'; DROP TABLE products; --"`, the parameterised query inserts that string literally instead of executing it as SQL.

`cursor.executemany(sql, list_of_tuples)` — runs the same SQL statement once for each tuple in the list. Equivalent to calling `cursor.execute` in a loop but faster.

**SE lens:** Never build SQL strings with f-strings or `+` concatenation. `f"INSERT INTO products VALUES ('{name}', {price})"` is an SQL injection vulnerability — any string with a quote character in it can break the query or destroy your database. Parameterised queries are not a best practice, they are a requirement.

## Querying Records

`cursor.execute("SELECT ...")` followed by `.fetchall()` returns all matching rows as a list of tuples:

```python
import sqlite3

connection = sqlite3.connect(":memory:")
cursor = connection.cursor()
cursor.execute("CREATE TABLE products (name TEXT, price REAL, stock INTEGER)")
cursor.executemany("INSERT INTO products VALUES (?, ?, ?)", [
    ("Apple", 1.20, 500), ("Banana", 0.50, 1200), ("Cherry", 3.00, 80)
])
connection.commit()

cursor.execute("SELECT name, price FROM products WHERE stock > ? ORDER BY price", (100,))
rows = cursor.fetchall()

for name, price in rows:
    print(f"{name}: £{price:.2f}")
```

```text
Banana: £0.50
Apple: £1.20
```

`cursor.fetchall()` — returns a list of tuples, one per row. Each tuple contains the values for the selected columns in order.

`WHERE stock > ?` — filters rows. `ORDER BY price` — sorts ascending by price. The `(100,)` is a one-element tuple providing the parameter for `?`. A bare `100` without the comma is an integer, not a tuple — `executemany` and `execute` both require tuples for parameters.

`cursor.fetchone()` — returns the next single row as a tuple, or `None` if there are no more rows. Use it when you expect exactly one result.

## Challenge: query_high_scorers

Write a function `query_high_scorers(scores, threshold)` that:
1. Creates an in-memory SQLite database with a `scores` table (`name TEXT, score INTEGER`)
2. Inserts all `(name, score)` tuples from the `scores` list
3. Returns a sorted list of names whose score is greater than `threshold`

`sqlite3.connect(":memory:")` — in-memory database.
`cursor.fetchall()` — returns all rows as a list of tuples.

```challenge
def query_high_scorers(scores, threshold):
    import sqlite3
    pass
```

```test
data = [("Alice", 92), ("Bob", 45), ("Eve", 88), ("Dan", 55)]
assert query_high_scorers(data, 80) == ["Alice", "Eve"]
assert query_high_scorers(data, 90) == ["Alice"]
assert query_high_scorers(data, 100) == []
assert query_high_scorers(data, 44) == ["Alice", "Bob", "Dan", "Eve"]
assert query_high_scorers([], 50) == []
```
