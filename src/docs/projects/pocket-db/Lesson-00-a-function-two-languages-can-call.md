# Lesson 0: A Function Two Languages Can Both Call

**What you will build**
One trivial C++ function, compiled into a shared library (a `.dll`) —
and proof, real and inspected, that the *exact name* you gave that
function in your source code is not necessarily the name it's actually
callable by once compiled. Nothing about a database yet. This lesson
builds the one thing every later slice of PocketDB depends on: a real,
working path from C++ source to a form Python can load and call at
runtime.

**What you need to know first:** Nothing — this is the first lesson.

**Terms introduced in this lesson:**
- **Shared library (`.dll`)** — a compiled unit of code that isn't a
  standalone program itself; instead, another program loads it at
  runtime and calls into it. This is the entire mechanism that lets a
  Python process run C++ code at all — Python cannot execute `.cpp`
  source, but it can load a `.dll` and call a function inside it.
- **Exported symbol** — the name a compiled `.dll` actually publishes as
  callable from outside itself. A `.dll` can contain many functions
  internally and export only some of them; whoever loads the library
  looks functions up *by exported name*, not by reading the original
  source.
- **Name mangling** — the real, mechanical process a C++ compiler uses
  to turn a function's name, plus its parameter types, into the actual
  exported symbol name — done so two different C++ functions named the
  same thing (overloads) can coexist as two different real symbols.
  Proven directly, with a real compiled example, in this lesson's second
  Concept Unit.
- **`extern "C"` linkage** — a linkage specification telling the C++
  compiler: export this one function's symbol the plain, unmangled way a
  C compiler would, not the C++ way. This is what makes a C++ function
  findable, by its plain written name, from a language — like Python —
  that has no idea C++ overloading or mangling exists.

**Objects and methods used**
- No external classes or methods yet — this lesson's own subject is the
  compiler toolchain and C++'s linkage rules themselves, both covered in
  Terms Introduced above; the real compiler invocations are covered in
  each Concept Unit's own Commands Needed step.

---

## Concept Unit: Compiling C++ Into Something Python Can Load

### The Problem

Python cannot run a `.cpp` file. Before any real database code gets
written, there has to be a real, working, *verified* path from "C++
source on disk" to "something a completely different program can load
and call at runtime." What does that path actually look like, concretely,
on this machine?

### Introduce the Concept in Isolation

A throwaway file, `engine.cpp` — deliberately trivial, so the only thing
being proven is the compile-and-load mechanism itself, nothing about a
database yet:

Create a real folder on disk for this project — this is where every
lesson from here forward lives, both the C++ and Python halves, in one
place:

```bash
mkdir pocketdb
cd pocketdb
```

Inside it, save the following as `engine.cpp`:

```cpp
extern "C" int add_two_numbers(int a, int b)
{
    return a + b;
}
```

Compiled with `g++`'s `-shared` flag, which tells it to produce a shared
library instead of a standalone `.exe` — run from inside `pocketdb/`:

```bash
g++ -shared -o pocketdb_engine.dll engine.cpp
```

Real output — the command exits with no errors, and a real file appears:

```text
pocketdb_engine.dll   (95,287 bytes)
```

**This is called compiling to a shared library.** The `.cpp` file itself
never runs — `g++` translates it into real machine code, packaged inside
a `.dll` container Windows knows how to load into another process's
memory on demand. Proof this actually produced something loadable and
callable, not just a file that happens to exist, comes next — Python
calling into it for real. Still inside `pocketdb/`, save the following as
`call_engine.py`:

```python
import ctypes

engine = ctypes.CDLL("./pocketdb_engine.dll")
engine.add_two_numbers.argtypes = [ctypes.c_int, ctypes.c_int]
engine.add_two_numbers.restype = ctypes.c_int

result = engine.add_two_numbers(4, 7)
print(f"add_two_numbers(4, 7) = {result}")
```

Run with `python call_engine.py`. Real output:

```text
add_two_numbers(4, 7) = 11
```

