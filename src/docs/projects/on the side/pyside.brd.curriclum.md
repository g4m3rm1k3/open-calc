# Python Application Development Masterclass

### The overall journey

```text
                    PYTHON
                       │
                       ▼
              Application Design
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
       PySide6                     SQL
          │                         │
          └────────────┬────────────┘
                       ▼
                 Desktop App
                       │
                       ▼
                 HTTP / APIs
                       │
                       ▼
                   FastAPI
                       │
                       ▼
                Backend App
                       │
                       ▼
              Full Integration
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        Async       Testing     Deployment
```

The recurring application is the **Asset Manager**, but it evolves.

We don't force every lesson to modify it.

---

# Pedagogical Rules

These remain from the original curriculum.

### Rule 1 — One primary concept per lesson

A lesson can use five concepts, but **only one should be new**.

For example:

> Learn `QAbstractTableModel`.

The lesson may use dataclasses and lists, but those aren't being taught simultaneously.

---

### Rule 2 — Three lesson types

**Core**

> Something that survives into the project.

**Support**

> Useful professional knowledge, but doesn't necessarily become production code.

**Lab**

> A deliberately disposable experiment.

Throwing code away is a feature, not failure.

---

### Rule 3 — Components before integration

We learn:

```text
Python object
    ↓
experiment
    ↓
UI experiment
    ↓
database experiment
    ↓
integration
```

rather than:

```text
"Let's build the whole thing and see what happens."
```

---

### Rule 4 — No framework encyclopedias

We learn the **20% of a technology that gives us 80% of its value**.

When something isn't needed:

> "That's an on-demand topic."

---

### Rule 5 — Every series ends with a real application capability

We don't study indefinitely.

---

# SERIES 1 — Python Application Foundations

### Goal

Build the Python foundation necessary for everything that follows.

### Project

**Asset Manager Domain**

No GUI.
No database.

Pure Python.

---

## 1.1 — Classes and Objects

**Core**

Learn:

* classes
* instances
* `__init__`
* instance attributes
* methods

Create the first `Asset`.

**Survives:** `Asset`.

---

## 1.2 — Object State

**Core**

Learn:

* changing object state
* methods that modify state
* invariants

Add:

```python
asset.mark_retired()
```

**Survives:** domain behavior.

---

## 1.3 — Instance vs Class Attributes

**Lab**

Demonstrate shared class state and the mutable-class-attribute trap.

**Throw away:** everything.

---

## 1.4 — Composition

**Core**

Learn HAS-A relationships.

Create:

```text
Asset
 └── Owner
```

**Survives:** potentially.

---

## 1.5 — Inheritance

**Support**

Learn:

* subclassing
* overriding
* `super()`

Build a deliberately simple example.

**Throw away:** example.

The point is understanding inheritance—not forcing inheritance into the Asset Manager.

---

## 1.6 — Type Hints

**Core**

Learn:

* annotations
* `list[Asset]`
* `Optional`
* unions
* return types

Apply them to the project.

**Survives:** yes.

---

## 1.7 — Dataclasses

**Core**

Convert appropriate domain objects to `@dataclass`.

Learn:

* generated `__init__`
* `repr`
* equality

**Survives:** yes.

---

## 1.8 — Dataclass Defaults

**Lab**

Learn:

```python
field(default_factory=list)
```

and why:

```python
items=[]
```

is dangerous.

**Throw away:** experiment.

---

## 1.9 — Dataclass Validation

**Core**

Learn `__post_init__`.

Validate:

* asset name
* serial number
* category

**Survives:** domain validation.

---

## 1.10 — Properties

**Core**

Learn `@property`.

Add calculated properties such as:

```python
asset.display_name
asset.is_retired
```

**Survives:** selected properties.

---

## 1.11 — Exceptions

**Core**

Learn:

* `try`
* `except`
* `else`
* `finally`
* custom exceptions

Create domain exceptions.

**Survives:** yes.

---

## 1.12 — Functions as Objects

**Support**

Learn callbacks.

```python
def notify(asset):
    ...
```

Pass functions around.

**Throw away:** experiment.

This prepares you for Qt.

---

## 1.13 — Lambda

**Lab**

Understand:

```python
lambda x: x.name
```

and when it is useful.

**Throw away.**

---

## 1.14 — Context Managers

**Support**

Learn `with`.

Use a file as the example.

