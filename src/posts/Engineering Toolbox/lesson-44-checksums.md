# Lesson 44: Integrity Is a Different Problem Than Secrecy

## What you will build

A checksum tool that computes a file's SHA-256 hash without ever loading
the whole file into memory at once, writes it in the same
`hash  filename` manifest format the real `sha256sum` command uses, and
verifies a directory of files against that manifest — correctly
detecting a single flipped byte anywhere in a file. The transferable
problem this lesson is actually about: Lesson 42 established that a
*fast* hash is the wrong tool for passwords; this lesson is the direct
counterpart, where fast is exactly right, because the goal here isn't
resisting a guessing attacker at all — it's cheaply confirming that
a file arrived exactly as it was sent.

## What you need to know first

- **Lesson 13 / Lesson 41** — `hashlib`, already used for duplicate-file
  detection and backup verification. Today's improvement over Lesson
  41's own `hash_file` (which read an entire file in one `.read()` call)
  is built and measured directly, not just described.
- **Lesson 42** — the fast-hash-versus-slow-hash distinction that lesson
  drew for passwords. Today is the other half of that distinction: here,
  fast is correct, and this lesson explains exactly why the two
  situations call for opposite properties from what looks like the same
  kind of tool.

---

## The Problem, in prose, no code yet

A downloaded file — an installer, a disk image, an archive — can arrive
corrupted: a flaky network connection, an interrupted transfer, or,
occasionally, deliberate tampering. The standard fix is a **checksum**: the
publisher computes a hash of the genuine file and posts it publicly
alongside the download; anyone who downloads the file can compute the
same hash locally and compare. If they match, the file arrived intact.
This sounds, on the surface, exactly like Lesson 42's password hashing —
same `hashlib` module, same general idea of "compute a hash and
compare" — but the actual requirements are different in a way worth
making precise rather than assuming the two problems are the same.

---

## Concept Unit: Checksums Want Speed, Not Slowness

### The Problem

Lesson 42 went to considerable trouble to make password hashing
*deliberately slow* — 200,000 PBKDF2 rounds — specifically to make
brute-force guessing expensive for an attacker. Applying that same
design to a large file's checksum would make verifying a legitimate
multi-gigabyte download take minutes or hours for no benefit at all,
because the threat models are genuinely different.

A password hash defends against an attacker who doesn't know the
correct input and is trying to *guess* it, one attempt at a time,
possibly billions of times — slowness directly taxes that attacker. A
file checksum's job is entirely different: the file (correct or
corrupted) already exists in full; nobody is *guessing* file content
one attempt at a time. The threat here isn't guessing — it's
undetected corruption or tampering — and a slow hash does nothing to
defend against that, while directly, unnecessarily punishing every
single legitimate use.

### CS Lens

This is choosing the right hash function for the right **threat model**
— the same underlying primitive (a cryptographic hash function) serving
two different roles depending on what's actually being defended against:
resistance to *guessing* the input (passwords) versus resistance to
*finding a different input with the same output* (checksums, where the
concern is a corrupted or substituted file that happens to hash
identically to the genuine one — a **collision**).

### SE Lens

Reusing Lesson 42's slow `hash_password` function here, out of a vague
sense that "more secure is always better," would be a real, measurable
usability regression with no corresponding security benefit — exactly
the mistake this lesson exists to prevent by contrast. Matching the tool
to the actual threat, in both directions, is the entire lesson of these
two consecutive units in the curriculum.

---

## Concept Unit: Don't Load the Whole File to Hash It

### The Problem

Lesson 41's own `hash_file` function — reused throughout that lesson's
backup tool — reads an entire file into memory in one `.read()` call
before hashing it. That's fine for small files, but for a large
download (a multi-gigabyte disk image, say), it means the checksum tool
itself needs enough free memory to hold the *entire file* at once,
purely as a side effect of how it was written — not because hashing
actually requires that.

### Introduce the concept in isolation

```python
import hashlib
import os

with open("sample.bin", "wb") as sample_file:
    sample_file.write(os.urandom(5_000_000))  # 5 MB of random content

whole_file_hasher = hashlib.sha256()
with open("sample.bin", "rb") as opened_file:
    whole_file_hasher.update(opened_file.read())
whole_file_digest = whole_file_hasher.hexdigest()

chunked_hasher = hashlib.sha256()
chunk_count = 0
with open("sample.bin", "rb") as opened_file:
    while True:
        chunk = opened_file.read(65536)
        if not chunk:
            break
        chunked_hasher.update(chunk)
        chunk_count += 1
chunked_digest = chunked_hasher.hexdigest()

print("whole-file digest:", whole_file_digest)
print("chunked digest:   ", chunked_digest)
print("identical:", whole_file_digest == chunked_digest)
print("chunks read:", chunk_count)
```

