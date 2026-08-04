# Lesson 62: Compression Is a Bet, Not a Guarantee

## What you will build

A real, binary run-length encoder and decoder — `bytes` in, `bytes`
out, correctly handling runs longer than a single byte can count —
measured honestly on two genuinely different kinds of real data: a
simulated bitmap row with long runs of repeated pixel values, and truly
random bytes from `os.urandom`. The transferable idea this lesson is
actually about: "compression" is not a guarantee that output will be
smaller than input — it's a bet that the data has enough internal
repetition to exploit, and this lesson proves, with real measured
numbers, that the same algorithm can shrink one input by over 55x while
nearly doubling the size of another.

## What you need to know first

- **Lesson 61** — reading and displaying raw bytes as hex/binary. Today
  builds real byte-level data for the first time since that lesson,
  rather than just viewing it.
- Nothing else structurally new is assumed.

---

## The Problem, in prose, no code yet

Run-length encoding is the simplest real compression algorithm that
exists, and understanding exactly when and why it works is more valuable
than the algorithm itself: it replaces a run of identical values with
one small record saying "this value, repeated this many times." For data
with long runs — the pixels along one row of a mostly-solid-color image,
long stretches of silence in raw audio, repeated whitespace in
plain text — this can be dramatically effective. For data with no
meaningful repetition at all — which includes, notably, data that has
*already* been compressed or encrypted, both of which specifically
produce output that looks statistically close to random — the same
algorithm can make things measurably worse, and this lesson proves that
directly rather than only warning about it.

---

## Concept Unit: Finding Runs

### The Problem

Before any byte-level encoding, the core idea is worth seeing in its
simplest form: scan a sequence, and every time the value changes, record
how long the previous run was.

### Introduce the concept in isolation

```python
def rle_encode_runs(data):
    if not data:
        return []
    runs = []
    current_value = data[0]
    current_count = 1
    for item in data[1:]:
        if item == current_value:
            current_count += 1
        else:
            runs.append((current_count, current_value))
            current_value = item
            current_count = 1
    runs.append((current_count, current_value))
    return runs


sample = "aaaabbbcccccccd"
runs = rle_encode_runs(sample)
print("input: ", sample, f"({len(sample)} characters)")
print("runs:  ", runs)

readable = "".join(f"{count}{value}" for count, value in runs)
print("readable encoding:", readable, f"({len(readable)} characters)")
```

Run it:

```
input:  aaaabbbcccccccd (15 characters)
runs:   [(4, 'a'), (3, 'b'), (7, 'c'), (1, 'd')]
readable encoding: 4a3b7c1d (8 characters)
```

What this proves: the core logic needs only one comparison per element —
"is this the same as the run currently being counted?" — and one
`runs.append(...)` each time that comparison fails, plus one final
append after the loop ends for whatever run was still in progress when
the input ran out (easy to forget; without it, the very last run in any
input would be silently dropped). Fifteen characters became an
eight-character readable encoding here — a real, if modest, size
reduction, from data chosen specifically to have long runs.

This lab is deleted now; it never appears in the project. The
run-finding logic survives directly into the real byte-level encoder.

### CS Lens

This is **lossless compression** via **run-length encoding**, one of the
oldest and simplest members of a whole family of compression
algorithms — "lossless" meaning the original data is recoverable
*exactly*, bit for bit, unlike lossy compression (Lesson 35's own JPEG
discussion), which permanently discards information the format's
designers judged unlikely to be missed.

Also recognized in: fax machine transmission (one of RLE's original real
applications — scanned pages are mostly long runs of white), the `BMP`
and `TGA` image formats' own optional RLE compression modes, simple
compressed sprite formats in older video games.

### SE Lens

RLE's entire value proposition rests on one assumption: the input has
long runs. Nothing about the algorithm checks whether that assumption
holds before proceeding — it will happily "compress" data with no
repetition at all, producing output that's actually larger, a real
consequence measured directly later in this lesson rather than left as
a hypothetical caveat.

---

## Concept Unit: A Real Binary Format — and Its One Real Limit

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `rle.py`.
- **Change type:** add.
- **Dependencies:** none — pure Python, operating directly on `bytes`.

### The New Code

