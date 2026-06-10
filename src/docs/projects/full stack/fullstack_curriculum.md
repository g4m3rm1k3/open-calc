# Full-Stack Development Curriculum
### Python · TypeScript · React · FastAPI · PostgreSQL

**Structure:** 8 sprints. Each sprint ships something real. Theory arrives when you hit the wall that needs it — not before.

**The rule:** You build first. Every concept in the "Explicitly taught" section will appear in your code. Nothing will be in your code that wasn't listed there.

---

## How to use this document

Each lesson has four parts:

- **Build first** — what you write and run before any theory is introduced
- **Explicitly taught** — every concept, every line, explained as you build
- **When theory arrives** — the exact moment a concept gets introduced (when you hit the problem it solves)
- **Lesson contract** — the one thing you can do when it's done; the bar for moving on

---

---

# Sprint 1 — Something runs on your machine

**Ships:** You have a React app and a FastAPI server running simultaneously. You can see data from the server appear in the browser.

---

## L1 — Your terminal, your file system, your tools

**Build first:** Install Node, Python, VS Code. Run your first command in each. See output.

**Concepts introduced:** `terminal` `shell` `PATH` `environment variable` `working directory` `node` `python` `pip` `npm` `venv`

**Explicitly taught — every line:**
- What the terminal actually is: a program that runs other programs
- What PATH is and why your computer needs it to find `node` or `python`
- What a virtual environment is: isolating Python packages per project so they don't collide
- `npm` vs `pip` — both are package managers, what that means exactly
- Why we use VS Code and what an extension does

**When theory arrives:** You'll hit PATH errors on first install. We explain it then, not before.

**Lesson contract:** After this lesson every tool runs and you know why each one exists.

---

## L2 — Scaffold a React app, read every file

**Build first:** Run `npm create vite@latest`. App renders in the browser at localhost:5173.

**Concepts introduced:** `Vite` `localhost` `port` `index.html` `main.tsx` `App.tsx` `JSX` `component` `hot reload` `node_modules` `package.json`

**Explicitly taught — every line:**
- What Vite does: it serves your files during development and bundles them for production
- What `localhost` means: your own computer acting as a server
- What a port is: a numbered door on a computer (5173, 3000, 8000 — just numbers)
- `index.html` — why there's only one and what `<div id="root">` is for
- `main.tsx` — the entry point, what `ReactDOM.createRoot` does line by line
- `App.tsx` — what JSX is (not HTML, it compiles to function calls)
- `node_modules` — where installed packages live, why you never edit it
- `package.json` — every field explained: name, scripts, dependencies, devDependencies

**When theory arrives:** Hot reload breaks if you save broken syntax. You'll see the error overlay — we explain it.

**Lesson contract:** You can explain every single file Vite generated. Nothing is mystery scaffolding.

---

## L3 — Scaffold a FastAPI server, read every file

**Build first:** Write `main.py` with one route. Run uvicorn. Hit it in the browser at localhost:8000.

**Concepts introduced:** `FastAPI` `uvicorn` `ASGI` `route` `decorator` `@app.get` `return value` `JSON` `localhost:8000` `/docs`

**Explicitly taught — every line:**
- What uvicorn is: a program that listens for HTTP connections and hands them to FastAPI
- What ASGI means in plain English: a standard interface between the server and your app
- The `@app.get('/')` decorator: what `@` means, what it does to the function below it
- Why returning a Python dict sends JSON — FastAPI serializes it automatically
- What `/docs` is: FastAPI generates a UI from your code automatically (OpenAPI)
- Why the server runs on port 8000 and the React app on 5173 — two separate processes

**When theory arrives:** Port already in use error. We explain processes and ports when it happens.

**Lesson contract:** You can explain every line of `main.py`. You know what uvicorn is doing.

---

## L4 — Connect them: React fetches from FastAPI

**Build first:** React calls your FastAPI endpoint. Real data from Python appears in the browser.

**Concepts introduced:** `fetch()` `Promise` `async/await` `useEffect` `useState` `CORS` `network tab` `HTTP request` `HTTP response` `JSON.parse`

