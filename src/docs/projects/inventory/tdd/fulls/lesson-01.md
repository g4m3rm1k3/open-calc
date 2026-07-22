# Lesson 1: The Application Homepage

**What you will build**
A minimal FastAPI application with one endpoint, verified by an automated test written *before* the endpoint exists. The problem we are solving isn't "how do I return HTML" — it's establishing the request/response cycle correctly from the very first line of code, and proving it with a test rather than eyeballing a browser.

**What you need to know first**
Nothing from this project yet — this is Lesson 1. You already know Python syntax; nothing here is new Python, only new concepts about how a web request becomes a Python function call.

**The Pipeline**
`Client Request → FastAPI (Routing) → Python function → Response`
Everything after this lesson adds a stage to this pipeline. Today we build the whole thing, just with the smallest possible payload at each stage.

---

## Concept Unit: The Request/Response Cycle and a Failing Test

### The Problem

When you type a URL into a browser, something has to turn that text into a specific piece of Python code running, and turn whatever that code returns back into bytes the browser can display. Before we write that "something," we should decide what we expect it to do — in a form we can check automatically, not by looking at a browser screen every time.

### The failing test

Create `tests/test_api.py`:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_homepage_returns_200():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Developer Social Network"}
```

Run it:

```bash
pytest tests/
```

Output:

```text
ImportError: cannot import name 'app' from 'main' (No module named 'main')
```

*Why this fails:* there is no `main.py`, so there is no `app` object to import. That's expected — we're about to build exactly enough to make this pass, and nothing more. The test is the specification; the code that follows exists only to satisfy it.

### Introduce the concept in isolation

Before building the real thing, see what a "web application object" even is, stripped to nothing.

Create `lab_app.py`:

```python
from fastapi import FastAPI

app = FastAPI()

print(type(app))
print(app.routes)
```

Run it:

```bash
python lab_app.py
```

Output:

```text
<class 'fastapi.applications.FastAPI'>
[]
```

*What this proves:* `FastAPI()` doesn't start a server or do anything visible — it just creates a plain Python object that starts with an empty list of routes (`app.routes`). A "web application" at this stage is nothing more than a registry, waiting to be told what to do when a particular URL is requested. There's no magic yet — it's a Python object like any other, which you can inspect exactly the way you'd inspect a list or a dict.

### Discard the throwaway example

Delete `lab_app.py`. We now build the real `main.py`.

### Project Change

* **Files affected:** Create `main.py`.
* **Change type:** Add.
* **Location:** Project root.
* **Dependencies:** `fastapi`, `uvicorn` (server), `pytest`, `httpx` (used internally by `TestClient`).

### The New Code

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def homepage():
    return {"message": "Welcome to the Developer Social Network"}
```

### The Updated Project

This is the entire file, `main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

# ← new: registers a function to run when a GET request hits "/"
@app.get("/")
def homepage():
    return {"message": "Welcome to the Developer Social Network"}
```

### Mechanical walkthrough

1. `from fastapi import FastAPI`: (first appearance). Imports the class we inspected in isolation above — a registry object, not a running server.
2. `app = FastAPI()`: (already established — same object we just examined).
3. `@app.get("/")`: (first appearance). This line is a **decorator** — Python syntax that takes the function defined immediately below it and passes it *into* another function (`app.get`) before the name `homepage` is finalized. Concretely: `app.get("/")` returns a function, and that returned function is immediately called with `homepage` as its argument. The net effect is: `app.routes` (empty a moment ago) now contains one entry — "when a GET request arrives for the path `/`, call `homepage`." This is exactly the registry behavior we saw in isolation, just no longer empty.
4. `def homepage():`: (already established syntax — an ordinary Python function). What's new is *how* it gets called: not by you, but by FastAPI, when a matching request arrives.
5. `return {"message": ...}`: (already established syntax — an ordinary dict). FastAPI converts this dict into a JSON string and attaches the header that tells the browser "this is JSON," a step you don't write any code for — it happens because FastAPI inspected the return value's type.

### CS Lens

**Inversion of Control.** In a normal script, your code decides what runs and when — top to bottom. Here, you hand a function to a framework and the framework decides when to call it, based on an event (an HTTP request) it's listening for. You wrote `homepage`, but you never call `homepage()` yourself anywhere — FastAPI does, later, possibly many times, possibly never. This same pattern — "give the framework a function, it calls you back" — is how button clicks work in UI frameworks, how test runners find `test_` functions, and how `Depends()` will work starting in Lesson 9.

