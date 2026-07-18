# Lesson 1: Connecting to SQLite and Enforcing Data Boundaries

**What you will build**
You will build the foundational database connection engine for NexusInventory and execute the first schema definitions. The actual problem we are solving is establishing *database integrity at the engine level*. Before we add Python ORMs or validation libraries, the raw storage layer itself must be configured to reject bad data and handle concurrent operations efficiently.

**What you need to know first**
Nothing. This is the first lesson in the curriculum.

**The Pipeline**
Our ultimate backend architecture follows this data flow:
`Client Request → Pydantic (Validation) → SQLAlchemy (ORM) → SQLite (Storage)`

In this lesson, we are working exclusively at the final stage: **SQLite (Storage)**. A SKU name like `"Widget"` will eventually pass through all four stages, but today we are building the vault where `"Widget"` is permanently recorded.

---

## Concept Unit: The In-Process Database Connection

### The Problem

We need Python to communicate with a database to persist our inventory records. Traditional databases (like PostgreSQL) run as separate background servers you connect to over a network. We are using SQLite, which requires a fundamentally different mental model: the database engine runs directly inside your Python process.

### Introduce the concept in isolation

Create a temporary file named `lab_connection.py` to see how Python's built-in `sqlite3` library communicates with SQLite.

```python
import sqlite3

# Connect to an entirely in-memory, temporary database
connection = sqlite3.connect(":memory:")

# Execute a query asking SQLite for its internal version number
cursor = connection.execute("SELECT sqlite_version();")
version = cursor.fetchone()

print(f"SQLite Engine Version: {version[0]}")

```

Run this in your terminal:

```bash
python lab_connection.py

```

Output:

```text
SQLite Engine Version: 3.43.2

```

*What this proves:* There is no external server running. By simply importing the library and calling `connect()`, Python booted up a complete SQL engine within its own memory space, executed a query, and returned the result.

### Discard the throwaway example

Delete `lab_connection.py`. We will not use an ephemeral in-memory database for our real inventory system.

### Project Change

We are starting the NexusInventory project.

* **Files affected:** Create a new directory `nexus/` and a new file inside it named `db.py`.
* **Change type:** Add.
* **Location:** A brand-new file.
* **Dependencies:** Built-in `sqlite3` module.

### The New Code

```python
import sqlite3
import pathlib

DB_PATH = pathlib.Path(__file__).parent / "nexus.db"

def get_connection() -> sqlite3.Connection:
    return sqlite3.connect(
        database=DB_PATH,
        isolation_level=None
    )

```

### The Updated Project

Because this is a brand-new file, the code block above represents the entire file `nexus/db.py`. This module now serves as a dedicated factory for generating configured database connections pointing to a persistent file on disk.

### Mechanical walkthrough

1. `import sqlite3`: (First appearance). Python's standard library module for SQLite. It provides a DB-API 2.0 compliant interface.
2. `import pathlib`: (First appearance). An object-oriented way to handle file paths across different operating systems.
3. `pathlib.Path(__file__).parent / "nexus.db"`: (First appearance). `__file__` is a special Python variable representing the current script's path. `.parent` gets the directory containing it (`nexus/`). The `/` operator is overloaded by `pathlib` to join paths safely, resulting in a target database file named `nexus.db` in the same folder.
4. `def get_connection() -> sqlite3.Connection:`: (First appearance). A function definition with a type hint indicating it returns a connection object.
5. `sqlite3.connect()`: (First appearance). Bootstraps the SQLite engine and opens the database file. If the file doesn't exist, SQLite creates it.
6. `database=DB_PATH`: Passes our constructed file path.
7. `isolation_level=None`: (First appearance). By default, Python's `sqlite3` module tries to implicitly start transactions for you, which often conflicts with advanced usage and ORMs like SQLAlchemy. Setting this to `None` enables "autocommit mode," getting Python out of the way so the database handles transactions strictly according to our raw SQL commands.

