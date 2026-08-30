# Lesson 1.6: Dataclasses and Value Objects

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** No new backend feature - this lesson reads a real, already-existing progression already present in this backend: an ad hoc dict bundle (`backend/app/services/cam_import_service.py`), a second, independently written description of that same shape that has already drifted out of sync with it (`backend/app/schemas.py`), a real `@dataclass(frozen=True)` pair that replaces exactly this problem elsewhere in the same codebase (`backend/app/services/stl_scaffold_service.py`), and a real ORM model (`backend/app/models/user.py`) whose own real, mutable behavior shows why a frozen dataclass isn't always the right choice either.

**What you need to know first:** Reading a real, existing file as evidence for what a function actually does; dict/list/set/tuple, and which of them is mutable; a function parameter's real type annotation.

## Terms used in this lesson

- **Value object** — A real bundle of data whose own identity IS its values - two value objects holding the identical real data are considered the same, interchangeably, with no separate real identity tracked beyond what they actually hold. It exists as its own concept because a real program often needs to distinguish this case (a computed result, a coordinate, a fixed set of related fields describing one real thing) from a case where two objects holding identical data right now are still genuinely different real things - the next unit's own real contrast.
- **Domain object** — A real bundle of data with its own persistent identity, tracked separately from its current values, usually carrying real behavior (methods that do more than just return a stored field) and expected to change over its own real lifetime while remaining "the same" real thing throughout. It exists as its own concept because a value object's own core property - sameness determined purely by current values - is exactly wrong for something like a real user account, whose password, name, or login time can all genuinely change while it's still unambiguously the same real account throughout.

## Objects and methods used

- **`dataclasses.dataclass`**
  - *What it is:* A real class decorator from the standard library `dataclasses` module that generates several real methods from a class's own field declarations.
  - *Implementation:* `@dataclass` (real fields = the class's own annotated attributes) or `@dataclass(frozen=True)` (the same, plus real immutability) - confirmed this session.
  - *Its use:* This lesson's third unit uses it to replace a real, ad hoc dict bundle - and a real, second, independently drifted description of that same bundle - with one single real declaration.
  - *Type:* A class decorator, part of the standard library `dataclasses` module.
  - *Responsibility:* Generate, from a class's own real, annotated field declarations, a real `__init__` (accepting exactly those fields), a real `__repr__` (showing every field's real current value), and a real `__eq__` (comparing two instances by their actual field values, not by object identity) - confirmed this session directly, not merely asserted.
  - *Depends on:* A class whose own body is written as plain, real type-annotated field declarations - the exact same annotation syntax this lesson's own prior lesson (Type Hints) already covered in full.
  - *Connects to:* `frozen=True` makes every generated field genuinely immutable after construction - the identical real property this lesson's own prior-lesson tuple already had, applied here to a real, named, multi-field class instead of a fixed-position sequence.
  - *Shape:* Takes zero required arguments as a bare `@dataclass`, or real keyword arguments (`frozen=True`, among others) as `@dataclass(...)`; applied directly above a real `class` statement, never called on an already-defined class after the fact.

- **`OperationScaffoldItem`**
  - *What it is:* A real, already-existing `@dataclass(frozen=True)` in this backend, the exact real fix this lesson's own third unit reaches for.
  - *Implementation:* Defined at `backend/app/services/stl_scaffold_service.py:33`, seven real, annotated fields, no methods of its own.
  - *Its use:* This lesson's third unit reads it as real, already-shipped proof that this exact fix - one real dataclass declaration, replacing an ad hoc dict and a second, drifted description - is not hypothetical; this backend already made this exact choice elsewhere.
  - *Type:* A real, frozen dataclass, defined in `backend/app/services/stl_scaffold_service.py`.
  - *Responsibility:* Hold seven real, related values describing one real subprogram's own scaffold files together, immutably, as a single real unit - explicitly documented, in the real file's own docstring, as a 'Value Object.'
  - *Depends on:* The `dataclasses.dataclass` decorator, above, and Python's own real type-annotation syntax on each of its seven fields.
  - *Connects to:* Nested directly inside `ScaffoldManifest`, a second real `@dataclass(frozen=True)` in the same real file, via a real `List[OperationScaffoldItem]` field - a dataclass containing a real list of another dataclass, the identical nested-collection-type-hint shape this lesson's own prior lesson already covered for `List[Dict[str, Any]]`.
  - *Shape:* Constructed with exactly seven real positional or keyword arguments, one per declared field, in the real order they're declared - a real `TypeError` results from too few, too many, or an unrecognized keyword, the same way any real dataclass-generated `__init__` behaves.

