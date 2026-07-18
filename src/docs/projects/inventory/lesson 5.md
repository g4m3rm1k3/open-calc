# Lesson 5: Navigating Object Graphs and N+1 Performance

**What you will build**
You will build the mechanism to insert objects into the database, define object-oriented navigational links between parent and child locations, and eliminate the catastrophic performance bug known as the N+1 Query Problem. The actual problem we are solving is bridging the gap between how SQL engines retrieve flat tables and how Python applications traverse nested memory graphs.

**What you need to know first**
From Lesson 4: `DeclarativeBase`, `Mapped` types, `ForeignKey`, and the `Engine`.

**The Pipeline**
`Client Request → Pydantic (Validation) → [ SQLAlchemy (ORM) ] → [ SQLite (Storage) ]`

This lesson spans both the ORM and Storage stages. We will instruct the ORM to manage Python memory states, track changes, and selectively emit optimized SQL commands to the Storage engine we configured earlier.

---

## Concept Unit: The Unit of Work (Session)

### The Problem

We have an `Engine` to connect to the database (Lesson 4) and `Location` models to define the shape of the data. But the `Engine` only executes raw SQL strings. If we instantiate a `Location` object in Python, how do we command SQLAlchemy to monitor that object, write it to disk, and track its changes?

### Introduce the concept in isolation

Create `lab_session.py` to observe how a Session tracks the state of an object.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine) # Creates the tables

# 1. Instantiate the object (State: Transient)
new_user = User(name="Alice")
print(f"ID before adding: {new_user.id}")

# 2. Open a Session and add the object (State: Pending)
with Session(engine) as session:
    session.add(new_user)
    
    # 3. Commit the transaction (State: Persistent)
    session.commit()
    print(f"ID after commit: {new_user.id}")

```

Run it:

```bash
python lab_session.py

```

Output:

```text
ID before adding: None
ID after commit: 1

```

*What this proves:* The `Session` acts as a staging area. When instantiated, `new_user` is just a floating Python object (Transient). Calling `session.add()` moves it into the Session's staging area (Pending). Calling `session.commit()` issues the SQL `INSERT`, receives the auto-generated ID from SQLite, and updates the Python object in-place (Persistent).

### Discard the throwaway example

Delete `lab_session.py`. We will now use a Session to seed our actual NexusInventory database.

### Project Change

We will create a script that inserts our hierarchical location data using the ORM.

* **Files affected:** Create a new file `nexus/seed_orm.py`.
* **Change type:** Add.
* **Location:** Brand-new file.
* **Dependencies:** Requires `engine` from `db` and `Location` from `models`.

### The New Code

```python
from sqlalchemy.orm import Session
from db import engine
from models import Location, Base

def seed_locations():
    Base.metadata.create_all(engine)
    
    with Session(engine) as session:
        hq = Location(name="Northeast HQ", region="NE")
        session.add(hq)
        session.flush() 
        
        zone = Location(name="Zone A", region="NE", parent_id=hq.id)
        session.add(zone)
        
        session.commit()
        print(f"Inserted: {hq.name} (ID {hq.id}) and {zone.name} (ID {zone.id})")

if __name__ == "__main__":
    seed_locations()

```

### The Updated Project

Because this is a new file, the block above is the complete `nexus/seed_orm.py`. This script bootstraps our table schema (if it doesn't exist) and uses the Unit of Work pattern to insert two linked records.

### Mechanical walkthrough

1. `from sqlalchemy.orm import Session`: (First appearance). Imports the Session factory.
2. `from db import engine`: (Already established syntax).
3. `from models import Location, Base`: (Already established syntax).
4. `Base.metadata.create_all(engine)`: (First appearance). Looks at all classes inheriting from `Base` and automatically issues `CREATE TABLE` statements for any that do not yet exist in the database.
5. `with Session(engine) as session:`: (First appearance). Opens a context manager. This automatically checks out a connection from the `engine` pool and wraps everything inside it in a database transaction.
6. `hq = Location(...)`: (Already established syntax). Instantiates a transient object.
7. `session.add(hq)`: (First appearance). Places `hq` in the Pending state.
8. `session.flush()`: (First appearance). This is a critical ORM concept. `flush()` writes the Pending SQL statements to the database *without* committing the transaction. We must do this because SQLite generates the `hq.id` upon insert, and we need that `hq.id` immediately to assign it to the `zone`'s `parent_id`.
9. `zone = Location(..., parent_id=hq.id)`: Uses the newly fetched ID from the flush.
10. `session.add(zone)`: Stages the child record.
11. `session.commit()`: (First appearance). Finalizes the transaction. If anything had crashed before this line, the `flush` would be rolled back, and the database would remain untouched.

### CS Lens

**The Unit of Work and Identity Map.** The `Session` implements two major CS patterns. *Unit of Work* tracks all changes (inserts, updates, deletes) in memory and dispatches them in one highly efficient batch upon commit. *Identity Map* guarantees that if you ask the Session for Location ID 1 twice, it returns the *exact same memory address* for the Python object both times, preventing your application from arguing with itself over an object's state.
*Also recognized in:* Git staging indexes (`git add` vs `git commit`), React's Virtual DOM reconciliation, and text editor in-memory buffers.

### SE Lens

Why not just `commit()` twice instead of using `flush()`? **Atomicity.** If we commit `hq`, and then the application crashes before committing `zone`, we have a partially created warehouse hierarchy in our production database. A transaction is a boundary of truth: it must succeed entirely, or fail entirely. By using `flush()`, we get the database-generated IDs we need to build the hierarchy, while keeping the atomic transaction un-committed until the very end.

### Commands needed to make this unit real

Execute the seed script.

```bash
python nexus/seed_orm.py

