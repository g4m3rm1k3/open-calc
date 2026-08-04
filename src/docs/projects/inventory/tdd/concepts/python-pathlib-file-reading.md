# Concept: Reading (and Writing) Files with `pathlib`

**What you'll understand by the end:** the modern, real way to read and
write a whole text file in Python, how it compares to the older
`open()`-based idiom, and what a real encoding mismatch actually looks
like when it happens.

**Prerequisites:** none beyond the assumed floor.

## Setup

Python 3, no packages needed (`pathlib` is standard library).

## The Problem

Reading a file's entire contents is one of the most common real
operations any program does, and Python has accumulated more than one
real way to do it over time — worth knowing the modern, concise one
directly, and what can genuinely go wrong (an encoding mismatch) when a
file's real bytes don't mean what the reader assumed.

## The Isolated Example

```python
from pathlib import Path

p = Path("sample.txt")
p.write_text("hello, real file\nsecond line\n")

content = p.read_text()
print(repr(content))

# The older, lower-level idiom, doing the same real thing:
with open("sample.txt") as f:
    content2 = f.read()
print(content == content2)

# What a real encoding mismatch actually looks like:
p.write_bytes(b"\xff\xfe\x00bad-bytes")
try:
    p.read_text(encoding="utf-8")
except UnicodeDecodeError as e:
    print(f"UnicodeDecodeError: {e}")
```

**Real output, run this session:**
```
'hello, real file\nsecond line\n'
True
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0: invalid start byte
```

**What this proves:** `Path(...).read_text()`/`.write_text()` do the
identical real job as the classic `open(...) as f: f.read()` idiom
(confirmed directly — `content == content2` is `True`) with less
ceremony, no `with` block required for the read/write itself. The
`UnicodeDecodeError` is a real, concrete failure — `0xff` is not a
valid starting byte for any real UTF-8-encoded character, so `read_text`
genuinely cannot interpret those bytes as text at all and refuses,
rather than guessing or silently corrupting the result.

## Mechanical Walkthrough

- `Path("sample.txt")` creates a real, lightweight object representing
  a file **path** — it doesn't open or read anything yet, and the file
  doesn't even need to exist yet to construct one.
- `.write_text(string)` opens the file, writes the given string encoded
  as text (UTF-8 by default), and closes it again — one real method
  call for the whole operation.
- `.read_text()` opens the file, reads its entire real content, decodes
  it as text, and closes it — the returned value is a plain Python
  `str`, not a file handle needing further reading.
- `open(path) as f: f.read()` is the older, still-completely-valid
  idiom: `open()` returns a real file-handle object needing an explicit
  `with` block (or manual `.close()`) to guarantee it's released; `.read()`
  then pulls the entire remaining content as one `str`.
- A file's real bytes on disk have no inherent "this is UTF-8" label —
  `read_text` *assumes* an encoding (UTF-8 by default) and tries to
  decode the raw bytes according to that assumption; when the real
  bytes don't form valid UTF-8 (as `\xff\xfe` doesn't), decoding fails
  with a real, specific `UnicodeDecodeError` naming the exact bad byte
  and its position, rather than producing silently-wrong text.

## CS Lens

This is **text encoding** made concrete: a file on disk is always just
a sequence of raw bytes; "text" only exists once those bytes are
interpreted under an assumed, specific encoding scheme (UTF-8 here).
Reading "as text" is never a neutral, assumption-free operation — it's
always decoding under *some* real, specific assumption, which can be
wrong.

Also recognized in: any cross-language/cross-system file exchange where
one side wrote bytes under one encoding and another reads them assuming
a different one (a classic, real source of garbled or rejected text);
web browsers reading an HTTP response's `Content-Type: charset=...`
header for the identical real reason before rendering its body as text.

## SE Lens

The real, practical tradeoff: `pathlib`'s `read_text`/`write_text` are
more concise for the common "read/write the whole file at once" case,
and read naturally as "get me this path's text." The classic `open()`
idiom remains necessary (and still completely valid, appearing
throughout real, current Python code) for anything `pathlib`'s
convenience methods don't cover directly — reading line-by-line without
loading a huge file entirely into memory, binary modes with more
granular control, or real file-locking/streaming scenarios. Neither is
"deprecated"; they're two real tools with overlapping but not identical
real use cases.

## Connection

Directly explains why `read_program`-style functions in a real
application need to catch `UnicodeDecodeError` specifically, alongside
`FileNotFoundError` — both are real, distinct ways reading a file can
fail, translatable at a boundary per `exception-translation-at-
boundary.md`.

## Try It Yourself