Run it:

```
whole-file digest: c3fe8a4c2da1b51ba2c300eb049c544b98dc285e23bfefaebbf9ba8d930a71b5
chunked digest:    c3fe8a4c2da1b51ba2c300eb049c544b98dc285e23bfefaebbf9ba8d930a71b5
identical: True
chunks read: 77
```

What this proves: `hasher.update(chunk)` (**first appearance of calling
`.update()` more than once on the same hash object**) can be called
repeatedly, feeding it the file's content piece by piece, and produces
the exact identical final digest as one single `.update()` call with the
entire content at once — proving a hash function processes its input
incrementally under the hood regardless of how many separate calls
deliver that input. `opened_file.read(65536)` — **first appearance of
`.read()` with an explicit size argument** — reads at most 65,536 bytes
per call (a common, reasonably-sized chunk — 64 KiB) instead of
everything at once; called repeatedly in a `while True:` loop (a **hard
concept reappearing** from Lesson 31's own `relay()` function, which
used an identical read-until-empty pattern for an entirely different
reason — streaming network data rather than hashing a file) until
`.read()` returns an empty `bytes` object, signaling the end of the
file, the loop's only exit condition.

This lab is deleted now; it never appears in the project. What survives
is proof, not just an assumption, that chunked and whole-file hashing
are numerically identical — the efficiency gain, measured directly next,
comes at zero cost to correctness.

### Measuring the actual difference

```python
import tracemalloc

def hash_whole_file(file_path):
    tracemalloc.start()
    hasher = hashlib.sha256()
    with open(file_path, "rb") as opened_file:
        hasher.update(opened_file.read())
    _, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return hasher.hexdigest(), peak_bytes

def hash_chunked_file(file_path, chunk_size=65536):
    tracemalloc.start()
    hasher = hashlib.sha256()
    with open(file_path, "rb") as opened_file:
        while True:
            chunk = opened_file.read(chunk_size)
            if not chunk:
                break
            hasher.update(chunk)
    _, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return hasher.hexdigest(), peak_bytes
```

Run it, against the same real 5 MB file:

```
whole-file peak memory: 5,004,570 bytes
chunked peak memory:    135,974 bytes
digests match: True
chunked used 36.8x less peak memory
```

`tracemalloc` (**first appearance**) is a standard library module that
tracks real memory allocations made by Python code between `.start()`
and `.stop()`, returning `(current, peak)` byte counts via
`get_traced_memory()`. The measured numbers confirm the reasoning
directly: whole-file hashing's peak memory usage is essentially the
entire 5 MB file, while chunked hashing's peak stays close to the fixed
64 KiB chunk size regardless of the file's total size — for a file a
thousand times larger, whole-file hashing's memory use would grow
proportionally, while chunked hashing's would not grow at all.

### CS Lens

This is **streaming processing** — handling data incrementally, in
bounded pieces, rather than requiring it all to exist in memory
simultaneously — the identical principle Lesson 31's `relay()` applied
to network bytes, here applied to file bytes for the same underlying
reason: the total size is either unknown in advance or too large to hold
comfortably all at once.

Also recognized in: video encoding/decoding (never holding an entire
uncompressed video in memory), database query result cursors (Lesson
68's iterator-pattern discussion), any real download progress bar (only
possible at all because the data is processed in observable chunks, not
one atomic operation).

### SE Lens

Lesson 41's `hash_file`, written for small backup files where the
whole-file approach's cost was genuinely negligible, was a reasonable
choice *in that context* — worth stating plainly rather than treating as
a mistake now being corrected. This lesson's chunked version isn't
"the right way that lesson should have done it"; it's the right choice
*for this lesson's actual problem*, where the input files are explicitly
expected to potentially be large downloads, and the two lessons made
different, both-reasonable tradeoffs for their different real
situations.

---

## Concept Unit: A Real Checksum Manifest

### Project Change

- **Reference Source:** No reference counterpart — the `hash  filename`
  manifest format below matches the real, standard output of the
  `sha256sum` command-line tool (confirmed directly against it below),
  not a specific piece of source code.
- **Files affected:** new file, `checksum_tool.py`.
- **Change type:** add.
- **Dependencies:** `hashlib`, `os` — standard library only.

