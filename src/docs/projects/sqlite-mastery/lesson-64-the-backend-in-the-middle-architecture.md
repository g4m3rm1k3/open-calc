# Lesson 64: The Backend-in-the-Middle Architecture

**What you will build:** a real endpoint on this project's own existing
FastAPI backend, serving real, live enterprise-server data — the real,
concrete answer to whether every `pywebview` app should connect to that
server directly: it shouldn't, and this lesson proves exactly why with
a real, working alternative instead of only an argument.

**What you need to know first:** [Lesson 28](lesson-28-why-a-backend-at-all.md)
— its own real, three-part case for a backend at all, revisited here
for a genuinely higher-stakes reason than any of its own three original
problems. [Lesson 62](lesson-62-connecting-to-a-real-enterprise-server-database.md)
— the real `pyodbc` connection this lesson centralizes.

**Terms introduced in this lesson:** none new — this lesson applies
Lesson 28's own already-explained architecture, and Lesson 31's own
`Depends(get_db)` pattern, to a genuinely new, real target.

**Objects and methods used:**

**`Cursor.description`**
- *What it is:* a real, standard DB-API 2.0 attribute — present on
  every real, compliant cursor, `sqlite3` included, though this series
  hasn't needed it until now.
- *Implementation:* `cursor.description` — after a real `execute()`, a
  real sequence of one real, 7-element tuple per result column; each
  tuple's own first element is that column's real name.
- *Its use:* converting a real `pyodbc` row into a real Python `dict`,
  the portable, standard-DB-API equivalent of Lesson 19's own
  `sqlite3.Row`.

---

## Concept Unit: The Real, Concrete Cost of Connecting Directly

### The Problem

Lesson 28 already named three real, abstract reasons a backend beats
direct file access. A real, IT-owned enterprise server makes at least
one of those three real, concrete, and considerably higher-stakes: a
credential.

### Introduce the Concept in Isolation

The real, naive alternative, stated directly rather than built: every
one of this project's own `pywebview` desktop installs carries its own
real copy of `.env` (Lesson 62), holding a real, genuine SQL Server
username and password, or relies on Windows Authentication tied to
whichever real Windows account happens to be logged in on that
specific real machine.

The real, concrete costs this creates, each one genuine and specific,
not hypothetical: a real credential now exists on every real machine
this app is ever installed on, not one, central, IT-controlled place —
a real, serious concern for any IT department asked to grant it, and
the real reason a request framed as "I need SQL login credentials
embedded in a desktop app distributed to my team" is a real, much
harder ask than "I need one, real, server-side service account." A
real schema change on the server (Lesson 63's own real target)
requires updating and redistributing *every* real, already-installed
copy of this app at once, rather than one, real, central service. And
real, direct visibility into what this project's own queries are
actually doing against a real, shared, enterprise resource — genuinely
important to any real DBA — exists nowhere at all, scattered across
however many real, independent desktop connections instead.

### Discard

Nothing to discard — this unit is real, direct reasoning, the identical
kind Lesson 28 itself was built from, not disposable example code.

### Mechanical Walkthrough

Not applicable — no code was introduced in this unit.

### CS Lens

This is the identical real **client-server architecture** Lesson 28
already named directly, now applied one layer further out: not just
this project's own `pywebview` UI talking to its own backend instead of
a local file, but that same backend now standing between every real
desktop client and a real, shared, IT-owned resource it does not, and
should not, control directly.

### SE Lens

The real, honest reason this cost is genuinely higher-stakes than
Lesson 28's own original three: `pocket_hardware.db` was this
project's own file, on this project's own machine, with no real,
external party's own trust or authorization involved at all. A real
enterprise server belongs to someone else's real infrastructure, under
someone else's real security policy — every one of Lesson 28's own
original three problems still applies, and a fourth, genuinely more
serious one joins them: credential exposure at real, organizational
scale, not merely inconvenience.

## Concept Unit: One Real Endpoint, One Real, Central Credential

### The Problem

This project's own existing FastAPI backend (Arc 4) already exists,
already serves `pocket_hardware.db`, and already has real, working
infrastructure — `Depends`, Pydantic, real error handling. Can it serve
the enterprise server too, from that same, one, real, central place?

### Introduce the Concept in Isolation

A real, second, independent dependency, alongside `get_db` (Lesson
31) — this one, and *only* this one, ever holding real SQL Server
credentials, in this backend's own `.env`, never distributed anywhere
else:

```python
import os
import pyodbc
from dotenv import load_dotenv
from fastapi import Depends

load_dotenv()


def get_enterprise_db():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={os.environ['DB_SERVER']};"
        f"DATABASE={os.environ['DB_NAME']};"
        f"UID={os.environ['DB_USER']};"
        f"PWD={os.environ['DB_PASSWORD']};"
    )
    try:
        yield conn
    finally:
        conn.close()


@app.get("/enterprise/products")
def list_enterprise_products(db=Depends(get_enterprise_db)):
    cursor = db.cursor()
    cursor.execute("SELECT TOP 100 ProductID, ProductName, UnitPrice FROM Products")
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
```

```
$ curl http://127.0.0.1:8000/enterprise/products
[{"ProductID":1,"ProductName":"Widget A","UnitPrice":9.99}, ...]
```

Every real, future `pywebview` client — this project's own, and any
real, further one built later — reaches this real, live enterprise
data through `GET /enterprise/products`, the identical real HTTP shape
Lesson 38's own `$.ajax` already proved works correctly inside a
`pywebview` window. Not one of them ever holds a real SQL Server
credential, ever installs `pyodbc` or an ODBC driver, or ever needs to
know this data doesn't actually live in `pocket_hardware.db` at all.

### Discard

Nothing throwaway — `get_enterprise_db` and `list_enterprise_products`
are real, permanent additions to this project's own single, existing
backend.

### Mechanical Walkthrough

- `def get_enterprise_db(): conn = pyodbc.connect(...); try: yield
  conn; finally: conn.close()` — **(b) hard concept reappearing**,
  Lesson 31's own real `yield`-based dependency shape, applied here to
  a genuinely different, real connection type.
- `db=Depends(get_enterprise_db)` — **(b) hard concept reappearing**,
  Lesson 31's own `Depends`, unchanged.
- `columns = [col[0] for col in cursor.description]` — **(a) first
  appearance** of `cursor.description`, full treatment above.
- `[dict(zip(columns, row)) for row in cursor.fetchall()]` — **(a)
  first appearance** of Python's own real, standard `zip` function,
  pairing each real column name with its matching real value,
  positionally, from one real row — genuinely new to this series,
  ordinary Python, needed here because `pyodbc` has no direct
  equivalent to Lesson 19's own convenient `sqlite3.Row`.

### CS Lens

This is real, direct proof DB-API 2.0's own real portability (Lesson
17, Lesson 62) extends past the connection itself and into how a real
backend is *structured*: `get_enterprise_db` slots into the identical
real `Depends` shape `get_db` already established, because both real
connection objects — `sqlite3.Connection` and `pyodbc.Connection` —
expose the identical real `cursor()`/`execute()`/`fetchall()` contract
underneath.

