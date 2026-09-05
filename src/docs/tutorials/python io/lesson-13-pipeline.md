# Lesson 13: One Pipeline — Backpressure and Errors as First-Class Concerns

**What you will build:** `recordkeeper/pipeline.py`, with
`run_ingestion_pipeline` — a single function composing nearly every
module this curriculum has built: `itertools.chain` (Lesson 7) merging
CSV (Lesson 3), XML (Lesson 6), and JSON (Lesson 5) sources; a new
`dedupe_by_id` stage closing a gap Lesson 7 deliberately left open; a
new `safe_stream` stage isolating per-record failures instead of
letting one bad record abort the whole run; `chunked` (Lesson 7)
batching validated records; and `insert_contacts` (Lesson 8) writing
them, transactionally, to a real database. The transferable problem:
composing generator-based stages the way this curriculum has since
Lesson 6 doesn't just save memory — it gives a pipeline **backpressure**
for free, proven directly by comparing real, ordered output against an
eagerly-materialized alternative; and a real pipeline needs errors
treated as *data*, not as events that stop everything, proven by
deliberately feeding the finished pipeline one genuinely invalid
record alongside real, valid ones.

**What you need to know first:** Lesson 3 (CSV), Lesson 5 (JSON),
Lesson 6 (XML) — the three real sources this pipeline merges. Lesson 7
— `itertools.chain`, `chunked`, and its own deliberately deferred
duplicate-ID problem, closed in this lesson. Lesson 8 — `insert_contacts`
and its transactional guarantee.

**Terms used in this lesson**

- **Backpressure** — a property of a pipeline where a slow or limited
  consumer naturally limits how far ahead a producer is allowed to get,
  rather than the producer running freely ahead and accumulating
  unconsumed results. It exists because a producer that always runs at
  its own maximum speed, regardless of whether anything downstream can
  keep up, either wastes work (producing results nothing has asked for
  yet) or grows an ever-larger backlog in memory — the same underlying
  concern behind every streaming choice this curriculum has made since
  Lesson 1, now named directly as a property of an entire *pipeline*,
  not just a single read.
- **Error isolation** — designing a pipeline so that one item's failure
  is captured and reported without aborting the processing of every
  other item in the same run. It exists because, in a real batch of
  many records from real, imperfect sources, some fraction failing
  validation is often the expected, normal case — a pipeline that
  treats the first bad record as fatal effectively refuses to process
  anything the moment reality doesn't perfectly match expectations.

**Objects and methods used**

Every object or method this lesson's code depends on — `itertools.chain`,
generator functions and `yield`, `chunked`, `insert_contacts`,
`sqlite3.IntegrityError` — was already given full treatment in Lessons
6, 7, and 8, and none of that treatment has changed. This lesson
introduces no new library objects or methods of its own; its only new
material is the composition of those already-explained pieces into new
functions, `dedupe_by_id` and `safe_stream`, both ordinary Python
functions built entirely from already-explained language constructs
(`for`, `yield`, `try`/`except`, a `set`).

---

## Concept Unit: Backpressure — proof, not assertion

### The Problem

Every generator-based stage this curriculum has built since Lesson
6 — `iter_contacts_xml`, `chunked`, `paginate` — has been justified with
the same argument: producing values lazily avoids holding more in
memory than necessary. That argument has never been directly checked
against the *alternative* — what an eager, fully-materializing version
of the same composition would actually do differently, moment to
moment, not just in total memory used.

> **Stop and think:** If a producer generator and a slow consumer are
> chained together — `for item in slow_consumer(producer(...))` — and
> both print a message as they work, what order would you expect those
> messages to appear in? Would the producer ever print more than one
> message ahead of the consumer's own progress — and if a genuinely
> eager version (build the whole list first, *then* consume it) were
> used instead, how would that same message order have to look
> different?

### Introduce the concept in isolation

