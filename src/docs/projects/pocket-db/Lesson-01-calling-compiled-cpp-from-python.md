# Lesson 1: Calling Into Compiled C++ From Python

**What you will build**
The Python half of the same proof Lesson 0 built: loading
`pocketdb_engine.dll` at runtime and calling its real, compiled
`add_two_numbers` function — then proving, by causing a real failure on
purpose, why `ctypes` needs to be told a function's real C signature
before that call is safe for anything more complex than two plain
`int`s.

**What you need to know first:** Lesson 0 —
`pocketdb_engine.dll`, compiled from a real `extern "C"` function named
`add_two_numbers(int, int)`, and the real reason `extern "C"` is what
made that function's name findable at all.

**Terms introduced in this lesson:**
- **FFI (Foreign Function Interface)** — the general term for any
  mechanism letting one language call code compiled from a different
  language. `ctypes` is Python's own standard-library FFI — no separate
  install needed, unlike most other languages' FFI tools.
- **Type marshaling** — converting a value from one language's own
  internal representation into the exact bytes the other language's
  calling convention expects, and back again for a return value.
  `ctypes` does this automatically once told the real C types involved
  — and, proven directly in this lesson's second Concept Unit, gets it
  silently, dangerously wrong when it isn't told.

**Objects and methods used**
- **`ctypes.CDLL`**
  - *What it is:* the class representing an already-loaded shared
    library, whose exported functions become callable as ordinary
    Python attributes.
  - *Implementation:* `ctypes.CDLL(path)` loads the `.dll` at the given
    path immediately, at the moment it's called — not lazily, not at
    Python's own `import` time — and returns an object whose attribute
    access (`engine.add_two_numbers`) resolves, by name, against the
    library's real export table.
  - *Its use:* `engine = ctypes.CDLL("./pocketdb_engine.dll")`, this
    lesson's own real load of the `.dll` Lesson 0 compiled —
    the one line making every call after it possible.
- **`.argtypes` / `.restype`**
  - *What they are:* per-function attributes on a `ctypes` function
    object, declaring the real C parameter types and real C return type
    `ctypes` should use when marshaling a call — not enforced by the
    compiled `.dll` itself, which carries no type information at all
    once compiled, only by `ctypes`, and only if told.
  - *Implementation:* `engine.some_function.argtypes = [ctypes.c_int, ...]`
    (a Python `list` of `ctypes` type objects, one per real C parameter)
    and `engine.some_function.restype = ctypes.c_int` (a single
    `ctypes` type object). Left unset, `ctypes` falls back to a default
    guess — plain Python `int` arguments happen to marshal correctly
    under that default; this lesson's second Concept Unit proves,
    directly, exactly where that default guess stops being safe.
  - *Its use:* declared once, right after loading the library, before
    the first real call — this lesson's own second unit proves what
    happens, concretely, when they're skipped.

---

## Concept Unit: `ctypes.CDLL` — Loading a Compiled Library at Runtime

### The Problem

Lesson 0 proved a `.dll` can genuinely hold a callable,
`extern "C"`-exported function. Python has no `import pocketdb_engine`
for a `.dll` — how does a running Python process actually reach into a
compiled, non-Python file and call something inside it?

### Introduce the Concept in Isolation

The same `call_engine.py`, in the same `pocketdb/` folder Lesson 0
created, that already proved the `.dll` worked — examined here for what
each line actually does on the Python side:

```python
import ctypes

engine = ctypes.CDLL("./pocketdb_engine.dll")
engine.add_two_numbers.argtypes = [ctypes.c_int, ctypes.c_int]
engine.add_two_numbers.restype = ctypes.c_int

result = engine.add_two_numbers(4, 7)
print(f"add_two_numbers(4, 7) = {result}")
```

Real output:

```text
add_two_numbers(4, 7) = 11
```

*What this proves:* `ctypes.CDLL(...)` genuinely loaded a foreign,
non-Python file into this Python process's own memory, and
`engine.add_two_numbers(4, 7)` genuinely executed real, compiled C++
machine code — not a Python re-implementation, not a simulation — and
got a real value back, usable in Python exactly like any other function
call's return value. This whole mechanism — one language calling
directly into another's compiled code, at runtime — is called an
**FFI (Foreign Function Interface)**.

