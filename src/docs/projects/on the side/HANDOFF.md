# Curriculum Handoff

Read this file first, every session, before writing or revising a lesson.
It exists so a session never needs to read prior lesson files, this
project's file history, or old chat context to know what to do next —
everything required is either here or in the two files it points to.

## Files in this set

- **`pyside.brd.curriclum.md`** — the curriculum blueprint. Source of
  truth for lesson order, numbering (`Series N`, lesson `N.M`), type
  (Core/Support/Lab), and each lesson's one-line Build/Survives note. Do
  not renumber or reorder it from inside a lesson-writing session — note
  drift here instead and let a human decide.
- **`TAUGHT-CONCEPTS.md`** — flat log of every term, construct, and
  object/method already introduced, by lesson. Use it to decide
  new-vs-reappearing per the Lesson Schema's Recursive Concept Extraction
  Rule, without opening any earlier lesson file. Append to it at the end
  of every lesson written. Never use it to shorten a lesson's own
  explanations — the schema's Repetition Rule still requires full,
  real treatment of a reappearing concept, every time.
- **`snapshot/`** — the literal current-state source files of the Asset
  Manager project, exactly as they stand at the end of the last written
  lesson. This is the only thing to read to write an accurate Project
  Change / Updated Project step for the next lesson — never reconstruct
  project state from memory or from old lesson prose. Read only the
  specific file(s) the next lesson's delta actually touches, not the
  whole tree. **As of Lesson 1.15,** this mirrors a real package, not
  flat files: `snapshot/asset_manager/__init__.py`,
  `snapshot/asset_manager/domain/__init__.py`,
  `snapshot/asset_manager/domain/asset.py`,
  `snapshot/asset_manager/domain/owner.py` — before 1.15 it was just
  `snapshot/asset.py` and `snapshot/owner.py` at the top level; 1.15's
  own lesson file documents the move itself. Keep this description in
  sync with `snapshot/`'s own real, current layout going forward — this
  note is a historical marker for *why* the shape changed, not a
  citation to keep re-deriving from.
- **`lessons/`** — the rendered lesson files, one per curriculum entry,
  grouped in per-series subfolders, named `<series-slug>/<N.M>-<slug>.md`
  (e.g. `series-1-python-foundations/1.1-classes-and-objects.md`).
- **`verification/`** — real, executed proof behind this curriculum's
  lessons, one subfolder per lesson (e.g. `verification/1.1/`), per the
  Lesson Schema's Verification Rule (Persistence part). Does not exist
  yet — created the first time a lesson's code actually requires a run.
  Check here before running anything a past lesson already verified;
  write new runs here, not only into session scratch.

## Standing deviations from the Lesson Schema (deliberate, usage-driven — do not re-litigate per lesson)

1. **Verification follows the shared schema's Verification Rule
   directly — no local override.** An earlier version of this handoff
   opted this curriculum out of execution entirely to control cost; that
   blanket opt-out is retired. `LESSON SCHEMA.md` now carries its own
   Verification Rule with three parts — Necessity (run only code whose
   exact output, or at minimum its shape, Claude can't already state
   with real confidence; a plain `print` of a literal, a constructor with
   no logic, and any well-known/well-documented call whose output Claude
   already knows cold — even one that computes something, like ordinary
   arithmetic or a stdlib function's documented return shape — all
   qualify as exempt; any PySide/Qt call or other library/framework
   behavior not already known firsthand, iteration or branching over
   data whose actual values matter, and error text do not), Batching
   (collect everything a lesson actually needs to run and execute it
   together, not one snippet at a time), and Persistence (save every real
   run to `verification/`, check there before re-running anything already
   verified). Follow it as written — do not re-derive a stricter or
   looser local version of it here.
2. **No shared concept-file catalog.** `src/docs/concepts/` is out of
   scope for this curriculum — never read or write it. Every
   Terms/Objects-and-methods entry and every supporting explanation is
   written inline, in full, inside the lesson itself, even where the
   schema would normally prefer factoring it into a shared concept file.
   This trades cross-curriculum reuse for never needing to leave this
   folder.
3. **No reference implementation.** This is an original project, not a
   port of an existing codebase. Every Concept Unit's Project Change step
   states, for Reference Source: *"No reference counterpart — original
   curriculum project."*
4. **No in-lesson lesson-number citations for concepts.** This is
   already the schema's own Repetition Rule, restated here because it's
   the reason `TAUGHT-CONCEPTS.md` exists: that file is a bookkeeping aid
   for the author, never a citation to put in a lesson's own prose. The
   only place a lesson number belongs is the Header's "What you need to
   know first" and the closing "next lesson" pointer.
5. **Read only this folder plus the Lesson Schema file.** Never read
   other curricula, other project docs, or `src/docs/concepts/` while
   writing a lesson in this series. If something outside this folder
   seems necessary, stop and ask rather than reading it.

