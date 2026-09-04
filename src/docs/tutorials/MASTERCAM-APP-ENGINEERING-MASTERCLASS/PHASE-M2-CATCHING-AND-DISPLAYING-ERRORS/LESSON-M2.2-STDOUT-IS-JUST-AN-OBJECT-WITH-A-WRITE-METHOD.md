# Lesson M2.2: stdout Is Just an Object With a write Method

*File paths under mastercam-app/... refer to the real manufacturing-platform repository's mastercam-app folder. Paths under verification/... refer to that same repository's verification folder. As in Lesson M2.1, nothing under mastercam-app/ is applied to the real app by this lesson - the real, concrete addition shown here is something you type into the real app yourself.*

**What you will build:** A throwaway proof that `sys.stdout` - what `print()` actually writes to - is not a fixed, special, unreplaceable thing; it's an ordinary, real, reassignable variable holding any real object with a `.write()` method. The transferable problem: Lesson M2.1 fixed how this app reports an *uncaught* exception, but this app's own real `LiveColorServer` (mastercam-app/mastercam_app/cbook/stl_processor.py) logs its own, real, ordinary progress and errors with plain `print()` calls, on a real, separate background thread - `sys.excepthook` alone does nothing for those. A real `print()` call is never wrong or uncaught; it just goes somewhere invisible, the identical real problem as `stderr` in Lesson M2.1, one level earlier.

**What you need to know first:** Lesson M2.1's own real proof that `sys.excepthook` catches uncaught exceptions but says nothing about ordinary print() output, which this lesson's own real problem is about instead.

## Terms used in this lesson

- **file-like object** — Any real object with the right real methods (`.write()`, and sometimes `.flush()`/`.read()`) - not necessarily backed by an actual, real file on disk at all. It exists as a real, deliberate convention throughout Python's own standard library and beyond: a real function expecting "something to write text to" (`print()` included) checks for the right real *methods*, not for a real, literal `open()`-produced file object specifically - any object shaped the right way works identically.

## Objects and methods used

- **`sys.stdout`**
  - *What it is:* A real, ordinary, reassignable module-level variable on `sys` - the identical real kind of thing as `sys.excepthook` (Lesson M2.1), just holding a real, writable object instead of a real, callable function.
  - *Implementation:* By real, ordinary default, a real file-like object (Terms, above) connected to the real, actual console. `print(*args)` internally calls `sys.stdout.write(...)` for each real argument, plus a real newline - `print()` itself never touches the real console directly; it always goes through whatever `sys.stdout` currently is.
  - *Its use:* This lesson's own real unit, below, replaces this real, default object with a real, throwaway one that has nothing to do with any real console at all, proving `print()` follows it there instead.
  - *Type:* A real, plain, reassignable module-level variable holding a file-like object.
  - *Responsibility:* Be wherever `print()`'s own real output actually goes - nothing more; `print()` itself contains no real, special knowledge of "the console" at all, only of `sys.stdout`.
  - *Depends on:* Nothing to reassign it - the identical real mechanism as `sys.excepthook`, a plain assignment.
  - *Connects to:* Read by every real `print()` call anywhere in the running program, including every one of `LiveColorServer`'s own real, existing `print(f"[LiveColorServer] ...")` debug lines.
  - *Shape:* Whatever real object it currently is, `print()` calls exactly two real methods on it per call: `.write()` (once or more, for the real text) and `.flush()` (once, real and optional to implement meaningfully) - confirmed directly by this lesson's own real, executed proof, below.

## Concept Unit: Assigning a Real Object to sys.stdout Redirects Every print() Call

### The Problem

This app's own real `LiveColorServer` logs real progress with plain `print()` calls, on a real, separate background thread - Lesson M2.1's own real `sys.excepthook` fix does nothing for those, since nothing there ever raises or goes uncaught; it's already running exactly as written. Before any real tool is shown: given `print()` is real, ordinary Python code, not a real, untouchable language keyword - could a real, custom object, substituted in for whatever `print()` actually writes to, capture that real text without changing a single one of `LiveColorServer`'s own already-written `print()` calls?

Before reading on:

- print("hello") has to write its real text somewhere - what's the smallest, real fact you'd need to know about *where*, to be able to intercept it?
- If that "where" were a real, ordinary Python variable, reassignable the same way sys.excepthook was in Lesson M2.1, what would substituting your own real object there let you do?
- Would a real, custom object need to be a genuine, real file on disk to work as a stand-in, or could it be a plain, ordinary class with the right real method on it?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch, throwaway example proving the one real mechanism this app's own real `print()`- based logging (mastercam-app/mastercam_app/cbook/stl_processor.py) could route through, once you add it yourself.
- **Files affected:** `verification/mastercam-phase-02/lab_stdout_redirect.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Nothing beyond Python's own standard library.

### The New Code

One small, real, throwaway class, typed fresh, with only the one real method `print()` actually needs, followed by a real redirect and restore:

**File:** `verification/mastercam-phase-02/lab_stdout_redirect.py` (new)

```python
import sys


