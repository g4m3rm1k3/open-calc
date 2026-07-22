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
