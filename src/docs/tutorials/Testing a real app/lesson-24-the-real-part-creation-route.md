# Lesson 24: The Real Part Creation Route

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> this slice's own real acceptance test — written before any of
> `rebuild`'s own creation code existed — passes against `rebuild` too.

## What you will build

The real construction logic this project's own `Part` model has been
deliberately missing since it was first built, and the actual real
`POST /api/parts` route that uses it — a real, server-generated ID, a
real duplicate check, and a real `409` this project hasn't needed
until now.

## What you need to know first

The real, already-tested `token_required` decorator. The real `Part`
model, and the real reason its own real `from_dict()` was deliberately
left out when it was first built. This slice's own real acceptance
test (`acceptance-tests/test_part_creation.py`), proven against legacy,
proven RED against `rebuild` — as a real `405`, not a `404`.

## Terms introduced

None — this lesson assembles real pieces this project has already
given full treatment to, or that its own `Part`-model lesson already
named and deliberately deferred.

## Objects and methods used

- **`uuid.uuid4()`**
  - *What it is:* a real function, exported by Python's own standard
    `uuid` module.
  - *Implementation:* checked against Python's own official
    documentation this session — generates a real, random UUID (a
    128-bit value, standard enough that two independently-generated
    real ones colliding is not a real, practical concern) and returns
    it as a real `UUID` object; `.hex` reads that real object's own
    real value as a real, 32-character hexadecimal string, with no real
    dashes; Python string slicing (`[:8]`) then keeps only its real
    first eight real characters, and `.upper()` — a real, standard
    Python string method — converts them to real, uppercase letters.
  - *Its use:* this lesson's own real route calls it once, per real
    creation, building this lesson's Header's own **Server-generated
    identifier**.
  - *Type:* a free function, exported by `uuid`, returning a real
    `UUID` object.
  - *Responsibility:* producing one real, practically-unique random
    value, with no real, external coordination needed to guarantee it.
  - *Depends on:* nothing — genuinely random, not derived from any
    real input.
  - *Connects to:* called once, inside this lesson's own real route;
    its own real, truncated, uppercased result becomes part of the
    real new part's own real `id`.
  - *Shape:* a real, standard Python boundary — not project-specific.

---

## Concept Unit: Building a Part From What a Client Actually Sends

### The Problem

This project's own `Part` model already has a real `to_dict()`, real
and already proven, but nothing yet turns a real, incoming request
body back into a real `Part` instance — the identical real gap this
project's own model lesson already named and deliberately left open.
The real question this unit answers: what does the actual smallest
real, reverse mapping look like, matching this slice's own real
acceptance test's own real, exact expectations?

### Project Change

- **Reference Source** — `backend/app/models/part.py`, the real
  `from_dict` classmethod, read in full this session: builds a real
  `Part` from a real, camelCase-keyed dictionary, reading `id`,
  `partNumber`, `description`, `material`, `currentRevision` (default
  `1`), `status` (default `'draft'`), and several real, optional model-
  path fields, converting a real `tags` array back into a real,
  comma-joined string. This unit Preserves the real fields this
  project's own current, real requirement actually needs — `id`,
  `partNumber`, `description`, `material` — and deliberately narrows
  the rest; see the SE Lens, below.
- **Files affected** — modified: `rebuild/backend/app/part_model.py`.
- **Change type** — modify.
- **Location** — inside the existing real `Part` class, alongside its
  real `to_dict()`.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
@classmethod
def from_dict(cls, data):
    return cls(
        id=data.get('id'),
        part_number=data.get('partNumber'),
        description=data.get('description'),
        material=data.get('material'),
    )
