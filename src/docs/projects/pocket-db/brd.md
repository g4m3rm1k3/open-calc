# Embedded C++ Database + Python Data Science Platform

## 1. Product Summary

### Working name

**MiniDB**

### Vision

Build a high-performance, embeddable database written from scratch in modern C++, exposed through a polished Python API and designed specifically for application developers, data scientists, analysts, and AI/ML workloads.

MiniDB should combine:

* SQLite-like embeddability
* Native C++ performance
* Python-first data science workflows
* Strong typing
* Zero/low-copy data interchange
* OLTP and analytical workloads
* Transactions and crash recovery
* Vectorized query execution
* Columnar analytical capabilities
* Modern indexing
* DataFrame interoperability
* Built-in profiling and visualization helpers
* Excellent developer experience

### Product thesis

Do **not** attempt to beat SQLite at every workload.

Instead, MiniDB should be substantially better for workloads involving:

* Python data analysis
* embedded analytics
* local data pipelines
* ML feature preparation
* large DataFrames
* mixed transactional + analytical workloads
* modern multicore CPUs
* local AI/embedding workloads
* applications wanting a database without a server

---

# 2. Goals

## Primary goals

1. Build the database engine entirely in C++.
2. Avoid depending on SQLite, DuckDB, LMDB, RocksDB, or another database engine.
3. Provide a stable C++ API.
4. Provide a first-class Python API.
5. Support SQL.
6. Support a Pythonic query API.
7. Support transactions and crash recovery.
8. Support concurrent readers and writers.
9. Provide row-oriented and column-oriented execution/storage where appropriate.
10. Provide efficient DataFrame interoperability.
11. Support NumPy, pandas, and Apache Arrow workflows.
12. Provide data-science-oriented functionality.
13. Provide excellent introspection and profiling.
14. Make the database easy to embed into desktop applications, notebooks, services, scripts, and ML pipelines.

## Secondary goals

* Vector/embedding support
* JSON support
* Full-text search
* Spatial data
* Time-series functionality
* Automatic index recommendations
* Parallel query execution
* Streaming ingestion
* Incremental computation
* Extension/plugin system

---

# 3. Non-Goals

MiniDB should initially avoid trying to become:

* A distributed database
* A cloud database
* A PostgreSQL replacement
* A MySQL replacement
* A multi-region database
* A massive-scale OLTP system
* A database requiring a server process
* A general-purpose filesystem
* A full statistical computing environment

Distributed operation can be considered after the embedded engine is mature.

---

# 4. Target Users

## Persona A — Python data scientist

Needs:

```python
db = minidb.connect("experiment.db")

df = db.query("""
    SELECT *
    FROM experiments
    WHERE accuracy > 0.9
""").to_pandas()
```

Primary concerns:

* pandas
* NumPy
* notebooks
* visualization
* fast filtering
* DataFrame ingestion
* Parquet/CSV interoperability
* easy APIs

---

## Persona B — Python developer

Wants:

```python
db = minidb.connect("app.db")

users = db.table("users")

users.insert({
    "name": "Alice",
    "age": 31
})
```

Primary concerns:

* simplicity
* transactions
* schema management
* migrations
* type safety
* good errors

---

## Persona C — C++ developer

Wants:

```cpp
auto db = minidb::Database::open("app.db");

auto users = db.table<User>("users");

auto results = users
    .where(&User::age > 18)
    .order_by(&User::name)
    .limit(100)
    .execute();
```

Primary concerns:

* performance
* memory control
* zero-copy access
* deterministic behavior
* no Python dependency

---

## Persona D — ML/AI developer

Wants:

```python
embeddings = db.table("documents").vector_search(
    "embedding",
    query_vector,
    k=20
)
```

Primary concerns:

* vectors
* Arrow
* NumPy
* batch processing
* feature extraction
* local datasets

---

# 5. Product Principles

## Principle 1 — Embedded first

No server required.

```text
Python/C++ process
       │
       ▼
    MiniDB
       │
       ▼
    database file
```

## Principle 2 — Fast path should be obvious

Common operations should require very little code.

## Principle 3 — SQL and Python are peers

Users should be able to choose:

```text
SQL
Python fluent API
C++ API
```

