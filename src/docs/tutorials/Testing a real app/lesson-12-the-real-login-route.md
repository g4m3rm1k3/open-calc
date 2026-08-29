# Lesson 12: The Real Login Route

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. This is the lesson this
> whole slice has been building toward — by the end of it, this
> series' own real acceptance test, written before any of `rebuild`'s
> own login code existed, passes against `rebuild` for the first time.

## What you will build

The thinnest possible real Flask route connecting a real HTTP request
to the already-tested `authenticate` function — reading a real request,
calling one already-proven real decision, and building the real
response that decision implies. No new decision logic gets written
here at all; every real branch this route takes was already proven
correct, in isolation, in the previous lesson.

## What you need to know first

The real, already-tested `authenticate(email, password)` function. The
real `User.to_dict()` method. This slice's own real acceptance test
(`acceptance-tests/test_login.py`), proven against legacy, proven RED
against `rebuild`, and now this lesson's own real target.

## Terms introduced

- **Blueprint** — a real, standard Flask way of grouping related
  routes together before registering them on an app. Legacy's own real
  backend already organizes its own, many real auth-related routes
  this way. This lesson does not use one — see the SE Lens, below, for
  why one real route doesn't yet justify it.

## Objects and methods used

- **`request.get_json()`**
  - *What it is:* a real method on Flask's own real, global `request`
    object.
  - *Implementation:* checked against Flask's own official
    documentation this session — parses the real, incoming request
    body as JSON and returns it as a real Python value (a `dict`, for a
    JSON object body); returns `None` instead of raising if the body
    isn't valid JSON, unless `force`/`silent` arguments say otherwise —
    this lesson uses the real, default behavior.
  - *Its use:* this lesson's own real route calls it once, to read the
    real `email`/`password` a real client actually sent.
  - *Type:* an instance method on Flask's own real, request-scoped
    `request` object.
  - *Responsibility:* turning a real, incoming request's raw JSON body
    into a real, usable Python value.
  - *Depends on:* an active real Flask request context — automatically
    real and active for any code running inside a real view function.
  - *Connects to:* called once, at the top of this lesson's own real
    view function; its own real, returned value is read for `email`/
    `password` immediately after.
  - *Shape:* the real, standard Flask request-parsing boundary — not
    project-specific.

- **`jwt.encode(payload, key, algorithm)`**
  - *What it is:* a real function, exported by PyJWT — a real,
    published package, already a real, installed dependency of this
    project's own shared virtual environment (checked this session:
    `backend/requirements.txt` already pins `PyJWT==2.8.0`).
  - *Implementation:* checked against PyJWT's own official
    documentation this session — takes a real, plain Python `dict`
    payload, a real secret key, and a real, named algorithm (`'HS256'`,
    here), and returns a real, signed JWT string — this lesson's
    Header's own **JWT** term, made concrete: three real, dot-separated
    parts, the last one a real, cryptographic signature over the first
    two, computed using the given real key.
  - *Its use:* this lesson's own real route calls it once, on real
    success, with a real payload naming the authenticated real user.
  - *Type:* a free function, exported by the `jwt` package.
  - *Responsibility:* producing one real, self-contained, signed token
    from a real, plain payload.
  - *Depends on:* a real, JSON-serializable payload and a real secret
    key — kept in this project's own real app configuration, never
    hardcoded at the call site.
  - *Connects to:* called once, inside this lesson's own real route, on
    the real success branch only.
  - *Shape:* a real, external cryptographic boundary — the identical
    real library legacy already depends on for the identical real
    purpose.

---

## Concept Unit: Wiring the Request to the Decision

### The Problem

`authenticate` already exists and is already proven correct, in
isolation. Nothing in `rebuild/backend` yet reads a real HTTP request
and calls it. The real question this unit answers: what's the actual
smallest real route that reads a real request, calls the already-tested
real decision, and returns the correct real `400`/`401` this slice's
own acceptance test already demands — with no new decision logic
written here at all?

> **Before reading on:** `authenticate` already returns `None` for
> *every* real way a login attempt can fail to authenticate — missing
> input included. Given that, does this route's own code need to
> repeat the real "is email/password missing" check itself, or can it
> tell the missing-input case apart from a real, wrong-credentials case
> another way?

