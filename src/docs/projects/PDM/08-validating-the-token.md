# Vault PDM — Lesson 08 — Validating the Token Against GitLab

## What You Will Build

The API layer adds `POST /api/auth/connect`. The renderer sends the PAT to this
endpoint. The Express server calls GitLab's `GET /api/v4/user` with the token.
If GitLab responds 200, Vault parses the user's name, email, and GitLab user ID
from the response and sends them back to the renderer. The Connect screen transitions
to the main app view showing "Welcome, [name]." Invalid tokens produce a clear
error message.

## What You Need to Know First

Lessons 01–07. The Connect screen sends the POST request. This lesson wires up the
server-side logic that handles it. The domain layer for auth (`src/domain/auth.ts`)
is introduced — business logic goes there, not in the Express route.

---

## The Problem

The renderer has a PAT but no way to verify it. Trusting the client's claim "this
token is valid" without verification would allow any fabricated string to authenticate.
Verification requires asking the authority — GitLab — whether the token is valid.

This lesson also establishes the **proxy pattern**: the renderer calls Vault's API,
and Vault's API calls GitLab. The renderer never calls GitLab directly. This matters
for three reasons:
1. The PAT stays on the server side after the initial connection (lesson 10)
2. All external API calls are in one place — `src/data/` — making GitLab API errors
   findable in one file
3. The renderer does not need to know GitLab's API URL, version, or authentication
   format — that knowledge is encapsulated in the data layer

---

## Step 1 — HTTP POST and Request Bodies

**HTTP POST — first appearance in depth:**
`GET` requests retrieve data. `POST` requests submit data to create or change
something. Key differences:

- `GET` has no body. Parameters are in the URL query string: `GET /search?q=term`.
  URLs are logged by web servers, browsers, proxies, and monitoring tools.
- `POST` has a body. The data is in the request body, not the URL.

**Why the PAT goes in the POST body, not the URL:**
If the PAT were a URL parameter — `POST /api/auth/connect?token=glpat-xxx` — it
would appear in:
- Server access logs (every web server logs the full URL)
- Browser history
- Referrer headers sent to third-party resources
- Monitoring and analytics tools

A PAT in a log file is a compromised PAT. Request bodies, by contrast, are not
logged by default. Always send credentials in the request body. Never in URLs.

**`Content-Type: application/json` — first appearance:**
The `Content-Type` header tells the server what format the request body is in.
`application/json` means: the body is a JSON-encoded string. Express's
`express.json()` middleware reads this header and parses the body accordingly.
Without this header, `express.json()` ignores the body, and `req.body` is undefined.

The renderer already sends this header:
```typescript
headers: { 'Content-Type': 'application/json' }
```

---

## Step 2 — The GitLab User API

**REST API — first appearance:**
A **REST API (Representational State Transfer API)** is a set of HTTP endpoints that
expose a service's data and operations. Each endpoint represents a resource:
- `GET /api/v4/user` — the authenticated user's profile
- `GET /api/v4/projects` — the user's projects
- `GET /api/v4/projects/:id/repository/tree` — the file tree of a project

REST APIs use standard HTTP methods and status codes to communicate meaning. A `404`
from the GitLab API means "this resource does not exist." A `401` means "not
authenticated." The same codes we use in our own API.

**`GET /api/v4/user` — the GitLab endpoint for Vault:**
GitLab's user endpoint returns the authenticated user's information. To call it:

```
GET https://gitlab.com/api/v4/user
Authorization: Bearer glpat-xxxxxxxxxxxxxxxxxxxx
```

Response (200 OK):
```json
{
  "id":         42,
  "username":   "janedoe",
  "name":       "Jane Doe",
  "email":      "jane@example.com",
  "state":      "active"
}
```

**Authorization headers — first appearance:**
The `Authorization` header carries credentials for an HTTP request.
`Authorization: Bearer <token>` is the standard format for token-based authentication.
The word `Bearer` is the **scheme** — it signals that the credential is a bearer token
(anyone who possesses it can use it). Other schemes: `Basic` (username:password in
base64), `Digest`, `OAuth`.

**Why HTTP status codes for auth failures:**
- `401 Unauthorized` — the token is invalid, expired, or missing. The client must
  re-authenticate.
- `403 Forbidden` — the token is valid, but the user does not have permission for
  this operation.
- `404 Not Found` — the resource does not exist (independent of auth).

These distinctions matter: a 401 means "try authenticating again"; a 403 means
"you are authenticated but cannot do this." A system that returns 403 for invalid
tokens (as some GitLab endpoints do) must handle this correctly.

