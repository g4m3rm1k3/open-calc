---
series: backend-fundamentals
level: 4
title: Database Integration
lang: javascript
---

# Database Integration

Connecting Node.js to a database, running queries safely, managing schema changes with migrations, and organizing database code with the repository pattern.

## Connecting to PostgreSQL

```javascript
// npm install pg
const { Pool } = require('pg');

// Connection pool — reuses connections instead of creating a new one per query
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // or individual fields:
  // host: 'localhost', port: 5432, database: 'myapp', user: 'postgres', password: '...'
  max: 10,              // max connections in pool
  idleTimeoutMillis: 30000,  // close idle connections after 30s
});

// Test connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) throw err;
  console.log('Database connected at:', result.rows[0].now);
});
```

```text
A connection pool maintains N open connections to the database.
Queries borrow a connection, use it, return it to the pool.
Without a pool: every query opens a new TCP connection (~100ms overhead).
With a pool: queries reuse existing connections (~1ms overhead).

max: 10 means a maximum of 10 simultaneous database connections.
If all 10 are in use, new queries wait in a queue.
Too many connections can exhaust PostgreSQL's connection limit.
```

## Migrations — versioned schema changes

A migration is a SQL file that describes one schema change. They run in order and are tracked in a `migrations` table so each runs exactly once.

```javascript
// migrations/001_create_users.sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

// migrations/002_create_courses.sql
CREATE TABLE courses (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  lang        TEXT NOT NULL,
  author_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

// migrations/003_add_description_to_courses.sql
ALTER TABLE courses ADD COLUMN description TEXT;
```

```text
Migration tools:
- node-pg-migrate  — PostgreSQL-specific, excellent for Node.js
- Flyway           — Java-based but language-agnostic
- Prisma Migrate   — integrated with Prisma ORM
- Knex.js          — query builder with migration support

The pattern: never hand-edit the schema in production.
Write a migration for every change. Run migrations in CI.
This means every environment (dev, staging, prod) has identical schema.
```

**CS lens:** Migrations implement **version control for the database**. Just as Git tracks code changes with commits, migrations track schema changes with ordered SQL files. The `migrations` table records which files have run. Running `migrate up` applies new migrations; `migrate down` rolls them back (if down migrations are written). This is the database equivalent of `git log` and `git revert`.

## Repository pattern

The repository pattern separates database queries from route handlers. Route handlers orchestrate; repositories talk to the database.

```javascript
// repositories/courseRepository.js
class CourseRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll({ lang } = {}) {
    const where = lang ? 'WHERE lang = $1' : '';
    const values = lang ? [lang] : [];
    const { rows } = await this.pool.query(
      `SELECT id, title, lang, created_at FROM courses ${where} ORDER BY id`,
      values
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT * FROM courses WHERE id = $1', [id]
    );
    return rows[0] ?? null;
  }

  async create({ title, lang, authorId }) {
    const { rows } = await this.pool.query(
      'INSERT INTO courses (title, lang, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title, lang, authorId]
    );
    return rows[0];
  }
}

// Usage in routes:
const courseRepo = new CourseRepository(pool);

app.get('/courses', async (req, res, next) => {
  try {
    const courses = await courseRepo.findAll({ lang: req.query.lang });
    res.json(courses);
  } catch (err) { next(err); }
});
```

```text
Route handler knows nothing about SQL.
Repository knows nothing about HTTP.
Each has one responsibility — the route handles HTTP, the repository handles data.

Benefits:
- Easy to test the repository in isolation (mock the pool)
- Easy to switch databases (change only the repository)
- SQL lives in one place, not scattered across route files
```

**SE lens:** The repository pattern is the **data access layer** — a facade that hides the persistence mechanism (SQL, ORM, file system) from the rest of the application. This is the same separation of concerns as the MVC pattern's "Model" layer. When you use an ORM like Prisma or TypeORM, the ORM IS the repository — `prisma.course.findMany()` replaces `courseRepo.findAll()`, but the architectural role is identical.

**Common mistakes:**
- Putting SQL directly in route handlers — once you have more than 2-3 queries, routes become unreadable and untestable.
- One repository per endpoint — one repository per resource (users, courses, enrollments), not one per route.

**Debug tip:** Log the SQL query and its parameters when developing: `console.log(query, values)` before `pool.query(query, values)`. This shows exactly what SQL runs and catches parameter order mistakes.

**Next:** Environment variables and deployment — `.env` files, `process.env`, and the basics of deploying a Node.js app.

## Challenge: repository

Implement a simple in-memory repository.

```javascript
const store = [
  { id: 1, title: 'Python Fundamentals' },
  { id: 2, title: 'CSS Mastery' },
];

class CourseRepo {
  findAll() {
    // return all courses
  }
  findById(id) {
    // return course with matching id, or null
  }
}

const repo = new CourseRepo();
```

```test
assert Array.isArray(repo.findAll())
assert repo.findAll().length === 2
assert repo.findById(1).title === 'Python Fundamentals'
assert repo.findById(2).title === 'CSS Mastery'
assert repo.findById(99) === null
```