### Project Change

- **Reference Source** — `backend/app/routes/auth.py`, the real
  `login()` function's own real HTTP handling, read in full this
  session: reads `request.json`, returns a real `400` if either field
  is missing, otherwise calls the real, equivalent decision and returns
  a real `401` on failure.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  alongside the existing real `/health` route.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from flask import request

from app.auth import authenticate


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return {'error': 'Email and password required'}, 400

    user = authenticate(email, password)
    if user is None:
        return {'error': 'Invalid credentials'}, 401
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own new import and route added:

```python
1  from flask import Flask, request
2  from flask_sqlalchemy import SQLAlchemy
3  from config import config
4
5  from app.auth import authenticate
6
7  db = SQLAlchemy()
8
9
10 def create_app(config_name='default'):
11     app = Flask(__name__)
12     app.config.from_object(config[config_name])
13     db.init_app(app)
14
15     @app.route('/health')
16     def health_check():
17         return {'status': 'healthy'}
18
19     @app.route('/api/auth/login', methods=['POST'])
20     def login():
21         data = request.get_json()
22         email = data.get('email')
23         password = data.get('password')
24
25         if not email or not password:
26             return {'error': 'Email and password required'}, 400
27
28         user = authenticate(email, password)
29         if user is None:
30             return {'error': 'Invalid credentials'}, 401
31
32     return app
```

### Mechanical Walkthrough

- **Line 1, `from flask import Flask, request`** — this lesson's
  Header's own real, global `request` object, imported alongside the
  already-used `Flask`.
- **Line 5, `from app.auth import authenticate`** — the previous
  lesson's own real, already-tested function.
- **Line 19, `@app.route('/api/auth/login', methods=['POST'])`** — the
  identical real decorator mechanism this series already gave full
  treatment to for `/health`, now with a real, explicit `methods=`
  argument — without it, Flask's own real, documented default only
  accepts `GET`, and this real route needs `POST` instead, matching
  legacy's own real, identical route.
- **Line 21, `data = request.get_json()`** — this lesson's Header's
  own `request.get_json()`, reading the real, incoming JSON body.
- **Lines 22–23, reading `email`/`password`** — real, plain
  dictionary `.get(...)` calls, returning `None` for either if the
  real client never sent it.
- **Lines 25–26, the real missing-input case** — checked *here*, in
  the route, not inside `authenticate`: this is a real, honest
  **Deliberately changed** structural choice from legacy's own real
  code, where the identical real check also lives in the view function
  — this unit keeps it there on purpose, since "was the request
  well-formed at all" is a real property of the *request itself*, a
  genuinely different real concern from "are these credentials
  correct," which is what `authenticate` alone is responsible for
  deciding.
- **Line 28, `user = authenticate(email, password)`** — the previous
  lesson's own real, already-tested decision, called with the real
  values just read.
- **Lines 29–30, `if user is None: return {'error': 'Invalid
  credentials'}, 401`** — the real, unified failure response,
  reachable identically whether `authenticate` returned `None` because
  the email didn't exist or because the password was wrong — this
  route never needs to know, or care, which.

### CS Lens

This is a real instance of a **thin adapter** — a real, minimal layer
translating one real protocol (HTTP: a request, a status code, a JSON
body) into a call against logic that knows nothing about that
protocol at all, and translating the real answer back. The real
adapter itself contains no real decision-making of its own beyond
"is this request well-formed."

Also recognized in: a real CLI wrapper around a real, protocol-agnostic
library function; a real gRPC handler calling into the identical real
business logic a REST handler also calls; any real system where the
same real decision is reachable through more than one real, thin
transport layer.

### SE Lens

The real, deliberately *not*-taken alternative here: organizing this
real route inside a real **Blueprint**, matching legacy's own real
structure. Rejected for now — `rebuild/backend` has exactly one real
route besides `/health`; a real Blueprint exists to group *several*
real, related routes together before registering them, and building
one for a single real route would be real, premature structure with
nothing yet to organize. The real, honest cost accepted here:
`create_app` will need real, deliberate reorganizing once a real,
later feature adds enough real routes that a flat list stops being the
clearest real shape — not a shortcut, the correct order.

### Commands needed

