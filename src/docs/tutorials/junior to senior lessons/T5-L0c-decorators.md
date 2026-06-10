# Junior to Senior — T5·L0c — Decorators: The Mechanism

**Prerequisites:** T5·L0b (Dunder Methods). You can write Python classes with
dunder methods. You know that functions are objects in Python (they can be passed
as arguments). This lesson demystifies decorators — how they work, why they must
preserve the wrapped function's identity, and how to write ones that accept arguments.

**What this lab adds:**
- A decorator is a function that takes a function and returns a function
- `@decorator` syntax is exactly `func = decorator(func)` — no magic
- `@functools.wraps(func)` — preserving the wrapped function's name and docstring
- Decorators with arguments: `@retry(max_attempts=3)` is a factory that returns a decorator
- Stacking decorators: `@a @b def f()` applies `b` first, then `a`

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. After applying `@timer` to a function, you check `func.__name__`. It returns
>    `'wrapper'` instead of the original name. What did you forget?
> 2. `@a @b def f(): ...` — which decorator runs first when you call `f()`?
>    Which runs first when the decorators are *applied* at import time?
> 3. `@retry(max_attempts=3)` takes an argument. Does `retry` receive the function
>    directly, or does `retry(max_attempts=3)` return something that receives the function?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Three decorators that work in the task API and follow the spec completely:

```python
@timer
def load_tasks():
    ...

@retry(max_attempts=3, delay_seconds=0.1)
def fetch_remote_data():
    ...

# After applying the decorators:
load_tasks.__name__     # → 'load_tasks' (not 'wrapper')
load_tasks.__doc__      # → original docstring preserved
```

---

### Concept: Functions Are Objects

**What it is:** In Python, a function is a value — just like a string, integer,
or list. You can assign a function to a variable, pass it as an argument, and
return it from another function.

**The problem before (trying to add logging to every function manually):**

```python
def add(a, b):
    print(f'Calling add with ({a}, {b})')  # logging added by hand
    result = a + b
    print(f'add returned {result}')         # logging added by hand
    return result

def multiply(a, b):
    print(f'Calling multiply with ({a}, {b})')  # duplicated everywhere
    result = a * b
    print(f'multiply returned {result}')
    return result
# If you want to change the log format, edit EVERY function
```

**The solution:** A decorator wraps a function once, adding behaviour around any
function that uses it:

```python
@log_calls
def add(a, b):       # no logging code here
    return a + b

@log_calls
def multiply(a, b):  # no logging code here
    return a * b
```

**What it hides:** The wrapping. When Python encounters `@log_calls` above `def add(...)`,
it executes `add = log_calls(add)` immediately (at import time, not call time). The name
`add` now points to the wrapper function. Callers do not know or care.

**Canonical example:** A gift box. `log_calls` is the box. `add` is the gift.
The decorated `add` is the boxed gift — same contents, different presentation.
When someone calls the boxed gift, the box opens (pre-processing), the gift is
revealed (the actual function runs), the box closes (post-processing).

**Project application:** `@timer` wraps API endpoints to measure response time.
`@retry` wraps database calls that may fail transiently. Neither changes the
wrapped function's logic.

**Smallest possible example:**

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)   # call the original
        return result.upper()            # modify the result
    return wrapper                       # return the wrapper

@shout
def greet(name):
    return f'hello {name}'

greet('Alice')  # → 'HELLO ALICE'
# Equivalent to: greet = shout(greet); greet('Alice')
```

**You will see this again in:**
- FastAPI: `@app.get('/tasks')` is a decorator — `app.get(path)` returns a decorator
  that registers the function as a route handler
- `@pytest.mark.parametrize`, `@pytest.fixture` — both are decorators
- `@property`, `@staticmethod`, `@classmethod` — built-in decorators you used in T5-L0d
- Every major Python framework uses decorators for routing, authentication, and caching

**Watch for:** Forgetting `return wrapper` at the end of the decorator. Without it,
the decorator returns `None` and the decorated function becomes `None` — calling it
raises `TypeError: 'NoneType' object is not callable`.

---

## Step 1 — Write the First Decorator: `@timer`

Create `src/utils/decorators.py`:

```python
# src/utils/decorators.py
import time


