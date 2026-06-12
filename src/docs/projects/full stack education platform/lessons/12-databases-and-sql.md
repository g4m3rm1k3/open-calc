# Lesson 12 — Databases and SQL From First Principles

## What You Will Build

Create a PostgreSQL database. Create a `lessons` table. Seed it with three lessons.
Fetch them from your API and display them in the app. By the end, the Lessons screen
shows real data from a real database — not hardcoded JavaScript arrays.

---

## What You Need to Know First

- Lesson 11: Express server, HTTP routes, middleware
- Lesson 01: `.env` files (introduced here in detail)

---

## The Lesson

### Step 1 — Why a Database?

The filesystem stores data persistently. So why not just write files?

- **Querying:** finding all lessons with `difficulty = 'beginner'` requires reading every file.
  A database can find them in milliseconds with an index.
- **Concurrent access:** multiple users reading and writing simultaneously causes race conditions
  with files. Databases handle concurrency correctly using transactions.
- **Relationships:** lessons have many completions; users have many progress records. Expressing
  and querying these relationships with files is painful. Databases have joins.
- **Durability:** databases are designed to never lose committed data, even if the server crashes
  mid-write. A file write can be partial.

A database solves the problems that files cannot.

### Step 2 — The Relational Model

PostgreSQL is a **relational database**. Data is stored in **tables** (also called relations).

- A **table** is a collection of rows and columns — like a spreadsheet
- A **row** (record) is one entity — one lesson, one user, one progress record
- A **column** (attribute) describes one property — `title`, `difficulty`, `created_at`
- A **primary key** is a column (or combination) that uniquely identifies each row

```
lessons table:
┌────┬──────────────────────┬────────────┬─────────────────────┐
│ id │ title                │ difficulty │ created_at          │
├────┼──────────────────────┼────────────┼─────────────────────┤
│  1 │ Hello, World         │ beginner   │ 2024-01-15 10:00:00 │
│  2 │ Variables and Types  │ beginner   │ 2024-01-15 10:01:00 │
│  3 │ Functions            │ intermediate│ 2024-01-15 10:02:00 │
└────┴──────────────────────┴────────────┴─────────────────────┘
```

`id` is the primary key — every lesson has a unique id.

### Step 3 — SQL

**SQL** (Structured Query Language) is a **declarative language** for interacting with
relational databases. You describe what you want; the database figures out how to get it.

**Core statements:**

```sql
-- Create a table
CREATE TABLE lessons (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  difficulty  TEXT NOT NULL DEFAULT 'beginner',
  prompt      TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Insert rows
INSERT INTO lessons (title, difficulty, prompt, starter_code)
VALUES
  ('Hello, World', 'beginner', 'Write a function that returns Hello, World', 'function hello() {\n\n}'),
  ('Variables and Types', 'beginner', 'Declare three variables', 'const name ='),
  ('Functions', 'intermediate', 'Write a function that adds two numbers', 'function add(a, b) {\n\n}');

-- Read rows
SELECT * FROM lessons WHERE difficulty = 'beginner';

-- Update a row
UPDATE lessons SET title = 'Hello, World!' WHERE id = 1;

-- Delete a row
DELETE FROM lessons WHERE id = 1;
```

**`SERIAL PRIMARY KEY`:** `SERIAL` is a PostgreSQL shorthand for an auto-incrementing
integer — each new row gets the next integer (`1`, `2`, `3`, ...). `PRIMARY KEY` marks
this column as the primary key, which automatically creates an index on it.

**`NOT NULL`:** This constraint prevents the column from being empty. Without it,
`INSERT INTO lessons (title) VALUES (NULL)` would be valid, and `lessons.title` could
be `null` — unexpected and error-prone.

**`DEFAULT NOW()`:** If `created_at` is not specified in an INSERT, the database sets it
to the current timestamp automatically.

**The declarative model of SQL:** `SELECT * FROM lessons WHERE difficulty = 'beginner'`
does not describe how to find beginner lessons (no loop, no comparison code). It describes
what you want: all columns from `lessons` where the difficulty is beginner. The database
engine decides the optimal execution plan.

### Step 4 — Indexes and B-trees

**The problem:** `SELECT * FROM lessons WHERE difficulty = 'beginner'` scans every row
to find matches. With 10 rows, this is instant. With 100,000 rows, this is slow.

