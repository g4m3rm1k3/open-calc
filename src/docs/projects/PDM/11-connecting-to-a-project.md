# Vault PDM — Lesson 11 — Connecting to a GitLab Project

## What You Will Build

After login, the user sees a "Select Project" screen. They enter a GitLab project ID
or paste a GitLab project URL. Vault fetches the project name and description from the
GitLab Projects API. The selected project is stored in the `users` table and in the
session. Next time the app launches, the project is already selected — the user goes
directly to the file tree. Phase 3 begins.

## What You Need to Know First

Lessons 01–10. The user is authenticated. The PAT is available in the session. This
lesson shows how to use the stored PAT to make further GitLab API calls — and how
to validate that the user actually has access to the requested project.

---

## The Problem

Vault manages files in GitLab projects. The user must tell Vault which project(s) to
manage. Before showing the file tree, Vault must verify that:
1. The project exists on GitLab
2. The authenticated user has access to it (authorisation check)

This is the first time **authorisation** (can this user do this?) is separate from
**authentication** (who is this user?). A user might be authenticated as themselves
but have no access to the requested project. The GitLab API's `403 Forbidden`
response communicates this.

---

## Step 1 — The GitLab Projects API

**GitLab Projects API — first appearance:**
`GET /api/v4/projects/:id` returns a project's details. The `:id` can be:
- A numeric project ID: `GET /api/v4/projects/12345`
- A URL-encoded path: `GET /api/v4/projects/mygroup%2Fmyproject`

Response (200 OK):
```json
{
  "id":                12345,
  "name":              "CAD Files",
  "name_with_namespace": "Engineering Team / CAD Files",
  "description":       "All CAD geometry for the Mk3 product",
  "web_url":           "https://gitlab.com/engineering/cad-files",
  "visibility":        "private"
}
```

**Extracting the project ID from a URL:**
Users may paste `https://gitlab.com/engineering/cad-files` rather than typing `12345`.
The path `engineering/cad-files` URL-encoded is `engineering%2Fcad-files`.

```typescript
function extractProjectIdentifier(input: string): string {
  const trimmed = input.trim()

  if (/^\d+$/.test(trimmed)) {
    return trimmed
  }

  try {
    const url  = new URL(trimmed)
    const path = url.pathname.slice(1)
    return encodeURIComponent(path).replace(/%2F/gi, '%2F')
  } catch {
    return encodeURIComponent(trimmed)
  }
}
```

**`/^\d+$/.test(trimmed)` — first appearance (regex in detail):**
`/^\d+$/` is a **regular expression** (regex). Syntax: `/pattern/flags`.

- `^` — start of string
- `\d` — any digit (0–9)
- `+` — one or more of the preceding
- `$` — end of string

`/^\d+$/.test(str)` returns `true` if `str` consists entirely of digits (i.e., it
is a pure integer project ID). `'12345'.match(/^\d+$/)` is `true`; `'org/repo'` is
`false`.

Regular expressions are a **language within a language** — a concise notation for
describing patterns in strings. They are used throughout software for: validation
(`/^[\w.]+@[\w]+\.[\w]+$/` for email), parsing (extracting numbers from logs),
and transformation (`string.replace(/pattern/, replacement)`).

**`new URL(string)` — first appearance:**
`new URL(string)` parses a URL string into its component parts. `url.pathname` is
the path portion: for `https://gitlab.com/engineering/cad-files`, pathname is
`/engineering/cad-files`. It throws a `TypeError` if the string is not a valid URL
— hence the `try/catch`.

---

## Step 2 — Data Layer: Fetch Project

### Update `src/data/gitlab.ts`

