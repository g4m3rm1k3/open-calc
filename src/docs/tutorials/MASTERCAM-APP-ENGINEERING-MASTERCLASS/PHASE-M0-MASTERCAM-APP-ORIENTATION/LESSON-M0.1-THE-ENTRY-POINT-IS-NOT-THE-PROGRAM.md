# Lesson M0.1: The Entry Point Is Not the Program

*File paths under mastercam-app/... refer to the real manufacturing-platform repository's mastercam-app folder - the actual, live PySide6 desktop app this curriculum is built from. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Two small, throwaway proofs, each actually run this session: first, that importing a Python file never runs its top-level actions by itself - something has to deliberately call them, and `if __name__ == "__main__":` is the real mechanism that does; second, that a path built from a file's own location moves when that file moves, silently, unless something accounts for exactly how deep the file sits. Then this app's own real main.py/mastercam_app/app.py split, and its own real mastercam_app/paths.py, traced against both proofs - the transferable problem: a program's real starting point, and any path it computes relative to its own files, are never accidents of where a file happens to sit - they are real, deliberate decisions this session's own refactor of this exact app got wrong once, then fixed.

**What you need to know first:** Nothing - this is the first lesson in this track.

## Terms used in this lesson

- **module** — One real Python file, and the actual unit Python's own `import` statement operates on. Every `.py` file is a module the moment something else imports it - "module" names that role, not a different kind of file.
- **package** — A real directory containing a real `__init__.py` file (even an empty one), which is what lets Python treat that directory - and its own subdirectories, each with their own `__init__.py` - as one importable, dotted namespace (`mastercam_app.paths`, `mastercam_app.parsing.parser`). It exists so real, related modules can be grouped and imported by one shared dotted name instead of each needing its own top-level, unqualified name that could collide with an unrelated module of the same name.
- **entry point** — The one real file a running program was actually launched FROM - the file named on the real command line (`python main.py`) - as opposed to any other file that only ever gets reached by being imported. It exists as a named concept because a real program can have many files but only ever has one real starting point per run, and that starting point is not automatically the same as "the file with the most important code in it."
- **`__name__`** — A real, automatically-set variable every Python module gets for free, with no import needed. Python sets it to the literal string `"__main__"` only in the one real file actually run directly as the entry point; in every other file, reached only by being imported, Python sets it to that file's own real module name instead. It exists so a single file can genuinely tell, at real run time, whether it's being run directly or merely imported by something else - nothing else in the language reveals that distinction.
- **`if __name__ == "__main__":`** — A real, ordinary `if` statement, using the real `__name__` variable above, wrapped around code that should run only when this exact file is the real entry point - never when it's merely imported by something else. It exists because importing a module always runs every top-level statement in it once, unconditionally (the first unit below proves this directly) - without this guard, code meant only for "when this file is run directly" would also run the moment anything, anywhere, merely imported the file to reuse one function from it.
- **`__file__`** — A real, automatically-set variable, present in every module, whose value is that specific module's own file path on disk. It exists so code can find things relative to *itself* - a template folder, a config file - without depending on the current working directory, which changes depending on where a program happens to be launched from and is never guaranteed to match where the code's own files actually live.
- **composition root** — The one deliberate place in a real program where the pieces that do the actual work get built and wired together - here, where a real window gets constructed and shown - kept separate from the code that defines what those pieces are and how they behave. It exists so the wiring (what gets built, in what order) can change without touching the logic being wired, and so the logic itself can be imported - by a test, by another tool - without that import alone triggering the wiring and putting a real window on screen.
- **frozen-build detection** — A real, deliberate check for whether the currently-running program is an ordinary Python script or a packaged, standalone `.exe` built by PyInstaller - checked here via `getattr(sys, 'frozen', False)` (a real, three-argument builtin call: look up the real attribute named `'frozen'` on the real `sys` module, and hand back the plain value `False` instead of raising an error if `sys` has no such attribute at all) together with `sys._MEIPASS` (a real attribute PyInstaller itself adds to `sys` only inside a frozen build, naming the real temporary folder its bundled data files were extracted into). It exists because a frozen `.exe`'s real bundled files live somewhere Windows itself chose at that run's own extraction time, never at any fixed path relative to this module's own real `__file__` the way they do in ordinary development.

