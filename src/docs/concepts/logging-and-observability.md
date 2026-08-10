# Concept: Logging and Structured Logging

**What you'll understand by the end:** why `print()` debugging doesn't scale into a real operational tool, and how to produce log output a machine can search and a human can still read.

**Prerequisites:** none.

## Setup

Python 3's standard library `logging` module — no install needed:
```
python3 -c "import logging; print(logging.__name__)"
```

## The Problem

`print("something happened")` works fine while a developer is watching a terminal during development, but it falls apart the moment a program runs unattended, for a long time, generating far more output than any person will read live: there's no severity ("is this worth waking someone up for?"), no consistent structure a tool could search or aggregate across thousands of lines, and no way to turn the noisy detail off in production while keeping the important messages on — every `print()` is permanently, unconditionally on, or it's deleted.

## The Isolated Example

Unstructured, `print()`-based:
```python
print("User 53 failed login")
```

A real, structured, leveled logger:
```python
import logging, json

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("auth")

def log_event(event, **fields):
    logger.info(json.dumps({"event": event, **fields}))

log_event("login_failed", user_id=53, reason="bad_password")
log_event("login_succeeded", user_id=53)
logger.debug("this won't print — DEBUG is below the configured INFO level")
```

**Real output:**
```
{"event": "login_failed", "user_id": 53, "reason": "bad_password"}
{"event": "login_succeeded", "user_id": 53}
```

**What this proves:** the `debug` call produced no output at all — the logger's configured level (`INFO`) filtered it out automatically, with no `if` statement written anywhere to suppress it. Both real log lines are valid JSON, meaning a real log-aggregation tool could parse `user_id` or `event` out of thousands of lines without ever running a fragile text-pattern match against "User N failed login"-shaped sentences.

## Mechanical Walkthrough

- A **log level** (`DEBUG` < `INFO` < `WARNING` < `ERROR` < `CRITICAL`) states how severe or how routine a given message is; a logger is configured with a minimum level, and anything below that threshold is silently dropped — this is what lets verbose, detailed `DEBUG` logging stay in the code permanently, available instantly by lowering the configured level, without needing to delete and re-add print statements by hand.
- **Structured logging** means each log entry is a real, parseable record (commonly JSON) with named fields (`event`, `user_id`, `reason`), rather than a free-form sentence a human wrote for other humans to read — a machine can filter, aggregate, and alert on structured fields ("show me every `login_failed` event for `user_id: 53` in the last hour") in a way it fundamentally cannot for `"User 53 failed login"` without fragile text parsing.
- `logging.getLogger(name)` creates a logger scoped to a specific part of an application (`"auth"` here) — real systems typically use one logger per module, so log output can be filtered or routed differently by *where* it came from, not just by level.
- Unlike `print()`, a configured logger can be redirected — to a file, to a remote log-aggregation service, to multiple destinations at once — without touching a single line of the code that actually calls `logger.info(...)`; the call site never needs to know or care where its output ends up.

## CS Lens

Logging is a form of **observability** — the ability to answer questions about a running system's internal state from its external outputs alone, without stopping it or attaching a debugger. Structured logging specifically treats log output as **data**, not prose — the same shift `serialization-deserialization.md` describes for turning informal text into a real, machine-parseable format, applied to a system's own operational record of what it did.

Also recognized in: every production system's real logging stack (structured JSON logs shipped to an aggregator, searchable by field), and the broader "three pillars of observability" — logs (discrete events), metrics (aggregated numeric measurements over time), and traces (a single request's path across multiple components) — logging is the first and most foundational of the three.

## SE Lens

The real, concrete cost of skipping this: a `print()`-only system, once running unattended (a deployed server, a background job), offers no way to answer "what actually happened at 3am when this failed" after the fact unless someone happened to be watching the terminal live — the information either was never captured in a searchable form, or is buried in an unstructured wall of text with no severity markers to filter by. The cost of doing it right is genuinely small — `logger.info(...)` is barely more typing than `print(...)` — which is exactly why its absence in a real system is a debt worth naming explicitly rather than deferring indefinitely.

## Connection

Directly relevant to any real HTTP route or background process — a natural companion to `exception-translation-at-boundary.md` (an exception caught and translated at a boundary is exactly the kind of event worth a structured `logger.error(...)` call, not just a translated response) and `health-check-endpoint.md` (a health check's own pass/fail history is itself a real, valuable stream of structured events).

## Try It Yourself

1. Change the configured level from `INFO` to `WARNING` and confirm the `login_succeeded` line disappears too — direct proof that level filtering happens centrally, at configuration, not per call site.
2. Add a `try`/`except` around code that can genuinely fail, and call `logger.error(...)` with the exception's message inside the `except` block — then compare this against `python-custom-exceptions.md`'s translate-and-re-raise pattern, and reason about why logging and translating aren't mutually exclusive — a real system often does both.
3. Look up your logging library's support for automatic **context** (a request ID attached to every log line for the duration of one request, without passing it explicitly to every single log call) — a real, common refinement once structured logging is in place, letting every log line from one request be grouped together even across multiple functions.

## A Second Real Example: Manual Setup, the Root Logger, and Reassignment

`logging.basicConfig()` above is a real, convenient wrapper. A second,
lower-level real style builds the same pieces by hand — worth its own
example because it exposes real mechanics `basicConfig()` hides:

```python
import logging
import sys

handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter("%(levelname)s | %(name)s | %(message)s")
handler.setFormatter(formatter)

root = logging.getLogger()          # the shared ROOT logger -- no name given
root.handlers = [handler]           # replace, not append
root.setLevel(logging.INFO)

app_log = logging.getLogger("app")  # a distinct, NAMED logger
app_log.info("application starting")

for _ in range(2):
    handler2 = logging.StreamHandler(sys.stdout)
    handler2.setFormatter(formatter)
    root.handlers = [handler2]      # reassignment: always exactly one handler

app_log.info("still exactly one line per message, not three")
print("root is app_log's parent:", app_log.parent is root)
```

**Real output, run this session:**
```
INFO | app | application starting
INFO | app | still exactly one line per message, not three
root is app_log's parent: True
```

**What this proves:** even after the setup block runs three separate
times (the original plus a loop of two more), each `app_log.info(...)`
call still produces exactly **one** line, not three — `root.handlers =
[handler2]` *replaces* the list each time rather than growing it.
Had the code instead used `root.addHandler(handler2)` inside that same
loop, each call would **append** a new handler alongside the existing
ones — the third setup pass would leave three handlers attached, and
every subsequent `app_log.info(...)` call would print the *same*
message three times, once per attached handler — a real, easy-to-miss
bug this reassignment style avoids entirely, and a concrete instance of
`idempotent-initialization-guard.md`'s own idea (safe to run more than
once, with no accumulating side effect) achieved by replacement rather
than a check-then-act guard.

