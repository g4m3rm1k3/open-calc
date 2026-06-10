# Junior to Senior — T5·L0i — Context Managers

**Prerequisites:** T5·L0h (Generators and `yield`). You know how `yield` pauses
execution. This lesson shows the same mechanism applied to cleanup guarantees —
the `with` statement that ensures teardown code ALWAYS runs, even when exceptions occur.

**What this lab adds:**
- `with obj as x:` desugars to `__enter__` + `try/finally` + `__exit__`
- `__enter__` runs setup; `__exit__` always runs, even on exception
- `@contextlib.contextmanager`: writing a context manager with a generator and `yield`
- Async context managers: `async with` using `__aenter__` and `__aexit__`
- Practical patterns: timing, database transactions, configuration overrides

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `f = open('file.txt')`. Your code crashes before `f.close()`. What happens to
>    the file? How does `with open('file.txt') as f:` fix this?
> 2. `__exit__` receives three arguments after `self`: `exc_type`, `exc_val`, `exc_tb`.
>    What does returning `True` from `__exit__` do to the exception?
> 3. You want a `with timer('query'):` block. Do you need `__enter__`/`__exit__`,
>    or is there a shorter approach using what you learned about `yield`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three context managers used throughout the task API:

```python
with timer('database query'):
    tasks = session.execute(stmt)
# → [timer] database query: 12.3ms

with override_config(debug=True):
    run_debug_operation()
# Config is restored to its original value after the block

# The database transaction (async) is shown in the concept block
```

---

### Concept: What the `with` Statement Actually Does

**What it is:** `with expr as x:` is syntactic sugar for a `try/finally` block
using the context manager protocol (`__enter__` and `__exit__`).

**The problem before:**

```python
f = open('data.csv')
process(f)         # if process() raises an exception here...
f.close()          # ← this NEVER runs — the file handle leaks
```

Python will eventually garbage-collect the file and close it — but "eventually"
could mean seconds, and you might try to open the same file again before then.
On Windows, unclosed files cannot be deleted or renamed.

**The solution — `with` guarantees `__exit__` always runs:**

```python
with open('data.csv') as f:
    process(f)
# f is always closed here, even if process() raises an exception
```

**What `with` actually does:**

```python
# This:
with expr as x:
    body

# Is equivalent to:
_ctx = expr
x = _ctx.__enter__()
try:
    body
finally:
    _ctx.__exit__(exc_type, exc_val, exc_tb)
# __exit__ receives exception info, or (None, None, None) if no exception
```

**What it hides:** The `try/finally` boilerplate. Every `with` block is a guaranteed
`try/finally` — you cannot forget to write the `finally`. The context manager encodes
the cleanup once; every `with` use of it is automatically correct.

**Canonical example:** Borrowing a library book. Signing it out (`__enter__`) and
returning it (`__exit__`) always happen as a pair. Even if you spill coffee on the
book (an exception occurs), you still return it when you leave the library.

**Project application:** `with session.begin():` opens a database transaction and
commits on success or rolls back on exception — one line, always correct.

**You will see this again in:**
- `with open(path) as f:` — universal Python file handling pattern
- `with session.begin():` in SQLAlchemy — transaction boundary
- `with caplog.at_level(logging.DEBUG):` in pytest — temporary log level change
- `with unittest.mock.patch('module.attr', new_value):` — temporary mocking

**Watch for:** `with` does NOT suppress exceptions by default. If `body` raises,
`__exit__` receives the exception info and can either suppress it (return `True`)
or let it propagate (return `None` or `False`). Most context managers return `None`
— exceptions propagate normally.

---

## Step 1 — See the Guarantee

```bash
python -c "
class DemoContext:
    def __enter__(self):
        print('__enter__: setup')
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f'__exit__: cleanup (exception={exc_type})')
        # Return None — let any exception propagate

with DemoContext() as ctx:
    print('in the block')
    raise ValueError('something went wrong')   # exception happens
"
```

**You should see:**
```
__enter__: setup
in the block
__exit__: cleanup (exception=<class 'ValueError'>)
Traceback ...
ValueError: something went wrong
```

`__exit__` ran even though an exception occurred — this is the guarantee.

---

