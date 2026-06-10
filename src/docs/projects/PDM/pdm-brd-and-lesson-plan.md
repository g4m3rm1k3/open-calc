# Vault PDM — Business Requirements Document & Curriculum

**Version:** 1.0  
**Date:** June 2026  
**Stack:** Electron + React + Express + PostgreSQL + GitLab API  
**Auth:** GitLab Personal Access Token  
**Teaching contract:** Full contract applied — every concept taught at first use

---

## Part 1 — Business Requirements Document

### 1.1 Problem Statement

Managing CAD files, drawings, specs, and related documents across a mixed local/remote
team without a PDM system produces a specific class of failure: two engineers open the
same file, one overwrites the other's work, and nobody knows until something is machined
wrong. The only recovery is manual — "which version was right?" becomes an archaeology
project.

The existing solution — a hand-built agent system — has reached a complexity threshold
where it cannot be read, debugged, or extended. This is the ball-of-mud antipattern:
code that grew organically without enforced structure until no single person (or agent)
can hold the whole system in their head. The correct response is not to patch it. It is
to rebuild it with explicit architecture, enforce separation of concerns from lesson one,
and teach the engineering principles that prevent the mud from forming again.

### 1.2 System Name

**Vault** — a PDM system for mixed local/remote teams managing engineering files.

### 1.3 What Vault Does

Vault is the single source of truth for all files a team produces. It provides:

- **Checkout / check-in with locking.** One person holds a file at a time. Others
  can read. Nobody can overwrite a file that is checked out.
- **WIP (Work In Progress) commits.** While a file is checked out, the engineer can
  save progress snapshots that do not appear in the committed history. WIP saves are
  daily-backup grade: they are recoverable, but they do not pollute the version timeline.
- **Version history.** Every committed check-in is a permanent, labelled version.
  Any version can be retrieved. Nothing is ever deleted.
- **File tree browsing.** A folder-tree view of all managed files, with status
  indicators: checked in, checked out (by whom), locked.
- **Search.** Find files by name, part number, or metadata.
- **Multi-file-type support.** CAD/CAM files, PDFs, Word docs, code scripts,
  images, renders. File type conventions are user-configurable, not hardcoded.
- **Identity via GitLab PAT.** Users authenticate by providing a GitLab Personal
  Access Token. Vault validates it against the GitLab API, reads the user's identity
  (name, email, username), and uses that identity for all checkout attribution.
- **GitLab as the storage backend.** All files and versions live in GitLab
  repositories. Vault is a purpose-built interface over the GitLab API — it does not
  invent its own storage format.

### 1.4 What Vault Does Not Do (v1.0)

The following are explicitly out of scope for the initial build. They are listed here
because they have been discussed and will be added after v1.0:

- OAuth login flow (PAT only in v1.0)
- Bill of materials (BOM) linking
- Automated CI/CD integration
- Email or webhook notifications
- Mobile client
- Role-based access control beyond checkout locking
- File diff / visual comparison
- AI-assisted search or tagging

Each of these is a vertical extension. Because v1.0 is built with clean architecture,
each extension adds a new slice without touching existing code. This is the open/closed
principle stated as a project goal: the system is open for extension, closed for
modification of what already works.

### 1.5 Core Concepts and Domain Language

These terms have precise meanings in this system. They are used consistently
throughout the curriculum and the codebase.

| Term | Definition |
|---|---|
| **File** | A managed document in Vault. Has a path, a name, a file type, and a version history. |
| **Version** | A committed snapshot of a file. Permanent and labelled. Backed by a GitLab commit. |
| **WIP snapshot** | A non-committed save made while a file is checked out. Recoverable but not part of the version timeline. |
| **Checkout** | The act of locking a file for exclusive write access. Only one user may hold a checkout at a time. |
| **Check-in** | The act of releasing a checkout, creating a new committed version. |
| **Lock** | The database record that records who currently holds a checkout and when it started. |
| **PAT** | GitLab Personal Access Token. A string the user pastes into Vault once. Used to authenticate all GitLab API calls on their behalf. |
| **Project** | A GitLab project (repository) that Vault manages. One Vault workspace can span multiple GitLab projects. |
| **Vault workspace** | The local Electron application, connected to a specific GitLab instance and a specific set of projects. |

### 1.6 Architecture Overview

