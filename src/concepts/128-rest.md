---
concept: 128-rest
name: REST
---

## Definition

REST (Representational State Transfer) is an architectural style for web
APIs where each URL identifies a resource, not an action, and HTTP methods
express what to do to that resource — GET to read it, POST to create one,
PUT/PATCH to update it, DELETE to remove it.

## Problem

An API design that uses one URL per action (`/getUser`, `/deleteUser`,
`/updateUserEmail`) grows an ever-expanding, inconsistent list of endpoints
as more operations are added. REST organizes the same operations around
resources instead (`/users/42`), with the HTTP method itself expressing
which action applies — a small, consistent, predictable set of endpoints
regardless of how many operations exist.

## Execution

GET /users/42 — read user 42's data
↓
PUT /users/42 (with a new email in the body) — replace user 42's data with the given representation
↓
DELETE /users/42 — remove user 42
↓
POST /users (with new user data in the body) — create a brand-new user, server assigns the new ID
↓
Every operation on "the user resource" goes through the SAME URL,
distinguished only by HTTP method

## Computer Science

REST is defined by a small set of architectural constraints — statelessness,
a uniform interface (resources plus standard methods), and resources being
identified by URLs. Meeting these constraints is what makes an API
"RESTful," as opposed to just "an API that happens to use HTTP."

Tags: Resource-oriented design, Uniform interface, Statelessness, Architectural constraints

## Software Engineering

A well-designed REST API groups operations by resource
(`/users`, `/users/:id`, `/users/:id/orders`) rather than by verb, which
makes the API's shape predictable — a developer who understands the
pattern for one resource can guess the pattern for another without needing
separate documentation for every single endpoint.

Tags: API design, Predictability, Resource hierarchies, Nested resources

## Common Mistakes

- Designing "RPC-style" endpoints (`/getUser`, `/deleteUser`) while calling the API "REST" — this misses the core idea of organizing around resources and using HTTP methods to express actions, even if it technically runs over HTTP.
- Using the wrong HTTP method for an operation's actual semantics — this breaks the predictability REST is meant to provide.

## Exercises

- Design RESTful URLs and methods for a "blog post comments" feature — listing comments, adding one, deleting one — following the resource-oriented pattern.
- Compare an RPC-style endpoint list against the equivalent REST design — which scales better as more resources are added?

## javascript

```javascript
// A minimal in-memory "REST-style" router, organizing operations around
// a /users resource rather than one endpoint per action.
class RestRouter {
  #users = { 42: { name: 'Alice' } }
  #nextId = 43

  handle(method, path) {
    if (method === 'GET' && path === '/users/42') return { status: 200, body: this.#users[42] }
    if (method === 'POST' && path === '/users') {
      const id = this.#nextId++
      this.#users[id] = { name: 'NewUser' }
      return { status: 201, body: { id, ...this.#users[id] } }
    }
    if (method === 'DELETE' && path === '/users/42') {
      delete this.#users[42]
      return { status: 204, body: null }
    }
    return { status: 404, body: null }
  }
}

const router = new RestRouter()
console.log(router.handle('GET', '/users/42'))     // { status: 200, body: { name: 'Alice' } }
console.log(router.handle('POST', '/users'))       // { status: 201, body: { id: 43, name: 'NewUser' } }
console.log(router.handle('DELETE', '/users/42'))  // { status: 204, body: null }
```
Walkthrough: all three operations target the same `/users` resource
family — the HTTP method (`GET`, `POST`, `DELETE`) is what distinguishes
"read," "create," and "remove," rather than needing three completely
separate action-named endpoints.

## python

```python
class RestRouter:
    def __init__(self):
        self._users = {42: {'name': 'Alice'}}
        self._next_id = 43

    def handle(self, method, path):
        if method == 'GET' and path == '/users/42':
            return {'status': 200, 'body': self._users[42]}
        if method == 'POST' and path == '/users':
            user_id = self._next_id
            self._next_id += 1
            self._users[user_id] = {'name': 'NewUser'}
            return {'status': 201, 'body': {'id': user_id, **self._users[user_id]}}
        if method == 'DELETE' and path == '/users/42':
            del self._users[42]
            return {'status': 204, 'body': None}
        return {'status': 404, 'body': None}


router = RestRouter()
print(router.handle('GET', '/users/42'))     # {'status': 200, 'body': {'name': 'Alice'}}
print(router.handle('POST', '/users'))       # {'status': 201, 'body': {'id': 43, 'name': 'NewUser'}}
print(router.handle('DELETE', '/users/42'))  # {'status': 204, 'body': None}
```
Walkthrough: identical resource-oriented routing as the JavaScript version
— the same `/users` URL family handles read, create, and delete, with the
HTTP method carrying the intent rather than the URL itself.
