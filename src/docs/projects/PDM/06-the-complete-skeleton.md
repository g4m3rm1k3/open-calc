# Vault PDM — Lesson 06 — The Complete Skeleton (Phase 1 Review)

## What You Will Build

No new features. The student traces a single API request — `GET /api/files/:id` —
from the renderer's `fetch` call, through the Express route, through the domain
function, and back. The architecture diagram is drawn in ASCII and committed to git.
The Electron Network tab is opened and the HTTP request is inspected live.

## What You Need to Know First

Lessons 01–05. The full four-layer skeleton is in place. This is a synthesis lesson —
the goal is understanding, not adding code.

---

## The Problem

Code can be written without being understood. When lessons move fast, it is easy to
type the code and proceed without being able to explain it. This lesson forces the
synthesis: before adding phase 2 (identity), every connection made in phase 1 must
be traceable by hand.

This is also the lesson where the contrast with the ball-of-mud antipattern is made
concrete. The previous system could not be traced this way — there was no defined
path to follow. In Vault, every request has a defined path through defined layers.

---

## Step 1 — The Architecture Diagram Exercise

### The task

Open a new file: `docs/architecture.md`. Draw the four layers as a diagram, then
label every connection with what data flows across it and in which direction. Do this
from memory first, then verify against the code.

```markdown
# Vault Architecture

## Four Layers

┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER  (src/renderer/)                 │
│  Technology: React + TypeScript                      │
│  Knows about: DOM, React, HTML, user events          │
│  Does NOT know about: SQL, HTTP methods, business rules│
├─────────────────────────────────────────────────────┤
│  ← fetch('http://localhost:3001/api/files/:id')      │
│  → response.json() → VaultFile object               │
├─────────────────────────────────────────────────────┤
│  API LAYER  (src/api/)                              │
│  Technology: Express + TypeScript                    │
│  Knows about: HTTP methods, request/response, URLs  │
│  Does NOT know about: SQL, business rules            │
├─────────────────────────────────────────────────────┤
│  ← getFile(id: string)                              │
│  → VaultFile                                        │
├─────────────────────────────────────────────────────┤
│  DOMAIN LAYER  (src/domain/)                        │
│  Technology: TypeScript only                         │
│  Knows about: business rules, domain types          │
│  Does NOT know about: HTTP, SQL, React              │
├─────────────────────────────────────────────────────┤
│  ← query('SELECT * FROM files WHERE id = $1', [id]) │
│  → { rows: [{ id, file_path, ... }] }               │
├─────────────────────────────────────────────────────┤
│  DATA LAYER  (src/data/)                            │
│  Technology: pg + PostgreSQL                         │
│  Knows about: SQL, PostgreSQL, connection pooling   │
│  Does NOT know about: HTTP, React, business rules   │
└─────────────────────────────────────────────────────┘
```

**The "does NOT know about" constraint — why it matters:**
Each layer's "does NOT know about" list is as important as what it does know about.
The domain layer never imports from Express. The API layer never imports pg directly.
The renderer never calls `pool.query()`. These prohibitions are not style preferences
— they are enforced by the import structure. If `src/domain/checkout.ts` imports
from `express`, a domain rule has become an HTTP handler. The domain layer can no
longer be tested without a running HTTP server.

**CS lens — dependency graph:**
The imports between modules form a **directed graph**. Good architecture keeps this
graph **acyclic** (no cycles) and **directional** (dependencies only flow downward
through layers). A cycle — where module A imports from module B and module B imports
from module A — means neither can be understood or tested in isolation. All tools
that check for import cycles (`eslint-plugin-import`, TypeScript project references)
are detecting violations of this principle.

---

## Step 2 — Tracing a Request by Hand

### The request: `GET /api/files/housing-001`

Follow this path through the code, reading each file:

