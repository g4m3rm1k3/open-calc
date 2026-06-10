# Drill 4.5 — Decorator Pattern (GoF): Adding Behaviour Without Subclassing

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Pattern category:** GoF Structural
**Official name:** Decorator
**What you will build:** A logging system where each logger can be wrapped with timestamp, level-filter, or format decorators — combinable in any order
**What you will understand:** The GoF Decorator pattern (structural wrapping), how it differs from Python's `@decorator` syntax, and why it beats inheritance for composable behaviour

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Python's `@timer` syntax is called a decorator. The GoF Decorator pattern is also called a decorator. Are they the same thing? What is the key difference?

2. You want a logger that timestamps messages AND filters by level AND formats as JSON. With inheritance, how many subclasses would you need to cover every combination? With the Decorator pattern, how many classes do you need?

3. The Decorator pattern wraps an object in another object with the same interface. Both the wrapper and the wrapped object implement the same interface. What does this allow the caller to do?

4. `logger = TimestampDecorator(LevelFilterDecorator(JsonDecorator(BaseLogger())))`. If you call `logger.log("hello")`, in what order do the decorators execute?

*(Answers at the bottom.)*

---

## The Concept: GoF Decorator Pattern

### Concept: Decorator (GoF Structural)

**What it is:**
The Decorator pattern attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality. The key: both the decorator and the wrapped object implement the same interface, so they are interchangeable from the caller's perspective.

**The problem before — inheritance explosion:**

```python
# You want loggers with combinations of: timestamp, level-filter, JSON format
# With inheritance you need one class per combination:

class Logger:            pass
class TimestampLogger:   pass  # Logger + timestamp
class LevelLogger:       pass  # Logger + level filter
class JsonLogger:        pass  # Logger + JSON
class TimestampLevelLogger:      pass  # Logger + timestamp + level
class TimestampJsonLogger:       pass  # Logger + timestamp + JSON
class LevelJsonLogger:           pass  # Logger + level + JSON
class TimestampLevelJsonLogger:  pass  # Logger + all three

# 3 features = 8 classes (2^3)
# 4 features = 16 classes
# Each combination must be anticipated and written in advance.
# Adding a 4th feature requires 8 more classes.
```

**The solution — structural wrapping:**

```python
class Logger:               # base interface
    def log(self, msg): ...

class TimestampDecorator:   # wraps any Logger
    def __init__(self, inner: Logger): self._inner = inner
    def log(self, msg): self._inner.log(f"[{timestamp()}] {msg}")

class LevelDecorator:       # wraps any Logger
    def __init__(self, inner: Logger, level: str): ...
    def log(self, msg): self._inner.log(f"[{level}] {msg}")

# Combine at runtime — no new classes needed:
logger = TimestampDecorator(LevelDecorator(BaseLogger(), "INFO"))
logger.log("hello")   # → "[2026-05-15] [INFO] hello"
```

**Pattern category:** GoF Structural — about how classes and objects are composed to form larger structures.

**Tradeoff:** Stacking many decorators creates deep call chains that can be hard to debug. The order of decorators matters — `TimestampDecorator(LevelDecorator(x))` produces different output than `LevelDecorator(TimestampDecorator(x))`. Errors in deeply nested decorators have long stack traces.

**How it differs from Python's `@decorator` syntax:**
Python's `@timer` wraps a FUNCTION with another function — it is a higher-order function that returns a new function. The GoF Decorator wraps an OBJECT with another object — both implement the same interface. Python's syntax is inspired by the pattern but operates at the function level, not the object level. Python's `@decorator` is a compile-time transformation; GoF Decorator is a runtime composition.

**What it hides:**
The wrapping chain. The caller holds a reference to the outermost decorator and calls `log()` — it does not know or care how many wrappers are in the chain or what they do. The invariant: the interface is preserved at every layer. A `TimestampDecorator` is a `Logger`, so it can be wrapped again by a `LevelDecorator` without the outer wrapper knowing what's inside.

**Canonical example:**
Clothing layers. You put on a shirt (base), then a sweater (decorator adds warmth), then a jacket (decorator adds wind resistance). Each layer wraps the previous one. You can remove the jacket without removing the sweater. You cannot have worn three layers at once with only one piece of clothing. The Decorator pattern is runtime layering of behaviour.

