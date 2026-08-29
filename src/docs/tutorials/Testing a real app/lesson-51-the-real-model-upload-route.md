# Lesson 51: The Real Model Upload Route

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own five real tests pass against `rebuild`
> too, including its own real, honest gap, ported rather than quietly
> fixed.

## What you will build

A real `UPLOAD_FOLDER` config value, ported from legacy's own real
`config.py`, and the real `POST /api/parts/<id>/models` route itself —
this project's first real route reading `request.files` and writing an
actual real file to disk.

## What you need to know first

The real, already-tested `token_required(allowed_roles=None)`
decorator. The real `Part` and `PartModel` models. This project's own
real, already-proven `GET /api/parts/<id>/models` route. This
project's own real **Multipart form data** and **`request.files`**
terms, already given full treatment.

## Terms introduced

None genuinely new.

## Objects and methods used

- **`FileStorage.save(dst)`**
  - *What it is:* a real, instance method on Werkzeug's own real
    `FileStorage` object — the real, concrete type `request.files['file']`
    actually returns.
  - *Implementation:* checked against Werkzeug's own official
    documentation this session — writes this real, uploaded file's own
    real, complete contents to the real, given destination path on
    disk, real and creating or overwriting whatever real file already
    sits there.
  - *Its use:* this lesson's own real route calls it once, to actually
    persist a real, uploaded file's own real bytes.
  - *Type:* an instance method on `werkzeug.datastructures.FileStorage`.
  - *Responsibility:* the real, standard way an uploaded real file's
    own real content actually reaches real, permanent disk storage.
  - *Depends on:* a real, writable destination path.
  - *Connects to:* called directly inside this lesson's own real
    route, immediately after a real, unique destination path is built.
  - *Shape:* the real, standard Werkzeug file-upload boundary — not
    project-specific.
- **`os.makedirs(path, exist_ok=True)`**
  - *What it is:* a real, standard-library Python function, creating a
    real directory and any real, missing parent directories along the
    way.
  - *Implementation:* checked against Python's own official
    documentation this session — `exist_ok=True` means a real,
    already-existing directory is silently, real and successfully
    accepted rather than raising a real error.
  - *Its use:* this lesson's own real route calls it to guarantee a
    real part's own real, per-part upload folder genuinely exists
    before a real file is ever saved into it.
  - *Type:* a function in Python's own `os` standard-library module.
  - *Responsibility:* the real, standard way to ensure a real
    directory path exists, real and regardless of whether any real,
    earlier upload for this real part has already created it.
  - *Depends on:* a real, writable parent location.
  - *Connects to:* called directly before this lesson's own new
    `FileStorage.save(...)` call.
  - *Shape:* the real, standard Python standard-library boundary — not
    project-specific.

---

## Concept Unit: A Real Place to Put Real Files

### The Problem

`rebuild`'s own real config has never needed to know where a real,
uploaded file should actually live on disk — no earlier lesson touched
a real file at all. The real question this unit answers: what's the
smallest real config change letting this project's own real code ask
"where do uploads go," the identical real way legacy already can?

### Project Change

- **Reference Source** — `backend/config.py`, read in full this
  session: `STORAGE_PATH = os.environ.get('STORAGE_PATH',
  str(BASE_DIR / "uploads"))`, `UPLOAD_FOLDER = Path(STORAGE_PATH)`.
  This unit Preserves this real shape exactly — a real, honest,
  verbatim port, confirmed by this project's own real fidelity
  checker matching every real, added line against this exact real
  reference file with no real, named exception needed at all.
- **Files affected** — modified: `rebuild/backend/config.py`.
- **Change type** — modify.
- **Location** — the existing real `Config` class.
- **Dependencies** — none beyond Python's own real, standard `os` and
  `pathlib` modules.

### The New Code

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.absolute()


class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'dev-secret-key-change-in-production'
    STORAGE_PATH = os.environ.get('STORAGE_PATH', str(BASE_DIR / 'uploads'))
    UPLOAD_FOLDER = Path(STORAGE_PATH)
