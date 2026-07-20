# Lesson 61: Reading What a File Actually Is
### (Hex / Binary Viewer)

**What you will build.** A `hexdump()` function that reads any file's
raw bytes and prints them the way tools like `xxd`/`hexdump` do: an
offset column, the raw bytes in hex, and a printable-text sidebar next
to them. The working feature is small. The transferable problem
underneath: **every file on disk is just a sequence of bytes** — a
`.txt`, a `.png`, and a `.exe` differ only in *how something chooses to
interpret* that byte sequence, not in what's actually stored. Once you
can look at raw bytes directly, "binary format" stops being a mystery
and becomes "bytes at known offsets, meaning something by convention" —
which is the idea every later Track 8 lesson (BMP reader, Huffman
coding) builds on.

**What you need to know first.** From Lesson 1 (sockets): the `with`
statement / context managers, and the `bytes` type (you saw
`.encode()`/`.decode()` there — this lesson uses `bytes` again, from a
different direction). Everything else here — binary file mode, slicing,
`range()` with a step, hex formatting, `chr()` — is new and gets its own
lab. I'm otherwise assuming your stated Python basics: `for` loops,
`if`, functions, string concatenation with `+=`.

No pipeline diagram — this isn't part of an established multi-stage
pipeline in the curriculum.

---

## Concept Unit: Opening a File in Binary Mode

### The Problem

You've opened a file before (the `scratch.txt` throwaway in Lesson 1),
but always as text — Python decoded the bytes on disk into a `str` for
you automatically, using some assumed text encoding. That's exactly
wrong for this lesson: we want the *raw* bytes, undecoded, whatever they
are — including bytes that aren't valid text at all, which every
non-text file is full of.

### Introduce the Concept in Isolation

```python
with open("sample.bin", "wb") as f:
    pass

with open("sample.bin", "rb") as f:
    data = f.read()

print(data, type(data))
```

Run it:

```
b'' <class 'bytes'>
```

