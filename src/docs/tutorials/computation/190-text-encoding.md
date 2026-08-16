# Lesson 190: Text Encoding

- **What you will build** — a demonstration that Clojure characters are
  really just integers underneath, a fixed-width character encoding and
  the concrete reason it can't cover every character in real use, and a
  from-scratch, verified two-byte slice of the real UTF-8 encoding scheme.
  The transferable problem: every value this whole curriculum has printed
  so far has been a number, a list, or a boolean — text has never actually
  been represented at the bit level until now, and doing it honestly means
  answering two separate questions: which integer does a given character
  correspond to, and how does *that* integer get written down in bits
  without wasting space on characters that need very few.
- **What you need to know first** — `decimal->binary`, `binary->decimal`
  (Lesson 184); `pad-to-width`, `drop-leading` (Lesson 187); `max-unsigned`
  (Lesson 187); `cons`, `first`, `rest`, `list` (Section II).
- **Terms introduced in this lesson**
  - **code point** — the specific integer a character-encoding standard
    assigns to one particular character; the number a computer actually
    stores and operates on, with the human-readable glyph only ever a
    display convention layered on top of it.
  - **fixed-width character encoding** — a scheme, like ASCII, that
    spends exactly the same number of bits on every character, no matter
    how common or rare it is.
  - **variable-width encoding** — a scheme that spends fewer bits on
    common, low-numbered code points and more bits on rarer, higher-
    numbered ones, instead of paying a fixed cost for every character.
  - **continuation byte** — in a multi-byte encoded character, one of the
    bytes after the first, marked with a fixed bit prefix that means "this
    byte only makes sense as part of the character that started before
    it," not as a character on its own.
- **Objects and methods used**
  - **`int`**
    - *What it is:* a Clojure core function converting a character (or
      several other numeric-like types) to a plain integer.
    - *Implementation:* documented in Clojure's own core reference; for a
      `Character` argument specifically, it returns that character's
      underlying numeric code point — the exact integer Unicode assigns
      it, not an arbitrary or language-specific value.
    - *Its use:* this lesson's entire starting point — the bridge from "a
      character" to "a number this section's whole toolkit already knows
      how to work with."
  - **`char`**
    - *What it is:* the reverse of `int` — converts a plain integer back
      into the character with that code point.
    - *Implementation:* documented in Clojure's own core reference,
      identical in spirit to a numeric cast back to a character type.
    - *Its use:* confirms, directly and checkably, that `int` and `char`
      are true inverses of each other on the same underlying number.
  - This lesson also reuses `decimal->binary`, `pad-to-width`,
    `drop-leading` (Lesson 184, 187), each already covered.

---

## Concept Unit: Characters as Numbers

### The Problem

Nothing in this curriculum has represented text before now. Before any
encoding scheme can be built, the more basic question has to be settled:
what *is* a character, computationally — is it its own kind of thing, or
is it secretly just a number wearing a costume?

### Introduce the Concept in Isolation

Evaluate a character literal directly:

```clojure
\a
```

Run:

```
user=> \a
\a
```

A character is a real, distinct value — Clojure's reader syntax for one is
a backslash followed by the character itself. Now ask what it actually
*is* underneath, using `int`:

```clojure
(int \a)
```

Run:

```
user=> (int \a)
97
```

`\a` is `97`. Not "represented by," not "converted to" — the character
*is* that integer, as far as any computation is concerned; `97` is its
**code point**. Confirm `char` reverses this exactly:

```clojure
(char 97)
```

Run:

```
user=> (char 97)
\a
```

`(char (int \a))` returns `\a` exactly — `int` and `char` are true
inverses, and the "costume" a character wears is nothing more than how a
terminal or editor chooses to *display* a particular integer.

### Discard the Throwaway Example

`\a` and `97` were only used to prove the general fact. The real project
code below works with `int` and `char` directly on whatever characters an
actual encoding scheme needs, not one fixed example.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from this section's binary representation work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Confirm the same fact holds for a character outside the lowercase-letter
range, since the isolated lab only checked one:

