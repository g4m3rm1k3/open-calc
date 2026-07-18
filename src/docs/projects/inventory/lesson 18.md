# Lesson 18: Schema Expansion and Analytical Aggregations

**What you will build**
You will expand the database to include a `Supplier` entity, link existing products to it, and build an analytics endpoint that calculates live inventory statistics using SQL aggregations. Finally, you will add a reporting panel to the frontend dashboard. The actual problem we are solving is data summarization: moving from operating on single rows (CRUD) to calculating mathematical aggregates (counts, sums) across thousands of rows efficiently, and surfacing those insights to the user.

**What you need to know first**
From Lesson 4 & 5: SQLAlchemy `ForeignKey` and `relationship`. From Lesson 10: Alembic migrations. From Lesson 11: Vanilla JavaScript DOM manipulation.

**The Pipeline**
`Browser (JS/DOM) → FastAPI (Routing) → Pydantic (Validation) → [ SQLAlchemy (Aggregations) ] → SQLite (Storage)`

This lesson touches the entire pipeline but heavily emphasizes the **SQLAlchemy (Aggregations)** stage. Instead of returning raw rows from SQLite, we will instruct the SQLite engine to group and count data before it ever reaches Python memory, returning lightweight statistical payloads.

---

## Concept Unit: Expanding the Relational Schema

### The Problem

Our system tracks products (`skus`), but it does not track where we buy them from. We need to introduce a new `suppliers` table and link our existing `skus` to it. Because we already have data in the `skus` table, adding a new foreign key column requires careful handling so we don't break existing rows that do not yet have a supplier.

### Introduce the concept in isolation

*Skipped.* We are reusing the SQLAlchemy `DeclarativeBase`, `Mapped`, `ForeignKey`, and `relationship` constructs thoroughly labbed in Lessons 4 and 5.

### Project Change

We will add the `Supplier` model to our registry and update the `SKU` model to establish a One-to-Many relationship between them.

* **Files affected:** `nexus/models.py`.
* **Change type:** Modify.
* **Location:** Append `Supplier` to the file, and modify the `SKU` class definition near the top.
* **Dependencies:** None.

### The New Code

```python
class Supplier(Base):
    __tablename__ = "suppliers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    
    skus: Mapped[list["SKU"]] = relationship(back_populates="supplier")

```

### The Updated Project

The smallest enclosing structures for these changes are the class definitions themselves. Here are the fully reconstructed `Supplier` and `SKU` classes within `nexus/models.py` (other models in the file remain unchanged).

```python
class SKU(Base):
    __tablename__ = "skus"
    sku_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))
    weight: Mapped[float | None] = mapped_column(Float, default=None)
    
    # ← new: Nullable foreign key linking to the new Supplier table
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"))
    supplier: Mapped["Supplier | None"] = relationship(back_populates="skus")

# ← new: The Supplier entity
class Supplier(Base):
    __tablename__ = "suppliers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    
    skus: Mapped[list["SKU"]] = relationship(back_populates="supplier")

```

The ORM is now aware of the new table and the bidirectional link, allowing a supplier to have many SKUs.

### Mechanical walkthrough

1. *(In SKU)* `supplier_id: Mapped[int | None]`: (Hard concept reappearing: Optional Types from Lesson 3). We explicitly declare this as `int | None` (nullable).
2. `= mapped_column(ForeignKey("suppliers.id"))`: (Already established syntax).
3. `supplier: Mapped["Supplier | None"] = relationship(back_populates="skus")`: (Already established syntax). The object-oriented traversal property.
4. *(In Supplier)* `class Supplier(Base):`: (Already established syntax).
5. `id: Mapped[int] = mapped_column(primary_key=True)`: (Already established syntax).
6. `name: Mapped[str] = mapped_column(String(100))`: (Already established syntax).
7. `skus: Mapped[list["SKU"]] = relationship(back_populates="supplier")`: (Already established syntax).

### CS Lens

