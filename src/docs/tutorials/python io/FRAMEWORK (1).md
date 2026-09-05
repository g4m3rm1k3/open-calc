# Working With Data: The Actual Abstractions

The 13 lessons in this curriculum are organized by *technology* — here's
CSV, here's JSON, here's SQL. That organization is useful as reference,
but it's not the thing that transfers to a data source none of those
lessons covered. This document is the thing that transfers. Read this
first; use the lessons as worked examples of the ideas below, not as
the ideas themselves.

The claim: almost every "how do I work with this data" decision you'll
ever make is an instance of one of six axes, approached with one
recipe, and running into one of a handful of recurring tradeoffs. Once
you can name these, a data source you've never seen stops being
"which lesson covers this" and becomes "where does this sit on the six
axes, then what does the recipe say to do."

---

## Part 1 — Six axes: classify before you pick a tool

Before touching a library, answer these about the data in front of
you. The answers, not the format's name, determine what you actually
need.

### 1. Shape: fixed, self-describing, or none?

- **Fixed** — every record has the same fields, decided in advance,
  independent of any single record's own content. A relational table
  is the purest form: the schema exists *outside* any row, in the
  `CREATE TABLE` statement.
- **Self-describing (schema-on-read)** — each record carries its own
  structure with it; two records can legitimately differ. A JSON
  document store is the purest form: nothing outside the document
  itself says what fields it has.
- **None (unstructured)** — free text, an image, audio. There's no
  record boundary at all until you impose one with a model built for
  that content specifically (an NLP pipeline, an image classifier).

*Why it matters:* fixed shape lets you validate at the boundary once
and trust it everywhere after (Lesson 4's whole argument for
`@dataclass` over a dict). Self-describing shape means every reader
has to defensively check for a field's presence, forever (Lesson 10's
`json_extract` returning `None` for a field that just isn't there —
not an error, a fact of life). Unstructured means you're not "parsing,"
you're modeling, and no generic tool does that step for you.

### 2. Volume relative to memory

Does the *complete* dataset comfortably fit in memory, right now, on
the machine that will actually run this — not the sample you're
testing with?

- **Fits** — load it all, use whatever's most convenient. Don't
  engineer for a scale you don't have.
- **Doesn't fit, or might not, or will grow** — you must process it as
  a stream: bounded memory regardless of input size. This isn't
  optimization, it's the difference between working and getting
  killed by the OS (Lesson 7's actual measured 26.50 MB vs. 0.02 MB is
  the concrete version of this axis).

The trap: testing against a small sample and concluding "loading it all
is fine" when the real input is two orders of magnitude larger. Ask
what the real maximum size is, not what today's sample happens to be.

### 3. Access pattern

How will you actually get data back out, later?

- **Sequential, once, front to back** — an iterator/stream is not just
  sufficient, it's the *right* tool; anything more is wasted structure.
- **Random access by a key you already know** — you need an index: a
  `dict`/hash for in-memory, a primary-key index for a database. A
  linear scan to find "the record with id=4212" is a choice you're
  making, whether or not you notice you're making it.
- **Filter/range queries on fields you don't know in advance** — you
  need a real query engine (SQL, or a document store's query
  language), because hand-building an index for every field someone
  might eventually filter on *is* what a database already does for
  you.

The mistake this axis catches: reaching for a plain file or a
key-value store for data that's actually going to be queried by
several different, unpredictable fields later. That's the "you'll be
rebuilding `store.py` as a database eventually, might as well now"
signal.

### 4. Mutability and lifecycle

- **Append-only / write-once** — a log, an export, an API response
  already received. Files, immutable records, and simple concatenation
  are fine; there's no "two writers stepped on each other" problem
  because nothing is ever overwritten.
- **Updated in place, possibly by more than one writer** — you need
  real concurrency control: transactions (Lesson 8), or optimistic
  locking, or a design that makes concurrent writers safe by
  construction. Skipping this doesn't mean you avoided the problem, it
  means you'll hit it under load instead of in a code review.

### 5. Trust boundary

