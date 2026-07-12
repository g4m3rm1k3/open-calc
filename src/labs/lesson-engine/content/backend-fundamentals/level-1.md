---
series: backend-fundamentals
level: 1
title: Express.js and Routing
lang: javascript
---

# Express.js and Routing

In Level 0 you built an HTTP server with Node's built-in `http` module. It worked — but to handle ten different URLs with different methods and different logic, you would write ten `if` statements inside one giant handler function. That becomes unmaintainable quickly.

**Express.js** is a minimal Node.js framework that solves this problem. It maps each URL pattern and HTTP method to its own handler function — a process called **routing** — and provides a pipeline called **middleware** for code that runs on every request.

By the end of this lesson you will be able to create an Express server, define routes for different HTTP methods and URL patterns, read request data from params/query/body, and write middleware that runs before route handlers.

## Why Express instead of raw http

Without Express, handling different routes looks like this:

```javascript
// Raw Node.js — every route is an if statement
const http = require('http');

const server = http.createServer(function(req, res) {
  if (req.method === 'GET' && req.url === '/') {
    res.end('Home page');
  } else if (req.method === 'GET' && req.url === '/courses') {
    res.end('Courses list');
  } else if (req.method === 'POST' && req.url === '/courses') {
    res.end('Created course');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});
```

With ten routes this is manageable. With a hundred, it is a nested maze. Express replaces the maze with a clean declaration per route.

```text
What Express adds on top of Node's http module:

1. Routing     — app.get('/courses', handler) instead of if statements
2. Middleware  — functions that run before handlers (auth, logging, parsing)
3. Helpers     — res.json(), res.status(), req.params, req.query, req.body
4. Nothing else — Express is intentionally minimal
```

**CS lens:** Express implements the **front controller** pattern — all HTTP requests enter one point (the Express app) and are dispatched to the correct handler based on method and path. Each registered route is an entry in a routing table. The front controller checks the table in registration order and runs the first match.

## Creating an Express server

`require('express')` — loads the Express module. Returns a function that creates an Express application.

`express()` — calling the imported function creates an `app` object. This object holds the routing table and the middleware stack.

`app.use(middleware)` — registers middleware to run on every request. `express.json()` is built-in middleware that reads the raw request body and parses it as JSON, populating `req.body`. Without it, `req.body` is `undefined`.

`app.get(path, handler)` — registers a route for GET requests to `path`. `app.post`, `app.patch`, `app.delete` work the same way for other methods.

`app.listen(port)` — starts the server on `port`. Same as `http.createServer().listen()` under the hood.

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', function(req, res) {
  res.json({ message: 'API is running' });
});

app.get('/courses', function(req, res) {
  const courses = [
    { id: 1, title: 'Python Fundamentals' },
    { id: 2, title: 'SQL Fundamentals' },
  ];
  res.json(courses);
});

app.listen(3000);
console.log('Server listening on port 3000');
```

```text
Trace — what happens when GET /courses arrives:

1. Express checks the middleware stack first.
   express.json() middleware runs: reads body (empty for GET), calls next().

2. Express checks the routing table.
   Does 'GET /courses' match any route? Yes — the second app.get().

3. The handler runs:
   req  — the incoming request object
   res  — the outgoing response object
   res.json(courses) — serializes the array to JSON, sets Content-Type header,
                       sends 200 OK with the JSON body.

4. Response is sent. Connection closes. Handler is done.
```

**Enable Debug and step through this** — watch `app.use(express.json())` register middleware, then `app.get()` register two routes, then `app.listen()` start the server. The handlers are registered but not called until a matching request arrives.

## Route parameters and query strings

URLs carry data in two ways: **route parameters** (embedded in the path) and **query strings** (after the `?`).

**Route parameters** identify a specific resource. `/courses/42` identifies course 42. Express uses `:name` syntax to declare them. The value is accessible via `req.params.name`. Always a string — use `parseInt()` when you need a number.

**Query strings** carry optional filters and options. `/courses?lang=python&limit=10` requests Python courses, max 10. Accessible via `req.query.name`. Also always strings.

**Request body** carries data for POST and PATCH. After `app.use(express.json())`, the parsed object is at `req.body`.

```javascript
// Route parameter — :id matches any value in that path segment
app.get('/courses/:id', function(req, res) {
  const courseId = parseInt(req.params.id);
  res.json({ id: courseId, title: 'Python Fundamentals' });
});