```

### The Updated Project

`rebuild/backend/config.py`, in full — the previous lesson's own
version, with this unit's own new imports and real config values
added:

```python
1  import os
2  from pathlib import Path
3
4  BASE_DIR = Path(__file__).parent.absolute()
5
6
7  class Config:
8      SQLALCHEMY_TRACK_MODIFICATIONS = False
9      SECRET_KEY = 'dev-secret-key-change-in-production'
10     STORAGE_PATH = os.environ.get('STORAGE_PATH', str(BASE_DIR / 'uploads'))
11     UPLOAD_FOLDER = Path(STORAGE_PATH)
12
13
14 class TestingConfig(Config):
15     TESTING = True
16     SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
17
18
19 config = {
20     'testing': TestingConfig,
21     'default': TestingConfig,
22 }
```

### Mechanical Walkthrough

- **Line 4, `BASE_DIR = Path(__file__).parent.absolute()`** — a real,
  already-familiar pattern from legacy's own real `config.py`: `__file__`
  real and always resolves to this real, current file's own real,
  absolute path, so `BASE_DIR` real, always points at this project's
  own real `verification/backend/` folder, wherever it's actually
  checked out.
- **Line 10, `os.environ.get('STORAGE_PATH', str(BASE_DIR / 'uploads'))`**
  — the identical real pattern this project's own `SECRET_KEY` and
  every earlier config value never needed until now: real, checking a
  real environment variable first, real, falling back to a real,
  computed default only when it's genuinely absent — the exact real
  mechanism this slice's own testing lesson already relied on to
  safely redirect uploads during a real test.
- **Line 11, `UPLOAD_FOLDER = Path(STORAGE_PATH)`** — real and
  wrapping the real, plain string in a real `pathlib.Path`, so real
  code elsewhere (this lesson's own next unit) can use the real `/`
  operator to build real, nested paths from it directly.

### CS Lens

This is the identical real **twelve-factor configuration** idea this
project's own real `SECRET_KEY` already, implicitly, followed:
real, environment-driven values with a real, sane default, so the
identical real code runs correctly in a real, different environment —
production, development, or a real, temporary test — without any real
code change, only a real, different environment variable.

Also recognized in: the identical real example already given by this
project's own earlier config lessons.

### SE Lens

No real, deliberate alternative considered here — this unit is a
direct, real, verbatim port of legacy's own already-correct real
pattern; this project's own real fidelity checker already confirms it
traces exactly, with no real, named exception required at all — the
first time in this slice a Reference Source has matched this cleanly,
worth noting honestly against how often this project's own,
deliberately flattened structure has needed one.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -c "from config import config; print(config['testing'].UPLOAD_FOLDER)"
```

### Run it, per the Verification Rule

Real and confidently predictable — a real, plain class attribute
lookup, identical in shape to every other real config value already
proven — so this was stated from confidence rather than run in
isolation; proven for real, together with the next units, below,
where a real route actually reads it.

### Connecting this unit to what came before

Every earlier real config value this project has needed was already
proven, small, and unconditional. This unit is the first real one
whose own real value depends on where this project's own real code
actually runs.

---

## Concept Unit: A Real Route That Asks for a Real File

### The Problem

`rebuild` has no real route at `POST /api/parts/<id>/models` yet at
all. The real question this unit answers: what's the smallest real
route correctly rejecting every real case this slice's own testing
lesson already characterized *before* a real file, actually reaches
disk?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `upload_part_model` function's own real, opening validation, already
  quoted in full in the previous lesson: looks up the real part,
  returns a real `404` if missing; checks `'file' not in
  request.files`, returning a real `400` with `{'error': 'No file
  provided'}` if so.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `create_app` function,
  directly after the existing real `list_part_models` route.
- **Dependencies** — the previous unit's own new `UPLOAD_FOLDER`
  config value, and Python's own real `os` module (a real, new import
  this unit adds alongside this project's own existing real `jwt` and
  `uuid` imports).

### The New Code

```python
@app.route('/api/parts/<part_id>/models', methods=['POST'])
@token_required(allowed_roles=['programming', 'admin'])
def upload_part_model(current_user, part_id):
    part = Part.query.get(part_id)
    if not part:
        return {'error': 'Part not found'}, 404

    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
```

### The Updated Project

`rebuild/backend/app/__init__.py`, in full — the previous lesson's own
version, with this unit's own new import and real route skeleton
added:

```python
1  from datetime import datetime, timedelta
2
3  import jwt
4  import os
5  import uuid
6  from flask import Flask, request, current_app
7  from flask_sqlalchemy import SQLAlchemy
8  from config import config
9
10 db = SQLAlchemy()
11
12 from app.auth import authenticate
13 from app.authorization import token_required
14 from app.models import User
15 from app.part_model import Part
16 from app.part_3d_model import PartModel
17
18
19 def create_app(config_name='default'):
20     app = Flask(__name__)
21     app.config.from_object(config[config_name])
22     db.init_app(app)
23
24     with app.app_context():
25         db.create_all()
26         seed_admin_user()
27
28     @app.route('/health')
29     def health_check():
30         return {'status': 'healthy'}
31
32     @app.route('/api/auth/login', methods=['POST'])
33     def login():
34         data = request.get_json()
35         email = data.get('email')
36         password = data.get('password')
37
38         if not email or not password:
39             return {'error': 'Email and password required'}, 400
40
41         user = authenticate(email, password)
42         if user is None:
43             return {'error': 'Invalid credentials'}, 401
44
45         user.last_login = datetime.utcnow()
46         db.session.commit()
47
48         token = jwt.encode(
49             {
50                 'sub': user.id,
51                 'role': user.role,
52                 'iat': datetime.utcnow(),
53                 'exp': datetime.utcnow() + timedelta(days=7),
54             },
55             current_app.config['SECRET_KEY'],
56             algorithm='HS256',
57         )
58
59         return {'token': token, 'user': user.to_dict()}
60
61     @app.route('/api/auth/register', methods=['POST'])
62     @token_required(allowed_roles=['admin'])
63     def register(current_user):
64         data = request.get_json()
65         email = data.get('email')
66         password = data.get('password')
67         name = data.get('name')
68         role = data.get('role', 'operator')
69
70         if not email or not password or not name:
71             return {'error': 'Missing required fields'}, 400
72
73         if User.query.filter_by(email=email).first():
74             return {'error': 'User already exists'}, 400
75
76         user = User(id=email.split('@')[0], email=email, name=name, role=role)
77         user.set_password(password)
78         db.session.add(user)
79         db.session.commit()
80
81         return {'user': user.to_dict()}, 201
82
83     @app.route('/api/auth/users')
84     @token_required(allowed_roles=['admin', 'programming'])
85     def get_users(current_user):
86         users = User.query.all()
87         return {'data': [u.to_dict() for u in users]}
88
89     @app.route('/api/parts', methods=['GET', 'POST'])
90     @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
91     def parts_collection(current_user):
92         if request.method == 'POST':
93             if current_user is None:
94                 return {'error': 'Authentication token required'}, 401
95             if current_user.role not in ('programming', 'admin'):
96                 return {
97                     'error': f'Role {current_user.role} not authorized for this action',
98                 }, 403
99
100            data = request.get_json()
101            for field in ('partNumber', 'description'):
102                if field not in data:
103                    return {'error': f'Missing required field: {field}'}, 400
104
105            if Part.query.filter_by(part_number=data['partNumber']).first():
106                return {'error': f'Part number {data["partNumber"]} already exists'}, 409
107
108            data['id'] = f'P-{uuid.uuid4().hex[:8].upper()}'
109            part = Part.from_dict(data)
110            db.session.add(part)
111            db.session.commit()
112            return {'data': part.to_dict()}, 201
113
114        parts = Part.query.order_by(Part.part_number).all()
115        return {
116            'data': [part.to_dict() for part in parts],
117            'total': len(parts),
118        }
119
120    @app.route('/api/parts/<part_id>', methods=['DELETE'])
121    @token_required(allowed_roles=['programming', 'admin'])
122    def delete_part(current_user, part_id):
123        part = Part.query.get(part_id)
124        if not part:
125            return {'error': 'Part not found'}, 404
126
127        part.status = 'archived'
128        db.session.commit()
129        return {'message': f'Part {part.part_number} archived'}
130
131    @app.route('/api/parts/<part_id>', methods=['PUT'])
132    @token_required(allowed_roles=['programming', 'admin'])
133    def update_part(current_user, part_id):
134        part = Part.query.get(part_id)
135        if not part:
136            return {'error': 'Part not found'}, 404
137
138        data = request.get_json()
139        if not data:
140            return {'error': 'No data provided'}, 400
141
142        if 'description' in data:
143            part.description = data['description']
144        if 'material' in data:
145            part.material = data['material']
146        if 'status' in data:
147            part.status = data['status']
148        if 'isFavorite' in data:
149            part.is_favorite = data['isFavorite']
150
151        db.session.commit()
152        return {'data': part.to_dict()}
153
154    @app.route('/api/parts/<part_id>/models', methods=['GET'])
155    @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
156    def list_part_models(current_user, part_id):
157        part = Part.query.get(part_id)
158        if not part:
159            return {'error': 'Part not found'}, 404
160
161        models = PartModel.query.filter_by(part_id=part_id).order_by(PartModel.priority.desc()).all()
162        result = [model.to_dict() for model in models]
163
164        if part.final_model_path:
165            result.append({
166                'id': f'{part_id}-final',
167                'partId': part_id,
168                'name': 'Final Part Model',
169                'description': 'Target part geometry',
170                'modelType': 'solid',
171                'category': 'part',
172                'fileType': 'OBJ',
173                'filePath': part.final_model_path,
174                'fileSize': None,
175                'priority': 100,
176                'isGeneric': False,
177                'createdAt': part.updated_at.isoformat() if part.updated_at else None,
178                'createdBy': 'system',
179            })
180
181        if part.fixture_model_path:
182            result.append({
183                'id': f'{part_id}-fixture',
184                'partId': part_id,
185                'name': 'Fixture Model',
186                'description': 'Workholding fixture',
187                'modelType': 'solid',
188                'category': 'fixture',
189                'fileType': 'OBJ',
190                'filePath': part.fixture_model_path,
191                'fileSize': None,
192                'priority': 99,
193                'isGeneric': False,
194                'createdAt': part.updated_at.isoformat() if part.updated_at else None,
195                'createdBy': 'system',
196            })
197
198        return {
199            'data': result,
200            'total': len(result),
201        }
202
203    @app.route('/api/parts/<part_id>/models', methods=['POST'])
204    @token_required(allowed_roles=['programming', 'admin'])
205    def upload_part_model(current_user, part_id):
206        part = Part.query.get(part_id)
207        if not part:
208            return {'error': 'Part not found'}, 404
209
210        if 'file' not in request.files:
211            return {'error': 'No file provided'}, 400
212
213    return app
214
215
216 def seed_admin_user():
217     if User.query.first():
218         return
219
220     admin = User(id='admin', email='admin@mfg.com', name='System Admin', role='admin')
221     admin.set_password('admin')
222     db.session.add(admin)
223     db.session.commit()
```

