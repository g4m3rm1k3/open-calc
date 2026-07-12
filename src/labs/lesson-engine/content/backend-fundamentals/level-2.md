---
series: backend-fundamentals
level: 2
title: Async Handlers and Error Handling
lang: javascript
---

# Async Handlers and Error Handling

Route handlers need to do async work — query a database, read a file, call an external API. These operations take time and can fail. If you do not handle both correctly, Express has two bad failure modes: hanging requests (response never sent) and crashing processes (unhandled promise rejections).

By the end of this lesson you will understand why async code in Express requires explicit error routing, how to write async handlers that never hang, how to build a centralised error handler, and why SQL injection exists and how parameterized queries prevent it.

## Why async matters in Express

In Level 1, all route handlers returned synchronous responses. Real handlers need to query databases. Database queries are **asynchronous** — they take 1–100ms and the result arrives later.

JavaScript is single-threaded (review: Level 0's event loop). If you blocked on a database query, the entire server would freeze for every concurrent user. Instead, Node.js uses **Promises** — objects that represent a value that will arrive later. The `async`/`await` syntax makes Promises readable:

`async function` — declares a function that may contain `await`. It always returns a Promise.

`await expression` — pauses the current function until the Promise resolves, then produces the resolved value. Other events (other requests) continue running while this function is paused.

`try { ... } catch (err) { ... }` — catches any error thrown inside the `try` block, including rejected Promises when using `await`. Without `try/catch`, a failed `await` throws an unhandled rejection.

```javascript
// Simulated database — returns a Promise that resolves after 10ms
function queryDatabase(id) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      if (id === 1) resolve({ id: 1, title: 'Python Fundamentals' });
      else resolve(null);
    }, 10);
  });
}

async function getCourseHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const course = await queryDatabase(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    next(err); // pass errors to Express error middleware
  }
}
```

```text
Trace — GET /courses/1:

  getCourseHandler called
    parseInt('1') → 1
    await queryDatabase(1)
      → function pauses, control returns to event loop
      → 10ms later, Promise resolves with { id:1, title:'Python Fundamentals' }
      → function resumes with course = { id:1, title:'Python Fundamentals' }
    course is not null
    res.json({ id:1, title:'Python Fundamentals' })
  ✓ 200 OK

Trace — GET /courses/99:

  getCourseHandler called
    parseInt('99') → 99
    await queryDatabase(99)
      → 10ms later resolves with null
    course is null
    return res.status(404).json({ error: 'Course not found' })
  ✓ 404 Not Found
```

**Enable Debug and step through this** — watch execution pause at `await queryDatabase(id)` and resume when the Promise resolves. Notice that `return res.status(404).json(...)` stops the function — without `return`, the function continues and reaches `res.json(course)`, which tries to send a second response (causing an error).

**CS lens:** `await` is syntactic sugar over the **continuation-passing** model. When the runtime encounters `await`, it registers the rest of the function as a callback for when the Promise resolves, then yields control. This is the same event loop from Level 0 — `await` is just a readable way to schedule continuations without nested callbacks.

## SQL injection and parameterized queries

Before connecting to a real database, you need to understand the most exploited backend vulnerability.

**SQL injection** happens when user input is embedded directly into a SQL string. The database engine cannot tell where the SQL ends and the data begins, so it executes the data as SQL commands.

```text
DANGEROUS — NEVER DO THIS:

const id = req.params.id;
pool.query(`SELECT * FROM courses WHERE id = ${id}`);

If the user sends id = "1 OR 1=1":
  Query becomes: SELECT * FROM courses WHERE id = 1 OR 1=1
  1=1 is always true — returns every row in the table.

If the user sends id = "1; DROP TABLE courses; --":
  Query becomes: SELECT * FROM courses WHERE id = 1; DROP TABLE courses; --
  Deletes the entire courses table.
```

**Parameterized queries** fix this by sending the SQL template and the data separately. The database engine receives them as two distinct things and never interprets data as SQL commands, regardless of what characters the data contains.

```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// $1 is a placeholder — replaced by the first element of the values array
// The database engine receives the query and values separately
async function getCourseSafe(id) {
  const result = await pool.query(
    'SELECT id, title FROM courses WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}
```

```text
What the database engine receives with parameterized queries:

  SQL:    'SELECT id, title FROM courses WHERE id = $1'
  Values: [99]

The engine substitutes $1 with the value 99 as DATA — it is
impossible for the value to change the structure of the SQL.

Even if the user sends '99; DROP TABLE courses; --', the engine
treats it as the literal string "99; DROP TABLE courses; --"
being compared to an integer column. The query finds no match.
```

**SE lens:** Parameterized queries are non-negotiable. SQL injection is consistently ranked #1 in the OWASP Top 10 web vulnerabilities. Every production database library (pg, mysql2, sqlite3, Sequelize, Prisma) supports parameterized queries — there is never a reason to interpolate user data into SQL. If you see template literals inside `pool.query()`, it is a security bug.

## Centralised error handling

Express has a special four-argument middleware signature `(err, req, res, next)` for error handling. When any middleware calls `next(err)`, Express skips all remaining normal middleware and routes, and jumps directly to the first error handler.

The error handler must be defined **after all routes** — Express identifies it by the four-parameter signature.

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.get('/courses/:id', async function(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }
    const course = await getCourseSafe(id);
    if (!course) return res.status(404).json({ error: 'Not found' });
    res.json(course);
  } catch (err) {
    next(err); // routes errors to the error handler below
  }
});

