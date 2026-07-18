# Lesson 6: Bridging the Validation and ORM Boundaries

**What you will build**
You will build the ingress and egress functions (often called CRUD operations) that safely translate strict Pydantic payload models into stateful SQLAlchemy ORM models, and vice versa. The actual problem we are solving is boundary isolation: keeping the web validation layer completely untangled from the database storage layer so changes to one do not break the other.

**What you need to know first**
From Lesson 3: Pydantic `BaseModel` inheritance. From Lesson 4: SQLAlchemy ORM class instantiation. From Lesson 5: The `Session` Unit of Work.

**The Pipeline**
`Client Request → [ Pydantic (In) ] → [ SQLAlchemy (ORM) ] → SQLite (Storage) → [ SQLAlchemy (ORM) ] → [ Pydantic (Out) ] → Client Response`

This lesson stitches the middle of the pipeline together. We will accept a validated Pydantic object from the inbound request, map it to an ORM object, save it to the database, and then map the resulting database row *back* into a safe Pydantic object for the outbound response.

---

## Concept Unit: Ingress and Dictionary Unpacking

### The Problem

When a request arrives, Pydantic produces a perfectly validated `SKUCreate` object (e.g., `sku_in = SKUCreate(sku_id="A1", name="Bolt")`). However, `session.add()` requires a SQLAlchemy `SKU` object. You cannot pass a Pydantic object directly to the database. We need a way to dynamically map the fields from the Pydantic object into the SQLAlchemy constructor without manually typing `sku_id=sku_in.sku_id, name=sku_in.name` for every single property, which becomes unmaintainable for tables with 50 columns.

### Introduce the concept in isolation

Create `lab_unpacking.py` to see how Python dictionaries can dynamically populate class constructors.

```python
from pydantic import BaseModel

class Payload(BaseModel):
    alpha: int = 1
    beta: str = "test"

class DatabaseRow:
    def __init__(self, alpha: int, beta: str):
        self.alpha = alpha
        self.beta = beta

pydantic_obj = Payload(alpha=99, beta="real_data")

# 1. Convert Pydantic object to a standard dictionary
data_dict = pydantic_obj.model_dump()
print(f"Dictionary: {data_dict}")

# 2. Use the ** operator to unpack the dictionary into the constructor
orm_obj = DatabaseRow(**data_dict)
print(f"ORM Object mapped: alpha={orm_obj.alpha}, beta={orm_obj.beta}")

```

Run it:

```bash
python lab_unpacking.py

```

Output:

```text
Dictionary: {'alpha': 99, 'beta': 'real_data'}
ORM Object mapped: alpha=99, beta=real_data

```

*What this proves:* We can use Pydantic's `model_dump()` to extract a pure dictionary, and Python's `**` unpacking operator to explode that dictionary into keyword arguments (`alpha=99, beta="real_data"`). As long as the Pydantic schema property names match the SQLAlchemy column names exactly, the translation is fully automatic.

### Discard the throwaway example

Delete `lab_unpacking.py`. We will now create the operational functions for our NexusInventory SKUs.

### Project Change

We will create a central file for our database operations (CRUD: Create, Read, Update, Delete) and implement the SKU creation logic.

* **Files affected:** Create a new file `nexus/crud.py`.
* **Change type:** Add.
* **Location:** Brand-new file.
* **Dependencies:** Requires `Session` from `sqlalchemy.orm`, `SKU` from `models`, and `SKUCreate` from `schemas`.

### The New Code

```python
from sqlalchemy.orm import Session
from models import SKU
from schemas import SKUCreate

def create_sku(session: Session, sku_in: SKUCreate) -> SKU:
    db_sku = SKU(**sku_in.model_dump())
    session.add(db_sku)
    session.commit()
    return db_sku

```

### The Updated Project

Because this is a brand-new file, the code block above represents the entirety of `nexus/crud.py`. This module now serves as the exclusive gateway for inserting SKUs into the database.

### Mechanical walkthrough

1. `from sqlalchemy.orm import Session`: (Already established syntax).
2. `from models import SKU`: (Already established syntax).
3. `from schemas import SKUCreate`: (Already established syntax).
4. `def create_sku(session: Session, sku_in: SKUCreate) -> SKU:`: (Already established syntax). Defines a function that takes a live database session and a validated Pydantic inbound payload, returning a SQLAlchemy ORM object.
5. `db_sku = SKU(`: (Already established syntax). Instantiates the SQLAlchemy model.
6. `**`: (Hard concept reappearing: Python dictionary unpacking, heavily utilized in arbitrary argument lists `**kwargs`). The double asterisk intercepts a dictionary and converts its key-value pairs into named keyword arguments at the call site.
7. `sku_in.model_dump()`: (First appearance). A Pydantic V2 method. It safely extracts all validated data from the Pydantic instance and returns it as a native Python `dict`.
8. `)`: (Already established syntax). Closes the `SKU` instantiation.
9. `session.add(db_sku)`: (Already established syntax). Stages the ORM object.
10. `session.commit()`: (Already established syntax). Executes the `INSERT` to SQLite.
11. `return db_sku`: (Already established syntax). Returns the now-persistent ORM object.

