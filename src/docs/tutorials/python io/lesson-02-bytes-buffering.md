# Lesson 2: Bytes, Text, and What Buffering Actually Buys You

**What you will build:** a `file_checksum` function added to `recordkeeper`
that hashes a file's contents in fixed-size chunks, read in binary mode —
the first piece of `recordkeeper` that needs raw bytes, not decoded text.
The transferable problem: what "binary mode" actually skips compared to
text mode, and what a buffered stream is really doing between your
`.read()` call and the operating system, proven by building a tiny
buffered reader ourselves and counting real reads through it.

**What you need to know first:** Lesson 1 — `open()`, the `with`
statement / context manager protocol, and streaming line-by-line
iteration over a file object.

**Terms used in this lesson**

- **Binary mode** — opening a file so reads/writes hand back and accept
  raw `bytes` instead of decoded `str`. It exists because not every file
  is text at all (images, compiled binaries, checksums of arbitrary
  data), and even for genuinely text-shaped files, some operations —
  hashing, copying byte-for-byte — need the exact original bytes with no
  encoding/decoding step in between.
- **Buffering** — an intermediate layer that batches many small logical
  reads into fewer, larger real reads against the operating system. Same
  definition as Lesson 1, restated in full here: it exists because each
  real read has a fixed cost regardless of size, so batching amortizes
  that cost across many small requests instead of paying it per request.

**Objects and methods used**

- **`bytes`**
  - *What it is:* An immutable sequence of raw byte values (0-255),
    Python's type for data with no text encoding applied.
  - *Implementation:* Indexing a `bytes` object yields `int`s, not
    single-character strings; `bytes` objects print with a `b` prefix.
  - *Its use:* What binary-mode reads hand back, and what `hashlib`'s
    hash objects consume.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    builtin immutable sequence type; responsible for holding raw byte
    data with no assumptions about what it represents; depends on
    nothing to exist; produced by binary-mode file reads and consumed
    by `hashlib.sha256().update(...)` in this lesson; shape is a flat
    sequence of byte values, never nested.

- **`hashlib.sha256`**
  - *What it is:* A constructor for a running SHA-256 hash object from
    the standard library's `hashlib` module.
  - *Implementation:* `hashlib.sha256() -> a hash object` with
    `.update(bytes)` (feed more data in, any number of times) and
    `.hexdigest() -> str` (get the current hash as a hex string).
  - *Its use:* Lets `file_checksum` hash a file without ever holding the
    whole file in memory — each chunk is fed in and then can be
    discarded.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    factory function returning a stateful hash object; responsible for
    accumulating a running cryptographic digest across however many
    `.update()` calls it receives, in order; depends only on the bytes
    handed to `.update()`; called once to create the object, then
    `.update()` is called once per chunk inside `file_checksum`'s loop,
    then `.hexdigest()` once at the end; shape in, shape out: takes
    `bytes` per call, returns one fixed-length hex `str` at the end
    regardless of how much data went in.

- **`io.RawIOBase` / `io.BufferedReader`** *(lab-only, not in the
  project)*
  - *What they are:* `io.RawIOBase` is the standard library's base
    class for an unbuffered byte stream; `io.BufferedReader` is the
    standard library's own buffering layer that wraps a raw stream.
  - *Implementation:* Subclassing `RawIOBase` and overriding
    `readinto(self, b)` lets a custom object stand in anywhere Python
    expects a raw stream; `BufferedReader(raw, buffer_size=...)` wraps
    any such raw object and exposes the same `.read(n)` interface, but
    batches its calls to the wrapped raw object's `readinto`.
  - *Its use:* Used only in this lesson's lab, as a counting wrapper, to
    make buffering's real effect on the number of underlying reads
    directly observable.

---

## Concept Unit: Binary mode

### The Problem

Lesson 1's `open(path, "r", encoding="utf-8")` decodes bytes into `str`
on every read. That's exactly right for a log file. It's the wrong tool
the moment the goal isn't "read this as characters" but "get me the
exact bytes, unchanged" — which is exactly what hashing a file for
integrity-checking needs: a decode/re-encode round trip risks changing
the very bytes being hashed.

