# Lesson 6: One Interface, Many Implementations

## What you will build

Rust support alongside the Python execution from Lesson 5, added without
an `if language == "python": ... elif language == "rust": ...` chain
growing inside the route itself. The feature is "run more languages";
the actual subject is a pattern for adding a new implementation of
something without touching the code that already works — and a real,
verified difference between compiled and interpreted languages that this
project now has to handle honestly.

## What you need to know first

`Lesson 5 - Running Code.md` — `subprocess.run`, the traversal/existence
checks reused unchanged, `try`/`except TimeoutExpired`.

**Toolchain note, checked directly on this machine, not assumed:**
`rustc`/`cargo` are installed; `g++`/`gcc` are not. This lesson adds Rust
for that reason — C++ isn't available to test against yet, and nothing
here claims support for a compiler that doesn't exist on this system.

---

## Concept Unit: pulling the one hardcoded case out on its own

### The Problem

Lesson 5's `run_file` had `subprocess.run(["python", ...])` written
directly inside the route. Adding a second language means the route
needs to *choose* which command to run, not run one hardcoded command —
and that choice has to happen before anything about Rust exists yet.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — refactor. The `subprocess.run` call previously
  inline in `run_file` is extracted into its own function.
- **Location** — new function `run_python`, added directly above
  `run_file`.
- **Dependencies** — none new.

### The New Code — type this

```python
def run_python(target_file: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["python", str(target_file)],
        capture_output=True,
        text=True,
        timeout=5,
        cwd=CONTENT_DIR,
    )
```

### The Updated Project — where this lives

Now see it in place:

```python
def run_python(target_file: Path) -> subprocess.CompletedProcess:   # ← new
    return subprocess.run(                                          # ← new
        ["python", str(target_file)],                                # ← new
        capture_output=True,                                         # ← new
        text=True,                                                   # ← new
        timeout=5,                                                   # ← new
        cwd=CONTENT_DIR,                                             # ← new
    )                                                                 # ← new


@app.post("/run")
def run_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.suffix != ".py":
        raise HTTPException(status_code=400, detail="Only .py files can be run")

    try:
        result = subprocess.run(          # ← still the old inline call, for now
            ["python", str(target_file)],
            capture_output=True,
            text=True,
            timeout=5,
            cwd=CONTENT_DIR,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Execution timed out")

    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exit_code": result.returncode,
    }
```

`run_python` now exists as its own function, identical in behavior to
the code still sitting inline in `run_file` below it — this unit doesn't
wire them together yet; that's deliberate, so the extraction itself can
be verified as behavior-preserving before anything else changes.

### Mechanical Walkthrough

`def run_python(target_file: Path) -> subprocess.CompletedProcess:` adds
a **return type annotation** — `-> subprocess.CompletedProcess` — the
first one in this project. Like the parameter type hints already used
throughout, this doesn't change runtime behavior; it documents, in a way
tools and readers can both check, exactly what kind of value this
function hands back.

### SE Lens

This step alone doesn't fix anything or add capability — it's pure
preparation. Extracting working code into its own function *before*
introducing what it needs to coexist with is a deliberate sequencing
choice: verify the extraction changed nothing, independently of whatever
comes next, rather than doing the extraction and the new feature in one
tangled step where a bug could be hiding in either half.

---

## Concept Unit: choosing an implementation by looking it up, not branching

### The Problem

`run_file` needs to run either `run_python` or a new `run_rust`,
depending on the file's extension — and every future language after
that, without this function growing an `if`/`elif`/`elif`/`elif` chain
one arm longer for each one.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — replace. The inline `subprocess.run` call and the
  `.py`-only extension check are both replaced.
- **Location** — inside `run_file`, and a new `RUNNERS` dictionary added
  just above it.
- **Dependencies** — `run_python` from the previous unit; `run_rust`,
  built in the next unit.

### The New Code — type this