**The solution — indexes:** An **index** is a data structure that makes lookups fast.
PostgreSQL uses a **B-tree** (balanced tree) for most indexes.

**What a B-tree is:** A balanced tree where each node has multiple sorted keys. Searching
is O(log n) — each comparison eliminates half the remaining candidates. Finding one row
in 1,000,000 takes about 20 comparisons.

```sql
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);
```

After creating this index, `WHERE difficulty = 'beginner'` uses the B-tree instead of
a full scan. The trade-off: inserts and updates are slightly slower (the index must be
updated). Reads become dramatically faster.

**CS lens:** O(log n) vs O(n) for lookup. With 1,000,000 rows:
- Without index: up to 1,000,000 comparisons
- With B-tree index: about 20 comparisons
For read-heavy workloads (far more reads than writes), the trade-off is always worth it.

### Step 5 — Security: SQL Injection

This is a required section — the database handles user input.

**The attack:** Suppose you query the database with user-provided input:

```typescript
// DANGEROUS — never do this
const query = `SELECT * FROM users WHERE name = '${userInput}'`
```

If `userInput` is `Alice`, the query is:
```sql
SELECT * FROM users WHERE name = 'Alice'
```

If `userInput` is `'; DROP TABLE users; --`, the query becomes:
```sql
SELECT * FROM users WHERE name = ''; DROP TABLE users; --'
```

The `'` ends the string, `;` ends the first statement, `DROP TABLE users` executes,
`--` comments out the rest. The entire `users` table is deleted.

This is **SQL injection** — the most common database attack. It works whenever user
input is concatenated into a SQL string.

**The fix — parameterised queries:**

```typescript
// Safe — always use this
const result = await pool.query(
  'SELECT * FROM users WHERE name = $1',
  [userInput]
)
```

The `$1` is a placeholder. The database driver sends the query and the parameter values
separately. The database never interprets `userInput` as SQL — it is treated as a literal
data value. Even if `userInput` contains SQL syntax, the database treats it as a string,
not as code.

**Why this works at the protocol level:** In parameterised queries, the SQL statement
and the data are sent in separate parts of the protocol message. The database parses the
SQL (with `$1` as a type-safe placeholder) before receiving the data. Data that arrives
after parsing cannot change the query structure.

Never use string concatenation or template literals to build SQL queries from user input.
Always use parameterised queries.

### Step 6 — Prisma ORM

**What an ORM is:** An **Object-Relational Mapper** translates between your TypeScript
objects and SQL tables. Instead of writing `SELECT * FROM lessons`, you write
`prisma.lesson.findMany()`. The ORM generates the SQL.

**Why Prisma?**
- Type-safe queries: TypeScript knows the types of every column
- Automatic SQL injection prevention: all queries are parameterised
- Migration management: schema changes are versioned and applied safely

**Install Prisma:**
```bash
$ npm install @prisma/client
$ npm install --save-dev prisma
```

**Initialise Prisma:**
```bash
$ npx prisma init
```

This creates:
- `prisma/schema.prisma` — the schema file (defines tables)
- `.env` — environment variables (database connection string)

**`prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Lesson {
  id          Int      @id @default(autoincrement())
  title       String
  difficulty  String   @default("beginner")
  prompt      String
  starterCode String   @map("starter_code")
  createdAt   DateTime @default(now()) @map("created_at")
}
```

**Every field in `schema.prisma`:**
- `generator client` — tells Prisma to generate a TypeScript client (`prisma-client-js`)
- `datasource db` — the database connection. `env("DATABASE_URL")` reads the connection
  string from the `.env` file.
- `model Lesson` — defines the `Lesson` type, which maps to the `lessons` table
- `@id @default(autoincrement())` — this field is the primary key, auto-incremented
- `@map("starter_code")` — the TypeScript field is `starterCode` (camelCase) but the
  database column is `starter_code` (snake_case). `@map` bridges the naming convention.

### Step 7 — Environment Variables

**The rule:** Database credentials are never hardcoded. They live in `.env` files that
are in `.gitignore`.

```bash
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/codex_edu"
```

A **connection string** encodes: `protocol://username:password@host:port/database`.

**Why never in source code:** Any developer who clones the repository sees the credentials.
The credentials are in the git history forever — even after you change them, old commits
still contain them. GitHub scans for leaked credentials and notifies you, but the
damage is done. Teams have been breached because of credentials committed to public repositories.

**`.gitignore` entry:**
```
.env
.env.local
.env.production
```

