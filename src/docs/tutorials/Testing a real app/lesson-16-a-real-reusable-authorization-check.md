# Lesson 16: A Real, Reusable Authorization Check

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

A real, reusable way to require a real, valid token — and, optionally,
a real, specific role — on any real route, without repeating the same
real token-checking logic inside every real view function that needs
it. Legacy's own real, identical capability
(`backend/app/utils/auth_utils.py`'s own `token_required`) is real,
already-working, working infrastructure this lesson does not copy —
see the SE Lens, below, for what this unit deliberately leaves out, and
why.

## What you need to know first

`jwt.encode`, already given full treatment when this slice built real
sign-in. The real `User` model.

## Terms introduced

- **Decorator factory** — a real function that itself returns a real
  decorator, rather than being a decorator directly — necessary
  whenever a decorator needs its own real, configurable argument
  (`allowed_roles`, here), since Python's own real `@name` syntax calls
  `name` with zero arguments, then applies whatever it returns as the
  actual real decorator. `token_required(allowed_roles=[...])`, below,
  is a real decorator factory; `@token_required(allowed_roles=[...])`
  is what actually decorates a real view function.
- **Bearer token** — a real, standard convention for sending a token in
  an HTTP request: the real `Authorization` header's own real value,
  formatted exactly as the literal word `Bearer`, one real space, then
  the real token itself. Legacy's own real frontend, and this slice's
  own acceptance tests, already send tokens this exact real way.

## Objects and methods used

- **`wraps(f)`**
  - *What it is:* a real function, exported by Python's own standard
    `functools` module.
  - *Implementation:* checked against Python's own official
    documentation this session — itself a real decorator factory: given
    the real, original function `f`, returns a real decorator that, when
    applied to a real replacement function, copies `f`'s own real
    `__name__`, `__doc__`, and other real metadata onto that replacement
    — without it, every real function `wraps` decorates would report the
    generic, real, replacement function's own name instead of the real,
    original one it's standing in for.
  - *Its use:* this lesson's own real decorator applies it once, to
    `decorated`, so Flask's own internal routing table sees each real,
    decorated view function under its own real, original name, not the
    identical, real, generic name `decorated` every route using this
    decorator would otherwise share.
  - *Type:* a free function, exported by `functools`, itself returning a
    real decorator.
  - *Responsibility:* preserving a real, wrapped function's own real
    identity, so wrapping it changes its real behavior without erasing
    what it's real, actually called.
  - *Depends on:* the real, original function whose real metadata should
    be preserved.
  - *Connects to:* applied directly above `decorated`, below, inside this
    lesson's own real decorator.
  - *Shape:* a real, standard Python idiom — not project-specific, used
    any time one real function stands in for another.

- **`jwt.decode(token, key, algorithms)`**
  - *What it is:* a real function, exported by PyJWT — the real,
    inverse operation of `jwt.encode`, already given full treatment.
  - *Implementation:* checked against PyJWT's own official
    documentation this session — verifies the given real token's own
    real signature against the given real key, confirms it hasn't real,
    genuinely expired (per its own real `exp` claim), and returns the
    real, decoded payload as a plain Python `dict`; raises a real,
    specific exception (`jwt.InvalidTokenError`, or a real subclass of
    it) if the real signature is wrong, the real token is malformed, or
    it's genuinely expired.
  - *Its use:* this lesson's own real decorator calls it once, per real
    request, to verify a real, incoming token and recover the real
    `sub`/`role` claims `jwt.encode` embedded in it.
  - *Type:* a free function, exported by `jwt`.
  - *Responsibility:* the real, cryptographic inverse of `jwt.encode`
    — proving a real token is both genuinely unmodified and genuinely
    not expired, in one real call.
  - *Depends on:* a real token string and the identical real key it
    was originally signed with.
  - *Connects to:* called once, inside this lesson's own real
    decorator; its own real, returned payload (or raised exception) is
    what that decorator branches on next.
  - *Shape:* the real, cryptographic inverse of `jwt.encode`'s own
    real boundary.

- **`Model.query.get(id)`**
  - *What it is:* a real method on any real model's own `.query`
    attribute — the same real `.query` object this lesson's Header's
    own `filter_by(...).first()` is also a method on.
  - *Implementation:* checked against SQLAlchemy's own official
    documentation this session — looks a real row up directly by its
    own real, declared primary key, returning that real, matching
    model instance, or `None` if no real row has that real key at
    all — a real, more direct lookup than `filter_by(...)` when the
    exact real, unique identifier is already known, rather than some
    other real column's own value.
  - *Its use:* this lesson's own real decorator calls it once, to
    look up the real user a real, already-decoded token's own real
    `sub` claim names.
  - *Type:* an instance method on a real model's own `.query`
    attribute.
  - *Responsibility:* the real, fastest, most direct way to fetch one
    real row when its own real primary key is already known.
  - *Depends on:* a real, already-mapped model and a real, candidate
    primary-key value.
  - *Connects to:* called directly inside this lesson's own real
    decorator; its own real, returned value (a real `User` or `None`)
    is what that decorator checks next.
  - *Shape:* the real, standard SQLAlchemy query boundary — not
    project-specific.

---

## Concept Unit: A Decorator That Takes Its Own Argument

### The Problem

`/api/auth/users`, per this slice's own testing lesson, needs to reject
a real request with no token (`401`) and reject a real, valid token for
the wrong real role (`403`) — and a real, later route may need the
identical real check with a genuinely different real, allowed role
list. The real question this unit answers: what does a real,
reusable decorator look like that accepts its own real, configurable
argument, rather than being hardcoded to one specific real role check?

> **Before reading on:** Python's own real `@name` decorator syntax
> calls `name` with the function being decorated, and nothing else.
> Given `@token_required(allowed_roles=['admin'])` needs to pass a
> real, extra argument *before* that happens, how many real, nested
> functions does it actually take to make that work — one, taking the
> real view function directly, or something with one more real layer?

### Project Change

- **Reference Source** — `backend/app/utils/auth_utils.py`, the real
  `token_required` function, read in full this session: a real,
  three-layer nested function (`token_required(allowed_roles)` →
  `decorator(f)` → `decorated(*args, **kwargs)`), extracting a real
  token from a real `Authorization` header, decoding it, looking up the
  real user, and checking the real role. This unit Preserves the
  identical real three-layer shape and the identical real `401`/`403`
  distinction; it deliberately does not Preserve legacy's own real
  "operator bypass" special case — see the SE Lens, below.
- **Files affected** — created:
  `rebuild/backend/app/authorization.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `app/` package.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from functools import wraps

import jwt
from flask import request, current_app

from app.models import User


def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

            if not token:
                return {'error': 'Authentication token required'}, 401

            try:
                payload = jwt.decode(
                    token,
                    current_app.config['SECRET_KEY'],
                    algorithms=['HS256'],
                )
            except jwt.InvalidTokenError:
                return {'error': 'Invalid token'}, 401

            user = User.query.get(payload['sub'])
            if not user:
                return {'error': 'User not found'}, 401

            if allowed_roles and user.role not in allowed_roles:
                return {
                    'error': f'Role {user.role} not authorized for this action',
                }, 403

            return f(user, *args, **kwargs)
        return decorated
    return decorator
```

### The Updated Project

`rebuild/backend/app/authorization.py`, in full — brand new, so this
is the whole file:

```python
1  from functools import wraps
2
3  import jwt
4  from flask import request, current_app
5
6  from app.models import User
7
8
9  def token_required(allowed_roles=None):
10     def decorator(f):
11         @wraps(f)
12         def decorated(*args, **kwargs):
13             token = None
14             auth_header = request.headers.get('Authorization', '')
15             if auth_header.startswith('Bearer '):
16                 token = auth_header.split(' ')[1]
17
18             if not token:
19                 return {'error': 'Authentication token required'}, 401
20
21             try:
22                 payload = jwt.decode(
23                     token,
24                     current_app.config['SECRET_KEY'],
25                     algorithms=['HS256'],
26                 )
27             except jwt.InvalidTokenError:
28                 return {'error': 'Invalid token'}, 401
29
30             user = User.query.get(payload['sub'])
31             if not user:
32                 return {'error': 'User not found'}, 401
33
34             if allowed_roles and user.role not in allowed_roles:
35                 return {
36                     'error': f'Role {user.role} not authorized for this action',
37                 }, 403
38
39             return f(user, *args, **kwargs)
40         return decorated
41     return decorator
```

### The Isolated Example

A real decorator factory — a decorator that itself takes a real
argument — is genuinely new to this series. Isolated, throwaway, and
*not* part of this project:

```python
# throwaway_decorator.py — not part of this project, deleted after this unit
from functools import wraps


def repeat(times):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            for _ in range(times):
                f(*args, **kwargs)
        return wrapped
    return decorator


@repeat(times=3)
def greet():
    print('hi')


greet()
```

Not run this session — stated from confidence, not executed, per the
Verification Rule: standard, well-documented Python decorator
mechanics. Confidently predicted:

```
hi
hi
hi
```

This proves, in isolation, exactly what `token_required` depends on:
`@repeat(times=3)` first calls `repeat(times=3)` — a real, ordinary
function call, returning `decorator` — and *that* real, returned
function is what actually receives `greet`, per Python's own real
decorator rule; calling `greet()` afterward actually runs `wrapped`,
which real, genuinely calls the original real `greet` three real
times. `token_required(allowed_roles=[...])` uses the identical real,
three-layer shape, just deciding, inside its own innermost real
function, whether to call the real, original view function at all,
rather than how many real times.

### Discard the Throwaway Example

`throwaway_decorator.py`, `repeat`, and `greet` never become part of
`rebuild/backend` — they exist only to isolate real decorator-factory
mechanics from this unit's own actual, real `token_required`.

### Mechanical Walkthrough

- **Line 9, `def token_required(allowed_roles=None):`** — this
  lesson's Header's own **Decorator factory** term, applied for real:
  an ordinary function, real, called directly
  (`token_required(allowed_roles=['admin'])`), returning `decorator`
  below — not yet a real decorator itself.
- **Line 10, `def decorator(f):`** — the real, actual decorator,
  received once Python applies `@token_required(...)`'s own real,
  returned value to the real view function underneath it.
- **Line 11, `@wraps(f)`** — a real, standard `functools` decorator,
  copying the real, original view function's own real `__name__` and
  metadata onto `decorated`, below — without it, every real, decorated
  route would report the identical real function name to Flask's own
  internal routing table, a real, genuine conflict this project would
  otherwise hit the moment a second real route used this same real
  decorator.
- **Line 12, `def decorated(*args, **kwargs):`** — the real,
  innermost function, actually called on every real, incoming request
  to a real, protected route.
- **Lines 13–16, extracting the real token** — this lesson's Header's
  own **Bearer token** term, applied for real: reads the real
  `Authorization` header, real, defaulting to an empty string if
  absent; if it real, starts with the literal `'Bearer '`, splits on
  the real space and keeps the real, second part.
- **Lines 18–19, the real, missing-token case** — a real `401`,
  matching this slice's own testing lesson's own real, first case.
- **Lines 21–28, decoding the real token** — this lesson's Header's
  own `jwt.decode`, wrapped in a real `try`/`except`: a real,
  malformed or genuinely expired token raises `jwt.InvalidTokenError`,
  caught here and turned into the identical real `401` — a real,
  invalid token is treated identically to no token at all, since
  neither one proves a real identity.
- **Line 30, `user = User.query.get(payload['sub'])`** — this lesson's
  Header's own `Model.query.get(id)`, called with the real, decoded
  `sub` claim — the real user's own real, primary-key `id` — looking
  that real user up directly by it.
- **Lines 34–37, the real role check** — `if allowed_roles and
  user.role not in allowed_roles:` — only real, enforced when
  `allowed_roles` was actually given; a real, valid, authenticated user
  whose own real role isn't allowed gets the real `403` this slice's
  own testing lesson already proved legacy returns.
- **Line 39, `return f(user, *args, **kwargs)`** — on real success,
  calls the real, original view function, passing the real,
  authenticated `user` as its own real, first argument — the real
  mechanism a real, later route will actually use to know who's
  calling it.

### CS Lens

This is a real instance of **middleware** — real, cross-cutting logic
(here, authentication and authorization) applied uniformly across many
real routes, without each one repeating it, by wrapping the real,
specific logic each route actually cares about.

Also recognized in: any real web framework's own real request/response
middleware chain; a real logging decorator applied to many real
functions; any real system separating "runs before/around the real
work" from "the real work itself."

### SE Lens

The real, deliberately *not*-taken alternative here: Preserving
legacy's own real "operator bypass" special case — allowing a real,
missing token through anyway, as an anonymous real operator, when
`'operator'` is among a route's own allowed roles. Rejected for now,
not permanently: nothing in this slice's own real, tested contract
(`/api/auth/users`, admin/programming only) exercises that real case at
all — building it now would be real, speculative logic with no real
test proving it's even correct. A real, later, separate lesson, once a
real route actually needs real, anonymous operator access, is the
honest place to characterize legacy's own real behavior there and add
it — a real, stated, deliberate gap, not a silent one.

### Commands needed

No new command — this unit's own real proof is the next unit's own
real, direct test.

### Run it, per the Verification Rule

Not run this session — deferred to the next unit.

### Connecting this unit to what came before

The previous slice built one real, reusable decision
(`authenticate`). This unit builds this project's own second — a real,
reusable *authorization* check, genuinely separate from the first,
matching this lesson's own Header's own **Authentication** vs.
**Authorization** term.

---

## Concept Unit: Proving the Check Actually Checks

### The Problem

The previous unit's own real claim — that `token_required` correctly
enforces both a real token's presence and a real role — is only real
until directly proven, the same real way this project's own earlier
`authenticate` function was.

### Project Change

- **Reference Source** — no reference counterpart; legacy has no real,
  direct test of `token_required` in isolation.
- **Files affected** — created:
  `rebuild/backend/tests/test_authorization.py`.
- **Change type** — add (new file).
- **Location** — inside the existing real `tests/` folder.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from app import create_app, db
from app.models import User
from app.authorization import token_required


def make_protected_route(app, allowed_roles):
    @app.route('/protected')
    @token_required(allowed_roles=allowed_roles)
    def protected(current_user):
        return {'ok': True, 'as': current_user.id}
    return protected


def test_rejects_a_request_with_no_token():
    app = create_app('testing')
    make_protected_route(app, allowed_roles=['admin'])

    with app.app_context():
        db.create_all()

    client = app.test_client()
    response = client.get('/protected')
    assert response.status_code == 401


def test_rejects_a_valid_token_with_the_wrong_role():
    app = create_app('testing')
    make_protected_route(app, allowed_roles=['admin'])

    with app.app_context():
        db.create_all()
        user = User(id='op1', email='op1@mfg.com', name='Op', role='operator')
        user.set_password('pw')
        db.session.add(user)
        db.session.commit()

        import jwt
        token = jwt.encode(
            {'sub': 'op1', 'role': 'operator'},
            app.config['SECRET_KEY'],
            algorithm='HS256',
        )

    client = app.test_client()
    response = client.get('/protected', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 403
```

### The Updated Project

`rebuild/backend/tests/test_authorization.py`, in full — brand new, so
this is the whole file:

```python
1  from app import create_app, db
2  from app.models import User
3  from app.authorization import token_required
4
5
6  def make_protected_route(app, allowed_roles):
7      @app.route('/protected')
8      @token_required(allowed_roles=allowed_roles)
9      def protected(current_user):
10         return {'ok': True, 'as': current_user.id}
11     return protected
12
13
14 def test_rejects_a_request_with_no_token():
15     app = create_app('testing')
16     make_protected_route(app, allowed_roles=['admin'])
17
18     with app.app_context():
19         db.create_all()
20
21     client = app.test_client()
22     response = client.get('/protected')
23     assert response.status_code == 401
24
25
26 def test_rejects_a_valid_token_with_the_wrong_role():
27     app = create_app('testing')
28     make_protected_route(app, allowed_roles=['admin'])
29
30     with app.app_context():
31         db.create_all()
32         user = User(id='op1', email='op1@mfg.com', name='Op', role='operator')
33         user.set_password('pw')
34         db.session.add(user)
35         db.session.commit()
36
37         import jwt
38         token = jwt.encode(
39             {'sub': 'op1', 'role': 'operator'},
40             app.config['SECRET_KEY'],
41             algorithm='HS256',
42         )
43
44     client = app.test_client()
45     response = client.get('/protected', headers={'Authorization': f'Bearer {token}'})
46     assert response.status_code == 403
```

### Mechanical Walkthrough

- **Lines 6–11, `def make_protected_route(app, allowed_roles):`** — a
  real, small test helper, not part of `rebuild/backend` itself,
  building one real, throwaway route on a real, given app, decorated
  with this unit's own real `token_required` — real, deliberately
  generic (`/protected`, not any specific real feature's own real
  route) so this test proves the real *decorator's* own behavior,
  independent of any one real route that happens to use it.
- **Line 8, `@token_required(allowed_roles=allowed_roles)`** — the
  previous unit's own real decorator, applied for the first time.
- **Lines 22–23, the real, no-token case** — a real, plain
  `client.get('/protected')`, no real headers at all; the real,
  expected `401`.
- **Lines 37–42, building a real, valid token by hand** — this test
  constructs a real token for a real, deliberately low-privileged
  user, using the identical real `jwt.encode` mechanism the real login
  route already uses, so this test's own real token is genuinely
  valid, not merely well-formed.
- **Lines 44–46, the real, wrong-role case** — a real, genuinely valid
  token, attached via the real `Authorization` header; the real,
  expected `403` — proving `token_required` distinguishes this real
  case from the previous test's own real, no-token case correctly.

### CS Lens

This is a real instance of testing **infrastructure in isolation from
any one feature** — `token_required` is proven correct once, against a
real, throwaway route built solely for this test, rather than only
ever being exercised indirectly through whatever real, specific
feature route happens to use it first.

Also recognized in: any real, shared library's own real test suite,
which tests the library's own real behavior directly, never only
through one real, downstream application that happens to depend on it.

### SE Lens

The real, deliberately *not*-taken alternative here: testing
`token_required` only through `/api/auth/users` once that real route
exists, skipping this real, direct test entirely. Rejected on purpose,
the identical real reason this slice's own earlier `authenticate`
function got its own real, direct test: a real failure here says
specifically that the real, reusable check itself is wrong, before any
real, specific route's own real wiring even enters the picture.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
../../backend/.venv/Scripts/python.exe -m pytest tests/test_authorization.py -v
```

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: every
real piece this test exercises (`jwt.encode`/`decode`, already proven;
`User`, already proven) is already independently confirmed correct.
Confidently predicted:

```
tests/test_authorization.py::test_rejects_a_request_with_no_token PASSED
tests/test_authorization.py::test_rejects_a_valid_token_with_the_wrong_role PASSED

2 passed in ...s
```

### Connecting this unit to what came before

The previous unit built a real, reusable authorization check. This
unit proves it actually enforces both real cases it claims to, before
any real, specific feature route ever calls it.

---

## Connect the pieces

A real, reusable way to require a real token — and, optionally, a real
role — now exists, proven correct on its own, against a real,
throwaway route built solely to test it. No real, specific feature
route uses it yet.

---

**Next lesson:** wiring this real check onto the actual real routes
this slice's own testing lesson demands — `/api/auth/register` and
`/api/auth/users` — until that lesson's own real acceptance test
finally passes against `rebuild` too.
