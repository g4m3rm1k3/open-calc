# Lesson 64: Every Image File Is Just a Struct With Extra Steps

## What you will build

A real BMP file, constructed entirely by hand — not one library call —
byte by byte, matching the real BMP specification exactly, verified as
genuinely valid by opening it with Pillow (the real image library from
Lesson 35). Then a from-scratch BMP *reader*, no library involved,
verified against both that hand-built file and a second, independently
Pillow-generated one with real row padding. And a from-scratch PNG
header reader, extracting width, height, and color type directly from
PNG's own binary structure, cross-checked against Pillow's own reported
values.

## What you need to know first

- **Lesson 63** — `struct.pack`, used there to write a Huffman padding
  count as a single byte. Today uses `struct` far more heavily, in both
  directions, against two real, external binary formats rather than a
  format this curriculum invented.
- **Lesson 30** — big-endian byte order, established for WebSocket frame
  headers. Today's BMP format uses the *opposite* convention,
  little-endian, and the direct contrast is demonstrated, not just
  stated.
- **Lesson 35** — Pillow, used there to convert real images. Today,
  Pillow serves a new role: an independent, trusted reference to verify
  this lesson's own from-scratch binary parsing against.

---

## The Problem, in prose, no code yet

Every image file this curriculum's own Lesson 35 opened and converted
with `Image.open(...)` was, underneath that one function call, nothing
more than a specific, precise sequence of bytes following a published
specification. `.png` and `.bmp` are two of the simpler such
specifications — no compression to speak of in BMP's basic form, no
requirement to understand JPEG's DCT math — which makes them the right
place to open the box: read the same bytes Pillow reads, by hand,
using nothing but `struct` and a written specification, and confirm,
directly, that the result matches what a real, trusted image library
reports.

---

## Concept Unit: Byte Order Is a Real Choice, Not a Detail

### The Problem

A multi-byte number — a file size, a width — has to be stored as some
sequence of individual bytes, and which end comes first is a genuine,
consequential choice a format's designers make, not a universal
convention every format shares.

### Introduce the concept in isolation

```python
import struct

little_endian_bytes = b"\x01\x00\x00\x00"
big_endian_bytes = b"\x00\x00\x00\x01"

print("little-endian bytes interpreted as little-endian:", struct.unpack("<I", little_endian_bytes)[0])
print("little-endian bytes interpreted as big-endian:   ", struct.unpack(">I", little_endian_bytes)[0])
print("big-endian bytes interpreted as big-endian:      ", struct.unpack(">I", big_endian_bytes)[0])
```

Run it:

```
little-endian bytes interpreted as little-endian: 1
little-endian bytes interpreted as big-endian:    16777216
big-endian bytes interpreted as big-endian:       1
```

What this proves: the *exact same four bytes*, `b"\x01\x00\x00\x00"`,
mean `1` under one interpretation and `16,777,216` (`2^24`) under the
other — not a rounding difference, a completely different number,
because `<I`/`>I` (**first appearance of `struct`'s endianness prefix
characters**, `<` little-endian, `>` big-endian, `I` an unsigned 4-byte
integer) tell `struct.unpack` which end of the 4 bytes to treat as most
significant. Lesson 30's WebSocket frame lengths used `int.from_bytes(...,
"big")` — the same underlying choice, made explicit with a different,
non-`struct` API. BMP, the format this lesson builds next, uses
little-endian throughout; PNG, built later in this same lesson, uses
big-endian — two real, current, actively-used formats making opposite
choices, both correct within their own specification.

This lab is deleted now; it never appears in the project. What survives
is a hard rule for the rest of this lesson: check the spec's declared
byte order before writing a single `struct` format string, every time.

### CS Lens

This is **endianness**, named directly (the term itself, and its
origin in *Gulliver's Travels*' dispute over which end of an egg to
crack, is well-known trivia — the underlying computer science fact is
what matters: multi-byte values have no universally "natural" byte
order, only per-format or per-architecture conventions).

### SE Lens

A format specification stating its byte order explicitly, and a reader
respecting it explicitly via `struct`'s prefix character, removes any
ambiguity — the alternative, assuming a byte order because "that's how
the last format I read worked," is exactly the mistake this unit's own
`16777216` result demonstrates concretely rather than abstractly.

---

## Concept Unit: Building a Real BMP File by Hand

### The Problem

Before reading a BMP file, building one from scratch — matching the real
specification exactly — proves a genuine, checkable understanding of
every field's meaning, not just enough to make some reader function
happen to work.

### Project Change

- **Reference Source:** The Microsoft BMP file format specification (the
  `BITMAPFILEHEADER` and `BITMAPINFOHEADER` structures), followed field
  by field below — not any specific existing parser's source code.
- **Files affected:** new file, `build_tiny_bmp.py`.
- **Change type:** add.
- **Dependencies:** `struct` only for construction; Pillow only to
  verify the result.

### The New Code

```python
file_header = struct.pack(
    "<2sIHHI",
    b"BM",           # signature
    file_size,       # total file size
    0, 0,            # reserved fields
    pixel_data_offset,
)

