# Lesson M2.4: A Test That Passes Only When Code Fails Correctly

*File paths under mastercam-app/... refer to the real manufacturing-platform repository's mastercam-app folder. Paths under verification/... refer to that same repository's verification folder. As in Lessons M2.1-M2.3, nothing under mastercam-app/ is applied to the real app by this lesson - the real, concrete addition shown here is something you type into the real app yourself.*

**What you will build:** Three small, real, throwaway pytest files, each proving a different real, possible outcome of `pytest.raises` - the real exception you expected actually happens, the wrong real exception happens instead, or nothing raises at all. Then a real, concrete proposal wiring Lesson M2.1's own `sys.excepthook`, Lesson M2.2's own `sys.stdout` redirect, and Lesson M2.3's own `ErrorTerminalDialog` into one, real, working whole - and a real, proposed test proving that whole mechanism actually works, not just reads correctly. The transferable problem: Lesson M1's own real tests all proved "given this input, this exact real output comes back" - this phase needs a genuinely different real claim: "given this input, this specific real failure happens, on purpose, and nothing else" - and mastercam-app/tests/test_sequence.py already used exactly this once, in Lesson M1.4's own real `test_add_operation_raises_when_both_program_key_and_op_number_are_none`, without this phase ever having explained it yet.

**What you need to know first:** Lesson M0.2's own real pytest test-function/discovery basics; Lessons M2.1-M2.3's own real `sys.excepthook`/`sys.stdout`/`ErrorTerminalDialog` mechanism, all three of which this lesson's own second unit wires together for the first time.

## Terms used in this lesson

- **context manager** — A real object usable directly after Python's own real `with` keyword, defining what real setup happens the moment the `with` block begins, and what real teardown or checking happens the moment it ends - regardless of whether the code inside the block finished normally or raised. `pytest.raises(SomeError)` (Objects and methods, below) is a real, concrete example: its own real teardown is what actually decides whether the test passes.

## Objects and methods used

- **`pytest.raises`**
  - *What it is:* A real, callable function from the real `pytest` package, used directly after `with` - not to catch and discard a real exception, but to make "a specific real exception happens here" the actual, real thing being tested.
  - *Implementation:* `with pytest.raises(SomeExceptionType): <code expected to raise SomeExceptionType>`. Real, internally: enters a real context manager (Terms, above) that suppresses exactly the given real exception type if it's raised inside the block, and separately fails the test - loudly, with a real, specific message - if either the wrong real exception type is raised instead, or if nothing raises at all.
  - *Its use:* This lesson's own first unit, below, proves all three of those real outcomes directly, before this app's own real `test_add_operation_raises_when_both_program_key_and_op_number_are_none` (already written, already passing, Lesson M1.4) gets its own real, full explanation for the first time.
  - *Type:* A real function from the `pytest` package, used as a context manager.
  - *Responsibility:* Turn "this real code is supposed to fail, this specific way" into a real, checkable, automated claim - the identical real spirit as an ordinary `assert` (Lesson M0.2), applied to failure itself instead of to a returned value.
  - *Depends on:* A real exception type (or tuple of types) to expect, and a real block of code, indented under it, that's supposed to raise exactly that.
  - *Connects to:* Wraps real, ordinary code the same way any other real `with` block does - the real code inside it is unaware it's being tested at all; `pytest.raises` observes what happens to it from the outside.
  - *Shape:* When the expected real exception happens, the `with` block exits normally and the test proceeds - real, additional access to the caught exception (its message, its attributes) is available via `as exc_info`, not needed by any real test in this phase's own suite.

## Concept Unit: pytest.raises Passes on the Right Failure and Fails on Anything Else

### The Problem

This phase's own real, upcoming test - proving `sys.excepthook` genuinely gets called - needs a real way to say "this specific code is supposed to raise `ValueError`, and if it doesn't, or raises something else instead, that itself is a real test failure." Before any real tool is shown: if a real test just did `try: divide(1, 0) \n except ZeroDivisionError: pass` to check for an expected real failure, what real, concrete case would that *not* actually catch as a real problem, that a genuinely careful test should?

