# Vault PDM — Lesson 04 — The Domain Layer and TypeScript Types

## What You Will Build

The domain layer gets its first module: `src/domain/files.ts`. It exports a
`VaultFile` type and a `getFile` function that returns a hardcoded file object. The
API layer adds `GET /api/files/:id`. The renderer fetches this endpoint and displays
the returned file name and status. All four layers pass data end-to-end for the first
time — presentation → API → domain → (eventually) data.

## What You Need to Know First

Lessons 01–03. The Express server is running. The PostgreSQL connection is ready.
This lesson establishes the TypeScript type vocabulary that every subsequent lesson
uses. The `getFile` function is hardcoded now; lesson 05 adds the database tables it
will eventually query.

---

## The Problem

A PDM system manages files. "File" has a precise domain meaning: not just a filesystem
path, but a managed document with an identity, a version history, and a lock status.
Before writing any database query or UI component, we need a TypeScript type that
captures this meaning precisely.

Types are executable documentation. A TypeScript interface describes the shape of
data so precisely that the compiler verifies every place it is used. A type error
at compile time is always better than a null reference error at runtime — at runtime,
the machine is making parts.

---

## Step 1 — TypeScript Types in Depth

### The problem

TypeScript has two ways to define a type: `interface` and `type alias`. Understanding
when to use each prevents confusion throughout the curriculum.

**`interface` — first appearance:**
An `interface` declares an object shape:

```typescript
interface VaultFile {
  id:       string
  name:     string
  filePath: string
}
```

Interfaces can be extended:
```typescript
interface LockedFile extends VaultFile {
  lockedBy: string
}
```

Interfaces describe objects. They can also describe function shapes and class
contracts (`implements`). Interfaces are the TypeScript idiomatic way to describe
data structures that will be extended or implemented.

**`type` alias — first appearance:**
A type alias gives a name to any type expression:

```typescript
type FileStatus = 'available' | 'checked-out' | 'locked'
type FileId     = string
type Handler    = (request: Request) => Response
```

Type aliases can describe:
- Union types (as shown above)
- Primitive aliases (`type FileId = string`)
- Function types
- Intersections (`type AB = A & B`)

**When to use `interface` vs `type`:**
- Use `interface` for object shapes that describe domain entities (what a thing IS)
- Use `type` for unions, function signatures, and derived types (what a thing IS OR)
- If in doubt: `interface` for data structures, `type` for everything else

The TypeScript team's own guideline: use `interface` unless you need a feature that
only `type` provides (union, intersection, mapped types, conditional types).

**Static typing as a security property:**
TypeScript prevents a category of injection attack where unexpected data types reach
business logic. In JavaScript, `checkoutFile(null)` would silently fail somewhere
inside the function. In TypeScript, `checkoutFile` has a typed parameter; passing
`null` is a compile error. This prevents a class of "unexpected input" bugs before
they reach production.

---

## Step 2 — The VaultFile Type

### Create `src/domain/files.ts`

```typescript
export type FileStatus = 'available' | 'checked-out'

export interface VaultFile {
  id:          string
  name:        string
  filePath:    string
  fileType:    string
  status:      FileStatus
  checkedOutBy: string | null
  createdAt:   Date
}
```

**Each field of `VaultFile`:**

`id: string` — the UUID primary key. Typed as `string` because UUIDs are stored
and transmitted as strings. The UUID format constraint is enforced by the database
(lesson 05), not by TypeScript — TypeScript cannot verify the content of a string.

`name: string` — the human-readable filename. Derived from `filePath` by the
database query but stored separately for display and search efficiency.

`filePath: string` — the full path within the GitLab project: `/designs/housing/housing-v3.step`.
The leading `/` is a convention — paths in Vault always start with `/`.

`fileType: string` — the file extension category (`'STEP'`, `'PDF'`, `'DWG'`).
Determined by file-type conventions (lesson 25). Typed as `string` now; restricted
to an enum in lesson 25 when the conventions system exists.

`status: FileStatus` — the union type `'available' | 'checked-out'`. This is a
**derived property** — it is computed from whether a lock record exists for this file,
not stored as a column. The domain layer computes it by joining the `files` and
`locks` tables (lesson 14).

`checkedOutBy: string | null` — the username of whoever has the file checked out, or
`null` if available. The `string | null` union makes nullability explicit in the type
system. A TypeScript function that receives `VaultFile` knows it must handle the
`null` case before accessing `checkedOutBy`.

`createdAt: Date` — a JavaScript `Date` object. PostgreSQL `timestamptz` values are
converted to `Date` by the `pg` library automatically.