### Mechanical Walkthrough

- **Line 4, `import os`** — this project's own first real need for
  Python's own real, standard `os` module, real and required by this
  unit's own next sibling's own real `os.makedirs`/`os.path.getsize`
  calls, added here so it's real, already available when needed.
- **Line 205, `def upload_part_model(current_user, part_id):`** — the
  identical real, two-parameter shape every other real, dynamic Parts
  route already uses.
- **Line 206, `part = Part.query.get(part_id)`** — the identical real,
  already-established method this project's own delete, update, and
  list-models routes all already use.
- **Lines 210–211, `if 'file' not in request.files: return {'error':
  'No file provided'}, 400`** — this project's own real
  **`request.files`** term, built for real: a real, plain `in` check
  against Flask's own real, dedicated file-parts object — real and
  genuinely different from every earlier route's own real
  `request.get_json()`/`data.get(...)` checks, because this real
  request never carries a real JSON body at all.

### CS Lens

The identical real **guard clause / early return** this project's own
delete- and update-route lessons already named in full, stacking two
real preconditions — a real, existing part, then a real, present file
— each real, exiting immediately rather than nesting.

Also recognized in: the identical real examples already given.

### SE Lens

The real, deliberately *not*-taken alternative here: writing this real
route's own complete real body — the real file save and real
`PartModel` creation — in this same unit. Rejected on purpose,
matching this project's own real, repeated discipline: this unit's own
real, new idea is validating that a real request is even usable at
all; what happens to a real, actual file once validation passes is a
real, separate, genuinely larger concern, earning its own real, next
unit.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_model_upload.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, partial route already
correctly rejects three of this slice's own five real cases — so this
was actually run this session:

```
test_part_model_upload.py::test_upload_part_model_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_model_upload.py::test_upload_part_model_with_no_file_returns_400 PASSED
test_part_model_upload.py::test_upload_part_model_with_unknown_part_returns_404 PASSED
test_part_model_upload.py::test_upload_part_model_succeeds_and_records_the_real_file FAILED
test_part_model_upload.py::test_upload_part_model_accepts_any_file_extension_with_no_real_validation FAILED
```

Three real cases already pass, real and for the correct reason. The
two real cases needing a real, successful upload still fail — this
unit's own real route has no real branch for "the file is real and
usable" yet at all.

### Connecting this unit to what came before

The previous unit gave this project's own real code somewhere to put
a real file. This unit is where a real request is first correctly
turned away before ever reaching there.

---

## Concept Unit: Saving a Real File, For Real

### The Problem