**A real, more forgiving default worth naming honestly:** this specific
call would still have worked with `argtypes`/`restype` left unset — for
two plain `int`s, `ctypes`' own default guess happens to be correct.
Whether that default guess stays correct for every type is checked
directly, on purpose, in the next unit.

### Discard the Throwaway Example

This exact script is kept, not discarded outright — it's the real seed
of the `pocketdb` Python package Slice S01 builds for real. What's
explicitly *not* kept: writing `ctypes.CDLL(...)` and raw attribute
calls directly in code that uses the database — Slice S01's own
`pocketdb.open()`/`.create_table()`/etc. wraps this exact mechanism
behind a real, designed package, per `README.md`'s "two APIs, two
audiences" principle. What's proven here is the raw mechanism only.

### Mechanical Walkthrough

- `import ctypes` — Python's own standard-library FFI module; no
  install needed, unlike most other languages' foreign-function tooling.
- `ctypes.CDLL("./pocketdb_engine.dll")` — loads the `.dll` at the given
  relative path immediately, returning a real object representing the
  loaded library.
- `engine.add_two_numbers` — attribute access on that object resolves,
  by name, against the `.dll`'s real export table — exactly the
  mechanism Lesson 0 proved depends on `extern "C"` for its
  name to survive compilation intact.
- `.argtypes = [ctypes.c_int, ctypes.c_int]` — a two-element `list`,
  one `ctypes.c_int` per real C `int` parameter `add_two_numbers` takes.
- `.restype = ctypes.c_int` — declares the real C return type.
- `engine.add_two_numbers(4, 7)` — the actual call: Python `int`s `4`
  and `7`, marshaled into real C `int`s per the declared `argtypes`,
  passed to the real compiled function, its real C `int` return value
  marshaled back into a Python `int` per the declared `restype`.

### CS Lens

This is **type marshaling** — translating a value between two different
languages' own internal representations of "the same" data, at a real
call boundary. Also recognized in: any RPC framework (gRPC, JSON-RPC)
marshaling a request across a network instead of a process boundary,
Java's JNI marshaling between Java objects and native C types, and
Python's own `struct` module, which does the identical byte-level
translation by hand for binary file formats instead of function calls.

### SE Lens

Why does `ctypes` need `argtypes`/`restype` *declared* at all, instead
of reading them directly out of the compiled `.dll`, the way an IDE
reads a Python function's own type hints? A compiled `.dll`'s export
table — proven directly in Lesson 0 with `objdump` — holds
only names and addresses, never parameter or return types; that
information existed in the C++ source, but compiling away exactly that
kind of detail is what "compiled" *means*. The real cost: nothing
stops a Python caller from declaring the *wrong* types and having
`ctypes` marshal confidently, silently, and incorrectly — proven
directly, on purpose, in the next unit.

### Commands Needed

No new commands this unit — `python` alone runs the script above, the
same way every prior real Python execution in this repo's curricula has.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

`ctypes` correctly guessed the right marshaling for two plain `int`s
without being told. The next unit finds out, for real, whether that
guess still holds once the real C type stops being a plain `int`.

---

## Concept Unit: Why `argtypes`/`restype` Aren't Optional

### The Problem

`add_two_numbers` worked without declaring `argtypes`/`restype` at all.
Does `ctypes`' own default guess hold for every C type, or does the
previous unit's convenient result depend on `int` specifically being a
type `ctypes` happens to guess correctly?

### Introduce the Concept in Isolation

A second, real `extern "C"` function, added to the same `pocketdb/`
folder's `engine.cpp` (open the file Lesson 0 created and add this
below `add_two_numbers`, in the same file) — this time returning a
`double`, not an `int`:

```cpp
extern "C" double average_of_two(double a, double b)
{
    return (a + b) / 2.0;
}
```

Recompiled the same way Lesson 0 already proved works, from inside
`pocketdb/`:

```bash
g++ -shared -o pocketdb_engine.dll engine.cpp
```

Called from Python, deliberately *without* declaring `argtypes`/`restype`
this time. Save this as `call_double_no_types.py`, in `pocketdb/`:

```python
import ctypes

engine = ctypes.CDLL("./pocketdb_engine.dll")
result = engine.average_of_two(4.0, 8.0)
print(f"no argtypes/restype: average_of_two(4.0, 8.0) = {result}")
```

Run with `python call_double_no_types.py`. Real, captured failure — not
a wrong number, an outright exception:

```text
Traceback (most recent call last):
  ...
    result = engine.average_of_two(4.0, 8.0)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ctypes.ArgumentError: argument 1: TypeError: Don't know how to convert parameter 1
```

*What this proves:* `ctypes`' default guess — the one that happened to
work for `add_two_numbers`'s plain `int`s — has no rule at all for a
Python `float` argument; it refuses to guess and raises a real
`ArgumentError` instead of marshaling something wrong.

Declaring `argtypes`/`restype` correctly fixes it — add these three
lines to the top of `call_double_no_types.py`, right after
`engine = ctypes.CDLL(...)`, before the existing call:

```python
engine.average_of_two.argtypes = [ctypes.c_double, ctypes.c_double]
engine.average_of_two.restype = ctypes.c_double

result = engine.average_of_two(4.0, 8.0)
print(f"with argtypes/restype declared: average_of_two(4.0, 8.0) = {result}")
```

Run the edited file again. Real output:

```text
with argtypes/restype declared: average_of_two(4.0, 8.0) = 6.0
```

`6.0` is correct — `(4.0 + 8.0) / 2.0`. But `argtypes` alone isn't the
whole story — `restype`, deliberately left wrong on purpose here, proves
the same class of failure exists on the *return* side too, and this time
without raising anything at all:

Add these three lines to the end of the same `call_double_no_types.py`:

```python
engine.average_of_two.restype = ctypes.c_int  # deliberately wrong
wrong = engine.average_of_two(4.0, 8.0)
print(f"restype wrongly left as c_int: average_of_two(4.0, 8.0) = {wrong}")
```

Run the file once more. Real, genuinely wrong output — no crash, no
warning:

```text
restype wrongly left as c_int: average_of_two(4.0, 8.0) = 315442323
```

*What this proves:* the real compiled function still correctly computed
`6.0` and returned it as 8 real bytes (a C `double`). Telling `ctypes`
to interpret those same 8 bytes as a `c_int` doesn't convert `6.0` to an
integer the way Python's own `int(6.0)` would — it reinterprets the raw
bit pattern of the `double` as if it were a completely different type,
producing `315442323`: a real number, confidently returned, with no
error anywhere, and no relationship at all to the real answer.

### Discard the Throwaway Example

`average_of_two` stays — it's a genuine, if small, second real function
in `engine.cpp` now, proving `argtypes`/`restype` weren't a coincidence
specific to `int`. What's discarded: the two deliberately-broken calls
above (no `argtypes` at all; `restype` wrongly set to `c_int`) — neither
appears again past this unit.

### Mechanical Walkthrough

- `extern "C" double average_of_two(double a, double b)` — reappearing
  shape (the same `extern "C"` discipline Lesson 0 already
  proved is what keeps a name findable), this time with `double`
  parameters and return type instead of `int`.
- `ctypes.ArgumentError` — `ctypes`' own real exception, raised the
  moment it's asked to marshal a Python value into a C type it hasn't
  been told and can't safely infer — a real, loud failure, not a silent
  wrong answer.
- `ctypes.c_double` — the `ctypes` type object representing a real C
  `double` — parallel to `ctypes.c_int` from the previous unit, one of a
  whole family of `ctypes` type objects mapping directly onto real C
  types.
- `.restype = ctypes.c_int` (deliberately wrong here) — this is the
  exact same attribute the first unit used correctly; the only
  difference is the value assigned to it, proving the attribute itself
  isn't what's dangerous — an incorrect *value* for it is.

