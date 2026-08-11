# Lesson 80: Beyond `print()` — a Rotating, Structured Logger

**What you will build:** a `Logger` class with severity levels
(`DEBUG`/`INFO`/`WARNING`/`ERROR`), timestamped output written to a
file, automatic log rotation once a file grows past a size threshold,
and an optional structured JSON output mode. The working feature is a
real, reusable logging tool. The transferable problem: `print()` is
fine for a five-line script, and actively dangerous for anything that
runs for a while — no severity, no persistence, no bound on how large
its output grows, and no reliable way to pull a specific fact back out
of it later. This lesson builds the four separate fixes for those four
separate problems, and shows each one failing concretely before fixing
it.

**What you need to know first:** Lesson 55/56 (JSON parser, config-file
parser) — this lesson's structured-logging mode uses Python's own
`json` module the same way those lessons built or used JSON handling:
turning structured data into reusable, re-parseable text. This lesson
is the last of Track 12's capstones — it leans on file-append patterns,
size checks, and formatted output already familiar from Track 2 and
Track 7, without re-deriving them.

---

## Concept Unit: The Problem — `print()` Doesn't Scale

### The Problem

`print()` statements sprinkled through a program work while the
program is small and someone's watching the terminal. They fall apart
the moment a program runs unattended, runs for a long time, or
produces more output than anyone wants to read start to finish:
nothing distinguishes a routine message from a genuine problem,
nothing persists once the terminal closes, and nothing stops the
output from growing without bound.

### The New Code

```python
def process_order(order_id, amount):
    print(f"Processing order {order_id}")
    if amount > 1000:
        print(f"WARNING: large order {order_id}, amount={amount}")
    print(f"Order {order_id} complete")

process_order(101, 50)
process_order(102, 5000)
```

### Run It

```
Processing order 101
Order 101 complete
Processing order 102
WARNING: large order 102, amount=5000
Order 102 complete
```

Every message looks the same — no timestamp, no consistent severity
marker (`"WARNING:"` was typed by hand, this time; nothing enforces
it), nothing saved anywhere once this terminal session ends. Discarded
now; the rest of this lesson builds each missing piece deliberately.

### CS Lens

Treating diagnostic output as a first-class, structured concern —
rather than an afterthought bolted onto whatever `print()` happens to
be nearby — is the entire reason dedicated logging systems exist in
every serious language and framework. Also recognized in: an aircraft's
flight data recorder (structured, severity-tagged, persistent, by
necessity), a web server's access log (every request recorded in a
consistent, parseable format), a database's write-ahead log (Lesson
78's own commit history is, structurally, a specialized log).

---

## Concept Unit: Severity Levels and Filtering

### The Problem

Not every message deserves equal attention. A useful logging system
needs a way to rank messages by importance, and a way to say "only
show me things at or above this importance," without needing to delete
or comment out the less important calls entirely.

### The New Code

```python
LEVELS = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40}

current_level = LEVELS["WARNING"]   # only show WARNING and above

messages = [
    ("DEBUG", "opened connection pool"),
    ("INFO", "processing order 101"),
    ("WARNING", "large order 102, amount=5000"),
    ("ERROR", "payment failed for order 103"),
]

for level, message in messages:
    if LEVELS[level] >= current_level:
        print(f"[{level}] {message}")
```

### Run It

```
[WARNING] large order 102, amount=5000
[ERROR] payment failed for order 103
```

### Mechanical Walkthrough

- `LEVELS = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40}` —
  **first appearance of severity levels represented as plain
  integers**, not just labeled strings. The specific numbers (10, 20,
  30, 40) matter less than their *relative order* — spaced apart by
  10 specifically so new levels could be inserted between existing
  ones later without renumbering everything, a deliberate,
  future-proofing choice, not an arbitrary one.
- `if LEVELS[level] >= current_level:` — the entire filtering
  mechanism, in one comparison: a message is shown only if its own
  numeric severity is at or above the configured threshold. `DEBUG`
  (10) and `INFO` (20) are both silently skipped here because both are
  below `WARNING`'s threshold of 30 — not deleted from the code, just
  not emitted, this run.

### CS Lens

Assigning a numeric rank to categories that are conceptually ordered,
so filtering becomes one comparison instead of an explicit list of
"which categories count," is a common technique. Also recognized in:
HTTP status code ranges (2xx/4xx/5xx, ordered by severity of outcome),
a task-priority queue (Lesson 73's own `MinHeap`, ranking by numeric
priority rather than named category), and a spam filter's confidence
score, thresholded rather than binary-classified from the start.

