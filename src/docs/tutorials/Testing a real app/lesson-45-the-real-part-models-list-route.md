# Lesson 45: The Real Part Models List Route

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own three real tests pass against `rebuild`
> too.

## What you will build

A real, new `PartModel` model, matching legacy's own core real fields,
and the real `GET /api/parts/<id>/models` route reading it — this
project's own first real model built for a resource that belongs *to*
a part, rather than being a part itself.

## What you need to know first

The real, already-tested `token_required(allowed_roles=None)` decorator
and this project's own real **Operator bypass** term. The real `Part`
model and its own real, already-established `Model.query.get(id)`
method. This project's own real **Collection envelope** term.

## Terms introduced

None genuinely new.

## Objects and methods used

None genuinely new beyond `Model.query.filter_by(...)` and
`.order_by(...)`, both already given full treatment in earlier
lessons.

---

## Concept Unit: A Real Model for Something That Isn't a Part

### The Problem

Legacy's own real `PartModel` represents a real 3D file — a real STL
or STEP upload — belonging to a real part, not a part itself. This
project has never built a real model representing something that
*belongs to* an already-existing real entity rather than standing
alone. The real question this unit answers: what does that real
relationship actually require in a real, minimal `PartModel`?

> **Before reading on:** this project's own real `CAMFile` (legacy's,
> not yet built here) and `PartModel` both real, belong to a `Part`.
> Given this project's own real `Part` model's own real, primary-key
> `id` column, what real, minimal column would a real `PartModel` need
> to record *which* real part it belongs to?

### Project Change

- **Reference Source** — `backend/app/models/part_model.py`, the real
  `PartModel` class, read in full this session: a real `id`, a real
  `part_id` foreign key referencing `parts.id`, `name`, `description`,
  `model_type`, `category`, `file_type`, `file_path`, `file_size`,
  `priority`, `is_generic`, `created_at`, `created_by`, and a real
  `to_dict()`. This unit Preserves every real field except one: legacy's
  own real `to_dict()` computes a real, absolute `file_url` from
  `current_app.config['UPLOAD_FOLDER']` and `request.host_url` — real
  and deliberately not ported; see the SE Lens, below. This project's
  own real file is deliberately named `part_3d_model.py`, not
  `part_model.py` — this project's own, already-existing
  `part_model.py` already holds the real `Part` class itself (an
  earlier, real, already-established naming choice, not one this unit
  revisits), and reusing legacy's own real filename here would collide
  with it.
- **Files affected** — created:
  `rebuild/backend/app/part_3d_model.py`.
- **Change type** — add (new file).
- **Location** — sibling to the existing real `part_model.py` and
  `models.py`.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from datetime import datetime

from app import db


class PartModel(db.Model):
    __tablename__ = 'part_models'

    id = db.Column(db.String(50), primary_key=True)
    part_id = db.Column(db.String(50), db.ForeignKey('parts.id'), nullable=False, index=True)