```

### The Updated Project

`rebuild/backend/app/part_model.py`, in full — the previous lesson's
own version, with this unit's own new classmethod added:

```python
1  from datetime import datetime
2
3  from app import db
4
5
6  class Part(db.Model):
7      __tablename__ = 'parts'
8
9      id = db.Column(db.String(50), primary_key=True)
10     part_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
11     description = db.Column(db.String(500), nullable=False)
12     material = db.Column(db.String(100), nullable=True)
13     current_revision = db.Column(db.Integer, default=1)
14     status = db.Column(db.String(20), default='draft')
15     model_3d_path = db.Column(db.String(500), nullable=True)
16     thumbnail_url = db.Column(db.String(500), nullable=True)
17     created_at = db.Column(db.DateTime, default=datetime.utcnow)
18     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
19     created_by = db.Column(db.String(100), default='system')
20     is_favorite = db.Column(db.Boolean, default=False)
21     tags = db.Column(db.Text, nullable=True)
22     final_model_path = db.Column(db.String(500), nullable=True)
23     fixture_model_path = db.Column(db.String(500), nullable=True)
24     final_model_id = db.Column(db.String(50), nullable=True)
25
26     def to_dict(self):
27         return {
28             'id': self.id,
29             'description': self.description,
30             'material': self.material,
31             'status': self.status,
32             'partNumber': self.part_number,
33             'currentRevision': self.current_revision,
34             'model3dPath': self.model_3d_path,
35             'finalModelPath': self.final_model_path,
36             'fixtureModelPath': self.fixture_model_path,
37             'finalModelId': self.final_model_id,
38             'thumbnailUrl': self.thumbnail_url,
39             'createdAt': self.created_at.isoformat() if self.created_at else None,
40             'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
41             'createdBy': self.created_by,
42             'isFavorite': self.is_favorite,
43             'tags': self.tags.split(',') if self.tags else [],
44         }
45
46     @classmethod
47     def from_dict(cls, data):
48         return cls(
49             id=data.get('id'),
50             part_number=data.get('partNumber'),
51             description=data.get('description'),
52             material=data.get('material'),
53         )
```

### Mechanical Walkthrough

- **Line 46, `@classmethod`** — a real, standard Python decorator,
  already given full treatment when this project's own real
  `Model.query.get(id)` entry first named the general real pattern of
  a method bound to the real *class* itself rather than a real
  instance; here, applied for the first time to code this project
  actually writes, not only calls.
- **Line 47, `def from_dict(cls, data):`** — a real classmethod's own
  real, standard first parameter, `cls`, receiving the real `Part`
  class itself, not a real instance — necessary because no real
  instance exists yet; this method's whole real job is building one.
- **Lines 48–53, `return cls(id=data.get('id'), ...)`** — calling
  `cls` directly, the identical real effect as calling `Part(...)`,
  since `cls` *is* `Part` here; `data.get('id')` and friends — real,
  plain dictionary `.get(...)` calls, already given full treatment,
  reading each real, expected camelCase key, returning real `None` for
  any this project's own real route doesn't actually populate yet.

### CS Lens

This is a real instance of the **factory method pattern** — a real,
named, alternative constructor, distinct from a real class's own real,
default `__init__`, built specifically to accept a real, external data
shape (camelCase, dictionary-keyed) and translate it into this
project's own real, internal shape (snake_case, keyword arguments) —
the real, exact mirror image of `to_dict()`, already proven, which
translates the identical real boundary the other real direction.

Also recognized in: any real ORM's own real `.from_json(...)`/
`.parse(...)` classmethod; a real UI framework's own real
`Widget.fromConfig(...)`, building an instance from a real, external
configuration object instead of exposing its real constructor
directly.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own real `from_dict`'s full, real field set — `currentRevision`,
`status`, every real model-path field, real `tags` array conversion —
in this same lesson. Rejected on purpose, the identical real reasoning
this project has already used more than once: this slice's own real,
current, tested requirement only ever sends `partNumber`, `description`,
and `material`; porting the rest now would be real, speculative code
with no real test proving it's even correct. The real, honest cost
accepted here: this method will need real, additional code the moment
a real, later lesson's own real test actually sends one of the fields
left out here — not a shortcut, the correct order.

### Commands needed

No new command — this unit's own real proof is the next unit's own
real, complete route.

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: a real
classmethod that nothing yet calls cannot change any real, already-
tested behavior; Python's own documented behavior gives no real reason
it would.

### Connecting this unit to what came before

This project's own model lesson deliberately left this real gap open.
This unit is where a real, concrete reason to fill it finally existed.

---

## Concept Unit: The Real Creation Route

### The Problem

A real way to build a `Part` from a real request body now exists.
Nothing in `rebuild/backend` yet reads a real request and actually
creates one. The real question this unit answers: what's the actual
smallest real route that does, matching this slice's own real, already-
proven three cases exactly?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `create_part` function's own real, core logic, read in full this
  session: validates `partNumber`/`description`, checks for a real,
  existing duplicate, generates a real ID, builds and saves a real
  `Part`, returns a real `201`. This unit deliberately does not
  Preserve legacy's own real `socketio.emit(...)` broadcast, nor its
  own real, generic `except Exception` handler — see the SE Lens,
  below.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  alongside the existing real Parts route.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
import uuid


@app.route('/api/parts', methods=['GET', 'POST'])
@token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
def parts_collection(current_user):
    if request.method == 'POST':
        if current_user is None:
            return {'error': 'Authentication token required'}, 401
        if current_user.role not in ('programming', 'admin'):
            return {
                'error': f'Role {current_user.role} not authorized for this action',
            }, 403

        data = request.get_json()
        for field in ('partNumber', 'description'):
            if field not in data:
                return {'error': f'Missing required field: {field}'}, 400

        if Part.query.filter_by(part_number=data['partNumber']).first():
            return {'error': f'Part number {data["partNumber"]} already exists'}, 409

        data['id'] = f'P-{uuid.uuid4().hex[:8].upper()}'
        part = Part.from_dict(data)
        db.session.add(part)
        db.session.commit()
        return {'data': part.to_dict()}, 201

    parts = Part.query.order_by(Part.part_number).all()
    return {
        'data': [part.to_dict() for part in parts],
        'total': len(parts),
    }
```

