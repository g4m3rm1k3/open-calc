# Lesson 12: Action Endpoints and Client-Side Mutations

**What you will build**
You will build the network bridge required to execute database mutations from the browser. You will design a Command Payload schema, expose the atomic `move_item` transaction via a FastAPI endpoint, and upgrade the frontend JavaScript to dispatch an asynchronous `POST` request. The problem we are solving is distributed state mutation: moving physical inventory requires sending a secure, strictly formatted command from a remote client to the centralized database engine.

**What you need to know first**
From Lesson 3: Pydantic schemas. From Lesson 7: The `crud.move_item` atomic transaction. From Lesson 9: FastAPI routing and Dependency Injection. From Lesson 11: `fetch()` and the browser DOM.

**The Pipeline**
`[ Browser (JS/DOM) ] → [ Client Request ] → [ FastAPI (Routing) ] → [ Pydantic (Validation) ] → SQLAlchemy (ORM) → SQLite (Storage)`

This lesson exercises the entire upper half of the pipeline simultaneously. A button click in the **Browser** constructs a **Client Request** containing a JSON body. **FastAPI** intercepts it and hands the body to **Pydantic** for validation, rejecting it instantly if it is malformed, before finally passing the verified command down to the ORM.

---

## Concept Unit: Command Payload Schemas

### The Problem

Standard REST conventions usually map schemas to tables (e.g., `SKUCreate` maps to the `skus` table). However, moving an item is a discrete *action* that updates the `items` table and inserts into the `movements` table simultaneously. We need a Pydantic schema that represents this command payload—containing only the destination location—rather than a full database row.

### Introduce the concept in isolation

*Skipped.* We are utilizing the exact `BaseModel` inheritance and type-hinting syntax heavily labbed in Lesson 3, applying it to a new logical pattern.

### Project Change

We will add an `ItemMove` schema to our validation layer to govern the inbound network payload.

* **Files affected:** `nexus/schemas.py`.
* **Change type:** Modify.
* **Location:** At the bottom of the file.
* **Dependencies:** None.

### The New Code

```python
class ItemMove(BaseModel):
    new_location_id: int

```

### The Updated Project

Here is the fully reconstructed `nexus/schemas.py` file. It now contains schemas for resources (`Location`, `SKU`) and our first schema for an action (`ItemMove`).

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict

class LocationCreate(BaseModel):
    name: str
    region: str
    parent_id: int | None = None

    @field_validator("region")
    @classmethod
    def standardize_region(cls, v: str) -> str:
        v_upper = v.strip().upper()
        allowed = {"NE", "NW", "SE", "SW", "WC"}
        if v_upper not in allowed:
            raise ValueError(f"Region must be one of {allowed}")
        return v_upper

class SKUCreate(BaseModel):
    sku_id: str = Field(min_length=3, max_length=20, pattern=r"^[A-Z0-9\-]+$")
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)

class SKURead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    sku_id: str
    name: str
    description: str | None

# ← new: Command schema representing an action, not a table
class ItemMove(BaseModel):
    new_location_id: int

