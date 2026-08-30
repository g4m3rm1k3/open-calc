# Lesson 37: The Real Favorite Toggle Route

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own seven real tests pass against `rebuild`
> too, for the real, correct reasons.

## What you will build

The actual real `PUT /api/parts/<id>` route, registered alongside this
slice's own already-real `DELETE` route at the identical real path,
updating only the one real field this slice's own testing lesson
deliberately scoped to: `isFavorite`.

## What you need to know first

The real, already-tested `token_required(allowed_roles=None)` decorator.
The real `Part` model, including its own real, already-existing
`is_favorite` column and its own real `to_dict()` entry — neither
needs a real change for this lesson. This slice's own real, already-
proven `DELETE /api/parts/<id>` route, registered at the identical real
URL this lesson's own new route shares. This project's own real
**Dynamic route segment** term, already given full treatment.

## Terms introduced

None genuinely new — this unit assembles this project's own,
already-proven pieces: the identical real `Part.query.get(id)` this
slice's own deletion route already established, and a real,
independent `if 'FIELD' in data:` check, real and structurally
identical to this project's own real registration route's own
`if 'role' in data:`-style optional-field handling.

## Objects and methods used

None genuinely new beyond this lesson's own reused, already-treated
`Model.query.get(id)` and `dict.__contains__` (the real `in` check) —
both given full treatment in earlier lessons.

---

## Concept Unit: Two Routes, One Real URL

### The Problem

`rebuild`'s own real `/api/parts/<part_id>` path currently answers only
a real `DELETE`. A real `PUT` to the identical real path must reach a
real, different piece of code — not replace the real, existing one.
The real question this unit answers: does Flask actually support two,
real, separate route registrations sharing one real URL pattern, each
for a real, different HTTP method?

> **Before reading on:** this project's own real `/api/parts` collection
> route already handles both a real `GET` and a real `POST`, but as
> *one* real, single function, branching internally on
> `request.method`. Given that this slice's own real deletion route is
> already its own, separate, real function at `/api/parts/<part_id>`,
> would adding a real `PUT` there need to modify that same real
> function, or could it be a genuinely separate, real
> `@app.route(...)` registration instead?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `update_part` function's own real signature and real lookup, already
  quoted in full in the previous lesson: `@parts_bp.route('/<string:part_id>',
  methods=['PUT'])`, decorated `@token_required(allowed_roles=['programming',
  'admin'])`, `def update_part(current_user, part_id: str):`, then
  `part = Part.query.get(part_id)` and a real `404` if `not part`.
  Legacy itself already registers `update_part` and `delete_part` as
  two, real, separate Blueprint routes sharing the identical real URL
  pattern, differing only by real `methods=`; this unit Preserves that
  real shape, registered directly in `create_app` rather than a real,
  separate Blueprint, the identical real, already-established
  structural difference this slice's own deletion-route lesson already
  named.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  directly after the existing real `delete_part` route.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
