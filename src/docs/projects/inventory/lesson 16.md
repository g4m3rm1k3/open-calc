# Lesson 16: Many-to-Many Relationships and Association Tables

**What you will build**
You will build a logistics manifest system allowing multiple physical `Item` units to be grouped into a single outbound `Shipment`. The problem we are solving is the limitations of hierarchical ownership: an item physically belongs to one location (One-to-Many), but over its lifetime, an item can be part of many historical shipments, and a shipment obviously contains many items. We must construct a Many-to-Many (M2M) graph.

**What you need to know first**
From Lesson 4: `Mapped` columns and `ForeignKey`. From Lesson 5: `relationship()` and `lazy="selectin"`. From Lesson 10: Alembic migrations.

**The Pipeline**
`Client Request → Pydantic (Validation) → [ SQLAlchemy (ORM) ] → [ SQLite (Storage) ]`

This lesson spans the ORM and Storage layers. We will fundamentally alter how SQLite maps relationships by introducing a new physical table type, and we will instruct the SQLAlchemy ORM on how to silently traverse it.

---

## Concept Unit: The Core Association Table

### The Problem

If we add a `shipment_id` column to the `items` table, an item can only belong to exactly one shipment. If we add an `item_serial` column to the `shipments` table, a shipment can only contain exactly one item. Relational databases do not support arrays/lists natively. To connect Many to Many, we must create a third, invisible bridge table that holds nothing but pairs of foreign keys.

### Introduce the concept in isolation

Create `lab_m2m_table.py` to observe how a bridge table links two separate entities in raw SQL.

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON;")

# 1. Create the two primary tables
conn.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);")
conn.execute("CREATE TABLE classes (id INTEGER PRIMARY KEY, title TEXT);")

# 2. Create the Association (Bridge) Table
conn.execute("""
    CREATE TABLE student_classes (
        student_id INTEGER REFERENCES students(id),
        class_id INTEGER REFERENCES classes(id),
        PRIMARY KEY (student_id, class_id)
    );
""")

conn.execute("INSERT INTO students VALUES (1, 'Alice');")
conn.execute("INSERT INTO classes VALUES (99, 'Physics');")

# 3. Link them by inserting into the bridge
conn.execute("INSERT INTO student_classes VALUES (1, 99);")

# 4. Prove the link by traversing the bridge
cursor = conn.execute("""
    SELECT students.name, classes.title 
    FROM students 
    JOIN student_classes ON students.id = student_classes.student_id
    JOIN classes ON classes.id = student_classes.class_id;
""")
print(f"Join Result: {cursor.fetchone()}")

```

Run it:

```bash
python lab_m2m_table.py

```

Output:

```text
Join Result: ('Alice', 'Physics')

```

*What this proves:* The `student_classes` table is purely structural. It doesn't contain names or titles; it only contains relational edges. By enforcing a composite `PRIMARY KEY` on both columns, it mathematically guarantees that Alice cannot be enrolled in Physics twice.

### Discard the throwaway example

Delete `lab_m2m_table.py`. We will now construct the `shipment_items` bridge in our ORM registry.

### Project Change

We will define the association table at the top of our models file using SQLAlchemy Core, rather than standard ORM classes.

* **Files affected:** `nexus/models.py`.
* **Change type:** Modify.
* **Location:** Near the top of the file, just below the `Base` class definition.
* **Dependencies:** Requires importing `Table` and `Column` from `sqlalchemy`.

### The New Code

```python
from sqlalchemy import Table, Column

shipment_items = Table(
    "shipment_items",
    Base.metadata,
    Column("shipment_id", ForeignKey("shipments.id"), primary_key=True),
    Column("item_serial", ForeignKey("items.serial_number"), primary_key=True),
)

```

### The Updated Project

Here is the upper section of `nexus/models.py` with the new association table defined. It sits freely outside of any class.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, func, Float
from sqlalchemy import Table, Column

class Base(DeclarativeBase):
    pass

# ← new: The invisible bridge table linking Shipments and Items
shipment_items = Table(
    "shipment_items",
    Base.metadata,
    Column("shipment_id", ForeignKey("shipments.id"), primary_key=True),
    Column("item_serial", ForeignKey("items.serial_number"), primary_key=True),
)

class SKU(Base):
# ... (rest of models remain unchanged)

```

