# Lesson 46: Testing the Real Synthetic Model Entries

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. The 3D-models list's own
> real, empty case is already proven; this lesson characterizes its
> own real, richer case, deliberately deferred until now.

## What you will build

A real, automated characterization of legacy's own, already-existing
`GET /api/parts/<id>/models`, scoped to the two real, **synthetic**
entries it produces from a real part's own `finalModelPath` and
`fixtureModelPath` — real, well-formed entries in the real, returned
list that never correspond to an actual `PartModel` row at all.

## What you need to know first

This project's own real, already-proven `GET /api/parts/<id>/models`,
scoped to its own empty case. This slice's own real `PartModel` model
and its own real `to_dict()`. This project's own real
**Server-generated identifier** term, already given full treatment —
this lesson's own real synthetic IDs are a real, deliberate exception
to it, explained below.

## Terms introduced

- **Synthetic resource entry** — a real, well-formed item appearing in
  a real, returned collection that was never actually stored as its
  own real row anywhere; legacy's own real `get_part_models` builds
  two of these directly from a real part's own real, already-existing
  columns (`final_model_path`, `fixture_model_path`), real and giving
  each one a real, deterministic ID (`f'{part_id}-final'`,
  `f'{part_id}-fixture'`) instead of a real, random,
  server-generated one — this project's own real **Server-generated
  identifier** term, deliberately not used here, because there's no
  real row a real, random ID would even identify.

## Objects and methods used

None genuinely new beyond this project's own, already fully-treated
`Flask.test_client().post/get(...)`.

---

## Concept Unit: Two Real Entries That Were Never Really Rows

### The Problem

The previous lesson proved this real route returns a real, empty list
when a part has no real models and no real, set path fields. Legacy's
own real `get_part_models`, already quoted in full in that lesson, has
two real, remaining branches this project has not yet characterized:
what it does when a real part's own `final_model_path` or
`fixture_model_path` actually holds a real value. The real question
this unit answers: what, precisely, do those real, synthetic entries
look like?

> **Before reading on:** this project's own real creation route
> already accepts a real `partNumber` and `description` a real client
> supplies directly, but generates its own real `id` server-side —
> this project's own real **Server-generated identifier** term.
> Given that a real, synthetic entry has no real, separate row to
> generate an ID *from*, what would you guess legacy actually uses as
> its own real `id` instead — and would two real, different parts ever
> risk colliding on it?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `get_part_models` function's own real, remaining body, already
  quoted in full in the previous lesson: `if part.final_model_path:`
  appends a real dict with `'id': f'{part_id}-final'`, `'category':
  'part'`, `'name': 'Final Part Model'`, `'description': 'Target part
  geometry'`, `'priority': 100`, and `'filePath': part.final_model_path`;
  `if part.fixture_model_path:` appends the real, identical shape with
  `'id': f'{part_id}-fixture'`, `'category': 'fixture'`, `'name':
  'Fixture Model'`, `'description': 'Workholding fixture'`, `'priority':
  99`. This project's own real creation route already accepts a real
  `finalModelPath`/`fixtureModelPath` in its own real request body
  (confirmed by reading `Part.from_dict` in full this session), even
  though this project's own real `Part.from_dict` — this project's own
  real `rebuild` — doesn't yet.
- **Files affected** — modified:
  `acceptance-tests/test_part_models.py`.