**Constraints:**
- All decorators and the base class must implement the same interface — otherwise the chain breaks
- Decorator order is significant — the outermost decorator processes input first and output last
- Removing a decorator in the middle of a chain requires rebuilding the chain
- Identity comparison fails: `isinstance(decorated_logger, BaseLogger)` is False

**Failure modes:**
- Interface drift: a decorator adds a method not in the base interface — callers of that decorator can't work with the unwrapped base object
- Infinite wrapping: a decorator wraps itself — stack overflow on first call
- Shared state in decorators: if a decorator holds mutable state, it must be thread-safe when used in concurrent contexts

**Operational reality:**
Python's standard library uses Decorator: `io.BufferedReader` wraps `io.RawIOBase` (adds buffering), `io.TextIOWrapper` wraps `io.BufferedIOBase` (adds text encoding). `functools.lru_cache` wraps a function with caching. Middleware in web frameworks (Django, Express) is the Decorator pattern on HTTP handlers. Java's `BufferedInputStream(FileInputStream(...))` is a classic example.

**You will see this again in:**
Web framework middleware (Django middleware, Flask before/after request hooks, Express middleware), Python's `io` module, Java's stream wrappers, database connection wrappers, authentication layers on HTTP handlers.

**Watch for:**
Decorator order changes the result. If timestamp wraps level-filter, the timestamp is outside the level prefix. If level-filter wraps timestamp, the level prefix is outside the timestamp. Think about which transformation should happen first (innermost) and which last (outermost).

---

## Step 1 — Base Logger and Interface

Create `loggers.py`:

```python
# loggers.py — Decorator pattern for a composable logging system
from abc import ABC, abstractmethod
from datetime import datetime
import json

# ── The shared interface ────────────────────────────────────────────────────────

class Logger(ABC):
    """
    The interface that all loggers and decorators must implement.
    Having a shared interface is the REQUIREMENT for the Decorator pattern.
    Without it, decorators cannot be stacked arbitrarily.
    """

    @abstractmethod
    def log(self, message: str, level: str = "INFO") -> None:
        """Log a message at the given level."""
        ...


# ── The base concrete class ────────────────────────────────────────────────────

class ConsoleLogger(Logger):
    """
    The simplest logger — prints directly to stdout.
    This is the 'core' that decorators wrap.
    It knows nothing about timestamps, filtering, or formatting.
    """

    def log(self, message: str, level: str = "INFO") -> None:
        print(message)   # bare print — no formatting


# ── Decorators ─────────────────────────────────────────────────────────────────

class LoggerDecorator(Logger):
    """
    Abstract base for all decorators.
    Stores the inner logger and delegates by default.
    Subclasses override log() to add their behaviour.
    """

    def __init__(self, inner: Logger):
        self._inner = inner   # the wrapped logger (could itself be a decorator)

    def log(self, message: str, level: str = "INFO") -> None:
        self._inner.log(message, level)   # default: delegate unchanged


class TimestampDecorator(LoggerDecorator):
    """Adds an ISO timestamp prefix to every log message."""

    def log(self, message: str, level: str = "INFO") -> None:
        timestamp = datetime.now().isoformat(timespec="seconds")
        # isoformat(timespec="seconds"): "2026-05-15T10:30:45" — omit microseconds
        self._inner.log(f"[{timestamp}] {message}", level)
        # Modify the message, then delegate to the wrapped logger


class LevelFilterDecorator(LoggerDecorator):
    """
    Filters messages below a minimum severity level.
    Level hierarchy: DEBUG < INFO < WARNING < ERROR < CRITICAL
    Messages at or above min_level are passed through; others are dropped.
    """

    LEVELS = {"DEBUG": 0, "INFO": 1, "WARNING": 2, "ERROR": 3, "CRITICAL": 4}

    def __init__(self, inner: Logger, min_level: str = "INFO"):
        super().__init__(inner)
        self._min_level = min_level   # only pass through messages at this level or above

    def log(self, message: str, level: str = "INFO") -> None:
        message_priority = self.LEVELS.get(level, 1)
        minimum_priority = self.LEVELS.get(self._min_level, 1)

        if message_priority >= minimum_priority:
            self._inner.log(message, level)   # above threshold: pass through
        # below threshold: silently drop — do NOT call self._inner.log()


class PrefixDecorator(LoggerDecorator):
    """Adds a fixed prefix to every message — useful for tagging by module or service."""

    def __init__(self, inner: Logger, prefix: str):
        super().__init__(inner)
        self._prefix = prefix

    def log(self, message: str, level: str = "INFO") -> None:
        self._inner.log(f"{self._prefix} {message}", level)


class JsonDecorator(LoggerDecorator):
    """Formats log messages as JSON objects instead of plain text."""

    def log(self, message: str, level: str = "INFO") -> None:
        record = {
            "level":   level,
            "message": message,
        }
        # json.dumps: converts dict to a JSON string — one line, no extra whitespace
        self._inner.log(json.dumps(record), level)
        # Note: inner logger receives the JSON string as the message
        # If inner logger is also a decorator, it will further transform it
```

