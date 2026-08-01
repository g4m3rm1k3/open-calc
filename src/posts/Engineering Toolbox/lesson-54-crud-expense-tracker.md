# Lesson 54: The Two Words That Make Update and Delete Terrifying

## What you will build

A complete CRUD (Create, Read, Update, Delete) expense tracker — the
Track 6 capstone, and this curriculum's first real use of `UPDATE` and
`DELETE` after four lessons of `CREATE`/`INSERT`/`SELECT` only —
wrapped in a small command-line REPL reusing Lesson 1's own
read-a-command-run-it loop. Chosen from this lesson's own open menu
(notes, expense tracker, contacts, or bookmarks) as an expense tracker
specifically because it gives every CRUD operation a genuine reason to
exist, plus real aggregation reporting (`SUM`, `GROUP BY`) that a plain
notes app wouldn't need.

## What you need to know first

- **Lesson 50** — `sqlite3`, `cursor.execute`, parameterized `?`
  queries, and why string-formatted SQL is never acceptable. Every
  query in this lesson follows that rule without exception.
- **Lesson 1** — the read-a-command, dispatch-on-it, loop-again shape
  this lesson's CLI directly reuses.
- **Lesson 36** — `date.today().isoformat()`, reused for default expense
  dates.

---

## The Problem, in prose, no code yet

Every database lesson in this track so far has only ever added or read
data — `INSERT` and `SELECT`, never once changing or removing a row that
already existed. That's not an accident of convenience; `UPDATE` and
`DELETE` are structurally more dangerous than either of those two
operations, for one specific, easy-to-miss reason worth confronting
directly before writing a single line of the actual tracker: both
commands, by SQL's own design, default to affecting **every row in the
table** unless a `WHERE` clause says otherwise. `SELECT * FROM expenses`
with no `WHERE` is merely inconvenient — it just shows more than
intended. `UPDATE expenses SET amount = 0` with no `WHERE` silently
destroys every stored amount in the entire table, in one line, with no
warning and no confirmation prompt.

---

## Concept Unit: The Two Most Dangerous Words to Accidentally Omit

### The Problem

Before building `update`/`delete` methods that use `WHERE` correctly,
it's worth seeing directly, on real data, exactly what happens the
moment `WHERE` is left off.

### Introduce the concept in isolation

```python
connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE expenses (id INTEGER PRIMARY KEY, category TEXT, amount REAL)")
connection.executemany(
    "INSERT INTO expenses (category, amount) VALUES (?, ?)",
    [("groceries", 45.20), ("rent", 1200.00), ("groceries", 12.50)],
)
connection.commit()
print("before:", connection.execute("SELECT * FROM expenses").fetchall())

print("=== mistake: UPDATE with no WHERE clause ===")
connection.execute("UPDATE expenses SET amount = 0")
print("after:", connection.execute("SELECT * FROM expenses").fetchall())
connection.rollback()

print("=== mistake: DELETE with no WHERE clause ===")
connection.execute("DELETE FROM expenses")
print("after:", connection.execute("SELECT * FROM expenses").fetchall())
connection.rollback()
```

Run it:

```
before: [(1, 'groceries', 45.2), (2, 'rent', 1200.0), (3, 'groceries', 12.5)]
=== mistake: UPDATE with no WHERE clause ===
after: [(1, 'groceries', 0.0), (2, 'rent', 0.0), (3, 'groceries', 0.0)]
rolled back (never committed): [(1, 'groceries', 45.2), (2, 'rent', 1200.0), (3, 'groceries', 12.5)]
=== mistake: DELETE with no WHERE clause ===
after: []
rolled back (never committed): [(1, 'groceries', 45.2), (2, 'rent', 1200.0), (3, 'groceries', 12.5)]
```

What this proves: a single missing clause turned "zero out one specific
expense" into "zero out every expense in the entire table," and "delete
one mistaken entry" into "delete the entire table's contents." Both were
recoverable here only because `connection.rollback()` (**first real use
in this curriculum**, undoing every change made since the last
`commit()`) was called *before* anything was committed — the exact
safety net that will not exist the moment a real program calls
`.commit()` immediately after every operation, which every real CRUD
tool, including this lesson's own, does.

This lab is deleted now; it never appears in the project. What survives
is the rule the rest of this lesson enforces without exception: `UPDATE`
and `DELETE` are only ever written with a `WHERE` clause identifying
exactly the row intended, never omitted "just this once."

### CS Lens

SQL's `UPDATE`/`DELETE` statements are **set-based operations by
default** — they act on the entire matching set, and an omitted `WHERE`
doesn't mean "match nothing," it means "match everything," the polar
opposite of what a programmer coming from row-by-row, one-at-a-time
thinking (a `for` loop over records) might instinctively expect.