class CapturingStream:
    def __init__(self):
        self.lines = []

    def write(self, text):
        self.lines.append(text)

    def flush(self):
        pass


real_stdout = sys.stdout
capture = CapturingStream()
sys.stdout = capture

print("this goes into capture, not the real console")
print("so does this")

sys.stdout = real_stdout
print("captured.lines is now:", capture.lines)
```

### Mechanical Walkthrough

- `class CapturingStream: ...` — A real, ordinary, plain class - not a subclass of anything special, not inheriting from any real, built-in file type. Full treatment above (Terms, file-like object): the only real requirement is having the right real methods.
- `def write(self, text): self.lines.append(text)` — The one real method that actually matters here - every real character `print()` sends gets appended to a real, ordinary Python list instead of going anywhere near a real console.
- `def flush(self): pass` — A real, empty method - `print()`'s own real internal code calls `.flush()` after writing, expecting real file-like objects to support it (a real console needs it to make output appear immediately); this throwaway class has nothing real to flush, so it does real, deliberately nothing.
- `real_stdout = sys.stdout` — Saves the real, original object first - full treatment above (Objects and methods) establishes this is Python's own real, default console-connected object; keeping a real reference to it is what makes restoring it afterward possible at all.
- `sys.stdout = capture` — The entire real mechanism - a plain, real assignment, identical in kind to `sys.excepthook = my_excepthook` (Lesson M2.1).
- `print("this goes into capture, not the real console") / print("so does this")` — Two real, ordinary `print()` calls - neither one's real text appears anywhere in Verification, below, at the point they run; confirmed instead, later, to have landed inside `capture.lines`.
- `sys.stdout = real_stdout` — Restores the real, original console connection - from this real line onward, `print()` goes back to behaving ordinarily.
- `print("captured.lines is now:", capture.lines)` — Runs *after* `sys.stdout` was restored, so this real line's own output genuinely does appear in Verification, below - and what it prints is real, direct proof that the two earlier, invisible `print()` calls really did land inside `capture.lines`, each one appearing twice (once for the real text, once for `print()`'s own real, automatic trailing newline).

### CS Lens

This is the same real **hook**/substitution concept as `sys.excepthook` (Lesson M2.1), applied to a real, writable destination instead of a real, callable function - proving the identical real Python convention (a plain, reassignable variable as a genuine extension point) recurs for output, not just for error handling. Also recognized in: a real recording studio patching a microphone's real output into a real tape deck instead of the venue's real speakers, a real plumbing system's diverter valve sending real water to a different real outlet without changing the real faucet at all, and a real logging framework swapping its own real output destination (console, file, network) without changing a single real, calling `log.info(...)` line anywhere in an application.

### SE Lens

The real design principle: **every one of `LiveColorServer`'s own real, already-written `print()` calls keeps working, completely unchanged, the moment `sys.stdout` is redirected** - this is the real, concrete payoff of `print()` never hard-coding "the console" internally. The real alternative not chosen: rewriting every real `print(...)` call in `stl_processor.py` into something like `log_to_widget(...)` instead, by hand. That alternative would work, but the real, honest cost this app would pay for it: every real, future `print()` call anywhere else in this codebase - and there are many, across `Mastercam app.py`'s own real code before this session's own refactor, and inside `LiveColorServer` itself - would need the identical real, manual rewrite too, forever, or silently fall back to being invisible again. Redirecting `sys.stdout` once catches every one of them, past and future, without touching a single existing real line.

### Commands needed

- `python verification/mastercam-phase-02/lab_stdout_redirect.py` — Runs the real, throwaway file directly with the real Python interpreter, from inside manufacturing-platform's own repo root.

### Verification

```text
captured.lines is now: ['this goes into capture, not the real console', '\n', 'so does this', '\n']
```

Full saved run: `verification/mastercam-phase-02/lab_stdout_redirect_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Connect the pieces

Two real `print()` calls, followed end to end: `sys.stdout`, an ordinary real variable, gets reassigned to a real, throwaway `CapturingStream`; both real calls' own text lands in a real, plain Python list instead of the console, confirmed only once `sys.stdout` is restored and a third, real `print()` finally shows what was captured. Combined with Lesson M2.1's own real `sys.excepthook` fix, this app now has real, concrete, evidence-backed answers for both real halves of "there is no terminal" - uncaught exceptions (M2.1) and ordinary logging output (this lesson) - neither one requiring a single existing real line of this app's own code, including `LiveColorServer`'s, to change.

**Next lesson:** Actually displaying what gets caught - a real PySide6 window with a real text area, and the one real, non-obvious constraint this app's own `LiveColorServer` background threads make unavoidable: a background thread can never safely touch that window directly.