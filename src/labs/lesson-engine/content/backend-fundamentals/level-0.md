---
series: backend-fundamentals
level: 0
title: What Backend Is
lang: javascript
---

# What Backend Is

The backend runs on a server, receives HTTP requests, queries a database, and sends responses. It is everything the user cannot see.

## The client-server model

```javascript
// Conceptual HTTP round trip:
// Browser → GET /courses HTTP/1.1 → Server
//        ← HTTP 200 OK + JSON body ← Server
```

```text
HTTP methods and their meaning:
GET    /courses        — list all courses (read)
POST   /courses        — create a course (write)
PATCH  /courses/:id    — partial update
DELETE /courses/:id    — delete

HTTP status codes:
200 OK           — success with body
201 Created      — resource created
204 No Content   — success, no body
400 Bad Request  — client error
401 Unauthorized — not logged in
403 Forbidden    — logged in but not allowed
404 Not Found    — resource missing
500 Server Error — bug in server code
```

**CS lens:** HTTP is **stateless** — each request carries everything needed to process it. The server keeps no session between requests. Auth state is re-sent on every request as a header (`Authorization: Bearer <token>`).

## Node.js — JavaScript on the server

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello, World!' }));
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

```text
node server.js
→ Server running at http://localhost:3000

curl http://localhost:3000
→ {"message":"Hello, World!"}

localhost — the loopback address. Traffic never leaves your machine.
Port 3000 — where the server listens. Only one process per port.
EADDRINUSE — means the port is already taken.
```

**SE lens:** Node.js uses a single-threaded **event loop**. I/O operations (database queries, file reads) are non-blocking — Node.js handles other requests while waiting. This is why you must use async APIs (`fs.promises.readFile`, not `fs.readFileSync`) in server code. Blocking the event loop blocks every concurrent request.

**Common mistakes:**
- Returning 200 for error responses — clients read status codes, not body text. Return 400/404/500 when appropriate.
- Using synchronous file/database APIs in request handlers — blocks the entire server.

**Debug tip:** `curl -v http://localhost:3000` shows full request and response headers. Standard first step when an API isn't behaving.

**Next:** Express.js — the routing and middleware framework that makes building APIs practical.

## Challenge: http_status

Fill in the correct HTTP status codes.

```javascript
const STATUS = {
  ok: 0,
  created: 0,
  notFound: 0,
  unauthorized: 0,
  serverError: 0,
};
```

```test
assert STATUS.ok === 200
assert STATUS.created === 201
assert STATUS.notFound === 404
assert STATUS.unauthorized === 401
assert STATUS.serverError === 500
```