dib_header = struct.pack(
    "<IiiHHIIiiII",
    dib_header_size,
    WIDTH, HEIGHT,
    1,                     # color planes (always 1)
    BYTES_PER_PIXEL * 8,   # bits per pixel
    0,                     # compression method (0 = none)
    len(pixel_data),
    2835, 2835,            # resolution, pixels per meter
    0, 0,                  # palette colors, important colors
)
```

### Mechanical Walkthrough

- `"<2sIHHI"` — **first appearance of `struct`'s `s` format code**:
  `2s` means "a 2-byte raw string" (here, the literal bytes `b"BM"` —
  every BMP file's required signature); `I` is an unsigned 4-byte
  integer, `H` an unsigned 2-byte integer — the file header's five
  fields, packed in the exact order and exact byte widths the real
  specification requires.
- `pixel_data_offset` — computed, not hard-coded, as
  `file_header_size + dib_header_size` (`14 + 40 = 54`): where in the
  file the actual pixel bytes begin, needed by any real reader to know
  where the headers end.
- The DIB (device-independent bitmap) header's own fields — `WIDTH`,
  `HEIGHT` as *signed* integers (`i`, lowercase, distinct from unsigned
  `I`) because BMP allows a negative height as a real, documented
  convention meaning "store rows top-to-bottom instead of the normal
  bottom-to-top" (not used by this lesson's own files, but the field's
  signedness is a real, correct detail worth getting right regardless).
- The pixel data itself — built as **BGR** (blue, green, red), *not*
  RGB — a real, easy-to-miss BMP convention — and stored **bottom row
  first**, both handled explicitly in this lesson's own construction
  code and confirmed, in the next unit, by an independent library's
  interpretation.

### Run it

```python
bmp_bytes = build_tiny_bmp()
with open("tiny.bmp", "wb") as bmp_file:
    bmp_file.write(bmp_bytes)