```python
RUNNERS = {
    ".py": run_python,
    ".rs": run_rust,
}
```

With that dictionary in place, `run_file` no longer needs to know about
either language by name:

```python
runner = RUNNERS.get(target_file.suffix)
if runner is None:
    raise HTTPException(status_code=400, detail=f"Cannot run {target_file.suffix} files")

try:
    result = runner(target_file)
except subprocess.TimeoutExpired:
    raise HTTPException(status_code=408, detail="Execution timed out")
```

### The Updated Project — where this lives

Now see it in place:

```python
RUNNERS = {                    # ← new
    ".py": run_python,          # ← new
    ".rs": run_rust,             # ← new
}                                  # ← new


@app.post("/run")
def run_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    runner = RUNNERS.get(target_file.suffix)                                    # ← changed
    if runner is None:                                                          # ← changed
        raise HTTPException(status_code=400, detail=f"Cannot run {target_file.suffix} files")  # ← changed

    try:
        result = runner(target_file)          # ← changed: was a hardcoded subprocess.run call
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Execution timed out")

    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exit_code": result.returncode,
    }
```

`run_file` no longer knows anything about Python or Rust specifically —
it knows how to look up *some* function by extension and call it. Adding
a third language later means adding one line to `RUNNERS` and writing
one new function; `run_file` itself doesn't change again.

### Mechanical Walkthrough

`RUNNERS` is a dictionary whose values are the functions themselves —
`run_python`, not `run_python()` — a function referenced by name,
without calling it, is a value like any other in Python, storable in a
dict, passable around, and called later. `RUNNERS.get(target_file.suffix)`
looks up the extension; `.get(...)` (rather than `RUNNERS[...]`) returns
`None` for a missing key instead of raising an error, which is exactly
what the very next line checks for. `f"Cannot run {target_file.suffix}
files"` is this project's first **f-string** — a string literal prefixed
with `f`, where anything inside `{}` is evaluated and inserted directly
into the resulting string, rather than built by hand with `+`
concatenation; here it drops the actual unsupported extension into the
error message so `.txt`, `.js`, or anything else names itself in the
response instead of a generic complaint. `runner(target_file)` calls
whichever function was found, with the same argument regardless of which
one it is.

### CS Lens — the same idea as Lesson 1's decorator, made visible

Back in Lesson 1, `@app.get("/health")` was a decorator quietly
registering `health_check` in FastAPI's own internal routing table —
"look up the right function based on the URL" — without that table ever
being shown directly. `RUNNERS` is the identical idea, a **dispatch
table**, written out explicitly and by hand this time: a direct mapping
from a key (there, a URL path; here, a file extension) to the function
that handles it. Seeing the same underlying pattern in an invisible,
framework-managed form and then in a plain, visible dictionary is worth
more than either alone — it's the same tool, reached for consciously
this time instead of hidden inside someone else's decorator. Also
recognized in: a C++ compiler's vtable, dispatching a virtual method
call to the right override at runtime; a bytecode interpreter's opcode
table, mapping each instruction byte to the function that executes it;
a plugin system mapping a file extension or MIME type to the handler
registered for it — this project's own `RUNNERS`, structurally, is a
tiny plugin system for languages.

### SE Lens — the alternative, and why it gets worse over time

The alternative is a chain of `if target_file.suffix == ".py": ... elif
target_file.suffix == ".rs": ...` directly inside `run_file`. For two
languages, that's barely worse than `RUNNERS`. For ten, it's ten branches
inside one function that now has to be read top to bottom to find the
one that matters, and every new language means editing a function that
already works, risking every language already handled by it. `RUNNERS`
means every new language is purely additive — a new function, one new
dictionary entry, nothing existing touched or re-read.

---

## Concept Unit: a language that has to be built before it can run

### The Problem

