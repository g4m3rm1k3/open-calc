# Lesson 14: Database Triggers and Full-Text Search Integration

**What you will build**
You will build an automated synchronization engine at the deepest level of the database, tying our `skus` product catalog directly to our `skus_fts` high-speed search index using SQLite Triggers. You will then expose this search capability through the API. The problem we are solving is index staleness: in Lesson 2, we built an FTS5 index to search products instantly, but because it is an "External Content" index, any SKUs added via our bulk Upsert endpoint in Lesson 8 remain completely invisible to the search engine.

**What you need to know first**
From Lesson 2: Full-Text Search (`USING fts5`) and external content indexing. From Lesson 8: Bypassing the ORM. From Lesson 10: Alembic migrations.

**The Pipeline**
`Client Request → FastAPI (Routing) → [ SQLAlchemy (Core) ] → [ SQLite (Triggers + FTS5) ]`

This lesson heavily modifies the behavior of the **SQLite** stage. When a `"M5-BOLT"` payload passes through the ORM and is physically inserted into the `skus` table, the database engine itself will intercept that event and automatically write a second record into the `skus_fts` index table, guaranteeing the pipeline's search layer is never out of sync.

---

## Concept Unit: Database-Level Event Hooks (Triggers)

### The Problem

If we upload 1,000 new SKUs via the bulk ingestion endpoint, our Python application knows they were inserted, but the `skus_fts` index does not. We could write Python code to update `skus_fts` immediately after updating `skus`, but if another developer writes a cleanup script that touches the database directly, the index falls out of sync again. The synchronization must be enforced at the storage layer, completely immune to application bypasses.

### Introduce the concept in isolation

Create `lab_trigger.py` to observe the database engine intercepting its own operations.

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# 1. Setup a flat table and a separate "audit log" table
conn.execute("CREATE TABLE users (name TEXT);")
conn.execute("CREATE TABLE audit_log (event TEXT);")

# 2. Define a Trigger: a stored program that listens for specific table events
conn.execute("""
    CREATE TRIGGER after_user_insert 
    AFTER INSERT ON users 
    BEGIN
        INSERT INTO audit_log (event) VALUES ('New user added: ' || new.name);
    END;
""")

# 3. We ONLY interact with the users table
conn.execute("INSERT INTO users (name) VALUES ('Alice');")

# 4. Prove the Trigger fired automatically behind the scenes
cursor = conn.execute("SELECT * FROM audit_log;")
print(f"Audit log output: {cursor.fetchone()[0]}")

```

Run it:

```bash
python lab_trigger.py

```

Output:

```text
Audit log output: New user added: Alice

```

*What this proves:* The Python script never touched the `audit_log` table. The `CREATE TRIGGER` command instructed the SQLite C-binary to pause immediately after inserting "Alice", extract her name using the magical `new.` namespace, execute a secondary `INSERT`, and only then mark the transaction as complete.

### Discard the throwaway example

Delete `lab_trigger.py`. We will now write the complex FTS5 synchronization triggers for NexusInventory.

### Project Change

We will use Alembic to inject custom SQL Data Definition Language (DDL) directly into our database. We are not modifying a Python model; we are instructing Alembic to generate an empty migration script that we will manually fill with SQLite triggers.

* **Files affected:** A new file generated inside `nexus/alembic/versions/`.
* **Change type:** Add.
* **Location:** The `upgrade()` and `downgrade()` functions of the generated file.
* **Dependencies:** None.

### The New Code

Generate the empty migration file in your terminal:

```bash
alembic revision -m "add fts5 sync triggers"

```

Open the newly generated file (e.g., `alembic/versions/1234abcd_add_fts5_sync_triggers.py`), and write the following exact SQL strings inside the `upgrade()` and `downgrade()` functions.

```python
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '1234abcd'
down_revision: Union[str, None] = '4a2b8c9d1e2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Trigger for new SKUs
    op.execute("""
        CREATE TRIGGER skus_ai AFTER INSERT ON skus BEGIN
            INSERT INTO skus_fts(rowid, sku_id, name, description) 
            VALUES (new.rowid, new.sku_id, new.name, new.description);
        END;
    """)
    # 2. Trigger for deleted SKUs
    op.execute("""
        CREATE TRIGGER skus_ad AFTER DELETE ON skus BEGIN
            INSERT INTO skus_fts(skus_fts, rowid, sku_id, name, description) 
            VALUES ('delete', old.rowid, old.sku_id, old.name, old.description);
        END;
    """)
    # 3. Trigger for updated SKUs (Upserts)
    op.execute("""
        CREATE TRIGGER skus_au AFTER UPDATE ON skus BEGIN
            INSERT INTO skus_fts(skus_fts, rowid, sku_id, name, description) 
            VALUES ('delete', old.rowid, old.sku_id, old.name, old.description);
            INSERT INTO skus_fts(rowid, sku_id, name, description) 
            VALUES (new.rowid, new.sku_id, new.name, new.description);
        END;
    """)