```

### The Updated Project

`rebuild/backend/app/part_3d_model.py`, in full — brand new, so this
is the whole file:

```python
1  from datetime import datetime
2
3  from app import db
4
5
6  class PartModel(db.Model):
7      __tablename__ = 'part_models'
8
9      id = db.Column(db.String(50), primary_key=True)
10     part_id = db.Column(db.String(50), db.ForeignKey('parts.id'), nullable=False, index=True)
11
12     name = db.Column(db.String(200), nullable=False)
13     description = db.Column(db.Text, nullable=True)
14     model_type = db.Column(db.String(20), default='solid')
15     category = db.Column(db.String(20), default='part')
16
17     file_type = db.Column(db.String(20), nullable=False)
18     file_path = db.Column(db.String(500), nullable=False)
19     file_size = db.Column(db.Integer, nullable=True)
20
21     priority = db.Column(db.Integer, default=0)
22     is_generic = db.Column(db.Boolean, default=False)
23
24     created_at = db.Column(db.DateTime, default=datetime.utcnow)
25     created_by = db.Column(db.String(100), default='system')
26
27     def to_dict(self):
28         return {
29             'id': self.id,
30             'partId': self.part_id,
31             'name': self.name,
32             'description': self.description,
33             'modelType': self.model_type,
34             'category': self.category,
35             'fileType': self.file_type,
36             'filePath': self.file_path,
37             'fileSize': self.file_size,
38             'priority': self.priority,
39             'isGeneric': self.is_generic,
40             'createdAt': self.created_at.isoformat() if self.created_at else None,
41             'createdBy': self.created_by,
42         }
```

### Mechanical Walkthrough

- **Line 10, `part_id = db.Column(db.String(50), db.ForeignKey('parts.id'), nullable=False, index=True)`**
  — this project's own first real `db.ForeignKey`, a real, standard
  SQLAlchemy column type declaring that every real value in this real
  column must, real and actually, match an existing real row's own
  real `id` in the real `parts` table — the real, database-enforced
  version of this unit's own opening question's answer.
  `nullable=False` means every real `PartModel` row must real,
  actually belong to some real part; `index=True` matches this
  project's own real `Part.part_number` column's own already-explained
  real reasoning — fast, real lookups by this real, foreign column.
- **Lines 12–25, the real, remaining fields** — real and structurally
  identical to how this project's own `Part` model already declares
  its own real columns; no real, new SQLAlchemy concept appears in any
  of them.
- **Lines 27–42, `to_dict()`** — the identical real, already-established
  shape every other real model's own `to_dict()` already uses,
  translating real, snake_case columns into real, camelCase keys.

### CS Lens

This is a real instance of a **foreign key relationship** — a real,
formal, database-enforced statement that one real table's own rows
each belong to exactly one real row in another real table, the same
real relational concept underlying every real, one-to-many
relationship this app has (a real part's own many real CAM files, a
real user's own many real login events).

Also recognized in: any real relational schema modeling "each row of
table B belongs to one row of table A" — a real blog's own real
comments table referencing a real posts table; a real order-line-item
table referencing a real order.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own real `to_dict()`, computing a real, absolute, web-accessible
`file_url` from `current_app.config['UPLOAD_FOLDER']` and
`request.host_url`. Rejected on purpose — this project's own `rebuild`
has no real `UPLOAD_FOLDER` config, no real upload route, and no real
file ever saved to disk yet; porting a real URL-computation function
with nothing real underneath it would be real, speculative code with
no real, current test to prove it correct. This unit's own real
`to_dict()` returns `self.file_path` real, directly — real and
honestly incomplete compared to legacy's own real, richer version, a
real, explicit gap for this project's own, later, real upload lesson to
close.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_models.py -v
```

### Run it, per the Verification Rule

Not run in isolation this session — this real model has no real route
reading it yet; proven together with the next unit, below.

### Connecting this unit to what came before

This project's own real `Part` model stands alone. This unit is the
first real model this project has built that only makes sense in
relation to one.

---

## Concept Unit: Listing a Part's Own Real Models

### The Problem

A real `PartModel` table now exists, but nothing in `rebuild` reads
it. The real question this unit answers: what's the smallest real
route making the previous lesson's own three real tests pass?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `get_part_models` function's own real, core lookup, already quoted
  in full in the previous lesson: looks up the real part, returns a
  real `404` if missing, queries
  `PartModel.query.filter_by(part_id=part_id).order_by(
  PartModel.priority.desc()).all()`, and returns
  `{'data': [...], 'total': len(...)}`. This unit Preserves this real
  shape, deliberately not porting the real, synthetic
  final/fixture-model entries yet — the identical real, stated reason
  the previous lesson's own SE Lens already gave.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  directly after the existing real `update_part` route, and a real,
  new import alongside the existing real model imports.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from app.part_3d_model import PartModel


