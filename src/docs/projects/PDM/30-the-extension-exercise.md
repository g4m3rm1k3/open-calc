# Vault PDM — Lesson 30 — The Extension Exercise

## What You Will Build

You design and implement one feature from the out-of-scope list. You determine the
database tables, the domain functions, the API routes, and the renderer components.
You apply every principle from the curriculum. No feature implementation is provided
— this is the exercise.

## What You Need to Know First

Lessons 01–29. The entire Vault architecture. This lesson is the proof that you
understood it.

---

## The Open/Closed Principle — The Closing Lesson

**Open/closed principle — as the final lesson:**
The **open/closed principle** states: software entities should be open for extension
but closed for modification. Adding a new feature should require adding new code,
not changing existing code that already works.

Every phase of Vault demonstrated this:
- Phase 3 (file tree) added tree-fetching code. Phase 2 auth code was unchanged.
- Phase 4 (checkout) added checkout domain functions. Phase 3 tree code was unchanged.
- Phase 5 (search, conventions, backup, notifications, audit) each added new modules
  without touching the checkout cycle.

This is not accidental. It is the consequence of the layered architecture, the domain
functions, and the data layer isolation. When each piece has a single responsibility,
new responsibilities do not require existing pieces to change.

**CS lens — the principle in action:**
The open/closed principle is a consequence of good abstraction. When `checkoutFile`
depends on `atomicCheckout` (a data layer abstraction), and not directly on
`pool.query(...)`, the checkout domain function is closed: the implementation of
atomic locking can change (different SQL, different strategy) without touching
`checkoutFile`. Adding audit logging to `checkoutFile` is adding new code — calling
`writeAuditEntry` — not modifying the existing checkout logic.

---

## The Extension Options

Choose one:

---

### Option A — Bill of Materials (BOM) Linking

**What it is:** Files can be linked to each other as "parent–child" relationships.
A top-level assembly STEP file is the parent; its component STEP files are children.
The file tree shows an expand arrow on parent files that reveals the children.

**New tables:**
```sql
CREATE TABLE bom_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  child_id    UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, child_id)
);
```

**New domain module:** `src/domain/bom.ts`
- `linkFiles(parentId, childId, quantity)` — creates the link
- `getBoM(parentFileId)` — returns the full BOM tree recursively
- `getWhereUsed(childFileId)` — returns all assemblies using this file

**New API routes:**
- `POST /api/files/bom/link` — create a link
- `GET /api/files/:id/bom` — get the BOM for a file
- `GET /api/files/:id/where-used` — find all assemblies using a file

**Renderer:** A "BOM" tab in the version history panel. Tree view showing children.

**CS concept introduced:** Recursive SQL queries with `WITH RECURSIVE` (common table
expressions for tree traversal).

---

### Option B — Role-Based Access Control (RBAC)

**What it is:** Users have roles: `viewer` (read-only, no checkout), `engineer`
(full checkout/check-in), `admin` (can modify file type conventions, view audit log).
Role is stored per user per project.

**New tables:**
```sql
CREATE TYPE vault_role AS ENUM ('viewer', 'engineer', 'admin');

CREATE TABLE project_memberships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  project_id  INTEGER NOT NULL,
  role        vault_role NOT NULL DEFAULT 'viewer',
  UNIQUE (user_id, project_id)
);
```

**New domain module:** `src/domain/rbac.ts`
- `getUserRole(userId, projectId)` — returns the user's role
- `requireRole(userId, projectId, minimumRole)` — throws if the user lacks the role

**Integration:** `checkoutFile` calls `requireRole(userId, projectId, 'engineer')`
before checking out. `getAuditLog` calls `requireRole(userId, projectId, 'admin')`.

**Renderer:** A "Team" screen showing project members and their roles.

**CS concept introduced:** PostgreSQL `ENUM` types, middleware for role checking.

---

### Option C — Webhook Notifications

**What it is:** When a file is checked in, Vault sends an HTTP POST to a configured
webhook URL. The team's Slack, Teams, or custom system receives the notification.