### Concept: `@contextlib.contextmanager` — With a Generator

**What it is:** The `@contextmanager` decorator turns a generator function into a
context manager. Everything BEFORE `yield` is the `__enter__` body. Everything
AFTER `yield` (or in a `finally` block after `yield`) is the `__exit__` body.
The value of `yield` is bound to `as x`.

**The problem before (writing a full class just for a timer):**

```python
class Timer:
    def __init__(self, label): self.label = label
    def __enter__(self):
        import time
        self._start = time.perf_counter()
        return self
    def __exit__(self, *args):
        elapsed = (time.perf_counter() - self._start) * 1000
        print(f'[timer] {self.label}: {elapsed:.1f}ms')

# 10 lines of boilerplate for a simple timer
```

**The solution with `@contextmanager`:**

```python
from contextlib import contextmanager
import time

@contextmanager
def timer(label: str):
    start = time.perf_counter()
    try:
        yield   # ← the block runs here; yield value becomes the 'as x' target
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000
        print(f'[timer] {label}: {elapsed_ms:.1f}ms')
```

**What it hides:** The protocol translation. `@contextmanager` converts the generator
function into an object with `__enter__` and `__exit__`. The `yield` IS the boundary —
code before runs on enter, code after (in `finally`) runs on exit, even on exception.

**The `try/finally` inside the generator** is essential. Without `finally`, an exception
inside the `with` block would skip the timing output. With `finally`, it always runs.

**Canonical example:** The three-step protocol for borrowing a key. Sign the logbook
(before `yield`). Use the key (the `with` block runs). Return the key and sign out
(after `yield` in `finally`). Even if you lose the key (exception), the return and
sign-out happen.

**Project application:** The task API timer, configuration overrides, and test helpers
are all written with `@contextmanager` — simple, readable, guaranteed cleanup.

**Smallest possible example:**

```python
from contextlib import contextmanager

@contextmanager
def managed_resource():
    print('acquiring resource')
    try:
        yield 'the resource'   # yielded value is bound to 'as x'
    finally:
        print('releasing resource')

with managed_resource() as r:
    print(f'using {r}')
# Output:
# acquiring resource
# using the resource
# releasing resource
```

**You will see this again in:**
- FastAPI's dependency injection with `yield` is the same pattern: code before `yield`
  is setup, code after is teardown
- SQLAlchemy: `async_sessionmaker` uses this pattern
- pytest fixtures with `yield` use `@contextmanager` semantics: setup, yield, teardown

**Watch for:** A `@contextmanager` generator must `yield` EXACTLY ONCE. If it yields
zero times (an `if` branch that skips the `yield`) or more than once, Python raises
`RuntimeError: generator didn't stop after throw()`.

---

## Step 2 — Build the Timer and Override Context Managers

Create `src/utils/context_managers.py`:

```python
# src/utils/context_managers.py
from contextlib import contextmanager
import time
import logging
from typing import Any

logger = logging.getLogger(__name__)


@contextmanager
def timer(label: str):
    """Times the enclosed block and logs the duration."""
    start = time.perf_counter()
    try:
        yield                                            # the block runs here
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.debug('[timer] %s: %.1fms', label, elapsed_ms)
```

### SAVE AND TRY

```bash
python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
from src.utils.context_managers import timer
import time

with timer('my operation'):
    time.sleep(0.05)   # simulate 50ms work
"
```

**You should see:**
```
DEBUG:src.utils.context_managers:[timer] my operation: 50.2ms
```

**Change something:** Raise an exception inside the `with` block:

```bash
python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
from src.utils.context_managers import timer

try:
    with timer('failing operation'):
        raise ValueError('something broke')
except ValueError:
    pass   # catch the exception so we can see the timer output
"
```

**Expected:** The timer output still appears even though an exception was raised.
The `finally` block guaranteed it.

Now add the configuration override context manager:

```python
@contextmanager
def override_config(config_obj: Any, **overrides: Any):          # ← add this
    """Temporarily overrides config values; restores originals on exit."""
    originals: dict[str, Any] = {}
    for key, value in overrides.items():
        originals[key] = getattr(config_obj, key)    # save original
        setattr(config_obj, key, value)              # apply override
    try:
        yield config_obj                             # block runs with overrides
    finally:
        for key, original in originals.items():
            setattr(config_obj, key, original)       # restore always
```