> **Stop and think:** Lesson 1 showed that opening a file with the wrong
> `encoding` could raise an error or silently produce wrong-looking
> text. If a file is opened with *no* encoding involved at all — mode
> `"rb"` instead of `"r"` — what do you expect `.read()` to hand back
> instead of a `str`, and why would that sidestep the encoding-mismatch
> problem entirely rather than just choosing a "safer" encoding?

### Introduce the concept in isolation

```python
with open("scratch_binary.txt", "w", encoding="utf-8") as f:
    f.write("café\n")

with open("scratch_binary.txt", "rb") as f:
    raw = f.read()
print("binary read ->", type(raw), raw)

with open("scratch_binary.txt", "r", encoding="utf-8") as f:
    text = f.read()
print("text read   ->", type(text), repr(text))

print("manual decode of the raw bytes:", repr(raw.decode("utf-8")))
```

Real output:

```
binary read -> <class 'bytes'> b'caf\xc3\xa9\n'
text read   -> <class 'str'> 'café\n'
manual decode of the raw bytes: 'café\n'
```

The same five characters (`café\n`) are, on disk, six raw bytes — `é`
alone is `\xc3\xa9`, two bytes, because UTF-8 encodes any character
outside plain ASCII using more than one byte. Binary mode hands back
exactly those six bytes with no interpretation applied at all; text
mode is doing the same UTF-8 decoding job Lesson 1 named explicitly,
just automatically. Calling `.decode("utf-8")` on the raw bytes by hand
produces the identical string text mode gave for free — proving text
mode isn't a different read, it's the same bytes plus one extra,
automatic step.

### Discard the throwaway example

`scratch_binary.txt` and this lab are discarded; they exist only to
show the same on-disk bytes read two ways.

### Project Change

- **Reference Source** — none; from-scratch, as in Lesson 1.
- **Files affected** — new file `recordkeeper/ingest/checksum.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `hashlib`, standard library.

### The New Code

```python
def file_checksum(path, chunk_size=65536):
    digest = hashlib.sha256()
    with open(path, "rb") as f:
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`hashlib.sha256()`** — full treatment above (Objects and methods
  used); called with no arguments, returning a fresh hash object with
  no data accumulated yet.
- **`digest = ...`** — binds that hash object to the name `digest`,
  which the rest of the function will call `.update()` on repeatedly.
- **`open(path, "rb")`** — the same `open` builtin from Lesson 1, this
  time with mode `"rb"` — binary, read-only — and no `encoding`
  argument at all, because binary mode never decodes anything, so an
  encoding would be meaningless here.
- **`as f`, `with ... :`** — the same context manager protocol from
  Lesson 1, guaranteeing this file's connection closes when the block
  ends.

### CS lens

Choosing binary vs. text mode is choosing between two layers of the
same **abstraction stack**: raw bytes are the actual, physical
on-disk representation; decoded text is a higher-level view built on
top of an explicit, agreed-upon encoding. Picking the right layer for
the job at hand — bytes for hashing, text for line-oriented logs — is
the same judgment call as picking between a raw socket and an HTTP
client library, or between a compiled machine-code view of a program
and its source.

```
Also recognized in: image libraries exposing both raw pixel bytes and
decoded high-level objects, network programming choosing between raw
sockets and a text-based protocol layered on top, databases storing
BLOBs (raw bytes) alongside typed text columns
```

### SE lens

The alternative not chosen is hashing the *decoded* text
(`text.encode("utf-8")`, then hash that). For a file already known to
be valid UTF-8 text, this would often produce the same hash — but it
silently assumes the file decodes cleanly at all, and it re-encodes
using whatever encoding the *reading* program chose, not necessarily
the file's own original bytes if there's ever any encoding ambiguity.
Hashing the raw bytes directly removes that assumption entirely: it
works identically whether the file is a text log or a binary image,
and it can never disagree with the file's actual on-disk content. The
cost is that `file_checksum` can never inspect the content as text
along the way — it doesn't need to, but a future feature that wanted
to do both would need two separate passes, or would need to hash a
decoded string, taking on the very assumption just avoided.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