### SAVE AND TRY

```bash
python -c "
from loggers import ConsoleLogger, TimestampDecorator, PrefixDecorator

# Plain logger
base = ConsoleLogger()
base.log('hello')

# Timestamp + prefix — decorators stack from inside out
logger = PrefixDecorator(TimestampDecorator(ConsoleLogger()), '[APP]')
logger.log('hello')
"
```

**Expected output (timestamp will vary):**
```
hello
[APP] [2026-05-15T10:30:45] hello
```

**Change something:** Swap the nesting order — `TimestampDecorator(PrefixDecorator(ConsoleLogger(), '[APP]'))`. The output changes: `[2026-05-15T10:30:45] [APP] hello`. Decorator order is significant.

---

## Step 2 — Compose and Compare

Add to a new file `demo.py`:

```python
# demo.py — demonstrate composing decorators in different combinations
from loggers import ConsoleLogger, TimestampDecorator, LevelFilterDecorator, PrefixDecorator, JsonDecorator

print("=== Combination 1: Timestamp + Level Filter ===")
logger1 = TimestampDecorator(
    LevelFilterDecorator(
        ConsoleLogger(),
        min_level="WARNING"   # only WARNING and above pass through
    )
)
logger1.log("This is debug", "DEBUG")      # ← filtered out
logger1.log("This is info", "INFO")        # ← filtered out
logger1.log("This is a warning", "WARNING")  # ← passes through
logger1.log("This is an error", "ERROR")  # ← passes through
print()

print("=== Combination 2: JSON + Timestamp + Prefix ===")
logger2 = PrefixDecorator(
    TimestampDecorator(
        JsonDecorator(
            ConsoleLogger()
        )
    ),
    prefix="[SERVICE-A]"
)
logger2.log("User logged in", "INFO")
logger2.log("Payment failed", "ERROR")
print()

print("=== Combination 3: All four in one chain ===")
logger3 = TimestampDecorator(
    PrefixDecorator(
        LevelFilterDecorator(
            JsonDecorator(ConsoleLogger()),
            min_level="INFO"
        ),
        prefix="[PROD]"
    )
)
logger3.log("debug message", "DEBUG")   # filtered
logger3.log("server started", "INFO")
logger3.log("connection refused", "ERROR")
```

### SAVE AND TRY

```bash
python demo.py
```

**Expected output:**
```
=== Combination 1: Timestamp + Level Filter ===
[2026-05-15T10:30:45] This is a warning
[2026-05-15T10:30:45] This is an error

=== Combination 2: JSON + Timestamp + Prefix ===
[SERVICE-A] [2026-05-15T10:30:45] {"level": "INFO", "message": "User logged in"}
[SERVICE-A] [2026-05-15T10:30:45] {"level": "ERROR", "message": "Payment failed"}

=== Combination 3: All four in one chain ===
[2026-05-15T10:30:45] [PROD] {"level": "INFO", "message": "server started"}
[2026-05-15T10:30:45] [PROD] {"level": "ERROR", "message": "connection refused"}
```