```clojure
(int \space)
```

### The Updated Project

Skipped — no enclosing file exists yet; this is a standalone `bb` REPL
call, not a defined function.

### Mechanical Walkthrough

Enumerating `(int \space)`:

- `\space` — **(a) first appearance**: a *named* character literal —
  Clojure provides names like `\space`, `\newline`, and `\tab` for
  characters that have no single visible glyph of their own to write
  after the backslash.
- `int` — **(c) already basic**, the same function from the isolated lab,
  applied to a new input.

Run it:

```
user=> (int \space)
32
```

The space character's code point is `32` — a specific, checkable integer,
exactly the same kind of fact as `\a` being `97`. Nothing about a
character is special-cased; every one of them is just a number with a
particular display convention attached.

### CS Lens

Assigning each member of a fixed alphabet its own unique integer, so
comparison and arithmetic can operate on it directly, recurs well beyond
text.

```
Also recognized in: the ASCII table itself, the original real-world
instance of exactly this idea; enum-to-integer mappings in virtually
every programming language, which are the same "named thing backed by a
number" pattern generalized past characters; and hash functions, which
routinely convert characters or whole strings to numbers as their very
first step, before any hashing arithmetic can begin
```

### SE Lens

The alternative to a language providing `int` and `char` directly is
having every program hand-build and maintain its own character-to-integer
lookup table — real, tedious, error-prone work that a shared, built-in
mapping exists specifically to avoid. The tradeoff accepted by relying on
one, universal, language-level mapping (ultimately Unicode, underneath
Clojure's own `int`/`char`) is that no individual program gets any say in
how it's defined — every program on the same platform agrees `97` means
`\a`, which is exactly what makes text actually portable between programs
that have never coordinated with each other directly.

---

## Concept Unit: Fixed-Width Encoding and Its Limit

### The Problem

A code point is just an integer — and this section already knows how to
write any integer in binary. The simplest possible text encoding: pick a
fixed number of bits, and store every character's code point in exactly
that many. Does a fixed width actually work for *every* character that
exists?

### Introduce the Concept in Isolation

Skipped — encoding a single integer in a fixed bit width is exactly
`pad-to-width` applied to `decimal->binary`'s own output, both already
lab'd in Lesson 187; nothing syntactic here is new.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: N/A — this unit reuses existing functions on new
  inputs rather than adding any.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Encode `\h`'s code point in a fixed eight bits — one byte, the classic
ASCII-and-onward convention:

```clojure
(pad-to-width (decimal->binary (int \h)) 8)
```

### The Updated Project

Skipped — no enclosing file exists yet; a standalone call at the `bb`
REPL.

### Mechanical Walkthrough

`(int \h)` is `104`; `(decimal->binary 104)` gives `(1 1 0 1 0 0 0)` —
seven digits — and `(pad-to-width ... 8)` adds one leading zero,
`(0 1 1 0 1 0 0 0)`. Every step here is a function already fully verified
in an earlier lesson, applied to a new input; nothing in the composition
itself is new.

Run it:

```
user=> (pad-to-width (decimal->binary (int \h)) 8)
(0 1 1 0 1 0 0 0)
```

Eight bits, one byte, one character — this is exactly how ASCII, and
every fixed-width encoding since, works. But eight bits is `max-unsigned
8`, which Lesson 187's own derivation already proved is `255` — a fixed
eight-bit encoding can represent at most `256` distinct characters, full
stop, no matter how the bits are assigned. Real written language needs
far more than that: Unicode, the real standard virtually every modern
system uses, currently defines well over one hundred thousand characters
— Latin letters, Cyrillic, Han characters, Arabic script, emoji, and
more, all needing their own distinct code point. A single fixed-width
byte cannot hold anywhere close to that many distinct values; a fixed
width large enough to hold all of them (something past seventeen bits)
would spend that same oversized cost on *every* character, including the
plain ASCII letters that make up the overwhelming majority of real text.

### CS Lens

A single, shared fixed-width encoding is a real historical episode, not
just this lesson's own illustration.

```
Also recognized in: ASCII itself, the direct real-world instance,
originally a seven-bit encoding covering only English letters, digits,
and punctuation; the many regional eight-bit "code pages" that existed
before Unicode, each assigning the upper half of the byte range to a
different set of characters depending on the region; and fixed-width
integer types generally (Lesson 187's own word width) — a character
encoding's fixed width is the identical idea, applied to text instead of
numbers
```

### SE Lens

Before Unicode, real systems mostly used exactly this fixed-width
approach — but with dozens of *different*, incompatible code pages, each
assigning the same byte values to different characters depending on
region and vendor. The real, well-documented cost: a document written
under one code page, opened under a different one, silently displayed the
wrong characters entirely — a genuine historical mess, not a hypothetical
one, that motivated Unicode's creation in the first place. The tradeoff
Unicode itself accepted in exchange for one universal mapping: no single
fixed width can honestly cover it, which is exactly why the next unit
builds something that doesn't try to.

---

## Concept Unit: Variable-Width Encoding

### The Problem

The vast majority of real text — this very lesson included — is plain
ASCII: code points under `128`, needing only seven bits. Reserving a
large fixed width for *every* character, just so the rare high-numbered
ones fit, wastes space on the common case to accommodate the exception.
Can an encoding spend few bits on common, low-numbered characters and
more only when a character actually needs it?

### Introduce the Concept in Isolation

Skipped — this unit's real code is itself the concrete demonstration;
every piece it's built from (`decimal->binary`, `pad-to-width`,
`drop-leading`, `cons`) is already lab'd, and the new material is the
scheme's design, not any new syntax.