**Step 1 — The renderer initiates:**
`src/renderer/App.tsx`, line ~25:
```typescript
fetch(`http://localhost:3001/api/files/${HARDCODED_FILE_ID}`)
```
The renderer sends an HTTP GET request to the Express server. This is a browser
`fetch` call. It does not know what is behind the URL — it only knows the URL and
expects a response.

**Step 2 — The HTTP request travels to the Express server:**
The Electron main process is running an Express server on `localhost:3001`. The
request arrives at Express's internal router. Express compares the incoming URL
(`/api/files/housing-001`) against all registered routes.

**Step 3 — Express matches the route:**
`src/api/server.ts`:
```typescript
app.get('/api/files/:id', async (request, response) => {
  const { id } = request.params  // id = 'housing-001'
```
Express matches `/api/files/:id` because the URL has the correct prefix and a
segment after `/api/files/`. It extracts `id = 'housing-001'` from the URL.

**Step 4 — The API layer calls the domain layer:**
```typescript
  const file = getFile(id)
```
The API layer calls the domain function `getFile` with the extracted ID. This is the
only thing the API layer does: extract parameters, call domain, return the result.
No business logic lives here.

**Step 5 — The domain layer returns a VaultFile:**
`src/domain/files.ts`:
```typescript
export function getFile(id: string): VaultFile {
  return { id, name: 'housing-v3.step', ... }
}
```
The domain function returns a typed `VaultFile` object. Currently hardcoded; will
query the database in lesson 13. The domain layer does not know this call came via
HTTP.

**Step 6 — The API layer serialises and responds:**
```typescript
  response.json(file)
```
`response.json(file)` serialises the `VaultFile` object to JSON text and sends it
as the HTTP response with status `200 OK` and `Content-Type: application/json`.

**Step 7 — The renderer receives and renders:**
The fetch Promise resolves with the `Response`. `.then(r => r.json())` parses the
JSON back into a JavaScript object. `setFile(data)` updates React state. React
re-renders `FileRow` with the file data.

**The complete trace:**
```
fetch('/api/files/housing-001')     [renderer, browser]
  │  HTTP GET /api/files/housing-001
  ▼
Express router matches /api/files/:id  [API layer, main process]
  │  getFile('housing-001')
  ▼
getFile returns VaultFile              [domain layer, main process]
  │  VaultFile → response.json()
  ▼
HTTP 200 { id, name, status, ... }     [API layer → network]
  │  response.json() → VaultFile
  ▼
setFile(data) → FileRow renders        [renderer, browser]
```

---

## Step 3 — The Electron Network Tab

### Opening developer tools

In the running Vault app: `View` menu → `Toggle Developer Tools` (or `Cmd+Option+I`
on Mac, `Ctrl+Shift+I` on Windows/Linux).

**The Network tab — first appearance:**
The Network tab in browser/Electron developer tools records every HTTP request made
by the renderer. Each row shows:
- **Name** — the URL path (e.g., `/api/files/housing-001`)
- **Method** — GET, POST, etc.
- **Status** — the HTTP status code (200, 404, 500, etc.)
- **Time** — how long the round trip took

Click on a request row to see:
- **Headers** tab — the request headers (what the client sent) and response headers
  (what the server sent back), including `Content-Type: application/json`
- **Response** tab — the raw response body: the JSON string the server sent
- **Preview** tab — the JSON parsed into a collapsible tree

**What to observe:**
- The `api/health` request appears on app load — triggered by `useEffect`
- The `api/files/housing-001` request appears immediately after
- The Response tab shows the exact JSON the domain function returned
- The Status column shows `200` — if you introduce an error, it changes to `500`

**How to simulate a failure:**
In `src/api/server.ts`, temporarily change the health route to `response.status(503).json({ status: 'error' })`. Reload the app. The Network tab shows `503` for the health request, and the status bar shows "API: connection failed."

---

## Step 4 — Adding the Architecture Rule to the Codebase

Create `src/domain/README.md` (this is the exception to the no-markdown-files rule —
this is a developer-facing note in the source directory):

```markdown
# Domain Layer

This directory contains all business logic for Vault.

## Architecture Rule

Domain modules may import from:
- Other domain modules
- The data layer (src/data/)
- External utility libraries (no HTTP, no Electron, no React)

Domain modules must NOT import from:
- src/api/ (no Express, no request/response)
- src/renderer/ (no React, no DOM)
- src/main/ (no Electron APIs)

If you are about to import from src/api/ in a domain module,
stop. The logic you are writing belongs in the domain layer,
not in the API layer. Move it here.
```

Create similar README files in `src/api/`, `src/renderer/`, and `src/data/` with
their equivalent rules. These files are the machine-readable explanation of the
architecture rule — the next person to work on this codebase reads them before
writing the first import.

---

## Step 5 — The Ball-of-Mud Contrast

### What the previous system looked like

In the previous system, a "checkout" operation might have code like this (paraphrased):
```javascript
async function handleCheckoutButtonClick(fileId) {
  // Business rule check mixed into React component:
  if (currentUser.role !== 'engineer') return
  
  // Database query in the UI layer:
  const existingLock = await db.query(`SELECT * FROM locks WHERE file_id = '${fileId}'`)
  
  if (existingLock.rows.length > 0) {
    // HTML construction mixed with data access:
    document.getElementById('status').innerHTML = `<b>Locked by: ${existingLock.rows[0].user}</b>`
    return
  }
  
  // GitLab API call mixed into a click handler:
  await axios.post(`https://gitlab.com/api/v4/projects/${projectId}/repository/files/${fileId}`)
}
```

**What is wrong with this:**
- The business rule (`role !== 'engineer'`) lives in the click handler — it cannot be
  tested without a DOM, a button, and a running browser
- The SQL query is directly in the UI — and uses string concatenation (SQL injection
  vulnerability: lesson 03)
- `innerHTML` renders untrusted data (XSS vulnerability: lesson 01)
- The GitLab API call is mixed in — if the API endpoint changes, the change must be
  found in every place it was called

**What the Vault architecture prevents:**
- Business rules live in `src/domain/` — testable without browser, HTTP, or DOM
- SQL queries live in `src/data/` — parameterised, isolated, testable
- GitLab API calls will live in `src/data/gitlab.ts` — one place, one change point
- The click handler in the renderer calls `fetch('/api/files/:id/checkout')` — it
  does not need to know anything else

**CS lens — cohesion and coupling:**
**Cohesion** is how closely related the things inside a module are. High cohesion:
a module's code all serves one purpose. Low cohesion: a module contains unrelated
things mixed together.

**Coupling** is how dependent modules are on each other. Low coupling: modules can
change independently. High coupling: changing one requires changing others.

Good software has **high cohesion** (each module is internally focused) and **low
coupling** (modules depend on each other as little as possible). The layered
architecture maximises cohesion (each layer has one job) and minimises coupling
(each layer only depends on the layer directly below it).

---

## Connect the Pieces

After lesson 06, the skeleton is complete. Every lesson from 07 onward adds real
features to the established structure:

```
Phase 2 (lessons 07–10): Auth domain module + users data module + renderer connect screen
Phase 3 (lessons 11–15): File tree domain module + gitlab data module + renderer file tree
Phase 4 (lessons 16–23): Checkout/check-in domain + lock data + download/upload + renderer checkout UI
Phase 5 (lessons 24–30): Search + conventions + cron + SSE + audit + packaging
```

Every lesson follows the same pattern: data layer, domain layer, API route, renderer
component — bottom to top, tested at each step.

---

## What Breaks Without This

**Without the architecture document:**
A new developer, or future-you after three months, reads the code and sees four
folders without knowing why they exist or what the rules are. The first time
something needs to be written in a hurry, it goes in the wrong place. The second
time, it goes in two wrong places. Within six months, the layered architecture exists
in the folder names but not in the import graph.

**Without the Network tab:**
Debugging a failed API call requires guessing. Is the request being sent? Is the URL
correct? Is the response body what you think? The Network tab answers all three
questions in one place. Every developer who works on networked software must know how
to use the Network tab. It is not an advanced tool — it is the minimum debugging setup
for any HTTP-based system.

---

## Definition of Done

- [ ] The architecture diagram is written in `docs/architecture.md` and committed
- [ ] README files exist in each `src/` subdirectory stating what the layer knows and does not know
- [ ] You can trace `GET /api/files/:id` through all four layers without looking at the code
- [ ] You can open the Electron Network tab and see both the health and file requests
- [ ] You can click the file request and read the response body in the Response tab
- [ ] You can explain high cohesion and low coupling with a concrete example from the code
- [ ] You can explain what the ball-of-mud antipattern is and name three specific problems it causes
- [ ] You can explain the dependency graph and why cycles are harmful
- [ ] Run:
      ```
      git add docs/ src/
      git commit -m "Add architecture documentation, layer README files, and Phase 1 complete skeleton review"
      ```

---

*Next: Lesson 07 — What Authentication Means. Phase 2 begins. A Connect to GitLab
screen appears. The user types a Personal Access Token. The form works; validation
comes in lesson 08.*
