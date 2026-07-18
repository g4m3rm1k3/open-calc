# Lesson 4: Object-Relational Mapping with SQLAlchemy

**What you will build**
You will build the bridge between the Python application and the SQLite database using SQLAlchemy 2.0. The problem we are solving is the cognitive and structural friction of context-switching: we want our Python application to interact with database records as stateful Python objects, rather than assembling raw SQL strings and parsing tuples of raw data.

**What you need to know first**
From Lesson 1: `STRICT` SQLite tables and `PRAGMA` commands. From Lesson 3: Type hinting syntax like `int | None` and Python class inheritance.

**The Pipeline**
`Client Request → Pydantic (Validation) → [ SQLAlchemy (ORM) ] → SQLite (Storage)`

In this lesson, we build the **SQLAlchemy (ORM)** stage. When a fully validated Pydantic `SKUCreate` object arrives from the previous stage, we need to map its fields into an ORM object. SQLAlchemy will then automatically translate that object into the exact `INSERT INTO skus ...` SQL strings that the SQLite engine (Lesson 1) expects, executing them safely.

---

## Concept Unit: The Declarative Base and Mapped Columns

### The Problem

If we execute a raw SQL query `SELECT sku_id, name FROM skus`, SQLite returns a tuple: `("BOLT-10", "10mm Bolt")`. Tuples don't have named attributes, so you have to remember that index `[0]` is the ID and `[1]` is the name. If the schema changes, all your index-based code breaks. We need rows to be returned as Python classes where `sku.name` guarantees access to the correct column.

### Introduce the concept in isolation

Create `lab_mapping.py` to see how SQLAlchemy dynamically generates table metadata from Python class definitions.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String

# 1. Create the registry
class Base(DeclarativeBase):
    pass

# 2. Define a model mapping to a theoretical table
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50))

# 3. Prove SQLAlchemy understood the assignment
print("Table Name:", User.__tablename__)
print("Columns generated:")
for column in User.__table__.columns:
    print(f"- {column.name} (Type: {column.type}, Primary Key: {column.primary_key})")

```

Run it:

```bash
python lab_mapping.py

```

Output:

```text
Table Name: users
Columns generated:
- id (Type: INTEGER, Primary Key: True)
- username (Type: VARCHAR(50), Primary Key: False)

```

*What this proves:* By inheriting from `DeclarativeBase` and using `Mapped` type hints, we don't just create a Python class. We populate a hidden SQLAlchemy registry (`Base.metadata`) that automatically constructs the corresponding SQL Table objects behind the scenes.

### Discard the throwaway example

Delete `lab_mapping.py`. We will now define our real project models.

### Project Change

We will create the file that holds all our ORM schema definitions, starting with the Product Catalog (SKUs).

* **Files affected:** Create a new file `nexus/models.py`.
* **Change type:** Add.
* **Location:** Brand-new file.
* **Dependencies:** Requires installing `sqlalchemy`.

### The New Code

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String

class Base(DeclarativeBase):
    pass

class SKU(Base):
    __tablename__ = "skus"
    
    sku_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))

```

### The Updated Project

Because this is a brand-new file, the code block above represents the entirety of `nexus/models.py`. This file now acts as the authoritative Python-side mirror of the raw SQLite tables we defined in Lesson 1.

### Mechanical walkthrough

1. `from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column`: (First appearance). Imports the core structural components of SQLAlchemy 2.0's ORM pattern.
2. `from sqlalchemy import String`: (First appearance). Imports a SQL-specific data type representation.
3. `class Base(DeclarativeBase): pass`: (First appearance). Creates a base class that maintains a catalog (registry) of all classes that inherit from it. `pass` is used because we don't need to add custom methods to the base class yet.
4. `class SKU(Base):`: (First appearance). Defines a model representing a single row in the products catalog, registering it with `Base`.
5. `__tablename__ = "skus"`: (First appearance). A special SQLAlchemy attribute linking this Python class to the exact string name of the SQLite table we created in `init_db.py`.
6. `sku_id:`: (Already established syntax). The attribute name.
7. `Mapped[str]`: (First appearance). A generic type hint specific to SQLAlchemy 2.0. It signals to Python type-checkers (and your IDE) that "when I access `my_sku.sku_id`, it will be a string," while signaling to SQLAlchemy that "this attribute is backed by a database column."
8. `= mapped_column(...)`: (First appearance). The function that provides the actual database-level configuration for the column.
9. `String(20)`: (First appearance). Maps the column to a SQL `VARCHAR(20)` equivalent.
10. `primary_key=True`: (First appearance). Instructs the ORM that this column uniquely identifies the row, translating to the `PRIMARY KEY` SQL constraint.
11. `description: Mapped[str | None]`: (Hard concept repeating from Lesson 3). Uses the Python union operator `|` to indicate optionality. By seeing `| None`, SQLAlchemy automatically knows to configure this column as `NULL` allowed in the SQL schema.