This proves the `"rb"` mode flag — not `"r"` — is what makes `f.read()`
hand back a `bytes` object instead of a `str`. (The file's empty here on
purpose; this lab only needs to prove the *type* you get back, not
prove there's data in it.) This throwaway `sample.bin`-as-empty-file
example is discarded now; the real `sample.bin` we build later has
actual content.

### Discard the Throwaway Example

Discarded — only existed to prove what `"rb"` mode returns.

### Project Change

- **Files affected:** `hexdump.py` (new file), `sample.bin` (new file,
  built later in this lesson with real content)
- **Change type:** create
- **Location:** top of `hexdump.py` — nothing exists yet
- **Dependencies:** none beyond the standard library

### The New Code

```python
with open("sample.bin", "rb") as f:
    data = f.read()
```

### The Updated Project

This is the entire file so far:

```python
with open("sample.bin", "rb") as f:
    data = f.read()
```

`hexdump.py` currently does one thing: opens `sample.bin` in binary
mode, reads every byte into `data`, and closes the file automatically
(the `with` guarantee from Lesson 1, reapplied here — same guarantee,
different object).

### Mechanical Walkthrough

`open("sample.bin", "rb")` — `open` itself and the `with`/`as` pattern
are reappearing from Lesson 1 (a reminder, not a re-explanation).
`"rb"` — first appearance: the mode string telling `open` two things at
once — `r` (read, not write) and `b` (binary — don't decode to text).
`f.read()` — first appearance of this exact call: reads the *entire*
remaining contents of the file in one call, returning `bytes` because
the file was opened in binary mode.

### CS Lens

This is the **text/binary boundary**, from the opposite side of Lesson
1's `encode`/`decode` unit: there, we *produced* bytes from a string to
send over a socket; here, we're reading bytes and deliberately *not*
assuming they represent text at all. Also recognized in: image and audio
file formats, executable files, network packet captures, database files
— any format where "what these bytes mean" is defined by a spec, not by
a text encoding.

### SE Lens

Python could have made `"r"` alone binary-safe, with text decoding as an
opt-in extra step. It didn't — `"r"` decodes by default, `"rb"` is the
deliberate opt-out — because the overwhelmingly common case (config
files, source code, logs) *is* text, and forcing every text-reading
program to opt in to decoding would make the common case more verbose to
save the uncommon case one flag. The tradeoff: if you forget `"b"` on a
genuinely binary file, Python will try to decode it as text and crash
with a `UnicodeDecodeError` — a real failure mode worth knowing about,
not one we're handling here.

### Commands Needed

None yet.

### Run It

Not runnable for meaningful output yet — `sample.bin` doesn't have real
content until the next unit builds it. `data` currently holds whatever
bytes exist in a file we haven't populated.

### Connection

We can now pull raw bytes off disk. The next unit is what those bytes
actually *are* once we have them — not a string, a sequence of numbers.

---

## Concept Unit: Iterating Bytes Gives You Integers

### The Problem

We have `data`, a `bytes` object. To print it as hex, we need to look at
it one byte at a time — but what does "one byte" actually *give* you
when you pull it out? If `bytes` were like a string, you might expect
single characters back. It isn't, and that difference is the whole
reason hex-dump code looks the way it does.

### Introduce the Concept in Isolation

```python
data = bytes([72, 101, 108, 108, 111, 0, 255, 254])
for b in data:
    print(b, type(b))
```

Run it:

```
72 <class 'int'>
101 <class 'int'>
108 <class 'int'>
108 <class 'int'>
111 <class 'int'>
0 <class 'int'>
255 <class 'int'>
254 <class 'int'>
```

This proves iterating a `bytes` object hands you back plain `int`
values (0–255, one per byte) — not characters, not sub-`bytes` objects.
That's *why* hex formatting and printable-character conversion (next
units) both start from a number, not a string. This throwaway example
is discarded — real `data` in the project comes from the file we read,
not a hand-built list.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `hexdump.py`
- **Change type:** add — a new function, wrapping the existing
  read-and-assign code as its caller (shown fully once the function
  itself is complete, later in this lesson)
- **Location:** new function `hexdump(data, width=16)`, to be called
  after the file-read code
- **Dependencies:** `data` from the previous unit

### The New Code

```python
def hexdump(data, width=16):
    for b in data:
        pass  # ← each b is an int; next units build on this
```

### The Updated Project

```python
def hexdump(data, width=16):
    for b in data:      # ← new
        pass              # ← new, temporary placeholder
```

This function, on its own, currently loops over every byte and does
nothing with each one yet — `pass` is a stand-in the next several units
replace with real formatting logic.

### Mechanical Walkthrough

`def hexdump(data, width=16):` — `def` and default-argument syntax
(`width=16`) — assuming these as basic from your stated Python
background (functions with default args are a small, standard extension
of "functions," not a new idea worth its own lab). `for b in data:` —
this *is* the new concept from this unit's lab, reapplied to real
project data instead of a hand-built list: each `b` will be an `int`.
`pass` — reappearing from Lesson 1's placeholder use — a reminder, not a
re-explanation.

### CS Lens

Not a hard concept beyond what the throwaway lab already proved —
skipped per the Stopping Rule; this is API behavior (what iteration
yields), not a new computational idea.

### SE Lens

Choosing `width=16` as a default rather than a required argument means
`hexdump(data)` works with a sensible default while still letting a
caller override it (`hexdump(data, width=8)`) without touching the
function itself. The `16` isn't arbitrary — it's the conventional width
real hex-dump tools use, chosen so each row's hex portion fits
comfortably in a standard 80-column terminal.

### Commands Needed

None.

### Run It

Not runnable for observable output — `pass` produces nothing. Held until
the formatting units below give the loop something to do.

### Connection

We now know each `b` is a plain number. The next unit is how the
*rows* of a hex dump get carved out of `data` before we even look at
individual bytes.

---

## Concept Unit: Slicing

### The Problem

A hex dump doesn't print all the bytes on one line — it prints them in
fixed-width rows (16 bytes each, here). Before we can format bytes, we
need a way to pull out "bytes 0 through 15," then "bytes 16 through 31,"
and so on, as their own smaller `bytes` chunks.

### Introduce the Concept in Isolation

```python
data = bytes([10, 20, 30, 40, 50, 60, 70, 80])
chunk = data[2:5]
print(chunk)
print(list(chunk))
```

Run it:

```
b'\x1e(2'
[30, 40, 50]
```

The first printed line looks cryptic — that's Python's default *display*
of a `bytes` object (each byte shown as an escape code or, if it happens
to be a printable ASCII character, as that character — `(` is byte value
40). The second line proves what actually matters: `data[2:5]` pulled
out a *new* `bytes` object containing exactly indices 2, 3, and 4 (stop
index `5` is excluded) — `[30, 40, 50]`. This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `hexdump.py`
- **Change type:** replace — the `pass` placeholder
- **Location:** inside `hexdump`, replacing the loop body
- **Dependencies:** `data`, `width` parameter

### The New Code

```python
for offset in range(0, len(data), width):
    chunk = data[offset:offset + width]
```

### The Updated Project

```python
def hexdump(data, width=16):
    for offset in range(0, len(data), width):   # ← new
        chunk = data[offset:offset + width]       # ← new
```

The function now walks through `data` in `width`-sized steps (`offset`
takes on `0`, `16`, `32`, ...) and, on each step, slices out that row's
bytes into `chunk`. Nothing is printed yet — the row's contents exist,
but nothing formats or displays them.

### Mechanical Walkthrough

`for offset in range(0, len(data), width):` — the loop variable name
changed from `b` to `offset` on purpose (it now tracks a *position*, not
a byte value) — no new syntax here beyond `range`'s third argument,
covered next. `len(data)` — assuming `len()` as basic, already
established. `data[offset:offset + width]` — this *is* the concept from
this unit's lab, reapplied for real: a slice from `offset` up to (not
including) `offset + width`.