## Objects and methods used

- **`mastercam_app.app.main`**
  - *What it is:* A real, ordinary, zero-argument function - the one place in this entire app that actually builds and shows the real main window.
  - *Implementation:* `def main() -> None:`, defined at mastercam_app/app.py:1129-1134. Its real body: `app = QApplication(sys.argv)`, then `app.setStyle("Fusion")`, then `window = DataViewer()`, then `window.show()`, then `sys.exit(app.exec())`.
  - *Its use:* It's the one real function main.py's own entry-point guard calls - the unit below about main.py's own real split traces exactly why main.py itself stays this thin instead of doing this work directly.
  - *Type:* A real, module-level function, defined once, at mastercam_app/app.py's own top level.
  - *Responsibility:* Build this app's one real top-level window and keep the program alive, showing it, until a real user closes it - full stop. Nothing about what that window actually does once shown is this function's job; that's the composition root's whole point (Terms, above) - the wiring is kept separate from the logic it wires together.
  - *Depends on:* Nothing passed to it directly - it's called with zero arguments. What it needs already exists as real names imported at the top of its own module, mastercam_app/app.py, before this function is ever defined.
  - *Connects to:* Called from exactly one real place in this whole app: main.py's own `if __name__ == "__main__":` guard (the unit below about main.py's own real split). Nothing inside the mastercam_app package itself calls it - a package calling its own real entry-point function from inside itself would mean building and showing a real window as a side effect of merely being imported, exactly the failure this lesson's first unit proves doesn't happen here.
  - *Shape:* Returns nothing at all (a real `None`, implicitly) - it only finishes running once the entire program is done, since the real work inside it (showing a window, waiting for the user) is something to wait through, not a value to hand back to whatever called it.

- **`pathlib.Path`**
  - *What it is:* The real, standard-library class representing one filesystem path - not the file's actual bytes, just the real, structured path to it.
  - *Implementation:* Constructed here as `Path(__file__)` (Terms, above, for `__file__`) - real methods/properties chained onto it: `.resolve()` (returns a new, real `Path`, with any `.`/`..` segments and symlinks resolved away, guaranteeing an absolute, unambiguous real path back) and `.parent` (a real property, not a method - no `()` - returning a new `Path` naming the real directory one level up from whatever path it's read on).
  - *Its use:* mastercam_app/paths.py's own real `get_base_path()` (the later units below, about this app's own real path resolution) builds one from its own `__file__`, then walks upward from it with two real, chained `.parent` reads to find this real app's real templates/config/vendor folders - never a fixed, hardcoded string path.
  - *Type:* A real class from Python's own standard library (`pathlib`), instantiated fresh each time `Path(...)` is called.
  - *Responsibility:* Represent one real filesystem path and provide real, structured operations on it (walking to a parent, resolving it to an absolute form, joining it with more path segments) without a program ever having to hand-edit path strings itself.
  - *Depends on:* A real starting string or `os.PathLike` value to build from - here, always the real, automatic `__file__` value of whichever module constructs one.
  - *Connects to:* `get_base_path()` (the later units below, about this app's own real path resolution) chains `.resolve()` then `.parent` twice onto the one it builds from `__file__`, then joins the real result with `"templates"`/`"config"`/`"vendor"` elsewhere in the same file to find this app's own real bundled folders.
  - *Shape:* Every real operation shown in this lesson (`.resolve()`, `.parent`) returns a brand-new, real `Path` object, never mutating the one it was called on - chaining more calls always keeps building forward onto a fresh value, never editing one in place.

## Concept Unit: Importing a Module Never Runs It the Same Way Launching It Does

### The Problem

mastercam-app is launched by running one specific file, `python main.py`. But main.py's own job (the unit below about main.py's own real split) depends on it also being possible to `import` real pieces of this same app - its dataclasses, its parser - from other files, without that import alone launching the whole real app, popping a window open. Right now, with nothing shown yet: is "a file gets imported" and "a file gets run directly" already the same real event in Python, or two genuinely different ones?

