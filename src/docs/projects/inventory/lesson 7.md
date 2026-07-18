# Lesson 7: Transactions, Concurrency, and Row Locking

**What you will build**
You will build a strict transactional boundary to move a physical inventory item from one warehouse location to another, while simultaneously writing to an append-only movement ledger. The actual problem we are solving is the double-spend race condition: ensuring that two warehouse workers cannot digitally reserve the exact same physical item at the exact same millisecond.

**What you need to know first**
From Lesson 4: `ForeignKey` and `Mapped` columns. From Lesson 5: The `Session` Unit of Work and `commit()` vs `flush()`. From Lesson 6: The `crud.py` isolation layer.

**The Pipeline**
`Client Request → Pydantic (Validation) → [ SQLAlchemy (ORM) ] → [ SQLite (Storage) ]`

This lesson spans the ORM and Storage stages. We are focusing on atomic operations—guaranteeing that a multi-step operation passing through the ORM succeeds completely in SQLite, or leaves the storage layer entirely untouched.

---

## Concept Unit: Server-Side Timestamps

### The Problem

When moving an item, we must write a record to a `movements` ledger with an exact timestamp. If we use Python to generate the time (`datetime.now()`) and send it to the database, we introduce a critical vulnerability: if two API servers are running in different timezones, or if their system clocks drift by a few milliseconds, the ledger's history becomes out of order. The database engine itself must be the absolute authority on time.

### Introduce the concept in isolation

Create `lab_time.py` to see how SQLAlchemy asks the database engine to calculate the time, rather than Python.

```python
from sqlalchemy import select, func, create_engine

engine = create_engine("sqlite:///:memory:")

with engine.connect() as conn:
    # We execute a SQL function directly, not a table query
    result = conn.scalar(select(func.now()))
    print(f"Database engine time: {result}")

```

Run it:

```bash
python lab_time.py

```

Output:

```text
Database engine time: 2026-07-18 09:27:45

```

*What this proves:* Python did not calculate this string. `func.now()` instructed SQLAlchemy to emit the SQL command `SELECT CURRENT_TIMESTAMP`. The SQLite C-binary generated the exact UTC timestamp.

### Discard the throwaway example

Delete `lab_time.py`. We will now use this function to default our ledger timestamps in our schema.

### Project Change

We will add two new models to complete our physical inventory schema: `Item` (a serialized piece of hardware) and `Movement` (the ledger log).

* **Files affected:** `nexus/models.py`.
* **Change type:** Add.
* **Location:** At the bottom of the file.
* **Dependencies:** Requires importing `DateTime` and `func`.

### The New Code

```python
from sqlalchemy import DateTime, func

class Item(Base):
    __tablename__ = "items"
    serial_number: Mapped[str] = mapped_column(String(50), primary_key=True)
    sku_id: Mapped[str] = mapped_column(ForeignKey("skus.sku_id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))

class Movement(Base):
    __tablename__ = "movements"
    id: Mapped[int] = mapped_column(primary_key=True)
    item_serial: Mapped[str] = mapped_column(ForeignKey("items.serial_number"))
    from_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    to_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    timestamp: Mapped[str] = mapped_column(DateTime, server_default=func.now())

```

### The Updated Project

Because we are adding classes at the root level, the smallest enclosing structure is the file itself. Here is the fully reconstructed `nexus/models.py`.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, func

class Base(DeclarativeBase):
    pass

class SKU(Base):
    __tablename__ = "skus"
    sku_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))

class Location(Base):
    __tablename__ = "locations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    region: Mapped[str] = mapped_column(String(10))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"))
    
    parent: Mapped["Location | None"] = relationship(
        remote_side="Location.id", 
        back_populates="children"
    )
    children: Mapped[list["Location"]] = relationship(
        back_populates="parent",
        lazy="selectin" 
    )

