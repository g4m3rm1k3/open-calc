# Lesson 2: Querying Hierarchies and Text

**What you will build**
You will design a self-referential location tree to model warehouse zones, aisles, and bins, query that tree efficiently using a Recursive Common Table Expression (CTE), and build a high-performance text search engine for the product catalog. The core problem we are solving is escaping the limitations of flat relational rows — physical inventory is deeply nested, and product search is inherently unstructured.

**What you need to know first**
From Lesson 1: SQLite connection factories, `STRICT` mode, and executing raw SQL strings.

**The Pipeline**
`Client Request → Pydantic (Validation) → SQLAlchemy (ORM) → [ SQLite (Storage) ]`
We remain strictly in the Storage stage. A search query like `"find all M5 bolts in the NY Warehouse"` requires the storage layer to traverse a location tree and perform an indexed text match before returning bytes up the chain to the ORM.

---

## Concept Unit: Self-Referential Foreign Keys

### The Problem

A `location` isn't just a building. A building contains zones, a zone contains aisles, and an aisle contains bins. If we create separate tables for `buildings`, `zones`, `aisles`, and `bins`, our schema becomes rigid — adding a "shelf" level breaks the database. We need a single `locations` table where a location can securely point to another location as its container.

### Introduce the concept in isolation

Create `lab_foreign_key.py` to see a table referencing itself.

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON;")

conn.execute("""
    CREATE TABLE folders (
        id INTEGER PRIMARY KEY,
        name TEXT,
        parent_id INTEGER REFERENCES folders(id)
    );
""")

conn.execute("INSERT INTO folders (id, name, parent_id) VALUES (1, 'root', NULL);")
conn.execute("INSERT INTO folders (id, name, parent_id) VALUES (2, 'documents', 1);")

try:
    # Attempting to put a folder inside a parent that doesn't exist (ID 99)
    conn.execute("INSERT INTO folders (id, name, parent_id) VALUES (3, 'secrets', 99);")
except sqlite3.IntegrityError as e:
    print(f"Foreign key blocked the insert: {e}")

```

Run it:

```bash
python lab_foreign_key.py

```

Output:

```text
Foreign key blocked the insert: FOREIGN KEY constraint failed

```

*What this proves:* By adding a `parent_id` column that `REFERENCES` the `id` column of the *same* table, SQLite enforces a strict hierarchy. You cannot insert a child record if its designated parent does not exist.

### Discard the throwaway example

Delete `lab_foreign_key.py`. We will now apply this adjacency list pattern to NexusInventory.

### Project Change

We need to redefine our `locations` table. Since we are in the early stages, we will modify the initialization script and recreate the database file.

* **Files affected:** `nexus/init_db.py`, and delete the existing `nexus/nexus.db` file from Lesson 1.
* **Change type:** Replace/Modify.
* **Location:** Inside `setup_database()`, replacing the `create_table_sql` string.
* **Dependencies:** None.

### The New Code

```python
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        region TEXT NOT NULL,
        parent_id INTEGER,
        FOREIGN KEY(parent_id) REFERENCES locations(id)
    ) STRICT;
    """

```

### The Updated Project

Here is the updated structure in `nexus/init_db.py`. The SQL string has been replaced.

```python
from db import get_connection

def setup_database():
    conn = get_connection()
    
    # ← new: Modified table definition with parent_id and FOREIGN KEY
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        region TEXT NOT NULL,
        parent_id INTEGER,
        FOREIGN KEY(parent_id) REFERENCES locations(id)
    ) STRICT;
    """
    
    conn.execute(create_table_sql)
    print("Database schema initialized.")

if __name__ == "__main__":
    setup_database()

