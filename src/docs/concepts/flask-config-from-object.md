# Concept: `app.config.from_object(obj)`

**What you'll understand by the end:** what `app.config` actually is,
and what `from_object(...)` copies out of a plain Python class to
populate it.

**Prerequisites:** none beyond ordinary Python classes and
dictionaries.

## What it is

`app.config` is a dict-like object every Flask app carries, holding its
own runtime settings — a database URL, a debug flag, a secret key.
`from_object(obj)` is one way of filling it in bulk, from an existing
Python object, instead of setting each key by hand
(`app.config["X"] = ...`, repeated once per setting).

## Implementation

From Flask's own public surface:

```python
class Config(dict):  # app.config's real type — a dict subclass
    def from_object(self, obj) -> None: ...
```

- `obj` — any Python object with attributes on it: a class, an instance,
  or even a string naming an importable module. `from_object` doesn't
  care which — it just reads attributes off whatever it's given.
- The real rule `from_object` applies while copying: only attributes
  whose names are **entirely UPPERCASE** get copied into `app.config`.
  A class can freely have lowercase helper attributes or methods
  alongside its settings, and `from_object` ignores all of them —
  this is the actual mechanism, not just a style convention this
  project happens to follow.

## Its use

`app.config.from_object(config.get(config_name, config['default']))`
passes in a whole `DevelopmentConfig` class (not an instance —
`from_object` reads class-level attributes directly, no `()` needed).
Every uppercase attribute declared on it and its parent `Config` class
— `DATA_PATH`, `SQLALCHEMY_DATABASE_URI`,
`SQLALCHEMY_TRACK_MODIFICATIONS`, `DEBUG` — gets copied into
`app.config` in one call, rather than four separate
`app.config["X"] = Config.X` lines. Swapping which class gets passed in
(`DevelopmentConfig` vs., say, a real `ProductionConfig` this project
doesn't have yet) is what actually changes the app's behavior between
environments — `from_object` itself doesn't know or care which one it
was handed.

## Try It Yourself

1. Add a new, lowercase attribute to `Config` (`debug_notes = "testing"`)
   and confirm, by printing `app.config`, that it does *not* appear —
   only uppercase names get copied.
2. Call `app.config.from_object(DevelopmentConfig)` twice in a row, with
   a real value changed on the class in between, and confirm the second
   call's values win — `from_object` overwrites, it doesn't merge
   defensively.