**New tables:**
```sql
CREATE TABLE webhooks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL,
  url        TEXT NOT NULL,
  secret     TEXT NOT NULL,
  events     TEXT[] NOT NULL DEFAULT ARRAY['checkin'],
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**New data module:** `src/data/webhooks.ts`
- `getWebhooks(projectId, event)` — returns active webhooks for an event
- `deliverWebhook(webhook, payload)` — sends the HTTP POST with HMAC signature

**HMAC signature — security:**
The webhook is signed with `HMAC-SHA256` using the `secret`. The receiving server
verifies the signature to confirm the request came from Vault. Slack and GitHub both
use this pattern.

**Integration:** `checkinFile` calls `deliverWebhook` after check-in.

**Renderer:** A "Webhooks" settings screen. Add/remove webhook URLs.

**CS concept introduced:** HMAC (Hash-based Message Authentication Code), webhook
patterns, HTTP delivery with retry.

---

## The Design Exercise

Before writing a single line of code, document your design:

### 1 — Database Design
Draw the ERD (Entity Relationship Diagram) for your new tables. For each column:
- What type? Why?
- What constraints? Why?
- What indexes? Why?

Write the migration SQL before opening a code editor.

### 2 — Domain Design
Write the function signatures for every domain function you will add:
```typescript
export async function linkFiles(
  parentId:  string,
  childId:   string,
  quantity:  number,
  userId:    string,
): Promise<BomLink>
```
For each: what are the business rules? What can go wrong? What is the success type?
What is the failure type?

### 3 — API Design
List every new route:
```
POST /api/files/bom/link    → 201 { link } | 400 { error } | 404 { error }
GET  /api/files/:id/bom     → 200 { tree } | 404 { error }
```
For each: what does the request body contain? What does the response body contain?
What status codes are possible and why?

### 4 — Renderer Design
Draw the UI on paper or in ASCII:
```
┌─ BOM for housing-v3.step ───────────────────────────────┐
│ ▾ housing-v3.step (top assembly)                        │
│   ├─ bracket.step (qty: 4)          [Available]         │
│   ├─ housing-base.step (qty: 1)     [Checked Out — jane]│
│   └─ cover-plate.step (qty: 2)      [Available]         │
└──────────────────────────────────────────────────────────┘
```

---

## The Architecture Checklist

Before calling the feature done, verify:

- [ ] The database tables are in a numbered migration file and committed
- [ ] Data layer functions: use parameterised queries, return typed results, handle errors
- [ ] Domain layer functions: enforce business rules, call data layer functions, no SQL
- [ ] API routes: validate inputs (400 for bad requests), call domain (never data directly),
      use correct status codes, no business logic
- [ ] Renderer components: use `useAsyncState` for all async operations, use `AsyncView`
      for loading/error states, call API (never domain or data)
- [ ] Tests: at least 3 tests for each domain function, using `beforeEach`/`afterEach` for cleanup
- [ ] No cross-layer imports in the wrong direction
- [ ] The Architecture Rule: every new file's `import` list contains only imports
      from the correct layer

---

## Definition of Done — Project Complete

- [ ] One feature from the option list is fully implemented: DB, domain, API, renderer, tests
- [ ] The architecture checklist passes
- [ ] `npm test` passes all tests
- [ ] The feature is used end-to-end in the running app
- [ ] A short description of the feature (what, why, which tables and domain functions)
      is committed to `docs/extensions/{feature-name}.md`
- [ ] You can explain the open/closed principle and point to three specific places in the
      Vault codebase where a new feature was added without modifying existing code
- [ ] Run:
      ```
      git add .
      git commit -m "Add [feature name]: [short description of what was added and why]"
      ```

---

## Project Complete — Definition of Done

Vault is complete. The system provides:
- **Authenticated access** via GitLab PAT with OS-level encrypted session storage
- **File tree browsing** with lazy-loaded folder expansion and lock status badges
- **Atomic checkout** with database-level locking, preventing concurrent access
- **WIP snapshots** committed to per-checkout GitLab branches
- **Check-in** creating permanent version records in PostgreSQL and GitLab
- **Version history** with per-version download
- **Search** with debounced ILIKE queries and match highlighting
- **File type conventions** configurable from the UI, stored in the database
- **Daily WIP backup** via node-cron
- **Real-time notifications** via server-sent events
- **Audit log** with append-only records and database-level REVOKE
- **Distributable installer** built with electron-builder

Every concept in Vault appears in production engineering software systems:
- Atomic locking appears in every database-backed booking or reservation system
- Layered architecture appears in every well-designed web application
- Audit logs appear in financial systems, medical record systems, and engineering PDM
- WIP snapshots are the same concept as git stash or Autosave
- SSE notifications appear in real-time dashboards, collaboration tools, and monitoring systems

You built a real system. The architecture you used is how real systems are built.