def timer(func):                              # ← decorator: takes a function
    def wrapper(*args, **kwargs):             # ← wrapper: replaces the original
        start  = time.perf_counter()
        result = func(*args, **kwargs)        # ← calls the original function
        end    = time.perf_counter()
        elapsed_ms = (end - start) * 1000
        print(f'[timer] {func.__name__} took {elapsed_ms:.1f}ms')
        return result                         # ← returns the original's result unchanged
    return wrapper                            # ← return the wrapper, not the result
```

### SAVE AND TRY

```bash
python -c "
from src.utils.decorators import timer

@timer
def slow_add(a, b):
    import time
    time.sleep(0.05)   # simulate 50ms work
    return a + b

result = slow_add(2, 3)
print('result:', result)
"
```

**You should see:**
```
[timer] slow_add took 50.2ms
result: 5
```

**Change something:** Check `slow_add.__name__`:

```bash
python -c "
from src.utils.decorators import timer

@timer
def slow_add(a, b):
    return a + b

print(slow_add.__name__)
"
```

**Expected:** `wrapper` — NOT `slow_add`. This is the bug `@functools.wraps` fixes.
Leave it broken for now — the next concept block shows the fix.

---

### Concept: `@functools.wraps` — Preserving Function Identity

**What it is:** `@functools.wraps(func)` is itself a decorator applied to the inner
`wrapper` function. It copies the original function's `__name__`, `__doc__`,
`__module__`, `__annotations__`, and `__qualname__` onto `wrapper`.

**The problem before (you just saw it):**

```python
@timer
def slow_add(a, b):
    """Adds two numbers slowly."""
    return a + b

slow_add.__name__  # → 'wrapper'  (should be 'slow_add')
slow_add.__doc__   # → None       (should be 'Adds two numbers slowly.')
```

Why this matters:
- FastAPI uses `func.__name__` to generate OpenAPI operation IDs — all routes become `wrapper`
- `pytest` uses `func.__name__` to label tests in the output — all show as `wrapper`
- Logging, profiling, and error reporting show `wrapper` instead of the real function name
- `help(slow_add)` shows no documentation

**The solution:**

```python
from functools import wraps   # ← import wraps from functools

def timer(func):
    @wraps(func)              # ← apply wraps to the inner function
    def wrapper(*args, **kwargs):
        start  = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        print(f'[timer] {func.__name__} took {elapsed_ms:.1f}ms')
        return result
    return wrapper
```

**What it hides:** The `__wrapped__` attribute chain and attribute copying.
`wraps(func)` sets `wrapper.__wrapped__ = func` (enabling introspection), copies
metadata attributes, and updates `__dict__`. You write one line; Python handles
six attribute assignments.

**Canonical example:** A photocopier that copies both the text AND the original
document's metadata (author, creation date, title). `@wraps` is the metadata copier.

**Project application:** FastAPI reads `func.__name__` to generate route operation IDs.
Without `@wraps`, every decorated route in the API docs would be named `wrapper`.

**Smallest possible example:**

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)             # copy __name__, __doc__, etc. from func to wrapper
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def my_function():
    """This is my function."""
    pass

my_function.__name__  # → 'my_function'  (not 'wrapper')
my_function.__doc__   # → 'This is my function.'
```

**Why it matters here:** The `@timer` decorator in the task API must preserve names
so logging, debugging, and FastAPI route generation all work correctly.

**You will see this again in:**
- Every decorator you write in professional code should include `@wraps`
- Open-source libraries (Flask, Django, SQLAlchemy) use `@wraps` in all their decorators
- Standard Python interview question: "Why do you need `@wraps` in a decorator?"

**Watch for:** `@wraps(func)` goes on the INNER wrapper function, not the outer decorator.
`@wraps` on the outer function does nothing useful — `func` doesn't exist there.

---

## Step 2 — Fix `@timer` With `@functools.wraps`