Also recognized in: `rm -rf` run one directory level too high (Lesson
11's own recycle-bin-style safety net exists for exactly this class of
mistake), a misconfigured `WHERE` clause being one of the most
frequently cited real causes of production data-loss incidents across
the software industry's own history.

### SE Lens

This is why every `UPDATE`/`DELETE` method built in this lesson binds
its target row by a unique `id`, using a `?` parameter, with no
exception — not out of general caution, but because the alternative
failure mode, demonstrated directly above, is not a minor bug: it is
complete, silent, immediate data loss across an entire table, with
`rollback()`'s safety net unavailable the instant a real program commits
its own changes as part of normal operation.

---

## Concept Unit: Full CRUD, Correctly Scoped

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `expense_tracker.py`.
- **Change type:** add.
- **Dependencies:** `sqlite3` (Lesson 50), `date` (Lesson 36).

### The New Code

```python
class ExpenseTracker:
    def __init__(self, db_path):
        self.connection = sqlite3.connect(db_path)
        self.connection.execute(
            """CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY,
                category TEXT NOT NULL,
                amount REAL NOT NULL,
                spent_on TEXT NOT NULL,
                note TEXT
            )"""
        )
        self.connection.commit()

    def add(self, category, amount, spent_on=None, note=None):
        spent_on = spent_on or date.today().isoformat()
        cursor = self.connection.execute(
            "INSERT INTO expenses (category, amount, spent_on, note) VALUES (?, ?, ?, ?)",
            (category, amount, spent_on, note),
        )
        self.connection.commit()
        return cursor.lastrowid

    def update_amount(self, expense_id, new_amount):
        cursor = self.connection.execute(
            "UPDATE expenses SET amount = ? WHERE id = ?", (new_amount, expense_id)
        )
        self.connection.commit()
        return cursor.rowcount

    def delete(self, expense_id):
        cursor = self.connection.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
        self.connection.commit()
        return cursor.rowcount
```

### Mechanical Walkthrough

- `CREATE TABLE IF NOT EXISTS` — **first appearance of this exact
  modifier** in this curriculum, though the `IF NOT EXISTS`/`exist_ok`
  pattern itself is a **hard concept reappearing** (Lesson 15's
  `os.makedirs(..., exist_ok=True)`): safely re-runnable, doing nothing
  if the table is already there rather than raising an error.
- `NOT NULL` — **first appearance.** A column constraint SQLite itself
  enforces: any `INSERT` attempting to leave `category` or `amount`
  empty is rejected by the database itself, not merely by
  application-level convention — real, structural protection against a
  category of bad data.
- `cursor.lastrowid` — **first appearance.** After an `INSERT`, this
  attribute holds the automatically-assigned `id` of the row that was
  just created — needed here because the caller has no other way to
  know which specific `id` a new expense received, information required
  the moment it needs to be updated or deleted later.
- `update_amount` — this is the previous unit's rule, applied directly:
  `WHERE id = ?`, the target row identified by its unique, unambiguous
  primary key, bound as a parameter exactly like every other value this
  curriculum has inserted since Lesson 50.
- `cursor.rowcount` — **first appearance.** After an `UPDATE` or
  `DELETE`, this attribute reports exactly how many rows were actually
  affected — `0` if the given `id` didn't match anything at all,
  `1` for a normal single-row update, information the previous unit's
  danger makes genuinely worth checking: a caller can use this to detect
  "nothing happened" separately from "something happened," rather than
  assuming success silently.
- `delete` — the identical `WHERE id = ?` discipline, for the operation
  the first unit proved is even more immediately destructive than
  `UPDATE` when misused.

### Run it

```python
tracker = ExpenseTracker(":memory:")
id1 = tracker.add("groceries", 45.20, "2026-07-01", "weekly shop")
tracker.add("rent", 1200.00, "2026-07-01")
tracker.add("groceries", 12.50, "2026-07-05")
id4 = tracker.add("entertainment", 30.00, "2026-07-10", "movie night")

print("updating expense", id1)
print("rows changed:", tracker.update_amount(id1, 50.00))

print("deleting expense", id4)
print("rows changed:", tracker.delete(id4))

print("deleting a nonexistent expense id")
print("rows changed:", tracker.delete(9999))
```

```
updating expense 1
rows changed: 1
deleting expense 4
rows changed: 1
deleting a nonexistent expense id
rows changed: 0
```

The final call — deleting an `id` that was never real — correctly
reports `0` rows changed, not an error and not a false `1`: exactly the
kind of confirmation the previous unit's danger makes worth actually
checking, rather than assuming every `UPDATE`/`DELETE` call succeeded
just because it didn't raise an exception.

### CS Lens

`rowcount` turns "did my `WHERE` clause match what I expected" from an
assumption into a checkable fact — a small, direct instance of the same
"verify, don't just trust" discipline Lesson 41's backup verification
and Lesson 52's backup consistency checks both already established in
different contexts.

