# Lesson 45: The Model That Served Two Masters

**What you will build:** fixing a real, live bug the user hit directly
— importing a real `.TOOLDB` file failed outright after Lesson 41 —
by removing a project-only database column that had no business being
on a model shared with reading files this project doesn't control, and
replacing it with a live calculation matching how Mastercam's own tool
library actually works. No reference counterpart. The transferable
problem: the same class can honestly serve two real purposes right up
until it doesn't, and nothing about the code itself warns you when
that happens.

**What you need to know first:** `core/tools.py`'s `read_tools_from_file`
(Lesson 18); Lesson 41's original `ChipLoadPerTooth` addition (now
being undone); Lesson 44's `EditableSfmInfoBlock` (the pattern this
lesson's `EditableCptInfoBlock` mirrors); `concepts/database-
migrations.md`.

---

## Concept Unit: A Shared Model, Two Real Data Sources

### The Problem

Lesson 41 added `ChipLoadPerTooth` to `TlToolMill`, reasoning it through
carefully as "this project's own addition, not a rename of anything
real" — a real, honest limitation, correctly named at the time. What
wasn't accounted for: `TlToolMill` isn't only used to read *this
project's own* database. `read_tools_from_file` (Lesson 18) points a
second, independent SQLAlchemy engine at whatever `.TOOLDB` file a user
actually uploads — a real Mastercam export, a file this project has
never touched and never will migrate. The moment `ChipLoadPerTooth`
existed on the shared model, *every* real upload failed:

```
could not read 'Untitled.TOOLDB' as a tool database:
(sqlite3.OperationalError) no such column: TlToolMill.ChipLoadPerTooth
```

Confirmed live, this session, against the user's own real file.

### Introduce the Concept in Isolation

First appearance of this exact failure mode in this project — full
standalone treatment: `concepts/orm-model-reused-against-a-foreign-
schema.md`. Read that first; its own isolated example (one `Item`
model, bound to an "owned" file and a "foreign" one, breaking only the
foreign read the moment a new column is added) is precisely this
project's own `TlToolMill` mistake, generalized.

### Project Change

- **Reference Source** — none; this is a bug in this project's own,
  earlier addition, not a reference-fidelity question.
- **Files affected** — `cnc-service/core/tools.py` (`TlToolMill`,
  `_tool_to_dict`), `cnc-service/app.py` (`TOOL_FIELDS`, `create_tool`).
- **Change type** — remove.
- **Location** — exactly where Lesson 41 added it.
- **Dependencies** — none.

### The New Code

The column itself, removed entirely:

```diff
-    ChipLoadPerTooth: Mapped[float | None] = mapped_column(default=None)
```

Its two other real references, removed alongside it: `_tool_to_dict`'s
own `"chip_load_per_tooth": mill.ChipLoadPerTooth` entry, and `app.py`'s
`TOOL_FIELDS` tuple entry plus the conditional write in `create_tool`
that populated it from a request body.

### Mechanical Walkthrough

Nothing new syntactically — every line removed here is exactly the
line Lesson 41 added. The real content of this unit is diagnostic, not
syntactic: confirming, directly, that `read_tools_from_file` is a real,
second consumer of `TlToolMill` bound to an engine this project's own
migrations never reach, and that this is precisely the scenario
`concepts/orm-model-reused-against-a-foreign-schema.md` names.

### CS Lens / SE Lens

Not repeated — both given full treatment in the concept file. This
project's own concrete cost of getting it wrong: not a slow query, not
a subtle display bug, but the single most important real action this
whole feature exists to support (importing real tool data) failing
outright, for every user, on every real file, the moment the column
existed.

### Commands

None new.

### Run It

```pycon
>>> from core.tools import read_tools_from_file
>>> tools = read_tools_from_file("../Untitled.TOOLDB")
>>> len(tools)
3
```

Real output, this session, against the exact file that had been
failing — confirmed working the moment the column was removed.

---

## Concept Unit: Undoing a Migration, for Real

### The Problem

The local app's own database (`instance/cnc.db`) still physically had
the `ChipLoadPerTooth` column — added via a real migration (Lesson 41's
own `ALTER TABLE ... ADD COLUMN`). Removing it from the ORM model alone
would leave the column sitting there, unused, real drift between the
model and the actual schema.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-service/instance/cnc.db` (schema only, via
  raw SQL — not a project source file).
