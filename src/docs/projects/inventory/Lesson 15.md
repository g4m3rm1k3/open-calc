# Lesson 15: Automated Testing and Dependency Overrides

**What you will build**
You will build an automated test suite capable of verifying your API endpoints programmatically. The problem we are solving is regression: as a system grows, manually clicking through a dashboard or sending `curl` commands to verify that new code didn't break old features becomes impossible. Running an API without automated tests is like running a CNC machine without doing a dry run first—a fast way to crash the system and corrupt your data.

**What you need to know first**
From Lesson 9: FastAPI endpoints and `Depends()` injection.

**The Pipeline**
`[ Test Suite ] → [ FastAPI (TestClient) ] → Pydantic (Validation) → SQLAlchemy (ORM) → [ SQLite (In-Memory Storage) ]`

This lesson introduces the **Test Suite** to the very beginning of the pipeline, completely replacing the web browser and the network. We will also swap out the final storage stage, redirecting the pipeline's output away from our physical `nexus.db` file and into a harmless, ephemeral memory space.

---

## Concept Unit: The TestClient

### The Problem

To test an API endpoint, you typically have to open a terminal, run `uvicorn main:app`, open a second terminal, execute a `curl` command, and visually inspect the JSON. We need a way to execute HTTP requests purely within Python memory so a testing script can run them in milliseconds and assert the results programmatically.

### Introduce the concept in isolation

Create `lab_testclient.py` to see how FastAPI can simulate network traffic without ever opening a real TCP port.

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/ping")
def ping():
    return {"ping": "pong"}

# Wrap the application in the testing simulator
client = TestClient(app)

print("--- Simulating HTTP GET ---")
response = client.get("/ping")

print(f"Status Code: {response.status_code}")
print(f"JSON Body: {response.json()}")

```

Run it:

```bash
python lab_testclient.py

```

Output:

```text
--- Simulating HTTP GET ---
Status Code: 200
JSON Body: {'ping': 'pong'}

```

*What this proves:* The `TestClient` consumes our FastAPI `app` object and exposes methods like `.get()` and `.post()`. It bypasses the Uvicorn web server entirely, passing the HTTP request directly into the FastAPI router loop and returning a synchronous response object we can inspect.

### Discard the throwaway example

Delete `lab_testclient.py`. We will now establish the formal testing directory for NexusInventory.

### Project Change

We will create a testing directory and our first test file, bringing in the `pytest` framework.

* **Files affected:** Create a new directory `nexus/tests/` and a file `nexus/tests/test_api.py`.
* **Change type:** Add.
* **Location:** Brand-new file.
* **Dependencies:** Requires installing `pytest` and `httpx` (which `TestClient` uses under the hood).

### The New Code

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "system": "online"}

```

### The Updated Project

Because this is a brand-new file, the code block above represents the entirety of `nexus/tests/test_api.py`. It establishes a connection to our main application and defines a single, strict expectation.

### Mechanical walkthrough

1. `from fastapi.testclient import TestClient`: (Already established syntax).
2. `from main import app`: (First appearance). Imports the exact FastAPI registry object we built in Lesson 9. It contains all our routes, CORS middleware, and static mounts.
3. `client = TestClient(app)`: (Already established syntax).
4. `def test_health_check():`: (First appearance). The `pytest` framework automatically discovers and executes any function whose name begins with `test_`.
5. `response = client.get("/health")`: (Already established syntax). Simulates the network call.
6. `assert`: (First appearance). A built-in Python keyword used heavily in testing. It evaluates the expression next to it. If the expression evaluates to `True`, the script continues silently. If it evaluates to `False`, the script throws an `AssertionError` and the test fails.
7. `assert response.status_code == 200`: Proves the endpoint successfully responded.
8. `assert response.json() == {...}`: Proves the payload perfectly matches the expected structure.

### CS Lens

**Black-Box Testing.** By using the `TestClient` to hit the `/health` URL, we are treating the FastAPI application as a black box. We do not call the `health_check()` Python function directly; we fire an HTTP request at the boundary and measure what comes out. This ensures we are testing the entire pipeline—routing, middleware, and serialization—exactly as a real client would experience it.

### SE Lens

Why use `TestClient` instead of booting the server and using the popular `requests` library? **Speed and Reliability.** Booting Uvicorn requires binding to a network port. If port 8000 is currently in use by another application on your computer, your test suite crashes. `TestClient` operates purely in application memory, meaning you can run 1,000 tests in a few seconds without ever touching the OS networking stack.

### Commands needed to make this unit real

Install the testing tools into your Python environment.

