# Lesson 7: Reading Real Bytes — `BinaryReader`

**What you will build:** a new class, `BinaryReader`, in a new file
`src/vector3d/binary_reader.py` — this project's first class built from
a real file on disk, and its first class whose instances *change over
time* as their methods are called, rather than staying fixed the moment
they're constructed. Everything through Phase A (`Vector3`, `Triangle`,
`Mesh`) was built by hand-typing constructor calls; this lesson is where
the rebuild starts reading actual bytes, the way `pyvista.read(path)`
does invisibly in the original script. Lesson 8 uses `BinaryReader` to
parse a real binary STL file into `Triangle`/`Mesh` objects; this lesson
builds the general-purpose byte-reading machinery that Lesson 8 will
build on top of.

**What you need to know first:** Phase A in full (Lessons 1-6) —
`Vector3`, `Triangle`, `Mesh`, and the composition pattern connecting
them. Nothing from Phase A is modified in this lesson; `BinaryReader` is
an independent new class.

**Terms used in this lesson:**
- **binary mode** — opening a file with `"rb"` instead of the default
  text mode, telling Python to hand back the file's raw bytes exactly as
  stored on disk, with no text decoding, no newline translation, and no
  assumption about a text encoding. It exists because an STL file (like
  most 3D model formats) isn't text at all — it's packed numeric data,
  and reading it in text mode would corrupt it, since text mode actively
  tries to interpret bytes as characters in some encoding.
- **`bytes`** — Python's built-in type for a sequence of raw byte
  values, each one a number from `0` to `255`, distinct from `str`
  (text). `f.read()` on a file opened in binary mode returns a `bytes`
  object, not a string — even though it can *look* like a string when
  printed (`b'hello'` for a chunk that happens to hold ASCII text), it's
  a fundamentally different type, and most string methods either don't
  work on it the same way or don't exist for it at all.
- **`with` statement (context manager)** — the same `with open(...) as
  f:` block you already know from ordinary Python file handling; used
  here exactly as you've likely used it before. Its purpose — closing
  the file automatically once the block ends, even if an error occurs
  inside it — isn't new to this curriculum's own concepts, just newly
  relevant now that this project reads real files for the first time.
- **byte offset** — a position, counted in bytes from the start of a
  chunk of data, saying where to start reading the next piece from. It
  exists because a binary file like STL isn't self-describing the way
  a line of text is — nothing marks where one field ends and the next
  begins — so code reading it has to track "how far in am I" explicitly,
  and read a known, fixed number of bytes at a time.
- **cursor (read position)** — a piece of state, stored on an object,
  tracking the current byte offset as reading proceeds — advancing
  automatically each time more data is consumed, so the next read
  continues from where the last one left off rather than starting over.
- **mutable instance state** — an instance attribute whose value is
  expected to *change* over the object's lifetime, as opposed to every
  attribute built in Phase A, which was set once by `__init__` and never
  changed again. `BinaryReader`'s `self.offset` is this project's first
  example: every call to a reading method updates it.
- **`struct` module** — a Python standard-library module for converting
  between raw bytes and Python numbers, according to a specific binary
  layout (how many bytes, signed or unsigned, integer or floating-point,
  which byte order). It exists because raw bytes on their own carry no
  inherent meaning — the four bytes `\x02\x00\x00\x00` are only "the
  number 2" under a specific, agreed-upon interpretation, and `struct`
  is what applies that interpretation in both directions (bytes → number
  and number → bytes).
- **format string (`struct`)** — a short code, like `"<I"` or `"<f"`,
  telling `struct` exactly how to interpret a chunk of bytes: `<` means
  little-endian byte order (the byte order the STL format itself uses,
  and the order essentially all consumer hardware uses natively),
  `I` means an unsigned 32-bit integer, and `f` means a 32-bit
  floating-point number. It exists because the same four raw bytes
  could validly mean an integer, a float, two 16-bit numbers, or
  something else entirely — the format string is how you tell `struct`
  which one you actually want.

**Objects and methods used:**