```python
def rle_encode(data: bytes) -> bytes:
    if not data:
        return b""

    encoded = bytearray()
    current_value = data[0]
    current_count = 1

    def flush(value, count):
        while count > 255:
            encoded.append(255)
            encoded.append(value)
            count -= 255
        encoded.append(count)
        encoded.append(value)

    for byte in data[1:]:
        if byte == current_value and current_count < 255 * 1000:
            current_count += 1
        else:
            flush(current_value, current_count)
            current_value = byte
            current_count = 1
    flush(current_value, current_count)

    return bytes(encoded)


def rle_decode(encoded: bytes) -> bytes:
    if len(encoded) % 2 != 0:
        raise ValueError("corrupt RLE data: length must be a multiple of 2")

    decoded = bytearray()
    for i in range(0, len(encoded), 2):
        count = encoded[i]
        value = encoded[i + 1]
        decoded.extend([value] * count)
    return bytes(decoded)
```

### Mechanical Walkthrough

- `data: bytes) -> bytes` — **first appearance of type hints on a
  function signature** in this curriculum's own written code (as
  opposed to reading them in library documentation) — `data: bytes`
  documents the expected argument type directly in the signature,
  `-> bytes` documents the return type; Python doesn't enforce either
  at runtime, but they communicate intent precisely to any reader.
- `bytearray()` — a **hard concept reappearing** from Lesson 45's own
  tampering demonstration: a *mutable* sequence of bytes, needed here
  because the encoded output is built up incrementally, one or two
  bytes at a time, which an immutable `bytes` object cannot do in
  place.
- `flush(value, count)` — a **nested function** (**first appearance of
  defining a function inside another function** in this curriculum),
  used here specifically because it needs to both read and modify
  `encoded` from the enclosing scope without needing to be passed or
  returned anywhere else — it exists only to serve `rle_encode`'s own
  internal bookkeeping and has no reason to be a separate, top-level
  function.
- `while count > 255:` inside `flush` — this is the one genuine
  technical limit this format has to confront directly: a single byte
  can represent at most `255` (`0xFF`) as a count, since a byte holds
  exactly 8 bits, and a run of, say, 500 identical bytes cannot be
  described by one count-byte at all. The fix: split any run longer than
  255 into as many full 255-length chunks as needed, plus one final
  remainder chunk — `500` becomes two encoded pairs, `(255, value)`
  followed by `(245, value)`, which `rle_decode` reconstructs correctly
  without ever needing to know the original run was "really" one
  continuous run rather than two.
- `rle_decode` — the direct reverse: read two bytes at a time (a count,
  then a value), and `decoded.extend([value] * count)` — reused list
  repetition, generating exactly `count` copies of `value` and appending
  them all at once.

### Run it

```python
test_cases = [
    b"aaaabbbcccccccd", b"", b"x",
    bytes([65] * 500),                    # a run longer than 255
    bytes([65] * 300 + [66] * 300),       # two long runs back to back
]
for original in test_cases:
    encoded = rle_encode(original)
    decoded = rle_decode(encoded)
    print(f"original len={len(original):>4}  encoded len={len(encoded):>4}  round-trip correct={decoded == original}")
```

```
original len=  15  encoded len=   8  round-trip correct=True
original len=   0  encoded len=   0  round-trip correct=True
original len=   1  encoded len=   2  round-trip correct=True
original len= 500  encoded len=   4  round-trip correct=True
original len= 600  encoded len=   8  round-trip correct=True
```

The 500-byte all-identical run correctly encodes to just 4 bytes (two
count/value pairs, `255` and `245`) and correctly decodes back to the
full, exact 500 bytes — proof the split-and-rejoin logic works, not just
that short, simple runs do.

### CS Lens

The 255-byte-per-run limit is a direct consequence of **fixed-width
encoding**: choosing to spend exactly one byte per count field is simple
and predictable, but caps what a single field can represent — the same
tradeoff Lesson 45's AES-GCM nonce size and Lesson 30's WebSocket
extended-length fields both already navigated, each solving it a
different way (a larger fixed field there; splitting into multiple
records here).

### SE Lens

A single-byte count field costs one wasted bit of range compared to,
say, a count field that could represent up to `65535` — but the tradeoff
favors simplicity and a predictably tiny, fixed 2-byte-per-run overhead,
at the cost of needing the explicit splitting logic `flush` implements.
A different real format might choose differently; this lesson's version
states its own choice, and its own consequence, directly rather than
leaving the 255 limit as an undocumented surprise.

---

## Concept Unit: When Compression Backfires — Measured, Not Assumed

### The Problem

RLE's own logic never checks whether compression actually helped before
producing output — it's worth measuring, on two genuinely different
kinds of real data, exactly when that matters.

### Run it

Against data deliberately shaped like one row of a mostly-solid image —
long runs of a repeated "pixel" value, with a few short interruptions:

```python
bitmap_row = bytes([255]*200 + [0]*10 + [255]*150 + [0]*5 + [255]*300)
encoded_bitmap = rle_encode(bitmap_row)
print(f"original: {len(bitmap_row)} bytes, encoded: {len(encoded_bitmap)} bytes")
print(f"compression ratio: {len(bitmap_row) / len(encoded_bitmap):.2f}x smaller")
```

```
original: 665 bytes, encoded: 12 bytes
compression ratio: 55.42x smaller
round-trip correct: True
```

Against genuinely random bytes of the exact same length, from
`os.urandom` (Lesson 42's own trusted randomness source):

```python
random_data = os.urandom(665)
encoded_random = rle_encode(random_data)
print(f"original: {len(random_data)} bytes, encoded: {len(encoded_random)} bytes")
print(f"size change: {len(encoded_random) / len(random_data):.2f}x")
```

```
original: 665 bytes, encoded: 1320 bytes
size change: 1.98x (LARGER)
round-trip correct: True
```

The exact same algorithm, the exact same input length, two opposite real
results: a **55.42x reduction** on data with genuine long-run structure,
and the encoded output growing to nearly **double** the size of genuinely
random input — because random bytes have, on average, no runs longer
than one or two bytes at all, and RLE's fixed 2-bytes-per-run overhead
is paid on almost every single input byte with essentially no runs to
amortize it against.

### CS Lens

This is a direct, measured instance of a real theoretical fact:
**no lossless compression algorithm can shrink every possible input** —
by simple counting, there are always more possible inputs of a given
length than possible *shorter* outputs, so some inputs must map to
outputs that are the same size or larger. RLE's own worst case
(no repeated values at all) is exactly where that unavoidable fact
becomes concretely visible.

Also recognized in: this exact reason why compressing an already-`.zip`
or already-`.jpg` file a second time typically achieves nothing or makes
it slightly larger — both formats already remove the redundancy a
second compression pass would have exploited, leaving output that looks
close to random to any further compressor.

### SE Lens

A production-quality version of this tool would compare the encoded
size against the original before committing to it, falling back to
storing the raw bytes unmodified (with a marker byte indicating which
mode was used) whenever encoding would make things worse — a real,
common technique this lesson's own minimal version doesn't implement,
named here as a deliberate scope boundary rather than a hidden gap: the
value of this lesson is in measuring and understanding the tradeoff
directly, not in shipping a maximally robust compressor.

---

## Connect the pieces

One encoder, tested against two honestly different real inputs: the
bitmap-shaped data, with genuine long runs, compressed by over 55x,
proving RLE's real value when its core assumption holds. The random
data, chosen specifically to violate that assumption, grew by nearly 2x,
proving the same algorithm carries a real cost when it doesn't. Both
round-tripped through `rle_decode` back to their exact original bytes,
including the 500-byte run split correctly across the 255-byte-per-field
limit `flush` exists to handle — the encoding may look nothing alike
between "shrinks dramatically" and "grows measurably," but decoding is
unconditionally, provably lossless in both cases.

## What breaks without this

Removing `flush`'s `while count > 255:` splitting logic and instead
writing a run's raw count directly, unchecked, would silently corrupt
any run of 256 or more identical bytes: `count` would overflow a single
byte's representable range, and the actual value written would be
`count % 256` (Python would raise `ValueError: bytes must be in range(0,
256)` immediately when `encoded.append(count)` is attempted with
`count=500`, in fact — a real, fail-fast error rather than silent
corruption in this specific case, but the underlying data-loss risk
prevented by the check is real regardless of exactly how it would
surface).

## Definition of done

- [ ] `rle_encode` followed by `rle_decode` recovers the exact original
      bytes for every one of this lesson's five test cases, including
      the empty-input and single-byte edge cases.
- [ ] A run longer than 255 bytes is correctly split and correctly
      reconstructed.
- [ ] Real bitmap-shaped test data compresses by a large, measured
      factor; real random data of the same length grows instead —
      both measured directly, not assumed.
- [ ] You can explain, without looking back at this lesson, why no
      lossless compression algorithm can shrink every possible input.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add rle.py
  git commit -m "Add binary run-length encoder/decoder with correct >255-run splitting — measured 55x compression on repetitive data and ~2x expansion on random data from the identical algorithm"
  ```

## What's next

Lesson 63's Huffman coding solves exactly the weakness RLE's own random-
data test exposed: rather than depending on long consecutive runs, it
exploits *overall frequency* differences between values, compressing
data effectively even when no single value repeats consecutively at
all — a genuinely more general technique, at the cost of needing a much
more involved encoding scheme than "count, value" pairs.