*What this proves:* a completely separate Python process, that never saw
`engine.cpp`'s source, loaded the compiled `.dll` and got a correct
answer — `11`, not asserted, computed by the real compiled C++ code —
back into a real Python `int`. `ctypes` itself, the module that made this
call possible, gets its own full Concept Unit treatment in Lesson 1, not
here — this unit's job is only proving the C++ side actually produces
something callable.

### Discard the Throwaway Example

`engine.cpp`, as written here, is deleted once this proof is understood.
`add_two_numbers` was never meant to survive — the real project's first
actual function (`database_open`, Slice S01) is a from-scratch
addition, not a rename of this one. What's kept is the *mechanism*: write
a `.cpp` file, compile it with `-shared`, get a `.dll` — this exact
sequence is what every later C++ lesson in this track does, just with
real project code in place of `add_two_numbers`.

### Mechanical Walkthrough

- `extern "C"` — **first appearance**, full treatment given in this
  unit's sibling below (its own dedicated Concept Unit) rather than here,
  since it's substantial enough to deserve isolated proof of its own —
  flagged here only as "present," not yet explained.
- `int add_two_numbers(int a, int b)` — an ordinary C++ function
  definition: a name, two `int` parameters, an `int` return type, a body
  computing `a + b`. Nothing about this line is C++-specific in any way
  that matters yet.
- `g++ -shared -o pocketdb_engine.dll engine.cpp` — `-shared` is the flag
  that changes `g++`'s output from a standalone executable (the default)
  to a loadable library; `-o pocketdb_engine.dll` names the output file
  explicitly rather than accepting `g++`'s own default output name.

### CS Lens

This is **dynamic loading** — code loaded into a running process after
that process has already started, rather than linked in permanently
when the process was first built. Also recognized in: browser plugins,
video game mod systems, a web server loading a new route handler without
restarting, Python's own `import` machinery for compiled C extension
modules (`.pyd` files on Windows are the same shared-library mechanism
this lesson just used, under a different file extension).

### SE Lens

Why put the database engine behind a compiled `.dll` boundary at all,
instead of, say, having Python shell out to a C++ command-line program
and parse its text output? A `.dll` call is a real function call — direct
memory access to arguments and return values, no text parsing, no
process-spawn overhead per call. The real cost, paid starting the moment
any function's *signature* needs to grow past two plain `int`s: every
type crossing this boundary has to be a shape both C++ and Python's
`ctypes` module can agree on — this project's own next several lessons
exist specifically to solve that problem for real, growing types
(strings, structs, arrays), not just the two integers used here.

### Commands Needed

```bash
g++ -shared -o pocketdb_engine.dll engine.cpp
```

`g++` is the GNU C++ compiler driver — `-shared` (produce a `.dll`
instead of an `.exe`), `-o pocketdb_engine.dll` (output filename),
`engine.cpp` (the source file to compile). Success means no output at
all and exit code `0`; a real compile error prints to the terminal and
no `.dll` appears.

**A real, machine-specific setup detail worth knowing now, not
discovering later:** on this machine, `g++` (from an MSYS2 install at
`C:\msys64\ucrt64\bin\g++.exe`) failed with no visible error at all until
`C:\msys64\ucrt64\bin` was added to `PATH` — the compiler's own helper
program, `cc1plus.exe`, needs its sibling DLLs on `PATH` to even start,
and Windows fails that silently from a script (`STATUS_DLL_NOT_FOUND`,
diagnosed by launching `cc1plus.exe` directly and reading the real
process exit code). If `g++ -shared ...` produces no `.dll` and no
visible error, check `PATH` before assuming the source has a bug.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — this
lesson has no separate "project version" distinct from that isolated
proof yet; Slice S01 is where a real, permanent project file replaces
this throwaway one.

### Connection

The compile step above proves C++ can be turned into something loadable.
It does not yet prove the *name* `add_two_numbers` survives that process
intact — the next unit proves that directly, by breaking it on purpose.

---

## Concept Unit: `extern "C"` — Keeping a Name Findable Across the Boundary

### The Problem

`ctypes.CDLL(...).add_two_numbers` found and called a real function by
that exact name in the unit above. Would that still work if `extern "C"`
were removed — does a C++ compiler always export a function under the
exact name written in its source?