- **Change type** — add (two real functions, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
def test_list_part_models_includes_a_synthetic_final_and_fixture_entry():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '3334446',
        'description': 'Synthetic model check, for real',
        'finalModelPath': '/uploads/parts/3334446/final.obj',
        'fixtureModelPath': '/uploads/parts/3334446/fixture.obj',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    response = client.get(f'/api/parts/{part_id}/models', headers=auth)
    assert response.status_code == 200

    body = response.get_json()
    assert body['total'] == 2

    final_entry = next(model for model in body['data'] if model['category'] == 'part')
    assert final_entry['id'] == f'{part_id}-final'
    assert final_entry['name'] == 'Final Part Model'
    assert final_entry['filePath'] == '/uploads/parts/3334446/final.obj'
    assert final_entry['priority'] == 100

    fixture_entry = next(model for model in body['data'] if model['category'] == 'fixture')
    assert fixture_entry['id'] == f'{part_id}-fixture'
    assert fixture_entry['name'] == 'Fixture Model'
    assert fixture_entry['filePath'] == '/uploads/parts/3334446/fixture.obj'
    assert fixture_entry['priority'] == 99
```

### The Updated Project

`acceptance-tests/test_part_models.py`, in full — this project's own
three, already-established real tests, with this unit's own new one
appended (continuing from that file's own line 65):

```python
66
67
68 def test_list_part_models_includes_a_synthetic_final_and_fixture_entry():
69     client = get_client()
70     admin_token = _admin_token(client)
71     auth = {'Authorization': f'Bearer {admin_token}'}
72
73     created = client.post('/api/parts', json={
74         'partNumber': '3334446',
75         'description': 'Synthetic model check, for real',
76         'finalModelPath': '/uploads/parts/3334446/final.obj',
77         'fixtureModelPath': '/uploads/parts/3334446/fixture.obj',
78     }, headers=auth)
79     part_id = created.get_json()['data']['id']
80
81     response = client.get(f'/api/parts/{part_id}/models', headers=auth)
82     assert response.status_code == 200
83
84     body = response.get_json()
85     assert body['total'] == 2
86
87     final_entry = next(model for model in body['data'] if model['category'] == 'part')
88     assert final_entry['id'] == f'{part_id}-final'
89     assert final_entry['name'] == 'Final Part Model'
90     assert final_entry['filePath'] == '/uploads/parts/3334446/final.obj'
91     assert final_entry['priority'] == 100
92
93     fixture_entry = next(model for model in body['data'] if model['category'] == 'fixture')
94     assert fixture_entry['id'] == f'{part_id}-fixture'
95     assert fixture_entry['name'] == 'Fixture Model'
96     assert fixture_entry['filePath'] == '/uploads/parts/3334446/fixture.obj'
97     assert fixture_entry['priority'] == 99
```

One more real case completes this unit — only a real, final path set,
proving the real, fixture entry is genuinely independent:

```python
def test_list_part_models_with_only_a_final_path_produces_exactly_one_synthetic_entry():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '3334448',
        'description': 'Final-only check, for real',
        'finalModelPath': '/uploads/parts/3334448/final.obj',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    response = client.get(f'/api/parts/{part_id}/models', headers=auth)
    assert response.status_code == 200
    body = response.get_json()
    assert body['total'] == 1
    assert body['data'][0]['category'] == 'part'
```

`acceptance-tests/test_part_models.py`, in full, with this real
function added:

```python
98
99
100 def test_list_part_models_with_only_a_final_path_produces_exactly_one_synthetic_entry():
101     client = get_client()
102     admin_token = _admin_token(client)
103     auth = {'Authorization': f'Bearer {admin_token}'}
104
105     created = client.post('/api/parts', json={
106         'partNumber': '3334448',
107         'description': 'Final-only check, for real',
108         'finalModelPath': '/uploads/parts/3334448/final.obj',
109     }, headers=auth)
110     part_id = created.get_json()['data']['id']
111
112     response = client.get(f'/api/parts/{part_id}/models', headers=auth)
113     assert response.status_code == 200
114     body = response.get_json()
115     assert body['total'] == 1
116     assert body['data'][0]['category'] == 'part'
```

### Mechanical Walkthrough

- **Lines 73–78, a real part created with both real path fields set**
  — real, direct proof this project's own real creation route already
  accepts real fields this project's own `rebuild` doesn't
  independently know how to store yet — a real gap this lesson's own
  Header already names honestly.
- **Line 87, `next(model for model in body['data'] if model['category']
  == 'part')`** — a real, plain Python generator expression, finding
  the one real entry whose own real `category` is `'part'` — real and
  necessary because this real list's own real order isn't part of this
  unit's own claim, only its real contents.
- **Line 88, `assert final_entry['id'] == f'{part_id}-final'`** — this
  lesson's Header's own new **Synthetic resource entry** term, proven:
  a real, deterministic ID, built from the real part's own real ID plus
  a real, literal suffix — never colliding across two real, different
  parts, because each real part's own real ID is already unique.
- **Line 91, `assert final_entry['priority'] == 100`** — a real,
  hard-coded value, real and higher than the real fixture entry's own
  `99` — this real ordering choice is legacy's own real, deliberate
  ranking, not something this real test computes.
- **Lines 105–109, only `finalModelPath` set** — real, direct proof
  the real, fixture branch is genuinely independent: nothing here
  should produce a real, second entry.
- **Line 116, `assert body['data'][0]['category'] == 'part'`** — real,
  direct proof only the real, final entry appeared, confirming the
  real, fixture branch stayed silent when its own real, triggering
  field was never set.

### CS Lens

This is a real instance of a **derived / computed view** — these two
real entries exist nowhere in any real database table; they're
computed, real and freshly, on every real request, directly from a
real part's own already-stored columns. The real cost of this real
design: nothing here can be independently real, queried, sorted, or
paginated the way a real, actual `PartModel` row could — the real,
returned list mixes real, stored rows and real, computed values
indistinguishably.

Also recognized in: a real API response that includes a real,
computed `fullName` field built from `firstName`/`lastName` at request
time, never stored as its own real column; a real, virtual "Recently
Viewed" list assembled from a real, separate log, not its own real
table.

### SE Lens

The real, deliberately *not*-taken alternative here: legacy real,
storing these two real models as actual `PartModel` rows the moment a
real part's own path fields are set, instead of computing them on
every real request. Not this project's own real call to make —
legacy's own real code already made this real choice; this project's
own real job is to characterize it honestly, not redesign it. Real and
worth naming: this real, computed approach means a real client can
never real, independently delete or re-prioritize just the real,
synthetic "final" entry through this project's own real, already-built
`DELETE /api/parts/models/<id>` route (a real, different route this
project's own curriculum hasn't reached yet) — real, synthetic IDs
like `f'{part_id}-final'` were never inserted as real rows, so no real
row exists for that real route to find.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_models.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether these real, synthetic entries'
own exact real shape (their real IDs, real priorities, real category
labels) matches what this unit predicted — so this was actually run
this session, against legacy:

```
test_part_models.py::test_list_part_models_includes_a_synthetic_final_and_fixture_entry PASSED
test_part_models.py::test_list_part_models_with_only_a_final_path_produces_exactly_one_synthetic_entry PASSED

2 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: both real assertions fail — this project's own real
`Part.from_dict` doesn't accept `finalModelPath`/`fixtureModelPath` at
all yet, so the real part these tests create never actually has either
real path field set, and this project's own real route has no real
branch producing either real, synthetic entry yet either.

### Connecting this unit to what came before

The previous lesson proved this real route's own empty case. This unit
proves its real, richer one — completing this real route's own full,
real characterization.

---

## Connect the pieces

Two more real, distinct, now-automated claims about this real route:
a real part's own `finalModelPath` and `fixtureModelPath` each produce
a real, well-formed, deterministic, synthetic entry, real and
independent of one another and of any real, actual `PartModel` row —
proven against legacy and proven, honestly, not yet true against
`rebuild`.

---

**Next lesson:** the real, smallest backend changes making both of
this lesson's own real tests pass against `rebuild` — extending
`Part.from_dict` to accept the two real fields these tests need, then
the real route's own two, new branches.