```

The API now has a rigid definition for what a "move" command looks like over the network.

### Mechanical walkthrough

1. `class ItemMove(BaseModel):`: (Hard concept reappearing: Pydantic Inheritance from Lesson 3). Defines a new strict boundary object.
2. `new_location_id: int`: (Basic syntax). The only required piece of data in the HTTP body is the integer ID of the destination warehouse bin.

### CS Lens

**Command Query Responsibility Segregation (CQRS).** At a system level, reading data (Queries) and altering data (Commands) have vastly different requirements. `SKURead` is a Query schema—it mirrors the database closely. `ItemMove` is a Command schema—it represents an *intent* to change the system, completely decoupled from the underlying storage structure. Decoupling commands from reads prevents monolithic, overly complex classes.

### SE Lens

Why not just send `{"location_id": 2}` and use a generic `ItemUpdate` schema? **Explicit Intent.** If we allow a generic update endpoint, a client might accidentally send `{"location_id": 2, "serial_number": "NEW-SERIAL"}`. If the ORM blindly applies generic updates, the client just corrupted the serial number. By forcing the client to send a specific `ItemMove` command, we restrict the mutation surface area exclusively to the `new_location_id`, making accidental data corruption impossible.

### Commands needed to make this unit real

No commands needed.

### One sentence connecting this unit to what came immediately before.

With the command payload strictly defined, we must now build the HTTP endpoint that listens for it and executes the transaction.

---

## Concept Unit: Action Endpoints (Path and Body combined)

### The Problem

We need an endpoint that identifies *which* item to move, receives the `ItemMove` payload detailing *where* to move it, and injects a secure database session to execute `crud.move_item`.

### Introduce the concept in isolation

*Skipped.* We are combining the FastAPI `@app.post` routing, path parameters, and `Depends` injection heavily labbed in Lesson 9.

### Project Change

We will add a new endpoint to our main application router.

* **Files affected:** `nexus/main.py`.
* **Change type:** Modify.
* **Location:** At the bottom of the file.
* **Dependencies:** Requires importing `ItemMove` from `schemas`.

### The New Code

```python
from schemas import SKUCreate, SKURead, ItemMove