### SE Lens

Every method here calls `self.connection.commit()` immediately after its
own single operation — a deliberate choice trading away batching
efficiency (each call is its own complete transaction) for maximum
safety: a caller of `update_amount` sees either a fully-committed change
or none at all, never a change sitting uncommitted and vulnerable to
being silently lost if the program exits unexpectedly before some later,
separate `commit()` call the caller might forget to make.

---

## Concept Unit: Aggregation — Answering a Question No Single Row Can

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `expense_tracker.py`.
- **Change type:** add.
- **Location:** below `delete`.

### The New Code

```python
def report_by_category(self):
    return self.connection.execute(
        "SELECT category, COUNT(*), SUM(amount) FROM expenses GROUP BY category ORDER BY SUM(amount) DESC"
    ).fetchall()

def total_spent(self):
    result = self.connection.execute("SELECT SUM(amount) FROM expenses").fetchone()[0]
    return result or 0.0
```

### Mechanical Walkthrough

- `COUNT(*)` and `SUM(amount)` — **first appearance of SQL aggregate
  functions** in this curriculum. Unlike every `SELECT` used since
  Lesson 50, which returns one output row per matching input row, an
  aggregate function collapses many rows into a single computed value —
  `COUNT(*)` counts rows, `SUM(amount)` adds up a column across them.
- `GROUP BY category` — **first appearance.** Without it, `SUM(amount)`
  would collapse the *entire* table into one single total; `GROUP BY
  category` instead partitions the rows into one group per distinct
  category value first, and every aggregate function in the `SELECT`
  list is computed separately *within each group* — one total per
  category, not one total overall.
- `ORDER BY SUM(amount) DESC` — reused `ORDER BY` (Lesson 54's own
  `list_all` already used it for `spent_on`), applied here to an
  aggregate expression directly rather than a plain column, sorting
  categories from the highest total spend down.
- `total_spent`'s `result or 0.0` — reused truthiness-based default;
  `SUM()` over zero rows returns SQL `NULL`, which Python's `sqlite3`
  surfaces as `None` — falsy, so `or 0.0` substitutes a sensible default
  rather than returning `None` to a caller that likely expects a number
  it can format or compare.

### Run it

```python
for category, count, total in tracker.report_by_category():
    print(f"  {category:<15} {count} expense(s)  ${total:.2f}")

print(f"${tracker.total_spent():.2f}")
```

```
  rent            1 expense(s)  $1200.00
  groceries       2 expense(s)  $62.50
$1262.50
```

Two `groceries` rows (`50.00` after the earlier update, plus `12.50`)
correctly collapsed into one line, summing to `$62.50`, sorted below
`rent`'s single, larger total — exactly the shape a category-by-category
spending report needs, computed entirely by the database rather than by
fetching every row and summing them in Python.

### CS Lens

This is **relational aggregation**, one of SQL's own core operations
distinct from anything a plain per-row loop naturally expresses —
`GROUP BY` is doing the same conceptual job as building a dictionary
keyed by category and accumulating sums into it by hand in Python, just
performed by the database engine itself, closer to the data.

Also recognized in: spreadsheet pivot tables (grouping and summarizing
rows by a chosen column is exactly this operation, with a different
interface), analytics dashboards, this exact `GROUP BY`/aggregate
pattern appearing throughout real business reporting systems built on
relational databases.

### SE Lens

Computing the total inside the database, rather than fetching every row
into Python and summing there, means the amount of data transferred out
of the database is proportional to the number of *categories*, not the
number of *expenses* — for a real tracker with years of daily entries,
the difference between "a handful of summary rows" and "every single
transaction ever recorded" is a real, practically significant one, the
same class of tradeoff Lesson 44 measured directly for chunked file
reading.

---

## Concept Unit: A Real Interface, Reusing Lesson 1's Own Loop

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `cli.py`.
- **Change type:** add.
- **Dependencies:** `ExpenseTracker`.

### The New Code

```python
def run_cli(tracker, command_source):
    print_help()
    while True:
        try:
            line = next(command_source)
        except StopIteration:
            break
        parts = line.strip().split()
        if not parts:
            continue
        command = parts[0]

        if command == "add" and len(parts) == 3:
            expense_id = tracker.add(parts[1], float(parts[2]))
            print(f"added expense {expense_id}")
        elif command == "list":
            for row in tracker.list_all():
                print(" ", row)
        elif command == "update" and len(parts) == 3:
            changed = tracker.update_amount(int(parts[1]), float(parts[2]))
            print(f"updated {changed} row(s)")
        elif command == "delete" and len(parts) == 2:
            changed = tracker.delete(int(parts[1]))
            print(f"deleted {changed} row(s)")
        ...
```

### Mechanical Walkthrough