```python
import time

def producer(n):
    for i in range(1, n + 1):
        print(f"  producing {i}")
        yield i

def slow_consumer(source):
    for item in source:
        print(f"    consuming {item}")
        time.sleep(0.01)

print("=== lazy: a generator producer feeding a consumer ===")
slow_consumer(producer(3))

print()
print("=== eager: fully materializing before any consumption ===")

def eager_list(n):
    print("  building eager list...")
    result = []
    for i in range(1, n + 1):
        print(f"  producing {i}")
        result.append(i)
    return result

for item in eager_list(3):
    print(f"    consuming {item}")
    time.sleep(0.01)
```

Real output:

```
=== lazy: a generator producer feeding a consumer ===
  producing 1
    consuming 1
  producing 2
    consuming 2
  producing 3
    consuming 3

=== eager: fully materializing before any consumption ===
  building eager list...
  producing 1
  producing 2
  producing 3
    consuming 1
    consuming 2
    consuming 3
```

This is **backpressure**, proven directly rather than asserted: the
lazy version's real, ordered output alternates — `producing 1`,
`consuming 1`, `producing 2`, `consuming 2` — because `producer`'s
`yield` (full treatment already given in Lesson 6) genuinely pauses
after each item, and nothing produces item 2 until `slow_consumer`'s
own `for` loop has already finished consuming item 1 and asked for the
next one. `producer` is *never* more than one item ahead of
`slow_consumer` — it structurally cannot be, since a generator's own
body simply doesn't run any further until asked. The eager version's
real output proves the opposite: every single `producing` line appears
*before* any `consuming` line at all — `eager_list` has no way to know
or care how fast its eventual consumer will be, because by the time
consumption starts, production has already fully finished, with every
item's memory already allocated regardless of whether the consumer
ever gets around to using it.

### Discard the throwaway example

`producer`, `slow_consumer`, and `eager_list` are discarded; the real,
proven ordering they demonstrate is what every generator-based stage
`recordkeeper` has built since Lesson 6 — and every stage this
lesson's own pipeline adds — already relies on.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/pipeline.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `itertools` (standard library);
  `recordkeeper.ingest.csv_source`, `.json_source`, `.xml_source`,
  `.util` (Lessons 3, 5, 6, 7); `recordkeeper.store` (Lesson 8).

### The New Code

```python
import itertools

from recordkeeper.ingest.csv_source import load_contacts_csv
from recordkeeper.ingest.json_source import contacts_from_json
from recordkeeper.ingest.util import chunked
from recordkeeper.ingest.xml_source import load_contacts_xml
from recordkeeper.store import connect, insert_contacts
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **five `import`/`from` lines** — bring every already-built piece this
  pipeline composes into scope: `itertools` (Lesson 7),
  `load_contacts_csv` (Lesson 3), `contacts_from_json` (Lesson 5),
  `chunked` (Lesson 7), `load_contacts_xml` (Lesson 6), and
  `connect`/`insert_contacts` (Lesson 8) — every one of them already
  given full treatment in its own lesson, none of it re-explained
  differently here.

### CS lens

A consumer that can only ever be as far behind as it chooses to be —
never forced to buffer more than it's currently processing — is the
same **bounded-buffer** idea behind any real producer/consumer system
designed for stability under load, extended here across an entire
multi-stage pipeline rather than a single read.

```
Also recognized in: TCP's own flow-control window (Lesson 11's own
`x-ratelimit-reset` header is a related but distinct idea — rate
limiting; backpressure is about pacing, not a hard quota), reactive
streams frameworks (Reactor, RxJava) that make backpressure an explicit
part of their contract, Unix pipes blocking a writing process once a
reader stops reading fast enough
```

### SE lens

The alternative not chosen — building `run_ingestion_pipeline` around
plain lists at each stage (`load_contacts_csv(...) +
load_contacts_xml(...) + ...`, fully materialized, then filtered into a
new list, then chunked from that) — would still produce a correct final
result for `recordkeeper`'s own small, three-contact-per-source data.
The real tradeoff, proven directly by this unit's own lab, is that an
eager pipeline's memory cost during a run is the *sum* of every
intermediate stage's full output held at once, while a generator-chained
pipeline's cost is bounded by whatever the *slowest* single stage needs
to hold at any one instant — a difference invisible at
`recordkeeper`'s current small scale, and exactly the difference Lesson
7 already measured directly, in real megabytes, for a single stage.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit proves the pipeline's own generator-chained shape gives it
backpressure for free; the next unit adds the second first-class
concern a real pipeline needs — what happens when one item, partway
through, simply isn't valid.

---

## Concept Unit: Error isolation — one bad record, not a stopped pipeline

### The Problem

Every transformation this curriculum has applied to a stream of
records so far — `contact_from_row`, `contact_from_element`,
`Contact(**row)` — has assumed every record it's handed is valid. A
real pipeline pulling from several real sources doesn't get that
guarantee: exactly the kind of assumption this curriculum has
repeatedly shown fails in practice (Lesson 3's naive CSV split, Lesson
5's `Contact`-into-`json.dumps`, Lesson 8's SQL injection) applies here
too — one genuinely invalid record, left unhandled, can stop an entire
batch that was otherwise completely fine.

> **Stop and think:** If a list comprehension calls a function that
> raises on its third input out of five, what happens to items four and
> five — do they ever get processed at all? If, instead, each item's
> processing were wrapped individually, so a failure produces a
> *value* (something like `("error", the_exception)`) rather than
> propagating as an exception straight out of the loop, what would that
> let the rest of the pipeline do differently?

### Introduce the concept in isolation

```python
def safe_stream(source, process):
    for item in source:
        try:
            yield ("ok", process(item))
        except Exception as e:
            yield ("error", (item, e))