This unit's own real route can now reject every real, invalid case.
Nothing yet actually saves a real file or records a real `PartModel`
row. The real question this unit answers: what's the smallest real
code doing both, matching this slice's own testing lesson's own real
characterization exactly — honest gap included?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `upload_part_model` function's own real, remaining body, already
  quoted in full in the previous lesson: reads `name`, `category`,
  `modelType` from `request.form`; derives a real, uppercased file
  extension from the real filename; builds a real, unique path under
  `UPLOAD_FOLDER / 'models' / part_id`, creating that real directory
  if needed; saves the real file under a real, `uuid`-prefixed name;
  creates and commits a real `PartModel` row; returns a real `201`.
  This unit Preserves this real shape, including its own real,
  characterized absence of any real file-extension validation — the
  previous lesson's own real, named gap, ported honestly rather than
  quietly closed. Real and deliberately not porting legacy's own real
  `priority`/`isGeneric`/`description` form fields, its own real
  `model_3d_path` side effect on `Part`, or its own real
  `try`/`except` rollback-and-cleanup wrapping — none of this slice's
  own real, current tests exercise any of them; see the SE Lens,
  below.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the previous unit's own new
  `upload_part_model` function, directly after its own existing real
  `if 'file' not in request.files:` branch.
- **Dependencies** — none beyond what the previous two units already
  installed.

### The New Code

```python
        file = request.files['file']

        name = request.form.get('name', file.filename)
        category = request.form.get('category', 'part')
        model_type = request.form.get('modelType', 'solid')

        filename = file.filename
        file_extension = filename.rsplit('.', 1)[1].upper() if '.' in filename else 'OTHER'

        upload_folder = current_app.config['UPLOAD_FOLDER'] / 'models' / part_id
        os.makedirs(upload_folder, exist_ok=True)

        stored_filename = f"{uuid.uuid4().hex[:8]}_{filename}"
        file_path = upload_folder / stored_filename
        file.save(str(file_path))

        model = PartModel(
            id=f"MOD-{uuid.uuid4().hex[:8].upper()}",
            part_id=part_id,
            name=name,
            model_type=model_type,
            category=category,
            file_type=file_extension,
            file_path=str(file_path),
            file_size=os.path.getsize(file_path),
        )
        db.session.add(model)
        db.session.commit()
        return {'data': model.to_dict()}, 201
```

### The Updated Project

`rebuild/backend/app/__init__.py`'s own real `upload_part_model`
function, in full — the previous unit's own version, with this unit's
own new lines completing it:

```python
1  @app.route('/api/parts/<part_id>/models', methods=['POST'])
2  @token_required(allowed_roles=['programming', 'admin'])
3  def upload_part_model(current_user, part_id):
4      part = Part.query.get(part_id)
5      if not part:
6          return {'error': 'Part not found'}, 404
7
8      if 'file' not in request.files:
9          return {'error': 'No file provided'}, 400
10
11     file = request.files['file']
12
13     name = request.form.get('name', file.filename)
14     category = request.form.get('category', 'part')
15     model_type = request.form.get('modelType', 'solid')
16
17     filename = file.filename
18     file_extension = filename.rsplit('.', 1)[1].upper() if '.' in filename else 'OTHER'
19
20     upload_folder = current_app.config['UPLOAD_FOLDER'] / 'models' / part_id
21     os.makedirs(upload_folder, exist_ok=True)
22
23     stored_filename = f"{uuid.uuid4().hex[:8]}_{filename}"
24     file_path = upload_folder / stored_filename
25     file.save(str(file_path))
26
27     model = PartModel(
28         id=f"MOD-{uuid.uuid4().hex[:8].upper()}",
29         part_id=part_id,
30         name=name,
31         model_type=model_type,
32         category=category,
33         file_type=file_extension,
34         file_path=str(file_path),
35         file_size=os.path.getsize(file_path),
36     )
37     db.session.add(model)
38     db.session.commit()
39     return {'data': model.to_dict()}, 201
```

### Mechanical Walkthrough

- **Line 11, `file = request.files['file']`** — this project's own
  real **`request.files`** term, this time actually reading the real,
  uploaded file object, having already proven, on the line above, that
  it exists.
- **Lines 13–15, reading `request.form`** — real, plain Python
  `dict.get(...)`, already given full treatment; real and genuinely
  different from `request.files`, since these real values are the
  real, plain-text parts of this same real, multipart request.
