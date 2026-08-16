# Lesson 84: Message-Oriented Architecture

**What you will build.** Lesson 83's `_event_queue` is a plain Python
list, living entirely in one process's memory. Publish an event, then
simulate the process crashing before anything processes it — a fresh
Python process starts with an empty list, and the event is gone,
permanently, with no trace it ever existed. This lesson replaces the
in-memory list with an append-only log file: `publish_event_durable`
writes each event to disk before returning, so a fresh process, started
after the "crash," can read the exact same event straight off disk. The
transferable problem: Lesson 83 decoupled a request's timeline from
non-critical work; it never asked what happens to a published event if
the process publishing it, or the process meant to consume it, dies in
between — and the honest answer, for an in-memory queue, is that the
event simply never happened as far as the rest of the system is
concerned.

**What you need to know first.** Event-Driven Architecture (Lesson 83)
— `_event_queue` and `publish_event`, the exact in-memory mechanism this
lesson proves loses data across a crash. Configuration vs Code (Lesson
66) — `json.load`/file I/O, the same mechanism this lesson reuses to
make an event survive on disk instead of only in memory.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Architecture** stage. Carried through: Lesson 83 built the
*shape* of publish-and-react; this lesson asks what happens to that
shape the instant a real process crash is introduced — a question an
in-memory simulation can hide indefinitely, right up until it's run
across an actual restart.

**Terms introduced in this lesson.** One line each.

- **message broker** — real infrastructure (RabbitMQ, Kafka, SQS, and
  similar systems) that sits between publishers and consumers,
  persisting each message before acknowledging it was received, so a
  message survives even if the publisher, the broker itself, or the
  consumer crashes before the message is fully handled. This lesson's
  own file-backed log is a minimal, honest stand-in for one — enough to
  demonstrate the real property a broker provides, not a substitute for
  running one.
- **durability** — the guarantee that once a message has been accepted,
  it will survive a crash of any single component involved in producing
  or consuming it. It's the specific property Lesson 83's in-memory
  queue never had, demonstrated here as a real, reproducible loss, not a
  hypothetical risk.

**Objects and methods used.**

- **`open(path, "a")`** (Python's built-in file-opening function, append
  mode)
  - *What it is:* opens a file for writing, with new content added to
    the end of whatever the file already contains, rather than
    overwriting it — the mode Lesson 66 didn't need, since it only ever
    read a config file, never appended to one.
  - *Implementation:* `open(path, "a")` creates the file if it doesn't
    exist, or opens the existing one positioned at its end; every
    `write` call after that adds to the file without touching what was
    already there.
  - *Its use:* this lesson uses it to append one JSON-encoded event per
    line to a durable log file, so multiple published events accumulate
    on disk instead of each call overwriting the last.

## Concept Unit: An In-Memory Queue Is Not a Message Broker

### The Problem

`_event_queue`, from Lesson 83, holds published events only in the
running process's own memory:

```python
_event_queue = []


def publish_event(event_name, payload):
    _event_queue.append((event_name, payload))


publish_event("order_placed", {"order_id": 501})
print("events in memory before the crash:", _event_queue)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
events in memory before the crash: [('order_placed', {'order_id': 501})]
```

Simulating a real crash — the process exits, and a fresh Python process
starts in its place, the way a server actually restarts after a real
failure:

```python
_event_queue = []
print("events in memory in the new process after the crash:", _event_queue)
```

Running it, in a genuinely new process, produces:

```
events in memory in the new process after the crash: []
```

The event that was published a moment ago is completely gone. Nothing
about `publish_event` ever wrote it anywhere durable — it lived in one
list, in one process's memory, and the moment that process ends for any
reason, so does every event it was holding, whether or not
`process_event_queue` ever got a chance to run.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** a new durable event log file; `publish_event`,
  replaced with a version that writes to it.
- **Change type:** refactor — replace an in-memory list with an
  append-only log file.
- **Location:** wherever events are published and read for processing.
- **Dependencies:** none — `json` and `open` are both Python built-ins.

### The New Code

The smallest new piece is the durable publish function:

```python
def publish_event_durable(event_name, payload, path="message_log.jsonl"):
    with open(path, "a") as f:
        f.write(json.dumps({"event_name": event_name, "payload": payload}) + "\n")
```