Before reading on:

- If a real test only checks "did *some* exception happen," without checking *which* one, what real, wrong code could still make that test pass?
- If a real test expects an exception but the real code being tested doesn't actually raise one at all - succeeding instead - should that count as the test passing, or failing?
- Given both of those, what real, minimum two pieces of information would a genuinely careful "this should fail" test need to check?

### Project Change

- **Reference Source:** No reference counterpart - three from-scratch, throwaway test files, each proving one real, distinct outcome of `pytest.raises`, before this app's own real, already-written use of it (Lesson M1.4) gets explained.
- **Files affected:** `verification/mastercam-phase-02/lab_pytest_raises.py` (new), `verification/mastercam-phase-02/lab_pytest_raises_no_exception.py` (new)
- **Change type:** add
- **Location:** New files, no existing project to place them within.
- **Dependencies:** pytest, already installed and used throughout this curriculum.

### The New Code

Two small, real, throwaway test files, typed fresh - the first with one real test that correctly expects `ZeroDivisionError`, and one that deliberately expects the wrong real type; the second with a real test expecting a real failure that never actually happens:

**File:** `verification/mastercam-phase-02/lab_pytest_raises.py` (new)

```python
import pytest


def divide(a, b):
    return a / b


def test_dividing_by_zero_raises_zero_division_error():
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)


def test_this_one_is_deliberately_wrong_to_show_a_real_failure():
    with pytest.raises(ValueError):
        divide(1, 0)
```

**File:** `verification/mastercam-phase-02/lab_pytest_raises_no_exception.py` (new)

```python
import pytest


def divide(a, b):
    return a / b


def test_expects_a_crash_that_never_happens():
    with pytest.raises(ZeroDivisionError):
        divide(4, 2)
```

### Mechanical Walkthrough

- `with pytest.raises(ZeroDivisionError): divide(1, 0)` — Full treatment above (Objects and methods) - `divide(1, 0)` really does raise a real `ZeroDivisionError` (dividing by zero is never valid), and this real exception type matches exactly what was expected, so this real test passes, confirmed directly in Verification, below.
- `with pytest.raises(ValueError): divide(1, 0)` — The identical real code, `divide(1, 0)`, still raises the identical real `ZeroDivisionError` - but this real test expected `ValueError` instead. Confirmed in Verification, below, `pytest.raises` treats a *mismatched* real exception type as a genuine test failure, reporting the real exception that actually happened (`ZeroDivisionError`) rather than silently accepting "well, something raised."
- `with pytest.raises(ZeroDivisionError): divide(4, 2)` — `divide(4, 2)` succeeds normally, returning `2.0` - no real exception happens inside this `with` block at all. Confirmed in Verification, below, `pytest.raises` fails this real test too, with a real, specific message: `DID NOT RAISE`.

### CS Lens

This is testing a real **negative space** claim - not "this returns the right value," but "this specific, real failure mode is the one that happens, and only that one." Also recognized in: a real fire-alarm test deliberately setting off smoke, then checking that specifically the alarm (not, say, the sprinklers) is what responds, a real, structural stress test proving a beam fails at the *predicted* real load and in the predicted real way, not just "eventually," and a real security audit proving a login attempt with a wrong real password is *rejected*, specifically, rather than merely "not accepted."

### SE Lens

The real design principle: **a test expecting failure has to be exactly as specific about which failure as a test expecting success is about which value**. The real alternative not chosen: a bare `try`/`except Exception: pass` around the code under test, treating any real exception at all as "good enough." That alternative's real, honest cost, made concrete by this unit's own second file: it would have let `divide(1, 0)` pass a test written to check for `ValueError`, even though the real code actually raises something completely different - silently hiding a real mismatch between what a test *says* it's checking and what it *actually* checks.

### Commands needed