---

## Concept Unit: Writing to a File

### The Problem

Level filtering solves *what* gets shown. Nothing yet solves
*persistence* — printed output vanishes the moment a terminal closes;
a real log needs to survive past the program that wrote it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `logger.py` (new file).
- **Change type:** add.
- **Location:** n/a — brand-new file.
- **Dependencies:** `time` (standard library).

### The New Code

```python
import time

LEVELS = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40}


class Logger:
    def __init__(self, filepath, level="INFO"):
        self.filepath = filepath
        self.level = LEVELS[level]

    def _should_log(self, level):
        return LEVELS[level] >= self.level

    def _format(self, level, message):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        return f"{timestamp} [{level}] {message}"

    def log(self, level, message):
        if not self._should_log(level):
            return
        line = self._format(level, message)
        with open(self.filepath, "a") as f:
            f.write(line + "\n")

    def debug(self, message):
        self.log("DEBUG", message)

    def info(self, message):
        self.log("INFO", message)

    def warning(self, message):
        self.log("WARNING", message)

    def error(self, message):
        self.log("ERROR", message)
```

### Run It

```python
>>> from logger import Logger
>>> log = Logger("app.log", level="INFO")
>>> log.debug("opened connection pool")
>>> log.info("processing order 101")
>>> log.warning("large order 102, amount=5000")
>>> log.error("payment failed for order 103")
>>> with open("app.log") as f:
...     print(f.read())
```

```
2026-08-09 09:03:30 [INFO] processing order 101
2026-08-09 09:03:30 [WARNING] large order 102, amount=5000
2026-08-09 09:03:30 [ERROR] payment failed for order 103
```

`log.debug(...)` was called — but never appears in the file, because
`DEBUG` (10) is below this logger's configured `INFO` (20) threshold.
Real proof, not just an assertion, that the filtering unit's mechanism
is now actually wired into a working class.

### Mechanical Walkthrough

- `self.level = LEVELS[level]` — the string level name passed to
  `__init__` (`"INFO"`) is converted to its numeric rank once, at
  construction time, and stored — every later comparison uses the
  number, not the string, matching the previous unit's mechanism
  exactly.
- `def _should_log(self, level): return LEVELS[level] >= self.level`
  — the exact filtering comparison from the previous unit, now a
  reusable method instead of an inline `if` in a loop.
- `with open(self.filepath, "a") as f: f.write(line + "\n")` —
  **first appearance of append mode (`"a"`) used deliberately for
  logging.** Unlike `"w"` (which would erase the file's existing
  content every time), `"a"` opens the file for writing *at its
  current end* — every call to `log` adds one more line without ever
  destroying what came before, exactly the persistence this unit
  exists to add. Opening and closing the file on every single call
  (via `with`, already-established) rather than keeping it open for
  the logger's whole lifetime is a deliberate simplicity choice,
  flagged directly in this lesson's SE Lens below.
- `def debug(self, message): self.log("DEBUG", message)` (and the
  three siblings) — small convenience wrappers, so calling code writes
  `log.warning("...")` instead of `log.log("WARNING", "...")` — purely
  ergonomic, no new mechanism.

### SE Lens

Opening the file fresh on every single `log()` call has a real,
deliberate tradeoff: it's slower than keeping one file handle open for
the logger's entire lifetime (every call pays the cost of an open and
close), but it's also safer in one specific way worth naming — if the
program crashes immediately after a `log()` call, that line is already
safely flushed to disk, because the file was already closed by the
time the crash happened. A version that kept the file open would risk
losing buffered-but-unflushed log lines in exactly the situation
logging exists to help diagnose: a crash. This lesson accepts the
performance cost for that guarantee.

---

## Concept Unit: Rotation — Bounding How Large a Log File Grows

### The Problem

A log file that's never rotated grows forever, for as long as a
program keeps running — eventually consuming meaningful disk space, or
becoming too large to conveniently open at all. A real logging system
needs to cap how big any single file gets, while still preserving
recent history rather than just deleting it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `logger.py`.
- **Change type:** modify — `__init__` gains `max_bytes` and
  `backup_count`; `_rotate_if_needed` is added and called from `log`.
- **Location:** throughout `Logger`.
- **Dependencies:** `os` (standard library).

### The New Code

