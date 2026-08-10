# Concept: `app.app_context()`

**What you'll understand by the end:** what an "application context" is,
why some Flask/extension calls need one active, and what `with
app.app_context():` actually does.

**Prerequisites:** `flask-application-and-route-decorator.md` (what
`app` is).

## What it is

An application context is Flask's way of making one specific `app`
object "the current app" for a block of code — a fact that any Flask
code running inside that block can then ask about, without that code
needing `app` passed to it directly as an argument.

## Implementation

From Flask's own public surface:

```python
class Flask:
    def app_context(self) -> "AppContext": ...
```

`AppContext` implements Python's **context manager** protocol (the
same mechanism a file's own `with open(...) as f:` relies on) — used
with the `with` statement:

```python
with app.app_context():
    # Inside this block, Flask internally knows "the current app" is
    # this specific `app` — any code that asks (including extensions
    # like Flask-SQLAlchemy) gets it, with no argument passed.
    ...
# Outside the block, that binding is gone.
```

- `app.app_context()` — doesn't run anything by itself; it returns a
  context-manager object.
- `with ... :` — enters the context (registers `app` as "current"),
  runs the indented block, then always exits the context (un-registers
  it) when the block ends, even if an exception was raised inside it.

## Its use

`db.create_all()` needs to know which real database to create tables
in — that information lives on a specific `app`'s own config
(`SQLALCHEMY_DATABASE_URI`), not on `db` itself, since the same `db`
object can be bound to more than one app (`flask-extension-deferred-
init-app.md`). Calling `db.create_all()` with no application context
active leaves nothing for it to ask "which app's config?" — `with
app.app_context():` is what supplies that answer for the one call
inside it, without `db.create_all()`'s own signature needing an `app`
parameter added just for this.

## Try It Yourself

1. Call `db.create_all()` with the surrounding `with app.app_context():`
   removed (call it as a bare, un-indented line instead) and read the
   real error Flask raises — it names exactly what's missing.
2. Print `flask.current_app` — a proxy object Flask code uses to ask
   "what's the current app?" — both inside and outside an
   `app.app_context()` block, and observe the difference: usable inside,
   raising an error outside.
