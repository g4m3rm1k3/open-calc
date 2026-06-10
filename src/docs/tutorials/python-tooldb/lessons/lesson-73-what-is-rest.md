# Python Tool Database — LAB 73 — What Is a REST API

**Prerequisites:** Lab 52 (ToolService). You have a service layer with `create_tool`, `get_tool`, `update_tool`, `delete_tool`. This lesson explains what a REST API is, why it replaces the PySide6 UI, and what you will build in the next six lessons.

**What this lab adds:**
- HTTP as a protocol: request/response, verbs, status codes
- REST as a convention: URL structure, verb-to-CRUD mapping
- Why REST replaces the desktop UI: the browser, mobile, and multi-user story
- JSON as the exchange format
- The contract between client and server

**Time:** 30–40 minutes (concept-heavy, minimal code)

---

## What You Will Build

This lesson builds no code. It maps the concepts you already know to HTTP vocabulary, so the next five lessons make sense from the first line.

By the end of this lesson, you will be able to read this table and know exactly what the next five lessons will implement:

```
Method   URL                    Action           Service method
────────────────────────────────────────────────────────────────
GET      /tools                 list all tools   get_all_tools()
GET      /tools/42              get one tool     get_tool(42)
POST     /tools                 create a tool    create_tool(data)
PUT      /tools/42              replace a tool   update_tool(42, data)
PATCH    /tools/42              partial update   update_tool(42, partial)
DELETE   /tools/42              delete a tool    delete_tool(42)
```

---

> **Quick Check — try to answer before reading:**
>
> 1. Your browser loads a web page by making an HTTP GET request. You submit a form by making an HTTP POST. Name the other two HTTP verbs used in REST APIs.
> 2. HTTP status code 200 means "OK." What do 201, 404, and 422 mean?
> 3. The ToolService lives in the same process as the PySide6 UI. A REST API moves it to a separate process. Name one thing that becomes possible when the service runs separately.
>
> *(Answers at the end of this lab)*

---

## HTTP: The Protocol You Already Know

You already use HTTP every time you open a browser. A browser makes a **request** and a server sends a **response**.

Every HTTP request has:
- A **method** (also called a verb): `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- A **URL**: `https://example.com/tools/42`
- Optional **headers**: metadata (`Content-Type: application/json`)
- Optional **body**: data sent with the request (for POST, PUT, PATCH)

Every HTTP response has:
- A **status code**: a 3-digit number (`200`, `201`, `404`, `422`, `500`)
- Optional **headers**
- Optional **body**: data returned from the server (usually JSON)

This is the entire protocol. REST is not a new protocol — it is a set of conventions for using HTTP in a predictable way.

---

## REST: Conventions for HTTP

REST stands for **Representational State Transfer**. The important word is "representational" — you transfer a *representation* of a resource (a JSON object) rather than transferring the resource itself (a database row).

**The three conventions REST adds to HTTP:**

**1. Resources are nouns, not verbs.**

URLs name things (resources), not actions:

```
WRONG (RPC style):  GET /getTools
                    POST /createTool
                    POST /deleteTool?id=42

RIGHT (REST style): GET /tools
                    POST /tools
                    DELETE /tools/42
```

The action is expressed by the HTTP method, not the URL.

**2. URLs are hierarchical.**

Children live under parents:

```
GET /jobs/5/assemblies          ← all assemblies in job 5
GET /jobs/5/assemblies/12       ← specific assembly 12 in job 5
POST /jobs/5/assemblies         ← create a new assembly in job 5
```

**3. The HTTP method expresses the intent.**

| Method | Meaning | Safe? | Idempotent? |
|--------|---------|-------|-------------|
| GET    | Read — no side effects | Yes | Yes |
| POST   | Create — may produce side effects | No | No |
| PUT    | Replace entirely | No | Yes |
| PATCH  | Partial update | No | No (usually) |
| DELETE | Remove | No | Yes |

**Safe** means "calling it never changes server state" — a GET request may be called a million times without changing anything.

**Idempotent** means "calling it multiple times produces the same result as calling it once" — you already know this from Lab 61 (MergePolicy). Sending `DELETE /tools/42` twice: the first deletes the tool, the second returns 404 (already gone). The server state is the same after both calls as after the first.

---

## Status Codes: The Response Vocabulary

You must know these to use any REST API:

| Code | Name | When to use |
|------|------|-------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST that created a resource |
| 204 | No Content | Successful DELETE (no body to return) |
| 400 | Bad Request | The request body is malformed (can't parse the JSON) |
| 404 | Not Found | The resource with that ID doesn't exist |
| 422 | Unprocessable Entity | The request parsed but failed validation (Pydantic raises this) |
| 500 | Internal Server Error | Unexpected server error — the bug you need to fix |

**The code tells the client what happened.** A client that receives 404 knows the tool was not found. A client that receives 422 knows the data it sent was invalid. A client that receives 500 knows something broke on the server.

Never return 200 with an error message in the body — that breaks every HTTP client, caching proxy, and logging tool that reads status codes.

---

## JSON: The Exchange Format

Your service methods accept `ToolCreate` and return `ToolRead`. Over HTTP, both sides communicate as JSON — a string the other side parses:

```
Client sends (request body):
    {"name": "EM-0500", "tool_type": "endmill", "diameter": 6.0}

Server receives → Pydantic validates → ToolCreate(name="EM-0500", ...)
Server creates the tool → ToolRead(id=42, name="EM-0500", ...)
Server sends (response body):
    {"id": 42, "name": "EM-0500", "tool_type": "endmill", "diameter": 6.0}
```

Pydantic handles both directions: `ToolCreate.model_validate(json_dict)` for incoming data, `tool_read.model_dump()` for outgoing data. FastAPI (next lesson) calls both automatically — you write the same schema classes you already have.

---

## Why This Replaces the Desktop UI

The PySide6 application is a **client** that calls the service layer directly:

```
[PySide6 UI] → [ToolService] → [SQLAlchemy] → [SQLite database]
```

Everything runs in one process on one machine. Another user on another machine cannot use it.

A REST API splits this differently:

```
[PySide6 UI]  →  HTTP  → [FastAPI server] → [ToolService] → [SQLite/PostgreSQL]
[Browser UI]  →  HTTP  → [FastAPI server] ↗
[Mobile app]  →  HTTP  → [FastAPI server] ↗
[Python script] → HTTP → [FastAPI server] ↗
```

The service layer becomes network-accessible. Any client — on any machine, in any language — can use it by sending HTTP requests.

**What you gain:**
- Multiple simultaneous users
- Browser-based UI (no installation)
- Mobile access
- Scriptable (curl, Python scripts, automation)
- The API can be tested without opening a UI

**What you trade:**
- Network latency per request
- Error handling for network failures
- Authentication (who is allowed to call this?)
- Deployment complexity (the server must run somewhere)

Block 11 covers the transition. The service layer code (ToolService, schemas, ORM models) does not change — it is reused. FastAPI wraps it with HTTP.

---

## The Contract

A REST API is a contract between a server and its clients. The contract specifies:
- The URLs
- The HTTP methods
- The request body shape (what JSON the client must send)
- The response body shape (what JSON the server returns)
- The status codes for success and each failure mode

You will write this contract explicitly as **API Contract** blocks in the next lessons — before any code. The contract is what the client and server both depend on. Changing it breaks clients.

This is the same principle as the three-schema pattern (Lab 52): the schema is the contract between service and caller. The API contract is the schema exposed over HTTP.

---

## Quick Check Answers

**1. Name the other two HTTP verbs used in REST APIs.**
`PUT` (replace a resource entirely) and `DELETE` (remove a resource). `PATCH` is a fifth verb used for partial updates — updating only specific fields without replacing the whole resource. The four verbs — GET, POST, PUT, DELETE — map directly to the CRUD operations (Create → POST, Read → GET, Update → PUT/PATCH, Delete → DELETE).

**2. What do HTTP status codes 201, 404, and 422 mean?**
`201 Created` — the POST request succeeded and a new resource was created. The response typically includes the created resource's representation (with its new ID). `404 Not Found` — no resource exists at the requested URL. For `/tools/999`, this means there is no tool with ID 999. `422 Unprocessable Entity` — the request was syntactically valid JSON but the data inside failed validation (e.g., `diameter` was negative, or a required field was missing). FastAPI returns 422 automatically when Pydantic validation fails.

**3. Name one thing that becomes possible when the service runs separately.**
Multiple users on different machines can use the database simultaneously. With the PySide6 app, only one machine can run the app and therefore only one user can access the data at a time. With a REST API, the server runs on one machine and any number of clients on any number of machines can send requests to it — each request is handled independently by the server's service layer.