Lesson 1's `open(..., encoding="utf-8")` is now visibly one specific
choice among the modes `open` supports; this unit's `"rb"` is the mode
that skips decoding entirely, which is what the next unit needs to
build on to talk about buffering in terms of raw bytes.

---

## Concept Unit: Buffering, and building a tiny one ourselves

### The Problem

Lesson 1 defined buffering in the abstract: batching many small reads
into fewer, larger real ones. Nothing so far has actually shown that
happening — every read in this curriculum so far has been small enough
that it wouldn't matter either way.

> **Stop and think:** If a program asks a file object for 100 bytes at
> a time, over and over, until a 50,000-byte file is exhausted, that's
> 500 separate `.read(100)` calls. If buffering is really batching
> requests behind the scenes, would you expect the *number of times the
> operating system is actually asked for data* to also be 500 — or
> something smaller? What would "smaller" even mean here?

### Introduce the concept in isolation

```python
class CountingRawFile(io.RawIOBase):
    """Wraps a real unbuffered file and counts every real read that reaches it."""
    def __init__(self, path):
        self._f = open(path, "rb", buffering=0)
        self.raw_read_calls = 0
    def readinto(self, b):
        self.raw_read_calls += 1
        data = self._f.read(len(b))
        n = len(data)
        b[:n] = data
        return n
    def readable(self):
        return True

def drain_in_small_pieces(stream, piece_size=100):
    caller_calls = 0
    total = 0
    while True:
        chunk = stream.read(piece_size)
        caller_calls += 1
        if not chunk:
            break
        total += len(chunk)
    return caller_calls, total

# straight against the raw, unbuffered file:
raw_direct = CountingRawFile("scratch_buffer.bin")
calls, total = drain_in_small_pieces(raw_direct, 100)
print(f"caller calls: {calls}, real raw reads: {raw_direct.raw_read_calls}")

# through io.BufferedReader:
raw_for_buffered = CountingRawFile("scratch_buffer.bin")
buffered = io.BufferedReader(raw_for_buffered, buffer_size=8192)
calls, total = drain_in_small_pieces(buffered, 100)
print(f"caller calls: {calls}, real raw reads: {raw_for_buffered.raw_read_calls}")
```

Real output (against a 50,000-byte file):

```
caller calls: 501, real raw reads: 501
caller calls: 501, real raw reads: 8
```

Same 501 calls from the caller's side, asking for 100 bytes each time,
both ways. Going straight against the unbuffered raw stream, every one
of those calls really does reach the underlying read — 501 real reads.
Going through `io.BufferedReader`, the caller still made 501 calls, but
only 8 of them actually reached the raw stream — `BufferedReader` pulled
large 8192-byte chunks a few times and served the caller's small
100-byte requests out of that buffer in memory, only going back to the
raw stream when the buffer ran dry. This is a **buffered stream**, named
here for the first time: a layer sitting between the caller and a raw
resource, absorbing many small requests into few large ones.

Building the same idea by hand, without `io.BufferedReader` at all:

```python
class TinyBufferedReader:
    def __init__(self, raw, buffer_size=8192):
        self._raw = raw
        self._buffer_size = buffer_size
        self._buffer = b""
    def read(self, n):
        while len(self._buffer) < n:
            chunk = self._raw.read(self._buffer_size)
            if not chunk:
                break
            self._buffer += chunk
        result, self._buffer = self._buffer[:n], self._buffer[n:]
        return result

raw_for_tiny = CountingRawFile("scratch_buffer.bin")
tiny = TinyBufferedReader(raw_for_tiny, buffer_size=8192)
calls, total = drain_in_small_pieces(tiny, 100)
print(f"caller calls: {calls}, real raw reads: {raw_for_tiny.raw_read_calls}")
```

Real output:

```
caller calls: 501, real raw reads: 8
```