without losing major capabilities.

## Principle 4 — Data should move as little as possible

Prefer:

```text
MiniDB → Arrow → pandas
```

over:

```text
MiniDB → Python objects → pandas
```

## Principle 5 — Everything important is observable

Users should be able to inspect:

* query plans
* execution time
* memory usage
* I/O
* indexes
* cache hit rate
* transaction state
* table statistics

---

# 6. High-Level Architecture

```text
┌───────────────────────────────────────────────┐
│                  Python API                   │
├───────────────────────────────────────────────┤
│       pandas / NumPy / Arrow / Polars         │
├───────────────────────────────────────────────┤
│             Python C++ bindings               │
├───────────────────────────────────────────────┤
│                    C++ API                    │
├───────────────────────────────────────────────┤
│                 SQL Parser                    │
├───────────────────────────────────────────────┤
│              Query Planner                    │
├───────────────────────────────────────────────┤
│             Query Optimizer                   │
├───────────────────────────────────────────────┤
│          Vectorized Executor                  │
├───────────────────────────────────────────────┤
│      Transaction / MVCC / Lock Manager        │
├───────────────────────────────────────────────┤
│              Catalog Manager                  │
├───────────────────────────────────────────────┤
│         Buffer / Cache Manager                │
├───────────────────────────────────────────────┤
│        Row Store / Column Store               │
├───────────────────────────────────────────────┤
│          B+Tree / Hash / Vector Index         │
├───────────────────────────────────────────────┤
│             WAL / Recovery                    │
├───────────────────────────────────────────────┤
│               Page Manager                    │
├───────────────────────────────────────────────┤
│                 File I/O                      │
└───────────────────────────────────────────────┘
```

---

# 7. Proposed Repository

```text
minidb/
│
├── CMakeLists.txt
├── pyproject.toml
├── README.md
├── LICENSE
│
├── include/
│   └── minidb/
│       ├── database.hpp
│       ├── connection.hpp
│       ├── transaction.hpp
│       ├── table.hpp
│       ├── query.hpp
│       ├── value.hpp
│       ├── schema.hpp
│       └── errors.hpp
│
├── src/
│   ├── storage/
│   ├── buffer/
│   ├── catalog/
│   ├── record/
│   ├── index/
│   ├── transaction/
│   ├── recovery/
│   ├── sql/
│   ├── execution/
│   ├── optimizer/
│   ├── statistics/
│   ├── vector/
│   ├── json/
│   └── database/
│
├── python/
│   └── minidb/
│       ├── __init__.py
│       ├── connection.py
│       ├── table.py
│       ├── query.py
│       ├── dataframe.py
│       ├── analytics.py
│       ├── display.py
│       └── exceptions.py
│
├── bindings/
│   └── python/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── sql/
│   ├── crash/
│   ├── concurrency/
│   ├── python/
│   └── benchmarks/
│
├── benchmarks/
│
├── examples/
│   ├── cpp/
│   └── python/
│
└── docs/
```

---

# 8. Agile Delivery Model

Each slice must satisfy four conditions:

1. It produces working software.
2. It has automated tests.
3. It has a demonstrable user-facing outcome.
4. It leaves the database in a usable state.

Avoid purely technical epics such as:

> "Implement storage layer."

Instead:

> "A user can create a database, insert 10,000 records, close it, reopen it, and query those records."

---

# 9. Agile Slice 0 — Project Foundation

## Objective

Create a buildable, testable cross-platform C++ project.

### Deliverables

* CMake
* C++20/23 baseline
* unit testing
* integration testing
* sanitizers
* formatting
* static analysis
* CI
* benchmark framework
* Python packaging
* documentation framework

### Acceptance criteria

```text
cmake configure
cmake build
ctest
python -m pytest
```

all work on supported platforms.

---

# 10. Slice 1 — Database File

## User story

> As a developer, I want to create and reopen a database file.

### Features

* database header
* magic number
* version
* page size
* database UUID
* checksum
* file creation
* open
* close

### Acceptance test

```python
db = minidb.connect("test.db")
db.close()

db = minidb.connect("test.db")
assert db.is_open()
```

---

# 11. Slice 2 — Pages

Implement:

* page IDs
* fixed-size pages
* page headers
* allocation
* free pages
* read/write
* checksums

Default:

```text
4 KiB pages
```

but architecture should permit:

```text
4K
8K
16K
32K
```

---

# 12. Slice 3 — Records

Implement:

* tuple encoding
* NULL
* integers
* floating point
* booleans
* strings
* blobs
* record IDs
* slotted pages

Example:

```python
db.create_table(
    "users",
    {
        "id": "int64",
        "name": "string",
        "age": "int32"
    }
)
```

---

# 13. Slice 4 — Persistent Tables

User-visible milestone:

```python
db.create_table("users", schema)

db.table("users").insert({
    "id": 1,
    "name": "Alice",
    "age": 30
})
```

Then:

```python
db.close()

db = minidb.connect("app.db")

assert db.table("users").count() == 1
```

This is the first **real database milestone**.

---

# 14. Slice 5 — Sequential Query Engine

Implement:

* table scan
* filter
* projection
* expressions
* comparison operators
* boolean expressions

SQL:

```sql
SELECT name
FROM users
WHERE age >= 18;
```

Python:

```python
db.table("users") \
  .filter(lambda x: x.age >= 18) \
  .select("name")
```

---

# 15. Slice 6 — SQL Parser

Implement:

```sql
CREATE TABLE
INSERT
SELECT
UPDATE
DELETE
DROP TABLE
```

Parser architecture:

```text
SQL
 ↓
Lexer
 ↓
Parser
 ↓
AST
 ↓
Binder
 ↓
Logical Plan
```

---

# 16. Slice 7 — B+Tree

Implement:

* search
* insertion
* deletion
* node splitting
* node merging
* range scans
* persistence
* recovery

Expose:

```sql
CREATE INDEX users_age ON users(age);
```

---

# 17. Slice 8 — Query Planner

Introduce:

```text
SQL
 ↓
Logical Plan
 ↓
Optimizer
 ↓
Physical Plan
 ↓
Executor
```

Initial rules:

* predicate pushdown
* projection pruning
* index selection
* constant folding

---

# 18. Slice 9 — Buffer Pool

Implement:

* page cache
* pin/unpin
* dirty pages
* eviction
* LRU/Clock
* flushing

Expose diagnostics:

```python
db.stats()
```

Example:

```text
pages_read:       18,421
pages_written:     4,021
cache_hits:       92.4%
cache_misses:      7.6%
```

---

# 19. Slice 10 — Transactions

Implement:

```sql
BEGIN;
COMMIT;
ROLLBACK;
```

C++:

```cpp
auto tx = db.begin();

tx.insert(...);
tx.update(...);

tx.commit();
```

Python:

```python
with db.transaction():
    ...
```

---

# 20. Slice 11 — MVCC

Implement:

* transaction IDs
* visibility
* snapshots
* version chains
* garbage collection
* snapshot isolation

Target behavior:

```text
Reader A ──────────────► sees consistent snapshot

Writer B ──────────────► updates database

Reader A ──────────────► still sees original snapshot
```

---

# 21. Slice 12 — WAL

Implement:

* WAL file
* log records
* LSNs
* commit records
* flush policy
* checkpoints
* recovery

Required property:

> A committed transaction must survive process termination according to the selected durability mode.

---

# 22. Slice 13 — Crash Testing

Build a dedicated crash harness.

```text
execute random workload
        ↓
kill process
        ↓
reopen database
        ↓
run consistency checks
        ↓
repeat
```

Test:

* interrupted insert
* interrupted update
* interrupted delete
* interrupted index split
* interrupted checkpoint
* partial WAL
* corrupted page

---

# 23. Slice 14 — Python Bindings

Expose the C++ engine through a thin native binding layer.

The binding should avoid converting every database value into a Python object unnecessarily.

Preferred path:

```text
C++
 ↓
Arrow-compatible representation
 ↓
Python
```

rather than:

```text
C++
 ↓
millions of Python objects
```

---

# 24. Slice 15 — Friendly Python API

Primary API:

```python
import minidb

db = minidb.connect("data.db")

users = db.table("users")

users.insert({
    "id": 1,
    "name": "Alice",
    "age": 31
})
```

Query API:

```python
result = (
    users
    .filter("age >= 18")
    .select("name", "age")
    .order_by("age")
    .limit(100)
    .execute()
)
```

---

# 25. Slice 16 — DataFrame API

Implement:

```python
df = db.query("""
    SELECT *
    FROM users
""").to_pandas()
```

And:

```python
db.from_pandas(df, "users")
```

Support:

* pandas
* NumPy
* Apache Arrow
* optionally Polars

Primary goal:

> Minimize copies.

---

# 26. Slice 17 — Arrow Interchange

Arrow becomes the internal bridge between the engine and Python analytics ecosystem.

```text
             ┌─────────┐
             │ MiniDB  │
             └────┬────┘
                  │
                Arrow
        ┌─────────┼─────────┐
        ↓         ↓         ↓
      pandas    NumPy     Polars
```

Support:

* Arrow arrays
* Arrow tables
* zero/low-copy conversion where possible
* chunked arrays
* nullable types

---

# 27. Slice 18 — Vectorized Execution

Replace:

```text
row → expression → row → expression
```

with:

```text
batch
  ↓
vectorized expression
  ↓
batch
```

Implement:

* selection vectors
* vectorized comparisons
* vectorized arithmetic
* vectorized aggregation
* SIMD optimization

---

# 28. Slice 19 — Columnar Execution

Introduce column batches:

```cpp
ColumnVector<int64_t>
ColumnVector<double>
ColumnVector<string_view>
```

Operations:

```text
scan
filter
project
aggregate
sort
join
```

operate on batches.

---

# 29. Slice 20 — Parallel Query Execution

Introduce:

* worker pool
* parallel table scans
* parallel aggregations
* parallel sorting
* parallel joins

Example target:

```text
1 thread   → baseline
2 threads  → ~1.7x
4 threads  → ~3x
8 threads  → ~5x+
```

Actual targets should be benchmark-dependent.

---

# 30. Slice 21 — Aggregations

Implement:

```sql
COUNT
SUM
AVG
MIN
MAX
GROUP BY
HAVING
```

Example:

```sql
SELECT
    category,
    COUNT(*),
    AVG(price)
FROM products
GROUP BY category;
```

---

# 31. Slice 22 — Joins

Implement in stages:

1. Nested-loop join
2. Index nested-loop
3. Hash join
4. Merge join

Optimizer chooses the physical strategy.

---

# 32. Slice 23 — Statistics

Collect:

* row counts
* distinct counts
* min/max
* null fraction
* histograms
* approximate cardinality

Use statistics for query planning.

---

# 33. Slice 24 — Cost-Based Optimizer

Move from rule-based optimization to cost-based planning.

Estimate:

```text
rows
CPU
memory
I/O
selectivity
join cardinality
```

Generate competing plans and choose the cheapest estimated plan.

---

# 34. Slice 25 — JSON

Add:

```text
JSON
JSON path expressions
JSON extraction
JSON indexing
```

Example:

```sql
SELECT data.user.name
FROM events
WHERE data.type = 'login';
```

---

# 35. Slice 26 — Time-Series

Add optimized support for:

```text
timestamp
symbol
value
```

Features:

* time-range scans
* partitioning
* time-window aggregation
* resampling
* rolling statistics

Python:

```python
prices.resample("1h").mean()
```

---

# 36. Slice 27 — Vector/AI Data

Add:

```text
VECTOR
```

type and vector operations.

Example:

```python
results = (
    db.table("documents")
      .vector_search(
          column="embedding",
          vector=query,
          k=10
      )
)
```

Indexes can later include:

* HNSW
* IVF
* flat scan

---

# 37. Slice 28 — Full-Text Search

Support:

```sql
SEARCH documents
FOR 'machine learning'
```

Implement:

* tokenization
* inverted index
* ranking
* phrase search
* prefix search

---

# 38. Slice 29 — Schema Management

Implement:

```sql
ALTER TABLE
ADD COLUMN
DROP COLUMN
RENAME COLUMN
```

Add migration support:

```python
db.migrate()
```

Migration metadata should be persisted inside the catalog.

---

# 39. Slice 30 — Constraints

Implement:

```text
PRIMARY KEY
UNIQUE
NOT NULL
CHECK
FOREIGN KEY
```