**Change something:** Move `TimestampDecorator` inside `JsonDecorator` in Combination 2. The timestamp now appears inside the JSON object as part of the message string — `"message": "[2026-05-15T10:30:45] User logged in"`. Decorator order determines what goes where.

---

## Challenge

**No solution provided. Requirements checklist only.**

Add a `RateLimitDecorator` that limits how many log messages are emitted per second. Messages that exceed the rate limit are silently dropped.

**Requirements checklist:**

- [ ] `RateLimitDecorator` takes `inner: Logger` and `max_per_second: int = 10`
- [ ] Messages within the rate limit pass through to `inner.log()`
- [ ] Messages beyond the rate limit are silently dropped
- [ ] The rate limit resets every second (not a rolling window — a fixed one-second bucket)
- [ ] `RateLimitDecorator` implements `Logger` — it can be used anywhere a `Logger` is expected
- [ ] Combining `TimestampDecorator(RateLimitDecorator(ConsoleLogger(), max_per_second=2))` and sending 10 rapid messages shows only 2 per second
- [ ] Use `time.time()` to track the current second

**Starter:**
```python
import time

class RateLimitDecorator(LoggerDecorator):
    def __init__(self, inner: Logger, max_per_second: int = 10):
        super().__init__(inner)
        self._max = max_per_second
        self._count = 0
        self._window_start = time.time()

    def log(self, message: str, level: str = "INFO") -> None:
        # TODO: check if we're still in the same second
        # TODO: if count < max, pass through and increment count
        # TODO: if count >= max, drop the message
        pass
```

**When you're done:** A loop sending 20 messages rapidly to a `RateLimitDecorator(ConsoleLogger(), max_per_second=3)` prints only 3 messages (the first 3), then drops the rest. Waiting 1 second and sending 5 more prints 3 again.

**Stuck?** Ask AI: "I'm implementing a rate limiter as a GoF Decorator around a Logger interface. I need to track how many messages have been logged in the current one-second window. How do I detect when a new second starts using `time.time()`, and how do I reset the counter for the new window?"

---

## Quick Check Answers

**1. Is Python's `@timer` syntax the same as the GoF Decorator pattern?**
No — they are related concepts but operate at different levels. Python's `@decorator` syntax wraps a FUNCTION with another function at definition time. The GoF Decorator wraps an OBJECT with another object at runtime, where both implement the same interface. Python's syntax is a language feature for higher-order functions; the GoF pattern is an object composition strategy. Python's decorators are typically applied once at class/function definition; GoF decorators are composed at runtime and can be added, removed, or rearranged while the program runs.

**2. Subclasses vs Decorator classes for N features?**
With inheritance: 2^N subclasses to cover every combination (for 3 features: 8 classes). You must anticipate and write every combination in advance. With the Decorator pattern: N+1 classes (one base class plus one class per feature), combined at runtime. For 3 features: 4 classes, but those 4 classes cover all 8 combinations. For 4 features: 5 classes covering 16 combinations. The pattern grows linearly while inheritance grows exponentially.

**3. What does the shared interface allow?**
It allows the caller to treat a decorated object exactly like an undecorated one — and allows decorators to wrap other decorators. Since `TimestampDecorator` implements `Logger`, it can be passed to `LevelFilterDecorator` which also expects a `Logger`. This is structural typing: the chain works regardless of how deep it goes because every link implements the same interface. The caller holds a `Logger` reference — it does not know or care whether it's a `ConsoleLogger`, a `TimestampDecorator`, or a stack of 5 decorators.

**4. Execution order for `TimestampDecorator(LevelFilterDecorator(JsonDecorator(BaseLogger())))`.log("hello")?**
Outside in for processing, inside out for resolution. The call enters `TimestampDecorator.log()` first (outermost), which prepends the timestamp and delegates to `LevelFilterDecorator.log()`, which checks the level and delegates to `JsonDecorator.log()`, which formats as JSON and delegates to `BaseLogger.log()`, which actually prints. So the execution order is: Timestamp → LevelFilter → Json → BaseLogger. Each outer decorator modifies the message and passes it inward. The innermost component (BaseLogger) is the last to act.