### SE Lens

Why a `TestClient` test *before* a running server? **Feedback loop speed and specification-first design.** Writing the test first forces you to decide the exact contract (status code, exact JSON shape) before any implementation exists, which means the implementation has one clear job: make the test pass. The alternative — write the endpoint, then open a browser, then decide if it "looks right" — has no fixed target, which is exactly the failure mode you described earlier: code that looks right until it isn't.

### Commands needed

```bash
pip install fastapi uvicorn pytest httpx
```

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 1 item

tests/test_api.py .                                                      [100%]

============================== 1 passed in 0.03s ===============================
```

The test that failed with an `ImportError` at the start of this lesson now passes.

### Connecting sentence

We have a working request/response cycle proven by a test — but right now the response is a hardcoded dict, with no rules about what shape that data is allowed to take. That's the next problem.

---

## Concept Unit: Type Systems and Response Models

### The Problem

Right now, `homepage()` could return `{"message": "hi"}` today and `{"msg": 123}` tomorrow, and nothing would stop it — Python won't complain, and neither will FastAPI. As this project grows to dozens of endpoints, "what shape is the data" becomes something you have to hold entirely in your head, for every endpoint, forever. We need a way to state the shape once and have it enforced automatically.

### Introduce the concept in isolation

Create `lab_types.py`:

```python
def add_untyped(a, b):
    return a + b

print(add_untyped(2, 3))
print(add_untyped("2", "3"))

def add_typed(a: int, b: int) -> int:
    return a + b

print(add_typed(2, 3))
print(add_typed("2", "3"))
```

Run it:

```bash
python lab_types.py
```

Output:

```text
5
23
5
23
```

*What this proves — and this is important, not a mistake:* Python ran `add_typed("2", "3")` and printed `23` without complaint. The `: int` annotations are **not enforced by Python at runtime.** They're documentation that *other tools* (like a type checker, or FastAPI itself) can read and act on — Python itself ignores them when running the code. This is the core fact about Python's type system: it's optional and unenforced unless something else is checking it. That "something else," for us, is about to be Pydantic.

### Discard the throwaway example

Delete `lab_types.py`. FastAPI uses a library called Pydantic to actually enforce shape, which Python alone does not do.

### Project Change

* **Files affected:** Create `schemas.py`. Modify `main.py`.
* **Change type:** Add + Modify.
* **Location:** New file; `homepage()`'s return type in `main.py`.
* **Dependencies:** `pydantic` (installed automatically with FastAPI).

### The New Code

```python
# schemas.py
from pydantic import BaseModel

class HomepageResponse(BaseModel):
    message: str
```

```python
# main.py — add response_model
@app.get("/", response_model=HomepageResponse)
def homepage():
    return {"message": "Welcome to the Developer Social Network"}
```

### The Updated Project

`schemas.py` (new file, entire contents):

```python
from pydantic import BaseModel

# ← new: declares the exact shape a homepage response must have
class HomepageResponse(BaseModel):
    message: str
```

`main.py` (updated):

```python
from fastapi import FastAPI
from schemas import HomepageResponse

app = FastAPI()

# ← new: response_model enforces the shape declared in HomepageResponse
@app.get("/", response_model=HomepageResponse)
def homepage():
    return {"message": "Welcome to the Developer Social Network"}
```

### Mechanical walkthrough

1. `from pydantic import BaseModel`: (first appearance). `BaseModel` is a class that, unlike a plain Python function, actually checks its declared types *at runtime* — the opposite of what we just proved plain Python annotations do.
2. `class HomepageResponse(BaseModel):`: (first appearance). Declares a new type by inheriting from `BaseModel`. `HomepageResponse` is now a blueprint: "anything claiming to be this shape must have a `message` field that is a string."
3. `message: str`: (already established annotation syntax) — but here, because the class inherits from `BaseModel`, this annotation is *enforced*, not ignored, unlike in `lab_types.py`.
4. `response_model=HomepageResponse`: (first appearance). Tells FastAPI: after `homepage()` returns, check the result against `HomepageResponse` before sending it. If `homepage()` ever returned `{"msg": 123}` instead, this would now cause an error at the boundary, instead of silently shipping the wrong shape to whoever's calling the API.

### CS Lens

**Static vs. dynamic typing, and where Python actually sits.** Python is dynamically typed — types are checked (if at all) while the program runs, not before. A statically typed language (you'll meet this properly with TypeScript and later C++) checks types *before* the program ever runs, rejecting it outright if the shapes don't match. Pydantic is Python's way of buying some of static typing's safety — but only at the specific boundary you tell it to check, and only at runtime, not before.

### SE Lens

What's the tradeoff of `response_model`? **A small performance cost, in exchange for a contract.** Every response now gets validated, which costs a small amount of time. What you get back: a guarantee, enforced automatically forever, that this endpoint's shape can't silently drift — which is exactly the class of bug ("I didn't know the correct implementation because I didn't understand the system") that's hardest to catch by reading code, and easiest to catch by having the computer check it for you.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 1 item

tests/test_api.py .                                                      [100%]

============================== 1 passed in 0.03s ===============================
```