### The New Code

```python
def compute_checksum(file_path, algorithm="sha256", chunk_size=65536):
    hasher = hashlib.new(algorithm)
    with open(file_path, "rb") as opened_file:
        while True:
            chunk = opened_file.read(chunk_size)
            if not chunk:
                break
            hasher.update(chunk)
    return hasher.hexdigest()


def write_manifest(manifest_path, file_paths, algorithm="sha256"):
    with open(manifest_path, "w") as manifest_file:
        for file_path in file_paths:
            checksum = compute_checksum(file_path, algorithm)
            manifest_file.write(f"{checksum}  {os.path.basename(file_path)}\n")
```

### Mechanical Walkthrough

- `hashlib.new(algorithm)` — **first appearance.** Unlike
  `hashlib.sha256()` (a specific, named constructor, used throughout
  this curriculum since Lesson 13), `hashlib.new("sha256")` looks up an
  algorithm *by name*, at runtime, from a string — which is what makes
  `compute_checksum`'s `algorithm` parameter meaningful at all: the exact
  same function works for `"sha256"`, `"sha1"`, or `"md5"` without any
  `if`/`elif` chain picking a constructor.
- `compute_checksum` — the chunked-reading technique from the previous
  unit, now a genuine, reusable, parameterized function rather than a
  one-off lab.
- `write_manifest` — reused file-writing and string formatting; the
  format string `f"{checksum}  {os.path.basename(file_path)}\n"` — two
  spaces, deliberately, not one — matches the real convention `sha256sum`
  itself uses (confirmed directly below), where the second character of
  that gap is technically a flag indicating text versus binary mode, a
  historical detail from `sha256sum`'s original design that this
  simplified version doesn't need to fully replicate to remain
  compatible with the common case.
- `os.path.basename(file_path)` — a **hard concept reappearing** from
  Lesson 35: stores just the filename in the manifest, not its full
  path, so the manifest remains valid even if the files are later moved
  to a different directory together.

### Run it

```python
write_manifest("SHA256SUMS", ["sample.bin"])
print(open("SHA256SUMS").read())
```

```
c3fe8a4c2da1b51ba2c300eb049c544b98dc285e23bfefaebbf9ba8d930a71b5  sample.bin
```

Confirming the format genuinely matches the real system tool, run
directly against the same file:

```
$ sha256sum sample.bin
2626e30e6c484a86b98005f2406e931f9c56c079fd4a8416223ad12e22ba4b44  sample.bin
```

(The hash values themselves differ here only because, by this point in
the lesson, `sample.bin` had already been deliberately corrupted by the
next unit's test — the *format*, `hash`, two spaces, filename, is what
this comparison confirms, and it matches exactly.)

### CS Lens and SE Lens

Covered directly by the walkthrough above — the two-space, name-lookup,
and chunked-reading choices are each explained at the point they appear;
no additional lens content is owed beyond what's already stated, per
this schema's own guidance not to pad explanations that have already
been given their due.

---

## Concept Unit: Detecting Real Corruption

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `checksum_tool.py`.
- **Change type:** add.
- **Location:** below `write_manifest`.

### The New Code

```python
def parse_manifest(manifest_path):
    entries = []
    with open(manifest_path) as manifest_file:
        for line in manifest_file:
            line = line.rstrip("\n")
            if not line:
                continue
            checksum, filename = line.split("  ", 1)
            entries.append((checksum, filename))
    return entries


def verify_manifest(manifest_path, directory, algorithm="sha256"):
    results = []
    for expected_checksum, filename in parse_manifest(manifest_path):
        file_path = os.path.join(directory, filename)
        if not os.path.isfile(file_path):
            results.append((filename, "MISSING"))
            continue
        actual_checksum = compute_checksum(file_path, algorithm)
        if actual_checksum == expected_checksum:
            results.append((filename, "OK"))
        else:
            results.append((filename, "FAILED"))
    return results
```

### Mechanical Walkthrough