SQLAlchemy's metadata registry is now aware that a physical table named `shipment_items` must exist in SQLite.

### Mechanical walkthrough

1. `from sqlalchemy import Table, Column`: (First appearance). Imports Core schema constructs. Unlike `Mapped` (which defines class properties), these define raw database shapes directly.
2. `shipment_items = Table(...)`: (First appearance). Instantiates a standalone table object.
3. `"shipment_items"`: (Basic syntax). The literal string name of the table in SQLite.
4. `Base.metadata`: (Already established syntax). Binds this standalone table to our global registry so Alembic and `create_all()` know it exists.
5. `Column("shipment_id", ForeignKey("shipments.id"), primary_key=True)`: (First appearance). The Core equivalent of `mapped_column`. It defines a column that points to the (soon-to-be-created) `shipments` table.
6. `primary_key=True`: (Already established syntax). Because we set this on *both* columns, SQLAlchemy generates a Composite Primary Key, exactly like our raw SQL lab, guaranteeing uniqueness of the pair.

### CS Lens

**Graph Edges vs. Nodes.** In graph theory, `Item` and `Shipment` are Nodes (vertices). They contain state, data, and identity. The `shipment_items` table is an Edge. In a pure Many-to-Many relationship, the edge has no data of its own; it merely defines the connection. By using a Core `Table` instead of an ORM `class`, we explicitly signal to the system that this object has no domain behavior—it is purely a structural edge.

### SE Lens

Why use a Core `Table` instead of creating an `class ShipmentItem(Base)` ORM model? **The Association Object Pattern.** If you need to store data *on the link itself*—like `quantity_scanned` or `scanned_by_user_id`—you *must* use an ORM model (the Association Object Pattern). If the link is purely structural with no extra data (like ours), a Core `Table` is significantly faster and allows SQLAlchemy to completely hide the bridge table from your Python code, as we will see in the next unit.

### Commands needed to make this unit real

No commands needed yet; we must define the `Shipment` table before we can generate the migration.

### One sentence connecting this unit to what came immediately before.

The physical bridge exists in the metadata, but if we query a shipment, we want Python to magically return a list of items without us having to write complex SQL `JOIN` statements across that bridge.

---

## Concept Unit: The Secondary ORM Relationship

### The Problem

If we create a `Shipment` model, we want to be able to type `shipment.items` and receive a Python list of `Item` objects. Because they are not directly connected by a single foreign key, the standard `relationship()` we learned in Lesson 5 will crash, unable to find the connection.

### Introduce the concept in isolation

Create `lab_secondary.py` to see how the ORM traverses a bridge table automatically.

```python
from sqlalchemy import create_engine, ForeignKey, Column, Table
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase): pass

bridge = Table("bridge", Base.metadata,
    Column("a_id", ForeignKey("table_a.id"), primary_key=True),
    Column("b_id", ForeignKey("table_b.id"), primary_key=True)
)

class TableA(Base):
    __tablename__ = "table_a"
    id: Mapped[int] = mapped_column(primary_key=True)
    # The crucial parameter: secondary=bridge
    bs: Mapped[list["TableB"]] = relationship(secondary=bridge)

class TableB(Base):
    __tablename__ = "table_b"
    id: Mapped[int] = mapped_column(primary_key=True)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    a_obj = TableA(id=1)
    b_obj1 = TableB(id=10)
    b_obj2 = TableB(id=20)
    
    # We append to the list in Python; SQLAlchemy handles the bridge table!
    a_obj.bs.append(b_obj1)
    a_obj.bs.append(b_obj2)
    session.add(a_obj)
    session.commit()
    
    # Prove the traversal works
    fetched_a = session.get(TableA, 1)
    print(f"TableA linked to TableB IDs: {[b.id for b in fetched_a.bs]}")

```

Run it:

```bash
python lab_secondary.py

```

Output:

```text
TableA linked to TableB IDs: [10, 20]

```

*What this proves:* The `secondary=` argument instructs SQLAlchemy to intercept any operations on the `bs` list. When we append to the list, the ORM automatically generates the `INSERT INTO bridge` statements. When we read the list, the ORM automatically generates the `JOIN` statements. The bridge table becomes entirely invisible to the Python application layer.

