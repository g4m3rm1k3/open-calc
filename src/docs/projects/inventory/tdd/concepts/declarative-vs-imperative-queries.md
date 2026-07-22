# Concept: Declarative vs. Imperative Data Access

**What you'll understand by the end:** the difference between describing *what* result you want and writing out *how* to compute it step by step, and why that distinction matters beyond just SQL.

**Prerequisites:** `sql-insert-select-where.md`.

## Setup

Python 3 with its standard-library `sqlite3` module — no install needed.

## The Problem

Getting "every pet older than 2, sorted by name" out of a collection of data can be expressed two fundamentally different ways: writing out the actual steps to loop, compare, and sort (imperative), or simply stating the desired result and letting something else figure out how to produce it (declarative). Both can reach the identical answer — the difference is in what the *code itself* actually says, and who's responsible for deciding how the work gets done.

## The Isolated Example

Imperative — Python, describing *how*:
```python
pets = [
    {"name": "Rex", "age": 3}, {"name": "Milo", "age": 5}, {"name": "Fido", "age": 1},
]

result = []
for pet in pets:
    if pet["age"] > 2:
        result.append(pet)
result.sort(key=lambda p: p["name"])

print(result)
```

Declarative — SQL, describing *what*:
```python
import sqlite3
connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE pets (name TEXT, age INTEGER)")
connection.executemany("INSERT INTO pets VALUES (?, ?)",
    [("Rex", 3), ("Milo", 5), ("Fido", 1)])
connection.commit()

result = connection.execute(
    "SELECT * FROM pets WHERE age > 2 ORDER BY name"
).fetchall()
print(result)
```

**Real output (both versions):**
```
[{'name': 'Rex', 'age': 3}, {'name': 'Milo', 'age': 5}]
[('Rex', 3), ('Milo', 5)]
```

**What this proves:** both versions produce the same logical result (Rex and Milo, sorted by name), but the Python version explicitly names every step (loop, compare, append, sort) while the SQL version states only the desired outcome — filtering condition and sort order — with zero code describing *how* to actually scan, filter, or sort the underlying data.

## Mechanical Walkthrough

- **Imperative** code specifies a sequence of steps that, together, produce the desired result — the `for` loop, the `if` check, and `.sort()` are each explicit instructions that must run, in this order, for the correct answer to emerge.
- **Declarative** code specifies *properties of the desired result* — "rows where age > 2," "ordered by name" — without specifying any particular algorithm for achieving it. `SELECT ... WHERE ... ORDER BY` is a description of an outcome, handed to SQLite's own query engine, which decides internally how to actually scan, filter, and sort the data.
- Because a declarative query doesn't commit to *how* the result is produced, the underlying engine is free to change its actual strategy (adding an index that makes the `WHERE` clause vastly faster, for instance) without the query itself changing at all — the "what" and the "how" are genuinely decoupled.
- Neither style is universally superior — they're different tools: imperative code is often necessary and natural for control flow and step-by-step logic a declarative system has no vocabulary for; declarative queries excel specifically at data retrieval/transformation questions with a clear, describable target shape.

## CS Lens

This distinction is one of the most fundamental in programming language and system design — a **declarative** system separates the specification of a result from its implementation, letting an underlying engine optimize *how* independently of *what* was asked for; an **imperative** system directly specifies control flow and state changes, with no such separation. SQL is one of the most successful, longest-lived declarative languages in computing (dating to the 1970s), precisely because "describe the data you want" turned out to be a durable, powerful abstraction that's outlived countless specific storage engine implementations underneath it.

Also recognized in: regular expressions (`regular-language-finite-state-machine.md` — describing a pattern to match, not the scanning algorithm), CSS (`css-rule-syntax-selectors-cascade.md` — describing which elements should look how, not a rendering algorithm), and functional programming's general preference for expressing *what* a computation is (`javascript-array-map.md`'s `.map()`, expressing "transform every element" declaratively) over explicit imperative loops.

## SE Lens

The real, practical payoff of declarative data access specifically: a `SELECT` query's performance can improve dramatically (via an index, a smarter query planner in a newer database version) with *zero* code changes on the application side, because the application never committed to a specific retrieval algorithm in the first place — it only stated the desired result. An equivalent hand-written imperative scan, by contrast, has to be manually rewritten by a person to take advantage of any such improvement, since the "how" was baked directly into the code itself.

## Connection

Builds on `sql-insert-select-where.md`. The general principle behind why this project's own backend increasingly prefers expressing data operations declaratively (a SQL query, a `.map()`/`.filter()` chain) over hand-written imperative loops wherever the underlying engine or language runtime can do the work at least as well.

## Try It Yourself

1. Extend the imperative version to also compute the *average* age of the filtered pets, then write the equivalent using SQL's `AVG()` aggregate function (`SELECT AVG(age) FROM pets WHERE age > 2`) — compare how much of the "how" (looping, summing, dividing, counting) the SQL version left entirely unwritten.
2. Add an index to the `pets` table (`CREATE INDEX idx_age ON pets(age)`) and reason about (or use SQLite's `EXPLAIN QUERY PLAN` to directly observe) how the query's *execution strategy* can change with zero changes to the `SELECT` statement itself — concrete proof the "how" was never part of the query's own text.
3. Find one real loop in a codebase you have access to that filters and sorts an in-memory collection, and sketch what the equivalent declarative expression would look like (a SQL query, if the data lives in a database, or a chain of `.filter()`/`.sort()` calls) — reasoning about whether the declarative version would be clearer, and what (if anything) would be lost by switching to it.