- **`generate_password_hash`**
  - *What it is:* A real function from Flask's own real dependency, `werkzeug.security`, that turns a real plaintext password into a real, salted hash.
  - *Implementation:* `generate_password_hash(password: str) -> str` - confirmed this session to include a real, randomly generated salt each call, via `werkzeug`'s own `scrypt` algorithm.
  - *Its use:* This lesson's fourth unit uses it to reproduce, in an isolated real lab, exactly what `User.set_password` (below) does internally with a real password, before returning to that real method itself.
  - *Type:* A free function, part of the real `werkzeug.security` module (already a real dependency of this Flask backend).
  - *Responsibility:* Return a real, one-way hash string that encodes the real algorithm used, its real parameters, a real random salt, and the real resulting hash - never the original plaintext password itself, and never the identical string twice in a row even for the identical real password.
  - *Depends on:* Nothing beyond the real plaintext string passed in.
  - *Connects to:* Its own real output is what `User.set_password` stores directly into the real `password_hash` column - never the original plaintext, which this real class never stores anywhere at all.
  - *Shape:* Takes one real string in; returns one real string out, confirmed this session to differ between two calls with the identical real input, because of its own real random salt.

- **`check_password_hash`**
  - *What it is:* The real matching function from `werkzeug.security` that verifies a real plaintext password against an already-generated real hash.
  - *Implementation:* `check_password_hash(pwhash: str, password: str) -> bool` - confirmed this session.
  - *Its use:* This lesson's fourth unit uses it to confirm, in the same isolated real lab, that a real hash generated from one password verifies correctly against that same real password and fails against a real wrong one - before returning to `User.check_password`, which calls this exact real function.
  - *Type:* A free function, part of the real `werkzeug.security` module.
  - *Responsibility:* Return a real `True`/`False` - never the original password, and never requiring the real salt to be tracked separately, since `generate_password_hash`'s own real output already encodes it.
  - *Depends on:* A real hash string already produced by `generate_password_hash`, and the real plaintext password being checked against it.
  - *Connects to:* Called directly inside `User.check_password`'s own real body, below, with `self.password_hash` (the real, already-stored hash) and the real password argument passed in.
  - *Shape:* Takes two real strings in (hash, then plaintext); returns one real bool - confirmed this session to return `True` for the real matching password and `False` for a real wrong one, using the identical real hash both times.

## Concept Unit: Ad Hoc Dict Bundles - Several Fixed Values With No Named Shape

### The Problem

