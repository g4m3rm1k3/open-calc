# Concept: A Column's `default=` as a Callable, Not a Value

**What you'll understand by the end:** why `default=datetime.utcnow`
(no parentheses) is correct and `default=datetime.utcnow()` is a real,
common, easy-to-miss bug.

**Prerequisites:** `flask-sqlalchemy-declarative-model.md`,
`python-first-class-functions.md`.

## Setup

```
pip install flask flask-sqlalchemy
```

## The Problem

A column like `created_at` needs a real, correct timestamp *per row*, at
the exact moment that specific row is inserted — not one timestamp,
computed once, silently reused for every row a running process ever
creates afterward. Something needs to distinguish "compute this value
right now, once" from "here's how to compute this value, each time it's
actually needed."

## The Isolated Example

```python
from datetime import datetime
import time
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
db = SQLAlchemy(app)


class WrongLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    at = db.Column(db.DateTime, default=datetime.utcnow())  # called NOW


class RightLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    at = db.Column(db.DateTime, default=datetime.utcnow)  # passed itself


with app.app_context():
    db.create_all()
    db.session.add(WrongLog())
    time.sleep(2)
    db.session.add(WrongLog())
    db.session.add(RightLog())
    time.sleep(2)
    db.session.add(RightLog())
    db.session.commit()

    wrong_times = [row.at for row in WrongLog.query.all()]
    right_times = [row.at for row in RightLog.query.all()]
    print("WrongLog:", wrong_times[0] == wrong_times[1])
    print("RightLog:", right_times[0] == right_times[1])
```

**Real output:**
```
WrongLog: True
RightLog: False
```

**What this proves:** both `WrongLog` rows, inserted two real seconds
apart, got the *identical* real timestamp — `datetime.utcnow()`, called
with parentheses, ran exactly once, the moment the class body itself was
executed (at import time), and that one, fixed, real value became the
default for every future row forever. `RightLog`'s two rows, inserted
the same two real seconds apart, got two genuinely different, real
timestamps — `datetime.utcnow` (no parentheses) was never called at
class-definition time at all.

## Mechanical Walkthrough

- `default=datetime.utcnow` passes the real function `datetime.utcnow`
  itself as a value — a real, first-class Python function is an
  ordinary object that can be passed around unevaluated, the same real
  idea `python-first-class-functions.md` names generally.
- Flask-SQLAlchemy's own real, documented behavior: when a column's
  `default` is **callable**, it calls it fresh, with no arguments, at
  the moment each specific real row is actually inserted — not once, at
  class-definition time.
- `default=datetime.utcnow()` — the trailing `()` calls the function
  **immediately**, at class-body-execution time (which happens once, the
  first time this module is imported) — the *result* of that one real
  call, a fixed, ordinary `datetime` object, becomes the literal default
  value from then on, exactly like any other constant default
  (`default='system'`, a plain string, correctly evaluated once — the
  difference is only real for defaults that are supposed to vary per
  use).

## CS Lens

This is the identical real distinction between **eager and lazy
evaluation** — `datetime.utcnow()` evaluates eagerly, once, at
definition time; `datetime.utcnow` (the bare function reference) defers
evaluation until the real moment it's actually needed. The same real
shape as Python's own well-known mutable-default-argument gotcha
(`def f(x=[]):` — the list literal is built once, at function-definition
time, and silently shared across every call that doesn't pass its own).

## SE Lens

**A callable default is a real, deliberate design choice by
Flask-SQLAlchemy specifically to prevent this exact class of bug** —
requiring the *function itself*, not its result, makes "evaluate this
fresh, per row" the only way `default=` is meant to be used for anything
that should vary. The real, honest risk: this specific mistake produces
no error at all, ever — every row inserts successfully, `created_at` is
always a real, valid `datetime` — it just silently, permanently freezes
at whatever moment the process first imported the model, a real, live
bug that can sit undetected in a real codebase indefinitely until
someone actually compares two rows' timestamps and finds them
suspiciously, impossibly identical.

## Connection

Builds on `flask-sqlalchemy-declarative-model.md`. This project's own
real `created_at = db.Column(db.DateTime, default=datetime.utcnow)`
(`MachineGroup`, and every other real model with a timestamp) uses this
identical, correct, callable form.

## Try It Yourself

1. Restart the real process between the two `WrongLog` inserts (so the
   class body re-executes) and confirm the two rows now get two
   genuinely *different* frozen timestamps — one per process start, but
   still identical *within* a single run — sharpening exactly what's
   frozen and when.
2. Try a callable default that takes real arguments (`default=lambda:
   datetime.utcnow().replace(microsecond=0)`) — confirming any real,
   zero-argument callable works, not specifically `datetime.utcnow`
   alone.
3. Look up SQLAlchemy's `server_default` (as distinct from `default`)
   and reason about the real, different case it covers: a real default
   computed by the *database engine itself*, not by Python at all.
