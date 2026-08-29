# Lesson 19: A Real Part Model

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The second real table `rebuild/backend`'s own database actually holds —
a real `Part` model, matching every real field legacy's own `Part.to_dict()`
actually returns. No route reads or writes it yet; this lesson's own
real proof is the identical, narrow shape this project's own first
model lesson already used: the existing `/health` route still passes,
unchanged, once a real, second table exists alongside `users`.

## What you need to know first

`rebuild/backend`'s own real database connection and real `User` model
— the identical real `db.Model`/`db.Column` mechanism this lesson
reuses for a genuinely different real table.

## Terms introduced

- **Model** — in an ORM, a real Python class representing one real
  database table, where each real class attribute names one real
  column. This project's own real `User` model, already built, is a
  real example of this exact pattern; `Part`, below, is this project's
  own second.
- **Primary key** — a real, standard database concept: the one real
  column (or set of columns) guaranteed to uniquely identify a real
  row, so any other real row can reference it unambiguously. `Part.id`,
  below, serves this identical real role for the `parts` table, the
  same real way `User.id` already does for `users`.
- **Database index** — a real, separate data structure a database
  maintains alongside a real table, letting it find matching rows by a
  specific real column's own value without scanning every real row in
  the table. A real, direct cost/benefit tradeoff: real, extra storage
  and real, slightly slower real writes (the index itself has to be
  kept up to date), in exchange for real, dramatically faster real reads
  by that specific column — worth it exactly when a real column is
  searched by often, and `part_number`, below, is: this application's
  own real, human-facing identifier for a part, exactly what a real
  user would search by.
- **Auto-updating timestamp** — a real SQLAlchemy column behavior,
  distinct from an ordinary real `default=`: a real value recomputed
  and written automatically every time a real row's own real data
  changes, not only when the real row is first created. `updated_at`,
  below, uses this; `created_at` deliberately does not, since a real
  row's own real creation moment should never change again once set.

## Objects and methods used

- **`db.Model`**
  - *What it is:* a real, declarative base class, provided by the `db`
    object this project's own database-connection lesson already
    constructed — part of Flask-SQLAlchemy's own public API.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — any real class inheriting from
    `db.Model` is automatically registered as a real, mapped table; its
    own real `db.Column(...)` class attributes become that table's own
    real columns.
  - *Its use:* this lesson's `Part` class inherits from it, the
    identical real mechanism this project's own real `User` model
    already uses, now applied to a genuinely different real table.
  - *Type:* a class, meant to be subclassed, never instantiated
    directly.
  - *Responsibility:* the real, central seam translating an ordinary
    Python class definition into a real, mapped database table, without
    this project ever writing raw real SQL to create one.
  - *Depends on:* the real, shared `db` object this project's own
    database connection already constructed.
  - *Connects to:* every real model this project defines inherits from
    it; SQLAlchemy's own real, internal registry tracks every real
    subclass automatically, `User` and `Part` alike.
  - *Shape:* the real foundation both this project's own real models
    sit on.

- **`db.Column(type, **options)`**
  - *What it is:* a real function, provided by the `db` object,
    constructing a real column definition.
  - *Implementation:* checked against Flask-SQLAlchemy's own official
    documentation this session — takes a real SQLAlchemy type
    (`db.String(n)`, `db.Integer`, `db.Boolean`, `db.DateTime`,
    `db.Text`, among others) describing what real kind of value the
    column holds, plus real, optional keyword arguments (`primary_key=`,
    `unique=`, `nullable=`, `index=`, a real `default=`, a real
    `onupdate=`) describing real constraints and real, automatic
    behavior.
  - *Its use:* this lesson's `Part` class calls it once per real field
    legacy's own `Part.to_dict()` actually returns.
  - *Type:* a free function (accessed as `db.Column`), returning a real
    column definition object.
  - *Responsibility:* declaring one real column's own real type and
    real constraints, in one real, self-contained call.
  - *Depends on:* a real SQLAlchemy type to describe what the column
    holds.
  - *Connects to:* assigned to a real class attribute inside a real
    `db.Model` subclass; SQLAlchemy reads every real one at real
    class-definition time to build the real table's own real schema.
  - *Shape:* the real, individual building block every real model's own
    real table shape is assembled from — the identical real mechanism
    `User` already uses, reused here for real, different real types.