Python:

```python
db.create_table(
    "users",
    schema,
    primary_key="id"
)
```

---

# 40. Slice 31 — Python Analytics API

Provide convenient operations:

```python
table.describe()
table.profile()
table.histogram("age")
table.value_counts("country")
table.correlation("age", "income")
```

The important distinction:

**These should compile into database operations rather than extracting the entire table into Python.**

---

# 41. Slice 32 — Data Profiling

Provide:

```python
db.profile("users")
```

Output should include:

```text
rows
columns
null %
distinct %
min
max
mean
median
quantiles
distribution
```

Prefer approximate algorithms when datasets are large.

---

# 42. Slice 33 — Notebook Experience

Optimize for Jupyter.

Example:

```python
db.query("""
    SELECT category, AVG(price)
    FROM products
    GROUP BY category
""")
```

should display a useful table automatically.

Potential helpers:

```python
result.head()
result.tail()
result.sample()
result.to_pandas()
result.to_arrow()
result.plot()
```

---

# 43. Slice 34 — Visualization Integration

Optional convenience layer:

```python
result.plot()
```

or:

```python
db.table("sales").plot(
    x="date",
    y="revenue"
)
```

Keep visualization separate from the core engine.

---

# 44. Slice 35 — Import/Export

Support:

```text
CSV
JSON
Parquet
Arrow
pandas
NumPy
```

Examples:

```python
db.read_csv("sales.csv")
db.read_parquet("sales.parquet")
```

and:

```python
db.table("sales").to_parquet("sales.parquet")
```

---

# 45. Slice 36 — Streaming Ingestion

Support batches:

```python
with db.table("events").writer() as writer:
    for batch in stream:
        writer.write(batch)
```

Avoid one transaction per row.

Optimize:

```text
batch → encode → vectorize → write
```

---

# 46. Slice 37 — Query Profiling

Provide:

```python
result.explain()
result.profile()
```

Example:

```text
QUERY
 └─ HashAggregate
     └─ Filter
         └─ ParallelColumnScan

Rows scanned:     10,000,000
Rows filtered:       823,112
Execution:           184 ms
CPU:                 1.21 s
Memory:              82 MB
Threads:             8
```

---

# 47. Slice 38 — EXPLAIN

Support:

```sql
EXPLAIN SELECT ...
```

and:

```sql
EXPLAIN ANALYZE SELECT ...
```

Include:

* physical plan
* estimated rows
* actual rows
* timings
* memory
* I/O
* indexes used

---

# 48. Slice 39 — Automatic Index Advisor

Analyze workload and recommend:

```text
Recommended index:

users(age)

Reason:
92% of query workload filters on age.

Estimated storage:
18 MB

Estimated improvement:
4.7x
```

Initially recommendation-only.

Automatic index creation should come later.

---

# 49. Slice 40 — Observability

Expose:

```python
db.stats()
db.tables()
db.indexes()
db.transactions()
db.cache_stats()
```

Potential metrics:

```text
query_count
query_latency
page_reads
page_writes
cache_hit_rate
wal_bytes
checkpoint_time
memory_usage
active_transactions
```

---

# 50. Slice 41 — Security/Integrity

Implement:

* page checksums
* WAL checksums
* database integrity checker
* catalog consistency checks
* corruption detection

Command:

```bash
minidb check database.db
```

Python:

```python
db.integrity_check()
```

---

# 51. Slice 42 — Backup

Implement:

```python
db.backup("backup.db")
```

Requirements:

* consistent snapshot
* active transaction safety
* incremental backup architecture if feasible

---

# 52. Slice 43 — Extension System

Create a stable extension API.

Potential extensions:

```text
JSON
vectors
spatial
custom types
custom functions
custom indexes
```

C++:

```cpp
db.register_function(...);
db.register_index(...);
```

Python:

```python
db.register_function("normalize", fn)
```

Python-defined functions should be treated carefully because arbitrary Python callbacks can destroy query performance.

---

# 53. Slice 44 — Benchmark Suite

Create reproducible benchmarks against:

* SQLite
* DuckDB where applicable
* pandas where applicable
* raw C++ structures for microbenchmarks

Benchmark:

### OLTP

* insert
* update
* delete
* point lookup
* indexed lookup
* transaction throughput

### Analytics

* scans
* filters
* aggregation
* joins
* sorting
* group-by

### Python

* DataFrame ingestion
* query → pandas
* query → Arrow
* Arrow → database

### Storage

* database size
* compression
* WAL throughput
* recovery time

---

# 54. Slice 45 — Compatibility/Correctness Suite

Create SQL correctness tests.

Test:

* NULL semantics
* numeric coercion
* ordering
* grouping
* joins
* transactions
* indexes
* constraints
* crash recovery

Correctness takes priority over benchmark numbers.

---

# 55. Slice 46 — Fuzzing

Fuzz:

```text
SQL parser
expression parser
tuple decoder
page decoder
WAL decoder
B+Tree operations
catalog
```

Properties:

```text
encode(decode(x)) == x
```

and:

```text
database invariants remain true
```

---

# 56. Slice 47 — Python Type Safety

Provide typing:

```python
from minidb import Table

users: Table[User]
```

Potential generated models:

```python
@dataclass
class User:
    id: int
    name: str
    age: int
```

Then:

```python
db.register(User)
```

Schema can be derived automatically.

---

# 57. Slice 48 — Pythonic Query Builder

Eventually provide:

```python
users = db.table(User)

query = (
    users
    .where(User.age >= 18)
    .select(User.name, User.age)
    .order_by(User.age.desc())
)
```

Compile this into the same logical plan used by SQL.

**Critical architectural rule:**

```text
SQL ────────────────┐
                    ├──> Logical Plan
Python Query API ───┘
```

Do not build two separate query engines.

---

# 58. Slice 49 — C++ Typed Query API

Mirror the Python model:

```cpp
auto q =
    users
      .where(User::age >= 18)
      .select(User::name, User::age)
      .order_by(User::age.desc());
```

Compile into the same planner/executor.

---

# 59. Slice 50 — Packaging

Python package:

```bash
pip install minidb
```

Potential distributions:

```text
Linux x86_64
Linux ARM64
macOS ARM64
macOS x86_64
Windows x86_64
```

Later:

```text
PyPy
manylinux
musllinux
```

---

# 60. Slice 51 — Documentation

Documentation should be organized around tasks:

```text
Getting Started
Python API
C++ API
SQL
DataFrames
Analytics
Transactions
Performance
Storage
Recovery
Extensions
Internals
```

Include runnable examples for every major feature.

---

# 61. Slice 52 — Production Hardening

Before calling the project stable:

* ASAN
* UBSAN
* TSAN
* fuzzing
* stress testing
* crash testing
* concurrency testing
* long-running tests
* large-database tests
* low-disk-space tests
* corrupted-file tests
* power-loss simulation

---

# 62. Data Model

Initial types:

```text
BOOLEAN
INT32
INT64
UINT32
UINT64
FLOAT32
FLOAT64
DECIMAL
STRING
BLOB
DATE
TIME
TIMESTAMP
UUID
JSON
VECTOR
```

Potential future types:

```text
GEOMETRY
INTERVAL
LIST
STRUCT
MAP
```

---

# 63. Storage Architecture

Support both:

### Row storage

Best for:

* point lookups
* OLTP
* updates
* transactional applications

### Column storage

Best for:

* scans
* aggregation
* analytics
* DataFrames
* ML preprocessing

Long-term goal:

```text
              Table
                │
        ┌───────┴───────┐
        │               │
     Row Store      Column Store
        │               │
        └───────┬───────┘
                │
          Query Planner
```

---

# 64. Transaction Model

Target:

```text
MVCC
Snapshot Isolation
Atomic Commit
Durable WAL
Crash Recovery
```

Potential later isolation levels:

```text
READ COMMITTED
REPEATABLE READ
SNAPSHOT
SERIALIZABLE
```

---

# 65. Durability Modes

Expose:

```python
minidb.connect(
    "db.mdb",
    durability="full"
)
```

Modes:

```text
memory
unsafe
buffered
async
full
```

Document exactly what each mode guarantees.

---

# 66. Performance Architecture

The primary optimization path should be:

```text
SQL/Python
     ↓
Logical plan
     ↓
Optimizer
     ↓
Physical plan
     ↓
Vectorized execution
     ↓
Batch processing
     ↓
SIMD
     ↓
Parallel execution
     ↓
Efficient storage
```

Avoid optimizing individual operators prematurely.

---

# 67. Memory Architecture

Build around explicit memory ownership.

Components:

```text
Buffer Pool
Arena Allocators
Query Memory Pools
Temporary Operators
String Storage
Column Vectors
```

Every query should have observable memory consumption.

---

# 68. Compression

Eventually support:

```text
Dictionary encoding
Run-length encoding
Bit packing
Delta encoding
Frame-of-reference
Compression codecs
```

Compression should be particularly aggressive in the column store.

---

# 69. Caching

Potential layers:

```text
OS cache
    ↓
Database page cache
    ↓
Column/vector cache
    ↓
Query result cache
```

Don't implement result caching until correctness and invalidation semantics are well established.

---

# 70. Python Data Science Stack

The intended ecosystem:

```text
                 MiniDB
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
      Arrow      NumPy     pandas
        │          │          │
        └──────────┼──────────┘
                   ↓
              ML tooling
```

Potential integrations:

```text
scikit-learn
PyTorch
Jupyter
Polars
Matplotlib
```

The database itself should remain independent of these libraries.

---

# 71. Example End-State API

```python
import minidb

db = minidb.connect("analytics.db")

db.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY,
        timestamp TIMESTAMP,
        customer_id INTEGER,
        product STRING,
        amount DOUBLE
    )
""")

sales = db.table("sales")

sales.insert_many(data)

result = (
    sales
    .where(sales.amount > 100)
    .group_by("product")
    .agg(
        revenue=("amount", "sum"),
        orders=("id", "count")
    )
    .order_by("revenue", descending=True)
)

df = result.to_pandas()

result.profile()
```

---

# 72. Example C++ End-State API

```cpp
auto db = minidb::open("analytics.db");

auto sales = db.table<Sale>("sales");

auto result =
    sales
        .where(Sale::amount > 100)
        .group_by(Sale::product)
        .aggregate({
            sum(Sale::amount),
            count(Sale::id)
        })
        .order_by(Sale::amount.desc())
        .execute();

for (auto row : result) {
    // zero/low-copy access
}
```

---

# 73. End-State Architecture

```text
                         USERS
                           │
             ┌─────────────┼─────────────┐
             │             │             │
           Python         SQL            C++
             │             │             │
             └─────────────┼─────────────┘
                           │
                     Query Interface
                           │
                    Parser / Binder
                           │
                    Logical Planner
                           │
                   Cost-Based Optimizer
                           │
                   Physical Plan
                           │
                ┌──────────┴──────────┐
                │                     │
          Vectorized Executor    Transaction
                │                  Manager
                │                     │
                ├──────────┬──────────┤
                │          │          │
             RowStore  ColumnStore  Indexes
                │          │          │
                └──────────┼──────────┘
                           │
                      Buffer Manager
                           │
                         MVCC
                           │
                          WAL
                           │
                    Recovery Manager
                           │
                      Page Manager
                           │
                       Disk/File
```

---

# 74. Critical Architectural Decisions

These decisions should be made early.

## Decision 1

**Use a unified logical query plan for SQL, Python, and C++.**

This is extremely important.

```text
SQL ──────┐
Python ───┼──> Logical IR ──> Optimizer ──> Executor
C++ ──────┘
```

## Decision 2

**Use Arrow as an interoperability boundary, not as the database's entire storage engine.**

## Decision 3

**Design for MVCC from the beginning.**

Retrofitting it later is painful.

## Decision 4

**Design the executor around batches.**

Even if the first executor is simple, make the abstraction batch-oriented.

## Decision 5

**Keep Python out of the hot loop.**

Python should describe operations.

C++ should execute them.

---

# 75. MVP Definition

The first serious MVP should stop here:

```text
✓ Persistent database
✓ Tables
✓ Typed records
✓ SQL
✓ SELECT
✓ INSERT
✓ UPDATE
✓ DELETE
✓ B+Tree
✓ Index scans
✓ Buffer pool
✓ Transactions
✓ WAL
✓ Crash recovery
✓ Python bindings
✓ Python API
✓ Arrow
✓ pandas
✓ Basic vectorized execution
✓ EXPLAIN
✓ Benchmarks
```