def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS skus_ai;")
    op.execute("DROP TRIGGER IF EXISTS skus_ad;")
    op.execute("DROP TRIGGER IF EXISTS skus_au;")

```

### The Updated Project

Because this is a standalone migration file, the code block above represents the entirety of the target file in `nexus/alembic/versions/`. Alembic will execute these raw SQL commands the next time we run `upgrade head`.

### Mechanical walkthrough

1. `op.execute(...)`: (First appearance). An Alembic operations command that accepts raw SQL strings, bypassing SQLAlchemy's ORM graph entirely to execute DDL against the connection.
2. `CREATE TRIGGER skus_ai AFTER INSERT ON skus`: (First appearance). Defines a named trigger (`skus_ai`) that executes only *after* a successful row insertion on the physical `skus` table.
3. `BEGIN ... END;`: (First appearance). The block syntax defining the boundary of the commands the trigger will run.
4. `new.rowid`, `new.sku_id`: (First appearance). The `new` keyword is a special object available only inside `INSERT` and `UPDATE` triggers. It holds the exact state of the row that was just written. `rowid` is SQLite's hidden internal integer primary key that exists on all tables.
5. `skus_ad AFTER DELETE ON skus`: (First appearance). Defines a trigger for deletions.
6. `old.rowid`: (First appearance). The `old` keyword is available in `DELETE` and `UPDATE` triggers, holding the state of the row exactly as it was *before* the modification.
7. `VALUES ('delete', ...)`: (First appearance). This is a highly specific FTS5 mechanic. To remove an item from an external-content inverted index, you do not issue a `DELETE FROM` command. Instead, you `INSERT` a special row where the first column (the name of the table itself, `skus_fts`) is literally the string `'delete'`. The FTS engine intercepts this bizarre command and uses it to scrub the index.
8. `DROP TRIGGER IF EXISTS`: (First appearance). The safe reversal command required in the `downgrade()` function to ensure the database can be rolled back cleanly.

### CS Lens

**Event-Driven Architecture (EDA).** A trigger is the database equivalent of the Observer Pattern. The `skus` table is the "Subject" emitting state-change events. The FTS5 index is the "Observer" reacting to them. Because the storage engine itself acts as the event bus, network latency is zero, and the architectural guarantee of "At-Least-Once Delivery" becomes "Exactly-Once Delivery" within the same atomic transaction.
*Also recognized in:* DOM Event Listeners (`onClick`), AWS Lambda functions triggered by S3 uploads, and Publish/Subscribe message queues (RabbitMQ).

### SE Lens

Why not use SQLAlchemy's `@event.listens_for(SKU, 'after_insert')` decorator to update the index in Python? **The ORM Bypass Vulnerability.** In Lesson 8, we built `bulk_import_skus` using SQLAlchemy Core, explicitly bypassing the instantiation of `SKU` objects for speed. Because the ORM is bypassed, ORM-level event hooks will *never fire* during bulk uploads. By placing the triggers in SQLite, we guarantee they will fire regardless of whether the query comes from the ORM, a Core UPSERT, or a developer running a SQL GUI tool locally.

### Commands needed to make this unit real

Apply the newly written migration to the live SQLite file.

```bash
alembic upgrade head

```

### Run it. Show the real output.

```text
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade 4a2b8c9d1e2f -> 1234abcd, add fts5 sync triggers

```

### One sentence connecting this unit to what came immediately before.

With the search index now perfectly and permanently synchronized with our product catalog, we must upgrade our API routing to expose this querying capability to the frontend.

---

## Concept Unit: Raw SQL Expressions in the ORM

### The Problem

If a user searches for `"hex bolt"`, we need to return a list of JSON-serialized Pydantic `SKURead` models. This means we must return SQLAlchemy `SKU` objects from `crud.py`. However, the `SKU` model is mapped to the `skus` table, while the search index lives in `skus_fts`. We need to query the `skus_fts` virtual table using the raw `MATCH` operator, extract the matching IDs, and seamlessly feed them into an ORM query to fetch the actual `SKU` objects.

### Introduce the concept in isolation

Create `lab_text.py` to observe how SQLAlchemy handles non-standard SQL keywords.

```python
from sqlalchemy import create_engine, select, text
from models import SKU, Base
from sqlalchemy.orm import Session

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