**Schema Evolution and Backwards Compatibility.** When altering a database schema that already contains production data, any new column added to an existing table *must* be nullable, or provide a default value. If we had defined `supplier_id` as `Mapped[int]` (NOT NULL), the migration would immediately crash, because SQLite would not know what integer to assign to the thousands of SKUs already existing in the database.

### SE Lens

Why did we put `supplier_id` on the `SKU` model and not on the `Item` model? **Domain Normalization.** A Supplier provides a specific type of product (the catalog SKU definition), not individual serialized units. If a supplier provides M5 Bolts, all M5 Bolts come from them. Linking the supplier to the individual `Item` would cause massive data duplication (storing the same `supplier_id` 10,000 times for 10,000 bolts) and violate the Third Normal Form (3NF) of database design.

### Commands needed to make this unit real

Generate and apply the Alembic migration to physically alter the SQLite file.

```bash
alembic revision --autogenerate -m "add supplier table"
alembic upgrade head

```

### Run it. Show the real output.

```text
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.autogenerate.compare] Detected added table 'suppliers'
INFO  [alembic.autogenerate.compare] Detected added column 'skus.supplier_id'
INFO  [alembic.autogenerate.compare] Detected added foreign key on 'skus'
  Generating /nexus/alembic/versions/9f8e7d6c5b4a_add_supplier_table.py ...  done

INFO  [alembic.runtime.migration] Running upgrade 7a8b9c0d1e2f -> 9f8e7d6c5b4a, add supplier table

```

### One sentence connecting this unit to what came immediately before.

With the tables established, we need to extract statistical information about them—specifically, calculating exactly how many distinct SKUs belong to each supplier.

---

## Concept Unit: SQL Aggregations and GROUP BY

### The Problem

To display a "Supplier Health" dashboard, we need a list of suppliers and the total count of SKUs they provide. We *could* query all suppliers, loop through them in Python, and run `len(supplier.skus)`. However, doing so would pull every single product row from the hard drive into RAM, causing an N+1 performance collapse (as seen in Lesson 5) purely to do basic math. The database must do the counting.

### Introduce the concept in isolation

Create `lab_groupby.py` to observe how SQLAlchemy commands the database to aggregate data mathematically.

```python
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import Session
from models import Base, SKU, Supplier

engine = create_engine("sqlite:///:memory:", echo=True)
Base.metadata.create_all(engine)

with Session(engine) as session:
    # Seed suppliers and SKUs
    s1 = Supplier(name="Acme Corp")
    s2 = Supplier(name="Global Tech")
    session.add_all([s1, s2])
    session.flush()
    
    session.add_all([
        SKU(sku_id="A1", name="Anvil", supplier_id=s1.id),
        SKU(sku_id="A2", name="TNT", supplier_id=s1.id),
        SKU(sku_id="G1", name="Microchip", supplier_id=s2.id)
    ])
    session.commit()

    print("\n--- Executing Aggregation Query ---")
    # Construct a query using group_by and func.count
    query = (
        select(Supplier.name, func.count(SKU.sku_id))
        .join(SKU, Supplier.id == SKU.supplier_id)
        .group_by(Supplier.id)
    )
    
    # We use session.execute() because we are returning a Tuple, not an ORM Object
    results = session.execute(query).all()
    
    for row in results:
        # row[0] is Supplier.name, row[1] is the count
        print(f"Supplier: {row[0]}, Total SKUs: {row[1]}")

```

Run it:

```bash
python lab_groupby.py

```

Output:

```text
--- Executing Aggregation Query ---
INFO sqlalchemy.engine.Engine SELECT suppliers.name, count(skus.sku_id) AS count_1 FROM suppliers JOIN skus ON suppliers.id = skus.supplier_id GROUP BY suppliers.id
Supplier: Acme Corp, Total SKUs: 2
Supplier: Global Tech, Total SKUs: 1

```

*What this proves:* The `func.count()` and `.group_by()` methods force SQLite to collapse the rows. The engine counts the data locally and returns just two lightweight tuples to Python.

