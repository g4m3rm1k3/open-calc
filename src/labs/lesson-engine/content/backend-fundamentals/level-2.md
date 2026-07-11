---
series: backend-fundamentals
level: 2
title: Async Handlers and Error Handling
lang: javascript
---

# Async Handlers and Error Handling

Database queries are async. Express handlers must await them and catch failures. Unhandled promise rejections in route handlers crash the server silently.

## async/await in route handlers

```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/courses', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, title FROM courses ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/courses/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
```

```text
GET /courses     → 200 [{id:1,title:"Python"},{id:2,title:"CSS"}]
GET /courses/99  → 404 {"error":"Not found"}

$1, $2 — parameterized placeholders (PostgreSQL).
NEVER interpolate user input into SQL:
  BAD:  `WHERE id = ${req.params.id}`  ← SQL injection
  GOOD: pool.query('WHERE id = $1', [req.params.id])
```

**CS lens:** SQL injection is the #1 OWASP vulnerability. Parameterized queries send the SQL template and values separately — the database engine treats values as data, never as SQL commands, regardless of what characters they contain.

## Error handling middleware

```javascript
// Error handler — must have exactly 4 params. Defined LAST.
app.use((err, req, res, next) => {
  console.error(err.stack);                     // log full error server-side
  res.status(500).json({ error: 'Internal server error' }); // generic message to client
});
```

```text
Always:
1. Wrap async handlers in try/catch
2. Pass errors to next(err)
3. Define an error middleware with (err, req, res, next) at the bottom

Never send raw database error messages to clients:
  BAD:  res.status(500).json({ error: err.message })
  — may expose table names, column names, query structure
  GOOD: log err.message, send generic string to client
```

## Input validation

```javascript
app.post('/courses', async (req, res, next) => {
  try {
    const { title, lang } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    const allowed = ['javascript', 'python', 'css', 'sql'];
    if (!allowed.includes(lang)) {
      return res.status(400).json({ error: `lang must be one of: ${allowed.join(', ')}` });
    }
    const result = await pool.query(
      'INSERT INTO courses (title, lang) VALUES ($1, $2) RETURNING *',
      [title.trim(), lang]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});
```

```text
POST /courses  {}
→ 400 {"error":"title is required"}

POST /courses  {"title":"SQL","lang":"go"}
→ 400 {"error":"lang must be one of: javascript, python, css, sql"}

POST /courses  {"title":"SQL Fundamentals","lang":"sql"}
→ 201 {"id":4,"title":"SQL Fundamentals","lang":"sql"}
```

**SE lens:** Validation libraries like `zod` define schemas and validate in one step. `z.object({ title: z.string().min(1), lang: z.enum(['python','css','sql']) })` generates both a TypeScript type and a runtime validator. Using the same schema for types and validation eliminates the gap between what TypeScript thinks is valid and what the API actually accepts.

**Common mistakes:**
- Not calling `next(err)` in catch blocks — the error silently disappears, the request hangs.
- Trusting `req.body` types — JSON parse turns numbers into numbers and strings into strings, but `"5"` stays a string. Coerce and validate explicitly.

**Debug tip:** Add `console.log(req.body)` at the top of a POST handler if it's `undefined` or `{}`. Usually means `app.use(express.json())` is missing or placed after the route declaration.

**Next:** Authentication — bcrypt for password hashing and JWTs for stateless sessions.

## Challenge: async_handler

Write an async handler.

```javascript
async function getCourse(id) {
  if (id === 1) return { id: 1, title: 'Python Fundamentals' };
  return null;
}

async function courseHandler(req, res) {
  const id = parseInt(req.params.id);
  // get the course, return 404 if null, 200 with course if found
}
```

```test
var mockRes = { statusCode:200, body:null, status(c){this.statusCode=c;return this;}, json(d){this.body=d;} }
await courseHandler({ params:{ id:'1' } }, mockRes)
assert mockRes.statusCode === 200
assert mockRes.body.title === 'Python Fundamentals'
var mockRes2 = { statusCode:200, body:null, status(c){this.statusCode=c;return this;}, json(d){this.body=d;} }
await courseHandler({ params:{ id:'99' } }, mockRes2)
assert mockRes2.statusCode === 404
```
