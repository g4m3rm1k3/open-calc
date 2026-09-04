# Lesson M1.5: Deciding Which Sequence a Real Operation Belongs To

*File paths under mastercam-app/... refer to the real manufacturing-platform repository's mastercam-app folder. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A throwaway proof of Python's own real modulo operator (`%`) grouping real numbers by remainder, then this app's own real `parse_mastercam_xml` (mastercam-app/mastercam_app/parsing/parser.py:687-826) - the one real function that decides, for every real operation this app parses, which real `Sequence` it belongs to, including a real, concrete rule for what happens when the identical real tool number gets used again later in the same real part, non-consecutively. Backed by 8 real, already-passing tests (mastercam-app/tests/test_part_and_parse.py) - one of them run directly against this app's own real sample XML. The transferable problem: turning a real, flat sequence of operations into real, grouped sequences isn't just "same tool number, same sequence" - this app's own real rule has to also decide what "the same" even means when a tool is set up, used, set aside, and brought back later.

**What you need to know first:** Lesson M1.1's `Part`-adjacent `Holder`/`Assembly` pattern; Lesson M1.2's `Tool`; Lesson M1.4's `Sequence.add_operation`.

## Terms used in this lesson

- **modulo (%)** — A real, ordinary Python operator - `a % b` gives the real remainder left over after dividing `a` by `b` as many whole times as possible. It exists here specifically because `(n - tool.number) % 200 == 0` (Objects and methods, below) is a real, concrete way to ask "is `n` exactly `tool.number`, or exactly `tool.number` plus some whole multiple of 200" - a real question plain equality alone can't answer.

## Objects and methods used

- **`parse_mastercam_xml`**
  - *What it is:* The real, top-level entry point into this entire parser - the one real function every dataclass covered so far in this phase gets built through.
  - *Implementation:* `def parse_mastercam_xml(xml_path: Path, modify: bool = True) -> tuple[Part, list[str]]:` at mastercam-app/mastercam_app/parsing/parser.py:687-826. Parses the real XML file, optionally runs `modify_xml` first (a later, separate lesson), builds one real `Part` via `Part.from_xml`, then loops over every real `<OPERATION>` in every real `<NCFILE>`, deciding which real `Sequence` each one belongs to.
  - *Its use:* This lesson's own real focus is narrowly the sequence-grouping decision inside this function - not `modify_xml`, a separate, real, later concern.
  - *Type:* A real, module-level function - the real, whole parser's own entry point.
  - *Responsibility:* Turn one real XML file into one real `Part`, fully populated with real `Sequence` objects, each correctly grouping the real operations that belong together - by consecutive tool use first, falling back to the real "+200" rule (the second unit, below) the moment a tool number repeats non-consecutively.
  - *Depends on:* A real, existing XML file path, and an optional real `modify` flag (defaulting to `True`) deciding whether `modify_xml` runs first.
  - *Connects to:* Calls `Part.from_xml`, `Tool.from_xml`, `Operation.from_xml` (Lessons M1.1-M1.3), and `Sequence.add_operation`/ `regroup_operations_by_subprogram` (Lesson M1.4) - every real dataclass this phase has covered gets built through this one real function.
  - *Shape:* Returns a real, two-item tuple - one real, fully-built `Part`, and one real, flat list of every validation message gathered along the way - never raises for an ordinary, real parsing problem; only a genuinely malformed, unparseable XML file raises at all.

## Concept Unit: % Groups Real Numbers by What's Left Over After Dividing

### The Problem

This app's own real parser needs to tell "tool 1, used again for the first time" apart from "tool 1, used again for the second time," using nothing but real, already-assigned sequence numbers (`1`, `201`, `401`, ...) it has on hand so far. Before any real tool is shown: given a real list of numbers like `[1, 2]` and a real tool number `1`, what real, concrete test would tell you "some number in this list is `1`, or `1` plus some whole multiple of `200`" - not just "is `1` literally in the list"?

Before reading on:

- 1 % 200 and 201 % 200 - would you expect those two real expressions to give the same real answer, or different ones?
- Given that, what would (n - 1) % 200 == 0 tell you about a real number n, specifically when n is 1, 201, or 401?
- What would it tell you about n when n is 2 - a number belonging to a genuinely different real tool?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch, throwaway example proving the one real mechanism `parse_mastercam_xml`'s own real sequence-numbering rule (the unit right after this one) depends on.
- **Files affected:** `verification/mastercam-phase-01/lab_modulo_grouping.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Nothing beyond Python's own standard library.

### The New Code

One small, real, throwaway script, typed fresh, using the identical real expression this app's own parser uses, against two real, small, made-up lists of already-assigned sequence numbers:

**File:** `verification/mastercam-phase-01/lab_modulo_grouping.py` (new)

```python
existing_keys = [1, 2]
tool_number = 1

repeats = sum((n - tool_number) % 200 == 0 for n in existing_keys)
next_number = tool_number + 200 * repeats
print("repeats:", repeats)
print("next_number:", next_number)

existing_keys_second_reuse = [1, 2, 201]
repeats2 = sum((n - tool_number) % 200 == 0 for n in existing_keys_second_reuse)
next_number2 = tool_number + 200 * repeats2
print("repeats2:", repeats2)
print("next_number2:", next_number2)
```

### Mechanical Walkthrough

- `(n - tool_number) % 200 == 0` — Full treatment above (Terms, modulo) - for each real `n` in `existing_keys`, subtracts `tool_number`, then checks whether the real remainder after dividing by `200` is exactly `0` - true exactly when `n` and `tool_number` are the identical real number, or exactly `200`, `400`, `600`, apart.
- `sum(... for n in existing_keys)` — A real generator expression, summed directly - each real `True`/`False` from the comparison above counts as `1`/`0` in a real sum, so this real line counts how many real existing keys are "the same tool, some whole number of 200s later" - not just whether any are.
- `next_number = tool_number + 200 * repeats` — Uses that real count directly: zero real prior uses gives back `tool_number` itself unchanged; one real prior use adds `200`; two real prior uses add `400` - a real, deterministic next real slot, never colliding with a real, already-used one.
- `existing_keys_second_reuse = [1, 2, 201]` — A second real list, with tool `1`'s own first reuse (`201`) already present - proving, in Verification below, that a *third* real use of tool `1` correctly computes `401`, not `201` again.

### CS Lens

This is **modular arithmetic used as a real grouping key** - numbers that differ by an exact multiple of `200` are treated as "the same tool, a later real occurrence," the identical real idea behind a 12-hour clock treating `1` and `13` as "the same hour, half a day apart." Also recognized in: a real parking garage assigning space `47` on level 1 and space `247` on level 2 for the identical real spot number, a real hash table's own bucket assignment (`key % table_size`), and a real calendar treating January of two different years as "the same real month, one real year apart."

### SE Lens

The real design principle: **encoding a real, second fact (which real occurrence this is) into the same real number space as the first (which real tool)**, rather than adding a genuinely separate real field for it. The real alternative not chosen: giving `Sequence` its own real, explicit "occurrence count" field instead of folding it into the sequence number itself via `+200`. That alternative would make "which real tool does sequence `401` use" require reading a real, separate field instead of one real `% 200` away - the real, honest cost of the chosen design instead: the real number `200` is a bare, unexplained constant sitting directly in this app's own real source, with nothing nearby saying why `200` specifically, rather than `100` or `1000` - a real reader has to already know, or go find out elsewhere, that no single real part this app handles ever legitimately needs `200` real, distinct tool slots.

### Commands needed

- `python verification/mastercam-phase-01/lab_modulo_grouping.py` — Runs the real, throwaway file directly with the real Python interpreter, from inside manufacturing-platform's own repo root.

### Verification

```text
repeats: 1
next_number: 201
repeats2: 2
next_number2: 401
```

Full saved run: `verification/mastercam-phase-01/lab_modulo_grouping_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: parse_mastercam_xml Applies the +200 Rule Only When a Tool Genuinely Repeats

### The Problem

The unit above proved the real `% 200` arithmetic in isolation. This app's own real parser needs to decide, for *every* real operation, whether it continues the current real sequence or starts a new one - and the real +200 rule should only apply when a tool number genuinely repeats *non-consecutively*, not every real time the same tool appears. Given the unit above: if two real, back-to-back operations both use tool `1`, should the second one trigger the real +200 arithmetic at all, or is there a simpler, real check that should catch that case first?

Before reading on:

- If operation after operation all use the identical real tool number, would you want a new real sequence number for every single one, or one real sequence holding all of them?
- Given that, what real, simple check - using only the immediately previous real operation's own tool - would let parse_mastercam_xml skip the +200 arithmetic entirely for consecutive, same-tool operations?
- Only once that simple real check fails - the tool genuinely changed - does +200 apply. Why does checking "did the tool change" first, before ever computing repeats, matter for a real part where most operations use the same real tool as the one right before them?

### Project Change

- **Reference Source:** mastercam-app/mastercam_app/parsing/parser.py:793-807 (quoted in
full, the real, whole grouping decision - the surrounding real
parse loop that builds each `Tool`/`Operation` is already fully
covered in Lessons M1.2-M1.3):
if last_sequence_number is not None:
    current_seq = sequences_by_ta[last_sequence_number]
    if current_seq.tool.number == tool.number:
        current_seq.add_operation(operation)
        continue

repeats     = sum((n - tool.number) % 200 == 0 for n in sequences_by_ta)
next_number = tool.number + 200 * repeats
sequence = sequences_by_ta.get(next_number)
if sequence is None:
    sequence = Sequence(number=next_number, tool=tool)
    sequences_by_ta[next_number] = sequence

sequence.add_operation(operation)
last_sequence_number = next_number
- **Files affected:** `mastercam-app/mastercam_app/parsing/parser.py` (existing), `mastercam-app/tests/test_part_and_parse.py` (new)
- **Change type:** none
- **Location:** mastercam-app/mastercam_app/parsing/parser.py already exists. mastercam-app/tests/test_part_and_parse.py is a new, real, permanent test file, already written and passing this session - including one real test run directly against this app's own real sample-data XML.
- **Dependencies:** The unit above's own real `% 200` proof; Lesson M1.4's own real `Sequence.add_operation`, called directly here.

### The Updated Project

The real grouping decision, already existing, read directly - this is the body of `parse_mastercam_xml`'s own real loop, run once per real operation found in the source XML:

**File:** `mastercam-app/mastercam_app/parsing/parser.py` (already exists — read-only, nothing to type)

```python
if last_sequence_number is not None:
    current_seq = sequences_by_ta[last_sequence_number]
    if current_seq.tool.number == tool.number:
        current_seq.add_operation(operation)
        continue

repeats     = sum((n - tool.number) % 200 == 0 for n in sequences_by_ta)
next_number = tool.number + 200 * repeats
sequence = sequences_by_ta.get(next_number)
if sequence is None:
    sequence = Sequence(number=next_number, tool=tool)
    sequences_by_ta[next_number] = sequence

sequence.add_operation(operation)
last_sequence_number = next_number
```

### Mechanical Walkthrough