# Standard ORM query uses Python operators:
orm_query = select(SKU).where(SKU.name == "Hammer")
print("ORM Query:\n", orm_query.compile(compile_kwargs={"literal_binds": True}))

# text() forces raw strings into the compilation graph safely:
text_query = select(SKU).where(text("name LIKE :pattern"))
print("\nText Query:\n", text_query.compile(compile_kwargs={"literal_binds": True}))

```

Run it:

```bash
python lab_text.py

```

Output:

```text
ORM Query:
 SELECT skus.sku_id, skus.name, skus.description, skus.weight 
FROM skus 
WHERE skus.name = 'Hammer'

Text Query:
 SELECT skus.sku_id, skus.name, skus.description, skus.weight 
FROM skus 
WHERE name LIKE :pattern

```

*What this proves:* SQLAlchemy cannot possibly support every bizarre database-specific operator (like SQLite's `MATCH` or Postgres's `<@` array containment). The `text()` construct acts as an escape hatch, allowing us to embed raw SQL snippets safely inside a modern, chainable `select()` query.

### Discard the throwaway example

Delete `lab_text.py`. We will now construct the combined FTS and ORM query in our CRUD layer.

### Project Change

We will add a new freestanding function to `crud.py` to handle the search logic, and expose it via a new HTTP `GET` endpoint in `main.py`.

* **Files affected:** `nexus/crud.py` and `nexus/main.py`.
* **Change type:** Add.
* **Location:** At the bottom of both files.
* **Dependencies:** Requires importing `text` in `crud.py`.

### The New Code

*(Per the Schema rules regarding freestanding new functions, we append these directly to their files without needing to reproduce the entire enclosing structure).*

**1. Append to `nexus/crud.py`:**

```python
from sqlalchemy import text

def search_skus(session: Session, search_term: str) -> list[SKU]:
    # 1. Build a subquery against the virtual FTS table
    fts_subquery = (
        select(text("sku_id"))
        .select_from(text("skus_fts"))
        .where(text("skus_fts MATCH :term"))
    )
    
    # 2. Feed the subquery into the ORM table
    query = select(SKU).where(SKU.sku_id.in_(fts_subquery))
    
    # 3. Execute and return all matched ORM objects
    return list(session.scalars(query, {"term": search_term}))

```

**2. Append to `nexus/main.py`:**

```python
@app.get("/search", response_model=list[SKURead])
def search_endpoint(q: str, db: Session = Depends(get_db_session)):
    results = crud.search_skus(session=db, search_term=q)
    return results