Identical to `io.BufferedReader`'s own result: 8 real reads. `TinyBufferedReader`
does this with nothing exotic — an internal `bytes` buffer, a `while`
loop that tops it up from the raw stream whenever it's too small to
satisfy the current request, and slicing off exactly `n` bytes to hand
back. This *is*, mechanically, what `io.BufferedReader` is doing —
proven by matching its real, measured behavior exactly, not just
resembling it.

### Discard the throwaway example

`CountingRawFile`, `drain_in_small_pieces`, `TinyBufferedReader`, and
`scratch_buffer.bin` are all discarded — lab-only, to make buffering's
effect countable. `recordkeeper` keeps using the standard library's own
`open()`, which already buffers by default; there's no reason to
replace working, well-tested standard-library code with this lesson's
hand-rolled stand-in.

### Project Change

None — this unit adds no code to `recordkeeper`. `file_checksum`,
finished in the previous unit, already benefits from this: its
`f.read(chunk_size)` calls run through the exact same default buffering
just measured, with no code of its own needed to get it.

### Mechanical walkthrough

Already given in-line with the lab output above, since this unit's
"new code" is the lab itself rather than a project addition — the same
literal-enumeration treatment applies to `TinyBufferedReader.read`:

- **`while len(self._buffer) < n:`** — a loop condition, re-checked
  every pass: keep pulling more data in only while the buffer doesn't
  yet hold enough to satisfy the current request.
- **`self._raw.read(self._buffer_size)`** — pulls one real chunk from
  the wrapped raw stream, sized `buffer_size` (8192 here) regardless of
  how small `n` actually is — this is the batching itself.
- **`self._buffer += chunk`** — appends the newly read bytes onto
  whatever was already buffered from a previous call.
- **`result, self._buffer = self._buffer[:n], self._buffer[n:]`** —
  slices the first `n` bytes off to return, and keeps the remainder
  buffered for the *next* call to `read`, which is exactly why a later
  call can be satisfied with zero real raw reads if enough was already
  buffered.

### CS lens

This is the same **producer/consumer buffering** idea used anywhere a
fast or bursty consumer sits in front of a slower or fixed-cost
producer.

```
Also recognized in: video players buffering a few seconds ahead of
playback, TCP's own send/receive buffers, keyboard input buffers, print
spoolers batching jobs sent to a physical printer
```

### SE lens

The alternative not chosen for `recordkeeper` itself is: nothing,
because it's already the default. The real design decision this unit
surfaces is different — *when* to reach for `buffering=0` (unbuffered)
deliberately, which trades away this exact performance win. That trade
is worth making only when a caller needs to see data the instant it's
available (an interactive terminal, a pipe to another process expecting
immediate output) rather than after a buffer fills — a real cost
(more, smaller real reads/writes) accepted deliberately for a real
benefit (latency) that `recordkeeper`'s own batch-style file processing
never needs.

### Commands needed

None new.

### Run it

Shown above — real output, from actual runs.

### Connect

The previous unit chose binary mode so `file_checksum` gets exact
bytes; this unit shows that the `f.read(chunk_size)` loop inside it
isn't paying a real operating-system cost on every single chunk — the
same buffering `io.BufferedReader` provides by default, and just proven
to work exactly the way `TinyBufferedReader` mimics, is already running
underneath `open()`'s default binary mode with no extra code required.

---

## Connect the pieces

`recordkeeper.ingest.checksum.file_checksum` calls `open(path, "rb")`,
getting the exact same kind of buffered binary stream both labs in this
lesson just measured — binary, so the bytes it feeds to
`hashlib.sha256().update(...)` are the file's real, undecoded content;
buffered, so its `chunk_size=65536` read loop reaches the real
underlying file far less often than 65536-byte-sized calls alone would
suggest, for the same reason `TinyBufferedReader`'s 8 real reads served
501 small requests. Running it against both of Lesson 1's output
files:

```
db893069587cbd97fb04159f460493946cdf8ec716b077a3a6ce1f1166dc5a97
db893069587cbd97fb04159f460493946cdf8ec716b077a3a6ce1f1166dc5a97
```

Identical hashes — real, verified proof that `normalize_log`, back in
Lesson 1, produced output byte-for-byte equivalent to its input for
this particular file, not just "probably fine because it printed
correctly."
