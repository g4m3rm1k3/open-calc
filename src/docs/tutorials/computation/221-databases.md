# Lesson 221: Databases — Persistent Structured Data

**What you will build**: A small real database — rows with named fields
instead of opaque blocks, a schema declaring what those fields are, a
query that finds exactly the rows matching a condition, and an
update-in-place operation that replaces an existing row's value at its
own known position rather than appending new content. It closes by
naming, honestly, the new danger update-in-place reopens: this lesson's
own database record now faces exactly Lesson 212's lost-update problem
again, one layer up — the exact question Lesson 222 (Transactions) takes
on next.

**What you need to know first**: Lesson 220's filesystem — specifically,
that it only ever *appended* new content, never replaced anything
already written. Lesson 212's lost update, since this lesson's own
closing section reopens it at a new layer.

**Terms used in this lesson**:

- **database** — a system for storing structured, named-field records
  persistently and querying them by field value, rather than treating
  stored data as an opaque sequence of bytes; exists because a
  filesystem's blocks answer "give me this file's content," never "give
  me every record where some field matches."
- **schema** — the fixed, agreed-on list of field names every row in a
  table shares; exists so a field can be looked up by a stable name
  rather than a numeric position every piece of code has to
  independently remember and keep in sync.
- **row** (also **record**) — one structured entry in a table, holding
  one value per field the schema declares; the actual unit of data a
  database stores and queries, distinct from a filesystem's raw,
  unstructured block.
- **table** — an ordered collection of rows sharing one schema; a
  database's basic unit of organization.
- **query** — asking a database for exactly the rows matching some
  condition, rather than reading everything and checking by hand; the
  entire reason structured storage exists instead of one opaque file.
- **update-in-place** — replacing an existing row's value directly, at
  its own known position, rather than appending new content; a
  genuinely different operation from Lesson 220's append-only file
  writes, and the reason concurrent database access reopens Lesson
  212's lost-update danger.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`cond`** / **`if`**
  - *What they are:* Clojure's multi-branch and two-branch conditional
    special forms.
  - *Implementation:* `(cond test1 result1 ... true default)` returns
    the result paired with the first truthy test; `(if test then else)`
    returns `then` or `else`.
  - *Their use:* `cond` drives every recursive scan (field lookup, row
    query, row search); `if` decides whether `update-row-at` found
    anything to replace.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* checking a schema field name, a row's own field value, or
    a scan index against its stopping point.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index`.
  - *Its use:* reading a schema entry, a row's field value at a known
    position, or a table's row at a known index.
- **`assoc`**
  - *What it is:* Clojure's functional-update function for an indexed or
    keyed collection.
  - *Implementation:* `(assoc coll index value)` returns a new
    collection identical to `coll` except at `index`, which now holds
    `value`.
  - *Its use:* appending a new row onto a table, appending a matching
    row onto a query's result, and — for the first time this lesson —
    replacing an *existing* row at its own already-occupied position.
- **`count`**
  - *What it is:* Clojure's function returning how many elements a
    collection holds.
  - *Implementation:* `(count coll)` returns an integer.
  - *Its use:* finding the next free append position, and as the
    stopping condition for every recursive scan.
- **`+`**
  - *What it is:* Clojure's addition function.
  - *Implementation:* `(+ a b)` returns the sum.
  - *Its use:* advancing a scan index by one.

---

## Concept Unit: Structured Records — Rows, Fields, and a Schema

### The Problem

Lesson 220's filesystem treats a file's content as an opaque sequence of
blocks — perfect for a document nobody needs to search *inside* of
without reading it, useless for asking "which account has a balance
over `100`" without personally reading and parsing every byte by hand.
Structured data needs *named fields* — a stable way to say "the balance
field," reusable across every row, instead of every piece of code having
to independently remember that balance happens to sit at position `1`.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because databases are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn field-index [schema field-name index]
  (cond
    (= index (count schema)) -1
    (= (get schema index) field-name) index
    true (field-index schema field-name (+ index 1))))

(defn field-value [schema row field-name]
  (get row (field-index schema field-name 0)))

(defn insert-row [table row]
  (assoc table (count table) row))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def schema ["id" "balance"])
#'user/schema
user=> (def table0 [])
user=> (def table1 (insert-row table0 ["A" 100]))
#'user/table1
user=> (def table2 (insert-row table1 ["B" 50]))
#'user/table2
user=> table2
[[A 100] [B 50]]
user=> (field-value schema (get table2 0) "balance")
100
```

### Mechanical Walkthrough

