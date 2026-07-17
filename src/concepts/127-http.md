---
concept: 127-http
name: HTTP
---

## Definition

HTTP (HyperText Transfer Protocol) is a request-response protocol where a
client sends a request specifying a method (GET, POST, etc.) and a
resource, and a server replies with a status code and a body — the
foundational protocol underlying almost all web communication.

## Problem

Two independent programs — a browser and a web server, or two backend
services — need a shared, standardized way to ask for and exchange
information over a network. Without an agreed protocol, every client and
server pairing would need its own bespoke communication format.

## Execution

Client sends: GET /users/42 HTTP/1.1 (asking for user #42's data)
↓
Server receives the request, looks up user 42
↓
Server replies: HTTP/1.1 200 OK, with a body containing user 42's data
↓
If user 42 didn't exist: server would reply 404 Not Found instead, with no
user data in the body

## Computer Science

HTTP is stateless — each request is handled independently, with no memory
of previous requests baked into the protocol itself. Anything resembling
"the server remembers me" (a login session) is layered on top of HTTP
using mechanisms like cookies, not provided by HTTP itself.

Tags: Request-response protocol, Stateless, Status codes, HTTP methods

## Software Engineering

HTTP methods carry conventional meaning that well-behaved APIs are
expected to respect: GET should never change server state (safe to retry,
cache, or prefetch), POST creates something new, PUT/PATCH update an
existing resource, DELETE removes one. Violating these conventions — a GET
that deletes data — breaks assumptions browsers, caches, and other tools
make about HTTP.

Tags: HTTP methods, Idempotency, RESTful conventions, Status code meaning

## Common Mistakes

- Using GET for an operation that changes server state — this breaks caching/prefetching assumptions and can cause accidental data loss.
- Treating all non-200 status codes as generic "errors" without distinguishing client errors (4xx — the request itself was wrong) from server errors (5xx — the server failed to handle a valid request) — these need different handling.

## Exercises

- Look up what status code should be returned when a resource is created via POST, versus a successful GET — notice they're both "successful" but use different codes.
- Send a request to a real public API and inspect BOTH the status code and the response headers, not just the body.

## javascript

```javascript
// Simulating a simple HTTP-style request/response exchange to demonstrate
// the request -> status code -> body shape without needing a real network call.
function handleRequest(method, path) {
  const users = { 42: { name: 'Alice' } }
  if (method === 'GET' && path === '/users/42') {
    return { status: 200, body: users[42] }
  }
  if (method === 'GET' && path === '/users/99') {
    return { status: 404, body: null }
  }
  return { status: 405, body: null }   // method not allowed / unhandled route
}

console.log(handleRequest('GET', '/users/42'))   // { status: 200, body: { name: 'Alice' } }
console.log(handleRequest('GET', '/users/99'))   // { status: 404, body: null }
```
Walkthrough: this models the core request-response shape HTTP defines —
a method and a path go in, a status code and a body come out. Real HTTP
adds headers, a formal wire format, and TCP underneath, but this captures
the essential request/response contract.

## python

```python
def handle_request(method, path):
    users = {42: {'name': 'Alice'}}
    if method == 'GET' and path == '/users/42':
        return {'status': 200, 'body': users[42]}
    if method == 'GET' and path == '/users/99':
        return {'status': 404, 'body': None}
    return {'status': 405, 'body': None}   # method not allowed / unhandled route


print(handle_request('GET', '/users/42'))   # {'status': 200, 'body': {'name': 'Alice'}}
print(handle_request('GET', '/users/99'))   # {'status': 404, 'body': None}
```
Walkthrough: identical request-in, status-and-body-out shape as the
JavaScript version — this is the essential contract every real HTTP
client/server exchange follows, regardless of language or framework.