```bash
pip install pytest httpx

```

Execute the test suite from the root `nexus/` directory:

```bash
pytest tests/

```

### Run it. Show the real output.

```text
============================= test session starts ==============================
platform linux -- Python 3.11.0, pytest-7.4.2, pluggy-1.3.0
rootdir: /nexus
collected 1 item                                                               

tests/test_api.py .                                                      [100%]

============================== 1 passed in 0.04s ===============================

```

### One sentence connecting this unit to what came immediately before.

The `/health` endpoint is safe to test because it just returns a static dictionary, but testing the `POST /skus` endpoint poses a severe threat to our database integrity.

---

## Concept Unit: Dependency Overrides

### The Problem

If we write a test that posts `{"sku_id": "TEST-PART"}` to `/skus`, the endpoint will execute exactly as it does in production. It will call `get_db_session()`, connect to our real `nexus.db` SQLite file, and write the test part into our actual inventory catalog. We need a way to sever the connection to the production database and redirect it to a temporary, isolated environment specifically for the duration of the test.

### Introduce the concept in isolation

Create `lab_override.py` to see how FastAPI allows us to hijack its dependency injection system.

```python
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

def get_auth_provider():
    return "Production Security System"

app = FastAPI()

@app.get("/secure")
def secure_endpoint(auth: str = Depends(get_auth_provider)):
    return {"accessed_via": auth}

print("--- 1. Normal Execution ---")
client = TestClient(app)
print(client.get("/secure").json())

print("\n--- 2. Hijacked Execution ---")
# Overwrite the dependency with a fake one
app.dependency_overrides[get_auth_provider] = lambda: "Fake Test Override"

print(client.get("/secure").json())

```

Run it:

```bash
python lab_override.py

```

Output:

```text
--- 1. Normal Execution ---
{'accessed_via': 'Production Security System'}

--- 2. Hijacked Execution ---
{'accessed_via': 'Fake Test Override'}

```

*What this proves:* The endpoint function `@app.get("/secure")` was never modified. But by mapping the original function `get_auth_provider` to a new function in the `app.dependency_overrides` dictionary, FastAPI intercepted the `Depends()` call and injected the fake data instead.

### Discard the throwaway example

Delete `lab_override.py`. We will now override our database session dependency.

### Project Change

We will modify our test file to spin up an in-memory database, create the tables, define a fake session generator, and wire it into FastAPI's override dictionary before testing the SKU creation endpoint.

* **Files affected:** `nexus/tests/test_api.py`.
* **Change type:** Modify.
* **Location:** Below the health check test.
* **Dependencies:** Requires importing `create_engine`, `Session`, `Base`, and `get_db_session`.

### The New Code

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from db import get_db_session
from models import Base

# 1. Boot a temporary, isolated storage engine
test_engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(test_engine)

# 2. Define the isolated dependency generator
def override_get_db():
    with Session(test_engine) as session:
        yield session

# 3. Hijack the application's connection
app.dependency_overrides[get_db_session] = override_get_db

def test_create_sku_isolated():
    payload = {
        "sku_id": "ISOLATED-1",
        "name": "Test Driven Bolt"
    }
    
    response = client.post("/skus", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["sku_id"] == "ISOLATED-1"
    assert data["name"] == "Test Driven Bolt"

```

### The Updated Project

Here is the fully reconstructed `nexus/tests/test_api.py` file, incorporating both tests and the isolation setup.

```python
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from main import app
from db import get_db_session
from models import Base

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "system": "online"}

# ← new: Isolate the database
test_engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(test_engine)

def override_get_db():
    with Session(test_engine) as session:
        yield session

app.dependency_overrides[get_db_session] = override_get_db

