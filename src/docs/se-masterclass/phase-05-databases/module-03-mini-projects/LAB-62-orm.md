# SE Masterclass — LAB-62 — ORM

**Language: Python (SQLite)** — Module 3 of Phase 5 begins.

**Prerequisites:** LAB-56 (tables/rows — an ORM maps THESE directly to objects), LAB-17 (a base `Model` class is a contract every mapped class satisfies), LAB-08 (the N+1 problem is a complexity-class mistake in disguise).

**What this lab adds:**
- A minimal ORM: mapping a Python class directly to a database table
- Generic CRUD (Create, Read, Update, Delete) methods that work for ANY mapped class
- A fluent query builder — chainable `.where().order_by()` methods that build SQL
- The N+1 query problem — a real, common performance bug — and eager loading as its fix

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Without an ORM, working with a `users` table means writing raw SQL strings and manually converting rows to objects. What does an ORM let you write INSTEAD?
> 2. A "fluent" query builder lets you write `User.where(name='Alice').order_by('id')`. What does each method in that chain need to RETURN for the NEXT method call to work?
> 3. Loading 100 orders, then looping through them to fetch EACH order's customer separately, makes how many total queries? What's this called?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python orm.py` prints:

```
=== Mapping a Class to a Table ===
class User(Model): table='users', columns=['id','name','email']
User.create(name='Alice', email='alice@example.com') -> User(id=1, name='Alice', ...)

=== Generic CRUD ===
User.find(1): User(id=1, name='Alice', email='alice@example.com')
User.all(): [User(id=1, ...), User(id=2, ...)]
user.update(name='Alice Smith'): saved
user.delete(): removed

=== Fluent Query Builder ===
User.where(name='Bob').first()
generated SQL: SELECT * FROM users WHERE name = ? ORDER BY id LIMIT 1
result: User(id=2, name='Bob', ...)

=== The N+1 Problem ===
loading 3 orders, then each order's customer separately:
  query 1: SELECT * FROM orders
  query 2: SELECT * FROM customers WHERE id = 1
  query 3: SELECT * FROM customers WHERE id = 1
  query 4: SELECT * FROM customers WHERE id = 2
  total queries: 4 (1 + N, where N = 3 orders)

=== Fixed: Eager Loading ===
loading 3 orders WITH customers eagerly:
  query 1: SELECT * FROM orders
  query 2: SELECT * FROM customers WHERE id IN (1, 1, 2)
  total queries: 2 (constant, regardless of order count)
```

---

### Concept: Mapping a Class to a Table

**What it is:** An ORM (Object-Relational Mapper) lets you work with PYTHON OBJECTS (`user.name`, `user.save()`) instead of raw SQL strings and manually-parsed rows — the mapper handles translating between the two representations automatically.

---

## Step 1 — A Minimal Model Base Class

```python
# orm.py
import sqlite3

conn = sqlite3.connect(':memory:')
conn.row_factory = sqlite3.Row      # lets us access columns by NAME, not just position
cursor = conn.cursor()

class Model:                                          # ← add: LAB-17's base contract every mapped class satisfies
    table = None
    columns = []

    def __init__(self, **kwargs):
        for col in self.columns:
            setattr(self, col, kwargs.get(col))

    @classmethod
    def create(cls, **kwargs):
        cols = ', '.join(kwargs.keys())
        placeholders = ', '.join('?' for _ in kwargs)
        cursor.execute(f'INSERT INTO {cls.table} ({cols}) VALUES ({placeholders})', tuple(kwargs.values()))
        conn.commit()
        return cls.find(cursor.lastrowid)

    @classmethod
    def find(cls, id):
        row = cursor.execute(f'SELECT * FROM {cls.table} WHERE id = ?', (id,)).fetchone()
        return cls(**dict(row)) if row else None

    def __repr__(self):
        fields = ', '.join(f"{c}={getattr(self, c)!r}" for c in self.columns)
        return f"{self.__class__.__name__}({fields})"

