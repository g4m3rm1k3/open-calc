# Lesson 1: Trusting the Filesystem — Text I/O, Context Managers, and Streams

**What you will build:** a `normalize_log` function inside a new
`recordkeeper` package that reads a raw event-log text file from disk
and writes a cleaned copy of it. The feature itself is small on
purpose — the actual subject of this lesson is what "reading a file"
is really doing underneath a single line like `open(...)`: who owns
the operating-system resource, when it gets released, how the program
gets the file's contents without pulling the whole thing into memory
at once, and how raw bytes on disk become the `str` your code works
with.

**What you need to know first:** Nothing. This is Lesson 1.

**Terms used in this lesson**

- **`with` statement (context manager protocol)** — a language
  construct that runs a setup step before its indented block and a
  teardown step after it, and guarantees the teardown step still runs
  even if the block raises an exception partway through. It exists so
  "acquire a resource, always release it, no matter what happens in
  between" doesn't have to be hand-written with a `try`/`finally` pair
  every single time a resource is used — the pattern is common enough
  (files, network sockets, database connections, locks) that Python
  gives it its own keyword instead of leaving it to programmer
  discipline.
- **Streaming (lazy iteration)** — processing input piece by piece as
  it becomes available, instead of first loading the entire input into
  memory and only then processing it. It exists because "load
  everything, then process it" has a memory cost proportional to the
  size of the input — fine for a three-line log, fatal for a
  multi-gigabyte one — while streaming's memory cost stays roughly
  constant regardless of how large the input is, at the price of not
  being able to jump around in the data or know its total size up
  front without extra work.
- **Text encoding** — the specific, agreed-upon mapping between the
  raw bytes actually stored on disk and the human-readable characters
  a program treats them as. It exists because a disk only stores
  bytes — numbers from 0-255 — and there is no single universal rule
  for which sequence of bytes means which character; without an
  explicit, shared mapping, the same bytes could be legitimately read
  back as different text depending on which mapping was assumed.
- **Buffering** — an intermediate layer between a program and the
  operating system that batches small reads or writes into fewer,
  larger operating-system calls. It exists because each individual
  call to the operating system to read or write data has a real,
  fixed cost regardless of how much data that call carries; buffering
  amortizes that fixed cost over many small logical reads/writes so
  the program doesn't pay it once per line or per character.

**Objects and methods used**

*This lesson's own subject:*

- **`open`**
  - *What it is:* A builtin function that asks the operating system to
    open a connection to a file on disk and hands back a Python object
    representing that open connection.
  - *Implementation:* `open(file, mode='r', encoding=None, ...)` —
    returns a `TextIOWrapper` when `mode` requests text (the default)
    and an `encoding` is in play, as it is throughout this lesson.
  - *Its use:* Every read or write in this lesson starts by calling
    `open` to get a handle to talk to the file through.
  - *Type:* A builtin function (not a method on any object — a
    free-standing function in the builtins namespace).
  - *Responsibility:* Ask the operating system for a live connection
    to a named file, in a requested mode (read, write, append, text,
    binary) and with a requested text encoding, and hand back a Python
    object wrapping that connection so the rest of the program never
    has to talk to the operating system's raw file-descriptor API
    directly.
  - *Depends on:* A `file` path (string or path-like object), and
    optionally a `mode` string and an `encoding` name; the underlying
    operating system must actually grant the requested access (the
    file must exist for read mode, the process must have permission,
    and so on) or `open` raises an exception instead of returning.
  - *Connects to:* Called directly by this lesson's own code
    (`normalize_log`); the object it returns is what every subsequent
    `.read()`, `for line in f`, `.readline()`, and `.write()` call in
    this lesson is actually called on.
  - *Shape:* Takes a string in, returns one object out — never a list,
    never `None` on success (an exception is raised instead of a
    `None` return on failure).

