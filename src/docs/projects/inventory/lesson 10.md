# Lesson 10: Schema Evolution with Alembic

**What you will build**
You will build a database migration pipeline using Alembic to safely add a new `weight` column to our live `skus` table without losing existing data. The problem we are solving is the "day two" operation of software: business requirements change, and tearing down the production database to recreate tables from scratch is not an option. We need version control for our database schema.

**What you need to know first**
From Lesson 4: The `DeclarativeBase` registry and SQLAlchemy `Mapped` columns. From Lesson 1: SQLite file locations.

**The Pipeline**
`Developer Action → [ Alembic (Migrations) ] → [ SQLite (Storage) ]`

This lesson introduces a new operational stage outside the standard API lifecycle: **Alembic (Migrations)**. When we change a Python model in our codebase, Alembic will detect the difference, generate the precise SQL instructions needed to transition the database, and execute them against the Storage layer.

---

## Concept Unit: Programmatic Schema Alteration

### The Problem

Up until now, we relied on `Base.metadata.create_all(engine)` in our seeding scripts. `create_all()` is fundamentally limited: it checks if a table exists, and if it doesn't, it creates it. However, if the table *does* exist, it silently skips it. If we add a `weight` column to our `SKU` class, `create_all()` will ignore the change, causing our application to crash when it attempts to save a weight to a SQLite table that has no such column.

### Introduce the concept in isolation

Create `lab_alter.py` to see how databases modify existing structures without dropping them.

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# 1. Create the initial table and data
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT);")
conn.execute("INSERT INTO products (name) VALUES ('Hammer');")

# 2. Alter the schema on the fly
conn.execute("ALTER TABLE products ADD COLUMN weight REAL;")

# 3. Update the existing record with the new field
conn.execute("UPDATE products SET weight = 1.5 WHERE id = 1;")

# Prove the data survived and the column exists
cursor = conn.execute("SELECT name, weight FROM products;")
print(f"Data after alter: {cursor.fetchone()}")

```

Run it:

```bash
python lab_alter.py

```

Output:

```text
Data after alter: ('Hammer', 1.5)

```

*What this proves:* The `ALTER TABLE` SQL command structurally changes a live table, leaving existing rows perfectly intact and populating the new column with `NULL` (or a default value) until they are updated.

### Discard the throwaway example

Delete `lab_alter.py`. We will now configure a professional tool to automate these `ALTER TABLE` commands for NexusInventory.

### Project Change

We must initialize the Alembic environment within our project directory, which generates the configuration files required to connect Alembic to our SQLAlchemy metadata.

* **Files affected:** Brand new directory `nexus/alembic/` and file `nexus/alembic.ini`.
* **Change type:** Configure/Add.
* **Location:** The root `nexus/` directory.
* **Dependencies:** Requires installing `alembic`.

### The New Code

```ini
sqlalchemy.url = sqlite:///nexus.db

```

### The Updated Project

Because Alembic generates an entire folder structure, the "smallest enclosing structure" is the generated configuration file. First, run the initialization command (see step 10), then open the generated `nexus/alembic.ini` file and change the target URL exactly as shown below:

```ini
# A snippet of the generated nexus/alembic.ini file
# ... (other config above) ...

# ← new: Point Alembic to our actual SQLite file
sqlalchemy.url = sqlite:///nexus.db

# ... (other config below) ...

```

Alembic now knows exactly which database file to inspect.

### Mechanical walkthrough

1. `sqlalchemy.url`: (First appearance). The configuration key Alembic uses to locate the database.
2. `= sqlite:///nexus.db`: (Already established syntax). The connection string we originally used in `db.py`. We must duplicate it here because Alembic runs as a standalone command-line tool, completely independent of our FastAPI server.

### CS Lens

**State Machine Transitions.** A database schema is a state machine. V1 (No weight column) is State A. V2 (Has weight column) is State B. `ALTER TABLE` is the transition function connecting them. Migrations are simply a directed acyclic graph (DAG) of these transition functions, ensuring that any developer or server can reliably step from State A to State B to State C in the exact same order.

### SE Lens

Why use Alembic instead of just running `ALTER TABLE` scripts manually in a database console? **Reproducibility and CI/CD.** If you run a script manually in production, your staging database and your coworker's local database are now out of sync. By committing migration scripts to Git, the schema becomes Infrastructure-as-Code. A Continuous Integration (CI) server can automatically run these scripts during deployment, guaranteeing the production schema always perfectly matches the application code.

