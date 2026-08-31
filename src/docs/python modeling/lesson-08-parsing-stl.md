# Lesson 8: Parsing Binary STL — `STLReader`

**What you will build:** a new class, `STLReader`, in a new file
`src/vector3d/stl_reader.py` — the class where this whole rebuild's two
separate branches finally connect: Lesson 7's `BinaryReader` (raw bytes,
a cursor, `struct`-based numeric reads) and Phase A's
`Vector3`/`Triangle`/`Mesh` (the geometry this project actually cares
about). By the end of this lesson, `STLReader("some_file.stl").read_mesh()`
replaces `pyvista.read(path)` completely — a real binary STL file in,
a real `Mesh` of real `Triangle`s out, no `pyvista` involved anywhere.
This is Phase B's last lesson.

**What you need to know first:** Phase A in full (Lessons 1-6 —
`Vector3`, `Triangle`, `Mesh`, composition) and Lesson 7 in full
(`BinaryReader` — binary mode, the cursor pattern, `struct`-based
numeric reads, mutable instance state).

**Terms used in this lesson:**
- **binary STL format** — the specific, fixed binary layout this lesson
  parses: an 80-byte header (arbitrary content, conventionally a text
  comment, never meaningfully parsed by STL-reading software), then a
  4-byte unsigned 32-bit integer giving the triangle count, then that
  many fixed-size 50-byte records — one per triangle — each holding a
  3-float normal vector, three 3-float vertex positions, and a 2-byte
  "attribute byte count" field (almost always `0` in practice, and
  unused by this project). This is a real, publicly documented file
  format specification — not something invented for this curriculum —
  and it's the exact layout `pyvista.read(path)` parses internally,
  invisibly, in the original script.
- **attribute byte count** — a 2-byte field at the end of every STL
  triangle record, historically intended to let some STL-writing tools
  attach extra per-triangle data (like color). In practice it is almost
  universally `0`, and this project reads it only to correctly advance
  past it — it's never used for anything beyond that.
- **`range(n)`** — Python's built-in way to produce `n` numbers in
  sequence (`0, 1, 2, ..., n-1`), already familiar from ordinary Python
  looping; used here for the first time in this project specifically to
  repeat a read operation an exact, dynamically-known number of times —
  the triangle count itself, read from the file, not decided in advance
  by the code.
- **`_` (throwaway loop variable)** — the conventional Python name for a
  loop variable whose actual value is never used, only the fact that the
  loop body runs once per iteration. Not special syntax — `_` is an
  ordinary, legal variable name — just a widely recognized convention
  signaling "this loop needs to repeat N times; what number we're on
  doesn't matter here."

**Objects and methods used:**

- **`STLReader`**
  - *What it is:* a class that turns a real binary STL file into a real
    `Mesh` of `Triangle` objects — the top-level class this whole
    rebuild's file-loading step needs.
  - *Implementation:* `class STLReader:` with `__init__(self, path)`
    composing a `BinaryReader` (Lesson 7) as `self.reader`, plus
    `read_triangle_count`, `read_triangle`, and `read_mesh` built across
    this lesson's three Concept Units.
  - *Its use:* replaces `pyvista.read(path)` in `diff3d.py`'s
    `run_diff()` entirely — `STLReader(path).read_mesh()` is the direct,
    from-scratch equivalent.
  - *Type:* a plain class, no parent class, composed of a `BinaryReader`
    (a stateful, mutable object — Lesson 7) rather than plain values,
    the first time this project has composed a *stateful* object inside
    another class, as opposed to Phase A's composition of immutable
    `Vector3`/`Triangle` values.
  - *Responsibility:* to understand the specific byte layout of the
    binary STL format, and to translate it into this project's own
    geometry types — `BinaryReader` doesn't know anything about STL
    specifically; `STLReader` is where that format-specific knowledge
    lives.
  - *Depends on:* a real file path on disk, in valid binary STL format;
    `BinaryReader` (Lesson 7) to do the actual byte-level reading; and
    `Vector3`, `Triangle`, `Mesh` (Phase A) to build its final result.
  - *Connects to:* constructs one `BinaryReader` internally and calls
    its methods repeatedly; constructs many `Vector3` and `Triangle`
    instances, and one `Mesh`. Nothing calls `STLReader` yet within this
    project beyond this lesson's own verification; Lesson 19-20's
    `run_diff()` assembly will call it directly, exactly where the
    original script calls `pyvista.read(path)`.
  - *Shape:* the point where this project's two separate branches — the
    generic binary-reading branch (`BinaryReader`, Lesson 7) and the
    geometry branch (`Vector3`→`Triangle`→`Mesh`, Phase A) — merge into
    one. Everything built after this lesson sits on top of `Mesh`
    objects that can now come from real files, not just hand-typed
    constructor calls.

