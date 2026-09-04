# Lesson 7: Measuring Efficiency — Memory, `itertools`, and Batching

**What you will build:** a `count_event` function added to `raw_log.py`
that counts matching log lines without ever materializing the whole
file; a new `merge.py` module using `itertools.chain` to combine
`recordkeeper`'s CSV, XML, and JSON contact sources into one lazily-
merged stream; and a new `util.py` with a hand-built `chunked`
generator, verified against the standard library's own
`itertools.batched`. The transferable problem: Lesson 1 and Lesson 2
*argued* that streaming saves memory; this lesson actually measures it,
in real megabytes, on a real 300,000-line file — and then gives you two
more reusable tools, `itertools.islice`/`chain` and a chunking
generator, for working with large or multiple data sources without
loading everything at once.

**What you need to know first:** Lesson 1 — streaming line-by-line
iteration. Lesson 2 — buffering. Lesson 4 — `Contact`. Lesson 5 —
`contacts_from_json`. Lesson 6 — generator functions (`yield`),
`load_contacts_csv`/`load_contacts_xml`.

**Terms used in this lesson**

- **Peak memory** — the largest amount of memory a piece of code
  actually held at any single point during its execution, not the
  average or the amount held at the end. It exists as the relevant
  number to measure here because a program that briefly holds a huge
  amount of memory can still crash or get killed by the operating
  system even if it releases that memory again moments later — total
  memory *ever* used doesn't capture this, but the peak does.
- **Lazy merging** — combining several separate iterables into what
  behaves like one continuous sequence, without first copying every
  element out of each one into a new, combined structure. It exists so
  that "process these three sources as if they were one" doesn't
  require paying the memory and time cost of actually building that
  one combined structure first.
- **Batching (chunking)** — grouping a stream of individual items into
  fixed-size groups, processed group by group rather than one item at a
  time or all items at once. It exists because many real operations
  (a network call, a database insert) have a fixed per-call overhead
  independent of how many items that one call carries — the same
  fixed-cost-per-call reasoning Lesson 2 used for buffered reads,
  applied here to a caller's own operations instead of the standard
  library's internal ones.

**Objects and methods used**

- **`tracemalloc`**
  - *What it is:* A standard-library module for tracing Python's own
    memory allocations.
  - *Implementation:* `tracemalloc.start()` begins tracking;
    `tracemalloc.get_traced_memory() -> (current, peak)` returns the
    current and peak number of bytes allocated since `start()` was
    called; `tracemalloc.stop()` ends tracking.
  - *Its use:* Used only in this lesson's lab, to turn "streaming uses
    less memory" from an assertion into a measured, real number.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library module exposing module-level functions; responsible
    for recording every memory allocation Python's own interpreter makes
    while tracing is active, and reporting current/peak totals on
    request; depends on being started before the code being measured
    runs, and stopped (or at least queried) after; called directly,
    bracketing each lab block; shape is a `(int, int)` tuple of byte
    counts, current and peak.

- **`itertools.islice`**
  - *What it is:* A function from the standard library's `itertools`
    module that lazily takes a limited slice from any iterable.
  - *Implementation:* `itertools.islice(iterable, stop)` (or with a
    start/step, `islice(iterable, start, stop, step)`) returns an
    iterator yielding only the requested slice, pulling from the
    underlying iterable only as many items as the slice actually needs.
  - *Its use:* Proves, in this lesson's lab, that only the first few
    lines of a 300,000-line file need to be read to get the first five;
    reused inside `chunked`'s own implementation to pull one batch's
    worth of items at a time.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function returning an iterator; responsible for
    yielding a bounded number of items from an underlying iterable
    without ever pulling more than that from it; depends on any
    iterable (a file object, a generator, a plain list); consumed
    directly in this lesson's lab and inside `chunked`'s own loop;
    shape is an iterable in, a lazily-bounded iterator out.

- **`itertools.chain`**
  - *What it is:* A function from `itertools` that lazily concatenates
    several iterables into one logical sequence.
  - *Implementation:* `itertools.chain(*iterables)` returns an
    iterator that yields every item from the first iterable, then every
    item from the second, and so on, without building a combined
    structure first.
  - *Its use:* What `iter_all_contacts` uses to present `recordkeeper`'s
    CSV, XML, and JSON contact sources as one merged stream.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function returning an iterator; responsible for
    exhausting each given iterable in order and yielding its items,
    moving to the next iterable only once the current one is exhausted;
    depends on any number of iterables passed to it; called directly
    inside `iter_all_contacts`, whose result is then consumed by
    `chunked`; shape is several iterables in, one merged iterator out.