**`dotenv` package:**
```typescript
import dotenv from 'dotenv'
dotenv.config()  // reads .env and sets process.env variables
```

`dotenv.config()` reads the `.env` file and sets each key-value pair as an environment
variable in `process.env`. After this call, `process.env.DATABASE_URL` is the connection
string.

### Step 8 — The Repository Pattern

**The problem:** If your route handlers write raw SQL, every route knows about the
database schema. If you rename a column, you update every route.

**The solution — the repository pattern:** A repository module wraps the database and
exposes clean functions:

```typescript
// server/src/repositories/lessonRepository.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllLessons() {
  return prisma.lesson.findMany({
    orderBy: { createdAt: 'asc' },
  })
}

export async function getLessonById(id: number) {
  return prisma.lesson.findUnique({
    where: { id },
  })
}
```

**`async` functions and `await` introduced:**
`async function getAllLessons()` is an asynchronous function — it returns a Promise.
`await prisma.lesson.findMany(...)` waits for the database query to complete before
continuing. Without `await`, the function would return a Promise that has not resolved yet.

**`prisma.lesson.findMany()` explained:**
`PrismaClient` provides a namespace for each model. `prisma.lesson` has methods:
- `findMany({ where?, orderBy?, take?, skip? })` — returns an array
- `findUnique({ where: { id } })` — returns one record or `null`
- `create({ data: { ... } })` — inserts and returns the new record
- `update({ where: { id }, data: { ... } })` — updates and returns the record
- `delete({ where: { id } })` — deletes and returns the deleted record

All methods return Promises. All queries are parameterised — Prisma never concatenates
user input into SQL strings.

**The route handler using the repository:**
```typescript
app.get('/api/lessons', async (_req, res) => {
  const lessons = await getAllLessons()
  res.json(lessons)
})
```

The route handler knows nothing about SQL, Prisma, or the database schema. It only calls
repository functions and sends the results. If the database changes, the repository changes;
the route handler stays the same.

**SE lens — the repository pattern:** Routes depend on the repository interface
(`getAllLessons()`), not on Prisma or SQL directly. This is **dependency inversion** —
the route depends on an abstraction, not on a concrete implementation. Switching from
PostgreSQL to MongoDB would require changing only the repository.

---

## Connect the Pieces

`prisma.lesson.findMany()` in the repository is equivalent to `SELECT * FROM lessons`
in SQL — Prisma generates the SQL automatically. When debugging slow queries, understanding
the generated SQL matters. `prisma.$queryRaw` lets you inspect or override the generated
SQL when needed.

In Lesson 13, the `lessons` table will gain a relationship to a `users` table via a
foreign key. In Lesson 23, full-text search will add a `tsvector` index to the `title`
and `prompt` columns. Both changes go through Prisma migrations — never manual SQL
in production.

ACID properties guarantee that the database is reliable:
- **Atomicity** — a transaction either fully completes or fully rolls back
- **Consistency** — data is always in a valid state
- **Isolation** — concurrent transactions do not interfere
- **Durability** — committed data survives server crashes

These guarantees are why you use a database rather than files.

---

## What Breaks Without This

Without parameterised queries (`$1` placeholders), every API endpoint that uses user
input is vulnerable to SQL injection. The test is simple: send `'; DROP TABLE lessons; --`
as a lesson title search query. With concatenation, the table is dropped. With
parameterised queries, the search finds no lessons with that literal title.

Without the `.env` in `.gitignore`, the database credentials will be committed. If the
repository is ever made public (or shared with a contractor), every credential in the
history is compromised — not just the current values, but every historical value.

---

## Definition of Done

- [ ] PostgreSQL is installed and running locally
- [ ] `npx prisma migrate dev --name init` creates the `lessons` table
- [ ] Three lessons are seeded into the database
- [ ] `GET /api/lessons` returns the three lessons as JSON
- [ ] The Lessons screen in the app displays the three real lessons
- [ ] `.env` is in `.gitignore` and not committed
- [ ] You can answer: what is SQL injection and why do parameterised queries prevent it at the protocol level?
- [ ] You can answer: what is a B-tree index and when does one dramatically improve query performance?
- [ ] You can answer: what is the repository pattern and what does it decouple?
- [ ] You can answer: what are ACID properties and why do they matter?
- [ ] `git commit` with a message explaining why — "Add PostgreSQL database with Prisma ORM and lessons table"
