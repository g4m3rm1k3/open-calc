

<style>
* { box-sizing: border-box; }
h2.sr-only { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0); }
.nav { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px; }
.nav-btn { font-size:12px; padding:5px 12px; border-radius:20px; cursor:pointer; border:0.5px solid var(--color-border-secondary); background:transparent; color:var(--color-text-secondary); transition:all .15s; }
.nav-btn.active { background:var(--color-background-primary); color:var(--color-text-primary); border-color:var(--color-border-primary); font-weight:500; }
.module { margin-bottom:10px; border:0.5px solid var(--color-border-tertiary); border-radius:var(--border-radius-lg); overflow:hidden; }
.mod-header { display:flex; align-items:center; gap:10px; padding:12px 16px; cursor:pointer; background:var(--color-background-primary); }
.mod-header:hover { background:var(--color-background-secondary); }
.mod-badge { font-size:11px; font-weight:500; padding:3px 8px; border-radius:20px; flex-shrink:0; }
.mod-title { font-size:14px; font-weight:500; flex:1; }
.mod-meta { font-size:12px; color:var(--color-text-tertiary); }
.mod-body { display:none; border-top:0.5px solid var(--color-border-tertiary); }
.mod-body.open { display:block; }
.lesson { padding:12px 16px; border-bottom:0.5px solid var(--color-border-tertiary); background:var(--color-background-secondary); }
.lesson:last-child { border-bottom:none; }
.lesson-title { font-size:13px; font-weight:500; margin-bottom:8px; color:var(--color-text-primary); }
.section-label { font-size:11px; font-weight:500; color:var(--color-text-tertiary); text-transform:uppercase; letter-spacing:.04em; margin:8px 0 4px; }
.concept-row { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px; }
.pill { font-size:11px; padding:2px 8px; border-radius:20px; font-family:var(--font-mono); }
.pill.concept { background:var(--color-background-primary); color:var(--color-text-secondary); border:0.5px solid var(--color-border-secondary); }
.pill.taught { background:var(--color-background-info); color:var(--color-text-info); }
.pill.exercise { background:var(--color-background-success); color:var(--color-text-success); }
.contract { font-size:12px; color:var(--color-text-secondary); line-height:1.6; margin-top:6px; padding:8px 10px; border-left:2px solid var(--color-border-secondary); border-radius:0; background:var(--color-background-primary); }
.ask-btn { margin-top:8px; font-size:12px; cursor:pointer; color:var(--color-text-info); background:none; border:0.5px solid var(--color-border-info); border-radius:var(--border-radius-md); padding:4px 10px; }
.ask-btn:hover { background:var(--color-background-info); }
.capstone-banner { margin:8px 16px 12px; padding:10px 14px; border-radius:var(--border-radius-md); background:var(--color-background-warning); border:0.5px solid var(--color-border-warning); font-size:12px; color:var(--color-text-warning); }
</style>

<h2 class="sr-only">Interactive curriculum map: full-stack development course with 7 modules and explicit lesson contracts</h2>

<div class="nav" id="nav"></div>
<div id="modules-container"></div>