### The Updated Project

Publishing now writes to disk instead of appending to an in-memory list,
and reading events becomes its own function, reading the same file back:

```python
import json


def publish_event_durable(event_name, payload, path="message_log.jsonl"):  # ← new
    with open(path, "a") as f:                                                # ← new
        f.write(json.dumps({"event_name": event_name, "payload": payload}) + "\n")  # ← new


def read_unprocessed_events(path="message_log.jsonl"):                       # ← new
    events = []                                                                 # ← new
    with open(path) as f:                                                        # ← new
        for line in f:                                                             # ← new
            record = json.loads(line)                                                # ← new
            events.append((record["event_name"], record["payload"]))                  # ← new
    return events                                                                  # ← new
```

Nothing about `publish_event_durable` depends on the process staying
alive after it returns — the event is already on disk, in a file any
future process, including a brand-new one started after a crash, can
read directly.

### Isolating the Concept: Data That Outlives the Process That Wrote It

The mechanism doing the real work above — writing to a durable file
instead of an in-memory structure, so data survives past the writing
process's own lifetime — deserves to be seen proving its own real
payoff directly: publishing an event, then reading it back from a
genuinely separate process invocation, exactly simulating the crash from
the Problem section:

```python
publish_event_durable("order_placed", {"order_id": 501})
print("event written to durable log")
```

Then, run as a completely separate process, after the first one has
already exited:

```python
print("events recovered from disk in the new process:", read_unprocessed_events())
```

Running the second script, in its own fresh process, produces:

```
events recovered from disk in the new process: [('order_placed', {'order_id': 501})]
```

The event survives, fully intact, across a real process boundary — not
because anything clever happened, but because it was written to disk,
which persists independently of any single process's own memory or
lifetime, the same property a database write or a real message broker's
own persistence layer provides.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`with open(path, "a") as f:`** — opens the log file in append mode;
  if the file doesn't exist yet, it's created; if it does, new content
  is added after whatever's already there, never overwriting it.
- **`f.write(json.dumps({...}) + "\n")`** — serializes one event to a
  single line of JSON text, then writes it followed by a newline, so
  each line in the file is exactly one complete, independently
  parseable event.
- **`for line in f: record = json.loads(line)`** — reads the file one
  line at a time, parsing each line back into the dict it was written
  from; this is the mirror operation of `f.write`, reconstructing every
  event that was ever durably published.

### CS Lens

This is **write-ahead logging**, the same fundamental technique real
databases use to guarantee durability: write the intended change to a
durable, append-only log *before* considering the operation complete,
so a crash at any point afterward can recover exactly what was
committed by replaying the log. A real message broker like Kafka is,
structurally, this exact idea, built into dedicated, highly-optimized
infrastructure — an append-only, durable, ordered log that producers
write to and consumers read from independently, with the broker
guaranteeing the log itself survives failures the way this lesson's own
`message_log.jsonl` survived a simulated process crash.

Also recognized in: database transaction logs (redo logs), used to
recover a database to a consistent state after an unexpected shutdown,
version control systems, whose entire commit history is itself a
durable, append-only log, and event sourcing, an architectural pattern
that treats a durable log of events as a system's actual primary source
of truth, rather than a secondary mechanism layered on top of one.

### SE Lens