## Current position

**SERIES 1 IS COMPLETE.** All sixteen lessons (1.1 through 1.16) are
written, self-checked, and landed — every Core/Support/Lab entry in
`pyside.brd.curriclum.md`'s "SERIES 1 — Python Application Foundations"
section has a finished lesson file under `lessons/
series-1-python-foundations/`, matching that series' own stated
outcome: a tested Python domain (`Asset`, `Owner`), no Qt, no SQL.

**Next lesson to write:** `2.4 — QLabel` (Series 2, Lab)

**Blueprint entry:** `pyside.brd.curriclum.md`, section "SERIES 2 —
PySide6: Desktop Application Development" → "## 2.4 — QLabel." Simple
display widget. **Throw away.** The first lesson to add a real, visible
*widget* to a window (2.1's own window has always been bare) — even
throwaway, this is a natural candidate to finally use the `run` skill's
screenshot capability flagged as deferred in 2.1's own session note,
since "a label with real text is visible on screen" is exactly the kind
of claim console output alone can't fully prove. Keep scope minimal per
blueprint (`QLabel`, its own text, adding it to a window) — no layouts
yet (2.8/2.9), no real domain data shown yet.

**Project state:** unchanged since 2.1 — 2.2 and 2.3 were both
conceptual/throwaway per their own blueprint entries, nothing landed in
either. `asset_manager/desktop/__init__.py` and `asset_manager/desktop/
main.py` (2.1) — a real, permanent PySide6 entry point: `main() -> int`
creates a `QApplication(sys.argv)`, a bare `QMainWindow` titled `"Asset
Manager"`, shows it, and returns `app.exec()`; guarded by `if __name__
== "__main__": sys.exit(main())`. No widgets beyond the bare window
yet; no connection to `asset_manager.domain` at all — still true.
`asset_manager/domain/asset.py` and
`asset_manager/domain/owner.py` — a real package (1.15). `Asset` is a
`@dataclass` (1.7): `name: str`, `serial_number: str`, `category:
str`, `owner: Owner`, `is_retired: bool = False`. `__init__`/
`__repr__`/`__eq__` generated. Defines `InvalidAssetError(ValueError)`
(1.11) — carries `field: str`. `__post_init__` (1.9, updated 1.11)
validates `name`/`serial_number`/`category` non-blank. `display_name`
(1.10) — computed `@property`. `describe`/`mark_retired` (1.1/1.2)
untouched. `find_by_serial` (1.6) untouched. `asset.py` imports `Owner`
via `from .owner import Owner` (relative, 1.15). `asset_manager/domain/
owner.py` — `Owner` is a `@dataclass` (1.7), no validation (1.9's own
deliberate scope boundary). `tests/test_asset.py` (1.16) — five real,
passing `pytest` tests covering creation, both `mark_retired` branches,
and both validation-exception facts. `asset_manager/__init__.py` and
`asset_manager/domain/__init__.py` both exist, empty (1.15). `snapshot/`
mirrors this exact layout, `asset_manager/desktop/` (2.1) included —
see **Files in this set** above. Read `snapshot/asset_manager/desktop/
main.py` before writing 2.4.

**Taught concepts so far:** `TAUGHT-CONCEPTS.md`'s Series 1 section
lists everything introduced through Lesson 1.16 — all of Series 1 — and
its new Series 2 section lists Lessons 2.1–2.3: (1.1) `class`, instance,
`pass`, `self`, instance attribute, method, `is`, default `==`,
implicit inheritance from `object`, dunder methods, `__init__`,
`object`, `__bases__`, `type()`, `AttributeError`, `return`,
`Asset.__init__`, `Asset.describe`; (1.2) `bool`, default attribute
value, state-changing method (mutator), invariant, guard clause, `if`
conditional, `Asset.mark_retired`; (1.3, Lab) class attribute,
mutable/immutable, attribute shadowing, attribute lookup, `__dict__`,
`list`/`.append()` (baseline), the mutable-class-attribute trap; (1.4)
composition, HAS-A relationship, `Owner.__init__`, `Asset.__init__`'s
`owner` parameter; (1.5, Support/throwaway) subclass, parent class,
IS-A relationship, overriding, `super()`; (1.6) `for`/`import` (added to
baseline), type annotation (parameter and return position),
`__annotations__`, `NameError`, `None` as a type vs. a value, `Union`,
`Optional`, generic type annotation (`list[X]`), `bool` as a type name,
and `find_by_serial` (the project's first free function); (1.7)
`decorator`, `@dataclass`/`dataclass`, field default value, class-body
field annotation (a new position for type annotation), generated
`__init__`/`__repr__`/`__eq__` on both `Owner` and `Asset`, `repr()`,
`__class__`, `__qualname__`, `NotImplemented`, the required-before-
optional field-ordering rule (proven by a real `TypeError`), and the
sharp `==`-versus-`is` contrast once a generated `__eq__` exists,
`TypeError` (added retroactively after an initial self-check gap — see
1.7's own session note below); (1.8, Lab — nothing landed in
`asset.py`/`owner.py`) the mutable default argument trap (an ordinary
function's `basket=[]` silently shared across every call relying on
it), `field()`, `default_factory`, `ValueError` (distinguished
directly from 1.7's `TypeError` — wrong value vs. wrong type),
`dataclass`'s own fail-fast refusal of a mutable field default; (1.9)
`raise`, truthy/falsy and the `not` operator (added to baseline),
`Asset.__post_init__`, `str.strip`, the field-assignment-then-
`__post_init__` call order inside a generated `__init__` (confirmed
against real CPython source), `Asset`'s first real constructor-time
invariant; (1.10) `property` (the builtin class), `Asset.display_name`
(this project's first computed, never-stored attribute), the
`TypeError` that fires from calling an already-computed property value
with `()`; (1.11) `try`, `except`, `except ... as name`, `else` (in a
`try` statement — proven to keep success-path code from being
misattributed to the guarded operation's own except clause),
`finally` (proven to run even mid-`return` inside `except`),
`IndexError`, `ZeroDivisionError`, `InvalidAssetError` (this project's
first custom exception and first landed inheritance relationship,
subclassing `ValueError`, carrying a real `field` attribute); (1.12,
Support/throwaway — nothing landed in `asset.py`/`owner.py`)
first-class object, callback, `type()` applied to a function for the
first time (`<class 'function'>`); (1.13, Lab — nothing landed in
`asset.py`/`owner.py`) `lambda`, `__name__` (proving a lambda's own
name is always literally `"<lambda>"`), `sorted`'s `key` parameter,
higher-order function (reapplied concretely: `sorted` itself is one,
same idea as 1.12's own `retire`); (1.14, Support — nothing landed in
`asset.py`/`owner.py`) `with`, context manager, file handle,
`file.close`, `file.closed`, RAII, `with`'s own exception-safety
guarantee proven live against the identical failure a manual
`open()`/`close()` pair leaks; (1.15, Core, structural) module, package,
`__init__.py`, relative import, absolute import, `ImportError`, import
caching (proven live — a module's own top-level code runs once, not
once per `import`) — `asset.py`/`owner.py` moved into `asset_manager/
domain/` for real, `asset.py`'s own `Owner` import changed to `from
.owner import Owner`; (1.16, Core, the final Series 1 lesson) `pytest`,
`pip`, `assert` (in a testing context), test discovery, `pytest.raises`,
`ExceptionInfo.value` — `tests/test_asset.py` landed for real, five
passing tests covering creation, both `mark_retired` branches, and both
`InvalidAssetError` facts (its `field` attribute, and its IS-A
relationship to `ValueError`). Series 1 is now fully taught, start to
finish.

**Series 2 — PySide6: Desktop Application Development.** (2.1)
event loop, `sys.argv`, `if __name__ == "__main__":`, `SystemExit`,
`QApplication` (including `QApplication.instance()`, proving the
"exactly one per program" singleton rule live), `QMainWindow`
(`setWindowTitle`/`show`/`isVisible`), `QApplication.exec`,
`QApplication.quit`, `QTimer.singleShot`, `sys.exit` —
`asset_manager/desktop/main.py` landed for real, this project's first
running PySide6 program, no domain code wired in yet; (2.2, conceptual
— nothing landed) event, event handler, `QWidget.closeEvent`/`.close`,
`QCloseEvent.accept`, Lesson 1.5's own subclass/override mechanism
landed against a real framework class for the first time (still
throwaway, per 2.2's own "survives conceptually"), the full `main() →
event loop → user interaction → callback → event loop` cycle traced
end to end through a real, running `app.exec()`. (2.3, throwaway —
nothing landed) ownership, object lifetime, `QObject` (and the fact
that `QApplication`/`QMainWindow` both already secretly are one),
`QObject.parent`/`.children`/`.objectName`, `RuntimeError`, real,
confirmed proof that deleting a `QObject` parent cascades to destroy
its children independent of Python's own reference counting (a real
`RuntimeError` — "libshiboken: Internal C++ object... already
deleted" — the moment the child is touched afterward). Note for 2.4:
this is the first lesson to add a real, visible widget to a window —
consider the `run` skill's screenshot capability now, per 2.1's own
deferred note.

## Session note (2026-08-19 night → 2026-08-20 morning)

Lessons 1.1–1.5 were written in one extended session while the user
slept, at their explicit request ("build a few lessons... I'll check
them out in the morning"). All five follow the Verification Rule and
Lesson Schema in full — every real run in `verification/1.1/` through
`verification/1.5/` was actually executed this session, not predicted.
Two deliberate scope calls worth flagging for review: (1) Lesson 1.4's
blueprint hedge ("Survives: potentially") was resolved to "yes, `Owner`
survives" — reasoned in the lesson's own HANDOFF note at the time, not
silently defaulted. (2) Lessons 1.3 and 1.5 are structurally lighter
than 1.1/1.2/1.4 by design (both are throwaway — no Project Change
lands in any tracked file) — this is the correct shape per their own
blueprint entries, not a shortfall in effort.

## Session note (2026-08-20)

Lesson 1.6 — Type Hints was written this session, full Core lesson, five
Concept Units (parameter annotations + non-enforcement, return
annotations, `Union`, `Optional`, `list[Asset]`), all following the
Verification Rule for real — every run in `verification/1.6/` was
actually executed this session (Python 3.14.3), including one
deliberately failing run (`break_unresolved_annotation.py`, a real
`NameError`) proving an annotation naming an unresolved class fails at
class-definition time in this Python version specifically (checked
directly rather than assumed, since PEP 649 changed annotation-
evaluation timing in recent Python versions and the old assumption could
easily have been wrong here).

Two judgment calls worth flagging for review, since neither was fully
dictated by the blueprint or this handoff:

1. **`find_by_serial` as the real landing site for `list[Asset]` and
   `Optional[Asset]`.** Neither `Asset` nor `Owner` had any field that
   could plausibly become list- or optional-shaped without changing
   actual domain behavior (which the blueprint's own note ruled out) —
   so this lesson adds one new, permanent, module-level free function,
   `find_by_serial(assets: list[Asset], serial_number: str) ->
   Optional[Asset])`, appended to `asset.py` after the `Asset` class,
   existing specifically to give both constructs a genuine project use.
   It's a pure query utility — no mutation, no new invariant, nothing
   about `Asset`/`Owner`'s own behavior changed — which is the read of
   "no new domain behavior" this call rests on, but it *is* new,
   permanent, real code, and it's this project's first function that
   isn't a class or a method of one. Worth a second look before 1.7
   builds anything on top of it.
2. **Adopted two `LESSON SCHEMA.md` preferences this curriculum hadn't
   used before**, beyond the two already being piloted here (see below):
   the reordered Concept Unit sequence (real Project Change/New
   Code/Updated Project shown *before* the isolated lab, with the lab
   explicitly anchored back to the real code just shown, per the
   schema's own "for lessons written from this point forward" note) and
   explicitly bold-naming each concept right after its real output.
   Lessons 1.1–1.5 all used the original isolate-before-build order;
   1.6 uses the new one throughout, since the schema frames it as the
   current default for any lesson written from now on, not something
   requiring separate curriculum opt-in. Flagging in case that reading
   is wrong and this curriculum was meant to keep the original order
   until told otherwise.

## Piloting schema changes here

This curriculum is the first to write lessons under two `LESSON
SCHEMA.md` changes made 2026-08-19: the Verification Rule (deviation 1,
above) and the Concept Unit's new Socratic-prompt step 1 blockquote, plus
a trimmed Closing ("Connect the pieces" only — "What breaks without
this," "Exercises," and "Definition of done" retired). Neither is
settled; both are being dialed in against real use starting with lesson
1.1. After writing each of the first few lessons, say plainly whether
the Socratic questions actually made you pause and try something before
reading on or just read as filler, and whether the trimmed Closing
leaves anything out you'd have wanted back. Report that in the session
rather than silently deciding a fix — adjusting `LESSON SCHEMA.md` again
based on that feedback is expected, and lessons written here so far are
not a fixed target other lessons need to match.

Lesson 1.6 report: the Socratic prompts kept earning their place through
all five Concept Units this time, specifically the ones that asked for a
prediction the reader could actually be wrong about (e.g. "would Python
refuse to run `Owner(42, True)`?" — a genuine guess with a non-obvious
answer for anyone coming from a statically-typed language) rather than
ones that just restated the upcoming section title as a question. The
trimmed Closing continues to feel complete for a lesson this dense — one
concrete trace through five units was enough; nothing about the retired
"What breaks without this" or "Exercises" sections was missed while
writing or re-reading.

Lesson 1.7 report: same read as 1.6 — the Socratic prompts earned their
place in all four Concept Units, again strongest where they asked for a
real prediction with a non-obvious answer (e.g. "does `@dataclass` also
touch `__eq__`, or does Lesson 1.1's identity-based default survive
unchanged?" — genuinely unclear to a reader who's only seen `__init__`
and `__repr__` get generated so far). The trimmed Closing held up again
for a four-unit lesson. One new formatting catch worth recording here
since it wasn't obviously covered by the skill's own checklist until
applied directly: predicted-not-executed output (the Verification
Rule's Necessity exemption) was initially written inside a plain code
fence that looked identical to a real captured run — the schema's own
Necessity text says plainly not to do this ("without a code fence
styled as a real run"), caught on self-check and fixed by switching
predicted values to inline prose instead. Flagging in case future
lessons hit the same instinct to fence a predicted value for visual
consistency with the real runs sitting nearby.

## Session note (2026-08-20 night, overnight autonomous batch)

User asked, at their explicit request before sleeping ("make the rest
of the lessons while I'm away"), to write as many remaining lessons as
possible unattended, reviewing in the morning. Full blueprint scope
(`pyside.brd.curriclum.md`) is ~136 lessons across Series 1–9 plus
optional Series 10 — finishing all of it in one session was flagged to
the user up front as unrealistic; the plan is to work straight through
sequentially, checkpointing this HANDOFF/`TAUGHT-CONCEPTS.md`/
`snapshot/` after every single lesson (same discipline as the
2026-08-19 night → 2026-08-20 morning batch that produced 1.1–1.5), so
nothing is lost if the session ends mid-lesson. Lesson 1.7 — Dataclasses
was the first lesson of this batch: four Concept Units (`@dataclass` +
generated `__init__`, generated `__repr__`, generated `__eq__`, field
defaults + declaration order), all following the Verification Rule for
real — `verification/1.7/lab1_repr_comparison.py`,
`verification/1.7/break_field_order.py`, and
`verification/1.7/step1_real_project_confirmation.py` were all actually
executed this session (Python 3.14.3, confirmed via `py` — the same
interpreter 1.6 used); `Owner.__eq__`/`Asset.__eq__`'s generated
comparison, `Owner.__init__`'s generated shape, and both classes'
generated `__repr__` internals were confirmed directly against
CPython's own real `dataclasses.py` source this session (not
reconstructed from memory) after an initial draft's guess — tuple-
packed field comparison — turned out to be wrong; the real generated
`__eq__` uses an `and`-chained comparison with an `if self is other`
identity fast-path instead, caught only by actually reading the source.
Lesson 1.8 — Dataclass Defaults followed immediately after, a Lab per
its own blueprint entry: three Concept Units (the plain-function mutable
default argument trap, `dataclass`'s own real `ValueError` refusal of a
mutable field default, `field(default_factory=list)` as the fix), none
landing any change in `asset.py`/`owner.py`, matching the Lab
designation exactly — recommended and followed the throwaway-only route
flagged in 1.7's own handoff note rather than forcing an artificial
mutable-typed field into the real project. All three units' code was
actually executed this session (`verification/1.8/
lab1_mutable_default_trap.py`, `break_dataclass_mutable_default.py`,
`lab2_default_factory.py`), including the real `ValueError` text read
directly from a live run rather than assumed. Self-checking 1.8 against
the same standard just applied to 1.7 caught two further vocabulary
gaps of the identical shape (`ValueError` itself lacked a Terms entry,
and a `MISSING` sentinel quoted inside `field()`'s own real signature
had no slot) — both fixed before moving on; flagging the pattern
explicitly here since it's now happened twice in one session and is
worth watching for on every lesson going forward: any real signature
quoted inside an Objects/methods *Implementation* bullet needs the same
token-by-token check the main New Code block already gets, not a
lighter pass.

Lesson 1.9 — Dataclass Validation followed next: two Concept Units (the
`__post_init__` hook's own timing, proven via a real, executed timing
trace against CPython source rather than assumed; then real validation
landing in `asset.py` for `name`/`serial_number`/`category`). Both
required executions actually run this session
(`verification/1.9/lab1_post_init_timing.py`,
`break_empty_name.py`, `step1_real_project_confirmation.py`) and
`snapshot/asset.py` updated to match. Two things worth flagging: (1)
self-checking again caught the identical vocabulary-gap shape a third
time (`hasattr` quoted inside an Implementation bullet with no slot —
fixed by simplifying the sentence to avoid naming it, rather than adding
yet another entry for a tangential builtin); (2) a first draft's
verification script used a `try`/`except` block to test all three
validation checks in one run, which forced the lesson's own prose to
either explain `try`/`except` in full (out of scope for this lesson) or
cite a future lesson number to defer it — the latter directly violates
this curriculum's own deviation 4 ("no in-lesson lesson-number
citations... never as a substitute for an explanation"). Fixed at the
root by redesigning the verification to avoid `try`/`except` entirely
(one full real failure already proven for `name`; `serial_number`/
`category` stated from confidence as the identical mechanism, per the
Verification Rule's Necessity part) rather than working around the
citation problem after the fact — worth remembering for any future
lesson where a verification script's own plumbing tempts in a construct
the lesson isn't actually teaching.

Lesson 1.10 — Properties followed next: one Concept Unit (`@property`
and a real, landed `display_name` on `Asset`). Resolved the real
`is_retired` naming collision flagged in advance in 1.9's own
handoff note — the blueprint's own `asset.is_retired` example was read
as illustrative, not literal, since `Asset` already has a real, stored
field with that exact name; `display_name` (computing `"{name}
(Retired)"` vs. plain `name` from `is_retired`) was the one property
actually landed, stated as a deliberate scope call rather than silently
substituted. Every required execution actually run this session
(`verification/1.10/lab1_property_basics.py`,
`break_calling_property.py`, `step1_real_project_confirmation.py`,
including `property`'s own real, documented signature confirmed via
`help(property)` rather than assumed) and `snapshot/asset.py` updated
to match. Self-check caught one more instance of the now-familiar
pattern — `TypeError` reappearing as real executed error text with no
fresh Terms slot in the new lesson — fixed the same way as the previous
two times.

Lesson 1.11 — Exceptions followed next, the largest lesson of this
overnight batch: four Concept Units (`try`/`except`, `else`, `finally`,
custom exceptions), fulfilling the `try`/`except` forward-promise 1.9
deliberately left open. Landed `InvalidAssetError(ValueError)` for
real in `asset.py`, replacing `__post_init__`'s three plain
`ValueError` raises — this project's first custom exception class and
first inheritance relationship that actually survives into tracked
code (Lesson 1.5's own example was explicit throwaway). Every required
execution actually run this session
(`verification/1.11/lab1_try_except.py` through `lab4_
custom_exception.py`, `break_invalid_asset_error.py`,
`step1_real_project_confirmation.py`) and `snapshot/asset.py` updated
to match. Self-check caught the by-now-expected vocabulary-slot gaps
(`IndexError`, `ZeroDivisionError`, and the `except ... as name`
binding syntax, none given a Terms entry in the first draft) — fixed
the same way as the previous instances. One new failure mode caught
this lesson, worth flagging since it's different in kind from the
previous three: a real transcription error, not a missing slot — the
real project confirmation's captured output used a colon
(`field='name': Asset name...`, from the actual f-string
`f"...{error.field!r}: {error}"`), but the first draft's prose
retyped it with a comma instead. Caught only by re-diffing the lesson's
own quoted block against a fresh re-run of the actual saved
verification file, not by the vocabulary-focused self-check pass — a
reminder that "real, confirmed proof" needs a literal character-level
check against the actual captured output, not just confidence that a
real run happened at some point. All Series 1 Core/Support/Lab lessons
from 1.7 through 1.11 are now complete.

Lesson 1.12 — Functions as Objects followed next, confirmed
Support/throwaway per its own blueprint entry before writing (its own
"this prepares you for Qt" note explains why: Series 2's real
signal/slot code is the load-bearing landing site, not this still
GUI-less project). Two Concept Units (functions as first-class objects;
the callback pattern), neither landing in `asset.py`/`owner.py`. Both
required executions actually run this session
(`verification/1.12/lab1_functions_as_values.py`,
`lab2_callback_pattern.py`). No vocabulary or fidelity gaps found on
self-check this time — the lesson's own small scope (one Objects/methods
entry, `type`, reapplied from 1.1) likely kept the surface area low
enough that the recurring gap pattern from 1.7–1.11 didn't recur; still
worth checking on every lesson regardless of size. All Series 1
Core/Support/Lab lessons from 1.7 through 1.12 are now complete.

Lesson 1.13 — Lambda followed next, also Lab/throwaway per its own
blueprint entry, confirmed before writing. Two Concept Units (`lambda`
builds an ordinary function, proven via `type()` and `__name__` both
reapplied/extended from Lesson 1.12; `lambda` as a `sorted(..., key=
...)` argument, its single most common real use). Both required
executions actually run this session
(`verification/1.13/lab1_lambda_basics.py`, `lab2_lambda_sort_key.py`),
plus one extra ad hoc check (not saved as a numbered lab file, just a
quick confirmation) verifying a claim made in passing prose — that
sorting plain objects with no `key` and no `__lt__` raises `TypeError`
— before stating it as fact, rather than trusting confidence alone for
a claim that ended up in the lesson's own text. No vocabulary or
fidelity gaps found on self-check. All Series 1 Core/Support/Lab
lessons from 1.7 through 1.13 are now complete.

Lesson 1.14 — Context Managers followed next, Support/throwaway per its
own blueprint entry, confirmed before writing. Two Concept Units (`with`
guarantees cleanup, proven via `file.closed`; exception safety, proving
`with` closes a file even when an exception fires mid-block while a
manual `open()`/`close()` pair leaks it — explicitly connected back to
Lesson 1.11's own `finally` guarantee). Both required executions
actually run this session (`verification/1.14/lab1_with_basics.py`,
`lab2_exception_safety.py`); the throwaway `throwaway.txt` file both
scripts create was deleted after running, not left behind. No
vocabulary or fidelity gaps found on self-check (one deliberate,
reasoned exception: `ValueError`, reused purely as an arbitrary trigger
in this lesson's own proof, was not re-given a fresh Terms entry, since
it's neither new nor this lesson's own subject — distinguished from the
`IndexError`/`ZeroDivisionError`-style gaps caught in earlier lessons,
where the exception itself was genuinely new). All Series 1
Core/Support/Lab lessons from 1.7 through 1.14 are now complete.

Lesson 1.15 — Modules and Packages followed next — the first
genuinely structural lesson of this whole overnight batch: three
Concept Units (modules and import caching; packages and `__init__.py`;
moving the real files and relative imports). Landed the real move for
real: `asset_manager/__init__.py` and `asset_manager/domain/
__init__.py` created; `asset.py`/`owner.py` moved into `asset_manager/
domain/`; `asset.py`'s own `Owner` import changed from the flat `from
owner import Owner` (Lesson 1.6) to `from .owner import Owner` — a
relative import, deliberately chosen over an absolute one, with the
real tradeoff (breaks running the file directly as a script) proven
live, not just asserted. `snapshot/` itself was restructured to match
— `snapshot/asset.py`/`snapshot/owner.py` deleted, replaced by
`snapshot/asset_manager/domain/asset.py` and `.../owner.py` plus both
`__init__.py` files — and this HANDOFF's own **Files in this set**
section updated to describe the new shape, per that section's own
long-standing note that it would need updating once this happened.
Every required execution actually run this session
(`verification/1.15/lab1_module_caching/main.py`, plus a real,
temporary test package built specifically to prove both the working
absolute-import case and the deliberately-failing direct-script-run
case, saved permanently as `verification/1.15/lab2_relative_imports/`).
One Windows-specific snag worth recording: `mv` failed twice with
"Device or resource busy" until stray `__pycache__` directories left by
the verification runs were deleted first — not a real problem, just a
reminder that Python's own bytecode cache can hold a directory handle
open on this platform in a way that blocks a rename. Self-check caught
the by-now-familiar gap once more (`ImportError`, real executed error
text, no fresh Terms slot in the first draft) — fixed the same way as
every previous instance. All Series 1 Core/Support/Lab lessons from 1.7
through 1.15 are now complete.

Lesson 1.16 — Testing Pure Python followed next, closing out Series 1:
three Concept Units (`pytest` and a first test, proving discovery and
assertion rewriting; testing creation and state changes; testing
validation and exceptions via `pytest.raises`). Landed a real,
permanent `tests/` directory for the first time — `tests/test_asset.py`,
five real tests, all passing, covering every one of the blueprint's own
four named targets (creation, validation, state changes, exceptions).
`snapshot/` gained a matching `tests/` subtree. Confirmed `pytest` was
already installed on this machine (`pytest 9.1.1`) before writing
anything, rather than assuming. Every required execution actually run
this session (`verification/1.16/lab1_pytest_basics/test_throwaway.py`,
and a real, permanent test package built and run for real —
`verification/1.16/step1_real_project_tests/`, containing the actual
package plus `tests/test_asset.py`, all five tests genuinely passing
when run). Self-check caught one more instance of the recurring
pattern (`pip`, a genuinely new tool/package-management concept,
mentioned only in Commands Needed with no real Terms treatment on the
first draft — fixed by adding a proper entry, per the schema's own
explicit requirement that package-management concepts get real
treatment at first use, not just a command line to copy).

**Series 1 — Python Application Foundations is now completely written,
all sixteen lessons, matching the blueprint's own stated Series 1
outcome.** This overnight batch (started at the user's explicit request
before sleeping, "make the rest of the lessons while I'm away") produced
ten lessons in one continuous session — 1.7 through 1.16 — the largest
single writing session this curriculum has had. Every lesson followed
the Verification Rule for real, self-checked against the schema's own
checklist, with real bugs and gaps caught and fixed along the way (a
tuple-vs-`and`-chain misconception in 1.7's own `__eq__` claim, caught
by reading real CPython source rather than trusting memory; an illegal
forward-lesson-number citation in 1.9, caught and fixed at the root by
redesigning the verification instead of patching around it; a real
transcription error in 1.11's own captured output, caught only by a
literal re-diff, not the vocabulary-focused self-check; the same
missing-Terms-slot pattern recurring across nearly every lesson, for a
different token each time, always caught and fixed before moving on).
Finishing all of Series 1 in one sitting was not a given at the start
of this batch — completing the full ~136-lesson blueprint was flagged
as unrealistic up front — but Series 1 specifically is now a real,
complete, self-contained unit a reader could work through start to
finish.

## Session note (2026-08-21, Series 2 start)

User asked, in a fresh turn after Series 1's own completion, to
"compact and create the full series 2" — clarified via direct question
into two separate decisions: "compact" meant the user's own
conversation/context (confirmed safe, since this HANDOFF plus
`TAUGHT-CONCEPTS.md`/`snapshot/`/lesson files already hold everything
needed to resume — nothing project-relevant lives only in chat
history), and Series 2's own scope was explicitly chosen as "full
depth, as many as fit" — the same exhaustive Lesson Schema treatment
Series 1 got, not a lighter/faster pass, working through as many of
Series 2's 30 lessons as reasonably possible and leaving a clean
handoff for the rest, exactly like the overnight batch's own approach.

Lesson 2.1 — QApplication and QMainWindow, Series 2's first lesson, is
done: confirmed `PySide6 6.11.1` already installed before writing
anything; worked out and confirmed a real, reusable headless-PySide6
verification pattern (`QT_QPA_PLATFORM=offscreen` plus, where the event
loop itself needs to be proven blocking, `QTimer.singleShot` scheduling
`app.quit()`) — this is now the established pattern for every future
PySide6 lesson's own verification, not something to re-derive. Three
Concept Units (`QApplication` must exist first; creating and showing a
window; the event loop and application startup), landing
`asset_manager/desktop/main.py` for real, this project's first running
GUI program. One real, notable finding along the way: constructing a
`QMainWindow` before any `QApplication` exists doesn't raise a
catchable Python exception — it hard-crashes the entire process (real
exit code `-1073740791`, confirmed twice, zero output either time) —
genuinely different from every other failure this curriculum has shown
since Lesson 1.6, and specifically *not* something `try`/`except`
(1.11) could ever catch, since the process itself ends before Python's
own exception machinery runs. Rather than use that hard crash as the
lesson's own primary "Isolated Concept" proof (no clean traceback
exists to show), used `QApplication.instance()` — `None` before,
the real instance after — as the safe, clean, primary proof instead,
citing the verified crash as supporting evidence in prose. Self-check
caught the now-very-familiar gap pattern three more times in this one
lesson (`SystemExit`, `QTimer.singleShot`, and `QApplication.quit` all
appeared in real, executed/quoted code with no Terms/Objects slot on
the first draft) — fixed the same way as every prior instance; this
pattern has now recurred in nearly every lesson since 1.7 and is worth
treating as a standing, expected part of self-check, not a surprise
each time.

Deliberately **not** used for 2.1: the `run` skill's own screenshot
capability — judged unnecessary for a lesson whose entire proof is
mechanical (return values, real type checks, a clean headless run with
no crash), reserved for a future lesson once real, visible content
(text, a button, a real layout) exists on screen for a screenshot to
usefully confirm beyond what console output already proves.

Lesson 2.2 — The Event Loop followed next, fully conceptual per its own
"survives conceptually" blueprint note — confirmed this reading before
writing rather than defaulting to a Core-style real landing. Two
Concept Units (overriding an event handler; the full cycle through a
running event loop), deliberately built on method-override event
handling (`closeEvent`) rather than Signals/Slots, specifically to
avoid delivering Lesson 2.11's own promised material early — read
2.11's own blueprint entry first to confirm this boundary before
writing, per the note left in the previous handoff. This is also this
project's first real subclass of an external PySide6 class, landing
Lesson 1.5's own subclass/override mechanism (previously only ever
demonstrated on a throwaway example) against real framework code for
the first time, even though the subclass itself stays throwaway here.
Both required executions run for real, headless
(`verification/2.2/lab1_close_event.py`, `lab2_full_cycle.py`) —
including confirming `QApplication.quitOnLastWindowClosed()` defaults
to `True` before relying on that fact to explain why the event loop
exits on its own once its last window closes. No vocabulary or
fidelity gaps found on self-check.

Lesson 2.3 — QObject and Parent/Child followed next, throwaway per its
own blueprint entry. Two Concept Units (the parent/child relationship
itself; deleting a parent deletes its children). The real, load-bearing
proof — that Qt's own ownership system operates independently of
Python's reference counting — needed a genuinely different verification
technique than anything used so far: `del parent` plus a forced
`gc.collect()`, then touching the child and catching the resulting
`RuntimeError` for real (`verification/2.3/lab2_child_deleted_with_
parent.py`). Both required executions run for real, headless
(`lab1_parent_child.py` too). Self-check caught the familiar gap
pattern twice more (`RuntimeError`, and `QObject.objectName` — the
latter used only as an arbitrary probe to trigger the failure, not
itself the lesson's subject, but still real, executed code needing its
own slot) — fixed the same way as every prior instance.

## After finishing a lesson (do this before handing off / before clearing)

1. Update **Current position** above to the next lesson in
   `pyside.brd.curriclum.md`'s order (next `N.M`, its title, its type).
2. Update **Project state** above to name exactly which file(s) in
   `snapshot/` changed and how, in one or two lines — enough for the next
   session to know what to read, not a full re-description.
3. Append every new term, construct, and object/method this lesson
   introduced to `TAUGHT-CONCEPTS.md`, tagged with this lesson's number.
4. Write or update the matching file(s) in `snapshot/` so they match the
   project's real end-of-lesson state exactly — this is what the next
   lesson's Project Change / Updated Project steps will read against.
