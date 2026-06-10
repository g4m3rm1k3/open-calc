# Sprint 1 · Lesson 3 — Scaffold a FastAPI server, read every file

## What you will build

By the end of this lesson, a Python web server is running at `localhost:8000`. It has one route that returns JSON. You will be able to hit it in the browser, in an interactive documentation UI, and via the terminal. You will understand what every line of `main.py` does, what uvicorn is, what ASGI means, what the `@` decorator syntax does, and why returning a Python dict sends JSON to the browser. Nothing is magic.

---

## What you need to know first

- Lesson 1: Python is installed, the virtual environment is created inside `fullstack-project/`.
- Lesson 2: You understand what a port is, what localhost means, and what a development server does.

**Concepts carried forward:** PORT, localhost, loopback address, environment, process model, virtual environment activation.

---

## The lesson

---

### 1. Create the backend directory and activate the environment

**The problem:** Your project currently has a `frontend/` directory. The backend needs its own directory with its own Python files and its own isolated dependencies. Mixing frontend (JavaScript) and backend (Python) files in the same directory is possible but creates confusion about what belongs to which part of the system.

From your `fullstack-project/` directory:

```
mkdir backend
cd backend
```

The virtual environment you created in Lesson 1 lives at `fullstack-project/venv/`. Activate it from the `backend` directory:

```
source ../venv/bin/activate
```

`../venv/bin/activate` — `..` means "the parent directory" (`fullstack-project/`). `../venv` means "the `venv` directory inside the parent." The path is relative: one level up, then into `venv/bin/activate`. After activation, `(venv)` appears in your prompt.

**Walkthrough:** The activation script prepends `../venv/bin` to PATH — the exact same PATH manipulation as Lesson 1. From the `backend/` directory, the `../` traversal locates the virtual environment correctly. The virtual environment does not care which directory you are in when you activate it; it cares about where the activation script lives.

**Why one virtual environment for the whole project:** You could create separate virtual environments for `frontend/` and `backend/`. But `frontend/` uses npm (not pip) for its dependencies, so it has no Python packages. The virtual environment is Python-only and used exclusively by the backend. One environment is sufficient and simpler.

**CS lens — relative paths and working directory.** `../venv/bin/activate` is a relative path. It means something different depending on the working directory. From `backend/`, `..` is `fullstack-project/`. From `frontend/`, `..` is also `fullstack-project/`. The path works correctly from any subdirectory of `fullstack-project/`. Relative paths are used when the exact location of a file relative to the current context matters more than its absolute location — which is true for project-internal references.

**What breaks without this:** If you install FastAPI without activating the virtual environment, it installs globally. The server will run (because global Python finds global FastAPI), but you cannot reproduce the environment: `requirements.txt` (the Python equivalent of `package.json`) will be empty when you generate it, because it records only what is in the active virtual environment.

---

### 2. Install FastAPI and uvicorn

**The problem:** Python is installed but FastAPI is not. FastAPI is a third-party library — it is not part of Python's standard library. You need to download it.

```
pip install fastapi uvicorn[standard]
```

Expected output (abbreviated):
```
Collecting fastapi
  Downloading fastapi-0.115.0-py3-none-any.whl (94 kB)
Collecting uvicorn[standard]
  Downloading uvicorn-0.30.0-py3-none-any.whl (62 kB)
...
Successfully installed fastapi-0.115.0 uvicorn-0.30.0 ...
```

**Walkthrough:** `pip install` downloads packages from the Python Package Index (PyPI) — the same role that npmjs.com plays for JavaScript. You are installing two packages:

`fastapi` — the web framework. A **web framework** is a library that handles the repetitive parts of building a web server: routing HTTP requests to the right function, parsing request bodies, validating data, and formatting responses. FastAPI specifically handles all of this while adding automatic validation (via Pydantic, Sprint 2) and automatic documentation (via OpenAPI, shown below).