### Introduce the Concept in Isolation

Still inside `pocketdb/`, the identical function saved as a new file,
`engine_no_extern_c.cpp`, with `extern "C"` removed:

```cpp
int add_two_numbers(int a, int b)
{
    return a + b;
}
```

Compiled the same way:

```bash
g++ -shared -o pocketdb_engine_mangled.dll engine_no_extern_c.cpp
```

Real output — compiles cleanly, no errors, a `.dll` is produced. Whether
it *works the same way* is a separate question — checked directly by
inspecting what the compiler actually named the exported function,
using `objdump`, a real tool for reading a compiled binary's own export
table:

```bash
objdump -p pocketdb_engine_mangled.dll
```

Real, relevant excerpt of the output:

```text
Export Address Table -- Ordinal Base 1
          Ordinal  Address  Type
[   0] +base[   1]  0000 _Z15add_two_numbersii
```

Compared directly against the `extern "C"` version's own export table,
inspected the same way:

```text
Export Address Table -- Ordinal Base 1
          Ordinal  Address  Type
[   0] +base[   1]  0000 add_two_numbers
```

*What this proves:* the exact same function body, compiled two different
ways, produces two genuinely different exported names —
`add_two_numbers` versus `_Z15add_two_numbersii`. This transformation is
called **name mangling**: the C++ compiler encoded the function's name
(`add_two_numbers`, `15` characters) and its parameter types (`ii`, two
`int`s) directly into the real symbol name, following a real, standard
scheme (the Itanium C++ ABI) — done specifically so two *different* C++
functions both named `add_two_numbers`, but taking different parameter
types (function overloading), can exist as two distinct real symbols
instead of colliding.

The practical cost, proven directly rather than just asserted — calling
the mangled version from Python exactly the way the first unit called
the working one. Save the following as `call_mangled.py`, in the same
`pocketdb/` folder:

```python
import ctypes

engine = ctypes.CDLL("./pocketdb_engine_mangled.dll")
result = engine.add_two_numbers(4, 7)
print(result)
```

Run with `python call_mangled.py`. Real, captured failure:

```text
Traceback (most recent call last):
  ...
    result = engine.add_two_numbers(4, 7)
             ^^^^^^^^^^^^^^^^^^^^^^
  ...
AttributeError: function 'add_two_numbers' not found
```

`ctypes` looked for a symbol literally named `add_two_numbers` in the
`.dll`'s export table — and, per the real export table shown above, that
exact name genuinely isn't there anymore; only `_Z15add_two_numbersii`
is.

### Discard the Throwaway Example

`engine_no_extern_c.cpp` and `pocketdb_engine_mangled.dll` are both
deleted once this failure is understood — they exist only to prove the
point by contrast, and are never referenced again.

### Mechanical Walkthrough

- `extern "C"` — a linkage specification, written directly before a
  function's return type. It doesn't change what the function *does*;
  it changes what the compiler exports it *as* — the plain, unmangled
  name instead of the mangled one, matching the naming convention a C
  compiler (which has no overloading, and so never needed mangling) uses.
- `objdump -p` — inspects a compiled binary's own headers, including its
  real export table — the authoritative, ground-truth list of every name
  the `.dll` actually makes callable from outside itself. This is the
  tool used here specifically because it reads what the compiler
  actually produced, rather than trusting the source code's own naming.
- `AttributeError: function 'add_two_numbers' not found` — `ctypes`'
  own real error, raised the moment a lookup-by-name fails against the
  `.dll`'s actual export table; not a Python-level naming issue, a
  genuine "this symbol does not exist under this name" failure.

### CS Lens

This is an **Application Binary Interface (ABI)** boundary — the rules
governing how compiled code from different sources (different compilers,
sometimes different languages entirely) can correctly call into each
other, which go well beyond source-level syntax. Also recognized in:
Rust's own `extern "C"` (the identical concept, different language),
Swift's `@_cdecl`, Java's JNI requiring specific, exact native method
names, and every operating system's own core system-call interface,
which is defined in terms of a stable C ABI specifically so any language
can call into it.

### SE Lens