At this point you have a legitimate embedded database.

Do **not** wait for vectors, spatial, FTS, visualization, or every SQL feature before releasing the MVP.

---

# 76. V1 Definition

V1 adds:

```text
✓ MVCC
✓ Parallel queries
✓ Cost-based optimizer
✓ Columnar execution
✓ Data profiling
✓ Parquet
✓ JSON
✓ Aggregations
✓ Joins
✓ Query profiler
✓ Strong Python UX
✓ Excellent documentation
✓ Crash/fuzz/concurrency testing
```

---

# 77. V2 Definition

V2 can add the differentiators:

```text
✓ Vector indexes
✓ Full-text search
✓ Time-series optimizations
✓ Automatic index advisor
✓ Extension API
✓ Advanced compression
✓ Adaptive execution
✓ Advanced analytics
✓ ML-oriented features
```

---

# 78. Success Metrics

## Engine

Measure:

* inserts/sec
* point lookups/sec
* indexed lookups/sec
* scans/sec
* aggregation throughput
* join throughput
* concurrent query throughput
* WAL throughput
* recovery time

## Python

Measure:

* DataFrame ingestion rate
* query → Arrow throughput
* query → pandas throughput
* memory overhead
* Python object allocations

## Developer experience

Target:

```text
< 5 minutes
```

from:

```bash
pip install minidb
```

to:

```python
db = minidb.connect("test.db")
```

creating a table and running a query.

---

# 79. Competitive Positioning

Do not market it as:

> "A better SQLite."

Position it as:

> **"A native embedded database for Python analytics and modern C++ applications."**

The competitive dimensions become:

```text
                  SQLite    MiniDB
─────────────────────────────────────
Embedded             ✓         ✓
Tiny                  ✓         ✓
C++ native                      ✓✓
Python analytics                 ✓✓
Arrow integration                ✓✓
Vectorized execution             ✓✓
Columnar analytics               ✓✓
MVCC                              ✓
Modern multicore                  ✓
Vector search                     ✓
Data profiling                    ✓
Pythonic API                      ✓✓
SQL                               ✓
Server required       no         no
```

---

# 80. Recommended Development Order

The actual implementation sequence should be:

```text
FOUNDATION
    ↓
FILE FORMAT
    ↓
PAGES
    ↓
RECORDS
    ↓
TABLES
    ↓
SCAN
    ↓
SQL
    ↓
B+TREE
    ↓
INDEX SCAN
    ↓
BUFFER POOL
    ↓
TRANSACTIONS
    ↓
WAL
    ↓
RECOVERY
    ↓
PYTHON BINDINGS
    ↓
ARROW
    ↓
DATAFRAME API
    ↓
VECTOR EXECUTOR
    ↓
AGGREGATIONS
    ↓
JOINS
    ↓
STATISTICS
    ↓
OPTIMIZER
    ↓
PARALLEL EXECUTION
    ↓
COLUMNAR ENGINE
    ↓
ANALYTICS TOOLING
    ↓
JSON / FTS / VECTOR / TIMESERIES
    ↓
PRODUCTION HARDENING
```

# 81. The Key Product Differentiator

The most important idea in this entire BRD is:

```text
                     MiniDB
                       │
          ┌────────────┼────────────┐
          │            │            │
         SQL         Python         C++
          │            │            │
          └────────────┼────────────┘
                       ↓
                  Query IR
                       ↓
                 Query Optimizer
                       ↓
              Vectorized Executor
                       ↓
            ┌──────────┴──────────┐
            ↓                     ↓
        Row Storage          Column Storage
            │                     │
            └──────────┬──────────┘
                       ↓
                    MVCC
                       ↓
                     WAL
                       ↓
                     Disk
```

**One engine. Three interfaces. One optimizer. One execution system.**

That gives you a coherent product rather than a C++ database with a Python wrapper bolted onto it.

The strongest end-state would feel like **a local analytical notebook engine, embedded application database, and C++ library simultaneously**—while remaining a single `.db` file with no server to manage.