**`string | null` — nullability in TypeScript:**
With `"strictNullChecks": true` (enabled by `"strict": true`), TypeScript tracks
`null` and `undefined` as distinct values. A `string` can never be `null` unless
declared as `string | null`. This prevents a large category of runtime errors: reading
`checkedOutBy.toUpperCase()` when `checkedOutBy` is `null` would throw at runtime.
TypeScript enforces that you check for `null` before accessing properties.

---

## Step 3 — The First Domain Function

```typescript
export function getFile(id: string): VaultFile {
  return {
    id,
    name:          'housing-v3.step',
    filePath:      '/designs/housing/housing-v3.step',
    fileType:      'STEP',
    status:        'available',
    checkedOutBy:  null,
    createdAt:     new Date('2026-01-15'),
  }
}
```

**Why hardcoded for now:**
The `getFile` function returns a hardcoded object because the database tables do not
exist yet (they are created in lesson 05). Hardcoding allows testing the entire
end-to-end pipeline without a database dependency. Replace hardcoded returns as soon
as the real implementation is available — never leave them in production code.

**`id` as the shorthand property:**
`{ id, name: 'housing-v3.step', ... }` — when a local variable has the same name as
the object key, JavaScript allows `{ id }` as shorthand for `{ id: id }`. This is
the **property shorthand** syntax. The same rule applies to other fields if their
values are local variables.

**SE lens — the domain function's contract:**
`getFile(id: string): VaultFile` is a function contract. The caller provides an ID
and receives a `VaultFile`. The function does not accept `Request` objects, does not
import `express`, and does not care how the caller obtained the ID. The domain function
is isolated from HTTP — the API layer owns the translation from HTTP request to
domain function call.

This isolation is enforced by where the file lives: `src/domain/files.ts` imports
nothing from `src/api/`. The dependency direction is one-way: API → domain, never
domain → API.

---

## Step 4 — The API Route

### Update `src/api/server.ts`

```typescript
import { getFile } from '../domain/files.js'

app.get('/api/files/:id', async (request, response) => {
  const { id } = request.params

  try {
    const file = getFile(id)
    response.json(file)
  } catch (error) {
    response.status(404).json({
      error: 'File not found',
      id,
    })
  }
})
```

**`request.params` — first appearance:**
URL parameters are parts of the URL path preceded by `:`. In the route
`'/api/files/:id'`, `:id` matches any segment after `/api/files/`. If the request
is `GET /api/files/abc-123`, then `request.params.id` is `'abc-123'`.

**`const { id } = request.params` — destructuring:**
Object destructuring extracts a named property from an object into a local variable.
`const { id } = request.params` is equivalent to `const id = request.params.id`.
Destructuring is idiomatic in TypeScript for extracting specific properties from
objects. Multiple properties can be destructured at once: `const { id, name } = obj`.

**`response.status(404).json(...)` — the 404 response:**
404 Not Found is the correct status code when the requested resource does not exist.
The error response body includes the ID so the caller can diagnose which ID was invalid.
This is the convention for REST error responses: include enough context to debug the
problem without exposing internal system details (stack traces, database error messages).

---

## Step 5 — The Renderer Fetching a File

### Update `src/renderer/App.tsx`

```typescript
import { useState, useEffect } from 'react'
import type { VaultFile }       from '../../domain/files.js'
import './App.css'

const HARDCODED_FILE_ID = 'housing-001'

export default function App() {
  const [file, setFile] = useState<VaultFile | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`http://localhost:3001/api/files/${HARDCODED_FILE_ID}`)
      .then((response) => response.json())
      .then((data: VaultFile) => {
        if (!cancelled) setFile(data)
      })
      .catch(() => {
        if (!cancelled) console.error('Failed to fetch file')
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="app-shell">
      <header className="toolbar">
        <span className="app-name">Vault</span>
      </header>
      <main className="content">
        {file !== null ? (
          <FileRow file={file} />
        ) : (
          <p className="loading-text">Loading...</p>
        )}
      </main>
    </div>
  )
}

function FileRow({ file }: { file: VaultFile }) {
  return (
    <div className="file-row">
      <span className="file-name">{file.name}</span>
      <FileBadge status={file.status} checkedOutBy={file.checkedOutBy} />
    </div>
  )
}