### CS Lens

Slicing is a specific case of a more general idea: **treating a
contiguous run of a sequence as its own value**, without manually
copying elements one at a time in a loop. Also recognized in: array
slicing in NumPy/pandas, SQL's `LIMIT`/`OFFSET` pagination, video/audio
scrubbing (jumping to a byte range in a media file), pagination in any
API that returns "items 20 through 40."

### SE Lens

The alternative — a manual inner loop copying `chunk[i] = data[offset +
i]` for `i` in `range(width)` — works, but slicing expresses the same
intent in one readable line and lets Python's C-level implementation do
the copying, which is meaningfully faster for large files. The cost:
slicing silently *tolerates* an out-of-range stop index (try `data[0:1000]`
on an 8-byte `data` — no error, you just get however many bytes actually
exist) — convenient here, since it means we don't need a special case for
the last, possibly-shorter row, but worth knowing it won't raise an error
even when you expected it to.

### Commands Needed

None.

### Run It

Not runnable for output yet — `chunk` is computed but never printed.

### Connection

Each row's raw bytes are now isolated in `chunk`. Next: turning those
byte values into the actual hex text.

---

## Concept Unit: `range()` With a Step

*(Folded into the unit above as a clause, per the Stopping Rule — the
idea "loop over positions" was already covered by `for`/`range` in your
prior Python background; the only new piece is the third argument.)*

`range(0, len(data), width)` — first appearance of the three-argument
form: `range(start, stop, step)`. You've seen `range(n)` before (0 up to
`n`); this version starts at `0`, stops before `len(data)`, and jumps by
`width` each time instead of by `1`. Proven directly rather than with a
separate lab, since it's a small, self-evidently-named extension of an
already-familiar function — not a new idea, a new argument.

```python
for offset in range(0, 10, 4):
    print(offset)
```

Run it:

```
0
4
8
```

Confirms the jump-by-`step` behavior plainly: `0`, then `4`, then `8` —
stops before reaching `10`.

---

## Concept Unit: Hex Formatting in an f-string

### The Problem

Each byte in `chunk` is an `int` from 0–255 (proven two units ago). A
hex dump wants each one shown as exactly two hex digits — `f` not `0f`,
`ff` not `FF` unless we choose uppercase. Python's default `str(b)`
would print `15`, `255` — decimal, wrong base, wrong width. We need a
way to control *both* the number base and the digit padding.

### Introduce the Concept in Isolation

```python
b = 15
print(f"{b:02x}")
b = 255
print(f"{b:02x}")
b = 5
print(str(b), f"{b:02x}")
```

Run it:

```
0f
ff
5 05
```

This proves the `:02x` format spec inside an f-string converts an `int`
to hex (`x`) and zero-pads it to at least 2 digits (`02`) — visibly
different from plain `str(b)`, which stays decimal. This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `hexdump.py`
- **Change type:** add
- **Location:** inside `hexdump`, after the `chunk = ...` line
- **Dependencies:** `chunk` from the previous unit

### The New Code

```python
hex_part = ""
for b in chunk:
    hex_part += f"{b:02x} "
```

### The Updated Project

```python
def hexdump(data, width=16):
    for offset in range(0, len(data), width):
        chunk = data[offset:offset + width]

        hex_part = ""              # ← new
        for b in chunk:              # ← new
            hex_part += f"{b:02x} "    # ← new
```

Each row now builds up a string like `"48 65 6c 6c 6f "` — one two-digit
hex pair per byte, space-separated — but it's built, not yet printed.
`b` here is the exact integer-per-byte value proven two units ago,
reused directly.

### Mechanical Walkthrough

`hex_part = ""` — plain assignment of an empty string, already basic.
`for b in chunk:` — the bytes-iteration concept, reapplied to `chunk`
instead of the whole `data` — a reminder. `hex_part += f"{b:02x} "` —
`+=` (assuming as basic, standard string accumulation) combined with the
`:02x` format spec, which *is* this unit's new concept, reused directly
from the lab; the trailing space inside the f-string is what puts a gap
between hex pairs in the final output.