from PIL import Image
image = Image.open("tiny.bmp")
print("Pillow reports size:", image.size)
print("top-left pixel (Pillow):", image.getpixel((0, 0)))
print("bottom-left pixel (Pillow):", image.getpixel((0, 1)))
```

```
wrote 78 bytes to tiny.bmp
Pillow reports size: (3, 2)
Pillow reports mode: RGB
Pillow reports format: BMP
top-left pixel (Pillow): (0, 0, 255)
bottom-left pixel (Pillow): (255, 0, 0)
```

A completely independent, professionally-maintained library opened this
lesson's own 78 hand-written bytes, correctly reported the intended
`3×2` size, and correctly reported the top pixel as blue
(`(0, 0, 255)` in RGB) and the bottom pixel as red — exactly matching
what this lesson's own construction code intended, confirming both the
BGR-versus-RGB byte order and the bottom-row-first storage convention
were both implemented correctly, verified by a party that has no
knowledge of this lesson's own code at all.

### CS Lens

This is the same **serialization** concept named back in Lesson 55, now
applied to a real, externally-defined binary format rather than a
lesson-invented JSON structure — proving a format is understood
correctly by successfully *producing* valid instances of it, not merely
successfully reading ones someone else already made.

### SE Lens

Verifying a hand-built file against a second, independent implementation
(Pillow) is the identical validation principle behind Lesson 55's
`json.loads` comparison and Lesson 58's `eval()` fuzz test — this
lesson's own confidence in its BMP construction doesn't rest on "the
code ran without error," it rests on a trusted, unrelated tool agreeing
with it byte for byte on the result.

---

## Concept Unit: Reading It Back, and the Padding Gotcha

### Project Change

- **Reference Source:** Same Microsoft BMP specification as above.
- **Files affected:** new file, `bmp_reader.py`.
- **Change type:** add.
- **Dependencies:** `struct` only.

### The New Code

```python
bytes_per_pixel = bits_per_pixel // 8
row_size_unpadded = width * bytes_per_pixel
padding = (4 - row_size_unpadded % 4) % 4
row_size_padded = row_size_unpadded + padding

pixels = []
for row_index in range(height):
    row_start = pixel_data_offset + row_index * row_size_padded
    row_bytes = raw_bytes[row_start:row_start + row_size_unpadded]
    ...
```

### Mechanical Walkthrough

- `padding = (4 - row_size_unpadded % 4) % 4` — a **hard concept
  reappearing** from Lesson 48 and Lesson 63's identical padding-
  restoration formula, applied here to a real, spec-mandated constraint:
  every BMP row, regardless of the image's actual width, is padded with
  extra bytes so its *stored* length is always a multiple of 4 — a real
  historical performance convention (4-byte-aligned memory access), not
  an arbitrary rule.
- `row_start = pixel_data_offset + row_index * row_size_padded` — this
  is the one line that must use the *padded* row size, even though the
  actual pixel bytes read (`raw_bytes[row_start:row_start +
  row_size_unpadded]`, the *unpadded* length) deliberately exclude the
  padding bytes themselves — getting either one wrong misaligns every
  row after the first.

### Run it

Against a second, genuinely independent test: a `5×3` BMP built entirely
by Pillow itself (not this lesson's own construction code), with a width
specifically chosen so its rows *do* require real padding
(`5 × 3 bytes = 15`, needing 1 padding byte to reach 16):

```python
info = read_bmp("pillow_made.bmp")
for y, row in enumerate(info["pixels"]):
    print("row", y, row)