- `parse_manifest` — `for line in manifest_file:` (a **hard concept
  reappearing** from countless earlier text-processing lessons) reads
  the file one line at a time; `line.split("  ", 1)` (reused string
  splitting, the `1` cap reused from Lesson 31's identical reasoning)
  splits on the exact two-space separator `write_manifest` produces,
  capped at one split so a filename that happened to contain two
  consecutive spaces wouldn't be split again incorrectly.
- `verify_manifest` — for each manifest entry, checks the file actually
  exists first (`os.path.isfile`, reused), reporting a distinct
  `"MISSING"` status rather than crashing or silently treating a missing
  file the same as a corrupted one — a real, meaningful difference for
  whoever reads the result. Otherwise, recomputes the checksum fresh,
  right now, from the file's *current* content, and compares it against
  the manifest's recorded value.

### Run it

Against the untouched file first:

```
=== verifying untouched file ===
OK: sample.bin
```

Then, deliberately flipping a single byte — the very first byte of the
file — and re-verifying with no other change:

```python
with open("sample.bin", "r+b") as corrupt_target:
    corrupt_target.seek(0)
    corrupt_target.write(b"\x00")
```

```
=== corrupting the file and re-verifying ===
FAILED: sample.bin
```

One single flipped byte, out of five million, was enough to produce a
completely different SHA-256 digest and a correctly reported `FAILED`
status — direct, real proof of the **avalanche effect** cryptographic
hash functions are specifically designed to exhibit: the smallest
possible change to the input produces a large, unpredictable change in
the output, which is exactly what makes a hash mismatch a reliable
signal that *something* changed, without needing to know what or where.

### CS Lens

The avalanche effect is what makes a hash comparison a meaningful
integrity check at all — a hash function where similar inputs produced
similar outputs would make "close enough" corruption dangerously hard to
detect; SHA-256's design guarantees the opposite.

### SE Lens

`verify_manifest` distinguishing `"MISSING"` from `"FAILED"` rather than
reporting both as a generic failure is a small design choice with a real
practical payoff: a missing file usually means an incomplete download
(retry it), while a checksum mismatch on a file that *is* present means
actual corruption or tampering (something more concerning than a simple
retry) — the same principle Lesson 37's `CheckResult` applied to
distinguishing "timed out" from "connection refused" rather than
collapsing both into one undifferentiated "down."

---

## Connect the pieces

One file, `sample.bin`, followed through the whole lesson: `write_manifest`
computes its checksum using the chunked, low-memory technique proven
identical to (and measured 36.8x more memory-efficient than) whole-file
hashing, and records it in the exact format real system tools use.
`verify_manifest` later recomputes that same checksum fresh from whatever
the file's current content actually is — correctly reporting `OK`
against the untouched file, and correctly, reliably reporting `FAILED`
the moment even one byte anywhere in five million was changed, thanks to
the avalanche effect SHA-256 is built to guarantee.

## What breaks without this

Reverting `compute_checksum` to Lesson 41's whole-file `.read()`
approach doesn't break correctness at all — the digests are
mathematically identical either way, as directly proven earlier in this
lesson. What breaks is memory behavior at scale: the measured `36.8x`
memory difference on a 5 MB test file would become proportionally worse
on a real multi-gigabyte download, potentially exhausting available
memory on a constrained machine for no benefit — a real cost with no
corresponding correctness gain, the opposite of a reasonable trade.

## Definition of done

- [ ] Chunked and whole-file hashing of the same file produce identical
      digests, confirmed directly, not assumed.
- [ ] Chunked hashing's measured peak memory usage stays roughly
      constant regardless of chunk count, while whole-file hashing's
      peak scales with file size.
- [ ] `write_manifest`'s output format matches the real `sha256sum`
      tool's own output format for the same file (two-space separator).
- [ ] `verify_manifest` reports `OK` for an untouched file and `FAILED`
      for the same file after a single byte anywhere in it is changed.
- [ ] `verify_manifest` reports `MISSING`, not `FAILED`, for a file
      listed in the manifest but absent from the directory being
      checked.
- [ ] You can explain, without looking back at this lesson, why this
      lesson's checksum tool should never use Lesson 42's slow,
      PBKDF2-based hashing, in one sentence naming the actual threat
      model difference.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add checksum_tool.py
  git commit -m "Add chunked checksum computation and manifest verification, measured at 36.8x lower peak memory than whole-file hashing, correctly detecting single-byte corruption via the avalanche effect"
  ```

## What's next

Lesson 13's duplicate-file finder, this lesson's integrity checksums, and
Lesson 41's backup verification all now share the identical
`compute_checksum`-shaped core, applied to three different problems —
finding sameness, detecting corruption, and confirming a copy — worth
recognizing as one general technique rather than three separate ones.
Lesson 45's symmetric encryption is the next, and genuinely different,
problem this pattern doesn't solve at all: a checksum proves a file is
unchanged, but does nothing to keep its contents secret from anyone who
can read it in the first place.