- **File object iteration (`for line in f:`)**
  - *What it is:* The file object's own implementation of Python's
    iterator protocol — the same general mechanism `for` loops use
    for lists and dicts — specialized so that each "next" step returns
    the file's next line rather than the file's next byte or next
    character.
  - *Implementation:* The file object defines `__iter__` (returning
    itself) and `__next__` (returning the next line, including its
    trailing `\n`, or raising `StopIteration` once the file is
    exhausted); a `for` loop is Python's own built-in shorthand for
    repeatedly calling `__next__` until `StopIteration` is raised.
  - *Its use:* This is how `normalize_log` reads the input file — one
    line at a time, without ever holding the whole file's text in
    memory at once.
  - *Type:* Two special (dunder) instance methods on the file object,
    invoked implicitly by the `for` statement, not called directly by
    this lesson's own code.
  - *Responsibility:* Produce the file's contents one line at a time,
    on demand, tracking internally how far through the file the last
    line ended, so each call for "the next line" resumes exactly where
    the previous one left off.
  - *Depends on:* An already-open, readable file object with an
    internal read position (its own "cursor") that advances every time
    a line is produced.
  - *Connects to:* Called implicitly by the `for` loop inside
    `normalize_log`; each returned line is immediately handed to
    `.rstrip("\n")` and then to `.write()` on the output file.
  - *Shape:* Yields one `str` per line, including its trailing `\n`
    (omitted only on a file's final line if that line has none) —
    never a pre-built list of every line; nothing is loaded beyond the
    single line currently being handed out.

- **`str.rstrip`**
  - *What it is:* A `str` instance method that removes a specified set
    of trailing characters from the end of a string.
  - *Implementation:* `str.rstrip(chars=None) -> str` — returns a
    *new* string with any of the characters in `chars` stripped from
    the right-hand end; the original string object is never modified,
    because `str` is immutable in Python.
  - *Its use:* Each line read from the input file still carries its
    trailing `\n`; `normalize_log` strips exactly that one character
    off before writing the line back out, so it can add its own,
    controlled `\n` afterward instead of trusting whatever the input
    file happened to end each line with.
  - *Type:* An instance method on `str`.
  - *Responsibility:* Given a string and a set of characters to treat
    as trimmable, return a new string with only the trailing run of
    those characters removed — never characters in the middle, never
    leading characters.
  - *Depends on:* The string it's called on, and the `chars` argument
    naming exactly which characters count as strippable at the end.
  - *Connects to:* Called on each `line` string that iteration over
    the input file object produces; its return value is the exact
    string handed to the output file's `.write()` call.
  - *Shape:* Takes one `str` in (plus the `chars` argument), returns
    one new `str` out — same data, never longer, only ever
    shorter-or-equal in length.

- **file object `.write`**
  - *What it is:* An instance method on the file object that sends
    text to the file's underlying buffer to eventually be written to
    disk.
  - *Implementation:* `write(s: str) -> int` — returns the number of
    characters written; on a text-mode file object this argument must
    be a `str`, never `bytes`.
  - *Its use:* This is how `normalize_log` actually produces its
    output file, once per cleaned line.
  - *Type:* An instance method on the file object (`TextIOWrapper`).
  - *Responsibility:* Hand a string to the file object's internal
    write buffer, to be flushed to the operating system either when
    that buffer fills or when the file is closed — not necessarily
    immediately.
  - *Depends on:* An already-open, writable file object, and a `str`
    argument to write.
  - *Connects to:* Called once per line, on the output file object,
    with the `.rstrip("\n")`-cleaned line plus a freshly added `"\n"`
    as its argument.
  - *Shape:* Takes one `str` in, returns an `int` (character count)
    that this lesson's code never uses — the return value exists but
    is silently discarded here, which is normal and not an error.

*Everything else in the file, not this lesson's subject but still
explained:*

- **file object `.closed`**
  - *What it is:* A read-only attribute on the file object reporting
    whether the underlying operating-system connection has already
    been released.
  - *Implementation:* A boolean property; `False` from the moment
    `open()` successfully returns until the file is closed, `True`
    afterward, for the rest of that object's lifetime.
  - *Its use:* Used only in this lesson's throwaway lab, to make the
    otherwise-invisible open/closed state of a file object directly
    observable.
  - *Type:* A read-only instance property (not a method — accessed
    without parentheses).
  - *Responsibility:* Report a single fact truthfully: has this
    specific file object's connection to the operating system already
    been released.
  - *Depends on:* Nothing beyond the file object itself already
    existing.
  - *Connects to:* Nothing calls it as part of the real program; it
    exists here purely so the lab's `print` statements have something
    real to show.
  - *Shape:* A single `bool` — never anything else.

- **`UnicodeError`**
  - *What it is:* A builtin exception class raised when converting
    between bytes and text fails because the two sides disagree about
    which encoding is in use.
  - *Implementation:* `UnicodeError` is a subclass of `ValueError`;
    the more specific `UnicodeDecodeError` (also builtin) is itself a
    subclass of `UnicodeError` and is raised for the common case of a
    byte sequence that cannot be decoded under the requested encoding
    at all. This lesson's `utf-16` lab hits a different, rarer
    `UnicodeError` subtype — a missing byte-order mark — which is why
    the lab catches the broader `UnicodeError`, not the narrower
    `UnicodeDecodeError`.
  - *Its use:* Caught in this lesson's encoding lab to turn what would
    otherwise be a crashing traceback into a real, inspectable error
    message proving that mismatched encodings are a genuine failure,
    not a hypothetical one.
  - *Type:* A builtin exception class, instantiated automatically by
    the interpreter/standard library, not constructed directly by this
    lesson's own code.
  - *Responsibility:* Signal, with a human-readable message, that a
    specific attempt to convert between bytes and text failed, and
    carry enough detail (in `UnicodeDecodeError`'s case: which byte
    position, which codec) for the failure to be diagnosed.
  - *Depends on:* Being raised by the codec machinery inside
    `open(..., encoding=...)`'s read path — never raised directly by
    this lesson's own code.
  - *Connects to:* Raised inside the `with open(...) as f: f.read()`
    call in the lab's `try` block; caught by the lab's own `except
    UnicodeError as e:` clause.
  - *Shape:* An exception object whose `str()` is a one-line message;
    not a value returned from a normal call.

---

## Concept Unit: The `with` statement and the context manager protocol

### The Problem

Every time a program opens a file, it's asking the operating system
for a limited, shared resource — most operating systems cap how many
files any one process can have open simultaneously. If a program opens
a file and never explicitly tells the operating system it's done with
it, that connection can sit open for the rest of the program's life,
even though the program stopped using it. Multiply that by every file
a real, long-running program opens over its lifetime, and "forgot to
release it" stops being a one-off mistake and becomes a resource leak
that eventually makes the program fail to open anything else at all.

> **Stop and think:** If you already know Python has a `close()`
> method on file objects, what's stopping you from just calling
> `file.close()` right after you're done reading? What would have to
> go wrong, in between opening the file and calling `close()`, for
> that plan to quietly fail — and would you necessarily notice when it
> did?

### Introduce the concept in isolation

```python
f = open("scratch_cm.txt", "w")
f.write("hello\n")
print("Before close, f.closed =", f.closed)
f.close()
print("After close, f.closed =", f.closed)

print("---")

with open("scratch_cm.txt", "r") as f2:
    content = f2.read()
    print("Inside the with-block, f2.closed =", f2.closed)
print("After the with-block, f2.closed =", f2.closed)
print("content read =", repr(content))
```

Real output, from an actual run:

```
Before close, f.closed = False
After close, f.closed = True
---
Inside the with-block, f2.closed = False
After the with-block, f2.closed = True
content read = 'hello\n'
```

This proves two separate things. First, `f.closed` genuinely does flip
from `False` to `True` the instant `.close()` runs — closing isn't
symbolic, it's an observable state change. Second, and this is the
actual point: nothing in the `with` block *called* `.close()` at
all — no line of that code says `f2.close()` anywhere — and yet
`f2.closed` is `True` the moment execution leaves the indented block,
before the next `print` even runs. The `with` statement did that on
its own, automatically, the instant control left its block. This
automatic, guaranteed release is called the **context manager
protocol**: `with` calls a setup method (`__enter__`) before its block
and a teardown method (`__exit__`) after — and `__exit__` runs even if
an exception is raised inside the block, which a plain `f.close()`
written after the risky code would never reach.

### Discard the throwaway example

This lab code — the bare `open()`/`close()` pair and the `scratch_cm.txt`
file it wrote — is discarded now. Neither appears in the `recordkeeper`
project; it existed only to make `.closed` visible.

### Project Change

- **Reference Source** — No reference counterpart. `recordkeeper` is a
  from-scratch project for this curriculum, not a port of an existing
  codebase.
- **Files affected** — new files: `recordkeeper/__init__.py` (empty,
  marks the directory as a package), `recordkeeper/ingest/__init__.py`
  (empty, same reason), `recordkeeper/ingest/raw_log.py`.
- **Change type** — add (brand-new package and module).
- **Location** — n/a; nothing exists yet to locate a position within.
- **Dependencies** — none beyond the Python standard library.

### The New Code

```python
def normalize_log(input_path, output_path):
    with open(input_path, "r", encoding="utf-8") as infile:
```

### The Updated Project

This is a brand-new file with nothing surrounding this fragment yet,
so there is no larger enclosing structure to return to — Project
Change already covers this case above.

### Mechanical walkthrough

Enumerating `normalize_log`'s first line in order:

- **`def normalize_log(input_path, output_path):`** — a function
  definition. `def` is a keyword that creates a new function object
  and binds it to the name `normalize_log` in the current namespace;
  `input_path` and `output_path` are parameters — names that will be
  bound to whatever values the function is called with, each time it's
  called, with no default supplied here, meaning both must be provided
  by the caller.
- **`open(input_path, "r", encoding="utf-8")`** — the `open` builtin
  (full treatment above, in Objects and methods used) called with
  three arguments: `input_path` positionally, the string `"r"`
  positionally (requesting read mode — this file will only be read
  from, never written to, through this handle), and `encoding="utf-8"`
  by keyword, explicitly naming which byte-to-character mapping to
  use rather than leaving it to whatever default the running machine
  happens to have.
- **`as infile`** — part of the `with` statement's own syntax (full
  treatment above, in Terms): binds the object `open(...)` returns to
  the local name `infile` for the duration of the indented block that
  follows.
