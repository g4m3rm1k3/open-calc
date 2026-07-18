# Lesson 8: Bypassing the ORM for Bulk Operations

**What you will build**
You will build a high-speed ingestion engine capable of loading or updating thousands of SKUs in a fraction of a second. The problem we are solving is the massive CPU and memory overhead of the Object-Relational Mapper. While the ORM is perfect for safely moving a single item, instantiating 50,000 Python objects to load an initial catalog will crash or stall a web request.

**What you need to know first**
From Lesson 4: `Mapped` types and table metadata. From Lesson 5: `session.execute()` and the Unit of Work. From Lesson 6: Unpacking dictionaries.

**The Pipeline**
`Batch JSON → Pydantic (Validation) → [ SQLAlchemy (Core) ] → SQLite (Storage)`

Notice that we are explicitly skipping the **SQLAlchemy (ORM)** stage in this pipeline. Instead of translating dictionaries into stateful `SKU` objects, we will map them directly into a low-level SQLAlchemy Core expression and fire them straight into the database file.

---

## Concept Unit: SQLAlchemy Core Bulk Inserts

### The Problem

If a supplier provides a catalog of 10,000 new SKUs, using our existing `create_sku(session, sku_in)` function from Lesson 6 would require creating 10,000 Pydantic objects, translating them into 10,000 SQLAlchemy `SKU` objects, tracking all of their states in the `Session`, and emitting 10,000 individual `INSERT` SQL statements. This is called "chatty" database behavior and is devastatingly slow.

### Introduce the concept in isolation

Create `lab_bulk.py` to compare ORM overhead against a Core bulk insert.

```python
import time
from sqlalchemy import create_engine, insert
from sqlalchemy.orm import Session
from models import Base, SKU

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

# Generate 10,000 raw dictionaries
data = [{"sku_id": f"BULK-{i}", "name": f"Part {i}", "description": None} for i in range(10000)]

with Session(engine) as session:
    start_orm = time.time()
    # ORM approach: 10,000 object instantiations
    for row in data:
        session.add(SKU(**row))
    session.flush()
    print(f"ORM Flush Time: {time.time() - start_orm:.4f} seconds")

    session.rollback() # Clear it

    start_core = time.time()
    # Core approach: 1 statement, raw dictionaries
    session.execute(insert(SKU), data)
    print(f"Core Execution Time: {time.time() - start_core:.4f} seconds")

```

Run it:

```bash
python lab_bulk.py

```

Output:

```text
ORM Flush Time: 0.8412 seconds
Core Execution Time: 0.0315 seconds

```

*What this proves:* By completely bypassing Python object instantiation and passing a raw list of dictionaries to a Core `insert` construct, we achieve roughly a 25x speedup. The engine compiles exactly one optimized SQL statement and uses DBAPI executemany to bind all 10,000 rows in C-memory.

### Discard the throwaway example

Delete `lab_bulk.py`. We will now implement a bulk ingestion function in our CRUD layer.

### Project Change

We will add a new function to `nexus/crud.py` designed exclusively for massive datasets.

* **Files affected:** `nexus/crud.py`.
* **Change type:** Add.
* **Location:** At the bottom of the file.
* **Dependencies:** Requires importing `insert` from `sqlalchemy`.

### The New Code

```python
from sqlalchemy import insert

def bulk_insert_skus(session: Session, skus_data: list[dict]):
    session.execute(insert(SKU), skus_data)
    session.commit()

```

### The Updated Project

Because this is a brand-new freestanding function, the block above represents the entirety of what is being appended to the bottom of `nexus/crud.py`. This provides our system with a dedicated high-speed ingestion lane.

### Mechanical walkthrough

1. `from sqlalchemy import insert`: (First appearance). Imports the Core SQL expression construct. This lives one layer below the ORM.
2. `def bulk_insert_skus(session: Session, skus_data: list[dict]):`: (First appearance). A function signature accepting the database session and a native Python list filled with standard dictionaries.
3. `session.execute(...)`: (Already established syntax). We previously used this to execute a `select()`. Here, we pass an insert command.
4. `insert(SKU)`: (First appearance). Generates a parameterized SQL statement (`INSERT INTO skus (sku_id, name, description) VALUES (?, ?, ?)`). Notice we pass the `SKU` class to tell it the table shape, but we never instantiate an actual `SKU()` object.
5. `skus_data`: (First appearance). When `session.execute` receives a list of dictionaries as its second argument alongside an `insert` statement, it automatically triggers a high-speed batch operation (`executemany` in SQLite).
6. `session.commit()`: (Already established syntax). Permanently saves the massive block of data.

### CS Lens