Did this data originate *inside* a system you already control (your
own export, your own database), or did it cross a boundary — the
network, another team, a user, the public internet?

- **Same trust zone** — you can mostly assume well-formedness; focus
  effort on correctness and efficiency, not defense.
- **Crosses a boundary** — assume it can be malformed, incomplete, or
  actively adversarial. This is the axis behind Lesson 8's SQL
  injection and Lesson 12's fragile scraping alike: **never build a
  command, query, or path by string-gluing untrusted content into it.**
  This is bigger than "SQL injection" — the identical failure shows up
  as shell-command injection, template injection, path traversal, and
  NoSQL query injection. One rule, one name for the whole family:
  keep untrusted data structurally separate from syntax, always,
  regardless of which syntax it is.

### 6. Consistency requirement

If an operation on this data fails **halfway through**, does that leave
something actually broken?

- **No real consequence** — best-effort, log-and-move-on is fine.
- **Yes** — you need atomicity: a transaction (Lesson 8's real,
  measured rollback), or a design where partial failure is structurally
  impossible (append-only logs can't be "half written" in a way that
  corrupts earlier entries), or **idempotency** — designing a write so
  that doing it twice by accident (a retry after a failure you're not
  sure landed) produces the same result as doing it once. This last one
  didn't get its own lesson but it's implied everywhere Lesson 11's
  retries meet Lesson 8's transactions: a retried request needs to be
  safe to repeat, which usually means giving the operation a stable key
  ("insert this record with id=X" rather than "insert a new record")
  so a duplicate attempt is a no-op, not a duplicate.

---

## Part 2 — The recipe for a source you've never seen

When you hit something genuinely new — a binary protocol, a message
queue, a proprietary export, a vendor's fixed-width file — this is the
actual procedure, independent of what the format is called.

1. **Get a real, small sample and look at it raw.** Bytes if binary,
   text if text. Don't trust documentation, a schema doc, or an API
   spec until you've looked at real data once — Lesson 12's whole
   second unit exists because a real page's markup didn't match what a
   reasonable person would assume from reading it.
2. **Find the record boundary.** What separates one unit of data from
   the next — a byte value, a newline, a length prefix, a bracket
   count, a fixed number of bytes?
3. **Find the token boundaries within a record, and how a token's own
   content is kept from being confused with the boundary itself** —
   this is escaping/quoting, the general form of "a comma inside a CSV
   field" (Lesson 3) or "a quote inside a JSON string" (Lesson 5).
   Every format that has structural characters needs an answer to this
   question; if you can't find the answer, that's a sign the format is
   ambiguous or you're missing a rule.
4. **Classify shape (axis 1).** One fixed record shape, or does shape
   vary per record?
5. **Classify volume (axis 2)** against the *real* maximum size, and
   pick load-it-all vs. stream accordingly.
6. **Tokenize, then interpret — as two separate passes, even if
   trivial.** Split the raw input into meaningful pieces first; only
   then decide what those pieces *mean*. Keeping these separate is what
   let Lesson 5's hand-built JSON parser be debugged as "did I split
   this wrong" independently from "did I misread what this token
   represents." Collapsing both into one pass is the single most common
   way a from-scratch parser gets confusing to fix.
7. **Convert into your own internal model at exactly one seam, as soon
   as possible.** Don't let the source's own shape leak through the
   rest of your code — this is `contact_from_row`/`contact_from_element`
   /`Contact(**row)`, the same pattern at every single boundary since
   Lesson 4, on purpose. One function per source does the translation;
   everything downstream only ever sees your own model.
8. **Apply the trust check (axis 5)** at that same seam: if this data
   crossed a boundary, validate it there, and never let a raw value
   from it become part of a command/query's own syntax.
9. **Apply the consistency check (axis 6)** at the point you write
   this data somewhere that matters: wrap related writes in a
   transaction, or make each write idempotent, or both.
10. **Decide fail-fast vs. isolate-and-continue** for anything
    processing more than a handful of records from an external source.
    Almost always: isolate, collect failures as data, keep going
    (Lesson 13) — a pipeline that dies on the first bad record out of
    ten thousand is rarely what you actually want.

