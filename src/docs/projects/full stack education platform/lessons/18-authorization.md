# Lesson 18 — Authorization From First Principles

## What You Will Build

Protect API routes. A user can only see their own progress. An admin can see everything.
Protect the lesson-completion endpoint so only authenticated users can mark a lesson complete.
Log in as two different users and verify each sees only their own data.

---

## What You Need to Know First

- Lesson 17: JWT tokens, the `Authorization` header
- Lesson 12–14: The database, repositories, route handlers

---

## The Lesson

### Step 1 — Authentication vs Authorization

**Authentication** answers: "Who are you?" — verifying identity (Lesson 17).
**Authorization** answers: "What are you allowed to do?" — verifying permissions.

They are separate problems with separate solutions. A user who is authenticated is not
automatically authorized to do everything. A user might be authenticated (we know they are
`user@example.com`) but not authorized to access admin routes.

**Role-Based Access Control (RBAC):** Users have **roles** (`user`, `admin`). Roles have
**permissions** (what actions they can perform). A permission check says: "does this
role allow this action on this resource?"

For this app:
- `user` role: read all lessons, read their own progress, mark their own lessons complete
- `admin` role: all user permissions + create/update/delete lessons, read all users' progress

### Step 2 — The Auth Middleware

The JWT from Lesson 17 is sent with every authenticated request as an HTTP header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The `Authorization` header and `Bearer` scheme are conventions from OAuth 2.0.
`Bearer` means "the holder of this token" — no additional secret is needed, just
possession of the token.

Create `server/src/middleware/authenticate.ts`:

```typescript
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: number
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      userId?: number
      userRole?: string
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']

  if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload
    req.userId = payload.userId

    // Fetch the user's role from the database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (user === null) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.userRole = user.role
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
```

**`declare global { namespace Express { interface Request { userId?: number } } }`:**
TypeScript declaration merging. Express's `Request` type does not know about `userId`.
This extends the global `Request` type to include `userId` and `userRole` as optional
properties. After this declaration, `req.userId` and `req.userRole` are valid TypeScript.

**`jwt.verify(token, secret)`:**
Verifies the signature and checks the `exp` claim. If the token is expired or the
signature does not match, `verify` throws a `JsonWebTokenError`. The `try/catch` catches
this and returns 401.

**Why fetch the user's role from the database?**
The JWT contains `userId` but not `role`. Roles can change — an admin account can be
downgraded to a user account. If the role were in the JWT, the old (admin) token would
remain valid until it expired, even after the role was changed. Fetching the role on
every request ensures the current role is always checked.

This adds one database query per authenticated request. For performance, this can be
cached (Redis with a short TTL). For this app, the overhead is acceptable.

### Step 3 — Using the Middleware

The middleware chain provides security through **layers**:

```typescript
// In auth.ts routes — protect the progress endpoint
router.post('/lessons/:lessonId/complete', authenticate, async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params['lessonId'] ?? '', 10)
    if (isNaN(lessonId)) return res.status(400).json({ error: 'Invalid lesson ID' })

    // req.userId is set by authenticate middleware — not from the request body
    await markLessonComplete(req.userId!, lessonId)
    res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Admin route — requires authentication AND admin role
router.post('/api/lessons', authenticate, requireRole('admin'), async (req, res, next) => {
  // ...
})
```

**`req.userId!` — the non-null assertion:**
`!` tells TypeScript "I know this is not null." We use it after `authenticate` has run,
because `authenticate` either sets `req.userId` or returns a 401 response (so if we reach
the handler, `req.userId` is guaranteed set). This is a case where the non-null assertion
is appropriate — but it should be rare. Overusing `!` silences TypeScript's safety checks.

### Step 4 — IDOR (Insecure Direct Object Reference)

This is a required security section.

**The attack:** User A has progress record with `id = 42`. User B knows about this ID
(perhaps from a leaked database ID, or by guessing sequential IDs).

```
GET /api/progress/42
```

Without authorization, this returns User A's progress to User B. User B has accessed
data they are not permitted to see. This is **IDOR** — Insecure Direct Object Reference:
a user directly references an object by ID and the server does not verify ownership.