```

The `setup_database` function now creates a table capable of representing an infinitely deep tree of physical storage locations.

### Mechanical walkthrough

1. `parent_id INTEGER,`: (First appearance). A new column storing an integer. It does not have `NOT NULL` because top-level locations (like a Region or a Building) will have no parent, so this value will be `NULL`.
2. `FOREIGN KEY(parent_id)`: (First appearance). A table constraint declaring that `parent_id` is a relational pointer.
3. `REFERENCES`: (First appearance). The SQL keyword that defines the target of the foreign key pointer.
4. `locations(id)`: (First appearance). The target table and column. Here, it points back to the `id` column of its own `locations` table.
5. `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL`, `region TEXT NOT NULL`, `STRICT`: (Already established syntax).

### CS Lens

**The Adjacency List Pattern.** Storing trees in a relational database is a classic computer science problem. This approach is called an Adjacency List: every node knows exactly who its parent is, but it knows nothing about its children or its total depth.
*Also recognized in:* Graph data structures, filesystem directory pointers (the `..` entry), and DOM nodes (`parentNode`).

### SE Lens

What is the tradeoff of the Adjacency List? Inserts and moves are incredibly cheap — moving an entire aisle to a different warehouse is an O(1) operation (just update `parent_id` on the aisle). The cost is paid during querying. Finding "all bins inside this warehouse" is difficult because you don't know how deep the tree goes. A standard `SELECT` cannot dynamically join a table to itself an unknown number of times.

### Commands needed to make this unit real

First, delete the old database, then run the script to create the new one.

```bash
rm nexus/nexus.db
python nexus/init_db.py

```

### Run it. Show the real output.

```text
Database schema initialized.

```

### One sentence connecting this unit to what came immediately before.

We have successfully modeled a physical tree structure in our schema, but to solve the query tradeoff we just identified, we must bypass standard `SELECT` statements and use a recursive engine.

---

## Concept Unit: Recursive Common Table Expressions (CTEs)

### The Problem

If we want to find all inventory within "Warehouse A", we need the warehouse, all its zones, all aisles in those zones, and all bins in those aisles. Writing a query with a fixed number of `LEFT JOIN`s limits us to a hardcoded depth. We need a query that loops dynamically until it finds the bottom of the tree.

### Introduce the concept in isolation

Create `lab_recursive.py` to see a query loop over itself.

```python
import sqlite3

conn = sqlite3.connect(":memory:")

cursor = conn.execute("""
    WITH RECURSIVE count(x) AS (
        VALUES(1)
        UNION ALL
        SELECT x+1 FROM count WHERE x < 5
    )
    SELECT x FROM count;
""")

for row in cursor.fetchall():
    print(row[0])

```

Run it:

```bash
python lab_recursive.py

```

Output:

```text
1
2
3
4
5

```

*What this proves:* `WITH RECURSIVE` allows a query to reference its own output. It establishes an initial state (`VALUES(1)`), and then repeatedly executes the second half (`SELECT x+1`) against the results of the previous step, appending rows until the `WHERE` condition fails.

### Discard the throwaway example

Delete `lab_recursive.py`. We will build a real recursive CTE to traverse our warehouse tree.

### Project Change

We will create a new script dedicated to data traversal, seed it with a small tree, and write the recursive query.

* **Files affected:** Create a new file `nexus/tree_query.py`.
* **Change type:** Add.
* **Location:** Brand-new file.
* **Dependencies:** Depends on `get_connection` from `nexus.db`.

### The New Code

```python
from db import get_connection

def query_sublocations(parent_id: int):
    conn = get_connection()
    
    query = """
    WITH RECURSIVE location_tree AS (
        SELECT id, name, parent_id FROM locations WHERE id = ?
        UNION ALL
        SELECT loc.id, loc.name, loc.parent_id 
        FROM locations loc
        JOIN location_tree tree ON loc.parent_id = tree.id
    )
    SELECT id, name FROM location_tree;
    """
    
    cursor = conn.execute(query, (parent_id,))
    for row in cursor.fetchall():
        print(f"Found: {row[1]} (ID: {row[0]})")

```

### The Updated Project

Because this is a new file, we will also add a temporary seeding function at the top to give us data to query. Here is the full `nexus/tree_query.py`.

```python
from db import get_connection

def seed_data():
    conn = get_connection()
    conn.executescript("""
        INSERT OR IGNORE INTO locations (id, name, region, parent_id) VALUES (1, 'Northeast HQ', 'NE', NULL);
        INSERT OR IGNORE INTO locations (id, name, region, parent_id) VALUES (2, 'Zone A', 'NE', 1);
        INSERT OR IGNORE INTO locations (id, name, region, parent_id) VALUES (3, 'Aisle 1', 'NE', 2);
        INSERT OR IGNORE INTO locations (id, name, region, parent_id) VALUES (4, 'Bin 1A', 'NE', 3);
        INSERT OR IGNORE INTO locations (id, name, region, parent_id) VALUES (5, 'West Coast HQ', 'WC', NULL);
    """)

