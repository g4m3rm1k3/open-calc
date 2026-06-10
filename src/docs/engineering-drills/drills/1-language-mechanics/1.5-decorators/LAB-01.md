# DRILL 1.5 — Python Decorators From First Principles
## LAB-01: Build Three Real Decorators

**Standalone.** No prerequisites. One Python file throughout.
**Time:** 90–120 minutes.
**You will build:** `@timer`, `@retry`, and `@cache` — from nothing.

---

## Quick Check

Answer before you read. Check answers at the bottom.

**1.** What does `@timer` actually do to `my_func`?
- A) It runs `my_func` inside a timer
- B) It reassigns `my_func` to `timer(my_func)`
- C) It creates a new scope around `my_func`
- D) It modifies `my_func` in place

**2.** Why does `functools.wraps` exist?
- A) To make the wrapper run faster
- B) To preserve the original function's `__name__` and `__doc__`
- C) To allow nested decorators
- D) To prevent infinite recursion

**3.** `@retry(max_attempts=3)` is called a decorator factory. Why?
- A) Because it retries multiple times
- B) Because it takes arguments and returns a decorator — not a decorator itself
- C) Because it creates new functions
- D) Because it uses a class

**4.** What is a closure?
- A) A function with no return value
- B) A function defined inside a class
- C) An inner function that captures variables from its enclosing scope
- D) A function that closes a file handle

---

## Concept Block

### What It Is

A decorator is a function that takes a function and returns a different function.

That is the complete definition. Everything else is detail.

```
decorator(original_func) --> wrapper_func
```

When Python sees `@timer` above a function definition, it executes:

```python
my_func = timer(my_func)
```

The `@` symbol is syntax sugar. It does nothing else.

### The Problem Before Decorators

You have 12 functions. You want to time all of them. You write this:

```python
import time

def fetch_user(user_id):
    start = time.perf_counter()
    # ... actual work ...
    result = database.get(user_id)
    end = time.perf_counter()
    print(f"fetch_user took {end - start:.4f}s")
    return result

def save_user(user):
    start = time.perf_counter()
    # ... actual work ...
    result = database.save(user)
    end = time.perf_counter()
    print(f"save_user took {end - start:.4f}s")
    return result
```

You have duplicated the timing logic 12 times. When you want to change how timing works, you edit 12 places. This violates the principle that one piece of knowledge lives in one place.

Decorators solve this by letting you write the wrapping logic once and attach it to any function with a single line.

### The Solution

```python
@timer
def fetch_user(user_id):
    return database.get(user_id)

@timer
def save_user(user):
    return database.save(user)
```

The timing logic lives in `timer`. Both functions get it. You change it once.

### What It Hides

The `@` syntax hides a function call and a variable reassignment.

```python
@timer
def fetch_user(user_id):
    ...
```

Is literally identical to:

```python
def fetch_user(user_id):
    ...
fetch_user = timer(fetch_user)
```

The name `fetch_user` now points to the wrapper function, not the original. The original still exists — the wrapper holds a reference to it — but the name in the module's namespace has been replaced.

### Canonical Example

```python
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

@shout
def greet(name):
    return f"hello, {name}"

print(greet("mike"))  # HELLO, MIKE
```

### Project Application

This lab builds three decorators used in real production code:
- `@timer` — profiling. Used to find slow functions without modifying them.
- `@retry` — resilience. Used when calling flaky external APIs.
- `@cache` — performance. Used when pure functions are called with the same args repeatedly.

### Constraints

- A decorator must accept exactly one argument: the function being decorated.
- A decorator must return a callable (the wrapper).
- The wrapper must accept `*args` and `**kwargs` to work with any function signature.
- `@functools.wraps(func)` must be applied to the wrapper — or you lose the original function's identity.

### Failure Modes

| Mistake | Symptom |
|---------|---------|
| Forgetting to return the wrapper | `my_func` becomes `None` |
| Not using `*args, **kwargs` | Wrapper fails if original takes arguments |
| Missing `@functools.wraps` | `my_func.__name__` is `"wrapper"` — debugger lies |
| Calling `@retry` instead of `@retry(3)` | `retry` receives the function, not an int — TypeError on call |
| Mutating the cache dict key | Dict keys must be hashable — lists crash silently |

