# Lesson 40: Testing the Real Part Field Edits

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. The real favorite toggle
> already proved this real route's own real shape; this lesson
> characterizes the three real fields that slice deliberately deferred.

## What you will build

A real, automated characterization of legacy's own, already-existing
`PUT /api/parts/<id>`, covering its three remaining real,
independently-updatable fields — `description`, `material`, and
`status` — completing this slice's own real field-by-field
characterization. Three real cases, all executed against the real,
running legacy backend, all passing, including a real, honest gap
actual execution confirms rather than assumes.

## What you need to know first

This slice's own real, already-proven `PUT /api/parts/<id>` and its
own real **Partial update / PATCH-like PUT** term, already given full
treatment. This project's own real, already-proven `POST /api/parts`,
reused here only to create a real part to update.

## Terms introduced

None genuinely new — this lesson extends this slice's own,
already-established characterization of one real route's remaining
real fields.

## Objects and methods used

None genuinely new beyond this slice's own, already fully-treated
`Flask.test_client().put(...)`.

---

## Concept Unit: Three Real Fields, Changed Together and Alone

### The Problem

The favorite-toggle lesson proved `isFavorite` changes in real
isolation. Legacy's own real `update_part`, already quoted in full in
that lesson, has four more real, independent `if 'FIELD' in data:`
checks — `description`, `material`, `status`, and `model3dPath`. This
project defers `model3dPath` (it belongs with this project's own,
later, real 3D-model-upload slice, where a real file path actually
comes from somewhere). The real question this unit answers: do the
remaining three real fields behave with the identical real,
independent granularity `isFavorite` already proved, and does legacy
actually validate a real `status` value against its own real,
documented workflow?

> **Before reading on:** this project's own real `Part` model's own
> real, hand-written comment already documents `status` as one of a
> real, fixed set of values — `'draft'`, `'pending_approval'`,
> `'approved'`, `'released'`, `'archived'`. Given that `update_part`'s
> own real code, already quoted in full, does nothing more than
> `part.status = data['status']` with no real, visible check anywhere
> nearby, what would you guess happens if a real client sends a real
> `status` value that isn't any of those five?

### Project Change

- **Reference Source** — the identical real `update_part` function
  already quoted in full in this slice's own favorite-toggle lesson —
  specifically its own real, sibling checks: `if 'description' in
  data: part.description = data['description']`, `if 'material' in
  data: part.material = data['material']`, and `if 'status' in data:
  part.status = data['status']`. No real code exists anywhere in this
  function, or anywhere else in `backend/app/models/part.py`
  (confirmed by reading both in full this session), validating a real
  `status` value against its own real, documented set.
- **Files affected** — modified:
  `acceptance-tests/test_part_update.py`.
- **Change type** — add (three real functions, appended).
- **Location** — end of this slice's own existing real file.
- **Dependencies** — none beyond what this slice already installed.

### The New Code

```python
def test_update_part_changes_description_material_and_status_together():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '2223334',
        'description': 'Original description, for real',
        'material': 'Steel',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    response = client.put(f'/api/parts/{part_id}', json={
        'description': 'New description, for real',
        'material': 'Titanium',
        'status': 'approved',
    }, headers=auth)

    assert response.status_code == 200
    part = response.get_json()['data']
    assert part['description'] == 'New description, for real'
    assert part['material'] == 'Titanium'
    assert part['status'] == 'approved'
```

### The Updated Project