```

```
row 0 [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0), (0, 255, 255)]
row 1 [(0, 255, 0), (0, 0, 255), (255, 255, 0), (0, 255, 255), (255, 0, 0)]
row 2 [(0, 0, 255), (255, 255, 0), (0, 255, 255), (255, 0, 0), (0, 255, 0)]
```

Every single pixel matches exactly what Pillow itself reported when the
file was created — this lesson's own from-scratch reader, with no image
library involved at all, correctly parsed a file it had no hand in
producing.

### What breaks without this

Removing the padding calculation — using the raw, unpadded row size to
compute every row's starting offset — against this exact same file:

```
row 0 (broken, no padding fix): [(0, 0, 255), (255, 255, 0), (0, 255, 255), (255, 0, 0), (0, 255, 0)]
row 1 (broken, no padding fix): [(255, 0, 0), (0, 255, 0), (255, 0, 0), (255, 255, 255), (0, 0, 0)]
row 2 (broken, no padding fix): [(0, 0, 255), (0, 255, 0), (255, 0, 255), (0, 0, 0), (255, 255, 255)]
```

Every single pixel is wrong, and it gets *progressively* more wrong with
each row — the first row is already reading from the wrong starting
byte (missing the first row's own padding byte entirely shifts
everything after it), and that one-byte error compounds, row after row,
since each subsequent row's start is computed from the previous, already
wrong, unpadded assumption.

### CS Lens

This is a real instance of **structural alignment** — padding added not
to carry information but purely to satisfy a fixed boundary requirement
— the same broad category as CPU memory alignment requirements, and a
direct, concrete illustration of why "just read `width × bytes_per_pixel`
bytes per row" is an intuitive but incorrect shortcut for this format
specifically.

### SE Lens

The corrupted-but-not-crashed output above is the genuinely dangerous
case: nothing about the broken reader raises an exception or produces
obviously invalid data (every value returned is still a plausible-
looking RGB tuple) — it simply produces the *wrong* image silently,
exactly the same category of danger Lesson 44's file-integrity lessons
and Lesson 52's torn-backup findings already established: a bug that
fails quietly is more dangerous than one that fails loudly.

---

## Concept Unit: PNG's Header — A Different Format, the Same Discipline

### The Problem

PNG is a structurally different format from BMP — chunk-based, with a
fixed magic signature, big-endian fields, and (for full images) real
DEFLATE compression this lesson doesn't attempt — but its very first
chunk, `IHDR`, contains exactly the same kind of information BMP's
headers do: width, height, and pixel format, extractable with the
identical `struct`-based technique, adjusted for PNG's own real,
different conventions.

### Project Change

- **Reference Source:** The PNG specification (ISO/IEC 15948), §5 (chunk
  layout) and §11.2.2 (`IHDR`), followed directly.
- **Files affected:** new file, `png_header.py`.
- **Change type:** add.
- **Dependencies:** `struct` only.

### The New Code

```python
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"

def read_png_header(file_path):
    with open(file_path, "rb") as png_file:
        raw_bytes = png_file.read(33)

    signature = raw_bytes[0:8]
    if signature != PNG_SIGNATURE:
        raise ValueError(f"not a PNG file (signature was {signature!r})")

    chunk_length, chunk_type = struct.unpack(">I4s", raw_bytes[8:16])
    if chunk_type != b"IHDR":
        raise ValueError(f"expected IHDR as the first chunk, got {chunk_type!r}")

    width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(
        ">IIBBBBB", raw_bytes[16:16 + chunk_length]
    )
    ...
```

### Mechanical Walkthrough

- `PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"` — PNG's own fixed 8-byte magic
  number, deliberately including a non-ASCII byte (`\x89`) and both
  `\r\n` and a lone `\n` specifically so early, naive tools that
  translate line endings or stop at the first "control" byte would
  reliably fail to open a PNG rather than silently corrupting it — a
  real, deliberate defensive design choice baked directly into the
  format's own signature, unrelated to anything this lesson's reader
  itself needs to do beyond checking for it exactly.