Before reading on:

- If you `import` a file that has `print("hello")` sitting at its own top level, with no function wrapping it at all - does that print run? Why do you expect that, before trying it?
- Now suppose that same `print("hello")` sits inside a function, and the file that defines the function is only ever imported, never run directly - does defining a function that prints something also print it, the moment it's defined?
- Given your answers to both: what would have to be true about *when* Python decides to run a module's own top-level code, for import and direct-launch to ever behave differently at all?

### Project Change

- **Reference Source:** No reference counterpart - this is a from-scratch, throwaway teaching example, one level below main.py itself, built to prove the exact mechanism main.py (the unit below about main.py's own real split) depends on.
- **Files affected:** `verification/mastercam-phase-00/lab_lib_greet.py` (new), `verification/mastercam-phase-00/lab_run_lib.py` (new)
- **Change type:** add
- **Location:** New files, no existing project to place them within.
- **Dependencies:** Nothing beyond Python's own standard library.

### The New Code

Two small files, typed fresh. First, verification/mastercam-phase-00/lab_lib_greet.py - a module defining one real function, nothing else. Second, verification/mastercam-phase-00/lab_run_lib.py - a genuinely separate, new file, importing that function and using the real `__name__` guard (Terms, above) around the one real line that actually calls it:

**File:** `verification/mastercam-phase-00/lab_lib_greet.py` (new)

```python
def greet():
    print("greet() actually ran")
```

**File:** `verification/mastercam-phase-00/lab_run_lib.py` (new)

```python
from lab_lib_greet import greet

if __name__ == "__main__":
    greet()
```

### Mechanical Walkthrough

- `def greet():` — Defines a real, ordinary function - defining it does not call it. Python fully reads and stores this function object the moment the file it's in first runs, top to bottom, but storing a function and calling it are two separate, real events - defining `greet` here does not, by itself, print anything at all, no matter how the file containing it is later reached (imported or run directly).
- `from lab_lib_greet import greet` — A real, ordinary import statement - it runs `lab_lib_greet.py` from the top, once, storing whatever names get defined there, then binds the one name `greet` into this file's own namespace. Running `lab_lib_greet.py`'s own top-level code happens here, as a real, direct consequence of this import - but `lab_lib_greet.py` has no top-level `print`, `greet()` call, or any other executable statement outside the function's own definition, so nothing observable happens yet.
- `__name__` — Full treatment above (Terms) - this specific real read of it is what this whole unit exists to prove correct: Python sets it to the literal string `"__main__"` in this file specifically only when this file is the one actually run directly (`python lab_run_lib.py`), and to `"lab_run_lib"` (this file's own real module name) in every other case, including being imported by something else.
- `if __name__ == "__main__":` — Full treatment above (Terms) - a real, ordinary comparison against the literal string `"__main__"`, using nothing but an already-familiar `if` statement and the `==` operator. This specific `if` is what decides, at real run time, whether the line indented under it executes at all.
- `greet()` — The real function call, only reached when the `if` above is true. This is the one and only place, in either file, that actually calls the function defined earlier - proving the gap between "a function exists, having been defined" and "a function has actually run" is real, and that this guard is what closes that gap deliberately, on purpose, rather than by accident of import order.

### CS Lens

This is the real distinction between **definition** and **execution** - a program's text fully describes what a function *would* do, completely, before any of it has actually happened even once. Also recognized in: a written recipe (having the instructions on a card cooks nothing by itself), a musical score (notated, complete, and silent until an actual performance), and a compiled-but-not-yet-run program sitting on disk (the compiler already proved it's well-formed; none of it has executed yet).

### SE Lens

The real alternative this pattern avoids: a file that just runs its real work directly at its own top level, with no guard at all. That alternative is not hypothetical - it's exactly what lab_lib_greet.py itself would become if `greet()` were called directly at the file's own top level instead of staying inside a function: importing it anywhere, for any reason, would immediately print `"greet() actually ran"` as a real, unavoidable side effect of the import alone. The real, honest cost of the guard actually used here: every file meant to be both importable *and* runnable directly needs this exact boilerplate line, by hand, in every such file - Python has no way to infer "this code should only run when launched directly" from an unguarded statement's own shape alone.

### Commands needed

- `python verification/mastercam-phase-00/lab_lib_greet.py` — Not run this way in this lesson's own verification below - it's only ever imported here - but running it directly would print nothing either, since it has no top-level executable statement at all outside the function definition.
- `python -c "import lab_lib_greet"` — Runs the real Python interpreter with `-c`, executing the quoted string as a real one-line program - here, a real import of lab_lib_greet, with nothing else after it, run from inside verification/mastercam-phase-00/ so the plain module name resolves.
- `python verification/mastercam-phase-00/lab_run_lib.py` — Runs lab_run_lib.py directly with the real Python interpreter - this specific real invocation is what sets that file's own `__name__` to `"__main__"`.

### Verification

```text
=== import only, no run ===
(nothing printed above this line)

=== python lab_run_lib.py ===
greet() actually ran
```

Full saved run: `verification/mastercam-phase-00/lab_entry_point_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this track.

## Concept Unit: main.py's Own Real Split: A Thin Entry Point, a Separate Composition Root

### The Problem

The lab above proved import and direct-launch are two real, different events. mastercam-app's own real main.py (mastercam-app/main.py) needs to do the second one specifically - build and show a real window - without that same building-and-showing also happening merely from importing pieces of this app elsewhere, the same way lab_lib_greet.py never printed anything just from being imported. Given the lab above, and knowing main.py needs to both import real app code and eventually show a real window: where, concretely, would you put the line that actually shows the window, and why there specifically?

Before reading on:

- Given the lab above, what real, single word would have to appear in main.py for anything to actually run when it's launched, rather than just defined or imported?
- If main.py itself contained the full, real logic for building a window - not just calling one already-written function for it - what would happen the moment some other, unrelated file imported one small thing from main.py?
- Look at the real function name `main` in mastercam_app.app.main (Objects and methods, above) - before reading its real body below, what does the name alone suggest its one job is?

### Project Change

- **Reference Source:** mastercam-app/main.py:1-10 (quoted in full, the whole real file):
"""
Entry point. Run this file to start the app - `python main.py`, or as the
PyInstaller entry script once a build is set up. Everything real lives in
the mastercam_app package next to this file.
"""

from mastercam_app.app import main

if __name__ == "__main__":
    main()

mastercam-app/mastercam_app/app.py:1129-1134 (quoted in full, main()'s
real body):
def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = DataViewer()
    window.show()
    sys.exit(app.exec())
- **Files affected:** `mastercam-app/main.py` (existing), `mastercam-app/mastercam_app/app.py` (existing)
- **Change type:** none
- **Location:** Nothing is being typed in this unit - both real files already exist, already in exactly this shape, from this session's own earlier package restructure. This unit reads and traces them.
- **Dependencies:** The lab in the unit above, proving importing a module never runs it the same way launching it does - this unit only makes sense once import-vs-run is already proven, not before.

### The Updated Project

mastercam-app/main.py, the whole real file, already existing, nothing typed here - read top to bottom:

**File:** `mastercam-app/main.py` (already exists — read-only, nothing to type)

```python
"""
Entry point. Run this file to start the app - `python main.py`, or as the
PyInstaller entry script once a build is set up. Everything real lives in
the mastercam_app package next to this file.
"""

from mastercam_app.app import main

if __name__ == "__main__":
    main()
```

### Mechanical Walkthrough

- `from mastercam_app.app import main` — A real, ordinary import - identical in kind to "from lab_lib_greet import greet" in the unit above, just spelled with a real, dotted package path (mastercam_app.app) instead of a bare module name, since mastercam_app is a real package (Terms, above), not a lone file. Running this import line runs mastercam_app/app.py from its own top, once, storing every real name defined there - including the real `main` function - but mastercam_app/app.py has no top-level `main()` call sitting unguarded anywhere in it, so nothing observable happens yet, exactly matching the lab above.
- `if __name__ == "__main__":` — The identical real guard from the unit above's own throwaway lab, doing the identical real job: this specific comparison is what decides whether the line indented under it - the one line that actually shows a window - runs at all. This is the real, single point in this entire app where that decision gets made.
- `main()` — The real call, reached only when the guard above is true - calling the real function characterized in full above (Objects and methods). This is the one place, in this whole app, where that function is ever called - not from inside mastercam_app itself, only from here, main.py, deliberately kept outside the mastercam_app package (composition root, Terms above): a real design choice, not an accident of where the file happened to be saved, since it guarantees importing anything at all from inside mastercam_app - a dataclass, a parser function, this very `main` function itself - can never, by itself, cause a real window to appear.

### Execution Trace

1. `python main.py` starts a real, single process - Python reads main.py from its own top, in order.
2. `from mastercam_app.app import main` runs first - this recursively runs mastercam_app/app.py's own top-level code once (its own imports, its own class/function definitions), then binds the one real name `main` into main.py's own namespace. Nothing shown on screen yet - no window exists at this point.
3. `if __name__ == "__main__":` runs next, in main.py - since main.py is the file actually launched, `__name__` really is `"__main__"` here, so the guard is true and its body runs.
4. `main()` is called - only now does mastercam_app.app.main's own real body run: a real `QApplication` gets built, a real `DataViewer` window gets built and shown, and the program blocks inside `app.exec()`, waiting - this is the first real moment anything becomes visible, and it happens only because this exact call, in this exact file, was reached.

### CS Lens

This is the **composition root** pattern (Terms, above) put to real use: one deliberate real place - main.py's own guarded call - where the pieces get wired together and set running, kept apart from mastercam_app/app.py's own real definitions of what those pieces are. Also recognized in: a stage play's actual performance (the script, fully written, is not the performance itself - a director decides the one real moment the curtain actually rises), a factory floor's start-of-shift procedure (every machine and station already exists, fully built, before any one deliberate signal actually sets the line running), and a compiled program's own real linker step (every function already exists in the compiled object files; linking decides which one is the actual, single starting point).

### SE Lens

The real alternative not chosen here: writing mastercam_app/app.py itself so that building and showing the real window happens directly at that file's own top level, the same way `greet()` being called unguarded at lab_lib_greet.py's own top level would have printed on every import in the unit above. That alternative is not just messier - it would make mastercam_app/app.py genuinely unimportable for any other real reason (reading its real `DataViewer` class from a test, or from a future lesson's own throwaway lab) without a real window popping open as a real, unavoidable side effect every single time. The real, honest cost of the split actually used here: there are now two real files (main.py and mastercam_app/app.py) a reader has to know about instead of one, and the actual moment the app starts is one real import-and-one-call away from the file most of this app's own real logic lives in, not sitting directly inside it.

### Commands needed

- `python main.py` — Runs the real, actual entry point, from inside the mastercam-app/ folder, with the real Python interpreter - this is the one real command that ever sets main.py's own `__name__` to `\"__main__\"`.

### Verification

```text
=== import mastercam_app.app alone (no main() call) ===
module imported - no window, no QApplication, nothing shown

=== python main.py (real entry point), killed by timeout after 5s ===
exit code: 124  (124 = timeout killed it while running - reached the Qt event loop, no crash, no traceback)
```

Full saved run: `verification/mastercam-phase-00/lab_real_entry_point_output.txt`.

### Connection to the previous unit

The unit above proved import-vs-run as a raw mechanism, using two small, throwaway files; this unit showed this real app's own actual main.py leaning on that exact same mechanism, for the exact same reason - so importing this app's own real code never has the side effect of putting a window on screen.

## Concept Unit: A Path Built From a File's Own Location Moves When That File Moves

### The Problem

mastercam-app needs to find its own real templates/, config/, and vendor/ folders at run time, no matter where on disk this whole app happens to be installed - a real, hardcoded absolute path like `C:\Users\g4m3r\...` would only work on this one real machine. Given `__file__` (Terms, above) names wherever a module's own file happens to sit: if two real files, in two different real folders, both compute a path from their own `__file__`, would you expect those two computed paths to come out the same, or different - and specifically, does the answer change if the two files contain the exact same code?

Before reading on:

- If `Path(__file__).parent` names the real folder a file sits in, and you copy the exact same code into a file one folder deeper, does the exact same code compute the exact same real answer both times?
- This app's own mastercam_app/paths.py needs to find templates/, which sits next to main.py, not next to paths.py itself (paths.py lives one folder deeper, inside mastercam_app/). Given your answer above, what would `Path(__file__).parent` alone get wrong here?
- What real, concrete fix would close that one-folder-deep gap, using only what `Path` already gives you?

### Project Change

- **Reference Source:** mastercam-app/mastercam_app/paths.py:19-29 (quoted in full, the
whole real function):
def get_base_path() -> Path:
    """
    Return the project's real base path - the directory holding
    templates/, config/, and vendor/ (sibling to main.py) - handling both
    a frozen PyInstaller build (bundled data extracts to sys._MEIPASS) and
    dev mode. This file lives one package level inside mastercam_app/, so
    dev mode needs parent.parent, not parent, to land on that directory.
    """
    if getattr(sys, 'frozen', False):
        return Path(sys._MEIPASS)
    return Path(__file__).resolve().parent.parent
- **Files affected:** `verification/mastercam-phase-00/lab_shallow/lab_where_am_i.py` (new), `verification/mastercam-phase-00/lab_shallow/lab_deep/lab_where_am_i.py` (new), `mastercam-app/mastercam_app/paths.py` (existing)
- **Change type:** add
- **Location:** The two new throwaway lab files go in fresh, nested folders (one inside the other) with no existing project to place them within. mastercam-app/mastercam_app/paths.py already exists, already in exactly the shape shown - read, not typed, in this unit.
- **Dependencies:** Nothing beyond Python's own standard library.

This exact function is real, hard-won evidence from this session's own earlier work: before mastercam_app/paths.py lived one folder inside a real mastercam_app package, this same function's real dev-mode line read `return Path(__file__).parent` - a single `.parent`, no `.resolve()`, no second `.parent`. That single-`.parent` version was correct back then, because the file itself sat directly next to templates/ at the time. Moving the file one folder deeper, into mastercam_app/, without also fixing this line, would have silently broken every real templates/config/vendor lookup in the entire app - not with an error naming this function, but with confusing "file not found" failures somewhere else entirely, later, whenever something tried to actually use one of those folders.

### The New Code

Two small files, typed fresh, the exact same code in both, deliberately - one directly inside verification/mastercam-phase-00/lab_shallow/, one folder deeper, inside verification/mastercam-phase-00/lab_shallow/lab_deep/:

**File:** `verification/mastercam-phase-00/lab_shallow/lab_where_am_i.py` (new)

```python
from pathlib import Path
print(Path(__file__).parent)
```

**File:** `verification/mastercam-phase-00/lab_shallow/lab_deep/lab_where_am_i.py` (new)

```python
from pathlib import Path
print(Path(__file__).parent)
```

### Mechanical Walkthrough

- `from pathlib import Path` — A real, ordinary import from Python's own standard library - brings the real `Path` class (Objects and methods, above) into this file's own namespace; nothing external installed, nothing project-specific.
- `Path(__file__)` — Full treatment above (Objects and methods, for `Path`; Terms, above, for `__file__`) - builds one real `Path` object from whichever real file this exact line sits in, at the moment this line actually runs.
- `.parent` — Full treatment above (Objects and methods) - a real property read, not a method call, returning a new, real `Path` naming the real folder one level up from wherever `Path(__file__)` just pointed. Since the two files here sit one real folder apart on disk, and each computes this from its own real `__file__`, this one identical line necessarily produces two different real answers - proven directly in Verification, below.
- `print(...)` — An already-familiar real call, printing whatever real `Path` `.parent` just returned, so the real, computed answer is actually visible in Verification below, rather than only existing silently inside the running program.

### CS Lens

This is **relative resolution** - a value computed not from a fixed, absolute reference, but from wherever the computing code itself currently sits. Also recognized in: a "you are here" map marker (the exact same physical map means something different depending on which real wall it's mounted on), a relative filesystem path typed into a terminal (`../config` names a genuinely different real file depending on the real folder the terminal is currently sitting in when it's typed), and a recursive function's own real base case, computed fresh relative to whichever call frame is currently running, not to some single, fixed, global value shared by every call.

### SE Lens

The real alternative this project doesn't use: a single, hardcoded absolute path (something like `C:\Users\g4m3r\...\mastercam-app`) written directly into the source, instead of computing one from `__file__` at all. That alternative fails for a real, concrete reason, not a style preference - it would only ever be correct on the one real machine, in the one real folder, it happened to be written on, breaking the instant this app is copied, cloned, or installed anywhere else. The real, honest cost of the `__file__`-relative approach actually used instead: it is only correct as long as every file computing a path this way correctly accounts for its own real depth inside the project - exactly the real mistake this session's own earlier refactor made and then fixed, moving mastercam_app/paths.py one folder deeper without updating its own `.parent` count to match, a real, concrete maintenance cost this specific technique carries that a database of pre-computed absolute paths, decided once at install time, would not.

### Commands needed

- `python verification/mastercam-phase-00/lab_shallow/lab_where_am_i.py` — Runs the shallower of the two identical files directly with the real Python interpreter, from inside manufacturing-platform's own real repository root.
- `python verification/mastercam-phase-00/lab_shallow/lab_deep/lab_where_am_i.py` — Runs the exact same code, one real folder deeper, the same way, right after the command above - run second, deliberately, so the two real outputs sit next to each other in Verification, below.

### Verification

```text
=== python lab_shallow/lab_where_am_i.py ===
C:\Users\g4m3r\Documents\manufacturing-platform\verification\mastercam-phase-00\lab_shallow

=== python lab_shallow/lab_deep/lab_where_am_i.py (identical code, one folder deeper) ===
C:\Users\g4m3r\Documents\manufacturing-platform\verification\mastercam-phase-00\lab_shallow\lab_deep
```

Full saved run: `verification/mastercam-phase-00/lab_path_depth_output.txt`.

### Connection to the previous unit

The unit above traced main.py's real entry-point split; this unit shows the real file one step past that split, mastercam_app/app.py's own sibling mastercam_app/paths.py, depends on knowing exactly how deep inside the real package it itself sits - the same real package structure just traced is what this unit's own fix actually accounts for.

## Concept Unit: get_base_path()'s Real Fix, Verified Against This App's Own Real Folders

### The Problem

The unit above proved `Path(__file__).parent` gives a different real answer depending on a file's own real depth. mastercam-app's own real mastercam_app/paths.py sits one real folder inside mastercam_app/ - one level deeper than main.py, and one level deeper than templates/, config/, and vendor/ themselves, which all sit directly next to main.py. Given the lab above proved one `.parent` names one folder up: how many real `.parent` reads would it actually take, from inside mastercam_app/paths.py, to land back on the real folder holding templates/, config/, and vendor/?

Before reading on:

- mastercam_app/paths.py sits at mastercam-app/mastercam_app/paths.py. templates/ sits at mastercam-app/templates/. Counting real folder levels only, how many `.parent` reads does it take to go from paths.py's own file to the folder holding templates/?
- Given your answer, does mastercam_app/paths.py's own real code (Project Change, above) actually use that many?
- This exact function used to say `return Path(__file__).parent` - one `.parent`, before this session's own refactor moved paths.py one folder deeper into mastercam_app/. What real, concrete symptom would you expect to see, at run time, if that one-`.parent` version had been left unchanged after the move?

### Project Change

- **Reference Source:** mastercam-app/mastercam_app/paths.py:19-29 (identical citation to
the unit above's own reference source - same real function, now
actually run and verified rather than only read).
- **Files affected:** `mastercam-app/mastercam_app/paths.py` (existing)
- **Change type:** none
- **Location:** Nothing new is typed in this unit - it runs the real, already-existing function shown in the unit above, and verifies its real, actual output directly.
- **Dependencies:** The unit above's own real lab - this unit's own real `.parent.parent` claim only means something once "one `.parent` equals one real folder up" is already proven.

### CS Lens

This is **verification against a real, expected structural invariant** - not just "does this run without an error," but "does it land on the specific real folder it was supposed to." Also recognized in: a surveyor checking a building's real corner against its own recorded coordinates (not just "is a corner there," but "is it exactly where the plan says it should be"), and a checksum comparison after a file transfer (not "did some bytes arrive," but "do these specific bytes match the specific bytes that were sent").

### SE Lens

The real alternative this unit avoids: trusting that `.parent.parent` is correct because it reads correctly, the same way the original, since-fixed single-`.parent` version also once read correctly, right up until paths.py actually moved. The real, honest point this unit makes by actually running the function instead of only reading it: source that reads plausibly correct and source that is verified correct are not the same claim, and this exact function is real, first-hand proof from this session that the gap between them can hide a real bug - the single-`.parent` version would have read exactly as plausibly as the `.parent.parent` version does now, to someone who hadn't traced the real folder depth by hand.

### Commands needed

- `python -c "import sys; sys.path.insert(0, '.'); from mastercam_app.paths import get_base_path; print(get_base_path())"` — Runs a real, one-line Python program (`-c`) from inside mastercam-app/: adds the current real folder to Python's own import search path, imports the real, already-existing `get_base_path` function, calls it, and prints its real, computed answer - this is the exact real function from Concept Unit 3's own citation, actually run, not just read.

### Verification

```text
=== mastercam_app/paths.py's real get_base_path(), called fresh this run ===
get_base_path() -> C:\Users\g4m3r\Documents\manufacturing-platform\mastercam-app
templates/ exists there: True
config/ exists there: True
vendor/ exists there: True

If get_base_path() used bare Path(__file__).parent instead of .parent.parent:
  it would resolve to -> C:\Users\g4m3r\Documents\manufacturing-platform\mastercam-app\mastercam_app
  templates/ exists there: False
```

Full saved run: `verification/mastercam-phase-00/lab_get_base_path_output.txt`.

### Connection to the previous unit

The unit above proved `.parent`'s real behavior in isolation, two throwaway files at two real depths; this unit ran mastercam-app's own real `get_base_path()` and confirmed, directly, both that its real `.parent.parent` genuinely lands on the folder holding templates/config/vendor, and that the real, once-shipped single-`.parent` alternative genuinely would not have.

## Connect the pieces

One real value, traced start to finish: launching this app for real, `python main.py`, is the one real event that sets main.py's own `__name__` to `"__main__"` (the first unit's own proof, using lab_lib_greet.py/lab_run_lib.py, applied for real) - which is what lets main.py's own guard actually call mastercam_app.app.main (the second unit, about main.py's own real split), which is the one real place this whole app ever builds and shows its real window. Nothing about reaching that point required knowing where on disk this app's own files live - except that mastercam_app.app.main, once running, needs mastercam_app/paths.py's own real get_base_path() to find templates/, config/, and vendor/, and that function only gets the real answer right because it counts its own real distance from those folders correctly (the last two units, tracing that same real path-resolution function) - two real `.parent` reads, not one, because paths.py itself sits two real folders away from them, not one. Every one of these four units traces the same real app, verified fresh this session, not a hypothetical one.

**Next lesson:** The real parsing pipeline this app's own entry point eventually reaches once a real window is open: how a real Mastercam XML export becomes a real, structured Part object, traced through this app's own real dataclasses and its own real parser function.