---

## Step 3 — The Data Layer: GitLab API Client

### Create `src/data/gitlab.ts`

```typescript
export interface GitlabUser {
  id:       number
  username: string
  name:     string
  email:    string
  state:    string
}

export async function fetchGitlabUser(
  gitlabUrl: string,
  token:     string,
): Promise<GitlabUser> {
  const url      = `${gitlabUrl}/api/v4/user`
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
  })

  if (response.status === 401) {
    throw new Error('Invalid or expired GitLab Personal Access Token')
  }

  if (response.status === 403) {
    throw new Error('Token is valid but lacks required scopes (read_api required)')
  }

  if (!response.ok) {
    throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json() as GitlabUser
  return data
}
```

**`fetch` in Node.js — first appearance in the main process:**
`fetch` is a browser API, but Node.js 18+ includes it natively. In Node.js, `fetch`
works identically to browser `fetch` — same API, same Promise return, same
response parsing. We use Node's native `fetch` (no external library) because it is
available and sufficient.

**`response.ok` — first appearance:**
`response.ok` is `true` when the status code is in the `2xx` range (200–299). It is
`false` for `4xx` and `5xx` codes. Checking `response.ok` is more concise than
`response.status >= 200 && response.status < 300`. We check specific error codes
(401, 403) first to give precise error messages, then fall through to `!response.ok`
for other failures.

**Throwing from the data layer:**
`fetchGitlabUser` throws on failure rather than returning a success/failure union.
The domain layer (which calls it) uses `try/catch` to handle the error. This is the
**exception model**: errors propagate up the call stack as exceptions. The alternative
is a **result type** (`{ success: true; data: GitlabUser } | { success: false; error: string }`)
which is more explicit but more verbose. Both are valid; this curriculum uses
exceptions for network errors (which are truly exceptional) and result types for
expected business rule failures (covered in lesson 16).

---

## Step 4 — The Domain Layer: Auth Logic

### Create `src/domain/auth.ts`

```typescript
import { fetchGitlabUser, type GitlabUser } from '../data/gitlab.js'

export interface ConnectResult {
  gitlabUserId: number
  username:     string
  name:         string
  email:        string
}

export async function connectWithToken(
  gitlabUrl: string,
  token:     string,
): Promise<ConnectResult> {
  const gitlabUser: GitlabUser = await fetchGitlabUser(gitlabUrl, token)

  if (gitlabUser.state !== 'active') {
    throw new Error(`GitLab account is ${gitlabUser.state}, not active`)
  }

  return {
    gitlabUserId: gitlabUser.id,
    username:     gitlabUser.username,
    name:         gitlabUser.name,
    email:        gitlabUser.email,
  }
}
```

**The domain layer's role in auth:**
`connectWithToken` calls the data layer function `fetchGitlabUser` and applies the
business rule: "only active accounts can connect." This rule — `state !== 'active'`
— is a business decision, not a GitLab API detail. It lives in the domain layer,
not the data layer (which only talks to GitLab) and not the API layer (which only
routes requests).

If the business rule changes — for example, "also allow accounts in 'deactivated'
state with admin approval" — only `connectWithToken` changes. The data layer and the
API layer are unchanged.

---

## Step 5 — The API Route

### Update `src/api/server.ts`

```typescript
import { connectWithToken } from '../domain/auth.js'

app.post('/api/auth/connect', async (request, response) => {
  const { token, gitlabUrl } = request.body as {
    token:     string
    gitlabUrl: string
  }

  if (typeof token !== 'string' || token.trim().length === 0) {
    response.status(400).json({ error: 'token is required' })
    return
  }

  if (typeof gitlabUrl !== 'string' || gitlabUrl.trim().length === 0) {
    response.status(400).json({ error: 'gitlabUrl is required' })
    return
  }

  try {
    const result = await connectWithToken(gitlabUrl.trim(), token.trim())
    response.json({
      gitlabUserId: result.gitlabUserId,
      username:     result.username,
      name:         result.name,
      email:        result.email,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed'
    response.status(401).json({ error: message })
  }
})
```

**Input validation in the API layer:**
The API layer validates that `token` and `gitlabUrl` are non-empty strings before
calling the domain layer. This is the correct place for request validation:
- The domain layer should not receive `undefined` — it would throw with a confusing
  error
- The data layer should not receive an empty token — it would make an unnecessary
  network request
- The API layer is the entry point; it validates that the entry conditions are met