- **`itertools.batched`**
  - *What it is:* A standard-library function (Python 3.12+) that
    groups an iterable's items into fixed-size tuples.
  - *Implementation:* `itertools.batched(iterable, n)` yields
    successive `n`-length tuples, with a final, shorter tuple if the
    iterable's length isn't a multiple of `n`.
  - *Its use:* Used only in this lesson's lab, as the real
    standard-library equivalent to check the hand-built `chunked`
    generator's output against.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function returning an iterator; responsible for
    grouping an iterable's items into fixed-size groups, in order;
    depends on any iterable and a batch size `n`; shape is one iterable
    and one `int` in, an iterator of `tuple`s out — a `tuple`, notably,
    not a `list`, which is this lesson's lab's own point of comparison
    against the hand-built `chunked`.

---

## Concept Unit: Measuring the real cost of "load it all first"

### The Problem

Lesson 1 and Lesson 2 both argued, in prose and with a small proof,
that streaming through a file avoids holding its entire content in
memory at once. Neither lesson actually measured how much memory a
realistic, much larger file would cost if loaded all at once versus
streamed — "avoids a cost" is a claim that deserves a real number, not
just a plausible-sounding argument.

> **Stop and think:** If a 300,000-line log file is read with
> `lines = list(f)` and then searched, versus read with a `for line in
> f:` loop that never builds a list at all, which one do you expect to
> use *more* peak memory, and roughly how would you expect that gap to
> scale if the file were ten times larger? Would you expect the
> streaming version's peak memory to grow at all as the file grows?

### Introduce the concept in isolation

Against a real, freshly generated 300,000-line synthetic log file
(`big_events.log`, ~11.6 MB on disk):

```python
import tracemalloc

tracemalloc.start()
with open("big_events.log", encoding="utf-8") as f:
    lines = list(f)
    login_count = 0
    for line in lines:
        if " login " in line:
            login_count += 1
current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()
print(f"login_count = {login_count}")
print(f"peak memory during this block: {peak / 1_000_000:.2f} MB")

tracemalloc.start()
with open("big_events.log", encoding="utf-8") as f:
    login_count_streamed = sum(1 for line in f if " login " in line)
current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()
print(f"login_count_streamed = {login_count_streamed}")
print(f"peak memory during this block: {peak / 1_000_000:.2f} MB")

print("counts match ->", login_count == login_count_streamed)
```

Real output:

```
login_count = 60105
peak memory during this block: 26.50 MB
login_count_streamed = 60105
peak memory during this block: 0.02 MB
counts match -> True
```

Both versions count the exact same 60,105 matching lines — this isn't
a tradeoff between correct and incorrect, both are fully correct. The
peak memory gap is real and large: `list(f)` peaks at 26.50 MB,
roughly matching the file's own on-disk size (text held in memory
costs somewhat more than its on-disk bytes, due to Python's own `str`
object overhead per line); the streaming generator-expression version
peaks at 0.02 MB — three orders of magnitude smaller — because at any
given instant it's only ever holding one line's text plus a running
integer count, regardless of whether the file has 300,000 lines or
300,000,000.

### Discard the throwaway example

`big_events.log` and this lab's code are discarded; they exist only to
turn Lesson 1 and Lesson 2's memory arguments into one real, measured
comparison at a scale small examples couldn't show.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — `recordkeeper/ingest/raw_log.py` (modified,
  adding one function).
- **Change type** — add.
- **Location** — after `normalize_log`, already present since Lesson
  1.
- **Dependencies** — none new.

### The New Code

```python
def count_event(path, event_name):
    with open(path, "r", encoding="utf-8") as f:
        return sum(1 for line in f if f" {event_name} " in line)
```

### The Updated Project

```python
 1  def normalize_log(input_path, output_path):
 2      with open(input_path, "r", encoding="utf-8") as infile:
 3          with open(output_path, "w", encoding="utf-8") as outfile:
 4              for line in infile:
 5                  cleaned = line.rstrip("\n")
 6                  outfile.write(cleaned + "\n")
 7
 8
 9  def count_event(path, event_name):               # ← new
10      with open(path, "r", encoding="utf-8") as f:  # ← new
11          return sum(1 for line in f if f" {event_name} " in line)  # ← new
```

`raw_log.py` now offers a second operation on a log file, alongside
`normalize_log` (Lesson 1): counting how many lines mention a given
event, using the exact same memory-bounded streaming technique this
unit's lab just measured — one line held at a time, never the whole
file.