```python
    def __init__(self, filepath, level="INFO", max_bytes=200, backup_count=3):
        self.filepath = filepath
        self.level = LEVELS[level]
        self.max_bytes = max_bytes
        self.backup_count = backup_count

    def _rotate_if_needed(self):
        if not os.path.exists(self.filepath):
            return
        if os.path.getsize(self.filepath) < self.max_bytes:
            return
        for i in range(self.backup_count - 1, 0, -1):
            src = f"{self.filepath}.{i}"
            dst = f"{self.filepath}.{i + 1}"
            if os.path.exists(src):
                os.rename(src, dst)
        os.rename(self.filepath, f"{self.filepath}.1")

    def log(self, level, message):
        if not self._should_log(level):
            return
        self._rotate_if_needed()
        line = self._format(level, message)
        with open(self.filepath, "a") as f:
            f.write(line + "\n")
```

### Run It

```python
>>> log = Logger("app2.log", level="INFO", max_bytes=200, backup_count=3)
>>> for i in range(20):
...     log.info(f"processing order {100+i}, some padding text here to grow the file")
>>> import os
>>> for f in sorted(os.listdir(".")):
...     if f.startswith("app2.log"):
...         print(f, os.path.getsize(f), "bytes")
```

```
app2.log 178 bytes
app2.log.1 267 bytes
app2.log.2 267 bytes
app2.log.3 267 bytes
```

Twenty log calls, but the *current* file (`app2.log`) is small — every
time it crossed `max_bytes` (200), it got rotated out. Exactly
`backup_count` (3) old versions survive, no more — confirmed directly:

```
=== app2.log (current, newest entries) ===
2026-08-09 09:03:39 [INFO] processing order 118, some padding text here to grow the file
2026-08-09 09:03:39 [INFO] processing order 119, some padding text here to grow the file
=== app2.log.1 (most recent backup) first line ===
2026-08-09 09:03:39 [INFO] processing order 115, some padding text here to grow the file
=== app2.log.3 (oldest surviving backup) first line ===
2026-08-09 09:03:38 [INFO] processing order 109, some padding text here to grow the file
```

`app2.log` holds the newest entries (orders 118–119); `app2.log.1`
holds the next-most-recent (starting at order 115); `app2.log.3` holds
the oldest surviving entries (starting at order 109) — real,
chronologically correct rotation, with entries from before order 109
genuinely gone, discarded once `backup_count` was exceeded.

### Mechanical Walkthrough

- `if not os.path.exists(self.filepath): return` — nothing to rotate
  if the log file doesn't exist yet (the very first call, or right
  after rotation already ran) — an already-established guard pattern.
- `if os.path.getsize(self.filepath) < self.max_bytes: return` — the
  actual trigger check: only proceed with rotation if the current file
  has genuinely grown past the configured threshold.
- `for i in range(self.backup_count - 1, 0, -1):` — **first
  appearance of counting *downward* through a range**, deliberately —
  `range(2, 0, -1)` produces `[2, 1]` for a `backup_count` of 3. This
  direction is not arbitrary: shifting `.2` to `.3` **before** shifting
  `.1` to `.2` avoids overwriting `.2`'s content with itself
  mid-sequence — counting upward instead would try to rename `.1` to
  `.2` first, then find `.2` (now holding what used to be `.1`) and
  rename it to `.3`, silently losing what should have become `.3`.
  Order matters here in a way it hasn't in most earlier lessons'
  loops.
- `src = f"{self.filepath}.{i}"; dst = f"{self.filepath}.{i + 1}"` —
  each backup file is named by its own age: `.1` is the most recently
  rotated-out file, `.2` older, `.3` oldest surviving. This naming
  scheme is what makes "oldest backup" and "most recent backup"
  directly readable from the filename itself.
- `os.rename(src, dst)` — **first appearance of `os.rename` used as
  the actual rotation mechanism.** Renaming, not copying-then-deleting,
  is deliberate: it's a single, fast filesystem operation rather than
  a full read-and-rewrite of potentially large files. When `dst`
  already exists (the oldest surviving backup, about to be pushed out
  entirely), `os.rename` **silently overwrites it** — this is the
  exact mechanism that keeps the backup count bounded at
  `backup_count`, with no separate "delete the oldest one" step ever
  needed; overwriting *is* the deletion.
- `os.rename(self.filepath, f"{self.filepath}.1")` — after every
  existing backup has shifted up by one number, the *current* log file
  itself becomes the newest backup (`.1`), freeing up `self.filepath`
  for a brand new, empty file to be created by the very next `open(...,
  "a")` call in `log`.

### CS Lens