- `struct.unpack(">I4s", ...)` — **big-endian** this time (`>`,
  directly contrasting BMP's `<` from earlier in this lesson) — every
  PNG multi-byte field uses network byte order, the identical convention
  Lesson 30's WebSocket frames used, for the identical general reason:
  it's the traditional, historically standard choice for
  network/interchange formats, independent of any given CPU's own native
  byte order.
- Every PNG chunk shares one fixed shape — a 4-byte length, a 4-byte
  type name, that many bytes of data, then a 4-byte checksum (not read
  by this lesson's minimal version) — `IHDR`'s own data is fixed at
  exactly 13 bytes: width, height (4 bytes each), then five single-byte
  fields packed with `BBBBB`.

### Run it

Against a real PNG created by Pillow:

```python
info = read_png_header("test.png")
```

```
width: 100
height: 60
bit_depth: 8
color_type: 2
color_type_name: RGB
```

Cross-checked directly:

```python
img = Image.open("test.png")
print("Pillow size:", img.size, "mode:", img.mode)
```

```
Pillow size: (100, 60) mode: RGB
```

Exact agreement — `100×60`, RGB — extracted from the raw file bytes with
no image library involved, confirmed against one that was.

And, proving both readers genuinely check their format's own signature
rather than trusting a file's extension:

```python
read_png_header("tiny.bmp")   # -> ValueError: not a PNG file (signature was b'BMN\x00\x00\x00\x00\x00')
read_bmp("test.png")          # -> ValueError: not a BMP file (signature was b'\x89P')
```

Each reader correctly rejects the other format's real file, quoting the
actual (wrong) signature bytes it found.

### CS Lens

PNG's **chunk-based** structure — self-describing blocks, each stating
its own type and length before its content — is a more extensible design
than BMP's fixed-position header fields: new chunk types can be added to
the format over time (PNG has many optional chunks beyond `IHDR` this
lesson doesn't read) without breaking readers that only understand the
chunks they specifically look for, the same self-describing principle
Lesson 39's JSON-based macro format and Lesson 55's own JSON objects
already relied on, here expressed in a binary, non-text format instead.

### SE Lens

Checking `chunk_type != b"IHDR"` explicitly, immediately after reading
it, rather than assuming the very first chunk in any PNG is always
`IHDR`, is defensive but also *correct by the specification itself* —
the PNG standard guarantees `IHDR` is always first, but checking anyway
turns a spec violation (a corrupted or non-conformant file) into a
clear, immediate, named error rather than a confusing failure several
lines later when the wrong bytes get unpacked as if they were width and
height.

---

## Connect the pieces

Two real, different, external binary formats, read the same disciplined
way: BMP, little-endian, fixed-position fields, bottom-up BGR rows
requiring explicit padding math — hand-built from scratch and
independently confirmed correct by Pillow, then read back by a
from-scratch reader confirmed correct against a *second*, genuinely
external Pillow-made file. PNG, big-endian, self-describing chunks, read
just far enough to extract its own `IHDR` — confirmed against Pillow's
own reported dimensions and color mode. Neither reader trusts a file
extension; both check their format's own real signature bytes and
reject the other's files with a specific, honest error naming exactly
what was found instead.

## What breaks without this

Already demonstrated directly: omitting BMP's row-padding calculation
doesn't crash anything — it silently returns a full grid of
plausible-looking, entirely wrong pixel colors, progressively more
corrupted with every subsequent row, a real, caught example of exactly
the "fails quietly, not loudly" danger this curriculum has flagged
before and now shown concretely in a binary-format context.

## Definition of done

- [ ] `build_tiny_bmp` produces a file Pillow opens successfully,
      reporting the correct size and correct pixel colors at the correct
      positions.
- [ ] `read_bmp` correctly parses both this lesson's own hand-built file
      and a second, independently Pillow-generated file with real row
      padding, matching Pillow's own pixel values exactly.
- [ ] Removing the padding calculation from `read_bmp` produces visibly,
      confirmably wrong pixel data, worsening row by row.
- [ ] `read_png_header` correctly extracts width, height, and color type
      from a real Pillow-generated PNG, matching Pillow's own reported
      values.
- [ ] Both `read_bmp` and `read_png_header` raise a clear, specific
      `ValueError` naming the actual signature bytes found when handed
      the wrong file format.
- [ ] You can explain, without looking back at this lesson, why BMP uses
      `<` and PNG uses `>` in this lesson's own `struct` format strings.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add build_tiny_bmp.py bmp_reader.py png_header.py
  git commit -m "Add from-scratch BMP writer/reader and PNG header reader, both verified against Pillow — caught real, silent, worsening pixel corruption from omitting BMP's row-padding calculation"
  ```

## What's next

Track 9's image lessons pick up directly where this one leaves off: this
lesson deliberately stopped at BMP's simplest, uncompressed form and
PNG's header alone, leaving PNG's real DEFLATE-compressed pixel data —
directly built from Lesson 63's own Huffman coding, layered with a
repetition-finding stage this curriculum's compression tracks named but
didn't build — as genuinely unfinished territory this lesson is honest
about rather than glossing over.