### Mechanical walkthrough

- **`sum(1 for line in f if f" {event_name} " in line)`** — a
  generator expression, `1 for line in f if f" {event_name} " in
  line`, wrapped directly in a call to the builtin `sum`. The
  generator expression yields the literal integer `1` once for every
  line in `f` that satisfies the `if` condition, and nothing for lines
  that don't; `sum` consumes that generator and adds up everything it
  yields, which — since every yielded value is `1` — produces exactly a
  count of matching lines. This is the identical pattern the isolated
  lab's `login_count_streamed` line used, now generalized to take
  `event_name` as a parameter instead of the literal `" login "`.
- **`f" {event_name} " in line`** — an f-string building a search
  target with a leading and trailing space around `event_name` (so
  searching for `"login"` doesn't also match `"logout"`, which
  contains `"log"` as a substring but not `" login "` with spaces on
  both sides), then Python's own `in` operator checking whether that
  exact substring occurs anywhere in `line`.

### CS lens

Measuring peak memory with a real tool instead of reasoning about it
from first principles is an instance of **empirical performance
verification** — the same standard this curriculum's own Verification
Rule already applies to output correctness, applied here to a resource
cost instead of a returned value.

```
Also recognized in: database query planners choosing an execution
strategy based on actual measured statistics rather than a fixed rule,
a compiler's profile-guided optimization using a real prior run's data,
load testing a web service against real traffic patterns rather than
assuming a design "should" scale
```

### SE lens

The alternative not chosen for `count_event` is `len([line for line in
f if ...])` — a list comprehension instead of a generator expression
plus `sum`. Both are correct, and for a small file the difference is
irrelevant. The measured tradeoff, per this unit's own lab, is that the
list comprehension version pays the same real, non-trivial peak-memory
cost `list(f)` did above, for no benefit — nothing about `count_event`
needs the matching lines to exist as a list at any point, only a
running count. Choosing the generator-expression form costs nothing in
readability here and, per the lab's own measured numbers, saves real
memory the moment `count_event` is ever pointed at a genuinely large
log file instead of `recordkeeper`'s current three-line sample.

### Commands needed

None new.

### Run it

Real output, from an actual run against `recordkeeper`'s own
`data/events_raw.txt` (Lesson 1):

```python
from recordkeeper.ingest.raw_log import count_event

print(count_event("data/events_raw.txt", "login"))
print(count_event("data/events_raw.txt", "logout"))
print(count_event("data/events_raw.txt", "click"))
```

```
1
1
1
```

### Connect

The previous lessons argued streaming matters; this unit measured it,
at a scale where the difference is unmistakable, and carried the same
technique into a real, permanent addition to `raw_log.py` — the next
unit turns to a different efficiency concern: working with *several*
data sources at once without merging them into one big structure
first.

---

## Concept Unit: `itertools.islice` and `itertools.chain`

### The Problem

`recordkeeper` now has three separate ways to load contacts —
`load_contacts_csv` (Lesson 3), `load_contacts_xml` (Lesson 6), and
`contacts_from_json` (Lesson 5) — each returning its own list. Treating
all of a project's contacts as one combined group, regardless of which
file they came from, currently means writing `csv_contacts +
xml_contacts + json_contacts`, list concatenation, which requires all
three lists to already exist in memory and builds a fourth, new list
containing everything again.

> **Stop and think:** If three separate lists already each exist in
> memory, is there a way to iterate over "all of them, in order" that
> doesn't require building a brand-new fourth list containing a copy of
> every element first? What would it take for something to just walk
> the first list to its end, then start walking the second, then the
> third, without ever copying elements out of them into somewhere new?

### Introduce the concept in isolation

```python
import itertools

lines_pulled = 0
def counting_lines(f):
    global lines_pulled
    for line in f:
        lines_pulled += 1
        yield line

with open("big_events.log", encoding="utf-8") as f:
    first_five = list(itertools.islice(counting_lines(f), 5))
for line in first_five:
    print(repr(line))

total_lines = sum(1 for _ in open("big_events.log", encoding="utf-8"))
print(f"lines actually pulled from the file: {lines_pulled}")
print(f"total lines in the file: {total_lines}")
print("islice stopped far short of reading the whole file ->", lines_pulled < total_lines)

a = [1, 2, 3]
b = [4, 5]
c = [6]
merged = itertools.chain(a, b, c)
print("type(merged) ->", type(merged))
print("list(merged) ->", list(merged))
```