Python's `run_python` runs the source file directly — there's no
separate "turn this into something runnable" step. Rust has one:
`.rs` source isn't executable on its own; it has to be **compiled** into
a real program first, and that compilation step can itself fail before
the program ever runs at all.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add, a new `run_rust` function.
- **Location** — directly below `run_python`.
- **Dependencies** — `rustc`, confirmed installed on this machine.

### The New Code — type this

```python
def run_rust(target_file: Path) -> subprocess.CompletedProcess:
    binary_path = target_file.with_suffix(".exe")

    compile_result = subprocess.run(
        ["rustc", str(target_file), "-o", str(binary_path)],
        capture_output=True,
        text=True,
        timeout=10,
        cwd=CONTENT_DIR,
    )
    if compile_result.returncode != 0:
        return compile_result

    return subprocess.run(
        [str(binary_path)],
        capture_output=True,
        text=True,
        timeout=5,
        cwd=CONTENT_DIR,
    )
```

### The Updated Project — where this lives

Now see it in place, sitting right below the function from the first
unit:

```python
def run_python(target_file: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["python", str(target_file)],
        capture_output=True,
        text=True,
        timeout=5,
        cwd=CONTENT_DIR,
    )


def run_rust(target_file: Path) -> subprocess.CompletedProcess:            # ← new
    binary_path = target_file.with_suffix(".exe")                          # ← new

    compile_result = subprocess.run(                                       # ← new
        ["rustc", str(target_file), "-o", str(binary_path)],                # ← new
        capture_output=True,                                                # ← new
        text=True,                                                          # ← new
        timeout=10,                                                         # ← new
        cwd=CONTENT_DIR,                                                    # ← new
    )                                                                        # ← new
    if compile_result.returncode != 0:                                      # ← new
        return compile_result                                               # ← new

    return subprocess.run(                                                  # ← new
        [str(binary_path)],                                                 # ← new
        capture_output=True,                                                # ← new
        text=True,                                                          # ← new
        timeout=5,                                                          # ← new
        cwd=CONTENT_DIR,                                                    # ← new
    )                                                                        # ← new
```

Both functions now share the exact same signature and return type
`run_file` expects — that shared shape is what makes them interchangeable
inside `RUNNERS` without `run_file` needing to know which one it's
calling.

### Mechanical Walkthrough

`target_file.with_suffix(".exe")` builds a new path from `target_file`
with its extension replaced — `hello.rs` becomes `hello.exe`, the same
`Path` object pattern from `.parent` in Lesson 2, a different property
this time. The first `subprocess.run` invokes `rustc` — Rust's compiler —
with `-o` naming where to write the compiled binary; this step can take
noticeably longer than running an already-interpreted script, hence a
longer `timeout=10` instead of `5`. `if compile_result.returncode != 0:
return compile_result` is the key branch: a failed compile is returned
immediately, with the compiler's own error message sitting in `.stderr`,
and the second `subprocess.run` — actually running the program — never
happens at all.

### CS Lens — compiled vs. interpreted, confirmed directly

Python's `run_python` runs `main.py` directly — one process, one step.
Rust's `run_rust` runs *two* processes in sequence: `rustc` translates
source into a real, standalone executable first, and only a second,
separate process runs that executable. This is the actual, structural
difference between a **compiled** and an **interpreted** language, not
just a performance talking point — confirmed directly on this project's
own broken test file:

```
rustc broken.rs -o broken_test.exe
error: expected expression, found `;`
 --> broken_test.rs:1:21
  |
1 | fn main() { let x = ; }
  |                     ^ expected expression

error: aborting due to 1 previous error
exit code: 1
```

A syntax error here is caught *before* anything resembling "running the
program" happens at all — there is no partial execution to speak of, the
compile step itself simply refuses. A Python script with a syntax error,
by contrast, fails inside the single `run_python` step, indistinguishable
at this project's current level of detail from any other runtime error.

### Run It