- **`STLReader.read_triangle_count`**
  - *What it is:* an instance method that skips the STL file's 80-byte
    header and reads the 4-byte triangle count immediately following it.
  - *Implementation:*
    `def read_triangle_count(self): self.reader.read_bytes(80); return self.reader.read_uint32()`
    — takes only `self`, returns a plain Python `int`.
  - *Its use:* every binary STL file states its own triangle count
    explicitly, right after the header — this is the first real piece of
    structured information `STLReader` extracts from a file.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to correctly position the reader past the header
    (which this project never needs the content of) and report exactly
    how many triangle records follow.
  - *Depends on:* `self.reader` (a `BinaryReader`, set by `__init__`)
    and its `read_bytes`/`read_uint32` methods (both Lesson 7).
  - *Connects to:* calls `self.reader.read_bytes(80)` and
    `self.reader.read_uint32()`; called by `read_mesh` (built later in
    this lesson) to know how many times to loop.
  - *Shape:* `STLReader`'s own layer — the first method to apply real,
    STL-specific format knowledge on top of `BinaryReader`'s generic
    byte-reading.

- **`STLReader.read_triangle`**
  - *What it is:* an instance method reading one complete 50-byte STL
    triangle record and returning it as a real `Triangle` object.
  - *Implementation:*
    ```
    def read_triangle(self):
        self.reader.read_float32()
        self.reader.read_float32()
        self.reader.read_float32()

        v0 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())
        v1 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())
        v2 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())

        self.reader.read_uint16()

        return Triangle(v0, v1, v2)
    ```
    — takes only `self`, returns a real `Triangle`.
  - *Its use:* this is the method that actually turns raw file bytes
    into this project's own geometry types — the direct, from-scratch
    equivalent of whatever internal step `pyvista.read` performs to
    populate a mesh's `points`/`faces` arrays from the same 50-byte
    records.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to consume exactly 50 bytes — no more, no less —
    from the current reader position, and to return a `Triangle` built
    from the three vertex positions those bytes encode, discarding the
    file's own stored normal (this project computes its own via
    `Triangle.normal()`, built in Lesson 5) and the unused attribute
    byte count.
  - *Depends on:* `self.reader` and its `read_float32`/`read_uint16`
    methods (`read_float32` from Lesson 7; `read_uint16` added earlier
    in this lesson), and `Vector3.__init__`/`Triangle.__init__` (Lessons
    1 and 5) to build its result.
  - *Connects to:* calls `self.reader.read_float32()` nine times (three
    for the discarded normal, three per vertex for three vertices) and
    `self.reader.read_uint16()` once; calls `Vector3(...)` three times
    and `Triangle(...)` once. Called repeatedly by `read_mesh`, built
    next.
  - *Shape:* `STLReader`'s own layer — the method where bytes actually
    become geometry for the first time in this project.

- **`STLReader.read_mesh`**
  - *What it is:* an instance method reading an entire binary STL file
    and returning it as a real `Mesh`.
  - *Implementation:*
    ```
    def read_mesh(self):
        count = self.read_triangle_count()
        triangles = []
        for _ in range(count):
            triangles.append(self.read_triangle())
        return Mesh(triangles)
    ```
    — takes only `self`, returns a real `Mesh`.
  - *Its use:* the direct, complete, from-scratch replacement for
    `pyvista.read(path)` in `diff3d.py`'s `run_diff()`.
  - *Type:* an ordinary instance method — the "public entry point" of
    `STLReader`, the one method later lessons will actually call.
  - *Responsibility:* to read a triangle count, then read exactly that
    many triangle records in sequence, collecting them into a `Mesh`.
  - *Depends on:* `self.read_triangle_count` and `self.read_triangle`
    (both this lesson), and `Mesh.__init__` (Lesson 6).
  - *Connects to:* calls `self.read_triangle_count()` once and
    `self.read_triangle()` exactly `count` times; calls `Mesh(...)`
    once, at the end. Nothing within this project calls `read_mesh` yet
    beyond this lesson's own verification; Lesson 19-20 will.
  - *Shape:* `STLReader`'s own top-level method — the one place all
    three of this lesson's Concept Units, and this project's two
    separate architectural branches (`BinaryReader` and
    `Vector3`/`Triangle`/`Mesh`), come together into a single call.

---

## Concept Unit: Composing a Stateful Reader — the Header and Triangle Count

### The Problem