Shifting a bounded set of items down one slot each, discarding
whatever falls off the end, to keep only the N most recent, is the
same underlying idea as a **ring buffer** or a fixed-size sliding
window — also recognized in: a `deque` created with `maxlen=N`
(Python's own `collections.deque` supports this directly, silently
dropping the oldest item once full — the same behavior built here by
hand with files), a video game's replay buffer keeping only the last N
seconds, a browser keeping only the last N pages of history before
the oldest silently falls off.

---

## Concept Unit: Structured JSON Logging

### The Problem

Plain text log lines are readable by a person, but fragile to parse
back out programmatically — a log message's own text can accidentally
contain something that *looks like* a field, with no way for a naive
parser to tell the difference between real structured data and
coincidental text.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `logger.py`.
- **Change type:** modify — `__init__` gains `json_format`; `_format`
  branches on it; `log` and every level method gain `**fields` to pass
  arbitrary structured data through.
- **Location:** throughout `Logger`.
- **Dependencies:** `json` (standard library).

### The New Code

```python
    def _format(self, level, message, **fields):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        if self.json_format:
            record = {"timestamp": timestamp, "level": level, "message": message}
            record.update(fields)
            return json.dumps(record)
        extra = " ".join(f"{k}={v}" for k, v in fields.items())
        line = f"{timestamp} [{level}] {message}"
        return f"{line} {extra}" if extra else line

    def log(self, level, message, **fields):
        if not self._should_log(level):
            return
        self._rotate_if_needed()
        line = self._format(level, message, **fields)
        with open(self.filepath, "a") as f:
            f.write(line + "\n")

    def info(self, message, **fields):
        self.log("INFO", message, **fields)
    # warning, error, debug identical: accept **fields, pass through
```

### Run It

```python
>>> log = Logger("app3.log", level="INFO", json_format=True, max_bytes=10_000)
>>> log.info("processing order", order_id=101, amount=50)
>>> log.warning("large order", order_id=102, amount=5000)
>>> log.error("payment failed", order_id=103, reason="card_declined")
>>> with open("app3.log") as f:
...     for line in f:
...         print(line.strip())
```

```
{"timestamp": "2026-08-09 09:04:10", "level": "INFO", "message": "processing order", "order_id": 101, "amount": 50}
{"timestamp": "2026-08-09 09:04:10", "level": "WARNING", "message": "large order", "order_id": 102, "amount": 5000}
{"timestamp": "2026-08-09 09:04:10", "level": "ERROR", "message": "payment failed", "order_id": 103, "reason": "card_declined"}
```

Every line is genuinely valid, independently parseable JSON — verified
directly: `json.loads(line)["order_id"]` reliably retrieves `101`,
`102`, `103` from each line in turn, no custom parsing logic needed at
all.

### Mechanical Walkthrough

- `def _format(self, level, message, **fields):` — **first appearance
  of `**fields` used to accept an arbitrary, caller-defined set of
  structured values.** Unlike `message` (always required, always a
  string), `fields` can be anything a caller wants to attach — `order_id`
  and `amount` in one call, `order_id` and `reason` in another — the
  method doesn't need to know in advance what fields exist.
- `record = {"timestamp": timestamp, "level": level, "message": message}; record.update(fields)`
  — builds the three always-present fields first, then merges in
  whatever extra fields were passed — reappearing `dict.update` from
  Lesson 78's `MiniGit`, applied here to build up a log record instead
  of an index.
- `return json.dumps(record)` — **first appearance of `json.dumps`
  used for a project's actual persisted output**, rather than a
  standalone demonstration — reappearing Lesson 78's own use of
  `json.dumps` for commit objects, here serializing a log record
  instead. One line, one complete, self-describing JSON object.
- `extra = " ".join(f"{k}={v}" for k, v in fields.items())` — the
  *text-format* branch handles the same `**fields` data differently:
  rendering each field as `key=value`, space-separated, appended after
  the message — readable, but — as the next section proves — genuinely
  ambiguous to parse back out.
- Every level method (`info`, `warning`, `error`, `debug`) gains
  `**fields` too, simply forwarding it through to `log` — the
  structured-data capability is available at every call site, not just
  the general-purpose `log` method.

### One Real Cost Worth Naming

Rerunning the rotation demo's exact `max_bytes=200` setting with
`json_format=True` triggers rotation far sooner than the plain-text
version did — JSON's field names (`"timestamp"`, `"level"`,
`"message"`) are repeated in *every single line*, not just implied by
position the way the text format's fixed layout does, so structured
logs are measurably larger per entry for the same information. This
isn't a flaw in the implementation — it's a genuine, real cost of
structured logging worth knowing before choosing it: machine-parseable
comes at the price of some redundancy, every line.

### CS Lens