<script>
const curriculum = [
  {
    id: "m1",
    color: { badge: "#EEEDFE", text: "#534AB7", border: "#534AB7" },
    label: "Module 1",
    title: "How the web works",
    lessons: 4,
    capstone: "Draw and explain the full journey of a URL from typing to pixels, without notes",
    items: [
      {
        title: "L1 — The internet: wires, packets, addresses",
        concepts: ["IP address","DNS","packet","router","TCP/IP","port"],
        taught: ["What an IP address is and why every device needs one","What DNS does (phone book analogy, then exact mechanics)","How data gets split into packets and reassembled","What a port number means (80, 443, 3000, 8000)"],
        exercise: "Use your terminal: ping google.com, traceroute google.com. Explain every line of output.",
        contract: "You will know why two computers on opposite sides of the world can find each other and exchange data reliably."
      },
      {
        title: "L2 — HTTP: the language of the web",
        concepts: ["HTTP","HTTPS","request","response","method","status code","header","body"],
        taught: ["What HTTP is and why it exists","Every part of an HTTP request: method (GET/POST/PUT/DELETE), URL, headers, body","Every part of an HTTP response: status code, headers, body","What HTTPS adds (TLS handshake in plain English)","Status codes you must know: 200, 201, 400, 401, 403, 404, 422, 500"],
        exercise: "Use curl to make a real GET and POST request. Read the raw response. Identify every field.",
        contract: "You will be able to read and write raw HTTP without a browser or framework."
      },
      {
        title: "L3 — Browsers, servers, and the client-server model",
        concepts: ["client","server","browser","rendering","DOM","static vs dynamic","frontend","backend"],
        taught: ["What a server is (just a computer running a program that listens)","What a client is","What the browser does after it gets HTML (parse, build DOM, render)","The difference between static files and dynamic responses","Why frontend and backend are separate concerns"],
        exercise: "Open DevTools → Network tab. Load a page. Find the HTML request, a JS file, a CSS file, an image. Explain what each one is.",
        contract: "You will understand what is happening every time a web page loads — no magic."
      },
      {
        title: "L4 — APIs and JSON",
        concepts: ["API","REST","JSON","endpoint","resource","serialization","parsing"],
        taught: ["What an API is (a contract between programs)","What REST means as an architectural style — not a law, a convention","JSON syntax completely: objects, arrays, strings, numbers, booleans, null","What serialization means (data → text) and deserialization (text → data)","How a URL maps to a resource: /users, /users/42, /users/42/orders"],
        exercise: "Hit a public API (e.g. api.github.com/users/torvalds) with curl. Parse the JSON response manually. Pull out 3 specific fields.",
        contract: "You will be able to consume any JSON API and understand its structure without documentation."
      }
    ]
  },
  {
    id: "m2",
    color: { badge: "#EAF3DE", text: "#3B6D11", border: "#3B6D11" },
    label: "Module 2",
    title: "Python for backend development",
    lessons: 5,
    capstone: "Build a CLI tool that reads a JSON file of work orders and lets you filter, add, and delete entries",
    items: [
      {
        title: "L1 — Python from scratch (CS lens)",
        concepts: ["type system","str int float bool","list dict set tuple","None","f-string","type()","isinstance()"],
        taught: ["Python's type system vs what you know from CS theory","Every built-in type and when to use each one","Why Python uses indentation (it's syntax, not style)","f-strings: every interpolation form","None vs null vs undefined — what Python's None actually is"],
        exercise: "Write a Python script that models a work order as a dict. Print every field formatted with f-strings.",
        contract: "You will know Python's type system completely, with no assumed knowledge."
      },
      {
        title: "L2 — Functions, scope, and modules",
        concepts: ["def","return","args","kwargs","*args","**kwargs","scope","import","module","package","__init__.py"],
        taught: ["Function definition and call mechanics step by step","Positional vs keyword arguments — how Python resolves them","*args and **kwargs — what the * operator does to iterables","Scope: local, enclosing, global, built-in (LEGB rule)","How import works: what Python actually does when you write import","What a module is (a .py file), what a package is (a folder with __init__.py)"],
        exercise: "Split your work order CLI into 3 files: models.py, storage.py, main.py. Import between them.",
        contract: "You will understand how Python finds code across files and how function arguments truly work."
      },
      {
        title: "L3 — Classes and objects",
        concepts: ["class","__init__","self","instance","method","inheritance","__repr__","__str__","dataclass","@property"],
        taught: ["What a class is and what it compiles to in memory","self — why it exists, what it refers to, why Python makes it explicit","__init__ — constructor mechanics","The difference between instance methods, class methods, and static methods","__repr__ and __str__ — what they're for and when each is called","dataclass decorator — what it generates and why it saves boilerplate","@property — how Python turns method calls into attribute access"],
        exercise: "Model a WorkOrder as a dataclass with validation in __post_init__. Write __repr__.",
        contract: "You will understand OOP in Python with no hand-waving about 'self' or 'magic methods'."
      },
      {
        title: "L4 — Error handling and file I/O",
        concepts: ["try","except","raise","Exception","finally","with","open()","json.load","json.dump","pathlib"],
        taught: ["Python's exception hierarchy — what inherits from what","try/except/else/finally — what each block runs and when","How to raise your own exceptions with custom messages","The with statement — what context managers are and what __enter__/__exit__ do","File I/O completely: open modes (r, w, a, rb, wb), encoding","json.load vs json.loads, json.dump vs json.dumps — the s means string","pathlib.Path — why it beats string concatenation for file paths"],
        exercise: "Add persistent JSON storage to your CLI. Handle: file not found, corrupted JSON, missing fields.",
        contract: "You will never write bare except: or leave file handles open."
      },
      {
        title: "L5 — Async Python",
        concepts: ["async","await","coroutine","event loop","asyncio","concurrent vs parallel","I/O-bound"],
        taught: ["The problem async solves (I/O-bound waiting, not CPU parallelism)","What a coroutine is vs a regular function","The event loop: one thread, many tasks, explicit yield points","async def and await — what the keywords do to execution flow","Why FastAPI requires async understanding","When NOT to use async (CPU-bound work)"],
        exercise: "Rewrite a function that reads 3 files sequentially to read them concurrently with asyncio.gather.",
        contract: "You will understand async as a scheduling model, not magic."
      }
    ]
  },
  {
    id: "m3",
    color: { badge: "#E1F5EE", text: "#0F6E56", border: "#0F6E56" },
    label: "Module 3",
    title: "Backend APIs with FastAPI",
    lessons: 5,
    capstone: "Build a fully working work order REST API: CRUD endpoints, validated input, structured errors, runs locally",
    items: [
      {
        title: "L1 — FastAPI fundamentals",
        concepts: ["FastAPI","uvicorn","ASGI","route","path parameter","query parameter","@app.get","@app.post","OpenAPI"],
        taught: ["What ASGI is and how it differs from WSGI","What uvicorn is and what it does when you run it","How FastAPI maps a Python function to an HTTP endpoint","Path parameters (/items/{id}) — how FastAPI extracts them","Query parameters (/items?skip=0&limit=10) — how they differ from path params","How FastAPI auto-generates /docs — what OpenAPI is"],
        exercise: "Build an API with 3 routes: GET /orders, GET /orders/{id}, POST /orders. Return hardcoded data.",
        contract: "You will understand every line of the app file — no unexplained decorators."
      },
      {
        title: "L2 — Pydantic: validation and types",
        concepts: ["BaseModel","Field","validator","ValidationError","type coercion","schema","Optional","Union"],
        taught: ["What Pydantic does (validates data against a type contract at runtime)","How to define a model with type annotations","Field() — every parameter: default, alias, min/max, description","What happens when validation fails (ValidationError, 422 response)","Optional[T] vs T | None — what they mean and when to use each","How Pydantic generates JSON schema for OpenAPI docs"],
        exercise: "Add Pydantic models for WorkOrder creation and response. Make 5 fields required, 2 optional with defaults.",
        contract: "You will understand validation as a contract, not a filter."
      },
      {
        title: "L3 — Dependency injection and project structure",
        concepts: ["Depends","dependency injection","lifespan","router","APIRouter","separation of concerns"],
        taught: ["What dependency injection is (passing dependencies in, not creating them inside)","FastAPI's Depends() — how it resolves the dependency graph","Why DI makes testing easy (swap real DB for fake in tests)","APIRouter — how to split routes across files","Lifespan events (startup/shutdown) — replacing deprecated on_event","A scalable folder structure: routers/, models/, services/, db/"],
        exercise: "Refactor your API into routers/orders.py and services/order_service.py. Inject the service.",
        contract: "You will structure code so business logic never touches HTTP details."
      },
      {
        title: "L4 — Request/response lifecycle and middleware",
        concepts: ["middleware","request object","response object","headers","CORS","logging","HTTPException"],
        taught: ["The full lifecycle of a request through FastAPI: receive → middleware → route → response","What middleware is and when to use it vs a dependency","CORS — why it exists, what the browser enforces, how to configure it","HTTPException — status codes, detail messages, custom headers","How to add request logging middleware that logs every request/response","How to return custom error shapes consistently"],
        exercise: "Add CORS, a logging middleware, and structured error responses. Test from a browser fetch() call.",
        contract: "You will know what happens to every request before and after your route function runs."
      },
      {
        title: "L5 — Background tasks and file uploads",
        concepts: ["BackgroundTasks","UploadFile","File","form data","multipart","task queue basics"],
        taught: ["BackgroundTasks — what runs after the response is sent and why","UploadFile — how multipart form data works at the HTTP level","How to save uploaded files safely (naming, path traversal risk)","When background tasks are enough vs when you need a real queue (Celery)"],
        exercise: "Add an endpoint that accepts a CSV upload and processes rows as a background task.",
        contract: "You will know the limits of in-process background work."
      }
    ]
  },
  {
    id: "m4",
    color: { badge: "#E6F1FB", text: "#185FA5", border: "#185FA5" },
    label: "Module 4",
    title: "Databases with PostgreSQL",
    lessons: 5,
    capstone: "Replace your in-memory API storage with a real Postgres database. All CRUD operations persist across restarts.",
    items: [
      {
        title: "L1 — Relational databases from first principles",
        concepts: ["table","row","column","primary key","foreign key","relation","schema","normalization","NULL"],
        taught: ["What a relational database is and why the relational model exists","Tables, rows, columns — as precise data structures, not spreadsheets","Primary keys — what makes a good PK (UUID vs serial vs natural key)","Foreign keys — how they enforce referential integrity at the DB level","NULL — what it means (unknown, not empty), why it complicates logic","1NF, 2NF, 3NF — normalization explained with real examples, not theory"],
        exercise: "Design a schema on paper: Equipment → WorkOrders → Parts. Identify every FK and justify every PK choice.",
        contract: "You will understand why data is structured this way before touching any code."
      },
      {
        title: "L2 — SQL completely",
        concepts: ["SELECT","FROM","WHERE","JOIN","LEFT JOIN","GROUP BY","ORDER BY","INSERT","UPDATE","DELETE","RETURNING","subquery","index","EXPLAIN"],
        taught: ["SELECT — every clause in execution order (not written order)","WHERE — operators, LIKE, IN, IS NULL, BETWEEN","JOIN types: INNER, LEFT, RIGHT, FULL — with Venn diagram logic","Aggregates: COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING","INSERT / UPDATE / DELETE / RETURNING — how RETURNING differs from a SELECT","Subqueries — correlated vs uncorrelated","What an index is physically (B-tree), when to add one, when not to","EXPLAIN ANALYZE — reading a query plan"],
        exercise: "Write 10 queries against your schema: joins, filters, aggregates, one subquery. Run EXPLAIN on the slowest.",
        contract: "You will write SQL fluently before ever touching an ORM."
      },
      {
        title: "L3 — SQLAlchemy and Alembic",
        concepts: ["ORM","Session","engine","declarative base","relationship","lazy vs eager loading","migration","Alembic","connection pool"],
        taught: ["What an ORM does and what it costs (the N+1 problem, hidden queries)","SQLAlchemy Core vs ORM — when to use each","Defining models with declarative_base — how they map to tables","Session lifecycle: create, add, commit, rollback, close","relationship() — lazy vs eager loading and when each fires a query","What a database migration is and why you need one","Alembic: autogenerate, upgrade, downgrade, version history","Connection pooling — why you can't open a new connection per request"],
        exercise: "Rewrite your API's storage layer using SQLAlchemy models and Alembic migrations.",
        contract: "You will know what SQL your ORM is generating for every operation."
      },
      {
        title: "L4 — Transactions and data integrity",
        concepts: ["transaction","ACID","commit","rollback","isolation level","deadlock","constraint","CHECK","UNIQUE"],
        taught: ["ACID properties — not as buzzwords but as guarantees with concrete examples","What a transaction is: all-or-nothing unit of work","Isolation levels: read committed, repeatable read, serializable — what each allows","What a deadlock is and how to avoid it in application code","DB constraints: NOT NULL, UNIQUE, CHECK, DEFAULT — enforced at DB level","Why constraints in the DB beat constraints only in application code"],
        exercise: "Write a transaction that transfers a work order between two technicians atomically. Simulate a failure mid-transaction.",
        contract: "You will understand why data integrity belongs at the database, not just the application layer."
      },
      {
        title: "L5 — Docker and running Postgres locally",
        concepts: ["Docker","container","image","docker-compose","volume","environment variable",".env","pg_dump"],
        taught: ["What Docker is: isolated processes with their own filesystem, not VMs","Image vs container — the class/instance analogy","docker-compose.yml — every field explained: services, ports, volumes, environment","How environment variables replace hardcoded config (12-factor app rule 3)","Volumes — why your data disappears without them","How to connect FastAPI to Postgres via DATABASE_URL","pg_dump / pg_restore for backups"],
        exercise: "Run Postgres in Docker. Connect your FastAPI app via docker-compose. Data persists after docker restart.",
        contract: "You will never say 'it works on my machine' again."
      }
    ]
  },
  {
    id: "m5",
    color: { badge: "#FAEEDA", text: "#854F0B", border: "#854F0B" },
    label: "Module 5",
    title: "Frontend with React + TypeScript",
    lessons: 6,
    capstone: "Build a work order dashboard: list, create, edit, delete — fully connected to your FastAPI backend",
    items: [
      {
        title: "L1 — TypeScript from scratch",
        concepts: ["type","interface","union","intersection","generic","type narrowing","as","satisfies","any vs unknown","strict mode"],
        taught: ["Why TypeScript exists (catch errors before runtime, document intent)","Primitive types, arrays, tuples — with inference vs explicit annotation","interface vs type alias — where they differ","Union types (A | B) and intersection types (A & B) — with real examples","Generics — what T means, how to read and write them","Type narrowing — how TypeScript tracks types through if/instanceof","Why any defeats the purpose and when unknown is the right choice","What strict mode enables and why you always want it"],
        exercise: "Type a WorkOrder interface. Write a function that accepts WorkOrder | null and handles both branches safely.",
        contract: "You will understand TypeScript's type system as a proof system, not annotation."
      },
      {
        title: "L2 — React fundamentals",
        concepts: ["component","JSX","props","state","useState","useEffect","re-render","reconciliation","key","event handler"],
        taught: ["What JSX compiles to (React.createElement calls — no magic)","Components as pure functions of props","useState — what the state variable is, what the setter does, why it triggers re-render","React's reconciliation algorithm — how it diffs the virtual DOM","Why key matters in lists (and what breaks without it)","useEffect — the dependency array, cleanup functions, and when effects run","Synthetic events — how React normalises browser events"],
        exercise: "Build a WorkOrder list component. Clicking a row expands its details. No library — just useState.",
        contract: "You will understand why React re-renders and how to control it."
      },
      {
        title: "L3 — Data fetching with TanStack Query",
        concepts: ["useQuery","useMutation","queryKey","stale time","cache","invalidation","loading state","error state","optimistic update"],
        taught: ["The problem TanStack Query solves (fetch in useEffect is broken by default)","queryKey — how TanStack uses it as a cache key","staleTime vs gcTime — what they control","useQuery — every property of the return object: data, isLoading, isError, error","useMutation — onSuccess, onError, onSettled","Cache invalidation — why and how to trigger refetches after mutations","What an optimistic update is and when to use one"],
        exercise: "Replace all your fetch() calls with useQuery and useMutation. Add loading spinners and error messages.",
        contract: "You will handle every server state transition explicitly, not accidentally."
      },
      {
        title: "L4 — Forms and validation",
        concepts: ["controlled component","uncontrolled component","React Hook Form","Zod","schema validation","register","handleSubmit","errors","FormData"],
        taught: ["Controlled vs uncontrolled inputs — what each means in the DOM","Why form state management is hard at scale","React Hook Form: register, watch, handleSubmit, formState.errors","Zod schemas — defining a schema, parsing, safeParse, error messages","Connecting Zod to RHF with zodResolver","How to share a Zod schema between frontend and backend (single source of truth)"],
        exercise: "Build a create work order form with 6 fields, Zod validation, and field-level error messages.",
        contract: "You will validate at the form boundary and the API boundary with the same schema."
      },
      {
        title: "L5 — Routing and application structure",
        concepts: ["React Router","route","loader","action","nested route","layout","Outlet","useParams","useNavigate","code splitting"],
        taught: ["What client-side routing is (the browser never navigates — JS rewrites the URL)","React Router v6: Route, Routes, Outlet — how nested routes work","useParams — extracting path parameters","useNavigate — programmatic navigation and when to use it vs Link","Layout routes — shared chrome (nav, sidebar) around nested pages","What code splitting is (lazy + Suspense) and why it matters for initial load"],
        exercise: "Add routes: /orders (list), /orders/new (form), /orders/:id (detail). Share a nav layout across all.",
        contract: "You will understand URL state as application state."
      },
      {
        title: "L6 — State management with Zustand",
        concepts: ["global state","Zustand","store","slice","selector","server state vs client state","when NOT to use global state"],
        taught: ["The difference between server state (TanStack Query) and client state (Zustand)","What global state actually is — and why most state should stay local","Zustand store: create, get, set — the full API","Selectors — why you subscribe to slices, not the whole store","When to reach for Zustand vs useState vs context","The common mistake: putting server data in a Zustand store"],
        exercise: "Add a global UI state store: selected orders (multi-select), active filters, sidebar open/closed.",
        contract: "You will know exactly where each piece of state belongs and why."
      }
    ]
  },
  {
    id: "m6",
    color: { badge: "#FAECE7", text: "#993C1D", border: "#993C1D" },
    label: "Module 6",
    title: "Auth, security, and testing",
    lessons: 4,
    capstone: "Add login to your app. Every API route is protected. Tests cover the happy path and 3 failure cases per endpoint.",
    items: [
      {
        title: "L1 — Authentication and JWT",
        concepts: ["authentication","authorization","JWT","header.payload.signature","bcrypt","hashing vs encryption","OAuth2PasswordBearer","token expiry","refresh token"],
        taught: ["Authentication (who are you?) vs authorization (what can you do?) — precisely","What hashing is vs encryption — why passwords are hashed, not encrypted","bcrypt: cost factor, salt, why the same password gives different hashes","JWT structure: header.payload.signature — base64 vs signed","How FastAPI's OAuth2PasswordBearer extracts the token from the Authorization header","Token expiry — why access tokens are short-lived","Refresh tokens — the pattern and the tradeoffs"],
        exercise: "Add /auth/register and /auth/login. Protect every /orders endpoint. Return 401 without a valid token.",
        contract: "You will implement auth from scratch once, so you understand every library that does it for you."
      },
      {
        title: "L2 — Security fundamentals (OWASP Top 10)",
        concepts: ["SQL injection","XSS","CSRF","IDOR","rate limiting","input validation","secrets management","HTTPS","CSP","parameterised query"],
        taught: ["SQL injection — the attack with a real example, then why parameterised queries prevent it","XSS — stored vs reflected, what the browser executes, how to prevent it","CSRF — how the attack works, SameSite cookies, CSRF tokens","IDOR (Insecure Direct Object Reference) — accessing /orders/42 when you own /orders/99","Rate limiting — why it matters, how to implement with slowapi","Secrets management — .env files, never commit secrets, environment-based config","Content Security Policy — what it restricts and how to set it"],
        exercise: "Find and fix 3 intentional vulnerabilities planted in your codebase (SQL injection, missing authz check, exposed secret).",
        contract: "You will recognise each vulnerability class on sight."
      },
      {
        title: "L3 — Testing Python APIs",
        concepts: ["pytest","fixture","TestClient","parametrize","mock","patch","dependency override","coverage","arrange-act-assert"],
        taught: ["The testing pyramid: unit, integration, e2e — what belongs at each level","pytest fixtures — scope (function/module/session), conftest.py","Arrange-Act-Assert pattern — every test has exactly these three parts","FastAPI TestClient — how it sends real HTTP without a running server","Dependency overrides — swapping the real DB for an in-memory fake","unittest.mock.patch — what it replaces and for how long","pytest.mark.parametrize — testing many inputs with one test function","Coverage — what it measures and what it doesn't (covered ≠ correct)"],
        exercise: "Write tests for every orders endpoint: happy path, 404, 401, 422. Use a test DB via dependency override.",
        contract: "You will write tests that prove behaviour, not tests that just run code."
      },
      {
        title: "L4 — Testing React",
        concepts: ["React Testing Library","user-event","jest","msw","screen","getByRole","findBy","act","accessibility-first queries"],
        taught: ["Why RTL's philosophy is 'test like a user, not like a developer'","screen queries — getBy vs queryBy vs findBy — when each throws or returns null","getByRole — why it's preferred and what ARIA roles exist","userEvent vs fireEvent — the difference in simulation fidelity","msw (Mock Service Worker) — intercepting fetch at the network level, not in code","What act() is and when React forces you to wrap state updates in it","What to test: behaviour not implementation (don't test that useState was called)"],
        exercise: "Write RTL tests for your WorkOrder form: successful submit, validation errors, server error.",
        contract: "You will test what the user sees and does, not how React internals work."
      }
    ]
  },
  {
    id: "m7",
    color: { badge: "#F1EFE8", text: "#5F5E5A", border: "#5F5E5A" },
    label: "Module 7",
    title: "Deployment and architecture patterns",
    lessons: 4,
    capstone: "Your complete work order app is live on a real URL, deployed via CI/CD, with logs and a health check endpoint",
    items: [
      {
        title: "L1 — CI/CD with GitHub Actions",
        concepts: ["CI","CD","pipeline","workflow","job","step","action","artifact","environment variable","secrets","branch protection"],
        taught: ["What CI is (every push runs your tests automatically)","What CD is (passing CI triggers a deploy)","GitHub Actions YAML — every field: on, jobs, steps, uses, run, env","How to run pytest and Jest in a pipeline","How to store secrets in GitHub and reference them in workflows","Branch protection rules — requiring CI to pass before merge","What a deployment artifact is"],
        exercise: "Push a change. Watch the pipeline run tests, fail on a broken test, pass when fixed, deploy.",
        contract: "You will never manually deploy code again."
      },
      {
        title: "L2 — Deploying to production",
        concepts: ["VPS","cloud provider","Nginx","reverse proxy","SSL/TLS","certbot","systemd","process manager","environment","12-factor app"],
        taught: ["What a VPS is and how it differs from your laptop","Nginx as a reverse proxy — what it does in front of uvicorn","SSL/TLS termination — why Nginx handles HTTPS, uvicorn speaks HTTP internally","certbot — how Let's Encrypt issues free certificates","Environment-based config — the 12-factor app model for config","Process management — keeping uvicorn alive after crashes","Health check endpoints — /health, what they return, why load balancers need them"],
        exercise: "Deploy your app to a VPS. It runs on HTTPS on a real domain. Survives a server restart.",
        contract: "You will understand every hop between the internet and your Python code."
      },
      {
        title: "L3 — Clean architecture patterns",
        concepts: ["repository pattern","service layer","dependency inversion","interface","separation of concerns","cohesion","coupling","SOLID"],
        taught: ["The layered architecture: Router → Service → Repository — why each exists","What the repository pattern is: an abstraction over data access","Dependency inversion — depending on an interface, not a concrete class","Why this makes testing trivial (swap the real DB repo for a fake one)","Cohesion (a module does one thing) vs coupling (modules depend on each other)","The five SOLID principles — with a real violation and fix for each one"],
        exercise: "Refactor your app to strict Repository/Service/Router layers. Write a test using a fake repo with no DB.",
        contract: "You will structure code so changing the database never touches business logic."
      },
      {
        title: "L4 — Observability: logs, metrics, errors",
        concepts: ["structured logging","log level","tracing","Sentry","Prometheus","health check","alert","correlation ID"],
        taught: ["Why print() is not logging — what a log level is (DEBUG/INFO/WARNING/ERROR/CRITICAL)","Structured logging — JSON logs vs string logs, why machines need to parse them","A correlation ID — what it is, how to thread it through a request","Sentry — what it captures, how to integrate it in 10 lines","Prometheus metrics — counters, gauges, histograms — what each measures","What to monitor: error rate, latency p50/p95/p99, saturation","Alerting basics — when to page, when to log"],
        exercise: "Add structured JSON logging to every request. Integrate Sentry. Add /metrics endpoint. Break something intentionally and find it in the logs.",
        contract: "You will know what your app is doing in production without SSH-ing into the server."
      }
    ]
  }
];