- **Change type** — remove (a real, reverse migration).
- **Location** — the same table Lesson 41's own migration touched.
- **Dependencies** — SQLite 3.35+ (confirmed this session: 3.50.4).

### The New Code

```python
import sqlite3
conn = sqlite3.connect("instance/cnc.db")
conn.execute("ALTER TABLE TlToolMill DROP COLUMN ChipLoadPerTooth")
conn.commit()
```

### Mechanical Walkthrough

`ALTER TABLE ... DROP COLUMN` — **reappearing**, per `concepts/
database-migrations.md`'s own Try-It-Yourself exercise 3, which already
named this exact statement as "the reverse of your `ADD COLUMN`
migration" before it was ever actually needed for real in this project.
This lesson is that exercise, done for real: the same concept file's
own migration idea (a real, individually-named, ordered schema change),
applied in the direction of removing a mistake rather than adding a
feature.

### CS Lens / SE Lens

Not repeated — covered in `concepts/database-migrations.md`.

### Commands

None new — the migration itself is the only command, already shown.

### Run It

```pycon
>>> import sqlite3
>>> conn = sqlite3.connect("instance/cnc.db")
>>> [row[1] for row in conn.execute("PRAGMA table_info(TlToolMill)")]
['ID', 'OverallDiameter', 'OverallLength', 'FluteCount', 'CuttingDepth', 'ArborDiameter']
```

Real output, confirmed this session, both before (with the column) and
after (without it) — all 7 existing seed/test tool rows survived,
confirmed via `list_tools()` returning the same 7 tools with no
`chip_load_per_tooth` key.

---

## Concept Unit: CPT, Solved in Reverse — the Same Formula, One Variable Over

### The Problem

Without a stored column, CPT (chip load per tooth) needs a different
real source entirely — and the user's own direction was specific:
Mastercam's own tool library doesn't store it either; it computes it
live, from RPM and feed.

### Project Change

- **Reference Source** — none; real machinist domain knowledge, stated
  directly by the user, not sourced from any file in this repo.
- **Files affected** — `cnc-web/src/BlockList.tsx`, modified
  (`computeFeedFromChipLoad`, replaced).
- **Change type** — replace.
- **Location** — directly after `computeSfm` (Lesson 41).
- **Dependencies** — `EditableSfmInfoBlock` (Lesson 44), the pattern
  this unit's own `EditableCptInfoBlock` mirrors exactly.

### The New Code

```ts
function computeImpliedCpt(feed: number, rpm: number, fluteCount: number): number | null {
  if (rpm === 0 || fluteCount === 0) return null;
  return feed / (rpm * fluteCount);
}
```

### The Updated Project

```tsx
function EditableCptInfoBlock({
  tool,
  feed,
  rpm,
  command,
  onEditWord,
}: {
  tool: Tool;
  feed: number;
  rpm: number;
  command: Command;
  onEditWord: (command: Command, letter: string, value: string) => void;
}) {
  const implied = computeImpliedCpt(feed, rpm, tool.flute_count);
  const [text, setText] = useState(implied != null ? implied.toFixed(4) : "");
  return (
    <div className="block-info block-info-cpt">
      <span className="block-info-label">
        {INFO_ICONS.cpt}
        CPT
      </span>
      <input
        className="block-info-input"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const typedCpt = Number(e.target.value);
          if (Number.isNaN(typedCpt)) return;
          const newFeed = rpm * tool.flute_count * typedCpt;
          onEditWord(command, "F", String(Math.round(newFeed)));
        }}
      />
    </div>
  );
}
```