---

## Part 3 — The recurring tradeoffs, named once

These show up, by different names, in nearly every lesson. Naming them
once means you recognize the *n*th appearance instantly instead of
re-deriving it.

- **Schema-on-write vs. schema-on-read** — fix the shape before data
  arrives (checked at write time, rigid) vs. let shape live in the data
  itself (flexible, checked only when a field is actually read).
- **Eager vs. lazy** — materialize the full result now vs. produce
  values on demand as they're consumed. Almost always: lazy, unless you
  have a specific reason to need everything at once (you need the
  total count, you need random access, the whole thing is small).
- **Push vs. pull / backpressure** — does the producer run at its own
  pace regardless of the consumer (push — risks an unbounded backlog),
  or does the consumer's own pace limit how far ahead the producer gets
  (pull — Lesson 13's whole first unit). Prefer pull unless you have a
  specific reason (the producer is a hardware event you can't ask to
  wait).
- **Normalize vs. denormalize** — store a fact once and reference it
  (no duplication, but a read needs to join/follow the reference) vs.
  store it redundantly everywhere it's needed (fast, isolated reads,
  but now every copy has to be kept in sync on write).
- **Exact match vs. semantic match** — comparing raw representations
  character-for-character vs. comparing what they actually mean.
  Lesson 12's real `class="site-header "` (trailing space) breaking a
  literal-string regex while `BeautifulSoup`'s membership check didn't
  care is this exact tradeoff, concretely.
- **Fail-fast vs. isolate-and-continue** — stop everything the instant
  one thing is wrong (correct default for a programming bug you want
  to surface immediately) vs. capture the failure and keep processing
  everything else (correct default for real, external, imperfect data
  at any real volume).
- **Batching** — pay a fixed per-operation cost once per group instead
  of once per item, whenever that fixed cost is real (a network round
  trip, a database round trip, a buffered write). The size of the
  batch is itself a tradeoff: bigger batches amortize the fixed cost
  further but make a single failure more expensive to retry.
- **Idempotency** — design so repeating an operation is safe, whenever
  retries are possible (which is: whenever a network or another
  process is involved at all).

---

## Part 4 — Proving it transfers: something none of the 13 lessons cover

A vendor emails you a nightly **fixed-width text file** — no
delimiters at all, just fields at fixed column positions, like:

```
ALICE SMITH         2024-01-15  ACTIVE  001042
BOB LEE             2023-11-02  ACTIVE  001043
```

Nothing here has a name like "fixed-width parsing lesson" to look up.
Walk the axes and the recipe instead:

- **Shape (axis 1):** fixed — every line has the same fields at the
  same column offsets. That's actually the *easiest* case: no escaping
  question even arises, because there's no delimiter to collide with
  content at all — the boundary is a column number, not a character.
- **Volume (axis 2):** "nightly file" suggests it could be large;
  stream it line by line rather than assuming it's small, the same
  default this curriculum used from Lesson 1 onward.
- **Access pattern (axis 3):** if this only ever gets read start to
  finish and loaded somewhere else, a stream is enough; if you'll need
  to look up "the record for customer 001042" repeatedly afterward, it
  belongs in something with an index once ingested — a dict keyed by
  that ID, or a database table, per axis 3's own guidance.
- **Trust (axis 5):** it crossed a boundary (came from outside your
  system) — validate each field's shape (is the date field actually a
  parseable date, is the status one of the values you expect) before
  it touches anything else.
- **Consistency (axis 6):** if these records get inserted into a
  database, batch them and wrap each batch in a transaction — Lesson
  8's pattern, unchanged, regardless of the fact the source format is
  new.
- **The recipe's tokenizing step** becomes: slice each line by fixed
  column positions (`line[0:20]`, `line[20:30]`, ...) instead of
  splitting on a delimiter — mechanically different from `csv.reader`,
  conceptually the identical "find the boundaries, then read what's
  between them" step.
- **Convert at one seam:** write one `record_from_line(line) ->
  Contact`-shaped function, exactly like every `_from_row`/`_from_element`
  function already built, so nothing downstream needs to know the
  source was fixed-width at all.