@app.post("/items/{serial}/move")
def move_item_endpoint(
    serial: str, 
    payload: ItemMove, 
    db: Session = Depends(get_db_session)
):
    try:
        crud.move_item(session=db, serial=serial, new_location_id=payload.new_location_id)
        return {"status": "success", "message": f"Item {serial} moved to location {payload.new_location_id}"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

```

### The Updated Project

Here is the fully reconstructed `nexus/main.py`, now exposing our transactional domain logic to the web.

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from db import get_db_session
# ← new: Import the ItemMove schema
from schemas import SKUCreate, SKURead, ItemMove
import crud

app = FastAPI(title="NexusInventory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "online"}

@app.post("/skus", response_model=SKURead)
def create_sku_endpoint(sku_in: SKUCreate, db: Session = Depends(get_db_session)):
    try:
        return crud.create_sku(session=db, sku_in=sku_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/skus/{sku_id}", response_model=SKURead)
def read_sku_endpoint(sku_id: str, db: Session = Depends(get_db_session)):
    sku = crud.get_sku(session=db, target_id=sku_id)
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    return sku

# ← new: The Action Endpoint combining Path and Body data
@app.post("/items/{serial}/move")
def move_item_endpoint(
    serial: str, 
    payload: ItemMove, 
    db: Session = Depends(get_db_session)
):
    try:
        crud.move_item(session=db, serial=serial, new_location_id=payload.new_location_id)
        return {"status": "success", "message": f"Item {serial} moved to location {payload.new_location_id}"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

```

The FastAPI router will now extract the serial number from the URL path, parse the JSON body into the `payload` object, and execute the atomic database transaction.

### Mechanical walkthrough

1. `from schemas import ..., ItemMove`: (Basic syntax).
2. `@app.post("/items/{serial}/move")`: (Hard concept reappearing: FastAPI routing). Binds HTTP POST to a nested URL. The `{serial}` is a dynamic path variable. Using verbs like `/move` in a URL breaks pure REST conventions, shifting into an RPC (Remote Procedure Call) over HTTP style, which is highly effective for explicit actions.
3. `def move_item_endpoint(...)`: (Basic syntax).
4. `serial: str`: (Basic syntax). Extracts the `{serial}` string directly from the URL path.
5. `payload: ItemMove`: (Hard concept reappearing: Pydantic Validation). Instructs FastAPI to intercept the HTTP request body, read it as JSON, validate it against the `ItemMove` class, and inject the resulting object here.
6. `db: Session = Depends(get_db_session)`: (Hard concept reappearing: Dependency Injection). Yields the secure SQLite transaction connection.
7. `crud.move_item(...)`: (Basic syntax). Calls our atomic function from Lesson 7.
8. `payload.new_location_id`: (Basic syntax). Accesses the validated integer from the Pydantic object.
9. `return {"status": "success", ...}`: (Basic syntax). Returns a native dictionary which FastAPI serializes to an HTTP 200 JSON response.
10. `except ValueError as e: raise HTTPException(...)`: (Hard concept reappearing: HTTP Exception Mapping). In `crud.py`, we explicitly wrote `raise ValueError("Item not found")` if the database query failed. We catch that specific Python error here and translate it into a network-standard `404 Not Found`.

### CS Lens

**RPC over REST.** Pure REST dictates that URLs represent nouns (`/items`), and HTTP methods represent actions (`PUT /items/123`). However, complex business domains often involve actions that don't neatly map to `PUT` or `PATCH`. "Moving an item" requires an audit log. By appending `/move` to the URL, we transition from pure REST to RPC-style endpoints. This clarifies system intent: we are invoking a specific process, not just modifying a database row.

### SE Lens

Notice this endpoint does not have `response_model=...` defined. Why? **Stateful Returns vs Acknowledgements.** When you create a SKU, you return the whole SKU object so the client has the generated data. When you execute an action like a move, returning the entire Item object is often unnecessary bandwidth. Returning a simple JSON acknowledgement (`{"status": "success"}`) reduces payload size and keeps the network fast.

### Commands needed to make this unit real

Because our frontend relies on `TEST-99`, we need to ensure an actual physical `Item` with that serial number exists in the database for the endpoint to move.
Create a temporary file `seed_item.py`:

```python
from db import engine
from sqlalchemy.orm import Session
from models import Item, Base
Base.metadata.create_all(engine)
with Session(engine) as session:
    session.add(Item(serial_number="TEST-99", sku_id="TEST-99", location_id=1))
    session.commit()
    print("Seed complete.")

```

Run it once:

```bash
python seed_item.py

```

*(You can delete `seed_item.py` after it prints "Seed complete.")*

Ensure your API is running:

```bash
python nexus/main.py

```

### Run it. Show the real output.

Test the endpoint directly using `curl` before connecting the frontend:

```bash
curl -X POST http://127.0.0.1:8000/items/TEST-99/move \
-H "Content-Type: application/json" \
-d '{"new_location_id": 2}'

```

Output:

```text
{"status":"success","message":"Item TEST-99 moved to location 2"}

```

### One sentence connecting this unit to what came immediately before.

The backend is completely prepared to receive and execute move commands, so we must now upgrade the frontend JavaScript to properly format and dispatch them.

---

## Concept Unit: Client-Side POST Requests

### The Problem

In Lesson 11, we used `fetch("URL")`. By default, `fetch` sends an HTTP `GET` request with no body. To trigger our new endpoint, the browser must send a `POST` request, serialize a JavaScript object into a JSON string, and manually attach HTTP headers declaring the data type.

### Introduce the concept in isolation

Create `lab_post.js` to observe how to configure `fetch` for data transmission.

```javascript
async function testPost() {
    const payload = { new_location_id: 2 };
    
    // 1. fetch takes an optional second argument: the configuration object
    const response = await fetch("http://127.0.0.1:8000/health", {
        method: "POST", // Override default GET
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload) // Convert memory object to text
    });
    
    console.log("Status Code:", response.status);
}

testPost();

```

Run it via Node.js in a terminal:

```bash
node lab_post.js

```

Output:

```text
Status Code: 405

```

*What this proves:* The fetch configuration successfully sent a `POST` request. The API rejected it with `405 Method Not Allowed` because the `/health` endpoint is exclusively decorated with `@app.get`. The browser successfully executed a state-mutation request structure.

### Discard the throwaway example

Delete `lab_post.js`. We will now implement the real request in our dashboard application.

### Project Change

We will update `nexus/frontend/app.js` to add a new asynchronous mutation function, and modify the HTML template string to connect the button to this new function.

* **Files affected:** `nexus/frontend/app.js`.
* **Change type:** Modify.
* **Location:** Below the existing `fetchAndRenderSKU` function, and inside the template literal.
* **Dependencies:** None.

### The New Code

```javascript
async function moveItem(serial) {
    const targetId = prompt(`Enter new Location ID for ${serial}:`);
    if (!targetId) return;

    try {
        const response = await fetch(`${API_BASE}/items/${serial}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_location_id: parseInt(targetId) })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Move failed: ${response.status}`);
        }
        
        alert(`Successfully moved ${serial} to Location ${targetId}!`);
    } catch (error) {
        console.error("Error:", error);
        alert(`Failed to move item: ${error.message}`);
    }
}

```