Later this transfers directly to database/resource handling.

**Throw away:** initial example.

---

## 1.15 — Modules and Packages

**Core**

Move from:

```text
asset.py
```

toward:

```text
asset_manager/
    domain/
```

**Survives.**

---

## 1.16 — Testing Pure Python

**Core**

Introduce `pytest`.

Test:

* Asset creation
* validation
* state changes
* exceptions

**Survives:** tests.

---

### Series 1 outcome

You have a tested domain:

```text
Asset Manager
└── domain
    ├── asset
    ├── owner
    └── exceptions
```

No Qt.

No SQL.

And that's intentional.

---

# SERIES 2 — PySide6: Desktop Application Development

### Goal

Learn the transferable concepts behind GUI development.

### Project

Turn the Asset Manager into a desktop application.

We deliberately **do not introduce the database yet.**

---

## 2.1 — QApplication and QMainWindow

**Core**

Learn:

* `QApplication`
* `QMainWindow`
* application startup

Create the first window.

**Survives.**

---

## 2.2 — The Event Loop

**Core**

Understand:

```text
main()
 ↓
event loop
 ↓
user interaction
 ↓
callback
 ↓
event loop
```

**Survives conceptually.**

---

## 2.3 — QObject and Parent/Child

**Support**

Understand Qt ownership and object lifetime.

**Throwaway experiment.**

---

## 2.4 — QLabel

**Lab**

Simple display widget.

**Throw away.**

---

## 2.5 — QPushButton

**Core**

Add:

> Add Asset

button.

**Survives.**

---

## 2.6 — QLineEdit

**Core**

Create asset search input.

**Survives.**

---

## 2.7 — QComboBox

**Core**

Asset category selector.

**Survives.**

---

## 2.8 — Layouts

**Core**

Learn:

* `QVBoxLayout`
* `QHBoxLayout`

Build the main application layout.

**Survives.**

---

## 2.9 — Form Layout

**Core**

Learn `QFormLayout`.

Build the Asset editor.

**Survives.**

---

## 2.10 — Grid Layout

**Lab**

Build a small settings screen.

**Throw away.**

You know it exists; you don't need mastery.

---

## 2.11 — Signals and Slots

**Core**

This is one of the major Qt lessons.

Learn:

```text
signal → slot
```

Connect buttons to application behavior.

**Survives.**

---

## 2.12 — Arguments in Signals

**Core**

Learn signals carrying values.

**Survives.**

---

## 2.13 — Lambda Callbacks

**Lab**

Use lambdas in Qt.

Understand the technique without turning the entire application into lambda soup.

**Throw away.**

---

## 2.14 — Custom Signals

**Support**

Create your own signals.

Understand communication between widgets.

**Selected patterns survive.**

---

## 2.15 — Input Validation

**Core**

Learn:

* validators
* UI-level validation
* domain-level validation

Important distinction:

```text
UI validation
     ≠
business validation
```

**Survives.**

---

## 2.16 — Dialogs

**Core**

Learn:

* `QMessageBox`
* `QDialog`

Build Add/Edit dialogs.

**Survives.**

---

## 2.17 — Actions and Menus

**Core**

Add:

```text
File
 ├── New
 ├── Edit
 ├── Delete
 └── Exit
```

**Survives.**

---

## 2.18 — Keyboard Shortcuts

**Support**

Add shortcuts.

**Survives selectively.**

---

## 2.19 — QTableView

**Core**

Introduce the proper Qt data-driven approach.

**Important:** don't start with `QTableWidget` as your primary architecture.

---

## 2.20 — QAbstractTableModel

**Core**

Learn:

* `rowCount`
* `columnCount`
* `data`

Feed it:

```python
list[Asset]
```

**Major concept.**

**Survives.**

---

## 2.21 — Model Roles

**Core**

Understand:

* DisplayRole
* EditRole
* alignment
* formatting

**Survives.**

---

## 2.22 — Editing Models

**Core**

Learn:

* `setData`
* `flags`
* `dataChanged`

**Survives.**

---

## 2.23 — Selection

**Core**

Connect selected table rows to the detail panel.

**Survives.**

---

## 2.24 — Proxy Models

**Core**

Learn:

* sorting
* filtering
* search

Build the Asset search box.

**Survives.**

---

## 2.25 — Delegates

**Support**

Learn what delegates are and implement one small custom editor.