- `if last_sequence_number is not None: current_seq = sequences_by_ta[last_sequence_number]` — Looks up the real, immediately-previous sequence, if this isn't the real, first operation being processed at all.
- `if current_seq.tool.number == tool.number: current_seq.add_operation(operation); continue` — The real, simple check the Socratic prompt above pointed toward - if the current real operation's tool matches the *immediately preceding* real operation's tool, it joins that identical real sequence directly, via `Sequence.add_operation` (Lesson M1.4), and the real `% 200` arithmetic below never even runs. Confirmed directly by `test_parse_mastercam_xml_consecutive_operations_on_the_same_tool_stay_in_one_sequence`.
- `repeats = sum((n - tool.number) % 200 == 0 for n in sequences_by_ta)` — Full treatment above (Objects and methods, the unit's own title concept) - only reached once the simple, consecutive check just above has already failed, meaning the tool genuinely changed since the last real operation.
- `sequence = sequences_by_ta.get(next_number); if sequence is None: sequence = Sequence(number=next_number, tool=tool)` — Reuses a real, already-existing `Sequence` at this exact real slot if one exists (a real tool changed away and then immediately back, still within the identical real `+200` group), or builds a genuinely new real one otherwise.
- `sequence.add_operation(operation); last_sequence_number = next_number` — Full treatment already established (Lesson M1.4) for `add_operation` - adds the real operation, then updates `last_sequence_number` so the *next* real operation's own consecutive-tool check, above, compares against this one.

### Execution Trace

```
op1: tool=1, no prior sequence -> repeats=0 over {} -> new Sequence(number=1); last_sequence_number=1
op2: tool=1, current_seq.tool.number(1) == tool.number(1) -> joins Sequence 1 directly, +200 arithmetic never runs
op3: tool=2, current_seq.tool.number(1) != tool.number(2) -> repeats=0 over {1} (no key ≡ 2 mod 200) -> new Sequence(number=2); last_sequence_number=2
op4: tool=1, current_seq.tool.number(2) != tool.number(1) -> repeats=1 over {1, 2} (key 1 ≡ 1 mod 200) -> new Sequence(number=201); last_sequence_number=201
```

### CS Lens

This is a real, two-tier decision - a cheap, real, consecutive check first, falling back to a more general, real computation only when the cheap check fails. Also recognized in: a real cache lookup checked before a slower, real database query, a real spell-checker checking "is this word already in my personal dictionary" before running a slower, general real spelling algorithm, and a real compiler's own fast-path check for "is this the identical type as last time" before falling back to full, real type-compatibility checking.

### SE Lens

The real design principle: **ordering a cheap, common-case real check before an expensive, general one** - most real, consecutive operations in an actual part share the same real tool as the one immediately before them, so the simple `current_seq.tool.number == tool.number` check handles the real majority of operations without ever touching `% 200` at all. The real alternative not chosen: always computing `repeats`/`next_number` for every real operation, unconditionally, and letting `sequences_by_ta.get(next_number)` naturally find the identical real sequence for consecutive same-tool operations anyway (since `repeats` would come out to the identical `next_number` in that case too). That alternative would still be *correct* - the real, honest cost the chosen version avoids is a real `sum(...)` walk over every real key in `sequences_by_ta` so far, every single real operation, even for the overwhelmingly common real case where the tool never actually changed.

### Commands needed

- `python -m pytest tests/test_part_and_parse.py -v` — Runs this lesson's own real, permanent test file, from inside mastercam-app/, including one real, end-to-end test against this app's own real sample XML (sample-data/test part[M-26ESCPVPV5].xml, copied first so the real, version-controlled file is never touched).

### Verification

```text
collected 8 items

tests/test_part_and_parse.py::test_part_from_xml_reads_the_four_dialog_fields PASSED
tests/test_part_and_parse.py::test_part_from_xml_sets_programmer_from_the_real_current_user PASSED
tests/test_part_and_parse.py::test_part_to_dict_nests_every_sequence PASSED
tests/test_part_and_parse.py::test_parse_mastercam_xml_end_to_end_with_one_tool_one_program PASSED
tests/test_part_and_parse.py::test_parse_mastercam_xml_consecutive_operations_on_the_same_tool_stay_in_one_sequence PASSED
tests/test_part_and_parse.py::test_parse_mastercam_xml_reusing_a_tool_after_a_different_tool_creates_a_new_sequence_at_plus_200 PASSED
tests/test_part_and_parse.py::test_parse_mastercam_xml_sets_next_pointer_chaining_every_sequence_to_the_following_one PASSED
tests/test_part_and_parse.py::test_parse_mastercam_xml_against_the_real_sample_file_produces_sequences_and_errors PASSED

8 passed in 0.13s
```

Full saved run: `mastercam-app/tests/test_part_and_parse.py`.

### Connection to the previous unit

The unit above proved `% 200` groups numbers by remainder in isolation; this unit showed `parse_mastercam_xml` reaching for that exact mechanism only as a real fallback, after a cheaper, consecutive-tool check already handles the common real case - the final piece connecting every dataclass this whole phase covered into one real, working parser.

## Connect the pieces

One real part, followed through this whole phase's own five lessons: a real `<TOOL>` element becomes a real `Tool` (Lesson M1.2), composed of a real `Assembly` and `Holder` (Lesson M1.1); a real `<OPERATION>` becomes a real `Operation` (Lesson M1.3), its own real A/B/C rotation values pulled out of one combined plane string. `parse_mastercam_xml` decides which real `Sequence` each one belongs to - joining the current one directly when the tool hasn't changed, or computing a real `+200`-adjusted slot (this lesson's own two units) the moment it has - and `Sequence.add_operation` (Lesson M1.4) links each real operation to the one before it via a real, mutated `.next` field on a genuinely different object. Every real class this phase named is now backed by real, passing tests - 57 of them, across mastercam-app/tests/ - not just this phase's own five lessons' worth of reading and tracing.

**Next lesson:** modify_xml - the real, separate XML-normalization step this whole phase deliberately deferred, which renumbers and cross-checks real program IDs against real group-comment text before any of this phase's own dataclasses ever see the XML at all.