function FileBadge({
  status,
  checkedOutBy,
}: {
  status:       VaultFile['status']
  checkedOutBy: VaultFile['checkedOutBy']
}) {
  if (status === 'available') {
    return <span className="badge badge--checked-in">Available</span>
  }
  return (
    <span className="badge badge--checked-out">
      Checked Out{checkedOutBy !== null ? ` — ${checkedOutBy}` : ''}
    </span>
  )
}
```

**`import type { VaultFile }` across layer boundaries:**
The renderer imports `VaultFile` from the domain layer — a type-only import. This is
the correct dependency for a type: the renderer needs to know the shape of data to
render it, but should not call domain functions directly (which would bypass the API
layer). `import type` enforces this: only the TypeScript type definition is imported;
no runtime domain code runs in the renderer.

**`VaultFile['status']` — indexed type access:**
`VaultFile['status']` is the type of the `status` property of `VaultFile` — which
resolves to `'available' | 'checked-out'`. This derives the prop type from the source
type directly, so if `FileStatus` ever gains a new value, `FileBadge`'s prop type
updates automatically without touching the component.

**`{file !== null ? ... : ...}` — conditional rendering:**
The ternary operator in JSX renders one of two subtrees based on a condition. `null`
(nothing selected, still loading) renders the loading text; a file renders `FileRow`.
This is the standard React pattern for optional content.

---

## Step 6 — Reading TypeScript Errors

### The problem

TypeScript errors appear in two places: the editor (inline squiggles) and the
terminal. Both must be understood.

**Anatomy of a TypeScript error:**

```
src/renderer/App.tsx:38:25 - error TS2339: Property 'checkedOutFrom' does not exist on type 'VaultFile'.
```

- `src/renderer/App.tsx:38:25` — the file, line, and column where the error is
- `TS2339` — the TypeScript error code. All TypeScript errors have numeric codes;
  searching "TS2339" shows the exact explanation and common fixes
- `Property 'checkedOutFrom' does not exist on type 'VaultFile'` — the message. The
  typo `checkedOutFrom` does not match `checkedOutBy`.

**How to find TypeScript errors in the terminal:**
When `npm run dev` runs Vite, TypeScript errors appear in the terminal output. Vite
shows them with file:line:column references. Clicking a terminal file reference in
VS Code opens the file at that line.

**The TypeScript error is not the bug — it is the symptom:**
TypeScript errors tell you that your code has a type inconsistency. The real question
is: which side is wrong? If `VaultFile` declares `checkedOutBy` and the component
tries to access `checkedOutFrom`, the component is wrong. If the API returns a field
named `checkedOutFrom` and the type says `checkedOutBy`, the type is wrong. TypeScript
tells you there is a disagreement; you determine which side has the correct intent.

---

## Connect the Pieces

The four-layer data flow for `GET /api/files/:id`:

```
Renderer: fetch('/api/files/housing-001')
  ──► API layer: request.params.id = 'housing-001'
  ──► Domain layer: getFile('housing-001') → VaultFile object
  ──► API layer: response.json(file)
  ──► Renderer: setFile(data) → FileRow renders file.name and status
```

The hardcoded `getFile` will be replaced in lesson 13 with a real database query.
The pipeline — API calling domain, domain returning typed data, renderer displaying
it — is unchanged. This is the value of the layered architecture: the plumbing is in
place before the real implementation exists.

---

## What Breaks Without This

**Without `string | null` for `checkedOutBy`:**
TypeScript infers `checkedOutBy: string` — non-nullable. Any code accessing
`file.checkedOutBy` can use it freely. When a real database query returns `null` (no
lock record), the renderer might render "Checked Out — null" or crash calling
`null.toUpperCase()`. Encoding nullability in the type catches this at compile time.

**Without `import type` in the renderer:**
If the renderer used `import { VaultFile }` (a runtime import), TypeScript would
allow it. But it creates a dependency from the renderer process (browser) to domain
code (Node.js). If the domain code ever uses a Node.js built-in (`fs`, `crypto`),
bundling it into the browser bundle would fail at build time — or worse, silently
produce incorrect behaviour. `import type` prevents this class of error by guaranteeing
no runtime code crosses the boundary.

---

## Definition of Done

- [ ] `GET /api/files/any-id` returns a JSON object matching the `VaultFile` shape
- [ ] The renderer displays the file name and status badge
- [ ] The badge shows "Available" (green) when `status === 'available'`
- [ ] You can deliberately misspell a field name (`file.naem`) and see a TypeScript error in the editor
- [ ] You can explain the difference between `interface` and `type` and when to use each
- [ ] You can explain what `string | null` means and why it is safer than just `string`
- [ ] You can explain what `VaultFile['status']` means and why it is better than repeating the type
- [ ] You can explain why the renderer uses `import type` rather than `import` for domain types
- [ ] Run:
      ```
      git add src/domain/ src/api/ src/renderer/
      git commit -m "Add domain layer: VaultFile type, getFile domain function, API route, all four layers connected end-to-end"
      ```

---

*Next: Lesson 05 — Running the Database Migrations. All five tables from the data
model are created in PostgreSQL with a SQL migration script. The schema is explained
field by field. UUID primary keys prevent the IDOR vulnerability.*