# ← new: Test the endpoint using the isolated database
def test_create_sku_isolated():
    payload = {
        "sku_id": "ISOLATED-1",
        "name": "Test Driven Bolt"
    }
    
    response = client.post("/skus", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["sku_id"] == "ISOLATED-1"
    assert data["name"] == "Test Driven Bolt"

```

When `client.post("/skus")` executes, FastAPI parses the payload, reaches the `Depends(get_db_session)` statement in `main.py`, intercepts it, and executes `override_get_db()` instead, safely writing the test data into RAM rather than to disk.

### Mechanical walkthrough

1. `from db import get_db_session`: (Already established syntax). We import the exact Python function object used in production.
2. `test_engine = create_engine("sqlite:///:memory:")`: (Already established syntax). Creates a database that lives exclusively in volatile RAM and vanishes the moment the test suite finishes running.
3. `Base.metadata.create_all(test_engine)`: (Already established syntax). Reads our ORM models and generates the basic `CREATE TABLE` commands in the memory database.
4. `def override_get_db():`: (Already established syntax). The identical generator pattern used in production, yielding a session tied to the `test_engine`.
5. `app.dependency_overrides[get_db_session] = override_get_db`: (First appearance). A global dictionary provided by FastAPI. The key is the original dependency function; the value is the replacement function.
6. `response = client.post("/skus", json=payload)`: (First appearance). Instructs the `TestClient` to send an HTTP POST request. By passing a dictionary to the `json=` keyword argument, `TestClient` automatically serializes it to a string and attaches the `Content-Type: application/json` header we learned about in Lesson 12.

### CS Lens

**The Dependency Inversion Principle (SOLID).** This is the 'D' in SOLID architecture. High-level modules (our API endpoints) should not depend on low-level modules (the hardcoded SQLite file). Both should depend on abstractions (the `Depends` injection). Because the endpoint never actually establishes the database connection itself, we have achieved a perfectly decoupled architecture, proven by our ability to swap the storage backend transparently during testing.

### SE Lens

What is the limitation of testing using `Base.metadata.create_all()`? **Fidelity.** In Lesson 14, we created complex SQLite Triggers and FTS5 Virtual Tables using Alembic migrations. `create_all()` *only* reads standard ORM classes; it has no idea those triggers exist. Therefore, our `:memory:` database does not actually have the FTS search index in it. If we wrote a test for `GET /search`, it would crash because the `skus_fts` table is missing. In advanced production testing, engineers drop `create_all` entirely, and instead programmatically instruct Alembic to run all migration scripts against the test database before the tests begin, ensuring 100% structural fidelity.

### Commands needed to make this unit real

Run the test suite again.

```bash
pytest tests/

```

### Run it. Show the real output.

```text
============================= test session starts ==============================
platform linux -- Python 3.11.0, pytest-7.4.2, pluggy-1.3.0
rootdir: /nexus
collected 2 items                                                              

tests/test_api.py ..                                                     [100%]

============================== 2 passed in 0.08s ===============================

```

### One sentence connecting this unit to what came immediately before.

With automated testing asserting the correctness of our API payloads and dependency overrides securing our database, we can now confidently refactor the system without fear of breaking established contracts.

---

## Closing

**Connect the pieces**
To trace the execution of the test we just wrote: `pytest` discovers `test_create_sku_isolated`. It defines a dictionary payload. `TestClient` packages this into a simulated HTTP request (Lesson 15). FastAPI routes it to `create_sku_endpoint` (Lesson 9). The `Depends` statement is intercepted by `dependency_overrides` (Lesson 15), yielding a SQLAlchemy session pointing to the `:memory:` `test_engine` instead of the `WAL`-enabled `nexus.db` file. Pydantic validates the JSON against `SKUCreate` (Lesson 3). The CRUD layer unpacks the object and stages it (Lesson 6). `session.commit()` writes the data strictly to volatile RAM (Lesson 5). FastAPI serializes the ORM object back through `SKURead` (Lesson 6). `TestClient` catches the simulated HTTP response. Finally, the Python `assert` statements confirm the status code and data structure perfectly match the system's design constraints.

**What breaks without this**
If you did not utilize `dependency_overrides` and simply ran the test suite against your standard application, the test would blindly write `ISOLATED-1` into your physical database. If you ran the test suite 100 times, you would pollute your inventory catalog with 100 fake items. Furthermore, if the test fails halfway through, the fake data is never cleaned up. Tests must be repeatable, predictable, and structurally sandboxed.

**Exercises**

1. Deliberately break your application: go to `nexus/schemas.py` and change the `max_length` of `SKUCreate.name` to `5`. Run `pytest tests/` and watch the test fail with a `422 Unprocessable Entity` because the test payload's name (`"Test Driven Bolt"`) is now too long.
2. In `test_api.py`, write a new function `test_read_sku()` that sends a `GET` request to `/skus/ISOLATED-1` immediately after the `POST` request, and `assert response.status_code == 200` to prove the in-memory database successfully stored and retrieved the item across multiple HTTP calls.

**Definition of Done**

* [x] A `tests/` directory is established with a `pytest` module.
* [x] FastAPI `TestClient` is used to simulate HTTP traffic without a live socket.
* [x] An ephemeral SQLite `:memory:` engine is bootstrapped for testing.
* [x] `app.dependency_overrides` safely intercepts and replaces the production database session.
* [x] You can commit these changes with the message: `test: add automated test suite with ephemeral sqlite dependency injection`.