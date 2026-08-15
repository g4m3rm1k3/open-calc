# Lesson 15: Triggers

**What you will build:** a real `price_history` table that fills itself
in automatically, every time `parts.price` changes — with no
application code, anywhere, ever writing to it directly.

**What you need to know first:** [Lesson 06](lesson-06-update-and-delete.md)
— `UPDATE`'s own real mutation mechanics; every real price change this
project has made since then (Lesson 06's `Screwdriver Set`, Lesson 14's
own deliberate test) left no record behind at all, the exact gap this
lesson closes.

**Terms introduced in this lesson:**
- **Trigger** — a real, named block of SQL that SQLite runs
  automatically whenever a specific event (here, `price` being updated)
  happens to a specific table — never called directly by name, only
  fired implicitly.
- **`OLD`/`NEW`** — inside a trigger body, real, automatic references to
  the affected row's values before (`OLD`) and after (`NEW`) the
  triggering change.

**Objects and methods used:**

**`CREATE TRIGGER`**
- *What it is:* the real SQL statement that defines a trigger.
- *Implementation:* `CREATE TRIGGER trigger_name AFTER UPDATE OF column
  ON table BEGIN ... END;` — `AFTER UPDATE OF price` names the exact
  event this trigger fires on: after (not before) a real `UPDATE` that
  touches `price` specifically, on `parts` specifically. Everything
  between `BEGIN` and `END` runs automatically, once, for each such row.
- *Its use:* `trg_log_price_change` — this lesson's own real, permanent
  audit mechanism.

**`datetime()`**
- *What it is:* a real, built-in SQLite function.
- *Implementation:* `datetime('now')` returns the current UTC date and
  time as real text, in `YYYY-MM-DD HH:MM:SS` format.
- *Its use:* timestamping every automatic `price_history` row with the
  real moment the change happened.

---

## Concept Unit: `CREATE TRIGGER` — a Real Side Effect With No Explicit Call

### The Problem

Lesson 14's own deliberate test changed `Wrench`'s quantity, then
`Drill`'s price during its own real proof — and both changes left
*nothing* behind once complete: no record of what the value used to be,
or when it changed. A real hardware store genuinely needs that history
(a supplier dispute over "what did we agree to pay," months later), and
nothing about `UPDATE` itself, run directly, can retroactively supply
it.

### Introduce the Concept in Isolation

No throwaway table — a real, permanent second table, and a real trigger
watching `parts` on its behalf:

```
$ sqlite3 pocket_hardware.db
sqlite> CREATE TABLE price_history (
   ...>     id INTEGER PRIMARY KEY,
   ...>     part_id INTEGER,
   ...>     old_price REAL,
   ...>     new_price REAL,
   ...>     changed_at TEXT
   ...> );
sqlite> CREATE TRIGGER trg_log_price_change
   ...> AFTER UPDATE OF price ON parts
   ...> BEGIN
   ...>     INSERT INTO price_history (part_id, old_price, new_price, changed_at)
   ...>     VALUES (OLD.id, OLD.price, NEW.price, datetime('now'));
   ...> END;
```

`price_history` starts genuinely empty — confirmed with `SELECT * FROM
price_history;` returning nothing. Now, the one statement this lesson's
own Header promised: an ordinary `UPDATE`, with no mention of
`price_history` anywhere in it:

```
sqlite> UPDATE parts SET price = 42.50 WHERE name = 'Drill';
sqlite> SELECT * FROM price_history;
id  part_id  old_price  new_price  changed_at
--  -------  ---------  ---------  -------------------
1   3        45.0       42.5       2026-01-15 04:12:33
```