def risky_process(x):
    if x == 3:
        raise ValueError(f"bad value: {x}")
    return x * 10

print("=== without isolation: one bad item kills the whole run ===")
try:
    results = [risky_process(x) for x in range(1, 6)]
    print(results)
except ValueError as e:
    print(f"{type(e).__name__}: {e}")
    print("nothing after the bad item was ever processed")

print("=== with per-item isolation ===")
results = list(safe_stream(range(1, 6), risky_process))
for status, payload in results:
    print(status, payload)

successes = [payload for status, payload in results if status == "ok"]
failures = [payload for status, payload in results if status == "error"]
print("successes ->", successes)
print("failures  ->", failures)
```

Real output:

```
=== without isolation: one bad item kills the whole run ===
ValueError: bad value: 3
nothing after the bad item was ever processed
=== with per-item isolation ===
ok 10
ok 20
error (3, ValueError('bad value: 3'))
ok 40
ok 50
successes -> [10, 20, 40, 50]
failures  -> [(3, ValueError('bad value: 3'))]
```

The unwrapped version proves the real cost of no isolation directly:
`4` and `5` — perfectly valid inputs — are *never processed at all*,
because the list comprehension's own exception propagated straight out
the moment item `3` failed. `safe_stream`, named here in full per Terms
above (**error isolation**), changes what a failure *is*: instead of an
exception unwinding the whole call stack, it becomes an ordinary
`("error", (item, exception))` tuple, yielded like any other value —
`4` and `5` still get processed normally, and the run finishes with a
complete, real picture of what succeeded and what didn't, rather than
stopping cold on the first problem.

### Discard the throwaway example

`risky_process` and this unit's own copy of `safe_stream` are
discarded as standalone lab code; `safe_stream`'s own body — proven
correct here — carries forward into the project below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/pipeline.py` (modified, adding
  `dedupe_by_id`, `validate_contact`, and `safe_stream`).
- **Change type** — add.
- **Location** — after the imports already added in the previous unit.
- **Dependencies** — none new.

### The New Code

```python
def dedupe_by_id(stream):
    seen_ids = set()
    for contact in stream:
        if contact.id in seen_ids:
            continue
        seen_ids.add(contact.id)
        yield contact


def validate_contact(contact):
    if "@" not in contact.email:
        raise ValueError(f"invalid email for contact {contact.id!r}: {contact.email!r}")
    return contact


def safe_stream(source, process):
    for item in source:
        try:
            yield ("ok", process(item))
        except Exception as e:
            yield ("error", (item, e))
```

### The Updated Project

