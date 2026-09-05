# Lesson M4.8: A Test That Fails Until You Fix Your Own Machine

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. This lesson adds a real, new file - diagnostics.py - and a real, currently-failing test to verification/mastercam-app-copy/mastercam-app/, not the real mastercam-app/, per this phase's rule. Unlike every other lesson in this phase, the "done" state here isn't something Claude can produce - it requires you to make a real, elevated, machine-wide change and re-run this exact test yourself.*

**What you will build:** A real diagnostic function that directly probes whether long paths actually work on this machine (not whether the registry claims they do), and a test that is honestly failing right now - built to be run again, unchanged, after you enable Windows Long Path support for real, as the concrete proof that Lessons M4.5-M4.7 actually mattered.

**What you need to know first:** Lessons M4.5 (MAX_PATH), M4.6 (the registry's per-key ACLs), and M4.7 (why a fresh process is needed) - this lesson turns that understanding into one real, falsifiable check instead of three separate investigations.

## Terms used in this lesson

- **Direct probe (vs. reading configuration)** — Testing what a system actually does (here: attempting a real long path) instead of trusting a setting that claims to control it. The registry value could be wrong, misread, or insufficient on its own (Lesson M4.7's manifest condition) - a direct probe can't be.

## Objects and methods used

- **`long_paths_supported`**
  - *What it is:* A real, direct check of whether a plain long path actually works
  - *Implementation:* mastercam_app/diagnostics.py (new)
  - *Its use:* Called by the new test below; could also gate a real feature (like enabling a browser-embedding menu item) in the app itself
  - *Type:* function
  - *Responsibility:* Attempt a real 250-character mkdir/rmdir and report whether it succeeded
  - *Depends on:* tempfile, pathlib
  - *Connects to:* test_long_paths_ready_for_webengine.py
  - *Shape:* try/except around one real filesystem operation

## Concept Unit: Testing the Real Thing Instead of the Setting That Controls It

### The Problem

Lesson M4.6 read LongPathsEnabled directly from the registry. That proves the setting's value, not that long paths actually work - Lesson M4.7 named a second, independent condition (the running interpreter's own manifest) a registry read alone can't see.

Before reading on:

- long_paths_supported() doesn't read the registry at all - it tries a real mkdir(). What real situation could exist where LongPathsEnabled reads as 1 but this function still returns False?
- The probe path is built fresh under tempfile.gettempdir() every call, then removed immediately after - why does cleaning up matter here, beyond tidiness?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch addition. The direct- probe technique itself was already used, ungeneralized, in Lesson M4.5's real verification.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/diagnostics.py` (new)
- **Change type:** add
- **Location:** new file
- **Dependencies:** tempfile, pathlib (standard library only)

### The New Code

The whole new module.

**File:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/diagnostics.py` (new)

```python
"""
Real, direct environment diagnostics - checks what the OS actually
does, not what a registry value claims it does.
"""

import tempfile
from pathlib import Path


def long_paths_supported() -> bool:
    tmp_dir = Path(tempfile.gettempdir())
    long_name = "x" * 250
    probe = tmp_dir / long_name
    try:
        probe.mkdir()
        probe.rmdir()
        return True
    except OSError:
        return False
```

### Mechanical Walkthrough

- `long_name = "x" * 250` — Combined with tempfile.gettempdir()'s own real path length (this machine: roughly 30 characters under C:\Users\...\AppData\Local\Temp), the full probe path lands comfortably past 260 - the exact real boundary Lesson M4.5 measured directly, not an arbitrary round number.
- `except OSError: return False` — WinError 3 (Lesson M4.7's real observed error) is a subclass of OSError in Python - this catches that specific real failure mode without needing to match its exact message text, which could vary by Windows version or locale.

### CS Lens

This is **testing the observable behavior, not the configuration that's supposed to produce it** - the same principle as testing that a cache actually returns fast results rather than only checking that caching is "enabled" in a config file.

### SE Lens

The real alternative - reading LongPathsEnabled via the registry and trusting it - is simpler code, but Lesson M4.7 already showed it can't rule out the manifest condition on its own. A direct probe costs one real filesystem operation and is correct regardless of how many independent conditions actually gate the real behavior.

### Commands needed

- `python -c "from mastercam_app.diagnostics import long_paths_supported; print(long_paths_supported())"` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
False
```

Full saved run: `verification/mastercam-phase-04/lab_diagnostics_output.txt`.

### Connection to the previous unit

Lessons M4.5-M4.7 each verified one real piece by hand; this unit is the same underlying check, turned into a real, reusable function.

## Concept Unit: A Test You Have to Make Pass Yourself

### The Problem

Every other lesson in this curriculum ends with Claude running a real test and pasting real, passing output. This one can't - the fix requires an elevated, machine-wide change nobody should make on your behalf. The test exists so you have an unambiguous, falsifiable way to know you actually did it right.

Before reading on:

- This test currently fails, on this real machine, right now - shown below. After you enable LongPathsEnabled and open a fresh terminal (not a new tab in an old one - Lesson M4.7), what real command would you run to check whether the fix actually worked, without needing anyone to tell you?
- If you ran this test again in the SAME terminal window you used to enable the setting, what does Lesson M4.7 predict would happen, and why would that not mean the fix failed?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch addition.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_long_paths_ready_for_webengine.py` (new)
- **Change type:** add
- **Location:** new test file
- **Dependencies:** mastercam_app.diagnostics.long_paths_supported

### The New Code

The whole new test file, including its own instructions.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_long_paths_ready_for_webengine.py` (new)

```python
"""
This test is meant to fail right now, on a machine that hasn't
enabled Windows Long Path support - that's the point, not a bug.

To make it pass for real:
  1. Enable LongPathsEnabled (Lesson M4.6) - needs an elevated
     PowerShell session.
  2. Close every terminal window and start a genuinely new one
     (Lesson M4.7) - a new tab in an old window is still a child
     process and will still see the old, inherited state.
  3. Run this test again from that fresh terminal.
"""

from mastercam_app.diagnostics import long_paths_supported


def test_long_paths_are_supported_before_installing_pyside6_addons():
    assert long_paths_supported() is True, (
        "Long paths are not yet supported on this machine. "
        "See Lessons M4.5-M4.7, then follow this file's own docstring."
    )
```

### Mechanical Walkthrough

- `assert long_paths_supported() is True, "..."` — The message argument only ever prints when the assertion actually fails - it's not documentation sitting unused; it's what you'll actually see in the real pytest output below, pointing back at these exact lessons.

### CS Lens

This is a real, deliberate **red test as a specification** - the same shape as Phase M2.4's "a test that passes only when code fails correctly," except here the thing that has to change isn't application code at all, it's the machine itself.

### SE Lens

The real alternative - a checklist in prose ("did you enable long paths? yes/no") - relies on self-report, which is exactly what this whole curriculum's Verification Rule has been arguing against since Lesson M0.2. A failing test that only turns green when the real, underlying condition is true doesn't have that problem.

### Commands needed

- `python -m pytest tests/test_long_paths_ready_for_webengine.py -v` — Run from verification/mastercam-app-copy/mastercam-app/ - real, honest, currently RED

### Verification

```text
collected 1 item

tests/test_long_paths_ready_for_webengine.py::test_long_paths_are_supported_before_installing_pyside6_addons FAILED [100%]

AssertionError: Long paths are not yet supported on this machine. See Lessons M4.5-M4.7, then follow this file's own docstring.
assert False is True
 +  where False = long_paths_supported()

1 failed in 0.14s
```

Full saved run: `verification/mastercam-phase-04/lab_test_long_paths_ready_output.txt`.

### Connection to the previous unit

The unit above built the real check; this unit is that check wired into a test whose only real "done" state is a passing run you produce yourself, on your own machine, after your own real system change.

## Connect the pieces

Trace this test's own real, current output: long_paths_supported() returns False (unit one, verified) - the test asserts True and fails with a message naming exactly which lessons explain why (unit two). Enabling LongPathsEnabled for real, in an elevated session, then opening a genuinely fresh terminal and re-running this exact command is the actual, unambiguous proof - not this lesson's prose, your own real, passing test output.

**Next lesson:** Once this test passes for real, retry `pip install PySide6-Addons` - that install succeeding is what unblocks the browser-embedding lesson this whole investigation was for.