**Two further real, mechanical facts this example makes concrete:**

- `logging.getLogger()` called with **no** argument returns the single,
  shared **root** logger — the top of a real hierarchy. `logging.
  getLogger("app")` returns (creating on first call) a distinct
  **named** logger, whose real `.parent` is the root logger by default
  (confirmed directly above: `root is app_log's parent: True`) — a
  named logger's own messages propagate up to the root's handlers
  unless told not to, which is *why* `app_log.info(...)` output reaches
  the handler that was only ever attached to `root`, never to `app_log`
  itself.
- `logging.Formatter("%(levelname)s | %(name)s | %(message)s")`'s
  format string is its own small, real micro-syntax — `%(fieldname)s`
  placeholders pulled from each real `LogRecord`'s own attributes
  (`levelname`, `name`, `message`, and others like `asctime`, `filename`,
  `lineno`) — a real, different thing from an f-string (`python-
  f-strings.md`), which only ever interpolates values already in scope
  at the point it's written, not named attributes of an object supplied
  later, once, by the logging framework itself at the moment a record
  is actually emitted.

### Try It Yourself (second example)

1. Replace `root.handlers = [handler2]` with `root.addHandler(handler2)`
   inside the loop and re-run — confirm `app_log.info(...)` now really
   does print each message three times, the concrete bug the
   reassignment style avoids.
2. Add `%(asctime)s` to the formatter's format string and confirm each
   real log line now includes a real, current timestamp — read the
   `logging` module's own documentation for which other `LogRecord`
   attributes are available this way.
3. Call `app_log.info(...)` before `app_log.setLevel(...)` has ever been
   set on `app_log` itself (only `root.setLevel(logging.INFO)` was set)
   and confirm it still respects that level — a named logger with no
   level of its own defers to its parent's, up the real hierarchy,
   until one is found.

## A Third Real Example: Lazy `%`-Style Interpolation vs. Eager f-Strings

Every example so far used a message that was cheap to build either
way. This is a real, easily-missed distinction once a message is
genuinely **expensive** to construct:

```python
import logging

logging.basicConfig(level=logging.WARNING, format="%(message)s")
log = logging.getLogger("app")

str_calls = {"count": 0}


class ExpensiveDetail:
    """Simulates something real but costly to turn into a string."""
    def __str__(self):
        str_calls["count"] += 1
        return "expensive-detail-computed"


# Logger is configured at WARNING; .info() is below that level, so
# neither call below should actually EMIT a line.

log.info(f"eager: {ExpensiveDetail()}")
print("after f-string call,       __str__ call count:", str_calls["count"])

log.info("lazy: %s", ExpensiveDetail())
print("after %-style call,        __str__ call count:", str_calls["count"])

log.warning("lazy but at WARNING: %s", ExpensiveDetail())
print("after a real WARNING call, __str__ call count:", str_calls["count"])
```

**Real output, run this session:**
```
lazy but at WARNING: expensive-detail-computed
after f-string call,       __str__ call count: 1
after %-style call,        __str__ call count: 1
after a real WARNING call, __str__ call count: 2
```

**What this proves:** the f-string call (`f"eager: {ExpensiveDetail()}"`)
bumped the real call count to `1` immediately — Python has to build the
complete f-string, calling `ExpensiveDetail.__str__()`, *before*
`log.info(...)` is even invoked, regardless of whether the message ever
actually gets logged. The `%`-style call, at the identical suppressed
`INFO` level, left the count at `1` — unchanged — because `logging`
only performs `%`-substitution internally when a record is actually
going to be emitted, and this one wasn't. The final, real `WARNING`
call (which *does* get emitted, shown by its own printed line above the
counts) finally bumps the count to `2` — direct, concrete proof the
substitution genuinely only happens when needed.

### Try It Yourself (third example)

1. Lower the configured level to `INFO` and re-run — confirm the
   `%`-style call's count now also increments on that call, since `INFO`
   now qualifies for real emission.
2. Replace `ExpensiveDetail` with a class whose `__str__` runs a real,
   measurable amount of work (a loop building a large string) and time
   the difference between the eager and lazy versions across many
   suppressed calls, to see the real, not just theoretical, cost this
   avoids at scale.
3. Explain, in your own words, why `log.info(f"...")`'s cost is paid
   "regardless of whether the message ever actually gets logged" — walk
   through the real order Python evaluates an f-string versus when
   `logging` decides whether a record is emitted.
