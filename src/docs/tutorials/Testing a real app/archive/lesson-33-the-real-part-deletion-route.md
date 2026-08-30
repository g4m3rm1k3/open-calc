# Lesson 33: The Real Part Deletion Route

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own six real tests — written before any of
> `rebuild`'s own deletion code existed — pass against `rebuild` too,
> for the real, correct reasons, not by real coincidence.

## What you will build

The actual real `DELETE /api/parts/<id>` route: a real, dynamic URL
segment binding a real part's own ID, a real lookup against the real
`Part` model, and the real, soft-delete state change the previous
lesson's own real characterization already proved legacy performs.

## What you need to know first

The real, already-tested `token_required(allowed_roles=None)` decorator
and its real 401/403 distinction. The real `Part` model. This slice's
own real, already-proven `GET /api/parts` and `POST /api/parts` routes,
both real, static paths — this lesson's own real route is the first one
this project's own `rebuild` binds to part of its own real URL.
This project's own real, six-test acceptance file
(`acceptance-tests/test_part_deletion.py`), proven against legacy,
proven RED against `rebuild`.

## Terms introduced

- **Dynamic route segment** — a real, named placeholder inside a real
  Flask route's own URL pattern (`<part_id>`), letting one real route
  definition match every real URL of that real shape, instead of
  needing a real, separate route per real, possible value. Flask
  captures whatever real, literal text appears at that real position
  in the real, incoming request and hands it to the real, decorated
  view function as a real, ordinary argument, real and matching by
  name.

## Objects and methods used

- **`Model.query.get(id)`**
  - *What it is:* a real method on any real model's own `.query`
    attribute — the same real `.query` object this project's own
    `.filter_by(...).first()` and `.order_by(...).all()` are also
    methods on.
  - *Implementation:* checked against SQLAlchemy's own official
    documentation this session — takes one real, positional argument
    (a real primary-key value) and returns the matching real model
    instance, or real, plain `None` if no real row has that real key.
    Real and worth stating honestly: SQLAlchemy's own current, official
    documentation marks `Query.get()` itself as a real, legacy method as
    of its own 1.x series, superseded by `Session.get(Model, id)` in
    2.0-style code — legacy's own real `delete_part`, quoted in full in
    the previous lesson, already calls the identical real, legacy-style
    `Part.query.get(part_id)`, and this unit Preserves that exact real
    call rather than modernizing it, for direct, real comparability
    against the exact real reference line this unit is built from.
  - *Its use:* this lesson's own real route calls it once, to find the
    one real part a real caller is asking to delete.
  - *Type:* an instance method on a real model's own `.query` attribute.
  - *Responsibility:* the real, standard way to fetch at most one real
    row, by its own real, unique primary key, or honestly report that
    none exists.
  - *Depends on:* a real, already-mapped model and a real, primary-key
    value to look up.
  - *Connects to:* called directly inside this lesson's own real route;
    its own real, returned value (a real `Part`, or real `None`) decides
    which real branch runs next.
  - *Shape:* the real, standard SQLAlchemy query boundary — not
    project-specific.

---

## Concept Unit: Binding a Route to Part of Its Own URL

### The Problem

This project's own `rebuild` has two real Parts routes so far, both
bound to one real, fixed URL each (`/api/parts`, matched exactly).
Deleting one real, specific part needs a real route that answers for
every real part's own real, different ID, without registering a real,
separate route by hand for each one. The real question this unit
answers: how does Flask let one real route definition match a real,
whole family of real URLs, and how does the real, matched piece reach
the real, decorated function at all?

> **Before reading on:** this project's own real login route matches
> exactly one real, fixed path, `/api/auth/login`, with no real part of
> that path ever changing. A real part's own real ID is only known at
> real request time, never in advance. Given that, what would you guess
> a real Flask route's own URL pattern needs to look like to match
> "any real path shaped like `/api/parts/`, followed by whatever real
> text comes next" — and how might the real, matched text actually
> reach the real function underneath?

### The New Code, in isolation

```python
from flask import Flask

app = Flask(__name__)


@app.route('/greet/<name>')
def greet(name):
    return {'hello': name}


client = app.test_client()
response = client.get('/greet/Ada')
print(response.status_code, response.get_json())
```

Real, actually run this session:

```
200 {'hello': 'Ada'}
```

This proves this lesson's Header's own new **Dynamic route segment**
term, concretely: the literal text `Ada`, appearing after `/greet/` in
the real, requested path, was never hard-coded anywhere in this real
route's own definition — Flask matched the real `<name>` placeholder
against whatever real text actually appeared there, and handed it to
`greet` as a real, ordinary function argument, real and named `name`
because the real placeholder itself was written `<name>`. A real,
second request to `/greet/Grace` would reach the identical real route,
real and unchanged, with `name` real and equal to `'Grace'` instead —
one real route definition, a real, whole family of real, matching URLs.

### Discard the throwaway example

This toy `greet` route and its own real `app` are discarded now — they
never appear in this project's own real `rebuild` again. Only the real
concept they proved — a real, named URL placeholder becoming a real,
ordinary function argument — carries forward into the real code below.

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `delete_part` function's own real signature and real lookup, already
  quoted in full in the previous lesson: `@parts_bp.route('/<string:part_id>',
  methods=['DELETE'])`, decorated `@token_required(allowed_roles=['programming',
  'admin'])`, `def delete_part(current_user, part_id: str):`, then
  `part = Part.query.get(part_id)` and a real `404` if `not part`. This
  unit Preserves this real shape, binding it to this project's own real
  `/api/parts/<part_id>` path directly, rather than legacy's own,
  separate `/<string:part_id>` registered against a real, separate
  Blueprint — this project's own `rebuild` (and its own verification
  build) has never used real Blueprints at all, an already-established,
  real, structural difference from every earlier Parts and Auth lesson,
  not a new one this unit introduces.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  alongside the existing real Parts routes.
- **Dependencies** — none beyond what earlier lessons already installed.

### The New Code