### Commands needed to make this unit real

Install Alembic, then generate the environment configuration from inside your `nexus/` folder.

```bash
pip install alembic
alembic init alembic

```

*(After running this, apply the `alembic.ini` change from the steps above).*

### Run it. Show the real output.

```text
  Creating directory /nexus/alembic ...  done
  Creating directory /nexus/alembic/versions ...  done
  Generating /nexus/alembic/script.py.mako ...  done
  Generating /nexus/alembic/env.py ...  done
  Generating /nexus/alembic.ini ...  done

```

### One sentence connecting this unit to what came immediately before.

Alembic knows where the database is, but it does not yet know what our Python models look like, so we must link its execution environment to our `DeclarativeBase` registry.

---

## Concept Unit: The Alembic Environment Context (env.py)

### The Problem

When Alembic tries to auto-generate a migration, it needs to compare two things: the current state of the SQLite database, and the desired state of the SQLAlchemy models. It has the database URL, but it has no idea where to find our `Base` registry.

### Introduce the concept in isolation

*Skipped.* We are modifying an already-generated configuration file specific to the Alembic library's internal execution context, utilizing standard Python imports already labbed in Lesson 1.

### Project Change

We must import our SQLAlchemy `Base` into Alembic's Python execution script and bind it to the `target_metadata` variable.

* **Files affected:** `nexus/alembic/env.py`.
* **Change type:** Modify.
* **Location:** Near the top of the file, replacing `target_metadata = None`.
* **Dependencies:** Requires importing `Base` from our `models` module.

### The New Code

```python
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

from models import Base
target_metadata = Base.metadata

```

### The Updated Project

Here is the relevant upper section of the generated `nexus/alembic/env.py` file with our modifications inserted.

```python
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# ← new: Add the parent directory to Python's path so we can import our models
import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

# ← new: Import our specific registry and assign it
from models import Base
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ...

```

When we run Alembic commands, it will now load our `nexus/models.py` file, read the `Base.metadata` registry, and use it as the source of truth for what the database *should* look like.

### Mechanical walkthrough

1. `import sys`, `import pathlib`: (Already established syntax).
2. `sys.path.append(...)`: (First appearance). Alembic executes this file from within the `alembic/` folder. Because `models.py` is one folder up (in `nexus/`), Python cannot normally import it. We manipulate Python's internal module search path (`sys.path`) to include the parent directory, allowing `from models import Base` to succeed.
3. `target_metadata = Base.metadata`: (First appearance). Alembic provides this variable specifically for us to overwrite. `Base.metadata` contains the complete dictionary of every table, column, and foreign key we defined in Lesson 4.

### CS Lens

**Reflection vs. Declaration.** Alembic works by diffing two entirely different representations of data. It uses *Reflection* (querying the database engine for its actual table definitions) to build a graph of the current state. It uses *Declaration* (reading our `Base.metadata` Python objects) to build a graph of the desired state. It then computes the delta between the two graphs.

### SE Lens

Why must we manually mess with `sys.path`? **Execution Contexts.** When you run `python main.py`, the execution context is the `nexus/` folder. When you run `alembic revision`, the execution context is the global Alembic binary installed in your virtual environment, which is completely divorced from your project structure. Explicitly resolving paths is a defensive programming tactic required whenever third-party tooling executes code inside your repository.

### Commands needed to make this unit real

No commands needed; configuration step only.

### One sentence connecting this unit to what came immediately before.

With Alembic fully configured to read our models and our database, we can now safely alter a model and instruct Alembic to calculate the difference.

---

## Concept Unit: Autogenerating and Applying Revisions

### The Problem

We need to add a `weight` column to our product catalog. Writing the `ALTER TABLE` script manually is dangerous because we might misspell the column name, resulting in a mismatch between the database and the ORM. We want the machine to generate the SQL based strictly on the Python code.

### Introduce the concept in isolation

*Skipped.* We are executing a third-party CLI tool (`alembic revision`) to interact with the models we just configured, relying on the `ALTER` concept proven in Concept Unit 1.

### Project Change

We will add a new column to the `SKU` model, and then instruct Alembic to generate and apply the migration.

* **Files affected:** `nexus/models.py`.
* **Change type:** Modify.
* **Location:** Inside the `SKU` class.
* **Dependencies:** Requires importing `Float`.

### The New Code