### Discard the throwaway example

Delete `lab_secondary.py`. We will now build the `Shipment` model and update `Item`.

### Project Change

We will append the new `Shipment` model to `models.py`, and we will modify the existing `Item` model to establish a bidirectional link.

* **Files affected:** `nexus/models.py`.
* **Change type:** Modify.
* **Location:** At the bottom of the file (Shipment), and inside the `Item` class.
* **Dependencies:** None.

### The New Code

**1. Modify the existing `Item` class:**

```python
class Item(Base):
    __tablename__ = "items"
    serial_number: Mapped[str] = mapped_column(String(50), primary_key=True)
    sku_id: Mapped[str] = mapped_column(ForeignKey("skus.sku_id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    
    # ← new: The reverse link back to shipments
    shipments: Mapped[list["Shipment"]] = relationship(
        secondary=shipment_items,
        back_populates="items"
    )

```

**2. Append the new `Shipment` class to the bottom of the file:**

```python
class Shipment(Base):
    __tablename__ = "shipments"
    id: Mapped[int] = mapped_column(primary_key=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    
    # ← new: The forward link traversing the bridge table
    items: Mapped[list["Item"]] = relationship(
        secondary=shipment_items,
        back_populates="shipments",
        lazy="selectin"
    )

```

### The Updated Project

Because we modified one block and added another, ensure your `nexus/models.py` file aligns with this structure. The `Item` class now knows about `shipments`, and the new `Shipment` class knows about `items`.

```python
# ... (Base, shipment_items, SKU, Location remain unchanged) ...

class Item(Base):
    __tablename__ = "items"
    serial_number: Mapped[str] = mapped_column(String(50), primary_key=True)
    sku_id: Mapped[str] = mapped_column(ForeignKey("skus.sku_id"))
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    
    shipments: Mapped[list["Shipment"]] = relationship(
        secondary=shipment_items,
        back_populates="items"
    )

class Movement(Base):
    # ... (remains unchanged)

# ← new: The Manifest entity
class Shipment(Base):
    __tablename__ = "shipments"
    id: Mapped[int] = mapped_column(primary_key=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("locations.id"))
    
    items: Mapped[list["Item"]] = relationship(
        secondary=shipment_items,
        back_populates="shipments",
        lazy="selectin"
    )

```

### Mechanical walkthrough

1. *(In Item & Shipment)* `shipments: Mapped[list["Shipment"]]`: (Already established syntax). Type-hints that one item can have a list of shipments.
2. `relationship(...)`: (Already established syntax).
3. `secondary=shipment_items`: (First appearance). The pivotal configuration. It passes the literal `Table` object we created in the previous unit. It tells SQLAlchemy: "To populate this list, do not look for a foreign key on the `items` table. Instead, look inside `shipment_items`."
4. `back_populates="items"` / `"shipments"`: (Already established syntax). Ensures that appending an item to `shipment.items` automatically appends the shipment to `item.shipments` in Python memory.
5. `lazy="selectin"`: (Hard concept reappearing: N+1 Prevention from Lesson 5). M2M relationships are notorious for causing massive N+1 queries. By adding this to `Shipment`, whenever we load a batch of 50 shipments, SQLAlchemy will fetch all corresponding items for all 50 shipments in a single, optimized SQL `IN` query.

### CS Lens

**Network Topologies.** A One-to-Many relationship forms a strictly hierarchical Tree. A Many-to-Many relationship forms a fully connected Mesh topology. Navigating a mesh is computationally expensive because queries require multiple intersections (joins). By abstracting this complexity behind `relationship(secondary=...)`, the ORM allows us to treat a complex mesh network as if it were a simple collection of Python lists.

### SE Lens

Notice we didn't put `lazy="selectin"` on the `Item.shipments` side. Why? **Memory Tsunamis.** If you eager-load the items on a shipment, it loads maybe 10-50 objects. Safe. If you eager-load all historical shipments every time you look up a single `Item`, and that item has moved 100 times over 5 years, you silently pull hundreds of records into memory just to check the item's current location. We eager-load only on the side of the relationship where the data boundary is constrained and immediately necessary.