**Explicitly taught — every line:**
- What `fetch()` is: a browser function that sends an HTTP request
- What a Promise is: a value that doesn't exist yet but will — `async/await` is syntax sugar over this
- `useEffect`: why you can't fetch inside the component body, what the dependency array controls
- `useState`: the two things it gives you — the current value, and a function to change it
- The CORS error you will absolutely get: why the browser blocks it, what the header fixes
- The Network tab in DevTools: reading the request URL, method, status code, response body
- What `JSON.parse` does: turns a string into a JavaScript object

**When theory arrives:** CORS error fires the moment you fetch. Perfect — we explain the browser's security model live.

**Lesson contract:** You understand every line of the fetch call. You can read the network tab and explain what you see.

---

---

# Sprint 2 — Real data: work orders in memory

**Ships:** A full CRUD API for work orders — create, read, update, delete — with real data shapes and validation. React displays the list.

---

## L1 — Python data structures and types (only what you need now)

**Build first:** Model a WorkOrder as a Python dict. Print it. Add 5 of them to a list. Filter by status.

**Concepts introduced:** `dict` `list` `str` `int` `bool` `None` `f-string` `for loop` `list comprehension` `type()`

**Explicitly taught — every line:**
- `dict`: a key-value store — not a class, not an object, just a map. Every dict operation explained
- `list`: ordered, mutable, indexed from 0. append, remove, slicing — all of it
- `None`: not zero, not empty string — it means absence of a value
- f-string: `f'Order {id} is {status}'` — the `{}` interpolation rule exactly
- List comprehension: `[x for x in items if x['status'] == 'open']` — read it left to right

**When theory arrives:** You need these to build the in-memory store in the next lesson.

**Lesson contract:** You can model any real-world object as a dict and manipulate a list of them.

---

## L2 — Pydantic models: typed data contracts

**Build first:** Define a WorkOrder Pydantic model. Try to create one with a wrong type. See it fail with a clear error.

**Concepts introduced:** `BaseModel` `field type annotation` `ValidationError` `Optional` `default value` `Field()` `schema` `int vs str coercion`

**Explicitly taught — every line:**
- What Pydantic does: validates that data matches a type contract at runtime — not just a class
- Type annotations: what `status: str` actually means at runtime (not just a hint)
- `Optional[str]` means the field can be `str` or `None` — the difference from `str` with a default
- `Field(default=..., description=...)`: every parameter and what it does
- What happens when validation fails: `ValidationError`, which fields failed, why
- Why this matters: your API will reject bad data before it ever touches your logic

**When theory arrives:** Validation errors will happen when you POST bad data in the next lesson. You'll already understand why.

**Lesson contract:** You can define any data shape with types and Pydantic will enforce it at the boundary.

---

## L3 — CRUD endpoints: every HTTP verb

**Build first:** `GET /orders`, `GET /orders/{id}`, `POST /orders`, `PUT /orders/{id}`, `DELETE /orders/{id}`. All work with in-memory list.

**Concepts introduced:** `GET` `POST` `PUT` `PATCH` `DELETE` `path parameter` `request body` `response model` `status code` `HTTPException` `idempotent`

**Explicitly taught — every line:**
- `GET`: read only, no body, safe to call multiple times
- `POST`: creates a new resource, body contains the data, returns 201
- `PUT`: replaces a resource entirely, must send all fields
- `DELETE`: removes a resource, returns 204 (no content)
- Path parameter `{id}`: FastAPI extracts it from the URL and passes it as a function argument
- Request body: how FastAPI reads the JSON body and validates it against your Pydantic model
- `HTTPException`: how to return 404 with a message when an order doesn't exist
- What idempotent means: calling PUT 10 times has the same result as calling it once

**When theory arrives:** You'll get 422 Unprocessable Entity when you send wrong data. We'll read the error body together.

**Lesson contract:** You can implement any CRUD API and explain exactly what each HTTP verb does and why.

---

## L4 — React: display a list of work orders

**Build first:** Fetch all orders from your API. Display them in a table. Click a row to see detail. Add a create form.

**Concepts introduced:** `map()` `key prop` `conditional rendering` `controlled input` `onSubmit` `fetch POST` `JSON.stringify` `Content-Type header`

**Explicitly taught — every line:**
- `map()`: transform an array into JSX elements — why you need it instead of a for loop in JSX
- `key` prop: why React needs it for list items, what breaks without it (diffing algorithm)
- Conditional rendering: `{isLoading && <Spinner />}` — the `&&` short-circuit pattern
- Controlled input: value tied to state, `onChange` updates state — why this differs from plain HTML
- Sending a POST from React: fetch with method, headers, body — every field explained
- `Content-Type: application/json` — why the server needs this header to parse your body
- `JSON.stringify`: turns a JS object into a string for the request body