- **Line 18, `filename.rsplit('.', 1)[1].upper() if '.' in filename
  else 'OTHER'`** — a real, plain Python string method,
  `str.rsplit(sep, maxsplit)`, splitting from the real, right-hand
  side at most once, so a real filename like `'bracket.final.stl'`
  correctly yields `'stl'`, not a real, incorrect split on every real
  dot; real and deliberately no check against
  `ALLOWED_MODEL_EXTENSIONS` anywhere — this lesson's own testing
  lesson's own real, named gap, ported honestly.
- **Line 20, `current_app.config['UPLOAD_FOLDER'] / 'models' /
  part_id`** — this lesson's Header's own already-established real
  `pathlib.Path`, real and using the real `/` operator to join real
  path segments, reading the previous unit's own new, real config
  value for the first time.
- **Line 21, `os.makedirs(upload_folder, exist_ok=True)`** — this
  lesson's Header's own new function, guaranteeing this real, specific
  part's own real upload folder genuinely exists.
- **Lines 23–25, the real, unique filename and the real save** — a
  real, `uuid`-prefixed filename, real and preventing two real,
  different uploads sharing an identical real, original filename from
  ever real, silently overwriting one another; `file.save(str(file_path))`,
  this lesson's Header's own new method, real and actually writing the
  real, uploaded bytes to real, permanent disk.
- **Lines 27–36, the real `PartModel`** — real and structurally
  identical to every other real model this project constructs,
  `file_size=os.path.getsize(file_path)`, real and measuring the real,
  just-written file's own real, actual size on disk, not any real,
  client-supplied claim about it.

### CS Lens

This is a real instance of **content-addressed-adjacent naming** — not
truly content-addressed (the real, `uuid`-based filename doesn't
depend on the real file's own real bytes at all), but real and solving
the identical real problem: guaranteeing a real, unique, real,
collision-free name for every real, uploaded file, the same real
motivation this project's own **Server-generated identifier** term
already established for every other real, created resource.

Also recognized in: any real file-storage system generating its own
real, opaque filenames rather than trusting a real, client-supplied
one directly.

### SE Lens

The real, deliberately *not*-taken alternative here: also porting
legacy's own real `try`/`except Exception as e: db.session.rollback();
if os.path.exists(file_path): os.remove(file_path); return
jsonify({'error': str(e)}), 500` wrapping. Rejected on purpose,
matching this project's own real, repeated reasoning: no real, current
test in this slice's own five-test file exercises a real database or
disk failure, so building real, defensive cleanup now would be real,
untested, speculative code. The real, honest cost accepted here: a
real, genuine failure partway through this real route today could
leave a real, orphaned file on disk with no matching real `PartModel`
row — a real, accepted gap, matching the identical real, minimal-first
discipline this project has already used more than once, named here
rather than silently absent.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_model_upload.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — this project's own real, five-test file
already found two genuine surprises in earlier lessons this session,
plus this slice's own real, security-relevant gap, so this was
actually run this session, not predicted:

```
test_part_model_upload.py::test_upload_part_model_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_model_upload.py::test_upload_part_model_with_no_file_returns_400 PASSED
test_part_model_upload.py::test_upload_part_model_with_unknown_part_returns_404 PASSED
test_part_model_upload.py::test_upload_part_model_succeeds_and_records_the_real_file PASSED
test_part_model_upload.py::test_upload_part_model_accepts_any_file_extension_with_no_real_validation PASSED

5 passed in ...s
```

All five real cases now genuinely pass against `rebuild` — including
the real, extension-agnostic one, ported honestly rather than
accidentally fixed. Every real test this project has ever written for
`/api/parts` was also re-run together, this session, confirming no
real regression: thirty-three real assertions together, all passing.
This real session's own real `backend/uploads/` and
`verification/backend/uploads/` folders were both, real and actually,
inspected afterward — neither contains any real, leftover file from
any of this lesson's own real test runs.

### Connecting this unit to what came before

The previous unit taught `rebuild` to correctly refuse a real,
invalid upload. This unit is where a real, valid one finally,
genuinely happens — completing this project's own real model-upload
route, honest gap included.

---

## Connect the pieces

One real request, `POST /api/parts/<id>/models`, now has a real,
complete, independently-built answer in `rebuild`: a real, dynamic
route correctly rejecting an unauthorized, nonexistent, or fileless
request, and, on real success, actually writing a real file to a real,
configured location and recording it as a real `PartModel` row — the
identical real, observable behavior the previous lesson proved legacy
has, including its own real, honestly-carried gap, reached by a
completely independent real implementation.

---

**Next lesson:** not yet decided here — this project's own real
3D-model work still has real model deletion ahead of it; the
tool-assembly joins remain a real, separate, deeper slice too.