Real output:

```
'2026-08-01T00:00:00 login user=user2\n'
'2026-08-01T00:00:01 logout user=user16\n'
'2026-08-01T00:00:02 click user=user9\n'
'2026-08-01T00:00:03 login user=user44\n'
'2026-08-01T00:00:04 error user=user6\n'
lines actually pulled from the file: 5
total lines in the file: 300000
islice stopped far short of reading the whole file -> True
type(merged) -> <class 'itertools.chain'>
list(merged) -> [1, 2, 3, 4, 5, 6]
```

`counting_lines` wraps the file with a counter incremented once per
line actually pulled through it; after `itertools.islice(counting_lines(f), 5)`
is fully consumed, that counter reads exactly `5`, against a file with
300,000 total lines — real, measured proof that `islice` genuinely
stops pulling from its source the moment its own limit is reached,
rather than reading everything and discarding the rest afterward. The
second block proves `itertools.chain`'s own behavior: `type(merged)` is
a real `itertools.chain` object, not a plain list — nothing was copied
or concatenated yet at that point — and only calling `list(merged)`
actually walks through it, producing all six original items, `a`'s
three, then `b`'s two, then `c`'s one, in that order.

### Discard the throwaway example

`big_events.log`, `counting_lines`, and this lab's `a`/`b`/`c` lists
are discarded; the two functions they prove — `islice` stopping early,
`chain` merging without copying — carry forward into the project
below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — new file `recordkeeper/ingest/merge.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `itertools` (standard library);
  `load_contacts_csv` (Lesson 3), `load_contacts_xml` (Lesson 6),
  `contacts_from_json` (Lesson 5).

### The New Code

```python
import itertools

from recordkeeper.ingest.csv_source import load_contacts_csv
from recordkeeper.ingest.json_source import contacts_from_json
from recordkeeper.ingest.xml_source import load_contacts_xml


def iter_all_contacts(csv_path, json_path, xml_path):
    csv_contacts = load_contacts_csv(csv_path)
    with open(json_path, encoding="utf-8") as f:
        json_contacts = contacts_from_json(f.read())
    xml_contacts = load_contacts_xml(xml_path)
    return itertools.chain(csv_contacts, xml_contacts, json_contacts)
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **three `import` lines** — bring `load_contacts_csv`,
  `contacts_from_json`, and `load_contacts_xml` into scope from their
  own modules — full treatment of each was already given in Lessons 3,
  5, and 6 respectively; nothing about what they do has changed here.
- **`csv_contacts = load_contacts_csv(csv_path)`** — calls the Lesson
  3 function directly, producing a real `list[Contact]`.
- **`with open(json_path, ...) as f: json_contacts =
  contacts_from_json(f.read())`** — opens the JSON file (same `open`
  and `with` from Lesson 1), reads its full text, and passes that text
  to `contacts_from_json` (Lesson 5), producing another
  `list[Contact]`.
- **`xml_contacts = load_contacts_xml(xml_path)`** — calls the Lesson 6
  function directly, producing a third `list[Contact]`.
- **`itertools.chain(csv_contacts, xml_contacts, json_contacts)`** —
  full treatment above, in Objects and methods used; returns one
  merged iterator over all three lists, in that order, without copying
  any of their contents into a new structure.

### CS lens

Presenting several distinct underlying sources as one uniform interface
— here, "all contacts," regardless of which file format each one came
from — is the **facade pattern**: a single, simplified entry point
sitting in front of several more complex or varied things underneath
it.

```
Also recognized in: a search engine querying multiple backend indexes
and returning one merged result list, a media player's unified
"library" view built from files scattered across several folders or
drives, a company's single customer-support inbox actually built by
merging email, chat, and phone-transcript systems behind the scenes
```

### SE lens

The alternative not chosen is `csv_contacts + xml_contacts +
json_contacts` — plain list concatenation, using the `+` operator.
That's arguably more familiar-looking, and for three small lists the
difference is negligible. The real tradeoff, matching this lesson's
first unit, is memory: `+` on three lists builds a brand-new fourth
list holding a copy of every element from all three, while
`itertools.chain` never copies anything — it just remembers which
iterable it's currently walking and moves to the next one once the
current one is exhausted. For `recordkeeper`'s current two-contact-per-
source files this cost is invisible; the same reasoning as
`iter_contacts_xml` in Lesson 6 applies here too — the cost of writing
it the memory-conscious way today is one function, and the alternative
is a rewrite once one of these three sources actually grows large.

