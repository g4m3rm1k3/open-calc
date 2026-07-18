# Lesson 19: Dynamic Attributes and JSON Storage

**What you will build**
You will add a schemaless JSON boundary to the strict `SKU` catalog, allowing the frontend to attach arbitrary, user-defined data structures to products without modifying the backend Python code or creating new SQLite tables. The problem we are solving is the "Inner-Platform Effect": the urge to build a database *inside* your database because business requirements change too rapidly for traditional schema migrations.

**What you need to know first**
From Lesson 3: Pydantic typing and optional fields. From Lesson 4: SQLAlchemy `Mapped` columns. From Lesson 10: Alembic migrations.

**The Pipeline**
`Browser (Dynamic Payload) → [ Pydantic (Dict Validation) ] → [ SQLAlchemy (JSON Mapping) ] → [ SQLite (JSON1 Extension) ]`

This lesson alters the middle of the pipeline. We will configure Pydantic to accept unstructured dictionaries, SQLAlchemy to map them, and SQLite to securely store them as native JSON objects. If a user passes `{"voltage": 12, "color": "red"}` through the pipeline, it will reach the SQLite file safely without requiring a physical `voltage` column to exist.

---

## Concept Unit: Pydantic Dictionaries and ORM JSON Columns

### The Problem

If the user wants to categorize a specific SKU with a "Thread Pitch" property, we cannot run an Alembic migration just for one SKU. We need a way to accept a completely unstructured dictionary in our Pydantic `SKUCreate` payload and store it securely in a single database column.

### Introduce the concept in isolation

Create `lab_json.py` to prove that SQLAlchemy can safely translate Python dictionaries into database storage.

```python
from sqlalchemy import create_engine, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass

class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    # The JSON type column
    data: Mapped[dict] = mapped_column(JSON)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # We pass a standard Python dictionary to the constructor
    custom_specs = {"color": "red", "size": "M", "is_fragile": True}
    session.add(Product(data=custom_specs))
    session.commit()
    
    # Retrieve it and check its type
    p = session.get(Product, 1)
    print(f"Retrieved: {p.data}")
    print(f"Python Type: {type(p.data)}")

```

Run it:

```bash
python lab_json.py

```

Output:

```text
Retrieved: {'color': 'red', 'size': 'M', 'is_fragile': True}
Python Type: <class 'dict'>

```

*What this proves:* We do not need to convert the dictionary to a string using `json.dumps()`. The SQLAlchemy `JSON` column type automatically serializes the Python dictionary into a JSON string on `INSERT`, and instantly deserializes it back into a native Python dictionary on `SELECT`.

### Discard the throwaway example

Delete `lab_json.py`. We will now add this capability to our NexusInventory SKUs.

### Project Change

We will add a `custom_attributes` field to our `SKUCreate` payload, `SKURead` response, and `SKU` ORM model.

* **Files affected:** `nexus/schemas.py` and `nexus/models.py`.
* **Change type:** Modify.
* **Location:** Inside the `SKUCreate`, `SKURead`, and `SKU` class definitions.
* **Dependencies:** Requires importing `JSON` from `sqlalchemy` and `Any` from `typing`.

### The New Code

**1. Update `nexus/schemas.py`:**

```python
from typing import Any

class SKUCreate(BaseModel):
    sku_id: str = Field(min_length=3, max_length=20, pattern=r"^[A-Z0-9\-]+$")
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    custom_attributes: dict[str, Any] | None = None

class SKURead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    sku_id: str
    name: str
    description: str | None
    custom_attributes: dict[str, Any] | None

```

**2. Update `nexus/models.py`:**

```python
from sqlalchemy import JSON

class SKU(Base):
    __tablename__ = "skus"
    sku_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))
    weight: Mapped[float | None] = mapped_column(Float, default=None)
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"))
    
    custom_attributes: Mapped[dict | None] = mapped_column(JSON, default=None)
    
    supplier: Mapped["Supplier | None"] = relationship(back_populates="skus")

```

### The Updated Project

The smallest enclosing structures for these changes are the class definitions themselves. The code blocks above represent the fully reconstructed classes exactly as they must now appear in their respective files. The frontend can now submit `{"custom_attributes": {"material": "steel"}}` and the backend will seamlessly absorb it.

### Mechanical walkthrough