```

### Mechanical walkthrough

1. *(In crud.py)* `from sqlalchemy import text`: (Already established syntax).
2. `fts_subquery = ( ... )`: (Basic syntax). The parentheses allow multi-line chaining without line-continuation backslashes.
3. `select(text("sku_id"))`: (Already established syntax). We explicitly ask for the string ID column, avoiding a full table retrieval.
4. `.select_from(text("skus_fts"))`: (First appearance). Because we are using raw `text()` instead of an ORM model like `SKU`, SQLAlchemy doesn't implicitly know which table to query. `select_from` explicitly defines the `FROM skus_fts` clause.
5. `.where(text("skus_fts MATCH :term"))`: (First appearance). Injects the SQLite-specific `MATCH` keyword. `:term` is a named bind parameter; we *never* use f-strings here to avoid SQL injection attacks.
6. `SKU.sku_id.in_(fts_subquery)`: (First appearance). A SQLAlchemy column operator. It compiles to `WHERE sku_id IN (SELECT ...)`. It bridges the gap, allowing the outer ORM query to filter itself based on the IDs returned by the inner Core subquery.
7. `session.scalars(query, {"term": search_term})`: (First appearance). We pass the second argument `{"term": search_term}` to bind the actual user string to the `:term` placeholder we defined in step 5, securely sanitizing the input before execution.
8. `list(...)`: (Basic syntax). Unpacks the database cursor into a standard Python list.
9. *(In main.py)* `@app.get("/search", response_model=list[SKURead])`: (First appearance). The response model is wrapped in `list[]`, instructing Pydantic to expect a list of ORM objects, iterate over them, and serialize each one individually into a list of JSON objects.
10. `def search_endpoint(q: str, ...):`: (Already established syntax). Because `q` is not enclosed in `{}` in the route path, FastAPI automatically extracts it from the URL's Query String (e.g., `/search?q=hex`).

### CS Lens

**Query Planners and Subquery Offloading.** When SQLAlchemy sends this nested query to SQLite, the SQLite query planner is intelligent enough to optimize the execution. It first hits the inverted index of `skus_fts` (which is instant, O(1) complexity). It retrieves a tiny set of matching `sku_id`s. It then uses those IDs to perform an O(1) primary-key lookup against the physical `skus` table. By nesting the query, we avoid dragging thousands of rows into Python memory just to filter them.

### SE Lens

Why use `:term` instead of Pydantic to validate the search string? **Domain Boundaries.** Pydantic validates the *schema* of data we intend to save. A search term is a purely ephemeral query parameter. It has no strict length or pattern restrictions; a user might search for `"*"` or `"10mm"`. We rely entirely on SQLAlchemy's parameter binding (`{"term": search_term}`) to neutralize the string so it cannot execute malicious SQL, entirely bypassing Pydantic for read-only query parameters.

### Commands needed to make this unit real

Ensure the FastAPI server is running (`python nexus/main.py`).

### Run it. Show the real output.

To prove the triggers are working, first Upsert a brand new SKU into the system. Note that we are using the bulk import function we wrote in Lesson 8, simulating a pipeline ingestion.

```python
# Create seed_search.py and run it once:
from db import get_db_session
from crud import bulk_import_skus
session = next(get_db_session())
bulk_import_skus(session, [{"sku_id": "SRCH-1", "name": "Titanium Hex Bolt", "description": "Aerospace grade"}])

```

Now, fire a request to the new endpoint using the Query String parameter `?q=Titanium`:

```bash
curl http://127.0.0.1:8000/search?q=Titanium

```

Output:

```text
[{"sku_id":"SRCH-1","name":"Titanium Hex Bolt","description":"Aerospace grade"}]

```

### One sentence connecting this unit to what came immediately before.

With the full-text search capability exposed over HTTP, the API is now capable of not just maintaining perfect integrity, but acting as a high-speed discovery engine for the frontend.

---

## Closing

**Connect the pieces**
To trace a complete catalog update and subsequent search: A background system calls `bulk_import_skus` (Lesson 8). The ORM is bypassed, and an `ON CONFLICT` SQLite `INSERT` runs. The `skus_ai` Database Trigger (Lesson 14) detects the insert and secretly duplicates the data into `skus_fts`. Later, the frontend JavaScript executes `fetch("/search?q=hex")` (Lesson 13/14). FastAPI routes the `q` query parameter to the endpoint (Lesson 9). The CRUD function compiles a nested subquery using `text("MATCH")` (Lesson 14) to retrieve the ORM objects. Finally, the endpoint utilizes Pydantic's `from_attributes=True` (Lesson 6) combined with `list[SKURead]` to instantly serialize the SQLAlchemy objects into a clean JSON array for the browser.

**What breaks without this**
If you deleted the triggers using `alembic downgrade -1` and then ingested a new product catalog, the system would silently succeed. However, when users opened the dashboard and searched for a product they *knew* was just added, the `search_skus` subquery would hit the stale `skus_fts` index, find zero matches, and return an empty array. The physical data would exist, but it would be completely undiscoverable by the application's search mechanisms.

**Exercises**

1. Test the FTS engine's stemming capabilities by sending a search for a partial word: `curl [http://127.0.0.1:8000/search?q=Titan](http://127.0.0.1:8000/search?q=Titan)*` (Note: FTS5 requires the `*` wildcard for prefix searches).
2. Look at the `skus_au` (After Update) trigger we wrote. Why does it execute a `VALUES ('delete', ...)` command using the `old` properties, before executing an `INSERT` using the `new` properties? What would happen to the search results if it skipped the delete step?

**Definition of Done**

* [x] Custom Alembic migration successfully executes raw DDL to create SQLite triggers.
* [x] `INSERT`, `UPDATE`, and `DELETE` database hooks keep the FTS5 external content table synchronized.
* [x] SQLAlchemy `text()` construct escapes the ORM to execute raw SQLite `MATCH` clauses.
* [x] FastAPI endpoint safely extracts URL query parameters and serializes list responses.
* [x] You can commit these changes with the message: `feat: sync search index via sqlite triggers and expose fts endpoint`.