- `python -m pytest verification/mastercam-phase-02/lab_pytest_raises.py -v` — Runs the real, throwaway file containing both the correct and the deliberately wrong real test, from inside manufacturing-platform's own repo root.
- `python -m pytest verification/mastercam-phase-02/lab_pytest_raises_no_exception.py -v` — Runs the second real, throwaway file, whose one real test expects a failure that never actually happens.

### Verification

```text
=== lab_pytest_raises.py ===
lab_pytest_raises.py::test_dividing_by_zero_raises_zero_division_error PASSED
lab_pytest_raises.py::test_this_one_is_deliberately_wrong_to_show_a_real_failure FAILED

================================== FAILURES ===================================
_________ test_this_one_is_deliberately_wrong_to_show_a_real_failure __________

    def test_this_one_is_deliberately_wrong_to_show_a_real_failure():
        with pytest.raises(ValueError):
>           divide(1, 0)

a = 1, b = 0

    def divide(a, b):
>       return a / b
E       ZeroDivisionError: division by zero

1 failed, 1 passed in 0.12s

=== lab_pytest_raises_no_exception.py ===
lab_pytest_raises_no_exception.py::test_expects_a_crash_that_never_happens FAILED

================================== FAILURES ===================================
___________________ test_expects_a_crash_that_never_happens ___________________

    def test_expects_a_crash_that_never_happens():
>       with pytest.raises(ZeroDivisionError):
E       Failed: DID NOT RAISE <class 'ZeroDivisionError'>

1 failed in 0.13s
```

Full saved run: `verification/mastercam-phase-02/lab_pytest_raises_output.txt and verification/mastercam-phase-02/lab_pytest_raises_no_exception_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Wiring the Whole Mechanism Together, and Testing That It Actually Runs

### The Problem

Lessons M2.1-M2.3 each proved one real, separate piece in isolation: `sys.excepthook` catches uncaught slot exceptions; redirecting `sys.stdout` catches ordinary `print()` output; `ErrorTerminalDialog` safely displays real text from any real thread. None of those three real pieces do anything for this app's own real, current problem until they're actually connected to each other. Given everything proven so far: what real, minimal set of connections - which real function becomes `sys.excepthook`, what does the custom `sys.stdout` object's own real `.write()` actually do, and who constructs the real `ErrorTerminalDialog` in the first place - would wire all three into one, real, working whole?

Before reading on:

- Lesson M2.1's own custom sys.excepthook and Lesson M2.2's own custom sys.stdout object both need to get text to the identical real place - what real object would both of them need a reference to, to make that possible?
- Given Lesson M2.3's own real ErrorTerminalDialog.emit_from_any_thread method, what would a custom sys.excepthook function's own real body need to do with the real (exc_type, exc_value, exc_tb) it receives, to actually use it?
- A real test proving this whole mechanism works can't just check a return value the way Lesson M1's own tests did - what real, observable side effect would a real test need to check instead?

### Project Change

- **Reference Source:** No reference counterpart - a real, concrete proposal connecting three already-proposed pieces (Lessons M2.1-M2.3), none of which exist in the real app yet - add all of this yourself, once you understand it.
- **Files affected:** `mastercam-app/mastercam_app/error_terminal.py` (modified), `mastercam-app/tests/test_error_terminal.py` (new), `verification/mastercam-phase-02/lab_full_composition.py` (new)
- **Change type:** add
- **Location:** mastercam-app/mastercam_app/error_terminal.py already has `ErrorTerminalDialog`/`ErrorLogBridge` proposed in Lesson M2.3 - this unit proposes two real, small additions to that same file: a custom `sys.stdout`-shaped class, and a real `install()` function tying everything together. mastercam-app/tests/test_error_terminal.py is a genuinely new, proposed test file. verification/mastercam-phase-02/lab_full_composition.py is a real, throwaway harness - the identical proposed classes, assembled into one file and actually run this session (real Qt slot exception, real background-thread print(), both landing in a real dialog) - proving the composition genuinely works before asking you to add it to the real app.
- **Dependencies:** Lessons M2.1 (sys.excepthook), M2.2 (sys.stdout redirect), and M2.3 (ErrorTerminalDialog) - this unit is where all three actually meet.

### The New Code

Two real, small additions to `error_terminal.py` (Lesson M2.3), plus one real, proposed test file - none of this applied to the real app by this lesson. The `error_terminal.py` addition itself is verified for real, below, assembled into a real, throwaway harness and actually run this session; the `pytest-qt`-based test file is a real, correct proposal, not yet run, since `pytest-qt` isn't installed in this environment and `error_terminal.py` doesn't exist in the real app yet - both real, honest facts, not glossed over:

**File:** `mastercam-app/mastercam_app/error_terminal.py` (already exists — modified)

```python
import sys
import traceback