### Commands needed

None new.

### Run it

Real output, from an actual run against `recordkeeper`'s own three
sample data files:

```python
from recordkeeper.ingest.merge import iter_all_contacts

merged = iter_all_contacts("data/contacts.csv", "data/contacts.json", "data/contacts.xml")
for c in merged:
    print(c)
```

```
Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls')
Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')
Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls')
Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')
Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls')
Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')
```

Six results — the same two contacts, once from each of the three
sample source files this curriculum has built since Lesson 3, in
source order: CSV's two, then XML's two, then JSON's two, exactly as
`itertools.chain`'s own isolated lab proved it would order them.

### Connect

The previous unit measured memory for a single stream; this unit
extends the same lazy-evaluation habit to *combining* several streams
into one, using `islice` (proven to stop early) and `chain` (proven to
merge without copying) — the next unit adds a third tool, for
processing a merged stream like this one in fixed-size groups.

---

## Concept Unit: Batching a stream with a hand-built `chunked`

### The Problem

A merged stream of contacts, like `iter_all_contacts`'s result, is
naturally suited to being processed one contact at a time — but many
real operations this curriculum is building toward (a batch API call,
a batch database insert, both coming in later lessons) have a real,
fixed cost per call, the same reasoning Lesson 2 applied to buffered
reads. Calling such an operation once per single contact would pay that
fixed cost far more often than necessary; calling it once for the
*entire* stream would require materializing the whole thing in memory
first — exactly the cost this lesson's first unit just measured and
avoided.

> **Stop and think:** Given `itertools.islice`, already proven in the
> previous unit to pull exactly as many items as asked and no more,
> what would it take to repeatedly ask it for "the next 3 items," over
> and over, until nothing is left — turning one long stream into a
> sequence of fixed-size groups, without ever holding more than one
> group in memory at a time?

### Introduce the concept in isolation

```python
import itertools

def chunked(iterable, size):
    iterator = iter(iterable)
    while True:
        batch = list(itertools.islice(iterator, size))
        if not batch:
            return
        yield batch

data = list(range(1, 11))
ours = list(chunked(data, 3))
print("our chunked() ->", ours)

stdlib = list(itertools.batched(data, 3))
print("itertools.batched() ->", stdlib)

print("same groupings (list-vs-tuple aside) ->", [list(b) for b in stdlib] == ours)
```

Real output:

```
our chunked() -> [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
itertools.batched() -> [(1, 2, 3), (4, 5, 6), (7, 8, 9), (10,)]
same groupings (list-vs-tuple aside) -> True
```

`chunked`, hand-written using nothing but `iter()` and the already-
proven `itertools.islice`, produces the identical grouping — including
the final, shorter group of one leftover item — as the real standard-
library `itertools.batched` (added in Python 3.12), differing only in
using `list` where `batched` uses `tuple` for each group. This is a
generator function, `yield` and all (full treatment already given in
Lesson 6): `chunked` doesn't compute every batch up front, it produces
one batch, pauses, and produces the next only when asked, the same
mechanism `iter_contacts_xml` used in Lesson 6.

### Discard the throwaway example

`data`, `ours`, and `stdlib` are discarded; `chunked`'s own function
body — the actual point — carries forward into the project below
unchanged.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — new file `recordkeeper/ingest/util.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `itertools` (standard library).

### The New Code

```python
import itertools


def chunked(iterable, size):
    iterator = iter(iterable)
    while True:
        batch = list(itertools.islice(iterator, size))
        if not batch:
            return
        yield batch
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`iterator = iter(iterable)`** — the builtin `iter()` function
  called on `iterable`: obtains a real iterator object from it. This
  matters specifically because `itertools.islice`, called repeatedly
  inside the loop below, needs to resume from wherever the *previous*
  call left off; calling `iter()` once, up front, and reusing that same
  iterator object across every loop iteration is what makes each
  `islice` call continue where the last one stopped, rather than
  restarting from the beginning of `iterable` every time.
- **`while True:`** — an unconditional loop, relying entirely on the
  `return` inside it (below) to end — appropriate here because there's
  no fixed number of batches known in advance; the loop keeps producing
  batches until the source genuinely runs out.
- **`batch = list(itertools.islice(iterator, size))`** — full treatment
  of `itertools.islice` above; pulls up to `size` items from `iterator`
  (fewer, if fewer than `size` remain) and immediately builds a real
  `list` from them — a batch is materialized as a list, even though the
  overall stream of batches is still produced lazily, one at a time.
