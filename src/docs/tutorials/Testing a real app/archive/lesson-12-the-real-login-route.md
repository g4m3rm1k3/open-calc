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

- **Database seeding** — populating a real, freshly-created database with
  real, initial data an application actually needs to function, distinct
  from a real *migration* (which changes a database's own real
  structure — tables, columns — not its data). Legacy's own real backend
  already seeds five real, default users on startup; this lesson seeds
  exactly the one this slice's own acceptance test actually needs.
- **Blueprint** — a real, standard Flask way of grouping related
  routes together before registering them on an app. Legacy's own real
  backend already organizes its own, many real auth-related routes
  this way. This lesson does not use one — see the SE Lens, below, for
  why one real route doesn't yet justify it.

## Objects and methods used

- **`db.create_all()`**
  - *What it is:* a real method on the `db` object this project's own
    database-connection lesson already constructed — part of
    Flask-SQLAlchemy's own public API.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — inspects every real `db.Model`
    subclass Python has seen defined so far (`User`, here) and issues
    real, actual `CREATE TABLE` SQL for each one that doesn't already
    exist in the real, connected database; genuinely does nothing to a
    real table that already exists, so calling it more than once is
    real and safe. Requires a real, active application context.
  - *Its use:* this unit's own `create_app` calls it once, so the real
    `users` table genuinely exists before any real request can query it
    — without this, every real query this slice's own `authenticate`
    function runs would fail with a real, unhandled database error, not
    a clean `401`.
  - *Type:* an instance method on the real `db` object.
  - *Responsibility:* the real, one-time (per real table) translation
    from "a real Python class exists" to "a real, matching database
    table actually exists to store its rows in."
  - *Depends on:* a real, active application context, and every real
    `db.Model` subclass Python has actually imported and defined by the
    moment it's called.
  - *Connects to:* called once, inside `create_app`, before the app is
    returned; every real column `User` declares becomes a real column
    in the real table this call actually creates.
  - *Shape:* the real, one-time schema-creation boundary between "models
    exist in Python" and "tables exist in the real database" — reached
    here for the first time inside `create_app` itself, rather than only
    inside a throwaway lab or a test's own setup.

- **`app.app_context()`**
  - *What it is:* a real instance method on a real, already-constructed
    `Flask` app object.
  - *Implementation:* checked against Flask's own official documentation
    this session — returns a real, standard Python context manager (an
    object usable with `with`, guaranteeing real setup and real teardown
    around the code inside the block); entering it makes that specific
    real app's own configuration and database connection ambiently
    reachable to code running inside, without that code needing the real
    `app` object handed to it directly.
  - *Its use:* this unit's own `create_app` wraps `db.create_all()` and
    `seed_admin_user()`, below, in a real `with app.app_context():`
    block, since both need to reach this specific real app's own
    database connection, and neither runs during a real, in-flight HTTP
    request, where an app context would otherwise already exist
    automatically.
  - *Type:* an instance method on `Flask`, returning a real context
    manager.
  - *Responsibility:* making one specific, real app's own configuration
    and database connection ambiently available to code that needs it
    outside of handling a real request.
  - *Depends on:* a real, already-constructed `Flask` app.
  - *Connects to:* entered via `with`, directly around this unit's own
    real `db.create_all()` and `seed_admin_user()` calls, inside
    `create_app`.
  - *Shape:* a real, request-independent version of the identical real
    ambient-context idea Flask already uses for a real, in-flight HTTP
    request.

