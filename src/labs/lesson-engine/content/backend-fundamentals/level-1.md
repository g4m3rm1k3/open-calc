---
series: backend-fundamentals
level: 1
title: Express.js and Routing
lang: javascript
---

# Express.js and Routing

Express is a minimal Node.js framework. It adds routing (map URLs to handler functions), middleware (run code before/after handlers), and request/response helpers on top of raw Node.js HTTP.

## Installing and basic server

```javascript
// npm install express
// npm install --save-dev @types/express  (if using TypeScript)

const express = require('express');
const app = express();

// Parse JSON request bodies
app.use(express.json());

// Route: GET /
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Route: GET /courses
app.get('/courses', (req, res) => {
  const courses = [
    { id: 1, title: 'Python Fundamentals' },
    { id: 2, title: 'CSS Mastery' },
  ];
  res.json(courses);
});

app.listen(3000, () => console.log('Listening on port 3000'));
```

```text
GET http://localhost:3000/
→ { "message": "API is running" }

GET http://localhost:3000/courses
→ [{"id":1,"title":"Python Fundamentals"},{"id":2,"title":"CSS Mastery"}]

Express route signature: app.METHOD(path, handler)
- METHOD: get, post, put, patch, delete
- path: URL pattern, e.g. '/courses' or '/courses/:id'
- handler: (req, res) => { ... }
```

## Route parameters and query strings

```javascript
// URL parameter: /courses/42 → req.params.id = '42'
app.get('/courses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  // fetch from database...
  res.json({ id, title: 'Python Fundamentals' });
});

// Query string: /courses?lang=python&limit=10
app.get('/courses', (req, res) => {
  const { lang, limit = '20' } = req.query;
  // filter courses by lang, limit results...
  res.json({ lang, limit: parseInt(limit), courses: [] });
});

// Request body (POST/PATCH)
app.post('/courses', (req, res) => {
  const { title, description } = req.body;
  // insert into database...
  res.status(201).json({ id: 4, title, description });
});
```

```text
GET  /courses/42         → req.params.id = '42'
GET  /courses?lang=python → req.query.lang = 'python'
POST /courses  body: {"title":"SQL"}  → req.body.title = 'SQL'

Note: req.params values are always strings — parseInt() when you need a number.
Note: express.json() middleware must be applied for req.body to be populated.
```

**CS lens:** Express routing implements the **front controller** design pattern — all requests enter a single entry point (`app`) and are dispatched to handlers based on method + path matching. Routes are matched in the order they're declared. The first matching route handles the request; subsequent routes are skipped. This is a **chain of responsibility** pattern.

## Middleware

Middleware is a function that runs between the request arriving and the route handler firing. It reads/modifies `req` and `res`, then calls `next()` to pass control forward.

```javascript
// Logging middleware — runs before every route
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} — ${new Date().toISOString()}`);
  next(); // must call next() or the request hangs
});

// Auth middleware — runs before protected routes
function requireAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // verify token...
  req.user = { id: 1, role: 'admin' }; // attach to req for later handlers
  next();
}

// Apply auth middleware to specific route only
app.get('/admin/users', requireAuth, (req, res) => {
  res.json({ users: [] });
});
```

```text
Request pipeline for GET /admin/users:
1. Logging middleware: logs the request, calls next()
2. requireAuth middleware: checks header, attaches req.user, calls next()
3. Route handler: reads req.user, sends response

If requireAuth doesn't call next() (because token is missing):
→ sends 401, handler never runs
```

**SE lens:** Middleware is the **decorator pattern** applied to request handlers. Authentication, rate limiting, request logging, CORS headers, request body parsing — all are middleware. Libraries like `cors`, `helmet`, `express-rate-limit` are Express middleware packages. Understanding middleware means understanding the entire Express ecosystem: every npm package that "integrates with Express" is a middleware function.

**Common mistakes:**
- Forgetting `next()` in middleware — the request hangs indefinitely. The browser shows a loading spinner forever.
- Putting `app.use(express.json())` after routes — middleware runs in declaration order. JSON parsing must be registered before any route that reads `req.body`.

**Debug tip:** Log `req.body` in a POST handler if it's `undefined` — usually means `app.use(express.json())` is missing or placed after the route.

**Next:** Async handlers and error handling — working with databases and handling failures gracefully.

## Challenge: express_routing

Define route patterns for a REST API.

```javascript
// Match the route pattern to its description:
const routes = {
  listAll: 'GET /products',         // list all products
  getOne: '',                        // get product with id 42
  create: '',                        // create a new product
  update: '',                        // partially update product 42
  remove: '',                        // delete product 42
};
```

```test
assert routes.listAll === 'GET /products'
assert routes.getOne === 'GET /products/42' || routes.getOne === 'GET /products/:id'
assert routes.create === 'POST /products'
assert routes.update === 'PATCH /products/42' || routes.update === 'PATCH /products/:id'
assert routes.remove === 'DELETE /products/42' || routes.remove === 'DELETE /products/:id'
```