`CAMImportService.handle_xml_import` needs to hand back several real, fixed, related pieces of information about one real import - not a single value, and not a real database row either. A dict (this lesson's own prior-lesson construct) is what's already at hand for bundling values together - but nothing about a plain dict states, anywhere a reader or a tool can check, exactly which real keys are actually supposed to be there.

Before reading on:

- If a real caller wrote `result.get("Count")` instead of the real key `result["ncFilesCreated"]` uses, what real, concrete thing would happen - an error immediately, or something quieter?
- Given a real dict with eight real keys, what real, concrete document (if any) currently states, in one place, that all eight are actually supposed to be there?

### Project Change

- **Reference Source:** `backend/app/services/cam_import_service.py:99-108` and `backend/app/routes/cam_files.py:188-197`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_dict_bundle.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - Python's own built-in `dict` type only.

`handle_xml_import` builds and returns a real, eight-key dict bundling everything one real XML import actually produced - a new CAM file's own dict form, several real counts, the real metadata parsed from the file, and real warnings/recommendations lists. `import_xml`, the real route calling it, passes that same real dict straight through as the real JSON response's own `data` key.

### The New Code

A small, real, throwaway bundle with the identical real shape - several fixed keys built once, then read back two ways, one correct and one typo'd:

**File:** `verification/phase-01/lab_dict_bundle.py` (new)

```python
def build_summary(name, count, warnings):
    return {
        "name": name,
        "count": count,
        "warnings": warnings,
    }

summary = build_summary("import-42", 3, [])
print(summary.get("count"))
print(summary.get("Count"))
```

### The Updated Project

The real project code this lab's own shape reproduces - a real eight-key dict, built once and handed straight through to a real JSON response:

**File:** `backend/app/services/cam_import_service.py (lines 99-108)` (already exists — read-only, nothing to type)

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

**File:** `backend/app/routes/cam_files.py (lines 195-197)` (already exists — read-only, nothing to type)

```python
result = CAMImportService.handle_xml_import(cam_file_id, request.files['xml'])
return jsonify({'message': 'XML imported successfully', 'data': result}), 200
```

### Mechanical Walkthrough

- `summary = build_summary("import-42", 3, [])` — Builds a real, three-key dict bundle - the identical real pattern as `handle_xml_import`'s own return value, at minimal scale.
- `print(summary.get("count"))` — The real, correct key - `.get()` (already fully covered in this lesson's own prior-lesson Dictionaries unit) returns the real stored value, `3`.
- `print(summary.get("Count"))` — A real, one-character typo - capital `C` instead of lowercase - `.get()`'s own real default behavior (`None` when a key is genuinely absent) makes this typo indistinguishable from a real, legitimately-missing key: no error, no warning, just a quiet, wrong `None`.
- `return { 'camFile': ..., 'ncFilesCreated': ..., ... }` — The real, eight-key version of the identical pattern - built once, in one real place, with nothing anywhere stating these exact eight keys are the real, complete, required shape other than this one function's own body.
- `result = CAMImportService.handle_xml_import(...); return jsonify({'message': ..., 'data': result}), 200` — The real dict, unpacked into no explicit shape at all before being sent - `jsonify` accepts any real, JSON-serializable structure, so nothing here would catch a typo'd key on either side of this real call either.

### CS Lens

An ad hoc dict bundle is a real, structurally-untyped record - a real collection of named fields with no separate, checkable declaration of what those names and types are supposed to be. Also recognized in: a real CSV file with no header row (every reader has to already know what column 3 means), a loosely-typed JSON blob before any real schema is applied to it, and a real key-value store where nothing enforces which keys a given "kind" of record is supposed to carry.

### SE Lens

The real cost this unit's own lab just demonstrated: a one-letter typo, `\"Count\"` instead of `\"count\"`, produced no error at all - just a quiet, wrong `None`, indistinguishable from a real, legitimately-absent key. Correctness here depends entirely on every real reader and writer agreeing, by convention alone, on exactly which keys exist - nothing actually checks that agreement, and this lesson's own next unit shows a real, already-existing case where that agreement has already quietly broken.

### Commands needed

- `python verification/phase-01/lab_dict_bundle.py` — Run from the manufacturing-platform repository root.

### Verification

```text
3
None
```

Full saved run: `verification/phase-01/lab_dict_bundle_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: When an Ad Hoc Bundle Drifts - Two Real, Disagreeing Descriptions of One Shape

### The Problem

This backend doesn't just have one real, ad hoc description of this exact eight-key shape - it has a second one, written independently, in `backend/app/schemas.py`. Reading both real descriptions side by side shows they no longer agree.

Before reading on:

- Given the real dict above has eight real keys, and a second, real class elsewhere in this codebase declares fields for only some of them, what real, concrete situation would actually expose that gap to a caller relying on the second description instead of the first?
- If a real class describing this exact shape is never actually imported or used anywhere else in the codebase, what real, different problem is that - separate from the fields already disagreeing?

### Project Change

- **Reference Source:** `backend/app/schemas.py:97-108`, real, already-existing code, read and quoted verbatim this session, compared directly against `cam_import_service.py:99-108` from the unit above (already fully shown there - repeated here only for direct side-by-side comparison, per this project's own no-eliding rule).
- **Files affected:** `backend/app/schemas.py` (none)
- **Change type:** none
- **Location:** No change - a real, structural comparison of two already-existing files.
- **Dependencies:** None.

`XMLImportResponse`, a real Pydantic model, independently declares its own version of this same shape - `cam_file`, `nc_files_created`, `sequences_count`, `operations_count`, `metadata` - but is missing three real keys the actual dict includes: `toolAssembliesCreated`, `warnings`, `recommendations`. A repository-wide search this session confirms `XMLImportResponse` is never imported or referenced anywhere outside its own definition line - a second, drifted description, currently unused by anything.

### The Updated Project

The real, second description, compared directly against the real dict from the unit above:

**File:** `backend/app/services/cam_import_service.py (lines 99-108)` (already exists — read-only, nothing to type)

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

**File:** `backend/app/schemas.py (lines 97-108)` (already exists — read-only, nothing to type)

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

### Mechanical Walkthrough

- `cam_file: CAMFileSchema = Field(alias='camFile'); nc_files_created: int = Field(alias='ncFilesCreated', ge=0); ...` — Four of the real dict's eight keys are represented here, each under a real, separately-chosen Python-side name (`nc_files_created`) mapped back to the real JSON key (`ncFilesCreated`) via a real `Field(alias=...)` - a second, independent real naming decision on top of the original.
- `metadata: dict` — The one real key given no further real shape at all here - `dict`, with no type arguments, the identical bare form this lesson's own prior lesson already showed states nothing about what's actually inside.
- `toolAssembliesCreated, warnings, recommendations - absent` — Three real keys the actual returned dict includes are simply not declared anywhere in this second description at all - not wrong, just genuinely missing; a real caller trusting this schema's own declared shape would have no way to know these three real values even exist.

### CS Lens

Two independent, hand-written encodings of what's supposed to be one real data model. Also recognized in: two microservices each maintaining their own separate copy of a shared entity's real schema, a database replica whose own schema migration was applied inconsistently against the primary, and duplicated real API definitions (an OpenAPI spec and the actual server code it's meant to describe) that quietly drift apart over time.

### SE Lens

The real cost of two hand-maintained descriptions of the same shape isn't hypothetical here - they have already drifted, and nothing in this codebase currently catches it, because `XMLImportResponse` is never actually used to validate anything real. Even if it WERE used, a caller trusting its own declared shape would be quietly missing three real fields the actual response includes. This is exactly the real problem this lesson's next unit's own fix - one real declaration, not two - is built to remove: not by making the single declaration more careful, but by making a second, independently drifting one impossible to write in the first place.

### Verification

This unit's own real teaching point is structural - which real keys each of two already-existing descriptions declares, and which of the actual dict's eight keys are missing from the second one - established directly by reading both real files, already quoted above in full. This does NOT establish anything about runtime behavior (whether either shape is actually validated against real data anywhere, what a real client currently receives) - only that the two real, already-existing descriptions disagree as written. The one behavioral claim this unit does make - that `XMLImportResponse` is never imported or used anywhere else - was verified this session with a real, repository-wide search, not assumed from reading `schemas.py` alone.

### Connection to the previous unit

The unit above built one real, ad hoc dict bundle and showed a typo could silently slip past it undetected; this unit finds a second, independently-written real description of that same bundle already sitting in this exact codebase, disagreeing with the first - the same underlying risk, already realized for real, not hypothetical.

## Concept Unit: Dataclasses - One Real Declaration Instead of Two

### The Problem

`stl_scaffold_service.py` already solves the exact problem the two units above just found - a bundle of several fixed, related real values - a different way: one real `@dataclass(frozen=True)` declaration, not a dict and a second, separately-maintained schema.

Before reading on:

- Given a real `@dataclass` with fields `x` and `y`, and two real instances built with the identical values, what real, concrete result would you expect comparing them with `==` - and would that be the same real answer a plain dict comparison already gives, or something different?
- If a real dataclass field is accessed by a genuinely typo'd name - `p.z` instead of a real field `p.y` - what real, different outcome would you expect compared to this lesson's own first unit's `summary.get("Count")`?

### Project Change

- **Reference Source:** `backend/app/services/stl_scaffold_service.py:20-70`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_dataclass.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's own standard library `dataclasses` module only.

`OperationScaffoldItem` and `ScaffoldManifest` are real, already- shipped `@dataclass(frozen=True)` classes in this exact backend - not a hypothetical fix, proof this codebase has already made this exact real choice for a comparable bundling problem.

### The New Code

A small, real, throwaway dataclass - compared by value, then tested against the same two real failure modes this lesson's first unit already showed for a plain dict:

**File:** `verification/phase-01/lab_dataclass.py` (new)

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: int
    y: int

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1)
print(p1 == p2)
print(p1 is p2)

try:
    p1.x = 99
except Exception as e:
    print(f"{type(e).__name__}: {e}")

try:
    print(p1.z)
except AttributeError as e:
    print(f"AttributeError: {e}")
```

### The Updated Project

The real, already-shipped fix this lab's own shape reproduces - two real dataclasses, one nested inside the other:

**File:** `backend/app/services/stl_scaffold_service.py (lines 20-66)` (already exists — read-only, nothing to type)

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
    """
    Value Object representing a single subprogram's scaffold files.

    Immutable to ensure domain integrity.
    """
    subprogram: str           # e.g., "O1103"
    operation_num: str        # e.g., "1" (first digit - the operation)
    sequence_number: int      # Order in XML
    stock_filename: str       # e.g., "O1103_stock.stl" (per subprogram)
    part_filename: str        # e.g., "O1_part.stl" (per operation - shared)
    fixture_filename: str     # e.g., "O1_fixture.stl" (per operation - shared)
    operation_id: str         # Database ID for upload mapping


@dataclass(frozen=True)
class ScaffoldManifest:
    """
    Value Object representing the complete scaffold manifest.
    """
    cam_file_id: str
    part_id: str
    folder_path: str
    operations: List[OperationScaffoldItem]

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary for JSON export."""
```

### Mechanical Walkthrough

- `@dataclass(frozen=True) class Point: x: int; y: int` — Two real, annotated field declarations - the identical annotation syntax this lesson's own prior lesson (Type Hints) already covered - are all this class's own body needs; `@dataclass` generates a real `__init__(self, x, y)`, `__repr__`, and `__eq__` from exactly these two declarations, confirmed by every line below.
- `print(p1)` — The real, auto-generated `__repr__` - `Point(x=1, y=2)` - showing every real field's own current value, never written by hand.
- `print(p1 == p2)` — `True` - the real, auto-generated `__eq__` compares two instances by their actual real field values, not by object identity; this is a real value object exactly as this lesson's own Terms entry defines one.
- `print(p1 is p2)` — `False` - two genuinely separate real objects in memory, confirming the `True` above came from real value comparison, not from `p1` and `p2` secretly being the same object.
- `p1.x = 99` — `frozen=True` makes every real field immutable after construction - this raises a real `FrozenInstanceError`, never silently succeeding the way assigning a new key onto a plain dict always would.
- `print(p1.z)` — A real, typo'd field name - unlike this lesson's own first unit's `summary.get(\"Count\")`, which returned a quiet, wrong `None`, this raises a real, immediate `AttributeError` naming the exact real object type and the exact missing name - the real, structural fix for the first unit's own demonstrated risk.
- `subprogram: str; operation_num: str; sequence_number: int; ...` — The real, identical pattern as this unit's own `Point` lab, at real project scale - seven real, annotated fields, each one documented in a real, adjacent comment naming its own real example value.
- `operations: List[OperationScaffoldItem]` — A real dataclass field whose own type is a real list of another real dataclass - the identical nested-collection-type shape this lesson's own prior lesson already covered for `List[Dict[str, Any]]`, here holding real, immutable value objects instead of plain dicts.

### CS Lens

A frozen dataclass is a real value object - the exact real concept this lesson's own Terms entry names, and the exact real word this backend's own docstring already uses for both `OperationScaffoldItem` and `ScaffoldManifest`. Also recognized in: an immutable `Money` or `Currency` type in a real financial library, a `datetime.date` object (two dates for the same real calendar day are simply equal, never tracked as separate real identities), and a coordinate/point type in real graphics or GIS code.

### SE Lens

The real fix this unit demonstrates isn't "write the dict more carefully" - it's making the two earlier units' own real failure modes structurally impossible: one real declaration (not two) is the only source of what fields exist, a typo'd field name fails loudly instead of returning a quiet `None`, and `frozen=True` costs real flexibility (no field can ever be changed after construction) in exchange for a real guarantee this lesson's own next unit depends on directly: something a frozen dataclass is NOT well suited for is real data that's actually supposed to change over its own lifetime.

### Commands needed

- `python verification/phase-01/lab_dataclass.py` — Run from the manufacturing-platform repository root.

### Verification

```text
Point(x=1, y=2)
True
False
FrozenInstanceError: cannot assign to field 'x'
AttributeError: 'Point' object has no attribute 'z'
```

Full saved run: `verification/phase-01/lab_dataclass_output.txt`.

### Connection to the previous unit

The unit above found a real, second description of one shape already drifting from the first; this unit reads this exact backend's own already-shipped fix for that same class of problem - one real dataclass declaration, immutable, replacing both the ad hoc dict and any second, independently-written description of it.

## Concept Unit: Domain Objects - When a Bundle Needs Identity and Behavior, Not Just Values

### The Problem

`OperationScaffoldItem` and `ScaffoldManifest` are frozen - a perfect fit for a real bundle fully described by its own current values. A real user account can't work that way: its own password changes, its own login time changes, and it has to remain recognizably the SAME real account throughout - value equality alone can't express that at all.

Before reading on:

- If `User` were built as a frozen dataclass instead, what real, concrete operation would `set_password` - which needs to change `password_hash` on an already-existing real account - no longer be able to do at all?
- Given two real `User` rows with the identical real email, name, and role, would you consider them the same real account - and what real, different question does that ask compared to this lesson's own third unit's `p1 == p2`?

### Project Change

- **Reference Source:** `backend/app/models/user.py`, the complete real file (36 lines), read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_password_hash.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** The real `werkzeug` package - already a real dependency of this Flask backend, confirmed already installed in this session's own environment.

`User` is a real SQLAlchemy model - a real, persisted table row, not a value object - carrying two real methods, `set_password`/`check_password`, whose own real behavior this unit's own lab reproduces first, in isolation, using the exact same real `werkzeug.security` functions `User`'s own methods call internally.

### The New Code

The real, underlying functions `User.set_password`/`check_password` call internally, exercised directly in isolation first:

**File:** `verification/phase-01/lab_password_hash.py` (new)

```python
from werkzeug.security import generate_password_hash, check_password_hash

h1 = generate_password_hash("hunter2")
h2 = generate_password_hash("hunter2")
print(h1 == h2)
print(check_password_hash(h1, "hunter2"))
print(check_password_hash(h1, "wrong"))
print(h1[:20])
```

### The Updated Project

The real, complete `User` model - identity (a real primary key), real mutable state, and the real two methods this unit's own lab already exercised the underlying real functions for:

**File:** `backend/app/models/user.py` (already exists — read-only, nothing to type)

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
```

### Mechanical Walkthrough

- `h1 = generate_password_hash("hunter2"); h2 = generate_password_hash("hunter2")` — Two real calls, identical real input - `generate_password_hash` includes a real, random salt each time, so the two real outputs are expected to differ, confirmed on the very next line.
- `print(h1 == h2)` — `False` - real, direct confirmation the two real hashes genuinely differ, even for the identical real password; unlike this lesson's own `Point` value object, sameness here is deliberately NOT just "identical inputs produce an identical result."
- `print(check_password_hash(h1, "hunter2")); print(check_password_hash(h1, "wrong"))` — `True`, then `False` - `check_password_hash` doesn't need the real salt tracked separately; it's already encoded inside `h1` itself, read back out and used to verify the real plaintext directly.
- `id = db.Column(db.String(50), primary_key=True)` — A real, persistent identity column - the real property a value object never has: two `User` rows are never considered "the same account" merely for holding equal field values the way this lesson's own `Point` instances were; sameness here means the identical real primary key.
- `password_hash = db.Column(db.String(200), nullable=True)` — Real, genuinely mutable state - `nullable=True` because a real account may exist before ever having a password set at all, and this exact column is what `set_password`, below, actually changes.
- `def set_password(self, password): self.password_hash = generate_password_hash(password)` — Real behavior, not just stored data - calls the identical real function this unit's own lab already exercised in isolation, then mutates `self.password_hash` directly; a frozen dataclass could not do this at all, since none of its own fields could ever be reassigned after construction.
- `def check_password(self, password): if not self.password_hash: return False; return check_password_hash(self.password_hash, password)` — Calls the identical real `check_password_hash` this unit's own lab already confirmed returns `True`/`False` correctly - the real `if not self.password_hash:` guard handles the real case (a brand-new account) where no password has ever been set, returning `False` rather than passing `None` into a real function expecting a real hash string.

### CS Lens

`User` is a real entity, not a value object - the exact real distinction this lesson's own Terms entries name, drawn directly from Domain-Driven Design, whose own vocabulary this codebase already uses in its own real comments (`stl_scaffold_service.py`'s own docstring names itself a real "Domain Service"). Also recognized in: a real bank account (its own real balance changes constantly, but it's still unambiguously the same real account throughout, tracked by a real account number) contrasted with a physical $10 bill (any $10 bill is interchangeable with any other - pure value, no tracked identity at all), and a real employee record that survives a real name change while remaining the same real employee.

### SE Lens

The real, honest cost on this side of the contrast: `User` being genuinely mutable means two real references to the same account can each see the other's changes, the identical real aliasing risk this lesson's own prior lessons already covered for a plain mutable dict - freezing `User` the way `OperationScaffoldItem` is frozen would make `set_password` impossible to write at all, since nothing about a real user account is fully described by its values at any one instant; its whole real point is remaining the same tracked thing while some of those values legitimately change over time. The real question this whole lesson has been building toward: not "which of these four is the correct choice," but which one actually matches whether the data in front of you is meant to change while staying itself, or is only ever fully described by what it currently holds.

### Commands needed

- `python verification/phase-01/lab_password_hash.py` — Run from the manufacturing-platform repository root, inside the backend's own real environment, so the real werkzeug dependency is available.

### Verification

```text
False
True
False
scrypt:32768:8:1$OJ0
```

Full saved run: `verification/phase-01/lab_password_hash_output.txt`.

### Connection to the previous unit

The unit above showed a frozen dataclass fixing the exact problem this lesson opened with; this unit reads a real case where freezing would be exactly wrong - a real bundle that needs a persistent identity and real, changing behavior, not just a fixed set of values compared for equality.

## Connect the pieces

One real shape, "what one XML import produced," traced through every real choice this lesson found already made in this backend: as a plain, ad hoc dict (Ad Hoc Dict Bundles), it silently tolerated a typo'd key; as a second, independently hand-written Pydantic schema (When an Ad Hoc Bundle Drifts), it already disagreed with the first, unnoticed, because nothing used it. This lesson's own third unit read this exact backend's own real fix to that class of problem elsewhere - `OperationScaffoldItem`/`ScaffoldManifest` (Dataclasses), one real, frozen declaration standing in for both a dict and a second description, a typo'd field failing loudly instead of quietly. And the closing unit read the real limit of that fix: `User` (Domain Objects) needs its own password to genuinely change while remaining the same real account throughout - the one real case, among all four real shapes this lesson found already in use, that value equality alone could never express.

**Next lesson:** How the manual grouping and transformation loops already read in this backend - building a dict bundle one key at a time, one record at a time - map onto Python's own built-in tools for exactly that job, and which parts of those same real loops don't cleanly map onto any of them at all.