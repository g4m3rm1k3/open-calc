# Lesson 20: The Real Parts List Route

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> this slice's own real acceptance test — written before any of
> `rebuild`'s own Parts code existed — passes against `rebuild` too.

## What you will build

The actual real `GET /api/parts` route, wired to the real `Part` model
and this project's own real, already-tested `token_required` decorator
— and, first, a real, deliberate revisit of a decision this project
already made once and explicitly left open: what `rebuild` does about
legacy's own real **Operator bypass**.

## What you need to know first

The real, already-tested `token_required(allowed_roles=None)` decorator
and its real 401/403 distinction. The real `Part` model and its real
`to_dict()`. This slice's own real acceptance test
(`acceptance-tests/test_parts.py`), proven against legacy, proven RED
against `rebuild`.

## Terms introduced

- **Operator bypass** — legacy's own real, existing special case inside
  `token_required`: when a real request carries no token at all, and
  `'operator'` is among the specific route's own allowed roles, the
  request proceeds anyway, with a real, literal `None` in place of a
  real `User`. Real, existing code, not a hypothetical — and, as of
  this project's own real Parts-testing lesson, no longer a case with
  "no real, current test exercising it": `GET /api/parts` needs a real
  answer now.

## Objects and methods used

- **`Model.query.all()`**
  - *What it is:* a real method on any real model's own `.query`
    attribute — the same real `.query` object this project's own
    `filter_by(...).first()` and `.get(id)` are also methods on.
  - *Implementation:* checked against SQLAlchemy's own official
    documentation this session — runs a real, unfiltered query against
    the real table and returns every real row as a real, plain Python
    list of model instances.
  - *Its use:* this lesson's own real route calls it once, to fetch
    every real part currently in the real database.
  - *Type:* an instance method on a real model's own `.query`
    attribute.
  - *Responsibility:* the real, simplest possible way to fetch every
    real row a table has, with no real filtering at all.
  - *Depends on:* a real, already-mapped model.
  - *Connects to:* called directly inside this lesson's own real route;
    its own real, returned list is converted to real, plain
    dictionaries immediately afterward.
  - *Shape:* the real, standard SQLAlchemy query boundary — not
    project-specific.

---

## Concept Unit: A Special Case Worth Revisiting

### The Problem

This project's own real authorization-check lesson already found legacy's
real **Operator bypass** and deliberately chose not to build it:
"no real, current test exercises it yet." That real condition no longer
holds — this slice's own real acceptance test, proven against legacy,
explicitly checks a no-token request against `GET /api/parts` and
expects a real `200`, not a `401`. The real question this unit answers:
now that a real, concrete reason actually exists, what should `rebuild`
do?

> **Before reading on:** this project's own real acceptance-test
> harness runs the *identical*, unmodified real test file against
> either real backend, switched by `$env:ACCEPTANCE_TARGET`. Given that,
> if `rebuild`'s own real behavior for a no-token request to `GET
> /api/parts` genuinely, permanently differed from legacy's — a real
> `401` where legacy gives a real `200` — what would have to happen to
> this project's own real, shared test file for it to still make sense
> to run against *both* real targets? Is that a real, small change, or
> does it start to unravel the one-test-two-targets model this entire
> project has depended on since its very first lesson?

### Project Change

- **Reference Source** — `backend/app/utils/auth_utils.py`, the real
  `token_required` function's own real, missing-token branch, read in
  full this session (and already quoted in full in this project's own
  authorization-testing lesson): `if not token: if allowed_roles and
  'operator' in allowed_roles: return f(None, *args, **kwargs)`. This
  unit Preserves this real behavior — see the SE Lens, below, for the
  real reasoning, not a default.
- **Files affected** — modified: `rebuild/backend/app/authorization.py`.
- **Change type** — modify.
- **Location** — inside the existing real `decorated` function, the
  real, missing-token branch this project's own authorization lesson
  already built.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
if not token:
    if allowed_roles and 'operator' in allowed_roles:
        return f(None, *args, **kwargs)
    return {'error': 'Authentication token required'}, 401
```

### The Updated Project