# ← new: Recursive traversal function
def query_sublocations(parent_id: int):
    conn = get_connection()
    
    query = """
    WITH RECURSIVE location_tree AS (
        SELECT id, name, parent_id FROM locations WHERE id = ?
        UNION ALL
        SELECT loc.id, loc.name, loc.parent_id 
        FROM locations loc
        JOIN location_tree tree ON loc.parent_id = tree.id
    )
    SELECT id, name FROM location_tree;
    """
    
    cursor = conn.execute(query, (parent_id,))
    for row in cursor.fetchall():
        print(f"Found: {row[1]} (ID: {row[0]})")

if __name__ == "__main__":
    seed_data()
    print("--- Searching inside Northeast HQ (ID 1) ---")
    query_sublocations(1)

```

The script seeds a 4-level deep hierarchy and an unrelated warehouse, then recursively finds everything inside ID 1.

### Mechanical walkthrough

1. `conn.executescript(""" ... """)`: (First appearance). A convenience method in the `sqlite3` module to execute multiple SQL statements separated by semicolons in one go.
2. `WITH RECURSIVE location_tree AS (`: (First appearance). The start of the Common Table Expression. It defines a temporary, virtual table named `location_tree` that exists only for the duration of this query.
3. `SELECT id, name, parent_id FROM locations WHERE id = ?`: (First appearance). The **Anchor Member**. This runs exactly once to find the root node (in our case, `id = 1`). The `?` is SQLite's parameter placeholder.
4. `UNION ALL`: (First appearance). An operator that combines the results of the top query with the results of the bottom query, keeping duplicates. In a recursive CTE, it acts as the bridge separating the anchor from the loop.
5. `SELECT loc.id, loc.name, loc.parent_id FROM locations loc`: (First appearance). The **Recursive Member**. `loc` is a table alias to save typing.
6. `JOIN location_tree tree ON loc.parent_id = tree.id`: (First appearance). The magic step. It joins the physical `locations` table against the virtual `location_tree` table. Specifically, it joins against *only the rows produced in the previous step of the recursion*.
7. `) SELECT id, name FROM location_tree;`: Closes the CTE definition and then runs a standard `SELECT` against the completely built virtual table.
8. `conn.execute(query, (parent_id,))`: (Already established). Executes the query, passing a single-item tuple `(parent_id,)` to safely replace the `?` placeholder, preventing SQL injection.

**Execution trace for `query_sublocations(1)`:**

```text
Iteration 1 (Anchor): Runs `WHERE id = 1`. 
  Yields: [id: 1, name: 'Northeast HQ', parent_id: NULL].
Iteration 2 (Recursive): Joins `locations` where `parent_id` == 1. 
  Yields: [id: 2, name: 'Zone A', parent_id: 1].
Iteration 3 (Recursive): Joins `locations` where `parent_id` == 2. 
  Yields: [id: 3, name: 'Aisle 1', parent_id: 2].
Iteration 4 (Recursive): Joins `locations` where `parent_id` == 3. 
  Yields: [id: 4, name: 'Bin 1A', parent_id: 3].
Iteration 5 (Recursive): Joins `locations` where `parent_id` == 4. 
  Yields: Zero rows. Recursion halts.
Final Result: All rows yielded in iterations 1 through 4 are combined and returned.

```

### CS Lens

**Breadth-First Search (BFS) in SQL.** The SQL engine is internally executing a graph traversal algorithm. The anchor member pushes the starting node into a queue. The recursive member dequeues nodes, finds their children, and enqueues those children. It finishes when the queue is empty.
*Also recognized in:* Pathfinding algorithms, garbage collection tracing, and network routing protocols.

### SE Lens

Why use `?` parameterization instead of Python f-strings like `f"... WHERE id = {parent_id}"`? **Security and Caching.** F-strings expose you to SQL Injection attacks if `parent_id` ever comes from user input. Furthermore, database engines cache query execution plans based on the raw SQL string. If you use f-strings, `WHERE id = 1` and `WHERE id = 2` look like entirely different queries to the parser. By using `?`, the SQL string remains identical (`WHERE id = ?`), allowing SQLite to reuse the optimized execution plan.

### Commands needed to make this unit real

Run the query script.

```bash
python nexus/tree_query.py