### CS Lens

**The Active Record vs. Data Mapper Pattern.** By decoupling the row representation (`SKU`) from the database connection logic (which we will build next), SQLAlchemy implements the Data Mapper pattern. The `SKU` object itself has no `save()` method and doesn't know how to talk to SQLite. This keeps the in-memory domain model pure and highly testable, unlike the Active Record pattern (used in Django or Ruby on Rails) where every object actively holds a database connection.
*Also recognized in:* Hibernate (Java), Entity Framework (C#), and Doctrine (PHP).

### SE Lens

Why do we specify `String(20)` in `mapped_column` when SQLite `STRICT` mode (from Lesson 1) only cares about `TEXT` and ignores length limits? **Portability and Tooling.** SQLAlchemy is designed to be dialect-agnostic. While SQLite ignores the `20` length limit, explicitly defining it here allows SQLAlchemy migration tools (like Alembic) to properly generate schema migrations if we ever scale out of SQLite and port this system to PostgreSQL, which *does* enforce `VARCHAR(20)`.

### Commands needed to make this unit real

Install SQLAlchemy into your environment.

```bash
pip install sqlalchemy

```

### One sentence connecting this unit to what came immediately before.

We have successfully modeled the flat `skus` table, but our `locations` table is hierarchical and relies on a foreign key pointer to establish its tree structure.

---

## Concept Unit: ORM Foreign Keys

### The Problem

In Lesson 2, we built the Adjacency List pattern in raw SQL: `FOREIGN KEY(parent_id) REFERENCES locations(id)`. If we don't explicitly tell the ORM about this relational constraint, SQLAlchemy will treat `parent_id` as just a random integer, and it won't be able to enforce relational integrity or perform automated joins on the Python side.

### Introduce the concept in isolation

Create `lab_fk.py` to observe how SQLAlchemy constructs table relationships.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import ForeignKey

class Base(DeclarativeBase): pass

class Region(Base):
    __tablename__ = "regions"
    id: Mapped[int] = mapped_column(primary_key=True)

class Store(Base):
    __tablename__ = "stores"
    id: Mapped[int] = mapped_column(primary_key=True)
    # The ForeignKey explicitly names the target table and column
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"))

print("Store region_id column foreign keys:")
for fk in Store.__table__.c.region_id.foreign_keys:
    print(f"- Points to: {fk.target_fullname}")

```

Run it:

```bash
python lab_fk.py

```

Output:

```text
Store region_id column foreign keys:
- Points to: regions.id

```

*What this proves:* Wrapping a string pointer inside `ForeignKey()` inside `mapped_column()` successfully registers the relational constraint in SQLAlchemy's internal metadata graph, matching our SQLite setup.

### Discard the throwaway example

Delete `lab_fk.py`. We will now map our `locations` table.

### Project Change

We will add the `Location` class to our models file, implementing the self-referential foreign key.

* **Files affected:** `nexus/models.py`.
* **Change type:** Add.
* **Location:** Below the `SKU` class.
* **Dependencies:** Requires importing `ForeignKey`.

### The New Code

```python
from sqlalchemy import String, ForeignKey

class Location(Base):
    __tablename__ = "locations"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    region: Mapped[str] = mapped_column(String(10))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"))

```

### The Updated Project

Here is the updated `nexus/models.py` showing both ORM classes mapping our core entities.

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, ForeignKey

class Base(DeclarativeBase):
    pass

class SKU(Base):
    __tablename__ = "skus"
    
    sku_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))

# ← new: Location model mapped to our hierarchical table
class Location(Base):
    __tablename__ = "locations"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    region: Mapped[str] = mapped_column(String(10))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"))

```

The `Location` class is now fully defined, and SQLAlchemy understands that `parent_id` points back to another row within the same `locations` table.

### Mechanical walkthrough

1. `from sqlalchemy import ..., ForeignKey`: (First appearance). Imports the foreign key constraint construct.
2. `class Location(Base):`: (Already established syntax). Inherits from our central registry.
3. `__tablename__ = "locations"`: (Already established syntax). Links to our SQLite table.
4. `id: Mapped[int] = mapped_column(primary_key=True)`: (Already established syntax). Maps the integer ID column. In SQLAlchemy, integer primary keys automatically assume auto-increment behavior, matching SQLite perfectly.
5. `name: Mapped[str] = mapped_column(String(100))`: (Already established syntax). Maps the text column.
6. `region: Mapped[str] = mapped_column(String(10))`: (Already established syntax). Maps the text column.
7. `parent_id:`: (Already established syntax). The attribute name.
8. `Mapped[int | None]`: (Already established syntax). Declares this integer can be `NULL` (since top-level warehouses have no parent).
9. `= mapped_column(ForeignKey("locations.id"))`: (First appearance). The constraint mapping. Notice we pass the string `"locations.id"` (table name dot column name), *not* the Python class `Location.id`. This ensures there are no circular import errors if relationships span multiple files.

### CS Lens

**Referential Integrity.** A database without enforced foreign keys is just a spreadsheet. By defining this locally in the ORM, we empower SQLAlchemy to calculate dependency graphs. When we eventually tell SQLAlchemy to insert a batch of locations, it will analyze the `ForeignKey` constraints and automatically sort the `INSERT` statements to ensure that parent locations are inserted *before* the child locations that reference them.

### SE Lens

Notice we didn't add the `skus_fts` virtual table (from Lesson 2) to our models file. Why? **Separation of Read/Write paths.** `skus_fts` is an inverted index purely used for high-speed text searching; we don't insert data into it directly via ORM objects. Creating an ORM mapping for a virtual table causes heavy friction, as virtual tables lack primary keys and behave strangely. We deliberately leave `skus_fts` out of the ORM mapping and will query it using raw SQL core commands when needed.

### Commands needed to make this unit real

No commands needed; structural modeling code only.

### One sentence connecting this unit to what came immediately before.

Our Python classes perfectly mirror our SQLite tables, but they are currently floating in memory entirely disconnected from the actual database file.

---

## Concept Unit: The Engine and Connection Events

### The Problem

In Lesson 1, we wrote a `get_connection()` factory using Python's raw `sqlite3` module to manually connect to our file and execute two critical PRAGMAs: `journal_mode=WAL` and `foreign_keys=ON`. Now that we are switching to SQLAlchemy, we must replace that raw factory with a SQLAlchemy `Engine`—but we *must not lose* those PRAGMAs, or we lose concurrency and safety.

### Introduce the concept in isolation

Create `lab_engine.py` to see how SQLAlchemy's event system can intercept connections before they are handed to the application.

```python
from sqlalchemy import create_engine, event, text

# Create an in-memory SQLite engine
engine = create_engine("sqlite:///:memory:", echo=True)

# Listen for every time the engine makes a new connection to SQLite
@event.listens_for(engine, "connect")
def on_connect(dbapi_connection, connection_record):
    print(">>> INTERCEPTED CONNECTION! Injecting commands...")
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()

# Trigger a connection by running a basic query
with engine.connect() as conn:
    conn.execute(text("SELECT 1;"))

```

Run it:

```bash
python lab_engine.py

```

Output:

```text
>>> INTERCEPTED CONNECTION! Injecting commands...
2026-07-18 04:50:12,123 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-07-18 04:50:12,123 INFO sqlalchemy.engine.Engine SELECT 1;
2026-07-18 04:50:12,123 INFO sqlalchemy.engine.Engine [generated in 0.0001s] ()
2026-07-18 04:50:12,123 INFO sqlalchemy.engine.Engine ROLLBACK

```

*What this proves:* `create_engine` builds the connection pool. By attaching an `@event.listens_for` hook to the `"connect"` event, we grab the raw, underlying SQLite connection (`dbapi_connection`) the exact millisecond it is created, allowing us to execute PRAGMAs before the ORM even realizes it's connected. The `echo=True` flag proves SQLAlchemy is logging the SQL it emits.

### Discard the throwaway example

Delete `lab_engine.py`. We will now refactor our project's database module.

### Project Change

We will entirely rewrite `nexus/db.py` to use SQLAlchemy's `Engine`, mapping our real file and restoring our PRAGMAs using the event system.

* **Files affected:** `nexus/db.py`.
* **Change type:** Replace.
* **Location:** The entire file contents.
* **Dependencies:** None.

### The New Code

```python
import pathlib
from sqlalchemy import create_engine, event
from sqlalchemy.engine.interfaces import DBAPIConnection, ConnectionRecord

DB_PATH = pathlib.Path(__file__).parent / "nexus.db"

# The Engine is the central factory for connections
engine = create_engine(f"sqlite:///{DB_PATH}")

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection: DBAPIConnection, connection_record: ConnectionRecord):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()

```

### The Updated Project

Because this is a full replacement, the code block above represents the new entirety of `nexus/db.py`. We have upgraded from a simple raw `sqlite3` factory to a production-grade SQLAlchemy engine pool, without sacrificing our SQLite-specific engine optimizations.

*(Note: We will not run `init_db.py` anymore in future lessons, as SQLAlchemy handles table creation dynamically, but we leave the existing `nexus.db` file untouched).*

### Mechanical walkthrough

1. `import pathlib`: (Already established syntax).
2. `from sqlalchemy import create_engine, event`: (First appearance). Imports the core engine factory and the event listener system.
3. `from sqlalchemy.engine.interfaces import DBAPIConnection, ConnectionRecord`: (First appearance). Imports type hints for the underlying raw database connection objects, ensuring strict typing in our event hook.
4. `engine = create_engine(...)`: (First appearance). Instantiates the SQLAlchemy Engine. This object maintains a pool of connections and speaks the specific "dialect" of the target database.
5. `f"sqlite:///{DB_PATH}"`: (First appearance). The Database URL connection string. `sqlite:///` tells SQLAlchemy which dialect to use, and the absolute path follows.
6. `@event.listens_for(engine, "connect")`: (First appearance). A decorator that registers the function below it to fire every time the `engine` establishes a fresh connection to the database file.
7. `def set_sqlite_pragma(dbapi_connection: ..., connection_record: ...):`: (First appearance). The callback function. `dbapi_connection` is the raw `sqlite3.Connection` object from Python's standard library (the exact same object we worked with in Lesson 1).
8. `cursor = dbapi_connection.cursor()`: (First appearance). Creates a DBAPI cursor to execute raw SQL.
9. `cursor.execute("PRAGMA ...")`: (Already established syntax). Fires the Write-Ahead Logging and Foreign Key pragmas directly into the SQLite engine.
10. `cursor.close()`: (First appearance). Closes the temporary cursor cleanly.

### CS Lens

**The Adapter Pattern.** SQLAlchemy acts as an adapter. High-level application code speaks to SQLAlchemy using Python objects. SQLAlchemy's dialect engine translates this into SQL strings, and hands them to the DBAPI (the underlying driver, like `sqlite3` or `psycopg2` for PostgreSQL). The DBAPI executes it against the C-library binary of the database. The event listener we wrote explicitly punches through the ORM abstraction layer to talk directly to the DBAPI layer when necessary.

### SE Lens

Why use `create_engine` globally instead of putting it inside a function? **Connection Pooling.** Unlike our old `get_connection()` function which blindly opened a new file handle every time it was called, `create_engine` creates a "Connection Pool." It opens a handful of connections and keeps them alive in the background. When your app needs a connection, it borrows one from the pool. When it's done, it returns it instead of closing it. This drastically reduces the CPU overhead of establishing connections in high-traffic applications.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

With the Engine managing our database file and the Declarative Base managing our Python models, the two halves of our system are finally ready to be combined into active data manipulation.

---

## Closing

**Connect the pieces**
To trace a new product through what we've built: A JSON payload `{"sku_id": "M5-BOLT", "name": "M5 Hex Bolt"}` arrives. Pydantic parses and validates it using `SKUCreate` (Lesson 3). The application code takes that validated data and instantiates the ORM model we built today: `new_sku = SKU(sku_id="M5-BOLT", name="M5 Hex Bolt")`. When we command SQLAlchemy to save this object, it asks the `engine` for a connection. The engine opens `nexus.db`, fires the `"connect"` event hook to enable `WAL` and `foreign_keys`, and then translates our `new_sku` object into `INSERT INTO skus ...`, executing it perfectly against the `STRICT` table we built in Lesson 1.

**What breaks without this**
If you delete the `@event.listens_for` block from `nexus/db.py`, SQLAlchemy will still successfully connect to SQLite and issue `INSERT` statements. However, because SQLite defaults to foreign keys being OFF, you could instantiate a `Location` with `parent_id=9999` (a warehouse that doesn't exist) and SQLAlchemy would insert it without error, completely breaking our Adjacency List hierarchy. The event listener is the load-bearing pillar that connects the ORM to the database engine's strict enforcement mechanisms.

**Exercises**

1. Open `nexus/models.py` and temporarily change `__tablename__ = "skus"` to `__tablename__ = "products"`. In a production application, doing this would immediately crash any query because SQLAlchemy would look for a `products` table that doesn't exist in our SQLite file.
2. Add a `echo=True` argument to your `create_engine` call in `db.py` (`create_engine(f"sqlite:///{DB_PATH}", echo=True)`). This will force SQLAlchemy to print every piece of generated SQL to your terminal in future lessons—a highly recommended debugging tactic.

**Definition of Done**

* [x] A central `models.py` file exists containing the `DeclarativeBase`.
* [x] The `skus` table is mapped to a `SKU` ORM class.
* [x] The `locations` table is mapped to a `Location` ORM class, including a self-referential `ForeignKey`.
* [x] `db.py` is refactored to use a SQLAlchemy `Engine` that applies SQLite Pragmas via connection events.
* [x] You can commit these changes with the message: `refactor: replace raw sqlite connections with sqlalchemy engine and mapped models`.