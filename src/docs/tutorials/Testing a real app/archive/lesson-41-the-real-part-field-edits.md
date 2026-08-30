# Lesson 41: The Real Part Field Edits

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own three real tests pass against `rebuild`
> too, completing this project's own real Update slice's backend half.

## What you will build

The three real, remaining lines `update_part` needs — matching
`isFavorite`'s own already-real shape exactly, for `description`,
`material`, and `status`.

## What you need to know first

The real, already-proven `update_part` route and its own real
`isFavorite` field check. This slice's own real, already-proven
`description`/`material`/`status` characterization.

## Terms introduced

None genuinely new.

## Objects and methods used

None genuinely new — this unit reuses the identical real `dict`
membership check (`'FIELD' in data`) and real attribute assignment
already given full treatment in the favorite-toggle implementation
lesson.

---

## Concept Unit: Three More Real, Independent Checks

### The Problem

`update_part` already changes `isFavorite` in real isolation. The
previous lesson's own three real tests need three more real fields
handled the identical real way. The real question this unit answers:
does adding them require anything genuinely new, or only more of what
`isFavorite` already proved?

### Project Change

- **Reference Source** — the identical real `update_part` function
  already quoted in full in the favorite-toggle implementation lesson
  — its own real, remaining sibling checks: `if 'description' in
  data: part.description = data['description']`, `if 'material' in
  data: part.material = data['material']`, `if 'status' in data:
  part.status = data['status']`. This unit Preserves all three exactly,
  including legacy's own real, missing `status` validation the
  previous lesson already characterized and explicitly chose not to
  add.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `update_part` function,
  directly before its own existing real `isFavorite` check.
- **Dependencies** — none beyond what the favorite-toggle lesson
  already installed.

### The New Code

```python
        if 'description' in data:
            part.description = data['description']
        if 'material' in data:
            part.material = data['material']
        if 'status' in data:
            part.status = data['status']
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own three new lines added:

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
140        if 'description' in data:
141            part.description = data['description']
142        if 'material' in data:
143            part.material = data['material']
144        if 'status' in data:
145            part.status = data['status']
146        if 'isFavorite' in data:
147            part.is_favorite = data['isFavorite']
148
149        db.session.commit()
150        return {'data': part.to_dict()}
151
152    return app
153
154
155 def seed_admin_user():
156     if User.query.first():
157         return
158
159     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
160     admin.set_password('admin')
161     db.session.add(admin)
162     db.session.commit()
```

### Mechanical Walkthrough

- **Lines 140–145, three real, independent checks** — each a real,
  plain `dict` membership test followed by a real attribute
  assignment, real and structurally identical to line 146–147's own
  already-proven `isFavorite` check — no real, new syntax, no real,
  new method, only more of an already-proven shape.
- **Real, deliberate ordering** — these three real lines sit *before*
  `isFavorite`, matching legacy's own real, exact field order, quoted
  in full in the favorite-toggle lesson — real and inconsequential to
  behavior (each real check is fully independent), but kept identical
  for a real reader comparing the two real functions side by side.

### CS Lens

The identical real **field-level granularity** this slice has already
named twice, now real and complete across every real field this
project's own Update slice actually needs.

Also recognized in: the identical real examples already given.

### SE Lens

The real, deliberately *not*-taken alternative here: adding a real,
server-side `status` validation this unit's own real code doesn't
have, since this unit clearly knows the real, gap exists. Rejected on
purpose — the previous lesson already labeled this a real, honest,
Preserved gap, not a bug; adding real validation `rebuild` never had a
real, stated requirement for, purely because it's convenient to add
while already touching this real function, would be exactly the kind
of real, speculative scope creep this project has consistently
avoided.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_update.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — confirming three real, independent checks
work together correctly, and cause no real regression in this
project's own already-real `isFavorite` behavior — so this was
actually run this session:

```
test_part_update.py::test_update_part_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_update.py::test_update_part_rejects_a_role_not_in_the_allowed_list PASSED
test_part_update.py::test_update_part_with_unknown_id_returns_404 PASSED
test_part_update.py::test_toggling_favorite_on_changes_only_that_field PASSED
test_part_update.py::test_toggling_favorite_off_again_is_a_separate_real_request PASSED
test_part_update.py::test_update_part_with_an_empty_json_body_returns_400 PASSED
test_part_update.py::test_update_part_with_no_body_and_no_content_type_returns_415_not_400 PASSED
test_part_update.py::test_update_part_changes_description_material_and_status_together PASSED
test_part_update.py::test_update_part_accepts_any_status_string_with_no_real_validation PASSED
test_part_update.py::test_update_part_changing_only_material_leaves_status_and_description_alone PASSED

10 passed in ...s
```

Every real test this project has ever written for `/api/parts` was
also re-run together, this session, confirming no real regression:
this project's own real, four-route backend suite — list, create,
delete, and update, all four — twenty-three real assertions together,
all passing.

### Connecting this unit to what came before

The previous lesson proved three more real fields' own real contract.
This unit makes it true — closing this project's own real Update
slice's backend half.

---

## Connect the pieces

`update_part` now handles every real field this project's own Update
slice needs: `description`, `material`, `status`, and `isFavorite`,
each real, independent, matching legacy's own real, exact behavior —
including its one real, honest, Preserved gap.

---

**Next lesson:** the frontend half of this same real slice — a real,
tested way for a real, signed-in user to actually edit a real part's
own description and material, the same real discipline this project's
own favorite-toggle slice already used.