```

### Run it. Show the real output.

```text
Inserted: Northeast HQ (ID 1) and Zone A (ID 2)

```

### One sentence connecting this unit to what came immediately before.

We successfully inserted a parent and child using integer foreign keys, but writing `parent_id=hq.id` is manual and requires us to flush constantly to juggle IDs.

---

## Concept Unit: ORM Relationships

### The Problem

If we load `Zone A` from the database, it has a `.parent_id` attribute holding the integer `1`. But if we want to print the parent's actual name, we have to write a second query to fetch `Location` where ID is `1`. We want to simply type `zone.parent.name` and have SQLAlchemy navigate the graph for us.

### Introduce the concept in isolation

Create `lab_rel.py` to see how relationships map objects together.

```python
from sqlalchemy import ForeignKey, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase): pass
class Folder(Base):
    __tablename__ = "folders"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("folders.id"))
    
    # The magical object-oriented link
    parent: Mapped["Folder"] = relationship(remote_side=[id])

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    root = Folder(name="Root")
    # Instead of flushing for IDs, we assign the OBJECT directly
    sub = Folder(name="Subfolder", parent=root) 
    session.add(sub)
    session.commit()
    
    print(f"Subfolder's parent name: {sub.parent.name}")

```

Run it:

```bash
python lab_rel.py

```

Output:

```text
Subfolder's parent name: Root

```

*What this proves:* By defining a `relationship()`, we bypass foreign key integer juggling entirely. We assign the `root` object directly to the `parent` attribute. SQLAlchemy analyzes this, automatically infers the foreign key dependency, figures out the correct insertion order, issues the flush to get the ID itself, and links them perfectly.

### Discard the throwaway example

Delete `lab_rel.py`. We will now map the parent-child relationship onto our real `Location` model.

### Project Change

We will update `nexus/models.py` to add bidirectional relationship properties to the `Location` class.

* **Files affected:** `nexus/models.py`.
* **Change type:** Modify.
* **Location:** At the bottom of the `Location` class definition.
* **Dependencies:** Requires importing `relationship`.

### The New Code

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

    parent: Mapped["Location | None"] = relationship(
        remote_side="Location.id", 
        back_populates="children"
    )
    children: Mapped[list["Location"]] = relationship(
        back_populates="parent"
    )

```

### The Updated Project

Here is the fully reconstructed `Location` class in `nexus/models.py`, showing the relationship definitions placed directly beneath the database columns.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

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
    
    # ← new: Object-oriented traversal links
    parent: Mapped["Location | None"] = relationship(
        remote_side="Location.id", 
        back_populates="children"
    )
    children: Mapped[list["Location"]] = relationship(
        back_populates="parent"
    )