### Discard the throwaway example

Delete `lab_groupby.py`. We will now implement this logic in our CRUD layer.

### Project Change

We will add a new analytics function to `nexus/crud.py` to retrieve these statistics.

* **Files affected:** `nexus/crud.py`.
* **Change type:** Add.
* **Location:** At the bottom of the file.
* **Dependencies:** Requires importing `func` and `Supplier`.

### The New Code

```python
from sqlalchemy import func
from models import Supplier

def get_supplier_stats(session: Session) -> list[tuple[str, int]]:
    query = (
        select(Supplier.name, func.count(SKU.sku_id))
        .join(SKU, Supplier.id == SKU.supplier_id)
        .group_by(Supplier.id)
    )
    return session.execute(query).all()

```

### The Updated Project

Because this is a brand-new, freestanding function, the block above represents the entirety of what is being appended to `nexus/crud.py`.

### Mechanical walkthrough

1. `from sqlalchemy import func`: (Already established syntax). Imports the generator for SQL functions.
2. `from models import Supplier`: (Already established syntax).
3. `def get_supplier_stats(session: Session) -> list[tuple[str, int]]:`: (Basic syntax). The return type hint explicitly states this function returns a list of tuples (a string and an integer), *not* ORM objects.
4. `select(Supplier.name, func.count(SKU.sku_id))`: (First appearance). Instead of passing a whole class (`select(Supplier)`), we pass specific columns. `func.count` wraps the SKU ID column in a mathematical aggregate.
5. `.join(SKU, Supplier.id == SKU.supplier_id)`: (First appearance). Explicitly joins the two tables together in the SQL statement. Because we only want suppliers who actually have SKUs, a standard INNER JOIN is appropriate.
6. `.group_by(Supplier.id)`: (First appearance). The linchpin of aggregation. It tells the SQL engine: "Every time you see a unique `Supplier.id`, collapse all associated rows into a single row, and apply the `count()` function to the collapsed data."
7. `session.execute(query).all()`: (Already established syntax). Executes the compiled SQL and retrieves all resulting tuples.

**Execution trace for SQL Grouping Engine:**

```text
Step 1 (Join): Engine matches Supplier 1 (Acme) to SKU A1.
Step 2 (Join): Engine matches Supplier 1 (Acme) to SKU A2.
Step 3 (Group): Engine encounters GROUP BY Supplier 1. 
                It collapses the two rows from Step 1 and 2.
Step 4 (Aggregate): Engine applies count() to the collapsed SKUs. Output: 2.
Step 5 (Return): Engine returns ('Acme Corp', 2) to Python.

```

### CS Lens

**The MapReduce Paradigm.** While MapReduce is famous for distributed big data, SQL `GROUP BY` is the exact same concept running on a single node. The `JOIN` and `WHERE` clauses act as the *Map* phase (filtering and pairing data). The `GROUP BY` and `func.count()` act as the *Reduce* phase (folding multiple mapped values down into a single summary statistic).

### SE Lens

Why `group_by(Supplier.id)` instead of `group_by(Supplier.name)`? **Primary Key Safety.** It is entirely possible for two distinct supplier companies to both be legally named "Acme Corp". If we group by `name`, the database will accidentally combine their SKUs together into a single count. Always group by the immutable Primary Key to guarantee mathematical accuracy, even if you are only selecting the name for display.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

Because our CRUD function returns raw Python tuples, FastAPI will not know how to format them for the network, requiring us to define a custom Pydantic response schema.

---

## Concept Unit: Analytic Response Schemas

### The Problem

FastAPI uses Pydantic to serialize data to JSON. If we pass a raw tuple `("Acme Corp", 2)` directly to the API router, FastAPI might serialize it as a JSON array `["Acme Corp", 2]`. This is brittle; frontend developers won't know that index 0 is the name and index 1 is the count. We must map this tuple into a strictly keyed JSON object.

### Introduce the concept in isolation

*Skipped.* We are reusing the Pydantic `BaseModel` parsing mechanics heavily labbed in Lesson 3 and Lesson 6.