**Mostly throwaway.**

We know where to go when we need one.

---

## 2.26 — Application State

**Core**

Separate:

```text
domain state
      ↓
UI state
```

Stop widgets from becoming the application's database.

**Major transferable concept.**

---

## 2.27 — Architecture Boundary

**Core**

Introduce:

```text
View
 ↓
Application logic
 ↓
Domain
```

No database yet.

---

## 2.28 — Threading Concept

**Support**

Demonstrate why:

```python
while True:
    ...
```

freezes the GUI.

Don't build a complicated threaded system yet.

**Lab.**

---

## 2.29 — Qt Designer

**Support**

Learn `.ui` files and Designer.

Use it once.

Then decide whether you prefer code-generated interfaces.

**Not mandatory to the architecture.**

---

## 2.30 — Styling

**Support**

Learn basic Qt Style Sheets.

Don't spend weeks making it beautiful.

---

### Series 2 outcome

A functioning desktop Asset Manager:

```text
Python domain
     ↓
PySide6
     ↓
in-memory Asset objects
```

It can:

* display assets
* search
* select
* add
* edit
* delete
* validate

But if you close it:

**everything disappears.**

Perfect.

---

# SERIES 3 — SQL and Persistence

Now we leave Qt.

### Goal

Understand databases independently.

---

## 3.1 — What a Relational Database Is

**Core**

Learn:

* tables
* rows
* columns
* primary keys
* relationships

---

## 3.2 — SQLite

**Core**

Create an Asset database.

Start with:

```text
:memory:
```

---

## 3.3 — Tables and Schema

**Core**

Design:

```text
assets
categories
owners
```

---

## 3.4 — INSERT

**Core**

Parameterized inserts.

---

## 3.5 — SELECT

**Core**

Queries.

---

## 3.6 — UPDATE

**Core**

Modify assets.

---

## 3.7 — DELETE

**Core**

Remove assets.

---

## 3.8 — WHERE / ORDER BY / LIMIT

**Core**

Query construction.

---

## 3.9 — JOINs

**Core**

Connect:

```text
Asset → Owner
Asset → Category
```

---

## 3.10 — Constraints

**Core**

Learn:

* PRIMARY KEY
* UNIQUE
* NOT NULL
* FOREIGN KEY

---

## 3.11 — Transactions

**Core**

Understand:

```text
BEGIN
 ↓
operations
 ↓
COMMIT
```

or:

```text
ROLLBACK
```

---

## 3.12 — SQL Injection

**Support**

Understand why:

```python
f"SELECT ... {user_input}"
```

is dangerous.

Use parameterized queries.

**Important transferable security lesson.**

---

## 3.13 — SQLAlchemy

**Core**

Introduce SQLAlchemy 2.x.

Learn:

* engine
* metadata
* models

---

## 3.14 — ORM Models

**Core**

Map:

```python
Asset
```

to:

```text
assets
```

---

## 3.15 — Sessions

**Core**

Understand the session lifecycle.

---

## 3.16 — ORM CRUD

**Core**

Create/read/update/delete.

---

## 3.17 — Relationships

**Core**

Map:

```text
Asset → Owner
Asset → Category
```

---

## 3.18 — Transactions and Integrity Errors

**Core**

Handle failed commits.

---

## 3.19 — Repository Pattern

**Core**

Create:

```text
AssetRepository
```

The rest of the application doesn't need to know SQLAlchemy exists.

**Major architecture lesson.**

---

### Series 3 outcome

A fully functioning persistence layer:

```text
Asset domain
     ↓
Repository
     ↓
SQLAlchemy
     ↓
SQLite
```

Still no GUI.

---

# SERIES 4 — Desktop + Database Integration

Now we finally combine the pieces.

### Goal

Learn integration without simultaneously learning new frameworks.

---

## 4.1 — Database → Domain

**Core**

Retrieve SQLAlchemy records and produce domain objects.

---

## 4.2 — Database → Table Model

**Core**

Feed database data into `QAbstractTableModel`.

---

## 4.3 — Refreshing the Model

**Core**

Learn the correct notification strategy.

---

## 4.4 — Master/Detail

**Core**

```text
QTableView
     ↓
selected Asset
     ↓
detail panel
```

---

## 4.5 — Create

**Core**

Form → domain validation → repository → database → model refresh.

---

## 4.6 — Edit

**Core**

Same pipeline in reverse.

