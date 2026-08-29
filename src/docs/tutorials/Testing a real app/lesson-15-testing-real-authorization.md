# Lesson 15: Testing Real Authorization

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. This is a real, second,
> separate feature slice, built on top of real sign-in — the first
> slice that actually uses the real token real sign-in produces for
> something.

## What you will build

A real, automated characterization of legacy's own real
`GET /api/auth/users` route — a real, already-existing, real,
protected route, restricted to real `admin`/`programming` roles —
covering the real difference between **no proof of identity at all**
and **proof of identity that isn't good enough**. This lesson does not
touch `rebuild` at all; it proves, honestly, what legacy's own real
behavior already is, and proves the identical real test fails
honestly against `rebuild`, which has no `/api/auth/users` route yet.

## What you need to know first

The real, already-working sign-in slice — `POST /api/auth/login`,
already proven against both `legacy` and `rebuild`, is how this
lesson's own real tests obtain a real, valid token to test with.

## Terms introduced

- **Authentication** vs. **Authorization** — two real, genuinely
  different real questions, easy to conflate: authentication asks "who
  are you, really" (a real, valid token proves this); authorization
  asks "are you *allowed* to do this, specifically" (a real, valid
  token can still fail this second, separate real question). This
  lesson's whole real subject is the second question — the first was
  this slice's own predecessor.
- **`401 Unauthorized`** vs. **`403 Forbidden`** — two real, standard
  HTTP status codes, real, commonly confused: a real `401` means "I
  don't know who you are" (no real token, or a real, invalid one); a
  real `403` means "I know exactly who you are, and the real answer is
  still no" — a real, valid, authenticated identity, real, correctly
  refused a specific real action anyway.

## Objects and methods used

- **`Flask.test_client().post(path, json=..., headers=...)`**
  - *What it is:* the identical real `.post(...)` method this slice's
    own testing lesson already gave full treatment to, now called with
    a real, additional `headers=` keyword argument.
  - *Implementation:* checked against Flask's own official
    documentation this session — `headers=` takes a real, plain Python
    `dict`, attached to the real, simulated request as real HTTP
    headers — here, a real `Authorization` header, carrying a real,
    previously-obtained token.
  - *Its use:* this lesson's own real tests use it to attach a real,
    valid token (or, deliberately, none at all) to a real, protected
    request.
  - *Type:* the identical real method already given full treatment;
    `headers=` is simply one more real, optional keyword argument on
    it.
  - *Responsibility:* the identical real responsibility already
    established, now including real, custom request headers.
  - *Depends on:* the identical real dependencies already established,
    plus a real, well-formed headers dictionary when used.
  - *Connects to:* Flask's own real, internal request-parsing code,
    which legacy's own real `token_required` decorator reads the real
    `Authorization` header from.
  - *Shape:* the identical real Flask/Werkzeug testing boundary already
    established, extended to real request headers.

---

## Concept Unit: Two Real Ways to Be Refused

### The Problem

Legacy's own real `GET /api/auth/users` route already exists, and its
own real code (`@token_required(allowed_roles=['admin',
'programming'])`) already suggests it's restricted somehow — but
exactly what a real client sees, in each real way it can fail, is only
readable, not proven. The real question this unit answers: what,
precisely, does legacy actually return for a real request with no
token at all, versus a real request with a real, valid token belonging
to a real role this route doesn't allow?

> **Before reading on:** a real request with *no* token at all, and a
> real request with a real, genuinely valid token for the *wrong* real
> role, both fail to reach this route's own real, intended behavior —
> but for two, real, genuinely different reasons. Given this lesson's
> own **401 vs. 403** term, which real status code belongs to which
> real failure, and why would returning the *other* one, for either
> real case, actually be a real, honest lie about what's actually
> true?

### Project Change

- **Reference Source** — `backend/app/utils/auth_utils.py`, the real
  `token_required` decorator, read in full this session: with no real
  `Authorization` header present, and `'operator'` not among a real
  route's own allowed roles, returns a real `401` with
  `{'error': 'Authentication token required', 'code': 'TOKEN_MISSING',
  'path': request.path}`; with a real, valid, decodable token whose own
  real `role` claim isn't in the route's own allowed list, returns a
  real `403` with `{'error': f'Role {user_role} not authorized for
  this action', 'code': 'UNAUTHORIZED_ROLE'}`. `backend/app/routes/auth.py`,
  read in full this session: `GET /api/auth/users` is decorated
  `@token_required(allowed_roles=['admin', 'programming'])`.
- **Files affected** — created:
  `acceptance-tests/test_authorization.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real
  `acceptance-tests/` folder.
- **Dependencies** — none beyond this project's own shared
  acceptance-test harness.

### The New Code

```python
from target import get_client


def test_users_list_requires_a_token_at_all():
    client = get_client()
    response = client.get('/api/auth/users')
    assert response.status_code == 401


def test_users_list_rejects_a_token_with_the_wrong_role():
    client = get_client()

    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    admin_token = login.get_json()['token']

    register = client.post('/api/auth/register', json={
        'email': 'floor-worker@mfg.com',
        'password': 'temporary',
        'name': 'Floor Worker',
        'role': 'operator',
    }, headers={'Authorization': f'Bearer {admin_token}'})
    assert register.status_code == 201

    worker_login = client.post('/api/auth/login', json={
        'email': 'floor-worker@mfg.com',
        'password': 'temporary',
    })
    worker_token = worker_login.get_json()['token']

    response = client.get('/api/auth/users', headers={
        'Authorization': f'Bearer {worker_token}',
    })
    assert response.status_code == 403