Why does PocketDB's `extern "C"` boundary stay deliberately narrow —
plain functions, C-shaped types only — instead of exposing real C++
classes with methods directly across it? A C++ class's methods are
name-mangled exactly the way `add_two_numbers` just was, and that
mangling scheme isn't standardized *across different C++ compilers* the
way it is within one compiler's own releases — a class built with one
compiler is not reliably callable from code built with a different one.
A narrow `extern "C"` surface sidesteps that entirely: it doesn't matter
what compiler built either side, because the boundary itself never
carries a mangled name across it. The real cost: every real capability
the engine has — `Schema`, `Table`, indexes, the query engine — has to
be deliberately translated into this narrow, C-shaped surface at the
boundary, by hand, rather than exposed directly. That translation work
*is* the `extern "C"` API `README.md`'s architecture diagram shows —
not incidental plumbing, a real, ongoing design responsibility this
project carries from here forward.

### Commands Needed

```bash
g++ -shared -o pocketdb_engine_mangled.dll engine_no_extern_c.cpp
objdump -p pocketdb_engine_mangled.dll
```

`objdump` is part of the same MSYS2/MinGW toolchain as `g++` — `-p`
dumps a binary's private headers, which for a `.dll` includes the real
export table shown above.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — the real
`AttributeError`, captured directly, is this unit's own proof.

### Connection

Every real function PocketDB's `extern "C"` API exposes from here
forward — starting with Slice S01's `database_open`/`create_table`/
`insert`/`get` — is written with this exact `extern "C"` discipline,
proven in this unit to be the only thing standing between "Python can
call this by name" and a real, silent-until-runtime `AttributeError`.

---

## Closing

### Connect the Pieces

`engine.cpp` was written with one `extern "C"` function, `add_two_numbers`.
Compiled with `g++ -shared`, it became a real `.dll` whose export table —
inspected directly with `objdump`, not assumed — genuinely contains the
plain name `add_two_numbers`. Python's `ctypes.CDLL` loaded that `.dll`
at runtime and found that exact name, letting `engine.add_two_numbers(4, 7)`
run real, compiled C++ code and return `11` — a correct answer computed
by C++, received by Python, with no text parsing, no subprocess, no file
in between. Removing `extern "C"` and repeating the identical steps
produced a `.dll` whose export table held `_Z15add_two_numbersii`
instead — and the identical Python call failed with a real
`AttributeError`, proving `extern "C"` isn't cosmetic; it's the one
thing making this whole cross-language call possible at all.

### What Breaks Without This

Already shown directly above, not hypothetically: remove `extern "C"`
from `engine.cpp`, recompile, and the exact same Python call that worked
a moment before fails with `AttributeError: function 'add_two_numbers'
not found` — restore `extern "C"`, recompile, and it works again. This
*is* the "what breaks" proof this section normally asks you to go cause
yourself — already caused, and shown, in the second Concept Unit above.

### Exercises

- Change `add_two_numbers` to take three `int` parameters instead of two,
  recompile, update the Python call's `argtypes` to match, and confirm a
  real, correct three-argument result.
- Call the mangled `.dll`'s function by its real, mangled name directly:
  `getattr(engine, "_Z15add_two_numbersii")(4, 7)`. Confirm this actually
  works — proving the function itself was never broken or missing, only
  unreachable under the name you expected.
- Run `objdump -p` against `pocketdb_engine.dll` (the working,
  `extern "C"` version) yourself, and find the exact line this lesson
  quoted, in the real output, without being told where to look.

### Definition of Done

- [ ] `pocketdb_engine.dll` exists, built from a real `extern "C"`
      function, and a real Python script calls it and prints a correct
      result you computed and verified yourself.
- [ ] You produced the mangled `.dll` yourself, ran `objdump -p` against
      it, and can point to the real mangled symbol name in your own
      terminal's output — not just recall it from this lesson.
- [ ] You caused the real `AttributeError` yourself, read it, and can
      explain in your own words why it happened, referring to the real
      export table difference, not just "extern C fixes it."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Prove the C++ to Python FFI boundary works, and prove extern C is why"`.