**When theory arrives:** Missing Content-Type causes a 422. Missing key causes a React warning. Both happen naturally here.

**Lesson contract:** You can build any list + detail + create UI and explain every line of the fetch calls.

---

---

# Sprint 3 — Data that survives a restart: Postgres

**Ships:** Work orders stored in a real Postgres database running in Docker. App works identically — data persists after restart.

---

## L1 — Docker: run Postgres without installing it

**Build first:** Run `docker compose up`. Connect to Postgres with a GUI. Create a table manually.

**Concepts introduced:** `Docker` `container` `image` `docker-compose.yml` `volume` `port mapping` `environment variable` `psql` `TablePlus`

**Explicitly taught — every line:**
- What Docker is: a way to run a program in an isolated box with its own filesystem — not a VM
- Image vs container: image is the recipe, container is the running instance
- `docker-compose.yml` line by line: services, image, ports, volumes, environment — every key
- Port mapping `5432:5432` — left is your machine, right is inside the container
- Volume: why your data disappears without one (container filesystem is temporary)
- Environment variables for config: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — why not hardcoded

**When theory arrives:** Port conflict if Postgres is already installed. We fix it live.

**Lesson contract:** You can run any service in Docker and explain what every line of `docker-compose.yml` does.

---

## L2 — SQL: write queries against real data

**Build first:** Create the `work_orders` table. INSERT 5 rows. SELECT with filters. UPDATE one. DELETE one.

**Concepts introduced:** `CREATE TABLE` `data type` `primary key` `NOT NULL` `INSERT` `SELECT` `WHERE` `UPDATE` `DELETE` `RETURNING` `NULL`

**Explicitly taught — every line:**
- `CREATE TABLE`: column name, type, constraints — every part of the syntax
- Data types: `TEXT`, `INTEGER`, `BOOLEAN`, `TIMESTAMP`, `UUID` — what each stores
- `PRIMARY KEY`: what makes it special (unique, indexed, not null automatically)
- `NOT NULL`: enforced at the database level — not in Python, in the DB
- `WHERE` clause: `=`, `!=`, `>`, `LIKE`, `IN`, `IS NULL` — every operator you'll use
- `RETURNING`: how to get the inserted/updated row back in one query
- `NULL`: why `NULL = NULL` is false in SQL and how `IS NULL` works instead

**When theory arrives:** NULL behaviour surprises everyone. It comes up naturally when you filter.

**Lesson contract:** You can write any basic SQL query and understand what the database is actually doing.

---

## L3 — SQLAlchemy: Python talks to Postgres

**Build first:** Replace the in-memory list with SQLAlchemy. Every endpoint reads/writes the real DB.

**Concepts introduced:** `engine` `Session` `declarative_base` `Column` `relationship` `query` `commit` `rollback` `connection pool` `ORM`

**Explicitly taught — every line:**
- What an ORM does: maps Python objects to database rows — and what that costs
- `engine`: the connection to the database — the `DATABASE_URL` string explained character by character
- `Session`: a unit of work — open it, do things, commit or rollback, close it
- `declarative_base`: how SQLAlchemy knows your class is a table
- `Column(Type, primary_key, nullable, default)` — every argument
- What the ORM generates as SQL — you will see the actual queries in the logs
- Connection pool: why you can't open a new DB connection per HTTP request

**When theory arrives:** You'll see the generated SQL in logs. We read it together every time.

**Lesson contract:** You know what SQL your ORM is running for every operation. No hidden queries.

---

## L4 — Migrations: change the schema safely

**Build first:** Add a `priority` column to `work_orders` using Alembic. Old data survives. API uses the new field.

**Concepts introduced:** `migration` `Alembic` `alembic upgrade` `alembic downgrade` `versions` `autogenerate` `schema drift` `ALTER TABLE`

**Explicitly taught — every line:**
- What a migration is: a versioned, reversible change to the database schema
- Why you can't just edit the table: production databases have live data
- Alembic autogenerate: it compares your SQLAlchemy models to the real DB and writes the diff
- `upgrade()` and `downgrade()`: every migration has both — the change and its undo
- Migration version chain: how Alembic tracks which migrations have run
- `ALTER TABLE`: the SQL Alembic generates — you'll read it

