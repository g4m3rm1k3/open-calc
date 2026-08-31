# Lesson 2.7: Characterization Testing

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real probe of this project's own, currently-untested `STLScaffoldService._extract_operation_num`, uncovering genuinely surprising real behavior nobody documented; a real, pinned-down characterization test recording exactly that behavior, correct or not; and a real, well-intentioned "fix" to the same function, proven, by that exact test, to silently change four of eight already-real cases the moment it ships.

**What you need to know first:** What correctness, regression, and refactoring safety mean for a test; what an assert statement and pytest's own parametrization do; what a unit test checks, in isolation, with no other real collaborator involved.

## Terms used in this lesson

- **characterization test** — A test that records what a piece of code's real, current behavior actually is, right now, rather than what it should be - passing, by definition, against the exact behavior observed at the moment it's written. It exists specifically for code nobody has full confidence describing correctly from memory, so a later change to it can be checked against a real, honest baseline instead of nothing at all.
- **legacy code** — Code without a trustworthy safety net around it - not "old" as a synonym, but specifically "risky to change, because nothing would notice if changing it broke something." It exists as a real, distinct category from either "correct" or "buggy" code - a piece of code worth characterizing might honestly be either, and the entire point is that nobody currently knows for certain which.
- **observed behavior vs. intended behavior** — The real distinction a characterization test is built around: what code actually does, verified by running it, versus what its author meant, or what a docstring claims, which may or may not be the same thing. It exists because conflating the two is exactly what lets a well-meaning "fix" silently change real behavior nobody meant to touch.

## Objects and methods used

- **`STLScaffoldService._extract_operation_num`**
  - *What it is:* The same real, existing static method on this project's own `STLScaffoldService` this curriculum has reused since it was first introduced - still, confirmed again this session, referenced nowhere in the whole backend except its own definition.
  - *Implementation:* `@staticmethod def _extract_operation_num(subprogram: str) -> str:` (`backend/app/services/stl_scaffold_service.py:231-246`) - strips every leading `O` and then every leading `o` off `subprogram`, then returns only the *first* character of what remains if that character is a digit, otherwise the literal fallback `"0"`.
  - *Its use:* This lesson probes it against real inputs its own docstring never shows - not to fix anything yet, but to find out, for real, what it currently does.
  - *Type:* A `@staticmethod` on the `STLScaffoldService` class.
  - *Responsibility:* As written, extracting one single digit standing in for an operation number - never more than one digit, regardless of how many real digits actually follow the leading `O`.
  - *Depends on:* Only its own `subprogram` argument - a plain string.
  - *Connects to:* Called elsewhere inside `STLScaffoldService` while building scaffold items from real sequence data; this lesson's own probe and characterization test both call it directly, independently of that real caller.
  - *Shape:* Takes one string in, returns one single-character string out - confirmed this session, never more than one character, even for an input with several real leading digits.

- **`str.lstrip`**
  - *What it is:* A real, built-in Python string method, removing leading characters from a string.
  - *Implementation:* `s.lstrip(chars)` - removes every leading character that appears anywhere in `chars`, one at a time from the left, stopping at the first character *not* in `chars`; called with no argument, it strips whitespace instead.
  - *Its use:* `_extract_operation_num` calls it twice in a row - `.lstrip('O').lstrip('o')` - and this lesson's own probe is what first reveals, for real, that this strips *every* leading `o` character, not just one.
  - *Type:* A built-in instance method on `str`.
  - *Responsibility:* Removing an entire real, contiguous run of matching leading characters, however long that run actually is.
  - *Depends on:* A real string of characters to treat as "strip these."
  - *Connects to:* Called on `subprogram` inside `_extract_operation_num`; its real, full-run-stripping behavior is exactly what makes `"ooo5"` resolve to `"5"`, not `"oo5"`.
  - *Shape:* Takes a string in, returns a new string out - the original string itself is never modified, since Python strings are immutable.

## Concept Unit: Finding the Real, Current Behavior

### The Problem