// Query string — ?lang=python&limit=10
app.get('/search', function(req, res) {
  const lang = req.query.lang;
  const limit = parseInt(req.query.limit) || 20;
  res.json({ lang, limit, results: [] });
});

// Request body — POST with JSON body
app.post('/courses', function(req, res) {
  const title = req.body.title;
  const description = req.body.description;
  res.status(201).json({ id: 3, title, description });
});
```

```text
Request                              Express extracts
─────────────────────────────────────────────────────
GET  /courses/42                     req.params.id  = '42'
GET  /search?lang=python&limit=5     req.query.lang = 'python'
                                     req.query.limit = '5'
POST /courses  body: {"title":"SQL"} req.body.title = 'SQL'
```

**Common mistake:** Forgetting `parseInt()` on route params and query values. All values from `req.params` and `req.query` are strings. `req.params.id === 42` is always `false` — you are comparing a string `'42'` to a number `42`. Always parse numbers explicitly.

## Middleware

**Middleware** is a function with three parameters: `req`, `res`, `next`. It runs before route handlers and can read or modify the request, respond early, or call `next()` to pass control to the next middleware or route handler.

The middleware stack runs in registration order — first in, first called.

`next()` — a function Express provides. Calling it passes control to the next registered middleware or route handler. If middleware does not call `next()` and does not send a response, the request hangs indefinitely.

```javascript
// Logging middleware — logs every request
function logRequest(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`${req.method} ${req.path}  ${timestamp}`);
  next(); // pass control to the next middleware or route handler
}

// Auth middleware — blocks unauthenticated requests
function requireAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    res.status(401).json({ error: 'Authorization header required' });
    return; // stop here — do NOT call next()
  }
  req.userId = 99; // attach data to req for later handlers to use
  next();
}

app.use(logRequest); // runs on every request

app.get('/public', function(req, res) {
  res.json({ message: 'Anyone can see this' });
});

app.get('/profile', requireAuth, function(req, res) {
  res.json({ userId: req.userId }); // req.userId was set by requireAuth
});
```

```text
Request pipeline for GET /profile:

  logRequest middleware
    → logs "GET /profile  2025-01-01T00:00:00.000Z"
    → calls next()

  requireAuth middleware (route-specific)
    → checks req.headers['authorization']
    → if missing: sends 401, returns — handler never runs
    → if present: sets req.userId, calls next()

  Route handler
    → reads req.userId (set by requireAuth)
    → sends 200 with { userId: 99 }

Request pipeline for GET /public:

  logRequest middleware → calls next()
  Route handler → sends response
  (requireAuth never runs — not registered for this route)
```

**SE lens:** Middleware is the **pipeline pattern** — each stage transforms the request or makes a decision, then passes it forward. Authentication, rate limiting, CORS headers, request body parsing, logging — all are middleware. Libraries that "add features to Express" (`cors`, `helmet`, `express-rate-limit`) are middleware packages. Understanding this pattern means you can read any Express codebase.

**Common mistakes:**
- Not calling `next()` in middleware — the request hangs. The browser spins forever.
- Calling `next()` after sending a response — Express warns "Cannot set headers after they are sent." If you send a response, return immediately: `return res.status(401).json(...)` — not `res.json(...); next()`.
- Registering `app.use(express.json())` after routes — middleware runs in declaration order. `req.body` is `undefined` on any route registered before `express.json()`.

**Debug tip:** If `req.body` is `undefined` in a POST handler, check two things: (1) is `app.use(express.json())` declared before the route? (2) Did the client set `Content-Type: application/json`? Without that header, Express's JSON parser does not parse the body.

## Challenge: express_routing

Complete the route definitions for a products REST API. Use the HTTP methods and patterns from the lesson — method plus path, e.g. `'GET /products'`.

```challenge
const routes = {
  listAll: 'GET /products',
  getOne: '',       // retrieve the product with id 7
  create: '',       // create a new product
  partialUpdate: '', // update only some fields of product 7
  remove: '',       // delete product 7
}
```

```test
assert routes.listAll === 'GET /products'
assert routes.getOne === 'GET /products/7' || routes.getOne === 'GET /products/:id'
assert routes.create === 'POST /products'
assert routes.partialUpdate === 'PATCH /products/7' || routes.partialUpdate === 'PATCH /products/:id'
assert routes.remove === 'DELETE /products/7' || routes.remove === 'DELETE /products/:id'
```