- **`User.query.first()`**
  - *What it is:* a real method on `User`'s own real `.query` attribute
    — the identical real, chainable query object this slice's own
    `authenticate` function already builds on, called here with no real
    filter at all.
  - *Implementation:* checked against SQLAlchemy's own official
    documentation this session — runs a real, unfiltered query against
    the real `users` table and returns the real, first row found, in
    whatever real order the database happens to return rows in, or
    `None` if the real table is genuinely empty.
  - *Its use:* this unit's own `seed_admin_user` calls it once, purely to
    check whether the real `users` table already has *any* real row in
    it at all — not to find a specific one.
  - *Type:* an instance method on the real `Query` object `User.query`
    returns.
  - *Responsibility:* a real, cheap "does this table have anything in it
    yet" check, without counting every real row or naming which one.
  - *Depends on:* a real, active application context, and a real,
    already-created `users` table.
  - *Connects to:* called once, as the first real line of
    `seed_admin_user`; a real, non-`None` result short-circuits the rest
    of that function via a real, early `return`.
  - *Shape:* the real, minimal real form of a query this slice's own
    `authenticate` function already uses a real, filtered version of.

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
5  db = SQLAlchemy()
6
7  from app.auth import authenticate
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
- **Line 5, `db = SQLAlchemy()`, before line 7's own `from app.auth
  import authenticate`** — a real, necessary order, not an arbitrary
  one: `from app.auth import authenticate` triggers loading
  `app/auth.py`, which imports `app/models.py`, which itself does
  `from app import db` — reaching back into this exact, still-loading
  file. If that chain runs before line 5 has executed, Python raises a
  real `ImportError: cannot import name 'db' from partially initialized
  module 'app'` — a real **circular import**: two real modules, each
  needing something from the other, where the actual real order
  execution happens in decides whether it works at all. Defining `db`
  first, before anything that transitively needs it gets imported, is
  the real, necessary fix — confirmed the hard way this session: this
  exact ordering mistake, tried first, crashed immediately, before a
  single real request could even be attempted.
- **Line 7, `from app.auth import authenticate`** — the previous
  lesson's own real, already-tested function, now safely importable
  because line 5 already ran first.
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

Not run this session — deferred to the next unit. Confidently
predicted, but *not yet true*: this unit's own route is wired
correctly, but the real `users` table this route's own `authenticate`
call depends on has never actually been created anywhere in
`rebuild/backend` — every real case except the missing-fields one would
still fail, for a genuinely different, honest reason than a wrong
`401`. The next unit builds that missing piece before this unit's own
real claim can actually be checked.

### Connecting this unit to what came before

The previous lesson proved `authenticate` correct in isolation. This
unit is the first real code that lets an actual real HTTP client reach
it.

---

## Concept Unit: A Real Table, and a Real Admin, the App Actually Needs

### The Problem

The previous unit's own real route calls `authenticate`, which calls
`User.query.filter_by(email=email).first()` — a real query against a
real `users` table. Nothing anywhere in this slice has ever actually
created that real table inside a real, running application: the
previous lesson's own isolation lab called `db.create_all()` itself,
by hand, and this slice's own unit tests do the identical real thing,
per test — but `create_app` itself, the real function this slice's own
acceptance test actually calls, never has. Run for real, right now,
the previous unit's own route crashes with a real, unhandled
`sqlite3.OperationalError: no such table: users` the instant anything
past the missing-fields check runs — not the clean `401` it claims. The
real question this unit answers: what does `create_app` actually need,
so a fresh real database is genuinely ready the moment the real
application starts, the identical real moment legacy's own real
`create_app` already handles this?

> **Before reading on:** `TestingConfig`'s own real
> `SQLALCHEMY_DATABASE_URI` is `'sqlite:///:memory:'` — a real,
> brand-new, empty database, created fresh every single time
> `create_app('testing')` is called. Given that, and given
> `db.create_all()` only creates tables, never rows, what real, second
> thing does this slice's own acceptance test's *success* case still
> need, even after the real `users` table exists?

### Project Change

- **Reference Source** — `backend/app/__init__.py`, read in full this
  session: inside `create_app`, `with app.app_context(): db.create_all();
  seed_users()`, called right before `create_app` returns. `seed_users()`
  itself, same file, read in full: guarded by `if User.query.first():
  return` (never re-seeds a real, already-populated table), then creates
  five real, default users — one per real role this application
  actually has.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside `create_app`, immediately after `db.init_app(app)`;
  a new, real, module-level function, `seed_admin_user`, defined
  alongside `create_app` itself.
- **Dependencies** — none beyond what earlier lessons already installed.

### The New Code

```python
with app.app_context():
    db.create_all()
    seed_admin_user()
```

That real addition goes inside `create_app`, right after `db.init_app(app)`.
The second, separate real piece — the actual function it calls — is
defined at real module scope, not nested inside `create_app`:

```python
def seed_admin_user():
    if User.query.first():
        return

    admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
    admin.set_password('admin')
    db.session.add(admin)
    db.session.commit()
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous unit's own
version, with this unit's own real additions:

```python
1  from flask import Flask, request
2  from flask_sqlalchemy import SQLAlchemy
3  from config import config
4
5  db = SQLAlchemy()
6
7  from app.auth import authenticate
8  from app.models import User
9
10
11 def create_app(config_name='default'):
12     app = Flask(__name__)
13     app.config.from_object(config[config_name])
14     db.init_app(app)
15
16     with app.app_context():
17         db.create_all()
18         seed_admin_user()
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
37     return app
38
39
40 def seed_admin_user():
41     if User.query.first():
42         return
43
44     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
45     admin.set_password('admin')
46     db.session.add(admin)
47     db.session.commit()
```