This project's real `_extract_operation_num` has never been tested, and its own docstring shows exactly three real examples, all single-digit. What does it actually do on inputs its author never wrote down - and is that real behavior even the one a reader would guess from reading the code once?

Before reading on:

- Given `.lstrip('O').lstrip('o')`, what do you predict `_extract_operation_num("ooo5")` returns - and does your prediction depend on whether `lstrip` removes one leading character or every leading character that matches?
- The real function only ever looks at `num[0]` - a single character - before returning. What do you predict it returns for `"O99"`, an input with two real, consecutive leading digits?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `backend/app/services/stl_scaffold_service.py:231-246` (`STLScaffoldService._extract_operation_num`), read again this session; confirmed, by a real search of the whole backend this session, to still be referenced nowhere except its own definition.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond this project's own backend package being importable.

### The New Code

Eight real calls, including several inputs this function's own docstring never shows:

**File:** `verification/phase-02/lab_pytest_demo/lab_characterize_probe.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app.services.stl_scaffold_service import STLScaffoldService as S

cases = ["O1103", "1103", "OAB", "", "O", "ooo5", "O99", "0123"]
for c in cases:
    try:
        print(repr(c), "->", repr(S._extract_operation_num(c)))
    except Exception as e:
        print(repr(c), "-> raised", type(e).__name__, e)
```

### Mechanical Walkthrough

- `cases = ["O1103", "1103", "OAB", "", "O", "ooo5", "O99", "0123"]` — Eight real strings, deliberately chosen to include the function's own three documented examples (`"O1103"`, implicitly `"1103"`-shaped, and a two-digit case) alongside five real inputs its docstring never addresses at all: no digits after the prefix, an empty string, a bare `"O"`, repeated lowercase `o`s, and a leading real zero.
- `for c in cases:` — An ordinary `for` loop, already familiar from earlier lessons, iterating over each real string in turn.
- `try: ... except Exception as e:` — Wraps each real call so that if any input actually raises (rather than returning a value), this probe would show that too, instead of stopping partway through - real, defensive probing, since this function's own real behavior on these inputs wasn't known in advance.
- `S._extract_operation_num(c)` — Calls the real, unmodified static method directly, exactly as every earlier lesson reusing this specimen already has.
- `print(repr(c), "->", repr(S._extract_operation_num(c)))` — Uses `repr()` on both the input and the output, not `str()` or a bare f-string - deliberately, so an empty string prints visibly as `''` instead of nothing at all, and the real distinction between `"O"` and `""` stays legible in the printed output.

### CS Lens

This is **exploratory testing**: running real code against a deliberately wide, real range of inputs specifically to discover behavior, not to confirm an expectation already held. Also recognized in: fuzz testing, which generates large numbers of real random inputs looking for a crash nobody predicted; a REPL session used to probe an unfamiliar library before writing real code against it; a debugger's own watch expressions, run against real, live values instead of imagined ones; and, in this project's own domain, running a new post-processor against a range of real, already-proven programs before trusting it on a new one.

### SE Lens

The design principle is that real, current behavior has to be *discovered*, not assumed from reading source once - this exact unit's own real output proves that reading `.lstrip('O').lstrip('o')` once is not enough to correctly predict what `"ooo5"` returns without actually running it. The real alternative not chosen - trusting the docstring's own three examples as a complete real specification - has an honest cost this unit's own run makes concrete: five of the eight real inputs probed here fall completely outside what the docstring ever addresses, and two of those five (`"O99"`, `"0123"`) produce results a reader would likely not have predicted correctly on the first try.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_characterize_probe.py` — Runs this as a plain script, from the repository root.

### Verification