Vault has four layers. Each layer has one job. Each layer talks only to the layer
directly below it. This is the layered architecture pattern — the primary structural
decision of the entire system.

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                  │
│  React components in Electron renderer process       │
│  Job: show state, capture user intent               │
├─────────────────────────────────────────────────────┤
│  API LAYER                                           │
│  Express HTTP server (runs in Electron main process) │
│  Job: receive intent, validate, delegate            │
├─────────────────────────────────────────────────────┤
│  DOMAIN LAYER                                        │
│  TypeScript modules: checkout, versioning, locking  │
│  Job: enforce business rules                        │
├─────────────────────────────────────────────────────┤
│  DATA LAYER                                          │
│  PostgreSQL (metadata) + GitLab API (file content)  │
│  Job: persist and retrieve data                     │
└─────────────────────────────────────────────────────┘
```

**Why this shape?**

- The presentation layer never touches the database. It cannot accidentally write
  business logic into a React component.
- The domain layer never knows about HTTP. It cannot accidentally depend on request
  format details.
- The data layer never knows about business rules. A database query does not decide
  whether a checkout is allowed — that decision lives in the domain layer.
- Each layer can be tested independently. The domain layer can be unit-tested without
  a running Electron window or a PostgreSQL database.

This is the architecture your previous system did not have. Adding a feature to that
system required touching multiple things because nothing had a single responsibility.
In Vault, adding a feature means: add a database table (data layer), add a domain
function (domain layer), add an API route (API layer), add a component (presentation
layer). Each change is contained.

### 1.7 Data Model (v1.0)

The database stores metadata. File content lives in GitLab. This is a critical
design decision: PostgreSQL is fast at querying structured data (who has what checked
out, what is the latest version); GitLab is purpose-built for storing and diffing
binary and text files. Each tool does what it is good at.

```
users
  id            UUID primary key
  gitlab_user_id  integer   unique   (from GitLab API)
  username      text
  email         text
  display_name  text
  created_at    timestamptz

files
  id            UUID primary key
  gitlab_project_id  integer
  file_path     text       (e.g. /designs/housing/housing-v3.step)
  file_type     text       (e.g. STEP, PDF, DWG — from conventions config)
  created_at    timestamptz

versions
  id            UUID primary key
  file_id       UUID references files(id)
  commit_sha    text       (GitLab commit SHA — the permanent identifier)
  committed_by  UUID references users(id)
  commit_message  text
  committed_at  timestamptz

locks
  id            UUID primary key
  file_id       UUID references files(id)   unique  (only one lock per file)
  held_by       UUID references users(id)
  checked_out_at  timestamptz

wip_snapshots
  id            UUID primary key
  lock_id       UUID references locks(id)
  gitlab_branch text       (temporary branch in GitLab)
  snapshot_sha  text       (commit SHA of the WIP save)
  saved_at      timestamptz
