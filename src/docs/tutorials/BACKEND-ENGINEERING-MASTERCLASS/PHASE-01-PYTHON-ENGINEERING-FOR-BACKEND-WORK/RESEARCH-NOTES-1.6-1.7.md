# Research notes — Lessons 1.6 and 1.7

Raw, verified findings gathered before authoring. Purpose: if the session
ends before the lesson YAML is finished, this survives and a future
session can author directly from it instead of re-running research
agents. Delete this file once both lessons are authored, compiled, and
committed.

All file:line citations below were read directly this session (not just
agent-reported) unless marked otherwise.

## Lesson 1.6 — Dataclasses and Value Objects

**Real `@dataclass` usage** — `backend/app/services/stl_scaffold_service.py:20-70`:
```python
import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from app.models.cam_file import CAMFile
from app.models.sequence import Sequence


@dataclass(frozen=True)
class OperationScaffoldItem:
    """Value Object representing a single subprogram's scaffold files.
    Immutable to ensure domain integrity."""
    subprogram: str           # e.g., "O1103"
    operation_num: str        # e.g., "1" (first digit - the operation)
    sequence_number: int      # Order in XML
    stock_filename: str       # e.g., "O1103_stock.stl" (per subprogram)
    part_filename: str        # e.g., "O1_part.stl" (per operation - shared)
    fixture_filename: str     # e.g., "O1_fixture.stl" (per operation - shared)
    operation_id: str         # Database ID for upload mapping


@dataclass(frozen=True)
class ScaffoldManifest:
    """Value Object representing the complete scaffold manifest."""
    cam_file_id: str
    part_id: str
    folder_path: str
    operations: List[OperationScaffoldItem]

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary for JSON export."""
        ...
```

**Ad hoc dict bundle (the "before" state)** — `backend/app/services/cam_import_service.py:99-108`, inside `CAMImportService.handle_xml_import` (a `@staticmethod`):
```python
        return {
            'camFile': cam_file.to_dict(include_sequences=True),
            'ncFilesCreated': len(parsed_data['nc_files']),
            'sequencesCount': len(parsed_data['sequences']),
            'operationsCount': sum(len(s['operations']) for s in parsed_data['sequences']),
            'toolAssembliesCreated': len(parsed_data['tool_assemblies']),
            'metadata': parsed_data['metadata'],
            'warnings': warnings,
            'recommendations': recommendations
        }
```
Consumed at `backend/app/routes/cam_files.py:196-197`:
```python
        result = CAMImportService.handle_xml_import(cam_file_id, request.files['xml'])
        return jsonify({'message': 'XML imported successfully', 'data': result}), 200
```

**Drifted duplicate description (real bug)** — `backend/app/schemas.py:97-108`:
```python
class XMLImportResponse(BaseModel):
    """Response schema for successful XML import."""
    message: str
    cam_file: CAMFileSchema = Field(alias='camFile')
    nc_files_created: int = Field(alias='ncFilesCreated', ge=0)
    sequences_count: int = Field(alias='sequencesCount', ge=0)
    operations_count: int = Field(alias='operationsCount', ge=0)
    metadata: dict

    class Config:
        populate_by_name = True
```
Verified this session via grep: `XMLImportResponse` appears ONLY at its own
definition line (`schemas.py:97`) — never imported or used anywhere else
in `backend/`. It's missing `toolAssembliesCreated`, `warnings`,
`recommendations` (present in the real returned dict above) — two
independent, hand-written descriptions of "the same" shape, already
disagreeing, and the schema is unused/dead besides.

**Domain object contrast** — `backend/app/models/user.py` (full file, verified):
```python
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(50), primary_key=True)  # email or username
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(200), nullable=True)
    role = db.Column(db.String(20), default='operator')  # operator, engineer, manager, admin

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    must_change_password = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id, 'email': self.email, 'name': self.name, 'role': self.role,
            'mustChangePassword': self.must_change_password,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }
```

**Verified runtime facts (this session, plain `python -c`):**
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: int
    y: int

