# Lesson 1: Asking the Filesystem for Something It Might Not Have

**What you will build** — The first working slice of a small command-line
**file inspector**: a Python script that opens a real text file, reads its
full content, and prints it back out. That feature is deliberately small.
The actual subject of this lesson is what has to be true for that feature
to work *safely*: your program does not own the file, does not control
whether it still exists, and cannot assume the operating system will hand
it over on request. You'll build the happy path first, then deliberately
break it, then fix it properly — ending with a script that opens a file,
guarantees the handle gets released whether or not something goes wrong,
and fails on purpose, with a clear message, instead of crashing with a raw
traceback when the file simply isn't there.

**What you need to know first** — Nothing from this curriculum; this is
Lesson 1. This lesson assumes the general programming background the
curriculum's BRD states up front: you already know variables, functions,
and ordinary control flow in some language. Nothing here re-teaches those.
Everything below is Python-specific machinery you have not necessarily
seen before, even if you've written plenty of software already.

**Terms used in this lesson**

- **File handle** — a live connection between your running program and one
  specific open file, handed back to you by the operating system. It is
  not the file's content and not the file itself — it's a reference your
  program uses on every later request ("read from *that* one," "close
  *that* one"). It exists because your program's memory and the disk are
  two separate things; something has to track *which* open connection
  you mean when you make a second request against the same file.
- **Resource** — anything a program acquires from outside its own memory
  that has a limited lifetime and must eventually be given back: a file
  handle, a network socket, a lock. Unlike an ordinary variable, holding
  one too long or forgetting to release it affects things outside your
  own program — the operating system keeps a limited table of how many
  files any process may have open at once.
- **Exception** — Python's mechanism for signaling that an operation could
  not complete as asked, by immediately abandoning normal line-by-line
  execution and searching outward for something willing to handle this
  specific kind of failure. It exists so failure doesn't require a manual
  "did that actually work?" check after every single operation — the
  language does the checking and jumping for you, automatically.
- **Raising** — the act of actually triggering an exception, as opposed to
  the exception type merely existing as a class. The instant execution
  stops following its normal, written order.
- **Propagating / unwinding the call stack** — what happens between an
  exception being raised and it being caught, or reaching the top with
  nothing catching it. Python exits each function that was in progress,
  one after another, outward, running none of the code that came after
  the line that raised, until something catches it or there's nothing
  left to unwind. This matters because code written *after* the failing
  line does not run with some error value in it — it does not run at all.
- **Traceback** — the report Python prints when an exception unwinds all
  the way to the top of the program with nothing catching it: the chain
  of calls that were active at the moment of failure, followed by the
  exception's type and message. It exists to answer "where, exactly, did
  this go wrong," because by the time you're reading it, the normal call
  stack that was running your program is already gone.
- **`with` statement** — Python syntax that wraps a block of code around a
  resource, guaranteeing a specific cleanup action runs when the block
  ends, whether it ends normally or because an exception blew through it.
  It exists to remove the possibility of *forgetting* to release a
  resource on one of the less-common exit paths out of a block of code.
- **Context manager protocol** — the actual mechanism `with` is built on:
  any object that defines two specific methods (`__enter__` and
  `__exit__`) can be used after `with`, and Python calls those two real
  methods for you at the right moments. It exists so `with` isn't a
  special case hard-coded for files specifically — anything that
  implements the same two-method shape gets the same guarantee, for free.
- **`try` block** — the region of code you're willing to say "an exception
  might happen somewhere in here" about. It exists to scope *where*
  Python should even be watching for a failure, rather than watching
  every single line of the entire program at all times.
- **`except` clause** — the handler attached to a `try` block that names
  one specific kind of exception it's willing to catch, plus the code to
  run if that exact kind occurs. It exists so you can respond to the one
  failure you actually anticipated without silently swallowing every
  other kind of bug your program might also have.
- **`except ... as e` binding** — the part of an `except` clause that gives
  the caught exception object a name (`e`, here) so your handler can
  actually inspect it — its message, and in this lesson's case, which
  file it was and what the operating system's own error code was.
- **Stream position / cursor** — the file handle's internal bookkeeping of
  *how far into the file* the next read should start from. It exists
  because "read the file" has to mean something specific on the second
  call, not just replay the same answer — the handle remembers where the
  previous read left off.
- **Text mode** — `open()`'s default behavior: bytes coming off the disk
  are decoded into a Python `str` for you, using a text encoding, before
  you ever see them. This lesson only reads plain text and doesn't dig
  into what "decoded" means or what happens when the bytes don't decode
  cleanly — that's encoding and binary data, and it gets a real, dedicated
  treatment later in this module, not here.

**Objects and methods used**

- **`open()`**
  - *What it is:* a built-in Python function — not a method on any object,
    just a free-standing function available everywhere, no import needed.
  - *Implementation:* real signature, from this session's own interpreter
    (Python 3.13):
    ```python
    open(file, mode='r', buffering=-1, encoding=None, errors=None,
         newline=None, closefd=True, opener=None)
    ```
    Only `file` is required; every other parameter has a default. With no
    `mode` argument, it defaults to `'r'` — read, text mode.
  - *Its use:* this lesson's very first line of project code, `open("shift_log.txt")`,
    calls it with only the one required argument, accepting every default.
- **`_io.TextIOWrapper`**
  - *What it is:* the real, concrete class `open()` actually constructs and
    returns when you open a file in the default text mode. Not `file`, not
    some generic "file object" — that specific class, living in Python's
    own `io` module.
  - *Implementation:* verified this session by asking the running
    interpreter directly, not assumed:
    ```python
    >>> type(f)
    <class '_io.TextIOWrapper'>
    ```
  - *Its use:* it's the object `f` actually refers to after
    `f = open("shift_log.txt")` — every method this lesson calls on `f`
    (`.read()`, `.close()`, reading `.closed`, and the two methods `with`
    calls for you) is a real method defined on this real class.
- **`.read()`**
  - *What it is:* a method on `TextIOWrapper` (and on file objects
    generally) that pulls the file's remaining, not-yet-read content out
    of the handle and hands it back as one value.
  - *Implementation:* takes no required argument in this lesson's usage
    and returns a single `str` containing everything from the handle's
    current stream position to the end of the file.
  - *Its use:* the line `contents = f.read()` is how the inspector actually
    gets the file's text into a variable it can print.
- **`.close()`**
  - *What it is:* a method on `TextIOWrapper` that releases the file
    handle back to the operating system.
  - *Implementation:* takes no arguments, returns `None`; after it runs,
    the handle can no longer be read from.
  - *Its use:* what a resource-management strategy has to guarantee gets
    called — either by calling it directly, or by using `with`, which
    calls it on your behalf.
- **`.closed`**
  - *What it is:* a read-only attribute on `TextIOWrapper` — a plain
    boolean value you can check, not a method you call.
  - *Implementation:* `False` immediately after `open()` succeeds, `True`
    after `.close()` has run (whether you called it yourself or `with`
    called it for you).
  - *Its use:* the concrete, checkable proof this lesson uses to show
    whether cleanup actually happened, instead of just asserting it.
- **`__enter__`**
  - *What it is:* one of the two real methods that make an object usable
    after Python's `with` keyword — part of the context manager protocol.
  - *Implementation:* on `TextIOWrapper`, verified this session:
    ```python
    >>> hasattr(f, "__enter__")
    True
    ```
    Calling it directly returns the file object itself.
  - *Its use:* the method `with open(...) as f:` calls, invisibly, the
    moment the `with` line runs — `f` is bound to whatever `__enter__`
    returned.
- **`__exit__`**
  - *What it is:* the other half of the context manager protocol — the
    method that runs when the `with` block ends, for any reason.
  - *Implementation:* on `TextIOWrapper`, verified this session:
    ```python
    >>> hasattr(f, "__exit__")
    True
    ```
    It closes the file, whether the block ended normally or an exception
    tore through it.
  - *Its use:* the actual mechanism behind `with`'s cleanup guarantee —
    shown directly, by calling it by hand, later in this lesson.
- **`FileNotFoundError`**
  - *What it is:* a built-in exception class representing one specific
    failure: the path you asked `open()` for does not exist.
  - *Implementation:* verified this session —
    `FileNotFoundError.__mro__` is
    `[FileNotFoundError, OSError, Exception, BaseException, object]`, and
    `FileNotFoundError.__doc__` is literally `'File not found.'`
  - *Its use:* what `open()` raises, automatically, when the file named
    doesn't exist — and the exact type this lesson's `except` clause
    names.
- **`OSError`**
  - *What it is:* `FileNotFoundError`'s parent class — the general base
    class for failures that come from the operating system, not from a
    mistake in your Python code.
  - *Implementation:* `OSError.__doc__` is `'Base class for I/O related
    errors.'` It declares the attributes every one of its subclasses
    (including `FileNotFoundError`) inherits: `errno` (the OS's own
    numeric error code), `strerror` (the OS's own text description), and
    `filename` (the path that was involved). Verified this session by
    constructing one and checking which attributes it actually has —
    `errno`, `strerror`, `filename`, and `filename2` were all present;
    `winerror` was not, because this session ran on macOS, not Windows,
    and that attribute only exists there.
  - *Its use:* this lesson reads `e.errno` and `e.filename` directly off a
    caught `FileNotFoundError` — those two attributes are declared on
    `OSError`, not redeclared on `FileNotFoundError` itself.

---

## Concept Unit: `open()` — Requesting a Handle to a File

### The Problem

A Python program's own variables live in the program's own memory. A file
on disk does not. Before the inspector can look at a file's content, it
first has to ask the operating system for a connection to that specific
file — something it can then use to make further requests ("give me your
content") against. That connection is a separate step from actually
getting the content, and it's the first thing the inspector needs.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition. This curriculum's BRD explicitly keeps this series independent
  of any existing reference codebase; there is nothing to port from here.
- **Files affected:** create `file-inspector/shift_log.txt` (the data the
  inspector will look at) and `file-inspector/inspector.py` (the program).
- **Change type:** add — both files are brand new.
- **Location:** n/a — `inspector.py` doesn't exist yet, so there's nothing
  to locate a position within.
- **Dependencies:** a working Python 3 install and nothing else — no
  third-party packages.

`shift_log.txt` should contain:

```
2026-08-15,machine-3,PASS
2026-08-15,machine-7,FAIL
2026-08-16,machine-3,PASS
```

### The New Code

Type this into `inspector.py`:

```python
f = open("shift_log.txt")
```

### The Updated Project

Skipped for this unit — the line above *is* the entire file so far.
There's no larger enclosing structure yet to show it living inside; that
starts with the next Concept Unit.

### Isolating the Concept

This is exactly what `open("shift_log.txt")` in `inspector.py` above is
doing, isolated, against a throwaway file instead of the project's own
data. In a scratch file `scratch.txt` containing one disposable line:

```python
scratch = open("scratch.txt")
print("type(scratch) =", type(scratch))
```

Real output from running that, this session:

```
type(scratch) = <class '_io.TextIOWrapper'>
```

That output proves two things at once. First, `open()` didn't hand back
the file's *content* — nothing about `"just a throwaway line"` appears
anywhere. Second, it didn't hand back some vague, generic "file object"
either — it's a specific, real, named class, `_io.TextIOWrapper`, the same
one `inspector.py`'s own `f` is an instance of. This connection between
your program and the file on disk is called a **file handle**.

### Discarding the Example

`scratch.txt` and the `scratch` variable above are thrown away now — they
exist only to prove what `open()` hands back in general. Nothing about
them appears in `inspector.py`, and they won't come up again.

### Mechanical Walkthrough

Every distinct element in `f = open("shift_log.txt")`, in order:

- **`open`** — a built-in function, meaning it's available in every Python
  program with no `import` statement, unlike almost everything else your
  code will ever call. It exists as a plain function, not a method on some
  "filesystem object," because opening a file is such a common operation
  that Python's designers made it one of the small set of names always in
  scope — you reach for it the same way in a five-line script as in a
  ten-thousand-line application.
- **`(...)`** — a function call. This is ordinary call syntax, not new
  here, but the specific thing being called *is* new: this call reaches
  outside your program's own process, to the operating system, and asks
  it to open a connection to a real file on disk. That's fundamentally
  different from calling a function that only computes something from
  values already sitting in memory — this call can fail for reasons that
  have nothing to do with anything your code did wrong (the file could be
  missing, or another program could have it locked).
- **`"shift_log.txt"`** — a string literal, given as `open`'s one required
  `file` argument. It's a *relative* path: no leading `/`, so the
  operating system resolves it against whatever directory the Python
  process is currently running from (its working directory), not against
  some fixed location baked into the code.
- **`f =`** — an ordinary assignment, binding the name `f` to whatever
  `open(...)` returns. What makes this specific assignment worth calling
  out is *what* gets bound: not a copy of the file's bytes, but a live
  handle — the `_io.TextIOWrapper` object shown in the isolated lab above.
  Every later operation this lesson performs on the file goes through `f`,
  not through the path string again.

### CS Lens

The general idea here — a small, opaque reference standing in for a
connection to some larger system resource, which you pass around instead
of touching the real thing directly — is called a **handle**.

Also recognized in: Unix file descriptors (the plain integer a running
process actually uses internally — `f` is Python's dressed-up version of
one), window handles in Win32 GUI programming, database connection
objects, socket objects for network connections, and GPU resource handles
in graphics APIs like Vulkan or DirectX.

### SE Lens

The alternative not chosen here is checking first: asking the filesystem
"does this file exist?" *before* calling `open()`, and only opening it if
the answer was yes. Python's standard library even provides a function for
exactly that (`os.path.exists`). It looks safer, but it's a real trap: the
file's existence can change in the gap between the check and the actual
`open()` call — another process could delete it in between. That gap is a
genuine, if narrow, window for a bug that only shows up occasionally,
under real-world timing, and would be miserable to reproduce. This
specific hazard — a check whose result can already be stale by the time
you act on it — has a name: **time-of-check to time-of-use (TOCTOU)**.

Python's own culture leans toward the opposite approach on purpose: just
attempt the operation, and handle the failure if it doesn't work out —
often summarized as "easier to ask forgiveness than permission" (EAFP)
rather than "look before you leap" (LBYL). `open()` reflects that: it
doesn't ask you to check anything first, it just tries, and fails loudly
if it can't. The debt this project is honestly carrying right now: this
Concept Unit's `inspector.py` doesn't yet do anything about that failure —
if `shift_log.txt` isn't there, the program will crash. That's the exact
problem a later Concept Unit in this same lesson fixes.

### Commands

`python3 inspector.py` is how you'll run this. `python3` is the command
that invokes the Python interpreter installed on your machine; the
argument after it, `inspector.py`, is the path to the script file you want
it to execute, top to bottom, as a program. Nothing in `inspector.py` so
far produces any output, so a successful run right now looks like: the
command finishes and returns you to your shell prompt with no error text
printed at all — silence is success, for this specific unit only.

### Run It

```
$ python3 inspector.py
$
```

No output yet — this fragment only opens the file; it doesn't read or
print anything. That's expected, and it's what "no `Traceback` printed"
looks like as a real, observed result rather than an assumption.

### Connecting the Dots

`f` now holds a real, live connection to `shift_log.txt` — the next
Concept Unit uses it to actually pull the file's content out.

---

## Concept Unit: `.read()` — Pulling Content Out of the Handle

### The Problem

`f` is a connection to the file, not the file's content. Nothing in
`inspector.py` so far has actually looked at what's inside
`shift_log.txt`. Opening a connection and reading what's on the other end
of it are two separate operations — the inspector needs the second one now.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch, same as
  the previous unit.
- **Files affected:** `file-inspector/inspector.py`.
- **Change type:** add.
- **Location:** directly after the existing `f = open("shift_log.txt")`
  line.
- **Dependencies:** none beyond what the previous unit already established.

### The New Code

```python
contents = f.read()
print(contents)
```

### The Updated Project

```python
f = open("shift_log.txt")
contents = f.read()          # ← new
print(contents)              # ← new
```

`inspector.py` now does something end-to-end: open the file, pull its
entire content into a string, and print that string to the terminal.

### Isolating the Concept

This is exactly what `f.read()` in `inspector.py` above is doing,
isolated — but called *twice*, against a throwaway file, to show
something a single call can't: the handle remembers where it left off.

```python
scratch = open("scratch2.txt")   # contains: "first\nsecond\n"
first_call = scratch.read()
second_call = scratch.read()
print("repr(first_call) =", repr(first_call))
print("repr(second_call) =", repr(second_call))
```

Real output from running that, this session:

```
repr(first_call) = 'first\nsecond\n'
repr(second_call) = ''
```

What actually happened, call by call:

1. `first_call = scratch.read()` — the handle's stream position starts at
   the very beginning of the file, since nothing has been read from it
   yet, so this call consumes the entire file and returns everything in
   it: `'first\nsecond\n'`.
2. `second_call = scratch.read()` — the handle's stream position is now
   sitting at the end of the file, left there by the first call. There is
   nothing between the current position and the end, so this call returns
   the empty string `''` — not an error, and not the same content again.

That's the concept this lesson calls a **stream position**: the handle
isn't a snapshot of the file, it's a cursor that moves forward as you
consume it.

### Discarding the Example

`scratch2.txt`, `scratch`, `first_call`, and `second_call` above are
thrown away now. `inspector.py` only ever calls `.read()` once per run, so
the second-call-returns-empty behavior shown above won't itself reappear
in the project — it existed only to prove the handle carries a position.

### Mechanical Walkthrough

Every distinct element in `contents = f.read()` and `print(contents)`, in
order:

- **`f.read`** — attribute access on `f`, looking up the `.read` method
  that lives on `f`'s real class, `_io.TextIOWrapper` (established in the
  previous Concept Unit).
- **`()`** — the call itself, with no arguments. Given no argument, `.read()`
  means "give me everything from the current stream position to the end
  of the file," rather than some fixed chunk size.
- **the return value** — a single Python `str`. Verified this session:
  reading `shift_log.txt`'s three lines back with `repr()` around the
  result shows `'2026-08-15,machine-3,PASS\n2026-08-15,machine-7,FAIL\n2026-08-16,machine-3,PASS\n'`
  — one string, newline characters included, not a list of separate lines.
- **`contents =`** — assignment, binding that returned string to a new
  name. Worth calling out specifically here because of what it implies
  about memory: the *entire* file's text now exists twice at once while
  this line runs — once inside the handle's own internal buffer, and once
  again as this separate `str` that `contents` now refers to.
- **`print(contents)`** — `print` is a built-in function, already familiar
  from general programming experience; called here with the `str` from the
  line above as its one argument. Worth restating even though `print`
  itself isn't new: what it's printing is the *file's* content now, not a
  literal you typed — the first moment `inspector.py` actually shows you
  something it read from outside itself.

### CS Lens

The idea that reading advances an internal position, so the same read
operation called again doesn't repeat itself, is the general concept of a
**stream** — data exposed as a sequence you consume progressively, rather
than as a fixed, randomly-addressable block.

Also recognized in: TCP network sockets (a byte stream — you can't "read
byte 500" without having read everything before it first), Python's own
iterators and generators (each `next()` call advances internal state the
same way), Unix pipes connecting one program's output to another's input,
and database result-set cursors — literally named "cursor," for the same
reason this lesson calls it a stream position.

### SE Lens

The alternative not chosen here is reading the file in smaller pieces —
line by line, or in fixed-size chunks — instead of pulling the whole thing
into memory with one `.read()` call. Chunked or line-by-line reading scales
to files far larger than available memory, at the cost of code that has to
manage partial progress across multiple calls instead of getting one
finished answer back immediately. `.read()` with no argument is the
simplest possible choice, and it is a real, current debt: nothing about
`inspector.py` right now limits how large a file it will try to pull
entirely into memory at once. A multi-gigabyte log file would make this
exact line attempt to allocate a multi-gigabyte string. That tradeoff —
simplicity now versus an unbounded memory cost later — is deliberately
left as-is for this small lesson; streaming and buffering get their own
real treatment later in this module, not a shortcut here.

### Commands

Still `python3 inspector.py` — the same Python interpreter command as the
previous unit, still telling it to execute `inspector.py` top to bottom.
What counts as success now looks different than last time, because this
unit added output: a successful run prints the file's own three lines to
the terminal, with no `Traceback` block anywhere in the output.

### Run It

```
$ python3 inspector.py
2026-08-15,machine-3,PASS
2026-08-15,machine-7,FAIL
2026-08-16,machine-3,PASS

```

That trailing blank line is real, not a formatting accident — `contents`
already ends with a newline character (from the file itself), and `print`
adds one more of its own after it.

### Connecting the Dots

The inspector can now open a file and show what's in it, end to end — but
nothing releases the handle `open()` created back to the operating system
when it's done. The next Concept Unit fixes that.

---

## Concept Unit: `with` — Guaranteeing the Handle Gets Released

### The Problem

`inspector.py` opens a handle and never closes it. As written, that's
merely sloppy for a script this small and short-lived — but it points at
a real question: whatever code eventually *does* close it, what happens
if something goes wrong between opening the file and reaching that
`close()` call? An exception raised partway through would skip right past
it, the same way it skips past everything else written after the line
that failed. The inspector needs a way to guarantee release happens no
matter what — not a way that merely works when nothing goes wrong.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch.
- **Files affected:** `file-inspector/inspector.py`.
- **Change type:** replace — the bare `open()` call is replaced with a
  `with`-based version; nothing about what the program *does* changes yet,
  only how the handle's lifetime is managed.
- **Location:** the two existing lines, `f = open("shift_log.txt")` and
  `contents = f.read()`, both change.
- **Dependencies:** none beyond what earlier units in this lesson already
  established.

### The New Code

```python
with open("shift_log.txt") as f:
    contents = f.read()
```

### The Updated Project

```python
with open("shift_log.txt") as f:   # ← changed: was `f = open("shift_log.txt")`
    contents = f.read()            # ← now indented inside the with block
print(contents)
```

`inspector.py` still opens the file and prints its content — from the
outside, running it produces identical output to the previous unit. What's
different is invisible in the output: the file handle is now guaranteed to
be closed by the time `print(contents)` runs, whether or not anything
between `open` and here went wrong.

### Isolating the Concept

This concept needs two contrasting throwaway examples, because the point
is a *difference in behavior* that only shows up when something fails —
not something a single working example could demonstrate on its own.

**First, the failure this `with` line above actually prevents** — a
throwaway version using a bare `open()` and a manual `close()`, the same
shape `inspector.py` itself used before this unit, deliberately broken
with an exception in between:

```python
class Boom(Exception):
    pass

g = open("shift_log.txt")
try:
    raise Boom("something went wrong before g.close() runs")
    g.close()
except Boom as e:
    print("caught:", e)
print("g.closed after the exception:", g.closed)
```

Real output, this session:

```
caught: something went wrong before g.close() runs
g.closed after the exception: False
```

What actually happened, in order:

1. `g = open("shift_log.txt")` — succeeds normally; `g` now holds a real,
   open handle, exactly like `f` did before this unit.
2. `raise Boom(...)` — execution abandons the `try` block immediately;
   nothing written after this line, inside this block, will run.
3. `g.close()` — never runs. It was typed, it's sitting right there in the
   source, and Python still never executes it, because the line above
   already jumped past it on its way out of the block.
4. `except Boom as e:` — catches the exception one line later, but nothing
   in this handler closes `g` either — it only prints the message.
5. `print("g.closed...", g.closed)` → `False` — concrete proof, not an
   assertion: the handle genuinely never got closed, because the one line
   that would have closed it was the one line the exception skipped.

**Second, what `with` actually does differently** — the same failure,
this time wrapped in `with` instead of manual `open`/`close`:

```python
h = None
try:
    with open("shift_log.txt") as h:
        raise Boom("something went wrong inside the with block")
except Boom as e:
    print("caught:", e)
print("h.closed after the exception:", h.closed)
```

Real output, this session:

```
caught: something went wrong inside the with block
h.closed after the exception: True
```

This time:

1. `with open("shift_log.txt") as h:` — opens the file and calls a real
   method on the resulting handle, `__enter__()`, which for a file simply
   returns the handle itself; that's what gets bound to `h`.
2. `raise Boom(...)` — abandons the `with` block's body immediately,
   exactly the same way it abandoned the `try` block in the version above.
3. Before the exception is allowed to keep propagating past the `with`
   line, Python calls `h.__exit__(...)` on its own — not because this code
   wrote a call to it anywhere, but because running `__exit__` on the way
   out is `with`'s entire job. This is the one step in this whole trace
   that has no corresponding line of source code at all.
4. `except Boom as e:` — catches the exception, identically to the manual
   version.
5. `print("h.closed...", h.closed)` → `True` — this time the handle really
   was closed, even though this code never wrote a `.close()` call
   anywhere, because `__exit__` already ran, invisibly, one step earlier.

That invisible step is not something to take on faith. It can be shown
directly, by calling the same two methods `with` calls, by hand:

```python
m = open("shift_log.txt")
entered = m.__enter__()
print("entered is m:", entered is m)
try:
    contents = entered.read()
finally:
    m.__exit__(None, None, None)
print("repr(contents) =", repr(contents))
print("m.closed =", m.closed)
```

Real output, this session:

```
entered is m: True
repr(contents) = '2026-08-15,machine-3,PASS\n2026-08-15,machine-7,FAIL\n2026-08-16,machine-3,PASS\n'
m.closed = True
```

`entered is m` being `True` proves `__enter__()` just hands back the same
file object for a file handle. And `m.closed` being `True` after an
explicit `m.__exit__(None, None, None)` call proves `__exit__` really is
an ordinary method you could call yourself — `with` is not a special
language-level exception to how the rest of Python works, it's syntax
that calls these two real, inspectable methods for you, at fixed points,
so you can't forget to. This is called the **context manager protocol**,
and any object that defines both `__enter__` and `__exit__` gets the same
`with` support a file object has — nothing about it is file-specific.

### Discarding the Example

`Boom`, `g`, `h`, `m`, and `entered` above are all thrown away now — none
of them appear in `inspector.py`. They existed only to prove, concretely,
what `with` guarantees that a bare `open()` does not.

### Mechanical Walkthrough

Every distinct element in `with open("shift_log.txt") as f:` and its
indented body, in order:

- **`with`** — a keyword introducing a block whose entry and exit both run
  through a context manager's `__enter__`/`__exit__` methods, guaranteeing
  the exit call happens even if the block raises. Restated in full here
  even though it was already named as a term above, per this schema's own
  rule that reappearing constructs get the same real treatment as new
  ones: it exists specifically to remove the "forgot to close it on the
  error path" bug class shown in the isolated lab above.
- **`open("shift_log.txt")`** — the same call from Concept Unit 1, still
  returning a `_io.TextIOWrapper`. What's different this time is only what
  happens to that returned object next: instead of a plain assignment, it
  goes straight into `with`, which immediately calls `__enter__()` on it.
- **`as f`** — binds `f` to whatever `__enter__()` returned — for a file
  object, itself, as proven above by `entered is m` being `True`. This is
  not a plain assignment; it's `with`'s own syntax for capturing
  `__enter__`'s return value.
- **`:` and the indented block below it** — marks which lines are
  considered "inside" the `with` block, and therefore covered by its
  cleanup guarantee. `contents = f.read()` is the only line inside it
  here; `print(contents)`, outside the indentation, is not — by the time
  it runs, `__exit__` has already fired and `f` is already closed, even
  though `contents` (the string, already pulled out) is still perfectly
  usable.

### CS Lens

Guaranteeing a cleanup action runs no matter how a block of code exits —
normally, or via an exception — is a recurring idea usually discussed
under **RAII** (resource acquisition is initialization) or, more broadly,
**scope-bound resource management**.

Also recognized in: C++'s RAII pattern itself (a destructor runs when an
object goes out of scope, exception or not), Java's and C#'s
try-with-resources / `using` statements (the same guarantee, different
keyword), database transaction blocks that auto-rollback if an exception
escapes them, and `with lock:` in concurrent Python code, guaranteeing a
lock gets released even if the code holding it crashes.

### SE Lens

The alternative not chosen here is `try`/`finally` with an explicit
`.close()` call in the `finally` block — that actually works, and
guarantees the same thing `with` does. It's more to type, though, and more
to get subtly wrong: forgetting the `finally`, or putting the `close()`
call in the wrong branch, produces exactly the silent bug shown in this
unit's first isolated example, except now it's a bug in code that *looks*
like it was trying to handle cleanup. `with` moves the guarantee onto the
object itself, via the context manager protocol, so there's structurally
nothing left to forget at each call site. The real cost is the one this
Concept Unit spent most of its isolated lab on: the guarantee is invisible
in the source unless you already know `__exit__` exists and runs on your
behalf — which is exactly why demystifying it, by calling it directly by
hand, mattered here rather than just asserting `with` "handles it."

### Commands

Still `python3 inspector.py`, same interpreter and same script as every
prior unit. Success looks identical to the previous unit's output — the
three log lines followed by a blank line — because this change is entirely
about how the handle's lifetime is managed, not about what gets printed.

### Run It

```
$ python3 inspector.py
2026-08-15,machine-3,PASS
2026-08-15,machine-7,FAIL
2026-08-16,machine-3,PASS

```

Identical output to the previous unit, on purpose — this change is only
observable by deliberately breaking something, which the next Concept
Unit does.

### Connecting the Dots

The handle is now guaranteed to close, but everything so far still assumes
`shift_log.txt` exists. The next Concept Unit removes that assumption.

---

## Concept Unit: `FileNotFoundError` — The File Might Not Have Been There At All

### The Problem

Every example so far assumed `shift_log.txt` exists, sitting right next to
`inspector.py`. A teammate could rename it. It might not have been
generated yet. Someone could run the script from the wrong directory. None
of that is a mistake in the code itself — it's the ordinary, expected
reality of a file that this program doesn't own or control. Right now,
`inspector.py` has no idea any of that is possible.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch.
- **Files affected:** none. `inspector.py` is not modified in this unit.
  This unit's job is to understand one new concept — the specific
  exception `open()` raises when a file doesn't exist — using throwaway
  code, before relating it back to the real `open()` call `inspector.py`
  has had since Concept Unit 1.
- **Change type:** none — observation and a throwaway diagnostic only. The
  fix that actually changes `inspector.py` to handle this is the next
  Concept Unit.
- **Location:** n/a — nothing in `inspector.py` changes.
- **Dependencies:** none beyond what earlier units already established.

### The New Code

A throwaway script, `crash_demo.py` — not `inspector.py` — deliberately
pointed at a file that doesn't exist:

```python
f = open("shift_log_backup.txt")
contents = f.read()
print(contents)
```

### The Updated Project

Skipped — this is throwaway code, not a change to `inspector.py`; there is
no project structure for it to live inside.

### Isolating the Concept

Running `crash_demo.py` above, this session, produced:

```
Traceback (most recent call last):
  File "crash_demo.py", line 1, in <module>
    f = open("shift_log_backup.txt")
FileNotFoundError: [Errno 2] No such file or directory: 'shift_log_backup.txt'
```

(As with every traceback in this lesson, the path shown before `, line 1`
will match wherever you actually saved the file on your own machine —
everything after it is exact, from a real run.)

This is exactly what would happen to `inspector.py`'s own
`open("shift_log.txt")` line, from Concept Unit 1 onward, if
`shift_log.txt` weren't there — same builtin function, same failure, only
the filename and the surrounding throwaway code differ. That traceback
proves the program didn't hang, didn't silently continue with an empty
`contents`, and didn't produce a vague generic error — it named the exact
failure, this lesson's next new concept: **`FileNotFoundError`**, with a
specific message.

To see the exception object itself, not just its printed traceback, catch
one and inspect it directly — a second, equally disposable script:

```python
try:
    open("shift_log_backup.txt")
except FileNotFoundError as e:
    print("type(e) =", type(e))
    print("e.errno =", e.errno)
    print("e.filename =", e.filename)
    print("str(e) =", str(e))
```

Real output, this session:

```
type(e) = <class 'FileNotFoundError'>
e.errno = 2
e.filename = shift_log_backup.txt
str(e) = [Errno 2] No such file or directory: 'shift_log_backup.txt'
```

This proves `FileNotFoundError` isn't just a label attached to a printed
message — it's a real object, carrying real, separately-readable data:
which numeric error code the operating system itself reported (`errno`,
here `2`, which is the actual POSIX code for "no such file or directory"
on every Unix-like system, including macOS and Linux), and which specific
path caused it (`filename`).

### Discarding the Example

`crash_demo.py` and the second diagnostic script above are both thrown
away now — neither one is part of `file-inspector/`. `inspector.py` itself
was never run against a missing file in this unit; the next Concept Unit
is what actually changes it to handle this failure.

### Mechanical Walkthrough

Every distinct element in the diagnostic's exception-handling line and the
attributes read off it, in order:

- **`FileNotFoundError`** — a built-in exception class. Its
  `__doc__`, read directly from this session's interpreter, is literally
  `'File not found.'` — Python's own documentation of itself, not a
  paraphrase.
- **inheriting from `OSError`** — verified this session via
  `FileNotFoundError.__mro__`, which is
  `[FileNotFoundError, OSError, Exception, BaseException, object]`. This
  is *why* `e.errno` and `e.filename` exist and are readable on a
  `FileNotFoundError` instance without `FileNotFoundError` itself
  declaring them: they belong to `OSError`, and `FileNotFoundError`
  inherits them the same way any subclass inherits its parent's
  attributes.
- **`e.errno`** — attribute access reading the operating system's own
  numeric error code off the caught exception object; here, `2`.
- **`e.filename`** — attribute access reading the specific path that was
  involved; here, the string `'shift_log_backup.txt'` — the same path that
  was passed to `open()`, carried along on the exception itself so a
  handler doesn't have to already know it from somewhere else.
- **`str(e)`** — converts the exception object to the same human-readable
  message text Python's own traceback printer uses:
  `[Errno 2] No such file or directory: 'shift_log_backup.txt'` — proving
  that message isn't special traceback-only formatting, it's just what
  `str()` produces from the object's own data.

### CS Lens

Signaling "the specific thing you asked for does not exist or is not
reachable" as its own distinct kind of failure, separate from a generic
error, recurs constantly.

Also recognized in: HTTP status code 404 — literally titled "Not Found,"
almost the exact same concept, over a network instead of a filesystem —
along with a database query that finds zero matching rows for a lookup
that expected exactly one, and a DNS lookup failing to resolve a hostname.

### SE Lens

The alternative not chosen here — not by this lesson, but by Python's own
design — is a sentinel return value: `open()` could have returned `None`,
or some placeholder "invalid handle," instead of raising. Some languages
and APIs do exactly that. The real tradeoff: an exception *cannot* be
silently ignored — an uncaught one crashes the program loudly, which is
what just happened above. A sentinel return value can be silently
ignored — forget to check whether `open()` returned `None`, and the very
next line calling `.read()` on it fails with a *different*, more confusing
error that no longer clearly points back at "the file wasn't there." The
other direction of that same tradeoff is real too: exceptions carry their
own runtime cost, and jumping outward through several function calls at
once can make a program's control flow harder to trace by reading it top
to bottom than a value you can just check inline. Python's standard
library leans toward raising for this class of failure; this lesson's own
`inspector.py`, as of this unit, still hasn't done anything about it —
that's the debt the next Concept Unit pays off.

### Commands

Still `python3` — the same interpreter command as every prior unit — but
run against the two throwaway scripts above (`python3 crash_demo.py`, then
`python3 attr_demo.py`) instead of `inspector.py`. For `crash_demo.py`,
"success" here doesn't mean silence or expected output; it means
confirming the *specific* failure shown above: a `Traceback` ending in
`FileNotFoundError`, not a hang, not a silent wrong answer, and not some
other exception type. For `attr_demo.py`, success means the four `print()`
lines shown above, with no traceback at all — the exception was caught.

### Run It

Already shown above, as the isolating example — this unit's entire content
*is* a real run, deliberately pointed at a failure, with the actual
traceback pasted in rather than described.

### Connecting the Dots

`inspector.py` now has a name for exactly what can go wrong — `FileNotFoundError`,
carrying real data about which file and why. The next Concept Unit
actually catches it instead of letting it crash the program.

---

## Concept Unit: `try` / `except` — Catching the Failure Instead of Crashing

### The Problem

`inspector.py` crashing with a raw traceback when the log file is missing
is not what a working tool should do. The previous Concept Unit
established exactly which exception to expect; this one makes the program
actually respond to it — print something a person could read and act on,
instead of a stack of internal Python frames — while still crashing loudly
on any *other*, unanticipated kind of failure, rather than hiding those
too.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch.
- **Files affected:** `file-inspector/inspector.py`.
- **Change type:** refactor — the existing `with` block is wrapped in a
  `try`/`except`; nothing about the happy path's behavior changes.
- **Location:** wraps the entire existing `with open("shift_log.txt") as f:`
  block from the previous unit.
- **Dependencies:** none beyond what earlier units already established.

### The New Code

```python
try:
    with open("shift_log.txt") as f:
        contents = f.read()
    print(contents)
except FileNotFoundError as e:
    print("error:", e)
```

### The Updated Project

```python
try:                                    # ← new
    with open("shift_log.txt") as f:
        contents = f.read()
    print(contents)
except FileNotFoundError as e:          # ← new
    print("error:", e)                  # ← new
```

This is the complete `inspector.py` this lesson builds toward: it opens
the file, guarantees the handle closes no matter what, prints the content
on success — and now, on the one specific failure this lesson anticipated,
prints a short message instead of crashing.

Before trusting that `try`/`except` on its own, its general mechanism
deserves its own proof — isolated, on a completely different kind of
failure, showing this construct isn't specific to files at all:

```python
try:
    result = 10 / 0
except ZeroDivisionError as err:
    print("caught:", err)
```

Real output, this session:

```
caught: division by zero
```

This is exactly the same shape as `inspector.py`'s own
`try`/`except FileNotFoundError` above — a `try` block, a specific
exception type named after `except`, and a handler — proven here against
`ZeroDivisionError`, a completely unrelated kind of failure, to show the
mechanism itself generalizes to any exception type, not just this
lesson's own `FileNotFoundError`.

### Discarding the Example

`result` and the division-by-zero line above are thrown away now — they
exist only to prove `try`/`except`'s general shape, on a failure that has
nothing to do with files. `inspector.py` itself only ever catches
`FileNotFoundError`.

### Mechanical Walkthrough

Every distinct element added around the existing `with` block, in order:

- **`try:`** — marks the start of the region Python should watch for an
  exception. Everything indented under it — the entire `with` block and
  the `print(contents)` after it — is covered; if any line in that region
  raises `FileNotFoundError`, control jumps straight to the matching
  `except` below, skipping whatever was left of the `try` block, exactly
  the way the exception skipped `g.close()` in the earlier Concept Unit's
  isolated lab.
- **`except FileNotFoundError as e:`** — names the one specific exception
  type this handler is willing to catch, and binds the caught instance to
  `e`. Naming `FileNotFoundError` specifically, rather than the broader
  `Exception` or a bare `except:`, is deliberate: a broader catch would
  also silently swallow an unrelated bug — a typo producing a
  `NameError`, say — and misreport it as "the file was missing," which it
  wasn't.
- **`print("error:", e)`** — the same multi-argument form of `print` used
  throughout this lesson's own throwaway labs (`print("type(scratch) =",
  type(scratch))`, in Concept Unit 1, for one), now appearing in
  `inspector.py` itself for the first time: two arguments, joined by
  `print` with a single space between them. Passing `e` — a real
  `FileNotFoundError` instance, established in the previous Concept Unit —
  as an argument to `print` converts it to text the same way `str(e)` did
  earlier: the same `[Errno 2] No such file or directory: 'shift_log.txt'`
  text shown before, now preceded by `"error: "` so it's clearly the
  program's own deliberate message, not a raw traceback fragment.

### CS Lens

Structured exception handling — a named block that watches for failure,
paired with handlers for specific failure types — is one of the most
widely reused control-flow ideas in programming.

Also recognized in: Java's and C#'s own `try`/`catch` (same shape,
different keyword), JavaScript's `try`/`catch`, hardware interrupt
handlers (a CPU "catches" a signal and jumps to a specific handler routine
instead of continuing normal execution), database transactions that roll
back on a constraint violation, and circuit breakers in distributed
systems, which "catch" a failing dependency and reroute instead of letting
the failure cascade.

### SE Lens

The alternative not chosen here is catching the broader `Exception` class,
or writing a bare `except:` with no type named at all. Either would also
catch `FileNotFoundError` — but both would just as happily catch every
other kind of bug in this same block too, including ones that have
nothing to do with a missing file, and report all of them with the same
misleading "error: [Errno 2]..." message. Naming the exact exception type
keeps unrelated failures loud, instead of quietly relabeling them as
something they aren't. The honest debt this leaves: `inspector.py` only
knows how to talk about *one* specific failure. A directory passed instead
of a file, or a file that exists but can't be read due to permissions,
raise different, related exceptions this program doesn't yet handle — each
would need its own deliberate `except` clause, added the same way this one
was, not folded silently into this one.

### Commands

Still `python3 inspector.py` — same interpreter, same script, unchanged
since Concept Unit 1. What "success" means has now grown to cover two
distinct, both-correct outcomes depending on input: the three-line print
of the file's content when it exists, or the one-line `error: ...` message
when it doesn't — neither one is a `Traceback`.

### Run It

With `shift_log.txt` present:

```
$ python3 inspector.py
2026-08-15,machine-3,PASS
2026-08-15,machine-7,FAIL
2026-08-16,machine-3,PASS

```

With it renamed out of the way:

```
$ python3 inspector.py
error: [Errno 2] No such file or directory: 'shift_log.txt'
```

Both are real runs of the exact same, unmodified `inspector.py` — the
only thing that changed between them is whether the file happened to be
there.

### Connecting the Dots

Every piece from this lesson is now sitting in one six-line program: a
handle requested, read, guaranteed closed, and a specific, anticipated
failure turned into a message instead of a crash.

---

## Closing

### Connect the pieces

Trace `shift_log.txt` through the finished `inspector.py`, start to
finish, on a single run where the file exists:

1. `open("shift_log.txt")` (Concept Unit 1) asks the operating system for
   a handle to it, and gets back a real `_io.TextIOWrapper` object, bound
   to `f` via `with`'s `as` clause.
2. `with` (Concept Unit 3) has already called `f.__enter__()` to get that
   binding, and has already registered that `f.__exit__()` will run when
   this block ends, no matter how.
3. `f.read()` (Concept Unit 2) pulls the file's full text out through the
   handle, advancing its stream position from the start of the file to the
   end, and returns it as one `str`, bound to `contents`.
4. The `with` block ends normally. `with` calls `f.__exit__()` right here,
   invisibly, closing `f` — proven earlier by hand, by calling `__exit__`
   directly and checking `.closed`.
5. `print(contents)` shows the string pulled out in step 3 — `f` itself is
   already closed by now, but `contents` is a plain string, independent of
   the handle it came from, so it's still perfectly usable.
6. The whole thing is wrapped in `try` (Concept Unit 5). Nothing in steps
   1–5 raised anything, so the `except FileNotFoundError` clause never
   runs at all on this particular trace — it's there for the *other* run,
   the one where step 1 fails immediately and every step after it never
   happens.

### What breaks without this

Remove the `try`/`except` this lesson just added, leaving only:

```python
with open("shift_log_backup.txt") as f:
    contents = f.read()
print(contents)
```

Run it against a file that doesn't exist. Real output, this session:

```
Traceback (most recent call last):
  File "inspector.py", line 1, in <module>
    with open("shift_log_backup.txt") as f:
         ~~~~^^^^^^^^^^^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'shift_log_backup.txt'
```

(The `~~~~^^^^` line is Python 3.13 pointing at exactly which part of the
line failed — the `open(...)` call itself, not the `with` keyword or the
`as f` binding.) This is the exact crash Concept Unit 4 first observed,
now reproduced on purpose to show precisely what the `try`/`except` from
the final unit is buying: without it, this is what every user of this
script sees the moment the file isn't there. Restore the `try`/`except`
before moving on.

### Exercises

- Point `inspector.py` at a file that exists but is completely empty.
  What does `contents` actually hold, and what does `print(contents)` show?
- Deliberately misspell the filename (`shift_log.tx`, say) instead of
  removing it entirely, and compare the exact error message to the one
  shown in this lesson. What part of `FileNotFoundError`'s message changes?
- Point `inspector.py` at a *directory* instead of a file (make one with
  the same name you'd expect a file to have). It will fail — but not with
  `FileNotFoundError`. Catch the exception it actually raises and inspect
  `type(e)` and `e.errno` the same way this lesson inspected
  `FileNotFoundError`'s.
- Delete the `as f` from the `with` line and try to run the script. Read
  the resulting error carefully — what does Python say is undefined, and
  why, given everything this lesson showed about what `as` actually binds?

### Definition of done

- [ ] `file-inspector/shift_log.txt` and `file-inspector/inspector.py`
      both exist, exactly as built across this lesson's five Concept Units.
- [ ] Running `python3 inspector.py` with the file present prints its
      three lines.
- [ ] Running it with the file renamed away prints `error: [Errno 2] No
      such file or directory: 'shift_log.txt'` instead of a traceback.
- [ ] You can explain, without looking back at this lesson, what
      `__enter__` and `__exit__` are and why `with` calls them.
- [ ] At least one of the Exercises above has actually been run, not just
      read.
- [ ] `git init` the `file-inspector/` directory (if it isn't already
      inside one you're tracking) and commit, with a message explaining
      *why* this exists, not what it does — for example: `"open() alone
      can't guarantee cleanup or survive a missing file — with and
      try/except close that gap"` — not `"add inspector.py"`.