`uvicorn[standard]` — the HTTP server. `uvicorn` is the program that listens on port 8000 and receives HTTP connections. FastAPI itself cannot receive HTTP connections — it is a library that processes requests, not a server that accepts network connections. uvicorn is the server. `[standard]` is an **extras** specifier: it installs optional dependencies that uvicorn recommends for production use (`httptools` for faster HTTP parsing, `uvloop` for faster async I/O on Linux/macOS).

After installation, save the installed packages to a file:

```
pip freeze > requirements.txt
```

**Walkthrough of `pip freeze > requirements.txt`:** `pip freeze` prints every package currently installed in the virtual environment, with its exact version, in the format `package==version`. The `>` operator redirects that output to a file named `requirements.txt`. This file is the Python equivalent of `package-lock.json`: it records exact versions so that `pip install -r requirements.txt` on any machine installs identical packages. Commit `requirements.txt` to git; do not commit `venv/`.

**CS lens — package registries as centralised trust.** PyPI and npm are **centralised registries** — databases of packages that any developer can publish to. Every `pip install` or `npm install` implicitly trusts the registry: it downloads and executes third-party code on your machine. This is a significant security surface. Production engineering teams lock dependencies to exact versions (as `requirements.txt` and `package-lock.json` do) to prevent malicious package updates from automatically affecting their systems. In Sprint 6 you will learn about supply chain attacks — a real class of production incidents.

**What breaks without this:** If FastAPI is not installed and you try to `import fastapi`, Python raises `ModuleNotFoundError: No module named 'fastapi'`. If uvicorn is not installed and you run `uvicorn main:app`, the shell reports `command not found`. Both errors mean the virtual environment does not have the package — run `pip install` again with the environment activated.

---

### 3. Write `main.py`

**The problem:** You have the tools. Now write the server.

Create `backend/main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI is running"}
```

Run it:

```
uvicorn main:app --reload
```

Expected output:
```
INFO:     Will watch for changes in these directories: ['/Users/yourname/fullstack-project/backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Open `http://localhost:8000` in your browser. You will see:
```json
{"message":"FastAPI is running"}
```

**Walkthrough of `main.py` line by line:**

`from fastapi import FastAPI` — imports the `FastAPI` class from the `fastapi` package. This is a **named import** — you are importing one specific name from the module. The `fastapi` package is what pip installed into the virtual environment. `FastAPI` is the class that represents your entire application: it holds all your routes, middleware, and configuration.

`app = FastAPI()` — creates an instance of the `FastAPI` class. The variable name `app` is a convention, not a requirement. This object is your application. It is the object you pass to uvicorn. Every route you define will be registered on this object.

`@app.get("/")` — this is a **decorator**. A decorator is a function that wraps another function, adding behaviour before or after it runs. The `@` syntax is Python's way of applying a decorator. `@app.get("/")` is equivalent to:

```python
def read_root():
    return {"message": "FastAPI is running"}

read_root = app.get("/")(read_root)
```

`app.get` is a method on the `FastAPI` instance. It takes a path (`"/"`) and returns a decorator function. That decorator function receives your function (`read_root`), registers it as the handler for `GET /`, and returns it unchanged (so `read_root` still works as a normal function).

The result: when uvicorn receives a `GET /` HTTP request, FastAPI calls `read_root()` and uses its return value to build the HTTP response.

`def read_root():` — a Python function with no parameters. This is the **route handler** — the function called when a matching HTTP request arrives. FastAPI can inject parameters here automatically (path parameters, query parameters, request bodies) — you will see this in Sprint 2.

`return {"message": "FastAPI is running"}` — returns a Python dictionary. FastAPI detects that the return value is a dict and serialises it to JSON automatically. JSON serialisation means converting the Python object to a JSON-formatted string: `'{"message": "FastAPI is running"}'`. FastAPI sets the `Content-Type` response header to `application/json` automatically. The browser receives this string and displays it.

**Walkthrough of `uvicorn main:app --reload`:**

