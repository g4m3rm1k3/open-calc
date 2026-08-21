# Taught Concepts Log

Flat, append-only log of every term, construct, and object/method already
introduced somewhere in this curriculum. This is bookkeeping only — per
the Lesson Schema's Repetition Rule, a reappearing concept still gets
full, real treatment in every lesson that reuses it. This file exists
solely so that the new-vs-reappearing judgment call (needed to decide how
a lesson's code splits into Concept Units, per the Recursive Concept
Extraction Rule) never requires opening an old lesson file.

Format: `- concept — introduced Lesson N.M`

Append to this file at the end of every lesson. Do not remove or edit
past entries except to fix an error.

---

## Series 1 — Python Application Foundations

- `class` keyword — introduced Lesson 1.1
- instance — introduced Lesson 1.1
- `pass` statement — introduced Lesson 1.1
- `self` — introduced Lesson 1.1
- instance attribute — introduced Lesson 1.1
- method — introduced Lesson 1.1
- `is` (identity operator) — introduced Lesson 1.1
- `==` default (identity-based) equality — introduced Lesson 1.1
- implicit inheritance from `object` — introduced Lesson 1.1
- dunder method — introduced Lesson 1.1
- `__init__` (constructor) — introduced Lesson 1.1
- `object` (built-in base class) — introduced Lesson 1.1
- `__bases__` — introduced Lesson 1.1
- `type()` builtin — introduced Lesson 1.1
- `AttributeError` — introduced Lesson 1.1
- `Asset.__init__` — introduced Lesson 1.1
- `Asset.describe` — introduced Lesson 1.1
- `return` keyword — introduced Lesson 1.1
- `bool` (boolean type/literal) — introduced Lesson 1.2
- default attribute value (not from a constructor parameter) — introduced Lesson 1.2
- state-changing method (mutator) — introduced Lesson 1.2
- invariant — introduced Lesson 1.2
- guard clause — introduced Lesson 1.2
- `if` conditional — introduced Lesson 1.2 (added to assumed baseline scope)
- `Asset.mark_retired` — introduced Lesson 1.2
- class attribute — introduced Lesson 1.3
- mutable / immutable — introduced Lesson 1.3
- attribute shadowing — introduced Lesson 1.3
- attribute lookup (instance-then-class fallback) — introduced Lesson 1.3
- `__dict__` — introduced Lesson 1.3
- `list` literal (`[]`) / `.append()` — introduced Lesson 1.3 (added to assumed baseline scope)
- mutable-class-attribute trap — introduced Lesson 1.3 (Lab, throwaway — no project code)
- composition — introduced Lesson 1.4
- HAS-A relationship — introduced Lesson 1.4
- `Owner.__init__` — introduced Lesson 1.4
- `Asset.__init__` — owner param — introduced Lesson 1.4 (Asset.__init__ itself first introduced 1.1)
- subclass / parent class (base class) — introduced Lesson 1.5 (Support, throwaway — no project code)
- IS-A relationship — introduced Lesson 1.5 (throwaway)
- overriding — introduced Lesson 1.5 (throwaway)
- `super()` — introduced Lesson 1.5 (throwaway)
- `for` loop / `in` (iteration) — introduced Lesson 1.6 (added to assumed baseline scope, same as `if` in 1.2 and list literals/`.append()` in 1.3 — general Python fluency below the level of classes, not re-taught)
- Python `import` statement — introduced Lesson 1.6 (added to assumed baseline scope — the mechanism itself is general Python fluency; its first real appearance connecting two project files, via `from owner import Owner`, is the lesson's own new architectural fact, not the syntax)
- type annotation (parameter position) — introduced Lesson 1.6
- return type annotation (`->`) — introduced Lesson 1.6
- `__annotations__` — introduced Lesson 1.6
- `NameError` — introduced Lesson 1.6
- `None` as a type (inside `Union`/`Optional`, distinct from `None` the value) — introduced Lesson 1.6
- `Union` (`typing.Union`) — introduced Lesson 1.6
- `Optional` (`typing.Optional`) — introduced Lesson 1.6
- generic type annotation (`list[X]`) — introduced Lesson 1.6, explicitly distinguished from `[]`/`.append()`'s own runtime list-building (Lesson 1.3)
- `bool` as a type name in annotation position — introduced Lesson 1.6 (value form introduced Lesson 1.2)
- `Owner.__init__` / `Asset.__init__` / `Asset.describe` / `Asset.mark_retired` — parameter and return annotations added Lesson 1.6 (methods themselves introduced 1.1/1.2/1.4)
- `find_by_serial` (free function, first non-method function in this project) — introduced Lesson 1.6
- `decorator` (`@name` syntax; sugar for `name = decorator_func(name)` applied to the thing below it) — introduced Lesson 1.7
- `dataclass` / `@dataclass` (decorator function from the `dataclasses` stdlib module; reads a class's own `__annotations__` and generates `__init__`/`__repr__`/`__eq__` by default) — introduced Lesson 1.7
- type annotation, class-body field position (bare `name: Type` line directly inside a class body, no `def` — distinct from Lesson 1.6's parameter/return positions) — introduced Lesson 1.7
- field default value (`= value` after a class-body field's annotation, e.g. `is_retired: bool = False`) — introduced Lesson 1.7
- generated `__repr__` (dataclass-produced string representation, `ClassName(field=value, ...)`, contrasted for real against `object`'s own address-based default) — introduced Lesson 1.7
- generated `__eq__` (dataclass-produced field-value equality — `and`-chained field comparisons with an `if self is other` identity fast-path, confirmed against real CPython source; sharply overturns Lesson 1.1's identity-based default `==` for `Owner`/`Asset` specifically) — introduced Lesson 1.7
- `repr()` (builtin function calling an object's own `__repr__`) — introduced Lesson 1.7
- `__class__` (real per-object attribute naming the exact class that built it) — introduced Lesson 1.7
- `__qualname__` (real per-class attribute holding its own name as a string, read live by generated `__repr__`) — introduced Lesson 1.7
- `NotImplemented` (builtin singleton a dunder comparison method returns to defer to the other operand — not `NotImplementedError`) — introduced Lesson 1.7
- `TypeError` (built-in exception; here raised by `dataclass` itself when a required field follows a defaulted one) — introduced Lesson 1.7
- required-before-optional field/parameter ordering rule (a dataclass field with a default must not precede one without; enforced by `dataclass` itself with a real `TypeError`, proven live against Python 3.14.3) — introduced Lesson 1.7
- `Owner.__init__` / `Asset.__init__` — generated, not hand-written, as of Lesson 1.7 (methods themselves introduced 1.1/1.4)
- `Owner`/`Asset` both converted to `@dataclass` — Lesson 1.7 (`Asset.describe`/`Asset.mark_retired`/`find_by_serial` unaffected, still ordinary methods/free function in the same files)
- mutable default argument trap (an ordinary function's default parameter value, when mutable, is evaluated once at `def`-time and silently shared across every call relying on it) — introduced Lesson 1.8 (Lab, throwaway — no project code)
- `field()` (from `dataclasses`; configures a single field's behavior beyond a plain `= value` default) — introduced Lesson 1.8 (Lab, throwaway)
- `default_factory` (`field()` keyword argument naming a zero-argument callable invoked fresh per instance) — introduced Lesson 1.8 (Lab, throwaway)
- `ValueError` (built-in exception; right type, wrong/unacceptable value — distinguished from Lesson 1.7's `TypeError`) — introduced Lesson 1.8 (Lab, throwaway)
- `dataclass`'s own fail-fast refusal of a mutable field default (real `ValueError`, proven live) — introduced Lesson 1.8 (Lab, throwaway)
- `raise` (statement; immediately stops execution and hands control to the nearest matching handler, or terminates with a traceback — the mechanism behind every exception seen so far, used by this project's own code for the first time) — introduced Lesson 1.9
- truthy/falsy, and the `not` operator (added to baseline scope) — introduced Lesson 1.9
- `Asset.__post_init__` (dataclass's own lifecycle hook, called automatically as the literal last line of the generated `__init__`, confirmed against real CPython source) — introduced Lesson 1.9
- `str.strip()` — introduced Lesson 1.9
- `Asset`'s first real constructor-time invariant (non-blank `name`/`serial_number`/`category`, enforced via `__post_init__`, raising `ValueError`) — introduced Lesson 1.9 (`Owner` deliberately left unvalidated — scope boundary, not oversight)
- `property` (built-in class; `@property` turns a method into attribute-style, no-parentheses access) — introduced Lesson 1.10
- `Asset.display_name` (this project's first computed, never-stored attribute — derives `"{name} (Retired)"` vs. plain `name` from `is_retired` on every read) — introduced Lesson 1.10
- `try` / `except` (attempt code that might raise; catch and recover instead of crashing) — introduced Lesson 1.11
- `except ... as name` (binds the actual caught exception instance to a local name) — introduced Lesson 1.11
- `else` in a `try` statement (runs only if the `try` block raised nothing; keeps success-path code from being misattributed to the guarded operation's own `except`) — introduced Lesson 1.11
- `finally` (runs unconditionally, even mid-`return` inside `except` — proven live) — introduced Lesson 1.11
- `IndexError`, `ZeroDivisionError` (built-in exceptions) — introduced Lesson 1.11
- `InvalidAssetError(ValueError)` — this project's first custom exception class and first landed inheritance relationship (Lesson 1.5's own example was throwaway); carries a real `field: str` attribute alongside its message; raised by `Asset.__post_init__` in place of 1.9's plain `ValueError` — introduced Lesson 1.11
- first-class object (assignable, storable, passable value — proven of an ordinary function via `type()`, `<class 'function'>`) — introduced Lesson 1.12 (Support, throwaway — no project code)
- callback (a function passed as an argument specifically so the receiver can call it later, at a moment of its own choosing) — introduced Lesson 1.12 (Support, throwaway)
- `lambda` (builds a nameless, single-expression function inline; genuinely the same real `function` type a `def` produces) — introduced Lesson 1.13 (Lab, throwaway)
- `__name__` (real per-function attribute; a lambda's own is always the literal string `"<lambda>"`) — introduced Lesson 1.13 (Lab, throwaway)
- `sorted`'s `key` parameter / higher-order function, reapplied concretely (a function receiving another function, same idea as Lesson 1.12's `retire`) — introduced Lesson 1.13 (Lab, throwaway)
- `with` statement / context manager (`__enter__`/`__exit__`, guaranteed cleanup at block exit, including on exception) — introduced Lesson 1.14 (Support, throwaway)
- file handle, `file.close`, `file.closed` — introduced Lesson 1.14 (Support, throwaway)
- RAII (Resource Acquisition Is Initialization) — introduced Lesson 1.14 (Support, throwaway)
- module (any single `.py` file, considered as something importable) — introduced Lesson 1.15
- import caching (a module's top-level code runs once, at first import, never again on later imports — proven live) — introduced Lesson 1.15
- package / `__init__.py` (a directory containing `__init__.py` becomes importable as a namespace) — introduced Lesson 1.15
- relative import (`from .sibling import X`) / absolute import (`from pkg.sub.module import X`) — introduced Lesson 1.15
- `ImportError` — introduced Lesson 1.15
- `asset.py`/`owner.py` moved into `asset_manager/domain/` for real; `asset.py`'s `Owner` import changed to `from .owner import Owner` — Lesson 1.15 (first structural, not just content, project change)
- `pytest` (third-party testing framework; test discovery via `test_*.py`/`test_*` naming; assertion rewriting on plain `assert`) — introduced Lesson 1.16
- `pip` (Python's own package installer, bundled with Python; `pip install pytest` was this project's first third-party dependency) — introduced Lesson 1.16
- `assert` (in a testing context) — introduced Lesson 1.16
- `pytest.raises` / `ExceptionInfo.value` (context manager for testing that a block raises an expected exception; `.value` reads the actual caught instance) — introduced Lesson 1.16
- `tests/test_asset.py` — five real, permanent, passing tests covering `Asset` creation, both `mark_retired` branches, `InvalidAssetError`'s `field` attribute, and its IS-A relationship to `ValueError` — introduced Lesson 1.16

**Series 1 — Python Application Foundations: complete (Lessons 1.1–1.16).**

## Series 2 — PySide6: Desktop Application Development

- event loop (waits for and dispatches events — clicks, key presses, timers, an explicit stop request — until told to stop) — introduced Lesson 2.1
- `sys.argv` — introduced Lesson 2.1
- `if __name__ == "__main__":` (reapplies Lesson 1.15's own module `__name__` material) — introduced Lesson 2.1
- `SystemExit` (built-in exception; `sys.exit`'s own real mechanism) — introduced Lesson 2.1
- `QApplication` (including `QApplication.instance()`, proving the "exactly one per program" singleton rule live) — introduced Lesson 2.1
- `QMainWindow`, `.setWindowTitle`, `.show`, `.isVisible` — introduced Lesson 2.1
- `QApplication.exec` (starts the real, blocking event loop) — introduced Lesson 2.1
- `QApplication.quit`, `QTimer.singleShot` (verification-only mechanism to end a blocking event loop automatically; reapplies Lesson 1.12's own callback/first-class-function material) — introduced Lesson 2.1
- `sys.exit` — introduced Lesson 2.1
- `asset_manager/desktop/main.py` — this project's first running PySide6 program (bare `QMainWindow`, no domain code wired in) — introduced Lesson 2.1
- Established verification pattern for this series: `QT_QPA_PLATFORM=offscreen` + `QTimer.singleShot`-scheduled `app.quit()` to make a blocking event loop provably testable — set Lesson 2.1, reuse directly in future PySide6 lessons rather than re-deriving
- event (a single occurrence the event loop dispatches — distinct from the loop itself) — introduced Lesson 2.2 (conceptual, throwaway — no project code)
- event handler (`closeEvent`; a method Qt calls automatically by reserved name, same shape as `__post_init__`) — introduced Lesson 2.2 (conceptual, throwaway)
- `QWidget.closeEvent`, `QWidget.close`, `QCloseEvent.accept` — introduced Lesson 2.2 (conceptual, throwaway)
- this project's first real subclass of an external PySide6 class (`LoudWindow(QMainWindow)`, throwaway) — Lesson 1.5's own subclass/override mechanism landed against real framework code for the first time — introduced Lesson 2.2 (conceptual, throwaway)
- full `main() → event loop → user interaction → callback → event loop` cycle traced live through a genuinely running `app.exec()` — Lesson 2.2 (conceptual, throwaway)
- ownership / object lifetime (Qt's own parent/child tracking, distinct from Python's reference counting) — introduced Lesson 2.3 (throwaway, no project code)
- `QObject`, `.parent`, `.children`, `.objectName` — introduced Lesson 2.3 (throwaway)
- `RuntimeError` — introduced Lesson 2.3 (throwaway)
- real, confirmed proof that deleting a `QObject` parent cascades to destroy its children independent of Python's own reference counting (real `RuntimeError` via `del` + forced `gc.collect()`) — Lesson 2.3 (throwaway)
- `QLabel` — this project's first real, visible widget — introduced Lesson 2.4 (Lab, throwaway)
- real, confirmed proof that a child widget's own `isVisible()` depends on its parent's shown state, not only itself (`False` before parent `show()`, `True` after) — Lesson 2.4 (throwaway)
- `QPushButton` — this project's first real, permanent, interactive widget (`hasattr(button, "clicked")` is `True`; identical check on `QLabel` is `False`) — introduced Lesson 2.5; landed in `asset_manager/desktop/main.py`, not connected to anything yet (deliberately deferred to Lesson 2.11)
- `hasattr` — introduced Lesson 2.5
- `QLineEdit`, `.setPlaceholderText`/`.placeholderText` — this project's first widget holding real, caller-editable content; real, confirmed proof placeholder text and real text are tracked as genuinely separate facts, neither containing the other — introduced Lesson 2.6; landed in `asset_manager/desktop/main.py`, not connected to anything yet (deliberately deferred to Lesson 2.11, same boundary generalized to every widget's signals, not just `QPushButton`'s)
- `QComboBox`, `.addItems`, `.currentText`/`.itemText`/`.count`/`.setCurrentIndex` — this project's first closed/enumerated-choice widget, contrasted against `Asset.category`'s own open `str` field; real, confirmed proof a `QComboBox` with any items always has a current selection — introduced Lesson 2.7; landed in `asset_manager/desktop/main.py`, populated with a hard-coded category list, not connected to anything yet
- layout, central widget — introduced Lesson 2.8
- `QVBoxLayout`, `QHBoxLayout`, `.addWidget`, `.addLayout`, `.count`, `QWidget.setLayout`, `QMainWindow.setCentralWidget` — introduced Lesson 2.8
- real, confirmed proof that `layout.addWidget(...)` silently reparents a widget to the layout's own owning widget, even through nested layouts — Lesson 2.8
- `asset_manager/desktop/main.py` restructured for real: `button`/`search_box`/`category_box` moved from direct `window` parenting into a real nested layout (`search_row` inside `main_layout` inside `central`), `window.setCentralWidget(central)` — Lesson 2.8 (first structural refactor of this file since 2.1)
- form (a UI arrangement pairing each field with its own caption) — introduced Lesson 2.9
- `QFormLayout`, `.addRow`, `.labelForField`, `.rowCount` — real, confirmed proof `addRow` builds a genuine, independently retrievable `QLabel` from a plain string — introduced Lesson 2.9
- `asset_manager/desktop/asset_editor.py` — this project's second real module inside `desktop/`; `build_asset_editor() -> QWidget` returns a standalone, unconnected Asset editor (name/serial number/category fields) — introduced Lesson 2.9; not imported by `main.py`, not connected to the "Add Asset" button
- `QGridLayout`, `.addWidget(widget, row, column)`, `.itemAtPosition`, `.rowCount`/`.columnCount` — introduced Lesson 2.10 (Lab, throwaway — no project code)
- `QCheckBox` — introduced Lesson 2.10 (Lab, throwaway)
- real, confirmed proof `QGridLayout` silently accepts two widgets claiming the identical position, tracking both but resolving position queries to whichever was added first — Lesson 2.10 (throwaway)
- signal, slot (Observer pattern; distinct from "event"/"event handler," Lesson 2.2) — introduced Lesson 2.11
- `QPushButton.clicked` (fully explained; bare existence first proven Lesson 2.5), `Signal.connect`, `QPushButton.click` (headless click simulation) — introduced Lesson 2.11
- `weakref.ref` — introduced Lesson 2.11
- real, confirmed proof (via `weakref` + forced `gc.collect()`) that a widget opened inside a plain slot function with no persistent reference is silently garbage-collected the instant the function returns, even though it was shown successfully — Lesson 2.11
- `MainWindow(QMainWindow)` — this project's first subclass of an external framework class in permanent code (Lesson 2.2's own subclass was throwaway); `super().__init__()` reapplied against real Qt for the first time — introduced Lesson 2.11
- `asset_manager/desktop/main.py` restructured for real: every widget now a real `self.<name>` instance attribute, `self.button.clicked` connected to `self.open_asset_editor`, `self.editor` storing the opened editor (the real fix for the GC gotcha above), `asset_editor.py` (2.9) finally imported and called — Lesson 2.11
- signal argument (a real value a signal hands its slot alongside the bare fact it fired) — introduced Lesson 2.12
- `QLineEdit.textChanged` (fully explained) — introduced Lesson 2.12
- real, confirmed proof a slot may accept fewer parameters than a signal provides (extras silently dropped) but never more (real `TypeError`) — Lesson 2.12
- real, confirmed proof a slot's own exception does not crash the whole PySide6 application (caught internally, printed, execution continues) — Lesson 2.12
- `self.search_box.textChanged.connect(self.on_search_text_changed)`, `self.current_search_text` — landed for real in `asset_manager/desktop/main.py` — Lesson 2.12
- `lambda` (reapplied in full against Qt's own `connect(...)` calls), closure — introduced Lesson 2.13 (Lab, throwaway — no project code)
- real, confirmed proof of the classic loop-variable-closure bug (lambdas built in a loop, referencing the loop variable directly, all report the same, final value once the loop finishes) — Lesson 2.13 (throwaway)
- real, confirmed proof that fixing the above with a default-argument binding alone isn't enough — `QPushButton.clicked`'s own always-carried `checked: bool` argument silently fills whatever parameter position comes first, requiring `checked=False` to be placed ahead of the loop-bound default deliberately — Lesson 2.13 (throwaway)
- `Signal` (from `PySide6.QtCore`), custom signal declaration as a class-level attribute (`asset_submitted = Signal(str, str, str)`), on a `QObject`-derived class — introduced Lesson 2.14 (throwaway proof: `Doorbell(QObject)`); landed for real in `asset_manager/desktop/asset_editor.py`
- `SignalInstance` — the real, distinct object a class-level `Signal` becomes once accessed through an instance rather than the class itself, confirmed via `type(doorbell.pressed)` — introduced Lesson 2.14
- `Signal.emit` — introduced Lesson 2.14; landed for real via `AssetEditor.on_save_clicked`
- subclassing `QObject` directly, with no widget behavior at all — introduced Lesson 2.14 (throwaway, `Doorbell(QObject)`)
- `asset_editor.py`'s `build_asset_editor()` free function rewritten into a real `AssetEditor(QWidget)` class (required for `Signal` to be declarable at all); every field becomes a `self.` instance attribute — landed for real Lesson 2.14
- `QFormLayout.addRow`'s single-argument overload (`addRow(widget)`, no label, spans the full row) — introduced and landed for real Lesson 2.14, alongside the already-taught two-argument form (2.9)
- `QLineEdit.text`/`QLineEdit.setText`, `QComboBox.currentText` — full CRC treatment Lesson 2.14 (all three reapplied from 2.6/2.7)
- `MainWindow.on_asset_submitted`, `self.submitted_assets` — landed for real in `asset_manager/desktop/main.py` — Lesson 2.14; deliberately raw, unvalidated tuples, not real `Asset` objects — closed by Lesson 2.15
- __validator__, `QRegularExpression`, `QRegularExpressionValidator`, `QValidator.validate`, `QValidator.State` (`Invalid`/`Intermediate`/`Acceptable`) — introduced Lesson 2.15 (throwaway proof, `lab1_qregularexpressionvalidator.py`); landed for real via `serial_number_field.setValidator(...)` in `asset_manager/desktop/asset_editor.py`
- `QLineEdit.setValidator`/`QLineEdit.validator` — introduced and landed for real Lesson 2.15
- __UI-level validation__ vs. __domain-level (business) validation__ — the blueprint's own named distinction, landed as two real, separate, independently-verified mechanisms — Lesson 2.15
- `Asset`/`Owner`/`InvalidAssetError` actually imported and constructed from `asset_manager/desktop/main.py` — the desktop layer reaching `asset_manager.domain` for the first time ever — Lesson 2.15; `MainWindow.on_asset_submitted` rewritten: real `Asset` construction inside `try`/`except InvalidAssetError as error:`, success → `self.submitted_assets`, failure → new `self.validation_errors`
- `PLACEHOLDER_OWNER` — an explicitly-named, honest placeholder `Owner` constant, since this project has no owner-selection UI yet — Lesson 2.15
- package-relative execution (`python -m package.module`, contrasted against `python script.py`) — real, unavoidable mechanical fact surfaced by importing `asset_manager.domain` from `main.py` for the first time; confirmed both ways (old invocation fails with `ModuleNotFoundError`, new invocation succeeds) — Lesson 2.15; `main.py`'s own `asset_editor` import changed to package-relative (`from .asset_editor import AssetEditor`, reapplying 1.15) as a necessary consequence
- __modal__, dialog result, `QDialog`, `QDialog.exec`, `QDialog.accept`/`QDialog.reject`, `QDialog.result`, `QDialog.DialogCode` (`Rejected = 0`, `Accepted = 1`) — introduced Lesson 2.16 (throwaway proof, `lab1_qdialog_exec.py`, using `QTimer.singleShot` pre-scheduled before a blocking `.exec()` call — the same technique used since 2.1 for `app.exec()`); landed for real: `AssetEditor(QWidget)` → `AssetEditor(QDialog)` in `asset_manager/desktop/asset_editor.py`, with a new "Cancel" `QPushButton` wired to `self.reject`
- nested (re-entrant) event loop — the CS concept underneath `QDialog.exec()`'s own blocking behavior — Lesson 2.16
- `QMessageBox`, `QMessageBox.warning` (`staticmethod`, reapplying 1.3), `QMessageBox.text`, `QMessageBox.button`/`QMessageBox.StandardButton` (`.Ok = 1024`) — introduced Lesson 2.16 (throwaway proof, `lab2_qmessagebox_warning.py`); landed for real via `MainWindow.on_asset_submitted`'s own new `QMessageBox.warning(self.editor, "Invalid Asset", str(error))` call
- `QApplication.activeModalWidget` — real verification-only tool, since `QMessageBox.warning` never returns a direct reference to the dialog it builds internally — introduced Lesson 2.16
- `MainWindow.on_asset_submitted` now controls `AssetEditor`'s own dialog lifecycle from outside: `self.editor.accept()` on success, `QMessageBox.warning(...)` with no `accept`/`reject` on failure (dialog stays open) — landed for real Lesson 2.16; `AssetEditor` deliberately stays non-modal (`.show()`, not `.exec()`) to keep the project's established fill-then-submit verification pattern working — a real, named tradeoff
- __mnemonic__/__accelerator__ (`&` in a `QAction`'s own text), `QAction` (from `PySide6.QtGui`, not `QtWidgets`), `QAction.triggered`, `QAction.trigger`, `QAction.setEnabled`/`QAction.isEnabled` — introduced Lesson 2.17 (throwaway proof, `lab1_qaction_menu.py`, reapplying Lesson 2.11's own `weakref`/`gc.collect()` technique to prove a `QAction` with an explicit parent survives without a `self.` attribute); landed for real in `asset_manager/desktop/main.py`
- Command pattern — a real "thing that can be done" encapsulated as its own object, independent of any widget presenting it — Lesson 2.17
- `QMainWindow.menuBar`, `QMenuBar`/`QMenuBar.addMenu`, `QMenu`/`QMenu.addAction`/`QMenu.addSeparator` — introduced and landed for real Lesson 2.17; `MainWindow`'s first real menu bar, a `File` menu with `New`/`Edit`/`Delete`/`Exit`
- `QWidget.close` (`self.close()`) — reapplied in full for the first time from this project's own code, confirmed to genuinely dispatch `closeEvent` (2.2) and, since `MainWindow` is the project's only top-level window, genuinely end `app.exec()` via Qt's own default `quitOnLastWindowClosed` policy — Lesson 2.17 (throwaway proof, `lab2_exit_via_close.py`); landed for real via `exit_action.triggered.connect(self.close)`
- `edit_action`/`delete_action` built as real, visible, `setEnabled(False)` menu entries — the honest, deliberate answer to having no selectable asset list yet — Lesson 2.17
- __key sequence__, `QKeySequence` (literal-string and `QKeySequence.StandardKey` constructor forms), `QKeySequence.StandardKey`, `QAction.setShortcut`/`QAction.shortcut` — introduced Lesson 2.18 (throwaway proof, `lab1_qaction_shortcut.py`); landed for real: `new_action.setShortcut(QKeySequence(QKeySequence.StandardKey.New))`, `exit_action.setShortcut(QKeySequence("Ctrl+Q"))`
- real, checked-not-assumed platform fact: `QKeySequence.StandardKey.Quit` resolves to a special `Key_Exit` key, not `Ctrl+Q`, on this project's own real platform — `StandardKey.New` was separately confirmed correct (`Ctrl+N`) before being relied on — Lesson 2.18
- __deprecated__, `QWidget.addAction`, `QTest.keyClick` (from `PySide6.QtTest`, first use), `QApplication.setActiveWindow` (deprecated, verification-only, needed to force active-window state in headless/offscreen mode) — introduced Lesson 2.18 (throwaway proof, `lab2_shortcut_actually_fires.py`)
- real, load-bearing confirmation: a `QAction` reachable only through a `QMenu` (2.17), with no direct `QWidget.addAction` call, still has its own keyboard shortcut fire window-wide — proven against the actual, complete project, not assumed from the simpler isolated lab — Lesson 2.18
- __Model/View architecture__, `QStandardItemModel`, `QStandardItem`, `QTableView`/`QTableView.setModel` — introduced Lesson 2.19 (throwaway proof, `lab1_qtableview_model.py`); landed for real: `self.assets_model`/`self.assets_table` in `asset_manager/desktop/main.py`
- `QAbstractItemModel.rowCount`/`columnCount`/`index`, `QModelIndex.data`, `headerData` — the real, shared method family every Qt model (including Lesson 2.20's own custom one) implements — introduced Lesson 2.19
- Model/View pattern (CS Lens) — separating data storage from visual presentation so either can change independently — Lesson 2.19
- `MainWindow.on_asset_submitted` mirrors each successfully validated `Asset` into `self.assets_model` via `appendRow` — landed for real Lesson 2.19; real, named, temporary duplication between `self.assets_model` and `self.submitted_assets`, explicitly closed by Lesson 2.20's own custom `QAbstractTableModel`
- `QAbstractTableModel` (subclassed for the first time), `rowCount`/`columnCount`/`data`/`headerData` (implemented, not just called), `Qt.ItemDataRole` (`DisplayRole`) — introduced Lesson 2.20 (throwaway proof, `lab1_asset_table_model.py`); landed for real as `AssetTableModel` in new file `asset_manager/desktop/asset_table_model.py`
- live/computed view vs. cached duplicate (CS Lens) — a model reading real data fresh on every call, with nothing stored separately — Lesson 2.20
- `QAbstractItemModel.beginInsertRows`/`endInsertRows`, `rowsInserted` signal — introduced Lesson 2.20 (throwaway proof, `lab2_notifying_the_view.py`, contrasted against `break_mutate_without_notifying.py` proving a silent mutation leaves `rowCount()` correct but `rowsInserted` never fires); landed for real via `AssetTableModel.add_asset`
- `self.submitted_assets` and `self.assets_model._assets` are literally the same list object (confirmed `is`, not just `==`) — real duplication genuinely removed, not relocated — Lesson 2.20; `on_asset_submitted`'s own two old lines (2.19) collapsed into one: `self.assets_model.add_asset(asset)`
- `Qt.ItemDataRole.EditRole`/`.ToolTipRole` (reappearing `DisplayRole` contrasted against both) — a model can answer genuinely different real values for the same cell depending on which role is asked — introduced Lesson 2.21 (throwaway proof, `lab1_display_vs_edit_role.py`)
- `Qt.AlignmentFlag` (a combinable "flag" enum, distinct from ordinary one-at-a-time enums like `Qt.ItemDataRole`), `|`/`&` for combining and decomposing flags, bit flag (CS Lens) — introduced Lesson 2.21 (throwaway proof, `lab2_alignment_role.py`)
- `Asset.display_name` (1.10) reused from `asset_manager/desktop/` for the first time — `AssetTableModel.data`'s `DisplayRole` answer for the Name column, contrasted against `EditRole`'s own plain `asset.name` — landed for real Lesson 2.21; confirmed to genuinely diverge only after `Asset.mark_retired()` (1.2) is called, with no manual refresh needed anywhere
- `AssetTableModel.data` rewritten as a real three-way `role` dispatch (`DisplayRole`/`EditRole`/`TextAlignmentRole`) — landed for real Lesson 2.21; `Serial Number` column right-aligned; real, honest gap named: no `flags()` override yet, so no cell is actually editable despite `EditRole` being correctly implemented — Lesson 2.22's own job

## Series 3 — SQL and Persistence

_(empty)_

## Series 4 — Desktop + Database Integration

_(empty)_

## Series 5 — HTTP and APIs

_(empty)_

## Series 6 — FastAPI

_(empty)_

## Series 7 — Full Application Integration

_(empty)_

## Series 8 — Professional Software Engineering

_(empty)_

## Series 9 — Deployment

_(empty)_