```typescript
export interface GitlabProject {
  id:                 number
  name:               string
  nameWithNamespace:  string
  description:        string | null
  webUrl:             string
  visibility:         'private' | 'internal' | 'public'
}

export async function fetchGitlabProject(
  gitlabUrl:         string,
  token:             string,
  projectIdentifier: string,
): Promise<GitlabProject> {
  const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectIdentifier)}`
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (response.status === 404) {
    throw new Error(`Project not found: ${projectIdentifier}`)
  }
  if (response.status === 403) {
    throw new Error(`You do not have access to project: ${projectIdentifier}`)
  }
  if (!response.ok) {
    throw new Error(`GitLab API error: ${response.status}`)
  }

  const raw = await response.json() as {
    id:                    number
    name:                  string
    name_with_namespace:   string
    description:           string | null
    web_url:               string
    visibility:            string
  }

  return {
    id:                raw.id,
    name:              raw.name,
    nameWithNamespace: raw.name_with_namespace,
    description:       raw.description,
    webUrl:            raw.web_url,
    visibility:        raw.visibility as GitlabProject['visibility'],
  }
}
```

**The `403` check — authorisation:**
If the user has a valid PAT but no access to the project, GitLab returns `403
Forbidden`. Distinguishing this from `404 Not Found` gives the user a meaningful
error: "this project exists but you cannot access it" vs "this project does not exist."
Many APIs return `404` for both cases to avoid leaking information about private
resources — GitLab does the same for truly private projects. The error handling
covers both cases.

**`as GitlabProject['visibility']` — narrowing a string to a union:**
The GitLab API returns `visibility` as a plain string. TypeScript does not know it
is one of the three values in our union. `as GitlabProject['visibility']` asserts
the narrowing. This is safe because GitLab only ever returns those three values, but
it is not verified by the compiler — a new GitLab visibility value would need the
union updated.

---

## Step 3 — Domain Layer and Database Storage

**Store the selected project in the database.** Add a `selected_gitlab_project_id`
column to `users`:

Create `migrations/002_add_selected_project.sql`:

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS selected_gitlab_project_id INTEGER,
  ADD COLUMN IF NOT EXISTS gitlab_url TEXT NOT NULL DEFAULT 'https://gitlab.com';
```

Run it:
```
psql -U vault_user -d vault -f migrations/002_add_selected_project.sql
```

**`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — adding a column:**
Unlike `CREATE TABLE`, `ALTER TABLE ADD COLUMN` modifies an existing table. `IF NOT
EXISTS` prevents failure if the column already exists. Note: this column has no
`NOT NULL` constraint — existing user rows have no project selected yet. Adding
`NOT NULL` to an existing table with data requires a `DEFAULT` or a data migration.

### Add to `src/data/users.ts`

```typescript
export async function updateSelectedProject(
  vaultUserId:       string,
  gitlabProjectId:   number,
): Promise<void> {
  await query(
    `UPDATE users SET selected_gitlab_project_id = $1 WHERE id = $2`,
    [gitlabProjectId, vaultUserId],
  )
}
```

### Create `src/domain/projects.ts`

```typescript
import { fetchGitlabProject }      from '../data/gitlab.js'
import { updateSelectedProject }    from '../data/users.js'
import type { GitlabProject }       from '../data/gitlab.js'

export async function selectProject(
  gitlabUrl:   string,
  token:       string,
  inputString: string,
  vaultUserId: string,
): Promise<GitlabProject> {
  const identifier = extractProjectIdentifier(inputString)
  const project    = await fetchGitlabProject(gitlabUrl, token, identifier)

  await updateSelectedProject(vaultUserId, project.id)

  return project
}
```

---

## Step 4 — API Route

### Update `src/api/server.ts`

```typescript
import { selectProject } from '../domain/projects.js'

app.post('/api/projects/select', async (request, response) => {
  const { projectInput, gitlabUrl, token, vaultUserId } = request.body as {
    projectInput: string
    gitlabUrl:    string
    token:        string
    vaultUserId:  string
  }

  try {
    const project = await selectProject(gitlabUrl, token, projectInput, vaultUserId)
    response.json(project)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to select project'
    response.status(400).json({ error: message })
  }
})
```

**Passing the PAT from the renderer:**
The PAT, loaded from the session in lesson 10, is passed in the request body here.
The renderer has the PAT in memory (from the session restore) and includes it in API
requests that need it. This is the correct approach while the API has no server-side
session: the PAT travels from encrypted storage (main process) to the renderer via
IPC, and then to API calls in the request body.

**Security consideration:**
The PAT in the request body is sent over `localhost:3001` — loopback only, never
reaching the network. It is not visible in browser history or URL logs. For a local
desktop app, this is the acceptable trade-off. A server-based deployment would use
a session cookie or a server-side token store.

---

## Step 5 — The Project Selection Screen

### Create `src/renderer/ProjectSelect.tsx`

```typescript
import { useState } from 'react'