`uvicorn` — the program to run. Found on PATH because pip installed it into the virtual environment's `bin/` directory, and the activation script added that directory to PATH.

`main:app` — tells uvicorn where to find the FastAPI application object. The format is `module:attribute`. `main` is the Python module (the file `main.py` — Python strips the `.py` extension when loading modules). `app` is the name of the variable inside that module that holds the FastAPI instance. uvicorn imports `main`, finds the `app` attribute, and passes HTTP requests to it.

`--reload` — enables hot reload. When any `.py` file in the current directory changes, uvicorn reloads the application automatically — the same concept as Vite's HMR in Lesson 2, applied to the backend. This is a development-only flag. In production you will not use `--reload`.

**CS lens — the function as the unit of routing.** FastAPI's routing model is: an HTTP method + path → a Python function. This is not the only way to design a web framework (some frameworks use classes, some use configuration files), but it is the clearest: every route is a function, every function is testable in isolation, and every function's signature documents exactly what it accepts and returns. The decorator registers the function without changing it — you can call `read_root()` directly in a test without going through HTTP.

**SE lens — the decorator pattern.** A decorator is an instance of the **decorator design pattern** — a way to add behaviour to a function without modifying its code. `@app.get("/")` adds routing behaviour (register this function as a handler) without changing what the function does. This separation is deliberate: `read_root` is pure business logic; the routing is framework concern. You could test `read_root()` by calling it directly with no HTTP involved, and it would return the dict. Sprint 5 exploits this property.

**Real-world connection:** FastAPI's routing model is used at scale. Stripe's internal Python services, OpenAI's API (the same API that powers many AI products), and Microsoft's internal tooling use FastAPI. The `@app.get` pattern is also the foundation of AWS Lambda functions with function URLs — a serverless architecture where each route is literally a separate deployed function.