1. *(In schemas.py)* `from typing import Any`: (First appearance). Imports the wildcard type from Python's standard library.
2. `custom_attributes: dict[str, Any] | None = None`: (First appearance). We instruct Pydantic: "Accept a dictionary where all keys are strings, but the values can be literally anything (`Any`)—strings, ints, booleans, or even nested lists." This purposefully drops our strict validation guardrails for this specific field, making it open to extension.
3. *(In models.py)* `from sqlalchemy import JSON`: (First appearance). Imports the JSON column mapping type.
4. `custom_attributes: Mapped[dict | None]`: (Already established syntax). Maps the property to a Python dictionary.
5. `= mapped_column(JSON, default=None)`: (First appearance). Configures the column to use SQLite's native JSON storage capabilities.

### CS Lens

**The Inner-Platform Effect vs. Document Storage.** The Inner-Platform Effect occurs when you build a system so customizable that it essentially recreates a database inside your database (like creating an `attribute_names` table and an `attribute_values` table and joining them). This is incredibly slow and error-prone. By using a native JSON column, we leverage the Document Object Storage paradigm (similar to MongoDB) directly inside our Relational Database, getting the best of both worlds without the architectural anti-pattern.

### SE Lens

Why use JSON instead of the Entity-Attribute-Value (EAV) pattern? **Query Complexity.** In EAV, you store rows like `(SKU_ID=1, Attr="color", Value="red")`. To find a SKU that is red *and* 12-volts, you must `JOIN` the EAV table to itself twice. The SQL becomes an unreadable nightmare. A JSON column keeps all the data on a single row, allowing the ORM to manage it effortlessly as a single Python dictionary.

### Commands needed to make this unit real

Generate and apply the Alembic migration to physically alter the SQLite file, adding the new column.

```bash
alembic revision --autogenerate -m "add custom_attributes json column"
alembic upgrade head

```

### Run it. Show the real output.

```text
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.autogenerate.compare] Detected added column 'skus.custom_attributes'
  Generating /nexus/alembic/versions/a1b2c3d4e5f6_add_custom_attributes_json_column.py ...  done

INFO  [alembic.runtime.migration] Running upgrade 9f8e7d6c5b4a -> a1b2c3d4e5f6, add custom_attributes json column

```

### One sentence connecting this unit to what came immediately before.

We can now store dynamic data, but if a user wants to find all SKUs where the dynamic "voltage" attribute is 12, we must write a query that can penetrate the JSON text without forcing a full table scan.

---

## Concept Unit: Querying Inside JSON Structures

### The Problem

If `custom_attributes` is just a text column holding `{"voltage": 12}`, writing `select(SKU).where(SKU.custom_attributes == '{"voltage": 12}')` is useless. The keys might be in a different order, or there might be other data in the dictionary like `{"color": "red", "voltage": 12}`. We need to instruct the SQLite engine to actually parse the JSON string and extract a specific key during the `SELECT` operation.

### Introduce the concept in isolation

Create `lab_json_query.py` to see how SQLAlchemy leverages SQLite's JSON1 extension to query inside the payload.

```python
from sqlalchemy import create_engine, select, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass

class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    data: Mapped[dict] = mapped_column(JSON)

engine = create_engine("sqlite:///:memory:", echo=True)
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add_all([
        Product(data={"color": "red", "voltage": 12}),
        Product(data={"color": "blue", "voltage": 24}),
        Product(data={"color": "red", "voltage": 5})
    ])
    session.commit()

    print("\n--- Executing JSON Path Query ---")
    # We use dictionary syntax on the ORM column, then cast it
    query = select(Product).where(Product.data["color"].as_string() == "red")
    
    results = session.scalars(query).all()
    for p in results:
        print(f"Match ID {p.id}: {p.data}")

```

Run it:

```bash
python lab_json_query.py

```

Output:

```text
--- Executing JSON Path Query ---
INFO sqlalchemy.engine.Engine SELECT products.id, products.data FROM products WHERE JSON_EXTRACT(products.data, ?) = ?
INFO sqlalchemy.engine.Engine [generated in 0.0001s] ('$.color', 'red')
Match ID 1: {'color': 'red', 'voltage': 12}
Match ID 3: {'color': 'red', 'voltage': 5}

```

*What this proves:* By using `Product.data["color"].as_string()`, SQLAlchemy automatically detects we are querying a JSON column and translates our code into the native SQLite `JSON_EXTRACT()` function. The database safely isolates the key and evaluates the string comparison.

### Discard the throwaway example

Delete `lab_json_query.py`. We will now build a dynamic search endpoint in our CRUD layer.

### Project Change