### Commands needed to make this unit real

Because we added a new table and altered an existing model, we must use Alembic to update the physical SQLite file.

```bash
alembic revision --autogenerate -m "add shipments m2m"
alembic upgrade head

```

### Run it. Show the real output.

```text
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.autogenerate.compare] Detected added table 'shipments'
INFO  [alembic.autogenerate.compare] Detected added table 'shipment_items'
  Generating /nexus/alembic/versions/7a8b9c0d1e2f_add_shipments_m2m.py ...  done

INFO  [alembic.runtime.migration] Running upgrade 1234abcd -> 7a8b9c0d1e2f, add shipments m2m

```

### One sentence connecting this unit to what came immediately before.

With the schema migrated and the ORM perfectly trained to navigate the bridge table, we can now write a single Python function to mutate the entire graph.

---

## Concept Unit: M2M Mutations via the CRUD Layer

### The Problem

When a user submits a manifest via the API, they will send a JSON payload like `{"destination_id": 5, "item_serials": ["A1", "B2"]}`. We need to validate this inbound payload, query the database for the physical `Item` objects that match those string serials, and assign them to a new `Shipment` object.

### Introduce the concept in isolation

Create `lab_in.py` to observe how SQLAlchemy queries a list of items using the `.in_()` operator, which is required to fetch M2M target nodes efficiently.

```python
from sqlalchemy import select, create_engine
from sqlalchemy.orm import Session
from models import Item, Base

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # Seed data
    session.add_all([
        Item(serial_number="A1", sku_id="X", location_id=1),
        Item(serial_number="B2", sku_id="Y", location_id=1),
        Item(serial_number="C3", sku_id="Z", location_id=1)
    ])
    session.commit()
    
    # The client payload provides a list of strings
    payload_serials = ["A1", "B2", "MISSING-99"]
    
    # Use the .in_() operator to fetch all matches in one query
    query = select(Item).where(Item.serial_number.in_(payload_serials))
    found_items = session.scalars(query).all()
    
    print(f"Requested {len(payload_serials)} items.")
    print(f"Database found {len(found_items)} items.")
    print(f"Found IDs: {[item.serial_number for item in found_items]}")

```

Run it:

```bash
python lab_in.py

```

Output:

```text
Requested 3 items.
Database found 2 items.
Found IDs: ['A1', 'B2']

```

*What this proves:* The `.in_()` operator compiles to a SQL `WHERE ... IN (x, y)` clause. It efficiently retrieves multiple records, but it silently ignores requested IDs that do not exist in the database. Our CRUD logic must account for this discrepancy.

### Discard the throwaway example

Delete `lab_in.py`. We will now construct the strict schemas and the CRUD function.

### Project Change

We will add a new Command payload to `schemas.py` and the corresponding creation logic to `crud.py`.

* **Files affected:** `nexus/schemas.py` and `nexus/crud.py`.
* **Change type:** Modify.
* **Location:** At the bottom of both files.
* **Dependencies:** Requires `Shipment` from models.

### The New Code

**1. Append to `nexus/schemas.py`:**

```python
class ShipmentCreate(BaseModel):
    destination_id: int
    item_serials: list[str] = Field(min_length=1)

```

**2. Append to `nexus/crud.py`:**

```python
from models import Shipment

def create_shipment(session: Session, payload: ShipmentCreate) -> Shipment:
    # 1. Fetch the items from the database
    query = select(Item).where(Item.serial_number.in_(payload.item_serials))
    items = session.scalars(query).all()
    
    # 2. Assert data integrity
    if len(items) != len(payload.item_serials):
        raise ValueError("One or more serial numbers do not exist in the database.")
    
    # 3. Construct the shipment and leverage M2M assignment
    new_shipment = Shipment(
        destination_id=payload.destination_id,
        items=items  # SQLAlchemy populates the bridge table automatically!
    )
    
    session.add(new_shipment)
    session.commit()
    
    return new_shipment

```

### The Updated Project

The smallest enclosing structures are the standalone schema and function. Ensure these are cleanly appended to the bottoms of `schemas.py` and `crud.py`.

### Mechanical walkthrough