### Operational Reality

Decorators are everywhere in Python production code:

- `@app.route("/users")` in Flask/FastAPI — registers a URL handler
- `@property` — turns a method into an attribute
- `@staticmethod`, `@classmethod` — change method behavior in classes
- `@pytest.mark.parametrize` — runs a test with multiple inputs
- `@dataclass` — adds `__init__`, `__repr__`, `__eq__` to a class automatically

Every time you use `@`, you are using a decorator. Understanding the mechanism means you can write your own — and read other people's without being mystified.

### You Will See This Again In

- FastAPI route handlers (`@app.get`, `@app.post`)
- Django view decorators (`@login_required`, `@permission_required`)
- pytest fixtures and marks
- SQLAlchemy event listeners
- `@property` in any class-heavy Python code

### Watch For

- **Stacked decorators** — `@a` on top of `@b` applies bottom-up: `a(b(func))`
- **Class-based decorators** — a class with `__call__` can act as a decorator
- **`functools.lru_cache`** — Python's built-in cache decorator; your `@cache` here is a simplified version
- **Decorator factories vs decorators** — if it takes arguments, it returns a decorator; if it takes a function, it IS the decorator

---

## Setup

Create a new folder and file:

```
mkdir decorators-drill
cd decorators-drill
# Create one file: decorators.py
```

You need no packages for the first four steps. Step 5 uses only the standard library.

---

## Step 1 — Functions Are Values

Before decorators make sense, you need to see that functions are objects. They can be assigned to variables, passed as arguments, and returned from other functions.

Create `decorators.py`:

```python
# decorators.py

# Functions are objects — they have a type, an id, attributes.
# This is not a special feature. In Python, EVERYTHING is an object.

def greet(name):
    """Say hello."""
    return f"Hello, {name}!"

# Assign the function to a variable.
# No parentheses — we are NOT calling it. We are referencing it.
say_hello = greet

# Both names point to the same function object.
print(greet("Mike"))      # Hello, Mike!
print(say_hello("Mike"))  # Hello, Mike!  -- same object, different name

# Functions have attributes.
print(greet.__name__)     # greet  -- the name baked in at definition time
print(greet.__doc__)      # Say hello.


# --- Functions can be PASSED as arguments ---

def apply(func, value):
    """Call func with value and return the result."""
    return func(value)   # func is just a variable holding a callable

result = apply(greet, "world")   # pass greet without calling it
print(result)  # Hello, world!


# --- Functions can be RETURNED from other functions ---

def get_greeter(language):
    """Return a different greeting function depending on language."""
    def english(name):
        return f"Hello, {name}!"
    def spanish(name):
        return f"Hola, {name}!"

    if language == "es":
        return spanish    # return the function object, not the result of calling it
    return english

greeter = get_greeter("es")   # greeter now points to the spanish function
print(greeter("Carlos"))      # Hola, Carlos!
print(greeter.__name__)       # spanish  -- the inner function's real name
```

### SAVE AND TRY

```
python decorators.py
```

Expected output:
```
Hello, Mike!
Hello, Mike!
greet
Say hello.
Hello, world!
Hola, Carlos!
spanish
```

**Change something:** Replace `get_greeter("es")` with `get_greeter("en")`. Confirm output changes to `Hello, Carlos!`.

**What just happened:** `greet` and `say_hello` are two names for the same function object. `apply` received the function object and called it. `get_greeter` created two inner functions and returned one of them — returning the object, not the result. This is the foundation that makes decorators possible.

---

## Step 2 — Closures: Inner Functions That Remember

A closure is an inner function that captures variables from the enclosing scope. Those variables persist as long as the inner function exists — even after the outer function has returned and its local scope is gone.

Add this to `decorators.py`:

```python
# --- CLOSURES ---
# A closure is created when an inner function uses a variable
# from the outer function's scope.

def make_counter():
    """Return a function that counts how many times it has been called."""
    count = 0   # this variable lives in make_counter's local scope

    def counter():
        nonlocal count    # tell Python: 'count' is from the enclosing scope, not a new local
        count += 1        # modify the captured variable
        return count

    return counter        # return the inner function — 'count' travels with it


# make_counter() has returned. Its local scope is gone.
# But 'counter' still holds a reference to 'count'.
my_counter = make_counter()

print(my_counter())   # 1
print(my_counter())   # 2
print(my_counter())   # 3

# A second counter is independent — its own copy of 'count'.
other_counter = make_counter()
print(other_counter())  # 1  -- starts fresh
print(my_counter())     # 4  -- my_counter remembers where it was


# Inspect the closure.
# __closure__ is a tuple of 'cell' objects, one per captured variable.
print(my_counter.__closure__)          # (<cell at 0x...>,)
print(my_counter.__closure__[0].cell_contents)  # 4  -- the current value of 'count'
```

### SAVE AND TRY

```
python decorators.py
```

Expected output (the hex address will differ on your machine):
```
Hello, Mike!
Hello, Mike!
greet
Say hello.
Hello, world!
Hola, Carlos!
spanish
1
2
3
1
4
(<cell at 0x...>,)
4
```

**Change something:** Call `my_counter()` five more times after the existing calls. Confirm the count continues from 5 to 9.

**What just happened:** `count` is a "free variable" — defined in `make_counter` but referenced inside `counter`. Python packages it into a closure cell. Every call to `my_counter()` reads and updates the same cell. This is how decorators remember state between calls.

---

## Step 3 — Build `@timer` Manually, Then With Syntax

Now you have the pieces: functions as values, closures. A decorator is just a function that uses both.

Add this to `decorators.py`:

```python
import time

# --- BUILD @timer MANUALLY ---

# Step A: write the decorator as a plain function.
# It takes a function, returns a wrapper.
def timer(func):
    """Wrap func and print how long it took to run."""

    def wrapper(*args, **kwargs):
        # *args catches any positional arguments the original function takes.
        # **kwargs catches any keyword arguments.
        # This makes the wrapper work with ANY function signature.

        start = time.perf_counter()      # high-resolution timer
        result = func(*args, **kwargs)   # call the original function
        end = time.perf_counter()

        elapsed = end - start
        print(f"[timer] {func.__name__} took {elapsed:.6f}s")

        return result   # return what the original function returned — don't swallow it

    return wrapper   # return the wrapper, not a result


# Step B: apply WITHOUT the @ syntax.
# This is what @ does — make sure you see it with your own eyes.
def slow_add(a, b):
    """Add two numbers slowly."""
    time.sleep(0.1)   # simulate work
    return a + b

# Manually wrap it:
slow_add = timer(slow_add)   # slow_add now points to wrapper

result = slow_add(3, 4)
print(f"Result: {result}")


# Step C: apply WITH @ syntax — identical behavior, cleaner to read.
@timer
def slow_multiply(a, b):
    """Multiply two numbers slowly."""
    time.sleep(0.05)
    return a * b

result = slow_multiply(6, 7)
print(f"Result: {result}")
```

### SAVE AND TRY

```
python decorators.py
```

Expected output (times will vary):
```
...previous output...
[timer] slow_add took 0.100312s
Result: 7
[timer] slow_multiply took 0.050241s
Result: 42
```

**Change something:** Change `time.sleep(0.1)` to `time.sleep(0.5)`. Confirm the timer reports roughly 0.5 seconds.

**What just happened:** `timer` received `slow_add` as its argument `func`. It created `wrapper` — a closure over `func`. `wrapper` starts the clock, calls the original function, stops the clock, prints the result. The name `slow_add` was rebound to `wrapper`. Every subsequent call to `slow_add(3, 4)` runs the wrapper, which runs the original.

---

## Step 4 — `@functools.wraps`: Preserve the Original's Identity

Without `@functools.wraps`, the wrapper replaces the function's identity. The name, docstring, and signature all point to `wrapper` — which has no useful name or doc. This breaks debugging, `help()`, and any tool that inspects function metadata.

Add this to `decorators.py`:

```python
import functools

# --- THE PROBLEM: what does slow_add look like to Python? ---
print(slow_add.__name__)   # wrapper  -- WRONG. This is the wrapped version.
print(slow_add.__doc__)    # None     -- WRONG. The original doc is gone.

# For 12 timed functions, your debugger shows "wrapper" everywhere.
# Stack traces say "wrapper". help() says "wrapper". This is bad.


# --- THE FIX: functools.wraps ---

def timer_v2(func):
    """Wrap func and print how long it took to run."""

    @functools.wraps(func)   # copy __name__, __doc__, __module__, __qualname__, __annotations__, __dict__
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"[timer] {func.__name__} took {end - start:.6f}s")
        return result

    return wrapper


@timer_v2
def slow_subtract(a, b):
    """Subtract b from a slowly."""
    time.sleep(0.05)
    return a - b

print(slow_subtract.__name__)   # slow_subtract  -- CORRECT
print(slow_subtract.__doc__)    # Subtract b from a slowly.  -- CORRECT

result = slow_subtract(10, 3)
print(f"Result: {result}")


# functools.wraps also preserves __wrapped__ — a reference to the original.
# This lets tools "unwrap" the decorator to inspect the real function.
print(slow_subtract.__wrapped__)   # <function slow_subtract at 0x...>
```

### SAVE AND TRY

```
python decorators.py
```

Expected output (after previous output):
```
wrapper
None
slow_subtract
Subtract b from a slowly.
[timer] slow_subtract took 0.050...s
Result: 7
<function slow_subtract at 0x...>
```

**Change something:** Remove `@functools.wraps(func)` from `timer_v2` and rerun. Confirm `slow_subtract.__name__` prints `wrapper` again. Then put it back.

**What just happened:** `functools.wraps` copies metadata attributes from `func` onto `wrapper`. It also sets `wrapper.__wrapped__ = func`, which lets `inspect.unwrap()` see through the decoration. This is not optional in production code — it breaks debugging without it.

---

## Step 5 — `@retry`: A Decorator Factory

`@retry(max_attempts=3)` takes an argument. That argument is not a function — it is a configuration value. So `retry` cannot be a decorator directly. It must return a decorator.

The pattern: `retry(3)` returns a decorator. That decorator takes a function and returns a wrapper.

That is three layers of nesting. Each layer has a job.

Add this to `decorators.py`:

```python
import random

# --- DECORATOR FACTORY ---
# retry is NOT a decorator. It is a function that RETURNS a decorator.
# Call it: retry(max_attempts=3)
# That returns: a decorator that wraps the function with retry logic.

def retry(max_attempts=3, exceptions=(Exception,)):
    """
    Decorator factory.
    max_attempts: how many times to try before giving up
    exceptions: which exception types to catch and retry on
    """
    # Layer 1: retry() — receives configuration, returns decorator
    def decorator(func):
        # Layer 2: decorator() — receives the function, returns wrapper
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Layer 3: wrapper() — runs on every call to the decorated function
            last_exception = None

            for attempt in range(1, max_attempts + 1):   # attempt 1, 2, ..., max_attempts
                try:
                    result = func(*args, **kwargs)
                    if attempt > 1:
                        # Only print success message if we actually retried
                        print(f"[retry] {func.__name__} succeeded on attempt {attempt}")
                    return result   # success — exit immediately

                except exceptions as e:
                    last_exception = e
                    print(f"[retry] {func.__name__} failed on attempt {attempt}/{max_attempts}: {e}")

                    if attempt < max_attempts:
                        time.sleep(0.05)   # brief pause before retrying

            # All attempts failed — re-raise the last exception
            raise last_exception

        return wrapper
    return decorator


# --- Test it with a flaky function ---

# This function fails roughly 70% of the time — simulates an unstable API.
attempt_count = 0

@retry(max_attempts=5)
def flaky_api_call():
    """Call an API that sometimes fails."""
    global attempt_count
    attempt_count += 1

    if random.random() < 0.7:   # 70% chance of failure
        raise ConnectionError("Network timeout")

    return {"status": "ok", "data": [1, 2, 3]}


# Seed random for reproducible output in the test
random.seed(42)

try:
    result = flaky_api_call()
    print(f"Got result: {result}")
except ConnectionError as e:
    print(f"All retries exhausted: {e}")

print(f"Total attempts made: {attempt_count}")
```

### SAVE AND TRY

```
python decorators.py
```

Expected output (after previous output, exact failures depend on random seed):
```
[retry] flaky_api_call failed on attempt 1/5: Network timeout
[retry] flaky_api_call failed on attempt 2/5: Network timeout
[retry] flaky_api_call succeeded on attempt 3
Got result: {'status': 'ok', 'data': [1, 2, 3]}
Total attempts made: 3
```