```python
    weight: Mapped[float | None] = mapped_column(Float, default=None)

```

### The Updated Project

Here is the `SKU` class inside `nexus/models.py` with the new column added.

```python
from sqlalchemy import String, ForeignKey, DateTime, func, Float

class SKU(Base):
    __tablename__ = "skus"
    sku_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500))
    # ← new: The business requested we track product weight
    weight: Mapped[float | None] = mapped_column(Float, default=None)

```

The Python model now expects a `weight` column, but the SQLite database does not have one yet.

### Mechanical walkthrough

1. `weight: Mapped[float | None]`: (Already established syntax). Declares a new property that can be a decimal number or null.
2. `mapped_column(Float, default=None)`: (First appearance). `Float` translates to a SQLite `REAL` column. `default=None` ensures that any existing records (which have no weight data) will safely receive a `NULL` value when the column is added.

### CS Lens

**Idempotent State Tracking.** How does Alembic know which scripts have already been run? When Alembic applies a migration, it creates a hidden table in your database called `alembic_version`. This table has exactly one row, storing the ID of the last script applied (e.g., `3f2a1b9c`). When you run `upgrade head`, Alembic checks this table, ignores all scripts older than `3f2a1b9c`, and only executes the new ones, making the upgrade command perfectly idempotent.

### SE Lens

What is the danger of `--autogenerate`? **Blind Trust.** Autogenerate is a calculator, not a human. If you rename a column from `weight` to `mass`, Alembic will often autogenerate a script that *drops* the `weight` column (deleting all your data) and *adds* a brand new empty `mass` column. You must **always** manually read the generated python script in `alembic/versions/` before applying it to ensure it is using `op.alter_column()` instead of `op.drop_column()`.

### Commands needed to make this unit real

1. Ask Alembic to calculate the difference and generate the Python migration script:

```bash
alembic revision --autogenerate -m "add weight to skus"

```

2. Command Alembic to translate that script into SQL and execute it against the database:

```bash
alembic upgrade head

```

### Run it. Show the real output.

Step 1 output:

```text
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added column 'skus.weight'
  Generating /nexus/alembic/versions/4a2b8c9d1e2f_add_weight_to_skus.py ...  done

```

Step 2 output:

```text
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 4a2b8c9d1e2f, add weight to skus

```

### One sentence connecting this unit to what came immediately before.

By changing the Python class and letting Alembic calculate the SQL, we guarantee that our application's mental model and the database's physical reality remain perfectly synchronized.

---

## Closing

**Connect the pieces**
If we trace the full evolution of our schema: In Lesson 1, we defined `skus` in a raw SQL script. In Lesson 4, we built the `SKU` ORM model to mirror it. Today, we broke that mirror by adding `weight` to the Python model. We used `alembic revision --autogenerate` (Lesson 10) to compute the delta between `Base.metadata` and `nexus.db`. Alembic generated a script containing `op.add_column('skus', sa.Column('weight', sa.Float()))`. We ran `alembic upgrade head`, which translated that command into `ALTER TABLE skus ADD COLUMN weight REAL` (Lesson 10), executed it against the SQLite connection, and finally updated the hidden `alembic_version` table to mark the migration as complete.

**What breaks without this**
If you skipped Alembic and simply added `weight: Mapped[float | None]` to `models.py`, the moment you tried to run `create_sku` from Lesson 6, SQLAlchemy would emit `INSERT INTO skus (sku_id, name, description, weight) VALUES (...)`. SQLite would instantly reject it with `sqlite3.OperationalError: table skus has no column named weight`. Without migrations, your application code is eternally trapped by the initial database design.

**Exercises**

1. Open the file generated in `nexus/alembic/versions/`. Read the `upgrade()` and `downgrade()` functions. Notice how `upgrade` adds the column, and `downgrade` provides the exact inverse command to remove it.
2. In your terminal, run `alembic downgrade -1`. This will execute the `downgrade()` function, rolling the database back to its previous state. Then run `alembic upgrade head` to re-apply it.

**Definition of Done**

* [x] Alembic environment initialized and configured for SQLite.
* [x] `alembic/env.py` modified to read SQLAlchemy `DeclarativeBase` metadata.
* [x] `SKU` model modified with a new `weight` column.
* [x] Migration script autogenerated and successfully applied to the database.
* [x] You can commit these changes with the message: `build: initialize alembic and apply SKU weight column migration`.