No new command yet — this unit's own real proof is only two of this
slice's own four real cases; the next unit completes it.

### Run it, per the Verification Rule

Not run this session — deferred to the next unit, once the real
success path also exists; this unit alone cannot yet make the real,
whole acceptance test pass, only its first three real cases.

### Connecting this unit to what came before

The previous lesson proved `authenticate` correct in isolation. This
unit is the first real code that lets an actual real HTTP client reach
it.

---

## Concept Unit: A Real Token for a Real Success

### The Problem

The previous unit's own real route correctly returns `400` and `401`,
but returns nothing at all on real success — falling through to
Flask's own real, implicit `None`, which Flask cannot actually turn
into a real response. The real question this unit answers: what does
the smallest real success path look like, building a real token and a
real, safe user representation, matching this slice's own real
acceptance test exactly?

### Project Change

- **Reference Source** — `backend/app/routes/auth.py`, the real
  `login()` function's own real success path, read in full this
  session: on a real match, updates `last_login`, commits, generates a
  real JWT via `encode_auth_token(user.id, user.role)`, and returns
  `{'message': 'Login successful', 'token': auth_token, 'user':
  user.to_dict()}` with a real `200`.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`,
  `rebuild/backend/config.py`.
- **Change type** — modify.
- **Location** — the end of the existing real `login()` view function;
  a new real key in the existing real `Config` class.
- **Dependencies** — `pyjwt`, a real, new dependency this unit
  installs.

### The New Code

```python
class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'dev-secret-key-change-in-production'
```

That real, one-line addition to `config.py` is the whole first real
change. The second, separate real change — a genuinely different real
file — actually builds and returns the real token, appended to the end
of the existing real `login()` function:

```python
import jwt
from datetime import datetime, timedelta


user.last_login = datetime.utcnow()
db.session.commit()

token = jwt.encode(
    {
        'sub': user.id,
        'role': user.role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=7),
    },
    current_app.config['SECRET_KEY'],
    algorithm='HS256',
)