---

## 4.7 — Delete

**Core**

Confirmation → repository → refresh.

---

## 4.8 — Error Translation

**Core**

Database exceptions shouldn't leak directly into the UI.

Transform:

```text
SQLAlchemy exception
        ↓
application error
        ↓
user-friendly message
```

---

## 4.9 — Repository / Service Boundary

**Core**

Introduce:

```text
UI
 ↓
Service
 ↓
Repository
 ↓
Database
```

---

## 4.10 — Dependency Injection

**Support**

Learn how components receive dependencies instead of creating everything themselves.

This becomes extremely valuable later with FastAPI and testing.

---

## 4.11 — Integration Testing

**Core**

Test repository + database.

---

## 4.12 — Full Desktop Application

**Core**

Clean up the prototype.

This becomes the first **real milestone application**.

---

# SERIES 5 — HTTP and APIs

This is where the curriculum deliberately changes direction.

We don't need another 50 PySide lessons.

### Goal

Understand how applications communicate.

### Project

**Asset API Client**

---

## 5.1 — What HTTP Is

**Core**

Understand:

```text
Client
   ↓
HTTP request
   ↓
Server
   ↓
HTTP response
```

---

## 5.2 — URLs

**Core**

Learn:

* scheme
* host
* path
* query parameters
* fragments

---

## 5.3 — HTTP Methods

**Core**

Understand:

```text
GET
POST
PUT
PATCH
DELETE
```

---

## 5.4 — Status Codes

**Core**

Learn:

```text
2xx
3xx
4xx
5xx
```

---

## 5.5 — Headers

**Core**

Learn:

* Content-Type
* Authorization
* Accept

---

## 5.6 — JSON

**Core**

Serialization/deserialization.

---

## 5.7 — HTTPX

**Core**

Make real HTTP requests from Python.

---

## 5.8 — Query Parameters

**Core**

Search an API.

---

## 5.9 — POST Requests

**Core**

Create remote data.

---

## 5.10 — Error Handling

**Core**

Handle:

* timeout
* connection error
* HTTP errors
* invalid JSON

---

## 5.11 — API Client Architecture

**Core**

Build:

```text
AssetAPIClient
```

instead of scattering HTTP requests through the UI.

---

## 5.12 — Authentication

**Core**

Understand API keys and bearer tokens.

---

## 5.13 — Pagination

**Core**

Handle APIs returning:

```text
page 1
page 2
page 3
...
```

---

## 5.14 — Rate Limits

**Support**

Understand:

* 429
* backoff
* retry strategies

---

## 5.15 — Serialization Models

**Core**

Introduce Pydantic.

---

## 5.16 — API Data vs Domain Data

**Core**

Important architectural distinction:

```text
API response
     ↓
DTO / schema
     ↓
Domain object
```

Don't blindly make external JSON your domain model.

---

## 5.17 — Async Programming

**Core**

Understand:

```python
async
await
```

and why asynchronous I/O exists.

---

## 5.18 — Async HTTP

**Core**

Use HTTPX asynchronously.

---

## 5.19 — Concurrency

**Core**

Understand:

```text
concurrency ≠ parallelism
```

and when async helps.

---

## 5.20 — API Client Testing

**Core**

Mock external HTTP calls.

---

### Series 5 outcome

You now understand:

```text
Python
 ↓
HTTP
 ↓
JSON
 ↓
REST API
 ↓
API client
 ↓
async I/O
```

This is substantially more transferable than another 30 Qt lessons.

---

# SERIES 6 — FastAPI

Now we go to the other side of HTTP.

### Goal

Build the API we've been consuming.

---

## 6.1 — FastAPI Application

**Core**

Create the server.

---

## 6.2 — Routes

**Core**

Create:

```text
GET /assets
GET /assets/{id}
POST /assets
PATCH /assets/{id}
DELETE /assets/{id}
```

---

## 6.3 — Pydantic Request Models

**Core**

Validate incoming data.

---

## 6.4 — Response Models

**Core**

Control outgoing data.

---

## 6.5 — HTTP Errors

**Core**

Return appropriate errors.

---

## 6.6 — Dependency Injection

**Core**

Now the earlier DI lesson pays off.

---

## 6.7 — SQLAlchemy + FastAPI

**Core**

Connect the backend to the database.

---

## 6.8 — Database Sessions

**Core**