```

**Why UUIDs for primary keys, not integers?**  
Integers are sequential and predictable. `/api/files/4` tells an attacker there are
at least 4 files and invites enumeration attacks. UUIDs are random 128-bit identifiers
— guessing one is computationally infeasible. This is the insecure direct object
reference (IDOR) vulnerability class, prevented by design.

**Why a separate `locks` table, not a column on `files`?**  
A lock is a different kind of thing from a file. Files are permanent records. A lock
is a temporary state that is created on checkout and destroyed on check-in. Putting
transient state in the same row as permanent data violates single responsibility and
makes queries harder. A separate table also makes "find all currently checked-out files"
a simple `SELECT * FROM locks` rather than a full-table scan of `files`.

---

## Part 2 — Curriculum

### Structure

The curriculum has five phases. Each phase ends with a system that is fully
operational at the scope of that phase. Each lesson ends with working, runnable
software. Nothing is built in isolation.

**Phase 1 — Foundations (Lessons 01–06)**  
The student can see the shell of Vault and understands how all four layers fit together
before a single real feature is written. Every tool, every file, every command is
taught from scratch.

**Phase 2 — Identity (Lessons 07–10)**  
A user can enter a PAT, Vault validates it against GitLab, and the user's identity
appears in the UI. The student understands HTTP, authentication, tokens, and what
it means to trust an external identity provider.

**Phase 3 — The File Tree (Lessons 11–15)**  
A user can browse all files in a GitLab project from inside Vault. The student
understands the GitLab API, pagination, error handling, and tree data structures.

**Phase 4 — Checkout and Check-in (Lessons 16–23)**  
The core PDM feature: exclusive checkout, WIP saves, committed check-in, version
history, lock release. The student understands optimistic locking, race conditions,
database transactions, and why business logic must live in one place.

**Phase 5 — Polish and Extension (Lessons 24–30)**  
Search, file-type conventions config, daily backup schedule, UI polish, packaging
the Electron app for distribution. The student understands how to add features to
a layered architecture without touching existing code.

---

### Phase 1 — Foundations

---

#### Lesson 01 — The Shell

**What you will build:**  
An Electron window that displays a hardcoded file name and a status badge ("Checked In").
Nothing works yet. But the four-layer architecture is in place, the folder structure is
established, every tool is installed and explained, and you can run the app with one
command.

**CS concepts introduced:** Process model (main vs renderer), IPC, event loop  
**SE concepts introduced:** Layered architecture, separation of concerns, project structure  
**Tools introduced:** Node.js, npm, Electron, TypeScript, Vite, git  
**Security introduced:** Electron's context isolation — why the renderer cannot directly
access Node.js APIs (the attack surface of a desktop app that renders web content)

**Sections:**
1. What version control is and why this project starts with a git commit
2. What Node.js is and what npm does
3. Creating the project — `npm init`, explaining every field in `package.json`
4. Installing Electron — what it is, what the main process and renderer process are,
   why they are separate (security model)
5. Installing TypeScript and Vite — what each does, why both are needed
6. The folder structure: `src/main/`, `src/renderer/`, `src/api/`, `src/domain/`,
   `src/data/` — one folder per layer, explained before any code is written
7. The main process: opening a window, explaining `BrowserWindow`, `app.whenReady`
8. The renderer: a React component showing a hardcoded filename and badge
9. Running the app: `npm run dev`, explaining what Vite and Electron do when this runs
10. Definition of done: app opens, hardcoded file is visible, first git commit made

---

#### Lesson 02 — The API Layer Skeleton

**What you will build:**  
The Express server starts inside the Electron main process. The renderer fetches
`/api/health` and displays "API: connected" in the UI. The student can see the
two processes talking to each other.

**CS concepts introduced:** HTTP request/response cycle, TCP/IP at a conceptual level,
client/server model  
**SE concepts introduced:** API as a contract, the single responsibility of the API layer  
**Tools introduced:** Express, `fetch` API in the renderer, ports and localhost  
**Security introduced:** Why the Express server binds to `127.0.0.1` (loopback only),
not `0.0.0.0` (all interfaces) — prevents other machines on the network from hitting
the API

**Sections:**
1. What HTTP is — request and response, methods (GET, POST), status codes
2. What Express is and what problem it solves
3. Installing Express and its TypeScript types
4. Writing the first route: `GET /api/health`
5. Starting Express in the Electron main process — why here, not in the renderer
6. What a port is, what localhost means, why we bind to 127.0.0.1
7. Writing the fetch call in the renderer — explaining the `fetch` API
8. Displaying the result — introducing React `useState` and `useEffect`
9. What would break if the API ran in the renderer process (SE lens)
10. Definition of done: "API: connected" visible in app window

---

#### Lesson 03 — PostgreSQL and the Data Layer

**What you will build:**  
The Express server connects to PostgreSQL. The health endpoint now queries the
database and returns its version. The UI shows "API: connected | DB: PostgreSQL 16".

**CS concepts introduced:** Relational databases, tables, rows, SQL, connection pooling  
**SE concepts introduced:** Data layer as a boundary, the repository pattern (introduced
by name, implemented in lesson 16)  
**Tools introduced:** PostgreSQL, psql, pg (node-postgres), database connection strings  
**Security introduced:** Connection strings and secrets — why the database password
is never hardcoded, introducing `.env` files and why `.env` is in `.gitignore`

**Sections:**
1. What a relational database is — tables, rows, columns, relationships
2. Installing PostgreSQL — what `psql` is, connecting locally
3. Creating the Vault database and user
4. What a connection string is and every part of it
5. `.env` files — what they are, why secrets go here, what dotenv does
6. Why `.env` is in `.gitignore` (and what `.gitignore` is if this is first appearance)
7. Installing `pg` — what node-postgres does, what a connection pool is and why it
   exists (opening a new TCP connection per query is expensive — pools reuse connections)
8. Writing the database module — `src/data/database.ts`
9. Updating the health endpoint to query `SELECT version()`
10. Definition of done: DB version visible in UI, no secrets in git history

---

#### Lesson 04 — The Domain Layer and TypeScript Types

**What you will build:**  
The domain layer gets its first module: `src/domain/files.ts`. It exports a `File` type
and a `getFile` function that returns a hardcoded file object. The API layer calls it.
The renderer displays the returned file. This is the first time all four layers pass
data end-to-end.

**CS concepts introduced:** Type systems, static vs dynamic typing, structural typing  
**SE concepts introduced:** Domain layer as the home of business rules, types as
executable documentation, the difference between a data model and a domain model  
**Tools introduced:** TypeScript types, interfaces, `tsc`, type errors in the editor  
**Security introduced:** Type safety as a security property — how TypeScript prevents a
class of injection where unexpected data types reach business logic

**Sections:**
1. What TypeScript is and why we use it (vs plain JavaScript)
2. The `File` type — every field, every type annotation, every decision
3. What an interface is vs what a type alias is — when to use each
4. The `getFile` function — hardcoded return, explaining the return type annotation
5. How the API layer imports from the domain layer (import explained as a dependency
   declaration — what the API layer now depends on)
6. The renderer displaying the returned object — destructuring explained at first use
7. Reading a TypeScript type error — how to find it, how to read it, how to fix it
8. Definition of done: all four layers running, real file object visible in UI

---

#### Lesson 05 — Running the Database Migrations

**What you will build:**  
All five tables from the data model are created in PostgreSQL using a migration script.
The student can inspect the tables with `psql`. The app still shows the hardcoded file,
but the database now has the correct structure for everything that follows.

**CS concepts introduced:** Schema, migration, idempotency  
**SE concepts introduced:** Database migrations as version-controlled code, why
migrations are committed to git (the schema is part of the codebase)  
**Tools introduced:** SQL DDL (`CREATE TABLE`, `REFERENCES`, `UNIQUE`), `psql` commands  
**Security introduced:** UUID primary keys — the IDOR vulnerability class, why
sequential integers are dangerous

**Sections:**
1. What a schema is — the shape of the data before the data exists
2. What a migration is — a versioned, irreversible change to the schema
3. Why migrations are committed to git (the schema must match the code at every version)
4. Writing the migration: every table from the data model, every column explained
5. `CREATE TABLE` syntax — every clause, every constraint
6. `REFERENCES` and foreign keys — what they enforce, what happens on violation
7. `UNIQUE` constraints — what they enforce (one lock per file)
8. UUID columns — why UUIDs, the IDOR explanation
9. Running the migration: `psql -f migrations/001_initial_schema.sql`
10. Inspecting with psql: `\dt`, `\d files` — reading the output
11. Definition of done: all five tables exist, student can describe every column

---

#### Lesson 06 — The Complete Skeleton (Phase 1 Review)

**What you will build:**  
A comprehensive review lesson. No new features. The student traces a single request
from the UI button click, through the API layer, through the domain layer, to the data
layer and back. Every connection is made explicit. The student writes the architecture
diagram themselves (in ASCII, in a markdown file, committed to git).

**CS concepts introduced:** Call stack tracing, request lifecycle  
**SE concepts introduced:** Architecture as a first-class deliverable, the cost of
coupling (what the mud looks like — and why this structure prevents it)  
**Tools introduced:** Browser devtools Network tab (for inspecting the HTTP request),
Electron devtools  
**Security introduced:** What "attack surface" means — the sum of all entry points.
The renderer cannot reach the database directly. The API layer is the only entry point
to the domain and data layers. This is not an accident — it is a security decision.

**Sections:**
1. The architecture diagram exercise — student draws the four layers and labels each
   connection with what data flows across it
2. Tracing the health check: click → fetch → Express route → domain function →
   pg query → response → useState → render
3. What the ball-of-mud antipattern looks like (named and described) — and which
   specific properties of this architecture prevent it
4. Adding a `GET /api/files/:id` route — the first "real" route, using the hardcoded
   domain function from lesson 04
5. The connection to the previous system: "The system you had before had no layers.
   Every change touched everything. Here, adding a route touches only the API layer."
6. Definition of done: student has written and committed the architecture document

---

### Phase 2 — Identity

---

#### Lesson 07 — What Authentication Means

**What you will build:**  
A "Connect to GitLab" screen in the Electron UI. The user can type a PAT and click
Connect. Nothing is validated yet — the token is just stored in React state. But
the screen exists and the form works.

**CS concepts introduced:** Authentication vs authorisation (distinct concepts),
tokens as credentials, stateless vs stateful identity  
**SE concepts introduced:** The login screen as its own vertical slice, why auth
is built before the features it protects  
**Security introduced:** What a Personal Access Token is, how GitLab generates one,
what scopes are (principle of least privilege — request only the permissions you need),
why PATs must never be logged, stored in plaintext, or committed to git

**Sections:**
1. Authentication (who are you?) vs authorisation (what can you do?) — the distinction
   is fundamental and named precisely
2. What a Personal Access Token is — a string that proves identity, scoped to
   specific capabilities, revocable
3. GitLab PAT scopes — what `read_api`, `read_repository`, `write_repository` mean,
   why Vault needs each one
4. The principle of least privilege — only request the scopes you need
5. Building the Connect screen — a text input and a button
6. Why `type="password"` on the PAT input (prevents shoulder surfing, prevents the
   browser from logging the value)
7. Where the token lives right now (React state) and why that is temporary
8. What would go wrong if the token were logged to the console (concrete attack)
9. Definition of done: Connect screen renders, typing in the input works

---

#### Lesson 08 — Validating the Token Against GitLab

**What you will build:**  
The API layer adds a `POST /api/auth/connect` route. When the user clicks Connect,
the token is sent to this endpoint. The Express server calls `GET /api/v4/user` on
the GitLab API with the token. If the response is 200, the user's name appears in
the UI. If not, an error message appears.

**CS concepts introduced:** HTTP POST, request bodies, JSON, the GitLab REST API,
HTTP status codes in detail (200, 401, 403, 404, 500)  
**SE concepts introduced:** Proxying an external API through your own API layer (why
the renderer never calls GitLab directly — the API layer is the single exit point),
error handling as a first-class concern  
**Security introduced:** Why the PAT is sent in the request body, not a URL parameter
(URL parameters appear in logs; request bodies do not by default). The confidentiality
of tokens in transit.

**Sections:**
1. What a POST request is — sending data to a server vs requesting data from it
2. JSON — what it is, `JSON.stringify` and `JSON.parse`, why HTTP uses it
3. What the GitLab REST API is — a collection of endpoints that expose GitLab's data
4. The `GET /api/v4/user` endpoint — what it returns, what it requires
5. Making an HTTP request from Node.js — introducing `node-fetch` or the native
   `fetch` in Node 18+
6. Authorization headers — `Authorization: Bearer <token>`, why `Bearer` is the convention
7. Reading the response: success path, 401 (invalid token), 403 (valid but no scope),
   network error
8. Sending the user's identity back to the renderer
9. Why the renderer never calls GitLab directly (SE lens: the API layer owns all
   external communication)
10. Definition of done: connect with a real GitLab PAT, see your name in the UI

---

#### Lesson 09 — Storing Identity in the Database

**What you will build:**  
When authentication succeeds, the user record is written to the `users` table (or
updated if the user already exists). The user's UUID from PostgreSQL becomes their
identity inside Vault. Every subsequent operation uses this UUID.

**CS concepts introduced:** Upsert, idempotency, UUID generation  
**SE concepts introduced:** The separation between external identity (GitLab user ID)
and internal identity (Vault UUID) — why they are different  
**Security introduced:** Why we store the GitLab user ID but not the PAT in the
database. The PAT is a credential; it does not belong in persistent storage.

**Sections:**
1. What an upsert is — insert if new, update if existing, explained at SQL level
2. The `ON CONFLICT DO UPDATE` clause in PostgreSQL
3. Generating a UUID in Node.js — `crypto.randomUUID()`
4. Why Vault has its own UUID separate from the GitLab user ID
5. Writing the `upsertUser` function in `src/data/users.ts`
6. Why the PAT is NOT stored — what would happen if it were (breach scenario)
7. The domain function `src/domain/auth.ts` — orchestrating the GitLab call and the
   database write
8. Definition of done: after connect, query `SELECT * FROM users` in psql and see
   the row

---

#### Lesson 10 — Sessions: Staying Logged In

**What you will build:**  
After connecting, the user stays logged in when they close and reopen the Vault app.
Vault stores a session token in Electron's secure storage. On launch, Vault checks
for a stored session and if valid, skips the connect screen.

**CS concepts introduced:** Session vs token, persistence vs memory, symmetric encryption  
**SE concepts introduced:** The session layer as a cross-cutting concern, where session
state lives in a layered architecture  
**Security introduced:** Electron's `safeStorage` API — how it encrypts values at
rest using the OS keychain (macOS Keychain, Windows DPAPI, Linux Secret Service).
Why we use the OS keychain rather than a file or localStorage.

**Sections:**
1. What a session is — a record that this user has already authenticated
2. Why we cannot store the PAT in plain text — the threat of file system access
3. Electron's `safeStorage` — what it does, which OS primitives it uses
4. Creating a Vault session token — a UUID generated on login, stored encrypted
5. The session validation flow on app launch
6. The logout flow — deleting the session token
7. What would break without safe storage (concrete attack: attacker reads app data
   folder)
8. Definition of done: close and reopen app, still logged in without re-entering PAT

---

### Phase 3 — The File Tree

---

#### Lesson 11 — Connecting to a GitLab Project

**What you will build:**  
After login, the user can enter a GitLab project ID or URL. Vault fetches the project
details and displays the project name. The selected project is persisted in the database.

**CS concepts introduced:** REST API pagination, rate limiting  
**SE concepts introduced:** Configuration as data (the user's selected project is
stored, not hardcoded), the workspace concept  
**Tools introduced:** GitLab Projects API  
**Security introduced:** Validating that the authenticated user actually has access
to the requested project before storing it — the authorisation check

---

#### Lesson 12 — Fetching the File Tree

**What you will build:**  
The file tree panel shows all files and folders in the GitLab project, fetched from
the GitLab Repository Trees API. Folders can be expanded and collapsed.

**CS concepts introduced:** Tree data structures, recursive rendering, depth-first
traversal  
**SE concepts introduced:** The difference between the GitLab file tree (source of
truth) and the Vault database (metadata overlay)  
**Tools introduced:** GitLab Repository Trees API, recursive React components

---

#### Lesson 13 — Syncing the File Tree to the Database

**What you will build:**  
When the file tree is fetched, Vault upserts all files into the `files` table. This
creates the metadata records that will later hold lock and version information.

**CS concepts introduced:** Database sync patterns, the difference between a cache
and a source of truth  
**SE concepts introduced:** GitLab as the file content source of truth, PostgreSQL
as the metadata source of truth — each doing what it does best

---

#### Lesson 14 — Showing Lock Status on the Tree

**What you will build:**  
The file tree shows a badge next to each file: "Available" or "Checked Out by [name]".
This queries the `locks` table. A file with a lock record shows who holds it.

**CS concepts introduced:** JOIN queries, the left join pattern for optional
relationships  
**SE concepts introduced:** Status as a derived property (the file's status is
derived from the lock table, not stored on the file)

---

#### Lesson 15 — Error Handling and Loading States

**What you will build:**  
Every API call in the file tree has a loading state (spinner) and an error state
(error message with a retry button). No API call is allowed to silently fail.

**CS concepts introduced:** State machines for UI state (idle / loading / success /
error — four states, not a boolean)  
**SE concepts introduced:** Error handling as a design obligation, not an afterthought.
The rule: every function that can fail must have a return type that expresses that
possibility.

---

### Phase 4 — Checkout and Check-in

---

#### Lesson 16 — The Checkout Domain Function

**What you will build:**  
`src/domain/checkout.ts` — the `checkoutFile` function. It enforces the rule: a file
can only be checked out if no lock record exists for it. If a lock exists, it returns
an error. This function contains no HTTP, no React, no Electron — only business logic.

**CS concepts introduced:** Pure functions, the repository pattern (the domain
function receives a data access object rather than importing the database directly)  
**SE concepts introduced:** Domain logic isolation — the checkout rule lives in exactly
one place. This is the single responsibility principle in its most important application.  
**Security introduced:** The TOCTOU (time-of-check to time-of-use) race condition —
checking availability and then inserting the lock are not atomic. Introduced here,
solved in lesson 17.

---

#### Lesson 17 — Atomic Locking with Database Transactions

**What you will build:**  
The checkout operation uses a PostgreSQL transaction with a row-level lock
(`SELECT FOR UPDATE`) to make the check-and-lock operation atomic. The TOCTOU race
condition is closed.

**CS concepts introduced:** Database transactions (ACID), atomicity, row-level locking,
race conditions, mutual exclusion  
**SE concepts introduced:** The database as the arbiter of concurrent state — why
the application layer cannot reliably enforce exclusivity without database-level locks

---

#### Lesson 18 — The Checkout API Route and UI

**What you will build:**  
`POST /api/files/:id/checkout` — the API route that calls the domain function.
The file tree shows a "Check Out" button on available files. After checkout, the
file row shows the user's name and a "Check In" button.

**CS concepts introduced:** HTTP POST vs GET for state-changing operations, idempotency  
**SE concepts introduced:** The API layer as a thin coordinator — it validates the
request, calls the domain, and returns the result. No business logic here.

---

#### Lesson 19 — Downloading the File

**What you will build:**  
After checkout, the user can download the file to their local machine. Vault fetches
the file content from the GitLab API and saves it to a user-chosen directory via
Electron's dialog API.

**CS concepts introduced:** Binary vs text file transfer, base64 encoding (GitLab API
returns file content as base64), Electron's main/renderer IPC for file system access  
**SE concepts introduced:** The renderer cannot write to the file system — only the
main process can. This is a forced architectural boundary.  
**Security introduced:** Path traversal — validating that the download path is within
the expected directory

---

#### Lesson 20 — WIP Snapshots

**What you will build:**  
A "Save WIP" button. Vault reads the modified file from disk, commits it to a
dedicated WIP branch in GitLab, and records the snapshot SHA in `wip_snapshots`.
WIP saves are separate from the committed version history.

**CS concepts introduced:** Git branches, commit SHAs as content-addressable identifiers  
**SE concepts introduced:** WIP as a staging area — the same concept as git's index,
applied to the PDM workflow. The WIP branch is never merged; it is discarded on
check-in.

---

#### Lesson 21 — The Check-in Flow

**What you will build:**  
The complete check-in: upload the file to GitLab (creating a new commit on the
default branch), write a version record to PostgreSQL, delete the lock record,
delete the WIP branch. The file is now available for others to check out.

**CS concepts introduced:** The GitLab Commits API, multi-step operations and
failure modes  
**SE concepts introduced:** The check-in as a transaction spanning two systems
(GitLab and PostgreSQL) — what happens if GitLab succeeds but the database write
fails, and how to design for this (idempotent recovery)

---

#### Lesson 22 — Version History Panel

**What you will build:**  
A history panel that shows every committed version of a file: who committed it,
when, and the commit message. Any version can be downloaded.

**CS concepts introduced:** JOIN across three tables (files, versions, users),
ordering, the linked-list structure of git history  
**SE concepts introduced:** Read models — the history panel is read-only. It does
not share code with the write path (checkout/check-in). Read and write paths are
separate for a reason.

---

#### Lesson 23 — Phase 4 Review: The Full Checkout Cycle

**What you will build:**  
A review lesson. The student performs a complete cycle — check out, WIP save,
check in — and traces every database write, every API call, every UI state change.
The student writes a sequence diagram (in ASCII) showing the full flow.

---

### Phase 5 — Polish and Extension

---

#### Lesson 24 — Search

**What you will build:**  
A search bar that finds files by name or path. PostgreSQL full-text search with `ILIKE`.
Results appear as you type (debounced).

**CS concepts introduced:** Full-text search, the `ILIKE` operator, debouncing
(rate-limiting UI events)

---

#### Lesson 25 — File Type Conventions

**What you will build:**  
A settings screen where the admin can define which file extensions Vault manages and
how they are categorised. Stored in a `file_type_conventions` table. The file tree
uses this configuration to show appropriate icons and filter options.

**SE concepts introduced:** Configuration as data — the system's behaviour is driven
by a database record, not by hardcoded strings. Adding a new file type requires no
code change.

---

#### Lesson 26 — Daily WIP Backup Schedule

**What you will build:**  
A background job (using `node-cron`) that runs at midnight and saves a WIP snapshot
for every currently checked-out file. Snapshots older than 30 days are deleted.

**CS concepts introduced:** Cron jobs, scheduled execution, retention policies  
**SE concepts introduced:** Background jobs as a separate concern from the request
cycle — the scheduler is not part of the API layer

---

#### Lesson 27 — Notifications (In-App)

**What you will build:**  
When a file you are waiting for is checked in by another user, a notification appears
in the Vault UI. Implemented using server-sent events (SSE) from the Express server
to the renderer.

**CS concepts introduced:** Server-sent events, long-polling vs SSE vs WebSockets
(comparison and when to use each)

---

#### Lesson 28 — Audit Log

**What you will build:**  
Every checkout, check-in, and WIP save is recorded in an `audit_log` table. An admin
screen shows the full history of who did what and when.

**SE concepts introduced:** The audit log as an append-only write — no audit record
is ever updated or deleted. Immutability as a security and compliance property.

---

#### Lesson 29 — Packaging and Distribution

**What you will build:**  
The Electron app is packaged into a distributable installer (`.dmg` for macOS,
`.exe` for Windows) using `electron-builder`. The student understands what "code
signing" is and why unsigned apps trigger OS security warnings.

**Tools introduced:** `electron-builder`, code signing concepts, the difference
between a dev build and a production build

---

#### Lesson 30 — The Extension Exercise

**What you will build:**  
The student picks one feature from the out-of-scope list (BOM linking, webhook
notifications, role-based access control, or another of their choosing) and designs
the extension: the new database tables, the new domain functions, the new API routes,
the new UI. They implement it from scratch, applying every principle from the curriculum.

**SE concepts introduced:** The open/closed principle as the closing lesson — adding
a feature that touches only new code, never modifying what already works. This is the
proof that the architecture was built correctly.

---

## Part 3 — Concepts Taught By Lesson

This index shows when each major concept is first introduced.

| Concept | First Introduced |
|---|---|
| Git and version control | Lesson 01 |
| Node.js and npm | Lesson 01 |
| Electron: main vs renderer process | Lesson 01 |
| TypeScript | Lesson 01 |
| Vite | Lesson 01 |
| Layered architecture | Lesson 01 |
| HTTP request/response | Lesson 02 |
| Express | Lesson 02 |
| Ports and localhost | Lesson 02 |
| React useState and useEffect | Lesson 02 |
| PostgreSQL and SQL | Lesson 03 |
| Connection pooling | Lesson 03 |
| `.env` files and secrets | Lesson 03 |
| TypeScript types and interfaces | Lesson 04 |
| Static typing and type errors | Lesson 04 |
| Database schema and migrations | Lesson 05 |
| UUID primary keys and IDOR prevention | Lesson 05 |
| Foreign keys and constraints | Lesson 05 |
| Authentication vs authorisation | Lesson 07 |
| Personal Access Tokens | Lesson 07 |
| Principle of least privilege | Lesson 07 |
| REST APIs | Lesson 08 |
| JSON | Lesson 08 |
| HTTP status codes | Lesson 08 |
| Authorization headers | Lesson 08 |
| Upsert and idempotency | Lesson 09 |
| Sessions and session storage | Lesson 10 |
| OS keychain / safeStorage | Lesson 10 |
| Tree data structures | Lesson 12 |
| Recursive rendering | Lesson 12 |
| JOIN queries | Lesson 14 |
| UI state machines | Lesson 15 |
| Pure functions | Lesson 16 |
| Repository pattern | Lesson 16 |
| TOCTOU race condition | Lesson 16 |
| Database transactions and ACID | Lesson 17 |
| Row-level locking | Lesson 17 |
| IPC in Electron | Lesson 19 |
| Base64 encoding | Lesson 19 |
| Path traversal | Lesson 19 |
| Git branches and SHAs | Lesson 20 |
| Multi-system transactions | Lesson 21 |
| Full-text search | Lesson 24 |
| Debouncing | Lesson 24 |
| Configuration as data | Lesson 25 |
| Cron jobs | Lesson 26 |
| Server-sent events | Lesson 27 |
| Append-only / audit logs | Lesson 28 |
| Electron packaging and code signing | Lesson 29 |
| Open/closed principle (closing) | Lesson 30 |

---

## Part 4 — The Architecture Rule

This rule is stated at the start of the curriculum and repeated at the start of
every phase. It is the single most important thing the curriculum teaches.

**Every piece of code has a home. The home is determined by what the code knows about.**

- If it knows about HTTP requests and responses → API layer
- If it knows about business rules (who can check out, what makes a valid version) → Domain layer
- If it knows about SQL or the GitLab API → Data layer
- If it knows about the DOM, React, or what the user sees → Presentation layer

A piece of code that knows about two layers is in the wrong place. The ball of mud
is not a failure of effort — it is the result of code that was never given a home.
When everything can touch everything, debugging requires understanding everything at
once. When each layer has a single responsibility, a bug in the checkout flow is a
domain layer bug. Full stop.