@app.route('/api/parts/<part_id>', methods=['PUT'])
@token_required(allowed_roles=['programming', 'admin'])
def update_part(current_user, part_id):
    part = Part.query.get(part_id)
    if not part:
        return {'error': 'Part not found'}, 404

    data = request.get_json()
    if not data:
        return {'error': 'No data provided'}, 400
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own new route added, directly after
`delete_part`:

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
129    @app.route('/api/parts/<part_id>', methods=['PUT'])
130    @token_required(allowed_roles=['programming', 'admin'])
131    def update_part(current_user, part_id):
132        part = Part.query.get(part_id)
133        if not part:
134            return {'error': 'Part not found'}, 404
135
136        data = request.get_json()
137        if not data:
138            return {'error': 'No data provided'}, 400
139
140    return app
141
142
143 def seed_admin_user():
144     if User.query.first():
145         return
146
147     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
148     admin.set_password('admin')
149     db.session.add(admin)
150     db.session.commit()
```

### Mechanical Walkthrough

- **Line 129, `@app.route('/api/parts/<part_id>', methods=['PUT'])`**
  — this project's own real **Dynamic route segment**, already given
  full treatment, reused unchanged: `<part_id>` matches the identical
  real URL shape `delete_part`'s own route already matches, real and
  registered as a genuinely separate `@app.route(...)` call — Flask's
  own real, documented behavior lets more than one real view function
  share one real URL pattern, as long as their own real `methods=`
  lists don't real, overlap, the identical real capability this
  project's own `/api/parts` collection route already relies on, just
  expressed here as two real, separate functions instead of one real,
  internally branching one.
- **Line 130, `@token_required(allowed_roles=['programming', 'admin'])`**
  — the identical real, already-proven decorator, called with the
  identical real, narrower role list `delete_part`'s own decorator
  already uses.
- **Line 131, `def update_part(current_user, part_id):`** — the
  identical real, two-parameter shape `delete_part` already
  established.
- **Line 132, `part = Part.query.get(part_id)`** — the identical real
  method `delete_part` already introduced, reused here unchanged.
- **Lines 133–134, the real, identical `404` branch** — real and
  structurally identical to `delete_part`'s own.
- **Line 136, `data = request.get_json()`** — real and already
  established by this project's own real `login` and `register`
  routes, reused here on a real, different route.
- **Lines 137–138, `if not data: return {'error': 'No data provided'},
  400`** — a real, plain Python truthiness check, real and
  deliberately matching legacy's own real wording exactly, proven by
  the previous lesson's own real, careful characterization of exactly
  which real inputs actually reach it (a real, empty `{}`, never a
  genuinely bodyless request, which Flask itself intercepts first with
  a real `415`).

### CS Lens

This is the identical real **guard clause / early return** this
project's own real deletion-route lesson already named in full,
applied here to a real, second precondition (a real, usable request
body) stacked directly after the first (a real, existing part) —
each real, exceptional case handled and exited immediately, before any
real code assumes either one is real and true.

Also recognized in: any real function validating more than one real
precondition in sequence, each with its own real, early exit, rather
than nesting every real check inside the one before it.

### SE Lens

The real, deliberately *not*-taken alternative here: writing this
real route's own real, favorite-toggling logic in this same unit,
alongside its own real routing and validation. Rejected on purpose,
matching this project's own real, repeated discipline — this unit's
own real, new idea is *that a second, real route can share `delete_part`'s
own real URL*; what that real route actually changes once a real,
usable body exists is a real, separate decision, earning its own real,
dedicated unit next.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_update.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether registering a real, second route at
an already-used real URL genuinely works, and whether this real,
partial route already changes any of the previous lesson's own real,
honest `405`s for the real, correct reason — so this was actually run
this session:

```
test_part_update.py::test_update_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_update.py::test_update_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_update.py::test_update_part_with_unknown_id_returns_404 PASSED
test_part_update.py::test_toggling_favorite_on_changes_only_that_field FAILED
test_part_update.py::test_toggling_favorite_off_again_is_a_separate_real_request FAILED
test_part_update.py::test_update_part_with_an_empty_json_body_returns_400 PASSED
test_part_update.py::test_update_part_with_no_body_and_no_content_type_returns_415_not_400 PASSED
```

Five real cases already pass, real and for the correct reason —
including both of this lesson's own real "no data" surprises, since
this unit's own real validation already runs before either real
favorite-toggling case. The two real cases needing a real, *successful*
favorite change still fail — this unit's own real route has no real
branch for "the data is real and usable" yet at all.

### Connecting this unit to what came before

The previous lesson proved seven real things `PUT /api/parts/<id>`
does. This unit is where `rebuild` first learns this real URL answers
to more than one real HTTP method at all.

---

## Concept Unit: Changing Exactly One Real Field

### The Problem

This unit's own real route can now find a real part and reject a real,
unusable body. Neither real branch yet does what this slice's own
testing lesson requires: actually changing `isFavorite` when it's
real and present, and returning the real, complete, updated part
afterward. The real question this unit answers: what's the smallest
real code doing exactly that, and nothing else?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `update_part` function's own real, remaining body, already quoted in
  full in the previous lesson: five real, independent `if 'FIELD' in
  data:` checks, then `db.session.commit()`, then
  `return jsonify({'data': part.to_dict()})`. This unit Preserves only
  the one real check this slice's own testing lesson actually proved —
  `if 'isFavorite' in data: part.is_favorite = data['isFavorite']` —
  real and deliberately not porting the other four real, sibling
  checks (`description`, `material`, `status`, `model3dPath`) yet; see
  the SE Lens, below.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the previous unit's own new `update_part`
  function, directly after its own real, existing `if not data:`
  branch.
- **Dependencies** — none beyond what the previous unit already
  installed.

### The New Code

```python
        if 'isFavorite' in data:
            part.is_favorite = data['isFavorite']

        db.session.commit()
        return {'data': part.to_dict()}
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous unit's own
version, with this unit's own new lines completing `update_part`:

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
129    @app.route('/api/parts/<part_id>', methods=['PUT'])
130    @token_required(allowed_roles=['programming', 'admin'])
131    def update_part(current_user, part_id):
132        part = Part.query.get(part_id)
133        if not part:
134            return {'error': 'Part not found'}, 404
135
136        data = request.get_json()
137        if not data:
138            return {'error': 'No data provided'}, 400
139
140        if 'isFavorite' in data:
141            part.is_favorite = data['isFavorite']
142
143        db.session.commit()
144        return {'data': part.to_dict()}
145
146    return app
147
148
149 def seed_admin_user():
150     if User.query.first():
151         return
152
153     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
154     admin.set_password('admin')
155     db.session.add(admin)
156     db.session.commit()
```

### Mechanical Walkthrough

- **Lines 140–141, `if 'isFavorite' in data: part.is_favorite =
  data['isFavorite']`** — a real, plain `dict` membership check —
  `'isFavorite' in data` — real and identical in shape to
  `parts_collection`'s own real `if field not in data:` checks already
  established, here testing for *presence* rather than *absence*; when
  real and true, assigns the real, incoming value directly onto the
  real, already-loaded `Part` instance's own real `is_favorite`
  column.
- **Line 143, `db.session.commit()`** — the identical real,
  already-established call this project's own login, registration, and
  deletion routes all already use.
- **Line 144, `return {'data': part.to_dict()}`** — a real, plain
  Python dict; `part.to_dict()` calls this project's own, already-
  proven method, returning every real field on this real part,
  including the real, just-changed `isFavorite` and every real field
  this unit never touched.

### CS Lens

This is the identical real **field-level granularity** this slice's
own testing lesson already named in full: this real route's own only
real, conditional assignment means a real caller sending
`{'isFavorite': true}` alone genuinely cannot accidentally overwrite
this real part's own `description` or `material` — there's no real
code path here that would even try.

Also recognized in: the identical real example this project's own
testing lesson already gave — a real document database's own real
`$set` operator, or any real API documented as supporting genuinely
partial updates.

### SE Lens

The real, deliberately *not*-taken alternative here: porting all five
of legacy's own real, independent field checks in this same lesson,
since legacy's own real route already has them. Rejected on purpose,
matching this project's own real, repeated reasoning — this slice's
own real, current, tested requirement is toggling `isFavorite` alone,
proven against a real, honest test; building real support for
`description`, `material`, `status`, and `model3dPath` now would be
real, speculative code ahead of any real, stated requirement this
project can actually verify. The real, honest cost accepted here: a
real client attempting to update a real part's own `description`
through this real route today would send a real request that silently
changes nothing at all about it — not an error, just a real, quiet
no-op — the identical real, accepted-gap discipline this project's own
listing route's own SE Lens already accepted for legacy's own
`status`/`search` filtering.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_update.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — this project's own real, seven-test file
already found two genuine surprises this session, so this was actually
run this session, not predicted:

```
test_part_update.py::test_update_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_update.py::test_update_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_update.py::test_update_part_with_unknown_id_returns_404 PASSED
test_part_update.py::test_toggling_favorite_on_changes_only_that_field PASSED
test_part_update.py::test_toggling_favorite_off_again_is_a_separate_real_request PASSED
test_part_update.py::test_update_part_with_an_empty_json_body_returns_400 PASSED
test_part_update.py::test_update_part_with_no_body_and_no_content_type_returns_415_not_400 PASSED

7 passed in ...s
```

All seven real cases now genuinely pass against `rebuild`. Every
earlier real test this project has ever written was also re-run
together, this session, confirming no real regression: this project's
own real, four-route backend suite (list, create, delete, update) —
twenty real assertions together — and this project's own real backend
`tests/` folder (`test_auth.py`, `test_authorization.py`) both pass,
unaffected.

### Connecting this unit to what came before

The previous unit taught `rebuild` a second real route could exist at
all. This unit is where it finally does something real once it's
reached — completing the real route this slice's own real
characterization already fully specified.

---

## Connect the pieces

One real request, `PUT /api/parts/<id>`, now has a real, complete,
independently-built answer in `rebuild`, sharing its own real URL with
an already-real, separate `DELETE` route: correctly rejecting an
unauthorized, nonexistent, or unusable request, and, on real success,
changing exactly the one real field this slice actually needed — the
identical real, observable behavior the previous lesson proved legacy
has, reached by a completely independent real implementation.

---

**Next lesson:** the frontend half of this same real slice — a real,
tested way for a real, signed-in user to actually toggle a real
favorite, the same real discipline this project's own deletion slice
already used.