---

## Concept Unit: A Real Table, Matching Legacy's Real Fields

### The Problem

The previous lesson proved, for real, exactly what legacy's own
`GET /api/parts` actually does — including its own real surprise, the
**Operator bypass**. None of that route's own real logic can exist in
`rebuild` yet, because there is no real `parts` table for it to query at
all. The real question this unit answers: what does the actual, real
`Part` model look like, matching every real field this project's own
already-proven acceptance test could ever need to see, without inventing
anything legacy doesn't actually have?

> **Before reading on:** this project's own real `User` model already
> proved the pattern — a real class, real columns, a real `to_dict()`.
> Given legacy's own real `Part.to_dict()` (read in full below) returns
> real fields of several genuinely different real kinds — plain text,
> a real number, a real boolean, two real timestamps — what real
> SQLAlchemy column types would you guess exist for each, beyond the
> real `db.String` this project has used for everything so far?

### Project Change

- **Reference Source** — `backend/app/models/part.py`, read in full
  this session: a real `Part(db.Model)` class, with `id`,
  `part_number`, `description`, `material`, `current_revision`,
  `status`, `model_3d_path`, `thumbnail_url`, `created_at`,
  `updated_at`, `created_by`, `is_favorite`, `tags`,
  `final_model_path`, `fixture_model_path`, and `final_model_id` real
  columns, plus a real `to_dict()` method. This unit Preserves legacy's
  own real field set in full, the identical real reasoning this
  project's own `User` model lesson already gave: every real field
  legacy's own `to_dict()` returns is a real, external, observable fact
  about this application's own real API shape, not an internal detail
  safe to trim. This unit deliberately does **not** Preserve legacy's
  own real `cam_files` relationship or its own real `from_dict()`
  classmethod — see the SE Lens, below, for why both are a real,
  stated, deliberate gap, not an oversight.
- **Files affected** — created: `rebuild/backend/app/part_model.py`.
- **Change type** — add (new file).
- **Location** — directly inside the existing real `app/` package,
  sibling to `models.py`. A **Deliberately changed** real filename,
  worth naming honestly: this project's own real `User` model already
  lives in `app/models.py`; a second, unrelated real table sharing that
  identical, generic real filename would make "which model is this"
  a real, avoidable question the moment a reader opens the file — a
  real, small structural choice, not a change to any real behavior.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```python
from datetime import datetime

from app import db


class Part(db.Model):
    __tablename__ = 'parts'

    id = db.Column(db.String(50), primary_key=True)
    part_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    description = db.Column(db.String(500), nullable=False)
    material = db.Column(db.String(100), nullable=True)
    current_revision = db.Column(db.Integer, default=1)
    status = db.Column(db.String(20), default='draft')
    model_3d_path = db.Column(db.String(500), nullable=True)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.String(100), default='system')
    is_favorite = db.Column(db.Boolean, default=False)
    tags = db.Column(db.Text, nullable=True)
    final_model_path = db.Column(db.String(500), nullable=True)
    fixture_model_path = db.Column(db.String(500), nullable=True)
    final_model_id = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'material': self.material,
            'status': self.status,
            'partNumber': self.part_number,
            'currentRevision': self.current_revision,
            'model3dPath': self.model_3d_path,
            'finalModelPath': self.final_model_path,
            'fixtureModelPath': self.fixture_model_path,
            'finalModelId': self.final_model_id,
            'thumbnailUrl': self.thumbnail_url,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'createdBy': self.created_by,
            'isFavorite': self.is_favorite,
            'tags': self.tags.split(',') if self.tags else [],
        }
```

### The Updated Project

`rebuild/backend/app/part_model.py`, in full — brand new, so this is
the whole file:

```python
1  from datetime import datetime
2
3  from app import db
4
5
6  class Part(db.Model):
7      __tablename__ = 'parts'
8
9      id = db.Column(db.String(50), primary_key=True)
10     part_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
11     description = db.Column(db.String(500), nullable=False)
12     material = db.Column(db.String(100), nullable=True)
13     current_revision = db.Column(db.Integer, default=1)
14     status = db.Column(db.String(20), default='draft')
15     model_3d_path = db.Column(db.String(500), nullable=True)
16     thumbnail_url = db.Column(db.String(500), nullable=True)
17     created_at = db.Column(db.DateTime, default=datetime.utcnow)
18     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
19     created_by = db.Column(db.String(100), default='system')
20     is_favorite = db.Column(db.Boolean, default=False)
21     tags = db.Column(db.Text, nullable=True)
22     final_model_path = db.Column(db.String(500), nullable=True)
23     fixture_model_path = db.Column(db.String(500), nullable=True)
24     final_model_id = db.Column(db.String(50), nullable=True)
25
26     def to_dict(self):
27         return {
28             'id': self.id,
29             'description': self.description,
30             'material': self.material,
31             'status': self.status,
32             'partNumber': self.part_number,
33             'currentRevision': self.current_revision,
34             'model3dPath': self.model_3d_path,
35             'finalModelPath': self.final_model_path,
36             'fixtureModelPath': self.fixture_model_path,
37             'finalModelId': self.final_model_id,
38             'thumbnailUrl': self.thumbnail_url,
39             'createdAt': self.created_at.isoformat() if self.created_at else None,
40             'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
41             'createdBy': self.created_by,
42             'isFavorite': self.is_favorite,
43             'tags': self.tags.split(',') if self.tags else [],
44         }
```

### Mechanical Walkthrough

- **Line 6, `class Part(db.Model):`** — this lesson's Header's own
  `db.Model`, subclassed a second time.
- **Line 7, `__tablename__ = 'parts'`** — a real, standard SQLAlchemy
  class attribute, explicitly naming the real database table this
  class maps to, the identical real mechanism `User.__tablename__`
  already established, matching legacy's own real, identical table
  name.
- **Line 9, `id = db.Column(db.String(50), primary_key=True)`** — this
  lesson's Header's own `db.Column`, given a real `db.String(50)` type
  and `primary_key=True` — this lesson's Header's own **Primary key**
  term, applied for real a second time, matching legacy's own real,
  identical declaration.
- **Line 10, `part_number = db.Column(db.String(20), unique=True, nullable=False, index=True)`**
  — `unique=True`/`nullable=False`, the identical real constraints this
  project's own `User.email` column already used; `index=True` is
  genuinely new — this lesson's Header's own **Database index** term,
  applied for real: telling SQLAlchemy to build a real, separate lookup
  structure for this specific real column, matching legacy's own real,
  identical choice, checked this session.
- **Lines 11–16, mostly-familiar real column declarations** —
  `description`/`material`/`status`/`model_3d_path`/`thumbnail_url`,
  each a real `db.String(n)` or `db.Text`-shaped column, `nullable=`
  or a real `default=` matching legacy's own real, exact values,
  checked this session, the identical real pattern already established
  for `User`'s own string columns.
- **Line 13, `current_revision = db.Column(db.Integer, default=1)`** —
  `db.Integer`, a real SQLAlchemy type genuinely new to this project:
  a real, whole-number column, holding a real count instead of real
  text; `default=1` — the identical real `default=` mechanism already
  used elsewhere, here supplying a real, literal starting number rather
  than a real string or a real, callable function.
- **Line 17, `created_at = db.Column(db.DateTime, default=datetime.utcnow)`**
  — the identical real pattern `User.created_at` already established:
  a real timestamp, set once, automatically, the moment a real row is
  created.