**The attack in the progress route — without the fix:**
```typescript
// VULNERABLE
router.get('/progress/:id', authenticate, async (req, res) => {
  const progress = await prisma.progress.findUnique({
    where: { id: parseInt(req.params['id']!) }
  })
  res.json(progress)  // returns anyone's progress if you know the ID
})
```

**The fix — scope every query to the authenticated user:**
```typescript
// SAFE
router.get('/progress', authenticate, async (req, res, next) => {
  try {
    // Always filter by req.userId — never trust a user_id from the request body
    const progress = await getProgressForUser(req.userId!)
    res.json(progress)
  } catch (error) {
    next(error)
  }
})
```

The fix is simple: instead of accepting a `userId` from the request (which could be
any user's ID), use `req.userId` — set by the `authenticate` middleware from the
verified JWT. The middleware is the trust boundary.

**The confused deputy problem:** Your server is a deputy that acts on behalf of users.
If it does not verify which user it is acting for, an attacker can make it act on their
behalf for another user's data. The `authenticate` middleware establishes which user
is making the request; every handler that accesses user-specific data must use that
identity, never a client-provided one.

### Step 5 — The Auth Flow in the React App

Add the `Authorization` header to authenticated requests:

```typescript
// src/api/progress.ts

export async function markLessonComplete(lessonId: number, token: string) {
  const response = await fetch(`${API_BASE}/api/progress/${lessonId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 401) {
    throw new Error('NOT_AUTHENTICATED')
  }

  if (!response.ok) {
    throw new Error('Failed to mark complete')
  }

  return response.json()
}
```

**Interceptors:** In large apps, adding the `Authorization` header to every fetch call
manually is repetitive. A common pattern is an **interceptor** — a wrapper function
that adds auth headers automatically:

```typescript
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getStoredToken()  // from AsyncStorage or context
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token !== null ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  })
}
```

The spread operator `{ ...options, headers: { ...options.headers, ... } }` merges the
existing options with the auth header, preserving any headers the caller specified.

---

## Connect the Pieces

The `authenticate` middleware in this lesson is identical in structure to the `cors()` and
`express.json()` middleware from Lesson 11. All middleware follows the same contract:
`(req, res, next) => void`. Auth is one more link in the same chain.

The `requireRole` function returns a middleware function — this is the **factory pattern**
(a function that creates and returns another function). `requireRole('admin')` creates
a specific middleware for the `admin` role. The same pattern appears in TanStack Query
when you create a custom hook from `useQuery`.

IDOR vulnerabilities are one of the most common vulnerabilities in web applications.
The OWASP (Open Web Application Security Project) Top 10 lists "Broken Access Control"
as the #1 most critical web security risk — IDOR is a primary example. Understanding
it now means you will naturally scope queries to the authenticated user every time.

---

## What Breaks Without This

Without the `authenticate` middleware on the `/api/progress/:lessonId/complete` route,
any unauthenticated request can mark any lesson as complete for any user. An automated
script could flood the database with completion records for all users.

Without scoping the progress query to `req.userId`, user B can read user A's progress
by changing the URL parameter. The fix is not to validate the URL parameter more
carefully — it is to remove the URL parameter entirely and use the authenticated identity
from the JWT. The JWT is the ground truth about who is making the request.

---

## Definition of Done

- [ ] `POST /api/progress/:lessonId/complete` without a token returns 401
- [ ] `POST /api/progress/:lessonId/complete` with a valid token marks the lesson complete for the authenticated user
- [ ] `GET /api/progress` returns only the authenticated user's progress (not other users')
- [ ] `POST /api/lessons` with a non-admin token returns 403 Forbidden
- [ ] Log in as two different users — each sees only their own progress
- [ ] You can answer: what is the difference between authentication and authorization?
- [ ] You can answer: what is an IDOR vulnerability and how does scoping queries to `req.userId` prevent it?
- [ ] You can answer: what is the confused deputy problem?
- [ ] You can answer: why is the user's role fetched from the database rather than stored in the JWT?
- [ ] `git commit` with a message explaining why — "Add JWT auth middleware and RBAC — protect routes against unauthenticated and unauthorized access"