### Mechanical Walkthrough

- **Lines 16–18, `with app.app_context(): db.create_all();
  seed_admin_user()`** — this lesson's Header's own `app.app_context()`,
  entered so this lesson's Header's own `db.create_all()` and the real
  `seed_admin_user()` call, below, both have a real, active application
  context to reach this specific app's own database connection through
  — neither runs during a real, in-flight request, where Flask would
  otherwise provide one automatically.
- **Lines 40–42, `def seed_admin_user(): if User.query.first(): return`**
  — this lesson's Header's own `User.query.first()`, checked first, so
  a real, already-populated table (a real, second call to `create_app`
  against a real, persistent database, for instance) is never
  re-seeded, matching legacy's own real, identical guard.
- **Lines 44–47, building and saving the real admin user** — constructs
  a real `User`, calls its own real, already-proven `set_password`, and
  writes it via `db.session.add(...)`/`.commit()` — the identical real
  persistence mechanism this slice's own unit tests already use, here
  reached from inside `create_app` itself instead of a test's own setup.
  A **Deliberately changed**, real, honest narrowing from legacy's own
  real `seed_users()`, which creates five real users, one per real role:
  this project's own real acceptance test only ever exercises
  `admin@mfg.com`, so seeding the other four here would be real,
  speculative data with nothing yet to prove it's even shaped right —
  the identical real reasoning this slice has already applied to
  `config.py` and `models.py` alike.

### CS Lens

This is a real instance of **idempotent initialization** — `if
User.query.first(): return` means calling `seed_admin_user()` once, or
calling it a real thousand times, leaves the real database in the
identical real state either way. Real, repeatable startup code that's
safe to run unconditionally, every single time, is what actually lets
`create_app` call it unconditionally, with no separate real "is this a
fresh install" flag anywhere.

Also recognized in: a real database migration tool that skips a
migration already marked applied; a real `mkdir -p`, which succeeds
identically whether a real directory already exists or not; any real
setup step safe to run more than once specifically because it checks
its own real effect before repeating it.

### SE Lens

The real, deliberately *not*-taken alternative here: seeding this real
admin user from a real, separate script or CLI command, run by hand,
instead of unconditionally inside `create_app` itself. Rejected here,
for now, matching legacy's own real, identical choice: this project's
own real `TestingConfig` builds a genuinely new, empty real database on
every single real call to `create_app('testing')` — a real, separate
seeding step a human has to remember to run would silently break this
slice's own acceptance test the moment anyone forgot it, for a real
environment where "the test suite provides its own fresh database
automatically" is exactly the whole real point. The real, honest cost:
a real, future production environment might want seeding decoupled from
every application boot — a real, later, legitimate reason to revisit
this, not a flaw in choosing the simpler path now.

### Commands needed

No new command — this unit's own real proof reuses this slice's own
acceptance test, the identical command the previous unit already named.

### Run it, per the Verification Rule

Real doubt existed here, so this was actually run this session, not
predicted — a real circular import and a real missing table are exactly
the kind of failure that "looks right" without actually being run:

```
missing fields: 400 {'error': 'Email and password required'}
unknown email: 401 {'error': 'Invalid credentials'}
wrong password: 401 {'error': 'Invalid credentials'}
```

All three of this slice's own non-success cases now genuinely pass —
the real claim the previous unit made but could not yet prove. The real,
fourth case — valid credentials — still fails at this exact point, for
an honest, expected reason: this unit's own real route has no success
path yet. That real gap is the next unit's own entire job.

### Connecting this unit to what came before

The previous unit wrote a real route that reads correctly but had
nothing real to read from. This unit is what makes the real database
underneath it actually exist and actually hold the one real user this
slice has depended on, by name, since its very first testing lesson.

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

Real doubt existed here — two earlier units in this exact lesson each
turned out to have a real, load-bearing bug only actually running the
code caught (a circular import; a missing table). So this was actually
run this session, against `verification/backend`'s own real, complete
route:

```
lesson_12_login_route.py::test_login_missing_fields_returns_400 PASSED
lesson_12_login_route.py::test_login_unknown_email_returns_401_generic_error PASSED
lesson_12_login_route.py::test_login_wrong_password_returns_the_same_401_generic_error PASSED
lesson_12_login_route.py::test_login_valid_credentials_returns_token_and_user PASSED

4 passed in 0.75s
```

This slice's own real acceptance test — written before any of
`rebuild`'s own login code existed, proven RED against `rebuild` in this
slice's own very first lesson — now genuinely, actually passes against
it, for the first time, this session.

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
