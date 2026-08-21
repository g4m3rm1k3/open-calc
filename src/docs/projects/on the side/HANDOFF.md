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

**Next lesson to write:** `2.15 — Input Validation` (Series 2, Core)

**Blueprint entry:** `pyside.brd.curriclum.md`, section "SERIES 2 —
PySide6: Desktop Application Development" → "## 2.15 — Input
Validation." Learn: validators, UI-level validation, domain-level
validation. Important distinction: "UI validation ≠ business
validation." **Survives.** Real scope this lesson has to resolve:
`AssetEditor.on_save_clicked` (2.14) currently emits whatever raw text
sits in `name_field`/`serial_number_field`, unvalidated — that's this
lesson's own real starting gap, named honestly in 2.14's own closing.
Two real, separate things the blueprint's own distinction implies need
landing: (1) UI-level validation — likely a real `QValidator` (or
similar Qt-level mechanism) on `AssetEditor`'s own `QLineEdit` fields,
catching obviously-malformed input before it's ever submitted at all;
(2) domain-level validation — `MainWindow.on_asset_submitted` (2.14)
currently just appends a raw tuple to `self.submitted_assets`; this is
the real, natural moment to construct an actual `Asset` (1.7) from that
tuple and let `Asset.__init__`'s own real `InvalidAssetError` (1.11)
fire on bad input, catching it explicitly rather than letting it
crash. Real, open structural question for next session: `QDialog`
(2.16, several lessons away) doesn't exist yet, so there's no real
"show the user an error" UI to reach for yet — decide plainly what
`on_asset_submitted` does with a caught `InvalidAssetError` right now
(store it somewhere inspectable, print it, a new `self.validation
_errors` list) versus what's honestly deferred to 2.16, the same
"selected patterns" honesty 2.14 itself already modeled.

**Note on 2.14, now resolved:** landed per blueprint's own "selected
patterns survive" hedge — three Concept Units (declaring a custom
signal in isolation; the Asset editor becoming a class; MainWindow
listening). Real, structural decision made and executed:
`asset_editor.py`'s own `build_asset_editor()` free function (2.9)
became a real `AssetEditor(QWidget)` class — required because `Signal`
can only be declared at class level — carrying a new `asset_submitted
= Signal(str, str, str)`, a new "Save" `QPushButton`, and a new
`on_save_clicked` slot emitting all three field values together; every
field `build_asset_editor()` built as a local variable became a real
`self.` instance attribute, the identical fix Lesson 2.11 already
proved necessary, now needed for the identical reason (a separate
method reading them later). `MainWindow.open_asset_editor` (2.11) now
connects `self.editor.asset_submitted` to a new `on_asset_submitted`
slot, which appends the three raw strings as a plain tuple to a new
`self.submitted_assets` list — deliberately *not* a real `Asset`, and
deliberately unvalidated, both explicitly left as this lesson's own
open gap for 2.15 to close, stated plainly in 2.14's own closing rather
than hidden. A genuine vocabulary gap caught mid-draft, not on
self-check: `QLineEdit.text`/`setText` and `QComboBox.currentText`
appeared in the isolated-proof code with no Header entry on the first
pass — fixed by adding full CRC entries for all three, and by removing
an unverified, unnecessary `QComboBox.setCurrentText` call entirely
once `currentText()`'s own already-proven real default (`"Laptop"`,
2.7) made it redundant. `QFormLayout.addRow`'s own single-argument
overload (no label, spanning the full row) — genuinely new to this
project — was verified for real (`labelForField` returns `None` for
it) before being explained, and given its own Header entry alongside
its already-taught two-argument form (2.9).