Learn per-request database lifecycle.

---

## 6.9 — Service Layer

**Core**

```text
HTTP
 ↓
Route
 ↓
Service
 ↓
Repository
 ↓
Database
```

---

## 6.10 — Authentication

**Core**

Introduce authentication concepts.

---

## 6.11 — Authorization

**Core**

Understand:

> Who are you?

vs.

> What are you allowed to do?

---

## 6.12 — API Testing

**Core**

Test endpoints independently.

---

## 6.13 — API Documentation

**Support**

Understand OpenAPI and generated API documentation.

---

### Series 6 outcome

You now have:

```text
FastAPI
   ↓
Service
   ↓
Repository
   ↓
SQLAlchemy
   ↓
SQLite
```

---

# SERIES 7 — Full Application Integration

Now everything comes together.

```text
┌─────────────────────┐
│      PySide6        │
│      Desktop        │
└──────────┬──────────┘
           │
         HTTP
           │
┌──────────▼──────────┐
│      FastAPI        │
│       Server        │
└──────────┬──────────┘
           │
       Services
           │
      Repository
           │
┌──────────▼──────────┐
│      SQLite         │
└─────────────────────┘
```

---

## 7.1 — Replace Local Repository

**Core**

Desktop app now uses HTTP.

---

## 7.2 — API-backed QAbstractTableModel

**Core**

The Qt model gets data remotely.

---

## 7.3 — Loading States

**Core**

Learn:

```text
Loading...
Loaded
Error
Empty
```

This is an important UI state-management lesson.

---

## 7.4 — Non-blocking HTTP

**Core**

Never freeze the GUI waiting for the server.

---

## 7.5 — Worker Architecture

**Core**

Learn the Qt worker pattern.

---

## 7.6 — Async vs QThread

**Support**

Understand when you'd choose:

```text
QThread
```

versus:

```text
asyncio
```

Don't blindly combine them.

---

## 7.7 — Offline/Error Behavior

**Core**

Handle:

* server unavailable
* timeout
* authentication failure
* malformed response

---

## 7.8 — Local Cache

**Support**

Use SQLite as a local cache.

Now the application becomes significantly more realistic.

---

# SERIES 8 — Professional Software Engineering

Now that you've actually built applications, these concepts have context.

---

## 8.1 — Project Configuration

**Core**

Learn modern `pyproject.toml`.

---

## 8.2 — Environment Management

**Core**

Virtual environments and dependency management.

---

## 8.3 — Logging

**Core**

Replace random `print()` debugging with structured logging.

---

## 8.4 — Configuration

**Core**

Environment/configuration separation.

---

## 8.5 — Testing Strategy

**Core**

Understand what to test:

```text
Domain
Repository
Service
API
UI
```

and what **not** to test excessively.

---

## 8.6 — Mocking

**Core**

Mock:

* APIs
* repositories
* external services

---

## 8.7 — Integration Tests

**Core**

Test multiple layers together.

---

## 8.8 — End-to-End Tests

**Support**

Understand when they are useful and why they're expensive.

---

## 8.9 — Global Error Handling

**Core**

Create sensible application-level error reporting.

---

## 8.10 — Security Fundamentals

**Core**

Learn:

* secrets
* passwords
* tokens
* injection
* validation
* least privilege

---

# SERIES 9 — Deployment

Now we learn how to actually ship the thing.

---

## 9.1 — Application Data Locations

**Core**

Separate:

```text
application code
configuration
user data
database
logs
```

---

## 9.2 — Database Initialization

**Core**

First-run setup.

---

## 9.3 — Database Migrations

**Core**

Introduce Alembic.

---

## 9.4 — Packaging the Desktop App

**Core**

PyInstaller or equivalent.

---

## 9.5 — Packaging the API

**Core**

Prepare the backend for deployment.

---

## 9.6 — Docker

**Support**

Containerize the API.

---

## 9.7 — Production Configuration

**Core**

Development vs production settings.

---

## 9.8 — Clean-Machine Test

**Core**

Install and run everything without your development environment.

---

# SERIES 10 — Optional Specializations

This is where we **stop pretending everything is mandatory**.

You choose what interests you.

---

### 10A — Advanced PySide

If you enjoy desktop development:

* custom delegates
* advanced model/view
* QML
* Qt Quick
* animations
* custom painting
* multimedia
* advanced resources

---

### 10B — Advanced Backend

