# Lesson 13 — Data Modeling From First Principles

## What You Will Build

Add `users` and `progress` tables. Model the relationship between a user and their
lesson progress. The Profile screen shows the logged-in user's completed lessons and
percentage progress through the curriculum. This lesson teaches the design decisions
behind every database schema.

---

## What You Need to Know First

- Lesson 12: PostgreSQL, Prisma schema, SQL, the repository pattern

---

## The Lesson

### Step 1 — Entities, Attributes, and Relationships

Before writing any schema, model the real-world concepts:

**Entities** are things your system tracks:
- A **User** — a person using the app
- A **Lesson** — a piece of curriculum content
- **Progress** — a record that a user has completed a lesson

**Attributes** are properties of each entity:
- User: `id`, `email`, `name`, `createdAt`
- Lesson: `id`, `title`, `difficulty`, `prompt`, `starterCode`, `createdAt`
- Progress: `id`, `userId`, `lessonId`, `completedAt`

**Relationships** express how entities relate:
- A User can have many Progress records (they can complete many lessons)
- A Lesson can have many Progress records (many users can complete it)
- Each Progress record belongs to exactly one User and one Lesson

**Entity-relationship diagrams (ERDs)** visualise this:
```
User (1) ──────── (M) Progress (M) ──────── (1) Lesson
```
One user has many progress records. One lesson has many progress records. This is a
**many-to-many relationship** between User and Lesson, resolved through the `Progress`
junction table.

### Step 2 — Foreign Keys and Referential Integrity

A **foreign key** is a column in one table that references the primary key of another.
In the `progress` table, `user_id` is a foreign key referencing `users.id`.

**Referential integrity:** The database enforces that every `user_id` in `progress`
actually exists in `users`. You cannot have a progress record for a user who does not
exist. If you try to delete a user who has progress records, the database will either:
- Reject the deletion (unless you cascade)
- Delete the progress records first (with `ON DELETE CASCADE`)

Without referential integrity, your database can have orphaned records — progress records
pointing to non-existent users. Queries that join these tables produce unexpected empty
results or null values, causing UI bugs that are hard to trace.

### Step 3 — Joins

When data is in separate tables, you retrieve related data with **joins**.

**`INNER JOIN`:** Returns rows that have matching values in both tables.
```sql
SELECT users.name, lessons.title, progress.completed_at
FROM progress
INNER JOIN users ON progress.user_id = users.id
INNER JOIN lessons ON progress.lesson_id = lessons.id
WHERE users.id = 42;
```

This returns one row for each lesson user 42 has completed, with the user's name and
lesson title joined in.

**`LEFT JOIN`:** Returns all rows from the left table, with matched rows from the right
(or NULL if no match).
```sql
SELECT lessons.title, progress.completed_at
FROM lessons
LEFT JOIN progress ON lessons.id = progress.lesson_id AND progress.user_id = 42
ORDER BY lessons.id;
```

This returns all lessons — whether or not user 42 has completed them. Completed lessons
have a `completed_at` timestamp; incomplete ones have `NULL`. This is the query for
"show all lessons with completion status."

**Why joins instead of multiple queries?** One query with a join sends one round trip
to the database and returns all needed data. Multiple queries send multiple round trips —
each one adds network latency. On a database with 100ms latency, five queries take
500ms; one query with joins takes 100ms.

### Step 4 — Normalisation

**Normalisation** is the process of organising a database to reduce redundancy.

**Without normalisation:**
```
progress table:
┌────┬─────────────┬────────────────────────┬────────────┬────────────┐
│ id │ user_email  │ lesson_title           │ difficulty │ completed  │
├────┼─────────────┼────────────────────────┼────────────┼────────────┤
│  1 │ alice@x.com │ Hello, World           │ beginner   │ 2024-01-15 │
│  2 │ alice@x.com │ Variables and Types    │ beginner   │ 2024-01-16 │
│  3 │ bob@x.com   │ Hello, World           │ beginner   │ 2024-01-17 │
```

Problems:
- Alice's email is stored in every progress row — duplicated data
- If Alice changes her email, every row must be updated — update anomaly
- The lesson title is stored in every row — if the lesson is renamed, every row is stale

**With normalisation:**
- `users` table: `(id, email, name)` — email stored once
- `lessons` table: `(id, title, difficulty)` — title stored once
- `progress` table: `(id, user_id, lesson_id, completed_at)` — references, not copies

**Practical normalisation levels:**
- **1NF (First Normal Form):** Each column holds one value; no repeating groups.
- **2NF:** No partial dependencies on a composite key.
- **3NF (Third Normal Form):** No transitive dependencies — a non-key column depends
  only on the primary key, not on other non-key columns.

You do not need to memorise these forms. The practical rule: each table owns one concept.
`users` owns user identity. `lessons` owns lesson content. `progress` owns completion
records. Nothing else goes in those tables.

### Step 5 — Updating the Prisma Schema

Add the `User` and `Progress` models to `prisma/schema.prisma`:

```prisma
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  name      String
  createdAt DateTime   @default(now()) @map("created_at")
  progress  Progress[]
}

model Progress {
  id          Int      @id @default(autoincrement())
  userId      Int      @map("user_id")
  lessonId    Int      @map("lesson_id")
  completedAt DateTime @default(now()) @map("completed_at")
  user        User     @relation(fields: [userId], references: [id])
  lesson      Lesson   @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
}

model Lesson {
  id          Int        @id @default(autoincrement())
  title       String
  difficulty  String     @default("beginner")
  prompt      String
  starterCode String     @map("starter_code")
  createdAt   DateTime   @default(now()) @map("created_at")
  progress    Progress[]
}
```