- **`with ... :`** — the context manager protocol itself (full
  treatment above, in Terms and in the isolated lab just run):
  guarantees `infile`'s underlying operating-system connection is
  released when this block ends, however it ends.

### CS lens

This is a specific, common application of the **RAII pattern**
("Resource Acquisition Is Initialization") — tying a resource's
lifetime to a block's or object's lifetime, so acquisition and release
are structurally paired instead of relying on a programmer to remember
the second half by hand. Python's `with` statement is one language's
particular syntax for it; it is not a Python-only idea.

```
Also recognized in: C++ destructors managing heap memory or locks,
Java's try-with-resources, C#'s using statement, database connection
pools that hand back a connection on block exit, Rust's ownership/Drop
system enforcing release at compile time instead of runtime
```

### SE lens

The alternative not chosen here is manual `try`/`finally`:

```python
f = open(input_path, "r", encoding="utf-8")
try:
    ...
finally:
    f.close()
```

This works, and does guarantee release exactly as reliably as `with`
does — the actual tradeoff is not correctness, it's that every single
resource-using function in the codebase would need to remember to
write this same four-line shape by hand, correctly, every time. The
`with` statement is that same guaranteed-release pattern turned into
a language-level default so a programmer has to actively try to skip
it, rather than actively remember to include it. The debt this project
would otherwise be carrying, without `with`, is that the very first
time someone forgets the `try`/`finally` wrapper — under a deadline, in
a hurry — the leak is silent: the code still runs, still produces
correct output, and nothing points at the missing cleanup until the
process has opened enough files to hit the operating system's limit.

