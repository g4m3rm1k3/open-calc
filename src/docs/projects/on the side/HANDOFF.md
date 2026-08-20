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
  whole tree.
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

**Next lesson to write:** `1.7 — Dataclasses` (Series 1, Core)

**Blueprint entry:** `pyside.brd.curriclum.md`, section "SERIES 1 —
Python Application Foundations" → "## 1.7 — Dataclasses." Convert
appropriate domain objects to `@dataclass`. Learn: generated `__init__`,
`repr`, equality. **Survives: yes.** `Asset` and `Owner` both already
have hand-written `__init__` methods that do nothing but assign
parameters to matching attributes — exactly the shape `@dataclass`
generates automatically — so this lesson's real work is likely
replacing that hand-written boilerplate and showing what's gained
(generated `__repr__`, generated `__eq__`) and what changes about
identity-vs-equality (Lesson 1.1 taught `==` as identity-based by
default for plain classes; a dataclass's generated `__eq__` compares
field values instead — a real, load-bearing contrast worth its own
Concept Unit, not a footnote). `find_by_serial` (added in 1.6) is a free
function, not a class, and is unaffected either way.

**Project state:** `snapshot/asset.py` — `Asset.__init__(self, name:
str, serial_number: str, category: str, owner: Owner) -> None` stores
all four (`owner` typed via `from owner import Owner`); `describe(self)
-> str` (1.1, read-only); `mark_retired(self) -> bool` (1.2, guarded).
Also now has a module-level free function, `find_by_serial(assets:
list[Asset], serial_number: str) -> Optional[Asset]` (1.6, imports
`Optional` from `typing`), appended after the class. `snapshot/owner.py`
— `Owner.__init__(self, name: str, email: str) -> None` stores both
(1.4). Every parameter and return value in both files is now annotated
(1.6) — the first lesson to touch every existing method's signature
without changing any method's body. Read both files before writing 1.7.

**Taught concepts so far:** `TAUGHT-CONCEPTS.md`'s Series 1 section
lists everything introduced through Lesson 1.6: (1.1) `class`, instance,
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
and `find_by_serial` (the project's first free function). Note for 1.7:
Lesson 1.1 taught `==` as identity-based *default* equality for plain
classes with no `__eq__` of their own — `@dataclass`'s generated
`__eq__` is exactly the case where that default no longer applies, so
1.7 needs to state plainly that dataclass equality is a genuinely
different mechanism from every `==` this curriculum has shown so far,
not an extension of it.

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