### CS Lens

This is a **base conversion** (decimal integer → hexadecimal
representation) done by a formatting layer instead of by hand. Also
recognized in: color codes (`#ff0000`), memory addresses shown by
debuggers, MAC addresses, every compiler's disassembler output.

### SE Lens

Hex, not decimal or binary, is the display convention here because each
hex digit maps to exactly 4 bits — two hex digits cover a full byte
(0–255) with no wasted or ambiguous digits, and it's dense enough to
keep 16 bytes per row readable, unlike binary (`0100 1000`, 8 characters
per byte) or decimal (inconsistent width: `5` vs `255`). The `:02x`
padding specifically exists so every byte takes the same two characters
of screen space — without it, columns wouldn't line up.

### Commands Needed

None yet.

### Run It

Not runnable for output yet — `hex_part` is built but not printed. Two
more pieces (the ASCII sidebar, then the actual `print`) remain.

### Connection

Each row's hex text now exists. The next unit builds the ASCII sidebar
next to it, using the same per-byte values from a different angle.

---

## Concept Unit: `chr()` — Turning a Number Back Into a Character

### The Problem

The right-hand sidebar in a real hex dump shows each byte as a letter
where possible (`H`, `e`, `l`...) and a placeholder (conventionally `.`)
where the byte isn't printable text — control codes, high bytes, `0x00`.
We have the integer for each byte; we need the *character* it
represents, but only for the range where "character" is meaningful.

### Introduce the Concept in Isolation

```python
print(chr(72))
print(chr(101))
print(chr(0))

n = 0
print(32 <= n <= 126)
n = 72
print(32 <= n <= 126)
```

Run it:

```
H
e

False
True
```

(The third `print(chr(0))` produced a real but invisible null character —
that blank line *is* the output, not a mistake.) This proves `chr()`
converts an integer code point straight to its character, and that
writing two comparisons back to back — `32 <= n <= 126` — chains them
into one true/false test for "does `n` fall in this range," without
needing `32 <= n and n <= 126` spelled out longer. This throwaway
example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `hexdump.py`
- **Change type:** add
- **Location:** inside `hexdump`, after the `hex_part` loop
- **Dependencies:** `chunk`

### The New Code

```python
ascii_part = ""
for b in chunk:
    if 32 <= b <= 126:
        ascii_part += chr(b)
    else:
        ascii_part += "."
```

### The Updated Project

```python
def hexdump(data, width=16):
    for offset in range(0, len(data), width):
        chunk = data[offset:offset + width]

        hex_part = ""
        for b in chunk:
            hex_part += f"{b:02x} "

        ascii_part = ""                    # ← new
        for b in chunk:                      # ← new
            if 32 <= b <= 126:                 # ← new
                ascii_part += chr(b)             # ← new
            else:                               # ← new
                ascii_part += "."                  # ← new
```

Each row now has both its hex text *and* its ASCII sidebar text fully
built. Both loops walk the same `chunk` independently — deliberately
simple over clever, so each concept stays visible as its own step
instead of merged into one dense loop.

### Mechanical Walkthrough

`ascii_part = ""` — basic, same pattern as `hex_part`. `for b in chunk:`
— reminder, third reuse of the same iteration concept. `if 32 <= b <=
126:` — the chained-comparison concept from this unit's lab, reused for
real: `32` and `126` are the printable-ASCII range's boundaries (space
through `~`). `ascii_part += chr(b)` — `chr()`, reused directly from the
lab. `else: ascii_part += "."` — the fallback for anything outside
printable range, already-basic `if`/`else`.

### CS Lens

This is exactly the encoding-boundary idea from earlier in this lesson,
approached from the opposite side: there, "binary mode" meant *not*
assuming bytes are text; here, we're selectively re-interpreting *some*
of those same bytes as text, one at a time, only where that
interpretation is meaningful. Also recognized in: ASCII-art generators,
terminal emulators deciding which bytes to render as glyphs vs. control
sequences, any "printable characters only" filter in a log viewer.

### SE Lens

Hardcoding `32` and `126` instead of calling something like
`str.isprintable()` is a real, visible tradeoff: `isprintable()` exists
and is more correct in general (it understands the full range of
Unicode), but it operates on `str`, not on a raw `int` byte value, and
pulling it in here would require converting each byte to a one-character
string first just to ask the question — more machinery for a tool whose
whole point is showing you the *raw* bytes plainly. The debt: this
`32`–`126` range is ASCII-only; it doesn't correctly handle
multi-byte UTF-8 sequences as "printable" — acceptable for a tool meant
to inspect raw binary, not proper text.