1. Write a file with `p.write_text("café", encoding="utf-8")`, then
   read it back with `p.read_text(encoding="ascii")` and observe the
   real `UnicodeDecodeError` this specific mismatch produces — a real,
   valid UTF-8 file, misread under the wrong assumed encoding.
2. Try `Path("does-not-exist.txt").read_text()` and read the real
   `FileNotFoundError` it raises — confirm it's the identical exception
   type `open("does-not-exist.txt")` would raise for the same real
   reason.
3. Look up `Path.read_bytes()`/`.write_bytes()` (no text decoding at
   all, real raw bytes in and out) and use them to read the same
   `\xff\xfe\x00bad-bytes` file from the example above without
   triggering any decode error — confirm the real, raw bytes come back
   unchanged.

## A Second Real Facet: `.readlines()` — the Classic Idiom Still Appears in Real Code

This project's own real code isn't purely one style or the other —
some of it uses pathlib's own convenience methods; some of it, even
written afterward, still reaches for the classic `open()`/`with`
idiom, including a method pathlib's own `read_text()` doesn't have a
direct equivalent for:

```python
from pathlib import Path

p = Path("sample.txt")
p.write_text("first\nsecond\nthird\n")

with open(p) as f:
    lines = f.readlines()

print(lines)
print("pathlib's own text still available as one string:", repr(p.read_text()))
```

**Real output, run this session:**
```
['first\n', 'second\n', 'third\n']
pathlib's own text still available as one string: 'first\nsecond\nthird\n'
```

**What this proves:** `open(p)` accepts a real `Path` object directly
(no `str(p)` conversion needed), and `.readlines()` returns a real
`list` of individual lines, each still carrying its own trailing
`"\n"` — genuinely different shape from `read_text()`'s single, whole
string. Neither style is "the old, wrong one" — this project's own
real history shows application code choosing pathlib's concise
`read_text()`/`write_text()` while a test elsewhere reaches for the
classic `with open(...) as f:` idiom specifically because it needs
`.readlines()`'s per-line list, something `read_text()` alone doesn't
directly provide (though `p.read_text().splitlines()` gets the
equivalent result). See `python-context-manager-with-statement.md` for
what the `with` statement itself is actually doing here, mechanically.

### Try It Yourself (second facet)

1. Rewrite the example using `p.read_text().splitlines()` instead of
   `open(p).readlines()` and compare the two real results — note the
   one real, small difference: `splitlines()`'s own lines do **not**
   keep their trailing `"\n"`, while `.readlines()`'s do.
2. Confirm `open(p)` also accepts a plain string path
   (`open(str(p))` or `open("sample.txt")`) — both real styles
   genuinely interoperate, not two incompatible worlds.
3. Read `python-context-manager-with-statement.md` and explain, in your
   own words, why `with open(p) as f:` needs an explicit `with` block
   at all when `p.read_text()` doesn't.

## A Third Real Facet: File Metadata via `.stat()`

Every fact read so far has been a file's own real **content**. A real,
different need is reading facts *about* a file — its size, when it was
last modified — without touching its content at all:

```python
from pathlib import Path
from datetime import datetime

p = Path("sample.txt")
p.write_text("hello, real file\n" * 100)

info = p.stat()
print("real size in bytes:", info.st_size)

modified = datetime.fromtimestamp(info.st_mtime)
print("real modification time formatted:", modified.strftime("%Y-%m-%d %H:%M:%S"))
```

**Real output, run this session:**
```
real size in bytes: 1800
real modification time formatted: 2026-08-02 13:34:58
```

**What this proves:** `.stat()` returned real, accurate filesystem
metadata — `st_size` genuinely matches the real byte count of the
written content (100 real repetitions of a 18-character line), with no
need to read the file's own content to learn it. `st_mtime` is a real,
raw Unix timestamp (a plain float); `datetime.fromtimestamp(...)`
converts it into a real, genuine `datetime` object, and `.strftime(...)`
formats that into a real, human-readable string using its own format-
code mini-language (`%Y` four-digit year, `%m` month, `%d` day, `%H:%M:%S`
24-hour time).

**Mechanical note:** `.stat()` is a real, relatively expensive
filesystem call (it genuinely queries the operating system) — calling
it once and reusing the returned object for multiple real facts
(`st_size`, `st_mtime`, and others like `st_mode`) is more efficient
than calling `.stat()` again for each one.

### Try It Yourself (third facet)

1. Modify the file's content and call `.stat()` again — confirm
   `st_size` and `st_mtime` both reflect the real, new state, proving
   `.stat()` isn't cached from the first call.
