# Lesson 20: Metadata-Driven Architecture and Dynamic Schemas

**What you will build**
You will build a metaprogramming engine that reads an external JSON configuration file and dynamically generates both a strict Pydantic validation model and a physical SQLAlchemy database table at runtime. The problem we are solving is rigid compilation: giving system administrators the power to define entirely new physical entities (like tracking custom tooling or calibration gauges) without requiring a backend engineer to write new Python classes or hardcode new endpoints.

**What you need to know first**
From Lesson 3: Pydantic field definitions. From Lesson 8: SQLAlchemy Core `Table` constructs. From Lesson 19: The tradeoff of using JSON columns versus physical tables.

**The Pipeline**
`JSON Config → [ Python Metaprogramming ] → Pydantic (Validation) → SQLAlchemy (Core Table) → SQLite (Storage)`

This lesson introduces the **Python Metaprogramming** stage. Before the API even finishes booting up, Python will read a static JSON file, execute logic to write new code in memory, and seamlessly inject those newly manufactured structures into the Pydantic and SQLAlchemy stages of the pipeline.

---

## Concept Unit: Dynamic Pydantic Models via `create_model`

### The Problem

In Lesson 3, we hardcoded `class SKUCreate(BaseModel):`. If an administrator defines a new entity called `cutting_tools` via a frontend UI, saving that definition to a JSON file, the Python codebase doesn't have a `CuttingToolCreate` class to validate incoming network requests for it. We must instruct Python to manufacture a brand-new Pydantic class entirely from memory variables.

### Introduce the concept in isolation

Create `lab_pydantic_meta.py` to see how a class can be forged at runtime without the `class` keyword.

```python
from pydantic import create_model, ValidationError

# 1. A dictionary representing data we might have read from a file or database
dynamic_fields = {
    # Key is field name. Value is a tuple of (Type, DefaultValue)
    # The Ellipsis (...) means the field is strictly required.
    "tool_id": (str, ...),
    "flute_count": (int, 2)
}

# 2. Forge the class in memory
DynamicTool = create_model("DynamicTool", **dynamic_fields)

print("--- Test 1: Valid Instantiation ---")
tool = DynamicTool(tool_id="EM-250")
print(repr(tool))

print("\n--- Test 2: Validation Enforcement ---")
try:
    bad_tool = DynamicTool(tool_id="EM-250", flute_count="four")
except ValidationError as e:
    print(f"Caught error: {e.errors()[0]['msg']}")

```

Run it:

```bash
python lab_pydantic_meta.py

```

Output:

```text
--- Test 1: Valid Instantiation ---
DynamicTool(tool_id='EM-250', flute_count=2)

--- Test 2: Validation Enforcement ---
Caught error: Input should be a valid integer, unable to parse string as an integer

```

*What this proves:* The `create_model` function generates a fully functional, strict Pydantic class. It applies the exact same type coercion and validation rules as a hardcoded class, utilizing the tuple format `(type, default)` to define the boundary constraints.

### Discard the throwaway example

Delete `lab_pydantic_meta.py`. We will now create the JSON schema definition for our project.

### Project Change

We will create a configuration JSON file that acts as our metadata source of truth, and a new Python module dedicated to parsing it.

* **Files affected:** Create `nexus/custom_schema.json` and `nexus/meta.py`.
* **Change type:** Add.
* **Location:** Brand-new files in the `nexus/` directory.
* **Dependencies:** Requires `json` and `create_model`.

### The New Code

**1. The Metadata Source (`nexus/custom_schema.json`):**

```json
{
  "table_name": "cutting_tools",
  "fields": {
    "tool_id": "string",
    "flute_count": "integer",
    "coating": "string"
  }
}

```

**2. The Generator (`nexus/meta.py`):**

```python
import json
import pathlib
from pydantic import create_model

# Type mapping dictionary translating JSON strings to Python types
TYPE_MAP = {
    "string": str,
    "integer": int
}

def load_dynamic_pydantic_model() -> type:
    config_path = pathlib.Path(__file__).parent / "custom_schema.json"
    with open(config_path, "r") as f:
        schema_def = json.load(f)
    
    fields = {}
    for field_name, field_type_str in schema_def["fields"].items():
        python_type = TYPE_MAP[field_type_str]
        fields[field_name] = (python_type, ...)
        
    class_name = schema_def["table_name"].title().replace("_", "")
    return create_model(class_name, **fields)

```