Update `src/utils/decorators.py`:

```python
# src/utils/decorators.py
import time
from functools import wraps     # ← add this import


def timer(func):
    @wraps(func)                 # ← add this line (preserves __name__, __doc__)
    def wrapper(*args, **kwargs):
        start      = time.perf_counter()
        result     = func(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        print(f'[timer] {func.__name__} took {elapsed_ms:.1f}ms')
        return result
    return wrapper
```

### SAVE AND TRY

```bash
python -c "
from src.utils.decorators import timer

@timer
def slow_add(a, b):
    '''Adds two numbers.'''
    import time; time.sleep(0.01)
    return a + b

print(slow_add.__name__)   # should be 'slow_add'
print(slow_add.__doc__)    # should be 'Adds two numbers.'
slow_add(2, 3)
"
```

**You should see:**
```
slow_add
Adds two numbers.
[timer] slow_add took 10.2ms
```

**Change something:** Remove `@wraps(func)` from the decorator. Rerun.
Expected: `__name__` returns `'wrapper'` again. Put `@wraps(func)` back.

---

### Concept: Decorators With Arguments — The Factory Pattern

**What it is:** When a decorator needs configuration (`@retry(max_attempts=3)`),
the decorator itself becomes a factory: a function that takes the config and
returns a decorator. There are now three layers instead of two.

**The problem before — trying to write a retry decorator with a hardcoded limit:**

```python
def retry(func):           # max_attempts hardcoded — cannot configure
    @wraps(func)
    def wrapper(*args, **kwargs):
        for _ in range(3):   # always 3 — no flexibility
            try:
                return func(*args, **kwargs)
            except Exception:
                pass
        raise RuntimeError('Max retries exceeded')
    return wrapper

@retry          # works — but always 3 retries
def fragile():
    ...

@retry(max_attempts=5)    # TypeError: retry() takes 1 positional argument but 5 was given
def very_fragile():
    ...
```

**The solution — three layers:**

```python
def retry(max_attempts: int = 3, delay_seconds: float = 0.0):
    # Layer 1: called with config — returns a decorator
    def decorator(func):
        # Layer 2: called with the function — returns wrapper
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Layer 3: called when the decorated function is called
            last_error = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    if attempt < max_attempts and delay_seconds:
                        import time; time.sleep(delay_seconds)
            raise last_error
        return wrapper
    return decorator

@retry(max_attempts=5, delay_seconds=0.1)   # → retry(5, 0.1) → decorator → wrapper
def fragile():
    ...
```

**What it hides:** The two-step application. `@retry(max_attempts=3)` calls `retry(3)`,
which returns `decorator`. Python then applies THAT decorator to the function:
`fragile = decorator(fragile)`. This is the same as `@decorator` — just with the
extra outer call to produce the decorator.

**Canonical example:** A rubber stamp maker. `retry(max_attempts=3)` is ordering the stamp
(the configuration). The stamp itself (`decorator`) is what gets applied to the document
(the function). Using the stamp is what actually puts ink on paper (calling `wrapper`).

**Project application:** `@retry(max_attempts=3, delay_seconds=0.5)` wraps database
calls in the repository layer — if the database is temporarily unavailable, the call
retries up to 3 times with increasing delays before failing.

**Smallest possible example:**

```python
from functools import wraps

def repeat(times: int):           # layer 1: factory — takes config, returns decorator
    def decorator(func):          # layer 2: decorator — takes function, returns wrapper
        @wraps(func)
        def wrapper(*args, **kwargs):  # layer 3: wrapper — called on each function call
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(times=3)
def say_hello():
    print('Hello!')

say_hello()   # prints 'Hello!' three times
```

**Why it matters here:** The task API needs configurable decorators — the retry
count for a database operation is different from the retry count for an external API call.

**You will see this again in:**
- `@pytest.mark.parametrize('x', [1, 2, 3])` — parametrize is a factory
- `@app.get('/tasks')` — `app.get(path)` is a factory returning a decorator
- `@lru_cache(maxsize=128)` — built-in factory decorator in `functools`
- Django: `@login_required(redirect_field_name='next')` — factory pattern