**`@unique` on `email`:** Ensures no two users have the same email. The database creates
a unique index on this column — duplicate inserts fail with a constraint violation error.

**`Progress[]` on User and Lesson:** These are **relation fields** — Prisma uses them to
navigate relationships in queries. They do not correspond to a column in the database.

**`@relation(fields: [userId], references: [id])`:** Declares that `userId` in `Progress`
is a foreign key referencing the `id` column of `User`. Prisma enforces referential integrity.

**`@@unique([userId, lessonId])`:** A **composite unique constraint** — the combination of
`userId` and `lessonId` must be unique. A user can only complete each lesson once. Trying
to insert two completion records for the same user/lesson pair fails.

**Run the migration:**
```bash
$ npx prisma migrate dev --name add-users-and-progress
```

`prisma migrate dev` compares the current schema to the database schema, generates SQL
migration files, and applies them. Each migration is stored in `prisma/migrations/`
as a numbered SQL file — the versioned history of schema changes.

### Step 6 — The Cost of Schema Changes

In development, you can freely add, rename, and drop tables. In production, schema changes
are carefully managed:

- **Adding a column with a default:** safe — existing rows get the default value
- **Renaming a column:** dangerous — code deployed before the migration still uses the old name
- **Dropping a column:** dangerous — code deployed after the migration still references it
- **Adding a `NOT NULL` column without a default:** dangerous — existing rows have no value

The pattern for safe schema changes: **expand, migrate, contract**.
1. Add the new column (nullable, or with a default) while keeping the old one
2. Deploy code that writes to both old and new columns
3. Backfill existing rows
4. Deploy code that reads only from the new column
5. Drop the old column

This is over-engineering for a learning project. But understanding it matters when
you join a team with a production database that cannot go down.

### Step 7 — The Progress Repository

Add to `server/src/repositories/progressRepository.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getProgressForUser(userId: number) {
  return prisma.progress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: { id: true, title: true, difficulty: true },
      },
    },
    orderBy: { completedAt: 'desc' },
  })
}

export async function markLessonComplete(userId: number, lessonId: number) {
  return prisma.progress.upsert({
    where: {
      userId_lessonId: { userId, lessonId },
    },
    create: { userId, lessonId },
    update: { completedAt: new Date() },
  })
}

export async function getProgressSummary(userId: number) {
  const [completed, total] = await Promise.all([
    prisma.progress.count({ where: { userId } }),
    prisma.lesson.count(),
  ])
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
```

**`include` explained:**
`include: { lesson: { select: { id, title, difficulty } } }` tells Prisma to fetch the
related Lesson record for each Progress row, selecting only the specified fields. The
generated SQL is a JOIN:
```sql
SELECT progress.*, lessons.id, lessons.title, lessons.difficulty
FROM progress
INNER JOIN lessons ON progress.lesson_id = lessons.id
WHERE progress.user_id = $1
```

**`upsert` explained:**
`upsert` means "update or insert" — if the record exists, update it; if not, create it.
`where: { userId_lessonId: { userId, lessonId } }` identifies the record by the composite
unique key. Prisma generates this key name from the `@@unique` constraint.

**`Promise.all([...])` explained:**
`Promise.all` takes an array of Promises and returns a new Promise that resolves when
all of them resolve. The two counts run concurrently (in parallel), not sequentially.
Fetching both counts in parallel takes as long as the slower query, not the sum of both.

---

## Connect the Pieces

The `users` table here is a placeholder — Lesson 17 adds password hashing, JWT tokens,
and OAuth. But the schema is correct: `id`, `email`, `name`. The authentication system
(Lesson 17) extends this table; it does not replace it.

The `@@unique([userId, lessonId])` constraint that prevents duplicate completions is the
database-level enforcement of a business rule. Lesson 14 (API design) will add validation
in the route handler as a second layer. The constraint is the ground truth; the validation
is defence in depth.

The `Progress` junction table is the standard resolution of a many-to-many relationship.
Every relational database modelling many-to-many uses this pattern: two foreign keys,
an optional composite primary key, and any additional attributes that describe the
relationship (like `completedAt`).

---

## What Breaks Without This

Without `@@unique([userId, lessonId])`, a user completing a lesson while a slow network
causes a retry could create two completion records — the progress count is inflated and
the lesson appears as completed twice in the UI. The unique constraint prevents this at
the database level regardless of race conditions in the API.

Without referential integrity (the `@relation` declaration), `progress.user_id = 999`
is valid even if no user with `id = 999` exists. Joining to `users` would return no
user data, the join would silently drop the row, and the progress record would be
invisible to the user. Orphaned data is silent corruption.

---

## Definition of Done

- [ ] `users` and `progress` tables exist in the database
- [ ] `npx prisma migrate dev` shows no errors
- [ ] `getProgressForUser(1)` returns progress records with lesson data included
- [ ] `markLessonComplete(1, 2)` creates a progress record and is idempotent (calling twice does not create two records)
- [ ] The Profile screen shows the percentage of lessons completed
- [ ] You can answer: what is a foreign key and what is referential integrity?
- [ ] You can answer: what is the difference between `INNER JOIN` and `LEFT JOIN`?
- [ ] You can answer: what is normalisation and what problem does it solve?
- [ ] You can answer: why is schema migration dangerous in production and what is the safe pattern?
- [ ] `git commit` with a message explaining why — "Add users and progress tables with many-to-many relationship"