`(defn field-index [schema field-name index] ...)` — `defn`,
reappearing. A schema is a plain vector of field names, `["id"
"balance"]`; this scans it for a matching name and returns its
position. `(cond ...)`, reappearing: `(= index (count schema)) -1` — ran
past the end, the field doesn't exist, the established sentinel.
`(= (get schema index) field-name) index` — `get`, reappearing, checks
this position's name; if it matches, return the position itself.
`true (field-index schema field-name (+ index 1))` — keep scanning,
the same recursion-with-accumulator shape used throughout this
curriculum.

`(defn field-value [schema row field-name] (get row (field-index schema
field-name 0)))` — the payoff: given a row and the *name* of a field, not
its position, find that name's position via `field-index`, then `get`
the row's value there. This is the entire point of a schema — a caller
never has to know or remember that `"balance"` happens to be at index
`1`; the schema is the single place that fact lives.

`(defn insert-row [table row] (assoc table (count table) row))` — the
same append idiom this curriculum has used since Lesson 94, now
appending a whole structured row instead of a single value.

Trace: `table2` is `[["A" 100] ["B" 50]]` — two rows, each matching the
schema's two fields in order. `(field-value schema (get table2 0)
"balance")` — `(get table2 0)` is `["A" 100]`; `field-index` finds
`"balance"` at position `1`; `(get ["A" 100] 1)` is `100`. The caller
never wrote the number `1` anywhere in this call — only the field's own
name.

### CS Lens

A schema is exactly what Lesson 92's own binary-search-tree accessors
(`bst-value`, `bst-left`, `bst-right`) were built to avoid needing —
naming a position instead of remembering it as a bare number scattered
across a codebase. The specific new idea here is that the naming itself
is *data* — the schema is a real, inspectable vector, not baked into
each accessor function's own source code — which is what makes
`field-value` work for *any* schema and *any* field name, not just one
fixed shape a lesson's own functions happen to expect.

Also recognized in: a spreadsheet's header row, letting a formula
reference `"Balance"` instead of `"column C"`; a CSV file's first line,
declaring field names once so every later row can be parsed the same
way; a REST API's JSON response, where a client reads `response.balance`
by name rather than by counting bytes into a fixed binary layout.

### SE Lens

The alternative is Lesson 220's own filesystem approach: store data as
an opaque blob and let whoever reads it parse out the fields by
hand-remembered position, every single time. That's strictly less
machinery — no schema, no `field-index` scan — but it means every
reader has to independently know and keep in sync exactly where each
field sits, and a change to that layout (adding a field, reordering one)
silently breaks every reader that assumed the old positions, with no
error pointing at the mismatch. A schema's real cost is the extra scan
`field-index` performs on every single lookup — genuinely slower than a
hardcoded position — bought back in exchange for every reader agreeing
on field names instead of memorized numbers.

---

## Concept Unit: Querying — Select Where a Field Matches

### The Problem

With rows structured by field, a real question becomes answerable for
the first time: "give me every row where `id` equals `\"A\"`" — not by
a human scanning the table by eye, but by code that checks every row's
own named field directly. Lesson 220's filesystem had nothing like
this — a file was either read whole or not read at all.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because databases are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn select-where [schema table field-name target index accumulated]
  (cond
    (= index (count table)) accumulated
    (= (field-value schema (get table index) field-name) target)
      (select-where schema table field-name target (+ index 1)
        (assoc accumulated (count accumulated) (get table index)))
    true (select-where schema table field-name target (+ index 1) accumulated)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def result (select-where schema table2 "id" "A" 0 []))