// Error handler — MUST be defined last, MUST have exactly 4 params
app.use(function(err, req, res, next) {
  console.error(err.stack); // log full error server-side (includes stack trace)
  res.status(500).json({ error: 'Internal server error' }); // generic message to client
});

app.listen(3000);
```

```text
Request pipeline when database throws an error:

  GET /courses/1
  → async handler runs
  → await pool.query(...) throws (database is down)
  → catch(err) catches it
  → next(err) called with the error
  → Express skips all remaining routes/middleware
  → Error handler runs: logs err.stack, sends 500

Without the error handler:
  → next(err) called
  → Express has no error handler registered
  → Error is logged to console but no response is sent
  → Request hangs forever (browser shows loading spinner)
```

**Common mistakes:**
- Not calling `next(err)` in catch blocks — the error is swallowed. No response is sent. The browser hangs.
- Sending raw `err.message` to the client — database error messages often contain table names, column names, and query structure. This is an information disclosure vulnerability. Log the details server-side; send a generic message to the client.
- Defining the error handler before routes — it will never be called because Express finds the error handler immediately and does not register it as an error handler (it looks like normal middleware with an extra param).

**Debug tip:** To find hanging requests, add a timeout middleware early in the stack:
```text
setTimeout(() => { if (!res.headersSent) { res.status(504).json({ error: 'Timeout' }) } }, 5000)
```
If the response times out at 5 seconds, a handler is not calling `next()` or sending a response.

## Challenge: async_handler

Write an async handler using the pattern from this lesson. `fetchCourse(id)` is already defined — it returns a Promise that resolves to a course object or `null`. Call it, return 404 if null, 200 with the course if found. Pass errors to `next`.

```javascript
async function fetchCourse(id) {
  if (id === 1) return { id: 1, title: 'Python Fundamentals' }
  if (id === 2) return { id: 2, title: 'SQL Fundamentals' }
  return null
}

async function courseHandler(req, res, next) {
  // TODO: implement
}
```

```test
var mockRes = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this }, json(d) { this.body = d } }
await courseHandler({ params: { id: '1' } }, mockRes, function() {})
assert mockRes.statusCode === 200
assert mockRes.body.title === 'Python Fundamentals'
var mockRes2 = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this }, json(d) { this.body = d } }
await courseHandler({ params: { id: '99' } }, mockRes2, function() {})
assert mockRes2.statusCode === 404
var mockRes3 = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this }, json(d) { this.body = d } }
await courseHandler({ params: { id: '2' } }, mockRes3, function() {})
assert mockRes3.body.id === 2
```