2. Look up `st_mode` and use Python's own `stat` module (`stat.
   filemode(info.st_mode)`) to render real, Unix-style permission text
   (`-rw-r--r--`) from it.
3. Compare `Path.stat()` against `Path.exists()` — confirm calling
   `.stat()` on a path that doesn't exist raises a real
   `FileNotFoundError`, while `.exists()` is the real, correct way to
   check existence first without risking that exception.

## A Fourth Real Facet: Finding Several Files by Pattern — `glob.glob` and Its Modern `Path.glob` Equivalent

Every prior facet in this file reads or inspects **one specific,
already-known** file. A real, different, common need is finding
**every** file matching a pattern — every real machine definition in a
folder, say — without knowing their individual names in advance.

```python
import glob
import os

matches = glob.glob(os.path.join(folder, "*.machine.json"))
print("glob matches:", sorted(os.path.basename(m) for m in matches))
```

**Real output, run this session (a folder with two real `.machine.
json` files and one unrelated `.txt` file):**
```
glob matches: ['doosan-puma.machine.json', 'haas-vf2.machine.json']
```

**What this proves:** `glob.glob` correctly found both real
`*.machine.json` files and correctly excluded the unrelated
`notes.txt` — the `*` wildcard matched only the real, intended
pattern.

The modern, `pathlib`-native equivalent — a real method on `Path`
itself, not a separate standard-library module:

```python
matches = sorted(p.name for p in folder.glob("*.machine.json"))
print("Path.glob matches:", matches)
```

**Real output, run this session:**
```
Path.glob matches: ['doosan-puma.machine.json', 'haas-vf2.machine.json']
```

**What this proves:** `Path.glob(...)` finds the identical real files
— the same real pattern-matching capability, expressed as a method on
an existing `Path` object rather than a standalone function taking a
plain string path. Each result is itself a real `Path` object (not a
plain string, unlike `glob.glob`'s own return type), immediately usable
with every other pathlib method this file already covers (`.stat()`,
`.read_text()`).

**Mechanical note:** `glob.glob` predates `pathlib` and still appears
throughout real, existing code — genuinely equivalent for this common
case, differing mainly in whether the caller wants plain strings back
or real `Path` objects ready for further pathlib operations.

## A Real Further Fact: Comparing Paths as `Path` Objects, Not Raw Strings

Two path strings can refer to the exact same real location on disk
while being genuinely different as plain strings — different slash
direction, a trailing separator, redundant segments. Comparing paths
with plain `==` on strings is comparing *spelling*, not *location*.

```python
import os
from pathlib import Path

joined = os.path.join("a", "b", "file.txt")
manual = "a/b/file.txt"
print("os.path.join result:", repr(joined))
print("manual forward-slash string:", repr(manual))
print("raw strings equal:", joined == manual)
print("Path objects equal:", Path(joined) == Path(manual))

trailing = "a/b/"
no_trailing = "a/b"
print()
print("trailing-slash string:", repr(trailing))
print("no-trailing-slash string:", repr(no_trailing))
print("raw strings equal:", trailing == no_trailing)
print("Path objects equal:", Path(trailing) == Path(no_trailing))
```

**Real output, run this session (Windows):**
```
os.path.join result: 'a\\b\\file.txt'
manual forward-slash string: 'a/b/file.txt'
raw strings equal: False
Path objects equal: True

trailing-slash string: 'a/b/'
no-trailing-slash string: 'a/b'
raw strings equal: False
Path objects equal: True
```

**What this proves:** `os.path.join` on this real Windows session
produced backslash-separated `'a\\b\\file.txt'`, genuinely different
as a plain string from the forward-slash `'a/b/file.txt'` — real
strings comparing unequal even though both spellings name the exact
same real file. Wrapped in `Path(...)`, both parse into an equivalent
internal representation and compare equal. The identical real gap
shows up for a trailing separator: `'a/b/'` and `'a/b'` are unequal
strings but genuinely the same real location once each is parsed into
a `Path`.

**Mechanical note — why this matters most in cross-platform test
code:** a test asserting a widget's own reported path equals an
expected `str(tmp_path)` can genuinely fail on one real OS and pass on
another purely from separator-style differences a raw string
comparison is sensitive to but the real underlying *location* isn't.
Wrapping both sides in `Path(...)` before comparing (`Path(actual) ==
Path(expected)`) compares what actually matters — the real path each
string names — rather than its exact incidental spelling.

**The real, honest limit:** `Path` equality still compares the path's
own *textual* structure after parsing, not the real filesystem entity
it points to — `Path("a/b")` and `Path("a/./b")` are not guaranteed
equal on every platform without an explicit `.resolve()` first, and two
genuinely different real paths (a file and a hard link, or a symlink
and its target) can point at the same real data on disk while still
comparing unequal as `Path` objects. `Path` equality fixes spelling-
level false negatives; it doesn't verify two paths reach the identical
real inode.

### Try It Yourself (path equality)

1. Compare `Path("a/b")` against `Path("a/./b")` directly and confirm
   whether they're equal *without* calling `.resolve()` first — then
   call `.resolve()` on each and compare again, reasoning about what
   changed.
2. Construct two path strings that differ only in letter case (on a
   platform where filenames are case-insensitive) and check whether
   plain `Path` equality treats them as equal — research whether this
   matches your own real OS's actual filesystem behavior.
3. Find a real assertion in this project's own test suite that
   compares a path this way (`Path(x) == Path(y)` rather than
   `x == y`) and identify what real, cross-platform failure it was
   written to avoid.

## A Real Fifth Fact: `os.walk` — Recursively Listing an Entire Directory Tree

Every file-finding technique shown so far (`glob.glob`/`Path.glob`)
matches files by a **pattern** in one call. A real, different need —
listing *every* file in a whole directory tree, regardless of name,
so each one can be examined individually — calls for `os.walk`
instead.

```python
import os
import tempfile