**Change something:** Change `random.seed(42)` to `random.seed(99)`. The failure pattern will differ — some seeds will exhaust all 5 attempts and raise.

**What just happened:** `retry(max_attempts=5)` was evaluated first. It returned `decorator`. Python then called `decorator(flaky_api_call)`, which returned `wrapper`. The name `flaky_api_call` was rebound to `wrapper`. Each call to `flaky_api_call()` runs `wrapper`, which loops up to 5 times, catching `ConnectionError` each time, until it either succeeds or exhausts attempts.

**Why three layers?** Because `@retry(max_attempts=5)` is two operations: call `retry(5)` to get a decorator, then apply that decorator to the function. Without the outer layer, `retry` would receive the function directly and have nowhere to put `max_attempts`.

---

## Step 6 — `@cache`: Memoization With a Dict

Memoization is a specific optimization: if a pure function has already been called with these exact arguments, return the stored answer instead of computing it again.

The implementation is a dict inside the decorator's closure.

Add this to `decorators.py`:

```python
# --- MEMOIZATION / CACHE ---

def cache(func):
    """
    Store return values keyed by arguments.
    On repeat calls with the same arguments, return the stored value.
    The function is NOT called again.
    """
    stored = {}   # the cache dict lives in this closure — persists across calls

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Build a hashable key from the arguments.
        # kwargs must be sorted to make ("a", 1, "b", 2) == ("b", 2, "a", 1)
        key = (args, tuple(sorted(kwargs.items())))

        if key in stored:
            print(f"[cache] {func.__name__}{args} -- cache HIT")
            return stored[key]   # return immediately, don't call the function

        print(f"[cache] {func.__name__}{args} -- cache MISS, computing...")
        result = func(*args, **kwargs)   # actually call the function
        stored[key] = result             # store the result
        return result

    # Expose the cache dict for inspection
    wrapper.cache = stored
    return wrapper


# --- Fibonacci: the canonical memoization example ---
# Without caching, fib(n) has exponential time complexity O(2^n).
# fib(35) makes 29 million recursive calls.
# With caching, each value is computed once: O(n) total calls.

call_count = 0

@cache
def fib(n):
    """Return the nth Fibonacci number."""
    global call_count
    call_count += 1   # track how many times the function actually runs

    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)


# Time it without cache — reset first
import sys
sys.setrecursionlimit(10000)

print("\n--- Fibonacci with @cache ---")
call_count = 0
start = time.perf_counter()
result = fib(10)
end = time.perf_counter()

print(f"fib(10) = {result}")
print(f"Function body executed {call_count} times (expected: 11)")
print(f"Time: {end - start:.6f}s")

# Call again — everything should be a cache hit
print("\n--- Call fib(10) again ---")
result2 = fib(10)
print(f"fib(10) = {result2}")

# Inspect the cache
print(f"\nCache has {len(fib.cache)} entries")
print(f"fib.cache[((5,), ())] = {fib.cache[((5,), ())]}")   # fib(5) = 5
```

### SAVE AND TRY

```
python decorators.py
```

Expected output (the cache HIT/MISS lines for fib(10) show the recursion tree):
```
--- Fibonacci with @cache ---
[cache] fib(10) -- cache MISS, computing...
[cache] fib(9) -- cache MISS, computing...
[cache] fib(8) -- cache MISS, computing...
[cache] fib(7) -- cache MISS, computing...
[cache] fib(6) -- cache MISS, computing...
[cache] fib(5) -- cache MISS, computing...
[cache] fib(4) -- cache MISS, computing...
[cache] fib(3) -- cache MISS, computing...
[cache] fib(2) -- cache MISS, computing...
[cache] fib(1) -- cache MISS, computing...
[cache] fib(0) -- cache MISS, computing...
[cache] fib(1) -- cache HIT
[cache] fib(2) -- cache HIT
[cache] fib(3) -- cache HIT
[cache] fib(4) -- cache HIT
[cache] fib(5) -- cache HIT
[cache] fib(6) -- cache HIT
[cache] fib(7) -- cache HIT
[cache] fib(8) -- cache HIT
[cache] fib(9) -- cache HIT
fib(10) = 55
Function body executed 11 times (expected: 11)
Time: 0.000...s

--- Call fib(10) again ---
[cache] fib(10) -- cache HIT
fib(10) = 55

Cache has 11 entries
fib.cache[((5,), ())] = 5
```