**Watch for:** The common mistake of confusing which layer is which.
`@retry` (no parentheses) is different from `@retry()` (parentheses, no args)
is different from `@retry(max_attempts=3)` (parentheses with args). Only the
last two work with the factory pattern; the first applies the factory function
as a decorator directly (which would pass the function as `max_attempts`).

---

## Step 3 — Add `@retry` and `@validate_not_empty`

Add to `src/utils/decorators.py`:

```python
# src/utils/decorators.py
import time
from functools import wraps


def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start      = time.perf_counter()
        result     = func(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        print(f'[timer] {func.__name__} took {elapsed_ms:.1f}ms')
        return result
    return wrapper


def retry(                                         # ← add this factory
    max_attempts:   int   = 3,
    exceptions:     tuple = (Exception,),          # which exception types to retry on
    delay_seconds:  float = 0.0,
):
    """Retries a function up to max_attempts times on failure."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error: Exception | None = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_error = e
                    if attempt < max_attempts and delay_seconds > 0:
                        time.sleep(delay_seconds)
            raise last_error                       # re-raise the last exception
        return wrapper
    return decorator
```

### SAVE AND TRY

```bash
python -c "
from src.utils.decorators import retry

call_count = {'n': 0}

@retry(max_attempts=3)
def flaky():
    call_count['n'] += 1
    if call_count['n'] < 3:
        raise ValueError('not ready yet')
    return 'success'

result = flaky()
print('result:', result)
print('called:', call_count['n'], 'times')
"
```

**You should see:**
```
result: success
called: 3 times
```

**Change something:** Try exceeding max_attempts:

```bash
python -c "
from src.utils.decorators import retry

@retry(max_attempts=2)
def always_fails():
    raise ValueError('always fails')

try:
    always_fails()
except ValueError as e:
    print('caught:', e)
"
```

**Expected:** `caught: always fails`

---

## Step 4 — Write the Tests

Create `tests/test_decorators.py`:

```python
# tests/test_decorators.py
import pytest
from src.utils.decorators import timer, retry


class TestTimer:

    def test_preserves_function_name(self) -> None:
        @timer
        def my_function() -> None:
            pass

        assert my_function.__name__ == 'my_function'   # not 'wrapper'

    def test_preserves_docstring(self) -> None:
        @timer
        def my_function() -> None:
            """This is the docstring."""
            pass

        assert my_function.__doc__ == 'This is the docstring.'

    def test_returns_original_return_value(self) -> None:
        @timer
        def add(a: int, b: int) -> int:
            return a + b

        assert add(2, 3) == 5

    def test_passes_all_arguments_through(self) -> None:
        @timer
        def greet(name: str, greeting: str = 'Hello') -> str:
            return f'{greeting}, {name}!'

        assert greet('Alice', greeting='Hi') == 'Hi, Alice!'


class TestRetry:

    def test_succeeds_on_first_attempt(self) -> None:
        @retry(max_attempts=3)
        def always_succeeds() -> str:
            return 'ok'

        assert always_succeeds() == 'ok'

    def test_retries_on_failure_and_eventually_succeeds(self) -> None:
        call_count = {'n': 0}

        @retry(max_attempts=3)
        def flaky() -> str:
            call_count['n'] += 1
            if call_count['n'] < 3:
                raise ValueError('not ready')
            return 'done'

        result = flaky()
        assert result        == 'done'
        assert call_count['n'] == 3    # called 3 times total

    def test_raises_after_max_attempts_exceeded(self) -> None:
        @retry(max_attempts=2)
        def always_fails() -> None:
            raise ValueError('always fails')

        with pytest.raises(ValueError, match='always fails'):
            always_fails()

    def test_preserves_function_name_with_wraps(self) -> None:
        @retry(max_attempts=3)
        def my_function() -> None:
            pass

        assert my_function.__name__ == 'my_function'

    def test_only_retries_specified_exception_types(self) -> None:
        """Exceptions not in the 'exceptions' tuple should propagate immediately."""
        @retry(max_attempts=3, exceptions=(ConnectionError,))
        def raises_value_error() -> None:
            raise ValueError('not a connection error')

        with pytest.raises(ValueError):
            raises_value_error()   # should NOT retry — ValueError is not ConnectionError
```