p1 = Point(1, 2); p2 = Point(1, 2)
print(p1)          # Point(x=1, y=2)
print(p1 == p2)     # True  (real value equality, auto-generated)
print(p1 is p2)     # False (different objects)
p1.x = 99            # raises FrozenInstanceError: cannot assign to field 'x'
```
```python
from werkzeug.security import generate_password_hash, check_password_hash
h1 = generate_password_hash('hunter2')
h2 = generate_password_hash('hunter2')
print(h1 == h2)                       # False (real salt differs per call)
print(check_password_hash(h1, 'hunter2'))  # True
print(check_password_hash(h1, 'wrong'))    # False
print(h1[:20])                        # 'scrypt:32768:8:1$P06' (real prefix)
```

**No real tuple-as-bundle found anywhere in backend/app** (confirmed by
agent search of routes/services/models for `return x, y` / `return (x,
y, ...)` patterns — the one `return (...)` hit, `backend/app/__init__.py:367`,
is a boolean expression, not a value bundle). Any tuple-bundle
demonstration needs a standalone lab.

**Planned unit structure for 1.6:**
1. Ad hoc dict bundle (`handle_xml_import`'s return dict) — the "primitive
   values loosely bundled into a dict" starting point.
2. The drift bug (`XMLImportResponse` vs. the real dict) — citation-only,
   no lab needed; the teaching point is structural/comparison, not
   behavioral, so citation_vs_walkthrough's classification exemption
   applies.
3. Dataclasses as the fix (`OperationScaffoldItem`/`ScaffoldManifest`) —
   throwaway lab first (the `Point` example above, run for real), then
   real project code. Ties immutability back to Lesson 1.4's tuple unit.
4. Domain objects (`User`) — throwaway lab reproducing the real
   `generate_password_hash`/`check_password_hash` calls (avoids needing a
   full Flask/DB app context), then real `User.set_password`/
   `check_password` as the project code, contrasting mutable identity +
   behavior against a frozen dataclass's pure immutable bundle.

## Lesson 1.7 — Iteration and Transformation

**`map()` — the only real use in the codebase**, `backend/app/routes/nc_files.py:545`
(also identical at line ~606 in a batch variant — not yet independently
re-read this session, only agent-reported):
```python
v_major, v_minor = map(int, nc_file.version.split('.'))
```

**`sorted(..., key=itemgetter(...))` + `itertools.groupby`** —
`backend/app/routes/cam_files.py:1-14` (imports) and `:104-107`:
```python
from itertools import groupby
from operator import itemgetter
...
@cam_files_bp.route('/<string:cam_file_id>', methods=['GET'])
@token_required(allowed_roles=['operator', 'quality', 'programming', 'admin'])
def get_cam_file(current_user, cam_file_id: str):
    """Get a single CAM file with sequences."""
    view = request.args.get('view', 'linear')
    cam_file = CAMFile.query.get(cam_file_id)
    if not cam_file: return jsonify({'error': 'CAM file not found'}), 404

    data = cam_file.to_dict(include_sequences=False)
    if view == 'subprogram':
        sequences_data = sorted([s.to_dict(include_operations=True) for s in cam_file.sequences], key=itemgetter('program_number'))
        data['grouped_sequences'] = [{"program_number": k, "sequences": list(g)} for k, g in groupby(sequences_data, key=itemgetter('program_number'))]
    else:
        data['sequences'] = [s.to_dict(include_operations=True) for s in cam_file.sequences]
    return jsonify({'data': data})
```
Real "must sort before groupby" example (`itertools.groupby` only groups
consecutive runs — sorting first is what makes this correct).

**`sorted(..., key=lambda ...)`** — `backend/app/routes/operation_manager.py:328-332`:
```python
            sequences_data = []
            sorted_seq_ids = sorted(
                sequence_operations.keys(),
                key=lambda x: sequence_first_appearance.get(x, 9999)
            )
```

**Filter + transform in one comprehension** — `backend/app/routes/machines.py:265-266`
(verified full context):
```python
    locations = db.session.query(Machine.location).distinct().filter(Machine.location.isnot(None)).all()
    location_list = [loc[0] for loc in locations if loc[0]]

    return jsonify({
        'data': sorted(location_list),
        'total': len(location_list)
    })
```
`loc[0]` unpacks a real SQLAlchemy result tuple (transform) while `if
loc[0]` drops falsy locations (filter) — two different real jobs in one
line, plus a real `sorted()` call with no explicit key right after.

Secondary, not yet re-verified directly this session (agent-reported only):
`backend/app/routes/bootstrap.py:44`: `'locations': [m.location for m in machines if m.location],`

**Already have from Lesson 1.4 (don't re-research, just re-cite fresh
per lesson, per Repetition Rule):** `tool_assemblies.py`'s manual
group-by-part-then-cam-file loop (~lines 86-121), and
`operation_manager.py`'s `_build_export_data`/
`_apply_customizations_to_sequences` (~lines 815-940).

**Planned unit structure for 1.7:**
1. Comprehensions as the default transform (revisit territory from 1.4
   briefly from a NEW angle: transformation as its own concept, not data-
   structure identity) — probably lean on `machines.py:266`'s
   filter+transform-in-one-line as the fresh example.
2. `map()` — real but narrow use (`nc_files.py:545`); SE lens: why this
   codebase reaches for comprehensions instead of `map` almost
   everywhere else.
3. Sorting with a real key — `operation_manager.py`'s lambda-key example
   and/or `cam_files.py`'s `itemgetter` example (contrast lambda vs named
   key extractor).
4. Grouping with `itertools.groupby` — `cam_files.py:104-107`, the real
   "must sort first" dependency on unit 3.
5. Closing connection to the masterclass's own explicit instruction:
   "connect directly to the legacy route code that performs nested
   grouping and transformation inline" — tie back to `tool_assemblies.py`/
   `operation_manager.py` from 1.4, this time asking "which of THIS
   lesson's constructs (map/filter/sort/groupby) is doing which job in
   that manual loop, if any — and which job has no clean equivalent,
   which is why it's still a manual loop."