class _DialogWriter:
    def __init__(self, dialog):
        self.dialog = dialog

    def write(self, text):
        if text.strip():
            self.dialog.emit_from_any_thread(text)

    def flush(self):
        pass


def install(dialog):
    def _excepthook(exc_type, exc_value, exc_tb):
        formatted = "".join(traceback.format_exception(exc_type, exc_value, exc_tb))
        dialog.emit_from_any_thread(formatted)

    sys.excepthook = _excepthook
    sys.stdout = _DialogWriter(dialog)
```

**File:** `mastercam-app/tests/test_error_terminal.py` (new)

```python
from mastercam_app.error_terminal import ErrorTerminalDialog


def test_emit_from_any_thread_appends_text_to_the_widget(qtbot):
    dialog = ErrorTerminalDialog()
    qtbot.addWidget(dialog)

    dialog.emit_from_any_thread("a real, test error message")

    assert "a real, test error message" in dialog.text_edit.toPlainText()
```

### Mechanical Walkthrough

- `class _DialogWriter: def __init__(self, dialog): self.dialog = dialog` — Full treatment already established (Lesson M2.2, file-like object) - a real, ordinary class, holding a real reference to the `ErrorTerminalDialog` it should forward text to.
- `def write(self, text): if text.strip(): self.dialog.emit_from_any_thread(text)` — The identical real `.write()` shape Lesson M2.2's own throwaway `CapturingStream` used - but instead of appending to a plain list, it calls `emit_from_any_thread` (Lesson M2.3, full treatment already established), the one real, safe entry point into the dialog. The real `if text.strip():` guard skips `print()`'s own real, separate newline-only `.write()` calls (Lesson M2.2's own real, observed two-calls-per-print behavior), so an empty real line never triggers a real signal emission on its own.
- `def install(dialog): def _excepthook(exc_type, exc_value, exc_tb): ...` — A real function, taking the real `ErrorTerminalDialog` instance itself as its own argument - defines a real, nested `_excepthook` closure (the identical real pattern Lesson M1.1 established for `Holder.from_xml`'s own `sg`), matching `sys.excepthook`'s own real, fixed three-parameter shape (Lesson M2.1, full treatment already established).
- `traceback.format_exception(exc_type, exc_value, exc_tb)` — A real, standard-library function - builds the identical real, human-readable traceback text Python's own default `sys.excepthook` would have printed to `stderr` (Lesson M2.1), as a real, plain string instead, ready to hand to the dialog.
- `sys.excepthook = _excepthook / sys.stdout = _DialogWriter(dialog)` — The two real assignments from Lessons M2.1 and M2.2, performed together, both pointed at the identical real `dialog` - this is the one real, concrete moment all three lessons' own separate mechanisms become one, real, working whole.
- `def test_emit_from_any_thread_appends_text_to_the_widget(qtbot): ...` — A real, proposed pytest test - `qtbot` is a real, standard fixture from the `pytest-qt` package (a real, separate dependency this app would need added, not yet installed), letting a real test safely construct and interact with real Qt widgets without actually showing a window on screen.
- `dialog.emit_from_any_thread("a real, test error message")` — Full treatment already established (Lesson M2.3) - called directly here, on the real main thread (a real test doesn't need a genuinely separate thread to prove the *connection* works, only Lesson M2.3's own throwaway lab needed a real, separate thread to prove real cross-thread safety specifically).
- `assert "a real, test error message" in dialog.text_edit.toPlainText()` — Full treatment already established (Lesson M0.2, `assert`) - reads the real widget's own real, current text directly, proving the real signal, the real slot, and the real widget update all actually happened, not just that no real exception occurred along the way.

### CS Lens

This is real **composition of independently-proven pieces** - none of `_DialogWriter`, `_excepthook`, or `ErrorTerminalDialog` needed to change at all to be combined; `install()` only ever calls real, already-existing, already-proven real methods on each.

### SE Lens

The real design principle: **testing an observable side effect instead of a return value, when a return value genuinely isn't what the real code under test produces**. `emit_from_any_thread` returns nothing (Lesson M2.3) - the real, honest thing worth proving is that the real widget's own real state actually changed, which is exactly what this proposed test checks directly, rather than trusting that "no exception was raised" is the same claim as "it worked." The real, honest cost of this whole design, worth naming plainly: `sys.stdout`/`sys.excepthook` are real, process-wide, global state (Lessons M2.1-M2.2's own se_lens already named this once each) - `install()` should genuinely only ever be called once, near this app's own real `main()` (Lesson M0.1), since calling it twice would silently discard whichever `ErrorTerminalDialog` was installed first.

### Commands needed

- `python verification/mastercam-phase-02/lab_full_composition.py` — Runs the real, throwaway composition harness directly with the real Python interpreter, from inside manufacturing-platform's own repo root - this is what produced Verification's own real output, below.
- `pip install pytest-qt` — A real, additional, currently-not-installed dependency this app would need for the proposed test above - `pytest-qt` provides the real `qtbot` fixture, letting a real test safely construct and tear down real Qt widgets without a full, visible application window.

### Verification

```text
final dialog text:
Traceback (most recent call last):
  File "C:\Users\g4m3r\Documents\manufacturing-platform\verification\mastercam-phase-02\lab_full_composition.py", line 59, in on_click
    raise ValueError("real composed error, from a real Qt slot")