### The Updated Project

Because these are brand-new files, the code blocks above represent their entirety. `meta.py` exposes a function that reads the JSON file and returns a fully armed Pydantic validation class.

### Mechanical walkthrough

1. *(In JSON)* `"table_name": "cutting_tools"`: (First appearance). The literal string naming our custom entity.
2. `"fields": { ... }`: (First appearance). A JSON object defining the column names and their expected data types as simple strings.
3. *(In meta.py)* `import json`: (First appearance). Python's standard library for parsing JSON text into dictionaries.
4. `import pathlib`: (Already established syntax).
5. `from pydantic import create_model`: (First appearance). Imports the metaclass factory function.
6. `TYPE_MAP = {"string": str, "integer": int}`: (First appearance). A translation dictionary. JSON files cannot store raw Python types like `str` or `int`, so we store them as strings (`"string"`) and map them back to physical Python primitives here.
7. `def load_dynamic_pydantic_model() -> type:`: (First appearance). The return hint `type` signifies that this function returns an *uninstantiated Class blueprint*, not an object instance.
8. `config_path = pathlib.Path(__file__).parent / "custom_schema.json"`: (Already established syntax).
9. `with open(config_path, "r") as f:`: (First appearance). A context manager that securely opens the file in read-mode (`"r"`) and automatically closes the file handle when the block ends.
10. `schema_def = json.load(f)`: (First appearance). Reads the file stream and deserializes the JSON string into a native Python dictionary.
11. `fields = {}`: (Already established syntax).
12. `for field_name, field_type_str in schema_def["fields"].items():`: (Already established syntax). Iterates through the dictionary key-value pairs.
13. `python_type = TYPE_MAP[field_type_str]`: (Basic syntax). Looks up the matching Python primitive.
14. `fields[field_name] = (python_type, ...)`: (First appearance). Assembles the tuple required by Pydantic, enforcing that every dynamic field is strictly required (`...`).
15. `class_name = schema_def["table_name"].title().replace("_", "")`: (First appearance). Takes `"cutting_tools"`, capitalizes it to `"Cutting_Tools"`, and removes the underscore to generate a standard Python Class name: `"CuttingTools"`.
16. `return create_model(class_name, **fields)`: (Hard concept reappearing: Dictionary unpacking). Explodes the assembled tuple dictionary into the factory function, forging the class.

### CS Lens

**Reflection and Metaprogramming.** Standard programming writes code that manipulates data. Metaprogramming writes code that manipulates *code*. By using dictionaries to map strings to type objects, and utilizing metaclass factories like `create_model`, Python allows the application to dynamically alter its own architectural boundaries during the runtime boot sequence.
*Also recognized in:* Java Reflection API, C# Dynamic Types, and ORM internal engines.

### SE Lens

What happens when an administrator wants to delete a field from the JSON file? **The Destructive DDL Danger.** This is the primary risk of metadata-driven systems. If you alter the JSON, the system dynamically changes. If the system drops a column automatically, thousands of rows of data vanish instantly. Massive enterprise platforms handle this by enforcing "Append-Only" schemas through the UI, or by creating a "Schema Versioning Ledger" table in the database. When the JSON changes, the UI alerts the administrator: "Warning: Removing 'flute_count' will orphan 14,000 data points. Type CONFIRM to execute."

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

We have successfully forged the Pydantic validation boundary for the `cutting_tools` entity, but if we validate the data, we still have no physical SQLite table to store it in.

---

## Concept Unit: Dynamic SQLAlchemy Core Tables

### The Problem

We need to generate a `CREATE TABLE` command for SQLite that matches the exact shape of the JSON file, without hardcoding an ORM `Mapped` class in `models.py`. We must construct a SQLAlchemy Core `Table` object programmatically by iterating over our metadata map.

### Introduce the concept in isolation

Create `lab_sql_meta.py` to see how SQLAlchemy Core constructs schemas iteratively.

```python
from sqlalchemy import Table, Column, Integer, String, MetaData
from sqlalchemy.schema import CreateTable
from sqlalchemy.dialects import sqlite

metadata = MetaData()
table_name = "dynamic_table"

# Imagine this dictionary came from our JSON mapping
columns_config = {
    "id": Integer,
    "name": String,
    "quantity": Integer
}

# 1. Start an empty list of Column objects
columns = []

# 2. Iteratively forge Columns
for col_name, col_type in columns_config.items():
    columns.append(Column(col_name, col_type))

# 3. Unpack the list into the Table constructor
dynamic_table = Table(table_name, metadata, *columns)

# Prove the exact SQL generation
sql_statement = CreateTable(dynamic_table).compile(dialect=sqlite.dialect())
print(sql_statement)

```

