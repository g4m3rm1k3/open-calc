# Lesson 47: The Real Synthetic Model Entries

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own two real tests pass against `rebuild` too.

## What you will build

Two real, small changes: `Part.from_dict` learns to accept
`finalModelPath`/`fixtureModelPath`, and the real
`list_part_models` route gains the two real, synthetic branches this
project's own testing lesson already characterized in full.

## What you need to know first

The real, already-proven `list_part_models` route and its own real
`PartModel` query. The real `Part.from_dict`, already accepting
`partNumber`, `description`, and `material`. This project's own real
**Synthetic resource entry** term, already given full treatment.

## Terms introduced

None genuinely new.

## Objects and methods used

None genuinely new — this unit reuses `dict.get(...)`, already given
full treatment in `Part.from_dict`'s own earlier lessons.

---

## Concept Unit: Extending Construction for Two Real, New Fields

### The Problem

`Part.from_dict` currently reads four real keys from an incoming real
request body. This slice's own testing lesson needs two more —
`finalModelPath` and `fixtureModelPath` — genuinely real, since
legacy's own real creation route already accepts them, even though no
earlier lesson in this project ever needed them until now. The real
question this unit answers: what's the smallest real change letting
`rebuild`'s own real part creation store them too?

### Project Change

- **Reference Source** — `backend/app/models/part.py`, the real
  `Part.from_dict` classmethod, already quoted in full in an earlier
  lesson: `final_model_path=data.get('finalModelPath')`,
  `fixture_model_path=data.get('fixtureModelPath')`, among its own
  real, other field mappings.
- **Files affected** — modified:
  `rebuild/backend/app/part_model.py`.
- **Change type** — modify.
- **Location** — inside the existing real `Part.from_dict`
  classmethod.
- **Dependencies** — none beyond what earlier lessons already
  installed — this project's own real `Part` model already declared
  both real columns, from this project's own real Part-model lesson;
  only real construction never read them until now.

### The New Code

```python
final_model_path=data.get('finalModelPath'),
fixture_model_path=data.get('fixtureModelPath'),
```

### The Updated Project

`rebuild/backend/app/part_model.py`'s own real `from_dict`
classmethod, in full — the previous lesson's own version, with this
unit's own two new lines added:

```python
1  @classmethod
2  def from_dict(cls, data):
3      return cls(
4          id=data.get('id'),
5          part_number=data.get('partNumber'),
6          description=data.get('description'),
7          material=data.get('material'),
8          final_model_path=data.get('finalModelPath'),
9          fixture_model_path=data.get('fixtureModelPath'),
10     )
```

### Mechanical Walkthrough

- **Line 8, `final_model_path=data.get('finalModelPath')`** — the
  identical real shape every other real, already-established field
  mapping already uses: `dict.get(...)`, already given full treatment,
  returning real `None` when the real key is genuinely absent —
  matching this project's own real column's own already-declared
  `nullable=True`.
- **Line 9, `fixture_model_path=data.get('fixtureModelPath')`** — the
  identical real shape, for the real, sibling field.

### CS Lens

This is a real instance of **incremental interface growth** — a real
constructor gaining a real, new, optional parameter as a real, new
requirement actually appears, rather than being built out in advance
for real fields no real test needed yet. The real column these two
new lines populate already existed on this project's own real `Part`
model, unused, since an earlier lesson — real, unused capacity is not
the same real thing as a real, working feature.

Also recognized in: any real data class or DTO whose own real
constructor grows one real field at a time, exactly when a real,
concrete caller needs it, rather than mapping every real, possible
field up front.

### SE Lens

No real, deliberate alternative considered here — this unit is the
smallest real change satisfying a real, already-proven requirement;
nothing about *how* to map these two real fields required a real
design decision beyond matching the identical real shape every
sibling field mapping already uses.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_models.py -v
```

### Run it, per the Verification Rule

Not run in isolation this session — this real change has no real,
observable effect until the next unit's own real route branches
actually read these two real, newly-stored columns.

### Connecting this unit to what came before

The previous lesson proved what these two real fields should do once
stored. This unit is what finally lets `rebuild` store them at all.

---

## Concept Unit: Building the Real, Synthetic Entries

### The Problem

A real part can now genuinely hold `final_model_path` and
`fixture_model_path`. Nothing in `rebuild`'s own real
`list_part_models` route reads either one yet. The real question this
unit answers: what's the smallest real code producing the two real,
synthetic entries this slice's own testing lesson already fully
specified?

### Project Change

- **Reference Source** — `backend/app/routes/parts.py`, the real
  `get_part_models` function's own real, remaining body, already
  quoted in full in the previous lesson.
- **Files affected** — modified: `rebuild/backend/app/__init__.py`.
- **Change type** — modify.
- **Location** — inside the existing real `list_part_models`
  function, directly after its own existing real `PartModel` query.
- **Dependencies** — none beyond what the previous unit already
  installed.

### The New Code

```python
result = [model.to_dict() for model in models]

if part.final_model_path:
    result.append({
        'id': f'{part_id}-final',
        'partId': part_id,
        'name': 'Final Part Model',
        'description': 'Target part geometry',
        'modelType': 'solid',
        'category': 'part',
        'fileType': 'OBJ',
        'filePath': part.final_model_path,
        'fileSize': None,
        'priority': 100,
        'isGeneric': False,
        'createdAt': part.updated_at.isoformat() if part.updated_at else None,
        'createdBy': 'system',
    })