We will add a generic attribute search function to `nexus/crud.py`.

* **Files affected:** `nexus/crud.py`.
* **Change type:** Add.
* **Location:** At the bottom of the file.
* **Dependencies:** None.

### The New Code

```python
def search_skus_by_attribute(session: Session, key: str, value: str) -> list[SKU]:
    # We cast to string for the comparison to ensure robust matching
    query = select(SKU).where(
        SKU.custom_attributes[key].as_string() == value
    )
    return list(session.scalars(query).all())

```

### The Updated Project

Because this is a brand-new, freestanding function, the block above represents the entirety of what is being appended to `nexus/crud.py`.

### Mechanical walkthrough

1. `def search_skus_by_attribute(..., key: str, value: str)`: (Basic syntax). The function accepts any arbitrary key-value pair to search for.
2. `SKU.custom_attributes[key]`: (First appearance). Array-index syntax used directly on a SQLAlchemy ORM column. This generates the JSON path expression (e.g., `$.color`).
3. `.as_string()`: (First appearance). Extracts the value from the JSON payload and casts it to a SQL string before evaluating the `== value` operation. This is crucial because if the JSON contains an integer `12`, and we search for the string `"12"`, `.as_string()` coerces them to match securely.

### CS Lens

**The JSON1 Extension.** SQLite is heavily modular. Modern versions compile with the JSON1 C-extension enabled by default. This extension provides the `JSON_EXTRACT` function. When SQLite runs this query, it parses the text blob into an Abstract Syntax Tree (AST) on the fly for every row, extracts the node, and compares it. It provides massive flexibility, but because it must parse text iteratively, it is slower than querying a strict `INTEGER` column.

### SE Lens

What is the tradeoff of relying heavily on JSON column querying? **Index Blindness.** If you write a standard `WHERE name = 'Bolt'`, you can add a B-Tree index to the `name` column, making the query instant for millions of rows. SQLite *can* build indexes on JSON expressions, but it requires manually writing raw `CREATE INDEX` SQL statements defining the exact JSON path you want to index. If the frontend allows users to create infinite dynamic keys, you cannot index them all. Extensive JSON querying will eventually force full-table scans, bottlenecking your database. JSON is for *extensibility*, not core relational logic.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

With the ability to store and query arbitrary data securely, the frontend can now confidently expand its form inputs without ever asking the backend to modify its table structures.

---

## Closing

**Connect the pieces**
To trace the flow of a dynamic attribute: The frontend creates an object `{"sku_id": "DYN-1", "name": "Battery", "custom_attributes": {"chemistry": "Li-Ion"}}`. The API request hits FastAPI. Pydantic validates the core fields (`sku_id`, `name`) while allowing the `custom_attributes` dict to pass through its `Any` wildcard type (Lesson 19). `crud.create_sku` instantiates the `SKU` ORM model. SQLAlchemy intercepts the dictionary and serializes it natively into the `JSON` mapped column (Lesson 19). When searching for `"Li-Ion"`, `crud.search_skus_by_attribute` generates a `JSON_EXTRACT` SQL command (Lesson 19), instructing SQLite to unpack the JSON safely and return the match.

**What breaks without this**
If we had implemented the user's initial request to dynamically run `CREATE TABLE` or `ALTER TABLE` from the frontend, a malicious user could submit a payload attempting to create a table named `sqlite_master` or a table with 5,000 columns. This would instantly corrupt the SQLite internal tracking tables, crash the SQLAlchemy ORM metadata registry, and permanently destroy the NexusInventory application state. The JSON column boundary protects the physical architecture while satisfying the business requirement for extensibility.

**Exercises**

1. Add a new route in `main.py` using `@app.get("/skus/attribute/{key}/{value}")` that exposes the `search_skus_by_attribute` CRUD function to the network.
2. Use `curl` to `POST` a new SKU containing `{"custom_attributes": {"voltage": "18V", "brand": "Makita"}}`. Then use the endpoint you just created to search for `key=brand` and `value=Makita`.

**Definition of Done**

* [x] Pydantic `SKUCreate` updated with a wildcard `dict[str, Any]` field.
* [x] `SKU` ORM model updated with a native SQLAlchemy `JSON` column.
* [x] Alembic migration successfully applied to the physical database without data loss.
* [x] Query logic utilizes `.as_string()` to trigger `JSON_EXTRACT` operations safely.
* [x] You can commit these changes with the message: `feat: implement extensible custom attributes via sqlite native json columns`.