### CS Lens

**Data Transfer Objects (DTO) vs. Domain Models.** `SKUCreate` is a DTO—an inert bag of data meant only to carry information across a network boundary safely. `SKU` is a Domain Model—a stateful object connected to a database session that tracks its own changes. Passing data between them explicitly via a function like `create_sku` is the classic "Anti-Corruption Layer" pattern. The dirty web context is completely stripped away, and only pure, validated attributes enter the secure domain context.

### SE Lens

Why not just make our ORM `SKU` class inherit from Pydantic `BaseModel` so it can validate itself, saving us from having two separate classes? **The God Object Anti-Pattern.** Libraries like SQLModel attempt exactly this, but in complex systems, it breaks down. The database needs properties that the API should never see (like internal sync timestamps or password hashes). The API needs to accept data that doesn't exist in the database (like a "confirm_password" field). Forcing one class to serve both the web layer and the storage layer couples them together; when you change a database column, you accidentally break your API contract. We keep them separate to maintain boundary purity.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

We successfully translated Pydantic into SQLAlchemy to write to the database, but when we read from the database to send data back to the client, we have to perform the translation in reverse.

---

## Concept Unit: Egress and ORM Attribute Parsing

### The Problem

If a client requests a SKU, our `crud.py` file will run `session.get(SKU, "A1")` and return a SQLAlchemy `SKU` object. If we pass that raw ORM object to a web framework like FastAPI to send to the client, it will often crash because ORM objects have circular references (like `Location.children` pointing to `Location.parent`) and complex hidden state that cannot be cleanly serialized to JSON. We need to parse the ORM object *back* into a safe, flat Pydantic `SKURead` object. But Pydantic, by default, only knows how to parse Python dictionaries, not ORM classes.

### Introduce the concept in isolation

Create `lab_orm_mode.py` to see Pydantic fail to read an object, and then succeed via a specific configuration.

```python
from pydantic import BaseModel, ConfigDict, ValidationError

# A dummy object simulating a SQLAlchemy ORM instance
class DummyORM:
    def __init__(self):
        self.id = 42
        self.name = "Database Record"

orm_instance = DummyORM()

# Standard Pydantic Model
class StrictPayload(BaseModel):
    id: int
    name: str

print("--- Test 1: Default Behavior ---")
try:
    StrictPayload.model_validate(orm_instance)
except ValidationError as e:
    print(f"Failed! {e.errors()[0]['msg']}")

# Configured Pydantic Model
class ORMAwarePayload(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str

print("\n--- Test 2: from_attributes=True ---")
outbound_obj = ORMAwarePayload.model_validate(orm_instance)
print(f"Success! Pydantic extracted: id={outbound_obj.id}, name='{outbound_obj.name}'")

```

Run it:

```bash
python lab_orm_mode.py

```

Output:

```text
--- Test 1: Default Behavior ---
Failed! Input should be a valid dictionary or instance of StrictPayload

--- Test 2: from_attributes=True ---
Success! Pydantic extracted: id=42, name='Database Record'

```

*What this proves:* `model_validate()` attempts to ingest data. By default, it expects a dictionary and rejects class instances. By adding `ConfigDict(from_attributes=True)` to the schema, we instruct Pydantic to aggressively inspect the properties of whatever object is passed to it, looking for `.id` and `.name` attributes, successfully mapping the ORM object into a pure Pydantic schema.

### Discard the throwaway example

Delete `lab_orm_mode.py`. We will now define our outbound `SKURead` schema and the CRUD function to fetch it.

### Project Change

We will add an outbound read schema to `schemas.py` and a fetch function to `crud.py`.

* **Files affected:** `nexus/schemas.py` and `nexus/crud.py`.
* **Change type:** Modify both.
* **Location:** At the bottom of both files.
* **Dependencies:** Requires `ConfigDict` in schemas, and `select` in crud.

### The New Code

**1. Update `nexus/schemas.py`:**

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict

# ... (LocationCreate and SKUCreate remain unchanged) ...

class SKURead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    sku_id: str
    name: str
    description: str | None

```

**2. Update `nexus/crud.py`:**

```python
from sqlalchemy import select
from schemas import SKURead

def get_sku(session: Session, target_id: str) -> SKURead | None:
    db_sku = session.scalar(select(SKU).where(SKU.sku_id == target_id))
    if db_sku is None:
        return None
    return SKURead.model_validate(db_sku)

```

### The Updated Project

Here is the fully reconstructed `nexus/crud.py` containing both the ingress and egress functions.

```python
from sqlalchemy.orm import Session
from sqlalchemy import select
from models import SKU
from schemas import SKUCreate, SKURead

def create_sku(session: Session, sku_in: SKUCreate) -> SKU:
    db_sku = SKU(**sku_in.model_dump())
    session.add(db_sku)
    session.commit()
    return db_sku

# ← new: Fetch ORM object and translate to Pydantic outbound schema
def get_sku(session: Session, target_id: str) -> SKURead | None:
    db_sku = session.scalar(select(SKU).where(SKU.sku_id == target_id))
    if db_sku is None:
        return None
    return SKURead.model_validate(db_sku)