interface ProjectSelectProps {
  vaultUserId: string
  gitlabUrl:   string
  pat:         string
  onSelected:  (project: { id: number; name: string }) => void
}

export function ProjectSelect({ vaultUserId, gitlabUrl, pat, onSelected }: ProjectSelectProps) {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSelect(): Promise<void> {
    if (input.trim() === '') return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/projects/select', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ projectInput: input, gitlabUrl, token: pat, vaultUserId }),
      })

      const data = await response.json() as { id?: number; name?: string; error?: string }

      if (response.ok && data.id !== undefined && data.name !== undefined) {
        onSelected({ id: data.id, name: data.name })
      } else {
        setError(data.error ?? 'Failed to connect to project')
      }
    } catch {
      setError('Could not reach Vault API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="connect-screen">
      <div className="connect-card">
        <h2 className="connect-title">Select GitLab Project</h2>
        <p className="connect-description">
          Enter a project ID (e.g. 12345) or project path (e.g. org/repo-name).
        </p>
        <label className="field-label" htmlFor="project-input">
          Project ID or URL
        </label>
        <input
          id="project-input"
          type="text"
          className="field-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="12345 or organisation/project-name"
        />
        {error !== '' && <p className="connect-error">{error}</p>}
        <button
          className="connect-btn"
          onClick={handleSelect}
          disabled={input.trim() === '' || loading}
        >
          {loading ? 'Connecting...' : 'Select Project'}
        </button>
      </div>
    </div>
  )
}
```

**`finally` — first appearance:**
`try/catch/finally` — the `finally` block runs after either the `try` or the `catch`
block, regardless of whether an error occurred. `setLoading(false)` in `finally`
ensures the loading state is always cleared — whether the request succeeded, failed,
or threw. Without `finally`, a forgotten `setLoading(false)` in the catch path would
leave the button permanently disabled.

---

## Connect the Pieces

After this lesson, the app flow is:

```
Launch → session restored (if exists) → skip Connect + ProjectSelect
Launch → no session → Connect screen → authenticate → ProjectSelect → file tree
```

The `selectedProjectId` is stored in the `users` table and in the session. On session
restore, the renderer skips `ProjectSelect` if `selectedProjectId` is present in the
session data (updated in `sessionStore.ts` to include it).

The project selection confirms that the architecture rule holds: the project ID is
stored in the data layer (`users.selected_gitlab_project_id`), enforced by the domain
layer (`selectProject`), exposed by the API layer (`POST /api/projects/select`), and
displayed by the presentation layer (`ProjectSelect`). Each layer does its one job.

---

## What Breaks Without This

**Without the authorisation check (403 handling):**
A user with a valid PAT but no project access receives an opaque error from the
GitLab API. The Vault UI might show "Error 403" or, worse, crash. The explicit check
translates the HTTP error into a meaningful message: "You do not have access to this
project."

**Without `finally` for `setLoading(false)`:**
If the `catch` block throws (for example, `data.error` is not a string and the
`?? 'Failed...'` fallback also fails), `setLoading(false)` in the catch block never
runs. The button stays in "Connecting..." state and is permanently disabled. The
`finally` block guarantees cleanup even when error handling itself fails.

---

## Definition of Done

- [ ] The Project Select screen appears after login when no project is stored
- [ ] Entering a numeric project ID and clicking Select connects to the project
- [ ] The project name appears (shown in the toolbar or a confirmation message)
- [ ] An invalid project ID shows "Project not found"
- [ ] A project the user cannot access shows "You do not have access"
- [ ] `psql -c "SELECT selected_gitlab_project_id FROM users"` shows the selected project ID
- [ ] Session restore on next launch skips the Project Select screen (project is remembered)
- [ ] You can explain the regex `/^\d+$/` character by character
- [ ] You can explain what `finally` guarantees and when to use it instead of duplicating cleanup code
- [ ] You can explain the distinction between `404 Not Found` and `403 Forbidden` with a concrete example
- [ ] Run:
      ```
      git add migrations/ src/domain/ src/data/ src/api/ src/renderer/
      git commit -m "Add project selection: GitLab project validation with auth check, stored in users table, session persists selection"
      ```

---

*Next: Lesson 12 — Fetching the File Tree. The file tree panel displays all files
and folders in the selected GitLab project. Folders expand and collapse. The GitLab
Repository Trees API, tree data structures, and recursive React components are
introduced.*