Still passing — `response_model` didn't change behavior here, only added a guarantee that will matter the moment someone (you, or an AI agent editing this code later) tries to quietly change what `homepage()` returns.

### Connecting sentence

We can now guarantee one endpoint's shape — but a social network needs more than one page, and the next one won't be static: it needs to read from a database.

---

## Closing

**Connect the pieces**
A `GET /` request arrives. FastAPI's routing (registered via the `@app.get("/")` decorator) matches it to `homepage()`. `homepage()` returns a plain dict. Because `response_model=HomepageResponse` is set, Pydantic checks that dict against the `HomepageResponse` class before anything is sent back, confirming `message` is present and is a string. The response is serialized to JSON and returned. Separately, before any of this existed, `test_homepage_returns_200` specified this exact contract and failed until the code above satisfied it.

**What breaks without this**
If you remove `response_model=HomepageResponse` and then change `homepage()` to `return {"msg": "hi"}` (typo: `msg` not `message`), nothing will warn you — the app runs, the endpoint returns `200`, and only a human eyeballing the JSON (or, correctly, the test we wrote) would catch the typo. With `response_model` in place, that same typo produces an immediate, loud error at the response boundary instead of a silent bug shipped to production.

**Exercises**
1. In `schemas.py`, temporarily add a second required field to `HomepageResponse` that `homepage()` doesn't return (e.g. `version: str`). Run the test suite and read the actual Pydantic validation error — this is what "the contract is enforced" looks like when it fails.
2. Revert your change, confirm the test passes again.

**Definition of Done**
* [x] `main.py` exists with a single `/` route.
* [x] `tests/test_api.py` was written and observed failing before the code existed.
* [x] `schemas.py` defines `HomepageResponse` and it's wired in via `response_model`.
* [x] All tests pass.
* [x] Commit: `feat: homepage endpoint with TDD and response model validation`

---

## Context Snapshot (End of Lesson 1)

**1. File Tree:**
```
main.py
schemas.py
tests/test_api.py
```

**2. Schema State:** No database yet.

**3. API Manifest:**
- `GET /` → `HomepageResponse {message: str}`

**4. Dependencies:** fastapi, uvicorn, pydantic, pytest, httpx

**5. Test State:** 1 test, 1 passing.

**6. Terminology Ledger:**
| Term | First taught | Plain meaning |
|---|---|---|
| Request/response cycle | L1 | A request comes in, a function runs, a response goes out |
| `FastAPI()` app object | L1 | A registry of routes, not a running server |
| Decorator (`@app.get`) | L1 | Registers the function below it into that registry |
| Inversion of control | L1 | You hand functions to a framework; it decides when to call them |
| Python type annotations (unenforced) | L1 | Documentation only — Python itself ignores them at runtime |
| Pydantic `BaseModel` | L1 | A class that enforces its declared types at runtime, unlike plain annotations |
| `response_model` | L1 | Tells FastAPI to validate a function's return value against a BaseModel before sending it |
| Static vs dynamic typing | L1 | Static = checked before running; dynamic = checked (if at all) while running |
| TestClient | L1 | Simulates HTTP requests in-process, no real server/port needed |

**7. Lesson Completion State:**
- Completed: Lesson 1
- Next: Interlude A — Memory Model (stack vs heap, references vs values)

**8. Current Architecture State:**
- HTTP Layer: introduced (single route)
- Business Logic: not introduced
- Data Access: not introduced
- ORM: not introduced
- Authentication: not introduced