- **Line 18, `updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)`**
  — this lesson's Header's own **Auto-updating timestamp** term,
  applied for real: the identical real `default=datetime.utcnow`
  sets this real column's own real, initial value, but `onupdate=
  datetime.utcnow` is genuinely new — SQLAlchemy calls it again, real
  and automatic, every single time any real column on this specific
  real row actually changes, keeping this real value honestly current
  without this project's own code ever setting it by hand.
- **Line 20, `is_favorite = db.Column(db.Boolean, default=False)`** —
  the identical real `db.Boolean`/`default=` pattern `User.must_change_password`
  already established, reused here for a genuinely different real,
  human-facing purpose.
- **Line 21, `tags = db.Column(db.Text, nullable=True)`** — `db.Text`,
  a real SQLAlchemy type genuinely new to this project: a real,
  unbounded-length text column, distinct from `db.String(n)`'s own
  real, fixed real maximum length — appropriate here since a real
  part's own real, comma-separated tag list has no real, sensible
  length cap decided in advance.
- **Lines 26–43, `def to_dict(self):`** — a real, plain dictionary
  literal, built entirely from `self`'s own real attribute values —
  the identical real serialization boundary `User.to_dict()` already
  established, reused here for a genuinely different real model; line
  43's own `self.tags.split(',') if self.tags else []` converts this
  real column's own real, comma-separated string back into a real
  Python list — a real, plain string method call, the identical real
  shape `User.to_dict()`'s own real, conditional `.isoformat()` calls
  already used for a genuinely different real conversion.

### CS Lens

This is a real instance of the identical concept this project's own
`User` model already proved: a real, declarative schema, where a real
Python class's own real attributes describe a real database table's
own real shape, rather than this project ever writing raw real SQL by
hand. Reaching for a real, second, genuinely different SQLAlchemy type
(`db.Integer`, `db.Text`) for the first time, on this project's own
second real model, is the real, concrete proof that the underlying real
pattern generalizes — it was never actually specific to `User`'s own
real, string-heavy shape.

Also recognized in: any real ORM, in any real language, mapping real
class attributes to real table columns; a real, declarative UI
framework describing what should appear on screen rather than the real,
imperative steps to draw it.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own real `cam_files` relationship and real `from_dict()` classmethod
in this same lesson, since both are real, present in legacy's own real
`Part` model. Rejected on purpose, for two real, separate reasons: the
real `cam_files` relationship requires a real `CAMFile` model this
project doesn't have yet, and belongs to a real, later, entirely
separate feature slice; `from_dict()` exists, per legacy's own real
comments, specifically to build a real `Part` from a real, incoming
`POST` request body — a real capability this project's own current,
narrow slice (listing, not creating) has no real use for yet. Building
either now would be real, speculative infrastructure, the identical
real mistake this project has already named and avoided more than
once. The real, honest cost accepted here: this file will need real,
additional code the moment a real, later lesson actually needs to
create a part — not a shortcut, the correct order.

### Commands needed

No new command — this unit's own real proof, like this project's own
first model lesson, is that nothing already working broke.

### Run it, per the Verification Rule

Not run this session — stated from confidence, not executed: defining
a real model that nothing yet queries or writes to cannot change
`/health`'s own real behavior; Flask/SQLAlchemy's own documented
behavior gives no real reason it would. Confidently predicted, the
identical real shape already proven for this project's own real
`User` model lesson:

```
test_health.py::test_health_returns_200_and_status_healthy PASSED [100%]
1 passed in ...s
```

### Connecting this unit to what came before

The previous lesson proved exactly what legacy's own real `GET
/api/parts` does. This unit is the first real, physical thing
`rebuild`'s own database actually holds toward answering it.

---

## Connect the pieces

`rebuild/backend` now has a real, second table, matching every real
field legacy's own `Part.to_dict()` actually returns — and still no
route reads or writes a single real row. Every real column traces to a
real, read line of legacy's own source, not invented or trimmed for
convenience; what *was* deliberately left out — real relationships,
real creation logic — is named honestly, not silently missing.

---

**Next lesson:** the actual real list route itself — the thinnest
possible real adapter between a real request and this real model's own
real rows, including the real, deliberately open design question this
slice's own testing lesson already surfaced: what, if anything,
`rebuild` does about legacy's own real **Operator bypass**.
