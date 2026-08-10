# Concept: Flask-SQLAlchemy's `db.Model`/`db.Column` Declarative Style

**What you'll understand by the end:** the specific, real syntax
Flask-SQLAlchemy uses to define a table as a Python class — distinct
from modern SQLAlchemy's own `Mapped[T]`/`mapped_column()` style.

**Prerequisites:** `orm-object-relational-mapping.md`.

## Setup

```
pip install flask flask-sqlalchemy
```

## The Problem

`orm-object-relational-mapping.md` and `sqlalchemy-mapped-column-types.md`
both show modern SQLAlchemy's `Mapped[T]`/`mapped_column()` style — but
that's not the only real, widely-used declarative syntax. Flask-
SQLAlchemy, a real, separate package wrapping SQLAlchemy for Flask
specifically, provides its own `db.Model` base class and `db.Column`
constructor, predating `Mapped[T]` and still extremely common in real,
existing Flask codebases — genuinely different syntax for the identical
underlying idea.

## The Isolated Example

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
db = SQLAlchemy(app)


class Pet(db.Model):
    __tablename__ = "pets"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer, nullable=True)


with app.app_context():
    db.create_all()
    db.session.add(Pet(name="Rex", age=3))
    db.session.commit()
    rows = Pet.query.filter(Pet.age > 2).all()
    print([(p.id, p.name, p.age) for p in rows])
```

**Real output:**
```
[(1, 'Rex', 3)]
```

**What this proves:** the identical real result
`orm-object-relational-mapping.md`'s own modern-syntax example produces,
via `db.Model`/`db.Column` instead of `DeclarativeBase`/`Mapped[T]` — two
genuinely different, real APIs over the identical underlying SQLAlchemy
engine.

## Mechanical Walkthrough

- `db = SQLAlchemy(app)` — Flask-SQLAlchemy's own real extension object,
  bound to a specific Flask app (this project's own real `__init__.py`
  instead creates `db = SQLAlchemy()` unbound, then calls `db.init_app(
  app)` separately inside the factory — the deferred-initialization
  pattern, its own separate concept).
- `class Pet(db.Model):` — inherits from the extension's own real base
  class, not a standalone `DeclarativeBase`; this is what ties a model
  to *this specific* `db` instance.
- `db.Column(db.Integer, primary_key=True)` — the real, direct
  alternative to `Mapped[int] = mapped_column(primary_key=True)`: the
  real column type (`db.Integer`, `db.String(50)`, ...) is passed as the
  first real argument, not inferred from a type annotation at all; a
  bare class attribute assignment (`id = db.Column(...)`), no `: type`
  annotation required or read by SQLAlchemy here.
- `nullable=True`/`nullable=False` — real, explicit keyword arguments,
  the direct equivalent of `Mapped[T]`'s `| None` — but opt-in the other
  direction: `db.Column`'s own real default is `nullable=True` unless
  stated otherwise, whereas `Mapped[T]` defaults to `NOT NULL` unless a
  union with `None` is written.
- `Pet.query.filter(Pet.age > 2).all()` — Flask-SQLAlchemy's own real,
  additional convenience: every model gets a real `.query` attribute for
  free, a shorthand over the more verbose `db.session.query(Pet)...` /
  modern `select(Pet)...` styles `orm-query-builder-select-where.md`
  and `orm-object-relational-mapping.md` show.

## CS Lens

Not a new CS idea — the identical real ORM/declarative-mapping pattern
`orm-object-relational-mapping.md` already names, wearing a different,
real, concrete syntax. Worth recognizing as a genuinely distinct real API
specifically so reading two different real Flask codebases (one using
`Mapped[T]`, one using `db.Column`) doesn't look like two different
concepts — it's one concept, two real, coexisting historical syntaxes.

## SE Lens

**A real, existing codebase's own already-chosen syntax is not a free
choice once real, existing code exists in it** — this project's real
reference uses `db.Column` throughout, so the rebuild does too, even
though `Mapped[T]` is the more modern, type-checker-friendly style a
brand-new project might reasonably prefer today. Real, honest cost of
`db.Column`: no static type checking on model attributes at all (`Pet.age`
has no real, checkable Python type until runtime) — a real, structural
tradeoff `Mapped[T]` specifically exists to fix, not present in this
project's own real, existing choice.

## Connection

Builds on `orm-object-relational-mapping.md`. Directly contrasts with
`sqlalchemy-mapped-column-types.md` — same real underlying engine, two
different, real, non-interchangeable declaration syntaxes. This
project's own real backend uses this file's own style exclusively.

## Try It Yourself

1. Add a nullable column (`nickname = db.Column(db.String(50),
   nullable=True)`) and confirm a `Pet` created without it stores real
   SQL `NULL`, read back as Python `None` — the identical real behavior
   `sqlalchemy-mapped-column-types.md`'s own `Mapped[str | None]`
   produces, via a different real mechanism.
2. Omit `nullable=False` from a required column entirely and attempt to
   insert a row missing it — observe whether Flask-SQLAlchemy enforces
   the same real constraint by default, or requires it stated
   explicitly (unlike `Mapped[T]`'s own default).
3. Look up Flask-SQLAlchemy's own documentation for whether newer
   versions support `Mapped[T]` syntax as well — reasoning about why a
   real, existing large codebase might still choose not to migrate even
   if a newer, in-place-compatible option becomes available.