- **`if not batch: return`** — an empty list is falsy in Python; when
  `islice` had nothing left to pull, `batch` comes back as `[]`, and
  `return` inside a generator function ends it — full treatment of a
  generator function's own termination behavior already given in
  Lesson 6, where a `for` loop with nothing left to iterate similarly
  raises `StopIteration` internally.
- **`yield batch`** — full treatment of `yield` already given in
  Lesson 6; produces the current, non-empty batch and pauses `chunked`
  right here until the next batch is asked for.

### CS lens

Grouping a stream into fixed-size batches, purely to amortize a fixed
per-operation cost across many items, is the **batching** pattern named
in this lesson's own Terms section — closely related to, but distinct
from, Lesson 2's buffering: buffering batches many small *reads* into
fewer large ones automatically, inside a library; batching here groups
many small logical *items* into fewer large *operations*, deliberately,
in application code that knows what those operations will be used for.

```
Also recognized in: database drivers offering a batch-insert API
instead of one INSERT per row, message queues delivering messages in
batches to reduce per-message acknowledgment overhead, GPU computation
processing data in batches to keep the hardware's parallel units busy
```

### SE lens

The alternative not chosen is using `itertools.batched` directly
instead of writing `chunked` by hand, now that both are proven
identical in this unit's own lab. For `recordkeeper` going forward,
reaching for the real standard-library `itertools.batched` would
usually be the right call — it's one line, already correct, and
requires no maintenance. `chunked` is included here anyway, deliberately,
for the same demystification reason `TinyBufferedReader` (Lesson 2) and
this lesson's own tiny JSON parser existed: `itertools.batched` isn't
picked because a hand-built version can't work — the lab just proved it
can, exactly — it's picked because seeing precisely how "pull `size` at
a time until nothing's left" reduces to `iter()` plus the already-proven
`islice` is what turns `itertools.batched` from a trusted black box into
an understood one. `recordkeeper`'s own code uses `chunked`, not
`itertools.batched`, specifically so a batch comes back as a mutable
`list` rather than an immutable `tuple` — relevant the moment a future
lesson wants to modify a batch's contents in place before using it.

### Commands needed

None new.

### Run it

Real output, from an actual run chaining every unit in this lesson
together — `iter_all_contacts` (previous unit) merging
`recordkeeper`'s three real contact sources, `chunked` (this unit)
grouping that merged stream two at a time:

```python
from recordkeeper.ingest.merge import iter_all_contacts
from recordkeeper.ingest.util import chunked

merged = iter_all_contacts("data/contacts.csv", "data/contacts.json", "data/contacts.xml")
for batch in chunked(merged, 2):
    print("batch:", batch)
```

```
batch: [Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls'), Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')]
batch: [Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls'), Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')]
batch: [Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls'), Contact(id='2', name='Bob Lee', email='bob@example.com', notes='Referred by Alice\nFollow up in June')]
```

Three batches of two — CSV's pair, XML's pair, JSON's pair — exactly
matching `chunked`'s own isolated lab behavior against a real,
`itertools.chain`-merged stream instead of a plain list.

### Connect

The previous unit merged three separate contact sources into one
stream without copying any of them; this unit adds the ability to walk
that merged stream in fixed-size groups, built from nothing but
`iter()` and the same `itertools.islice` already proven earlier in
this lesson — ready, in a later lesson, to become the shape a real
batch database insert or batch API call is handed.

---

## Connect the pieces

Every tool this lesson built shares one real, measured foundation: this
lesson's first unit proved, in actual megabytes (26.50 MB vs. 0.02 MB
on a real 300,000-line file), that never materializing more data than
necessary at any one instant is a real, large saving, not a
theoretical one — and `count_event`, added to `raw_log.py`, carries
that exact discipline into the project. `iter_all_contacts` applies the
same discipline to *combining* sources: `itertools.chain`, proven in
this lesson's second unit to merge without copying, lets
`recordkeeper`'s CSV, XML, and JSON contacts — the same data this
curriculum has round-tripped, unchanged, since Lesson 3 — be walked as
one logical sequence. `chunked`, built from `iter()` and the same
`itertools.islice` proven earlier in that same unit to stop pulling the
instant its limit is reached, groups that merged sequence into batches
without ever holding more than one batch in memory — verified, in this
lesson's last unit, against the merged stream directly: three real
batches of two, Alice and Bob, from each of the three sources this
curriculum has built, in order, all real, all measured, none of it
guessed.