### Discard the Throwaway Example

Not applicable — same as the previous unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units, though the *scheme* being derived mirrors the real,
  standard UTF-8 encoding's own two-byte case exactly, checked below
  against a real, well-known example.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below the previous unit's calls.
- **Dependencies**: Babashka, already installed.

### The New Code

Splitting a fixed-width digit list needs a way to take the *first* `n`
digits, the missing counterpart to Lesson 187's own `drop-leading`, which
only ever removed them:

```clojure
(defn take-first
  [digits n]
  (if (= n 0)
    (list)
    (cons (first digits) (take-first (rest digits) (- n 1)))))
```

### The Updated Project

A code point from `128` up to `2047` needs eleven bits to hold — split
into five bits and six bits, each half getting its own fixed prefix
marking which byte it is:

```clojure
(defn utf8-two-byte-split
  [bits11]
  (list
    (cons 1 (cons 1 (cons 0 (take-first bits11 5))))
    (cons 1 (cons 0 (drop-leading bits11 5)))))
```

```clojure
(defn utf8-two-byte
  [code-point]
  (utf8-two-byte-split (pad-to-width (decimal->binary code-point) 11)))
```

### Mechanical Walkthrough

Enumerating `take-first`'s body:

- `(= n 0)`, `(list)` — **(c) already basic**; once `n` digits have been
  collected, stop.
- `(cons (first digits) (take-first (rest digits) (- n 1)))` — **(b) a
  hard concept reappearing**: ordinary structural recursion (Section II),
  the direct mirror of `drop-leading`'s own shape — `drop-leading` throws
  away what it counts down through, `take-first` keeps it.

Enumerating `utf8-two-byte-split`'s body:

- `take-first bits11 5`, `drop-leading bits11 5` — **(c) already basic**;
  together they split one eleven-bit list into a five-bit half and a
  six-bit half, with nothing shared or dropped between them.
- `(cons 1 (cons 1 (cons 0 (take-first ...))))` — **(a) first
  appearance**: this specific three-bit prefix, `1 1 0`, is not arithmetic
  — it's a fixed marker meaning "this byte is the *first* byte of a
  two-byte character."