### The Updated Project

Here is the fully reconstructed `nexus/frontend/app.js` file. Notice the `onclick` attribute in the HTML template literal has been updated to call our new function.

```javascript
const API_BASE = "http://127.0.0.1:8000";

async function fetchAndRenderSKU(skuId) {
    try {
        const response = await fetch(`${API_BASE}/skus/${skuId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sku = await response.json();
        
        const tbody = document.getElementById("sku-table-body");
        const tr = document.createElement("tr");
        
        // ← modified: onclick now triggers the async moveItem function
        tr.innerHTML = `
            <td><strong>${sku.sku_id}</strong></td>
            <td>${sku.name}</td>
            <td>${sku.description || "N/A"}</td>
            <td>
                <button class="action-btn" onclick="moveItem('${sku.sku_id}')">
                    Move Stock
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    } catch (error) {
        console.error("Failed to fetch SKU:", error);
    }
}

// ← new: The async POST function handling data collection and transmission
async function moveItem(serial) {
    const targetId = prompt(`Enter new Location ID for ${serial}:`);
    if (!targetId) return; // User cancelled

    try {
        const response = await fetch(`${API_BASE}/items/${serial}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_location_id: parseInt(targetId) })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Move failed: ${response.status}`);
        }
        
        alert(`Successfully moved ${serial} to Location ${targetId}!`);
    } catch (error) {
        console.error("Error:", error);
        alert(`Failed to move item: ${error.message}`);
    }
}

fetchAndRenderSKU("TEST-99");

```

*(Note: For this frontend lesson, we are passing the `sku.sku_id` string as the `serial` parameter to simulate moving a physical item belonging to that SKU).*

### Mechanical walkthrough

1. `async function moveItem(serial) {`: (Basic syntax).
2. `prompt(...)`: (First appearance). A synchronous browser API that halts script execution and displays a native input dialog. This satisfies the need for tactile, immediate data entry without the overhead of building a complex HTML modal window.
3. `if (!targetId) return;`: (Basic syntax). Guard clause terminating the function if the user clicks "Cancel" or submits an empty string.
4. `fetch(..., { ... })`: (First appearance). Passes the configuration object as the second parameter.
5. `method: "POST"`: (First appearance). Overrides the default `GET` action.
6. `headers: { "Content-Type": "application/json" }`: (First appearance). Manually inserts an HTTP header. This is strictly required; without it, FastAPI will assume the payload is plain text or form-data and reject it with a `422 Unprocessable Entity` error.
7. `JSON.stringify(...)`: (First appearance). A native JavaScript method. It takes the in-memory JavaScript object `{ new_location_id: 2 }` and serializes it into a raw string of bytes `{"new_location_id":2}` suitable for network transport.
8. `parseInt(targetId)`: (First appearance). `prompt` always returns a string. Our Pydantic `ItemMove` schema demands an `int`. If we pass the string `"2"`, Pydantic will actually coerce it for us (as seen in Lesson 3), but casting it to an integer client-side ensures pristine JSON types are transmitted.
9. `const errorData = await response.json();`: (Basic syntax). If the response is not OK (e.g., a 404 from FastAPI), we still parse the JSON to extract the `{"detail": "Item not found"}` message generated by our `HTTPException`.