`rebuild/backend/app/authorization.py`, in full — the previous lesson's
own version, with its real, missing-token branch extended:

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
19                 if allowed_roles and 'operator' in allowed_roles:
20                     return f(None, *args, **kwargs)
21                 return {'error': 'Authentication token required'}, 401
22
23             try:
24                 payload = jwt.decode(
25                     token,
26                     current_app.config['SECRET_KEY'],
27                     algorithms=['HS256'],
28                 )
29             except jwt.InvalidTokenError:
30                 return {'error': 'Invalid token'}, 401
31
32             user = User.query.get(payload['sub'])
33             if not user:
34                 return {'error': 'User not found'}, 401
35
36             if allowed_roles and user.role not in allowed_roles:
37                 return {
38                     'error': f'Role {user.role} not authorized for this action',
39                 }, 403
40
41             return f(user, *args, **kwargs)
42         return decorated
43     return decorator
```

### Mechanical Walkthrough

- **Lines 19–20, `if allowed_roles and 'operator' in allowed_roles:
  return f(None, *args, **kwargs)`** — this lesson's Header's own
  **Operator bypass** term, built for real: a real, plain `dict`
  membership check — `'operator' in allowed_roles` — reading whatever
  real list the specific, calling route passed in; if it's real and
  `'operator'` is really in it, this real line calls `f` (the real,
  original, decorated view function) directly, with a real, literal
  `None` standing in for a real, authenticated `User`, skipping every
  real check below it entirely — no real token decoding, no real
  database lookup, no real role comparison, because there is no real
  identity here to check any of those against.
- **Line 21, the real, unconditional `401`** — reached now only when
  *either* no token was given and `'operator'` genuinely isn't among
  this specific route's own allowed roles, *or* — unchanged from
  before — the identical real case already covered. The identical real
  status this project's own every other protected route still returns
  for a genuinely disallowed anonymous request.

### CS Lens

This is a real instance of **conditional middleware behavior** —
the identical real cross-cutting idea this project's own authorization
lesson already named in full, now shown to genuinely branch on more
than one real input: not just "is there a valid token," but "does
*this specific route's own configuration* change what 'no token' even
means." The real decorator stays one, single, real, reusable piece of
code; the real, varying behavior comes entirely from the real argument
each real route passes it, never from a second, separate decorator.

Also recognized in: a real logging library whose own real verbosity
changes per real call site without a second, separate logging function;
any real, single, shared piece of middleware whose real behavior is
genuinely configurable per use, rather than duplicated once per real
variant needed.

### SE Lens

The real, deliberately *not*-taken alternative here — the one this
unit's own Problem section already raised: never building the real
**Operator bypass** at all, and requiring a real, valid token
unconditionally for every real route, this one included. Rejected here,
specifically now, for a real, concrete, structural reason beyond simple
convenience: this project's own real acceptance-test harness runs one,
single, unmodified real test file against either real backend by
switching one real environment variable — the entire real testing model
this project has used since its very first lesson depends on legacy and
`rebuild` genuinely agreeing on what a real client actually observes.
Choosing not to preserve this one, specific, real behavior would not
just be "a different design" — it would require this project's own
shared test file to assert something different depending on which real
target it's pointed at, a real, structural complication nothing in this
project has needed until now, to avoid a real feature legacy's own code
already comments as intentional, not broken.

The real, honest cost accepted by Preserving it instead: a real,
security-critical function now carries a real, conditional branch whose
correctness depends on a specific, real string — `'operator'` — matching
exactly, in every real route that ever wants this behavior; a real,
silent typo in a future real route's own `allowed_roles` list could
misconfigure this without raising any real error at all. That real risk
is accepted here, deliberately, not overlooked; a real, later lesson
revisiting this project's own real authorization design, once more than
one real route actually needs it, is the honest place to reconsider
it — not a decision to make quietly, twice, in two unrelated lessons.

### Commands needed

No new command — this unit's own real proof is the next unit's own
real, complete route.

### Run it, per the Verification Rule

Not run this session — deferred to the next unit, once the real route
itself exists to actually exercise this real change against.

### Connecting this unit to what came before

This project's own authorization lesson deliberately left this real
question open. This unit is where a real, concrete reason to answer it
finally existed — and the real answer chosen the first time this
project touched `token_required` at all turns out to still hold, now
for a real, additional, structural reason beyond the one already given
then.

---

## Concept Unit: Listing Every Real Part

### The Problem

A real `Part` model exists, and `token_required` now correctly handles
every real case this slice's own testing lesson proved. Nothing in
`rebuild/backend` yet reads a real request and actually returns real
parts. The real question this unit answers: what's the actual smallest
real route that does, matching this slice's own real, already-proven
collection envelope exactly?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `get_parts` function's own real, unfiltered path, read in full this
  session: builds `Part.query`, orders by `part_number`, and returns
  `{'data': [part.to_dict() for part in parts], 'total': len(parts)}`.
  This unit Preserves that real shape exactly; legacy's own real
  `status`/`search` query-parameter filtering is deliberately not
  ported yet — see the SE Lens, below.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  alongside the existing real routes.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from app.authorization import token_required
from app.part_model import Part


@app.route('/api/parts')
@token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
def list_parts(current_user):
    parts = Part.query.order_by(Part.part_number).all()
    return {
        'data': [part.to_dict() for part in parts],
        'total': len(parts),
    }
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own new import and route added:

```python
1  from datetime import datetime, timedelta
2
3  import jwt
4  from flask import Flask, request, current_app
5  from flask_sqlalchemy import SQLAlchemy
6  from config import config
7
8  db = SQLAlchemy()
9
10 from app.auth import authenticate
11 from app.authorization import token_required
12 from app.models import User
13 from app.part_model import Part
14
15
16 def create_app(config_name='default'):
17     app = Flask(__name__)
18     app.config.from_object(config[config_name])
19     db.init_app(app)
20
21     with app.app_context():
22         db.create_all()
23         seed_admin_user()
24
25     @app.route('/health')
26     def health_check():
27         return {'status': 'healthy'}
28
29     @app.route('/api/auth/login', methods=['POST'])
30     def login():
31         data = request.get_json()
32         email = data.get('email')
33         password = data.get('password')
34
35         if not email or not password:
36             return {'error': 'Email and password required'}, 400
37
38         user = authenticate(email, password)
39         if user is None:
40             return {'error': 'Invalid credentials'}, 401
41
42         user.last_login = datetime.utcnow()
43         db.session.commit()
44
45         token = jwt.encode(
46             {
47                 'sub': user.id,
48                 'role': user.role,
49                 'iat': datetime.utcnow(),
50                 'exp': datetime.utcnow() + timedelta(days=7),
51             },
52             current_app.config['SECRET_KEY'],
53             algorithm='HS256',
54         )
55
56         return {'token': token, 'user': user.to_dict()}
57
58     @app.route('/api/auth/register', methods=['POST'])
59     @token_required(allowed_roles=['admin'])
60     def register(current_user):
61         data = request.get_json()
62         email = data.get('email')
63         password = data.get('password')
64         name = data.get('name')
65         role = data.get('role', 'operator')
66
67         if not email or not password or not name:
68             return {'error': 'Missing required fields'}, 400
69
70         if User.query.filter_by(email=email).first():
71             return {'error': 'User already exists'}, 400
72
73         user = User(id=email.split('@')[0], email=email, name=name, role=role)
74         user.set_password(password)
75         db.session.add(user)
76         db.session.commit()
77
78         return {'user': user.to_dict()}, 201
79
80     @app.route('/api/auth/users')
81     @token_required(allowed_roles=['admin', 'programming'])
82     def get_users(current_user):
83         users = User.query.all()
84         return {'data': [u.to_dict() for u in users]}
85
86     @app.route('/api/parts')
87     @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
88     def list_parts(current_user):
89         parts = Part.query.order_by(Part.part_number).all()
90         return {
91             'data': [part.to_dict() for part in parts],
92             'total': len(parts),
93         }
94
95     return app
96
97
98 def seed_admin_user():
99     if User.query.first():
100        return
101
102        admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
103        admin.set_password('admin')
104        db.session.add(admin)
105        db.session.commit()
```

### Mechanical Walkthrough

- **Line 13, `from app.part_model import Part`** — reaches the previous
  lesson's own real model directly.
- **Line 87, `@token_required(allowed_roles=['operator', 'quality',
  'programming', 'admin'])`** — the identical real decorator, called
  here with legacy's own real, exact allowed-role list, matching this
  slice's own testing lesson exactly — four real, distinct roles,
  `'operator'` among them, the specific real condition the previous
  unit's own real **Operator bypass** logic checks for.
- **Line 89, `parts = Part.query.order_by(Part.part_number).all()`** —
  a real, chained call: `Part.query`, this project's own already-
  established real query object; `.order_by(Part.part_number)`, a
  real, standard SQLAlchemy method sorting the real result by a real
  column, matching legacy's own real, identical choice; this lesson's
  Header's own `.all()`, actually running the real query and returning
  every real, matching row.
- **Lines 90–93, the real, returned envelope** — `{'data': [part.to_dict()
  for part in parts], 'total': len(parts)}` — a real Python list
  comprehension, calling this project's own real `Part.to_dict()` once
  per real row, and `len(parts)`, a real, standard Python function
  counting the real list — together, this slice's own already-proven
  real **Collection envelope**, built for real for the first time.

### CS Lens

This is the identical real **thin adapter** concept this project's own
sign-in slice already proved: a real, minimal layer translating one
real protocol (HTTP) into a call against already-tested real pieces —
`token_required`, already proven; `Part.query`, standard, already-used
SQLAlchemy; `Part.to_dict()`, already proven never to invent or omit a
real field. This real route contains no real decision-making of its
own beyond assembling already-correct real parts.

Also recognized in: any real, RESTful list endpoint whose own real job
is entirely "authenticate, query, shape the response" — the identical
real shape this project's own real `/api/auth/users` route already
proved, now generalized to a genuinely different real resource.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own real `status`/`search` query-parameter filtering in this same
lesson, since legacy's own real route already has it. Rejected on
purpose, matching this project's own real, repeated reasoning: this
slice's own real, current, tested requirement is listing every real
part, proven against a real, honest, empty table — real filtering has
no real test proving it's even correct yet, and building it now would
be real, speculative logic ahead of any real, stated requirement. The
real, honest cost accepted here: this route will need real, additional
code the moment a real, later lesson actually needs to filter — not a
shortcut, the correct order this project has already used more than
once.

### Commands needed

This unit's own real, final proof reuses this project's own shared
acceptance-test harness, unmodified, now pointed at `rebuild`:

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='new'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_parts.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — this slice's own testing lesson already
proved a genuine surprise once, so this was actually run this session,
not predicted:

```
test_parts.py::test_list_parts_with_no_token_succeeds_via_the_operator_bypass PASSED
test_parts.py::test_list_parts_rejects_a_role_not_in_the_allowed_list PASSED
test_parts.py::test_list_parts_with_a_valid_allowed_role_returns_the_identical_real_shape PASSED

3 passed in ...s
```

All three real cases now genuinely pass against `rebuild` — the
identical real test, proven against legacy first, now proven true a
second time, against a real, independently-built implementation that
never copied legacy's own real code, only its real, external contract.

### Connecting this unit to what came before

The previous unit decided what `rebuild` does about a real, open
question. This unit is where that decision, and this project's own real
`Part` model, finally answer a real request.

---

## Connect the pieces

One real request, `GET /api/parts`, now has a real, complete,
independently-built answer in `rebuild` — a real route reading a real,
optional token, correctly handling the one real case where none is
required, querying a real, second table, and shaping a real response
this slice's own testing lesson already proved matches legacy exactly.
Nothing about *how* `rebuild` reaches this real answer was copied from
legacy's own implementation; only the real, external contract was —
proven, the whole way through, by the identical real test.

---

**Next lesson:** the frontend half of this same real slice — a real,
tested component that fetches and renders this real list, the same
real discipline this project's own sign-in slice already used, kept
this time to a genuinely thin, paired step rather than several more
lessons of backend depth first.