```

### Run it. Show the real output.

```text
--- Searching inside Northeast HQ (ID 1) ---
Found: Northeast HQ (ID: 1)
Found: Zone A (ID: 2)
Found: Aisle 1 (ID: 3)
Found: Bin 1A (ID: 4)

```

### One sentence connecting this unit to what came immediately before.

We can now pinpoint exact bins dynamically, but to know *what* to put in those bins, we need a product catalog that workers can search quickly without knowing exact spelling.

---

## Concept Unit: Full-Text Search (FTS5)

### The Problem

If a user searches the catalog for "hex bolt", a standard SQL query `SELECT * FROM skus WHERE description LIKE '%hex bolt%'` forces the database to perform a "full table scan" — reading every single row from disk and doing string math. If you have 500,000 SKUs, this is disastrously slow.

### Introduce the concept in isolation

Create `lab_fts.py` to see a virtual indexed text table in action.

```python
import sqlite3

conn = sqlite3.connect(":memory:")

conn.execute("""
    CREATE VIRTUAL TABLE text_docs USING fts5(title, body);
""")

conn.execute("INSERT INTO text_docs VALUES ('Manual', 'Use a 10mm hex bolt here.');")
conn.execute("INSERT INTO text_docs VALUES ('Memo', 'Meeting at noon.');")

# Use the MATCH operator specific to FTS tables
cursor = conn.execute("SELECT title FROM text_docs WHERE text_docs MATCH 'hex';")

print(cursor.fetchall())

```

Run it:

```bash
python lab_fts.py

```

Output:

```text
[('Manual',)]

```

*What this proves:* By defining a table as `USING fts5`, SQLite does not just store the string. It parses the string, splits it into individual words (tokens), and builds an inverted index map (e.g., the word "hex" exists in row 1). The `MATCH` operator uses this index to find rows instantly, regardless of table size.

### Discard the throwaway example

Delete `lab_fts.py`. We will now define our SKU catalog and an accompanying FTS engine.

### Project Change

We will add the `skus` table and an attached FTS5 virtual table to our schema initialization.

* **Files affected:** `nexus/init_db.py`.
* **Change type:** Add.
* **Location:** Inside `setup_database()`, directly beneath the existing `locations` table creation.

### The New Code

```python
    create_skus_sql = """
    CREATE TABLE IF NOT EXISTS skus (
        sku_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
    ) STRICT;
    
    CREATE VIRTUAL TABLE IF NOT EXISTS skus_fts USING fts5(
        sku_id, name, description,
        content='skus', content_rowid='rowid'
    );
    """
    conn.executescript(create_skus_sql)

```

### The Updated Project

Here is the complete `nexus/init_db.py` showing both tables initialized sequentially.

```python
from db import get_connection