root = tempfile.mkdtemp()
os.makedirs(os.path.join(root, "sub"))
with open(os.path.join(root, "a.nc"), "w") as f:
    f.write("G00\n")
with open(os.path.join(root, "sub", "b.nc"), "w") as f:
    f.write("G01\n")

files = {}
for dirpath, dirnames, filenames in os.walk(root):
    print("dirpath:", os.path.relpath(dirpath, root), "dirnames:", dirnames, "filenames:", filenames)
    for name in filenames:
        abs_path = os.path.join(dirpath, name)
        rel_path = os.path.relpath(abs_path, root).replace(os.sep, "/")
        files[rel_path] = abs_path

print("collected relative paths:", sorted(files))
```

**Real output, run this session:**
```
dirpath: . dirnames: ['sub'] filenames: ['a.nc']
dirpath: sub dirnames: [] filenames: ['b.nc']
collected relative paths: ['a.nc', 'sub/b.nc']
```

**What this proves:** `os.walk(root)` genuinely visited **both**
real directories in the tree — `root` itself and its `sub`
subdirectory — yielding one real `(dirpath, dirnames, filenames)`
tuple per directory, with no pattern involved anywhere; every file at
every depth shows up, one directory at a time. `os.path.relpath(...)
.replace(os.sep, "/")` then normalizes each absolute path into a
forward-slash relative path, so `"sub/b.nc"` is the identical real
string regardless of which OS the code runs on — the exact separator-
normalization concern this file's own fourth fact (`Path` equality)
already raised, solved here a second, different way: forcing one
canonical separator explicitly, rather than wrapping in `Path`,
because the result needs to work as an ordinary `dict` key and a
plain, displayable string, not stay a `Path` object.

**Mechanical note — why `os.walk` over `Path.glob("**/*")`:** `Path`
does offer a recursive glob (`rglob`/`glob("**/*")`) that could return
every file too — the real, practical reason to reach for `os.walk`
here instead is that it hands back **both** the current directory's
own files and its subdirectory names at each step, in one real tuple,
which is exactly the shape needed to build a full relative-path map
one directory at a time; a recursive glob returns a flat list of
matched paths with no equivalent per-directory grouping.

### Try It Yourself (fifth fact)

1. Add a third, deeper subdirectory (`sub/deeper/`) with its own file,
   and confirm `os.walk` visits it too, with the correct nested
   `dirnames` reported at each level along the way.
2. Compare the real output of `os.walk` against `list(Path(root).
   rglob("*"))` on the identical tree — reasoning about which form is
   easier to turn into a `{relative_path: absolute_path}` dict directly.
3. Modify the loop to skip an entire subdirectory by clearing
   `dirnames` in place (`dirnames.clear()`) when its name matches some
   condition — research why `os.walk` specifically supports **pruning**
   this way (mutating the yielded `dirnames` list in place before the
   next iteration), something a flat glob result has no equivalent
   mechanism for.

## A Real Sixth Fact: Comparing Files for Equality Doesn't Need to Decode Them At All

This file's own opening example already shows `UnicodeDecodeError` as a
real, correctly-raised failure when a file's bytes don't match the
encoding a strict read assumes. A real, different situation — checking
whether two files are the *same* — doesn't need to decode either one
at all, and decoding when it isn't needed only creates a real, false
failure mode.

```python
import tempfile
import os