**What breaks without this:** If you forget to activate the virtual environment and run `uvicorn main:app --reload`, you may get `command not found` (uvicorn is in the virtual environment's PATH, not the global one). If you write `@app.get("/" )` with a trailing space, it registers a different route (`"/ "` instead of `"/"`) and requests to `http://localhost:8000/` return 404. If you mistype `main:app` as `main:application`, uvicorn cannot find the object and exits with `AttributeError: module 'main' has no attribute 'application'`.

---

### 4. Understand uvicorn and ASGI

**The problem:** You ran `uvicorn main:app` and a server started. You need to understand what uvicorn is doing and what ASGI means — because you will configure uvicorn in production (Sprint 8) and debug it when it misbehaves.

**What uvicorn is:** uvicorn is an **ASGI server** — a program that:
1. Listens for TCP connections on a port (8000 by default)
2. Accepts incoming HTTP connections
3. Parses each HTTP request into a Python-readable structure
4. Passes the request to your FastAPI application
5. Takes the response your application produces
6. Formats it as an HTTP response and sends it back to the client

uvicorn handles all the network-level complexity — TCP socket management, HTTP protocol parsing, connection pooling — so your FastAPI code never deals with raw network data. Your code works at the level of "here is a request object, return a response object."

**What ASGI means:** ASGI stands for Asynchronous Server Gateway Interface. It is a standard — a defined protocol for how an ASGI server (like uvicorn) communicates with an ASGI application (like FastAPI). The protocol says: the server calls the application's `__call__` method with three arguments — a scope (metadata about the connection), a receive function (to read the request body), and a send function (to write the response). FastAPI implements this interface. Any ASGI server can run any ASGI application.

Before ASGI there was WSGI (Web Server Gateway Interface), the standard for synchronous Python web frameworks. Django and Flask use WSGI. FastAPI uses ASGI because ASGI supports asynchronous Python (`async`/`await`), which allows one process to handle many simultaneous requests efficiently. In Sprint 3 you will use `async` route handlers when making database queries.

**CS lens — the interface as a contract.** ASGI is an **interface** — a defined contract between two programs that allows them to be swapped independently. Because uvicorn and FastAPI both implement the ASGI interface, you could swap uvicorn for Daphne, Hypercorn, or Granian without changing a single line of FastAPI code. This is the **dependency inversion principle** applied at the infrastructure level: neither uvicorn nor FastAPI depends on each other's implementations; both depend on the ASGI interface.

**SE lens — the two-process model.** Notice that the server (uvicorn) and the application (FastAPI) are separate concerns. uvicorn handles network protocol; FastAPI handles application logic. This separation is why FastAPI is testable without running uvicorn: in Sprint 5, `TestClient` sends requests to FastAPI directly, bypassing uvicorn entirely. The router does not need the server to function.

**Real-world connection:** In production (Sprint 8), uvicorn runs behind Nginx. Nginx handles TLS (HTTPS encryption), connection rate limiting, and static file serving. Uvicorn handles Python application logic. Nginx → uvicorn → FastAPI is the standard production stack for Python web applications, used by companies including Netflix (for some services), DigitalOcean, and the majority of FastAPI deployments.

**What breaks without this:** If `uvicorn main:app --reload` shows `ERROR: Error loading ASGI app. Could not import module "main".`, uvicorn cannot find the file `main.py`. Confirm you are running the command from the `backend/` directory (where `main.py` lives) with `pwd`.

---

### 5. The interactive documentation at `/docs`

**The problem:** You built an API. Without documentation, nobody — including you in three months — knows what routes exist, what they accept, and what they return.

Open `http://localhost:8000/docs`.

You will see a full interactive API documentation UI. It lists every route you have defined, its HTTP method, its path, and a "Try it out" button that sends a real request and shows the real response.

**What this is:** FastAPI reads your Python code — the `@app.get("/")` decorator, the function's parameter types, the return type annotation — and generates an **OpenAPI schema** at runtime. OpenAPI (formerly Swagger) is a standard format for describing REST APIs. Every route, parameter, and response type is encoded in a JSON schema at `http://localhost:8000/openapi.json`. The `/docs` endpoint serves a UI (Swagger UI) that reads that schema and renders it as interactive documentation.

You wrote zero documentation code. FastAPI generated it from your code.

**CS lens — code as its own specification.** When you add type annotations and Pydantic models (Sprint 2), FastAPI can extract enough information to fully describe the API: which parameters are required, what types they must be, what the response structure looks like. The code is the specification — there is no separate documentation file to keep in sync. This is sometimes called "documentation by contract": the contract (type annotations) drives both validation and documentation simultaneously.

**SE lens — why generated documentation matters.** In a team, the alternative to generated documentation is hand-written documentation — which goes stale the moment someone changes the code without updating the docs. Generated documentation is always current because it is derived from the running code. OpenAPI is also a machine-readable format: tools can read the schema and automatically generate client SDKs in other languages, test suites, mock servers, and more. The spec at `http://localhost:8000/openapi.json` is the same format used by every major API (Stripe, Twilio, GitHub) to publish their API contracts.

**What breaks without this:** The `/docs` page is served by FastAPI only when `debug=True` or when no `docs_url=None` is set. By default it is always available in development. In production you may want to disable it (`app = FastAPI(docs_url=None)`) to avoid exposing your API schema to the public — security through obscurity is not a defence, but hiding it reduces the attack surface.

---

### 6. Add a second route with a path parameter

**The problem:** A server with one route is a server with nothing to learn from. Add a second route that demonstrates how FastAPI handles dynamic URL segments.

Edit `backend/main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI is running"}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id, "name": f"Item number {item_id}"}
```

uvicorn reloads automatically (the `--reload` flag). Open `http://localhost:8000/items/42`. You will see:

```json
{"item_id":42,"name":"Item number 42"}
```

Open `http://localhost:8000/items/hello`. You will see:

```json
{"detail":[{"type":"int_parsing","loc":["path","item_id"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"hello","url":"..."}]}
```

**Walkthrough of the new route:**

`@app.get("/items/{item_id}")` — the `{item_id}` in the path is a **path parameter**. It is a named placeholder that matches any text segment in that position. When a request arrives for `/items/42`, FastAPI extracts `"42"` from the URL and maps it to the parameter named `item_id`.

`def read_item(item_id: int)` — the function parameter `item_id` has type annotation `: int`. FastAPI reads this annotation at startup (not at request time) and knows to convert the extracted string `"42"` to the integer `42` before calling the function. If the conversion fails — as it does for `/items/hello` — FastAPI returns a 422 error automatically with a description of what went wrong. You wrote zero validation code. The type annotation is the validation.

`f"Item number {item_id}"` — an **f-string** (formatted string literal). The `f` prefix tells Python to evaluate any expression inside `{}` and interpolate the result. `f"Item number {item_id}"` with `item_id = 42` produces the string `"Item number 42"`. You saw the Python equivalent — `f'Order {id} is {status}'` — described in Sprint 2's curriculum plan. This is its first appearance in actual code.

**CS lens — path parameters as type coercion.** FastAPI performs **type coercion** — converting a value from one type to another according to declared rules. URL path segments are always strings (HTTP is a text protocol). By annotating `item_id: int`, you declare: "convert this string to an integer before calling my function." FastAPI handles the conversion and the failure case. This is not unique to FastAPI — Django REST Framework, Spring (Java), and Express.js all have path parameter coercion, though they express it differently.

**SE lens — fail fast with a useful error.** The 422 response FastAPI returns for `/items/hello` is not an implementation choice — it is a deliberate API design principle called **failing fast**: detect and report an error at the earliest possible moment, with a message that helps the caller fix the issue. Returning `{"message": "something went wrong"}` for a type error is a service that punishes its callers. Returning `{"type": "int_parsing", "msg": "Input should be a valid integer"}` is a service that helps its callers. FastAPI's error format is the latter by default.

**Real-world connection:** Path parameters appear in every REST API: `/users/{user_id}`, `/orders/{order_id}`, `/repos/{owner}/{repo}`. GitHub's API uses exactly this format. The 422 status code (Unprocessable Entity) is the HTTP standard for "the request was syntactically valid but semantically wrong" — FastAPI uses it correctly.

**What breaks without this:** If you define two routes with the same path — `@app.get("/items/{item_id}")` and `@app.get("/items/{product_id}")` — FastAPI registers both but only the first one ever matches (routing is first-match). The second route is unreachable. This is a silent bug: no error, just a route that never fires.

---

### 7. Understand the HTTP request/response cycle

**The problem:** You have been hitting routes in the browser and seeing JSON. You need to understand the HTTP protocol — what actually travels between the browser and the server, because every concept in the next lesson (CORS, headers, status codes) is part of this exchange.

An HTTP interaction is a **request/response pair**. The client (browser) sends a request; the server sends a response.

**The request** contains:
- A **method** — `GET`, `POST`, `PUT`, `DELETE`. `GET` means "give me data." `POST` means "create something." The method tells the server what kind of action is requested.
- A **path** — `/items/42`. Combined with the method, this identifies what resource and what action.
- **Headers** — key-value metadata. The browser sends headers like `User-Agent` (identifying the browser), `Accept` (what response formats the browser understands), and `Host` (the domain being requested).
- A **body** — present on `POST`, `PUT`, and `PATCH` requests. Contains the data being sent. `GET` requests have no body.

**The response** contains:
- A **status code** — a 3-digit number. `200` means OK. `201` means Created. `404` means Not Found. `422` means Unprocessable Entity. `500` means Internal Server Error. Status codes are a standard vocabulary: any HTTP client knows what `404` means without reading the body.
- **Headers** — metadata about the response. FastAPI sets `Content-Type: application/json` automatically when you return a dict.
- A **body** — the content. For your routes, this is a JSON string.

**How to see this in the browser:** Open `http://localhost:8000/items/42`. Press `F12` (or `Cmd+Option+I` on Mac) to open DevTools. Click the **Network** tab. Reload the page. You will see the request appear. Click it. You will see:
- **Headers** tab: the request headers your browser sent and the response headers FastAPI returned
- **Response** tab: the JSON body
- **Status**: `200`

The Network tab is the single most important debugging tool for understanding what is happening between the browser and the server. You will use it constantly from Lesson 4 onward.

**CS lens — HTTP as a stateless protocol.** HTTP is **stateless**: each request is completely independent. The server does not remember that you made a request one second ago. Every request must carry all the information the server needs to respond. This is why authentication tokens are sent with every request (Sprint 4) — the server cannot remember that you logged in on a previous request because there is no memory of previous requests. Statefulness is built on top of stateless HTTP using tokens, sessions, and cookies.

**SE lens — status codes as a contract.** HTTP status codes are a standard contract between servers and clients. A client that receives `404` knows the resource does not exist — it does not need to parse the body to find out. A monitoring system can detect that a service is broken by watching for `500` responses without reading any response content. This is why returning `200 OK` with `{"error": "not found"}` in the body is considered bad practice: it breaks the contract. Clients and monitors expecting `404` will not recognise the error. FastAPI returns the correct status codes by default.

**What breaks without this:** If a route throws an unhandled exception, FastAPI returns `500 Internal Server Error`. The response body contains `{"detail": "Internal Server Error"}`. The exception's traceback appears in the uvicorn terminal output — which is where you look to debug it. The browser sees only the 500; the terminal shows the cause.

---

## Connect the pieces

Your project now has two servers:
- `frontend/`: React app, served by Vite on port 5173, written in TypeScript
- `backend/main.py`: FastAPI app, served by uvicorn on port 8000, written in Python

These are entirely separate processes. They do not share memory. They communicate over HTTP. In Lesson 4, the React app will make a `fetch()` call from the browser to `localhost:8000`. The browser will send an HTTP GET request to uvicorn; uvicorn will call your FastAPI route handler; FastAPI will return JSON; the browser will parse the JSON and React will render it.

The path parameter concept (`{item_id}`) and the validation behaviour (422 on wrong type) will appear in every Sprint 2 and Sprint 3 endpoint. The decorator pattern (`@app.get`) will be your primary tool for adding new routes throughout the curriculum.

---

## What breaks without this

**`ModuleNotFoundError: No module named 'fastapi'` when uvicorn starts:** The virtual environment is not activated. Check for `(venv)` in your prompt and run `source ../venv/bin/activate`.

**Port 8000 already in use:**
```
ERROR:    [Errno 48] Address already in use
```
Another program (possibly a previous uvicorn process) is listening on port 8000. Find and stop it: `lsof -ti:8000 | xargs kill` on macOS/Linux. Or use a different port: `uvicorn main:app --reload --port 8001` and open `localhost:8001`.

**`uvicorn main:app` not found:** The virtual environment is not activated, so uvicorn's executable is not on PATH. Activate the environment.

---

## Definition of done

- [ ] `uvicorn main:app --reload` starts without errors
- [ ] `http://localhost:8000` returns `{"message":"FastAPI is running"}` in the browser
- [ ] `http://localhost:8000/items/42` returns `{"item_id":42,"name":"Item number 42"}`
- [ ] `http://localhost:8000/items/hello` returns a 422 error
- [ ] `http://localhost:8000/docs` shows the interactive documentation with both routes listed
- [ ] You inspected the request/response for `/items/42` in the browser Network tab
- [ ] You can explain what `@app.get("/")` does without using the word "magic"
- [ ] You can explain the difference between uvicorn and FastAPI
- [ ] You can explain what ASGI is in one sentence
- [ ] `requirements.txt` exists in `backend/` and contains `fastapi` and `uvicorn`

**Git commit** (from `fullstack-project/`):

```
git add backend
git commit -m "Add FastAPI backend scaffold: single route returning JSON, path parameter with type validation"
```