### CS Lens

**Embedded vs. Client-Server Architecture.** You just utilized an embedded database. In client-server models (PostgreSQL, MySQL), your application sends a string over a TCP/IP network socket to a separate server process. The server parses it, executes it, and sends bytes back. In embedded models (SQLite), `connect()` loads the database engine's C-compiled binary directly into Python's execution thread. A query is just a local function call. The latency is practically zero, which completely changes how you can query it.

### SE Lens

Why wrap this in a `get_connection()` function instead of just calling `sqlite3.connect()` wherever we need data? **Dependency Injection and Centralization.** Later, we will need to add custom configuration (Pragmas) to every single connection. If we scatter `sqlite3.connect()` throughout our codebase, we would have to update it in 50 places. By centralizing it, we control the exact state of every connection from a single chokepoint.

### Commands needed to make this unit real

No commands needed to run this specifically yet, as it's just a definition. We will execute it in the next unit.

### One sentence connecting this unit to what came immediately before.

Now that Python can talk to the SQLite engine, we need to instruct that engine on how strictly it should treat our inventory data.

---

## Concept Unit: SQLite STRICT Tables

### The Problem

By default, SQLite uses "Flexible Typing" (also called Type Affinity). If you define a column as `INTEGER`, but accidentally insert the string `"Warehouse A"`, SQLite will happily save the string. For financial and inventory systems, silently corrupting data types is catastrophic.

### Introduce the concept in isolation

Create `lab_strict.py` to see flexible typing fail, and `STRICT` mode succeed.

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# Normal SQLite table (Flexible)
conn.execute("CREATE TABLE flexible_inventory (qty INTEGER);")
conn.execute("INSERT INTO flexible_inventory (qty) VALUES ('five');") 

# STRICT SQLite table
conn.execute("CREATE TABLE strict_inventory (qty INTEGER) STRICT;")
try:
    conn.execute("INSERT INTO strict_inventory (qty) VALUES ('five');")
except sqlite3.IntegrityError as e:
    print(f"STRICT mode caught the error: {e}")

```

Run it:

```bash
python lab_strict.py

```

Output:

```text
STRICT mode caught the error: datatype mismatch

```

*What this proves:* The first insert silently allowed text into a math column. The second insert, using the `STRICT` keyword, aborted the operation and threw an `IntegrityError` at the database level, refusing the bad data.

### Discard the throwaway example

Delete `lab_strict.py`. We will now apply this constraint to our real project schema.

### Project Change

We need to execute our first table creation against our real database.

* **Files affected:** Create a new file `nexus/init_db.py`.
* **Change type:** Add.
* **Location:** Brand-new file.
* **Dependencies:** Depends on `get_connection` from `nexus.db`.

### The New Code

```python
from db import get_connection