folder = tempfile.mkdtemp()
path = os.path.join(folder, "weird.nc")
with open(path, "wb") as f:
    f.write(b"G00 X0 (\xe9\xe8 comment)\n")

# A strict decode genuinely fails on this real file -- 0xe9/0xe8 aren't
# valid UTF-8 continuation bytes here.
try:
    with open(path, encoding="utf-8") as f:
        f.read()
except UnicodeDecodeError as e:
    print("strict decode raised UnicodeDecodeError:", e)

# Byte comparison never needs to decode anything at all.
with open(path, "rb") as f:
    raw_a = f.read()
with open(path, "rb") as f:
    raw_b = f.read()
print("raw bytes equal:", raw_a == raw_b)
```

**Real output, run this session:**
```
strict decode raised UnicodeDecodeError: 'utf-8' codec can't decode byte 0xe9 in position 8: invalid continuation byte
raw bytes equal: True
```

**What this proves:** the identical real file, read strictly as UTF-8
text, genuinely fails — this file's bytes simply aren't valid UTF-8 (a
Latin-1 comment from a real machine control, for instance). Read as
raw `bytes` instead (`"rb"` mode, no `encoding=` at all), the exact
same file compares equal to itself with zero errors — byte equality
never needed to know or care what encoding the content was supposed to
be in, because two files with identical bytes are equal regardless of
how those bytes would decode.

**A real, different situation — text processing (not just equality)
genuinely needs decoded text:**

```python
text = raw_a.decode("utf-8", errors="replace")
print("lossy-decoded text:", text.encode("unicode_escape"))
```

**Real output, run this session:**
```
lossy-decoded text: b'G00 X0 (\\ufffd\\ufffd comment)\\n'
```

**What this proves:** `errors="replace"` genuinely never raises —
each real invalid byte (`0xe9`, `0xe8`) becomes the Unicode
replacement character (`�`) instead of stopping the whole decode.
Critically, every plain-ASCII structural character in the line —
`G`, `0`, `0`, space, `X`, `(`, `)` — survives completely untouched;
only the two genuinely invalid bytes were replaced. A real caller that
only inspects ASCII structural characters (skipping spaces, finding
`(`/`)` comment delimiters) gets fully correct results from this lossy
decode, even though the decode itself was never "correct" in any
strict sense.

**Mechanical note — why both techniques matter together, not just
one:** raw byte comparison is strictly better than any decode for pure
equality — it can never raise, and it's the actual real, ground-truth
question ("are these files identical") without any encoding
assumption in the way at all. `errors="replace"` matters for a
genuinely different real need: code that has to *look inside* the
text (find a comment, strip whitespace) still needs a `str`, but can't
afford a strict decode's real risk of crashing on a file whose exact
encoding isn't reliably known — replacing only the specific invalid
bytes, rather than aborting the whole read, keeps that inspection
working correctly as long as it only depends on the parts of the text
that decode was never in doubt about.

### Try It Yourself (sixth fact)

1. Change one of the two `0xe9`/`0xe8` bytes in one copy of the file
   and confirm raw byte comparison correctly reports the two files as
   **different** — real, direct proof this technique still correctly
   detects genuine differences, not just avoiding decode errors.
2. Try `errors="ignore"` instead of `errors="replace"` on the same raw
   bytes, and compare the resulting string's length against the
   original — reasoning about why silently *dropping* invalid bytes
   (`"ignore"`) is a real, different (and, for anything measuring
   position or length, more dangerous) choice than replacing each one
   with a single visible placeholder character (`"replace"`).
3. Write a function that needs to find `(`-delimited comments in a
   real file of unknown, possibly-mixed encoding, using
   `errors="replace"` — then construct a real, adversarial input where
   a multi-byte invalid sequence, if merely *dropped* instead of
   replaced, would corrupt the apparent position of a real `)` later
   in the line — concrete, real proof of why `"replace"`'s
   one-byte-in-one-placeholder-out behavior specifically matters for
   position-sensitive text processing, not just readability.

### Try It Yourself (fourth facet)

1. Use `folder.glob("**/*.json")` (a recursive pattern) to find
   `.json` files in real, nested subfolders too — confirming
   `Path.glob`'s own `**` support, which `glob.glob` also has via a
   real `recursive=True` argument.
2. Chain a `Path.glob(...)` result directly into `.stat()` on each
   match — confirming the returned `Path` objects need no conversion
   before using this file's own third facet on them.
3. Compare sorting behavior: neither `glob.glob` nor `Path.glob`
   guarantees any particular real order — confirm this directly by
   checking whether the raw, unsorted result order matches the
   filesystem's own real directory order, and reason about why
   real code almost always wraps the result in `sorted(...)`.