```python
 1  import itertools
 2
 3  from recordkeeper.ingest.csv_source import load_contacts_csv
 4  from recordkeeper.ingest.json_source import contacts_from_json
 5  from recordkeeper.ingest.util import chunked
 6  from recordkeeper.ingest.xml_source import load_contacts_xml
 7  from recordkeeper.store import connect, insert_contacts
 8
 9
10  def dedupe_by_id(stream):                             # ← new
11      seen_ids = set()                                    # ← new
12      for contact in stream:                               # ← new
13          if contact.id in seen_ids:                        # ← new
14              continue                                       # ← new
15          seen_ids.add(contact.id)                          # ← new
16          yield contact                                      # ← new
17
18
19  def validate_contact(contact):                        # ← new
20      if "@" not in contact.email:                        # ← new
21          raise ValueError(f"invalid email for contact {contact.id!r}: {contact.email!r}")  # ← new
22      return contact                                      # ← new
23
24
25  def safe_stream(source, process):                     # ← new
26      for item in source:                                 # ← new
27          try:                                              # ← new
28              yield ("ok", process(item))                    # ← new
29          except Exception as e:                            # ← new
30              yield ("error", (item, e))                    # ← new
```

`dedupe_by_id` closes a real gap Lesson 7's own `iter_all_contacts`
deliberately left open — that lesson's SE lens noted merging
`recordkeeper`'s CSV, XML, and JSON sources produces genuine duplicate
IDs (every sample source shares the same two contacts), and deferred
solving it; this lesson finally does, as a real, minimal streaming
stage rather than a bolted-on fix. `validate_contact` is this
pipeline's own real business rule — a contact needs a real-looking
email — the first thing `safe_stream` will actually be asked to
protect against. `safe_stream` itself is exactly this unit's own
proven function, unchanged.

### Mechanical walkthrough

- **`seen_ids = set()`** — an empty `set`, chosen specifically because
  membership checking (`contact.id in seen_ids`) on a `set` is checked
  once per item and needs to stay fast regardless of how many IDs have
  already been seen — a `list` would work identically in terms of
  correctness but would mean each check scans every previously-seen ID
  in order, growing slower as the stream grows.
- **`if contact.id in seen_ids: continue`** — for a duplicate ID,
  skips straight to the next iteration without yielding anything at
  all — this contact is silently dropped from the stream, not reported
  as an error, a deliberate choice: a duplicate isn't invalid data,
  it's expected, redundant data from overlapping sources.
- **`seen_ids.add(contact.id)`** — only reached for an ID not already
  seen; records it so any later duplicate of the same ID is correctly
  caught on a subsequent iteration.
- **`raise ValueError(...)`** inside `validate_contact` — an ordinary
  function that raises rather than returning, on invalid input; nothing
  about `validate_contact` itself knows or cares that `safe_stream` will
  catch this — the same clean separation of concerns as any other
  function that simply does its one job and signals failure the normal
  way.

### CS lens

Treating a duplicate as silently droppable while treating an invalid
record as reportable failure is a real instance of **classifying
exceptions by kind**, not just by presence — the same discipline this
curriculum applied all the way back in Lesson 8, catching specifically
`sqlite3.IntegrityError` rather than any exception at all.

```
Also recognized in: log-processing systems distinguishing duplicate
events (safe to drop) from malformed events (worth flagging), a
mail server silently deduplicating an already-delivered message while
bouncing a genuinely malformed one, version-control systems treating an
identical duplicate commit differently from a conflicting one
```

### SE lens