If APIs interest you:

* PostgreSQL
* Redis
* background jobs
* WebSockets
* message queues
* distributed systems

---

### 10C — Advanced Async Python

If networking interests you:

* asyncio internals
* task groups
* cancellation
* connection pooling
* async database drivers

---

### 10D — Web Development

If you want web UI:

* HTML
* CSS
* JavaScript
* TypeScript
* React/Vue/etc.

---

### 10E — DevOps

If deployment interests you:

* Linux
* Docker
* CI/CD
* cloud deployment
* monitoring

---

# What actually survives?

This is the part I think is particularly important for your original question.

| Topic                | Core Project? | Transferability |
| -------------------- | ------------: | --------------: |
| Python classes       |             ✅ |           ⭐⭐⭐⭐⭐ |
| Dataclasses          |             ✅ |           ⭐⭐⭐⭐⭐ |
| Type hints           |             ✅ |           ⭐⭐⭐⭐⭐ |
| Exceptions           |             ✅ |           ⭐⭐⭐⭐⭐ |
| Testing              |             ✅ |           ⭐⭐⭐⭐⭐ |
| PySide widgets       |             ✅ |              ⭐⭐ |
| Signals/slots        |             ✅ |            ⭐⭐⭐⭐ |
| Qt Model/View        |             ✅ |            ⭐⭐⭐⭐ |
| Qt Designer          |      Optional |              ⭐⭐ |
| Qt Style Sheets      |      Optional |               ⭐ |
| SQLite               |             ✅ |           ⭐⭐⭐⭐⭐ |
| SQL                  |             ✅ |           ⭐⭐⭐⭐⭐ |
| SQLAlchemy           |             ✅ |           ⭐⭐⭐⭐⭐ |
| Repository pattern   |             ✅ |           ⭐⭐⭐⭐⭐ |
| HTTP                 |             ✅ |           ⭐⭐⭐⭐⭐ |
| JSON                 |             ✅ |           ⭐⭐⭐⭐⭐ |
| REST                 |             ✅ |           ⭐⭐⭐⭐⭐ |
| HTTPX                |             ✅ |            ⭐⭐⭐⭐ |
| Pydantic             |             ✅ |           ⭐⭐⭐⭐⭐ |
| asyncio              |             ✅ |           ⭐⭐⭐⭐⭐ |
| FastAPI              |             ✅ |           ⭐⭐⭐⭐⭐ |
| Dependency injection |             ✅ |           ⭐⭐⭐⭐⭐ |
| Authentication       |             ✅ |           ⭐⭐⭐⭐⭐ |
| Docker               |      Optional |           ⭐⭐⭐⭐⭐ |

That's the reason I'd choose this structure.

---

# And the "throwaway" philosophy becomes powerful

For example, when learning inheritance:

```text
lesson/
    inheritance_demo.py
```

Delete it.

When learning Qt delegates:

```text
lab_delegate/
    main.py
```

Delete it.

When learning async:

```text
async_experiment.py
```

Delete it.

Meanwhile your real project remains clean:

```text
asset-manager/
│
├── src/
│   └── asset_manager/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       ├── desktop/
│       └── api/
│
├── tests/
│
├── migrations/
│
└── pyproject.toml
```

That's an important professional habit in itself.

---

# The progression I'd ultimately aim for

You don't need to think:

> "I have 150 lessons to complete."

Instead, think in **capabilities**:

### Milestone 1

> I can model a real domain in Python.

### Milestone 2

> I can build a desktop application.

### Milestone 3

> I can persist data in a relational database.

### Milestone 4

> I can architect a multi-layer application.

### Milestone 5

> I can communicate with external APIs.

### Milestone 6

> I understand asynchronous network programming.

### Milestone 7

> I can build an HTTP API.

### Milestone 8

> I can connect a desktop client to my own API.

### Milestone 9

> I can test it.

### Milestone 10

> I can ship it.

That's a **much more valuable curriculum** than "Lesson 137: Advanced Qt Item Delegate Flags."

And it solves your original concern: **PySide becomes one chapter in learning how to build software, rather than becoming the thing you're spending your entire learning life on.**

If I were setting a target, I'd consider **Series 1–4 the first major course**, **Series 5–7 the second**, and **Series 8–9 the professionalization course**. The optional Series 10 topics can then be selected based on what you actually enjoy rather than predicted years in advance.