### SAVE AND TRY

```bash
pytest tests/test_decorators.py -v
```

**You should see:**
```
tests/test_decorators.py::TestTimer::test_preserves_function_name PASSED
tests/test_decorators.py::TestTimer::test_preserves_docstring PASSED
tests/test_decorators.py::TestTimer::test_returns_original_return_value PASSED
tests/test_decorators.py::TestTimer::test_passes_all_arguments_through PASSED
tests/test_decorators.py::TestRetry::test_succeeds_on_first_attempt PASSED
tests/test_decorators.py::TestRetry::test_retries_on_failure_and_eventually_succeeds PASSED
tests/test_decorators.py::TestRetry::test_raises_after_max_attempts_exceeded PASSED
tests/test_decorators.py::TestRetry::test_preserves_function_name_with_wraps PASSED
tests/test_decorators.py::TestRetry::test_only_retries_specified_exception_types PASSED

9 passed
```

**Change something:** Remove `@wraps(func)` from the `timer` decorator. Rerun.
Expected: `test_preserves_function_name` and `test_preserves_docstring` fail.
Put `@wraps(func)` back.

---

### Concept: Stacking Decorators

**What it is:** When you apply two decorators to one function, both wrap it —
the innermost decorator wraps the function first, then the outer one wraps the result.

**The problem before (trying to time AND retry):**

```python
@timer
def fetch_tasks():
    ...

# You want to also retry. You have to manually wrap:
fetch_tasks = retry(max_attempts=3)(timer(fetch_tasks))  # hard to read
```

**The solution — stack them with `@`:**

```python
@retry(max_attempts=3)
@timer
def fetch_tasks():
    ...

# Equivalent to:
# fetch_tasks = retry(max_attempts=3)(timer(fetch_tasks))
```

**What it hides:** The application order. Bottom decorator applies first.
`@timer` wraps `fetch_tasks` first → `timer_wrapped`. Then `@retry` wraps
`timer_wrapped` → `retry_wrapped`. When called: `retry_wrapped()` → `timer_wrapped()` → `fetch_tasks()`.

**Canonical example:** Layers of a sandwich. `@timer` is the first layer of bread (inner).
`@retry` is the second layer (outer). The filling is your function. Eating the sandwich
(calling) starts from the outside bread in.

**Project application:** `@retry(max_attempts=3)` + `@timer` on database calls gives both
timing and retry — neither knows about the other.

**Smallest possible example:**

```python
def uppercase(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

def exclaim(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs) + '!'
    return wrapper

@exclaim
@uppercase
def greet(name):
    return f'hello {name}'

greet('Alice')  # → 'HELLO ALICE!'
# order: uppercase('hello Alice') → 'HELLO ALICE', then exclaim → 'HELLO ALICE!'
```

**You will see this again in:**
- FastAPI: `@app.get('/tasks')` + `@requires_auth` — two decorators, one handler
- Django: `@login_required` + `@permission_required` — stacked access controls
- Flask: `@app.route('/admin') + @admin_required`

**Watch for:** Order matters for stacked decorators. `@timer @retry` times the retries.
`@retry @timer` times only one attempt. These are not equivalent.

---

## 🎯 Challenge: Build `@validate_not_empty`

**You know:** The three-layer factory pattern, `@functools.wraps`, `inspect.signature`.

**Task:** Build a `@validate_not_empty(*arg_names)` decorator factory that raises
`ValueError` if any of the named string arguments are empty or whitespace-only:

```python
@validate_not_empty('title', 'description')
def create_task(title: str, description: str, priority: int = 1) -> dict:
    return {'title': title, 'description': description}

create_task('My task', 'details')   # works fine
create_task('', 'details')           # raises ValueError: 'title' cannot be empty
create_task('task', '   ')           # raises ValueError: 'description' cannot be empty
```