The alternative not chosen for `safe_stream` is catching only specific,
anticipated exception types (`ValueError`, say) rather than the broad
`Exception`. The broad catch here is deliberate: `process` is a
parameter, not a fixed function — `safe_stream` is written to isolate
*any* single item's failure, whatever function it's paired with, rather
than needing to be told in advance every way that function might fail.
The real cost is that a *programming* bug inside `process` — not a data
problem at all — would also get silently captured as a per-item
"error" instead of crashing loudly during development, which is a real
tradeoff a narrower `except ValueError:` wouldn't have; `recordkeeper`
accepts it here because `safe_stream` is meant to run against real,
external data whose validity is genuinely uncertain, not as a shield
around code whose own correctness is still being worked out.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit adds `dedupe_by_id` (closing Lesson 7's own deferred gap) and
`safe_stream`/`validate_contact` (this lesson's own proven error-
isolation pattern); the final unit assembles all three, plus every
other already-built piece, into one real function and runs it for
real, against real data plus one deliberately invalid record.

---

## Concept Unit: The whole pipeline, run for real

### The Problem

Every piece is now built — merging (Lesson 7's `itertools.chain`),
deduplication (this lesson), validation with isolation (this lesson),
batching (Lesson 7's `chunked`), and transactional persistence (Lesson
8's `insert_contacts`) — but nothing yet composes them into the single
function `recordkeeper` actually needs to run a real ingestion.

> **Stop and think:** Given `merged` (a chained stream of raw
> `Contact`s, possibly containing duplicates), and the stages already
> built — `dedupe_by_id`, `safe_stream`/`validate_contact`, `chunked`,
> `insert_contacts` — what order do they need to run in? Does
> deduplication need to happen before or after validation? Does
> batching need to happen before or after invalid records have already
> been filtered out?

### Introduce the concept in isolation

This unit's own proof *is* the finished pipeline, run for real, against
`recordkeeper`'s genuine CSV/XML/JSON sample data plus one deliberately
constructed invalid `Contact`:

```python
from recordkeeper.pipeline import run_ingestion_pipeline
from recordkeeper.models import Contact
from recordkeeper.store import all_contacts, connect

bad_contact = Contact(id="99", name="Bad Record", email="not-an-email",
                       notes="deliberately invalid for the demo")

result = run_ingestion_pipeline(
    "data/recordkeeper_pipeline.db",
    "data/contacts.csv",
    "data/contacts.xml",
    "data/contacts.json",
    extra_contacts=[bad_contact],
    batch_size=2,
)
print("inserted:", result["inserted"])
print("errors:", result["errors"])

conn = connect("data/recordkeeper_pipeline.db")
print("rows actually persisted:", all_contacts(conn))
```

Real output, from an actual run:

```
inserted: 2
errors: [(Contact(id='99', name='Bad Record', email='not-an-email', notes='deliberately invalid for the demo'), ValueError("invalid email for contact '99': 'not-an-email'"))]
rows actually persisted: [Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls'), Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')]
```

Trace the real numbers: the merged stream carries *seven* items —
Alice and Bob from CSV, Alice and Bob again from XML, Alice and Bob
again from JSON, plus the one deliberately bad extra record.
`dedupe_by_id` reduces the six real duplicates down to Alice and Bob's
first appearance each, plus the bad record (a unique ID, `"99"`, so
never deduplicated) — three items reach `validate_contact`. The bad
record fails validation and is captured, by `safe_stream`, as a real
`(Contact, ValueError)` pair in `result["errors"]` — not a crash, not a
silently dropped record, a real, inspectable value. The two genuinely
valid, deduplicated contacts proceed through `chunked` and
`insert_contacts`, landing in the real database — confirmed directly by
querying it back with `all_contacts` afterward, showing exactly Alice
and Bob, and nothing else.

### Discard the throwaway example

Nothing here is discarded — this unit's own verification *is*
`recordkeeper`'s real, finished pipeline, run for real, against real
project data plus one deliberately invalid record.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior unit.
- **Files affected** — `recordkeeper/pipeline.py` (modified, adding
  `run_ingestion_pipeline`).
- **Change type** — add.
- **Location** — after `safe_stream`, already present from the previous
  unit.
- **Dependencies** — none new.

### The New Code

```python
def run_ingestion_pipeline(db_path, csv_path, xml_path, json_path, extra_contacts=(), batch_size=2):
    with open(json_path, encoding="utf-8") as f:
        json_contacts = contacts_from_json(f.read())

    merged = itertools.chain(
        load_contacts_csv(csv_path),
        load_contacts_xml(xml_path),
        json_contacts,
        extra_contacts,
    )

    errors = []

    def good_only(stream):
        for status, payload in stream:
            if status == "ok":
                yield payload
            else:
                errors.append(payload)

    validated = safe_stream(dedupe_by_id(merged), validate_contact)
    good = good_only(validated)

    conn = connect(db_path)
    inserted = 0
    for batch in chunked(good, batch_size):
        insert_contacts(conn, batch)
        inserted += len(batch)

    return {"inserted": inserted, "errors": errors}
```

### The Updated Project

`recordkeeper/pipeline.py`, complete:

```python
 1  import itertools
 2
 3  from recordkeeper.ingest.csv_source import load_contacts_csv
 4  from recordkeeper.ingest.json_source import contacts_from_json
 5  from recordkeeper.ingest.util import chunked
 6  from recordkeeper.ingest.xml_source import load_contacts_xml
 7  from recordkeeper.store import connect, insert_contacts
 8
 9
10  def dedupe_by_id(stream):
11      seen_ids = set()
12      for contact in stream:
13          if contact.id in seen_ids:
14              continue
15          seen_ids.add(contact.id)
16          yield contact
17
18
19  def validate_contact(contact):
20      if "@" not in contact.email:
21          raise ValueError(f"invalid email for contact {contact.id!r}: {contact.email!r}")
22      return contact
23
24
25  def safe_stream(source, process):
26      for item in source:
27          try:
28              yield ("ok", process(item))
29          except Exception as e:
30              yield ("error", (item, e))
31
32
33  def run_ingestion_pipeline(db_path, csv_path, xml_path, json_path,  # ← new
34                              extra_contacts=(), batch_size=2):        # ← new
35      with open(json_path, encoding="utf-8") as f:                    # ← new
36          json_contacts = contacts_from_json(f.read())                # ← new
37
38      merged = itertools.chain(                                       # ← new
39          load_contacts_csv(csv_path),                                 # ← new
40          load_contacts_xml(xml_path),                                 # ← new
41          json_contacts,                                               # ← new
42          extra_contacts,                                              # ← new
43      )                                                                # ← new
44
45      errors = []                                                     # ← new
46
47      def good_only(stream):                                          # ← new
48          for status, payload in stream:                                # ← new
49              if status == "ok":                                        # ← new
50                  yield payload                                          # ← new
51              else:                                                     # ← new
52                  errors.append(payload)                                 # ← new
53
54      validated = safe_stream(dedupe_by_id(merged), validate_contact)  # ← new
55      good = good_only(validated)                                     # ← new
56
57      conn = connect(db_path)                                         # ← new
58      inserted = 0                                                    # ← new
59      for batch in chunked(good, batch_size):                          # ← new
60          insert_contacts(conn, batch)                                 # ← new
61          inserted += len(batch)                                       # ← new
62
63      return {"inserted": inserted, "errors": errors}                 # ← new
```

`run_ingestion_pipeline` is `recordkeeper`'s real, complete ingestion
entry point: merge three real sources plus any extra records a caller
supplies, deduplicate, validate with per-item error isolation, batch,
and persist transactionally — five already-proven stages, composed in
the one order that makes each one's own guarantee actually hold.

### Mechanical walkthrough

- **`with open(json_path, ...) as f: json_contacts =
  contacts_from_json(f.read())`** — full treatment already given in
  Lessons 1 and 5; unlike `load_contacts_csv`/`load_contacts_xml`,
  which open their own files internally, `contacts_from_json` (Lesson
  5) takes already-read text, so this line reads the file itself
  first.
- **`itertools.chain(load_contacts_csv(csv_path), load_contacts_xml(xml_path), json_contacts, extra_contacts)`**
  — full treatment of `itertools.chain` already given in Lesson 7;
  merges four sources — three real ones plus whatever
  `extra_contacts` a caller supplies — into one logical stream, without
  copying any of them.
- **`errors = []`, `def good_only(stream): ...`** — `good_only` is
  defined as a nested generator function, closing over `errors` (an
  ordinary Python closure — `good_only` reads and mutates the
  enclosing function's own `errors` list directly, without it being
  passed as an argument); this is what turns `safe_stream`'s own
  `("ok", ...)`/`("error", ...)` tuples into two separate, real
  effects: successful items continue flowing through the pipeline as
  plain values, while failures accumulate silently on the side, in
  `errors`, for `run_ingestion_pipeline`'s own caller to inspect
  afterward.
- **`validated = safe_stream(dedupe_by_id(merged), validate_contact)`**
  — deduplication happens *before* validation, deliberately: a
  duplicate contact should never be double-validated or double-counted
  as an error just because it happened to appear in more than one
  source.
- **`good = good_only(validated)`** — full treatment of the closure
  above; `good` is itself a generator, still fully lazy — nothing about
  any stage so far has actually run yet.
- **`for batch in chunked(good, batch_size): insert_contacts(conn,
  batch)`** — full treatment of `chunked` (Lesson 7) and
  `insert_contacts` (Lesson 8); this is the line that actually drives
  the entire lazy chain — `chunked`'s own `for` loop is what finally
  pulls values through every stage built above it, one batch at a
  time, and each batch is inserted as its own real transaction,
  exactly as Lesson 8 proved.

### CS lens

`good_only`'s closure over `errors` — reading and mutating a variable
from its enclosing function's scope, without that variable being
passed as a parameter or returned directly — is a real instance of a
**closure**: a function that carries a real, live reference to
variables from the scope it was defined in, not just a snapshot of
their values at definition time.

```
Also recognized in: a JavaScript event handler referencing a variable
from the function that registered it, a decorator wrapping a function
and keeping a reference to state from its own enclosing scope, a
generator's own internal state (Lesson 6) being a closure-like
mechanism in its own right — a paused function remembering exactly
where it left off
```

### SE lens

The alternative not chosen is having `run_ingestion_pipeline` raise
immediately on the first invalid record, the same "no isolation"
behavior this lesson's second unit proved costly. For a real ingestion
job pulling from several real, imperfect sources, that would mean one
malformed record — genuinely likely, at real scale — aborts an entire
run that was otherwise completely successful, with whatever records
had already been inserted in earlier transactions left committed and
everything after the failure never attempted at all: a confusing,
partially-applied outcome, not the clean all-or-nothing atomicity
Lesson 8 specifically proved `insert_contacts` provides *within* a
single batch. Collecting errors separately, as this lesson's own
`good_only` does, keeps that per-batch atomicity intact while still
processing every valid record in the run, real proof of which is this
unit's own output: exactly two rows persisted, exactly one error
reported, with nothing left ambiguous about which is which.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output,
from an actual run against real project data.

### Connect

Every stage built across this lesson's three units — proven
backpressure, proven error isolation, and the deduplication this
lesson finally added — comes together here, run for real, closing this
curriculum's own real, running project.

---

## Connect the pieces

`run_ingestion_pipeline`'s one real run, in this lesson's final unit,
touches nearly every module this curriculum has built. `load_contacts_csv`
(Lesson 3) and `load_contacts_xml` (Lesson 6) each return a real,
already-proven-correct list of `Contact` objects; `contacts_from_json`
(Lesson 5) does the same from already-read text. `itertools.chain`
(Lesson 7) merges all three, plus one deliberately invalid extra
record, into a single lazy stream — proven, in this lesson's first
unit, to give the entire pipeline real backpressure: nothing downstream
ever gets more than one record ahead of what's actually been consumed.
`dedupe_by_id`, new in this lesson, finally closes the exact gap Lesson
7's own SE lens named and deferred, reducing six duplicate real
contacts down to two. `safe_stream`, wrapping `validate_contact`,
isolates the one deliberately bad record — proven, in this lesson's
second unit, to let every other item keep flowing rather than aborting
the run — into a real, inspectable error rather than a crash.
`chunked` (Lesson 7) batches the two survivors; `insert_contacts`
(Lesson 8) persists them transactionally. Queried back afterward with
`all_contacts` (Lesson 8), the database holds exactly Alice and Bob —
real, verified proof that a thirteen-lesson curriculum's worth of
individually-proven pieces compose correctly into one real, working
system, not just individually in isolation.