### Commands needed

None yet — this unit is pure Python, run directly by the interpreter
already used above.

### Run it

Already run and shown above, under "Introduce the concept in
isolation" — real output pasted, not predicted.

### Connect

The `with open(...) as infile:` line just written is the first line of
`normalize_log`; the next Concept Unit adds what actually happens
inside this block.

---

## Concept Unit: Streaming a file line by line

### The Problem

`normalize_log`'s input file could, in principle, be three lines or
three million. Reading a file's entire contents into one Python `str`
before doing anything with it means the program's memory use during
that read is proportional to the file's size — a three-million-line
log could mean holding hundreds of megabytes of text in memory at
once, just to then process it one line at a time anyway.

> **Stop and think:** You already know from the previous unit that a
> file object has a `.read()` method that returns its whole contents as
> one string. Given that `for` loops in Python can iterate over lists,
> what would it mean, concretely, for a file object to *also* be
> something a `for` loop can iterate over directly — without ever
> calling `.read()` at all? What would each step of that loop actually
> hand you?

### Introduce the concept in isolation

```python
with open("scratch_stream.txt", "w") as f:
    f.write("2026-08-01T09:00:00 login user=alice\n")
    f.write("2026-08-01T09:01:12 click user=alice target=cart\n")
    f.write("2026-08-01T09:02:47 logout user=alice\n")

print("=== reading whole file at once with .read() ===")
with open("scratch_stream.txt", "r") as f:
    whole = f.read()
print(type(whole), repr(whole[:40]), "...")

print("=== reading with a for-loop, one line at a time ===")
with open("scratch_stream.txt", "r") as f:
    for i, line in enumerate(f, start=1):
        print(f"line {i}: {line!r}")

print("=== reading with explicit .readline() calls to expose the same mechanism ===")
with open("scratch_stream.txt", "r") as f:
    first = f.readline()
    second = f.readline()
    print("first call  ->", repr(first))
    print("second call ->", repr(second))
```