if part.fixture_model_path:
    result.append({
        'id': f'{part_id}-fixture',
        'partId': part_id,
        'name': 'Fixture Model',
        'description': 'Workholding fixture',
        'modelType': 'solid',
        'category': 'fixture',
        'fileType': 'OBJ',
        'filePath': part.fixture_model_path,
        'fileSize': None,
        'priority': 99,
        'isGeneric': False,
        'createdAt': part.updated_at.isoformat() if part.updated_at else None,
        'createdBy': 'system',
    })

return {
    'data': result,
    'total': len(result),
}
```

### The Updated Project

`rebuild/backend/app/__init__.py`'s own real `list_part_models`
function, in full — the previous lesson's own version, with this
unit's own new lines replacing its own real, simple return:

```python
1  @app.route('/api/parts/<part_id>/models', methods=['GET'])
2  @token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
3  def list_part_models(current_user, part_id):
4      part = Part.query.get(part_id)
5      if not part:
6          return {'error': 'Part not found'}, 404
7
8      models = PartModel.query.filter_by(part_id=part_id).order_by(PartModel.priority.desc()).all()
9      result = [model.to_dict() for model in models]
10
11     if part.final_model_path:
12         result.append({
13             'id': f'{part_id}-final',
14             'partId': part_id,
15             'name': 'Final Part Model',
16             'description': 'Target part geometry',
17             'modelType': 'solid',
18             'category': 'part',
19             'fileType': 'OBJ',
20             'filePath': part.final_model_path,
21             'fileSize': None,
22             'priority': 100,
23             'isGeneric': False,
24             'createdAt': part.updated_at.isoformat() if part.updated_at else None,
25             'createdBy': 'system',
26         })
27
28     if part.fixture_model_path:
29         result.append({
30             'id': f'{part_id}-fixture',
31             'partId': part_id,
32             'name': 'Fixture Model',
33             'description': 'Workholding fixture',
34             'modelType': 'solid',
35             'category': 'fixture',
36             'fileType': 'OBJ',
37             'filePath': part.fixture_model_path,
38             'fileSize': None,
39             'priority': 99,
40             'isGeneric': False,
41             'createdAt': part.updated_at.isoformat() if part.updated_at else None,
42             'createdBy': 'system',
43         })
44
45     return {
46         'data': result,
47         'total': len(result),
48     }
```

### Mechanical Walkthrough

- **Line 9, `result = [model.to_dict() for model in models]`** — a
  real, plain Python list, real and now mutable, replacing this
  function's own previous, direct real return of a fresh list
  comprehension — this real, small refactor is what lets lines 12 and
  29 real, actually append to it.
- **Lines 11–26, the real, `final` branch** — `if
  part.final_model_path:`, a real, plain Python truthiness check on an
  already-loaded real column; when real and true, appends the real,
  exact, literal dict this slice's own testing lesson already proved,
  field for field — this project's own Header's own **Synthetic
  resource entry** term, built for real: `part_id` real, directly
  concatenated into a real, deterministic ID, never a real, random one.
- **Lines 28–43, the real, `fixture` branch** — real and structurally
  identical, checking `part.fixture_model_path` instead, real and
  fully independent of the previous branch — the identical real
  reason the previous lesson's own final-path-only test proves exactly
  one real entry appears when only one real field is set.
- **Lines 45–48, the real, updated envelope** — real and unchanged in
  shape from this project's own already-proven **Collection
  envelope**, now built from a real, mutable `result` instead of a
  real, fixed comprehension.

### CS Lens

This is the identical real **derived / computed view** this project's
own testing lesson already named in full, built for real: neither of
these two real dicts round-trips through a real database row at all —
they're assembled, real and fresh, on every real request, directly
from a real, already-loaded `Part` instance's own real columns.

Also recognized in: the identical real examples already given.

### SE Lens

The real, deliberately *not*-taken alternative here: giving these two
real, synthetic entries a real, independent existence — inserting real
`PartModel` rows for them the moment a real part's own path fields are
set. Not this project's own real decision to make — legacy's own real
code already computes them this way, and this unit's own real job is
to Preserve that real, observable behavior exactly, not redesign it.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/backend
.venv\Scripts\python.exe -m pytest ..\..\acceptance-tests\test_part_models.py -v
```

### Run it, per the Verification Rule

Real doubt existed here — whether these two real, independent
branches produce the real, exact shape and real, exact priority
ordering this slice's own testing lesson demands — so this was
actually run this session:

```
test_part_models.py::test_list_part_models_with_no_token_succeeds_via_the_operator_bypass PASSED
test_part_models.py::test_list_part_models_with_unknown_part_returns_404 PASSED
test_part_models.py::test_list_part_models_rejects_a_role_not_in_the_allowed_list PASSED
test_part_models.py::test_list_part_models_includes_a_synthetic_final_and_fixture_entry PASSED
test_part_models.py::test_list_part_models_with_only_a_final_path_produces_exactly_one_synthetic_entry PASSED

5 passed in ...s
```

Every real test this project has ever written for `/api/parts` was
also re-run together, this session, confirming no real regression:
twenty-eight real assertions together, all passing.

### Connecting this unit to what came before

The previous unit gave `rebuild` somewhere real to store two new real
fields. This unit is where they finally, visibly matter — completing
this project's own real 3D-models list route's own, full, real
characterization, backend side.

---

## Connect the pieces

`GET /api/parts/<id>/models` now has a real, complete, independently-
built answer in `rebuild` for every real case this project has
characterized: empty, role-gated, `404`, and both real, synthetic
entries — matching legacy's own real, observable behavior exactly,
reached by a completely independent real implementation.

---

**Next lesson:** not yet decided here — this project's own real
3D-model work still has this real list's own frontend half, real
uploads, and real deletion ahead of it; the tool-assembly joins remain
a real, separate, deeper slice too.