```text
'O1103' -> '1'
'1103' -> '1'
'OAB' -> '0'
'' -> '0'
'O' -> '0'
'ooo5' -> '5'
'O99' -> '9'
'0123' -> '0'
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_characterize_probe_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the real, surprising behavior every later unit in this lesson exists to protect.

## Concept Unit: Writing the Characterization Test

### The Problem

Eight real observed results now exist, printed to a terminal. What turns them from something a person read once into something a future change can actually be checked against?

Before reading on:

- This unit's own test asserts `_extract_operation_num("O99") == "9"` - a real result that arguably looks wrong (it discards a real digit). Should a characterization test ever assert something its own author suspects is a bug?
- If this project's real docstring for `_extract_operation_num` is never updated to mention any of this unit's five new real cases, does that make this unit's own test any less real or any less valuable?

### Project Change

- **Reference Source:** No reference counterpart - the same real specimen as the previous unit, now pinned down as a real, saved, run test instead of printed output a person has to remember.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

The exact same eight real cases from the previous unit's probe, now asserted, with each one's real, current answer written down as a real expectation:

**File:** `verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py` (new)

```python
import sys
sys.path.insert(0, "backend")

import pytest
from app.services.stl_scaffold_service import STLScaffoldService as S

# Characterization tests: these pin down what this function ACTUALLY does
# today, observed by running it - not what it should do. Several of these
# are genuinely surprising and may be real bugs; they are recorded here
# so a future change can't alter this behavior by accident, silently.


@pytest.mark.parametrize("subprogram, current_real_behavior", [
    ("O1103", "1"),
    ("1103", "1"),
    ("OAB", "0"),       # no digit after stripping O/o - falls back to "0"
    ("", "0"),          # empty string - falls back to "0"
    ("O", "0"),         # just the letter - falls back to "0"
    ("ooo5", "5"),      # lstrip("o") strips ALL leading lowercase o's, not one
    ("O99", "9"),       # only the FIRST digit is kept - "99" becomes "9", not "99"
    ("0123", "0"),      # a leading real zero is itself treated as the operation number
])
def test_extract_operation_num_current_behavior(subprogram, current_real_behavior):
    assert S._extract_operation_num(subprogram) == current_real_behavior