- `(cons 1 (cons 0 (drop-leading ...)))` — **(a) first appearance**: the
  **continuation byte** marker, `1 0` — meaning "this byte only makes
  sense as part of the character that started one byte back."

Trace `utf8-two-byte` on `233` — the real code point for `é`, LATIN SMALL
LETTER E WITH ACUTE, which genuinely needs more than one byte and is a
real, checkable, well-known UTF-8 example:

```
decimal->binary 233 → (1 1 1 0 1 0 0 1)                       [8 digits]
pad-to-width ... 11  → (0 0 0 1 1 1 0 1 0 0 1)                 [11 digits]

take-first  ... 5 → (0 0 0 1 1)          [top 5 bits]
drop-leading ... 5 → (1 0 1 0 0 1)       [bottom 6 bits]

byte 1: cons 1 (cons 1 (cons 0 (0 0 0 1 1))) → (1 1 0 0 0 0 1 1)
byte 2: cons 1 (cons 0 (1 0 1 0 0 1))        → (1 0 1 0 1 0 0 1)
```

`binary->decimal` on those two bytes gives `195` and `169` — `0xC3` and
`0xA9` in hexadecimal, which is exactly `é`'s real, standard, documented
UTF-8 encoding. This lesson's own from-scratch derivation, built from
nothing but this section's own binary-representation toolkit, produces
byte-for-byte the same answer the real standard defines.

A **continuation byte**'s `10` prefix is what makes this scheme
**self-synchronizing**: a program reading raw bytes can tell, from any
single byte alone, whether it's looking at an ordinary one-byte
character (leading bit `0`), the start of a multi-byte character
(leading bits `110`, `1110`, or `1110`, one `1` per additional byte), or
a continuation byte in the middle of one (leading bits `10`) — without
ever having to scan backward to find where the character started. A
full implementation needs the three-byte and four-byte cases too — each
follows the identical shape, one more continuation byte and one more
leading `1` in the first byte's marker for every additional byte needed —
but deriving and verifying the two-byte case concretely, as this unit
does, already demonstrates the scheme's real mechanism in full; the wider
cases scale the same pattern rather than introducing a new one.

### CS Lens

A fixed prefix marking what kind of byte comes next, letting a reader
find boundaries without scanning from the start, is not unique to text
encoding.

```
Also recognized in: Huffman coding's prefix-free codes, which guarantee
no complete code word is ever the prefix of another, for exactly the
same reason — unambiguous boundaries; length- or marker-prefixed fields
in binary file formats and network protocols generally, telling a parser
how much more to read next; and UTF-8's own real, documented adoption as
the dominant encoding of the modern web, specifically credited to this
self-synchronizing property
```

### SE Lens

Real, actually-used alternatives exist: UTF-16 and UTF-32 encode every
character using fixed two-byte or four-byte units instead of a variable
one-to-four-byte scheme. A fixed width makes indexing trivial — "the
fifth character" is just "the twentieth byte" under UTF-32 — at the real
cost of quadrupling the storage of plain ASCII text, which is the
overwhelming majority of real-world text, this lesson's own source
included. UTF-8, built here, stays byte-for-byte identical to plain ASCII
for every character under `128` and only pays extra bytes for the
characters that actually need them, at the real cost this unit's own
`utf8-two-byte` demonstrates: finding where a given character starts
takes real work, not a single multiplication. Both are genuine, currently
used engineering choices, not a solved-versus-unsolved question — which
one a real system picks still depends on whether raw indexing speed or
storage compactness matters more for that system.

---

## Connect the Pieces

