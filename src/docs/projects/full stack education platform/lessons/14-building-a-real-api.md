# Lesson 14 — Building a Real API

## What You Will Build

Full CRUD API for lessons: `GET /api/lessons`, `GET /api/lessons/:id`,
`POST /api/lessons`, `PUT /api/lessons/:id`, `DELETE /api/lessons/:id`.
Test every endpoint with curl. By the end, you can create, read, update, and delete
lessons via API calls, and you understand why the API is designed the way it is.

---

## What You Need to Know First

- Lesson 11: Express, HTTP methods, status codes, middleware
- Lesson 12: Prisma, the repository pattern

---

## The Lesson

### Step 1 — REST

**REST** (Representational State Transfer) is an architectural style for APIs.
The two core principles:

1. **Resources are nouns.** The URL identifies the resource. `/api/lessons` is the
   collection of all lessons. `/api/lessons/5` is the lesson with id 5.
2. **HTTP methods are verbs.** The method says what to do with the resource.

```
GET     /api/lessons        → list all lessons
GET     /api/lessons/:id    → get one lesson
POST    /api/lessons        → create a new lesson
PUT     /api/lessons/:id    → replace a lesson entirely
PATCH   /api/lessons/:id    → update specific fields
DELETE  /api/lessons/:id    → delete a lesson
```

**Why not `POST /getLessonById`?** Because the path would be a verb describing an action,
not a noun identifying a resource. `/getLessonById` tells the client how the server works
internally. `/lessons/5` tells the client what resource it is operating on. REST APIs
are easier to use because the convention is predictable.

**Idempotency:** An operation is **idempotent** if doing it multiple times produces the
same result as doing it once.
- `GET /lessons/5` — idempotent. Call it 100 times; the data is unchanged.
- `DELETE /lessons/5` — idempotent. The first call deletes it; subsequent calls return 404.
- `PUT /lessons/5` — idempotent. Replace with the same data 100 times; result is the same.
- `POST /lessons` — not idempotent. Each call creates a new record.

Idempotency matters for network reliability. If a DELETE request times out (did it execute
or not?), retrying is safe. If a POST times out, retrying might create a duplicate.

### Step 2 — The Request Lifecycle

Trace one request through the full stack:

```
Client sends: GET /api/lessons?difficulty=beginner

1. TCP connection established to localhost:3000
2. HTTP request parsed by Node.js HTTP module
3. Express router matches the path /api/lessons
4. Middleware runs (CORS headers added, body parsing skipped — GET has no body)
5. Route handler called: (req, res) => { ... }
6. req.query.difficulty === 'beginner' (query string parsed by Express)
7. getAllLessons({ difficulty: 'beginner' }) called on the repository
8. Prisma queries PostgreSQL: SELECT * FROM lessons WHERE difficulty = $1
9. PostgreSQL executes the query, returns rows
10. Prisma deserialises rows into Lesson objects
11. Route handler calls res.json(lessons)
12. Express serialises the array to JSON
13. HTTP response sent: 200 OK with JSON body
14. TCP connection closed or kept alive for reuse
```

Understanding this trace is essential for debugging. When something goes wrong, you
locate which step failed.

### Step 3 — Input Validation

**Never trust data from the client.** Every field in a `POST` body could be anything:
the wrong type, missing, too long, containing SQL syntax, containing HTML.

**Without validation:**
```typescript
app.post('/api/lessons', async (req, res) => {
  const lesson = await createLesson(req.body)  // req.body could be anything
  res.status(201).json(lesson)
})
```

If `req.body.title` is `null`, Prisma inserts `null` into a `NOT NULL` column — database
error. If `req.body.title` is a 1MB string, you insert 1MB into your database per request —
trivial DoS attack. If `req.body` has extra fields, some ORMs will try to insert them
into the database.

**Validation with Zod:**

```bash
$ npm install zod
```

**What Zod is:** A TypeScript-first schema validation library. You define the shape of
valid data; Zod checks incoming data against the schema and returns either the valid data
(with inferred types) or a detailed error message.

```typescript
import { z } from 'zod'

const CreateLessonSchema = z.object({
  title: z.string().min(1).max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  prompt: z.string().min(1).max(5000),
  starterCode: z.string().max(10000).default(''),
})

type CreateLessonInput = z.infer<typeof CreateLessonSchema>
```

**`z.infer<typeof CreateLessonSchema>`:** TypeScript can infer the type of valid data
from the Zod schema. `CreateLessonInput` is automatically `{ title: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; prompt: string; starterCode: string }`.
No need to write the type manually — it is derived from the schema.

**Using the schema in a route:**
```typescript
app.post('/api/lessons', async (req, res) => {
  const parsed = CreateLessonSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    })
  }

  const lesson = await createLesson(parsed.data)
  res.status(201).json(lesson)
})
```

`safeParse` returns `{ success: true, data: ... }` or `{ success: false, error: ... }`.
It never throws. `parsed.error.flatten().fieldErrors` produces a structured error object:
`{ title: ['Too short'], difficulty: ['Invalid value'] }` — exactly what the client needs
to show the user useful error messages.

**Security aspect of validation:** An unvalidated `POST` body can contain **extra fields**
that overwrite protected data. If the schema allows any key through to the database, an
attacker can send `{ "title": "...", "id": 1 }` to overwrite the primary key, or
`{ "isAdmin": true }` to escalate privileges. Zod strips unknown fields by default —
only the declared fields are passed to the repository.

### Step 4 — The Full CRUD Router

Create `server/src/routes/lessons.ts`:

```typescript
import { Router } from 'express'
import { z } from 'zod'
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../repositories/lessonRepository'

const router = Router()

const CreateLessonSchema = z.object({
  title: z.string().min(1).max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  prompt: z.string().min(1),
  starterCode: z.string().default(''),
})

const UpdateLessonSchema = CreateLessonSchema.partial()

router.get('/', async (req, res) => {
  const difficulty = req.query['difficulty']
  const lessons = await getAllLessons(
    typeof difficulty === 'string' ? difficulty : undefined
  )
  res.json(lessons)
})

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params['id'] ?? '', 10)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid lesson ID' })
  }

  const lesson = await getLessonById(id)
  if (lesson === null) {
    return res.status(404).json({ error: 'Lesson not found' })
  }

  res.json(lesson)
})

router.post('/', async (req, res) => {
  const parsed = CreateLessonSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors })
  }
  const lesson = await createLesson(parsed.data)
  res.status(201).json(lesson)
})

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params['id'] ?? '', 10)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid lesson ID' })

  const parsed = CreateLessonSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors })
  }

  const lesson = await updateLesson(id, parsed.data)
  if (lesson === null) return res.status(404).json({ error: 'Lesson not found' })

  res.json(lesson)
})

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params['id'] ?? '', 10)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid lesson ID' })

  await deleteLesson(id)
  res.status(204).send()
})

export { router as lessonsRouter }
```

**`Router()` explained:**
`Router` creates a mini-application — a set of routes that can be mounted at a path.
In `index.ts`: `app.use('/api/lessons', lessonsRouter)`. Now every route in
`lessonsRouter` is prefixed with `/api/lessons`. The router is a **separation of concerns**
tool: each resource gets its own router file.

**`:id` path parameters:**
In `router.get('/:id', ...)`, `:id` is a path parameter — a variable part of the URL.
`req.params['id']` reads it as a string. `parseInt(..., 10)` converts it to an integer.
Always validate and parse path parameters — they arrive as strings regardless of what
the client intended.

**`UpdateLessonSchema = CreateLessonSchema.partial()`:**
`.partial()` makes all fields optional. A `PUT /api/lessons/5` with only `{ title: "New Title" }`
updates only the title. A `partial()` schema validates that any provided fields are valid,
while allowing any subset.

**`204 No Content`:** The correct status for a successful DELETE. No body is returned —
the resource is gone.

**`isNaN` explained:** `isNaN(value)` returns `true` if `value` is `NaN` (Not a Number).
`parseInt('abc', 10)` returns `NaN`. `parseInt('5', 10)` returns `5`.
`isNaN('abc')` is `true`; `isNaN(5)` is `false`. Always check for `NaN` when parsing
user-provided numbers.

### Step 5 — Rate Limiting

**What rate limiting is:** Limiting how many requests a single client can make in a time
window. Without rate limiting, a script can send 10,000 requests per second to your API,
consuming all your server's resources and denying service to real users.

```bash
$ npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit'

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // max 100 requests per window per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', apiLimiter)
```

`windowMs: 15 * 60 * 1000` — the time window in milliseconds: 15 minutes.
`max: 100` — maximum requests per window per IP address.
`standardHeaders: true` — sends `RateLimit-*` headers so clients know their limit.

Rate limiting is not a complete defence against DoS attacks — a distributed attack
from many IPs bypasses per-IP limits — but it stops trivial abuse and reduces the
impact of bugs in client code that loop infinitely.

---

## Connect the Pieces

The CRUD routes built here are the foundation for every data operation in the app.
Lesson 16 will consume these routes from the React app using TanStack Query, adding
caching and loading states. Lesson 18 will add auth middleware that runs before these
handlers, restricting who can POST and DELETE.

The Zod schema (`CreateLessonSchema`) is validation code. In Lesson 17, auth routes
will use Zod to validate login requests (`email` must be a valid email, `password` must
be at least 8 characters). The pattern is identical.

Rate limiting protects the API from abuse. The same principle — "limit the blast radius"
— appears in database connection pooling (Lesson 12's Prisma client has a connection
pool with a maximum size) and in the code execution timeout (Lesson 09).

---

## What Breaks Without This

Without `parseInt(id, 10)` and the `isNaN` check, a request to `/api/lessons/abc`
causes `prisma.lesson.findUnique({ where: { id: NaN } })`. Prisma's TypeScript types
accept `NaN` as a number — but the database query fails with a cast error. The server
crashes with an unhandled exception and returns 500. The fix takes 30 seconds; finding
the bug takes hours if you have not seen this pattern before.

Without input validation, `POST /api/lessons` with an empty body (`{}`) creates a
lesson with `null` title, `null` prompt, and `null` starterCode. The lessons list shows
blank cards. Users cannot tell if a lesson has no content or if the app is broken.

---

## Definition of Done

- [ ] `GET /api/lessons` returns all lessons as JSON
- [ ] `GET /api/lessons/1` returns the lesson with id 1
- [ ] `GET /api/lessons/999` returns 404 with `{ "error": "Lesson not found" }`
- [ ] `POST /api/lessons` with a valid body creates a new lesson and returns 201
- [ ] `POST /api/lessons` with an invalid body returns 400 with field-level errors
- [ ] `PUT /api/lessons/1` updates the lesson and returns it
- [ ] `DELETE /api/lessons/1` returns 204 with no body
- [ ] Sending 101 requests in a 15-minute window returns 429 Too Many Requests
- [ ] You can answer: what is REST and what are resources vs verbs?
- [ ] You can answer: what is idempotency and which HTTP methods are idempotent?
- [ ] You can answer: what is input validation and how does Zod prevent extra fields from reaching the database?
- [ ] `git commit` with a message explaining why — "Add full CRUD API for lessons with validation and rate limiting"