Run it:

```bash
python lab_sql_meta.py

```

Output:

```text
CREATE TABLE dynamic_table (
	id INTEGER, 
	name VARCHAR, 
	quantity INTEGER
)

```

*What this proves:* `Table` and `Column` are just Python objects. Instead of hardcoding them line-by-line in a file, we can dynamically build a list of `Column` objects inside a `for` loop and unpack them into a `Table` constructor using the `*` operator, allowing SQLAlchemy to compile perfectly valid DDL based entirely on runtime logic.

### Discard the throwaway example

Delete `lab_sql_meta.py`. We will now expand our `meta.py` file to generate the database schema.

### Project Change

We will append a second generator function to `nexus/meta.py` to construct the physical SQLAlchemy mapping.

* **Files affected:** `nexus/meta.py`.
* **Change type:** Modify.
* **Location:** At the bottom of the file.
* **Dependencies:** Requires importing `Table`, `Column`, `String`, `Integer`, and our global `Base` from `models`.

### The New Code

```python
from sqlalchemy import Table, Column, String, Integer
from models import Base

SQL_TYPE_MAP = {
    "string": String,
    "integer": Integer
}

def bind_dynamic_sql_table() -> Table:
    config_path = pathlib.Path(__file__).parent / "custom_schema.json"
    with open(config_path, "r") as f:
        schema_def = json.load(f)
        
    table_name = schema_def["table_name"]
    
    # Check if we already bound it during a previous import
    if table_name in Base.metadata.tables:
        return Base.metadata.tables[table_name]
        
    columns = [Column("id", Integer, primary_key=True, autoincrement=True)]
    
    for field_name, field_type_str in schema_def["fields"].items():
        sql_type = SQL_TYPE_MAP[field_type_str]
        columns.append(Column(field_name, sql_type))
        
    dynamic_table = Table(table_name, Base.metadata, *columns)
    return dynamic_table

```

### The Updated Project

Here is the fully reconstructed `nexus/meta.py` file. It now acts as a complete meta-factory, producing both the API validation boundary and the raw storage schema.

```python
import json
import pathlib
from pydantic import create_model
from sqlalchemy import Table, Column, String, Integer
from models import Base

TYPE_MAP = {
    "string": str,
    "integer": int
}

SQL_TYPE_MAP = {
    "string": String,
    "integer": Integer
}

def load_dynamic_pydantic_model() -> type:
    config_path = pathlib.Path(__file__).parent / "custom_schema.json"
    with open(config_path, "r") as f:
        schema_def = json.load(f)
    
    fields = {}
    for field_name, field_type_str in schema_def["fields"].items():
        python_type = TYPE_MAP[field_type_str]
        fields[field_name] = (python_type, ...)
        
    class_name = schema_def["table_name"].title().replace("_", "")
    return create_model(class_name, **fields)

# ← new: Generates the Core Table and binds it to our existing Alembic metadata
def bind_dynamic_sql_table() -> Table:
    config_path = pathlib.Path(__file__).parent / "custom_schema.json"
    with open(config_path, "r") as f:
        schema_def = json.load(f)
        
    table_name = schema_def["table_name"]
    
    if table_name in Base.metadata.tables:
        return Base.metadata.tables[table_name]
        
    columns = [Column("id", Integer, primary_key=True, autoincrement=True)]
    
    for field_name, field_type_str in schema_def["fields"].items():
        sql_type = SQL_TYPE_MAP[field_type_str]
        columns.append(Column(field_name, sql_type))
        
    dynamic_table = Table(table_name, Base.metadata, *columns)
    return dynamic_table

```

Because we pass `Base.metadata` to the `Table` constructor, the dynamic table is instantly woven into the exact same registry that tracks our hardcoded `SKU` and `Location` models.

### Mechanical walkthrough