- **Fail-fast vs. isolate:** wrap the per-line conversion the same way
  `safe_stream` did in Lesson 13 — one malformed line (a date that
  doesn't parse) becomes a captured error, not a crashed nightly job.

No new library, no new lesson, and a real, concrete plan — because the
plan was never really about fixed-width files. It was always about the
six axes and the ten-step recipe; fixed-width just answers each
question slightly differently than CSV did.

---

## Part 5 — Parsing something you've genuinely never seen, with no spec

Everything above assumes you can name the format. Sometimes you can't
— a vendor's undocumented export, a legacy system's log format nobody
wrote down, a config file some tool invented for itself. The
methodology here is different from "pick the right library"; it's
closer to reverse-engineering.

1. **Get several real samples, not one.** A single sample can't tell
   you what's fixed and what varies. Diff two or three real examples
   line by line — whatever's identical across all of them is probably
   structural (a delimiter, a fixed header); whatever differs is
   probably data.
2. **Look for repeating structural characters empirically.** Count
   character frequency per line, or look for a character that appears
   exactly N-1 times on every line where N is the number of fields you
   can visually count — that's very likely your delimiter, before you
   ever find documentation confirming it.
3. **Build incrementally, against the simplest real line first, then
   feed it edge cases one at a time.** Don't try to handle every case
   you imagine up front — parse line 1 correctly, then find a line that
   breaks your parser, fix exactly that, repeat. This is the same
   Concept-Isolation instinct as building a throwaway lab before real
   code: isolate one new wrinkle at a time instead of guessing at all
   of them in advance.
4. **Know when to stop looking for a deterministic grammar.** Some real
   text (free-form notes, inconsistent legacy exports) genuinely has no
   reliable structure to parse — that's the signal to switch from
   "write a parser" to "write a heuristic extractor" (regex-based
   best-effort matching, or a small classifier), and to treat its
   output as *probably* right rather than guaranteed right, with
   confidence you build error tolerance around, not a parser you keep
   trying to make "finally correct."
5. **Once you understand it, write down the grammar you inferred as a
   comment or a small doc, even though nobody handed you one.** The
   next person (including future you) needs the spec that never
   existed; you just became the one source of truth for it.

---

## Part 6 — Transforming between shapes

### Flattening nested data

Deeply nested data (JSON, XML) sometimes needs to become flat rows —
for a spreadsheet export, a relational table, a CSV. The general
technique is a recursive walk that turns every leaf value into a
`(path, value)` pair, where `path` records how you got there:

```python
def flatten(obj, prefix=""):
    items = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            items.update(flatten(v, f"{prefix}.{k}" if prefix else str(k)))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            items.update(flatten(v, f"{prefix}[{i}]"))
    else:
        items[prefix] = obj
    return items
```

Real output, against genuinely nested input:

```python
>>> flatten({"customer": {"name": "Alice", "orders": [{"id": 1, "total": 20.5}, {"id": 2, "total": 5.0}]}, "active": True})
{
  "customer.name": "Alice",
  "customer.orders[0].id": 1,
  "customer.orders[0].total": 20.5,
  "customer.orders[1].id": 2,
  "customer.orders[1].total": 5.0,
  "active": True
}
```

This is the same recursion that underlies both "flatten one document
into spreadsheet columns" and "decide whether this belongs in one
table or several." Which leads to the actual storage decision:

### Where should deeply nested data actually live?

- **Nesting is shallow and fixed** (you always know the depth and the
  fields at each level in advance) — this can always become a fixed
  set of relational tables: one table per repeating group, connected
  by foreign keys (an `orders` table, an `order_items` table
  referencing `order_id`). This is exactly what "normalizing" a nested
  document means, and it's what an ORM's relationship mapping is
  automating for you.
- **Nesting is deep, and shape varies per record** (some documents have
  a field others don't, arrays of arbitrary length, optional nested
  blocks) — this is the real, structural argument for a document store
  (Lesson 10's `json_extract` approach): forcing variable-shape nested
  data into a fixed number of relational tables means either a lot of
  nullable columns or a schema migration every time a new shape shows
  up.
- **You need to query across the nested parts** (find every order,
  across every customer, above a certain total) regardless of how deep
  they're nested — flatten into relational tables even if the source
  is a document store, because that's a query pattern only a real
  query engine handles well (axis 3 from Part 1).
- **The nesting is a genuine tree of unknown depth** (a folder
  structure, an org chart, a category hierarchy) — two classic,
  different storage patterns exist, and picking between them is a real
  design decision: an **adjacency list** (each row stores its own
  `parent_id`) is simple to write to but requires a recursive query (or
  several round trips) to fetch a whole subtree; a **materialized
  path** or **nested set** stores enough extra information (a path
  string, or left/right bounds) to fetch an entire subtree in one
  query, at the cost of more complex writes when the tree changes
  shape.

### Converting XML to JSON: there is no single correct mapping

This is worth stating directly because it trips people up: **XML to
JSON is not one canonical operation.** XML has real features JSON has
no native equivalent for — attributes vs. child elements vs. text
content, and *mixed content* (text and elements interleaved inside the
same parent) — so any XML-to-JSON converter is making real, debatable
choices, not just "translating."

Two real, named conventions, run against the identical input
(`<contact id="1"><name>Alice</name><phones><phone>555-1</phone><phone>555-2</phone></phones></contact>`),
to make the difference concrete:

**Parker convention** (simple, lossy — drops attributes entirely):

```json
{
  "name": "Alice",
  "phones": {
    "phone": ["555-1", "555-2"]
  }
}
```

**BadgerFish convention** (preserves attributes with `@`, text content
with `$`):

```json
{
  "@id": "1",
  "name": {"$": "Alice"},
  "phones": {
    "phone": [{"$": "555-1"}, {"$": "555-2"}]
  }
}
```

Neither is "the" right answer — Parker is easier to consume but the
`id` attribute is simply gone; BadgerFish is lossless but every leaf
value is now wrapped in an object instead of being a plain string.
**Pick deliberately, based on whether the attributes matter to whoever
consumes the JSON**, and write down which convention you picked.

**A real, easy-to-miss bug in both:** a repeated tag becomes a JSON
array — *but only if it's actually repeated in this particular
document.* Feed the same converter a contact with only one `<phone>`
instead of two, and `"phone"` silently becomes a bare string instead of
a one-element list:

```json
{"name": "Alice", "phones": {"phone": "555-1"}}
```

Any downstream code written assuming `data["phones"]["phone"]` is
always a list will work on every test document that happens to have
multiple phones and break the first time a real record has exactly
one. The fix is to force array semantics for every field that's
*allowed* to repeat, based on the schema, not based on what happened to
show up in your sample — the same "don't let today's sample define
tomorrow's assumption" trap as axis 2's volume question.

### Modifying tags/structure in an already-parsed tree

Once parsed into `ElementTree`, a tag is just a string attribute — you
can rename, insert, remove, or reorder without re-parsing:

```python
for name_el in root.findall("name"):
    name_el.tag = "full_name"
```

For a whole-document, declarative transformation (rename this tag
everywhere, restructure this pattern into that one, across an entire
document), XML has its own dedicated transformation language — XSLT —
built exactly for "describe the output shape as a template, let the
processor walk the source tree." Worth knowing it exists if you're
doing heavy XML-to-XML restructuring regularly; for a one-off or
Python-side transform, a manual recursive walk (as above) is usually
simpler to reason about and debug than bringing in a second language.

---

## Part 7 — Validation, error collection, and reporting that's actually useful

### Accumulate, don't short-circuit

A `try`/`except` around a whole record answers "did this record fail,"
but a *validator* whose job is reporting needs to answer "every way
this record failed," and to keep validating every *other* record too.
That means a validator shouldn't raise on the first problem it finds —
it should collect and keep going, the same way a compiler reports
every syntax error it can find in one pass rather than stopping at the
first.

### Track the path as you recurse

The single most useful thing a validation error can carry is *exactly
where* the bad value lives, especially in nested data — not "a value
was negative" but "`customers[1].balance` was negative." This is the
identical recursive-walk shape as `flatten`, just producing errors
instead of `(path, value)` pairs for every value:

```python
def validate(obj, path=""):
    errors = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            errors.extend(validate(v, f"{path}.{k}" if path else str(k)))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            errors.extend(validate(v, f"{path}[{i}]"))
    else:
        if obj is None:
            errors.append((path, "value is missing"))
        elif isinstance(obj, (int, float)) and obj < 0:
            errors.append((path, f"negative value: {obj}"))
    return errors
```

Real output, against real nested data with two different real problems
in two different records:

```python
>>> validate({"customers": [
...     {"name": "Alice", "balance": 10},
...     {"name": None, "balance": -5},
...     {"name": "Cara", "balance": 3},
... ]})
customers[1].name: value is missing
customers[1].balance: negative value: -5
```

Both real problems, in the same record, both reported — nothing about
finding the missing name stopped it from also finding the negative
balance right next to it.

### Structuring the report itself

Once you have a full list of `(path, message)` pairs (or, for a
record-oriented batch, `(record, exception)` pairs as in Lesson 13's
`safe_stream`), the report a person actually wants isn't the raw list —
it's usually:

- **A summary first** — "812 of 900 records succeeded; 88 failed"
  before any detail, so the reader knows the scale of the problem
  immediately.
- **Grouped by error type**, not in original order — "42 failed on
  missing email, 46 failed on invalid date" is far more actionable than
  88 lines in file order, because it tells the reader whether this is
  one systemic problem or many unrelated ones.
- **A few concrete examples per group**, not all 46 — enough to
  recognize the pattern, not so much the report itself becomes another
  wall of text to scroll past.
- **The path/location preserved per example**, so acting on any single
  one is a lookup, not a re-scan of the original data.

This is a report-*shape* decision independent of the data format
underneath it — the same shape applies whether the underlying failures
came from validating JSON, parsing a fixed-width file, or a batch
insert's constraint violations.

---

## Part 8 — Regex: what it actually can't do, and the lookahead question

### Where regex fundamentally does not work

A regular expression matches a **regular language** — a category with a
real, provable limit: it has no way to count or remember unbounded
nesting depth. Matching balanced parentheses, correctly finding where
a tag closes when tags can nest inside themselves to arbitrary depth,
or anything requiring "remember how many opens I've seen so far, with
no upper bound" is outside what a regex engine can correctly do *in
general* — not "hard," but provably impossible for arbitrary depth,
which is the real reason behind "you cannot parse HTML/XML with regex"
being more than a meme. A regex can look like it works on your test
samples and then silently produce wrong matches the first time nesting
goes one level deeper than what you tested — this is the same class of
mistake as Lesson 12's naive-regex-vs-`BeautifulSoup` unit, generalized
from "a class attribute happened to have a trailing space" to "this
data structure can nest, and regex cannot track that."

**Where regex is exactly the right tool:** a single line, a fixed local
pattern, no nesting — extracting a substring, validating a shape (an
email-looking string, a phone number), splitting on a known delimiter
that can't appear inside the data itself. The moment the data can
contain the thing you're matching *nested inside itself*, stop reaching
for regex and reach for a real parser (recursive descent, or a library
that already is one, like `ElementTree` or `json`).

### Lookahead: real, but bounded

Regex lookahead/lookbehind (`(?=...)`, `(?!...)`, `(?<=...)`, `(?<!...)`)
are **zero-width assertions** — they check that something is (or isn't)
present without consuming it as part of the match:

```python
>>> re.findall(r"apple(?= pie)", "apple pie, apple sauce, apple juice")
['apple']
>>> re.findall(r"apple(?! pie)", "apple pie, apple sauce, apple juice")
['apple', 'apple']
```

This genuinely avoids a second pass *for matching a fixed, local
pattern based on what's immediately next to it*. It does **not** solve
"I need to know something about item 10,000 while deciding what to do
with item 1" — that's a different problem, at the stream level, not
the single-match level, and it has three real, different solutions
depending on cost:

1. **Bounded lookahead buffer** — hold the next *N* items in a small
   buffer (a `collections.deque`) so you can peek without consuming,
   still bounded memory regardless of total stream size:

   ```python
   from collections import deque

   def with_lookahead(iterable, n=1):
       it = iter(iterable)
       buf = deque()
       for _ in range(n):
           try:
               buf.append(next(it))
           except StopIteration:
               break
       while buf:
           current = buf.popleft()
           try:
               buf.append(next(it))
           except StopIteration:
               pass
           yield current, list(buf)
   ```

   Real output:

   ```python
   >>> list(with_lookahead([10, 20, 30, 40], n=1))
   [(10, [20]), (20, [30]), (30, [40]), (40, [])]
   ```

   Use this when you need to know "what's the next item" (or next few)
   to decide what to do with the current one — a streaming parser
   needing to know whether the *next* line is a continuation of this
   one, say — and re-reading the source is expensive or impossible (a
   live network stream, a paginated API).

2. **Two real passes** — read once to compute whatever global fact you
   need (a total count, which keys appear anywhere in the file), then
   read again with that fact already in hand. Costs the source twice,
   but constant *extra* memory. Fine when the source is cheap to
   re-read (a local file); a bad choice when it's expensive (re-fetching
   a rate-limited API, per Lesson 11 — you'd pay the rate limit twice).

3. **Transform once into a cheaper intermediate form, then pass over
   *that* as many times as you want** — parse the expensive source
   exactly once into something trivial to re-scan (a list already in
   memory, a temporary SQLite table), then run every subsequent pass
   against that intermediate form instead of the original. This is
   often the actual best answer when the original format is expensive
   to re-parse (real XML/HTML parsing, a network source) but the
   *data* itself is small enough to hold once it's already structured —
   pay the real parsing cost once, then treat the parsed result as free
   to reprocess.

Choosing among these three is the actual skill "do I transform the data
after" is asking about — and the answer depends entirely on which
resource is scarce: is it the *source* that's expensive to revisit
(favor option 3, or bounded lookahead), or is extra *memory* the thing
you don't have (favor option 2)?

### Positional access brittleness — "what if it's a different position"

Reaching for `fields[-1]` or `fields[3]` deep inside a function is a
real, common source of exactly this kind of breakage: it works until
the source adds a column, removes one, or reorders them, and nothing
about the code flags that the assumption changed. The fix is the same
"convert at one seam" principle from Part 1's recipe, made explicit for
positional data specifically:

- **Unpack into named variables (or a dataclass) immediately at the
  point you read the position**, not deep inside whatever function
  eventually uses the value — `name, email = fields[0], fields[1]`
  right where `fields` is first produced, so a schema change is a
  one-line fix at one location, not a hunt through every place `-1` or
  `3` was used as a magic number.
- **If position genuinely can't be avoided** (a fixed-width or
  positional format with no header at all), name the positions as
  constants once — `NAME_COL = 0`, `EMAIL_COL = 1` — so the *meaning*
  of a position is stated once, in one place, and every use reads as
  "the email column" rather than a bare number whose meaning has to be
  remembered or re-derived.
- **Prefer explicit failure over silent misalignment**: if you know how
  many fields a row *should* have, check `len(fields) == expected`
  before indexing into it at all, so a shifted format fails loudly, at
  the point of reading, instead of quietly reading the wrong column
  three functions later.

---

## How to use this against the 13 lessons

Each lesson is one or more points in the six-axis space, worked out in
full, real, verified detail. When you're deciding how to approach
something new:

1. Answer the six axes for the actual situation in front of you.
2. Find the lesson whose axes answers are closest — that lesson's
   *code* probably won't apply directly, but its reasoning about that
   same tradeoff will.
3. Run the ten-step recipe, borrowing the specific technique from
   whichever lesson matches each step (Lesson 3's escaping question,
   Lesson 4's one-seam conversion, Lesson 7's stream-vs-load,
   Lesson 8's transaction, Lesson 13's error isolation) — even when the
   format itself is one this curriculum never named.
