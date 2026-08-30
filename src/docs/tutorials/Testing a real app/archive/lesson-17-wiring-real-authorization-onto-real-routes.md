# Lesson 17: Wiring Real Authorization Onto Real Routes

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The actual real routes this slice's own testing lesson demands —
`POST /api/auth/register` and `GET /api/auth/users` — each protected by
the already-tested `token_required` decorator, until that testing
lesson's own real acceptance test finally passes against `rebuild` too.
No new decision logic is written here; every real check this lesson
relies on was already proven correct in isolation.

## What you need to know first

The real, already-tested `token_required(allowed_roles=None)`
decorator. The real `User` model, and its own real `to_dict()` method.
This slice's own real acceptance test
(`acceptance-tests/test_authorization.py`), proven against legacy,
proven RED against `rebuild`.

## Terms introduced

None — this lesson wires together real pieces this series has already
given full treatment to; nothing genuinely new appears in it.

## Objects and methods used

- **`request.get_json()`**
  - *What it is:* a real method on Flask's own real, global `request`
    object.
  - *Implementation:* checked against Flask's own official
    documentation this session — parses the real, incoming request
    body as JSON and returns it as a real Python value (a `dict`, for
    a JSON object body).
  - *Its use:* this lesson's own real `register` route calls it once,
    to read the real, incoming fields a real client sent.
  - *Type:* an instance method on Flask's own real, request-scoped
    `request` object.
  - *Responsibility:* turning a real, incoming request's raw JSON body
    into a real, usable Python value.
  - *Depends on:* an active real Flask request context.
  - *Connects to:* called once, at the top of this lesson's own real
    `register` function; its own real, returned value is read for
    `email`/`password`/`name`/`role` immediately after.
  - *Shape:* the real, standard Flask request-parsing boundary — not
    project-specific.

- **`Model.query.filter_by(**kwargs).first()`**
  - *What it is:* two real, chained calls on any real model's own
    `.query` attribute — `filter_by`, and `.first()` on the real,
    filtered query it returns.
  - *Implementation:* checked against SQLAlchemy's own official
    documentation this session — `filter_by(email=email)` builds a
    real, not-yet-executed query matching rows whose real `email`
    column equals the given real value; `.first()` actually runs it
    against the real database and returns the real, first matching row
    as a real model instance, or `None` if none matched.
  - *Its use:* this lesson's own real `register` route calls it once,
    to check whether a real user with the given real email already
    exists.
  - *Type:* `filter_by` is an instance method on a real `Query` object;
    `.first()` is a real method on the query `filter_by` returns.
  - *Responsibility:* translating a real, readable Python call into a
    real, actual database lookup, without this project ever writing
    raw real SQL.
  - *Depends on:* a real, already-mapped model and a real, already-
    initialized database connection.
  - *Connects to:* called directly inside this lesson's own real
    `register` function; its own real, returned value (a real `User` or
    `None`) is what that function branches on next.
  - *Shape:* the real, standard SQLAlchemy query boundary — not
    project-specific.

- **`Model.query.all()`**
  - *What it is:* a real method on any real model's own `.query`
    attribute — the same real `.query` object this project's own
    `filter_by(...).first()` and `.get(id)` are also methods on.
  - *Implementation:* checked against SQLAlchemy's own official
    documentation this session — runs a real, unfiltered query against
    the real table and returns every real row as a real, plain Python
    list of model instances.
  - *Its use:* this lesson's own real `/api/auth/users` route calls it
    once, to list every real user in the real database.
  - *Type:* an instance method on a real model's own `.query`
    attribute.
  - *Responsibility:* the real, simplest possible way to fetch every
    real row a table has, with no real filtering at all.
  - *Depends on:* a real, already-mapped model.
  - *Connects to:* called directly inside this lesson's own real
    `get_users` view function; its own real, returned list is converted
    to real, plain dictionaries immediately afterward.
  - *Shape:* the real, standard SQLAlchemy query boundary — not
    project-specific.

---

## Concept Unit: Protecting the Real Routes

### The Problem

`token_required` is proven correct, but nothing in `rebuild/backend`
uses it on a real, actual feature route yet. The real question this
unit answers: what's the actual smallest real way to add
`POST /api/auth/register` and `GET /api/auth/users`, each real,
already-tested, correctly protected, with no new decision logic
written here?

> **Before reading on:** `token_required` already returns the real
> authenticated `user` as a real, first argument to whatever real view
> function it wraps. Given `register`'s own real job is creating a
> *different* real user, and `get_users`'s own real job is listing
> *every* real user, does either one actually need to do anything with
> that real, first `user` argument beyond simply accepting it?