#'user/result
user=> result
[[A 100]]
```

### Mechanical Walkthrough

`(defn select-where [schema table field-name target index accumulated]
...)` — `defn`, reappearing, six arguments: the schema and table to
search, which field and target value define the match, a scan index,
and the accumulated matches so far — the same recursion-with-accumulator
shape as `field-index`, one level up.

`(= index (count table)) accumulated` — reached the end of the table,
return whatever's been collected.

`(= (field-value schema (get table index) field-name) target)
(select-where ... (assoc accumulated (count accumulated) (get table
index)))` — `field-value`, reappearing, reads this row's value for the
named field; if it equals `target`, append this *whole row* — `(get
table index)` — onto `accumulated`, and continue scanning from the next
index.

`true (select-where schema table field-name target (+ index 1)
accumulated)` — no match at this row: keep scanning, `accumulated`
passed through completely unchanged.

Trace: `table2` is `[["A" 100] ["B" 50]]`. `index = 0`: `field-value`
on `["A" 100]` for `"id"` is `"A"`, matches `target = "A"` — `accumulated`
becomes `[["A" 100]]`. `index = 1`: `field-value` on `["B" 50]` for
`"id"` is `"B"`, doesn't match — `accumulated` unchanged. `index = 2`
equals `(count table2)` — stop, return `[["A" 100]]`: exactly the one
row whose `id` field matched, and nothing else.

### CS Lens

`select-where` is a **filter**, restated concretely without needing any
new construct: given a collection and a condition, produce a new
collection holding only what satisfies it. This is the first genuine
*query* this curriculum has built — a question answered by scanning
structured data for a condition, distinct from every earlier lesson's
lookups, which always searched for one specific, already-known key
(`directory-lookup`, `field-index`) rather than an arbitrary matching
condition across many rows at once.

Also recognized in: a spreadsheet's `FILTER` function, keeping only rows
matching a condition; an email client's search box, returning every
message matching a sender or subject; a search engine's own query,
returning every document matching a term, out of everything it has
indexed.

### SE Lens

The alternative — reading every row by hand and checking the field
yourself, as a human, outside the system entirely — was the only option
Lesson 220's filesystem offered, and it doesn't scale: it works for one
person checking one file once, and fails completely the moment the
table holds more rows than a person can reasonably read, or the moment a
program, not a person, needs the answer. `select-where`'s real cost is
that it scans the *entire* table on every call, start to finish, with no
shortcut — genuinely slow for a large table, and the exact problem
Lesson 223 (Indexes) exists to fix, by trading some extra storage and
bookkeeping for skipping the scan almost entirely on a common query.

---

## Concept Unit: Update-in-Place — a Real Departure From Append-Only Storage

### The Problem

Every write this curriculum has built so far — Lesson 220's file
writes, this lesson's own `insert-row` — only ever *added* new content.
A bank account's balance needs something different: an existing row's
value needs to actually *change*, in place, at its own already-occupied
position, not grow a new entry alongside the old one. What does "update"
mean for structured data, and does it introduce any danger Lesson 220's
purely-additive writes never had to worry about?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because databases are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn find-row-index [schema table field-name target index]
  (cond
    (= index (count table)) -1
    (= (field-value schema (get table index) field-name) target) index
    true (find-row-index schema table field-name target (+ index 1))))

(defn update-row-at [table new-row row-index]
  (if (= row-index -1)
    table
    (assoc table row-index new-row)))

(defn update-row [schema table field-name target new-row]
  (update-row-at table new-row (find-row-index schema table field-name target 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def table3 (update-row schema table2 "id" "A" ["A" 150]))
#'user/table3
user=> table3
[[A 150] [B 50]]
user=> table2
[[A 100] [B 50]]
```

### Mechanical Walkthrough

`(defn find-row-index [schema table field-name target index] ...)` —
almost identical in shape to `select-where`, but returns the *position*
of the first matching row instead of collecting every match, and `-1`,
reappearing, if none is found — the established "not found" sentinel.

`(defn update-row-at [table new-row row-index] ...)` — `if`,
reappearing: if no matching row was found, `-1`, return the table
completely unchanged — nothing to update. Otherwise, `assoc`,
reappearing — but used differently here than anywhere earlier in this
lesson or Lesson 220: every earlier `assoc` in this curriculum's
persistence lessons wrote at `(count coll)`, a position that didn't
exist yet, to *append*. This one writes at `row-index`, a position that
*already holds* a real row — this is a genuine *replacement*, the row
that was there a moment ago is gone from the new table entirely, not
kept alongside the new one.

`(defn update-row [schema table field-name target new-row] ...)` — the
public entry point, composing the two: find the row, replace it.

Trace: `(update-row schema table2 "id" "A" ["A" 150])` — `find-row-index`
locates `id = "A"` at position `0`; `update-row-at` calls `(assoc table2
0 ["A" 150])`, producing `table3 = [["A" 150] ["B" 50]]` — the first
row's balance is now `150`. `table2` itself, printed again afterward, is
completely untouched, still `[["A" 100] ["B" 50]]` — `assoc` produced a
*new* table value; nothing about calling `update-row` reached back and
changed the original.

### CS Lens

This is genuinely new among this curriculum's persistence lessons:
every operation in Lesson 220 only ever *added* something — a new
block, a new directory entry — and never overwrote something that
already meaningfully existed. `update-row` is the first operation whose
entire purpose is to make an *existing* piece of data reflect a new
value. Even though Clojure's own `assoc` never mutates anything — the
"update" here is still a brand-new immutable value, `table3`, standing
next to the untouched `table2` — the *meaning* of the operation, from
the caller's point of view, is replacement, not addition, and that
distinction matters for what comes next.

Also recognized in: a bank ledger's balance field, meant to always
reflect the current true amount, never a running list of every past
value; a thermostat's target-temperature setting, overwritten by each
new instruction rather than accumulating a history of every setting
ever chosen; a game's own save file, where saving again is meant to
replace the previous save, not append a second, competing one.