That real, single function replaces the previous lesson's own real
`list_parts` entirely — see the Mechanical Walkthrough, below, for why
one real route now handles both real HTTP methods instead of two,
separate ones.

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with `list_parts` replaced by this unit's own combined real
route:

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
100                 if field not in data:
101                     return {'error': f'Missing required field: {field}'}, 400
102
103             if Part.query.filter_by(part_number=data['partNumber']).first():
104                 return {'error': f'Part number {data["partNumber"]} already exists'}, 409
105
106             data['id'] = f'P-{uuid.uuid4().hex[:8].upper()}'
107             part = Part.from_dict(data)
108             db.session.add(part)
109             db.session.commit()
110             return {'data': part.to_dict()}, 201
111
112         parts = Part.query.order_by(Part.part_number).all()
113         return {
114             'data': [part.to_dict() for part in parts],
115             'total': len(parts),
116         }
117
118     return app
119
120
121 def seed_admin_user():
122     if User.query.first():
123         return
124
125     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
126     admin.set_password('admin')
127     db.session.add(admin)
128     db.session.commit()
```

### Mechanical Walkthrough

- **Line 87, `@app.route('/api/parts', methods=['GET', 'POST'])`** —
  a real, standard Flask route registration, its own real `methods=`
  list now naming *two* real HTTP methods on the identical real path,
  rather than one route per method; a real, deliberate structural
  choice — see the SE Lens, below.
- **Line 88, `@token_required(allowed_roles=['operator', 'quality',
  'programming', 'admin'])`** — the identical real, four-role list this
  slice's own listing lesson already used, applied once, to the real,
  combined route — real, correct for the real `GET` case, this
  project's own already-proven **Operator bypass** included.
- **Line 90, `if request.method == 'POST':`** — Flask's own real,
  standard `request.method`, a real string naming which real HTTP
  method the real, current request actually used; this real branch is
  where every real, `POST`-specific check and real side effect lives.
- **Lines 91–96, a real, second, narrower authorization check** — real,
  necessary because `token_required`'s own real check, above, only
  enforces this route's real, *combined* allowed-role list — real and
  correct for reading, too permissive for writing. `if current_user is
  None:` comes first, and is not optional: this project's own real
  **Operator bypass**, proven in the previous lesson, applies to
  *this exact route*, since `'operator'` is among its own real,
  combined `allowed_roles` — a real request with no token at all
  reaches this real function with a real, literal `None` in place of a
  real user, exactly as designed for a real `GET`. Run for real this
  session, a real `POST` with no token reached this exact real branch
  too, and `current_user.role` — with no real `if current_user is
  None` guard yet — raised a real `AttributeError`, crashing with a
  real `500` instead of any real, intended status at all. This is a
  real, concrete cost of this unit's own **Deliberately changed**
  choice to combine `GET` and `POST` into one real, shared function:
  the identical real bypass legacy's own, separate `get_parts` alone
  would have safely absorbed now reaches `create_part`'s own real logic
  too, since both are the identical real Python function. `current_user.role
  not in ('programming', 'admin')`, checked only once a real,
  non-`None` user is confirmed — the identical real `403` shape
  `token_required` itself already returns elsewhere, built by hand here
  since this real distinction lives *inside* one real route, not
  between two, separate ones.
- **Lines 96–99, real, missing-field validation** — a real Python
  `for` loop over a real, two-element tuple, checking each real, named
  key's own real presence in the real request body — the identical
  real check legacy's own route already performs, expressed as a real
  loop instead of legacy's own real, separate `required_fields` list
  and loop, the identical real idea, reached slightly differently.
- **Lines 101–102, the real, duplicate check** — this project's own
  real `filter_by(...).first()`, already given full treatment,
  returning legacy's own real, exact `409` and error string on a real
  match.
- **Lines 104–108, real creation** — this lesson's Header's own
  `uuid.uuid4()`, building this lesson's own **Server-generated
  identifier**; the previous unit's own real `Part.from_dict(data)`,
  now actually called; `db.session.add(...)`/`.commit()`, this
  project's own already-established real persistence mechanism; a real
  `201` with the real, newly-created part's own real `to_dict()`.
- **Lines 110–114, the real, unchanged `GET` case** — the identical
  real query and real envelope the previous lesson already built,
  reached now only when line 90's own real condition is false.

### CS Lens

This is a real instance of a **resource-oriented collection
endpoint** — one real URL, `/api/parts`, representing the entire real
collection of parts; which real HTTP method is used decides *what
happens* to that real collection (`GET` reads it, `POST` adds to it),
rather than the real *path itself* encoding the real action
(`/api/parts/list`, `/api/parts/create`) — the real, standard REST
idea this project's own real routes have followed all along,
now shown explicitly on one, single, real, shared path.

Also recognized in: any real, RESTful API's own real collection
endpoint; a real filesystem directory, where `ls` and `touch` both
operate on the identical real path, distinguished by the real,
different real operation requested, not by a real, different path.

### SE Lens

The real, deliberately *not*-taken alternative here — the one legacy
itself takes: two real, separate route functions, `get_parts` and
`create_part`, each its own real `@parts_bp.route(...)` registration.
Rejected here, deliberately, as a **Deliberately changed** real
structural choice: `rebuild/backend`'s own routes all live inline,
directly inside `create_app`, not through a real, separate Blueprint
system legacy uses — a real, already-stated choice this project's own
login-route lesson explained. Two real, separate real function
definitions for the identical real path would either need a real,
awkward, repeated `methods=` juggling act or a real, second, distinct
real path Flask would treat as genuinely different — combining them
into one real function, branching on `request.method`, is the real,
smaller, more honest real fit for this project's own real, current,
inline-route structure. The real, honest cost accepted here: this real
function will keep growing, mixing real read and real write logic in
one real place, for as long as this project's own routes stay inline —
a real, later lesson revisiting this project's own real route
organization, once enough real routes exist to justify it, is the
honest place to reconsider it.

Also deliberately *not* Preserved: legacy's own real
`socketio.emit('APP_STATE_INVALIDATED')` broadcast, and its own real,
generic `except Exception as e: db.session.rollback(); return
jsonify({'error': str(e)}), 500` wrapper. Real-time broadcasting is a
real, entirely separate infrastructure concern this project has never
built any part of; adding one real call to it here, with nothing else
in this project able to receive it, would be real, speculative,
untestable code. The real, generic exception handler has no real,
specific, known failure case this project has ever actually observed
to prove it's even reachable — Flask's own real, default, uncaught-
exception behavior already answers with a real `500` on its own,
without this project inventing a real, untested catch for a real
failure mode nobody has characterized yet.

### Commands needed

This unit's own real, final proof reuses this project's own shared
acceptance-test harness, unmodified, now pointed at `rebuild`:

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='new'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_creation.py -v
```

### Run it, per the Verification Rule

Real doubt existed here, matching this slice's own already-established
practice of actually running real routes before trusting them:

```
test_part_creation.py::test_create_part_requires_a_description PASSED
test_part_creation.py::test_create_part_succeeds_with_a_server_generated_id PASSED
test_part_creation.py::test_create_part_rejects_a_duplicate_part_number PASSED

3 passed in ...s
```

All three real cases now genuinely pass against `rebuild` — real part
creation, proven the whole way through, from a real request body to a
real, persisted row a real, separate `GET /api/parts` call can
actually see.

### Connecting this unit to what came before

The previous unit built the real, missing piece this project's own
`Part` model needed. This unit is where that piece, and this project's
own real routing structure, finally answer a real request to create
something.

---

## Connect the pieces

One real, combined route, `/api/parts`, now genuinely reads and writes
real parts — a real, server-generated identity, a real duplicate
check, and a real, narrower, write-specific role check, all proven
against the identical real test this slice's own testing lesson
already proved against legacy. Real Parts creation is now a complete,
real backend slice; the real frontend half — an actual, real way for a
real user to add a part — is this feature's own next, separate,
real work.

---

**Next lesson:** to be decided once this slice's own real work is
actually typed in and confirmed, by hand, against these lessons.