**Change something:** Call `fib(30)` and time it. Then clear the cache with `fib.cache.clear()` and call `fib(30)` again. Notice that after clearing, it recomputes — but still only 31 calls, not 2^30.

**What just happened:** The `stored` dict is a closure variable inside `cache`. It persists for the entire lifetime of the decorated function. The first call to `fib(10)` triggers 11 real computations (fib(0) through fib(10)) — but each intermediate call that would recompute (like `fib(8)` being needed by both `fib(10)` and `fib(9)`) hits the cache instead. Without caching, `fib(10)` makes 177 function calls.

---

## Final File: Everything Together

At this point your `decorators.py` contains all three decorators and their demos. The full file should run start to finish with:

```
python decorators.py
```

And produce all the expected outputs from Steps 1–6 in sequence.

**Verify the core contracts:**

```python
# Run these at the bottom of your file to verify everything works:
assert slow_subtract.__name__ == "slow_subtract"     # wraps preserved the name
assert slow_subtract.__doc__ is not None              # wraps preserved the doc
assert fib(5) == 5                                    # cache returns correct values
assert fib(10) == 55
assert len(fib.cache) == 11                           # 11 unique inputs cached
print("\nAll assertions passed.")
```

---

## Challenge — `@rate_limit`

Write a `@rate_limit(calls_per_second=N)` decorator that raises `RateLimitError` if the decorated function is called more than N times in any one-second window.

**Requirements:**
- Raise a custom `RateLimitError(message)` exception — do not reuse built-in exceptions
- Use `time.time()` to get the current timestamp
- Use `collections.deque` to store timestamps of recent calls
- Remove timestamps older than 1 second before checking the count
- The decorator must accept the rate as an argument: `@rate_limit(calls_per_second=5)`
- Apply `@functools.wraps`

**Starter:**

```python
from collections import deque
import time
import functools

class RateLimitError(Exception):
    """Raised when a rate-limited function is called too frequently."""
    pass

def rate_limit(calls_per_second):
    def decorator(func):
        recent_calls = deque()   # stores timestamps of recent calls

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            # TODO: remove timestamps older than 1 second
            # TODO: if len(recent_calls) >= calls_per_second, raise RateLimitError
            # TODO: record this call's timestamp
            # TODO: call and return func(*args, **kwargs)
            pass

        return wrapper
    return decorator


@rate_limit(calls_per_second=3)
def get_quote():
    """Fetch a quote from an API."""
    return "The best way out is always through."


# Test: call 5 times rapidly — first 3 should succeed, 4th and 5th should raise
for i in range(5):
    try:
        result = get_quote()
        print(f"Call {i+1}: {result}")
    except RateLimitError as e:
        print(f"Call {i+1}: RATE LIMITED — {e}")
```

**When done:** Calls 1–3 succeed. Calls 4–5 raise `RateLimitError`. Wait 1 second and call again — it should succeed again.

**Stuck? Ask AI:** "I have a rate_limit decorator using deque. How do I remove timestamps older than 1 second using popleft()?"

---

## Quick Check Answers

**1. B** — `@timer` is syntactic sugar for `my_func = timer(my_func)`. The name `my_func` is rebound to whatever `timer` returns. See Step 3: "This is what @ does — make sure you see it with your own eyes."

**2. B** — Without `@functools.wraps`, `slow_add.__name__` returns `"wrapper"` and `slow_add.__doc__` returns `None`. Step 4 demonstrates this explicitly: first print shows `wrapper`, `None`; after adding `@functools.wraps`, the prints show the correct values.

**3. B** — `retry(max_attempts=3)` returns a decorator. The decorator takes a function. The function takes arguments. Three layers. Step 5 explains: "Because `@retry(max_attempts=5)` is two operations: call `retry(5)` to get a decorator, then apply that decorator to the function."

**4. C** — An inner function that captures variables from its enclosing scope. The `counter` function in Step 2 closes over `count`. Even after `make_counter()` returns, `count` persists inside the closure cell accessible via `my_counter.__closure__[0].cell_contents`.