**Abstraction Overhead.** The ORM is a high-level abstraction. It provides safety, relationship tracking, and developer ergonomics, but every abstraction has a CPU and memory cost. SQLAlchemy Core provides low-level primitives: less safety net, more speed. Knowing when to drop down through the abstraction layers—using the ORM for single complex business transactions, and Core for data-pipeline ingestion—is the hallmark of mature systems engineering.
*Also recognized in:* React's Virtual DOM vs. raw `innerHTML` writes, Python `for` loops vs. NumPy vectorized C-extensions, and garbage collected memory vs. manual `malloc`.

### SE Lens

What is the tradeoff of dropping to Core? **Loss of ORM Events and Cascades.** Because we never instantiate `SKU` objects, any ORM-level `@validates` hooks or Python-side defaults will simply never fire. The database itself is the only line of defense. This is why we must still pass our JSON through Pydantic to get `skus_data`, relying on the Validation layer and the Storage layer (`STRICT` mode) to compensate for bypassing the ORM safety net.

### Commands needed to make this unit real

No commands needed; function defined.

### One sentence connecting this unit to what came immediately before.

This function will effortlessly insert 10,000 new items, but if even a single one of those `sku_id`s already exists in the database, the entire batch will crash with a Primary Key collision.

---

## Concept Unit: Upserts (On Conflict Do Update)

### The Problem

Catalog updates are rarely 100% new items; they are usually a mix of new items and updates to existing item descriptions. If we run our `bulk_insert_skus` function and row 5,000 contains a `sku_id` that is already in SQLite, the engine will throw an `IntegrityError` and rollback the *entire* batch. We need an "Upsert" (Update or Insert) command to instruct SQLite: "If this ID doesn't exist, insert it. If it does exist, just overwrite the name and description with this new data."

### Introduce the concept in isolation

Create `lab_upsert.py` to observe SQLite's specific `ON CONFLICT` syntax.

```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from models import Base, SKU

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # 1. Seed an existing item
    session.add(SKU(sku_id="A1", name="Original Name"))
    session.commit()

    # 2. A batch containing the existing item AND a new item
    batch = [
        {"sku_id": "A1", "name": "Updated Name"},
        {"sku_id": "B2", "name": "New Item"}
    ]

    # 3. Create the SQLite-specific statement
    stmt = sqlite_insert(SKU).values(batch)
    stmt = stmt.on_conflict_do_update(
        index_elements=['sku_id'],
        set_={'name': stmt.excluded.name}
    )
    
    session.execute(stmt)
    session.commit()

    # Verify the results
    for sku in session.scalars(select(SKU)):
        print(f"ID: {sku.sku_id}, Name: {sku.name}")

```

Run it:

```bash
python lab_upsert.py

```

Output:

```text
ID: A1, Name: Updated Name
ID: B2, Name: New Item

```

*What this proves:* By using the SQLite dialect's `insert`, we unlock the `.on_conflict_do_update()` method. The database gracefully handled the collision on `A1` by overwriting the name, while seamlessly inserting `B2`. No exceptions were thrown.

### Discard the throwaway example

Delete `lab_upsert.py`. We will rewrite our project's bulk import function to be fully idempotent.

### Project Change

We will replace the generic `bulk_insert_skus` in `nexus/crud.py` with an SQLite-specific UPSERT function.

* **Files affected:** `nexus/crud.py`.
* **Change type:** Replace.
* **Location:** The `bulk_insert_skus` function at the bottom of the file.
* **Dependencies:** Requires importing `insert` from `sqlalchemy.dialects.sqlite`.

### The New Code

```python
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

def bulk_import_skus(session: Session, skus_data: list[dict]):
    stmt = sqlite_insert(SKU).values(skus_data)
    
    stmt = stmt.on_conflict_do_update(
        index_elements=['sku_id'],
        set_={
            'name': stmt.excluded.name,
            'description': stmt.excluded.description
        }
    )
    
    session.execute(stmt)
    session.commit()

```

### The Updated Project

Here is the smallest enclosing structure—the newly rewritten function—as it now exists in `nexus/crud.py`.

```python
# ... previous crud functions ...

# ← new: SQLite-specific bulk UPSERT
def bulk_import_skus(session: Session, skus_data: list[dict]):
    stmt = sqlite_insert(SKU).values(skus_data)
    
    stmt = stmt.on_conflict_do_update(
        index_elements=['sku_id'],
        set_={
            'name': stmt.excluded.name,
            'description': stmt.excluded.description
        }
    )
    
    session.execute(stmt)
    session.commit()

```

This single function can now be called blindly. Whether the catalog contains 10,000 brand-new items, or 10,000 edits to existing items, the database will reconcile them perfectly without crashing.

### Mechanical walkthrough