`400 Bad Request` is the correct status code for malformed requests — the problem is
the client's input, not a server error.

**Security lens — why the error response does not echo the token:**
`response.status(401).json({ error: message })` — the error message describes what
went wrong without including the invalid token. Echoing the token back:
`{ error: 'Invalid token: glpat-xxx' }` would log it in network monitors. Always
describe the error without repeating the credential.

---

## Step 6 — Updating the Renderer

### Update `ConnectScreen.tsx` — handle the response

The `handleConnect` function from lesson 07 already handles this response. Update
`App.tsx` to receive and store the user's name:

```typescript
interface ConnectedUser {
  gitlabUserId: number
  username:     string
  name:         string
  email:        string
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<ConnectedUser | null>(null)

  if (currentUser === null) {
    return (
      <ConnectScreen
        onConnected={(user: ConnectedUser) => setCurrentUser(user)}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="toolbar">
        <span className="app-name">Vault</span>
        <span className="toolbar-spacer" />
        <span className="user-chip">
          {currentUser.name}
          <span className="user-username"> @{currentUser.username}</span>
        </span>
      </header>
      <main className="content">
        <p className="placeholder-text">Connected. File tree coming in Lesson 12.</p>
      </main>
    </div>
  )
}
```

Update `ConnectScreen.tsx` to pass the full user object:

```typescript
const data = await response.json() as ConnectedUser & { error?: string }
if (response.ok && data.gitlabUserId !== undefined) {
  onConnected(data)
}
```

---

## Connect the Pieces

The full authentication flow (so far):

```
ConnectScreen: POST /api/auth/connect { token, gitlabUrl }
  ──► API layer: validates token and gitlabUrl are non-empty
  ──► Domain: connectWithToken(gitlabUrl, token)
  ──► Data: fetchGitlabUser(gitlabUrl, token)
  ──► GitLab API: GET /api/v4/user with Authorization: Bearer
  ──► GitLab: 200 { id, username, name, email, state }
  ──► Data: returns GitlabUser
  ──► Domain: checks state === 'active', returns ConnectResult
  ──► API: response.json({ gitlabUserId, username, name, email })
  ──► Renderer: setCurrentUser(data), ConnectScreen unmounts, main app renders
```

Lesson 09 adds the database write: after GitLab validates the user, Vault upserts a
row in the `users` table and returns the Vault UUID.

---

## What Breaks Without This

**Without the proxy pattern (renderer calling GitLab directly):**
If the renderer called `https://gitlab.com/api/v4/user` directly, the PAT would need
to be stored in the renderer's JavaScript bundle or in a browser API. Browser storage
(`localStorage`, `sessionStorage`) is accessible to any script running in the page,
including XSS payloads. Storing the PAT in the renderer creates a persistent XSS
target. Keeping it in the main process (where it goes after lesson 10) gives it OS-
level protection.

**Without input validation before calling the domain:**
An empty string token calls `fetchGitlabUser('', '')` → `fetch('//api/v4/user')` with
an empty `Authorization: Bearer ` header → GitLab returns 401 → the error propagates
back normally. The system still works, but it wastes a GitLab API call for a request
that should have been rejected immediately. More seriously: an `undefined` token would
produce `Authorization: Bearer undefined` in the header — a different error that might
confuse error logging. Validate first, call external APIs second.

---

## Definition of Done

- [ ] Entering a valid GitLab PAT and clicking Connect shows the user's name in the toolbar
- [ ] Entering an invalid PAT shows "Invalid or expired GitLab Personal Access Token" in the Connect screen
- [ ] Leaving the token field empty keeps the Connect button disabled
- [ ] The Network tab shows the POST request body contains `token` and `gitlabUrl`
- [ ] You can explain why the PAT goes in the request body and not the URL
- [ ] You can explain the `Authorization: Bearer` header format
- [ ] You can explain the difference between `401 Unauthorized` and `403 Forbidden`
- [ ] You can explain why the domain layer checks `state === 'active'` and not the data layer
- [ ] You can explain the proxy pattern and why the renderer does not call GitLab directly
- [ ] Run:
      ```
      git add src/domain/ src/data/ src/api/ src/renderer/
      git commit -m "Add GitLab authentication: fetchGitlabUser data function, connectWithToken domain function, POST /api/auth/connect route, user info displayed in toolbar"
      ```

---

*Next: Lesson 09 — Storing Identity in the Database. Authentication succeeds → Vault
writes the user to the `users` table. The user's Vault UUID becomes their identity
for all checkout and version operations. The PAT is NOT stored in the database.*