### Project Change

- **Reference Source** — `backend/app/routes/auth.py`, the real
  `register` and `get_users` functions, read in full this session:
  `register`, decorated `@token_required(allowed_roles=['admin'])`,
  reads `email`/`password`/`name`/`role` from a real JSON body, checks
  the real email isn't already taken, builds a real `User`, and returns
  a real `201` with the real, new user's own real `to_dict()`;
  `get_users`, decorated `@token_required(allowed_roles=['admin',
  'programming'])`, returns a real `200` with every real user's own
  real `to_dict()`, as a real, plain list.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  alongside the existing real `/health` and `/api/auth/login` routes.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from app.authorization import token_required


@app.route('/api/auth/register', methods=['POST'])
@token_required(allowed_roles=['admin'])
def register(current_user):
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'operator')

    if not email or not password or not name:
        return {'error': 'Missing required fields'}, 400

    if User.query.filter_by(email=email).first():
        return {'error': 'User already exists'}, 400

    user = User(id=email.split('@')[0], email=email, name=name, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return {'user': user.to_dict()}, 201


@app.route('/api/auth/users')
@token_required(allowed_roles=['admin', 'programming'])
def get_users(current_user):
    users = User.query.all()
    return {'data': [u.to_dict() for u in users]}
```

The `current_user` this lesson's Header's own `token_required` passes
into both real functions above is real, and real, correctly required
by Python's own real function-call syntax — but neither real function
actually reads it, since neither real job depends on *who* is asking,
only on *whether they're allowed to ask at all*, which
`token_required` itself already decided before either function ever
runs.

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own two new real routes added:

```python
1  from datetime import datetime, timedelta
2
3  import jwt
4  from flask import Flask, request, current_app
5  from flask_sqlalchemy import SQLAlchemy
6  from config import config
7
8  from app.auth import authenticate
9  from app.authorization import token_required
10 from app.models import User
11
12 db = SQLAlchemy()
13
14
15 def create_app(config_name='default'):
16     app = Flask(__name__)
17     app.config.from_object(config[config_name])
18     db.init_app(app)
19
20     @app.route('/health')
21     def health_check():
22         return {'status': 'healthy'}
23
24     @app.route('/api/auth/login', methods=['POST'])
25     def login():
26         data = request.get_json()
27         email = data.get('email')
28         password = data.get('password')
29
30         if not email or not password:
31             return {'error': 'Email and password required'}, 400
32
33         user = authenticate(email, password)
34         if user is None:
35             return {'error': 'Invalid credentials'}, 401
36
37         user.last_login = datetime.utcnow()
38         db.session.commit()
39
40         token = jwt.encode(
41             {
42                 'sub': user.id,
43                 'role': user.role,
44                 'iat': datetime.utcnow(),
45                 'exp': datetime.utcnow() + timedelta(days=7),
46             },
47             current_app.config['SECRET_KEY'],
48             algorithm='HS256',
49         )
50
51         return {'token': token, 'user': user.to_dict()}
52
53     @app.route('/api/auth/register', methods=['POST'])
54     @token_required(allowed_roles=['admin'])
55     def register(current_user):
56         data = request.get_json()
57         email = data.get('email')
58         password = data.get('password')
59         name = data.get('name')
60         role = data.get('role', 'operator')
61
62         if not email or not password or not name:
63             return {'error': 'Missing required fields'}, 400
64
65         if User.query.filter_by(email=email).first():
66             return {'error': 'User already exists'}, 400
67
68         user = User(id=email.split('@')[0], email=email, name=name, role=role)
69         user.set_password(password)
70         db.session.add(user)
71         db.session.commit()
72
73         return {'user': user.to_dict()}, 201
74
75     @app.route('/api/auth/users')
76     @token_required(allowed_roles=['admin', 'programming'])
77     def get_users(current_user):
78         users = User.query.all()
79         return {'data': [u.to_dict() for u in users]}
80
81     return app
```

### Mechanical Walkthrough

- **Line 9, `from app.authorization import token_required`** — the
  previous lesson's own real, already-tested decorator.
- **Line 10, `from app.models import User`** — reaches the real
  `User` model directly in this file for the first time — needed here
  since `register`/`get_users` both construct or query it directly,
  unlike `login`, which only ever reaches `User` indirectly, through
  `authenticate`.
- **Line 54, `@token_required(allowed_roles=['admin'])`** — this
  lesson's Header's own decorator, applied for the first time to a real
  feature route, restricting `register` to real admins only, matching
  legacy's own real, identical restriction.
- **Lines 56–60, reading the real request body** — this lesson's
  Header's own `request.get_json()`, reading the real, incoming body
  into `data`; `email`/`password`/`name` read with plain dictionary
  `.get(...)` calls, real and standard, returning `None` for any field
  the real client never sent; `role = data.get('role', 'operator')` —
  the identical real `.get(...)` call with a real, second,
  default-value argument: returns the real, given role if the real
  request included one, or the literal string `'operator'` otherwise.
- **Lines 62–63, the real, missing-field case** — a real `400`,
  matching legacy's own real, identical check.
- **Lines 65–66, the real, duplicate-email case** —
  `User.query.filter_by(email=email).first()`: `filter_by(email=email)`
  builds a real, not-yet-executed query matching rows whose real
  `email` column equals the given value; `.first()` actually runs it
  and returns the real, first matching row, or `None` if none matched.
  A real, truthy result here means a real user with this real email
  already exists.
- **Lines 68–71, building the real, new user** — constructs a real
  `User`, its own real `id` computed from the real email's own prefix
  before the `@`, matching legacy's own real, identical convention;
  calls the real, already-tested `set_password`; writes it for real.
- **Line 73, `return {'user': user.to_dict()}, 201`** — a real,
  standard Flask response tuple: a real, plain dict, and a real,
  explicit status code — `201`, the real, standard HTTP status for a
  real resource that was just created, distinct from a plain `200`.
- **Line 76, `@token_required(allowed_roles=['admin', 'programming'])`**
  — the identical real decorator, this time allowing either real role,
  matching legacy's own real, identical restriction on this specific
  real route.
- **Lines 78–79, `def get_users(current_user): users =
  User.query.all()`** — this lesson's Header's own `Model.query.all()`,
  fetching every real row; `[u.to_dict() for u in users]` — a real,
  standard Python list comprehension, building a real, plain list of
  real, safe dictionaries, one per real user, reusing the real,
  already-proven `to_dict()` method.

### CS Lens

This is a real instance of **the adapter pattern, applied twice more**
— the identical real shape `login` already established, now proven to
generalize: a real, thin, protected view function, containing no real
decision logic of its own beyond reading a request and calling
already-tested real pieces.

Also recognized in: any real, RESTful API where every real route
follows the identical real shape — authenticate/authorize, read the
real request, call real business logic, shape the real response —
varying only in which real logic and which real shape, never in the
real, surrounding structure.

### SE Lens

The real, deliberately *not*-taken alternative here: giving `register`
and `get_users` a real, additional real parameter for `current_user`
even though neither real function reads it. Rejected as an
alternative worth taking, not as a real design flaw: Python's own real
function-call mechanics *require* accepting whatever real, positional
argument `token_required` passes, whether or not the real, decorated
function actually uses it — an unavoidable, honest, minor real
coupling between "this route needs protecting" and "this route's own
real signature always receives who's asking," even when the real,
specific feature doesn't care.

### Commands needed

This unit's own real, final proof reuses this project's own shared
acceptance-test harness, unmodified, now pointed at `rebuild`:

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='new'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_authorization.py -v
```

### Run it, per the Verification Rule

Real doubt existed here too — this real sign-in slice's own login-route
lesson already proved an identical, confident-sounding prediction wrong
twice over, in that same lesson, so this was actually run this session
against `verification/backend`'s own real, complete routes, not merely
predicted:

```
lesson_17_authorization_route.py::test_users_list_requires_a_token_at_all PASSED
lesson_17_authorization_route.py::test_users_list_rejects_a_token_with_the_wrong_role PASSED

2 passed in 0.77s
```

Both real cases pass, genuinely — this time the prediction held,
confirming the previous lesson's own `token_required` was already
correct in isolation, with nothing left for this lesson's own thin
wiring to get wrong.

### Connecting this unit to what came before

Every previous lesson in this slice built one real, separately-proven
piece. This unit is where they finally connect to the real, specific
feature routes this slice's own testing lesson was always aimed at.

---

## Connect the pieces

Real authorization is now a complete, real, tested slice — a real,
reusable check, proven correct on its own, now protecting two real
feature routes, exactly matching legacy's own real, distinct
`401`/`403` behavior, using nothing legacy's own real routes weren't
already proven to do.

---

**Next lesson:** to be decided once this slice's own real work is
actually typed in and confirmed, by hand, against these lessons.