The decorator must work whether arguments are passed positionally or as keyword arguments.
Use `inspect.signature(func).bind(*args, **kwargs)` to map argument names to values.

Write 4 tests first (all should fail), then implement.

---

<details>
<summary>▶ Show Solution</summary>

```python
import inspect
from functools import wraps


def validate_not_empty(*arg_names: str):
    """Factory: raises ValueError if any named string argument is empty or whitespace."""
    def decorator(func):
        sig = inspect.signature(func)   # capture the function's signature once

        @wraps(func)
        def wrapper(*args, **kwargs):
            # Bind positional and keyword arguments to parameter names:
            bound = sig.bind(*args, **kwargs)
            bound.apply_defaults()                # fill in default values

            for name in arg_names:
                if name not in bound.arguments:
                    continue
                value = bound.arguments[name]
                if isinstance(value, str) and not value.strip():
                    raise ValueError(f"'{name}' cannot be empty")

            return func(*args, **kwargs)
        return wrapper
    return decorator
```

**Tests:**
```python
def test_raises_when_positional_arg_is_empty() -> None:
    @validate_not_empty('title')
    def f(title: str) -> str:
        return title

    with pytest.raises(ValueError, match='title'):
        f('')

def test_raises_when_keyword_arg_is_whitespace() -> None:
    @validate_not_empty('title')
    def f(title: str = 'default') -> str:
        return title

    with pytest.raises(ValueError):
        f(title='   ')

def test_passes_when_all_args_are_valid() -> None:
    @validate_not_empty('title')
    def f(title: str) -> str:
        return title

    assert f('My task') == 'My task'

def test_preserves_function_name() -> None:
    @validate_not_empty('title')
    def my_function(title: str) -> str:
        return title

    assert my_function.__name__ == 'my_function'
```

**Key insight:** `inspect.signature(func).bind(*args, **kwargs)` maps both positional and
keyword arguments to their parameter names, regardless of how the caller passed them.
`bound.apply_defaults()` fills in values for parameters that have defaults and were not
supplied. This is how FastAPI's dependency injection system introspects function signatures.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `@wraps` preserves name | `decorated.__name__` | Matches original function name |
| `@wraps` preserves docstring | `decorated.__doc__` | Matches original docstring |
| Return value passes through | Call decorated, check result | Same as undecorated |
| `@retry` retries on failure | Fail N-1 times, succeed | Returns result after N calls |
| `@retry` exhausts and re-raises | Always fail | Original exception raised |
| Factory pattern | `@retry(max_attempts=5)` | Configures the wrapper |
| Stacking order | `@a @b def f()` — call f | `a`'s wrapper executes first |

---

## Quick Check Answers

**1. `func.__name__` returns `'wrapper'`. What did you forget?**

`@functools.wraps(func)` on the inner `wrapper` function inside the decorator.
Without it, the decorated function's `__name__` is the inner `wrapper` function's name,
not the original. `@wraps(func)` copies `__name__`, `__doc__`, `__module__`, and other
attributes from `func` onto `wrapper`, making the wrapper look identical to the original
from the outside.

**2. `@a @b def f()` — which decorator runs first when calling `f()`? Which runs first when being applied?**

Application order (at import time): bottom up — `b` is applied first, producing `b_wrapped_f`.
Then `a` is applied to that: `a_wrapped_b_wrapped_f`.

Execution order (when `f()` is called): top down — `a`'s wrapper runs first (outermost),
calls `b`'s wrapper, which calls the original `f`.

**3. `@retry(max_attempts=3)` — does `retry` receive the function directly?**

No. `@retry(max_attempts=3)` calls `retry(max_attempts=3)` first, which returns a decorator
(the middle layer). That decorator then receives the function. If `retry` received the
function directly, it would be a simple decorator (no arguments) — `@retry` not `@retry(3)`.
The parentheses indicate "call this to get a decorator," not "this IS the decorator."