```

The `Location` object now supports bidirectional traversal: from a child you can access `parent`, and from a parent you can iterate over `children`.

### Mechanical walkthrough

1. `from sqlalchemy.orm import ..., relationship`: (First appearance). Imports the function that connects models together based on foreign keys.
2. `parent: Mapped["Location | None"]`: (Already established syntax). The `"` quotes around the class name act as a "forward reference." Because the `Location` class is not finished defining itself when this line runs, Python would crash if we typed `Mapped[Location]`. The quotes defer evaluation.
3. `= relationship(...)`: (First appearance). Instructs SQLAlchemy that this is a synthetic property, not a physical column in SQLite.
4. `remote_side="Location.id"`: (First appearance). A requirement strictly for self-referential relationships. It tells SQLAlchemy which side of the relationship represents the "parent" or the "target" being pointed to.
5. `back_populates="children"`: (First appearance). Synchronizes the object state in memory. If you assign `zone.parent = hq`, SQLAlchemy will instantly append `zone` to `hq.children` in Python memory, keeping both sides of the graph accurate without needing to query the database again.
6. `children: Mapped[list["Location"]]`: (First appearance). Type-hints that a parent can have multiple children, returning a list of `Location` objects.
7. `back_populates="parent"`: The other end of the bidirectional sync.

### CS Lens

**Graph Modeling over Relational Sets.** SQL models data as sets (tables) and intersections (joins). Object-Oriented Programming models data as graphs (nodes pointing to other nodes via memory addresses). `relationship()` is the core translation mechanism between set theory and graph theory. It hides the set intersection logic, projecting an illusion of an infinitely connected graph into Python memory.

### SE Lens

Notice that `relationship()` fields are omitted from our Pydantic `LocationCreate` schema from Lesson 3. Why? **Boundary Separation.** The API payload just provides `{"parent_id": 1}`. Translating that raw integer into a complex graph of linked Python objects is the strict responsibility of the ORM. If we tried to make Pydantic validate complete object trees, our API endpoints would require massive, deeply nested JSON payloads just to create one aisle.

### Commands needed to make this unit real

No commands needed; structural change only.

### One sentence connecting this unit to what came immediately before.

We can now seamlessly iterate through `location.children` using a Python `for` loop, but doing so hides a massive performance vulnerability.

---

## Concept Unit: Eager Loading and the N+1 Bug

### The Problem

When you execute a query to find a location, SQLAlchemy returns it. However, it does *not* fetch its `.children` immediately, because that would waste memory if you didn't need them. This is called "lazy loading". But if you run a query that returns 100 zones, and write `for zone in zones: print(zone.children)`, SQLAlchemy will pause the loop, reach out to SQLite, execute a brand new `SELECT` query to find that specific zone's children, and resume. It does this 100 times. This is the infamous N+1 query problem: 1 query to get the zones, plus N queries for their children.

### Introduce the concept in isolation

Create `lab_n1.py` to see the N+1 problem emit devastating amounts of SQL.

```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, joinedload
from models import Location

# We use echo=True to see the exact SQL generated
engine = create_engine("sqlite:///nexus/nexus.db", echo=True)

with Session(engine) as session:
    print("\n--- TEST 1: LAZY LOADING (The N+1 Bug) ---")
    # Fetch all locations that have a parent (e.g., our Zone A)
    locations = session.scalars(select(Location).where(Location.parent_id.isnot(None))).all()
    
    for loc in locations:
        # Accessing .parent triggers a hidden SQL query!
        print(f"Location: {loc.name}, Parent: {loc.parent.name}")

```

Run it:

```bash
python lab_n1.py

```

Output:

```text
--- TEST 1: LAZY LOADING (The N+1 Bug) ---
INFO sqlalchemy.engine.Engine SELECT locations.id, locations.name, locations.region, locations.parent_id FROM locations WHERE locations.parent_id IS NOT NULL
INFO sqlalchemy.engine.Engine [generated in 0.0001s] ()

INFO sqlalchemy.engine.Engine SELECT locations.id AS locations_id, locations.name AS locations_name, locations.region AS locations_region, locations.parent_id AS locations_parent_id FROM locations WHERE locations.id = ?
INFO sqlalchemy.engine.Engine [generated in 0.0001s] (1,)
Location: Zone A, Parent: Northeast HQ

```

*What this proves:* The `echo=True` output shows two separate `SELECT` statements were generated. If the first query had returned 1,000 zones, we would have seen 1,001 `SELECT` statements flood the terminal.

### Discard the throwaway example

Delete `lab_n1.py`. We will permanently protect our `Location` model from this bug.

### Project Change

We will update `nexus/models.py` to define an "eager loading" strategy on the `children` relationship, commanding SQLAlchemy to always fetch them efficiently in a single batch.

* **Files affected:** `nexus/models.py`.
* **Change type:** Modify.
* **Location:** The `children` relationship inside the `Location` class.
* **Dependencies:** None.

### The New Code

```python
    children: Mapped[list["Location"]] = relationship(
        back_populates="parent",
        lazy="selectin"
    )

```

### The Updated Project

