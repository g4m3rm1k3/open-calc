# Sprint 3 · Lesson 3 — SQLAlchemy: Python talks to Postgres

## What you will build

By the end of this lesson, every FastAPI endpoint reads and writes real data from Postgres instead of the in-memory list. The route handler signatures do not change. The Pydantic models do not change. The HTTP contracts do not change. Only the implementation inside each handler changes — list operations become SQLAlchemy queries. You will see the actual SQL in the logs and recognise it from Lesson 2.

---

## What you need to know first

- Sprint 3 L1: Postgres is running in Docker.
- Sprint 3 L2: `CREATE TABLE`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `NULL`.
- Sprint 2 L3: The five CRUD endpoints and their Pydantic models.

---

## The lesson

---

### 1. Install SQLAlchemy and psycopg2

**The problem:** Python cannot talk to Postgres directly — it needs a driver and an ORM.

From `backend/` with the virtual environment active:

```
pip install sqlalchemy psycopg2-binary
pip freeze > requirements.txt
```

**Walkthrough:**

`sqlalchemy` — SQLAlchemy is a Python library with two layers:
1. **Core** — a SQL expression language for building and executing SQL queries in Python
2. **ORM** (Object Relational Mapper) — a layer that maps Python class instances to database rows

You will use the ORM layer. The ORM's job is to let you work with Python objects (`WorkOrderModel` instances) that represent database rows, and to translate operations on those objects (reading attributes, creating instances, deleting objects) into the SQL statements from Lesson 2.

`psycopg2-binary` — the **database driver** for Postgres. SQLAlchemy does not talk to Postgres directly — it uses a driver. `psycopg2` is a C extension that implements the low-level Postgres network protocol. The `-binary` suffix means it includes precompiled C code — no compilation required on your machine. In production you would use the non-binary version (compiled from source for your specific platform), but the binary is sufficient for development.

**CS lens — the ORM as an abstraction layer.** An ORM sits between your application code (Python) and the database (Postgres). It translates Python operations into SQL. This is an abstraction: you write `session.query(WorkOrderModel).filter_by(status='open').all()` and SQLAlchemy generates `SELECT * FROM work_orders WHERE status = 'open'`. The abstraction reduces the amount of SQL you write but does not eliminate the need to understand SQL — because the ORM can generate inefficient SQL, and you need to be able to read and verify what it produces.

**SE lens — why an ORM instead of raw SQL.** Raw SQL in Python strings has problems: SQL injection (covered in Sprint 6), hard-to-read string concatenation, and no type checking. An ORM addresses all three: it parameterises queries automatically (preventing injection), provides a readable Python API, and integrates with type checkers. The cost: the abstraction is "leaky" — complex queries are harder to express in the ORM API than in raw SQL, and the generated SQL is sometimes inefficient. Many production codebases use both: an ORM for standard CRUD, and raw SQL (via `text()`) for complex queries.

---

### 2. Set up the database connection

**The problem:** SQLAlchemy needs to know where Postgres is and how to connect. You need a connection string, an engine, and a session factory.

Create `backend/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://devuser:devpassword@localhost:5432/workorders"
)

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass
```

**Walkthrough:**

`import os` — Python's built-in `os` module. It provides access to operating system functionality, including environment variables. This is the `os` module — the module responsible for OS interactions. You import it here to read the `DATABASE_URL` environment variable.

`os.getenv("DATABASE_URL", "postgresql://...")` — reads the `DATABASE_URL` environment variable. If the variable is not set, uses the second argument as a default. In development, the environment variable is not set, so the hardcoded development URL is used. In production, `DATABASE_URL` will be set to the real database URL. This is the environment-variable configuration pattern from Lesson 1 applied to database connection.

**The DATABASE_URL string: `postgresql://devuser:devpassword@localhost:5432/workorders`**

This is a **connection string** — a URL that encodes all connection parameters. Its structure:

- `postgresql://` — the database protocol. This tells SQLAlchemy to use the psycopg2 driver.
- `devuser:devpassword` — username:password, matching the `POSTGRES_USER` and `POSTGRES_PASSWORD` in `docker-compose.yml`.
- `localhost:5432` — the host and port. The database is on your machine (localhost) at port 5432 (the host port from Docker's port mapping).
- `/workorders` — the database name, matching `POSTGRES_DB` in `docker-compose.yml`.

`create_engine(DATABASE_URL, echo=True)` — creates the **engine** — SQLAlchemy's interface to the database. The engine manages a **connection pool**: a set of pre-opened database connections that queries reuse rather than opening a new connection for every query. Opening a TCP connection is slow (~1ms); reusing a pooled connection is fast (~0.01ms). For a web server handling many requests, connection pooling is critical.

`echo=True` — tells SQLAlchemy to print every SQL statement it executes to standard output (the uvicorn terminal). You will use this to see the actual SQL your Python code generates. This is invaluable for learning and debugging — you will recognise the statements from Lesson 2. In production, `echo=False` (or omit it — it defaults to `False`).

`sessionmaker(autocommit=False, autoflush=False, bind=engine)` — creates a **session factory**. A **session** in SQLAlchemy is a unit of work: open a session, perform operations (queries and writes), then commit (save all changes) or rollback (discard all changes). The session tracks which objects you loaded and which you modified, and generates the appropriate SQL when you commit.

`autocommit=False` — you must explicitly call `session.commit()`. Without this, each statement would auto-commit, which prevents transactions from working correctly.

`autoflush=False` — SQLAlchemy will not automatically write pending changes to the database before a query. You control when flushing happens.

`class Base(DeclarativeBase): pass` — `DeclarativeBase` is the base class that SQLAlchemy ORM models inherit from. `Base` is your project's base class. Every ORM model (database table representation) inherits from `Base`. SQLAlchemy uses this inheritance to discover all your models and their table definitions.

**CS lens — connection pooling.** A connection pool is a cache of database connections. The pool maintains a fixed number of open connections (default: 5 in SQLAlchemy). When a route handler needs a connection, it borrows one from the pool. When the handler finishes, it returns the connection. If all pooled connections are in use and a new request arrives, it waits. This is the **object pool pattern** — reusing expensive objects (TCP connections) instead of creating and destroying them per use.

**SE lens — the session as a unit of work.** A SQLAlchemy session implements the **Unit of Work pattern**: collect all changes, write them together in one transaction. If you create three work orders in one session, SQLAlchemy executes three `INSERT` statements in one transaction — either all succeed or all fail. This is the correct default behaviour for a web API.

---

### 3. Define the ORM model

**The problem:** You need a Python class that represents the `work_orders` table. SQLAlchemy maps Python class instances to database rows.

Create `backend/orm_models.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base

class WorkOrderModel(Base):
    __tablename__ = "work_orders"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    status      = Column(String, nullable=False, default="open")
    priority    = Column(String, nullable=False)
    assigned_to = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
```

**Walkthrough:**

`class WorkOrderModel(Base):` — this class inherits from `Base` (your `DeclarativeBase` subclass). SQLAlchemy detects this and registers `WorkOrderModel` as a mapped class.

`__tablename__ = "work_orders"` — tells SQLAlchemy which database table this class maps to. The double underscores (`__tablename__`) are a Python convention for special class attributes that frameworks look for.

`Column(Integer, primary_key=True, index=True)` — defines the `id` column. `Integer` is the SQLAlchemy type (maps to Postgres `INTEGER`). `primary_key=True` marks it as the primary key — SQLAlchemy uses this to identify rows and to generate `WHERE id = ?` conditions when querying by primary key. `index=True` tells SQLAlchemy to create an index on this column, making primary key lookups fast.

`Column(String, nullable=False)` — `String` maps to Postgres `TEXT` (or `VARCHAR`). `nullable=False` maps to `NOT NULL`.

`Column(String, nullable=True)` — allows `NULL`. This is the default; you can omit `nullable=True`, but stating it explicitly is clearer.

`Column(DateTime(timezone=True), server_default=func.now())` — `DateTime(timezone=True)` maps to Postgres `TIMESTAMP WITH TIME ZONE`. `server_default=func.now()` tells SQLAlchemy to emit `DEFAULT NOW()` in the table creation SQL — the database assigns the timestamp, not Python. This is different from a Python default: a Python default assigns the value when you call `WorkOrderModel(...)`, which might be seconds before the `INSERT` executes; a server default assigns the value atomically at the moment of insert.

The name `WorkOrderModel` distinguishes it from the Pydantic `WorkOrder` class. Both exist in your codebase: `WorkOrder` is the Pydantic model (for HTTP validation and serialisation), `WorkOrderModel` is the SQLAlchemy model (for database persistence). They have the same fields but different roles.

**CS lens — the ORM as bidirectional mapping.** SQLAlchemy maps in both directions: from Python to SQL (writing a `WorkOrderModel` instance → `INSERT` statement) and from SQL to Python (query result → `WorkOrderModel` instance). This bidirectional mapping is why it is called an Object Relational *Mapper*. The mapping rules are defined by the `Column` definitions.

**SE lens — two models for one concept.** Having a Pydantic model and an SQLAlchemy model for the same concept is intentional. They serve different purposes: Pydantic handles the HTTP boundary (validation, serialisation, API documentation). SQLAlchemy handles the database boundary (SQL generation, transactions, relationships). Merging them — using SQLAlchemy models as Pydantic models or vice versa — is technically possible but creates tight coupling between the HTTP layer and the database layer. Keep them separate.

---

### 4. Create the table from the ORM model

**The problem:** The table currently exists from the SQL you wrote in Lesson 2 (or it does not if you started fresh). You need to create it from the ORM model so the schema matches the model definition.

Create `backend/init_db.py`:

```python
from database import engine, Base
from orm_models import WorkOrderModel  # noqa: F401 — import needed for Base.metadata

Base.metadata.create_all(bind=engine)
print("Database tables created.")
```

Run:

```
python3 init_db.py
```

Expected output:
```
2024-01-01 12:00:00,000 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2024-01-01 12:00:00,000 INFO sqlalchemy.engine.Engine SELECT ...
2024-01-01 12:00:00,001 INFO sqlalchemy.engine.Engine CREATE TABLE work_orders (
	id SERIAL NOT NULL,
	title VARCHAR NOT NULL,
	...
	PRIMARY KEY (id)
)
...
Database tables created.
```

**Walkthrough:**

`Base.metadata.create_all(bind=engine)` — `metadata` is SQLAlchemy's catalogue of all models that inherit from `Base`. It knows every table, every column, every constraint. `create_all` generates `CREATE TABLE` SQL for each table and executes it. It is idempotent — if the table already exists, it skips it. This is different from Alembic migrations (Lesson 4), which version schema changes.

`from orm_models import WorkOrderModel` — this import is required even though `WorkOrderModel` is not used directly. Importing the module causes Python to execute it, which causes `WorkOrderModel` to be defined with `Base` as its parent, which registers `WorkOrderModel` in `Base.metadata`. Without this import, `Base.metadata` is empty and `create_all` creates nothing. The `# noqa: F401` comment suppresses the linter's "imported but unused" warning — the import is intentional.

The SQLAlchemy output in the terminal (because `echo=True`) shows the actual SQL it generated and executed. Compare it to the `CREATE TABLE` you wrote in Lesson 2 — it is the same structure.

**What breaks without this:** If you forget `from orm_models import WorkOrderModel` in `init_db.py`, `Base.metadata.create_all()` creates no tables — the metadata is empty. The database remains empty and all queries fail with "relation work_orders does not exist."

---

### 5. Add a session dependency to FastAPI

**The problem:** Each FastAPI route handler needs a database session. The session must be opened at the start of the request and closed at the end — even if an error occurs. FastAPI's dependency injection system handles this.

Add to `backend/database.py`:

```python
from typing import Generator

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Walkthrough:**

`def get_db() -> Generator:` — a Python **generator function**. A function is a generator if it contains `yield`. Generators produce values lazily — they can pause (at `yield`) and resume. `-> Generator` annotates the return type.

`db = SessionLocal()` — creates a new session from the factory.

`yield db` — the generator pauses here and returns `db` to the caller (FastAPI). The route handler runs with `db` as its session. When the route handler finishes, the generator resumes from after `yield`.

`finally: db.close()` — runs unconditionally after `yield` — whether the route succeeded or raised an exception. This guarantees the session is closed and the connection returned to the pool. Without `finally`, a session opened for a request that raised an exception would never be closed, eventually exhausting the connection pool.

In FastAPI route handlers:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.get("/orders")
def list_orders(db: Session = Depends(get_db)):
    ...
```

`Depends(get_db)` — FastAPI's dependency injection. When FastAPI calls `list_orders`, it first calls `get_db()`, which opens a session, yields it, and pauses. FastAPI passes the yielded session as the `db` argument. After `list_orders` returns, FastAPI resumes the generator, which closes the session.

**CS lens — generators as resource managers.** The `yield`-in-`try/finally` pattern is Python's idiomatic resource management for functions that need setup and teardown. The generator pauses at `yield`, does the setup before, and guarantees cleanup in `finally`. This is the same principle as Python's `with` statement (context manager): setup → use → teardown. `get_db` is a context manager expressed as a generator, which FastAPI can use with `Depends`.

**SE lens — dependency injection at the framework level.** FastAPI's `Depends(get_db)` is **dependency injection**: the route handler declares what it needs (`db: Session`); the framework provides it. The route handler does not create or manage the session — it just uses it. This separation means the session management logic lives in one place (`get_db`), not in every route handler. Sprint 5 will replace `Depends(get_db)` with `Depends(get_test_db)` in tests — swapping the real database for a test database without changing a single route handler.

---

### 6. Replace the in-memory list with database queries

**The problem:** Rewrite the five route handlers in `main.py` to use SQLAlchemy instead of the list.

Replace `backend/main.py` with:

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db
from orm_models import WorkOrderModel
from models import WorkOrder, WorkOrderCreate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/orders", response_model=list[WorkOrder])
def list_orders(db: Session = Depends(get_db)):
    return db.query(WorkOrderModel).all()

@app.get("/orders/{order_id}", response_model=WorkOrder)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return order

@app.post("/orders", response_model=WorkOrder, status_code=201)
def create_order(order_data: WorkOrderCreate, db: Session = Depends(get_db)):
    new_order = WorkOrderModel(**order_data.model_dump())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@app.put("/orders/{order_id}", response_model=WorkOrder)
def update_order(order_id: int, order_data: WorkOrderCreate, db: Session = Depends(get_db)):
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    for field, value in order_data.model_dump().items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order

@app.delete("/orders/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(WorkOrderModel).filter(WorkOrderModel.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    db.delete(order)
    db.commit()
```

**Walkthrough — every new database operation:**

**`db.query(WorkOrderModel).all()`** — generates and executes `SELECT * FROM work_orders`, returns a list of `WorkOrderModel` instances. `.query(WorkOrderModel)` creates a query object. `.all()` executes it and returns all results.

**`.filter(WorkOrderModel.id == order_id).first()`** — `.filter()` adds a `WHERE` clause. `WorkOrderModel.id == order_id` generates `WHERE id = :order_id`. The `:order_id` is a **parameterised query** — SQLAlchemy never interpolates user values directly into SQL strings, preventing SQL injection. `.first()` returns the first result or `None` if no rows match.

**`db.add(new_order)` → `db.commit()` → `db.refresh(new_order)`** — the three steps of an insert:
- `db.add(new_order)` — stages the new `WorkOrderModel` in the session's unit of work. No SQL yet.
- `db.commit()` — executes the staged operations. SQLAlchemy generates `INSERT INTO work_orders (title, status, priority, assigned_to) VALUES (:title, :status, :priority, :assigned_to)`. Postgres assigns the `id` and `created_at`. The transaction is committed.
- `db.refresh(new_order)` — reloads `new_order` from the database. After the `INSERT`, `new_order.id` is still `None` in Python — Postgres assigned the ID, but Python does not know it yet. `refresh` executes `SELECT * FROM work_orders WHERE id = :id` to populate `new_order` with the database-assigned values.

**`for field, value in order_data.model_dump().items()`** — `model_dump()` returns a dict of field names and values. `.items()` returns `(key, value)` pairs. The loop calls `setattr(order, field, value)` for each pair — `setattr` sets an attribute by name dynamically. This updates the loaded `WorkOrderModel` instance. SQLAlchemy tracks attribute changes and generates an `UPDATE` statement on commit.

**`db.delete(order)` → `db.commit()`** — stages the deletion, then commits. SQLAlchemy generates `DELETE FROM work_orders WHERE id = :id`.

**Read the terminal while testing.** Every query prints to the uvicorn terminal because `echo=True`. You will see the actual SQL — `SELECT`, `INSERT`, `UPDATE`, `DELETE` — with bound parameters shown separately. This is the most important part of this lesson: verify that the SQL you see matches the SQL you would have written by hand in Lesson 2.

**CS lens — the ORM as a query builder with object tracking.** SQLAlchemy's session tracks every `WorkOrderModel` object it loaded. When you set `order.status = 'in_progress'`, SQLAlchemy records that `order.status` changed. On `commit()`, it generates `UPDATE work_orders SET status = 'in_progress' WHERE id = ?`. This tracking is the "identity map" — a dict from primary key to object. `db.query(WorkOrderModel).filter_by(id=1).first()` called twice in the same session returns the same Python object, not two copies.

**SE lens — the session's commit as the transaction boundary.** Every `db.commit()` in the route handlers commits a transaction. If an exception occurs between `db.add()` and `db.commit()`, the transaction is not committed — the data is not written. The `finally: db.close()` in `get_db` closes the session, rolling back any uncommitted changes. This is correct transactional behaviour: either the entire operation succeeds, or nothing is written.

**What breaks without this:** If you forget `db.refresh(new_order)` after `db.commit()`, the returned `WorkOrder` Pydantic model has `id=None` — the field the `SERIAL` column assigned is not populated yet. FastAPI tries to serialise `id: None` for a field typed `id: int`, which raises a validation error. `refresh` is required.

---

## Connect the pieces

Every route handler now reads from and writes to Postgres. The React frontend makes the same HTTP calls. The API returns the same JSON. The only change is that data persists across server restarts: stop uvicorn, start it again, and your work orders are still there.

The connection pool in the engine means the server handles concurrent requests efficiently. The session-per-request pattern (from `get_db`) means each request has its own isolated transaction. In Lesson 4, Alembic will manage schema changes — adding columns without dropping the table or losing data.

---

## What breaks without this

**`sqlalchemy.exc.OperationalError: could not connect to server`:** The Postgres container is not running. Run `docker compose up -d` from `fullstack-project/`.

**`relation "work_orders" does not exist`:** You forgot to run `python3 init_db.py`. Run it now.

**`AttributeError: 'NoneType' has no attribute 'id'`:** You forgot `db.refresh(new_order)` after `db.commit()` on a create operation. Add `db.refresh(new_order)`.

---

## Definition of done

- [ ] All five endpoints (`GET /orders`, `GET /orders/{id}`, `POST`, `PUT`, `DELETE`) work against the real database
- [ ] Data persists after restarting uvicorn
- [ ] The uvicorn terminal shows SQL statements for each request
- [ ] You can explain what `db.refresh()` does and why it is needed after `db.commit()`
- [ ] You can explain what `echo=True` does and when you would set it to `False`
- [ ] You can explain the three steps of a SQLAlchemy insert: `add`, `commit`, `refresh`
- [ ] You can explain why `Depends(get_db)` is used instead of creating the session inside each route

**Git commit:**

```
git add backend/
git commit -m "Replace in-memory list with SQLAlchemy + Postgres: all five CRUD endpoints now persist to the database"
```