### Project Change

We will define the `SupplierStats` outbound schema, and add the analytics endpoint to our FastAPI router.

* **Files affected:** `nexus/schemas.py` and `nexus/main.py`.
* **Change type:** Modify.
* **Location:** At the bottom of both files.
* **Dependencies:** Requires importing the new schema in `main.py`.

### The New Code

**1. Append to `nexus/schemas.py`:**

```python
class SupplierStats(BaseModel):
    supplier_name: str
    total_skus: int

```

**2. Append to `nexus/main.py`:**

```python
from schemas import SupplierStats

@app.get("/suppliers/stats", response_model=list[SupplierStats])
def get_supplier_stats_endpoint(db: Session = Depends(get_db_session)):
    results = crud.get_supplier_stats(session=db)
    
    # Manually map the tuples into dictionaries for Pydantic
    formatted = [
        {"supplier_name": row[0], "total_skus": row[1]} 
        for row in results
    ]
    return formatted

```

### The Updated Project

The smallest enclosing structures are the standalone schema and function. Ensure these are cleanly appended to the bottoms of `schemas.py` and `main.py`.

### Mechanical walkthrough

1. *(In schemas.py)* `class SupplierStats(BaseModel):`: (Already established syntax). An outbound view model. Notice we do not use `from_attributes=True` here, because we are not mapping ORM classes; we are mapping basic dictionaries.
2. `supplier_name: str`, `total_skus: int`: (Basic syntax). The explicit JSON keys we promise to send to the frontend.
3. *(In main.py)* `@app.get("/suppliers/stats", response_model=list[SupplierStats])`: (Already established syntax).
4. `results = crud.get_supplier_stats(session=db)`: (Already established syntax). Retrieves the `list[tuple[str, int]]`.
5. `[{"supplier_name": row[0], "total_skus": row[1]} for row in results]`: (First appearance). A Python List Comprehension. It iterates over the database tuples and explicitly transforms each one into a dictionary mapping the indexes to the exact keys Pydantic expects.
6. `return formatted`: (Already established syntax). Hands the list of dictionaries to FastAPI for final JSON serialization.

### CS Lens

**Data Transformation Pipelines.** The data has now successfully changed shapes four times: physical bytes on SQLite disk -> SQL result tuples -> Python dictionaries -> JSON network strings. This rigid, step-by-step transformation is the backbone of robust backend engineering, ensuring that changes at one end (like adding a column to SQLite) do not accidentally leak out to the other end (the JSON network boundary).

### SE Lens

Couldn't we have just skipped the list comprehension and had `crud.py` return the dictionaries directly? **Layer Purity.** `crud.py` speaks to the database. Its job is to return Python data structures that mirror SQL results (tuples or ORM models). It shouldn't know about `supplier_name` or what the API layer wants. By doing the transformation in `main.py` (the Controller), we keep the CRUD layer pure and reusable for other non-API tasks, like background reporting scripts.

### Commands needed to make this unit real

To test this, we need actual suppliers and linked SKUs in our database. Create and run a temporary seed script `seed_suppliers.py`:

```python
from db import get_db_session
from models import Supplier, SKU
session = next(get_db_session())

s1 = Supplier(name="Stark Industries")
session.add(s1)
session.flush()

session.add(SKU(sku_id="REP-1", name="Repulsor", supplier_id=s1.id))
session.commit()
print("Supplier stats seeded.")

```

Run it: `python seed_suppliers.py`, then delete the script.

### Run it. Show the real output.

Ensure FastAPI is running, then hit the new endpoint:

```bash
curl http://127.0.0.1:8000/suppliers/stats

```

Output:

```text
[{"supplier_name":"Stark Industries","total_skus":1}]

```

### One sentence connecting this unit to what came immediately before.

With the analytical data correctly structured and exposed via the REST API, we can now fetch it and bind it to a new reporting component on the frontend dashboard.

---

## Concept Unit: Frontend Data Binding for Analytics