**Project state:** `asset_manager/desktop/__init__.py` and
`asset_manager/desktop/main.py` (2.1, restructured 2.11, extended 2.14)
— a real, permanent PySide6 entry point. `main.py` now defines
`MainWindow(QMainWindow)`: `__init__` calls `super().__init__()`, sets
the window title, builds `self.button`/`self.search_box`/
`self.category_box` (all real instance attributes, not local
variables), connects `self.button.clicked.connect
(self.open_asset_editor)` and `self.search_box.textChanged.connect
(self.on_search_text_changed)`, builds the same `search_row`/
`main_layout`/`central` structure Lesson 2.8 landed, sets
`self.editor = None`, `self.current_search_text = ""`, and, new in
2.14, `self.submitted_assets = []`; `open_asset_editor(self)` builds a
real `AssetEditor()` (2.9, converted to a class in 2.14; import changed
from `build_asset_editor` to `AssetEditor`), connects
`self.editor.asset_submitted.connect(self.on_asset_submitted)`, then
shows it; `on_asset_submitted(self, name, serial_number, category)`
(new, 2.14) appends the three raw strings as a plain tuple to
`self.submitted_assets` — deliberately not a real `Asset`, deliberately
unvalidated, both explicitly 2.15's own job. `main()` itself is still
three lines: build `MainWindow()`, show it, run `app.exec()`. 2.2, 2.3,
and 2.4 were all conceptual/throwaway, nothing landed from any of them.
`category_box` still doesn't feed into anything; `search_box`/
`category_box` still don't feed into any real search/filter behavior
yet — no connection to `asset_manager.domain` at all.
`asset_manager/desktop/asset_editor.py` (2.9, rewritten 2.14) — no
longer a free function: `AssetEditor(QWidget)` is a real class.
`__init__` calls `super().__init__()`, sets the window title, builds
`self.name_field`/`self.serial_number_field` (`QLineEdit`),
`self.category_field` (`QComboBox`, same five-item list), and a new
`self.save_button` (`QPushButton("Save")`, connected to
`self.on_save_clicked`), arranges all four via `QFormLayout(self)`
(three labeled rows via the two-argument `addRow`, plus
`form.addRow(self.save_button)` — the single-argument form, no label).
Declares `asset_submitted = Signal(str, str, str)` at class level;
`on_save_clicked(self)` emits it with `self.name_field.text()`,
`self.serial_number_field.text()`, `self.category_field.currentText()`.
Genuinely imported and called by `main.py`. `asset_manager/domain/asset.py` and
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
mirrors this exact layout, `asset_manager/desktop/` (2.1, 2.5–2.9,
restructured 2.11, 2.12, 2.14) included — see **Files in this set**
above. Read `snapshot/asset_manager/desktop/main.py` and `snapshot/
asset_manager/desktop/asset_editor.py` before writing 2.15 — both
already carry `submitted_assets`/`on_asset_submitted` and
`AssetEditor`'s own real shape, exactly what 2.15's own domain-level
validation needs to build on.