The principle is **know exactly what survives a crash, and design
around that boundary deliberately** — the alternative that produced
this lesson's bug, an in-memory queue, is not a mistake in the code
that writes to it; it's a mistake in never asking what happens to that
data if the process holding it stops running unexpectedly, which every
real production process eventually does, whether from a crash, a
deployment, or a routine restart. The real cost of this fix: every
publish now costs a real disk write instead of an in-memory append —
slower, measurably, the same category of tradeoff Lesson 74 already
named for caching, now appearing in the opposite direction: trading
speed for the durability a real production event system cannot safely
skip.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py`, from the
directory the log file should live in — the `python` program, given one
positional argument, executes that file's statements top to bottom,
reading or writing whatever local files it names along the way.

### Run It

Running the durable publish, then simulating a crash and recovering in
a genuinely fresh process, exactly as the Problem section demonstrated
the in-memory version failing:

```python
# process 1
publish_event_durable("order_placed", {"order_id": 501})
print("event published durably")
```

That process now exits completely — no shared memory, no shared state,
nothing carried forward except whatever was written to disk. A second,
independent process starts afterward and reads the same log file:

```python
# process 2, started fresh, after process 1 has already exited
events = read_unprocessed_events()
print("events recovered after the crash:", events)
```

The real output, from the second, genuinely separate process:

```
events recovered after the crash: [('order_placed', {'order_id': 501})]
```

The identical event that vanished completely in Lesson 83's own
in-memory version is fully intact here, recovered by a process that
never shared any memory at all with the one that published it — proof
that durability, not cleverness, is what closes this gap.

### Connecting Back

Where Lesson 83 decoupled a request's own timeline from non-critical
work, this lesson makes sure that decoupled work can't simply vanish if
the process holding it dies before anything gets a chance to react to
it — the same underlying goal, reliability, applied to a different
failure mode.

## Connect the Pieces

Publishing `order_placed` for order `501` was attempted twice in this
lesson, with an identical simulated crash immediately afterward both
times. First, using Lesson 83's in-memory queue: the event existed for
exactly as long as the publishing process did, and vanished completely
the moment a fresh process started in its place. Second, using a
durable, file-backed log: the identical event, published the same way,
survived the exact same crash simulation, fully recoverable by a process
that shared no memory with the one that wrote it.

## What Breaks Without This

A durable log protects against the publishing process crashing. It does
nothing to protect against the *consuming* process reading an event and
then crashing before finishing whatever that event was supposed to
trigger:

```python
def process_events_naively(path="message_log.jsonl"):
    events = read_unprocessed_events(path)
    for event_name, payload in events:
        if event_name == "order_placed":
            raise RuntimeError("consumer crashed mid-processing")
    # the log is never marked as processed, and never cleared
```

Run for real, this raises `RuntimeError` partway through — and the log
file still contains the event afterward, unmarked, exactly as it did
before processing started. This is actually the *safer* failure
direction (the event isn't lost), but it introduces a new problem this
lesson's own simple log doesn't solve: nothing distinguishes an event
that's been successfully processed from one that hasn't, so restarting
`process_events_naively` would process the identical event again,
duplicating whatever effect it has (a duplicate notification, a
duplicate loyalty-points award). Real message brokers solve this with
acknowledgments and delivery guarantees — concepts this lesson names as
the obvious next problem without building the machinery to solve it.

## Exercises

1. Add a `processed_log.jsonl` file that `process_events_naively`
   appends to only after successfully handling an event, and rewrite
   `read_unprocessed_events` to skip any event already recorded there.
   Prove, with real output, that rerunning the consumer after a
   simulated crash doesn't reprocess an already-handled event.
2. Measure, for real, the actual cost of durability: time 1,000 calls to
   the in-memory `publish_event` against 1,000 calls to
   `publish_event_durable`, the same way Lesson 74 measured its own
   caching tradeoff. How much slower is durable, and is that cost
   acceptable for this specific use case?
3. `message_log.jsonl` grows forever, with every event ever published
   still sitting in it. Name one real strategy a production message
   broker uses to avoid this (log compaction, retention windows,
   deleting after acknowledgment), and argue which one fits this
   lesson's own order-placement scenario best.

## Definition of Done

- [ ] `publish_event_durable` writes each event to
      `message_log.jsonl` before returning.
- [ ] `read_unprocessed_events` correctly reconstructs every published
      event from the log file.
- [ ] The Problem section's in-memory data loss has been reproduced for
      real, across an actual separate process invocation, before
      applying the fix.
- [ ] The "Run It" scenario above has been run across two genuinely
      separate process invocations, not just two function calls in the
      same script, and produces output matching what's pasted here.
- [ ] The "What Breaks Without This" duplicate-processing risk has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like
      `message-oriented architecture: persist events to a durable log
      instead of an in-memory list, so a process crash no longer loses
      published events`, not `add file logging`.

Up next: Lesson 85, Asynchronous Systems — the real concurrency
primitives Python provides for running many of these decoupled
operations at once, instead of this lesson's own script-by-script
simulation.