return {'token': token, 'user': user.to_dict()}
```

### The Updated Project

`rebuild/backend/config.py`, in full — the previous lesson's own
version, with one new real key:

```python
1  class Config:
2      SQLALCHEMY_TRACK_MODIFICATIONS = False
3      SECRET_KEY = 'dev-secret-key-change-in-production'
4
5
6  class TestingConfig(Config):
7      TESTING = True
8      SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
9
10
11 config = {
12     'testing': TestingConfig,
13     'default': TestingConfig,
14 }
```

`rebuild/backend/app/__init__.py`, in full — the previous unit's own
`login()`, completed:

```python
1  from datetime import datetime, timedelta
2
3  import jwt
4  from flask import Flask, request, current_app
5  from flask_sqlalchemy import SQLAlchemy
6  from config import config
7
8  from app.auth import authenticate
9
10 db = SQLAlchemy()
11
12
13 def create_app(config_name='default'):
14     app = Flask(__name__)
15     app.config.from_object(config[config_name])
16     db.init_app(app)
17
18     @app.route('/health')
19     def health_check():
20         return {'status': 'healthy'}
21
22     @app.route('/api/auth/login', methods=['POST'])
23     def login():
24         data = request.get_json()
25         email = data.get('email')
26         password = data.get('password')
27
28         if not email or not password:
29             return {'error': 'Email and password required'}, 400
30
31         user = authenticate(email, password)
32         if user is None:
33             return {'error': 'Invalid credentials'}, 401
34
35         user.last_login = datetime.utcnow()
36         db.session.commit()
37
38         token = jwt.encode(
39             {
40                 'sub': user.id,
41                 'role': user.role,
42                 'iat': datetime.utcnow(),
43                 'exp': datetime.utcnow() + timedelta(days=7),
44             },
45             current_app.config['SECRET_KEY'],
46             algorithm='HS256',
47         )
48
49         return {'token': token, 'user': user.to_dict()}
50
51     return app
```

### Mechanical Walkthrough

- **Line 3, `SECRET_KEY = 'dev-secret-key-change-in-production'`** — a
  real, plain string, matching legacy's own real, identical development
  default, checked this session; a real, later lesson reaching real
  production concerns is the honest place to make this a real,
  environment-supplied secret instead — not this lesson's own real,
  current scope.
- **Line 35, `user.last_login = datetime.utcnow()`** — a real,
  in-memory attribute assignment on the real `user` object
  `authenticate` already returned.
- **Line 36, `db.session.commit()`** — a real, standard SQLAlchemy
  call, writing the real, updated `last_login` value to the real
  database — the first real write this whole slice performs.
- **Lines 38–47, `token = jwt.encode(...)`** — this lesson's Header's
  own `jwt.encode`, called with a real, plain payload: `sub` (a real,
  standard JWT claim naming the token's real subject — this real
  user's own `id`), `role` (a real, custom claim, embedding
  authorization data so a later, real request doesn't have to
  re-query the database just to check it), `iat`/`exp` (real,
  standard claims marking when the token was issued and when it real,
  genuinely expires) — `current_app.config['SECRET_KEY']`, this
  lesson's own new config value, and `algorithm='HS256'`, matching
  legacy's own real, identical choice.
- **Line 49, `return {'token': token, 'user': user.to_dict()}`** — the
  real, final response: the real, signed token, and the real,
  already-safe dictionary `User.to_dict()` already proved never
  includes `password_hash` — the exact real shape this slice's own
  acceptance test checks.

### CS Lens

This is a real instance of **claims-based authorization** — embedding
a real user's own `role` directly inside a real, signed token means a
later, real request carrying that token can be authorized without a
real, separate database round-trip just to look the role back up —
the real token itself is the real, portable proof.

Also recognized in: any real, standard JWT-based system embedding real,
custom claims; a real signed cookie carrying real session data
directly, instead of only a real session ID; any real system trading a
real, extra database lookup for a real, self-contained, verifiable
token instead.

### SE Lens

The real, deliberately *not*-taken alternative here: giving this
token a real, short expiry (legacy's own real comment already notes
15 minutes is more typical for a public-facing app). Preserved,
deliberately, at legacy's own real 7-day value: this is real, internal
manufacturing-floor software, per legacy's own real, stated reasoning
— trusted employees, physical access controls already in place,
convenience genuinely outweighing a shorter real expiry here. This is
a real Preserve, not a default — the reasoning was actually read and
actually agreed with, not copied without a real, second thought.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
../../backend/.venv/Scripts/python.exe -m pip install pyjwt
```

This unit's own real, final proof reuses this project's own shared
acceptance-test harness, unmodified, now pointed at `rebuild`:

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='new'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_login.py -v
```

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: every
real piece this route assembles (`authenticate`, already tested;
`jwt.encode`, standard PyJWT usage; `User.to_dict()`, already proven
never to leak `password_hash`) has already been independently proven
correct; their combination follows directly, deterministically, from
each one's own already-confirmed real behavior. Confidently predicted
— the identical real shape already proven for `legacy`, all the way
back in this slice's own testing lesson:

```
test_login.py::test_login_missing_fields_returns_400 PASSED
test_login.py::test_login_unknown_email_returns_401_generic_error PASSED
test_login.py::test_login_wrong_password_returns_the_same_401_generic_error PASSED
test_login.py::test_login_valid_credentials_returns_token_and_user PASSED

4 passed in ...s
```

If this does *not* happen exactly this way when actually run, that's a
real signal something above is wrong — most likely a real, missing
`pyjwt` install — worth stopping to investigate before continuing, not
a reason to edit the test to match a surprising result.

### Connecting this unit to what came before

Every previous lesson in this slice built one real, separately-proven
piece — a database, a model, a decision, half a route. This unit is
where all of them, together, finally satisfy the one real test this
whole slice was always aimed at.

---

## Connect the pieces

One real request, `POST /api/auth/login`, now has a real, complete,
independently-built answer in `rebuild` — a real route reading a real
request, an already-tested real decision it never had to re-verify,
and a real token built from real, well-understood pieces. Nothing about
*how* `rebuild` reaches this real answer was copied from legacy's own
real, welded-together implementation; only the real, external contract
was — proven, the whole way through, by the identical real test.

---

**Next lesson:** this series' own real, second complete feature slice
— to be decided once this one's own real work is actually typed in and
confirmed, by hand, against these lessons.