**Taught concepts so far:** `TAUGHT-CONCEPTS.md`'s Series 1 section
lists everything introduced through Lesson 1.16 — all of Series 1 — and
its new Series 2 section lists Lessons 2.1–2.14: (1.1) `class`, instance,
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
deleted" — the moment the child is touched afterward). (2.4, Lab,
throwaway — nothing landed) `QLabel` — this project's first real,
visible widget, real, confirmed proof that a child widget's own
`isVisible()` depends on its parent's shown state, not only its own.
(2.5, Core, real landing) `QPushButton`, `hasattr` — real, confirmed
proof that a fresh `QPushButton` already carries a real `clicked`
attribute a `QLabel` doesn't, checked without connecting or explaining
it — `asset_manager/desktop/main.py` gained its first widget since
2.1, still inert. (2.6, Core, real landing) `QLineEdit`,
`setPlaceholderText`/`placeholderText` — real, confirmed proof that
placeholder text and real text are tracked as genuinely separate
facts, neither ever containing the other, even after real text is set.
Resolved the open "is reading QLineEdit's text still 2.11's territory"
question by generalizing the boundary: *no* widget's signals get
connected before 2.11, regardless of which specific widget or which
specific signal — not a button-only rule. (2.7, Core, real landing)
`QComboBox`, `addItems`, `currentText`/`itemText`/`count`/
`setCurrentIndex` — real, confirmed proof a `QComboBox` with any items
always has a current selection (`"Laptop"`, the first item, with
nothing explicitly selected), the enumerated/closed-choice contrast
against `Asset.category`'s own open `str` field named directly in
prose rather than resolved by importing the domain layer early. (2.8,
Core, real landing — structural refactor) layout, central widget,
`QVBoxLayout`, `QHBoxLayout`, `QWidget.setLayout`, `QMainWindow
.setCentralWidget` — real, confirmed proof that `layout.addWidget(...)`
silently reparents a widget to the layout's own owning widget, even
through nested layouts (`search_box`, two levels deep, still ends up
parented directly to `central`). `button`/`search_box`/`category_box`
no longer parented directly to `window` in their own constructors —
final ownership now comes entirely from the layout structure. The
`run`-skill screenshot question, deferred five times since 2.1, was
finally closed with reasoning rather than deferred again: this lesson's
own claims are structural, already fully proven by property checks, so
no screenshot was needed. (2.9, Core, real landing — new file)
`QFormLayout`, `.addRow`, `.labelForField`, `.rowCount`, form — real,
confirmed proof `addRow("Name:", field)` builds a genuine,
independently retrievable `QLabel` from a plain string, distinct from
`QVBoxLayout`/`QHBoxLayout`'s own behavior. `asset_manager/desktop/
asset_editor.py` — this project's second real module inside
`desktop/`, `build_asset_editor() -> QWidget`, a standalone, unconnected
Asset editor (three fields: name, serial number, category) reapplying
1.15's own module-splitting reasoning for the first time in the desktop
layer. (2.10, Lab, throwaway — nothing landed) `QGridLayout`,
`.addWidget(widget, row, column)`, `.itemAtPosition`, `QCheckBox` —
real, confirmed proof `QGridLayout` silently accepts two widgets
claiming the identical position, with no error or warning, tracking
both (`count()`) while a position query resolves only to whichever was
added first. (2.11, Core, real landing — major structural refactor)
signal, slot, `QPushButton.clicked` (fully explained, reapplying 2.5's
own bare-existence proof), `Signal.connect`, `QPushButton.click`
(headless click simulation), `weakref.ref`, `MainWindow(QMainWindow)`
— this project's first subclass of an external framework class in
*permanent* code — `super().__init__()` reapplying 1.5's own material
against real Qt for the first time. Real, load-bearing, genuinely
surprising proof: a widget opened inside a plain slot function with no
persistent reference is silently garbage-collected the instant the
function returns (proven via `weakref` + `gc.collect()`), fixed by
storing it as `self.editor` on the persistent `MainWindow` instance.
Every widget from `button` through `category_box` is now a real
`self.<name>` instance attribute; `main.py` finally imports and calls
`build_asset_editor()` (2.9), closing the gap that lesson's own SE Lens
named directly. (2.12, Core, real landing) signal argument,
`QLineEdit.textChanged` (fully explained) — real, confirmed proof a
slot may accept fewer parameters than a signal provides (extras
silently dropped) but never more (a real `TypeError`, same kind as
Lesson 1.7's first appearance of it) — and, genuinely surprising, that
a slot's own exception doesn't crash the whole application, unlike
every uncaught exception elsewhere in this curriculum since Lesson
1.6. `self.search_box.textChanged.connect(self.on_search_text_changed)`
landed for real, `self.current_search_text` kept live across multiple
changes. (2.13, Lab, throwaway — nothing landed) `lambda` (reapplied
in full against Qt's own `connect(...)`), closure — real, confirmed
proof of the classic loop-variable-closure bug (three buttons all
reporting the same, final loop value) and its real, two-part fix: a
default-argument binding (`name=name`) alone isn't enough, since
`QPushButton.clicked`'s own real `checked: bool` argument (2.12's own
material, never actually read before now) silently lands in whatever
parameter position comes first unless `checked=False` is deliberately
placed there ahead of the loop-bound value. Note for 2.14: "selected
patterns survive," genuinely different from every prior lesson's own
type note — see Current position above for the real, open structural
question (does `asset_editor.py` need a real class now, to have
somewhere to declare a class-level `Signal`).

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

Lesson 2.4 — QLabel followed next, Lab/throwaway per its own blueprint
entry, one Concept Unit (a real, visible widget). Real, notable finding
worth the lesson's own core proof: a `QLabel` parented to a not-yet-
shown `QMainWindow` reports `isVisible()` as `False` even though
nothing told the label itself to hide — only `False` → `True` once the
*parent* window's own `show()` runs, confirmed live
(`verification/2.4/lab1_qlabel.py`). Considered the `run` skill's
screenshot capability again, per 2.1's own deferred note — deferred a
second time, judged unnecessary for a throwaway lesson whose entire
proof is already real, checkable properties (text, parent identity,
conditional visibility), not appearance itself. No vocabulary or
fidelity gaps found on self-check.

Lesson 2.5 — QPushButton followed next, Series 2's first real,
permanent landing since 2.1. One Concept Unit (a real, interactive
widget), landing `QPushButton("Add Asset", window)` in `main()`. Two
real, deliberate scope decisions, both reconsidered from the previous
handoff's own open questions and resolved differently than first
suggested: (1) no `MainWindow` subclass introduced — a plain local
variable was sufficient, since nothing yet needs cross-method widget
access; (2) `button.clicked` deliberately left unconnected, confirmed
against 2.11's own blueprint wording ("Connect buttons to application
behavior") before concluding this is genuinely 2.11's own scope, not
an oversight — proved the real, structural difference between
`QPushButton` and `QLabel` instead (`hasattr(button, "clicked")`)
without touching signal/slot mechanics at all. Both required executions
run for real, headless (`verification/2.5/lab1_qpushbutton.py`,
`step1_real_project_confirmation/main.py` under an external timeout,
identical pattern to 2.1's own). `snapshot/asset_manager/desktop/
main.py` updated to match. No vocabulary or fidelity gaps found on
self-check.

Lesson 2.6 — QLineEdit followed next, one Concept Unit (editable,
placeholder-backed text), landing `QLineEdit(window)` with a real
placeholder in `main()`, continuing 2.5's own "no subclass, no signal
connections yet" discipline without re-litigating it. Real, load-bearing
proof: `search_box.text()` starts as `''`, not the placeholder text
itself, and setting real text afterward leaves `placeholderText()`
completely unchanged — the two facts genuinely never collide, confirmed
live rather than assumed from how placeholders "usually work." Both
required executions run for real, headless
(`verification/2.6/lab1_qlineedit.py`, `step1_real_project_
confirmation/main.py` under a timeout). `snapshot/asset_manager/
desktop/main.py` updated to match. No vocabulary or fidelity gaps found
on self-check.

Lesson 2.7 — QComboBox followed next, one Concept Unit (a fixed set of
choices), landing `QComboBox(window)` populated with a hard-coded
category list in `main()`. Named the real, honest tension between
`Asset.category`'s own open `str` field and this widget's closed,
enumerated one directly in the lesson's own prose, resolved by keeping
the widget's own list plain and hard-coded rather than importing
`asset_manager.domain` early — consistent with every widget since 2.5.
Real, load-bearing proof: `currentText()` already reports `"Laptop"`
the instant real items exist, with no "nothing selected" state
`QLineEdit.text()` had — a `QComboBox` with any items always has a
current selection, confirmed live rather than assumed. Both required
executions run for real, headless (`verification/2.7/
lab1_qcombobox.py`, `step1_real_project_confirmation/main.py` under a
timeout). `snapshot/asset_manager/desktop/main.py` updated to match. No
vocabulary or fidelity gaps found on self-check.

Lesson 2.8 — Layouts followed next: the first structural refactor since
2.1, not just additive content. Two Concept Units (adding a widget to a
layout reparents it; a real, nested layout), landing a complete
restructuring of `main()` — `search_row`/`main_layout`/`central`,
`window.setCentralWidget(central)`, every existing widget's own
constructor call losing its `window` parent argument since final
ownership now comes from the layout itself. Real, load-bearing proof,
confirmed live rather than assumed: `layout.addWidget(...)` silently
reparents a widget to the layout's own owning widget, verified through
two nesting levels (a widget inside an inner `QHBoxLayout` inside an
outer `QVBoxLayout` still ends up parented directly to the real
top-level widget, not to either intermediate layout object). Made a
final, reasoned decision on the `run`-skill screenshot question,
deferred five times since 2.1: declined again, explicitly, since this
lesson's own claims are structural (parenting, layout membership),
already fully proven by property checks — no claim was made about
visual appearance needing a screenshot to back it up. This closes that
recurring open question rather than leaving it to keep re-surfacing.
Both required executions run for real, headless (`verification/2.8/
lab1_layout_reparenting.py`, `lab2_nested_layouts.py`,
`step1_real_project_confirmation/main.py` under a timeout). `snapshot/
asset_manager/desktop/main.py` updated to match. No vocabulary or
fidelity gaps found on self-check.

Lesson 2.9 — Form Layout followed next, landing this project's second
real module inside `desktop/`: `asset_manager/desktop/
asset_editor.py`, a standalone `build_asset_editor()` function, not yet
connected to `main.py` or the "Add Asset" button. Two Concept Units (a
real, automatic label; the Asset editor itself). Real, load-bearing
proof: `QFormLayout.addRow("Name:", field)` genuinely builds a real,
independently retrievable `QLabel` — `labelForField(field).text()`
reading back the exact string — something neither `QVBoxLayout` nor
`QHBoxLayout` (2.8) has ever done. Both required executions run for
real, headless (`verification/2.9/lab1_qformlayout.py`,
`step1_real_project_confirmation/confirm.py`). Caught one genuinely new
kind of self-check issue: the saved verification file initially printed
more lines than the lesson's own shown output (a leftover, more
convoluted label-checking approach using `itemAt`/`FieldRole`) — fixed
by trimming the saved file to match the lesson exactly, since those
extra checks were already redundant with Concept Unit 1's own proof,
rather than padding the lesson's own shown output to match the file.
`snapshot/asset_manager/desktop/asset_editor.py` created to match. No
other vocabulary or fidelity gaps found on self-check.

Lesson 2.10 — Grid Layout followed next, Lab/throwaway per its own
blueprint entry, confirmed before writing (its own "you don't need
mastery" note), kept genuinely small. Two Concept Units (explicit
row/column positioning; position collisions). Real, notable finding:
`QGridLayout` does not guard against two widgets claiming the identical
row/column at all — both are silently tracked (`grid.count()` reports
`2`), no error or warning either time, with only a position query
(`itemAtPosition`) revealing that the first one added is the one
actually resolved at that cell — confirmed live rather than assumed.
Both required executions run for real, headless
(`verification/2.10/lab1_qgridlayout.py`, `lab2_collision.py`). One
script was revised mid-verification: an initial `first.isVisible()`
check in the collision lab was dropped after running it, since it was
only re-testing Lesson 2.4's own already-established ancestor-visibility
fact rather than telling the reader anything new about the collision
itself — cut for focus, not because it failed. Self-check caught the
now-standard gap pattern once more (`QCheckBox`, real executed code
used only as incidental content, no slot on the first draft) — fixed
the same way as every prior instance.

Lesson 2.11 — Signals and Slots followed next: the largest, most
significant lesson of this Series 2 batch so far, "one of the major Qt
lessons" per its own blueprint entry. Three Concept Units (connecting a
signal to a slot; the garbage collection gotcha; a real `MainWindow`
and the real connection). Deliberately kept the first two units'
isolated labs free of any `Asset`/`Owner` flavor, per the plan, so the
mechanism itself stayed the visible subject rather than blending into
already-familiar domain shapes. The real, central finding — verified,
not assumed — is a genuine, silent PySide6 gotcha: a widget opened
inside a plain slot function, shown successfully (`isVisible()` reads
`True` *inside* the slot), is nonetheless garbage-collected the instant
that function returns if nothing outside it holds a reference,
confirmed via `weakref.ref` resolving to `None` after a forced
`gc.collect()`. This is also this project's first subclass of an
external, real PySide6 class landing in *permanent* code — Lesson
2.2's own subclass was explicitly throwaway, and the subclass question
itself had been deliberately deferred three separate times (2.1, 2.2,
2.5) before this lesson gave a real, concrete reason it was finally
needed. Landed the complete restructuring: every widget now a real
`self.<name>` attribute, `self.button.clicked` finally connected,
`asset_editor.py` (2.9) finally imported and called. All required
executions run for real, headless (`verification/2.11/
lab1_signal_slot_basics.py`, `lab2_gc_gotcha.py`, `lab3_gc_fix.py`,
`step1_real_project_confirmation/confirm.py` and `main.py` under a
timeout). `snapshot/asset_manager/desktop/main.py` updated to match.
Re-verified real-output fidelity carefully given this lesson's own
size (a real risk area per 1.11's own earlier session note) — no
transcription mismatches found. No vocabulary gaps found on self-check
either.

Lesson 2.12 — Arguments in Signals followed next: three Concept Units
(a signal handing its slot a real value; slot signature flexibility;
storing the real search text), landing `self.search_box.textChanged
.connect(self.on_search_text_changed)` and `self.current_search_text`.
Verified, rather than assumed, both directions of slot-signature
flexibility — a slot may take fewer parameters than a signal provides
(silently dropped) but not more (real `TypeError`) — and a genuinely
surprising, real finding: an exception raised inside a slot does not
crash the whole PySide6 application, unlike every uncaught exception
elsewhere in this curriculum since Lesson 1.6, since PySide6 catches it
internally and keeps running. All required executions run for real,
headless (`verification/2.12/lab1_signal_argument.py`,
`lab2_mismatched_slot.py`, `break_too_many_params.py`, `step1_real_
project_confirmation/confirm.py` and `main.py` under a timeout).
`snapshot/asset_manager/desktop/main.py` updated to match. Self-check
caught the now-standard gap once more (`TypeError`, reapplied from 1.7
but no fresh Terms entry on the first draft) — fixed the same way as
every prior instance.

Lesson 2.13 — Lambda Callbacks followed next, Lab/throwaway per its own
blueprint entry. Three Concept Units (a lambda carrying extra context;
the loop variable trap; binding the value, correctly). The real payoff
here was verifying a two-layered real bug rather than just warning
about "lambda soup" in the abstract: first, the classic loop-variable-
closure trap, proven live (three buttons built in a loop, each
connected to a lambda referencing the loop variable directly, all
reporting the *same*, final value when clicked); second, once the
standard `name=name` default-argument fix was applied on its own, a
*second*, genuinely surprising real bug appeared — `QPushButton
.clicked`'s own always-carried `checked: bool` argument (established
back in 2.12 but never actually read until this lesson) silently fills
whatever parameter position comes first, quietly overwriting the very
default the fix depends on unless `checked=False` is placed ahead of
it deliberately. Caught this by actually running the "almost-fixed"
version and observing it print `[False, False, False]` rather than
assuming the standard fix alone would work. All required executions
run for real, headless (`verification/2.13/lab1_lambda_connect.py`,
`break_loop_variable_capture.py`, `lab3_without_checked_param.py`,
`lab2_default_arg_fix.py`). No vocabulary or fidelity gaps found on
self-check.

Lesson 2.14 — Custom Signals followed next, Support per its own
blueprint entry, landed under the blueprint's own "selected patterns
survive" hedge rather than a clean Survives/Throw-away. Three Concept
Units: declaring a custom signal in isolation (`Doorbell(QObject)`,
`pressed = Signal(str)`, connect/emit proven exactly like a built-in
signal, plus `type(doorbell.pressed)` proving the real, load-bearing
distinction between the class-level `Signal` and the per-instance
`SignalInstance` it actually becomes once accessed through a real
object); the Asset editor becoming a class (`build_asset_editor()`,
2.9's free function, rewritten into `AssetEditor(QWidget)` — required
because `Signal` can only be declared on a class — carrying a new
`asset_submitted = Signal(str, str, str)`, a new "Save" `QPushButton`,
and `on_save_clicked` emitting all three field values); MainWindow
listening (`self.editor.asset_submitted.connect(self
.on_asset_submitted)`, added to `open_asset_editor`, with the new slot
appending a plain tuple to a new `self.submitted_assets` list). Real
judgment call, made and stated plainly in the lesson itself: the
submitted data does *not* become a real `Asset` (1.7) in this lesson —
`Asset.__init__`'s own real validation (1.11) means treating raw,
unchecked GUI strings as trustworthy domain data would be exactly the
UI-validation/business-validation conflation Lesson 2.15's own
blueprint entry exists to name and fix; 2.14's own closing says this
explicitly rather than leaving it implicit. Two real vocabulary/
verification catches during drafting, not just on self-check: (1) the
isolated-proof code called `QLineEdit.text`/`setText` and `QComboBox
.currentText` with no Header entry on the first pass — fixed with full
CRC entries for all three, reapplied from Lessons 2.6/2.7; (2) a first
draft called `QComboBox.setCurrentText("Laptop")` in the verification
scripts to explicitly select the category — caught as redundant and
removed once `currentText()`'s own already-proven real default (2.7)
made it unnecessary, avoiding introducing an unverified method with no
real teaching value here. `QFormLayout.addRow`'s single-argument
overload (no label, spanning the full row) was verified for real
(`labelForField` returns `None`) before being explained, and given its
own Header entry alongside the already-taught two-argument form.
Verification reorganized into `verification/2.14/lab1_custom_signal.py`
(throwaway), `step1_asset_editor_confirmation/` (real `asset_editor.py`
proof), and `step2_real_project_confirmation/` (full `main.py` +
`asset_editor.py` integration, plus the standing `timeout 3` sanity run
on the real `main.py`, exit code `124`, no crash).

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