### The Problem

Our frontend dashboard (Lesson 11) currently only shows the operational Activity Table. We want to display our new Supplier Statistics. We must add a new structural container to the HTML and write asynchronous JavaScript to query the `/suppliers/stats` endpoint, iterating over the returned JSON to build UI elements.

### Introduce the concept in isolation

*Skipped.* We are reusing the DOM manipulation mechanics (`document.getElementById`, `innerHTML`) and asynchronous `fetch()` patterns heavily labbed in Lesson 11 and 12.

### Project Change

We will add a secondary table to the top of `index.html` and append a fetch function to `app.js` to populate it on page load.

* **Files affected:** `nexus/frontend/index.html` and `nexus/frontend/app.js`.
* **Change type:** Modify.
* **Location:** Inside the HTML `<body>`, and at the bottom of the JavaScript file.
* **Dependencies:** None.

### The New Code

**1. Modify `nexus/frontend/index.html`:**

```html
<body>
    <h2>NexusInventory Dashboard</h2>
    
    <!-- ← new: The Analytics Panel -->
    <div style="background: white; padding: 15px; margin-bottom: 20px; border: 1px solid #e4e4e7;">
        <h3>Supplier Health (SKU Counts)</h3>
        <ul id="supplier-stats-list">
            <!-- JS will inject list items here -->
        </ul>
    </div>

    <h3>SKU Activity</h3>
    <table class="activity-table">
        <!-- ... existing table content remains unchanged ... -->

```

**2. Append to `nexus/frontend/app.js`:**

```javascript
async function fetchAndRenderSupplierStats() {
    try {
        const response = await fetch(`${API_BASE}/suppliers/stats`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        
        const stats = await response.json();
        const listContainer = document.getElementById("supplier-stats-list");
        
        for (const stat of stats) {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${stat.supplier_name}:</strong> ${stat.total_skus} active SKUs`;
            listContainer.appendChild(li);
        }
    } catch (error) {
        console.error("Analytics Error:", error);
    }
}

// Call it alongside the existing fetchAndRenderSKU
fetchAndRenderSupplierStats();

```

### The Updated Project

The smallest enclosing structure for the HTML change is the `<body>` element. Ensure your `index.html` structure matches this hierarchy:

```html
<body>
    <h2>NexusInventory Dashboard</h2>
    
    <div style="background: white; padding: 15px; margin-bottom: 20px; border: 1px solid #e4e4e7;">
        <h3>Supplier Health (SKU Counts)</h3>
        <ul id="supplier-stats-list">
            <!-- JS will inject list items here -->
        </ul>
    </div>

    <h3>SKU Activity</h3>
    <table class="activity-table">
        <thead>
            <tr>
                <th>SKU ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="sku-table-body">
            <!-- JavaScript will inject rows here -->
        </tbody>
    </table>
    <script src="app.js"></script>
</body>