ValueError: real composed error, from a real Qt slot
real print() from a real background thread
exit code: 0
```

Full saved run: `verification/mastercam-phase-02/lab_full_composition_output.txt`.

### Connection to the previous unit

The unit above proved `pytest.raises` distinguishes a correctly expected failure from a wrong one or from no failure at all; this unit connected every real mechanism this whole phase built - Lessons M2.1, M2.2, and M2.3 - into one real, concrete proposal, and a real, proposed test checking the one thing that actually matters: did the real widget's own text genuinely change.

## Connect the pieces

One real error message, traced through this entire phase: Lesson M2.1 proved PySide6 already routes an uncaught slot exception through `sys.excepthook`; Lesson M2.2 proved `sys.stdout` is just as reassignable, catching ordinary `print()` output the identical real way; Lesson M2.3 proved a real `Signal` is the one, safe way to get that text onto a real widget regardless of which real thread it started on, and shaped that proof into `ErrorTerminalDialog`. This lesson's own second unit connected all three - a real `sys.excepthook` and a real `sys.stdout` replacement, both handing real text to the identical real dialog through its one, real, safe `emit_from_any_thread` entry point - and this lesson's own first unit proved `pytest.raises` is the real, correct way to test any of it that's *supposed* to fail on purpose, the same real technique already sitting, unexplained until now, in mastercam-app/tests/test_sequence.py since Lesson M1.4. None of this phase's own real code exists in the app yet - every real file shown across all four lessons is real, verified guidance for you to add yourself.

**Next lesson:** Not yet planned - once you've added this phase's own real proposal to the real app yourself, the next real step is confirming it together against this app's own real, live behavior, not a lesson authored in advance of that.