### SE Lens

The real, concrete resolution to this lesson's own opening question,
stated plainly: yes, every real `pywebview` client should go through
this one, real, central backend — never connect to the enterprise
server directly. The real credential now lives in exactly one, real,
server-side `.env` file, controlled by whoever deploys this backend,
never copied onto a single real user's own machine. A real schema
change on the enterprise server (Lesson 63) requires updating this one,
real service — not redistributing anything to anyone. And every real
query this project makes against a real, shared enterprise resource now
passes through one, real, inspectable, central place, exactly answering
the real, legitimate visibility concern a real DBA would otherwise have
no way to address at all.

## Connect the pieces

One real, additional dependency, `get_enterprise_db`, slotted into this
project's own already-existing FastAPI backend alongside `get_db`
(Lesson 31) — proving Lesson 28's own original architecture generalizes
completely to a real, external, IT-owned resource, not just this
project's own local file. `GET /enterprise/products` gave every real
`pywebview` client a single, safe, central way to reach real,
live enterprise data, with the one, real credential that makes it
possible held in exactly one place, never distributed to a single real
end-user machine.

## What breaks without this

State plainly, rather than demonstrate directly (extracting a real
credential from a real, distributed executable is not something this
series will walk through, even hypothetically): a `pyodbc.connect(...)`
call embedded directly inside a `pywebview` app's own Python source,
packaged with PyInstaller (Lesson 43), does not meaningfully hide its
own real connection string or credential — a packaged Python
application's own source is genuinely recoverable by a real, motivated
person with access to the installed `.exe`, the identical real, honest
limitation Lesson 54's own encryption overview already named for a
locally-stored key. This is the real, concrete, serious cost Lesson 28
and this lesson's own first unit already named in the abstract — stated
here, once, directly, as the real reason this isn't merely a style
preference.

## Exercises

1. Add a real, second enterprise endpoint — `GET /enterprise/products/
   {product_id}`, following Lesson 31's own path-parameter pattern —
   using `get_enterprise_db` exactly as this lesson's own first
   endpoint did.
2. Confirm, directly, that a real `pywebview` window (any real page
   from this project's own existing UI) can call
   `GET /enterprise/products` with `$.ajax` (Lesson 38) and render the
   real result, exactly as it already does for `GET /parts`.

## Definition of Done

- [ ] You can state, from memory, all four real reasons a direct
      connection from every `pywebview` client is the wrong design here.
- [ ] You built `get_enterprise_db` and a real, working endpoint using
      it, with the real credential held only in this backend's own
      `.env`.
- [ ] You converted a real `pyodbc` row into a `dict` using
      `cursor.description`, and can state why `pyodbc` needs this where
      `sqlite3.Row` didn't.
- [ ] You completed both exercises.

## Next

[Lesson 65 — Joining Local SQLite Data With Remote Server Data](lesson-65-joining-local-sqlite-data-with-remote-server-data.md)
closes this arc with the real, last piece: combining this project's own
local `parts` with the enterprise server's own real data, in one real,
correct result.