- **`BinaryReader`**
  - *What it is:* a class wrapping a file's raw bytes together with a
    read cursor, so a caller can pull out one piece of structured data
    at a time without manually tracking byte positions itself.
  - *Implementation:* `class BinaryReader:` with `__init__(self, path)`
    reading an entire file into `self.data` (bytes) and initializing
    `self.offset = 0`, plus `read_bytes`, `read_uint32`, and
    `read_float32` methods built later in this lesson.
  - *Its use:* stands in for the low-level byte-reading `pyvista.read(path)`
    performs invisibly before it ever hands back a usable mesh object;
    Lesson 8's STL-specific parsing will use `BinaryReader`'s methods to
    read the file's header, triangle count, and per-triangle records.
  - *Type:* a plain class, no parent class — this project's first class
    whose purpose is process/state management (reading progressively
    through a byte sequence) rather than representing a fixed geometric
    value.
  - *Responsibility:* to hold one file's entire raw byte content, and to
    let a caller read through it piece by piece — a fixed number of raw
    bytes, an unsigned 32-bit integer, or a 32-bit float at a time —
    each read automatically continuing from wherever the previous one
    left off.
  - *Depends on:* a real file path on disk, readable in binary mode; the
    standard-library `struct` module for interpreting bytes as numbers.
  - *Connects to:* nothing calls `BinaryReader` yet within this project
    beyond this lesson's own verification runs; Lesson 8's `STLReader`
    will construct one directly and call its reading methods repeatedly
    to walk through an entire STL file.
  - *Shape:* a new, independent branch of this project's architecture —
    not built on `Vector3`/`Triangle`/`Mesh` at all, and not (yet) used
    by them either; Lesson 8 is where this lesson's `BinaryReader` and
    Phase A's `Vector3`/`Triangle`/`Mesh` first connect.