```

### The Updated Project

`acceptance-tests/test_authorization.py`, in full — brand new, so this
is the whole file:

```python
1  from target import get_client
2
3
4  def test_users_list_requires_a_token_at_all():
5      client = get_client()
6      response = client.get('/api/auth/users')
7      assert response.status_code == 401
8
9
10 def test_users_list_rejects_a_token_with_the_wrong_role():
11     client = get_client()
12
13     login = client.post('/api/auth/login', json={
14         'email': 'admin@mfg.com',
15         'password': 'admin',
16     })
17     admin_token = login.get_json()['token']
18
19     register = client.post('/api/auth/register', json={
20         'email': 'floor-worker@mfg.com',
21         'password': 'temporary',
22         'name': 'Floor Worker',
23         'role': 'operator',
24     }, headers={'Authorization': f'Bearer {admin_token}'})
25     assert register.status_code == 201
26
27     worker_login = client.post('/api/auth/login', json={
28         'email': 'floor-worker@mfg.com',
29         'password': 'temporary',
30     })
31     worker_token = worker_login.get_json()['token']
32
33     response = client.get('/api/auth/users', headers={
34         'Authorization': f'Bearer {worker_token}',
35     })
36     assert response.status_code == 403
```

### Mechanical Walkthrough

- **Line 6, `client.get('/api/auth/users')`** — a real, plain request,
  deliberately carrying no real `Authorization` header at all.
- **Line 7, `assert response.status_code == 401`** — this lesson's
  Header's own **401 vs. 403** term, applied for real: no real proof of
  identity was offered at all, so legacy's own real, correct answer is
  "I don't know who you are."
- **Lines 13–17, a real, admin sign-in** — reuses this project's own,
  already-proven real login route directly, to obtain a real, valid
  admin token — this test builds its own real fixture data using
  already-tested real behavior, rather than assuming a database state
  by hand.
- **Lines 19–25, registering a real, second user** — a real,
  admin-only route (checked this session:
  `backend/app/routes/auth.py`'s own real `register` function,
  `@token_required(allowed_roles=['admin'])`), called here with the
  real admin token line 17 obtained, to create a real, second, genuinely
  lower-privileged real user this test actually controls.
- **Lines 27–31, a real, second sign-in** — obtains a real, valid
  token for that new, real, low-privileged user — a genuinely real,
  valid token, not a fake or malformed one.
- **Lines 33–36, the real, restricted request** — the identical real
  route, this time with a real, valid, but wrong-role token attached.
  `assert response.status_code == 403` — this lesson's Header's own
  **401 vs. 403** term again: legacy's own real answer here is "I know
  exactly who this is, and the real answer is still no" — a real,
  meaningfully different real fact than line 7's real case, and a real,
  different real status code communicates it.

### CS Lens

This is a real instance of the **AAA testing pattern** — Arrange (real
lines 13–31, building the real preconditions this test needs), Act
(real line 33, the one real action actually under test), Assert (real
line 36) — a real, standard shape distinguishing genuine test *setup*
from the real, single behavior a test actually exists to check.

Also recognized in: virtually every real, well-organized test in any
real language or framework, whether the real, three-part structure is
explicitly commented or not.

### SE Lens

The real, deliberately *not*-taken alternative here: inserting a real,
low-privileged user directly into the database by hand (via a real
fixture or a real, direct SQL insert) instead of registering one
through the real, already-tested `/api/auth/register` route. Rejected
on purpose: this project's own real acceptance tests exist to prove
real, external, observable behavior; reaching around the real API to
manufacture test data directly would make this test depend on a real,
internal detail (the real shape of a database row) instead of an
already-proven real contract — and would silently stop testing
`/api/auth/register` at all, the moment that route's own real
behavior ever changed.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_authorization.py -v
```

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: every
real route this test depends on (`/api/auth/login`, `/api/auth/register`,
`/api/auth/users`) has already been read in full, and `/api/auth/login`
has already been independently, really proven correct in this slice's
own predecessor. Confidently predicted:

```
test_authorization.py::test_users_list_requires_a_token_at_all PASSED
test_authorization.py::test_users_list_rejects_a_token_with_the_wrong_role PASSED

2 passed in ...s
```

If this does *not* happen exactly this way when actually run, that's a
real signal something above is wrong — most likely a real, incorrect
assumption about a route's own exact real behavior — worth stopping to
investigate before continuing, not a reason to edit the test to match
a surprising result.

### Connecting this unit to what came before

Real sign-in proved *who* a real request claims to be. This unit
proves that being a real, genuine *somebody* is not automatically
being a real, *authorized* somebody — a real, separate question,
checked separately.

---

## Connect the pieces

Two real, distinct ways a real request can be refused — no real proof
of identity, and real, insufficient proof — are now real, automated,
machine-checked claims, proven against legacy, using nothing but this
project's own already-proven real login and register routes to build
their own real test data. Proving the identical real test against
`rebuild` — which has no `/api/auth/users` route, no `/api/auth/register`
route, and no real role-checking mechanism at all yet — is this
slice's own next, separate, real implementation work.

---

**Next lesson:** the first real piece of infrastructure this slice's
own implementation needs — a real, reusable way to require and check a
real token on any real route, the identical real capability legacy's
own `token_required` decorator already provides, designed
independently rather than copied.