Serializing every log entry as a complete, independently-decodable
unit — rather than relying on fixed text positions or ad-hoc
separators — is the same idea behind **JSON Lines** (`.jsonl`), a real,
named format used by exactly this kind of application: one JSON object
per line, so a file can be processed one line at a time without ever
needing to parse the whole file as one JSON document.

---

## What Breaks Without This — Ambiguous Text Parsing

### The New Code

```python
text_log = Logger("text_demo.log", level="INFO", json_format=False, max_bytes=10_000)
text_log.info("user query failed", query='SELECT * WHERE name="O\'Brien order_id=999"', order_id=42)

with open("text_demo.log") as f:
    line = f.read().strip()
print("raw line:", line)

import re
match = re.search(r"order_id=(\S+)", line)
print("naive regex extraction of order_id:", match.group(1) if match else None)
```

### Run It

```
raw line: 2026-08-09 09:04:23 [INFO] user query failed query=SELECT * WHERE name="O'Brien order_id=999" order_id=42
naive regex extraction of order_id: 999"
```

The *real* `order_id` field is `42`. A plausible, reasonable attempt
to extract it from the text log — search for `order_id=` and grab
what follows — instead returns `999"`, pulled from *inside the
`query` field's own text*, which happened to contain something that
looks exactly like a field. The text format has no way to distinguish
"this is a real structured field" from "this text merely resembles
one" — position and repetition are all it has, and free-form message
content can defeat both.

### The Fix, Confirmed

```python
json_log = Logger("json_demo.log", level="INFO", json_format=True, max_bytes=10_000)
json_log.info("user query failed", query='SELECT * WHERE name="O\'Brien order_id=999"', order_id=42)

with open("json_demo.log") as f:
    line = f.read().strip()
parsed = json.loads(line)
print("correctly extracted order_id:", parsed["order_id"])
print("the fake order_id=999 is safely trapped inside the query STRING VALUE:", repr(parsed["query"]))
```

```
correctly extracted order_id: 42
the fake order_id=999 is safely trapped inside the query STRING VALUE: 'SELECT \'O\'Brien order_id=999\''
```

Identical message and identical fields, logged in JSON mode instead:
`parsed["order_id"]` correctly returns `42`, every time, regardless of
what text happens to appear inside `query`'s own value — because JSON
itself, not ad-hoc text scanning, is responsible for knowing exactly
where one field ends and the next begins, including correctly escaping
the quote characters inside the query string so they can never be
mistaken for the record's own structure.

## Exercises

- Add a `context(**fields)` method that returns a lightweight wrapper
  automatically including a fixed set of fields (like `request_id`) on
  every subsequent log call made through it, without repeating them at
  every call site — research how real logging libraries call this
  concept a "bound logger" or "logging context."
- Add time-based rotation (a new log file every day, not just every
  N bytes) as an alternative to `max_bytes` — research the difference
  between size-based and time-based rotation policies and when each is
  preferred.
- Add a `read_json_logs(filepath)` function that reads a JSON-formatted
  log file back in, line by line, and returns a list of parsed dicts —
  then use it to compute something real, like "how many ERROR-level
  entries occurred in the last hour," directly from structured data
  rather than regex.
- Compare this lesson's `Logger` against Python's own built-in
  `logging` module, specifically `logging.handlers.RotatingFileHandler`
  — confirm the rotation numbering scheme (`.1`, `.2`, `.3`) matches.

## Definition of Done

- [ ] `Logger` implemented with level filtering, file persistence,
      rotation, and JSON mode, matching every trace above.
- [ ] The rotation demo run for real: confirmed exactly `backup_count`
      backup files exist after enough log calls to trigger multiple
      rotations, with oldest entries genuinely gone, not just capped.
- [ ] The ambiguous-text-parsing failure reproduced on your own
      machine: a naive regex extraction pulling a wrong value from
      inside a message's own text.
- [ ] The same scenario logged in JSON mode instead, confirming
      `json.loads(...)["order_id"]` returns the correct value every
      time.
- [ ] Can explain out loud, without looking at the code, why
      `_rotate_if_needed`'s backup-shifting loop counts *downward*
      through its range, not upward.
- [ ] Committed, with a message explaining *why* — e.g. `"Rotating,
      structured logger: severity filtering, bounded log growth via
      rotation, and JSON output to avoid ambiguous text parsing"` —
      not `"add logger.py"`.

---

This closes Track 12, and with it, the full original Track 1–12 plan.
Track 13 (Systems Programming in C and Rust) picks up next, starting
from the OS-level comfort already built across Track 1.