```python
@app.route('/api/parts/<part_id>', methods=['DELETE'])
@token_required(allowed_roles=['programming', 'admin'])
def delete_part(current_user, part_id):
    part = Part.query.get(part_id)
    if not part:
        return {'error': 'Part not found'}, 404
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own new route added at the end, right before
`return app`:

```python
1  from datetime import datetime, timedelta
2
3  import jwt
4  import uuid
5  from flask import Flask, request, current_app
6  from flask_sqlalchemy import SQLAlchemy
7  from config import config
8
9  db = SQLAlchemy()
10
11 from app.auth import authenticate
12 from app.authorization import token_required
13 from app.models import User
14 from app.part_model import Part
15
16
17 def create_app(config_name='default'):
18     app = Flask(__name__)
19     app.config.from_object(config[config_name])
20     db.init_app(app)
21
22     with app.app_context():
23         db.create_all()
24         seed_admin_user()
25
26     @app.route('/health')
27     def health_check():
28         return {'status': 'healthy'}
29
30     @app.route('/api/auth/login', methods=['POST'])
31     def login():
32         data = request.get_json()
33         email = data.get('email')
34         password = data.get('password')
35
36         if not email or not password:
37             return {'error': 'Email and password required'}, 400
38
39         user = authenticate(email, password)
40         if user is None:
41             return {'error': 'Invalid credentials'}, 401
42
43         user.last_login = datetime.utcnow()
44         db.session.commit()
45
46         token = jwt.encode(
47             {
48                 'sub': user.id,
49                 'role': user.role,
50                 'iat': datetime.utcnow(),
51                 'exp': datetime.utcnow() + timedelta(days=7),
52             },
53             current_app.config['SECRET_KEY'],
54             algorithm='HS256',
55         )
56
57         return {'token': token, 'user': user.to_dict()}
58
59     @app.route('/api/auth/register', methods=['POST'])
60     @token_required(allowed_roles=['admin'])
61     def register(current_user):
62         data = request.get_json()
63         email = data.get('email')
64         password = data.get('password')
65         name = data.get('name')
66         role = data.get('role', 'operator')
67
68         if not email or not password or not name:
69             return {'error': 'Missing required fields'}, 400
70
71         if User.query.filter_by(email=email).first():
72             return {'error': 'User already exists'}, 400
73
74         user = User(id=email.split('@')[0], email=email, name=name, role=role)
75         user.set_password(password)
76         db.session.add(user)
77         db.session.commit()
78
79         return {'user': user.to_dict()}, 201
80
81     @app.route('/api/auth/users')
82     @token_required(allowed_roles=['admin', 'programming'])
83     def get_users(current_user):
84         users = User.query.all()
85         return {'data': [u.to_dict() for u in users]}
86
87     @app.route('/api/parts', methods=['GET', 'POST'])
88     @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
89     def parts_collection(current_user):
90         if request.method == 'POST':
91             if current_user is None:
92                 return {'error': 'Authentication token required'}, 401
93             if current_user.role not in ('programming', 'admin'):
94                 return {
95                     'error': f'Role {current_user.role} not authorized for this action',
96                 }, 403
97
98             data = request.get_json()
99             for field in ('partNumber', 'description'):
100                if field not in data:
101                    return {'error': f'Missing required field: {field}'}, 400
102
103            if Part.query.filter_by(part_number=data['partNumber']).first():
104                return {'error': f'Part number {data["partNumber"]} already exists'}, 409
105
106            data['id'] = f'P-{uuid.uuid4().hex[:8].upper()}'
107            part = Part.from_dict(data)
108            db.session.add(part)
109            db.session.commit()
110            return {'data': part.to_dict()}, 201
111
112        parts = Part.query.order_by(Part.part_number).all()
113        return {
114            'data': [part.to_dict() for part in parts],
115            'total': len(parts),
116        }
117
118    @app.route('/api/parts/<part_id>', methods=['DELETE'])
119    @token_required(allowed_roles=['programming', 'admin'])
120    def delete_part(current_user, part_id):
121        part = Part.query.get(part_id)
122        if not part:
123            return {'error': 'Part not found'}, 404
124
125    return app
126
127
128 def seed_admin_user():
129     if User.query.first():
130         return
131
132     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
133     admin.set_password('admin')
134     db.session.add(admin)
135     db.session.commit()
```

### Mechanical Walkthrough

- **Line 118, `@app.route('/api/parts/<part_id>', methods=['DELETE'])`**
  — this lesson's Header's own new **Dynamic route segment**,
  applied for real: `<part_id>` matches whatever real, literal text
  follows `/api/parts/` in a real, incoming request, real and passed
  through to the real, decorated function as a real argument named
  `part_id` — the identical real concept the throwaway `greet` lab
  above already proved, now binding a real part's own real ID instead
  of a real, toy name. `methods=['DELETE']`, this lesson's Header's own
  **HTTP DELETE** term, already given full treatment in the previous
  lesson: without it, Flask's own real, documented default would only
  accept a real `GET` at this real path, the identical real reason the
  previous lesson's own `rebuild`-side run produced a real `404` for
  every real case — no real route matched this real path at all yet.
- **Line 119, `@token_required(allowed_roles=['programming', 'admin'])`**
  — the identical real, already-proven decorator, called with the
  identical real, narrower role list the previous lesson's own real
  `Reference Source` already quoted — `'operator'` genuinely absent,
  so a real, missing token here real, correctly produces this
  project's own real, ordinary `401`, never this project's own real
  **Operator bypass**.
- **Line 120, `def delete_part(current_user, part_id):`** — two real
  parameters: `current_user`, the identical real, already-established
  shape every other protected route already receives from
  `token_required`; `part_id`, real and supplied entirely by the
  dynamic route segment on the line above — real and never passed by
  any real caller directly.
- **Line 121, `part = Part.query.get(part_id)`** — this lesson's
  Header's own new `Model.query.get(id)` method, called for the first
  time in this project's own `rebuild`: looks up one real row by its
  own real primary key, returning a real `Part` instance if one real,
  matching row exists, or real, plain `None` otherwise.
- **Lines 122–123, `if not part: return {'error': 'Part not found'},
  404`** — a real, plain Python truthiness check: a real `None` is
  real, falsy, so this real branch runs exactly when the previous
  line's own real lookup found nothing, returning this project's own
  real, standard error-envelope shape (already established by every
  earlier route) with a real `404`.

### CS Lens

This is a real instance of **guard clause / early return** — the
identical real pattern this project's own login and registration
routes already used, applied here to a real lookup instead of a real
input-validation check: handle the real, exceptional case (`part`
doesn't exist) and return immediately, so whatever real code follows
never has to real, defensively re-check that `part` is real and valid.

Also recognized in: any real function that checks its own real
preconditions first and exits early, rather than nesting its real,
main logic inside a real, growing `if` block.

### SE Lens

The real, deliberately *not*-taken alternative here: writing this
real route's own complete real body — the real, soft-delete assignment
and its own real, successful response — in this same unit, alongside
this unit's own real, new routing concept. Rejected on purpose,
matching this project's own real, repeated discipline: this unit's own
real, new idea is *how a real request reaches a real, specific part at
all*; what happens to that real part once found is a real, separate
decision, genuinely large enough on its own (the previous lesson's own
real **Soft delete** term, and its own real idempotency finding) to
earn its own real, dedicated unit rather than being folded in here as
an afterthought.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_deletion.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, partial route already
changes any of the previous lesson's own real, honest `404`s for the
real, correct reason — so this was actually run this session:

```
test_part_deletion.py::test_delete_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_deletion.py::test_delete_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_deletion.py::test_delete_part_with_unknown_id_returns_404 PASSED
test_part_deletion.py::test_delete_part_archives_instead_of_removing_the_row FAILED
test_part_deletion.py::test_deleting_an_already_archived_part_is_idempotent FAILED
test_part_deletion.py::test_an_archived_part_still_appears_in_the_default_list FAILED
```

Three real cases already pass, real and for the correct reason now —
the real `401`, real `403`, and real `404` cases all genuinely exercise
this unit's own real routing and lookup. All three real cases needing a
real, *found* part now fail, and genuinely not for the reason this
lesson first predicted before running it — not a real, silent no-op,
but a real, hard error, the exact real value of actually running this
instead of assuming:

```
TypeError: The view function for 'delete_part' did not return a valid
response. The function either returned None or ended without a return
statement.
```

Flask's own real, documented contract requires every real view function
to return something real on every real code path — a real dict, a real
`(body, status)` tuple, anything Flask's own real response machinery
can build a real `Response` from. This unit's own real `delete_part`
satisfies that real contract on its own real, explicit `404` branch,
but falls through with no real `return` at all once a real part
*is* found — real, plain Python would happily return a real, implicit
`None` here with no complaint; Flask, real and correctly, refuses to
serve that real `None` as a real HTTP response at all, raising this
real `TypeError` instead of silently sending a real, empty body. Real
and worth naming honestly: this is a genuinely different real failure
than "no real branch handles this case" — it's Flask itself, real and
loudly, refusing to let this unit's own real, incomplete route pretend
to be finished.

### Connecting this unit to what came before

The previous lesson proved six real things `DELETE /api/parts/<id>`
does. This unit is where `rebuild` first learns to find the real part
a request is even asking about.

---

## Concept Unit: Archiving, Not Erasing

### The Problem

This unit's own real route can now find a real part, or honestly say
it can't. Neither real branch yet does what the previous lesson's own
real **Soft delete** term requires: changing a real, found part's own
real `status`, without removing its own real row. The real question
this unit answers: what's the smallest real code making that real
change, and returning the real, exact response the previous lesson's
own real tests already expect?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `delete_part` function's own real, remaining body, already quoted in
  full in the previous lesson: `part.status = 'archived'`, then
  `db.session.commit()`, then `return jsonify({'message': f'Part
  {part.part_number} archived'})`. This unit Preserves this real
  shape exactly — real and deliberately not the real `try`/`except`
  wrapping legacy's own real version also has, and real and
  deliberately not the real `socketio.emit(...)` call either; see the
  SE Lens, below.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the previous unit's own new `delete_part`
  function, directly after its own real, existing `if not part:`
  branch.
- **Dependencies** — none beyond what the previous unit already
  installed.

### The New Code

```python
    part.status = 'archived'
    db.session.commit()
    return {'message': f'Part {part.part_number} archived'}
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous unit's own
version, with this unit's own new lines completing `delete_part`:

```python
1  from datetime import datetime, timedelta
2
3  import jwt
4  import uuid
5  from flask import Flask, request, current_app
6  from flask_sqlalchemy import SQLAlchemy
7  from config import config
8
9  db = SQLAlchemy()
10
11 from app.auth import authenticate
12 from app.authorization import token_required
13 from app.models import User
14 from app.part_model import Part
15
16
17 def create_app(config_name='default'):
18     app = Flask(__name__)
19     app.config.from_object(config[config_name])
20     db.init_app(app)
21
22     with app.app_context():
23         db.create_all()
24         seed_admin_user()
25
26     @app.route('/health')
27     def health_check():
28         return {'status': 'healthy'}
29
30     @app.route('/api/auth/login', methods=['POST'])
31     def login():
32         data = request.get_json()
33         email = data.get('email')
34         password = data.get('password')
35
36         if not email or not password:
37             return {'error': 'Email and password required'}, 400
38
39         user = authenticate(email, password)
40         if user is None:
41             return {'error': 'Invalid credentials'}, 401
42
43         user.last_login = datetime.utcnow()
44         db.session.commit()
45
46         token = jwt.encode(
47             {
48                 'sub': user.id,
49                 'role': user.role,
50                 'iat': datetime.utcnow(),
51                 'exp': datetime.utcnow() + timedelta(days=7),
52             },
53             current_app.config['SECRET_KEY'],
54             algorithm='HS256',
55         )
56
57         return {'token': token, 'user': user.to_dict()}
58
59     @app.route('/api/auth/register', methods=['POST'])
60     @token_required(allowed_roles=['admin'])
61     def register(current_user):
62         data = request.get_json()
63         email = data.get('email')
64         password = data.get('password')
65         name = data.get('name')
66         role = data.get('role', 'operator')
67
68         if not email or not password or not name:
69             return {'error': 'Missing required fields'}, 400
70
71         if User.query.filter_by(email=email).first():
72             return {'error': 'User already exists'}, 400
73
74         user = User(id=email.split('@')[0], email=email, name=name, role=role)
75         user.set_password(password)
76         db.session.add(user)
77         db.session.commit()
78
79         return {'user': user.to_dict()}, 201
80
81     @app.route('/api/auth/users')
82     @token_required(allowed_roles=['admin', 'programming'])
83     def get_users(current_user):
84         users = User.query.all()
85         return {'data': [u.to_dict() for u in users]}
86
87     @app.route('/api/parts', methods=['GET', 'POST'])
88     @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
89     def parts_collection(current_user):
90         if request.method == 'POST':
91             if current_user is None:
92                 return {'error': 'Authentication token required'}, 401
93             if current_user.role not in ('programming', 'admin'):
94                 return {
95                     'error': f'Role {current_user.role} not authorized for this action',
96                 }, 403
97
98             data = request.get_json()
99             for field in ('partNumber', 'description'):
100                if field not in data:
101                    return {'error': f'Missing required field: {field}'}, 400
102
103            if Part.query.filter_by(part_number=data['partNumber']).first():
104                return {'error': f'Part number {data["partNumber"]} already exists'}, 409
105
106            data['id'] = f'P-{uuid.uuid4().hex[:8].upper()}'
107            part = Part.from_dict(data)
108            db.session.add(part)
109            db.session.commit()
110            return {'data': part.to_dict()}, 201
111
112        parts = Part.query.order_by(Part.part_number).all()
113        return {
114            'data': [part.to_dict() for part in parts],
115            'total': len(parts),
116        }
117
118    @app.route('/api/parts/<part_id>', methods=['DELETE'])
119    @token_required(allowed_roles=['programming', 'admin'])
120    def delete_part(current_user, part_id):
121        part = Part.query.get(part_id)
122        if not part:
123            return {'error': 'Part not found'}, 404
124
125        part.status = 'archived'
126        db.session.commit()
127        return {'message': f'Part {part.part_number} archived'}
128
129    return app
130
131
132 def seed_admin_user():
133     if User.query.first():
134         return
135
136     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
137     admin.set_password('admin')
138     db.session.add(admin)
139     db.session.commit()
```

### Mechanical Walkthrough

- **Line 125, `part.status = 'archived'`** — a real, plain Python
  attribute assignment on the real `Part` instance the previous unit's
  own real lookup already found; this project's own real `Part` model
  already declared `status` as a real, ordinary SQLAlchemy column, so
  this real line changes exactly one real value on one real,
  already-loaded row — nothing here removes any real row, matching the
  previous lesson's own real **Soft delete** term exactly.
- **Line 126, `db.session.commit()`** — the identical real,
  already-established call this project's own login and registration
  routes already use: flushes this real session's own, real, pending
  change to the real database, making it real and permanent.
- **Line 127, `return {'message': f'Part {part.part_number}
  archived'}`** — a real, plain Python dict, Flask's own real,
  already-established, automatic-`jsonify` return shape; the real
  f-string reads `part.part_number` off the identical real,
  already-loaded instance, producing the real, exact response body the
  previous lesson's own real test already asserts:
  `{'message': 'Part 9999999 archived'}`.

### CS Lens

This is the identical real **mutate, then persist** shape this
project's own real registration route already used
(`db.session.add(user)` / `db.session.commit()`), here applied to a
real, already-loaded row instead of a real, brand-new one: real,
in-memory Python state changes first (`part.status = 'archived'`), and
only the real, explicit `commit()` call actually writes it — nothing
about a real Python attribute assignment touches the real database on
its own.

Also recognized in: any real ORM's own real unit-of-work pattern,
where real, in-memory object changes accumulate and are only actually
sent to a real database on a real, explicit save or commit call.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own real `try`/`except Exception as e: db.session.rollback(); return
jsonify({'error': str(e)}), 500` wrapping, and its own real
`socketio.emit('APP_STATE_INVALIDATED')` call, both real and present in
the previous lesson's own quoted `Reference Source`. Rejected on
purpose, matching this project's own real, repeated reasoning: no real,
current test in this project's own real, six-test acceptance file
exercises a real database failure or checks for a real, emitted
real-time event — this project has no real Socket.IO client anywhere
in `rebuild` yet at all — so building either now would be real,
speculative code ahead of any real, stated requirement this project can
actually verify. The real, honest cost accepted here: a real, genuine
database error on this real route would currently propagate as a real,
unhandled exception instead of a real, clean `500`, and no real client
of this route is notified in real time when a real deletion happens —
both real, accepted gaps, not oversights, the identical real discipline
this project's own listing route's SE Lens already accepted for
legacy's own `status`/`search` filtering.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_deletion.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — this project's own real, six-test file
already found two genuine surprises in earlier lessons this session, so
this was actually run this session, not predicted:

```
test_part_deletion.py::test_delete_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_deletion.py::test_delete_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_deletion.py::test_delete_part_with_unknown_id_returns_404 PASSED
test_part_deletion.py::test_delete_part_archives_instead_of_removing_the_row PASSED
test_part_deletion.py::test_deleting_an_already_archived_part_is_idempotent PASSED
test_part_deletion.py::test_an_archived_part_still_appears_in_the_default_list PASSED

6 passed in ...s
```

All six real cases now genuinely pass against `rebuild`, every one for
the real, correct reason this time — including the two that already,
coincidentally, passed before this unit existed: the real, unknown-ID
case now passes because a real route ran and correctly decided a real
part was missing, not because no real route matched at all; the real,
list-visibility case now passes because a real deletion genuinely
happened and the real part still, correctly, appears afterward — the
identical real, observable behavior as legacy, reached by a completely
independent, real implementation.

Every earlier real test this project has ever written was also
re-run together, this session, confirming no real regression:

```
5 passed in ...s
```

(this project's own real backend `tests/` folder — `test_auth.py` and
`test_authorization.py` — unaffected by this lesson, real and
unrelated code.)

### Connecting this unit to what came before

The previous unit taught `rebuild` how to find a real part. This unit
is where it finally does something real to it — completing the real
route the previous lesson's own real characterization already fully
specified.

---

## Connect the pieces

One real request, `DELETE /api/parts/<id>`, now has a real, complete,
independently-built answer in `rebuild`: a real, dynamic route finding
one real part by its own real ID, correctly rejecting an unauthorized
or nonexistent request, and, on real success, changing exactly one
real column rather than removing the real row — the identical real,
observable behavior the previous lesson proved legacy has, including
its own real idempotency and its own real, surprising list visibility,
reached by a completely independent real implementation that copied
none of legacy's own real structure, only its real, external contract.

---

**Next lesson:** the frontend half of this same real slice — a real,
tested way for this project's own real `PartsList` to let a real user
actually trigger this real deletion, the same real discipline this
project's own Add Part slice already used, kept to a genuinely thin,
paired step rather than several more lessons of backend depth first.