1. *(In schemas.py)* `item_serials: list[str]`: (Already established syntax). Type-hints an array of strings.
2. `= Field(min_length=1)`: (Already established syntax). Prevents the API from accepting a shipment with zero items in it.
3. *(In crud.py)* `def create_shipment(...)`: (Basic syntax).
4. `Item.serial_number.in_(payload.item_serials)`: (First appearance). Generates the SQL `IN` clause using the validated list from Pydantic.
5. `if len(items) != len(payload.item_serials):`: (Basic syntax). The critical business logic guard. Because `.in_()` silently drops missing records, we must compare the length of the result list against the length of the requested list to ensure absolute fidelity.
6. `raise ValueError(...)`: (Already established syntax). Triggers a rollback and returns a 404/400 error to the client via our API router.
7. `items=items`: (First appearance). We assign the Python `list` of ORM objects directly into the constructor. Because of `relationship(secondary=...)`, SQLAlchemy intercepts this assignment, generates the `INSERT INTO shipments`, captures the new `shipment.id`, and automatically generates the multiple `INSERT INTO shipment_items` queries required to link everything together atomically.

### CS Lens

**Declarative State Mutation.** In older paradigms, persisting a Many-to-Many relationship required imperative programming: saving the parent, manually extracting its ID, iterating over the children with a `for` loop, and explicitly executing SQL inserts for each child into the bridge table. SQLAlchemy allows Declarative State Mutation: you simply arrange the Python objects in RAM exactly how you want them (`new_shipment.items = items`), and the Unit of Work engine calculates the exact sequence of SQL DML statements required to make the database match RAM.

### SE Lens

What is a vulnerability in `len(items) != len(payload)`? **Duplicate requests.** If a client sends `payload.item_serials = ["A1", "A1"]`, the list length is 2. The database query `.in_(["A1", "A1"])` will return exactly 1 item (`"A1"`). The length check will fail (`1 != 2`), crashing the request, which is actually the correct behavior (you cannot ship the same item twice). However, to be perfectly robust, Pydantic offers a `Set` type instead of `list`, which automatically deduplicates client input at the validation boundary, preventing this edge case entirely.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

With the domain logic capable of flawlessly traversing and mutating the association table, exposing this capability to the frontend requires only a standard FastAPI endpoint.

---

## Closing

**Connect the pieces**
To build an outbound manifest: A client submits JSON `{"destination_id": 9, "item_serials": ["X", "Y"]}`. Pydantic parses this into `ShipmentCreate` (Lesson 16). The CRUD layer uses `.in_()` to locate physical `Item` ORM models (Lesson 16) and assigns them to the `Shipment` ORM model. When `session.commit()` executes (Lesson 5), SQLAlchemy relies on the Core `Table` definition (`shipment_items`) we mapped via the `secondary=` relationship argument (Lesson 16) to automatically issue the precise `INSERT` commands bridging the two entities in SQLite. Because the tables were structurally bound by Alembic (Lesson 10), relational integrity is guaranteed.

**What breaks without this**
If you removed the `if len(items) != len(...)` check in the CRUD layer, a client could request to ship 50 items, but if they mistyped one serial number, the database would silently build a shipment containing only 49 items. The API would return a `200 OK` success message, the physical pallet would leave the warehouse with 50 items, but the digital ledger would only track 49, resulting in permanent, untraceable inventory drift.

**Exercises**

1. Add an endpoint to `main.py` that listens on `@app.post("/shipments")`, takes `ShipmentCreate` as a payload, and executes `crud.create_shipment`. (Use the exact same pattern we built for `/items/{serial}/move` in Lesson 12).
2. Look back at Lesson 7 (`move_item`). When an item is placed in a `Shipment`, its physical location technically changes. Modify `crud.create_shipment` to iterate over the `items` list and update `item.location_id = payload.destination_id` before committing, ensuring the physical location graph stays synchronized with the outbound manifest.

**Definition of Done**

* [x] Core `Table` created to define the structural M2M graph edge.
* [x] ORM `relationship(secondary=)` configures invisible traversal of the edge.
* [x] `Item` and `Shipment` tables migrated to the SQLite schema via Alembic.
* [x] `.in_()` operator utilized to retrieve array boundaries safely.
* [x] You can commit these changes with the message: `feat: implement many-to-many shipment manifests using association tables`.