Real output, from an actual run:

```
=== reading whole file at once with .read() ===
<class 'str'> '2026-08-01T09:00:00 login user=alice\n202' ...
=== reading with a for-loop, one line at a time ===
line 1: '2026-08-01T09:00:00 login user=alice\n'
line 2: '2026-08-01T09:01:12 click user=alice target=cart\n'
line 3: '2026-08-01T09:02:47 logout user=alice\n'
=== reading with explicit .readline() calls to expose the same mechanism ===
first call  -> '2026-08-01T09:00:00 login user=alice\n'
second call -> '2026-08-01T09:01:12 click user=alice target=cart\n'
```

This is called **streaming**, or **lazy iteration**: the third block
proves the file object tracks its own read position internally — the
first bare `.readline()` call returns line 1, and with no argument
telling it to, the very next `.readline()` call picks up exactly where
the first one left off and returns line 2, not line 1 again. The
`for` loop in the second block is doing the same thing under the hood,
automatically, once per iteration, which is exactly what "File object
iteration" in Objects and methods used, above, describes. At no point
in the second or third block does the program hold more than one
line's worth of text in memory at once — unlike the first block, where
`whole` holds the entire file as a single string the instant `.read()`
returns.

### Discard the throwaway example

`scratch_stream.txt` and the lab code above are discarded; they exist
only to make the file object's internal read-position tracking
observable side by side with `.read()`'s all-at-once behavior.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch
  addition, same as the previous unit.
- **Files affected** — `recordkeeper/ingest/raw_log.py` (modified).
- **Change type** — add (extending the function body started in the
  previous unit).
- **Location** — inside `normalize_log`, inside the `with open(...) as
  infile:` block already started.
- **Dependencies** — none new.

### The New Code

```python
        with open(output_path, "w", encoding="utf-8") as outfile:
            for line in infile:
```

### The Updated Project

```python
 1  def normalize_log(input_path, output_path):
 2      with open(input_path, "r", encoding="utf-8") as infile:
 3          with open(output_path, "w", encoding="utf-8") as outfile:  # ← new
 4              for line in infile:                                   # ← new
```