### Commands Needed

None yet — the `print()` that actually outputs a row comes next.

### Run It

Still not runnable for a full row — the last piece is assembling
`offset`, `hex_part`, and `ascii_part` into one printed line, which
reuses `:02x`-style formatting you've already seen, so it needs no new
unit, just the assembly shown below.

### Connection

Both halves of a row — hex and ASCII — now exist as strings. The
closing section assembles and prints them.

---

## Assembling and Running the Real Tool (No New Concepts)

```python
def hexdump(data, width=16):
    for offset in range(0, len(data), width):
        chunk = data[offset:offset + width]

        hex_part = ""
        for b in chunk:
            hex_part += f"{b:02x} "

        ascii_part = ""
        for b in chunk:
            if 32 <= b <= 126:
                ascii_part += chr(b)
            else:
                ascii_part += "."

        print(f"{offset:08x}  {hex_part}  {ascii_part}")


with open("sample.bin", "rb") as f:
    data = f.read()

hexdump(data)
```

`f"{offset:08x}"` is a reminder, not a new unit — the same `:x` hex
format from earlier, just padded to 8 digits instead of 2, which is
convention for a byte-offset column.

### Commands Needed

`python3 hexdump.py` — runs the script as before. No new command
concepts.

### Run It — Real Output

Against a real `sample.bin` containing the bytes for `"Hello, World!"`,
followed by five raw non-text bytes (`0, 1, 2, 255, 254`, then `253`),
followed by more plain text:

```
$ python3 hexdump.py
00000000  48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 00 01 02   Hello, World!...
00000010  ff fe fd 20 6d 6f 72 65 20 74 65 78 74 20 68 65   ... more text he
00000020  72 65   re
```

That's the actual output. Notice row two: `20 6d 6f 72 65...` starts
with `20` — a space character (hex `20` = decimal 32, the low edge of
our printable range) — and the sidebar correctly shows it as a literal
space, not a dot.

---

## Closing

### Connect the Pieces

Trace the byte at position 13 (0-indexed) through the whole pipeline:
`f.read()` pulled it off disk as part of `data`, as the raw integer
value `0`. The outer loop's second iteration (`offset = 0`, since 13 is
within the first 16-byte row) sliced it into `chunk` via `data[0:16]`.
The hex loop formatted it as `f"{0:02x} "` → `"00 "`, visible in the
output as the `00` right after `21`. The ASCII loop checked `32 <= 0 <=
126` → `False`, so it became `.` in the sidebar instead of `chr(0)`
(which would have printed an invisible null character and broken the
column alignment). Same byte, two different representations, built by
two independent loops over the same `chunk`.

### What Breaks Without This

Remove the `"rb"` and use plain `"r"` instead:

```python
with open("sample.bin", "r") as f:
    data = f.read()
```

Running this against `sample.bin` (which contains raw byte `255`, not
valid as UTF-8 text on its own) gives:

```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 16: invalid start byte
```

Text mode tried to decode every byte as UTF-8 text before we ever got a
chance to look at it — and byte `0xff` (255) isn't valid UTF-8 on its
own. Restore `"rb"` and it works again, because binary mode never
attempts that decode at all.

### Exercises

1. Change `width` to `8` and rerun — confirm each row now shows 8 bytes
   instead of 16, and the offsets jump by 8 (`00000000`, `00000008`,
   `00000010`, ...).
2. Point `hexdump.py` at a real file on your machine — a small `.png` or
   `.exe` — and find its "magic bytes," the first few bytes many formats
   use to identify themselves (a PNG always starts with `89 50 4e 47`).
3. Modify the ASCII sidebar to use a different placeholder character
   than `.` for non-printable bytes, and explain in one sentence why
   that change is purely cosmetic — it doesn't touch how any byte is
   read, stored, or interpreted.

### Definition of Done

- [ ] `hexdump.py` runs and produces output matching the format shown
      above against a file you built yourself
- [ ] You can explain why `"rb"` mode matters, without looking back
- [ ] You can explain what `chunk = data[offset:offset + width]` pulls
      out, in your own words
- [ ] You ran the "what breaks" experiment and saw the real
      `UnicodeDecodeError`
- [ ] Commit:

```
git add hexdump.py
git commit -m "Add a hex/ASCII dump tool: prove that any file is just bytes, and that 'binary format' means choosing how to interpret those bytes, not something fundamentally different from text"
```
