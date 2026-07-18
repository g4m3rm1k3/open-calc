# Lesson 22: Authentication and Secure State

**What you will build**
You will build a basic API Authentication system. Until now, any user with access to the dashboard could move any item, essentially acting as an unrestricted "super-admin." The problem we are solving is secure state mutation: ensuring that only authorized users can trigger the `move_item` endpoint by requiring a cryptographically signed token.

**What you need to know first**
From Lesson 9: FastAPI `Depends()` and `HTTPException`. From Lesson 11: CORS middleware.

**The Pipeline**
`[ Browser (Auth Token) ] → FastAPI (Dependency Override) → Pydantic (Auth Schema) → [ Storage (User Registry) ]`

This lesson adds a critical security gate before the **FastAPI (Routing)** stage. We will require an HTTP header, `Authorization: Bearer <token>`, on every request. Our backend will validate this token before it ever executes the CRUD operations.

---

## Concept Unit: Bearer Tokens and Dependency Guards

### The Problem

We need a way to identify the caller. In a real production system, you use OAuth2/OpenID Connect. For our learning purposes, we will implement a "Bearer Token" system: the user provides a secret string, and our API verifies it against a local list of authorized keys.

### Introduce the concept in isolation

Create `lab_auth.py` to see how FastAPI can extract an HTTP header and throw a 401 error if it's missing or incorrect.

```python
from fastapi import FastAPI, Depends, HTTPException, Header

app = FastAPI()

# The secret token we expect
SECRET_TOKEN = "nexus-secret-123"

# A dependency that acts as a guard
def verify_token(authorization: str = Header(...)):
    if authorization != f"Bearer {SECRET_TOKEN}":
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return True

@app.get("/secure-data", dependencies=[Depends(verify_token)])
def get_data():
    return {"data": "You are authorized!"}

```

Run it, then test with `curl`:

```bash
# This will fail
curl http://127.0.0.1:8000/secure-data
# This will succeed
curl -H "Authorization: Bearer nexus-secret-123" http://127.0.0.1:8000/secure-data

```

*What this proves:* By adding `dependencies=[Depends(verify_token)]` to the route, FastAPI runs the check *before* the endpoint logic executes. If the header is wrong, it raises a `401 Unauthorized` exception, and the function `get_data()` is never called.

### Discard the throwaway example

Delete `lab_auth.py`. We will now protect our production movement endpoint.

### Project Change

We will add the `verify_token` dependency to our API and protect the sensitive `POST` endpoint.

* **Files affected:** `nexus/main.py`.
* **Change type:** Modify.
* **Location:** Update the `move_item_endpoint` route decorator.
* **Dependencies:** `Header` from `fastapi`.

### The New Code

```python
from fastapi import FastAPI, Depends, HTTPException, Header

def verify_token(authorization: str = Header(...)):
    if authorization != "Bearer nexus-secret-123":
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.post("/items/{serial}/move", dependencies=[Depends(verify_token)])
# ... (rest of the function signature stays the same)

```

### The Updated Project

Here is the updated `nexus/main.py` route for moving items.

```python
# ... (imports) ...
from fastapi import FastAPI, Depends, HTTPException, Header

# ... (rest of app config) ...

# ← new: Security guard for all sensitive mutations
def verify_token(authorization: str = Header(...)):
    if authorization != "Bearer nexus-secret-123":
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.post("/items/{serial}/move", dependencies=[Depends(verify_token)])
def move_item_endpoint(
    serial: str, 
    payload: ItemMove, 
    db: Session = Depends(get_db_session)
):
    # ... (function body remains identical)

```

### Mechanical walkthrough

1. `Header(...)`: (First appearance). A FastAPI type-hint that instructs the framework to look for a specific HTTP Header (in this case, the standard `Authorization` header).
2. `dependencies=[Depends(verify_token)]`: (First appearance). A decorator argument that executes the guard function before the route handler.

### SE Lens

Why use `Header(...)` instead of a cookie? **Statelessness.** Cookies are automatically attached by browsers, which makes them vulnerable to Cross-Site Request Forgery (CSRF). Bearer tokens are manually managed by our JavaScript, meaning a malicious site cannot accidentally trigger a request on behalf of the user because they don't have access to the user's secret `Bearer` token string.

### Run it.

Try moving an item using your previous `curl` command. It will now return `422 Unprocessable Entity` (or `401` if you omit the header). Then add the header:

```bash
curl -X POST http://127.0.0.1:8000/items/TEST-99/move \
-H "Authorization: Bearer nexus-secret-123" \
-H "Content-Type: application/json" \
-d '{"new_location_id": 2}'

```

### One sentence connecting this unit to what came immediately before.

With the movement endpoint now locked behind a token, we must update the frontend's `moveItem` function to attach the authorization header to every outgoing mutation.

---

## Unit: Upgrading the Frontend Auth

### The Problem

Our `fetch` calls in `app.js` are currently unauthenticated. We need to modify `moveItem` to include the `Authorization` header.

### Project Change

Update `nexus/frontend/app.js`:

```javascript
async function moveItem(serial) {
    const targetId = prompt(`Enter new Location ID for ${serial}:`);
    if (!targetId) return;

    try {
        const response = await fetch(`${API_BASE}/items/${serial}/move`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer nexus-secret-123" // ← new
            },
            body: JSON.stringify({ new_location_id: parseInt(targetId) })
        });
        // ... (rest same)
    } catch (error) { ... }
}

```

### Closing

Our API is now protected, and our frontend is configured to present the "key" to the security gate.