Follow `é`, code point `233`, from a character to a real, checkable byte
pair. `(int \h)` in the first unit already proved a character is nothing
but an integer; the same fact holds for `233` even though it has no
short, single-character Clojure literal used directly in this lesson.
`(decimal->binary 233)` — Lesson 184's own function, unmodified — gives
`(1 1 1 0 1 0 0 1)`. `(pad-to-width ... 11)` — Lesson 187's own function,
also unmodified — extends it to eleven bits. `take-first` and
`drop-leading` split those eleven bits into a five-bit and a six-bit
half, and `utf8-two-byte-split` wraps each half in its own fixed marker —
`110` for the first byte, `10` for the second. The result, `195` and
`169`, is `0xC3 0xA9` — the real, standard, verifiable UTF-8 encoding of
`é`, produced by a chain that started with `decimal->binary` all the way
back in Lesson 184 and never once needed a function built outside this
section's own toolkit.

## What Breaks Without This

`utf8-two-byte` never checks whether its input actually *needs* two
bytes — call it on a code point well within the one-byte range instead,
like `5`:

```clojure
(utf8-two-byte 5)
```

Trace it: `(decimal->binary 5)` is `(1 0 1)`; `(pad-to-width ... 11)`
gives `(0 0 0 0 0 0 0 0 1 0 1)`; splitting gives top five bits `(0 0 0 0
0)` and bottom six bits `(0 0 0 1 0 1)`. The two resulting bytes are
`(1 1 0 0 0 0 0 0)` and `(1 0 0 0 0 1 0 1)` — `195`'s cousin `0xC0` and
`0x85`. Decoding those two bytes back — stripping the `110` and `10`
markers and reassembling the eleven payload bits — correctly recovers
`5`. Nothing crashes, and the round trip even works. The real problem is
that `5` should never have been encoded as two bytes to begin with — its
correct, standard encoding is one plain byte, `00000101`. This is called
an **overlong encoding**, and it is a real, historically significant
class of bug: any code checking raw incoming bytes for a specific ASCII
character (a `/` in a file path, say, guarding against directory
traversal) by comparing against its one-byte form would miss an
overlong-encoded version of the exact same character entirely, letting a
disallowed value slip through a check that looked complete. Real UTF-8
decoders exist specifically to reject overlong encodings outright, even
though — as this exact trace shows — they decode to a perfectly valid
number if naively accepted. This lesson's own `utf8-two-byte` has no such
check; restoring one would mean confirming a code point is actually
`>= 128` before ever calling it, not trusting every input blindly.

## Exercises

1. Trace `(pad-to-width (decimal->binary (int \A)) 8)` by hand, the same
   way this lesson traced `\h`, and state the resulting byte in both
   binary and, using Lesson 184's own `binary->decimal`, decimal.
2. `utf8-two-byte` handles code points from `128` to `2047`. Sketch, in
   prose, what would have to change for code points `2048` and up — how
   many total bits would eleven need to become, and how many continuation
   bytes would a three-byte marker (`1110xxxx`) need to carry them? No
   code required yet.
3. Using `utf8-two-byte`, encode code point `128` — the smallest value
   that genuinely needs two bytes — by hand, and confirm the resulting
   first byte still starts with the `110` marker even though five of its
   eight bits end up `0`.

## Definition of Done

- [ ] `(int \a)`, `(char 97)`, and `(int \space)` are run (or hand-traced,
      if `bb` is unavailable) and confirmed against this lesson's stated
      values.
- [ ] The eight-bit fixed-width encoding of `\h` is traced by hand,
      matching `(0 1 1 0 1 0 0 0)`.
- [ ] `take-first`, `utf8-two-byte-split`, and `utf8-two-byte` are written
      and hand-traced for code point `233`, matching bytes `195` and
      `169` (`0xC3 0xA9`).
- [ ] The overlong-encoding demonstration in "What Breaks Without This" is
      understood well enough to explain, without notes, why
      `(utf8-two-byte 5)` produces a valid-looking but genuinely incorrect
      result.
- [ ] Commit with a message explaining *why* UTF-8's continuation-byte
      prefix matters for finding character boundaries, not just *what*
      functions were added.