def setup_database():
    conn = get_connection()
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        region TEXT NOT NULL,
        parent_id INTEGER,
        FOREIGN KEY(parent_id) REFERENCES locations(id)
    ) STRICT;
    """
    conn.execute(create_table_sql)
    
    # ← new: The product catalog and its search index
    create_skus_sql = """
    CREATE TABLE IF NOT EXISTS skus (
        sku_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
    ) STRICT;
    
    CREATE VIRTUAL TABLE IF NOT EXISTS skus_fts USING fts5(
        sku_id, name, description,
        content='skus', content_rowid='rowid'
    );
    """
    conn.executescript(create_skus_sql)
    
    print("Database schema initialized.")

if __name__ == "__main__":
    setup_database()

```

We now have a rigorous product catalog (`skus`) backed by an externalized search index (`skus_fts`) that watches the same data.

### Mechanical walkthrough

1. `sku_id TEXT PRIMARY KEY`: (First appearance). A primary key that is a string instead of an auto-incrementing integer. Real-world SKUs are usually alphanumeric (e.g., `HDW-BLT-10MM`).
2. `CREATE VIRTUAL TABLE`: (First appearance). An SQLite mechanism that creates an interface that *looks* like a table to `SELECT` and `INSERT` commands, but relies on hidden, custom C-code behind the scenes.
3. `USING fts5(...)`: (First appearance). Invokes the Full-Text Search version 5 extension module built into modern SQLite.
4. `sku_id, name, description`: The columns we want the FTS engine to parse and index.
5. `content='skus'`: (First appearance). An advanced optimization called an "External Content" FTS table. FTS indexes are huge. By default, FTS copies and stores the text *again*. By pointing `content` at our real `skus` table, FTS5 only stores the index map, and queries the original table for the actual text, cutting disk usage in half.
6. `content_rowid='rowid'`: (First appearance). Tells the FTS engine how to map its index back to the source table's internal row identifier.
7. `conn.executescript(create_skus_sql)`: (Already established). Executes the batch of SQL.

### CS Lens

**The Inverted Index.** The core concept of FTS5 is the Inverted Index. A normal table maps a Row ID to text data (`Row 1 -> "10mm hex bolt"`). An inverted index maps individual words back to Row IDs (`"hex" -> [Row 1, Row 42]; "bolt" -> [Row 1, Row 8]`). To find "hex bolt", the database looks up the list for "hex", the list for "bolt", and calculates the intersection of the two arrays.
*Also recognized in:* Elasticsearch, Apache Lucene, Google's core web search engine architecture, and book indexes.

### SE Lens

What is the cost of External Content FTS? **Maintenance.** Because `skus_fts` doesn't own the data, if you `UPDATE` or `DELETE` a row in the `skus` table, the `skus_fts` index does *not* automatically know about it. The index becomes "stale", returning hits for deleted items. In a production system, we must write SQLite Triggers that listen for `UPDATE` events on the `skus` table and manually sync the `skus_fts` index. We will cover database triggers later in the curriculum.

### Commands needed to make this unit real

Re-run the initialization script to add the new tables.

```bash
python nexus/init_db.py

```

### Run it. Show the real output.

```text
Database schema initialized.

```

### One sentence connecting this unit to what came immediately before.

With hierarchy traversals and fast text search established at the raw storage layer, our database engine is fully equipped.

---

## Closing

**Connect the pieces**
If an API request asks to "find all 'hex bolts' in the Northeast Region", the flow relies entirely on what we built today. First, `query_sublocations(1)` executes its Recursive CTE to dynamically compile a list of all location IDs within the Northeast Region. Second, a query against `skus_fts MATCH 'hex bolt'` utilizes the inverted index to instantly return a list of SKU IDs. Finally, we would intersect these two sets against the `items` table (which we will build soon) to locate the exact serial numbers without ever performing a slow, full-table scan.

**What breaks without this**
If you delete the `FOREIGN KEY` declaration in the `locations` table, `query_sublocations` will still run without error initially. However, without the database enforcing the adjacency list strictly, a developer could easily insert an aisle pointing to a `parent_id` of `999` (a typo). Because that parent does not exist, that entire aisle and all the stock inside it will instantly vanish from the recursive CTE traversal — creating thousands of dollars of "lost" inventory that is physically present but digitally untraceable.

**Exercises**

1. Modify `nexus/tree_query.py` to add `INSERT OR IGNORE INTO locations (id, name, region, parent_id) VALUES (6, 'Secret Bin', 'NE', 99);` before querying. Notice that it inserts successfully. Why? (Hint: Lesson 1 taught us that Foreign Keys are off by default unless enforced by our factory PRAGMA, but `seed_data` didn't use the PRAGMA on a fresh connection... wait, yes it did via `get_connection()`. If the insert fails, congratulations, the PRAGMA is working!)
2. Write a `SELECT` statement against `skus_fts` using the `MATCH` operator to find items containing the word "bracket".

**Definition of Done**

* [x] A self-referencing `locations` table exists in `init_db.py`.
* [x] A recursive CTE query successfully traverses the data in `tree_query.py`.
* [x] A product catalog (`skus`) and an external-content FTS index (`skus_fts`) are initialized.
* [x] You can commit these changes with the message: `feat: implement location adjacency tree and FTS5 sku search`.