As a whole, this partial function now opens *two* files at once — the
input for reading, the output for writing — with the write-side `with`
block nested inside the read-side one, so both stay open for exactly
as long as the function needs them and both are guaranteed closed,
independently, whenever this nested structure is exited, in either
order relative to each other, however it's exited. The `for line in
infile:` line begins streaming through the input file one line at a
time, with nothing done to each line yet — that's the next unit.

### Mechanical walkthrough

- **`open(output_path, "w", encoding="utf-8")`** — the same `open`
  builtin already given full treatment above, called again with
  different arguments: `output_path` instead of `input_path`, and
  `"w"` instead of `"r"` — write mode, meaning this call creates the
  file if it doesn't exist yet, or truncates it to empty first if it
  does, rather than reading from it.
- **`as outfile`** — the same `with ... as` binding syntax already
  given full treatment above, this time binding the write-mode file
  object to the name `outfile`.
- **nesting one `with` block inside another** — this is not a new
  language construct on top of `with` itself; it's the same
  already-explained context manager protocol applied twice,
  independently, once per resource. Each `with` block still guarantees
  its own resource is released when *its own* block ends, regardless
  of what the other `with` block is doing — nesting them just means
  the inner block's guarantee is active for a shorter, contained span
  of time inside the outer block's own guarantee.
- **`for line in infile:`** — the file object iteration protocol
  (full treatment above, in Objects and methods used): each pass
  through this loop calls `infile`'s `__next__` once, binding its
  return value — the next line of the input file, as a `str` including
  its trailing `\n` — to the local name `line`.

### CS lens

Streaming through a large input as a sequence of small, self-contained
steps, rather than materializing the whole thing first, is the same
idea behind Python's own **generator** functions and the **iterator
protocol** more generally — "produce the next value on demand" instead
of "produce every value up front."

```
Also recognized in: video streaming (decoding and displaying frames as
they arrive instead of downloading the whole file first), database
cursors fetching result rows in batches instead of materializing an
entire result set, Unix pipes passing data between processes a chunk
at a time, JavaScript's async generators
```

### SE lens

The alternative not chosen is `whole = infile.read()` followed by
`whole.split("\n")` or a similar full-materialization approach. That
alternative is not wrong, and for small files it's often simpler to
read — the real tradeoff is memory, not correctness: `.read()`'s
memory cost scales with the file's size, while the streaming version's
memory cost stays roughly flat regardless of file size, at the cost of
losing the ability to jump backward or know the line count up front
without a second pass. `recordkeeper` isn't carrying any real debt
here yet because its current input files are tiny test logs — but the
choice to stream, made now while it doesn't matter, is what keeps this
function correct without any rewrite once a real, large log file shows
up later in the curriculum.

### Commands needed

None yet.

### Run it

Already run and shown above, under "Introduce the concept in
isolation."

### Connect

The previous unit opened the input file safely; this unit adds the
output file, opened the same safe way, and starts walking through the
input file's lines one at a time instead of loading them all at once.
The next unit finishes the loop body and explains why the input file
was opened with `encoding="utf-8"` specifically, rather than no
encoding argument at all.

---

## Concept Unit: Text encoding

### The Problem

A file on disk is nothing but a sequence of bytes — whole numbers from
0 to 255, with no built-in notion of "this is a letter." For a program
to turn those bytes back into the characters a human reads (`a`, `é`,
`€`, and so on), both the program that *wrote* the bytes and the
program that *reads* them back have to agree, in advance, on exactly
which byte-sequence stands for which character. `open(...,
encoding="utf-8")` in the previous two units named that agreement
explicitly — but nothing in the code so far has shown what happens if
the reading side's assumption turns out to be wrong.

> **Stop and think:** If a text file contains a character like `é` —
> not part of the plain English alphabet — what do you think actually
> gets stored on disk: one byte, or more than one? If a second program
> opens that same file assuming a *different* encoding than the one it
> was written with, what would you expect to happen — an error, or
> silently wrong-looking text?

### Introduce the concept in isolation

```python
with open("scratch_encoding.txt", "w", encoding="utf-8") as f:
    f.write("café — price: 3€\n")

with open("scratch_encoding.txt", "r", encoding="utf-8") as f:
    print("utf-8 read back:", repr(f.read()))

print("--- now force-reading utf-8 bytes as if they were latin-1 ---")
with open("scratch_encoding.txt", "r", encoding="latin-1") as f:
    print("latin-1 read back:", repr(f.read()))

print("--- now force a real decode failure using utf-16 ---")
try:
    with open("scratch_encoding.txt", "r", encoding="utf-16") as f:
        print(f.read())