```

### Mechanical Walkthrough

- `# Characterization tests: these pin down ... may be real bugs ...` — A real, deliberately explicit comment, distinguishing this test's own real purpose from an ordinary correctness test - stating plainly that "passes" here means "matches observed behavior," not "is known to be right."
- `@pytest.mark.parametrize("subprogram, current_real_behavior", [...])` — The same real pytest construct an earlier lesson already introduced, now carrying all eight real cases from the previous unit's own probe at once, each with an inline comment recording exactly what's surprising about it.
- `("ooo5", "5"),  # lstrip("o") strips ALL leading lowercase o's, not one` — One real tuple among the eight - the expected value is the real, observed one, `"5"`, not a guess; the comment records *why* that value is what it is, in terms of the real mechanism (`lstrip`'s own full-run-stripping behavior) responsible for it.
- `def test_extract_operation_num_current_behavior(subprogram, current_real_behavior): assert S._extract_operation_num(subprogram) == current_real_behavior` — One real assertion, run eight separate times - the identical real function call from the previous unit's probe, now compared against a real, written-down expectation instead of only printed for a person to read.

### CS Lens

This is a **characterization test**, the real technique this lesson is named for: a test asserting observed behavior instead of specified behavior. Also recognized in: golden-master testing, recording a real program's complete real output once and diffing future runs against it; snapshot testing in frontend frameworks, pinning a real rendered UI's current shape; database schema "current state" migrations, generated by inspecting a real, already-existing schema rather than a hand-written spec; and, in this project's own domain, a first-article inspection recording a part's actual, real measured dimensions as the accepted baseline for every part after it, rather than a theoretical ideal.

### SE Lens

The design principle is that a real, if imperfect, safety net beats no safety net at all - eight assertions on real, possibly- wrong behavior are strictly more protective than the zero real tests this function had before this lesson. The real alternative not chosen - waiting to test this function until its "real, correct" behavior has been decided and documented - has an honest, serious cost: this project's own real evidence (its own `test_xml_parser.py`, cited since this curriculum began) shows that "decide what's correct first" has never actually happened here for any of this project's parsing logic; a characterization test is the one real, available step that doesn't wait for that decision to happen first.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py -v` — Runs all eight real, parametrized cases under pytest, from the repository root.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 8 items

verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[O1103-1] PASSED [ 12%]
verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[1103-1] PASSED [ 25%]
verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[OAB-0] PASSED [ 37%]
verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[-0] PASSED [ 50%]
verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[O-0] PASSED [ 62%]
verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[ooo5-5] PASSED [ 75%]
verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[O99-9] PASSED [ 87%]
verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py::test_extract_operation_num_current_behavior[0123-0] PASSED [100%]

============================== 8 passed in 0.45s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/characterize_test_output.txt`.

### Connection to the previous unit

The previous unit discovered eight real facts; this unit turns those same eight facts into a real, permanent, checkable baseline.

## Concept Unit: What It Protects

### The Problem

Suppose someone, with good intentions, "fixes" `_extract_operation_num` to keep every leading digit instead of just the first - a real, plausible improvement, given `"O99"` losing a digit looked like a bug in the previous unit. Does the previous unit's own characterization test actually catch that change - and does it catch only the one case that motivated it?

Before reading on:

- A fix that keeps every leading digit would turn `"O99"` into `"99"` instead of `"9"` - a real, deliberate, wanted change. Given this lesson's own characterization test asserts exactly `"9"` for that case, what do you expect happens when it's re-run against the fixed version?
- The same fix, applied to `"O1103"`, would return `"1103"` instead of `"1"` - a change nobody was specifically trying to make. Would you have predicted that consequence before seeing it, just from reading the fix's own one-line description ("keep every leading digit")?

### Project Change

- **Reference Source:** No reference counterpart - a real, deliberately different implementation of the same real idea, checked against the previous unit's own real, saved expectations.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

A real, working "improved" version, checked against the exact same eight real expectations the previous unit already pinned down:

**File:** `verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py` (new)

```python
import pytest


def improved_extract_operation_num(subprogram: str) -> str:
    """A well-intentioned fix: keep every leading digit, not just the first."""
    num = subprogram.lstrip("O").lstrip("o")
    digits = ""
    for ch in num:
        if ch.isdigit():
            digits += ch
        else:
            break
    return digits if digits else "0"


@pytest.mark.parametrize("subprogram, current_real_behavior", [
    ("O1103", "1"),
    ("1103", "1"),
    ("OAB", "0"),
    ("", "0"),
    ("O", "0"),
    ("ooo5", "5"),
    ("O99", "9"),
    ("0123", "0"),
])
def test_improved_version_against_characterization(subprogram, current_real_behavior):
    assert improved_extract_operation_num(subprogram) == current_real_behavior
```

### Mechanical Walkthrough

- `def improved_extract_operation_num(subprogram: str) -> str:` — A brand-new, real, working function - not the real project's own `_extract_operation_num`, which is never modified by this lesson - built specifically to embody the one-line fix idea named in this unit's own Problem.
- `num = subprogram.lstrip("O").lstrip("o")` — The identical first line as the real, original function - this fix deliberately keeps that part unchanged, to isolate exactly one real behavior difference.
- `digits = "" / for ch in num: if ch.isdigit(): digits += ch / else: break` — Real, new logic: walks `num` one real character at a time, appending each one that's a digit, and stopping - via `break` - at the first character that isn't. Unlike the original, which only ever looks at `num[0]`, this keeps every real, consecutive leading digit.
- `return digits if digits else "0"` — A real conditional expression: returns the accumulated digits if any were found, otherwise the same `"0"` fallback the original function used - deliberately preserving that part of the original's real behavior too.
- `@pytest.mark.parametrize(..., [same eight real tuples as the previous unit])` — The identical real expectations from the previous unit's own characterization test, unedited - reused here specifically to check the new function against the *old* function's real, observed behavior, not against any new, hoped-for one.
- `assert improved_extract_operation_num(subprogram) == current_real_behavior` — Calls the new, "improved" function instead of the real original - the one real, deliberate substitution this unit makes, against otherwise unchanged real expectations.

### Execution Trace

```
O1103: improved -> "1103", characterized expectation -> "1"  => FAILED
1103: improved -> "1103", characterized expectation -> "1"  => FAILED
OAB: improved -> "0", characterized expectation -> "0"  => PASSED (no digits either way)
(empty string): improved -> "0", characterized expectation -> "0"  => PASSED
O: improved -> "0", characterized expectation -> "0"  => PASSED
ooo5: improved -> "5", characterized expectation -> "5"  => PASSED (only one digit present either way)
O99: improved -> "99", characterized expectation -> "9"  => FAILED (the one case the fix was actually written for)
0123: improved -> "0123", characterized expectation -> "0"  => FAILED
```

### CS Lens

This is a **regression suite protecting legacy code specifically** - the same underlying idea an earlier lesson's own refactoring- safety unit already proved, now shown against code with no known- correct behavior to refactor toward, only observed behavior to avoid silently breaking. Also recognized in: a compatibility test suite run against a new interpreter version, checking it still behaves like the old one for real, existing programs; an API's own versioned contract tests, run against a new implementation before it replaces the old one; a database migration's own "before and after" row-count and checksum comparison; and, in this project's own domain, a retrofit machine control required to reproduce a real, already-proven program's exact toolpath before it's trusted with new ones.

### SE Lens

The design principle is that "obviously correct" changes to undocumented, uncovered code are exactly the ones most likely to break something silently - this unit's own real, run evidence shows a fix motivated by a single, specific case (`"O99"`) also changed three cases nobody was thinking about (`"O1103"`, `"1103"`, `"0123"`) the moment it ran. The real alternative not chosen - shipping this fix directly into `_extract_operation_num` itself, with no characterization test in place first - is exactly what this project's own real, current state already permits, since nothing currently tests this function at all; the honest cost of the alternative actually taken here is real, upfront authoring work (the previous unit's own eight cases), paid once, to make a mistake like this one impossible to ship unnoticed.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py -v` — Runs the "improved" version against the previous unit's own real expectations, from the repository root; named without a `test_` prefix on purpose, so this deliberately-failing demonstration is never picked up by a directory-wide discovery run.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 8 items

verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[O1103-1] FAILED [ 12%]
verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[1103-1] FAILED [ 25%]
verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[OAB-0] PASSED [ 37%]
verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[-0] PASSED [ 50%]
verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[O-0] PASSED [ 62%]
verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[ooo5-5] PASSED [ 75%]
verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[O99-9] FAILED [ 87%]
verification/phase-02/lab_pytest_demo/characterization_catches_change_lab.py::test_improved_version_against_characterization[0123-0] FAILED [100%]

============================== 4 failed, 4 passed in 0.06s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/characterization_catches_change_output.txt`.

### Connection to the previous unit

The previous unit wrote the baseline down; this unit is the entire reason that baseline was worth writing - proof, not assertion, that it catches a real, plausible change nobody meant to make everywhere it happened.

## Connect the pieces

One real, currently-untested function, probed against eight real inputs, revealing behavior its own docstring never mentions - `lstrip` removing an entire real run of matching characters, not just one, and only ever the first digit of a longer real number ever surviving at all (finding the real, current behavior). Those same eight real, observed results, written down as eight real, permanent, parametrized assertions - not claims about what should happen, honest ones about what does (writing the characterization test). And a real, plausible, well-intentioned fix to the one case that looked most like a bug, run against that exact real baseline, failing on four of eight cases - one of them the case the fix was actually written for, three of them nobody was thinking about at all (what it protects). This is the whole real method this lesson is named for: not deciding what code should do, only pinning down, in a form a machine checks, what it actually does - so that whatever happens next, it happens on purpose.

**Next lesson:** A characterization test proves a change happened; it doesn't, on its own, say whether the *specific* real shape of a response - every field, every status code, every edge case - was actually captured, or just the one narrow slice this lesson's own eight cases happened to cover. Next, this curriculum takes on exactly that completeness question: what "the real, current behavior" actually has to include before a characterization is trustworthy enough to rebuild against.