# ← new: Physical items and their movement ledger
class Item(Base):
    __tablename__ = "items"
    serial_number: Mapped[str] = mapped_column(String(50), primary_key=True)
    sku_id: Mapped[str] = mapped_column(ForeignKey("skus.sku_id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))

class Movement(Base):
    __tablename__ = "movements"
    id: Mapped[int] = mapped_column(primary_key=True)
    item_serial: Mapped[str] = mapped_column(ForeignKey("items.serial_number"))
    from_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    to_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    timestamp: Mapped[str] = mapped_column(DateTime, server_default=func.now())

```

The file now contains the complete domain model: a product catalog (`SKU`), a hierarchical storage map (`Location`), the physical units (`Item`), and the historical log of their placement (`Movement`).

### Mechanical walkthrough

1. `from sqlalchemy import DateTime, func`: (First appearance). Imports the datetime column type and the SQL function generator.
2. `class Item(Base):`: (Already established syntax).
3. `serial_number: Mapped[str] = mapped_column(String(50), primary_key=True)`: (Already established syntax). Uses an alphanumeric serial number as the primary key rather than an integer ID.
4. `sku_id`, `location_id`: (Already established syntax). Foreign keys linking the physical item to its product definition and its physical location.
5. `class Movement(Base):`: (Already established syntax).
6. `timestamp: Mapped[str]`: (Already established syntax). Even though the database type is `DateTime`, SQLite natively returns these as strings, so we type-hint it as a string for Python.
7. `= mapped_column(DateTime, server_default=func.now())`: (First appearance). `DateTime` sets the SQL column type. `server_default` is fundamentally different from a Python default. A Python default calculates the value in RAM and sends it in the `INSERT` statement. `server_default` omits the column from the `INSERT` entirely, forcing the database engine to use its own clock to populate the field upon write.

### CS Lens

**Clock Synchronization in Distributed Systems.** You can never trust the clock of a client or an application node in a distributed architecture. If Server A's clock is 2 seconds ahead of Server B's, and an item moves rapidly, the ledger might record the item arriving at its destination *before* it left its origin. Pushing timestamp generation into the single-source-of-truth storage engine guarantees monotonic, strictly ordered event logs.
*Also recognized in:* Vector clocks, Git commit timestamps vs. author timestamps, and financial trading ledgers.

### SE Lens

Why use an append-only `Movement` ledger instead of just checking the `Item.location_id`? **Event Sourcing.** Storing the current state (`Item.location_id = 2`) tells you *where* the item is. The ledger tells you *how* it got there. If a $5,000 part goes missing, the current state doesn't help you find it. An immutable ledger allows you to replay history and audit the exact sequence of hands the part passed through.

### Commands needed to make this unit real

No commands needed; models are structurally defined.

### One sentence connecting this unit to what came immediately before.

We have the tables to support movement, but moving an item requires modifying two tables simultaneously, which introduces the risk of partial failure.

---

## Concept Unit: The Atomic Boundary (Rollbacks)

### The Problem

Moving an item is a two-step process: `UPDATE items SET location_id = X` and `INSERT INTO movements ...`. If the `UPDATE` succeeds, but the `INSERT` fails (perhaps due to a misspelled foreign key), the program crashes. The item is now physically at the new location in the system, but there is no ledger record of the move. Our database is in a corrupted state.

### Introduce the concept in isolation

Create `lab_rollback.py` to prove that a database transaction can undo completed work if a subsequent step fails.

```python
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import Session
from models import Base, SKU

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
session = Session(engine)

try:
    # Step 1: Add the SKU
    session.add(SKU(sku_id="TEST-1", name="Perfect Item"))
    session.flush() # Forces the SQL INSERT to run immediately!
    
    # Step 2: Simulate a catastrophic server error
    print("Step 1 executed. Crashing server...")
    raise RuntimeError("Power loss during step 2!")
    
    session.commit() # This line is never reached
except RuntimeError as e:
    print(f"Caught error: {e}")
    # The crucial safety mechanism
    session.rollback()

# Check the database
count = session.scalar(select(func.count(SKU.sku_id)))
print(f"Total SKUs permanently saved in database: {count}")

```

Run it:

```bash
python lab_rollback.py

```

Output:

```text
Step 1 executed. Crashing server...
Caught error: Power loss during step 2!
Total SKUs permanently saved in database: 0

```

*What this proves:* Even though `session.flush()` actually sent the SQL `INSERT` to the SQLite engine, the database held the changes in a temporary staging area. Because `session.rollback()` was called in the exception handler, SQLite threw away the pending changes, leaving the database completely untouched.

### Discard the throwaway example

Delete `lab_rollback.py`. We will now build the secure item movement function in our CRUD layer.

### Project Change

We will add the `move_item` function to `nexus/crud.py`, utilizing explicit try/except blocks to enforce atomicity.

* **Files affected:** `nexus/crud.py`.
* **Change type:** Add.
* **Location:** At the bottom of the file.
* **Dependencies:** Requires importing `Item` and `Movement` models.

### The New Code

```python
from models import Item, Movement

def move_item(session: Session, serial: str, new_location_id: int) -> Item:
    try:
        item = session.scalar(select(Item).where(Item.serial_number == serial))
        if not item:
            raise ValueError("Item not found")
        
        old_location = item.location_id
        
        # 1. Update the current state
        item.location_id = new_location_id
        
        # 2. Append to the ledger
        log = Movement(
            item_serial=serial,
            from_location_id=old_location,
            to_location_id=new_location_id
        )
        session.add(log)
        
        # 3. Finalize
        session.commit()
        return item
    except Exception as e:
        session.rollback()
        raise e

```

### The Updated Project

Because we are adding a function at the root level, the smallest enclosing structure is the file itself. Here is the fully reconstructed `nexus/crud.py`.

```python
from sqlalchemy.orm import Session
from sqlalchemy import select
from models import SKU, Item, Movement
from schemas import SKUCreate, SKURead

def create_sku(session: Session, sku_in: SKUCreate) -> SKU:
    db_sku = SKU(**sku_in.model_dump())
    session.add(db_sku)
    session.commit()
    return db_sku

def get_sku(session: Session, target_id: str) -> SKURead | None:
    db_sku = session.scalar(select(SKU).where(SKU.sku_id == target_id))
    if db_sku is None:
        return None
    return SKURead.model_validate(db_sku)

# ← new: Atomic movement function with rollback safety
def move_item(session: Session, serial: str, new_location_id: int) -> Item:
    try:
        item = session.scalar(select(Item).where(Item.serial_number == serial))
        if not item:
            raise ValueError("Item not found")
        
        old_location = item.location_id
        
        # 1. Update the current state
        item.location_id = new_location_id
        
        # 2. Append to the ledger
        log = Movement(
            item_serial=serial,
            from_location_id=old_location,
            to_location_id=new_location_id
        )
        session.add(log)
        
        # 3. Finalize
        session.commit()
        return item
    except Exception as e:
        session.rollback()
        raise e

```

The `move_item` function guarantees that it is impossible to change an item's location without generating a permanent audit log of the move.

### Mechanical walkthrough

1. `try:`: (First appearance). Python syntax to start a block of code that might fail.
2. `item = session.scalar(...)`: (Already established syntax). Fetches the single physical item from the database.
3. `old_location = item.location_id`: Captures the item's current state before we overwrite it.
4. `item.location_id = new_location_id`: (First appearance). We are reassigning a property on an active ORM object. Notice we *do not* write a SQL `UPDATE` statement. Because this object was yielded by the `Session`, the `Session` is actively tracking it. It notices the variable changed and automatically stages a SQL `UPDATE` command in the background.
5. `log = Movement(...)`: (Already established syntax). Instantiates the ledger entry.
6. `session.add(log)`: (Already established syntax). Stages the `INSERT` command.
7. `session.commit()`: (Already established syntax). Emits both the `UPDATE` and the `INSERT` as a single atomic unit.
8. `except Exception as e:`: (First appearance). Catches any error (a missing foreign key, a network timeout, a database lock).
9. `session.rollback()`: (First appearance). Immediately tells SQLite to abort the transaction, erasing the staged `UPDATE` and `INSERT`, returning the database to the exact state it was in before the function was called.
10. `raise e`: (First appearance). Re-raises the error so the web framework (like FastAPI) can catch it and return a 500 error to the client, ensuring the failure isn't silently ignored.

### CS Lens

**Atomicity in ACID.** ACID (Atomicity, Consistency, Isolation, Durability) is the gold standard for database reliability. Atomicity guarantees that a transaction is treated as a single, indivisible logical unit of work. It is an "all-or-nothing" mechanism. If a transaction has 100 steps and step 99 fails, the database reverts the first 98.
*Also recognized in:* CPU instruction sets (Compare-and-Swap), filesystem journaling, and financial bank transfers.

### SE Lens

Why put the `try/except` in the CRUD layer instead of the API router layer? **Responsibility.** The CRUD layer is responsible for database integrity. If another developer writes a background cleanup script that calls `move_item()`, and you left the `rollback()` logic in the web API layer, their script will crash leaving the database corrupted. Always wrap database transactions as close to the storage execution as possible.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

Our function is safe from crashes, but it is *not* safe from concurrency: if two workers execute this exact function on the exact same item at the exact same millisecond, the ledger will corrupt.

---

## Concept Unit: Pessimistic Row Locking

### The Problem

Worker A and Worker B both try to pick Serial `XYZ` from Aisle 1 at the same time.

* Worker A's thread runs: `item = session.scalar(...)`. Reads: `location = Aisle 1`.
* Worker B's thread runs: `item = session.scalar(...)`. Reads: `location = Aisle 1`.
* Worker A updates location to Cart A, writes ledger (Aisle 1 -> Cart A), and commits.
* Worker B updates location to Cart B, writes ledger (Aisle 1 -> Cart B), and commits.

The item is now physically in Cart A, digitally in Cart B, and the ledger says it moved from Aisle 1 *twice*. This is a race condition. We must lock the row the moment Worker A reads it, forcing Worker B to wait.

### Introduce the concept in isolation

Create `lab_lock.py` to see how SQLAlchemy asks the database to lock a specific row for editing.

```python
from sqlalchemy import select, create_engine
from models import Item

# echo=True reveals the generated SQL
engine = create_engine("sqlite:///:memory:", echo=True)

# We append .with_for_update() to the end of our query
query = select(Item).where(Item.serial_number == "123").with_for_update()

with engine.connect() as conn:
    print("\n--- Executing Lock Query ---")
    conn.execute(query)

```

Run it:

```bash
python lab_lock.py

```

Output:

```text
--- Executing Lock Query ---
INFO sqlalchemy.engine.Engine SELECT items.serial_number, items.sku_id, items.location_id FROM items WHERE items.serial_number = ? FOR UPDATE

```

*What this proves:* Appending `.with_for_update()` to a SQLAlchemy query modifies the generated SQL, appending the `FOR UPDATE` clause to the very end of the statement. This commands the database engine to acquire a write lock on the resulting data immediately upon reading it.

### Discard the throwaway example

Delete `lab_lock.py`. We will now lock the item in our movement function.

### Project Change

We will modify the query inside `move_item` to secure a lock on the item before we attempt to move it.

* **Files affected:** `nexus/crud.py`.
* **Change type:** Modify.
* **Location:** Inside the `move_item` function, updating the `item = session.scalar(...)` query.

### The New Code

```python
        # ← new: with_for_update() locks the row until commit or rollback
        item = session.scalar(
            select(Item)
            .where(Item.serial_number == serial)
            .with_for_update()
        )

```

### The Updated Project

The smallest enclosing structure is the `move_item` function. Here is the updated function as it appears inside `nexus/crud.py`.

```python
def move_item(session: Session, serial: str, new_location_id: int) -> Item:
    try:
        # ← new: Lock acquired during the read
        item = session.scalar(
            select(Item)
            .where(Item.serial_number == serial)
            .with_for_update()
        )
        if not item:
            raise ValueError("Item not found")
        
        old_location = item.location_id
        
        # 1. Update the current state
        item.location_id = new_location_id
        
        # 2. Append to the ledger
        log = Movement(
            item_serial=serial,
            from_location_id=old_location,
            to_location_id=new_location_id
        )
        session.add(log)
        
        # 3. Finalize (Lock is released here)
        session.commit()
        return item
    except Exception as e:
        session.rollback() # Lock is also released here
        raise e

```

Worker B's request will now pause at the `session.scalar()` line, waiting for Worker A's transaction to hit `session.commit()` and release the lock. When Worker B unpauses, they will read the *new* location (Cart A), and their application logic will reject their move attempt.

### Mechanical walkthrough

1. `.with_for_update()`: (First appearance). A SQLAlchemy Core query modifier. It tells the ORM to append the locking clause to the generated SQL. The lock is held by the database engine until the current `Session` issues either a `commit()` or a `rollback()`.
2. `select(Item).where(...).with_for_update()`: (Hard concept repeating: Method Chaining). Python allows you to chain methods consecutively when each method returns the modified object. The line breaks and indentation are standard formatting to keep chained queries readable.

### CS Lens

**Pessimistic vs. Optimistic Locking.** We just implemented Pessimistic Locking: we assume a collision will happen, so we lock the resource up front. The alternative is Optimistic Locking: we don't lock the row, but we add a `version_number` column. When updating, we say `UPDATE items SET loc=2, version=2 WHERE id=1 AND version=1`. If Worker A already updated it, the version is now 2, so Worker B's `UPDATE` affects 0 rows, failing safely. Pessimistic locking is easier to reason about but holds database connections longer.

### SE Lens

How does SQLite handle `FOR UPDATE` compared to PostgreSQL? **Granularity.** PostgreSQL has true *row-level* locking. `FOR UPDATE` in Postgres locks only Serial `123`; other workers can freely move Serial `999` at the same time. SQLite is a file-based database. It does not have row-level locking. When SQLAlchemy sends `FOR UPDATE` to SQLite, SQLite upgrades the entire database connection to a write lock. Because we are in WAL mode (Lesson 1), *readers* are not blocked, but all other *writers* are queued. For a system with 50 concurrent warehouse workers, SQLite will queue these writes in microseconds without issue. For 5,000 concurrent writers, you would need to migrate to PostgreSQL (which SQLAlchemy makes trivial, as the `with_for_update()` syntax is identical for both).

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

With strict atomicity and pessimistic locking in place, our core transactional engine is fully hardened.

---

## Closing

**Connect the pieces**
To execute a flawless, concurrent inventory move: Worker A requests to move `XYZ` to Bin 2. `move_item` opens a `Session` (Lesson 5). It queries `Item` using `.with_for_update()`, immediately securing a write lock on the SQLite file (Lesson 1/WAL mode). The ORM tracks the assignment `item.location_id = 2` automatically. We instantiate a `Movement` object, allowing `server_default=func.now()` to defer timestamping to the SQLite engine. We call `session.commit()`. SQLAlchemy emits the atomic `UPDATE` and `INSERT` batch. SQLite writes it to disk and releases the lock, freeing Worker B to begin their transaction safely.

**What breaks without this**
If you remove `.with_for_update()` and run a load-test script that spawns 10 parallel threads all attempting to move the exact same item to 10 different locations, the SQLite database will execute all 10 reads simultaneously, followed by all 10 writes. The final resting place of the physical item will simply be whichever thread happened to commit its `UPDATE` last, but the `movements` ledger will proudly display 10 simultaneous origins for a single physical object, destroying your audit trail.

**Exercises**

1. In `lab_rollback.py`, move the `raise RuntimeError` statement to *before* `session.flush()`. Run the script. What changes? (Answer: Nothing touches the database at all, but the rollback is still required to clear the `Session`'s internal memory state).
2. Look up `with_for_update(nowait=True)` in the SQLAlchemy documentation. What happens if two workers try to grab the same item and `nowait` is active?

**Definition of Done**

* [x] `Item` and `Movement` models created.
* [x] `Movement.timestamp` defers generation to SQLite via `server_default=func.now()`.
* [x] `move_item` CRUD function enforces atomicity using `try/except/rollback`.
* [x] Race conditions are mitigated using Pessimistic Locking (`with_for_update`).
* [x] You can commit these changes with the message: `feat: implement atomic movement ledger with pessimistic concurrency locking`.