```

Our CRUD layer now completely encapsulates the ORM. External code requesting a SKU asks for an ID and receives a safe Pydantic `SKURead` object, totally unaware that SQLAlchemy is running under the hood.

### Mechanical walkthrough

1. *(In schemas.py)* `from pydantic import ..., ConfigDict`: (First appearance). Imports the configuration typing object for Pydantic V2.
2. `class SKURead(BaseModel):`: (Already established syntax). A new schema specifically for outbound read operations.
3. `model_config = ConfigDict(from_attributes=True)`: (First appearance). A reserved Pydantic attribute. Setting `from_attributes=True` enables ORM-mode extraction.
4. `sku_id: str`, `name: str`, `description: str | None`: (Already established syntax). Notice we drop the complex `Field` constraints (like length limits or regex) here. Why? Because this data is coming *from* our `STRICT` database. It is already guaranteed to be valid. We only need validation constraints on the way *in*.
5. *(In crud.py)* `from sqlalchemy import select`: (Already established syntax).
6. `def get_sku(session: Session, target_id: str) -> SKURead | None:`: (Already established syntax).
7. `session.scalar(...)`: (Already established syntax). Executes the query and returns exactly one scalar result (the object itself), or `None` if not found.
8. `select(SKU).where(SKU.sku_id == target_id)`: (Already established syntax). The SQLAlchemy Core expression to find the matching row.
9. `if db_sku is None: return None`: Standard Python guard clause preventing a crash if the ID wasn't in the database.
10. `return SKURead.model_validate(db_sku)`: (First appearance). The Pydantic V2 parsing method. It consumes the `db_sku` SQLAlchemy object, extracts its attributes, validates them against the `SKURead` schema, and returns the pure Pydantic object.

### CS Lens

**Serialization and View Models.** Returning raw database models to a client is dangerous. A User table might have a `password_hash` column. If you return the ORM object directly to an API framework, the framework will serialize every property into JSON, leaking the password hash. `SKURead` acts as a View Model. By explicitly defining `sku_id`, `name`, and `description` on `SKURead`, we create an allow-list. Even if SQLAlchemy adds a `secret_cost_basis` property to the `SKU` ORM model later, `SKURead.model_validate(db_sku)` will silently ignore it, ensuring it never leaks out of the API.

### SE Lens

What is the cost of this translation layer? **CPU cycles.** We are instantiating a SQLAlchemy object from a SQLite tuple, and then immediately instantiating a Pydantic object from the SQLAlchemy object. For a single row, this takes microseconds. But if you query 10,000 SKUs and run `model_validate()` in a loop, the CPU overhead becomes the bottleneck, dwarfing the actual database query time. In high-performance, read-heavy endpoints, we often bypass the ORM and Pydantic entirely, returning raw SQLite rows to the client as fast as possible. But for standard business logic, the safety of the translation layer is worth the milliseconds.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

With the data safely moving in and out of the database via our CRUD functions, our final remaining challenge is what happens when two of these CRUD functions try to alter the same item at the exact same millisecond.

---

## Closing

**Connect the pieces**
To trace the entire system built so far: A client sends JSON `{"sku_id": "P1", "name": "Pump"}`. Pydantic parses this into `SKUCreate` (Lesson 3). We pass this to `create_sku(session, sku_in)` (Lesson 6). Inside, `**sku_in.model_dump()` unzips the data and constructs a SQLAlchemy `SKU` (Lesson 4). `session.add()` and `commit()` (Lesson 5) translate this to a SQL `INSERT`, and SQLite's `STRICT` engine operating in `WAL` mode (Lesson 1) permanently writes it to disk. Later, a request asks for SKU `P1`. `get_sku()` queries the DB, gets the SQLAlchemy `SKU` object, and runs `SKURead.model_validate()` (Lesson 6) to strip away the database context and return a pristine Pydantic object ready for JSON serialization.

**What breaks without this**
If you forget to add `model_config = ConfigDict(from_attributes=True)` to `SKURead` and attempt to call `get_sku`, the code will instantly crash with a `ValidationError`. Pydantic will angrily inform you that it received a `<models.SKU object>` when it was expecting a native Python `dict`. The boundary will act as a brick wall, blocking the outbound data entirely.

**Exercises**

1. Write a script `test_crud.py` that opens a database connection, calls `create_sku` with a new payload, and then immediately calls `get_sku` with the ID you just created. `print(type(result))` to prove that you got a `SKURead` object back.
2. In `schemas.py`, add `cost_basis: float = 0.0` to the `SKUCreate` model, but *do not* add it to the `SKURead` model. This is how you implement private internal fields that the client can set upon creation but cannot read back.

**Definition of Done**

* [x] A `crud.py` file is created containing ingress and egress routing logic.
* [x] `create_sku` safely unpacks Pydantic objects into SQLAlchemy constructors using `**model_dump()`.
* [x] `SKURead` is configured with `from_attributes=True` to accept ORM instances.
* [x] `get_sku` safely strips ORM state by returning parsed Pydantic V2 models.
* [x] You can commit these changes with the message: `feat: implement crud translation boundary between pydantic and sqlalchemy`.