1. `from sqlalchemy.dialects.sqlite import insert as sqlite_insert`: (First appearance). We import `insert` from a dialect-specific package and rename it `sqlite_insert` to avoid confusion. Standard SQL has no universal Upsert command, so we must use the SQLite implementation.
2. `stmt = sqlite_insert(SKU)`: (Already established syntax). Creates the base statement.
3. `.values(skus_data)`: (First appearance). Directly binds the list of dictionaries to the statement object in memory, preparing it for execution.
4. `stmt = stmt.on_conflict_do_update(...)`: (First appearance). A chained method appending the `ON CONFLICT` clause to the generated SQL string.
5. `index_elements=['sku_id']`: (First appearance). Instructs the database engine *which* unique constraint should trigger the fallback behavior. We tell it to watch the Primary Key.
6. `set_={...}`: (First appearance). A dictionary defining exactly which columns to overwrite if a collision happens. The trailing underscore `_` is used because `set` is a protected keyword in Python.
7. `stmt.excluded.name`: (First appearance). A magical SQLAlchemy proxy. In SQL Upserts, a temporary table named `EXCLUDED` is created holding the exact data you *tried* to insert but couldn't. This line translates to: "Update the database's name column to match the name I just attempted to insert."

**Execution trace for batch UPSERT:**

```text
Batch Input: [{"sku_id": "X1", "name": "Old"}, {"sku_id": "X1", "name": "New"}]
Step 1: Engine encounters first X1. No conflict. Inserts row.
Step 2: Engine encounters second X1.
Step 3: Primary Key collision detected on 'sku_id'.
Step 4: Engine catches conflict, aborts INSERT, and populates EXCLUDED with {"sku_id": "X1", "name": "New"}.
Step 5: Engine executes UPDATE: SET name = EXCLUDED.name ("New") WHERE sku_id = "X1".
Result: The database row cleanly reflects "New" without aborting the transaction.

```

### CS Lens

**Idempotency.** An operation is idempotent if running it once has the exact same effect as running it 1,000 times. A standard `INSERT` is not idempotent (running it twice throws an error). An Upsert is fully idempotent. In distributed systems, networks drop connections and clients frequently retry the exact same upload request. If your ingestion endpoints are not idempotent, a network hiccup will duplicate or corrupt your entire catalog.
*Also recognized in:* HTTP `PUT` and `PATCH` methods, Infrastructure as Code (Terraform, Ansible), and Docker layer builds.

### SE Lens

What is the cost of using `sqlite_insert`? **Vendor Lock-in.** Throughout this curriculum, we used standard SQLAlchemy constructs (`select`, `session.add`). If we changed our `create_engine` connection string from SQLite to PostgreSQL, 99% of our application would work instantly. By using `sqlite_insert`, we have hardcoded this specific function to the SQLite C-binary. If we ever migrate to Postgres, this function will instantly crash because Postgres uses a slightly different syntax for Upserts (`from sqlalchemy.dialects.postgresql import insert`). Sacrificing database portability is the price you pay for low-level performance features.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

Our application is now fully capable of validating input, modeling relationships, maintaining atomic integrity, and ingesting massive data batches at near C-level speeds.

---

## Closing

**Connect the pieces**
To execute a massive data migration: A worker uploads a CSV containing 50,000 product updates. The application reads the CSV and passes each row through the `SKUCreate` Pydantic model (Lesson 3) to enforce length limits and regex patterns. We collect the valid Pydantic models, call `[sku.model_dump() for sku in valid_skus]`, and hand that list to `bulk_import_skus` (Lesson 8). SQLAlchemy bypasses the ORM graph (Lesson 5), compiles a raw `ON CONFLICT` SQLite statement, and utilizes the `WAL` connection engine (Lesson 1/4) to slam all 50,000 updates into the `STRICT` product catalog table (Lesson 2) in a single atomic burst.

**What breaks without this**
If you revert the function to a standard `session.add()` loop inside a `try/except` block and feed it 50,000 rows where exactly one row is a duplicate, the entire `Session` will crash. The `except` block will trigger a `rollback()`, discarding all 49,999 valid product updates because of a single conflict. Your application would be completely incapable of processing incremental catalog updates.

**Exercises**

1. Write a script `seed_catalog.py` that generates a list of 1,000 dictionaries with random names, and successfully executes `bulk_import_skus` to seed your database.
2. Run your script a second time. Verify that the terminal does not show an `IntegrityError` stack trace, proving the Upsert logic handled the 1,000 collisions silently.

**Definition of Done**

* [x] A `bulk_import_skus` CRUD function exists.
* [x] ORM instantiation overhead is bypassed using Core `execute(insert())` operations.
* [x] Primary Key collisions are mitigated securely using SQLite's native Upsert (`on_conflict_do_update`).
* [x] You can commit these changes with the message: `perf: add high-speed idempotent bulk ingestion bypassing the orm`.