Here is the final state of the `Location` model in `nexus/models.py`, with the loading strategy applied.

```python
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
    # ← new: Eager loading strategy added
    children: Mapped[list["Location"]] = relationship(
        back_populates="parent",
        lazy="selectin" 
    )

```

Whenever a `Location` is retrieved, SQLAlchemy will now automatically execute exactly one additional optimized query to fetch all of its children simultaneously.

### Mechanical walkthrough

1. `lazy="selectin"`: (First appearance). A keyword argument passed to `relationship()`. It overrides the default behavior (`lazy="select"`, which causes the N+1 bug). The `"selectin"` strategy commands SQLAlchemy to emit a single additional query using a SQL `IN` clause.

**Execution trace for fetching 100 locations with `lazy="selectin"`:**

```text
Step 1: Session executes main query.
  SQL: SELECT * FROM locations WHERE region = 'NE';
  Returns: [Location(ID=1), Location(ID=2), ..., Location(ID=100)]
Step 2: SQLAlchemy intercepts the return and extracts the IDs.
  IDs: (1, 2, ..., 100)
Step 3: Session automatically executes ONE eager batch query.
  SQL: SELECT * FROM locations WHERE parent_id IN (1, 2, ..., 100);
  Returns: All child locations for all 100 parents.
Step 4: SQLAlchemy links them in memory. N+1 is defeated. Total queries: 2.

```

### CS Lens

**Batching and Prefetching.** This is a classical systems optimization. Network/Disk latency is the enemy. Issuing 100 small requests taking 10ms each blocks the thread for 1000ms. Issuing 1 large request for 100 items takes perhaps 15ms. By using `selectin`, we are instructing the ORM to prefetch the data boundary we anticipate needing.
*Also recognized in:* CPU cache lines prefetching adjacent memory addresses, GraphQL DataLoaders batching nested resolver queries, and HTTP/2 multiplexing.

### SE Lens

Why not use `lazy="joined"`? `joinedload` uses a SQL `JOIN` to fetch everything in one massive query instead of two. However, `joinedload` produces a Cartesian product. If a warehouse has 1,000 bins, the resulting table repeats the warehouse's name and region data 1,000 times, wasting memory and network bandwidth. `selectin` fetches the parents (Query 1), then fetches the bins (Query 2), returning exactly the data needed with zero duplication. `selectin` is the modern default for One-to-Many collections in SQLAlchemy 2.0.

### Commands needed to make this unit real

No commands needed; the model behavior is now fundamentally altered.

### One sentence connecting this unit to what came immediately before.

With object relationships defined and optimized, we now have a complete, high-performance schema ready to be connected to the Pydantic boundaries we built earlier.

---

## Closing

**Connect the pieces**
To build a warehouse layout: we instantiate the parent `Location(name="HQ")`. We instantiate a child `Location(name="Aisle 1")`. We link them in memory simply by writing `aisle.parent = hq`. We add `hq` to a `Session` and `commit()`. The Session calculates the `ForeignKey` dependency, realizes `hq` must exist before `aisle`, flushes `hq` to the SQLite engine via our `WAL`-enabled connection, retrieves the database-generated ID, injects it into `aisle.parent_id`, and flushes `aisle`. When we later query `hq`, the `lazy="selectin"` configuration guarantees that `hq.children` will be populated instantly without triggering an N+1 performance collapse.

**What breaks without this**
Remove `lazy="selectin"` from `models.py` and run a script that pulls 50,000 inventory locations out of the database and loops through them to print their children's names. With `selectin`, this takes less than a second (2 queries). Without it, SQLAlchemy will emit 50,001 individual `SELECT` queries to SQLite. In an embedded SQLite database, this will lock the thread for several seconds. If this were a network-connected database like PostgreSQL, the network latency of 50,000 round-trips would literally crash the API request via a timeout.

**Exercises**

1. In a new scratchpad file, write a script that opens a `Session`, uses `session.scalars(select(Location)).all()` to get all locations, and iterates through them printing `loc.name`. Check your terminal output—how many queries fired?
2. Look up the `lazy="noload"` strategy in the SQLAlchemy documentation. When might it be beneficial to use it instead of `"selectin"`?

**Definition of Done**

* [x] A `seed_orm.py` script successfully demonstrates Unit of Work object staging and commits.
* [x] Bidirectional `relationship()` properties are defined on the `Location` model.
* [x] The `lazy="selectin"` optimization is applied to prevent the N+1 Query bug on collections.
* [x] You can commit these changes with the message: `feat: configure eager relationships and demonstrate session management`.