A real row appeared in `price_history` — `part_id` correctly identifies
`Drill` (`id` `3`, per Lesson 02's own real `parts.id`), `old_price`
and `new_price` correctly bracket the real change, and `changed_at`
holds a real, current timestamp — with the actual `UPDATE` statement
that caused all of it never once mentioning `price_history` by name.
(Your own timestamp, run at a different real moment, will legitimately
differ from the one shown here — `datetime('now')` reports the genuine
current time, not a fixed value.)

Restoring `Drill`'s real price back to `45.00` fires the identical
trigger a second time, for the identical, real reason:

```
sqlite> UPDATE parts SET price = 45.00 WHERE name = 'Drill';
sqlite> SELECT * FROM price_history;
id  part_id  old_price  new_price  changed_at
--  -------  ---------  ---------  -------------------
1   3        45.0       42.5       2026-01-15 04:12:33
2   3        42.5       45.0       2026-01-15 04:13:07
```

A second real row, logging the "undo" itself — proof the trigger has no
concept of "this was a mistake, don't log it"; it fires on every real
change that matches its event, unconditionally, including one that
merely restores an earlier value.

### Discard

Nothing throwaway — `price_history` and `trg_log_price_change` are both
real, permanent parts of this project from here on.

### Mechanical Walkthrough

- `CREATE TABLE price_history (...)` — **(b) hard concept reappearing**,
  Lesson 02's own `CREATE TABLE` shape, unchanged.
- `CREATE TRIGGER trg_log_price_change` — **(a) first appearance**,
  naming the trigger.
- `AFTER UPDATE OF price ON parts` — **(a) first appearance**: `AFTER`
  (as opposed to `BEFORE`, a real alternative timing this lesson
  doesn't use) means this trigger's body runs once the real `UPDATE`
  has already taken effect; `UPDATE OF price` scopes it specifically to
  changes touching `price` — an `UPDATE` touching only `quantity` (like
  Lesson 14's own `Wrench` test) does not fire this trigger at all.
- `BEGIN ... END;` — **(b) hard concept reappearing**: the identical
  `BEGIN`/`END` block shape Lesson 14 used to bound a transaction,
  reused here to bound a trigger's own body — a different real purpose
  for the same real syntax.
- `INSERT INTO price_history (...) VALUES (OLD.id, OLD.price,
  NEW.price, datetime('now'));` — **(b) hard concept reappearing** for
  `INSERT`, Lesson 03's own shape; `OLD.id`/`OLD.price`/`NEW.price` —
  **(a) first appearance** of `OLD`/`NEW`, full treatment above;
  `datetime('now')` — **(a) first appearance**, full treatment above.

### CS Lens

A trigger is a real, database-level instance of the **Observer
pattern**: `price_history` "observes" `parts` for one specific kind of
change, without `parts` itself — or any code that updates it — ever
needing to know `price_history` exists at all.

Also recognized in: a DOM event listener firing on a button click with
no code inside the click handler that fired it, a spreadsheet cell
recalculating automatically the instant a cell it depends on changes,
database Change Data Capture (CDC) systems built specifically to react
to row changes for replication or auditing, the publish/subscribe
pattern generally — every case, the same shape: an event happens, and
something reacts, without the event's own source code naming the
reaction directly.

### SE Lens

The real alternative not chosen: require every piece of application
code that ever changes `parts.price` (Arc 2's Python layer, Arc 4's
FastAPI backend, Arc 5's desktop UI, and anyone opening this file
directly with the CLI, exactly as this lesson just did) to remember to
also `INSERT` into `price_history` itself, by hand, every time. That
alternative has the identical real failure mode this series has already
named twice — Lesson 01's hand-rolled filtering, Lesson 07's
constraint-free schema — N independent call sites, each capable of
forgetting. A trigger moves that responsibility into the schema itself,
guaranteed regardless of which of this project's many future callers
makes the change — at a real, honest cost: the logging is now genuinely
invisible from the perspective of any single call site's own code,
which is exactly why this lesson exists to name it directly rather than
leave it a silent surprise.

## Connect the pieces

One real trigger, watching one real event: every time `parts.price`
actually changes, `trg_log_price_change` fires automatically, reading
the affected row's own before-and-after values through `OLD`/`NEW` and
writing a real, timestamped row into `price_history` — proven twice,
once for a real price drop and once for the real restore back, with
neither `UPDATE` statement ever mentioning `price_history` by name.

## What breaks without this

Remove the trigger, and repeat the identical kind of change:

```
$ sqlite3 pocket_hardware.db
sqlite> DROP TRIGGER trg_log_price_change;
sqlite> UPDATE parts SET price = 50.00 WHERE name = 'Drill';
sqlite> SELECT * FROM price_history;
id  part_id  old_price  new_price  changed_at
--  -------  ---------  ---------  -------------------
1   3        45.0       42.5       2026-01-15 04:12:33
2   3        42.5       45.0       2026-01-15 04:13:07
```

Only the same two real rows as before — the new `$50.00` change is
genuinely, silently unlogged, exactly like every price change before
this lesson ever existed. `DROP TRIGGER` removed the one thing making
`price_history` self-maintaining; with it gone, `UPDATE` reverts to
being exactly what Lesson 06 originally taught it to be — a real change
to `parts` alone, with no automatic side effect anywhere. (Restore
`Drill`'s real price to `45.00`, and recreate `trg_log_price_change`
with its own original definition above, before continuing — both are
real, permanent parts of this project going forward.)

## Exercises

1. Add a second real trigger, `trg_log_quantity_change`, logging
   `quantity` changes into a new `quantity_history` table, following
   this lesson's own `price_history` shape. Confirm it fires
   independently of `trg_log_price_change` — a `price`-only `UPDATE`
   should not touch `quantity_history`, and vice versa.
2. Change `trg_log_price_change`'s own timing from `AFTER` to `BEFORE`
   (you will need to `DROP` and recreate it). Inside a `BEFORE` trigger,
   confirm `NEW.price` already holds the *incoming* value even though
   the real `UPDATE` to `parts` itself hasn't happened yet at that
   point — a real, subtle timing difference worth proving directly
   rather than assuming.

## Definition of Done

- [ ] You created `price_history` and `trg_log_price_change`, confirmed
      empty at first.
- [ ] You changed `Drill`'s real price and confirmed an automatic
      `price_history` row appeared, with no `INSERT` written by you.
- [ ] You restored the price and confirmed a second automatic row
      logged the restore itself.
- [ ] You dropped the trigger, confirmed logging silently stopped, and
      restored both the trigger and `Drill`'s correct price afterward.
- [ ] You completed both exercises.

## Next

[Lesson 16 — SQLite-Specific Tour](lesson-16-sqlite-specific-tour.md)
closes Arc 1 with the real, distinctive tools this specific database
adds beyond standard SQL: schema introspection, file maintenance,
multi-file queries, and two real, built-in extensions.