### CS Lens

**Serialization.** Converting in-memory object graphs (which contain pointers and references) into flat byte streams is a universal computing challenge. `JSON.stringify()` flattens the JavaScript object. Across the network, FastAPI reads the string, and Pydantic deserializes it back into a Python object graph.
*Also recognized in:* Python's `pickle` library, Google's Protocol Buffers (Protobuf), and TCP packet framing.

### SE Lens

Why use a native `prompt()` instead of a styled HTML input field? **Development Velocity vs. UX.** Native dialogs are ugly, block the main browser thread, and cannot be custom-styled. However, for internal enterprise tools or rapid prototyping, they require zero CSS and zero DOM management. It perfectly matches the ethos of a crisp, tactile dashboard. As the application scales, this `prompt` would naturally be replaced by an inline `<input>` element inside the activity table row itself, preserving the flat UX without relying on thread-blocking alerts.

### Commands needed to make this unit real

Refresh your web browser displaying `nexus/frontend/index.html`.

### Run it. Show the real output.

1. Click the blue **Move Stock** button on the `TEST-99` row.
2. The browser pauses and shows an input box: `Enter new Location ID for TEST-99:`.
3. Type `3` and press Enter.
4. An alert appears: `Successfully moved TEST-99 to Location 3!`.

*(If you look at your FastAPI terminal, you will see `POST /items/TEST-99/move HTTP/1.1" 200 OK`, proving the database transaction was successful).*

### One sentence connecting this unit to what came immediately before.

By translating user clicks into serialized network requests, we have closed the loop, giving humans direct, controlled access to the atomic storage engine.

---

## Closing

**Connect the pieces**
To trace this mutation pipeline: The user types `3` into the browser prompt. `app.js` builds a JavaScript object, uses `JSON.stringify()` (Lesson 12) to serialize it, and executes a `fetch` `POST` with `Content-Type: application/json`. The request traverses the network to Uvicorn (`main.py`). The route `/items/{serial}/move` extracts `TEST-99`. FastAPI hands the stringified body to Pydantic, which deserializes it and validates it against `ItemMove` (Lesson 12). The dependency injector yields a `Session` (Lesson 9). The endpoint passes the serial and location to `crud.move_item()` (Lesson 7), which acquires a pessimistic write-lock (`.with_for_update()`), updates the `Item` row, writes a `Movement` ledger record with a `server_default` timestamp, and commits the transaction to the SQLite `WAL` file (Lesson 1). FastAPI returns `{"status": "success"}`, and `app.js` displays the final confirmation alert.

**What breaks without this**
If you forget to include `headers: { "Content-Type": "application/json" }` in your `fetch` configuration, the browser will send the request with a default content type (often `text/plain`). When FastAPI receives it, it will look at the header, realize it isn't JSON, and instantly abort the request with a `422 Unprocessable Entity` error. The request will never even reach Pydantic or the CRUD layer.

**Exercises**

1. Click the **Move Stock** button again, but type `999` (a location ID that does not exist in our database). Because of the strict SQLite Foreign Keys we enabled in Lesson 1, the `commit()` will fail, our `crud.py` `try/except` block will catch it and rollback, FastAPI will translate it to an error, and your browser alert will display: `Failed to move item: ForeignKey Violation...` (or similar SQLite integrity message).
2. Modify `app.js` to clear the `tbody.innerHTML` and re-run `fetchAndRenderSKU` automatically inside the `try` block of `moveItem()` so the UI visually updates without needing a page refresh.

**Definition of Done**

* [x] Command payload schema (`ItemMove`) defined for action-oriented endpoints.
* [x] FastAPI POST endpoint combining path variables and JSON bodies is bound to the CRUD transaction.
* [x] `app.js` utilizes `fetch` configuration objects to send `POST` methods and HTTP headers.
* [x] Object state is serialized to text using `JSON.stringify()`.
* [x] You can commit these changes with the message: `feat: implement client side post request and action endpoint for item movement`.