```
POST /run?path=src/hello.rs  → 200 {"stdout":"Hello from Rust.\n","stderr":"","exit_code":0}
POST /run?path=src/broken.rs → 200 {"stdout":"","stderr":"error: expected expression, found `;`\n...","exit_code":1}
POST /run?path=src/main.py   → 200 {"stdout":"Hello from the sample project.\n","stderr":"","exit_code":0}  (unchanged from Lesson 5)
```

---

## Concept Unit: not leaving a compiled binary behind

### The Problem

`run_rust` writes a real `.exe` (and, on this compiler, a `.pdb` debug
file alongside it) into `content/src/` — the same folder the file
browser lists. Left there, a compiled binary shows up as a browsable,
clickable file next to the source that produced it, and clicking it in
the editor would trip `read_file`'s "not readable as text" error from
Lesson 3.

### Concept Lab

```python
def risky():
    try:
        print("trying")
        return "success"
    finally:
        print("cleanup runs no matter what")

print(risky())

def risky_with_error():
    try:
        print("trying")
        raise ValueError("boom")
    finally:
        print("cleanup runs no matter what, even here")

try:
    risky_with_error()
except ValueError:
    print("caught it after cleanup ran")
```

Run it. Actual output, in order:

```
trying
cleanup runs no matter what
success
trying
cleanup runs no matter what, even here
caught it after cleanup ran
```

### What This Proves

In `risky()`, `finally`'s `print` runs *before* the function's `return`
value actually reaches the caller — cleanup happens even on the
successful path, not just when something goes wrong. In
`risky_with_error()`, the order matters more: `finally`'s `print` runs
*before* the `ValueError` propagates out to the `except` that catches
it — `finally` runs on the way out regardless of whether the exit is a
normal `return` or an exception in flight, and only after `finally`
finishes does the exception continue on its way.

### Discard

`risky` and `risky_with_error` are deleted now — neither appears in the
project. The real `finally` guarantees a compiled binary gets deleted
regardless of whether running it succeeded, failed, or timed out.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — replace, wrapping the second `subprocess.run` call
  inside `run_rust` from the previous unit.
- **Dependencies** — none new.

### The New Code — type this

```python
try:
    return subprocess.run(
        [str(binary_path)],
        capture_output=True,
        text=True,
        timeout=5,
        cwd=CONTENT_DIR,
    )
finally:
    binary_path.unlink(missing_ok=True)
    binary_path.with_suffix(".pdb").unlink(missing_ok=True)
```

### The Updated Project — where this lives

Now see it in place, replacing the plain `return subprocess.run(...)`
from the previous unit's version of `run_rust`:

```python
def run_rust(target_file: Path) -> subprocess.CompletedProcess:
    binary_path = target_file.with_suffix(".exe")

    compile_result = subprocess.run(
        ["rustc", str(target_file), "-o", str(binary_path)],
        capture_output=True,
        text=True,
        timeout=10,
        cwd=CONTENT_DIR,
    )
    if compile_result.returncode != 0:
        return compile_result

    try:                                                       # ← new
        return subprocess.run(                                  # ← changed: now inside try
            [str(binary_path)],
            capture_output=True,
            text=True,
            timeout=5,
            cwd=CONTENT_DIR,
        )
    finally:                                                    # ← new
        binary_path.unlink(missing_ok=True)                      # ← new
        binary_path.with_suffix(".pdb").unlink(missing_ok=True)  # ← new
```

`run_rust` is now complete: compile, run only on a successful compile,
and — regardless of whether running the binary succeeded, failed, or
even timed out — always delete the compiled artifacts before returning.

### Mechanical Walkthrough

`finally:` is new — every earlier `try` in this project (Lessons 3 and
5) only ever had an `except`. A `finally` block runs *unconditionally*
after the `try`, whether the code inside it succeeded, raised an
exception that got caught elsewhere, or is actively in the middle of
returning a value — `return subprocess.run(...)` inside the `try` still
lets `finally` run before that return value actually leaves the
function. `binary_path.unlink(missing_ok=True)` deletes the file;
`missing_ok=True` means "don't raise an error if it's already gone,"
defensive against the (unlikely, but real) case where compilation
reported success but somehow didn't leave a binary behind.