1. `from sqlalchemy import Table, Column, String, Integer`: (Already established syntax).
2. `from models import Base`: (Already established syntax). Imports the central schema registry.
3. `SQL_TYPE_MAP = {"string": String, "integer": Integer}`: (First appearance). A second translation dictionary mapping the JSON strings specifically to SQLAlchemy database column types.
4. `def bind_dynamic_sql_table() -> Table:`: (First appearance). Defines the factory function returning a SQLAlchemy Core object.
5. `if table_name in Base.metadata.tables:`: (First appearance). A critical guard clause. If the FastAPI application boots and calls this function multiple times (e.g., in different endpoint files), SQLAlchemy will throw an error if you try to redefine a table that already exists in the metadata graph. We check the graph first and return the existing table if it's already there.
6. `columns = [Column("id", Integer, primary_key=True, autoincrement=True)]`: (First appearance). We manually inject a primary key. The JSON file didn't define one because structural database concerns (`id` generation) should be handled by the backend system, not the frontend metadata designer.
7. `sql_type = SQL_TYPE_MAP[field_type_str]`: (Basic syntax). Looks up the mapped database type.
8. `columns.append(Column(field_name, sql_type))`: (First appearance). Iteratively builds the column objects in RAM.
9. `dynamic_table = Table(table_name, Base.metadata, *columns)`: (Hard concept reappearing: List unpacking). The `*` operator unzips the `columns` list so that each `Column` object is passed as a separate positional argument to the `Table` constructor, dynamically forging the table and binding it to `Base.metadata`.

### CS Lens

**Single Source of Truth.** By deriving both the Pydantic model and the SQLAlchemy table from the exact same `custom_schema.json` file, we eliminate boundary drift. In hardcoded systems, a developer might update `models.py` but forget to update `schemas.py`, causing the API to reject valid database inserts. Here, the metadata file is the strict source of truth; if it changes, both boundaries synchronize perfectly and automatically upon the next script execution.

### SE Lens

Can Alembic detect these dynamic tables? **Yes, because of the registry.** In Lesson 10, we pointed Alembic's `env.py` directly at `Base.metadata`. Because our `bind_dynamic_sql_table()` function attaches the dynamic table to `Base.metadata`, Alembic will "see" it during `--autogenerate` perfectly, diff it against the SQLite file, and generate the exact `CREATE TABLE` scripts required.

### Commands needed to make this unit real

To prove this architecture integrates cleanly with our existing tooling, we must initialize the table before Alembic can detect it. Open a Python terminal and run:

```bash
python -c "from meta import bind_dynamic_sql_table; bind_dynamic_sql_table()"

```

*Note: Because this is a dynamic boot-time operation, Alembic needs to evaluate the `meta.py` file during its run cycle. A standard `--autogenerate` command from the CLI won't execute our custom python function automatically without further `env.py` modifications. In production, `bind_dynamic_sql_table()` is called natively during FastAPI boot.*

### One sentence connecting this unit to what came immediately before.

With the schema metadata translated successfully into an active SQL table in memory, the backend pipeline is now capable of digesting completely arbitrary architectures defined strictly by text files.

---

## Closing

**Connect the pieces**
To trace the generation cycle: `custom_schema.json` acts as the definitive design document. At runtime, `load_dynamic_pydantic_model()` reads it, executes Python Metaprogramming (Lesson 20), maps strings to primitives, and uses `create_model` (Lesson 20) to generate the API boundary. Simultaneously, `bind_dynamic_sql_table()` maps strings to SQLAlchemy types and unpacks a list of `Column` objects into a Core `Table` constructor (Lesson 20). Because that table is bound to `Base.metadata`, it sits seamlessly alongside our hardcoded `SKU` models (Lesson 4), completely integrating the metadata-driven entity into our established backend pipeline without writing a single hardcoded Python class.

**What breaks without this**
If you did not include the `if table_name in Base.metadata.tables:` guard clause, and two different route files imported `meta.py` and called `bind_dynamic_sql_table()`, SQLAlchemy would immediately crash with an `InvalidRequestError`. The registry refuses to let you overwrite or duplicate an existing table mapping in memory, demanding that execution logic accounts for application lifecycles.

**Definition of Done**

* [x] External JSON configuration file created to define schema metadata.
* [x] Python metaclasses (`create_model`) generate strict Pydantic boundaries dynamically.
* [x] Python dictionary iterations generate SQLAlchemy Core `Column` objects.
* [x] Dynamic tables are instantiated and successfully bound to the global `DeclarativeBase` metadata registry.