`acceptance-tests/test_part_update.py`, in full — this slice's own,
already-established seven real tests, with this unit's own new one
appended (continuing from that file's own line 117):

```python
118
119
120 def test_update_part_changes_description_material_and_status_together():
121     client = get_client()
122     admin_token = _admin_token(client)
123     auth = {'Authorization': f'Bearer {admin_token}'}
124
125     created = client.post('/api/parts', json={
126         'partNumber': '2223334',
127         'description': 'Original description, for real',
128         'material': 'Steel',
129     }, headers=auth)
130     part_id = created.get_json()['data']['id']
131
132     response = client.put(f'/api/parts/{part_id}', json={
133         'description': 'New description, for real',
134         'material': 'Titanium',
135         'status': 'approved',
136     }, headers=auth)
137
138     assert response.status_code == 200
139     part = response.get_json()['data']
140     assert part['description'] == 'New description, for real'
141     assert part['material'] == 'Titanium'
142     assert part['status'] == 'approved'
```

Two more real cases complete this unit — a real, invalid status
string, and a real, single-field change proving the other two stay
alone:

```python
def test_update_part_accepts_any_status_string_with_no_real_validation():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '2223335',
        'description': 'Status validation check, for real',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    response = client.put(f'/api/parts/{part_id}', json={
        'status': 'not_a_real_workflow_status',
    }, headers=auth)

    assert response.status_code == 200
    assert response.get_json()['data']['status'] == 'not_a_real_workflow_status'


def test_update_part_changing_only_material_leaves_status_and_description_alone():
    client = get_client()
    admin_token = _admin_token(client)
    auth = {'Authorization': f'Bearer {admin_token}'}

    created = client.post('/api/parts', json={
        'partNumber': '2223336',
        'description': 'Material-only check, for real',
        'material': 'Steel',
    }, headers=auth)
    part_id = created.get_json()['data']['id']

    response = client.put(f'/api/parts/{part_id}', json={'material': 'Titanium'}, headers=auth)

    assert response.status_code == 200
    part = response.get_json()['data']
    assert part['material'] == 'Titanium'
    assert part['description'] == 'Material-only check, for real'
    assert part['status'] == 'draft'
```

`acceptance-tests/test_part_update.py`, in full, with these two real
functions added:

```python
143
144
145 def test_update_part_accepts_any_status_string_with_no_real_validation():
146     client = get_client()
147     admin_token = _admin_token(client)
148     auth = {'Authorization': f'Bearer {admin_token}'}
149
150     created = client.post('/api/parts', json={
151         'partNumber': '2223335',
152         'description': 'Status validation check, for real',
153     }, headers=auth)
154     part_id = created.get_json()['data']['id']
155
156     response = client.put(f'/api/parts/{part_id}', json={
157         'status': 'not_a_real_workflow_status',
158     }, headers=auth)
159
160     assert response.status_code == 200
161     assert response.get_json()['data']['status'] == 'not_a_real_workflow_status'
162
163
164 def test_update_part_changing_only_material_leaves_status_and_description_alone():
165     client = get_client()
166     admin_token = _admin_token(client)
167     auth = {'Authorization': f'Bearer {admin_token}'}
168
169     created = client.post('/api/parts', json={
170         'partNumber': '2223336',
171         'description': 'Material-only check, for real',
172         'material': 'Steel',
173     }, headers=auth)
174     part_id = created.get_json()['data']['id']
175
176     response = client.put(f'/api/parts/{part_id}', json={'material': 'Titanium'}, headers=auth)
177
178     assert response.status_code == 200
179     part = response.get_json()['data']
180     assert part['material'] == 'Titanium'
181     assert part['description'] == 'Material-only check, for real'
182     assert part['status'] == 'draft'
```

### Mechanical Walkthrough

- **Lines 132–136, three real fields in one real request** — real,
  direct proof legacy's own real code applies each real, independent
  check in the same real request, not one real field per call.
- **Line 157, `'status': 'not_a_real_workflow_status'`** — a real,
  deliberately invalid value, matching none of this project's own real
  `Part` model's own real, documented five.
- **Line 160, `assert response.status_code == 200`** — a real, honest
  `200`, not a real `400` — direct, real proof legacy performs no real
  validation on this real field at all.
- **Line 181, `part['description'] == 'Material-only check, for real'`**
  and **line 182, `part['status'] == 'draft'`** — real, direct proof
  this real request, naming only `material`, left both real, other
  fields real, exactly as this real part was created — `'draft'` being
  this real part's own real, default status, never explicitly set at
  all.

### CS Lens

This is the identical real **field-level granularity** this slice's
own favorite-toggle lesson already named in full, now confirmed across
every real field this route touches, not just one.

Also recognized in: the identical real examples this slice's own
favorite-toggle lesson already gave.

### SE Lens

The real, deliberately *not*-taken alternative here: treating the
missing real `status` validation as a real bug, labeling `rebuild`'s
own future real port **Correct**. Rejected on purpose — this is a
real, genuine gap (any real client could set a real part's own
`status` to complete nonsense), but no real, current test in this
project requires real enum validation, and inventing one now, with no
real, stated product requirement behind it, would be real, speculative
scope creep, not a real bug fix. This real gap is named honestly here,
Preserved as-is, and left as a real, explicit candidate for a real,
later lesson if a real, stated requirement ever needs it.

### Commands needed

```powershell
cd manufacturing-platform
$env:ACCEPTANCE_TARGET='legacy'; backend\.venv\Scripts\python.exe -m pytest acceptance-tests/test_part_update.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether legacy genuinely performs no real
`status` validation, and whether three real fields changed together
behave identically to one changed alone — so this was actually run
this session, against legacy:

```
test_part_update.py::test_update_part_changes_description_material_and_status_together PASSED
test_part_update.py::test_update_part_accepts_any_status_string_with_no_real_validation PASSED
test_part_update.py::test_update_part_changing_only_material_leaves_status_and_description_alone PASSED

3 passed in ...s
```

Also confirmed, this session, against `rebuild`'s own current, real
state: all three real assertions fail — `rebuild`'s own real
`update_part`, as this slice's own favorite-toggle lesson left it,
only ever checks for `isFavorite`, so a real `description`, `material`,
or `status` value sent today is silently, real and completely ignored.

### Connecting this unit to what came before

The favorite-toggle lesson proved one real field's own, isolated
contract. This unit completes the real picture for every field this
slice actually needs, and finds this route's one real, honest gap.

---

## Connect the pieces

Three more real, distinct, now-automated claims about the same one
real route this slice already proved works for `isFavorite`: three
real fields change together correctly, one real field changes alone
without disturbing its real siblings, and `status` accepts anything at
all, with no real, server-side validation — proven against legacy and
proven, honestly, not yet true against `rebuild`.

---

**Next lesson:** the real, smallest backend change making all three of
this lesson's own real tests pass against `rebuild`.
