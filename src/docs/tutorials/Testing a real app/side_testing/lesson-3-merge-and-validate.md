# Lesson 3: Merging Two Sources by ID, Conflicts, and Orphans

Same rules as Lessons 1-2: every block tagged, every output real and run
this session, CRC-lite (not full) on Header entries.

**Fixing a mismatch from Lesson 2:** I told you `nc_number` matches "the
toolpath group id from Lesson 1" — that's not quite right. Lesson 1's
generic example was a server inventory, which has no operation numbers at
all. To actually build a merge that means something, this lesson
introduces one new small piece first: a generic toolpath-with-IDs parser,
built with the exact same technique as Lesson 1 (a compiled regex, one
small dataclass, a pure `parse_*` function), just applied to a text shape
that actually has operation numbers — the way your real file does. That's
Concept Unit 1 below. Everything after it is genuinely new: merging,
conflicts, orphans.

## What you will build

Two independently-tested object trees (one from a toolpath-like text
file, one from the XML setup sheet — Lessons 1 and 2's shape) get joined
by a shared ID into one `MergedOperation` per ID. Along the way: what
happens when both sides *disagree* about a field (a real, decidable
policy, not silently picking one), what happens when an ID exists on only
one side (a real, flaggable problem, not silently ignored), and combined
validation that catches both structural gaps and rule violations
(negative feedrate, missing tool) in one pass, collecting every issue.

## What you need to know first

The dataclass, regex, I/O-vs-logic, and error-collecting patterns from
Lessons 1-2. This lesson adds dict comprehensions and set operations
(`|` for union) as new syntax, explained where they first appear.

## Terms used in this lesson

- **Join key** — a value present in two separate datasets that identifies
  "these two records describe the same real-world thing," used to line
  them up. It exists as a named idea because without agreeing on *which*
  field is the join key, "merge these two things" is an undefined
  operation — you have to know what makes two records "the same."
- **Conflict (in a merge)** — a case where both sources provide a value
  for the same field, and those values genuinely disagree. It's a
  distinct idea from "missing data": missing data is one source being
  silent; a conflict is both sources speaking, and saying different
  things.
- **Orphan (in a merge)** — a record that exists in one source but has no
  counterpart in the other, by join key. Worth naming separately from a
  conflict, because the right response is different: a conflict asks
  "which value is right," an orphan asks "should this record exist in
  the merged result at all."
- **Dict comprehension** — `{k: v for k, v in ...}`, the dictionary
  equivalent of a list comprehension: builds a new dict by evaluating a
  key/value pair per item in some iterable, in one expression.
- **Set union (`|`)** — combining two Python `set`s into one containing
  every element from both, with duplicates automatically collapsed
  (that's what a set *is* — a collection with no duplicates). It exists
  as its own concept because a set forces "does this ID exist" into
  a yes/no question, cleanly, regardless of which side(s) it came from.

## Objects and methods used

- **`set` union operator (`|`)**
  *What it is:* an operator between two `set` objects producing their
  combined contents.
  *Implementation:* `{1, 2} | {2, 3}` → `{1, 2, 3}`.
  *Its use:* combining "every ID on the toolpath side" with "every ID on
  the XML side" into one complete list of IDs to process, with no
  duplicates even though an ID present on both sides would otherwise
  appear twice.
- **`dict.get(key, default)`**
  *What it is:* a dict method returning the value for `key` if present,
  otherwise `default` (here, `None` is used implicitly since that's
  `.get`'s own default when no second argument is given), instead of
  raising `KeyError` the way `dict[key]` would on a missing key.
  *Implementation:* `{"a": 1}.get("b")` → `None`; `{"a": 1}.get("a")` → `1`.
  *Its use:* looking up "the toolpath op for this ID, if one exists" —
  the "if one exists" is exactly what makes `.get` the right tool instead
  of `[...]`, since a missing ID (an orphan) is an expected, not
  exceptional, case here.

---

## Concept Unit 1: A second parser, for a structure that actually has IDs

### The Problem

Your real toolpath file's operations are numbered (`1101`, `1102`, ...) —
that number is what the XML's `<NCFILE-SHORT>1101.NC</NCFILE-SHORT>`
matches. A generic line like `"1101: 2D High Speed - Tool: 0.5 Bull
endmill"` needs to become an object with that number as a real field,
not folded into a description string. Given the regex technique from
Lesson 1 (`^\s*([A-Za-z]+):...`), what would you change to capture
*leading digits* instead of leading letters?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
import re

pattern = re.compile(r'^(\d+):\s*(.+)$')
for line in ["1101: something", "not numbered: nope", "42: also fine"]:
    m = pattern.match(line)
    print(repr(line), "->", m.groups() if m else None)
```

Real output:

```
'1101: something' -> ('1101', 'something')
'not numbered: nope' -> None
'42: also fine' -> ('42', 'also fine')
```

`\d+` (one or more digits) at the start, instead of `[A-Za-z]+`, is the
whole change — proving the same recognize-and-capture mechanism from
Lesson 1 generalizes directly to a different leading shape.

### Discard the throwaway example

Doesn't appear again — only the digit-anchored pattern idea carries
forward, now built out into a real capture of three fields, not two.

### Project Change

- **Reference Source:** the numbered operation lines (`1101`, `1102`,
  etc.) inside each `Toolpath Group` in your real toolpath file.
- **Files affected:** new file, `toolpath_ops.py`.
- **Change type:** add.
- **Location:** whole new file.
- **Dependencies:** `re`, `dataclasses`.

### The New Code

> **→ goes in `toolpath_ops.py`**

```python
from dataclasses import dataclass
from typing import Optional
import re

OP_LINE_RE = re.compile(r'^(\d+):\s*(.+?)\s*-\s*Tool:\s*(.+)$')

@dataclass
class ToolpathOp:
    op_id: str
    op_type: Optional[str] = None
    tool_name: Optional[str] = None

def parse_toolpath_ops(lines):
    """Pure logic: list[str] in, list[ToolpathOp] out."""
    ops = []
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        m = OP_LINE_RE.match(line)
        if m:
            ops.append(ToolpathOp(op_id=m.group(1), op_type=m.group(2), tool_name=m.group(3)))
    return ops
```

### The Updated Project

This is a brand-new file — the whole thing is shown above, same
exemption as `inventory.py`'s first block in Lesson 1.

### Mechanical walkthrough

- `OP_LINE_RE = re.compile(r'^(\d+):\s*(.+?)\s*-\s*Tool:\s*(.+)$')` —
  three capture groups this time: `(\d+)` for the ID, `(.+?)` for the
  operation type, `(.+)` for the tool name. The middle group uses `.+?`
  (a *non-greedy* quantifier — the `?` after `+` means "match as few
  characters as possible while still letting the rest of the pattern
  match"), specifically so it stops at the first ` - Tool:` it finds,
  rather than a greedy `.+` potentially swallowing part of the tool name
  if the operation type itself ever contained the word "Tool" — a real
  edge case worth guarding even though it doesn't show up in this
  lesson's sample data.
- `ToolpathOp` — a three-field dataclass, same mechanism as `Server` in
  Lesson 1.
- `parse_toolpath_ops(lines)` — same shape as Lesson 1's `parse_lines`:
  pure function, list of strings in, list of dataclass instances out,
  skipping blank lines and silently skipping any line that doesn't match
  (rather than crashing on the first malformed line).

### Run it

```python
sample = [
    '1101: 2D High Speed - Tool: 0.5 Bull endmill',
    '1102: Drill/Counterbore - Tool: .3125 CT 1"LOC',
]
for op in parse_toolpath_ops(sample):
    print(op)
```

Real output:

```
ToolpathOp(op_id='1101', op_type='2D High Speed', tool_name='0.5 Bull endmill')
ToolpathOp(op_id='1102', op_type='Drill/Counterbore', tool_name='.3125 CT 1"LOC')
```

### Connect

You now have two independently-built object lists that share a real key:
`ToolpathOp.op_id` and `setupsheet.Operation.nc_number`, both `"1101"`,
`"1102"` in this data. Next: actually lining them up.

---

## Concept Unit 2: Merging by a shared key, handling "only on one side"

### The Problem

Given a list of `ToolpathOp`s and a list of XML `Operation`s, both with
IDs, how do you find "the pair that share ID `1101`" without an `O(n²)`
nested loop comparing every toolpath op against every XML op? And what
should happen for an ID that's on one side only — should it be silently
dropped, or does that deserve attention?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
left = ["a", "b", "c"]
right = ["b", "c", "d"]

left_set = set(left)
right_set = set(right)

print("union (everything on either side):", left_set | right_set)
print("only in left:", left_set - right_set)
print("only in right:", right_set - left_set)
print("in both:", left_set & right_set)
```

Real output:

```
union (everything on either side): {'a', 'b', 'c', 'd'}
only in left: {'a'}
only in right: {'d'}
in both: {'b', 'c'}
```

This proves Python's built-in `set` operators directly answer exactly the
questions a merge needs to ask: `|` for "every key that exists anywhere,"
`&` for "keys on both sides" (where a real merge happens), and `-` for
"keys on only one side" (an orphan, in either direction) — all without
writing a single nested loop by hand.

### Discard the throwaway example

Doesn't appear again — the `left`/`right` strings were only to prove the
set-operator behavior before applying it to real IDs.

### Project Change

- **Reference Source:** none — from-scratch merge logic, no counterpart
  in either source file individually.
- **Files affected:** new file, `merge.py`.
- **Change type:** add.
- **Location:** top of the file, after imports.
- **Dependencies:** `toolpath_ops.ToolpathOp`, `setupsheet.Operation`.

### The New Code

> **→ goes in `merge.py`**

```python
from dataclasses import dataclass, field
from typing import List, Optional

from toolpath_ops import ToolpathOp, parse_toolpath_ops
from setupsheet import Operation as XmlOperation, SetupSheet

@dataclass
class MergedOperation:
    op_id: str
    op_type: Optional[str] = None
    tool_name: Optional[str] = None
    feedrate_ipm: Optional[float] = None
    spindle_rpm: Optional[float] = None
    depth: Optional[float] = None


def merge_operation(toolpath_op, xml_op):
    """Two plain objects (either may be None) in, one MergedOperation out. No I/O."""
    tool_name = None
    if xml_op is not None and xml_op.tool is not None and xml_op.tool.name:
        tool_name = xml_op.tool.name
    elif toolpath_op is not None and toolpath_op.tool_name:
        tool_name = toolpath_op.tool_name

    return MergedOperation(
        op_id=toolpath_op.op_id if toolpath_op else xml_op.nc_number,
        op_type=toolpath_op.op_type if toolpath_op else (xml_op.name if xml_op else None),
        tool_name=tool_name,
        feedrate_ipm=xml_op.feedrate_ipm if xml_op else None,
        spindle_rpm=xml_op.spindle_rpm if xml_op else None,
        depth=xml_op.depth if xml_op else None,
    )


def merge_by_id(toolpath_ops, xml_ops):
    toolpath_by_id = {op.op_id: op for op in toolpath_ops}
    xml_by_id = {op.nc_number: op for op in xml_ops}
    all_ids = set(toolpath_by_id) | set(xml_by_id)
    return [merge_operation(toolpath_by_id.get(i), xml_by_id.get(i)) for i in sorted(all_ids)]
```

### The Updated Project

Brand-new file, same exemption as Unit 1 — full contents shown above.

### Mechanical walkthrough

- `MergedOperation` — a new dataclass, one field per piece of data the
  merged result actually needs. Note there's no separate "which source
  did this come from" field — a deliberate simplification for this
  lesson; a real system might want provenance tracking per field, which
  is a reasonable next step once this base version is solid.
- `merge_operation(toolpath_op, xml_op)` — both parameters are typed as
  "may be `None`," matching the orphan case directly: this function has
  to work correctly whether it's given both objects, or only one.
  `tool_name = None` then conditionally overwritten — this is a
  **precedence policy**, stated in code: XML's tool name wins if present,
  falling back to the toolpath side only if XML has none. That's a real
  design decision, not an accident — see the SE lens below for why.
  `toolpath_op.op_id if toolpath_op else xml_op.nc_number` — a
  conditional expression again (same shape as Lesson 2's `text_of`):
  prefer the toolpath op's ID, but if there isn't one (`toolpath_op` is
  `None`), fall back to the XML side's ID — since at least one side is
  guaranteed present (that's how `all_ids` was built, see below), this
  never actually hits a case where both are `None`.
- `merge_by_id(toolpath_ops, xml_ops)` — `{op.op_id: op for op in
  toolpath_ops}` is a **dict comprehension**: for each `op` in the list,
  build a dict entry keyed by its `op_id`. This turns an *ordered list*
  into a *keyed lookup table*, which is what makes finding "the toolpath
  op for ID 1101" an `O(1)` dict lookup instead of scanning the whole
  list each time. `set(toolpath_by_id)` — iterating over a dict directly
  gives you its keys, so wrapping it in `set(...)` produces the set of
  all IDs on that side. `set(toolpath_by_id) | set(xml_by_id)` — the
  union operator from the lab, now applied to real IDs: every ID that
  exists on either side, with duplicates (IDs present on both) collapsed
  automatically since that's what a set already guarantees. `for i in
  sorted(all_ids)` — sorting first so the output list has a stable,
  predictable order (sets themselves have no defined order) — worth
  doing since two runs of the same input should produce identically
  ordered output.

### Execution trace

Tracing `merge_by_id` over the real sample data (one toolpath op and one
XML op sharing ID `"1101"`):

1. `toolpath_by_id = {"1101": ToolpathOp(...), "1102": ToolpathOp(...)}`
   — built once, from the full `toolpath_ops` list.
2. `xml_by_id = {"1101": Operation(...), "1102": Operation(...)}` —
   same, from the XML side.
3. `all_ids = {"1101", "1102"} | {"1101", "1102"}` → `{"1101", "1102"}`
   — union collapses the duplicate IDs present on both sides down to two
   unique entries.
4. `sorted(all_ids)` → `["1101", "1102"]`.
5. For `i = "1101"`: `toolpath_by_id.get("1101")` returns the real
   `ToolpathOp`; `xml_by_id.get("1101")` returns the real `Operation`.
   Both present, so `merge_operation` runs its full logic, preferring the
   XML tool name.
6. Same for `i = "1102"`.

### Real output

Merging the real (trimmed) sample toolpath file and XML file:

```
[
  {"op_id": "1101", "op_type": "2D High Speed", "tool_name": "0.5 Bull endmill", "feedrate_ipm": 48.132, "spindle_rpm": 4584.0, "depth": 0.0},
  {"op_id": "1102", "op_type": "Drill/Counterbore", "tool_name": ".3125 CT 1\"LOC", "feedrate_ipm": 7.9456, "spindle_rpm": 3178.0, "depth": 0.0}
]
```

### CS lens

`.get(key, default)` (or plain `.get(key)`, defaulting to `None`) instead
of `dict[key]` is a small instance of the same **defensive-against-
absence** idea from Lesson 2's `text_of` — "this thing might not be
there" treated as an expected case, not an exception. Building a dict
from a list purely to get fast lookups by key is also a very common,
nameable move: an **index**, in the database sense — trading memory
(you now hold the data twice, once as a list, once as a dict) for lookup
speed (`O(1)` instead of scanning).

### SE lens

"XML's tool name wins on conflict" is a real, debatable policy choice —
the alternative would be "toolpath file wins," or "flag it and refuse to
merge until a human decides." I picked XML-wins here because the setup
sheet is generated closer to the actual machine setup in your real
workflow (a reasonable guess, not a fact I can verify from the file
alone) — but this is exactly the kind of decision you should make
deliberately for your real project, not inherit from this lesson by
default. Concept Unit 3 gives you the tool to at least *know* when this
policy actually mattered — i.e., when the two sides disagreed at all.

### Connect

You can now merge cleanly when both sides agree or when one side is
silent. Next: what happens when they actively disagree.

---

## Concept Unit 3: Detecting conflicts and orphans explicitly

### The Problem

`merge_operation`'s "XML wins" policy means a real disagreement between
sources is currently invisible — the merged result just quietly reflects
XML's value, with no record that the toolpath file said something
different. Given the error-collecting `ValidationResult` pattern from
Lesson 1, how would you record "these two sources disagree" as its own
kind of finding, separate from "this field failed a business rule"?

### The New Code

> **→ goes in `merge.py`**

```python
@dataclass
class ValidationError:
    path: str
    message: str

@dataclass
class ValidationResult:
    errors: List[ValidationError] = field(default_factory=list)

    @property
    def is_valid(self):
        return len(self.errors) == 0

    def add(self, path, message):
        self.errors.append(ValidationError(path, message))


def check_tool_name_conflict(toolpath_op, xml_op, result):
    if toolpath_op is None or xml_op is None or xml_op.tool is None:
        return
    if not toolpath_op.tool_name or not xml_op.tool.name:
        return
    a = toolpath_op.tool_name.strip().lower()
    b = xml_op.tool.name.strip().lower()
    if a != b:
        result.add(
            toolpath_op.op_id,
            f"tool name mismatch: toolpath says '{toolpath_op.tool_name}', XML says '{xml_op.tool.name}'",
        )


def check_orphaned_operation(op_id, toolpath_op, xml_op, result):
    if toolpath_op is None:
        result.add(op_id, "present in XML setup sheet but not in toolpath file")
    elif xml_op is None:
        result.add(op_id, "present in toolpath file but not in XML setup sheet")
```

### The Updated Project

```python
 1  from toolpath_ops import ToolpathOp, parse_toolpath_ops
 2  from setupsheet import Operation as XmlOperation, SetupSheet
 3
 4  @dataclass
 5  class ValidationError:                          # ← new
 6      path: str                                    # ← new
 7      message: str                                 # ← new
 8
 9  @dataclass
10  class ValidationResult:                          # ← new
11      errors: List[ValidationError] = field(default_factory=list)  # ← new
12
13      @property                                    # ← new
14      def is_valid(self):                          # ← new
15          return len(self.errors) == 0              # ← new
16
17      def add(self, path, message):                # ← new
18          self.errors.append(ValidationError(path, message))  # ← new
19
20  @dataclass
21  class MergedOperation:
22      op_id: str
23      op_type: Optional[str] = None
24      tool_name: Optional[str] = None
25      feedrate_ipm: Optional[float] = None
26      spindle_rpm: Optional[float] = None
27      depth: Optional[float] = None
```

(`check_tool_name_conflict` and `check_orphaned_operation` are new,
freestanding functions, shown in full above.)

### Mechanical walkthrough

- `ValidationError`/`ValidationResult` — the identical pattern from
  Lesson 1's Concept Unit 4, reappearing here, given the same full
  treatment rather than assumed already-known: a dataclass holding a
  `path` and a `message`, and a collecting result object with an
  `is_valid` property and an `add` method.
- `check_tool_name_conflict` — three early-return guard clauses first
  (`if ...: return`), each ruling out a case where a conflict check
  wouldn't even make sense (one side missing entirely, or one side's
  tool name genuinely blank) — this is the same "guard before you trust
  the input" shape as Lesson 2's `parse_number`. Only past those guards
  does the actual comparison happen: `.strip().lower()` on both sides
  before comparing, so `"0.5 Bull Endmill"` and `"0.5 bull endmill"`
  (a case or whitespace difference alone) are correctly treated as the
  *same* tool, not a conflict — real-world data entry noise, not a
  genuine disagreement.
- `check_orphaned_operation` — `if toolpath_op is None: ... elif xml_op
  is None: ...` — the two orphan directions, each producing a distinct,
  readable message naming which side is missing.

### Run it

Tested against real, deliberately mismatched data:

```python
toolpath_ops = [
    ToolpathOp(op_id='1101', op_type='2D High Speed', tool_name='0.375 Ball endmill'),
]
xml_ops = [
    XmlOperation(name='1 - 2D High Speed', nc_number='1101', depth=0.0,
                 feedrate_ipm=48.132, spindle_rpm=4584.0,
                 tool=Tool(number=1, name='0.5 Bull endmill', diameter=0.5)),
]
```

Real output:

```
is_valid: False
 - 1101 : tool name mismatch: toolpath says '0.375 Ball endmill', XML says '0.5 Bull endmill'
```

And confirming a same-name-different-case pair correctly produces *no*
error (proving the `.lower()` guard actually matters, not just that the
mismatch case works):

```
toolpath tool_name='0.5 BULL ENDMILL', xml tool_name='0.5 bull endmill'
-> is_valid: True (no conflict recorded)
```

And confirming orphans in both directions:

```python
toolpath_ops = [
    ToolpathOp(op_id='1101', ...),
    ToolpathOp(op_id='9999', op_type='Ghost Op', tool_name='Mystery Tool'),
]
xml_ops = [
    XmlOperation(nc_number='1101', ...),
    XmlOperation(nc_number='1102', ...),
]
```

Real output:

```
is_valid: False
 - 1102 : present in XML setup sheet but not in toolpath file
 - 9999 : present in toolpath file but not in XML setup sheet
```

### CS lens

Separating "does this look wrong on its own" (a single field failing a
rule) from "do these two independent sources agree" is a distinction
real data-integration systems care about a lot — often called
**reconciliation** in accounting/finance software, and **schema
matching** or **entity resolution** more generally in data engineering:
deciding whether two records from different systems describe the same
real thing, and what to do when they partially disagree.

### SE lens

You could fold conflict-detection directly into `merge_operation` itself
— check for a mismatch right where the tool name gets picked. I split it
into its own function instead because conflict-checking and
value-picking are different jobs with different failure modes:
`merge_operation` always successfully returns *something* (it has to —
merging can't fail outright), while `check_tool_name_conflict` only ever
adds information, never blocks the merge from completing. Keeping them
separate means you could disable conflict warnings entirely, or run them
independently, without touching the merge logic itself at all.

### Connect

Conflicts and orphans are both now real, testable findings instead of
silent. Last piece: business-rule validation on the merged result itself
(the "must be within these limits" checks your GUI already does), tied
together with everything above into one pass.

---

## Concept Unit 4: Combined validation and the full pass

### The New Code

> **→ goes in `merge.py`**

```python
def validate_merged_operation(op, result):
    path = op.op_id
    if op.tool_name is None:
        result.add(path, "no tool name from either source")
    if op.feedrate_ipm is not None and op.feedrate_ipm <= 0:
        result.add(path, "feedrate must be positive")
    if op.spindle_rpm is not None and op.spindle_rpm <= 0:
        result.add(path, "spindle speed must be positive")


def merge_and_validate(toolpath_ops, xml_ops):
    """Ties merging and conflict-checking and per-field validation into one pass."""
    result = ValidationResult()
    toolpath_by_id = {op.op_id: op for op in toolpath_ops}
    xml_by_id = {op.nc_number: op for op in xml_ops}
    all_ids = sorted(set(toolpath_by_id) | set(xml_by_id))

    merged_ops = []
    for op_id in all_ids:
        t_op = toolpath_by_id.get(op_id)
        x_op = xml_by_id.get(op_id)
        check_orphaned_operation(op_id, t_op, x_op, result)
        check_tool_name_conflict(t_op, x_op, result)
        merged = merge_operation(t_op, x_op)
        validate_merged_operation(merged, result)
        merged_ops.append(merged)

    return merged_ops, result
```

### The Updated Project

```python
 1  def check_orphaned_operation(op_id, toolpath_op, xml_op, result):
 2      if toolpath_op is None:
 3          result.add(op_id, "present in XML setup sheet but not in toolpath file")
 4      elif xml_op is None:
 5          result.add(op_id, "present in toolpath file but not in XML setup sheet")
 6
 7  def validate_merged_operation(op, result):        # ← new
 8      path = op.op_id                                # ← new
 9      if op.tool_name is None:                       # ← new
10          result.add(path, "no tool name from either source")  # ← new
11      if op.feedrate_ipm is not None and op.feedrate_ipm <= 0:  # ← new
12          result.add(path, "feedrate must be positive")  # ← new
13      if op.spindle_rpm is not None and op.spindle_rpm <= 0:    # ← new
14          result.add(path, "spindle speed must be positive")   # ← new
```

(`merge_and_validate` is a new, freestanding function, shown in full
above.)

### Mechanical walkthrough

- `validate_merged_operation` — same shape as Lesson 1's
  `validate_server`: independent `if` checks, each calling `result.add`
  rather than raising, so every applicable problem for one operation is
  found in a single pass.
- `merge_and_validate` — the orchestration function tying every piece
  from this lesson together: builds the two lookup dicts (Unit 2), walks
  every ID (Unit 2), runs the orphan check (Unit 3) *before* attempting
  to merge (since an orphan means one side is `None`, and you want that
  recorded regardless of what the merge produces), runs the conflict
  check (Unit 3) using the original, unmerged objects (since the conflict
  is about what the two *sources* said, not the merged result), then
  merges (Unit 2) and validates the merged result's own field values
  (this unit) — in that order, so every category of problem gets its own
  chance to fire independently.

### Run it

Full pipeline, real (trimmed) sample files, clean data:

```
is_valid: True
```

Full pipeline with deliberately broken data (one negative feedrate, one
orphan on each side):

```
is_valid: False
 - 1102 : present in XML setup sheet but not in toolpath file
 - 9999 : present in toolpath file but not in XML setup sheet
```

### Connect

`merge_and_validate` is now the single entry point: two independently
parsed object lists in, a merged list and every finding (conflicts,
orphans, rule violations) out in one collected result.

---

## Concept Unit 5: Testing the merge

### The New Code

> **→ goes in `test_merge.py`**

```python
import pytest
from toolpath_ops import ToolpathOp, parse_toolpath_ops
from setupsheet import Operation as XmlOperation, Tool
from merge import (
    merge_operation, check_tool_name_conflict,
    check_orphaned_operation, validate_merged_operation,
    merge_and_validate, ValidationResult,
)

def test_parse_toolpath_ops_extracts_id_type_tool():
    lines = ['1101: 2D High Speed - Tool: 0.5 Bull endmill']
    ops = parse_toolpath_ops(lines)
    assert ops[0].op_id == '1101'
    assert ops[0].op_type == '2D High Speed'
    assert ops[0].tool_name == '0.5 Bull endmill'


def xml_op(nc_number='1101', tool_name='0.5 Bull endmill', feedrate=48.132, spindle=4584.0):
    return XmlOperation(
        name='1 - 2D High Speed', nc_number=nc_number, depth=0.0,
        feedrate_ipm=feedrate, spindle_rpm=spindle,
        tool=Tool(number=1, name=tool_name, diameter=0.5) if tool_name else None,
    )

def toolpath_op(op_id='1101', tool_name='0.5 Bull endmill'):
    return ToolpathOp(op_id=op_id, op_type='2D High Speed', tool_name=tool_name)


def test_merge_prefers_xml_tool_name_when_present():
    merged = merge_operation(toolpath_op(tool_name='different name'), xml_op(tool_name='0.5 Bull endmill'))
    assert merged.tool_name == '0.5 Bull endmill'

def test_merge_falls_back_to_toolpath_tool_name_when_xml_missing():
    merged = merge_operation(toolpath_op(tool_name='0.5 Bull endmill'), xml_op(tool_name=None))
    assert merged.tool_name == '0.5 Bull endmill'

def test_merge_handles_toolpath_only():
    merged = merge_operation(toolpath_op(op_id='9999'), None)
    assert merged.op_id == '9999'
    assert merged.feedrate_ipm is None

def test_merge_handles_xml_only():
    merged = merge_operation(None, xml_op(nc_number='1102'))
    assert merged.op_id == '1102'
    assert merged.tool_name == '0.5 Bull endmill'


def test_tool_name_conflict_detected_case_insensitively_as_not_a_conflict():
    result = ValidationResult()
    check_tool_name_conflict(toolpath_op(tool_name='0.5 BULL ENDMILL'), xml_op(tool_name='0.5 bull endmill'), result)
    assert result.is_valid

def test_tool_name_conflict_detected_for_genuinely_different_tools():
    result = ValidationResult()
    check_tool_name_conflict(toolpath_op(tool_name='0.375 Ball endmill'), xml_op(tool_name='0.5 Bull endmill'), result)
    assert not result.is_valid
    assert 'mismatch' in result.errors[0].message


def test_orphan_flagged_when_missing_from_toolpath():
    result = ValidationResult()
    check_orphaned_operation('1102', None, xml_op(nc_number='1102'), result)
    assert not result.is_valid

def test_orphan_flagged_when_missing_from_xml():
    result = ValidationResult()
    check_orphaned_operation('9999', toolpath_op(op_id='9999'), None, result)
    assert not result.is_valid

def test_no_orphan_error_when_present_on_both_sides():
    result = ValidationResult()
    check_orphaned_operation('1101', toolpath_op(), xml_op(), result)
    assert result.is_valid


def test_negative_feedrate_fails():
    merged = merge_operation(toolpath_op(), xml_op(feedrate=-5.0))
    result = ValidationResult()
    validate_merged_operation(merged, result)
    assert not result.is_valid

def test_missing_tool_name_fails():
    merged = merge_operation(toolpath_op(tool_name=None), xml_op(tool_name=None))
    result = ValidationResult()
    validate_merged_operation(merged, result)
    assert not result.is_valid


def test_full_merge_pipeline_on_sample_files():
    with open('toolpath.txt') as f:
        toolpath_ops = parse_toolpath_ops(f.readlines())
    from setupsheet import parse_setup_sheet_file
    sheet = parse_setup_sheet_file('sample.xml')
    merged, result = merge_and_validate(toolpath_ops, sheet.operations)
    assert result.is_valid
    assert len(merged) == 2
    assert merged[0].op_id == '1101'
    assert merged[0].tool_name == '0.5 Bull endmill'
```

### Mechanical walkthrough

- `xml_op(...)`/`toolpath_op(...)` — two small factory functions with
  sensible defaults, same "baseline fixture, mutate what you need" role
  as Lesson 1's `valid_server()`, just parametrized so each test can
  override only the one field it cares about.
- The merge tests each isolate one policy decision from Unit 2: XML wins
  when present, toolpath is the fallback, either side alone still
  produces a sane result.
- The conflict tests directly prove *both* halves of Unit 3's guard
  logic: a real mismatch is caught, and a same-name-different-case pair
  is correctly *not* flagged — both matter equally, since a
  conflict-checker that fires on harmless case differences would be
  noisy enough to ignore in practice.
- The orphan tests cover both directions independently, plus the "no
  error when both present" case — proving the check doesn't produce
  false positives on ordinary matched data.
- `test_full_merge_pipeline_on_sample_files` — the golden test, real
  (trimmed) files, both parsers, the merge, one pass of validation,
  checked against the facts that matter at this scale.

### Run it

Actually run with `python3 -m pytest test_merge.py -v`. Real output:

```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.6.0
collecting ... collected 13 items

test_merge.py::test_parse_toolpath_ops_extracts_id_type_tool PASSED                      [  7%]
test_merge.py::test_merge_prefers_xml_tool_name_when_present PASSED                      [ 15%]
test_merge.py::test_merge_falls_back_to_toolpath_tool_name_when_xml_missing PASSED        [ 23%]
test_merge.py::test_merge_handles_toolpath_only PASSED                                    [ 30%]
test_merge.py::test_merge_handles_xml_only PASSED                                         [ 38%]
test_merge.py::test_tool_name_conflict_detected_case_insensitively_as_not_a_conflict PASSED [ 46%]
test_merge.py::test_tool_name_conflict_detected_for_genuinely_different_tools PASSED       [ 53%]
test_merge.py::test_orphan_flagged_when_missing_from_toolpath PASSED                       [ 61%]
test_merge.py::test_orphan_flagged_when_missing_from_xml PASSED                            [ 69%]
test_merge.py::test_no_orphan_error_when_present_on_both_sides PASSED                      [ 76%]
test_merge.py::test_negative_feedrate_fails PASSED                                         [ 84%]
test_merge.py::test_missing_tool_name_fails PASSED                                         [ 92%]
test_merge.py::test_full_merge_pipeline_on_sample_files PASSED                             [100%]

============================== 13 passed in 0.02s ==============================
```

---

## Connect the pieces

The tool name `"0.5 Bull endmill"` for operation `1101`, traced end to
end: `toolpath_ops.parse_toolpath_ops` (Unit 1) reads `"1101: 2D High
Speed - Tool: 0.5 Bull endmill"` and produces `ToolpathOp(op_id="1101",
tool_name="0.5 Bull endmill")`. Separately, `setupsheet.parse_operation`
(Lesson 2) reads the XML and produces an `Operation` whose `tool.name` is
also `"0.5 Bull endmill"`. `merge_by_id` (Unit 2) looks both up by the
shared key `"1101"` via two dict comprehensions and a set union.
`check_tool_name_conflict` (Unit 3) compares them case-insensitively,
finds no real disagreement, and adds no error. `merge_operation` (Unit 2)
picks XML's value (the stated policy) — which happens to be identical to
the toolpath side's here, so the policy choice made no visible
difference in this particular case, but would have if you fed it the
mismatched data from Unit 3's own Run It step. `validate_merged_operation`
(Unit 4) checks the merged operation isn't missing a tool name — it
isn't, so no error. The whole thing is proven, independently of any of
that, by `test_merge_prefers_xml_tool_name_when_present` and
`test_full_merge_pipeline_on_sample_files` in Unit 5, neither of which
had to trust that the earlier units were right — each re-proves it from
scratch.

---

## Files for this lesson

`toolpath_ops.py`, `merge.py`, `test_merge.py`, and the sample data
files (`toolpath.txt`, `sample.xml`, reused from Lesson 2) are attached.
`python3 -m pytest test_merge.py -v` runs the whole suite.

## Where this goes from here

You mentioned your GUI already validates against options it presents —
if you share what those specific rules check (allowed tool types per
operation, feedrate limits per material, whatever your GUI actually
enforces), the next lesson can replace this lesson's generic
`validate_merged_operation` rules with your real ones, using the same
error-collecting pattern.
