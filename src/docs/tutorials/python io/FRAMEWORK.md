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