`OperationBlock` (Lesson 44) gains one matching `feedSource =
findSourceCommand(commands, declaredIndex, (w) => "F" in w, declared)`,
the same origin-attribution search already used for `sfmSource`, and
renders `EditableCptInfoBlock` in place of the removed, read-only CPT
`InfoBlock`.

### Mechanical Walkthrough

`feed = RPM × FluteCount × CPT`, solved for `CPT` (`feed / (rpm *
fluteCount)`) — the identical real formula `computeFeedFromChipLoad`
(Lesson 41, now removed) already used, just isolated for the opposite
variable, exactly as `EditableSfmInfoBlock` (Lesson 44) already solved
`SFM = π × diameter × RPM / 12` for `RPM` instead of `SFM`. Every
construct in `EditableCptInfoBlock` — local `text` state seeded once,
`Number.isNaN` guard, `onEditWord` on change — is **reappearing**,
`EditableSfmInfoBlock`'s own shape, named directly there as "the
identical shape... one formula over," now applied a second time.

### CS Lens

Not a hard CS concept — domain algebra, the same formula read in two
directions.

### SE Lens

The real, structural improvement this reversal buys: CPT's own read-
only limitation (Lesson 44's own SE Lens: "tool database metadata,
shared across every operation... a real, wider blast radius than one
operation") is gone entirely, not worked around. A value that's never
stored has no shared blast radius to worry about — every operation
computes and edits its own CPT independently, from its own real
feed/RPM, exactly like SFM already does.

### Commands

None new.

### Run It

```pycon
>>> feed, rpm, flutes = 150.0, 1800.0, 4
>>> feed / (rpm * flutes)
0.020833333333333332
>>> new_cpt = 0.002
>>> rpm * flutes * new_cpt
14.4
```

Real output, confirmed this session — both directions of the same
formula, matching `computeImpliedCpt` and `EditableCptInfoBlock`'s own
`onChange` handler exactly.

---

## Concept Unit: Deleting the Component That Ran Out of Callers

### The Problem

`InfoBlock` (Lesson 41) was the plain, read-only label/value shell —
every declared field originally used it. By the end of Lesson 44 and
this lesson, every single field it once rendered (Plane, WCS, Rotation,
Coolant, Tool, SFM, and now CPT) has its own editable replacement.
`InfoBlock` had zero real callers left.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx` (`InfoBlock`,
  removed), `cnc-web/src/theme.css` (`.block-info-value`, removed).
- **Change type** — remove.
- **Location** — where Lesson 41 originally added both.
- **Dependencies** — none.

### The New Code

```diff
-function InfoBlock({ kind, label, value }: { kind: string; label: string; value: string }) {
-  return (
-    <div className={`block-info block-info-${kind}`}>
-      <span className="block-info-label">
-        {INFO_ICONS[kind] || <Settings size={12} />}
-        {label}
-      </span>
-      <span className="block-info-value">{value}</span>
-    </div>
-  );
-}
```

### Mechanical Walkthrough

`npx tsc --noEmit` is what actually caught this: removing the CPT
block's own call site (previous unit) left `InfoBlock` an unused
declaration — TypeScript's own real, unused-declaration diagnostic
(`TS6133`), not something noticed by reading the diff alone.

The comment directly above `.block-info-select`/`.block-info-input`
(`theme.css`) was also rewritten, to stop citing the now-deleted
`.block-info-value` as its comparison point:

```css
/* Every declared/mid-operation block value is editable now (a select
   or an input) -- there is no remaining read-only value display, so
   this styles the select/input directly rather than a separate
   read-only span. box-sizing: border-box is what keeps its own
   padding/border from growing past that shared width, unlike
   .block-move-input's original bug (see below). */
```

A pure prose edit — `.block-move-input` (Lesson 43/44) is mentioned
only in passing, as a cross-reference, not a new rule.

### CS Lens

Not a hard CS concept — this is a real, direct instance of **dead code
elimination**, done by a human reading a compiler diagnostic rather
than an automated pass, but the same underlying idea: code with no
remaining path that reaches it should be removed, not preserved out of
caution.

### SE Lens

The real, deliberate choice named directly: delete completely, rather
than leaving `InfoBlock` in place "in case a future field needs a
read-only display again." A currently-unused component kept around on
spec is exactly the kind of speculative generality this project's own
conventions reject — if a genuinely new read-only field ever shows up,
writing a new, small component for it then costs less than maintaining
an unused one now.

### Commands

None new.

### Run It

```pycon
>>> # No Python analog; verified via `npx tsc --noEmit` returning clean
>>> # after the removal, shown in this lesson's own Definition of Done.
```

---

## Connect the Pieces

One real chain, start to finish: a user chooses "Choose .TOOLDB File,"
picks `Untitled.TOOLDB` — before this lesson, `read_tools_from_file`
opens it with the same `TlToolMill` model the local app uses,
generates a `SELECT` including `ChipLoadPerTooth`, and fails outright
against a table that (correctly, since it's a real Mastercam file) has
no such column. After this lesson: the model no longer carries that
column at all, the same file reads cleanly (3 tools, confirmed
directly), and CPT — no longer stored anywhere — is computed live in
the Operations view instead, from whatever RPM and feed a given
operation actually has, editable the same way SFM already is.

## What Breaks Without This

Re-adding `ChipLoadPerTooth` to `TlToolMill` and re-running the same
real import:

```pycon
>>> from core.tools import read_tools_from_file
>>> read_tools_from_file("../Untitled.TOOLDB")
Traceback (most recent call last):
    ...
sqlite3.OperationalError: no such column: TlToolMill.ChipLoadPerTooth
```

The exact regression this lesson exists to have fixed — reproduced
directly, this session, before removing the column again.

## Exercises

1. Read `concepts/orm-model-reused-against-a-foreign-schema.md`'s own
   Try-It-Yourself exercise 2 (a raw, column-limited fallback query for
   the foreign case) and sketch, in prose, what `read_tools_from_file`
   would look like if it *had* to keep a local-only column on
   `TlToolMill` some day — without breaking foreign reads.
2. Trace `EditableCptInfoBlock`'s own `implied` calculation by hand for
   an operation whose `declared.spindle_rpm` is `0` (a real, valid case
   — spindle not yet started) — confirm `computeImpliedCpt` returns
   `null` rather than dividing by zero, and explain what the input
   displays in that case.
3. Find the one other place in this project's own history
   (`STATUS.md`'s "Open items") where a value was deliberately computed
   live instead of stored, for a related reason — name it, and state
   whether the same reasoning applies here too.

## Known Incomplete — Named Directly

- **Not verified in a live browser this session** — the CPT/SFM
  formulas and the `.TOOLDB` re-read were verified directly (Python,
  and the real backend function called standalone); the actual
  Operations-tab UI has not been exercised.
- **`concepts/orm-model-reused-against-a-foreign-schema.md`'s own named
  mitigations** (schema-compatible additions, a separate joined table,
  a raw fallback query) are real, un-adopted alternatives — this
  project instead sidestepped the whole problem by not storing the
  field at all, the cheapest fix available specifically because CPT
  turned out not to need persistence in the first place. A future
  field that *does* need to be stored locally will have to actually
  choose one of those mitigations.

## Definition of Done

- [x] `ChipLoadPerTooth` removed from `TlToolMill`, `_tool_to_dict`,
      `app.py`'s `TOOL_FIELDS`/`create_tool`.
- [x] Local dev DB migrated (`DROP COLUMN`), all 7 existing tools
      survived.
- [x] Real `.TOOLDB` import verified working again, directly, against
      the exact file that had been failing.
- [x] CPT computed live (`computeImpliedCpt`), editable via
      `EditableCptInfoBlock`, mirroring `EditableSfmInfoBlock`.
- [x] `InfoBlock`/`.block-info-value` removed — no remaining callers.
- [x] One new, project-independent concept file
      (`orm-model-reused-against-a-foreign-schema.md`).
- [x] `npx tsc --noEmit` clean.
- [ ] Live-browser verification — explicitly deferred, named above.

```
git commit -m "Lesson 45: the model that served two masters"
```