- **`BinaryReader.read_bytes`**
  - *What it is:* an instance method returning a specific number of raw
    bytes starting at the reader's current cursor position, and
    advancing that cursor past what was just read.
  - *Implementation:*
    `def read_bytes(self, n): chunk = self.data[self.offset:self.offset + n]; self.offset += n; return chunk`
    — takes `self` and a count `n`, returns a `bytes` object, and
    mutates `self.offset`.
  - *Its use:* the foundation every more specific reading method
    (`read_uint32`, `read_float32`, and Lesson 8's STL-specific readers)
    is built on — none of them touch `self.data`/`self.offset` directly;
    they all call `read_bytes` first, then interpret what it returns.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to hand back exactly `n` raw bytes from the
    current position, and to leave the reader correctly positioned for
    whatever gets read next — the one method in this class actually
    responsible for advancing the cursor.
  - *Depends on:* `self.data` and `self.offset`, both set by
    `BinaryReader.__init__`.
  - *Connects to:* called by `read_uint32` and `read_float32` (both
    built later in this lesson), and will be called directly by Lesson
    8's STL parsing for fields that don't need numeric interpretation
    (raw vertex-normal bytes, for instance, before they're unpacked).
  - *Shape:* `BinaryReader`'s own layer — the single method every other
    reading method in this class funnels through.

- **`BinaryReader.read_uint32`**
  - *What it is:* an instance method reading the next 4 bytes and
    interpreting them as an unsigned 32-bit integer.
  - *Implementation:*
    `def read_uint32(self): chunk = self.read_bytes(4); return struct.unpack("<I", chunk)[0]`
    — takes only `self`, returns a plain Python `int`.
  - *Its use:* the binary STL format's triangle count (Lesson 8) is
    stored as exactly this: a 4-byte unsigned integer, immediately after
    the file's 80-byte header.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to read exactly 4 bytes via `read_bytes` and
    convert them to a real Python integer using `struct`, correctly
    advancing the cursor by exactly 4 bytes in the process (a side
    effect of calling `read_bytes`, not something this method manages
    directly).
  - *Depends on:* `BinaryReader.read_bytes` (this lesson, defined just
    above) and the standard-library `struct.unpack`.
  - *Connects to:* calls `self.read_bytes(4)`, then `struct.unpack`.
    Lesson 8 will call this once, directly, to read the STL triangle
    count.
  - *Shape:* `BinaryReader`'s own layer, built on top of `read_bytes`
    within the same class — this project's first example of one method
    calling another method on the *same* instance to do part of its
    work (the same pattern `Vector3.length` calling `Vector3.dot` used
    in Lesson 4, now appearing in a completely different class).

- **`BinaryReader.read_float32`**
  - *What it is:* an instance method reading the next 4 bytes and
    interpreting them as a 32-bit floating-point number.
  - *Implementation:*
    `def read_float32(self): chunk = self.read_bytes(4); return struct.unpack("<f", chunk)[0]`
    — takes only `self`, returns a plain Python `float`.
  - *Its use:* every vertex coordinate and every normal-vector component
    in a binary STL file (Lesson 8) is stored as exactly this: a 4-byte
    32-bit float.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to read exactly 4 bytes via `read_bytes` and
    convert them to a real Python float using `struct`.
  - *Depends on:* `BinaryReader.read_bytes` and `struct.unpack` — the
    same dependencies as `read_uint32`, differing only in the format
    string passed to `struct.unpack`.
  - *Connects to:* calls `self.read_bytes(4)`, then `struct.unpack`.
    Lesson 8 will call this repeatedly — three times per vertex, three
    vertices per triangle — to read every coordinate in the file.
  - *Shape:* `BinaryReader`'s own layer, structurally identical to
    `read_uint32` — the same read-then-interpret pattern, with a
    different `struct` format string producing a different Python type
    from the same four raw bytes.

---

## Concept Unit: Reading a File's Real, Raw Bytes

### The Problem

`diff3d.py`'s `run_diff()` does `m1 = pyvista.read(path1)` — one line,
and somewhere inside `pyvista`, the actual bytes of an `.stl` file on
disk get opened, read, and turned into a usable mesh object. None of
that is visible from the script itself. This project has no file-reading
code at all yet — every `Vector3`, `Triangle`, and `Mesh` built in
Phase A came from typing numbers directly into Python code, never from
an actual file on disk.

> **Before reading on, try this yourself:** you already know
> `open(path)` and `.read()` from ordinary Python text-file handling.
> An `.stl` file isn't text, though — it's packed binary data,
> deliberately not meant to be read as human-readable characters. If
> you tried opening a binary file the normal (text) way and printed
> what `.read()` returned, what problems do you think you'd hit —
> given that text mode actively tries to interpret every byte as part
> of some text encoding, and packed binary data was never encoded as
> text in the first place?

### Introduce the Concept in Isolation

```python
# Throwaway lab: reading a file's raw bytes, in binary mode
with open("/tmp/lab_bytes.bin", "wb") as f:
    f.write(b"\x02\x00\x00\x00hello")

with open("/tmp/lab_bytes.bin", "rb") as f:
    data = f.read()

print(data)
print(type(data))
print(len(data))
```

Real output from running this:

```
b'\x02\x00\x00\x00hello'
<class 'bytes'>
9
```

The `"wb"`/`"rb"` modes (write-binary, read-binary — this lesson's
**binary mode**) round-trip the exact same raw bytes with nothing added,
removed, or reinterpreted. The printed value, `b'\x02\x00\x00\x00hello'`,
shows Python's own representation of a **`bytes`** object: the leading
`b` marks it as bytes rather than a string, `\x02\x00\x00\x00` are four
raw byte values shown in hex escape form (each too unusual to print as
a normal character), and `hello` prints as plain characters only because
those five particular byte values *happen* to correspond to printable
ASCII letters — the type itself, confirmed by `type(data)`, is `bytes`
either way, not `str`. `len(data)` correctly reports `9` — four
unprintable bytes plus five ASCII-printable ones, all counted the same
way, because `bytes` doesn't distinguish "printable" from
"unprintable" internally at all; that distinction only exists in how
Python chooses to *display* them.

### Discard the Throwaway Example

This scratch file and lab code are discarded now. The real project
version reads an actual file path into a real class next.

### Project Change

- **Reference Source:** `diff3d.py`'s `run_diff()`:
  `m1 = pyvista.read(path1)`. There is no lower-level line to quote —
  `pyvista.read`'s own file-opening and byte-reading happens entirely
  inside the library, not in this script. This lesson factors that
  invisible first step out into real, visible code for the first time.
- **Files affected:** create `src/vector3d/binary_reader.py` (new
  file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** a real, readable file on disk (this lesson's
  verification uses a small synthetic file, since Lesson 8 is where an
  actual `.stl` file's specific format matters).

### The New Code

Type this into `src/vector3d/binary_reader.py`:

```python
class BinaryReader:
    def __init__(self, path):
        with open(path, "rb") as f:
            self.data = f.read()
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption every new file in this curriculum
has used):

```
1  class BinaryReader:
2      def __init__(self, path):
3          with open(path, "rb") as f:
4              self.data = f.read()
```

Four lines, and as a whole this file now defines a buildable
`BinaryReader(path)` that, given a real file path, opens it in binary
mode, reads every byte of it into memory, and stores the whole thing as
`self.data` — a real `bytes` object, exactly the same type this
Concept Unit's own lab just proved `open(..., "rb").read()` produces.

### Mechanical Walkthrough

- **`class BinaryReader:`** — the same `class` keyword from Lesson 1,
  defining a new blueprint.
- **`def __init__(self, path):`** — `def`, `__init__` (Lesson 1's
  reserved constructor name), `self`, and one parameter, `path` — a
  string naming a real file's location on disk.
- **`with open(path, "rb") as f:`** — the `with` statement (context
  manager), already familiar from ordinary Python file handling —
  `open(path, "rb")` opens the file this lesson's own term describes as
  binary mode, `as f` binds the resulting open-file object to the local
  name `f` for the duration of the indented block below it, and the
  `with` statement guarantees the file is closed automatically once that
  block ends, even if something inside it raised an error.
- **`self.data = f.read()`** — `f.read()`, called with no arguments,
  reads the file's *entire* remaining content in one call (unlike the
  4-byte reads this lesson's later methods will perform), returning a
  single `bytes` object; `self.data = ...`, the same attribute-assignment
  syntax from Lesson 1, storing that entire `bytes` object as one
  persistent instance attribute.

### CS Lens

This is **eager loading** — reading an entire resource into memory
upfront, all at once, rather than reading it incrementally as pieces are
actually needed.

Also recognized in: loading an entire image file into memory before
decoding individual pixels; a JSON parser reading a whole file's text
before starting to interpret its structure; a database driver fetching
an entire result set at once rather than streaming rows one at a time;
video game asset loading (reading a whole texture or model file into
memory during a level-load screen, rather than reading from disk
mid-gameplay).

### SE Lens

The principle is **simplicity over scalability, chosen deliberately for
this project's actual scale**. Reading the entire file into `self.data`
in one call is by far the simplest way to make the rest of this class's
methods work — every later read is just slicing an in-memory `bytes`
object, with no repeated disk access at all.

The alternative not chosen: keep the file handle open and read from disk
incrementally, a few bytes at a time, as each `read_bytes`/`read_uint32`/
`read_float32` call needs them — never holding the whole file in memory
at once. That approach scales to files far larger than available memory,
which eager loading fundamentally cannot. The honest cost of the choice
made here: this project's own `stock*.stl` files (referenced in the
original script's `__main__` block) are small enough that loading them
whole is a complete non-issue; a genuinely enormous STL file (which do
exist, especially from high-resolution 3D scans) would force a real
memory problem eager loading has no answer for — the same category of
scale-dependent debt Lesson 6's SE Lens flagged for `Mesh.bounds()`'s
list-building approach.

### Commands Needed

None yet — the next Concept Unit's `Run It` is the first one in this
lesson to run real code end-to-end.

### Run It

```bash
python3 -c "
import struct
with open('/tmp/lesson07_test.bin', 'wb') as f:
    f.write(struct.pack('<I', 42))
    f.write(struct.pack('<f', 3.5))
    f.write(b'tail')
"
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.binary_reader import BinaryReader

r = BinaryReader('/tmp/lesson07_test.bin')
print(r.data)
print(len(r.data))
"
```

Real output:

```
b'*\x00\x00\x00\x00\x00\x60@tail'
12
```

(This lesson wrote its own tiny 12-byte synthetic test file first, using
`struct` to pack a real integer and a real float — a preview of the
next Concept Unit — specifically so `BinaryReader` would have real,
known bytes to read; Lesson 8 replaces this synthetic file with an
actual `.stl` file.) `len(r.data)` correctly reports `12` — 4 bytes for
the packed integer, 4 for the packed float, 4 more for the literal text
`tail` appended after them — proof the entire file, not just part of
it, made it into `self.data`.

### Connect

`BinaryReader` can now hold a whole file's raw bytes, but has no way
yet to read a *specific piece* of it — every method built so far reads
the entire file at once, in one lump. The next Concept Unit adds the
ability to read a fixed number of bytes at a time, tracking where the
last read left off.

---

## Concept Unit: A Class That Remembers Where It Left Off

### The Problem

A binary STL file (Lesson 8) has real internal structure — an 80-byte
header, then a 4-byte count, then many fixed-size per-triangle records —
but `self.data` right now is just one undifferentiated blob of bytes.
Reading "the next 4 bytes" requires knowing *where* the previous read
stopped; nothing built so far tracks that. Slicing `self.data` by hand
every time (`self.data[80:84]`, then separately `self.data[84:88]`, and
so on) would work for a moment, but only if the calling code recomputed
every offset itself, by hand, for every single field in the file — exactly
the kind of repeated, error-prone bookkeeping a class's own internal
state exists to hide.

> **Before reading on, try this yourself:** if `self.data` is one long
> `bytes` object, Python's ordinary slicing syntax
> (`data[start:start+n]`) already lets you pull out any `n`-byte chunk
> you want, given a starting position. What single new instance
> attribute would a `BinaryReader` need — set once in `__init__`,
> updated every time a chunk is read — so that reading "the next `n`
> bytes" never requires the *caller* to know or compute a byte offset
> by hand?

### Introduce the Concept in Isolation

```python
# Throwaway lab: a class that remembers where it left off reading
class Cursor:
    def __init__(self, data):
        self.data = data
        self.offset = 0

    def read_bytes(self, n):
        chunk = self.data[self.offset:self.offset + n]
        self.offset += n
        return chunk

c = Cursor(b"\x02\x00\x00\x00hello")
first = c.read_bytes(4)
print(first, c.offset)
second = c.read_bytes(5)
print(second, c.offset)
```

Real output from running this:

```
b'\x02\x00\x00\x00' 4
b'hello' 9
```

The first `read_bytes(4)` call returns the first four bytes, exactly as
expected, and `c.offset` — printed right alongside it — has already
moved from `0` to `4`, entirely on its own, as a side effect of that one
call. The second call, `read_bytes(5)`, needed no starting position
supplied by the caller at all — it correctly picked up exactly where the
first call stopped, returning `hello` (the remaining five bytes), and
`c.offset` advanced again, to `9`, matching the object's total length.
This is **mutable instance state**: unlike every attribute built in
Phase A (`Vector3.x`, `Triangle.v0`, `Mesh.triangles` — all set once by
`__init__` and never changed again), `c.offset` is deliberately designed
to change, repeatedly, over the object's lifetime, as reading proceeds.

### Discard the Throwaway Example

This `Cursor` class is discarded now. `BinaryReader` gets the real
`offset` tracking and `read_bytes` next.

### Project Change

- **Reference Source:** no single line in `diff3d.py` — `pyvista.read`
  performs this exact kind of positional, sequential byte reading
  internally, entirely hidden from the script. This is a from-scratch
  addition, needed by every one of Lesson 8's STL-specific reads.
- **Files affected:** modify `src/vector3d/binary_reader.py`.
- **Change type:** add (a new attribute in `__init__`, plus a new
  method).
- **Location:** `self.offset = 0` goes inside `__init__`, directly after
  `self.data = f.read()`; the new `read_bytes` method goes inside the
  class, directly after `__init__`.
- **Dependencies:** `self.data`, set by `__init__` earlier in this
  lesson.

### The New Code

Add this line inside `__init__`, after `self.data = f.read()`:

```python
        self.offset = 0
```

Then add this method, after `__init__`:

```python
    def read_bytes(self, n):
        chunk = self.data[self.offset:self.offset + n]
        self.offset += n
        return chunk
```

### The Updated Project

`src/vector3d/binary_reader.py` so far, new lines marked:

```
 1  class BinaryReader:
 2      def __init__(self, path):
 3          with open(path, "rb") as f:
 4              self.data = f.read()
 5          self.offset = 0                                              # ← new
 6
 7      def read_bytes(self, n):                                         # ← new
 8          chunk = self.data[self.offset:self.offset + n]                # ← new
 9          self.offset += n                                             # ← new
10          return chunk                                                 # ← new
```

As a whole, `BinaryReader` can now read through a file's bytes
sequentially, a fixed number at a time, with no caller ever needing to
compute or remember a byte offset by hand — line 9 is doing that
bookkeeping automatically, as a side effect of every `read_bytes` call.

### Mechanical Walkthrough

- **`self.offset = 0`** — the same attribute-assignment syntax already
  used throughout this project, initializing a new instance attribute
  to `0` — the starting read position, before anything has been read
  yet.
- **`def read_bytes(self, n):`** — `def`; `read_bytes`, an ordinary
  instance method name; `self`, and a parameter `n` — how many bytes
  this particular call should read.
- **`chunk = self.data[self.offset:self.offset + n]`** — a local
  variable assignment; `self.data[...]` uses Python's slicing syntax
  (already familiar from ordinary Python sequences) on the `bytes`
  object stored by `__init__`; `self.offset:self.offset + n` is the
  slice's start and end positions — starting exactly where the cursor
  currently sits, ending `n` bytes later — producing a new, smaller
  `bytes` object containing just that range.
- **`self.offset += n`** — the augmented-assignment operator `+=`
  (shorthand for `self.offset = self.offset + n`), advancing the
  cursor by exactly the number of bytes just read, so the *next* call
  to `read_bytes` (or, starting in the next Concept Unit, `read_uint32`/
  `read_float32`) picks up from the new position automatically. This is
  the one line in this entire class actually responsible for the
  mutable state (this lesson's term) that makes sequential reading
  possible at all.
- **`return chunk`** — `return`, handing back the `bytes` object sliced
  out above.

### CS Lens

This is the **cursor pattern** (sometimes called an iterator or read
pointer) — an object that tracks "where am I in this sequence" as
internal state, letting a caller repeatedly ask for "the next piece"
without ever having to track a position itself.

Also recognized in: a database cursor, fetching result rows one at a
time from a query, remembering internally which row comes next; a
network socket's read buffer, tracking how much of an incoming stream
has been consumed so far; a text editor's own cursor position,
advancing as characters are typed or deleted; Python's own file objects
(the `f` from `with open(...) as f:`, earlier in this lesson) — `f.read(n)`
called repeatedly on the *same* file object already advances an internal
position automatically, which is exactly the behavior `BinaryReader`
is reimplementing by hand here, on an in-memory `bytes` object instead
of a live file handle.

### SE Lens

The principle here is **encapsulating mutable state behind a stable
interface** — every caller of `read_bytes` just asks for "the next `n`
bytes"; none of them ever touch `self.offset` directly, and none of them
need to know it exists at all.

The alternative not chosen: require every call site to track and pass
its own explicit offset (`reader.read_bytes(80, 4)` — start position and
count both supplied by the caller), rather than letting the reader track
its own position internally. That alternative would work, and is
genuinely how some lower-level APIs (including Python's own `struct.unpack_from`)
are designed. The real cost: every single call site parsing an STL file
in Lesson 8 would need to independently compute the correct running
offset by hand — 80, then 84, then 96, and so on — with a real risk of
an off-by-one or miscounted field silently producing garbage data at
every point downstream, a class of bug this lesson's internal-cursor
design eliminates by construction: as long as each individual read
method consumes exactly the right number of bytes, the *next* read is
automatically positioned correctly, with no arithmetic for the caller to
get wrong.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.binary_reader import BinaryReader

r = BinaryReader('/tmp/lesson07_test.bin')
first = r.read_bytes(4)
print(first, r.offset)
second = r.read_bytes(4)
print(second, r.offset)
"
```

Real output:

```
b'*\x00\x00\x00' 4
b'\x00\x00`@' 8
```

The first four bytes (`*\x00\x00\x00` — `*` happens to be the printable
ASCII character for byte value `42`, the integer this lesson's synthetic
file starts with) come back, and `r.offset` correctly advances to `4`;
the second call returns the next four bytes and advances to `8`, with
no offset ever supplied by the caller.

### Connect

`BinaryReader` can now read raw byte chunks sequentially, but every
result so far is still just raw `bytes` — `b'*\x00\x00\x00'` printed
above is not "the number 42" as far as Python is concerned, even though
that's exactly what those four bytes represent. The last Concept Unit in
this lesson adds the missing piece: turning raw bytes into actual usable
numbers.

---

## Concept Unit: Turning Bytes Into Numbers — `struct`

### The Problem

`b'*\x00\x00\x00'`, read in the previous Concept Unit, really does
represent the integer `42` — but nothing in Python treats it that way
automatically. `bytes` objects don't have a built-in ".as a number"
conversion, because the *same* four bytes could validly mean several
different things depending on how they're meant to be interpreted (an
unsigned integer, a signed integer, a float, two separate 16-bit values)
— there's no way for Python to guess which one is intended without being
told.

> **Before reading on, try this yourself:** if raw bytes are ambiguous
> on their own — the same four bytes could be "an integer" or "a float"
> — what information would a conversion function need, beyond the bytes
> themselves, to know which interpretation to apply? (Think about what
> this lesson's own Terms section already named: byte order, signed vs.
> unsigned, integer vs. floating-point — all real, independent choices
> that raw bytes alone can't communicate.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: turning raw bytes into an actual number
import struct

raw = b"\x02\x00\x00\x00"
value = struct.unpack("<I", raw)[0]
print(value)

packed = struct.pack("<f", 3.5)
print(packed)
back = struct.unpack("<f", packed)[0]
print(back)
```

Real output from running this:

```
2
b'\x00\x00`@'
3.5
```

`struct.unpack("<I", raw)` takes the four raw bytes `\x02\x00\x00\x00`
and the **format string** `"<I"` (little-endian, unsigned 32-bit
integer — this lesson's own terms, applied for real) and returns a
*tuple* containing one value — `unpack` always returns a tuple, even
when only one value was requested, which is why `[0]` is needed to pull
the actual number, `2`, back out. The second half proves the conversion
really does work both directions: `struct.pack("<f", 3.5)` goes the
*other* way, taking the Python float `3.5` and producing the four raw
bytes that represent it (`b'\x00\x00\x60@'` — not human-readable, and
not meant to be); feeding those same bytes back through
`struct.unpack("<f", ...)` recovers exactly `3.5`, confirming the
round trip is lossless.

### Discard the Throwaway Example

This scratch `struct` code is discarded now. `BinaryReader` gets the
real `read_uint32` and `read_float32` methods next.

### Project Change

- **Reference Source:** no single line in `diff3d.py` — `numpy`/`pyvista`
  perform this exact byte-to-number conversion internally, using
  `numpy`'s own binary data-type system rather than the standard library
  `struct` module this project uses. This Concept Unit is where that
  invisible conversion becomes real, explicit code — and it's what the
  official binary STL format specification itself actually requires: a
  4-byte unsigned integer for the triangle count, and 4-byte floats for
  every coordinate, both read and confirmed directly against that spec
  before writing this unit.
- **Files affected:** modify `src/vector3d/binary_reader.py`.
- **Change type:** add.
- **Location:** inside `class BinaryReader:`, directly after
  `read_bytes` (earlier in this lesson). Also requires adding
  `import struct` at the top of the file.
- **Dependencies:** `BinaryReader.read_bytes` (earlier in this lesson)
  and the standard-library `struct` module.

### The New Code

At the top of the file, before `class BinaryReader:`:

```python
import struct
```

Then, inside `class BinaryReader:`, after `read_bytes`:

```python
    def read_uint32(self):
        chunk = self.read_bytes(4)
        return struct.unpack("<I", chunk)[0]

    def read_float32(self):
        chunk = self.read_bytes(4)
        return struct.unpack("<f", chunk)[0]
```

### The Updated Project

`src/vector3d/binary_reader.py` in full, new lines marked:

```
 1  import struct                                                        # ← new
 2
 3
 4  class BinaryReader:
 5      def __init__(self, path):
 6          with open(path, "rb") as f:
 7              self.data = f.read()
 8          self.offset = 0
 9
10      def read_bytes(self, n):
11          chunk = self.data[self.offset:self.offset + n]
12          self.offset += n
13          return chunk
14
15      def read_uint32(self):                                          # ← new
16          chunk = self.read_bytes(4)                                  # ← new
17          return struct.unpack("<I", chunk)[0]                        # ← new
18
19      def read_float32(self):                                        # ← new
20          chunk = self.read_bytes(4)                                  # ← new
21          return struct.unpack("<f", chunk)[0]                        # ← new
```

As a whole, `BinaryReader` is now a complete general-purpose binary file
reader: it holds a whole file's bytes, tracks its own read position, and
can pull out either raw byte chunks or real, correctly-interpreted
numbers — one call, no manual offset arithmetic, no manual `struct`
calls at the point of use. Every piece Lesson 8's STL-specific parsing
needs from a byte-reading toolkit already exists.

### Mechanical Walkthrough

- **`import struct`** — the same `import` statement from Lesson 4
  (`import math`), this time loading the standard-library `struct`
  module so `struct.pack`/`struct.unpack` become usable in this file.
- **`def read_uint32(self):`** — `def`; `read_uint32`, an ordinary
  instance method name, chosen to say exactly what it produces (an
  unsigned 32-bit integer) rather than a generic name like `read_number`;
  `self` only.
- **`chunk = self.read_bytes(4)`** — a local variable assignment;
  `self.read_bytes(4)` — calling this class's *own* `read_bytes` method
  (defined earlier in this lesson) with `4` as the byte count, the same
  method-calling-another-method-on-the-same-instance pattern
  `Vector3.length` used with `Vector3.dot` back in Lesson 4, now
  appearing in this completely different class; this single call both
  retrieves the next 4 bytes *and* correctly advances `self.offset` by 4
  as a side effect, since that's what `read_bytes` itself already does.
- **`return struct.unpack("<I", chunk)[0]`** — `return`, handing back a
  plain Python `int`; `struct.unpack("<I", chunk)` — the same function
  and format-string shape from this Concept Unit's own throwaway lab,
  applied here to `chunk` (the real bytes just read) instead of a
  hand-written literal; `[0]` — ordinary list/tuple indexing (already
  familiar), pulling the single value back out of the one-element tuple
  `struct.unpack` always returns.
- **`def read_float32(self):`** and the two lines below it — identical
  shape to `read_uint32` above, with two differences worth naming
  explicitly rather than waving through as "the same thing": the format
  string is `"<f"` (32-bit float) instead of `"<I"` (unsigned 32-bit
  integer) — a different, independently-chosen interpretation of the
  same four raw bytes — and the value `struct.unpack` hands back is a
  Python `float`, not an `int`, because that's what the `"f"` format
  code specifically produces.

### CS Lens

This is **deserialization** — converting a raw, low-level byte
representation back into a meaningful, typed value in a programming
language, the mirror image of *serialization* (`struct.pack`, used in
this Concept Unit's own lab and in Lesson 8's synthetic test file, to go
the other direction). Underneath it is **binary data layout**: the idea
that a value's type determines a fixed, specific arrangement of bytes
representing it, agreed upon in advance, rather than bytes carrying
their own type information the way many higher-level formats (like
JSON's text) do.

Also recognized in: network protocol parsing (reading a fixed-size
packet header the same way — few bytes here mean the packet type,
few bytes there mean its length); image file formats (PNG, JPEG, and
practically every binary image format store dimensions and color data
as fixed-size binary fields, exactly like STL's own vertex coordinates);
game save files and executable file formats (both routinely use this
exact fixed-layout binary structure); every database engine's own
on-disk row format, which stores column values as tightly-packed binary
fields for the same efficiency reasons STL does.

### SE Lens

The principle here is **narrow, specific interfaces over one generic
one** — `read_uint32()` and `read_float32()` are two separate, plainly-
named methods, each hard-coding its own format string, rather than one
general `read_number(format_string)` method that a caller would have to
supply `"<I"` or `"<f"` to every time it's used.

The alternative not chosen: a single generic method,
`read(self, format_string): chunk = self.read_bytes(struct.calcsize(format_string)); return struct.unpack(format_string, chunk)[0]`
— genuinely more flexible, and closer to how `struct` itself is
designed to be used directly. The tradeoff made here favors call-site
clarity in Lesson 8's STL parsing: `reader.read_uint32()` states plainly
what's being read and what type comes back, with no format-string
detail leaking out to every call site; `reader.read("<I")` would work
identically, but would require every caller to already know and
correctly type STL's specific byte-layout codes, rather than that
knowledge living in one place, inside `BinaryReader` itself. The honest
cost: `read_uint32`/`read_float32` only cover the two numeric formats
STL actually needs; a genuinely general-purpose binary reader — useful
for parsing other file formats beyond STL — would need either more
named methods like these (`read_uint16`, `read_int32`, ...) or the more
flexible generic method after all. This project only needs the two
methods built here, so that's all it has.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.binary_reader import BinaryReader

r = BinaryReader('/tmp/lesson07_test.bin')
count = r.read_uint32()
print(count, r.offset)
value = r.read_float32()
print(value, r.offset)
tail = r.read_bytes(4)
print(tail, r.offset)
"
```

Real output:

```
42 4
3.5 8
b'tail' 12
```

The synthetic test file this lesson wrote back in the first Concept
Unit packed exactly these three values, in exactly this order —
`struct.pack('<I', 42)`, then `struct.pack('<f', 3.5)`, then the literal
bytes `b'tail'` — and `BinaryReader`, reading them back with no offset
ever supplied by the caller, recovers all three correctly: the real
integer `42`, the real float `3.5`, and the raw trailing bytes, with
the cursor correctly landing at `12` — the file's exact total length —
after the last read.

### Connect

`BinaryReader` is now a complete, general-purpose binary file reader —
raw bytes, an internally-tracked cursor, and typed numeric reads, all
verified against a real synthetic file this lesson built by hand with
`struct.pack`. Lesson 8 replaces that synthetic file with a real binary
STL file, and uses exactly these three methods
(`read_bytes`/`read_uint32`/`read_float32`) to walk through its actual
80-byte header, triangle count, and per-triangle vertex/normal records —
turning what this lesson reads back as plain numbers into real
`Vector3` and `Triangle` objects (Phase A) for the first time.

---

## Connect the Pieces

One synthetic file, traced through every method this lesson built:
`BinaryReader('/tmp/lesson07_test.bin')` opens the file in binary mode
(this lesson's first Concept Unit) and reads all 12 bytes into
`self.data`, with `self.offset` starting at `0`. `r.read_uint32()`
(third Concept Unit) calls `self.read_bytes(4)` (second Concept Unit)
internally — which slices bytes `0` through `4` out of `self.data` and
advances `self.offset` to `4` — then hands those four bytes to
`struct.unpack("<I", ...)`, recovering the real integer `42`. Calling
`r.read_float32()` immediately after needs no offset supplied by
anyone: it calls `self.read_bytes(4)` again, which — because
`self.offset` is already sitting at `4` from the previous read —
correctly slices bytes `4` through `8` this time, advancing to `8`, and
`struct.unpack("<f", ...)` recovers the real float `3.5`. Three
concepts from three separate Concept Units — binary-mode file reading,
an internally-tracked cursor, and `struct`-based numeric interpretation
— composed into two method calls that correctly read two completely
different-typed values, back to back, from the same growing position in
one file, with zero offset arithmetic performed by the calling code at
all.

---

## Try It Yourself

Type `BinaryReader` into `src/vector3d/binary_reader.py` yourself (not
copy-pasted, remembering `import struct` at the top), recreate this
lesson's synthetic test file with the `struct.pack` commands shown in
this lesson's first `Run It`, and confirm all three `Run It` outputs
above. Then, once that works, try reading one byte too many past the
end of the file, and look closely at what actually happens — no
exception, which is worth thinking about given exactly how
`read_bytes`'s slicing is written:

```python
r2 = BinaryReader("/tmp/lesson07_test.bin")
r2.offset = 10
extra = r2.read_bytes(10)
print(extra, r2.offset)
```
