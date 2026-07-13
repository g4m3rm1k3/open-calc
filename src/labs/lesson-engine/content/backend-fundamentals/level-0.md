---
series: backend-fundamentals
level: 0
title: What Backend Is
lang: javascript
---

# What Backend Is

When you visit a website, your browser downloads HTML, CSS, and JavaScript files and runs them on your machine. That is the **frontend** — code that runs in the browser, on the user's device.

But where do those files come from? Where does your user account live? Where is the database of courses, orders, or messages? None of that can live in the browser — the browser is untrusted, temporary, and different for every user. The code that owns the data and enforces the rules runs on a remote machine you control. That machine is the **server**, and the code on it is the **backend**.

By the end of this lesson you will be able to explain the client-server model, understand what HTTP is and why it is stateless, and write a minimal HTTP server in Node.js that responds to requests.

## The client-server model

Before the web existed, programs ran entirely on one machine. A spreadsheet read files from disk and displayed results on the same screen. There was no network, no remote data, no coordination between users.

As soon as you need multiple users to share data — a shared document, a shared inbox, a shared database — you need a machine they all connect to. That machine is the **server**. The programs connecting to it are **clients**.

```text
CLIENT (browser)          SERVER (your machine)
────────────────          ──────────────────────
Sends a request  ──────►  Receives request
                          Reads/writes database
Receives response ◄──────  Sends response

One round trip = one HTTP transaction.
```

The key fact: the server does not push anything to clients unprompted. Every interaction starts with a client sending a **request**. The server processes it and sends a **response**. Then the connection closes.

**CS lens:** This request-response model is called **client-server architecture**. It is one of the fundamental distributed system patterns. The alternative — where any node can contact any other node — is called **peer-to-peer**. HTTP uses client-server. The client always initiates; the server always responds.

## HTTP — the language of the web

HTTP (HyperText Transfer Protocol) is the protocol clients and servers use to communicate. A **protocol** is an agreed format for exchanging messages — both sides must follow the same rules or communication fails.

Every HTTP request has:
- A **method** — what kind of action the client wants to perform
- A **path** — which resource the client is asking about
- **Headers** — metadata about the request (content type, auth token, etc.)
- Optionally, a **body** — data sent with the request (for POST/PUT)

Every HTTP response has:
- A **status code** — a number describing the outcome
- **Headers** — metadata about the response
- Optionally, a **body** — the data returned (HTML, JSON, etc.)

```text
HTTP methods and what they mean:

GET    /courses          Read — retrieve the list of courses. No body.
POST   /courses          Create — add a new course. Body contains the new data.
PATCH  /courses/42       Update — change part of course 42. Body contains changes.
DELETE /courses/42       Delete — remove course 42. No body needed.

These four operations — Create, Read, Update, Delete — are called CRUD.
Every database-backed API is mostly CRUD.
```

```text
HTTP status codes (what the server tells the client happened):

2xx — Success
  200 OK              Request succeeded. Body contains the result.
  201 Created         Resource created (POST succeeded). Body contains the new resource.
  204 No Content      Succeeded but nothing to return (DELETE succeeded).

4xx — Client error (the request was wrong)
  400 Bad Request     The client sent malformed data.
  401 Unauthorized    Not logged in — send credentials first.
  403 Forbidden       Logged in, but not allowed to do this.
  404 Not Found       The resource does not exist.

5xx — Server error (the server failed)
  500 Internal Server Error   A bug in the server code. Check server logs.
```

**SE lens:** Status codes are a contract between client and server. A client should never read the body to determine success — it should read the status code first. If your API returns `200 OK` with `{ "error": "not found" }` in the body, clients that check status codes correctly will treat it as a success. Return 404 for not found. Return 400 for bad input. Return 500 when your code throws. Clients depend on this.

**Common mistake:** Returning `200 OK` for error responses. This is one of the most common backend bugs. Every HTTP client library has code that checks the status code to decide whether to proceed or show an error. If you return 200 with an error body, those checks will pass and the error will be ignored or mishandled.

## Node.js — JavaScript on the server

JavaScript was originally designed to run in the browser. **Node.js** is a runtime that lets JavaScript run outside the browser — on a server, in a terminal, anywhere. It uses the same V8 engine that Chrome uses, but removes browser APIs (`document`, `window`) and adds server APIs (`fs`, `http`, `net`, `process`).

`require` — Node.js's module system. `require('http')` loads the built-in `http` module. A **module** is a file (or built-in) that exports functions and objects for other code to use. Modules prevent name conflicts and allow code reuse.

```javascript
const http = require('http');

const server = http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello from the server!' }));
});

server.listen(3000);
console.log('Server listening on port 3000');
```

```text
Trace — what happens when this runs:

1. require('http') loads the built-in http module. Returns an object
   with methods for creating servers, making requests, etc.

2. http.createServer(handler) creates a server object. It does NOT
   start listening yet. The handler function will be called once per
   incoming request. Not called yet — just registered.

3. server.listen(3000) starts the server. Now the server waits for
   connections on port 3000. This line does not block — Node.js is
   event-driven. The program keeps running and the server keeps
   listening until you stop it.

4. console.log(...) runs immediately after listen(). The server is
   ready before this line even prints.

When a request arrives:
  req  — the incoming request object (method, path, headers, body)
  res  — the outgoing response object (write headers, write body, end)
  res.writeHead(200, {...}) — set the status code and headers
  res.end(body)             — send the body and close the connection
```

**Enable Debug and step through this** — watch the program register the handler, start listening, then sit waiting. Notice that `server.listen()` returns immediately; the server does not block execution.

**CS lens:** Node.js uses a single-threaded **event loop**. Instead of creating one OS thread per connection (which is expensive — threads have overhead), Node.js maintains a queue of events. When a request arrives, its handler is added to the queue and called when the current work finishes. I/O operations (reading files, querying databases) are handed to the OS and are non-blocking — Node.js handles other events while waiting. The implication: if your handler blocks the thread (synchronous file reads, heavy computation), every other request waits. This is why backend Node.js code is almost entirely async.

**Common mistake:** Using synchronous Node.js APIs in request handlers. `fs.readFileSync()` blocks the event loop — every concurrent request freezes until the file read completes. Use `fs.promises.readFile()` instead. The rule: if a function ends in `Sync`, it blocks; never use it in a request handler.

**Debug tip:** `curl -v http://localhost:3000` shows the full HTTP conversation — request line, all headers, response status, response headers, and body. The `-v` flag (verbose) is essential for debugging API problems. Add it to every `curl` command when something is not working.

## Challenge: http_server_basics

Fill in the correct HTTP status code and method for each scenario.

```challenge
const scenarios = {
  // A GET request to /users succeeded and returned a list.
  listUsers: { method: '', status: 0 },

  // A POST request to /users created a new user.
  createUser: { method: '', status: 0 },

  // A DELETE request to /users/99 — user 99 does not exist.
  deleteNotFound: { method: '', status: 0 },

  // A GET request to /admin — user is logged in but not an admin.
  forbidden: { method: '', status: 0 },

  // A POST to /login — the request body was missing the password field.
  badRequest: { method: '', status: 0 },
}
```

```test
assert scenarios.listUsers.method === 'GET' && scenarios.listUsers.status === 200
assert scenarios.createUser.method === 'POST' && scenarios.createUser.status === 201
assert scenarios.deleteNotFound.method === 'DELETE' && scenarios.deleteNotFound.status === 404
assert scenarios.forbidden.method === 'GET' && scenarios.forbidden.status === 403
assert scenarios.badRequest.method === 'POST' && scenarios.badRequest.status === 400
```