except UnicodeError as e:
    print(f"{type(e).__name__}:", e)
```

Real output, from an actual run:

```
utf-8 read back: 'café — price: 3€\n'
--- now force-reading utf-8 bytes as if they were latin-1 ---
latin-1 read back: 'cafÃ© â\x80\x94 price: 3â\x82¬\n'
--- now force a real decode failure using utf-16 ---
UnicodeError: UTF-16 stream does not start with BOM
```

This proves encoding is a real, load-bearing agreement, not a
formality. The same bytes on disk, written once as UTF-8, read back
correctly when the reader also assumes UTF-8 — but read back as
visibly garbled text (`cafÃ©` instead of `café`) when the reader
instead assumes Latin-1, because UTF-8 represents `é` using *two*
bytes and Latin-1's rules interpret those same two bytes as two
separate, different characters instead. This is called a **mojibake**
failure — text that "reads" successfully, with no error at all, but
produces the wrong characters, which is worse than a crash because
nothing flags it as wrong. The UTF-16 attempt goes further and fails
outright with a real `UnicodeError`, because UTF-16 expects a
byte-order marker at the very start of the file that a UTF-8-written
file never included — proving that a wrong encoding guess doesn't
always fail silently; sometimes it fails loudly, and which one happens
depends on exactly how incompatible the two encodings' byte-level
rules are.

### Discard the throwaway example

`scratch_encoding.txt` and this lab's code are discarded; they exist
only to make an encoding mismatch's real consequences — silent
mojibake in one case, a raised exception in the other — directly
observable.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch
  addition, same as both units above.
- **Files affected** — `recordkeeper/ingest/raw_log.py` (modified,
  finishing the function body), plus new files `data/events_raw.txt`
  (a real sample input) created for this unit's own verification run.
- **Change type** — add (completing the function body).
- **Location** — inside the `for line in infile:` loop already
  started in the previous unit.
- **Dependencies** — none new.

### The New Code

```python
                cleaned = line.rstrip("\n")
                outfile.write(cleaned + "\n")
```

### The Updated Project

```python
 1  def normalize_log(input_path, output_path):
 2      with open(input_path, "r", encoding="utf-8") as infile:
 3          with open(output_path, "w", encoding="utf-8") as outfile:
 4              for line in infile:
 5                  cleaned = line.rstrip("\n")   # ← new
 6                  outfile.write(cleaned + "\n")  # ← new