### CS Lens — guaranteed cleanup, not cleanup-if-convenient

Without `finally`, a `subprocess.TimeoutExpired` raised by the second
`subprocess.run` — the actual run, not the compile — would propagate up
out of `run_rust` immediately, skipping any cleanup code written *after*
the `return`, leaving the compiled binary behind forever. `finally` is
specifically the language's answer to "this cleanup must happen no
matter which of several different ways this block could end." Also
recognized in: Python's own `with` statement (a context manager's
`__exit__` is guaranteed to run, built on this same principle); Java's
try-with-resources and C#'s `using`, both doing the identical thing with
different syntax; C++'s RAII, where a destructor runs when an object
goes out of scope regardless of how the enclosing function exits; a
database connection pool releasing a connection back to the pool no
matter whether the query that used it succeeded or threw.

### Run It

Directory listing of `content/src/`, before and after running
`hello.rs` through the real running server:

```
before: broken.rs  hello.rs  infinite_loop.py  main.py  utils.py
POST /run?path=src/hello.rs → 200 {"stdout":"Hello from Rust.\n", ...}
after:  broken.rs  hello.rs  infinite_loop.py  main.py  utils.py
```

Confirmed directly — identical file listing before and after, despite a
real compile and a real binary execution having happened in between.

---

## Connect the pieces

Click Run on `hello.rs`: `runFile()` (unchanged since Lesson 5) sends
`POST /run?path=src/hello.rs`. `run_file` resolves and verifies the
path, then looks `.rs` up in `RUNNERS` and finds `run_rust` — the exact
same lookup that would have found `run_python` for a `.py` file, with
`run_file` itself never branching on which one it got. `run_rust` compiles
`hello.rs` into `hello.exe`; the compile succeeds, so the second
`subprocess.run` actually executes it, capturing `"Hello from Rust.\n"`.
The `finally` block deletes `hello.exe` and `hello.pdb` before the
function returns, regardless of what just happened. `run_file` receives
the same `stdout`/`stderr`/`exit_code` shape `run_python` would have
returned, and the frontend — which has never been told anything about
Rust specifically — displays it exactly the way it displays Python
output.

## What breaks without this

Already demonstrated concretely, not hypothetically: without the
`try`/`finally`, running `hello.rs` leaves `hello.exe` and `hello.pdb`
sitting in `content/src/`, confirmed directly with a real before/after
directory listing earlier in this lesson — a real, growing pile of
compiled artifacts, one per run, cluttering a folder meant to hold source
files.

## Exercises

1. Run `broken.rs` through the actual app and confirm the compiler error
   shows up in the output panel, styled as an error, the same way a
   Python `stderr` does.
2. Temporarily remove the `finally:` block, run `hello.rs`, and confirm
   `hello.exe`/`hello.pdb` are left behind — then restore it.
3. Write a `.rs` file that compiles successfully but panics at runtime
   (e.g. `fn main() { panic!("boom"); }`) and run it — confirm the
   compiled binary still gets cleaned up even though the *run* step, not
   the compile step, is what failed this time.

## Definition of done

- [ ] You've run both a working and a broken `.rs` file through the real
      app and seen the difference between a compile failure and a
      successful run
- [ ] You've confirmed, yourself, that no `.exe`/`.pdb` files are left
      behind after running Rust code
- [ ] You can explain what `RUNNERS.get(...)` returning `None` means, and
      why `.get()` was used instead of `RUNNERS[...]`
- [ ] You can name the actual, structural difference between a compiled
      and an interpreted language, not just "compiled is faster"
- [ ] You can explain what `finally` guarantees that `except` alone
      doesn't
- [ ] `git commit` this lesson's code with a message explaining why