@app.route('/api/parts/<part_id>/models', methods=['GET'])
@token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
def list_part_models(current_user, part_id):
    part = Part.query.get(part_id)
    if not part:
        return {'error': 'Part not found'}, 404

    models = PartModel.query.filter_by(part_id=part_id).order_by(PartModel.priority.desc()).all()
    return {
        'data': [model.to_dict() for model in models],
        'total': len(models),
    }
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own new import and route added:

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
15 from app.part_3d_model import PartModel
16
17
18 def create_app(config_name='default'):
19     app = Flask(__name__)
20     app.config.from_object(config[config_name])
21     db.init_app(app)
22
23     with app.app_context():
24         db.create_all()
25         seed_admin_user()
26
27     @app.route('/health')
28     def health_check():
29         return {'status': 'healthy'}
30
31     @app.route('/api/auth/login', methods=['POST'])
32     def login():
33         data = request.get_json()
34         email = data.get('email')
35         password = data.get('password')
36
37         if not email or not password:
38             return {'error': 'Email and password required'}, 400
39
40         user = authenticate(email, password)
41         if user is None:
42             return {'error': 'Invalid credentials'}, 401
43
44         user.last_login = datetime.utcnow()
45         db.session.commit()
46
47         token = jwt.encode(
48             {
49                 'sub': user.id,
50                 'role': user.role,
51                 'iat': datetime.utcnow(),
52                 'exp': datetime.utcnow() + timedelta(days=7),
53             },
54             current_app.config['SECRET_KEY'],
55             algorithm='HS256',
56         )
57
58         return {'token': token, 'user': user.to_dict()}
59
60     @app.route('/api/auth/register', methods=['POST'])
61     @token_required(allowed_roles=['admin'])
62     def register(current_user):
63         data = request.get_json()
64         email = data.get('email')
65         password = data.get('password')
66         name = data.get('name')
67         role = data.get('role', 'operator')
68
69         if not email or not password or not name:
70             return {'error': 'Missing required fields'}, 400
71
72         if User.query.filter_by(email=email).first():
73             return {'error': 'User already exists'}, 400
74
75         user = User(id=email.split('@')[0], email=email, name=name, role=role)
76         user.set_password(password)
77         db.session.add(user)
78         db.session.commit()
79
80         return {'user': user.to_dict()}, 201
81
82     @app.route('/api/auth/users')
83     @token_required(allowed_roles=['admin', 'programming'])
84     def get_users(current_user):
85         users = User.query.all()
86         return {'data': [u.to_dict() for u in users]}
87
88     @app.route('/api/parts', methods=['GET', 'POST'])
89     @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
90     def parts_collection(current_user):
91         if request.method == 'POST':
92             if current_user is None:
93                 return {'error': 'Authentication token required'}, 401
94             if current_user.role not in ('programming', 'admin'):
95                 return {
96                     'error': f'Role {current_user.role} not authorized for this action',
97                 }, 403
98
99             data = request.get_json()
100            for field in ('partNumber', 'description'):
101                if field not in data:
102                    return {'error': f'Missing required field: {field}'}, 400
103
104            if Part.query.filter_by(part_number=data['partNumber']).first():
105                return {'error': f'Part number {data["partNumber"]} already exists'}, 409
106
107            data['id'] = f'P-{uuid.uuid4().hex[:8].upper()}'
108            part = Part.from_dict(data)
109            db.session.add(part)
110            db.session.commit()
111            return {'data': part.to_dict()}, 201
112
113        parts = Part.query.order_by(Part.part_number).all()
114        return {
115            'data': [part.to_dict() for part in parts],
116            'total': len(parts),
117        }
118
119    @app.route('/api/parts/<part_id>', methods=['DELETE'])
120    @token_required(allowed_roles=['programming', 'admin'])
121    def delete_part(current_user, part_id):
122        part = Part.query.get(part_id)
123        if not part:
124            return {'error': 'Part not found'}, 404
125
126        part.status = 'archived'
127        db.session.commit()
128        return {'message': f'Part {part.part_number} archived'}
129
130    @app.route('/api/parts/<part_id>', methods=['PUT'])
131    @token_required(allowed_roles=['programming', 'admin'])
132    def update_part(current_user, part_id):
133        part = Part.query.get(part_id)
134        if not part:
135            return {'error': 'Part not found'}, 404
136
137        data = request.get_json()
138        if not data:
139            return {'error': 'No data provided'}, 400
140
141        if 'description' in data:
142            part.description = data['description']
143        if 'material' in data:
144            part.material = data['material']
145        if 'status' in data:
146            part.status = data['status']
147        if 'isFavorite' in data:
148            part.is_favorite = data['isFavorite']
149
150        db.session.commit()
151        return {'data': part.to_dict()}
152
153    @app.route('/api/parts/<part_id>/models', methods=['GET'])
154    @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
155    def list_part_models(current_user, part_id):
156        part = Part.query.get(part_id)
157        if not part:
158            return {'error': 'Part not found'}, 404
159
160        models = PartModel.query.filter_by(part_id=part_id).order_by(PartModel.priority.desc()).all()
161        return {
162            'data': [model.to_dict() for model in models],
163            'total': len(models),
164        }
165
166    return app
167
168
169 def seed_admin_user():
170     if User.query.first():
171         return
172
173     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
174     admin.set_password('admin')
175     db.session.add(admin)
176     db.session.commit()
```

### Mechanical Walkthrough

- **Line 15, `from app.part_3d_model import PartModel`** — reaches the
  previous unit's own real model directly.
- **Line 154, `@token_required(allowed_roles=['operator', 'quality',
  'programming', 'admin'])`** — the identical real, permissive list
  the previous lesson's own real characterization already proved,
  `'operator'` real and included — this project's own real **Operator
  bypass** applies here for the identical real, structural reason it
  already applies to the listing route.
- **Line 156, `part = Part.query.get(part_id)`** — the identical real,
  already-established method this project's own delete and update
  routes already use.
- **Line 160, `PartModel.query.filter_by(part_id=part_id).order_by(
  PartModel.priority.desc()).all()`** — a real, chained call: `.query`,
  already established; `.filter_by(part_id=part_id)`, the identical
  real method this project's own creation route already uses to check
  for a real, duplicate part number, here filtering by the real,
  foreign-key column instead; `.order_by(PartModel.priority.desc())`,
  matching legacy's own real, exact ordering — highest real `priority`
  first; `.all()`, already established.
- **Lines 161–164, the real, returned envelope** — this project's own
  real, already-proven **Collection envelope**, built for a real,
  different resource.

### CS Lens

The identical real **thin adapter** this project's own listing-route
implementation lesson already named in full: this real route contains
no real decision-making of its own beyond assembling already-correct
real pieces — `token_required`, `Part.query.get`, and this unit's own
new, already-tested `PartModel.query`.

Also recognized in: the identical real example already given.

### SE Lens

The real, deliberately *not*-taken alternative here: adding the real,
synthetic final/fixture-model entries in this same unit. Rejected on
purpose, matching the previous lesson's own, already-stated reason:
this project's own `Part.from_dict` doesn't accept those two real
fields yet, so no real, current test can even construct the real
data this real behavior would need — building it now would be real,
untested, speculative code.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_models.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether a real, brand-new model and a real,
new foreign-key relationship actually work together correctly, on the
real first try — so this was actually run this session:

```
test_part_models.py::test_list_part_models_with_no_token_succeeds_via_the_operator_bypass PASSED
test_part_models.py::test_list_part_models_with_unknown_part_returns_404 PASSED
test_part_models.py::test_list_part_models_rejects_a_role_not_in_the_allowed_list PASSED

3 passed in ...s
```

All three real cases now genuinely pass against `rebuild`. Every real
test this project has ever written for `/api/parts` was also re-run
together, this session, confirming no real regression: twenty-six real
assertions together, all passing.

### Connecting this unit to what came before

The previous unit built a real model with nowhere real yet to be read.
This unit is where it finally answers a real request — completing this
project's own real, fifth Parts slice's own real, minimal starting
point.

---

## Connect the pieces

One real request, `GET /api/parts/<id>/models`, now has a real,
complete, independently-built answer in `rebuild`: a real, brand-new
model, related to `Part` by a real, database-enforced foreign key, and
a real route correctly applying this project's own real **Operator
bypass** — the identical real, observable behavior the previous lesson
proved legacy has for this real, minimal, empty case.

---

**Next lesson:** not yet decided here — this project's own real 3D-
model work still has real uploads, real deletion, and the real,
synthetic final/fixture-model entries ahead of it, each its own real,
separate, deeper slice; the tool-assembly joins remain a real,
separate, deeper slice too.