def setup_database():
    conn = get_connection()
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        region TEXT NOT NULL
    ) STRICT;
    """
    
    conn.execute(create_table_sql)
    print("Database schema initialized.")

if __name__ == "__main__":
    setup_database()

```

### The Updated Project

This is the complete `nexus/init_db.py` file. It imports our connection factory and executes a raw SQL Data Definition Language (DDL) statement to create our first table, mandating strict typing on the `locations` table.

### Mechanical walkthrough

1. `from db import get_connection`: (First appearance). Standard Python relative import pulling our factory function into this script.
2. `def setup_database():`: A function to encapsulate our initialization logic.
3. `conn = get_connection()`: Invokes our factory, returning a live `sqlite3.Connection` object pointing to `nexus.db`.
4. `""" ... """`: Python multi-line string literal, allowing us to format SQL readably.
5. `CREATE TABLE IF NOT EXISTS locations`: (First appearance). SQL command to define a new table only if it hasn't been created yet.
6. `id INTEGER PRIMARY KEY`: (First appearance). Defines an integer column that uniquely identifies the row. In SQLite, this automatically behaves as an auto-incrementing ID.
7. `name TEXT NOT NULL`: (First appearance). Defines a text string column. `NOT NULL` prevents inserting empty/missing values.
8. `STRICT`: (First appearance). An SQLite-specific table option (added in SQLite 3.37.0) that disables flexible typing, forcing the engine to strictly enforce `INTEGER` and `TEXT` declarations.
9. `conn.execute(create_table_sql)`: Sends the string to the SQLite engine for execution.
10. `if __name__ == "__main__":`: (First appearance). Python idiom ensuring `setup_database()` only runs if this script is executed directly from the terminal, not if it's imported by another file.

### CS Lens

**Schema vs. Application Logic.** By using `STRICT` and `NOT NULL`, we are pushing invariants (rules that must always be true) as far down the stack as possible. You could write a Python `if` statement to check if a name is a string, but Python code can be bypassed, refactored poorly, or hit via a different script. A database-level constraint cannot be bypassed by a buggy application.

### SE Lens

Why didn't SQLite just use strict typing from the beginning? **Backwards compatibility.** SQLite was created in 2000, heavily mimicking the dynamic typing of languages like Tcl. To change the default now would break millions of legacy applications. `STRICT` is an opt-in feature for modern software engineering practices. We opt in to pay a slight mental overhead in exchange for the guarantee that our data is exactly the shape we expect.

### Commands needed to make this unit real

Execute the initialization script to create the database file and table.

```bash
python nexus/init_db.py

```

### Run it. Show the real output.

```text
Database schema initialized.

```

*Note: If you look in your `nexus/` folder, you will now see a physical file named `nexus.db`.*

### One sentence connecting this unit to what came immediately before.

We now have a strict table inside a permanent file, but if multiple warehouse workers try to write to this file simultaneously, SQLite's default locking mechanism will bottleneck the system.

---

## Concept Unit: Production Pragmas (WAL Mode)

### The Problem

By default, when SQLite writes data, it locks the *entire database file*. If a background script is inserting 10,000 new inventory items, any API request trying to simply read a warehouse location will freeze and timeout waiting for the lock to release.

### Introduce the concept in isolation

Create `lab_pragma.py` to ask SQLite what its current journaling mode is.

```python
import sqlite3

conn = sqlite3.connect(":memory:")
cursor = conn.execute("PRAGMA journal_mode;")
print(f"Default mode: {cursor.fetchone()[0]}")

conn.execute("PRAGMA journal_mode = WAL;")
cursor = conn.execute("PRAGMA journal_mode;")
print(f"New mode: {cursor.fetchone()[0]}")

```

Run it:

```bash
python lab_pragma.py

```

Output:

```text
Default mode: memory
New mode: wal

```

*What this proves:* We can intercept the SQLite engine using a `PRAGMA` command to change its fundamental operational behavior dynamically.

### Discard the throwaway example

Delete `lab_pragma.py`. We will now bake this setting into our central connection factory.

### Project Change

We need to update our connection factory so that every single connection explicitly turns on Write-Ahead Logging (WAL) and enforces Foreign Keys (which SQLite ignores by default).

* **Files affected:** `nexus/db.py`.
* **Change type:** Modify.
* **Location:** Inside `get_connection()`, right before returning the connection.

### The New Code

```python
    conn = sqlite3.connect(
        database=DB_PATH,
        isolation_level=None
    )
    
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    
    return conn

```

### The Updated Project

Here is the fully reconstructed `nexus/db.py`, showing exactly where the new lines live inside the factory function.

```python
import sqlite3
import pathlib

DB_PATH = pathlib.Path(__file__).parent / "nexus.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(
        database=DB_PATH,
        isolation_level=None
    )
    
    # ← new: Configure engine behavior for production
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    
    return conn

```

The `get_connection()` function now returns a connection that is fully armed for concurrency and relationship enforcement.

### Mechanical walkthrough

1. `conn = sqlite3.connect(...)`: Captures the connection object into a variable instead of returning it immediately.
2. `conn.execute(...)`: Calls our execution method.
3. `PRAGMA`: (First appearance). An SQL extension specific to SQLite used to modify the operation of the SQLite library itself, rather than querying table data.
4. `journal_mode = WAL`: (First appearance). Sets the logging strategy to Write-Ahead Logging.
5. `foreign_keys = ON`: (First appearance). Forces SQLite to actually check foreign key constraints (e.g., ensuring you don't add an item to a warehouse location ID that doesn't exist). For historical reasons, SQLite parses foreign keys but ignores enforcing them unless this Pragma is active.
6. `return conn`: Returns the configured connection to the caller.

### CS Lens

**Write-Ahead Logging (WAL).** In SQLite's default "rollback journal" mode, writing requires copying the original file, editing the main file, and holding an exclusive lock. In `WAL` mode, SQLite appends new changes to a separate file (named `nexus.db-wal`). Because writes go to a side-file, readers can continue reading from the main file uninterrupted. **Readers do not block writers, and writers do not block readers.** This single command transforms SQLite from a single-user toy into a highly concurrent production engine.
*Also recognized in:* PostgreSQL, MySQL (InnoDB Redo Logs), file systems (ext4 journaling), and Kafka's append-only logs.

### SE Lens

What is the tradeoff of WAL? It leaves behind trailing `-wal` and `-shm` (shared memory) files on your filesystem next to your main `.db` file. If you are zipping up your database to email it or back it up, grabbing just `nexus.db` will result in a corrupted or out-of-date backup if you forget the `-wal` file. Additionally, WAL mode does not work over networked file systems (like NFS or SMB drives) due to lack of shared memory primitives — it requires a direct local disk.

### Commands needed to make this unit real

No commands needed; we modified a factory function used by other scripts.

### One sentence connecting this unit to what came immediately before.

With our database configured for strict typing and high concurrency, we have established a rock-solid foundation that we can now confidently load complex inventory hierarchies into.

---

## Closing

**Connect the pieces**
If we were to pass the data `"East Coast Warehouse"` into our system today, the pipeline looks like this: Python calls `get_connection()`, which opens `nexus.db` and immediately activates `WAL` mode and `foreign_keys`. We then execute an `INSERT` statement containing `"East Coast Warehouse"`. The SQLite engine intercepts this, checks its internal schema, verifies that the `locations` table was created with `STRICT` mode, confirms that `"East Coast Warehouse"` satisfies the `TEXT` requirement, appends the bytes to the `nexus.db-wal` file safely without blocking other readers, and successfully completes the transaction.

**What breaks without this**
Let's intentionally sabotage our connection factory. Open `nexus/db.py` and comment out the foreign keys Pragma:

```python
    # conn.execute("PRAGMA foreign_keys = ON;")

```

If you were to create an `items` table that references a `location_id`, and then insert an item pointing to Location ID 9999 (which doesn't exist), **it would succeed.** SQLite would silently accept orphaned data, completely destroying the integrity of our inventory tracking. (Un-comment the line to restore safety).

**Exercises**

1. Modify `lab_pragma.py` to also print out the default value of `PRAGMA foreign_keys;`. You will see it is `0` (off) by default.
2. In `init_db.py`, try changing the `region TEXT NOT NULL` to `region JSON STRICT`. Run it. Note the error. SQLite `STRICT` mode only supports `INT, INTEGER, REAL, TEXT, BLOB, ANY`. You cannot invent types in `STRICT` mode.

**Definition of Done**

* [x] A central database connection factory exists.
* [x] Connections are configured for `WAL` concurrency and strict foreign keys.
* [x] A `locations` table is created using `STRICT` mode.
* [x] You can commit these changes with the message: `chore: establish strict, WAL-enabled sqlite connection factory and initial schema`.