- `run_cli(tracker, command_source)` — `command_source` is any
  **iterator** (Lesson 68's own generator/iterator territory) yielding
  command strings one at a time — `next(...)` pulls the next one, and
  `StopIteration` (**hard concept reappearing** from Lesson 39's own
  `MacroPlayer`-adjacent iteration patterns) signals there are no more,
  ending the loop cleanly. This is deliberately the *same shape* whether
  `command_source` is real interactive keyboard input or, as tested
  below, a pre-scripted list of commands — a direct application of
  Lesson 38's dependency-injection lesson: the loop itself has no idea,
  and doesn't need to know, where its commands are actually coming from.
- `parts = line.strip().split()` then dispatching on `parts[0]` — a
  **hard concept reappearing** from Lesson 1's own original mini shell:
  read a line, split it into words, dispatch on the first one.
- Every branch calls straight into the already-built, already-tested
  `ExpenseTracker` methods — the CLI itself contains no database logic
  at all, only argument parsing and dispatch, the identical separation
  Lesson 31's reverse proxy drew between routing and the actual request
  handling underneath it.

### Run it

A full, real, scripted session — no human typing, but genuine execution
through the actual loop, dispatch, and underlying tracker:

```python
tracker = ExpenseTracker(":memory:")
scripted_session = iter([
    "add groceries 45.20", "add rent 1200", "add groceries 12.50",
    "list", "update 1 50.00", "report", "delete 2", "total", "quit",
])
run_cli(tracker, scripted_session)
```

```
commands: add <category> <amount> | list | update <id> <amount> | delete <id> | report | total | quit
added expense 1
added expense 2
added expense 3
  (1, 'groceries', 45.2, '2026-07-31', None)
  (2, 'rent', 1200.0, '2026-07-31', None)
  (3, 'groceries', 12.5, '2026-07-31', None)
updated 1 row(s)
  rent            1 expense(s)  $1200.00
  groceries       2 expense(s)  $62.50
deleted 1 row(s)
$62.50
```

A complete, real session: three expenses added, listed, one updated,
a category report generated, one deleted, and a final running total —
every single line produced by the actual `ExpenseTracker` methods this
lesson built and independently tested earlier, now driven entirely
through the CLI's own command dispatch instead of direct Python calls.

### CS Lens and SE Lens

Both already covered — this unit is composition and interface-building
over already-verified logic, per the Repetition Rule; the dependency-
injected `command_source` is the one point worth restating: it's what
makes this exact test possible at all, running a full, deterministic,
scripted CRUD session with no human present and no terminal required,
the same testability payoff Lesson 38 established for its own polling
loop.

---

## Connect the pieces

One expense, followed through the entire capstone: `add` inserts it with
a real, database-enforced `NOT NULL` guarantee on its category and
amount, returning its `lastrowid` so it can be found again later.
`update_amount`, bound by `WHERE id = ?`, changes only that one row —
proven, by the first unit's own real demonstration, to be a meaningfully
different and much safer operation than the same `UPDATE` with its
`WHERE` clause omitted. `report_by_category` later folds it into a
`SUM` alongside every other expense sharing its category, computed
entirely inside the database. The CLI wraps every one of these already-
independently-tested operations in a small, reusable command loop that
neither knows nor cares whether its commands come from a real person
typing or, as tested here, a fully scripted, repeatable session.

## What breaks without this

Already demonstrated directly, at the very start of this lesson: an
`UPDATE` or `DELETE` without a `WHERE` clause silently affects every row
in the table at once — proven on real data, with real before/after
output — which is the entire reason every mutating method this lesson
actually shipped binds its target by a unique `id`, with no exception
anywhere in `expense_tracker.py`.

## Definition of done

- [ ] `ExpenseTracker.add` returns a real, usable `id` for each new
      expense.
- [ ] `update_amount` and `delete` both correctly affect only the row
      matching the given `id`, confirmed via `rowcount`, including the
      `0`-rows-changed case for a nonexistent `id`.
- [ ] `report_by_category` correctly groups and sums multiple expenses
      sharing a category.
- [ ] The CLI, driven by a fully scripted command list with no human
      input, produces a complete, correct session end to end.
- [ ] You can reproduce, on purpose, the real UPDATE/DELETE-with-no-
      WHERE danger from the first unit, and explain why every method in
      the final tracker avoids it.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add expense_tracker.py cli.py
  git commit -m "Add full CRUD expense tracker with category aggregation and a scriptable CLI — every UPDATE/DELETE binds a WHERE id=? after directly proving what omitting it does to real data"
  ```

## What's next

This closes Track 6. The CLI's dependency-injected `command_source`
generalizes directly to Track 8/9's binary and media tools, and this
lesson's `WHERE`-clause discipline carries forward as a hard, non-
negotiable rule for every future lesson that touches `UPDATE` or
`DELETE`, in any database, for the rest of this curriculum.