const navEl = document.getElementById('nav');
const container = document.getElementById('modules-container');
let activeFilter = 'all';

function render(filter) {
  activeFilter = filter;
  navEl.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.f === filter));
  container.innerHTML = '';
  const toShow = filter === 'all' ? curriculum : curriculum.filter(m => m.id === filter);
  toShow.forEach(mod => {
    const div = document.createElement('div');
    div.className = 'module';
    const headerHtml = `<div class="mod-header" onclick="toggleMod('body-${mod.id}')">
      <span class="mod-badge" style="background:${mod.color.badge};color:${mod.color.text}">${mod.label}</span>
      <span class="mod-title">${mod.title}</span>
      <span class="mod-meta">${mod.lessons} lessons</span>
      <i class="ti ti-chevron-down" id="chev-${mod.id}" style="font-size:15px;color:var(--color-text-tertiary);transition:transform .2s" aria-hidden="true"></i>
    </div>`;
    const capstoneHtml = `<div class="capstone-banner"><strong>Capstone exercise:</strong> ${mod.capstone}</div>`;
    const lessonsHtml = mod.items.map((item, li) => `
      <div class="lesson">
        <div class="lesson-title">${item.title}</div>
        <div class="section-label">Concepts introduced</div>
        <div class="concept-row">${item.concepts.map(c => `<span class="pill concept">${c}</span>`).join('')}</div>
        <div class="section-label">Explicitly taught — line by line</div>
        <div class="concept-row">${item.taught.map(t => `<span class="pill taught">${t}</span>`).join('')}</div>
        <div class="section-label">Exercise</div>
        <div class="contract"><i class="ti ti-terminal" style="font-size:13px;margin-right:6px" aria-hidden="true"></i>${item.exercise}</div>
        <div class="section-label">Lesson contract</div>
        <div class="contract"><i class="ti ti-file-check" style="font-size:13px;margin-right:6px" aria-hidden="true"></i>${item.contract}</div>
        <button class="ask-btn" onclick="sendPrompt('Teach me ${item.title.replace(/'/g,"\\'")} — start from the first concept and explain every line')">Start this lesson ↗</button>
      </div>`).join('');
    div.innerHTML = headerHtml + `<div class="mod-body" id="body-${mod.id}">${capstoneHtml}${lessonsHtml}</div>`;
    container.appendChild(div);
  });
}

function toggleMod(id) {
  const body = document.getElementById(id);
  const modId = id.replace('body-', '');
  const chev = document.getElementById('chev-' + modId);
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.style.transform = isOpen ? '' : 'rotate(180deg)';
}

curriculum.forEach(m => {
  const btn = document.createElement('button');
  btn.className = 'nav-btn';
  btn.textContent = m.label + ': ' + m.title;
  btn.dataset.f = m.id;
  btn.onclick = () => render(m.id);
  navEl.appendChild(btn);
});
const allBtn = document.createElement('button');
allBtn.className = 'nav-btn active';
allBtn.textContent = 'All modules';
allBtn.dataset.f = 'all';
allBtn.onclick = () => render('all');
navEl.insertBefore(allBtn, navEl.firstChild);

render('all');
</script>