### CS Lens

The wrong-`restype` failure is **type punning** — reinterpreting the
same raw bytes as a different type than the one that produced them,
without any actual conversion happening. Also recognized in: C's own
`union`s (multiple types sharing one block of memory on purpose),
network protocol parsers that misread a field's byte width, and any bug
report describing "the number looks like garbage" from code reading a
binary file format with the wrong field types declared.

### SE Lens

Why does `ctypes` let you set `restype` to something *wrong* at all,
instead of somehow checking it against the real compiled function? The
`.dll`'s own export table — proven with `objdump` in Lesson 0
— contains no type information whatsoever once compiled; `ctypes` has
no ground truth to check `argtypes`/`restype` against except what you
tell it, and trusts that completely. The real cost this project accepts
knowingly: every real function PocketDB's Python side calls needs its
`argtypes`/`restype` declared correctly, by a human, matching the real
C++ signature exactly — and Slice S01's own `pocketdb` package exists
partly to make that declaration happen in exactly one place per
function, not copy-pasted at every call site where a mistake like this
one could silently reappear.

### Commands Needed

```bash
g++ -shared -o pocketdb_engine.dll engine.cpp
```

Recompiling `engine.cpp` after adding `average_of_two` to it — the same
command Lesson 0 already established, run again because the
source file changed.

### Run It

Already shown above, in "Introduce the Concept in Isolation" — both the
real `ArgumentError` and the real, wrong `315442323`.

### Connection

Both real failures this unit caused — the loud `ArgumentError` and the
silent, wrong `315442323` — are exactly what Slice S01's real
`pocketdb` package has to prevent for every real function the engine
exposes, not just these two throwaway proofs.

---

## Closing

### Connect the Pieces

Lesson 0 compiled `add_two_numbers` into `pocketdb_engine.dll`
and proved, with `objdump`, that `extern "C"` is what kept its name
`add_two_numbers` instead of a mangled one. This lesson's first unit
loaded that same `.dll` with `ctypes.CDLL`, declared its real
`argtypes`/`restype`, and called it — `11`, correct, computed by real
C++, received by real Python. The second unit added a real second
function, `average_of_two`, returning a `double` — and proved, by
causing both failures for real, that `ctypes`' convenient default guess
for `int` doesn't generalize: skip `argtypes` entirely and get a loud,
honest `ArgumentError`; declare `restype` wrong and get a silent,
confidently wrong `315442323`, with the real, correct `6.0` computed and
discarded along the way.

### What Breaks Without This

Already shown directly above, twice, not hypothetically: remove
`argtypes` from `average_of_two`'s call and get a real
`ctypes.ArgumentError`; leave `restype` as `ctypes.c_int` and get a
real, wrong `315442323` with no error at all. Restoring the correct
declarations, shown above, fixes both.

### Exercises

- Add a third function to `engine.cpp`, `extern "C" int square(int n)`,
  recompile, and call it from Python with correct `argtypes`/`restype`
  — confirm a real, correct result for at least three different inputs.
- Deliberately declare `average_of_two`'s `argtypes` as
  `[ctypes.c_int, ctypes.c_int]` instead of `c_double` (wrong parameter
  types this time, not return type) and run the call. Read whatever real
  error or real wrong value results, and explain it the same way this
  lesson explained the `restype` failure.
- Without looking back at this lesson, predict what `ctypes` will do if
  `argtypes` is set correctly but `restype` is left completely unset
  (not wrong — unset). Then run it for real and check your prediction
  against the real output.

### Definition of Done

- [ ] `add_two_numbers` and `average_of_two` both work correctly when
      called from your own real Python script, with `argtypes`/`restype`
      declared correctly for each.
- [ ] You caused the real `ArgumentError` yourself, by removing
      `argtypes`, and read the real traceback.
- [ ] You caused the real, silently-wrong `315442323` result yourself,
      by setting `restype` incorrectly, and can explain — in terms of
      raw bytes being reinterpreted, not "it just breaks" — why that
      specific number came out.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Prove ctypes needs real argtypes/restype, not just for int"`.