**When theory arrives:** You need to add a field to your schema. Perfect timing for migrations.

**Lesson contract:** You can safely change a database schema without destroying existing data.

---

---

# Sprint 4 — Auth: users, login, protected routes

**Ships:** Users can register and log in. Every API endpoint requires a valid token. The React app stores the token and sends it with every request.

---

## L1 — Passwords: hashing and why encryption is wrong

**Build first:** Add a User model. Hash a password with bcrypt. Verify it. Store the hash, never the password.

**Concepts introduced:** `hashing` `bcrypt` `salt` `cost factor` `encryption vs hashing` `one-way function` `rainbow table` `passlib`

**Explicitly taught — every line:**
- Hashing vs encryption: hashing is one-way (you can't reverse it), encryption is two-way
- Why you hash passwords: if the DB leaks, attackers get hashes not passwords
- What bcrypt does: hashes the password with a random salt so identical passwords hash differently
- Salt: random bytes added before hashing — defeats precomputed rainbow tables
- Cost factor: how many rounds of hashing — higher = slower = harder to brute-force
- Why you never store plaintext passwords — not even for testing

**When theory arrives:** The security rationale becomes obvious when we talk about DB leaks.

**Lesson contract:** You can explain exactly why passwords are stored as hashes and what bcrypt does to them.

---

## L2 — JWT: stateless authentication

**Build first:** Issue a JWT on login. Decode it manually. Add a protected endpoint that rejects invalid tokens.

**Concepts introduced:** `JWT` `header` `payload` `signature` `base64` `HMAC` `secret key` `expiry` `Bearer token` `Authorization header` `stateless`

**Explicitly taught — every line:**
- JWT structure: three base64 parts separated by dots — `header.payload.signature`
- Header: algorithm and token type — what's in it and why
- Payload: the claims — `sub` (subject/user id), `exp` (expiry), any custom fields
- Signature: HMAC of header+payload using your secret key — what stops tampering
- Why JWT is stateless: the server doesn't store sessions, it verifies the signature
- `Authorization: Bearer <token>` — the HTTP header format, why "Bearer"
- Token expiry: why short-lived tokens matter (stolen token has a time limit)

**When theory arrives:** You'll decode a real JWT at jwt.io during this lesson.

**Lesson contract:** You can decode any JWT by hand and explain what every part does.

---

## L3 — Protected API endpoints

**Build first:** Every `/orders` endpoint returns 401 without a valid JWT. Dependency injection wires it in one place.

**Concepts introduced:** `Depends()` `dependency injection` `current_user` `401 vs 403` `OAuth2PasswordBearer` `security scheme` `token extraction`

**Explicitly taught — every line:**
- Dependency injection: passing a dependency in rather than creating it inside — why this matters for testing
- `Depends()`: FastAPI runs this function before your route, its return value is injected as an argument
- `OAuth2PasswordBearer`: FastAPI extracts the token from the Authorization header automatically
- 401 Unauthorized: you're not authenticated (no token or invalid token)
- 403 Forbidden: you're authenticated but not allowed (valid token, wrong permissions)
- Why one `Depends(get_current_user)` on every route beats copying auth logic 10 times

**When theory arrives:** You'll get 401 errors from the React app immediately — perfect moment to debug the header.

**Lesson contract:** You can protect any endpoint and explain exactly how the token flows from header to user object.

---

## L4 — React: login form, token storage, auth state

**Build first:** Login form POSTs credentials. Token stored. Every subsequent fetch sends the Authorization header. Logout clears it.

**Concepts introduced:** `localStorage` `sessionStorage` `Authorization header` `interceptor` `protected route` `redirect` `Zustand auth store` `token expiry on client`

**Explicitly taught — every line:**
- `localStorage` vs `sessionStorage`: persistence across tabs vs single tab — tradeoffs
- Why you don't store tokens in React state alone: it disappears on refresh
- Adding the Authorization header to every fetch: the pattern and why a central place beats repeating it
- Protected route: redirect to `/login` if no token — how React Router enables this
- Zustand auth store: `isAuthenticated`, `user`, `token` — the minimal shape
- What to do when the token expires: 401 response triggers logout

**When theory arrives:** Forgetting the Authorization header on one fetch gives a 401. You'll recognise it immediately.

**Lesson contract:** You can implement the full auth flow — login, token storage, protected routes, logout — from scratch.

---

---

# Sprint 5 — Testing: prove it works, on purpose

**Ships:** A test suite covering every endpoint — happy path and failure cases. Tests run in CI on every push. Broken code fails the pipeline.

---

## L1 — pytest: test your FastAPI endpoints

**Build first:** Write tests for `GET /orders`, `POST /orders`, and `GET /orders/999` (should 404). All pass against a test DB.

**Concepts introduced:** `pytest` `TestClient` `fixture` `conftest.py` `Depends override` `test database` `arrange-act-assert` `assert` `parametrize`

**Explicitly taught — every line:**
- What a test actually is: call some code, assert the output matches expectation
- Arrange-Act-Assert: every test has exactly these three parts, named
- `pytest` fixture: a function that sets up something a test needs — scope explained (function/module/session)
- `conftest.py`: fixtures defined here are available to all tests in the folder automatically
- `TestClient`: sends real HTTP requests to your app without a running server
- Dependency override: swap the real DB session for a test DB session — no prod data touched
- `parametrize`: test the same logic with 5 different inputs in one test function

**When theory arrives:** First test failure gives you a diff of expected vs actual. We read it together.

**Lesson contract:** You can write a test for any endpoint and explain every line of the test file.

---

## L2 — Testing edge cases and errors

**Build first:** Test: wrong password returns 401. Missing field returns 422. Order not found returns 404. Duplicate returns 409.

**Concepts introduced:** `status code assertions` `error response shape` `mock` `patch` `side effect` `test isolation` `what not to test`

**Explicitly taught — every line:**
- Why testing failure cases matters more than testing the happy path
- Asserting on status code AND response body — both must match
- `unittest.mock.patch`: replace a real function with a fake one for the duration of one test
- Test isolation: each test starts clean — why shared state between tests causes false passes
- What NOT to test: implementation details (which function was called) vs behaviour (what the user gets)

**When theory arrives:** A test that passes for the wrong reason is worse than no test. We'll create one deliberately.

**Lesson contract:** You can write tests that catch real bugs, not tests that just run code.

---

## L3 — React Testing Library: test what the user sees

**Build first:** Test: orders list renders. Create form submits and shows new order. Error message appears on failed submit.

**Concepts introduced:** `React Testing Library` `screen` `getByRole` `findBy` `userEvent` `msw` `render` `act` `accessibility queries`

**Explicitly taught — every line:**
- RTL's philosophy: test what the user sees and does, not how React implements it
- `screen.getByRole`: queries by ARIA role — why this is preferred over `getByTestId`
- `getBy` vs `queryBy` vs `findBy`: one throws, one returns null, one is async — when to use each
- `userEvent.click` / `userEvent.type`: simulates real browser events, more accurate than `fireEvent`
- `msw` (Mock Service Worker): intercepts fetch at the network level so your tests work like a browser
- `act()`: React requires state updates to be wrapped — when RTL does it for you vs when you must

**When theory arrives:** You'll forget to `await findBy` on async renders. The error message tells you exactly what happened.

**Lesson contract:** You can test any React component's behaviour from the user's perspective.

---

## L4 — GitHub Actions: tests run on every push

**Build first:** Push a branch. Watch the pipeline run pytest and Jest. Merge blocked until both pass.

**Concepts introduced:** `CI` `GitHub Actions` `workflow YAML` `job` `step` `on: push` `secrets` `env` `branch protection` `artifact`

**Explicitly taught — every line:**
- What CI means: every push triggers automated tests — no manual test runs
- Workflow YAML structure: `on`, `jobs`, `steps` — every field
- How to run pytest in a pipeline: set up Python, install deps, run pytest
- How to run Jest in a pipeline: set up Node, `npm ci`, `npm test`
- Secrets: store `DATABASE_URL` and `JWT_SECRET` in GitHub, reference as env vars — never hardcode
- Branch protection: require CI to pass before a PR can merge

**When theory arrives:** The pipeline will fail on your first push — missing env var. We debug it together.

**Lesson contract:** You will never manually verify that code works before merging again.

---

---

# Sprint 6 — Security: find and fix the holes

**Ships:** Your app is hardened against the most common attacks. You can identify SQL injection, XSS, IDOR, and broken auth on sight.

---

## L1 — SQL injection and input validation

**Build first:** See a SQL injection attack work against vulnerable code. Fix it with parameterised queries. Verify the attack no longer works.

**Concepts introduced:** `SQL injection` `parameterised query` `input validation` `allowlist` `denylist` `escaping` `Pydantic as defence` `OWASP`

**Explicitly taught — every line:**
- SQL injection: exactly how the attack works — the malicious string, what the DB executes
- Why string concatenation in SQL queries is always wrong
- Parameterised queries: the DB treats the input as data not code — why this is the fix
- Input validation as a second layer: Pydantic rejects inputs that don't match the schema
- Allowlist vs denylist: allow known-good inputs vs block known-bad — why allowlist wins

**When theory arrives:** We break our own app first, then fix it. Seeing the attack makes the fix obvious.

**Lesson contract:** You can identify SQL injection in code and explain exactly why the fix works.

---

## L2 — Broken auth: IDOR and missing authorisation

**Build first:** User A can access User B's orders via `/orders/42`. Add ownership checks. Verify the fix.

**Concepts introduced:** `IDOR` `authorisation vs authentication` `ownership check` `403` `row-level security` `principle of least privilege`

**Explicitly taught — every line:**
- IDOR: Insecure Direct Object Reference — you're authenticated but accessing someone else's data
- Authentication: who are you. Authorisation: what are you allowed to do — the difference
- Why checking "logged in" is not enough — you must check "owns this resource"
- Where the check lives: in the service layer, not the route
- Principle of least privilege: grant only what's needed, deny everything else by default

**When theory arrives:** Every app has this bug until you deliberately look for it.

**Lesson contract:** You will add an ownership check to every data access automatically.

---

## L3 — XSS, CORS, and HTTP security headers

**Build first:** See an XSS payload execute. Add CSP. Configure CORS correctly. Add security headers.

**Concepts introduced:** `XSS` `stored XSS` `reflected XSS` `CSP` `CORS` `SameSite` `X-Frame-Options` `HTTPS` `Helmet`

**Explicitly taught — every line:**
- XSS: your app renders user-supplied HTML and the browser executes it — the exact mechanism
- Why React protects you from most XSS by default (`dangerouslySetInnerHTML` is the exception)
- CORS: the browser enforces it, not the server — why your API needs to explicitly allow origins
- Content-Security-Policy: tells the browser which scripts are allowed to execute
- `SameSite` cookies: prevents CSRF by controlling when cookies are sent cross-origin
- HTTPS: all production traffic must be encrypted — what TLS does in one paragraph

**When theory arrives:** CORS errors fire the moment you deploy to a real domain.

**Lesson contract:** You can configure security headers and explain what attack each one prevents.

---

## L4 — Rate limiting and secrets management

**Build first:** Add rate limiting to `/auth/login`. Move all secrets to `.env`. Verify secrets never appear in git history.

**Concepts introduced:** `.env` `python-dotenv` `rate limiting` `slowapi` `brute force` `git history` `secret scanning` `environment-based config`

**Explicitly taught — every line:**
- `.env` file: key=value pairs loaded as environment variables — never committed to git
- Why environment variables beat hardcoded config: different values per environment (dev/staging/prod)
- How to scrub a secret from git history if you commit one by accident
- Rate limiting: limit `/login` to 5 attempts per minute — why this stops brute force
- Secret scanning: GitHub will warn you if you push a secret — how to enable it

**When theory arrives:** Everyone commits a secret by accident at least once. Better to learn the fix now.

**Lesson contract:** You will never hardcode a secret or leave one in your git history.

---

---

# Sprint 7 — Architecture: structure that doesn't collapse

**Ships:** Your codebase is refactored into Router / Service / Repository layers. Adding a new feature touches exactly one layer.

---

## L1 — Why your current code will hurt you

**Build first:** Identify every place business logic is in a route function. List what breaks if you swap Postgres for SQLite.

**Concepts introduced:** `coupling` `cohesion` `separation of concerns` `spaghetti code` `testability` `changeability`

**Explicitly taught — every line:**
- Coupling: when changing one thing forces you to change another — measured by pain
- Cohesion: a module does one thing — how to tell if yours does
- Why business logic in route functions makes testing require HTTP
- The real cost: you can't swap the database without touching business logic
- This lesson produces no new code — just a diagnosis. That is the lesson.

**When theory arrives:** This is the moment where the pain you've already felt gets a name.

**Lesson contract:** You can identify coupling in any codebase and explain what it costs.

---

## L2 — Repository pattern: isolate data access

**Build first:** Extract all DB queries into a `WorkOrderRepository` class. Routes never import SQLAlchemy.

**Concepts introduced:** `repository pattern` `interface` `abstract class` `data access layer` `swap test` `ABC` `Protocol`

**Explicitly taught — every line:**
- Repository pattern: a class whose only job is reading and writing one resource to storage
- Why routes must never import SQLAlchemy: the route layer shouldn't know storage exists
- Python `Protocol`: define what a repository must do without inheriting from it
- The swap test: can you replace Postgres with an in-memory dict in 10 lines? Now you can.
- Abstract base class vs Protocol: when to use each

**When theory arrives:** Writing a fake repository for tests is now trivial. You'll see why immediately.

**Lesson contract:** You can swap the database backend without touching any business logic.

---

## L3 — Service layer: isolate business logic

**Build first:** Extract all business logic into `WorkOrderService`. Repository injected in. Routes call service only.

**Concepts introduced:** `service layer` `dependency injection` `business rule` `use case` `pure function` `side effect` `orchestration`

**Explicitly taught — every line:**
- Service layer: where business rules live — not routes, not repositories
- What a business rule is vs a data access operation vs an HTTP concern
- Dependency injection: the service receives a repository, it doesn't create one
- Why this makes unit testing trivial: pass a fake repository, test the logic in pure Python
- Side effects: DB writes, emails, external calls — keep them in the service, not scattered

**When theory arrives:** You can now test business logic without a database or HTTP server.

**Lesson contract:** You can add a business rule to your app and test it in pure Python with no infrastructure.

---

## L4 — SOLID in practice

**Build first:** Find one violation of each SOLID principle in your codebase. Fix it. Write a test that would have caught it.

**Concepts introduced:** `SRP` `OCP` `LSP` `DIP` `ISP` `SOLID` `refactoring` `code smell`

**Explicitly taught — every line:**
- Single Responsibility: a class has one reason to change — find the class with five
- Open/Closed: open for extension, closed for modification — add features without editing existing code
- Liskov Substitution: a subclass must behave like its parent — what breaks when it doesn't
- Interface Segregation: don't force a class to implement methods it doesn't need
- Dependency Inversion: depend on abstractions, not concretes — you've already done this with Repository
- Each principle shown as: here's the violation, here's the cost, here's the fix

**When theory arrives:** These aren't rules to memorise — they're names for pain you've already felt.

**Lesson contract:** You can identify a SOLID violation, name it, and fix it.

---

---

# Sprint 8 — Ship it: deploy, observe, maintain

**Ships:** Your app is live on a real HTTPS URL. CI/CD deploys on every merge. Logs tell you what's happening without SSH.

---

## L1 — Containerise the whole app

**Build first:** Write a Dockerfile for FastAPI and one for React. `docker-compose` runs the entire stack: React + FastAPI + Postgres.

**Concepts introduced:** `Dockerfile` `FROM` `RUN` `COPY` `CMD` `EXPOSE` `multi-stage build` `docker-compose` `depends_on` `health check`

**Explicitly taught — every line:**
- Dockerfile instruction by instruction: `FROM` (base image), `RUN` (execute command), `COPY` (add files), `CMD` (start command)
- Layer caching: why `COPY requirements.txt` before `COPY .` saves rebuild time
- Multi-stage build: build React in Node, serve the static files from Nginx — why this shrinks the image
- `docker-compose depends_on`: FastAPI waits for Postgres to be healthy before starting
- Health check: how Docker knows a container is ready, not just running

**When theory arrives:** The app that runs in Docker is identical to what will run in production.

**Lesson contract:** You can containerise any app and explain every line of the Dockerfile.

---

## L2 — Deploy to a real server

**Build first:** App runs on a VPS behind Nginx on HTTPS. Survives a reboot. Zero-downtime deploy from CI.

**Concepts introduced:** `VPS` `Nginx` `reverse proxy` `SSL/TLS` `certbot` `Let's Encrypt` `systemd` `process manager` `zero-downtime`

**Explicitly taught — every line:**
- VPS: a Linux computer you rent — what you get, what you manage
- Nginx as reverse proxy: accepts HTTPS, terminates TLS, forwards plain HTTP to your app — why this split
- Certbot: automates Let's Encrypt certificate issuance and renewal — every command explained
- Why uvicorn speaks HTTP not HTTPS: TLS termination belongs at the proxy layer
- `systemd` service: keeps your app running after crashes and reboots
- Zero-downtime deploy: pull new image, start new container, stop old one — the sequence

**When theory arrives:** Real HTTPS on your real domain. This is the moment it stops being local.

**Lesson contract:** You can deploy any app to a VPS and explain every hop from the internet to your Python process.

---

## L3 — Structured logging and error tracking

**Build first:** Every request logs a JSON line. Errors go to Sentry. You find a bug in production without SSH.

**Concepts introduced:** `structured logging` `log level` `JSON logs` `correlation ID` `Sentry` `stack trace` `breadcrumb` `alert`

**Explicitly taught — every line:**
- Why `print()` is not logging: no level, no timestamp, no structure, no routing
- Log levels: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL` — when to use each
- Structured logging: JSON lines that machines can query — every field chosen deliberately
- Correlation ID: a UUID attached to every request so you can trace one user's journey through logs
- Sentry: catches unhandled exceptions, captures context, sends alerts — integration in 5 lines
- How to find a production bug: Sentry alert → stack trace → correlation ID → logs → root cause

**When theory arrives:** A real error will occur in production. Sentry will catch it. We'll debug it together.

**Lesson contract:** You will know what your app is doing in production without touching the server.

---

## L4 — What's next: the map beyond this course

**Build first:** No new code. A map of what exists beyond this course and exactly when you'll need each piece.

**Concepts introduced:** `message queues` `Celery` `Redis` `WebSockets` `GraphQL` `microservices` `Kubernetes` `caching` `CDN` `observability`

**Explicitly taught — every line:**
- Celery + Redis: background jobs and task queues — when you need them (report generation, emails, long-running work)
- WebSockets: real-time bidirectional communication — when REST isn't enough (live dashboards, chat)
- GraphQL: client-specified queries — when it beats REST (many clients with different data needs)
- Microservices: splitting one app into many — the cost, the benefit, and why you shouldn't start here
- Kubernetes: orchestrating many containers — when docker-compose isn't enough
- The rule: add complexity only when you have the specific pain it solves

**When theory arrives:** This lesson is a map, not a syllabus. You choose what to learn next based on what you need.

**Lesson contract:** You know what every advanced topic is for and exactly when to reach for it.

---

---

## Quick reference: the full stack

| Layer | Technology | Why this one |
|---|---|---|
| Frontend framework | React + TypeScript | Industry standard, typed, component model |
| Frontend state (server) | TanStack Query | Handles loading/error/cache automatically |
| Frontend state (client) | Zustand | Simple, no boilerplate |
| Frontend forms | React Hook Form + Zod | Validation shared with backend |
| Frontend routing | React Router v6 | Standard, nested routes |
| Frontend build | Vite | Fast dev server, modern defaults |
| Backend framework | FastAPI | Async, typed, auto-docs, modern Python |
| Backend server | uvicorn | ASGI server, production-ready |
| Backend validation | Pydantic v2 | Types enforced at runtime |
| Database | PostgreSQL | Relational, robust, industry standard |
| ORM | SQLAlchemy 2.0 | Explicit, powerful, you see the SQL |
| Migrations | Alembic | Versioned, reversible schema changes |
| Auth | JWT + bcrypt | Stateless, standard, auditable |
| Testing (backend) | pytest + httpx | Clean, fixture-based, fast |
| Testing (frontend) | RTL + msw + Jest | Behaviour-first, no implementation details |
| CI/CD | GitHub Actions | Free, integrated, YAML-based |
| Containers | Docker + docker-compose | Reproducible environments everywhere |
| Deployment | VPS + Nginx + certbot | You own it, you understand it |
| Error tracking | Sentry | Catches what logs miss |

---

*Start at Sprint 1, Lesson 1. Build first. Ask why when something breaks.*