### SAVE AND TRY

```bash
python -c "
from src.utils.context_managers import override_config

class FakeConfig:
    debug = False
    port  = 8000

cfg = FakeConfig()
print('before:', cfg.debug, cfg.port)

with override_config(cfg, debug=True, port=9000) as c:
    print('inside:', c.debug, c.port)

print('after:', cfg.debug, cfg.port)   # restored
"
```

**You should see:**
```
before: False 8000
inside: True 9000
after: False 8000
```

---

## Step 3 — Write the Tests

Create `tests/test_context_managers.py`:

```python
# tests/test_context_managers.py
import logging
import pytest
from src.utils.context_managers import timer, override_config


class TestTimer:

    def test_block_executes_normally(self) -> None:
        results = []
        with timer('test'):
            results.append(42)
        assert results == [42]

    def test_exception_propagates_through_timer(self) -> None:
        with pytest.raises(ValueError, match='test error'):
            with timer('failing'):
                raise ValueError('test error')

    def test_logs_elapsed_time(self, caplog) -> None:
        with caplog.at_level(logging.DEBUG):
            with timer('my_operation'):
                pass
        assert 'my_operation' in caplog.text


class TestOverrideConfig:

    def test_overrides_values_inside_block(self) -> None:
        class Cfg:
            debug = False

        cfg = Cfg()
        with override_config(cfg, debug=True):
            assert cfg.debug is True

    def test_restores_original_values_after_block(self) -> None:
        class Cfg:
            debug = False

        cfg = Cfg()
        with override_config(cfg, debug=True):
            pass
        assert cfg.debug is False   # restored

    def test_restores_values_even_after_exception(self) -> None:
        class Cfg:
            debug = False

        cfg = Cfg()
        with pytest.raises(RuntimeError):
            with override_config(cfg, debug=True):
                raise RuntimeError('error inside block')

        assert cfg.debug is False   # restored despite exception

    def test_can_override_multiple_fields_at_once(self) -> None:
        class Cfg:
            debug = False
            port  = 8000

        cfg = Cfg()
        with override_config(cfg, debug=True, port=9000):
            assert cfg.debug is True
            assert cfg.port  == 9000
        assert cfg.debug is False
        assert cfg.port  == 8000
```

### SAVE AND TRY

```bash
pytest tests/test_context_managers.py -v
```

**You should see:**
```
tests/test_context_managers.py::TestTimer::test_block_executes_normally PASSED
tests/test_context_managers.py::TestTimer::test_exception_propagates_through_timer PASSED
tests/test_context_managers.py::TestTimer::test_logs_elapsed_time PASSED
tests/test_context_managers.py::TestOverrideConfig::test_overrides_values_inside_block PASSED
tests/test_context_managers.py::TestOverrideConfig::test_restores_original_values_after_block PASSED
tests/test_context_managers.py::TestOverrideConfig::test_restores_values_even_after_exception PASSED
tests/test_context_managers.py::TestOverrideConfig::test_can_override_multiple_fields_at_once PASSED

7 passed
```

**Change something:** Remove `finally` from the `timer` implementation — replace it
with just `yield` and no post-yield code. Then run
`test_exception_propagates_through_timer`. Expected: the test still passes (the exception
propagates). But the timer measurement no longer runs on exception. The `finally` is
what makes it unconditional.

---

### Concept: Async Context Managers

**What it is:** `async with` uses `__aenter__` and `__aexit__` (the async versions).
`@asynccontextmanager` from `contextlib` is the async equivalent of `@contextmanager`.

**The problem before (database transactions):**

```python
async def save_task(session, task):
    session.add(task)
    await session.commit()           # if this raises...
    # ...or if something after commit raises, there's no rollback

# Partially saved data, no consistent state
```

**The solution:**

```python
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession

@asynccontextmanager
async def transaction(session: AsyncSession):
    """Opens a transaction; commits on success, rolls back on exception."""
    async with session.begin():
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
```

**Project application:** Every database-modifying operation in the task API will
use `async with transaction(session):` — one line guarantees atomicity.