```

The dashboard now explicitly divides its layout into an analytical summary panel at the top, and the tactical action table below it.

### Mechanical walkthrough

1. *(In HTML)* `<div style="...">`: (Basic syntax). Inline CSS establishing a visual bounding box to separate the analytics panel from the main table.
2. `<ul id="supplier-stats-list">`: (Basic syntax). Semantic HTML for an unordered list, providing the target ID for our JavaScript.
3. *(In JS)* `async function fetchAndRenderSupplierStats() {`: (Already established syntax).
4. `const response = await fetch(.../suppliers/stats)`: (Already established syntax). Dispatches the GET request.
5. `for (const stat of stats) {`: (First appearance in JS). The `for...of` loop in JavaScript is the equivalent of Python's `for element in array`. It iterates safely over the JSON array.
6. `const li = document.createElement("li")`: (Already established syntax). Constructs the list item element in memory.
7. `li.innerHTML = \`...``: (Already established syntax). Interpolates the structured data (`stat.supplier_name`and`stat.total_skus`) derived perfectly from our Pydantic schema.
8. `listContainer.appendChild(li)`: (Already established syntax). Binds the in-memory element to the live page.

**Execution trace for UI rendering loop:**

```text
State: `stats` array contains [{"supplier_name": "Stark Industries", "total_skus": 1}].
Iteration 1: Extracts object.
             Creates <li> element.
             Sets HTML: "<strong>Stark Industries:</strong> 1 active SKUs".
             Appends <li> to <ul> DOM node. Page updates visually.
Loop terminates.

```

### CS Lens

**Parallel Resource Fetching.** When the browser reaches the bottom of `app.js`, it executes `fetchAndRenderSKU()` and `fetchAndRenderSupplierStats()` sequentially. However, because both functions are `async` and utilize non-blocking HTTP requests, the browser dispatches *both* network calls to FastAPI almost simultaneously. It does not wait for the SKUs to arrive before asking for the stats. This parallelism drastically reduces the total load time of the dashboard.

### SE Lens

Why use a basic `<ul>` list for the stats instead of a charting library like Chart.js? **Dependency Weight.** Bringing in a massive third-party visualization library for a single data point is extreme overkill, inflating the size of your frontend payload and increasing render time. For basic statistical summaries, native semantic HTML is vastly superior. Reach for complex visualization libraries only when the data density strictly demands graphical interpretation (e.g., historical trend lines).

### Commands needed to make this unit real

No commands needed.

### Run it. Show the real output.

Refresh your browser tab at `[http://127.0.0.1:8000/](http://127.0.0.1:8000/)`.

At the top of the page, above the Activity Table, you will now see:

**Supplier Health (SKU Counts)**

* **Stark Industries:** 1 active SKUs

### One sentence connecting this unit to what came immediately before.

By expanding our backend relational schema, writing an optimized aggregation query, and fetching it asynchronously, our full-stack application can now provide real-time analytical reporting directly to the user.

---

## Closing

**Connect the pieces**
To trace the aggregation pipeline: A user loads `index.html`. `app.js` dispatches an async `fetch` to `/suppliers/stats` (Lesson 18). FastAPI triggers the endpoint, which requests a database session (Lesson 9). The CRUD layer executes a SQLAlchemy query using `.join()` and `.group_by()` combined with `func.count()` (Lesson 18). SQLite performs the MapReduce calculation in C-memory and returns lightweight tuples. FastAPI's controller loop transforms the tuples into dictionaries and passes them to Pydantic's `SupplierStats` schema (Lesson 18) for JSON serialization. The frontend receives the JSON and uses DOM manipulation (Lesson 11) to render the statistics cleanly into a list above the main activity dashboard.

**What breaks without this**
If you did not use `.group_by(Supplier.id)` and instead used `len()` in Python, your `crud.py` function would look like this: `skus = session.scalars(select(SKU)).all()`. If NexusInventory eventually scales to 100,000 SKUs, this single function would load 100,000 ORM objects into Python memory on every dashboard refresh. The server would instantly hit 100% CPU utilization, exhaust its RAM, and crash via an Out Of Memory error, entirely destroying the system's stability.

**Exercises**

1. Add a second supplier to the database and assign some existing SKUs to it (using a quick seed script or modifying the database directly). Refresh the dashboard and watch the SQLite aggregation engine instantly reflect the updated math.
2. Modify the SQL query in `get_supplier_stats` to order the results so the supplier with the *highest* SKU count is always returned first. Hint: use `.order_by(func.count(SKU.sku_id).desc())`.

**Definition of Done**

* [x] Schema expanded with `Supplier` model and nullable foreign key migration.
* [x] `crud.py` executes mathematical aggregations via `.group_by()` and `func.count()`.
* [x] Controller layer maps raw SQL tuples into strictly typed `SupplierStats` Pydantic payloads.
* [x] Frontend HTML layout split to support an analytical summary panel.
* [x] Asynchronous JavaScript loops over the API response to render DOM elements dynamically.
* [x] You can commit these changes with the message: `feat: implement supplier schema expansion and analytics dashboard`.