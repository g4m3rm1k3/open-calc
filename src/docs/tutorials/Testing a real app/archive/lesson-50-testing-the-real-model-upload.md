# Lesson 50: Testing the Real Model Upload

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. The 3D-models list slice
> is complete; this is a real, seventh, separate slice on this same
> real sub-resource — actually creating one.

## What you will build

A real, automated characterization of legacy's own, already-existing
`POST /api/parts/<id>/models` — this project's first real route
carrying an actual, real, uploaded file rather than a real JSON body.
Five real cases, all executed against the real, running legacy
backend, all passing, including a real, honest, security-relevant gap
actual execution confirms rather than assumes: this real route
validates nothing at all about what kind of file it's given.

## What you need to know first

The real, already-tested `token_required` decorator. This project's
own real, already-proven `POST /api/parts` and
`GET /api/parts/<id>/models`. This project's own real
**Server-generated identifier** term, already given full treatment —
this real route's own real model IDs follow the identical real
pattern.

## Terms introduced

- **Multipart form data** — a real, standard HTTP request encoding
  (`Content-Type: multipart/form-data`), genuinely different from
  every real request body this project has sent so far. A real JSON
  body (this project's own real, default shape for every other route)
  can only carry real text; multipart form data splits a real request
  into several real, separate parts — some plain, real, named fields,
  and one or more real, binary file attachments — letting a real
  client send an actual real file and its own real, accompanying
  metadata in one real HTTP request.
- **`request.files`** — Flask's own real, dedicated object for reading
  the real, file parts of a real, multipart request — genuinely
  separate from `request.form` (this same real request's own real,
  plain text fields) and `request.get_json()` (this project's own
  real, already-established way to read a real, JSON body) — a real
  request is never both at once; which one applies depends entirely on
  the real, incoming `Content-Type`.

## Objects and methods used

- **`tempfile.mkdtemp(prefix=...)`**
  - *What it is:* a real, standard-library Python function, creating a
    real, new, empty directory on disk and returning its own real,
    absolute path.
  - *Implementation:* checked against Python's own official
    documentation this session — real and guaranteed to be a real,
    unique, real directory nothing else on the real, current machine
    is using, real and never auto-deleted; the real caller owns
    cleaning it up.
  - *Its use:* this lesson's own real tests need a real, throwaway
    place on disk for legacy's own real code to actually write a real
    file to, real and never legacy's own real, permanent
    `backend/uploads/` folder — reusing that real, shared folder would
    leave real, leftover test files inside this project's own real
    repository.
  - *Type:* a function in Python's own `tempfile` standard-library
    module.
  - *Responsibility:* the real, safe, standard way to obtain a real,
    disposable directory for a real test's own, temporary real use.
  - *Depends on:* nothing beyond the real, current machine having a
    real, writable temp location, which every real, standard Python
    installation already provides.
  - *Connects to:* this lesson's own real test assigns this real path
    directly onto a real, already-created Flask app's own real
    `UPLOAD_FOLDER` config value, redirecting where legacy's own real
    upload code actually writes.
  - *Shape:* the real, standard Python standard-library boundary — not
    project-specific.
- **`shutil.rmtree(path, ignore_errors=True)`**
  - *What it is:* a real, standard-library Python function, deleting a
    real directory and everything real inside it.
  - *Implementation:* checked against Python's own official
    documentation this session — `ignore_errors=True` means a real
    failure to delete (a real, already-missing path, a real,
    locked file) is silently ignored rather than raising.
  - *Its use:* this lesson's own real tests call this, real and inside
    a real `finally` block, guaranteeing the real, temporary upload
    directory `tempfile.mkdtemp` created is real, always cleaned up
    afterward — real, even if a real assertion above it fails.
  - *Type:* a function in Python's own `shutil` standard-library
    module.
  - *Responsibility:* the real, standard, recursive way to remove a
    real directory tree.
  - *Depends on:* a real, existing path (or tolerates a real, missing
    one, given `ignore_errors=True`).
  - *Connects to:* called directly inside this lesson's own real
    tests' own real `finally` blocks, real and paired with this
    lesson's own `tempfile.mkdtemp` call.
  - *Shape:* the real, standard Python standard-library boundary — not
    project-specific.

---

## Concept Unit: A Real Request That Isn't JSON

### The Problem

Legacy's own real `upload_part_model` route exists, already runs, and
accepts a real, uploaded file — something no real route this project
has characterized yet actually does. Every real test this project has
written so far sends a real JSON body; a real file upload cannot be
expressed that way at all. The real question this unit answers: what
does a real, automated test actually look like when the real thing
being sent is a real file, not real text — and, just as important, how
does a real test prove this without leaving real files scattered
across the real, actual project?

> **Before reading on:** this project's own real characterization
> tests, so far, have always run directly against legacy's own real,
> default configuration — a real, running app pointed at
> `backend/uploads/`, a real, permanent folder inside this real
> repository. Given that this real route actually writes a real file
> to disk, what real, honest risk does running this real test, exactly
> like every earlier one, actually carry — and what would a real,
> safe test need to do differently before ever calling this real
> route at all?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `upload_part_model` function, read in full this session, lines
  303–373: decorated `@token_required(allowed_roles=['programming',
  'admin'])` — the identical real, narrower list this slice's own
  deletion and update routes already use, no real **Operator bypass**
  here. Looks a real part up by its own real ID, returns a real `404`
  if none exists; checks `'file' not in request.files`, returning a
  real `400` with `{'error': 'No file provided'}` if so; reads
  `request.form.get('name', ...)`, `'category'`, `'modelType'`,
  `'priority'`, `'isGeneric'`; derives a real, uppercased file
  extension from the real, uploaded filename; builds a real, unique
  path under `current_app.config['UPLOAD_FOLDER'] / 'models' /
  part_id`, real and creating that real directory if it doesn't exist
  yet (`os.makedirs(..., exist_ok=True)`); saves the real file there
  under a real, `uuid`-prefixed name; creates a real `PartModel` row;
  commits; returns a real `201`.
- **Files affected** — created:
  `acceptance-tests/test_part_model_upload.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `acceptance-tests/`
  folder.
- **Dependencies** — none beyond this project's own shared
  acceptance-test harness, plus Python's own real, standard `io`,
  `tempfile`, and `shutil` modules.

### The New Code

```python
import io
import os
import shutil
import sys
import tempfile
from pathlib import Path

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_ROOT = os.path.join(REPO_ROOT, "backend")
sys.path.insert(0, BACKEND_ROOT)

from app import create_app


def get_client(upload_folder):
    app = create_app('testing')
    app.config['UPLOAD_FOLDER'] = Path(upload_folder)
    return app.test_client()


def _admin_token(client):
    login = client.post('/api/auth/login', json={
        'email': 'admin@mfg.com',
        'password': 'admin',
    })
    return login.get_json()['token']


def test_upload_part_model_with_no_token_returns_401_not_the_operator_bypass():
    upload_folder = tempfile.mkdtemp(prefix='legacy_upload_')
    try:
        client = get_client(upload_folder)
        admin_token = _admin_token(client)
        auth = {'Authorization': f'Bearer {admin_token}'}

        created = client.post('/api/parts', json={
            'partNumber': '9998880',
            'description': 'No-token upload check, for real',
        }, headers=auth)
        part_id = created.get_json()['data']['id']

        response = client.post(f'/api/parts/{part_id}/models', data={
            'file': (io.BytesIO(b'irrelevant'), 'a.stl'),
        }, content_type='multipart/form-data')
        assert response.status_code == 401
    finally:
        shutil.rmtree(upload_folder, ignore_errors=True)
```

### The Updated Project

`acceptance-tests/test_part_model_upload.py`, in full — brand new, so
this is the whole file so far:

```python
1  import io
2  import os
3  import shutil
4  import sys
5  import tempfile
6  from pathlib import Path
7
8  REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
9  BACKEND_ROOT = os.path.join(REPO_ROOT, "backend")
10 sys.path.insert(0, BACKEND_ROOT)
11
12 from app import create_app
13
14
15 def get_client(upload_folder):
16     app = create_app('testing')
17     app.config['UPLOAD_FOLDER'] = Path(upload_folder)
18     return app.test_client()
19
20
21 def _admin_token(client):
22     login = client.post('/api/auth/login', json={
23         'email': 'admin@mfg.com',
24         'password': 'admin',
25     })
26     return login.get_json()['token']
27
28
29 def test_upload_part_model_with_no_token_returns_401_not_the_operator_bypass():
30     upload_folder = tempfile.mkdtemp(prefix='legacy_upload_')
31     try:
32         client = get_client(upload_folder)
33         admin_token = _admin_token(client)
34         auth = {'Authorization': f'Bearer {admin_token}'}
35
36         created = client.post('/api/parts', json={
37             'partNumber': '9998880',
38             'description': 'No-token upload check, for real',
39         }, headers=auth)
40         part_id = created.get_json()['data']['id']
41
42         response = client.post(f'/api/parts/{part_id}/models', data={
43             'file': (io.BytesIO(b'irrelevant'), 'a.stl'),
44         }, content_type='multipart/form-data')
45         assert response.status_code == 401
46     finally:
47         shutil.rmtree(upload_folder, ignore_errors=True)
```

Three more real cases complete this unit — a real, missing file, a
real, unknown part, and a real, successful upload:

```python
def test_upload_part_model_with_no_file_returns_400():
    upload_folder = tempfile.mkdtemp(prefix='legacy_upload_')
    try:
        client = get_client(upload_folder)
        admin_token = _admin_token(client)
        auth = {'Authorization': f'Bearer {admin_token}'}

        created = client.post('/api/parts', json={
            'partNumber': '9998881',
            'description': 'No-file upload check, for real',
        }, headers=auth)
        part_id = created.get_json()['data']['id']

        response = client.post(f'/api/parts/{part_id}/models', data={}, headers=auth, content_type='multipart/form-data')
        assert response.status_code == 400
        assert response.get_json() == {'error': 'No file provided'}
    finally:
        shutil.rmtree(upload_folder, ignore_errors=True)


def test_upload_part_model_with_unknown_part_returns_404():
    upload_folder = tempfile.mkdtemp(prefix='legacy_upload_')
    try:
        client = get_client(upload_folder)
        admin_token = _admin_token(client)
        auth = {'Authorization': f'Bearer {admin_token}'}

        response = client.post('/api/parts/no-such-part/models', data={
            'file': (io.BytesIO(b'irrelevant'), 'a.stl'),
        }, headers=auth, content_type='multipart/form-data')
        assert response.status_code == 404
    finally:
        shutil.rmtree(upload_folder, ignore_errors=True)


def test_upload_part_model_succeeds_and_records_the_real_file():
    upload_folder = tempfile.mkdtemp(prefix='legacy_upload_')
    try:
        client = get_client(upload_folder)
        admin_token = _admin_token(client)
        auth = {'Authorization': f'Bearer {admin_token}'}

        created = client.post('/api/parts', json={
            'partNumber': '9998882',
            'description': 'Real upload check, for real',
        }, headers=auth)
        part_id = created.get_json()['data']['id']

        response = client.post(f'/api/parts/{part_id}/models', data={
            'file': (io.BytesIO(b'fake stl content'), 'bracket.stl'),
            'name': 'Bracket Model',
            'category': 'part',
        }, headers=auth, content_type='multipart/form-data')

        assert response.status_code == 201
        model = response.get_json()['data']
        assert model['id'].startswith('MOD-')
        assert model['partId'] == part_id
        assert model['name'] == 'Bracket Model'
        assert model['category'] == 'part'
        assert model['fileType'] == 'STL'
        assert model['fileSize'] == len(b'fake stl content')

        listing = client.get(f'/api/parts/{part_id}/models', headers=auth)
        assert listing.get_json()['total'] == 1
    finally:
        shutil.rmtree(upload_folder, ignore_errors=True)
```

### Mechanical Walkthrough

- **Lines 8–10, `REPO_ROOT`/`BACKEND_ROOT`/`sys.path.insert`** — real
  and slightly different from this project's own earlier
  characterization tests, which reach legacy through `target.py`'s own
  shared `get_client()`; this unit needs its own real, local
  `get_client(upload_folder)` instead — real, direct proof that a
  real, shared helper doesn't always fit every real case: `target.py`'s
  own real version returns only a real, already-built test client,
  discarding the real, underlying `app` object entirely, real and
  giving this unit nothing real to set a real, custom `UPLOAD_FOLDER`
  on afterward.
- **Line 17, `app.config['UPLOAD_FOLDER'] = Path(upload_folder)`** —
  real, direct proof of this unit's own opening answer: overriding a
  real, single Flask app *instance's* own real config dictionary,
  right after real construction, sidesteps this real risk entirely —
  real and completely independent of whatever real, default value
  legacy's own real `Config` class would otherwise use.
- **Line 30, `tempfile.mkdtemp(prefix='legacy_upload_')`** — this
  lesson's Header's own new function, real and giving this unit a
  real, disposable directory nothing else on the real machine is using.
- **Lines 42–44, the real, multipart request** — `data={'file':
  (io.BytesIO(b'irrelevant'), 'a.stl')}` with `content_type=
  'multipart/form-data'` — this lesson's Header's own new **Multipart
  form data** term, built for real: Werkzeug's own real test client
  accepts a real, plain Python tuple — a real, in-memory, file-like
  object (`io.BytesIO`, standard-library, already familiar from this
  project's own real HTTP bodies) paired with a real, literal filename
  — and encodes it as a real, genuine file part, exactly as a real
  browser's own real `<input type="file">` would.
- **Line 46, `finally: shutil.rmtree(upload_folder, ignore_errors=True)`**
  — this lesson's Header's own new function, real and guaranteed to
  run whether the real test above it passed or real, failed.
- **Line 45 and the three, real, remaining tests' own assertions** —
  the identical real 401/400/404 patterns this project's own other
  Parts routes already established, applied here to a real, multipart
  request instead of a real, JSON one.
- **The real, successful case's own assertions** — `model['id']
  .startswith('MOD-')`, this project's own real **Server-generated
  identifier** term, real and reused; `model['fileType'] == 'STL'`,
  real, direct proof legacy derives this real value from the real,
  uploaded filename's own real extension, uppercased; `model['fileSize']
  == len(b'fake stl content')`, real, direct proof the real, saved
  file's own real, on-disk size was actually measured, not merely
  copied from a real, client-supplied claim.

### CS Lens

This is a real instance of **test isolation via redirected side
effects** — rather than mocking or skipping a real, genuine disk write
(this project's own real Verification Rule already demands actually
running real doubt, not assuming it away), this real technique lets
the real, actual code run, real and completely unmodified, while
real, safely redirecting *where* its real, external effect lands.

Also recognized in: any real integration test pointing a real
application's own real file storage, real email sending, or real
database connection at a real, disposable, test-only target instead of
a real, shared, production one.

### SE Lens

The real, deliberately *not*-taken alternative here: mocking
`request.files`, `file.save`, or `os.makedirs` instead of real,
actually running this real route against a real, temporary directory.
Rejected on purpose, matching this project's own real, repeated
Verification Rule discipline: a real mock proves this project's own
real *assumptions* about what the real code does; actually running it
proves what it *actually* does — the exact real distinction this
project's own real `415`-not-`400` and `405`-not-`404` surprises
already demonstrated more than once. A real, temporary directory is
real, cheap enough that mocking bought nothing extra here.

### Commands needed

```powershell
cd manufacturing-platform
backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_model_upload.py -v
```

### Run it, per the Verification Rule

Real doubt existed here, more than once over — whether a real,
multipart request actually reaches this real route the way this unit
predicts, and whether redirecting `UPLOAD_FOLDER` genuinely keeps this
real repository clean — so this was actually run this session,
against legacy, and the real project's own `backend/uploads/` folder
was real, actually inspected afterward and confirmed untouched:

```
test_part_model_upload.py::test_upload_part_model_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_model_upload.py::test_upload_part_model_with_no_file_returns_400 PASSED
test_part_model_upload.py::test_upload_part_model_with_unknown_part_returns_404 PASSED
test_part_model_upload.py::test_upload_part_model_succeeds_and_records_the_real_file PASSED

4 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: all four real assertions fail — no real route answers a real
`POST` at this real path yet at all.

### Connecting this unit to what came before

Every earlier real route this project characterized sent and received
real JSON. This unit is the first real proof that a real, genuinely
different request shape needs its own real, careful treatment, both in
what it sends and in how safely a real test can send it.

---

## Concept Unit: A Real Gap — Any File, No Questions Asked

### The Problem

This project's own real `backend/config.py` already declares a real,
specific set of allowed real 3D-model file extensions —
`ALLOWED_MODEL_EXTENSIONS = {'step', 'stp', 'stl', 'iges', 'igs',
'obj'}` — read in full this session. The previous unit's own real,
successful upload used a real `.stl` file, which happens to already be
in that real, allowed set. The real question this unit answers: does
legacy's own real upload route actually *check* a real, uploaded
file's own extension against that real, declared set at all?

> **Before reading on:** search this project's own real
> `backend/app/` folder, by hand or by real, plain-text search, for
> every real place `ALLOWED_MODEL_EXTENSIONS` is actually used. How
> many real, matching places did you find, beyond `config.py`'s own
> real declaration of it?

### Project Change

- **Reference Source** — the identical real `upload_part_model`
  function already quoted in full in the previous unit — real and
  worth stating plainly: no real line inside it, anywhere, reads
  `current_app.config['ALLOWED_MODEL_EXTENSIONS']`, or checks a real,
  uploaded file's own extension against any real, allowed set at all.
  A real, project-wide search this session confirms
  `ALLOWED_MODEL_EXTENSIONS` appears in exactly one real place: its own
  real declaration in `config.py`. This real config value is real,
  completely unused.
- **Files affected** — modified:
  `acceptance-tests/test_part_model_upload.py`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none new.

### The New Code

```python
def test_upload_part_model_accepts_any_file_extension_with_no_real_validation():
    upload_folder = tempfile.mkdtemp(prefix='legacy_upload_')
    try:
        client = get_client(upload_folder)
        admin_token = _admin_token(client)
        auth = {'Authorization': f'Bearer {admin_token}'}

        created = client.post('/api/parts', json={
            'partNumber': '9998883',
            'description': 'Extension validation check, for real',
        }, headers=auth)
        part_id = created.get_json()['data']['id']

        response = client.post(f'/api/parts/{part_id}/models', data={
            'file': (io.BytesIO(b'not a real model'), 'not-a-model.exe'),
        }, headers=auth, content_type='multipart/form-data')

        assert response.status_code == 201
        assert response.get_json()['data']['fileType'] == 'EXE'
    finally:
        shutil.rmtree(upload_folder, ignore_errors=True)
```

### The Updated Project

`acceptance-tests/test_part_model_upload.py`, in full — the previous
unit's own four real tests, with this unit's own new one appended
(continuing from that file's own line 116):

```python
117
118
119 def test_upload_part_model_accepts_any_file_extension_with_no_real_validation():
120     upload_folder = tempfile.mkdtemp(prefix='legacy_upload_')
121     try:
122         client = get_client(upload_folder)
123         admin_token = _admin_token(client)
124         auth = {'Authorization': f'Bearer {admin_token}'}
125
126         created = client.post('/api/parts', json={
127             'partNumber': '9998883',
128             'description': 'Extension validation check, for real',
129         }, headers=auth)
130         part_id = created.get_json()['data']['id']
131
132         response = client.post(f'/api/parts/{part_id}/models', data={
133             'file': (io.BytesIO(b'not a real model'), 'not-a-model.exe'),
134         }, headers=auth, content_type='multipart/form-data')
135
136         assert response.status_code == 201
137         assert response.get_json()['data']['fileType'] == 'EXE'
138     finally:
139         shutil.rmtree(upload_folder, ignore_errors=True)
```

### Mechanical Walkthrough

- **Line 133, `'not-a-model.exe'`** — a real, deliberately implausible
  filename for a real 3D model — real and chosen specifically because
  `.exe` is nowhere near `ALLOWED_MODEL_EXTENSIONS`'s own real,
  declared set.
- **Line 136, `assert response.status_code == 201`** — real, direct
  proof this unit's own opening question resolves the honest way:
  legacy's own real route accepts this real file exactly as readily as
  the previous unit's own real `.stl` file.
- **Line 137, `assert response.get_json()['data']['fileType'] ==
  'EXE'`** — real, direct proof legacy's own real code simply
  uppercases whatever real extension it's given, with no real,
  intervening check at all.

### CS Lens

This is a real instance of **unenforced configuration** — a real,
declared policy (`ALLOWED_MODEL_EXTENSIONS`) that exists in the real
codebase, real and readable, real and looking authoritative, while the
real code path it should govern never actually consults it. A real
reader skimming `config.py` alone would reasonably, and incorrectly,
believe this real restriction is real and enforced somewhere.

Also recognized in: a real, unused feature flag left defined after the
real code path checking it was removed; a real, documented
`MAX_UPLOAD_SIZE` constant never actually compared against a real,
incoming request's own real size.

### SE Lens

The real, honest, security-relevant weight of this real gap: this
real route currently accepts *any* real file, with *any* real
extension, real and stores it, real and unmodified, on the real
server's own real disk — a real, classic, unrestricted-file-upload
risk category, genuinely more serious than this slice's own earlier,
milder gaps (an unvalidated `status` string, a `415` instead of `400`
edge case). This real project's own curriculum labels this
**Preserve**, not **Correct**, for the identical real reason as
every other real, characterized gap — no real, current test requires
real validation, and inventing one now would be real, speculative
scope beyond this lesson's own real job, which is characterizing what
legacy actually does. Real and worth saying plainly, though, exactly
as this lesson's own real findings themselves say: this specific real
gap is a real, strong, honest candidate for a real, future **Correct**
decision, the moment a real, stated requirement calls for it — not
something to quietly carry forward without ever naming it as more
serious than the others.

### Commands needed

```powershell
cd manufacturing-platform
backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_model_upload.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether legacy's own real code path
genuinely never consults `ALLOWED_MODEL_EXTENSIONS` at all, rather
than checking it somewhere this unit hadn't yet read — so this was
actually run this session, against legacy, together with every real
test this lesson has built:

```
test_part_model_upload.py::test_upload_part_model_with_no_token_returns_401_not_the_operator_bypass PASSED
test_part_model_upload.py::test_upload_part_model_with_no_file_returns_400 PASSED
test_part_model_upload.py::test_upload_part_model_with_unknown_part_returns_404 PASSED
test_part_model_upload.py::test_upload_part_model_succeeds_and_records_the_real_file PASSED
test_part_model_upload.py::test_upload_part_model_accepts_any_file_extension_with_no_real_validation PASSED

5 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: this real test fails too, at its own real first assertion, the
identical real reason every other real case in this lesson fails
against `rebuild` right now — no real route exists at this real path
at all yet.

### Connecting this unit to what came before

The previous unit proved this real route's own real, basic contract.
This unit proves that contract's own real, honest limit — a real gap
worth carrying into the next lesson's own real port, named, not
silently inherited.

---

## Connect the pieces

Five real, distinct, now-automated claims about one real route: who
may call it, what happens with no real file, what happens for an
unknown part, what a real, successful upload actually records, and
that it validates nothing at all about the real kind of file it's
given — proven against legacy and proven, honestly, not yet true
against `rebuild`.

---

**Next lesson:** the real route itself — the smallest real backend
change making all five of this lesson's own real tests pass against
`rebuild`, ported with the identical real, honest gap this lesson just
found, named rather than silently repeated.