**Smallest possible example:**

```python
from contextlib import asynccontextmanager
import asyncio

@asynccontextmanager
async def async_resource():
    print('async setup')
    try:
        yield 'async resource'
    finally:
        print('async cleanup')

async def main():
    async with async_resource() as r:
        print(f'using {r}')

asyncio.run(main())
# async setup
# using async resource
# async cleanup
```

**You will see this again in:**
- `AsyncSession.begin()` in SQLAlchemy is an async context manager
- FastAPI dependency injection with `yield` in `async def` dependencies
- `httpx.AsyncClient()` in tests: `async with httpx.AsyncClient(app=app) as client:`

**Watch for:** `async with` requires an `async def` function. You cannot use
`async with` in synchronous code. Every function that uses `async with` must be
declared `async def`.

---

## 🎯 Challenge: Build a `suppress_and_log` Context Manager

**You know:** `@contextmanager`, `yield`, exception handling in `__exit__`.

**Task:** Build `suppress_and_log(*exception_types)` — a context manager that
catches the specified exception types, logs a warning, and suppresses them
(does not re-raise):

```python
with suppress_and_log(ValueError, KeyError):
    raise ValueError('expected error')  # suppressed — no exception propagates
print('continues here')

with suppress_and_log(ValueError):
    raise TypeError('unexpected error')  # NOT suppressed — TypeError propagates
```

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
@contextmanager
def suppress_and_log(*exception_types: type[Exception]):
    """Suppresses specified exception types and logs a warning."""
    try:
        yield
    except exception_types as e:
        logger.warning('Suppressed %s: %s', type(e).__name__, e)
        # Do NOT re-raise — the exception is suppressed
```

**Tests:**
```python
def test_suppresses_specified_exception() -> None:
    with suppress_and_log(ValueError):
        raise ValueError('suppressed!')
    # If we reach here, the exception was suppressed

def test_does_not_suppress_unspecified_exception() -> None:
    with pytest.raises(TypeError):
        with suppress_and_log(ValueError):
            raise TypeError('not suppressed')

def test_block_runs_normally_when_no_exception() -> None:
    results = []
    with suppress_and_log(ValueError):
        results.append(1)
    assert results == [1]
```

**Key insight:** `except exception_types as e:` works because `exception_types` is
a tuple — Python's `except` clause accepts a tuple of exception types. NOT re-raising
the exception inside `except` means the exception is swallowed. The `with` block
continues execution AFTER the `with` statement (not after the point of the exception).

</details>

---

## Final Check

| Pattern | Example | `__exit__` called? |
|---|---|---|
| Normal completion | `with timer('op'):` block | Yes — `(None, None, None)` |
| Exception in block | `with timer('op'): raise` | Yes — exception info passed |
| Exception suppressed | Return `True` from `__exit__` | Yes — exception consumed |
| `finally` in `@contextmanager` | Always runs | Always — guaranteed |

---

## Quick Check Answers

**1. `f = open(...)` — crash before `f.close()`. What happens? How does `with` fix it?**

The file handle leaks. On Windows, the file is locked and cannot be written or deleted
by other processes until the handle is garbage-collected. On all systems, if you open
many files without closing them, you exceed the OS's open-file limit. `with open(...)
as f:` guarantees `f.close()` is called in the `__exit__` method — even if an
exception occurs — because `with` desugars to `try/finally`.

**2. `__exit__` returns `True` — what happens to the exception?**

The exception is suppressed — it does not propagate past the `with` statement.
Python checks the return value of `__exit__`: if truthy, swallow the exception;
if falsy (including `None`), let the exception propagate normally. Most context
managers return `None` (propagate). `contextlib.suppress` is the standard library
context manager that returns `True` to suppress specified exceptions.

**3. `with timer('query')` — do you need `__enter__`/`__exit__`, or is `yield` enough?**

`@contextlib.contextmanager` with `yield` is sufficient and simpler. Everything before
`yield` runs as `__enter__`. Everything after `yield` (in a `finally`) runs as `__exit__`.
A full class with `__enter__`/`__exit__` is only necessary when the context manager
needs to hold state across multiple `with` uses, or when the protocol is complex enough
to warrant it.