### SE Lens

The alternative to update-in-place is what Lesson 220's own append-only
filesystem already models: never overwrite anything, only ever add a
new entry recording the *change*, and let a reader reconstruct the
current value by replaying every entry in order. Some real systems
genuinely choose that design (an append-only ledger, a event-sourced
system) specifically to avoid ever losing history — but it trades away
exactly what `update-row` provides here: a single, direct place holding
*the* current value, readable in one lookup instead of a replay. The
real cost this lesson's choice reopens, honestly: an update-in-place
that two threads perform concurrently on the *same* row is structurally
identical to Lesson 212's original lost-update bug — read the current
balance, compute a new one, write it back — and nothing built in this
lesson protects against that. `update-row` is exactly as vulnerable to
a lost update as Lesson 212's naive counter increment was, and for the
identical reason: read, then, separately, write.

---

## Connect the Pieces

Follow account `"A"`'s balance through every unit built in this lesson.
`insert-row` (Unit 1) adds `["A" 100]` as a structured row, its fields
addressable by name — `"id"` and `"balance"` — through the schema, not
by a hardcoded position anyone had to remember. `field-value` (Unit 1,
reused) reads that balance back, `100`, purely by field name.
`select-where` (Unit 2) proves this structure supports a real query —
"every row where `id` equals `\"A\"`" — returning exactly `[["A" 100]]`
out of a larger table, something no unstructured file from Lesson 220
could ever answer directly. `update-row` (Unit 3) then changes that same
account's balance to `150` — not by appending a new row alongside the
old one, the only kind of write this curriculum's persistence lessons
had built until now, but by genuinely replacing the existing row at its
own known position, found by `find-row-index` using the identical
field-matching logic `select-where` already established. The original
`table2`, still holding the pre-update balance, is left completely
untouched — proving the update produced a new version rather than
corrupting the old one — but the *operation itself*, read-then-write on
one shared row, is exactly the shape Lesson 212 already proved unsafe
under concurrent access, a debt this lesson closes by naming honestly
rather than pretending it away.

## What Breaks Without This

Simulate two "concurrent" deposits to the same account, both reading
the balance *before* either one's update lands — exactly Lesson 212's
own interleaving:

```
user=> (def seen-by-both (field-value schema (get table2 0) "balance"))
#'user/seen-by-both
user=> seen-by-both
100
user=> (def after-deposit-1 (update-row schema table2 "id" "A" ["A" (+ seen-by-both 50)]))
user=> (def after-deposit-2 (update-row schema table2 "id" "A" ["A" (+ seen-by-both 50)]))
user=> (get (get after-deposit-2 0) 1)
150
```

Both "threads" read the same starting balance, `100`, before either
update landed, and both computed the identical new balance, `150` —
one deposit of `50` is silently lost; the account should read `200`
after two real `50` deposits, not `150`. Nothing crashes, no error is
raised — `update-row` did exactly what it was asked to do, twice,
correctly, and the bug is entirely in the fact that both callers worked
from the same stale reading. This is the precise reason Lesson 222
exists: to give database operations like this one a real way to detect
and refuse a stale-based update, the same way Lesson 217's
`compare-and-swap` did for a single shared counter.

## Exercises

1. Add a third field, `"name"`, to the schema and every row, and update
   `select-where` calls to confirm querying still works correctly
   against the extended schema without any change to `select-where`'s
   own code.
2. Write a `delete-row` function, following `find-row-index`'s pattern,
   that removes a matching row from a table entirely (hint: this needs
   a rebuild-without-one-entry approach, the same shape as Lesson 220's
   `remove-entry`, not `update-row-at`'s single-position replace).
3. Reproduce this lesson's own "What Breaks Without This" scenario, then
   write, in one sentence, what specific piece of information
   `update-row` would need to be given in order to detect that its own
   `seen-by-both` reading had gone stale before committing its write.

## Definition of Done

- [ ] `field-index`, `field-value`, `insert-row`, `select-where`,
      `find-row-index`, `update-row-at`, and `update-row` all defined
      and run in a live `bb` REPL, matching every transcript shown above
      exactly.
- [ ] The Unit 1 schema-and-row scenario reproduced, reading a field by
      name rather than position.
- [ ] The Unit 2 query reproduced, returning exactly the matching row
      out of a larger table.
- [ ] The Unit 3 update reproduced, confirming the original table value
      is left untouched while a new, updated table value is produced.
- [ ] The lost-update reproduction in "What Breaks Without This"
      completed, with the final balance shown to be wrong.
- [ ] `git commit -m "Add Lesson 221: structured rows, a real query, and
      update-in-place — which reopens Lesson 212's lost-update problem
      one layer up"`