`diff3d.py`'s `pyvista.read(path1)` hides everything about the STL
format's actual byte layout — this project has to make that layout
explicit. The binary STL format (this lesson's own term) starts with 80
bytes this project doesn't need the content of, followed immediately by
a 4-byte count of how many triangle records follow. `BinaryReader`
(Lesson 7) already knows how to skip bytes and read a `uint32` — but
nothing yet ties that generic ability to the specific STL layout.

> **Before reading on, try this yourself:** Lesson 5 and Lesson 6 both
> composed *value* objects — a `Triangle` holds `Vector3`s, a `Mesh`
> holds `Triangle`s, and none of them ever change after construction.
> `BinaryReader` (Lesson 7) is different: it holds *mutable* state (its
> own read cursor) that changes every time one of its methods is
> called. If a new class, `STLReader`, stored a `BinaryReader` instance
> as one of its own attributes — the same composition pattern from
> Lessons 5-6 — what would be different about using it, compared to
> `Triangle` holding a `Vector3`? (Think about what happens to
> `self.reader`'s internal cursor position every time `STLReader` calls
> one of its methods, versus what happens to `self.v0` every time
> `Triangle` calls one of *its* methods.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: a class that composes a stateful reader inside itself
class LineCounter:
    def __init__(self, path):
        with open(path, "rb") as f:
            self.raw = f.read()
        self.offset = 0

    def read_bytes(self, n):
        chunk = self.raw[self.offset:self.offset + n]
        self.offset += n
        return chunk

class HeaderSkipper:
    def __init__(self, path):
        self.reader = LineCounter(path)

    def skip_and_count(self, header_size):
        self.reader.read_bytes(header_size)
        return len(self.reader.raw) - self.reader.offset

with open("/tmp/lab_header.bin", "wb") as f:
    f.write(b"HEADER1234" + b"REST")

h = HeaderSkipper("/tmp/lab_header.bin")
remaining = h.skip_and_count(10)
print(remaining)
print(h.reader.offset)
```

Real output from running this:

```
4
10
```

`HeaderSkipper` composes a `LineCounter` (this lab's stand-in for
`BinaryReader`) the same way `Triangle` composes `Vector3` — one
object holding another as an attribute. But the consequence is
different: `h.reader.offset` — reached through `HeaderSkipper` into its
composed `LineCounter` — really did change, from `0` to `10`, purely as
a side effect of calling `skip_and_count`. This confirms the Socratic
prompt's framing: composing a *stateful* object means the composing
class's own behavior depends on, and changes, that inner object's
state every time it's used — unlike `Triangle.v0`, which a `Triangle`
method can read but never causes to change.

### Discard the Throwaway Example

This `LineCounter`/`HeaderSkipper` pair is discarded now. `STLReader`
gets the real composition of `BinaryReader` next.

### Project Change

- **Reference Source:** this Concept Unit's layout knowledge comes from
  the binary STL file format specification itself (this lesson's own
  term) — a real, well-established, publicly documented format, not
  something specific to `diff3d.py`. This environment has no network
  access this session, so the specification's exact byte layout is
  stated here from established, well-known documentation of the format
  rather than freshly fetched — worth being explicit about, rather than
  claiming a live fetch that didn't happen: 80-byte header, then a
  4-byte little-endian unsigned 32-bit triangle count. Separately,
  `diff3d.py`'s own `run_diff()` — `m1 = pyvista.read(path1)` — is the
  line this entire lesson's `STLReader` class exists to replace.
- **Files affected:** create `src/vector3d/stl_reader.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `BinaryReader` (Lesson 7), imported from
  `vector3d.binary_reader`.

### The New Code

Type this into `src/vector3d/stl_reader.py`:

```python
from vector3d.binary_reader import BinaryReader


class STLReader:
    def __init__(self, path):
        self.reader = BinaryReader(path)

    def read_triangle_count(self):
        self.reader.read_bytes(80)
        return self.reader.read_uint32()
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption used throughout this curriculum):

```
1  from vector3d.binary_reader import BinaryReader
2
3
4  class STLReader:
5      def __init__(self, path):
6          self.reader = BinaryReader(path)
7
8      def read_triangle_count(self):
9          self.reader.read_bytes(80)
10         return self.reader.read_uint32()
```

As a whole, this file now defines a buildable `STLReader(path)` that
opens a real file (through the `BinaryReader` it composes) and can
report how many triangles it contains, having correctly skipped past
the header first.

### Mechanical Walkthrough

- **`from vector3d.binary_reader import BinaryReader`** — the same
  import-a-class-from-another-file-in-this-project syntax Lesson 5 and
  Lesson 6 both used (`from vector3d.vector import Vector3`), here
  pulling in `BinaryReader` (Lesson 7) instead.
- **`class STLReader:`** — the same `class` keyword from Lesson 1,
  defining a new blueprint.
- **`def __init__(self, path):`** — `def`, `__init__`, `self`, and one
  parameter, `path` — the same shape `BinaryReader.__init__` itself
  uses (Lesson 7), since `STLReader` needs the same starting
  information (a file path) to do its own job.
- **`self.reader = BinaryReader(path)`** — `BinaryReader(path)` calls
  `BinaryReader.__init__` (Lesson 7) right now, immediately opening the
  file and reading its entire contents into that new `BinaryReader`
  instance's own `self.data`; `self.reader = ...` stores the resulting
  object as an instance attribute on `STLReader` — the same
  attribute-assignment syntax used throughout this project, but storing
  a whole *stateful* object this time (this lesson's own point), not a
  plain number or an immutable `Vector3`.
- **`def read_triangle_count(self):`** — `def`; `read_triangle_count`,
  an ordinary instance method name; `self` only.
- **`self.reader.read_bytes(80)`** — nested method access (structurally
  the same shape as `Mesh.bounds()`'s `triangle.v0` nested attribute
  access in Lesson 6, except reaching a *method* through the composed
  object rather than a plain attribute): calling `read_bytes` (Lesson 7)
  on the `BinaryReader` stored at `self.reader`, requesting 80 bytes —
  the STL header's exact size — and discarding the return value
  entirely, since this project never needs the header's content, only
  needs the reader correctly positioned past it.
- **`return self.reader.read_uint32()`** — `return`, handing back
  whatever `self.reader.read_uint32()` (Lesson 7) returns — a real
  Python `int`, read from exactly the 4 bytes immediately following the
  now-skipped header.

### CS Lens

This is still **composition** (Lesson 5), now specifically composing an
object with **mutable instance state** (Lesson 7) rather than an
immutable value type — a distinction worth naming because it changes
what "using" the composed object actually means: every call through
`self.reader` can leave that inner object in a different state than it
found it, which was never true of `Triangle`'s `Vector3` attributes or
`Mesh`'s `Triangle` list.

Also recognized in: a `HttpClient` class composing a `ConnectionPool`
(itself full of mutable, changing connection state); a game's `Player`
class composing an `Inventory` object that changes as items are picked
up or used; a parser class (in the general sense — not just this
project's own STL parsing) composing a tokenizer or lexer object that
advances through source text the same way `BinaryReader` advances
through bytes.

### SE Lens

The principle here is **separation of concerns** — `BinaryReader`
(Lesson 7) knows nothing about STL specifically; it only knows how to
read bytes, integers, and floats from a generic binary stream.
`STLReader` knows the STL format's specific layout (80-byte header,
4-byte count, and so on) but delegates every actual byte-level read to
`BinaryReader` rather than reimplementing file-opening or cursor-tracking
itself.

The alternative not chosen: fold STL-specific parsing logic directly
into `BinaryReader` itself — adding STL-aware methods like
`skip_stl_header()` onto the same class Lesson 7 built as a
general-purpose tool. That would work, but it would compromise
`BinaryReader`'s own generality: it was deliberately built in Lesson 7
with no knowledge of any specific file format, meaning it could, in
principle, be reused to parse a completely different binary format
later without modification. Baking STL-specific knowledge into it would
tie a genuinely general-purpose tool to one particular use, for no real
benefit — the two-class split made here keeps `BinaryReader` reusable
and puts format-specific knowledge exactly where it belongs, in
`STLReader`.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import struct

def make_stl(triangles, path):
    with open(path, 'wb') as f:
        f.write(b'\x00' * 80)
        f.write(struct.pack('<I', len(triangles)))
        for (nx, ny, nz), verts in triangles:
            f.write(struct.pack('<fff', nx, ny, nz))
            for (x, y, z) in verts:
                f.write(struct.pack('<fff', x, y, z))
            f.write(struct.pack('<H', 0))

tris = [
    ((0.0, 0.0, 1.0), [(0.0, 0.0, 0.0), (2.0, 0.0, 0.0), (0.0, 2.0, 0.0)]),
    ((0.0, 0.0, 1.0), [(1.0, 1.0, 3.0), (3.0, 1.0, 3.0), (1.0, 3.0, 3.0)]),
]
make_stl(tris, '/tmp/lesson08_test.stl')
"
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.stl_reader import STLReader

s = STLReader('/tmp/lesson08_test.stl')
count = s.read_triangle_count()
print(count)
print(s.reader.offset)
"
```

Real output:

```
2
84
```

(This lesson wrote its own real, valid binary STL file first, using
`struct` directly, containing exactly two triangles — the exact same
two triangles used throughout Lesson 6's own `Run It` sections — so
`STLReader` would have a genuine STL file to parse. Lessons 9 onward
can reuse this same file.) `count` correctly reports `2`, and
`s.reader.offset` — reached through the composed `BinaryReader` — sits
at `84`: `80` header bytes plus `4` count bytes, exactly where the first
triangle record should begin.

### Connect

`STLReader` can now correctly position itself past the header and
report how many triangles the file contains, but can't read an actual
triangle yet. The next Concept Unit reads one complete 50-byte record
and turns it into a real `Triangle`.

---

## Concept Unit: One Triangle's Raw Record — From Bytes to `Triangle`

### The Problem

Right after the header and count, a binary STL file contains, back to
back with no separators, one 50-byte record per triangle: a 3-float
normal vector (12 bytes), three 3-float vertex positions (36 bytes),
and a 2-byte attribute byte count (this lesson's own term) — 50 bytes
total. `BinaryReader.read_float32`/`read_uint16` (Lesson 7, plus one new
method this Concept Unit adds) can read each individual number; nothing
yet assembles a whole record's worth of them into an actual `Triangle`.

> **Before reading on, try this yourself:** a triangle record's 50 bytes
> break down as: 3 floats (the stored normal — 12 bytes), then 3×3
> floats (three vertices — 36 bytes), then one 2-byte field (the
> attribute byte count). Lesson 5's `Triangle.normal()` already computes
> a normal itself, from the vertices, via `cross()` and `normalize()` —
> so does this method actually need to *keep* the stored normal it
> reads from the file, or could it read those first three floats purely
> to advance the reader past them, discarding the values entirely? What
> would the code look like either way?

### Introduce the Concept in Isolation

The new piece this Concept Unit needs on `BinaryReader` — reading a
2-byte unsigned integer for the attribute byte count — is the same
mechanism Lesson 7 already taught in full for `read_uint32`/`read_float32`
(read a fixed number of bytes via `read_bytes`, then interpret them with
`struct.unpack` and a format code), just a different `struct` format
code (`"<H"` for a 2-byte unsigned integer, instead of `"<I"` for
4-byte). Because that's the identical idea Lesson 7 already taught, not
a new one, this addition doesn't get its own separate throwaway lab —
it's added directly to the real project code below, following the exact
pattern `read_uint32`/`read_float32` already established.

The real new idea this Concept Unit introduces is assembling several
already-read values into one composed object — which Lesson 5 already
demonstrated directly (`Triangle(v0, v1, v2)`, three already-built
`Vector3`s passed straight to a constructor) — so this Concept Unit,
unlike every other one in this curriculum so far, has no throwaway lab
of its own: both of its pieces (a new `struct` format code, and
constructing a `Triangle` from already-read values) are the exact same
ideas Lessons 5 and 7 already isolated and proved. What's new here is
only the *combination* — one method, reading nine floats and one
integer in a specific fixed order, straight into real project code.

### Discard the Throwaway Example

Not applicable to this Concept Unit — no throwaway example was
introduced, for the reasons stated above.

### Project Change

- **Reference Source:** the binary STL format specification (this
  lesson's own term, same honesty note as the previous Concept Unit —
  stated from established documentation, not fetched live this
  session): each 50-byte triangle record is 12 bytes (3 floats) for a
  stored normal vector, then 3×12 bytes (3×3 floats) for the triangle's
  three vertices in order, then 2 bytes for the attribute byte count.
- **Files affected:** modify `src/vector3d/binary_reader.py` (one new
  method) and `src/vector3d/stl_reader.py` (one new method, plus two new
  imports).
- **Change type:** add.
- **Location:** `read_uint16` goes inside `class BinaryReader:`,
  directly after `read_float32` (Lesson 7). `read_triangle` goes inside
  `class STLReader:`, directly after `read_triangle_count` (earlier in
  this lesson); `Vector3` and `Triangle` need importing at the top of
  `stl_reader.py`.
- **Dependencies:** `BinaryReader.read_bytes` (Lesson 7, for the new
  `read_uint16`); `BinaryReader.read_float32`/`read_uint16` (for the new
  `STLReader.read_triangle`); `Vector3.__init__` (Lesson 1) and
  `Triangle.__init__` (Lesson 5).

### The New Code

In `src/vector3d/binary_reader.py`, inside `class BinaryReader:`, after
`read_float32`:

```python
    def read_uint16(self):
        chunk = self.read_bytes(2)
        return struct.unpack("<H", chunk)[0]
```

In `src/vector3d/stl_reader.py`, add two imports at the top:

```python
from vector3d.vector import Vector3
from vector3d.triangle import Triangle
```

Then, inside `class STLReader:`, after `read_triangle_count`:

```python
    def read_triangle(self):
        self.reader.read_float32()
        self.reader.read_float32()
        self.reader.read_float32()

        v0 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())
        v1 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())
        v2 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())

        self.reader.read_uint16()

        return Triangle(v0, v1, v2)
```

### The Updated Project

`src/vector3d/binary_reader.py` in full, new lines marked:

```
 1  import struct
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
15      def read_uint32(self):
16          chunk = self.read_bytes(4)
17          return struct.unpack("<I", chunk)[0]
18
19      def read_float32(self):
20          chunk = self.read_bytes(4)
21          return struct.unpack("<f", chunk)[0]
22
23      def read_uint16(self):                                          # ← new
24          chunk = self.read_bytes(2)                                  # ← new
25          return struct.unpack("<H", chunk)[0]                        # ← new
```

`src/vector3d/stl_reader.py` so far, new lines marked:

```
 1  from vector3d.binary_reader import BinaryReader
 2  from vector3d.vector import Vector3                                  # ← new
 3  from vector3d.triangle import Triangle                               # ← new
 4
 5
 6  class STLReader:
 7      def __init__(self, path):
 8          self.reader = BinaryReader(path)
 9
10      def read_triangle_count(self):
11          self.reader.read_bytes(80)
12          return self.reader.read_uint32()
13
14      def read_triangle(self):                                        # ← new
15          self.reader.read_float32()                                  # ← new
16          self.reader.read_float32()                                  # ← new
17          self.reader.read_float32()                                  # ← new
18                                                                        # ← new
19          v0 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())  # ← new
20          v1 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())  # ← new
21          v2 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())  # ← new
22                                                                        # ← new
23          self.reader.read_uint16()                                   # ← new
24                                                                        # ← new
25          return Triangle(v0, v1, v2)                                 # ← new
```

As a whole, `STLReader` can now read one complete triangle record from
real file bytes and hand back a real `Triangle` — the first point in
this entire curriculum where raw bytes read from an actual file on disk
become a usable geometry object.

### Mechanical Walkthrough

- **`def read_uint16(self):`** through **`return struct.unpack("<H", chunk)[0]`**
  — structurally identical to `read_uint32` (Lesson 7): `self.read_bytes(2)`
  instead of `self.read_bytes(2)` — reading `2` bytes instead of `4`,
  since a `uint16` is half the size of a `uint32`; `struct.unpack("<H", chunk)`
  — the format code `H` (rather than `I`) telling `struct` to interpret
  those 2 bytes as an unsigned 16-bit integer, still little-endian
  (`<`); `[0]`, pulling the single value out of the one-element tuple
  `unpack` always returns, exactly as `read_uint32`/`read_float32`
  already did in Lesson 7.
- **`def read_triangle(self):`** — `def`; `read_triangle`, an ordinary
  instance method name; `self` only.
- **`self.reader.read_float32()`** (first three, standalone) — nested
  method access through `self.reader` (this lesson's own composed
  `BinaryReader`), calling `read_float32` (Lesson 7) three times in a
  row with no assignment at all — each call still advances
  `self.reader.offset` by 4 bytes as a side effect (Lesson 7's cursor
  behavior), but the actual returned float is discarded every time,
  directly answering this Concept Unit's own Socratic prompt: the
  file's stored normal is read only to advance past it, never kept,
  because `Triangle.normal()` (Lesson 5) will compute this project's own
  normal later, from the vertices themselves.
- **`v0 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())`**
  (and identically for `v1`, `v2`) — `Vector3(...)` calling
  `Vector3.__init__` (Lesson 1) with three fresh `read_float32()` calls
  as its arguments, evaluated left to right — `x` is read first,
  advancing the cursor by 4 bytes, then `y` is read from the new
  position, then `z` — so the three arguments to `Vector3()` are not
  independent; each one depends on every read that happened before it,
  in the same object, in the same expression.
- **`self.reader.read_uint16()`** — calling the method built earlier in
  this same Concept Unit, once, with its return value discarded — the
  attribute byte count (this lesson's own term), read purely to advance
  the cursor past it, exactly like the discarded normal-vector floats
  above.
- **`return Triangle(v0, v1, v2)`** — `return`, handing back a real
  `Triangle`; `Triangle(v0, v1, v2)` calling `Triangle.__init__`
  (Lesson 5) with the three freshly-built `Vector3` instances, in the
  exact order they were read from the file — preserving the file's own
  vertex winding order, the specific requirement Lesson 5's SE Lens
  flagged as a real dependency this parser would need to honor.

### CS Lens

This is **parsing**, specifically the general pattern of reading a
fixed-layout binary record and reconstructing a meaningful, typed object
from it — the same underlying idea as Lesson 7's own **deserialization**
CS Lens, now applied at the level of a whole composite object
(`Triangle`) rather than a single number.

Also recognized in: any fixed-record binary file format (many older
database file formats, certain audio/video container formats) parsed by
reading each field in a known, fixed order and assembling a struct or
object from them; network protocol message parsing (an incoming packet's
fields read in the protocol's specified order, exactly like this
triangle record's normal-then-vertices-then-attribute-count sequence);
every other 3D file format's own triangle/face record (OBJ, PLY, glTF —
each has its own different byte or text layout, but each is parsed by
this same read-fields-in-order, build-object pattern).

### SE Lens

The principle is **discarding data deliberately, not accidentally** —
this method reads the stored normal and the attribute byte count fully
(consuming the correct number of bytes, keeping the reader correctly
positioned for what follows), and throws both away on purpose, because
this project has already decided, back in Lesson 5, that normals will
be computed from vertices rather than trusted from the file.

The alternative not chosen: keep the file's own stored normal (assign it
to a variable, pass it into `Triangle`'s constructor somehow, perhaps as
a fourth optional argument) rather than discarding it and relying on
`Triangle.normal()`'s own computation. Some real STL-consuming software
does exactly this — trusting the file's stored normal is faster (no
cross product needed) and, for a well-formed file, produces an identical
result. The cost of trusting it instead of computing it: a
malformed or non-conformant STL file (one where the stored normal
doesn't actually match the vertex winding order — a real, if
uncommon, situation in files from imperfect exporters) would silently
produce a wrong-but-plausible-looking normal if trusted directly, while
`Triangle.normal()`'s own computation is always self-consistent with
whatever vertices the file actually contains, regardless of whether the
file's *own* stored normal happens to agree.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.stl_reader import STLReader

s = STLReader('/tmp/lesson08_test.stl')
count = s.read_triangle_count()
print(count)

t0 = s.read_triangle()
print(t0.v0, t0.v1, t0.v2)
print(t0.normal())
print(s.reader.offset)
"
```

Real output:

```
2
Vector3(0.0, 0.0, 0.0) Vector3(2.0, 0.0, 0.0) Vector3(0.0, 2.0, 0.0)
Vector3(0.0, 0.0, 1.0)
134
```

The first triangle's three vertices come back exactly as this lesson's
own synthetic STL file encoded them, and `t0.normal()` (Lesson 5's own
method — `__sub__`, `cross`, `normalize`, none of it new here) correctly
computes `Vector3(0.0, 0.0, 1.0)` from those vertices alone — the file's
own stored normal was read and discarded, and the computed one still
comes out correct. `s.reader.offset` sits at `134`: `84` (header +
count, from the previous Concept Unit) plus this triangle's full `50`
bytes — proof every field, including the discarded ones, was correctly
consumed.

### Connect

`STLReader` can now read one triangle. A real file usually has more than
one — the last Concept Unit in this lesson reads every triangle the
file actually contains, however many that turns out to be, and
assembles them into a real `Mesh`.

---

## Concept Unit: The Whole File — `read_mesh()`

### The Problem

`diff3d.py`'s `pyvista.read(path1)` returns one complete mesh object in
a single call — not one triangle at a time. `read_triangle_count`
(this lesson's first Concept Unit) knows how many triangles a file
contains; `read_triangle` (the second) can read exactly one, advancing
the reader correctly each time. Nothing yet repeats that second method
the right number of times and assembles the results into a `Mesh`
(Lesson 6).

> **Before reading on, try this yourself:** `read_triangle_count()`
> returns a real number, known only once the file's own count bytes
> have been read — not a number decided in advance by this project's own
> code. Given that, and given `Mesh.__init__` (Lesson 6) accepting a
> plain Python list of `Triangle` objects, what loop shape would call
> `self.read_triangle()` exactly that many times, collecting each
> result into a list, ready to hand to `Mesh(...)` at the end?

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit either, for the same reason
as the previous one: every individual idea it combines was already
isolated and proven earlier in this curriculum — looping a known number
of times with `range()` and collecting results into a list is ordinary,
already-familiar Python, and passing an already-built list straight into
a constructor is exactly what Lesson 6's own `Mesh(triangles)` already
demonstrated directly. What's new here is only the specific combination:
looping exactly `count` times, where `count` itself was read from the
file rather than known in advance.

### Discard the Throwaway Example

Not applicable to this Concept Unit, for the reasons stated above.

### Project Change

- **Reference Source:** `diff3d.py`'s `run_diff()`:
  `m1 = pyvista.read(path1)` — this method is the complete, direct
  replacement for that one line.
- **Files affected:** modify `src/vector3d/stl_reader.py`.
- **Change type:** add.
- **Location:** inside `class STLReader:`, directly after `read_triangle`
  (earlier in this lesson). Also requires adding
  `from vector3d.mesh import Mesh` at the top of the file.
- **Dependencies:** `STLReader.read_triangle_count` and
  `STLReader.read_triangle` (both earlier in this lesson), and
  `Mesh.__init__` (Lesson 6).

### The New Code

Add this import at the top of `src/vector3d/stl_reader.py`:

```python
from vector3d.mesh import Mesh
```

Then, inside `class STLReader:`, after `read_triangle`:

```python
    def read_mesh(self):
        count = self.read_triangle_count()
        triangles = []
        for _ in range(count):
            triangles.append(self.read_triangle())
        return Mesh(triangles)
```

### The Updated Project

`src/vector3d/stl_reader.py` in full, new lines marked:

```
 1  from vector3d.binary_reader import BinaryReader
 2  from vector3d.vector import Vector3
 3  from vector3d.triangle import Triangle
 4  from vector3d.mesh import Mesh                                       # ← new
 5
 6
 7  class STLReader:
 8      def __init__(self, path):
 9          self.reader = BinaryReader(path)
10
11      def read_triangle_count(self):
12          self.reader.read_bytes(80)
13          return self.reader.read_uint32()
14
15      def read_triangle(self):
16          self.reader.read_float32()
17          self.reader.read_float32()
18          self.reader.read_float32()
19
20          v0 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())
21          v1 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())
22          v2 = Vector3(self.reader.read_float32(), self.reader.read_float32(), self.reader.read_float32())
23
24          self.reader.read_uint16()
25
26          return Triangle(v0, v1, v2)
27
28      def read_mesh(self):                                             # ← new
29          count = self.read_triangle_count()                          # ← new
30          triangles = []                                              # ← new
31          for _ in range(count):                                      # ← new
32              triangles.append(self.read_triangle())                  # ← new
33          return Mesh(triangles)                                      # ← new
```

As a whole, `STLReader` is now complete: `STLReader(path).read_mesh()`
takes a real file path and returns a real `Mesh`, with no `pyvista`,
`numpy`, or `scipy` involved anywhere in the chain — the direct,
line-for-line replacement for `pyvista.read(path)` this whole lesson
set out to build.

### Mechanical Walkthrough

- **`def read_mesh(self):`** — `def`; `read_mesh`, an ordinary instance
  method name — the one this project's later lessons will actually call;
  `self` only.
- **`count = self.read_triangle_count()`** — a local variable
  assignment; `self.read_triangle_count()` calls the method built in
  this lesson's first Concept Unit, which — as a side effect — also
  advances `self.reader`'s cursor past the header and count bytes,
  leaving it correctly positioned at the start of the first triangle
  record.
- **`triangles = []`** — an empty list, the same list-building pattern
  Lesson 6's own `bounds()` used for `xs`/`ys`/`zs`, here collecting
  whole `Triangle` objects instead of individual numbers.
- **`for _ in range(count):`** — `range(count)` (this lesson's own
  term) produces `count` numbers in sequence; `_` (this lesson's own
  term — the conventional throwaway-variable name) is bound to each one
  in turn, but its actual value is never used anywhere in the loop
  body — only the fact that the body runs exactly `count` times matters
  here, which is precisely why `_` is the idiomatic choice over a real
  name like `i`.
- **`triangles.append(self.read_triangle())`** — `self.read_triangle()`
  calls the method built in this lesson's second Concept Unit, reading
  one full 50-byte record and returning a real `Triangle`; `.append(...)`
  adds it onto the end of the growing `triangles` list — by the time the
  loop finishes, `triangles` holds every single triangle the file
  contains, each one read from wherever the previous one's reading left
  the cursor.
- **`return Mesh(triangles)`** — `return`, handing back a real `Mesh`;
  `Mesh(triangles)` calls `Mesh.__init__` (Lesson 6) with the fully
  populated list — the exact same constructor call shape Lesson 6's own
  `Run It` sections used with hand-typed `Triangle` lists, now fed a
  list built entirely from real file bytes instead.

### CS Lens

This is a **build loop** — repeating one construction step a
dynamically-known number of times and collecting the results — the same
underlying "reduction" family of pattern named in Lesson 6's own CS
Lens for `bounds()`, except building up a collection here instead of
reducing one down to a summary.

Also recognized in: any file format with a records-preceded-by-a-count
header (many binary formats — image palettes, font glyph tables, ZIP
archive central directories — all store "how many entries follow" before
the entries themselves, parsed by exactly this count-then-loop pattern);
database result-set fetching (reading N rows, where N is only known once
the query has actually run); network protocols with a message-count
field followed by that many fixed-size messages.

### SE Lens

The principle here is **the file itself as the single source of truth
for how much work there is** — `read_mesh()` never assumes or hard-codes
a triangle count; it reads the file's own stated count and trusts it
completely, looping exactly that many times.

The alternative not chosen, worth naming as a real and honest
limitation: this method has no way to detect a *malformed* file — one
whose stated triangle count doesn't actually match how many 50-byte
records are really present (too few, and `read_triangle()` would start
reading garbage past the end of `self.reader.data`, or — connecting
directly to Lesson 7's own closing "Try It Yourself" — silently return
truncated, wrong data with no exception at all, since Python's own byte
slicing never raises an error for reading past the end; too many, and
the file would have unread trailing bytes this method simply never
looks at). A production-quality version of this reader would cross-check
the stated count against the file's actual total size before trusting
it. This project's own synthetic test files are always well-formed by
construction, so this gap hasn't caused a real problem yet — but it's
the same category of honest, deliberately-deferred debt this curriculum
has flagged before (`Vector3.normalize`'s missing zero-length guard,
`Mesh.center`'s missing caching), not a fixed one.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.stl_reader import STLReader

s = STLReader('/tmp/lesson08_test.stl')
mesh = s.read_mesh()
print(len(mesh.triangles))
print(mesh.bounds())
print(mesh.center)
for t in mesh.triangles:
    print(t.normal())
"
```