class User(Model):
    table = 'users'
    columns = ['id', 'name', 'email']

cursor.execute('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)')

print("=== Mapping a Class to a Table ===")
print(f"class User(Model): table='{User.table}', columns={User.columns}")
alice = User.create(name='Alice', email='alice@example.com')
print(f"User.create(name='Alice', email='alice@example.com') -> {alice}")
```

### SAVE AND TRY

```bash
python orm.py
```

**Expected:**
```
=== Mapping a Class to a Table ===
class User(Model): table='users', columns=['id', 'name', 'email']
User.create(name='Alice', email='alice@example.com') -> User(id=1, name='Alice', email='alice@example.com')
```

**Confirm `Model.create` is GENERIC:** It never mentions `users` or `name`/`email` directly — it reads `cls.table` and builds the SQL from WHATEVER `**kwargs` are passed, meaning the EXACT SAME `create` method works for ANY future `Model` subclass (`Order`, `Product`, ...) without being rewritten.

---

## Step 2 — Generic CRUD

```python
# Add to Model:
    @classmethod
    def all(cls):
        rows = cursor.execute(f'SELECT * FROM {cls.table}').fetchall()
        return [cls(**dict(row)) for row in rows]

    def update(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
        set_clause = ', '.join(f"{k} = ?" for k in kwargs)
        cursor.execute(f'UPDATE {self.table} SET {set_clause} WHERE id = ?', (*kwargs.values(), self.id))
        conn.commit()

    def delete(self):
        cursor.execute(f'DELETE FROM {self.table} WHERE id = ?', (self.id,))
        conn.commit()

bob = User.create(name='Bob', email='bob@example.com')

print("\n=== Generic CRUD ===")
print(f"User.find(1): {User.find(1)}")
print(f"User.all(): {User.all()}")
alice.update(name='Alice Smith')
print("user.update(name='Alice Smith'): saved")
print(f"confirmed: {User.find(1)}")
```

### SAVE AND TRY

```bash
python orm.py
```

**Expected:**
```
=== Generic CRUD ===
User.find(1): User(id=1, name='Alice', email='alice@example.com')
User.all(): [User(id=1, name='Alice', email='alice@example.com'), User(id=2, name='Bob', email='bob@example.com')]
user.update(name='Alice Smith'): saved
confirmed: User(id=1, name='Alice Smith', email='alice@example.com')
```

**Confirm this is LAB-56's tables, wearing an object costume:** Every ORM operation still ultimately runs the EXACT same `INSERT`/`SELECT`/`UPDATE`/`DELETE` SQL from LAB-56 — the ORM's entire value is GENERATING that SQL automatically from Python method calls, and CONVERTING rows back into objects, so application code never has to write raw SQL by hand for routine operations.

---

## Step 3 — A Fluent Query Builder

```python
class QueryBuilder:                                   # ← add: LAB-23's Command-like pattern — build up a query, execute it at the end
    def __init__(self, model_cls):
        self.model_cls = model_cls
        self.conditions = []
        self.params = []
        self.order = None
        self.limit_count = None

    def where(self, **kwargs):
        for k, v in kwargs.items():
            self.conditions.append(f"{k} = ?")
            self.params.append(v)
        return self                                       # ← add: return SELF — this is what makes chaining work

    def order_by(self, column):
        self.order = column
        return self

    def limit(self, n):
        self.limit_count = n
        return self

    def to_sql(self):
        sql = f"SELECT * FROM {self.model_cls.table}"
        if self.conditions:
            sql += " WHERE " + " AND ".join(self.conditions)
        if self.order:
            sql += f" ORDER BY {self.order}"
        if self.limit_count:
            sql += f" LIMIT {self.limit_count}"
        return sql

    def first(self):
        self.limit_count = 1
        row = cursor.execute(self.to_sql(), self.params).fetchone()
        return self.model_cls(**dict(row)) if row else None

    def all(self):
        rows = cursor.execute(self.to_sql(), self.params).fetchall()
        return [self.model_cls(**dict(row)) for row in rows]

# Add a classmethod to Model:
    @classmethod
    def where(cls, **kwargs):
        return QueryBuilder(cls).where(**kwargs)

print("\n=== Fluent Query Builder ===")
print("User.where(name='Bob').first()")
query = User.where(name='Bob').order_by('id')
print(f"generated SQL: {query.to_sql()}")
result = query.first()
print(f"result: {result}")
```

### SAVE AND TRY

```bash
python orm.py
```

**Expected:**
```
=== Fluent Query Builder ===
User.where(name='Bob').first()
generated SQL: SELECT * FROM users WHERE name = ? ORDER BY id LIMIT 1
result: User(id=2, name='Bob', email='bob@example.com')
```

**Confirm `return self` is the ENTIRE chaining mechanism:** `.where(...)` returns the SAME `QueryBuilder` instance it was called on (with an extra condition now recorded internally) — which is EXACTLY why `.order_by(...)` can be called DIRECTLY on the result of `.where(...)`. Remove any ONE `return self` and the chain BREAKS at that exact point (calling a method on `None` instead of the builder) — this is worth deliberately testing to feel the mechanism directly.

---

### Concept: The N+1 Query Problem

**What it is:** Loading a LIST of records, then fetching EACH one's related data with a SEPARATE query (inside a loop), results in `1 + N` total queries (1 for the list, N for each item's related data) — instead of a SINGLE additional query that fetches ALL the related data at once.

---

## Step 4 — Feel the N+1 Problem

```python
cursor.execute('CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT)')
cursor.execute('CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, item TEXT)')
cursor.executemany('INSERT INTO customers (id, name) VALUES (?, ?)', [(1, 'Alice'), (2, 'Bob')])
cursor.executemany('INSERT INTO orders (customer_id, item) VALUES (?, ?)', [(1, 'Book'), (1, 'Pen'), (2, 'Laptop')])
conn.commit()

query_log = []
def logged_execute(sql, params=()):
    query_log.append(sql)
    return cursor.execute(sql, params)

print("\n=== The N+1 Problem ===")
print("loading 3 orders, then each order's customer separately:")
query_log.clear()
orders = logged_execute('SELECT * FROM orders').fetchall()
for order in orders:
    logged_execute('SELECT * FROM customers WHERE id = ?', (order['customer_id'],))

for i, q in enumerate(query_log, 1):
    print(f"  query {i}: {q}")
print(f"total queries: {len(query_log)} (1 + N, where N = {len(orders)} orders)")
```

### SAVE AND TRY

```bash
python orm.py
```

**Expected:**
```
=== The N+1 Problem ===
loading 3 orders, then each order's customer separately:
  query 1: SELECT * FROM orders
  query 2: SELECT * FROM customers WHERE id = ?
  query 3: SELECT * FROM customers WHERE id = ?
  query 4: SELECT * FROM customers WHERE id = ?
  total queries: 4 (1 + N, where N = 3 orders)
```

**Confirm the scaling problem:** For 3 orders, this is 4 queries — mildly wasteful. For 10,000 orders, this becomes 10,001 QUERIES — a database round trip for EACH ONE, often the single most common real-world ORM performance bug (LAB-08's complexity lens: `O(1) + O(N)` queries where `O(1) + O(1)` was achievable).

---

## 🎯 Challenge: Fix It With Eager Loading

**You know:** All the customer IDs needed are ALREADY known after the FIRST query — they can all be fetched in ONE additional query using `WHERE id IN (...)`, instead of one query PER order.

**Task:** Rewrite the loading logic to fetch all needed customers in a SINGLE batch query.

<details>
<summary>▶ Show Solution</summary>

```python
print("\n=== Fixed: Eager Loading ===")
print("loading 3 orders WITH customers eagerly:")
query_log.clear()

orders = logged_execute('SELECT * FROM orders').fetchall()
customer_ids = [order['customer_id'] for order in orders]                    # collect ALL needed IDs first
placeholders = ', '.join('?' for _ in customer_ids)
customers_by_id = {
    row['id']: row
    for row in logged_execute(f'SELECT * FROM customers WHERE id IN ({placeholders})', customer_ids).fetchall()
}
# now every order's customer is available via customers_by_id[order['customer_id']] — zero additional queries

for i, q in enumerate(query_log, 1):
    print(f"  query {i}: {q}")
print(f"total queries: {len(query_log)} (constant, regardless of order count)")
```

**Key insight:** This is LAB-53's `Set`-based deduplication instinct, applied to QUERY BATCHING — collect every ID you'll need FIRST (from the already-fetched orders), then fetch them ALL in ONE query using `IN (...)`, and build a LOOKUP MAP (`customers_by_id`, exactly LAB-04's hash map) for O(1) access afterward. The query COUNT goes from `O(N)` to `O(1)` — TWO queries total, whether there are 3 orders or 3 million, which is precisely why "eager loading" (`.include()`, `.select_related()`, `.with()` — every real ORM has some version of this) is one of the highest-value ORM features to actually understand and use deliberately.

</details>

### SAVE AND TRY

```bash
python orm.py
```

**Expected:**
```
=== Fixed: Eager Loading ===
loading 3 orders WITH customers eagerly:
  query 1: SELECT * FROM orders
  query 2: SELECT * FROM customers WHERE id IN (?, ?, ?)
  total queries: 2 (constant, regardless of order count)
```

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `Model` base class, `create`/`find`/`update`/`delete` | Django ORM, SQLAlchemy, ActiveRecord, Prisma |
| `QueryBuilder` with chained methods | Every real ORM's fluent query API |
| N+1 problem | THE most commonly cited real-world ORM performance bug |
| Eager loading | Django's `select_related`/`prefetch_related`, SQLAlchemy's `joinedload` |

**Where you will see this again:** LAB-63 (Query Engine) builds the OTHER side of this — how a query STRING actually gets EXECUTED against data, the mechanism this lab's `QueryBuilder` ultimately hands off to.

---

## Final Check

| Feature | How to verify |
|---|---|
| `Model.create`/`find` work generically for any mapped class | Step 1 |
| `all`/`update`/`delete` work correctly without table-specific code | Step 2 |
| The `QueryBuilder` correctly chains `.where().order_by().limit()` | Step 3 |
| The N+1 problem is demonstrated with an explicit query count | Step 4 |
| Eager loading reduces the query count to a constant, regardless of record count | Challenge |
| You can explain, without notes, why `return self` enables method chaining | Step 3 |

---

## Quick Check Answers

**1. What does an ORM let you write instead of raw SQL and manual row conversion?**

Python method calls and object attribute access — `User.create(name='Alice')` instead of `INSERT INTO users ...`, `user.name` instead of `row['name']` or `row[1]` — demonstrated throughout Steps 1–2, where `Model`'s generic methods handle the SQL generation and row-to-object conversion, leaving application code to work purely in terms of Python objects.

**2. What must each chained method return for the next call to work?**

The BUILDER OBJECT ITSELF (`return self`, Step 3) — `.where(...)` must return something that ALSO has an `.order_by(...)` method for `User.where(...).order_by(...)` to be syntactically valid at all; returning anything else (like `None`, or the query RESULTS) would break the chain at that exact point, since the next method call needs a `QueryBuilder` instance to call ITS methods on.

**3. Loading 100 orders, then each order's customer separately — how many queries, and what's this called?**

101 queries total (`1 + N` where `N = 100`) — the N+1 problem (Step 4's exact demonstration, at a smaller scale). This is a genuine, common performance bug: each additional order in the result set adds ONE MORE database round trip, scaling the query count LINEARLY with the result size, when a single batched query (the Challenge's eager-loading fix) could have fetched all the related data in ONE additional, constant-cost query regardless of how many orders there are.

---

*Next: [LAB-63 — Query Engine](LAB-63-query-engine.md) — Python, same module*