```

The function is now complete: for every line the input file streams
out, it strips that exact line's own trailing newline and writes the
line back out to the output file with a newline this function controls
itself, rather than trusting whatever line-ending the input file
happened to already have. Both files are opened with
`encoding="utf-8"` explicitly, on both the read and write side, so the
same byte-to-character agreement holds all the way through — exactly
the agreement the isolated lab, just above, proved matters.

### Mechanical walkthrough

- **`line.rstrip("\n")`** — the `str.rstrip` method (full treatment
  above, in Objects and methods used), called with the argument
  `"\n"`, meaning: strip trailing newline characters specifically —
  not trailing spaces, not any other trailing character — from the end
  of `line`.
- **`cleaned = ...`** — an assignment: binds the name `cleaned` in this
  loop iteration's local scope to whatever `.rstrip("\n")` returned; a
  fresh string object, not a modification of `line` itself, since
  `str.rstrip` (like every `str` method) never mutates the string it's
  called on.
- **`cleaned + "\n"`** — string concatenation using the `+` operator:
  builds one new string by joining `cleaned` and the literal string
  `"\n"` end to end. This is what guarantees the output file's
  line-endings come from this function's own logic, not from whatever
  the input file's own newline characters happened to be — a line
  input as `"...alice\n"` becomes `cleaned = "...alice"` after
  stripping, then `"...alice" + "\n"` reconstructs a single, known
  newline on the way out.
- **`outfile.write(...)`** — the file object's `.write` method (full
  treatment above, in Objects and methods used), called once per input
  line, sending that one reconstructed line to the output file's
  internal write buffer.

### CS lens

Reading the input's encoding explicitly rather than assuming a
default, and controlling the output's line-ending explicitly rather
than passing the input's own bytes straight through, are both
instances of the same broader idea: **normalization** — transforming
data from a variable, externally-controlled shape into one fixed,
internally-controlled shape before anything downstream depends on it.

```
Also recognized in: Unicode normalization forms (NFC/NFD) resolving
multiple valid byte sequences for the same visible character, database
schemas enforcing a single canonical date format regardless of how
data was originally entered, HTTP servers normalizing incoming
Content-Type headers before routing a request, image-processing
pipelines converting every uploaded photo to one canonical color space
before further work
```

### SE lens

The alternative not chosen is writing each line straight back out
unmodified — `outfile.write(line)` with no `.rstrip`/reconstruction at
all. That's simpler, and for a well-formed input file it would produce
an identical result. The real tradeoff shows up the moment an input
file arrives with inconsistent line endings — some lines ending in
`\n`, others in `\r\n`, which genuinely happens when files pass
between different operating systems' text editors — because passing
those bytes straight through would silently carry that inconsistency
into every file `recordkeeper` produces from then on, without ever
raising an error to flag it. Explicitly stripping and rebuilding each
line's ending costs one extra method call per line and removes that
whole failure mode outright. The debt being deliberately *not* taken
on here is bigger validation — this function doesn't yet check that
each line is well-formed in any other way (a genuinely empty line, a
line with no recognizable timestamp) — that's left for a later lesson,
once there's an actual object model to validate lines against, rather
than solved prematurely here with ad-hoc checks this function would
just have to unwind again later.

### Commands needed

- `python3 recordkeeper_demo.py` — runs the demonstration script
  below, which calls `normalize_log` against a real sample file. `python3`
  is the interpreter; the one positional argument is the script to run.
  Success output is the three-line cleaned log printed to the
  terminal, shown next.

### Run it

Real output, from an actual run, calling the finished function against
a real three-line sample input file (`data/events_raw.txt`):

```python
from recordkeeper.ingest.raw_log import normalize_log
normalize_log("data/events_raw.txt", "data/events_clean.txt")
with open("data/events_clean.txt", encoding="utf-8") as f:
    print(f.read())
```

```
2026-08-01T09:00:00 login user=alice
2026-08-01T09:01:12 click user=alice target=cart
2026-08-01T09:02:47 logout user=alice
```

### Connect

The previous unit opened both files and started streaming through the
input one line at a time; this unit finishes the loop body, using the
explicit UTF-8 agreement from both `open()` calls to guarantee the
text round-trips correctly, and rebuilding each line's ending under
this function's own control rather than the input file's.

---

## Connect the pieces

Trace one real line, start to finish, through everything built in this
lesson. The input file `data/events_raw.txt` contains the line
`"2026-08-01T09:00:00 login user=alice\n"`.

1. `open(input_path, "r", encoding="utf-8")` asks the operating system
   for a read connection to `data/events_raw.txt`, explicitly agreeing
   that its bytes should be interpreted as UTF-8 — the same agreement
   the file was written under — and the `with` statement guarantees
   this connection will be released automatically once the function's
   nested blocks are done with it, however they end.
2. `open(output_path, "w", encoding="utf-8")`, nested inside the first
   block, does the same for a fresh write connection to
   `data/events_clean.txt`, independently guaranteed to close on its
   own.
3. `for line in infile:` pulls this one line out of the input file via
   the file object's iteration protocol — one line, and only one line,
   materialized in memory at this point, not the whole file.
4. `line.rstrip("\n")` strips that line's own trailing newline,
   producing `"2026-08-01T09:00:00 login user=alice"` with nothing
   after it.
5. `cleaned + "\n"` reconstructs exactly one newline, under this
   function's own control, producing
   `"2026-08-01T09:00:00 login user=alice\n"` again — byte-for-byte the
   same in this case, but now independent of whatever the input file's
   own line-ending actually was.
6. `outfile.write(...)` sends that reconstructed line to the output
   file's buffer.
7. When both `with` blocks end, both files' contents are guaranteed
   flushed and both operating-system connections guaranteed released —
   without a single explicit `.close()` call anywhere in
   `normalize_log`'s own code.