Real output:

```
2
(0.0, 3.0, 0.0, 3.0, 0.0, 3.0)
Vector3(1.5, 1.5, 1.5)
Vector3(0.0, 0.0, 1.0)
Vector3(0.0, 0.0, 1.0)
```

This is exactly Lesson 6's own two-triangle `Mesh` example — same
bounds, same center — except every number here came from real file
bytes on disk, parsed by `STLReader`, instead of hand-typed `Vector3`
calls.

### Connect

Phase B is complete. `STLReader(path).read_mesh()` is now a full,
working, from-scratch replacement for `pyvista.read(path)` — real bytes
in, a real `Mesh` of real `Triangle`s out. Everything built from Lesson
9 onward (spatial search, sampling, alignment, diffing, export) can now
operate on meshes loaded from real STL files, not just hand-typed
examples.

---

## Connect the Pieces

One real file, traced through every method this lesson built:
`STLReader('/tmp/lesson08_test.stl')` composes a `BinaryReader` (Lesson
7) as `self.reader` — this lesson's first Concept Unit, and its own
example of composing a *stateful* object rather than a value type.
`read_mesh()` (third Concept Unit) calls `read_triangle_count()` (first
Concept Unit), which skips 80 header bytes and reads the real count,
`2`, advancing the shared cursor to `84`. Still inside `read_mesh()`,
the `for _ in range(2):` loop calls `read_triangle()` (second Concept
Unit) twice in a row: each call reads and discards a stored normal (nine
`read_float32()` calls total across the discarded normal and three real
vertices, reduced to exactly nine because the normal itself is thrown
away), builds three `Vector3` instances (Lesson 1) from the real ones,
reads and discards the attribute byte count via `read_uint16` (this
lesson's own small addition to `BinaryReader`), and returns a `Triangle`
(Lesson 5) — with every vertex in the file's own original order,
preserving winding. Both resulting `Triangle`s go into a list, which
`Mesh(triangles)` (Lesson 6) wraps into one real `Mesh` — the same
`Mesh` this project has now built twice: once by hand in Lesson 6, and
once, identically, from real bytes on disk, in this lesson.

---

## Try It Yourself

Type `read_uint16` into your own `binary_reader.py`, and `STLReader`
into your own `stl_reader.py` (not copy-pasted), recreate this lesson's
synthetic STL file with the `struct`-based `make_stl` helper shown in
this lesson's first `Run It`, and confirm all three `Run It` outputs
above. Then, once that works, try parsing your synthetic file a second
way — passing the whole thing to `read_mesh()` in one call, rather than
this lesson's own step-by-step `read_triangle_count()`/`read_triangle()`
calls — and confirm it produces the exact same `Mesh`:

```python
s2 = STLReader("/tmp/lesson08_test.stl")
mesh2 = s2.read_mesh()
print(mesh2.bounds())
print(mesh2.center)
```
